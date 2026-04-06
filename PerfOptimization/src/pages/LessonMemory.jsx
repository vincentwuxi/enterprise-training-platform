import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const MEMORY_TOPICS = [
  {
    name: 'Python 内存泄漏', icon: '🐍', color: '#22c55e',
    code: `# Python 内存泄漏：检测与修复

# ── 1. tracemalloc：内置内存追踪 ──
import tracemalloc
import linecache

tracemalloc.start()

# 运行被怀疑泄漏的代码...
simulate_leak()

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')

print("Top 10 内存分配:")
for stat in top_stats[:10]:
    print(stat)  # 显示每个源码位置的内存占用

# ── 2. 常见 Python 内存泄漏模式 ──

# 泄漏模式1：全局列表无限增长
class EventBus:
    _listeners = []   # ❌ 类级别全局列表！不会 GC
    
    @classmethod
    def subscribe(cls, handler):
        cls._listeners.append(handler)  # 永远不清理

# ✅ 修复：使用 WeakRef（对象被 GC 后自动从列表移除）
import weakref

class SafeEventBus:
    _listeners = []
    
    @classmethod
    def subscribe(cls, handler):
        cls._listeners.append(weakref.ref(handler))  # 弱引用！
    
    @classmethod
    def emit(cls, *args):
        # 过滤已 GC 的 handler
        cls._listeners = [ref for ref in cls._listeners if ref() is not None]
        for ref in cls._listeners:
            if (h := ref()):
                h(*args)

# 泄漏模式2：缓存无限增长（未设上限）
class BadCache:
    cache = {}   # ❌ 永远增长，直到 OOM

# ✅ 修复：使用 LRU 缓存（设容量上限）
from functools import lru_cache
from cachetools import TTLCache

@lru_cache(maxsize=1000)   # 最多 1000 条，LRU 淘汰
def expensive_fn(key):
    return compute(key)

ttl_cache = TTLCache(maxsize=500, ttl=300)  # TTL 过期自动清理

# 泄漏模式3：线程/协程对象泄漏
tasks = []
for i in range(10000):
    task = asyncio.create_task(worker())
    tasks.append(task)   # ❌ 未 await，任务引用堆积

# ✅ 修复：批量处理，不保存无限引用
async def process_batch(items):
    await asyncio.gather(*[worker(item) for item in items])  # 自动清理

# ── 3. objgraph 对象泄漏可视化 ──
import objgraph
objgraph.show_growth(limit=10)   # 显示增长最快的对象类型
objgraph.show_refs([obj], filename='leak.png')  # 引用关系图`,
  },
  {
    name: 'JVM GC 调优', icon: '☕', color: '#f97316',
    code: `# JVM 垃圾回收调优指南（Java / Kotlin）

# ── GC 算法选择 ──
# G1GC（推荐：通用默认）
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200      # 目标停顿时间（ms）
-XX:G1HeapRegionSize=16m      # 堆区域大小（1-32M，2的幂）
-XX:G1NewSizePercent=20       # 新生代最小占比
-XX:G1MaxNewSizePercent=60    # 新生代最大占比

# ZGC（低延迟：停顿<1ms，适合>8GB堆）
-XX:+UseZGC
-XX:ConcGCThreads=4           # 并发GC线程数
-Xmx64g -Xms64g               # ZGC 建议预分配全部堆内存

# Shenandoah（类似 ZGC，Red Hat）
-XX:+UseShenandoahGC

# ── GC 日志分析 ──
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:/logs/gc.log
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=10
-XX:GCLogFileSize=50m

# GC 日志输出示例（G1GC）：
# [GC pause (G1 Evacuation Pause) (young), 0.0523456 secs]
# [Eden: 512.0M(512.0M)->0.0B    Survivors: 64.0M->64.0M Heap: 1.5G(4.0G)->1.0G(4.0G)]
#
# 关键指标：
# - Pause time > 500ms → 调大 MaxGCPauseMillis 或换 ZGC
# - Heap usage > 75% 触发 Full GC → 调大 -Xmx
# - Eden 频繁回收 → 增大新生代 G1NewSizePercent

# ── 内存参数最佳实践 ──
# 容器环境（Docker/K8s）必须设置！
-XX:+UseContainerSupport        # JVM 感知容器内存限制
-XX:MaxRAMPercentage=75.0       # 使用容器内存的75%（留余量）
-Xss512k                        # 线程栈大小（默认 1MB，减小可支持更多线程）

# ── MAT（Memory Analyzer Tool）分析 Heap Dump ──
# jmap -dump:format=b,file=heap.hprof <PID>
# 打开 MAT → Find Leak → 按 Retained Size 排序
# 重点看：Dominator Tree（最大内存占用对象树）`,
  },
  {
    name: 'Go 内存优化', icon: '🐹', color: '#8b5cf6',
    code: `// Go 内存优化：减少 GC 压力 + 对象池

package main

import (
    "sync"
    "runtime"
    "runtime/pprof"
)

// ── 1. sync.Pool：对象复用（最重要的 Go 性能技巧！）──
// 场景：频繁分配的临时对象（bytes.Buffer, json.Encoder 等）
var bufPool = sync.Pool{
    New: func() interface{} {
        return make([]byte, 0, 64*1024)  // 预分配 64KB
    },
}

func processRequest(data []byte) {
    buf := bufPool.Get().([]byte)        // 从池取（可能复用）
    defer bufPool.Put(buf[:0])           // 归还（重置 len=0）
    
    buf = append(buf, data...)           // 使用
    // ... 处理 buf
}

// ── 2. 预分配 slice（避免频繁扩容拷贝）──
// ❌ 频繁扩容：每次超过 cap，Go 分配新底层数组（2倍扩容）
bad := []int{}
for i := 0; i < 100000; i++ {
    bad = append(bad, i)     // 扩容约 17 次！
}

// ✅ 预分配：一次分配，不扩容
good := make([]int, 0, 100000)  // cap=100000
for i := 0; i < 100000; i++ {
    good = append(good, i)       // 从不扩容
}

// ── 3. 减少指针逃逸（逃逸到堆 = GC 压力）──
// go build -gcflags="-m" 可以看到哪些变量"逃逸"到堆

// ❌ 返回指针 → 变量必须分配到堆（GC管理）
func newUser() *User {
    u := User{Name: "test"}
    return &u        // u 逃逸到堆
}

// ✅ 值返回 → 分配在调用者的栈上（不需要 GC）
func newUserValue() User {
    return User{Name: "test"}   // 栈分配，超快！
}

// ── 4. pprof 内存分析（Go 内置）──
// go tool pprof -http=:8080 http://localhost:8080/debug/pprof/heap
// 看 alloc_space（总内存分配）和 inuse_space（当前使用）
// 找 Top 分配函数 → 针对性用 sync.Pool 优化`,
  },
];

export default function LessonMemory() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = MEMORY_TOPICS[activeTopic];

  const GC_ALGOS = [
    { name: 'Serial GC',   pauseMs: 800,  throughput: 60,  use: '单核/低内存嵌入式', color: '#ef4444' },
    { name: 'Parallel GC', pauseMs: 200,  throughput: 95,  use: '批处理/吞吐优先', color: '#f97316' },
    { name: 'G1 GC',       pauseMs: 100,  throughput: 90,  use: '通用，默认推荐', color: '#22c55e' },
    { name: 'ZGC',         pauseMs: 1,    throughput: 85,  use: '大堆/低延迟 API', color: '#3b82f6' },
    { name: 'Shenandoah',  pauseMs: 2,    throughput: 83,  use: '低延迟替代方案', color: '#8b5cf6' },
  ];

  return (
    <div className="lesson-po">
      <div className="po-badge green">💾 module_07 — 内存优化</div>
      <div className="po-hero">
        <h1>内存优化：内存泄漏检测 / GC 调优 / 对象池</h1>
        <p>内存问题有两类：<strong>内存泄漏</strong>（对象无法被 GC 释放，持续增长最终 OOM）和 <strong>GC 压力</strong>（频繁 GC 暂停导致响应时间抖动）。Python/JVM/Go 各有不同的内存模型和调优手段。</p>
      </div>

      {/* GC 对比 */}
      <div className="po-interactive">
        <h3>⚖️ JVM GC 算法对比（停顿时间 vs 吞吐量）</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {GC_ALGOS.map(gc => (
            <div key={gc.name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.4rem 0.5rem', borderRadius: '6px', border: `1px solid ${gc.color}15` }}>
              <div style={{ minWidth: 120, fontFamily: 'JetBrains Mono', fontSize: '0.72rem', fontWeight: 700, color: gc.color }}>{gc.name}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.15rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: '#475569', minWidth: 55 }}>停顿:</div>
                  <div className="po-progress" style={{ flex: 1 }}>
                    <div className="po-progress-fill" style={{ width: `${Math.min(gc.pauseMs / 8, 100)}%`, background: gc.pauseMs > 200 ? '#ef4444' : gc.pauseMs > 50 ? '#f97316' : '#22c55e' }} />
                  </div>
                  <div style={{ minWidth: 50, fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: gc.pauseMs > 200 ? '#ef4444' : '#22c55e' }}>{gc.pauseMs}ms</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: '#475569', minWidth: 55 }}>吞吐量:</div>
                  <div className="po-progress" style={{ flex: 1 }}>
                    <div className="po-progress-fill" style={{ width: `${gc.throughput}%`, background: gc.color }} />
                  </div>
                  <div style={{ minWidth: 50, fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: gc.color }}>{gc.throughput}%</div>
                </div>
              </div>
              <div style={{ fontSize: '0.63rem', color: '#475569', minWidth: 130 }}>{gc.use}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="po-section">
        <h2 className="po-section-title">🔧 三大运行时内存优化</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {MEMORY_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="po-code-wrap">
          <div className="po-code-head"><div className="po-code-dot" style={{ background: '#ef4444' }}/><div className="po-code-dot" style={{ background: '#f97316' }}/><div className="po-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span></div>
          <div className="po-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="po-nav">
        <button className="po-btn" onClick={() => navigate('/course/perf-optimization/lesson/apm')}>← 上一模块</button>
        <button className="po-btn primary" onClick={() => navigate('/course/perf-optimization/lesson/stress')}>下一模块：压测 & 容量规划 →</button>
      </div>
    </div>
  );
}
