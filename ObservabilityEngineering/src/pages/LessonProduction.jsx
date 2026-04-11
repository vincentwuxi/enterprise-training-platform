import './LessonCommon.css';

const CODE = `# ━━━━ 生产实战：K8s 监控 + 日志管道 + APM 全景 ━━━━

# ━━━━ 1. K8s 监控全景（kube-prometheus-stack）━━━━
# 一键部署完整监控栈：
# helm install monitoring prometheus-community/kube-prometheus-stack \\
#   --namespace monitoring --create-namespace \\
#   --set grafana.adminPassword=admin \\
#   --set prometheus.prometheusSpec.retention=30d
# 
# 包含：
# ✅ Prometheus (TSDB + PromQL)
# ✅ Alertmanager (告警路由)
# ✅ Grafana (可视化 + 内置 Dashboard)
# ✅ Node Exporter (每个节点的系统指标)
# ✅ kube-state-metrics (K8s 对象状态)
# ✅ ServiceMonitor CRD (声明式抓取配置)

# ━━━━ 2. ServiceMonitor（声明式指标抓取）━━━━
# 不再手动配置 prometheus.yml！
# apiVersion: monitoring.coreos.com/v1
# kind: ServiceMonitor
# metadata:
#   name: api-server-monitor
#   labels:
#     release: monitoring
# spec:
#   selector:
#     matchLabels:
#       app: api-server
#   endpoints:
#     - port: metrics
#       interval: 15s
#       path: /metrics
# → Prometheus 自动发现并抓取

# ━━━━ 3. 核心 K8s 告警规则 ━━━━
# 
# Pod 相关：
# - KubePodCrashLooping: Pod 持续重启
#   restart_count 在 15m 内 > 3
# - KubePodNotReady: Pod 未就绪超过 5m
# - KubeContainerOOMKilled: 容器 OOM 被杀
# 
# Node 相关：
# - NodeMemoryHighUtilization: 内存 > 90%
# - NodeDiskRunningFull: 磁盘 24h 内预测满
# - NodeNotReady: 节点不可用
# 
# Deployment 相关：
# - KubeDeploymentReplicasMismatch: 期望副本 ≠ 实际副本
# - KubeStatefulSetReplicasMismatch: 类似

# ━━━━ 4. 日志管道（生产架构）━━━━
# 
# 方案 A: Grafana Loki（推荐，轻量）
# ┌────────────┐    ┌──────────┐    ┌──────────┐
# │  App Pods   │──→│ Promtail │──→│   Loki   │──→ Grafana
# │ (stdout)    │    │(DaemonSet)│   │(存储层)  │
# └────────────┘    └──────────┘    └──────────┘
# 
# Promtail 配置：
# scrape_configs:
#   - job_name: kubernetes-pods
#     kubernetes_sd_configs:
#       - role: pod
#     pipeline_stages:
#       - docker: {}
#       - json:
#           expressions:
#             level: level
#             message: msg
#       - labels:
#           level:
# 
# 方案 B: ELK Stack（重量级，功能丰富）
# App → Filebeat → Logstash → Elasticsearch → Kibana
# 
# 方案 C: Vector + ClickHouse（高性能）
# App → Vector → ClickHouse → Grafana

# ━━━━ 5. APM 全景图（End-to-End）━━━━
# 
# 完整的生产可观测性架构：
# 
# ┌─────────────────────────────────────────────────────┐
# │                 Application Layer                    │
# │  ┌─────────────────────────────────────────────┐    │
# │  │  OTel SDK (Traces + Metrics + Logs)          │    │
# │  └────────────────────┬────────────────────────┘    │
# └───────────────────────┼─────────────────────────────┘
#                         ↓ OTLP
# ┌───────────────────────┴─────────────────────────────┐
# │                 OTel Collector                       │
# │  Receivers → Processors → Exporters                  │
# └──────┬───────────────┬────────────────┬─────────────┘
#        ↓               ↓                ↓
# ┌──────┴───┐    ┌──────┴───┐     ┌──────┴───┐
# │Prometheus │    │  Tempo   │     │   Loki   │
# │ (Metrics) │    │ (Traces) │     │  (Logs)  │
# └──────┬───┘    └──────┬───┘     └──────┬───┘
#        └───────────────┼────────────────┘
#                        ↓
#              ┌─────────────────┐
#              │    Grafana      │
#              │ (统一可视化)     │
#              │ Metrics↔Traces  │
#              │ Traces↔Logs     │
#              │ Exemplars关联   │
#              └─────────────────┘

# ━━━━ 6. 成熟度模型 ━━━━
# 
# Level 0: 无监控
#   → 出问题靠用户反馈
# 
# Level 1: 基础监控
#   → Node Exporter + Prometheus + Grafana
#   → CPU/内存/磁盘基础指标
# 
# Level 2: 应用监控
#   → RED 指标(QPS/错误率/延迟)
#   → 结构化日志 + Loki
#   → 基本告警
# 
# Level 3: 分布式追踪
#   → OpenTelemetry + Tempo/Jaeger
#   → Metrics ↔ Traces ↔ Logs 关联
#   → SLO/Error Budget
# 
# Level 4: 卓越运营
#   → Burn Rate Alert
#   → Chaos Engineering
#   → 自动修复（Self-healing）
#   → 异常检测（ML-based）
# 
# → 你的目标：从 Level 1 → Level 3（本课程覆盖）`;

export default function LessonProduction() {
  return (
    <div className="obs-lesson">
      <div className="obs-hero">
        <div className="obs-badge"><span className="obs-pulse" style={{ background: '#22c55e' }} /> MODULE 08 · PRODUCTION</div>
        <h1>生产实战</h1>
        <p>理论 → 落地——<strong>kube-prometheus-stack 一键部署 K8s 监控，Loki+Promtail 日志管道，OTel Collector 统一收集，Grafana 三者关联形成 APM 全景</strong>。</p>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">🏭 生产实战</div>
        <div className="obs-code-wrap">
          <div className="obs-code-head">
            <div className="obs-code-dot" style={{ background: '#ef4444' }} /><div className="obs-code-dot" style={{ background: '#f59e0b' }} /><div className="obs-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>production.yaml</span>
          </div>
          <div className="obs-code">{CODE}</div>
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📊 成熟度模型</div>
        <div className="obs-grid-2">
          {[
            { level: 'L0', name: '无监控', desc: '出问题靠用户反馈', color: '#ef4444' },
            { level: 'L1', name: '基础监控', desc: 'CPU/内存/磁盘 + 基础告警', color: '#f97316' },
            { level: 'L2', name: '应用监控', desc: 'RED 指标 + 结构化日志 + Loki', color: '#fbbf24' },
            { level: 'L3', name: '分布式追踪', desc: 'OTel + Traces↔Logs 关联 + SLO', color: '#22c55e' },
          ].map((l, i) => (
            <div key={i} className="obs-card" style={{ borderLeft: `3px solid ${l.color}` }}>
              <div style={{ fontWeight: 800, color: l.color, fontSize: '1rem', marginBottom: '0.3rem' }}>{l.level} — {l.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--obs-muted)' }}>{l.desc}</div>
            </div>
          ))}
        </div>
        <div className="obs-tip">💡 <strong>可观测性全链路回顾</strong>：三大支柱(Metrics/Logs/Traces) → Prometheus(指标) → Grafana(可视化) → OpenTelemetry(统一SDK) → Jaeger(追踪) → Alertmanager(告警) → SLO(可靠性) → K8s 生产部署。<strong>与 K8s 运维、CI/CD、蓝队防御、性能优化等 7 门 DevOps 课程完美闭环。</strong></div>
      </div>
    </div>
  );
}
