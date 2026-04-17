import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['离散随机变量', '连续随机变量', '期望与方差', '变换与矩母函数'];

export default function LessonRandomVariables() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎲 module_02 — 随机变量</div>
      <div className="fs-hero">
        <h1>随机变量：从事件到数值的桥梁</h1>
        <p>
          随机变量是把「抽象事件」映射为「可计算数值」的函数。
          <strong>它是整个概率论走向定量化的关键一步</strong>——有了随机变量，
          我们才能定义 PMF/PDF/CDF、计算期望和方差、建立统计模型。
          在深度学习中，Loss 函数、梯度、模型参数都可以视为随机变量。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 随机变量与分布</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 离散随机变量与 PMF</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> discrete_rv</div>
                <pre className="fs-code">{`# 离散随机变量: 取有限或可数无限个值

# ═══ 定义 ═══
# 随机变量 X: Ω → ℝ
# 它是一个函数! 把样本空间映射到实数
#
# 例: 掷两颗骰子
#   ω = (3, 5) ∈ Ω
#   X(ω) = 3 + 5 = 8   ← "两颗之和" 就是随机变量

import numpy as np
from collections import Counter

# ═══ PMF (概率质量函数) ═══
# P(X = x) 对每个可能值 x 给出概率
# 性质: Σ P(X=x) = 1, P(X=x) ≥ 0

# 两颗骰子之和的 PMF
Omega = [(i, j) for i in range(1, 7) for j in range(1, 7)]
X_values = [i + j for (i, j) in Omega]
pmf = Counter(X_values)
total = len(Omega)

print("X=和  P(X=x)   直方图")
print("─" * 40)
for x in sorted(pmf.keys()):
    p = pmf[x] / total
    bar = "█" * pmf[x]
    print(f" {x:>2}   {p:.4f}   {bar}")
#  2   0.0278   █
#  3   0.0556   ██
#  4   0.0833   ███
#  5   0.1111   ████
#  6   0.1389   █████
#  7   0.1667   ██████  ← 最可能!
#  8   0.1389   █████
#  9   0.1111   ████
# 10   0.0833   ███
# 11   0.0556   ██
# 12   0.0278   █

# ═══ CDF (累积分布函数) ═══
# F(x) = P(X ≤ x) = Σ_{k≤x} P(X=k)
# 性质: 非递减, F(-∞)=0, F(+∞)=1

cdf = {}
cumulative = 0
for x in sorted(pmf.keys()):
    cumulative += pmf[x] / total
    cdf[x] = cumulative
print(f"\\nCDF 示例: F(7) = P(X≤7) = {cdf[7]:.4f}")  # 0.5833

# ═══ 常见离散分布 ═══
# 
# Bernoulli(p): X ∈ {0, 1}
#   P(X=1) = p, P(X=0) = 1-p
#   → 单次抛硬币 / 二分类预测
#
# Binomial(n, p): X ∈ {0, 1, ..., n}
#   P(X=k) = C(n,k) · p^k · (1-p)^(n-k)
#   → n 次独立伯努利试验的成功次数
#
# Poisson(λ): X ∈ {0, 1, 2, ...}
#   P(X=k) = e^(-λ) · λ^k / k!
#   → 单位时间内稀有事件的发生次数
#   → 网站每秒请求数, 文本中错别字数

from scipy import stats

# Binomial: 100次广告展示, 点击率 3%
binom = stats.binom(n=100, p=0.03)
print(f"P(恰好3次点击) = {binom.pmf(3):.4f}")  # 0.2275
print(f"P(≤5次点击)    = {binom.cdf(5):.4f}")  # 0.9283

# Poisson: 平均每分钟2个请求
poisson = stats.poisson(mu=2)
print(f"P(5个请求) = {poisson.pmf(5):.4f}")     # 0.0361
print(f"P(≥10个)   = {1-poisson.cdf(9):.6f}")   # 很小

# ═══ Categorical 分布 (AI核心) ═══
# X ∈ {1, 2, ..., K},  P(X=k) = pₖ
# → GPT 的 next-token prediction!
# → 分类模型的 softmax 输出!
logits = np.array([2.0, 1.0, 0.5, -1.0, 3.0])
probs = np.exp(logits) / np.sum(np.exp(logits))
print(f"Softmax → Categorical: {probs.round(4)}")
# → 每次 sample 就是从 Categorical 分布采样`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📈 连续随机变量与 PDF</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> continuous_rv</div>
                <pre className="fs-code">{`# 连续随机变量: 取实数区间上的值

# ═══ PDF (概率密度函数) ═══
# f(x) 满足:
#   f(x) ≥ 0
#   ∫f(x)dx = 1
#   P(a ≤ X ≤ b) = ∫[a,b] f(x)dx
#
# 关键: P(X = x) = 0 对任何具体的 x!
# → 概率是面积, 不是高度

import numpy as np
from scipy import stats

# ═══ 均匀分布 U(a, b) ═══
# f(x) = 1/(b-a),  a ≤ x ≤ b
unif = stats.uniform(loc=0, scale=1)  # U(0,1)
print(f"P(0.3 ≤ X ≤ 0.7) = {unif.cdf(0.7) - unif.cdf(0.3):.4f}")
# 0.4000

# ═══ 正态分布 N(μ, σ²) — 最重要的分布 ═══
# f(x) = (1/√(2πσ²)) · exp(-(x-μ)²/(2σ²))
#
# 为什么重要:
# 1. 中心极限定理 → 大量独立变量之和趋近正态
# 2. 最大熵分布 → 给定均值和方差, 正态分布信息量最少
# 3. 贝叶斯共轭 → 高斯先验+高斯似然=高斯后验
# 4. VAE 的隐空间 → z ~ N(0, I)

norm = stats.norm(loc=0, scale=1)  # 标准正态

# 68-95-99.7 法则
for k in [1, 2, 3]:
    p = norm.cdf(k) - norm.cdf(-k)
    print(f"P(-{k}σ ≤ X ≤ {k}σ) = {p:.4f}")
# P(-1σ ≤ X ≤ 1σ) = 0.6827  (68.27%)
# P(-2σ ≤ X ≤ 2σ) = 0.9545  (95.45%)
# P(-3σ ≤ X ≤ 3σ) = 0.9973  (99.73%)

# ═══ 指数分布 Exp(λ) ═══
# f(x) = λ·e^(-λx),  x ≥ 0
# 无记忆性: P(X > s+t | X > s) = P(X > t)
# → 排队论, 事件间隔时间, 放射性衰变

exp_dist = stats.expon(scale=1/2)  # λ=2
print(f"P(X > 1) = {1 - exp_dist.cdf(1):.4f}")  # 0.1353

# ═══ Beta 分布 Beta(α, β) ═══
# 定义在 [0,1] 上 → 完美描述概率值!
# α > β → 偏右; α < β → 偏左; α=β=1 → 均匀
# → 贝叶斯推断中的先验/后验 (见 Module 6)

beta = stats.beta(a=2, b=5)
print(f"Beta(2,5) 均值 = {beta.mean():.4f}")  # 0.2857
print(f"Beta(2,5) 众数 = {(2-1)/(2+5-2):.4f}")  # 0.2000

# ═══ Gamma 分布 ═══
# Gamma(α, β): α=shape, β=rate
# 特例: Gamma(1, β) = Exp(β)
#       Gamma(n/2, 1/2) = χ²(n)  卡方分布
# → 贝叶斯推断中 Precision(1/σ²) 的先验

# ═══ 从 CDF 到分位数 (Quantile) ═══
# 分位数 Q(p) = F⁻¹(p) = inf{x : F(x) ≥ p}
norm = stats.norm(0, 1)
for p in [0.5, 0.9, 0.95, 0.99]:
    print(f"z_{p} = {norm.ppf(p):.4f}")
# z_0.50 = 0.0000  (中位数)
# z_0.90 = 1.2816
# z_0.95 = 1.6449  (单侧 5% 临界值)
# z_0.99 = 2.3263

# ═══ AI 中的连续分布 ═══
# 1. VAE: z ~ N(0, I), 解码器 p(x|z)
# 2. Diffusion: xₜ = √ᾱₜ·x₀ + √(1-ᾱₜ)·ε, ε~N(0,I)
# 3. Dropout: mask ~ Bernoulli(p), 连续近似
# 4. 权重初始化: W ~ N(0, 2/n)  (He Init)
# 5. 梯度噪声: SGD ∇L ≈ N(∇L_true, σ²/B)
#    batch size B 越大, 梯度方差 σ²/B 越小`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 期望、方差与高阶矩</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> expectation_variance</div>
                <pre className="fs-code">{`# 期望与方差: 随机变量的核心数字特征

# ═══ 期望 (Expectation / Mean) ═══
# 离散: E[X] = Σ xᵢ · P(X=xᵢ)
# 连续: E[X] = ∫ x · f(x) dx
#
# 直觉: "加权平均" / "长期平均"

import numpy as np
from scipy import stats

# 例: 掷骰子的期望
die_values = np.arange(1, 7)
die_probs = np.ones(6) / 6
E_die = np.sum(die_values * die_probs)
print(f"E[骰子] = {E_die}")  # 3.5

# MC 验证
rolls = np.random.randint(1, 7, 100000)
print(f"MC 均值 = {np.mean(rolls):.4f}")  # ≈ 3.5

# ═══ 期望的线性性 (最重要的性质!) ═══
# E[aX + bY] = a·E[X] + b·E[Y]
# 无论 X, Y 是否独立! → 这是期望的超能力
#
# 应用: 指示随机变量 (Indicator RV)
# Iₐ = 1 if A occurs, 0 otherwise
# E[Iₐ] = P(A)
#
# 例: 100 封邮件, 每封有 5% 是垃圾邮件
# X = 垃圾邮件数 = I₁ + I₂ + ... + I₁₀₀
# E[X] = E[I₁] + ... + E[I₁₀₀] = 100 × 0.05 = 5

# ═══ 方差 (Variance) ═══
# Var(X) = E[(X - μ)²] = E[X²] - (E[X])²
# 标准差: σ = √Var(X)
#
# 直觉: "离散程度" / "不确定性"

# 两种投资策略
A = np.array([5, 5, 5, 5])  # 稳定收益
B = np.array([-10, 20, -5, 15])  # 波动收益
print(f"E[A]={np.mean(A)}, Var[A]={np.var(A)}")
# E=5.0, Var=0.0
print(f"E[B]={np.mean(B)}, Var[B]={np.var(B)}")
# E=5.0, Var=131.25
# 期望相同, 但 B 的风险(方差)大得多!

# ═══ 方差的运算法则 ═══
# Var(aX + b) = a² · Var(X)
# Var(X + Y) = Var(X) + Var(Y) + 2Cov(X,Y)
# 若独立: Var(X+Y) = Var(X) + Var(Y)
#
# → 为什么 Batch 越大, SGD 梯度估计越稳定:
#   Var(1/B · Σgᵢ) = Var(g) / B
#   B 从 32 增到 1024, 方差减少 32 倍!

# ═══ 偏度 (Skewness) 与 峰度 (Kurtosis) ═══
# 偏度 = E[(X-μ)³/σ³]  → 分布的不对称性
#   > 0: 右偏 (右尾长)
#   = 0: 对称
#   < 0: 左偏 (左尾长)
# 峰度 = E[(X-μ)⁴/σ⁴] - 3  → 尾部厚度
#   > 0: 重尾 (leptokurtic)
#   = 0: 正态
#   < 0: 轻尾 (platykurtic)

data_normal = np.random.normal(0, 1, 100000)
data_skewed = np.random.exponential(1, 100000)
print(f"正态偏度 = {stats.skew(data_normal):.4f}")  # ≈ 0
print(f"指数偏度 = {stats.skew(data_skewed):.4f}")  # ≈ 2.0

# ═══ AI 中的期望与方差 ═══
# 1. Loss = E[ℓ(y, ŷ)] — 期望风险
#    → 我们用样本均值近似期望 (ERM)
#
# 2. Bias-Variance Tradeoff:
#    E[(y - ŷ)²] = Bias² + Variance + Noise
#    → 复杂模型: 低偏差, 高方差
#    → 简单模型: 高偏差, 低方差
#
# 3. Layer Normalization:
#    y = (x - E[x]) / √(Var[x] + ε) · γ + β
#    → 减均值除标准差 = 标准化!
#
# 4. Reward Baseline (RL):
#    ∇J ≈ E[(R - b) · ∇log π]
#    b = E[R] 减少方差, 不引入偏差`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 变换与矩母函数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> transforms_mgf</div>
                <pre className="fs-code">{`# 随机变量的变换与矩母函数

# ═══ 函数变换 Y = g(X) ═══
# 如果 X 有密度 fₓ(x), Y = g(X), g 单调可逆:
# f_Y(y) = fₓ(g⁻¹(y)) · |d/dy g⁻¹(y)|
#
# 关键应用: 标准化
# Z = (X - μ) / σ  → Z ~ N(0, 1)

import numpy as np
from scipy import stats

# 例: X ~ N(5, 4), 求 P(X > 7)
mu, sigma = 5, 2
# 标准化: P(X > 7) = P(Z > (7-5)/2) = P(Z > 1)
p = 1 - stats.norm.cdf(1)
print(f"P(X > 7) = P(Z > 1) = {p:.4f}")  # 0.1587

# ═══ Box-Muller 变换 ═══
# 从均匀分布生成正态分布 (GPU友好!)
# U₁, U₂ ~ U(0,1)
# Z₁ = √(-2ln(U₁)) · cos(2πU₂)
# Z₂ = √(-2ln(U₁)) · sin(2πU₂)
# 则 Z₁, Z₂ ~ N(0,1) 且独立!

N = 100000
U1 = np.random.uniform(0, 1, N)
U2 = np.random.uniform(0, 1, N)
Z1 = np.sqrt(-2 * np.log(U1)) * np.cos(2 * np.pi * U2)
print(f"Box-Muller: mean={Z1.mean():.4f}, std={Z1.std():.4f}")
# mean≈0, std≈1 ✓

# → PyTorch 的 torch.randn() 底层就用了类似方法!

# ═══ 矩母函数 (Moment Generating Function) ═══
# M_X(t) = E[e^(tX)]
# 如果存在, 唯一确定分布 (类似 DNA 指纹)
#
# 性质:
# M_X'(0) = E[X]         (一阶矩 = 均值)
# M_X''(0) = E[X²]       (二阶矩)
# M_X^(n)(0) = E[Xⁿ]     (n阶矩)
# Var(X) = M''(0) - [M'(0)]²
#
# 常见 MGF:
# N(μ,σ²):  M(t) = exp(μt + σ²t²/2)
# Exp(λ):   M(t) = λ/(λ-t),  t < λ
# Poisson(λ): M(t) = exp(λ(eᵗ-1))

# ═══ 特征函数 (Characteristic Function) ═══
# φ_X(t) = E[e^(itX)]  (i = 虚数单位)
# → 总是存在! (MGF 可能不存在)
# → Fourier 变换的概率版本
# → 证明中心极限定理的核心工具

# ═══ 重参数化技巧 (Reparameterization Trick) ═══
# VAE 的核心创新!
# 问题: z ~ N(μ, σ²), 如何对 μ, σ 求梯度?
# 方案: z = μ + σ · ε,  ε ~ N(0, 1)
# → 随机性转移到 ε, z 变成 μ, σ 的确定函数!

mu_param = 2.0   # 可学习参数
sigma_param = 0.5

# 有梯度的采样:
epsilon = np.random.normal(0, 1, 10)  # 标准正态
z = mu_param + sigma_param * epsilon   # 重参数化!
print(f"z samples: {z[:5].round(3)}")
# ∂z/∂μ = 1, ∂z/∂σ = ε → 梯度可以流回去!

# ═══ 对数变换的重要性 ═══
# log-probability 在 ML 中无处不在:
# 1. 数值稳定: log(∏pᵢ) = Σlog(pᵢ) → 避免下溢
# 2. 交叉熵: -Σyᵢlog(pᵢ) → 分类 Loss
# 3. LogSumExp: log(Σeˣⁱ) → softmax 的稳定版本
# 4. ELBO = E_q[log p(x,z) - log q(z)]

# LogSumExp 数值稳定实现
def log_sum_exp(x):
    c = np.max(x)  # 减去最大值防溢出
    return c + np.log(np.sum(np.exp(x - c)))

logits = np.array([1000, 1001, 999])  # 很大的值
print(f"Naive: {np.log(np.sum(np.exp(logits)))}")  # inf!
print(f"Stable: {log_sum_exp(logits):.4f}")  # 正确结果`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
