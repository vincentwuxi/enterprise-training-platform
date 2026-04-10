import { useState } from 'react';
import './LessonCommon.css';

const CODE_AMP = `# ━━━━ 混合精度训练（AMP）━━━━
# 核心思想：前向传播用 FP16/BF16（快+省显存）
#           反向传播中的梯度和权重更新用 FP32（保精度）

import torch
from torch.cuda.amp import autocast, GradScaler

model = MyModel().cuda()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
scaler = GradScaler()  # Loss Scaling：防止 FP16 梯度下溢

for batch in dataloader:
    inputs, labels = batch['input'].cuda(), batch['label'].cuda()
    optimizer.zero_grad()

    # autocast 自动选择哪些操作用 FP16，哪些保留 FP32
    with autocast(dtype=torch.bfloat16):   # BF16 比 FP16 更稳定
        outputs = model(inputs)
        loss = criterion(outputs, labels)

    # Loss Scaling + 反向传播
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()

# ━━━━ 数值精度类型对比 ━━━━
# ┌──────────┬────────┬───────────┬────────────┬──────────────────┐
# │ 类型     │ 位数   │ 范围      │ 精度       │ 用途             │
# ├──────────┼────────┼───────────┼────────────┼──────────────────┤
# │ FP32     │ 32 bit │ ~3.4e38   │ 最高       │ 权重更新（主副本）│
# │ TF32     │ 19 bit │ ~3.4e38   │ 高         │ Tensor Core 自动 │
# │ BF16     │ 16 bit │ ~3.4e38   │ 中（推荐）  │ 训练前向+反向    │  
# │ FP16     │ 16 bit │ ~6.5e4    │ 中         │ 训练（需 scaler）│
# │ FP8      │ 8 bit  │ ~240      │ 低         │ H100 推理加速    │
# │ INT8     │ 8 bit  │ 0-255     │ 量级       │ 推理量化         │
# │ INT4     │ 4 bit  │ 0-15      │ 极低       │ 推理极致压缩     │
# └──────────┴────────┴───────────┴────────────┴──────────────────┘

# ━━━━ BF16 vs FP16 ━━━━
# BF16：指数位多（8位 vs FP16 的 5位）→ 数值范围大 → 不容易溢出
# FP16：尾数位多（10位 vs BF16 的 7位）→ 精度更高但容易 NaN
# 推荐：A100/H100 用 BF16；消费级 GPU（3090/4090）部分不支持 BF16`;

const CODE_AUTOGRAD = `# ━━━━ PyTorch 计算图与 Autograd ━━━━

import torch

# ━━━━ 1. 动态计算图（Define-by-Run）━━━━
x = torch.tensor([2.0], requires_grad=True)
y = torch.tensor([3.0], requires_grad=True)

# 前向传播：PyTorch 自动记录计算图
z = x * y + x ** 2    # z = 2*3 + 2^2 = 10

# 反向传播：自动计算所有 requires_grad=True 的梯度
z.backward()
print(x.grad)  # dz/dx = y + 2x = 3 + 4 = 7
print(y.grad)  # dz/dy = x = 2

# ━━━━ 2. torch.compile（PyTorch 2.0 最重要的特性）━━━━
import torch._dynamo

@torch.compile(mode="reduce-overhead")  # 或 "max-autotune"
def train_step(model, inputs, labels, criterion, optimizer):
    optimizer.zero_grad()
    with torch.autocast(device_type='cuda', dtype=torch.bfloat16):
        outputs = model(inputs)
        loss = criterion(outputs, labels)
    loss.backward()
    optimizer.step()
    return loss

# torch.compile 做了什么？
# 1. Graph Capture：将 Python 代码追踪为计算图
# 2. Graph Lowering：转为 Triton IR
# 3. Kernel Fusion：多个小操作合并为一个 CUDA Kernel
# 4. Memory Planning：优化中间变量的内存分配

# ━━━━ 3. 显存优化技巧 ━━━━
# 梯度检查点（用时间换空间）
from torch.utils.checkpoint import checkpoint

class BigModel(nn.Module):
    def forward(self, x):
        # 正常：缓存所有中间激活值（显存大）
        # 检查点：丢弃激活值，反向传播时重新计算（慢 30% 但省 60% 显存）
        x = checkpoint(self.layer1, x, use_reentrant=False)
        x = checkpoint(self.layer2, x, use_reentrant=False)
        return self.head(x)

# 梯度累积（小 batch × 多步 = 大 batch 效果）
accumulation_steps = 4
for i, batch in enumerate(dataloader):
    loss = model(batch) / accumulation_steps
    loss.backward()
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()`;

const CODE_PROFILING = `# ━━━━ PyTorch Profiler：性能瓶颈定位 ━━━━

import torch.profiler

# ━━━━ 1. 使用 PyTorch Profiler ━━━━
with torch.profiler.profile(
    activities=[
        torch.profiler.ProfilerActivity.CPU,
        torch.profiler.ProfilerActivity.CUDA,
    ],
    schedule=torch.profiler.schedule(
        wait=1,       # 跳过前 1 步
        warmup=1,     # 预热 1 步
        active=3,     # 记录 3 步
        repeat=2,     # 重复 2 次
    ),
    on_trace_ready=torch.profiler.tensorboard_trace_handler('./profiler_logs'),
    record_shapes=True,
    profile_memory=True,
    with_stack=True,
) as prof:
    for step, batch in enumerate(dataloader):
        train_step(batch)
        prof.step()
        if step >= 10:
            break

# TensorBoard 查看：
# tensorboard --logdir=./profiler_logs

# ━━━━ 2. 关键性能指标 ━━━━
# GPU 利用率（nvidia-smi 或 profiler）
# - > 80%：健康
# - 30-80%：可能有 CPU 瓶颈或数据加载瓶颈
# - < 30%：严重浪费，需要优化

# 内存使用（torch.cuda.memory_summary()）
print(torch.cuda.memory_summary(device='cuda:0'))
# Peak Memory：显存峰值
# Allocated：当前使用
# Reserved：PyTorch 缓存池

# ━━━━ 3. 常见瓶颈与解决方案 ━━━━
# 瓶颈 1：数据加载慢（CPU bound）
# → DataLoader num_workers=4, pin_memory=True, prefetch_factor=2

# 瓶颈 2：小 Kernel 启动开销大
# → torch.compile 自动 Kernel Fusion
# → CUDA Graphs 消除 Kernel Launch 开销

# 瓶颈 3：GPU 显存不足
# → 梯度检查点 + 梯度累积 + 混合精度
# → DeepSpeed ZeRO（分片优化器/梯度/参数）

# 瓶颈 4：通信瓶颈（多 GPU）
# → 检查 NCCL 版本和 NVLink 拓扑
# → overlap_comm=True（计算与通信重叠）

# ━━━━ 4. nvidia-smi 实时监控 ━━━━
# watch -n 0.5 nvidia-smi
# 关注：GPU-Util%、Memory-Usage、Temperature、Power`;

export default function LessonPyTorch() {
  const [tab, setTab] = useState('amp');
  const tabs = [
    { key: 'amp',       label: '⚡ 混合精度训练（AMP）', code: CODE_AMP },
    { key: 'autograd',  label: '🧮 计算图 & torch.compile', code: CODE_AUTOGRAD },
    { key: 'profiling', label: '📊 Profiler 性能分析', code: CODE_PROFILING },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 03 · PYTORCH INTERNALS</div>
        <h1>PyTorch 底层</h1>
        <p>PyTorch 是 AI 训练的"操作系统"。<strong>混合精度将训练速度提升 2 倍、torch.compile 自动生成优化 Kernel、Profiler 精确定位性能瓶颈</strong>——这三项把训练从"能跑"变成"跑得快"。</p>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">🔬 PyTorch 底层三主题</div>
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
        <div className="ai-section-title">📈 混合精度训练加速效果</div>
        <div className="ai-grid-4">
          {[
            { v: '2x', l: '训练速度提升（BF16 vs FP32）' },
            { v: '50%', l: '显存节省（激活值减半）' },
            { v: '<1%', l: '精度损失（BF16 几乎无损）' },
            { v: '3x', l: 'torch.compile 最大加速比' },
          ].map((s, i) => (
            <div key={i} className="ai-metric">
              <div className="ai-metric-val" style={{ fontSize: '1.4rem' }}>{s.v}</div>
              <div className="ai-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
