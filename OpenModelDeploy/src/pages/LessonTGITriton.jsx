import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 04 — TGI & Triton
   HuggingFace TGI / NVIDIA Triton Server
   ───────────────────────────────────────────── */

const COMPARISON = [
  { feature: '开发公司', tgi: 'HuggingFace', triton: 'NVIDIA', vllm: 'UC Berkeley / vLLM 社区' },
  { feature: '核心优势', tgi: 'HF 生态一键部署', triton: '多模型/多框架统一服务', vllm: 'PagedAttention 最高吞吐' },
  { feature: '协议', tgi: 'Apache 2.0', triton: 'BSD-3', vllm: 'Apache 2.0' },
  { feature: 'API 格式', tgi: 'REST + gRPC + 流式', triton: 'HTTP + gRPC + C API', vllm: 'OpenAI 兼容' },
  { feature: 'Docker', tgi: '官方镜像 (推荐)', triton: '官方镜像 (推荐)', vllm: '官方镜像 / pip' },
  { feature: '量化', tgi: 'GPTQ / AWQ / EETQ / BnB', triton: 'TensorRT-LLM FP8/INT4', vllm: 'GPTQ / AWQ / FP8' },
  { feature: 'LoRA', tgi: '✅ 多 LoRA', triton: '✅ (通过 TRT-LLM)', vllm: '✅ 多 LoRA' },
  { feature: 'Speculative', tgi: '✅', triton: '✅ (TRT-LLM)', vllm: '✅' },
  { feature: '最佳场景', tgi: 'HF 模型快速上线', triton: '企业级多模型服务', vllm: '纯 LLM 高吞吐' },
];

export default function LessonTGITriton() {
  const [tab, setTab] = useState('tgi');

  return (
    <div className="lesson-deploy">
      <div className="dp-badge indigo">🚀 module_04 — TGI & Triton</div>

      <div className="dp-hero">
        <h1>TGI & Triton：企业级推理服务器</h1>
        <p>
          <strong>TGI</strong> (Text Generation Inference) 是 HuggingFace 的推理服务器，
          一键部署 Hub 上的任何模型；<strong>Triton</strong> 是 NVIDIA 的企业级推理平台，
          支持多模型、多框架统一服务。本模块对比两者并给出生产配置。
        </p>
      </div>

      <div className="dp-pills">
        <button className={`dp-btn ${tab === 'tgi' ? 'primary' : 'indigo'}`} onClick={() => setTab('tgi')}>🤗 TGI</button>
        <button className={`dp-btn ${tab === 'triton' ? 'primary' : 'indigo'}`} onClick={() => setTab('triton')}>🔺 Triton</button>
        <button className={`dp-btn ${tab === 'compare' ? 'primary' : 'indigo'}`} onClick={() => setTab('compare')}>📊 三方对比</button>
      </div>

      {tab === 'tgi' && (
        <>
          <div className="dp-section">
            <h2 className="dp-section-title">🤗 TGI 快速部署</h2>
            <div className="dp-code-wrap">
              <div className="dp-code-head">
                <span className="dp-code-dot" style={{ background: '#ef4444' }} />
                <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
                <span className="dp-code-dot" style={{ background: '#22c55e' }} />
                🐳 TGI Docker 部署
              </div>
              <pre className="dp-code">{`# ─── Docker 一键部署 (推荐) ───
model=meta-llama/Llama-3.1-8B-Instruct
volume=$PWD/data

docker run --gpus all --shm-size 1g \\
  -p 8080:80 \\
  -v $volume:/data \\
  -e HF_TOKEN=$HF_TOKEN \\
  ghcr.io/huggingface/text-generation-inference:latest \\
  --model-id $model \\
  --quantize awq \\             # 量化方法
  --max-input-tokens 4096 \\
  --max-total-tokens 8192 \\
  --max-batch-prefill-tokens 4096 \\
  --max-concurrent-requests 128

# ─── API 调用 ───
# 1. 生成接口
curl http://localhost:8080/generate \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -d '{"inputs": "What is deep learning?", "parameters": {"max_new_tokens": 256}}'

# 2. 流式接口
curl http://localhost:8080/generate_stream \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -d '{"inputs": "Explain transformers", "parameters": {"max_new_tokens": 256}}'

# 3. OpenAI 兼容 (v2.0+)
curl http://localhost:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model": "tgi", "messages": [{"role": "user", "content": "Hi"}]}'

# ─── TGI 核心参数 ───
# --quantize: none/awq/gptq/eetq/bitsandbytes
# --max-input-tokens: 最大输入长度
# --max-total-tokens: 输入+输出总长度
# --max-concurrent-requests: 最大并发
# --max-batch-prefill-tokens: Prefill 批处理 token 数
# --num-shard: GPU 并行数 (自动检测)`}</pre>
            </div>
          </div>

          <div className="dp-section">
            <h2 className="dp-section-title">🐍 TGI Python 客户端</h2>
            <div className="dp-code-wrap">
              <div className="dp-code-head">
                <span className="dp-code-dot" style={{ background: '#ef4444' }} />
                <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
                <span className="dp-code-dot" style={{ background: '#22c55e' }} />
                🐍 tgi_client.py
              </div>
              <pre className="dp-code">{`from huggingface_hub import InferenceClient

client = InferenceClient("http://localhost:8080")

# 普通生成
output = client.text_generation(
    "What is the meaning of life?",
    max_new_tokens=256,
    temperature=0.7,
)
print(output)

# 流式生成
for token in client.text_generation(
    "Write a poem about AI",
    max_new_tokens=256,
    stream=True,
):
    print(token, end="", flush=True)

# Chat 模式
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is RAG?"},
    ],
    max_tokens=512,
)
print(response.choices[0].message.content)`}</pre>
            </div>
          </div>
        </>
      )}

      {tab === 'triton' && (
        <>
          <div className="dp-section">
            <h2 className="dp-section-title">🔺 NVIDIA Triton + TensorRT-LLM</h2>
            <div className="dp-code-wrap">
              <div className="dp-code-head">
                <span className="dp-code-dot" style={{ background: '#ef4444' }} />
                <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
                <span className="dp-code-dot" style={{ background: '#22c55e' }} />
                🖥️ triton_setup.sh
              </div>
              <pre className="dp-code">{`# ─── Step 1: 用 TensorRT-LLM 构建引擎 ───
pip install tensorrt-llm

# 转换 HuggingFace 模型到 TRT-LLM 格式
python convert_checkpoint.py \\
  --model_dir meta-llama/Llama-3.1-8B-Instruct \\
  --output_dir ./tllm_checkpoint \\
  --dtype float16 \\
  --tp_size 2                    # 2 GPU 张量并行

# 构建 TRT-LLM 引擎
trtllm-build \\
  --checkpoint_dir ./tllm_checkpoint \\
  --output_dir ./trt_engines \\
  --gemm_plugin float16 \\
  --max_batch_size 64 \\
  --max_input_len 4096 \\
  --max_seq_len 8192

# ─── Step 2: Triton 模型仓库结构 ───
# model_repo/
# ├── preprocessing/      # tokenizer
# │   ├── 1/
# │   │   └── model.py
# │   └── config.pbtxt
# ├── tensorrt_llm/       # TRT-LLM 引擎
# │   ├── 1/
# │   │   └── [engine files]
# │   └── config.pbtxt
# └── postprocessing/     # detokenizer
#     ├── 1/
#     │   └── model.py
#     └── config.pbtxt

# ─── Step 3: 启动 Triton ───
docker run --gpus all --rm \\
  -p 8000:8000 -p 8001:8001 -p 8002:8002 \\
  -v ./model_repo:/models \\
  nvcr.io/nvidia/tritonserver:24.07-trtllm-python-py3 \\
  tritonserver --model-repository=/models \\
  --log-verbose=1

# ─── 性能优势 ───
# TRT-LLM + Triton vs vLLM:
# - TTFT (首 Token): TRT-LLM 快 20-40%
# - 吞吐量: TRT-LLM 高 30-50% (H100)
# - 代价: 部署复杂度高、引擎需重新编译`}</pre>
            </div>
          </div>

          <div className="dp-grid-2">
            <div className="dp-alert success">
              <strong>✅ Triton 优势</strong><br/>
              企业级特性: 模型热更新、A/B 测试路由、多模型统一端口、gRPC 高性能通信、Prometheus 自带 metrics。
            </div>
            <div className="dp-alert warning">
              <strong>⚠️ Triton 代价</strong><br/>
              配置复杂（model repository/config.pbtxt）、TRT-LLM 引擎编译耗时、更新模型需重新编译引擎。
            </div>
          </div>
        </>
      )}

      {tab === 'compare' && (
        <div className="dp-section">
          <h2 className="dp-section-title">📊 TGI vs Triton vs vLLM</h2>
          <div className="dp-card">
            <table className="dp-table">
              <thead><tr><th>维度</th><th style={{ color: '#fde047' }}>🤗 TGI</th><th style={{ color: '#22c55e' }}>🔺 Triton</th><th style={{ color: '#60a5fa' }}>⚡ vLLM</th></tr></thead>
              <tbody>
                {COMPARISON.map((c, i) => (
                  <tr key={i}>
                    <td><strong style={{ color: '#fb923c' }}>{c.feature}</strong></td>
                    <td style={{ color: '#94a3b8' }}>{c.tgi}</td>
                    <td style={{ color: '#94a3b8' }}>{c.triton}</td>
                    <td style={{ color: '#94a3b8' }}>{c.vllm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dp-alert info">
            <strong>🎯 选型建议：</strong>快速原型用 TGI → 高吞吐用 vLLM → 企业级多模型用 Triton + TRT-LLM
          </div>
        </div>
      )}

      <div className="dp-nav">
        <button className="dp-btn">← vLLM</button>
        <button className="dp-btn green">量化部署 →</button>
      </div>
    </div>
  );
}
