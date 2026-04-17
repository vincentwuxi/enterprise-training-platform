import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'tensor-parallel', title: 'Tensor Parallelism', icon: '🔀' },
  { id: 'pipeline-parallel', title: 'Pipeline Parallelism', icon: '🔗' },
  { id: 'multi-node', title: '多机推理', icon: '🌐' },
  { id: 'disaggregated', title: 'Disaggregated Inference', icon: '🧩' },
];

export default function LessonDistributedInference() {
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
        {active === 'tensor-parallel' && <TPSection />}
        {active === 'pipeline-parallel' && <PPSection />}
        {active === 'multi-node' && <MultiNodeSection />}
        {active === 'disaggregated' && <DisaggregatedSection />}
      </div>
    </div>
  );
}

function TPSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔀</span>Tensor Parallelism — 层内切分</h2>
      <p className="section-desc">Tensor Parallelism (TP) 将每一层的矩阵乘法 <strong>沿列或行切分到多个 GPU</strong>，每个 GPU 计算部分结果后通过 AllReduce 同步。推理中最常用的并行策略。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>TP 切分方式</h3>
          <div className="code-block">
{`Tensor Parallelism (以 Linear 层为例)

原始: Y = XW + b,  W ∈ R^{d_in × d_out}

Column Parallel (列切分):
  W = [W₁ | W₂ | W₃ | W₄]   (TP=4)
  GPU0: Y₀ = X @ W₀          d_out/4
  GPU1: Y₁ = X @ W₁          d_out/4
  GPU2: Y₂ = X @ W₂          d_out/4  
  GPU3: Y₃ = X @ W₃          d_out/4
  → Y = [Y₀, Y₁, Y₂, Y₃]   AllGather

Row Parallel (行切分):
  W = [W₀; W₁; W₂; W₃]      (TP=4)
  GPU0: Y₀ = X₀ @ W₀         局部结果
  GPU1: Y₁ = X₁ @ W₁         局部结果
  → Y = Y₀ + Y₁ + Y₂ + Y₃   AllReduce

Transformer 层中的 TP:
┌──────────────────────────────┐
│  QKV Projection → Column TP  │
│  O Projection   → Row TP     │
│  FFN Up/Gate    → Column TP  │
│  FFN Down       → Row TP     │
│  每层 2 次 AllReduce          │
└──────────────────────────────┘`}
          </div>
        </div>

        <div className="info-card">
          <h3>TP 通信开销分析</h3>
          <table className="data-table">
            <thead>
              <tr><th>TP Size</th><th>单卡显存</th><th>AllReduce</th><th>NVLink 延迟</th><th>适用性</th></tr>
            </thead>
            <tbody>
              <tr><td>TP=1</td><td>140 GB (70B FP16)</td><td>0</td><td>0</td><td>8B 以下</td></tr>
              <tr><td>TP=2</td><td>70 GB</td><td>2×/layer</td><td>~10μs</td><td>70B FP16</td></tr>
              <tr><td>TP=4</td><td>35 GB</td><td>2×/layer</td><td>~20μs</td><td>70B INT4 或 405B</td></tr>
              <tr><td>TP=8</td><td>17.5 GB</td><td>2×/layer</td><td>~40μs</td><td>405B FP16</td></tr>
            </tbody>
          </table>
          <div className="best-practice" style={{marginTop: '1rem'}}>
            <h4>⚠️ 关键约束</h4>
            <ul>
              <li>TP 要求 <strong>NVLink 高速互联</strong>，PCIe 会成为瓶颈</li>
              <li>TP Size ≤ 单机 GPU 数量 (通常 ≤ 8)</li>
              <li>num_attention_heads 必须能被 TP Size 整除</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function PPSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔗</span>Pipeline Parallelism — 层间切分</h2>
      <p className="section-desc">Pipeline Parallelism (PP) 将不同的 Transformer 层分配到不同的 GPU。通信量远小于 TP，<strong>适合跨机器部署</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>PP 层分配</h3>
          <div className="code-block">
{`Pipeline Parallelism (Llama-3-70B, 80 layers)

PP=4 (4 个 Stage):
┌─────────────┐   ┌─────────────┐
│   GPU 0     │   │   GPU 1     │
│ Layer 0-19  │──→│ Layer 20-39 │
│ (20 layers) │   │ (20 layers) │
└─────────────┘   └─────────────┘
                        │
┌─────────────┐   ┌─────────────┐
│   GPU 3     │   │   GPU 2     │
│ Layer 60-79 │←──│ Layer 40-59 │
│ + LM Head   │   │ (20 layers) │
└─────────────┘   └─────────────┘

通信: 只需传递 hidden_states
  每个 stage boundary: 
  hidden_size × batch × seq_len × dtype_size
  = 8192 × 1 × 1 × 2 = 16KB per token (极小!)

推理 Pipeline:
  Prefill:  
    GPU0→GPU1→GPU2→GPU3 (串行, 有 bubble)
  Decode:
    所有 GPU 同时工作 (micro-batch 填充)`}
          </div>
        </div>

        <div className="info-card">
          <h3>TP + PP 混合并行</h3>
          <div className="code-block">
{`# 大模型推理的标准配置:
# TP 处理单机内, PP 处理跨机器

# Llama-3-405B 部署方案:
# 方案 A: 4 节点 × 8 GPU (32 GPUs)
#   TP=8 (节点内), PP=4 (跨节点)
#   每 GPU: 405B / 32 = ~12.6GB (FP16)

# 方案 B: 2 节点 × 8 GPU (16 GPUs)
#   TP=8 (节点内), PP=2 (跨节点)  
#   每 GPU: 405B / 16 = ~25.3GB (FP16)

# 方案 C: 1 节点 × 8 GPU (8 GPUs)
#   TP=8, PP=1
#   INT4 量化: 405B / 4 / 8 = ~12.6GB ✅

# vLLM 配置:
vllm serve meta-llama/Llama-3-405B \\
  --tensor-parallel-size 8 \\
  --pipeline-parallel-size 4 \\
  --distributed-executor-backend ray`}
          </div>
        </div>
      </div>
    </section>
  );
}

function MultiNodeSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🌐</span>多机推理部署</h2>
      <p className="section-desc">超大模型 (405B+) 无法装入单机，需要多机协同。关键挑战是 <strong>跨机通信延迟</strong> 和 <strong>集群调度</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>多机通信拓扑</h3>
          <div className="code-block">
{`单机内通信:
  NVLink 4.0: 900 GB/s (双向)
  NVSwitch:   所有 GPU 全连接
  → TP 通信无瓶颈

跨机通信:
  InfiniBand HDR:  200 Gbps (25 GB/s)
  InfiniBand NDR:  400 Gbps (50 GB/s)  
  RoCE v2:         100-400 Gbps
  → PP 通信可接受 (数据量小)
  → TP 跨机通常不可接受!

最佳实践:
┌─────── Node 0 ────────┐  ┌─────── Node 1 ────────┐
│ GPU0 ←NVLink→ GPU1    │  │ GPU4 ←NVLink→ GPU5    │
│ GPU2 ←NVLink→ GPU3    │  │ GPU6 ←NVLink→ GPU7    │
│ TP=4 (节点内)          │  │ TP=4 (节点内)          │
│ PP Stage 0            │  │ PP Stage 1            │
└───────┬───────────────┘  └───────┬───────────────┘
        │         InfiniBand        │
        └──────────────────────────┘
        PP 通信 (~16KB/token) OK ✅`}
          </div>
        </div>

        <div className="info-card">
          <h3>Ray + vLLM 多机部署</h3>
          <div className="code-block">
{`# 1. 启动 Ray Head节点
ray start --head --port=6379

# 2. Worker 节点加入
ray start --address=head-ip:6379

# 3. vLLM 多机启动
vllm serve meta-llama/Llama-3-405B \\
  --tensor-parallel-size 8 \\
  --pipeline-parallel-size 2 \\
  --distributed-executor-backend ray

# 4. Kubernetes + Ray 生产化
# KubeRay Operator 管理 Ray Cluster
# 自动扩缩容 + 故障恢复
apiVersion: ray.io/v1
kind: RayService
metadata:
  name: vllm-service
spec:
  rayClusterConfig:
    headGroupSpec:
      replicas: 1
      resources:
        nvidia.com/gpu: 8
    workerGroupSpecs:
      - replicas: 1
        resources:
          nvidia.com/gpu: 8`}
          </div>
        </div>
      </div>
    </section>
  );
}

function DisaggregatedSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🧩</span>Disaggregated Inference — 分离式推理</h2>
      <p className="section-desc">将 <strong>Prefill (计算密集) 和 Decode (内存密集)</strong> 分离到不同的 GPU 池，各自独立扩缩容，是推理架构的前沿演进。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>分离式架构</h3>
          <div className="code-block">
{`传统架构 (Colocated):
┌──────────────────┐
│    GPU Pool       │
│  Prefill + Decode │  ← 同一 GPU 交替执行
│  → 相互干扰       │  ← Prefill 阻塞 Decode
└──────────────────┘

分离式架构 (Disaggregated):
┌──────────────────┐   ┌──────────────────┐
│  Prefill Pool     │   │  Decode Pool      │
│  Compute-Bound    │   │  Memory-Bound     │
│  高算力 GPU       │   │  高带宽/大显存 GPU│
│  (H100 SXM)      │   │  (H200/A100)     │
│  → 大 batch prefill│  │  → 大并发 decode  │
└────────┬─────────┘   └────────┬─────────┘
         │    KV Cache Transfer  │
         └──────────────────────┘
              via RDMA / NVLink

优势:
✓ Prefill 不再阻塞 Decode → TPOT 更稳定
✓ 各自独立扩缩容 → 成本最优
✓ 异构硬件 → 对症下药
✗ KV Cache 传输有延迟 → 需高速网络`}
          </div>
        </div>

        <div className="info-card">
          <h3>DistServe / Splitwise 论文实践</h3>
          <div className="code-block">
{`# DistServe (OSDI'24) 核心思想:
# 1. Profiler: 分析工作负载特征
#    - 平均 input_len / output_len
#    - 请求到达率 (QPS)
#    - SLA 要求 (TTFT / TPOT)
#
# 2. Planner: 最优资源配比
#    - Prefill GPU 数量
#    - Decode GPU 数量
#    - TP/PP 配置
#
# 3. 结果:
#    vs Colocated vLLM:
#    ┌──────────────────────────────┐
#    │ 指标         │ 提升          │
#    ├──────────────┼───────────────┤
#    │ Throughput   │ +60%          │
#    │ P99 TTFT     │ -40%          │
#    │ P99 TPOT     │ -70%          │
#    │ GPU 成本     │ -30%          │
#    └──────────────┴───────────────┘

# Mooncake (月之暗面):
# KV Cache 通过 RDMA 传输
# P2P 直连, 延迟 < 1ms`}
          </div>
        </div>
      </div>
    </section>
  );
}
