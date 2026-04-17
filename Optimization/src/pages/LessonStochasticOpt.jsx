import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['SGD 基础', 'Momentum 家族', 'Adam 与自适应', '学习率调度'];

export default function LessonStochasticOpt() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🎯 module_05 — 随机优化</div>
      <div className="fs-hero">
        <h1>随机优化：SGD / Momentum / Adam / Learning Rate</h1>
        <p>
          深度学习的训练本质上就是<strong>随机优化</strong>——
          从最朴素的 SGD 到 Adam/AdamW，理解每个优化器为什么有效，
          何时失效，以及如何调好学习率这个"最重要的超参数"。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 随机优化深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎲 SGD 基础</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> sgd_basics.py</div>
                <pre className="fs-code">{`# ═══ 从 GD 到 SGD ═══
#
# 全批量梯度下降:
# g = (1/N) Σᵢ ∇fᵢ(w)  → 精确梯度, O(N) 每步
#
# 随机梯度下降 (SGD):
# g̃ = (1/B) Σᵢ∈batch ∇fᵢ(w)  → 小批量估计, O(B) 每步!
#
# E[g̃] = g (无偏估计!)
# Var[g̃] = σ²/B (噪声随 B 增大而减小)

import torch

# ═══ 最简 SGD 实现 ═══

def sgd_step(params, grads, lr):
    for p, g in zip(params, grads):
        p.data -= lr * g

# PyTorch 版:
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

for epoch in range(100):
    for batch_x, batch_y in dataloader:
        optimizer.zero_grad()            # 清零梯度
        loss = criterion(model(batch_x), batch_y)
        loss.backward()                  # 反向传播
        optimizer.step()                 # 更新参数

# ═══ 收敛理论 ═══
#
# 凸 + 固定学习率 α:
# E[f(w̄ₜ)] - f(w*) ≤ O(1/√T) + O(ασ²)
#                      ↑ 优化误差   ↑ 统计误差
#
# → 固定 α 不能收敛到最优! 只能到 O(ασ²) 邻域!
# → 需要衰减学习率: αₜ → 0
#
# 衰减条件: Σαₜ = ∞ (走得够远)
#           Σαₜ² < ∞ (噪声消亡)
# 经典: αₜ = α₀/√t

# ═══ 批量大小的影响 ═══
#
# B ↑: 梯度方差 ↓, 每步信息量 ↑
#      但: 每步计算量 ↑, 且边际收益递减!
#
# 线性缩放规则 (Linear Scaling Rule):
# B 翻倍 → lr 也翻倍 (保持 lr/B 不变)
# → 但 B 太大时失效! (> 几千)
#
# 关键权衡:
# 小 B: 高噪声, 但泛化好 (隐式正则化!)
# 大 B: 低噪声, 但泛化可能差
# → SGD 的噪声是特性, 不是缺陷!

# ═══ SGD 的隐式正则化 ═══
#
# SGD 噪声帮助逃离尖锐极小值
# → 倾向于收敛到平坦极小值
# → 平坦极小值泛化更好! (Hochreiter & Schmidhuber)
#
# 这解释了为什么:
# 1. SGD 比 GD 泛化好
# 2. 小 batch 比大 batch 泛化好
# 3. Adam 有时泛化不如 SGD`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 Momentum 家族</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> momentum.py</div>
                <pre className="fs-code">{`# ═══ SGD + Momentum (Polyak, 1964) ═══
#
# 动量: 用历史梯度的指数移动平均代替当前梯度
#
# vₜ = β·vₜ₋₁ + gₜ          (β 通常 0.9)
# wₜ₊₁ = wₜ - α·vₜ
#
# 物理类比: 小球在损失面上滚动
# → 在一致方向上加速!
# → 在振荡方向上平滑!
# → 穿越浅谷的速度大大提高!

import torch

optimizer = torch.optim.SGD(
    model.parameters(), 
    lr=0.01, 
    momentum=0.9        # 动量系数
)

# 手动实现:
def sgd_momentum(params, grads, velocities, lr, beta):
    for p, g, v in zip(params, grads, velocities):
        v.data = beta * v + g           # 更新速度
        p.data -= lr * v                # 更新参数

# ═══ Nesterov Momentum (NAG, 1983) ═══
#
# 先"展望", 再计算梯度:
# v_t = β·vₜ₋₁ + ∇f(wₜ - α·β·vₜ₋₁)  ← 在展望位置求梯度!
# wₜ₊₁ = wₜ - α·vₜ
#
# 凸优化: 收敛率 O(1/T²) vs SGD 的 O(1/T) → 加速!
# 深度学习: 通常训练更稳定

optimizer = torch.optim.SGD(
    model.parameters(), lr=0.01, 
    momentum=0.9, nesterov=True
)

# ═══ 重球法 vs Nesterov ═══
#
# 二次函数: f(x) = ½xᵀAx
# 条件数 κ = λ_max/λ_min
#
# 方法         │ 收敛率            │ 最优 β
# ─────────────┼───────────────────┼──────
# GD           │ (κ-1)/(κ+1)      │ -
# Heavy Ball   │ (√κ-1)/(√κ+1)    │ ((√κ-1)/(√κ+1))²
# Nesterov     │ (√κ-1)/(√κ+1)    │ (√κ-1)/(√κ+1)
#
# κ = 100:
# GD: 0.98 (需 ~500 步)
# Momentum: 0.82 (需 ~30 步) → 16x 加速!

# ═══ 权重衰减 (Weight Decay) ═══
#
# L2 正则化: min L(w) + λ/2 ‖w‖²
#
# SGD + L2:  w = w - α(g + λw)  ← 等价于 weight decay!
# Adam + L2: 不等价! → AdamW 修复!
#
# → SGD 中: weight_decay = L2 正则化
# → Adam 中: 必须用 AdamW (解耦的 weight decay)

optimizer = torch.optim.SGD(
    model.parameters(), lr=0.01,
    momentum=0.9, weight_decay=1e-4
)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧠 Adam 与自适应方法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> adam.py</div>
                <pre className="fs-code">{`# ═══ AdaGrad (2011) ═══
#
# 自适应学习率: 频繁更新的参数 → 小学习率
#                罕见更新的参数 → 大学习率
#
# sₜ = sₜ₋₁ + gₜ²               (累积平方梯度)
# wₜ₊₁ = wₜ - α/√(sₜ+ε) · gₜ   (自适应!)
#
# 问题: sₜ 单调增长 → 学习率 → 0 → 过早停止!

# ═══ RMSProp (Hinton, 2012) ═══
#
# 用指数移动平均修复 AdaGrad:
# sₜ = β·sₜ₋₁ + (1-β)·gₜ²      (β ≈ 0.99)
# wₜ₊₁ = wₜ - α/√(sₜ+ε) · gₜ
#
# → 只看最近的梯度, 不会过早停止!

# ═══ Adam (Kingma & Ba, 2015) ═══
#
# = Momentum + RMSProp + 偏差修正!

def adam(params, grads, m, v, t, lr=1e-3, beta1=0.9, beta2=0.999, eps=1e-8):
    for p, g, mi, vi in zip(params, grads, m, v):
        mi.data = beta1 * mi + (1-beta1) * g       # 一阶矩 (均值)
        vi.data = beta2 * vi + (1-beta2) * g**2     # 二阶矩 (方差)
        
        m_hat = mi / (1 - beta1**t)   # 偏差修正!
        v_hat = vi / (1 - beta2**t)   # 初始时 m,v 偏小!
        
        p.data -= lr * m_hat / (torch.sqrt(v_hat) + eps)

# PyTorch:
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# ═══ AdamW (Loshchilov & Hutter, 2019) ═══
#
# Adam 中 L2 ≠ weight decay! (因为自适应缩放)
# AdamW: 解耦权重衰减
#
# p.data -= lr * (m_hat / (sqrt(v_hat)+eps) + wd * p)
#
# → 现在的标准! GPT/BERT/ViT 都用 AdamW!

optimizer = torch.optim.AdamW(
    model.parameters(), lr=1e-4, weight_decay=0.01
)

# ═══ 优化器选择指南 ═══
#
# 场景              │ 推荐           │ 理由
# ──────────────────┼────────────────┼──────
# CV (CNN/ViT)      │ SGD+Momentum   │ 泛化好!
# NLP (Transformer) │ AdamW          │ 训练稳定
# GAN               │ Adam           │ 两个网络
# 小数据集          │ SGD+Momentum   │ 正则化
# 预训练大模型      │ AdamW          │ 标准
# 微调              │ AdamW/SGD      │ 小学习率
#
# 争论: SGD vs Adam
# SGD: 泛化更好, 但需要精细调参
# Adam: 收敛更快, 默认参数就不错
# → 大模型时代, AdamW 已成实际标准

# ═══ 梯度裁剪 (Gradient Clipping) ═══

torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
# → 防止梯度爆炸! RNN/Transformer 必须!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📈 学习率调度</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> lr_schedule.py</div>
                <pre className="fs-code">{`# ═══ 学习率是最重要的超参数! ═══
#
# 太大: 发散/不稳定
# 太小: 收敛慢/陷入鞍点
# 恰好: 快速收敛到好的最小值

import torch.optim.lr_scheduler as sched

# ═══ 1. Step Decay ═══
scheduler = sched.StepLR(optimizer, step_size=30, gamma=0.1)
# 每 30 epoch, lr × 0.1
# 简单有效! ResNet 原始方案

# ═══ 2. 余弦退火 (Cosine Annealing) ═══
scheduler = sched.CosineAnnealingLR(optimizer, T_max=100)
# lr = lr_min + 0.5(lr_max - lr_min)(1 + cos(πt/T))
# → GPT/ViT/现代大模型的标准方案!

# ═══ 3. 带热重启的余弦退火 ═══
scheduler = sched.CosineAnnealingWarmRestarts(optimizer, T_0=10)
# 每 T_0 epoch 重启 → 探索不同的最小值集合
# → Snapshot Ensemble!

# ═══ 4. Warmup (预热) ═══
#
# 训练初期用很小的学习率, 逐渐增大到目标值
# → 避免初始不稳定! (参数随机初始化时梯度大)
#
# 线性 warmup: lr = lr_base * (step / warmup_steps)
# → Transformer 训练必备!

# GPT 风格: 线性 warmup + 余弦衰减
def lr_lambda(step):
    warmup = 2000
    total = 100000
    if step < warmup:
        return step / warmup                    # 线性增长
    else:
        progress = (step - warmup) / (total - warmup)
        return 0.5 * (1 + math.cos(math.pi * progress))  # 余弦衰减

scheduler = sched.LambdaLR(optimizer, lr_lambda)

# ═══ 5. OneCycleLR (Smith, 2018) ═══
scheduler = sched.OneCycleLR(
    optimizer, max_lr=0.01, total_steps=1000
)
# 先增后减, 极快收敛! 
# "Super-Convergence" — 训练速度提升 10x!

# ═══ 6. ReduceLROnPlateau ═══
scheduler = sched.ReduceLROnPlateau(
    optimizer, mode='min', patience=10, factor=0.1
)
# 验证损失不下降时自动降低学习率
# 需要传入验证指标: scheduler.step(val_loss)

# ═══ 学习率查找器 (LR Finder) ═══
#
# 方法: 从很小的 lr 开始, 指数增长
#       记录每个 lr 对应的 loss
#       最优 lr ≈ 损失开始上升前 10 倍处
#
# → fast.ai 的 lr_find() 实现了这个
# → 或手动实现:

# lrs = np.logspace(-7, 0, 100)
# for lr in lrs:
#     set_lr(optimizer, lr)
#     train_one_batch()
#     record(lr, loss)
# → 画 lr vs loss 曲线, 选拐点!

# ═══ 现代大模型训练配方 ═══
#
# 优化器: AdamW (β₁=0.9, β₂=0.95)
# 学习率: 1e-4 ~ 3e-4
# 预热:   2000 步线性 warmup
# 衰减:   余弦退火到 lr_min = lr/10
# Weight decay: 0.1
# 梯度裁剪: max_norm = 1.0
# → GPT-3 / LLaMA / Gemma 的标准配方!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
