import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['自信息', '香农熵', '联合熵与条件熵', '熵的性质'];

export default function LessonEntropy() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📡 module_01 — 信息与熵</div>
      <div className="fs-hero">
        <h1>信息与熵：自信息 / 香农熵 / 联合熵 / 条件熵</h1>
        <p>
          信息论的核心问题是<strong>"不确定性如何量化"</strong>——
          香农 (Claude Shannon, 1948) 用<strong>熵 (Entropy)</strong> 给出了优美的答案。
          熵不仅是通信的理论极限，更是机器学习、数据压缩、密码学的数学基石。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📡 信息与熵深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 自信息 (Self-Information)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> self_information.txt</div>
                <pre className="fs-code">{`═══ 信息的直觉 ═══

  "太阳从东方升起" → 不意外 → 信息量低
  "北京下了陨石雨" → 超意外 → 信息量高

  信息量 ∝ 惊讶程度 ∝ 1/概率

═══ 自信息定义 ═══

  事件 x 的自信息:
  
  I(x) = -log₂ P(x) = log₂(1/P(x))    [单位: bit]

  对数底数:
  • log₂  → bit  (计算机最常用)
  • logₑ  → nat  (自然单位, 信息论理论推导)
  • log₁₀ → hartley/dit

═══ 自信息的性质 ═══

  1. I(x) ≥ 0         (信息量非负)
  2. P(x) = 1 → I(x) = 0   (确定事件无信息)
  3. P(x) → 0 → I(x) → ∞  (不可能事件信息无穷)
  4. I(x,y) = I(x) + I(y)   (独立事件信息可加!)

═══ 直觉例子 ═══

  事件                │ 概率 P(x)  │ 自信息 I(x)
  ────────────────────┼────────────┼─────────────
  抛硬币得正面        │ 1/2        │ 1 bit
  掷骰子得 6          │ 1/6        │ 2.585 bit
  26 字母中选中 'z'   │ 1/26       │ 4.700 bit
  彩票中大奖          │ 1/10⁷      │ 23.25 bit
  必然事件            │ 1          │ 0 bit

  Python:
  import math
  def self_info(p):
      return -math.log2(p)
  
  self_info(0.5)   # 1.0 bit
  self_info(1/6)   # 2.585 bit
  self_info(1/26)  # 4.700 bit

═══ 为什么用对数？ ═══

  需求:
  1. 概率越小 → 信息越大 (单调递减)
  2. 独立事件信息可加: I(xy) = I(x) + I(y)
  3. 非负: I(x) ≥ 0
  
  唯一满足这三个条件的函数: I(x) = -log P(x)!
  
  证明: f(P(x)·P(y)) = f(P(x)) + f(P(y))
        → f 是对数函数 (Cauchy 方程的连续解)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎲 香农熵 (Shannon Entropy)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> shannon_entropy.txt</div>
                <pre className="fs-code">{`═══ 香农熵定义 ═══

  离散随机变量 X ~ P(x) 的熵:

  H(X) = -Σ P(x) log₂ P(x) = E[I(X)]
  
  = E[-log₂ P(X)]   (自信息的期望!)

  约定: 0·log(0) = 0 (取极限)

═══ 核心计算 ═══

  例1: 公平硬币 X ∈ {H, T}, P(H) = P(T) = 1/2
  
  H(X) = -(1/2)log₂(1/2) - (1/2)log₂(1/2)
       = -(1/2)(-1) - (1/2)(-1) = 1 bit  ← 最大不确定性!

  例2: 不公平硬币 P(H) = 0.9, P(T) = 0.1
  
  H(X) = -(0.9)log₂(0.9) - (0.1)log₂(0.1)
       = 0.137 + 0.332 = 0.469 bit  ← 不确定性降低!

  例3: 确定硬币 P(H) = 1, P(T) = 0
  
  H(X) = 0 bit  ← 完全确定!

═══ 二元熵函数 ═══

  H(p) = -p·log₂(p) - (1-p)·log₂(1-p)

  p  │  H(p)
  ───┼──────
  0  │  0      (确定: 总是 T)
  0.1│  0.469
  0.3│  0.881
  0.5│  1.000  ← 最大值!
  0.7│  0.881
  0.9│  0.469
  1  │  0      (确定: 总是 H)

  → 对称钟形曲线, p=0.5 时最大

═══ 均匀分布熵最大 ═══

  定理: 对于取 n 个值的离散 RV:
  
  H(X) ≤ log₂(n)
  
  等号成立 ⟺ X 是均匀分布!

  例:
  • 公平骰子: H = log₂(6) = 2.585 bit
  • 26 字母均匀: H = log₂(26) = 4.700 bit
  • 英文文本: H ≈ 1.0 ~ 1.5 bit/letter (远低于 4.7!)
    → 英文有大量冗余 → 可压缩!

═══ Python 计算 ═══

  import numpy as np
  
  def entropy(probs):
      probs = np.array(probs)
      probs = probs[probs > 0]  # 过滤掉 0
      return -np.sum(probs * np.log2(probs))
  
  # 公平硬币
  entropy([0.5, 0.5])     # 1.0
  
  # 公平骰子
  entropy([1/6]*6)         # 2.585
  
  # 英文字母频率
  freq = [0.082, 0.015, 0.028, 0.043, ...]
  entropy(freq)            # ≈ 4.176 (< 4.700)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 联合熵与条件熵</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> joint_conditional.txt</div>
                <pre className="fs-code">{`═══ 联合熵 (Joint Entropy) ═══

  H(X, Y) = -Σ_x Σ_y P(x,y) log₂ P(x,y)

  两个随机变量组合的总不确定性

  性质:
  • H(X,Y) ≤ H(X) + H(Y)           (次可加性)  
  • 等号成立 ⟺ X, Y 独立!
  • H(X,Y) ≥ max(H(X), H(Y))      (至少和单个一样多)

═══ 条件熵 (Conditional Entropy) ═══

  H(Y|X) = Σ_x P(x) H(Y|X=x)
         = -Σ_x Σ_y P(x,y) log₂ P(y|x)

  "已知 X 后，Y 剩余的不确定性"

  性质:
  • H(Y|X) ≥ 0
  • H(Y|X) ≤ H(Y)               (条件减少不确定性!)
  • H(Y|X) = 0 ⟺ Y = f(X)      (Y 由 X 完全决定)
  • H(Y|X) = H(Y) ⟺ X,Y 独立   (知道 X 对 Y 无帮助)

═══ 链式法则 (Chain Rule) ═══

  H(X, Y) = H(X) + H(Y|X) = H(Y) + H(X|Y)

  推广:
  H(X₁, X₂, ..., Xₙ) = Σᵢ H(Xᵢ | X₁, ..., Xᵢ₋₁)

  直觉: 联合不确定性 = 第一个的不确定性
                      + 已知第一个后第二个的不确定性

═══ Venn 图理解 ═══

  ┌───────────────────────────┐
  │         H(X,Y)            │
  │  ┌──────┬──────┐          │
  │  │ H(X) │      │          │
  │  │      │ I(X;Y)│         │
  │  │      │      │ H(Y)    │
  │  └──────┴──────┘          │
  └───────────────────────────┘

  H(X,Y) = H(X) + H(Y) - I(X;Y)
  H(Y|X) = H(Y) - I(X;Y) = H(X,Y) - H(X)

═══ 例子: 天气与穿衣 ═══

  X = 天气 {晴, 雨}, P(晴)=0.7, P(雨)=0.3
  Y = 穿衣 {短袖, 雨衣}

  联合分布:
           │ 短袖  │ 雨衣
  ─────────┼───────┼──────
  晴       │ 0.63  │ 0.07
  雨       │ 0.03  │ 0.27

  H(X) = H(0.7) = 0.881 bit
  H(Y) = H(0.66) = 0.930 bit
  H(X,Y) = -(0.63·log₂0.63 + 0.07·log₂0.07 
            + 0.03·log₂0.03 + 0.27·log₂0.27)
         = 1.245 bit

  H(Y|X) = H(X,Y) - H(X) = 1.245 - 0.881 = 0.364 bit
  
  → 知道天气后，穿衣的不确定性从 0.930 降到 0.364!
  → I(X;Y) = H(Y) - H(Y|X) = 0.930 - 0.364 = 0.566 bit`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 熵的性质</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> entropy_properties.txt</div>
                <pre className="fs-code">{`═══ 熵的核心性质 ═══

  1. 非负性:      H(X) ≥ 0
  2. 最大值:      H(X) ≤ log₂|X| (均匀分布取等)
  3. 条件减少:    H(X|Y) ≤ H(X)   (信息不会增加不确定性!)
  4. 链式法则:    H(X,Y) = H(X) + H(Y|X)
  5. 次可加性:    H(X,Y) ≤ H(X) + H(Y)
  6. 凹性:        H(λp₁ + (1-λ)p₂) ≥ λH(p₁) + (1-λ)H(p₂)

═══ Gibbs 不等式 ═══

  H(P) ≤ H(P, Q) = -Σ P(x) log Q(x)    (交叉熵)

  等价形式: D_KL(P || Q) ≥ 0

  → 用错误分布 Q 编码 P 的代价 ≥ 用正确分布 P 编码
  → 这就是交叉熵损失函数的理论基础!

═══ 微分熵 (连续变量) ═══

  h(X) = -∫ f(x) log₂ f(x) dx

  注意: 微分熵可以为负!

  常见分布的微分熵:
  ───────────────────────────────────
  均匀 U(a,b):   h = log₂(b-a)
  高斯 N(μ,σ²):  h = (1/2)log₂(2πeσ²)
  指数 Exp(λ):   h = log₂(e/λ) = 1+log₂(1/λ)

  定理: 给定方差 σ², 微分熵最大的分布是高斯分布!
  
  h(X) ≤ (1/2)log₂(2πeσ²)

  → 这就是为什么高斯假设在信息论中如此重要

═══ 信息论不等式汇总 ═══

  不等式                 │ 含义
  ───────────────────────┼─────────────────────────
  I(X;Y) ≥ 0           │ 互信息非负
  H(X|Y) ≤ H(X)        │ 条件减少熵
  H(X,Y) ≤ H(X)+H(Y)  │ 次可加性
  D(P||Q) ≥ 0          │ KL 散度非负 (Gibbs)
  H(X) ≤ log|X|        │ 均匀分布最大
  I(X;Y) ≤ H(X)        │ 互信息有上界
  H(f(X)) ≤ H(X)       │ 数据处理不等式(函数版)
  H(X₁,...,Xₙ) ≤ ΣH(Xᵢ)│ 独立时等号

═══ 编码理论联系 ═══

  香农第一定理 (无损信源编码):
  
  编码 X 的最小平均码长 ≥ H(X)
  
  即: 你不可能把信息压缩到比熵更短!
  
  更精确: H(X) ≤ L* < H(X) + 1
  
  其中 L* 是最优前缀码的平均码长
  
  Huffman 编码达到这个下界!

═══ 应用全景 ═══

  领域         │ 熵的角色
  ─────────────┼──────────────────────────
  数据压缩     │ 压缩极限 = 熵率
  通信         │ 信道容量 = 最大互信息
  ML 损失函数  │ 交叉熵 = H(P) + D_KL(P||Q)
  特征选择     │ 最大互信息准则
  物理学       │ 热力学第二定律 (熵增)
  密码学       │ 密钥熵 = 安全强度
  语言学       │ 语言的冗余度 = 1 - H/log|A|`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
