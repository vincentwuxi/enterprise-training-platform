import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'vllm', title: 'vLLM 引擎', icon: '🚀' },
  { id: 'tensorrt', title: 'TensorRT-LLM', icon: '⚡' },
  { id: 'sglang', title: 'SGLang & Others', icon: '🔄' },
  { id: 'benchmark', title: '引擎选型', icon: '📊' },
];

export default function LessonInferenceEngines() {
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
        {active === 'vllm' && <VLLMSection />}
        {active === 'tensorrt' && <TensorRTSection />}
        {active === 'sglang' && <SGLangSection />}
        {active === 'benchmark' && <BenchmarkSection />}
      </div>
    </div>
  );
}

function VLLMSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🚀</span>vLLM — 开源推理引擎之王</h2>
      <p className="section-desc">vLLM 凭借 <strong>PagedAttention</strong> 和 <strong>Continuous Batching</strong> 成为最流行的 LLM 推理引擎，被 OpenAI、Databricks 等广泛采用。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>vLLM 核心架构</h3>
          <div className="code-block">
{`┌──────────────────────────────────────┐
│              vLLM Server              │
├──────────────────────────────────────┤
│  AsyncLLMEngine                      │
│  ┌────────────────────────────────┐  │
│  │  Scheduler                     │  │
│  │  ├── Waiting Queue             │  │
│  │  ├── Running Queue             │  │
│  │  └── Swapped Queue             │  │
│  │  Policy: FCFS / Priority       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Model Executor                │  │
│  │  ├── Model Runner              │  │
│  │  ├── KV Cache Manager          │  │
│  │  │   └── PagedAttention ★      │  │
│  │  ├── Sampler                   │  │
│  │  └── Speculative Decoder       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  API Server (OpenAI compat)    │  │
│  │  /v1/chat/completions          │  │
│  │  /v1/completions               │  │
│  │  /v1/embeddings                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘`}
          </div>
        </div>

        <div className="info-card">
          <h3>vLLM 生产部署</h3>
          <div className="code-block">
{`# 1. 基础部署 (单卡)
vllm serve meta-llama/Llama-3-8B-Instruct \\
  --dtype auto \\
  --max-model-len 8192 \\
  --gpu-memory-utilization 0.9

# 2. 多卡 Tensor Parallel
vllm serve meta-llama/Llama-3-70B-Instruct \\
  --tensor-parallel-size 4 \\
  --dtype float16 \\
  --max-model-len 4096 \\
  --enable-chunked-prefill \\
  --max-num-batched-tokens 32768

# 3. AWQ 量化模型
vllm serve TheBloke/Llama-3-70B-AWQ \\
  --quantization awq \\
  --tensor-parallel-size 2 \\
  --gpu-memory-utilization 0.95

# 4. 关键调优参数
--max-num-seqs 256          # 最大并发请求
--enable-prefix-caching     # Prompt Cache
--speculative-model small   # 投机解码
--enforce-eager false       # CUDA Graph`}
          </div>
        </div>

        <div className="info-card">
          <h3>vLLM Python SDK</h3>
          <div className="code-block">
{`from vllm import LLM, SamplingParams

# 离线批量推理
llm = LLM(
    model="meta-llama/Llama-3-8B-Instruct",
    tensor_parallel_size=1,
    max_model_len=4096,
    gpu_memory_utilization=0.9,
    enable_prefix_caching=True,
)

prompts = [
    "Explain quantum computing in 3 sentences.",
    "Write a haiku about AI.",
    "What is gradient descent?",
]

params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=256,
    repetition_penalty=1.1,
)

outputs = llm.generate(prompts, params)

for output in outputs:
    print(f"Prompt: {output.prompt[:50]}...")
    print(f"Output: {output.outputs[0].text}")
    print(f"Tokens/s: {len(output.outputs[0].token_ids) / output.metrics.finished_time:.1f}")
    print("---")`}
          </div>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 vLLM 调优要点</h4>
        <ul>
          <li><strong>gpu-memory-utilization=0.9</strong> — 预留 10% 给 CUDA 上下文和意外开销</li>
          <li><strong>enable-prefix-caching</strong> — 重复的 system prompt 只计算一次，多轮对话必备</li>
          <li><strong>chunked-prefill</strong> — 长文本 Prefill 拆分，避免阻塞 Decode 请求</li>
        </ul>
      </div>
    </section>
  );
}

function TensorRTSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">⚡</span>TensorRT-LLM — NVIDIA 官方利器</h2>
      <p className="section-desc">TensorRT-LLM 是 NVIDIA 专门为 LLM 优化的推理框架，<strong>深度集成 Tensor Core、FP8、Inflight Batching</strong>，在 NVIDIA 硬件上通常有最高性能。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>TensorRT-LLM 编译流程</h3>
          <div className="code-block">
{`# 1. 安装
pip install tensorrt-llm -U

# 2. 转换模型权重 → TRT-LLM checkpoint
python convert_checkpoint.py \\
  --model_dir ./Llama-3-70B/ \\
  --output_dir ./trt_ckpt/ \\
  --dtype float16 \\
  --tp_size 4            # Tensor Parallel

# 3. 构建 TRT-LLM Engine
trtllm-build \\
  --checkpoint_dir ./trt_ckpt/ \\
  --output_dir ./trt_engine/ \\
  --gemm_plugin auto \\
  --gpt_attention_plugin float16 \\
  --max_batch_size 64 \\
  --max_input_len 4096 \\
  --max_seq_len 8192 \\
  --use_paged_context_fmha enable \\
  --use_fp8_context_fmha enable

# 4. 运行推理
python run.py \\
  --engine_dir ./trt_engine/ \\
  --tokenizer_dir ./Llama-3-70B/ \\
  --max_output_len 256`}
          </div>
        </div>

        <div className="info-card">
          <h3>TRT-LLM vs vLLM 对比</h3>
          <table className="data-table">
            <thead>
              <tr><th>维度</th><th>TensorRT-LLM</th><th>vLLM</th></tr>
            </thead>
            <tbody>
              <tr><td>易用性</td><td>需要编译 Engine，2-4h</td><td>即开即用</td></tr>
              <tr><td>NVIDIA 性能</td><td>最优 (官方优化)</td><td>接近 (95%+)</td></tr>
              <tr><td>FP8 支持</td><td>原生最佳</td><td>良好</td></tr>
              <tr><td>模型支持</td><td>需要适配</td><td>广泛 (HF 直接用)</td></tr>
              <tr><td>灵活性</td><td>静态编译</td><td>动态灵活</td></tr>
              <tr><td>社区</td><td>NVIDIA 主导</td><td>开源社区活跃</td></tr>
              <tr><td>适用场景</td><td>极致性能、固定模型</td><td>快速迭代、多模型</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SGLangSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔄</span>SGLang & 新兴推理引擎</h2>
      <p className="section-desc">SGLang 用 <strong>RadixAttention</strong> 实现了极高效的前缀缓存和结构化生成，在 agentic 场景下性能突出。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>SGLang 核心特性</h3>
          <div className="code-block">
{`SGLang 核心创新:

1. RadixAttention (基数树缓存)
   ┌──────────────────────────┐
   │  System Prompt (共享)     │
   │   ├── User A: "你好..."  │
   │   │   → 复用 system KV   │
   │   ├── User B: "请帮我..."│
   │   │   → 复用 system KV   │
   │   └── User A 第2轮       │
   │       → 复用 全部历史 KV  │
   └──────────────────────────┘
   → 多轮对话 Prefill 减少 80%+

2. Constrained Decoding (约束解码)
   # 保证输出合法 JSON
   sgl.gen("output", regex=r'\{.*\}')
   
   # 保证输出是枚举值
   sgl.select("choice", ["approve", "reject"])

3. Parallel Prefix Caching
   多个请求共享相同 prefix →
   只计算一次 → 吞吐提升 3-5×`}
          </div>
        </div>

        <div className="info-card">
          <h3>SGLang 部署</h3>
          <div className="code-block">
{`# 1. 启动 SGLang Server
python -m sglang.launch_server \\
  --model meta-llama/Llama-3-70B-Instruct \\
  --tp 4 \\
  --port 30000 \\
  --mem-fraction-static 0.85

# 2. OpenAI 兼容 API
import openai
client = openai.Client(
    base_url="http://localhost:30000/v1",
    api_key="none"
)
resp = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "Hi"}]
)

# 3. 其他新兴引擎
# ┌────────────┬───────────────────────┐
# │ LMDeploy   │ 商汤开源, TurboMind   │
# │ MLC-LLM    │ 全平台 (Web/iOS/安卓)  │
# │ llama.cpp  │ CPU 推理之王           │
# │ Ollama     │ 本地 LLM 一键部署      │
# │ ExLlamaV2  │ GPTQ 最快推理          │
# └────────────┴───────────────────────┘`}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenchmarkSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📊</span>推理引擎选型指南</h2>
      <p className="section-desc">选择推理引擎需要综合考虑 <strong>性能、易用性、灵活性和运维成本</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Benchmark 方法论</h3>
          <div className="code-block">
{`# 标准化 Benchmark 指标

1. Throughput (吞吐)
   tokens/second — 单位时间生成的 token 数
   测试条件: 固定并发数 + 固定 input/output 长度

2. Latency (延迟)
   ├── TTFT (Time To First Token)
   │   首 token 输出延迟 — 用户体验关键
   ├── TPOT (Time Per Output Token)
   │   每个 token 生成时间 — 流式体验
   └── E2E Latency
       端到端延迟 — SLA 考核

3. 测试工具
   # genai-perf (NVIDIA 官方)
   genai-perf -m llama-3-8b \\
     --concurrency 64 \\
     --input-sequence-length 512 \\
     --output-sequence-length 128
   
   # vllm benchmark
   python benchmark_serving.py \\
     --model Llama-3-8B \\
     --dataset ShareGPT \\
     --request-rate 10`}
          </div>
        </div>

        <div className="info-card">
          <h3>引擎选型决策表</h3>
          <table className="data-table">
            <thead>
              <tr><th>场景</th><th>推荐引擎</th><th>理由</th></tr>
            </thead>
            <tbody>
              <tr><td>通用生产 (NVIDIA GPU)</td><td><strong>vLLM</strong></td><td>易用、灵活、社区活跃</td></tr>
              <tr><td>极致性能 (固定模型)</td><td><strong>TensorRT-LLM</strong></td><td>NVIDIA 深度优化</td></tr>
              <tr><td>Agent / 多轮对话</td><td><strong>SGLang</strong></td><td>RadixAttention 前缀缓存</td></tr>
              <tr><td>结构化输出 (JSON)</td><td><strong>SGLang / Outlines</strong></td><td>约束解码原生支持</td></tr>
              <tr><td>本地 / CPU 推理</td><td><strong>llama.cpp / Ollama</strong></td><td>CPU 优化、零配置</td></tr>
              <tr><td>移动端部署</td><td><strong>MLC-LLM</strong></td><td>跨平台 (iOS/Android/Web)</td></tr>
              <tr><td>国产 GPU (华为/摩尔)</td><td><strong>LMDeploy / MindIE</strong></td><td>适配 Ascend 等硬件</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 选型建议</h4>
        <ul>
          <li><strong>80% 场景选 vLLM</strong> — 覆盖最广、社区最活、迭代最快</li>
          <li><strong>如果追求极致延迟</strong> — TRT-LLM 编译一次，长期受益</li>
          <li><strong>必须做 Benchmark</strong> — 不同模型/batch/seq_len 下结论可能相反</li>
        </ul>
      </div>
    </section>
  );
}
