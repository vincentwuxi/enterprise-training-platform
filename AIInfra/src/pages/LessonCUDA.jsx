import { useState } from 'react';
import './LessonCommon.css';

const CODE_BASICS = `// ━━━━ CUDA 编程模型基础 ━━━━
// CUDA = Compute Unified Device Architecture（NVIDIA 专有）

// ━━━━ 核心概念：Thread → Block → Grid ━━━━
// Thread：最小执行单元（每个线程有唯一 threadIdx）
// Warp：32 个 Thread 组成一个 Warp（GPU 实际调度单位）
// Block：多个 Thread 组成 Block（共享 Shared Memory）
// Grid：多个 Block 组成 Grid（一次 Kernel Launch）

// ━━━━ Hello CUDA：向量加法 ━━━━
// vector_add.cu
#include <cuda_runtime.h>
#include <stdio.h>

// __global__ = GPU 上执行的函数（Kernel）
__global__ void vectorAdd(float* a, float* b, float* c, int n) {
    // 计算当前线程的全局索引
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main() {
    int n = 1 << 20;  // 1M 个元素
    size_t size = n * sizeof(float);

    // 1. 分配 Host（CPU）内存
    float *h_a, *h_b, *h_c;
    h_a = (float*)malloc(size);
    h_b = (float*)malloc(size);
    h_c = (float*)malloc(size);

    // 2. 分配 Device（GPU）内存
    float *d_a, *d_b, *d_c;
    cudaMalloc(&d_a, size);
    cudaMalloc(&d_b, size);
    cudaMalloc(&d_c, size);

    // 3. CPU → GPU 数据传输
    cudaMemcpy(d_a, h_a, size, cudaMemcpyHostToDevice);
    cudaMemcpy(d_b, h_b, size, cudaMemcpyHostToDevice);

    // 4. 启动 Kernel
    int blockSize = 256;              // 每个 Block 256 个线程
    int gridSize = (n + blockSize - 1) / blockSize;  // 需要的 Block 数
    vectorAdd<<<gridSize, blockSize>>>(d_a, d_b, d_c, n);

    // 5. GPU → CPU 数据传输
    cudaMemcpy(h_c, d_c, size, cudaMemcpyDeviceToHost);

    // 6. 释放内存
    cudaFree(d_a); cudaFree(d_b); cudaFree(d_c);
    free(h_a); free(h_b); free(h_c);
    return 0;
}

// 编译：nvcc vector_add.cu -o vector_add
// 运行：./vector_add`;

const CODE_MEMORY = `// ━━━━ CUDA 内存管理（性能关键！）━━━━

// ━━━━ 1. Shared Memory（SM 内共享，最快）━━━━
// 用于 Block 内线程间的数据共享和协作
// 延迟 ~20 cycle，带宽接近 Register

__global__ void matMulShared(float* A, float* B, float* C, int N) {
    // 声明 Shared Memory（每个 Block 独有）
    __shared__ float tileA[16][16];
    __shared__ float tileB[16][16];

    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    float sum = 0.0f;
    for (int t = 0; t < N / 16; t++) {
        // 协作加载：每个线程加载一个元素到 Shared Memory
        tileA[threadIdx.y][threadIdx.x] = A[row * N + t * 16 + threadIdx.x];
        tileB[threadIdx.y][threadIdx.x] = B[(t * 16 + threadIdx.y) * N + col];
        __syncthreads();  // 确保所有线程都加载完毕

        // 从 Shared Memory 读取（极快）
        for (int k = 0; k < 16; k++)
            sum += tileA[threadIdx.y][k] * tileB[k][threadIdx.x];
        __syncthreads();
    }
    C[row * N + col] = sum;
}
// Shared Memory 版矩阵乘法比 Global Memory 版快 10-50x

// ━━━━ 2. 合并访存（Coalesced Access）━━━━
// Warp（32 线程）同时访问连续地址 → 合并为一次内存事务
// ✅ 好！连续访问（stride = 1）
c[idx] = a[idx] + b[idx];       // 32 线程访问连续 32 个 float

// ❌ 差！跳跃访问（stride = 32）
c[idx * stride] = a[idx * stride]; // 每次只取 1 个有效 float，浪费带宽

// ━━━━ 3. 统一内存（Unified Memory）━━━━
// 简化版：CPU/GPU 共享地址空间（自动迁移）
float* data;
cudaMallocManaged(&data, size);   // 统一分配
// CPU 和 GPU 都可以直接访问 data
// 驱动自动处理页面迁移（有性能开销）

// ━━━━ 4. CUDA Streams（异步并行）━━━━
cudaStream_t stream1, stream2;
cudaStreamCreate(&stream1);
cudaStreamCreate(&stream2);

// 不同 Stream 的操作可以并行执行
cudaMemcpyAsync(d_a, h_a, size, cudaMemcpyHostToDevice, stream1);
kernel1<<<grid, block, 0, stream1>>>(d_a);
cudaMemcpyAsync(d_b, h_b, size, cudaMemcpyHostToDevice, stream2);
kernel2<<<grid, block, 0, stream2>>>(d_b);
// stream1 和 stream2 的操作重叠执行！`;

const CODE_PYTHON = `# ━━━━ Python 中使用 CUDA（无需写 C）━━━━

# ━━━━ 1. Numba（零学习成本）━━━━
from numba import cuda
import numpy as np

@cuda.jit     # 自动编译为 CUDA Kernel
def vector_add_gpu(a, b, c):
    idx = cuda.grid(1)      # 获取全局线程 ID
    if idx < a.shape[0]:
        c[idx] = a[idx] + b[idx]

n = 10_000_000
a = np.random.randn(n).astype(np.float32)
b = np.random.randn(n).astype(np.float32)
c = np.zeros(n, dtype=np.float32)

# 传输到 GPU
d_a = cuda.to_device(a)
d_b = cuda.to_device(b)
d_c = cuda.to_device(c)

# 启动 Kernel
threads_per_block = 256
blocks = (n + threads_per_block - 1) // threads_per_block
vector_add_gpu[blocks, threads_per_block](d_a, d_b, d_c)

result = d_c.copy_to_host()   # GPU → CPU

# ━━━━ 2. Triton（OpenAI 出品，AI Kernel 首选）━━━━
import triton
import triton.language as tl

@triton.jit
def matmul_kernel(
    a_ptr, b_ptr, c_ptr,
    M, N, K,
    stride_am, stride_ak,
    stride_bk, stride_bn,
    stride_cm, stride_cn,
    BLOCK_M: tl.constexpr, BLOCK_N: tl.constexpr, BLOCK_K: tl.constexpr,
):
    # Triton 自动处理 Shared Memory、Tiling、Vectorization
    pid_m = tl.program_id(0)
    pid_n = tl.program_id(1)
    
    offs_m = pid_m * BLOCK_M + tl.arange(0, BLOCK_M)
    offs_n = pid_n * BLOCK_N + tl.arange(0, BLOCK_N)
    
    accumulator = tl.zeros((BLOCK_M, BLOCK_N), dtype=tl.float32)
    for k in range(0, K, BLOCK_K):
        offs_k = k + tl.arange(0, BLOCK_K)
        a = tl.load(a_ptr + offs_m[:, None] * stride_am + offs_k[None, :] * stride_ak)
        b = tl.load(b_ptr + offs_k[:, None] * stride_bk + offs_n[None, :] * stride_bn)
        accumulator += tl.dot(a, b)
    
    tl.store(c_ptr + offs_m[:, None] * stride_cm + offs_n[None, :] * stride_cn, accumulator)

# Triton 的优势：
# - 比 CUDA C 代码量少 5-10x
# - 自动优化 Shared Memory / Tiling / Loop Unrolling
# - PyTorch 2.0 的 torch.compile 底层就用 Triton 生成 Kernel`;

export default function LessonCUDA() {
  const [tab, setTab] = useState('basics');
  const tabs = [
    { key: 'basics', label: '🔧 CUDA 基础', code: CODE_BASICS },
    { key: 'memory', label: '🗄️ 内存与优化', code: CODE_MEMORY },
    { key: 'python', label: '🐍 Python CUDA（Numba/Triton）', code: CODE_PYTHON },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 02 · CUDA PROGRAMMING</div>
        <h1>CUDA 编程模型</h1>
        <p>CUDA 是 NVIDIA GPU 的编程语言——理解 Thread/Block/Grid 的层级关系和 Shared Memory 的使用方式，<strong>是从"会调 API"到"能优化底层"的关键跨越</strong>。好消息是现在有 Triton，让写高性能 GPU Kernel 变得极其简单。</p>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">⚙️ CUDA 三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`ai-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} />
            <div className="ai-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ai-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.{tab === 'python' ? 'py' : 'cu'}</span>
          </div>
          <div className="ai-code">{t.code}</div>
        </div>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">📊 CUDA vs Triton vs PyTorch 对比</div>
        <div className="ai-card" style={{ overflowX: 'auto' }}>
          <table className="ai-table">
            <thead><tr><th>维度</th><th>CUDA C/C++</th><th>Triton</th><th>PyTorch（torch.compile）</th></tr></thead>
            <tbody>
              {[
                ['学习曲线', '陡峭（需要 C/C++）', '中等（Python 语法）', '最低（Python 原生）'],
                ['性能', '最高（手动优化）', '接近 CUDA（90%+）', '好（自动优化）'],
                ['代码量', '多（100+ 行）', '少（30-50 行）', '最少（1 行 @compile）'],
                ['Shared Memory', '手动管理', '自动优化', '不可控'],
                ['适合场景', '极致性能（底层框架）', 'AI Kernel 开发（推荐）', '应用层开发'],
              ].map(([dim, cuda, triton, pt], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, fontSize: '0.84rem' }}>{dim}</td>
                  <td style={{ color: 'var(--ai-muted)', fontSize: '0.83rem' }}>{cuda}</td>
                  <td style={{ color: 'var(--ai-orange)', fontSize: '0.83rem', fontWeight: 600 }}>{triton}</td>
                  <td style={{ color: 'var(--ai-muted)', fontSize: '0.83rem' }}>{pt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ai-tip">💡 <strong>AI 工程师的 CUDA 学习路径</strong>：先理解 CUDA 编程模型（概念级）→ 日常用 Triton 写自定义 Kernel → 只有在极端优化时才需要写 CUDA C。90% 的场景 Triton + torch.compile 足够。</div>
      </div>
    </div>
  );
}
