import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PERSIST_MODES = [
  {
    name: 'RDB 快照',
    file: 'dump.rdb',
    color: '#F29111',
    desc: '定时将内存数据全量快照到磁盘。恢复快，但会丢失最后一次快照后的数据。',
    config: `# redis.conf
save 900 1    # 900秒内有1个写操作则保存
save 300 10   # 300秒内有10个写操作则保存
save 60 10000 # 60秒内有10000个写操作则保存

dbfilename dump.rdb
dir /var/lib/redis`,
    pros: '启动恢复快、文件小、适合定时备份', cons: '宕机可能丢失几分钟数据',
  },
  {
    name: 'AOF 日志',
    file: 'appendonly.aof',
    color: '#86efac',
    desc: '将每条写命令追加到日志文件。数据更安全，但文件大、重启恢复慢。',
    config: `# redis.conf
appendonly yes
appendfilename "appendonly.aof"

# 同步策略（安全 vs 性能的权衡）
# appendfsync always    # 每条命令都 fsync，最安全最慢
appendfsync everysec    # 每秒一次，丢失≤1秒数据（推荐）
# appendfsync no        # 由OS决定，最快，可能丢失多条

# 文件过大时自动重写（压缩）
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb`,
    pros: '最多丢 1 秒数据（everysec）、文件可读', cons: '文件大、恢复慢需重放命令',
  },
  {
    name: 'RDB + AOF 混合',
    file: 'appendonly.aof',
    color: '#a78bfa',
    desc: 'Redis 4.0+，AOF 文件前半是 RDB 快照，后半是增量 AOF 日志，兼顾速度和安全。',
    config: `# redis.conf（推荐生产配置）
appendonly yes
aof-use-rdb-preamble yes  # ← 开启混合持久化

# 效果：
# 重启时先加载 RDB 快照（快），
# 再重放少量 AOF 增量（少），
# 大幅缩短恢复时间`,
    pros: '启动恢复快 + 数据丢失少，生产首选', cons: '需 Redis 4.0+',
  },
];

const CACHE_PROBLEMS = [
  {
    name: '缓存穿透',
    icon: '👻', color: '#ef4444',
    desc: '查询不存在的 key，每次都穿透到数据库（如查询 ID=-1 的用户）',
    attack: '恶意请求大量不存在的 ID，数据库被打垮',
    solution: [
      '缓存空值：查到 NULL 也缓存，设置短 TTL（如 5分钟）',
      '布隆过滤器：启动时将所有有效 ID 加入 BloomFilter，请求先查询（误判率 < 0.1%）',
    ],
    code: `# 方案1: 缓存空值
def get_user(uid):
    val = redis.get(f"user:{uid}")
    if val is not None:
        return None if val == "NULL" else json.loads(val)
    user = db.query(uid)  # 查库
    if user is None:
        redis.setex(f"user:{uid}", 300, "NULL")  # 缓存空值
    else:
        redis.setex(f"user:{uid}", 3600, json.dumps(user))
    return user`,
  },
  {
    name: '缓存击穿',
    icon: '⚡', color: '#fbbf24',
    desc: '某个热点 key 过期的瞬间，大量并发请求同时打到数据库',
    attack: '热门商品缓存恰好在秒杀开始时过期，瞬间几万 QPS 击穿 DB',
    solution: [
      '互斥锁（分布式锁）：只有一个请求能查数据库，其他等待',
      '永不过期：异步更新，热点数据不设 TTL（逻辑过期）',
    ],
    code: `# 方案1: 互斥锁防击穿
def get_with_lock(key):
    val = redis.get(key)
    if val:
        return json.loads(val)
    lock_key = f"lock:{key}"
    if redis.set(lock_key, 1, nx=True, ex=10):  # 获取锁
        try:
            data = db.query(...)
            redis.setex(key, 3600, json.dumps(data))
            return data
        finally:
            redis.delete(lock_key)
    else:
        time.sleep(0.05)  # 等待并重试
        return get_with_lock(key)`,
  },
  {
    name: '缓存雪崩',
    icon: '❄️', color: '#93c5fd',
    desc: '大量 key 同时过期，或 Redis 实例宕机，流量全部打到数据库',
    attack: '设置了相同 TTL 的批量数据同时到期，数小时内多次雪崩',
    solution: [
      'TTL 加随机抖动：TTL = base_ttl + random(0, 300) 避免同时到期',
      'Redis 高可用：主从复制 + Sentinel 或 Redis Cluster',
    ],
    code: `import random

# 设置 TTL 时加随机抖动
def cache_product(product_id, data):
    base_ttl = 3600  # 1小时基础过期时间
    jitter = random.randint(0, 300)  # 0-5分钟随机抖动
    redis.setex(
        f"product:{product_id}",
        base_ttl + jitter,  # 避免大量 key 同时过期
        json.dumps(data)
    )`,
  },
];

export default function LessonRedisAdvanced() {
  const navigate = useNavigate();
  const [activePersist, setActivePersist] = useState(2);
  const [activeProblem, setActiveProblem] = useState(0);

  return (
    <div className="lesson-db">
      <div className="db-badge redis">🔴 module_06 — Redis 进阶</div>

      <div className="db-hero">
        <h1>Redis 进阶：持久化、集群与三大缓存问题</h1>
        <p>Redis 用好了是"性能神器"，用错了会导致数据丢失和系统崩溃。理解<strong>持久化保数据</strong>、<strong>集群保可用</strong>、<strong>三大经典问题的应对方案</strong>，是高级工程师的标志。</p>
      </div>

      {/* 持久化 */}
      <div className="db-section">
        <h2 className="db-section-title">💾 持久化方案对比（点击查看配置）</h2>
        <div className="db-grid-3" style={{ marginBottom: '1rem' }}>
          {PERSIST_MODES.map((m, i) => (
            <div key={m.name} onClick={() => setActivePersist(i)}
              style={{ padding: '1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                background: activePersist === i ? `${m.color}12` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activePersist === i ? m.color + '45' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div style={{ fontWeight: 800, color: activePersist === i ? m.color : '#f5e6d0', fontSize: '1rem', marginBottom: '0.25rem' }}>{m.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: m.color }}>{m.file}</div>
            </div>
          ))}
        </div>
        {(() => {
          const m = PERSIST_MODES[activePersist];
          return (
            <div className="db-card" style={{ borderColor: `${m.color}25` }}>
              <p style={{ marginBottom: '0.75rem' }}>{m.desc}</p>
              <div className="db-sql-wrapper">
                <div className="db-sql-header">
                  <div className="db-sql-dot" style={{ background: '#ef4444' }} />
                  <div className="db-sql-dot" style={{ background: '#f59e0b' }} />
                  <div className="db-sql-dot" style={{ background: '#10b981' }} />
                  <span style={{ marginLeft: '0.5rem' }}>redis.conf</span>
                </div>
                <div className="db-sql" style={{ fontSize: '0.75rem' }}>{m.config}</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                <div style={{ flex: 1 }}><span className="db-tag green">✅ {m.pros}</span></div>
                <div style={{ flex: 1 }}><span style={{ fontSize: '0.8rem', color: '#f87171' }}>⚠️ {m.cons}</span></div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 三大缓存问题 */}
      <div className="db-section">
        <h2 className="db-section-title">🚨 三大经典缓存问题（面试必考）</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {CACHE_PROBLEMS.map((p, i) => (
            <button key={p.name}
              onClick={() => setActiveProblem(i)}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s', border: `1px solid ${activeProblem === i ? p.color + '50' : 'rgba(255,255,255,0.06)'}`, background: activeProblem === i ? `${p.color}15` : 'rgba(255,255,255,0.03)', color: activeProblem === i ? p.color : '#a08060', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {p.icon} {p.name}
            </button>
          ))}
        </div>
        {(() => {
          const p = CACHE_PROBLEMS[activeProblem];
          return (
            <div className="db-card" style={{ borderColor: `${p.color}25` }}>
              <div style={{ fontWeight: 800, color: p.color, fontSize: '1rem', marginBottom: '0.5rem' }}>{p.icon} {p.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#a08060', marginBottom: '0.4rem' }}><strong style={{ color: '#f5e6d0' }}>定义：</strong>{p.desc}</div>
              <div style={{ fontSize: '0.82rem', color: '#f87171', marginBottom: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(239,68,68,0.06)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.15)' }}>
                ⚠️ <strong>典型攻击场景：</strong>{p.attack}
              </div>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.82rem', marginBottom: '0.4rem' }}>✅ 解决方案</div>
              {p.solution.map((s, i) => <div key={i} style={{ fontSize: '0.82rem', color: '#a08060', marginBottom: '0.2rem' }}>• {s}</div>)}
              <div className="db-sql-wrapper" style={{ marginTop: '0.75rem' }}>
                <div className="db-sql-header">
                  <div className="db-sql-dot" style={{ background: '#ef4444' }} />
                  <div className="db-sql-dot" style={{ background: '#f59e0b' }} />
                  <div className="db-sql-dot" style={{ background: '#10b981' }} />
                  <span style={{ marginLeft: '0.5rem' }}>Python 示例代码</span>
                </div>
                <div className="db-sql" style={{ fontSize: '0.73rem', maxHeight: 200, overflow: 'auto' }}>{p.code}</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Redis 集群 */}
      <div className="db-section">
        <h2 className="db-section-title">🌐 Redis 高可用架构</h2>
        <div className="db-grid-3">
          {[
            { name: '主从复制', icon: '↔️', desc: '1主多从，读写分离。主库写，从库读，数据异步复制。主库宕机需手动切换。', use: '中小型项目，读多写少' },
            { name: 'Sentinel 哨兵', icon: '🔭', desc: '3个哨兵节点监控主库，自动故障转移。主库宕机后 30秒内自动选主，客户端重连。', use: '数据量 < 内存上限，需要自动高可用' },
            { name: 'Redis Cluster', icon: '🕸️', desc: '数据分片到16384个哈希槽，分布到N个节点。每个节点保存部分数据，支持水平扩展。', use: 'TB级数据、超高并发，分布式首选' },
          ].map(m => (
            <div key={m.name} className="db-card">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
                <h3 style={{ margin: 0, color: '#DC382D' }}>{m.name}</h3>
              </div>
              <p style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>{m.desc}</p>
              <span className="db-tag redis" style={{ fontSize: '0.72rem' }}>适合：{m.use}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="db-nav">
        <button className="db-btn" onClick={() => navigate('/course/database-mastery/lesson/redis')}>← 上一模块</button>
        <button className="db-btn primary" onClick={() => navigate('/course/database-mastery/lesson/design')}>下一模块：数据库设计 →</button>
      </div>
    </div>
  );
}
