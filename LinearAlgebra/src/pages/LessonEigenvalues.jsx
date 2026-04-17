import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['特征值直觉', '计算与性质', '对角化', 'AI 应用'];

export default function LessonEigenvalues() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">📐 module_05 — 特征值与特征向量</div>
      <div className="fs-hero">
        <h1>特征值与特征向量：理解变换的"本性"</h1>
        <p>
          特征向量是线性变换中<strong>方向不变</strong>的向量——它只被拉伸或压缩，
          不被旋转。特征值告诉你拉伸了多少倍。
          <strong>Google PageRank、PCA 降维、量子力学里的可观测量</strong>——
          都在找特征值。这是线性代数最深刻的概念之一。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌟 特征值与特征向量</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💡 特征值的几何直觉</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> eigenvalue_intuition</div>
                <pre className="fs-code">{`# 特征值与特征向量: 线性变换的"指纹"

import numpy as np

# ═══ 定义 ═══
# Av = λv
# A: 方阵 (线性变换)
# v: 特征向量 (方向不变的向量, v ≠ 0)
# λ: 特征值 (拉伸倍数)
#
# 直觉: v 经过变换 A 后, 方向不变, 只是长度变为 λ 倍

A = np.array([[3, 1],
              [0, 2]])

# 求特征值和特征向量
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"特征值: {eigenvalues}")       # [3, 2]
print(f"特征向量:\\n{eigenvectors}")   # 每列是一个特征向量

# 验证: Av = λv
v1 = eigenvectors[:, 0]  # λ₁=3 对应的特征向量
print(f"Av₁ = {A @ v1}")
print(f"λ₁·v₁ = {eigenvalues[0] * v1}")  # 相等!

# ═══ 几何意义 ═══
# λ > 1   → 沿特征方向拉伸
# 0 < λ < 1 → 沿特征方向压缩
# λ = 1   → 该方向不变 (不动点)
# λ = 0   → 该方向被压到零 (投影)
# λ < 0   → 该方向翻转 + 缩放
# λ = 复数  → 旋转 (如旋转矩阵)

# ═══ 特征方程 ═══
# Av = λv → (A - λI)v = 0
# 要 v ≠ 0 → (A - λI) 必须奇异
# → det(A - λI) = 0  ← 特征方程!
#
# 2×2 矩阵的特征方程:
# det([[3-λ, 1], [0, 2-λ]]) = 0
# (3-λ)(2-λ) - 0 = 0
# λ² - 5λ + 6 = 0
# (λ-3)(λ-2) = 0
# λ₁ = 3, λ₂ = 2 ✓

# ═══ 特征分解 = 换基 ═══
# A = PΛP⁻¹
# P = [v₁|v₂|...|vₙ]  (特征向量矩阵)
# Λ = diag(λ₁, λ₂, ..., λₙ)  (对角矩阵)
#
# 直觉: 在特征向量组成的坐标系下, A 就是对角矩阵!
# → 每个坐标轴独立缩放, 互不干扰
# → 这就是"对角化"的魅力: 把耦合问题解耦!

P = eigenvectors
Lambda = np.diag(eigenvalues)
A_reconstructed = P @ Lambda @ np.linalg.inv(P)
print(f"PΛP⁻¹ = A? {np.allclose(A_reconstructed, A)}")  # True

# ═══ 矩阵幂次 ═══
# A² = PΛP⁻¹ · PΛP⁻¹ = PΛ²P⁻¹
# Aⁿ = PΛⁿP⁻¹
#
# Λⁿ = diag(λ₁ⁿ, λ₂ⁿ, ..., λₙⁿ)
# → O(n) 而不是 O(n³)!

A_100 = P @ np.diag(eigenvalues**100) @ np.linalg.inv(P)
print(f"A¹⁰⁰ 的近似 (通过特征分解):\\n{A_100.round(2)}")`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧮 计算与关键性质</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> eigen_properties</div>
                <pre className="fs-code">{`# 特征值的重要性质

import numpy as np

A = np.array([[4, -2],
              [1,  1]])

vals, vecs = np.linalg.eig(A)
print(f"特征值: {vals}")  # [3, 2]

# ═══ 关键性质 ═══

# 1. 迹 = 特征值之和
trace = np.trace(A)
eig_sum = np.sum(vals)
print(f"tr(A) = {trace}, Σλ = {eig_sum:.1f}")  # 5 = 3+2

# 2. 行列式 = 特征值之积
det = np.linalg.det(A)
eig_prod = np.prod(vals)
print(f"det(A) = {det:.1f}, Πλ = {eig_prod:.1f}")  # 6 = 3×2

# 3. 对称矩阵的特征值全是实数
S = np.array([[3, 1],
              [1, 3]])  # 对称!
vals_s = np.linalg.eigvalsh(S)  # eigvalsh 专用于对称
print(f"对称矩阵特征值: {vals_s}")  # [2, 4] — 全实数!

# 4. 对称矩阵的特征向量互相正交
vals_s, vecs_s = np.linalg.eigh(S)
print(f"正交性: v₁·v₂ = {np.dot(vecs_s[:,0], vecs_s[:,1]):.10f}")
# ≈ 0 (正交!)

# 5. 旋转矩阵的特征值是复数
theta = np.pi / 4  # 45度旋转
R = np.array([[np.cos(theta), -np.sin(theta)],
              [np.sin(theta),  np.cos(theta)]])
vals_r = np.linalg.eigvals(R)
print(f"旋转矩阵特征值: {vals_r.round(3)}")
# [cos(θ)+i·sin(θ), cos(θ)-i·sin(θ)] — 复数!

# ═══ 谱定理 (Spectral Theorem) ═══
# 对称矩阵一定可以正交对角化:
# A = QΛQᵀ  (Q 正交, Q⁻¹ = Qᵀ)
#
# 这是最美的分解之一:
# 1. 特征值全是实数
# 2. 特征向量两两正交
# 3. 可以组成标准正交基
#
# 推论: 正定矩阵 ←→ 所有特征值 > 0
# → 协方差矩阵是半正定的!

# ═══ 特征值与矩阵范数 ═══
# 谱范数: ||A||₂ = σ_max = √(λ_max(AᵀA))
# 谱半径: ρ(A) = max(|λᵢ|)
# 条件数: κ(A) = σ_max / σ_min
#   κ 越大 → 矩阵越"病态" → 计算越不稳定

cond = np.linalg.cond(A)
print(f"条件数: {cond:.2f}")

# ═══ 重要不等式 ═══
# Rayleigh 商: λ_min ≤ xᵀAx/xᵀx ≤ λ_max
# → 这就是为什么 PCA 找最大特征值 = 找最大方差方向!
# → 也是为什么 SVM 的核矩阵必须半正定`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📏 对角化与矩阵指数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> diagonalization</div>
                <pre className="fs-code">{`# 对角化: 让矩阵"变简单"

import numpy as np

# ═══ 何时可对角化? ═══
# A 可对角化 ←→ 有 n 个线性无关的特征向量
# (特征值可以重复, 但特征向量必须凑够 n 个)
#
# 一定可对角化的矩阵:
# 1. 对称矩阵 → 正交对角化
# 2. n 个不同特征值的矩阵
# 3. 正规矩阵 (AᵀA = AAᵀ)

A = np.array([[2, 1, 0],
              [0, 3, 0],
              [0, 0, 5]])

vals, P = np.linalg.eig(A)
print(f"特征值: {vals}")  # [2, 3, 5]

Lambda = np.diag(vals)
print(f"A = PΛP⁻¹? {np.allclose(P @ Lambda @ np.linalg.inv(P), A)}")

# ═══ 不可对角化的矩阵 (缺陷矩阵) ═══
# Jordan 标准形
defective = np.array([[2, 1],
                       [0, 2]])  # 特征值 λ=2 (重数2)
vals_d = np.linalg.eigvals(defective)
print(f"缺陷矩阵特征值: {vals_d}")  # [2, 2]
# 只有 1 个线性无关的特征向量 → 不可对角化!
# → 需要 Jordan 标准形: [[2,1],[0,2]]

# ═══ 矩阵指数 e^A ═══
# 定义: e^A = I + A + A²/2! + A³/3! + ...
# 如果 A = PΛP⁻¹:
# e^A = P · diag(e^λ₁, e^λ₂, ...) · P⁻¹
#
# 应用: 微分方程 dx/dt = Ax 的解
# x(t) = e^(At) · x(0)
# → 系统稳定 ←→ 所有 Re(λᵢ) < 0

from scipy.linalg import expm

A_small = np.array([[0, -1],
                     [1,  0]])  # 旋转生成元
print(f"e^A = \\n{expm(A_small).round(4)}")  # ≈ 旋转 1 弧度!

# ═══ Markov 链的稳态 ═══
# 转移矩阵 P 的特征值 λ=1 对应的特征向量 = 稳态分布!
# (这就是 PageRank 的原理)

P_markov = np.array([[0.7, 0.3, 0.2],
                      [0.2, 0.5, 0.3],
                      [0.1, 0.2, 0.5]])

vals_m, vecs_m = np.linalg.eig(P_markov.T)
# λ=1 对应的特征向量就是稳态分布
idx = np.argmin(np.abs(vals_m - 1.0))
stationary = np.abs(vecs_m[:, idx])
stationary = stationary / stationary.sum()
print(f"\\nMarkov 稳态分布: {stationary.round(4)}")
# 验证: P.T @ π = π
print(f"Pᵀπ = π? {np.allclose(P_markov.T @ stationary, stationary)}")

# ═══ 幂迭代法 (Power Iteration) ═══
# 简单方法求最大特征值:
# 1. 随机向量 v
# 2. 重复: v = Av / ||Av||
# 3. 收敛到最大特征值对应的特征向量!
#
# → Google PageRank 就是用幂迭代求最大特征向量!
# → 不需要对整个矩阵做特征分解`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 AI 中的特征值应用</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> eigenvalues_in_ai</div>
                <pre className="fs-code">{`# 特征值无处不在:  AI/ML 的核心工具

import numpy as np

# ═══ 1. PCA (主成分分析) ═══
# 协方差矩阵 C = (1/n) XᵀX 的特征分解
# 最大特征值方向 = 数据方差最大的方向!

# 生成 2D 相关数据
np.random.seed(42)
data = np.random.randn(200, 2) @ [[2, 1], [1, 3]]

# 中心化
data_centered = data - data.mean(axis=0)
cov_matrix = np.cov(data_centered.T)

# 特征分解
vals, vecs = np.linalg.eigh(cov_matrix)
print(f"PCA 特征值: {vals.round(2)}")
# 大特征值 = 主方向的方差
# 方差解释比 = λᵢ / Σλ
explained = vals / vals.sum()
print(f"方差解释比: {(explained*100).round(1)}%")

# ═══ 2. 谱聚类 (Spectral Clustering) ═══
# 图拉普拉斯矩阵 L = D - W 的特征分解
# 最小的 k 个特征向量 → k 个聚类的指示
# 0 特征值的个数 = 连通分量个数

# 邻接矩阵
W = np.array([[0, 1, 1, 0],
              [1, 0, 1, 0],
              [1, 1, 0, 1],
              [0, 0, 1, 0]], dtype=float)

D = np.diag(W.sum(axis=1))  # 度矩阵
L = D - W                    # 拉普拉斯矩阵
vals_L = np.linalg.eigvalsh(L)
print(f"\\n拉普拉斯特征值: {vals_L.round(3)}")
# 第一个特征值 ≈ 0 (连通图有1个0特征值)

# ═══ 3. Google PageRank ═══
# 网页链接 → 转移矩阵 M
# PageRank = M 的特征值 1 对应的特征向量
# → 幂迭代: v_{t+1} = M·v_t  直到收敛

# ═══ 4. Hessian 矩阵的特征值 ═══
# H = ∂²L/∂θ² (损失函数的二阶导数矩阵)
# - 所有 λ > 0 → 局部极小值
# - 存在 λ < 0 → 鞍点
# - 最大 λ → 损失曲面最"陡"的方向
# - λ_max/λ_min = 条件数 → 优化难度
#
# 研究发现:
# 深度网络的 Hessian 通常:
# - 大部分特征值 ≈ 0 (低秩)
# - 少数大特征值 → 关键方向
# - 很少负特征值 → 鞍点而非局部最小

# ═══ 5. 注意力矩阵分析 ═══
# Softmax(QKᵀ/√d) 的特征值分析:
# - 低秩 → 注意力集中在少数 token
# - 高秩 → 注意力分散
# → 这是 Attention Head 质量分析的方法之一

# ═══ 对照表 ═══
# ┌──────────────────┬───────────────────────┐
# │ AI 应用           │ 特征值的角色           │
# ├──────────────────┼───────────────────────┤
# │ PCA 降维          │ 最大特征值 = 主成分    │
# │ 谱聚类            │ 最小特征值 = 聚类边界  │
# │ PageRank          │ 最大特征向量 = 排名    │
# │ Hessian 分析     │ 特征值符号 = 极值类型  │
# │ 图神经网络        │ 谱滤波 = 特征值域操作  │
# │ 稳定性分析        │ |λ_max| < 1 → 稳定     │
# │ 条件数            │ κ = λ_max/λ_min → 病态 │
# └──────────────────┴───────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
