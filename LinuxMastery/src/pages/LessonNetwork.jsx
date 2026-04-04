import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TerminalBlock = ({ title = 'bash', lines }) => (
  <div className="terminal-block">
    <div className="terminal-topbar">
      <span className="terminal-dot red" /><span className="terminal-dot amber" /><span className="terminal-dot green" />
      <span className="terminal-title">{title}</span>
    </div>
    <div className="terminal-body">
      {lines.map((l, i) => <div key={i} dangerouslySetInnerHTML={{ __html: l }} />)}
    </div>
  </div>
);

const NETWORK_LAYERS = [
  { layer: '7 应用层', examples: 'HTTP/HTTPS, DNS, SSH, FTP, SMTP', tools: 'curl, wget, dig, nc' },
  { layer: '4 传输层', examples: 'TCP (可靠), UDP (快速)', tools: 'ss, netstat, tcpdump' },
  { layer: '3 网络层', examples: 'IP, ICMP, ARP', tools: 'ip, ping, traceroute, arp' },
  { layer: '2 数据链路层', examples: 'Ethernet, MAC 地址', tools: 'ip link, ethtool' },
  { layer: '1 物理层', examples: '电缆, 光纤, 无线', tools: 'ethtool, dmesg' },
];

const DIAG_TOOLS = [
  { cmd: 'ip addr show', desc: '查看所有网卡和 IP 地址（取代 ifconfig）' },
  { cmd: 'ip route show', desc: '查看路由表（取代 route -n）' },
  { cmd: 'ss -tunlp', desc: '查看所有监听端口和占用进程（取代 netstat）' },
  { cmd: 'ping -c4 8.8.8.8', desc: '测试网络连通性（ICMP）' },
  { cmd: 'traceroute 8.8.8.8', desc: '追踪数据包路径（每一跳）' },
  { cmd: 'dig google.com', desc: 'DNS 解析详情，查看 A/AAAA/MX/CNAME 记录' },
  { cmd: 'curl -I https://site', desc: '只查看 HTTP 响应头（调试 Web）' },
  { cmd: 'tcpdump -i eth0 port 80', desc: '抓包分析（指定接口+端口）' },
  { cmd: 'nmap -sV -p 1-1000 host', desc: '端口扫描+服务版本探测' },
  { cmd: 'iperf3 -s / -c host', desc: '网络带宽测试（服务端/客户端）' },
  { cmd: 'mtr 8.8.8.8', desc: '实时路由追踪+丢包率监控（ping+traceroute合体）' },
  { cmd: 'nethogs', desc: '按进程显示实时网络带宽占用' },
];

// iptables rule builder
function IptablesBuilder() {
  const [chain, setChain] = useState('INPUT');
  const [action, setAction] = useState('ACCEPT');
  const [proto, setProto] = useState('tcp');
  const [port, setPort] = useState('80');
  const [src, setSrc] = useState('');

  const rule = `iptables -A ${chain} ${src ? `-s ${src} ` : ''}-p ${proto} --dport ${port} -j ${action}`;

  return (
    <div className="glass-panel">
      <h4 style={{ marginBottom: '1.25rem' }}>🛡️ iptables 规则构建器</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: '链 (Chain)', val: chain, set: setChain, opts: ['INPUT', 'OUTPUT', 'FORWARD'] },
          { label: '动作 (Action)', val: action, set: setAction, opts: ['ACCEPT', 'DROP', 'REJECT', 'LOG'] },
          { label: '协议', val: proto, set: setProto, opts: ['tcp', 'udp', 'icmp'] },
        ].map(f => (
          <div key={f.label}>
            <label style={{ color: '#4a6a4a', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem', fontFamily: 'JetBrains Mono,monospace' }}>{f.label}</label>
            <select value={f.val} onChange={e => f.set(e.target.value)}
              style={{ width: '100%', background: '#020d02', border: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', padding: '0.4rem', borderRadius: '4px', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.82rem' }}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div>
          <label style={{ color: '#4a6a4a', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem', fontFamily: 'JetBrains Mono,monospace' }}>目标端口</label>
          <input value={port} onChange={e => setPort(e.target.value)}
            style={{ width: '100%', background: '#020d02', border: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', padding: '0.4rem', borderRadius: '4px', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.82rem' }} />
        </div>
        <div>
          <label style={{ color: '#4a6a4a', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem', fontFamily: 'JetBrains Mono,monospace' }}>来源 IP（可空）</label>
          <input value={src} onChange={e => setSrc(e.target.value)} placeholder="192.168.1.0/24"
            style={{ width: '100%', background: '#020d02', border: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', padding: '0.4rem', borderRadius: '4px', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.82rem' }} />
        </div>
      </div>
      <div style={{ background: '#010801', borderRadius: '6px', padding: '1rem', border: '1px solid rgba(0,255,65,0.25)', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.85rem' }}>
        <span style={{ color: '#4a6a4a' }}># 生成的规则：</span><br />
        <span style={{ color: '#00ff41' }}>{rule}</span>
      </div>
      <div className="info-box tip" style={{ marginTop: '1rem' }}>
        💡 规则说明：在 <strong>{chain}</strong> 链上，{src ? `来自 ${src} 的` : '所有'}通过 <strong>{proto}</strong> 协议到达端口 <strong>{port}</strong> 的流量 → <strong style={{ color: action === 'ACCEPT' ? '#00ff41' : '#ff4444' }}>{action}</strong>
      </div>
    </div>
  );
}

const FIREWALL_SCENARIOS = [
  {
    name: '允许 SSH（安全）',
    lines: [
      '<span class="t-comment"># 仅允许特定 IP 段通过 SSH</span>',
      '<span class="t-prompt">#</span> iptables <span class="t-flag">-A</span> INPUT <span class="t-flag">-s</span> 10.0.0.0/8 <span class="t-flag">-p</span> tcp <span class="t-flag">--dport</span> 22 <span class="t-flag">-j</span> <span class="t-success">ACCEPT</span>',
      '<span class="t-prompt">#</span> iptables <span class="t-flag">-A</span> INPUT <span class="t-flag">-p</span> tcp <span class="t-flag">--dport</span> 22 <span class="t-flag">-j</span> <span class="t-error">DROP</span>',
    ]
  },
  {
    name: '限制端口开放',
    lines: [
      '<span class="t-comment"># 只开放 80、443、22，默认拒绝所有入站</span>',
      '<span class="t-prompt">#</span> iptables <span class="t-flag">-P</span> INPUT DROP',
      '<span class="t-prompt">#</span> iptables <span class="t-flag">-A</span> INPUT <span class="t-flag">-m</span> state <span class="t-flag">--state</span> ESTABLISHED,RELATED <span class="t-flag">-j</span> ACCEPT',
      '<span class="t-prompt">#</span> iptables <span class="t-flag">-A</span> INPUT <span class="t-flag">-p</span> tcp <span class="t-flag">-m</span> multiport <span class="t-flag">--dports</span> 22,80,443 <span class="t-flag">-j</span> ACCEPT',
      '<span class="t-prompt">#</span> iptables <span class="t-flag">-A</span> INPUT <span class="t-flag">-i</span> lo <span class="t-flag">-j</span> ACCEPT  <span class="t-comment"># 允许 loopback</span>',
    ]
  },
  {
    name: 'NAT / 端口转发',
    lines: [
      '<span class="t-comment"># SNAT: 内网机器通过网关访问外网（共享 IP）</span>',
      '<span class="t-prompt">#</span> iptables <span class="t-flag">-t nat -A</span> POSTROUTING <span class="t-flag">-o</span> eth0 <span class="t-flag">-j</span> MASQUERADE',
      '',
      '<span class="t-comment"># DNAT: 外网访问网关 8080 → 内网 192.168.1.100:80</span>',
      '<span class="t-prompt">#</span> iptables <span class="t-flag">-t nat -A</span> PREROUTING <span class="t-flag">-p</span> tcp <span class="t-flag">--dport</span> 8080 <span class="t-flag">-j</span> DNAT <span class="t-flag">--to-destination</span> 192.168.1.100:80',
    ]
  },
];

export default function LessonNetwork() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState(0);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">$ module_05 — 网络与防火墙</div>
        <h1>掌控每一个数据包</h1>
        <p className="lesson-intro">
          网络是运维的命脉。能看懂 TCP 四次挥手、能写 iptables 规则、能用 tcpdump 抓包分析，你就具备了<strong style={{ color: '#00ff41' }}>穿透任何网络问题</strong>的能力。
        </p>
      </header>

      {/* TCP/IP Layers */}
      <section className="lesson-section">
        <h3>🌐 TCP/IP 协议栈：从应用到物理</h3>
        <div className="space-y-2" style={{ marginBottom: '1.25rem' }}>
          {NETWORK_LAYERS.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', borderRadius: '6px',
              background: `rgba(0,${i * 30 + 30},0,0.3)`, border: '1px solid rgba(0,255,65,0.1)', alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{ color: '#00ff41', fontSize: '0.8rem' }}>{l.layer}</code>
              <span style={{ color: '#7a9c7a', fontSize: '0.8rem' }}>{l.examples}</span>
              <span style={{ color: '#00e5ff', fontSize: '0.78rem', fontFamily: 'JetBrains Mono,monospace' }}>{l.tools}</span>
            </div>
          ))}
        </div>
        <TerminalBlock title="TCP 连接状态分析" lines={[
          '<span class="t-comment"># 查看所有 TCP 连接状态统计</span>',
          '<span class="t-prompt">$</span> ss <span class="t-flag">-s</span>',
          '<span class="t-output">Total: 2048 (kernel 2134)</span>',
          '<span class="t-output">TCP:   1920 (estab 1800, closed 80, orphaned 12, timewait 28)</span>',
          '',
          '<span class="t-comment"># 查看哪些进程监听了哪些端口</span>',
          '<span class="t-prompt">$</span> ss <span class="t-flag">-tunlp</span>',
          '<span class="t-output">Netid  State  Recv-Q  Send-Q  Local Address:Port  Process</span>',
          '<span class="t-output">tcp    LISTEN 0       128     0.0.0.0:22         users:("sshd",pid=856)</span>',
          '<span class="t-output">tcp    LISTEN 0       511     0.0.0.0:80         users:("nginx",pid=987)</span>',
          '<span class="t-output">tcp    LISTEN 0       128     127.0.0.1:5432     users:("postgres",pid=1023)</span>',
          '',
          '<span class="t-comment"># TIME_WAIT 过多时（短连接场景）</span>',
          '<span class="t-prompt">#</span> echo <span class="t-string">30</span> > <span class="t-path">/proc/sys/net/ipv4/tcp_fin_timeout</span>',
          '<span class="t-prompt">#</span> echo <span class="t-string">1</span>  > <span class="t-path">/proc/sys/net/ipv4/tcp_tw_reuse</span>',
        ]} />
      </section>

      {/* DNS */}
      <section className="lesson-section">
        <h3>🔍 DNS 解析：把名字变成地址</h3>
        <TerminalBlock title="DNS 深度诊断" lines={[
          '<span class="t-comment"># 完整 DNS 解析链</span>',
          '<span class="t-prompt">$</span> dig <span class="t-flag">+trace</span> google.com',
          '<span class="t-output">. 518400 IN NS a.root-servers.net.</span>',
          '<span class="t-output">com. 172800 IN NS a.gtld-servers.net.</span>',
          '<span class="t-output">google.com. 300 IN A 142.250.80.46</span>',
          '',
          '<span class="t-comment"># 查询特定记录类型</span>',
          '<span class="t-prompt">$</span> dig google.com <span class="t-flag">MX</span>   <span class="t-comment"># 邮件服务器</span>',
          '<span class="t-prompt">$</span> dig google.com <span class="t-flag">TXT</span>  <span class="t-comment"># SPF/DKIM 记录</span>',
          '<span class="t-prompt">$</span> dig <span class="t-flag">-x</span> 8.8.8.8    <span class="t-comment"># 反向解析（PTR）</span>',
          '',
          '<span class="t-comment"># 测试特定 DNS 服务器</span>',
          '<span class="t-prompt">$</span> dig <span class="t-flag">@1.1.1.1</span> google.com',
          '',
          '<span class="t-comment"># 本地 DNS 配置</span>',
          '<span class="t-prompt">$</span> cat <span class="t-path">/etc/resolv.conf</span>',
          '<span class="t-output">nameserver 8.8.8.8</span>',
          '<span class="t-output">nameserver 8.8.4.4</span>',
          '<span class="t-output">search example.com</span>',
        ]} />
      </section>

      {/* Firewall */}
      <section className="lesson-section">
        <h3>🛡️ iptables 防火墙：规则构建器</h3>
        <div className="info-box note" style={{ marginBottom: '1rem' }}>
          📌 iptables 处理数据包的顺序：数据包 → PREROUTING → 路由决策 → INPUT/FORWARD → 业务 → OUTPUT → POSTROUTING。规则按顺序匹配，第一条匹配即执行。
        </div>
        <IptablesBuilder />
      </section>

      {/* Firewall Scenarios */}
      <section className="lesson-section">
        <h3>⚔️ 常见防火墙场景（点击切换）</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {FIREWALL_SCENARIOS.map((s, i) => (
            <button key={i} onClick={() => setActiveScenario(i)}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', cursor: 'pointer',
                background: activeScenario === i ? 'rgba(0,255,65,0.12)' : 'rgba(0,255,65,0.04)',
                border: `1px solid ${activeScenario === i ? 'rgba(0,255,65,0.4)' : 'rgba(0,255,65,0.12)'}`,
                color: activeScenario === i ? '#00ff41' : '#4a6a4a' }}>
              {s.name}
            </button>
          ))}
        </div>
        <TerminalBlock title={FIREWALL_SCENARIOS[activeScenario].name} lines={FIREWALL_SCENARIOS[activeScenario].lines} />
      </section>

      {/* Diagnostic Tools */}
      <section className="lesson-section">
        <h3>🔧 网络诊断工具速查</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {DIAG_TOOLS.map(t => (
            <div key={t.cmd} className="linux-card">
              <code style={{ color: '#00ff41', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>{t.cmd}</code>
              <p style={{ color: '#4a6a4a', fontSize: '0.78rem' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/linux-mastery/lesson/storage')}>
          $ cd next_chapter  # 存储管理 →
        </button>
      </section>
    </div>
  );
}
