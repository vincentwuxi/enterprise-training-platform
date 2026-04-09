import { useState } from 'react';
import './LessonCommon.css';

const EVAL_BENCHMARKS = [
  { name: 'MMLU', type: '知识理解', lang: '英文', desc: '57个学科知识问答，4选1', cmd: 'lm_eval --tasks mmlu' },
  { name: 'C-Eval', type: '中文知识', lang: '中文', desc: '52个中文学科，覆盖高考/考研', cmd: 'lm_eval --tasks ceval' },
  { name: 'HumanEval', type: '代码能力', lang: '英文', desc: 'Python 函数生成，单测验证', cmd: 'lm_eval --tasks humaneval' },
  { name: 'GSM8K', type: '数学推理', lang: '英文', desc: '小学数学应用题，链式推理', cmd: 'lm_eval --tasks gsm8k' },
  { name: 'MT-Bench', type: '多轮对话', lang: '英文', desc: 'GPT-4 评判的多轮对话质量', cmd: 'python gen_api_answer.py' },
  { name: '自定义域测', type: '领域专属', lang: '自定义', desc: '针对你的垂直领域构建评估集', cmd: 'python eval_domain.py' },
];

const QUANT_COMPARE = [
  { name: 'bf16 (原始)', size: '14GB', ppl: '基准 1.0x', speed: '1.0x', quality: 100, use: '训练/高精度推理' },
  { name: 'Q8_0 (8-bit)', size: '7.7GB', ppl: '1.001x', speed: '1.3x', quality: 99, use: '质量≈原始，速度略提' },
  { name: 'Q6_K (6-bit)', size: '6.0GB', ppl: '1.005x', speed: '1.4x', quality: 97, use: '接近无损的最佳量化' },
  { name: 'Q5_K_M (5-bit)', size: '4.8GB', ppl: '1.01x', speed: '1.6x', quality: 95, use: '推荐：质量/大小/速度均衡' },
  { name: 'Q4_K_M (4-bit)', size: '4.1GB', ppl: '1.02x', speed: '1.9x', quality: 91, use: '常用：消费级显卡推理' },
  { name: 'Q3_K_M (3-bit)', size: '3.3GB', ppl: '1.08x', speed: '2.1x', quality: 83, use: '极限压缩，质量损失明显' },
  { name: 'Q2_K (2-bit)', size: '2.8GB', ppl: '1.25x', speed: '2.3x', quality: 67, use: '实验性，不推荐生产使用' },
];

export default function LessonEval() {
  const [benchTab, setBenchTab] = useState(0);
  const [quantSel, setQuantSel] = useState(3);

  return (
    <div className="ft-lesson">
      <div className="ft-container">

        <div className="ft-hero">
          <div className="ft-badge">模块六 · Evaluation & Debugging</div>
          <h1>模型评估 & 调试诊断</h1>
          <p>微调完成只是一半——如何知道模型变好了？评估框架搭建、领域评估集构建、幻觉检测、量化质量损失分析：让每次迭代都有数据依据。</p>
        </div>

        <div className="ft-metrics">
          {[{ v: 'LM-Eval', l: '标准评估框架' }, { v: 'ppl', l: '困惑度=质量指标' }, { v: 'ROUGE', l: '文本相似度' }, { v: '人工抽查', l: '最终质量把关' }].map(m => (
            <div key={m.l} className="ft-metric-card"><div className="ft-metric-value">{m.v}</div><div className="ft-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* LM Eval Harness */}
        <div className="ft-section">
          <h2>📊 LM-Evaluation-Harness 实战</h2>
          <div className="ft-code">{`# 安装
pip install lm-eval

# ━━━━ 运行标准 Benchmark ━━━━
# 评估 MMLU（知识理解）
lm_eval --model hf \\
        --model_args pretrained=./merged_model \\
        --tasks mmlu \\
        --num_fewshot 5 \\
        --batch_size 4 \\
        --output_path results/mmlu

# 评估中文能力（C-Eval）
lm_eval --model hf \\
        --model_args pretrained=./merged_model,dtype=bfloat16 \\
        --tasks ceval-valid \\
        --num_fewshot 0 \\
        --batch_size 4

# 评估代码能力（HumanEval）
lm_eval --model hf \\
        --model_args pretrained=./merged_model \\
        --tasks humaneval \\
        --num_fewshot 0 \\
        --allow_code_execution   # 执行生成的代码验证正确性

# ━━━━ 对比微调前后 ━━━━
# 在基础模型和微调模型上分别运行，用 lm_eval compare 对比
lm_eval --model hf \\
        --model_args pretrained=Qwen/Qwen2.5-7B-Instruct \\
        --tasks ceval-valid --output_path results/baseline

# 分析变化：
python -c "
import json
base = json.load(open('results/baseline/results.json'))
ft   = json.load(open('results/mmlu/results.json'))
for task in base['results']:
    diff = ft['results'][task]['acc'] - base['results'][task]['acc']
    print(f'{task}: {diff:+.3f}')
"`}</div>

          <div className="ft-tabs" style={{ marginTop: '1.25rem' }}>
            {EVAL_BENCHMARKS.map((b, i) => <button key={i} className={`ft-tab${benchTab === i ? ' active' : ''}`} onClick={() => setBenchTab(i)}>{b.name}</button>)}
          </div>
          {(() => {
            const b = EVAL_BENCHMARKS[benchTab];
            return (
              <div className="ft-card" style={{ borderColor: 'var(--ft-primary)', marginTop: '.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                  <span style={{ fontWeight: 700 }}>{b.name}</span>
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    <span className="ft-tag blue">{b.type}</span>
                    <span className="ft-tag">{b.lang}</span>
                  </div>
                </div>
                <div className="ft-card-body" style={{ marginBottom: '.5rem' }}>{b.desc}</div>
                <div className="ft-ic" style={{ fontSize: '.8rem' }}>{b.cmd}</div>
              </div>
            );
          })()}
        </div>

        {/* Domain Eval */}
        <div className="ft-section">
          <h2>🎯 构建领域专属评估集</h2>
          <div className="ft-code">{`# 为你的垂直领域构建评估集（比通用benchmark更重要！）

import json
from transformers import pipeline

# 评估集格式：选择题（最容易自动化）
domain_eval = [
    {
        "question": "急性心肌梗死的首选治疗方法是？",
        "choices": ["溶栓治疗", "PCI介入手术", "保守治疗", "药物溶栓"],
        "answer": 1,    # 正确答案索引
        "category": "心血管"
    },
    # ... 200-500 条垂直领域问题
]

def eval_domain(model_path: str, eval_data: list) -> dict:
    pipe = pipeline("text-generation", model=model_path)
    correct = 0
    by_category = {}
    
    for item in eval_data:
        choices_str = "\\n".join([f"{i}. {c}" for i, c in enumerate(item["choices"])])
        prompt = f"问题：{item['question']}\\n选项：\\n{choices_str}\\n答案是第几个选项？只输出数字："
        
        output = pipe(prompt, max_new_tokens=5)[0]["generated_text"]
        pred = int(output[-1]) if output[-1].isdigit() else -1
        
        if pred == item["answer"]:
            correct += 1
        cat = item.get("category", "未分类")
        by_category.setdefault(cat, {"right": 0, "total": 0})
        by_category[cat]["total"] += 1
        if pred == item["answer"]:
            by_category[cat]["right"] += 1
    
    return {
        "overall_acc": correct / len(eval_data),
        "by_category": {k: v["right"]/v["total"] for k, v in by_category.items()}
    }

# 运行并对比前后
before = eval_domain("base_model", domain_eval)
after  = eval_domain("finetuned_model", domain_eval)
print(f"领域准确率：{before['overall_acc']:.2%} → {after['overall_acc']:.2%}")`}</div>
        </div>

        {/* GGUF Quantization Quality */}
        <div className="ft-section">
          <h2>📉 量化质量损失分析（GGUF 各精度对比）</h2>
          <p style={{ color: 'var(--ft-muted)', fontSize: '.88rem', marginBottom: '1rem' }}>
            点击各量化精度，查看质量保留率、文件大小和推理速度对比（以 7B 模型为例）：
          </p>
          <div className="ft-tabs">
            {QUANT_COMPARE.map((q, i) => <button key={i} className={`ft-tab${quantSel === i ? ' active' : ''}`} onClick={() => setQuantSel(i)}>{q.name.split(' ')[0]}</button>)}
          </div>
          {(() => {
            const q = QUANT_COMPARE[quantSel];
            return (
              <div className="ft-card" style={{ borderColor: q.quality > 95 ? 'var(--ft-green)' : q.quality > 85 ? 'var(--ft-primary)' : 'var(--ft-rose)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{q.name}</div>
                  <span className="ft-tag green">{q.size}</span>
                </div>
                {[['质量保留率', q.quality, '%'], ['推理速度提升', Math.round((parseFloat(q.speed) - 1) * 100), '%']].map(([label, val, unit]) => (
                  <div key={label} className="ft-bar-row">
                    <span className="ft-bar-label">{label}</span>
                    <div className="ft-bar-track"><div className="ft-bar-fill" style={{ width: `${val}%`, background: val > 90 ? 'linear-gradient(90deg,#059669,#34d399)' : val > 75 ? 'linear-gradient(90deg,var(--ft-primary-dk),var(--ft-accent))' : 'linear-gradient(90deg,#be123c,#fb7185)' }} /></div>
                    <span className="ft-bar-val">{val}{unit}</span>
                  </div>
                ))}
                <div className="ft-tip" style={{ marginTop: '.75rem', marginBottom: 0 }}>🎯 <span><strong>推荐用途：</strong>{q.use}</span></div>
              </div>
            );
          })()}
          <div className="ft-tip" style={{ marginTop: '1rem' }}>💡 <span><strong>生产推荐：Q5_K_M</strong> — 在质量损失 &lt;2% 的前提下，文件大小降至 1/3，是消费级显卡生产部署的最佳选择。Q4_K_M 次之，大多数场景感知不到差异。</span></div>
        </div>

        {/* Hallucination Detection */}
        <div className="ft-section">
          <h2>🌫️ 幻觉检测与缓解</h2>
          <div className="ft-code">{`# 幻觉检测方法：一致性检验（Self-Consistency）
def detect_hallucination(model, question: str, n_samples: int = 5):
    """
    对同一问题采样多次，不一致的事实性声明可能是幻觉
    """
    responses = [model(question, temperature=0.7) for _ in range(n_samples)]
    
    # 提取所有事实性声明
    all_facts = extract_facts(responses)  # 用 NLP/AI 提取
    
    # 统计每个事实的一致性
    inconsistent = [
        fact for fact, count in Counter(all_facts).items()
        if count / n_samples < 0.6   # 超过 40% 的回答不包含该事实 → 可能幻觉
    ]
    
    return {"hallucination_risk": inconsistent, "responses": responses}

# 缓解幻觉的微调技巧：
# 1. 在训练数据中加入"不确定时说不确定"的示例
uncertain_examples = [
    {"instruction": "2024年诺贝尔经济学奖得主是谁？",
     "output": "根据我的训练数据（截止2024年初），我无法确认当年诺贝尔经济学奖的得主。建议查阅 nobelprize.org 获取最新信息。"},
]
# 2. RAG + 微调结合：微调负责风格，RAG 负责事实
# 3. 在 System Prompt 中明确"不知道的事情要说不知道"`}</div>
        </div>

      </div>
    </div>
  );
}
