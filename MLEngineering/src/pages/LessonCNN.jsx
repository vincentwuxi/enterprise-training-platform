import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 卷积操作可视化
function ConvViz() {
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(1);
  const [kernelSize, setKernelSize] = useState(3);

  const inputSize = 6;
  const outputSize = Math.floor((inputSize + 2 * padding - kernelSize) / stride) + 1;

  const INPUT = [
    [1,2,3,0,1,2],[0,1,2,3,0,1],[2,3,0,1,2,3],
    [1,0,1,2,3,0],[3,2,1,0,1,2],[0,1,2,3,0,1],
  ];
  const KERNEL = [[1,0,-1],[1,0,-1],[1,0,-1]]; // Sobel edge detector

  return (
    <div className="ml-interactive">
      <h3>🔬 卷积操作可视化（边缘检测 Sobel Filter）</h3>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* 参数控制 */}
        <div style={{ minWidth: 180 }}>
          {[
            ['Kernel Size', kernelSize, setKernelSize, 1, 5, 2],
            ['Stride', stride, setStride, 1, 3, 1],
            ['Padding', padding, setPadding, 0, 2, 1],
          ].map(([label, val, setter, min, max, step]) => (
            <div key={label} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.15rem' }}>
                <span>{label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#34d399', fontWeight: 800 }}>{val}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val}
                onChange={e => setter(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }} />
            </div>
          ))}
          <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.4rem', lineHeight: 1.7 }}>
            输出尺寸公式：<br />
            <span style={{ fontFamily: 'JetBrains Mono', color: '#34d399', fontSize: '0.65rem' }}>
              ⌊(H + 2P - K) / S⌋ + 1
            </span><br />
            = ⌊({inputSize} + {2*padding} - {kernelSize}) / {stride}⌋ + 1<br />
            = <span style={{ color: '#f97316', fontWeight: 800 }}>{outputSize}</span>
          </div>
        </div>

        {/* 输入 feature map */}
        <div>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.3rem', fontWeight: 700 }}>INPUT {inputSize}×{inputSize}</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${inputSize}, 28px)`, gap: 2 }}>
            {INPUT.flat().map((v, i) => (
              <div key={i} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, fontSize: '0.65rem', fontFamily: 'JetBrains Mono', fontWeight: 700,
                background: `rgba(59,130,246,${v/4 * 0.6 + 0.05})`, color: '#93c5fd' }}>{v}</div>
            ))}
          </div>
        </div>

        {/* 卷积核 */}
        <div>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.3rem', fontWeight: 700 }}>KERNEL {kernelSize}×{kernelSize} (Sobel-X)</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kernelSize}, 32px)`, gap: 2 }}>
            {Array.from({ length: kernelSize * kernelSize }, (_, i) => {
              const r = Math.floor(i / kernelSize), c = i % kernelSize;
              const v = r < KERNEL.length && c < KERNEL[r].length ? KERNEL[r][c] : 0;
              return (
                <div key={i} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, fontSize: '0.7rem', fontFamily: 'JetBrains Mono', fontWeight: 800,
                  background: v > 0 ? 'rgba(16,185,129,0.2)' : v < 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)',
                  border: v > 0 ? '1px solid rgba(16,185,129,0.3)' : v < 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: v > 0 ? '#10b981' : v < 0 ? '#ef4444' : '#4b5563' }}>
                  {v > 0 ? `+${v}` : v}
                </div>
              );
            })}
          </div>
        </div>

        {/* 输出 */}
        <div>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.3rem', fontWeight: 700 }}>OUTPUT {outputSize}×{outputSize}</div>
          {outputSize > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${outputSize}, 28px)`, gap: 2 }}>
              {Array.from({ length: outputSize * outputSize }, (_, i) => (
                <div key={i} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, fontSize: '0.6rem', fontFamily: 'JetBrains Mono', fontWeight: 700, background: 'rgba(249,115,22,0.15)', color: '#fb923c' }}>
                  {Math.floor(Math.random() * 6 - 3)}
                </div>
              ))}
            </div>
          ) : <div style={{ color: '#ef4444', fontSize: '0.72rem' }}>参数无效！</div>}
        </div>
      </div>
    </div>
  );
}

const CNN_CODE = `# CNN 完整实现：图像分类（CIFAR-10 / ImageNet 迁移学习）

import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
from torchvision import models

# ══════════════ 1. 数据预处理（关键！）══════════════
train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),      # 数据增强：随机翻转
    transforms.RandomCrop(32, padding=4),         # 随机裁剪
    transforms.ColorJitter(brightness=0.2, contrast=0.2),  # 色彩抖动
    transforms.ToTensor(),                         # [0,255] → [0,1]
    transforms.Normalize(mean=[0.485, 0.456, 0.406],  # ImageNet 均值
                        std=[0.229, 0.224, 0.225]),   # ImageNet 标准差
])

val_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225]),
])

# ══════════════ 2. 自定义 CNN 架构 ══════════════
class ResidualBlock(nn.Module):
    """残差块：解决深层网络梯度消失（ResNet 核心）"""
    def __init__(self, channels: int):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn1   = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn2   = nn.BatchNorm2d(channels)
        self.relu  = nn.ReLU(inplace=True)
    
    def forward(self, x):
        residual = x                       # 保存跳跃连接（shortcut）
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual                    # x + F(x)：跳跃连接！
        return self.relu(out)

class SimpleCNN(nn.Module):
    def __init__(self, num_classes: int = 10):
        super().__init__()
        self.features = nn.Sequential(
            # Block 1: 3×32×32 → 32×16×16
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),           # 空间尺寸减半
            
            # Block 2: 32×16×16 → 64×8×8
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            ResidualBlock(64),         # 残差连接
            nn.MaxPool2d(2),
            
            # Block 3: 64×8×8 → 128×4×4
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),   # 全局平均池化（任意尺寸输入→固定输出）
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(128, num_classes),
        )
    
    def forward(self, x):
        return self.classifier(self.features(x))

# ══════════════ 3. 迁移学习（最实用！）══════════════
# 在新任务上复用 ImageNet 预训练权重，只训练最后几层
def create_transfer_model(num_classes: int, freeze_backbone: bool = True):
    # 加载预训练 ResNet-50（在 ImageNet 1M 张图上训练了 90 轮）
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
    
    if freeze_backbone:
        # 冻结所有层（只训练分类头）→ 速度快，数据少时用这个
        for param in model.parameters():
            param.requires_grad = False
    
    # 替换最后的分类层（原来 1000 类 ImageNet → 你的类别数）
    in_features = model.fc.in_features   # = 2048
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Linear(512, num_classes)
    )
    return model

# 只有分类头的参数会被更新（效率极高！）
model = create_transfer_model(num_classes=5)  # 5类花卉分类
optimizer = optim.Adam(model.fc.parameters(), lr=1e-3)`;

export default function LessonCNN() {
  const navigate = useNavigate();

  return (
    <div className="lesson-ml">
      <div className="ml-badge orange">🖼️ module_03 — CNN 视觉网络</div>
      <div className="ml-hero">
        <h1>CNN：卷积网络 / ResNet / 迁移学习 / 图像分类</h1>
        <p>卷积神经网络是计算机视觉的基石。<strong>Conv2d</strong> 通过滑动窗口提取局部特征，<strong>残差连接</strong>解决了100层以上深网络的梯度消失，<strong>迁移学习</strong>让你用100张图片达到1000张的效果。</p>
      </div>

      <ConvViz />

      <div className="ml-section">
        <h2 className="ml-section-title">🖼️ CNN 完整代码（自定义ResNet + 迁移学习）</h2>
        <div className="ml-code-wrap">
          <div className="ml-code-head"><div className="ml-code-dot" style={{ background: '#f97316' }}/><div className="ml-code-dot" style={{ background: '#f97316', opacity: 0.5 }}/><div className="ml-code-dot" style={{ background: '#10b981' }}/><span style={{ color: '#fb923c', marginLeft: '0.5rem' }}>🖼️ cnn_resnet.py</span></div>
          <div className="ml-code" style={{ maxHeight: 450, overflowY: 'auto' }}>{CNN_CODE}</div>
        </div>
      </div>

      <div className="ml-section">
        <h2 className="ml-section-title">🏗️ 经典 CNN 架构演进</h2>
        <div className="ml-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ml-table">
            <thead><tr><th>架构</th><th>年份</th><th>深度</th><th>Top-5 准确率</th><th>创新点</th></tr></thead>
            <tbody>
              {[
                ['LeNet-5', '1998', '5层', '—', '首个实用CNN，MNIST手写识别'],
                ['AlexNet',  '2012', '8层', '84.7%', 'ReLU + Dropout + GPU训练，深度学习元年'],
                ['VGG-16',   '2014', '16层', '92.7%', '小卷积核堆叠（3×3）'],
                ['ResNet-50','2015', '50层', '93.3%', '残差连接（跳跃连接）：训练1000层也不退化'],
                ['EfficientNet','2019','～∞','98.7%', '复合缩放（宽度/深度/分辨率）'],
                ['ViT',      '2020', '—', '88.5%', 'Vision Transformer：把图像切块当序列处理'],
              ].map(([name, year, depth, acc, note]) => (
                <tr key={name}>
                  <td style={{ fontWeight: 800, color: '#fb923c', fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}>{name}</td>
                  <td style={{ color: '#6b7280', fontSize: '0.75rem' }}>{year}</td>
                  <td style={{ color: '#6b7280', fontSize: '0.75rem' }}>{depth}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>{acc}</td>
                  <td style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ml-nav">
        <button className="ml-btn" onClick={() => navigate('/course/ml-engineering/lesson/pytorch')}>← 上一模块</button>
        <button className="ml-btn primary" onClick={() => navigate('/course/ml-engineering/lesson/transformer')}>下一模块：Transformer →</button>
      </div>
    </div>
  );
}
