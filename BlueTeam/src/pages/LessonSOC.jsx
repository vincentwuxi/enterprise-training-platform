import './LessonCommon.css';

const CODE = `# ━━━━ SOC 安全运营中心 ━━━━
# SOC = Security Operations Center
# 7×24 监控、检测、分析、响应安全事件

# ━━━━ 1. 告警分级（Triage）━━━━
# SOC 每天处理数千条告警，分级是核心能力
#
# ┌──────────┬──────────┬────────────────────────────┐
# │ 级别     │ 响应时间 │ 示例                       │
# ├──────────┼──────────┼────────────────────────────┤
# │ P1 紧急  │ < 15 min │ 勒索软件爆发、数据泄露     │
# │ P2 高危  │ < 1 hour │ 特权账户异常登录           │
# │ P3 中危  │ < 4 hour │ 恶意软件检测（已隔离）     │
# │ P4 低危  │ < 24 hour│ 策略违规、弱密码           │
# │ P5 信息  │ 无要求   │ 基线偏移、配置审计         │
# └──────────┴──────────┴────────────────────────────┘

# ━━━━ 2. SOC 三层运营模型 ━━━━
# Tier 1：告警监控员（Alert Monitoring）
#   - 24/7 监控 SIEM 仪表盘
#   - 初步分类：真阳性 / 误报 / 需升级
#   - 处理 80% 的告警（大部分是误报）
#
# Tier 2：事件分析师（Incident Analyst）
#   - 深度分析 Tier 1 升级的事件
#   - 关联多源数据（日志 + 网络 + 终端）
#   - 确定攻击范围和影响
#
# Tier 3：威胁猎人（Threat Hunter）
#   - 主动寻找未被检测到的威胁
#   - 基于假设的猎捕（Hypothesis-driven Hunting）
#   - 开发新检测规则和 Playbook

# ━━━━ 3. MITRE ATT&CK 框架 ━━━━
# 将每个告警映射到 ATT&CK 战术/技术
# 14 个战术（Tactic）= 攻击者的"目的"
#
# 侦察 → 资源开发 → 初始访问 → 执行 → 持久化
#   → 权限提升 → 防御规避 → 凭证获取 → 发现
#   → 横向移动 → 收集 → C2 通信 → 数据渗出 → 影响
#
# 示例映射：
# 告警：PowerShell 执行 Base64 编码命令
# → T1059.001（Command and Scripting: PowerShell）
# → TA0002（Execution）
# → 关联查找：同一主机是否有 T1053（Scheduled Task）?
#   如果两者同时出现 → 可能是持久化攻击链

# ━━━━ 4. SOC Playbook（标准处置流程）━━━━
# 每种告警类型都有对应的 Playbook
#
# 钓鱼邮件 Playbook：
# 1. 提取 IOC（发件人/链接/附件哈希）
# 2. 在 SIEM 中搜索同源邮件
# 3. 检查是否有用户点击了链接
# 4. 若点击：隔离终端 → 重置密码 → 取证
# 5. 封锁 IOC（邮件网关/防火墙/DNS）
# 6. 通知受影响用户
# 7. 更新检测规则

# ━━━━ 5. 关键 KPI ━━━━
# MTTD（Mean Time to Detect）：平均检测时间
#   → 目标 < 1 小时（行业平均 197 天！）
# MTTR（Mean Time to Respond）：平均响应时间
#   → 目标 P1 < 15 min, P2 < 1 hour
# 误报率（False Positive Rate）：
#   → 目标 < 20%（行业平均 50%+）
# 告警疲劳度：
#   → 每日每人处理 < 50 条告警`;

export default function LessonSOC() {
  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 01 · SOC OPERATIONS</div>
        <h1>SOC 安全运营中心</h1>
        <p>SOC 是企业安全的"大脑"——<strong>7×24 小时监控数千条告警、在海量噪音中精准识别真实威胁、用 MITRE ATT&CK 映射攻击链</strong>。行业平均检测时间是 197 天，一个好的 SOC 能压缩到 1 小时以内。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🛡️ SOC 运营体系</div>
        <div className="bt-code-wrap">
          <div className="bt-code-head">
            <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>soc-operations.md</span>
          </div>
          <div className="bt-code">{CODE}</div>
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">📊 SOC 关键指标</div>
        <div className="bt-grid-4">
          {[
            { v: '<1h', l: 'MTTD 目标（检测时间）', color: 'var(--bt-blue)' },
            { v: '15m', l: 'P1 事件 MTTR 目标', color: 'var(--bt-red)' },
            { v: '<20%', l: '误报率目标', color: 'var(--bt-amber)' },
            { v: '197天', l: '行业平均检测时间', color: 'var(--bt-muted)' },
          ].map((s, i) => (
            <div key={i} className="bt-metric">
              <div className="bt-metric-val" style={{ color: s.color, fontSize: '1.3rem' }}>{s.v}</div>
              <div className="bt-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">👥 SOC 三层模型</div>
        <div className="bt-grid-3">
          {[
            { tier: 'Tier 1', role: '告警监控员', tasks: ['24/7 监控 SIEM', '初步分类告警', '处理 80% 的告警'], color: '#3b82f6' },
            { tier: 'Tier 2', role: '事件分析师', tasks: ['深度关联分析', '确定攻击范围', '生成事件报告'], color: '#6366f1' },
            { tier: 'Tier 3', role: '威胁猎人', tasks: ['主动威胁狩猎', '开发检测规则', '攻击链还原'], color: '#06b6d4' },
          ].map((t, i) => (
            <div key={i} className="bt-card" style={{ borderTop: `3px solid ${t.color}` }}>
              <span className="bt-tag blue" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{t.tier}</span>
              <div style={{ fontWeight: 700, color: t.color, fontSize: '0.88rem', marginBottom: '0.5rem' }}>{t.role}</div>
              {t.tasks.map((task, j) => (
                <div key={j} style={{ fontSize: '0.82rem', color: 'var(--bt-muted)', marginBottom: '0.25rem' }}>→ {task}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
