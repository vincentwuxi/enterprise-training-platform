import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const QUANT_TYPES = [
  { name: 'FP32（全精度）', bits: 32, size: '28GB', tps: '45', color: '#f87171', status: '❌ 生产不用' },
  { name: 'FP16/BF16',      bits: 16, size: '14GB', tps: '85', color: '#fbbf24', status: '✅ 训练标准' },
  { name: 'INT8（W8A8）',   bits: 8,  size: '7GB',  tps: '120', color: '#10b981', status: '✅ 推理常用' },
  { name: 'INT4（NF4）',    bits: 4,  size: '3.5GB', tps: '160', color: '#38bdf8', status: '✅ 边端/省成本' },
  { name: 'INT2（极限）',   bits: 2,  size: '1.75GB', tps: '200', color: '#a78bfa', status: '⚠️ 质量损失大' },
];

const DEPLOY_SOLUTIONS = [
  {
    name: 'vLLM', icon: '⚡', color: '#a78bfa',
    desc: 'PagedAttention 显存优化，吞吐量是 HuggingFace 的 24x。生产 API 服务首选。',
    code: `# vLLM：最高生产吞吐量
pip install vllm

# 启动 OpenAI 兼容 API Server
python -m vllm.entrypoints.openai.api_server \\
  --model Qwen/Qwen2.5-7B-Instruct \\
  --dtype bfloat16 \\
  --tensor-parallel-size 2 \\  # 2 GPU 张量并行
  --max-model-len 32768 \\      # 最大上下文长度
  --max-num-seqs 256 \\         # 最大并发请求数
  --host 0.0.0.0 --port 8000 \\
  --api-key "your-secret-key"

# 调用（与 OpenAI SDK 完全兼容）
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="your-secret-key")
response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "你好！"}]
)

# 量化加速（显存减半，速度提升）
python -m vllm.entrypoints.openai.api_server \\
  --model Qwen/Qwen2.5-72B-Instruct \\
  --quantization awq \\         # AWQ 4bit 量化
  --tensor-parallel-size 4`
  },
  {
    name: 'Ollama', icon: '🦙', color: '#10b981',
    desc: '本地一键运行。自动量化，无需配置，适合开发环境和个人使用。',
    code: `# Ollama：最简单的本地部署
# macOS/Linux 一键安装
curl -fsSL https://ollama.com/install.sh | sh

# 运行模型（自动下载+量化）
ollama run llama3.1:8b        # Llama3.1 8B (默认 Q4_K_M 量化)
ollama run qwen2.5:72b-q4_K_M # Qwen2.5 72B 4bit 量化（需64GB内存）
ollama run deepseek-r1:7b     # DeepSeek R1 推理模型

# REST API（自动启动）
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2.5:7b",
  "messages": [{"role": "user", "content": "讲个笑话"}],
  "stream": true
}'

# LangChain 集成
from langchain_ollama import ChatOllama
llm = ChatOllama(model="qwen2.5:7b", temperature=0)
result = llm.invoke("你好")`
  },
  {
    name: 'FastAPI + LLM', icon: '🚀', color: '#f59e0b',
    desc: '封装成微服务。生产推荐：FastAPI + vLLM + Redis 缓存 + 限流。',
    code: `from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
import redis.asyncio as redis
import hashlib, json

app = FastAPI(title="LLM API Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"])

client = AsyncOpenAI(
    base_url="http://vllm-server:8000/v1",
    api_key="internal-key"
)
cache = redis.from_url("redis://localhost:6379")

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    temperature: float = 0.7

@app.post("/chat")
async def chat(req: ChatRequest):
    # 语义缓存（相同问题返回缓存结果）
    cache_key = hashlib.md5(req.message.encode()).hexdigest()
    cached = await cache.get(cache_key)
    if cached:
        return json.loads(cached)

    response = await client.chat.completions.create(
        model="Qwen2.5-7B-Instruct",
        messages=[
            {"role": "system", "content": "你是企业AI助手"},
            {"role": "user", "content": req.message}
        ],
        temperature=req.temperature,
        stream=False,
    )
    result = {"reply": response.choices[0].message.content}
    await cache.setex(cache_key, 3600, json.dumps(result))  # 1h缓存
    return result

# 流式响应
@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    from fastapi.responses import StreamingResponse
    async def generate():
        async for chunk in await client.chat.completions.create(
            model="Qwen2.5-7B-Instruct",
            messages=[{"role": "user", "content": req.message}],
            stream=True
        ):
            if chunk.choices[0].delta.content:
                yield f"data: {chunk.choices[0].delta.content}\\n\\n"
    return StreamingResponse(generate(), media_type="text/event-stream")`
  },
  {
    name: '云平台部署', icon: '☁️', color: '#38bdf8',
    desc: 'AWS SageMaker / GCP Vertex AI：托管推理，自动扩缩容，无需运维 GPU 集群。',
    code: `# AWS SageMaker 部署（HuggingFace TGI 推理镜像）
import boto3
from sagemaker.huggingface import HuggingFaceModel

# 配置推理端点
hub = {
    'HF_MODEL_ID': 'Qwen/Qwen2.5-7B-Instruct',
    'HF_TASK': 'text-generation',
    'SM_NUM_GPUS': json.dumps(1),
    'MAX_INPUT_LENGTH': json.dumps(2048),
    'MAX_TOTAL_TOKENS': json.dumps(4096),
}
huggingface_model = HuggingFaceModel(
    image_uri=get_huggingface_llm_image_uri("huggingface", version="2.0"),
    env=hub,
    role=role,
)

# 部署端点（自动选择最优实例）
predictor = huggingface_model.deploy(
    initial_instance_count=1,
    instance_type="ml.g5.2xlarge",  # A10G 24GB
    container_startup_health_check_timeout=300,
)

# 调用
response = predictor.predict({
    "inputs": "你好，请介绍一下你自己",
    "parameters": {"temperature": 0.7, "max_new_tokens": 512}
})

# GCP Vertex AI（类似方式）
# gcloud ai endpoints deploy-model ...`
  },
];

export default function LessonDeploy() {
  const navigate = useNavigate();
  const [activeSolution, setActiveSolution] = useState(0);
  const [selectedQuant, setSelectedQuant] = useState(2); // INT8

  const sol = DEPLOY_SOLUTIONS[activeSolution];
  const q = QUANT_TYPES[selectedQuant];

  return (
    <div className="lesson-ai">
      <div className="ai-badge">🚀 module_07 — 部署与优化</div>
      <div className="ai-hero">
        <h1>部署与优化：量化 / vLLM / API 服务</h1>
        <p>训练好的模型如何高效服务？<strong>量化</strong>把 7B 模型从 14GB 压到 4GB；<strong>vLLM</strong> 的 PagedAttention 把吞吐提高 24x；<strong>语义缓存</strong>再减少 60% 重复调用成本。</p>
      </div>

      {/* 量化选择器 */}
      <div className="ai-section">
        <h2 className="ai-section-title">🔢 量化精度选择器（以 7B 模型为例）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {QUANT_TYPES.map((qt, i) => (
            <button key={i} onClick={() => setSelectedQuant(i)}
              style={{ flex: 1, minWidth: 120, padding: '0.65rem', borderRadius: '9px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.2s',
                border: `1px solid ${selectedQuant === i ? qt.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: selectedQuant === i ? `${qt.color}12` : 'rgba(255,255,255,0.02)',
                color: selectedQuant === i ? qt.color : '#3b2d6b' }}>
              {qt.bits}bit
              <div style={{ fontSize: '0.68rem', fontWeight: 400, marginTop: '0.1rem' }}>{qt.name.split('（')[0].split(' ')[0]}</div>
            </button>
          ))}
        </div>

        <div className="ai-card" style={{ borderColor: `${q.color}25` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.875rem', textAlign: 'center' }}>
            {[
              { label: '模型大小', value: q.size, color: q.color },
              { label: '推理速度（tokens/s）', value: q.tps, color: '#10b981' },
              { label: '状态', value: q.status.split(' ').slice(1).join(' '), color: q.status.startsWith('✅') ? '#10b981' : q.status.startsWith('⚠️') ? '#fbbf24' : '#f87171' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '0.68rem', color: '#3b2d6b', marginBottom: '0.2rem' }}>{item.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: item.color, fontFamily: 'JetBrains Mono' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* 相对速度条 */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#3b2d6b', marginBottom: '0.25rem' }}>推理吞吐量（tokens/s）</div>
            <div className="ai-meter">
              <div className="ai-meter-fill" style={{ width: `${(+q.tps / 200) * 100}%`, background: `linear-gradient(90deg,${q.color}60,${q.color})` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 部署方案 */}
      <div className="ai-section">
        <h2 className="ai-section-title">🛠️ 四种部署方案（切换查看配置）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {DEPLOY_SOLUTIONS.map((s, i) => (
            <button key={i} onClick={() => setActiveSolution(i)}
              style={{ flex: 1, minWidth: 120, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeSolution === i ? s.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeSolution === i ? `${s.color}10` : 'rgba(255,255,255,0.02)',
                color: activeSolution === i ? s.color : '#3b2d6b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{s.icon}</div>
              {s.name}
            </button>
          ))}
        </div>

        <div style={{ padding: '0.6rem 0.875rem', background: `${sol.color}08`, borderRadius: '8px', fontSize: '0.82rem', color: '#3b2d6b', marginBottom: '0.625rem' }}>
          {sol.desc}
        </div>

        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} />
            <div className="ai-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ai-code-dot" style={{ background: sol.color }} />
            <span style={{ marginLeft: '0.5rem', color: sol.color }}>{sol.icon} {sol.name} — 部署配置</span>
          </div>
          <div className="ai-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{sol.code}</div>
        </div>
      </div>

      {/* 成本优化 */}
      <div className="ai-section">
        <h2 className="ai-section-title">💰 LLM 服务成本优化三板斧</h2>
        <div className="ai-grid-3">
          {[
            { icon: '🗄️', name: '语义缓存', desc: '相同/相似问题复用结果。工具：GPTCache + 向量相似度。命中率 30-70%，成本减半。', color: '#10b981' },
            { icon: '📦', name: '批处理推理', desc: '将多个请求合并一次推理（Batching）。vLLM 自动处理，GPU 利用率从 20% 提升到 80%+。', color: '#a78bfa' },
            { icon: '🔀', name: '模型路由', desc: '简单问题 → 小模型（Qwen-1.5B，成本极低）；复杂问题 → 大模型（GPT-4o）。平均成本降低 60%。', color: '#f59e0b' },
          ].map(item => (
            <div key={item.name} className="ai-card" style={{ borderColor: `${item.color}20`, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: item.color, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#3b2d6b', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/llm-dev/lesson/finetune')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/llm-dev/lesson/project')}>下一模块：生产实战 →</button>
      </div>
    </div>
  );
}
