import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 慢查询分析模拟器
const SLOW_QUERIES = [
  {
    id: 1, time: 4820, db: 'users',
    sql: 'SELECT * FROM orders WHERE user_id = 1234 AND status = "paid" ORDER BY created_at DESC',
    issue: '全表扫描（ALL）：orders 表 500万行，无索引',
    explain: { type: 'ALL', rows: 5000000, filtered: 0.02, key: 'NULL', extra: 'Using where; Using filesort' },
    fix: 'CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at DESC);',
    fixTime: 12,
  },
  {
    id: 2, time: 1200, db: 'products',
    sql: 'SELECT p.*, c.name AS cat_name FROM products p LEFT JOIN categories c ON p.cat_id = c.id WHERE p.price > 100',
    issue: 'N+1 JOIN 未优化：categories 表被重复扫描',
    explain: { type: 'REF', rows: 125000, filtered: 33.3, key: 'cat_id', extra: 'Using index condition; Using join buffer' },
    fix: 'CREATE INDEX idx_products_price ON products(price); -- 覆盖 WHERE price > 100',
    fixTime: 45,
  },
  {
    id: 3, time: 890, db: 'analytics',
    sql: 'SELECT DATE(created_at), COUNT(*) FROM events WHERE YEAR(created_at)=2024 GROUP BY DATE(created_at)',
    issue: '函数包裹索引列：YEAR() 导致索引失效',
    explain: { type: 'ALL', rows: 8000000, filtered: 12.5, key: 'NULL', extra: 'Using where; Using filesort; Using temporary' },
    fix: "-- 改为范围查询（可走索引）:\nSELECT DATE(created_at), COUNT(*) FROM events\nWHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'\nGROUP BY DATE(created_at);",
    fixTime: 35,
  },
];

function SlowQueryAnalyzer() {
  const [selected, setSelected] = useState(0);
  const [showFix, setShowFix] = useState(false);
  const q = SLOW_QUERIES[selected];

  const getTimeColor = t => t > 3000 ? '#ef4444' : t > 1000 ? '#f97316' : '#fbbf24';

  return (
    <div className="po-interactive">
      <h3>🔍 慢查询分析器（SELECT 实际案例）</h3>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {SLOW_QUERIES.map((q, i) => (
          <button key={i} onClick={() => { setSelected(i); setShowFix(false); }}
            style={{ flex: 1, minWidth: 100, padding: '0.5rem', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
              border: `1px solid ${selected === i ? getTimeColor(q.time) + '60' : 'rgba(255,255,255,0.07)'}`,
              background: selected === i ? `${getTimeColor(q.time)}08` : 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', fontWeight: 800, color: getTimeColor(q.time) }}>{q.time}ms</div>
            <div style={{ fontSize: '0.62rem', color: '#475569' }}>Query #{i+1}</div>
          </button>
        ))}
      </div>

      {/* SQL */}
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', padding: '0.5rem 0.75rem', background: '#060609', borderRadius: '6px', color: '#94a3b8', marginBottom: '0.5rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        <span style={{ color: '#f97316' }}>SQL:</span> {q.sql}
      </div>

      {/* EXPLAIN 结果 */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>EXPLAIN 分析结果：</div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            ['type', q.explain.type, q.explain.type === 'ALL' ? '#ef4444' : '#f97316'],
            ['rows', q.explain.rows.toLocaleString(), '#60a5fa'],
            ['filtered', `${q.explain.filtered}%`, '#22c55e'],
            ['key', q.explain.key, q.explain.key === 'NULL' ? '#ef4444' : '#22c55e'],
          ].map(([k, v, c]) => (
            <div key={k} style={{ padding: '0.2rem 0.5rem', background: `${c}08`, border: `1px solid ${c}20`, borderRadius: '5px' }}>
              <div style={{ fontSize: '0.58rem', color: '#475569' }}>{k}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: c, fontFamily: 'JetBrains Mono' }}>{v}</div>
            </div>
          ))}
          <div style={{ fontSize: '0.65rem', color: '#334155', padding: '0.2rem 0.5rem', alignSelf: 'flex-end' }}>{q.explain.extra}</div>
        </div>
      </div>

      {/* 问题说明 */}
      <div style={{ padding: '0.375rem 0.625rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', fontSize: '0.75rem', color: '#f87171', marginBottom: '0.5rem' }}>
        ⚠️ 问题：{q.issue}
      </div>

      {/* 修复方案 */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button className="po-btn green" style={{ fontSize: '0.78rem' }} onClick={() => setShowFix(s => !s)}>
          {showFix ? '隐藏修复方案' : '🔧 查看修复方案'}
        </button>
        {showFix && (
          <span style={{ fontSize: '0.72rem', color: '#22c55e', fontFamily: 'JetBrains Mono' }}>
            {q.time}ms → {q.fixTime}ms（提速 {Math.round(q.time / q.fixTime)}x）
          </span>
        )}
      </div>
      {showFix && (
        <div style={{ marginTop: '0.4rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', padding: '0.5rem 0.75rem', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '6px', color: '#4ade80', whiteSpace: 'pre-wrap' }}>
          {q.fix}
        </div>
      )}
    </div>
  );
}

const DB_TOPICS = [
  {
    name: '索引设计', icon: '📑', color: '#3b82f6',
    code: `-- MySQL 索引设计精要

-- ── 1. 覆盖索引（Index Coverage）──
-- 查询只需索引就能返回结果，不需要回表查主键
-- ❌ 只有 (user_id) → 还需回表获取 status, amount
CREATE INDEX idx_user ON orders(user_id);
SELECT status, amount FROM orders WHERE user_id = 123;  -- 需要回表

-- ✅ 覆盖索引 → 不需回表！
CREATE INDEX idx_user_covering ON orders(user_id, status, amount);
SELECT status, amount FROM orders WHERE user_id = 123;  -- 直接在索引叶节点获取

-- ── 2. 联合索引最左前缀原则 ──
CREATE INDEX idx_name_age_city ON users(last_name, first_name, age);

-- ✅ 走索引
WHERE last_name = 'Zhang'
WHERE last_name = 'Zhang' AND first_name = 'Wei'
WHERE last_name = 'Zhang' AND first_name = 'Wei' AND age = 25

-- ❌ 不走索引（跳过 last_name）：
WHERE first_name = 'Wei'    -- 未使用最左前缀
WHERE age = 25              -- 同上

-- ── 3. 索引选择性（Cardinality）──
-- 高选择性列放前，低选择性列放后
SELECT COUNT(DISTINCT user_id) / COUNT(*) AS selectivity FROM orders;
-- selectivity: 0.82 → 高选择性 → 适合索引
-- selectivity: 0.02 → 低选择性（如 status）→ 单列索引效果差

-- ── 4. 索引设计反模式 ──
-- ❌ 在 WHERE 中对索引列用函数（索引失效！）
WHERE YEAR(created_at) = 2024        -- 用函数包裹
WHERE LEFT(phone, 7) = '138xxxx'     -- 函数
WHERE birthday + 1 = '2024-01-01'   -- 计算

-- ✅ 改写为范围查询（走索引）
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
WHERE phone LIKE '138xxxx%'          -- LIKE前缀可以走索引

-- ── 5. EXPLAIN 关键字段速查 ──
-- type: ALL(全表) < index < range < ref < eq_ref < const
-- key: 实际使用的索引名（NULL = 无索引）
-- rows: 预估扫描行数（越小越好）
-- Extra: Using filesort（❌）, Using index（✅), Using where（OK）`,
  },
  {
    name: '连接池与 ORM', icon: '🔗', color: '#22c55e',
    code: `# 数据库连接池配置 + ORM N+1 问题解决

# ── 1. SQLAlchemy 连接池（核心配置）──
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    "postgresql://user:pass@localhost/prod",
    poolclass=QueuePool,
    pool_size=20,            # 常驻连接数（等于 CPU 核数 × 2-4）
    max_overflow=10,         # 峰值额外连接数
    pool_timeout=30,         # 获取连接超时（秒）
    pool_recycle=3600,       # 连接最大存活时间（防 MySQL 8h 超时断开）
    pool_pre_ping=True,      # 每次使用前检查连接是否有效
    echo_pool="debug",       # 调试时打印连接池事件
)

# ── 2. ORM N+1 问题（性能杀手！）──
from sqlalchemy.orm import Session, selectinload

# ❌ N+1 问题：查1次用户 + 每个用户查1次订单 = 1 + N 次查询
users = session.query(User).all()          # 1 次 SQL
for u in users:
    print(u.orders)                        # N 次 SQL（每次触发懒加载！）

# ✅ 解决方案一：selectinload（推荐）
users = session.query(User).options(
    selectinload(User.orders),             # 2 次 SQL（1次users + 1次orders IN (IDs)）
    selectinload(User.profile),
).all()

# ✅ 解决方案二：joinedload（适合一对一）
users = session.query(User).options(
    joinedload(User.profile),              # 1 次 SQL（LEFT JOIN）
).all()

# ── 3. 批量写入（批量 INSERT vs 逐条 INSERT）──
# ❌ 逐条 INSERT：10000条 ≈ 10秒
for item in data:
    session.add(Item(name=item['name'], value=item['value']))
    session.commit()

# ✅ 批量写入：10000条 ≈ 0.2秒（50x 快！）
session.bulk_insert_mappings(Item, data)   # Core API，最快
session.commit()
# 或
session.execute(insert(Item), data)        # 也很快，支持 ON CONFLICT

# ── 4. 读写分离 ──
from sqlalchemy import event

class RoutingSession(Session):
    def get_bind(self, mapper=None, clause=None, **kw):
        if clause is not None and isinstance(clause, UpdateBase):
            return write_engine   # INSERT/UPDATE/DELETE → 主库
        return random.choice(read_engines)  # SELECT → 从库（负载均衡）`,
  },
];

export default function LessonDatabase() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = DB_TOPICS[activeTopic];

  return (
    <div className="lesson-po">
      <div className="po-badge orange">🗄️ module_05 — 数据库调优</div>
      <div className="po-hero">
        <h1>数据库调优：索引设计 / 执行计划 / 连接池 / N+1</h1>
        <p>数据库往往是应用性能的<strong>最大瓶颈</strong>。正确的索引设计可以将千万行表的查询从 5000ms 降到 5ms（1000x），理解 EXPLAIN 执行计划是数据库调优的必备技能。</p>
      </div>

      <SlowQueryAnalyzer />

      <div className="po-section">
        <h2 className="po-section-title">🔧 索引设计 & ORM 优化</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {DB_TOPICS.map((topic, i) => (
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
        <button className="po-btn" onClick={() => navigate('/course/perf-optimization/lesson/javascript')}>← 上一模块</button>
        <button className="po-btn primary" onClick={() => navigate('/course/perf-optimization/lesson/apm')}>下一模块：APM & 可观测性 →</button>
      </div>
    </div>
  );
}
