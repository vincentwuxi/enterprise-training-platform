import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Realtime API', 'Gemini Live', 'WebRTC 集成', '流式架构'];

export default function LessonRealtimeVoice() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🎙️ module_01 — 实时语音 AI</div>
      <div className="fs-hero">
        <h1>实时语音 AI：GPT-4o Realtime API / Gemini Live / WebRTC — 下一代人机对话</h1>
        <p>
          2024-2025 年，AI 交互从<strong>文本对话跃迁到实时语音</strong>。
          OpenAI GPT-4o Realtime API 实现了端到端语音模型 (无需 ASR→LLM→TTS 管线)，
          Google Gemini Live 带来多模态实时交互。本模块带你掌握
          WebSocket/WebRTC 实时通信架构、VAD 语音活动检测、
          流式处理和延迟优化，构建生产级语音 AI 应用。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎙️ 实时语音</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ GPT-4o Realtime API</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> realtime_api</div>
              <pre className="fs-code">{`# GPT-4o Realtime API: 端到端语音大模型

# ═══ 革命性变化 ═══
# 传统管线: 用户语音 → ASR → 文本 → LLM → 文本 → TTS → 语音
# 延迟: 300ms + 500ms + 200ms = ~1s+ (不自然)
# GPT-4o Realtime: 用户语音 → 端到端模型 → 语音
# 延迟: ~200-400ms (接近人类对话)

# ═══ 核心特性 ═══
realtime_features = {
    "端到端": "原生语音输入/输出, 非 ASR+TTS 拼接",
    "情感保留": "保留语气/情感/韵律 (传统 ASR 丢失)",
    "多模态": "同时理解语音+文本+图像",
    "打断处理": "原生支持用户随时打断 (natural turn-taking)",
    "函数调用": "语音对话中触发 Function Calling",
    "流式输出": "边推理边输出语音 (无需等待完整回复)",
}

# ═══ WebSocket 连接 ═══
import websockets
import json
import base64

async def realtime_session():
    url = "wss://api.openai.com/v1/realtime"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "OpenAI-Beta": "realtime=v1",
    }
    
    async with websockets.connect(url, extra_headers=headers) as ws:
        # 1. 创建会话
        await ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": "你是一个友好的中文语音助手",
                "voice": "alloy",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",  # 服务端 VAD
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 500,
                },
            }
        }))
        
        # 2. 流式发送音频 (PCM16, 24kHz, mono)
        audio_chunk = capture_microphone()  # 实时采集
        await ws.send(json.dumps({
            "type": "input_audio_buffer.append",
            "audio": base64.b64encode(audio_chunk).decode()
        }))
        
        # 3. 接收响应 (流式)
        async for msg in ws:
            event = json.loads(msg)
            if event["type"] == "response.audio.delta":
                audio = base64.b64decode(event["delta"])
                play_audio(audio)  # 实时播放
            elif event["type"] == "response.audio.done":
                print("响应完成")

# ═══ 定价 ═══
# 输入: $0.06/min (语音) | $5/1M tokens (文本)
# 输出: $0.24/min (语音) | $20/1M tokens (文本)
# → 1分钟对话约 $0.30 → 1小时 $18`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🌐 Gemini Live</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> gemini_live</div>
              <pre className="fs-code">{`# Gemini Live: Google 的实时多模态 AI

# ═══ Gemini 2.0 Live API ═══
# 特点: 原生多模态 + 更长上下文 + 更低成本
# 支持: 语音 + 视频 + 屏幕共享 + 文本

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

# ═══ 实时语音会话 ═══
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {
            "prebuilt_voice_config": {
                "voice_name": "Kore"  # 多种语音可选
            }
        }
    }
}

async with client.aio.live.connect(
    model="gemini-2.0-flash-exp",
    config=config
) as session:
    # 发送音频流
    audio_data = capture_audio_chunk()
    await session.send(
        input={"data": audio_data, "mime_type": "audio/pcm"},
        end_of_turn=True
    )
    
    # 接收响应
    async for response in session.receive():
        if response.data:
            play_audio(response.data)  # PCM 音频
        if response.text:
            print(response.text)  # 文本转写

# ═══ GPT-4o vs Gemini Live 对比 ═══
comparison = {
    "延迟": {
        "GPT-4o":  "200-400ms (端到端)",
        "Gemini":  "300-500ms (稍慢)",
    },
    "语音质量": {
        "GPT-4o":  "非常自然, 情感丰富",
        "Gemini":  "自然, 情感表达改善中",
    },
    "多模态": {
        "GPT-4o":  "语音+文本+图片",
        "Gemini":  "语音+视频+屏幕+文本 (更全)",
    },
    "上下文长度": {
        "GPT-4o":  "128K tokens",
        "Gemini":  "1M tokens (优势)",
    },
    "成本": {
        "GPT-4o":  "$0.30/min 对话",
        "Gemini":  "~$0.05/min (Flash 版更便宜)",
    },
    "开放性": {
        "GPT-4o":  "闭源 API",
        "Gemini":  "API + Vertex AI 企业版",
    },
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📡 WebRTC 集成</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> webrtc_integration</div>
              <pre className="fs-code">{`# WebRTC + AI: 浏览器端实时语音通信

# ═══ 为什么用 WebRTC? ═══
# WebSocket: 半双工, 需手动管理音频采集/播放
# WebRTC: 全双工, 浏览器原生音视频支持, P2P
# → 更低延迟, 更好的音频质量, 回声消除/噪声抑制

# ═══ 架构选择 ═══
architectures = {
    "WebSocket 方案": {
        "流程": "浏览器 → WS → 后端 → AI API",
        "延迟": "中 (200-500ms 额外)",
        "优势": "简单, 服务端控制",
        "适合": "文本 + 简单语音",
    },
    "WebRTC 方案": {
        "流程": "浏览器 ← WebRTC → AI 服务",
        "延迟": "低 (<100ms 传输)",
        "优势": "全双工, 浏览器原生回声消除",
        "适合": "实时语音对话",
    },
    "OpenAI Realtime + WebRTC": {
        "流程": "浏览器 ← WebRTC → OpenAI 直连",
        "延迟": "最低 (直连模型)",
        "优势": "官方支持, 极简实现",
        "适合": "最佳体验",
    },
}

# ═══ 浏览器端实现 ═══
browser_code = '''
// 1. 获取麦克风权限
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 24000,
  }
});

// 2. 创建 RTCPeerConnection
const pc = new RTCPeerConnection();

// 3. 添加音频轨道
stream.getAudioTracks().forEach(track => {
  pc.addTrack(track, stream);
});

// 4. 接收 AI 返回的音频轨道
pc.ontrack = (event) => {
  const audio = new Audio();
  audio.srcObject = event.streams[0];
  audio.play();  // 播放 AI 语音
};

// 5. 连接 OpenAI Realtime (WebRTC 模式)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const response = await fetch("/api/realtime/connect", {
  method: "POST",
  body: JSON.stringify({ sdp: offer.sdp }),
  headers: { "Content-Type": "application/json" },
});

const answer = await response.json();
await pc.setRemoteDescription(
  new RTCSessionDescription(answer)
);
'''

# ═══ 音频处理要点 ═══
audio_processing = {
    "采样率":     "24kHz (Realtime API 要求)",
    "格式":       "PCM16, mono, little-endian",
    "回声消除":   "浏览器 AEC, 必须启用",
    "噪声抑制":   "浏览器 NS + 服务端降噪",
    "自动增益":   "AGC, 适应不同麦克风",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 流式处理架构</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> streaming_arch</div>
              <pre className="fs-code">{`# 实时语音 AI 的流式处理架构

# ═══ 端到端延迟分解 ═══
latency_breakdown = {
    "用户说话结束检测 (VAD)": "200-500ms",
    "音频上传":               "50-100ms (WebRTC)",
    "AI 推理 (首 token)":     "200-400ms",
    "音频下载":               "50-100ms",
    "总计":                   "500-1100ms → 目标 <600ms",
}

# ═══ 优化策略 ═══
optimization = {
    "VAD 调优": {
        "方法": "降低 silence_duration 到 300-500ms",
        "风险": "过低导致误判 (用户只是停顿)",
        "工具": "Silero VAD (开源, 精度高)",
    },
    "预取": {
        "方法": "VAD 检测到说话时即开始上传",
        "效果": "重叠传输和处理, 减少 ~200ms",
    },
    "流式输出": {
        "方法": "模型边推理边输出音频片段",
        "效果": "用户不需等完整回复 → 感知延迟 <500ms",
    },
    "边缘部署": {
        "方法": "AI 推理部署在边缘节点 (CDN PoP)",
        "效果": "减少网络往返 100-200ms",
    },
}

# ═══ 生产架构 ═══
# ┌──────────┐    WebRTC     ┌──────────────┐
# │  浏览器   │ ◄──────────► │ 信令服务器    │
# │  (VAD +   │              │ (TURN/STUN)  │
# │  AEC)    │              └──────┬───────┘
# └──────────┘                     │
#                                  │ gRPC/WS
#                           ┌──────┴───────┐
#                           │ AI 网关      │
#                           │ (路由/限流)  │
#                           └──────┬───────┘
#                                  │
#                    ┌─────────────┼─────────────┐
#                    │             │              │
#              ┌─────┴─────┐ ┌────┴────┐ ┌──────┴──────┐
#              │ GPT-4o    │ │ Gemini  │ │ 自部署      │
#              │ Realtime  │ │ Live    │ │ Whisper+LLM │
#              └───────────┘ └─────────┘ └─────────────┘

# ═══ 并发和成本 ═══
# 每个 Realtime API 连接 = 一个独占的模型实例
# 1000 并发 ≈ $18K/小时 (GPT-4o) → 需要智能路由
# 策略: 简单问题 → Flash/本地模型, 复杂问题 → GPT-4o`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
