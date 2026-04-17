import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['感知机→MLP', '反向传播', '优化器', '正则化'];

export default function LessonNeuralNetworks() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🧬 module_01 — 神经网络基础</div>
      <div className="fs-hero">
        <h1>神经网络基础：从感知机到深度网络的数学本质</h1>
        <p>
          深度学习的一切始于<strong>一个简单的感知机</strong>。
          本模块从生物神经元出发，推导前向传播、反向传播的完整数学链路，
          深入理解梯度下降的变体（SGD/Adam/AdamW），掌握正则化、
          Batch Normalization、Dropout 等核心训练技巧。
          <strong>每一行 PyTorch 代码都对应一个数学公式</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧠 神经网络基础</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 从感知机到多层感知机 (MLP)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> perceptron_to_mlp</div>
                <pre className="fs-code">{`# 从感知机到深度网络的演进

# ═══ 1. 感知机 (Perceptron, 1957) ═══
# Frank Rosenblatt 提出
# y = sign(w·x + b)
# 局限: 只能学习线性可分问题 (XOR 问题)

import torch
import torch.nn as nn

# 单个神经元 = 线性变换 + 激活函数
class Neuron:
    def __init__(self, n_inputs):
        self.weights = torch.randn(n_inputs) * 0.01
        self.bias = torch.zeros(1)
    
    def forward(self, x):
        # z = w·x + b  (线性变换)
        z = torch.dot(self.weights, x) + self.bias
        # a = σ(z)     (非线性激活)
        return torch.sigmoid(z)

# ═══ 2. 多层感知机 (MLP) ═══
# 关键突破: 隐藏层 + 非线性激活 → 万能近似器
class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),   # 第一层
            nn.ReLU(),                           # 非线性激活
            nn.Linear(hidden_dim, hidden_dim),   # 第二层
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim),   # 输出层
        )
    
    def forward(self, x):
        return self.layers(x)

# ═══ 3. 常用激活函数 ═══
activations = {
    "Sigmoid":  "σ(z) = 1/(1+e^-z)     | 范围(0,1)  | 梯度消失",
    "Tanh":     "tanh(z) = (eᶻ-e⁻ᶻ)/(eᶻ+e⁻ᶻ) | (-1,1) | 零中心",
    "ReLU":     "f(z) = max(0, z)       | [0,∞)   | 稀疏激活",
    "LeakyReLU":"f(z) = max(αz, z)      | (-∞,∞)  | 解决死亡ReLU",
    "GELU":     "z·Φ(z)                 | GPT/BERT标配",
    "SiLU/Swish":"z·σ(z)               | EfficientNet 首选",
}

# ═══ 4. 万能近似定理 ═══
# Universal Approximation Theorem (Cybenko, 1989)
# 一个具有足够宽隐藏层的 MLP可以近似任意连续函数
# 但定理不告诉你:
# - 需要多少神经元 (可能指数级)
# - 如何训练 (优化是 NP-hard)
# - 能否泛化 (过拟合风险)
# → 这就是"深度"网络的价值: 用深度换宽度

# ═══ 前向传播完整链路 ═══
# Input x → [W₁x + b₁] → ReLU → [W₂h + b₂] → ReLU → [W₃h + b₃] → Output
#         Layer 1           Layer 2           Layer 3
#
# 每一层做两件事:
# 1. 线性变换: z = Wx + b   (旋转 + 平移)
# 2. 非线性激活: a = σ(z)   (弯曲决策边界)
#
# 深度网络 = 多次 "旋转→弯曲→旋转→弯曲"
# → 可以学习任意复杂的决策边界`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⛓️ 反向传播算法 (Backpropagation)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> backpropagation</div>
                <pre className="fs-code">{`# 反向传播: 深度学习的数学核心

# ═══ 核心思想: 链式法则 (Chain Rule) ═══
# 
# 目标: 计算 ∂L/∂w (损失对每个权重的梯度)
# 方法: 从输出层向输入层逐层传播梯度
#
# 前向: x → z₁ → a₁ → z₂ → a₂ → L
# 反向: x ← ∂L/∂z₁ ← ∂L/∂a₁ ← ∂L/∂z₂ ← ∂L/∂a₂ ← ∂L/∂L

# ═══ 数学推导 (两层网络) ═══
# 前向传播:
#   z₁ = W₁x + b₁       (线性)
#   a₁ = σ(z₁)           (激活)
#   z₂ = W₂a₁ + b₂      (线性)
#   ŷ  = softmax(z₂)     (输出)
#   L  = -Σ yᵢ log(ŷᵢ)   (交叉熵损失)
#
# 反向传播 (链式法则):
#   ∂L/∂W₂ = ∂L/∂z₂ · ∂z₂/∂W₂ = (ŷ - y) · a₁ᵀ
#   ∂L/∂b₂ = ŷ - y
#   ∂L/∂a₁ = W₂ᵀ · (ŷ - y)
#   ∂L/∂W₁ = (∂L/∂a₁ ⊙ σ'(z₁)) · xᵀ

# ═══ PyTorch 自动微分 ═══
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10),
)

x = torch.randn(32, 784)  # batch of 32
y = torch.randint(0, 10, (32,))

# 前向传播
logits = model(x)
loss = nn.CrossEntropyLoss()(logits, y)

# 反向传播 (一行搞定!)
loss.backward()  # 自动计算所有梯度

# 查看梯度
for name, param in model.named_parameters():
    print(f"{name}: grad shape = {param.grad.shape}")
    print(f"  grad mean = {param.grad.mean():.6f}")
    print(f"  grad std  = {param.grad.std():.6f}")

# ═══ 计算图 (Computational Graph) ═══
# PyTorch 在前向传播时构建计算图:
#   每个操作都记录:
#   - 输入张量
#   - 运算类型 (加/乘/激活)
#   - 输出张量
#
#   .backward() 沿图反向遍历, 用链式法则逐步计算梯度
#   → 这就是 "自动微分" (Autograd)

# ═══ 梯度消失 & 梯度爆炸 ═══
# 问题: 深层网络中, 梯度逐层相乘
#   ∂L/∂W₁ = ∂L/∂aₙ · ∂aₙ/∂aₙ₋₁ · ... · ∂a₂/∂a₁ · ∂a₁/∂W₁
#
# 如果每层梯度 < 1 → 梯度消失 (Sigmoid 的问题)
# 如果每层梯度 > 1 → 梯度爆炸 (RNN 的问题)
#
# 解决方案:
solutions = {
    "ReLU 激活":     "梯度要么 0 要么 1, 不会衰减",
    "残差连接":      "ResNet: y = F(x) + x, 梯度直接流过",
    "BatchNorm":     "归一化中间层, 稳定梯度分布",
    "梯度裁剪":      "torch.nn.utils.clip_grad_norm_()",
    "合理初始化":    "Xavier / Kaiming / He initialization",
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 优化器全景 (Optimizers)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> optimizers</div>
                <pre className="fs-code">{`# 优化器: 如何高效更新参数

# ═══ 1. SGD (随机梯度下降) ═══
# w = w - lr * ∂L/∂w
# 问题: 噪声大 / 鞍点 / 学习率难调
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# ═══ 2. SGD + Momentum ═══
# v = β·v + ∂L/∂w          (动量累积)
# w = w - lr·v
# 类比: 小球滚下山坡, 有惯性
optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)

# ═══ 3. Adam (Adaptive Moment Estimation) ═══
# 最常用的优化器, 结合 Momentum + RMSprop
# m = β₁·m + (1-β₁)·g           (一阶矩: 梯度均值)
# v = β₂·v + (1-β₂)·g²          (二阶矩: 梯度方差)
# m̂ = m / (1-β₁ᵗ)               (偏差校正)
# v̂ = v / (1-β₂ᵗ)
# w = w - lr · m̂ / (√v̂ + ε)     (自适应学习率)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# ═══ 4. AdamW (Weight Decay 解耦) ═══
# Adam 的 L2 正则化有 bug → AdamW 修复
# w = w - lr · m̂/(√v̂+ε) - lr·λ·w
# LLM 训练的标准选择
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=1e-4,          # 初始学习率
    betas=(0.9, 0.95),# 动量参数
    weight_decay=0.1,  # 权重衰减
    eps=1e-8,
)

# ═══ 学习率调度 (LR Schedule) ═══
# Warmup + Cosine Decay (LLM 标准)
from torch.optim.lr_scheduler import CosineAnnealingLR

scheduler = CosineAnnealingLR(optimizer, T_max=100, eta_min=1e-6)

# 训练循环
for epoch in range(100):
    for batch in dataloader:
        loss = compute_loss(model, batch)
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
    scheduler.step()

# ═══ 优化器选型指南 ═══
# ┌──────────┬──────────────┬──────────────────┐
# │ 优化器    │ 适用场景      │ 典型超参          │
# ├──────────┼──────────────┼──────────────────┤
# │ SGD+M    │ CV (ResNet)   │ lr=0.1, m=0.9    │
# │ Adam     │ NLP 一般任务  │ lr=1e-3          │
# │ AdamW    │ LLM/ViT 训练 │ lr=1e-4, wd=0.1  │
# │ LAMB     │ 大 batch 训练 │ lr=1e-3          │
# │ Adafactor│ 内存受限      │ 无需存 moment    │
# └──────────┴──────────────┴──────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ 正则化与训练技巧</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> regularization</div>
                <pre className="fs-code">{`# 正则化: 防止过拟合的核心武器库

# ═══ 1. L2 正则化 (Weight Decay) ═══
# Loss = L_data + λ·||w||²
# 效果: 惩罚大权重, 让模型更"平滑"
# 在 AdamW 中: weight_decay=0.01

# ═══ 2. Dropout ═══
# 训练时随机"杀死" p% 的神经元
# → 强迫网络学习冗余表示, 类似集成学习
model = nn.Sequential(
    nn.Linear(784, 512),
    nn.ReLU(),
    nn.Dropout(p=0.5),       # 50% 神经元被关闭
    nn.Linear(512, 10),
)
# 测试时: 所有神经元激活, 权重乘以 (1-p) → model.eval()

# ═══ 3. Batch Normalization ═══
# 归一化每层输入: x̂ = (x - μ_B) / √(σ²_B + ε)
# 然后学习缩放和偏移: y = γ·x̂ + β
model = nn.Sequential(
    nn.Linear(784, 512),
    nn.BatchNorm1d(512),     # 归一化
    nn.ReLU(),
    nn.Linear(512, 10),
)
# 好处: 加速收敛 / 允许更大学习率 / 轻微正则化

# ═══ 4. Layer Normalization ═══
# 对单个样本的所有特征归一化 (不依赖 batch)
# Transformer 的标配
layer_norm = nn.LayerNorm(512)

# ═══ 5. 数据增强 (Data Augmentation) ═══
from torchvision import transforms
augmentation = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomCrop(32, padding=4),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.RandomRotation(15),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,)),
])

# ═══ 6. 权重初始化 ═══
# Xavier: 适合 Sigmoid/Tanh
nn.init.xavier_uniform_(layer.weight)
# Kaiming/He: 适合 ReLU
nn.init.kaiming_normal_(layer.weight, mode='fan_out')

# ═══ 7. Early Stopping ═══
# 验证集 loss 连续 N 个 epoch 不下降 → 停止训练
best_val_loss = float('inf')
patience = 10
counter = 0
for epoch in range(1000):
    val_loss = evaluate(model, val_loader)
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        counter = 0
        torch.save(model.state_dict(), 'best.pt')
    else:
        counter += 1
        if counter >= patience:
            print("Early stopping!")
            break

# ═══ 过拟合诊断 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │ 现象          │ 诊断          │ 处方          │
# ├──────────────┼──────────────┼──────────────┤
# │ 训练↓ 验证↑   │ 过拟合        │ 更多数据/正则 │
# │ 训练↑ 验证↑   │ 欠拟合        │ 加大模型/学率 │
# │ 训练↓ 验证↓   │ 正常训练      │ 继续训练      │
# │ 训练震荡      │ 学习率过大    │ 降低学习率    │
# └──────────────┴──────────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
