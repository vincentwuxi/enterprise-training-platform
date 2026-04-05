import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Prometheus 指标实时面板
function MetricsDashboard() {
  const [metrics, setMetrics] = useState({ rps: 342, errRate: 0.12, p99: 145, saturation: 62 });
  const [alerts, setAlerts] = useState([]);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const GOLDEN = [
    { key: 'rps', label: 'RPS（请求/秒）', unit: 'req/s', warn: null, crit: null, color: '#3b82f6', good: true },
    { key: 'errRate', label: '错误率', unit: '%', warn: 1, crit: 5, color: '#22c55e' },
    { key: 'p99', label: 'P99 延迟', unit: 'ms', warn: 500, crit: 1000, color: '#f59e0b' },
    { key: 'saturation', label: 'CPU 饱和度', unit: '%', warn: 70, crit: 90, color: '#6366f1' },
  ];

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setMetrics(prev => {
          const newMetrics = {
            rps: Math.max(100, prev.rps + (Math.random() * 60 - 20)),
            errRate: Math.max(0, Math.min(15, prev.errRate + (Math.random() * 0.8 - 0.3))),
            p99: Math.max(50, prev.p99 + (Math.random() * 80 - 30)),
            saturation: Math.max(20, Math.min(100, prev.saturation + (Math.random() * 8 - 3))),
          };
          // Generate alerts
          setAlerts(prev => {
            const now = new Date().toLocaleTimeString();
            const newAlerts = [...prev.slice(-3)];
            if (newMetrics.errRate > 5) newAlerts.push({ level: 'critical', msg: `ErrorRate ${newMetrics.errRate.toFixed(2)}% > 5% ⚠️ FIRING`, time: now });
            else if (newMetrics.errRate > 1) newAlerts.push({ level: 'warning', msg: `ErrorRate ${newMetrics.errRate.toFixed(2)}% > 1% 🟡`, time: now });
            if (newMetrics.p99 > 1000) newAlerts.push({ level: 'critical', msg: `P99 ${newMetrics.p99.toFixed(0)}ms > 1000ms`, time: now });
            if (newMetrics.saturation > 90) newAlerts.push({ level: 'critical', msg: `CPU ${newMetrics.saturation.toFixed(0)}% > 90%`, time: now });
            return newAlerts.slice(-4);
          });
          return newMetrics;
        });
      }, 500);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  return (
    <div className="cd-interactive">
      <h3>📊 Prometheus 黄金信号仪表盘（实时）
        <button className="cd-btn primary" onClick={() => setRunning(r => !r)}>{running ? '🔴 LIVE' : '▶ 模拟实时'}</button>
      </h3>

      <div className="cd-grid-4" style={{ marginBottom: '0.875rem' }}>
        {GOLDEN.map(g => {
          const val = metrics[g.key];
          const isCrit = g.crit && val > g.crit;
          const isWarn = g.warn && val > g.warn && !isCrit;
          const color = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : g.color;
          return (
            <div key={g.key} style={{ textAlign: 'center', padding: '1rem 0.5rem', background: `${color}06`, borderRadius: '10px', border: `1px solid ${color}20` }}>
              <div style={{ fontSize: '0.65rem', color: '#8b949e', fontWeight: 600, marginBottom: '0.25rem' }}>{g.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color, fontFamily: 'JetBrains Mono', lineHeight: 1.2 }}>
                {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#8b949e' }}>{g.unit}</div>
              {(isCrit || isWarn) && <div style={{ fontSize: '0.58rem', color, fontWeight: 700, marginTop: '0.2rem' }}>{isCrit ? '🚨 CRITICAL' : '⚠️ WARNING'}</div>}
            </div>
          );
        })}
      </div>

      {alerts.length > 0 && (
        <div style={{ background: '#0d1117', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
          {alerts.map((a, i) => <div key={i} style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: a.level === 'critical' ? '#f87171' : '#fbbf24', marginBottom: '0.1rem' }}>[{a.time}] {a.msg}</div>)}
        </div>
      )}

      <div style={{ marginTop: '0.4rem', fontSize: '0.68rem', color: '#8b949e' }}>
        四大黄金信号（Google SRE）：Latency（延迟）/ Traffic（流量）/ Errors（错误率）/ Saturation（饱和度）
      </div>
    </div>
  );
}

const MONITOR_TOPICS = [
  {
    name: 'Prometheus 配置', icon: '🔥', color: '#f59e0b',
    code: `# prometheus.yml — 基础配置
global:
  scrape_interval: 15s      # 每15秒抓取一次
  evaluation_interval: 15s  # 每15秒评估告警规则

# 告警规则文件
rule_files:
  - "alerts/*.yml"

# 告警发送（Alertmanager）
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# 抓取配置
scrape_configs:
  # 抓取 Kubernetes 各组件
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true   # 只抓取有注解 prometheus.io/scrape=true 的 Pod
      - source_labels: [__meta_kubernetes_namespace]
        target_label: namespace
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod

  # 应用自定义指标（FastAPI + Prometheus 客户端）
  - job_name: 'myapp'
    static_configs:
      - targets: ['myapp-svc:8000']
    metrics_path: '/metrics'

# Python 应用暴露指标
from prometheus_client import Counter, Histogram, start_http_server
REQUEST_COUNT = Counter('http_requests_total', 'Total requests', ['method', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Request latency')`,
  },
  {
    name: 'PromQL & 告警', icon: '📐', color: '#ef4444',
    code: `# PromQL — Prometheus 查询语言

# ── 黄金信号查询 ──

# 1. 请求成功率（5分钟移动平均）
sum(rate(http_requests_total{status!~"5.."}[5m])) /
sum(rate(http_requests_total[5m])) * 100
# 结果：成功率百分比

# 2. P99 延迟（各服务）
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
)

# 3. 错误率超过 1%（过去5分钟）
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service) /
sum(rate(http_requests_total[5m])) by (service) > 0.01

# ── 告警规则 ──
# alerts/api.yml
groups:
  - name: api-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) by (service) /
          sum(rate(http_requests_total[5m])) by (service) > 0.05
        for: 2m   # 持续2分钟才触发（避免抖动）
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "{{ $labels.service }} 错误率过高"
          description: "当前错误率 {{ $value | humanizePercentage }}，阈值 5%"
          runbook_url: "https://wiki/runbooks/high-error-rate"  # 处置手册链接！

      - alert: HighP99Latency
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
          ) > 1
        for: 5m
        labels: { severity: warning }`,
  },
  {
    name: 'Alertmanager 路由', icon: '🔔', color: '#6366f1',
    code: `# alertmanager.yml — 告警路由 & 静默
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/xxx'

# 告警路由树
route:
  receiver: 'default'      # 默认接收者
  group_by: ['alertname', 'service']   # 按规则+服务分组
  group_wait: 30s          # 等30秒收集同组告警
  group_interval: 5m       # 同组告警间隔5分钟发一次
  repeat_interval: 4h      # 持续告警4小时重复通知一次

  routes:
    # Critical 告警 → PagerDuty（叫醒人）
    - matchers:
        - severity = critical
      receiver: pagerduty
      continue: true  # 继续匹配后续路由

    # 数据库告警 → DBA 团队 Slack
    - matchers:
        - alertname =~ ".*Database.*"
      receiver: dba-slack

    # 工作时间外 → 只发 Slack，不叫醒
    - matchers:
        - severity = warning
      time_intervals: [offhours]
      receiver: slack-only

receivers:
  - name: pagerduty
    pagerduty_configs:
      - service_key: '<pagerduty-key>'
        severity: '{{ .CommonLabels.severity }}'

  - name: slack-only
    slack_configs:
      - channel: '#alerts'
        title: '{{ .CommonAnnotations.summary }}'
        text: '{{ .CommonAnnotations.description }}'
        color: '{{ if eq .CommonLabels.severity "critical" }}danger{{ else }}warning{{ end }}'`,
  },
];

export default function LessonMonitorAlert() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = MONITOR_TOPICS[activeTopic];

  return (
    <div className="lesson-cd">
      <div className="cd-badge">📊 module_07 — 监控告警</div>
      <div className="cd-hero">
        <h1>监控告警：Prometheus / Grafana / Alertmanager</h1>
        <p>完整的可观测性体系：<strong>Prometheus 采集指标 → PromQL 查询分析 → Alertmanager 路由告警 → Grafana 可视化</strong>。四大黄金信号（Latency/Traffic/Errors/Saturation）是 SRE 监控基础。</p>
      </div>

      <MetricsDashboard />

      <div className="cd-section">
        <h2 className="cd-section-title">🔧 监控三大核心配置</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {MONITOR_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#8b949e' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>

        <div className="cd-code-wrap">
          <div className="cd-code-head">
            <div className="cd-code-dot" style={{ background: '#ef4444' }} />
            <div className="cd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cd-code-dot" style={{ background: t.color }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span>
          </div>
          <div className="cd-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="cd-nav">
        <button className="cd-btn" onClick={() => navigate('/course/cicd-gitops/lesson/kube-deploy')}>← 上一模块</button>
        <button className="cd-btn primary" onClick={() => navigate('/course/cicd-gitops/lesson/project')}>下一模块：生产实战 →</button>
      </div>
    </div>
  );
}
