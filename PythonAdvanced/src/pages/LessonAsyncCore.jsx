import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

/* ── 事件循环可视化 ── */
const TASKS = [
  { id: 'fetch_user',    label: 'fetch_user()',    dur: 1200, color: '#60a5fa' },
  { id: 'fetch_order',   label: 'fetch_order()',   dur: 800,  color: '#14b8a6' },
  { id: 'send_email',    label: 'send_email()',     dur: 600,  color: '#a78bfa' },
  { id: 'write_db',      label: 'write_db()',       dur: 1000, color: '#fbbf24' },
];

function EventLoopVisualizer() {
  const [mode, setMode] = useState('sync');   // 'sync' | 'async'
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState(TASKS.map(t => ({ ...t, progress: 0, status: 'idle' })));
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState([]);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const reset = () => {
    clearInterval(timerRef.current);
    setTasks(TASKS.map(t => ({ ...t, progress: 0, status: 'idle' })));
    setElapsed(0);
    setLog([]);
    setRunning(false);
  };

  const run = () => {
    reset();
    setRunning(true);
    startRef.current = Date.now();

    if (mode === 'sync') {
      // 顺序执行：每个任务等待前一个
      let delay = 0;
      TASKS.forEach((task, idx) => {
        setTimeout(() => {
          setLog(l => [...l, `▶ 开始 ${task.label}`]);
          setTasks(prev => prev.map((t, i) => i === idx ? { ...t, status: 'running' } : t));
          const step = task.dur / 20;
          let prog = 0;
          const iv = setInterval(() => {
            prog += 5;
            setTasks(prev => prev.map((t, i) => i === idx ? { ...t, progress: Math.min(prog, 100) } : t));
            if (prog >= 100) {
              clearInterval(iv);
              setTasks(prev => prev.map((t, i) => i === idx ? { ...t, status: 'done' } : t));
              setLog(l => [...l, `✅ 完成 ${task.label}`]);
            }
          }, step);
        }, delay);
        delay += task.dur;
      });
      setTimeout(() => { setLog(l => [...l, `⏱ 总耗时：${TASKS.reduce((s, t) => s + t.dur, 0)}ms`]); setRunning(false); }, delay + 100);
    } else {
      // 并发执行：所有任务同时启动
      let maxDur = Math.max(...TASKS.map(t => t.dur));
      TASKS.forEach((task, idx) => {
        setLog(l => [...l, `▶ 启动协程 ${task.label}`]);
        setTasks(prev => prev.map((t, i) => i === idx ? { ...t, status: 'running' } : t));
        const step = task.dur / 20;
        let prog = 0;
        const iv = setInterval(() => {
          prog += 5;
          setTasks(prev => prev.map((t, i) => i === idx ? { ...t, progress: Math.min(prog, 100) } : t));
          if (prog >= 100) {
            clearInterval(iv);
            setTasks(prev => prev.map((t, i) => i === idx ? { ...t, status: 'done' } : t));
            setLog(l => [...l, `✅ 完成 ${task.label}`]);
          }
        }, step);
      });
      setTimeout(() => { setLog(l => [...l, `⏱ 总耗时：${maxDur}ms（节省 ${TASKS.reduce((s,t)=>s+t.dur,0) - maxDur}ms）`]); setRunning(false); }, maxDur + 100);
    }
  };

  return (
    <div className="py-interactive">
      <h3>
        ⚡ 同步 vs 异步执行可视化
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`py-btn ${mode === 'sync' ? 'active' : ''}`} onClick={() => { setMode('sync'); reset(); }}>🔄 同步执行</button>
          <button className={`py-btn teal ${mode === 'async' ? 'active' : ''}`} onClick={() => { setMode('async'); reset(); }}>⚡ asyncio 并发</button>
        </div>
      </h3>

      <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#3a5070' }}>
        {mode === 'sync'
          ? '同步模式：每个 I/O 操作阻塞 CPU，任务串行等待'
          : 'asyncio 模式：I/O 等待期间 CPU 切换去做其他任务，所有任务并发推进'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {tasks.map(t => (
          <div key={t.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ width: 120, fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: t.status === 'idle' ? '#1a2035' : t.status === 'done' ? t.color : '#e2eeff', flexShrink: 0 }}>{t.label}</div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: 20, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${t.progress}%`, background: t.status === 'done' ? `${t.color}80` : t.color, borderRadius: '4px', transition: 'width 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
                {t.progress > 20 && <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 700 }}>{t.status === 'done' ? '✓' : `${t.progress}%`}</span>}
              </div>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#1a2035', minWidth: 50, textAlign: 'right' }}>{t.dur}ms</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button className="py-btn primary" onClick={run} disabled={running}>
          {running ? '⏳ 运行中…' : '▶ 开始模拟'}
        </button>
        <button className="py-btn" onClick={reset}>重置</button>
      </div>

      {log.length > 0 && (
        <div style={{ background: '#02000a', borderRadius: '6px', padding: '0.75rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', maxHeight: 120, overflow: 'auto' }}>
          {log.map((l, i) => <div key={i} style={{ color: l.startsWith('✅') ? '#22c55e' : l.startsWith('⏱') ? '#fbbf24' : '#60a5fa', marginBottom: '0.15rem' }}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

const ASYNC_CONCEPTS = [
  {
    name: 'coroutine 协程',
    color: '#60a5fa',
    code: `import asyncio

# 协程函数：async def 定义，返回协程对象
async def fetch_data(url: str) -> dict:
    print(f"开始请求: {url}")
    await asyncio.sleep(1)   # ← await 交出控制权，事件循环可切换到其他协程
    print(f"请求完成: {url}")
    return {"url": url, "data": "..."}

# 运行协程的三种方式
async def main():
    # 1. 直接 await（顺序执行）
    result = await fetch_data("https://api.example.com/users")
    print(result)

# 入口
asyncio.run(main())`,
    output: '开始请求: https://api.example.com/users\n请求完成: https://api.example.com/users\n{\'url\': \'https://api.example.com/users\', \'data\': \'...\'}',
  },
  {
    name: 'asyncio.gather',
    color: '#14b8a6',
    code: `import asyncio
import httpx  # 异步 HTTP 客户端

async def fetch(client, url):
    resp = await client.get(url)
    return resp.json()

async def main():
    urls = [
        "https://api.example.com/users/1",
        "https://api.example.com/orders/42",
        "https://api.example.com/products",
    ]
    async with httpx.AsyncClient() as client:
        # gather：并发执行所有协程，等待全部完成
        # 总耗时 ≈ 最慢的那个请求，而非所有请求之和
        results = await asyncio.gather(
            *[fetch(client, url) for url in urls],
            return_exceptions=True  # 单个失败不影响其他
        )
    for url, result in zip(urls, results):
        if isinstance(result, Exception):
            print(f"❌ {url}: {result}")
        else:
            print(f"✅ {url}: {result}")

asyncio.run(main())`,
    output: '✅ https://api.example.com/users/1: {"id":1,"name":"Alice"}\n✅ https://api.example.com/orders/42: {"id":42,...}\n✅ https://api.example.com/products: [...]',
  },
  {
    name: 'asyncio.Queue',
    color: '#a78bfa',
    code: `import asyncio

async def producer(queue: asyncio.Queue, items: list):
    """生产者：将任务放入队列"""
    for item in items:
        await queue.put(item)
        print(f"📦 生产: {item}")
        await asyncio.sleep(0.1)
    # 发送结束信号
    await queue.put(None)

async def consumer(queue: asyncio.Queue, worker_id: int):
    """消费者：从队列取任务处理"""
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break  # 收到结束信号
        print(f"⚙️  Worker-{worker_id} 处理: {item}")
        await asyncio.sleep(0.2)  # 模拟处理耗时
        queue.task_done()

async def main():
    queue = asyncio.Queue(maxsize=5)  # 最大缓冲5条
    tasks = ["task-1","task-2","task-3","task-4","task-5"]
    
    # 1个生产者 + 3个消费者并发
    await asyncio.gather(
        producer(queue, tasks),
        consumer(queue, 1),
        consumer(queue, 2),
    )

asyncio.run(main())`,
    output: '📦 生产: task-1\n⚙️  Worker-1 处理: task-1\n📦 生产: task-2\n⚙️  Worker-2 处理: task-2\n...',
  },
  {
    name: 'Semaphore 并发控制',
    color: '#fbbf24',
    code: `import asyncio
import httpx

async def fetch_with_limit(
    client: httpx.AsyncClient,
    url: str,
    sem: asyncio.Semaphore
) -> dict:
    # Semaphore 控制同时最多 N 个并发请求
    async with sem:   # ← 超过限制时自动等待
        print(f"请求: {url}")
        resp = await client.get(url)
        return resp.json()

async def main():
    urls = [f"https://api.example.com/item/{i}" for i in range(100)]
    
    # 虽然有100个URL，但同时最多只发10个请求
    # 防止触发服务器限流（Rate Limit）
    sem = asyncio.Semaphore(10)
    
    async with httpx.AsyncClient(timeout=30) as client:
        results = await asyncio.gather(
            *[fetch_with_limit(client, url, sem) for url in urls]
        )
    print(f"获取了 {len(results)} 条数据")

asyncio.run(main())`,
    output: '请求: https://api.example.com/item/0\n请求: ...（最多10个并发）\n获取了 100 条数据',
  },
];

export default function LessonAsyncCore() {
  const navigate = useNavigate();
  const [activeConcept, setActiveConcept] = useState(0);

  return (
    <div className="lesson-py">
      <div className="py-badge">🐍 module_01 — asyncio 核心</div>

      <div className="py-hero">
        <h1>asyncio 核心：事件循环与协程原理</h1>
        <p>Python 异步编程不是多线程，而是<strong>单线程事件循环</strong> + <strong>协程切换</strong>。理解这个机制，你就能用少量资源处理数万并发 I/O，这是 FastAPI 高性能的基石。</p>
      </div>

      {/* 同步 vs 异步可视化 */}
      <EventLoopVisualizer />

      {/* 事件循环原理 */}
      <div className="py-section">
        <h2 className="py-section-title">🔄 事件循环工作原理</h2>
        <div className="py-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#3a5070', lineHeight: '1.9', whiteSpace: 'pre' }}>{`
asyncio 事件循环（Event Loop）单线程工作流：

                    ┌─────────────────────────────────────┐
                    │           Event Loop                │
                    │                                     │
 ┌─────────────┐   │   ┌──────────┐  ┌──────────────┐   │
 │ 可运行协程  │◄──┤──►│ 选择就绪 │  │  等待 I/O   │   │
 │ (Ready)     │   │   │  协程    │  │  (Pending)  │   │
 └─────────────┘   │   └────┬─────┘  └──────┬───────┘   │
                    │        │               │           │
                    │   执行协程直到 await   │           │
                    │        │          I/O 完成通知     │
                    │        ▼               │           │
                    │   遇到 await ──────────┘           │
                    │   (挂起当前协程，检查其他就绪协程)  │
                    └─────────────────────────────────────┘

关键：await 的本质是"我暂时不需要 CPU，去做其他事"
IO密集型：asyncio（协程切换，无线程开销）✅
CPU密集型：multiprocessing（多进程，绕过 GIL）✅`}</div>
        </div>
      </div>

      {/* 核心概念代码演示 */}
      <div className="py-section">
        <h2 className="py-section-title">💻 核心概念代码演示</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {ASYNC_CONCEPTS.map((c, i) => (
            <button key={i} onClick={() => setActiveConcept(i)}
              style={{ padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                border: `1px solid ${activeConcept === i ? c.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeConcept === i ? `${c.color}10` : 'rgba(255,255,255,0.02)',
                color: activeConcept === i ? c.color : '#3a5070' }}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: ASYNC_CONCEPTS[activeConcept].color }}>
              asyncio — {ASYNC_CONCEPTS[activeConcept].name}
            </span>
          </div>
          <div className="py-code" style={{ maxHeight: 340, overflow: 'auto', fontSize: '0.76rem' }}>{ASYNC_CONCEPTS[activeConcept].code}</div>
          <div className="py-result">$ python main.py{'\n'}{ASYNC_CONCEPTS[activeConcept].output}</div>
        </div>
      </div>

      {/* GIL 与并发模型选择 */}
      <div className="py-section">
        <h2 className="py-section-title">🧠 Python 并发选型指南</h2>
        <div className="py-card">
          <table className="py-table">
            <thead><tr><th>方案</th><th>适合场景</th><th>GIL 限制</th><th>资源开销</th><th>推荐用法</th></tr></thead>
            <tbody>
              {[
                ['threading', 'I/O 密集型（老代码兼容）', '有，并行受限', '中等（线程栈）', 'concurrent.futures.ThreadPoolExecutor'],
                ['asyncio', 'I/O 密集型（高并发）', '单线程绕过', '极低（协程栈<1KB）', 'async/await + httpx/aiofiles'],
                ['multiprocessing', 'CPU 密集型计算', '无（独立进程）', '较高（进程内存）', 'ProcessPoolExecutor / Pool.map'],
                ['concurrent.futures', '统一接口管理线程/进程', '取决于 executor', '取决于 executor', 'ThreadPoolExecutor / ProcessPoolExecutor'],
              ].map(([m, s, g, r, u]) => (
                <tr key={m}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', color: '#60a5fa', fontSize: '0.8rem' }}>{m}</code></td>
                  <td style={{ fontSize: '0.8rem', color: '#3a5070' }}>{s}</td>
                  <td style={{ fontSize: '0.78rem', color: g.includes('无') ? '#22c55e' : '#fbbf24' }}>{g}</td>
                  <td style={{ fontSize: '0.78rem', color: '#3a5070' }}>{r}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#14b8a6' }}>{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="py-nav">
        <div />
        <button className="py-btn primary" onClick={() => navigate('/course/python-advanced/lesson/async-patterns')}>下一模块：异步编程模式 →</button>
      </div>
    </div>
  );
}
