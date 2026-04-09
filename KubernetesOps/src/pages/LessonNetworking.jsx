import { useState } from 'react';
import './LessonCommon.css';

const NET_TABS = ['service', 'ingress', 'networkpolicy', 'cni'];

const CODES = {
  service: `# ━━━━ Service 四种类型全解 ━━━━

# 1. ClusterIP（默认，集群内访问）
apiVersion: v1
kind: Service
metadata:
  name: webapp-svc
spec:
  selector:
    app: webapp
  ports:
  - port: 80         # Service 暴露端口
    targetPort: 8080  # Pod 实际端口
  type: ClusterIP    # 仅集群内可访问
  # 访问：webapp-svc.default.svc.cluster.local:80

---
# 2. NodePort（节点端口，直接访问）
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080      # 节点上 30000-32767 范围
  # 访问：<任意节点IP>:30080（生产不推荐，改用 LoadBalancer）

---
# 3. LoadBalancer（云厂商 LB）
spec:
  type: LoadBalancer   # 云厂商自动创建 CLB/ALB/NLB
  ports:
  - port: 443
    targetPort: 8080

---
# 4. Headless Service（直接DNS到Pod，StatefulSet必用）
spec:
  clusterIP: None      # 关键：不分配 ClusterIP
  selector:
    app: mysql
  ports:
  - port: 3306
  # DNS: mysql-0.mysql.default.svc.cluster.local → Pod IP

---
# 调试 Service
kubectl get svc -o wide
kubectl get endpoints webapp-svc    # 检查 EP 是否有 Pod
kubectl run tmp --image=busybox --rm -it -- wget -qO- http://webapp-svc`,

  ingress: `# ━━━━ Ingress + Ingress Controller ━━━━

# 安装 NGINX Ingress Controller（Helm）
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.metrics.enabled=true

---
# ━━━━ Ingress 规则配置 ━━━━
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"     # 限流
    cert-manager.io/cluster-issuer: "letsencrypt-prod" # 自动 TLS
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls-cert         # cert-manager 自动填充
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api                   # /api/* → backend service
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
      - path: /                      # /* → frontend
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: admin.example.com          # 不同域名不同 Service
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 80

# cert-manager 安装（自动 HTTPS）
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml`,

  networkpolicy: `# ━━━━ NetworkPolicy 网络隔离 ━━━━

# 默认：K8s 所有 Pod 互通，生产必须加 NetworkPolicy！

# 1. 拒绝所有入站流量（默认关闭策略）
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}          # 选择所有 Pod
  policyTypes:
  - Ingress                # 默认拒绝所有入站

---
# 2. 只允许特定 Namespace 访问
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: backend         # 保护 backend Pod
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:    # 只允许 frontend NS 进来
        matchLabels:
          name: frontend
      podSelector:          # 进一步限制：只有 frontend Pod
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080

---
# 3. 限制出站（防止数据外泄）
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock:
        cidr: 10.0.0.0/8  # 只允许访问内网
  - ports:
    - port: 53             # 允许 DNS 查询（必须！）
      protocol: UDP`,

  cni: `# ━━━━ CNI 插件对比与选型 ━━━━

# ┌──────────┬────────┬──────────┬──────────┬──────────────────┐
# │ CNI      │ 性能   │ NetworkP │ eBPF     │ 推荐场景          │
# ├──────────┼────────┼──────────┼──────────┼──────────────────┤
# │ Flannel  │ 一般   │ ❌ 不支持 │ ❌       │ 测试/简单环境     │
# │ Calico   │ 好     │ ✅ 完整  │ ⚠️ 可选  │ 企业生产首选      │
# │ Cilium   │ 极好   │ ✅ L7级  │ ✅ 原生  │ 高性能/服务网格   │
# │ Weave    │ 一般   │ ✅       │ ❌       │ 多云场景          │
# └──────────┴────────┴──────────┴──────────┴──────────────────┘

# ━━━━ 安装 Calico（生产推荐）━━━━
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml

# ━━━━ 安装 Cilium（高性能 eBPF）━━━━
helm repo add cilium https://helm.cilium.io/
helm install cilium cilium/cilium \
  --namespace kube-system \
  --set kubeProxyReplacement=true  # 完全替代 kube-proxy！

# ━━━━ CoreDNS 调优 ━━━━
# DNS 是 K8s 服务发现的骨干，慢查询是常见性能问题
kubectl -n kube-system get cm coredns -o yaml
# 增加缓存（减少上游 DNS 查询）
# cache 30 → cache 60

# DNS 调试
kubectl run -it --rm debug --image=busybox -- nslookup webapp-svc
kubectl run -it --rm debug --image=busybox -- nslookup webapp-svc.production.svc.cluster.local

# 查看 DNS 延迟（生产监控指标）
kubectl -n kube-system exec $(kubectl -n kube-system get pod -l k8s-app=kube-dns -o name | head -1) \
  -- curl -s localhost:9153/metrics | grep coredns_dns_request_duration`,
};

export default function LessonNetworking() {
  const [tab, setTab] = useState('service');

  return (
    <div className="k8s-lesson">
      <div className="k8s-hero">
        <div className="k8s-badge">// MODULE 03 · NETWORKING</div>
        <h1>网络深度实战</h1>
        <p>K8s 网络是最复杂的部分，也是最容易出故障的地方。<strong>Service 类型选错、Ingress 配置错误、NetworkPolicy 遗漏</strong>是生产事故的三大常见根源。本模块从原理到实战全覆盖。</p>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">🌐 K8s 四大网络模型</div>
        <div className="k8s-grid-4" style={{ marginBottom: '1.5rem' }}>
          {[
            { title: 'Pod 到 Pod', desc: '所有 Pod 直接可达（同节点 bridge / 跨节点 CNI overlay）', color: '#3b82f6' },
            { title: 'Pod 到 Service', desc: 'kube-proxy iptables/ipvs 规则转发到健康 Pod', color: '#0ea5e9' },
            { title: '外部到 Service', desc: 'NodePort / LoadBalancer / Ingress', color: '#f97316' },
            { title: 'DNS 服务发现', desc: 'CoreDNS：svc-name.namespace.svc.cluster.local', color: '#22c55e' },
          ].map((m, i) => (
            <div key={i} className="k8s-card" style={{ borderTop: `3px solid ${m.color}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: m.color, marginBottom: '0.4rem' }}>{m.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--k8s-muted)', lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['service', '⚡ Service 类型'], ['ingress', '🌍 Ingress + TLS'], ['networkpolicy', '🛡️ NetworkPolicy'], ['cni', '🔌 CNI 对比']].map(([k, l]) => (
            <button key={k} className={`k8s-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="k8s-code-wrap">
          <div className="k8s-code-head">
            <div className="k8s-code-dot" style={{ background: '#ef4444' }} /><div className="k8s-code-dot" style={{ background: '#f59e0b' }} /><div className="k8s-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.yaml</span>
          </div>
          <div className="k8s-code">{CODES[tab]}</div>
        </div>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">🔍 网络故障速查</div>
        <div className="k8s-card" style={{ overflowX: 'auto' }}>
          <table className="k8s-table">
            <thead><tr><th>现象</th><th>最可能原因</th><th>排查命令</th></tr></thead>
            <tbody>
              {[
                ['Pod 无法访问 Service', 'Selector 不匹配 / Endpoint 为空', 'kubectl get ep <svc-name>'],
                ['DNS 解析失败', 'CoreDNS 崩溃 / NetworkPolicy 阻断 53 UDP', 'kubectl get pods -n kube-system | grep coredns'],
                ['外部流量进不来', 'Ingress Controller 未就绪 / 证书过期', 'kubectl get ingress -A; kubectl describe ingress'],
                ['跨 NS 流量被拒', 'NetworkPolicy 过于严格', 'kubectl get networkpolicy -A; 检查 Egress/Ingress 规则'],
                ['服务间延迟高', 'kube-proxy iptables 规则过多（>1万条）', '考虑迁移到 ipvs 或 Cilium eBPF 模式'],
              ].map(([s, r, cmd], i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--k8s-red)', fontSize: '0.84rem', fontWeight: 600 }}>{s}</td>
                  <td style={{ color: 'var(--k8s-muted)', fontSize: '0.83rem' }}>{r}</td>
                  <td><code style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.75rem', color: 'var(--k8s-blue2)' }}>{cmd}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
