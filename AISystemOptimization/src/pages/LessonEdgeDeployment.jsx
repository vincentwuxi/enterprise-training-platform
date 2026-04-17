import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'onnx', title: 'ONNX Runtime', icon: '🔷' },
  { id: 'mobile', title: '移动端部署', icon: '📱' },
  { id: 'webgpu', title: 'WebGPU / WASM', icon: '🌐' },
  { id: 'hardware', title: '端侧硬件选型', icon: '🔧' },
];

export default function LessonEdgeDeployment() {
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
        {active === 'onnx' && <ONNXSection />}
        {active === 'mobile' && <MobileSection />}
        {active === 'webgpu' && <WebGPUSection />}
        {active === 'hardware' && <HardwareSection />}
      </div>
    </div>
  );
}

function ONNXSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔷</span>ONNX Runtime — 跨平台推理</h2>
      <p className="section-desc">ONNX (Open Neural Network Exchange) 是模型互操作标准。ONNX Runtime 支持 <strong>CPU/GPU/NPU</strong> 多后端，是边缘部署的基础设施。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>PyTorch → ONNX 导出</h3>
          <div className="code-block">
{`import torch
import onnxruntime as ort

# 1. 导出 ONNX
model = load_model().eval()

dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model, dummy_input,
    "model.onnx",
    input_names=["image"],
    output_names=["logits"],
    dynamic_axes={
        "image": {0: "batch"},
        "logits": {0: "batch"},
    },
    opset_version=18,
)

# 2. ONNX 图优化
from onnxruntime.transformers import optimizer
opt_model = optimizer.optimize_model(
    "model.onnx",
    model_type="bert",
    opt_level=2,          # 最大优化
    use_gpu=True,
)
opt_model.save_model_to_file("model_opt.onnx")

# 3. 推理
session = ort.InferenceSession(
    "model_opt.onnx",
    providers=["CUDAExecutionProvider",
               "CPUExecutionProvider"]
)
result = session.run(None, {"image": input_np})`}
          </div>
        </div>

        <div className="info-card">
          <h3>ONNX Runtime 优化选项</h3>
          <table className="data-table">
            <thead>
              <tr><th>优化</th><th>效果</th><th>适用平台</th></tr>
            </thead>
            <tbody>
              <tr><td>Graph Optimization (L1/L2)</td><td>算子融合、常量折叠</td><td>通用</td></tr>
              <tr><td>INT8 量化 (QDQ)</td><td>2-4× CPU 加速</td><td>x86 / ARM</td></tr>
              <tr><td>FP16 自动转换</td><td>2× GPU 加速</td><td>CUDA</td></tr>
              <tr><td>IO Binding</td><td>减少 CPU↔GPU 拷贝</td><td>GPU</td></tr>
              <tr><td>DirectML Provider</td><td>Windows GPU 加速</td><td>Windows</td></tr>
              <tr><td>CoreML Provider</td><td>Apple 芯片加速</td><td>macOS / iOS</td></tr>
              <tr><td>QNN Provider</td><td>Qualcomm NPU</td><td>Android</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function MobileSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📱</span>移动端 AI 部署</h2>
      <p className="section-desc">在手机/平板上运行 AI 模型，需要极致的模型压缩和硬件加速。主流方案包括 <strong>Core ML (Apple)、TFLite (Android)、MLC-LLM (跨平台 LLM)</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Core ML (Apple 生态)</h3>
          <div className="code-block">
{`# PyTorch → Core ML 转换
import coremltools as ct

# 1. 转换模型
mlmodel = ct.convert(
    traced_model,
    inputs=[ct.TensorType(shape=(1, 3, 224, 224))],
    compute_precision=ct.precision.FLOAT16,
    compute_units=ct.ComputeUnit.ALL,  # CPU+GPU+NPU
    minimum_deployment_target=ct.target.iOS17,
)
mlmodel.save("model.mlpackage")

# 2. Swift 端推理
# import CoreML
# let model = try MyModel(configuration: config)
# let output = try model.prediction(image: pixelBuffer)

# Apple 芯片 Neural Engine 性能:
# ┌────────┬──────────┬─────────┐
# │ 芯片    │ NPU 算力  │ 带宽    │
# ├────────┼──────────┼─────────┤
# │ A17 Pro│ 35 TOPS  │ 高      │
# │ M4     │ 38 TOPS  │ 极高    │
# │ M4 Max │ 38 TOPS  │ 400GB/s │
# └────────┴──────────┴─────────┘`}
          </div>
        </div>

        <div className="info-card">
          <h3>MLC-LLM (端侧大模型)</h3>
          <div className="code-block">
{`# MLC-LLM: 在手机上跑 LLM
# 支持 iOS / Android / Web / PC

# 1. 编译模型
mlc_llm compile \\
  --model Qwen2.5-3B-Instruct \\
  --quantization q4f16_1 \\
  --device iphone           # 或 android

# 2. 端侧性能 (iPhone 15 Pro)
# ┌─────────────┬──────────┬──────────┐
# │ 模型         │ 大小     │ Tokens/s │
# ├─────────────┼──────────┼──────────┤
# │ Phi-3-mini   │ 2.3 GB  │ 25 t/s   │
# │ Llama-3.2-3B │ 1.8 GB  │ 30 t/s   │
# │ Qwen2.5-3B   │ 1.9 GB  │ 28 t/s   │
# │ Gemma-2-2B   │ 1.4 GB  │ 35 t/s   │
# └─────────────┴──────────┴──────────┘

# 3. 端云协同架构
# 简单query → 端侧 3B 模型 (免费, 低延迟)
# 复杂query → 云端 70B 模型 (高质量)
# Router 决策: 基于 query 复杂度路由`}
          </div>
        </div>
      </div>
    </section>
  );
}

function WebGPUSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🌐</span>WebGPU / WASM — 浏览器 AI</h2>
      <p className="section-desc">WebGPU 让浏览器直接访问 GPU，配合 WASM 可在网页中运行 AI 模型，<strong>零安装、数据不出浏览器</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>WebGPU AI 框架</h3>
          <div className="code-block">
{`# 1. WebLLM (MLC 团队)
import { CreateMLCEngine } from "@mlc-ai/web-llm";

const engine = await CreateMLCEngine(
  "Llama-3.2-1B-Instruct-q4f16_1-MLC"
);

const reply = await engine.chat.completions.create({
  messages: [{ role: "user", content: "Hello!" }],
  stream: true,
});

# 2. Transformers.js (HuggingFace)
import { pipeline } from "@xenova/transformers";

const classifier = await pipeline(
  "sentiment-analysis",
  "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
  { device: "webgpu" }
);

const result = await classifier("I love WebGPU!");

# 3. ONNX Runtime Web
import * as ort from "onnxruntime-web/webgpu";
const session = await ort.InferenceSession.create(
  "model.onnx",
  { executionProviders: ["webgpu"] }
);`}
          </div>
        </div>

        <div className="info-card">
          <h3>浏览器 AI 性能</h3>
          <table className="data-table">
            <thead>
              <tr><th>模型</th><th>运行时</th><th>Chrome (M4 Mac)</th><th>Chrome (RTX 4090)</th></tr>
            </thead>
            <tbody>
              <tr><td>Llama-3.2-1B (Q4)</td><td>WebLLM</td><td>~20 t/s</td><td>~45 t/s</td></tr>
              <tr><td>Phi-3-mini (Q4)</td><td>WebLLM</td><td>~15 t/s</td><td>~35 t/s</td></tr>
              <tr><td>Whisper-base</td><td>Transformers.js</td><td>~3× realtime</td><td>~8× realtime</td></tr>
              <tr><td>BERT-base (推理)</td><td>ONNX Web</td><td>~5ms</td><td>~2ms</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 WebGPU 适用场景</h4>
        <ul>
          <li><strong>隐私敏感</strong> — 医疗、法律、金融文档处理，数据不离开用户设备</li>
          <li><strong>实时交互</strong> — 文本自动补全、实时翻译、语音转文字</li>
          <li><strong>离线使用</strong> — PWA + 模型缓存，无网络也能工作</li>
        </ul>
      </div>
    </section>
  );
}

function HardwareSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔧</span>端侧硬件选型</h2>
      <p className="section-desc">根据部署场景选择合适的推理硬件，平衡 <strong>性能、功耗、成本和生态</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>端侧推理硬件对比</h3>
          <table className="data-table">
            <thead>
              <tr><th>硬件</th><th>AI 算力</th><th>功耗</th><th>价格</th><th>典型场景</th></tr>
            </thead>
            <tbody>
              <tr><td>NVIDIA Jetson Orin NX</td><td>100 TOPS INT8</td><td>25W</td><td>$600</td><td>机器人/自动驾驶</td></tr>
              <tr><td>Raspberry Pi 5 + Hailo-8</td><td>26 TOPS</td><td>5+8W</td><td>$150</td><td>智能摄像头</td></tr>
              <tr><td>Google Coral TPU</td><td>4 TOPS INT8</td><td>2W</td><td>$60</td><td>分类/检测</td></tr>
              <tr><td>Qualcomm 8 Gen 3</td><td>73 TOPS</td><td>~5W</td><td>-</td><td>手机端 LLM</td></tr>
              <tr><td>Intel NPU (Meteor Lake)</td><td>11 TOPS</td><td>~5W</td><td>-</td><td>笔记本 AI</td></tr>
              <tr><td>Apple M4 Neural Engine</td><td>38 TOPS</td><td>~10W</td><td>-</td><td>Mac/iPad AI</td></tr>
            </tbody>
          </table>
        </div>

        <div className="info-card">
          <h3>选型决策流程</h3>
          <div className="code-block">
{`端侧推理场景?
  │
  ├── LLM 对话 (1-3B 模型)
  │   ├── 手机: Qualcomm/Apple NPU + MLC-LLM
  │   ├── PC:  GPU/NPU + Ollama/LM Studio
  │   └── Web: WebGPU + WebLLM
  │
  ├── 视觉 (检测/分割)
  │   ├── 室内/低功耗: Coral TPU + TFLite
  │   ├── 室外/高性能: Jetson Orin + TensorRT
  │   └── 消费电子: Qualcomm QNN
  │
  ├── 语音 (ASR/TTS)
  │   ├── 端侧 Whisper: Core ML / ONNX
  │   └── 流式 ASR: WebSocket + 云端
  │
  └── 多模态 (VLM)
      ├── 手机: Phi-3-Vision + MLC
      └── 边缘盒子: Jetson + INT4 VLM`}
          </div>
        </div>
      </div>
    </section>
  );
}
