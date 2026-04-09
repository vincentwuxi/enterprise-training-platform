import { useState } from 'react';
import './LessonCommon.css';

const ALPACA_EX = `# Alpaca 格式（JSONL，每行一条）
# {"instruction": "将以下中文翻译成英文", "input": "人工智能正在改变世界", "output": "..."}
# {"instruction": "解释什么是 LoRA 微调", "input": "", "output": "LoRA（低秩适应）..."}
# {"instruction": "写一首关于秋天的五言绝句", "input": "", "output": "秋风吹落叶..."}

# Prompt 模板（TRL SFTTrainer 自动格式化）
ALPACA_TEMPLATE = (
    "Below is an instruction that describes a task.\\n"
    "Write a response that appropriately completes the request.\\n\\n"
    "### Instruction:\\n{instruction}\\n\\n"
    "### Input:\\n{input}\\n\\n"
    "### Response:\\n{output}"
)

# 注意事项：
# 1. input 字段可以为空字符串（无上下文任务）
# 2. output 不能以 EOS token 结尾（TRL 会自动处理）
# 3. 建议 instruction 多样化，避免模板化`;

const SHAREGPT_EX = `# ShareGPT 格式（支持多轮对话）
{
  "conversations": [
    {"from": "human", "value": "能帮我分析一下这份代码的性能问题吗？"},
    {"from": "gpt", "value": "我来分析这段代码的性能问题：\\n\\n**主要问题**：\\n1. list.append() 频繁内存重分配\\n\\n**优化方案**：\\n# 列表推导式（2x）\\nresult = [i * i for i in range(n)]\\n# numpy（30x）\\nresult = np.arange(n) ** 2"},
    {"from": "human", "value": "numpy 版本快多少？"},
    {"from": "gpt", "value": "以 n=1,000,000：原始~150ms / 列表推导~80ms(2x) / numpy~5ms(30x)"}
  ]
}

# 角色映射（不同框架不同）
# LLaMA Factory：human→user，gpt→assistant
ROLE_MAP = {"human": "user", "gpt": "assistant", "system": "system"}`;

const DPO_EX = `# DPO 训练数据格式（chosen vs rejected）
{
  "prompt": "如何提高代码的可读性？",
  "chosen": "提高代码可读性的核心原则：\\n\\n1. 有意义的命名：变量名要表达意图（user_count 而非 uc）\\n2. 单一职责：每个函数只做一件事\\n3. 减少嵌套：早返回（Early Return）避免深层嵌套\\n4. 添加类型注解\\n5. 写文档字符串：说明参数含义和返回值",
  "rejected": "要提高代码可读性，你可以给变量取好名字，加注释，缩短函数，遵循代码规范等等。"
}

# 好的 DPO 数据特征：
# chosen：详细、结构化、有例子、有洞察
# rejected：模糊、泛泛、缺乏深度（但不能是错的！）
# prompt：真实用户问题，多样化

# 数据收集策略：
# 1. 人工标注（最高质量，最贵）
# 2. GPT-4 vs GPT-3.5（用强模型评估弱模型输出）
# 3. 现有数据集：HH-RLHF, OpenAssistant, UltraFeedback`;

const SYNTHETIC_EX = `# 用 GPT-4 生成领域微调数据
from openai import OpenAI
import json

client = OpenAI()

GENERATION_PROMPT = (
    "你是一位{domain}专家。请生成{n}条高质量的指令微调数据，JSON 数组格式：\\n"
    '[  {{"instruction": "...", "input": "...", "output": "..."}}  ]\\n'
    "要求：\\n- instruction 多样，涵盖不同任务类型（解释/分析/生成/总结）\\n"
    "- output 专业、详细、有实际参考价值\\n"
    "- 难度分布合理（简单/中等/困难各占 1/3）"
)

def generate_domain_data(domain: str, n: int = 20) -> list:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": GENERATION_PROMPT.format(domain=domain, n=n)}],
        response_format={"type": "json_object"},
        temperature=0.8,  # 适当增加多样性
    )
    data = json.loads(response.choices[0].message.content)
    return data.get("items", [])

# 数据质量过滤（关键！）
def filter_quality(samples: list) -> list:
    filtered = []
    for s in samples:
        if len(s["output"]) < 50:   # 太短通常质量差
            continue
        # 用 Embedding 相似度去重（余弦相似度 > 0.85 则丢弃）
        filtered.append(s)
    return filtered

# 数据配比原则：
# 垂直领域数据 : 通用数据 = 7:3（防止灾难性遗忘）
# 通用指令数据推荐：Alpaca-cleaned, WizardLM, Orca`;

const FORMATS = [
  { key: 'alpaca',    name: 'Alpaca 格式',    icon: '🦙', desc: '最通用的指令微调格式。适合单轮问答、指令执行任务。', example: ALPACA_EX },
  { key: 'sharegpt',  name: 'ShareGPT 格式',  icon: '💬', desc: '多轮对话格式，适合微调对话能力。LLaMA Factory、Unsloth 原生支持。', example: SHAREGPT_EX },
  { key: 'dpo',       name: 'DPO/RLHF 格式',  icon: '🎯', desc: '偏好对齐数据格式。每条包含同一问题的"好"和"坏"两个回答。', example: DPO_EX },
  { key: 'synthetic', name: '合成数据生成',    icon: '🤖', desc: '用 GPT-4 / Claude 自动生成高质量训练数据，解决数据稀缺问题。', example: SYNTHETIC_EX },
];

export default function LessonData() {
  const [fmt, setFmt] = useState('alpaca');
  const f = FORMATS.find(x => x.key === fmt) ?? {};

  return (
    <div className="ft-lesson">
      <div className="ft-hero">
        <div className="ft-badge">// MODULE 04 · DATA ENGINEERING</div>
        <h1>数据工程</h1>
        <p>微调效果的上限由数据质量决定。<strong>"Garbage in, garbage out"在 LLM 微调中尤为致命</strong>——1000 条高质量数据，胜过 100 万条低质量数据。本模块覆盖四种主流数据格式与合成数据生成。</p>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">📄 四种数据格式详解</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {FORMATS.map(ft => (
            <button key={ft.key} className={`ft-btn ${fmt === ft.key ? 'active' : ''}`} onClick={() => setFmt(ft.key)}>
              {ft.icon} {ft.name}
            </button>
          ))}
        </div>
        <div className="ft-card" style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{f.icon} {f.name}</div>
          <div style={{ color: 'var(--ft-muted)', fontSize: '0.87rem' }}>{f.desc}</div>
        </div>
        <div className="ft-code-wrap">
          <div className="ft-code-head">
            <div className="ft-code-dot" style={{ background: '#ef4444' }} />
            <div className="ft-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ft-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{fmt}_format.py</span>
          </div>
          <div className="ft-code">{f.example}</div>
        </div>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">✅ 数据质量黄金标准</div>
        <div className="ft-grid-2">
          {[
            { title: '数量参考', icon: '📊', items: ['风格/格式调整：500-2000 条', '领域知识注入：2000-10000 条', '能力训练（推理/代码）：10000+ 条', 'DPO 偏好对齐：1000-5000 对'], color: '#e11d48' },
            { title: '质量 Checklist', icon: '✅', items: ['output 平均长度 > 100 token', '任务类型多样（不能全是 QA）', '无重复（余弦相似度 < 0.85）', '无有害/错误内容（人工抽查 5%）'], color: '#6366f1' },
            { title: '数据清洗', icon: '🧹', items: ['删除长度异常（太长/太短）', '去重（MinHash 或 Embedding）', '语言检测（过滤混语数据）', '毒化内容过滤（Perspective API）'], color: '#10b981' },
            { title: '数据配比', icon: '⚖️', items: ['垂直数据 : 通用指令 = 7:3', '防灾难性遗忘：混入 10% 通用', 'DPO：chosen/rejected 不能距离太近', '合成数据：最多占 50%'], color: '#f59e0b' },
          ].map((c, i) => (
            <div key={i} className="ft-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: c.color, marginBottom: '0.75rem' }}>{c.icon} {c.title}</div>
              {c.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.84rem', color: 'var(--ft-muted)' }}>
                  <span style={{ color: c.color, flexShrink: 0 }}>→</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="ft-warn">
          ⚠️ <strong>灾难性遗忘</strong>：纯领域数据微调后，模型原有通用能力（数学/推理/代码）可能严重退化。解决方案：在训练数据中混入 10-30% 的通用指令数据（如 Alpaca-cleaned）。
        </div>
      </div>
    </div>
  );
}
