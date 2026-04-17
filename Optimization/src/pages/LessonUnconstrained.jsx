import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['梯度下降', '牛顿法', '拟牛顿法', '线搜索与收敛'];

export default function LessonUnconstrained() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🎯 module_01 — 无约束优化</div>
      <div className="fs-hero">
        <h1>无约束优化：梯度下降 / 牛顿法 / 拟牛顿法</h1>
        <p>
          <code>min f(x)</code> 是一切优化的起点——
          从最朴素的<strong>梯度下降</strong>到利用曲率信息的<strong>牛顿法</strong>，
          再到工业级的<strong>L-BFGS</strong>，理解它们的原理与局限。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 无约束优化深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📉 梯度下降 (Gradient Descent)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> gradient_descent.py</div>
                <pre className="fs-code">{`# ═══ 最小化 f(x) ═══
#
# 必要条件: ∇f(x*) = 0  (驻点)
# 充分条件: ∇²f(x*) ≻ 0 (正定 → 局部最小)

import numpy as np

# ═══ 梯度下降 ═══
#
# xₖ₊₁ = xₖ - αₖ ∇f(xₖ)
#
# α: 学习率/步长 — 优化中最重要的超参数!

def gradient_descent(f, grad_f, x0, lr=0.01, tol=1e-8, max_iter=10000):
    x = x0.copy()
    for k in range(max_iter):
        g = grad_f(x)
        if np.linalg.norm(g) < tol:
            return x, k
        x = x - lr * g
    return x, max_iter

# ═══ 收敛速率分析 ═══
#
# 对二次函数 f(x) = ½xᵀAx - bᵀx:
# 
# 收敛率: ‖xₖ - x*‖ ≤ ((κ-1)/(κ+1))ᵏ ‖x₀ - x*‖
# κ = λ_max/λ_min (条件数)
#
# κ = 1:    一步收敛! (各向同性)
# κ = 10:   ~20 步
# κ = 100:  ~200 步
# κ = 10⁶:  ~2×10⁶ 步 → 极慢!
#
# → 线性收敛 (每步误差乘以固定比率)

# ═══ 学习率的影响 ═══
#
# α 太小: 收敛很慢 (需要百万步)
# α 太大: 来回振荡, 甚至发散!
# α 最优: 1/L (L = ∇f 的 Lipschitz 常数)
#
# 二次函数: L = λ_max(A)
# → α_opt = 1/λ_max
# → 保证收敛: α < 2/λ_max

# ═══ 梯度下降的"锯齿效应" ═══
#
# 椭圆形等高线 → 梯度方向 ≠ 最优方向
# → 路径呈锯齿状, 在"山谷"反复弹跳
# → 条件数越大越严重!
#
# 解决: 
# 1. 动量 (Momentum)
# 2. 预条件 (Preconditioning) 
# 3. 二阶方法 (Newton)

# ═══ 坐标下降 (Coordinate Descent) ═══
#
# 每次只优化一个变量, 固定其余
# 优势: 不需要梯度! 每步便宜!
# 应用: LASSO 的标准算法
#
# for k in range(max_iter):
#     for i in range(n):
#         x[i] = argmin_z f(x₁,...,z,...,xₙ)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 牛顿法 (Newton's Method)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> newton.py</div>
                <pre className="fs-code">{`# ═══ 牛顿法 ═══
#
# 在 xₖ 处用二次模型逼近 f:
# f(x) ≈ f(xₖ) + gᵀ(x-xₖ) + ½(x-xₖ)ᵀH(x-xₖ)
#
# 最小化二次模型: 令导数 = 0
# → Hd = -g  (牛顿方程)
# → d = -H⁻¹g (牛顿方向)
# → xₖ₊₁ = xₖ + d

import numpy as np

def newton_method(f, grad, hessian, x0, tol=1e-10, max_iter=100):
    x = x0.copy()
    for k in range(max_iter):
        g = grad(x)
        H = hessian(x)
        if np.linalg.norm(g) < tol:
            return x, k
        d = np.linalg.solve(H, -g)  # 不要算 H⁻¹!
        x = x + d
    return x, max_iter

# ═══ 收敛速率 ═══
#
# 二阶/超线性收敛!
# ‖xₖ₊₁ - x*‖ ≤ C·‖xₖ - x*‖²
#
# 误差平方缩小!
# 迭代 k: 误差 10⁻¹ → 10⁻² → 10⁻⁴ → 10⁻⁸ → 10⁻¹⁶
# → 通常 5-10 步就达到机器精度!

# ═══ 牛顿法的问题 ═══
#
# 1. 需要计算 Hessian H: O(n²) 存储, O(n³) 求解
#    → n = 10⁶ 时不可行!
#
# 2. 远离极值时可能发散 (二次近似不好)
#    → 解决: 阻尼牛顿法 (加线搜索)
#    → xₖ₊₁ = xₖ + αₖd  (αₖ 通过线搜索确定)
#
# 3. H 不正定时牛顿方向可能不是下降方向!
#    → 解决: 修正 Hessian (加正则化 H̃ = H + μI)
#    → 或信赖域方法

# ═══ Gauss-Newton (非线性最小二乘) ═══
#
# 问题: min ½‖r(x)‖²  (r = 残差向量)
# 
# 完整 Hessian: H = JᵀJ + Σ rᵢ∇²rᵢ
# Gauss-Newton: H ≈ JᵀJ (忽略二阶项!)
#
# 牛顿方程: (JᵀJ)d = -Jᵀr
# → 等价于解 min ‖Jd + r‖² (线性最小二乘!)
#
# 优势: 不需要 Hessian, 只需要 Jacobian!

# ═══ Levenberg-Marquardt ═══
#
# (JᵀJ + λI)d = -Jᵀr
#
# λ 大: 步长小, 接近梯度下降 (安全)
# λ 小: 接近 Gauss-Newton (快速收敛)
# λ 自适应: 根据目标函数下降自动调整
#
# → scipy.optimize.least_squares(method='lm')`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 拟牛顿法 (Quasi-Newton)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> quasi_newton.txt</div>
                <pre className="fs-code">{`═══ 动机 ═══

  梯度下降: O(n) 每步, 但线性收敛 (慢!)
  牛顿法:   O(n³) 每步, 但二次收敛 (快!)
  拟牛顿:   O(n²) 每步, 超线性收敛 (折中!)

  核心: 用梯度信息逐步近似 H⁻¹, 不需要 Hessian!

═══ 割线条件 (Secant Condition) ═══

  H_{k+1} sₖ = yₖ

  sₖ = xₖ₊₁ - xₖ        (步长)
  yₖ = ∇f(xₖ₊₁) - ∇f(xₖ) (梯度差)

  → 新 Hessian 近似必须满足这个条件!

═══ BFGS (Broyden-Fletcher-Goldfarb-Shanno) ═══

  更新 H⁻¹ 的近似 Bₖ:

  Bₖ₊₁ = (I - ρₖsₖyₖᵀ) Bₖ (I - ρₖyₖsₖᵀ) + ρₖsₖsₖᵀ

  ρₖ = 1 / (yₖᵀsₖ)

  性质:
  • 保持正定性 (如果 yₖᵀsₖ > 0)
  • 超线性收敛
  • 每步 O(n²) (矩阵-向量乘)
  • 存储 O(n²) (完整矩阵)

═══ L-BFGS (Limited-memory BFGS) ═══

  问题: BFGS 存储 O(n²) → n = 10⁶ 时 8TB!
  
  解决: 只存最近 m 步的 {sₖ, yₖ} 对
  (通常 m = 5~20)

  Two-loop recursion:
  → 用 O(mn) 计算方向, 不需要整矩阵!

  → 这是大规模优化的王牌算法!
  → scipy.optimize.minimize(method='L-BFGS-B')

═══ 拟牛顿法对比 ═══

  方法    │ 存储  │ 每步    │ 收敛    │ 适用
  ────────┼───────┼─────────┼─────────┼──────
  GD      │ O(n)  │ O(n)    │ 线性    │ 大 n
  BFGS    │ O(n²) │ O(n²)   │ 超线性  │ n < 10⁴
  L-BFGS  │ O(mn) │ O(mn)   │ 超线性  │ 大 n!
  Newton  │ O(n²) │ O(n³)   │ 二次    │ n < 10³
  截断 CG │ O(n)  │ O(kn)   │ 超线性  │ 大 n

═══ 非线性共轭梯度 ═══

  dₖ = -gₖ + βₖ dₖ₋₁

  βₖ 的选择:
  • Fletcher-Reeves: βₖ = ‖gₖ‖²/‖gₖ₋₁‖²
  • Polak-Ribière:   βₖ = gₖᵀ(gₖ-gₖ₋₁)/‖gₖ₋₁‖²

  优势: 存储 O(n), 收敛比 GD 快得多!
  劣势: 不如 L-BFGS 鲁棒

═══ scipy 接口 ═══

  from scipy.optimize import minimize

  result = minimize(
      fun=objective,
      x0=x_init,
      method='L-BFGS-B',   # 首选!
      jac=gradient,          # 梯度 (必须!)
      options={'maxiter': 1000}
  )
  
  print(result.x)      # 最优解
  print(result.fun)    # 最优值
  print(result.success) # 是否收敛`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 线搜索与收敛理论</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> line_search.txt</div>
                <pre className="fs-code">{`═══ 线搜索 (Line Search) ═══

  给定下降方向 d, 选择步长 α:
  min_α f(xₖ + α·dₖ)

  精确线搜索: 求解上面的一维优化 (贵!)
  非精确线搜索: 只要求"足够好" (实际使用!)

═══ Wolfe 条件 ═══

  充分下降 (Armijo):
  f(xₖ + αdₖ) ≤ f(xₖ) + c₁·α·gₖᵀdₖ
  (c₁ ≈ 10⁻⁴, 保证函数值下降)

  曲率条件:
  ∇f(xₖ + αdₖ)ᵀdₖ ≥ c₂·gₖᵀdₖ
  (c₂ ≈ 0.9, 保证步长不太小)

  → 同时满足两个条件的 α 一定存在!
  → BFGS/L-BFGS 依赖 Wolfe 条件保证正定!

═══ 回溯线搜索 (Backtracking) ═══

  α = 1  (初始)
  while f(xₖ + αdₖ) > f(xₖ) + c₁·α·gₖᵀdₖ:
      α *= ρ  (ρ ≈ 0.5, 缩减)

  简单有效! 只检查 Armijo 条件

═══ 信赖域方法 (Trust Region) ═══

  不选步长, 而选区域半径 Δ:
  min mₖ(d) = f + gᵀd + ½dᵀHd
  s.t. ‖d‖ ≤ Δ

  Δ 自适应:
  ρₖ = (f(xₖ) - f(xₖ+d)) / (mₖ(0) - mₖ(d))
  
  ρ ≈ 1: 模型好 → 扩大 Δ
  ρ < 0.25: 模型差 → 缩小 Δ
  ρ < 0: 变差了! → 拒绝这步

  → 比线搜索更鲁棒, 能处理非正定 Hessian!

═══ 收敛理论总结 ═══

  收敛类型     │ 定义                    │ 方法
  ─────────────┼─────────────────────────┼──────
  线性         │ ‖eₖ₊₁‖ ≤ c·‖eₖ‖        │ GD
  超线性       │ ‖eₖ₊₁‖/‖eₖ‖ → 0       │ BFGS
  二次(p=2)    │ ‖eₖ₊₁‖ ≤ c·‖eₖ‖²      │ Newton
  
  实际意义:
  • 线性: 有效数字线性增加 (每步 +1 位)
  • 二次: 有效数字翻倍 (每步精度 ×2)

═══ 全局优化 vs 局部优化 ═══

  所有上述方法 → 局部最优!
  
  非凸问题可能有:
  • 多个局部最小值
  • 鞍点 (Hessian 不定)
  • 平坦区域

  实用策略:
  1. 多次随机重启 → 选最好的
  2. 模拟退火 → 概率逃离局部最小
  3. 凸松弛 → 将非凸近似为凸
  4. 深度学习: SGD + 噪声天然帮助逃离!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
