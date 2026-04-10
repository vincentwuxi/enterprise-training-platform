import './LessonCommon.css';

const CODE = `-- ━━━━ PostgreSQL 内核架构 ━━━━

-- ━━━━ 1. 进程架构（多进程，非多线程）━━━━
-- ┌───────────────────────────────────────────┐
-- │              Postmaster (主进程)           │
-- │    监听连接 → fork 子进程               │
-- ├───────────────────────────────────────────┤
-- │  Backend Process    ← 每个客户端一个进程   │
-- │  Background Writer  ← 脏页刷盘            │
-- │  WAL Writer         ← WAL 缓冲刷盘        │
-- │  Checkpointer       ← 定期检查点          │
-- │  Autovacuum         ← 自动回收死元组       │
-- │  Stats Collector    ← 统计信息收集        │
-- │  Logger             ← 日志记录            │
-- └───────────────────────────────────────────┘
-- 
-- vs MySQL (多线程)：PG 进程隔离更安全，一个连接崩不影响其他

-- ━━━━ 2. MVCC（多版本并发控制）━━━━
-- 核心理念：读不阻塞写，写不阻塞读
-- 
-- 每行都有隐藏列：
-- xmin: 插入该行的事务 ID
-- xmax: 删除/更新该行的事务 ID（0 = 未删除）
-- 
-- UPDATE 操作 = 旧行标记 xmax + 插入新行：
-- ┌──────────────────────────────────────┐
-- │ 原始行: (xmin=100, xmax=0, name='Alice')  │
-- │     ↓ UPDATE name='Bob' (事务 200)        │
-- │ 旧行:   (xmin=100, xmax=200, name='Alice') │ ← 被标记删除
-- │ 新行:   (xmin=200, xmax=0,   name='Bob')   │ ← 新版本
-- └──────────────────────────────────────┘
-- 
-- 这就是为什么 PG 需要 VACUUM！
-- 旧版本(死元组) 不会自动删除，需要 VACUUM 回收空间

-- ━━━━ 3. WAL（预写日志）━━━━
-- Write-Ahead Logging：先写日志，再改数据
-- 
-- 工作流程：
-- 1. 客户端执行 INSERT
-- 2. 修改写入 WAL Buffer（内存）
-- 3. WAL Buffer 刷入 WAL 文件（磁盘） ← COMMIT 时
-- 4. 数据页修改留在 Shared Buffer（内存）
-- 5. Background Writer / Checkpoint 异步刷入数据文件
-- 
-- 为什么？
-- ✅ 崩溃恢复：重放 WAL 即可恢复
-- ✅ 复制：流复制 = 发送 WAL 到备库
-- ✅ 性能：顺序写 WAL 比随机写数据页快得多

-- ━━━━ 4. 事务隔离级别 ━━━━

-- Read Committed（默认，最常用）
-- 每条 SQL 看到的是语句开始时已提交的数据
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 看到 1000
-- 此时另一个事务将 balance 改为 500 并 COMMIT
SELECT balance FROM accounts WHERE id = 1;  -- 看到 500（不同！）
COMMIT;

-- Repeatable Read
-- 整个事务看到的是事务开始时的快照
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT balance FROM accounts WHERE id = 1;  -- 看到 1000
-- 此时另一个事务将 balance 改为 500 并 COMMIT
SELECT balance FROM accounts WHERE id = 1;  -- 仍然看到 1000！
COMMIT;

-- Serializable（最严格）
-- 事务表现得像串行执行
-- 用于：银行转账、库存扣减等强一致性场景
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- 如果检测到序列化冲突，自动回滚
-- ERROR: could not serialize access due to concurrent update

-- ━━━━ 5. Shared Buffer 工作原理 ━━━━
-- 内存中的数据页缓存（类似 MySQL Buffer Pool）
-- 
-- 读取流程：
-- 1. 查询需要某个数据页
-- 2. 先查 Shared Buffer → 命中 = 直接返回
-- 3. 未命中 → 从磁盘读入 Shared Buffer → 返回
-- 
-- 推荐配置：shared_buffers = 总内存的 25%
-- 例如 16GB RAM → shared_buffers = 4GB
SHOW shared_buffers;
ALTER SYSTEM SET shared_buffers = '4GB';
-- 需要重启 PG 生效`;

export default function LessonInternals() {
  return (
    <div className="pg-lesson">
      <div className="pg-hero">
        <div className="pg-badge">// MODULE 01 · PG INTERNALS</div>
        <h1>PostgreSQL 内核</h1>
        <p>理解 PG 为什么这么设计——<strong>多进程架构保证隔离安全，MVCC 实现读写不阻塞，WAL 预写日志保证崩溃恢复，事务隔离级别控制数据一致性</strong>。</p>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">🐘 PG 内核架构</div>
        <div className="pg-code-wrap">
          <div className="pg-code-head">
            <div className="pg-code-dot" style={{ background: '#ef4444' }} /><div className="pg-code-dot" style={{ background: '#f59e0b' }} /><div className="pg-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>internals.sql</span>
          </div>
          <div className="pg-code">{CODE}</div>
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📊 架构核心组件</div>
        <div className="pg-grid-4">
          {[
            { name: 'MVCC', desc: '读不阻塞写', color: '#336791' },
            { name: 'WAL', desc: '先写日志再改数据', color: '#4f46e5' },
            { name: 'Shared Buffer', desc: '内存数据页缓存', color: '#06b6d4' },
            { name: 'VACUUM', desc: '回收死元组空间', color: '#f97316' },
          ].map((c, i) => (
            <div key={i} className="pg-metric" style={{ borderTop: `2px solid ${c.color}` }}>
              <div className="pg-metric-val" style={{ color: c.color, fontSize: '1rem' }}>{c.name}</div>
              <div className="pg-metric-label">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">🔒 事务隔离级别</div>
        <div className="pg-card" style={{ overflowX: 'auto' }}>
          <table className="pg-table">
            <thead><tr><th>级别</th><th>脏读</th><th>不可重复读</th><th>幻读</th><th>场景</th></tr></thead>
            <tbody>
              {[
                ['Read Committed', '❌', '⚠️ 可能', '⚠️ 可能', '大多数 Web 应用（默认）'],
                ['Repeatable Read', '❌', '❌', '⚠️ 可能', '报表/统计查询'],
                ['Serializable', '❌', '❌', '❌', '银行转账/库存扣减'],
              ].map(([lvl, dr, nr, ph, sc], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#93c5fd' }}>{lvl}</td>
                  <td>{dr}</td><td>{nr}</td><td>{ph}</td>
                  <td style={{ color: 'var(--pg-muted)' }}>{sc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
