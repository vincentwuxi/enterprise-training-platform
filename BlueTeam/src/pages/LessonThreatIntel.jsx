import { useState } from 'react';
import './LessonCommon.css';

const tabs = ['IOC vs TTP', 'STIX/TAXII 情报共享', '威胁狩猎', 'ATT&CK 覆盖分析'];

export default function LessonThreatIntel() {
  const [active, setActive] = useState(0);

  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 07 · THREAT INTELLIGENCE</div>
        <h1>威胁情报</h1>
        <p>知己知彼——<strong>IOC 告诉你"谁在攻击"，TTP 告诉你"怎么攻击"</strong>。痛苦金字塔揭示了一个真理：封锁 IP 和哈希只是临时措施，检测行为模式（TTP）才能让攻击者真正"痛苦"。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">🔍 威胁情报体系</div>
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
                <span style={{ marginLeft: '0.5rem' }}>ioc-vs-ttp.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ IOC vs TTP: 两种情报层级 ━━━━

# IOC (Indicators of Compromise) = 已知恶意的"指标"
# ──────────────────────────────────────────────────
# 类型          │ 示例                          │ 寿命
# ──────────────┼───────────────────────────────┼────────
# IP 地址       │ 203.0.113.100 (C2 服务器)     │ 几小时
# 域名          │ evil-domain.com               │ 几天
# 文件哈希      │ sha256:a1b2c3d4...            │ 一次性
# URL           │ http://malware.site/payload   │ 几小时
# 邮件地址      │ phishing@fake.com             │ 几天
# 注册表键      │ HKCU\Run\backdoor             │ 几周
# 用户代理      │ Mozilla/4.0 (PowerShell)      │ 几个月
#
# 特点: 具体、可直接阻断、但容易被攻击者更换

# TTP (Tactics, Techniques, Procedures) = 攻击者的"行为模式"
# ──────────────────────────────────────────────────
# 层级    │ 定义              │ 示例
# ────────┼───────────────────┼──────────────────────
# Tactic  │ 攻击目的          │ TA0003 持久化
# Technique│ 达成目的的方法    │ T1053 计划任务
# Procedure│ 具体的执行步骤   │ schtasks /create 
#          │                   │ /sc hourly /tr rev.exe
#
# 特点: 抽象、不易更换、检测价值更高
# → 攻击者换 IP 只要几秒，改变整个攻击方法论 → 需要数月!

# ━━━━ 痛苦金字塔 (Pyramid of Pain) ━━━━
# David Bianco 2013 年提出的经典模型
# 自底向上, 攻击者更换的成本递增:
#
#            /\
#           /  \        TTP
#          / 最  \      (攻击方法论 → 最痛苦!)
#         / 痛苦  \     改变成本: 数月
#        /────────\
#       /          \    工具
#      /   很痛苦   \   (攻击工具 → 需要重新开发)
#     /──────────────\  改变成本: 数周
#    /                \
#   /    中等痛苦      \ 网络+主机特征
#  /────────────────────\  (C2模式/进程名 → 需要重构)
# /                      \ 改变成本: 数天
# /  轻微痛苦 / 零痛苦     \
# /────────────────────────\ 域名/IP/哈希
#                             (秒级更换)

# ━━━━ IOC 情报来源 ━━━━
# 免费:
#   - VirusTotal    (virustotal.com)      - 文件/URL/IP
#   - AlienVault OTX (otx.alienvault.com) - 多类型 IOC
#   - Abuse.ch      (abuse.ch)            - 恶意软件/C2
#   - URLhaus       (urlhaus.abuse.ch)    - 恶意 URL
#   - ThreatFox     (threatfox.abuse.ch)  - IOC 聚合
#   - PhishTank     (phishtank.org)       - 钓鱼URL
#   - GreyNoise     (greynoise.io)        - 互联网噪音
#
# 商业:
#   - CrowdStrike Threat Intelligence
#   - Mandiant Advantage
#   - Recorded Future
#   - Intel 471`}</div>
            </div>

            <div className="bt-section-title">🏔️ 痛苦金字塔</div>
            <div className="bt-steps">
              {[
                { name: 'TTP (战术/技术/过程)', pain: '最痛苦 — 必须改变整个攻击方法论 → 需数月重构', color: '#ef4444' },
                { name: '攻击工具 (Tools)', pain: '很痛苦 — 需要开发/采购新工具 → 需数周', color: '#f97316' },
                { name: '网络特征 (C2 模式)', pain: '中等痛苦 — 重新设计 C2 通信协议', color: '#fbbf24' },
                { name: '主机特征 (进程/注册表)', pain: '较小痛苦 — 改名/混淆即可绕过', color: '#3b82f6' },
                { name: '域名 / IP 地址', pain: '轻微痛苦 — 几分钟换一个新的', color: '#6366f1' },
                { name: '文件哈希 (Hash)', pain: '零痛苦 — 改一个字节哈希就完全不同', color: 'var(--bt-muted)' },
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
          </>
        )}

        {active === 1 && (
          <div className="bt-code-wrap">
            <div className="bt-code-head">
              <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem' }}>stix-taxii-sharing.json</span>
            </div>
            <div className="bt-code">{`# ━━━━ STIX/TAXII: 威胁情报共享标准 ━━━━

# STIX (Structured Threat Information eXpression)
# = 威胁情报的 JSON 标准格式
# 版本: STIX 2.1 (当前标准)

# STIX 对象类型:
# ┌──────────────────┬──────────────────────────────┐
# │ 对象类型         │ 用途                         │
# ├──────────────────┼──────────────────────────────┤
# │ indicator        │ IOC 指标 (IP/域名/哈希)      │
# │ malware          │ 恶意软件描述                 │
# │ attack-pattern   │ 攻击技术 (映射 ATT&CK)      │
# │ threat-actor     │ 威胁组织 (APT28, Lazarus)    │
# │ campaign         │ 攻击行动                     │
# │ vulnerability    │ 漏洞 (CVE-xxxx-xxxx)         │
# │ relationship     │ 对象间的关联关系             │
# │ sighting         │ 观察到 IOC 的实例            │
# │ course-of-action │ 缓解措施                     │
# └──────────────────┴──────────────────────────────┘

# STIX 2.1 示例: Cobalt Strike C2 服务器
{
  "type": "bundle",
  "id": "bundle--f1a1b2c3",
  "objects": [
    {
      "type": "indicator",
      "spec_version": "2.1",
      "id": "indicator--a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "created": "2025-01-15T00:00:00Z",
      "modified": "2025-01-15T00:00:00Z",
      "name": "Cobalt Strike C2 服务器",
      "description": "已确认的 Cobalt Strike Beacon C2 地址，与 APT29 活动关联",
      "pattern": "[ipv4-addr:value = '203.0.113.100'] OR [domain-name:value = 'update.evil-cdn.com']",
      "pattern_type": "stix",
      "valid_from": "2025-01-15T00:00:00Z",
      "valid_until": "2025-03-15T00:00:00Z",
      "kill_chain_phases": [
        {
          "kill_chain_name": "mitre-attack",
          "phase_name": "command-and-control"
        }
      ],
      "labels": ["malicious-activity"],
      "confidence": 85
    },
    {
      "type": "relationship",
      "id": "relationship--x1y2z3",
      "relationship_type": "indicates",
      "source_ref": "indicator--a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "target_ref": "malware--cobalt-strike-uuid"
    }
  ]
}

# TAXII (Trusted Automated eXchange of Indicator Information)
# = 情报传输协议 (类似 REST API)
# 
# TAXII 工作流:
# 1. TAXII Server → 提供情报 Feed (Collection)
# 2. TAXII Client → 订阅和拉取情报
# 3. 自动同步到 SIEM/EDR/防火墙

# Python TAXII 客户端:
from taxii2client.v21 import Server, Collection
server = Server("https://cti-taxii.mitre.org/taxii2/")
for api_root in server.api_roots:
    for collection in api_root.collections:
        print(f"Collection: {collection.title}")
        # 拉取最近 24h 的 IOC
        stix_content = collection.get_objects(
            added_after="2025-01-14T00:00:00Z"
        )

# 主要 TAXII Feed:
# - MITRE ATT&CK TAXII Server (免费)
# - AlienVault OTX (免费)
# - Anomali STAXX (免费/商业)
# - CrowdStrike (商业)

# ━━━━ MISP: 开源威胁情报平台 ━━━━
# MISP = Malware Information Sharing Platform
# 功能:
# - 存储和管理 IOC (IP/域名/哈希/YARA)
# - 自动关联 IOC → 构建威胁画像
# - 与 SIEM/EDR/防火墙集成 (自动阻断)
# - 社区共享 (多组织协作)
# 安装: docker-compose up -d (官方 Docker 部署)`}</div>
          </div>
        )}

        {active === 2 && (
          <div className="bt-code-wrap">
            <div className="bt-code-head">
              <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem' }}>threat-hunting.md</span>
            </div>
            <div className="bt-code">{`# ━━━━ 威胁狩猎 (Threat Hunting) ━━━━

# 核心理念: 假设攻击者已在你的网络中
# → 不等告警，主动寻找威胁!
# SOC Tier 3 分析师的核心工作

# 威胁狩猎 vs 传统检测:
# ┌────────────────┬──────────────┬──────────────────┐
# │                │ 传统检测     │ 威胁狩猎         │
# ├────────────────┼──────────────┼──────────────────┤
# │ 触发方式       │ 被动(告警)   │ 主动(假设驱动)   │
# │ 检测对象       │ 已知威胁     │ 未知威胁         │
# │ 执行者         │ Tier 1/2     │ Tier 3 专家      │
# │ 频率           │ 实时/持续    │ 周期性/按需      │
# │ 输出           │ 告警         │ 新检测规则       │
# └────────────────┴──────────────┴──────────────────┘

# ━━━━ PEAK 狩猎框架 ━━━━
# P - Prepare:  确定狩猎假设和数据源
# E - Execute:  在 SIEM/EDR 中执行查询
# A - Act:      验证发现 → 创建新检测规则
# K - Knowledge: 记录经验 → 分享给团队

# ━━━━ 10 个实战狩猎假设 ━━━━

# 假设 1: "攻击者通过 DNS 隧道外泄数据"
# 数据源: dns.log
# 查询: 子域名长度 > 50 字符的 DNS 请求
cat dns.log | zeek-cut query | awk 'length($0) > 50'
# 预期: 正常 DNS 子域名 < 30 字符

# 假设 2: "存在未被检测的 C2 信标"
# 数据源: conn.log
# 查询: 固定间隔(55-65秒)的出站 HTTPS 连接
rita show-beacons my_dataset --tsv | \\
  awk -F'\t' '$2 > 0.9'  # 信标评分 > 0.9

# 假设 3: "特权账户被滥用"
# 数据源: Windows Security Event Log
# 查询: 域管账户在非工作时间的登录
index=wineventlog EventCode=4624 Account_Name=*admin*
| where date_hour < 7 OR date_hour > 22

# 假设 4: "存在 Living-off-the-Land 攻击"
# 数据源: Sysmon Event ID 1
# 查询: 合法工具的可疑使用
index=sysmon EventCode=1 
  (Image="*certutil*" AND CommandLine="*-decode*") OR
  (Image="*bitsadmin*" AND CommandLine="*transfer*") OR
  (Image="*mshta*" AND CommandLine="*http*")

# 假设 5: "邮件系统被用于初始访问"
# 数据源: 邮件网关日志
# 查询: 包含宏的 Office 附件
index=email_gateway attachment_type IN ("xlsm","docm","pptm")
| stats count by sender, recipient, attachment_name

# 假设 6: "存在持久化后门"
# 数据源: Sysmon Event ID 13 (注册表修改)
index=sysmon EventCode=13 
  TargetObject="*\\Run\\*" OR 
  TargetObject="*\\RunOnce\\*"
| where NOT Image IN (known_legitimate_apps)

# 假设 7: "数据库被异常访问"
# 数据源: 数据库审计日志
index=db_audit action=SELECT table IN ("customers","credit_cards")
| stats count by user, src_ip
| where count > 1000  # 批量查询

# 假设 8: "云 API 被滥用"
# 数据源: CloudTrail
index=cloudtrail eventName IN ("GetSecretValue",
  "AssumeRole", "CreateAccessKey")
| stats count by userIdentity.arn, sourceIPAddress
| where count > 20

# 假设 9: "存在 Kerberoasting 攻击"
# 数据源: Windows Security Event Log
index=wineventlog EventCode=4769 Ticket_Encryption_Type=0x17
| stats count by Account_Name, Service_Name
| where count > 5

# 假设 10: "Web 应用正在被利用"
# 数据源: WAF/Web 服务器日志
index=web_logs (uri="*../../../*" OR uri="*UNION SELECT*" 
  OR uri="*<script>*")
| stats count by src_ip, uri
| sort -count

# ━━━━ 狩猎输出 ━━━━
# 每次狩猎必须输出:
# 1. 是否发现威胁 (Y/N + 证据)
# 2. 新的检测规则 (Sigma/Suricata/Zeek)
# 3. 数据源差距 (需要补充什么日志?)
# 4. 知识库更新 (记录到 Wiki)`}</div>
          </div>
        )}

        {active === 3 && (
          <>
            <div className="bt-code-wrap" style={{marginBottom:'1rem'}}>
              <div className="bt-code-head">
                <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: '0.5rem' }}>attack-coverage-analysis.md</span>
              </div>
              <div className="bt-code">{`# ━━━━ ATT&CK Navigator: 可视化覆盖率 ━━━━

# ATT&CK Navigator 是 MITRE 提供的免费可视化工具
# 用途: 可视化你的检测覆盖率 vs 威胁矩阵
# URL: attack.navigateor.mitre.org

# ━━━━ 覆盖率分析流程 ━━━━

# Step 1: 导出所有检测规则
# 收集所有检测源:
# - SIEM 告警规则 (Splunk/ELK)
# - Suricata/Snort 规则
# - EDR 检测规则 (CrowdStrike/SentinelOne)
# - Sigma 规则
# → 整理成列表

# Step 2: 映射到 ATT&CK 技术 ID
# 每条规则对应一个或多个 T-ID:
# ┌────────────────────────┬───────────────────┐
# │ 规则名                 │ ATT&CK ID         │
# ├────────────────────────┼───────────────────┤
# │ PowerShell Base64 Exec │ T1059.001         │
# │ LSASS Access Detection │ T1003.001         │
# │ Scheduled Task Created │ T1053.005         │
# │ Reverse Shell Detected │ T1059             │
# │ DNS Tunnel Detected    │ T1572             │
# │ SMB Lateral Movement   │ T1021.002         │
# └────────────────────────┴───────────────────┘

# Step 3: 在 Navigator 中标注
# 绿色 = 已覆盖 (有检测规则)
# 黄色 = 部分覆盖 (有规则但覆盖不全)
# 红色 = 未覆盖 (安全盲区!)
# → 红色区域 = 优先补检测规则

# Step 4: 对比威胁组织
# 导入已知 APT 组织的 TTP:
# APT29 (Cozy Bear) 常用: T1566, T1059, T1003, T1041
# APT28 (Fancy Bear) 常用: T1190, T1055, T1547, T1027
# Lazarus Group 常用:     T1566, T1059, T1071, T1486
#
# 对比你的覆盖率 vs APT 组织的 TTP
# → 找到最危险的差距 → 优先修补

# ━━━━ Sigma 规则: 跨平台检测语言 ━━━━
# Sigma = SIEM 界的 "YARA"
# 写一次 → 转换到 Splunk/ELK/QRadar/...

# Sigma 规则示例: 检测 Mimikatz
title: Mimikatz Usage via LSASS Access
id: 0d4a6e5c-4210-11ea-b77f-2e728ce88125
status: stable
level: critical
description: 检测通过访问 LSASS 进程窃取凭证
references:
  - https://attack.mitre.org/techniques/T1003/001/
author: Blue Team
date: 2025/01/15
tags:
  - attack.credential_access
  - attack.t1003.001
logsource:
  category: process_access
  product: windows
detection:
  selection:
    TargetImage|endswith: '\\lsass.exe'
    GrantedAccess|contains:
      - '0x1010'
      - '0x1410'
      - '0x1438'
  filter:
    SourceImage|endswith:
      - '\\svchost.exe'
      - '\\MsMpEng.exe'
      - '\\csrss.exe'
  condition: selection and not filter

# 转换到 Splunk SPL:
# sigma convert -t splunk -p sysmon rule.yml
# → 生成: 
# index=sysmon EventCode=10 
#   TargetImage="*\\lsass.exe" 
#   GrantedAccess IN ("0x1010","0x1410","0x1438")
#   NOT SourceImage IN ("*\\svchost.exe","*\\MsMpEng.exe")

# ━━━━ 威胁情报成熟度模型 ━━━━
# Level 1: 反应式 (只用免费 IOC Feed)
# Level 2: 基础 (STIX/TAXII 自动化 + MISP)
# Level 3: 战术 (ATT&CK 映射 + 覆盖率分析)
# Level 4: 战略 (威胁狩猎 + 行业协作)
# Level 5: 预测 (APT 归因 + 攻击预测)`}</div>
            </div>

            <div className="bt-grid-4">
              {[
                { v: '14', l: 'ATT&CK 战术 (Tactic)', color: 'var(--bt-blue)' },
                { v: '201+', l: 'ATT&CK 技术 (Technique)', color: 'var(--bt-green)' },
                { v: '143+', l: '已知 APT 组织', color: 'var(--bt-red)' },
                { v: 'Sigma', l: '跨平台检测语言', color: 'var(--bt-amber)' },
              ].map((s, i) => (
                <div key={i} className="bt-metric">
                  <div className="bt-metric-val" style={{ color: s.color }}>{s.v}</div>
                  <div className="bt-metric-label">{s.l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
