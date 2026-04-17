import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Markov 链', '随机游走与布朗运动', '扩散过程', '随机过程与现代 AI'];

export default function LessonStochastic() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎲 module_08 — 随机过程与 AI</div>
      <div className="fs-hero">
        <h1>随机过程：概率论的时间维度</h1>
        <p>
          随机过程是概率论从「静态快照」到「动态演化」的飞跃。
          <strong>Markov 链</strong>是 PageRank、MCMC、语言模型的数学根基；
          <strong>布朗运动</strong>连接物理扩散与金融定价；
          而<strong>扩散过程</strong>（SDE）直接催生了当今最强大的生成模型——
          DDPM、Stable Diffusion、Sora。本模块串联所有概率论知识，
          展示它们在 AI 最前沿的统一应用。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌊 随机过程</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⛓️ Markov 链 — 无记忆的随机演化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> markov_chains</div>
                <pre className="fs-code">{`# Markov 链: 未来只依赖现在, 不依赖过去

# ═══ 定义 ═══
# {Xₜ} 是 Markov 链 ←→
# P(Xₜ₊₁ = j | Xₜ=i, Xₜ₋₁, ..., X₀) = P(Xₜ₊₁=j | Xₜ=i)
# → "给定现在, 未来与过去独立"
# → 完全由转移矩阵 P 描述: Pᵢⱼ = P(Xₜ₊₁=j | Xₜ=i)

import numpy as np

# ═══ 天气 Markov 链 ═══
# 状态: 0=晴, 1=阴, 2=雨
# 转移矩阵 (行→列)
P = np.array([
    [0.7, 0.2, 0.1],  # 晴 → 晴/阴/雨
    [0.3, 0.4, 0.3],  # 阴 →
    [0.2, 0.3, 0.5],  # 雨 →
])
states = ['☀️晴', '☁️阴', '🌧️雨']

# 模拟 Markov 链
def simulate_mc(P, start, steps):
    n_states = len(P)
    chain = [start]
    for _ in range(steps):
        chain.append(np.random.choice(n_states, p=P[chain[-1]]))
    return chain

np.random.seed(42)
chain = simulate_mc(P, 0, 20)
print("天气序列:", ' → '.join([states[s] for s in chain[:10]]))

# ═══ 平稳分布 ═══
# π 是平稳分布 ←→ πP = π, Σπᵢ = 1
# 直觉: 经过足够长时间, 链的状态比例趋向 π
# → 无论从哪个状态开始!

# 方法1: 特征值分解
eigenvalues, eigenvectors = np.linalg.eig(P.T)
# 找特征值=1 对应的特征向量
idx = np.argmin(np.abs(eigenvalues - 1))
pi = np.real(eigenvectors[:, idx])
pi = pi / pi.sum()
print(f"\\n平稳分布: {dict(zip(states, pi.round(4)))}")

# 方法2: 幂迭代 (P^n 收敛)
pi_init = np.array([1, 0, 0])  # 从晴开始
for step in [1, 5, 10, 50]:
    pi_n = pi_init @ np.linalg.matrix_power(P, step)
    print(f"Step {step:>2}: {pi_n.round(4)}")

# ═══ PageRank = Markov 链的平稳分布! ═══
# 网页 = 状态, 链接 = 转移
# P_ij = (1-d)/N + d · (链接_ij / 出度_i)
# d = 0.85 (阻尼因子)
# → PageRank = 随机浏览者长期停留概率

# 简单 PageRank 示例
# A→B, A→C, B→C, C→A
adj = np.array([
    [0, 1, 1],  # A 链接到 B, C
    [0, 0, 1],  # B 链接到 C
    [1, 0, 0],  # C 链接到 A
])
d = 0.85
N = 3
# 转移矩阵
T = adj / adj.sum(axis=1, keepdims=True)
P_pr = (1-d)/N + d * T

# 求平稳分布 (PageRank 值)
evals, evecs = np.linalg.eig(P_pr.T)
idx = np.argmin(np.abs(evals - 1))
pr = np.real(evecs[:, idx])
pr = pr / pr.sum()
print(f"\\nPageRank: A={pr[0]:.3f}, B={pr[1]:.3f}, C={pr[2]:.3f}")

# ═══ Markov 链与 AI ═══
# 1. n-gram 语言模型 = 有限阶 Markov 链
#    P(wₜ | w₁,...,wₜ₋₁) ≈ P(wₜ | wₜ₋ₙ₊₁,...,wₜ₋₁)
#    → bigram (n=2): Markov 链!
#
# 2. HMM = 隐状态是 Markov 链
#    观测: o₁, o₂, ...
#    隐状态: s₁ → s₂ → ... (Markov 链)
#    → 语音识别, POS 标注
#
# 3. MCMC = 构造 Markov 链使平稳分布=后验
#    前面模块的 MH 算法!
#
# 4. 为什么 Transformer 不是 Markov?
#    因为 Attention 看所有历史!
#    但推理时用 KV-Cache → 某种程度上是 Markov!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚶 随机游走与布朗运动</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> random_walk_brownian</div>
                <pre className="fs-code">{`# 从离散随机游走到连续布朗运动

# ═══ 简单随机游走 ═══
# Sₙ = X₁ + X₂ + ... + Xₙ
# Xᵢ = +1 (概率 1/2) 或 -1 (概率 1/2)
# E[Sₙ] = 0, Var(Sₙ) = n
# → 标准差 ~ √n (随机涨落)

import numpy as np

np.random.seed(42)
n_steps = 10000

# 模拟多条随机游走
n_walks = 5
for i in range(n_walks):
    steps = np.random.choice([-1, 1], n_steps)
    walk = np.cumsum(steps)
    print(f"Walk {i}: 终点={walk[-1]:>4}, "
          f"|Sₙ|/√n = {abs(walk[-1])/np.sqrt(n_steps):.3f}")

# ═══ 随机游走的性质 ═══
# 1. 回归性: 1D/2D 随机游走以概率1回到原点
#    3D+: 以正概率永远不回来!
#    → Pólya 定理: "A drunk can always find
#       their way home in 2D, but not 3D"
#
# 2. Arcsine 定律: 游走在正半轴的时间比例
#    → 不是 50%! 而是 arcsine 分布
#    → 直觉错误: 正负交替不频繁

# ═══ 布朗运动 (Wiener 过程) ═══
# Bₜ 满足:
# 1. B₀ = 0
# 2. 独立增量: Bₜ-Bₛ ⊥ Bₛ-Bᵤ (t>s>u)
# 3. 正态增量: Bₜ-Bₛ ~ N(0, t-s)
# 4. 路径连续但处处不可微!
#
# 本质: 随机游走 → (步长→0, 步数→∞) → 布朗运动
# Donsker 定理: S_{⌊nt⌋}/√n →ᵈ Bₜ

# 模拟布朗运动
def brownian_motion(T, n_steps, n_paths=5):
    dt = T / n_steps
    paths = np.zeros((n_paths, n_steps + 1))
    for i in range(n_paths):
        dB = np.random.normal(0, np.sqrt(dt), n_steps)
        paths[i, 1:] = np.cumsum(dB)
    return paths

T = 1.0
paths = brownian_motion(T, 1000, 5)
for i, p in enumerate(paths):
    print(f"Path {i}: B(1)={p[-1]:.4f}")
print(f"理论: B(1)~N(0,1), 样本std={paths[:,-1].std():.4f}")

# ═══ 几何布朗运动 (GBM) ═══
# dSₜ = μ·Sₜ·dt + σ·Sₜ·dBₜ
# → 股价模型! Black-Scholes 的基础
# 解: Sₜ = S₀·exp((μ-σ²/2)t + σBₜ)

S0 = 100  # 初始股价
mu = 0.1  # 年化收益率
sigma = 0.2  # 年化波动率

n_sims = 10000
dt_gbm = 1/252  # 一天
n_days = 252  # 一年

for _ in range(3):
    Z = np.random.normal(0, 1, n_days)
    S = S0 * np.exp(np.cumsum((mu-0.5*sigma**2)*dt_gbm + sigma*np.sqrt(dt_gbm)*Z))
    print(f"起始 {S0} → 终止 {S[-1]:.2f}")

# ═══ 与 AI 的联系 ═══
# 1. 随机游走假说 → 股价不可预测?
#    → 但 AI/Transformer 可以捕捉非线性依赖
#
# 2. SGD 的随机轨迹:
#    参数更新 ≈ 梯度场上的随机游走
#    噪声帮助跳出局部最优 (simulated annealing)
#
# 3. GAN 训练动态:
#    Nash 均衡的收敛 ≈ 2D 随机游走
#    → 解释了 GAN 训练的不稳定性`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌀 扩散过程 — Diffusion Model 的数学根基</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> diffusion_process</div>
                <pre className="fs-code">{`# 扩散过程: 随机微分方程 (SDE) 驱动的连续演化

# ═══ 随机微分方程 (SDE) ═══
# dXₜ = f(Xₜ, t)dt + g(Xₜ, t)dBₜ
#        ↑ 漂移项      ↑ 扩散项
# f: 确定性趋势 (drift)
# g: 随机波动强度 (diffusion)
# Bₜ: 布朗运动 (噪声源)

import numpy as np

# ═══ Ornstein-Uhlenbeck 过程 ═══
# dXₜ = -θ·Xₜ·dt + σ·dBₜ
# → 均值回复 + 随机波动
# → 平稳分布: N(0, σ²/(2θ))
# → VAE 的先验流 / 物理粒子运动

def simulate_ou(theta, sigma, x0, T, dt, n_paths=5):
    n_steps = int(T / dt)
    paths = np.zeros((n_paths, n_steps + 1))
    paths[:, 0] = x0
    for t in range(n_steps):
        dB = np.random.normal(0, np.sqrt(dt), n_paths)
        paths[:, t+1] = paths[:, t] - theta * paths[:, t] * dt + sigma * dB
    return paths

paths = simulate_ou(theta=2, sigma=1, x0=3, T=5, dt=0.01)
for i in range(3):
    print(f"OU Path {i}: start={paths[i,0]:.2f}, end={paths[i,-1]:.4f}")
print(f"理论平稳分布: N(0, {1/(2*2):.4f})")

# ═══ DDPM 的前向扩散 ═══
# 离散化 SDE: q(xₜ|xₜ₋₁) = N(√(1-βₜ)·xₜ₋₁, βₜI)
#
# βₜ: 噪声调度 (noise schedule), 从小到大
# 一步公式: q(xₜ|x₀) = N(√ᾱₜ·x₀, (1-ᾱₜ)I)
#   ᾱₜ = ∏ᵢ₌₁ᵗ (1-βᵢ)
# 当 T→∞: xT ≈ N(0, I) (纯噪声)

def ddpm_forward(x0, T_steps=1000, beta_start=1e-4, beta_end=0.02):
    """DDPM 前向过程: 逐步加噪"""
    betas = np.linspace(beta_start, beta_end, T_steps)
    alphas = 1 - betas
    alpha_bars = np.cumprod(alphas)
    
    # 一步到位: q(xₜ|x₀)
    results = {}
    for t in [0, 50, 200, 500, 999]:
        noise = np.random.normal(0, 1, x0.shape)
        x_t = np.sqrt(alpha_bars[t]) * x0 + np.sqrt(1-alpha_bars[t]) * noise
        signal = np.sqrt(alpha_bars[t])
        noisy = np.sqrt(1 - alpha_bars[t])
        results[t] = (signal, noisy, np.std(x_t))
    
    return results

# 模拟图像 (简化为 1D 信号)
x0 = np.array([0.8, 0.5, -0.3, 0.9, -0.7])
results = ddpm_forward(x0)
print("\\n═══ DDPM 前向扩散 ═══")
for t, (sig, noise_lvl, std) in results.items():
    print(f"t={t:>4}: signal={sig:.4f}, noise={noise_lvl:.4f}, "
          f"SNR={sig/noise_lvl:.4f}")
# t=0:   signal≈1, noise≈0 → 几乎原始图像
# t=999: signal≈0, noise≈1 → 几乎纯噪声

# ═══ Fokker-Planck 方程 ═══
# SDE ←→ FPE (粒子vs分布视角):
# ∂p/∂t = -∇·(f·p) + ½∇²(g²·p)
#
# DDPM 的反向过程也有对应 SDE:
# dx = [f - g²·∇log p(x,t)]dt + g·dBₜ  (反向)
#       ↑ 确定性      ↑ Score Function!
# → Score Function ∇log p(x,t) 是核心!
# → Score Matching 训练网络估计 Score

# ═══ Score Matching ═══
# 目标: 学习 sθ(x,t) ≈ ∇x log p(xₜ)
# 等价: sθ(x,t) ≈ -ε/σₜ  (噪声预测!)
# Loss: E[‖sθ(xₜ,t) - ∇log q(xₜ|x₀)‖²]
#      = E[‖εθ(xₜ,t) - ε‖²]  (DDPM 简化形式)
# → DDPM 的训练 Loss = 预测噪声的 MSE!

print("\\n═══ DDPM Training Loss ═══")
print("L = E_{t,x₀,ε} [ ‖ε - εθ(√ᾱₜ·x₀ + √(1-ᾱₜ)·ε, t)‖² ]")
print("→ 就是噪声预测的均方误差!")`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 随机过程在现代 AI 的大统一</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> stochastic_ai_unified</div>
                <pre className="fs-code">{`# 随机过程视角下的现代 AI 统一图景

# ═══ 概率论 → AI 的完整知识图谱 ═══
#
# Module 1: 概率公理 → 不确定性的语言
# Module 2: 随机变量 → 重参数化技巧 (VAE核心)
# Module 3: 分布族 → 指数族 → GLM → Softmax
# Module 4: 极限定理 → SGD 收敛, Batch Mean 
# Module 5: MLE/MAP → Loss 设计, 正则化
# Module 6: 贝叶斯 → VAE, 不确定性量化
# Module 7: 信息论 → Cross-Entropy, KL, Perplexity
# Module 8: 随机过程 → Diffusion, MCMC, RL
#
# 一切 AI 方法都是概率论的应用!

import numpy as np

# ═══ 1. Diffusion Models: 完整流水线 ═══
print("═══ Diffusion Model Pipeline ═══")
print("""
训练 (前向+反向):
1. 采样 x₀ ~ data, t ~ Uniform(1,T), ε ~ N(0,I)
2. 构造 xₜ = √ᾱₜ·x₀ + √(1-ᾱₜ)·ε    [前向SDE]
3. Loss = ‖ε - εθ(xₜ, t)‖²           [Score Matching]
4. 反向传播更新 θ

生成 (反向采样):
1. xT ~ N(0, I)                       [纯噪声]
2. for t = T,...,1:
     z ~ N(0,I) if t>1 else 0
     xₜ₋₁ = (1/√αₜ)(xₜ - βₜ/√(1-ᾱₜ)·εθ(xₜ,t)) + σₜ·z
   → 逐步去噪 = 反向 SDE 的 Euler 离散化
3. 输出 x₀                            [生成的图像]
""")

# 用到的概率论: 高斯分布, KL散度, ELBO, SDE, 
# 边缘化, 条件分布, 重参数化...几乎全部!

# ═══ 2. 强化学习的随机过程视角 ═══
print("═══ RL as Stochastic Process ═══")
print("""
MDP = 受控 Markov 链:
  状态 sₜ → 动作 aₜ ~ π(·|sₜ) → 奖励 rₜ → 状态 sₜ₊₁

策略梯度 = 期望的梯度:
  ∇J = E[Σ ∇log π(aₜ|sₜ) · Qπ(sₜ, aₜ)]
  → 蒙特卡洛估计 (大数定律)
  → 方差缩减 (Baseline → 条件期望)

PPO 的 KL 约束:
  max E[Aπ] s.t. KL(π_old ‖ π_new) < ε
  → Fisher 信息矩阵 = KL 的 Hessian
""")

# ═══ 3. LLM 的概率论基础 ═══
print("═══ LLM Probabilistic Foundations ═══")
print("""
GPT = 条件概率的自回归分解:
  p(w₁,...,wₙ) = ∏ p(wₜ | w₁,...,wₜ₋₁)
  → 链式法则 (Module 1)

训练 Loss = 交叉熵:
  L = -Σ log p(wₜ | context)  → 最大似然 (Module 5)

Temperature Sampling:
  p(w) ∝ exp(logit/T) → Categorical (Module 3)

Beam Search vs Nucleus Sampling:
  → 探索-利用 tradeoff (随机过程)

RLHF:
  reward model → PPO → 策略优化 (RL)
  DPO: 直接从偏好学习 → 隐式的 Bradley-Terry 模型
""")

# ═══ 4. 完整概率论技能树 ═══
print("═══ 概率论技能树总结 ═══")
skills = {
    "基础层": [
        "概率公理 → 不确定性建模",
        "条件概率 → 贝叶斯思维",
        "随机变量 → 数学抽象",
    ],
    "工具层": [
        "分布族 → 模型假设",
        "极限定理 → 统计推断基础",
        "信息论 → Loss 函数设计",
    ],
    "方法层": [
        "MLE/MAP → 参数学习",
        "贝叶斯推断 → 不确定性量化",
        "假设检验 → 实验设计",
    ],
    "前沿层": [
        "随机过程 → 时序建模",
        "SDE/扩散 → 生成模型",
        "信息几何 → 优化加速",
    ]
}
for layer, items in skills.items():
    print(f"\\n📌 {layer}:")
    for item in items:
        print(f"   {item}")

print("\\n🎓 恭喜! 完成概率统计全部 8 个模块。")
print("   你现在拥有理解现代 AI 数学基础的完整工具箱。")`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
