import React from 'react';
import './LessonCommon.css';

export default function LessonVoiceDeployment() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🚀 模块八：语音产品部署 — WebRTC / 流式推理 / 端侧 ASR</h1>
      <p className="lesson-subtitle">
        从实验到量产，掌握语音系统的高可用低延迟工程化部署全链路
      </p>

      <section className="lesson-section">
        <h2>1. 语音系统架构设计</h2>
        <div className="concept-card">
          <h3>🏗️ 生产级架构</h3>
          <div className="code-block">
{`# 语音系统生产架构
"""
┌─────────────────────────────────────────────────────┐
│                     客户端                           │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐         │
│  │ 浏览器    │  │ iOS/安卓 │  │ 嵌入式   │         │
│  │ WebRTC    │  │ gRPC     │  │ WebSocket│         │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘         │
│        └──────────────┼──────────────┘               │
└───────────────────────┼──────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────┐
│  网关层               ▼                              │
│  ┌────────────────────────────────────────┐          │
│  │ Nginx / Envoy (WebSocket/gRPC 代理)   │          │
│  │ 负载均衡 + SSL 终止 + 速率限制         │          │
│  └────────────────────┬───────────────────┘          │
│                       │                              │
│  服务层               ▼                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ VAD  │→│ ASR  │→│ LLM  │→│ TTS  │           │
│  │      │  │ GPU  │  │ GPU  │  │ GPU  │           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
│       ↕         ↕          ↕         ↕              │
│  ┌─────────────────────────────────────┐            │
│  │ 消息队列 (Redis Streams / Kafka)    │            │
│  └─────────────────────────────────────┘            │
│       ↕                                             │
│  ┌─────────────────────────────────────┐            │
│  │ 存储: 音频 (S3) / 日志 (ES) / 缓存 │            │
│  └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. WebRTC 低延迟传输</h2>
        <div className="concept-card">
          <h3>📡 WebRTC 语音集成</h3>
          <div className="code-block">
{`# WebRTC 核心优势:
# - P2P 传输, 最低延迟 (<100ms)
# - 内置 AEC (回声消除) + NS (噪声抑制) + AGC (自动增益)
# - 浏览器原生支持, 无需插件
# - SRTP 加密传输

# 前端: WebRTC 音频采集
"""
// JavaScript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    sampleRate: 16000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  }
});

const audioContext = new AudioContext({ sampleRate: 16000 });
const source = audioContext.createMediaStreamSource(stream);
const processor = audioContext.createScriptProcessor(4096, 1, 1);

processor.onaudioprocess = (e) => {
  const pcmData = e.inputBuffer.getChannelData(0);
  // 发送 PCM 到后端 (WebSocket / DataChannel)
  ws.send(float32ToInt16(pcmData).buffer);
};
source.connect(processor);
processor.connect(audioContext.destination);
"""

# 后端: FastAPI WebSocket 接收音频流
import asyncio
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/voice")
async def voice_endpoint(websocket: WebSocket):
    await websocket.accept()
    asr_session = create_streaming_asr()
    
    try:
        while True:
            # 接收音频 chunk
            audio_bytes = await websocket.receive_bytes()
            
            # 流式 ASR
            text = asr_session.feed(audio_bytes)
            if text:
                # 流式 LLM
                async for token in llm_stream(text):
                    # 流式 TTS
                    audio_chunk = tts_stream(token)
                    if audio_chunk:
                        await websocket.send_bytes(audio_chunk)
    except Exception:
        await websocket.close()`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 端侧 ASR 部署</h2>
        <div className="concept-card">
          <h3>📱 端侧语音推理</h3>
          <div className="code-block">
{`# Sherpa-ONNX: 跨平台端侧语音推理
"""
支持平台: iOS / Android / Linux / Windows / macOS / WASM
支持任务: ASR / TTS / VAD / 说话人识别 / KWS
格式: ONNX → 跨平台统一

模型选择 (端侧 ASR):
┌─────────────────┬──────────┬───────┬──────────┐
│ 模型            │ 大小     │ WER   │ 平台     │
├─────────────────┼──────────┼───────┼──────────┤
│ Zipformer (小)  │ 15 MB    │ ~8%   │ 全平台   │
│ Paraformer (小) │ 40 MB    │ ~5%   │ 全平台   │
│ Whisper Tiny    │ 75 MB    │ ~12%  │ 全平台   │
│ Sensevoice      │ 230 MB   │ ~4%   │ GPU      │
└─────────────────┴──────────┴───────┴──────────┘
"""

import sherpa_onnx

# 离线 ASR (端侧)
recognizer = sherpa_onnx.OfflineRecognizer.from_paraformer(
    paraformer="model/paraformer.onnx",
    tokens="model/tokens.txt",
    num_threads=4,
    sample_rate=16000,
    feature_dim=80,
    decoding_method="greedy_search",
)

stream = recognizer.create_stream()
stream.accept_waveform(16000, audio_samples)
recognizer.decode(stream)
print(stream.result.text)

# 流式 ASR (端侧)
recognizer_stream = sherpa_onnx.OnlineRecognizer.from_zipformer2(
    tokens="model/tokens.txt",
    encoder="model/encoder.onnx",
    decoder="model/decoder.onnx",
    joiner="model/joiner.onnx",
)

# Whisper.cpp (C++ 高性能推理)
"""
# 编译
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp && make

# 量化模型
./quantize models/ggml-large-v3.bin models/ggml-large-v3-q5_0.bin q5_0

# 推理
./main -m models/ggml-large-v3-q5_0.bin -l zh -f audio.wav
# Apple Silicon: CoreML 加速
./main -m models/ggml-large-v3-encoder.mlmodelc -l zh -f audio.wav
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 性能监控与优化</h2>
        <div className="info-box">
          <h3>📋 语音服务 SLA 指标</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>指标</th><th>目标</th><th>监控工具</th></tr>
            </thead>
            <tbody>
              <tr><td>ASR 首字延迟</td><td>&lt; 300ms (P95)</td><td>Prometheus + 自定义</td></tr>
              <tr><td>TTS 首包延迟</td><td>&lt; 200ms (P95)</td><td>Prometheus + 自定义</td></tr>
              <tr><td>E2E 延迟</td><td>&lt; 1000ms (P50)</td><td>端到端 trace</td></tr>
              <tr><td>识别准确率</td><td>CER &lt; 5%</td><td>定期采样评估</td></tr>
              <tr><td>并发承载</td><td>≥ 1000 路</td><td>压测 + Auto-Scaling</td></tr>
              <tr><td>可用性</td><td>99.95%</td><td>Health Check + 告警</td></tr>
              <tr><td>GPU 利用率</td><td>60-80%</td><td>DCGM / nvidia-smi</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>💰 成本优化策略</h3>
          <div className="code-block">
{`# 语音服务成本优化
cost_optimization = {
    "模型选择": {
        "高峰期": "Whisper Turbo (快速但精度稍低)",
        "低谷期": "Whisper Large-v3 (高精度)",
        "离线":   "批量处理, Spot 实例",
    },
    "缓存策略": {
        "TTS 缓存":   "高频文案预合成, Redis 缓存音频",
        "ASR 热词":   "领域热词表预加载",
        "LLM 缓存":   "常见问题答案缓存",
    },
    "资源调度": {
        "Auto-Scaling": "基于 QPS 自动扩缩 GPU 实例",
        "混合部署":     "ASR/TTS 共享 GPU, 动态分配",
        "Spot 实例":    "非实时任务用竞价实例 (70% 折扣)",
    },
    "架构优化": {
        "流式处理":  "避免全量缓冲, 逐 chunk 处理",
        "批量推理":  "相同模型请求合并 batch",
        "量化部署":  "INT8 量化, 速度翻倍",
    }
}

# 单路语音对话每月成本估算
"""
假设: 日均 10000 次对话, 平均每次 2 分钟

自建方案 (A100 80GB):
  GPU: 1 台 A100 可承载 ~100 并发
  月费: ~$15,000 (云), 含 ASR + LLM + TTS
  每次: ~$0.05

API 方案:
  Whisper API: ~$0.006/min
  GPT-4o:      ~$0.01/次
  Azure TTS:   ~$0.016/min
  每次:         ~$0.05
  月费:         ~$15,000

结论: 日 1 万次以上自建更划算
"""`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：音频处理</span>
        <span></span>
      </div>
    </div>
  );
}
