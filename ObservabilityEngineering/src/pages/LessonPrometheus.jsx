import { useState } from 'react';
import './LessonCommon.css';

const CODE_ARCH = `# ━━━━ Prometheus 架构 ━━━━

# ━━━━ 1. 核心架构（Pull 模型）━━━━
# 
# ┌─────────────────────────────────────────────────────────┐
# │                    Prometheus Server                      │
# │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐    │
# │  │ Retrieval  │  │   TSDB    │  │   HTTP Server     │    │
# │  │(Pull 抓取) │→ │(时序存储)  │→ │(PromQL 查询接口) │    │
# │  └───────────┘  └───────────┘  └───────────────────┘    │
# │        ↑ scrape                         ↓ query          │
# └────────┼────────────────────────────────┼────────────────┘
#          │                                │
#    ┌─────┴─────┐                    ┌─────┴─────┐
#    │  Targets   │                    │  Grafana   │
#    │ /metrics   │                    │ Dashboard  │
#    └───────────┘                    └───────────┘
#
# Pull vs Push：
# Pull（Prometheus 主动抓取）：
#   ✅ 服务端控制采集频率
#   ✅ 目标挂了立即知道（抓取失败 = UP=0）
#   ✅ 服务端不需要知道 Prometheus 地址
# Push（如 StatsD/DataDog）：
#   ✅ 适合短生命周期任务（batch job）
#   → Prometheus 用 Pushgateway 支持 Push

# ━━━━ 2. 配置文件 prometheus.yml ━━━━
# global:
#   scrape_interval: 15s          # 默认抓取间隔
#   evaluation_interval: 15s      # 规则评估间隔
#
# alerting:
#   alertmanagers:
#     - static_configs:
#         - targets: ['alertmanager:9093']
#
# rule_files:
#   - "rules/*.yml"               # 告警/Recording 规则
#
# scrape_configs:
#   - job_name: 'api-server'
#     metrics_path: '/metrics'     # 默认
#     scrape_interval: 5s          # 覆盖全局
#     static_configs:
#       - targets: ['api:8080']
#         labels:
#           env: 'production'
#
#   - job_name: 'kubernetes-pods'
#     kubernetes_sd_configs:       # K8s 服务发现
#       - role: pod
#     relabel_configs:             # 标签重写
#       - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
#         action: keep
#         regex: true

# ━━━━ 3. 指标暴露（Exporter）━━━━
# 应用自带 /metrics（推荐）
# Node Exporter          → Linux 系统指标
# kube-state-metrics     → K8s 对象状态
# postgres_exporter      → PostgreSQL 指标
# redis_exporter         → Redis 指标
# nginx-prometheus-exporter → Nginx 指标
# blackbox_exporter      → 外部探测（HTTP/TCP/DNS）

# ━━━━ 4. 应用埋点示例（Go）━━━━
# import (
#   "github.com/prometheus/client_golang/prometheus"
#   "github.com/prometheus/client_golang/prometheus/promauto"
# )
#
# var (
#   httpRequestsTotal = promauto.NewCounterVec(
#     prometheus.CounterOpts{
#       Name: "http_requests_total",
#       Help: "Total HTTP requests",
#     },
#     []string{"method", "path", "status"},
#   )
#   httpRequestDuration = promauto.NewHistogramVec(
#     prometheus.HistogramOpts{
#       Name:    "http_request_duration_seconds",
#       Help:    "HTTP request duration",
#       Buckets: []float64{0.01, 0.05, 0.1, 0.25, 0.5, 1, 5},
#     },
#     []string{"method", "path"},
#   )
# )`;

const CODE_PROMQL = `# ━━━━ PromQL 查询语言 ━━━━

# ━━━━ 1. 基础查询 ━━━━
# 瞬时向量：当前值
http_requests_total{method="GET", status="200"}

# 范围向量：最近 5 分钟的所有采样点
http_requests_total{method="GET"}[5m]

# 标签匹配：
# =  精确匹配     status="200"
# != 不等于       status!="500"
# =~ 正则匹配     method=~"GET|POST"
# !~ 正则不匹配   path!~"/health.*"

# ━━━━ 2. 速率计算（最重要！）━━━━
# rate(): Counter 的每秒增长率（5 分钟窗口）
rate(http_requests_total[5m])
# → 每秒请求数 (QPS)

# irate(): 基于最近两个采样点的瞬时速率
irate(http_requests_total[5m])
# → 更灵敏，但更不稳定

# increase(): 时间窗口内的绝对增长量
increase(http_requests_total[1h])
# → 过去 1 小时的请求总数

# ━━━━ 3. 聚合操作 ━━━━
# 总 QPS
sum(rate(http_requests_total[5m]))

# 按 service 分组的 QPS
sum by (service) (rate(http_requests_total[5m]))

# 错误率 = 错误请求 / 总请求
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))

# P95 延迟（Histogram 分位数）
histogram_quantile(0.95,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m]))
)

# P99 延迟
histogram_quantile(0.99,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m]))
)

# ━━━━ 4. 常用生产查询 ━━━━
# 可用性：非 5xx 请求占比（SLI）
1 - (
  sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
  sum(rate(http_requests_total[5m]))
)

# CPU 使用率（Node Exporter）
1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance)

# 内存使用率
1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)

# 磁盘使用率
1 - (node_filesystem_free_bytes / node_filesystem_size_bytes)

# Container CPU（K8s）
sum by (pod) (rate(container_cpu_usage_seconds_total[5m]))

# ━━━━ 5. Recording Rules（预计算）━━━━
# 把常用的复杂查询预计算成新指标
# rules/recording.yml:
# groups:
#   - name: http_rules
#     interval: 15s
#     rules:
#       - record: job:http_requests:rate5m
#         expr: sum by (job) (rate(http_requests_total[5m]))
# 
#       - record: job:http_errors:rate5m
#         expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))
#
#       - record: job:http_error_ratio
#         expr: job:http_errors:rate5m / job:http_requests:rate5m

# ━━━━ 6. Alerting Rules ━━━━
# rules/alerts.yml:
# groups:
#   - name: http_alerts
#     rules:
#       - alert: HighErrorRate
#         expr: job:http_error_ratio > 0.05    # 错误率 > 5%
#         for: 5m                              # 持续 5 分钟
#         labels:
#           severity: critical
#         annotations:
#           summary: "High error rate on {{ $labels.job }}"
#           description: "Error rate is {{ $value | humanizePercentage }}"
#           runbook: "https://wiki/runbook/high-error-rate"`;

export default function LessonPrometheus() {
  const [tab, setTab] = useState('arch');
  const tabs = [
    { key: 'arch', label: '📡 架构 & 配置', code: CODE_ARCH },
    { key: 'promql', label: '📊 PromQL 查询', code: CODE_PROMQL },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="obs-lesson">
      <div className="obs-hero">
        <div className="obs-badge"><span className="obs-pulse" style={{ background: '#22c55e' }} /> MODULE 02 · PROMETHEUS</div>
        <h1>Prometheus 时序数据库</h1>
        <p>云原生监控的事实标准——<strong>Pull 模型抓取 /metrics 端点，TSDB 存储时序数据，PromQL 查询 QPS/错误率/P99 延迟，Recording Rules 预计算加速</strong>。</p>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📡 Prometheus</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`obs-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="obs-code-wrap">
          <div className="obs-code-head">
            <div className="obs-code-dot" style={{ background: '#ef4444' }} /><div className="obs-code-dot" style={{ background: '#f59e0b' }} /><div className="obs-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'arch' ? 'prometheus.yml' : 'promql.txt'}</span>
          </div>
          <div className="obs-code">{t.code}</div>
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">🔧 常用 Exporter</div>
        <div className="obs-grid-3">
          {[
            { name: 'Node Exporter', target: 'Linux 系统', metrics: 'CPU/内存/磁盘/网络', color: '#22c55e' },
            { name: 'kube-state-metrics', target: 'K8s 对象', metrics: 'Pod/Deploy/Node 状态', color: '#3b82f6' },
            { name: 'postgres_exporter', target: 'PostgreSQL', metrics: '连接/查询/锁/复制延迟', color: '#8b5cf6' },
            { name: 'redis_exporter', target: 'Redis', metrics: '命中率/内存/连接/延迟', color: '#ef4444' },
            { name: 'blackbox_exporter', target: '外部探测', metrics: 'HTTP/TCP/DNS 可达性', color: '#f97316' },
            { name: 'nginx_exporter', target: 'Nginx', metrics: '请求数/连接/延迟', color: '#06b6d4' },
          ].map((e, i) => (
            <div key={i} className="obs-card" style={{ borderTop: `2px solid ${e.color}` }}>
              <div style={{ fontWeight: 700, color: e.color, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{e.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--obs-muted)', lineHeight: 1.7 }}>🎯 {e.target}<br/>📊 {e.metrics}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
