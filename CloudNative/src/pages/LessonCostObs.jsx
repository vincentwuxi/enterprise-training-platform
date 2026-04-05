import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const COST_STRATEGIES = [
  {
    name: '实例购买策略', icon: '💰', color: '#FF9900',
    savings: '最高75%',
    code: `# AWS 三种购买方式对比

# 1. On-Demand（按需实例）
# 适合：测试、短期峰值、不确定负载
# 价格：t3.xlarge = $0.1664/小时（基准）

# 2. Reserved Instance（预留实例）1年期
# 适合：稳定的基准负载
# 折扣：1年 ~40%，3年 ~60%
aws ec2 purchase-reserved-instances-offering \\
  --instance-count 5 \\
  --reserved-instances-offering-id xxx \\
  --instance-tenancy default

# 3. Spot Instance（竞价实例）
# 适合：可中断的批处理工作（ML训练/数据ETL）
# 折扣：最高75%，但可能被中断（2分钟预警）
aws ec2 request-spot-instances \\
  --spot-price "0.05" \\  # 最高出价
  --instance-count 10 \\
  --launch-specification file://spec.json

# 4. Savings Plans（省钱计划）- 推荐
# 承诺每小时最低花费，自动应用最大折扣
# Compute Savings Plans：跨实例类型/大小/区域
aws savingsplans purchase \\
  --savings-plan-type COMPUTE \\
  --term-duration YEAR_1 \\
  --payment-option NO_UPFRONT \\
  --hourly-commitment 10.0  # 承诺每小时消费$10`,
  },
  {
    name: 'Right-Sizing', icon: '📐', color: '#22c55e',
    savings: '平均25%',
    code: `# AWS Compute Optimizer 分析建议
aws compute-optimizer get-ec2-instance-recommendations \\
  --filters Name=RecommendationSourceType,Values=Ec2Instance

# 查看过度配置的实例
# 响应示例：
# {
#   "instanceArn": "arn:aws:ec2:...:instance/i-1234",
#   "finding": "OVER_PROVISIONED",  ← CPU 平均使用率 < 5%
#   "recommendationOptions": [{
#     "instanceType": "t3.medium",    ← 当前 t3.xlarge
#     "estimatedMonthlySavings": {
#       "value": 45.60,              ← 每月节省 $45.60
#       "currency": "USD"
#     }
#   }]
# }

# GCP Recommender（等价工具）
gcloud recommender recommendations list \\
  --recommender=google.compute.instance.MachineTypeRecommender \\
  --location=us-central1-a \\
  --format=json | jq '.[].primaryImpact.costProjection'`,
  },
  {
    name: 'S3 生命周期', icon: '🪣', color: '#38bdf8',
    savings: '存储成本70%',
    code: `# S3 生命周期策略（自动阶梯式降价）
aws s3api put-bucket-lifecycle-configuration \\
  --bucket my-data-bucket \\
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "archive-old-data",
      "Status": "Enabled",
      "Filter": {"Prefix": "logs/"},
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"  // 30天：标准IA (-46%)
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER_IR"   // 90天：Glacier即时取回 (-68%)
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE" // 1年：深度归档 (-95%)
        }
      ],
      "Expiration": {
        "Days": 2555  // 7年后自动删除（合规保留期）
      }
    }]
  }'

# 成本示意（1TB 数据/月）
# Standard:       $23/月
# Standard-IA:    $12.5/月  (节省 $10.5)
# Glacier IR:     $4/月   (节省 $19)
# Deep Archive:   $1/月   (节省 $22)`,
  },
];

const OTEL_CODE = `# OpenTelemetry — 一次埋点，多平台兼容
# pip install opentelemetry-api opentelemetry-sdk
# pip install opentelemetry-exporter-otlp

from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# 初始化（startup 时调用一次）
def setup_telemetry():
    provider = TracerProvider()
    provider.add_span_processor(
        BatchSpanProcessor(
            OTLPSpanExporter(endpoint="http://otel-collector:4317")
        )
    )
    trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

# ── 在 FastAPI 中使用 ──
from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

app = FastAPI()
FastAPIInstrumentor.instrument_app(app)  # 自动追踪所有请求

# ── 手动创建 Span（细粒度追踪）──
@app.post("/orders")
async def create_order(order: OrderCreate, db = Depends(get_db)):
    with tracer.start_as_current_span("create-order") as span:
        span.set_attribute("order.user_id", order.user_id)
        span.set_attribute("order.total", float(order.total))

        with tracer.start_as_current_span("validate-inventory"):
            await validate_inventory(order.items)

        with tracer.start_as_current_span("write-database"):
            result = await db.create_order(order)

        span.set_attribute("order.id", result.id)
        return result

# 数据流向：应用 → OpenTelemetry Collector → Jaeger/Grafana Tempo/CloudWatch`;

export default function LessonCostObs() {
  const navigate = useNavigate();
  const [activeStrategy, setActiveStrategy] = useState(0);
  const [checklist, setChecklist] = useState({});
  const toggle = i => setChecklist(p => ({ ...p, [i]: !p[i] }));

  const CHECKLIST = [
    '✅ 开启 AWS Cost Explorer 或 GCP Cost Reports，设置月度预算警报',
    '✅ 用 Compute Optimizer（AWS）或 Recommender（GCP）检查过度配置实例',
    '✅ 稳定负载购买 Savings Plans（AWS）或 CUD（GCP），节省最高60%',
    '✅ 批处理任务（ML训练/数据ETL）改用 Spot/Preemptible 实例',
    '✅ S3/GCS 数据按访问频率设置生命周期策略（3个月未访问自动降级）',
    '✅ 关闭/删除未使用的资源（停止的EC2的EBS仍在计费！）',
    '✅ 所有服务接入 OpenTelemetry，统一收集 Metrics/Logs/Traces',
    '✅ 设置关键指标 SLO Alert（P99延迟/错误率/可用性）',
    '✅ 每月进行 Cost Review，找出增长最快的10个资源',
    '✅ 给所有资源打 Environment/Team/Project 标签，支持成本分类',
  ];

  const s = COST_STRATEGIES[activeStrategy];

  return (
    <div className="lesson-cn">
      <div className="cn-badge green">💰 module_07 — 成本与可观测</div>

      <div className="cn-hero">
        <h1>成本优化与可观测性：FinOps + OpenTelemetry</h1>
        <p>云账单失控是企业上云后最常见的痛点。<strong>FinOps = 财务 + 工程 + 业务</strong>协作治理云成本。可观测性告诉你到底发生了什么——<strong>Metrics / Logs / Traces 三支柱缺一不可</strong>。</p>
      </div>

      {/* 三大降本策略 */}
      <div className="cn-section">
        <h2 className="cn-section-title">💰 三大降本策略（切换查看命令）</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {COST_STRATEGIES.map((cs, i) => (
            <button key={cs.name} onClick={() => setActiveStrategy(i)}
              style={{ flex: 1, minWidth: 160, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, transition: 'all 0.2s',
                border: `1px solid ${activeStrategy === i ? cs.color + '55' : 'rgba(255,255,255,0.07)'}`,
                background: activeStrategy === i ? `${cs.color}10` : 'rgba(255,255,255,0.02)',
                color: activeStrategy === i ? cs.color : '#1e4060' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{cs.icon}</div>
              {cs.name}
              <div style={{ fontSize: '0.7rem', marginTop: '0.15rem', color: '#22c55e' }}>节省 {cs.savings}</div>
            </button>
          ))}
        </div>
        <div className="cn-code-wrapper">
          <div className="cn-code-header">
            <div className="cn-code-dot" style={{ background: '#ef4444' }} />
            <div className="cn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cn-code-dot" style={{ background: s.color }} />
            <span style={{ marginLeft: '0.5rem', color: s.color }}>{s.icon} {s.name}</span>
          </div>
          <div className="cn-code" style={{ fontSize: '0.75rem', maxHeight: 340, overflow: 'auto' }}>{s.code}</div>
        </div>
      </div>

      {/* 可观测性三支柱 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🔭 可观测性三支柱</h2>
        <div className="cn-grid-3">
          {[
            { icon: '📈', name: 'Metrics（指标）', desc: '数值化的系统状态：CPU/内存/请求数/错误率/P99延迟。适合告警和趋势分析', tool: 'Prometheus + Grafana / CloudWatch', color: '#22c55e' },
            { icon: '📋', name: 'Logs（日志）', desc: '离散事件记录：错误堆栈、请求详情、核查日志。适合调试具体问题', tool: 'CloudWatch Logs / GCP Logging / ELK Stack', color: '#fbbf24' },
            { icon: '🔗', name: 'Traces（链路追踪）', desc: '请求在微服务间的完整调用链：哪个服务慢、哪里出错，精确定位', tool: 'Jaeger / Grafana Tempo / AWS X-Ray', color: '#a78bfa' },
          ].map(p => (
            <div key={p.name} className="cn-card" style={{ borderColor: `${p.color}20` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{p.icon}</div>
              <h3 style={{ color: p.color, fontSize: '0.9rem' }}>{p.name}</h3>
              <p style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }}>{p.desc}</p>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#38bdf8' }}>{p.tool}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OpenTelemetry 代码 */}
      <div className="cn-section">
        <h2 className="cn-section-title">💻 OpenTelemetry — 统一埋点代码</h2>
        <div className="cn-code-wrapper">
          <div className="cn-code-header">
            <div className="cn-code-dot" style={{ background: '#ef4444' }} />
            <div className="cn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cn-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>app/telemetry.py — OpenTelemetry + FastAPI</span>
          </div>
          <div className="cn-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflow: 'auto' }}>{OTEL_CODE}</div>
        </div>
      </div>

      {/* FinOps Checklist */}
      <div className="cn-section">
        <h2 className="cn-section-title">✅ FinOps + 可观测性 Checklist（{Object.values(checklist).filter(Boolean).length}/{CHECKLIST.length} 完成）</h2>
        <div className="cn-meter" style={{ marginBottom: '0.75rem' }}>
          <div className="cn-meter-fill" style={{ width: `${(Object.values(checklist).filter(Boolean).length / CHECKLIST.length) * 100}%`, background: 'linear-gradient(90deg, #0369a1, #0ea5e9)' }} />
        </div>
        {CHECKLIST.map((item, i) => (
          <div key={i} onClick={() => toggle(i)}
            style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0.875rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.3rem', transition: 'all 0.15s',
              background: checklist[i] ? 'rgba(14,165,233,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${checklist[i] ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.05)'}` }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${checklist[i] ? '#0ea5e9' : '#000d20'}`, borderRadius: '4px', flexShrink: 0, background: checklist[i] ? '#0ea5e9' : 'transparent', color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {checklist[i] ? '✓' : ''}
            </div>
            <div style={{ fontSize: '0.83rem', color: checklist[i] ? '#38bdf8' : '#1e4060' }}>{item}</div>
          </div>
        ))}
      </div>

      <div className="cn-nav">
        <button className="cn-btn" onClick={() => navigate('/course/cloud-native/lesson/iac')}>← 上一模块</button>
        <button className="cn-btn primary" onClick={() => navigate('/course/cloud-native/lesson/production')}>下一模块：生产实战 →</button>
      </div>
    </div>
  );
}
