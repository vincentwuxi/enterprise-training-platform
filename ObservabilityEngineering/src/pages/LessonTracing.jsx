import './LessonCommon.css';

const CODE = `# ━━━━ 分布式追踪 & Jaeger ━━━━

# ━━━━ 1. Trace / Span / Context 核心概念 ━━━━
# 
# Trace = 一个请求的完整生命周期
# Span  = Trace 中的一个操作单元
# 
# 一个 Trace 的 Span 树：
# ┌──────────────────────────────────────────────────────┐
# │ Trace ID: a1b2c3d4                                   │
# │                                                      │
# │ [0ms]   ┌─ api-gateway ──────────────────── [200ms]  │
# │ [2ms]   │  ├─ auth-service ────── [15ms]             │
# │ [3ms]   │  │  └─ redis.GET ── [1ms]                  │
# │ [18ms]  │  ├─ order-service ─────────── [165ms]      │
# │ [20ms]  │  │  ├─ postgres.SELECT ── [80ms] ← 慢！   │
# │ [102ms] │  │  ├─ payment-api ──── [55ms]             │
# │ [160ms] │  │  └─ kafka.produce ── [3ms]              │
# │ [185ms] │  └─ notification ── [10ms]                 │
# └──────────────────────────────────────────────────────┘
#
# 每个 Span 包含：
# - Trace ID:     全局唯一，整个链路共享
# - Span ID:      本 Span 唯一
# - Parent Span:  父 Span ID
# - Operation:    操作名（HTTP GET /api/orders）
# - Start/End:    开始/结束时间
# - Status:       OK / ERROR
# - Attributes:   自定义属性（user_id, order_id, sql.query）
# - Events:       时间点事件（exception, retry）

# ━━━━ 2. Context Propagation（上下文传播）━━━━
# 
# 如何跨服务串联 Span？→ 在 HTTP 头中传播 Trace Context
# 
# W3C Trace Context（标准）：
# traceparent: 00-a1b2c3d4e5f6-span789-01
#              ↑   ↑             ↑      ↑
#            ver  trace-id    span-id  flags
#
# 工作流程：
# 1. Service A 创建 Root Span (trace-id=abc, span-id=111)
# 2. 发 HTTP 请求到 Service B，自动注入 header：
#    traceparent: 00-abc-111-01
# 3. Service B 收到请求，提取 traceparent
# 4. 创建 Child Span (trace-id=abc, span-id=222, parent=111)
# 5. → 两个 Span 用同一个 trace-id 关联！

# ━━━━ 3. Jaeger 架构 ━━━━
# 
# ┌──────────┐    ┌───────────────┐    ┌──────────┐
# │  OTel    │───→│ Jaeger        │───→│ Storage  │
# │ Collector│    │ Collector     │    │(ES/Cassandra)
# └──────────┘    └───────────────┘    └──────────┘
#                        ↓
#                 ┌──────────────┐
#                 │  Jaeger UI   │
#                 │ (查询/分析)   │
#                 └──────────────┘
#
# Jaeger 部署方式：
# 1. All-in-one（开发/测试）：内存存储，单二进制
# 2. 生产架构：Collector + Elasticsearch + Query
# 3. 推荐：OTel Collector → Grafana Tempo（更轻量）

# ━━━━ 4. Trace 分析技巧 ━━━━
# 
# 1. 找瓶颈：按 duration 排序，看最长的 Span
#    → postgres.SELECT 80ms（占总时长 40%）→ 优化 SQL
# 
# 2. 对比 Trace：
#    正常请求 (200ms) vs 异常请求 (3000ms)
#    → 发现异常请求多了一个 retry → 连接池满了
# 
# 3. Service Map（服务拓扑）：
#    → 自动生成服务调用关系图
#    → 边上标注 QPS/错误率/延迟
#    → 哪条边是红色 = 哪个调用有问题
# 
# 4. Critical Path Analysis：
#    → 哪些 Span 在关键路径上（不可并行）
#    → 只优化关键路径的 Span 才能降低总延迟
#    → 并行 Span 不在关键路径上

# ━━━━ 5. 采样策略 ━━━━
# 
# 全量采集太贵！需要采样
# 
# Head-based Sampling（前端采样）：
#   - 请求到达时决定是否采集
#   - 优点：简单，减少 agent 开销
#   - 缺点：可能丢掉错误请求！
#   ratio: 0.1  → 采集 10% 的 Trace
# 
# Tail-based Sampling（尾部采样）：
#   - 请求结束后，根据结果决定是否保留
#   - 优点：100% 保留错误/慢请求
#   - 缺点：需要 Collector 缓存完整 Trace
# 
# OTel Collector 配置尾部采样：
# processors:
#   tail_sampling:
#     policies:
#       - name: error-policy
#         type: status_code
#         status_code: { status_codes: [ERROR] }
#       - name: slow-policy
#         type: latency
#         latency: { threshold_ms: 1000 }
#       - name: default
#         type: probabilistic
#         probabilistic: { sampling_percentage: 10 }`;

export default function LessonTracing() {
  return (
    <div className="obs-lesson">
      <div className="obs-hero">
        <div className="obs-badge"><span className="obs-pulse" style={{ background: '#8b5cf6' }} /> MODULE 05 · DISTRIBUTED TRACING</div>
        <h1>分布式追踪</h1>
        <p>微服务调用链看不见 = 排障靠猜——<strong>W3C Trace Context 跨服务串联 Span，Jaeger UI 可视化调用瀑布图，尾部采样 100% 捕获错误和慢请求</strong>。</p>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">🔗 分布式追踪</div>
        <div className="obs-code-wrap">
          <div className="obs-code-head">
            <div className="obs-code-dot" style={{ background: '#ef4444' }} /><div className="obs-code-dot" style={{ background: '#f59e0b' }} /><div className="obs-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>tracing.yaml</span>
          </div>
          <div className="obs-code">{CODE}</div>
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📊 采样策略对比</div>
        <div className="obs-grid-2">
          {[
            { name: 'Head-based', when: '请求到达时决定', pros: '简单/低开销', cons: '可能丢错误请求', rec: '开发/低流量', color: '#22c55e' },
            { name: 'Tail-based', when: '请求结束后决定', pros: '100% 保留错误', cons: '需缓存完整 Trace', rec: '⭐ 生产推荐', color: '#f97316' },
          ].map((s, i) => (
            <div key={i} className="obs-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontWeight: 800, color: s.color, fontSize: '1rem', marginBottom: '0.4rem' }}>{s.name} Sampling</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--obs-muted)', lineHeight: 1.8 }}>
                ⏱️ 时机：{s.when}<br/>
                ✅ {s.pros}<br/>
                ⚠️ {s.cons}<br/>
                <strong style={{ color: '#86efac' }}>🎯 {s.rec}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
