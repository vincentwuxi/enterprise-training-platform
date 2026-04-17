import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'metrics', title: '核心指标', icon: '📏' },
  { id: 'observability', title: '可观测性', icon: '🔭' },
  { id: 'canary', title: '灰度发布', icon: '🐤' },
  { id: 'resilience', title: '容灾与高可用', icon: '🛡️' },
];

export default function LessonProductionMonitoring() {
  const [active, setActive] = useState(sections[0].id);
  return (
    <div className="lesson-page">
      <div className="lesson-tabs">
        {sections.map(s => (
          <button key={s.id} className={`lesson-tab ${active === s.id ? 'active' : ''}`} onClick={() => setActive(s.id)}>
            <span className="tab-icon">{s.icon}</span>{s.title}
          </button>
        ))}
      </div>
      <div className="lesson-content">
        {active === 'metrics' && <MetricsSection />}
        {active === 'observability' && <ObservabilitySection />}
        {active === 'canary' && <CanarySection />}
        {active === 'resilience' && <ResilienceSection />}
      </div>
    </div>
  );
}

function MetricsSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📏</span>推理核心指标体系</h2>
      <p className="section-desc">定义清晰的指标体系是监控的基础。LLM 推理的指标与传统 Web 服务有显著区别。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>LLM 推理黄金指标</h3>
          <div className="code-block">
{`LLM 推理指标层次:

┌─ 用户体验层 (SLA) ─────────────────┐
│ TTFT (Time To First Token)          │
│   首 token 延迟 — 用户感知"响应速度" │
│   目标: P50 < 500ms, P99 < 2s      │
│                                      │
│ TPOT (Time Per Output Token)        │
│   每 token 生成间隔 — 流式阅读体验   │
│   目标: < 50ms (20 t/s)             │
│                                      │
│ E2E Latency                         │
│   端到端延迟 — 包含网络+排队+推理     │
│   目标: 因任务而异                   │
└──────────────────────────────────────┘

┌─ 系统效率层 (运维) ─────────────────┐
│ Throughput (tokens/s)               │
│   系统总吞吐 — 决定成本              │
│                                      │
│ Request Rate (QPS)                  │
│   请求到达速率                       │
│                                      │
│ Queue Depth                         │
│   排队请求数 — 容量预警              │
│                                      │
│ GPU Utilization                     │
│   SM 利用率 + 显存利用率             │
│                                      │
│ KV Cache Usage                      │
│   KV Cache 占用率 — 接近 100% 需扩容│
└──────────────────────────────────────┘

┌─ 质量层 (业务) ─────────────────────┐
│ Error Rate                          │
│   OOM / Timeout / 5xx 错误率        │
│                                      │
│ Token Budget Utilization            │
│   实际输出 vs max_tokens 的比例      │
│                                      │
│ Cost per Request                    │
│   单次请求的 GPU 计算成本            │
└──────────────────────────────────────┘`}
          </div>
        </div>

        <div className="info-card">
          <h3>SLA 定义模板</h3>
          <table className="data-table">
            <thead>
              <tr><th>指标</th><th>实时对话</th><th>批量处理</th><th>Agent 调用</th></tr>
            </thead>
            <tbody>
              <tr><td>TTFT P50</td><td>&lt;300ms</td><td>&lt;5s</td><td>&lt;1s</td></tr>
              <tr><td>TTFT P99</td><td>&lt;1s</td><td>&lt;30s</td><td>&lt;3s</td></tr>
              <tr><td>TPOT P50</td><td>&lt;40ms</td><td>不关注</td><td>&lt;60ms</td></tr>
              <tr><td>可用性</td><td>99.9%</td><td>99.5%</td><td>99.9%</td></tr>
              <tr><td>错误率</td><td>&lt;0.1%</td><td>&lt;1%</td><td>&lt;0.5%</td></tr>
              <tr><td>吞吐目标</td><td>持续</td><td>峰值</td><td>持续</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ObservabilitySection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔭</span>可观测性建设</h2>
      <p className="section-desc">推理系统的可观测性需要覆盖 <strong>Metrics (指标)、Logs (日志)、Traces (链路追踪)</strong> 三大支柱。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Prometheus + Grafana 监控</h3>
          <div className="code-block">
{`# vLLM 内置 Prometheus 指标
# 访问: http://vllm-server:8000/metrics

# 关键指标:
vllm:num_requests_running        # 在飞请求数
vllm:num_requests_waiting        # 排队请求数
vllm:gpu_cache_usage_perc        # KV Cache 使用率
vllm:avg_generation_throughput   # 平均吞吐
vllm:e2e_request_latency_seconds # E2E 延迟分布
vllm:time_to_first_token_seconds # TTFT 分布

# Grafana Dashboard 关键面板:
┌─────────────────────────────────────┐
│ [实时吞吐] tokens/s 时序图           │
│ [TTFT 分位] P50/P90/P99 分位数图     │
│ [GPU 利用率] 每 GPU 的 SM% 热力图    │
│ [KV Cache] 使用率仪表盘 + 阈值告警   │
│ [队列深度] 请求排队数趋势图          │
│ [错误率] 5xx/OOM/Timeout 饼图       │
│ [成本] 每百万 token 成本趋势        │
└─────────────────────────────────────┘

# 告警规则 (AlertManager)
- alert: HighQueueDepth
  expr: vllm_num_requests_waiting > 100
  for: 2m
  labels:
    severity: warning
    
- alert: KVCacheNearFull
  expr: vllm_gpu_cache_usage_perc > 0.95
  for: 1m
  labels:
    severity: critical`}
          </div>
        </div>

        <div className="info-card">
          <h3>分布式链路追踪</h3>
          <div className="code-block">
{`# OpenTelemetry 集成

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

tracer = trace.get_tracer("inference-service")

async def handle_request(request):
    with tracer.start_as_current_span("llm_request") as span:
        span.set_attribute("model", "llama-3-70b")
        span.set_attribute("input_tokens", len(request.tokens))
        
        # 1. 排队等待
        with tracer.start_span("queue_wait"):
            position = await scheduler.enqueue(request)
        
        # 2. Prefill
        with tracer.start_span("prefill") as pf:
            kv_cache = await engine.prefill(request)
            pf.set_attribute("prefill_time_ms", elapsed)
        
        # 3. Decode
        with tracer.start_span("decode") as dc:
            output = await engine.decode(kv_cache)
            dc.set_attribute("output_tokens", len(output))
            dc.set_attribute("tpot_ms", avg_tpot)
        
        span.set_attribute("total_tokens", total)
        span.set_attribute("cost_usd", calculate_cost(total))

# Jaeger / Tempo 可视化:
# 每个请求的完整生命周期追踪
# 定位: 延迟是在排队?Prefill?Decode?`}
          </div>
        </div>
      </div>
    </section>
  );
}

function CanarySection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🐤</span>灰度发布与 A/B 测试</h2>
      <p className="section-desc">模型更新 (新版本 / 新量化 / 新引擎) 存在风险。<strong>灰度发布</strong> 确保变更不影响线上服务质量。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>模型灰度发布流程</h3>
          <div className="code-block">
{`模型更新灰度策略:

Phase 1: Shadow (影子模式) — 0% 流量
┌──────────────────────────────────┐
│  所有请求 → 旧模型 (返回结果)     │
│  同时复制 → 新模型 (只记录,不返回)│
│  对比: 延迟 / 输出质量 / 错误率   │
│  持续: 24h                        │
└──────────────────────────────────┘

Phase 2: Canary — 5% 流量
┌──────────────────────────────────┐
│  95% 请求 → 旧模型               │
│  5% 请求  → 新模型               │
│  监控: TTFT / TPOT / 错误率      │
│  自动回滚: 如果 P99 劣化 > 20%   │
│  持续: 2h                        │
└──────────────────────────────────┘

Phase 3: Gradual Rollout
  5% → 25% → 50% → 100%
  每阶段观察 30min
  任何异常 → 自动回滚到上一阶段

Phase 4: Full Rollout + Bake
  100% 流量 → 新模型
  旧模型保留 24h 作为回滚目标`}
          </div>
        </div>

        <div className="info-card">
          <h3>Istio / Envoy 流量分割</h3>
          <div className="code-block">
{`# Istio VirtualService 灰度配置
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: llm-inference
spec:
  hosts: ["llm.internal.com"]
  http:
  - match:
    - headers:
        x-canary:
          exact: "true"    # 显式路由
    route:
    - destination:
        host: llm-canary
        port: 8000
        
  - route:
    - destination:
        host: llm-stable
        port: 8000
      weight: 95             # 95% → 旧版
    - destination:
        host: llm-canary
        port: 8000
      weight: 5              # 5% → 新版

# Argo Rollouts 自动灰度:
# 基于实时指标自动推进/回滚
# 指标: Prometheus 的 TTFT P99`}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResilienceSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🛡️</span>容灾与高可用</h2>
      <p className="section-desc">推理服务是业务关键路径。需要设计 <strong>多层容错</strong> 确保 99.9%+ 可用性。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>高可用架构</h3>
          <div className="code-block">
{`多层容灾设计:

L1: 进程级 — 自动重启
  ├── OOM → 自动降低 batch size 重启
  ├── CUDA Error → 重新初始化 GPU
  └── K8s liveness probe → 自动重启 Pod

L2: 节点级 — 多副本
  ├── 最少 2 个推理副本 (Active-Active)
  ├── 健康检查: /health → Ready 才接流量
  └── Pod Anti-Affinity → 分散到不同节点

L3: 集群级 — 跨 AZ
  ├── 推理 Pod 分布在多个 AZ
  ├── NLB 自动摘除故障 AZ
  └── KV Cache 不跨 AZ (延迟)

L4: 区域级 — 多 Region
  ├── Primary (us-east-1) + DR (us-west-2)
  ├── DNS Failover: Route53 健康检查
  └── RTO < 5min, RPO = 0 (无状态推理)

L5: 降级策略
  ├── GPU 全挂 → 回退到小模型 (CPU)
  ├── 模型超时 → 返回缓存/模板回复
  └── 全面故障 → 转发到备用 API (OpenAI)`}
          </div>
        </div>

        <div className="info-card">
          <h3>推理服务 SRE 实践</h3>
          <div className="code-block">
{`# 1. 优雅关停 (Graceful Shutdown)
async def shutdown():
    # 停止接受新请求
    server.stop_accepting()
    # 等待当前请求完成 (最多 30s)
    await engine.wait_for_completion(timeout=30)
    # 清理 GPU 内存
    engine.cleanup()

# 2. 熔断 (Circuit Breaker)
from circuitbreaker import circuit

@circuit(
    failure_threshold=5,
    recovery_timeout=60,
    expected_exception=GPUError
)
async def inference(request):
    return await engine.generate(request)

# 3. 限流 (Rate Limiting)
# 按用户/team 做令牌桶限流
# 防止单个用户耗尽所有 GPU 资源
rate_limiter = TokenBucketLimiter(
    capacity=100,        # 桶容量
    fill_rate=10,        # 10 req/s
    per_key="user_id"
)

# 4. 混沌工程 (Chaos Testing)
# 定期注入故障验证容灾能力:
# - 随机杀 1 个推理 Pod
# - 模拟 GPU OOM
# - 模拟网络延迟 500ms
# - 模拟 Spot 实例回收`}
          </div>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 生产检查清单</h4>
        <ul>
          <li>✅ <strong>多副本</strong> — 至少 2 个推理 Pod，跨 AZ 部署</li>
          <li>✅ <strong>健康检查</strong> — liveness (进程存活) + readiness (GPU 就绪)</li>
          <li>✅ <strong>优雅关停</strong> — SIGTERM → 完成当前请求 → 退出</li>
          <li>✅ <strong>监控告警</strong> — TTFT/TPOT/错误率/队列深度 四维告警</li>
          <li>✅ <strong>回滚方案</strong> — 保留上一版本模型，1 分钟内可回滚</li>
          <li>✅ <strong>降级预案</strong> — GPU 不可用时的回退策略文档化</li>
        </ul>
      </div>
    </section>
  );
}
