import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['CNN 架构', 'ResNet 革命', '现代 CNN', '目标检测'];

export default function LessonCNN() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🖼️ module_02 — 卷积神经网络</div>
      <div className="fs-hero">
        <h1>卷积神经网络：从 LeNet 到 EfficientNet 的架构演进</h1>
        <p>
          CNN 是<strong>计算机视觉的基石</strong>。本模块从卷积核的数学原理出发，
          解析 AlexNet → VGG → GoogLeNet → <strong>ResNet 残差革命</strong> →
          EfficientNet → ConvNeXt 的架构演进脉络，深入理解感受野、特征金字塔、
          目标检测（YOLO 系列）等核心概念。每个架构为什么有效？
          <strong>不只是代码，更是设计直觉</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🖼️ 卷积神经网络</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 卷积操作的数学本质</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> convolution_fundamentals</div>
                <pre className="fs-code">{`# 卷积神经网络: 利用空间结构的神经网络

import torch
import torch.nn as nn

# ═══ 1. 卷积操作 ═══
# 卷积核(Filter)在输入上滑动, 做逐元素乘法+求和
# 关键参数:
#   - kernel_size: 卷积核大小 (3x3 最常见)
#   - stride:      步幅 (控制下采样)
#   - padding:     填充 (保持分辨率)
#   - dilation:    空洞卷积 (扩大感受野)

conv = nn.Conv2d(
    in_channels=3,     # RGB 输入
    out_channels=64,   # 64 个卷积核
    kernel_size=3,     # 3x3 卷积核
    stride=1,          # 步幅 1
    padding=1,         # same padding
)
# 输出尺寸: H_out = (H_in + 2P - K) / S + 1

# ═══ 2. 为什么 CNN > MLP 处理图像? ═══
# a) 参数共享: 同一卷积核扫描整张图 → 参数少
#    MLP: 224×224×3 → 1000 = 1.5 亿参数
#    CNN: 3×3×3×64 = 1,728 参数
# b) 局部连接: 每个神经元只看局部区域
# c) 平移等变: 猫在哪里都能识别

# ═══ 3. LeNet-5 (1998, Yann LeCun) ═══
class LeNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 6, 5),       # 28→24
            nn.Tanh(),
            nn.AvgPool2d(2),          # 24→12
            nn.Conv2d(6, 16, 5),      # 12→8
            nn.Tanh(),
            nn.AvgPool2d(2),          # 8→4
        )
        self.classifier = nn.Sequential(
            nn.Linear(16*4*4, 120),
            nn.Tanh(),
            nn.Linear(120, 84),
            nn.Tanh(),
            nn.Linear(84, 10),
        )

# ═══ 4. AlexNet (2012, 扣动 DL 扳机) ═══
# 关键创新: ReLU / Dropout / GPU训练 / 数据增强
# ImageNet Top-5 error: 26.1% → 15.3% (碾压传统方法)

# ═══ 5. VGGNet (2014, "深度即力量") ═══
# 核心发现: 多个 3×3 卷积 = 一个大卷积核
# 两个 3×3 → 感受野 = 5×5, 但参数更少
# 三个 3×3 → 感受野 = 7×7
# VGG-16: 16层, 1.38亿参数

# ═══ 架构演进时间线 ═══
# ┌──────────┬──────┬───────────┬──────────────┐
# │ 架构      │ 年份  │ 深度       │ Top-5 Error  │
# ├──────────┼──────┼───────────┼──────────────┤
# │ AlexNet  │ 2012 │ 8 层       │ 15.3%        │
# │ VGG-16   │ 2014 │ 16 层      │ 7.3%         │
# │ GoogLeNet│ 2014 │ 22 层      │ 6.7%         │
# │ ResNet   │ 2015 │ 152 层     │ 3.6%         │
# │ 人类水平  │  —   │  —        │ ~5.1%        │
# └──────────┴──────┴───────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ ResNet: 残差学习革命</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> resnet_revolution</div>
                <pre className="fs-code">{`# ResNet (2015, Kaiming He): 深度学习最重要的论文之一

# ═══ 核心问题: 深层网络退化 ═══
# 直觉: 更深的网络应该至少不比浅网络差
# 现实: 56层网络 > 20层网络的训练误差!
# 原因: 不是过拟合, 是优化困难

# ═══ 残差学习 (Residual Learning) ═══
# 不学 H(x), 而是学残差 F(x) = H(x) - x
# 输出: y = F(x) + x   (Skip Connection)
#
#    x ──────────────────────┐
#    │                       │ (identity shortcut)
#    ↓                       │
#  [Conv → BN → ReLU]       │
#    │                       │
#  [Conv → BN]               │
#    │                       │
#    ↓                       │
#    + ←─────────────────────┘
#    │
#  [ReLU]
#    ↓

import torch.nn as nn

class BasicBlock(nn.Module):
    def __init__(self, in_ch, out_ch, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, 3, stride, 1, bias=False)
        self.bn1   = nn.BatchNorm2d(out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, 3, 1, 1, bias=False)
        self.bn2   = nn.BatchNorm2d(out_ch)
        self.relu  = nn.ReLU(inplace=True)
        
        # 维度匹配的 shortcut
        self.shortcut = nn.Sequential()
        if stride != 1 or in_ch != out_ch:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 1, stride, bias=False),
                nn.BatchNorm2d(out_ch),
            )
    
    def forward(self, x):
        residual = self.shortcut(x)  # 恒等映射
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual              # 残差连接 ← 核心!
        return self.relu(out)

# ═══ 为什么残差连接有效? ═══
# 1. 梯度直通: ∂L/∂x = ∂L/∂y · (∂F/∂x + 1)
#    → 即使 ∂F/∂x ≈ 0, 梯度仍能通过 +1 传回
# 2. 学习增量: 每层只需学习"改进量"而非完整映射
# 3. 隐式集成: ResNet ≈ 不同深度网络的集成`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 现代 CNN 架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> modern_cnn</div>
                <pre className="fs-code">{`# 2017-2024 CNN 架构演进

# ═══ 1. DenseNet (2017) ═══
# 每层连接到之前所有层: x_l = H([x_0, x_1, ..., x_{l-1}])
# 特征复用 / 参数效率高 / 但内存开销大

# ═══ 2. EfficientNet (2019, Google) ═══
# 核心: 复合缩放 (Compound Scaling)
# 同时缩放 深度(d) × 宽度(w) × 分辨率(r)
# d = α^φ, w = β^φ, r = γ^φ
# 约束: α·β²·γ² ≈ 2
compound_scaling = {
    "B0": "baseline (5.3M params)",
    "B1": "d=1.1, w=1.0, r=1.15",
    "B4": "19M params, 超越 ResNet-152",
    "B7": "66M params, SOTA on ImageNet",
}
# MBConv (Mobile Inverted Bottleneck): 
# 1x1扩张 → Depthwise 3x3 → SE → 1x1压缩

# ═══ 3. ConvNeXt (2022, Meta) ═══
# "A ConvNet for the 2020s"
# 把 Transformer 的设计搬回 CNN:
modernization = {
    "Patchify stem":     "4×4 conv, stride=4 (像 ViT)",
    "Inverted bottleneck": "先扩张再压缩",
    "Large kernel":      "7×7 depthwise conv",
    "LayerNorm":         "替代 BatchNorm",
    "GELU":              "替代 ReLU",
    "Fewer activations": "减少激活函数数量",
}
# → 纯 CNN 也能打败 Swin Transformer!

# ═══ 4. 注意力机制进入 CNN ═══
# SE-Net (Squeeze-and-Excitation):
#   全局平均池化 → FC → Sigmoid → 通道加权
# CBAM: 通道注意力 + 空间注意力
# ECA-Net: 高效通道注意力 (1D convolution)

# ═══ CNN vs Transformer (2024 视角) ═══
# ┌──────────┬──────────────┬──────────────┐
# │          │ CNN           │ Transformer  │
# ├──────────┼──────────────┼──────────────┤
# │ 归纳偏置 │ 局部性+平移   │ 无 (纯数据)  │
# │ 数据效率 │ 高 (小数据好) │ 低 (需大数据) │
# │ 计算复杂度│ O(K²·C²·HW) │ O(N²·D)      │
# │ 大规模   │ ConvNeXt     │ ViT/DINOv2   │
# │ 趋势     │ 与Transformer│ 融合 (混合)  │
# └──────────┴──────────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 目标检测: YOLO 与 DETR</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> object_detection</div>
                <pre className="fs-code">{`# 目标检测: 图像分类的工程化延伸

# ═══ Two-Stage 检测器 ═══
# R-CNN → Fast R-CNN → Faster R-CNN
# 1) Region Proposal Network (RPN): 提议候选框
# 2) RoI Pooling: 特征对齐
# 3) Classification + Regression: 分类+回归
# 精度高, 但速度慢 (~7 FPS)

# ═══ One-Stage 检测器: YOLO ═══
# "You Only Look Once" — 一次前向推理
# 核心: 将图像划分为 S×S 网格, 每格预测 B 个框

# YOLO 演进:
yolo_evolution = {
    "YOLOv1 (2016)": "开创 one-stage, 实时检测",
    "YOLOv3 (2018)": "多尺度预测 (FPN)",
    "YOLOv5 (2020)": "工程化标杆, PyTorch",
    "YOLOv8 (2023)": "Ultralytics, anchor-free",
    "YOLOv9 (2024)": "PGI + GELAN 架构",
    "YOLO11 (2024)": "最新版, C3k2 模块",
}

# YOLOv8 使用示例:
# from ultralytics import YOLO
# model = YOLO('yolov8n.pt')     # nano 模型
# results = model('image.jpg')    # 推理
# model.train(data='coco.yaml', epochs=100)  # 训练

# ═══ DETR: Transformer 做检测 ═══
# Detection Transformer (2020, Meta)
# 1) CNN backbone → 特征图
# 2) Transformer Encoder → 全局特征
# 3) Transformer Decoder + Object Queries → 预测
# 4) 匈牙利匹配 → 无需 NMS!
#
# 后续改进:
detr_family = {
    "DETR":      "首个端到端检测 (收敛慢)",
    "Deformable":"可变形注意力 (加速收敛)",
    "DINO":      "DETR + 去噪预训练",
    "RT-DETR":   "实时 DETR (百度, 超越YOLO)",
    "Co-DETR":   "多标签分配, COCO SOTA",
}

# ═══ 评价指标 ═══
metrics = {
    "mAP":   "mean Average Precision (核心指标)",
    "AP50":  "IoU=0.5 的 AP",
    "AP75":  "IoU=0.75 的 AP (更严格)",
    "FPS":   "每秒推理帧数 (速度指标)",
    "FLOPs": "浮点运算量 (计算复杂度)",
}`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
