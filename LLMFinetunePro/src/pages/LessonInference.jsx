import { useState } from 'react';
import './LessonCommon.css';

export default function LessonInference() {
  const [tab, setTab] = useState('vllm');

  const codes = {
    vllm: `# ━━━━ vLLM：PagedAttention 原理与部署 ━━━━
# vLLM 的核心创新：PagedAttention
# 问题：KV Cache 显存碎片化导致 GPU 利用率只有 20-40%
# 解法：像操作系统内存分页一样管理 KV Cache

# ━━━━ PagedAttention 核心原理 ━━━━
# 传统：KV Cache 在连续显存块中存储（内存碎片 + 浪费）
# PagedAttention：KV Cache 分成固定大小的"页"（Page）
#   - 不同请求可以共享前缀的 KV Cache（prefix sharing）
#   - 消除内存碎片，GPU 显存利用率提升到 90%+
#   - 实现动态 batching，吞吐量提升 2-4x

# ━━━━ 快速启动 vLLM 服务 ━━━━
# pip install vllm

# 方式 1：命令行启动（推荐生产使用）
python -m vllm.entrypoints.openai.api_server \
  --model ./finetuned-llama3-8b \     # 本地微调模型路径
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 2 \          # 张量并行（跨 GPU）
  --dtype bfloat16 \
  --max-model-len 4096 \              # 最大序列长度
  --gpu-memory-utilization 0.9 \      # GPU 显存使用率上限
  --max-num-seqs 256 \               # 最大并发请求数
  --enable-prefix-caching             # 启用前缀 KV Cache 共享

# 方式 2：Python API
from vllm import LLM, SamplingParams

llm = LLM(
    model="./finetuned-llama3-8b",
    tensor_parallel_size=2,
    dtype="bfloat16",
    max_model_len=4096,
    gpu_memory_utilization=0.9,
)

sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
    stop=["</s>", "Human:", "###"],   # 停止符
)

# 批量推理（vLLM 自动 dynamic batching）
prompts = [
    "分析以下合同条款的风险：...",
    "用 Python 实现快速排序",
    "解释什么是 PagedAttention",
]
outputs = llm.generate(prompts, sampling_params)
for output in outputs:
    print(output.outputs[0].text)

# 兼容 OpenAI API（客户端无需改代码！）
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")
response = client.chat.completions.create(
    model="./finetuned-llama3-8b",
    messages=[{"role": "user", "content": "你好！"}],
)`,

    quantization: `# ━━━━ 推理量化：GPTQ / AWQ / GGUF ━━━━
# 目标：在不显著损失质量的前提下，减小模型体积，加速推理

# ━━━━ GPTQ（量化后微调）━━━━
# 特点：逐层量化，用校准数据集最小化量化误差
# 适合：离线生成量化权重后部署

from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
from transformers import AutoTokenizer

quantize_config = BaseQuantizeConfig(
    bits=4,                    # 4-bit 量化
    group_size=128,            # 每 128 个参数一组量化
    desc_act=False,            # 是否按激活值权重重排序
)

model = AutoGPTQForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3-8B-Instruct",
    quantize_config=quantize_config,
)

# 用校准数据集量化（约 5-10 分钟）
examples = tokenizer(calibration_texts, return_tensors="pt", padding=True)
model.quantize(examples)
model.save_quantized("./llama3-8b-gptq-4bit")

# 加载量化模型推理
model = AutoGPTQForCausalLM.from_quantized("./llama3-8b-gptq-4bit")

# ━━━━ AWQ（激活感知权重量化）━━━━
# 特点：更精确，速度更快（保留 1% 重要权重用 FP16）
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained("./finetuned-model")
model.quantize(tokenizer, quant_config={
    "zero_point": True,
    "q_group_size": 128,
    "w_bit": 4,
    "version": "GEMM",     # GEMM（速度快）/ GEMV（小 batch 快）
})
model.save_quantized("./model-awq-4bit")

# ━━━━ 推理框架对比 ━━━━
# ┌──────────┬──────────┬──────────┬──────────┬──────────────────┐
# │ 框架     │ 吞吐量   │ 延迟     │ 易用性   │ 推荐场景          │
# ├──────────┼──────────┼──────────┼──────────┼──────────────────┤
# │ vLLM     │ 极高     │ 低       │ 高       │ 生产 API 服务     │
# │ TGI      │ 高       │ 低       │ 中       │ HF 生态部署       │
# │ Ollama   │ 中       │ 中       │ 极高     │ 本地开发/测试     │
# │ llama.cpp│ 中       │ 中       │ 高       │ CPU/边缘设备      │
# │ SGLang   │ 极高     │ 极低     │ 中       │ 复杂 prompt 场景  │
# └──────────┴──────────┴──────────┴──────────┴──────────────────┘`,

    serving: `# ━━━━ 生产推理服务化：完整部署方案 ━━━━

# ━━━━ Docker 容器化部署 ━━━━
# Dockerfile
FROM vllm/vllm-openai:latest
COPY ./finetuned-model /models/my-model
ENV MODEL_PATH=/models/my-model
EXPOSE 8000
CMD python -m vllm.entrypoints.openai.api_server \
  --model $MODEL_PATH \
  --tensor-parallel-size $NUM_GPUS \
  --gpu-memory-utilization 0.9 \
  --enable-prefix-caching

# docker-compose.yml
version: '3.8'
services:
  vllm:
    image: my-vllm-service:latest
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 2             # 分配 2 块 GPU
              capabilities: [gpu]
    ports:
      - "8000:8000"
    volumes:
      - ./models:/models
    environment:
      - NUM_GPUS=2

# ━━━━ 推理性能优化配置 ━━━━
# 1. Continuous Batching（vLLM 默认，无需配置）
# 2. Speculative Decoding（小模型草稿 + 大模型验证，1.5-3x 加速）
python -m vllm.entrypoints.openai.api_server \
  --model ./main-model \
  --speculative-model ./draft-model \  # 小型草稿模型（如 1B 模型）
  --num-speculative-tokens 5

# 3. Chunked Prefill（长上下文场景）
--enable-chunked-prefill
--max-num-batched-tokens 8192

# ━━━━ 监控与告警 ━━━━
# vLLM Prometheus 指标（自动暴露）
# vllm:num_requests_running     - 正在处理的请求数
# vllm:gpu_cache_usage_perc     - KV Cache 使用率
# vllm:time_to_first_token_seconds - 第一个 token 延迟（TTFT）
# vllm:time_per_output_token_seconds - 每个 token 生成时间

# SLA 参考目标：
# TTFT P95 < 2s
# 吞吐量 > 200 tokens/s（单 A100）
# 可用性 > 99.9%`,
  };

  return (
    <div className="ft-lesson">
      <div className="ft-hero">
        <div className="ft-badge">// MODULE 07 · INFERENCE & SERVING</div>
        <h1>vLLM 高速推理部署</h1>
        <p>微调完的模型如何高效地服务成千上万并发用户？<strong>vLLM 的 PagedAttention 将 GPU 显存利用率从 40% 提升到 90%+，吞吐量提升 2-4 倍</strong>——这是生产级 LLM 服务的核心技术。</p>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">🚀 推理三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['vllm', '⚡ vLLM 部署（开箱即用）'], ['quantization', '🗜️ GPTQ/AWQ 推理量化'], ['serving', '🐳 生产服务化']].map(([k, l]) => (
            <button key={k} className={`ft-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ft-code-wrap">
          <div className="ft-code-head">
            <div className="ft-code-dot" style={{ background: '#ef4444' }} /><div className="ft-code-dot" style={{ background: '#f59e0b' }} /><div className="ft-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_inference.py</span>
          </div>
          <div className="ft-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">📊 吞吐量对比（A100 80GB，Llama 3 8B）</div>
        <div className="ft-grid-4">
          {[
            { v: '~50', l: 'HuggingFace 原生（tokens/s）', color: 'var(--ft-muted)' },
            { v: '~200', l: 'vLLM（tokens/s）', color: 'var(--ft-pink)' },
            { v: '4x', l: 'vLLM vs HF 吞吐提升', color: 'var(--ft-pink)' },
            { v: '90%+', l: 'PagedAttention GPU 利用率', color: 'var(--ft-green)' },
          ].map((s, i) => (
            <div key={i} className="ft-metric">
              <div className="ft-metric-val" style={{ color: s.color, fontSize: '1.4rem' }}>{s.v}</div>
              <div className="ft-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
