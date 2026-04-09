import { useState } from 'react';
import './LessonCommon.css';

const LORA_PARAMS = [
  { name: 'r (rank)', desc: 'LoRA 矩阵的秩（维度）', low: '4-8: 快速/省显存', high: '32-64: 质量更高', default: '16', impact: 85 },
  { name: 'lora_alpha', desc: '缩放因子，通常设为 2×r', low: '< r: 学习过慢', high: '= 2r: 推荐', default: '32 (=2r)', impact: 70 },
  { name: 'lora_dropout', desc: '防止过拟合的 dropout', low: '0: 无正则化', high: '0.1: 标准设置', default: '0.05', impact: 45 },
  { name: 'target_modules', desc: '在哪些层添加 LoRA 适配器', low: 'q_proj,v_proj: 最小集', high: '所有 attention+MLP: 最大集', default: 'q,k,v,o proj', impact: 90 },
];

const FRAMEWORKS = [
  {
    key: 'unsloth', name: 'Unsloth', icon: '🦥',
    speed: '2x 更快', vram: '70% 节省', ease: 5, power: 4,
    best: '快速上手，Colab 微调首选',
    code: `# Unsloth：最快的 QLoRA 微调框架
from unsloth import FastLanguageModel
import torch

# 1. 加载模型（自动 4-bit 量化）
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Llama-3.1-8B-Instruct",
    max_seq_length = 2048,
    dtype = None,            # 自动检测 bf16/fp16
    load_in_4bit = True,     # QLoRA 4-bit 加载
)

# 2. 添加 LoRA 适配器
model = FastLanguageModel.get_peft_model(
    model,
    r = 16,                  # LoRA rank
    target_modules = ["q_proj", "k_proj", "v_proj", 
                       "o_proj", "gate_proj", "up_proj"],
    lora_alpha = 32,
    lora_dropout = 0,        # Unsloth 推荐设为 0
    bias = "none",
    use_gradient_checkpointing = "unsloth",  # 显存优化
    random_state = 42,
)

print(f"可训练参数: {model.num_parameters(only_trainable=True):,}")
# 典型输出：可训练参数: 41,943,040 (约4200万，仅约总参数的0.5%)`,
  },
  {
    key: 'llamafactory', name: 'LLaMA-Factory', icon: '🏭',
    speed: '标准', vram: '标准', ease: 5, power: 5,
    best: '图形界面 + 命令行，支持最多模型和方法',
    code: `# LLaMA-Factory：最全面的微调框架

# 方式一：WebUI 可视化（零代码！）
llamafactory-cli webui
# 浏览器打开 http://localhost:7860
# 在界面上选择：模型、数据集、训练方法、超参数

# 方式二：YAML 配置文件
# train_qwen25_lora.yaml
model_name_or_path: Qwen/Qwen2.5-7B-Instruct
stage: sft                 # 训练阶段：sft/dpo/rm
do_train: true
finetuning_type: lora      # lora/qlora/full
lora_rank: 16
lora_target: q_proj,v_proj,k_proj,o_proj
dataset: alpaca_zh         # 预置数据集或自定义
template: qwen             # 对话模板
cutoff_len: 2048
max_samples: 5000
per_device_train_batch_size: 4
gradient_accumulation_steps: 4
num_train_epochs: 3.0
learning_rate: 0.0001
output_dir: saves/qwen25_lora_sft

# 方式三：CLI 运行
llamafactory-cli train train_qwen25_lora.yaml`,
  },
  {
    key: 'trl', name: 'TRL (HuggingFace)', icon: '🤗',
    speed: '标准', vram: '标准', ease: 3, power: 5,
    best: '最灵活，DPO/RLHF 支持最好，工程级首选',
    code: `from trl import SFTTrainer, SFTConfig
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

# 1. 加载模型（4-bit QLoRA）
from transformers import BitsAndBytesConfig
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_quant_type="nf4",          # NF4 量化更准确
    bnb_4bit_use_double_quant=True,     # 双重量化节省显存
)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    quantization_config=bnb_config,
)

# 2. LoRA 配置
lora_config = LoraConfig(
    r=16, lora_alpha=32, lora_dropout=0.05,
    target_modules=["q_proj","k_proj","v_proj","o_proj"],
    bias="none", task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora_config)

# 3. SFT 训练
trainer = SFTTrainer(
    model=model, tokenizer=tokenizer,
    train_dataset=dataset,
    args=SFTConfig(
        output_dir="./output",
        num_train_epochs=3,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=8,
        warmup_ratio=0.03,
        learning_rate=2e-4,
        lr_scheduler_type="cosine",
        logging_steps=10, save_steps=100,
        bf16=True,
    ),
)
trainer.train()`,
  },
];

export default function LessonLoRA() {
  const [tab, setTab] = useState('unsloth');
  const [rank, setRank] = useState(16);
  const [modules, setModules] = useState(6);

  const paramCount = rank * modules * 4096 * 2 / 1_000_000;
  const percentOfTotal = (paramCount / 7000).toFixed(3);
  const vramSaved = Math.round(70 * (1 - rank / 64));

  const fw = FRAMEWORKS.find(x => x.key === tab);

  return (
    <div className="ft-lesson">
      <div className="ft-container">

        <div className="ft-hero">
          <div className="ft-badge">模块三 · LoRA & QLoRA</div>
          <h1>LoRA & QLoRA — 参数高效微调核心</h1>
          <p>全参数微调一个 7B 模型需要 ~56GB 显存，LoRA 让你用 6GB 显卡微调同样的模型，且效果接近全参数。理解它的数学原理，掌握 Unsloth、TRL、LLaMA-Factory 三种实现。</p>
        </div>

        <div className="ft-metrics">
          {[{ v: '0.5%', l: '可训练参数占比' }, { v: '70%', l: 'QLoRA 显存节省' }, { v: '2x', l: 'Unsloth 速度提升' }, { v: '6GB', l: '微调 7B 最低显存' }].map(m => (
            <div key={m.l} className="ft-metric-card"><div className="ft-metric-value">{m.v}</div><div className="ft-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* LoRA Math */}
        <div className="ft-section">
          <h2>📐 LoRA 数学原理（直觉版）</h2>
          <div className="ft-code">{`# LoRA 核心思想：大矩阵的变化可以用两个小矩阵的乘积来近似
# 原始权重矩阵 W: shape (d_model, d_model) = (4096, 4096) → 16M 参数
# LoRA 不修改 W，而是学习一个低秩矩阵 ΔW = A @ B
# A: shape (d_model, r)   = (4096, 16)   → 65K 参数
# B: shape (r, d_model)   = (16, 4096)   → 65K 参数
# r << d_model（16 << 4096），大幅减少参数量！

# 前向传播：
# 原来：  y = x @ W
# LoRA：  y = x @ W + x @ (A @ B) * (alpha / r)
#                     ↑ 这就是可训练的 LoRA 模块

# QLoRA 额外：将 W 量化为 4-bit（NF4）存储，只有 A、B 是 fp16
# 效果：显存 ≈ 4x 压缩，推理时动态反量化回 fp16

class LoRALinear(nn.Module):
    def __init__(self, original, r=16, alpha=32):
        super().__init__()
        self.original = original      # 冻结，不参与训练
        d_out, d_in = original.weight.shape
        self.A = nn.Linear(d_in, r, bias=False)   # 可训练
        self.B = nn.Linear(r, d_out, bias=False)  # 可训练
        self.scale = alpha / r
        nn.init.zeros_(self.B.weight)  # B 初始为 0，保证训练开始时 ΔW=0
        nn.init.kaiming_normal_(self.A.weight)
    
    def forward(self, x):
        return self.original(x) + self.B(self.A(x)) * self.scale`}</div>

          {/* Interactive Param Calculator */}
          <div style={{ marginTop: '1.25rem', background: 'var(--ft-surface2)', border: '1px solid var(--ft-border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--ft-text)' }}>🧮 LoRA 参数量计算器</div>
            {[
              { label: `Rank r：${rank}`, min: 4, max: 128, val: rank, step: 4, set: setRank },
              { label: `目标层数：${modules}层`, min: 1, max: 28, val: modules, step: 1, set: setModules },
            ].map((s, i) => (
              <div key={i} className="ft-slider-row">
                <label>{s.label}</label>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(+e.target.value)} />
              </div>
            ))}
            <div className="ft-grid-3" style={{ marginTop: '1rem' }}>
              {[
                { label: 'LoRA 参数量', val: `${paramCount.toFixed(1)}M` },
                { label: '占总参数比', val: `${percentOfTotal}%` },
                { label: '估算显存节省', val: `~${vramSaved}%` },
              ].map((r, i) => (
                <div key={i} style={{ textAlign: 'center', background: 'var(--ft-surface)', borderRadius: 10, padding: '0.85rem' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ft-primary)', fontFamily: 'JetBrains Mono,monospace' }}>{r.val}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--ft-muted)', marginTop: '.2rem' }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LoRA Hyperparams */}
        <div className="ft-section">
          <h2>⚙️ LoRA 核心超参数指南</h2>
          {LORA_PARAMS.map((p, i) => (
            <div key={i} style={{ background: 'var(--ft-surface2)', border: '1px solid var(--ft-border)', borderRadius: 10, padding: '.85rem 1.25rem', marginBottom: '.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--ft-accent)', fontWeight: 600 }}>{p.name}</span>
                <span className="ft-tag">默认：{p.default}</span>
              </div>
              <div style={{ fontSize: '.83rem', color: 'var(--ft-muted)', marginBottom: '.5rem' }}>{p.desc}</div>
              <div className="ft-bar-row">
                <span className="ft-bar-label" style={{ fontSize: '.75rem' }}>影响权重</span>
                <div className="ft-bar-track"><div className="ft-bar-fill" style={{ width: `${p.impact}%` }} /></div>
                <span className="ft-bar-val">{p.impact}%</span>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.4rem', fontSize: '.75rem' }}>
                <span style={{ color: 'var(--ft-rose)' }}>低：{p.low}</span>
                <span style={{ color: 'var(--ft-muted)' }}>|</span>
                <span style={{ color: 'var(--ft-green)' }}>高：{p.high}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Framework Comparison */}
        <div className="ft-section">
          <h2>🛠️ 三大实战框架对比</h2>
          <div className="ft-tabs">
            {FRAMEWORKS.map(x => <button key={x.key} className={`ft-tab${tab === x.key ? ' active' : ''}`} onClick={() => setTab(x.key)}>{x.icon} {x.name}</button>)}
          </div>
          {fw && (
            <div>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                <span className="ft-tag green">速度：{fw.speed}</span>
                <span className="ft-tag purple">显存：{fw.vram}</span>
                <span className="ft-tag blue">最佳用途：{fw.best}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {[['易用性', fw.ease], ['功能全面', fw.power]].map(([label, val]) => (
                  <div key={label} className="ft-bar-row" style={{ flex: 1 }}>
                    <span className="ft-bar-label">{label}</span>
                    <div className="ft-bar-track"><div className="ft-bar-fill" style={{ width: `${val * 20}%` }} /></div>
                    <span className="ft-bar-val">{val}/5</span>
                  </div>
                ))}
              </div>
              <div className="ft-code">{fw.code}</div>
            </div>
          )}
          <div className="ft-tip">🎯 <span><strong>选型建议：</strong>第一次微调 → <strong>Unsloth</strong>（最快上手）；生产环境 → <strong>TRL</strong>（最灵活）；不想写代码 → <strong>LLaMA-Factory WebUI</strong></span></div>
        </div>

      </div>
    </div>
  );
}
