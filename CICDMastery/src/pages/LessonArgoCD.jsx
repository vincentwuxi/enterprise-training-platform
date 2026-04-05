import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// ArgoCD 同步状态模拟器
const APPS = [
  { name: 'frontend', repo: 'gitops-repo/apps/frontend', cluster: 'prod-cluster', namespace: 'default', syncStatus: 'Synced', health: 'Healthy', image: 'v2.3.1' },
  { name: 'backend-api', repo: 'gitops-repo/apps/backend', cluster: 'prod-cluster', namespace: 'default', syncStatus: 'OutOfSync', health: 'Healthy', image: 'v1.9.5' },
  { name: 'worker', repo: 'gitops-repo/apps/worker', cluster: 'prod-cluster', namespace: 'workers', syncStatus: 'Synced', health: 'Degraded', image: 'v1.8.2' },
  { name: 'monitoring', repo: 'gitops-repo/infra/monitoring', cluster: 'prod-cluster', namespace: 'monitoring', syncStatus: 'Synced', health: 'Healthy', image: 'v9.6.0' },
];

function ArgoCDDashboard() {
  const [apps, setApps] = useState(APPS);
  const [syncing, setSyncing] = useState(null);
  const [log, setLog] = useState([]);

  const statusColor = (s) => s === 'Synced' ? '#22c55e' : s === 'OutOfSync' ? '#f59e0b' : '#ef4444';
  const healthColor = (h) => h === 'Healthy' ? '#22c55e' : h === 'Degraded' ? '#ef4444' : '#f59e0b';

  const syncApp = async (app) => {
    setSyncing(app.name);
    setLog(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] 🔄 Syncing ${app.name}…`]);
    await new Promise(r => setTimeout(r, 1800));
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ ${app.name} synced successfully`]);
    setApps(prev => prev.map(a => a.name === app.name ? { ...a, syncStatus: 'Synced', health: 'Healthy' } : a));
    setSyncing(null);
  };

  const triggerOutOfSync = () => {
    setApps(prev => prev.map((a, i) => i === 0 ? { ...a, syncStatus: 'OutOfSync', image: 'v2.4.0' } : a));
    setLog(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ⚠️ Git commit detected: frontend → v2.4.0 (drift from cluster!)`]);
  };

  return (
    <div className="cd-interactive">
      <h3>🌊 ArgoCD 应用管理仪表盘（模拟）
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="cd-btn amber" onClick={triggerOutOfSync}>📌 模拟 Git 新提交</button>
          <button className="cd-btn primary" onClick={() => apps.filter(a => a.syncStatus !== 'Synced').forEach(a => syncApp(a))}>⚡ 全部同步</button>
        </div>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
        {apps.map(app => (
          <div key={app.name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.625rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${app.syncStatus === 'OutOfSync' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
            <div style={{ minWidth: 120, fontWeight: 700, fontSize: '0.82rem', color: '#e6edf3', fontFamily: 'JetBrains Mono' }}>{app.name}</div>
            <div style={{ flex: 1, fontSize: '0.68rem', color: '#8b949e' }}>{app.namespace}/{app.image}</div>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700, background: `${statusColor(app.syncStatus)}12`, color: statusColor(app.syncStatus) }}>{app.syncStatus}</span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700, background: `${healthColor(app.health)}12`, color: healthColor(app.health) }}>{app.health}</span>
            <button className="cd-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', opacity: app.syncStatus === 'Synced' ? 0.5 : 1 }}
              onClick={() => syncApp(app)} disabled={syncing === app.name || app.syncStatus === 'Synced'}>
              {syncing === app.name ? <span className="cd-spinner">⏳</span> : '🔄 Sync'}
            </button>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <div style={{ background: '#0d1117', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '6px', padding: '0.5rem 0.75rem', fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>
          {log.map((l, i) => <div key={i} style={{ color: l.includes('❌') ? '#f87171' : l.includes('✅') ? '#22c55e' : l.includes('⚠️') ? '#fbbf24' : '#8b949e', marginBottom: '0.1rem' }}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

const ARGO_TOPICS = [
  {
    name: 'App CRD 定义', icon: '📋', color: '#3b82f6',
    code: `# ArgoCD Application CRD（声明式，存于 Git）
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-production
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io  # 删除 App 时自动清理资源
spec:
  project: default
  
  # Git 仓库配置
  source:
    repoURL: https://github.com/myorg/gitops-repo
    targetRevision: HEAD       # 跟踪 main 分支最新提交
    path: apps/myapp/production  # Helm Chart 路径
    helm:
      valueFiles:
        - values.yaml
        - values-production.yaml
      parameters:
        - name: image.tag
          value: "2.1.0"       # 可被 CI 动态覆盖

  # 部署目标
  destination:
    server: https://kubernetes.default.svc  # 集群 API
    namespace: production

  # 同步策略（GitOps 核心！）
  syncPolicy:
    automated:
      prune: true     # 自动删除 Git 中不存在的资源
      selfHeal: true  # 集群状态偏移(drift)时自动修复
    syncOptions:
      - CreateNamespace=true  # 自动创建 namespace
      - PrunePropagationPolicy=foreground
    retry:
      limit: 3               # 失败重试3次
      backoff:
        duration: 5s
        maxDuration: 3m`,
  },
  {
    name: 'App of Apps 模式', icon: '🌳', color: '#22c55e',
    code: `# App of Apps：用 ArgoCD 管理所有 ArgoCD Applications
# root-app.yaml（存于 gitops-repo/argocd/root.yaml）
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-app   # 根 Application
  namespace: argocd
spec:
  source:
    path: argocd/apps/production  # 指向包含所有 App 定义的目录
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true

# argocd/apps/production/ 目录下的所有子 Apps
# ↓ 这些都是普通 Application CRD 文件
frontend-app.yaml      → 指向 apps/frontend/prod/
backend-app.yaml       → 指向 apps/backend/prod/
monitoring-app.yaml    → 指向 infra/monitoring/
ingress-app.yaml       → 指向 infra/ingress/
redis-app.yaml         → 指向 infra/redis/

# 新增服务：只需在 gitops-repo 创建一个 YAML 文件！
# ArgoCD 检测到变化后自动创建新 Application → 自动部署新服务
# 完全声明式，所有变更通过 Git PR 审批

# ApplicationSet：批量生成 Applications（多集群/多环境）
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: guestbook
spec:
  generators:
    - list:
        elements:
          - cluster: staging
          - cluster: production
  template:
    spec:
      source:
        path: apps/{{ cluster }}/
      destination:
        server: '{{ cluster-api }}'`,
  },
  {
    name: '健康检查 & 回滚', icon: '❤️', color: '#ef4444',
    code: `# ArgoCD 自定义健康检查（Lua 脚本）
# 为自定义 CRD 定义健康状态判断逻辑
resource.customizations.health.myorg.io__MyDatabase: |
  hs = {}
  if obj.status ~= nil then
    if obj.status.phase == "Ready" then
      hs.status = "Healthy"
    elseif obj.status.phase == "Error" then
      hs.status = "Degraded"
      hs.message = obj.status.message
    else
      hs.status = "Progressing"
      hs.message = "Database is initializing"
    end
  end
  return hs

# ── Rollback & Sync Windows（维护窗口）──
# 禁止在业务高峰期自动同步（即使 Git 有变更）
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
spec:
  syncWindows:
    - kind: deny               # 拒绝自动同步
      schedule: '0 9 * * 1-5' # 工作日 9:00（当地时间）
      duration: 8h             # 持续8小时（工作时间禁止自动发布）
      applications: ['*']
      namespaces: ['production']
    - kind: allow              # 允许在凌晨2-4点自动同步
      schedule: '0 2 * * *'
      duration: 2h

# ── CLI 操作 ──
argocd app sync myapp-production     # 手动触发同步
argocd app rollback myapp-production 5  # 回滚到第5次历史
argocd app wait myapp-production --health  # 等待健康
argocd app diff myapp-production       # 查看 Git vs 集群差异`,
  },
];

export default function LessonArgoCD() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = ARGO_TOPICS[activeTopic];

  return (
    <div className="lesson-cd">
      <div className="cd-badge blue">🌊 module_05 — ArgoCD</div>
      <div className="cd-hero">
        <h1>ArgoCD：GitOps 同步 / App of Apps / 健康检查</h1>
        <p>ArgoCD 把 Git 仓库变成 Kubernetes 集群的<strong>唯一事实来源</strong>：持续监控 Git 变更，自动同步集群状态，偏差自动修复，失败自动回滚。</p>
      </div>

      <ArgoCDDashboard />

      {/* GitOps 流程图 */}
      <div className="cd-section">
        <h2 className="cd-section-title">🔄 GitOps 完整工作流</h2>
        <div className="cd-card" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#8b949e', lineHeight: 2.2 }}>
          <pre style={{ color: '#aff5b4', margin: 0 }}>{`
开发者 git push → GitHub Actions CI
  ├─ 构建镜像：docker build → ghcr.io/myorg/app:${'{sha}'}
  └─ 更新 GitOps 仓库（Image Updater 或 CI 步骤）：
       sed -i "s/tag: .*/tag: ${'{sha}'}/" gitops-repo/apps/prod/values.yaml
       git commit && git push

ArgoCD 监控 gitops-repo → 检测到 values.yaml 变更（3分钟内）
  ├─ GitOps 仓库：image.tag = ${'{sha}'}
  ├─ 集群状态：image.tag = old-sha（OutOfSync！）
  └─ 自动 Sync（selfHeal=true）：
       kubectl apply -f rendered-manifests.yaml
       等待 Rollout 完成（健康检查通过）
       ✅ 同步完成，更新 Revision History

出现问题？
  └─ ArgoCD 检测 Health=Degraded → 通知 Slack → 手动 rollback
     argocd app rollback myapp-production [revision]`}</pre>
        </div>
      </div>

      {/* 三主题 */}
      <div className="cd-section">
        <h2 className="cd-section-title">📖 ArgoCD 三大核心配置</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {ARGO_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#8b949e' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>

        <div className="cd-code-wrap">
          <div className="cd-code-head">
            <div className="cd-code-dot" style={{ background: '#ef4444' }} />
            <div className="cd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cd-code-dot" style={{ background: t.color }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name} — ArgoCD</span>
          </div>
          <div className="cd-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="cd-nav">
        <button className="cd-btn" onClick={() => navigate('/course/cicd-gitops/lesson/helm-chart')}>← 上一模块</button>
        <button className="cd-btn primary" onClick={() => navigate('/course/cicd-gitops/lesson/kube-deploy')}>下一模块：K8s 部署策略 →</button>
      </div>
    </div>
  );
}
