import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'paged', title: 'PagedAttention', icon: '📄' },
  { id: 'batching', title: 'Continuous Batching', icon: '📦' },
  { id: 'speculative', title: 'Speculative Decoding', icon: '🔮' },
  { id: 'advanced', title: '高级优化', icon: '🧬' },
];

export default function LessonKVCacheOptimization() {
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
        {active === 'paged' && <PagedSection />}
        {active === 'batching' && <BatchingSection />}
        {active === 'speculative' && <SpeculativeSection />}
        {active === 'advanced' && <AdvancedSection />}
      </div>
    </div>
  );
}

function PagedSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📄</span>PagedAttention — KV Cache 虚拟内存</h2>
      <p className="section-desc">传统 KV Cache 为每个请求预分配连续内存块，导致 <strong>60-80% 内存浪费</strong>（内部碎片 + 预留碎片）。PagedAttention 借鉴 OS 虚拟内存分页思想，彻底解决此问题。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>传统 vs PagedAttention</h3>
          <div className="code-block">
{`传统 KV Cache 分配:
┌──────────────────────────────────┐
│ Request A: max_len=2048          │
│ [████████░░░░░░░░░░░░░░░░░░░░░░]│
│  实际用512  预留1536 (75% 浪费)  │
│                                  │
│ Request B: max_len=2048          │
│ [████████████░░░░░░░░░░░░░░░░░░]│
│  实际用1024 预留1024 (50% 浪费)  │
└──────────────────────────────────┘
→ 平均内存利用率仅 20-40%

PagedAttention:
┌─────────────────────────────────┐
│ Block Table (逻辑→物理映射)      │
│ Request A: [B0,B1,B2,B3]        │
│ Request B: [B4,B5,B6,B7,B8,B9]  │
│                                  │
│ Physical Blocks (不连续分配):    │
│ [B0][B4][B1][B5][B2][B6][B3]... │
│  ↑每个 Block = 16 tokens 的 KV  │
│  ↑按需分配，用多少分多少         │
└─────────────────────────────────┘
→ 内存利用率 > 95%
→ 相同 GPU 可服务 2-4× 并发`}
          </div>
        </div>

        <div className="info-card">
          <h3>PagedAttention 实现细节</h3>
          <div className="code-block">
{`# PagedAttention 核心数据结构

class BlockManager:
    block_size: int = 16      # 每个 block 存 16 tokens
    num_gpu_blocks: int       # GPU 上的总 block 数
    block_tables: Dict[int, List[int]]  # seq_id → blocks

# 工作流程:
# 1. 新请求到达 → 分配 1 个 block
# 2. 生成 token → 写入当前 block
# 3. Block 满了 → 分配新 block
# 4. 请求结束 → 释放所有 block → 回收

# KV Cache 内存计算:
# Llama-3-70B (GQA, 8 KV heads):
#   Per block = 16 tokens × 80 layers ×
#               8 heads × 128 dim × 2(K+V) ×
#               2 bytes(FP16)
#            = 5.12 MB per block
#
# H100 80GB, 模型占 70GB:
#   可用 = 10 GB → ~1950 blocks
#   → 支持 ~31K tokens 的 KV Cache

# Prefix Sharing (前缀共享):
# 相同 system prompt → 共享 KV blocks
# Copy-on-Write: 只在修改时复制
┌────────────┐
│ Prompt KV  │ ← 共享 (引用计数)
└──┬─────┬───┘
   │     │
 Req A  Req B  ← 各自的 decode blocks`}
          </div>
        </div>

        <div className="info-card">
          <h3>KV Cache 压缩技术</h3>
          <table className="data-table">
            <thead>
              <tr><th>技术</th><th>压缩比</th><th>精度影响</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>FP8 KV Cache</td><td>2×</td><td>极小</td><td>H100/H200</td></tr>
              <tr><td>INT4 KV Cache (KVQuant)</td><td>4×</td><td>小</td><td>长上下文</td></tr>
              <tr><td>GQA (Grouped Query)</td><td>4-8×</td><td>模型已适配</td><td>所有 Llama-3</td></tr>
              <tr><td>MQA (Multi-Query)</td><td>32-64×</td><td>模型已适配</td><td>Falcon/CodeGen</td></tr>
              <tr><td>Sliding Window</td><td>可变</td><td>丢弃远距离</td><td>Mistral</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function BatchingSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📦</span>Continuous Batching — 动态批处理</h2>
      <p className="section-desc">传统 Static Batching 需要等所有请求都生成完才能处理下一批。Continuous Batching 允许 <strong>已完成的请求立即释放、新请求立即加入</strong>，GPU 利用率提升 10-20×。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Static vs Continuous Batching</h3>
          <div className="code-block">
{`Static Batching (传统方式):
Time→  t1  t2  t3  t4  t5  t6  t7  t8
Req A: [P] [D] [D] [D] [D] [✓] [░] [░]
Req B: [P] [D] [D] [D] [D] [D] [D] [✓]
Req C: [等待...                        ]
       ↑ Req A 已完成但必须等 Req B
       → GPU 空转 25%

Continuous Batching (vLLM):
Time→  t1  t2  t3  t4  t5  t6  t7  t8
Req A: [P] [D] [D] [D] [D] [✓]
Req C:                     [P] [D] [D]→
Req B: [P] [D] [D] [D] [D] [D] [D] [✓]
       ↑ Req A 完成后 Req C 立即填入
       → GPU 利用率接近 100%

[P] = Prefill  [D] = Decode  [✓] = 完成
[░] = GPU 空闲`}
          </div>
        </div>

        <div className="info-card">
          <h3>Chunked Prefill</h3>
          <div className="code-block">
{`# 问题: 长 Prefill 会阻塞 Decode 请求
# Prefill 8K tokens → ~50ms
# 此期间所有 Decode 请求被阻塞
# → P99 延迟飙升

# 解决: Chunked Prefill
# 将长 Prefill 拆成多个 chunk
# 每个 chunk 之间穿插 Decode

Timeline (无 Chunked Prefill):
[PPPPPPPPPPPPPP][DDDD][DDDD]
 ↑ 长 Prefill    ↑ Decode 被延迟

Timeline (Chunked Prefill):
[PPP][DDD][PPP][DDD][PPP][DDD][PPP][DDD]
 ↑ Prefill chunk   ↑ Decode 及时执行
 → TPOT 更稳定, P99 下降

# vLLM 配置:
vllm serve model \\
  --enable-chunked-prefill \\
  --max-num-batched-tokens 2048  # chunk 大小`}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpeculativeSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔮</span>Speculative Decoding — 投机解码</h2>
      <p className="section-desc">投机解码用一个 <strong>小模型 (Draft)</strong> 快速生成 K 个候选 token，然后用 <strong>大模型 (Target)</strong> 一次性验证，将 K 次 Decode 合并为 1 次。理论加速 2-3×。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Speculative Decoding 原理</h3>
          <div className="code-block">
{`┌──────────────────────────────────────┐
│         Speculative Decoding          │
│                                       │
│  Step 1: Draft Model 快速生成          │
│  ┌────────────────────────────┐       │
│  │ Draft (1B): t₁ t₂ t₃ t₄ t₅│       │
│  │ 耗时: 5ms (每 token 1ms)   │       │
│  └────────────────────────────┘       │
│                                       │
│  Step 2: Target Model 并行验证        │
│  ┌────────────────────────────┐       │
│  │ Target (70B): 验证 5 tokens │       │
│  │ 一次 forward → 5 个 logits  │       │
│  │ 耗时: 30ms (≈ 1 token 时间)│       │
│  └────────────────────────────┘       │
│                                       │
│  Step 3: 接受/拒绝                    │
│  t₁ ✓  t₂ ✓  t₃ ✓  t₄ ✗  t₅ -      │
│  接受 3 个 + 修正 1 个 = 4 tokens     │
│                                       │
│  传统: 4 tokens × 30ms = 120ms       │
│  投机: 5ms + 30ms = 35ms → 3.4× ⚡    │
└──────────────────────────────────────┘

接受率 (Acceptance Rate) 是关键:
  α > 0.7 → 显著加速
  α < 0.5 → 可能反而变慢
  α 与 draft/target 的分布匹配度相关`}
          </div>
        </div>

        <div className="info-card">
          <h3>vLLM 投机解码配置</h3>
          <div className="code-block">
{`# 方式 1: 独立 Draft Model
vllm serve meta-llama/Llama-3-70B-Instruct \\
  --speculative-model meta-llama/Llama-3-8B-Instruct \\
  --num-speculative-tokens 5 \\
  --speculative-max-model-len 2048

# 方式 2: Medusa (多头预测)
# 在 Target 模型上添加多个解码头
# 每个头预测未来第 k 个 token
# → 无需额外 Draft 模型

# 方式 3: Eagle (自回归 Draft)
# 用隐藏状态训练轻量 Draft Head
# → 接受率更高 (0.8+)

# 方式 4: Prompt Lookup Decoding
# 从 prompt 中查找可能的续写
# → 适合摘要、翻译等复制率高的任务
vllm serve model \\
  --speculative-model [ngram] \\
  --num-speculative-tokens 5 \\
  --ngram-prompt-lookup-max 4`}
          </div>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 投机解码适用条件</h4>
        <ul>
          <li><strong>Memory-Bound 场景</strong> — 小 batch 时效果最好，大 batch (≥64) 时收益递减</li>
          <li><strong>Draft 模型选择</strong> — 同系列小模型最佳（如 70B + 8B），接受率可达 0.7-0.85</li>
          <li><strong>数学证明</strong> — 投机解码的输出分布与原模型 <strong>完全一致</strong>（通过拒绝采样保证）</li>
        </ul>
      </div>
    </section>
  );
}

function AdvancedSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🧬</span>高级 KV Cache 优化</h2>
      <p className="section-desc">面向长上下文 (128K-1M tokens) 和超大规模并发的前沿优化技术。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>FlashAttention 原理</h3>
          <div className="code-block">
{`# 标准 Attention: O(n²) 内存
S = Q @ K.T          # n×n 矩阵 → HBM
P = softmax(S)       # n×n 矩阵 → HBM  
O = P @ V            # 读回 HBM
→ 3 次 HBM 读写, 内存 O(n²)

# FlashAttention: O(n) 内存
# 核心: 分块计算 (Tiling) + 在 SRAM 中完成
for block_q in Q.split(Br):          # 外层循环
    for block_k, block_v in zip(      # 内层循环  
        K.split(Bc), V.split(Bc)):
        # 在 SRAM 中:
        S_local = block_q @ block_k.T
        P_local = softmax(S_local)     # Online softmax
        O_local += P_local @ block_v
→ 1 次 HBM 读写, 内存 O(n)

# 加速效果:
# seq_len=2K:  1.5-2× faster
# seq_len=8K:  2-3× faster  
# seq_len=64K: 5-10× faster`}
          </div>
        </div>

        <div className="info-card">
          <h3>长上下文优化矩阵</h3>
          <table className="data-table">
            <thead>
              <tr><th>技术</th><th>功能</th><th>KV 内存节省</th><th>兼容性</th></tr>
            </thead>
            <tbody>
              <tr><td>FlashAttention-3</td><td>SRAM 分块, 异步</td><td>不减少 KV</td><td>H100 原生</td></tr>
              <tr><td>GQA</td><td>共享 KV Heads</td><td>4-8×</td><td>需模型支持</td></tr>
              <tr><td>Sliding Window</td><td>只保留近距离 KV</td><td>可变</td><td>Mistral</td></tr>
              <tr><td>StreamingLLM</td><td>Sink Token + Window</td><td>50×+</td><td>需适配</td></tr>
              <tr><td>KV Cache Offload</td><td>冷 KV → CPU/SSD</td><td>∞</td><td>增加延迟</td></tr>
              <tr><td>Cross-Layer KV Share</td><td>层间共享 KV</td><td>2-4×</td><td>需训练</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
