import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const SERVING_CODE = `# 模型服务化：TorchServe / Triton / FastAPI 推理 API

# ══════════════ 1. FastAPI 轻量推理服务（快速上线）══════════════
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import torch
import torchvision.transforms as T
from PIL import Image
import io, time

app = FastAPI(title="图像分类 API", version="1.0")

# 启动时加载模型（单例，避免重复加载）
model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASSES = ["猫", "狗", "鸟", "鱼", "兔子"]

@app.on_event("startup")
async def load_model():
    global model
    model = torch.load("best_model.pt", map_location=device)
    model.eval()
    print(f"✅ 模型加载完成，设备: {device}")

transform = T.Compose([
    T.Resize(256), T.CenterCrop(224), T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    start = time.perf_counter()
    
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)  # [1, 3, 224, 224]
    
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1).squeeze()
        top5 = torch.topk(probs, 5)
    
    results = [
        {"class": CLASSES[i], "probability": round(p.item(), 4)}
        for i, p in zip(top5.indices.tolist(), top5.values.tolist())
    ]
    
    return JSONResponse({
        "predictions": results,
        "latency_ms": round((time.perf_counter() - start) * 1000, 2)
    })

@app.get("/health")
def health(): return {"status": "healthy", "device": str(device)}

# ══════════════ 2. TorchServe（PyTorch官方服务框架）══════════════
# 1. 打包模型
# $ torch-model-archiver \\
#     --model-name image_classifier \\
#     --version 1.0 \\
#     --model-file model.py \\
#     --serialized-file best_model.pt \\
#     --handler image_classifier \\
#     --extra-files class_names.json

# 2. 启动服务器（支持 REST + gRPC）
# $ torchserve --start --model-store model_store --models image_classifier.mar
# 默认端口：推理 8080，管理 8081，指标 8082

# 3. 调用 API
# $ curl -X POST http://localhost:8080/predictions/image_classifier \\
#       -T cat.jpg

# TorchServe 优势：多模型热更新、A/B测试权重路由、内置指标

# ══════════════ 3. NVIDIA Triton（大规模推理首选）══════════════
# 支持 PyTorch / ONNX / TensorRT / OpenVINO 混合部署
import tritonclient.http as httpclient
import numpy as np

client = httpclient.InferenceServerClient(url="localhost:8000")

# 准备输入
input0 = httpclient.InferInput("input__0", [1, 3, 224, 224], "FP32")
input0.set_data_from_numpy(np.random.rand(1, 3, 224, 224).astype(np.float32))

# 推理
response = client.infer(model_name="resnet50", inputs=[input0])
output = response.as_numpy("output__0")   # [1, 1000]

# Triton 性能优势：
# - 动态 Batching（自动把多个请求合并为一个 batch，提升 GPU 利用率）
# - 并发模型实例（同一模型运行多个副本）
# - 模型集成（预处理 → 推理 → 后处理 流水线化）

# ══════════════ 4. ONNX 导出（跨框架部署）══════════════
import torch.onnx

# 导出 PyTorch → ONNX
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model, dummy_input, "model.onnx",
    input_names=["input"], output_names=["output"],
    dynamic_axes={"input": {0: "batch_size"}},   # 支持动态 batch
    opset_version=17,
    verbose=False,
)

# ONNX Runtime 推理（CPU 加速 3-5x vs 原始 PyTorch）
import onnxruntime as ort
sess = ort.InferenceSession("model.onnx", providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
result = sess.run(None, {"input": dummy_input.numpy()})

# ══════════════ 5. 延迟 & 吞吐量基准测试 ══════════════
import time, asyncio

async def benchmark(endpoint: str, n_requests: int = 1000):
    import aiohttp
    latencies = []
    async with aiohttp.ClientSession() as session:
        for _ in range(n_requests):
            start = time.perf_counter()
            async with session.post(endpoint, data={"file": open("test.jpg", "rb")}) as resp:
                await resp.json()
            latencies.append((time.perf_counter() - start) * 1000)
    
    p50 = sorted(latencies)[len(latencies)//2]
    p99 = sorted(latencies)[int(len(latencies)*0.99)]
    print(f"P50: {p50:.1f}ms | P99: {p99:.1f}ms | QPS: {n_requests/sum(latencies)*1000:.1f}")`;

const SERVING_OPTIONS = [
  { name: 'FastAPI + PyTorch', useCase: '快速原型/小流量', throughput: '~100 QPS', latency: '~50ms', complexity: '低', color: '#10b981' },
  { name: 'TorchServe',        useCase: '中等规模/多模型', throughput: '~500 QPS', latency: '~20ms', complexity: '中', color: '#f97316' },
  { name: 'NVIDIA Triton',     useCase: '大规模/高并发',   throughput: '5000+ QPS', latency: '~5ms', complexity: '高', color: '#3b82f6' },
  { name: 'ONNX Runtime',      useCase: '跨平台/CPU部署', throughput: '~800 QPS', latency: '~15ms', complexity: '中', color: '#8b5cf6' },
];

export default function LessonServing() {
  const navigate = useNavigate();
  return (
    <div className="lesson-ml">
      <div className="ml-badge blue">🚀 module_07 — 模型服务化</div>
      <div className="ml-hero">
        <h1>模型服务化：FastAPI / TorchServe / Triton / ONNX 推理</h1>
        <p>训练好的模型必须能被业务系统调用才有价值。<strong>FastAPI</strong> 10分钟上线，<strong>TorchServe</strong> 支持多模型热更新，<strong>Triton</strong> 动态 Batching 让 GPU 利用率接近100%，<strong>ONNX</strong> 跨框架无缝部署。</p>
      </div>
      <div className="ml-interactive">
        <h3>⚡ 服务化方案选型对比</h3>
        <div className="ml-grid-2">
          {SERVING_OPTIONS.map(opt => (
            <div key={opt.name} className="ml-card" style={{ borderColor: `${opt.color}22` }}>
              <div style={{ fontWeight: 800, color: opt.color, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{opt.name}</div>
              {[['适用场景', opt.useCase], ['吞吐量', opt.throughput], ['延迟', opt.latency], ['复杂度', opt.complexity]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.15rem' }}>
                  <span style={{ color: '#6b7280' }}>{k}</span>
                  <span style={{ fontFamily: k === '吞吐量' || k === '延迟' ? 'JetBrains Mono' : 'Inter', color: '#9ca3af', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="ml-section">
        <h2 className="ml-section-title">🔧 服务化完整代码（FastAPI / TorchServe / Triton / ONNX）</h2>
        <div className="ml-code-wrap">
          <div className="ml-code-head"><div className="ml-code-dot" style={{ background: '#3b82f6' }}/><div className="ml-code-dot" style={{ background: '#10b981' }}/><div className="ml-code-dot" style={{ background: '#f97316' }}/><span style={{ color: '#60a5fa', marginLeft: '0.5rem' }}>🚀 model_serving.py</span></div>
          <div className="ml-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{SERVING_CODE}</div>
        </div>
      </div>
      <div className="ml-nav">
        <button className="ml-btn" onClick={() => navigate('/course/ml-engineering/lesson/mlops')}>← 上一模块</button>
        <button className="ml-btn primary" onClick={() => navigate('/course/ml-engineering/lesson/monitoring')}>下一模块：生产监控 →</button>
      </div>
    </div>
  );
}
