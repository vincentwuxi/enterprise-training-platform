import React from 'react';
import './LessonCommon.css';

export default function LessonAudioFundamentals() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🎵 模块一：音频信号基础 — 信号处理 / 特征提取 / 数据增强</h1>
      <p className="lesson-subtitle">
        从声波物理到深度学习特征，构建音频 AI 的底层认知
      </p>

      <section className="lesson-section">
        <h2>1. 声音与数字音频</h2>
        <div className="info-box">
          <h3>📡 音频基础概念</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>概念</th><th>定义</th><th>典型值</th></tr>
            </thead>
            <tbody>
              <tr><td>采样率 (Sample Rate)</td><td>每秒采样点数</td><td>16kHz (语音) / 44.1kHz (音乐) / 48kHz (视频)</td></tr>
              <tr><td>位深度 (Bit Depth)</td><td>每个样本的位数</td><td>16-bit (CD) / 24-bit (专业) / 32-bit float</td></tr>
              <tr><td>声道 (Channels)</td><td>独立音频通道</td><td>Mono (1) / Stereo (2) / 5.1 / 7.1</td></tr>
              <tr><td>比特率 (Bitrate)</td><td>每秒数据量</td><td>128kbps (MP3) / 1411kbps (CD WAV)</td></tr>
              <tr><td>频率范围</td><td>人耳可听</td><td>20Hz - 20kHz (语音核心: 300Hz-3.4kHz)</td></tr>
              <tr><td>响度 (Loudness)</td><td>声音强度感知</td><td>dBFS (数字) / dB SPL (物理)</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>🔧 librosa 核心操作</h3>
          <div className="code-block">
{`import librosa
import librosa.display
import numpy as np
import soundfile as sf

# ═══ 音频加载 ═══
# librosa 默认: mono, sr=22050, float32 [-1.0, 1.0]
y, sr = librosa.load('speech.wav', sr=16000)  # 语音标准 16kHz
print(f"Duration: {len(y)/sr:.2f}s, Samples: {len(y)}, SR: {sr}")

# soundfile: 保持原始格式
data, samplerate = sf.read('audio.wav')

# ═══ 时域分析 ═══
# 能量包络 (Energy Envelope)
frame_length = int(0.025 * sr)  # 25ms 帧
hop_length = int(0.010 * sr)     # 10ms 步长
energy = np.array([
    np.sum(y[i:i+frame_length]**2)
    for i in range(0, len(y)-frame_length, hop_length)
])

# 过零率 (Zero Crossing Rate)
zcr = librosa.feature.zero_crossing_rate(y, frame_length=frame_length, hop_length=hop_length)

# ═══ 频域分析 ═══
# STFT (Short-Time Fourier Transform)
D = librosa.stft(y, n_fft=2048, hop_length=512, win_length=2048)
magnitude = np.abs(D)            # 幅度谱
phase = np.angle(D)              # 相位谱
power_spec = magnitude ** 2      # 功率谱

# 频谱图 dB 缩放
S_db = librosa.amplitude_to_db(magnitude, ref=np.max)

# ═══ 音频保存 ═══
sf.write('output.wav', y, sr, subtype='PCM_16')`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 核心音频特征</h2>
        <div className="concept-card">
          <h3>🎯 Mel 频率与 MFCC</h3>
          <div className="code-block">
{`# Mel 频谱图: 模拟人耳的非线性频率感知
"""
Mel 标度: 将频率映射到感知均匀的尺度
  mel = 2595 * log10(1 + f/700)

人耳特性:
  - 低频分辨率高 (100Hz vs 200Hz 差异明显)
  - 高频分辨率低 (8000Hz vs 8100Hz 难区分)
  - Mel 滤波器组: 低频窄带, 高频宽带
"""

# Mel 频谱图
mel_spec = librosa.feature.melspectrogram(
    y=y, sr=sr,
    n_fft=2048,
    hop_length=512,
    n_mels=80,           # Mel 滤波器数 (语音: 40-80, 音乐: 128)
    fmin=0, fmax=8000     # 频率范围
)
mel_db = librosa.power_to_db(mel_spec, ref=np.max)

# MFCC (Mel-Frequency Cepstral Coefficients)
# 语音识别经典特征, 压缩 Mel 频谱信息
mfcc = librosa.feature.mfcc(
    y=y, sr=sr,
    n_mfcc=13,            # 通常取 13 个系数
    n_fft=2048,
    hop_length=512,
    n_mels=40
)

# Delta + Delta-Delta (动态特征)
mfcc_delta = librosa.feature.delta(mfcc)
mfcc_delta2 = librosa.feature.delta(mfcc, order=2)
features = np.concatenate([mfcc, mfcc_delta, mfcc_delta2], axis=0)  # (39, T)

# 现代趋势: 直接使用 Mel/Log-Mel 频谱图作为 "图像" 输入 CNN/Transformer
# MFCC 仍用于: 轻量级场景 / 说话人验证 / 传统 GMM-HMM`}
          </div>
        </div>

        <div className="info-box">
          <h3>📋 音频特征全景</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>特征类型</th><th>维度</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>Mel Spectrogram</td><td>(n_mels, T)</td><td>ASR / TTS / 音乐分类</td></tr>
              <tr><td>MFCC</td><td>(13-40, T)</td><td>说话人识别 / 轻量 ASR</td></tr>
              <tr><td>Log-Mel FilterBank</td><td>(80, T)</td><td>Whisper / HuBERT</td></tr>
              <tr><td>Chromagram</td><td>(12, T)</td><td>和弦识别 / 音乐分析</td></tr>
              <tr><td>Spectral Contrast</td><td>(7, T)</td><td>音乐流派分类</td></tr>
              <tr><td>F0 (基频)</td><td>(1, T)</td><td>语调分析 / TTS 韵律</td></tr>
              <tr><td>Self-supervised</td><td>(768-1024, T)</td><td>wav2vec 2.0 / HuBERT 表征</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 音频数据增强</h2>
        <div className="concept-card">
          <h3>🔀 训练数据增强策略</h3>
          <div className="code-block">
{`import torch
import torchaudio
import torchaudio.transforms as T

# ═══ 时域增强 ═══
# 1. 添加噪声
def add_noise(waveform, noise, snr_db=10):
    """以指定信噪比添加噪声"""
    signal_power = waveform.norm(p=2)
    noise_power = noise.norm(p=2)
    snr = 10 ** (snr_db / 20)
    scale = signal_power / (snr * noise_power)
    return waveform + scale * noise[:waveform.shape[-1]]

# 2. 速度扰动 (Speed Perturbation)
speed_perturb = T.SpeedPerturbation(sr, [0.9, 1.0, 1.1])
augmented = speed_perturb(waveform)

# 3. 音量扰动
def volume_perturb(waveform, gain_range=(-6, 6)):
    gain_db = np.random.uniform(*gain_range)
    return waveform * (10 ** (gain_db / 20))

# 4. 混响 (Room Impulse Response)
rir, _ = torchaudio.load('rir.wav')
augmented = torchaudio.functional.fftconvolve(waveform, rir)

# ═══ 频域增强 ═══
# 5. SpecAugment (ASR 标配)
spec_augment = torch.nn.Sequential(
    T.FrequencyMasking(freq_mask_param=27),  # 频率遮罩
    T.TimeMasking(time_mask_param=100),      # 时间遮罩
)
mel_spec_augmented = spec_augment(mel_spec)

# 6. Pitch Shift
pitch_shift = T.PitchShift(sr, n_steps=2)  # 升2个半音
shifted = pitch_shift(waveform)

# ═══ 噪声数据集 ═══
noise_sources = {
    "MUSAN":     "音乐 + 语音 + 噪声 (1000h+)",
    "DNS-Challenge": "微软深度噪声抑制",
    "AudioSet":  "YouTube 环境音 (200万+)",
    "RIR_NOISES": "房间脉冲响应集合"
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 自监督音频表征</h2>
        <div className="concept-card">
          <h3>🧠 wav2vec 2.0 / HuBERT / Whisper Encoder</h3>
          <div className="code-block">
{`from transformers import Wav2Vec2Model, Wav2Vec2Processor

# 自监督预训练模型: 从无标签音频学习通用表征
"""
wav2vec 2.0:  对比学习 + 量化 → 语音表征
HuBERT:       离线聚类伪标签 → Masked 预测
WavLM:        HuBERT 改进 + 去噪 + 说话人任务
data2vec:     多模态统一自监督框架
Whisper:      弱监督 (680K hours 标注数据)
"""

# wav2vec 2.0 特征提取
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h")

input_values = processor(
    waveform, sampling_rate=16000, return_tensors="pt"
).input_values

with torch.no_grad():
    outputs = model(input_values)
    hidden_states = outputs.last_hidden_state  # (1, T, 768)
    # 可用于下游任务: ASR / 情感识别 / 说话人验证

# 模型选择指南
"""
┌────────────────┬──────────┬─────────┬────────────────┐
│ 模型           │ 参数量   │ 预训练   │ 最适下游任务    │
├────────────────┼──────────┼─────────┼────────────────┤
│ wav2vec 2.0    │ 95M-315M │ 自监督  │ ASR / 少样本   │
│ HuBERT         │ 95M-1B   │ 自监督  │ ASR / 语音合成 │
│ WavLM          │ 95M-315M │ 自监督  │ 说话人 / 分离  │
│ Whisper        │ 39M-1.5B │ 弱监督  │ 多语言 ASR     │
│ CLAP           │ ~150M    │ 对比    │ 音频分类 / 检索 │
└────────────────┴──────────┴─────────┴────────────────┘
"""`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 课程导航</span>
        <span className="nav-next">下一模块：语音识别 →</span>
      </div>
    </div>
  );
}
