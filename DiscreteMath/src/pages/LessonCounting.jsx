import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['排列与组合', '二项式定理', '容斥原理', '递推计数'];

export default function LessonCounting() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔢 module_04 — 计数与组合</div>
      <div className="fs-hero">
        <h1>计数与组合：排列 / 组合 / 容斥原理</h1>
        <p>
          组合数学是算法设计的核心工具——
          <strong>排列</strong>与<strong>组合</strong>解决"有多少种方式"，
          <strong>二项式定理</strong>连接代数与组合，
          <strong>容斥原理</strong>处理复杂的交集计数问题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 计数与组合深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎲 排列与组合</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> permutations.txt</div>
                <pre className="fs-code">{`═══ 基本计数原理 ═══

  加法原理: 做事有 n 类方式, 第 i 类有 aᵢ 种
            总数 = a₁ + a₂ + ... + aₙ
            (互斥事件!)

  乘法原理: 做事分 n 步, 第 i 步有 aᵢ 种选择
            总数 = a₁ × a₂ × ... × aₙ
            (独立步骤!)

═══ 排列 (Permutation) ═══

  从 n 个不同元素取 r 个, 有序排列

  P(n,r) = n! / (n-r)!

  P(5,3) = 5! / 2! = 60
  P(n,n) = n!  (全排列)

  例: 5 人中选 3 人排队 → P(5,3) = 60 种
      26 字母选 3 个不重复密码 → P(26,3) = 15,600

  可重复排列: n 个位置, 每个有 k 种选择 → kⁿ
  例: 4 位 PIN (0-9) → 10⁴ = 10,000 种

═══ 组合 (Combination) ═══

  从 n 个不同元素取 r 个, 无序子集

  C(n,r) = n! / (r! · (n-r)!)
         = P(n,r) / r!

  C(5,3) = 10   (比 P(5,3)=60 少了 3!=6 倍)

  基本恒等式:
    C(n,r) = C(n, n-r)          (对称性)
    C(n,0) = C(n,n) = 1
    C(n,1) = C(n,n-1) = n
    C(n,r) = C(n-1,r-1) + C(n-1,r)  (Pascal 三角!)

═══ 多重集合排列与组合 ═══

# ─── 有重复元素的排列 ───
  n 个元素, 第 i 类有 nᵢ 个 (n₁+n₂+...+nₖ = n)
  
  排列数 = n! / (n₁! · n₂! · ... · nₖ!)

  例: "MISSISSIPPI" 的排列
  = 11! / (1!·4!·4!·2!) = 34,650

# ─── 多重集合组合 (可重复选择) ───
  从 k 类物品中选 r 个 (每类无限供应!)
  
  = C(r + k - 1, r) = C(r + k - 1, k - 1)

  例: 3 种水果选 5 个 → C(7, 5) = 21
  (隔板法: ★★|★★★| → 2 个苹果 3 个橙子 0 个梨)

═══ 编程实现 ═══

  # 避免溢出的 C(n,r) 计算
  def comb(n, r):
      if r > n - r:
          r = n - r
      result = 1
      for i in range(r):
          result = result * (n - i) // (i + 1)
      return result
  
  # 或用 Pascal 三角 (DP)
  def pascal(n):
      C = [[0]*(n+1) for _ in range(n+1)]
      for i in range(n+1):
          C[i][0] = 1
          for j in range(1, i+1):
              C[i][j] = C[i-1][j-1] + C[i-1][j]
      return C`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 二项式定理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> binomial.txt</div>
                <pre className="fs-code">{`═══ 二项式定理 ═══

  (a + b)ⁿ = Σ C(n,k) · aⁿ⁻ᵏ · bᵏ    (k=0 to n)

  展开:
  (a+b)⁰ = 1
  (a+b)¹ = a + b
  (a+b)² = a² + 2ab + b²
  (a+b)³ = a³ + 3a²b + 3ab² + b³
  (a+b)⁴ = a⁴ + 4a³b + 6a²b² + 4ab³ + b⁴

═══ Pascal 三角形 ═══

  行号          系数
  ──────────────────────
  n=0           1
  n=1          1  1
  n=2         1  2  1
  n=3        1  3  3  1
  n=4       1  4  6  4  1
  n=5      1  5 10 10  5  1

  每个数 = 上方两数之和: C(n,k) = C(n-1,k-1) + C(n-1,k)

═══ 重要推论 ═══

  # x=1: 行和
  Σ C(n,k) = 2ⁿ   (子集总数!)

  # x=-1: 交替和
  Σ (-1)ᵏ C(n,k) = 0

  # Vandermonde 恒等式
  C(m+n, r) = Σ C(m,k)·C(n,r-k)
  
  直觉: 从 m 男 n 女中选 r 人
        = Σ(选 k 男 · 选 r-k 女)

  # Hockey Stick 恒等式
  C(r,r) + C(r+1,r) + ... + C(n,r) = C(n+1,r+1)

═══ 多项式定理 ═══

  (x₁ + x₂ + ... + xₖ)ⁿ
  = Σ [n! / (n₁!n₂!...nₖ!)] · x₁ⁿ¹ · x₂ⁿ² · ... · xₖⁿᵏ

  其中 n₁ + n₂ + ... + nₖ = n

  多项式系数 = n! / (n₁!n₂!...nₖ!)

═══ 应用 ═══

  1. 概率论:
     二项分布 B(n,p): P(X=k) = C(n,k)·pᵏ·(1-p)ⁿ⁻ᵏ
     
  2. 组合证明 vs 代数证明:
     组合证明更优雅 — 用故事解释!
     
     证明 C(2n,n) = Σ C(n,k)²:
     左边: 2n 人选 n 人
     右边: n 男 n 女选 n 人
           = Σ(选 k 男 · 选 n-k 女)
           = Σ C(n,k)·C(n,n-k) = Σ C(n,k)² ✓

  3. 信息论:
     n 位二进制串中恰好 k 个 1 的数量 = C(n,k)
     → 编码长度: log C(n,k) ≈ nH(k/n)  (熵!)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 容斥原理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> inclusion_exclusion.txt</div>
                <pre className="fs-code">{`═══ 容斥原理 (Inclusion-Exclusion) ═══

  |A₁ ∪ A₂ ∪ ... ∪ Aₙ|
  = Σ|Aᵢ| - Σ|Aᵢ∩Aⱼ| + Σ|Aᵢ∩Aⱼ∩Aₖ| - ... + (-1)ⁿ⁺¹|A₁∩...∩Aₙ|

  补集形式 (更常用!):
  |Ā₁ ∩ Ā₂ ∩ ... ∩ Āₙ|
  = |U| - Σ|Aᵢ| + Σ|Aᵢ∩Aⱼ| - ...

  "不属于任何集合的元素数"

═══ 经典问题 ═══

# ─── 1. 错位排列 (Derangement) ───
  n 个元素的排列, 没有元素在原位
  
  Dₙ = n! · Σ(-1)ᵏ/k!   (k=0 to n)
     ≈ n!/e  (四舍五入到最近整数)

  D₁=0, D₂=1, D₃=2, D₄=9, D₅=44

  递推: Dₙ = (n-1)(Dₙ₋₁ + Dₙ₋₂)

  例: 5 封信 5 个信封, 全装错 → D₅ = 44 种

# ─── 2. Euler φ 函数 ───
  φ(n) = 1..n 中与 n 互素的数的个数

  φ(n) = n · Π(1 - 1/p)  (p 为 n 的所有素因子)

  例: φ(12) = 12 · (1-1/2)(1-1/3) = 4
      {1, 5, 7, 11} 与 12 互素

  应用: RSA 加密! 
    φ(pq) = (p-1)(q-1)

# ─── 3. 满射计数 ───
  f: [m] → [n] 的满射数 (m≥n):

  S(m,n) = Σ(-1)ᵏ C(n,k)(n-k)ᵐ   (k=0 to n)

  例: 3 种球放入 2 个盒子, 每盒至少 1 个:
  = 2³ - C(2,1)·1³ = 8 - 2 = 6 ✓

# ─── 4. 素数筛 (Eratosthenes) ───
  与容斥原理的联系:
  
  1..100 中不被 2,3,5,7 整除的数
  = 100 - |A₂| - |A₃| - |A₅| - |A₇|
    + |A₂∩A₃| + |A₂∩A₅| + ...
    - ... + |A₂∩A₃∩A₅∩A₇|

  def count_coprime(n, primes):
      total = 0
      for mask in range(1, 1 << len(primes)):
          product = 1
          bits = 0
          for i, p in enumerate(primes):
              if mask & (1 << i):
                  product *= p
                  bits += 1
          if bits % 2 == 1:
              total -= n // product
          else:
              total += n // product
      return n + total`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 递推计数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> recursive_counting.txt</div>
                <pre className="fs-code">{`═══ 经典递推计数 ═══

# ─── Catalan 数 ───

  Cₙ = C(2n,n) / (n+1)
     = 1, 1, 2, 5, 14, 42, 132, 429, ...

  递推: Cₙ = Σ Cᵢ·Cₙ₋₁₋ᵢ  (i=0 to n-1)

  Catalan 数计数:
  • 合法括号序列: n 对括号 → Cₙ 种
  • 二叉树结构: n 个节点 → Cₙ 种
  • 凸多边形三角剖分: n+2 边形 → Cₙ 种
  • 从 (0,0) 到 (n,n) 不越过对角线 → Cₙ 种
  • 山脉序列 (Dyck path): n 步上 n 步下 → Cₙ 种

  C₃ = 5:
    ((())), (())(), ()(()), (()()),  ()()()

# ─── Stirling 数 ───

  第二类 Stirling 数 S(n,k):
  n 个元素分成 k 个非空子集的方式数

  递推: S(n,k) = k·S(n-1,k) + S(n-1,k-1)
  
  直觉: 新元素要么 (1)加入已有子集 (k种)
        要么 (2)独立成新子集

  S(4,2) = 7:
    {1}{234}, {2}{134}, {3}{124}, {4}{123}
    {12}{34}, {13}{24}, {14}{23}

  Bell 数: Bₙ = Σ S(n,k)  (所有划分总数)
  B₀=1, B₁=1, B₂=2, B₃=5, B₄=15, B₅=52

# ─── 整数分拆 ───

  p(n) = 把 n 写成正整数之和的方式数 (无序)

  p(4) = 5:  4, 3+1, 2+2, 2+1+1, 1+1+1+1

  递推 (DP):
  def partitions(n):
      dp = [0] * (n + 1)
      dp[0] = 1
      for k in range(1, n + 1):  # 加入数字 k
          for i in range(k, n + 1):
              dp[i] += dp[i - k]
      return dp[n]

  生成函数: Π 1/(1-xᵏ)  (k=1 to ∞)

  Ramanujan: p(n) ≡ 0 (mod 5) 当 n ≡ 4 (mod 5)

═══ 组合计数与算法 ═══

  问题              │ 计数公式     │ 算法策略
  ──────────────────┼──────────────┼──────────
  子集数            │ 2ⁿ           │ 位掩码
  排列数            │ n!           │ 回溯
  组合数            │ C(n,k)       │ DP / Pascal
  括号序列          │ Catalan      │ DP
  分割数            │ Stirling/Bell│ DP
  整数分拆          │ p(n)         │ 多项式 DP
  格路径            │ C(m+n,m)     │ 组合公式
  错位排列          │ Dₙ ≈ n!/e   │ 容斥`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
