import { useState } from 'react';
import './LessonCommon.css';

export default function LessonScheduling() {
  const [tab, setTab] = useState('resources');

  const codes = {
    resources: `# ━━━━ 资源请求 / 限制 / QoS 三层机制 ━━━━

containers:
- name: app
  resources:
    requests:             # 调度依据（Scheduler 看 requests）
      cpu: "250m"         # 0.25 core（1000m = 1 core）
      memory: "256Mi"
    limits:               # 上限（超出则限速/OOM Kill）
      cpu: "1000m"        # CPU 被 throttle（不会 Kill）
      memory: "512Mi"     # 内存超限 → OOM Kill！

# ━━━━ QoS 类别（影响驱逐优先级）━━━━
# Guaranteed：requests == limits（最不易被驱逐）
#   数据库、关键服务
# Burstable：requests < limits（中等优先级）
#   大多数生产服务
# BestEffort：无 requests/limits（最先被驱逐！）
#   仅测试环境

# ━━━━ LimitRange（命名空间级默认值）━━━━
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: production
spec:
  limits:
  - type: Container
    default:          # 未设置 limits 时的默认值
      cpu: "500m"
      memory: "256Mi"
    defaultRequest:   # 未设置 requests 时的默认值
      cpu: "100m"
      memory: "128Mi"
    max:              # 允许的最大值
      cpu: "4"
      memory: "4Gi"

# ━━━━ ResourceQuota（命名空间资源配额）━━━━
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
spec:
  hard:
    requests.cpu: "40"          # 所有 Pod requests 总和
    requests.memory: "80Gi"
    limits.cpu: "80"
    limits.memory: "160Gi"
    pods: "200"                 # 最多 Pod 数
    services: "50"
    persistentvolumeclaims: "20"`,

    hpa: `# ━━━━ HPA / VPA / KEDA 自动扩缩容 ━━━━

# 1. HPA（水平扩缩容，增减 Pod 数量）
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70    # CPU 使用率超 70% 扩容
  - type: Resource
    resource:
      name: memory
      target:
        type: AverageValue
        averageValue: 400Mi       # 内存超 400Mi 扩容
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60    # 扩容冷却 60s
      policies:
      - type: Pods
        value: 4
        periodSeconds: 60               # 每分钟最多加 4 Pod
    scaleDown:
      stabilizationWindowSeconds: 300   # 缩容冷却 5 分钟（防抖动）

---
# 2. VPA（垂直扩缩容，调整 requests/limits）
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: webapp-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp
  updatePolicy:
    updateMode: "Off"     # Off（推荐建议）/ Initial / Auto
  # kubectl get vpa webapp-vpa --output yaml → 看推荐值

---
# 3. KEDA（基于事件的扩缩容，支持 Kafka/RabbitMQ/Prometheus等）
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: queue-scaler
spec:
  scaleTargetRef:
    name: worker-deployment
  minReplicaCount: 0        # 可以缩容到 0！（节省成本）
  maxReplicaCount: 100
  triggers:
  - type: rabbitmq
    metadata:
      queueName: task-queue
      queueLength: "50"     # 每 50 条消息 1 个 Worker`,

    affinity: `# ━━━━ 节点亲和性 / 污点容忍 / Pod 分散部署 ━━━━

spec:
  # ━━━━ 1. 节点亲和性（选择 Node 的条件）━━━━
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:  # 硬性要求
        nodeSelectorTerms:
        - matchExpressions:
          - key: node.kubernetes.io/instance-type
            operator: In
            values: ["m5.xlarge", "m5.2xlarge"]       # 只调度到这些机型
      preferredDuringSchedulingIgnoredDuringExecution: # 软性偏好
      - weight: 100
        preference:
          matchExpressions:
          - key: topology.kubernetes.io/zone
            operator: In
            values: ["cn-beijing-a"]                   # 优先 a 区

    # ━━━━ 2. Pod 亲和性/反亲和性（控制 Pod 间位置关系）━━━━
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: webapp                                # 同一 app 的 Pod
        topologyKey: kubernetes.io/hostname            # 必须在不同节点！

  # ━━━━ 3. 污点容忍（访问特殊节点，如 GPU 节点）━━━━
  tolerations:
  - key: "nvidia.com/gpu"
    operator: "Exists"
    effect: "NoSchedule"

---
# 给 GPU 节点打污点（防止普通 Pod 占用）
kubectl taint nodes gpu-node-1 nvidia.com/gpu=true:NoSchedule

# 给特殊节点打标签
kubectl label nodes node-1 disk=ssd zone=cn-beijing-a

---
# ━━━━ TopologySpreadConstraints（跨区均匀分布）━━━━
topologySpreadConstraints:
- maxSkew: 1                          # 允许最大不均衡 1 个
  topologyKey: topology.kubernetes.io/zone
  whenUnsatisfiable: DoNotSchedule    # 不满足时不调度
  labelSelector:
    matchLabels:
      app: webapp`,
  };

  return (
    <div className="k8s-lesson">
      <div className="k8s-hero">
        <div className="k8s-badge">// MODULE 05 · SCHEDULING & SCALING</div>
        <h1>资源管理与调度优化</h1>
        <p>资源设置不当是 K8s 生产事故的头号元凶：<strong>requests 太低导致 OOM、limits 太低导致 CPU throttle、HPA 抖动导致服务不稳定</strong>。本模块彻底解决资源管理难题。</p>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">⚖️ 资源管理三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['resources', '📊 Requests/Limits/QoS'], ['hpa', '📈 HPA/VPA/KEDA'], ['affinity', '🎯 亲和性/污点/分散']].map(([k, l]) => (
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

      <div className="k8s-section">
        <div className="k8s-section-title">💡 资源调优黄金法则</div>
        <div className="k8s-grid-2">
          {[
            { title: '初始值设定', color: '#3b82f6', items: ['先用 VPA 的 Off 模式观察 7 天，看实际使用量推荐', 'requests = 平均使用量 × 1.5（安全余量）', 'limits = 峰值使用量 × 1.5', 'CPU limits 通常设为 CPU requests 的 3-4 倍'] },
            { title: 'HPA 防抖动设置', color: '#f97316', items: ['scaleDown stabilizationWindowSeconds ≥ 300（5分钟）', 'scaleDown 每次最多缩减 20%（避免剧烈缩容）', 'CPU 目标值建议 60-70%（不要 80%+）', '生产：minReplicas ≥ 2（单 Pod 无法滚动更新）'] },
            { title: 'OOM Kill 排查', color: '#ef4444', items: ['kubectl describe pod <name> → Exit Code 137 = OOM', 'kubectl top pod → 观察内存峰值', 'memory limits 不能设得太低', 'Java 应用：-Xmx 必须小于 memory limits'] },
            { title: 'CPU Throttle 排查', color: '#22c55e', items: ['kubectl top pod 看使用率，Prometheus 看 throttled 指标', 'CPU limits 限流（不 Kill），导致延迟增加', '通过 rate(container_cpu_cfs_throttled_periods_total) 检测', '解法：提高 CPU limits 或优化代码'] },
          ].map((c, i) => (
            <div key={i} className="k8s-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 700, color: c.color, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{c.title}</div>
              {c.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.84rem', color: 'var(--k8s-muted)' }}>
                  <span style={{ color: c.color, flexShrink: 0 }}>→</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
