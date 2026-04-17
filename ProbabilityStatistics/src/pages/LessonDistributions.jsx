import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['高斯分布深解', '离散分布族', '指数族统一框架', '混合分布与EM'];

export default function LessonDistributions() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎲 module_03 — 分布族</div>
      <div className="fs-hero">
        <h1>分布族：概率论的「工具箱」</h1>
        <p>
          掌握常见分布族就像掌握了一套「建模语言」。<strong>高斯分布是万物之母</strong>，
          二项-泊松-指数-Gamma 构成离散/连续的基础骨架，
          而<strong>指数族</strong>则统一了几乎所有常见分布的结构。
          本模块还深入混合分布与 EM 算法——GPT 聚类、GMM、Mixture of Experts 的数学基础。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 分布族全景</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔔 高斯分布：深度解析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> gaussian_deep_dive</div>
                <pre className="fs-code">{`# 高斯分布是 ML 中最核心的分布

# ═══ 一维高斯 N(μ, σ²) ═══
# f(x) = (1/√(2πσ²)) · exp(-(x-μ)²/(2σ²))
#
# 参数:
#   μ = 均值 (中心位置)
#   σ² = 方差 (展开程度)
#   σ = 标准差

import numpy as np
from scipy import stats

# 不同参数的高斯
for mu, sigma in [(0, 1), (0, 2), (2, 0.5)]:
    dist = stats.norm(mu, sigma)
    x = np.linspace(-6, 6, 1000)
    print(f"N({mu},{sigma}²): mode={mu}, median={mu}, "
          f"P(|X-μ|≤σ)={dist.cdf(mu+sigma)-dist.cdf(mu-sigma):.4f}")

# ═══ 多维高斯 N(μ, Σ) ═══
# f(x) = 1/√((2π)^d |Σ|) · exp(-½(x-μ)ᵀΣ⁻¹(x-μ))
#
# μ = d维均值向量
# Σ = d×d 协方差矩阵 (对称正定)
#
# 为什么多维高斯在 ML 中如此重要?
# 1. GDA (高斯判别分析) → 分类
# 2. 卡尔曼滤波 → 状态估计
# 3. GP (高斯过程) → 贝叶斯优化
# 4. VAE → p(z) = N(0, I)
# 5. Diffusion → q(xₜ|xₜ₋₁) = N(√αₜ·xₜ₋₁, (1-αₜ)I)

# 2D 高斯采样
mu = np.array([1, 2])
Sigma = np.array([[2.0, 0.8],
                  [0.8, 1.0]])

# 协方差矩阵分解 → 采样
L = np.linalg.cholesky(Sigma)  # Σ = LLᵀ
z = np.random.normal(0, 1, (1000, 2))
samples = z @ L.T + mu  # 重参数化: x = μ + L·z

print(f"样本均值: {samples.mean(axis=0).round(3)}")
print(f"样本协方差:\\n{np.cov(samples.T).round(3)}")

# ═══ 高斯的优雅性质 ═══
# 1. 边缘分布仍是高斯
#    X = (X₁, X₂) ~ N(μ, Σ) → X₁ ~ N(μ₁, Σ₁₁)
#
# 2. 条件分布仍是高斯
#    X₁|X₂ ~ N(μ₁|₂, Σ₁|₂)
#    → Kalman Filter, GP 预测的理论基础
#
# 3. 线性变换仍是高斯
#    Y = AX + b → Y ~ N(Aμ+b, AΣAᵀ)
#    → 神经网络的线性层: 高斯输入 → 高斯输出
#
# 4. 独立 ←→ 不相关 (仅对高斯成立!)
#    Cov(X₁,X₂)=0 ↔ X₁⊥X₂ (一般只有 ← 方向)

# ═══ 高斯在 Diffusion Model 中的角色 ═══
# 前向过程:
#   q(xₜ|x₀) = N(√ᾱₜ·x₀, (1-ᾱₜ)I)
# → 逐步加高斯噪声, 直到 xT ≈ N(0,I)
#
# 反向过程:
#   pθ(xₜ₋₁|xₜ) = N(μθ(xₜ,t), σ²ₜI)
# → 神经网络预测高斯均值, 逐步去噪!
#
# KL 散度 (两个高斯之间):
# KL(N₁‖N₂) = ½[tr(Σ₂⁻¹Σ₁) + (μ₂-μ₁)ᵀΣ₂⁻¹(μ₂-μ₁)
#              - d + ln(|Σ₂|/|Σ₁|)]

# 计算 KL(N(0.5, 1) ‖ N(0, 1))
kl = 0.5 * (1 + 0.5**2 - 1 - 0)
print(f"KL(N(0.5,1) ‖ N(0,1)) = {kl:.4f}")  # 0.1250`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 离散分布族全景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> discrete_distributions</div>
                <pre className="fs-code">{`# 离散分布族: 计数、分类、稀有事件

import numpy as np
from scipy import stats

# ═══ 分布关系图 ═══
# Bernoulli(p)
#   ↓ n次独立
# Binomial(n,p)
#   ↓ n→∞, p→0, np=λ
# Poisson(λ)
#   ↓ 事件间隔
# Exponential(λ)  [连续]
#   ↓ 等k个事件
# Gamma(k, λ)    [连续]

# ═══ 1. Bernoulli(p) ═══
# X ∈ {0, 1}, P(X=1) = p
# E[X] = p, Var(X) = p(1-p)
# → 二分类, 逻辑回归输出, Dropout mask
p = 0.3
bern = stats.bernoulli(p)
samples = bern.rvs(10000)
print(f"Bernoulli(0.3): mean={samples.mean():.4f}, var={samples.var():.4f}")

# ═══ 2. Binomial(n, p) ═══
# X = n 次 Bernoulli 试验的成功次数
# P(X=k) = C(n,k) · pᵏ · (1-p)ⁿ⁻ᵏ
# E[X] = np, Var(X) = np(1-p)
binom = stats.binom(n=100, p=0.05)
print(f"Binomial(100,0.05): E={binom.mean()}, Var={binom.var():.2f}")
# → A/B 测试中的转化人数分布

# ═══ 3. Poisson(λ) ═══
# X = 单位时间/空间内的事件数
# P(X=k) = e⁻λ · λᵏ / k!
# E[X] = λ, Var(X) = λ  ← 期望=方差!
# → 网站访问量, 错别字数, 缺陷数
poisson = stats.poisson(mu=5)
print(f"Poisson(5): P(X≤3)={poisson.cdf(3):.4f}")

# 特殊性质: Poisson 之和仍是 Poisson
# X~Poisson(λ₁), Y~Poisson(λ₂), 独立
# → X+Y ~ Poisson(λ₁+λ₂)

# ═══ 4. Geometric(p) ═══
# X = 首次成功的试验次数
# P(X=k) = (1-p)ᵏ⁻¹ · p
# E[X] = 1/p, Var(X) = (1-p)/p²
# 唯一无记忆的离散分布!
geo = stats.geom(p=0.1)
print(f"Geometric(0.1): E={geo.mean()}")  # 10

# ═══ 5. Negative Binomial(r, p) ═══
# X = 第 r 次成功时的总试验次数
# Geometric 的推广
# → NLP 中文本长度的建模

# ═══ 6. Multinomial(n, p₁,...,pₖ) ═══
# n 次试验, 每次 k 种结果
# → 多分类的基础分布
# → 文本中词袋模型 (Bag of Words)
from scipy.stats import multinomial
n, p = 10, [0.3, 0.5, 0.2]
rv = multinomial(n, p)
sample = rv.rvs(1)[0]
print(f"Multinomial: {sample}")  # 如 [3, 5, 2]

# ═══ 7. Categorical(p₁,...,pₖ) ═══
# Multinomial(1, p) 的特例
# X ∈ {1,...,K}, P(X=k) = pₖ
# → GPT next-token: softmax → Categorical 采样!
# → 分类器输出: argmax(softmax)

# ═══ AI 核心应用: Temperature 采样 ═══
logits = np.array([2.0, 1.5, 0.8, 0.3, -0.5])
labels = ['A', 'B', 'C', 'D', 'E']

for T in [0.1, 0.5, 1.0, 2.0, 5.0]:
    probs = np.exp(logits / T) / np.sum(np.exp(logits / T))
    entropy = -np.sum(probs * np.log(probs + 1e-10))
    top1 = labels[np.argmax(probs)]
    print(f"T={T}: probs={probs.round(3)}, H={entropy:.3f}")
# T=0.1: [0.993, 0.007, 0, 0, 0]     H=0.047 ← 几乎确定
# T=1.0: [0.391, 0.237, 0.118, 0.072, 0.032] H=1.387
# T=5.0: [0.249, 0.225, 0.199, 0.183, 0.145] H=1.585 ← 接近均匀
#
# T → 0: greedy decoding (确定性)
# T → ∞: uniform sampling (最大随机性)
# T = 1: 原始分布`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧬 指数族：统一的分布框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> exponential_family</div>
                <pre className="fs-code">{`# 指数族: 几乎所有常见分布的统一描述

# ═══ 指数族的一般形式 ═══
# p(x|η) = h(x) · exp(ηᵀT(x) - A(η))
#
# η = 自然参数 (natural parameter)
# T(x) = 充分统计量 (sufficient statistic)
# A(η) = 对数配分函数 (log-partition function)
# h(x) = 基测度 (base measure)
#
# 关键性质:
# ∇A(η) = E[T(X)]        → 期望
# ∇²A(η) = Cov[T(X)]     → 方差/协方差
# → A(η) 的导数给出所有矩! 这就是它的威力

import numpy as np

# ═══ 常见分布的指数族形式 ═══
#
# ┌──────────────┬──────────┬─────────┬──────────┐
# │ 分布          │ η        │ T(x)    │ A(η)     │
# ├──────────────┼──────────┼─────────┼──────────┤
# │ Bernoulli(p) │ log(p/q) │ x       │ log(1+eη)│
# │ Gaussian(μ)  │ μ/σ²     │ x       │ η²σ²/2   │
# │ Poisson(λ)   │ log(λ)   │ x       │ eη       │
# │ Exponential  │ -λ       │ x       │ -log(-η) │
# │ Gamma(α,β)   │ (α-1,-β) │ (lnx,x) │ lnΓ(α)-α│
# │ Categorical  │ log(pₖ)  │ 1{x=k}  │ log(Σeηk)│
# └──────────────┴──────────┴─────────┴──────────┘

# ═══ Bernoulli 的指数族形式 ═══
# P(x|p) = p^x · (1-p)^(1-x)
# = exp(x·log(p/(1-p)) + log(1-p))
#
# η = log(p/(1-p)) = logit(p) ← 逻辑回归的由来!
# T(x) = x
# A(η) = log(1 + e^η) = softplus(η)
# p = sigmoid(η) = 1/(1+e^(-η))

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

for eta in [-3, -1, 0, 1, 3]:
    p = sigmoid(eta)
    A = np.log(1 + np.exp(eta))
    dA = sigmoid(eta)  # = E[X] = p
    print(f"η={eta:>2}: p={p:.4f}, A(η)={A:.4f}, A'(η)={dA:.4f}")

# ═══ 为什么 ML 人必须懂指数族? ═══
#
# 1. GLM (广义线性模型):
#    y|x ~ 指数族, E[y] = g⁻¹(wᵀx)
#    逻辑回归: y ~ Bernoulli, g = logit
#    线性回归: y ~ Normal, g = identity
#    Poisson回归: y ~ Poisson, g = log
#
# 2. 共轭先验必存在:
#    每个指数族都有共轭先验 → 贝叶斯推断可解析!
#
# 3. 最大熵:
#    给定矩约束, 最大熵分布一定是指数族
#    → 指数族 = 在约束下最大化不确定性的分布
#
# 4. Softmax = Categorical 指数族的规范化:
#    P(k) = exp(ηₖ) / Σexp(ηⱼ)
#    → Transformer 的核心! A(η) = LogSumExp(η)

# ═══ 充分统计量 T(x) ═══
# 直觉: T(x) 包含了数据关于参数的全部信息
# 
# 例: N(μ, σ²) 的充分统计量是 (Σxᵢ, Σxᵢ²)
# → 只需要样本和、样本平方和就行了!
# → 原始数据 → 压缩为充分统计量 → 无信息损失
# 
# 在 ML 中:
# Streaming Mean: 不需要存所有数据, 只需 (sum, count)
data = np.random.normal(5, 2, 10000)
T1 = np.sum(data)    # 充分统计量1
T2 = np.sum(data**2) # 充分统计量2
n = len(data)
mu_hat = T1 / n
sigma2_hat = T2/n - mu_hat**2
print(f"从充分统计量重建: μ̂={mu_hat:.3f}, σ̂²={sigma2_hat:.3f}")`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 混合分布与 EM 算法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> mixture_models_em</div>
                <pre className="fs-code">{`# 混合分布: 多个简单分布的加权组合

# ═══ 高斯混合模型 (GMM) ═══
# p(x) = Σ πₖ · N(x | μₖ, Σₖ)
# πₖ = 混合权重, Σπₖ = 1
# 每个 N(μₖ, Σₖ) = 一个 "组件"
#
# 直觉: 数据来自多个"群体", 每个群体服从高斯
# 例: 身高分布 = 男性高斯 + 女性高斯

import numpy as np
from scipy import stats

# 生成 GMM 数据
np.random.seed(42)
n_samples = 1000
# 组件1: N(-2, 0.5²), 权重 0.3
# 组件2: N(1, 1²),    权重 0.5
# 组件3: N(4, 0.7²),  权重 0.2

weights = [0.3, 0.5, 0.2]
means = [-2, 1, 4]
stds = [0.5, 1.0, 0.7]

# 采样
z = np.random.choice(3, n_samples, p=weights)
data = np.array([np.random.normal(means[zi], stds[zi]) for zi in z])
print(f"数据统计: mean={data.mean():.2f}, std={data.std():.2f}")
# 整体不是高斯! → 但是可以用 GMM 拟合

# ═══ EM 算法 (Expectation-Maximization) ═══
# 目标: 找到 θ = (πₖ, μₖ, Σₖ) 最大化 log p(x|θ)
# 问题: 直接 MLE 不可解 (log 里有 sum)
#
# EM 的天才思路: 引入隐变量 z (哪个组件生成了 x)
#
# E-step: 计算后验 P(zₙ=k | xₙ, θ_old)
#   γ(nk) = πₖ · N(xₙ|μₖ,Σₖ) / Σⱼ πⱼ · N(xₙ|μⱼ,Σⱼ)
#   → "每个数据点属于每个组件的概率"
#
# M-step: 用加权统计量更新参数
#   Nₖ = Σₙ γ(nk)           → 有效样本数
#   μₖ = Σₙ γ(nk)·xₙ / Nₖ  → 加权均值
#   Σₖ = 加权协方差
#   πₖ = Nₖ / N              → 混合权重

def em_gmm_1d(data, K=3, max_iter=50):
    N = len(data)
    # 初始化
    mu = np.random.choice(data, K)
    sigma = np.ones(K)
    pi = np.ones(K) / K
    
    for it in range(max_iter):
        # E-step
        gamma = np.zeros((N, K))
        for k in range(K):
            gamma[:, k] = pi[k] * stats.norm.pdf(data, mu[k], sigma[k])
        gamma /= gamma.sum(axis=1, keepdims=True)
        
        # M-step
        Nk = gamma.sum(axis=0)
        for k in range(K):
            mu[k] = np.sum(gamma[:, k] * data) / Nk[k]
            sigma[k] = np.sqrt(np.sum(gamma[:, k] * (data - mu[k])**2) / Nk[k])
            pi[k] = Nk[k] / N
        
        # Log-likelihood
        ll = np.sum(np.log(sum(pi[k] * stats.norm.pdf(data, mu[k], sigma[k])
                              for k in range(K))))
        if it % 10 == 0:
            print(f"Iter {it:>3}: LL={ll:.1f}, μ={np.sort(mu).round(2)}")
    
    return mu, sigma, pi

mu_est, sigma_est, pi_est = em_gmm_1d(data)
# 排序输出
order = np.argsort(mu_est)
print(f"\\n真实: π={weights}, μ={means}, σ={stds}")
print(f"估计: π={[round(pi_est[i],2) for i in order]}, "
      f"μ={[round(mu_est[i],2) for i in order]}, "
      f"σ={[round(sigma_est[i],2) for i in order]}")

# ═══ EM 的理论保证 ═══
# 定理: EM 每次迭代不减少 log-likelihood
# 证明: ELBO ≤ log p(x|θ)
#   E-step: 最大化 ELBO 关于 q(z)
#   M-step: 最大化 ELBO 关于 θ
# → 保证收敛, 但可能到局部最优!

# ═══ AI 中的混合模型 & EM ═══
# 1. Mixture of Experts (MoE):
#    Mixtral/DeepSeek = Router(softmax) + Experts
#    → 就是条件独立的混合模型!
#
# 2. K-Means = Hard EM:
#    E-step: γ(nk) ∈ {0,1}  (硬分配)
#    M-step: μₖ = 类内均值
#
# 3. VAE 的 ELBO:
#    log p(x) ≥ E_q[log p(x|z)] - KL(q(z|x)‖p(z))
#    → 和 EM 的数学结构完全一样!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
