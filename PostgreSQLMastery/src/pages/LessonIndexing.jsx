import './LessonCommon.css';

const CODE = `-- ━━━━ PostgreSQL 索引深度 ━━━━

-- ━━━━ 1. B-tree（默认索引，95% 场景）━━━━
-- 适用：= < > <= >= BETWEEN IN ORDER BY
CREATE INDEX idx_users_email ON users (email);

-- 复合索引（注意列顺序！遵循最左前缀）
CREATE INDEX idx_orders_date_status ON orders (created_at, status);
-- ✅ WHERE created_at > '2024-01-01' AND status = 'paid'
-- ✅ WHERE created_at > '2024-01-01'
-- ❌ WHERE status = 'paid'  ← 不会用到索引!

-- 覆盖索引（Index-Only Scan，不回表）
CREATE INDEX idx_orders_covering ON orders (user_id)
  INCLUDE (amount, status);
-- 如果查询只需要 user_id + amount + status，直接从索引返回

-- 部分索引（只索引部分数据）
CREATE INDEX idx_active_users ON users (email)
  WHERE is_active = true;
-- 只索引活跃用户 → 索引更小、更快

-- 唯一索引
CREATE UNIQUE INDEX idx_unique_email ON users (email);

-- ━━━━ 2. GIN（通用倒排索引）━━━━
-- 适用：数组 @> / JSONB @> ? / 全文搜索 @@
CREATE INDEX idx_tags ON posts USING GIN (tags);
-- WHERE tags @> ARRAY['postgresql', 'database']

CREATE INDEX idx_attrs ON products USING GIN (attrs);
-- WHERE attrs @> '{"color": "red"}'

CREATE INDEX idx_fts ON posts USING GIN (to_tsvector('english', body));
-- WHERE to_tsvector('english', body) @@ to_tsquery('database')

-- ━━━━ 3. GiST（通用搜索树）━━━━
-- 适用：几何/范围/最近邻搜索
CREATE INDEX idx_location ON stores USING GiST (location);
-- 最近邻查询
SELECT name, location <-> point(37.7749, -122.4194) AS distance
FROM stores ORDER BY location <-> point(37.7749, -122.4194) LIMIT 5;

-- 范围索引
CREATE INDEX idx_booking ON bookings USING GiST (during);
-- WHERE during && '[2024-01-01, 2024-01-31]'::daterange

-- ━━━━ 4. BRIN（块范围索引）━━━━
-- 适用：天然有序的大表（时间序列、日志）
-- 索引极小（MB 级），扫描按块过滤
CREATE INDEX idx_logs_time ON logs USING BRIN (created_at);
-- 1 亿行日志表，BRIN 索引只有几 MB！（B-tree 可能 GB 级）

-- ━━━━ 5. EXPLAIN ANALYZE（读执行计划）━━━━
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 42 AND status = 'paid';

-- 输出解读：
-- Index Scan using idx_orders_user on orders
--   (cost=0.43..8.45 rows=1 width=64)
--   (actual time=0.023..0.025 rows=1 loops=1)
--   Index Cond: (user_id = 42)
--   Filter: (status = 'paid')
--   Buffers: shared hit=4  ← 全部从缓存读取
-- Planning Time: 0.085 ms
-- Execution Time: 0.042 ms

-- 🔴 危险信号：
-- Seq Scan on big_table        ← 全表扫描（大表=慢）
-- Sort Method: external merge  ← 内存不够，溢出到磁盘
-- Rows Removed by Filter: 99999 ← 索引没用上，过滤太多
-- Nested Loop (actual loops=10000) ← N+1 查询

-- ━━━━ 6. 索引维护 ━━━━
-- 查看索引使用情况
SELECT schemaname, tablename, indexname,
       idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;  -- 使用次数最少的排前面（候选删除）

-- 查看索引大小
SELECT pg_size_pretty(pg_indexes_size('orders'));

-- 查看未使用的索引（浪费空间 + 拖慢写入）
SELECT indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public';
-- → 考虑 DROP INDEX`;

export default function LessonIndexing() {
  return (
    <div className="pg-lesson">
      <div className="pg-hero">
        <div className="pg-badge">// MODULE 03 · INDEXING</div>
        <h1>索引深度</h1>
        <p>索引用错比不用更危险——<strong>B-tree 覆盖 95% 场景，GIN 处理 JSONB/数组/全文搜索，BRIN 用 MB 级大小索引亿级时序数据，EXPLAIN ANALYZE 是你的"SQL X 光机"</strong>。</p>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📐 索引全景</div>
        <div className="pg-code-wrap">
          <div className="pg-code-head">
            <div className="pg-code-dot" style={{ background: '#ef4444' }} /><div className="pg-code-dot" style={{ background: '#f59e0b' }} /><div className="pg-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>indexing.sql</span>
          </div>
          <div className="pg-code">{CODE}</div>
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📊 索引类型选型</div>
        <div className="pg-card" style={{ overflowX: 'auto' }}>
          <table className="pg-table">
            <thead><tr><th>索引类型</th><th>适用场景</th><th>操作符</th><th>大小</th></tr></thead>
            <tbody>
              {[
                ['B-tree', '等值/范围/排序', '= < > BETWEEN', '⬛⬛⬛ 中等'],
                ['GIN', 'JSONB/数组/全文', '@> ? @@', '⬛⬛⬛⬛ 较大'],
                ['GiST', '几何/范围/最近邻', '<-> && @>', '⬛⬛⬛ 中等'],
                ['BRIN', '天然有序大表', '< > =', '⬛ 极小'],
                ['Hash', '纯等值查询', '= 仅', '⬛⬛ 较小'],
              ].map(([type, scene, ops, size], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#93c5fd' }}>{type}</td>
                  <td>{scene}</td>
                  <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem' }}>{ops}</td>
                  <td>{size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
