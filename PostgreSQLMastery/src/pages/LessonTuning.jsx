import './LessonCommon.css';

const CODE = `-- ━━━━ PostgreSQL 性能调优 ━━━━

-- ━━━━ 1. 关键参数调优 ━━━━
-- 内存相关
shared_buffers = '4GB'          -- 总内存的 25%（数据页缓存）
effective_cache_size = '12GB'   -- 总内存的 75%（告诉优化器 OS 缓存大小）
work_mem = '64MB'               -- 每个排序/哈希操作的内存
maintenance_work_mem = '1GB'    -- VACUUM/CREATE INDEX 用的内存

-- WAL 相关
wal_buffers = '64MB'            -- WAL 缓冲区
checkpoint_completion_target = 0.9  -- 检查点写入平摊到整个周期
max_wal_size = '4GB'            -- 触发检查点的 WAL 大小

-- 并行查询
max_parallel_workers_per_gather = 4  -- 每个查询最多 4 个并行 worker
max_worker_processes = 8        -- 总并行 worker 数

-- 连接
max_connections = 200           -- 最大连接数
-- ⚠️ 不要设太高！每个连接 ~10MB 内存
-- ⚠️ 推荐用连接池（PgBouncer）

-- ━━━━ 2. pg_stat_statements（慢查询追踪）━━━━
CREATE EXTENSION pg_stat_statements;

-- Top 10 耗时最长的查询
SELECT
  query,
  calls,
  mean_exec_time::numeric(10,2) AS avg_ms,
  total_exec_time::numeric(10,2) AS total_ms,
  rows,
  shared_blks_hit + shared_blks_read AS total_blocks,
  CASE WHEN shared_blks_hit + shared_blks_read > 0
    THEN ROUND(shared_blks_hit * 100.0 /
         (shared_blks_hit + shared_blks_read), 2)
    ELSE 0 END AS cache_hit_pct
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- ━━━━ 3. VACUUM 深度理解 ━━━━
-- 为什么需要 VACUUM？
-- UPDATE/DELETE 不删除旧行，只标记 xmax
-- 旧行（死元组）占用空间 → 表膨胀
-- → VACUUM 回收死元组空间

-- 普通 VACUUM（不阻塞读写）
VACUUM VERBOSE orders;  -- 回收空间但不释放给 OS

-- VACUUM FULL（阻塞！重建整个表）
VACUUM FULL orders;     -- 释放空间给 OS，但需要表级锁

-- 查看表膨胀情况
SELECT
  schemaname, relname,
  n_live_tup, n_dead_tup,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct,
  last_vacuum, last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Autovacuum 配置
autovacuum = on
autovacuum_vacuum_threshold = 50        -- 最少改多少行才触发
autovacuum_vacuum_scale_factor = 0.1    -- 表的 10% 行变更触发
autovacuum_analyze_threshold = 50
autovacuum_analyze_scale_factor = 0.05

-- 大表调优：降低 scale_factor
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.01,  -- 1% 变更就触发
  autovacuum_vacuum_threshold = 1000
);

-- ━━━━ 4. 连接池（PgBouncer）━━━━
-- 问题：PG 每个连接一个进程，200 连接 = 200 进程 = 2GB 内存
-- 解决：PgBouncer 做连接池

-- pgbouncer.ini
-- [databases]
-- mydb = host=127.0.0.1 port=5432 dbname=mydb
-- [pgbouncer]
-- listen_port = 6432
-- pool_mode = transaction  # 事务级复用（推荐）
-- max_client_conn = 1000   # 应用可以连 1000
-- default_pool_size = 20   # 实际到 PG 只有 20 个连接

-- 连接池模式：
-- session:     会话级（一个客户端独占一个连接，不推荐）
-- transaction: 事务级（事务结束归还连接，推荐）
-- statement:   语句级（每条 SQL 归还连接，最激进）

-- ━━━━ 5. 监控 Dashboard ━━━━
-- 关键指标：
-- ✅ 连接数：   SELECT count(*) FROM pg_stat_activity;
-- ✅ 缓存命中率：SELECT sum(heap_blks_hit) / sum(heap_blks_hit + heap_blks_read) FROM pg_statio_user_tables;
-- ✅ 事务提交率：SELECT xact_commit, xact_rollback FROM pg_stat_database;
-- ✅ 锁等待：   SELECT * FROM pg_stat_activity WHERE wait_event_type = 'Lock';
-- ✅ 复制延迟：  SELECT pg_last_wal_replay_lsn() - pg_last_wal_receive_lsn();
-- 
-- 目标：缓存命中率 > 99%，死元组比例 < 5%`;

export default function LessonTuning() {
  return (
    <div className="pg-lesson">
      <div className="pg-hero">
        <div className="pg-badge">// MODULE 07 · PERFORMANCE TUNING</div>
        <h1>性能调优</h1>
        <p>默认配置的 PG 只发挥了 10% 性能——<strong>shared_buffers 调到内存 25%，pg_stat_statements 追踪慢查询，VACUUM 防止表膨胀，PgBouncer 连接池让 20 个连接撑住 1000 并发</strong>。</p>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">⚡ 性能调优</div>
        <div className="pg-code-wrap">
          <div className="pg-code-head">
            <div className="pg-code-dot" style={{ background: '#ef4444' }} /><div className="pg-code-dot" style={{ background: '#f59e0b' }} /><div className="pg-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>tuning.conf</span>
          </div>
          <div className="pg-code">{CODE}</div>
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📊 调优检查清单</div>
        <div className="pg-grid-2">
          {[
            { name: '缓存命中率', target: '> 99%', query: 'pg_statio 统计', fix: '增大 shared_buffers', color: '#10b981' },
            { name: '死元组比例', target: '< 5%', query: 'pg_stat_user_tables', fix: '调优 autovacuum', color: '#f97316' },
            { name: 'Top 慢查询', target: 'avg < 100ms', query: 'pg_stat_statements', fix: '加索引/优化 SQL', color: '#4f46e5' },
            { name: '连接数', target: '< max_conn', query: 'pg_stat_activity', fix: '用 PgBouncer 连接池', color: '#336791' },
          ].map((c, i) => (
            <div key={i} className="pg-card" style={{ borderLeft: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{c.name} <span style={{ color: '#93c5fd', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem' }}>{c.target}</span></div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pg-muted)', marginBottom: '0.15rem' }}>📊 {c.query}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pg-muted)' }}>🔧 {c.fix}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
