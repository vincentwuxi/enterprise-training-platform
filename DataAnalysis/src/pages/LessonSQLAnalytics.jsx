import React, { useState } from 'react';
import './LessonCommon.css';

const QUERIES = [
  {
    id: 'window',
    label: '窗口函数',
    scenario: '计算每个用户的累计消费、30日移动均值和环比增长',
    code: `-- ── 窗口函数三件套 ────────────────────────────
SELECT
    user_id,
    order_date,
    amount,

    -- ① 累计求和（不分区：全局，分区：每用户）
    SUM(amount) OVER (
        PARTITION BY user_id
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_sum,

    -- ② 移动平均（最近30天）
    AVG(amount) OVER (
        PARTITION BY user_id
        ORDER BY order_date
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) AS ma_30d,

    -- ③ 环比（与上一行比较）
    LAG(amount, 1, 0) OVER (PARTITION BY user_id ORDER BY order_date) AS prev_amount,
    ROUND(
        (amount - LAG(amount,1,0) OVER (PARTITION BY user_id ORDER BY order_date))
        * 100.0 / NULLIF(LAG(amount,1,0) OVER (PARTITION BY user_id ORDER BY order_date), 0),
        2
    ) AS mom_pct

FROM orders
WHERE order_date >= '2024-01-01';`,
    output: `user_id  order_date  amount  cumulative_sum  ma_30d   prev   mom_pct
U001     2024-01-05    1200          1200   1200.00      0      NULL
U001     2024-01-18     800          2000   1000.00   1200    -33.33
U001     2024-02-10    1500          3500   1166.67    800     87.50
U002     2024-01-08     600           600    600.00      0      NULL`,
    tip: 'NULLIF 防止除零报错；LAG/LEAD 第三参数是缺省值，避免 NULL 传染',
  },
  {
    id: 'cohort',
    label: '留存 Cohort',
    scenario: '按注册月份计算次月/三月用户留存率（SaaS 核心指标）',
    code: `-- ── 用户留存率 Cohort 分析 ─────────────────────
WITH cohort AS (
    -- 每个用户的注册月（队列）
    SELECT
        user_id,
        DATE_TRUNC('month', created_at) AS cohort_month
    FROM users
),
activity AS (
    -- 每个用户每次活跃的月份
    SELECT DISTINCT
        user_id,
        DATE_TRUNC('month', activity_date) AS active_month
    FROM user_activity
),
cohort_activity AS (
    SELECT
        c.cohort_month,
        a.active_month,
        COUNT(DISTINCT a.user_id) AS active_users,
        -- 相差月数
        DATE_DIFF('month', c.cohort_month, a.active_month) AS month_offset
    FROM cohort c
    JOIN activity a USING (user_id)
    WHERE a.active_month >= c.cohort_month
    GROUP BY 1, 2, 4
),
cohort_size AS (
    SELECT cohort_month, COUNT(DISTINCT user_id) AS total_users
    FROM cohort GROUP BY 1
)
SELECT
    ca.cohort_month,
    ca.month_offset,
    ROUND(ca.active_users * 100.0 / cs.total_users, 1) AS retention_rate
FROM cohort_activity ca
JOIN cohort_size cs USING (cohort_month)
ORDER BY 1, 2;`,
    output: `cohort_month  month_offset  retention_rate
2024-01          0           100.0   ← 注册当月
2024-01          1            62.3   ← 次月留存
2024-01          2            44.7   ← 三月留存
2024-01          3            38.1
2024-02          0           100.0
2024-02          1            58.9`,
    tip: 'Cohort 分析核心：先找"队列定义"（注册月），再找"活跃事件"，两者通过 user_id 连接',
  },
  {
    id: 'funnel',
    label: '漏斗分析',
    scenario: '电商转化漏斗：访问→加购→下单→支付的逐步转化率',
    code: `-- ── 转化漏斗（严格顺序）────────────────────────
WITH events AS (
    SELECT user_id, event_type, event_time
    FROM user_events
    WHERE event_date = '2024-03-15'
      AND event_type IN ('page_view','add_cart','checkout','payment')
),
funnel AS (
    SELECT
        -- 步骤1：访问
        COUNT(DISTINCT CASE WHEN event_type='page_view' THEN user_id END) AS s1_visit,
        -- 步骤2：加购（必须有过访问）
        COUNT(DISTINCT CASE
            WHEN event_type='add_cart'
              AND EXISTS (SELECT 1 FROM events e2
                          WHERE e2.user_id=events.user_id
                            AND e2.event_type='page_view'
                            AND e2.event_time < events.event_time)
            THEN user_id END
        ) AS s2_cart,
        -- 步骤3：下单
        COUNT(DISTINCT CASE WHEN event_type='checkout' THEN user_id END) AS s3_checkout,
        -- 步骤4: 支付
        COUNT(DISTINCT CASE WHEN event_type='payment' THEN user_id END) AS s4_payment
    FROM events
)
SELECT
    s1_visit  AS "1.访问",
    s2_cart   AS "2.加购",
    s3_checkout AS "3.下单",
    s4_payment  AS "4.支付",
    ROUND(s2_cart*100.0/s1_visit,1)     AS "访问→加购%",
    ROUND(s3_checkout*100.0/s2_cart,1)  AS "加购→下单%",
    ROUND(s4_payment*100.0/s3_checkout,1) AS "下单→支付%",
    ROUND(s4_payment*100.0/s1_visit,1)  AS "整体转化%"
FROM funnel;`,
    output: `1.访问  2.加购  3.下单  4.支付  访问→加购%  加购→下单%  下单→支付%  整体转化%
52841   18974    9821    8234      35.9%      51.8%      83.8%     15.6%

🔍 瓶颈：访问→加购 转化率最低，优先优化商品详情页和加购按钮`,
    tip: '漏斗分析的关键不是最终转化率，而是找到掉落最大的"瓶颈步骤"优先优化',
  },
  {
    id: 'ranking',
    label: '排名分析',
    scenario: '找出每个品类销售额 TOP3 商品，以及各区域业绩排名',
    code: `-- ── ROW_NUMBER / RANK / DENSE_RANK ────────────
SELECT
    category,
    product_name,
    total_sales,
    -- 相同销售额时排名不同（跳号）
    RANK() OVER (PARTITION BY category ORDER BY total_sales DESC) AS rk,
    -- 相同销售额时排名相同（不跳号）
    DENSE_RANK() OVER (PARTITION BY category ORDER BY total_sales DESC) AS dense_rk,
    -- 强制不同排名（用于去重取一条）
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY total_sales DESC) AS row_num
FROM (
    SELECT category, product_name, SUM(amount) AS total_sales
    FROM orders JOIN products USING(product_id)
    WHERE order_date >= '2024-01-01'
    GROUP BY 1, 2
) t
QUALIFY ROW_NUMBER() OVER (PARTITION BY category ORDER BY total_sales DESC) <= 3
ORDER BY category, rk;

-- ── NTILE：按销售额分四分位 ─────────────────────
SELECT *, NTILE(4) OVER (ORDER BY total_sales) AS quartile
FROM sales_summary;  -- 1=最低25%，4=最高25%`,
    output: `category      product_name    total_sales   rk  dense_rk
Electronics   iPhone 15 Pro     2,840,000    1     1
Electronics   MacBook Air       1,920,000    2     2
Electronics   AirPods Pro         980,000    3     3
Clothing      Nike Air Max        560,000    1     1
Clothing      Levi's 501          420,000    2     2`,
    tip: 'QUALIFY 是 BigQuery/Snowflake 语法，等价于 WHERE row_num <= 3 套一层子查询',
  },
];

export default function LessonSQLAnalytics() {
  const [tab, setTab] = useState(0);
  const q = QUERIES[tab];

  return (
    <div className="da-lesson">
      <div className="da-hero">
        <div className="da-hero-badge">🗄️ 模块二</div>
        <h1>SQL 进阶分析 — 窗口函数与复杂查询</h1>
        <p>超越 SELECT * FROM table。掌握窗口函数、留存 Cohort、漏斗分析、排名函数——这是数据分析师与"会写 SQL"工程师的本质区别。</p>
      </div>

      <div className="da-goals">
        {[
          { icon:'🪟', title:'窗口函数', desc:'ROW_NUMBER / RANK / SUM OVER PARTITION BY' },
          { icon:'📅', title:'留存分析', desc:'Cohort 建模，计算 D1/D7/D30 留存率' },
          { icon:'🔽', title:'漏斗分析', desc:'严格顺序事件转化率计算' },
          { icon:'🏆', title:'排名 & 分位', desc:'RANK / DENSE_RANK / NTILE 应用场景' },
        ].map(g => <div className="da-goal" key={g.title}><div className="da-goal-icon">{g.icon}</div><div><h3>{g.title}</h3><p>{g.desc}</p></div></div>)}
      </div>

      <div className="da-sim">
        <div className="da-sim-title">🔍 业务场景 SQL 实战</div>
        <div className="da-tab-bar">
          {QUERIES.map((q2, i) => <button key={q2.id} className={`da-tab${tab===i?' active':''}`} onClick={() => setTab(i)}>{q2.label}</button>)}
        </div>

        <div className="da-tip" style={{marginBottom:'1rem'}}>
          <strong>📋 业务场景</strong>
          <p>{q.scenario}</p>
        </div>

        <div className="da-code">
          <div className="da-code-header"><span className="da-code-lang">SQL</span></div>
          <pre>{q.code}</pre>
        </div>

        <div className="da-output">
          <span className="out-label">▶ 查询结果</span>
          {q.output}
        </div>

        <div className="da-warn">
          <strong>⚡ 分析师提示</strong>
          <p>{q.tip}</p>
        </div>
      </div>

      {/* 窗口函数速查表 */}
      <div className="da-section-title">📖 窗口函数速查表</div>
      <div className="da-table-wrap">
        <table className="da-table">
          <thead><tr><th>函数</th><th>用途</th><th>常用场景</th></tr></thead>
          <tbody>
            {[
              ['ROW_NUMBER()', '唯一行号（不重复）', '去重取一条最新记录'],
              ['RANK()', '相同值同排名，跳号', '竞赛排名，允许并列'],
              ['DENSE_RANK()', '相同值同排名，不跳', '品类 TOP N，连续排名'],
              ['LAG(col, n)', '向上取第 n 行', '环比、同比计算'],
              ['LEAD(col, n)', '向下取第 n 行', '预测下行值、间隔分析'],
              ['SUM / AVG OVER', '滑动窗口聚合', '累计值、移动均值'],
              ['NTILE(n)', '平均分成 n 组', '分位分析、用户分层'],
              ['FIRST_VALUE / LAST_VALUE', '窗口首末值', '与初始值比较增长'],
            ].map(([fn,yt,sc]) => (
              <tr key={fn}>
                <td><code style={{color:'var(--da-primary)',fontSize:'.8rem'}}>{fn}</code></td>
                <td style={{color:'var(--da-text)'}}>{yt}</td>
                <td style={{color:'var(--da-muted)'}}>{sc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="da-tip">
        <strong>🚀 性能优化：窗口函数 vs GROUP BY</strong>
        <p>窗口函数不压缩行数，适合"保留明细+添加聚合值"场景。如果只需汇总结果，GROUP BY 性能更好。大数据量时先过滤（WHERE）再开窗口，避免全表扫描。</p>
      </div>
    </div>
  );
}
