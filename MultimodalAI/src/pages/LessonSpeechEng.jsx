import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 03 — 语音工程
   Whisper / TTS / 实时语音 Agent
   ───────────────────────────────────────────── */

const SPEECH_TOPICS = [
  { name: 'ASR 语音识别', icon: '🎤', tag: 'ASR',
    code: `# ─── 生产级语音识别 Pipeline ───
from openai import OpenAI
import json, os
from pydub import AudioSegment

client = OpenAI()

class ProductionASR:
    """Whisper 生产级封装"""
    
    # ─── 基础转录 ───
    def transcribe(self, audio_path: str, language="zh") -> dict:
        with open(audio_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language=language,
                response_format="verbose_json",
                timestamp_granularities=["segment", "word"],
            )
        return result
    
    # ─── 长音频切片处理 (>25MB) ───
    def transcribe_long(self, audio_path: str, chunk_minutes=10) -> str:
        """
        Whisper API 限制 25MB。
        长音频自动切片 → 并发转录 → 合并。
        """
        audio = AudioSegment.from_file(audio_path)
        chunk_ms = chunk_minutes * 60 * 1000
        chunks = []
        
        for i in range(0, len(audio), chunk_ms):
            chunk = audio[i : i + chunk_ms]
            chunk_path = f"/tmp/chunk_{i // chunk_ms}.mp3"
            chunk.export(chunk_path, format="mp3", bitrate="64k")
            chunks.append(chunk_path)
        
        # 并发转录
        import asyncio
        async def process_chunks():
            tasks = [self._transcribe_chunk(c, i) for i, c in enumerate(chunks)]
            results = await asyncio.gather(*tasks)
            return results
        
        results = asyncio.run(process_chunks())
        
        # 合并时间戳
        full_text = ""
        for i, result in enumerate(sorted(results, key=lambda x: x["idx"])):
            offset = i * chunk_minutes * 60
            for seg in result["segments"]:
                seg["start"] += offset
                seg["end"] += offset
            full_text += result["text"]
        
        return full_text
    
    # ─── 说话人分离 (Speaker Diarization) ───
    def diarize(self, audio_path: str) -> list:
        """
        识别"谁在说话"
        使用 pyannote.audio (开源最强)
        """
        from pyannote.audio import Pipeline
        
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token="hf_xxx"
        )
        
        diarization = pipeline(audio_path)
        
        # 合并转录 + 说话人
        transcript = self.transcribe(audio_path)
        
        result = []
        for segment in transcript.segments:
            # 找到时间重叠最多的说话人
            speaker = self._find_speaker(
                diarization, segment.start, segment.end
            )
            result.append({
                "speaker": speaker,
                "start": segment.start,
                "end": segment.end,
                "text": segment.text,
            })
        
        return result
    
    # ─── 流式识别 (实时) ───
    def stream_recognize(self, audio_stream):
        """
        实时语音识别
        使用 Deepgram / AssemblyAI 流式 API
        """
        import websockets, asyncio
        
        async def stream():
            url = "wss://api.deepgram.com/v1/listen"
            async with websockets.connect(
                url,
                extra_headers={"Authorization": f"Token {DEEPGRAM_KEY}"},
            ) as ws:
                async for chunk in audio_stream:
                    await ws.send(chunk)
                    result = await ws.recv()
                    transcript = json.loads(result)
                    if transcript.get("is_final"):
                        yield transcript["channel"]["alternatives"][0]["transcript"]
        
        return stream()` },
  { name: 'TTS 语音合成', icon: '🔊', tag: 'TTS',
    code: `# ─── 语音合成: 从基础到克隆 ───
from openai import OpenAI
from pathlib import Path

client = OpenAI()

# ═══ 方案1: OpenAI TTS (最简单) ═══
class OpenAITTS:
    VOICES = {
        "alloy":   "中性平和",
        "echo":    "男性低沉",
        "fable":   "英式优雅",
        "onyx":    "男性权威",
        "nova":    "女性活泼",      # 推荐中文!
        "shimmer": "女性温柔",
    }
    
    def speak(self, text, voice="nova", quality="hd"):
        """
        model: tts-1 (快速, $15/M字符) | tts-1-hd (高质量, $30/M字符)
        """
        model = "tts-1-hd" if quality == "hd" else "tts-1"
        response = client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
            speed=1.0,          # 0.25 - 4.0
            response_format="mp3",  # mp3|opus|aac|flac|wav|pcm
        )
        return response.content
    
    def speak_streaming(self, text, voice="nova"):
        """流式 TTS — 边生成边播放"""
        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text,
        )
        # 返回字节流
        for chunk in response.iter_bytes(chunk_size=4096):
            yield chunk

# ═══ 方案2: Edge TTS (免费, 微软) ═══
import edge_tts

async def edge_speak(text, voice="zh-CN-XiaoxiaoNeural"):
    """
    免费! 微软 Edge 浏览器的 TTS 引擎
    中文推荐: zh-CN-XiaoxiaoNeural (女), zh-CN-YunxiNeural (男)
    """
    communicate = edge_tts.Communicate(text, voice, rate="+0%")
    await communicate.save("output.mp3")

# ═══ 方案3: 语音克隆 (ElevenLabs / XTTS) ═══
# ElevenLabs: 商用最强，3秒录音即可克隆
import requests

def clone_voice(name, sample_audio_path):
    """用 3 秒音频克隆你的声音"""
    url = "https://api.elevenlabs.io/v1/voices/add"
    with open(sample_audio_path, "rb") as f:
        resp = requests.post(url, headers={
            "xi-api-key": ELEVENLABS_KEY
        }, data={
            "name": name,
        }, files={
            "files": f,
        })
    return resp.json()["voice_id"]

def speak_with_clone(text, voice_id):
    """用克隆的声音说话"""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    resp = requests.post(url, headers={
        "xi-api-key": ELEVENLABS_KEY,
        "Content-Type": "application/json",
    }, json={
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
        },
    })
    return resp.content

# ─── 开源替代: Coqui XTTS ───
# from TTS.api import TTS
# tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
# tts.tts_to_file("你好世界", speaker_wav="sample.wav", 
#                  language="zh-cn", file_path="output.wav")` },
  { name: '实时语音 Agent', icon: '🗣️', tag: 'Voice Agent',
    code: `# ─── 实时语音对话 Agent ───
# 两种架构: 级联式 vs 端到端

# ═══ 架构1: 级联式 (STT → LLM → TTS) ═══
import asyncio
import numpy as np
import sounddevice as sd

class CascadeVoiceAgent:
    """级联式语音Agent: 可靠但有延迟"""
    
    def __init__(self):
        self.asr = ProductionASR()
        self.tts = OpenAITTS()
        self.conversation = []
    
    async def run(self):
        print("🎤 语音助手已启动 (说 '退出' 结束)")
        
        while True:
            # 1. 录音 (VAD 检测静音自动停止)
            audio = await self.record_with_vad()
            
            # 2. STT
            text = self.asr.transcribe_buffer(audio)
            print(f"👤 用户: {text}")
            
            if "退出" in text:
                break
            
            # 3. LLM 处理 (流式)
            self.conversation.append({"role": "user", "content": text})
            reply_chunks = []
            
            stream = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "你是语音助手，回答简洁(30字内)。"},
                    *self.conversation
                ],
                stream=True,
            )
            
            full_reply = ""
            for chunk in stream:
                delta = chunk.choices[0].delta.content or ""
                full_reply += delta
                
                # 4. 句子级 TTS (边生成边播放!)
                if delta.endswith(("。", "！", "？", ".", "!", "?")):
                    sentence = "".join(reply_chunks) + delta
                    audio = self.tts.speak(sentence, voice="nova")
                    self.play_audio(audio)
                    reply_chunks = []
                else:
                    reply_chunks.append(delta)
            
            # 播放剩余文本
            if reply_chunks:
                audio = self.tts.speak("".join(reply_chunks))
                self.play_audio(audio)
            
            self.conversation.append({"role": "assistant", "content": full_reply})
            print(f"🤖 助手: {full_reply}")

# ═══ 架构2: OpenAI Realtime API (端到端) ═══
import websockets, json, base64

class RealtimeVoiceAgent:
    """OpenAI Realtime API — 超低延迟 (~300ms)"""
    
    WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"
    
    async def run(self):
        async with websockets.connect(self.WS_URL, extra_headers={
            "Authorization": f"Bearer {OPENAI_KEY}",
            "OpenAI-Beta": "realtime=v1",
        }) as ws:
            
            # 配置会话
            await ws.send(json.dumps({
                "type": "session.update",
                "session": {
                    "modalities": ["text", "audio"],
                    "instructions": "你是中文语音助手，回答简洁。",
                    "voice": "nova",
                    "input_audio_format": "pcm16",
                    "output_audio_format": "pcm16",
                    "turn_detection": {
                        "type": "server_vad",     # 服务端 VAD
                        "threshold": 0.5,
                        "silence_duration_ms": 500,
                    },
                    "tools": [{
                        "type": "function",
                        "name": "get_weather",
                        "description": "查询天气",
                        "parameters": {
                            "type": "object",
                            "properties": {"city": {"type": "string"}},
                        },
                    }],
                },
            }))
            
            # 双向流:
            # → 发送麦克风音频 (PCM16, 24kHz)
            # ← 接收 AI 回复音频 + 文本
            
            async def send_audio():
                async for chunk in microphone_stream():
                    await ws.send(json.dumps({
                        "type": "input_audio_buffer.append",
                        "audio": base64.b64encode(chunk).decode(),
                    }))
            
            async def receive_audio():
                async for msg in ws:
                    event = json.loads(msg)
                    if event["type"] == "response.audio.delta":
                        audio = base64.b64decode(event["delta"])
                        play_pcm(audio)  # 实时播放
                    elif event["type"] == "response.text.delta":
                        print(event["delta"], end="", flush=True)
            
            await asyncio.gather(send_audio(), receive_audio())` },
  { name: '语音翻译', icon: '🌍', tag: 'Translation',
    code: `# ─── 实时语音翻译 Pipeline ───

class SpeechTranslator:
    """语音翻译: 说中文 → 出英文语音"""
    
    def __init__(self):
        self.client = OpenAI()
    
    # ─── 方案1: Whisper 直接翻译 (推荐) ───
    def translate_audio(self, audio_path: str) -> str:
        """
        Whisper 原生支持"任意语言 → 英文"翻译
        不需要先转录再翻译!
        """
        with open(audio_path, "rb") as f:
            translation = self.client.audio.translations.create(
                model="whisper-1",
                file=f,
                response_format="text",
            )
        return translation
    
    # ─── 方案2: STT → LLM翻译 → TTS (灵活) ───
    async def full_translate(
        self, audio_path: str, 
        source_lang="zh", 
        target_lang="en",
        target_voice="nova",
    ) -> bytes:
        """完整翻译Pipeline: 语音→文字→翻译→语音"""
        
        # 1. ASR: 源语言语音 → 文字
        with open(audio_path, "rb") as f:
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language=source_lang,
            )
        print(f"📝 原文: {transcript.text}")
        
        # 2. LLM翻译 (比Google翻译更自然!)
        translation = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": f"你是专业翻译。将以下{source_lang}翻译为{target_lang}。"
                           "保持原文语气和风格，翻译要自然流畅。"
            }, {
                "role": "user",
                "content": transcript.text,
            }],
        )
        translated = translation.choices[0].message.content
        print(f"🌍 译文: {translated}")
        
        # 3. TTS: 翻译结果 → 目标语言语音
        speech = self.client.audio.speech.create(
            model="tts-1-hd",
            voice=target_voice,
            input=translated,
        )
        return speech.content
    
    # ─── 实时会议翻译 ───
    async def meeting_interpreter(self, audio_stream):
        """实时会议同传"""
        buffer = []
        
        async for chunk in audio_stream:
            buffer.append(chunk)
            
            # 每 5 秒处理一次
            if len(buffer) * chunk_duration >= 5.0:
                audio = merge_chunks(buffer)
                buffer = []
                
                # 并行: 转录 + 翻译 + TTS
                translated_audio = await self.full_translate(audio)
                yield translated_audio  # 输出翻译后的语音

# ─── TTS 方案对比 ───
# | 方案          | 质量 | 延迟   | 价格      | 语音克隆 |
# |---------------|------|--------|-----------|----------|
# | OpenAI TTS    | ⭐⭐⭐⭐ | 中     | $15/M字符 | ❌       |
# | ElevenLabs    | ⭐⭐⭐⭐⭐| 中     | $5/M字符  | ✅ 3秒   |
# | Edge TTS      | ⭐⭐⭐  | 快     | 免费!     | ❌       |
# | Coqui XTTS    | ⭐⭐⭐⭐ | 慢     | 免费开源  | ✅ 6秒   |
# | Fish Speech   | ⭐⭐⭐⭐ | 中     | 免费开源  | ✅ 10秒  |` },
];

export default function LessonSpeechEng() {
  const [topicIdx, setTopicIdx] = useState(0);
  const t = SPEECH_TOPICS[topicIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🎨 module_03 — 语音工程</div>
      <div className="fs-hero">
        <h1>语音工程：让 AI 开口说话</h1>
        <p>
          从<strong>Whisper 语音识别</strong>到<strong>声音克隆</strong>，
          从<strong>级联式语音 Agent</strong>到<strong>OpenAI Realtime API（300ms 延迟）</strong>——
          本模块教你构建能"听懂人话、开口说话"的全双工语音系统。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🔊 语音技术栈</h2>
        <div className="fs-pills">
          {SPEECH_TOPICS.map((t, i) => (
            <button key={i} className={`fs-btn ${i === topicIdx ? 'primary' : ''}`}
              onClick={() => setTopicIdx(i)}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#4ade80' }}>{t.icon} {t.name}</h3>
            <span className="fs-tag green">{t.tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 speech_{t.tag.toLowerCase().replace(/\s/g, '_')}.py
            </div>
            <pre className="fs-code">{t.code}</pre>
          </div>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 视觉 + LLM</button>
        <button className="fs-btn primary">视频 AI →</button>
      </div>
    </div>
  );
}
