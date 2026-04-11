import './LessonCommon.css';

const CODE = `# ━━━━ Grafana 可视化 & Loki 日志 ━━━━

# ━━━━ 1. Dashboard 设计原则 ━━━━
# 
# 层级结构（从概览到细节）：
# L0: 全局概览   → 所有服务健康状态（绿/黄/红）
# L1: 服务级     → 单个服务的 RED 指标
# L2: 实例级     → 单个 Pod/容器的资源使用
# L3: 请求级     → 单个 Trace 的详细链路
#
# 黄金布局（一个服务的标准 Dashboard）：
# ┌──────────────────────────────────────────┐
# │  Row 1: 关键指标（Stat Panel）            │
# │  [QPS: 1.2K] [错误率: 0.3%] [P95: 85ms] │
# ├──────────────────────────────────────────┤
# │  Row 2: QPS 时间线（Time Series）          │
# │  ~~~~/\\/\\/\\~~~~~/\\/\\~~~                │
# ├──────────────────────────────────────────┤
# │  Row 3: 延迟分布（Heatmap）                │
# │  ▓▓▓▓▓▒▒░░░░                              │
# ├──────────────────────────────────────────┤
# │  Row 4: 错误日志（Loki Logs Panel）        │
# │  [ERROR] Payment failed...                │
# │  [ERROR] Timeout connecting to DB...      │
# └──────────────────────────────────────────┘

# ━━━━ 2. 核心 Panel 类型 ━━━━
# Time Series  → 趋势线图（QPS、延迟、CPU）
# Stat         → 单值大字（当前 QPS、错误率）
# Gauge        → 仪表盘（CPU 使用率、磁盘）
# Heatmap      → 热力图（延迟分布、请求分布）
# Table        → 表格（Top 10 慢查询）
# Logs         → 日志面板（Loki 日志）
# Bar Gauge    → 条形仪表（多实例对比）
# State Timeline → 状态时间线（服务可用性）
# Geomap       → 地理分布（CDN 命中率）

# ━━━━ 3. 变量（动态 Dashboard）━━━━
# Dashboard Settings → Variables
#
# 变量类型：
# Query → 从 Prometheus 查询标签值
#   Name: service
#   Query: label_values(http_requests_total, service)
#   Multi-value: true  → 可以选多个
#
# 在 Panel 中使用：
#   rate(http_requests_total{service=~"$service"}[5m])
#
# 级联变量：
#   环境 → 服务 → 实例
#   env: label_values(up, env)
#   service: label_values(up{env="$env"}, service)
#   instance: label_values(up{env="$env",service="$service"}, instance)

# ━━━━ 4. Grafana Loki（日志聚合）━━━━
# Loki = "Prometheus for logs"
# 核心思想：只索引标签，不索引日志内容 → 极低存储成本
#
# LogQL 查询语言：
# 基础查询（按标签过滤）
{app="order-service", env="production"}

# 关键字过滤
{app="order-service"} |= "error"
{app="order-service"} != "health"
{app="order-service"} |~ "timeout|refused"

# JSON 解析
{app="order-service"} | json | status >= 500

# 聚合（日志 → 指标）
# 每秒错误日志数
sum(rate({app="order-service"} |= "error" [5m]))

# 按 level 分组的日志计数
sum by (level) (count_over_time({app="order-service"} | json [1h]))

# P95 请求耗时（从日志提取）
quantile_over_time(0.95,
  {app="order-service"} | json | unwrap duration_ms [5m]
) by (service)

# ━━━━ 5. Grafana 告警 ━━━━
# 告警规则（Grafana 8+ Unified Alerting）
# 1. 选择数据源（Prometheus/Loki）
# 2. 定义条件：avg(rate(http_requests_total{status=~"5.."}[5m])) > 0.05
# 3. 设置持续时间：5m（避免抖动）
# 4. 配置通知渠道：Slack / PagerDuty / Email / Webhook
#
# Contact Points:
# - Slack:     webhook URL
# - PagerDuty: integration key
# - Email:     SMTP 配置
# - Webhook:   自定义 URL（接入企业微信/钉钉）

# ━━━━ 6. Tempo（链路追踪后端）━━━━
# Grafana Tempo = Loki 思路的 Trace 存储
# 只索引 TraceID，不索引 Span 属性
# → 极低存储成本
# → 通过 Exemplar 从 Prometheus 跳转到 Trace
# → 通过 TraceID 从 Loki 日志跳转到 Trace`;

export default function LessonGrafana() {
  return (
    <div className="obs-lesson">
      <div className="obs-hero">
        <div className="obs-badge"><span className="obs-pulse" style={{ background: '#f97316' }} /> MODULE 03 · GRAFANA</div>
        <h1>Grafana 可视化</h1>
        <p>数据没有可视化 = 数据不存在——<strong>4 层 Dashboard 从全局概览到请求级追踪，Loki 用标签索引实现低成本日志聚合，LogQL 把日志变成可查询的指标</strong>。</p>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📊 Grafana & Loki</div>
        <div className="obs-code-wrap">
          <div className="obs-code-head">
            <div className="obs-code-dot" style={{ background: '#ef4444' }} /><div className="obs-code-dot" style={{ background: '#f59e0b' }} /><div className="obs-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>grafana.yaml</span>
          </div>
          <div className="obs-code">{CODE}</div>
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📐 Dashboard 层级</div>
        <div className="obs-grid-4">
          {[
            { level: 'L0', name: '全局概览', what: '所有服务健康状态', color: '#22c55e' },
            { level: 'L1', name: '服务级', what: '单服务 RED 指标', color: '#3b82f6' },
            { level: 'L2', name: '实例级', what: 'Pod/容器资源', color: '#f97316' },
            { level: 'L3', name: '请求级', what: '单个 Trace 链路', color: '#8b5cf6' },
          ].map((l, i) => (
            <div key={i} className="obs-metric" style={{ borderTop: `2px solid ${l.color}` }}>
              <div className="obs-metric-val" style={{ color: l.color, fontSize: '1.2rem' }}>{l.level}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{l.name}</div>
              <div className="obs-metric-label">{l.what}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
