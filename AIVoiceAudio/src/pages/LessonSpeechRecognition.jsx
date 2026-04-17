import React from 'react';
import './LessonCommon.css';

export default function LessonSpeechRecognition() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🎤 模块二：语音识别 (ASR) — Whisper v3 / FunASR / 流式识别</h1>
      <p className="lesson-subtitle">
        从端到端架构到工业级流式 ASR，掌握语音识别全栈技术
      </p>

      <section className="lesson-section">
        <h2>1. ASR 技术演进</h2>
        <div className="info-box">
          <h3>📈 语音识别代际发展</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>代表</th><th>WER</th><th>特点</th></tr>
            </thead>
            <tbody>
              <tr><td>GMM-HMM</td><td>Kaldi</td><td>~15%</td><td>统计模型 + 人工特征</td></tr>
              <tr><td>DNN-HMM</td><td>DeepSpeech</td><td>~10%</td><td>深度学习替代 GMM</td></tr>
              <tr><td>CTC</td><td>wav2letter</td><td>~8%</td><td>端到端, 无需对齐</td></tr>
              <tr><td>Attention</td><td>LAS / ESPnet</td><td>~5%</td><td>Seq2Seq + 注意力</td></tr>
              <tr><td>Transducer</td><td>RNN-T / Conformer</td><td>~4%</td><td>流式 + 端到端</td></tr>
              <tr><td>Foundation</td><td>Whisper v3</td><td>~3%</td><td>弱监督 680K h, 多语言</td></tr>
              <tr><td>多模态</td><td>Qwen2-Audio</td><td>~2.5%</td><td>LLM 驱动, 理解+转录</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. Whisper v3 — 多语言 ASR 之王</h2>
        <div className="concept-card">
          <h3>🔥 Whisper 架构与实战</h3>
          <div className="code-block">
{`import whisper
from faster_whisper import WhisperModel

# ═══ OpenAI Whisper (原版) ═══
model = whisper.load_model("large-v3")

# 完整转录
result = model.transcribe(
    "meeting.mp3",
    language="zh",           # 指定语言 (可自动检测)
    task="transcribe",       # 'transcribe' 或 'translate' (→英文)
    word_timestamps=True,    # 词级时间戳
    condition_on_previous_text=True,  # 利用上文, 更连贯
    temperature=0,           # 贪心解码 (确定性)
    no_speech_threshold=0.6, # 静音检测阈值
)

for segment in result["segments"]:
    print(f"[{segment['start']:.1f}s → {segment['end']:.1f}s] {segment['text']}")

# ═══ Faster-Whisper (CTranslate2 加速, 4x 更快) ═══
model = WhisperModel("large-v3", device="cuda", compute_type="float16")

segments, info = model.transcribe(
    "meeting.mp3",
    language="zh",
    beam_size=5,
    vad_filter=True,         # VAD 过滤静音段 → 大幅加速
    vad_parameters=dict(
        min_silence_duration_ms=500,
        speech_pad_ms=400,
    ),
    word_timestamps=True,
)

print(f"Detected language: {info.language} ({info.language_probability:.0%})")
for segment in segments:
    print(f"[{segment.start:.1f}s → {segment.end:.1f}s] {segment.text}")

# ═══ Whisper 模型对比 ═══
"""
┌────────┬────────┬─────────┬───────┬────────────┐
│ 模型   │ 参数量 │ VRAM    │ 速度  │ 中文 CER   │
├────────┼────────┼─────────┼───────┼────────────┤
│ tiny   │ 39M    │ ~1 GB   │ 32x   │ ~25%       │
│ base   │ 74M    │ ~1 GB   │ 16x   │ ~18%       │
│ small  │ 244M   │ ~2 GB   │ 6x    │ ~12%       │
│ medium │ 769M   │ ~5 GB   │ 2x    │ ~8%        │
│ large-v3│1550M  │ ~10 GB  │ 1x    │ ~4%        │
│ turbo  │ 809M   │ ~6 GB   │ 8x    │ ~5%        │
└────────┴────────┴─────────┴───────┴────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. FunASR — 工业级中文 ASR</h2>
        <div className="concept-card">
          <h3>🇨🇳 阿里 FunASR 实战</h3>
          <div className="code-block">
{`from funasr import AutoModel

# Paraformer: 非自回归, 低延迟中文 ASR
# SenseVoice: 语音识别 + 情感 + 事件检测

# ═══ SenseVoice (推荐) ═══
model = AutoModel(
    model="iic/SenseVoiceSmall",  # 中/英/日/韩/粤
    vad_model="iic/speech_fsmn_vad_zh-cn-16k-common-pytorch",
    punc_model="iic/punc_ct-transformer_cn-en-common-vocab471067-large",
    device="cuda:0",
)

result = model.generate(
    input="meeting_record.wav",
    batch_size_s=300,     # 自动分段, 每段最长300s
    merge_vad=True,       # 合并 VAD 结果
)
# 输出包含: 文本 + 时间戳 + 情感标签 + 音频事件 (笑声/掌声/音乐)

# ═══ 流式 ASR (Paraformer-streaming) ═══
model_streaming = AutoModel(
    model="iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-online",
    device="cuda:0",
)

# 模拟流式输入 (每次送入 chunk)
import sounddevice as sd
chunk_size = int(0.6 * 16000)  # 600ms chunk

def streaming_callback(indata, frames, time, status):
    audio_chunk = indata[:, 0]  # mono
    result = model_streaming.generate(
        input=audio_chunk,
        is_final=False,    # 非最终块
        cache={}           # 流式缓存
    )
    if result:
        print(result[0]["text"], end="", flush=True)

# ASR 引擎选型决策
"""
┌──────────┬──────────┬──────────┬──────────────────┐
│ 引擎     │ 中文精度 │ 延迟     │ 推荐场景         │
├──────────┼──────────┼──────────┼──────────────────┤
│ Whisper  │ ★★★★   │ 离线     │ 会议/播客转录    │
│ FunASR   │ ★★★★★  │ 实时     │ 中文实时交互     │
│ WeNet    │ ★★★★   │ 实时     │ 自研部署/端侧    │
│ PaddleSp │ ★★★★   │ 实时     │ 百度生态         │
│ Azure    │ ★★★★★  │ 实时     │ 商用首选         │
└──────────┴──────────┴──────────┴──────────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. ASR 微调与优化</h2>
        <div className="concept-card">
          <h3>🛠️ Whisper 领域微调</h3>
          <div className="code-block">
{`from transformers import (
    WhisperForConditionalGeneration,
    WhisperProcessor,
    Seq2SeqTrainingArguments,
    Seq2SeqTrainer,
)
from peft import LoraConfig, get_peft_model

model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v3")
processor = WhisperProcessor.from_pretrained("openai/whisper-large-v3")

# LoRA 微调 (参数高效)
lora_config = LoraConfig(
    r=32,
    lora_alpha=64,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    task_type="SEQ_2_SEQ_LM",
)
model = get_peft_model(model, lora_config)
# 可训练参数: ~25M vs 总参数 1.55B

# 数据准备
from datasets import load_dataset, Audio

dataset = load_dataset("your_dataset", split="train")
dataset = dataset.cast_column("audio", Audio(sampling_rate=16000))

def prepare_dataset(examples):
    audio = examples["audio"]
    inputs = processor(audio["array"], sampling_rate=16000, return_tensors="pt")
    labels = processor.tokenizer(examples["text"]).input_ids
    return {"input_features": inputs.input_features[0], "labels": labels}

# 评估指标: CER (中文) / WER (英文)
import evaluate
cer_metric = evaluate.load("cer")

def compute_metrics(pred):
    pred_ids = pred.predictions
    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    label_str = processor.batch_decode(pred.label_ids, skip_special_tokens=True)
    cer = cer_metric.compute(predictions=pred_str, references=label_str)
    return {"cer": cer}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>5. 语音识别后处理</h2>
        <div className="info-box">
          <h3>📋 ASR 后处理管线</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>步骤</th><th>任务</th><th>方案</th></tr>
            </thead>
            <tbody>
              <tr><td>VAD</td><td>语音活动检测</td><td>Silero VAD / WebRTC VAD</td></tr>
              <tr><td>标点恢复</td><td>添加标点符号</td><td>CT-Transformer / LLM</td></tr>
              <tr><td>ITN</td><td>逆文本归一化 (数字/日期)</td><td>规则 + NER</td></tr>
              <tr><td>纠错</td><td>同音字/领域术语纠正</td><td>N-gram LM / LLM</td></tr>
              <tr><td>时间戳对齐</td><td>字/词级对齐</td><td>CTC forced alignment</td></tr>
              <tr><td>说话人分离</td><td>区分不同说话人</td><td>pyannote / ECAPA-TDNN</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：音频基础</span>
        <span className="nav-next">下一模块：语音合成 →</span>
      </div>
    </div>
  );
}
