import { useState } from 'react';
import './LessonCommon.css';

export default function LessonLoRA() {
  const [tab, setTab] = useState('math');

  const codes = {
    math: `# ━━━━ LoRA 数学原理：低秩矩阵分解 ━━━━

# 核心思想：预训练权重 W₀ 在微调时的变化量 ΔW 是低秩的
# 即 ΔW 可以被分解为两个小矩阵的乘积：ΔW = B × A

# 原始权重矩阵（冻结，不更新）
W₀ ∈ ℝ^(d×k)        # 例如 d=4096, k=4096 → 16M 参数

# LoRA 分解（只训练 A 和 B）
A ∈ ℝ^(r×k)          # 低秩矩阵 A，随机初始化
B ∈ ℝ^(d×r)          # 低秩矩阵 B，零初始化（确保初始无影响）
# r ≪ min(d, k)，通常 r = 8 或 16

# 前向传播
h = W₀x + ΔWx = W₀x + (B × A)x

# 可训练参数量
LoRA参数  = r×k + d×r = r(d+k)
全量参数  = d×k
# 以 d=k=4096, r=16：
# LoRA：16×4096×2 = 131,072 参数
# 全量：4096²      = 16,777,216 参数
# 节省：99.2%

# ━━━━ 关键超参数解析 ━━━━
# r（rank）：控制低秩矩阵的秩，越大容量越强、越小参数越少
# alpha（α）：缩放因子，实际 scaling = α/r
#   推荐：alpha = 2×r（即 r=8, alpha=16）
# dropout：LoRA 矩阵上的 dropout 率（通常 0.05-0.1）

# ━━━━ 推理时权重合并（零延迟！）━━━━
W_merged = W₀ + (α/r) × B × A
# 合并后推理速度与原模型完全相同，无额外延迟
model.merge_and_unload()  # HuggingFace 一行合并`,

    config: `# ━━━━ LoRA 工程实现（PEFT + HuggingFace）━━━━
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# 1. 加载基座模型
model_id = "meta-llama/Meta-Llama-3-8B-Instruct"
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,   # 使用 bfloat16 节省显存
    device_map="auto",             # 自动分配到可用 GPU
)
tokenizer = AutoTokenizer.from_pretrained(model_id)

# 2. LoRA 配置
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,                             # rank（通常 8/16/32/64）
    lora_alpha=32,                    # α = 2×r 是经验黄金比例
    lora_dropout=0.05,                # 轻度 dropout 防止过拟合
    bias="none",                      # "none"/"all"/"lora_only"
    target_modules=[                  # 哪些层加 LoRA
        "q_proj", "k_proj", "v_proj", "o_proj",  # Attention
        "gate_proj", "up_proj", "down_proj",      # FFN
    ],
)

# 3. 应用 LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Output: trainable params: 83,886,080 || all params: 8,113,786,880
#         || trainable%: 1.0339

# ━━━━ Target Modules 如何选择？━━━━
# 最常用：q_proj + v_proj（大多数任务够用）
# 效果更好：+ k_proj + o_proj + FFN 层
# 最全覆盖：query/key/value/output + gate/up/down
# 查看模型结构：
for name, _ in model.named_modules():
    if 'proj' in name or 'linear' in name:
        print(name)`,

    rank: `# ━━━━ Rank 选择实验与最佳实践 ━━━━

# Rank 对效果的影响（经验数据）
# ┌──────┬────────────┬──────────┬──────────────────────┐
# │ Rank │ 训练参数    │ 显存增量  │ 适合场景              │
# ├──────┼────────────┼──────────┼──────────────────────┤
# │  4   │ ~21M       │ ~0.1GB   │ 简单格式/风格调整     │
# │  8   │ ~42M       │ ~0.2GB   │ 分类/抽取任务         │
# │  16  │ ~84M       │ ~0.4GB   │ 指令微调（首选）      │
# │  32  │ ~168M      │ ~0.8GB   │ 复杂推理任务          │
# │  64  │ ~336M      │ ~1.6GB   │ 跨语言/多任务         │
# │ 128  │ ~672M      │ ~3.2GB   │ 接近全量效果          │
# └──────┴────────────┴──────────┴──────────────────────┘

# ━━━━ DoRA（权重分解 LoRA，2024 新进展）━━━━
# DoRA = 将 W 分解为 magnitude × direction
# 在 PEFT 中只需一行启用：
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    use_dora=True,    # ← 启用 DoRA（通常比 LoRA 效果更好 1-2%）
    ...
)

# ━━━━ RSLoRA（Rank-Stabilized LoRA）━━━━
# 解决高 rank 时训练不稳定的问题
# scaling = α / √r（而非 α/r）
lora_config = LoraConfig(
    r=64,
    lora_alpha=64,
    use_rslora=True,   # ← 启用 RS 缩放
    ...
)

# ━━━━ 合并 & 推理 ━━━━
# 训练完成后，合并 LoRA 权重（推理零开销）
model = model.merge_and_unload()
model.save_pretrained("./finetuned-llama3-8b")
tokenizer.save_pretrained("./finetuned-llama3-8b")

# 推理
inputs = tokenizer("请帮我分析以下合同条款：", return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=512, temperature=0.1)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))`,
  };

  return (
    <div className="ft-lesson">
      <div className="ft-hero">
        <div className="ft-badge">// MODULE 02 · LORA DEEP DIVE</div>
        <h1>LoRA 深度解析</h1>
        <p>LoRA（Low-Rank Adaptation）是当今最主流的微调技术，<strong>99% 参数不动，只训练不到 1% 的低秩矩阵，效果却接近全量微调</strong>。理解它的数学本质，才能正确调参。</p>
      </div>

      {/* Math visualization */}
      <div className="ft-section">
        <div className="ft-section-title">∑ LoRA 核心数学（可视化）</div>
        <div className="ft-grid-2" style={{ marginBottom: '1rem' }}>
          <div className="ft-math">
            <div className="ft-math-label" style={{ marginBottom: '0.5rem', color: 'var(--ft-muted)' }}>原始前向传播</div>
            <div className="ft-math-eq">h = W₀ · x</div>
            <div className="ft-math-label">W₀ 是 d×k 的大矩阵，参数量 = d×k</div>
          </div>
          <div className="ft-math" style={{ borderColor: 'rgba(225,29,72,0.3)' }}>
            <div className="ft-math-label" style={{ marginBottom: '0.5rem', color: 'var(--ft-muted)' }}>LoRA 前向传播</div>
            <div className="ft-math-eq" style={{ color: 'var(--ft-pink)' }}>h = W₀ · x + (α/r) · B · A · x</div>
            <div className="ft-math-label">只有 A（r×k）和 B（d×r）被训练，r ≪ d,k</div>
          </div>
        </div>
        <div className="ft-card" style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ft-violet)', marginBottom: '0.75rem' }}>🎨 低秩矩阵分解直觉图示</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'W₀（冻结）', dims: 'd × k', size: 64, color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)' },
              { label: '+', dims: '', size: 0, color: 'transparent', border: 'transparent' },
              { label: 'B', dims: 'd × r', size: 14, color: 'rgba(225,29,72,0.15)', border: 'rgba(225,29,72,0.4)' },
              { label: '×', dims: '', size: 0, color: 'transparent', border: 'transparent' },
              { label: 'A', dims: 'r × k', size: 14, color: 'rgba(225,29,72,0.15)', border: 'rgba(225,29,72,0.4)' },
            ].map((box, i) =>
              box.size === 0
                ? <div key={i} style={{ color: 'var(--ft-muted)', fontSize: '1.2rem', fontWeight: 700 }}>{box.label}</div>
                : (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ width: box.size, height: box.size, background: box.color, border: `2px solid ${box.border}`, borderRadius: 6, margin: '0 auto 0.35rem' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--ft-pink)', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace' }}>{box.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--ft-muted)', fontFamily: 'JetBrains Mono,monospace' }}>{box.dims}</div>
                  </div>
                )
            )}
            <div style={{ fontSize: '0.82rem', color: 'var(--ft-muted)', maxWidth: 200 }}>
              r≪d,k → 参数量从 d×k 降至 r(d+k)
              <br />节省比例：<strong style={{ color: 'var(--ft-pink)' }}>99%+</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">⚙️ LoRA 三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['math', '∑ 数学与参数计算'], ['config', '🔧 工程配置实战'], ['rank', '📊 Rank 选择 + DoRA/RSLoRA']].map(([k, l]) => (
            <button key={k} className={`ft-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ft-code-wrap">
          <div className="ft-code-head">
            <div className="ft-code-dot" style={{ background: '#ef4444' }} /><div className="ft-code-dot" style={{ background: '#f59e0b' }} /><div className="ft-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_lora.py</span>
          </div>
          <div className="ft-code">{codes[tab]}</div>
        </div>
      </div>
    </div>
  );
}
