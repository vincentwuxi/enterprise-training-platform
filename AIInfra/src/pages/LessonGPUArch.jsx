import { useState } from 'react';
import './LessonCommon.css';

const GPUS = [
  { name: 'RTX 4090', arch: 'Ada Lovelace', cores: '16,384 CUDA / 512 Tensor', vram: '24GB GDDR6X', bw: '1,008 GB/s', tflops: '82.6 FP32', price: '~$1,599', use: '消费级最强：个人 QLoRA 微调、推理服务', nvlink: '—', tensor_gen: '4th Gen' },
  { name: 'A100 (80GB)', arch: 'Ampere', cores: '6,912 CUDA / 432 Tensor', vram: '80GB HBM2e', bw: '2,039 GB/s', tflops: '312 TF32', price: '~$15,000', use: '训练主力：70B 模型训练、大规模推理', nvlink: 'NVLink 600 GB/s', tensor_gen: '3rd Gen' },
  { name: 'H100 (SXM)', arch: 'Hopper', cores: '16,896 CUDA / 528 Tensor', vram: '80GB HBM3', bw: '3,350 GB/s', tflops: '990 TF32', price: '~$30,000', use: 'AI 旗舰：万亿参数训练、Transformer Engine', nvlink: 'NVLink 900 GB/s', tensor_gen: '4th Gen' },
  { name: 'H200', arch: 'Hopper+', cores: '同 H100', vram: '141GB HBM3e', bw: '4,800 GB/s', tflops: '同 H100', price: '~$35,000', use: '超大模型：HBM3e 显存翻倍、推理吞吐最强', nvlink: 'NVLink 900 GB/s', tensor_gen: '4th Gen' },
  { name: 'B200', arch: 'Blackwell', cores: '18,432 CUDA / 576 Tensor', vram: '192GB HBM3e', bw: '8,000 GB/s', tflops: '2,250 FP4', price: '~$35,000+', use: '2025 旗舰：FP4 推理、NVLink 1.8TB/s 互联', nvlink: 'NVLink 1,800 GB/s', tensor_gen: '5th Gen' },
];

const PRECISION_FORMATS = [
  { fmt: 'FP32', bits: 32, range: '±3.4×10³⁸', mantissa: 23, color: '#e74c3c', use: '基线精度、梯度累积', perf: '1x' },
  { fmt: 'TF32', bits: 19, range: '±3.4×10³⁸', mantissa: 10, color: '#e67e22', use: 'NVIDIA 默认训练精度（A100+）', perf: '8x vs FP32' },
  { fmt: 'BF16', bits: 16, range: '±3.4×10³⁸', mantissa: 7, color: '#f59e0b', use: '混合精度训练标配', perf: '16x vs FP32' },
  { fmt: 'FP16', bits: 16, range: '±65,504', mantissa: 10, color: '#38bdf8', use: '推理、需注意溢出', perf: '16x vs FP32' },
  { fmt: 'FP8 (E4M3)', bits: 8, range: '±448', mantissa: 3, color: '#a78bfa', use: 'Hopper+ 训练/推理', perf: '32x vs FP32' },
  { fmt: 'FP4', bits: 4, range: '±6', mantissa: 1, color: '#ec4899', use: 'Blackwell 推理专用', perf: '64x vs FP32' },
];

export default function LessonGPUArch() {
  const [gpu, setGpu] = useState(2);
  const g = GPUS[gpu];
  const [showBound, setShowBound] = useState('memory');

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 01 · GPU HARDWARE ARCHITECTURE</div>
        <h1>GPU 硬件架构</h1>
        <p>理解 AI 为什么"烧钱"——答案在硬件里。<strong>一颗 H100 GPU 的 Tensor Core 每秒执行 990 万亿次浮点运算</strong>，是 CPU 的数百倍。但只有理解 SM、内存层级和互联拓扑，才能写出真正利用这些算力的代码。</p>
      </div>

      {/* Section 1: GPU Compute Hierarchy */}
      <div className="ai-section">
        <div className="ai-section-title">🔧 GPU 硬件层级结构</div>
        <div className="ai-card" style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-orange)', marginBottom: '1rem' }}>📐 NVIDIA GPU 三级计算层级</div>
          <div className="ai-steps">
            {[
              { name: 'SM（Streaming Multiprocessor）', desc: 'GPU 的基本计算单元。H100 有 132 个 SM，每个 SM 包含 128 个 CUDA Core + 4 个 Tensor Core。SM 内的线程共享 Shared Memory。SM 是调度的最小粒度——一个 kernel 至少占用一个 SM。', color: '#f97316' },
              { name: 'CUDA Core（标量运算）', desc: '执行 FP32/FP64/INT32 标量运算的基础单元。类似 CPU 的 ALU，但数量极多（H100 有 16,896 个）。每个 CUDA Core 在一个时钟周期内执行一个 FMA（fused multiply-add）运算：a × b + c。', color: '#fbbf24' },
              { name: 'Tensor Core（张量运算）', desc: '专为矩阵乘法设计的加速单元。一个 Tensor Core 在一个时钟周期内执行 4×4 矩阵的 FMA 运算。第 4 代 Tensor Core（Hopper）支持 FP8 精度，一次可计算 16×16×16 的矩阵块。这就是 AI 训练的核心加速器。', color: '#38bdf8' },
              { name: 'Warp（线程束）', desc: 'GPU 的最小执行单位。32 个线程组成一个 Warp，SM 以 Warp 为单位调度。同一 Warp 中的线程执行相同指令（SIMT 架构）。理解 Warp Divergence 是 CUDA 优化的关键。', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} className="ai-step">
                <div className="ai-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--ai-muted)', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture ASCII diagram */}
        <div className="ai-card">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-sky)', marginBottom: '0.75rem' }}>🏗️ H100 GPU 架构概览</div>
          <div className="code-block" style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
{`┌───────────────────────── H100 SXM GPU ─────────────────────────┐
│                                                                 │
│  ┌─── GPC (Graphics Processing Cluster) × 8 ──────────────┐   │
│  │  ┌── TPC (Texture Processing Cluster) × 2 ──────────┐  │   │
│  │  │  ┌── SM (Streaming Multiprocessor) ────────────┐  │  │   │
│  │  │  │  CUDA Cores × 128   Tensor Cores × 4       │  │  │   │
│  │  │  │  Shared Memory: 228KB (可配置)               │  │  │   │
│  │  │  │  Register File: 256KB                       │  │  │   │
│  │  │  │  Warp Schedulers: 4                         │  │  │   │
│  │  │  └─────────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  L2 Cache: 50MB        ←── 所有 SM 共享                        │
│  HBM3: 80GB @ 3,350 GB/s  ←── 主显存，带宽决定推理上限          │
│  NVLink: 900 GB/s × 18 links = 总 900 GB/s 双向                │
│  PCIe Gen5: 128 GB/s    ←── CPU-GPU 通信                       │
└─────────────────────────────────────────────────────────────────┘

Total SMs: 132  |  CUDA Cores: 16,896  |  Tensor Cores: 528`}
          </div>
        </div>
      </div>

      {/* Section 2: Memory Hierarchy */}
      <div className="ai-section">
        <div className="ai-section-title">🗄️ GPU 内存层级</div>
        <div className="ai-card">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-sky)', marginBottom: '1rem' }}>由快到慢的四级存储</div>
          <div className="ai-grid-4">
            {[
              { name: 'Register File', size: '~256KB/SM', lat: '0 cycle', bw: '~20 TB/s', desc: '每个线程私有，最快。H100 总计 33MB 寄存器。', pct: '100%' },
              { name: 'Shared Memory / L1', size: '~228KB/SM', lat: '~20 cycle', bw: '~19 TB/s', desc: 'SM 内线程共享，可编程缓存。CUDA __shared__ 关键字。', pct: '85%' },
              { name: 'L2 Cache', size: '~50MB', lat: '~200 cycle', bw: '~12 TB/s', desc: '全局共享，自动管理。比 A100 的 40MB 提升 25%。', pct: '55%' },
              { name: 'HBM（主显存）', size: '80-192GB', lat: '~400 cycle', bw: '3.35-8 TB/s', desc: '最大但最慢，带宽决定上限。HBM3e 堆叠 12 层。', pct: '25%' },
            ].map((m, i) => (
              <div key={i} className="ai-card" style={{ borderTop: `3px solid ${['#f97316','#fbbf24','#38bdf8','#a78bfa'][i]}`, padding: '0.85rem' }}>
                <div style={{ fontWeight: 700, color: ['#f97316','#fbbf24','#38bdf8','#a78bfa'][i], fontSize: '0.82rem', marginBottom: '0.3rem' }}>{m.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: 'var(--ai-text)', marginBottom: '0.2rem' }}>{m.size}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ai-muted)' }}>延迟：{m.lat} | 带宽: {m.bw}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ai-muted)', marginTop: '0.15rem' }}>{m.desc}</div>
                <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px' }}>
                  <div style={{ width: m.pct, height: '100%', borderRadius: '4px', background: ['#f97316','#fbbf24','#38bdf8','#a78bfa'][i] }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ai-muted)', textAlign: 'right', marginTop: '0.15rem' }}>相对速度: {m.pct}</div>
              </div>
            ))}
          </div>
          <div className="ai-warn">⚠️ <strong>Memory Bandwidth 是 LLM 推理的瓶颈</strong>：大模型推理是"访存密集型"（memory-bound），不是"计算密集型"。所以 HBM 带宽（而非 TFLOPS）决定了推理吞吐量上限。H200 的 4,800 GB/s 比 A100 的 2,039 GB/s 快 2.4 倍 → 推理吞吐量也提升约 2 倍。</div>
        </div>
      </div>

      {/* Section 3: GPU Comparison */}
      <div className="ai-section">
        <div className="ai-section-title">🖥️ 主流 GPU 硬件对比</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {GPUS.map((g2, i) => (
            <button key={i} className={`ai-btn ${gpu === i ? 'active' : ''}`} onClick={() => setGpu(i)}>{g2.name}</button>
          ))}
        </div>
        <div className="ai-card" style={{ borderTop: '3px solid var(--ai-orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--ai-orange)' }}>{g.name}</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <span className="ai-tag sky">{g.arch}</span>
              <span className="ai-tag green">{g.tensor_gen}</span>
            </div>
          </div>
          <div className="ai-grid-3" style={{ marginBottom: '0.75rem' }}>
            {[
              { l: '计算核心', v: g.cores },
              { l: '显存', v: g.vram },
              { l: '带宽', v: g.bw },
              { l: '算力', v: g.tflops },
              { l: 'NVLink', v: g.nvlink },
              { l: '价格', v: g.price },
            ].map((item, i) => (
              <div key={i} style={{ fontSize: '0.83rem' }}>
                <span style={{ color: 'var(--ai-muted)' }}>{item.l}：</span>
                <span style={{ color: 'var(--ai-text)', fontWeight: 600, fontFamily: 'JetBrains Mono,monospace' }}>{item.v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ai-muted)', borderTop: '1px solid var(--ai-border)', paddingTop: '0.6rem' }}>
            <span style={{ color: 'var(--ai-orange)', fontWeight: 700 }}>典型场景：</span>{g.use}
          </div>
        </div>
      </div>

      {/* Section 4: Precision Formats */}
      <div className="ai-section">
        <div className="ai-section-title">🎯 数值精度格式全景</div>
        <div className="ai-card">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-orange)', marginBottom: '1rem' }}>为什么精度格式如此重要？</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ai-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
            AI 模型的每一次矩阵乘法都涉及数十亿次浮点运算。<strong>降低精度 = 更小的数据 = 更快的传输 + 更多的并行计算</strong>。从 FP32 到 FP8，吞吐量提升 32 倍，而模型精度损失可以控制在 1% 以内。
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ai-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ai-text)' }}>格式</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--ai-text)' }}>位宽</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--ai-text)' }}>尾数位</th>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ai-text)' }}>典型用途</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--ai-text)' }}>性能倍率</th>
              </tr>
            </thead>
            <tbody>
              {PRECISION_FORMATS.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: p.color, fontFamily: 'JetBrains Mono,monospace' }}>{p.fmt}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--ai-text)' }}>{p.bits} bit</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--ai-muted)' }}>{p.mantissa}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--ai-muted)' }}>{p.use}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, color: p.color, fontFamily: 'JetBrains Mono,monospace' }}>{p.perf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ai-card" style={{ marginTop: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-sky)', marginBottom: '0.75rem' }}>🔄 混合精度训练工作流</div>
          <div className="code-block" style={{ fontSize: '0.78rem' }}>
{`# PyTorch 混合精度训练（AMP）
import torch
from torch.cuda.amp import autocast, GradScaler

model = MyModel().cuda()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
scaler = GradScaler()  # 防止 FP16 梯度下溢

for batch in dataloader:
    optimizer.zero_grad()
    
    with autocast(dtype=torch.bfloat16):  # 前向用 BF16
        loss = model(batch)               # Tensor Core 加速
    
    scaler.scale(loss).backward()          # 反向梯度 FP32
    scaler.step(optimizer)                 # 参数更新 FP32
    scaler.update()

# 为什么用 BF16 而不是 FP16？
# FP16 范围只有 ±65504 → 大梯度容易溢出（overflow）
# BF16 范围与 FP32 相同 ±3.4e38 → 不需要 Loss Scaling
# 但 BF16 精度只有 7 位尾数 → 需在 FP32 中累积梯度

# Hopper Transformer Engine（自动 FP8）
# 自动在 FP8 前向 + BF16 反向之间切换
import transformer_engine.pytorch as te
linear = te.Linear(4096, 4096, bias=True)  # 自动 FP8`}
          </div>
        </div>
      </div>

      {/* Section 5: Compute vs Memory Bound */}
      <div className="ai-section">
        <div className="ai-section-title">⚡ 计算密集 vs 访存密集分析</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className={`ai-btn ${showBound === 'memory' ? 'active' : ''}`} onClick={() => setShowBound('memory')}>访存密集型</button>
          <button className={`ai-btn ${showBound === 'compute' ? 'active' : ''}`} onClick={() => setShowBound('compute')}>计算密集型</button>
        </div>
        <div className="ai-grid-2">
          <div className="ai-card" style={{ borderTop: `3px solid ${showBound === 'memory' ? '#38bdf8' : '#f97316'}` }}>
            <div style={{ fontWeight: 700, color: showBound === 'memory' ? '#38bdf8' : '#f97316', marginBottom: '0.5rem' }}>
              {showBound === 'memory' ? '📦 访存密集型（Memory-Bound）' : '🔥 计算密集型（Compute-Bound）'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ai-muted)', lineHeight: 1.75 }}>
              {showBound === 'memory'
                ? '瓶颈在 HBM 带宽，计算单元大量闲置等待数据。优化方向是减少显存读写、提升数据局部性。大模型推理的 decode 阶段（逐 token 生成）是典型的 memory-bound。'
                : '瓶颈在 Tensor Core 算力，数据供给充足。优化方向是使用低精度格式、增大 batch size。大模型训练的前向/反向传播是典型的 compute-bound。'}
            </div>
          </div>
          <div className="ai-card">
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ai-text)', marginBottom: '0.75rem' }}>
              关键公式：Arithmetic Intensity
            </div>
            <div className="code-block" style={{ fontSize: '0.78rem' }}>
{`# 算术强度 = FLOPs / Bytes_Moved
# 
# 如果 AI > GPU的算力/带宽比 → 计算密集
# 如果 AI < GPU的算力/带宽比 → 访存密集
#
# H100 分界点:
#   990 TFLOPS (TF32) / 3.35 TB/s = 295 FLOP/Byte
#
# 典型操作的算术强度:
# ┌──────────────┬─────────────┬────────────┐
# │ 操作          │ AI(FLOP/B)  │ 类型       │
# ├──────────────┼─────────────┼────────────┤
# │ 向量加法      │ 0.25        │ Memory     │
# │ Layer Norm   │ ~5          │ Memory     │
# │ Attention    │ ~seq_len    │ Depends    │
# │ GEMM (4K²)  │ ~4096       │ Compute    │
# │ Conv2D       │ ~K²×C_in    │ Compute    │
# └──────────────┴─────────────┴────────────┘
#
# LLM 推理各阶段:
# Prefill (prompt处理): batch × seq_len → Compute-bound
# Decode  (逐token):    batch × 1       → Memory-bound`}
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: NVLink & Interconnect */}
      <div className="ai-section">
        <div className="ai-section-title">🔗 GPU 互联拓扑：NVLink / NVSwitch</div>
        <div className="ai-card">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-orange)', marginBottom: '0.75rem' }}>为什么互联带宽比单卡算力更重要？</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ai-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
            训练 GPT-4 级别模型需要数千张 GPU 协同工作。<strong>模型并行（Tensor/Pipeline Parallelism）需要 GPU 间频繁交换激活值和梯度</strong>，如果互联带宽低于 HBM 带宽，GPU 大量时间在等待通信而非计算——这就是"通信瓶颈"。
          </div>
          <div className="code-block" style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
{`GPU 互联技术演进：

PCIe Gen4:  32 GB/s  ←── 只适合单卡推理
PCIe Gen5:  64 GB/s  ←── CPU ↔ GPU 通信
NVLink 3:  600 GB/s  ←── A100 (12 links × 50 GB/s)
NVLink 4:  900 GB/s  ←── H100 (18 links × 50 GB/s)
NVLink 5: 1800 GB/s  ←── B200 (18 links × 100 GB/s)

┌─── DGX H100 (8x H100) ──────────────────────────┐
│                                                    │
│    GPU0 ←──NVLink──→ GPU1                          │
│      ↑                 ↑                           │
│    NVLink            NVLink      NVSwitch:         │
│      ↓                 ↓         4 个 NVSwitch      │
│    GPU2 ←──NVLink──→ GPU3       提供全连接拓扑      │
│      ...同理 GPU4-7...           任意 GPU 对间      │
│                                  900 GB/s 带宽      │
│                                                    │
│  节点间互联: 8× InfiniBand 400Gb = 400 GB/s        │
│  存储: 共享 NVMe SSD，30TB+                         │
└────────────────────────────────────────────────────┘

超大规模集群拓扑 (DGX SuperPOD):
  32 × DGX H100 = 256 GPU = 1 SuperPOD
  多个 SuperPOD 通过 InfiniBand 互联
  Meta 训练 LLaMA-3: 16,384 × H100 = ~64 SuperPODs`}
          </div>
        </div>

        <div className="ai-card" style={{ marginTop: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-sky)', marginBottom: '0.75rem' }}>📊 并行策略与互联需求</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ai-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ai-text)' }}>并行策略</th>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ai-text)' }}>通信内容</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--ai-text)' }}>带宽需求</th>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ai-text)' }}>推荐互联</th>
              </tr>
            </thead>
            <tbody>
              {[
                { strat: 'Data Parallel (DDP)', comm: '梯度 AllReduce', bw: '中', link: 'NVLink / InfiniBand' },
                { strat: 'Tensor Parallel (TP)', comm: '每层激活值 AllReduce', bw: '极高', link: '必须 NVLink（节点内）' },
                { strat: 'Pipeline Parallel (PP)', comm: '层间激活值 P2P', bw: '低', link: 'InfiniBand 即可' },
                { strat: 'FSDP / ZeRO-3', comm: '参数 AllGather + 梯度 ReduceScatter', bw: '高', link: 'NVLink + InfiniBand' },
                { strat: 'Expert Parallel (MoE)', comm: 'All-to-All token 路由', bw: '高', link: 'NVLink + NVSwitch' },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--ai-text)', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem' }}>{r.strat}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--ai-muted)' }}>{r.comm}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, color: r.bw === '极高' ? '#e74c3c' : r.bw === '高' ? '#e67e22' : r.bw === '中' ? '#f59e0b' : '#2ecc71' }}>{r.bw}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--ai-muted)', fontSize: '0.78rem' }}>{r.link}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 7: CUDA Execution Model */}
      <div className="ai-section">
        <div className="ai-section-title">⚙️ CUDA 执行模型核心概念</div>
        <div className="ai-card">
          <div className="code-block" style={{ fontSize: '0.78rem' }}>
{`# CUDA 线程层级：Grid → Block → Thread
# 
#   Grid (1 kernel launch)
#   ├── Block (0,0)  ←── 映射到 1 个 SM
#   │   ├── Thread (0,0) ... Thread (0,255)
#   │   └── Shared Memory: Block 内共享
#   ├── Block (1,0)
#   │   ├── Thread (0,0) ... Thread (0,255)
#   │   └── ...
#   └── Block (N,M)
#
# 关键配置:
#   Block Size: 通常 128 或 256 线程（Warp 的整数倍）
#   Grid Size: ceil(total_elements / block_size)
#
# 性能关键点:
#   1. Occupancy（占用率）: 活跃 Warps / SM 最大 Warps
#      - 目标: > 50%，但并非越高越好
#      - 受限于: 寄存器使用量、Shared Memory 大小
#   
#   2. Memory Coalescing（合并访存）:
#      - 同一 Warp 的 32 个线程访问连续地址 → 合并为 1 次事务
#      - 非连续访问 → 拆分为多次事务，带宽浪费 32 倍
#
#   3. Bank Conflict（Shared Memory）:
#      - Shared Memory 分 32 个 Bank
#      - 同一 Warp 中多个线程访问同一 Bank → 串行化
#      - 解决：padding 或 swizzle

# PyTorch 中的 CUDA 优化示例
import torch

# 1. 内存格式优化 (Channels Last)
x = torch.randn(32, 3, 224, 224, device='cuda')
x = x.to(memory_format=torch.channels_last)  # NHWC → Tensor Core 更友好

# 2. CUDA Graph（消除 kernel launch 开销）
g = torch.cuda.CUDAGraph()
with torch.cuda.graph(g):
    y = model(static_input)  # 录制
g.replay()                    # 重放，零 launch 开销

# 3. torch.compile（自动融合 + 优化）
model = torch.compile(model, mode='max-autotune')  # 2.0+`}
          </div>
        </div>
      </div>

      {/* Section 8: GPU Selection Decision Tree */}
      <div className="ai-section">
        <div className="ai-section-title">🎯 GPU 选型决策树</div>
        <div className="ai-grid-2">
          {[
            { scenario: '个人学习 / PoC 验证', gpu: 'RTX 4090 × 1-2', budget: '$1.5K-3K', reason: '24GB 足够 7B QLoRA，性价比最高', color: '#2ecc71' },
            { scenario: '中小团队推理服务', gpu: 'L4 / L40S × 2-4', budget: '$5K-20K', reason: '高能效比，TensorRT 推理优化好', color: '#38bdf8' },
            { scenario: '70B+ 模型训练', gpu: 'A100 80GB × 8', budget: '~$120K', reason: 'NVLink 全连接，完整的 Megatron 生态', color: '#f59e0b' },
            { scenario: '千亿参数训练', gpu: 'H100/H200 × 256+', budget: '$3M+', reason: 'NVSwitch + InfiniBand，支持 4D 并行', color: '#e67e22' },
            { scenario: '推理吞吐优先', gpu: 'H200 / B200', budget: '$35K+/卡', reason: 'HBM3e 超大带宽，Memory-bound 场景制胜', color: '#a78bfa' },
            { scenario: '云端按需', gpu: 'AWS p5 / GCP a3', budget: '$2-4/GPU·hr', reason: '无需硬件运维，弹性扩缩容', color: '#ec4899' },
          ].map((s, i) => (
            <div key={i} className="ai-card" style={{ borderLeft: `3px solid ${s.color}`, padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem' }}>{s.scenario}</div>
                <span className="ai-tag" style={{ background: `${s.color}18`, color: s.color }}>{s.budget}</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.82rem', color: 'var(--ai-text)', marginBottom: '0.3rem' }}>{s.gpu}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ai-muted)' }}>{s.reason}</div>
            </div>
          ))}
        </div>
        <div className="ai-warn" style={{ marginTop: '0.75rem' }}>
          💡 <strong>成本经验法则</strong>：租用 H100 的云成本约 $2-3/hr。训练一个 70B 模型需要 ~1,000 GPU-hours ≈ $2,000-3,000。部署推理服务的长期 TCO 中，30% 是硬件折旧，40% 是电费+冷却，30% 是运维人力。
        </div>
      </div>
    </div>
  );
}
