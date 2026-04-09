import { useState } from 'react';
import './LessonCommon.css';

export default function LessonQLoRA() {
  const [tab, setTab] = useState('quantization');

  const codes = {
    quantization: `# ━━━━ QLoRA 核心技术：NF4 量化 ━━━━
# QLoRA Paper: "QLoRA: Efficient Finetuning of Quantized LLMs"
# Dettmers et al., 2023

# 三大创新：
# 1. NF4（4-bit NormalFloat）：专为权重分布设计的最优量化类型
# 2. 双量化（Double Quantization）：对量化常数再量化，进一步节省
# 3. 分页优化器（Paged Optimizer）：防止 GPU OOM 的梯度 Offload

# ━━━━ NF4 vs INT4 vs INT8 ━━━━
# 正态分布的权重 → NF4 量化误差最小（理论最优）
# NF4 有 16 个固定量化区间，基于高斯分布分位数计算：
# [-1.0, -0.6962, -0.5251, -0.3949, -0.2844, -0.1848,
#  -0.0911, 0.0, 0.0796, 0.1609, 0.2461, 0.3379,
#   0.4407, 0.5626, 0.7230, 1.0]

# ━━━━ 显存节省计算 ━━━━
# Llama 3 8B 全量微调显存估算：
# bf16 权重：8B × 2 bytes = 16 GB
# Adam 优化器状态：8B × 8 bytes = 64 GB
# 梯度：8B × 2 bytes = 16 GB
# 激活值：~8 GB
# 合计：~104 GB → 需要 4× A100 (40GB)
#
# QLoRA 后（4-bit 量化 + 只训练 LoRA）：
# 4-bit 权重：8B × 0.5 bytes = 4 GB
# 只有 LoRA 参数的优化器：~1 GB
# 梯度：~0.5 GB（仅 LoRA）
# 合计：~6 GB → 单张 RTX 3090/4090 (24GB) 可跑！

# ━━━━ 实战验证 ━━━━
# RTX 4090 (24GB VRAM) 可微调：
# Llama 3 8B  → QLoRA r=16 ✅
# Llama 3 70B → QLoRA r=8  ✅（需要 2× 4090！）
# Mistral 7B  → QLoRA r=32 ✅`,

    impl: `# ━━━━ QLoRA 完整实现（BitsAndBytes + PEFT）━━━━
from transformers import (
    AutoModelForCausalLM, AutoTokenizer,
    BitsAndBytesConfig, TrainingArguments,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer
import torch, datasets

# 1. 4-bit 量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",           # 使用 NF4（理论最优）
    bnb_4bit_compute_dtype=torch.bfloat16, # 计算时用 bfloat16
    bnb_4bit_use_double_quant=True,       # 双量化：额外节省 0.1bit/param
)

# 2. 加载 4-bit 量化模型
model_id = "meta-llama/Meta-Llama-3-8B-Instruct"
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    quantization_config=bnb_config,
    device_map="auto",
    attn_implementation="flash_attention_2",  # 必须！节省显存+加速
)
tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

# 3. 为低比特训练做准备（关键步骤！）
model = prepare_model_for_kbit_training(model)
# 作用：
# - 冻结 4-bit 量化的基础权重
# - 将 LayerNorm 的计算精度提升为 FP32
# - 启用梯度检查点（显存 vs 速度 tradeoff）

# 4. LoRA 配置
lora_config = LoraConfig(
    r=16, lora_alpha=32,
    target_modules=["q_proj","k_proj","v_proj","o_proj",
                    "gate_proj","up_proj","down_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora_config)

# 5. 数据集准备
dataset = datasets.load_dataset("json", data_files="train.jsonl")["train"]

# 6. 训练配置
training_args = TrainingArguments(
    output_dir="./qlora-llama3-8b",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,      # 等效 batch_size = 16
    learning_rate=2e-4,                 # QLoRA 推荐较高 LR
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    bf16=True,                          # bfloat16 混合精度
    logging_steps=10,
    save_strategy="epoch",
    optim="paged_adamw_32bit",          # 分页优化器（防 OOM）
    gradient_checkpointing=True,        # 显存换速度
    report_to="wandb",
)

# 7. 使用 TRL SFTTrainer（自动处理数据格式）
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=2048,
    tokenizer=tokenizer,
)
trainer.train()
trainer.model.save_pretrained("./qlora-llama3-8b-final")`,

    gpu: `# ━━━━ 不同 GPU 的 QLoRA 可行配置 ━━━━

# ┌──────────────────┬────────┬──────────────────────────────────────┐
# │ GPU              │ VRAM   │ 推荐配置                              │
# ├──────────────────┼────────┼──────────────────────────────────────┤
# │ RTX 3090 Ti      │ 24GB   │ 7B-13B QLoRA r=16, batch=2, acc=8   │
# │ RTX 4090         │ 24GB   │ 7B-13B QLoRA r=32, batch=4, acc=4   │
# │ A10G（AWS）      │ 24GB   │ 7B-13B QLoRA r=16，适合 SageMaker   │
# │ A100（40GB）     │ 40GB   │ 13B-34B QLoRA 或 7B LoRA（bf16）    │
# │ A100（80GB）     │ 80GB   │ 70B QLoRA 或 13B 全量微调           │
# │ 2× RTX 4090      │ 48GB   │ 34B QLoRA 或 13B LoRA + DeepSpeed   │
# │ 4× A100 (80GB)  │ 320GB  │ 70B 全量微调（ZeRO-3）             │
# └──────────────────┴────────┴──────────────────────────────────────┘

# ━━━━ Flash Attention 2（关键！必须启用）━━━━
# pip install flash-attn --no-build-isolation

# Flash Attention 2 特点：
# - 节省 memory：O(n) 而非 O(n²)（相比标准 Attention）
# - 序列长度更长：可训练 32k+ 上下文
# - 速度提升：2-4x 训练加速

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    attn_implementation="flash_attention_2",  # 必须！
    torch_dtype=torch.bfloat16,
)

# ━━━━ 梯度检查点（显存 vs 速度 tradeoff）━━━━
# 启用：重新计算激活值，节省显存但慢 20-30%
# 关闭：缓存所有激活值，快但显存占用高

model.gradient_checkpointing_enable()
# 或在 TrainingArguments 中设置 gradient_checkpointing=True

# ━━━━ 实测案例：RTX 4090 微调 Llama 3 8B ━━━━
# 配置：QLoRA 4-bit NF4, r=16, batch=2, acc=8
# 显存使用：约 18GB（4090 24GB 有余量）
# 训练速度：约 3-5 tokens/s（gradient_checkpointing 启用时）
# 1000 条数据，3 epoch ≈ 45 分钟`,
  };

  return (
    <div className="ft-lesson">
      <div className="ft-hero">
        <div className="ft-badge">// MODULE 03 · QLORA</div>
        <h1>QLoRA 量化微调</h1>
        <p>QLoRA 让"消费级 GPU 微调百亿模型"成为可能。<strong>4-bit NF4 量化 + 双量化 + 分页优化器</strong>三项创新，将 70B 模型的微调显存需求从 320GB 压缩到 48GB——普通工程师也能做大模型微调。</p>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">💡 QLoRA 三项核心创新</div>
        <div className="ft-grid-3" style={{ marginBottom: '1.25rem' }}>
          {[
            { title: 'NF4（4-bit NormalFloat）', icon: '🧮', color: '#e11d48', desc: '基于正态分布分位数设计的量化类型，是权重近似正态分布的理论最优量化方案。比 INT4 精度更高。' },
            { title: '双量化（Double Quant）', icon: '2️⃣', color: '#6366f1', desc: '对量化常数（每 64 个参数共享一个 FP32 常数）再做一次 8-bit 量化。额外节省约 0.5GB/7B 模型。' },
            { title: '分页优化器（Paged Optimizer）', icon: '📄', color: '#10b981', desc: '利用 Unified Memory 在 GPU OOM 时自动将优化器状态换页到 CPU RAM，防止训练中断。' },
          ].map((c, i) => (
            <div key={i} className="ft-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.88rem', marginBottom: '0.5rem' }}>{c.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ft-muted)', lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">⚙️ QLoRA 三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['quantization', '🧮 量化原理'], ['impl', '🔧 完整实现'], ['gpu', '🖥️ GPU 配置速查']].map(([k, l]) => (
            <button key={k} className={`ft-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ft-code-wrap">
          <div className="ft-code-head">
            <div className="ft-code-dot" style={{ background: '#ef4444' }} /><div className="ft-code-dot" style={{ background: '#f59e0b' }} /><div className="ft-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_qlora.py</span>
          </div>
          <div className="ft-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">📊 显存节省对比</div>
        <div className="ft-grid-4">
          {[
            { v: '104GB', l: 'Llama3-8B 全量微调需求', color: 'var(--ft-muted)' },
            { v: '~6GB',  l: 'QLoRA 后的显存需求', color: 'var(--ft-pink)' },
            { v: '17x',   l: '显存压缩倍数', color: 'var(--ft-pink)' },
            { v: '24GB',  l: '可以跑 8B QLoRA 的 GPU', color: 'var(--ft-green)' },
          ].map((s, i) => (
            <div key={i} className="ft-metric">
              <div className="ft-metric-val" style={{ color: s.color, fontSize: '1.3rem' }}>{s.v}</div>
              <div className="ft-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
