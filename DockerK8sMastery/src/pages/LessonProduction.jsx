import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PIPELINE_STAGES = [
  { id: 'code',     icon: '👨‍💻', title: '代码提交',    tool: 'Git + GitHub',         desc: '开发者推送代码到仓库，触发 CI/CD 流水线',           detail: 'git commit -m "feat: add payment service"\ngit push origin main\n→ GitHub Webhook 触发 GitHub Actions' },
  { id: 'ci',       icon: '🔄', title: 'CI 构建测试',  tool: 'GitHub Actions',       desc: '自动运行单元测试、代码扫描、Docker 构建',           detail: 'jobs:\n  test:\n    steps:\n    - run: pytest tests/\n    - run: docker build -t app:$SHA .\n    - run: trivy image app:$SHA  # 安全扫描\n    - run: docker push registry/app:$SHA' },
  { id: 'registry', icon: '📦', title: '镜像推送',    tool: 'Harbor / ECR',          desc: '通过安全扫描的镜像推送到私有仓库',                   detail: 'docker tag app:$SHA \\\n  gcr.io/my-project/app:$SHA\ndocker push gcr.io/my-project/app:$SHA\n\n# Harbor 自动扫描漏洞\n# CVE 高危漏洞则阻断部署' },
  { id: 'staging',  icon: '🧪', title: '预发验证',    tool: 'Argo CD / Helm',        desc: '自动部署到 staging，运行 E2E 测试',                 detail: 'helm upgrade api chart/api \\\n  --namespace staging \\\n  --set image.tag=$SHA\nkubectl wait deployment/api \\\n  --for=condition=Available --timeout=120s\nnpx playwright test  # E2E 测试' },
  { id: 'approve',  icon: '✅', title: '人工审批',    tool: 'GitHub Environments',   desc: '生产部署需要高级工程师手动批准',                   detail: '# GitHub Actions Environment Protection\nenvironment:\n  name: production\n  url: https://app.example.com\n\n# 配置 Required Reviewers\n# 批准后自动触发生产部署' },
  { id: 'prod',     icon: '🚀', title: '生产发布',    tool: 'K8s Rolling Update',    desc: '零停机滚动更新到生产集群，自动监控回滚',             detail: 'kubectl set image deployment/api \\\n  api=gcr.io/my-project/app:$SHA\n\n# 监控部署状态\nkubectl rollout status deployment/api\n\n# 自动回滚（错误率 > 1% 触发）\n# kubectl rollout undo deployment/api' },
];

// GitHub Actions workflow shown as static string — escape ${{ to avoid Vite parse issues
const CICD_YAML = [
  '# .github/workflows/deploy.yml',
  'name: Build & Deploy to K8s',
  '',
  'on:',
  '  push:',
  '    branches: [main]',
  '',
  'env:',
  '  IMAGE: gcr.io/${{ secrets.GCP_PROJECT }}/api',
  '  SHA:   ${{ github.sha }}',
  '',
  'jobs:',
  '  build-test:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '    - uses: actions/checkout@v4',
  '    - name: Run Tests',
  '      run: |',
  '        pip install -r requirements-dev.txt',
  '        pytest tests/ --cov=app --cov-report=xml',
  '    - name: Build Image',
  '      run: docker build -t $IMAGE:$SHA .',
  '    - name: Security Scan (Trivy)',
  '      uses: aquasecurity/trivy-action@master',
  '      with:',
  '        image-ref: $IMAGE:$SHA',
  "        exit-code: '1'    # 高危漏洞则失败",
  '    - name: Push to Registry',
  '      run: |',
  '        gcloud auth configure-docker gcr.io',
  '        docker push $IMAGE:$SHA',
  '',
  '  deploy-staging:',
  '    needs: build-test',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '    - name: Deploy to Staging',
  '      run: |',
  '        kubectl set image deployment/api api=$IMAGE:$SHA \\',
  '          -n staging',
  '        kubectl rollout status deployment/api -n staging',
  '    - name: E2E Tests',
  '      run: npx playwright test --project=staging',
  '',
  '  deploy-production:',
  '    needs: deploy-staging',
  '    runs-on: ubuntu-latest',
  '    environment: production  # 需要审批人批准',
  '    steps:',
  '    - name: Deploy to Production',
  '      run: |',
  '        kubectl set image deployment/api api=$IMAGE:$SHA \\',
  '          -n production',
  '        kubectl rollout status deployment/api -n production --timeout=5m',
  '    - name: Notify Slack',
  '      if: always()',
  '      uses: slackapi/slack-github-action@v1',
  '      with:',
  '        payload: \'{"text":"✅ api deployed to production"}\'',
].join('\n');

export default function LessonProduction() {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(null);

  return (
    <div className="lesson-dk">
      <div className="dk-badge">🚀 module_08 — 生产实战</div>

      <div className="dk-hero">
        <h1>生产实战：从代码到 K8s 生产环境的完整 DevOps</h1>
        <p>理论终须落地。将 Git、Docker、K8s 和 CI/CD 串联成一条<strong>完整的工业级交付流水线</strong>——这就是现代 DevOps 工程师的核心竞争力。</p>
      </div>

      {/* 流水线可视化 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🏗️ 完整 CI/CD 流水线（点击每步查看详情）</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {PIPELINE_STAGES.map((s, i) => (
            <React.Fragment key={s.id}>
              <div onClick={() => setActiveStage(activeStage === i ? null : i)}
                style={{ flex: 1, minWidth: 100, padding: '0.875rem 0.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeStage === i ? 'rgba(13,183,237,0.12)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeStage === i ? 'rgba(13,183,237,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '8px',
                }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: activeStage === i ? '#0db7ed' : '#e2e8f0' }}>{s.title}</div>
                <div style={{ fontSize: '0.62rem', color: '#326CE5', marginTop: '0.15rem', fontFamily: 'JetBrains Mono' }}>{s.tool}</div>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div style={{ color: '#0db7ed', fontSize: '1.2rem', padding: '0 0.2rem', flexShrink: 0 }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {activeStage !== null && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(13,183,237,0.06)', border: '1px solid rgba(13,183,237,0.2)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: '#0db7ed', marginBottom: '0.25rem' }}>
              {PIPELINE_STAGES[activeStage].icon} {PIPELINE_STAGES[activeStage].title} — {PIPELINE_STAGES[activeStage].tool}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>{PIPELINE_STAGES[activeStage].desc}</div>
            <div className="dk-term-wrapper" style={{ marginBottom: 0 }}>
              <div className="dk-term-header">
                <div className="dk-term-dot" style={{ background: '#ef4444' }} />
                <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
                <div className="dk-term-dot" style={{ background: '#10b981' }} />
                <span style={{ marginLeft: '0.5rem' }}>pipeline step</span>
              </div>
              <div className="dk-term" style={{ fontSize: '0.75rem' }}>{PIPELINE_STAGES[activeStage].detail}</div>
            </div>
          </div>
        )}
      </div>

      {/* GitHub Actions YAML */}
      <div className="dk-section">
        <h2 className="dk-section-title">📄 完整 GitHub Actions 工作流</h2>
        <div className="dk-term-wrapper">
          <div className="dk-term-header">
            <div className="dk-term-dot" style={{ background: '#ef4444' }} />
            <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
            <div className="dk-term-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>.github/workflows/deploy.yml</span>
          </div>
          <div className="dk-term" style={{ maxHeight: '420px', overflow: 'auto', fontSize: '0.73rem' }}>{CICD_YAML}</div>
        </div>
      </div>

      {/* 生产核查清单 */}
      <div className="dk-section">
        <h2 className="dk-section-title">📋 生产上线 Checklist（CKA 考试必考）</h2>
        <div className="dk-grid-2">
          {[
            { cat: '🔒 安全', items: ['非 root 用户运行容器', 'Network Policy 隔离服务间流量', 'Secret 使用 Vault 等外部管理', 'RBAC 最小权限原则', '镜像来自私有仓库且已扫描', 'Pod Security Admission 启用'] },
            { cat: '📈 高可用', items: ['Deployment replicas ≥ 2', 'Pod AntiAffinity 跨节点分布', 'PodDisruptionBudget 设置', 'readinessProbe 配置正确', 'ResourceRequest/Limit 设置', 'HPA 自动扩缩容配置'] },
            { cat: '⚡ 性能', items: ['镜像使用 multi-stage 瘦身', 'CPU/Memory Request 合理校准', 'configMap 挂载热更新配置', 'Ingress 配置 HTTP/2 和压缩', 'PVC 使用 SSD StorageClass', '关键接口配置 Circuit Breaker'] },
            { cat: '👁️ 可观测', items: ['Prometheus 指标暴露 /metrics', 'Grafana Dashboard 关键面板', 'Loki/ELK 日志聚合配置', '告警规则覆盖核心 SLI', 'Distributed Tracing 接入', '错误率和延迟 SLO 定义'] },
          ].map(g => (
            <div key={g.cat} className="dk-card">
              <h3 style={{ color: '#0db7ed', marginBottom: '0.75rem' }}>{g.cat}</h3>
              {g.items.map(item => (
                <div key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', color: '#94a3b8' }}>
                  <span style={{ color: '#0db7ed', flexShrink: 0 }}>▸</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 课程完成 */}
      <div className="dk-section">
        <div className="dk-card" style={{ background: 'linear-gradient(135deg, rgba(13,183,237,0.08), rgba(50,108,229,0.06))', borderColor: 'rgba(13,183,237,0.3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#0db7ed', fontSize: '1.2rem', marginBottom: '1rem' }}>恭喜完成 Docker &amp; K8s 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', textAlign: 'left' }}>
            {[
              '✅ 容器 vs VM 核心机制',
              '✅ Docker 镜像/容器/网络/卷',
              '✅ Dockerfile 多阶段构建',
              '✅ Docker Compose 多服务编排',
              '✅ K8s Pod/Deployment/Service',
              '✅ HPA 弹性伸缩 + 滚动更新',
              '✅ Prometheus/Grafana 监控',
              '✅ 企业级 CI/CD 完整流水线',
            ].map(s => (
              <div key={s} style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{s}</div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <span className="dk-tag k8s" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
              下一步：CKA 认证 (Certified Kubernetes Administrator)
            </span>
          </div>
        </div>
      </div>

      <div className="dk-nav">
        <button className="dk-btn" onClick={() => navigate('/course/devops-mastery/lesson/observability')}>← 上一模块</button>
        <button className="dk-btn primary" onClick={() => navigate('/course/devops-mastery')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
