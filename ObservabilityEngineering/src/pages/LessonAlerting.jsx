import './LessonCommon.css';

const CODE = `# ━━━━ 告警工程 ━━━━

# ━━━━ 1. Alertmanager 架构 ━━━━
# Prometheus Alerting Rules → (触发) → Alertmanager → (路由) → 通知
# 
# Alertmanager 核心功能：
# - Grouping:     相关告警合并为一条通知
# - Inhibition:   高级别告警抑制低级别（集群挂了不报 Pod 告警）
# - Silencing:    静默特定告警（维护窗口）
# - Routing:      按标签路由到不同接收者

# ━━━━ 2. 路由配置 ━━━━
# alertmanager.yml:
# global:
#   resolve_timeout: 5m
#   slack_api_url: 'https://hooks.slack.com/services/xxx'
#
# route:
#   receiver: 'default-slack'
#   group_by: ['alertname', 'service']
#   group_wait: 30s        # 等 30s 收集同组告警
#   group_interval: 5m     # 同组告警间隔 5m 再发
#   repeat_interval: 4h    # 未解决告警每 4h 重发
#   routes:
#     - match:
#         severity: critical
#       receiver: 'pagerduty-oncall'
#       continue: false     # 匹配后停止
#     - match:
#         severity: warning
#       receiver: 'slack-warnings'
#     - match_re:
#         service: 'payment.*'
#       receiver: 'payment-team-slack'
#
# receivers:
#   - name: 'pagerduty-oncall'
#     pagerduty_configs:
#       - service_key: 'xxx'
#         severity: '{{ .GroupLabels.severity }}'
#   - name: 'slack-warnings'
#     slack_configs:
#       - channel: '#alerts-warning'
#         title: '⚠️ {{ .GroupLabels.alertname }}'
#         text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
#   - name: 'default-slack'
#     slack_configs:
#       - channel: '#alerts'

# ━━━━ 3. 告警设计原则 ━━━━
# 
# ❌ 错误做法（Alert Fatigue 告警疲劳）：
# - CPU > 80% → 告警          ← 有的服务 CPU 就是 90%
# - 任何 5xx → 告警            ← 偶尔 1 个 5xx 正常
# - 磁盘 > 70% → 告警         ← 明天才满，不需要半夜叫醒
# → 结果：每天 500 条告警，所有人都忽略
# 
# ✅ 正确做法（Symptom-based 基于症状）：
# - 用户可见的错误率 > 1% 持续 5 分钟    ← 用户受影响了
# - P99 延迟 > 2s 持续 5 分钟           ← 用户体验下降
# - Error Budget 消耗 > 50% 本月        ← SLO 有风险
# - 磁盘 24 小时后预测满                 ← 预测性告警
# → 结果：每天 3-5 条可执行的告警

# ━━━━ 4. 告警降噪策略 ━━━━
# 
# A. 延迟告警 (for: 5m)
# - alert: HighErrorRate
#   expr: error_ratio > 0.01
#   for: 5m                      ← 持续 5 分钟才告警
#   # 避免瞬间抖动触发
# 
# B. 分组 (group_by)
#   group_by: ['service', 'env']
#   # 同一个服务的告警合为一条
# 
# C. 抑制 (inhibition)
# inhibit_rules:
#   - source_match: { severity: 'critical' }
#     target_match: { severity: 'warning' }
#     equal: ['service']
#   # 已经有 critical 告警时，不发 warning
# 
# D. 静默 (silence)
#   # 维护窗口：2024-03-15 02:00-06:00 所有告警静默
#   # 通过 Alertmanager UI 创建
# 
# E. 告警分级
#   P1 (Critical):  PagerDuty + 电话     → 立即处理
#   P2 (Warning):   Slack + 值班群        → 工作时间处理
#   P3 (Info):      Slack + 日志频道      → 知悉即可

# ━━━━ 5. Runbook（运维手册）━━━━
# 每条告警必须有 Runbook 链接
# annotations:
#   runbook: "https://wiki.internal/runbook/high-error-rate"
# 
# Runbook 模板：
# ## 告警名: HighErrorRate
# ### 1. 影响范围
#   - 用户无法完成支付
# ### 2. 初步诊断
#   - 检查 Grafana Dashboard: [链接]
#   - 检查最近部署: git log --oneline -5
#   - 检查依赖服务: curl payment-api/health
# ### 3. 常见原因 & 修复
#   - 数据库连接池满 → 重启 PgBouncer
#   - 上游 API 超时 → 检查第三方状态页
#   - 代码 bug → 回滚到上一版本
# ### 4. 升级路径
#   - 15 分钟未解决 → 联系 DBA
#   - 30 分钟未解决 → 联系 VP Engineering

# ━━━━ 6. On-Call 轮值 ━━━━
# 工具：PagerDuty / Opsgenie / Grafana OnCall
# 
# 最佳实践：
# - 每周轮值（不要每天换人）
# - Primary + Secondary 双人值班
# - 超时自动升级（15min → Secondary → Manager）
# - 事后复盘（Postmortem / Incident Review）
# - On-Call 补偿（调休/津贴）`;

export default function LessonAlerting() {
  return (
    <div className="obs-lesson">
      <div className="obs-hero">
        <div className="obs-badge"><span className="obs-pulse" style={{ background: '#ef4444' }} /> MODULE 06 · ALERTING</div>
        <h1>告警工程</h1>
        <p>每天 500 条告警 = 没有告警——<strong>Symptom-based 告警只关注用户影响，Alertmanager 路由/分组/抑制/静默降噪，每条告警必须有可执行的 Runbook</strong>。</p>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">🔔 告警工程</div>
        <div className="obs-code-wrap">
          <div className="obs-code-head">
            <div className="obs-code-dot" style={{ background: '#ef4444' }} /><div className="obs-code-dot" style={{ background: '#f59e0b' }} /><div className="obs-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>alertmanager.yml</span>
          </div>
          <div className="obs-code">{CODE}</div>
        </div>
      </div>

      <div className="obs-section">
        <div className="obs-section-title">📊 告警分级</div>
        <div className="obs-grid-3">
          {[
            { level: 'P1 Critical', action: 'PagerDuty + 电话', when: '⚡ 立即处理', color: '#ef4444' },
            { level: 'P2 Warning', action: 'Slack + 值班群', when: '🕐 工作时间处理', color: '#f97316' },
            { level: 'P3 Info', action: 'Slack + 日志频道', when: '📋 知悉即可', color: '#22c55e' },
          ].map((l, i) => (
            <div key={i} className="obs-card" style={{ borderTop: `3px solid ${l.color}` }}>
              <div style={{ fontWeight: 800, color: l.color, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{l.level}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--obs-muted)', lineHeight: 1.7 }}>
                📡 {l.action}<br/>{l.when}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
