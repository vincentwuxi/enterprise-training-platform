import './LessonCommon.css';

const CODE = `-- ━━━━ 分区与分片 ━━━━

-- ━━━━ 1. 为什么要分区？━━━━
-- 大表（>1 亿行）问题：
-- ❌ 全表扫描慢
-- ❌ VACUUM 慢（锁表时间长）
-- ❌ 索引膨胀
-- ❌ 备份/恢复慢
-- → 分区：将大表拆成小表，但对应用透明

-- ━━━━ 2. Range 分区（最常用）━━━━
-- 按时间范围分区（日志/订单/时序数据）
CREATE TABLE orders (
  id         BIGSERIAL,
  user_id    BIGINT NOT NULL,
  amount     DECIMAL(12,2),
  status     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE orders_2024_q1 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE orders_2024_q2 PARTITION OF orders
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE orders_2024_q3 PARTITION OF orders
  FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE orders_2024_q4 PARTITION OF orders
  FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

-- 查询自动路由到正确分区（分区裁剪）
EXPLAIN SELECT * FROM orders WHERE created_at > '2024-06-01';
-- → 只扫描 q2 + q3 + q4，跳过 q1！

-- 删除旧数据：直接 DROP 分区（瞬间完成，比 DELETE 快 1000x）
DROP TABLE orders_2023_q1;

-- ━━━━ 3. List 分区 ━━━━
-- 按离散值分区（地区/状态/类别）
CREATE TABLE events (
  id BIGSERIAL, type TEXT, data JSONB
) PARTITION BY LIST (type);

CREATE TABLE events_click    PARTITION OF events FOR VALUES IN ('click', 'view');
CREATE TABLE events_purchase PARTITION OF events FOR VALUES IN ('purchase', 'refund');
CREATE TABLE events_system   PARTITION OF events FOR VALUES IN ('error', 'warning');

-- ━━━━ 4. Hash 分区 ━━━━
-- 均匀分布数据（无自然分区键时）
CREATE TABLE sessions (
  id UUID, user_id BIGINT, data JSONB
) PARTITION BY HASH (user_id);

CREATE TABLE sessions_0 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE sessions_1 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE sessions_2 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE sessions_3 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- ━━━━ 5. 自动分区管理（pg_partman）━━━━
CREATE EXTENSION pg_partman;
SELECT partman.create_parent(
  p_parent_table    := 'public.orders',
  p_control         := 'created_at',
  p_type            := 'range',
  p_interval        := 'monthly',
  p_premake         := 3      -- 预创建 3 个未来分区
);
-- → 自动创建每月分区，自动清理旧分区

-- ━━━━ 6. Citus 分布式扩展 ━━━━
-- 当单机 PG 扛不住时 → Citus 将数据分片到多个节点
CREATE EXTENSION citus;

-- 设置分布表
SELECT create_distributed_table('orders', 'user_id');
-- → orders 按 user_id 分片到所有 worker 节点
-- → 查询自动路由到正确分片
-- → 跨分片 JOIN 自动处理

-- ━━━━ 7. FDW（Foreign Data Wrapper）━━━━
-- 跨数据库查询：让 PG 查询远程 PG/MySQL/MongoDB
CREATE EXTENSION postgres_fdw;

CREATE SERVER remote_db FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'remote-host', dbname 'analytics', port '5432');

CREATE USER MAPPING FOR CURRENT_USER SERVER remote_db
  OPTIONS (user 'readonly', password 'xxx');

IMPORT FOREIGN SCHEMA public FROM SERVER remote_db INTO foreign_schema;

-- 现在可以直接查询远程表！
SELECT * FROM foreign_schema.analytics_events
WHERE created_at > '2024-01-01';`;

export default function LessonPartition() {
  return (
    <div className="pg-lesson">
      <div className="pg-hero">
        <div className="pg-badge">// MODULE 05 · PARTITIONING</div>
        <h1>分区与分片</h1>
        <p>亿级大表不分区 = 定时炸弹——<strong>Range 分区让时序查询只扫描相关月份，DROP 分区比 DELETE 快 1000 倍，Citus 让 PG 水平扩展到多节点</strong>。</p>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📐 分区全景</div>
        <div className="pg-code-wrap">
          <div className="pg-code-head">
            <div className="pg-code-dot" style={{ background: '#ef4444' }} /><div className="pg-code-dot" style={{ background: '#f59e0b' }} /><div className="pg-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>partitioning.sql</span>
          </div>
          <div className="pg-code">{CODE}</div>
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📊 分区类型对比</div>
        <div className="pg-grid-3">
          {[
            { type: 'Range', key: '时间/数值范围', best: '日志/订单/时序', ex: 'created_at 按月', color: '#336791' },
            { type: 'List', key: '离散枚举值', best: '地区/类型/状态', ex: "type IN ('click')", color: '#4f46e5' },
            { type: 'Hash', key: '均匀分布', best: '无自然分区键', ex: 'user_id % 4', color: '#06b6d4' },
          ].map((p, i) => (
            <div key={i} className="pg-card" style={{ borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontWeight: 800, color: p.color, fontSize: '1rem', marginBottom: '0.4rem' }}>{p.type}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pg-muted)', lineHeight: 1.8 }}>
                分区键：{p.key}<br/>
                最佳场景：{p.best}<br/>
                <code style={{ fontSize: '0.75rem', color: '#93c5fd' }}>{p.ex}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
