import { useState } from 'react';
import './LessonCommon.css';

const ISSUES = [
  {
    key: 'crashloop', name: 'CrashLoopBackOff', icon: '💥',
    severity: 'critical', color: '#ef4444',
    desc: 'Pod 持续崩溃重启。每次崩溃后等待时间加倍（10s → 20s → 40s ... 最大5分钟）。',
    causes: ['应用启动崩溃（配置错误/缺少环境变量/连接数据库失败）', 'liveness 探针配置太激进（初始等待时间不足）', 'OOM Kill（内存限制太低）', '镜像入口命令错误（CMD/ENTRYPOINT）'],
    debug: `# Step 1：查看 Pod 状态和重启次数
kubectl get pod <pod-name> -n <namespace>

# Step 2：查看当前容器日志
kubectl logs <pod-name> -n <namespace>

# Step 3：查看上一次崩溃的日志（最关键！）
kubectl logs <pod-name> -n <namespace> --previous

# Step 4：查看详细事件
kubectl describe pod <pod-name> -n <namespace>
# 重点看：Last State (Exit Code)
# Exit Code 0 = 正常退出
# Exit Code 1 = 应用异常
# Exit Code 137 = OOM Kill (128 + 9)
# Exit Code 139 = Segmentation Fault

# Step 5：临时调试（覆盖 CMD 保持容器活着）
kubectl debug -it <pod-name> -n <namespace> \
  --image=busybox --copy-to=debug-pod \
  -- sh

# 常见修复：
# OOM → 增加 memory limits
# 配置错误 → 检查 ConfigMap/Secret 是否正确挂载
# 探针太激进 → 增加 initialDelaySeconds`,
  },
  {
    key: 'imagepull', name: 'ImagePullBackOff', icon: '🐳',
    severity: 'warning', color: '#f97316',
    desc: '拉取镜像失败。K8s 在重试间隔指数增加后停止重试，状态变为 ImagePullBackOff。',
    causes: ['镜像名称/Tag 拼写错误', '私有仓库未配置 imagePullSecret', '网络问题无法访问镜像仓库', '镜像仓库账号权限不足'],
    debug: `# Step 1：确认镜像名称和 Tag
kubectl describe pod <pod-name> | grep -A5 "Events:"
# 看 "Failed to pull image" 的具体错误信息

# Step 2：手动测试镜像拉取
docker pull registry.company.com/myapp:v1.0.0
# 如果失败，是镜像名/权限问题

# Step 3：检查 imagePullSecret 是否存在
kubectl get secrets -n <namespace> | grep registry
kubectl get pod <pod-name> -o jsonpath='{.spec.imagePullSecrets}'

# Step 4：创建 imagePullSecret（如果缺失）
kubectl create secret docker-registry registry-cred \
  --docker-server=registry.company.com \
  --docker-username=<username> \
  --docker-password=<password> \
  -n production

# 在 Deployment 中引用
spec:
  imagePullSecrets:
  - name: registry-cred

# Step 5：测试私有仓库连通性（从 Pod 内）
kubectl run test --image=busybox --rm -it -- \
  wget -qO- https://registry.company.com/v2/`,
  },
  {
    key: 'pending', name: 'Pod 一直 Pending', icon: '⏳',
    severity: 'warning', color: '#f59e0b',
    desc: 'Pod 已创建但未被调度到任何 Node，或无法拉起容器。',
    causes: ['所有节点资源不足（CPU/内存/GPU）', '节点污点（Taint）且 Pod 无对应容忍', 'PVC 无法绑定（StorageClass 不存在/PV 不够）', 'nodeSelector/Affinity 没有匹配的节点'],
    debug: `# Step 1：查看 Scheduler 的决策原因
kubectl describe pod <pod-name> | grep -A20 "Events:"
# 重点看 FailedScheduling 事件

# 常见 FailedScheduling 原因：
# "0/3 nodes are available: 3 Insufficient cpu"
#   → 所有节点 CPU 不足
#   → 解法：扩容节点 / 降低 CPU requests
#
# "0/3 nodes are available: 3 node(s) had untolerated taint"
#   → 节点有污点但 Pod 无容忍
#   → 解法：加 tolerations / 换目标节点
#
# "0/3 nodes are available: 3 node(s) didn't match Pod's node affinity"
#   → 没有匹配 nodeAffinity 的节点
#   → 解法：检查 nodeAffinity 标签是否正确

# Step 2：查看节点资源使用情况
kubectl top nodes
kubectl describe nodes | grep -A5 "Allocated resources"

# Step 3：查看 PVC 状态（如果涉及存储）
kubectl get pvc -n <namespace>
# Pending → StorageClass 问题或没有可用 PV
kubectl describe pvc <pvc-name>`,
  },
  {
    key: 'oom', name: 'OOMKilled / 内存问题', icon: '🧠',
    severity: 'critical', color: '#a78bfa',
    desc: '容器使用内存超过 limits，被内核 OOM Killer 强制终止（Exit Code 137）。',
    causes: ['内存 limits 设置过低', '应用内存泄漏', 'Java 堆外内存未控制（-Xmx 之外的直接内存）', '突发流量导致内存急速攀升'],
    debug: `# Step 1：确认是 OOM Kill
kubectl describe pod <pod-name>
# 看 "Last State" → "OOMKilled: true"
# 或 Exit Code: 137

# Step 2：查看历史内存趋势（Prometheus/Grafana）
# PromQL 查询：
container_memory_working_set_bytes{pod=~"webapp.*", namespace="production"}
# 看是缓慢增长（泄漏）还是突然跳升（突发）

# Step 3：临时快速修复（增加 limits）
kubectl set resources deployment webapp \
  --limits=memory=1Gi -n production

# Step 4：Java 应用特别注意
# memory limits = 1Gi
# JVM 设置：
# -Xmx 700m      # 堆内存（建议是limits的 70%）
# -Xms 700m      # 初始堆（固定堆减少 GC 压力）
# -XX:MaxDirectMemorySize=128m  # 直接内存上限
# -XX:MaxMetaspaceSize=256m     # Metaspace 上限
# 总 JVM 内存：700 + 128 + 256 ≈ 1.1G > limits！← 常见陷阱

# Step 5：内存 limits 设置建议
# 用 kubectl top pod 观察 7 天实际峰值
# limits = 峰值 × 1.5（给突发余量）
# 设 VPA updateMode=Off 看推荐值`,
  },
  {
    key: 'node', name: '节点故障处理', icon: '🖥️',
    severity: 'critical', color: '#3b82f6',
    desc: '节点变为 NotReady 状态，上面的 Pod 会在 300s 后被驱逐并重新调度。',
    causes: ['节点宕机/断网（kubelet 失联）', '节点资源耗尽（DiskPressure/MemoryPressure）', '内核 Bug/硬件故障', '容器运行时（containerd）崩溃'],
    debug: `# Step 1：查看节点状态
kubectl get nodes -o wide
kubectl describe node <node-name>
# 看 Conditions 部分：
# Ready = False/Unknown → 节点异常
# MemoryPressure / DiskPressure / PIDPressure → 资源压力

# Step 2：SSH 登录节点检查
ssh <node-ip>
# 检查 kubelet 状态
systemctl status kubelet
journalctl -u kubelet -f --since "30 minutes ago"

# 检查容器运行时
systemctl status containerd
crictl ps  # 查看容器状态（containerd 版 docker ps）

# 检查系统资源
dmesg | grep -i "oom\|killed"    # OOM 事件
df -h                             # 磁盘使用（/var/log 最常爆）
free -h                           # 内存

# Step 3：紧急驱逐节点上的 Pod
kubectl cordon <node-name>      # 标记不可调度
kubectl drain <node-name> \     # 驱逐所有 Pod
  --ignore-daemonsets \
  --delete-emptydir-data \
  --force

# Step 4：节点恢复后重新加入
kubectl uncordon <node-name>

# Step 5：磁盘清理（最常见的节点压力）
# 在节点上执行：
docker system prune -af         # 清理悬空镜像（或 crictl）
crictl rmi --prune              # containerd 清理镜像
journalctl --vacuum-size=1G    # 清理 journal 日志`,
  },
];

export default function LessonTroubleshoot() {
  const [issue, setIssue] = useState('crashloop');
  const iss = ISSUES.find(x => x.key === issue) ?? {};

  const severityColor = { critical: '#ef4444', warning: '#f97316' };

  return (
    <div className="k8s-lesson">
      <div className="k8s-hero">
        <div className="k8s-badge">// MODULE 08 · TROUBLESHOOTING GUIDE</div>
        <h1>生产故障排查手册</h1>
        <p>每个 SRE 都会遇到 CrashLoopBackOff、节点故障、OOM Kill——能否在 5 分钟内定位根因，是区分普通运维和高级 SRE 的关键。本模块提供<strong>5 类最常见故障的完整排查 Runbook</strong>。</p>
      </div>

      {/* Quick stats */}
      <div className="k8s-section">
        <div className="k8s-grid-4">
          {[
            { v: '5类', l: '最高频 K8s 故障' },
            { v: '<5min', l: '目标：定位根因时间' },
            { v: 'MTTR', l: '是 SRE 核心 KPI' },
            { v: 'Runbook', l: '标准化排查是关键' },
          ].map((s, i) => (
            <div key={i} className="k8s-metric">
              <div className="k8s-metric-val" style={{ fontSize: '1.3rem' }}>{s.v}</div>
              <div className="k8s-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">🚨 故障排查 Runbook</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {ISSUES.map(iss => (
            <button key={iss.key} className={`k8s-btn ${issue === iss.key ? 'active' : ''}`}
              style={{ borderColor: issue === iss.key ? iss.color : undefined, color: issue === iss.key ? iss.color : undefined }}
              onClick={() => setIssue(iss.key)}>
              {iss.icon} {iss.name}
              <span className={`k8s-tag ${iss.severity === 'critical' ? 'red' : 'orange'}`} style={{ marginLeft: '0.4rem' }}>{iss.severity}</span>
            </button>
          ))}
        </div>
        <div className="k8s-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="k8s-card" style={{ borderLeft: `3px solid ${iss.color}` }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem' }}>{iss.icon} {iss.name}</div>
            <div style={{ color: 'var(--k8s-muted)', fontSize: '0.87rem', lineHeight: 1.75, marginBottom: '1rem' }}>{iss.desc}</div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--k8s-red)', marginBottom: '0.5rem' }}>常见根因：</div>
            {iss.causes?.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.84rem', color: 'var(--k8s-muted)' }}>
                <span style={{ color: iss.color, flexShrink: 0 }}>•</span> {c}
              </div>
            ))}
          </div>
          <div className="k8s-tip" style={{ margin: 0, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--k8s-blue)' }}>🔧 通用排查工具箱</div>
            {[
              'kubectl describe → 完整状态和 Events',
              'kubectl logs --previous → 崩溃前的日志',
              'kubectl exec -it → 进容器调试',
              'kubectl debug → 临时调试容器',
              'kubectl top → 实时资源使用',
              'kubectl get events --sort-by=lastTimestamp',
            ].map((t, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: 'var(--k8s-muted)', fontFamily: 'JetBrains Mono,monospace' }}>{t}</div>
            ))}
          </div>
        </div>
        <div className="k8s-code-wrap">
          <div className="k8s-code-head">
            <div className="k8s-code-dot" style={{ background: '#ef4444' }} /><div className="k8s-code-dot" style={{ background: '#f59e0b' }} /><div className="k8s-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>runbook_{iss.key}.sh</span>
          </div>
          <div className="k8s-code">{iss.debug}</div>
        </div>
      </div>

      <div className="k8s-section">
        <div className="k8s-section-title">⚡ 生产紧急命令速查</div>
        <div className="k8s-code-wrap">
          <div className="k8s-code-head"><span>emergency-commands.sh</span></div>
          <div className="k8s-code">{`# ━━━━ 紧急情况快速命令 ━━━━

# 查看所有非 Running 的 Pod
kubectl get pods -A --field-selector status.phase!=Running | grep -v Completed

# 强制删除 Terminating 状态的 Pod（谨慎使用）
kubectl delete pod <pod-name> --force --grace-period=0

# 紧急扩容（应对突发流量）
kubectl scale deployment webapp --replicas=20 -n production

# 暂停自动回滚（排查问题期间）
kubectl rollout pause deployment/webapp

# 紧急回滚到上一个版本
kubectl rollout undo deployment/webapp

# 查看资源使用 Top（需要 metrics-server）
kubectl top nodes
kubectl top pods -A --sort-by=memory | head -20

# 查看所有 OOMKilled 的容器
kubectl get pods -A -o json | jq '.items[] | select(.status.containerStatuses[].lastState.terminated.reason=="OOMKilled") | .metadata.name'

# 导出集群状态快照（故障时保存现场）
kubectl cluster-info dump --output-directory=/tmp/cluster-dump`}</div>
        </div>
      </div>
    </div>
  );
}
