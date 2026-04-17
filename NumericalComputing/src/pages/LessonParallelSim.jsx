import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['向量化与 NumPy', 'GPU 计算 CuPy', 'PDE 数值模拟', '综合实战'];

export default function LessonParallelSim() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔬 module_08 — 并行计算与科学模拟</div>
      <div className="fs-hero">
        <h1>并行计算与科学模拟：NumPy / CuPy / PDE 模拟</h1>
        <p>
          科学计算的终极挑战是<strong>规模</strong>——百万自由度的有限元、
          十亿粒子的 N 体模拟。掌握向量化、GPU 计算和并行策略，
          让你的代码从"能跑"变成"跑得快"。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 并行计算与科学模拟深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 向量化与 NumPy 优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> vectorization.py</div>
                <pre className="fs-code">{`# ═══ 为什么 Python 循环慢？ ═══
#
# Python 循环: 每步都要
# 1. 类型检查 (动态类型!)
# 2. 引用计数
# 3. 解释执行 (无编译优化)
#
# NumPy 向量化: 一次调用 C/Fortran 内循环
# → 100x - 1000x 加速!

import numpy as np
import time

n = 1_000_000

# ═══ 反面教材: Python 循环 ═══
a = list(range(n))
b = list(range(n))

start = time.time()
c = [a[i] + b[i] for i in range(n)]
print(f"Python loop: {time.time()-start:.3f}s")  # ~0.15s

# ═══ 正面教材: NumPy 向量化 ═══
a = np.arange(n)
b = np.arange(n)

start = time.time()
c = a + b
print(f"NumPy vectorized: {time.time()-start:.6f}s")  # ~0.001s
# → 150x 加速!

# ═══ 向量化技巧 ═══

# 1. 避免循环: 用广播 (broadcasting)
# 计算所有点对距离
points = np.random.randn(1000, 3)
# 慢: 双重循环 O(n²)
# 快: 广播!
diff = points[:, np.newaxis, :] - points[np.newaxis, :, :]
dist = np.sqrt(np.sum(diff**2, axis=-1))

# 2. 使用 where 替代 if
# 慢:
# result = np.empty_like(x)
# for i in range(len(x)):
#     result[i] = x[i] if x[i] > 0 else 0
# 快:
result = np.where(x > 0, x, 0)  # ReLU!

# 3. 使用 fancy indexing
mask = x > threshold
y = x[mask]  # 只保留满足条件的

# 4. einsum — 爱因斯坦求和
# 矩阵乘法: C = A @ B
C = np.einsum('ij,jk->ik', A, B)
# 批量矩阵乘: C[b] = A[b] @ B[b]
C = np.einsum('bij,bjk->bik', A, B)
# 向量内积求和:
trace = np.einsum('ii->', A)      # 迹!

# ═══ 内存布局 ═══
#
# C 顺序 (行优先): 遍历行快 → 默认
# Fortran 顺序 (列优先): 遍历列快
#
# A = np.zeros((m, n), order='C')   # 行优先
# A = np.zeros((m, n), order='F')   # 列优先
#
# 规则: 让最内层循环访问连续内存!
# → C 顺序: for i: for j: A[i,j]
# → F 顺序: for j: for i: A[i,j]

# ═══ 避免临时数组 ═══
# a + b + c 创建 2 个临时数组!
# 解决: 
np.add(a, b, out=result)
np.add(result, c, out=result)
# 或: numexpr
import numexpr as ne
result = ne.evaluate('a + b + c')  # 自动优化!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎮 GPU 计算 (CuPy / JAX)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> gpu_computing.py</div>
                <pre className="fs-code">{`# ═══ GPU vs CPU ═══
#
# CPU: 少量强大核心 (8-64), 低延迟, 复杂控制
# GPU: 大量弱核心 (1000-16000), 高吞吐, 简单控制
#
# 适合 GPU: 数据并行, 相同操作 × 百万数据
# 不适合:   串行逻辑, 分支密集, 内存随机访问

# ═══ CuPy: NumPy 的 GPU 替身 ═══

import cupy as cp

# 几乎完全兼容 NumPy!
a_gpu = cp.random.randn(10000, 10000)
b_gpu = cp.random.randn(10000, 10000)

c_gpu = a_gpu @ b_gpu  # GPU 矩阵乘!
# CPU: ~3 秒
# GPU (RTX 4090): ~0.05 秒 → 60x 加速!

# 数据传输:
a_cpu = np.random.randn(n, n)
a_gpu = cp.asarray(a_cpu)     # CPU → GPU
a_back = cp.asnumpy(a_gpu)    # GPU → CPU

# ⚠️ 传输是瓶颈! 尽量在 GPU 上完成整个流程!

# ═══ CuPy 稀疏矩阵 ═══
from cupyx.scipy.sparse import csr_matrix as gpu_csr
from cupyx.scipy.sparse.linalg import cg as gpu_cg

A_gpu = gpu_csr(A_cpu)
b_gpu = cp.array(b_cpu)
x_gpu, info = gpu_cg(A_gpu, b_gpu)

# ═══ JAX: 自动微分 + JIT + GPU ═══

import jax
import jax.numpy as jnp

@jax.jit  # Just-In-Time 编译
def matrix_power_iteration(A, x, n_iter=100):
    for _ in range(n_iter):
        x = A @ x
        x = x / jnp.linalg.norm(x)
    return x

# 第一次调用: 编译 (慢)
# 后续调用: 直接执行编译后的代码 (快!)

# JAX 自动微分:
grad_fn = jax.grad(loss_function)
hessian_fn = jax.hessian(loss_function)

# ═══ Numba: Python 循环 → 机器码 ═══

from numba import njit, prange

@njit(parallel=True)
def parallel_sum(A):
    n = A.shape[0]
    total = 0.0
    for i in prange(n):  # 并行循环!
        for j in range(A.shape[1]):
            total += A[i, j]
    return total

# → 接近 C 的性能, Python 的便利!

# ═══ 性能层次 ═══
#
# 方法          │ 相对速度 │ 适用场景
# ──────────────┼──────────┼──────────
# Python 循环   │ 1x       │ 永远不要!
# NumPy         │ 100x     │ 中小规模
# Numba         │ 200x     │ 复杂循环
# CuPy (GPU)    │ 500-2000x│ 大规模并行
# JAX (GPU+JIT) │ 500-3000x│ ML + 科学计算`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌊 PDE 数值模拟</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> pde_simulation.py</div>
                <pre className="fs-code">{`# ═══ PDE 的三大基本类型 ═══
#
# 1. 椭圆型: -∇²u = f   (稳态, 如泊松方程)
# 2. 抛物型: ∂u/∂t = α∇²u (扩散, 如热方程)
# 3. 双曲型: ∂²u/∂t² = c²∇²u (波动, 如波动方程)

import numpy as np
from scipy import sparse
from scipy.sparse.linalg import spsolve

# ═══ 热方程: ∂u/∂t = α ∂²u/∂x² ═══

def heat_equation_explicit(u0, alpha, dx, dt, n_steps):
    """显式 (FTCS) 格式"""
    r = alpha * dt / dx**2
    # 稳定性条件: r ≤ 0.5 !
    if r > 0.5:
        print(f"WARNING: r={r:.3f} > 0.5, 不稳定!")
    
    u = u0.copy()
    for _ in range(n_steps):
        u[1:-1] = u[1:-1] + r * (u[2:] - 2*u[1:-1] + u[:-2])
    return u

def heat_equation_implicit(u0, alpha, dx, dt, n_steps):
    """隐式 (Crank-Nicolson) 格式"""
    n = len(u0) - 2  # 内部点
    r = alpha * dt / dx**2
    
    # 无条件稳定! r 可以任意大!
    e = np.ones(n)
    A = sparse.diags([-r/2*e[1:], (1+r)*e, -r/2*e[:-1]], [-1,0,1])
    B = sparse.diags([r/2*e[1:], (1-r)*e, r/2*e[:-1]], [-1,0,1])
    
    u = u0.copy()
    for _ in range(n_steps):
        rhs = B @ u[1:-1]  # 右端
        u[1:-1] = spsolve(A.tocsr(), rhs)
    return u

# ═══ 泊松方程: -∇²u = f (2D) ═══

def poisson_2d(f, n, dx):
    """2D 泊松方程, 五点差分"""
    N = n * n  # 总未知数
    
    # 构建 Laplacian 矩阵
    I = sparse.eye(n)
    L1d = sparse.diags([-1, 2, -1], [-1, 0, 1], shape=(n, n))
    A = (sparse.kron(I, L1d) + sparse.kron(L1d, I)) / dx**2
    
    # 右端
    b = f.flatten()
    
    # 求解
    u = spsolve(A.tocsr(), b)
    return u.reshape(n, n)

# ═══ 波动方程: ∂²u/∂t² = c² ∂²u/∂x² ═══

def wave_equation(u0, v0, c, dx, dt, n_steps):
    """Leapfrog (中心差分) 格式"""
    r = c * dt / dx
    # CFL 条件: r ≤ 1 !
    
    u_prev = u0.copy()
    u_curr = u0.copy()
    u_curr[1:-1] += dt * v0[1:-1]  # 初速度
    
    for _ in range(n_steps):
        u_next = np.zeros_like(u_curr)
        u_next[1:-1] = (2*u_curr[1:-1] - u_prev[1:-1] 
                       + r**2 * (u_curr[2:] - 2*u_curr[1:-1] + u_curr[:-2]))
        u_prev = u_curr
        u_curr = u_next
    
    return u_curr

# ═══ CFL 条件 (Courant-Friedrichs-Lewy) ═══
#
# 数值信息传播速度 ≥ 物理信息传播速度!
# c·dt/dx ≤ 1 (1D)
# c·dt/√(dx²+dy²) ≤ 1 (2D)
#
# 违反 → 不稳定 → 解爆炸!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏆 综合实战与课程总结</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> capstone.txt</div>
                <pre className="fs-code">{`═══ 综合项目: 流体模拟 (2D Navier-Stokes) ═══

  ∂u/∂t + (u·∇)u = -∇p/ρ + ν∇²u
  ∇·u = 0 (不可压缩)

  数值方法:
  1. Chorin 投影法 (分裂方法)
     a. 求解不含压力的动量方程 (显式/半隐式)
     b. 求解泊松方程 ∇²p = ∇·u* (投影步)
     c. 修正速度 u = u* - ∇p·dt/ρ
  
  2. 空间: 有限差分 (交错网格)
  3. 时间: Crank-Nicolson (扩散) + Adams-Bashforth (对流)
  4. 泊松: CG/FFT (周期边界用 FFT!)

  技术栈:
  • NumPy/SciPy: 原型
  • CuPy: GPU 加速
  • Matplotlib: 可视化 (速度场/涡量场)

═══ 数值计算课程知识图谱 ═══

  层次                │ 工具/方法           │ 关键概念
  ────────────────────┼─────────────────────┼─────────
  L0: 浮点基础        │ IEEE 754            │ 精度/稳定性
  L1: 线性代数        │ LU/Cholesky/CG      │ 条件数
  L2: 逼近论          │ 插值/拟合/FFT       │ 收敛阶
  L3: 微积分          │ 积分/ODE/PDE        │ 稳定性
  L4: 大规模计算      │ 稀疏/特征值/GPU     │ 可扩展性

═══ 核心公式速查 ═══

  误差: |fl(x)| ≤ |x|(1 + ε_mach)
  条件数: cond(A) = ‖A‖·‖A⁻¹‖
  LU: PA = LU, O(n³/3)
  Cholesky: A = LLᵀ, O(n³/6)  (SPD)
  CG 收敛: O(√κ) 步
  Simpson: 误差 O(h⁴)
  RK4: 误差 O(h⁴)
  FFT: O(N log N)
  CFL: c·dt/dx ≤ 1

═══ 从数值到 AI 的桥梁 ═══

  数值计算                 │ AI/ML 中的对应
  ─────────────────────────┼──────────────────
  矩阵分解 (SVD/LU)       │ 模型压缩
  迭代法 (CG/GMRES)       │ 优化器
  ODE 求解                 │ Neural ODE
  有限元                   │ 物理信息神经网络 (PINN)
  FFT                      │ 频域特征提取
  稀疏矩阵                 │ 图神经网络
  并行计算 (GPU)           │ 分布式训练
  自适应网格               │ 自适应计算

═══ 推荐学习资源 ═══

  教材:
  • Trefethen & Bau "Numerical Linear Algebra"
  • LeVeque "Finite Difference Methods for ODEs and PDEs"
  • Press et al. "Numerical Recipes"

  工具:
  • SciPy Lecture Notes (免费在线)
  • NumPy/SciPy 官方文档
  • CuPy 文档

  进阶:
  • PETSc: 大规模并行数值库
  • FEniCS: 有限元自动化
  • Firedrake: GPU 加速有限元
  • JAX: 可微分科学计算`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
