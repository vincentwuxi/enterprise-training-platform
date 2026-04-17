import React from 'react';
import './LessonCommon.css';

export default function LessonRealtimeBI() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">⚡ 模块七：实时 BI 与决策引擎 — 流分析 / 预测看板 / 告警系统</h1>
      <p className="lesson-subtitle">
        从"看历史"到"看未来"，构建实时智能的决策支持系统
      </p>

      <section className="lesson-section">
        <h2>1. 实时分析架构</h2>
        <div className="concept-card">
          <h3>🏗️ 实时 BI 技术架构</h3>
          <div className="code-block">
{`# 实时 BI 分层架构
"""
┌─────────────────────────────────────────────────────┐
│  数据源层                                           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ App │ │ IoT │ │ Log │ │ API │ │ DB  │        │
│  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘        │
│     └───────┴───────┴───────┴───────┘              │
│                     │                               │
│  流处理层           ▼                               │
│  ┌─────────────────────────────────┐               │
│  │ Kafka / Redpanda (消息总线)     │               │
│  └────────────┬────────────────────┘               │
│               │                                     │
│  ┌────────────▼───────────────┐                    │
│  │ Flink / Spark Streaming   │ ← 实时计算         │
│  │ - 窗口聚合 (1min/5min)    │                    │
│  │ - 实时指标计算             │                    │
│  │ - 异常检测                │                    │
│  │ - ML 模型在线推理         │                    │
│  └────────────┬──────────────┘                    │
│               │                                     │
│  存储层       ▼                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │ClickH│ │ Redis│ │ S3   │                      │
│  │ouse  │ │ 缓存 │ │ 湖仓 │                      │
│  └──┬───┘ └──┬───┘ └──┬───┘                      │
│     └────────┴────────┘                            │
│              │                                      │
│  展示层      ▼                                      │
│  ┌──────────────────────────┐                      │
│  │ Grafana / Superset       │ ← 实时看板           │
│  │ AI 告警 / 智能推送       │                      │
│  └──────────────────────────┘                      │
└─────────────────────────────────────────────────────┘
"""

# ClickHouse: 实时 OLAP 引擎
"""
特点:
  - 列式存储, 压缩比 10-100x
  - 单表 10 亿+行, 秒级查询
  - 向量化执行引擎
  - 支持实时写入
  
适用: 实时看板 / 用户行为分析 / 日志分析
"""

# ClickHouse 查询示例
clickhouse_query = """
-- 实时销售看板 (秒级刷新)
SELECT
    toStartOfMinute(event_time) as minute,
    countIf(event = 'purchase') as orders,
    sumIf(amount, event = 'purchase') as revenue,
    uniqExact(user_id) as active_users,
    revenue / orders as avg_order_value
FROM events
WHERE event_time >= now() - INTERVAL 1 HOUR
GROUP BY minute
ORDER BY minute DESC
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 预测分析看板</h2>
        <div className="concept-card">
          <h3>🔮 AI 预测集成到 BI</h3>
          <div className="code-block">
{`# 将 AI 预测嵌入实时看板
"""
传统看板:   显示"发生了什么" (滞后指标)
预测看板:   显示"将要发生什么" (领先指标)

预测维度:
  - 销量预测:    下周/月/季 销售额
  - 库存预警:    X 天后可能缺货
  - 客户流失:    高风险客户列表
  - 异常预测:    即将超阈值的指标
"""

# 时序预测: 使用 TimesFM (Google) / Chronos (Amazon)
from chronos import ChronosPipeline
import torch

pipeline = ChronosPipeline.from_pretrained(
    "amazon/chronos-t5-large",
    device_map="auto",
    torch_dtype=torch.float32,
)

# 预测未来 30 天销售
context = torch.tensor(historical_sales[-365:])  # 过去一年数据
forecast = pipeline.predict(
    context.unsqueeze(0),
    prediction_length=30,
    num_samples=100,      # 蒙特卡洛采样
)

# 获取预测区间
median = forecast.median(dim=1).values[0]
lower = forecast.quantile(0.1, dim=1).values[0]   # P10
upper = forecast.quantile(0.9, dim=1).values[0]   # P90

# Grafana 集成预测
"""
1. 预测结果写入 ClickHouse / PostgreSQL
2. Grafana 数据源查询实际值 + 预测值
3. 叠加显示: 实线(实际) + 虚线(预测) + 阴影(区间)
4. 告警规则: 预测值超阈值 → 提前通知
"""

# 智能告警 (不再是简单阈值)
alert_strategies = {
    "静态阈值":    "指标 > X → 告警 (简单但多误报)",
    "动态阈值":    "偏离 N 个标准差 → 告警 (自适应)",
    "预测告警":    "预测未来 N 小时超阈值 → 提前警报",
    "异常检测":    "ML 检测异常模式 → 告警 (降噪)",
    "复合条件":    "多指标同时异常 → 高优告警",
    "AI 根因":     "告警 + 自动分析原因 + 建议",
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. Apache Superset — 开源 BI</h2>
        <div className="concept-card">
          <h3>🦈 Superset 企业级 BI</h3>
          <div className="code-block">
{`# Apache Superset: 最流行的开源 BI 平台
"""
特点:
  - 丰富的图表类型 (50+)
  - 拖拽式仪表板
  - SQL Lab (交互式查询)
  - 权限控制 (行级/列级安全)
  - 支持 30+ 数据源

部署:
  docker compose up -d
  # 或 Kubernetes Helm Chart

AI 增强:
  - 集成 Text2SQL (自然语言 → SQL Lab)
  - 智能图表推荐
  - 异常标注
"""

# Superset + Text2SQL API
from flask import Flask, request, jsonify

@app.route('/api/text2sql', methods=['POST'])
def natural_language_query():
    question = request.json['question']
    database = request.json['database']
    
    # 获取 schema
    schema = get_superset_schema(database)
    
    # LLM 生成 SQL
    sql = text2sql(question, schema)
    
    # 在 Superset 中执行
    result = superset_execute(database, sql)
    
    # AI 推荐图表
    chart_type = recommend_chart(question, result)
    
    return jsonify({
        'sql': sql,
        'result': result.to_dict(),
        'recommended_chart': chart_type,
        'insight': generate_insight(question, result)
    })`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. BI 工具选型</h2>
        <div className="info-box">
          <h3>📋 BI 工具全景对比</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>工具</th><th>类型</th><th>AI 能力</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>Apache Superset</td><td>开源</td><td>可扩展</td><td>自建 BI 平台</td></tr>
              <tr><td>Metabase</td><td>开源</td><td>自然语言查询</td><td>中小团队</td></tr>
              <tr><td>Grafana</td><td>开源</td><td>告警 + ML</td><td>运维监控 / IoT</td></tr>
              <tr><td>Tableau</td><td>商用</td><td>Ask Data / AI</td><td>企业级分析</td></tr>
              <tr><td>Power BI</td><td>商用</td><td>Copilot 集成</td><td>微软生态企业</td></tr>
              <tr><td>ThoughtSpot</td><td>商用</td><td>搜索式分析</td><td>自助式分析</td></tr>
              <tr><td>帆软 FineBI</td><td>商用</td><td>中文优化</td><td>国内企业</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：数据 Agent</span>
        <span className="nav-next">下一模块：分析工程化 →</span>
      </div>
    </div>
  );
}
