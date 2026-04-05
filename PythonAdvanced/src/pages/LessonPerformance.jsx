import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PERF_TOOLS = [
  {
    name: 'cProfile 分析', icon: '📊', color: '#60a5fa',
    code: `# 方式1：命令行直接分析
python -m cProfile -s cumulative -o profile.prof app.py

# 方式2：代码内嵌（分析特定函数）
import cProfile
import pstats

def expensive_function(n):
    return sum(i**2 for i in range(n))

profiler = cProfile.Profile()
profiler.enable()
expensive_function(1_000_000)
profiler.disable()

# 输出 Top 20 耗时函数
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)

# 方式3：py-spy（生产环境，不影响进程）
# pip install py-spy
# py-spy top --pid <PID>              # 实时 top-like 视图
# py-spy record -o profile.svg --pid <PID>  # 火焰图（SVG）`,
    output: `ncalls  tottime  percall  cumtime  percall  filename:lineno
     1    0.000    0.000    0.287    0.287  app.py:5(expensive_function)
1000000    0.287    0.000    0.287    0.000  {built-in method builtins.pow}`,
  },
  {
    name: 'Redis 缓存', icon: '🗃', color: '#14b8a6',
    code: `import redis.asyncio as aioredis
import json
import functools
from typing import Callable

redis = aioredis.from_url("redis://localhost:6379", decode_responses=True)

def cache(key_prefix: str, ttl: int = 300):
    """装饰器：自动缓存函数返回值"""
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # 构造缓存 key
            cache_key = f"{key_prefix}:{':'.join(str(a) for a in args)}"
            
            # 尝试从缓存获取
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)  # 直接返回缓存
            
            # 缓存未命中，执行原函数
            result = await func(*args, **kwargs)
            
            # 存入缓存
            await redis.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

# 使用：只需加一个装饰器
@cache(key_prefix="user", ttl=3600)
async def get_user(user_id: int) -> dict:
    return await db.fetch_user(user_id)  # 首次查库，后续走缓存`,
    output: `# 第1次调用：查数据库（~10ms）
# 第2-N次：直接返回缓存（~0.5ms）
# 性能提升：20x`,
  },
  {
    name: 'Celery 任务队列', icon: '⚙️', color: '#a78bfa',
    code: `# tasks.py — Celery 异步任务队列
from celery import Celery
from celery.utils.log import get_task_logger

app = Celery(
    'myapp',
    broker='redis://localhost:6379/0',   # 消息队列
    backend='redis://localhost:6379/1',  # 结果存储
)

logger = get_task_logger(__name__)

# 定义任务
@app.task(
    bind=True,
    max_retries=3,           # 失败最多重试3次
    default_retry_delay=60,  # 重试间隔60秒
    time_limit=300,          # 超过5分钟自动终止
)
def send_bulk_email(self, user_ids: list[int], template: str):
    total = len(user_ids)
    for i, uid in enumerate(user_ids):
        try:
            user = db.get_user(uid)
            email_client.send(user.email, template)
            # 更新进度
            self.update_state(state='PROGRESS',
                meta={'done': i+1, 'total': total})
        except Exception as exc:
            logger.error(f"发送给 {uid} 失败: {exc}")
            self.retry(exc=exc)  # 自动重试

# FastAPI 中调用（不阻塞请求）
@api.post("/emails/bulk")
async def trigger_bulk_email(user_ids: list[int]):
    task = send_bulk_email.delay(user_ids, "welcome")
    return {"task_id": task.id}  # 立即返回，后台执行

# 查询任务状态
@api.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    result = app.AsyncResult(task_id)
    return {"status": result.status, "result": result.info}`,
    output: `# 启动 Celery Worker
$ celery -A tasks worker --loglevel=info --concurrency=4
# [INFO] Received task: tasks.send_bulk_email[xxx]
# [INFO] Task succeeded in 12.5s`,
  },
];

export default function LessonPerformance() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState(0);
  const [checklist, setChecklist] = useState({});
  const toggle = (i) => setChecklist(p => ({ ...p, [i]: !p[i] }));

  const OPTIMIZATIONS = [
    '数据库查询：确认关键查询使用了索引（EXPLAIN 验证）',
    '数据库查询：用 selectinload 消除 N+1 查询问题',
    '数据库：连接池 pool_size 根据并发量配置',
    '缓存层：热点数据（用户信息、商品列表）加 Redis 缓存',
    '异步：I/O 密集操作全部使用 async/await',
    '序列化：使用 orjson 替代 json（5-10x 速度提升）',
    '慢任务：邮件/报表/文件处理移入 Celery 后台队列',
    'Profiling：发布前用 py-spy 确认无意外性能热点',
    '压测：使用 Locust 或 k6 进行接口压力测试',
    '监控：接入 Prometheus + Grafana，持续追踪 P99 延迟',
  ];

  const tool = PERF_TOOLS[activeTool];

  return (
    <div className="lesson-py">
      <div className="py-badge">⚡ module_07 — 性能优化</div>

      <div className="py-hero">
        <h1>性能优化：Profiling、缓存与任务队列</h1>
        <p><strong>过早优化是万恶之源</strong>（Knuth），但性能问题是必须解决的。正确姿势：先用 Profiling 找瓶颈，再用<strong>缓存 + 异步 + 任务队列</strong>精准优化，而不是盲目猜测。</p>
      </div>

      {/* 性能工具 */}
      <div className="py-section">
        <h2 className="py-section-title">🔧 性能优化三件套</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          {PERF_TOOLS.map((t, i) => (
            <button key={i} onClick={() => setActiveTool(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, transition: 'all 0.2s',
                border: `1px solid ${activeTool === i ? t.color + '55' : 'rgba(255,255,255,0.07)'}`,
                background: activeTool === i ? `${t.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTool === i ? t.color : '#3a5070' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{t.icon}</div>
              {t.name}
            </button>
          ))}
        </div>
        <div className="py-code-wrapper">
          <div className="py-code-header">
            <div className="py-code-dot" style={{ background: '#ef4444' }} />
            <div className="py-code-dot" style={{ background: '#f59e0b' }} />
            <div className="py-code-dot" style={{ background: tool.color }} />
            <span style={{ marginLeft: '0.5rem', color: tool.color }}>{tool.icon} {tool.name}</span>
          </div>
          <div className="py-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflow: 'auto' }}>{tool.code}</div>
          <div className="py-result">{tool.output}</div>
        </div>
      </div>

      {/* orjson 速度对比 */}
      <div className="py-section">
        <h2 className="py-section-title">🚀 FastAPI 常用性能替换</h2>
        <div className="py-card">
          <table className="py-table">
            <thead><tr><th>原始方案</th><th>高性能替换</th><th>提升幅度</th></tr></thead>
            <tbody>
              {[
                ['json（内置）', 'orjson', '5-10x 序列化速度'],
                ['requests（同步）', 'httpx（async）', '并发下10-100x 吞吐'],
                ['psycopg2（同步）', 'asyncpg', '3-5x QPS'],
                ['open()（同步文件I/O）', 'aiofiles', '高并发下不阻塞事件循环'],
                ['time.sleep()（阻塞）', 'asyncio.sleep()', '0 阻塞，其他协程继续运行'],
                ['Uvicorn 单进程', 'Gunicorn + Uvicorn Workers', 'CPU核心数 × 单进程性能'],
              ].map(([o, n, g]) => (
                <tr key={o}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', color: '#f87171', fontSize: '0.78rem' }}>{o}</code></td>
                  <td><code style={{ fontFamily: 'JetBrains Mono', color: '#22c55e', fontSize: '0.78rem' }}>{n}</code></td>
                  <td style={{ fontSize: '0.8rem', color: '#fbbf24' }}>⬆ {g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 性能优化 Checklist */}
      <div className="py-section">
        <h2 className="py-section-title">✅ 性能优化 Checklist（{Object.values(checklist).filter(Boolean).length}/{OPTIMIZATIONS.length} 完成）</h2>
        <div className="py-meter" style={{ marginBottom: '0.75rem' }}>
          <div className="py-meter-fill" style={{ width: `${(Object.values(checklist).filter(Boolean).length / OPTIMIZATIONS.length) * 100}%`, background: 'linear-gradient(90deg, #1d4f85, #3776AB)' }} />
        </div>
        {OPTIMIZATIONS.map((item, i) => (
          <div key={i} onClick={() => toggle(i)}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.65rem 1rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.35rem', transition: 'all 0.15s',
              background: checklist[i] ? 'rgba(55,118,171,0.07)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${checklist[i] ? 'rgba(55,118,171,0.35)' : 'rgba(255,255,255,0.05)'}` }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${checklist[i] ? '#3776AB' : '#0d0022'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: checklist[i] ? '#3776AB' : 'transparent', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
              {checklist[i] ? '✓' : ''}
            </div>
            <div style={{ fontSize: '0.85rem', color: checklist[i] ? '#60a5fa' : '#3a5070' }}>{item}</div>
          </div>
        ))}
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-advanced/lesson/tdd')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-advanced/lesson/projects')}>下一模块：生产实战项目 →</button>
      </div>
    </div>
  );
}
