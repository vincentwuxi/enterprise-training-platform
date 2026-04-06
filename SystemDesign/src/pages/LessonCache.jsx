import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 缓存三大问题动画演示
const CACHE_SCENARIOS = {
  normal: {
    name: '🟢 正常缓存命中',
    color: '#22c55e',
    steps: [
      { actor: 'Client', msg: 'GET user:123', to: 'Cache', color: '#3b82f6' },
      { actor: 'Cache', msg: '✅ 命中！返回数据', to: 'Client', color: '#22c55e' },
    ],
    desc: 'Cache 命中率 > 80% 时，数据库基本无压力。'
  },
  penetration: {
    name: '🔴 缓存穿透',
    color: '#ef4444',
    steps: [
      { actor: '攻击者', msg: 'GET user:999999（不存在的Key）', to: 'Cache', color: '#ef4444' },
      { actor: 'Cache', msg: '❌ Miss！Key 不存在', to: 'DB', color: '#f97316' },
      { actor: 'DB', msg: '❌ 也查不到！', to: 'Cache', color: '#ef4444' },
      { actor: '攻击者', msg: '持续请求 → DB 被打死！', to: 'DB', color: '#ef4444' },
    ],
    solution: '解决：布隆过滤器（Bloom Filter）拦截不存在的Key；或缓存空值（TTL=30s）。',
    desc: '大量请求查询不存在的Key，绕过Cache直接打到DB。'
  },
  breakdown: {
    name: '🟡 缓存击穿',
    color: '#f59e0b',
    steps: [
      { actor: '1000个用户', msg: 'GET hot_product:1 （热点Key到期！）', to: 'Cache', color: '#f59e0b' },
      { actor: 'Cache', msg: '❌ TTL 过期，Miss！', to: 'DB', color: '#f97316' },
      { actor: '1000个请求', msg: '→ 同时打到 DB', to: 'DB', color: '#ef4444' },
      { actor: 'DB', msg: '💥 连接数耗尽，宕机！', to: 'Client', color: '#ef4444' },
    ],
    solution: '解决：① 互斥锁（只允许1个请求重建Cache）② 逻辑过期（不设TTL，后台异步刷新）',
    desc: '某个超高热点Key的缓存到期，瞬间大量并发请求涌入DB。'
  },
  avalanche: {
    name: '🔴 缓存雪崩',
    color: '#a855f7',
    steps: [
      { actor: '00:00 整点', msg: '大批Key同时过期（TTL相同）', to: 'Cache', color: '#a855f7' },
      { actor: 'Cache', msg: '❌ 大量 Miss！', to: 'DB', color: '#f97316' },
      { actor: '全部流量', msg: '→ 同时打到 DB（雪崩！）', to: 'DB', color: '#ef4444' },
      { actor: 'DB/Cache', msg: '💥 连锁宕机，整个服务挂掉', to: 'Client', color: '#ef4444' },
    ],
    solution: '解决：① TTL加随机抖动（+random(0,300s)）② Redis集群+持久化 ③ 多级缓存 ④ 限流降级',
    desc: '大批Key在同一时刻集体过期，DB被瞬间打垮，整个服务崩溃。'
  },
};

function CacheScenarioDemo() {
  const [scenario, setScenario] = useState('normal');
  const [animStep, setAnimStep] = useState(-1);
  const timerRef = useRef(null);

  const s = CACHE_SCENARIOS[scenario];

  const play = () => {
    setAnimStep(-1);
    let i = 0;
    const next = () => {
      setAnimStep(i);
      if (i < s.steps.length - 1) { i++; timerRef.current = setTimeout(next, 1000); }
    };
    timerRef.current = setTimeout(next, 300);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="sd-interactive">
      <h3>🎬 缓存三大问题场景演示
        <button className="sd-btn primary" onClick={play}>▶ 动画演示</button>
      </h3>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        {Object.entries(CACHE_SCENARIOS).map(([key, sc]) => (
          <button key={key} onClick={() => { setScenario(key); setAnimStep(-1); clearTimeout(timerRef.current); }}
            style={{ flex: 1, minWidth: 120, padding: '0.5rem', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', textAlign: 'center', transition: 'all 0.2s',
              border: `1px solid ${scenario === key ? sc.color + '60' : 'rgba(255,255,255,0.07)'}`,
              background: scenario === key ? `${sc.color}10` : 'rgba(255,255,255,0.02)',
              color: scenario === key ? sc.color : '#64748b' }}>
            {sc.name}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{s.desc}</p>

      {/* 流程步骤 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.625rem' }}>
        {s.steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '7px', transition: 'all 0.4s',
            background: animStep >= i ? `${step.color}10` : 'rgba(255,255,255,0.01)',
            border: `1px solid ${animStep >= i ? step.color + '30' : 'rgba(255,255,255,0.05)'}` }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#334155', minWidth: 20 }}>#{i + 1}</span>
            <span style={{ fontSize: '0.72rem', color: animStep >= i ? step.color : '#334155', fontWeight: animStep >= i ? 700 : 400 }}>
              <strong style={{ color: step.color }}>{step.actor}</strong> → <strong style={{ color: '#64748b' }}>{step.to}</strong>: {step.msg}
            </span>
          </div>
        ))}
      </div>

      {s.solution && animStep >= s.steps.length - 1 && (
        <div style={{ padding: '0.625rem 0.875rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '7px', fontSize: '0.8rem', color: '#86efac' }}>
          💡 <strong>解决方案：</strong>{s.solution}
        </div>
      )}
    </div>
  );
}

const CACHE_TOPICS = [
  {
    name: 'Redis 数据结构', icon: '🔴', color: '#ef4444',
    code: `# Redis 五大核心数据结构 + 使用场景

# String — 最基础
SET user:session:abc123 '{"userId":1001,"role":"admin"}' EX 3600
INCR article:view:456      # 原子计数（文章阅读数）
SETNX lock:order:789 1     # 分布式锁（SET if Not eXists）

# Hash — 存储对象（比 JSON String 更高效地部分更新）
HSET user:1001 name "Alice" email "a@x.com" age 28
HGET user:1001 email
HINCRBY user:1001 login_count 1  # 只更新一个字段

# List — 有序队列、消息队列、最新N条
LPUSH timeline:user:1001 msg_id_999  # 头部插入
LRANGE timeline:user:1001 0 19       # 取最新20条
BRPOP task_queue 0                   # 阻塞弹出（任务队列）

# Set — 无序、去重（共同关注、标签系统）
SADD user:1001:following 2001 2002 2003
SINTER user:1001:following user:2001:following  # 共同关注！

# ZSet (Sorted Set) — 带分值有序集合（排行榜！）
ZADD leaderboard 9850 "Alice" 9720 "Bob" 9600 "Charlie"
ZREVRANGE leaderboard 0 9 WITHSCORES  # Top 10 排行榜`,
  },
  {
    name: 'Redis 集群', icon: '🔗', color: '#3b82f6',
    code: `# Redis 三种部署模式

# ── 1. 单机：开发环境，不推荐生产 ──

# ── 2. Sentinel（哨兵）：主从 + 自动故障转移 ──
# sentinel.conf
sentinel monitor mymaster redis-master 6379 2   # 2个哨兵同意才故障转移
sentinel down-after-milliseconds mymaster 3000  # 3秒无响应认为宕机
sentinel failover-timeout mymaster 60000        # 60秒切换超时
# 架构：3个 Sentinel + 1 Master + 2 Replica
# 缺点：仍是单分片，内存容量受限

# ── 3. Redis Cluster：分布式分片（推荐生产）──
# 16384 个哈希槽，每个 Master 负责一段槽位
# 3 Master + 3 Replica（最小集群）

# 关键：数据路由 = CRC16(key) % 16384
# 客户端计算槽位，直连对应节点（MOVED 重定向）

# 集群搭建
redis-cli --cluster create \\
  192.168.1.1:7001 192.168.1.2:7002 192.168.1.3:7003 \\  # 3 Master
  192.168.1.4:7004 192.168.1.5:7005 192.168.1.6:7006 \\  # 3 Replica
  --cluster-replicas 1

# HashTag：{user}:1001:info 和 {user}:1001:session
# 用 {} 保证两个 Key 在同一分片（避免跨分片 MGET 失败）
redis-cli -c -p 7001 MGET {user}:1001:info {user}:1001:session  # ✅`,
  },
  {
    name: '缓存策略', icon: '🔄', color: '#f59e0b',
    code: `# 三大缓存写入策略对比

# ── 1. Cache Aside（旁路缓存）— 最常用！──
# 读：先查Cache，Miss则查DB并回写Cache
# 写：先更新DB，再删除Cache（注意！是删除而非更新）

async def get_user(user_id: int) -> User:
    cache_key = f"user:{user_id}"
    if cached := await redis.get(cache_key):
        return User.parse_raw(cached)         # 缓存命中
    
    user = await db.find_user(user_id)        # Cache Miss → 查DB
    await redis.setex(cache_key, 3600, user.json())  # 回写Cache
    return user

async def update_user(user: User) -> None:
    await db.update_user(user)                # 先更新DB
    await redis.delete(f"user:{user.id}")     # 再删Cache（而非更新！）
    # 为什么删而非更新？避免并发时写覆盖问题（先删后更新=安全）

# ── 2. Write Through（写穿透）──
# 写时同步更新DB和Cache，强一致但写性能差

# ── 3. Write Behind（写回）── 
# 写入Cache立刻返回，异步批量刷新到DB（最快但有丢失风险）
# MySQL InnoDB 的 Buffer Pool = Write Behind 思想

# ── 缓存预热（启动时主动加载热点数据）──
async def warm_up_cache():
    hot_users = await db.get_top_users(1000)   # 查询Top1000热点用户
    pipe = redis.pipeline()
    for user in hot_users:
        pipe.setex(f"user:{user.id}", 86400, user.json())
    await pipe.execute()
    print("缓存预热完成！")`,
  },
];

export default function LessonCache() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = CACHE_TOPICS[activeTopic];

  return (
    <div className="lesson-sd">
      <div className="sd-badge red">🔴 module_03 — 缓存系统</div>
      <div className="sd-hero">
        <h1>缓存系统：Redis 架构 / 穿透击穿雪崩 / 策略</h1>
        <p>缓存是大规模系统的<strong>第一道防线</strong>。Redis 缓存配置正确时，数据库 QPS 可降低 90% 以上。深入理解三大缓存失效问题和对应解决方案，是 P7+ 工程师的必备技能。</p>
      </div>

      <CacheScenarioDemo />

      <div className="sd-section">
        <h2 className="sd-section-title">📖 Redis 三大核心知识</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {CACHE_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>
        <div className="sd-code-wrap">
          <div className="sd-code-head">
            <div className="sd-code-dot" style={{ background: '#ef4444' }} />
            <div className="sd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="sd-code-dot" style={{ background: t.color }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span>
          </div>
          <div className="sd-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="sd-nav">
        <button className="sd-btn" onClick={() => navigate('/course/system-design/lesson/high-avail')}>← 上一模块</button>
        <button className="sd-btn primary" onClick={() => navigate('/course/system-design/lesson/mq')}>下一模块：消息队列 →</button>
      </div>
    </div>
  );
}
