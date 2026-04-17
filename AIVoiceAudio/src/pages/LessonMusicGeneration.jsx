import React from 'react';
import './LessonCommon.css';

export default function LessonMusicGeneration() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🎵 模块六：音乐与音效生成 — Suno / MusicGen / 音频创意</h1>
      <p className="lesson-subtitle">
        从文本到音乐，探索 AI 音频创意生成的前沿技术与产品形态
      </p>

      <section className="lesson-section">
        <h2>1. 音乐生成技术全景</h2>
        <div className="info-box">
          <h3>🗺️ 音乐生成模型图谱</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>模型</th><th>类型</th><th>能力</th><th>特点</th></tr>
            </thead>
            <tbody>
              <tr><td>Suno v4</td><td>商用 API</td><td>歌曲 (含人声)</td><td>最佳音质, 完整歌曲, 付费</td></tr>
              <tr><td>Udio</td><td>商用 API</td><td>歌曲 (含人声)</td><td>音乐性强, 风格多样</td></tr>
              <tr><td>MusicGen</td><td>开源</td><td>纯音乐</td><td>Meta, 可控性好, 可微调</td></tr>
              <tr><td>Stable Audio 2</td><td>开源</td><td>音乐+音效</td><td>扩散模型, 高质量</td></tr>
              <tr><td>MusicLM</td><td>Google</td><td>纯音乐</td><td>文本→音乐, 高保真</td></tr>
              <tr><td>AudioLDM 2</td><td>开源</td><td>音效+音乐</td><td>扩散 + CLAP 引导</td></tr>
              <tr><td>Bark</td><td>开源</td><td>语音+音乐+音效</td><td>全能但质量参差</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. MusicGen — 开源音乐生成</h2>
        <div className="concept-card">
          <h3>🎹 MusicGen 实战</h3>
          <div className="code-block">
{`from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write

# MusicGen 架构:
# EnCodec (音频 codec) → Transformer LM → EnCodec 解码
# 支持: 文本条件 / 旋律条件 / 无条件生成

model = MusicGen.get_pretrained("facebook/musicgen-large")
model.set_generation_params(
    duration=30,          # 生成时长 (秒)
    top_k=250,            # Top-K 采样
    top_p=0.0,            # Top-P 采样 (0=不用)
    temperature=1.0,      # 温度
    cfg_coef=3.0,         # Classifier-Free Guidance 系数
)

# 1. 文本→音乐
descriptions = [
    "一首轻快的电子舞曲，120BPM，有合成器和鼓点",
    "悠扬的中国古典风琴曲，配以竹笛和古筝",
    "紧张刺激的电影配乐，弦乐和打击乐渐强",
]
wav = model.generate(descriptions)
# wav: (batch, channels, samples)

for i, w in enumerate(wav):
    audio_write(f"music_{i}", w.cpu(), model.sample_rate,
                strategy="loudness", loudness_compressor=True)

# 2. 旋律条件生成 (Melody-conditioned)
model_melody = MusicGen.get_pretrained("facebook/musicgen-melody-large")
melody_wav, melody_sr = torchaudio.load("humming.wav")
melody_wav = melody_wav.unsqueeze(0)  # (1, C, T)

wav = model_melody.generate_with_chroma(
    descriptions=["根据这个旋律创作一首爵士钢琴曲"],
    melody_wavs=melody_wav,
    melody_sample_rate=melody_sr
)

# 3. 延续生成 (Continuation)
prompt_wav, _ = torchaudio.load("intro.wav")
wav = model.generate_continuation(
    prompt=prompt_wav.unsqueeze(0),
    prompt_sample_rate=32000,
    descriptions=["继续这段音乐，加入更强烈的鼓点"]
)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 音效生成与声音设计</h2>
        <div className="concept-card">
          <h3>🔊 AudioLDM 2 / Make-An-Audio</h3>
          <div className="code-block">
{`from diffusers import AudioLDM2Pipeline
import scipy

# AudioLDM 2: 扩散模型音效生成
pipe = AudioLDM2Pipeline.from_pretrained(
    "cvssp/audioldm2-large",
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")

# 文本→音效
prompt = "rain falling on a tin roof with distant thunder"
negative_prompt = "low quality, noise, distortion"

audio = pipe(
    prompt=prompt,
    negative_prompt=negative_prompt,
    num_inference_steps=200,
    audio_length_in_s=10.0,
    num_waveforms_per_prompt=3,  # 生成3个候选
    guidance_scale=3.5,
).audios

# 保存最佳结果
scipy.io.wavfile.write("thunder_rain.wav", 16000, audio[0])

# 音效设计应用场景
sound_design_apps = {
    "游戏音效":    "NPC 语音 / 环境音 / 技能音效",
    "影视后期":    "Foley 音效 / 背景氛围 / 配乐",
    "播客制作":    "片头曲 / 转场音 / 背景音乐",
    "广告配乐":    "品牌音频 ID / 短视频BGM",
    "有声读物":    "场景音效 / 情感配乐",
    "冥想应用":    "自然音效 / 白噪声 / ASMR",
}

# Prompt 工程技巧
"""
好的音频 Prompt:
  ✓ 描述声音来源: "acoustic guitar playing"
  ✓ 描述环境: "in a small concert hall"
  ✓ 描述情绪: "melancholic, slow"
  ✓ 描述节奏: "120 BPM, 4/4 time"
  ✓ 使用负面提示: "no vocals, no noise"
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. AI 音乐创作工作流</h2>
        <div className="info-box">
          <h3>📋 音乐创作工具链</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>环节</th><th>AI 工具</th><th>传统工具</th></tr>
            </thead>
            <tbody>
              <tr><td>作曲</td><td>Suno / Udio / MusicGen</td><td>Logic Pro / FL Studio</td></tr>
              <tr><td>编曲</td><td>AI 自动编曲 / StemGen</td><td>Ableton / Cubase</td></tr>
              <tr><td>歌词</td><td>LLM (GPT/Claude)</td><td>人工创作</td></tr>
              <tr><td>人声</td><td>CosyVoice / So-VITS-SVC</td><td>录音棚录制</td></tr>
              <tr><td>混音</td><td>AI 自动混音 (LANDR)</td><td>Pro Tools</td></tr>
              <tr><td>母带</td><td>AI Mastering (LANDR/CloudBounce)</td><td>专业母带工程师</td></tr>
              <tr><td>音源分离</td><td>Demucs / MVSEP</td><td>硬件分离</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：Voice Agent</span>
        <span className="nav-next">下一模块：音频处理 →</span>
      </div>
    </div>
  );
}
