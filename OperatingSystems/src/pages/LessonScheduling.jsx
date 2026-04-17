import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['调度基础', '经典算法', 'Linux CFS', '实时调度'];

export default function LessonScheduling() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⏱️ module_03 — CPU 调度</div>
      <div className="fs-hero">
        <h1>CPU 调度：FCFS / SJF / RR / MLFQ / CFS</h1>
        <p>
          CPU 调度决定了<strong>哪个进程获得 CPU、何时获得、使用多久</strong>。
          好的调度算法要平衡吞吐量、响应时间、公平性和实时性。本模块从 FCFS 到 Linux 的
          完全公平调度器 (CFS) 逐步深入，理解红黑树如何保证 O(log N) 的调度决策，
          以及实时进程为什么能"抢占一切"。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⏱️ CPU 调度深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 调度基础概念</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#475569'}}></span> scheduling_basics.txt</div>
                <pre className="fs-code">{`# ═══ 调度的时机 ═══
# 什么时候需要调度?
# 1. 进程从 运行→阻塞 (如发起 I/O)
# 2. 进程从 运行→就绪 (时间片耗尽)
# 3. 进程从 阻塞→就绪 (I/O 完成)
# 4. 进程 终止
#
# 非抢占式: 只在 1、4 触发调度 (进程主动放弃)
# 抢占式:   1-4 都可能触发 (内核强制调度)

# ═══ 调度性能指标 ═══
#
# ┌─────────────────────────────────────────────────┐
# │  指标          │  定义                │  优化方向│
# ├─────────────────────────────────────────────────┤
# │ 周转时间       │ 完成时间 - 到达时间  │ 越小越好│
# │ (Turnaround)  │                      │         │
# ├────────────────┼──────────────────────┼─────────┤
# │ 等待时间       │ 在就绪队列中等待的   │ 越小越好│
# │ (Waiting)      │ 总时间               │         │
# ├────────────────┼──────────────────────┼─────────┤
# │ 响应时间       │ 首次获得CPU - 到达   │ 越小越好│
# │ (Response)     │ 时间                 │         │
# ├────────────────┼──────────────────────┼─────────┤
# │ 吞吐量         │ 单位时间完成的       │ 越大越好│
# │ (Throughput)   │ 进程数               │         │
# ├────────────────┼──────────────────────┼─────────┤
# │ CPU 利用率     │ CPU 忙碌时间比例     │ 越高越好│
# │ (Utilization)  │                      │         │
# └────────────────┴──────────────────────┴─────────┘
#
# ⚠️ 这些指标往往互相矛盾:
# → 提高吞吐量 (大时间片) → 响应时间变差
# → 降低响应时间 (小时间片) → 上下文切换开销增大

# ═══ CPU-bound vs I/O-bound ═══
# CPU 密集型: 大量计算, 很少 I/O
#   例: 视频编码, 科学计算, 编译
#   → 需要大时间片, 减少切换开销
#
# I/O 密集型: 频繁 I/O, 少量计算  
#   例: Web 服务器, 数据库, 编辑器
#   → 需要快速响应, 高优先级
#
# 好的调度器应该优先 I/O-bound 进程
# (它们会很快主动放弃 CPU)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 经典调度算法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> classic_algorithms.txt</div>
                <pre className="fs-code">{`# ═══ 1. FCFS (先来先服务, First Come First Served) ═══
# 最简单: 按到达顺序执行, 非抢占
#
# 进程:  P1(24ms)  P2(3ms)  P3(3ms)
# 
# 甘特图: |──── P1 (24ms) ────|── P2 ──|── P3 ──|
# 时间:   0                   24       27       30
#
# 等待时间: P1=0, P2=24, P3=27 → 平均=17ms
# 
# 问题: "护航效应" (Convoy Effect)
# → 一个长进程让所有短进程等待
# → 如果 P2,P3 先到: 平均等待 = (0+3+6)/3 = 3ms!

# ═══ 2. SJF (最短作业优先, Shortest Job First) ═══
# 选择 CPU burst 最短的进程
# → 理论上最优 (最小平均等待时间)
# → 但实际中无法预知 CPU burst 长度!
#
# 非抢占式 SJF:
# 进程: P1(7) P2(4) P3(1) P4(4) (同时到达)
# 顺序: P3(1) → P2(4) → P4(4) → P1(7)
# 等待: 0 + 1 + 5 + 9 = 15/4 = 3.75ms
#
# 抢占式 SJF = SRTF (最短剩余时间优先)
# 新进程到达时, 当前剩余 > 新进程 → 切换

# ═══ 3. 优先级调度 (Priority Scheduling) ═══
# 每个进程有一个优先级值, 选最高的
# → 可以是抢占式或非抢占式
#
# 问题: 饥饿 (Starvation)
# → 低优先级进程永远轮不到
# → 解决: 老化 (Aging) — 等待越久, 优先级越高
# → Linux: nice 值 -20(最高) 到 +19(最低)

# ═══ 4. RR (时间片轮转, Round Robin) ═══
# 每个进程获得一个固定时间片 (quantum)
# 时间片用完 → 放到队列末尾
#
# quantum = 4ms
# 进程: P1(24) P2(3) P3(3)
#
# |P1|P2|P3|P1|P1|P1|P1|P1|
# 0  4  7  10 14 18 22 26 30
#
# P2 在 4ms 就得到 CPU (FCFS 要等 24ms!)
# → 响应时间大幅改善
#
# quantum 的选择:
# → 太大: 退化为 FCFS
# → 太小: 上下文切换开销过大 (>10% CPU)
# → 经验值: 10-100ms (Linux ~4ms)

# ═══ 5. MLFQ (多级反馈队列) ═══
# 现代 OS 调度的基础思想
#
# ┌──────────────────────────────────┐
# │ Queue 0 (最高优先级) quantum=8ms │ ← 新进程进入
# │ [P1] [P4] [P7]                  │
# ├──────────────────────────────────┤
# │ Queue 1 (中等优先级) quantum=16ms│ ← 用完Q0的下来
# │ [P2] [P5]                       │
# ├──────────────────────────────────┤
# │ Queue 2 (最低优先级) quantum=32ms│ ← CPU密集型
# │ [P3]                            │ ← 时间片最大
# └──────────────────────────────────┘
#
# 规则:
# 1. 新进程从最高优先级队列开始
# 2. 用完时间片 → 降到下一级队列
# 3. 主动放弃 CPU (I/O) → 保持当前级别
# 4. 定期提升所有进程 (防止饥饿)
#
# 效果:
# I/O-bound 进程总在高优先级队列 → 响应快
# CPU-bound 进程逐渐降到低优先级 → 大时间片`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐧 Linux CFS (完全公平调度器)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> linux_cfs.txt</div>
                <pre className="fs-code">{`# ═══ CFS: Completely Fair Scheduler ═══
# Linux 2.6.23+ 的默认调度器 (Ingo Molnar, 2007)
# 核心思想: 每个进程应该获得 "公平" 的 CPU 时间

# ═══ 核心概念: vruntime (虚拟运行时间) ═══
# 
# vruntime = 实际运行时间 × (NICE_0_WEIGHT / weight)
#
# nice=0 的进程: weight=1024, vruntime = 实际时间
# nice=5 的进程: weight=335,  vruntime = 实际×3.06
# nice=-5的进程: weight=3121, vruntime = 实际×0.33
#
# → nice 值越低, vruntime 增长越慢 → 被选中执行得越多
# → nice 每增加 1 ≈ CPU 时间减少约 10%

# ═══ 数据结构: 红黑树 ═══
#
#           vruntime=50
#          ╱          ╲
#     vruntime=30    vruntime=70
#      ╱     ╲        ╱      ╲
#   vrt=20  vrt=40  vrt=60  vrt=80
#    ★                              
# 最左节点 = vruntime 最小 = 下一个执行的进程
#
# CFS 总是选择 vruntime 最小的进程
# → O(1) 取出最左节点 (已缓存)
# → O(log N) 插入/删除
# → N = 就绪队列中的进程数

# ═══ CFS 调度周期 ═══
# 
# 调度周期 (sched_latency) = 6ms (默认, 进程数≤8)
# 如果进程数 > 8:
#   调度周期 = 进程数 × sched_min_granularity (0.75ms)
#
# 每个进程的时间片 = 调度周期 × (weight_i / Σweight)
#
# 例: 3个进程, nice=0,0,5
# weight: 1024, 1024, 335
# 总weight: 2383
# P1 时间片: 6ms × 1024/2383 = 2.58ms
# P2 时间片: 6ms × 1024/2383 = 2.58ms
# P3 时间片: 6ms × 335/2383  = 0.84ms

# ═══ 查看和调优 CFS 参数 ═══
# 
# $ cat /proc/sys/kernel/sched_latency_ns
# 6000000  (6ms)
#
# $ cat /proc/sys/kernel/sched_min_granularity_ns
# 750000   (0.75ms)
#
# $ cat /proc/sys/kernel/sched_wakeup_granularity_ns
# 1000000  (1ms, 唤醒抢占阈值)
#
# $ chrt -p $$         # 查看当前进程的调度策略
# $ nice -n -5 ./app   # 以 nice=-5 启动
# $ renice -n 10 -p 1234  # 动态修改

# ═══ CFS 组调度 (cgroups) ═══
# 问题: 用户 A 开 100 个进程, 用户 B 开 1 个
# → 没有组调度: A 获得 99% CPU, B 只有 1%
#
# 解决: CPU cgroup
# /sys/fs/cgroup/cpu/group_A/  → cpu.shares=1024
# /sys/fs/cgroup/cpu/group_B/  → cpu.shares=1024
# → 两个组各获得 50% CPU
# → Docker 就是用这个机制限制容器 CPU

# ═══ Linux 6.6+: EEVDF 调度器 ═══
# Earliest Eligible Virtual Deadline First
# → CFS 的继任者, 2023年合入主线
# → 引入 "deadline" 概念
# → 更好的延迟保证, 减少调度延迟
# → 不依赖 sched_wakeup_granularity 启发式`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚨 实时调度</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> realtime_scheduling.txt</div>
                <pre className="fs-code">{`# ═══ Linux 调度类层次 ═══
#
# ┌─────────────────────────────────────┐
# │  Stop Scheduler (最高优先级)        │ ← 内核内部
# │  → CPU 热插拔, 迁移线程             │
# ├─────────────────────────────────────┤
# │  Deadline Scheduler (SCHED_DEADLINE)│ ← 软实时
# │  → 保证截止时间的实时任务            │
# │  → EDF (最早截止时间优先)            │
# ├─────────────────────────────────────┤
# │  RT Scheduler (SCHED_FIFO/RR)      │ ← 实时
# │  → 优先级 1-99 (99最高)             │
# │  → FIFO: 不抢占同级, 运行到完成     │
# │  → RR: 同级轮转                     │
# ├─────────────────────────────────────┤
# │  CFS (SCHED_NORMAL)                │ ← 普通进程
# │  → nice: -20 到 +19                 │
# │  → 99% 的进程用这个                 │
# ├─────────────────────────────────────┤
# │  Idle Scheduler (SCHED_IDLE)       │ ← 最低
# │  → 只有系统空闲时才运行             │
# └─────────────────────────────────────┘
#
# 优先级: Stop > Deadline > RT > CFS > Idle
# → RT 进程总是可以抢占 CFS 进程!

# ═══ 实时调度策略 ═══
#
# SCHED_FIFO (实时 FIFO)
# → 一旦获得 CPU, 一直运行直到:
#   1. 主动放弃 (sleep/yield)
#   2. 更高优先级的实时进程抢占
# → ⚠️ 不当使用可导致系统卡死!
#
# SCHED_RR (实时轮转)
# → 同优先级的实时进程轮转
# → 时间片: sched_rr_get_interval()
#
# SCHED_DEADLINE (截止时间调度)
# → 任务声明: (runtime, deadline, period)
# → "我每 period 时间需要 runtime 的CPU时间"
# → 内核保证在 deadline 前完成
# → 准入控制: 如果总利用率 > 100%, 拒绝新任务

# ═══ 设置实时进程 ═════
# 
# # 设置为SCHED_FIFO, 优先级80 (需要root)
# $ chrt -f 80 ./my_realtime_app
#
# # 设置为SCHED_RR
# $ chrt -r 50 ./my_app
#
# # 设置SCHED_DEADLINE
# $ chrt -d --sched-runtime 5000000 \\
#           --sched-deadline 10000000 \\
#           --sched-period 16666666 ./video_app

# ═══ 实时 Linux (PREEMPT_RT) ═══
# 标准 Linux 不是硬实时系统
# → 内核代码段可能关闭抢占
# → 最坏延迟可达数十毫秒
#
# PREEMPT_RT patch (已合入主线 ~6.x):
# → 自旋锁改为可抢占的互斥锁
# → 中断处理线程化
# → 最坏延迟 < 100μs
# → 适用: 工业控制、音频处理、自动驾驶

# ═══ 多核调度 ═══
# 现代 CPU 多核 → 需要考虑负载均衡
#
# CPU 亲和性 (Affinity):
# → 进程尽量留在同一个 CPU (缓存热度)
# $ taskset -c 0,1 ./app  # 限制在 CPU 0,1
#
# NUMA (非统一内存架构):
# → 不同 CPU 访问不同内存区域速度不同
# → 调度器尽量让进程在本地 NUMA 节点运行
# $ numactl --membind=0 --cpunodebind=0 ./app`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
