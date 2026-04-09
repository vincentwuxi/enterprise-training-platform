import { useState } from 'react';
import './LessonCommon.css';

export default function LessonStorage() {
  const [tab, setTab] = useState('pvc');

  const codes = {
    pvc: `# ━━━━ PV / PVC / StorageClass 三层存储模型 ━━━━

# StorageClass（存储类，定义"存储的类型"）
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: ebs.csi.aws.com        # AWS EBS CSI 驱动
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
reclaimPolicy: Retain                # Delete（开发）/ Retain（生产）
allowVolumeExpansion: true           # 允许动态扩容
volumeBindingMode: WaitForFirstConsumer  # 延迟绑定，优先本地调度

---
# PVC（持久卷声明，应用申请存储）
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-data
  namespace: production
spec:
  accessModes:
  - ReadWriteOnce              # RWO（单节点）/ RWX（多节点，NFS类）
  storageClassName: fast-ssd   # 使用上面的 StorageClass
  resources:
    requests:
      storage: 100Gi

---
# 在 Pod 中使用 PVC
volumes:
- name: data
  persistentVolumeClaim:
    claimName: mysql-data
containers:
- name: mysql
  volumeMounts:
  - name: data
    mountPath: /var/lib/mysql

---
# 动态扩容（不停机）
kubectl patch pvc mysql-data -p '{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}'
kubectl get pvc mysql-data --watch   # 观察扩容状态`,

    configmap: `# ━━━━ ConfigMap 配置管理最佳实践 ━━━━

# 创建 ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  # 简单键值对
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
  # 完整配置文件
  app.yaml: |
    server:
      port: 8080
      timeout: 30s
    database:
      pool_size: 10

---
# 使用方式1：环境变量（引用单个值）
env:
- name: LOG_LEVEL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: LOG_LEVEL

---
# 使用方式2：全部注入为环境变量
envFrom:
- configMapRef:
    name: app-config

---
# 使用方式3：挂载为文件（支持热更新！）
volumes:
- name: config
  configMap:
    name: app-config
    items:
    - key: app.yaml
      path: config.yaml
containers:
- volumeMounts:
  - name: config
    mountPath: /etc/app           # /etc/app/config.yaml
    readOnly: true

# ⚠️ 注意：ConfigMap 更新后：
# - 环境变量注入：需重启 Pod 才生效
# - Volume 挂载：kubelet 自动同步（约1-2分钟）

# 最佳实践：使用版本化的 ConfigMap 名称
# app-config-v1 → app-config-v2（蓝绿切换）`,

    secret: `# ━━━━ Secret 安全管理 ━━━━

# ⚠️ 重要：K8s Secret 仅做 base64 编码，不是加密！
# 生产必须配合 Sealed Secrets 或 Vault 使用

# 创建 Secret（命令行，避免 YAML 中明文）
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password='S3cur3P@ssw0rd' \
  --from-file=tls.crt=/path/to/cert.crt \
  --from-file=tls.key=/path/to/cert.key

---
# 使用 Secret（建议 Volume 挂载，非 env）
volumes:
- name: db-creds
  secret:
    secretName: db-credentials
    defaultMode: 0400          # 只读，最小权限
containers:
- volumeMounts:
  - name: db-creds
    mountPath: /etc/secrets
    readOnly: true

---
# ━━━━ Sealed Secrets（加密存入 Git）━━━━
# 安装 kubeseal
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system

# 加密 Secret（只有集群能解密）
kubectl create secret generic db-cred --dry-run=client \
  --from-literal=password='mypassword' -o yaml | \
  kubeseal --format=yaml > sealed-secret.yaml

# SealedSecret 可以安全提交到 Git！
git add sealed-secret.yaml && git commit -m "add sealed db secret"

---
# ━━━━ HashiCorp Vault 集成 ━━━━
# Vault Agent Sidecar 自动注入 Secret 到 Pod
annotations:
  vault.hashicorp.com/agent-inject: "true"
  vault.hashicorp.com/role: "my-app"
  vault.hashicorp.com/agent-inject-secret-db: "secret/data/db"
  # Secret 自动注入到 /vault/secrets/db`,
  };

  return (
    <div className="k8s-lesson">
      <div className="k8s-hero">
        <div className="k8s-badge">// MODULE 04 · STORAGE & CONFIG</div>
        <h1>存储与配置管理</h1>
        <p>配置和存储是应用运行的"地基"。<strong>ConfigMap 热更新机制、Secret 安全存储、StorageClass 动态供给、PVC 扩容</strong>——这些是生产运维中最高频的操作点。</p>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">💾 存储与配置核心主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['pvc', '💾 PV/PVC/StorageClass'], ['configmap', '⚙️ ConfigMap 热更新'], ['secret', '🔐 Secret 安全管理']].map(([k, l]) => (
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
        <div className="k8s-section-title">🗺️ 存储访问模式速查</div>
        <div className="k8s-card" style={{ overflowX: 'auto' }}>
          <table className="k8s-table">
            <thead><tr><th>AccessMode</th><th>含义</th><th>存储类型</th><th>典型场景</th></tr></thead>
            <tbody>
              {[
                ['ReadWriteOnce (RWO)', '单节点读写', 'EBS / 本地磁盘', '数据库（MySQL/PostgreSQL）'],
                ['ReadOnlyMany (ROX)', '多节点只读', 'NFS / EFS', '共享静态资源（图片/配置）'],
                ['ReadWriteMany (RWX)', '多节点读写', 'NFS / EFS / CephFS', '共享上传文件 / 日志收集'],
                ['ReadWriteOncePod (RWOP)', '单 Pod 独占', 'EBS（K8s 1.22+）', '严格单写入者场景'],
              ].map(([m, d, t, s], i) => (
                <tr key={i}>
                  <td><span className="k8s-tag blue">{m}</span></td>
                  <td style={{ color: 'var(--k8s-muted)', fontSize: '0.84rem' }}>{d}</td>
                  <td style={{ color: 'var(--k8s-muted)', fontSize: '0.84rem' }}>{t}</td>
                  <td style={{ color: 'var(--k8s-muted)', fontSize: '0.84rem' }}>{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="k8s-warn">
          ⚠️ <strong>Secret 安全红线：</strong>K8s 原生 Secret 仅 base64 编码（可直接 decode），明文存在 etcd 中。生产环境必须：① 启用 etcd 静态加密 + ② 使用 Sealed Secrets 或 Vault 管理密钥，绝不把原始 Secret YAML 提交到 Git。
        </div>
      </div>
    </div>
  );
}
