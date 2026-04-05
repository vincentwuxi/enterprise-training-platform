import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PROJECTS = [
  {
    name: '电商秒杀系统',
    icon: '⚡',
    color: '#DC382D',
    tags: ['Redis', 'MySQL', '高并发'],
    challenge: '10万 QPS 下确保库存不超卖、订单不重复',
    arch: `秒杀请求流程：

客户端 → Nginx → API Server → Redis 库存预检
                                    │
                          ┌────────▼─────────┐
                          │ DECR sku:stock:123│ ← 原子操作，不超卖
                          │ 结果 >= 0？       │
                          └────────┬──────────┘
                    ┌──────────────┴──────────────┐
                 是（有库存）               否（无库存）
                    │                             │
               发送消息到 MQ              返回 "已售完"
                    │
          ┌─────────▼──────────┐
          │ 消费者异步写 MySQL  │ ← 削峰填谷，保护 DB
          │ INSERT order ...   │
          │ UPDATE stock -=1   │ ← 双重保障（DB 乐观锁）
          └────────────────────┘`,
    code: `-- MySQL 库存表（带版本号乐观锁）
CREATE TABLE sku_stock (
  sku_id    BIGINT    NOT NULL PRIMARY KEY,
  stock     INT       NOT NULL DEFAULT 0,
  version   INT       NOT NULL DEFAULT 0,  -- 乐观锁版本
  sold      INT       NOT NULL DEFAULT 0
);

-- Redis 预扣库存（Lua 脚本保证原子性）
local stock = redis.call('GET', KEYS[1])
if tonumber(stock) <= 0 then
  return -1  -- 无库存
end
return redis.call('DECR', KEYS[1])  -- 原子减1

-- MySQL 落单（带乐观锁，防止超卖）
UPDATE sku_stock
SET    stock = stock - 1,
       sold  = sold + 1,
       version = version + 1
WHERE  sku_id = 123
  AND  stock > 0          -- 防止负库存
  AND  version = #{v};    -- 乐观锁校验`,
  },
  {
    name: '用户登录会话',
    icon: '🔐',
    color: '#F29111',
    tags: ['Redis', 'JWT', 'Session'],
    challenge: '支持 Token 刷新、异地登录检测、强制下线',
    arch: `登录态存储架构对比：

传统 Session（有状态）：
Client → Server A → session_store(MySQL)
                          ↑
Client → Server B ────────┘  ← 需要共享存储

JWT（无状态）：
Client → 任何 Server → 验证 JWT 签名 ← 无状态，可水平扩展
                        但无法强制失效！

Redis Token（推荐）：
Client ──Token──► Server → Redis 验证
                            │
                     GET token:{uuid}
                     → user_id, expire, device
                     → 支持主动失效 DEL key
                     → 支持异地登录检测`,
    code: `import redis, json, uuid
from datetime import timedelta

r = redis.Redis(host='localhost', port=6379, db=0)

def login(user_id, device_info):
    token = str(uuid.uuid4())
    key = f"token:{token}"
    payload = {
        "user_id": user_id,
        "device":  device_info,
        "login_at": str(datetime.now())
    }
    # 存储 Token，7天有效
    r.setex(key, timedelta(days=7), json.dumps(payload))
    # 记录该用户的所有 Token（用于踢下线）
    r.sadd(f"user:tokens:{user_id}", token)
    return token

def logout_all_devices(user_id):
    """强制下线所有设备"""
    tokens = r.smembers(f"user:tokens:{user_id}")
    for token in tokens:
        r.delete(f"token:{token.decode()}")
    r.delete(f"user:tokens:{user_id}")`,
  },
  {
    name: '排行榜 & 计数系统',
    icon: '🏆',
    color: '#a78bfa',
    tags: ['Redis ZSet', '实时统计'],
    challenge: '实时更新游戏积分、商品销量榜，毫秒级响应',
    arch: `实时排行榜架构：

游戏服务器 → ZADD game:rank:daily ${'{'}score{'}'} ${'{'}uid{'}'}
                      │
                 （Redis ZSet 自动排序）
                      │
用户查询 → ZREVRANGEBYSCORE game:rank:daily
            +inf -inf WITHSCORES LIMIT 0 100
                      │
              Top 100 实时返回（< 1ms）

数据归档（每日凌晨）：
Cron Job → 将 Redis 排行榜数据存入 MySQL
         → 重置当日 Redis 排行榜
         → 保留历史榜单供查询`,
    code: `-- MySQL 历史榜单存储
CREATE TABLE daily_leaderboard (
  id         BIGINT  PRIMARY KEY AUTO_INCREMENT,
  date       DATE    NOT NULL,
  user_id    BIGINT  NOT NULL,
  score      INT     NOT NULL,
  rank       INT     NOT NULL,
  INDEX idx_date_rank (date, rank)
);

# Redis 实时排行榜操作
import redis
r = redis.Redis()

# 用户得分+100
r.zincrby("game:rank:daily", 100, f"user:{uid}")

# 查询 Top 10
top10 = r.zrevrangebyscore(
    "game:rank:daily",
    "+inf", "-inf",
    withscores=True,
    start=0, num=10
)

# 查询自己的排名
rank = r.zrevrank("game:rank:daily", f"user:{uid}")
print(f"当前排名第 {rank + 1} 名")`,
  },
];

export default function LessonProjects() {
  const navigate = useNavigate();
  const [activeProj, setActiveProj] = useState(0);
  const [activeTab, setActiveTab] = useState('arch');

  const p = PROJECTS[activeProj];

  return (
    <div className="lesson-db">
      <div className="db-badge">🚀 module_08 — 实战项目</div>

      <div className="db-hero">
        <h1>实战项目：电商系统数据库与缓存架构</h1>
        <p>三大真实场景：<strong>秒杀系统</strong>解决超卖难题，<strong>登录会话</strong>实现多端管理，<strong>实时排行榜</strong>毫秒响应。每个场景都有完整的 MySQL + Redis 协作架构。</p>
      </div>

      {/* 项目切换 */}
      <div className="db-section">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {PROJECTS.map((proj, i) => (
            <button key={proj.name}
              onClick={() => { setActiveProj(i); setActiveTab('arch'); }}
              style={{ flex: 1, minWidth: 160, padding: '1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                background: activeProj === i ? `${proj.color}14` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeProj === i ? proj.color + '50' : 'rgba(255,255,255,0.06)'}`,
                color: activeProj === i ? proj.color : '#a08060',
              }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>{proj.icon}</div>
              {proj.name}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {p.tags.map(t => <span key={t} className="db-tag mysql" style={{ background: `${p.color}12`, color: p.color }}>{t}</span>)}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#a08060' }}>
            <strong style={{ color: '#fbbf24' }}>核心挑战：</strong>{p.challenge}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button className={`db-btn ${activeTab === 'arch' ? 'primary' : ''}`} onClick={() => setActiveTab('arch')}>🏗️ 架构设计</button>
          <button className={`db-btn ${activeTab === 'code' ? 'primary' : ''}`} onClick={() => setActiveTab('code')}>💻 核心代码</button>
        </div>

        {activeTab === 'arch' ? (
          <div className="db-card" style={{ borderColor: `${p.color}25` }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', lineHeight: '1.85', color: '#a08060', whiteSpace: 'pre', overflow: 'auto' }}>{p.arch}</div>
          </div>
        ) : (
          <div className="db-sql-wrapper">
            <div className="db-sql-header">
              <div className="db-sql-dot" style={{ background: '#ef4444' }} />
              <div className="db-sql-dot" style={{ background: '#f59e0b' }} />
              <div className="db-sql-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>{p.name} — 核心代码</span>
            </div>
            <div className="db-sql" style={{ maxHeight: 400, overflow: 'auto', fontSize: '0.75rem' }}>{p.code}</div>
          </div>
        )}
      </div>

      {/* MySQL + Redis 协作模式 */}
      <div className="db-section">
        <h2 className="db-section-title">⚖️ MySQL + Redis 分工协作最佳实践</h2>
        <div className="db-card">
          <table className="db-table">
            <thead><tr><th>场景</th><th>🗃️ MySQL 负责</th><th>🔴 Redis 负责</th></tr></thead>
            <tbody>
              {[
                ['数据持久化', '所有业务数据的权威存储', '缓存层，可重建，非权威'],
                ['并发控制', '行锁、表锁、事务', '原子命令、Lua脚本、分布式锁'],
                ['复杂查询', 'JOIN、聚合、全文搜索', '不擅长，用简单 Key-Value'],
                ['高频读取', '慢，+缓存层缓解', '极快，< 1ms 响应'],
                ['计数/排名', '批量统计（非实时）', '实时计数、实时排行榜'],
                ['会话/临时数据', '不适合（持久化成本高）', 'TTL 自动过期，天然适合'],
                ['数据一致性', '强一致（ACID）', '最终一致（缓存可能过期）'],
              ].map(([s, m, r]) => (
                <tr key={s}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.85rem' }}>{s}</td>
                  <td style={{ fontSize: '0.82rem', color: '#a08060' }}>{m}</td>
                  <td style={{ fontSize: '0.82rem', color: '#fca5a5' }}>{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 课程完成 */}
      <div className="db-section">
        <div className="db-card" style={{ background: 'linear-gradient(135deg, rgba(242,145,17,0.08), rgba(220,56,45,0.06))', borderColor: 'rgba(242,145,17,0.3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#F29111', fontSize: '1.2rem', marginBottom: '1rem' }}>恭喜完成 MySQL + Redis 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', textAlign: 'left' }}>
            {[
              '✅ 数据库选型：关系型 vs NoSQL',
              '✅ MySQL DDL/DML 与生产规范',
              '✅ 高级 SQL：JOIN/窗口函数/事务',
              '✅ 索引优化与 EXPLAIN 分析',
              '✅ Redis 五大数据类型场景应用',
              '✅ 缓存三大问题解决方案',
              '✅ 数据库设计范式与分库分表',
              '✅ 电商秒杀/会话/排行榜实战',
            ].map(s => <div key={s} style={{ fontSize: '0.875rem', color: '#a08060' }}>{s}</div>)}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <span className="db-tag mysql" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>下一步：MySQL DBA 认证 / Redis Certified Developer</span>
          </div>
        </div>
      </div>

      <div className="db-nav">
        <button className="db-btn" onClick={() => navigate('/course/database-mastery/lesson/design')}>← 上一模块</button>
        <button className="db-btn primary" onClick={() => navigate('/course/database-mastery')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
