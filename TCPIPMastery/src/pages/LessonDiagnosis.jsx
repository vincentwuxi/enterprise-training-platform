import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TOOLS = [
  {
    name: 'ping',
    desc: '测试主机可达性和往返时延（RTT），基于 ICMP Echo Request/Reply',
    color: '#10b981',
    usages: [
      { cmd: 'ping google.com', desc: '持续 ping，测试连通性' },
      { cmd: 'ping -c 4 8.8.8.8', desc: '发送 4 个包后停止' },
      { cmd: 'ping -s 1400 192.168.1.1', desc: '指定包大小，测试 MTU' },
      { cmd: 'ping -i 0.2 host', desc: '每 0.2 秒发一个（洪水测试）' },
    ],
    output: `PING google.com (142.250.185.78) 56 bytes of data
64 bytes from 142.250.185.78: icmp_seq=1 ttl=118 time=12.3 ms
64 bytes from 142.250.185.78: icmp_seq=2 ttl=118 time=11.8 ms
64 bytes from 142.250.185.78: icmp_seq=3 ttl=118 time=12.1 ms

--- google.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 11.8/12.1/12.3/0.2 ms`,
  },
  {
    name: 'traceroute',
    desc: '追踪数据包从本机到目标的路由路径，利用 TTL 递增触发每跳返回 ICMP Timeout',
    color: '#0ea5e9',
    usages: [
      { cmd: 'traceroute google.com', desc: '追踪路由路径' },
      { cmd: 'traceroute -n 8.8.8.8', desc: '不解析IP为主机名（更快）' },
      { cmd: 'mtr google.com', desc: '实时路由追踪（推荐！）' },
    ],
    output: `traceroute to google.com (142.250.185.78), 30 hops max
 1  192.168.1.1    1.2 ms   1.0 ms   0.9 ms   # 家庭路由器
 2  100.64.0.1     5.1 ms   4.8 ms   5.2 ms   # 运营商 CGNAT
 3  10.0.0.1      10.2 ms  10.5 ms  10.1 ms   # 运营商骨干
 4  203.208.x.x   12.3 ms  12.1 ms  12.4 ms   # Google peering
 5  142.250.x.x   12.0 ms  11.8 ms  12.2 ms   # Google 内网
 6  142.250.185.78 12.1 ms  12.3 ms  12.0 ms  # 目标`,
  },
  {
    name: 'netstat / ss',
    desc: '查看网络连接状态、监听端口、路由表（ss 是 netstat 的现代替代）',
    color: '#a78bfa',
    usages: [
      { cmd: 'ss -tlnp', desc: '查看所有 TCP 监听端口（+进程名）' },
      { cmd: 'ss -anp | grep :80', desc: '查看 80 端口连接情况' },
      { cmd: 'ss -s', desc: '连接状态统计汇总' },
      { cmd: 'netstat -rn', desc: '查看路由表' },
    ],
    output: `$ ss -tlnp
State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
LISTEN  0       128     0.0.0.0:22          0.0.0.0:*          sshd
LISTEN  0       511     0.0.0.0:80          0.0.0.0:*          nginx
LISTEN  0       511     0.0.0.0:443         0.0.0.0:*          nginx
LISTEN  0       128     127.0.0.1:3306      0.0.0.0:*          mysqld
LISTEN  0       128     127.0.0.1:6379      0.0.0.0:*          redis`,
  },
  {
    name: 'tcpdump',
    desc: '命令行抓包神器，捕获并分析网络数据包，适合服务器端诊断',
    color: '#f59e0b',
    usages: [
      { cmd: 'tcpdump -i eth0 port 80', desc: '抓取 eth0 上的 HTTP 流量' },
      { cmd: 'tcpdump -i any host 8.8.8.8', desc: '抓取与 8.8.8.8 的所有通信' },
      { cmd: 'tcpdump -w traffic.pcap', desc: '保存到文件，用 Wireshark 分析' },
      { cmd: "tcpdump 'tcp[tcpflags] & tcp-syn != 0'", desc: '只抓 SYN 包' },
    ],
    output: `$ tcpdump -i eth0 port 80 -n
12:34:01 IP 192.168.1.100.52341 > 93.184.216.34.80: Flags [S], seq 1234567890
12:34:01 IP 93.184.216.34.80 > 192.168.1.100.52341: Flags [S.], seq 987654321, ack 1234567891
12:34:01 IP 192.168.1.100.52341 > 93.184.216.34.80: Flags [.], ack 1
12:34:01 IP 192.168.1.100.52341 > 93.184.216.34.80: Flags [P.], length 78
12:34:01 IP 93.184.216.34.80 > 192.168.1.100.52341: Flags [P.], length 892`,
  },
  {
    name: 'curl / wget',
    desc: '测试 HTTP/HTTPS 接口，查看请求头、响应头、TLS 证书、DNS 解析时间',
    color: '#06b6d4',
    usages: [
      { cmd: 'curl -v https://example.com', desc: '详细输出（含 TLS 握手）' },
      { cmd: 'curl -I https://example.com', desc: '只看响应头（HEAD 请求）' },
      { cmd: "curl -w '%{time_total}\\n' -o /dev/null https://example.com", desc: '测量总请求时间' },
      { cmd: 'curl --resolve example.com:443:1.2.3.4 https://example.com', desc: '绑定 DNS 测试指定 IP' },
    ],
    output: `$ curl -w "\\nDNS: %{time_namelookup}s | TCP: %{time_connect}s | TLS: %{time_appconnect}s | Total: %{time_total}s\\n" \\
       -o /dev/null -s https://google.com

DNS: 0.012s | TCP: 0.023s | TLS: 0.045s | Total: 0.198s`,
  },
  {
    name: 'nmap',
    desc: '网络扫描和端口发现工具，用于网络审计和安全评估',
    color: '#ef4444',
    usages: [
      { cmd: 'nmap -p 80,443 192.168.1.0/24', desc: '扫描内网 80/443 端口' },
      { cmd: 'nmap -sV -O 192.168.1.1', desc: '服务版本 + 操作系统探测' },
      { cmd: 'nmap -sS --open 10.0.0.1', desc: 'SYN 扫描，只显示开放端口' },
      { cmd: 'nmap -p- 192.168.1.100', desc: '扫描全部 65535 端口' },
    ],
    output: `$ nmap -sV 192.168.1.1
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1
80/tcp   open  http       nginx 1.24.0
443/tcp  open  ssl/https  nginx 1.24.0
3306/tcp open  mysql      MySQL 8.0.32

Nmap done: 1 IP address (1 host up) scanned in 8.42 seconds`,
  },
];

const DIAG_FLOWCHART = [
  { q: '能 ping 通网关（192.168.1.1）吗？', yes: '↓ 继续', no: '→ 检查网线/Wi-Fi、IP配置（ip addr）、路由表（ip route）' },
  { q: '能 ping 通外网 IP（8.8.8.8）吗？', yes: '↓ 继续', no: '→ 问题在路由/NAT层，检查网关配置、运营商连接' },
  { q: '能解析域名（nslookup google.com）吗？', yes: '↓ 继续', no: '→ DNS 问题，检查 /etc/resolv.conf，换 DNS 服务器' },
  { q: 'curl/wget 能访问 HTTPS 吗？', yes: '✅ 网络正常', no: '→ TLS/证书问题，或目标服务器故障' },
];

export default function LessonDiagnosis() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [diagStep, setDiagStep] = useState(-1);

  return (
    <div className="lesson-net">
      <div className="net-badge">🔧 module_08 — 网络诊断与运维</div>

      <div className="net-hero">
        <h1>网络诊断：像专家一样排错</h1>
        <p>网络工程师最核心的技能不是记协议，而是<strong>系统化排查问题</strong>。掌握这 6 个工具，90% 的网络问题都能定位。</p>
      </div>

      {/* 工具选择 */}
      <div className="net-section">
        <h2 className="net-section-title">🛠️ 诊断工具详解（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {TOOLS.map(t => (
            <button key={t.name}
              className={`net-btn ${activeTool?.name === t.name ? 'primary' : ''}`}
              onClick={() => setActiveTool(t)}
              style={activeTool?.name === t.name ? {} : { borderColor: t.color + '40', color: t.color }}>
              {t.name}
            </button>
          ))}
        </div>

        {activeTool && (
          <div className="net-interactive">
            <h3 style={{ color: activeTool.color }}>{activeTool.name}</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.25rem' }}>{activeTool.desc}</p>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>常用命令</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {activeTool.usages.map((u, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                    <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: activeTool.color, whiteSpace: 'nowrap', flex: '0 0 auto' }}>{u.cmd}</code>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>— {u.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>示例输出</div>
              <div className="net-code">{activeTool.output}</div>
            </div>
          </div>
        )}
      </div>

      {/* 诊断流程图 */}
      <div className="net-section">
        <h2 className="net-section-title">🗺️ 网络故障诊断流程图</h2>
        <div className="net-interactive">
          <h3 style={{ justifyContent: 'space-between' }}>
            💡 逐步排查（从底层到上层）
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <button className="net-btn" onClick={() => setDiagStep(-1)}>重置</button>
              <button className="net-btn primary" onClick={() => setDiagStep(s => Math.min(DIAG_FLOWCHART.length - 1, s + 1))} disabled={diagStep >= DIAG_FLOWCHART.length - 1}>
                {diagStep < 0 ? '▶ 开始排查' : diagStep >= DIAG_FLOWCHART.length - 1 ? '完成' : '下一步'}
              </button>
            </div>
          </h3>
          <div className="net-steps">
            {DIAG_FLOWCHART.map((s, i) => (
              <div key={i} className="net-step" style={{ opacity: i <= diagStep ? 1 : 0.3, transition: 'opacity 0.3s', borderColor: i <= diagStep ? 'rgba(14,165,233,0.3)' : undefined }}>
                <div className="step-num">{i + 1}</div>
                <div className="step-content">
                  <h4>{s.q}</h4>
                  {i <= diagStep && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: '#34d399' }}>✅ 是: {s.yes}</span>
                      <span style={{ fontSize: '0.78rem', color: '#f87171' }}>❌ 否: {s.no}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wireshark 过滤器速查 */}
      <div className="net-section">
        <h2 className="net-section-title">🦈 Wireshark 常用过滤器速查</h2>
        <div className="net-card">
          <div className="net-code">{`# 按协议过滤
http          # HTTP 流量
dns           # DNS 查询
tcp           # 所有 TCP
tls           # TLS/HTTPS

# 按 IP 过滤
ip.addr == 192.168.1.100         # 与该 IP 的所有通信
ip.src == 10.0.0.1               # 从该 IP 发出的包
ip.dst == 8.8.8.8                # 发往该 IP 的包

# 按端口过滤
tcp.port == 443                  # HTTPS 端口
tcp.dstport == 80                # 目标端口 80

# 按 TCP flag 过滤
tcp.flags.syn == 1               # 只看 SYN 包
tcp.flags.reset == 1             # 只看 RST（连接重置）

# 复合过滤
http && ip.addr == 93.184.216.34 # HTTP 且特定 IP
tcp.flags.syn==1 && !tcp.flags.ack==1  # 只看 SYN 不看 SYN-ACK`}</div>
        </div>
      </div>

      {/* 课程总结 */}
      <div className="net-section">
        <div className="net-card" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(6,182,212,0.06))', borderColor: 'rgba(14,165,233,0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#38bdf8' }}>🎓 课程完成！你已掌握的技能</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              '✅ 理解互联网分组交换原理',
              '✅ 掌握 OSI 7层 / TCP/IP 4层模型',
              '✅ IP 子网划分与 CIDR 计算',
              '✅ TCP 三次握手 / 四次挥手',
              '✅ 知道何时选 TCP vs UDP',
              '✅ HTTP/DNS/TLS/DHCP 工作原理',
              '✅ 识别常见网络攻击与防御',
              '✅ 用专业工具诊断网络故障',
            ].map((s, i) => (
              <div key={i} style={{ fontSize: '0.875rem', color: '#94a3b8', padding: '0.4rem 0' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="net-nav">
        <button className="net-btn" onClick={() => navigate('/course/tcpip-mastery/lesson/security')}>← 上一模块</button>
        <button className="net-btn primary" onClick={() => navigate('/course/tcpip-mastery')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
