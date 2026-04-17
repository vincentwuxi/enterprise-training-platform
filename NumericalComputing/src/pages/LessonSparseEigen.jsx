import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['稀疏矩阵格式', '稀疏运算', '特征值问题', '截断 SVD'];

export default function LessonSparseEigen() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔬 module_07 — 稀疏矩阵与特征值</div>
      <div className="fs-hero">
        <h1>稀疏矩阵与特征值：CSR / 幂迭代 / SVD 截断</h1>
        <p>
          真实世界的大矩阵几乎都是<strong>稀疏</strong>的——
          社交网络、有限元、推荐系统。掌握稀疏存储格式、
          稀疏求解器和大规模特征值算法是处理百万级矩阵的关键。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 稀疏矩阵与特征值深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💾 稀疏矩阵存储格式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> sparse_formats.py</div>
                <pre className="fs-code">{`# ═══ 为什么要稀疏？ ═══
#
# n = 10⁶ 的稠密矩阵:
# 存储: 10¹² × 8 bytes = 8 TB → 内存放不下!
# 乘法: 10¹² 运算 → 太慢!
#
# 但如果每行只有 ~10 个非零元:
# 存储: 10⁷ × 8 bytes = 80 MB → 轻松!
# 乘法: 10⁷ 运算 → 毫秒级!

import numpy as np
from scipy import sparse

# ═══ COO (Coordinate) — 构建阶段 ═══

row = np.array([0, 0, 1, 2, 2, 2])
col = np.array([0, 2, 1, 0, 1, 2])
data = np.array([1, 3, 4, 5, 7, 9], dtype=float)

A_coo = sparse.coo_matrix((data, (row, col)), shape=(3, 3))
# 存储: 3 个数组 (row, col, data), 各 nnz 长
# 优点: 构建简单, 支持重复坐标 (自动求和)
# 缺点: 不支持切片, 不支持高效矩阵乘法

# ═══ CSR (Compressed Sparse Row) — 计算主力 ═══

A_csr = A_coo.tocsr()
# 内部:
# data:    [1, 3, 4, 5, 7, 9]     → 非零值
# indices: [0, 2, 1, 0, 1, 2]     → 列下标
# indptr:  [0, 2, 3, 6]           → 每行在 data 中的起止
#
# 第 i 行的非零元素:
# data[indptr[i]:indptr[i+1]]
# 列号: indices[indptr[i]:indptr[i+1]]

# 复杂度:
# 矩阵-向量乘 (SpMV): O(nnz) ← 核心操作!
# 行切片: O(1)
# 列切片: O(nnz) → 慢! → 用 CSC!

# ═══ CSC (Compressed Sparse Column) ═══
A_csc = A_coo.tocsc()
# 类似 CSR 但按列压缩
# 列切片: O(1)
# 适合: 需要列操作的算法 (如 LU 分解)

# ═══ 其他格式 ═══
#
# BSR (Block Sparse Row): 非零元是小密块
#   → 有限元中常见 (每个节点 3 个自由度)
#   → 利用 BLAS Level 3 → 更快的 SpMV!
#
# DIA (Diagonal): 非零元集中在几条对角线
#   → 有限差分矩阵的最佳格式!
#   → 三对角/五对角矩阵
#
# LIL (List of Lists): 逐行构建
#   → 只用于增量构建, 不用于计算!

# ═══ 格式选择指南 ═══
#
# 任务         │ 最佳格式 │ 原因
# ─────────────┼──────────┼──────
# 增量构建     │ COO/LIL  │ O(1) 插入
# 矩阵-向量乘 │ CSR      │ 行遍历高效
# 列切片       │ CSC      │ 列遍历高效
# 对角结构     │ DIA      │ 最紧凑
# 块结构       │ BSR      │ BLAS 加速
# 存为文件     │ COO      │ 简单明了

# ═══ 内存对比 (n=10⁶, nnz=10⁷) ═══
#
# 稠密: 8 × 10¹² bytes = 8 TB
# CSR:  (10⁷ + 10⁷ + 10⁶) × 8 = ~160 MB
# → 节省 50000 倍!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ 稀疏运算</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> sparse_ops.py</div>
                <pre className="fs-code">{`# ═══ 稀疏矩阵-向量乘 (SpMV) ═══
import numpy as np
from scipy import sparse
from scipy.sparse.linalg import spsolve, cg, gmres

# 创建稀疏矩阵 (有限差分拉普拉斯算子)
n = 1000
diags = [-np.ones(n-1), 2*np.ones(n), -np.ones(n-1)]
A = sparse.diags(diags, [-1, 0, 1], format='csr')

x = np.random.randn(n)
y = A @ x  # SpMV: O(nnz) = O(3n) ← 线性!

# ═══ 稀疏直接求解 ═══

b = np.random.randn(n)
x = spsolve(A, b)  # 稀疏 LU → O(nnz 的某个函数)

# 底层: SuiteSparse / UMFPACK
# 稀疏 LU 的 fill-in 问题:
# → L 和 U 的非零元可能远多于 A!
# → 重排序 (AMD, COLAMD) 减少 fill-in

# ═══ 稀疏迭代求解 ═══

x_cg, info = cg(A, b, tol=1e-10)      # 共轭梯度 (SPD)
x_gm, info = gmres(A, b, tol=1e-10)   # GMRES (一般)

# info = 0: 收敛
# info > 0: 未在 maxiter 步内收敛
# info < 0: 出错

# ═══ 预条件器 ═══

from scipy.sparse.linalg import LinearOperator, spilu

# 不完全 LU 预条件
ilu = spilu(A.tocsc())
M = LinearOperator(A.shape, matvec=ilu.solve)
x_pcg, info = cg(A, b, M=M, tol=1e-10)
# → 迭代次数大幅减少!

# ═══ 稀疏矩阵构建技巧 ═══

# 1. 从坐标列表构建 (最通用)
rows, cols, vals = [], [], []
for i in range(n):
    rows.append(i); cols.append(i); vals.append(2.0)
    if i > 0:
        rows.append(i); cols.append(i-1); vals.append(-1.0)
    if i < n-1:
        rows.append(i); cols.append(i+1); vals.append(-1.0)
A = sparse.coo_matrix((vals, (rows, cols)), shape=(n,n)).tocsr()

# 2. Kronecker 积 (多维问题!)
# 2D Laplacian = I ⊗ L + L ⊗ I
I = sparse.eye(n)
L = sparse.diags([-1, 2, -1], [-1, 0, 1], shape=(n, n))
A2d = sparse.kron(I, L) + sparse.kron(L, I)
# → n×n 网格的 Laplacian, 大小 n²×n²

# ═══ 稀疏性能陷阱 ═══
#
# 1. 不要用 A[i,j] = val 逐元素构建 CSR → O(nnz) 每次!
#    → 用 COO 或 LIL 构建后转 CSR!
#
# 2. 不要 A.toarray() → 内存爆炸!
#
# 3. 稀疏 × 稀疏 → 结果可能不稀疏 → 危险!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 特征值问题</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> eigenvalue.py</div>
                <pre className="fs-code">{`# ═══ 特征值问题 ═══
#
# Ax = λx
# 找所有特征值/特征向量: O(n³) → 大矩阵不可行!
# 
# 实际: 通常只需要前 k 个 (k << n)

from scipy.sparse.linalg import eigs, eigsh

# ═══ 幂迭代 (Power Iteration) ═══

def power_iteration(A, max_iter=1000, tol=1e-10):
    n = A.shape[0]
    x = np.random.randn(n)
    x /= np.linalg.norm(x)
    
    for _ in range(max_iter):
        y = A @ x
        eigenvalue = np.dot(x, y)  # Rayleigh 商
        x_new = y / np.linalg.norm(y)
        if np.linalg.norm(x_new - x) < tol:
            return eigenvalue, x_new
        x = x_new
    
    return eigenvalue, x

# 收敛速度: |λ₁/λ₂|^k → 取决于特征值比率!
# 若 λ₁ ≈ λ₂ → 极慢! → 需要更好的方法

# ═══ 反幂迭代 (Inverse Iteration) ═══
#
# A⁻¹ 的最大特征值 = A 的最小特征值!
# → 每步解 Ay = x → 用 LU 分解预处理
#
# 带位移: (A - σI)⁻¹ → 找最接近 σ 的特征值
# → 正交迭代 → QR 算法的前身!

# ═══ Lanczos 算法 (对称/Hermitian 矩阵) ═══
#
# 基于 Krylov 子空间: Kₖ = span{b, Ab, A²b, ...}
# 
# 步骤:
# 1. 构建正交基 Q (Lanczos 三对角化)
# 2. AQ = QT + βq_{k+1}eₖᵀ  (T 是三对角!)
# 3. T 的特征值 ≈ A 的极端特征值 (Ritz 值)
#
# 只需要矩阵-向量乘! → 可以处理不显式存储的矩阵!

# SciPy 接口:
vals, vecs = eigsh(A, k=6, which='LM')  # 最大的 6 个
# which:
# 'LM' → 最大模 (默认)
# 'SM' → 最小模
# 'LA' → 最大代数值
# 'SA' → 最小代数值

# 非对称: eigs (Arnoldi 算法)
vals, vecs = eigs(A, k=6, which='LM')

# ═══ 广义特征值问题 ═══
#
# Ax = λBx  (B 通常是质量矩阵)
# 结构动力学: Kx = ω²Mx
# 
# eigsh(A, M=B, k=6)

# ═══ 应用 ═══
#
# 1. PageRank: 最大特征向量
# 2. 图谱聚类: 最小非零特征值 (Fiedler)
# 3. PCA: 最大特征值/特征向量
# 4. 量子力学: Hamiltonian 的基态能量
# 5. 结构分析: 固有频率和振型`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📉 截断 SVD 与降维</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> truncated_svd.txt</div>
                <pre className="fs-code">{`═══ SVD 回顾 ═══

  A = UΣVᵀ

  U: m×m 正交 (左奇异向量)
  Σ: m×n 对角 (奇异值, σ₁ ≥ σ₂ ≥ ... ≥ 0)
  V: n×n 正交 (右奇异向量)

  完整 SVD: O(mn²) → 大矩阵不可行!

═══ 截断 SVD (Truncated SVD) ═══

  只计算前 k 个奇异值/向量:
  A ≈ Aₖ = UₖΣₖVₖᵀ

  Eckart-Young 定理:
  Aₖ 是 A 在秩 k 矩阵中的最佳近似!
  (Frobenius 范数和 2-范数意义下)

  误差: ‖A - Aₖ‖_F = √(σ²_{k+1} + ... + σ²_r)

  Python:
  from scipy.sparse.linalg import svds
  U, s, Vt = svds(A, k=10)  # 前 10 个
  # 底层: ARPACK (隐式重启 Lanczos)

═══ 随机化 SVD (Randomized SVD) ═══

  当 k << min(m,n) 时更快!

  步骤:
  1. 随机投影: Y = A·Ω  (Ω 是随机矩阵 n×(k+p))
  2. QR 分解: Y = QR
  3. 小矩阵 SVD: B = QᵀA = ŨΣ̃Ṽᵀ
  4. U = QŨ

  复杂度: O(mn·k) 而不是 O(mn²)!

  from sklearn.utils.extmath import randomized_svd
  U, s, Vt = randomized_svd(A, n_components=10)
  # 或 fbpca.pca (更快!)

═══ 应用场景 ═══

  1. PCA (主成分分析):
     中心化: A_centered = A - mean
     SVD: A_centered ≈ UₖΣₖVₖᵀ
     主成分: Vₖ 的列
     降维投影: Z = A_centered · Vₖ
     
  2. LSA (潜在语义分析):
     词-文档矩阵 A (TF-IDF)
     截断 SVD → 语义空间
     → 早期 NLP 的核心方法!

  3. 推荐系统:
     用户-物品评分矩阵 (大量缺失)
     截断 SVD → 矩阵补全
     Netflix Prize 2006 的核心方法!

  4. 图像压缩:
     灰度图 (m×n) → 秩 k 近似
     存储: k(m+n+1) << mn

  5. 数据去噪:
     信号 = 低秩 + 噪声
     截断小奇异值 → 去噪!

═══ 在 ML 框架中 ═══

  # PyTorch (GPU 加速)
  U, S, V = torch.svd_lowrank(A, q=10)
  
  # sklearn
  from sklearn.decomposition import TruncatedSVD
  svd = TruncatedSVD(n_components=100)
  X_reduced = svd.fit_transform(X_sparse)
  
  # 与 PCA 的区别:
  # PCA 需要中心化 → 稀疏矩阵变稠密!
  # TruncatedSVD 直接处理稀疏 → 适合文本!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
