import './LessonCommon.css';

const CODE = `# ━━━━ 可观测性三大支柱 ━━━━

# ━━━━ 1. 监控 vs 可观测性 ━━━━
# 
# 监控（Monitoring）：         可观测性（Observability）：
# "服务器 CPU 超过 80%"        "为什么这个请求用了 3 秒？"
# "数据库连接数满了"            "哪个微服务调用链路出了问题？"
# 已知问题 → 预定义告警          未知问题 → 事后探索
#
# 可观测性 = 通过系统的外部输出，理解系统内部状态
# 三大支柱：Metrics + Logs + Traces

# ━━━━ 2. Metrics（指标）━━━━
# 数值型时序数据，用于趋势和告警
#
# 四种核心指标类型（Prometheus）：
# ┌──────────────────────────────────────────────────┐
# │ Counter   │ 只增不减 │ 请求总数/错误总数/字节数      │
# │ Gauge     │ 可增可减 │ CPU使用率/内存/连接数/队列长度 │
# │ Histogram │ 分布桶   │ 请求延迟(p50/p95/p99)/大小   │
# │ Summary   │ 分位数   │ 类似Histogram但客户端计算     │
# └──────────────────────────────────────────────────┘
#
# RED 方法（微服务指标黄金法则）：
# Rate:    每秒请求数 (QPS)
# Errors:  每秒错误数 / 错误率
# Duration: 请求延迟 (p50/p95/p99)
#
# USE 方法（基础设施指标）：
# Utilization: 使用率 (CPU 80%)
# Saturation:  饱和度 (队列长度)
# Errors:      错误数 (磁盘IO错误)

# ━━━━ 3. Logs（日志）━━━━
# 离散事件记录，用于调试和审计
#
# 结构化日志（JSON，推荐）：
# {"timestamp":"2024-03-15T10:30:00Z",
#  "level":"ERROR",
#  "service":"order-service",
#  "trace_id":"abc123",           ← 关联到 Trace！
#  "user_id":"user_456",
#  "message":"Payment failed",
#  "error":"insufficient_funds",
#  "duration_ms": 245}
#
# vs 非结构化日志（难以搜索）：
# [ERROR] 2024-03-15 10:30:00 Payment failed for user 456
#
# 日志级别：
# DEBUG → INFO → WARN → ERROR → FATAL
#              ↑ 生产环境最低级别
#
# 日志管道：应用 → Fluentd/Vector → Loki/Elasticsearch → Grafana

# ━━━━ 4. Traces（链路追踪）━━━━
# 请求在分布式系统中的完整路径
#
# 一个 Trace = 多个 Span：
# ┌─────────────────────────────────────────────────────┐
# │ Trace ID: abc-123                                   │
# │                                                     │
# │ ├── Span: API Gateway (2ms)                         │
# │ │   ├── Span: Auth Service (5ms)                    │
# │ │   │   └── Span: Redis Cache (1ms)                 │
# │ │   ├── Span: Order Service (150ms)    ← 瓶颈!      │
# │ │   │   ├── Span: PostgreSQL (80ms)    ← 慢查询!    │
# │ │   │   └── Span: Payment API (65ms)                │
# │ │   └── Span: Notification (3ms)                    │
# │ └── Total: 160ms                                    │
# └─────────────────────────────────────────────────────┘
#
# W3C Trace Context（标准头）：
# traceparent: 00-abc123-span456-01
# → 在 HTTP 头中传播，跨服务串联

# ━━━━ 5. 三大支柱的关联 ━━━━
# 
# Metric 告警 → "p99 延迟 > 1s"
#     ↓ 点击 Exemplar
# Trace 定位 → "是 order-service → PostgreSQL 这段慢"
#     ↓ 按 trace_id 搜索
# Log 细节 → "SQL: SELECT * FROM orders（全表扫描）"
#
# 这就是 Metrics → Traces → Logs 的黄金调试路径！
# Grafana 的强大在于：三者在同一个界面无缝切换`;

export default function LessonPillars() {
  return (
    <div className="obs-lesson">
      <div className="obs-hero">
        <div className="obs-badge"><span className="obs-pulse" style={{ background: '#22c55e' }} /> MODULE 01 · THREE PILLARS</div>
        <h1>可观测性三大支柱</h1>
        <p>监控告诉你"什么坏了"，可观测性告诉你"为什么坏了"——<strong>Metrics 追踪趋势、Logs 记录细节、Traces 串联链路，三者关联才是完整的可观测性</strong>。</p>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📡 三大支柱</div>
        <div className="obs-code-wrap">
          <div className="obs-code-head">
            <div className="obs-code-dot" style={{ background: '#ef4444' }} /><div className="obs-code-dot" style={{ background: '#f59e0b' }} /><div className="obs-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>pillars.yaml</span>
          </div>
          <div className="obs-code">{CODE}</div>
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">🏗️ 三大支柱对比</div>
        <div className="obs-grid-3">
          {[
            { name: 'Metrics', icon: '📊', what: '数值型时序数据', when: '趋势 + 告警', tool: 'Prometheus', color: '#22c55e' },
            { name: 'Logs', icon: '📝', what: '离散事件记录', when: '调试 + 审计', tool: 'Loki / ELK', color: '#f97316' },
            { name: 'Traces', icon: '🔗', what: '分布式调用链', when: '瓶颈定位', tool: 'Jaeger / Tempo', color: '#3b82f6' },
          ].map((p, i) => (
            <div key={i} className="obs-card" style={{ borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 800, color: p.color, fontSize: '1rem', marginBottom: '0.3rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--obs-muted)', lineHeight: 1.8 }}>
                {p.what}<br/>🎯 {p.when}<br/>🔧 {p.tool}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">🎯 指标方法论</div>
        <div className="obs-grid-2">
          <div className="obs-card" style={{ borderLeft: '3px solid #22c55e' }}>
            <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: '0.4rem' }}>RED 方法（微服务）</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--obs-muted)', lineHeight: 1.8 }}>
              <strong style={{ color: '#86efac' }}>R</strong>ate — 每秒请求数 (QPS)<br/>
              <strong style={{ color: '#86efac' }}>E</strong>rrors — 错误率<br/>
              <strong style={{ color: '#86efac' }}>D</strong>uration — 延迟 (p50/p95/p99)
            </div>
          </div>
          <div className="obs-card" style={{ borderLeft: '3px solid #f97316' }}>
            <div style={{ fontWeight: 700, color: '#f97316', marginBottom: '0.4rem' }}>USE 方法（基础设施）</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--obs-muted)', lineHeight: 1.8 }}>
              <strong style={{ color: '#fed7aa' }}>U</strong>tilization — 使用率<br/>
              <strong style={{ color: '#fed7aa' }}>S</strong>aturation — 饱和度<br/>
              <strong style={{ color: '#fed7aa' }}>E</strong>rrors — 错误数
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
