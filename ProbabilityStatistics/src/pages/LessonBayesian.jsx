import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['贝叶斯范式', '共轭先验', 'MCMC 采样', '变分推断'];

export default function LessonBayesian() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎲 module_06 — 贝叶斯推断</div>
      <div className="fs-hero">
        <h1>贝叶斯推断：不确定性的优雅语言</h1>
        <p>
          频率派给你一个点估计 θ̂，贝叶斯派给你一个<strong>完整的后验分布 P(θ|D)</strong>。
          后验分布不仅告诉你最可能的参数值，还量化了你的<strong>不确定性</strong>。
          本模块从共轭先验的解析解到<strong>MCMC 采样</strong>和<strong>变分推断</strong>——
          理解 VAE 的 ELBO、Diffusion 的去噪、以及现代不确定性量化的核心方法。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧠 贝叶斯推断</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 贝叶斯范式 vs 频率范式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> bayesian_paradigm</div>
                <pre className="fs-code">{`# 贝叶斯推断: 从先验到后验的完整流程

# ═══ 两种范式的哲学差异 ═══
#
# 频率派 (Frequentist):
#   θ 是固定未知常数
#   数据 D 是随机的 (不同样本不同)
#   目标: 点估计 θ̂ = f(D)
#   不确定性: 置信区间 (是区间随机, 不是 θ 随机)
#
# 贝叶斯派 (Bayesian):
#   θ 是随机变量 (有先验分布)
#   数据 D 是固定的 (观测到就固定了)
#   目标: 后验分布 P(θ|D)
#   不确定性: 可信区间 (θ 确实有概率在里面)

import numpy as np
from scipy import stats

# ═══ 完整贝叶斯工作流 ═══
# Step 1: 选择先验 P(θ)
# Step 2: 写出似然 P(D|θ)
# Step 3: 计算后验 P(θ|D) ∝ P(D|θ)·P(θ)
# Step 4: 后验推断 (预测/决策)

# ═══ 例: 估计网站转化率 ═══
# 先验: θ ~ Beta(2, 20)  → 约 10% 转化率的温和信念
# 数据: 100 次访问, 15 次转化
# 似然: D ~ Binomial(100, θ)
# 后验: θ|D ~ Beta(2+15, 20+85) = Beta(17, 105)

alpha_prior, beta_prior = 2, 20
n_success, n_fail = 15, 85

prior = stats.beta(alpha_prior, beta_prior)
posterior = stats.beta(alpha_prior + n_success, beta_prior + n_fail)

print("═══ 贝叶斯推断结果 ═══")
print(f"先验均值:    {prior.mean():.4f}")      # 0.0909
print(f"MLE:         {n_success/(n_success+n_fail):.4f}")  # 0.1500
print(f"后验均值:    {posterior.mean():.4f}")    # 0.1393
print(f"后验中位数:  {posterior.median():.4f}")
print(f"后验众数:    {(alpha_prior+n_success-1)/(alpha_prior+beta_prior+100-2):.4f}")

# 95% 可信区间 (Credible Interval)
ci = posterior.ppf([0.025, 0.975])
print(f"95% CI:      ({ci[0]:.4f}, {ci[1]:.4f})")
# → P(0.078 < θ < 0.209 | D) = 95%

# ═══ 后验预测 (Posterior Predictive) ═══
# P(x_new | D) = ∫ P(x_new | θ) · P(θ|D) dθ
# → 不是用点估计预测, 而是对所有可能的 θ 做加权平均!
# → 自动考虑了参数不确定性

# 预测: 下 200 次访问, 转化人数的分布
n_future = 200
# Beta-Binomial 分布
from scipy.special import comb as scomb, beta as sbeta

def beta_binomial_pmf(k, n, a, b):
    logpmf = (np.log(scomb(n, k, exact=True)) +
              np.log(sbeta(k+a, n-k+b)) - np.log(sbeta(a, b)))
    return np.exp(logpmf)

# 预测统计
pred_mean = n_future * posterior.mean()
pred_std = np.sqrt(n_future * posterior.mean() * (1-posterior.mean()) *
                   (1 + n_future/(alpha_prior+beta_prior+100+1)))
print(f"\\n预测 (200次): 期望转化={pred_mean:.1f}, 标准差={pred_std:.1f}")

# ═══ 频率派 vs 贝叶斯派的预测差异 ═══
# 频率: θ̂=0.15 → 预测 200×0.15 = 30 (确定性)
# 贝叶斯: 后验加权 → 预测 27.9 ± 6.2 (含不确定性!)
# → 贝叶斯预测更保守, 更诚实

# ═══ AI 中的贝叶斯思想 ═══
# 1. GPT Temperature Sampling = 后验采样
# 2. Dropout Inference = Monte Carlo 近似后验
# 3. Ensemble Methods = 近似 Bayesian Model Averaging
# 4. Neural Architecture Search = 贝叶斯优化
# 5. Active Learning = 最大化后验信息增益`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔑 共轭先验 — 解析可解的贝叶斯</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> conjugate_priors</div>
                <pre className="fs-code">{`# 共轭先验: 先验和后验同分布族 → 解析解!

# ═══ 共轭先验大全 ═══
# ┌──────────────┬────────────┬──────────────┬───────────┐
# │ 似然          │ 参数       │ 共轭先验      │ 后验       │
# ├──────────────┼────────────┼──────────────┼───────────┤
# │ Bernoulli(p) │ p          │ Beta(α,β)    │ Beta(α',β')│
# │ Binomial(n,p)│ p          │ Beta(α,β)    │ Beta(α',β')│
# │ Poisson(λ)   │ λ          │ Gamma(α,β)   │ Gamma     │
# │ Normal(μ,σ²) │ μ (σ²已知) │ Normal       │ Normal    │
# │ Normal(μ,σ²) │ σ² (μ已知) │ InvGamma     │ InvGamma  │
# │ Exponential  │ λ          │ Gamma        │ Gamma     │
# │ Multinomial  │ p          │ Dirichlet    │ Dirichlet │
# │ Normal(μ,σ²) │ (μ,σ²)     │ Normal-IG    │ Normal-IG │
# └──────────────┴────────────┴──────────────┴───────────┘

import numpy as np
from scipy import stats

# ═══ 1. Beta-Bernoulli (核心中的核心) ═══
# 先验: θ ~ Beta(α, β)
# 数据: k 次成功, n-k 次失败
# 后验: θ|D ~ Beta(α+k, β+n-k)
#
# 先验的"虚拟"数据解释:
# α = 先验中假想的成功次数
# β = 先验中假想的失败次数
# → 先验越强(α+β越大), 数据影响越小

alpha, beta_param = 1, 1  # Beta(1,1) = Uniform → 无信息先验
for n, k in [(10, 7), (100, 70), (1000, 700)]:
    post = stats.beta(alpha + k, beta_param + n - k)
    ci = post.ppf([0.025, 0.975])
    print(f"n={n:>4}, k={k:>3}: "
          f"μ_post={post.mean():.4f}, "
          f"95%CI=({ci[0]:.4f}, {ci[1]:.4f})")
# 数据越多, 后验越集中, CI 越窄!

# ═══ 2. Normal-Normal (高斯信号处理) ═══
# 先验: μ ~ N(μ₀, σ₀²)
# 似然: xᵢ ~ N(μ, σ²) (σ² 已知)
# 后验: μ|D ~ N(μ_post, σ_post²)
#
# μ_post = (σ² · μ₀ + σ₀² · n · X̄) / (σ² + n · σ₀²)
# σ_post² = (σ² · σ₀²) / (σ² + n · σ₀²)
#
# → 后验均值 = 先验与数据的"精度加权平均"!
# → 精度 = 1/方差

mu_0, sigma_0 = 0, 10  # 宽先验
sigma = 1  # 已知观测噪声
data = np.random.normal(3.0, sigma, 50)
n_obs = len(data)
x_bar = data.mean()

precision_prior = 1 / sigma_0**2
precision_data = n_obs / sigma**2
precision_post = precision_prior + precision_data

mu_post = (precision_prior * mu_0 + precision_data * x_bar) / precision_post
sigma_post = np.sqrt(1 / precision_post)
print(f"\\n高斯共轭: μ_post={mu_post:.4f}, σ_post={sigma_post:.4f}")

# ═══ 3. Dirichlet-Multinomial (NLP核心) ═══
# 先验: π ~ Dirichlet(α₁,...,αₖ)
# 似然: 词频计数
# 后验: Dirichlet(α₁+c₁, ..., αₖ+cₖ)
#
# 应用: LDA 主题模型, Smoothed Language Model

# 词汇表有 4 个词, 观测到文本中：
# 词频: [30, 45, 15, 10]
alpha_prior_dir = np.ones(4)  # 均匀 Dirichlet 先验
counts = np.array([30, 45, 15, 10])
alpha_post_dir = alpha_prior_dir + counts

# Dirichlet 均值 = αₖ / Σαₖ
pi_mle = counts / counts.sum()  # MLE
pi_post = alpha_post_dir / alpha_post_dir.sum()  # 后验均值
print(f"MLE:  {pi_mle.round(4)}")
print(f"Bayes: {pi_post.round(4)}")
# Laplace 平滑 (α=1) 避免零概率!
# → GPT Tokenizer 的 unigram model 就用 Dirichlet 先验

# ═══ 共轭先验的局限 ═══
# 1. 只适用于指数族 → DNN 参数不行
# 2. 先验族受限 → 可能不符合真实信念
# 3. 高维困难 → 需要近似方法 (MCMC / VI)
# → 于是有了下面两个 Tab 的内容!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎲 MCMC — 马尔可夫链蒙特卡洛</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> mcmc_sampling</div>
                <pre className="fs-code">{`# MCMC: 从无法直接采样的后验中采样

# ═══ 核心问题 ═══
# 贝叶斯后验: P(θ|D) = P(D|θ)P(θ) / P(D)
# P(D) = ∫P(D|θ)P(θ)dθ → 通常不可计算!
# MCMC 天才想法: 不需要 P(D)! 只需
# P(θ|D) ∝ P(D|θ)·P(θ) (未归一化后验)

import numpy as np
from scipy import stats

# ═══ Metropolis-Hastings 算法 ═══
# 1. 从当前状态 θ, 提议 θ' ~ q(θ'|θ)
# 2. 计算接受率: α = min(1, p(θ')q(θ|θ') / p(θ)q(θ'|θ))
# 3. 以概率 α 接受 θ', 否则保持 θ
# 定理: 该马尔可夫链的平稳分布 = 目标分布!

def metropolis_hastings(log_target, initial, n_samples, proposal_std=0.5):
    """通用 Metropolis-Hastings 采样器"""
    samples = [initial]
    current = initial
    accepted = 0
    
    for _ in range(n_samples):
        # 提议 (对称随机游走)
        proposed = current + np.random.normal(0, proposal_std)
        
        # 对数接受率 (避免数值下溢)
        log_alpha = log_target(proposed) - log_target(current)
        
        # 接受/拒绝
        if np.log(np.random.uniform()) < log_alpha:
            current = proposed
            accepted += 1
        samples.append(current)
    
    accept_rate = accepted / n_samples
    return np.array(samples), accept_rate

# ═══ 示例: 双峰后验采样 ═══
def log_bimodal(x):
    """双峰混合高斯的对数密度"""
    return np.log(0.3 * stats.norm.pdf(x, -3, 1) +
                  0.7 * stats.norm.pdf(x, 2, 0.5) + 1e-300)

samples, acc = metropolis_hastings(log_bimodal, 0, 50000, 1.5)
burn_in = samples[5000:]  # 丢弃 burn-in
print(f"接受率: {acc:.3f} (理想: 0.23-0.44)")
print(f"MCMC 均值: {burn_in.mean():.3f}")
print(f"MCMC 标准差: {burn_in.std():.3f}")

# ═══ Gibbs 采样 (特殊的 MH) ═══
# 多维参数: 每次只更新一个维度
# 从条件分布 P(θᵢ|θ_{-i}, D) 采样
# → 接受率 = 1 (永远接受!)
# 
# 应用: LDA 主题模型的经典推断算法
# 交替采样: 主题分配 z → 主题-词分布 → z → ...

# ═══ Hamiltonian Monte Carlo (HMC) ═══
# MCMC 的现代版本, 物理学启发:
# 将参数看作"位置", 引入"动量"
# 沿 Hamilton 方程演化 → 高效探索
# 
# NUTS (No-U-Turn Sampler): HMC + 自动调参
# → Stan 和 PyMC 的默认算法
# → 比 MH 快 10-1000 倍!

# ═══ MCMC 诊断 ═══
# 1. Trace Plot: 链条是否混合良好
# 2. R̂ (Gelman-Rubin): 多链一致性, R̂ < 1.01
# 3. ESS (有效样本量): 自相关修正后的样本数
# 4. Autocorrelation: 相邻样本的相关性

# 简单自相关计算
def autocorr(x, lag):
    return np.corrcoef(x[:-lag], x[lag:])[0, 1]

for lag in [1, 5, 10, 50]:
    ac = autocorr(burn_in, lag)
    print(f"Lag-{lag:>2} 自相关: {ac:.4f}")

# ═══ AI 中的 MCMC ═══
# 1. SGLD (随机梯度 Langevin):
#    θ ← θ - η∇L + √(2η)·ε, ε~N(0,I)
#    → SGD + 噪声 = 近似后验采样!
#
# 2. Bayesian Neural Networks:
#    对权重做 MCMC → 完整不确定性量化
#    → 但计算太贵 → 实践中用变分推断
#
# 3. Diffusion Model 的采样:
#    反向去噪 = Langevin dynamics!
#    xₜ₋₁ = μθ(xₜ) + σₜ·z, z~N(0,I)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 变分推断 (VI) — 快速近似贝叶斯</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> variational_inference</div>
                <pre className="fs-code">{`# 变分推断: 把推断问题变成优化问题

# ═══ 核心思想 ═══
# MCMC: 慢但准确 (采样)
# VI:   快但近似 (优化)
#
# 找一个简单分布 q(θ) 去近似后验 P(θ|D)
# 目标: min KL(q(θ) ‖ P(θ|D))
# 等价: max ELBO (Evidence Lower BOund)

import numpy as np
from scipy import stats

# ═══ ELBO 推导 ═══
# log P(D) = log ∫ P(D,θ) dθ
#
# = log ∫ [P(D,θ)/q(θ)] · q(θ) dθ    (乘以 q/q)
# ≥ ∫ log[P(D,θ)/q(θ)] · q(θ) dθ     (Jensen 不等式)
# = E_q[log P(D,θ)] - E_q[log q(θ)]
# = E_q[log P(D|θ)] - KL(q(θ) ‖ P(θ))
#   ↑ 重构/似然项     ↑ 正则/先验项
#
# ELBO = E_q[log P(D|θ)] - KL(q ‖ prior)
# → 最大化 ELBO = 平衡拟合数据与坚持先验

# ═══ Mean-Field 变分推断 ═══
# 假设: q(θ) = ∏ qᵢ(θᵢ)  (各维度独立)
# 最优解: qᵢ*(θᵢ) ∝ exp(E_{-i}[log P(θ, D)])
# → 迭代更新, 类似 EM 的坐标上升

# ═══ VAE 的变分推断 ═══
# 模型: p(x) = ∫ p(x|z)·p(z) dz
# 近似: q_φ(z|x) ≈ p(z|x)  (编码器)
#
# ELBO = E_q[log p(x|z)] - KL(q(z|x) ‖ p(z))
#        ↑ 重构损失        ↑ 正则化
#
# q(z|x) = N(μ_φ(x), σ²_φ(x))  → Encoder 输出
# p(z) = N(0, I)                 → 先验
# p(x|z) = Decoder               → 重构

# KL(N(μ,σ²) ‖ N(0,1)) = ½(μ² + σ² - 1 - log σ²)
def kl_normal(mu, log_var):
    """VAE 中的 KL 散度 (解析解)"""
    return -0.5 * np.sum(1 + log_var - mu**2 - np.exp(log_var))

# 模拟 VAE 的一个样本
mu = np.array([0.5, -0.3, 0.8])
log_var = np.array([-1.0, -0.5, -0.8])
kl = kl_normal(mu, log_var)
print(f"KL(q ‖ p(z)) = {kl:.4f}")

# 重参数化采样
epsilon = np.random.normal(0, 1, 3)
z = mu + np.exp(0.5 * log_var) * epsilon
print(f"z (重参数化) = {z.round(4)}")

# ═══ VI vs MCMC 对比 ═══
# ┌──────────┬──────────────┬──────────────┐
# │          │ MCMC          │ VI            │
# ├──────────┼──────────────┼──────────────┤
# │ 方法      │ 采样          │ 优化          │
# │ 精度      │ 渐近精确      │ 有偏近似      │
# │ 速度      │ 慢            │ 快            │
# │ 扩展性    │ 差            │ 好 (SGD)      │
# │ 诊断      │ R̂, ESS       │ ELBO 曲线     │
# │ 多模态    │ 可以          │ 困难          │
# │ 代表算法  │ NUTS, HMC    │ ADVI, VAE     │
# └──────────┴──────────────┴──────────────┘

# ═══ 现代 VI 技术 ═══
# 1. 黑盒 VI (BBVI):
#    用 reparameterization trick + SGD
#    → 不需要解析 ELBO, 自动微分搞定
#
# 2. Normalizing Flows:
#    q(z) 不限于高斯 → 用可逆变换建模复杂后验
#    z₀ ~ N(0,I) → f₁ → f₂ → ... → zₖ
#    → 更灵活的 q, 更紧的 ELBO
#
# 3. Amortized VI (VAE):
#    q_φ(z|x): 一个网络处理所有 x
#    → O(1) 推断时间 (不是 MLE 的 O(n))
#
# 4. Diffusion = 层次化 VI:
#    q(x₁:T|x₀) = ∏ q(xₜ|xₜ₋₁)  → 编码
#    p(x₀:T) = p(xT) ∏ p(xₜ₋₁|xₜ) → 解码
#    ELBO → 每层的去噪 Loss 之和`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
