import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PLATFORMS = [
  {
    name: 'EKS', full: 'Amazon Elastic Kubernetes Service',
    color: '#FF9900', provider: 'AWS',
    pros: ['生态最成熟，插件最丰富', 'AWS 服务深度集成（ALB/EFS/EBS/IAM）', '控制平面月费 $0.10/小时（~$73/月）', 'Windows 节点支持'],
    cons: ['节点管理需要较多配置', '版本升级需要手动操作', '成本高于 GKE Autopilot'],
    bestFor: '已深度投入 AWS 生态的企业，需要完整控制权',
    code: `# EKS 集群创建（eksctl 工具）
eksctl create cluster \\
  --name=prod-cluster \\
  --region=ap-east-1 \\
  --nodegroup-name=standard-workers \\
  --node-type=t3.medium \\
  --nodes=3 \\
  --nodes-min=2 \\
  --nodes-max=10 \\
  --managed \\              # 托管节点组
  --with-oidc \\            # 启用 IRSA（Pod 级 IAM 权限）
  --alb-ingress-access     # 安装 ALB Controller

# 部署应用（与标准 K8s 完全兼容）
kubectl apply -f deployment.yaml

# 配置 HPA（水平自动扩缩容）
kubectl autoscale deployment my-app \\
  --cpu-percent=70 \\
  --min=2 \\
  --max=20`,
  },
  {
    name: 'GKE', full: 'Google Kubernetes Engine',
    color: '#4285F4', provider: 'GCP',
    pros: ['Autopilot 模式：按 Pod 资源付费，节点自动管理', '自动升级/修补操作系统', '内置多集群管理（Fleet）', 'Binary Authorization 供应链安全'],
    cons: ['GKE Autopilot 对 DaemonSet 有限制', 'GCP 生态依赖（迁移成本）'],
    bestFor: '需要降低运维负担，或有 AI/ML 工作负载',
    code: `# GKE Autopilot 集群（无需管理节点）
gcloud container clusters create-auto prod-cluster \\
  --region=asia-east1 \\
  --release-channel=regular  # 自动升级到稳定版

# 部署（Autopilot 自动分配 Pod 所需资源）
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: gcr.io/PROJECT/my-app:latest
        resources:
          requests:
            memory: "512Mi"   # Autopilot 按 requests 分配
            cpu: "500m"
EOF

# 查看节点（Autopilot 节点自动伸缩）
kubectl get nodes`,
  },
  {
    name: 'Cloud Run', full: 'Google Cloud Run',
    color: '#0F9D58', provider: 'GCP',
    pros: ['完全 Serverless，无需管理节点', '秒级部署，冷启动 < 1s', '可缩减到0（低流量零成本）', '原生支持 HTTP/gRPC/WebSocket'],
    cons: ['实例生命周期受控（有状态服务受限）', '最大请求处理时间 60 分钟', 'CPU 只在请求时分配'],
    bestFor: '无状态 HTTP/gRPC 服务，希望完全不管基础设施',
    code: `# Cloud Run 部署（最简单的容器云部署）
# 只需要一个 Dockerfile，其余 Cloud Run 全自动

# service.yaml（Cloud Run 服务定义）
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: my-api
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"  # 最少1个实例
        autoscaling.knative.dev/maxScale: "100"
    spec:
      containers:
      - image: gcr.io/PROJECT/my-api:latest
        resources:
          limits:
            cpu: "2"
            memory: "1Gi"
        env:
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url

# 流量分割（金丝雀发布）
gcloud run services update-traffic my-api \\
  --to-revisions LATEST=10,CURRENT=90`,
  },
];

const EKS_GKE_COMPARISON = [
  ['控制面成本', '$0.10/小时 (~$73/月)', 'Free（Standard），Autopilot按Pod'],
  ['节点管理', '自管 or 托管节点组', 'Autopilot 全自动管理'],
  ['自动升级', '手动触发', '自动（release channel）'],
  ['存储集成', 'EBS/EFS/FSx', 'Persistent Disk/Filestore'],
  ['Ingress', 'ALB/NLB Ingress Controller', 'GKE Ingress / Gateway API'],
  ['身份认证', 'IRSA（Pod级IAM）', 'Workload Identity（更简洁）'],
  ['GPU 支持', '✅（p3/p4 节点）', '✅（A100/H100 节点）'],
  ['最适合', 'AWS 重度用户', '新项目/AI/ML工作负载'],
];

export default function LessonContainerCloud() {
  const navigate = useNavigate();
  const [activePlat, setActivePlat] = useState(0);

  const p = PLATFORMS[activePlat];

  return (
    <div className="lesson-cn">
      <div className="cn-badge">🐳 module_05 — 容器云</div>

      <div className="cn-hero">
        <h1>容器云：EKS / GKE / Cloud Run 生产实战</h1>
        <p>Kubernetes 是容器编排的事实标准，但<strong>管理 K8s 本身也是一个负担</strong>。EKS/GKE 托管控制平面，Cloud Run 更进一步连节点都不用管——根据团队能力和规模选择最合适的抽象层。</p>
      </div>

      {/* 三平台切换 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🏗️ 三大容器云平台对比（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          {PLATFORMS.map((plat, i) => (
            <button key={plat.name} onClick={() => setActivePlat(i)}
              style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 800, transition: 'all 0.2s',
                border: `1px solid ${activePlat === i ? plat.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activePlat === i ? `${plat.color}10` : 'rgba(255,255,255,0.02)',
                color: activePlat === i ? plat.color : '#1e4060' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>🐳</div>
              {plat.name}
              <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.7 }}>{plat.provider}</span>
            </button>
          ))}
        </div>

        <div className="cn-card" style={{ borderColor: `${p.color}25` }}>
          <h3 style={{ color: p.color }}>{p.name} — {p.full}</h3>
          <div className="cn-grid-2" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.82rem', marginBottom: '0.3rem' }}>✅ 优势</div>
              {p.pros.map(pr => <div key={pr} style={{ fontSize: '0.78rem', color: '#1e4060', marginBottom: '0.2rem' }}>• {pr}</div>)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.82rem', marginBottom: '0.3rem' }}>⚠️ 局限</div>
              {p.cons.map(c => <div key={c} style={{ fontSize: '0.78rem', color: '#1e4060', marginBottom: '0.2rem' }}>• {c}</div>)}
            </div>
          </div>
          <div style={{ padding: '0.6rem 0.875rem', background: `${p.color}08`, borderRadius: '6px', fontSize: '0.82rem', color: '#1e4060', marginBottom: '0.875rem' }}>
            🎯 <strong style={{ color: '#fbbf24' }}>最适合：</strong>{p.bestFor}
          </div>
          <div className="cn-code-wrapper">
            <div className="cn-code-header">
              <div className="cn-code-dot" style={{ background: '#ef4444' }} />
              <div className="cn-code-dot" style={{ background: '#f59e0b' }} />
              <div className="cn-code-dot" style={{ background: p.color }} />
              <span style={{ marginLeft: '0.5rem', color: p.color }}>{p.name} — 核心配置示例</span>
            </div>
            <div className="cn-code" style={{ fontSize: '0.75rem', maxHeight: 300, overflow: 'auto' }}>{p.code}</div>
          </div>
        </div>
      </div>

      {/* EKS vs GKE 细节对比 */}
      <div className="cn-section">
        <h2 className="cn-section-title">⚖️ EKS vs GKE 对比</h2>
        <div className="cn-card">
          <table className="cn-table">
            <thead><tr><th>维度</th><th>🟠 EKS</th><th>🔵 GKE</th></tr></thead>
            <tbody>
              {EKS_GKE_COMPARISON.map(([d, a, g]) => (
                <tr key={d}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>{d}</td>
                  <td style={{ fontSize: '0.8rem', color: '#FF9900' }}>{a}</td>
                  <td style={{ fontSize: '0.8rem', color: '#74a9ff' }}>{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cn-nav">
        <button className="cn-btn" onClick={() => navigate('/course/cloud-native/lesson/serverless')}>← 上一模块</button>
        <button className="cn-btn primary" onClick={() => navigate('/course/cloud-native/lesson/iac')}>下一模块：基础设施即代码 →</button>
      </div>
    </div>
  );
}
