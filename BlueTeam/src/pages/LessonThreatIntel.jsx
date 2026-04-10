import './LessonCommon.css';

const CODE = `# ━━━━ 威胁情报（Threat Intelligence）━━━━

# ━━━━ 1. IOC vs TTP ━━━━
# IOC（Indicators of Compromise）= 已知恶意的"指标"
# - IP 地址：192.168.1.100（C2 服务器）
# - 域名：evil-domain.com
# - 文件哈希：sha256:a1b2c3d4...
# - URL：http://malware.site/payload.exe
# - 邮件地址：phishing@fake.com
# 特点：具体、可直接阻断、但容易被攻击者更换

# TTP（Tactics, Techniques, Procedures）= 攻击者的"行为模式"
# - 战术（T）：TA0003 Persistence（持久化）
# - 技术（T）：T1053 Scheduled Task（计划任务）
# - 过程（P）：使用 schtasks /create 创建每小时执行的反弹 Shell
# 特点：抽象、不易更换、检测价值更高

# ━━━━ 痛苦金字塔（Pyramid of Pain）━━━━
# 自底向上，攻击者更换的成本递增：
#
#     /\\        TTP（最痛苦！攻击者必须改变行为）
#    /  \\       工具（使用新的攻击工具）
#   /    \\      网络特征（C2 通信模式）
#  /      \\     主机特征（进程名/注册表键）
# /        \\    域名/IP（几分钟就能换新的）
# /          \\    哈希值（改一个字节就变了）
# ━━━━━━━━━━

# ━━━━ 2. STIX/TAXII（情报共享标准）━━━━
# STIX（Structured Threat Information eXpression）
# = 威胁情报的 JSON 标准格式
{
  "type": "indicator",
  "spec_version": "2.1",
  "id": "indicator--a1b2c3d4-...",
  "created": "2025-01-15T00:00:00Z",
  "name": "Cobalt Strike C2 服务器",
  "description": "已确认的 Cobalt Strike Beacon C2 地址",
  "pattern": "[ipv4-addr:value = '203.0.113.100']",
  "pattern_type": "stix",
  "valid_from": "2025-01-15T00:00:00Z",
  "kill_chain_phases": [
    { "kill_chain_name": "mitre-attack", "phase_name": "command-and-control" }
  ],
  "labels": ["malicious-activity"]
}

# TAXII（Trusted Automated eXchange of Indicator Information）
# = 情报传输协议（类似 API）
# TAXII Server → 提供情报 Feed
# TAXII Client → 订阅和拉取情报

# ━━━━ 3. 威胁狩猎（Threat Hunting）━━━━
# 假设驱动：假设攻击者已在网络中 → 主动寻找证据
#
# 狩猎流程（PEAK 框架）：
# P - Prepare：确定狩猎假设和数据源
# E - Execute：在 SIEM/EDR 中执行查询
# A - Act：验证发现 → 创建新检测规则
# K - Knowledge：记录经验 → 分享给团队

# 狩猎假设示例：
# "攻击者可能通过 DNS 隧道外泄数据"
# 查询：dns.log 中子域名长度 > 50 字符的 DNS 请求
# 预期：正常 DNS 查询子域名 < 30 字符

# ━━━━ 4. ATT&CK Navigator（可视化覆盖率）━━━━
# 用途：可视化组织的检测覆盖率 vs 威胁矩阵
# 1. 导出所有 SIEM 规则 → 映射到 ATT&CK 技术 ID
# 2. 在 Navigator 中标绿色 = 已覆盖
# 3. 未覆盖的红色区域 = 安全盲区 → 优先补检测规则`;

export default function LessonThreatIntel() {
  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 07 · THREAT INTELLIGENCE</div>
        <h1>威胁情报</h1>
        <p>知己知彼——<strong>IOC 告诉你"谁在攻击"，TTP 告诉你"怎么攻击"</strong>。痛苦金字塔揭示了一个真理：封锁 IP 和哈希只是临时措施，检测行为模式（TTP）才能让攻击者真正"痛苦"。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🔍 威胁情报体系</div>
        <div className="bt-code-wrap">
          <div className="bt-code-head">
            <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>threat-intel.json</span>
          </div>
          <div className="bt-code">{CODE}</div>
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🏔️ 痛苦金字塔</div>
        <div className="bt-steps">
          {[
            { name: 'TTP（战术/技术/过程）', pain: '最痛苦 — 必须改变整个攻击方法论', color: '#ef4444' },
            { name: '攻击工具', pain: '很痛苦 — 需要开发/采购新工具', color: '#f97316' },
            { name: '网络特征（C2 模式）', pain: '中等痛苦 — 重新设计 C2 通信协议', color: '#fbbf24' },
            { name: '主机特征（进程/注册表）', pain: '较小痛苦 — 改名/混淆', color: '#3b82f6' },
            { name: '域名 / IP 地址', pain: '轻微痛苦 — 几分钟换一个新的', color: '#6366f1' },
            { name: '文件哈希', pain: '零痛苦 — 改一个字节哈希就变了', color: 'var(--bt-muted)' },
          ].map((l, i) => (
            <div key={i} className="bt-step">
              <div className="bt-step-num" style={{ background: `${l.color}18`, borderColor: l.color, color: l.color }}>{6 - i}</div>
              <div>
                <div style={{ fontWeight: 700, color: l.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{l.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--bt-muted)', lineHeight: 1.6 }}>{l.pain}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
