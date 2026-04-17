import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['VAE', 'GAN', 'Diffusion Model', '对比总结'];

export default function LessonGenerativeModels() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🎨 module_04 — 生成模型</div>
      <div className="fs-hero">
        <h1>生成模型：VAE / GAN / Diffusion — 从数学到 AI 绘画</h1>
        <p>
          生成模型是 AI 创造力的源泉。本模块从<strong>变分自编码器 (VAE)</strong>
          的潜空间出发，解析<strong>对抗生成网络 (GAN)</strong> 的博弈论基础，
          深入推导<strong>扩散模型 (DDPM → Stable Diffusion)</strong> 的前向加噪与
          反向去噪过程。理解这三大范式，就理解了<strong>从 DALL-E 到 Sora 的全部核心</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎨 生成模型</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 变分自编码器 (VAE)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> vae</div>
                <pre className="fs-code">{`# VAE: 学习数据的潜在表示 + 生成新样本

# ═══ 自编码器 (AE) ═══
# Encoder: x → z (压缩)
# Decoder: z → x̂ (重建)
# 目标: min ||x - x̂||² (重建误差)
# 问题: 潜空间不连续 → 无法插值生成

# ═══ 变分自编码器 (VAE, Kingma 2013) ═══
# 核心思想: 让潜空间是连续的正态分布
# Encoder: x → (μ, σ²)  (输出分布参数)
# z = μ + σ · ε, ε ~ N(0,1)  (重参数化技巧)
# Decoder: z → x̂

import torch
import torch.nn as nn

class VAE(nn.Module):
    def __init__(self, input_dim=784, latent_dim=32):
        super().__init__()
        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 512), nn.ReLU(),
            nn.Linear(512, 256), nn.ReLU(),
        )
        self.fc_mu    = nn.Linear(256, latent_dim)  # 均值
        self.fc_logvar = nn.Linear(256, latent_dim) # 对数方差
        
        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 256), nn.ReLU(),
            nn.Linear(256, 512), nn.ReLU(),
            nn.Linear(512, input_dim), nn.Sigmoid(),
        )
    
    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)     # ε ~ N(0,1)
        return mu + eps * std           # 重参数化
    
    def forward(self, x):
        h = self.encoder(x)
        mu, logvar = self.fc_mu(h), self.fc_logvar(h)
        z = self.reparameterize(mu, logvar)
        return self.decoder(z), mu, logvar

# ═══ 损失函数 (ELBO) ═══
# L = 重建损失 + KL散度
# L = E[log p(x|z)] - KL(q(z|x) || p(z))
# 
# 重建损失: BCE 或 MSE (还原质量)
# KL 散度:  -0.5 * Σ(1 + log(σ²) - μ² - σ²)
#           → 约束潜空间接近标准正态分布

def vae_loss(x_recon, x, mu, logvar):
    recon = nn.BCELoss(reduction='sum')(x_recon, x)
    kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    return recon + kl

# ═══ VAE 的应用 ═══
# 图像生成 / 药物分子设计 / 异常检测 / 数据增强
# 局限: 生成图像较模糊 (← GAN 和 Diffusion 解决)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚔️ 生成对抗网络 (GAN)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> gan</div>
                <pre className="fs-code">{`# GAN (Goodfellow, 2014): 博弈论驱动的生成

# ═══ 核心思想: 两个网络对抗 ═══
# Generator (造假者): 噪声 z → 假图像
# Discriminator (鉴定师): 判断真/假
#
# min_G max_D V(D,G) = E[log D(x)] + E[log(1-D(G(z)))]
# → 纳什均衡: D 分不出真假, G 生成逼真图像

import torch.nn as nn

class Generator(nn.Module):
    def __init__(self, latent_dim=100, img_channels=1):
        super().__init__()
        self.net = nn.Sequential(
            nn.ConvTranspose2d(latent_dim, 256, 7, 1, 0),
            nn.BatchNorm2d(256), nn.ReLU(),
            nn.ConvTranspose2d(256, 128, 4, 2, 1),
            nn.BatchNorm2d(128), nn.ReLU(),
            nn.ConvTranspose2d(128, img_channels, 4, 2, 1),
            nn.Tanh(),  # 输出 [-1, 1]
        )
    
    def forward(self, z):
        return self.net(z.view(-1, 100, 1, 1))

class Discriminator(nn.Module):
    def __init__(self, img_channels=1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(img_channels, 64, 4, 2, 1),
            nn.LeakyReLU(0.2),
            nn.Conv2d(64, 128, 4, 2, 1),
            nn.BatchNorm2d(128), nn.LeakyReLU(0.2),
            nn.Flatten(),
            nn.Linear(128 * 7 * 7, 1),
            nn.Sigmoid(),
        )

# ═══ GAN 训练 (交替优化) ═══
# Step 1: 训练 D (最大化判别能力)
#   real_loss = BCE(D(real), 1)
#   fake_loss = BCE(D(G(z)), 0)
#   d_loss = real_loss + fake_loss
#
# Step 2: 训练 G (欺骗 D)
#   g_loss = BCE(D(G(z)), 1)

# ═══ GAN 家族 ═══
gan_family = {
    "DCGAN (2016)":    "CNN + 稳定训练技巧",
    "WGAN (2017)":     "Wasserstein 距离, 解决模式崩塌",
    "ProgressiveGAN":  "逐步增加分辨率 (4→1024)",
    "StyleGAN (2019)": "风格控制, 人脸生成巅峰",
    "StyleGAN3":       "消除伪影, alias-free",
    "CycleGAN":        "无配对图像转换 (马↔斑马)",
    "Pix2Pix":         "有配对图像转换 (草图→照片)",
}

# ═══ GAN 的挑战 ═══
# 1. 训练不稳定: G 和 D 的平衡难维持
# 2. 模式崩塌: G 只生成有限样式
# 3. 评价困难: FID / IS 不完美
# → 2022 后, Diffusion Model 大幅超越 GAN`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌊 扩散模型 (Diffusion Model)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> diffusion_model</div>
                <pre className="fs-code">{`# 扩散模型: 2022 之后生成 AI 的绝对统治者

# ═══ 核心思想 ═══
# 前向过程: 逐步加噪 (图像→纯噪声)
# 反向过程: 逐步去噪 (噪声→图像)
# 训练: 学习在给定时间步预测噪声

# ═══ DDPM (2020, Ho et al.) ═══
# 前向 (加噪): q(x_t | x_{t-1}) = N(√(1-β_t)·x_{t-1}, β_t·I)
# → 等价: x_t = √ᾱ_t · x_0 + √(1-ᾱ_t) · ε, ε ~ N(0,I)
# → T步后: x_T ≈ N(0, I)  (纯高斯噪声)

# 反向 (去噪): p_θ(x_{t-1} | x_t) 
# → 神经网络预测噪声 ε_θ(x_t, t)

import torch
import torch.nn as nn

# 简化版噪声预测网络 (实际用 U-Net)
class NoisePredictor(nn.Module):
    """预测添加到 x_t 中的噪声"""
    def __init__(self):
        super().__init__()
        self.unet = UNet(in_ch=3, out_ch=3, time_emb_dim=256)
    
    def forward(self, x_t, t):
        # x_t: 带噪图像, t: 时间步
        return self.unet(x_t, t)  # 预测噪声 ε

# ═══ 训练循环 (极简版) ═══
# for x_0 in dataloader:
#     t = random_timestep()            # 随机时间步
#     ε = torch.randn_like(x_0)       # 真实噪声
#     x_t = sqrt_alpha_bar[t]*x_0 + sqrt_one_minus[t]*ε  # 加噪
#     ε_pred = model(x_t, t)          # 预测噪声
#     loss = MSE(ε_pred, ε)           # 简单 MSE!

# ═══ 采样 (生成图像) ═══
# x_T ~ N(0, I)               # 从纯噪声开始
# for t in range(T, 0, -1):   # T=1000→0
#     ε_pred = model(x_t, t)  # 预测噪声
#     x_{t-1} = denoise(x_t, ε_pred, t)  # 去一步噪声
# return x_0                   # 生成的图像!

# ═══ Stable Diffusion 架构 ═══
# 不在像素空间操作 → 在潜空间 (Latent Space)
# 1. VAE Encoder: 图像 (512×512) → 潜码 (64×64)
# 2. U-Net + Cross-Attention: 在潜空间去噪
# 3. 条件注入: 文本 → CLIP → Cross-Attention
# 4. VAE Decoder: 潜码 → 图像

# ═══ Classifier-Free Guidance ═══
# 同时训练有条件和无条件去噪
# 采样时: ε = ε_uncond + w·(ε_cond - ε_uncond)
# w > 1: 更遵循文本 (w=7.5 常见)

# ═══ 生成路线图 ═══
# DDPM → DDIM (快速采样) → LDM (潜空间) 
# → Stable Diffusion → SDXL → SD3 (Flow Matching)
# → DALL-E 3 → Midjourney → Sora (视频扩散)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 三大生成范式对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> comparison</div>
                <pre className="fs-code">{`# 生成模型三大范式对比 (2024 视角)

# ┌──────────┬──────────────┬──────────────┬──────────────┐
# │          │ VAE           │ GAN          │ Diffusion    │
# ├──────────┼──────────────┼──────────────┼──────────────┤
# │ 训练     │ 稳定(ELBO)    │ 不稳定(对抗)  │ 稳定(MSE)    │
# │ 质量     │ 模糊          │ 锐利          │ 最佳          │
# │ 多样性   │ 高            │ 模式崩塌风险  │ 高            │
# │ 速度     │ 快            │ 快            │ 慢(需迭代)    │
# │ 可控性   │ 中            │ 中            │ 强(条件注入)  │
# │ 理论     │ 概率图模型    │ 博弈论        │ 分数匹配      │
# │ 当前地位 │ 辅助角色      │ 被替代中      │ 绝对主导 ✅   │
# └──────────┴──────────────┴──────────────┴──────────────┘

# ═══ 最新趋势 (2024-2025) ═══
latest_trends = {
    "Flow Matching": {
        "原理": "ODE 路径优化, 比扩散更优雅",
        "代表": "SD3 / Flux / Sora",
        "优势": "训练更稳定 / 采样更灵活",
    },
    "Consistency Models": {
        "原理": "一步生成 (OpenAI)",
        "优势": "极大加速采样 (1000步→1步)",
    },
    "Rectified Flow": {
        "原理": "直线ODE路径",
        "代表": "InstaFlow / SD3",
    },
    "视频扩散": {
        "代表": "Sora / Veo / Kling",
        "架构": "3D U-Net / DiT (Diffusion Transformer)",
        "挑战": "时间一致性 / 计算成本",
    },
}

# ═══ DiT: Diffusion Transformer ═══
# 用 Transformer 替代 U-Net 做去噪
# Sora 的核心架构
# → Vision Transformer + 扩散 + 时序建模

# ═══ 选型指南 ═══
# 需要快速生成?     → VAE / GAN
# 需要最高质量?     → Diffusion / Flow
# 需要文本控制?     → Stable Diffusion
# 需要视频生成?     → DiT (Sora 路线)
# 需要科学结构?     → Diffusion (分子/蛋白质)
# 需要实时交互?     → Consistency Model / LCM`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
