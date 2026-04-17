import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Suno API', 'MusicGen/Udio', '音效生成', '版权合规'];

export default function LessonMusicGen() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge orange">🎵 module_04 — AI 音乐生成</div>
      <div className="fs-hero">
        <h1>AI 音乐生成：Suno / MusicGen / Udio / 音效 — 声音内容的 AI 革命</h1>
        <p>
          AI 音乐生成在 2024-2025 年迎来商业化爆发：<strong>Suno</strong> 实现了
          文字描述到完整歌曲的生成，<strong>Udio</strong> 提供高保真音乐创作，
          <strong>MusicGen</strong> (Meta) 和 <strong>Stable Audio</strong> 开源可控。
          本模块覆盖音乐生成原理、API 实战、音效/配乐生成、
          以及 AI 音乐的版权和商用合规问题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎵 音乐生成</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎤 Suno AI</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> suno_api</div>
              <pre className="fs-code">{`# Suno: 最强文生歌曲 AI (含人声!)

# ═══ Suno 能力 ═══
suno_capabilities = {
    "文生歌曲": "描述风格/主题 → 完整歌曲 (含人声+伴奏)",
    "歌词定制": "提供歌词 → 按风格生成旋律+编曲",
    "风格范围": "流行/摇滚/古典/说唱/电子/民谣/中国风...",
    "时长":     "最长 4 分钟一首",
    "质量":     "接近专业录音棚水平",
    "多语言":   "中文/英文/日文/韩文等",
}

# ═══ Suno API 使用 ═══
import requests

# 生成歌曲 (简单模式)
response = requests.post(
    "https://api.suno.ai/v1/songs/generate",
    headers={"Authorization": f"Bearer {SUNO_API_KEY}"},
    json={
        "prompt": "一首关于创业奋斗的励志中文流行歌曲, 节奏感强",
        "make_instrumental": False,  # 含人声
        "model": "v3.5",
    }
)

# 生成歌曲 (自定义歌词模式)
response = requests.post(
    "https://api.suno.ai/v1/songs/generate",
    json={
        "lyrics": """
[Verse 1]
代码在屏幕上跳动
像星星在黑夜中闪烁
每一行都是一个梦想
在数据的海洋里漂泊

[Chorus]
我们是 AI 时代的先锋
用算法点亮未来的灯
不怕黑夜漫长路遥远
因为智慧会照亮前程
        """,
        "style": "chinese pop, upbeat, inspirational",
        "title": "AI 时代的先锋",
    }
)

# ═══ 商业应用 ═══
business_use_cases = {
    "品牌主题曲":   "企业品牌定制 AI 歌曲",
    "短视频配乐":   "抖音/快手内容创作者的配乐",
    "广告配乐":     "30秒广告片的定制音乐",
    "游戏音乐":     "独立游戏的 BGM 批量生成",
    "播客片头":     "播客/直播的片头曲",
    "教育内容":     "儿歌/教学歌曲自动生成",
}

# ═══ 定价 ═══
# Free: 50 credits/天 (约 10 首歌/天)
# Pro: $10/月 → 500 credits (约 100 首)
# Premier: $30/月 → 2000 credits
# 商用版: 需要 Pro+ 订阅`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎹 MusicGen / Udio</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> musicgen_udio</div>
              <pre className="fs-code">{`# 开源 & 商业音乐生成方案

# ═══ MusicGen (Meta) — 开源可控 ═══
from audiocraft.models import MusicGen

model = MusicGen.get_pretrained("facebook/musicgen-large")
model.set_generation_params(duration=30)  # 30秒

# 文字描述生成音乐
wav = model.generate([
    "upbeat electronic dance music with synth leads"
])

# 旋律引导生成
import torchaudio
melody, sr = torchaudio.load("reference_melody.wav")
wav = model.generate_with_chroma(
    ["chinese pop ballad with piano"],
    melody[None],  # 参考旋律
    sr
)

# ═══ Stable Audio (Stability AI) ═══
stable_audio = {
    "Stable Audio 2.0": {
        "特色": "文生音乐, 44.1kHz 高保真",
        "时长": "最长 3 分钟",
        "输入": "文本 + 时长 + 可选参考音频",
    },
    "Stable Audio Open": {
        "特色": "开源版, 可商用",
        "限制": "仅生成音效/环境音 (非歌曲)",
    },
}

# ═══ Udio ═══
udio_features = {
    "音质":    "非常高, 部分场景超过 Suno",
    "风格":    "擅长复杂编曲和乐器",
    "人声":    "支持, 但中文效果不如 Suno",
    "API":     "有限开放",
    "争议":    "训练数据版权诉讼 (RIAA 起诉)",
}

# ═══ 工具对比 ═══
# ┌────────────┬────────┬────────┬────────┬──────────┐
# │ 工具        │ 人声   │ 开源   │ 中文   │ 商用授权  │
# ├────────────┼────────┼────────┼────────┼──────────┤
# │ Suno       │ ✅ 最佳 │ ❌     │ ✅ 好  │ ✅ Pro+  │
# │ Udio       │ ✅ 好   │ ❌     │ ❌ 弱  │ ⚠️ 争议  │
# │ MusicGen   │ ❌      │ ✅     │ ✅ 中  │ ✅ MIT   │
# │ Stable     │ ❌      │ ✅     │ ❌     │ ✅ 开源   │
# └────────────┴────────┴────────┴────────┴──────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔊 音效与配乐生成</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> sound_effects</div>
              <pre className="fs-code">{`# AI 音效/配乐: 内容创作的声音引擎

# ═══ 音效生成 ═══
sound_effect_tools = {
    "ElevenLabs Sound Effects": {
        "输入": "文本描述 → 音效",
        "例子": "'森林中鸟叫声+溪水' → 逼真环境音",
        "用途": "视频配音, 游戏开发, 播客",
    },
    "AudioGen (Meta)": {
        "开源": True,
        "输入": "文本 → 环境音/音效",
        "质量": "高, 但不含音乐",
    },
    "Bark (Suno)": {
        "特色": "语音合成 + 音效 + 笑声等",
        "开源": True,
        "用途": "播客, 有声书, 旁白",
    },
}

# ═══ AI 配乐工作流 ═══
# 场景: 为短视频/广告自动配乐

scoring_workflow = {
    "Step 1 — 内容分析": {
        "输入": "视频文件",
        "处理": "场景检测 + 情感分析 + 节奏提取",
        "输出": "内容描述 + 情感标签 + BPM",
    },
    "Step 2 — 音乐生成": {
        "输入": "内容描述 + 风格偏好",
        "处理": "MusicGen / Suno 生成多个候选",
        "输出": "3-5 个候选配乐",
    },
    "Step 3 — 音视频同步": {
        "处理": "节拍对齐 + 情感曲线匹配",
        "工具": "librosa (节拍) + moviepy (合成)",
    },
    "Step 4 — 混音输出": {
        "处理": "音量平衡 + 淡入淡出 + 导出",
        "格式": "AAC 256kbps / WAV 无损",
    },
}

# ═══ 音频处理工具链 ═══
import librosa
import soundfile as sf
import numpy as np

# 节拍检测
y, sr = librosa.load("music.wav")
tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
print(f"BPM: {tempo}")

# 音频特征提取
mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
chromagram = librosa.feature.chroma_stft(y=y, sr=sr)

# 情感分析 (基于音频特征)
# 大调 → 快乐, 小调 → 悲伤
# 高 BPM → 兴奋, 低 BPM → 平静`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚖️ 版权与合规</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> music_copyright</div>
              <pre className="fs-code">{`# AI 音乐版权: 商用前必须了解的法律风险

# ═══ 核心法律问题 ═══
legal_issues = {
    "训练数据版权": {
        "问题": "AI 用版权音乐训练, 算侵权吗?",
        "现状": "RIAA 起诉 Suno/Udio (进行中)",
        "各方立场": {
            "音乐公司": "未经授权使用版权音乐训练 = 侵权",
            "AI 公司":  "训练是合理使用 (Fair Use)",
            "法院":     "尚无定论 (2025年关键判决预期)",
        },
    },
    "AI 生成物版权": {
        "问题": "AI 生成的音乐归谁所有?",
        "美国": "纯 AI 生成 → 不可版权保护",
        "中国": "有人类创作意图 → 可能受保护",
        "实践": "建议人类参与创作过程 (歌词/编排)",
    },
    "抄袭风险": {
        "问题": "AI 可能生成与版权音乐相似的作品",
        "风险": "音乐相似度超过阈值 → 被判抄袭",
        "防范": "生成后进行相似度检测",
    },
}

# ═══ 商用合规指南 ═══
commercial_guidelines = {
    "✅ 安全使用": [
        "使用 Pro/商业版订阅 (含商用授权)",
        "人类参与歌词创作/编排 (增加版权保护)",
        "避免模仿特定歌手/作品风格",
        "生成后做音乐相似度检测",
        "保留创作过程证据 (prompt/修改记录)",
    ],
    "⚠️ 灰色地带": [
        "用 AI 音乐做商业广告",
        "AI 音乐上架流媒体平台",
        "AI 翻唱 (模仿歌手声音)",
    ],
    "❌ 高风险": [
        "伪装 AI 音乐为人类创作",
        "使用盗版训练的开源模型商用",
        "模仿特定艺术家风格+声音",
    ],
}

# ═══ 音乐相似度检测 ═══
similarity_tools = {
    "Audible Magic": "商业方案, 指纹匹配",
    "ACRCloud":      "音频指纹识别 API",
    "Musicnn":       "开源, 音乐特征提取+比较",
}

# ═══ 各平台政策 ═══
platform_policy = {
    "Spotify":   "允许 AI 音乐, 但限制纯 AI 水军刷量",
    "Apple Music": "需披露 AI 参与程度",
    "YouTube":   "AI 模仿特定歌手 → 可被移除",
    "抖音":      "AI 生成内容需标注",
    "网易云":    "设有 AI 音乐专区",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
