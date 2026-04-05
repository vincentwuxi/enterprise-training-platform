import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const JOIN_TYPES = [
  {
    name: 'INNER JOIN', icon: '⚫',
    desc: '只返回两表都有匹配的行（交集）',
    sql: `SELECT o.id, u.username, o.total, o.status
FROM   orders o
INNER  JOIN users u ON o.user_id = u.id
WHERE  o.created_at >= '2024-01-01';`,
    diagram: '  A ●──● B  →  返回 A∩B',
  },
  {
    name: 'LEFT JOIN', icon: '⬅️',
    desc: '返回左表全部，右表无匹配填 NULL',
    sql: `-- 查找没有下过单的用户（常用技巧）
SELECT u.id, u.username
FROM   users u
LEFT   JOIN orders o ON o.user_id = u.id
WHERE  o.id IS NULL;  -- 关键：过滤出 NULL = 从未下单`,
    diagram: '  ●──○     →  返回全部 A',
  },
  {
    name: '子查询', icon: '🔄',
    desc: '查询嵌套，分 IN/EXISTS/标量/相关四种类型',
    sql: `-- EXISTS（比 IN 在大数据集更高效）
SELECT * FROM users u
WHERE  EXISTS (
  SELECT 1 FROM orders o
  WHERE  o.user_id = u.id
    AND  o.total > 1000
);

-- 标量子查询（返回单值）
SELECT id, username,
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u;`,
    diagram: '  SELECT * FROM (SELECT…) sub',
  },
  {
    name: '窗口函数', icon: '🪟',
    desc: 'MySQL 8.0+，分析函数，不压缩行数',
    sql: `-- RANK：用户按消费总额排名
SELECT
  u.username,
  SUM(o.total)                  AS total_spent,
  RANK() OVER (
    ORDER BY SUM(o.total) DESC
  )                             AS spending_rank,
  -- 每个用户的订单占其消费总额的比例
  o.total * 100.0 / SUM(o.total) OVER (PARTITION BY o.user_id) AS pct
FROM orders o
JOIN users u ON u.id = o.user_id
GROUP BY u.id, u.username, o.id, o.total;`,
    diagram: 'OVER (PARTITION BY … ORDER BY …)',
  },
];

const ISOLATION_LEVELS = [
  { level: 'READ UNCOMMITTED', suffix: '读未提交', problems: ['脏读✅', '不可重复读✅', '幻读✅'], concurrency: 95, usecase: '几乎不用，数据不可靠' },
  { level: 'READ COMMITTED',   suffix: '读已提交', problems: ['脏读❌', '不可重复读✅', '幻读✅'], concurrency: 80, usecase: 'PostgreSQL 默认，大多数场景' },
  { level: 'REPEATABLE READ',  suffix: '可重复读', problems: ['脏读❌', '不可重复读❌', '幻读⚠️'], concurrency: 60, usecase: 'MySQL 默认（InnoDB用Gap Lock解决幻读）' },
  { level: 'SERIALIZABLE',     suffix: '串行化',   problems: ['脏读❌', '不可重复读❌', '幻读❌'], concurrency: 10, usecase: '最安全，但并发极低，金融核心系统' },
];

export default function LessonSQLAdvanced() {
  const navigate = useNavigate();
  const [activeJoin, setActiveJoin] = useState(0);
  const [txDemo, setTxDemo] = useState(0);

  const TX_STEPS = [
    { step: '开始事务', sql: 'BEGIN;  -- 或 START TRANSACTION;', note: '开启事务，后续操作可回滚' },
    { step: '操作A：扣款', sql: "UPDATE accounts SET balance = balance - 500\nWHERE user_id = 1 AND balance >= 500;", note: '先检查余额再扣减，防止负数' },
    { step: '校验行数', sql: '-- 检查是否真的扣了1行\nSELECT ROW_COUNT(); -- 必须为 1，否则 ROLLBACK', note: 'ROW_COUNT() 验证更新是否成功' },
    { step: '操作B：入账', sql: "UPDATE accounts SET balance = balance + 500\nWHERE user_id = 2;", note: '目标账户入账' },
    { step: '提交或回滚', sql: 'COMMIT;   -- 两步都成功才提交\n-- 或\nROLLBACK; -- 任何一步失败则全部撤销', note: 'ACID 原子性的关键' },
  ];

  return (
    <div className="lesson-db">
      <div className="db-badge">🔗 module_03 — 高级 SQL</div>

      <div className="db-hero">
        <h1>高级 SQL：JOIN、事务与窗口函数</h1>
        <p>掌握 JOIN 和窗口函数，你的 SQL 能力从"能用"跃升到"专业"。理解事务隔离级别，你就能正确处理并发场景下的数据一致性问题。</p>
      </div>

      {/* JOIN 交互演示 */}
      <div className="db-section">
        <h2 className="db-section-title">🔗 JOIN / 子查询 / 窗口函数</h2>
        <div className="db-interactive">
          <h3>
            选择查询类型
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {JOIN_TYPES.map((j, i) => (
                <button key={i} className={`db-btn ${activeJoin === i ? 'primary' : ''}`}
                  onClick={() => setActiveJoin(i)} style={{ fontSize: '0.8rem' }}>
                  {j.icon} {j.name}
                </button>
              ))}
            </div>
          </h3>
          <div style={{ fontSize: '0.82rem', color: '#a08060', marginBottom: '0.5rem' }}>
            <strong style={{ color: '#fbbf24' }}>原理：</strong>{JOIN_TYPES[activeJoin].desc}
            <span style={{ marginLeft: '1rem', fontFamily: 'JetBrains Mono', color: '#F29111', fontSize: '0.75rem' }}>{JOIN_TYPES[activeJoin].diagram}</span>
          </div>
          <div className="db-sql-wrapper">
            <div className="db-sql-header">
              <div className="db-sql-dot" style={{ background: '#ef4444' }} />
              <div className="db-sql-dot" style={{ background: '#f59e0b' }} />
              <div className="db-sql-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>MySQL 8.0</span>
            </div>
            <div className="db-sql" style={{ maxHeight: 260, overflow: 'auto' }}>{JOIN_TYPES[activeJoin].sql}</div>
          </div>
        </div>
      </div>

      {/* 事务演示 */}
      <div className="db-section">
        <h2 className="db-section-title">💸 事务实战：银行转账（步进演示）</h2>
        <div className="db-interactive">
          <h3>
            转账流程步骤 {txDemo + 1}/{TX_STEPS.length}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="db-btn" onClick={() => setTxDemo(t => Math.max(0, t-1))} disabled={txDemo === 0}>← 上一步</button>
              <button className="db-btn primary" onClick={() => setTxDemo(t => Math.min(TX_STEPS.length-1, t+1))} disabled={txDemo === TX_STEPS.length-1}>下一步 →</button>
              <button className="db-btn" onClick={() => setTxDemo(0)}>重置</button>
            </div>
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', marginBottom: '0.75rem' }}>
            {TX_STEPS.map((s, i) => (
              <div key={i} style={{ flexShrink: 0, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: i === txDemo ? 'rgba(242,145,17,0.2)' : i < txDemo ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === txDemo ? 'rgba(242,145,17,0.4)' : i < txDemo ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`, color: i === txDemo ? '#F29111' : i < txDemo ? '#34d399' : '#4a3b28' }}>
                {i < txDemo ? '✓ ' : ''}{s.step}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#4a3b28', marginBottom: '0.5rem' }}>💡 {TX_STEPS[txDemo].note}</div>
          <div className="db-sql-wrapper">
            <div className="db-sql-header">
              <div className="db-sql-dot" style={{ background: '#ef4444' }} />
              <div className="db-sql-dot" style={{ background: '#f59e0b' }} />
              <div className="db-sql-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>Step {txDemo+1}: {TX_STEPS[txDemo].step}</span>
            </div>
            <div className="db-sql">{TX_STEPS[txDemo].sql}</div>
          </div>
        </div>
      </div>

      {/* 事务隔离级别 */}
      <div className="db-section">
        <h2 className="db-section-title">🔒 事务隔离级别对比</h2>
        <div className="db-card">
          <table className="db-table">
            <thead><tr><th>隔离级别</th><th>脏读</th><th>不可重复读</th><th>幻读</th><th>并发能力</th><th>适用场景</th></tr></thead>
            <tbody>
              {ISOLATION_LEVELS.map(l => (
                <tr key={l.level}>
                  <td>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#F29111' }}>{l.level}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4a3b28' }}>{l.suffix}</div>
                  </td>
                  {l.problems.map((p, i) => (
                    <td key={i} style={{ fontSize: '0.8rem', textAlign: 'center' }}>{p}</td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="db-meter" style={{ flex: 1 }}>
                        <div className="db-meter-fill" style={{ width: `${l.concurrency}%`, background: l.concurrency > 70 ? '#10b981' : l.concurrency > 30 ? '#fbbf24' : '#ef4444' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#4a3b28', minWidth: 30 }}>{l.concurrency}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#a08060' }}>{l.usecase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="db-nav">
        <button className="db-btn" onClick={() => navigate('/course/database-mastery/lesson/mysql')}>← 上一模块</button>
        <button className="db-btn primary" onClick={() => navigate('/course/database-mastery/lesson/index')}>下一模块：索引与优化 →</button>
      </div>
    </div>
  );
}
