import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PYTHON_TOPICS = [
  {
    name: 'cProfile & 分析', icon: '🔍', color: '#ef4444',
    code: `# Python 性能分析全套工具链

import cProfile, pstats, io
from functools import wraps

# ── 1. cProfile 基础分析 ──
def profile(func):
    """装饰器：自动 profiling"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        pr = cProfile.Profile()
        pr.enable()
        result = func(*args, **kwargs)
        pr.disable()
        
        sio = io.StringIO()
        ps = pstats.Stats(pr, stream=sio)
        ps.sort_stats('cumulative')   # 按累计时间排序
        ps.print_stats(20)            # 显示前20个最慢函数
        print(sio.getvalue())
        return result
    return wrapper

@profile
def slow_function():
    result = []
    for i in range(100_000):
        result.append(str(i))     # 热点：每次 str() + append 很慢
    return result

# 输出示例：
# ncalls  tottime  percall  cumtime  percall filename:lineno(function)
# 100000   0.023    0.000    0.023    0.000  {built-in method builtins.str}
# 100000   0.018    0.000    0.018    0.000  {method 'append' of 'list'}

# ── 2. line_profiler（行级别，最精准）──
# pip install line_profiler
# @profile  ← 特殊装饰器
# kernprof -l -v script.py

# ── 3. memory_profiler（内存分析）──
# pip install memory_profiler
# @memory_profiler.profile
# 输出：每行代码的内存增量

# ── 4. scalene（综合：CPU+内存+GPU）──
# pip install scalene
# python -m scalene script.py
# 自动生成火焰图 + 行级性能报告（推荐！）

# ── 5. 常见优化模式 ──
# 热点：str(i) in loop → 改为 list comprehension
optimized = [str(i) for i in range(100_000)]  # 快 2-3x

# 更快：join 大量字符串
result_str = '\\n'.join(str(i) for i in range(100_000))  # O(n) 而非 O(n²)`,
  },
  {
    name: 'asyncio 优化', icon: '⚡', color: '#3b82f6',
    code: `# asyncio 性能优化：I/O 密集型场景的银弹

import asyncio
import aiohttp
import time

# ── 问题：同步串行 HTTP 请求 ──
# 10 个请求 × 0.5秒 = 5秒总时间 ❌
def sync_requests(urls):
    import requests
    return [requests.get(url).json() for url in urls]

# ── 方案：asyncio 并发请求 ──
# 10 个请求并发 ≈ 0.5秒总时间 ✅（提速 10倍！）
async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url) for url in urls]
        return await asyncio.gather(*tasks)     # 并发执行

async def fetch_one(session, url):
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
        return await resp.json()

# ── asyncio 性能陷阱与修复 ──

# 陷阱1：await 阻塞 CPU 密集型任务 → 阻塞事件循环！
async def bad():
    result = cpu_heavy()   # ❌ 阻塞 3 秒，其他协程卡住

async def good():
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, cpu_heavy)  # ✅ 移至线程池

# 陷阱2：未限制并发数导致 OOM / 连接耗尽
async def limited_fetch(urls):
    sem = asyncio.Semaphore(50)   # 最多 50 个并发请求
    async def bounded(url):
        async with sem:
            return await fetch_one(session, url)
    return await asyncio.gather(*[bounded(u) for u in urls])

# 陷阱3：小数据量用 asyncio 反而更慢（协程开销 > 节省时间）
# 2ms 的 DB 查询 × 5个 → 同步 10ms，asyncio 添加协程调度开销约 0.5ms/task
# 结论：I/O 时间 > 1ms 且并发量 > 5 时，asyncio 才有明显收益

# ── uvloop：性能提升 2-4倍 ──
import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
# uvloop 用 libuv（Node.js 的事件循环）替换 Python 默认事件循环`,
  },
  {
    name: 'NumPy & Cython', icon: '🚀', color: '#22c55e',
    code: `# 向量化 & 编译加速：Python 速度瓶颈终极解决方案

import numpy as np
import time

# ── 纯 Python vs NumPy 速度对比 ──
n = 1_000_000

# Python 循环（慢！）
start = time.time()
result = [x**2 for x in range(n)]
print(f"Python loop: {time.time()-start:.3f}s")   # ~0.15s

# NumPy 向量化（快 50-100 倍！）
start = time.time()
arr    = np.arange(n)
result = arr ** 2
print(f"NumPy:       {time.time()-start:.4f}s")   # ~0.002s

# 为什么快？NumPy 在 C 层面用 SIMD 指令批量处理：
# 一条 AVX2 指令可以同时计算 8 个 float64 的平方

# ── NumPy 向量化技巧 ──
a = np.random.rand(10000, 10000).astype(np.float32)

# ❌ 避免：Python 级别的逐元素操作
for i in range(a.shape[0]):
    for j in range(a.shape[1]):
        a[i,j] = a[i,j] * 2

# ✅ 正确：向量化操作
a *= 2              # 原地操作（节省内存分配）
a = np.sqrt(a)      # SIMD 并行
mask = a > 0.5
a[mask] = 0         # 布尔索引（条件赋值）

# ── Numba：JIT 加速（几乎零改动）──
from numba import njit, prange

@njit(parallel=True)   # 自动并行 + LLVM JIT 编译
def fast_sum(arr):
    total = 0.0
    for i in prange(len(arr)):    # prange = 并行 range
        total += arr[i] * arr[i]
    return total

# 第一次调用 JIT 编译（约0.5s），之后约 50µs，python原版约 100ms

# ── Cython：关键路径编译为 C ──
# hot_func.pyx:
# def sum_squares(double[:] arr):   # 类型声明 → 消除 Python 对象开销
#     cdef double total = 0.0
#     cdef int i
#     for i in range(len(arr)):
#         total += arr[i] * arr[i]  # 编译为纯 C 循环
#     return total

# ── 选择策略 ──
# 矩阵/数组运算  → NumPy（首选）
# 复杂循环逻辑  → Numba @njit（零改动，JIT）
# 生产关键路径  → Cython（最快，需编译）
# 并行 CPU 任务 → multiprocessing / Ray / concurrent.futures`,
  },
  {
    name: 'FastAPI 调优', icon: '🌐', color: '#f97316',
    code: `# FastAPI / Uvicorn 生产性能调优

from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import asyncpg
import redis.asyncio as aioredis

# ── 1. 数据库连接池（关键！）──
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动：建立连接池（避免每请求重建连接）
    app.state.db = await asyncpg.create_pool(
        dsn="postgresql://user:pass@localhost/db",
        min_size=5,
        max_size=20,           # 根据 DB 连接上限设置
        command_timeout=10,
        max_inactive_connection_lifetime=300,
    )
    app.state.redis = await aioredis.from_url(
        "redis://localhost", decode_responses=True,
        max_connections=50
    )
    yield
    await app.state.db.close()
    await app.state.redis.close()

app = FastAPI(lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)  # 响应压缩

# ── 2. 路由优化 ──
from fastapi import Request
from fastapi.responses import ORJSONResponse  # 比 json 快 3x！

@app.get("/users/{user_id}", response_class=ORJSONResponse)
async def get_user(user_id: int, request: Request):
    # 先查 Redis 缓存
    cached = await request.app.state.redis.get(f"user:{user_id}")
    if cached:
        return ORJSONResponse(cached)          # Cache Hit：<1ms
    
    # 查 DB（异步！不阻塞事件循环）
    async with request.app.state.db.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, name, email FROM users WHERE id = $1", user_id
        )
    
    if not row:
        raise HTTPException(404)
    
    result = dict(row)
    await request.app.state.redis.setex(       # 写缓存（TTL=5分钟）
        f"user:{user_id}", 300, str(result)
    )
    return result

# ── 3. 启动参数优化 ──
# uvicorn main:app \\
#   --workers 4 \\           # CPU核数（WSGI多进程）
#   --worker-class uvicorn.workers.UvicornWorker \\
#   --limit-concurrency 1000 \\  # 最大并发连接数
#   --backlog 2048           # 连接队列深度

# ── 4. 响应时间中间件 ──
import time
@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    response.headers["X-Process-Time"] = f"{ms:.2f}ms"
    return response`,
  },
];

export default function LessonPython() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = PYTHON_TOPICS[activeTopic];

  return (
    <div className="lesson-po">
      <div className="po-badge purple">🐍 module_03 — Python 性能优化</div>
      <div className="po-hero">
        <h1>Python 性能优化：cProfile / asyncio / NumPy / FastAPI 调优</h1>
        <p>Python 慢的根本原因是<strong>全局解释器锁（GIL）+ 动态类型开销</strong>。针对 I/O 密集用 asyncio，CPU 密集用 NumPy/Numba/Cython，结合 cProfile 定位真正的热点，而不是盲目优化。</p>
      </div>

      <div className="po-interactive">
        <h3>⚡ Python 各方案速度对比</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            ['Python 纯循环', 100, '#ef4444', '100%（基准）'],
            ['List Comprehension', 60, '#f97316', '约 1.7x 快'],
            ['asyncio（I/O密集）', 8, '#3b82f6', '10-20x 快（并行I/O）'],
            ['NumPy 向量化', 2, '#22c55e', '50-100x 快（SIMD）'],
            ['Numba @njit', 0.8, '#8b5cf6', '100-200x 快（JIT）'],
            ['Cython/C 扩展', 0.5, '#fbbf24', '200x+ 快（编译为C）'],
          ].map(([name, pct, color, note]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ minWidth: 160, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right' }}>{name}</div>
              <div style={{ flex: 1 }}>
                <div className="po-progress">
                  <div className="po-progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
              <div style={{ minWidth: 120, fontSize: '0.68rem', color, fontFamily: 'JetBrains Mono' }}>{note}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#475569' }}>
          ⚠️ I/O 密集（网络/磁盘）用 asyncio；CPU 密集（计算/数学）用 NumPy/Numba；混合场景考虑 multiprocessing
        </div>
      </div>

      <div className="po-section">
        <h2 className="po-section-title">🔧 四大优化技术代码</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {PYTHON_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 120, padding: '0.625rem', borderRadius: '9px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="po-code-wrap">
          <div className="po-code-head"><div className="po-code-dot" style={{ background: '#ef4444' }}/><div className="po-code-dot" style={{ background: '#f97316' }}/><div className="po-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}.py</span></div>
          <div className="po-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="po-nav">
        <button className="po-btn" onClick={() => navigate('/course/perf-optimization/lesson/linux')}>← 上一模块</button>
        <button className="po-btn primary" onClick={() => navigate('/course/perf-optimization/lesson/javascript')}>下一模块：JavaScript 性能 →</button>
      </div>
    </div>
  );
}
