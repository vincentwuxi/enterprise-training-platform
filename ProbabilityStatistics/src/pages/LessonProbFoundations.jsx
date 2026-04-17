import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['概率的本质', '条件概率与独立', '贝叶斯公式', '组合计数与概率'];

export default function LessonProbFoundations() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎲 module_01 — 概率空间</div>
      <div className="fs-hero">
        <h1>概率空间：从赌博直觉到公理化体系</h1>
        <p>
          概率论的诞生源于赌徒的争论，却发展成了整个现代 AI 的数学语言。
          <strong>一切机器学习模型本质上都是概率模型</strong>——从朴素贝叶斯到 GPT 的
          next-token prediction，从 VAE 的隐变量推断到 Diffusion Model 的概率去噪。
          本模块建立<strong>样本空间、事件、概率公理、条件概率</strong>的严格基础。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎲 概率空间基础</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 概率的三种理解 + 公理化定义</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> probability_axioms</div>
                <pre className="fs-code">{`# 概率的三种理解 + Kolmogorov 公理

# ═══ 理解一：频率主义 (Frequentist) ═══
# P(事件) = lim(n→∞) 事件发生次数 / 总试验次数
# "抛硬币正面的概率是 0.5" = 抛无穷多次，正面比例趋近 0.5

import numpy as np
from collections import Counter

# 模拟抛硬币，观察频率收敛
np.random.seed(42)
tosses = np.random.choice(['H', 'T'], size=100000)
for n in [100, 1000, 10000, 100000]:
    freq = np.sum(tosses[:n] == 'H') / n
    print(f"n={n:>6d}: P(H) ≈ {freq:.4f}")
# n=   100: P(H) ≈ 0.4800
# n=  1000: P(H) ≈ 0.5020  ← 逐渐收敛
# n= 10000: P(H) ≈ 0.5017
# n=100000: P(H) ≈ 0.4994  ← 很接近 0.5

# ═══ 理解二：贝叶斯主义 (Bayesian) ═══
# P(事件) = 你对该事件的置信度 (degree of belief)
# "明天下雨概率 30%" = 你有 30% 的信心认为会下雨
# → 不同人可以有不同的概率 (先验不同)
# → 看到数据后更新概率 (后验推断)
# → GPT 的 next-token prediction 就是贝叶斯思想!

# ═══ 理解三：对称性 (Laplace) ═══
# P(事件) = 有利结果数 / 总等可能结果数
# 前提: 所有基本结果等可能
# P(骰子点数=6) = 1/6

# ═════════════════════════════════════════
# Kolmogorov 公理 (1933) — 概率论的公理化基础
# ═════════════════════════════════════════
# 给定:
#   Ω = 样本空间 (所有可能结果的集合)
#   F = 事件空间 (Ω 的子集构成的 σ-代数)
#   P = 概率测度 (从 F 到 [0,1] 的函数)
#
# 三条公理:
# A1. 非负性: P(A) ≥ 0, ∀A ∈ F
# A2. 归一性: P(Ω) = 1
# A3. 可列可加性: 若 A₁, A₂, ... 互斥,
#     则 P(∪Aᵢ) = ΣP(Aᵢ)

# ═══ Python 模拟: 样本空间 ═══
# 掷两颗骰子的样本空间
Omega = [(i, j) for i in range(1, 7) for j in range(1, 7)]
print(f"|Ω| = {len(Omega)}")  # 36

# 事件: 两颗之和为 7
A = [(i, j) for (i, j) in Omega if i + j == 7]
print(f"A = {A}")  # [(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)]
print(f"P(A) = {len(A)}/{len(Omega)} = {len(A)/len(Omega):.4f}")
# P(A) = 6/36 = 0.1667

# ═══ 从公理推出的基本性质 ═══
# P(∅) = 0                     (空集概率为0)
# P(Aᶜ) = 1 - P(A)             (补集规则)
# P(A∪B) = P(A)+P(B)-P(A∩B)    (容斥原理)
# A⊂B → P(A) ≤ P(B)           (单调性)

# 验证: 蒙特卡洛模拟
N = 1000000
dice1 = np.random.randint(1, 7, N)
dice2 = np.random.randint(1, 7, N)
sum7 = np.mean(dice1 + dice2 == 7)
print(f"MC 模拟 P(和=7) = {sum7:.4f}")  # ≈ 0.1667

# ═══ AI 中的概率空间 ═══
# GPT 的 next-token:
#   Ω = 词汇表 V = {token₁, ..., token_50257}
#   P(tokenᵢ | context) = softmax(logits)[i]
#   → 每次预测 = 在 |V| 个结果上定义概率分布!
#
# Diffusion Model:
#   Ω = ℝ^(H×W×3)  (所有可能图像的空间)
#   P(x₀ | text) = 文本条件下生成图像的概率
#   → 在连续无限维空间上的概率分布!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 条件概率与独立性</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> conditional_independence</div>
                <pre className="fs-code">{`# 条件概率: 在已知信息下更新概率

# ═══ 条件概率定义 ═══
# P(A|B) = P(A∩B) / P(B),  P(B) > 0
#
# 直觉: "在 B 已经发生的前提下, A 发生的概率"
# → 缩小了样本空间: Ω → B

import numpy as np

# ═══ 经典例题: 医学检测 ═══
# 某疾病发病率 0.1% (千分之一)
# 检测灵敏度 99% (有病→阳性的概率)
# 检测特异度 95% (没病→阴性的概率)
# 问: 检测阳性, 真的有病的概率?

prevalence = 0.001     # P(Disease)
sensitivity = 0.99     # P(+|Disease)
specificity = 0.95     # P(-|Healthy)
false_positive = 1 - specificity  # P(+|Healthy) = 0.05

# P(+) = P(+|D)P(D) + P(+|H)P(H)  [全概率公式]
p_positive = sensitivity * prevalence + false_positive * (1 - prevalence)
print(f"P(阳性) = {p_positive:.5f}")  # 0.05094

# P(D|+) = P(+|D)P(D) / P(+)  [贝叶斯公式]
p_disease_given_positive = (sensitivity * prevalence) / p_positive
print(f"P(有病|阳性) = {p_disease_given_positive:.4f}")
# ≈ 0.0194 → 只有 1.94%!

# 💡 这就是 "基础率谬误" (Base Rate Fallacy)
# 即使检测很准 (99%), 因为发病率极低,
# 阳性结果中大部分其实是假阳性!
# → 这是理解 Precision/Recall 的基础!

# ═══ 独立性 ═══
# A, B 独立 ←→ P(A∩B) = P(A)·P(B)
# 等价: P(A|B) = P(A)  (知道B不影响对A的判断)

# 模拟验证: 两次抛硬币
N = 100000
coin1 = np.random.choice([0, 1], N)
coin2 = np.random.choice([0, 1], N)

# P(coin1=1) * P(coin2=1) ≈ P(coin1=1 且 coin2=1)?
p1 = np.mean(coin1 == 1)
p2 = np.mean(coin2 == 1)
p_both = np.mean((coin1 == 1) & (coin2 == 1))
print(f"P(A)·P(B) = {p1*p2:.4f}")
print(f"P(A∩B)    = {p_both:.4f}")  # 二者非常接近 → 独立

# ═══ 条件独立 ═══
# A, B 在给定 C 下条件独立:
# P(A∩B|C) = P(A|C)·P(B|C)
#
# 关键区别:
# - 独立 ≠ 条件独立
# - 条件独立 ≠ 独立
#
# AI 中的条件独立假设:
# 朴素贝叶斯:
#   P(x₁,...,xₙ|y) = ∏P(xᵢ|y)
#   特征之间在给定类别下条件独立
#   → 实际中很强的假设, 但效果出奇地好!
#
# HMM (隐马尔可夫模型):
#   P(oₜ|s₁,...,sₜ,...,sₙ,o₁,...) = P(oₜ|sₜ)
#   观测只依赖当前隐状态 → 条件独立!
#
# 贝叶斯网络:
#   联合分布 = ∏P(xᵢ|parents(xᵢ))
#   每个节点在给定父节点下, 与非后代条件独立

# ═══ 链式法则 (Chain Rule) ═══
# P(A₁∩A₂∩...∩Aₙ) = P(A₁)·P(A₂|A₁)·P(A₃|A₁,A₂)·...
#
# GPT 的自回归生成就是链式法则:
# P(w₁,...,wₙ) = P(w₁)·P(w₂|w₁)·P(w₃|w₁,w₂)·...
# → 逐个 token 生成, 每次条件概率!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧠 贝叶斯公式 — 逆概率推断</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> bayes_theorem</div>
                <pre className="fs-code">{`# Bayes' Theorem: 从结果推原因

# ═══ 贝叶斯公式 ═══
#              P(B|A) · P(A)
# P(A|B) = ─────────────────
#                P(B)
#
# 各部分含义:
# P(A|B) = 后验 (Posterior)   — 看到证据B后对A的信念
# P(B|A) = 似然 (Likelihood)  — 假设A为真时观察到B的概率
# P(A)   = 先验 (Prior)       — 对A的初始信念
# P(B)   = 证据 (Evidence)    — 归一化常数
#
# 贝叶斯的核心思想:
# 后验 ∝ 似然 × 先验
# → 旧知识(先验) + 新数据(似然) = 更新后的知识(后验)

import numpy as np
import matplotlib
# matplotlib.use('Agg')

# ═══ 实例: 垃圾邮件分类 (朴素贝叶斯) ═══
# 词汇表: ["免费", "优惠", "会议", "报告"]
# 训练数据统计:
#   P(spam) = 0.4,  P(ham) = 0.6
#   P("免费"|spam) = 0.8,  P("免费"|ham) = 0.1
#   P("会议"|spam) = 0.1,  P("会议"|ham) = 0.7

p_spam = 0.4
p_ham = 0.6

# 收到邮件包含 "免费":
p_free_given_spam = 0.8
p_free_given_ham = 0.1

# P(spam|"免费") = P("免费"|spam)·P(spam) / P("免费")
p_free = p_free_given_spam * p_spam + p_free_given_ham * p_ham
p_spam_given_free = (p_free_given_spam * p_spam) / p_free
print(f"P(spam|'免费') = {p_spam_given_free:.4f}")
# 0.8421 → 收到"免费"后, 84%概率是垃圾邮件

# 继续收到 "会议":
p_meet_given_spam = 0.1
p_meet_given_ham = 0.7

# 用上一步的后验作为新的先验! (贝叶斯更新)
new_prior_spam = p_spam_given_free  # 0.8421
new_prior_ham = 1 - new_prior_spam

p_meet = p_meet_given_spam * new_prior_spam + p_meet_given_ham * new_prior_ham
p_spam_final = (p_meet_given_spam * new_prior_spam) / p_meet
print(f"P(spam|'免费','会议') = {p_spam_final:.4f}")
# ≈ 0.4324 → "会议"这个词拉低了垃圾邮件概率

# ═══ 贝叶斯更新的蒙特卡洛模拟 ═══
# 估计一枚硬币的偏差
# 先验: θ ~ Beta(2, 2)  (认为大概公平)
# 数据: 抛 10 次, 7 次正面

from scipy import stats

# 先验参数
alpha_prior, beta_prior = 2, 2

# 观测数据
n_heads, n_tails = 7, 3

# 后验 (Beta-Binomial 共轭):
# Beta(α_prior + n_heads, β_prior + n_tails)
alpha_post = alpha_prior + n_heads  # 9
beta_post = beta_prior + n_tails    # 5

prior = stats.beta(alpha_prior, beta_prior)
posterior = stats.beta(alpha_post, beta_post)

theta = np.linspace(0, 1, 1000)
print(f"先验均值: {prior.mean():.4f}")      # 0.5000
print(f"后验均值: {posterior.mean():.4f}")    # 0.6429
print(f"MLE 估计: {n_heads/(n_heads+n_tails):.4f}")  # 0.7000
# 后验均值在先验和MLE之间 → 贝叶斯收缩!

# ═══ AI 中的贝叶斯思想 ═══
# 1. 正则化 = 先验约束
#    L2 正则 ←→ 高斯先验 N(0, σ²)
#    L1 正则 ←→ 拉普拉斯先验
#    Dropout  ←→ 近似贝叶斯推断
#
# 2. GPT 的 next-token prediction:
#    P(wₜ|w₁,...,wₜ₋₁) = softmax(logits)
#    Temperature 采样 → 控制后验的锐度
#
# 3. Diffusion Model:
#    q(xₜ|xₜ₋₁) = 前向扩散 (加噪)
#    p(xₜ₋₁|xₜ) = 反向去噪 (贝叶斯后验)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔢 组合计数与概率</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> combinatorics</div>
                <pre className="fs-code">{`# 组合计数: 概率计算的基础工具

# ═══ 四大计数原理 ═══
# ┌──────────┬────────┬─────────┬───────────┐
# │          │ 有序   │ 无序    │ 公式       │
# ├──────────┼────────┼─────────┼───────────┤
# │ 不放回   │ 排列   │ 组合    │ P(n,k)    │
# │          │ A(n,k) │ C(n,k)  │ n!/(n-k)! │
# │          │        │         │ C=P/k!    │
# ├──────────┼────────┼─────────┼───────────┤
# │ 有放回   │ n^k    │ C(n+k-1,│ 多重集    │
# │          │        │   k)    │           │
# └──────────┴────────┴─────────┴───────────┘

import numpy as np
from math import comb, factorial, perm

# ═══ 排列 (Permutation) ═══
# 从 n 个不同元素中取 k 个, 有序排列
# P(n,k) = n! / (n-k)!
print(f"P(5,3) = {perm(5,3)}")  # 60

# 应用: 密码组合
# 4位数密码 (0-9不重复): P(10,4) = 5040
print(f"4位不重复密码: {perm(10,4)} 种")

# ═══ 组合 (Combination) ═══
# C(n,k) = n! / (k! · (n-k)!)
# "n 选 k" = "从 n 个中挑 k 个, 不管顺序"
print(f"C(52,5) = {comb(52,5)}")  # 扑克牌52选5 = 2598960

# 经典问题: 生日悖论
# n 个人中至少两人同天生日的概率
def birthday_paradox(n, days=365):
    # P(无人同天) = 365/365 × 364/365 × ... × (365-n+1)/365
    p_no_match = 1.0
    for i in range(n):
        p_no_match *= (days - i) / days
    return 1 - p_no_match

for n in [10, 23, 50, 70]:
    print(f"{n:>3}人: P(至少两人同天) = {birthday_paradox(n):.4f}")
# 10人: 0.1169
# 23人: 0.5073  ← 仅23人就超过50%!
# 50人: 0.9704
# 70人: 0.9992

# 💡 生日悖论在密码学中的应用:
# Hash 碰撞: 2^128 位 hash, 约 2^64 次尝试就有50%碰撞概率

# ═══ 多项式系数 ═══
# n 个元素分成 k 组 (n₁, n₂, ..., nₖ 个)
# 方案数 = n! / (n₁! · n₂! · ... · nₖ!)

# 例: MISSISSIPPI 有多少种排列?
# M=1, I=4, S=4, P=2, 总11个字母
arrangements = factorial(11) // (factorial(1) * factorial(4) * factorial(4) * factorial(2))
print(f"MISSISSIPPI 排列数: {arrangements}")  # 34650

# ═══ Monte Carlo 验证 ═══
# 从 52 张牌抽 5 张, P(同花) = ?
# 同花: 5张花色相同
# C(4,1)·C(13,5) / C(52,5) - 同花顺
flush_count = 4 * comb(13, 5)
total = comb(52, 5)
p_flush_exact = flush_count / total
print(f"P(同花,含顺) = {p_flush_exact:.6f}")
# 0.001981 ≈ 0.20%

# MC 验证
N = 1000000
deck = np.arange(52)
flush_mc = 0
for _ in range(N):
    hand = np.random.choice(deck, 5, replace=False)
    suits = hand // 13  # 花色: 0,1,2,3
    if len(set(suits)) == 1:
        flush_mc += 1
print(f"MC 模拟 P(同花) = {flush_mc/N:.6f}")  # ≈ 0.001981

# ═══ AI 中的组合计数 ═══
# 1. Transformer Attention:
#    n 个 token → n² 个注意力权重
#    计算量 O(n²·d) → 组合爆炸!
#
# 2. 搜索空间:
#    围棋: ~361! / (181!·180!) 种局面 ≈ 10^170
#    → 为什么需要 AlphaGo 的 MCTS 蒙特卡洛搜索
#
# 3. 组合优化:
#    TSP: n 个城市 → (n-1)!/2 条路线
#    n=20 → ~10^17 → 暴力不可能!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
