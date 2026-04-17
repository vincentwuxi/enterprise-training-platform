import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Euler 与 RK 方法', '刚性问题', '自适应步长', '实战案例'];

export default function LessonODESolvers() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔬 module_05 — 常微分方程</div>
      <div className="fs-hero">
        <h1>常微分方程：Euler / RK4 / 刚性问题 / 自适应步长</h1>
        <p>
          从行星轨道到神经网络——ODE 无处不在。
          掌握从<strong>Euler 法</strong>到<strong>隐式多步法</strong>的求解体系，
          理解<strong>刚性问题</strong>为何需要特殊处理。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 ODE 求解器深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 Euler 与 Runge-Kutta</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> ode_methods.py</div>
                <pre className="fs-code">{`# ═══ 初值问题 (IVP) ═══
#
# dy/dt = f(t, y),  y(t₀) = y₀
#
# 目标: 给定 f 和初值, 求 y(t) 在后续时刻的值

import numpy as np

# ═══ 前向 Euler (最简单, 几乎不要用!) ═══

def euler(f, y0, t_span, h):
    t = np.arange(t_span[0], t_span[1]+h, h)
    y = np.zeros((len(t), len(y0)))
    y[0] = y0
    for i in range(len(t)-1):
        y[i+1] = y[i] + h * f(t[i], y[i])
    return t, y

# 误差: O(h) (一阶) → 精度太低!
# 稳定性差 → 步长必须很小!

# ═══ 改进 Euler (Heun / 梯形预测-校正) ═══

def heun(f, y0, t_span, h):
    t = np.arange(t_span[0], t_span[1]+h, h)
    y = np.zeros((len(t), len(y0)))
    y[0] = y0
    for i in range(len(t)-1):
        k1 = f(t[i], y[i])
        k2 = f(t[i]+h, y[i]+h*k1)
        y[i+1] = y[i] + h/2 * (k1 + k2)
    return t, y
# 误差: O(h²) → 好了一些

# ═══ RK4 (经典四阶 Runge-Kutta) ═══

def rk4(f, y0, t_span, h):
    t = np.arange(t_span[0], t_span[1]+h, h)
    y = np.zeros((len(t), len(y0)))
    y[0] = y0
    for i in range(len(t)-1):
        k1 = f(t[i], y[i])
        k2 = f(t[i] + h/2, y[i] + h/2*k1)
        k3 = f(t[i] + h/2, y[i] + h/2*k2)
        k4 = f(t[i] + h,   y[i] + h*k3)
        y[i+1] = y[i] + h/6 * (k1 + 2*k2 + 2*k3 + k4)
    return t, y

# 误差: O(h⁴) (四阶!) → 每步 4 次函数求值
# 效率极高: 步长翻倍 → 精度提升 16 倍!
# 这是固定步长方法的标准选择

# ═══ Butcher 表 (统一描述 RK 方法) ═══
#
# c₁ │ a₁₁ a₁₂ ...
# c₂ │ a₂₁ a₂₂ ...
# ...
# ────┼──────────────
#     │ b₁  b₂  ...
#
# RK4 的 Butcher 表:
# 0   │
# 1/2 │ 1/2
# 1/2 │ 0   1/2
# 1   │ 0   0   1
# ────┼──────────────
#     │ 1/6 1/3 1/3 1/6

# ═══ 方法对比 ═══
#
# 方法   │ 阶 │ 每步求值 │ 局部误差 │ 稳定域
# ───────┼────┼──────────┼──────────┼──────
# Euler  │ 1  │ 1        │ O(h²)    │ 小
# Heun   │ 2  │ 2        │ O(h³)    │ 中
# RK4    │ 4  │ 4        │ O(h⁵)    │ 大
# RK45   │4/5 │ 6        │ 自适应   │ 大`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 刚性问题 (Stiff Problems)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> stiff.txt</div>
                <pre className="fs-code">{`═══ 什么是刚性？ ═══

  直觉: 解变化缓慢, 但系统中存在快速衰减的模式
  → 显式方法必须用极小步长 (跟踪快模式的稳定性)
  → 即使解很平滑, 也需要百万步 → 极其浪费!

  经典例子:
  dy/dt = -1000(y - sin(t)) + cos(t)
  
  → 解 ≈ sin(t) (平滑!)
  → 但瞬态分量 e⁻¹⁰⁰⁰ᵗ 极快衰减
  → Euler 需要 h < 2/1000 = 0.002 才稳定!
  → RK4 也好不了多少!

═══ 稳定域分析 ═══

  测试方程: y' = λy (λ < 0)
  数值解: yₙ₊₁ = R(hλ) · yₙ
  
  稳定条件: |R(hλ)| < 1

  前向 Euler: R(z) = 1 + z
  → 稳定域: 圆 |1+z| < 1 → |hλ| < 2
  → λ = -1000 ⇒ h < 0.002!

  后向 Euler: R(z) = 1/(1-z)
  → 稳定域: |1/(1-z)| < 1 → Re(z) < 0 全覆盖!
  → A-稳定! 任何 h 都稳定!

═══ 隐式方法 ═══

  后向 Euler (隐式一阶):
  yₙ₊₁ = yₙ + h·f(tₙ₊₁, yₙ₊₁)  ← yₙ₊₁ 出现在两边!
  → 需要求解非线性方程! (通常用 Newton 迭代)
  → 每步贵很多, 但步长可以很大!

  梯形法 (隐式二阶):
  yₙ₊₁ = yₙ + h/2·[f(tₙ,yₙ) + f(tₙ₊₁,yₙ₊₁)]
  → A-稳定 + 二阶 → 实用!

═══ BDF 方法 (Backward Differentiation Formula) ═══

  使用多个历史点的隐式多步法:
  BDF1 = 后向 Euler
  BDF2: yₙ₊₁ = 4/3 yₙ - 1/3 yₙ₋₁ + 2h/3 f(tₙ₊₁,yₙ₊₁)
  → 最高 BDF6 稳定, BDF7+ 不稳定!

  → 这就是 scipy.integrate.solve_ivp(method='BDF') !
  → MATLAB ode15s 也是 BDF!

═══ 选择指南 ═══

  问题类型    │ 推荐方法          │ scipy 参数
  ────────────┼───────────────────┼──────────
  非刚性      │ RK45 (默认)       │ 'RK45'
  刚性        │ BDF 或 Radau      │ 'BDF', 'Radau'
  中等刚性    │ 隐式 RK (Radau)   │ 'Radau'
  高精度      │ DOP853 (8阶)      │ 'DOP853'
  
  不确定? → 先用 RK45, 如果太慢 → 换 BDF`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📏 自适应步长控制</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> adaptive_step.py</div>
                <pre className="fs-code">{`# ═══ 嵌入式 RK 方法 (Embedded RK) ═══
#
# 同时计算两个不同阶的近似:
# ŷ (p 阶) 和 ỹ (p+1 阶)
# 误差估计: err ≈ |ŷ - ỹ|
# → 不需要额外函数求值!

# ═══ Dormand-Prince (RK45) ═══
#
# 最流行的自适应 ODE 求解器!
# • 4 阶解用于推进
# • 5 阶解用于误差估计 (FSAL 技巧)
# • 6 次函数求值 (但 FSAL 省 1 次 → 5 次)
#
# 这就是 scipy.integrate.solve_ivp 的默认方法!

from scipy.integrate import solve_ivp

# ═══ 步长控制策略 ═══
#
# 给定容差 atol, rtol:
# 标准化误差: e = err / (atol + rtol * |y|)
# 
# 如果 |e| ≤ 1: 接受这步, 尝试增大 h
#   h_new = h * min(5, 0.9 * |e|^(-1/5))  (不超过 5 倍)
#
# 如果 |e| > 1: 拒绝这步, 减小 h 重来
#   h_new = h * max(0.2, 0.9 * |e|^(-1/5)) (不低于 0.2 倍)
#
# 安全因子 0.9: 保守一点, 减少拒绝次数

# ═══ 使用 solve_ivp ═══

def lorenz(t, y, sigma=10, rho=28, beta=8/3):
    """洛伦兹吸引子"""
    x, y_val, z = y
    return [
        sigma * (y_val - x),
        x * (rho - z) - y_val,
        x * y_val - beta * z
    ]

sol = solve_ivp(
    lorenz,
    t_span=[0, 50],
    y0=[1.0, 1.0, 1.0],
    method='RK45',      # 默认
    rtol=1e-8,           # 相对容差
    atol=1e-10,          # 绝对容差
    dense_output=True,   # 连续输出 (插值)
    max_step=0.01,       # 最大步长 (混沌系统需要)
)

# sol.t: 自适应时间点 (不等距!)
# sol.y: 对应的解
# sol.sol(t): 任意时刻的解 (连续输出)

# ═══ 事件检测 ═══

def event_ground(t, y):
    return y[1]  # y = 0 时触发
event_ground.terminal = True   # 停止积分
event_ground.direction = -1    # 只检测下降过零

sol = solve_ivp(f, t_span, y0, events=event_ground)
# sol.t_events: 事件发生的时间

# ═══ atol vs rtol ═══
#
# rtol = 相对容差: 控制有效数字
#   rtol=1e-6 → 约 6 位有效数字
#
# atol = 绝对容差: 控制零附近的精度
#   当 y ≈ 0 时, 相对误差无意义 → atol 接管
#
# 建议: rtol = 1e-8, atol = 1e-10 (科学计算)
#       rtol = 1e-3, atol = 1e-6  (快速预览)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌍 实战案例</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> applications.txt</div>
                <pre className="fs-code">{`═══ 1. 天体力学 (N-Body) ═══

  mᵢ d²rᵢ/dt² = Σⱼ G·mᵢ·mⱼ(rⱼ-rᵢ)/|rⱼ-rᵢ|³

  化为一阶 ODE:
  drᵢ/dt = vᵢ
  dvᵢ/dt = Σⱼ G·mⱼ(rⱼ-rᵢ)/|rⱼ-rᵢ|³

  特殊方法: 辛积分器 (Symplectic)
  • Störmer-Verlet (Leapfrog)
  • 保持哈密顿量 (能量不漂移!)
  • 长期轨道计算的标准方法

═══ 2. 化学反应动力学 ═══

  A → B → C (连续反应)
  d[A]/dt = -k₁[A]
  d[B]/dt = k₁[A] - k₂[B]
  d[C]/dt = k₂[B]

  k₁ = 1000, k₂ = 1 → 刚性! (快反应 + 慢反应)
  → 必须用 BDF/Radau!

═══ 3. Neural ODE (深度学习!) ═══

  ResNet: yₗ₊₁ = yₗ + f(yₗ, θₗ)  ← 离散
  Neural ODE: dy/dt = f(y, t, θ)   ← 连续!

  • 用 ODE solver 替代 ResNet 层
  • 内存 O(1) (adjoint method 反向传播)
  • 连续时间序列建模

  Python (torchdiffeq):
  from torchdiffeq import odeint_adjoint
  y = odeint_adjoint(func, y0, t, method='dopri5')

═══ 4. 控制系统 ═══

  状态方程: ẋ = Ax + Bu
  输出方程: y = Cx + Du

  → 线性 ODE → 矩阵指数: x(t) = e^(At)x₀

  scipy.linalg.expm(A*t) @ x0

═══ ODE vs PDE ═══

  ODE: 一个自变量 (时间)
  PDE: 多个自变量 (时间 + 空间)

  PDE 常见处理:
  1. 方法线 (MOL): 空间离散化 → 大 ODE 系统
     ∂u/∂t = D·∂²u/∂x² 
     → 空间用有限差分 → du/dt = D·L·u
     → L 是三对角矩阵 → 使用 BDF 时间推进!

  2. 有限元 (FEM)
  3. 谱方法

═══ 求解器的"价格" ═══

  方法     │ f 求值/步 │ 适用    │ 精度
  ─────────┼───────────┼─────────┼──────
  Euler    │ 1         │ 教学    │ O(h)
  RK4      │ 4         │ 非刚性  │ O(h⁴)
  RK45     │ 5-6       │ 自适应  │ O(h⁴/h⁵)
  DOP853   │ 12        │ 高精度  │ O(h⁸)
  BDF      │ 1+Newton  │ 刚性    │ O(h¹⁻⁶)
  Radau    │ 隐式 RK   │ 刚性    │ O(h⁵)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
