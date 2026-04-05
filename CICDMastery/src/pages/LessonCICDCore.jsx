import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TOOLS = [
  {
    name: 'GitHub Actions', icon: '🐙', color: '#22c55e',
    type: '云端 CI/CD', host: 'GitHub 托管', cost: '免费2000分钟/月',
    best: '开源项目 + GitHub 仓库', trigger: 'push/PR/schedule/手动',
    pros: ['与 GitHub 原生集成，无需额外配置', 'Marketplace 超 20000 个插件', 'matrix strategy 并行测试', '免费托管 Runner'],
    cons: ['Runner 故障时影响所有仓库', '并发数限制（免费20个）', '大型企业可能需要 self-hosted runner'],
    code: `# 最简 GitHub Actions 工作流
name: CI Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - run: pytest --cov=src tests/
      - uses: coverallsapp/github-action@v2`,
  },
  {
    name: 'GitLab CI/CD', icon: '🦊', color: '#f97316',
    type: '云端/自建 CI/CD', host: 'GitLab 托管 / 自部署', cost: '免费400分钟/月',
    best: '企业私有化部署', trigger: 'push/MR/schedule/手动/API',
    pros: ['.gitlab-ci.yml 统一配置', 'Auto DevOps 零配置流水线', '原生 Container Registry', '流水线可视化图形界面'],
    cons: ['自部署维护成本高', '学习曲线相对 Actions 陡', 'Runner 管理复杂'],
    code: `# .gitlab-ci.yml
stages: [build, test, deploy]

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

build:
  stage: build
  image: docker:24-dind
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE

test:
  stage: test
  image: python:3.12
  script:
    - pip install -r requirements.txt
    - pytest --cov=src

deploy-staging:
  stage: deploy
  environment: staging
  script:
    - helm upgrade --install app ./helm -f values-staging.yaml
  only: [develop]`,
  },
  {
    name: 'Jenkins', icon: '🏗️', color: '#3b82f6',
    type: '自建 CI/CD', host: '自部署', cost: '免费（基础设施成本）',
    best: '企业存量系统/复杂流水线', trigger: 'Webhook/Poll SCM/定时',
    pros: ['插件生态最成熟（1800+）', '完全自定义，无平台限制', 'Pipeline as Code（Jenkinsfile）', '支持任何版本控制系统'],
    cons: ['维护成本最高（Java 应用）', '配置繁琐，学习曲线陡', 'UI 相对过时', '需要自己管理安全更新'],
    code: `// Jenkinsfile（声明式 Pipeline）
pipeline {
  agent { label 'docker' }
  environment {
    DOCKER_CRED = credentials('docker-hub')
    KUBECONFIG = credentials('k8s-prod')
  }
  stages {
    stage('Build') {
      steps {
        script {
          docker.build("myapp:\${env.BUILD_ID}")
        }
      }
    }
    stage('Test') {
      parallel {   // 并行测试！
        stage('Unit') { steps { sh 'pytest tests/unit/' } }
        stage('Integration') { steps { sh 'pytest tests/integration/' } }
      }
    }
    stage('Deploy') {
      when { branch 'main' }
      steps {
        sh 'helm upgrade --install myapp ./helm'
      }
    }
  }
}`,
  },
  {
    name: 'Tekton / ArgoCD', icon: '🌊', color: '#6366f1',
    type: 'Kubernetes 原生 CI/CD', host: 'K8s 集群内', cost: '免费（计算成本）',
    best: '云原生 / GitOps 模式', trigger: 'EventListener/Webhook/手动',
    pros: ['CI（Tekton）+ CD（ArgoCD）完整 GitOps', '所有配置即 K8s CRD', '完全声明式，可 diff/审计', 'ArgoCD 自动同步 + 自动回滚'],
    cons: ['Tekton 配置冗长（每步都是 CRD）', '运维复杂（需要熟悉 K8s）', '调试困难（日志在 Pod 中）'],
    code: `# Tekton Pipeline + ArgoCD GitOps
# tekton-pipeline.yaml
apiVersion: tekton.dev/v1
kind: Pipeline
metadata: { name: ci-pipeline }
spec:
  tasks:
    - name: build
      taskRef: { name: buildah }  # 使用 Tekton Hub 任务
      params:
        - { name: IMAGE, value: "registry.io/myapp:$(params.sha)" }

    - name: push-manifest  # 核心：更新 Git 仓库中的镜像版本
      runAfter: [build]
      taskRef: { name: git-cli }
      params:
        - name: GIT_SCRIPT
          value: |
            cd gitops-repo
            sed -i "s|tag: .*|tag: $(params.sha)|" helm/values.yaml
            git commit -am "ci: update image tag to $(params.sha)"
            git push  # ArgoCD 监听此仓库，自动同步！`,
  },
];

const CONCEPTS = [
  { name: 'CI（持续集成）', color: '#22c55e', desc: '每次代码提交自动触发：代码扫描 → 单元测试 → 构建制品。目标：在开发阶段尽早发现问题，而不是等到上线前。', metric: '代码变更到发现问题 < 10分钟' },
  { name: 'CD（持续交付）', color: '#3b82f6', desc: '自动将通过测试的代码部署到 Staging 环境，保证随时可部署到生产。生产部署仍需人工审批（一键部署）。', metric: '代码提交到 Staging 上线 < 30分钟' },
  { name: 'CD（持续部署）', color: '#6366f1', desc: '完全自动化：通过所有测试后无人工干预自动部署生产。需要极高测试覆盖率和可观测性。Netflix/Amazon 每天数千次部署。', metric: '代码提交到生产上线 < 60分钟' },
  { name: 'GitOps', color: '#f59e0b', desc: 'Git 仓库是唯一事实来源（Single Source of Truth）。所有基础设施、应用配置均存于 Git，通过 PR 变更，ArgoCD 自动同步集群状态。', metric: '集群状态与 Git 偏差 < 1分钟检测' },
];

export default function LessonCICDCore() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const tool = TOOLS[activeTool];

  return (
    <div className="lesson-cd">
      <div className="cd-badge">⚙️ module_01 — CI/CD 核心</div>
      <div className="cd-hero">
        <h1>CI/CD 核心：流水线原理 / 主流工具对比</h1>
        <p>CI/CD 是 DevOps 的核心实践：把开发者从繁琐的手动部署中解放出来，让<strong>代码提交自动触发测试 → 构建 → 部署</strong>的完整链路。深入理解 CI/Delivery/Deployment/GitOps 四个层级的区别，是做技术选型的起点。</p>
      </div>

      {/* 四大概念 */}
      <div className="cd-section">
        <h2 className="cd-section-title">🎯 CI/CD 四层级（从手动到全自动）</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {CONCEPTS.map((c, i) => (
            <div key={c.name} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${c.color}18` }}>
              <div style={{ width: 6, borderRadius: 3, background: c.color, alignSelf: 'stretch', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: c.color, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{i + 1}. {c.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.65, marginBottom: '0.25rem' }}>{c.desc}</div>
                <div style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: `${c.color}10`, color: c.color, borderRadius: '4px', display: 'inline-block', fontFamily: 'JetBrains Mono' }}>📊 目标 KPI：{c.metric}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 工具对比 */}
      <div className="cd-section">
        <h2 className="cd-section-title">🛠️ 主流 CI/CD 工具对比（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {TOOLS.map((t, i) => (
            <button key={i} onClick={() => { setActiveTool(i); setShowCode(false); }}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTool === i ? t.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTool === i ? `${t.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTool === i ? t.color : '#8b949e' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{t.icon}</div>
              {t.name}
            </button>
          ))}
        </div>

        <div className="cd-card" style={{ borderColor: `${tool.color}25` }}>
          <div className="cd-grid-2" style={{ marginBottom: '0.875rem' }}>
            <div>
              {[['定位', tool.type], ['托管方式', tool.host], ['费用', tool.cost], ['最佳场景', tool.best]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                  <span style={{ color: '#8b949e', minWidth: 70 }}>{k}：</span>
                  <span style={{ color: tool.color }}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', marginBottom: '0.25rem' }}>✅ 优势</div>
              {tool.pros.map(p => <div key={p} style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '0.15rem' }}>• {p}</div>)}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171', marginTop: '0.4rem', marginBottom: '0.25rem' }}>⚠️ 限制</div>
              {tool.cons.map(c => <div key={c} style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '0.15rem' }}>• {c}</div>)}
            </div>
          </div>
          <button className="cd-btn" onClick={() => setShowCode(s => !s)}
            style={{ borderColor: `${tool.color}40`, color: tool.color }}>
            {showCode ? '▲ 收起代码' : '▼ 查看配置示例'}
          </button>
        </div>

        {showCode && (
          <div className="cd-code-wrap">
            <div className="cd-code-head">
              <div className="cd-code-dot" style={{ background: '#ef4444' }} />
              <div className="cd-code-dot" style={{ background: '#f59e0b' }} />
              <div className="cd-code-dot" style={{ background: tool.color }} />
              <span style={{ color: tool.color, marginLeft: '0.5rem' }}>{tool.icon} {tool.name} — 配置示例</span>
            </div>
            <div className="cd-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflowY: 'auto' }}>{tool.code}</div>
          </div>
        )}
      </div>

      {/* 选型矩阵 */}
      <div className="cd-section">
        <h2 className="cd-section-title">📊 选型决策矩阵</h2>
        <div className="cd-card">
          <table className="cd-table">
            <thead><tr><th>场景</th><th>推荐工具</th><th>原因</th></tr></thead>
            <tbody>
              {[
                ['开源 GitHub 项目', 'GitHub Actions', '原生集成，免费额度够用，插件丰富'],
                ['企业私有化部署', 'GitLab CI/CD 或 Jenkins', '数据不出内网，完全掌控'],
                ['云原生 K8s 项目', 'Tekton + ArgoCD', 'GitOps原生，声明式，自动同步'],
                ['迁移存量 Jenkins', '渐进迁移到 GitHub Actions', 'Jenkins 并行运行，逐步迁移各 job'],
                ['金融/合规要求严格', 'Jenkins（自建）+ ArgoCD', '完整审计链，变更必须经 Git PR'],
              ].map(([scene, tool, reason]) => (
                <tr key={scene}>
                  <td style={{ fontWeight: 700, color: '#e6edf3', fontSize: '0.82rem' }}>{scene}</td>
                  <td><span className="cd-tag green" style={{ fontFamily: 'JetBrains Mono' }}>{tool}</span></td>
                  <td style={{ fontSize: '0.77rem', color: '#8b949e' }}>{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cd-nav">
        <div />
        <button className="cd-btn primary" onClick={() => navigate('/course/cicd-gitops/lesson/github-actions')}>下一模块：GitHub Actions →</button>
      </div>
    </div>
  );
}
