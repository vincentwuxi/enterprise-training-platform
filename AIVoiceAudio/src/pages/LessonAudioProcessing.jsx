import React from 'react';
import './LessonCommon.css';

export default function LessonAudioProcessing() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🔧 模块七：音频处理工程 — 降噪 / 分离 / 增强 / 说话人日志</h1>
      <p className="lesson-subtitle">
        掌握音频预处理与后处理的工业级技术栈
      </p>

      <section className="lesson-section">
        <h2>1. 语音降噪 (Speech Enhancement)</h2>
        <div className="concept-card">
          <h3>🔇 AI 降噪模型</h3>
          <div className="code-block">
{`# 语音降噪方法演进
"""
传统: 谱减法 / 维纳滤波 → 简单但效果有限
DNN: DTLN / RNNoise → 轻量级, 适合实时
GAN: SEGAN / MetricGAN+ → 高质量, 计算重
扩散: CDiffuSE / StoRM → 最高质量, 非实时
"""

# DNS (Deep Noise Suppression) — 微软开源
import torch
import torchaudio

# DTLN (Dual Signal Transformation LSTM Network)
# 超轻量: ~1M params, 实时 (CPU)
model = torch.jit.load("dtln_model.pt")
noisy, sr = torchaudio.load("noisy_speech.wav")
enhanced = model(noisy)  # 实时降噪

# Resemble-Enhance — 高质量语音增强
# pip install resemble-enhance
from resemble_enhance.enhancer.inference import enhance

enhanced, sr = enhance(
    dwav=noisy_audio,
    sr=16000,
    device="cuda",
    nfe=64,          # 扩散步数 (越高越好)
    solver="midpoint",
    lambd=0.9,       # 去噪强度 (0=最强去噪, 1=保留原始)
    tau=0.5          # 温度
)

# DeepFilterNet — 实时频域降噪
# pip install deepfilternet
from df.enhance import enhance, init_df

model, df_state, _ = init_df()
enhanced = enhance(model, df_state, noisy_audio)

# 降噪模型对比
"""
┌──────────────────┬──────┬────────┬──────────┐
│ 模型             │ PESQ↑│ 实时   │ 参数量   │
├──────────────────┼──────┼────────┼──────────┤
│ RNNoise          │ 2.8  │ ✅     │ 60K     │
│ DTLN             │ 3.0  │ ✅     │ 1M      │
│ DeepFilterNet 3  │ 3.3  │ ✅     │ 2M      │
│ Resemble-Enhance │ 3.6  │ ❌     │ 100M+   │
│ Miipher (Google) │ 3.7  │ ❌     │ 200M+   │
└──────────────────┴──────┴────────┴──────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 音源分离 (Source Separation)</h2>
        <div className="concept-card">
          <h3>🎚️ Demucs — SOTA 音源分离</h3>
          <div className="code-block">
{`import torchaudio
from demucs.pretrained import get_model
from demucs.apply import apply_model

# Demucs v4 (HTDemucs): 混合 Transformer 音源分离
model = get_model("htdemucs_ft")  # 微调版, 最高质量
model.eval()

# 加载混合音频
mix, sr = torchaudio.load("song.mp3")
mix = mix.unsqueeze(0)  # (1, channels, samples)

# 分离
with torch.no_grad():
    sources = apply_model(model, mix, device="cuda")
    # sources: (1, 4, channels, samples)
    # 4 个轨道: drums, bass, other, vocals

stems = {name: sources[0, i] for i, name in enumerate(model.sources)}

for name, audio in stems.items():
    torchaudio.save(f"{name}.wav", audio.cpu(), sr)

# 高级: 6 茎分离 (htdemucs_6s)
# drums / bass / other / vocals / guitar / piano

# 应用场景
separation_apps = {
    "卡拉OK":       "去除人声, 保留伴奏",
    "混音修复":     "分离后重新混合各轨道",
    "音乐教学":     "单独听各乐器声部",
    "转录":         "分离后对各声部单独转谱",
    "ASR 增强":     "去除背景音乐, 提升识别率",
    "版权检测":     "通过旋律 fingerprint 匹配",
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 说话人日志 (Speaker Diarization)</h2>
        <div className="concept-card">
          <h3>🗣️ pyannote.audio 说话人分割</h3>
          <div className="code-block">
{`from pyannote.audio import Pipeline

# pyannote 3.x: 端到端说话人日志
pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    use_auth_token="YOUR_HF_TOKEN"
)

# 基础使用
diarization = pipeline("meeting.wav")

for turn, _, speaker in diarization.itertracks(yield_label=True):
    print(f"[{turn.start:.1f}s → {turn.end:.1f}s] {speaker}")
# [0.5s → 5.2s] SPEAKER_00
# [5.8s → 12.3s] SPEAKER_01
# [12.5s → 18.1s] SPEAKER_00

# 指定说话人数量 (可选)
diarization = pipeline("meeting.wav", num_speakers=3)
# 或指定范围
diarization = pipeline("meeting.wav", min_speakers=2, max_speakers=5)

# 结合 ASR: 生成会议纪要
"""
会议分析管线:
  audio → pyannote (who spoke when)
       → Whisper (what was said)
       → merge → 带说话人标注的转录

[SPEAKER_00 - CEO] 0:05 → 2:30
  我们今天讨论一下Q3的产品规划...

[SPEAKER_01 - PM] 2:35 → 5:10
  我建议我们先聚焦核心功能...

[SPEAKER_02 - CTO] 5:15 → 8:20
  技术方面有几个风险需要提前评估...
"""

# 在线说话人日志 (流式)
from pyannote.audio.pipelines import SpeakerDiarization

# 使用 WhisperX 集成
import whisperx

model = whisperx.load_model("large-v3", device="cuda")
audio = whisperx.load_audio("meeting.wav")
result = model.transcribe(audio, batch_size=16)

# 对齐 + 说话人分割
aligned = whisperx.align(result["segments"], model_a, metadata, audio, device)
diarize_result = whisperx.DiarizationPipeline()(audio)
final = whisperx.assign_word_speakers(diarize_result, aligned)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 音频质量评估</h2>
        <div className="info-box">
          <h3>📋 音频质量评估指标</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>指标</th><th>类型</th><th>范围</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>PESQ</td><td>有参考</td><td>1.0-4.5</td><td>语音增强 / 降噪</td></tr>
              <tr><td>STOI</td><td>有参考</td><td>0-1</td><td>语音可懂度</td></tr>
              <tr><td>SI-SDR</td><td>有参考</td><td>dB</td><td>音源分离</td></tr>
              <tr><td>MOS</td><td>主观评估</td><td>1-5</td><td>TTS 自然度</td></tr>
              <tr><td>UTMOS</td><td>无参考 (预测 MOS)</td><td>1-5</td><td>TTS 自动评估</td></tr>
              <tr><td>DNSMOS</td><td>无参考</td><td>1-5</td><td>降噪质量</td></tr>
              <tr><td>DER</td><td>分割精度</td><td>%↓</td><td>说话人日志</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：音乐生成</span>
        <span className="nav-next">下一模块：语音部署 →</span>
      </div>
    </div>
  );
}
