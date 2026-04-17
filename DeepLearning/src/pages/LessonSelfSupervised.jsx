import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['对比学习', 'CLIP', 'MAE & BEiT', 'DINO v2'];

export default function LessonSelfSupervised() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🔗 module_06 — 自监督与对比学习</div>
      <div className="fs-hero">
        <h1>自监督与对比学习：SimCLR / CLIP / MAE / DINO v2</h1>
        <p>
          <strong>自监督学习</strong>让模型从无标注数据中学习强大的表示。
          本模块从对比学习 (SimCLR/MoCo) 的 InfoNCE 损失出发，
          解析 <strong>CLIP 的图文对齐</strong>如何改变了多模态理解，
          深入 <strong>MAE 的掩码预训练</strong>和 <strong>DINO v2 的自蒸馏</strong>，
          理解为什么"预训练+微调"成为 CV 和 NLP 的统一范式。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔗 自监督学习</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 对比学习 (Contrastive Learning)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> contrastive_learning</div>
                <pre className="fs-code">{`# 对比学习: 不需要标签, 从数据本身学习表示

# ═══ 核心思想 ═══
# 正样本对: 同一图像的不同增强 → 拉近
# 负样本对: 不同图像 → 推远
# → 学到的表示保留语义信息, 丢弃无关变换

# ═══ SimCLR (Google, 2020) ═══
# 简单但强大的对比学习框架
# 1. 随机数据增强 (裁剪/翻转/颜色/模糊)
# 2. 编码器 f (ResNet-50)
# 3. 投影头 g (MLP)
# 4. NT-Xent 损失 (Normalized Temperature-scaled)

# InfoNCE Loss:
# L = -log( exp(sim(z_i, z_j)/τ) / Σ exp(sim(z_i, z_k)/τ) )
# sim = cosine similarity
# τ = temperature (0.07~0.5)

import torch
import torch.nn.functional as F

def simclr_loss(z_i, z_j, temperature=0.5):
    """NT-Xent: 对比学习核心损失"""
    batch_size = z_i.size(0)
    z = torch.cat([z_i, z_j], dim=0)  # (2N, D)
    z = F.normalize(z, dim=1)
    
    # 相似度矩阵 (2N × 2N)
    sim = z @ z.T / temperature
    
    # 正样本对: (i, i+N) 和 (i+N, i)
    labels = torch.arange(batch_size).to(z.device)
    labels = torch.cat([labels + batch_size, labels])
    
    # 去掉自身相似度
    mask = ~torch.eye(2 * batch_size, dtype=bool).to(z.device)
    sim = sim.masked_select(mask).view(2 * batch_size, -1)
    
    return F.cross_entropy(sim, labels)

# ═══ MoCo (Meta, 2020) ═══
# Momentum Contrast
# 关键: 动量编码器 + 队列 (解决大 batch 需求)
# Key 编码器: 参数 = 0.999 * key_params + 0.001 * query_params
# 队列: 存储历史 key, 提供大量负样本
# → 只需 256 batch size (SimCLR 需要 4096)

# ═══ BYOL (DeepMind, 2020) ═══
# 不需要负样本! 只用正样本对
# Online network: 编码器 + 投影头 + 预测头
# Target network: 编码器 + 投影头 (EMA 更新)
# 损失: 让 online 预测 target 的表示
# → 为什么不塌缩? EMA + 预测头的不对称

# ═══ 数据增强是关键 ═══
augmentations = {
    "RandomResizedCrop": "最重要! 强迫模型学内容不是位置",
    "ColorJitter":       "颜色不是语义信息 → 忽略",
    "GaussianBlur":      "低频信息足够区分目标",
    "RandomGrayscale":   "颜色无关的特征",
    "RandomHorizontalFlip": "基础增强",
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌉 CLIP: 图文对齐的里程碑</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> clip</div>
                <pre className="fs-code">{`# CLIP (OpenAI, 2021): 图文对齐改变一切

# ═══ 核心思想 ═══
# 4 亿图文对 → 对比学习 → 图像和文本共享表示空间
# "a photo of a cat" ↔ 🐱

# ═══ 架构 ═══
# Image Encoder: ViT-L/14 或 ResNet
# Text Encoder:  Transformer
# 训练: 对齐 (image, text) 配对
#
#       Text1   Text2   Text3   Text4
# Img1  ✅ high  ❌ low  ❌ low  ❌ low
# Img2  ❌ low   ✅ high ❌ low  ❌ low
# Img3  ❌ low   ❌ low  ✅ high ❌ low
# Img4  ❌ low   ❌ low  ❌ low  ✅ high

# 对角线 = 正样本, 其他 = 负样本

# ═══ Zero-Shot 分类 ═══
# 不需要训练! 直接用文本描述做分类
classes = ["a photo of a dog", "a photo of a cat", 
           "a photo of a car", "a photo of a tree"]
# image_embedding = clip_image_encoder(image)
# text_embeddings = clip_text_encoder(classes)
# prediction = argmax(cosine_sim(image, texts))

# ═══ 为什么 CLIP 如此重要? ═══
impact = {
    "零样本学习":  "无需标注数据即可分类",
    "开放词汇":    "不受固定类别限制",
    "多模态对齐":  "图文在同一空间, 可以互检索",
    "下游基座":    "Stable Diffusion / DALL-E 的条件编码器",
    "评价指标":    "CLIPScore 评估生成图像质量",
}

# ═══ CLIP 家族演进 ═══
clip_family = {
    "CLIP":      "400M 图文对, ViT-L/14",
    "OpenCLIP":  "开源复现, LAION-5B 训练",
    "SigLIP":    "Google, Sigmoid Loss (不需负样本)",
    "EVA-CLIP":  "最佳开源 CLIP (4.4B)",
    "MetaCLIP":  "Meta, 元数据驱动的数据策展",
    "BLIP-2":    "图文理解 + 生成 (Salesforce)",
}

# ═══ CLIP 的局限 ═══
# 1. 组合理解差: "红色方块在蓝色圆上" 
# 2. 计数困难: "5只猫" vs "2只猫"
# 3. 空间关系: "左边"/"右边" 不敏感
# 4. 否定理解: "没有猫" 仍然激活"猫"
# → 这些问题在 GPT-4V / Gemini 等 VLM 中改善`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎭 MAE: 掩码自编码器</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> mae_beit</div>
                <pre className="fs-code">{`# MAE (Masked Autoencoders, Meta 2022)
# "BERT for Vision" — 视觉领域的掩码预训练

# ═══ 核心思想 ═══
# 1. 将图像分成 16×16 patch
# 2. 随机遮住 75% 的 patch!
# 3. ViT Encoder 只处理可见的 25%
# 4. 轻量 Decoder 重建被遮住的 patch
# 5. Loss = MSE(重建像素, 原始像素)

# ═══ 为什么 75% 遮掩率有效? ═══
# 图像冗余度高 — 遮 75% 才有足够"挑战"
# (NLP 的 BERT 只遮 15%, 因为语言信息密度高)

# ═══ 关键设计 ═══
architecture = {
    "Encoder":   "ViT-Large, 只处理可见 patch (快!)",
    "Decoder":   "轻量 Transformer (8层, 512维)",
    "Mask ratio":"75% (最优, NLP 不同!)",
    "Target":    "原始像素值 (归一化后)",
    "位置编码":  "sinusoidal, 编码器+解码器都用",
}

# 预训练后:
# - 丢弃 Decoder
# - Encoder 作为特征提取器
# - 在 ImageNet 上微调 → SOTA

# ═══ BEiT (微软, 2021) ═══
# 不重建像素, 而是重建 visual tokens
# 1. dVAE 将图像编码为离散 token
# 2. 遮掩 patch → 预测对应的 token (分类任务)
# → 类似 BERT 的 MLM, 但用于视觉

# ═══ 自监督预训练范式对比 ═══
# ┌──────────────┬───────────────┬───────────┬──────────┐
# │ 方法          │ 预训练任务     │ 数据需求   │ 特点     │
# ├──────────────┼───────────────┼───────────┼──────────┤
# │ SimCLR/MoCo  │ 对比学习      │ 增强对     │ 全局语义 │
# │ CLIP         │ 图文对比      │ 图文对     │ 零样本   │
# │ MAE          │ 掩码重建      │ 仅图像     │ 局部细节 │
# │ BEiT         │ 掩码预测      │ 仅图像     │ 离散化   │
# │ DINO         │ 自蒸馏        │ 仅图像     │ 涌现分割 │
# └──────────────┴───────────────┴───────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🦕 DINO v2: 自蒸馏视觉基座</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> dino_v2</div>
                <pre className="fs-code">{`# DINO (Meta, 2021): 自蒸馏 → 涌现式分割
# DINOv2 (2023): 最强开源视觉特征提取器

# ═══ DINO: Self-Distillation with No Labels ═══
# 
# Student Network ← Teacher Network (EMA)
#   ↑ 不同增强        ↑ 不同增强
#   └──── 同一图像 ────┘
#
# Student: 小裁剪 (local patches)
# Teacher: 大裁剪 (global patches)
# 损失: Cross-Entropy(student_output, teacher_output)
# Teacher: EMA 更新 (不反向传播)

# ═══ 惊人发现: 涌现式分割 ═══
# DINO 的 Self-Attention 自动学到了:
# - 物体边界 (无监督分割!)
# - 语义部件 (鸟的头/翅膀/尾巴)
# - 前景/背景分离
# → 没有任何分割标注, 纯自监督涌现!

# ═══ DINOv2 (2023): 通用视觉特征 ═══
# 目标: 一个模型 → 所有视觉任务 (冻结特征)
dinov2_recipe = {
    "数据":    "LVD-142M (自动策展的 142M 图像)",
    "架构":    "ViT-g/14 (1.1B 参数)",
    "方法":    "DINO 自蒸馏 + iBOT 掩码 + KoLeo 正则",
    "训练":    "~22K GPU hours (A100)",
}

# ═══ DINOv2 的性能 ═══
# 冻结特征 (不微调!) 在各任务的表现:
frozen_performance = {
    "ImageNet 分类": "86.5% (冻结! 微调更高)",
    "语义分割":      "ADE20K 上接近监督方法",
    "单目深度":      "KITTI/NYU 上超越专业模型",
    "实例检索":      "Oxford/Paris 高精度",
    "视频理解":      "跨帧特征匹配",
}

# ═══ 使用 DINOv2 ═══
# import torch
# dinov2 = torch.hub.load('facebookresearch/dinov2', 'dinov2_vitl14')
# features = dinov2(images)  # 冻结特征提取
# # 接上简单线性头即可用于各种下游任务

# ═══ 2024-2025 自监督趋势 ═══
ssl_trends = {
    "视觉+语言":   "SigLIP / InternVL / EVA-CLIP",
    "视频理解":     "V-JEPA (Meta, Yann LeCun)",
    "3D 理解":      "Point-MAE / 3D 自监督",
    "多模态统一":   "ImageBind (6种模态对齐)",
    "世界模型":     "JEPA → 预测潜空间而非像素",
}`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
