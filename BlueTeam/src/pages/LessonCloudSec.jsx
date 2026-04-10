import { useState } from 'react';
import './LessonCommon.css';

const CODE_AWS = `# ━━━━ AWS 云安全 ━━━━

# ━━━━ 1. CloudTrail（API 审计日志）━━━━
# 记录所有 AWS API 调用 → 安全审计的基石
# 谁在什么时间从哪里做了什么操作

# 关键检测场景：
# 1. Root 账户登录（应该永远不用）
aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \\
  --query 'Events[?contains(CloudTrailEvent, \`"userIdentity":{"type":"Root"\`)]'

# 2. 安全组开放 0.0.0.0/0（最常见配置错误）
# EventName: AuthorizeSecurityGroupIngress
# 检查：sourceIPRange 包含 "0.0.0.0/0"

# 3. IAM 策略变更（权限提升）
# EventName: AttachUserPolicy / PutRolePolicy
# 检查：是否附加了 AdministratorAccess

# ━━━━ 2. GuardDuty（威胁检测）━━━━
# 自动分析 CloudTrail / VPC Flow Logs / DNS Logs
# 无需配置规则，ML 驱动的威胁检测

# 常见告警类型：
# Recon:EC2/PortProbeUnprotectedPort → 端口扫描
# UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration → 凭证泄露
# Trojan:EC2/BlackholeTraffic → EC2 连接黑洞 IP
# CryptoCurrency:EC2/BitcoinTool.B → 挖矿程序

# ━━━━ 3. IAM 最小权限原则 ━━━━
# ❌ 反模式：
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}

# ✅ 最小权限：
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject"
  ],
  "Resource": "arn:aws:s3:::my-bucket/uploads/*",
  "Condition": {
    "StringEquals": { "aws:PrincipalTag/team": "engineering" },
    "IpAddress": { "aws:SourceIp": "10.0.0.0/8" }
  }
}

# IAM Access Analyzer：自动发现过宽权限
# → "此角色 90 天内未使用 s3:DeleteObject 权限，建议移除"`;

const CODE_AZURE = `# ━━━━ Azure Sentinel / 多云安全 ━━━━

# ━━━━ 1. Azure Sentinel（云原生 SIEM）━━━━
# 集成 M365、Azure AD、AWS、GCP 日志

# KQL 查询：检测暴力破解
SecurityEvent
| where EventID == 4625    // 登录失败
| summarize FailCount=count() by Account, IpAddress, bin(TimeGenerated, 5m)
| where FailCount > 10
| join kind=inner (
    SecurityEvent | where EventID == 4624  // 登录成功
  ) on Account, IpAddress
| project Account, IpAddress, FailCount, SuccessTime=TimeGenerated
// → 先失败 10+ 次，然后成功 = 暴力破解成功

# ━━━━ 2. 多云安全态势管理（CSPM）━━━━
# 工具：Prisma Cloud / Wiz / Orca
# 功能：
# - 自动扫描所有云资源的配置
# - 与 CIS Benchmark 对比
# - 可视化攻击路径（Attack Path Analysis）
#
# 常见云配置错误（按风险排序）：
# 1. S3 Bucket 公开访问（数据泄露）
# 2. 安全组开放 22/3389 到 0.0.0.0/0
# 3. EC2 实例使用 IMDSv1（SSRF → 凭证窃取）
# 4. CloudTrail 日志未启用
# 5. Root 账户未启用 MFA
# 6. 数据库快照公开共享
# 7. Lambda 函数使用硬编码密钥
# 8. IAM 用户使用长期 Access Key

# ━━━━ 3. 容器安全 ━━━━
# 镜像扫描：Trivy / Snyk / Grype
trivy image --severity CRITICAL,HIGH nginx:latest
# → HIGH: CVE-2024-xxxxx (openssl 1.1.1)

# 运行时安全：Falco（CNCF 项目）
# 检测容器内异常行为
- rule: 容器内执行 Shell
  desc: 检测在容器内启动 shell 进程
  condition: >
    spawned_process and container and
    proc.name in (bash, sh, zsh, dash)
  output: "容器内执行 Shell (container=%container.id command=%proc.cmdline)"
  priority: WARNING
  tags: [container, shell, mitre_execution]`;

export default function LessonCloudSec() {
  const [tab, setTab] = useState('aws');
  const tabs = [
    { key: 'aws',   label: '☁️ AWS 安全', code: CODE_AWS },
    { key: 'azure', label: '🔷 Azure Sentinel & 多云', code: CODE_AZURE },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="bt-lesson">
      <div className="bt-hero">
        <div className="bt-badge">// MODULE 05 · CLOUD SECURITY</div>
        <h1>云安全</h1>
        <p>云上攻击面与传统 IDC 完全不同——<strong>S3 公开泄露、IAM 权限过宽、SSRF→IMDS 凭证窃取是最常见的三大云安全事故</strong>。CloudTrail 审计 + GuardDuty 检测 + IAM 最小权限是 AWS 安全的三板斧。</p>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">☁️ 云安全两大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`bt-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="bt-code-wrap">
          <div className="bt-code-head">
            <div className="bt-code-dot" style={{ background: '#ef4444' }} /><div className="bt-code-dot" style={{ background: '#f59e0b' }} /><div className="bt-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'aws' ? 'aws-security.sh' : 'sentinel.kql'}</span>
          </div>
          <div className="bt-code">{t.code}</div>
        </div>
      </div>

      <div className="bt-section">
        <div className="bt-section-title">⚠️ 云配置错误 Top 8</div>
        <div className="bt-grid-2">
          {[
            { rank: '#1', name: 'S3 Bucket 公开', risk: '数据泄露', color: '#ef4444' },
            { rank: '#2', name: '安全组开放 0.0.0.0/0', risk: '未授权访问', color: '#ef4444' },
            { rank: '#3', name: 'IMDSv1（SSRF 可利用）', risk: '凭证窃取', color: '#f97316' },
            { rank: '#4', name: 'CloudTrail 未启用', risk: '无审计记录', color: '#f97316' },
            { rank: '#5', name: 'Root 无 MFA', risk: '账户接管', color: '#fbbf24' },
            { rank: '#6', name: '数据库快照公开', risk: '数据泄露', color: '#fbbf24' },
            { rank: '#7', name: 'Lambda 硬编码密钥', risk: '凭证泄露', color: '#3b82f6' },
            { rank: '#8', name: '长期 Access Key', risk: '持久化风险', color: '#3b82f6' },
          ].map((c, i) => (
            <div key={i} className="bt-card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.8rem', borderLeft: `3px solid ${c.color}` }}>
              <span className="bt-tag" style={{ background: `${c.color}18`, color: c.color }}>{c.rank}</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--bt-text)', fontSize: '0.85rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--bt-muted)' }}>风险：{c.risk}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
