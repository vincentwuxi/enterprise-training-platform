import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 分布式追踪可视化（Jaeger/Zipkin 风格）
const SPANS = [
  { name: 'HTTP POST /checkout',    start: 0,   dur: 892, service: 'api-gateway',   color: '#3b82f6' },
  { name: 'auth.validate_token',    start: 5,   dur: 12,  service: 'auth-service',   color: '#8b5cf6' },
  { name: 'order.create',           start: 20,  dur: 820, service: 'order-service',  color: '#f97316' },
  { name: 'inventory.check',        start: 25,  dur: 45,  service: 'inventory-svc',  color: '#22c55e' },
  { name: 'db.query (SELECT)',       start: 30,  dur: 35,  service: 'postgres',        color: '#fbbf24' },
  { name: 'payment.charge',         start: 75,  dur: 680, service: 'payment-svc',    color: '#ef4444' },
  { name: 'stripe.api.charge',      start: 80,  dur: 670, service: 'stripe (ext)',   color: '#dc2626' },
  { name: 'notification.send_email',start: 760, dur: 50,  service: 'notify-svc',     color: '#10b981' },
];

function TraceViewer() {
  const [selected, setSelected] = useState(null);
  const totalDur = 892;

  return (
    <div className="po-interactive">
      <h3>🔭 分布式追踪 Gantt 图（Jaeger 风格，点击 Span 查看详情）
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>Total: {totalDur}ms</span>
      </h3>

      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem' }}>
        {/* 时间轴 */}
        <div style={{ display: 'flex', marginLeft: 160, marginBottom: '0.25rem' }}>
          {[0, 25, 50, 75, 100].map(p => (
            <div key={p} style={{ flex: p === 0 ? 0 : 25, fontSize: '0.55rem', color: '#334155', textAlign: 'right' }}>
              {Math.round(totalDur * p / 100)}ms
            </div>
          ))}
        </div>

        {SPANS.map((span, i) => {
          const left = (span.start / totalDur) * 100;
          const width = (span.dur / totalDur) * 100;
          const isSlow = span.dur > 200;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '2px', cursor: 'pointer' }}
              onClick={() => setSelected(selected === i ? null : i)}>
              <div style={{ width: 155, textAlign: 'right', paddingRight: '0.5rem', fontSize: '0.62rem',
                color: selected === i ? span.color : '#64748b', fontWeight: selected === i ? 700 : 400, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {span.name}
              </div>
              <div style={{ flex: 1, position: 'relative', height: 18 }}>
                <div style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%', borderRadius: '3px', minWidth: 4, transition: 'all 0.2s',
                  background: selected === i ? span.color : `${span.color}70`,
                  border: `1px solid ${selected === i ? span.color : span.color + '40'}`,
                  boxShadow: isSlow ? `0 0 6px ${span.color}50` : 'none' }}>
                  {width > 8 && <span style={{ position: 'absolute', left: '0.25rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.55rem', color: '#fff', whiteSpace: 'nowrap' }}>{span.dur}ms</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected !== null && (
        <div style={{ marginTop: '0.625rem', padding: '0.5rem 0.75rem', background: `${SPANS[selected].color}08`, border: `1px solid ${SPANS[selected].color}25`, borderRadius: '7px', fontSize: '0.75rem' }}>
          <div style={{ fontWeight: 800, color: SPANS[selected].color }}>{SPANS[selected].name}</div>
          <div style={{ color: '#64748b', marginTop: '0.2rem' }}>
            Service: <span style={{ color: SPANS[selected].color }}>{SPANS[selected].service}</span> ·
            Duration: <strong style={{ color: SPANS[selected].dur > 200 ? '#ef4444' : '#22c55e' }}>{SPANS[selected].dur}ms</strong> ·
            Start: {SPANS[selected].start}ms
          </div>
          {SPANS[selected].dur > 200 && (
            <div style={{ color: '#fbbf24', fontSize: '0.68rem', marginTop: '0.2rem' }}>
              ⚠️ 慢 Span！{SPANS[selected].name.includes('stripe') ? '外部 API 调用：检查是否可并行，或增加超时熔断' : '检查是否可缓存或减少调用次数'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const APM_CODE = `# OpenTelemetry + Prometheus + Grafana 全链路可观测性

# ── 1. OpenTelemetry 自动埋点（FastAPI）──
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

# 初始化 Tracer（发送到 Jaeger/Tempo）
provider = TracerProvider(resource=Resource({SERVICE_NAME: "order-service"}))
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(
    endpoint="http://jaeger:4317"  # gRPC 端口
)))
trace.set_tracer_provider(provider)

# 自动为所有 FastAPI 路由创建 Span
FastAPIInstrumentor.instrument_app(app)
SQLAlchemyInstrumentor().instrument(engine=engine)

# ── 2. 手动埋点（自定义 Span）──
tracer = trace.get_tracer(__name__)

async def process_order(order_id: str):
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)
        span.set_attribute("order.amount", 99.99)
        
        try:
            with tracer.start_as_current_span("validate_inventory"):
                await check_inventory(order_id)
            
            with tracer.start_as_current_span("payment.charge") as pay_span:
                pay_span.set_attribute("payment.gateway", "stripe")
                result = await charge_payment(order_id)
                pay_span.set_attribute("payment.status", result.status)
        except Exception as e:
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, str(e)))
            raise

# ── 3. Prometheus 指标采集 ──
from prometheus_client import Counter, Histogram, Gauge, start_http_server

request_total = Counter('http_requests_total', 'Total requests',
    ['method', 'endpoint', 'status_code'])

request_duration = Histogram('http_request_duration_seconds',
    'Request duration in seconds',
    ['endpoint'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0])

active_connections = Gauge('active_connections', 'Active DB connections')

@app.middleware("http")
async def metrics_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    request_total.labels(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code
    ).inc()
    
    request_duration.labels(endpoint=request.url.path).observe(duration)
    return response

# ── 4. Grafana Dashboard 关键 PromQL ──
# 请求速率（RPS）：
# rate(http_requests_total{status_code="200"}[1m])

# P99 延迟：
# histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# 错误率：
# rate(http_requests_total{status_code=~"5.."}[1m]) /
# rate(http_requests_total[1m]) * 100

# DB 连接池使用率：
# active_connections / db_pool_max_size * 100`;

export default function LessonAPM() {
  const navigate = useNavigate();

  return (
    <div className="lesson-po">
      <div className="po-badge purple">🔭 module_06 — APM & 可观测性</div>
      <div className="po-hero">
        <h1>APM & 可观测性：OpenTelemetry / Jaeger / Prometheus / Grafana</h1>
        <p>可观测性的三大支柱：<strong>Metrics（指标）</strong>告诉你"出了什么问题"，<strong>Traces（追踪）</strong>告诉你"在哪里出的问题"，<strong>Logs（日志）</strong>告诉你"具体发生了什么"。OpenTelemetry 是统一所有三者的开放标准。</p>
      </div>

      <TraceViewer />

      <div className="po-section">
        <h2 className="po-section-title">📡 OpenTelemetry + Prometheus + Grafana 实战</h2>
        <div className="po-code-wrap">
          <div className="po-code-head"><div className="po-code-dot" style={{ background: '#ef4444' }}/><div className="po-code-dot" style={{ background: '#f97316' }}/><div className="po-code-dot" style={{ background: '#8b5cf6' }}/><span style={{ color: '#a78bfa', marginLeft: '0.5rem' }}>🔭 otel-prometheus.py</span></div>
          <div className="po-code" style={{ maxHeight: 420, overflowY: 'auto' }}>{APM_CODE}</div>
        </div>
      </div>

      <div className="po-section">
        <h2 className="po-section-title">🏗️ 可观测性工具生态</h2>
        <div className="po-grid-3">
          {[
            { cat: 'Metrics 指标', icon: '📊', color: '#f97316', tools: ['Prometheus（采集+存储）', 'Grafana（可视化）', 'VictoriaMetrics（高性能）', 'Datadog / New Relic（SaaS）'] },
            { cat: 'Traces 追踪', icon: '🔭', color: '#8b5cf6', tools: ['Jaeger（开源追踪系统）', 'Zipkin（Twitter开源）', 'Tempo（Grafana栈）', 'Dynatrace（AI驱动）'] },
            { cat: 'Logs 日志', icon: '📜', color: '#3b82f6', tools: ['Loki（Grafana栈）', 'Elasticsearch + Kibana', 'ClickHouse（超高速）', 'Splunk（企业级）'] },
          ].map(c => (
            <div key={c.cat} className="po-card" style={{ borderColor: `${c.color}18` }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 800, color: c.color, fontSize: '0.85rem', marginBottom: '0.4rem' }}>{c.cat}</div>
              {c.tools.map(t => <div key={t} style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.18rem' }}>▸ {t}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="po-nav">
        <button className="po-btn" onClick={() => navigate('/course/perf-optimization/lesson/database')}>← 上一模块</button>
        <button className="po-btn primary" onClick={() => navigate('/course/perf-optimization/lesson/memory')}>下一模块：内存优化 →</button>
      </div>
    </div>
  );
}
