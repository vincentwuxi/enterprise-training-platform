import React from 'react';
import './LessonCommon.css';

export default function LessonSpeechLLM() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🧠 模块四：语音大模型 — Qwen2-Audio / 语音理解 / Audio LLM</h1>
      <p className="lesson-subtitle">
        从单一 ASR/TTS 到多模态语音理解，探索 Audio LLM 前沿
      </p>

      <section className="lesson-section">
        <h2>1. Audio LLM 全景</h2>
        <div className="info-box">
          <h3>🗺️ 语音大模型图谱</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>模型</th><th>能力</th><th>架构</th><th>特点</th></tr>
            </thead>
            <tbody>
              <tr><td>Qwen2-Audio</td><td>语音理解+对话</td><td>Whisper Encoder + Qwen2 LLM</td><td>开源最强 Audio LLM</td></tr>
              <tr><td>GPT-4o</td><td>全模态理解生成</td><td>原生多模态</td><td>语音直入直出</td></tr>
              <tr><td>Gemini 2.0</td><td>全模态理解生成</td><td>原生多模态</td><td>超长音频理解</td></tr>
              <tr><td>SALMONN</td><td>语音+音频理解</td><td>Whisper + BEATs + LLaMA</td><td>音频事件理解</td></tr>
              <tr><td>WavLLM</td><td>语音理解 + 推理</td><td>WavLM + LLaMA</td><td>语音链式思考</td></tr>
              <tr><td>Moshi</td><td>全双工对话</td><td>多流 Transformer</td><td>同时听说, 自然对话</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>📊 Audio LLM vs 传统管线</h3>
          <div className="code-block">
{`# 传统管线 vs Audio LLM
"""
传统 ASR 管线:
  音频 → VAD → ASR → 文本 → LLM → 文本 → TTS → 音频
  ✗ 丢失韵律/情感/环境信息
  ✗ 延迟累积 (每个模块都有延迟)
  ✗ 错误传播 (ASR 错误 → LLM 误解)

Audio LLM (端到端):
  音频 → Audio LLM → 文本/音频/理解结果
  ✓ 保留完整声学信息 (语调/情感/背景音)
  ✓ 理解超越文字 (笑声/叹气/讽刺)
  ✓ 一步到位, 延迟低

典型能力:
  1. 语音转录 + 翻译
  2. 语音情感分析 (不仅看文字, 还感知语气)
  3. 音频事件检测 (背景音乐/掌声/警报)
  4. 语音指令执行 (口语化自然指令)
  5. 音频摘要 (总结长音频内容)
  6. 多轮语音对话
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. Qwen2-Audio 深度实战</h2>
        <div className="concept-card">
          <h3>🔥 Qwen2-Audio 多场景应用</h3>
          <div className="code-block">
{`from transformers import Qwen2AudioForConditionalGeneration, AutoProcessor
import librosa

model = Qwen2AudioForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2-Audio-7B-Instruct",
    torch_dtype=torch.float16,
    device_map="auto"
)
processor = AutoProcessor.from_pretrained("Qwen/Qwen2-Audio-7B-Instruct")

# 1. 语音转录 + 理解
audio, sr = librosa.load("interview.wav", sr=16000)

conversation = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": [
        {"type": "audio", "audio": audio},
        {"type": "text", "text": "请转录这段音频，并分析说话人的情感状态。"}
    ]}
]

inputs = processor.apply_chat_template(
    conversation, add_generation_prompt=True, 
    tokenize=True, return_tensors="pt"
).to(model.device)

output_ids = model.generate(**inputs, max_new_tokens=512)
response = processor.decode(output_ids[0], skip_special_tokens=True)
print(response)

# 2. 音频事件分析
conversation_event = [
    {"role": "user", "content": [
        {"type": "audio", "audio": audio_data},
        {"type": "text", "text": "描述这段音频中发生了什么，包括背景声音和说话内容。"}
    ]}
]

# 3. 多音频对比
conversation_compare = [
    {"role": "user", "content": [
        {"type": "audio", "audio": audio_a},
        {"type": "audio", "audio": audio_b},
        {"type": "text", "text": "比较这两段录音中说话人的语气有什么不同？"}
    ]}
]

# 4. 语音翻译 (保留语气分析)
conversation_translate = [
    {"role": "user", "content": [
        {"type": "audio", "audio": chinese_audio},
        {"type": "text", "text": "将这段中文语音翻译成英文，并标注说话人的情感。"}
    ]}
]`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 语音理解进阶任务</h2>
        <div className="concept-card">
          <h3>🎯 超越转录的语音理解</h3>
          <div className="code-block">
{`# 语音情感识别 (SER)
from transformers import pipeline

emotion_classifier = pipeline(
    "audio-classification",
    model="superb/wav2vec2-base-superb-er",
    device=0
)
result = emotion_classifier("emotional_speech.wav")
# [{"label": "angry", "score": 0.89}, ...]

# 说话人验证 (Speaker Verification)
from speechbrain.inference import SpeakerRecognition
verifier = SpeakerRecognition.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir="pretrained_models/spkrec"
)
score, prediction = verifier.verify_files("speaker1.wav", "speaker2.wav")
print(f"Same speaker: {prediction}, Score: {score:.4f}")

# 语音关键词检测 (KWS)
"""
场景: 唤醒词检测 (Hey Siri / 小爱同学)
方案:
  - 小模型: CRNN / DSCNN (50K params)
  - 流式: 固定大小滑窗 + 阈值检测
  - 端侧: TFLite / ONNX, <100ms 延迟
"""

# 会议分析管线
meeting_pipeline = {
    "ASR":        "FunASR SenseVoice → 转录",
    "Diarization": "pyannote.audio → 说话人日志",
    "Summarize":   "Audio LLM → 会议摘要",
    "Action Items": "LLM → 待办事项提取",
    "Sentiment":   "SER 模型 → 情绪变化追踪",
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. Audio LLM 微调</h2>
        <div className="info-box">
          <h3>📋 Audio LLM 微调策略</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>策略</th><th>原理</th><th>数据需求</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>Prompt Engineering</td><td>优化输入提示</td><td>无</td><td>快速落地</td></tr>
              <tr><td>LoRA 微调</td><td>低秩适配 LLM</td><td>100-1K 对</td><td>领域适配</td></tr>
              <tr><td>Audio Encoder 冻结</td><td>仅训练 LLM 部分</td><td>1K-10K</td><td>理解任务增强</td></tr>
              <tr><td>全参微调</td><td>全模型训练</td><td>10K+</td><td>全新任务</td></tr>
              <tr><td>Adapter 融合</td><td>插入适配模块</td><td>500-5K</td><td>多任务切换</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：语音合成</span>
        <span className="nav-next">下一模块：Voice Agent →</span>
      </div>
    </div>
  );
}
