import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['VAD/ASR', 'TTS 引擎', '对话管理', '情感感知'];

export default function LessonVoiceAgent() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🗣️ module_02 — Voice Agent 全栈</div>
      <div className="fs-hero">
        <h1>Voice Agent 全栈：VAD / Whisper / TTS / 情感感知 — 自建语音 AI 管线</h1>
        <p>
          当 GPT-4o Realtime API 成本过高或需要完全掌控时，你需要<strong>自建语音 AI 管线</strong>。
          本模块从 VAD (语音活动检测) → Whisper (语音识别) → LLM (对话生成) →
          TTS (语音合成) 的全链路出发，深入打断处理、情感分析、
          多语言支持和对话状态管理，构建企业级 Voice Agent。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🗣️ Voice Agent</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎤 VAD 与语音识别</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> vad_asr</div>
              <pre className="fs-code">{`# VAD + ASR: 语音输入管线

# ═══ VAD (Voice Activity Detection) ═══
# 核心问题: 什么时候用户在说话? 什么时候说完了?
# 这决定了何时触发 ASR 和 LLM 推理

# Silero VAD — 开源最佳方案
import torch
torch.set_num_threads(1)

model, utils = torch.hub.load(
    'snakers4/silero-vad', 'silero_vad',
    force_reload=False
)
(get_speech_timestamps, _, read_audio, *_) = utils

# 实时 VAD 处理
class RealtimeVAD:
    def __init__(self, threshold=0.5, min_silence_ms=500):
        self.threshold = threshold
        self.min_silence_ms = min_silence_ms
        self.is_speaking = False
        self.audio_buffer = []
    
    def process_chunk(self, audio_chunk):
        """处理 30ms 音频片段"""
        confidence = model(audio_chunk, 16000).item()
        
        if confidence > self.threshold:
            self.is_speaking = True
            self.audio_buffer.append(audio_chunk)
        elif self.is_speaking:
            # 静音计时
            if self.silence_exceeded():
                speech = torch.cat(self.audio_buffer)
                self.reset()
                return speech  # 返回完整语音段
        return None

# ═══ Whisper 语音识别 ═══
# OpenAI Whisper: 最强开源 ASR
import whisper
model = whisper.load_model("large-v3")

# 流式 Whisper (faster-whisper 加速版)
from faster_whisper import WhisperModel
model = WhisperModel("large-v3", device="cuda",
                     compute_type="float16")

def transcribe_streaming(audio_data):
    """流式转写 — 边说边转"""
    segments, info = model.transcribe(
        audio_data,
        beam_size=5,
        language="zh",
        vad_filter=True,  # 内置 VAD 过滤
    )
    for segment in segments:
        yield segment.text

# ═══ ASR 选型对比 ═══
asr_comparison = {
    "Whisper large-v3": {
        "精度":  "最高 (WER ~3% 英文)",
        "延迟":  "较高 (需要 GPU)",
        "中文":  "优秀",
        "成本":  "自部署 GPU / API $0.006/min",
    },
    "Deepgram Nova-2": {
        "精度":  "高",
        "延迟":  "极低 (<300ms 实时)",
        "中文":  "良好",
        "成本":  "$0.0043/min (非常便宜)",
    },
    "FunASR (阿里)": {
        "精度":  "高 (中文最佳之一)",
        "延迟":  "低 (流式支持)",
        "中文":  "最优",
        "成本":  "开源免费",
    },
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔊 TTS 语音合成</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> tts_engines</div>
              <pre className="fs-code">{`# TTS: 文本到高质量语音

# ═══ TTS 技术演进 ═══
# 拼接合成 → 参数合成 → Tacotron → VITS → 大模型 TTS
# 2024-2025: 零样本语音克隆成为主流

# ═══ 主流 TTS 方案 ═══
tts_engines = {
    "OpenAI TTS": {
        "模型": "tts-1 / tts-1-hd",
        "质量": "高, 6种预设语音",
        "延迟": "tts-1: 快, tts-1-hd: 慢但更好",
        "流式": "支持 (streaming audio)",
        "成本": "$15/1M 字符",
        "克隆": "不支持",
    },
    "ElevenLabs": {
        "模型": "Eleven Multilingual v2",
        "质量": "最高, 最自然",
        "延迟": "低 (流式)",
        "流式": "支持",
        "成本": "$0.30/1K 字符",
        "克隆": "支持 (3s 音频即可)",
    },
    "Fish Speech (开源)": {
        "模型": "Fish Speech 1.5",
        "质量": "高, 中文优秀",
        "延迟": "中",
        "克隆": "支持零样本克隆",
        "成本": "免费 (自部署)",
    },
    "ChatTTS (开源)": {
        "模型": "ChatTTS",
        "质量": "对话风格, 带笑声/停顿",
        "延迟": "中",
        "特色": "自然对话语气 (非播音腔)",
        "成本": "免费 (自部署)",
    },
}

# ═══ 流式 TTS 实现 ═══
from openai import OpenAI
client = OpenAI()

def stream_tts(text):
    """流式 TTS — 边生成边播放"""
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=text,
        response_format="pcm",  # 原始 PCM
    )
    
    # 流式输出音频块
    for chunk in response.iter_bytes(chunk_size=4096):
        yield chunk  # 实时播放

# ═══ 语音克隆 (ElevenLabs) ═══
from elevenlabs import clone, generate

voice = clone(
    name="客户专属语音",
    files=["sample.mp3"],  # 3-30秒参考音频
)

audio = generate(
    text="欢迎拨打客服热线",
    voice=voice,
    model="eleven_multilingual_v2",
)

# ═══ 企业级 TTS 选型 ═══
# 客服场景: ElevenLabs (最自然) 或 Fish Speech (自部署)
# 播报场景: OpenAI TTS (稳定便宜)
# 对话场景: ChatTTS (口语化) 或 GPT-4o (端到端)`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 对话管理与打断</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> dialog_management</div>
              <pre className="fs-code">{`# Voice Agent 对话管理: 打断/轮转/状态

# ═══ 自然对话的核心挑战 ═══
challenges = {
    "打断 (Barge-in)":  "用户在 AI 说话时插嘴",
    "轮转 (Turn-taking)": "谁应该说话? 何时切换?",
    "回填 (Backchanneling)": "嗯/对/是的 不是打断",
    "静默处理": "用户沉默 = 思考 vs 断线?",
    "多轮状态": "记住对话历史和上下文",
}

# ═══ 打断处理 ═══
class BargeInHandler:
    def __init__(self):
        self.ai_speaking = False
        self.playback_buffer = []
    
    def on_user_speech_detected(self):
        """用户开始说话时"""
        if self.ai_speaking:
            # 1. 立即停止 AI 语音播放
            self.stop_playback()
            
            # 2. 取消未发送的 TTS 请求
            self.cancel_pending_tts()
            
            # 3. 截断 AI 回复上下文
            # 只保留已播放的部分
            played_text = self.get_played_text()
            self.update_context(played_text)
            
            # 4. 开始录制用户语音
            self.start_recording()

# ═══ 对话状态机 ═══
# ┌─────────┐ 用户说话  ┌───────────┐
# │ IDLE    ├──────────►│ LISTENING │
# │ (等待)   │          │ (录音)     │
# └────┬────┘          └─────┬─────┘
#      │                     │ VAD 静默
#      │               ┌────┴─────┐
#      │               │PROCESSING│
#      │               │ (ASR+LLM)│
#      │               └────┬─────┘
#      │                    │ TTS 开始
#      │               ┌────┴─────┐
#      │◄──────────────┤ SPEAKING │
#      │   播放完成     │ (AI说话) │
#      │               └────┬─────┘
#      │                    │ 用户打断
#      │                    ▼
#      │              ┌───────────┐
#      └──────────────┤ BARGE-IN  │
#                     └───────────┘

# ═══ 企业 Voice Agent 框架 ═══
voice_frameworks = {
    "LiveKit Agents": {
        "特色":  "开源, WebRTC 原生, 插件式",
        "ASR":   "Deepgram / Whisper / 自定义",
        "LLM":   "OpenAI / Anthropic / 本地",
        "TTS":   "ElevenLabs / OpenAI / 自定义",
        "适合":  "全功能 Voice Agent",
    },
    "Pipecat": {
        "特色":  "Daily.co 出品, 管线式架构",
        "架构":  "Frame 处理管线 (音频帧流转)",
        "适合":  "快速原型 + 生产",
    },
    "Vocode": {
        "特色":  "Python 优先, 高度模块化",
        "架构":  "ASR→Agent→TTS 三件套",
        "适合":  "电话机器人",
    },
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>😊 情感感知</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> emotion_aware</div>
              <pre className="fs-code">{`# 语音情感分析: 让 AI 理解用户情绪

# ═══ 语音情感线索 ═══
emotion_cues = {
    "语速":    "快→焦虑/兴奋, 慢→沮丧/犹豫",
    "音调":    "高→惊喜/愤怒, 低→悲伤/疲倦",
    "能量":    "大→强烈情感, 小→平静/无力",
    "停顿":    "频繁停顿→不确定/紧张",
    "语调轮廓": "上升→疑问/不确定, 下降→陈述/确信",
}

# ═══ 语音情感识别 ═══
#from transformers import pipeline
# emotion_classifier = pipeline(
#     "audio-classification",
#     model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion"
# )

# 实用方案: OpenAI GPT-4o + 音频分析
# GPT-4o 可以直接分析音频的情感/语气
emotion_prompt = """
分析用户音频的情感状态。返回:
- emotion: happy/sad/angry/frustrated/neutral
- intensity: 1-5
- suggested_tone: 建议 AI 回复的语气调整
"""

# ═══ 情感响应策略 ═══
response_strategy = {
    "angry/frustrated": {
        "AI 行为": "放慢语速, 表示理解, 道歉优先",
        "TTS 调整": "降低语速 0.8x, 温和语气",
        "示例": "我理解您的不满, 非常抱歉给您带来不便...",
    },
    "confused": {
        "AI 行为": "简化表达, 分步骤引导",
        "TTS 调整": "正常语速, 清晰发音",
        "示例": "没关系, 让我一步步为您解释...",
    },
    "happy": {
        "AI 行为": "匹配积极情绪, 推进对话",
        "TTS 调整": "稍快语速, 活力语气",
        "示例": "太好了! 那我们继续下一步...",
    },
    "sad": {
        "AI 行为": "共情, 耐心, 不催促",
        "TTS 调整": "慢速, 柔和",
        "示例": "我理解这对您来说不容易...",
    },
}

# ═══ 多语言情感差异 ═══
# 中文: 更含蓄, 需要结合上下文判断
# 英文: 直接, 语调变化更明显
# 日文: 敬语体系影响情感表达
# → 情感模型需要语言特定的微调`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
