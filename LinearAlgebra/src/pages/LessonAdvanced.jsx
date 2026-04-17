import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['张量基础', '稀疏矩阵', 'GPU 线代库', '前沿话题'];

export default function LessonAdvanced() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">📐 module_08 — 高级专题</div>
      <div className="fs-hero">
        <h1>高级专题：张量 / 稀疏矩阵 / GPU 加速线性代数</h1>
        <p>
          深度学习操作的不是矩阵，而是<strong>张量</strong>——多维数组。
          大规模图模型和推荐系统依赖<strong>稀疏矩阵</strong>的高效存储与运算。
          而 GPU 上的线性代数库（cuBLAS/Triton）是训练百亿参数 LLM 的基石。
          本模块将线性代数提升到<strong>工程实战层面</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🚀 高级线性代数</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧊 张量 (Tensor)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> tensors</div>
                <pre className="fs-code">{`# 张量: 矩阵的高维推广

import numpy as np

# ═══ 张量的阶 (Rank/Order) ═══
# 0阶: 标量    →  42
# 1阶: 向量    →  [1, 2, 3]           shape: (3,)
# 2阶: 矩阵    →  [[1,2],[3,4]]       shape: (2, 2)
# 3阶: 数据立方体                       shape: (B, H, W)
# 4阶: 图像 batch                      shape: (B, C, H, W)
# 5阶: 视频 batch                      shape: (B, T, C, H, W)

# ═══ 深度学习中常见的张量形状 ═══
# 全连接层输入:      (batch_size, features)
# CNN 输入:          (batch_size, channels, height, width)
# 序列模型输入:      (batch_size, seq_len, d_model)
# Attention QKV:     (batch_size, n_heads, seq_len, d_k)
# 卷积核:            (out_channels, in_channels, kH, kW)

# ═══ 张量运算 ═══
A = np.random.randn(2, 3, 4)   # 3阶张量
B = np.random.randn(2, 4, 5)   # 3阶张量

# 批量矩阵乘法 (batched matmul)
# 对 batch 维度广播, 后两维做矩阵乘
C = A @ B  # (2, 3, 5)
print(f"批量矩阵乘: {A.shape} @ {B.shape} = {C.shape}")

# ═══ Einstein 求和约定 ═══
# 爱因斯坦记号: 简洁表达复杂张量运算
# 重复的下标 → 求和

# 矩阵乘法: Cᵢⱼ = Σₖ Aᵢₖ Bₖⱼ
C_ein = np.einsum('ik,kj->ij', A[0], B[0])
print(f"einsum 矩阵乘: {np.allclose(C_ein, A[0] @ B[0])}")

# 批量矩阵乘: Cᵦᵢⱼ = Σₖ Aᵦᵢₖ Bᵦₖⱼ
C_batch = np.einsum('bik,bkj->bij', A, B)
print(f"einsum 批量乘: {np.allclose(C_batch, C)}")

# 迹: Tr(A) = Σᵢ Aᵢᵢ
trace = np.einsum('ii->', A[0, :3, :3])

# Attention: scores = QKᵀ/√d
# 用 einsum: scores_bhij = Σ_d Q_bhid · K_bhjd
# np.einsum('bhid,bhjd->bhij', Q, K) / sqrt(d_k)

# ═══ 张量分解 ═══
# CP 分解: T ≈ Σᵣ λᵣ · a_r ⊗ b_r ⊗ c_r
# Tucker 分解: T ≈ G ×₁ U₁ ×₂ U₂ ×₃ U₃
# → 高维的"SVD"! 用于推荐系统、知识图谱

# ═══ 张量在 PyTorch 中 ═══
# import torch
# x = torch.randn(32, 3, 224, 224)  # batch of images
# x = x.permute(0, 2, 3, 1)  # NCHW → NHWC
# x = x.reshape(32, -1)       # 展平: (32, 150528)
# x = x.unsqueeze(1)          # 添加维度: (32, 1, 150528)
# 
# 关键操作:
# .view() / .reshape()  → 改变形状
# .permute()            → 交换维度
# .unsqueeze() / .squeeze() → 添加/删除维度
# .expand() / .repeat()     → 广播复制`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🕸️ 稀疏矩阵</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> sparse_matrices</div>
                <pre className="fs-code">{`# 稀疏矩阵: 当 90%+ 的元素是零

import numpy as np
from scipy import sparse

# ═══ 为什么需要稀疏矩阵? ═══
# 图的邻接矩阵: 社交网络 10亿×10亿, 99.99% 是 0
# 推荐系统: 用户×物品 矩阵, 99.9% 未评分
# NLP: TF-IDF 矩阵, 词表 5万 × 文档 100万
# → 稠密存储: 不可能! 10亿² × 8字节 = 8 EB!

# ═══ 稀疏存储格式 ═══

# 1. COO (Coordinate): 存储 (row, col, value) 三元组
# 适合构建稀疏矩阵
row = [0, 0, 1, 2, 2]
col = [0, 2, 1, 0, 2]
val = [1, 3, 4, 5, 7]
coo = sparse.coo_matrix((val, (row, col)), shape=(3, 3))
print(f"COO: {coo.nnz} 非零 / {3*3} 总 = 稀疏度 {1-coo.nnz/9:.1%}")

# 2. CSR (Compressed Sparse Row): 高效行切片
# 内存: O(nnz + n)   行切片: O(1)
csr = coo.tocsr()
print(f"CSR 第1行: {csr[1].toarray()}")

# 3. CSC (Compressed Sparse Column): 高效列切片
csc = coo.tocsc()

# ═══ 稀疏矩阵运算 ═══
A_sparse = sparse.random(1000, 1000, density=0.01, format='csr')
x = np.random.randn(1000)

# 稀疏矩阵-向量乘 (SpMV)
y = A_sparse @ x  # O(nnz) 而非 O(n²)!

# 性能对比
import time
A_dense = A_sparse.toarray()

t0 = time.time()
for _ in range(100):
    y1 = A_dense @ x
t_dense = time.time() - t0

t0 = time.time()
for _ in range(100):
    y2 = A_sparse @ x
t_sparse = time.time() - t0

print(f"\\n稠密 SpMV: {t_dense*10:.2f} ms")
print(f"稀疏 SpMV: {t_sparse*10:.2f} ms")
print(f"加速: {t_dense/t_sparse:.1f}x")

# ═══ 稀疏特征值 (大规模) ═══
# scipy.sparse.linalg.eigsh() → 只求前 k 个特征值
# 用 Lanczos/Arnoldi 迭代, O(nnz·k) 而非 O(n³)

from scipy.sparse.linalg import eigsh

# 稀疏对称矩阵的前5个特征值
S = A_sparse + A_sparse.T  # 对称化
vals, vecs = eigsh(S, k=5, which='LM')  # Largest Magnitude
print(f"前5个特征值: {vals.round(3)}")

# ═══ 图神经网络中的稀疏矩阵 ═══
# GCN: H⁽ˡ⁺¹⁾ = σ(D⁻½ A D⁻½ · H⁽ˡ⁾ · W)
# 其中 A 是稀疏邻接矩阵
# → 稀疏矩阵乘是 GNN 的核心操作!
# → PyTorch Geometric 底层就是稀疏 SpMM`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ GPU 加速线性代数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> gpu_linear_algebra</div>
                <pre className="fs-code">{`# GPU 线性代数: LLM 训练的基石

# ═══ 为什么 GPU 擅长矩阵运算? ═══
# CPU: 4-128 核, 高频 (5GHz), 大缓存, 复杂控制
# GPU: 数千核, 低频 (2GHz), 小缓存, 简单控制
#
# 矩阵乘法是"尴尬并行"(Embarrassingly Parallel):
# C[i,j] = Σ A[i,k]·B[k,j] → 每个元素独立计算!
# → GPU 的数千核可以同时计算数千个元素

# ═══ 核心库生态 ═══
# ┌──────────────┬──────────────────────────┐
# │ 库            │ 用途                      │
# ├──────────────┼──────────────────────────┤
# │ cuBLAS       │ 基础线代 (GEMM, TRSV, ...)│
# │ cuSOLVER     │ 分解/求解 (LU, QR, SVD)   │
# │ cuSPARSE     │ 稀疏矩阵运算              │
# │ cuTENSOR     │ 张量收缩                   │
# │ CUTLASS      │ 自定义 GEMM 核函数         │
# │ Triton       │ 高级 GPU 编程 (Python)     │
# │ FlashAttention│ 优化注意力计算            │
# └──────────────┴──────────────────────────┘

# ═══ GEMM: GPU 的核心操作 ═══
# C = α·A·B + β·C  (General Matrix Multiply)
# 
# A100 GPU GEMM 性能:
# FP32:  19.5 TFLOPS
# FP16:  312 TFLOPS  (Tensor Core)
# INT8:  624 TOPS
# FP8:   ~2 PFLOPS   (H100)
#
# → FP16 比 FP32 快 16x! 这就是混合精度训练的意义

# ═══ PyTorch GPU 矩阵运算 ═══
# import torch
# A = torch.randn(4096, 4096, device='cuda', dtype=torch.float16)
# B = torch.randn(4096, 4096, device='cuda', dtype=torch.float16)
#
# # Tensor Core 自动加速!
# C = A @ B  # 底层调用 cuBLAS cublasGemmEx
#
# # 计时
# torch.cuda.synchronize()
# start = torch.cuda.Event(enable_timing=True)
# end = torch.cuda.Event(enable_timing=True)
# start.record()
# C = A @ B
# end.record()
# torch.cuda.synchronize()
# print(f"GEMM time: {start.elapsed_time(end):.2f} ms")

# ═══ FlashAttention: 内存优化 ═══
# 标准 Attention:
#   S = QKᵀ ∈ ℝ^(n×n)  → O(n²) 内存!
#   P = softmax(S)
#   O = P·V
#
# FlashAttention:
#   不在 GPU 全局内存中存储 n×n 矩阵
#   用分块 (tiling) + 在 SRAM 中计算
#   → 内存 O(n) + 速度提升 2-4x!

# ═══ Triton: Python 写 GPU 核函数 ═══
# import triton
# import triton.language as tl
#
# @triton.jit
# def matmul_kernel(A, B, C, M, N, K, ...):
#     # 每个 block 计算 C 的一个 tile
#     pid = tl.program_id(0)
#     # ... 分块矩阵乘 ...
#
# → 比 CUDA 简洁 10x, 性能接近 cuBLAS!

# ═══ 量化: 用更少 bit 做线代 ═══
# FP32 → FP16 → INT8 → INT4 → 二值
# 每减少一半 bit → 速度和内存都翻倍
# INT4 量化: 4096×4096 矩阵
#   FP32: 64 MB  →  INT4: 8 MB  (8x压缩!)
#   GEMM: ~8x 加速 (理论)
# → GPTQ/AWQ 量化就是在做这件事`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔭 前沿话题</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> frontier_topics</div>
                <pre className="fs-code">{`# 线性代数的前沿研究方向

# ═══ 1. 随机化线性代数 ═══
# 问题: SVD 复杂度 O(mn²) → 大矩阵太慢
# 解法: 随机投影 → 压缩 → 在小矩阵上做 SVD
#
# Randomized SVD 算法:
# 1. 生成随机矩阵 Ω ∈ ℝ^(n×k)
# 2. Y = A·Ω ∈ ℝ^(m×k)  → 压缩到 k 维
# 3. Q, R = QR(Y)          → 正交基
# 4. B = QᵀA ∈ ℝ^(k×n)    → 小矩阵
# 5. 对 B 做 SVD
#
# 复杂度: O(mn·k) 而非 O(mn²)!
# → scikit-learn 的 PCA(svd_solver='randomized')

import numpy as np

def randomized_svd(A, k, n_oversampling=10):
    m, n = A.shape
    # 过采样提高精度
    Omega = np.random.randn(n, k + n_oversampling)
    Y = A @ Omega
    Q, _ = np.linalg.qr(Y)
    B = Q.T @ A
    U_hat, S, Vt = np.linalg.svd(B, full_matrices=False)
    U = Q @ U_hat
    return U[:, :k], S[:k], Vt[:k]

A = np.random.randn(1000, 500)
U, S, Vt = randomized_svd(A, k=10)
print(f"随机化 SVD: U{U.shape}, S({len(S)}), V{Vt.shape}")

# ═══ 2. 结构化矩阵 ═══
# 许多"大矩阵"有特殊结构 → 可以更快计算
#
# Toeplitz: 对角线常数 → FFT 加速, O(n log n)
# Circulant: 循环矩阵 → FFT 对角化
# Kronecker: A ⊗ B → 分块独立计算
# 蝶形矩阵: Monarch Matrices → O(n^1.5)
#
# 应用: Monarch Mixer 用蝶形矩阵替代全连接层
# → 参数减少 → 速度提升 → 精度持平!

# ═══ 3. 矩阵补全 ═══
# 只观测矩阵的部分元素 → 恢复整个矩阵
# 条件: 原矩阵是低秩的
# 方法: 核范数最小化 min ||X||_* s.t. X_ij=M_ij
#
# 应用: Netflix 推荐 / 图像修复 / 传感器数据补全

# ═══ 4. 矩阵微分 ═══
# df/dX =? (X 是矩阵时)
#
# 关键规则:
# d(trace(AX))/dX = Aᵀ
# d(trace(XAXᵀ))/dX = AᵀXᵀ + AX
# d(det(X))/dX = det(X) · X⁻ᵀ
# d(log det(X))/dX = X⁻ᵀ
#
# → 推导 MLE、高斯分布参数更新的基础!

# ═══ 5. 数值稳定性 ═══
# 浮点运算有精度限制:
# FP32: ~7位有效数字
# FP16: ~3位有效数字
#
# 病态矩阵: κ(A) = σ_max/σ_min
# κ > 10⁶ → 求解/求逆极不稳定!
# 解决方案:
# - 预条件 (Preconditioning)
# - 迭代精化 (Iterative Refinement)
# - 混合精度: FP16 计算 + FP32 累加

# ═══ 学习路线总结 ═══
# ┌────────────────────────────────────────┐
# │ 线性代数 → AI 能力映射                  │
# ├────────────────────────────────────────┤
# │ 向量空间 + 基   → Embedding / 特征理解  │
# │ 线性变换        → 全连接/Attention/CNN  │
# │ 特征分解        → PCA / 谱分析 / 稳定性 │
# │ SVD             → 降维 / LoRA / 压缩    │
# │ 稀疏矩阵        → 图网络 / 推荐系统     │
# │ GPU 线代        → 训练加速 / 量化       │
# │ 随机化          → 大规模 PCA / 近似     │
# └────────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
