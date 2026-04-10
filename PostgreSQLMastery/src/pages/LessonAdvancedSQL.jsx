import { useState } from 'react';
import './LessonCommon.css';

const CODE_WINDOW = `-- ━━━━ 高级 SQL：窗口函数 ━━━━
-- 窗口函数 = 不分组的聚合，保留每一行

-- ━━━━ 1. 基础窗口函数 ━━━━
-- 每个员工的工资 + 部门平均工资
SELECT
  name, department, salary,
  AVG(salary) OVER (PARTITION BY department) AS dept_avg,
  salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg
FROM employees;
-- Alice | Engineering | 120000 | 110000 | 10000
-- Bob   | Engineering | 100000 | 110000 | -10000

-- ━━━━ 2. ROW_NUMBER / RANK / DENSE_RANK ━━━━
-- 每个部门薪资排名
SELECT
  name, department, salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn,
  RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS drnk
FROM employees;
-- ROW_NUMBER: 1,2,3,4 (永不重复)
-- RANK:       1,1,3,4 (并列跳号)
-- DENSE_RANK: 1,1,2,3 (并列不跳号)

-- 用 ROW_NUMBER 取每组第一名（经典面试题）
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY department ORDER BY salary DESC
  ) AS rn
  FROM employees
) t WHERE rn = 1;

-- ━━━━ 3. LAG / LEAD（前后行对比）━━━━
-- 每月收入环比增长
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_month,
  revenue - LAG(revenue) OVER (ORDER BY month) AS growth,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month))::numeric
    / LAG(revenue) OVER (ORDER BY month) * 100, 2
  ) AS growth_pct
FROM monthly_revenue;

-- ━━━━ 4. 累计求和 / 移动平均 ━━━━
SELECT
  date, amount,
  SUM(amount) OVER (ORDER BY date) AS running_total,
  AVG(amount) OVER (
    ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d
FROM daily_sales;`;

const CODE_CTE = `-- ━━━━ CTE / LATERAL / JSONB / 全文搜索 ━━━━

-- ━━━━ 1. CTE（公用表表达式）━━━━
-- 递归 CTE：组织架构树
WITH RECURSIVE org_tree AS (
  -- 基础条件：CEO（没有 manager）
  SELECT id, name, manager_id, 1 AS level, name::text AS path
  FROM employees WHERE manager_id IS NULL

  UNION ALL

  -- 递归：找下属
  SELECT e.id, e.name, e.manager_id, t.level + 1,
         t.path || ' → ' || e.name
  FROM employees e
  JOIN org_tree t ON e.manager_id = t.id
)
SELECT * FROM org_tree ORDER BY path;
-- 1 | CEO Alice   | NULL | 1 | Alice
-- 2 | VP Bob      | 1    | 2 | Alice → Bob
-- 3 | Mgr Charlie | 2    | 3 | Alice → Bob → Charlie

-- ━━━━ 2. LATERAL JOIN ━━━━
-- 每个用户最近 3 笔订单（子查询可引用外层）
SELECT u.name, recent.*
FROM users u
CROSS JOIN LATERAL (
  SELECT order_id, amount, created_at
  FROM orders o
  WHERE o.user_id = u.id
  ORDER BY created_at DESC
  LIMIT 3
) recent;

-- ━━━━ 3. JSONB（文档查询）━━━━
-- PG = 关系数据库 + NoSQL 文档数据库
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  attrs JSONB  -- 灵活属性
);

INSERT INTO products (name, attrs) VALUES
  ('MacBook', '{"cpu":"M3","ram":16,"ports":["USB-C","HDMI"]}'),
  ('ThinkPad', '{"cpu":"i7","ram":32,"ports":["USB-A","USB-C"]}');

-- 查询 JSON 字段
SELECT name, attrs->>'cpu' AS cpu, attrs->>'ram' AS ram
FROM products WHERE attrs->>'ram' = '32';

-- 数组包含查询
SELECT name FROM products
WHERE attrs->'ports' @> '"HDMI"';

-- JSONB 索引（GIN 索引支持 @> 操作符）
CREATE INDEX idx_product_attrs ON products USING GIN (attrs);

-- ━━━━ 4. 全文搜索 ━━━━
-- PG 内置全文搜索，小规模不需要 Elasticsearch
SELECT title, ts_rank(to_tsvector('english', body), query) AS rank
FROM posts, to_tsquery('english', 'database & performance') query
WHERE to_tsvector('english', body) @@ query
ORDER BY rank DESC;

-- GIN 索引加速全文搜索
CREATE INDEX idx_post_fts ON posts
  USING GIN (to_tsvector('english', body));`;

export default function LessonAdvancedSQL() {
  const [tab, setTab] = useState('window');
  const tabs = [
    { key: 'window', label: '📊 窗口函数', code: CODE_WINDOW },
    { key: 'cte',    label: '🔄 CTE / JSONB / 全文搜索', code: CODE_CTE },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="pg-lesson">
      <div className="pg-hero">
        <div className="pg-badge">// MODULE 02 · ADVANCED SQL</div>
        <h1>高级 SQL</h1>
        <p>SQL 不只是 SELECT * FROM——<strong>窗口函数做排名/环比/移动平均不需要子查询，递归 CTE 遍历树形结构，JSONB 让 PG 兼具 NoSQL 文档能力，内置全文搜索替代 Elasticsearch</strong>。</p>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📝 高级 SQL</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`pg-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="pg-code-wrap">
          <div className="pg-code-head">
            <div className="pg-code-dot" style={{ background: '#ef4444' }} /><div className="pg-code-dot" style={{ background: '#f59e0b' }} /><div className="pg-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'window' ? 'window_functions.sql' : 'advanced.sql'}</span>
          </div>
          <div className="pg-code">{t.code}</div>
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">🧰 高级 SQL 速查</div>
        <div className="pg-grid-3">
          {[
            { name: '窗口函数', ops: 'ROW_NUMBER / RANK / LAG / SUM OVER', use: '排名/环比/累计', color: '#336791' },
            { name: 'CTE', ops: 'WITH / WITH RECURSIVE', use: '复杂查询/树遍历', color: '#4f46e5' },
            { name: 'LATERAL', ops: 'CROSS JOIN LATERAL', use: '每组 Top-N', color: '#06b6d4' },
            { name: 'JSONB', ops: '->  ->>  @>  ?', use: 'NoSQL 文档查询', color: '#10b981' },
            { name: '全文搜索', ops: 'tsvector / tsquery', use: '小规模替代 ES', color: '#f97316' },
            { name: 'GROUPING SETS', ops: 'ROLLUP / CUBE', use: '多维度聚合报表', color: '#7c3aed' },
          ].map((f, i) => (
            <div key={i} className="pg-card" style={{ borderTop: `2px solid ${f.color}` }}>
              <div style={{ fontWeight: 700, color: f.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{f.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontFamily: 'JetBrains Mono,monospace', marginBottom: '0.3rem' }}>{f.ops}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pg-muted)' }}>🎯 {f.use}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
