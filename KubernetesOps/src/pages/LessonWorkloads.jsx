import { useState } from 'react';
import './LessonCommon.css';

const WORKLOADS = [
  {
    key: 'deployment', name: 'Deployment', icon: '🚀',
    desc: '无状态应用首选。管理 ReplicaSet，支持滚动更新、回滚、扩缩容。',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1      # 最多1个Pod不可用
      maxSurge: 1            # 最多超出1个Pod
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: myapp:v2.1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "100m"       # 0.1 core
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:       # 就绪探针（影响流量）
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:        # 存活探针（触发重启）
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 15
          failureThreshold: 3

---
# 滚动更新
kubectl set image deployment/webapp webapp=myapp:v2.2.0
kubectl rollout status deployment/webapp   # 观察进度
kubectl rollout undo deployment/webapp     # 紧急回滚
kubectl rollout history deployment/webapp  # 版本历史`,
  },
  {
    key: 'statefulset', name: 'StatefulSet', icon: '🗄️',
    desc: '有状态应用专用（数据库/消息队列）。Pod 有稳定网络标识和持久存储，有序启动/停止。',
    yaml: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: "mysql"           # 必须配合 headless service
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  # 每个 Pod 自动创建独立 PVC！
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "fast-ssd"
      resources:
        requests:
          storage: 50Gi

---
# Pod 有稳定名称：mysql-0, mysql-1, mysql-2
# DNS：mysql-0.mysql.default.svc.cluster.local
# 启动顺序：0 → 1 → 2  停止顺序：2 → 1 → 0
kubectl get pods -l app=mysql -o wide
kubectl exec -it mysql-0 -- mysql -uroot -p`,
  },
  {
    key: 'daemonset', name: 'DaemonSet', icon: '👹',
    desc: '每个 Node 上运行一个 Pod。典型用途：日志收集（Fluentd）、监控（node-exporter）、网络插件（CNI）。',
    yaml: `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      # 容忍 Control Plane 节点（默认不调度到 master）
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
      hostNetwork: true        # 使用节点网络（监控宿主机）
      hostPID: true            # 访问节点进程（日志收集需要）
      containers:
      - name: node-exporter
        image: prom/node-exporter:v1.7.0
        ports:
        - containerPort: 9100
          hostPort: 9100
        securityContext:
          runAsNonRoot: true
          runAsUser: 65534
        volumeMounts:
        - name: proc
          mountPath: /host/proc
          readOnly: true
      volumes:
      - name: proc
        hostPath:
          path: /proc

# 查看每个节点上的 DaemonSet Pod
kubectl get pods -n monitoring -o wide | grep node-exporter`,
  },
  {
    key: 'job', name: 'Job / CronJob', icon: '⏰',
    desc: 'Job 保证任务运行到完成（批处理）。CronJob 按 cron 表达式定时执行。',
    yaml: `# ━━━━ Job（一次性任务）━━━━
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  completions: 1           # 成功完成总数
  parallelism: 1           # 并行 Pod 数
  backoffLimit: 3          # 失败重试次数
  activeDeadlineSeconds: 300  # 超时秒数
  template:
    spec:
      restartPolicy: OnFailure  # Job 必须是 OnFailure 或 Never
      containers:
      - name: migration
        image: myapp:latest
        command: ["python", "manage.py", "migrate"]

---
# ━━━━ CronJob（定时任务）━━━━
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-db
spec:
  schedule: "0 2 * * *"     # 每天凌晨2点
  concurrencyPolicy: Forbid  # 禁止并发运行
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: backup
            image: backup-tool:latest
            env:
            - name: DB_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url

kubectl get jobs          # 查看 Job 状态
kubectl get cronjobs      # 查看 CronJob
kubectl logs job/db-migration  # 查看日志`,
  },
];

export default function LessonWorkloads() {
  const [wl, setWl] = useState('deployment');
  const w = WORKLOADS.find(x => x.key === wl) ?? {};

  return (
    <div className="k8s-lesson">
      <div className="k8s-hero">
        <div className="k8s-badge">// MODULE 02 · WORKLOADS</div>
        <h1>工作负载高级编排</h1>
        <p>K8s 提供多种工作负载资源，<strong>选错资源类型是最常见的架构错误</strong>。Deployment 用于无状态，StatefulSet 用于有状态，DaemonSet 用于节点级守护进程——每种都有不可替代的场景。</p>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">📦 四种核心工作负载</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {WORKLOADS.map(w => (
            <button key={w.key} className={`k8s-btn ${wl === w.key ? 'active' : ''}`} onClick={() => setWl(w.key)}>
              {w.icon} {w.name}
            </button>
          ))}
        </div>
        <div className="k8s-card" style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{w.icon} {w.name}</div>
          <div style={{ color: 'var(--k8s-muted)', fontSize: '0.87rem', marginBottom: '0' }}>{w.desc}</div>
        </div>
        <div className="k8s-code-wrap">
          <div className="k8s-code-head">
            <div className="k8s-code-dot" style={{ background: '#ef4444' }} /><div className="k8s-code-dot" style={{ background: '#f59e0b' }} /><div className="k8s-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{w.key}.yaml</span>
          </div>
          <div className="k8s-code">{w.yaml}</div>
        </div>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">🔍 Pod 生命周期与探针详解</div>
        <div className="k8s-grid-2">
          {[
            { name: 'startupProbe', color: '#f97316', desc: '容器启动完成前的探针。成功后才启动 liveness。适合慢启动应用（Java/大型服务）。', yaml: `startupProbe:\n  httpGet:\n    path: /ready\n    port: 8080\n  failureThreshold: 30   # 最多等待30次\n  periodSeconds: 10      # 每10s检查一次\n  # 最多等待 300s 启动` },
            { name: 'readinessProbe', color: '#3b82f6', desc: '判断 Pod 是否可以接收流量。失败时从 Service Endpoints 移除，但不重启容器。', yaml: `readinessProbe:\n  httpGet:\n    path: /health\n    port: 8080\n  initialDelaySeconds: 5\n  periodSeconds: 10\n  successThreshold: 1\n  failureThreshold: 3` },
            { name: 'livenessProbe', color: '#ef4444', desc: '判断容器是否存活。失败时重启容器。⚠️ 谨慎使用：误配会导致死亡循环。', yaml: `livenessProbe:\n  httpGet:\n    path: /health\n    port: 8080\n  initialDelaySeconds: 15  # 给足启动时间！\n  periodSeconds: 20\n  failureThreshold: 3\n  # 失败3次 = 重启容器` },
            { name: 'Pod 终止流程', color: '#22c55e', desc: '优雅终止（Graceful Shutdown）：先从 Service 移除，再发 SIGTERM，等待 terminationGracePeriodSeconds（默认30s），最后 SIGKILL。', yaml: `spec:\n  terminationGracePeriodSeconds: 60\n  containers:\n  - name: app\n    lifecycle:\n      preStop:\n        exec:\n          command: ["sleep", "5"]  # 给LB摘流量时间\n    # 程序需处理 SIGTERM 信号优雅退出` },
          ].map((p, i) => (
            <div key={i} className="k8s-card" style={{ borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontWeight: 700, color: p.color, marginBottom: '0.5rem', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.9rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--k8s-muted)', marginBottom: '0.75rem', lineHeight: 1.65 }}>{p.desc}</div>
              <div className="k8s-code-wrap" style={{ margin: 0 }}>
                <div className="k8s-code" style={{ fontSize: '0.72rem', maxHeight: 150 }}>{p.yaml}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick comparison */}
      <div className="k8s-section">
        <div className="k8s-section-title">📊 工作负载选型速查表</div>
        <div className="k8s-card" style={{ overflowX: 'auto' }}>
          <table className="k8s-table">
            <thead><tr><th>场景</th><th>推荐资源</th><th>关键特性</th><th>典型应用</th></tr></thead>
            <tbody>
              {[
                ['无状态 Web/API 服务', 'Deployment', '滚动更新 + 回滚 + HPA', 'Nginx / Node.js / FastAPI'],
                ['数据库 / 消息队列', 'StatefulSet', '稳定网络ID + 持久存储 + 有序启动', 'MySQL / Redis / Kafka'],
                ['每节点守护进程', 'DaemonSet', '每 Node 必跑一个', 'Fluentd / Prometheus Node Exporter'],
                ['批处理 / 数据导入', 'Job', '保证完成 + 失败重试', '数据库迁移 / 机器学习训练'],
                ['定时任务', 'CronJob', 'Cron 表达式调度', '定时备份 / 报告生成'],
              ].map(([s, r, k, e], i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.84rem', color: 'var(--k8s-muted)' }}>{s}</td>
                  <td><span className="k8s-tag blue">{r}</span></td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--k8s-muted)' }}>{k}</td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--k8s-muted)' }}>{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
