import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// GitOps 流水线全链路动画
const PIPELINE_PHASES = [
  { id: 'commit',  icon: '💻', label: '代码提交', sublabel: 'git push origin main', color: '#8b949e', dur: 600 },
  { id: 'trigger', icon: '🐙', label: 'GitHub Actions 触发', sublabel: 'workflow: CI Pipeline', color: '#22c55e', dur: 800 },
  { id: 'test',    icon: '🧪', label: '自动化测试', sublabel: 'pytest coverage: 94%', color: '#3b82f6', dur: 2000 },
  { id: 'build',   icon: '🐳', label: '构建镜像', sublabel: 'docker build + trivy scan', color: '#f59e0b', dur: 1500 },
  { id: 'push',    icon: '📤', label: '推送镜像', sublabel: 'ghcr.io/…/app:abc1234', color: '#6366f1', dur: 800 },
  { id: 'gitops',  icon: '📝', label: '更新 GitOps 仓库', sublabel: 'values.yaml: tag → abc1234', color: '#22c55e', dur: 600 },
  { id: 'argo',    icon: '🌊', label: 'ArgoCD 检测变更', sublabel: 'OutOfSync → syncing…', color: '#3b82f6', dur: 1200 },
  { id: 'deploy',  icon: '☸️', label: 'K8s 滚动更新', sublabel: 'rolling: 0/5 → 5/5 pods', color: '#f59e0b', dur: 2000 },
  { id: 'verify',  icon: '✅', label: '健康检查通过', sublabel: 'readiness probe OK', color: '#22c55e', dur: 600 },
  { id: 'notify',  icon: '💬', label: 'Slack 通知', sublabel: '🚀 v2.4.0 deployed to prod!', color: '#8b949e', dur: 400 },
];

function FullPipelineDemo() {
  const [steps, setSteps] = useState(PIPELINE_PHASES.map(s => ({ ...s, status: 'pending' })));
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const run = () => {
    setSteps(PIPELINE_PHASES.map(s => ({ ...s, status: 'pending' }))); setElapsed(0); setRunning(true);
    startRef.current = Date.now();
    let idx = 0;
    const next = () => {
      if (idx >= PIPELINE_PHASES.length) { setRunning(false); clearInterval(timerRef.current); return; }
      setSteps(prev => prev.map((s, i) => i === idx ? { ...s, status: 'running' } : s));
      setTimeout(() => {
        setSteps(prev => prev.map((s, i) => i === idx ? { ...s, status: 'passed' } : s));
        idx++; next();
      }, PIPELINE_PHASES[idx].dur);
    };
    next();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 300);
  };

  const done = steps.filter(s => s.status === 'passed').length;
  const allDone = done === PIPELINE_PHASES.length;

  return (
    <div className="cd-interactive">
      <h3>🚀 GitOps 全链路流水线（代码提交 → 生产上线）
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {allDone && <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>✅ {elapsed}秒完成！</span>}
          <button className="cd-btn primary" onClick={run} disabled={running}>{running ? `⏳ ${elapsed}s` : '▶ 一键模拟全流程'}</button>
        </div>
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ padding: '0.45rem 0.625rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.3s',
              background: step.status === 'passed' ? `${step.color}12` : step.status === 'running' ? `${step.color}20` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${step.status !== 'pending' ? step.color + '40' : 'rgba(255,255,255,0.06)'}`,
              color: step.status !== 'pending' ? step.color : '#30363d' }}>
              <div>{step.status === 'running' ? <span className="cd-spinner">{step.icon}</span> : step.status === 'passed' ? '✅' : step.icon}</div>
              <div style={{ fontSize: '0.62rem', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>{step.label}</div>
              {step.status === 'passed' && <div style={{ fontSize: '0.58rem', color: '#8b949e', fontFamily: 'JetBrains Mono', marginTop: '0.05rem' }}>{step.sublabel}</div>}
            </div>
            {i < steps.length - 1 && <span style={{ color: step.status === 'passed' ? step.color : '#30363d', fontSize: '0.7rem' }}>→</span>}
          </div>
        ))}
      </div>

      <div className="cd-meter" style={{ marginTop: '0.75rem' }}>
        <div className="cd-meter-fill" style={{ width: `${(done / PIPELINE_PHASES.length) * 100}%`, background: 'linear-gradient(90deg,#22c55e,#3b82f6,#6366f1)' }} />
      </div>
    </div>
  );
}

const PROJ_CODE = `# ── 完整 GitOps 仓库结构 ──
gitops-repo/
├── apps/                      # 应用 Helm Charts
│   ├── frontend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values-staging.yaml
│   │   └── values-production.yaml
│   └── backend/
├── infra/                     # 基础设施 Charts（监控/Ingress）
│   ├── monitoring/
│   └── ingress-nginx/
├── argocd/                    # ArgoCD Application 定义
│   ├── root-app.yaml          # App of Apps 根应用
│   └── apps/
│       ├── frontend-app.yaml
│       └── backend-app.yaml
└── .github/workflows/
    ├── validate.yml           # PR 时验证 Helm Chart 合法性
    └── update-image.yml       # 被 CI 触发，更新 values.yaml`;

const CI_CODE = [
  '# .github/workflows/ci-cd.yml (应用仓库)',
  'name: CI/CD Pipeline',
  '',
  'on:',
  '  push:',
  '    branches: [main]',
  '',
  'jobs:',
  '  ci:',
  '    runs-on: ubuntu-latest',
  '    outputs:',
  '      sha: ${{ steps.meta.outputs.sha }}',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - uses: actions/setup-python@v5',
  "        with: { python-version: '3.12', cache: 'pip' }",
  '      - run: pip install -r requirements.txt',
  '      - run: pytest --cov=src tests/            # 测试',
  '      - run: ruff check . && mypy src/          # Lint',
  '',
  '      - id: meta',
  '        run: echo "sha=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT',
  '',
  '      - uses: docker/setup-buildx-action@v3',
  '      - uses: docker/login-action@v3',
  '        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }',
  '',
  '      - uses: docker/build-push-action@v5',
  '        with:',
  '          push: true',
  '          tags: ghcr.io/${{ github.repository }}:${{ steps.meta.outputs.sha }}',
  '          cache-from: type=gha',
  '          cache-to: type=gha,mode=max',
  '',
  '      - uses: aquasecurity/trivy-action@master  # 安全扫描',
  '        with:',
  '          image-ref: ghcr.io/${{ github.repository }}:${{ steps.meta.outputs.sha }}',
  "          exit-code: '1'",
  "          severity: 'CRITICAL'",
  '',
  '  update-gitops:',
  '    needs: ci',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '        with:',
  '          repository: myorg/gitops-repo    # checkout GitOps 仓库',
  '          token: ${{ secrets.GITOPS_TOKEN }}',
  '',
  '      - name: Update image tag         # ArgoCD Image Updater 也可以做这步',
  '        run: |',
  '          cd apps/backend',
  '          sed -i "s/tag: .*/tag: ${{ needs.ci.outputs.sha }}/" values-production.yaml',
  '          git config user.email "ci@github.com"',
  '          git commit -am "ci: update backend to ${{ needs.ci.outputs.sha }}"',
  '          git push',
  '      # ArgoCD 检测到 values-production.yaml 变化 → 自动同步 → 部署完成！',
].join('\n');

const CHECKLIST_ITEMS = [
  'GitHub Actions CI：测试 + Lint 通过 ✅',
  '多阶段 Dockerfile + .dockerignore 最小化镜像',
  'Trivy 安全扫描：无 CRITICAL 漏洞',
  'Docker 层缓存命中（CI 加速 3-5 倍）',
  'Helm Chart values-staging/production 环境分离',
  'GitOps 仓库独立，CI 自动更新 image tag',
  'ArgoCD App of Apps 统一管理所有应用',
  'ArgoCD selfHeal=true + prune=true 自动修复',
  'K8s 滚动更新 maxUnavailable=0（零停机）',
  'Readiness Probe 确保 Pod 真正就绪再接流量',
  'Prometheus 四大黄金信号告警规则配置',
  'Alertmanager 路由：Critical → PagerDuty',
];

export default function LessonProject() {
  const navigate = useNavigate();
  const [codeTab, setCodeTab] = useState('struct');
  const [checklist, setChecklist] = useState({});
  const toggle = k => setChecklist(p => ({ ...p, [k]: !p[k] }));
  const done = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="lesson-cd">
      <div className="cd-badge green">🏭 module_08 — 生产实战</div>
      <div className="cd-hero">
        <h1>生产实战：代码提交 → 60 秒生产上线全链路</h1>
        <p>把前 7 个模块整合为完整的 GitOps 体系：<strong>一次 git push 触发自动测试 → 构建镜像 → 更新 GitOps 仓库 → ArgoCD 检测变更 → K8s 自动滚动更新 → 健康检查 → Slack 通知</strong>，全程无人工干预。</p>
      </div>

      <FullPipelineDemo />

      {/* 代码 */}
      <div className="cd-section">
        <h2 className="cd-section-title">💻 关键代码实现</h2>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
          <button className={`cd-btn ${codeTab === 'struct' ? 'primary' : ''}`} onClick={() => setCodeTab('struct')}>📁 GitOps 仓库结构</button>
          <button className={`cd-btn ${codeTab === 'ci' ? 'primary' : ''}`} onClick={() => setCodeTab('ci')}>🐙 完整 CI/CD Workflow</button>
        </div>
        <div className="cd-code-wrap">
          <div className="cd-code-head">
            <div className="cd-code-dot" style={{ background: '#ef4444' }} />
            <div className="cd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cd-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ color: '#22c55e', marginLeft: '0.5rem' }}>🏭 {codeTab === 'struct' ? 'GitOps 仓库目录结构' : 'GitHub Actions CI/CD 完整工作流'}</span>
          </div>
          <div className="cd-code" style={{ fontSize: '0.73rem', maxHeight: 420, overflowY: 'auto' }}>{codeTab === 'struct' ? PROJ_CODE : CI_CODE}</div>
        </div>
      </div>

      {/* 上线清单 */}
      <div className="cd-section">
        <h2 className="cd-section-title">✅ GitOps 上线清单（{done}/{CHECKLIST_ITEMS.length} 完成）</h2>
        <div className="cd-meter" style={{ marginBottom: '0.75rem', height: 8 }}>
          <div className="cd-meter-fill" style={{ width: `${(done / CHECKLIST_ITEMS.length) * 100}%`, background: 'linear-gradient(90deg,#22c55e,#3b82f6,#6366f1)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '0.3rem' }}>
          {CHECKLIST_ITEMS.map((item, i) => (
            <div key={i} onClick={() => toggle(i)}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.55rem 0.75rem', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.13s',
                background: checklist[i] ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${checklist[i] ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.05)'}` }}>
              <div style={{ width: 16, height: 16, border: `1.5px solid ${checklist[i] ? '#22c55e' : '#30363d'}`, borderRadius: '3px', background: checklist[i] ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900, color: '#000', flexShrink: 0, marginTop: 2 }}>
                {checklist[i] ? '✓' : ''}
              </div>
              <span style={{ fontSize: '0.77rem', color: checklist[i] ? '#22c55e' : '#8b949e' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 结课 */}
      <div className="cd-section">
        <div className="cd-card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))', border: '1px solid rgba(34,197,94,0.25)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#22c55e', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成 CI/CD & GitOps 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.4rem', textAlign: 'left' }}>
            {['✅ CI/CD 四层级 + 主流工具选型', '✅ GitHub Actions 流水线动画 + 注入失败', '✅ 多阶段Dockerfile + Trivy扫描 + SBOM', '✅ Helm Chart 模板/Values/Hooks/OCI', '✅ ArgoCD 仪表盘 + App of Apps + 健康检查', '✅ 蓝绿/金丝雀/滚动更新 Pod 动画可视化', '✅ Prometheus 四黄金信号实时告警仪表盘', '✅ 完整 GitOps 全链路10步流水线模拟'].map(s => (
              <div key={s} style={{ fontSize: '0.8rem', color: '#8b949e' }}>{s}</div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            🏆 推荐认证：CKA（Kubernetes 管理员）⭐ GitHub Actions 认证 ⭐ GitOps Fundamentals (Codefresh)
          </div>
        </div>
      </div>

      <div className="cd-nav">
        <button className="cd-btn" onClick={() => navigate('/course/cicd-gitops/lesson/monitor-alert')}>← 上一模块</button>
        <button className="cd-btn primary" onClick={() => navigate('/course/cicd-gitops')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
