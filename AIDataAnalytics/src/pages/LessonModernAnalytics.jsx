import React from 'react';
import './LessonCommon.css';

export default function LessonModernAnalytics() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">📊 模块一：现代数据分析基础 — Python 分析栈 / 统计思维 / 数据素养</h1>
      <p className="lesson-subtitle">
        在 AI 时代重新定义数据分析师的核心能力模型
      </p>

      <section className="lesson-section">
        <h2>1. AI 时代的数据分析师</h2>
        <div className="info-box">
          <h3>🔄 角色演变</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>维度</th><th>传统分析师</th><th>AI 时代分析师</th></tr>
            </thead>
            <tbody>
              <tr><td>SQL 查询</td><td>手写复杂 SQL</td><td>Text2SQL + 人工审核</td></tr>
              <tr><td>数据清洗</td><td>Pandas 手动处理</td><td>AI 自动检测 + 建议修复</td></tr>
              <tr><td>可视化</td><td>手选图表类型 + 调参</td><td>AI 推荐最佳可视化</td></tr>
              <tr><td>建模</td><td>手动特征工程 + 调参</td><td>AutoML + 人工解读</td></tr>
              <tr><td>报告</td><td>PPT/Word 手写分析</td><td>AI 生成初稿 + 人工洞察</td></tr>
              <tr><td>核心价值</td><td>执行力 (跑数)</td><td>判断力 (问对问题 + 讲好故事)</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>🎯 AI 时代分析师能力模型</h3>
          <div className="code-block">
{`# AI 时代数据分析师 T 型能力模型
"""
核心竞争力 (不可替代):
  ┌─────────────────────────────────────────┐
  │ 1. 业务理解力     — 问对问题 > 跑对数   │
  │ 2. 统计直觉       — 识别偏误 / 因果判断  │
  │ 3. 数据叙事力     — 洞察→故事→决策      │
  │ 4. AI 驾驭力      — Prompt→审核→迭代    │
  │ 5. 实验设计       — A/B Test / 因果推断  │
  └─────────────────────────────────────────┘

技术基础 (AI 可辅助但需掌握):
  ┌──────────┬──────────┬──────────┐
  │ SQL      │ Python   │ 统计学   │
  │ 数据建模 │ 可视化   │ ML 基础  │
  └──────────┴──────────┴──────────┘

工具链 (效率倍增器):
  ┌────────────┬────────────┬────────────┐
  │ Text2SQL   │ AutoML     │ AI Agent   │
  │ 智能 BI    │ AI 报告    │ 代码解释器 │
  └────────────┴────────────┴────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. Python 现代分析栈</h2>
        <div className="concept-card">
          <h3>🐍 2026 年 Python 分析技术栈</h3>
          <div className="code-block">
{`import polars as pl        # Pandas 替代: 10-100x 更快
import duckdb              # 内嵌分析型数据库
import plotly.express as px # 交互式可视化
import great_expectations as ge  # 数据质量

# ═══ Polars: 现代 DataFrame 库 ═══
# 比 Pandas 快 10-100x, 原生并行, 惰性求值
df = pl.read_csv("sales_data.csv")

# 惰性执行 (Lazy Evaluation) — 自动优化查询计划
result = (
    df.lazy()
    .filter(pl.col("date") >= "2025-01-01")
    .group_by("category", "region")
    .agg([
        pl.col("revenue").sum().alias("total_revenue"),
        pl.col("revenue").mean().alias("avg_revenue"),
        pl.col("order_id").n_unique().alias("unique_orders"),
        pl.col("quantity").sum().alias("total_qty"),
    ])
    .sort("total_revenue", descending=True)
    .head(20)
    .collect()  # 执行时才真正计算
)

# ═══ DuckDB: 嵌入式分析数据库 ═══
# 直接查询 CSV/Parquet/DataFrame, 无需导入
con = duckdb.connect()

# 直接 SQL 查询 Polars DataFrame
result = con.execute("""
    SELECT 
        category,
        SUM(revenue) as total_revenue,
        COUNT(DISTINCT customer_id) as unique_customers,
        AVG(order_value) as avg_order_value
    FROM df
    WHERE date >= '2025-01-01'
    GROUP BY category
    ORDER BY total_revenue DESC
""").pl()  # 返回 Polars DataFrame

# 直接查询 Parquet 文件 (无需加载到内存)
result = duckdb.sql("""
    SELECT * FROM read_parquet('s3://bucket/data/*.parquet')
    WHERE region = 'APAC'
""")

# ═══ Pandas vs Polars vs DuckDB 性能对比 ═══
"""
数据量: 1 亿行, 10 列, ~8GB CSV

┌──────────┬──────────┬──────────┬──────────┐
│ 操作     │ Pandas   │ Polars   │ DuckDB   │
├──────────┼──────────┼──────────┼──────────┤
│ 读取 CSV │ 45s      │ 4s       │ 3s       │
│ GroupBy  │ 12s      │ 0.8s     │ 0.5s     │
│ Join     │ 25s      │ 2s       │ 1.5s     │
│ 内存占用 │ 16GB     │ 8GB      │ 2GB      │
└──────────┴──────────┴──────────┴──────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 统计思维与常见陷阱</h2>
        <div className="info-box">
          <h3>⚠️ 数据分析常见统计陷阱</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>陷阱</th><th>描述</th><th>AI 时代应对</th></tr>
            </thead>
            <tbody>
              <tr><td>辛普森悖论</td><td>汇总结论 vs 分组结论相反</td><td>AI 自动分层分析 + 提醒</td></tr>
              <tr><td>幸存者偏差</td><td>只看到"活下来"的样本</td><td>LLM 辅助检查数据完整性</td></tr>
              <tr><td>相关≠因果</td><td>冰淇淋销量 ↔ 溺水率</td><td>因果推断框架 (DoWhy)</td></tr>
              <tr><td>P-hacking</td><td>反复测试找到 p&lt;0.05</td><td>预注册假设 + 多重校正</td></tr>
              <tr><td>选择偏差</td><td>样本不代表总体</td><td>AI 数据覆盖度检测</td></tr>
              <tr><td>过拟合</td><td>模型记忆噪声</td><td>AutoML 自动验证 + 交叉检验</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 数据素养框架</h2>
        <div className="concept-card">
          <h3>📐 DACI 数据素养模型</h3>
          <div className="code-block">
{`# DACI: Data-Aware, Context-Informed 数据素养框架
"""
Level 1 - Data Reader (读数据):
  ✓ 能看懂图表和报表
  ✓ 理解基本统计量 (均值/中位数/百分位)
  ✓ 识别明显异常值

Level 2 - Data Explorer (用数据):
  ✓ 能用 SQL/Python 自主取数
  ✓ 能做多维交叉分析
  ✓ 理解 A/B 测试结论

Level 3 - Data Analyst (析数据):
  ✓ 设计分析方案和指标体系
  ✓ 运用统计检验和建模
  ✓ 得出可行动的洞察 (Actionable Insight)

Level 4 - Data Storyteller (讲数据):
  ✓ 将数据洞察转化为业务故事
  ✓ 影响决策层采纳分析建议
  ✓ 构建数据驱动的文化

Level 5 - Data Strategist (驭数据):
  ✓ 定义数据战略和治理框架
  ✓ AI + 数据的全局规划
  ✓ 组织级数据能力建设
"""

# AI 如何赋能每个级别
ai_empowerment = {
    "L1 → L2": "Text2SQL 降低取数门槛",
    "L2 → L3": "AutoML + AI EDA 加速分析",
    "L3 → L4": "AI 自动报告 + 数据叙事辅助",
    "L4 → L5": "LLM Agent 构建分析自动化平台",
}`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 课程导航</span>
        <span className="nav-next">下一模块：Text2SQL →</span>
      </div>
    </div>
  );
}
