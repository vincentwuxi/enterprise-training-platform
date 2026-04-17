import React from 'react';
import './LessonCommon.css';

export default function LessonSpeechSynthesis() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🔊 模块三：语音合成 (TTS) — GPT-SoVITS / CosyVoice / 声音克隆</h1>
      <p className="lesson-subtitle">
        从文本到自然语音，掌握零样本声音克隆与情感合成技术
      </p>

      <section className="lesson-section">
        <h2>1. TTS 技术演进</h2>
        <div className="info-box">
          <h3>📈 语音合成代际图谱</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>代表模型</th><th>MOS ↑</th><th>特点</th></tr>
            </thead>
            <tbody>
              <tr><td>拼接合成</td><td>Unit Selection</td><td>~3.5</td><td>大语料库 + 波形拼接</td></tr>
              <tr><td>参数合成</td><td>HTS (HMM)</td><td>~3.0</td><td>统计参数化, 灵活但机器感</td></tr>
              <tr><td>Seq2Seq</td><td>Tacotron 2</td><td>~4.2</td><td>端到端, 自然度飞跃</td></tr>
              <tr><td>Flow</td><td>VITS / VITS2</td><td>~4.4</td><td>端到端 + 流模型, 快速</td></tr>
              <tr><td>Codec LM</td><td>VALL-E / XTTS</td><td>~4.3</td><td>语音 Token + LM 生成</td></tr>
              <tr><td>GPT 系</td><td>GPT-SoVITS / ChatTTS</td><td>~4.5</td><td>少样本克隆 + 情感</td></tr>
              <tr><td>大模型</td><td>CosyVoice 2 / F5-TTS</td><td>~4.6</td><td>零样本 + 流式 + 多语言</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. GPT-SoVITS — 少样本声音克隆</h2>
        <div className="concept-card">
          <h3>🔥 GPT-SoVITS 架构与实战</h3>
          <div className="code-block">
{`# GPT-SoVITS: 5 秒音频即可克隆声音
"""
架构:
  1. SoVITS (Variational Inference TTS)
     - VITS 改进: VQ-VAE + Flow 解码器
     - 学习说话人音色 + 韵律
  
  2. GPT (文本→语义 Token)
     - AR 模型: 文本 + 参考音频 → 语义 tokens
     - 类似 VALL-E 的 codec language model
  
  3. 推理流程:
     文本 → GPT → 语义 Tokens → SoVITS → 波形
     参考音频 ─┘ (音色注入)
"""

# 安装与使用 (WebUI)
# git clone https://github.com/RVC-Boss/GPT-SoVITS
# python webui.py

# API 调用
import requests

# 1. 上传参考音频 (3-10 秒, 清晰语音)
ref_audio = "reference_speaker.wav"

# 2. 合成
response = requests.post("http://localhost:9880/tts", json={
    "text": "今天天气真不错，我们一起去公园走走吧。",
    "text_lang": "zh",
    "ref_audio_path": ref_audio,
    "prompt_text": "参考音频对应的文字内容",
    "prompt_lang": "zh",
    "text_split_method": "cut5",  # 按标点分割
    "speed_factor": 1.0,
})

with open("output.wav", "wb") as f:
    f.write(response.content)

# 微调 (提升特定说话人效果)
"""
训练数据要求:
  - 时长: 1-10 分钟 (最佳 3-5 分钟)
  - 质量: 清晰无噪 / 单一说话人
  - 格式: WAV 16kHz 16bit Mono
  
训练参数:
  - SoVITS: batch_size=4, epochs=8-12
  - GPT:    batch_size=4, epochs=15-20
  - 总耗时: ~30 分钟 (单卡 3090)
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. CosyVoice — 阿里大模型 TTS</h2>
        <div className="concept-card">
          <h3>⚡ CosyVoice 2 实战</h3>
          <div className="code-block">
{`from cosyvoice.cli.cosyvoice import CosyVoice
from cosyvoice.utils.file_utils import load_wav
import torchaudio

# CosyVoice 2 特性:
# - 零样本声音克隆 (3-10 秒参考)
# - 跨语言合成 (中/英/日/韩/粤)
# - 情感/风格控制
# - 流式合成 (首包延迟 <150ms)
# - 语音指令: 用自然语言控制语速/情感

cosyvoice = CosyVoice("pretrained_models/CosyVoice2-0.5B")

# 1. 零样本克隆
prompt_speech = load_wav("reference.wav", 16000)
output = cosyvoice.inference_zero_shot(
    tts_text="人工智能正在改变我们的生活方式。",
    prompt_text="这是参考音频的文字",
    prompt_speech_16k=prompt_speech,
    stream=False
)
for result in output:
    torchaudio.save("cloned.wav", result["tts_speech"], 22050)

# 2. 指令控制合成
output = cosyvoice.inference_instruct2(
    tts_text="祝你生日快乐！",
    instruct_text="用开心兴奋的语气说",
    prompt_speech_16k=prompt_speech,
    stream=True   # 流式输出
)

# 3. 跨语言合成 (中文说话人说英文)
output = cosyvoice.inference_cross_lingual(
    tts_text="Artificial intelligence is transforming the world.",
    prompt_speech_16k=prompt_speech  # 中文参考音频
)

# TTS 引擎选型
"""
┌───────────────┬──────────┬──────────┬────────────────┐
│ 引擎          │ 克隆质量 │ 延迟     │ 推荐场景       │
├───────────────┼──────────┼──────────┼────────────────┤
│ GPT-SoVITS    │ ★★★★★  │ ~1-3s   │ 配音/有声书    │
│ CosyVoice 2   │ ★★★★★  │ <150ms  │ 实时对话/客服  │
│ ChatTTS       │ ★★★★   │ ~0.5s   │ 自然对话/播客  │
│ F5-TTS        │ ★★★★   │ ~1s     │ 多语言/研究    │
│ XTTS v2       │ ★★★★   │ ~2s     │ 跨语言克隆     │
│ Edge-TTS      │ ★★★    │ <100ms  │ 免费/低成本    │
│ Azure TTS     │ ★★★★★  │ <100ms  │ 商用/高并发    │
└───────────────┴──────────┴──────────┴────────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 声音克隆伦理与安全</h2>
        <div className="info-box">
          <h3>⚖️ 声音克隆合规要求</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>风险</th><th>场景</th><th>防范措施</th></tr>
            </thead>
            <tbody>
              <tr><td>AI 诈骗</td><td>克隆亲友声音骗取转账</td><td>声纹水印 / 深伪检测</td></tr>
              <tr><td>身份冒充</td><td>伪造名人/领导声音</td><td>授权管理 / 实名认证</td></tr>
              <tr><td>版权侵犯</td><td>未授权使用声音商业化</td><td>声音使用协议 / 付费授权</td></tr>
              <tr><td>隐私泄露</td><td>泄露私人语音数据</td><td>加密存储 / 定期清理</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：语音识别</span>
        <span className="nav-next">下一模块：语音大模型 →</span>
      </div>
    </div>
  );
}
