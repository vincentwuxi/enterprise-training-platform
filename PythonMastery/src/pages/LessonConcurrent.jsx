import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const CONCURRENT_MODES = [
  {
    mode: 'threading',
    icon: '🧵',
    title: '多线程 (threading)',
    best: 'I/O 密集型：网络请求、文件读写、数据库查询',
    limit: 'GIL（全局解释器锁）限制 CPU 并行，单核速度无提升',
    code: `import threading
import time
import requests

def download(url, results, idx):
    """下载任务，模拟 I/O 密集"""
    time.sleep(1)  # 模拟网络延迟
    results[idx] = f"Downloaded: {url}"

urls = [f"https://api.example.com/item/{i}" for i in range(5)]
results = [None] * len(urls)
threads = []

start = time.time()
for i, url in enumerate(urls):
    t = threading.Thread(target=download, args=(url, results, i))
    t.start()
    threads.append(t)

for t in threads:
    t.join()         # 等待所有线程完成

print(f"耗时: {time.time() - start:.2f}s")  # ~1秒（并行 I/O）
print(results)

# 线程安全：用 Lock 保护共享资源
counter = 0
lock = threading.Lock()

def safe_increment():
    global counter
    with lock:         # 互斥锁
        counter += 1`,
  },
  {
    mode: 'multiprocessing',
    icon: '⚙️',
    title: '多进程 (multiprocessing)',
    best: 'CPU 密集型：数学计算、图像处理、数据加密',
    limit: '进程间通信成本高，不适合大量小任务',
    code: `from multiprocessing import Pool, cpu_count
import time

def cpu_heavy(n):
    """CPU 密集型：计算大数的因数"""
    factors = []
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            factors.extend([i, n // i])
    return sorted(set(factors))

numbers = [999_999_937, 999_999_929, 999_999_893, 999_999_883]

# 单进程版本
start = time.time()
results_single = [cpu_heavy(n) for n in numbers]
print(f"单进程: {time.time() - start:.2f}s")

# 多进程版本（自动利用多核）
start = time.time()
with Pool(processes=cpu_count()) as pool:
    results_multi = pool.map(cpu_heavy, numbers)
print(f"多进程 ({cpu_count()} 核): {time.time() - start:.2f}s")
# 速度提升约 cpu_count() 倍`,
  },
  {
    mode: 'asyncio',
    icon: '⚡',
    title: '异步 I/O (asyncio)',
    best: '高并发 I/O：Web 服务器、爬虫、API 聚合',
    limit: '需要整个调用链都是 async，学习曲线较陡',
    code: `import asyncio
import aiohttp   # pip install aiohttp

async def fetch(session, url):
    """协程：遇到 I/O 就让出控制权"""
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    urls = [
        "https://api.github.com/users/python",
        "https://api.github.com/users/guido",
        "https://api.github.com/users/kennethreitz",
    ]

    async with aiohttp.ClientSession() as session:
        # 并发发送所有请求（单线程！）
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)

    for url, result in zip(urls, results):
        print(f"{url}: {len(result)} chars")

# 运行事件循环
asyncio.run(main())

# asyncio 关键字
# async def  — 定义协程函数
# await      — 等待协程完成，让出控制权
# asyncio.gather — 并发运行多个协程`,
  },
  {
    mode: 'futures',
    icon: '🚀',
    title: 'concurrent.futures（高层接口）',
    best: '快速实现线程/进程池，比手动管理更简单',
    limit: '不适合需要细粒度控制的场景',
    code: `from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import time

def task(n):
    time.sleep(0.1)
    return n * n

data = list(range(20))

# 线程池（I/O 密集型）
with ThreadPoolExecutor(max_workers=10) as executor:
    # map：有序返回结果
    results = list(executor.map(task, data))

    # submit：提交单个任务，返回 Future
    future = executor.submit(task, 42)
    print(future.result())   # 1764

# 进程池（CPU 密集型）
with ProcessPoolExecutor() as executor:
    results = list(executor.map(task, data))

# 异常处理
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(task, i) for i in data]
    for future in futures:
        try:
            print(future.result(timeout=5))
        except Exception as e:
            print(f"任务失败: {e}")`,
  },
];

export default function LessonConcurrent() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState(0);

  const GIL_CODE = `# Python GIL（全局解释器锁）可视化理解
# 
# ┌──────────────────────────────────────┐
# │  Python 解释器                        │
# │  ┌──────┐  ┌──────┐  ┌──────┐       │
# │  │线程1 │  │线程2 │  │线程3 │       │
# │  └──┬───┘  └──┬───┘  └──┬───┘       │
# │     │         │         │            │
# │  ───┴─────────┴─────────┴──→ 时间轴  │
# │  GIL: 任意时刻只有一个线程执行 Python │
# └──────────────────────────────────────┘
#
# 为什么存在？保护 CPython 引用计数不出错
# 影响：CPU 密集型多线程 ≠ 真正并行
# 解决：
#   1. multiprocessing（新进程，各有 GIL）
#   2. C 扩展（NumPy 释放 GIL）
#   3. PyPy / Python 3.13 的 no-GIL 模式`;

  return (
    <div className="lesson-py">
      <div className="py-badge">⚡ module_06 — 并发编程</div>

      <div className="py-hero">
        <h1>并发编程：多线程、多进程与 asyncio</h1>
        <p>Python 并发不难，难在<strong>选对正确的工具</strong>。I/O 等待用线程/async，CPU 计算用进程。混用会让代码又慢又复杂。</p>
      </div>

      {/* 并发模型选择器 */}
      <div className="py-section">
        <h2 className="py-section-title">🗺️ 并发模型地图（点击切换）</h2>
        <div className="py-grid-4" style={{ marginBottom: '1rem' }}>
          {CONCURRENT_MODES.map((m, i) => (
            <div key={m.mode}
              onClick={() => setActiveMode(i)}
              style={{
                padding: '1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                background: activeMode === i ? 'rgba(26,86,219,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeMode === i ? 'rgba(26,86,219,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{m.icon}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', fontWeight: 700, color: activeMode === i ? '#60a5fa' : '#e2e8f0' }}>{m.mode}</div>
            </div>
          ))}
        </div>

        <div className="py-interactive" style={{ borderColor: 'rgba(26,86,219,0.3)' }}>
          <h3 style={{ color: '#60a5fa' }}>{CONCURRENT_MODES[activeMode].icon} {CONCURRENT_MODES[activeMode].title}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, marginBottom: '0.3rem' }}>✅ 最适场景</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{CONCURRENT_MODES[activeMode].best}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.3rem' }}>⚠️ 局限性</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{CONCURRENT_MODES[activeMode].limit}</div>
            </div>
          </div>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{CONCURRENT_MODES[activeMode].mode}_demo.py</span>
          </div>
          <div className="py-editor">{CONCURRENT_MODES[activeMode].code}</div>
        </div>
      </div>

      {/* GIL 说明 */}
      <div className="py-section">
        <h2 className="py-section-title">🔒 GIL（全局解释器锁）的本质</h2>
        <div className="py-card">
          <div className="py-editor" style={{ padding: '0.875rem 1rem', fontSize: '0.78rem' }}>{GIL_CODE}</div>
        </div>
      </div>

      {/* 选择指南 */}
      <div className="py-section">
        <h2 className="py-section-title">🧭 并发方案选择决策树</h2>
        <div className="py-card">
          <table className="py-table">
            <thead><tr><th>场景</th><th>推荐方案</th><th>理由</th></tr></thead>
            <tbody>
              {[
                ['大量 HTTP 请求（爬虫、API 聚合）', 'asyncio + aiohttp', '单线程高并发，资源占用极低'],
                ['数据库查询（SQLAlchemy 等）', 'threading / asyncio', 'I/O 等待期间释放 GIL'],
                ['图像处理、矩阵运算', 'multiprocessing', '绕过 GIL，真正多核并行'],
                ['科学计算（NumPy/SciPy）', '直接使用，内部已多线程', 'C 扩展自动释放 GIL'],
                ['快速并发少量任务', 'concurrent.futures', '代码最简单，自动管理池'],
                ['Web 服务器（FastAPI/Flask）', 'asyncio（ASGI）', '天然异步，高吞吐'],
                ['简单脚本并行化', 'multiprocessing.Pool.map', '一行代码，效果立竿见影'],
              ].map(([s, r, why]) => (
                <tr key={s}>
                  <td style={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.85rem' }}>{s}</td>
                  <td><span className="py-tag blue" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>{r}</span></td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-mastery/lesson/stdlib')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-mastery/lesson/datascience')}>下一模块：数据科学 →</button>
      </div>
    </div>
  );
}
