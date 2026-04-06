import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const FT_CODE = `# LoRA / QLoRA / RLHF — 高效大模型微调

from transformers import (AutoModelForCausalLM, AutoTokenizer, TrainingArguments,
                           BitsAndBytesConfig)
from peft import LoraConfig, get_peft_model, TaskType, prepare_model_for_kbit_training
from trl import SFTTrainer, RewardTrainer, PPOTrainer
import torch

# ══════════════ 1. QLoRA：4-bit量化 + LoRA（单卡微调70B模型！）══════════════

# 4-bit 量化配置（BitsAndBytes）
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,                          # 4-bit 量化
    bnb_4bit_quant_type="nf4",                  # NF4 量化（最佳精度）
    bnb_4bit_compute_dtype=torch.bfloat16,      # 计算时用 bf16
    bnb_4bit_use_double_quant=True,             # 双重量化（再省10%显存）
)

# 加载量化模型（70B 参数用 ~40GB → ~4GB 显存！）
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto",   # 自动分配到可用 GPU/CPU
)
model = prepare_model_for_kbit_training(model)   # 准备量化模型

# LoRA 配置
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,                   # LoRA 秩（越大容量越强，但参数越多）
    lora_alpha=32,          # LoRA 缩放因子（通常设为 2r）
    target_modules=[        # 注入 LoRA 的层（只训练这些！）
        "q_proj", "k_proj", "v_proj", "o_proj",   # 注意力层
        "up_proj", "down_proj"                     # FFN层
    ],
    lora_dropout=0.05,
    bias="none",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: 3,407,872 || all params: 6,742,609,920 || trainable%: 0.0506%
# 只训练 0.05% 的参数！大幅降低计算成本

# SFT（监督微调）训练
training_args = TrainingArguments(
    output_dir="./lora-llama",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,  # 等效 batch size = 16
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_strategy="epoch",
    optim="paged_adamw_32bit",      # QLoRA 专用优化器
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=2048,
)
trainer.train()

# ══════════════ 2. DPO（替代RLHF的更简单方法）══════════════
# Direct Preference Optimization：直接从偏好数据学习
from trl import DPOTrainer

# 数据格式：每条数据有 prompt + chosen(好回答) + rejected(差回答)
dpo_data = [
    {
        "prompt": "如何提高代码质量？",
        "chosen": "可以通过单元测试、代码审查、静态分析工具（如 ruff）...",
        "rejected": "写更多代码就行了",
    }
]

dpo_trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,   # 参考模型（原始未微调的版本）
    args=training_args,
    beta=0.1,              # KL 散度系数
    train_dataset=dpo_data,
    tokenizer=tokenizer,
)
dpo_trainer.train()

# ══════════════ 3. RLHF 完整流程（PPO）══════════════
# Step 1: SFT（监督微调）→ 得到 SFT Model
# Step 2: 训练 Reward Model（学习人类偏好：什么是好回答）
# Step 3: PPO 强化学习（让 SFT Model 生成 Reward 高的答案）

# 保存 LoRA adapter
model.save_pretrained("lora-adapter")   # 只保存 LoRA 权重（~10MB 而非 13GB）

# 合并到基础模型
from peft import PeftModel
base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")
merged = PeftModel.from_pretrained(base_model, "lora-adapter").merge_and_unload()`;

export default function LessonFineTuning() {
  const navigate = useNavigate();
  const METHODS = [
    { name: 'Full Fine-tuning', params: '100%', vram: '~80GB (7B)', speed: '慢', use: '数据充足，有大量GPU', color: '#ef4444' },
    { name: 'LoRA',            params: '0.5-1%', vram: '~24GB (7B)', speed: '快', use: '单/多卡，大多数场景', color: '#f97316' },
    { name: 'QLoRA',           params: '0.05%', vram: '~8GB (7B)', speed: '较快', use: '消费级GPU(RTX 4090)', color: '#10b981' },
    { name: 'Prompt Tuning',   params: '~0.01%', vram: '推理显存', speed: '极快', use: '无GPU资源，少样本适配', color: '#3b82f6' },
    { name: 'RLHF (PPO)',      params: '含RM', vram: '~160GB', speed: '最慢', use: '对齐人类偏好(ChatGPT)', color: '#8b5cf6' },
    { name: 'DPO',             params: '无RM', vram: '~24GB', speed: '快', use: 'RLHF简化版，效果相近', color: '#fbbf24' },
  ];
  return (
    <div className="lesson-ml">
      <div className="ml-badge purple">⚡ module_05 — Fine-tuning</div>
      <div className="ml-hero">
        <h1>Fine-tuning：LoRA / QLoRA / RLHF / DPO 高效微调全攻略</h1>
        <p>LoRA 只训练 <strong>0.05%</strong> 的参数，效果接近全量微调。QLoRA 将 7B 模型压缩到 <strong>8GB 显存</strong>，RTX 4090 就能跑。掌握这些，你能在单卡上微调任意开源大模型。</p>
      </div>
      <div className="ml-interactive">
        <h3>⚖️ 微调方法对比（显存 vs 参数量 vs 适用场景）</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="ml-table">
            <thead><tr><th>方法</th><th>可训练参数</th><th>显存需求(7B)</th><th>速度</th><th>适用场景</th></tr></thead>
            <tbody>{METHODS.map(m => (
              <tr key={m.name}>
                <td><span className="ml-tag" style={{ background: `${m.color}15`, color: m.color, fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>{m.name}</span></td>
                <td style={{ fontFamily: 'JetBrains Mono', color: m.color, fontSize: '0.78rem', fontWeight: 800 }}>{m.params}</td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#9ca3af' }}>{m.vram}</td>
                <td style={{ fontSize: '0.75rem', color: '#6b7280' }}>{m.speed}</td>
                <td style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{m.use}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="ml-section">
        <h2 className="ml-section-title">🔧 QLoRA + DPO 完整代码</h2>
        <div className="ml-code-wrap">
          <div className="ml-code-head"><div className="ml-code-dot" style={{ background: '#8b5cf6' }}/><div className="ml-code-dot" style={{ background: '#f97316' }}/><div className="ml-code-dot" style={{ background: '#10b981' }}/><span style={{ color: '#a78bfa', marginLeft: '0.5rem' }}>⚡ qlora_finetuning.py</span></div>
          <div className="ml-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{FT_CODE}</div>
        </div>
      </div>
      <div className="ml-nav">
        <button className="ml-btn" onClick={() => navigate('/course/ml-engineering/lesson/transformer')}>← 上一模块</button>
        <button className="ml-btn primary" onClick={() => navigate('/course/ml-engineering/lesson/mlops')}>下一模块：MLOps →</button>
      </div>
    </div>
  );
}
