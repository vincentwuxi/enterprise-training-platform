import './LessonCommon.css';

const CODE = `-- ━━━━ 复制与高可用 ━━━━

-- ━━━━ 1. 流复制（Streaming Replication）━━━━
-- 主库将 WAL 实时流式发送到备库
-- 备库持续应用 WAL → 数据同步

-- 主库配置 (postgresql.conf)
wal_level = replica               -- 开启复制级别
max_wal_senders = 10              -- 最大 WAL 发送进程数
synchronous_standby_names = ''    -- 异步复制（默认）
-- synchronous_standby_names = 'standby1'  -- 同步复制

-- 主库创建复制用户
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'xxx';

-- pg_hba.conf（允许备库连接）
-- host replication replicator 10.0.0.0/24 md5

-- 备库初始化（从主库全量复制）
-- pg_basebackup -h primary-host -U replicator -D /data/pg -Fp -Xs -P

-- 备库配置 (postgresql.conf)
primary_conninfo = 'host=primary-host user=replicator password=xxx'
hot_standby = on                  -- 备库可以接受只读查询

-- ━━━━ 2. 同步 vs 异步复制 ━━━━
-- ┌──────────────┬──────────────┬──────────────┐
-- │              │ 异步复制     │ 同步复制     │
-- ├──────────────┼──────────────┼──────────────┤
-- │ 数据丢失风险 │ 可能丢几秒   │ 零数据丢失   │
-- │ 写入延迟     │ 低           │ 高（等备库确认）│
-- │ 备库故障影响 │ 无影响       │ 主库阻塞     │
-- │ 场景         │ 大多数应用   │ 金融/交易    │
-- └──────────────┴──────────────┴──────────────┘

-- ━━━━ 3. 逻辑复制（Logical Replication）━━━━
-- 流复制 = 复制整个数据库（物理级）
-- 逻辑复制 = 只复制指定表（行级），可跨版本

-- 发布端（主库）
CREATE PUBLICATION my_pub FOR TABLE users, orders;

-- 订阅端（目标库）
CREATE SUBSCRIPTION my_sub
  CONNECTION 'host=primary-host dbname=mydb user=replicator'
  PUBLICATION my_pub;

-- 用途：
-- ✅ 零停机数据库升级（PG 15 → PG 16）
-- ✅ 数据仓库同步（OLTP → OLAP）
-- ✅ 跨地域数据同步

-- ━━━━ 4. Patroni 自动故障切换 ━━━━
-- Patroni = 最流行的 PG 高可用方案
-- 依赖 etcd/ZooKeeper/Consul 做分布式协调

-- patroni.yml 配置
-- scope: pg-cluster
-- namespace: /db/
-- name: node1
-- restapi:
--   listen: 0.0.0.0:8008
-- etcd:
--   host: etcd-host:2379
-- bootstrap:
--   dcs:
--     ttl: 30
--     loop_wait: 10
--     maximum_lag_on_failover: 1048576  # 1MB
-- postgresql:
--   listen: 0.0.0.0:5432
--   authentication:
--     replication:
--       username: replicator
--       password: xxx

-- 故障切换流程：
-- 1. Patroni 监控主库心跳
-- 2. 主库无响应（超过 ttl=30s）
-- 3. Patroni 在剩余备库中选举新主库
-- 4. 新主库 promote → 接管写入
-- 5. 其他备库重新指向新主库
-- 6. VIP/DNS 自动切换到新主库
-- 全程自动，无需人工干预，通常 < 30 秒

-- ━━━━ 5. 备份策略 ━━━━
-- 全量备份（pg_basebackup）
pg_basebackup -h localhost -U replicator \\
  -D /backup/base -Ft -z -Xs -P
-- -Ft: tar 格式
-- -z: gzip 压缩
-- -Xs: 包含 WAL 段

-- 增量备份（WAL 归档）
archive_mode = on
archive_command = 'cp %p /archive/%f'

-- 时间点恢复（PITR）
-- 恢复到某个精确时间点（比如误操作前 1 秒）
-- recovery_target_time = '2024-03-15 14:30:00'
-- 这就是"后悔药"！`;

export default function LessonReplication() {
  return (
    <div className="pg-lesson">
      <div className="pg-hero">
        <div className="pg-badge">// MODULE 06 · REPLICATION & HA</div>
        <h1>复制与高可用</h1>
        <p>数据库挂了全公司停摆——<strong>流复制实现实时数据同步，Patroni 自动故障切换 &lt;30 秒，PITR 时间点恢复是你的"后悔药"</strong>。</p>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">🔄 复制与高可用</div>
        <div className="pg-code-wrap">
          <div className="pg-code-head">
            <div className="pg-code-dot" style={{ background: '#ef4444' }} /><div className="pg-code-dot" style={{ background: '#f59e0b' }} /><div className="pg-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>replication.sql</span>
          </div>
          <div className="pg-code">{CODE}</div>
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📊 高可用架构</div>
        <div className="pg-grid-2">
          {[
            { name: '流复制', type: '物理级', what: '整个数据库 WAL 同步', uc: '读写分离/灾备', color: '#336791' },
            { name: '逻辑复制', type: '行级', what: '指定表，可跨版本', uc: '升级/数据仓库/跨地域', color: '#4f46e5' },
            { name: 'Patroni', type: '自动切换', what: 'etcd 协调 + 自动选主', uc: '生产高可用标配', color: '#10b981' },
            { name: 'PITR', type: '时间点恢复', what: 'WAL 归档 + 精确恢复', uc: '误操作后悔药', color: '#f97316' },
          ].map((h, i) => (
            <div key={i} className="pg-card" style={{ borderLeft: `3px solid ${h.color}` }}>
              <div style={{ fontWeight: 700, color: h.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{h.name} <span style={{ fontSize: '0.72rem', color: 'var(--pg-muted)' }}>({h.type})</span></div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pg-muted)', marginBottom: '0.15rem' }}>🎯 {h.what}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pg-muted)' }}>💼 {h.uc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
