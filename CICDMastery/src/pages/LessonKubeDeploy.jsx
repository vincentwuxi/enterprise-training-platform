import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 蓝绿/金丝雀部署动画
function DeploymentVisualizer() {
  const [strategy, setStrategy] = useState('rolling');
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const run = () => {
    setProgress(0); setRunning(true);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 4;
      setProgress(p);
      if (p >= 100) { clearInterval(timerRef.current); setRunning(false); }
    }, 180);
  };
  useEffect(() => () => clearInterval(timerRef.current), []);

  const POD_COUNT = 8;
  const getPodStatus = (idx) => {
    const fraction = progress / 100;
    if (strategy === 'rolling') {
      const updateIdx = Math.floor(fraction * POD_COUNT);
      return idx < updateIdx ? 'new' : 'old';
    } else if (strategy === 'blue-green') {
      return fraction < 0.6 ? (idx < 4 ? 'old' : 'new-inactive') : (idx < 4 ? 'old-inactive' : 'new');
    } else { // canary
      const newCount = Math.max(1, Math.round(fraction * POD_COUNT * 0.3));
      return idx < newCount ? 'new' : 'old';
    }
  };

  const podColor = (s) => s === 'new' ? '#22c55e' : s === 'old' ? '#3b82f6' : s === 'new-inactive' ? '#22c55e80' : '#3b82f680';
  const podLabel = (s) => s === 'new' ? 'v2' : s === 'old' ? 'v1' : s === 'new-inactive' ? 'v2(待切)' : 'v1(旧)';

  return (
    <div className="cd-interactive">
      <h3>🎬 部署策略可视化（动画演示）
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['rolling', 'blue-green', 'canary'].map(s => (
            <button key={s} className={`cd-btn ${strategy === s ? 'active' : ''}`} onClick={() => { setStrategy(s); setProgress(0); setRunning(false); clearInterval(timerRef.current); }}>
              {s === 'rolling' ? '🔄 滚动' : s === 'blue-green' ? '🔵🟢 蓝绿' : '🐦 金丝雀'}
            </button>
          ))}
          <button className="cd-btn primary" onClick={run} disabled={running}>{running ? '…' : '▶ 模拟部署'}</button>
        </div>
      </h3>

      {/* Pod 格子 */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {Array.from({ length: POD_COUNT }, (_, i) => {
          const s = getPodStatus(i);
          return (
            <div key={i} style={{ width: 72, height: 56, borderRadius: '8px', background: podColor(s), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#0d1117', transition: 'all 0.3s', border: '2px solid rgba(0,0,0,0.2)' }}>
              <span style={{ fontSize: '1rem' }}>⬡</span>
              Pod-{i + 1}<br />{podLabel(s)}
            </div>
          );
        })}
      </div>

      <div className="cd-meter" style={{ marginBottom: '0.4rem' }}>
        <div className="cd-meter-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#3b82f6,#22c55e)' }} />
      </div>

      <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
        {strategy === 'rolling' && `🔄 滚动更新：一次替换 ${Math.floor(progress / 100 * POD_COUNT)} / ${POD_COUNT} 个 Pod，零停机，但回滚略慢`}
        {strategy === 'blue-green' && (progress < 60 ? '🔵 当前：Blue (v1) 生产流量 100% | 🟢 Green (v2) 部署并测试中…' : '🟢 流量已切换到 Green (v2)！Blue(v1) 保留30分钟备用回滚')}
        {strategy === 'canary' && `🐦 金丝雀：${Math.max(1, Math.round(progress / 100 * POD_COUNT * 0.3))} / ${POD_COUNT} 个 Pod 运行 v2（${Math.round(progress * 0.3)}% 流量），监控指标中…`}
      </div>
    </div>
  );
}

const DEPLOY_STRATEGIES = [
  {
    name: '滚动更新', icon: '🔄', color: '#3b82f6',
    code: `# Kubernetes 滚动更新（默认策略）
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0    # 更新期间最多0个 Pod 不可用（零停机！）
      maxSurge: 2          # 更新期间最多额外创建2个 Pod（总数暂时12个）

  template:
    spec:
      containers:
        - name: app
          image: myapp:v2
          # 就绪探针：Pod 真正就绪后才接收流量
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 3   # 3次失败才标记为 Not Ready
          # 存活探针：失败则重启 Pod
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 15

# 监控滚动更新进度
kubectl rollout status deployment/myapp --timeout=5m
kubectl rollout history deployment/myapp   # 查看历史
kubectl rollout undo deployment/myapp      # 紧急回滚`,
  },
  {
    name: '蓝绿部署', icon: '🔵🟢', color: '#22c55e',
    code: `# 蓝绿部署：同时维护两个完整环境，瞬间切换
# 特点：零停机 + 极速回滚（改 Service selector 即可）

# 当前生产：Blue (v1)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
  labels:
    version: blue
spec:
  replicas: 5
  selector:
    matchLabels: { app: myapp, version: blue }
  template:
    metadata:
      labels: { app: myapp, version: blue }
    spec:
      containers:
        - image: myapp:v1

# 新版本：Green (v2)，独立部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
# spec: 同上，image: myapp:v2

# Service：通过 selector 控制流量路由
apiVersion: v1
kind: Service
metadata:
  name: myapp-svc
spec:
  selector:
    app: myapp
    version: blue  # ← 修改这里即可切换！

# 切换命令（瞬间完成！）
kubectl patch svc myapp-svc -p '{"spec":{"selector":{"version":"green"}}}'
# 回滚：
kubectl patch svc myapp-svc -p '{"spec":{"selector":{"version":"blue"}}}'`,
  },
  {
    name: '金丝雀发布', icon: '🐦', color: '#f59e0b',
    code: `# 金丝雀发布：先放少量流量到新版本，验证无误再全量
# 使用 Argo Rollouts（比原生 Deployment 更强大）

apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    canary:
      steps:
        - setWeight: 10    # Step 1: 10% 流量到 v2
        - pause: { duration: 5m }   # 暂停5分钟，观察指标
        - setWeight: 30    # Step 2: 30% 流量
        - pause: { duration: 10m }
        - analysis:        # Step 3: 自动分析（成功率/延迟）
            templates:
              - templateName: success-rate
        - setWeight: 100   # Step 4: 100% 流量

  # 自动分析模板（基于 Prometheus 指标）
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  metrics:
    - name: success-rate
      interval: 1m
      failureLimit: 3
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(http_requests_total{status!~"5.."}[5m])) /
            sum(rate(http_requests_total[5m])) > 0.95  # < 95% 成功率则中止`,
  },
];

export default function LessonKubeDeploy() {
  const navigate = useNavigate();
  const [activeStrategy, setActiveStrategy] = useState(0);
  const s = DEPLOY_STRATEGIES[activeStrategy];

  return (
    <div className="lesson-cd">
      <div className="cd-badge indigo">☸️ module_06 — K8s 部署策略</div>
      <div className="cd-hero">
        <h1>K8s 部署策略：Rolling / Blue-Green / Canary</h1>
        <p>选对部署策略决定了故障时的<strong>影响范围和回滚速度</strong>。滚动更新适合大多数场景，蓝绿适合高风险变更，金丝雀适合需要逐步验证的功能发布。</p>
      </div>

      <DeploymentVisualizer />

      <div className="cd-section">
        <h2 className="cd-section-title">🎯 三大部署策略（切换查看实现）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {DEPLOY_STRATEGIES.map((strategy, i) => (
            <button key={i} onClick={() => setActiveStrategy(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeStrategy === i ? strategy.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeStrategy === i ? `${strategy.color}10` : 'rgba(255,255,255,0.02)',
                color: activeStrategy === i ? strategy.color : '#8b949e' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{strategy.icon}</div>
              {strategy.name}
            </button>
          ))}
        </div>

        <div className="cd-code-wrap">
          <div className="cd-code-head">
            <div className="cd-code-dot" style={{ background: '#ef4444' }} />
            <div className="cd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cd-code-dot" style={{ background: s.color }} />
            <span style={{ color: s.color, marginLeft: '0.5rem' }}>{s.icon} {s.name}</span>
          </div>
          <div className="cd-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{s.code}</div>
        </div>
      </div>

      <div className="cd-section">
        <h2 className="cd-section-title">⚖️ 三策略对比</h2>
        <div className="cd-card">
          <table className="cd-table">
            <thead><tr><th>维度</th><th>🔄 滚动更新</th><th>🔵🟢 蓝绿</th><th>🐦 金丝雀</th></tr></thead>
            <tbody>
              {[
                ['部署时间', '中等（逐步替换）', '慢（双倍资源部署）', '慢（分阶段推进）'],
                ['资源消耗', '1× 副本数（+surge）', '2× 副本数', '1× + 金丝雀副本'],
                ['回滚速度', '分钟级（重新滚动）', '秒级（切换 selector）', '秒级（减少流量权重）'],
                ['失败影响范围', '全部用户（逐步）', '无影响（切换后才影响）', '仅有限用户（可控%）'],
                ['适用场景', '普通功能迭代', '大版本/高风险变更', '新功能验证/AB测试'],
                ['复杂度', '⭐（K8s 原生）', '⭐⭐（需双 Deployment）', '⭐⭐⭐（需 Argo Rollouts）'],
              ].map(([d, r, bg, c]) => (
                <tr key={d}>
                  <td style={{ fontWeight: 700, color: '#e6edf3', fontSize: '0.8rem' }}>{d}</td>
                  <td style={{ fontSize: '0.77rem', color: '#60a5fa' }}>{r}</td>
                  <td style={{ fontSize: '0.77rem', color: '#22c55e' }}>{bg}</td>
                  <td style={{ fontSize: '0.77rem', color: '#fbbf24' }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cd-nav">
        <button className="cd-btn" onClick={() => navigate('/course/cicd-gitops/lesson/argocd')}>← 上一模块</button>
        <button className="cd-btn primary" onClick={() => navigate('/course/cicd-gitops/lesson/monitor-alert')}>下一模块：监控告警 →</button>
      </div>
    </div>
  );
}
