import { useState } from 'react';
import './LessonCommon.css';

const COMPONENTS = [
  {
    key: 'apiserver', name: 'API Server', plane: 'control', icon: '🌐',
    desc: '集群的唯一入口，所有操作（kubectl/SDK/Controller）都必须经过 API Server。负责认证/授权/准入控制/数据持久化。',
    details: ['RESTful HTTP/gRPC 接口，监听 :6443', '认证 → 授权（RBAC）→ 准入控制器链', '读写 etcd（唯一直接操作 etcd 的组件）', 'Watch 机制：通知其他组件变化'],
    cmd: 'kubectl get --raw /api/v1/namespaces | jq .items[].metadata.name',
  },
  {
    key: 'etcd', name: 'etcd', plane: 'control', icon: '🗄️',
    desc: '分布式强一致性 KV 存储，K8s 的"大脑记忆"。存储所有集群状态（Pod/Service/ConfigMap 等所有对象）。',
    details: ['Raft 共识协议保证强一致性', '生产必须 3/5 节点高可用', '数据全部在 /registry/ 前缀下', '推荐定期备份（etcdctl snapshot save）'],
    cmd: 'etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /backup/etcd-$(date +%Y%m%d).db',
  },
  {
    key: 'scheduler', name: 'Scheduler', plane: 'control', icon: '📅',
    desc: '负责将 Pending 状态的 Pod 分配到合适的 Node。通过过滤（Filtering）+ 打分（Scoring）两阶段决策。',
    details: ['Filtering：排除不可用节点（资源不足/污点/亲和性）', 'Scoring：对可用节点打分（资源均衡/亲和度/拓扑分散）', '支持自定义调度插件（Scheduler Framework）', '一次只调度一个 Pod，避免锁竞争'],
    cmd: 'kubectl get events --field-selector reason=Scheduled -n production',
  },
  {
    key: 'controller', name: 'Controller Manager', plane: 'control', icon: '⚙️',
    desc: '运行所有核心控制器的进程。每个控制器监控特定资源，不断将"当前状态"调整为"期望状态"（Reconcile 循环）。',
    details: ['Deployment Controller：管理 ReplicaSet 滚动更新', 'Node Controller：监控节点心跳，标记 NotReady', 'Job Controller：确保 Job 运行到完成', 'Service Account Controller：自动创建默认 SA'],
    cmd: 'kubectl get events --field-selector reason=SuccessfulCreate',
  },
  {
    key: 'kubelet', name: 'kubelet', plane: 'node', icon: '🤖',
    desc: '每个 Node 上的节点代理。从 API Server Watch Pod spec，通过 CRI（containerd）实际创建/删除容器，并上报节点和 Pod 状态。',
    details: ['从 API Server 接收 Pod 规格，调用 CRI 创建容器', '通过 cAdvisor 采集容器资源使用数据', '执行 liveness/readiness/startup 探针', '管理 Volume 挂载和 ConfigMap/Secret 注入'],
    cmd: 'journalctl -u kubelet -f --since "5 minutes ago"',
  },
  {
    key: 'kube-proxy', name: 'kube-proxy', plane: 'node', icon: '🔀',
    desc: '负责在每个节点上维护网络规则，实现 Service 的负载均衡。默认使用 iptables 模式（新版推荐 ipvs 模式）。',
    details: ['监控 Service 和 Endpoints 变化', 'iptables 模式：写入 DNAT 规则转发流量', 'ipvs 模式：更高性能，支持更多 LB 算法', 'Cilium 等 eBPF CNI 可替代 kube-proxy'],
    cmd: 'kubectl -n kube-system exec -it ds/kube-proxy -- iptables -t nat -L KUBE-SERVICES | head -20',
  },
];

const REQUEST_FLOW = [
  { step: '1', label: 'kubectl apply', desc: '用户发起请求，提交 YAML 到 API Server（HTTPS :6443）' },
  { step: '2', label: '认证（Authn）', desc: 'API Server 验证证书/Token/OIDC，确认"你是谁"' },
  { step: '3', label: '授权（RBAC）', desc: '检查 ClusterRole/Role 绑定，确认"你能做什么"' },
  { step: '4', label: '准入控制', desc: 'MutatingWebhook（修改对象）+ ValidatingWebhook（验证）' },
  { step: '5', label: '写入 etcd', desc: '对象持久化到 etcd，状态变为 Pending' },
  { step: '6', label: 'Scheduler 调度', desc: 'Watch 到新 Pod，两阶段选出最佳 Node，写回 API Server' },
  { step: '7', label: 'kubelet 创建', desc: '目标 Node 的 kubelet Watch 到绑定，调用 containerd 创建容器' },
  { step: '8', label: '状态上报', desc: 'kubelet 定期上报 Pod 状态，最终变为 Running' },
];

export default function LessonArchitecture() {
  const [comp, setComp] = useState('apiserver');
  const c = COMPONENTS.find(x => x.key === comp) ?? {};

  return (
    <div className="k8s-lesson">
      <div className="k8s-hero">
        <div className="k8s-badge">// MODULE 01 · K8S ARCHITECTURE</div>
        <h1>K8s 架构深度解析</h1>
        <p>每个 SRE/DevOps 都知道 Kubernetes，但真正懂"<strong>一个 kubectl apply 背后发生了什么</strong>"的人并不多。理解架构是所有高级运维能力的基础。</p>
      </div>

      {/* Stats */}
      <div className="k8s-section">
        <div className="k8s-grid-4">
          {[
            { v: '7', l: 'Control Plane 核心组件' },
            { v: '2', l: '认证+授权关卡' },
            { v: 'etcd', l: '唯一状态存储' },
            { v: '~100ms', l: '典型 Pod 调度延迟' },
          ].map((s, i) => (
            <div key={i} className="k8s-metric">
              <div className="k8s-metric-val">{s.v}</div>
              <div className="k8s-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Components */}
      <div className="k8s-section">
        <div className="k8s-section-title">⚙️ 核心组件解析</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {COMPONENTS.map(c => (
            <button key={c.key} className={`k8s-btn ${comp === c.key ? 'active' : ''}`} onClick={() => setComp(c.key)}>
              {c.icon} {c.name}
              <span className={`k8s-tag ${c.plane === 'control' ? 'blue' : 'orange'}`} style={{ marginLeft: '0.3rem' }}>
                {c.plane === 'control' ? 'Control' : 'Node'}
              </span>
            </button>
          ))}
        </div>
        <div className="k8s-grid-2">
          <div className="k8s-card">
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>{c.icon} {c.name}</div>
            <div style={{ color: 'var(--k8s-muted)', fontSize: '0.88rem', lineHeight: 1.75, marginBottom: '1rem' }}>{c.desc}</div>
            {c.details?.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--k8s-muted)' }}>
                <span style={{ color: 'var(--k8s-blue)', flexShrink: 0 }}>→</span> {d}
              </div>
            ))}
          </div>
          <div className="k8s-card">
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--k8s-blue)', marginBottom: '0.75rem' }}>⚡ 实用命令</div>
            <div className="k8s-code-wrap" style={{ margin: 0 }}>
              <div className="k8s-code-head">
                <div className="k8s-code-dot" style={{ background: '#ef4444' }} /><div className="k8s-code-dot" style={{ background: '#f59e0b' }} /><div className="k8s-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>terminal</span>
              </div>
              <div className="k8s-code">{`$ ${c.cmd}`}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Flow */}
      <div className="k8s-section">
        <div className="k8s-section-title">🔄 一个 kubectl apply 的完整旅程</div>
        <div className="k8s-card">
          <div className="k8s-steps">
            {REQUEST_FLOW.map((s, i) => (
              <div key={i} className="k8s-step">
                <div className="k8s-step-num">{s.step}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--k8s-blue)', marginBottom: '0.2rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--k8s-muted)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HA Architecture */}
      <div className="k8s-section">
        <div className="k8s-section-title">🏗️ 生产高可用架构</div>
        <div className="k8s-code-wrap">
          <div className="k8s-code-head">
            <div className="k8s-code-dot" style={{ background: '#ef4444' }} /><div className="k8s-code-dot" style={{ background: '#f59e0b' }} /><div className="k8s-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>ha-architecture.md</span>
          </div>
          <div className="k8s-code">{`# 生产 HA 架构要求

## Control Plane（奇数节点，通常 3 个）
┌─────────────────────────────────────────┐
│  LB (HAProxy/kube-vip/Cloud LB :6443)  │
└──────┬──────────────┬──────────────┬───┘
       │              │              │
  Master-1        Master-2       Master-3
  API Server      API Server     API Server
  Scheduler       Scheduler      Scheduler (Standby)
  Controller Mgr  Controller Mgr (Standby)
  etcd            etcd           etcd
  (Leader)        (Follower)     (Follower)

注意：Scheduler 和 Controller Manager 是 Active/Standby
     通过 leader election（etcd 锁）决定谁是 Active

## Workers（按负载横向扩展）
至少 3 个 Worker，分布在不同 AZ（可用区）
推荐：节点组 = 按工作负载类型分（通用/GPU/高内存）

## etcd 选举原则
- 超过半数存活 = 集群正常（3节点允许1个故障）
- 5节点允许2个故障，推荐大规模生产使用
- etcd 专用节点可避免与 API Server 争抢资源

## 关键诊断命令
kubectl get nodes -o wide                    # 查看节点状态
kubectl get pods -n kube-system             # Control Plane 组件状态
kubectl get cs                              # ComponentStatus (旧版)
kubectl -n kube-system get ep kube-scheduler # Scheduler Leader`}</div>
        </div>
      </div>
    </div>
  );
}
