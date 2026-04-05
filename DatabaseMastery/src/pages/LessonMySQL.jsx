import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const SQL_EXAMPLES = [
  {
    cat: 'DDL — 建表',
    sql: `-- 电商用户表（生产级设计）
CREATE TABLE users (
  id         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  username   VARCHAR(50)      NOT NULL UNIQUE,
  email      VARCHAR(100)     NOT NULL UNIQUE,
  password   CHAR(60)         NOT NULL,          -- bcrypt hash 固定60位
  status     TINYINT          NOT NULL DEFAULT 1, -- 1=active, 0=banned
  created_at DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                              ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX idx_email   (email),
  INDEX idx_status  (status, created_at)  -- 复合索引，符合最左前缀
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci  -- 支持 emoji
  COMMENT='用户账户表';`,
    result: 'Query OK, 0 rows affected (0.023 sec)',
  },
  {
    cat: 'DML — 增删改',
    sql: `-- INSERT：批量插入（优于逐条插入，1次网络往返）
INSERT INTO users (username, email, password) VALUES
  ('alice', 'alice@example.com', '$2b$10$...'),
  ('bob',   'bob@example.com',   '$2b$10$...');

-- UPDATE：精确更新（务必带 WHERE 条件！）
UPDATE users
SET    status = 0, updated_at = NOW()
WHERE  email = 'bob@example.com'
LIMIT  1;  -- 生产建议加 LIMIT 防止误更新大量数据

-- DELETE vs TRUNCATE vs DROP
DELETE FROM users WHERE status = 0;  -- 可回滚，记录binlog
TRUNCATE TABLE logs;                 -- 清空表，不可回滚，重置自增
-- DROP TABLE temp_data;             -- 删除表结构，危险！`,
    result: 'Query OK, 2 rows affected (0.004 sec)\nQuery OK, 1 row affected (0.002 sec)',
  },
  {
    cat: 'SELECT — 查询基础',
    sql: `-- 基础查询：避免 SELECT *（带出不需要的列，增加传输和内存）
SELECT id, username, email, created_at
FROM   users
WHERE  status = 1
  AND  created_at >= '2024-01-01'
ORDER BY created_at DESC
LIMIT  20 OFFSET 0;   -- 分页：第1页，每页20条

-- 聚合统计
SELECT
  DATE(created_at)   AS reg_date,
  COUNT(*)           AS new_users,
  COUNT(DISTINCT email) FILTER (WHERE status=1) AS active_users
FROM   users
WHERE  created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
HAVING new_users > 10
ORDER BY reg_date;`,
    result: '+----+----------+----------------------+---------------------+\n| id | username | email                | created_at          |\n+----+----------+----------------------+---------------------+\n|  1 | alice    | alice@example.com    | 2024-03-15 09:23:11 |\n+----+----------+----------------------+---------------------+\n1 row in set (0.001 sec)',
  },
  {
    cat: '数据类型陷阱',
    sql: `-- ❌ 常见错误：
-- 1. 用 VARCHAR 存手机号（无法范围查询）→ 用 BIGINT
-- 2. 用 FLOAT 存金额（精度丢失）→ 用 DECIMAL(10,2)
-- 3. 用 VARCHAR 存枚举 → 用 TINYINT + 代码层映射

-- ✅ 正确的金额字段
amount DECIMAL(15, 4) NOT NULL DEFAULT '0.0000',
-- DECIMAL(15,4)：最大 999999999999.9999，精确到0.1分

-- ✅ 时间字段最佳实践
created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
-- 为什么不用 TIMESTAMP？
-- TIMESTAMP 范围只到 2038-01-19（Y2K38 问题）
-- DATETIME 范围到 9999-12-31，更安全

-- ✅ 字符集选择
-- utf8mb4：完整 Unicode，支持 emoji（不是 utf8！）
-- utf8mb4_unicode_ci：大小写不敏感（适合用户搜索）`,
    result: '-- 记住：金额用 DECIMAL，ID 用 BIGINT，时间用 DATETIME，字符集用 utf8mb4',
  },
];

export default function LessonMySQL() {
  const navigate = useNavigate();
  const [activeEx, setActiveEx] = useState(0);

  return (
    <div className="lesson-db">
      <div className="db-badge">🗃️ module_02 — MySQL 核心</div>

      <div className="db-hero">
        <h1>MySQL 核心：DDL、DML 与查询实战</h1>
        <p>SQL 是数据工程师的母语。围绕真实的电商系统，从建表规范到查询优化，掌握<strong>生产级 MySQL 开发实践</strong>。</p>
      </div>

      {/* 数据库架构图 */}
      <div className="db-section">
        <h2 className="db-section-title">🏗️ MySQL 内部架构（查询执行路径）</h2>
        <div className="db-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.74rem', color: '#a08060', lineHeight: '1.85', whiteSpace: 'pre' }}>{`
客户端 (Python/Node/Java)
    │ SQL 语句
    ▼
┌─────────────────── MySQL Server ──────────────────────┐
│  连接层: 连接池 → 认证 → 权限校验                     │
│     ↓                                                   │
│  SQL 层: 解析器 → 预处理器 → 优化器 → 执行计划        │
│                              ↑                          │
│                         查询缓存 (8.0已移除)            │
│     ↓                                                   │
│  存储引擎层:  InnoDB (默认) | MyISAM | Memory          │
│     InnoDB:  Buffer Pool | Redo Log | Undo Log         │
└───────────────────────────────────────────────────────┘
    │
    ▼
磁盘: .ibd 文件（表空间）`}</div>
        </div>
      </div>

      {/* SQL 交互式编辑器 */}
      <div className="db-section">
        <h2 className="db-section-title">💻 SQL 交互式演示（切换类别）</h2>
        <div className="db-interactive">
          <h3>
            SQL 分类演示
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SQL_EXAMPLES.map((e, i) => (
                <button key={i} className={`db-btn ${activeEx === i ? 'primary' : ''}`}
                  onClick={() => setActiveEx(i)} style={{ fontSize: '0.8rem' }}>{e.cat}</button>
              ))}
            </div>
          </h3>
          <div className="db-sql-wrapper">
            <div className="db-sql-header">
              <div className="db-sql-dot" style={{ background: '#ef4444' }} />
              <div className="db-sql-dot" style={{ background: '#f59e0b' }} />
              <div className="db-sql-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>MySQL 8.0 — {SQL_EXAMPLES[activeEx].cat}</span>
            </div>
            <div className="db-sql" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {SQL_EXAMPLES[activeEx].sql}
            </div>
          </div>
          <div className="db-result">{SQL_EXAMPLES[activeEx].result}</div>
        </div>
      </div>

      {/* InnoDB 存储引擎 */}
      <div className="db-section">
        <h2 className="db-section-title">⚙️ InnoDB 核心机制</h2>
        <div className="db-grid-2">
          {[
            { title: 'Buffer Pool（缓冲池）', color: '#F29111', desc: 'InnoDB 最重要的内存组件，默认 128MB，生产建议设置为物理内存的 70-80%。热数据常驻内存，避免磁盘 I/O。', cmd: 'SET GLOBAL innodb_buffer_pool_size = 8*1024*1024*1024; -- 8GB' },
            { title: 'Redo Log 重做日志', color: '#fbbf24', desc: 'Write-Ahead Logging (WAL)：先写日志再写磁盘，保证 Durability（持久性）。即使宕机，重启后通过 redo log 恢复数据。', cmd: '# innodb_log_file_size=256M\n# innodb_flush_log_at_trx_commit=1 (最安全)' },
            { title: 'Undo Log 回滚日志', color: '#93c5fd', desc: '记录数据的历史版本，支持事务回滚和 MVCC 多版本并发控制，允许读写并发而不加锁（READ COMMITTED / REPEATABLE READ）。', cmd: 'ROLLBACK; -- 利用 undo log 撤销事务' },
            { title: 'MVCC 多版本并发', color: '#34d399', desc: '读操作看快照版本，写操作加行锁。解决"读-写"并发冲突，大幅提升并发性能。每行数据有 DB_TRX_ID 和 DB_ROLL_PTR 隐藏列。', cmd: 'SELECT @@transaction_isolation; -- REPEATABLE-READ' },
          ].map(m => (
            <div key={m.title} className="db-card" style={{ borderColor: `${m.color}25` }}>
              <h3 style={{ color: m.color }}>{m.title}</h3>
              <p>{m.desc}</p>
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: m.color, whiteSpace: 'pre' }}>{m.cmd}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 常用运维命令 */}
      <div className="db-section">
        <h2 className="db-section-title">🔧 DBA 常用运维命令</h2>
        <div className="db-card">
          <table className="db-table">
            <thead><tr><th>命令</th><th>用途</th></tr></thead>
            <tbody>
              {[
                ['SHOW PROCESSLIST;', '查看当前所有连接和正在执行的 SQL（排查锁等待）'],
                ['SHOW ENGINE INNODB STATUS\\G', '查看 InnoDB 状态，包括死锁信息'],
                ['SHOW VARIABLES LIKE \'%buffer%\';', '查看 Buffer Pool 等内存配置'],
                ['SELECT * FROM information_schema.INNODB_LOCKS;', '查看当前锁信息（8.0用 performance_schema）'],
                ['ANALYZE TABLE orders;', '更新表的统计信息（优化器依赖此选路）'],
                ['OPTIMIZE TABLE orders;', '回收碎片空间（大量删除后使用，会锁表）'],
                ['FLUSH HOSTS;', '清除连接错误记录（账号被锁定时使用）'],
              ].map(([cmd, desc]) => (
                <tr key={cmd}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#F29111' }}>{cmd}</code></td>
                  <td style={{ fontSize: '0.82rem', color: '#a08060' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="db-nav">
        <button className="db-btn" onClick={() => navigate('/course/database-mastery/lesson/fundamentals')}>← 上一模块</button>
        <button className="db-btn primary" onClick={() => navigate('/course/database-mastery/lesson/sqladvanced')}>下一模块：高级 SQL →</button>
      </div>
    </div>
  );
}
