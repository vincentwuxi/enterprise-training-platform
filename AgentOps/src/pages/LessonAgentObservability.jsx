import React from 'react';
import './LessonCommon.css';

export default function LessonAgentObservability() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🔭 模块二：Agent 可观测性 — Trace / Span / 日志 / 指标 / 调试</h1>
      <p className="lesson-subtitle">
        看不见的 Agent 无法运维——构建端到端的可观测性基础设施
      </p>

      <section className="lesson-section">
        <h2>1. Agent 可观测性架构</h2>
        <div className="concept-card">
          <h3>🏗️ 三大支柱 + Agent 扩展</h3>
          <div className="code-block">
{`# 传统可观测性三大支柱 + Agent 特有需求
"""
经典三支柱:
  ┌──────────┬──────────┬──────────┐
  │ Traces   │ Metrics  │ Logs     │
  │ 请求链路 │ 聚合指标 │ 事件日志 │
  └──────────┴──────────┴──────────┘

Agent 额外需要:
  ┌──────────┬──────────┬──────────┐
  │ Prompt   │ Tool     │ Decision │
  │ 版本追踪 │ 调用审计 │ 推理链路 │
  └──────────┴──────────┴──────────┘

Agent Trace 结构:
  Request (根 Span)
  ├── LLM Call #1 (思考)
  │   ├── Prompt Template v2.3
  │   ├── Input Tokens: 1,234
  │   ├── Output Tokens: 456
  │   └── Latency: 2.3s
  ├── Tool Call: search_database
  │   ├── Parameters: {"query": "..."}
  │   ├── Result: {...}
  │   └── Latency: 0.5s
  ├── LLM Call #2 (分析结果)
  │   ├── Latency: 1.8s
  │   └── Decision: "需要更多信息"
  ├── Tool Call: get_user_profile
  │   └── Latency: 0.3s
  └── LLM Call #3 (最终回答)
      ├── Latency: 2.1s
      └── Total Cost: $0.012
"""

# 关键指标体系
agent_metrics = {
    # 性能指标
    "latency_p50": "端到端延迟中位数",
    "latency_p99": "长尾延迟",
    "ttft": "Time to First Token",
    "tokens_per_request": "每次请求 Token 消耗",
    
    # 质量指标
    "task_success_rate": "任务完成率",
    "tool_call_accuracy": "工具调用准确率",
    "hallucination_rate": "幻觉率",
    "user_satisfaction": "用户满意度 (CSAT)",
    
    # 运维指标
    "error_rate": "错误率 (5xx / timeout)",
    "loop_detection_rate": "循环检测触发率",
    "guardrail_trigger_rate": "护栏触发率",
    "cost_per_request": "请求平均成本",
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. Langfuse — 开源 Agent 可观测性</h2>
        <div className="concept-card">
          <h3>🔥 Langfuse 集成实战</h3>
          <div className="code-block">
{`from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context
from openai import OpenAI

langfuse = Langfuse(
    public_key="pk-...",
    secret_key="sk-...",
    host="https://langfuse.your-company.com"
)

client = OpenAI()

@observe(name="customer-service-agent")
def handle_customer_request(user_message: str, session_id: str):
    """完整的 Agent 请求处理 (自动追踪)"""
    
    # 自动记录: Trace 开始
    langfuse_context.update_current_trace(
        session_id=session_id,
        user_id="user-123",
        metadata={"channel": "web", "priority": "normal"}
    )
    
    # Step 1: 意图识别
    intent = classify_intent(user_message)
    
    # Step 2: 工具调用
    if intent == "order_query":
        order_data = query_order_system(user_message)
    
    # Step 3: 生成回复
    response = generate_response(user_message, intent, order_data)
    
    # 记录用户反馈 (异步)
    langfuse_context.update_current_trace(
        output=response,
        metadata={"intent": intent}
    )
    return response

@observe(name="classify-intent", as_type="generation")
def classify_intent(message: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "分类用户意图: order_query/refund/complaint/general"},
            {"role": "user", "content": message}
        ],
        temperature=0
    )
    # Langfuse 自动记录: model, tokens, latency, cost
    return response.choices[0].message.content.strip()

@observe(name="query-order-system", as_type="span")
def query_order_system(message: str) -> dict:
    # 自动追踪工具调用耗时和结果
    order_id = extract_order_id(message)
    return db.query(f"SELECT * FROM orders WHERE id = '{order_id}'")

# 用户反馈收集 (用于评估)
langfuse.score(
    trace_id="trace-xxx",
    name="user-feedback",
    value=1,          # 1=正面, 0=负面
    comment="问题解决了"
)

# Langfuse Dashboard 提供:
# - Trace 瀑布图 (每个 Span 时间线)
# - Token/成本趋势
# - 模型对比
# - 用户反馈分析
# - Prompt 版本管理`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 生产告警与仪表板</h2>
        <div className="concept-card">
          <h3>📊 Agent 运维仪表板设计</h3>
          <div className="code-block">
{`# Agent 生产监控仪表板 (Grafana)
"""
┌──────────────────────────────────────────────┐
│              Agent 运维总览                   │
├──────┬──────┬──────┬──────┬───────┬─────────┤
│ QPS  │ P50  │ P99  │ 成功率│ 日成本 │ 活跃用户│
│ 45.2 │ 2.1s │ 8.3s │ 97.2%│ $234  │ 1,247  │
├──────┴──────┴──────┴──────┴───────┴─────────┤
│  📈 请求量趋势 (24h)                         │
│  ████████████████████████████████████         │
├──────────────────────────────────────────────┤
│  🔴 告警面板                                  │
│  ⚠ P99 延迟 > 10s (触发 3 次/小时)           │
│  ⚠ 幻觉率上升至 5.2% (阈值: 3%)             │
│  🔴 工具 "payment_api" 错误率 12%            │
├──────────────────────────────────────────────┤
│  💰 成本分解                                  │
│  GPT-4o: 68% | GPT-4o-mini: 25% | Claude: 7%│
│  工具调用: $45 | 向量检索: $12                │
└──────────────────────────────────────────────┘
"""

# 关键告警规则
alert_rules = {
    "error_rate_high": {
        "condition": "error_rate > 5% for 5min",
        "severity": "critical",
        "action": "PagerDuty + 自动切换备用模型"
    },
    "latency_spike": {
        "condition": "p99_latency > 15s for 10min",
        "severity": "warning",
        "action": "Slack 通知 + 自动降级到简化流程"
    },
    "hallucination_spike": {
        "condition": "hallucination_rate > 3% for 1h",
        "severity": "critical",
        "action": "触发人工审核 + 增加护栏强度"
    },
    "cost_anomaly": {
        "condition": "hourly_cost > 2x 历史均值",
        "severity": "warning",
        "action": "检查循环调用 + Token 泄漏"
    },
    "tool_failure": {
        "condition": "tool_error_rate > 10% for 5min",
        "severity": "critical",
        "action": "熔断该工具 + 切换备用路径"
    }
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 可观测性工具选型</h2>
        <div className="info-box">
          <h3>📋 Agent 可观测性工具</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>工具</th><th>类型</th><th>特点</th><th>价格</th></tr>
            </thead>
            <tbody>
              <tr><td>Langfuse</td><td>开源</td><td>全功能, 可自托管</td><td>免费/云版</td></tr>
              <tr><td>LangSmith</td><td>商用</td><td>LangChain 深度集成</td><td>$39+/月</td></tr>
              <tr><td>Phoenix (Arize)</td><td>开源</td><td>评估 + 可视化</td><td>免费</td></tr>
              <tr><td>Helicone</td><td>开源</td><td>代理网关 + 日志</td><td>免费/Pro</td></tr>
              <tr><td>Datadog LLM</td><td>商用</td><td>与 Datadog 生态集成</td><td>企业价</td></tr>
              <tr><td>OpenLLMetry</td><td>开源</td><td>OpenTelemetry 扩展</td><td>免费</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：评估体系</span>
        <span className="nav-next">下一模块：安全护栏 →</span>
      </div>
    </div>
  );
}
