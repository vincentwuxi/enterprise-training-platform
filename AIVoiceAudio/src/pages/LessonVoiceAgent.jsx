import React from 'react';
import './LessonCommon.css';

export default function LessonVoiceAgent() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🤖 模块五：Voice Agent — 实时语音对话 / 低延迟管线 / VAD</h1>
      <p className="lesson-subtitle">
        构建像人一样自然对话的 AI 语音助手，从架构到毫秒级优化
      </p>

      <section className="lesson-section">
        <h2>1. Voice Agent 架构全景</h2>
        <div className="info-box">
          <h3>🏗️ Voice Agent 架构演进</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>架构</th><th>管线</th><th>延迟</th><th>自然度</th></tr>
            </thead>
            <tbody>
              <tr><td>级联式 (Cascaded)</td><td>ASR → LLM → TTS</td><td>2-5s</td><td>★★★</td></tr>
              <tr><td>半端到端</td><td>Audio → LLM → Audio Tokens → Vocoder</td><td>0.5-1.5s</td><td>★★★★</td></tr>
              <tr><td>全端到端</td><td>Audio → Multimodal LLM → Audio</td><td>0.3-0.8s</td><td>★★★★★</td></tr>
              <tr><td>全双工 (Moshi)</td><td>同时听 + 说, 多流</td><td>&lt;0.3s</td><td>★★★★★</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>📊 级联式 Voice Agent 延迟分解</h3>
          <div className="code-block">
{`# 典型级联式管线延迟分析
"""
用户说话结束
    ↓ VAD 检测尾部静音     ~300ms
    ↓ 音频传输             ~50ms
    ↓ ASR 处理             ~200-500ms
    ↓ LLM 首Token          ~200-800ms
    ↓ TTS 首包合成          ~100-500ms
    ↓ 音频传输 + 播放       ~50ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━
合计: 900ms - 2200ms (P50)

用户容忍阈值:
  < 500ms: 自然对话 (人对人水平)
  500-1000ms: 可接受
  1000-2000ms: 有延迟感
  > 2000ms: 体验差

优化目标: E2E P50 < 800ms
"""

# 延迟优化策略
optimization_strategies = {
    "VAD 缩短":    "尾部静音 300ms → 200ms (牺牲少量准确度)",
    "流式 ASR":    "Chunk 识别, 边说边出, 不等说完",
    "LLM 流式":    "Streaming output, 首 token 立即送 TTS",
    "TTS 流式":    "Chunk 合成, 首包 <100ms",
    "预生成":      "预测用户可能的回复, 预合成",
    "缓存":        "高频回复 TTS 缓存",
    "并行":        "ASR 最后 chunk 和 LLM 推理并行",
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. OpenAI Realtime API / LiveKit</h2>
        <div className="concept-card">
          <h3>⚡ OpenAI Realtime API 实战</h3>
          <div className="code-block">
{`import asyncio
import websockets
import json
import base64

# OpenAI Realtime API: 全端到端语音对话
async def voice_agent():
    url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "OpenAI-Beta": "realtime=v1"
    }
    
    async with websockets.connect(url, extra_headers=headers) as ws:
        # 配置会话
        await ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": "你是一个友好的中文语音助手。",
                "voice": "alloy",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {"model": "whisper-1"},
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 500
                },
                "temperature": 0.8,
            }
        }))
        
        # 发送音频流
        async def send_audio(audio_stream):
            async for chunk in audio_stream:
                audio_b64 = base64.b64encode(chunk).decode()
                await ws.send(json.dumps({
                    "type": "input_audio_buffer.append",
                    "audio": audio_b64
                }))
        
        # 接收响应
        async for message in ws:
            event = json.loads(message)
            if event["type"] == "response.audio.delta":
                audio_bytes = base64.b64decode(event["delta"])
                play_audio(audio_bytes)  # 流式播放
            elif event["type"] == "response.audio_transcript.delta":
                print(event["delta"], end="", flush=True)

# LiveKit Agent Framework (开源替代)
"""
LiveKit Agents:
  - 开源 Voice Agent 框架
  - 支持多种 ASR/LLM/TTS 插件
  - WebRTC 低延迟传输
  - 自动 VAD + 打断处理
  - 多房间/多用户并发
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. VAD 与打断处理</h2>
        <div className="concept-card">
          <h3>🎙️ VAD (Voice Activity Detection)</h3>
          <div className="code-block">
{`# Silero VAD: 最流行的 VAD 模型
import torch

model, utils = torch.hub.load(
    repo_or_dir='snakers4/silero-vad',
    model='silero_vad',
    trust_repo=True
)
(get_speech_timestamps, _, read_audio, _, _) = utils

wav = read_audio('conversation.wav', sampling_rate=16000)

# 检测语音段
speech_timestamps = get_speech_timestamps(
    wav, model,
    threshold=0.5,              # 语音概率阈值
    min_speech_duration_ms=250, # 最短语音段
    min_silence_duration_ms=300,# 断句静音长度
    speech_pad_ms=30,           # 语音段前后填充
    return_seconds=True
)
# [{'start': 0.5, 'end': 3.2}, {'start': 4.1, 'end': 7.8}, ...]

# 流式 VAD (逐 chunk 处理)
window_size_samples = 512  # 32ms @ 16kHz

for i in range(0, len(wav), window_size_samples):
    chunk = wav[i:i+window_size_samples]
    if len(chunk) < window_size_samples:
        break
    speech_prob = model(chunk, 16000).item()
    if speech_prob > 0.5:
        print(f"Speech at {i/16000:.2f}s (prob: {speech_prob:.2f})")

# 打断处理 (Barge-in)
"""
用户打断 AI 说话时的处理策略:

1. 检测打断:
   - AI 输出音频时持续监听麦克风
   - VAD 检测到用户语音 → 触发打断

2. 打断响应:
   - 立即停止 TTS 播放
   - 取消正在生成的 LLM/TTS 任务
   - 将已播放的 AI 文本加入上下文
   - 开始新一轮 ASR → LLM → TTS

3. 防误触:
   - 设置最小打断时长 (>300ms)
   - 区分回声 vs 真正打断 (AEC)
   - 忽略短促声音 (咳嗽/清嗓)
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 自建 Voice Agent 架构</h2>
        <div className="concept-card">
          <h3>🏗️ 生产级 Voice Agent 架构</h3>
          <div className="code-block">
{`# 自建 Voice Agent 技术选型
architecture = {
    "传输层": {
        "WebRTC":   "P2P 低延迟 (<100ms), 浏览器原生",
        "WebSocket": "服务端中继, 简单但延迟稍高",
        "gRPC":      "双向流, 适合服务端",
    },
    "ASR": {
        "实时中文":  "FunASR Paraformer-streaming",
        "多语言":    "Whisper large-v3 turbo",
        "端侧":      "Sherpa ONNX (离线)",
    },
    "LLM": {
        "高质量":    "GPT-4o / Claude 3.5",
        "低成本":    "Qwen2.5-7B / DeepSeek",
        "本地":      "Ollama + Qwen2.5",
    },
    "TTS": {
        "高自然度":  "CosyVoice 2 (流式)",
        "低延迟":    "Edge-TTS / Azure",
        "克隆":      "GPT-SoVITS",
    },
    "VAD":       "Silero VAD",
    "AEC":       "WebRTC AEC3 / SpeexDSP",
}

# 关键工程挑战
challenges = {
    "回声消除 (AEC)":   "AI 播放声音被麦克风拾取 → 误触发 ASR",
    "全双工":           "AI 说话时能同时听用户",
    "多轮上下文":       "记住对话历史, 处理指代消解",
    "情感感知":         "根据用户语气调整回复风格",
    "多方通话":         "电话会议中的说话人切换",
    "网络抖动":         "弱网下的音频缓冲和恢复",
}`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：语音大模型</span>
        <span className="nav-next">下一模块：音乐生成 →</span>
      </div>
    </div>
  );
}
