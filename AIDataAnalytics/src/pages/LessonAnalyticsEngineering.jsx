import React from 'react';
import './LessonCommon.css';

export default function LessonAnalyticsEngineering() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🏗️ 模块八：分析工程化 — 数据建模 / 指标体系 / dbt / 分析部署</h1>
      <p className="lesson-subtitle">
        从一次性分析到可复用、可维护、可信赖的分析工程体系
      </p>

      <section className="lesson-section">
        <h2>1. 分析工程 (Analytics Engineering)</h2>
        <div className="concept-card">
          <h3>🔄 分析工程的角色定位</h3>
          <div className="code-block">
{`# 分析工程: 数据工程与数据分析的交叉学科
"""
数据工程师:   关心数据怎么流动 (管道/基础设施)
数据分析师:   关心数据说了什么 (洞察/报告)
分析工程师:   关心数据怎么被组织和理解 (建模/指标/质量)

核心职责:
  1. 数据建模:  设计分析友好的数据模型
  2. 指标定义:  统一指标口径, 消除"数据打架"
  3. 数据质量:  定义和监控数据 SLA
  4. 文档:      数据目录 + 血缘关系
  5. Self-serve: 让业务能自助取数

技术栈:
  ┌──────────┬──────────┬──────────┐
  │ dbt      │ 数据建模  │ SQL 转换 │
  │ Great Ex │ 数据质量  │ 约束验证 │
  │ DataHub  │ 数据目录  │ 元数据   │
  │ Airflow  │ 调度编排  │ DAG 管理 │
  │ Looker   │ 指标层    │ Semantic │
  └──────────┴──────────┴──────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. dbt — 分析工程核心</h2>
        <div className="concept-card">
          <h3>🔧 dbt (data build tool) 实战</h3>
          <div className="code-block">
{`# dbt: 用 SQL 编写数据转换, 像软件工程一样管理
"""
目录结构:
  dbt_project/
  ├── models/
  │   ├── staging/          # 数据清洗层
  │   │   ├── stg_orders.sql
  │   │   └── stg_customers.sql
  │   ├── intermediate/     # 业务逻辑层
  │   │   └── int_order_items.sql
  │   └── marts/            # 消费层 (面向分析)
  │       ├── dim_customers.sql
  │       ├── fct_orders.sql
  │       └── metrics/
  │           └── revenue.yml
  ├── tests/                # 数据测试
  ├── macros/               # 可复用 SQL 模板
  └── dbt_project.yml
"""

# ═══ Staging 层: 数据标准化 ═══
# models/staging/stg_orders.sql
stg_orders_sql = """
WITH source AS (
    SELECT * FROM {{ source('raw', 'orders') }}
),

renamed AS (
    SELECT
        id AS order_id,
        customer_id,
        CAST(order_date AS DATE) AS order_date,
        CAST(total_amount AS DECIMAL(10,2)) AS order_amount,
        LOWER(status) AS order_status,
        created_at,
        updated_at
    FROM source
    WHERE id IS NOT NULL
      AND total_amount > 0
)

SELECT * FROM renamed
"""

# ═══ Marts 层: 业务实体 ═══
# models/marts/fct_orders.sql
fct_orders_sql = """
WITH orders AS (
    SELECT * FROM {{ ref('stg_orders') }}
),

items AS (
    SELECT * FROM {{ ref('int_order_items') }}
),

final AS (
    SELECT
        o.order_id,
        o.customer_id,
        o.order_date,
        o.order_amount,
        COUNT(i.item_id) AS item_count,
        SUM(i.quantity) AS total_quantity,
        -- 衍生指标
        o.order_amount / NULLIF(COUNT(i.item_id), 0) AS avg_item_price,
        DATEDIFF('day', c.first_order_date, o.order_date) AS days_since_first_order,
        CASE
            WHEN o.order_amount >= 1000 THEN 'high_value'
            WHEN o.order_amount >= 200 THEN 'medium_value'
            ELSE 'low_value'
        END AS order_tier
    FROM orders o
    LEFT JOIN items i ON o.order_id = i.order_id
    LEFT JOIN {{ ref('dim_customers') }} c ON o.customer_id = c.customer_id
    GROUP BY 1, 2, 3, 4, c.first_order_date
)

SELECT * FROM final
"""

# ═══ 数据测试 ═══
# models/marts/fct_orders.yml
schema_yml = """
models:
  - name: fct_orders
    description: "订单事实表"
    columns:
      - name: order_id
        description: "订单唯一标识"
        tests:
          - unique
          - not_null
      - name: order_amount
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 1000000
"""

# 运行 dbt
"""
dbt run          # 执行所有模型
dbt test         # 运行数据测试
dbt docs generate # 生成文档 + 血缘图
dbt docs serve   # 本地查看文档
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 指标体系设计</h2>
        <div className="concept-card">
          <h3>📐 统一指标层 (Semantic Layer)</h3>
          <div className="code-block">
{`# 指标体系: 解决"数据打架"问题
"""
问题: 
  - 市场部说本月 GMV 1200 万
  - 财务部说本月 GMV 1050 万
  - 原因: 口径不一致 (含税/不含税, 退款是否扣除, 时间截止点)

解决: 统一指标层 (Single Source of Truth)
"""

# dbt Metrics (语义层定义)
metrics_yml = """
semantic_models:
  - name: orders
    model: ref('fct_orders')
    
    entities:
      - name: order_id
        type: primary
      - name: customer_id
        type: foreign
    
    dimensions:
      - name: order_date
        type: time
        type_params:
          time_granularity: day
      - name: order_tier
        type: categorical

    measures:
      - name: order_count
        agg: count
        expr: order_id
      - name: total_revenue
        agg: sum
        expr: order_amount
      - name: avg_order_value
        agg: average
        expr: order_amount

metrics:
  - name: revenue
    description: "总营收 (扣除退款, 不含税)"
    type: simple
    type_params:
      measure: total_revenue
    filter: |
      {{ Dimension('order_status') }} = 'completed'
  
  - name: revenue_growth
    description: "营收同比增长率"
    type: derived
    type_params:
      expr: (current_revenue - previous_revenue) / previous_revenue
      metrics:
        - name: current_revenue
          offset_window: 0
        - name: previous_revenue
          offset_window: 1
          offset_to_grain: year
"""

# 指标体系分层
"""
┌──────────────────────────────────────┐
│  L1 北极星指标 (North Star)          │
│  · 月活跃用户数 (MAU)                │
│  · 月经常性收入 (MRR)                │
├──────────────────────────────────────┤
│  L2 核心业务指标                     │
│  · 新客获取: CAC, 注册转化率        │
│  · 用户留存: D1/D7/D30 留存         │
│  · 商业化: ARPU, LTV, 付费转化率    │
├──────────────────────────────────────┤
│  L3 过程指标                         │
│  · 产品: 功能使用率, 页面停留时长   │
│  · 运营: 活动参与率, 推送到达率     │
│  · 技术: 延迟, 可用性, 错误率       │
└──────────────────────────────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 数据质量与治理</h2>
        <div className="info-box">
          <h3>📋 数据质量 SLA 体系</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>维度</th><th>定义</th><th>检测方法</th><th>工具</th></tr>
            </thead>
            <tbody>
              <tr><td>完整性</td><td>缺失值比例 &lt; X%</td><td>NULL 检查 / 覆盖率</td><td>Great Expectations</td></tr>
              <tr><td>准确性</td><td>数据与真实值一致</td><td>交叉验证 / 抽样审计</td><td>Soda Core</td></tr>
              <tr><td>一致性</td><td>多系统数据对齐</td><td>跨源对账</td><td>dbt tests</td></tr>
              <tr><td>时效性</td><td>数据延迟 &lt; N 分钟</td><td>新鲜度监控</td><td>Monte Carlo</td></tr>
              <tr><td>唯一性</td><td>无重复记录</td><td>唯一键检查</td><td>dbt unique test</td></tr>
              <tr><td>有效性</td><td>值在合法范围内</td><td>范围/格式/枚举检查</td><td>Great Expectations</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：实时 BI</span>
        <span></span>
      </div>
    </div>
  );
}
