import { useState } from 'react';
import './LessonCommon.css';

export default function LessonObservability() {
  const [tab, setTab] = useState('prometheus');

  const codes = {
    prometheus: `# ━━━━ Prometheus + Grafana 全栈部署 ━━━━

# Helm 一键安装 kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set grafana.adminPassword='YourSecurePassword' \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi

# 访问 Grafana（port-forward）
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
# 默认账号：admin / YourSecurePassword

---
# ━━━━ 自定义 ServiceMonitor（让 Prometheus 抓取你的应用）━━━━
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: webapp-monitor
  namespace: monitoring
  labels:
    release: monitoring           # 与 Prometheus release label 匹配
spec:
  selector:
    matchLabels:
      app: webapp
  namespaceSelector:
    matchNames:
    - production
  endpoints:
  - port: metrics                 # Service 端口名
    path: /metrics
    interval: 30s
    scrapeTimeout: 10s

---
# ━━━━ 关键 K8s 告警规则 ━━━━
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: k8s-critical-alerts
  namespace: monitoring
spec:
  groups:
  - name: k8s.critical
    rules:
    # Pod 持续启动失败
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.pod }} CrashLoopBackOff"

    # 节点内存 > 85%
    - alert: NodeMemoryHigh
      expr: (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) > 0.85
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "Node {{ $labels.instance }} memory > 85%"

    # PVC 使用率 > 80%
    - alert: PVCDiskUsageHigh
      expr: kubelet_volume_stats_used_bytes / kubelet_volume_stats_capacity_bytes > 0.8
      for: 5m
      labels:
        severity: warning`,

    logging: `# ━━━━ Loki + Promtail 日志聚合（轻量推荐）━━━━

helm repo add grafana https://grafana.github.io/helm-charts
helm install loki-stack grafana/loki-stack \
  --namespace monitoring \
  --set loki.enabled=true \
  --set promtail.enabled=true \   # 在每个节点采集日志
  --set grafana.enabled=false     # 复用已有 Grafana

# 在 Grafana 添加 Loki 数据源：http://loki-stack:3100

---
# Promtail 配置（自动采集 K8s 标准日志）
scrape_configs:
- job_name: kubernetes-pods
  kubernetes_sd_configs:
  - role: pod
  relabel_configs:
  # 保留 Pod 的 namespace/app/container 标签
  - source_labels: [__meta_kubernetes_pod_label_app]
    target_label: app
  - source_labels: [__meta_kubernetes_namespace]
    target_label: namespace

# Grafana Explore 查询示例：
# {namespace="production", app="webapp"} |= "ERROR"
# {app="api"} | json | status >= 500
# rate({namespace="production"}[5m])

---
# ━━━━ K8s Events 监控（kubelet Events 持久化）━━━━
# Events 默认只保留 1 小时！生产必须持久化

helm install eventrouter stable/eventrouter \
  --set sink=glog  # 转发到标准日志（被 Promtail 采集）

# 手动查看近期 Events
kubectl get events --sort-by='.lastTimestamp' -A | tail -50
kubectl get events --field-selector type=Warning -n production`,

    tracing: `# ━━━━ 可观测性三支柱完整架构 ━━━━

# ┌──────────────────────────────────────────────────────┐
# │               Observability Stack                     │
# ├─────────────┬──────────────┬───────────────────────── │
# │   Metrics   │     Logs     │         Traces            │
# │ Prometheus  │    Loki      │   Jaeger / Tempo          │
# │  + Grafana  │  + Grafana   │   + Grafana               │
# └─────────────┴──────────────┴───────────────────────── ┘

# ━━━━ Jaeger 分布式追踪部署 ━━━━
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm install jaeger jaegertracing/jaeger \
  --namespace monitoring \
  --set storage.type=elasticsearch \
  --set elasticsearch.enabled=true

# ━━━━ 关键 Grafana Dashboard 推荐 ━━━━

# Dashboard ID（直接导入）：
# 12740 - Kubernetes All-in-One Cluster Monitoring
# 15760 - Kubernetes / Views / Global
# 15759 - Kubernetes / Views / Nodes
# 15761 - Kubernetes / Views / Pods
# 13659 - Loki Logs Panel

kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
# 导入：Dashboard → Import → 输入 ID

# ━━━━ 核心监控指标清单 ━━━━
# 集群层面：
#   node_memory_MemAvailable_bytes    # 节点可用内存
#   node_cpu_seconds_total            # 节点 CPU
#   kube_node_status_condition        # 节点健康状态
#
# 工作负载层面：
#   kube_deployment_status_replicas_unavailable  # 不可用副本数
#   container_cpu_usage_seconds_total            # 容器 CPU
#   container_memory_working_set_bytes           # 容器实际内存
#   kube_pod_container_status_restarts_total     # 重启次数
#
# 业务层面（需要应用暴露）：
#   http_requests_total               # 请求数
#   http_request_duration_seconds     # 延迟分布（需 histogram）`,
  };

  return (
    <div className="k8s-lesson">
      <div className="k8s-hero">
        <div className="k8s-badge">// MODULE 06 · OBSERVABILITY</div>
        <h1>可观测性全栈</h1>
        <p>可观测性是 SRE 的核心能力。没有监控，运维是在黑暗中飞行。<strong>Metrics（Prometheus）+ Logs（Loki）+ Traces（Jaeger）</strong>三支柱构成完整的可观测性体系。</p>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">📊 三支柱可观测性架构</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['prometheus', '📊 Prometheus + Grafana'], ['logging', '📋 Loki 日志聚合'], ['tracing', '🔍 Jaeger 全链路追踪']].map(([k, l]) => (
            <button key={k} className={`k8s-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="k8s-code-wrap">
          <div className="k8s-code-head">
            <div className="k8s-code-dot" style={{ background: '#ef4444' }} /><div className="k8s-code-dot" style={{ background: '#f59e0b' }} /><div className="k8s-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.yaml</span>
          </div>
          <div className="k8s-code">{codes[tab]}</div>
        </div>
      </div>
    </div>
  );
}
