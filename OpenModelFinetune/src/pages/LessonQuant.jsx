import { useState } from 'react';
import './LessonCommon.css';

const DEPLOY_OPTIONS = [
  {
    key: 'ollama', name: 'Ollama', icon: '🦙',
    type: '本地/私有化', latency: '低', concurrency: '低（单用户）', cost: '零（本地）',
    best: '本地开发测试 / 个人使用 / 离线环境',
    steps: [
      '安装 Ollama：curl -fsSL https://ollama.com/install.sh | sh',
      '创建 Modelfile，指定基础模型和 GGUF 路径',
      'ollama create my-model -f Modelfile',
      'ollama run my-model（交互式对话）',
      '可选：ollama serve 暴露 OpenAI 兼容 API',
    ],
    code: `# Modelfile（告诉 Ollama 如何加载你的模型）
FROM ./model_q4_k_m.gguf           # 本地 GGUF 文件

# 系统提示词
SYSTEM """
你是 [ProductName] 智能助手，专注于 [领域]。
回答准确、简洁，不确定时说不确定。
"""

# 模型参数
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40

# 对话模板（与微调时保持一致）
TEMPLATE """<|im_start|>system
{{ .System }}<|im_end|>
<|im_start|>user
{{ .Prompt }}<|im_end|>
<|im_start|>assistant
{{ .Response }}<|im_end|>"""

# 终端执行：
# ollama create my-expert -f Modelfile
# ollama run my-expert
# curl http://localhost:11434/api/chat -d '{"model":"my-expert","messages":[{"role":"user","content":"你好"}]}'`,
  },
  {
    key: 'vllm', name: 'vLLM', icon: '⚡',
    type: '生产 API 服务', latency: '极低', concurrency: '极高（PagedAttention）', cost: 'GPU 服务器',
    best: '生产环境高并发推理服务，OpenAI 兼容 API',
    steps: [
      'pip install vllm',
      '启动推理服务器（OpenAI 兼容 API）',
      '配置并发数、量化方式、最大长度',
      '压力测试验证吞吐量',
      '配置反向代理（Nginx）和鉴权',
    ],
    code: `# 安装
pip install vllm

# ━━━━ 方式一：命令行启动（最简单）━━━━
python -m vllm.entrypoints.openai.api_server \\
    --model ./merged_model \\             # 模型路径
    --served-model-name my-expert \\      # API 中的模型名
    --host 0.0.0.0 \\
    --port 8000 \\
    --max-model-len 4096 \\
    --gpu-memory-utilization 0.90 \\      # 占用 GPU 显存比例
    --quantization awq \\                 # 量化（awq/gptq/none）
    --tensor-parallel-size 1 \\           # 单卡推理
    --max_num_seqs 256                   # 最大并发请求数

# ━━━━ 方式二：Python API 集成 ━━━━
from vllm import LLM, SamplingParams

llm = LLM(
    model="./merged_model",
    tensor_parallel_size=1,
    gpu_memory_utilization=0.9,
)

# 批量推理（比逐个请求高效 5-10x）
prompts = ["介绍 LoRA 的原理", "DPO 和 RLHF 的区别"]
params  = SamplingParams(temperature=0.7, max_tokens=512)
outputs = llm.generate(prompts, params)

for out in outputs:
    print(out.outputs[0].text)

# ━━━━ 客户端调用（OpenAI 格式）━━━━
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="token-abc123")

response = client.chat.completions.create(
    model="my-expert",
    messages=[{"role": "user", "content": "你好"}],
    temperature=0.7, max_tokens=512,
)
print(response.choices[0].message.content)`,
  },
  {
    key: 'fastapi', name: 'FastAPI 自定义 API', icon: '🐍',
    type: '轻量自定义服务', latency: '中', concurrency: '中', cost: 'GPU/CPU 服务器',
    best: '需要自定义业务逻辑、权限控制、日志记录',
    steps: [
      'pip install fastapi uvicorn transformers',
      '编写 FastAPI 应用，加载模型',
      '实现 /chat /health /metrics 等端点',
      '添加 API Key 鉴权和请求限流',
      'Docker 容器化，Nginx 反代',
    ],
    code: `from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from transformers import AutoModelForCausalLM, AutoTokenizer
from pydantic import BaseModel
import torch, asyncio

app = FastAPI(title="My Expert Model API", version="1.0")

# 全局加载模型（不要每次请求都加载！）
MODEL_PATH = "./merged_model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH, torch_dtype=torch.bfloat16, device_map="auto"
)
model.eval()

class ChatRequest(BaseModel):
    message: str
    max_tokens: int = 512
    temperature: float = 0.7

class ChatResponse(BaseModel):
    response: str
    tokens_used: int

# 简单 API Key 鉴权
API_KEYS = {"sk-xxxx-your-key"}
def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key not in API_KEYS:
        raise HTTPException(status_code=401, detail="Invalid API Key")

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, key=Depends(verify_api_key)):
    prompt = f"<|im_start|>user\\n{req.message}<|im_end|>\\n<|im_start|>assistant\\n"
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=req.max_tokens,
            temperature=req.temperature,
            do_sample=True,
        )
    
    response = tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:], 
                                 skip_special_tokens=True)
    return ChatResponse(response=response, tokens_used=len(outputs[0]))

@app.get("/health")
def health(): return {"status": "ok"}

# 运行：uvicorn app:app --host 0.0.0.0 --port 8080 --workers 1`,
  },
];

const PERF_TABLE = [
  { gpu: 'RTX 3090 (24GB)', model: 'Qwen2.5-7B Q4', throughput: '~800 tok/s', concurrency: '16-32', cost: '本地/云 $0.3/h' },
  { gpu: 'RTX 4090 (24GB)', model: 'Qwen2.5-7B Q4', throughput: '~1200 tok/s', concurrency: '32-64', cost: '本地/云 $0.5/h' },
  { gpu: 'A100 (80GB)',      model: 'Llama-3.1-70B Q4', throughput: '~400 tok/s', concurrency: '64-128', cost: '云 $2.5/h' },
  { gpu: 'CPU (32核)',       model: 'Phi-3.5 Mini Q4', throughput: '~30 tok/s', concurrency: '4-8', cost: '本地/低成本' },
];

export default function LessonQuant() {
  const [deploy, setDeploy] = useState('ollama');
  const d = DEPLOY_OPTIONS.find(x => x.key === deploy);

  return (
    <div className="ft-lesson">
      <div className="ft-container">

        <div className="ft-hero">
          <div className="ft-badge">模块七 · Quantization & Deployment</div>
          <h1>量化与高效部署</h1>
          <p>微调完成只是第一步——如何让模型在消费级显卡上流畅运行？如何搭建可对外服务的 API？GGUF 量化、Ollama 本地部署、vLLM 生产部署，一步到位。</p>
        </div>

        <div className="ft-metrics">
          {[{ v: 'GGUF', l: '最通用量化格式' }, { v: 'vLLM', l: '生产级推理引擎' }, { v: 'Q4_K_M', l: '最佳平衡精度' }, { v: 'OpenAI', l: '兼容API格式' }].map(m => (
            <div key={m.l} className="ft-metric-card"><div className="ft-metric-value">{m.v}</div><div className="ft-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* GGUF Export */}
        <div className="ft-section">
          <h2>📦 模型导出 & GGUF 量化</h2>
          <div className="ft-code">{`# ━━━━ 方式一：Unsloth 直接导出 GGUF ━━━━
# 在训练结束后，一行代码导出各精度 GGUF
model.save_pretrained_gguf(
    "model_gguf_q4",
    tokenizer,
    quantization_method="q4_k_m",   # 推荐：质量/大小均衡
)
# 其他精度：q2_k / q3_k_m / q5_k_m / q6_k / q8_0 / f16

# ━━━━ 方式二：llama.cpp 手动量化 ━━━━
# 1. 安装 llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make -j8

# 2. 合并 LoRA 为完整模型（如未合并）
python convert_lora_to_hf.py --base_model ./base --lora ./lora_weights --output ./merged

# 3. 转换为 GGUF（F16 基础格式）
python convert_hf_to_gguf.py ./merged --outtype f16 --outfile model_f16.gguf

# 4. 量化到目标精度
./llama-quantize model_f16.gguf model_q4km.gguf Q4_K_M

# 5. 验证量化质量
./llama-perplexity -m model_q4km.gguf -f wikitext.txt
# 输出：Final estimate: PPL = 6.xx ± 0.xx（越低越好）

# ━━━━ 方式三：AutoAWQ（适合 vLLM 生产部署）━━━━
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained("./merged_model")
model.quantize(
    tokenizer,
    quant_config={"zero_point": True, "q_group_size": 128,
                   "w_bit": 4, "version": "GEMM"},
)
model.save_quantized("model_awq")  # vLLM --quantization awq 直接加载`}</div>
        </div>

        {/* Deployment Options */}
        <div className="ft-section">
          <h2>🚀 三种部署方案详解</h2>
          <div className="ft-tabs">
            {DEPLOY_OPTIONS.map(x => <button key={x.key} className={`ft-tab${deploy === x.key ? ' active' : ''}`} onClick={() => setDeploy(x.key)}>{x.icon} {x.name}</button>)}
          </div>
          {d && (
            <div>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                <span className="ft-tag">{d.type}</span>
                <span className="ft-tag blue">延迟：{d.latency}</span>
                <span className="ft-tag purple">并发：{d.concurrency}</span>
                <span className="ft-tag green">成本：{d.cost}</span>
              </div>
              <p style={{ color: 'var(--ft-muted)', fontSize: '.87rem', marginBottom: '.75rem' }}>
                <strong>最适合：</strong>{d.best}
              </p>
              <div className="ft-code">{d.code}</div>
            </div>
          )}
        </div>

        {/* Performance Benchmark */}
        <div className="ft-section">
          <h2>📊 不同 GPU 吞吐量参考（vLLM + Q4）</h2>
          <div className="ft-table-wrap">
            <table className="ft-table">
              <thead><tr><th>GPU</th><th>模型</th><th>吞吐量</th><th>最大并发</th><th>成本参考</th></tr></thead>
              <tbody>
                {PERF_TABLE.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.gpu}</td>
                    <td><span className="ft-tag">{r.model}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--ft-accent)' }}>{r.throughput}</td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--ft-cyan)' }}>{r.concurrency}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--ft-muted)' }}>{r.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ft-tip">💡 <span><strong>部署路径推荐：</strong>开发验证 → Ollama；小规模部署（&lt;50 QPS）→ FastAPI + 单卡；生产高并发 → vLLM 集群 + Nginx 负载均衡。</span></div>
        </div>

      </div>
    </div>
  );
}
