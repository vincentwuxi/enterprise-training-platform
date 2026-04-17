import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['高斯消元', '解空间结构', '秩与零空间', '最小二乘'];

export default function LessonLinearSystems() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">📐 module_04 — 线性方程组</div>
      <div className="fs-hero">
        <h1>线性方程组：高斯消元 / Rank / 解空间结构</h1>
        <p>
          解线性方程组 Ax = b 是线性代数最基本的任务。
          <strong>高斯消元是人类最早的"算法"之一</strong>，但它背后蕴含的秩、
          零空间、解空间结构，直接关联到 ML 中的过拟合/欠拟合诊断、
          特征选择和最小二乘回归。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 线性方程组</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔢 高斯消元法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> gaussian_elimination</div>
                <pre className="fs-code">{`# 高斯消元: 线性方程组的"万能解法"

import numpy as np

# ═══ 问题: 解方程组 ═══
# 2x + y - z  = 8
# -3x - y + 2z = -11
# -2x + y + 2z = -3

# 增广矩阵 [A|b]
Ab = np.array([[ 2,  1, -1,   8],
               [-3, -1,  2, -11],
               [-2,  1,  2,  -3]], dtype=float)

# ═══ 前向消元 (Forward Elimination) ═══
# 目标: 变成上三角形式 (行阶梯形)

# 步骤1: R₂ = R₂ + (3/2)R₁
Ab[1] = Ab[1] + (3/2) * Ab[0]
print(f"Step 1:\\n{Ab}")

# 步骤2: R₃ = R₃ + R₁
Ab[2] = Ab[2] + Ab[0]
print(f"Step 2:\\n{Ab}")

# 步骤3: R₃ = R₃ - 4R₂
Ab[2] = Ab[2] - 4 * Ab[1]
print(f"Step 3 (上三角):\\n{Ab}")

# ═══ 回代 (Back Substitution) ═══
# 从最后一行开始, 逐行求解
z = Ab[2, 3] / Ab[2, 2]
y = (Ab[1, 3] - Ab[1, 2] * z) / Ab[1, 1]
x = (Ab[0, 3] - Ab[0, 1] * y - Ab[0, 2] * z) / Ab[0, 0]
print(f"解: x={x:.0f}, y={y:.0f}, z={z:.0f}")  # x=2, y=3, z=-1

# ═══ NumPy 一行搞定 ═══
A = np.array([[ 2,  1, -1],
              [-3, -1,  2],
              [-2,  1,  2]], dtype=float)
b = np.array([8, -11, -3], dtype=float)

x = np.linalg.solve(A, b)
print(f"NumPy solve: {x}")  # [2, 3, -1]

# ═══ 行阶梯形 vs 简化行阶梯形 ═══
# 行阶梯形 (REF): 上三角, 每行首个非零元(主元)在上一行右边
# 简化行阶梯形 (RREF): 主元=1, 主元上下全为0
#
# REF:                RREF:
# [2  1 -1 | 8]       [1 0 0 | 2]
# [0  ½  ½ | 1]  →    [0 1 0 | 3]
# [0  0  -1| 1]       [0 0 1 |-1]

# ═══ 复杂度分析 ═══
# 前向消元: O(2n³/3)    → 主要开销
# 回代:     O(n²)       → 相对便宜
# 总计:     O(n³)
#
# 对比:
# Cramer 法则: O(n·n!)  → 天文数字!
# LU 分解:    O(n³/3)   → 多次解不同 b 时更优

# ═══ 主元选取 (Pivoting) ═══
# 如果主元太小 → 除法会放大误差!
# 部分主元: 选当前列中绝对值最大的元素做主元
# 完全主元: 选整个子矩阵中最大的 (更稳定但更慢)
# → NumPy 的 solve() 自动做部分主元`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗺️ 解空间的结构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> solution_structure</div>
                <pre className="fs-code">{`# Ax = b 的解: 三种可能

import numpy as np

# ═══ 情况一: 唯一解 (最常见) ═══
# rank(A) = rank([A|b]) = n (列数)
# → 方程数 ≥ 未知数, 且方程独立
A1 = np.array([[1, 2], [3, 4]])
b1 = np.array([5, 11])
print(f"唯一解: {np.linalg.solve(A1, b1)}")  # [1, 2]

# ═══ 情况二: 无穷多解 ═══
# rank(A) = rank([A|b]) < n
# → 有自由变量, 解空间是一个"仿射子空间"
A2 = np.array([[1, 2, 3], [4, 5, 6]])  # 2方程3未知数
b2 = np.array([6, 15])
# 通解 = 特解 + 零空间
# x = x_particular + t·v_null  (t 是自由参数)

# 用伪逆找特解
x_part = np.linalg.lstsq(A2, b2, rcond=None)[0]
print(f"特解: {x_part.round(3)}")

# ═══ 情况三: 无解 ═══
# rank(A) < rank([A|b])
# → 方程组矛盾
A3 = np.array([[1, 1], [1, 1]])  # 两行相同
b3 = np.array([2, 3])            # 但右端不同!
# 1+1=2 和 1+1=3 矛盾
# → 此时最小二乘给出"最好的近似"

# ═══ 通解 = 特解 + 零空间 ═══
# 这是线性方程组最优美的结论:
# 
# x_general = x_particular + x_homogeneous
#
# 其中 x_homogeneous ∈ Null(A)
# 
# 几何直觉:
# - b 维度 = 0: 解是过原点的子空间 (零空间)
# - b ≠ 0: 解是零空间的一个"平移"
#
# 类比:
# 齐次方程 dy/dx = 0 的解: y = C (常量)
# 非齐次 dy/dx = 1 的解: y = x + C
# → 通解 = 特解 + 齐次解!

# ═══ 超定系统 vs 欠定系统 ═══
# ┌────────────────┬───────────┬───────────────┐
# │ 类型            │ 方程 vs 未知│ AI 场景       │
# ├────────────────┼───────────┼───────────────┤
# │ 超定 m > n     │ 方程多     │ 线性回归      │
# │                │ 通常无精确解│ → 最小二乘近似 │
# │ 欠定 m < n     │ 未知数多   │ 过参数化模型  │
# │                │ 无穷多解   │ → 需要正则化   │
# │ 恰定 m = n     │ 刚好       │ → 唯一解      │
# └────────────────┴───────────┴───────────────┘
#
# 深度学习的有趣现象:
# 模型参数 >> 数据点 → 超级欠定!
# 理论上无穷多解 → 但 SGD 偏好"平坦极小值"
# → 隐式正则化 (Implicit Regularization)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 秩与四个基本子空间</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> rank_and_subspaces</div>
                <pre className="fs-code">{`# 秩与四个基本子空间: 线性代数的灵魂

import numpy as np

# ═══ 秩 (Rank) ═══
# rank(A) = 线性无关的列数 = 线性无关的行数
# → 矩阵中"真正有用的信息量"

A = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 9]])

r = np.linalg.matrix_rank(A)
print(f"rank(A) = {r}")  # 2 (不是3! 因为列3=2×列2-列1)

# ═══ 四个基本子空间 (Gilbert Strang 经典) ═══
# 对于 m×n 矩阵 A (rank = r):
#
# 1. 列空间 Col(A) ⊂ ℝᵐ     dim = r
#    = {Ax | x∈ℝⁿ}
#    = A能"到达"的空间
#
# 2. 零空间 Null(A) ⊂ ℝⁿ     dim = n-r
#    = {x | Ax=0}
#    = 被A"杀死"的向量
#
# 3. 行空间 Row(A) ⊂ ℝⁿ      dim = r
#    = Col(Aᵀ)
#
# 4. 左零空间 Null(Aᵀ) ⊂ ℝᵐ   dim = m-r
#    = {y | Aᵀy=0}

# ═══ 正交补关系 ═══
# Col(A) ⊥ Null(Aᵀ)    在 ℝᵐ 中
# Row(A) ⊥ Null(A)      在 ℝⁿ 中
#
# ℝᵐ = Col(A) ⊕ Null(Aᵀ)    (正交直和)
# ℝⁿ = Row(A) ⊕ Null(A)      (正交直和)
#
# 直觉: 输入空间分成两部分
# - Row(A): 有效信息 → 变换后映射到 Col(A)
# - Null(A): 被丢弃 → 变换后变成 0

# ═══ 用 SVD 计算四个子空间 ═══
U, S, Vt = np.linalg.svd(A)
print(f"奇异值: {S.round(3)}")  # [16.848, 1.068, 0.000]

# rank = 非零奇异值个数 = 2
# Col(A) 的基 = U 的前 r 列
# Row(A) 的基 = V 的前 r 行
# Null(A) 的基 = V 的后 n-r 行
# Null(Aᵀ) 的基 = U 的后 m-r 列

print(f"\\n零空间基 (V的第3行):")
print(Vt[2])  # Null(A) 的一组基
# 验证: A @ null_vector ≈ 0
print(f"A @ null = {(A @ Vt[2]).round(10)}")  # ≈ [0,0,0]

# ═══ 秩在 AI 中的意义 ═══
# 1. 特征选择: rank(X) = 有效特征数
#    → 如果 rank < 列数 → 有冗余特征!
#
# 2. 低秩近似: rank-r 矩阵用 2nr 参数存储
#    → SVD 截断 / LoRA / 矩阵补全
#
# 3. 过拟合诊断: 如果 XᵀX 不满秩
#    → (XᵀX)⁻¹ 不存在 → 线性回归不稳定
#    → 需要正则化: (XᵀX + λI)⁻¹ (Ridge)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📉 最小二乘法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> least_squares</div>
                <pre className="fs-code">{`# 最小二乘: 当方程组无精确解时的最优近似

import numpy as np

# ═══ 问题设置 ═══
# 超定系统: m个方程 n个未知数 (m > n)
# Ax = b 没有精确解
# 目标: 找 x* 使得 ||Ax - b||² 最小

# 数据: 3个点 (1,2), (2,3), (3,5)
# 拟合直线 y = mx + c
X = np.array([[1, 1],   # [x, 1] → y = mx + c
              [2, 1],
              [3, 1]])
y = np.array([2, 3, 5])

# ═══ 法线方程 (Normal Equation) ═══
# 数学推导:
# minimize ||Ax - b||²
# 对 x 求导令其为 0:
# ∂/∂x (Ax-b)ᵀ(Ax-b) = 0
# → 2AᵀAx - 2Aᵀb = 0
# → AᵀAx = Aᵀb
# → x* = (AᵀA)⁻¹Aᵀb

x_normal = np.linalg.inv(X.T @ X) @ X.T @ y
print(f"法线方程: m={x_normal[0]:.2f}, c={x_normal[1]:.2f}")
# m=1.5, c=0.33 → y = 1.5x + 0.33

# ═══ 更好的方法: QR 分解 ═══
Q, R = np.linalg.qr(X)
x_qr = np.linalg.solve(R, Q.T @ y)
print(f"QR 方法: m={x_qr[0]:.2f}, c={x_qr[1]:.2f}")

# ═══ 最好的方法: lstsq ═══
x_lstsq, residuals, rank, sv = np.linalg.lstsq(X, y, rcond=None)
print(f"lstsq:   m={x_lstsq[0]:.2f}, c={x_lstsq[1]:.2f}")
print(f"残差²: {residuals}")

# ═══ 几何直觉 ═══
# Ax* = b 的投影到 Col(A) 上
# x* 使得 b - Ax* ⊥ Col(A)
# 即: 残差向量垂直于列空间
# 
# p = A·x* = A(AᵀA)⁻¹Aᵀb
# P = A(AᵀA)⁻¹Aᵀ ← 投影矩阵!
#
# 投影矩阵性质:
# P² = P  (幂等)
# Pᵀ = P  (对称)

P = X @ np.linalg.inv(X.T @ X) @ X.T
print(f"P²=P? {np.allclose(P @ P, P)}")  # True

# ═══ 从最小二乘到机器学习 ═══
# 线性回归: y = Xθ → θ* = (XᵀX)⁻¹Xᵀy
#
# Ridge 回归: θ* = (XᵀX + λI)⁻¹Xᵀy
#   → 加 λI 防止 XᵀX 奇异 (正则化!)
#
# 核回归: θ* = (K + λI)⁻¹y  (K=XXᵀ 核矩阵)
#   → 从 n维参数 → m维对偶 (核技巧)
#
# ┌──────────────┬─────────────────────────┐
# │ 方法          │ 本质                     │
# ├──────────────┼─────────────────────────┤
# │ 线性回归      │ 最小二乘 (无正则化)      │
# │ Ridge        │ 最小二乘 + L2 正则化     │
# │ Lasso        │ 最小二乘 + L1 正则化     │
# │ Elastic Net  │ 最小二乘 + L1 + L2       │
# │ Kernel Ridge │ 核空间中的 Ridge         │
# └──────────────┴─────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
