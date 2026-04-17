import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['凸集与凸函数', '凸优化问题', '对偶理论', '常见凸问题'];

export default function LessonConvex() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🎯 module_02 — 凸优化基础</div>
      <div className="fs-hero">
        <h1>凸优化基础：凸集 / 凸函数 / 对偶理论</h1>
        <p>
          凸优化是优化理论的"黄金地带"——局部最优 = 全局最优！
          从凸性的判定到<strong>拉格朗日对偶</strong>和<strong>强对偶</strong>定理，
          掌握识别和求解凸优化问题的理论框架。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 凸优化深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔶 凸集与凸函数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> convexity.txt</div>
                <pre className="fs-code">{`═══ 凸集 ═══

  定义: S 是凸集 ⟺ ∀x,y∈S, ∀θ∈[0,1]:
        θx + (1-θ)y ∈ S  (线段在集合内)

  常见凸集:
  • 超平面:  {x | aᵀx = b}
  • 半空间:  {x | aᵀx ≤ b}
  • 球/椭球: {x | ‖x-c‖ ≤ r}
  • 多面体:  {x | Ax ≤ b}  (线性不等式交集)
  • 正半定锥: {X | X ≽ 0}  (半定规划的可行域!)

  凸集的操作:
  • 交集: 凸集的交 → 凸集 ✓
  • 并集: 凸集的并 → 不一定凸 ✗
  • 仿射变换: f(S) = {f(x)|x∈S} → 凸集 ✓
  • 透视函数: P(x,t) = x/t → 保凸 ✓

═══ 凸函数 ═══

  定义: f 是凸函数 ⟺ dom(f) 是凸集 且
        f(θx+(1-θ)y) ≤ θf(x) + (1-θ)f(y)
        (弦在曲线之上!)

  等价条件 (可微):
  1. 一阶: f(y) ≥ f(x) + ∇f(x)ᵀ(y-x)
     (切线在曲线之下!)

  2. 二阶: ∇²f(x) ≽ 0  (Hessian 半正定!)
     → 最实用的判定方法!

═══ 常见凸函数 ═══

  函数           │ 凸性     │ 说明
  ───────────────┼──────────┼──────
  aᵀx + b       │ 仿射     │ 既凸又凹
  ‖x‖            │ 凸       │ 任意范数
  xᵀAx (A≽0)    │ 凸       │ 二次型
  eˣ            │ 凸       │ 指数
  -log(x)       │ 凸       │ 负对数
  max(x₁,...,xₙ)│ 凸       │ 逐点最大
  log(Σeˣⁱ)     │ 凸       │ log-sum-exp

═══ 保凸操作 ═══

  1. 非负加权和: αf₁ + βf₂ (α,β≥0) → 凸
  2. 仿射复合: f(Ax+b) → 凸 (如果 f 凸)
  3. 逐点最大: max(f₁,...,fₘ) → 凸
  4. 复合: 
     - g(f(x)) 凸 if: g 凸递增且 f 凸
     - g(f(x)) 凸 if: g 凸递减且 f 凹

  → 用这些规则可以证明复杂函数的凸性!
  → CVX/CVXPY 等建模工具自动使用这些规则!

═══ 强凸 (Strong Convexity) ═══

  f 是 μ-强凸 ⟺ f(x) - μ/2·‖x‖² 是凸的
  ⟺ ∇²f(x) ≽ μI (Hessian 的特征值 ≥ μ)

  强凸保证:
  • 唯一全局最小值
  • 梯度下降线性收敛: 率 = (1 - μ/L)
  • 更好的泛化界 (ML)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 凸优化问题</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> convex_problems.txt</div>
                <pre className="fs-code">{`═══ 标准形式 ═══

  min   f₀(x)         (凸目标)
  s.t.  fᵢ(x) ≤ 0     (凸不等式约束)
        hⱼ(x) = 0     (仿射等式约束)

  核心定理: 凸优化的任何局部最优 = 全局最优!
  → 这就是凸优化如此重要的原因!

═══ 重要的凸优化类别 ═══

  1. 线性规划 (LP):
     min cᵀx  s.t. Ax ≤ b
     → 单纯形法, 内点法
     → 多项式/指数界...但实际很快!

  2. 二次规划 (QP):
     min ½xᵀPx + qᵀx  s.t. Ax ≤ b  (P ≽ 0)
     → 内点法, 活动集法
     → SVM 的核心!

  3. 二阶锥规划 (SOCP):
     min fᵀx  s.t. ‖Aᵢx+bᵢ‖ ≤ cᵢᵀx+dᵢ
     → 比 QP 更通用, 比 SDP 更快
     → 鲁棒优化常用

  4. 半定规划 (SDP):
     min tr(CX)  s.t. tr(AᵢX) = bᵢ, X ≽ 0
     → 最通用的"可高效求解"凸优化
     → 松弛组合优化, 控制理论

  层次: LP ⊂ QP ⊂ SOCP ⊂ SDP ⊂ 一般凸

═══ 凸问题识别 ═══

  ML 中的凸问题:
  ✓ 线性回归:    min ‖Xβ - y‖²
  ✓ 岭回归:      min ‖Xβ - y‖² + λ‖β‖²
  ✓ LASSO:       min ‖Xβ - y‖² + λ‖β‖₁
  ✓ SVM:         min ½‖w‖² + C Σ max(0, 1-yᵢwᵀxᵢ)
  ✓ Logistic 回归: min Σ log(1+e^{-yᵢwᵀxᵢ})

  ML 中的非凸问题:
  ✗ 神经网络:    非凸目标函数!
  ✗ 矩阵分解:   非凸! (但有局部≈全局的结果)
  ✗ 聚类 (k-means): NP-hard!

═══ 凸松弛 ═══

  非凸问题 → 松弛为凸问题 → 求近似解
  或: 非凸解 ∈ 凸包 → 用凸包优化!
  
  例: 0-1 整数规划 → LP 松弛 (x ∈ {0,1} → x ∈ [0,1])`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ 对偶理论</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> duality.txt</div>
                <pre className="fs-code">{`═══ 拉格朗日函数 ═══

  原问题: min f₀(x)  s.t. fᵢ(x)≤0, hⱼ(x)=0

  L(x, λ, ν) = f₀(x) + Σ λᵢfᵢ(x) + Σ νⱼhⱼ(x)

  λᵢ ≥ 0: 不等式约束的对偶变量
  νⱼ:     等式约束的对偶变量

═══ 对偶函数 ═══

  g(λ, ν) = inf_x L(x, λ, ν)

  性质: g(λ, ν) ≤ p* (∀ λ ≥ 0)
  → 对偶函数给出原问题最优值的下界!
  → 即使原问题非凸也成立!

═══ 对偶问题 ═══

  max  g(λ, ν)
  s.t. λ ≥ 0

  对偶问题永远是凸的! (即使原问题非凸!)

═══ 弱对偶与强对偶 ═══

  弱对偶: d* ≤ p* (永远成立!)
  对偶间隙: p* - d*

  强对偶: d* = p* (间隙 = 0)

  Slater 条件 (充分条件):
  若存在严格可行点 x̃: fᵢ(x̃) < 0 (所有不等式严格满足)
  → 强对偶成立!

  → 大多数实际凸优化满足 Slater 条件!

═══ KKT 条件 ═══

  如果强对偶成立, 最优解 (x*, λ*, ν*) 满足:

  1. 原始可行: fᵢ(x*) ≤ 0,  hⱼ(x*) = 0
  2. 对偶可行: λᵢ* ≥ 0
  3. 互补松弛: λᵢ* · fᵢ(x*) = 0
  4. 稳定性:   ∇f₀ + Σλᵢ*∇fᵢ + Σνⱼ*∇hⱼ = 0

  互补松弛的含义:
  → 如果约束不紧 (fᵢ < 0), 则 λᵢ = 0 (不活跃)
  → 如果 λᵢ > 0, 则约束必须紧 (fᵢ = 0)

  凸问题: KKT 是充要条件!
  非凸问题: KKT 只是必要条件

═══ 对偶的实际意义 ═══

  1. 提供最优值的下界 → 验证解的质量!
  2. 有时对偶问题更容易求解!
  3. λ* = ∂f*/∂bᵢ → 灵敏度分析!
     (约束放松一点, 目标改善多少?)
  4. SVM 的核心: 原始 n 维 → 对偶 m 维 (样本数)
  5. 经济学: 价格解释 (每单位资源的边际价值)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧩 常见凸问题详解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> examples.py</div>
                <pre className="fs-code">{`# ═══ CVXPY: 凸优化建模工具 ═══

import cvxpy as cp
import numpy as np

# ═══ 1. 投资组合优化 (QP) ═══

n = 5  # 资产数
mu = np.array([0.12, 0.10, 0.08, 0.07, 0.06])  # 期望收益
Sigma = np.random.randn(n,n)
Sigma = Sigma.T @ Sigma / n  # 协方差矩阵

w = cp.Variable(n)
ret = mu @ w
risk = cp.quad_form(w, Sigma)

prob = cp.Problem(
    cp.Maximize(ret - 0.5 * risk),
    [cp.sum(w) == 1, w >= 0]  # 全投资 + 不做空
)
prob.solve()
# w.value → 最优权重!

# ═══ 2. LASSO (SOCP) ═══

m, n = 100, 50
A = np.random.randn(m, n)
b = np.random.randn(m)
lam = 0.1

x = cp.Variable(n)
prob = cp.Problem(
    cp.Minimize(cp.sum_squares(A @ x - b) + lam * cp.norm1(x))
)
prob.solve()
# x.value → 稀疏解!

# ═══ 3. SVM (QP) ═══

# min ½‖w‖² + C Σ ξᵢ
# s.t. yᵢ(wᵀxᵢ + b) ≥ 1 - ξᵢ, ξᵢ ≥ 0

w = cp.Variable(n)
b_var = cp.Variable()
xi = cp.Variable(m)
C = 1.0

prob = cp.Problem(
    cp.Minimize(0.5 * cp.sum_squares(w) + C * cp.sum(xi)),
    [cp.multiply(y, X @ w + b_var) >= 1 - xi, xi >= 0]
)
prob.solve()

# ═══ 4. 最优传输 (LP) ═══

# min Σ cᵢⱼ πᵢⱼ
# s.t. Σⱼ πᵢⱼ = aᵢ,  Σᵢ πᵢⱼ = bⱼ,  π ≥ 0
# → Earth Mover's Distance!
# → Sinkhorn 算法 (熵正则化) 更快!

# ═══ 内点法 (Interior Point Method) ═══
#
# 核心: 用障碍函数将约束转化为目标
# min f₀(x) + (1/t) · Σ -log(-fᵢ(x))
# t → ∞ 时逼近原问题!
#
# 复杂度: O(n³·√n) → 多项式时间!
# → LP/QP/SOCP/SDP 的通用求解器!
#
# 工业级求解器:
# MOSEK, Gurobi → LP/QP/SOCP/SDP
# ECOS → 嵌入式 SOCP
# SCS → 大规模凸优化 (一阶方法)
# OSQP → 大规模 QP`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
