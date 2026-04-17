import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['假设检验框架', 'A/B 测试实战', 'KL 散度', '交叉熵与互信息'];

export default function LessonHypothesisInfo() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎲 module_07 — 假设检验与信息论</div>
      <div className="fs-hero">
        <h1>假设检验与信息论：决策与信息的数学</h1>
        <p>
          <strong>假设检验</strong>回答「两组数据有没有显著差异」——这是 A/B 测试的数学基础。
          <strong>信息论</strong>则量化「信息量」和「分布差异」——KL 散度是 VAE 的 Loss 组成部分，
          交叉熵是分类任务的标准 Loss，互信息是特征选择和表示学习的核心度量。
          本模块将两个领域统一在概率论的框架下。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 检验与信息</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 假设检验框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> hypothesis_testing</div>
                <pre className="fs-code">{`# 假设检验: 用数据做决策的形式化方法

# ═══ 基本框架 ═══
# H₀: 零假设 (现状/无效果)
# H₁: 备择假设 (我们想证明的)
#
# 决策:
# ┌──────────┬──────────┬──────────┐
# │          │ H₀ 为真  │ H₁ 为真  │
# ├──────────┼──────────┼──────────┤
# │ 接受 H₀  │ ✅ 正确  │ ❌ Type II│
# │ 拒绝 H₀  │ ❌ Type I│ ✅ 正确  │
# └──────────┴──────────┴──────────┘
#
# α = P(Type I Error) = P(拒绝H₀|H₀真) = 显著性水平
# β = P(Type II Error) = P(接受H₀|H₁真)
# Power = 1 - β = P(拒绝H₀|H₁真) = 检验功效

import numpy as np
from scipy import stats

# ═══ Z 检验 (大样本) ═══
# H₀: μ = μ₀
# H₁: μ ≠ μ₀ (双侧) 或 μ > μ₀ (单侧)
# 检验统计量: Z = (X̄ - μ₀) / (σ/√n)
# 拒绝域: |Z| > z_{α/2}

np.random.seed(42)
data = np.random.normal(102, 15, 100)  # 真实 μ=102
mu_0 = 100  # 零假设
sigma = 15  # 已知标准差

x_bar = data.mean()
z_stat = (x_bar - mu_0) / (sigma / np.sqrt(len(data)))
p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
print(f"Z 检验: Z={z_stat:.4f}, p-value={p_value:.4f}")
print(f"α=0.05: {'拒绝 H₀' if p_value < 0.05 else '不拒绝 H₀'}")

# ═══ t 检验 (小样本/σ未知) ═══
# t = (X̄ - μ₀) / (s/√n),  df = n-1
data_small = np.random.normal(105, 10, 25)
t_stat, p_val_t = stats.ttest_1samp(data_small, 100)
print(f"\\nt 检验: t={t_stat:.4f}, p-value={p_val_t:.4f}")

# ═══ 双样本 t 检验 ═══
# H₀: μ_A = μ_B (两组没有差异)
group_A = np.random.normal(50, 8, 40)
group_B = np.random.normal(55, 8, 40)
t2, p2 = stats.ttest_ind(group_A, group_B)
print(f"\\n双样本 t: t={t2:.4f}, p={p2:.4f}")
cohen_d = (group_B.mean() - group_A.mean()) / np.sqrt(
    (group_A.var() + group_B.var()) / 2)
print(f"Cohen's d = {cohen_d:.4f} (效应量)")

# ═══ p 值的正确理解 ═══
# p 值 = P(观测到的或更极端的结果 | H₀ 为真)
# p 值 ≠ P(H₀ 为真)!  ← 常见误解
# p 值 ≠ 效应大小!     ← 小 p 不等于大效应
#
# 好的实践:
# 1. 报告效应量 (Cohen's d, 差异大小)
# 2. 报告置信区间 (不只是 p 值)
# 3. 多重比较校正 (Bonferroni/FDR)
# 4. 预注册实验 (避免 p-hacking)

# ═══ 多重检验问题 ═══
# 同时做 20 个检验, 至少一个 p<0.05 的概率:
p_at_least_one = 1 - (1 - 0.05)**20
print(f"\\n20个检验至少一个假阳性: P={p_at_least_one:.4f}")  # 0.6415!

# Bonferroni 校正: α_adj = α / m
m = 20
alpha_bonf = 0.05 / m
print(f"Bonferroni 校正: α_adj = {alpha_bonf:.4f}")

# FDR (Benjamini-Hochberg): 控制假发现率
# → 现代 genomics 和 AB 测试的标准方法`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧪 A/B 测试 — 互联网实验的统计学</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> ab_testing</div>
                <pre className="fs-code">{`# A/B 测试: 数据驱动决策的核心方法论

# ═══ 完整 A/B 测试流量 ═══
# 1. 提出假设: 新按钮颜色提高转化率
# 2. 设计实验: 确定样本量, 分流比例
# 3. 运行实验: 收集数据
# 4. 分析结果: 统计检验
# 5. 做出决策: 上线/不上线

import numpy as np
from scipy import stats

# ═══ 样本量计算 (实验设计的第一步!) ═══
# 参数:
#   α = 0.05 (显著性水平)
#   β = 0.20 (Type II 错误率, 即 power=80%)
#   p₁ = 0.10 (对照组转化率)
#   δ = 0.02  (最小可检测效应 MDE)
#   p₂ = p₁ + δ = 0.12

def sample_size_two_prop(p1, p2, alpha=0.05, power=0.80):
    """双比例 Z 检验的样本量计算"""
    z_alpha = stats.norm.ppf(1 - alpha/2)
    z_beta = stats.norm.ppf(power)
    p_bar = (p1 + p2) / 2
    
    n = ((z_alpha * np.sqrt(2*p_bar*(1-p_bar)) +
          z_beta * np.sqrt(p1*(1-p1) + p2*(1-p2)))**2) / (p2-p1)**2
    return int(np.ceil(n))

n_per_group = sample_size_two_prop(0.10, 0.12)
print(f"每组需要样本量: {n_per_group}")
print(f"总流量: {2 * n_per_group}")

# ═══ 模拟 A/B 测试 ═══
np.random.seed(42)
n_A = n_B = 5000

# 对照组: 10% 转化率
# 实验组: 12% 转化率 (提升 20%)
conversions_A = np.random.binomial(1, 0.10, n_A)
conversions_B = np.random.binomial(1, 0.12, n_B)

p_A = conversions_A.mean()
p_B = conversions_B.mean()
lift = (p_B - p_A) / p_A * 100

print(f"\\n对照组转化率: {p_A:.4f}")
print(f"实验组转化率: {p_B:.4f}")
print(f"相对提升: {lift:.1f}%")

# ═══ 显著性检验 ═══
# 方法1: Z 检验
p_pool = (conversions_A.sum() + conversions_B.sum()) / (n_A + n_B)
se = np.sqrt(p_pool * (1 - p_pool) * (1/n_A + 1/n_B))
z = (p_B - p_A) / se
p_value = 2 * (1 - stats.norm.cdf(abs(z)))
print(f"\\nZ = {z:.4f}, p-value = {p_value:.4f}")
print(f"{'显著!' if p_value < 0.05 else '不显著'}")

# 方法2: 卡方检验
contingency = np.array([
    [conversions_A.sum(), n_A - conversions_A.sum()],
    [conversions_B.sum(), n_B - conversions_B.sum()]
])
chi2, p_chi, _, _ = stats.chi2_contingency(contingency)
print(f"χ² = {chi2:.4f}, p-value = {p_chi:.4f}")

# 方法3: 置信区间
diff = p_B - p_A
se_diff = np.sqrt(p_A*(1-p_A)/n_A + p_B*(1-p_B)/n_B)
ci = (diff - 1.96*se_diff, diff + 1.96*se_diff)
print(f"差值 95% CI: ({ci[0]:.4f}, {ci[1]:.4f})")

# ═══ 贝叶斯 A/B 测试 ═══
# 频率派: "p < 0.05 所以显著"
# 贝叶斯: "B 比 A 好的概率是 P(pB > pA | data)"

# Beta 后验
post_A = stats.beta(1 + conversions_A.sum(), 1 + n_A - conversions_A.sum())
post_B = stats.beta(1 + conversions_B.sum(), 1 + n_B - conversions_B.sum())

# Monte Carlo 估计 P(B > A)
samples_A = post_A.rvs(100000)
samples_B = post_B.rvs(100000)
prob_B_better = np.mean(samples_B > samples_A)
expected_loss = np.mean(np.maximum(samples_A - samples_B, 0))
print(f"\\n贝叶斯 P(B>A) = {prob_B_better:.4f}")
print(f"如果选 B 的期望损失 = {expected_loss:.6f}")

# ═══ 常见陷阱 ═══
# 1. Peeking: 中途看结果 → 膨胀 Type I 错误
#    → 用 Sequential Testing 或 Always Valid p-values
# 2. 辛普森悖论: 子群结论与整体矛盾
# 3. 新奇效应: 用户对新功能的短期反应
# 4. 网络效应: 用户之间不独立 (社交产品)
# 5. 多目标: 提升转化但伤害留存`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📏 KL 散度 — 分布之间的距离</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> kl_divergence</div>
                <pre className="fs-code">{`# KL 散度: 信息论中最核心的概念之一

# ═══ 定义 ═══
# 离散: KL(P ‖ Q) = Σ P(x) · log(P(x)/Q(x))
# 连续: KL(P ‖ Q) = ∫ p(x) · log(p(x)/q(x)) dx
#
# 直觉: 用 Q 来编码 P 产生的数据, 多花了多少比特
# → KL ≥ 0 (Gibbs 不等式)
# → KL = 0 ←→ P = Q (almost everywhere)
# ⚠️ KL 不对称: KL(P‖Q) ≠ KL(Q‖P)

import numpy as np
from scipy import stats
from scipy.special import kl_div, rel_entr

# ═══ 离散 KL 散度 ═══
P = np.array([0.4, 0.3, 0.2, 0.1])
Q = np.array([0.25, 0.25, 0.25, 0.25])  # 均匀分布

kl_pq = np.sum(P * np.log(P / Q))
kl_qp = np.sum(Q * np.log(Q / P))
print(f"KL(P‖Q) = {kl_pq:.4f}")  # 前向 KL
print(f"KL(Q‖P) = {kl_qp:.4f}")  # 反向 KL
print(f"不对称: {abs(kl_pq - kl_qp):.4f}")

# ═══ 两种 KL 的行为差异 ═══
# KL(P‖Q): 前向 KL, "mean-seeking"
#   → Q 必须在 P 非零的地方也非零
#   → 低估 P 的峰值没关系, 但不能给零概率区域
#   → 用在 MLE/交叉熵
#
# KL(Q‖P): 反向 KL, "mode-seeking"  
#   → Q 倾向集中在 P 的一个峰上
#   → 遗漏 P 的某些峰值没关系
#   → 用在 VI (变分推断)

# ═══ 高斯之间的 KL (解析解) ═══
# KL(N(μ₁,σ₁²) ‖ N(μ₂,σ₂²)) =
# log(σ₂/σ₁) + (σ₁² + (μ₁-μ₂)²)/(2σ₂²) - 1/2

def kl_gaussian(mu1, s1, mu2, s2):
    return np.log(s2/s1) + (s1**2 + (mu1-mu2)**2)/(2*s2**2) - 0.5

# VAE 的 KL 项: KL(N(μ,σ²) ‖ N(0,1))
for mu, sigma in [(0, 1), (1, 1), (0, 2), (2, 0.5)]:
    kl = kl_gaussian(mu, sigma, 0, 1)
    print(f"KL(N({mu},{sigma}²) ‖ N(0,1)) = {kl:.4f}")
# (0,1) → 0.0 (完全匹配)
# (1,1) → 0.5 (均值偏移)
# (0,2) → 0.443 (方差过大)
# (2,0.5) → 2.347 (又偏又窄)

# ═══ KL 散度在 AI 中的应用 ═══
#
# 1. VAE Loss = 重构 + KL
#    L = E_q[-log p(x|z)] + KL(q(z|x) ‖ p(z))
#    KL 项 → 让隐空间接近标准正态
#
# 2. 知识蒸馏 (Knowledge Distillation):
#    L = KL(p_teacher ‖ p_student)
#    学生模型逼近教师模型的输出分布
#
# 3. PPO 的约束:
#    max E[Aᵗ] s.t. KL(π_new ‖ π_old) < ε
#    → 策略更新不能离旧策略太远
#
# 4. PAC-Bayes 泛化界:
#    泛化误差 ≤ O(√(KL(q‖p)/n))
#    → KL 越小, 泛化越好 → 正则化!
#
# 5. Diffusion Model:
#    L = Σ KL(q(xₜ₋₁|xₜ,x₀) ‖ pθ(xₜ₋₁|xₜ))
#    每步去噪的 KL → 简化为 MSE 噪声预测`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 交叉熵、熵与互信息</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> entropy_cross_entropy_mi</div>
                <pre className="fs-code">{`# 信息论三剑客: 熵、交叉熵、互信息

# ═══ 熵 (Entropy) ═══
# H(X) = -Σ P(x) · log₂ P(x)  (单位: bits)
#       = E[-log P(X)]
# 直觉: "不确定性" / "平均信息量" / "最短编码长度"
#
# H 越大 → 越不确定 → 越难预测

import numpy as np

def entropy(p):
    p = p[p > 0]  # 去掉零概率
    return -np.sum(p * np.log2(p))

# 不同分布的熵
print("═══ 熵的比较 ═══")
print(f"确定: H={entropy(np.array([1,0,0,0])):.4f} bits")      # 0
print(f"偏斜: H={entropy(np.array([0.7,0.1,0.1,0.1])):.4f} bits")
print(f"均匀: H={entropy(np.array([0.25,0.25,0.25,0.25])):.4f} bits")  # 2.0
# 均匀分布有最大熵! (最大不确定性)

# ═══ 交叉熵 (Cross-Entropy) ═══
# H(P, Q) = -Σ P(x) · log Q(x)
#          = H(P) + KL(P ‖ Q)
# 直觉: 用 Q 的编码方式来编码 P → 平均码长
#
# 性质: H(P, Q) ≥ H(P) (当且仅当 P=Q 取等)
# → 最小化交叉熵 = 最小化 KL 散度 (H(P) 是常数)

def cross_entropy(p, q):
    return -np.sum(p * np.log(q + 1e-10))

# ═══ 分类任务: 交叉熵 Loss ═══
y_true = np.array([0, 0, 1, 0, 0])  # one-hot: class 2
y_pred = np.array([0.05, 0.1, 0.7, 0.1, 0.05])  # softmax output

ce_loss = cross_entropy(y_true, y_pred)
print(f"\\n交叉熵 Loss = {ce_loss:.4f}")
print(f"等价于 -log(p_correct) = {-np.log(0.7):.4f}")

# → Cross-Entropy Loss 就是 NLL (负对数似然)!
# minimize CE = maximize log-likelihood
# → 分类训练的 Loss 完全来自信息论

# ═══ Binary Cross-Entropy ═══
# BCE(y, p) = -[y·log(p) + (1-y)·log(1-p)]
# → 二分类 / 逻辑回归 / Sigmoid 输出

y = np.array([1, 0, 1, 1, 0])
p = np.array([0.9, 0.2, 0.8, 0.6, 0.1])
bce = -np.mean(y * np.log(p) + (1-y) * np.log(1-p))
print(f"BCE = {bce:.4f}")

# ═══ 互信息 (Mutual Information) ═══
# I(X; Y) = H(X) - H(X|Y)
#          = H(Y) - H(Y|X)
#          = KL(P(X,Y) ‖ P(X)·P(Y))
#          = H(X) + H(Y) - H(X,Y)
#
# 直觉: "知道 Y 后, 对 X 的不确定性减少了多少"
# I = 0: X, Y 独立
# I > 0: X, Y 有依赖关系

# 例: 联合分布
P_XY = np.array([[0.3, 0.1],
                 [0.1, 0.5]])
P_X = P_XY.sum(axis=1)
P_Y = P_XY.sum(axis=0)
P_independent = np.outer(P_X, P_Y)

MI = np.sum(P_XY * np.log2(P_XY / (P_independent + 1e-10) + 1e-10))
print(f"\\nI(X;Y) = {MI:.4f} bits")
print(f"H(X)   = {entropy(P_X):.4f} bits")
print(f"H(Y)   = {entropy(P_Y):.4f} bits")

# ═══ AI 中的信息论应用 ═══
# 1. InfoNCE Loss (对比学习):
#    下界估计互信息 I(x; z)
#    → SimCLR, CLIP 的训练目标
#
# 2. 信息瓶颈:
#    max I(T; Y) - β·I(T; X)
#    → DNN 表示 = 压缩输入、保留标签信息
#
# 3. Label Smoothing:
#    交叉熵 + KL(uniform ‖ pred) 的混合
#    → 防止模型过度自信
#
# 4. Perplexity (困惑度):
#    PPL = 2^H(P,Q) = 2^{CE}
#    → GPT 的核心评估指标!
#    PPL=10 → 平均每个token有10种等可能选择

# 计算困惑度
ce_per_token = 2.5  # 假设平均交叉熵
ppl = 2 ** ce_per_token
print(f"\\nCE={ce_per_token} → Perplexity={ppl:.1f}")`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
