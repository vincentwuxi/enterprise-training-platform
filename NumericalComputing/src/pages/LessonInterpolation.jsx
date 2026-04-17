import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['多项式插值', '样条插值', '最小二乘拟合', '高维与正则化'];

export default function LessonInterpolation() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔬 module_03 — 插值与拟合</div>
      <div className="fs-hero">
        <h1>插值与拟合：Lagrange / 样条 / 最小二乘</h1>
        <p>
          给定离散数据点，如何构建连续函数？
          <strong>插值</strong>要求曲线精确通过所有点，
          <strong>拟合</strong>在有噪声时寻找最佳趋势——
          从 Lagrange 到 B-样条，从线性回归到岭回归。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 插值与拟合深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📈 多项式插值</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> polynomial_interp.py</div>
                <pre className="fs-code">{`# ═══ 唯一性定理 ═══
#
# 给 n+1 个不同的点 (x₀,y₀),...,(xₙ,yₙ)
# 存在唯一的 n 次多项式 Pₙ(x) 使得 Pₙ(xᵢ) = yᵢ

# ═══ Lagrange 插值 ═══

def lagrange(x_data, y_data, x):
    n = len(x_data)
    result = 0.0
    for i in range(n):
        # 基函数 Lᵢ(x) = Π_{j≠i} (x-xⱼ)/(xᵢ-xⱼ)
        Li = 1.0
        for j in range(n):
            if j != i:
                Li *= (x - x_data[j]) / (x_data[i] - x_data[j])
        result += y_data[i] * Li
    return result

# 复杂度: O(n²) 每个求值点
# 优点: 公式直观
# 缺点: 增加点需要全部重算

# ═══ Newton 插值 (增量式) ═══
#
# Pₙ(x) = a₀ + a₁(x-x₀) + a₂(x-x₀)(x-x₁) + ...
#
# 差商表:
# f[xᵢ] = yᵢ
# f[xᵢ,xᵢ₊₁] = (f[xᵢ₊₁]-f[xᵢ])/(xᵢ₊₁-xᵢ)
# ...

def newton_divided_diff(x_data, y_data):
    n = len(x_data)
    coeff = y_data.copy().astype(float)
    for j in range(1, n):
        for i in range(n-1, j-1, -1):
            coeff[i] = (coeff[i]-coeff[i-1]) / (x_data[i]-x_data[i-j])
    return coeff

# 优势: 增加新点只需 O(n) 更新!

# ═══ Runge 现象 (⚠️ 致命问题!) ═══
#
# f(x) = 1/(1+25x²) 在 [-1,1] 上等距插值
#
# n=5:  还行
# n=11: 边缘开始振荡
# n=21: 边缘疯狂振荡! 误差 → ∞ !
#
# 原因: 等距点的 Lebesgue 常数指数增长!
#
# 解决方案:
# 1. Chebyshev 节点: xₖ = cos((2k+1)π/(2n+2))
#    → Lebesgue 常数 O(log n) → 稳定!
#
# 2. 分段低次插值 (样条!)
#
# 3. 不用多项式 (用三角函数, 有理函数等)

# ═══ Chebyshev 节点 ═══
import numpy as np

n = 20
# 等距 (不好):
x_uniform = np.linspace(-1, 1, n+1)

# Chebyshev (好!):
k = np.arange(n+1)
x_cheby = np.cos((2*k+1) * np.pi / (2*(n+1)))

# Chebyshev 节点在端点密集 → 抑制 Runge 振荡!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎿 样条插值 (Spline)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> spline.txt</div>
                <pre className="fs-code">{`═══ 为什么用样条？ ═══

  高次多项式插值 → Runge 振荡
  分段低次多项式 → 连续但不光滑

  样条: 分段低次 + 连接处光滑 → 完美折中!

═══ 三次样条 (Cubic Spline) ═══

  每段 [xᵢ, xᵢ₊₁] 上用三次多项式:
  Sᵢ(x) = aᵢ + bᵢ(x-xᵢ) + cᵢ(x-xᵢ)² + dᵢ(x-xᵢ)³

  约束条件 (n 段, n+1 点):
  1. 插值: Sᵢ(xᵢ) = yᵢ,  Sᵢ(xᵢ₊₁) = yᵢ₊₁  (2n 条)
  2. C¹: S'ᵢ(xᵢ₊₁) = S'ᵢ₊₁(xᵢ₊₁)          (n-1 条)
  3. C²: S''ᵢ(xᵢ₊₁) = S''ᵢ₊₁(xᵢ₊₁)         (n-1 条)

  共 4n-2 条, 4n 个未知数 → 需 2 个边界条件!

  边界条件选择:
  • 自然样条: S''(x₀) = S''(xₙ) = 0 (端点曲率为零)
  • 夹持样条: S'(x₀) = f'₀, S'(xₙ) = f'ₙ (给定端点斜率)
  • 周期样条: S(x₀)=S(xₙ), S'(x₀)=S'(xₙ), S''(x₀)=S''(xₙ)
  • Not-a-knot: 第一段和第二段的三阶导连续

  → 解三对角线性方程组 O(n)!

═══ Python 实现 ═══

  from scipy.interpolate import CubicSpline
  
  cs = CubicSpline(x, y, bc_type='natural')
  y_new = cs(x_new)       # 求值
  dy = cs(x_new, 1)       # 一阶导
  ddy = cs(x_new, 2)      # 二阶导
  integral = cs.integrate(a, b)  # 定积分

═══ B-样条 (Basis Spline) ═══

  样条 = B-样条基函数的线性组合
  
  S(x) = Σ cᵢ Bᵢ,ₖ(x)

  B-样条基的性质:
  • 紧支撑: 只在 k+1 个区间非零
  • 归一性: Σ Bᵢ(x) = 1
  • 非负性: Bᵢ(x) ≥ 0
  • 局部性: 改变一个控制点只影响局部!

  应用:
  • CAD/CAM: NURBS (Non-Uniform Rational B-Spline)
  • 字体: TrueType/OpenType 用二次/三次 B-样条
  • 动画: 关键帧插值
  • 有限元: B-样条基函数 (IGA)

═══ 样条 vs 高次多项式 ═══

  方法         │ 精度   │ 光滑性 │ 稳定性 │ 局部性
  ─────────────┼────────┼────────┼────────┼──────
  高次多项式   │ O(hⁿ⁺¹)│ C^∞    │ 差(Runge)│ 无
  线性样条     │ O(h²)  │ C⁰     │ 好     │ 有
  三次样条     │ O(h⁴)  │ C²     │ 好     │ 有
  B-样条       │ O(hᵏ⁺¹)│ Cᵏ⁻¹   │ 好     │ 有`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 最小二乘拟合</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> least_squares.py</div>
                <pre className="fs-code">{`# ═══ 插值 vs 拟合 ═══
#
# 插值: 精确通过所有数据点 (n 个数据 → n-1 次多项式)
# 拟合: 用简单函数近似数据趋势 (允许残差)
#
# 有噪声时: 插值 = 过拟合! 拟合更合理!

import numpy as np

# ═══ 线性最小二乘 ═══
#
# 模型: y = Xβ + ε
# 目标: min ‖y - Xβ‖²
# 解:   β = (XᵀX)⁻¹Xᵀy  (正规方程)
# 或:   β = X⁺y          (伪逆, 用 QR 或 SVD)

def fit_polynomial(x, y, degree):
    """多项式拟合"""
    # 构建 Vandermonde 矩阵
    X = np.vander(x, degree+1, increasing=True)
    # X = [1, x, x², ..., x^d]
    
    # 方法1: 正规方程 (快但不稳定)
    # beta = np.linalg.solve(X.T @ X, X.T @ y)
    
    # 方法2: QR 分解 (稳定!)
    # Q, R = np.linalg.qr(X)
    # beta = np.linalg.solve(R, Q.T @ y)
    
    # 方法3: SVD (最稳定, 处理病态!)
    beta = np.linalg.lstsq(X, y, rcond=None)[0]
    
    return beta

# 实际: np.polyfit(x, y, deg) 或 np.polynomial.polynomial.polyfit

# ═══ QR vs 正规方程 ═══
#
# 正规方程: cond(XᵀX) = cond(X)²  ← 条件数平方!
# QR:       处理 cond(X) 本身 ← 更稳定!
#
# 当 X 列接近线性相关时, 正规方程会失败!

# ═══ 非线性最小二乘 ═══
#
# 模型: y = f(x; θ) (非线性参数)
# 目标: min Σ (yᵢ - f(xᵢ; θ))²
#
# 算法:
# Gauss-Newton: 线性化 + 迭代
# Levenberg-Marquardt: GN + 阻尼 (更稳健!)
#
# scipy.optimize.curve_fit ← 底层 LM 算法

from scipy.optimize import curve_fit

def exponential_model(x, a, b, c):
    return a * np.exp(-b * x) + c

# popt, pcov = curve_fit(exponential_model, x_data, y_data)
# popt: 最优参数
# pcov: 参数协方差矩阵 → 置信区间!

# ═══ 模型选择 ═══
#
# 欠拟合 (degree 太低) ← → 过拟合 (degree 太高)
#
# 评估指标:
# R² = 1 - SSR/SST        (越接近 1 越好)
# AIC = n·ln(SSR/n) + 2k  (越小越好, 惩罚参数数)
# BIC = n·ln(SSR/n) + k·ln(n)  (惩罚更重)
# 交叉验证误差              (最可靠!)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 高维与正则化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> regularization.txt</div>
                <pre className="fs-code">{`═══ 高维插值 ═══

  2D/3D 插值:
  • 双线性插值: 简单但不光滑 (C⁰)
  • 双三次插值: 光滑 (C¹), 图像缩放标准
  • RBF (径向基函数): 散乱数据插值

═══ RBF 插值 ═══

  f(x) = Σ wᵢ φ(‖x - xᵢ‖)

  常见 RBF:
  ─────────────────────────────
  高斯:       φ(r) = e^(-r²/σ²)
  多二次:     φ(r) = √(r² + c²)
  逆多二次:   φ(r) = 1/√(r² + c²)
  薄板样条:   φ(r) = r² log(r)

  Python:
  from scipy.interpolate import RBF  (已弃用, 用 RBFInterpolator)
  from scipy.interpolate import RBFInterpolator
  
  rbf = RBFInterpolator(points, values, kernel='thin_plate_spline')
  result = rbf(new_points)

═══ 正则化拟合 ═══

  问题: 普通最小二乘在 p >> n 时病态!
  
  岭回归 (Ridge / L2):
  min ‖y - Xβ‖² + λ‖β‖²
  → β = (XᵀX + λI)⁻¹Xᵀy
  → 正则化使条件数从 κ(XᵀX) 降到 (κ+λ·n)/λ

  LASSO (L1):
  min ‖y - Xβ‖² + λ‖β‖₁
  → 产生稀疏解 (特征选择!)
  → 需要迭代求解 (坐标下降, ADMM)

  弹性网 (Elastic Net):
  min ‖y - Xβ‖² + λ₁‖β‖₁ + λ₂‖β‖²
  → 结合 L1 稀疏性和 L2 稳定性

═══ 从数值到 ML ═══

  插值/拟合                │ ML 等价
  ─────────────────────────┼──────────────
  多项式拟合               │ 特征工程
  最小二乘                 │ 线性回归
  正规方程                 │ 闭式解
  QR/SVD 分解              │ 数值稳定训练
  岭回归 (L2)              │ Weight Decay
  Lasso (L1)               │ 稀疏性/特征选择
  交叉验证                 │ 超参数调优
  Runge 现象               │ 过拟合
  样条平滑                 │ 非参数回归
  RBF 核                   │ SVM / GP 核

  数值分析是 ML 的数学基础!
  理解插值/拟合 → 理解模型复杂度 vs 泛化`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
