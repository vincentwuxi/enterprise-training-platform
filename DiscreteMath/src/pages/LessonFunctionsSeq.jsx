import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['函数类型', '递推关系', '生成函数', '增长与渐近'];

export default function LessonFunctionsSeq() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔢 module_03 — 函数与序列</div>
      <div className="fs-hero">
        <h1>函数与序列：函数类型 / 递推 / 生成函数</h1>
        <p>
          <strong>函数</strong>是集合间的映射——单射/满射/双射决定了可数性与编码理论，
          <strong>递推关系</strong>是动态规划的数学本质，
          <strong>生成函数</strong>将序列问题转化为代数运算。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 函数与序列深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 函数类型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> functions.txt</div>
                <pre className="fs-code">{`═══ 函数 f: A → B ═══

  定义: ∀a∈A, 恰好存在一个 b∈B 使 f(a)=b
  A = 定义域 (domain),  B = 值域 (codomain)
  f(A) = 像 (image) ⊆ B

═══ 三大类型 ═══

  类型   │ 定义                          │ 直觉
  ───────┼───────────────────────────────┼──────────────
  单射   │ f(a₁)=f(a₂) → a₁=a₂         │ 一一对应(无碰撞)
  (1-1)  │                               │ |A| ≤ |B|
  满射   │ ∀b∈B, ∃a∈A, f(a)=b           │ 覆盖全部值域
  (onto) │                               │ |A| ≥ |B|
  双射   │ 单射 + 满射                    │ 完美匹配
  (1-1   │                               │ |A| = |B|
   onto) │                               │ 存在逆函数!

  例:
  f: ℤ→ℤ, f(x)=2x     → 单射 ✓ 满射 ✗ (奇数不在像中)
  f: ℤ→ℕ, f(x)=|x|    → 单射 ✗ 满射 ✓
  f: ℤ→ℤ, f(x)=x+1    → 双射 ✓ (逆: f⁻¹(x)=x-1)

═══ 鸽巢原理 (Pigeonhole) ═══

  如果 n+1 只鸽子放入 n 个巢, 至少一个巢有≥2只鸽子
  
  形式: |A| > |B| → f:A→B 不是单射

  推广: n 个对象放入 k 个箱子
        至少一个箱子有 ⌈n/k⌉ 个对象

  应用:
  • Hash 碰撞: 2⁶⁴ 个数据 → 2³² 个桶 → 必有碰撞
  • 生日悖论: 23 人中有 50%+ 概率两人同生日
  • 网络: 1001 个 IP 映射 1000 个端口 → 必有冲突

═══ 函数复合与逆 ═══

  (g ∘ f)(x) = g(f(x))

  性质:
  • f,g 都是单射 → g∘f 是单射
  • f,g 都是满射 → g∘f 是满射
  • g∘f 是单射 → f 是单射 (但 g 不一定!)
  • g∘f 是满射 → g 是满射 (但 f 不一定!)

  逆函数: f⁻¹ 存在 ⟺ f 是双射
  f ∘ f⁻¹ = f⁻¹ ∘ f = id

═══ 可数性 ═══

  可数: |A| ≤ |ℕ| (存在到 ℕ 的单射)
  
  可数无限: ℕ, ℤ, ℚ (可以一一枚举!)
  
  Cantor 对角线: ℝ 不可数!
    假设可数, 列出所有实数, 
    构造一个不在列表中的数 → 矛盾

  |ℕ| = |ℤ| = |ℚ| < |ℝ| = |𝒫(ℕ)|
  
  编程意义: 程序(可数) < 函数(不可数)
  → 存在不可计算的函数 (Halting Problem!)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 递推关系</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> recurrence.txt</div>
                <pre className="fs-code">{`═══ 递推关系 (Recurrence Relation) ═══

  用前面的项定义后面的项: aₙ = f(aₙ₋₁, aₙ₋₂, ...)

  经典例子:
  Fibonacci:  F(n) = F(n-1) + F(n-2),  F(0)=0, F(1)=1
  阶乘:      n! = n · (n-1)!,          0! = 1
  汉诺塔:    T(n) = 2T(n-1) + 1,       T(1) = 1
  归并排序:  T(n) = 2T(n/2) + n,       T(1) = 0

═══ 线性齐次递推的求解 ═══

  形式: aₙ = c₁aₙ₋₁ + c₂aₙ₋₂ + ... + cₖaₙ₋ₖ

  步骤:
  1. 写特征方程: xᵏ = c₁xᵏ⁻¹ + c₂xᵏ⁻² + ... + cₖ
  2. 求根 r₁, r₂, ..., rₖ
  3. 通解:
     不同根: aₙ = A₁r₁ⁿ + A₂r₂ⁿ + ... + Aₖrₖⁿ
     重根 rᵢ (m重): (A + Bn + ... + Cⁿᵐ⁻¹)rᵢⁿ
  4. 用初始条件解 A₁, A₂, ...

  ─── 例: Fibonacci ───
  
  aₙ = aₙ₋₁ + aₙ₋₂
  特征: x² = x + 1 → x² - x - 1 = 0
  根: r₁ = (1+√5)/2 = φ ≈ 1.618   (黄金比例!)
      r₂ = (1-√5)/2 ≈ -0.618
  
  通解: aₙ = A·φⁿ + B·((1-√5)/2)ⁿ
  初始: a₀=0, a₁=1 → A=1/√5, B=-1/√5
  
  F(n) = (φⁿ - ψⁿ) / √5   (Binet 公式!)
  
  → F(n) = O(φⁿ) ≈ O(1.618ⁿ)  指数增长

═══ 非齐次递推 ═══

  aₙ = c₁aₙ₋₁ + ... + f(n)

  方法: 特解 + 齐次通解
  
  特解猜测:
  • f(n) = 常数 c → 试 p(n) = A
  • f(n) = n      → 试 p(n) = An + B
  • f(n) = 2ⁿ    → 试 p(n) = A·2ⁿ
  • f(n) = n·2ⁿ  → 试 p(n) = (An+B)·2ⁿ

  ─── 例: 汉诺塔 ───
  T(n) = 2T(n-1) + 1, T(1) = 1
  
  齐次解: T_h = A·2ⁿ
  特解: 试 T_p = C → C = 2C + 1 → C = -1
  通解: T(n) = A·2ⁿ - 1
  初始: T(1)=1 → A·2-1=1 → A=1
  
  T(n) = 2ⁿ - 1  ✓

═══ 主定理 (Master Theorem) ═══

  T(n) = aT(n/b) + f(n)

  Case 1: f(n) = O(n^(log_b(a)-ε))  → T = Θ(n^log_b(a))
  Case 2: f(n) = Θ(n^log_b(a))      → T = Θ(n^log_b(a)·logn)
  Case 3: f(n) = Ω(n^(log_b(a)+ε))  → T = Θ(f(n))

  归并排序: a=2,b=2,f(n)=n → Case 2 → O(n log n)
  二分搜索: a=1,b=2,f(n)=1 → Case 2 → O(log n)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧮 生成函数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> generating.txt</div>
                <pre className="fs-code">{`═══ 生成函数 (Generating Function) ═══

  把序列 {a₀, a₁, a₂, ...} 编码为幂级数:

  G(x) = a₀ + a₁x + a₂x² + a₃x³ + ...
       = Σ aₙxⁿ

  核心思想: 将组合问题 → 代数运算!

═══ 常见生成函数 ═══

  序列              │ G(x)
  ──────────────────┼──────────────────────
  {1,1,1,...}       │ 1/(1-x)
  {1,0,1,0,...}     │ 1/(1-x²)
  {1,2,3,...}       │ 1/(1-x)²
  {1,1/2,1/6,...}   │ eˣ
  {0,1,1,2,3,5,...} │ x/(1-x-x²)  (Fibonacci!)
  {C(n,k)}          │ (1+x)ⁿ     (二项式!)

═══ 运算对照 ═══

  序列运算     │ 生成函数运算
  ─────────────┼─────────────────
  加法 aₙ+bₙ  │ A(x) + B(x)
  位移 aₙ₊₁   │ (A(x) - a₀) / x
  卷积 Σaᵢbₙ₋ᵢ│ A(x) · B(x)    ← 关键!
  求前缀和     │ A(x) / (1-x)

  卷积 = 多项式乘法 = FFT!

═══ 用生成函数解递推 ═══

  例: Fibonacci F(n) = F(n-1) + F(n-2), F(0)=0, F(1)=1

  设 G(x) = Σ F(n)xⁿ

  G(x) = F(0) + F(1)x + Σₙ≥₂ [F(n-1)+F(n-2)]xⁿ
       = 0 + x + x·G(x) + x²·G(x)

  G(x)(1 - x - x²) = x
  G(x) = x / (1-x-x²)

  部分分式: G(x) = (1/√5)(1/(1-φx) - 1/(1-ψx))
  
  展开: G(x) = (1/√5) Σ (φⁿ - ψⁿ)xⁿ
  
  ∴ F(n) = (φⁿ - ψⁿ)/√5  ← 得到 Binet 公式!

═══ 应用: 零钱问题 ═══

  硬币: {1, 5, 10, 25 分}
  凑 n 分有多少种方式?

  每种硬币的 GF:
    1分:  1 + x + x² + ... = 1/(1-x)
    5分:  1 + x⁵ + x¹⁰ + ... = 1/(1-x⁵)
    10分: 1/(1-x¹⁰)
    25分: 1/(1-x²⁵)

  总 GF: G(x) = 1/((1-x)(1-x⁵)(1-x¹⁰)(1-x²⁵))
  
  答案 = G(x) 中 xⁿ 的系数!

  → 这就是 DP 的数学本质:
    dp[i] += dp[i - coin]  ≡ 乘以 1/(1-x^coin)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📈 增长与渐近</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> growth.txt</div>
                <pre className="fs-code">{`═══ 渐近符号 ═══

  O(g(n)):  上界  ∃c,n₀, ∀n≥n₀, f(n) ≤ c·g(n)
  Ω(g(n)):  下界  ∃c,n₀, ∀n≥n₀, f(n) ≥ c·g(n)
  Θ(g(n)):  紧界  O(g) ∧ Ω(g) 同时成立
  o(g(n)):  严格上界  lim f(n)/g(n) = 0
  ω(g(n)):  严格下界  lim f(n)/g(n) = ∞

═══ 增长率排序 ═══

  1 < log log n < log n < √n < n < n log n
  < n² < n³ < 2ⁿ < 3ⁿ < n! < nⁿ

  具体对比 (n = 1000):
  ─────────────────────────────
  log n    ≈ 10
  √n       ≈ 31.6
  n        = 1,000
  n log n  ≈ 10,000
  n²       = 1,000,000
  2ⁿ       ≈ 10³⁰⁰  (宇宙原子数 ≈ 10⁸⁰)

═══ 常见算法复杂度 ═══

  O(1)        │ 哈希表查找
  O(log n)    │ 二分搜索
  O(√n)       │ 试除法质数检查
  O(n)        │ 线性扫描
  O(n log n)  │ 排序下界 (比较排序)
  O(n²)       │ 简单嵌套循环
  O(n³)       │ 矩阵乘法 (朴素)
  O(2ⁿ)       │ 子集枚举
  O(n!)       │ 全排列

═══ 重要渐近公式 ═══

  Stirling: n! ≈ √(2πn) · (n/e)ⁿ
  
  log(n!) = Θ(n log n)
  → 排序下界: Ω(n log n) (比较排序)
  
     n 个元素的排列有 n! 种
     每次比较排除一半 → 需要 log(n!) 次
     log(n!) = Θ(n log n) ✓

  调和级数: Hₙ = 1 + 1/2 + ... + 1/n ≈ ln n + γ
     (γ ≈ 0.5772, Euler-Mascheroni 常数)
  
  应用: 随机算法分析 (Coupon Collector: Θ(n ln n))

═══ Akra-Bazzi 定理 (主定理推广) ═══

  T(n) = Σ aᵢ T(n/bᵢ) + g(n)

  求 p 使 Σ aᵢ/bᵢᵖ = 1

  T(n) = Θ(nᵖ(1 + ∫₁ⁿ g(u)/u^(p+1) du))

  比主定理更通用, 处理不等分的递推!

═══ 摊销分析 ═══

  单次操作可能很贵, 但均摊后便宜

  例: 动态数组 (vector/ArrayList)
    单次 push: 可能 O(n) (扩容复制)
    摊销: O(1) per push!
    
    证明 (势函数法):
    Φ = 2·size - capacity
    amortized = actual + ΔΦ
    普通 push: 1 + 2 = 3 = O(1)
    扩容 push: n + (2·(n+1) - 2n) - (2n - n) = O(1)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
