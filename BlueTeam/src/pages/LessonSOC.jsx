import { useState } from 'react';
import './LessonCommon.css';

const tabs = ['告警分级', 'MITRE ATT&CK', 'SIEM & Playbook', 'KPI & AI 赋能'];

export default function LessonSOC() {
  const [active, setActive] = useState(0);
  const [expandedTier, setExpandedTier] = useState(null);

  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 01 · SOC OPERATIONS</div>
        <h1>SOC 安全运营中心</h1>
        <p>SOC 是企业安全的"大脑"——<strong>7×24 小时监控数千条告警、在海量噪音中精准识别真实威胁、用 MITRE ATT&CK 映射攻击链</strong>。行业平均检测时间是 197 天，一个好的 SOC 能压缩到 1 小时以内。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🛡️ SOC 运营体系</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {tabs.map((t, i) => (
            <button key={i} className={`bt-tag ${active===i?'blue':''}`} style={{cursor:'pointer',padding:'0.35rem 0.8rem',fontSize:'0.78rem'}} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>alert-triage.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ SOC 告警分级 (Triage) ━━━━
# SOC 每天处理数千条告警，分级是核心能力
# 80% 的告警是误报 → 区分真假是最重要的技能

# ┌──────────┬──────────┬────────────────────────────┬───────────────┐
# │ 级别     │ 响应时间 │ 典型场景                   │ 处置要求      │
# ├──────────┼──────────┼────────────────────────────┼───────────────┤
# │ P1 紧急  │ < 15 min │ 勒索软件爆发/数据泄露      │ 全员响应      │
# │ P2 高危  │ < 1 hour │ 特权账户异常/C2 通信       │ 高级分析师    │
# │ P3 中危  │ < 4 hour │ 恶意软件检测(已隔离)       │ 标准流程      │
# │ P4 低危  │ < 24 hour│ 策略违规/弱密码告警        │ 工单处理      │
# │ P5 信息  │ 无要求   │ 基线偏移/配置审计          │ 记录存档      │
# └──────────┴──────────┴────────────────────────────┴───────────────┘

# ━━━━ 告警分级决策树 ━━━━
# 
# 新告警到达
# │
# ├─ 是否已知误报模式？ → YES → 自动关闭 + 标记
# │
# ├─ 是否匹配已知 IOC？ → YES → 提升至 P2+
# │
# ├─ 是否涉及关键资产？
# │   ├── YES → P1/P2 (域控/数据库/CEO 设备)
# │   └── NO  → P3/P4
# │
# ├─ 是否跨多个系统？ → YES → 可能横向移动 → P2
# │
# └─ 评估攻击链阶段 (MITRE ATT&CK)
#     ├── 早期(侦察/初始访问) → P3
#     ├── 中期(权限提升/持久化) → P2
#     └── 晚期(数据渗出/影响) → P1`}</div>
            </div>

            <div className="bt-section-title">👥 SOC 三层运营模型</div>
            <div className="bt-grid-3">
              {[
                { tier: 'Tier 1', role: '告警监控员', color: '#3b82f6',
                  tasks: ['24/7 监控 SIEM 仪表盘', '初步分类: 真阳/误报/需升级', '处理 80% 告警 (大部分是误报)', '执行标准 Playbook'],
                  skills: ['SIEM 操作', 'IOC 查询', '基础网络知识'],
                  salary: '15-30万/年', count: '占 SOC 60%',
                },
                { tier: 'Tier 2', role: '事件分析师', color: '#6366f1',
                  tasks: ['深度分析 Tier 1 升级的事件', '关联多源数据 (日志+网络+终端)', '确定攻击范围和影响', '编写事件报告和建议'],
                  skills: ['日志分析', '取证', 'ATT&CK', '脚本编写'],
                  salary: '30-60万/年', count: '占 SOC 30%',
                },
                { tier: 'Tier 3', role: '威胁猎人', color: '#06b6d4',
                  tasks: ['主动寻找未被检测的威胁', '假设驱动的威胁狩猎', '开发新检测规则和 Playbook', '红蓝对抗和攻击模拟'],
                  skills: ['逆向工程', '恶意代码分析', '高级取证', '威胁情报'],
                  salary: '60-120万/年', count: '占 SOC 10%',
                },
              ].map((t, i) => (
                <div key={i} className="bt-card" style={{ borderTop: `3px solid ${t.color}`, cursor: 'pointer' }}
                  onClick={() => setExpandedTier(expandedTier === i ? null : i)}>
                  <span className="bt-tag blue" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{t.tier}</span>
                  <div style={{ fontWeight: 700, color: t.color, fontSize: '0.88rem', marginBottom: '0.5rem' }}>{t.role}</div>
                  {t.tasks.map((task, j) => (
                    <div key={j} style={{ fontSize: '0.82rem', color: 'var(--bt-muted)', marginBottom: '0.25rem' }}>→ {task}</div>
                  ))}
                  {expandedTier === i && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.75rem', color: t.color, fontWeight: 600, marginBottom: 4 }}>核心技能</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                        {t.skills.map(s => <span key={s} className="bt-tag">{s}</span>)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--bt-muted)' }}>薪资范围: <span style={{color:'#fbbf24'}}>{t.salary}</span> · {t.count}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {active === 1 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>mitre-attack-mapping.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ MITRE ATT&CK 框架 ━━━━
# 将每个告警映射到战术/技术，构建攻击全景图

# 14 个战术 (Tactic) = 攻击者的"目的"
#
# 侦察 → 资源开发 → 初始访问 → 执行 → 持久化
#   → 权限提升 → 防御规避 → 凭证获取 → 发现
#   → 横向移动 → 收集 → C2 通信 → 数据渗出 → 影响

# ━━━━ 真实攻击链映射案例 ━━━━
# 场景: 员工收到钓鱼邮件，点击恶意链接

# 时间线:
# 09:15 - T1566.001 (钓鱼: 恶意附件)
#   ● TA0001 初始访问
#   ● 员工打开 "发票.xlsm" → 宏执行
#
# 09:16 - T1059.001 (PowerShell 执行)
#   ● TA0002 执行
#   ● 宏调用 PowerShell 下载后门
#   ● 命令: powershell -enc [Base64编码]
#
# 09:17 - T1547.001 (注册表启动项)
#   ● TA0003 持久化
#   ● 写入 HKCU\\Software\\Microsoft\\Windows\\Run
#
# 09:20 - T1055.003 (进程注入: Thread Hijacking)
#   ● TA0005 防御规避
#   ● 注入到 svchost.exe 进程
#
# 09:25 - T1003.001 (LSASS 内存转储)
#   ● TA0006 凭证获取
#   ● Mimikatz 提取域管密码哈希
#
# 09:30 - T1021.002 (SMB/Windows Admin Shares)
#   ● TA0008 横向移动
#   ● 使用域管凭证访问文件服务器
#
# 09:45 - T1041 (C2 通道外传数据)
#   ● TA0010 数据渗出
#   ● 通过 HTTPS 隧道上传敏感文件

# ━━━━ SOC 关联分析 ━━━━
# 单个告警: PowerShell 执行 Base64 → P3 (可能误报)
# 关联后: PowerShell + 注册表 + LSASS + SMB
#         → 完整攻击链 → 升级为 P1!
#
# 这就是为什么 ATT&CK 映射如此重要:
# 把孤立的告警 → 连成攻击故事 → 看清全貌`}</div>
            </div>

            <div className="bt-grid-4" style={{marginTop:'0.75rem'}}>
              {[
                { phase: '初始阶段', tactics: '侦察 → 初始访问', color: '#22c55e', risk: '低', examples: 'T1566 钓鱼, T1190 公开应用漏洞' },
                { phase: '建立据点', tactics: '执行 → 持久化 → 权限提升', color: '#f59e0b', risk: '中', examples: 'T1059 脚本执行, T1547 启动项' },
                { phase: '横向扩展', tactics: '凭证获取 → 横向移动 → 发现', color: '#ef4444', risk: '高', examples: 'T1003 凭证转储, T1021 远程服务' },
                { phase: '达成目标', tactics: '收集 → C2 → 渗出 → 影响', color: '#dc2626', risk: '极高', examples: 'T1041 数据外传, T1486 勒索加密' },
              ].map((p, i) => (
                <div key={i} className="bt-metric" style={{ borderLeft: `3px solid ${p.color}`, paddingLeft: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: p.color, fontSize: '0.85rem', marginBottom: 2 }}>{p.phase}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--bt-muted)', marginBottom: 4 }}>{p.tactics}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{p.examples}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {active === 2 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>siem-and-playbook.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ SIEM 核心能力 ━━━━
# SIEM = Security Information and Event Management
# 产品: Splunk / Microsoft Sentinel / Elastic SIEM / QRadar

# 数据源接入:
# ┌──────────────┬──────────────────────────────┐
# │ 数据源        │ 日志类型                     │
# ├──────────────┼──────────────────────────────┤
# │ 防火墙/WAF   │ 网络访问日志, 阻断记录       │
# │ EDR          │ 进程创建/文件操作/注册表修改   │
# │ AD/LDAP      │ 认证日志, 权限变更            │
# │ 邮件网关      │ 收发记录, 恶意附件检测        │
# │ 云平台       │ API 调用, IAM 变更, S3 访问   │
# │ DNS          │ 域名查询记录 (C2 通信检测)     │
# │ VPN/SSO      │ 远程访问, 异地登录            │
# │ 应用日志      │ 业务异常, SQL 注入尝试        │
# └──────────────┴──────────────────────────────┘

# SIEM 告警规则示例 (Splunk SPL):
# 检测暴力破解:
index=auth sourcetype=windows:security EventCode=4625
| stats count by src_ip, dest, Account_Name
| where count > 10
| lookup threat_intel src_ip OUTPUT is_malicious

# 检测异常 PowerShell:
index=sysmon EventCode=1 
  Image="*powershell.exe"
  CommandLine="*-enc*" OR CommandLine="*-hidden*"
| table _time, Computer, User, CommandLine

# ━━━━ SOC Playbook (标准处置流程) ━━━━

# 📧 钓鱼邮件 Playbook:
# 1. 提取 IOC (发件人/链接/附件哈希)
# 2. 在 SIEM 中搜索同源邮件 (影响范围)
# 3. 检查是否有用户点击了链接
# 4. 若点击:
#    a. 隔离终端 (EDR remote isolation)
#    b. 重置密码 + 撤销 session
#    c. 取证分析 (内存/磁盘)
# 5. 封锁 IOC (邮件网关/防火墙/DNS)
# 6. 通知受影响用户 + 管理层
# 7. 更新检测规则, 防止同类攻击

# 🔑 特权账户异常 Playbook:
# 1. 确认是否本人操作 (联系账户所有者)
# 2. 若非本人:
#    a. 立即禁用该账户
#    b. 审查该账户近 48h 所有操作
#    c. 检查是否创建了新账户
#    d. 检查是否修改了安全策略
# 3. 溯源: 凭证如何泄露?
# 4. 影响评估: 访问了哪些敏感系统?
# 5. 全面密码重置 (如果是域管)

# 🦠 恶意软件检测 Playbook:
# 1. EDR 自动隔离终端
# 2. 提取样本哈希 → 查 VirusTotal
# 3. 分析行为: 是否外联C2? 是否横向移动?
# 4. 全网搜索同一哈希 (是否有其他感染)
# 5. 清除恶意文件 + 修复持久化
# 6. 解除隔离 + 持续监控 72h`}</div>
            </div>
          </>
        )}

        {active === 3 && (
          <>
            <div className="bt-grid-4">
              {[
                { v: '<1h', l: 'MTTD 目标 (检测时间)', color: 'var(--bt-blue)' },
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

            <div className="bt-code-wrap" style={{marginTop:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>soc-kpi-and-ai.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ SOC 核心 KPI 体系 ━━━━

# MTTD (Mean Time to Detect) - 平均检测时间
#   行业平均: 197 天 (IBM 2024 报告)
#   SOC 目标: < 1 小时
#   优化方法: 自动化 + AI 异常检测

# MTTR (Mean Time to Respond) - 平均响应时间
#   P1 目标: < 15 分钟
#   P2 目标: < 1 小时
#   P3 目标: < 4 小时
#   优化方法: Playbook 自动化 + SOAR

# 误报率 (False Positive Rate)
#   行业平均: 50%+ (一半的告警是噪音)
#   目标: < 20%
#   优化方法: 规则调优 + ML 分类

# 告警疲劳度
#   目标: 每人每天处理 < 50 条告警
#   超过 100 条 → 分析师倦怠 → 漏报风险

# ━━━━ AI 赋能 SOC (SOC of the Future) ━━━━

# 1. AI 告警降噪
#   传统: 5000 条/天 → 分析师逐条看
#   AI:   ML 模型自动分类, 只留 500 条需要人看
#   效果: 降噪 90%, 分析师专注真实威胁

# 2. AI 驱动的威胁检测
#   - UEBA (User Entity Behavior Analytics)
#     建立每个用户/设备的行为基线
#     偏离基线 → 自动告警
#     例: "张三从未在凌晨 3 点登录过, 今天登录了"
#
#   - 异常流量检测
#     ML 学习正常网络流量模式
#     偏离 → DNS 隧道? C2 通信?

# 3. AI Copilot for SOC
#   现有产品:
#   - Microsoft Copilot for Security
#   - Google SecOps AI
#   - CrowdStrike Charlotte AI
#
#   能力:
#   - 自然语言查询: "显示过去24h所有P1告警"
#   - 自动关联: 把多个告警串成攻击故事
#   - 报告生成: 自动撰写事件报告
#   - 推荐处置: "建议隔离该终端并重置密码"

# 4. SOAR 自动化编排
#   SOAR = Security Orchestration, Automation, Response
#   - 低级别告警 → 全自动处置
#   - 中级别告警 → 半自动 + 人工审批
#   - 高级别告警 → 辅助分析 + 人工决策
#
#   效果: MTTR 降低 60-80%

# ━━━━ SOC 成熟度模型 ━━━━
# Level 1: 被动式 (仅响应已知告警)
# Level 2: 主动式 (有 Playbook + 规则调优)
# Level 3: 智能式 (AI 降噪 + SOAR 自动化)
# Level 4: 预测式 (威胁猎捕 + 攻击预测)
# Level 5: 自适应 (自动进化检测规则)`}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
