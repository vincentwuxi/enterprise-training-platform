import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PATTERNS = [
  {
    name: 'timeout & cancel',
    icon: '⏱', color: '#60a5fa',
    desc: '给协程设置超时，防止一个慢请求拖垮整个系统',
    code: `import asyncio

async def slow_api_call():
    await asyncio.sleep(10)  # 模拟慢接口
    return {"data": "..."}

async def main():
    try:
        # 方式1：asyncio.wait_for 设置超时
        result = await asyncio.wait_for(
            slow_api_call(),
            timeout=3.0  # 3秒超时
        )
    except asyncio.TimeoutError:
        print("⚠️ 请求超时，使用降级数据")
        result = {"data": "default"}

    # 方式2：asyncio.timeout (Python 3.11+，更灵活)
    async with asyncio.timeout(5):
        result = await slow_api_call()  # 超时自动取消

    # 手动取消任务
    task = asyncio.create_task(slow_api_call())
    await asyncio.sleep(1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("🚫 任务已取消")

asyncio.run(main())`,
    output: '⚠️ 请求超时，使用降级数据\n🚫 任务已取消',
  },
  {
    name: 'TaskGroup（3.11+）',
    icon: '🗂', color: '#14b8a6',
    desc: 'Python 3.11 新增，比 gather 更安全，任何一个失败会取消其余任务',
    code: `import asyncio

async def fetch(name: str, delay: float):
    await asyncio.sleep(delay)
    if name == "order":
        raise ValueError("订单服务不可用")
    return f"{name}: OK"

async def main():
    # asyncio.TaskGroup：结构化并发
    # 优点：任何子任务失败，其余自动取消，异常自动传播
    try:
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(fetch("user",    0.5))
            t2 = tg.create_task(fetch("order",   0.3))
            t3 = tg.create_task(fetch("product", 0.8))
        # 只有全部成功才到这里
        print(t1.result(), t2.result(), t3.result())
    except* ValueError as eg:
        # Python 3.11 ExceptionGroup 语法
        for exc in eg.exceptions:
            print(f"❌ 子任务异常: {exc}")

asyncio.run(main())`,
    output: '❌ 子任务异常: 订单服务不可用\n（其余任务已被自动取消）',
  },
  {
    name: 'aiofiles 文件 I/O',
    icon: '📁', color: '#a78bfa',
    desc: '异步读写文件，不阻塞事件循环（标准 open() 是阻塞的！）',
    code: `import asyncio
import aiofiles
import json

async def read_config(path: str) -> dict:
    async with aiofiles.open(path, 'r', encoding='utf-8') as f:
        content = await f.read()  # 非阻塞读取
    return json.loads(content)

async def write_result(path: str, data: dict):
    async with aiofiles.open(path, 'w', encoding='utf-8') as f:
        await f.write(json.dumps(data, ensure_ascii=False, indent=2))

async def process_files(files: list[str]):
    # 并发读取多个文件
    tasks = [read_config(f) for f in files]
    configs = await asyncio.gather(*tasks)
    
    # 合并配置并写回
    merged = {}
    for cfg in configs:
        merged.update(cfg)
    
    await write_result("merged.json", merged)
    print(f"✅ 合并了 {len(files)} 个配置文件")

asyncio.run(process_files(["config/db.json", "config/api.json"]))`,
    output: '✅ 合并了 2 个配置文件',
  },
  {
    name: 'run_in_executor',
    icon: '🔀', color: '#fbbf24',
    desc: '在异步代码中运行同步阻塞操作（如 CPU 密集计算），不阻塞事件循环',
    code: `import asyncio
import concurrent.futures
import time

def cpu_heavy(n: int) -> int:
    """CPU 密集型函数（不能直接 await）"""
    result = 0
    for i in range(n):
        result += i ** 2
    return result

def sync_db_call() -> list:
    """老代码同步数据库查询"""
    time.sleep(0.5)  # 模拟阻塞
    return [{"id": 1, "name": "Alice"}]

async def main():
    loop = asyncio.get_event_loop()
    
    # 1. 在线程池中运行阻塞 IO（不阻塞事件循环）
    with concurrent.futures.ThreadPoolExecutor() as pool:
        users = await loop.run_in_executor(pool, sync_db_call)
    print(f"用户: {users}")
    
    # 2. 在进程池中运行 CPU 密集计算
    with concurrent.futures.ProcessPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, cpu_heavy, 10_000_000)
    print(f"计算结果: {result}")

asyncio.run(main())`,
    output: '用户: [{"id": 1, "name": "Alice"}]\n计算结果: 333333283333350000000',
  },
];

export default function LessonAsyncPatterns() {
  const navigate = useNavigate();
  const [activeP, setActiveP] = useState(0);

  const ASYNC_TIPS = [
    { tip: '永远不要在 async 函数里调用同步阻塞操作（time.sleep/requests.get…），用 await asyncio.sleep 和 httpx.AsyncClient 替代', level: '🚫 禁忌' },
    { tip: 'asyncio.gather 的异常：默认第一个异常就抛出，用 return_exceptions=True 让所有任务都跑完', level: '⚠️ 注意' },
    { tip: 'TaskGroup（3.11+）比 gather 更安全：结构化取消，任何子任务失败自动清理其余任务', level: '✅ 推荐' },
    { tip: '不要 create_task 后忘记 await：未 await 的 Task 异常会被吞掉，程序悄然失败', level: '🚫 禁忌' },
    { tip: '调试：asyncio.get_event_loop().set_debug(True) 或 PYTHONASYNCIODEBUG=1 开启超时警告', level: '💡 技巧' },
  ];

  return (
    <div className="lesson-py">
      <div className="py-badge">🔀 module_02 — 异步编程模式</div>

      <div className="py-hero">
        <h1>异步编程模式：gather / Queue / Semaphore</h1>
        <p>知道 <code style={{ color: '#14b8a6', fontSize: '0.95em' }}>async/await</code> 语法只是入门，真正的生产代码需要掌握<strong>超时控制、并发限速、任务管理和生产者消费者</strong>这四大模式。</p>
      </div>

      {/* 四大模式代码 */}
      <div className="py-section">
        <h2 className="py-section-title">🎯 四大生产级异步模式</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {PATTERNS.map((p, i) => (
            <button key={i} onClick={() => setActiveP(i)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                border: `1px solid ${activeP === i ? p.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeP === i ? `${p.color}10` : 'rgba(255,255,255,0.02)',
                color: activeP === i ? p.color : '#3a5070' }}>
              {p.icon} {p.name}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#3a5070', marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(55,118,171,0.05)', borderRadius: '6px' }}>
          💡 {PATTERNS[activeP].desc}
        </div>
        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: PATTERNS[activeP].color }}>{PATTERNS[activeP].icon} {PATTERNS[activeP].name}</span>
          </div>
          <div className="py-code" style={{ maxHeight: 380, overflow: 'auto', fontSize: '0.76rem' }}>{PATTERNS[activeP].code}</div>
          <div className="py-result">$ python main.py{'\n'}{PATTERNS[activeP].output}</div>
        </div>
      </div>

      {/* 异步陷阱与最佳实践 */}
      <div className="py-section">
        <h2 className="py-section-title">⚡ 异步编程陷阱与最佳实践</h2>
        <div className="py-card">
          {ASYNC_TIPS.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem 0', borderBottom: i < ASYNC_TIPS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <span style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', minWidth: 64, flexShrink: 0,
                color: t.level.includes('禁忌') ? '#f87171' : t.level.includes('注意') ? '#fbbf24' : t.level.includes('推荐') ? '#22c55e' : '#60a5fa' }}>{t.level}</span>
              <span style={{ fontSize: '0.82rem', color: '#3a5070' }}>{t.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 异步工具库速查 */}
      <div className="py-section">
        <h2 className="py-section-title">📦 异步生态工具速查</h2>
        <div className="py-grid-3">
          {[
            { name: 'httpx', desc: '异步 HTTP 客户端（替代 requests）', cmd: 'async with httpx.AsyncClient() as c: ...' },
            { name: 'aiofiles', desc: '异步文件读写（替代内置 open）', cmd: 'async with aiofiles.open() as f: ...' },
            { name: 'aiomysql', desc: '异步 MySQL 驱动', cmd: 'conn = await aiomysql.connect(...)' },
            { name: 'aioredis', desc: '异步 Redis 客户端', cmd: 'r = await aioredis.from_url(...)' },
            { name: 'asyncpg', desc: '异步 PostgreSQL（最快）', cmd: 'conn = await asyncpg.connect(...)' },
            { name: 'anyio', desc: '跨框架异步运行时（asyncio/trio）', cmd: 'async with anyio.create_task_group() as tg: ...' },
          ].map(lib => (
            <div key={lib.name} className="py-card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: '#60a5fa', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{lib.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#3a5070', marginBottom: '0.5rem' }}>{lib.desc}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#14b8a6', wordBreak: 'break-all' }}>{lib.cmd}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-advanced/lesson/async-core')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-advanced/lesson/fastapi-basics')}>下一模块：FastAPI 基础 →</button>
      </div>
    </div>
  );
}
