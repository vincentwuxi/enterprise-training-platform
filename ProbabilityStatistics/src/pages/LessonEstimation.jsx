import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['MLE 最大似然', 'MAP 与正则化', '充分统计量', 'Fisher 信息'];

export default function LessonEstimation() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎲 module_05 — 统计推断</div>
      <div className="fs-hero">
        <h1>统计推断：从数据中提取真相</h1>
        <p>
          给定一堆观测数据，如何推断产生这些数据的模型参数？
          <strong>MLE（最大似然估计）</strong>是频率派的回答，
          <strong>MAP（最大后验估计）</strong>是贝叶斯派的桥梁。
          本模块还深入<strong>充分统计量</strong>的信息压缩思想和
          <strong>Fisher 信息</strong>的精度极限——它们直接关联到
          深度学习的 Loss 函数设计、正则化策略和自然梯度下降。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 参数估计</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 MLE — 最大似然估计</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> maximum_likelihood</div>
                <pre className="fs-code">{`# MLE: 找最能解释观测数据的参数

# ═══ MLE 定义 ═══
# 似然函数: L(θ) = p(D|θ) = ∏ p(xᵢ|θ)
# 对数似然: ℓ(θ) = Σ log p(xᵢ|θ)  ← 数值稳定
# MLE: θ̂_MLE = argmax_θ ℓ(θ)
#
# 核心思想: "如果参数是 θ, 观测到当前数据的概率最大"

import numpy as np
from scipy import stats, optimize

# ═══ 例1: 抛硬币 — Bernoulli MLE ═══
# 10 次抛掷: HHTTHHTHHH (7次H, 3次T)
data = np.array([1,1,0,0,1,1,0,1,1,1])  # 1=H, 0=T

# ℓ(p) = Σ[xᵢ·log(p) + (1-xᵢ)·log(1-p)]
# ∂ℓ/∂p = Σxᵢ/p - Σ(1-xᵢ)/(1-p) = 0
# → p̂ = Σxᵢ/n = 7/10 = 0.7
p_hat = data.mean()
print(f"Bernoulli MLE: p̂ = {p_hat}")  # 0.7

# ═══ 例2: 正态分布 MLE ═══
# 数据 ~ N(μ, σ²)
# ℓ(μ,σ²) = -n/2·log(2π) - n/2·log(σ²) - Σ(xᵢ-μ)²/(2σ²)
# → μ̂ = X̄ (样本均值)
# → σ̂² = Σ(xᵢ-X̄)²/n (样本方差, 注意除n不是n-1!)

np.random.seed(42)
data = np.random.normal(5, 2, 100)
mu_hat = data.mean()
sigma2_hat = np.mean((data - mu_hat)**2)  # MLE 除以 n
sigma2_unbiased = np.var(data, ddof=1)    # 无偏除以 n-1
print(f"μ̂ = {mu_hat:.4f} (真值 5)")
print(f"σ̂²_MLE = {sigma2_hat:.4f} (有偏)")
print(f"σ̂²_unb = {sigma2_unbiased:.4f} (无偏, 真值 4)")

# ═══ 例3: 数值优化 MLE ═══
# 对于复杂模型, 无法解析求解 → 用梯度下降!
# 这就是深度学习的本质: loss = -log likelihood

# Poisson MLE (数值解法)
poisson_data = np.random.poisson(lam=3.7, size=200)
neg_ll = lambda lam: -np.sum(stats.poisson.logpmf(poisson_data, lam))
result = optimize.minimize_scalar(neg_ll, bounds=(0.1, 20), method='bounded')
print(f"Poisson MLE: λ̂ = {result.x:.4f} (真值 3.7)")

# ═══ MLE 的性质 ═══
# 1. 一致性: θ̂ₙ →ᵖ θ₀ (样本足够大时收敛到真值)
# 2. 渐近正态: √n(θ̂-θ₀) →ᵈ N(0, I(θ₀)⁻¹)
# 3. 渐近有效: 达到 Cramér-Rao 下界
# 4. 不变性: g(θ̂) 是 g(θ) 的 MLE
# ⚠️ 有偏: E[θ̂] ≠ θ (但偏差 ~ 1/n)

# ═══ 深度学习 = MLE ═══
# 交叉熵 Loss = -Σ yᵢ·log(ŷᵢ)
#             = -log p(y|x, θ)  (Categorical 似然)
# MSE Loss = Σ(yᵢ - ŷᵢ)²
#          = -log p(y|x, θ) + const  (高斯似然)
# → SGD 最小化 Loss = 最大化对数似然!

# Cross-Entropy 就是 Categorical MLE
y_true = np.array([0, 1, 0, 0, 0])  # one-hot
y_pred = np.array([0.05, 0.85, 0.05, 0.03, 0.02])
cross_entropy = -np.sum(y_true * np.log(y_pred + 1e-10))
print(f"Cross-Entropy = -log(0.85) = {cross_entropy:.4f}")

# → 整个深度学习的训练过程
# → 就是在做 MLE (或 MAP)!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ MAP 估计与正则化的统一</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> map_regularization</div>
                <pre className="fs-code">{`# MAP: 在 MLE 上加先验 → 正则化

# ═══ MAP 定义 ═══
# θ̂_MAP = argmax_θ P(θ|D)   ← 最大后验
#       = argmax_θ [P(D|θ)·P(θ)]  ← 似然×先验
#       = argmax_θ [log P(D|θ) + log P(θ)]
#                   ↑ MLE 部分    ↑ 正则化!

import numpy as np
from scipy import stats

# ═══ MLE vs MAP: 硬币问题 ═══
# 抛 3 次, 全正面. MLE: p̂ = 1.0 (过度自信!)
# 用 Beta(2,2) 先验 (认为大概公平)
# MAP: p̂ = (3+2-1) / (3+2+2-2) = 4/5 = 0.8

n_heads, n_tails = 3, 0
alpha, beta = 2, 2  # Beta 先验参数

p_mle = n_heads / (n_heads + n_tails)
p_map = (n_heads + alpha - 1) / (n_heads + n_tails + alpha + beta - 2)
print(f"MLE: p̂ = {p_mle:.4f}")  # 1.0 (过拟合!)
print(f"MAP: p̂ = {p_map:.4f}")  # 0.8 (更合理)

# ═══ 核心关系: 先验 ←→ 正则化 ═══
#
# ┌──────────────┬────────────────┬──────────────┐
# │ 先验          │ 正则化          │ 效果          │
# ├──────────────┼────────────────┼──────────────┤
# │ N(0, σ²)     │ L2 (Ridge)     │ 权重衰减      │
# │              │ λ‖w‖²          │ 偏向小权重    │
# ├──────────────┼────────────────┼──────────────┤
# │ Laplace(0,b) │ L1 (LASSO)     │ 稀疏化        │
# │              │ λ‖w‖₁          │ 部分权重→0   │
# ├──────────────┼────────────────┼──────────────┤
# │ Spike-Slab   │ L0 (Best Sub)  │ 特征选择      │
# │              │ λ‖w‖₀          │ NP-hard      │
# └──────────────┴────────────────┴──────────────┘

# ═══ 推导: L2 正则 = 高斯先验 ═══
# 先验: w ~ N(0, τ²I)  → log P(w) = -‖w‖²/(2τ²) + const
# 似然: y|x,w ~ N(wᵀx, σ²) → log P(D|w) = -Σ(yᵢ-wᵀxᵢ)²/(2σ²)
#
# MAP: argmax_w [log P(D|w) + log P(w)]
# = argmin_w [Σ(yᵢ-wᵀxᵢ)² + (σ²/τ²)·‖w‖²]
# = argmin_w [MSE + λ·‖w‖²]   ← Ridge Regression!
# 其中 λ = σ²/τ²

# 实际演示
from sklearn.linear_model import Ridge, Lasso

np.random.seed(42)
n, d = 50, 20
X = np.random.randn(n, d)
w_true = np.zeros(d)
w_true[:5] = [3, -2, 1.5, -1, 0.5]
y = X @ w_true + np.random.randn(n) * 0.5

for alpha_val in [0, 0.1, 1.0, 10.0]:
    if alpha_val == 0:
        w_hat = np.linalg.lstsq(X, y, rcond=None)[0]
        label = "MLE (OLS)"
    else:
        w_hat = Ridge(alpha=alpha_val).fit(X, y).coef_
        label = f"MAP (λ={alpha_val})"
    err = np.linalg.norm(w_hat - w_true)
    sparsity = np.sum(np.abs(w_hat) < 0.1)
    print(f"{label:>15}: ‖w-w*‖={err:.3f}, ~0={sparsity}")

# ═══ AI 中的 MAP 思想 ═══
# 1. Weight Decay = L2 MAP:
#    optimizer: SGD(params, lr, weight_decay=1e-4)
#    → 每步: w = w - lr·∇L - lr·wd·w
#
# 2. Dropout ≈ 变分贝叶斯:
#    随机关闭神经元 → 近似后验采样
#
# 3. Label Smoothing:
#    soft_label = (1-ε)·one_hot + ε/K
#    → 等价于对 Categorical 加先验
#
# 4. Early Stopping ≈ L2 正则化:
#    训练步数有限 ≈ 限制参数空间 → 隐式先验!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 充分统计量 — 无损数据压缩</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> sufficient_statistics</div>
                <pre className="fs-code">{`# 充分统计量: 把数据压缩到最精华

# ═══ 定义 ═══
# T(X) 是 θ 的充分统计量 ←→
# P(X|T(X), θ) = P(X|T(X))
# → 给定 T(X), X 不再包含关于 θ 的额外信息
# → T(X) "榨干" 了数据中所有关于参数的信息

import numpy as np

# ═══ 直觉例子 ═══
# N(μ, σ²=1) 的 i.i.d. 样本 X₁,...,Xₙ
# 充分统计量: T = Σxᵢ  (或等价地 X̄ = T/n)
# 意味着: 不管 n=100 还是 n=10⁶
# 只需保存一个数字 X̄ 就行了!

np.random.seed(42)
data = np.random.normal(5.0, 1.0, 10000)
T_sum = np.sum(data)
x_bar = np.mean(data)
print(f"n=10000 个数据 → 一个充分统计量 X̄ = {x_bar:.4f}")
# 原始数据 40KB → 充分统计量 8 bytes → 信息零损失!

# ═══ Fisher-Neyman 因子分解定理 ═══
# T(X) 是 θ 的充分统计量 ←→
# p(x|θ) = g(T(x), θ) · h(x)
#           ↑ 依赖 θ    ↑ 不依赖 θ
# → 似然函数通过 T(x) 依赖 θ

# 验证: 正态分布
# p(x₁,...,xₙ|μ) = ∏ (1/√2π)exp(-½(xᵢ-μ)²)
# = (2π)^(-n/2) · exp(-½Σxᵢ² + μΣxᵢ - nμ²/2)
# = exp(μ·T - nμ²/2) · (2π)^(-n/2)·exp(-½Σxᵢ²)
#   ↑ g(T, μ)           ↑ h(x)
# 其中 T = Σxᵢ → 充分统计量!

# ═══ 最小充分统计量 ═══
# "最大程度压缩" 且不损失信息的统计量
#
# 常见分布的最小充分统计量:
# ┌──────────────┬─────────────────────────┐
# │ 分布          │ 最小充分统计量           │
# ├──────────────┼─────────────────────────┤
# │ N(μ, σ²已知) │ Σxᵢ                     │
# │ N(μ, σ²未知) │ (Σxᵢ, Σxᵢ²)            │
# │ Bern(p)      │ Σxᵢ (= 成功次数)        │
# │ Poisson(λ)   │ Σxᵢ                     │
# │ Uniform(0,θ) │ max(xᵢ)                 │
# │ N(0, σ²)     │ Σxᵢ²                    │
# └──────────────┴─────────────────────────┘

# ═══ 为什么指数族这么特别? ═══
# p(x|η) = h(x)·exp(ηᵀT(x) - A(η))
# → T(x) 天然就是充分统计量! (从因子分解定理直接看出)
# → 指数族的 MLE 可以写成:
#   ∇A(η̂) = (1/n) Σ T(xᵢ)
# 只需要 T(x) 的样本均值!

# ═══ AI 中的充分统计量思想 ═══
#
# 1. Streaming 计算:
#    在线均值: 只需保存 (sum, count)
#    在线方差: 保存 (sum, sum_of_squares, count)
#    → Welford 算法: 数值稳定的在线方差

def welford_update(count, mean, M2, new_value):
    """在线计算均值和方差 (单次更新)"""
    count += 1
    delta = new_value - mean
    mean += delta / count
    delta2 = new_value - mean
    M2 += delta * delta2
    return count, mean, M2

count, mean, M2 = 0, 0.0, 0.0
for x in data[:1000]:
    count, mean, M2 = welford_update(count, mean, M2, x)
variance = M2 / count
print(f"Welford: μ̂={mean:.4f}, σ̂²={variance:.4f}")

# 2. 信息瓶颈 (Information Bottleneck):
#    DNN 的中间表示 = 学习充分统计量!
#    输入 X → 表示 T → 预测 Y
#    T 应该: 保留关于 Y 的信息, 丢弃关于 X 的噪声
#    → 这就是 Tishby 的信息瓶颈理论
#
# 3. 数据增强:
#    增强后的数据 → 统计量不变 → 不影响估计
#    旋转图片: label 不变 → 保留充分统计量`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 Fisher 信息 — 精度的理论极限</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> fisher_information</div>
                <pre className="fs-code">{`# Fisher 信息: 数据中关于参数的信息量

# ═══ Fisher 信息定义 ═══
# I(θ) = E[(∂/∂θ log p(X|θ))²]
#       = -E[∂²/∂θ² log p(X|θ)]
#       = Var[Score Function]
#
# Score Function: S(θ) = ∂/∂θ log p(X|θ)
# → I(θ) 度量 Score 的分散程度
# → 高 Fisher 信息 = 数据对参数很敏感 = 估计精确

import numpy as np
from scipy import stats

# ═══ 例: Bernoulli(p) 的 Fisher 信息 ═══
# log p(x|p) = x·log(p) + (1-x)·log(1-p)
# Score = x/p - (1-x)/(1-p)
# I(p) = E[(x/p - (1-x)/(1-p))²]
#       = 1/(p(1-p))
# → p=0.5 时 I=4 (最小, 因为最不确定)
# → p→0 或 p→1 时 I→∞ (参数趋极端, 更"容易"估计)

for p in [0.1, 0.3, 0.5, 0.8, 0.99]:
    fisher = 1 / (p * (1 - p))
    print(f"p={p:.2f}: I(p) = {fisher:.2f}")

# ═══ Cramér-Rao 下界 (CRLB) ═══
# 对任何无偏估计量 θ̂:
# Var(θ̂) ≥ 1 / (n · I(θ))
#
# → 不管用什么估计方法, 方差都不可能比这更小!
# → MLE 渐近达到 CRLB → "渐近有效"

# 例: 估计 Bernoulli 的 p, 需要多少样本?
# 要求: Var(p̂) ≤ 0.01
# CRLB: p(1-p)/n ≤ 0.01
# p=0.5 (最坏情况): n ≥ 25
# 但 95% CI 宽度 = 2·1.96·√(p(1-p)/n)
# 要 CI 宽度 ≤ 0.1: n ≥ 384
p = 0.5
desired_ci_width = 0.1
n_needed = int(np.ceil((2 * 1.96)**2 * p * (1-p) / desired_ci_width**2))
print(f"\\n95% CI 宽度 ≤ 0.1 需要 n ≥ {n_needed}")

# ═══ Fisher 信息矩阵 (多参数) ═══
# [I(θ)]ᵢⱼ = -E[∂²/∂θᵢ∂θⱼ log p(X|θ)]
# → Hessian 矩阵的负期望!
# → 描述参数空间的"几何曲率"

# N(μ, σ²) 的 Fisher 信息矩阵:
# I(μ,σ²) = [[1/σ², 0], [0, 1/(2σ⁴)]]
# → μ 和 σ² 的估计是"正交的" (对角阵)
sigma2 = 4.0
FIM = np.array([[1/sigma2, 0],
                [0, 1/(2*sigma2**2)]])
print(f"Fisher 信息矩阵:\\n{FIM}")

# ═══ 自然梯度下降 (Natural Gradient) ═══
# 普通梯度: θ ← θ - η·∇L
# 自然梯度: θ ← θ - η·I(θ)⁻¹·∇L
#
# 为什么? 参数空间不是欧几里得空间!
# 例: N(μ, σ²)
#   μ 变化 0.1 vs σ 变化 0.1 → 效果完全不同
#   Fisher 信息矩阵提供了正确的"度量"
#
# AI 中的应用:
# 1. Adam ≈ 对角自然梯度:
#    v_t ≈ diag(I(θ)) 的近似
#    θ ← θ - η·m_t/√v_t ≈ 自然梯度!
#
# 2. K-FAC (Kronecker-Factored):
#    近似 Fisher → 二阶优化 → 训练更快
#
# 3. PPO 的 KL 约束:
#    KL(π_old ‖ π_new) ≈ ½Δθᵀ·I(θ)·Δθ
#    → KL = Fisher 信息定义的"距离"
#
# 4. TRPO:
#    max ∇θ·Δθ s.t. ½ΔθᵀIΔθ ≤ δ
#    → 在 Fisher 度量下的信赖域优化`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
