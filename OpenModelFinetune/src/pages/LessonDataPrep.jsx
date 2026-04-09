import { useState } from 'react';
import './LessonCommon.css';

const DATA_FORMATS = [
  {
    key: 'alpaca', name: 'Alpaca 格式', usage: '单轮指令',
    example: `{
  "instruction": "将下面的句子翻译成英文",
  "input": "今天天气真好",
  "output": "The weather is really nice today."
}

# instruction: 任务描述（必填）
# input: 补充上下文（可为空 ""）
# output: 期望输出（必填）
# 最简单通用，适合：分类、提取、翻译、生成`,
    tools: ['Alpaca-cleaned', '自定义生成', 'GPT-4 合成'],
  },
  {
    key: 'sharegpt', name: 'ShareGPT 格式', usage: '多轮对话',
    example: '{\n  "conversations": [\n    {"from": "human", "value": "你好，帮我写一段 Python 排序代码"},\n    {"from": "gpt",   "value": "好的！以下是常见的排序实现：\\n  # 冒泡排序\\n  def bubble_sort(arr):\\n    n = len(arr)\\n    for i in range(n): ..."},\n    {"from": "human", "value": "能加上时间复杂度的注释吗？"},\n    {"from": "gpt",   "value": "当然！O(n²) 的注释版本..."}\n  ]\n}\n\n# 支持多轮对话，保留上下文\n# from 值：human / gpt / system\n# 适合：对话系统、AI 助手、客服机器人',
    tools: ['ShareGPT 数据集', 'WizardLM', '自定义对话'],
  },
  {
    key: 'chatml', name: 'ChatML 格式', usage: '系统提示词',
    example: `<|im_start|>system
你是一位专业的 Python 编程助手，代码简洁、注释清晰。
<|im_end|>
<|im_start|>user
实现一个二分搜索函数
<|im_end|>
<|im_start|>assistant
def binary_search(arr, target):
    """
    二分搜索 - 时间复杂度 O(log n)
    """
    left, right = 0, len(arr) - 1
    ...
<|im_end|>

# 包含 system 角色，支持角色定制
# Qwen/ChatGLM/Mistral 等模型原生格式`,
    tools: ['Unsloth', 'LLaMA-Factory', 'TRL'],
  },
  {
    key: 'dpo', name: 'DPO Preference 格式', usage: '偏好对齐',
    example: `{
  "prompt": "解释量子纠缠",
  "chosen": "量子纠缠是量子力学中两个粒子形成的关联状态...
             [准确、清晰、有例子的好回答]",
  "rejected": "量子纠缠就是两个东西连在一起...
               [不准确、过于简化的坏回答]"
}

# chosen：人类认为更好的回答
# rejected：人类认为较差的回答
# 用于 DPO/ORPO 偏好学习训练
# 数据构建：GPT-4 生成多个答案 → 人工/AI排序`,
    tools: ['Anthropic HH', 'UltraFeedback', '人工标注'],
  },
];

const CLEANING_STEPS = [
  { step: '去重', desc: '精确去重 + 近似去重（MinHash/SimHash），避免模型记忆重复数据导致过拟合', code: `from datasets import load_dataset
from datasketch import MinHash, MinHashLSH

def dedup_dataset(dataset, threshold=0.85):
    """近似去重，threshold=相似度阈值"""
    lsh = MinHashLSH(threshold=threshold, num_perm=64)
    keep_ids = []
    for i, example in enumerate(dataset):
        m = MinHash(num_perm=64)
        for word in example['output'].split():
            m.update(word.encode())
        key = str(i)
        if not lsh.query(m):      # 没有近似重复
            lsh.insert(key, m)
            keep_ids.append(i)
    return dataset.select(keep_ids)` },
  { step: '质量过滤', desc: '过滤长度异常、语言混乱、特殊字符过多的低质量样本', code: `def is_quality(example, min_len=20, max_len=2048):
    output = example.get('output', '')
    
    # 长度过滤
    if not (min_len <= len(output) <= max_len):
        return False
    
    # 中文任务：确保输出是中文
    chinese_ratio = sum(1 for c in output if '\\u4e00' <= c <= '\\u9fff') / len(output)
    if chinese_ratio < 0.2:          # 中文比例过低
        return False
    
    # 过滤重复字符（如 "哈哈哈哈哈哈哈哈哈"）
    if len(set(output)) / len(output) < 0.1:
        return False
    
    return True

clean = dataset.filter(is_quality)` },
  { step: 'AI 质量评分', desc: '用 GPT-4/Claude 对每条数据打分（1-5分），只保留高质量数据', code: `import openai

def score_quality(instruction, output, model="gpt-4o-mini"):
    """用 AI 评估训练数据质量"""
    prompt = f"""请评估以下指令-输出对的质量（1-5分）：

指令：{instruction}
输出：{output}

评估维度：
- 准确性（内容是否正确）
- 相关性（输出是否回答了指令）
- 完整性（是否足够详细）
- 流畅性（语言是否自然）

只输出 JSON：{{"score": X, "reason": "..."}}"""
    
    resp = openai.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)

# 只保留评分 >= 4 的数据
filtered = [d for d in dataset if score_quality(**d)["score"] >= 4]` },
  { step: '数据增强', desc: '用强模型扩充数据量，从 200 条种子扩展到 2000 条', code: `# Self-Instruct：让 GPT-4 生成更多类似指令-输出对
def augment_dataset(seed_examples: list, target_count: int):
    """
    从种子数据生成新的训练数据
    Self-Instruct / Evol-Instruct 策略
    """
    augmented = []
    
    for _ in range(target_count // len(seed_examples)):
        sample = random.choice(seed_examples)
        
        prompt = f"""基于下面的示例，生成一个新的、不同的指令-输出对：

示例指令：{sample['instruction']}
示例输出：{sample['output']}

要求：
1. 指令要有变化（换话题、换难度、换视角）
2. 输出要高质量、准确
3. 输出 JSON：{{"instruction": "...", "output": "..."}}"""
        
        result = call_gpt4(prompt)
        augmented.append(json.loads(result))
    
    return seed_examples + augmented` },
];

export default function LessonDataPrep() {
  const [fmt, setFmt] = useState('alpaca');
  const [step, setStep] = useState(0);
  const f = DATA_FORMATS.find(x => x.key === fmt);

  return (
    <div className="ft-lesson">
      <div className="ft-container">

        <div className="ft-hero">
          <div className="ft-badge">模块二 · Data Engineering</div>
          <h1>数据集设计与工程化准备</h1>
          <p>"Garbage in, garbage out"——微调质量 80% 取决于数据质量。掌握四种数据格式、工程化清洗流程和 AI 辅助数据增强，打造高质量训练数据集。</p>
        </div>

        <div className="ft-metrics">
          {[{ v: '500+', l: '最少起步条数' }, { v: '4种', l: '主流数据格式' }, { v: 'AI合成', l: '数据增强利器' }, { v: '去重', l: '首要清洗步骤' }].map(m => (
            <div key={m.l} className="ft-metric-card"><div className="ft-metric-value">{m.v}</div><div className="ft-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Data Format */}
        <div className="ft-section">
          <h2>📋 四种主流数据格式</h2>
          <div className="ft-tabs">
            {DATA_FORMATS.map(x => (
              <button key={x.key} className={`ft-tab${fmt === x.key ? ' active' : ''}`} onClick={() => setFmt(x.key)}>
                {x.name.split(' ')[0]}
              </button>
            ))}
          </div>
          {f && (
            <div>
              <div style={{ display: 'flex', gap: '.5rem', marginBottom: '0.75rem' }}>
                <span className="ft-tag">{f.usage}</span>
                {f.tools.map((t, i) => <span key={i} className="ft-tag blue">{t}</span>)}
              </div>
              <div className="ft-code">{f.example}</div>
            </div>
          )}
        </div>

        {/* Data Pipeline */}
        <div className="ft-section">
          <h2>🔧 数据工程化 Pipeline（4步清洗法）</h2>
          <div className="ft-tabs">
            {CLEANING_STEPS.map((s, i) => <button key={i} className={`ft-tab${step === i ? ' active' : ''}`} onClick={() => setStep(i)}>Step {i + 1}: {s.step}</button>)}
          </div>
          <p style={{ color: 'var(--ft-muted)', fontSize: '.88rem', marginBottom: '0.75rem' }}>{CLEANING_STEPS[step].desc}</p>
          <div className="ft-code">{CLEANING_STEPS[step].code}</div>
        </div>

        {/* Dataset Size Guide */}
        <div className="ft-section">
          <h2>📊 训练数据量指南</h2>
          <div className="ft-table-wrap">
            <table className="ft-table">
              <thead><tr><th>数据量</th><th>效果预期</th><th>策略</th><th>典型用途</th></tr></thead>
              <tbody>
                {[
                  ['< 100条', '效果不稳定', '先用 GPT-4 扩充到 500+', '不推荐直接微调'],
                  ['500-1000条', '可以感知风格变化', '高质量 > 数量', '工具调用、特定格式'],
                  ['1000-5000条', '较好的垂直能力', 'Self-Instruct 增强', '领域问答、客服场景'],
                  ['5000-20000条', '接近专家水平', '多样性很重要', '垂直领域专家模型'],
                  ['20000+条', '极强领域能力', '数据质量把关', '继续预训练/领域预训练'],
                ].map(([size, effect, strategy, use], i) => (
                  <tr key={i}>
                    <td><span className="ft-tag" style={{ fontFamily: 'JetBrains Mono,monospace' }}>{size}</span></td>
                    <td style={{ fontSize: '.85rem' }}>{effect}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--ft-muted)' }}>{strategy}</td>
                    <td style={{ fontSize: '.82rem' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ft-tip">💡 <span><strong>核心原则：100条高质量数据胜过 1000条低质量数据。</strong>宁可用 GPT-4 花 $20 合成 500条精良数据，也不要用网上爬取的 5000条噪声数据微调。</span></div>
        </div>

        {/* Cost Estimate */}
        <div className="ft-section">
          <h2>💰 数据合成成本估算（GPT-4o-mini）</h2>
          <div className="ft-code">{`# GPT-4o-mini 价格：$0.15/百万 input tokens，$0.6/百万 output tokens
# 估算：合成一条高质量训练数据约需 1000 tokens (in+out)

数量     预估成本      时间（批量API）
-----------------------------------------
500条    ~$0.40        ~10 分钟
2000条   ~$1.60        ~40 分钟
5000条   ~$4.00        ~2 小时
10000条  ~$8.00        ~4 小时

# 实战建议：
# 1. 先人工写 20-50 条高质量种子数据
# 2. 用 GPT-4o-mini 扩充（便宜但质量够用）
# 3. 用 GPT-4o 对 10% 数据做抽检打分
# 4. 过滤分数 < 3.5 的数据（通常 5-15%）
# 5. 剩余数据即可用于 SFT 微调`}</div>
        </div>

      </div>
    </div>
  );
}
