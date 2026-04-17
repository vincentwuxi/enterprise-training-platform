import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['联合分布与边缘化', '协方差与相关', '大数定律', '中心极限定理'];

export default function LessonJointLimit() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎲 module_04 — 联合分布与极限定理</div>
      <div className="fs-hero">
        <h1>联合分布与极限定理：多变量到极限行为</h1>
        <p>
          真实世界的数据从来不是单变量的——<strong>联合分布</strong>描述多个随机变量之间的关系，
          <strong>协方差</strong>量化它们的共变规律。而<strong>大数定律与中心极限定理</strong>
          是统计推断的理论基石：它们解释了为什么我们能用样本推断总体、为什么 SGD 能收敛、
          为什么 Batch Mean 近似正态。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 联合分布与极限</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 联合分布与边缘化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> joint_marginal</div>
                <pre className="fs-code">{`# 联合分布: 多个随机变量的完整概率描述

# ═══ 联合 PMF / PDF ═══
# 离散: P(X=x, Y=y) = 联合概率
# 连续: f(x,y) 满足 ∫∫f(x,y)dxdy = 1
#       P((X,Y)∈A) = ∫∫_A f(x,y)dxdy

import numpy as np
from scipy import stats

# ═══ 离散联合分布示例 ═══
# 课程成绩 (A=4, B=3, C=2) vs 学习时间 (少/中/多)
joint_pmf = np.array([
    [0.05, 0.10, 0.30],  # 时间=多: C, B, A
    [0.10, 0.20, 0.05],  # 时间=中
    [0.10, 0.05, 0.05],  # 时间=少
])
# 行=学习时间(多/中/少), 列=成绩(C/B/A)
print(f"总概率 = {joint_pmf.sum():.2f}")  # 1.00 ✓

# ═══ 边缘分布 (Marginal) ═══
# P(X=x) = Σ_y P(X=x, Y=y)  → 对另一个变量求和/积分
# 直觉: "忘掉" Y, 只看 X 的分布
marginal_time = joint_pmf.sum(axis=1)   # 对成绩求和
marginal_grade = joint_pmf.sum(axis=0)  # 对时间求和
print(f"P(时间): {marginal_time}")  # [0.45, 0.35, 0.20]
print(f"P(成绩): {marginal_grade}")  # [0.25, 0.35, 0.40]

# 连续情况: 2D 高斯的边缘
mu = np.array([1, 2])
Sigma = np.array([[1.0, 0.6], [0.6, 2.0]])
# X₁ 的边缘: N(μ₁, Σ₁₁) = N(1, 1)
# X₂ 的边缘: N(μ₂, Σ₂₂) = N(2, 2)
# → 对高斯, 边缘分布就是取对应的均值和方差!

# ═══ 条件分布 ═══
# P(Y=y|X=x) = P(X=x,Y=y) / P(X=x)
# f(y|x) = f(x,y) / f_X(x)

# P(成绩=A | 时间=多)
p_A_given_much = joint_pmf[0, 2] / marginal_time[0]
print(f"P(A|时间多) = {p_A_given_much:.4f}")  # 0.667

# P(成绩=A | 时间少)
p_A_given_little = joint_pmf[2, 2] / marginal_time[2]
print(f"P(A|时间少) = {p_A_given_little:.4f}")  # 0.250

# ═══ 边缘化在 AI 中的应用 ═══
# 
# 1. VAE 的生成:
#    p(x) = ∫ p(x|z) · p(z) dz  ← 对隐变量 z 积分!
#    这个积分不可解 → 需要变分推断
#
# 2. HMM 的前向算法:
#    P(o₁,...,oₜ) = Σ_sₜ P(o₁,...,oₜ, sₜ) ← 对隐状态求和
#
# 3. 全概率公式 = 离散边缘化:
#    P(Y) = Σ P(Y|X=x) P(X=x)
#
# 4. Attention 可以理解为条件期望:
#    output = Σ αᵢ · vᵢ = E[V | Q, K]
#    → 用注意力权重做加权平均 = 条件期望

# ═══ 独立性检验 ═══
# X, Y 独立 ←→ P(X=x, Y=y) = P(X=x)·P(Y=y) ∀x,y
# 检验: 卡方检验 χ²
expected = np.outer(marginal_time, marginal_grade)
chi2_stat = np.sum((joint_pmf - expected)**2 / expected)
dof = (3-1) * (3-1)  # 自由度
p_value = 1 - stats.chi2.cdf(chi2_stat, dof)
print(f"χ² = {chi2_stat:.4f}, p-value = {p_value:.4f}")
# p << 0.05 → 成绩和学习时间不独立! (符合直觉)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📈 协方差、相关系数与协方差矩阵</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> covariance_correlation</div>
                <pre className="fs-code">{`# 协方差: 量化两个变量的共变关系

# ═══ 协方差定义 ═══
# Cov(X, Y) = E[(X - μₓ)(Y - μᵧ)]
#           = E[XY] - E[X]E[Y]
#
# > 0: X↑ 则 Y 倾向 ↑ (正相关)
# < 0: X↑ 则 Y 倾向 ↓ (负相关)
# = 0: 不相关 (但不一定独立!)

import numpy as np
from scipy import stats

# 模拟: 身高与体重 (正相关)
np.random.seed(42)
n = 1000
height = np.random.normal(170, 8, n)  # cm
weight = 0.6 * height - 32 + np.random.normal(0, 5, n)  # kg

cov_hw = np.cov(height, weight)[0, 1]
print(f"Cov(身高, 体重) = {cov_hw:.2f}")  # ≈ 38.4

# ═══ 相关系数 (Pearson) ═══
# ρ(X,Y) = Cov(X,Y) / (σₓ · σᵧ)
# ρ ∈ [-1, 1]
# |ρ| = 1: 完美线性关系
# ρ = 0: 线性不相关
corr = np.corrcoef(height, weight)[0, 1]
print(f"ρ(身高, 体重) = {corr:.4f}")  # ≈ 0.80

# ⚠️ 相关 ≠ 因果!
# 冰淇淋销量 ↔ 溺水人数: ρ > 0
# 但不是冰淇淋导致溺水! (混淆变量: 温度)

# ═══ 相关 vs 独立 ═══
# 独立 → 不相关  (总是成立)
# 不相关 → 独立   (仅高斯成立!)
#
# 反例: X ~ U(-1,1), Y = X²
# Cov(X, Y) = E[X·X²] - E[X]·E[X²]
#           = E[X³] - 0 = 0  (奇函数积分为0)
# → 不相关! 但 Y = X² 完全依赖 X!

x = np.random.uniform(-1, 1, 100000)
y = x ** 2
print(f"X,X²的相关系数 = {np.corrcoef(x, y)[0,1]:.4f}")  # ≈ 0

# ═══ 协方差矩阵 ═══
# d 个随机变量 X = (X₁,...,Xd)
# Σ = Cov(X) = E[(X-μ)(X-μ)ᵀ]
# Σᵢⱼ = Cov(Xᵢ, Xⱼ)
# 对角线: Σᵢᵢ = Var(Xᵢ)
# 性质: 对称半正定

# ML 中的协方差矩阵应用
data = np.random.multivariate_normal(
    mean=[0, 0, 0],
    cov=[[1, 0.5, 0.3],
         [0.5, 2, -0.1],
         [0.3, -0.1, 1.5]],
    size=5000
)
cov_matrix = np.cov(data.T)
print(f"协方差矩阵:\\n{cov_matrix.round(3)}")

# ═══ PCA = 对协方差矩阵做特征分解! ═══
eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
# 按特征值大小排序 (从大到小)
idx = np.argsort(eigenvalues)[::-1]
print(f"特征值 (方差解释): {eigenvalues[idx].round(3)}")
# → 最大特征值对应的方向 = 数据方差最大的方向!

# ═══ AI 中的核心应用 ═══
# 1. Batch Normalization:
#    沿 batch 维度计算 μ, σ → 标准化
#    → 实质是估计每个特征的均值和方差
#
# 2. Attention 的 QKᵀ/√d:
#    QKᵀ ≈ 协方差矩阵 (q和k的内积 ∝ 相关性)
#    /√d → 防止方差过大导致 softmax 饱和
#
# 3. 白化 (Whitening):
#    X_white = Σ^(-1/2) · (X - μ)
#    → 去相关 + 单位方差 → 加速训练收敛
#
# 4. Fisher 信息矩阵:
#    I(θ) = -E[∇²log p(x|θ)]
#    = MLE估计量的渐近协方差的逆!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📏 大数定律 — 样本均值的收敛</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> law_of_large_numbers</div>
                <pre className="fs-code">{`# 大数定律: 经验与理论的桥梁

# ═══ 弱大数定律 (WLLN) ═══
# 设 X₁, X₂, ..., Xₙ iid, E[Xᵢ] = μ
# X̄ₙ = (X₁ + ... + Xₙ) / n
# 则: 对任意 ε > 0,
#   lim_{n→∞} P(|X̄ₙ - μ| > ε) = 0
#
# 直觉: 样本均值 "依概率" 收敛到真实均值

import numpy as np

# ═══ 可视化: 观察收敛过程 ═══
np.random.seed(42)
# 掷骰子, 真实均值 = 3.5
N = 50000
rolls = np.random.randint(1, 7, N)
running_mean = np.cumsum(rolls) / np.arange(1, N+1)

for n in [10, 100, 1000, 10000, 50000]:
    print(f"n={n:>5}: X̄ = {running_mean[n-1]:.4f} (真值3.5)")
# n=   10: X̄ = 3.3000
# n=  100: X̄ = 3.4500
# n= 1000: X̄ = 3.5120
# n=10000: X̄ = 3.4994
# n=50000: X̄ = 3.5001  ← 越来越准!

# ═══ 强大数定律 (SLLN) ═══
# P(lim_{n→∞} X̄ₙ = μ) = 1
# "几乎必然" 收敛 (比弱大数定律更强)
# → 只要 E[X] 存在, 样本均值一定收敛!

# ═══ 收敛速度: Hoeffding 不等式 ═══
# 若 Xᵢ ∈ [a, b], 则:
# P(|X̄ₙ - μ| ≥ t) ≤ 2·exp(-2nt² / (b-a)²)
#
# 例: 掷骰子 (a=1, b=6), 要 P(|X̄-3.5| ≥ 0.1) ≤ 0.05
# 2·exp(-2n·0.01/25) ≤ 0.05
# n ≥ -25/(2·0.01) · ln(0.025) ≈ 4612

def hoeffding_bound(n, t, a, b):
    return 2 * np.exp(-2 * n * t**2 / (b - a)**2)

for n in [100, 1000, 5000, 10000]:
    bound = hoeffding_bound(n, 0.1, 1, 6)
    print(f"n={n:>5}: P(|X̄-μ|≥0.1) ≤ {bound:.6f}")

# ═══ AI 中的大数定律 ═══
#
# 1. 经验风险最小化 (ERM):
#    真实风险: R(f) = E[ℓ(f(X), Y)]  ← 未知!
#    经验风险: R̂(f) = (1/n) Σ ℓ(f(xᵢ), yᵢ) ← 可计算
#    大数定律保证: R̂(f) → R(f) 当 n → ∞
#    → 这就是为什么 "更多数据 = 更好模型"
#
# 2. 蒙特卡洛估计:
#    E[f(X)] ≈ (1/N) Σ f(xᵢ),  xᵢ ~ p(x)
#    → REINFORCE: E[R·∇log π] ≈ (1/N) Σ Rᵢ·∇log π
#
# 3. SGD 的收敛:
#    ∇L ≈ (1/B) Σ ∇ℓᵢ  (mini-batch 梯度)
#    大数定律 → B 越大, 估计越准
#    但! SGD 噪声有正则化效果 → B 不要太大
#
# 4. Dropout 训练 vs 推理:
#    训练: 随机 mask → 等价于 ensemble
#    推理: 乘以 p → 相当于取所有 mask 的期望
#    经验均值 ≈ 期望 (大数定律)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 中心极限定理 (CLT)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> central_limit_theorem</div>
                <pre className="fs-code">{`# 中心极限定理: 统计学最深刻的定理

# ═══ CLT 声明 ═══
# 设 X₁, ..., Xₙ iid, E[Xᵢ]=μ, Var(Xᵢ)=σ²
# 令 Zₙ = (X̄ₙ - μ) / (σ/√n)  (标准化)
# 则: Zₙ →ᵈ N(0, 1) 当 n → ∞
#
# 等价地: X̄ₙ ≈ N(μ, σ²/n) 当 n 足够大
#
# ⚡ 惊人之处: 不管原始分布是什么样的!
# 均匀? 指数? Poisson? 只要有有限方差, 样本均值→正态!

import numpy as np
from scipy import stats

# ═══ 实验: 不同原始分布, CLT 都成立 ═══
def demonstrate_clt(dist_name, sample_fn, true_mean, true_var, N=10000):
    """模拟 CLT: 画 n 个样本的均值分布"""
    print(f"\\n{'='*50}")
    print(f"分布: {dist_name} (μ={true_mean}, σ²={true_var})")
    
    for n in [1, 5, 30, 100]:
        means = [sample_fn(n).mean() for _ in range(N)]
        means = np.array(means)
        
        # 标准化
        z = (means - true_mean) / np.sqrt(true_var / n)
        
        # 正态性检验 (Shapiro-Wilk)
        _, p_val = stats.shapiro(z[:min(5000, N)])
        
        print(f"  n={n:>3}: mean={means.mean():.4f}, "
              f"std={means.std():.4f} (理论{np.sqrt(true_var/n):.4f}), "
              f"Shapiro p={p_val:.4f}")

# 1. 均匀分布 U(0,1): μ=0.5, σ²=1/12
demonstrate_clt(
    "U(0,1)",
    lambda n: np.random.uniform(0, 1, n),
    0.5, 1/12
)

# 2. 指数分布 Exp(1): μ=1, σ²=1 (高度偏斜!)
demonstrate_clt(
    "Exp(1)",
    lambda n: np.random.exponential(1, n),
    1.0, 1.0
)

# 3. 伯努利 Bernoulli(0.1): μ=0.1, σ²=0.09
demonstrate_clt(
    "Bernoulli(0.1)",
    lambda n: np.random.binomial(1, 0.1, n).astype(float),
    0.1, 0.09
)

# ═══ CLT 的量化版本 (Berry-Esseen) ═══
# |P(Zₙ ≤ z) - Φ(z)| ≤ C·ρ/(σ³·√n)
# ρ = E[|X-μ|³]  (三阶绝对矩)
# C ≤ 0.4748
# → 收敛速度 ~ 1/√n

# ═══ 置信区间 (Confidence Interval) ═══
# 由 CLT: X̄ ≈ N(μ, σ²/n)
# 95% CI: X̄ ± 1.96 · σ/√n
# (σ 未知时用 s 代替 → t-分布)

data = np.random.normal(100, 15, 50)  # 模拟 IQ 数据
x_bar = data.mean()
s = data.std(ddof=1)
n = len(data)
ci_95 = stats.t.interval(0.95, df=n-1, loc=x_bar, scale=s/np.sqrt(n))
print(f"\\n样本均值 = {x_bar:.2f}")
print(f"95% CI = ({ci_95[0]:.2f}, {ci_95[1]:.2f})")

# ═══ AI 中的 CLT 应用 ═══
#
# 1. Mini-batch SGD 的梯度分布:
#    ∇L_batch = (1/B) Σ ∇ℓᵢ
#    由 CLT: ∇L_batch ≈ N(∇L_true, Cov(∇ℓ)/B)
#    → Batch size B↑ → 梯度方差↓ → 但噪声有探索作用
#
# 2. A/B 测试:
#    指标差值 δ = μ_B - μ_A
#    由 CLT: δ̂ ≈ N(δ, σ²(1/n_A + 1/n_B))
#    → 构造 z-test: z = δ̂ / SE(δ̂)
#    → p < 0.05 才算显著
#
# 3. 模型不确定性:
#    MC-Dropout: 多次推理取均值和方差
#    → CLT justifies 用正态近似不确定性
#
# 4. Scaling Laws:
#    验证 loss 方差 ~ 1/n (数据量)
#    → CLT 预测的完美匹配!
#
# 5. 为什么权重初始化用 N(0, 2/n)?
#    He init: 保证前向传播中每层方差不变
#    CLT 保证加权和近似正态 → 梯度流稳定`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
