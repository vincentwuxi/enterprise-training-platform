import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['IEEE 754', '舍入误差', '数值稳定性', '灾难性抵消'];

export default function LessonFloatingPoint() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔬 module_01 — 浮点数与误差</div>
      <div className="fs-hero">
        <h1>浮点数与误差：IEEE 754 / 舍入误差 / 数值稳定性</h1>
        <p>
          为什么 <code>0.1 + 0.2 ≠ 0.3</code>？为什么矩阵求逆会"爆炸"？
          浮点运算是所有科学计算的地基——理解它的局限性，
          才能写出<strong>数值稳定</strong>的代码。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 浮点数与误差深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 IEEE 754 标准</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> ieee754.txt</div>
                <pre className="fs-code">{`═══ 浮点数表示 ═══

  (-1)^s × 1.f × 2^(e - bias)

  s: 符号位 (0=正, 1=负)
  f: 尾数 (fraction / mantissa)
  e: 指数 (exponent)

═══ 格式对比 ═══

  格式      │ 总位 │ 符号 │ 指数 │ 尾数  │ 精度
  ──────────┼──────┼──────┼──────┼───────┼──────
  float16   │ 16   │ 1    │ 5    │ 10    │ ~3.3 位十进制
  bfloat16  │ 16   │ 1    │ 8    │ 7     │ ~2.4 位 (ML专用!)
  float32   │ 32   │ 1    │ 8    │ 23    │ ~7.2 位十进制
  float64   │ 64   │ 1    │ 11   │ 52    │ ~15.9 位十进制
  float128  │ 128  │ 1    │ 15   │ 112   │ ~34 位十进制

═══ 特殊值 ═══

  值          │ 符号 │ 指数    │ 尾数
  ────────────┼──────┼─────────┼──────
  +0          │ 0    │ 00...0  │ 00...0
  -0          │ 1    │ 00...0  │ 00...0
  +∞          │ 0    │ 11...1  │ 00...0
  -∞          │ 1    │ 11...1  │ 00...0
  NaN         │ x    │ 11...1  │ ≠ 0
  非规格化数  │ x    │ 00...0  │ ≠ 0

  NaN 规则:
  • NaN ≠ NaN (!) → 检测: x != x 或 np.isnan(x)
  • NaN op anything = NaN (传播!)
  • 0/0, ∞-∞, 0×∞ → NaN

═══ 机器精度 (Machine Epsilon) ═══

  ε_mach = 最小的 ε 使得 fl(1 + ε) > 1

  float32: ε ≈ 1.19 × 10⁻⁷  (2⁻²³)
  float64: ε ≈ 2.22 × 10⁻¹⁶ (2⁻⁵²)

  Python:
  import numpy as np
  np.finfo(np.float32).eps  # 1.1920929e-07
  np.finfo(np.float64).eps  # 2.220446049250313e-16

═══ 范围 ═══

  float32: ±3.4 × 10³⁸  (最大), ±1.2 × 10⁻³⁸ (最小正规格化)
  float64: ±1.8 × 10³⁰⁸ (最大), ±2.2 × 10⁻³⁰⁸ (最小正规格化)

  → 溢出 (overflow): 超过最大 → ±∞
  → 下溢 (underflow): 低于最小 → 0 或非规格化数

═══ bfloat16: AI 的选择 ═══

  为什么不用 float16?
  • float16 指数范围小 (5位→max 65504) → 容易溢出!
  • bfloat16 用 float32 的指数 (8位→范围相同!) 
  • 精度低 (7位尾数) 但对 ML 权重/梯度够用
  
  Google TPU 原生 bfloat16 → PyTorch/TF 全面支持`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 舍入误差 (Rounding Error)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> rounding.py</div>
                <pre className="fs-code">{`# ═══ 为什么 0.1 + 0.2 ≠ 0.3 ═══

>>> 0.1 + 0.2
0.30000000000000004

# 0.1₁₀ = 0.000110011001100...₂ (无限循环!)
# 存储时必须截断 → 引入舍入误差

# ═══ 舍入模式 ═══
# 
# IEEE 754 默认: 四舍六入五取偶 (银行家舍入)
# Round to Nearest, Ties to Even
#
# 2.5 → 2 (偶数)
# 3.5 → 4 (偶数)
# 4.5 → 4 (偶数)
# → 统计上无偏!

# ═══ 误差度量 ═══
#
# 绝对误差: |x̂ - x|
# 相对误差: |x̂ - x| / |x|
#
# 基本定理: fl(x op y) = (x op y)(1 + δ), |δ| ≤ ε_mach
# → 单次运算的相对误差不超过机器精度!
#
# 但多次运算会累积:
# N 次加法的误差上界: O(N·ε_mach)  (最坏情况)
# 实际通常:           O(√N·ε_mach) (随机误差部分抵消)

# ═══ 经典陷阱 ═══

# 1. 相等性判断
if a == b:          # ✗ 危险!
    pass
if abs(a-b) < 1e-9: # ✓ 使用容差
    pass
# 更好: np.allclose(a, b, rtol=1e-9, atol=1e-12)

# 2. 求和顺序影响结果
import numpy as np
a = np.float32(1e8)
b = np.float32(1.0)

# 大数 + 小数 → 小数被"吞掉"
result = a
for _ in range(int(1e7)):
    result += b          # b 相对于 result 太小, 被舍入!
# result ≈ 1e8 (错!) 应该是 1.1e8

# 解决: Kahan 补偿求和
def kahan_sum(values):
    s = 0.0
    c = 0.0  # 补偿项
    for v in values:
        y = v - c       # 补偿上次的误差
        t = s + y       # 新的部分和
        c = (t - s) - y # 这次丢失的低位
        s = t
    return s

# 3. 多项式求值
# Horner 方法: 最少的运算次数 → 最小的舍入误差
# p(x) = a₀ + a₁x + a₂x² + a₃x³
# = a₀ + x(a₁ + x(a₂ + x·a₃))  ← Horner!

def horner(coeffs, x):
    result = coeffs[-1]
    for c in reversed(coeffs[:-1]):
        result = result * x + c
    return result`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 数值稳定性</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> stability.txt</div>
                <pre className="fs-code">{`═══ 条件数 (Condition Number) ═══

  问题的条件数: 输入的微小变化 → 输出变化多大?

  cond(A) = ‖A‖·‖A⁻¹‖

  对线性方程组 Ax = b:
  ‖δx‖/‖x‖ ≤ cond(A) · ‖δb‖/‖b‖

  cond(A) ≈ 1:    良态问题 (误差不放大)
  cond(A) ≈ 10⁶:  输入 6 位精度 → 结果 0 位精度!
  cond(A) ≈ 10¹⁶: float64 下完全无意义!

  Python:
  np.linalg.cond(A)
  # 或 np.linalg.cond(A, p=2)  (2-范数条件数)

═══ 前向稳定 vs 后向稳定 ═══

  前向稳定 (Forward Stable):
    |f̂(x) - f(x)| ≤ ε · |f(x)|
    "计算结果接近真实结果"

  后向稳定 (Backward Stable):
    f̂(x) = f(x + δx), |δx| ≤ ε · |x|
    "结果是某个略微扰动输入的精确解"

  后向稳定更实用!
  → 如果算法后向稳定 + 问题良态 → 结果准确!
  → 如果问题病态, 再好的算法也救不了!

═══ 经典例子: 二次方程 ═══

  ax² + bx + c = 0
  x = (-b ± √(b²-4ac)) / 2a

  当 b² >> 4ac 时:
  • √(b²-4ac) ≈ |b|
  • 一个根涉及 "大数 - 大数" → 灾难性抵消!

  数值稳定的解法:
  if b > 0:
      x₁ = (-b - √(b²-4ac)) / 2a    # 稳定
      x₂ = 2c / (-b - √(b²-4ac))    # 用 Vieta 公式!
  else:
      x₁ = (-b + √(b²-4ac)) / 2a    # 稳定
      x₂ = 2c / (-b + √(b²-4ac))    # Vieta

═══ log-sum-exp 技巧 ═══

  计算 log(Σ eˣⁱ):
  
  直接: e^1000 → overflow!
  
  稳定版:
  m = max(xᵢ)
  log(Σ eˣⁱ) = m + log(Σ e^(xᵢ-m))  ✓
  
  → 确保最大指数为 0, 避免溢出!
  
  scipy.special.logsumexp 就是这么实现的
  PyTorch: torch.logsumexp(x, dim)

═══ softmax 的数值稳定实现 ═══

  不稳定: softmax(x)ᵢ = eˣⁱ / Σ eˣʲ  → overflow!
  稳定版: softmax(x)ᵢ = e^(xᵢ-max(x)) / Σ e^(xⱼ-max(x))  ✓
  
  更好: log_softmax + exp 分开计算`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💥 灾难性抵消</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> catastrophic.py</div>
                <pre className="fs-code">{`# ═══ 灾难性抵消 (Catastrophic Cancellation) ═══
#
# 两个近似相等的数相减 → 有效位数急剧减少!
#
# 例: x = 1.23456789, y = 1.23456780
# x - y = 0.00000009
# 但如果只有 7 位精度:
# x ≈ 1.234568, y ≈ 1.234568  → x - y ≈ 0 (完全丢失!)

import numpy as np

# ═══ 例1: f(x) = (1-cos(x))/x² 在 x→0 ═══

def bad_f(x):
    return (1 - np.cos(x)) / x**2
    # x=1e-8: cos(x)≈1-5e-17 但 fl(cos(1e-8))=1.0!
    # → 1 - 1.0 = 0 → 结果为 0 (真值应为 0.5!)

def good_f(x):
    return 2 * np.sin(x/2)**2 / x**2  # 恒等变换避免抵消!
    # 或用 Taylor: 1/2 - x²/24 + ...

# 验证:
# bad_f(1e-8)   → 0.0         (错!)
# good_f(1e-8)  → 0.5         (对!)

# ═══ 例2: 方差计算 ═══

# 不稳定的"教科书"公式 (两遍公式):
def bad_variance(data):
    n = len(data)
    mean = sum(data) / n
    return sum((x - mean)**2 for x in data) / (n-1)

# 更不稳定的"一遍"公式:
def worse_variance(data):
    n = len(data)
    sum_x = sum(data)
    sum_x2 = sum(x**2 for x in data)
    return (sum_x2 - sum_x**2/n) / (n-1)
    # sum_x2 和 sum_x**2/n 都很大但接近 → 灾难性抵消!

# 数值稳定: Welford 在线算法
def welford_variance(data):
    n = 0
    mean = 0.0
    M2 = 0.0
    for x in data:
        n += 1
        delta = x - mean
        mean += delta / n
        delta2 = x - mean
        M2 += delta * delta2
    return M2 / (n - 1) if n > 1 else 0.0

# 测试: data = [1e9+1, 1e9+2, 1e9+3] (真方差=1.0)
# worse_variance → 可能得到 0 或负数!
# welford       → 1.0 ✓

# ═══ 例3: 求导 (有限差分) ═══

def numerical_derivative(f, x, h):
    return (f(x+h) - f(x)) / h

# h 太大: 截断误差大 (O(h))
# h 太小: 舍入误差大 (O(ε/h))
# 最优 h: h* ≈ √ε ≈ 1.5e-8 (float64)
# 
# 更好: 中心差分 (f(x+h)-f(x-h))/(2h) → O(h²)
# 最优 h: h* ≈ ε^(1/3) ≈ 6e-6
#
# 最好: 自动微分 (无截断误差, 无舍入技巧!)
# → PyTorch autograd, JAX grad

# ═══ 实战建议 ═══
#
# 1. 避免大数减大数 → 用等价数学变换
# 2. 求和用 Kahan 补偿 → np.sum 已内置
# 3. 求方差用 Welford → np.var 已使用
# 4. 指数运算用 logsumexp → scipy 已提供
# 5. 求导用自动微分 → PyTorch/JAX
# 6. 条件差的矩阵 → 预条件或正则化
# 7. 发现 NaN/Inf → np.seterr(all='raise') 调试`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
