import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'gpu-arch', title: 'GPU / NPU 架构', icon: '🔲' },
  { id: 'compute-graph', title: '计算图优化', icon: '📊' },
  { id: 'memory', title: '内存层次与带宽', icon: '🧠' },
  { id: 'roofline', title: 'Roofline 分析', icon: '📐' },
];

export default function LessonInferenceFoundations() {
  const [active, setActive] = useState(sections[0].id);
  return (
    <div className="lesson-page">
      <div className="lesson-tabs">
        {sections.map(s => (
          <button key={s.id} className={`lesson-tab ${active === s.id ? 'active' : ''}`} onClick={() => setActive(s.id)}>
            <span className="tab-icon">{s.icon}</span>{s.title}
          </button>
        ))}
      </div>
      <div className="lesson-content">
        {active === 'gpu-arch' && <GPUArchSection />}
        {active === 'compute-graph' && <ComputeGraphSection />}
        {active === 'memory' && <MemorySection />}
        {active === 'roofline' && <RooflineSection />}
      </div>
    </div>
  );
}

/* ─── sections ─── */
function GPUArchSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔲</span>GPU / NPU 架构深度解析</h2>
      <p className="section-desc">理解推理硬件的微架构是优化的第一步。不同硬件的 <strong>计算单元 (SM / Core)</strong>、<strong>内存层次 (HBM / SRAM / L2)</strong> 和 <strong>互联拓扑 (NVLink / PCIe)</strong> 决定了推理的天花板。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>NVIDIA GPU 架构演进</h3>
          <div className="code-block">
{`┌───────────────────────────────────────┐
│           GPU Architecture Timeline    │
├──────────┬──────────┬────────┬────────┤
│  Ampere  │  Hopper  │ Ada    │Blackwell│
│  A100    │  H100    │ L40S   │ B200   │
├──────────┼──────────┼────────┼────────┤
│ FP16:    │ FP16:    │ FP16:  │ FP16:  │
│ 312 TFLOPS│ 989 TFLOPS│ 362T │ 2.25 PFLOPS│
│ INT8:    │ FP8:     │ FP8:   │ FP8:   │
│ 624 TOPS │ 1979 TOPS │ 724T │ 4.5 PFLOPS│
├──────────┼──────────┼────────┼────────┤
│ HBM2e    │ HBM3     │ GDDR6X│ HBM3e  │
│ 80GB     │ 80GB     │ 48GB  │ 192GB  │
│ 2.0 TB/s │ 3.35 TB/s│ 864GB/s│ 8 TB/s│
└──────────┴──────────┴────────┴────────┘`}
          </div>
        </div>

        <div className="info-card">
          <h3>SM (Streaming Multiprocessor) 内部结构</h3>
          <div className="code-block">
{`┌─────────────────────────────┐
│         SM (H100)           │
│  ┌─────────────────────┐    │
│  │  128 FP32 Cores     │    │
│  │  64  FP64 Cores     │    │
│  │  4th Gen Tensor Core│    │
│  │   → FP8/FP16/TF32   │    │
│  └─────────────────────┘    │
│  ┌──────┐  ┌──────┐         │
│  │ L1$  │  │ Shared│        │
│  │ 256KB│  │ Mem   │        │
│  │      │  │ 228KB │        │
│  └──────┘  └──────┘         │
│  Warp Scheduler × 4         │
│  Dispatch Unit  × 4         │
└─────────────────────────────┘

H100: 132 SMs, 16896 CUDA Cores
Tensor Cores: 528 (4th Gen)`}
          </div>
        </div>

        <div className="info-card">
          <h3>NPU / ASIC 对比</h3>
          <table className="data-table">
            <thead>
              <tr><th>硬件</th><th>架构</th><th>INT8 算力</th><th>功耗</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>Google TPU v5p</td><td>Systolic Array</td><td>459 TOPS</td><td>~250W</td><td>Training + Inference</td></tr>
              <tr><td>Groq LPU</td><td>TSP (SRAM-only)</td><td>750 TOPS</td><td>~300W</td><td>低延迟推理</td></tr>
              <tr><td>华为 Ascend 910B</td><td>DaVinci Core</td><td>640 TOPS</td><td>~310W</td><td>国产替代</td></tr>
              <tr><td>Apple M4 Neural</td><td>Neural Engine</td><td>38 TOPS</td><td>~10W</td><td>端侧推理</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 关键洞察</h4>
        <ul>
          <li><strong>Tensor Core 是推理加速的核心</strong> — FP8 比 FP16 快 2×，但需要模型支持</li>
          <li><strong>HBM 带宽 ≫ 计算瓶颈</strong> — LLM 推理主要受 Memory-Bound 限制</li>
          <li><strong>Batch Size 决定利用率</strong> — 过小的 BS 无法填满 SM，算力浪费</li>
        </ul>
      </div>
    </section>
  );
}

function ComputeGraphSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📊</span>计算图优化</h2>
      <p className="section-desc">从 PyTorch 的 Eager 模式到生产级的 <strong>编译优化 (torch.compile / TorchScript / ONNX)</strong>，计算图优化可以带来 2-5× 的推理加速。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>图优化流水线</h3>
          <div className="code-block">
{`PyTorch Model (Eager Mode)
    │
    ▼ torch.export / torch.jit.trace
┌─────────────────────┐
│  IR (中间表示)        │
│  FX Graph / TorchScript │
└──────────┬──────────┘
           │ Graph Passes
           ▼
┌─────────────────────┐
│  优化 Pass:          │
│  ✓ 算子融合 (Fusion) │
│  ✓ 常量折叠          │
│  ✓ 死代码消除        │
│  ✓ 内存规划          │
│  ✓ Layout 转换       │
└──────────┬──────────┘
           │ Lowering
           ▼
┌─────────────────────┐
│  Backend Codegen     │
│  CUDA / TensorRT     │
│  / Triton Kernels    │
└─────────────────────┘`}
          </div>
        </div>

        <div className="info-card">
          <h3>torch.compile 实战</h3>
          <div className="code-block">
{`import torch

# 1. 基础编译 — 开箱即用的加速
model = MyModel().cuda().eval()
compiled = torch.compile(model, mode="reduce-overhead")

# 2. 指定后端
compiled_max = torch.compile(
    model,
    backend="inductor",      # Triton codegen
    mode="max-autotune",     # 最大优化幅度
    fullgraph=True,          # 强制全图编译
)

# 3. 动态 shape 支持
compiled_dyn = torch.compile(
    model,
    dynamic=True,            # 支持变长输入
)

# 4. 性能对比
with torch.no_grad():
    # Eager: ~45ms  →  Compiled: ~12ms (3.7×)
    out = compiled(input_tensor)`}
          </div>
        </div>

        <div className="info-card">
          <h3>算子融合 (Kernel Fusion)</h3>
          <div className="code-block">
{`# 融合前: 3 次 kernel launch + 3 次 HBM 读写
x = linear(input)       # kernel 1: GEMM
x = layer_norm(x)       # kernel 2: LN
x = gelu(x)             # kernel 3: GELU

# 融合后: 1 次 kernel launch + 1 次 HBM 读写
x = fused_linear_ln_gelu(input)  # single kernel

# 加速原理:
# ┌─────────────────────────┐
# │ HBM → SRAM → Compute   │ ← 减少 HBM ↔ SRAM
# │          ↓              │    数据搬运次数
# │ SRAM → Compute          │
# │          ↓              │
# │ Compute → SRAM → HBM   │
# └─────────────────────────┘
# Memory-Bound 场景融合收益 > 2×`}
          </div>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 实战建议</h4>
        <ul>
          <li><code>torch.compile(mode="max-autotune")</code> 首次编译慢 (30s+)，但稳态推理显著加速</li>
          <li>ONNX 导出后用 <code>onnxruntime.transformers.optimizer</code> 做图优化</li>
          <li>FlashAttention 本质也是算子融合 — 将 QKV matmul + softmax + dropout 融合为单 kernel</li>
        </ul>
      </div>
    </section>
  );
}

function MemorySection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🧠</span>内存层次与带宽瓶颈</h2>
      <p className="section-desc">LLM 推理的 <strong>Decode 阶段</strong> 是典型的 <strong>Memory-Bound</strong> 问题：每个 token 生成需要读取全部模型权重，但只做少量计算。理解内存层次是优化的基础。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>GPU 内存层次金字塔</h3>
          <div className="code-block">
{`          ┌──────────┐
          │ Register │  ← 最快: ~TB/s
          │  ~256KB  │     延迟: ~1 cycle
          ├──────────┤
          │ L1 Cache │  ← 极快: ~19TB/s
          │ / Shared │     延迟: ~28 cycles
          │  ~256KB  │     (per SM)
          ├──────────┤
          │ L2 Cache │  ← 快: ~12TB/s
          │   50MB   │     延迟: ~200 cycles
          ├──────────┤
       ┌──┴──────────┴──┐
       │      HBM3       │  ← 慢: ~3.35TB/s
       │      80GB       │     延迟: ~400 cycles
       └────────┬────────┘
                │ PCIe 5.0 / NVLink
       ┌────────┴────────┐
       │    Host DRAM     │  ← 极慢: ~64GB/s
       │    512GB+        │     延迟: ~10K cycles
       └─────────────────┘

关键: LLM Decode 阶段的算术强度 < 1
→ 瓶颈在 HBM 带宽，不在计算`}
          </div>
        </div>

        <div className="info-card">
          <h3>LLM 推理内存占用分析</h3>
          <div className="code-block">
{`# Llama-3-70B 推理内存估算

Model Weights (FP16):
  70B params × 2 bytes = 140 GB
  → 需要 2× H100 (80GB each)

KV Cache (per request):
  layers: 80
  heads:  64 (8 KV heads, GQA)
  head_dim: 128
  seq_len: 4096
  
  KV per layer = 2 × 8 × 128 × 4096 × 2B
              = 16 MB per layer
  Total KV = 80 × 16 MB = 1.28 GB / request

Batch=32 的 KV Cache:
  32 × 1.28 GB = 40.96 GB  ← 巨大!

# 内存分配比例
┌────────────────────────┐
│ Model Weights:  140 GB │  ████████████████  70%
│ KV Cache (bs32):  41 GB│  ██████           20%
│ Activations:     10 GB │  ██                5%
│ Framework:       10 GB │  ██                5%
└────────────────────────┘
  Total: ~201 GB (3× H100 with TP)`}
          </div>
        </div>

        <div className="info-card">
          <h3>带宽 vs 算力: Arithmetic Intensity</h3>
          <table className="data-table">
            <thead>
              <tr><th>推理阶段</th><th>计算量</th><th>内存读取</th><th>算术强度</th><th>瓶颈</th></tr>
            </thead>
            <tbody>
              <tr><td>Prefill (bs=1, seq=2048)</td><td>~280 TFLOP</td><td>~140 GB</td><td>~2000</td><td>Compute-Bound ✅</td></tr>
              <tr><td>Decode (bs=1, 1 token)</td><td>~140 GFLOP</td><td>~140 GB</td><td>~1</td><td>Memory-Bound ❌</td></tr>
              <tr><td>Decode (bs=32, 1 token)</td><td>~4.5 TFLOP</td><td>~140 GB</td><td>~32</td><td>接近平衡 ⚖️</td></tr>
              <tr><td>Decode (bs=256)</td><td>~36 TFLOP</td><td>~140 GB</td><td>~256</td><td>Compute-Bound ✅</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 核心结论</h4>
        <ul>
          <li><strong>增大 Batch Size</strong> 是最简单有效的方法 — 将 Decode 从 Memory-Bound 拉向 Compute-Bound</li>
          <li><strong>量化 (INT4/INT8)</strong> 直接减少权重读取量，等效提升带宽利用</li>
          <li><strong>KV Cache 是内存杀手</strong> — PagedAttention 通过虚拟内存管理解决碎片化</li>
        </ul>
      </div>
    </section>
  );
}

function RooflineSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📐</span>Roofline 模型分析</h2>
      <p className="section-desc"><strong>Roofline Model</strong> 是分析推理性能瓶颈的黄金工具：通过算术强度 (Operational Intensity) 判断工作负载是 <strong>Compute-Bound</strong> 还是 <strong>Memory-Bound</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Roofline 图解</h3>
          <div className="code-block">
{`Performance (TFLOPS)
    │
 989├─────────────────────────────── ← H100 FP16 Peak
    │                              /
    │                            /
    │                          /  ← Memory Bandwidth
    │                        /       Ceiling (3.35 TB/s)
    │                      /
    │                    /
    │                  /
    │  ★ Decode     /    ★ Prefill
    │  (bs=1)     /      (bs=1)
    │           /
    │         /  ★ Decode (bs=64)
    │       /
    │     /
    │   /
    │ /
    └────────────────────────────── AI (FLOP/Byte)
    0  1  10   100   295  1000

Ridge Point = Peak FLOPS / BW
H100: 989 / 3.35 = 295 FLOP/Byte

如果 AI < 295 → Memory-Bound
如果 AI > 295 → Compute-Bound`}
          </div>
        </div>

        <div className="info-card">
          <h3>用 Nsight 做 Profiling</h3>
          <div className="code-block">
{`# 1. 收集 GPU Kernel 性能数据
ncu --set full \\
    --target-processes all \\
    --output profile_report \\
    python inference.py

# 2. 关键指标
┌──────────────────────────────────┐
│  Kernel: flash_attn_fwd          │
│  Duration:     1.23 ms           │
│  SM Occupancy: 87.5%             │
│  Compute (SM): 78.2%   ← 高利用 │
│  Memory (L2):  92.1%   ← 几乎满 │
│  DRAM BW:      3.1 TB/s (93%)   │
│  Arithmetic Intensity: 42.3     │
│  → Memory-Bound                  │
└──────────────────────────────────┘

# 3. nsys 时间线分析
nsys profile --trace=cuda,osrt \\
    --output timeline \\
    python inference.py

# 查找: kernel launch 间隙、CPU-GPU 同步点、
#       数据传输瓶颈`}
          </div>
        </div>

        <div className="info-card">
          <h3>优化决策树</h3>
          <div className="code-block">
{`推理性能不达标?
    │
    ├── Profiling: 是 Memory-Bound?
    │   ├── Yes
    │   │   ├── 增大 Batch Size
    │   │   ├── 量化 (FP16 → INT8 → INT4)
    │   │   ├── KV Cache 优化
    │   │   ├── 算子融合减少 HBM 访问
    │   │   └── Flash Attention
    │   │
    │   └── No (Compute-Bound)
    │       ├── 使用 Tensor Core (FP8)
    │       ├── 分布式推理 (TP)
    │       ├── 剪枝 / 稀疏化
    │       └── 升级硬件 (A100 → H100)
    │
    └── Profiling: 是 Launch-Bound?
        ├── Yes → CUDA Graph
        └── Yes → torch.compile(reduce-overhead)`}
          </div>
        </div>
      </div>
    </section>
  );
}
