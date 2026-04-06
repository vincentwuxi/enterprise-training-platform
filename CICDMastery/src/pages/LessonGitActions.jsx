import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// ── GitHub Actions 流水线模拟器 ──
const PIPELINE_STEPS = [
  { id: 'checkout',  name: '📥 Checkout code', dur: 800,  label: 'actions/checkout@v4' },
  { id: 'setup',     name: '🐍 Setup Python 3.12', dur: 1200, label: 'actions/setup-python@v5' },
  { id: 'install',   name: '📦 Install dependencies', dur: 1500, label: 'pip install -r requirements.txt' },
  { id: 'lint',      name: '🔍 Lint (ruff + mypy)', dur: 900,  label: 'ruff check . && mypy src/' },
  { id: 'test',      name: '🧪 Unit Tests (pytest)', dur: 2000, label: 'pytest --cov=src -x -q' },
  { id: 'build',     name: '🐳 Docker Build', dur: 2500, label: 'docker build -t app:$SHA .' },
  { id: 'scan',      name: '🛡️ Trivy Security Scan', dur: 1200, label: 'trivy image app:$SHA' },
  { id: 'push',      name: '📤 Push to GHCR', dur: 1000, label: 'docker push ghcr.io/org/app:$SHA' },
  { id: 'deploy',    name: '🚀 Deploy to Staging', dur: 1800, label: 'helm upgrade --install ...' },
  { id: 'notify',    name: '💬 Slack Notification', dur: 400,  label: 'slackapi/slack-github-action' },
];

function PipelineSimulator() {
  const [steps, setSteps] = useState(PIPELINE_STEPS.map(s => ({ ...s, status: 'pending' })));
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [injectFail, setInjectFail] = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const totalDone = steps.filter(s => s.status === 'passed').length;
  const hasFailed = steps.some(s => s.status === 'failed');
  const allDone = !running && totalDone === steps.length;

  const run = () => {
    setSteps(PIPELINE_STEPS.map(s => ({ ...s, status: 'pending' })));
    setElapsed(0);
    setRunning(true);
    startRef.current = Date.now();

    let stepIdx = 0;
    const runNext = () => {
      if (stepIdx >= PIPELINE_STEPS.length) { setRunning(false); return; }

      // Inject failure at test step if toggle is on
      const failHere = injectFail && PIPELINE_STEPS[stepIdx].id === 'test';

      setSteps(prev => prev.map((s, i) => i === stepIdx ? { ...s, status: failHere ? 'failed' : 'running' } : s));

      setTimeout(() => {
        setSteps(prev => prev.map((s, i) => i === stepIdx ? { ...s, status: failHere ? 'failed' : 'passed' } : s));
        if (failHere) { setRunning(false); return; }
        stepIdx++;
        runNext();
      }, PIPELINE_STEPS[stepIdx].dur);
    };
    runNext();

    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 200);
  };

  useEffect(() => { if (!running) clearInterval(timerRef.current); }, [running]);

  const reset = () => { setSteps(PIPELINE_STEPS.map(s => ({ ...s, status: 'pending' }))); setElapsed(0); setRunning(false); };

  return (
    <div className="cd-interactive">
      <h3>🚦 GitHub Actions 流水线模拟器
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#f87171', cursor: 'pointer' }}>
            <input type="checkbox" checked={injectFail} onChange={e => setInjectFail(e.target.checked)} />
            注入测试失败
          </label>
          <button className="cd-btn primary" onClick={run} disabled={running}>
            {running ? `⏳ ${elapsed}s…` : '▶ 运行流水线'}
          </button>
          <button className="cd-btn" onClick={reset}>↺</button>
        </div>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {steps.map((step, i) => (
          <div key={step.id} className={`cd-step \${step.status === 'running' ? 'running' : step.status === 'passed' ? 'passed' : step.status === 'failed' ? 'failed' : ''}`}>
            <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>
              {step.status === 'pending' ? '⚪' : step.status === 'running' ? <span className="cd-spinner">⏳</span> : step.status === 'passed' ? '✅' : '❌'}
            </span>
            <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: step.status === 'pending' ? '#30363d' : step.status === 'passed' ? '#22c55e' : step.status === 'failed' ? '#f87171' : '#fbbf24' }}>
              {step.name}
            </span>
            <code style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: '#8b949e', flexShrink: 0 }}>{step.label}</code>
          </div>
        ))}
      </div>

      {(allDone || hasFailed) && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
          background: hasFailed ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
          color: hasFailed ? '#f87171' : '#22c55e', border: `1px solid \${hasFailed ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}` }}>
          {hasFailed ? `❌ 流水线失败（测试未通过）— 用时 ${elapsed}s。Slack 通知已发送 🔔` : `✅ 所有 ${totalDone} 步完成 — 总耗时 ${elapsed}s！镜像已推送，Staging 已更新 🎉`}
        </div>
      )}
    </div>
  );
}

const WORKFLOW_TOPICS = [
  {
    name: 'Workflow 语法', icon: '📝', color: '#22c55e',
    code: `# .github/workflows/ci.yml — 完整注解版
name: 🚀 CI/CD Pipeline

on:
  push:
    branches: [main, 'release/**']  # 匹配分支模式
    paths-ignore: ['**.md', 'docs/**']  # 仅文档变更时跳过
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]  # PR 事件类型
  schedule:
    - cron: '0 2 * * 1'  # 每周一凌晨2点（定时安全扫描）
  workflow_dispatch:       # 支持手动触发 + 传参
    inputs:
      environment:
        description: 'Deploy target'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]

env:
  REGISTRY: ghcr.io            # 全局环境变量
  IMAGE: \${{ github.repository }}

jobs:
  build-test:
    runs-on: ubuntu-22.04      # 指定 Runner 操作系统
    timeout-minutes: 30        # 超时保护
    permissions:
      contents: read
      packages: write          # 推送到 GHCR 需要
    
    strategy:
      matrix:
        python-version: ['3.11', '3.12']  # 多版本并行测试
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0       # 获取完整历史（用于版本计算）

      - name: Setup Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: pip            # 自动缓存 pip 依赖！

      - name: Run tests
        run: pytest --cov=src tests/
`,
  },
  {
    name: 'Secrets & OIDC', icon: '🔐', color: '#3b82f6',
    code: `# ── Secrets 管理：3种方式 ──

# 方式1：GitHub Secrets（最常用）
# Settings → Secrets → Actions → New secret
- name: Push Docker image
  env:
    DOCKER_PASSWORD: \${{ secrets.DOCKER_HUB_TOKEN }}
  run: |
    echo "$DOCKER_PASSWORD" | docker login -u myorg --password-stdin
    docker push myorg/app:latest

# 方式2：OIDC 免密认证（最佳实践！）
# 无需存储长期 credentials，安全且免轮转
permissions:
  id-token: write   # OIDC token
  contents: read

- name: Configure AWS (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789:role/GitHubActions
    aws-region: us-east-1
    # 注意：不需要 access key！OIDC 自动认证

# AWS IAM Role 信任策略（只允许此 repo 的 main 分支）
# {
#   "Condition": {
#     "StringEquals": {
#       "token.actions.githubusercontent.com:sub":
#         "repo:myorg/myapp:ref:refs/heads/main"
#     }
#   }
# }

# 方式3：GitHub Environments + 保护规则
# Settings → Environments → production → 设置审批人
- name: Deploy to Production
  environment:
    name: production      # 触发审批流程！
    url: https://myapp.com
  uses: ./.github/actions/deploy`,
  },
  {
    name: '缓存 & 制品', icon: '💾', color: '#6366f1',
    code: `# ── 缓存优化：让流水线快 3-5 倍 ──

# 1. pip 缓存（通过 setup-python 的 cache 参数自动处理）
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'
    cache: 'pip'
    cache-dependency-path: '**/requirements*.txt'

# 2. Docker 层缓存（显著加速构建）
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push with cache
  uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64,linux/arm64  # 多平台构建
    cache-from: type=gha                # 使用 GitHub Cache API
    cache-to: type=gha,mode=max
    push: true
    tags: ghcr.io/myorg/app:\${{ github.sha }}

# 3. 手动缓存（任意文件）
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/pip
      node_modules
      .venv
    key: \${{ runner.os }}-deps-\${{ hashFiles('poetry.lock') }}
    restore-keys: |
      \${{ runner.os }}-deps-

# ── 制品上传 / 下载（跨 Job 共享文件）──
- uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: |
      coverage.xml
      test-results.xml
    retention-days: 7

# 另一个 Job 中下载
- uses: actions/download-artifact@v4
  with:
    name: test-results`,
  },
  {
    name: '高级技巧', icon: '🚀', color: '#f59e0b',
    code: `# ── 高级：可复用 Workflow + Composite Action ──

# 1. 可复用 Workflow（DRY 原则）
# .github/workflows/reusable-deploy.yml
on:
  workflow_call:
    inputs:
      environment: { type: string, required: true }
    secrets:
      KUBECONFIG: { required: true }

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ inputs.environment }}
    steps:
      - run: helm upgrade --install app ./helm -f values-\${{ inputs.environment }}.yaml

# 在其他 Workflow 中调用
jobs:
  deploy-staging:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
    secrets:
      KUBECONFIG: \${{ secrets.STAGING_KUBECONFIG }}

# 2. 条件执行 & 输出传递
- id: tag
  run: |
    VERSION=v$(date +%Y%m%d)-\${{ github.run_number }}
    echo "version=$VERSION" >> $GITHUB_OUTPUT  # 设置输出变量

- run: echo "版本：\${{ steps.tag.outputs.version }}"

# 3. 矩阵 + continue-on-error（并行多平台，单失败不阻断）
strategy:
  fail-fast: false
  matrix:
    os: [ubuntu-22.04, macos-13]
    python: ['3.11', '3.12']
runs-on: \${{ matrix.os }}

# 4. Concurrency（同分支只保留最新流水线）
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true  # 取消进行中的旧流水线`,
  },
];

export default function LessonGitActions() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = WORKFLOW_TOPICS[activeTopic];

  return (
    <div className="lesson-cd">
      <div className="cd-badge">🐙 module_02 — GitHub Actions</div>
      <div className="cd-hero">
        <h1>GitHub Actions：Workflow / Job / Step / Secrets</h1>
        <p>GitHub Actions 用<strong> YAML 声明式</strong>定义流水线。理解 on触发/jobs并行/steps串行/matrix矩阵/cache缓存/OIDC免密，能让你构建企业级自动化流水线。</p>
      </div>

      {/* 流水线模拟器 */}
      <PipelineSimulator />

      {/* 四大主题 */}
      <div className="cd-section">
        <h2 className="cd-section-title">📖 GitHub Actions 四大进阶主题</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {WORKFLOW_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid \${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
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
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name} — .github/workflows/</span>
          </div>
          <div className="cd-code" style={{ fontSize: '0.75rem', maxHeight: 420, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      {/* 关键概念速查 */}
      <div className="cd-section">
        <h2 className="cd-section-title">⚡ 关键配置速查</h2>
        <div className="cd-grid-2">
          {[
            { title: 'on — 触发条件', items: ['push: branches', 'pull_request', 'schedule: cron', 'workflow_dispatch（手动）', 'release: created'] },
            { title: 'runs-on — Runner', items: ['ubuntu-latest / 22.04', 'macos-latest / macos-14', 'windows-latest', 'self-hosted（自建）', 'ubuntu-latest with GPU'] },
            { title: 'permissions — 最小权限', items: ['contents: read/write', 'packages: write（GHCR）', 'id-token: write（OIDC）', 'issues: write', 'pull-requests: write'] },
            { title: 'needs — Job 依赖', items: ['needs: [build, test]', 'if: needs.test.result == "success"', 'outputs 传递变量', 'continue-on-error: true', 'timeout-minutes: 30'] },
          ].map(group => (
            <div key={group.title} className="cd-card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.82rem', marginBottom: '0.4rem', fontFamily: 'JetBrains Mono' }}>{group.title}</div>
              {group.items.map(item => (
                <div key={item} style={{ fontSize: '0.75rem', color: '#8b949e', fontFamily: 'JetBrains Mono', marginBottom: '0.15rem' }}>• {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="cd-nav">
        <button className="cd-btn" onClick={() => navigate('/course/cicd-gitops/lesson/cicd-core')}>← 上一模块</button>
        <button className="cd-btn primary" onClick={() => navigate('/course/cicd-gitops/lesson/docker-build')}>下一模块：容器化最佳实践 →</button>
      </div>
    </div>
  );
}
