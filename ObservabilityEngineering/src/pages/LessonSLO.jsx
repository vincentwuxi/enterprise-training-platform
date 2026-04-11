import './LessonCommon.css';

const CODE = `# ━━━━ SLO / SLI / Error Budget — Google SRE 方法论 ━━━━

# ━━━━ 1. 核心概念 ━━━━
# SLI (Service Level Indicator) = 测量什么
#   → "过去 28 天成功请求占比"
#   → "过去 28 天 P99 延迟 < 300ms 的请求占比"
# 
# SLO (Service Level Objective) = 目标是多少
#   → "可用性 SLO = 99.9%（三个 9）"
#   → "延迟 SLO = 95% 请求 < 300ms"
# 
# SLA (Service Level Agreement) = 合同承诺
#   → "如果低于 99.9%，赔偿客户 10% 费用"
#   → SLA < SLO（留有余量）
# 
# Error Budget = 允许犯多少错
#   → 99.9% SLO = 0.1% Error Budget
#   → 30 天内允许 43 分钟不可用

# ━━━━ 2. SLI 定义 ━━━━
# 
# 可用性 SLI（最基础）：
# 成功请求数 / 总请求数
# 
# PromQL:
sum(rate(http_requests_total{status!~"5.."}[28d]))
/
sum(rate(http_requests_total[28d]))
# → 0.9987 = 99.87% 可用性

# 延迟 SLI：
# P99 < 300ms 的请求占比
sum(rate(http_request_duration_seconds_bucket{le="0.3"}[28d]))
/
sum(rate(http_request_duration_seconds_count[28d]))

# ━━━━ 3. Error Budget 计算 ━━━━
# 
# SLO = 99.9%
# 滚动窗口 = 28 天
# 
# Error Budget (总量) = (1 - SLO) × 总请求 = 0.1% × 总请求
# Error Budget (剩余) = Error Budget(总) - 实际错误数
# Error Budget (消耗%) = 实际错误数 / Error Budget(总)
# 
# 例：28 天内 1000 万请求，SLO 99.9%
# Error Budget = 0.001 × 10,000,000 = 10,000 个错误
# 已发生 3,000 个错误 → 消耗 30% → 安全
# 已发生 8,000 个错误 → 消耗 80% → 危险！
# 已发生 12,000 个错误 → 消耗 120% → 已违反 SLO！

# ━━━━ 4. Error Budget 策略 ━━━━
# 
# Error Budget 剩余多 → 可以冒险：
#   ✅ 发布新功能
#   ✅ 做破坏性实验（Chaos Engineering）
#   ✅ 做大规模迁移
# 
# Error Budget 快用完 → 保守操作：
#   🛑 冻结功能发布
#   🛑 只发 Bug Fix 和可靠性改进
#   🛑 强制代码审查 + Canary 发布
# 
# 这就是 SRE 与产品团队的"谈判工具"！
# 不再是"运维不让发版" vs "产品要赶工"
# 而是："Error Budget 还剩 20%，这次发版风险你承担"

# ━━━━ 5. Burn Rate Alert（燃烧速率告警）━━━━
# 
# 传统告警：error_rate > 0.1%  ← 太灵敏，抖动就告警
# Burn Rate：Error Budget 消耗速度
# 
# Burn Rate = 实际错误率 / (1 - SLO)
# 
# 如果 SLO = 99.9%，当前错误率 = 1%：
# Burn Rate = 0.01 / 0.001 = 10
# → 以 10 倍速度消耗 Error Budget！
# → 28 天 Error Budget 将在 2.8 天内用完
# 
# Google SRE 推荐的多窗口告警：
# ┌────────────────────────────────────────────┐
# │ Burn Rate │ 长窗口  │ 短窗口 │ 响应级别    │
# ├───────────┼────────┼────────┼────────────┤
# │ 14.4x     │ 1h     │ 5m    │ Page(电话)  │
# │ 6x        │ 6h     │ 30m   │ Page(电话)  │
# │ 3x        │ 1d     │ 2h    │ Ticket      │
# │ 1x        │ 3d     │ 6h    │ Low         │
# └────────────────────────────────────────────┘
# 
# PromQL 实现：
# Burn Rate 14.4x, 1h 窗口：
  (
    sum(rate(http_requests_total{status=~"5.."}[1h]))
    / sum(rate(http_requests_total[1h]))
  ) > (14.4 * 0.001)
  and
  (
    sum(rate(http_requests_total{status=~"5.."}[5m]))
    / sum(rate(http_requests_total[5m]))
  ) > (14.4 * 0.001)

# ━━━━ 6. SLO Dashboard ━━━━
# Grafana Dashboard 布局：
# ┌─────────────────────────────────────────────┐
# │  [99.92%]      [73% remaining]     [2.1d]   │
# │  当前可用性     Error Budget 剩余   预计耗尽  │
# ├─────────────────────────────────────────────┤
# │  SLI 趋势图（过去 28 天）                     │
# │  -------- 99.9% SLO 线 --------             │
# │  ~~~~~~~~ 实际可用性 ~~~~~~~~~~~              │
# ├─────────────────────────────────────────────┤
# │  Error Budget 消耗图                         │
# │  ▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒░░░░░░░░░░░░░░           │
# │  0%         27%                   100%      │
# └─────────────────────────────────────────────┘`;

export default function LessonSLO() {
  return (
    <div className="obs-lesson">
      <div className="obs-hero">
        <div className="obs-badge"><span className="obs-pulse" style={{ background: '#fbbf24' }} /> MODULE 07 · SLO / SLI / ERROR BUDGET</div>
        <h1>SLO 可靠性工程</h1>
        <p>Google SRE 的核心方法论——<strong>SLI 测量用户体验，SLO 设定可靠性目标，Error Budget 量化"允许犯多少错"，Burn Rate Alert 比传统告警更智能</strong>。</p>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">🎯 SLO 工程</div>
        <div className="obs-code-wrap">
          <div className="obs-code-head">
            <div className="obs-code-dot" style={{ background: '#ef4444' }} /><div className="obs-code-dot" style={{ background: '#f59e0b' }} /><div className="obs-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>slo.yaml</span>
          </div>
          <div className="obs-code">{CODE}</div>
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📊 可用性等级</div>
        <div className="obs-card" style={{ overflowX: 'auto' }}>
          <table className="obs-table">
            <thead><tr><th>SLO</th><th>Error Budget/月</th><th>停机时间/月</th><th>场景</th></tr></thead>
            <tbody>
              {[
                ['99%', '1%', '7.3 小时', '内部工具'],
                ['99.9%', '0.1%', '43 分钟', '大多数 SaaS'],
                ['99.95%', '0.05%', '22 分钟', '支付/金融'],
                ['99.99%', '0.01%', '4.3 分钟', '基础设施'],
              ].map(([slo, eb, down, sc], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#86efac', fontFamily: 'JetBrains Mono,monospace' }}>{slo}</td>
                  <td>{eb}</td>
                  <td style={{ color: i >= 2 ? '#ef4444' : 'var(--obs-muted)' }}>{down}</td>
                  <td style={{ color: 'var(--obs-muted)' }}>{sc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
