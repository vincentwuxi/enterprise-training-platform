import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const CORES = [
  { id: 0, label: 'Core 0', l1: '48KB', l2: '1.25MB', color: '#f59e0b' },
  { id: 1, label: 'Core 1', l1: '48KB', l2: '1.25MB', color: '#3b82f6' },
  { id: 2, label: 'Core 2', l1: '48KB', l2: '1.25MB', color: '#22c55e' },
  { id: 3, label: 'Core 3', l1: '48KB', l2: '1.25MB', color: '#a855f7' },
];

// MESI 协议状态机
const MESI_STATES = {
  M: { name: 'Modified',  color: '#ef4444',  desc: '本核独占，数据已修改，与内存不同，其他核无此数据' },
  E: { name: 'Exclusive', color: '#f59e0b',  desc: '本核独占，数据与内存相同，其他核无此数据' },
  S: { name: 'Shared',    color: '#22c55e',  desc: '多核共享，数据与内存相同（只读）' },
  I: { name: 'Invalid',   color: '#475569',  desc: '数据无效，需要从内存或其他核获取' },
};

const MESI_TRANSITIONS = [
  { from: 'I', event: '本地读（其他核无）', to: 'E', notes: 'Cache Miss → 从内存加载' },
  { from: 'I', event: '本地读（其他核有）', to: 'S', notes: 'Cache Miss → 从其他核或内存加载' },
  { from: 'E', event: '本地写', to: 'M', notes: 'Hit → 直接修改，不通知其他核' },
  { from: 'S', event: '本地写', to: 'M', notes: 'Hit → 广播 Invalidate 到所有持有S的核' },
  { from: 'M', event: '其他核读', to: 'S', notes: '需要先写回内存，再共享' },
  { from: 'M', event: '其他核写', to: 'I', notes: '本核数据失效（False Sharing！）' },
];

function MESIDemo() {
  const [states, setStates] = useState(['I', 'I', 'I', 'I']);
  const [log, setLog] = useState([]);

  const doAction = (coreIdx, action) => {
    const newStates = [...states];
    let msg = '';

    if (action === 'read') {
      const othersHave = newStates.some((s, i) => i !== coreIdx && s !== 'I');
      if (newStates[coreIdx] !== 'I') {
        msg = `Core ${coreIdx} 读：Cache 命中 (${newStates[coreIdx]})`;
      } else {
        if (othersHave) {
          newStates[coreIdx] = 'S';
          // downgrade M→S for any Modified core
          newStates.forEach((s, i) => { if (i !== coreIdx && s === 'M') newStates[i] = 'S'; });
          msg = `Core ${coreIdx} 读：Miss → 从其他核获取，状态 I→S`;
        } else {
          newStates[coreIdx] = 'E';
          msg = `Core ${coreIdx} 读：Miss → 从内存加载，状态 I→E（独占）`;
        }
      }
    } else {
      if (newStates[coreIdx] === 'M') {
        msg = `Core ${coreIdx} 写：已独占 Modified，直接写入`;
      } else {
        for (let i = 0; i < 4; i++) {
          if (i !== coreIdx) newStates[i] = 'I'; // Invalidate others
        }
        newStates[coreIdx] = 'M';
        msg = `Core ${coreIdx} 写：广播 Invalidate，其他核状态→I，本核→M`;
      }
    }

    setStates(newStates);
    setLog(prev => [...prev.slice(-5), msg]);
  };

  const reset = () => { setStates(['I', 'I', 'I', 'I']); setLog([]); };

  return (
    <div className="ca-interactive">
      <h3>🔗 MESI 缓存一致性协议模拟器
        <button className="ca-btn red" onClick={reset}>↺ 重置</button>
      </h3>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        {CORES.map((core, i) => (
          <div key={i} style={{ flex: 1, minWidth: 130, padding: '0.625rem', border: `1.5px solid ${core.color}30`, borderRadius: '10px', background: `${core.color}05`, textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: core.color, marginBottom: '0.3rem' }}>{core.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.1rem', fontWeight: 900,
              color: MESI_STATES[states[i]].color, marginBottom: '0.35rem' }}>{states[i]}</div>
            <div style={{ fontSize: '0.6rem', color: '#334155', marginBottom: '0.35rem' }}>{MESI_STATES[states[i]].name}</div>
            <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
              <button className="ca-btn blue" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem' }} onClick={() => doAction(i, 'read')}>读</button>
              <button className="ca-btn red"  style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem' }} onClick={() => doAction(i, 'write')}>写</button>
            </div>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <div style={{ background: '#0d0f0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.5rem 0.75rem', fontFamily: 'JetBrains Mono', fontSize: '0.68rem', maxHeight: 120, overflowY: 'auto' }}>
          {log.map((l, i) => <div key={i} style={{ color: '#94a3b8', marginBottom: '0.1rem' }}>▸ {l}</div>)}
        </div>
      )}
      <div style={{ marginTop: '0.4rem', fontSize: '0.68rem', color: '#334155' }}>
        💡 False Sharing：两核写同一 Cache Line 的不同变量 → 频繁 Invalidate → 性能暴降！解决：padding 让变量独占 Cache Line（通常 64B）
      </div>
    </div>
  );
}

const PARALLEL_TOPICS = [
  {
    name: 'SIMD 向量化', icon: '📦', color: '#f59e0b',
    code: `# SIMD（Single Instruction Multiple Data）— 数据并行

# 传统标量：一次处理1个float
for i in range(8):
    c[i] = a[i] + b[i]   # 8次独立加法指令

# SIMD AVX2 (256位)：一次处理8个float
# ymm0 = [a0, a1, a2, a3, a4, a5, a6, a7]  ← 256bit向量
# ymm1 = [b0, b1, b2, b3, b4, b5, b6, b7]
# VADDPS ymm2, ymm0, ymm1  ← 一条指令并行加8对浮点数！

# ── Python NumPy 自动向量化 ──
import numpy as np

# NumPy 底层调用 BLAS/LAPACK，自动使用 AVX/AVX-512
a = np.random.rand(1_000_000).astype(np.float32)
b = np.random.rand(1_000_000).astype(np.float32)

# 向量化（SIMD自动分派）
c = a + b  # AVX2: 每周期处理8个float，比纯Python快200x

# ── C 内置函数（Intrinsics）直接写 SIMD ──
#include <immintrin.h>
//
// __m256 va = _mm256_load_ps(a + i);    // 加载256位=8xfloat
// __m256 vb = _mm256_load_ps(b + i);
// __m256 vc = _mm256_add_ps(va, vb);   // SIMD加法
// _mm256_store_ps(c + i, vc);          // 写回

# ── AVX-512 (服务器)：一次处理16个float ──
# Zen4/Sapphire Rapids 支持 512位向量
# 深度学习推理框架（Openvino/ONNX Runtime）大量使用

# ── GPU SIMT：超级SIMD ──
# NVIDIA H100：8192个 CUDA Core，每核一条SIMD
# 一次执行 Warp (32线程) = 32个数据并行运算`,
  },
  {
    name: 'NUMA 架构', icon: '🌐', color: '#3b82f6',
    code: `# NUMA（Non-Uniform Memory Access）— 多处理器内存访问不均匀

# ── 为什么需要 NUMA ──
# SMP（对称多处理）：所有 CPU 共享同一条内存总线
# 总线成为瓶颈：64核 CPU → 数百 GB/s 内存带宽需求 > 单总线能力
# NUMA 解决方案：每个 CPU Socket 有本地内存，通过 QPI/Infinity Fabric 互联

# ── NUMA 拓扑（Intel 2-socket 服务器）──
# Socket 0 (CPU0-CPU31) ↔ Local DRAM 0 (256GB)  ← 本地访问: 70ns
# Socket 1 (CPU32-CPU63) ↔ Local DRAM 1 (256GB) ← 本地访问: 70ns
# 跨Socket访问：CPU0 访问 DRAM 1 → 通过 QPI → 140ns（慢2倍！）

# ── 查看 NUMA 拓扑 ──
# numactl --hardware
# node 0 cpus: 0 2 4 6 8 10 12 14
# node 1 cpus: 1 3 5 7 9 11 13 15
# node distances: 0→0=10, 0→1=21 (2.1x slower cross-socket)

# ── NUMA 优化策略 ──
# 1. 进程绑定（CPU + 内存亲和性）
import os
os.sched_setaffinity(0, {0, 2, 4, 6})  # 绑定到 CPU 0,2,4,6

# numactl --cpunodebind=0 --membind=0 python app.py
# → 进程只在 Node0 的 CPU 上运行，只分配 Node0 的内存

# 2. 大页（Huge Pages）减少 TLB Miss
# HugePage 2MB vs 普通页 4KB → TLB 条目效率提高 512倍
# echo 1024 > /proc/sys/vm/nr_hugepages
# 数据库（MySQL/Oracle）和 JVM 都支持大页配置

# 3. NUMA-aware 内存分配（libnuma）
# numa_alloc_onnode(size, node)   // 在指定 NUMA 节点分配内存`,
  },
  {
    name: 'GPU 架构', icon: '🖥️', color: '#22c55e',
    code: `# GPU 架构：大规模并行计算

# ── CPU vs GPU 核心设计哲学区别 ──
#       CPU              GPU
# 核心数   16~64个          6144~18432个（CUDA Cores）
# 时钟频率  4~6 GHz          1.5~2.5 GHz（每核慢）
# L1 Cache  48KB ~独立       ~96KB 共享(Shared Memory)
# 设计目标  低延迟单线程      高吞吐并行
# 分支预测  强（IPC优先）     弱（分支导致 Warp 分化）
# 内存带宽  50~200 GB/s      ~2000 GB/s (HBM3)

# ── CUDA 线程层次 ──
# Thread(线程) → Warp(32线程,SIMT执行) → Block → Grid
# Warp：32个线程执行完全相同的指令（不同数据）
# 分支分化：if/else导致一半线程空等 → Warp Divergence

# CUDA 向量加法：
import numpy as np
from numba import cuda

@cuda.jit
def vector_add(a, b, c):
    idx = cuda.grid(1)          # 获取全局线程索引
    if idx < a.shape[0]:
        c[idx] = a[idx] + b[idx]  # 每个线程处理一个元素

n = 10_000_000
a_gpu = cuda.to_device(np.random.rand(n).astype(np.float32))
b_gpu = cuda.to_device(np.random.rand(n).astype(np.float32))
c_gpu = cuda.device_array(n, dtype=np.float32)

threads_per_block = 256
blocks = (n + threads_per_block - 1) // threads_per_block
vector_add[blocks, threads_per_block](a_gpu, b_gpu, c_gpu)
# 10M次加法在 H100 上 < 1ms！（CPU需要~10ms）

# ── 大模型推理为什么用 GPU ──
# Transformer Attention：大矩阵乘法 O(n²d) → 完美并行
# H100 Tensor Core：FP8矩阵乘法 9 PFLOPS（每秒9千万亿次！）`,
  },
];

export default function LessonParallel() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = PARALLEL_TOPICS[activeTopic];

  return (
    <div className="lesson-ca">
      <div className="ca-badge purple">⚡ module_08 — 并行体系结构</div>
      <div className="ca-hero">
        <h1>并行架构：多核 / SIMD / GPU / NUMA 拓扑</h1>
        <p>摩尔定律减速后，性能提升依赖<strong>并行计算</strong>：多核 CPU 通过 MESI 协议保持 Cache 一致性，SIMD 指令在一个周期内处理 16 个数据，GPU 以数千核心驱动 AI 时代。</p>
      </div>

      <MESIDemo />

      {/* MESI 状态速查 */}
      <div className="ca-section">
        <h2 className="ca-section-title">📋 MESI 四种状态</h2>
        <div className="ca-grid-4">
          {Object.entries(MESI_STATES).map(([key, s]) => (
            <div key={key} className="ca-card" style={{ borderColor: `${s.color}20`, textAlign: 'center', padding: '0.875rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{key}</div>
              <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.3rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ca-section">
        <h2 className="ca-section-title">🚀 并行计算三大技术</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {PARALLEL_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.08)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="ca-code-wrap">
          <div className="ca-code-head"><div className="ca-code-dot" style={{ background: '#ef4444' }}/><div className="ca-code-dot" style={{ background: '#f59e0b' }}/><div className="ca-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span></div>
          <div className="ca-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      {/* 结课卡片 */}
      <div className="ca-section">
        <div className="ca-card" style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.05),rgba(34,197,94,0.03))', border: '1px solid rgba(245,158,11,0.15)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成计算机组成原理全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.4rem', textAlign: 'left' }}>
            {[
              '✅ 层次模型 + 冯诺依曼架构 + 历史里程碑',
              '✅ 5种逻辑门交互模拟 + 4位加法器',
              '✅ RISC-V指令格式位字段可视化 + 六大寻址模式',
              '✅ 五级流水线时序动画 + 冒险检测 + Stall注入',
              '✅ 2路组相联Cache模拟器 + LRU替换 + 命中率',
              '✅ 虚拟地址翻译可视化 + 进程地址空间布局',
              '✅ 四种I/O方式 + DMA原理 + 零拷贝',
              '✅ MESI协议实时模拟 + SIMD/NUMA/GPU架构',
            ].map(s => <div key={s} style={{ fontSize: '0.78rem', color: '#64748b' }}>{s}</div>)}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            📚 推荐资讹：《CSAPP》· CS61C（Berkeley）· CS152（CMU）· 《计算机组成与体系结构》唐朔飞版
          </div>
        </div>
      </div>

      <div className="ca-nav">
        <button className="ca-btn" onClick={() => navigate('/course/computer-arch/lesson/io')}>← 上一模块</button>
        <button className="ca-btn primary" onClick={() => navigate('/course/computer-arch')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
