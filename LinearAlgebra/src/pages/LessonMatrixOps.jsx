import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['矩阵乘法', '逆矩阵', '行列式', '矩阵分解'];

export default function LessonMatrixOps() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">📐 module_03 — 矩阵运算</div>
      <div className="fs-hero">
        <h1>矩阵运算：乘法 / 逆矩阵 / 行列式 / LU 分解</h1>
        <p>
          矩阵乘法不是"对应位置相乘"——它是<strong>线性变换的复合</strong>。
          行列式告诉你变换如何改变"体积"。逆矩阵让你"撤销"变换。
          而 LU/QR 分解让你把复杂变换拆成简单步骤。
          <strong>掌握这些运算，就是掌握了线性代数的工具箱</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧮 矩阵运算</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>✖️ 矩阵乘法的四种理解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> matrix_multiplication</div>
                <pre className="fs-code">{`# 矩阵乘法: 远不止 "行×列 求和"

import numpy as np

A = np.array([[1, 2],
              [3, 4]])  # 2×2
B = np.array([[5, 6],
              [7, 8]])  # 2×2

C = A @ B  # 矩阵乘法
print(f"A×B = \\n{C}")
# [[19, 22],
#  [43, 50]]

# ═══ 视角一：行×列 (逐元素) ═══
# C[i,j] = Σ A[i,k] * B[k,j]
# C[0,0] = 1×5 + 2×7 = 19
# 计算复杂度: O(n³)

# ═══ 视角二：列向量的线性组合 ═══
# A×B 的每一列 = A 的列向量的线性组合
# C[:,0] = B[0,0]·A[:,0] + B[1,0]·A[:,1]
#        = 5·[1,3] + 7·[2,4] = [5+14, 15+28] = [19, 43] ✓
#
# 直觉: B 的每一列告诉你 "如何混合 A 的列"

# ═══ 视角三：行向量的线性组合 ═══
# A×B 的每一行 = B 的行向量的线性组合
# C[0,:] = A[0,0]·B[0,:] + A[0,1]·B[1,:]
#        = 1·[5,6] + 2·[7,8] = [19, 22] ✓

# ═══ 视角四：外积之和 ═══
# A×B = Σ A[:,k] × B[k,:]  (列向量 × 行向量 = 秩1矩阵)
rank1_sum = (np.outer(A[:,0], B[0,:]) + 
             np.outer(A[:,1], B[1,:]))
print(f"外积之和 = \\n{rank1_sum}")  # 与C相同!

# ═══ 不满足交换律! ═══
print(f"AB ≠ BA? {not np.allclose(A @ B, B @ A)}")  # True

# ═══ 分块矩阵乘法 ═══
# 大矩阵可以分块, 块之间像标量一样相乘
# 这就是 GPU 矩阵乘法的核心思想:
# | A₁₁ A₁₂ |   | B₁₁ B₁₂ |   | A₁₁B₁₁+A₁₂B₂₁  ... |
# | A₂₁ A₂₂ | × | B₂₁ B₂₂ | = | ...               ... |
#
# GPU 把大矩阵分成 tile (通常 16×16 或 32×32)
# 每个 CUDA block 计算一个 tile 的结果
# → 这就是 NVIDIA Tensor Core 的工作原理!

# ═══ 计算复杂度 ═══
# 朴素乘法:   O(n³)
# Strassen:    O(n^2.807)  — 7次乘法代替8次
# 最优理论:    O(n^2.373)  — 但常数太大, 实际不用
# GPU 实际:    FLOPS = 2n³  (每个元素: 1次乘 + 1次加)
#
# 例: A(1000×1000) × B(1000×1000)
# FLOPs = 2 × 10⁹ = 2 GFLOP
# A100 GPU: 312 TFLOPS → 仅需 ~6.4μs (理论)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>↩️ 逆矩阵：撤销变换</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> inverse_matrix</div>
                <pre className="fs-code">{`# 逆矩阵: "撤销"线性变换

import numpy as np

# ═══ 定义 ═══
# A 的逆矩阵 A⁻¹ 满足: A·A⁻¹ = A⁻¹·A = I (单位矩阵)
# → A 把向量变换到某处, A⁻¹ 把它变回来

A = np.array([[2, 1],
              [1, 1]])

A_inv = np.linalg.inv(A)
print(f"A⁻¹ = \\n{A_inv}")
# [[ 1, -1],
#  [-1,  2]]

# 验证
print(f"A·A⁻¹ = I? {np.allclose(A @ A_inv, np.eye(2))}")  # True

# ═══ 2×2 逆矩阵公式 ═══
# A = [[a, b], [c, d]]
# A⁻¹ = (1/det(A)) · [[d, -b], [-c, a]]
# det(A) = ad - bc

a, b, c, d = 2, 1, 1, 1
det = a*d - b*c  # 2-1 = 1
A_inv_manual = np.array([[d, -b], [-c, a]]) / det
print(f"手算 A⁻¹ = \\n{A_inv_manual}")  # 与上面一致

# ═══ 何时不可逆? ═══
# det(A) = 0 → 奇异矩阵 (Singular)
# → 变换把空间"压扁"了 (降维), 信息丢失, 无法恢复

singular = np.array([[1, 2],
                      [2, 4]])  # 第二行 = 2×第一行
print(f"det = {np.linalg.det(singular):.1f}")  # 0!
# np.linalg.inv(singular)  # → LinAlgError!

# ═══ 求解线性方程组 ═══
# Ax = b → x = A⁻¹·b
# 但! 实际计算中几乎从不用 inv()
# 原因: inv() 数值不稳定 + 慢
# 正确做法: np.linalg.solve(A, b)

b = np.array([3, 2])
x = np.linalg.solve(A, b)  # 推荐!
x_bad = np.linalg.inv(A) @ b  # 不推荐
print(f"solve: x = {x}")
print(f"inv:   x = {x_bad}")  # 结果相同, 但 solve 更准

# ═══ 伪逆 (Moore-Penrose Pseudo-inverse) ═══
# 当 A 不是方阵或不可逆时, 用伪逆
# A⁺ = (AᵀA)⁻¹Aᵀ  (左伪逆, 超定系统)
# 最小二乘拟合本质就是求伪逆!
A_rect = np.array([[1, 2],
                    [3, 4],
                    [5, 6]])  # 3×2, 不可逆

A_pinv = np.linalg.pinv(A_rect)
print(f"伪逆形状: {A_pinv.shape}")  # (2, 3)
# A⁺·A ≈ I
print(f"A⁺A ≈ I? {np.allclose(A_pinv @ A_rect, np.eye(2))}")

# ═══ AI 中的逆矩阵 ═══
# 1. 最小二乘: θ = (XᵀX)⁻¹Xᵀy
# 2. 高斯过程: K⁻¹ (核矩阵的逆)
# 3. 自然梯度: F⁻¹∇L (Fisher 信息矩阵的逆)
# 4. Kalman 滤波: (H·P·Hᵀ + R)⁻¹`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 行列式：变换的"体积缩放因子"</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> determinant</div>
                <pre className="fs-code">{`# 行列式: 衡量线性变换"拉伸/压缩"空间的程度

import numpy as np

# ═══ 几何直觉 ═══
# det(A) = 线性变换 A 把单位正方体变成的"体积"
#
# |det(A)| > 1 → 空间被拉伸
# |det(A)| = 1 → 体积不变 (旋转)
# |det(A)| < 1 → 空间被压缩
# det(A) = 0  → 空间被压扁 (降维!)
# det(A) < 0  → 空间被翻转 (手性改变)

# ═══ 2×2 行列式 ═══
# det([[a,b],[c,d]]) = ad - bc
A = np.array([[3, 1],
              [1, 2]])
print(f"det(A) = {np.linalg.det(A):.1f}")  # 5
# 单位正方形 → 面积变为 5 倍的平行四边形

# ═══ 3×3 行列式 (Sarrus 法则) ═══
B = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 0]])
print(f"det(B) = {np.linalg.det(B):.1f}")  # 27

# ═══ 行列式的性质 ═══
# 1. det(AB) = det(A)·det(B)   → 变换复合 = 体积因子相乘
# 2. det(Aᵀ) = det(A)          → 转置不改变"体积"
# 3. det(A⁻¹) = 1/det(A)       → 逆变换恢复体积
# 4. det(cA) = cⁿ·det(A)       → n维每个方向缩放c倍
# 5. 交换两行 → det 变号
# 6. 某行全0 → det = 0

# 性质验证
print(f"det(A)·det(B) = {np.linalg.det(A)*np.linalg.det(B):.1f}")
# 等于 det(AB)?
print(f"det(AB) = {np.linalg.det(A @ B[:2,:2]):.1f}")  # 不行,维度不同

C = np.array([[2, 0], [0, 3]])  # 缩放矩阵
print(f"det(C) = {np.linalg.det(C):.1f}")  # 6 = 2×3
print(f"det(2C) = {np.linalg.det(2*C):.1f}")  # 24 = 2²×6

# ═══ 行列式与线性方程组 ═══
# Cramer 法则: x_i = det(A_i) / det(A)
# A_i = A 的第 i 列替换为 b
#
# 实际不用 Cramer (太慢 O(n·n!))
# 但理论上很优雅

# ═══ 行列式在 AI 中的应用 ═══
# 1. 高斯分布:
#    p(x) = 1/√(2π|Σ|) · exp(-½(x-μ)ᵀΣ⁻¹(x-μ))
#    |Σ| = det(Σ) → 协方差矩阵的行列式!
#    → 衡量数据的"分散程度"
#
# 2. 变分自编码器 (VAE):
#    KL 散度中包含 log|Σ| = log(det(Σ))
#
# 3. 归一化流 (Normalizing Flow):
#    换元公式: p(x) = p(z) · |det(∂f/∂z)|⁻¹
#    → Jacobian 行列式! 必须高效计算
#    → RealNVP/GLOW 设计三角 Jacobian → det = 对角线乘积
#
# 4. 行列式点过程 (DPP):
#    用行列式衡量子集多样性 → 推荐系统去重`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 矩阵分解：把复杂问题变简单</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> matrix_decomposition</div>
                <pre className="fs-code">{`# 矩阵分解: 线性代数的核心工具

import numpy as np
from scipy.linalg import lu, qr, cholesky

# ═══ 1. LU 分解 ═══
# A = L·U  (下三角 × 上三角)
# → 高斯消元的矩阵表示
# → 求解 Ax=b: 先 Ly=b (前代), 再 Ux=y (回代)
A = np.array([[2, 1, 1],
              [4, 3, 3],
              [8, 7, 9]], dtype=float)

P, L, U = lu(A)
print(f"L = \\n{L.round(2)}")
print(f"U = \\n{U.round(2)}")
print(f"PLU = A? {np.allclose(P @ L @ U, A)}")  # True

# ═══ 2. QR 分解 ═══
# A = Q·R  (正交矩阵 × 上三角)
# Q: 列向量两两正交且单位长度
# → Gram-Schmidt 正交化的矩阵表示
# → 用于最小二乘、QR 迭代求特征值
Q, R = qr(A)
print(f"QᵀQ = I? {np.allclose(Q.T @ Q, np.eye(3))}")

# ═══ 3. Cholesky 分解 ═══
# 条件: A 必须是正定对称矩阵
# A = LLᵀ  (下三角 × 其转置)
# → 比 LU 快一倍!
# → 用于高斯过程中的核矩阵
S = np.array([[4, 2], [2, 3]], dtype=float)
L_chol = cholesky(S, lower=True)
print(f"Cholesky L = \\n{L_chol}")
print(f"LLᵀ = S? {np.allclose(L_chol @ L_chol.T, S)}")

# ═══ 4. 特征分解 (下一模块详解) ═══
# A = P·Λ·P⁻¹
# Λ = 对角矩阵 (特征值)
# P = 特征向量矩阵

# ═══ 5. SVD (模块六详解) ═══
# A = U·Σ·Vᵀ
# → 最通用的分解, 任何矩阵都能做!

# ═══ 分解方法对照表 ═══
# ┌─────────────┬──────────┬──────────┬───────────┐
# │ 分解         │ 条件     │ 复杂度    │ 主要用途   │
# ├─────────────┼──────────┼──────────┼───────────┤
# │ LU          │ 方阵     │ O(n³/3)  │ 解方程组   │
# │ QR          │ 任意     │ O(2mn²)  │ 最小二乘   │
# │ Cholesky    │ 正定对称 │ O(n³/6)  │ 高斯过程   │
# │ 特征分解    │ 方阵     │ O(n³)    │ PCA/谱分析 │
# │ SVD         │ 任意     │ O(mn²)   │ 推荐/降维  │
# └─────────────┴──────────┴──────────┴───────────┘
#
# 选择指南:
# 解 Ax=b → LU (或 QR)
# 最小二乘 → QR
# 正定核矩阵 → Cholesky
# 对称矩阵特征 → 特征分解
# 通用降维/压缩 → SVD`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
