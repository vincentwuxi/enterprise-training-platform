import './LessonCommon.css';

const CODE = `# ━━━━ OpenTelemetry（OTel）━━━━
# 观测性的统一标准：一套 SDK → 多个后端

# ━━━━ 1. 为什么用 OTel？━━━━
# 之前：Prometheus(Metrics) + Jaeger(Traces) + ELK(Logs) → 3 套 SDK
# 现在：OpenTelemetry → 1 套 SDK 生成 Metrics + Traces + Logs
# 
# OTel = CNCF 第二活跃项目（仅次于 K8s）
# 所有主流语言都有官方 SDK

# ━━━━ 2. 核心架构 ━━━━
# ┌───────────────────────────────────────────────────┐
# │                  Application                       │
# │  ┌─────────────────────────────────────────────┐  │
# │  │      OTel SDK (自动/手动埋点)                 │  │
# │  │  Traces + Metrics + Logs → OTLP 协议         │  │
# │  └─────────────────────┬───────────────────────┘  │
# └────────────────────────┼──────────────────────────┘
#                          ↓ OTLP (gRPC/HTTP)
# ┌────────────────────────┴──────────────────────────┐
# │               OTel Collector                       │
# │  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
# │  │ Receivers │→ │Processors│→ │   Exporters    │   │
# │  │(接收数据) │  │(处理/过滤)│  │(发送到后端)    │   │
# │  └──────────┘  └──────────┘  └───────────────┘   │
# └───────────────────────────────────────────────────┘
#                     ↓              ↓            ↓
#               Prometheus      Jaeger/Tempo    Loki

# ━━━━ 3. Collector 配置 ━━━━
# otel-collector-config.yaml:
# receivers:
#   otlp:
#     protocols:
#       grpc:
#         endpoint: 0.0.0.0:4317
#       http:
#         endpoint: 0.0.0.0:4318
# 
# processors:
#   batch:
#     timeout: 5s
#     send_batch_size: 1024
#   memory_limiter:
#     check_interval: 1s
#     limit_mib: 512
#   attributes:
#     actions:
#       - key: environment
#         value: production
#         action: insert
# 
# exporters:
#   otlp:
#     endpoint: "tempo:4317"
#   prometheus:
#     endpoint: "0.0.0.0:8889"
#   loki:
#     endpoint: "http://loki:3100/loki/api/v1/push"
# 
# service:
#   pipelines:
#     traces:
#       receivers: [otlp]
#       processors: [memory_limiter, batch]
#       exporters: [otlp]
#     metrics:
#       receivers: [otlp]
#       processors: [memory_limiter, batch]
#       exporters: [prometheus]
#     logs:
#       receivers: [otlp]
#       processors: [memory_limiter, batch]
#       exporters: [loki]

# ━━━━ 4. SDK 埋点（Node.js 示例）━━━━
# npm install @opentelemetry/sdk-node
#            @opentelemetry/auto-instrumentations-node
#            @opentelemetry/exporter-trace-otlp-grpc
#
# // tracing.js（入口文件最前面引入）
# const { NodeSDK } = require('@opentelemetry/sdk-node');
# const { getNodeAutoInstrumentations } = require(
#   '@opentelemetry/auto-instrumentations-node'
# );
# const { OTLPTraceExporter } = require(
#   '@opentelemetry/exporter-trace-otlp-grpc'
# );
#
# const sdk = new NodeSDK({
#   serviceName: 'order-service',
#   traceExporter: new OTLPTraceExporter({
#     url: 'http://otel-collector:4317',
#   }),
#   instrumentations: [
#     getNodeAutoInstrumentations({
#       '@opentelemetry/instrumentation-http': { enabled: true },
#       '@opentelemetry/instrumentation-express': { enabled: true },
#       '@opentelemetry/instrumentation-pg': { enabled: true },
#       '@opentelemetry/instrumentation-redis': { enabled: true },
#     }),
#   ],
# });
# sdk.start();
#
# // 自动追踪：HTTP 请求/Express 路由/PG 查询/Redis 命令
# // 零代码修改！

# ━━━━ 5. 手动埋点 ━━━━
# const { trace } = require('@opentelemetry/api');
# const tracer = trace.getTracer('order-service');
#
# async function processOrder(orderId) {
#   return tracer.startActiveSpan('processOrder', async (span) => {
#     span.setAttribute('order.id', orderId);
#     try {
#       const result = await db.query('SELECT ...');
#       span.setAttribute('order.amount', result.amount);
#       span.setStatus({ code: SpanStatusCode.OK });
#       return result;
#     } catch (err) {
#       span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
#       span.recordException(err);
#       throw err;
#     } finally {
#       span.end();
#     }
#   });
# }

# ━━━━ 6. K8s 自动注入（零代码改造！）━━━━
# 通过 OTel Operator 自动注入 SDK
# apiVersion: opentelemetry.io/v1alpha1
# kind: Instrumentation
# metadata:
#   name: auto-instrumentation
# spec:
#   exporter:
#     endpoint: http://otel-collector:4317
#   propagators:
#     - tracecontext
#     - baggage
#   nodejs:
#     image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:latest
#
# 然后给 Pod 加注解：
# metadata:
#   annotations:
#     instrumentation.opentelemetry.io/inject-nodejs: "true"
# → 自动注入 OTel SDK，不改任何代码！`;

export default function LessonOTel() {
  return (
    <div className="obs-lesson">
      <div className="obs-hero">
        <div className="obs-badge"><span className="obs-pulse" style={{ background: '#3b82f6' }} /> MODULE 04 · OPENTELEMETRY</div>
        <h1>OpenTelemetry</h1>
        <p>观测性的统一标准——<strong>一套 SDK 生成 Metrics+Traces+Logs，Collector 路由到任意后端，K8s Operator 自动注入实现零代码改造</strong>。</p>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">🔗 OpenTelemetry 全景</div>
        <div className="obs-code-wrap">
          <div className="obs-code-head">
            <div className="obs-code-dot" style={{ background: '#ef4444' }} /><div className="obs-code-dot" style={{ background: '#f59e0b' }} /><div className="obs-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>otel-collector-config.yaml</span>
          </div>
          <div className="obs-code">{CODE}</div>
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📐 Collector Pipeline</div>
        <div className="obs-grid-3">
          {[
            { name: 'Receivers', desc: '接收 OTLP/Prometheus/Jaeger 数据', icon: '📥', color: '#22c55e' },
            { name: 'Processors', desc: '批处理/内存限制/属性注入/采样', icon: '⚙️', color: '#f97316' },
            { name: 'Exporters', desc: '发送到 Prometheus/Jaeger/Loki', icon: '📤', color: '#3b82f6' },
          ].map((c, i) => (
            <div key={i} className="obs-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--obs-muted)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div className="obs-tip">💡 <strong>零代码改造路径</strong>：K8s OTel Operator + Pod 注解 → 自动注入 SDK → HTTP/DB/Redis 全自动追踪。最快 5 分钟让整个集群可观测。</div>
      </div>
    </div>
  );
}
