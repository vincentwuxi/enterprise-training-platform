import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const K8S_OBJECTS = [
  {
    name: 'Pod', icon: '🫛',
    desc: 'K8s 最小调度单元，包含一个或多个共享网络/存储的容器',
    color: '#0db7ed',
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx         # 标签：Selector 用此匹配
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"    # 250 millicores = 0.25 核
      limits:
        memory: "128Mi"
        cpu: "500m"
    readinessProbe:    # 就绪检测：通过才接收流量
      httpGet:
        path: /healthz
        port: 80
      initialDelaySeconds: 5
    livenessProbe:     # 存活检测：失败则重启容器
      httpGet:
        path: /healthz
        port: 80`,
    note: '⚠️ 生产中不直接创建 Pod，而是通过 Deployment 管理（Pod 挂了不会自动恢复）',
  },
  {
    name: 'Deployment', icon: '🚀',
    desc: '管理 Pod 的副本数、滚动更新、回滚，是最常用的工作负载资源',
    color: '#326CE5',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: production
spec:
  replicas: 3              # 运行 3 个 Pod 副本
  selector:
    matchLabels:
      app: api             # 管理含此标签的 Pod
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # 更新时最多多出 1 个 Pod
      maxUnavailable: 0    # 更新时不允许任何 Pod 不可用
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myregistry/api:v2.1.0
        envFrom:
        - configMapRef:
            name: api-config
        - secretRef:
            name: api-secrets`,
    note: '✅ Deployment 是生产主力：自动维持副本数、滚动更新零停机',
  },
  {
    name: 'Service', icon: '🔌',
    desc: '为 Pod 提供稳定的访问地址（ClusterIP/NodePort/LoadBalancer）',
    color: '#10b981',
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api             # 代理含此标签的所有 Pod
  ports:
  - port: 80             # Service 对外端口
    targetPort: 8000     # Pod 内部端口
  type: ClusterIP        # 仅集群内可访问

---
# 对外暴露：LoadBalancer 类型（云厂商提供负载均衡器）
apiVersion: v1
kind: Service
metadata:
  name: api-lb
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer     # 自动创建云负载均衡器`,
    note: '🔌 Service 是 Pod 的稳定端点：Pod IP 会变，Service IP 不变',
  },
  {
    name: 'ConfigMap & Secret', icon: '🔐',
    desc: '外部化配置和敏感信息，与镜像解耦，实现"12-Factor App"',
    color: '#f59e0b',
    yaml: `# ConfigMap：非敏感配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  LOG_LEVEL: "info"
  MAX_WORKERS: "4"
  REDIS_DB: "0"

---
# Secret：敏感数据（base64 编码存储）
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
type: Opaque
stringData:             # stringData 自动 base64
  DB_PASSWORD: "超安全密码"
  JWT_SECRET: "jwt_secret_key_here"

# 在 Pod 中使用：
# envFrom:
# - configMapRef:
#     name: api-config
# - secretRef:
#     name: api-secrets`,
    note: '🔐 生产建议：使用 External Secrets Operator 对接 Vault/AWS Secrets Manager',
  },
];

export default function LessonK8sCore() {
  const navigate = useNavigate();
  const [activeObj, setActiveObj] = useState(0);

  return (
    <div className="lesson-dk">
      <div className="dk-badge">☸️ module_05 — Kubernetes 核心</div>

      <div className="dk-hero">
        <h1>Kubernetes 核心：Pod、Service 与 Deployment</h1>
        <p>Kubernetes（K8s）是<strong>容器编排的行业标准</strong>。它自动化容器的部署、扩缩容和故障恢复——你只需声明"期望状态"，K8s 负责实现它。</p>
      </div>

      {/* K8s 大图 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🗺️ Kubernetes 集群架构</h2>
        <div className="dk-arch" style={{ fontSize: '0.73rem' }}>{`
┌─────────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                                 │
│                                                                       │
│  ┌──────────────── Control Plane (主节点) ─────────────────────┐    │
│  │  API Server      etcd          Scheduler    Controller Mgr   │    │
│  │  (入口/认证)   (状态存储)    (调度决策)    (控制器循环)    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│           │                    │                    │                  │
│  ┌────────▼────┐    ┌──────────▼──────┐    ┌───────▼──────────┐    │
│  │  Node 1      │    │     Node 2       │    │     Node 3        │    │
│  │  (工作节点) │    │                  │    │                   │    │
│  │  kubelet    │    │    kubelet        │    │     kubelet       │    │
│  │  kube-proxy │    │    kube-proxy     │    │     kube-proxy    │    │
│  │  ┌───┐ ┌──┐│    │    ┌───┐  ┌───┐  │    │     ┌───┐         │    │
│  │  │Pod│ │P ││    │    │Pod│  │Pod│  │    │     │Pod│         │    │
│  │  └───┘ └──┘│    │    └───┘  └───┘  │    │     └───┘         │    │
│  └─────────────┘    └──────────────────┘    └───────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
  kubectl → API Server → Scheduler 决定放在哪个 Node → kubelet 启动 Pod`}</div>
      </div>

      {/* K8s 对象交互 */}
      <div className="dk-section">
        <h2 className="dk-section-title">📦 核心对象 YAML 详解（点击切换）</h2>
        <div className="dk-grid-4" style={{ marginBottom: '1rem' }}>
          {K8S_OBJECTS.map((o, i) => (
            <div key={o.name}
              onClick={() => setActiveObj(i)}
              style={{
                padding: '1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                background: activeObj === i ? `${o.color}14` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeObj === i ? o.color + '45' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{o.icon}</div>
              <div style={{ fontWeight: 700, color: activeObj === i ? o.color : '#e2e8f0', fontSize: '0.9rem' }}>{o.name}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>
          {K8S_OBJECTS[activeObj].desc}
        </div>
        <div className="dk-term-wrapper">
          <div className="dk-term-header">
            <div className="dk-term-dot" style={{ background: '#ef4444' }} />
            <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
            <div className="dk-term-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{K8S_OBJECTS[activeObj].name.toLowerCase().replace(' & ', '-')}.yaml</span>
          </div>
          <div className="dk-term" style={{ maxHeight: '380px', overflow: 'auto', fontSize: '0.75rem' }}>{K8S_OBJECTS[activeObj].yaml}</div>
        </div>
        <div style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', background: `${K8S_OBJECTS[activeObj].color}08`, border: `1px solid ${K8S_OBJECTS[activeObj].color}25`, borderRadius: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
          {K8S_OBJECTS[activeObj].note}
        </div>
      </div>

      {/* kubectl 核心命令 */}
      <div className="dk-section">
        <h2 className="dk-section-title">⌨️ kubectl 核心命令速查</h2>
        <div className="dk-card">
          <table className="dk-table">
            <thead><tr><th>命令</th><th>说明</th></tr></thead>
            <tbody>
              {[
                ['kubectl get pods -n production', '查看 production 命名空间的所有 Pod'],
                ['kubectl describe pod <name>', '查看 Pod 详细信息（排查问题首选）'],
                ['kubectl logs -f <pod> -c <container>', '实时跟踪容器日志'],
                ['kubectl exec -it <pod> -- bash', '进入 Pod 内部 Shell'],
                ['kubectl apply -f deployment.yaml', '应用/更新 YAML 配置（幂等）'],
                ['kubectl rollout status deployment/api', '查看 Deployment 滚动更新状态'],
                ['kubectl rollout undo deployment/api', '回滚到上一个版本'],
                ['kubectl scale deployment api --replicas=5', '手动扩容到 5 个副本'],
                ['kubectl port-forward pod/api-xxx 8080:8000', '本地端口转发到 Pod（调试用）'],
                ['kubectl top pods --sort-by memory', '查看 Pod 资源使用（按内存排序）'],
              ].map(([cmd, desc]) => (
                <tr key={cmd}>
                  <td><code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#0db7ed' }}>{cmd}</code></td>
                  <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dk-nav">
        <button className="dk-btn" onClick={() => navigate('/course/devops-mastery/lesson/compose')}>← 上一模块</button>
        <button className="dk-btn primary" onClick={() => navigate('/course/devops-mastery/lesson/k8sadvanced')}>下一模块：K8s 进阶 →</button>
      </div>
    </div>
  );
}
