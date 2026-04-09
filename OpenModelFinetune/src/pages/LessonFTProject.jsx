import { useState } from 'react';
import './LessonCommon.css';

const PROJECT_PHASES = [
  {
    phase: 'Day 1-2', title: '领域选择 & 数据规划',
    tasks: [
      '选择一个你熟悉的垂直领域（医疗/法律/编程/金融/教育）',
      '分析该领域的核心任务：问答？格式转换？代码生成？',
      '搜集或设计 50 条高质量种子数据（人工精心制作）',
      '用 GPT-4o-mini 将种子数据扩充到 1000-2000 条',
    ],
    code: `# Day 1-2: 数据合成脚本
import openai, json, random

client = openai.OpenAI()

# 你的种子数据（50条精心制作）
SEED_DATA = [
    {"instruction": "分析以下合同条款的风险点", 
     "input": "[合同条款示例]", 
     "output": "主要风险点：1. 违约责任条款模糊..."},
    # ... 更多种子
]

def synthesize_data(seed: dict, n: int = 20) -> list:
    """从一条种子数据生成 n 条变体"""
    prompt = f"""基于以下示例，生成 {n} 条不同的训练数据，保持同样的任务类型但改变内容：

示例：
指令：{seed['instruction']}
输入：{seed.get('input', '')}
输出：{seed['output']}

要求：
1. 指令可以换一种说法
2. 输入内容要多样化
3. 输出要准确且详细
4. 输出为 JSON 数组

格式：[{{"instruction":"...","input":"...","output":"..."}}]"""
    
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(resp.choices[0].message.content)

# 批量合成
all_data = []
for seed in SEED_DATA:
    generated = synthesize_data(seed, n=20)
    all_data.extend(generated)

# 保存
with open("training_data.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)
print(f"生成 {len(all_data)} 条训练数据")  # 约 1000 条`,
    output: '1000-2000 条领域训练数据 JSON 文件',
  },
  {
    phase: 'Day 3-4', title: 'QLoRA 微调（SFT）',
    tasks: [
      '选择基础模型（中文领域 → Qwen2.5-7B；英文 → Llama-3.1-8B）',
      '配置 LoRA 超参数（r=16, alpha=32）',
      '在 Colab Pro 或本地 GPU 上运行训练（约 2-4 小时）',
      '监控 Train/Eval Loss，确保无过拟合',
    ],
    code: `# Day 3-4: 完整微调脚本（基于 Unsloth 加速）
from unsloth import FastLanguageModel
from trl import SFTTrainer, SFTConfig
from datasets import Dataset
import json, torch

# 加载数据
with open("training_data.json") as f:
    raw_data = json.load(f)

# 训练/验证集分割（90/10）
random.shuffle(raw_data)
split = int(len(raw_data) * 0.9)
train_data = Dataset.from_list(raw_data[:split])
eval_data  = Dataset.from_list(raw_data[split:])

# 加载模型（根据你的领域选择）
MODEL = "unsloth/Qwen2.5-7B-Instruct"   # 中文领域推荐
# MODEL = "unsloth/Llama-3.1-8B-Instruct"  # 英文领域推荐

model, tokenizer = FastLanguageModel.from_pretrained(
    MODEL, max_seq_length=2048, load_in_4bit=True
)
model = FastLanguageModel.get_peft_model(
    model, r=16, lora_alpha=32,
    target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj"],
    use_gradient_checkpointing="unsloth",
)

# 格式化数据
PROMPT = "<|im_start|>user\\n{instruction}\\n{input}<|im_end|>\\n<|im_start|>assistant\\n{output}<|im_end|>"

def format(examples):
    return {"text": [PROMPT.format(**e) + tokenizer.eos_token for e in examples]}

train_ds = train_data.map(lambda x: format([x]), remove_columns=train_data.column_names)
eval_ds  = eval_data.map(lambda x: format([x]),  remove_columns=eval_data.column_names)

# 开始训练
trainer = SFTTrainer(
    model=model, tokenizer=tokenizer,
    train_dataset=train_ds, eval_dataset=eval_ds,
    args=SFTConfig(
        output_dir="./sft_output", num_train_epochs=3,
        per_device_train_batch_size=2, gradient_accumulation_steps=8,
        learning_rate=2e-4, lr_scheduler_type="cosine",
        warmup_ratio=0.05, eval_strategy="epoch",
        save_strategy="epoch", load_best_model_at_end=True,
        bf16=True, dataset_text_field="text",
        logging_steps=10,
    ),
)
trainer.train()

# 导出 GGUF（直接用于 Ollama）
model.save_pretrained_gguf("./my_expert_gguf", tokenizer, quantization_method="q4_k_m")`,
    output: '微调完成的模型 GGUF 文件（约 4-5GB）',
  },
  {
    phase: 'Day 5', title: 'DPO 偏好对齐',
    tasks: [
      '准备 200-500 对 chosen/rejected 偏好数据',
      '用 GPT-4 对 SFT 模型输出打分，构建偏好对',
      '运行 DPO 训练（约 1-2 小时）',
      '对比 SFT 和 DPO 后的输出质量',
    ],
    code: `# Day 5: 自动构建偏好数据 + DPO 微调
from trl import DPOTrainer, DPOConfig
from peft import get_peft_model, LoraConfig

# 1. 用 SFT 模型生成多个候选，GPT-4 排序
def build_preference_data(prompts: list, sft_model) -> list:
    pairs = []
    for prompt in prompts:
        # SFT 模型采样 3 个候选
        candidates = [sft_model(prompt, temperature=0.8) for _ in range(3)]
        
        # 用 GPT-4 评判排序
        ranking_prompt = f"""对以下3个回答从好到差排序（1=最好，3=最差）：

问题：{prompt}
回答A：{candidates[0]}
回答B：{candidates[1]}  
回答C：{candidates[2]}

输出 JSON：{{"ranking": [X, Y, Z], "reason": "..."}}（X=A的排名，Y=B，Z=C）"""
        
        result = gpt4(ranking_prompt)
        ranking = json.loads(result)["ranking"]
        
        best_idx  = ranking.index(1)   # 排名第1的是 chosen
        worst_idx = ranking.index(3)   # 排名最后的是 rejected
        
        pairs.append({
            "prompt":   prompt,
            "chosen":   candidates[best_idx],
            "rejected": candidates[worst_idx],
        })
    return pairs

# 2. DPO 训练
dpo_dataset = Dataset.from_list(preference_pairs)

# 加载 SFT 后的模型
lora_cfg = LoraConfig(r=8, lora_alpha=16, 
                       target_modules=["q_proj","v_proj"], task_type="CAUSAL_LM")
dpo_model = get_peft_model(sft_model, lora_cfg)

trainer = DPOTrainer(
    model=dpo_model, ref_model=sft_model,  # ref = 冻结的 SFT 模型
    tokenizer=tokenizer,
    train_dataset=dpo_dataset,
    args=DPOConfig(
        beta=0.1, output_dir="./dpo_output",
        learning_rate=5e-7, num_train_epochs=1,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        bf16=True, max_length=1024,
    ),
)
trainer.train()`,
    output: 'DPO 对齐后的模型（输出更精准、更安全）',
  },
  {
    phase: 'Day 6-7', title: '评估 & 部署上线',
    tasks: [
      '运行 LM-Eval 基准测试，与基础模型对比',
      '构建 30-50 条领域专属评估题，计算准确率',
      'Ollama 本地部署验证，vLLM 接口化',
      '封装 FastAPI，配置鉴权，Docker 部署',
    ],
    code: `# Day 6-7: 评估 + Ollama 部署 + FastAPI 封装

# ━━━━ 1. 评估（对比基础模型和微调模型）━━━━
import subprocess

# 运行领域评估
for model_path in ["base_model", "sft_output", "dpo_output"]:
    result = subprocess.run([
        "lm_eval", "--model", "hf",
        "--model_args", f"pretrained={model_path}",
        "--tasks", "your_domain_task",
        "--output_path", f"results/{model_path.replace('/', '_')}"
    ], capture_output=True, text=True)
    print(f"[{model_path}]:", result.stdout[-200:])

# 对比结果
import json, os
results = {}
for d in os.listdir("results"):
    with open(f"results/{d}/results.json") as f:
        data = json.load(f)
    results[d] = data['results']['your_domain_task']['acc']

print("\\n模型对比：")
for model, acc in sorted(results.items(), key=lambda x: x[1]):
    print(f"  {model}: {acc:.2%}")

# ━━━━ 2. Ollama 部署 ━━━━
# Modelfile
modelfile_content = """
FROM ./my_expert_gguf/model_q4_k_m.gguf
SYSTEM "你是[领域]专家助手，回答专业、准确。"
PARAMETER temperature 0.7
TEMPLATE "<|im_start|>user\\n{{ .Prompt }}<|im_end|>\\n<|im_start|>assistant\\n{{ .Response }}<|im_end|>"
"""

with open("Modelfile", "w") as f:
    f.write(modelfile_content)

# 创建并运行
os.system("ollama create my-domain-expert -f Modelfile")
os.system("ollama run my-domain-expert")

# ━━━━ 3. Docker 部署 FastAPI ━━━━
# Dockerfile
dockerfile = """
FROM python:3.11-slim
RUN pip install fastapi uvicorn openai python-dotenv
COPY app.py /app/app.py
WORKDIR /app
EXPOSE 8080
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
"""
# 使用 Ollama 作为后端，FastAPI 做路由和鉴权
# docker build -t my-expert-api . && docker run -p 8080:8080 my-expert-api`,
    output: '上线的 API 服务 + Docker 镜像 + 评估报告',
  },
];

export default function LessonFTProject() {
  const [phase, setPhase] = useState(0);
  const p = PROJECT_PHASES[phase];

  return (
    <div className="ft-lesson">
      <div className="ft-container">

        <div className="ft-hero">
          <div className="ft-badge">模块八 · Capstone Project</div>
          <h1>实战项目 — 打造你的领域专家模型</h1>
          <p>7 天端到端实战：数据合成 → QLoRA 微调 → DPO 对齐 → 评估验证 → GGUF 量化 → Ollama + vLLM 部署 → FastAPI 对外服务。你将拥有一个真正可用的领域 AI 专家。</p>
        </div>

        <div className="ft-metrics">
          {[{ v: '7天', l: '端到端完成' }, { v: '7B', l: '参数量（推荐）' }, { v: '4GB', l: '部署最低显存' }, { v: 'API', l: '对外服务化' }].map(m => (
            <div key={m.l} className="ft-metric-card"><div className="ft-metric-value">{m.v}</div><div className="ft-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* 7-Day Plan */}
        <div className="ft-section">
          <h2>📅 7 天项目计划</h2>
          <div className="ft-tabs">
            {PROJECT_PHASES.map((p, i) => <button key={i} className={`ft-tab${phase === i ? ' active' : ''}`} onClick={() => setPhase(i)}>{p.phase}</button>)}
          </div>
          <div className="ft-card" style={{ borderColor: 'var(--ft-primary)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--ft-primary)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{p.phase}</div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '.2rem' }}>{p.title}</div>
              </div>
              <span className="ft-tag green" style={{ flexShrink: 0 }}>产出：{p.output.slice(0, 12)}…</span>
            </div>
            <div className="ft-steps">
              {p.tasks.map((task, i) => (
                <div key={i} className="ft-step"><div><div className="ft-step-desc">{task}</div></div></div>
              ))}
            </div>
          </div>
          <div className="ft-code">{p.code}</div>
          <div className="ft-good">📦 <span><strong>阶段产出：</strong>{p.output}</span></div>
        </div>

        {/* Full Pipeline Summary */}
        <div className="ft-section">
          <h2>🔄 完整微调流水线总览</h2>
          <div className="ft-code">{`# 完整流水线检查清单
╔══════════════════════════════════════════════════════╗
║              开源小模型微调全链路                      ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  1. 数据准备                                          ║
║     ✅ 50条种子 → AI合成 → 1000-2000条                ║
║     ✅ 去重 + 质量过滤（AI打分 >= 4/5）                ║
║     ✅ 格式验证（Alpaca/ChatML）                      ║
║     ✅ 训练/验证集 9:1 分割                            ║
║                                                      ║
║  2. QLoRA SFT 微调                                   ║
║     ✅ 基础模型：Qwen2.5-7B 或 Llama-3.1-8B           ║
║     ✅ LoRA: r=16, alpha=32, 关键层全覆盖              ║
║     ✅ 训练 3 epochs，余弦退火                         ║
║     ✅ Eval loss 监控，无过拟合                        ║
║                                                      ║
║  3. DPO 偏好对齐（可选）                               ║
║     ✅ 300-500对 chosen/rejected                     ║
║     ✅ β=0.1，1 epoch                                ║
║     ✅ 对比 SFT 输出质量提升                           ║
║                                                      ║
║  4. 评估验证                                          ║
║     ✅ LM-Eval 通用能力（防灾难性遗忘）                 ║
║     ✅ 领域专属评估集（准确率提升确认）                  ║
║     ✅ 人工抽查 30 条输出                              ║
║                                                      ║
║  5. 量化部署                                          ║
║     ✅ 导出 GGUF Q4_K_M（4GB，消费级显卡可用）          ║
║     ✅ Ollama 本地验证                                ║
║     ✅ vLLM 生产部署（高并发场景）                      ║
║     ✅ FastAPI + Docker 封装对外 API                  ║
║                                                      ║
╚══════════════════════════════════════════════════════╝`}</div>
        </div>

        {/* Resource Guide */}
        <div className="ft-section">
          <h2>🖥️ 按资源量力而行</h2>
          <div className="ft-grid-2">
            {[
              { t: '零成本方案（Google Colab）', d: 'Colab Pro $10/月 = T4 15GB / A100 40GB。微调 7B 约 3-4 小时。适合学习和实验阶段。', tag: 'low' },
              { t: '本地 GPU（RTX 3090/4090）', d: '一次性投入，长期使用。24GB 显存可微调 13B 模型。最适合频繁实验和生产部署。', tag: 'mid' },
              { t: '云 GPU（RunPod/Vast.ai）', d: 'A100 约 $2/小时。微调 7B 项目全程约 $5-10，按需付费，适合一次性任务。', tag: 'mid' },
              { t: '无 GPU（纯 CPU）', d: '用 Unsloth CPU 版可以跑小型模型（Phi-3.5 Mini），速度慢但能完成小规模实验。', tag: 'low' },
            ].map((c, i) => (
              <div key={i} className="ft-card">
                <div className="ft-card-title">{c.t}</div>
                <div className="ft-card-body">{c.d}</div>
              </div>
            ))}
          </div>
          <div className="ft-good">
            🎓 <span><strong>恭喜完成「开源小模型微调实战」全部 8 个模块！</strong>
            你现在掌握了完整的 LLM 微调工程能力：数据工程 → LoRA/QLoRA → SFT → DPO → 评估 → 量化 → 部署。你的领域专家模型已经准备好为真实用户服务了。</span>
          </div>
        </div>

      </div>
    </div>
  );
}
