import './LessonCommon.css';

const CODE = `# ━━━━ 应急响应（Incident Response）━━━━

# ━━━━ NIST IR 六阶段流程 ━━━━
# 1. 准备（Preparation）
# 2. 检测与分析（Detection & Analysis）
# 3. 遏制（Containment）
# 4. 根除（Eradication）
# 5. 恢复（Recovery）
# 6. 事后改进（Lessons Learned）

# ━━━━ 1. 准备阶段 ━━━━
# IR Playbook 清单：
# ✅ 应急联系人列表（技术/管理/法务/公关）
# ✅ 通信计划（内部 Slack 频道 + 外部声明模板）
# ✅ 取证工具箱（已准备好的 USB 启动盘）
# ✅ 隔离流程（如何快速断网一台机器）
# ✅ 备份恢复测试（上次恢复演练是什么时候？）

# ━━━━ 2. 检测与分析 ━━━━
# 事件时间线（Timeline）构建：
# 从多个数据源拼接完整攻击链

# 时间线示例（勒索软件事件）：
# 14:32 - 用户收到钓鱼邮件（邮件网关日志）
# 14:35 - 用户点击附件，宏执行 PowerShell（Sysmon EventID 1）
# 14:36 - PowerShell 下载 Cobalt Strike Beacon（Sysmon EventID 3）
# 14:37 - Beacon 注入 svchost.exe（Sysmon EventID 8）
# 14:40 - 凭证窃取 lsass.exe（Sysmon EventID 10）
# 14:45 - Domain Admin 令牌获取（AD 日志 4672）
# 14:50 - 横向移动到域控（RDP, EventID 4624 Type 10）
# 15:00 - GPO 部署勒索软件到所有工作站
# 15:05 - 文件加密开始，勒索通知出现

# ━━━━ 3. 遏制 ━━━━
# 短期遏制（分钟级）：
# - 网络隔离受感染主机（断网但不关机→保留内存证据）
# - 封锁 C2 IP/域名（防火墙/DNS）
# - 禁用被盗账户
# - 阻断横向移动（关闭 SMB/RDP 端口）

# 长期遏制（小时级）：
# - 重置所有 Domain Admin 密码
# - 部署临时监控规则
# - 隔离受感染网段

# ━━━━ 4. 数字取证 ━━━━
# 取证原则：不修改原始证据（只读挂载）

# 内存取证（Volatility 3）
# 获取内存镜像
# Windows: winpmem_mini_x64.exe memdump.raw
# Linux: avml memdump.lime

# 分析恶意进程
python3 vol.py -f memdump.raw windows.pslist
python3 vol.py -f memdump.raw windows.netscan    # 网络连接
python3 vol.py -f memdump.raw windows.malfind    # 注入代码检测
python3 vol.py -f memdump.raw windows.cmdline    # 命令行参数

# 磁盘取证
# 1. 制作磁盘镜像（dd / FTK Imager）
dd if=/dev/sda of=/evidence/disk.img bs=4M status=progress
# 2. 计算哈希（证据完整性）
sha256sum /evidence/disk.img > /evidence/disk.sha256
# 3. 只读挂载分析
mount -o ro,loop /evidence/disk.img /mnt/evidence

# ━━━━ 5. 事后改进（最重要！）━━━━
# 复盘会议（Postmortem / RCA）：
# 1. 攻击者是如何进入的？（Root Cause）
# 2. 为什么没有被更早检测到？（Detection Gap）
# 3. 响应过程中哪些做得好/不好？
# 4. 需要增加/修改哪些检测规则？
# 5. 需要修复哪些系统/流程漏洞？
# → 输出：具体的改进 Action Items + Owner + Deadline`;

export default function LessonIncident() {
  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 08 · INCIDENT RESPONSE</div>
        <h1>应急响应</h1>
        <p>安全事件不是"会不会发生"而是"什么时候发生"——<strong>NIST 六阶段 IR 流程（准备→检测→遏制→根除→恢复→改进）是每个安全团队的"肌肉记忆"</strong>。准备越充分，响应越迅速，损失越小。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🚨 应急响应全流程</div>
        <div className="bt-code-wrap">
          <div className="bt-code-head">
            <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>incident-response.sh</span>
          </div>
          <div className="bt-code">{CODE}</div>
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🏁 蓝队防御全链路回顾</div>
        <div className="bt-steps">
          {[
            { step: '1', name: 'SOC 运营', desc: '告警分级 + 三层模型 + MITRE ATT&CK 映射 + Playbook', color: '#3b82f6' },
            { step: '2', name: 'SIEM 日志', desc: 'ELK/Splunk + Sigma 规则 + 关联分析 → SOC 的"眼睛"', color: '#6366f1' },
            { step: '3', name: '终端 EDR', desc: 'YARA 规则 + Sysmon 监控 + Osquery → 端点行为检测', color: '#06b6d4' },
            { step: '4', name: '网络 NDR', desc: 'Zeek + Suricata + JA3 指纹 → 网络流量分析', color: '#38bdf8' },
            { step: '5', name: '云安全', desc: 'CloudTrail + GuardDuty + IAM 最小权限 + 容器安全', color: '#3b82f6' },
            { step: '6', name: '零信任', desc: 'BeyondCorp + 微分段 + 持续认证 → "永不信任"', color: '#6366f1' },
            { step: '7', name: '威胁情报', desc: 'IOC/TTP + STIX/TAXII + 威胁狩猎 + ATT&CK Navigator', color: '#06b6d4' },
            { step: '8', name: '应急响应', desc: 'NIST 六阶段 + 数字取证 + Volatility + 事后复盘', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} className="bt-step">
              <div className="bt-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--bt-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bt-tip">💡 <strong>红蓝对抗闭环</strong>：渗透测试课（红队）教你"怎么攻"，本课（蓝队）教你"怎么防"。红队发现的每个漏洞 → 蓝队写检测规则 → 红队绕过规则 → 蓝队改进规则 → 螺旋上升的安全水平。</div>
      </div>
    </div>
  );
}
