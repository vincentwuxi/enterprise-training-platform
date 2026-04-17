import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['高斯消元与 LU', 'Cholesky 分解', '迭代法', '实战对比'];

export default function LessonLinearSystems() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔬 module_02 — 线性方程组</div>
      <div className="fs-hero">
        <h1>线性方程组：LU 分解 / Cholesky / 迭代法</h1>
        <p>
          Ax = b 是科学计算的核心问题——
          从<strong>高斯消元</strong>到<strong>LU 分解</strong>的直接法，
          从<strong>Jacobi</strong>到<strong>共轭梯度</strong>的迭代法，
          掌握何时用什么算法是数值分析的基本功。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 线性方程组深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔢 高斯消元与 LU 分解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> lu_decomposition.py</div>
                <pre className="fs-code">{`# ═══ 高斯消元 (Gaussian Elimination) ═══
#
# Ax = b → 前向消元 → Ux = c → 回代
# 复杂度: O(n³/3) 浮点运算
#
# 问题: 主元可能为 0 或很小 → 数值不稳定!
# 解决: 部分选主元 (Partial Pivoting)

import numpy as np

# ═══ LU 分解 (带部分选主元) ═══
#
# PA = LU
# P: 置换矩阵 (行交换记录)
# L: 下三角 (对角线为 1)
# U: 上三角
#
# 解 Ax = b:
# 1. 分解 PA = LU (一次性! O(n³/3))
# 2. Ly = Pb       (前代, O(n²))
# 3. Ux = y        (回代, O(n²))
#
# → 分解只需做一次, 可解多个右端 b!

def lu_decompose(A):
    n = A.shape[0]
    L = np.eye(n)
    U = A.astype(float).copy()
    P = np.eye(n)
    
    for k in range(n-1):
        # 部分选主元: 找列 k 中最大元素
        max_row = k + np.argmax(np.abs(U[k:, k]))
        U[[k, max_row]] = U[[max_row, k]]
        L[[k, max_row], :k] = L[[max_row, k], :k]
        P[[k, max_row]] = P[[max_row, k]]
        
        # 消元
        for i in range(k+1, n):
            L[i, k] = U[i, k] / U[k, k]
            U[i, k:] -= L[i, k] * U[k, k:]
    
    return P, L, U

def lu_solve(P, L, U, b):
    # Ly = Pb (前代)
    Pb = P @ b
    n = len(b)
    y = np.zeros(n)
    for i in range(n):
        y[i] = Pb[i] - L[i, :i] @ y[:i]
    
    # Ux = y (回代)
    x = np.zeros(n)
    for i in range(n-1, -1, -1):
        x[i] = (y[i] - U[i, i+1:] @ x[i+1:]) / U[i, i]
    
    return x

# ═══ 实际使用 ═══
# from scipy.linalg import lu_factor, lu_solve
# lu, piv = lu_factor(A)
# x = lu_solve((lu, piv), b)  # 超快! LAPACK 优化

# ═══ 为什么不用 A⁻¹？ ═══
#
# 永远不要计算矩阵逆!
# 
# x = A⁻¹b → O(n³) + O(n²) = 2倍计算量
# 且数值稳定性更差!
#
# np.linalg.solve(A, b) → LU 分解解方程 ← 正确做法!
# np.linalg.inv(A) @ b → 慢且不稳定 ← 错误做法!

# ═══ 复杂度对比 ═══
#
# 方法          │ 分解      │ 求解    │ 适用
# ──────────────┼───────────┼─────────┼──────
# LU (一般)     │ O(n³/3)  │ O(n²)   │ 一般方阵
# Cholesky (SPD)│ O(n³/6)  │ O(n²)   │ 对称正定
# QR            │ O(2n³/3) │ O(n²)   │ 最小二乘
# SVD           │ O(n³)    │ O(n²)   │ 病态/奇异`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔺 Cholesky 分解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> cholesky.py</div>
                <pre className="fs-code">{`# ═══ Cholesky 分解 ═══
#
# 适用: 对称正定矩阵 (SPD)
# A = LLᵀ  (L 是下三角, 对角线为正)
#
# 优势:
# • 只需 n³/6 运算 (LU 的一半!)
# • 不需要选主元 (SPD 保证稳定)
# • 存储只需下三角 (节省一半内存)

import numpy as np

def cholesky(A):
    n = A.shape[0]
    L = np.zeros_like(A, dtype=float)
    
    for j in range(n):
        # 对角线元素
        s = A[j, j] - np.dot(L[j, :j], L[j, :j])
        if s <= 0:
            raise ValueError("矩阵不是正定的!")
        L[j, j] = np.sqrt(s)
        
        # 下三角元素
        for i in range(j+1, n):
            L[i, j] = (A[i, j] - np.dot(L[i, :j], L[j, :j])) / L[j, j]
    
    return L

# 解 Ax = b:
# L = cholesky(A)
# Ly = b  (前代)
# Lᵀx = y (回代)

# ═══ 为什么 SPD 矩阵这么重要？ ═══
#
# 1. 协方差矩阵: Σ = E[(X-μ)(X-μ)ᵀ] → SPD
#    → 多元正态采样: z = L·ε, ε~N(0,I)
#
# 2. 正规方程: AᵀA → SPD (如果 A 列满秩)
#    → 最小二乘: (AᵀA)x = Aᵀb
#
# 3. 核矩阵: K(xᵢ,xⱼ) → SPD (Mercer 核)
#    → 高斯过程, SVM
#
# 4. Hessian 矩阵: ∇²f → SPD (凸函数!)
#    → 牛顿法: Hd = -g

# ═══ 不完全 Cholesky (Incomplete Cholesky) ═══
#
# 稀疏矩阵的近似分解:
# A ≈ L̃L̃ᵀ, L̃ 保持稀疏模式
#
# 用途: 预条件! (加速迭代法)
# M = L̃L̃ᵀ ≈ A → 用 M 做预条件器
#
# scipy.sparse.linalg.spilu → 不完全 LU

# ═══ LDLT 分解 ═══
#
# A = LDLᵀ (避免开方!)
# D = 对角矩阵
# 适用: 对称不定矩阵 (Bunch-Kaufman 选主元)
# 
# 比 Cholesky 更通用, 比 LU 更快 (利用对称性)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 迭代法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> iterative.py</div>
                <pre className="fs-code">{`# ═══ 为什么要迭代法？ ═══
#
# 直接法: O(n³) → n=10⁶ 时 10¹⁸ 运算 → 不可能!
# 迭代法: 每步 O(nnz) (非零元素数) → 稀疏矩阵的救星!

import numpy as np
from scipy.sparse.linalg import cg, gmres

# ═══ Jacobi 迭代 ═══

def jacobi(A, b, x0=None, tol=1e-10, maxiter=1000):
    n = len(b)
    x = x0 if x0 is not None else np.zeros(n)
    D_inv = 1.0 / np.diag(A)
    
    for k in range(maxiter):
        x_new = D_inv * (b - A @ x + np.diag(A) * x)
        if np.linalg.norm(x_new - x) < tol:
            return x_new, k+1
        x = x_new
    return x, maxiter

# 收敛条件: ρ(D⁻¹(L+U)) < 1
# 对角占优矩阵保证收敛!

# ═══ Gauss-Seidel 迭代 ═══
# 
# 和 Jacobi 类似, 但立即使用最新的 x 值
# → 通常收敛更快 (约 2x)
# → 但不能并行化 (有数据依赖)

# ═══ 共轭梯度法 (CG) ═══
#
# 适用: 对称正定 (SPD) 矩阵
# 理论: 最多 n 步精确收敛!
# 实际: 远少于 n 步 (取决于条件数)

def conjugate_gradient(A, b, x0=None, tol=1e-10, maxiter=None):
    n = len(b)
    x = x0 if x0 is not None else np.zeros(n)
    r = b - A @ x
    p = r.copy()
    rs_old = np.dot(r, r)
    
    if maxiter is None:
        maxiter = n
    
    for k in range(maxiter):
        Ap = A @ p
        alpha = rs_old / np.dot(p, Ap)
        x += alpha * p
        r -= alpha * Ap
        rs_new = np.dot(r, r)
        
        if np.sqrt(rs_new) < tol:
            return x, k+1
        
        beta = rs_new / rs_old
        p = r + beta * p
        rs_old = rs_new
    
    return x, maxiter

# 复杂度: 每步 O(nnz) (一次矩阵-向量乘)
# 收敛速度: O(√κ(A)) 步 (κ = 条件数)
# 预条件后: O(√κ(M⁻¹A)) 步 → 大幅加速!

# ═══ 预条件共轭梯度 (PCG) ═══
# 
# 思想: 不解 Ax=b, 而解 M⁻¹Ax = M⁻¹b
# M ≈ A 但容易求逆!
#
# 常见预条件器:
# • 对角 (Jacobi):   M = diag(A)
# • 不完全 Cholesky: M = L̃L̃ᵀ
# • 代数多重网格 (AMG): 最强但最复杂
#
# scipy: cg(A, b, M=preconditioner)

# ═══ GMRES (一般非对称矩阵) ═══
# 
# 基于 Krylov 子空间: span{b, Ab, A²b, ...}
# 每步最小化残差 ‖b - Axₖ‖₂
# 
# x, info = gmres(A, b, restart=30)

# ═══ 收敛速率对比 ═══
#
# 方法       │ 每步开销 │ 收敛速度       │ 要求
# ───────────┼──────────┼────────────────┼──────
# Jacobi     │ O(nnz)   │ ρ(D⁻¹(L+U))^k │ 对角占优
# GS         │ O(nnz)   │ ≈ 2x Jacobi    │ SPD
# SOR        │ O(nnz)   │ ≈ √κ × Jacobi  │ SPD + ω
# CG         │ O(nnz)   │ (√κ-1)/(√κ+1) │ SPD
# PCG        │ O(nnz)+M │ 远快于 CG      │ SPD + M
# GMRES      │ O(k·nnz) │ 取决于谱       │ 一般`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 实战对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> comparison.txt</div>
                <pre className="fs-code">{`═══ 算法选择决策树 ═══

  Ax = b
  │
  ├─ n < 5000 (稠密)?
  │  ├─ A 是 SPD? → Cholesky  (最快!)
  │  ├─ A 对称?   → LDLT
  │  └─ 一般      → LU + 部分选主元
  │
  └─ n > 5000 或稀疏?
     ├─ A 是 SPD?
     │  ├─ 良态 (κ<10⁶)?  → PCG
     │  └─ 病态?  → PCG + AMG 预条件
     ├─ A 对称?      → MINRES
     └─ 一般?        → GMRES(m) 或 BiCGSTAB

═══ 实际性能 (n=10000 稠密矩阵) ═══

  方法        │ 时间 (秒) │ 内存 (MB)
  ────────────┼───────────┼──────────
  np.solve    │ 0.15      │ 800
  LU          │ 0.18      │ 800
  Cholesky    │ 0.08      │ 400   ← SPD 最优!
  SVD         │ 0.45      │ 1600
  CG (稀疏)  │ 0.005     │ 10    ← 稀疏大赢!

═══ 在 ML 中的应用 ═══

  1. 线性回归 (正规方程):
     (XᵀX)β = Xᵀy → Cholesky 解法
     但 n>>p 时 QR 更稳定!

  2. 高斯过程回归:
     (K + σ²I)α = y → CG (n 大时)
     对数似然需要 log det K → Cholesky

  3. 牛顿法 (二阶优化):
     Hd = -g → CG 近似 (截断牛顿法)
     → L-BFGS: 隐式 Hessian, 不需要直接解!

  4. 图神经网络:
     Laplacian L = D - A
     谱方法: 需要 L 的特征分解
     → 用 ChebyNet 避免!

═══ LAPACK/BLAS 底层 ═══

  np.linalg.solve → LAPACK dgesv (LU)
  np.linalg.cholesky → LAPACK dpotrf
  
  BLAS 级别:
  Level 1: 向量操作 O(n)     → axpy, dot
  Level 2: 矩阵-向量 O(n²)   → gemv
  Level 3: 矩阵-矩阵 O(n³)  → gemm

  → Level 3 的 FLOP/s 最高 (缓存友好)
  → BLAS 是数值计算的"发动机"
  → OpenBLAS, MKL, Apple Accelerate`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
