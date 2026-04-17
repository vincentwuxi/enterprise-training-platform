import React from 'react';
import './LessonCommon.css';

export default function LessonSmartVisualization() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">📈 模块五：智能可视化与数据叙事 — AI 图表 / 自动报告 / 数据故事</h1>
      <p className="lesson-subtitle">
        从数据到洞察再到行动，用 AI 讲好数据故事
      </p>

      <section className="lesson-section">
        <h2>1. 智能图表推荐</h2>
        <div className="concept-card">
          <h3>📊 AI 驱动的可视化选择</h3>
          <div className="code-block">
{`# 传统: 分析师手选图表类型
# AI: 根据数据特征 + 分析目的自动推荐

# Lux: 智能可视化推荐
import lux
import pandas as pd

df = pd.read_csv("sales_data.csv")
# Lux 自动分析数据, 推荐最佳可视化
df.intent = ["revenue", "category"]  # 指定分析意图
df  # Jupyter 中自动显示多种推荐图表

# LLM 驱动的图表生成
def smart_chart(df, question: str):
    """根据自然语言问题自动生成最佳图表"""
    prompt = f"""
    数据集列: {list(df.columns)}
    数据类型: {df.dtypes.to_dict()}
    数值统计: {df.describe().to_dict()}
    
    用户问题: {question}
    
    请生成 Python Plotly 代码来回答这个问题。
    选择最适合的图表类型:
    - 趋势: 折线图 (px.line)
    - 比较: 柱状图 (px.bar) / 分组柱状图
    - 分布: 直方图 (px.histogram) / 箱线图 (px.box)
    - 占比: 饼图 (px.pie) / 堆叠柱状图
    - 关系: 散点图 (px.scatter) / 热力图
    - 地理: 地图 (px.choropleth)
    
    只输出代码, 用 fig.show() 结尾。
    """
    code = llm_generate(prompt)
    exec(code)

# 图表选择决策树
"""
数据关系 → 图表类型:
  
  变化趋势 → 折线图 / 面积图
  ├── 多系列 → 多折线 / 小倍图
  └── 预测   → 折线 + 置信区间

  大小比较 → 柱状图 / 条形图
  ├── 排名   → 水平柱状图
  └── 分组   → 分组柱状图 / 雷达图

  占比构成 → 饼图 / 环形图 / 堆叠柱状图
  ├── 层级   → 树状图 (Treemap)
  └── 演变   → 堆叠面积图

  分布形态 → 直方图 / 密度图 / 箱线图
  ├── 二维   → 散点图 + 密度等高线
  └── 多组   → 小提琴图 / Ridge plot

  关联关系 → 散点图 / 气泡图
  ├── 矩阵   → 热力图 / 相关矩阵
  └── 网络   → 力导向图 / 桑基图
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 现代可视化技术栈</h2>
        <div className="info-box">
          <h3>🛠️ 2026 可视化工具对比</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>工具</th><th>类型</th><th>交互性</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>Plotly / Dash</td><td>Python + Web</td><td>★★★★★</td><td>交互式仪表板</td></tr>
              <tr><td>Streamlit</td><td>Python Web App</td><td>★★★★</td><td>快速数据应用</td></tr>
              <tr><td>Observable</td><td>JS Notebook</td><td>★★★★★</td><td>数据新闻 / D3.js</td></tr>
              <tr><td>Apache ECharts</td><td>JS 库</td><td>★★★★★</td><td>企业仪表板 (国产)</td></tr>
              <tr><td>Tableau / Power BI</td><td>BI 工具</td><td>★★★★</td><td>企业级报告</td></tr>
              <tr><td>Grafana</td><td>监控面板</td><td>★★★★</td><td>实时监控 / 运维</td></tr>
              <tr><td>Evidence</td><td>Markdown BI</td><td>★★★</td><td>代码驱动报告</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>🚀 Streamlit AI 数据应用</h3>
          <div className="code-block">
{`import streamlit as st
import plotly.express as px
import pandas as pd

st.set_page_config(page_title="AI 销售分析", layout="wide")
st.title("📊 AI 驱动销售分析仪表板")

# 数据加载
df = pd.read_csv("sales.csv")

# AI 分析助手 (侧边栏)
with st.sidebar:
    st.header("🤖 AI 分析助手")
    question = st.text_input("用自然语言提问")
    if question:
        # Text2SQL + 自动可视化
        sql = text2sql(question, schema)
        result = execute_sql(sql)
        st.dataframe(result)
        
        # AI 自动选择图表类型并可视化
        chart_code = ai_generate_chart(result, question)
        exec(chart_code)

# 核心指标卡片
col1, col2, col3, col4 = st.columns(4)
col1.metric("总销售额", f"¥{df['revenue'].sum():,.0f}", "+12.5%")
col2.metric("订单数", f"{len(df):,}", "+8.3%")
col3.metric("客单价", f"¥{df['revenue'].mean():,.0f}", "-2.1%")
col4.metric("转化率", "3.2%", "+0.5%")

# 交互式图表
tab1, tab2, tab3 = st.tabs(["趋势分析", "区域分析", "产品分析"])

with tab1:
    fig = px.line(df.groupby("month")["revenue"].sum().reset_index(),
                  x="month", y="revenue", title="月度销售趋势")
    st.plotly_chart(fig, use_container_width=True)

with tab2:
    fig = px.choropleth(region_data, locations="province",
                        color="revenue", title="区域销售热力图")
    st.plotly_chart(fig, use_container_width=True)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 自动报告生成</h2>
        <div className="concept-card">
          <h3>📝 AI 数据报告生成</h3>
          <div className="code-block">
{`# AI 自动分析报告生成管线
"""
数据 → AI 分析 → 洞察提取 → 报告生成 → 审核修改

报告结构:
  1. 执行摘要 (Executive Summary)
  2. 核心指标变化
  3. 趋势分析 + 可视化
  4. 异常发现与根因
  5. 可行动建议 (Actionable Insights)
  6. 附录: 方法论 + 数据说明
"""

def generate_weekly_report(df, period="上周"):
    # 1. 指标计算
    metrics = calculate_kpis(df, period)
    
    # 2. 异常检测
    anomalies = detect_anomalies(df)
    
    # 3. 趋势分析
    trends = analyze_trends(df)
    
    # 4. 生成可视化
    charts = auto_generate_charts(df, metrics)
    
    # 5. LLM 生成报告文字
    report_text = llm_generate(f"""
    生成一份{period}业务分析报告。
    
    核心指标:
    {metrics}
    
    异常发现:
    {anomalies}
    
    趋势要点:
    {trends}
    
    要求:
    - 开篇是执行摘要 (3-5 句话)
    - 使用数据支撑每个论点
    - 结尾给出 3-5 条可行动建议
    - 语气专业但易懂
    - 标注需要关注的风险
    """)
    
    # 6. 组装为 Markdown → PDF
    report = assemble_report(report_text, charts)
    return report

# 数据叙事的 SCR 框架
"""
S (Situation):  背景 — 发生了什么?
C (Complication): 冲突 — 为什么重要?
R (Resolution):   方案 — 我们该怎么做?

示例:
  S: "Q3 整体营收同比增长 15%, 超过 KPI 目标"
  C: "但新客获取成本上升 40%, 增长主要靠老客复购"
  R: "建议 Q4 优化获客渠道 ROI, 重点投放 XX 渠道"
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 可视化设计原则</h2>
        <div className="info-box">
          <h3>📋 数据可视化设计黄金法则</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>原则</th><th>要做</th><th>不要做</th></tr>
            </thead>
            <tbody>
              <tr><td>数据墨水比</td><td>最大化数据内容占比</td><td>装饰性元素 / 3D 效果</td></tr>
              <tr><td>先总后分</td><td>Overview → Zoom → Detail</td><td>一上来就细节</td></tr>
              <tr><td>对比基准</td><td>提供同比/环比/目标线</td><td>孤立数据无参照</td></tr>
              <tr><td>色彩语义</td><td>红=下降/警告, 绿=增长</td><td>彩虹色 / 超过 7 种颜色</td></tr>
              <tr><td>标注重点</td><td>高亮关键数据点</td><td>让读者自己找</td></tr>
              <tr><td>可操作</td><td>图表旁附建议行动</td><td>只有图没有结论</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：AI EDA</span>
        <span className="nav-next">下一模块：数据 Agent →</span>
      </div>
    </div>
  );
}
