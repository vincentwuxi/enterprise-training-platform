import { useState } from 'react';
import './LessonCommon.css';

const CODE_DDP = `# ━━━━ DDP / FSDP：PyTorch 原生分布式 ━━━━

# ━━━━ 1. DDP（Distributed Data Parallel）━━━━
# 最基础的多 GPU 训练：每张 GPU 持有完整模型副本
# 梯度通过 AllReduce 同步

import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

dist.init_process_group(backend='nccl')  # NCCL 通信后端
local_rank = int(os.environ['LOCAL_RANK'])
torch.cuda.set_device(local_rank)

model = MyModel().to(local_rank)
model = DDP(model, device_ids=[local_rank])

# 启动：torchrun --nproc_per_node=4 train.py

# DDP 的限制：
# 每张 GPU 必须能装下完整模型
# 8B 模型 FP32 → 32GB → 单张 A100 40GB 勉强
# 70B 模型 → 280GB → DDP 无法使用！

# ━━━━ 2. FSDP（Fully Sharded Data Parallel）━━━━
# PyTorch 原生的 ZeRO-3 实现
# 将模型参数 + 梯度 + 优化器状态全部分片到多 GPU

from torch.distributed.fsdp import (
    FullyShardedDataParallel as FSDP,
    MixedPrecision,
    ShardingStrategy,
)

# 混合精度策略
mp_policy = MixedPrecision(
    param_dtype=torch.bfloat16,
    reduce_dtype=torch.float32,     # 梯度 AllReduce 用 FP32
    buffer_dtype=torch.bfloat16,
)

model = FSDP(
    model,
    sharding_strategy=ShardingStrategy.FULL_SHARD,  # ZeRO-3
    mixed_precision=mp_policy,
    auto_wrap_policy=transformer_auto_wrap_policy,
    device_id=local_rank,
)

# ShardingStrategy 选择：
# FULL_SHARD = ZeRO-3（显存最省，通信最多）
# SHARD_GRAD_OP = ZeRO-2（显存中等，通信中等）
# NO_SHARD = DDP（显存最大，通信最少）
# HYBRID_SHARD = 机内 FULL_SHARD + 机间 NO_SHARD（推荐多机）`;

const CODE_MEGATRON = `# ━━━━ Megatron-LM：三维并行训练 ━━━━
# NVIDIA 专为大模型训练设计的框架
# 组合使用三种并行策略：

# ━━━━ 1. 数据并行（Data Parallel = DP）━━━━
# 每张 GPU 看不同的数据，梯度 AllReduce 同步
# H100×8: 8 路数据并行 → 等效 batch_size × 8

# ━━━━ 2. 张量并行（Tensor Parallel = TP）━━━━
# 将模型的权重矩阵"横切"到多张 GPU
# 例如：Attention 的 QKV 权重矩阵横切为 4 份
# 每张 GPU 只计算 1/4 的注意力头
# 要求：GPU 间高速互联（NVLink 必须！）

# 典型配置：
# 8B 模型 → TP=1（单 GPU 能放下）
# 70B 模型 → TP=4（4 GPU 切分模型）
# 405B 模型 → TP=8（机内 8 GPU 全部用于张量并行）

# ━━━━ 3. 流水线并行（Pipeline Parallel = PP）━━━━
# 将模型按"层"切分到不同 GPU
# GPU 0：Layer 0-9, GPU 1：Layer 10-19, ...
# Micro-batch 在 GPU 间流水线执行

# PP 的气泡问题（Bubble）：
# 前向传播时，后面的 GPU 在等待
# 解决：1F1B 调度（每个 micro-batch 前向 1 步即反向 1 步）

# ━━━━ 三维并行组合（万卡训练）━━━━
# 假设 128 张 H100：
# TP = 8（机内 8 卡张量并行，NVLink 连接）
# PP = 4（4 个节点流水线并行）
# DP = 4（4 路数据并行）
# 128 = 8 × 4 × 4

# Megatron-LM 配置
python pretrain_gpt.py \\
  --tensor-model-parallel-size 8 \\    # TP=8
  --pipeline-model-parallel-size 4 \\  # PP=4
  --data-parallel-size 4 \\            # DP=4（自动计算）
  --num-layers 80 \\
  --hidden-size 8192 \\
  --num-attention-heads 64 \\
  --micro-batch-size 1 \\
  --global-batch-size 1024 \\
  --bf16 \\
  --use-flash-attn \\
  --overlap-grad-reduce \\             # 梯度通信与计算重叠
  --overlap-param-gather               # 参数通信与计算重叠`;

const CODE_COMPARE = `# ━━━━ 分布式训练框架选型 ━━━━

# ┌──────────────┬────────────────────┬──────────────────────┐
# │ 框架         │ 优势               │ 推荐场景             │
# ├──────────────┼────────────────────┼──────────────────────┤
# │ DDP          │ 简单、PyTorch 原生  │ 模型能放单卡         │
# │ FSDP         │ 内存效率高          │ 百亿模型、混合精度    │
# │ DeepSpeed    │ ZeRO 1/2/3         │ HuggingFace 生态     │
# │ Megatron-LM  │ 三维并行、极致性能  │ 千亿模型预训练       │
# │ ColossalAI   │ 易用+高效           │ 中国团队，社区活跃   │
# └──────────────┴────────────────────┴──────────────────────┘

# ━━━━ 选型决策树 ━━━━
# Q1: 模型能放单卡吗？
#   是 → DDP（最简单）
#   否 → Q2

# Q2: 使用 HuggingFace Trainer 吗？
#   是 → DeepSpeed ZeRO-2/3
#   否 → Q3

# Q3: 是预训练还是微调？
#   微调 → FSDP + QLoRA
#   预训练 → Q4

# Q4: GPU 规模多大？
#   < 64 GPU → FSDP / DeepSpeed ZeRO-3
#   > 64 GPU → Megatron-LM（三维并行）

# ━━━━ 通信优化（关键！）━━━━

# 梯度压缩（减少通信量）
model = DDP(model,
    gradient_as_bucket_view=True,   # 减少内存碎片
    bucket_cap_mb=25,               # 通信桶大小（MB）
)

# 计算-通信重叠（Pipeline）
# 在计算第 N 层梯度时，同步第 N-1 层梯度
model = FSDP(model,
    forward_prefetch=True,          # 前向预取参数
    limit_all_gathers=True,         # 限制同时进行的 AllGather
)

# ━━━━ 显存消耗计算公式 ━━━━
# Llama 3 70B 训练显存估算：
# 参数：70B × 2 bytes (bf16)    = 140 GB
# 梯度：70B × 2 bytes            = 140 GB
# Adam 状态：70B × 8 bytes       = 560 GB
# 激活值：~100 GB（取决于 batch size）
# 总计：~940 GB → 需要 12+ 张 A100 80GB (FSDP ZeRO-3)
# 或 8 张 H100 80GB (Megatron TP=8, 更高效)`;

export default function LessonDistributed() {
  const [tab, setTab] = useState('ddp');
  const tabs = [
    { key: 'ddp',      label: '📡 DDP / FSDP', code: CODE_DDP },
    { key: 'megatron', label: '🔧 Megatron 三维并行', code: CODE_MEGATRON },
    { key: 'compare',  label: '📊 选型 & 显存计算', code: CODE_COMPARE },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 06 · DISTRIBUTED TRAINING</div>
        <h1>分布式训练架构</h1>
        <p>训练 GPT-4 需要 25,000 张 A100 跑数月——<strong>数据并行、张量并行、流水线并行三大策略的组合</strong>是大模型预训练的核心架构选择。理解何时用哪种并行、瓶颈在哪里，是 AI Infra 工程师最核心的能力。</p>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">⚙️ 分布式三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`ai-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} /><div className="ai-code-dot" style={{ background: '#f59e0b' }} /><div className="ai-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.py</span>
          </div>
          <div className="ai-code">{t.code}</div>
        </div>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">🧩 三种并行策略对比</div>
        <div className="ai-grid-3">
          {[
            { name: '数据并行（DP）', desc: '每 GPU 完整模型副本，不同数据，梯度同步', pros: '简单、扩展性最好', cons: '模型必须放单卡', color: '#f97316' },
            { name: '张量并行（TP）', desc: '权重矩阵横切到多 GPU，每 GPU 计算一部分', pros: '打破单卡显存限制', cons: '需要 NVLink 高速互联', color: '#38bdf8' },
            { name: '流水线并行（PP）', desc: '模型按层切分，micro-batch 流水线执行', pros: '适合跨节点', cons: '有气泡（Bubble）开销', color: '#a78bfa' },
          ].map((p, i) => (
            <div key={i} className="ai-card" style={{ borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontWeight: 700, color: p.color, fontSize: '0.88rem', marginBottom: '0.5rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ai-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>{p.desc}</div>
              <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--ai-green)' }}>✅</span> <span style={{ color: 'var(--ai-muted)' }}>{p.pros}</span></div>
              <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--ai-red)' }}>⚠️</span> <span style={{ color: 'var(--ai-muted)' }}>{p.cons}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
