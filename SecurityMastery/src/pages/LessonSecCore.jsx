import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const MODELS = [
  {
    name: 'CIA 三要素', color: '#f87171',
    items: [
      { icon: '🔒', name: 'Confidentiality（机密性）', desc: '确保信息只被授权的人访问', attack: '窃听/SQL注入/未加密传输', defense: '加密/访问控制/TLS' },
      { icon: '✅', name: 'Integrity（完整性）', desc: '确保信息不被未经授权地篡改', attack: 'MITM中间人/参数篡改/文件替换', defense: 'HMAC签名/数字证书/哈希校验' },
      { icon: '📡', name: 'Availability（可用性）', desc: '确保系统对授权用户正常提供服务', attack: 'DDoS/勒索病毒/资源耗尽', defense: 'CDN/WAF/限流/多活架构' },
    ],
  },
  {
    name: 'STRIDE 威胁模型', color: '#f97316',
    items: [
      { icon: '🎭', name: 'Spoofing（欺骗）', desc: '伪装成其他用户或系统', attack: 'Cookie 伪造/IP 欺骗/钓鱼邮件', defense: '多因素认证/数字签名' },
      { icon: '✏️', name: 'Tampering（篡改）', desc: '修改传输中或存储的数据', attack: '参数篡改/MITM/SQL注入', defense: 'HTTPS/签名/参数化查询' },
      { icon: '🚫', name: 'Repudiation（抵赖）', desc: '否认执行过某操作', attack: '删除日志/伪造时间戳', defense: '不可篡改审计日志/时间戳服务' },
      { icon: '👁️', name: 'Info Disclosure（信息泄露）', desc: '将信息暴露给未授权访问者', attack: '错误信息泄漏/目录遍历', defense: '最小权限/脱敏/安全错误页' },
      { icon: '💥', name: 'Denial of Service（拒绝服务）', desc: '使系统对合法用户不可用', attack: 'DDoS/Slowloris/资源耗尽', defense: 'WAF/限流/Circuit Breaker' },
      { icon: '🔑', name: 'Elevation of Privilege（权限提升）', desc: '获取超出授权的访问级别', attack: 'CSRF/目录穿越/提权漏洞', defense: 'RBAC/最小权限/沙箱' },
    ],
  },
  {
    name: '攻击生命周期', color: '#a78bfa',
    items: [
      { icon: '🔍', name: '1. 侦察（Reconnaissance）', desc: '信息收集：whois/nmap/子域名枚举/社会工程学', attack: 'passive OSINT/主动扫描', defense: '减少信息暴露/蜜罐告警' },
      { icon: '🎯', name: '2. 武器化（Weaponization）', desc: '制作利用工具：Payload/漏洞利用代码', attack: 'Metasploit/自定义Exploit', defense: '软件供应链安全' },
      { icon: '📧', name: '3. 投递（Delivery）', desc: '将武器送达目标：钓鱼/水坑/USB', attack: '鱼叉式钓鱼邮件', defense: '安全意识培训/邮件网关' },
      { icon: '💣', name: '4. 利用（Exploitation）', desc: '触发漏洞执行攻击者代码', attack: '零日漏洞/已知CVE', defense: '及时打补丁/代码审计' },
      { icon: '🏠', name: '5. 驻留（Installation）', desc: '建立持久化后门/Rootkit', attack: 'Webshell/计划任务/注册表', defense: 'EDR/文件完整性监控' },
      { icon: '📡', name: '6. C2（Command & Control）', desc: '建立与攻击者服务器的通信', attack: 'DNS隧道/HTTPS C2', defense: 'DNS过滤/流量分析/出站限制' },
      { icon: '💰', name: '7. 目标达成（Action on Objectives）', desc: '数据窃取/勒索/破坏', attack: '数据外泄/加密勒索', defense: 'DLP/备份/事件响应计划' },
    ],
  },
];

const ATTACK_SIMULATION = [
  { type: '端口扫描', cmd: 'nmap -sV -sC -p- --min-rate 5000 192.168.1.100', note: '发现开放的端口和服务版本（仅限授权目标）' },
  { type: '漏洞扫描', cmd: 'nmap --script vuln 192.168.1.100', note: '自动检测已知 NSE 脚本漏洞' },
  { type: '目录枚举', cmd: 'gobuster dir -u http://192.168.1.100 -w /usr/share/seclists/Discovery/Web-Content/common.txt', note: '发现隐藏路径（admin面板/备份文件等）' },
  { type: '子域名枚举', cmd: 'subfinder -d example.com | httpx -status-code -title', note: '发现可能被遗忘的子域名资产' },
  { type: 'WAF 探测', cmd: 'wafw00f http://192.168.1.100', note: '识别目标是否部署了 WAF 及其类型' },
];

export default function LessonSecCore() {
  const navigate = useNavigate();
  const [activeModel, setActiveModel] = useState(0);
  const [activeSim, setActiveSim] = useState(0);

  const m = MODELS[activeModel];

  return (
    <div className="lesson-sec">
      <div className="sec-badge">🔒 module_01 — 安全基础</div>

      <div className="sec-disclaimer">
        ⚠️ <span>本课程所有攻击技术仅用于<strong>授权测试环境</strong>（CTF/靶机/经书面许可的系统）。未经授权的渗透测试违反法律，请知悉。</span>
      </div>

      <div className="sec-hero">
        <h1>安全基础：攻防思维与网络安全模型</h1>
        <p>优秀的安全工程师必须<strong>像攻击者一样思考</strong>——理解攻击面、威胁模型和攻击生命周期，防御才能有的放矢。本模块建立攻防世界观的底层框架。</p>
      </div>

      {/* 三大安全模型 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🎯 三大安全模型（切换查看）</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {MODELS.map((m, i) => (
            <button key={m.name} onClick={() => setActiveModel(i)}
              style={{ flex: 1, minWidth: 150, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, transition: 'all 0.2s',
                border: `1px solid ${activeModel === i ? m.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeModel === i ? `${m.color}10` : 'rgba(255,255,255,0.02)',
                color: activeModel === i ? m.color : '#5a1a1a' }}>
              {m.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {m.items.map((item, i) => (
            <div key={i} style={{ padding: '0.875rem 1rem', borderRadius: '10px', border: `1px solid rgba(255,255,255,0.05)`, background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: m.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#5a1a1a', marginBottom: '0.35rem' }}>{item.desc}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: '#f87171' }}>⚔️ 攻：{item.attack}</span>
                  <span style={{ fontSize: '0.72rem', color: '#22c55e' }}>🛡 防：{item.defense}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 侦察工具命令演示 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🔍 侦察阶段：常用命令（仅限授权环境）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {ATTACK_SIMULATION.map((s, i) => (
            <button key={i} onClick={() => setActiveSim(i)}
              style={{ padding: '0.45rem 0.875rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                border: `1px solid ${activeSim === i ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.07)'}`,
                background: activeSim === i ? 'rgba(220,38,38,0.1)' : 'rgba(255,255,255,0.02)',
                color: activeSim === i ? '#f87171' : '#5a1a1a' }}>{s.type}</button>
          ))}
        </div>
        <div className="sec-terminal">
          <div className="sec-terminal-header">
            <div className="sec-terminal-dot" style={{ background: '#ef4444' }} />
            <div className="sec-terminal-dot" style={{ background: '#f59e0b' }} />
            <div className="sec-terminal-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: '#22c55e' }}>kali@pentester:~$  {ATTACK_SIMULATION[activeSim].type}</span>
          </div>
          <div className="sec-terminal-body">
            <span className="sec-prompt">kali@kali:~$ </span><span className="sec-attack">{ATTACK_SIMULATION[activeSim].cmd}</span>{'\n\n'}
            <span style={{ color: '#fbbf24' }}>💡 {ATTACK_SIMULATION[activeSim].note}</span>{'\n\n'}
            <span className="sec-success">[i] 重要：以上命令仅在以下场景合法使用：{'\n'}  ✅ 自己搭建的靶机环境（HackTheBox/VulnHub）{'\n'}  ✅ 企业授权的渗透测试（书面授权文件）{'\n'}  ✅ CTF 竞赛指定范围内{'\n'}  ❌ 对任何未经授权的系统使用均违法</span>
          </div>
        </div>
      </div>

      {/* 攻防技能树 */}
      <div className="sec-section">
        <h2 className="sec-section-title">📊 白帽安全工程师技能矩阵</h2>
        <div className="sec-grid-3">
          {[
            { area: 'Web 安全', skills: ['OWASP Top 10', 'Burp Suite', 'SQL/XSS/CSRF', 'API 安全'], color: '#f87171' },
            { area: '网络渗透', skills: ['Nmap/Wireshark', 'Metasploit', '协议分析', '内网渗透'], color: '#f97316' },
            { area: '密码学', skills: ['哈希破解', 'TLS/SSL', '对称/非对称', 'PKI证书链'], color: '#a78bfa' },
            { area: '权限提升', skills: ['Linux PrivEsc', 'Windows AD', 'SUID/Cron 利用', 'Pass-the-Hash'], color: '#fbbf24' },
            { area: '安全加固', skills: ['WAF/IDS部署', '零信任架构', '安全编码审查', 'DevSecOps'], color: '#22c55e' },
            { area: '应急响应', skills: ['日志分析', '恶意流量识别', '取证溯源', 'DFIR流程'], color: '#38bdf8' },
          ].map(a => (
            <div key={a.area} className="sec-card" style={{ borderColor: `${a.color}20`, padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: a.color, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{a.area}</div>
              {a.skills.map(s => <div key={s} style={{ fontSize: '0.78rem', color: '#5a1a1a', marginBottom: '0.15rem' }}>• {s}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="sec-nav">
        <div />
        <button className="sec-btn attack" onClick={() => navigate('/course/security-pentest/lesson/web-sec')}>下一模块：OWASP Top 10 →</button>
      </div>
    </div>
  );
}
