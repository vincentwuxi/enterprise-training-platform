import { useState } from 'react';
import './LessonCommon.css';

export default function LessonSecurity() {
  const [tab, setTab] = useState('rbac');

  const codes = {
    rbac: `# ━━━━ RBAC 精细化权限管理 ━━━━

# Role（命名空间级）/ ClusterRole（集群级）
# RoleBinding / ClusterRoleBinding（绑定主体）

# 1. 创建只读 Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production
rules:
- apiGroups: [""]           # "" = core API group
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]  # 只读权限
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list"]

---
# 2. 为 ServiceAccount 创建绑定
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: monitoring-agent
  namespace: monitoring
- kind: User                # 也可以绑定用户
  name: john@company.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io

---
# 3. 应用专属 ServiceAccount（最小权限原则）
apiVersion: v1
kind: ServiceAccount
metadata:
  name: webapp-sa
  namespace: production
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/webapp-role  # IRSA

# 在 Pod 中使用
serviceAccountName: webapp-sa
automountServiceAccountToken: false  # 不需要API访问时关闭！

---
# 审计 RBAC 权限（实用命令）
kubectl auth can-i list pods --as=system:serviceaccount:production:webapp-sa
kubectl auth can-i create deployments --namespace=production
# 查看 ServiceAccount 所有权限
kubectl get clusterrolebindings -o json | jq '.items[] | select(.subjects[].name=="webapp-sa")'`,

    pss: `# ━━━━ Pod Security Standards (PSS) ━━━━
# Privileged（无限制）/ Baseline（基础防护）/ Restricted（最严格）

# 为 Namespace 设置安全策略（Kubernetes 1.25+ 内置）
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted      # 拒绝违规 Pod
    pod-security.kubernetes.io/audit: restricted        # 审计日志
    pod-security.kubernetes.io/warn: restricted         # 警告提示

---
# Restricted 策略要求的安全配置
spec:
  securityContext:
    runAsNonRoot: true          # 不能以 root 运行
    runAsUser: 1000             # 具体 UID
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault      # 使用 seccomp 过滤系统调用
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false   # 禁止提权
      readOnlyRootFilesystem: true      # 根文件系统只读
      capabilities:
        drop: ["ALL"]           # 丢弃所有 Linux Capabilities
        add: ["NET_BIND_SERVICE"]  # 仅在需要时添加最小权限
    volumeMounts:
    - name: tmp              # 需要写入时挂载专用目录
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}

---
# 镜像安全扫描（集成到 CI/CD）
# Trivy：最常用的开源镜像扫描
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest

# 在 K8s 中自动扫描（Trivy Operator）
helm install trivy-operator trivy/trivy-operator \
  --namespace trivy-system --create-namespace
kubectl get vulnerabilityreports -A  # 查看扫描结果`,

    network: `# ━━━━ 生产安全加固综合清单 ━━━━

# 1. etcd 静态加密（Secret 数据加密存储）
# /etc/kubernetes/encryption-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
- resources: [secrets]
  providers:
  - aescbc:
      keys:
      - name: key1
        secret: <base64-encoded-32-byte-key>  # openssl rand -base64 32
  - identity: {}   # 回退：允许读取未加密数据

# kube-apiserver 启动参数添加：
# --encryption-provider-config=/etc/kubernetes/encryption-config.yaml

---
# 2. API Server 审计日志
# --audit-log-path=/var/log/kubernetes/audit.log
# --audit-log-maxage=30
# --audit-log-maxbackup=10

# audit-policy.yaml
rules:
- level: RequestResponse   # 记录请求和响应
  resources:
  - group: ""
    resources: ["secrets"]  # 必须记录 Secret 操作
- level: Metadata           # 仅记录元数据
  verbs: ["delete", "create", "patch"]

---
# 3. 镜像仓库准入控制（只允许可信镜像）
# ValidatingAdmissionWebhook 或 OPA Gatekeeper
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/release-3.14/deploy/gatekeeper.yaml

# 只允许来自公司私有仓库的镜像
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sAllowedRepos
metadata:
  name: allow-company-registry
spec:
  match:
    kinds:
    - apiGroups: [""]
      kinds: ["Pod"]
  parameters:
    repos:
    - "registry.company.com/"
    - "gcr.io/distroless/"     # 允许 distroless 基础镜像

---
# 安全检查清单
# kubectl get pods -A -o json | jq '.items[] | select(.spec.securityContext.runAsRoot == true)'
# 检查暴露的 Secret：kubectl get secrets -A | grep -v "kubernetes.io"`,
  };

  return (
    <div className="k8s-lesson">
      <div className="k8s-hero">
        <div className="k8s-badge">// MODULE 07 · SECURITY HARDENING</div>
        <h1>安全加固</h1>
        <p>K8s 默认配置对生产并不安全。<strong>RBAC 最小权限、Pod Security Standards、NetworkPolicy 隔离、Secret 加密</strong>是生产集群的四道安全防线，缺一不可。</p>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">🛡️ 三层安全防线</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['rbac', '🔑 RBAC 最小权限'], ['pss', '🔒 Pod Security Standards'], ['network', '🔐 etcd加密 + 审计 + OPA']].map(([k, l]) => (
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
        <div className="k8s-section-title">✅ 生产安全 Checklist</div>
        <div className="k8s-grid-2">
          {[
            { title: '控制面安全', icon: '🏛️', items: ['etcd 启用静态加密', 'API Server 启用审计日志', 'kube-apiserver 限制匿名访问', 'Control Plane 节点网络隔离'] },
            { title: '工作负载安全', icon: '📦', items: ['所有 Pod 设置 securityContext', '使用 Namespace 级 PSS Restricted', 'automountServiceAccountToken: false', 'readOnlyRootFilesystem: true'] },
            { title: '网络安全', icon: '🌐', items: ['所有 Namespace 设置 default-deny NetworkPolicy', 'Ingress 启用 mTLS', '内部服务通信使用 ServiceMesh', '启用 Calico/Cilium 网络策略'] },
            { title: '镜像安全', icon: '🐳', items: ['CI/CD 集成 Trivy 扫描，CRITICAL 阻断', '只允许可信 Registry（OPA Gatekeeper）', '使用 distroless 基础镜像', 'Image Pull Secret 绑定 SA 而非全局'] },
          ].map((c, i) => (
            <div key={i} className="k8s-card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>{c.icon} {c.title}</div>
              {c.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.84rem', color: 'var(--k8s-muted)' }}>
                  <span style={{ color: 'var(--k8s-blue)', flexShrink: 0 }}>□</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
