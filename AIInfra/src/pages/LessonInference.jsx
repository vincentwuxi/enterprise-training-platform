import { useState } from 'react';
import './LessonCommon.css';

const CODE_VLLM = `# ━━━━ vLLM 源码级理解：PagedAttention ━━━━

# ━━━━ 传统 KV Cache 的问题 ━━━━
# 每个请求的 KV Cache 需要连续显存块
# 问题 1：预分配最大长度 → 大量显存浪费（平均利用率 < 40%）
# 问题 2：不同请求长度不同 → 显存碎片化
# 问题 3：无法共享公共前缀（System Prompt 重复存储）

# ━━━━ PagedAttention 解法 ━━━━
# 灵感：操作系统的虚拟内存分页机制
# 将 KV Cache 分成固定大小的"页"（Page / Block）
# 每个 Block 存储固定数量 token 的 KV 对

# 优势：
# 1. 消除碎片：不需要连续内存，按需分配 Block
# 2. 共享前缀：相同 System Prompt → 共享 Block（Copy-on-Write）
# 3. 动态分配：请求结束 → 立即回收 Block
# → GPU 显存利用率从 <40% 提升到 >90%

# ━━━━ vLLM 关键参数调优 ━━━━
python -m vllm.entrypoints.openai.api_server \\
  --model meta-llama/Meta-Llama-3-8B-Instruct \\
  --tensor-parallel-size 2 \\           # 张量并行（跨 GPU 切分模型）
  --pipeline-parallel-size 1 \\         # 流水线并行（一般不用）
  --dtype bfloat16 \\                   # 计算精度
  --max-model-len 8192 \\              # 最大序列长度（影响 KV Cache 大小）
  --gpu-memory-utilization 0.9 \\      # GPU 显存使用上限
  --max-num-seqs 256 \\                # 最大并发请求数
  --max-num-batched-tokens 8192 \\     # 单 batch 最大 token 数
  --enable-prefix-caching \\           # 前缀 KV Cache 共享
  --enable-chunked-prefill \\          # 分块 Prefill（长上下文必须）
  --block-size 16                      # Block 大小（通常 8 或 16）

# ━━━━ Continuous Batching（连续批处理）━━━━
# 传统 Static Batching：等所有请求都生成完才开始下一批
# Continuous Batching：任意请求完成 → 立即插入新请求
# → 吞吐量提升 2-3x

# ━━━━ Speculative Decoding（投机解码）━━━━
# 用小模型（Draft Model）快速生成多个候选 token
# 大模型一次性验证多个 token
# → 在不降低质量的前提下加速 1.5-3x
python -m vllm.entrypoints.openai.api_server \\
  --model ./main-model \\
  --speculative-model ./draft-model \\
  --num-speculative-tokens 5`;

const CODE_TENSORRT = `# ━━━━ TensorRT-LLM：NVIDIA 官方推理引擎 ━━━━

# 特点：
# - NVIDIA 官方优化，针对 NVIDIA GPU 深度调优
# - 支持 FP8/INT4/INT8 量化
# - Inflight Batching（类似 Continuous Batching）
# - 多 GPU 推理（Tensor Parallel + Pipeline Parallel）

# ━━━━ 构建 TensorRT-LLM 引擎 ━━━━
# Step 1：将 HuggingFace 模型转换为 TensorRT 格式
python convert_checkpoint.py \\
  --model_dir ./Meta-Llama-3-8B-Instruct \\
  --output_dir ./trt_ckpt \\
  --dtype float16 \\
  --tp_size 2                # 张量并行

# Step 2：编译 TensorRT 引擎（一次性）
trtllm-build \\
  --checkpoint_dir ./trt_ckpt \\
  --output_dir ./trt_engine \\
  --max_input_len 4096 \\
  --max_output_len 2048 \\
  --max_batch_size 64 \\
  --gemm_plugin float16 \\   # 矩阵乘法插件
  --gpt_attention_plugin float16

# Step 3：启动 Triton Inference Server
python launch_triton_server.py \\
  --model_repo ./model_repo \\
  --tensorrt_llm_model_name llama3-8b \\
  --world_size 2

# ━━━━ SGLang：结构化生成最强引擎 ━━━━
# RadixAttention：前缀树管理 KV Cache（比 vLLM 更智能的共享）
# Constrained Decoding：原生支持 JSON Schema 约束输出

python -m sglang.launch_server \\
  --model-path meta-llama/Meta-Llama-3-8B-Instruct \\
  --tp 2 \\
  --port 8000

# ━━━━ 推理引擎选型 ━━━━
# ┌──────────────┬──────────┬──────────┬──────────┬──────────────┐
# │ 引擎         │ 吞吐量   │ 易用性   │ 量化支持  │ 推荐场景      │
# ├──────────────┼──────────┼──────────┼──────────┼──────────────┤
# │ vLLM         │ 高       │ 极高     │ AWQ/GPTQ │ 通用（首选）  │
# │ TensorRT-LLM │ 极高     │ 中       │ FP8/INT4 │ NVIDIA 独占  │
# │ SGLang       │ 极高     │ 高       │ 多种     │ 结构化输出    │
# │ llama.cpp    │ 中       │ 高       │ GGUF     │ CPU/边缘设备  │
# │ Ollama       │ 中       │ 极高     │ GGUF     │ 本地开发      │
# └──────────────┴──────────┴──────────┴──────────┴──────────────┘`;

const CODE_BENCH = `# ━━━━ 推理性能 Benchmark 方法 ━━━━

# ━━━━ vLLM 内置 Benchmark ━━━━
python -m vllm.entrypoints.openai.api_server --model ./model &

python benchmark_serving.py \\
  --backend vllm \\
  --model ./model \\
  --num-prompts 1000 \\
  --request-rate 10 \\            # 每秒 10 个请求
  --dataset-name ShareGPT \\      # 真实对话分布
  --output-len 256

# 关键指标：
# TTFT (Time to First Token)：首 token 延迟（P50/P95/P99）
# TPOT (Time per Output Token)：每个 token 生成时间
# Throughput：每秒生成的 token 总数
# Request/s：每秒处理的请求数

# ━━━━ 性能优化 Checklist ━━━━

# 1. 选择正确的量化方法
#    A100/H100 → AWQ INT4 + vLLM（推荐）
#    A100/H100 → FP8 + TensorRT-LLM（极致性能）
#    消费级 GPU → GGUF Q4_K_M + llama.cpp

# 2. 张量并行（Tensor Parallel）
#    8B 模型 → 1-2 GPU
#    70B 模型 → 4 GPU (TP=4)
#    405B 模型 → 8 GPU (TP=8)

# 3. KV Cache 优化
#    --enable-prefix-caching（System Prompt 不重复计算）
#    --max-model-len 合理设置（不要过大浪费显存）
#    --gpu-memory-utilization 0.9（给 KV Cache 足够空间）

# 4. Speculative Decoding
#    --speculative-model（用 1B 小模型做草稿）
#    --num-speculative-tokens 5
#    加速比：1.5-3x（取决于 acceptance rate）

# 5. 硬件配置
#    NVLink：多 GPU 间高速互联（必须！）
#    PCIe Gen5：主机与 GPU 通信带宽
#    HBM 带宽：决定推理吞吐量上限

# ━━━━ 生产 SLA 参考 ━━━━
# TTFT P95 < 1s（首 token 延迟）
# TPOT P95 < 30ms（每 token 时间）
# Throughput > 500 tokens/s/GPU（A100）
# 可用性 > 99.9%`;

export default function LessonInference() {
  const [tab, setTab] = useState('vllm');
  const tabs = [
    { key: 'vllm',     label: '⚡ vLLM PagedAttention',  code: CODE_VLLM },
    { key: 'tensorrt', label: '🔧 TensorRT / SGLang',    code: CODE_TENSORRT },
    { key: 'bench',    label: '📊 Benchmark & 调优',     code: CODE_BENCH },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 05 · INFERENCE ENGINES</div>
        <h1>推理引擎深度</h1>
        <p>推理成本占 AI 应用运营成本的 70-90%。<strong>vLLM 的 PagedAttention、TensorRT-LLM 的 FP8 加速、SGLang 的 RadixAttention</strong>——理解推理引擎的底层原理，才能做到"同样的模型、十分之一的成本"。</p>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">🚀 推理引擎三主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`ai-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} /><div className="ai-code-dot" style={{ background: '#f59e0b' }} /><div className="ai-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_inference.py</span>
          </div>
          <div className="ai-code">{t.code}</div>
        </div>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">📈 推理引擎吞吐量对比（A100 80GB, Llama 3 8B）</div>
        <div className="ai-grid-4">
          {[
            { v: '~50', l: 'HuggingFace 原生（tokens/s）', color: 'var(--ai-muted)' },
            { v: '~200', l: 'vLLM（tokens/s）', color: 'var(--ai-orange)' },
            { v: '~280', l: 'TensorRT-LLM FP8（tokens/s）', color: 'var(--ai-amber)' },
            { v: '~250', l: 'SGLang（tokens/s）', color: 'var(--ai-sky)' },
          ].map((s, i) => (
            <div key={i} className="ai-metric">
              <div className="ai-metric-val" style={{ color: s.color, fontSize: '1.4rem' }}>{s.v}</div>
              <div className="ai-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
