import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ARCH_LAYERS = [
  { layer: '用户入口', icon: '🌍', color: '#38bdf8', services: ['CloudFront CDN (全球加速)', 'WAF (SQL注入/XSS防护)', 'Route 53 (DNS + 健康检查)'] },
  { layer: 'API 网关层', icon: '🚪', color: '#FF9900', services: ['API Gateway (鉴权+限流)', 'AWS ALB → EKS (容器服务)', 'Cloud Run (GCP Serverless API)'] },
  { layer: '应用微服务', icon: '⚙️', color: '#a78bfa', services: ['User Service (EKS)', 'Order Service (EKS)', 'Product Service (Cloud Run)', 'Payment Service (Lambda)'] },
  { layer: '消息总线', icon: '📨', color: '#22c55e', services: ['SQS (订单队列)', 'Pub/Sub (事件广播)', 'EventBridge (事件路由)'] },
  { layer: '数据层', icon: '🗃️', color: '#fbbf24', services: ['Aurora (MySQL)', 'Redis ElastiCache', 'BigQuery (数仓)', 'S3 / GCS (对象存储)'] },
  { layer: '可观测性', icon: '🔭', color: '#14b8a6', services: ['Prometheus + Grafana', 'Jaeger (链路追踪)', 'CloudWatch / Cloud Logging'] },
];

const DISASTER_STEPS = [
  { phase: '预防', color: '#22c55e', items: ['多 AZ 部署：跨可用区复制所有有状态服务', 'RTO/RPO 定义：电商业务 RTO < 5分钟, RPO < 1分钟', '数据库跨区域只读副本（用于加速读取 + 容灾）', 'S3 跨区域复制（CRR）：静态资源自动同步'] },
  { phase: '检测', color: '#fbbf24', items: ['CloudWatch/Grafana 告警：P99 > 500ms 触发', 'Route 53 健康检查：每30秒探测', 'Synthetics 金丝雀：模拟真实用户操作', 'On-call 轮值 + PagerDuty 电话告警'] },
  { phase: '恢复', color: '#f87171', items: ['自动故障切换：ALB 摘除不健康目标', '数据库 failover：RDS Multi-AZ 自动切换（< 2分钟）', '回滚部署：ArgoCD 一键回滚到上个版本', '降级策略：支付超时时返回"稍后重试"保持可用'] },
];

const PROD_CONFIG = `# kubernetes/prod-deployment.yaml
# 生产级别的 Kubernetes 部署配置

apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: ecommerce
  labels:
    app: order-service
    version: v2.4.1
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2          # 最多多出2个新Pod
      maxUnavailable: 0    # 滚动时不减少可用Pod（零停机）
  selector:
    matchLabels:
      app: order-service
  template:
    spec:
      # 亲和性：避免所有Pod调度到同一节点
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - topologyKey: kubernetes.io/hostname
      containers:
      - name: order-service
        image: 123456789.dkr.ecr.ap-east-1.amazonaws.com/order-service:v2.4.1
        ports:
        - containerPort: 8080
        # 资源限制（必须设置，防止OOM）
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        # 健康检查
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 3  # 连续失败3次才从LB摘除
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 15
          failureThreshold: 3  # 连续失败3次才重启Pod
        # 优雅停机（接到 SIGTERM 后完成处理中请求）
        lifecycle:
          preStop:
            exec:
              command: ["sleep", "10"]  # 等 LB 摘除后再停
        terminationGracePeriodSeconds: 30
        # 环境变量（从 AWS Parameter Store 注入）
        env:
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: order-db-secret
              key: url
---
# HPA（水平自动扩缩容）
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: External
    external:
      metric:
        name: sqs_queue_depth  # 按消息队列积压扩容
      target:
        type: AverageValue
        averageValue: "100"`;

export default function LessonProduction() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeDisaster, setActiveDisaster] = useState(0);

  return (
    <div className="lesson-cn">
      <div className="cn-badge">🚀 module_08 — 生产实战</div>

      <div className="cn-hero">
        <h1>生产实战：多云电商平台架构设计</h1>
        <p>把前七个模块的所有技术融合成一个现实场景：<strong>AWS 跑业务主力 + GCP 做数据智能，Terraform 管基础设施，OpenTelemetry 统一可观测</strong>，这就是真实的多云生产架构。</p>
      </div>

      {/* 多云架构分层图 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🏗️ 多云电商平台架构（点击层查看服务）</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {ARCH_LAYERS.map((layer, i) => (
            <div key={layer.layer} onClick={() => setActiveLayer(activeLayer === i ? null : i)}
              style={{ padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${activeLayer === i ? layer.color + '50' : 'rgba(255,255,255,0.06)'}`,
                background: activeLayer === i ? `${layer.color}09` : 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>{layer.icon}</span>
                <span style={{ fontWeight: 700, color: layer.color, fontSize: '0.88rem', minWidth: 120 }}>{layer.layer}</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {activeLayer === i
                    ? layer.services.map(s => <span key={s} className="cn-tag blue" style={{ background: `${layer.color}12`, color: layer.color, fontSize: '0.72rem' }}>{s}</span>)
                    : <span style={{ fontSize: '0.72rem', color: '#1e4060' }}>{layer.services.join('  ·  ')}</span>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 容灾与高可用 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🛡️ 容灾与高可用三阶段</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
          {DISASTER_STEPS.map((d, i) => (
            <button key={d.phase} onClick={() => setActiveDisaster(i)}
              style={{ flex: 1, padding: '0.625rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${activeDisaster === i ? d.color + '55' : 'rgba(255,255,255,0.07)'}`,
                background: activeDisaster === i ? `${d.color}10` : 'rgba(255,255,255,0.02)',
                color: activeDisaster === i ? d.color : '#1e4060', fontSize: '0.88rem' }}>
              {d.phase}
            </button>
          ))}
        </div>
        <div className="cn-card" style={{ borderColor: `${DISASTER_STEPS[activeDisaster].color}25` }}>
          {DISASTER_STEPS[activeDisaster].items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.45rem' }}>
              <span style={{ color: DISASTER_STEPS[activeDisaster].color, fontSize: '0.9rem', flexShrink: 0 }}>→</span>
              <div style={{ fontSize: '0.82rem', color: '#1e4060' }}>{item}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 生产 K8s 配置 */}
      <div className="cn-section">
        <h2 className="cn-section-title">💻 生产级 K8s 部署配置（EKS/GKE 通用）</h2>
        <div className="cn-code-wrapper">
          <div className="cn-code-header">
            <div className="cn-code-dot" style={{ background: '#ef4444' }} />
            <div className="cn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cn-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>kubernetes/prod-deployment.yaml — 零停机 + HPA 自动扩容</span>
          </div>
          <div className="cn-code" style={{ fontSize: '0.75rem', maxHeight: 440, overflow: 'auto' }}>{PROD_CONFIG}</div>
        </div>
      </div>

      {/* 完成总结 */}
      <div className="cn-section">
        <div className="cn-card" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.07), rgba(66,133,244,0.05))', borderColor: 'rgba(14,165,233,0.3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#38bdf8', fontSize: '1.2rem', marginBottom: '1rem' }}>恭喜完成 云原生架构 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem', textAlign: 'left' }}>
            {[
              '✅ IaaS/PaaS/SaaS/FaaS 服务模型 + 12-Factor',
              '✅ AWS 核心：EC2/S3/RDS/VPC/IAM + Well-Architected',
              '✅ GCP 核心：GCE/GCS/BigQuery/Pub・Sub + Vertex AI',
              '✅ Serverless 冷启动对比模拟 + 事件驱动架构',
              '✅ EKS/GKE/Cloud Run 三平台对比选型',
              '✅ Terraform/CDK/Pulumi IaC 工具 + 最佳实践',
              '✅ FinOps 三大降本策略 + OpenTelemetry 统一可观测',
              '✅ 多云电商平台完整架构 + 生产 K8s 配置',
            ].map(s => (
              <div key={s} style={{ fontSize: '0.875rem', color: '#1e4060' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="cn-nav">
        <button className="cn-btn" onClick={() => navigate('/course/cloud-native/lesson/cost-obs')}>← 上一模块</button>
        <button className="cn-btn primary" onClick={() => navigate('/course/cloud-native')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
