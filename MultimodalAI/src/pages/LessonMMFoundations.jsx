import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 01 — 多模态基础
   模态表征 / 对齐理论 / Tokenization
   ───────────────────────────────────────────── */

const MODALITY_TYPES = [
  { name: '模态表征', icon: '🧬', tag: 'Representation',
    desc: '每种模态（文本、图像、音频、视频）在 AI 模型内部如何被表示为向量空间中的点。',
    details: [
      { title: '文本 → Token Embedding', content: '词/子词通过 BPE/SentencePiece 切分为 Token，每个 Token 映射到高维向量 (d=768~4096)。GPT-4o 使用 ~200K 词表。' },
      { title: '图像 → Patch Embedding', content: 'ViT 将图像切成 16×16 或 14×14 的 Patch，每个 Patch 线性投影为一个向量。一张 224×224 图 = 196 个 Patch Token。' },
      { title: '音频 → Spectrogram Embedding', content: 'Whisper 将音频转为 80-channel 梅尔频谱图，再用 CNN 编码为向量序列。30s 音频 ≈ 1500 个 Token。' },
      { title: '视频 → Temporal + Spatial', content: '视频 = 图像帧序列 + 音轨。VideoMAE / ViViT 同时编码空间 (patch) 和时间 (frame) 维度。' },
    ],
    code: `# ─── 模态表征: 从原始数据到向量 ───

# 1. 文本 Token 化
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("gpt2")
tokens = tokenizer.encode("多模态AI改变世界")
# → [22810, 162, 228, 164, 118] (BPE子词)
# 每个token → embedding[token_id] → (d=768,) 向量

# 2. 图像 Patch 化 (ViT方式)
import torch
from einops import rearrange

def image_to_patches(image, patch_size=16):
    """将图像切成patch序列"""
    # image: (B, C, H, W) = (1, 3, 224, 224)
    patches = rearrange(image, 
        'b c (h p1) (w p2) -> b (h w) (p1 p2 c)',
        p1=patch_size, p2=patch_size)
    # → (1, 196, 768)  # 196个patch，每个768维
    return patches

# 3. 音频频谱化 (Whisper方式)
import librosa
import numpy as np

def audio_to_mel(audio_path, sr=16000, n_mels=80):
    """音频 → 梅尔频谱图"""
    y, _ = librosa.load(audio_path, sr=sr)
    mel = librosa.feature.melspectrogram(
        y=y, sr=sr, n_mels=n_mels, 
        hop_length=160, n_fft=400
    )
    log_mel = np.log10(np.clip(mel, 1e-10, None))
    # → (80, T) 频谱矩阵，T=帧数
    return log_mel

# 4. 各模态 Token 数量对比
TOKEN_COUNTS = {
    "文本 1000字":   "~500 tokens",
    "图像 512×512":  "~1024 patches (ViT-L)",
    "音频 1分钟":    "~3000 tokens (Whisper)",
    "视频 1分钟":    "~3000 frames * patches (极多!)",
}` },
  { name: '对齐学习', icon: '🔗', tag: 'Alignment',
    desc: '如何让不同模态的向量住在同一个空间里，让"猫的图片"和"cat"这个词靠得很近。',
    details: [
      { title: 'CLIP: 对比学习', content: '用 4 亿图文对训练，让匹配的图文 pair 向量相似，不匹配的远离。共享向量空间 (d=512/768)。' },
      { title: 'SigLIP: 改进 CLIP', content: 'Google 提出，用 Sigmoid 替代 Softmax，支持更大 batch size，训练更稳定。Gemini 的视觉编码器。' },
      { title: 'ImageBind: 6 模态对齐', content: 'Meta 提出，将图像、文本、音频、深度、热成像、IMU 对齐到统一空间。以图像为锚点。' },
      { title: 'BLIP-2: 桥接器', content: '用 Q-Former 作为轻量桥接模块，连接冻结的视觉编码器和 LLM。训练成本极低。' },
    ],
    code: `# ─── 对比学习: CLIP 原理 ───
import torch
import torch.nn.functional as F

class CLIP(torch.nn.Module):
    """CLIP 核心: 对比学习对齐图文"""
    
    def __init__(self, d_embed=512):
        super().__init__()
        self.image_encoder = ViT()          # 视觉编码器
        self.text_encoder = Transformer()    # 文本编码器
        self.image_proj = nn.Linear(768, d_embed)
        self.text_proj = nn.Linear(768, d_embed)
        self.temperature = nn.Parameter(torch.tensor(0.07))
    
    def forward(self, images, texts):
        # 编码
        img_emb = self.image_proj(self.image_encoder(images))  # (B, d)
        txt_emb = self.text_proj(self.text_encoder(texts))     # (B, d)
        
        # L2 归一化
        img_emb = F.normalize(img_emb, dim=-1)
        txt_emb = F.normalize(txt_emb, dim=-1)
        
        # 计算相似度矩阵 (B, B)
        logits = img_emb @ txt_emb.T / self.temperature
        
        # 对比损失: 对角线是正样本
        labels = torch.arange(len(images), device=logits.device)
        loss_i2t = F.cross_entropy(logits, labels)      # 图→文
        loss_t2i = F.cross_entropy(logits.T, labels)     # 文→图
        
        return (loss_i2t + loss_t2i) / 2

# ─── 使用 CLIP 做零样本分类 ───
from transformers import CLIPModel, CLIPProcessor

model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")

# 零样本图像分类 (无需训练!)
image = load_image("mystery_animal.jpg")
labels = ["一只猫", "一只狗", "一只鸟", "一条鱼"]

inputs = processor(text=labels, images=image, return_tensors="pt")
outputs = model(**inputs)
probs = outputs.logits_per_image.softmax(dim=-1)
# → [0.92, 0.05, 0.02, 0.01]  # 92% 是猫!

# ─── 对齐空间的妙用 ───
# 1. 以图搜图: 图片向量 cos_sim
# 2. 以文搜图: 文本向量 vs 图片向量
# 3. 以图搜文: 反过来
# 4. 零样本分类: 文本标签 vs 图片
# 5. 跨模态检索: 任意模态互搜` },
  { name: '多模态 LLM 架构', icon: '🏗️', tag: 'Architecture',
    desc: '现代多模态大模型的三种主流架构：早期融合、晚期融合、桥接器架构。',
    details: [
      { title: '早期融合 (Early Fusion)', content: '所有模态统一 Tokenize 后拼接输入 Transformer。代表：GPT-4o, Gemini。优点：模态间深度交互。' },
      { title: '晚期融合 (Late Fusion)', content: '各模态独立编码后在决策层融合。代表：CLIP。优点：模块化，可替换单模态编码器。' },
      { title: '桥接器 (Bridge)', content: '用轻量模块连接冻结的视觉编码器和 LLM。代表：LLaVA, BLIP-2。优点：训练成本低。' },
      { title: '原生多模态 (Native)', content: 'Gemini 2.0 从头训练，所有模态在同一个模型中原生处理。输入输出都支持多模态。' },
    ],
    code: `# ─── 三种多模态架构对比 ───

# ═══ 架构 1: 桥接器 (LLaVA 风格) ═══
# 最流行，训练成本最低
class LLaVAStyle(nn.Module):
    """冻结 ViT + 可训练投影层 + 冻结 LLM"""
    def __init__(self):
        self.vision_encoder = CLIPViT()      # 冻结
        self.projector = nn.Linear(1024, 4096)  # 可训练!
        self.llm = LLaMA_7B()                # 冻结或LoRA
    
    def forward(self, image, text_tokens):
        # 图像 → 视觉token
        visual_tokens = self.vision_encoder(image)  # (N, 1024)
        visual_tokens = self.projector(visual_tokens)  # (N, 4096)
        
        # 拼接: [visual_tokens, text_tokens]
        combined = torch.cat([visual_tokens, text_tokens], dim=1)
        
        # LLM 生成
        output = self.llm(combined)
        return output

# 训练成本: 仅训练 projector → 几小时 + 1张 A100!

# ═══ 架构 2: Q-Former 桥接 (BLIP-2) ═══
class BLIP2Style(nn.Module):
    """用 Q-Former 压缩视觉信息"""
    def __init__(self):
        self.vision_encoder = EVA_ViT()       # 冻结
        self.q_former = QFormer(num_queries=32)  # 可训练
        self.llm = FlanT5()                    # 冻结
    
    def forward(self, image, text):
        visual = self.vision_encoder(image)     # (257, 1408)
        # Q-Former: 用32个可学习的query token
        # 从257个视觉token中提取最关键的信息
        compressed = self.q_former(visual)       # (32, 768) ← 压缩!
        # 送入 LLM
        return self.llm(compressed, text)

# ═══ 架构 3: 原生 (Gemini / GPT-4o) ═══
# 所有模态统一 Tokenize
# 图像: VQ-VAE / ViT patch → token
# 音频: 频谱 → token
# 视频: 帧 + 音轨 → token
# 全部拼接进一个 Transformer
# → 最强但训练成本极高 (数亿GPU小时)

# ─── 选型指南 ───
ARCHITECTURE_GUIDE = {
    "快速原型":   "LLaVA/MiniCPM-V (桥接器, 开源)",
    "高质量产品": "GPT-4o / Gemini 2.0 (原生, API)",
    "定制微调":   "Qwen2-VL / InternVL (桥接器, 可微调)",
    "边缘部署":   "MobileVLM / TinyLLaVA (压缩版)",
}` },
  { name: '模态 Tokenization', icon: '🔢', tag: 'Tokenization',
    desc: '不同模态如何被切分成 Token？Token 数量直接决定了计算成本和上下文占用。',
    details: [
      { title: '文本 BPE', content: 'Byte-Pair Encoding：统计字节对频率，逐步合并。GPT-4o: ~200K vocab。1个中文字 ≈ 1-2 token。' },
      { title: '图像 Patch', content: 'ViT 切 patch。GPT-4o 低分辨率=85 token，高分辨率=最多 1105 token/块（自动 tiling）。' },
      { title: '音频 Frame', content: 'Whisper: 30s 音频 = 1500 个 frame token。Gemini: 1s 音频 ≈ 32 token。' },
      { title: '视频 = 帧×Patch', content: '1fps × 60s = 60 帧 × 256 patch = 15360 token! 所以视频需要激进压缩。' },
    ],
    code: `# ─── 各模态 Token 成本计算器 ───

# GPT-4o 定价 (2024)
# Input:  $2.50/M tokens
# Output: $10.00/M tokens

def calculate_cost(modality, size, model="gpt-4o"):
    """计算各模态的 Token 数和 API 成本"""
    
    pricing = {
        "gpt-4o":      {"input": 2.50, "output": 10.00},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
        "gemini-2.0":  {"input": 0.10, "output": 0.40},
    }
    
    token_map = {
        # 文本
        "text_100_chars":   50,     # ~50 tokens
        "text_1000_chars":  500,
        "text_article":     2000,
        
        # 图像 (GPT-4o)
        "image_low_res":    85,     # 512×512, detail=low
        "image_high_res":   765,    # 1024×1024, detail=high
        "image_4k":         1105,   # 2048×2048
        
        # 音频 (Whisper → 文本 → LLM)
        "audio_30s":        100,    # 转文字后的token数
        "audio_1min":       200,
        "audio_1hour":      12000,
        
        # 视频 (抽帧 → 图像)
        "video_1min_1fps":  60 * 765,   # 45,900 tokens!
        "video_1min_0.5fps": 30 * 765,  # 22,950 tokens
        "video_1min_gemini": 1920,      # Gemini原生: 极省!
    }
    
    tokens = token_map.get(f"{modality}_{size}", 0)
    price = pricing[model]
    cost = tokens * price["input"] / 1_000_000
    
    return {
        "tokens": tokens,
        "cost_usd": round(cost, 6),
        "cost_cny": round(cost * 7.2, 4),
    }

# 对比
print(calculate_cost("image", "high_res", "gpt-4o"))
# → {"tokens": 765, "cost_usd": 0.001913, "cost_cny": 0.0138}

print(calculate_cost("video", "1min_1fps", "gpt-4o"))
# → {"tokens": 45900, "cost_usd": 0.114750, "cost_cny": 0.8262}
# 1分钟视频花 ¥0.83! 必须压缩!

print(calculate_cost("video", "1min_gemini", "gemini-2.0"))
# → {"tokens": 1920, "cost_usd": 0.000192, "cost_cny": 0.0014}
# Gemini 原生视频: 只要 ¥0.001! 便宜 600 倍!

# ─── 结论 ───
# 文本最便宜，图像中等，视频最贵
# Gemini 原生多模态比 GPT-4o 抽帧便宜 2 个数量级
# 生产建议: 视频用 Gemini，图像用 GPT-4o，文本用 mini` },
];

export default function LessonMMFoundations() {
  const [topicIdx, setTopicIdx] = useState(0);
  const t = MODALITY_TYPES[topicIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge" style={{ background: '#7c3aed22', color: '#a78bfa', borderColor: '#7c3aed44' }}>
        🎨 module_01 — 多模态基础
      </div>
      <div className="fs-hero">
        <h1>多模态基础：让 AI 理解世界的每一种信号</h1>
        <p>
          文本只是人类信息的冰山一角——<strong>93% 的沟通是非语言的</strong>。
          多模态 AI 要理解图像中的物体、音频中的语义、视频中的事件。
          本模块深入<strong>模态表征</strong>、<strong>对齐学习</strong>和<strong>架构设计</strong>的核心原理。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🧬 四大核心概念</h2>
        <div className="fs-pills">
          {MODALITY_TYPES.map((m, i) => (
            <button key={i} className={`fs-btn ${i === topicIdx ? 'primary' : ''}`}
              onClick={() => setTopicIdx(i)}>
              {m.icon} {m.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#a78bfa' }}>{t.icon} {t.name}</h3>
            <span className="fs-tag" style={{ background: '#7c3aed22', color: '#a78bfa', borderColor: '#7c3aed44' }}>{t.tag}</span>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>{t.desc}</p>
          <div className="fs-grid-2" style={{ marginBottom: '1rem' }}>
            {t.details.map((d, i) => (
              <div key={i} className="fs-alert info">
                <strong>{d.title}</strong>
                <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>{d.content}</div>
              </div>
            ))}
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 mm_{t.tag.toLowerCase()}.py
            </div>
            <pre className="fs-code">{t.code}</pre>
          </div>
        </div>
      </div>

      {/* Multi-modal model landscape */}
      <div className="fs-section">
        <h2 className="fs-section-title">🗺️ 多模态模型全景图</h2>
        <div className="fs-card">
          <table className="fs-table">
            <thead><tr><th>模型</th><th>架构</th><th>输入模态</th><th>输出模态</th><th>上下文</th><th>开源</th></tr></thead>
            <tbody>
              {[
                ['GPT-4o', '原生融合', '文/图/音/视', '文/图/音', '128K', '❌'],
                ['Gemini 2.0', '原生融合', '文/图/音/视/PDF', '文/图/音', '2M', '❌'],
                ['Claude 3.5', '桥接器', '文/图/PDF', '文', '200K', '❌'],
                ['Qwen2-VL', '桥接器', '文/图/视', '文', '32K', '✅'],
                ['LLaVA-NeXT', '桥接器', '文/图/视', '文', '32K', '✅'],
                ['InternVL2', '桥接器', '文/图', '文', '32K', '✅'],
              ].map(([m, ...rest], i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#c084fc' }}>{m}</strong></td>
                  {rest.map((v, j) => <td key={j} style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn disabled">← 第一章</button>
        <button className="fs-btn primary">视觉 + LLM →</button>
      </div>
    </div>
  );
}
