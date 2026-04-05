import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const HELM_TOPICS = [
  {
    name: 'Chart 结构', icon: '📁', color: '#22c55e',
    code: `# Helm Chart 目录结构
myapp/                    # Chart 根目录
├── Chart.yaml            # Chart 元信息（名称/版本/依赖）
├── values.yaml           # 默认配置值（可被覆盖）
├── values-staging.yaml   # Staging 环境覆盖
├── values-prod.yaml      # Production 环境覆盖
├── .helmignore           # 忽略文件
├── templates/            # K8s 资源模板（Go 模板语法）
│   ├── _helpers.tpl      # 可复用的命名模板（宏）
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml          # 水平扩缩容
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── serviceaccount.yaml
│   └── NOTES.txt         # helm install 完成后显示的说明
└── charts/               # 依赖的子 Chart（如 postgresql）

# Chart.yaml
apiVersion: v2
name: myapp
description: My Awesome App
type: application
version: 1.3.0            # Chart 版本（语义化）
appVersion: "2.1.0"       # 应用版本
dependencies:
  - name: postgresql
    version: "14.5.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled  # 可选依赖`,
  },
  {
    name: 'Templates 语法', icon: '📝', color: '#3b82f6',
    code: `# templates/deployment.yaml — Go 模板语法
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}   # 引用 _helpers.tpl 中的命名模板
  labels:
    {{- include "myapp.labels" . | nindent 4 }}   # nindent 控制缩进
  annotations:
    kubernetes.io/change-cause: "{{ .Release.Revision }} - {{ .Values.image.tag }}"
spec:
  replicas: {{ .Values.replicaCount }}    # 从 values.yaml 读取
  {{- if .Values.autoscaling.enabled }}   # 条件判断
  # HPA 管控时不设置 replicas
  {{- else }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          ports:
            - containerPort: {{ .Values.service.port }}
          env:
            {{- range $key, $val := .Values.env }}  # 遍历 map
            - name: {{ $key }}
              value: {{ $val | quote }}
            {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}  # 直接渲染 YAML

# _helpers.tpl — 可复用模板
{{- define "myapp.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}`,
  },
  {
    name: 'Values 覆盖策略', icon: '⚙️', color: '#f59e0b',
    code: `# values.yaml — 默认值（开发环境）
replicaCount: 1
image:
  repository: ghcr.io/myorg/app
  tag: ""  # 留空，CI 会覆盖为 SHA
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8000

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: false

env:
  DATABASE_URL: "postgresql://localhost/dev"
  LOG_LEVEL: "debug"

# ──────────────────────────────────────────
# values-prod.yaml — 生产环境覆盖（只写差异！）
replicaCount: 3           # 3副本

resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 2000m
    memory: 2Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70

env:
  DATABASE_URL: "postgresql://prod-rds.aws.com/prod"
  LOG_LEVEL: "info"

# ── CI 中动态传入镜像版本 ──
helm upgrade --install myapp ./helm \\
  -f values-prod.yaml \\
  --set image.tag=$GITHUB_SHA \\        # 覆盖镜像 Tag
  --set replicaCount=5 \\               # 临时扩容
  --atomic \\                           # 失败自动回滚！
  --timeout 5m \\
  --wait`,
  },
  {
    name: 'OCI / 版本管理', icon: '📦', color: '#6366f1',
    code: `# ── Helm Chart 版本管理 & OCI 仓库 ──

# 推送到 OCI 仓库（GitHub Container Registry）
helm registry login ghcr.io -u myuser -p $GITHUB_TOKEN
helm package ./helm                      # 生成 myapp-1.3.0.tgz
helm push myapp-1.3.0.tgz oci://ghcr.io/myorg/charts

# 从 OCI 安装（无需 helm repo add）
helm install myapp oci://ghcr.io/myorg/charts/myapp --version 1.3.0

# ── Helm Hooks — 生命周期钩子 ──
# templates/db-migration.yaml（部署前自动执行数据库迁移！）
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-migration
  annotations:
    "helm.sh/hook": pre-upgrade,pre-install  # 在 helm install/upgrade 前运行
    "helm.sh/hook-weight": "-5"              # 权重越小越先执行
    "helm.sh/hook-delete-policy": hook-succeeded  # 成功后自动删除 Job
spec:
  template:
    spec:
      containers:
        - name: migration
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          command: ["python", "manage.py", "migrate"]
      restartPolicy: Never

# ── Helm Diff 查看变更（安全！）──
# helm plugin install https://github.com/databus23/helm-diff
helm diff upgrade myapp ./helm -f values-prod.yaml
# 显示所有将要变更的 K8s 资源（类似 git diff）

# ── Helmfile 多环境管理 ──
# helmfile.yaml
releases:
  - name: myapp
    chart: ./helm
    values:
      - values-{{ .Environment.Name }}.yaml  # 根据环境自动选择
helmfile -e production sync`,
  },
];

export default function LessonHelmChart() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = HELM_TOPICS[activeTopic];

  return (
    <div className="lesson-cd">
      <div className="cd-badge indigo">⛵ module_04 — Helm Chart</div>
      <div className="cd-hero">
        <h1>Helm Chart：模板 / Values / Release 版本管理</h1>
        <p>Helm 是 Kubernetes 的<strong>包管理器</strong>，把复杂的 K8s YAML 文件用 Go 模板封装成可复用、可版本化的 Chart。一套 Chart + 不同 values 文件 = 多环境部署。</p>
      </div>

      {/* Helm 工作流 */}
      <div className="cd-interactive">
        <h3 style={{ marginBottom: '0.5rem' }}>⛵ Helm Release 生命周期</h3>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#8b949e', lineHeight: 2.2 }}>
          <pre style={{ color: '#aff5b4', margin: 0 }}>{`
helm install myapp ./helm -f values-prod.yaml --set image.tag=abc1234
    │
    ├── Helm 渲染模板（values 注入 templates/）
    ├── 提交 K8s API Server
    ├── 等待 Pods Ready（--wait）
    └── Release 成功 → 记录到 Secrets（myapp-v1）

helm upgrade myapp ./helm -f values-prod.yaml --set image.tag=def5678 --atomic
    │
    ├── 创建新版本 Release（myapp-v2）
    ├── Rolling Update（Deployment 滚动更新）
    ├── 等待 Pods Ready
    ├── 成功 → myapp-v2 成为当前版本
    └── 失败 → 自动回滚到 myapp-v1（--atomic 保证！）

helm rollback myapp 1       # 手动回滚到版本1
helm history myapp          # 查看所有历史版本
helm uninstall myapp        # 删除所有资源`}</pre>
        </div>
      </div>

      {/* 四主题 */}
      <div className="cd-section">
        <h2 className="cd-section-title">📖 Helm 四大核心主题</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {HELM_TOPICS.map((topic, i) => (
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
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name} — Helm</span>
          </div>
          <div className="cd-code" style={{ fontSize: '0.75rem', maxHeight: 420, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="cd-nav">
        <button className="cd-btn" onClick={() => navigate('/course/cicd-gitops/lesson/docker-build')}>← 上一模块</button>
        <button className="cd-btn primary" onClick={() => navigate('/course/cicd-gitops/lesson/argocd')}>下一模块：ArgoCD →</button>
      </div>
    </div>
  );
}
