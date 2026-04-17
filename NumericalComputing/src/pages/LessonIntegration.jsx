import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Newton-Cotes', 'Gauss 求积', '自适应积分', '多维积分'];

export default function LessonIntegration() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔬 module_04 — 数值积分</div>
      <div className="fs-hero">
        <h1>数值积分：梯形法 / Simpson / Gauss 求积</h1>
        <p>
          解析积分做不出来？没关系——<strong>数值积分</strong>用离散求和逼近定积分。
          从朴素的梯形法到高精度的 Gauss 求积，从一维到蒙特卡洛高维积分。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 数值积分深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 Newton-Cotes 公式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> newton_cotes.py</div>
                <pre className="fs-code">{`# ═══ 数值积分的基本思想 ═══
#
# ∫ₐᵇ f(x) dx ≈ Σ wᵢ f(xᵢ)
#
# 选择节点 xᵢ 和权重 wᵢ → 不同的积分公式!
# Newton-Cotes: 等距节点

import numpy as np

# ═══ 梯形法 (Trapezoidal Rule) ═══

def trapezoidal(f, a, b, n):
    h = (b - a) / n
    x = np.linspace(a, b, n+1)
    y = f(x)
    return h * (y[0]/2 + np.sum(y[1:-1]) + y[-1]/2)

# 误差: E = -(b-a)h²/12 · f''(ξ) = O(h²)
# 需要 4 倍点数才能精度翻倍!
#
# 惊人事实: 对周期函数, 梯形法超级精确!
# Euler-Maclaurin 公式: 误差 = O(h^∞) (指数收敛!)
# → FFT 的理论基础!

# ═══ Simpson 法 (Simpson's Rule) ═══

def simpson(f, a, b, n):
    """n 必须是偶数"""
    h = (b - a) / n
    x = np.linspace(a, b, n+1)
    y = f(x)
    return h/3 * (y[0] + 4*np.sum(y[1::2]) + 2*np.sum(y[2:-1:2]) + y[-1])

# 误差: E = -(b-a)h⁴/180 · f⁴(ξ) = O(h⁴)
# → 精度比梯形法高两阶!
# 
# 为什么? Simpson 用二次多项式逼近 (梯形用一次)
# 但实际精确到三次! (对称性带来的"免费"精度提升)

# ═══ Simpson 3/8 法 ═══
# 用三次多项式, 但精度仍为 O(h⁴)
# 较少使用, 除非 n 不能被 2 整除

# ═══ Romberg 积分 (Richardson 外推) ═══
#
# 思想: 用不同 h 的梯形法结果, 外推消除误差项!
#
# T(h)  = I + c₁h² + c₂h⁴ + ...
# T(h/2) = I + c₁h²/4 + c₂h⁴/16 + ...
#
# → (4·T(h/2) - T(h)) / 3 ≈ I + O(h⁴)  ← 就是 Simpson!
#
# 继续外推 → 越来越高精度!

def romberg(f, a, b, max_level=10, tol=1e-12):
    R = np.zeros((max_level, max_level))
    R[0, 0] = trapezoidal(f, a, b, 1)
    
    for i in range(1, max_level):
        n = 2**i
        R[i, 0] = trapezoidal(f, a, b, n)
        
        for j in range(1, i+1):
            factor = 4**j
            R[i, j] = (factor * R[i, j-1] - R[i-1, j-1]) / (factor - 1)
        
        if abs(R[i, i] - R[i-1, i-1]) < tol:
            return R[i, i]
    
    return R[-1, -1]

# scipy.integrate.romberg(f, a, b)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⭐ Gauss 求积</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> gauss_quad.txt</div>
                <pre className="fs-code">{`═══ Gauss 求积的核心思想 ═══

  Newton-Cotes: 固定等距节点 → 选权重
  Gauss:        节点和权重都自由选择 → 最优!

  n 个点 → 精确积分 2n-1 次多项式!
  (Newton-Cotes n 个点只精确到 n-1 次)

═══ Gauss-Legendre 求积 ═══

  ∫₋₁¹ f(x) dx ≈ Σᵢ wᵢ f(xᵢ)

  节点 xᵢ: Legendre 多项式 Pₙ(x) 的零点
  权重 wᵢ: 通过插值条件确定

  n=1: x₁ = 0,           w₁ = 2
  n=2: x = ±1/√3,        w = 1, 1
  n=3: x = 0, ±√(3/5),   w = 8/9, 5/9, 5/9

  一般区间 [a,b]:
  变换 t = ((b-a)x + (b+a)) / 2
  ∫ₐᵇ f(t) dt = (b-a)/2 · Σ wᵢ f(tᵢ)

═══ Python 实现 ═══

  from numpy.polynomial.legendre import leggauss
  
  x, w = leggauss(n)  # n 个 Gauss 点和权重
  
  # 积分 [a, b]:
  t = 0.5*(b-a)*x + 0.5*(b+a)  # 变换
  result = 0.5*(b-a) * np.sum(w * f(t))
  
  # 或: scipy.integrate.fixed_quad(f, a, b, n=5)

═══ Gauss 求积族 ═══

  类型            │ 权函数 w(x) │ 区间    │ 应用
  ────────────────┼─────────────┼─────────┼──────
  Gauss-Legendre  │ 1           │ [-1,1]  │ 通用
  Gauss-Chebyshev │ 1/√(1-x²)  │ [-1,1]  │ 端点奇异
  Gauss-Laguerre  │ e⁻ˣ         │ [0,∞)   │ 衰减函数
  Gauss-Hermite   │ e⁻ˣ²        │ (-∞,∞) │ 正态加权
  Gauss-Jacobi    │ (1-x)^α(1+x)^β│[-1,1]│ 通用权

  Gauss-Hermite 在 ML 中:
  → 期望近似: E[f(X)] ≈ Σ wᵢ f(xᵢ), X~N(0,1)
  → 用于变分推断中的积分!

═══ 精度对比 ═══

  积分 ∫₀π sin(x)dx = 2 (精确值)
  
  方法         │ 4 点  │ 8 点  │ 16 点
  ─────────────┼───────┼───────┼───────
  梯形法       │ 1e-2  │ 3e-3  │ 7e-4
  Simpson      │ 6e-5  │ 2e-6  │ 8e-9
  Gauss        │ 7e-8  │ 1e-15 │ 机器精度!

  → Gauss 用极少的点达到极高精度!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 自适应积分</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> adaptive.py</div>
                <pre className="fs-code">{`# ═══ 为什么要自适应？ ═══
#
# 固定步长: 在函数变化剧烈处精度不够
#           在函数平坦处浪费计算!
#
# 自适应: 在需要的地方加密, 不需要的地方放稀!

# ═══ 自适应 Simpson ═══

def adaptive_simpson(f, a, b, tol=1e-10):
    """自适应 Simpson 积分"""
    
    def _quad(f, a, b, fa, fm, fb, S, tol, depth):
        m = (a + b) / 2
        m1 = (a + m) / 2
        m2 = (m + b) / 2
        fm1 = f(m1)
        fm2 = f(m2)
        
        # 左半和右半的 Simpson
        S1 = (m-a)/6 * (fa + 4*fm1 + fm)
        S2 = (b-m)/6 * (fm + 4*fm2 + fb)
        S12 = S1 + S2
        
        # 误差估计
        error = (S12 - S) / 15  # Richardson 外推
        
        if abs(error) < tol or depth > 50:
            return S12 + error  # 外推修正!
        else:
            # 递归细分
            return (_quad(f, a, m, fa, fm1, fm, S1, tol/2, depth+1)
                  + _quad(f, m, b, fm, fm2, fb, S2, tol/2, depth+1))
    
    m = (a + b) / 2
    fa, fm, fb = f(a), f(m), f(b)
    S = (b-a)/6 * (fa + 4*fm + fb)
    return _quad(f, a, b, fa, fm, fb, S, tol, 0)

# SciPy: scipy.integrate.quad ← 底层是 QUADPACK (Fortran!)

# ═══ scipy.integrate.quad 详解 ═══

from scipy.integrate import quad

# 基本用法:
result, error = quad(lambda x: np.exp(-x**2), 0, np.inf)
# result = √π/2 = 0.886...
# error: 绝对误差估计

# 处理奇异点:
result, _ = quad(lambda x: 1/np.sqrt(x), 0, 1)
# x=0 有积分奇异性 → quad 自动处理!

# 指定奇异点位置:
result, _ = quad(f, a, b, points=[c1, c2])
# 在 c1, c2 处函数有不连续 → quad 分段积分

# ═══ 数值微分 (bonus) ═══
#
# 中心差分: f'(x) ≈ (f(x+h) - f(x-h)) / (2h)  → O(h²)
# 复步法:   f'(x) = Im[f(x+ih)] / h           → O(h) 无抵消!
#
#  import cmath
#  def complex_step_deriv(f, x, h=1e-20):
#      return f(x + h*1j).imag / h
#  → 精度接近机器精度! 无灾难性抵消!
#
#  局限: f 必须支持复数运算
#  更好: 自动微分 (PyTorch/JAX)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎲 多维积分与蒙特卡洛</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> multidim.txt</div>
                <pre className="fs-code">{`═══ 维度灾难 (Curse of Dimensionality) ═══

  一维: n 个点 → 精度 O(n⁻⁴) (Simpson)
  d 维: n^d 个点 → 计算量指数爆炸!

  10 维空间, 每维 10 个点 → 10¹⁰ = 100 亿个点!
  → 确定性积分在高维不可行!

═══ 蒙特卡洛积分 (Monte Carlo) ═══

  ∫ f(x) dx ≈ V/N · Σ f(xᵢ),  xᵢ ~ Uniform

  误差: O(1/√N), 与维度无关!

  d=1:  Simpson O(N⁻⁴) >> MC O(N⁻⁰·⁵)
  d=10: Simpson O(N⁻⁰·⁴) << MC O(N⁻⁰·⁵) ← MC 赢!
  
  → 临界维度 ~4-7, 以上 MC 更好!

  import numpy as np
  
  def monte_carlo_integrate(f, bounds, N=100000):
      d = len(bounds)
      volume = np.prod([b-a for a,b in bounds])
      samples = np.array([
          np.random.uniform(a, b, N) for a, b in bounds
      ]).T
      values = np.array([f(s) for s in samples])
      return volume * np.mean(values), volume * np.std(values) / np.sqrt(N)

═══ 方差缩减技术 ═══

  1. 重要性采样 (Importance Sampling):
     ∫ f(x) dx = ∫ [f(x)/g(x)] g(x) dx ≈ 1/N Σ f(xᵢ)/g(xᵢ)
     xᵢ ~ g(x), g(x) 近似 |f(x)| 的形状
     → 方差大幅减小!

  2. 对偶变量 (Antithetic Variates):
     用 (U, 1-U) 成对采样 → 负相关 → 方差减半

  3. 控制变量 (Control Variates):
     知道 E[h(x)] 的精确值 → 修正估计

  4. 分层采样 (Stratified Sampling):
     将域分为若干层, 每层独立采样

═══ 准蒙特卡洛 (Quasi-Monte Carlo) ═══

  用低差异序列 (Low-Discrepancy Sequence) 代替伪随机:
  • Sobol 序列
  • Halton 序列
  • Niederreiter 序列

  收敛率: O((log N)^d / N) → 远优于 O(1/√N)!
  
  from scipy.stats import qmc
  sampler = qmc.Sobol(d=3)
  points = sampler.random(1024)

═══ ML 中的应用 ═══

  1. 变分推断: ELBO 中的期望 → MC 估计
  2. 策略梯度: E[▽log π · R] → REINFORCE
  3. 扩散模型: 去噪分数匹配 → MC
  4. 贝叶斯: 后验期望 → MCMC (Markov Chain MC)
  5. 积分神经网络: Neural ODE → 积分求解`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
