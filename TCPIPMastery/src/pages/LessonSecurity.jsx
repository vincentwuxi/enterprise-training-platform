import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ATTACKS = [
  {
    id: 'syn_flood',
    name: 'SYN Flood',
    type: '拒绝服务攻击 (DoS)',
    color: '#ef4444',
    desc: '攻击者发送大量伪造 SYN 包，服务器为每个 SYN 分配资源等待 ACK，导致连接队列耗尽，正常用户无法建立连接。',
    defense: 'SYN Cookie（不分配资源直到 ACK）、防火墙速率限制、BGP Anycast 分流',
    layer: '传输层',
  },
  {
    id: 'mitm',
    name: 'Man-in-the-Middle',
    type: '中间人攻击',
    color: '#f59e0b',
    desc: '攻击者插入通信双方之间，解密、查看、篡改数据包后再转发。ARP 欺骗是局域网内 MITM 的常见手段。',
    defense: 'TLS/HTTPS（证书验证）、HSTS（强制 HTTPS）、证书固定（Certificate Pinning）',
    layer: '多层',
  },
  {
    id: 'arp_spoof',
    name: 'ARP 欺骗',
    type: '链路层攻击',
    color: '#a78bfa',
    desc: '攻击者发送伪造 ARP 响应，将目标 IP 与自己的 MAC 关联，使局域网内流量经过攻击者设备。',
    defense: '动态 ARP 检测（DAI）、静态 ARP 条目、802.1X 端口认证',
    layer: '链路层',
  },
  {
    id: 'dns_poison',
    name: 'DNS 投毒',
    type: 'DNS 欺骗',
    color: '#06b6d4',
    desc: '攻击者向 DNS 递归服务器注入伪造记录，把合法域名解析到恶意 IP，用户访问的是假网站。',
    defense: 'DNSSEC（数字签名验证）、DNS over TLS/HTTPS (DoT/DoH)',
    layer: '应用层',
  },
  {
    id: 'port_scan',
    name: '端口扫描',
    type: '侦察攻击',
    color: '#10b981',
    desc: 'Nmap 等工具逐一探测目标主机开放的 TCP/UDP 端口，发现可攻击的服务。SYN 扫描不建立完整连接，更隐蔽。',
    defense: '防火墙白名单策略、IDS 异常检测、端口碰撞（Port Knocking）',
    layer: '传输层',
  },
];

export default function LessonSecurity() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(ATTACKS[0]);

  return (
    <div className="lesson-net">
      <div className="net-badge">🛡️ module_07 — 网络安全</div>

      <div className="net-hero">
        <h1>网络安全攻防：攻击者思维</h1>
        <p>理解攻击才能设计防御。本模块从 TCP/IP 协议设计的固有缺陷出发，分析常见网络攻击的<strong>攻击原理</strong>和<strong>防御方案</strong>。</p>
      </div>

      {/* 攻击类型交互分析 */}
      <div className="net-section">
        <h2 className="net-section-title">⚔️ 常见攻击类型分析</h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* 左侧列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 220 }}>
            {ATTACKS.map(a => (
              <div key={a.id}
                onClick={() => setSelected(a)}
                style={{
                  padding: '0.75rem 1rem',
                  background: selected?.id === a.id ? `${a.color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected?.id === a.id ? a.color + '50' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: selected?.id === a.id ? '#f1f5f9' : '#64748b' }}>{a.name}</div>
                <div style={{ fontSize: '0.72rem', color: a.color, marginTop: '0.2rem' }}>{a.type}</div>
              </div>
            ))}
          </div>

          {/* 右侧详情 */}
          {selected && (
            <div className="net-card" style={{ flex: 1, minWidth: 280, borderColor: `${selected.color}30` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ color: selected.color, margin: 0, fontSize: '1.1rem' }}>{selected.name}</h3>
                <span className="net-tag" style={{ background: `${selected.color}15`, color: selected.color }}>{selected.layer}</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: '1rem' }}>{selected.desc}</p>

              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '0.875rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>🛡️ 防御方案</div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7 }}>{selected.defense}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 防火墙规则 */}
      <div className="net-section">
        <h2 className="net-section-title">🔥 防火墙规则设计原则</h2>
        <div className="net-card">
          <div className="net-code">{`# iptables 典型白名单配置示例
# 默认策略：拒绝所有入站流量
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 允许本地回环
iptables -A INPUT -i lo -j ACCEPT

# 允许已建立的连接回包
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 允许 HTTPS（443）和 SSH（22）
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 --source 192.168.1.0/24 -j ACCEPT

# 防 SYN Flood
iptables -A INPUT -p tcp --syn -m limit --limit 50/s --limit-burst 100 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# 记录被拒绝的流量
iptables -A INPUT -j LOG --log-prefix "DROPPED: " --log-level 7`}</div>
        </div>
      </div>

      {/* 零信任网络 */}
      <div className="net-section">
        <h2 className="net-section-title">🏰 零信任网络架构（Zero Trust）</h2>
        <div className="net-grid-2">
          {[
            { icon: '❌', title: '传统边界安全', desc: '信任内网，不信任外网。一旦攻破边界，内部横向移动无阻碍。VPN 接入即可访问所有资源。' },
            { icon: '✅', title: '零信任原则', desc: '永不信任，始终验证。每次资源访问都需要身份验证 + 设备健康检查 + 最小权限授权。' },
          ].map((c, i) => (
            <div key={i} className="net-card" style={{ borderColor: i === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <h3 style={{ color: i === 0 ? '#f87171' : '#34d399' }}>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 加密算法速查 */}
      <div className="net-section">
        <h2 className="net-section-title">🔑 网络加密算法速查</h2>
        <div className="net-card">
          <table className="net-table">
            <thead><tr><th>算法</th><th>类型</th><th>密钥长度</th><th>用途</th><th>安全性</th></tr></thead>
            <tbody>
              {[
                ['AES-256-GCM', '对称', '256 bit', 'TLS 数据加密', '🟢 强'],
                ['ChaCha20-Poly1305', '对称', '256 bit', 'TLS / QUIC', '🟢 强'],
                ['RSA-2048', '非对称', '2048 bit', '证书签名', '🟡 合格'],
                ['ECDSA P-256', '非对称', '256 bit (EC)', '证书签名', '🟢 强'],
                ['X25519 (ECDH)', '密钥交换', '255 bit', 'TLS 密钥协商', '🟢 强'],
                ['SHA-256', '哈希', '—', 'HMAC, 证书摘要', '🟢 强'],
                ['MD5', '哈希', '—', '已废弃', '🔴 不安全'],
                ['RC4', '流加密', '—', '已废弃', '🔴 不安全'],
              ].map(([algo, type, key, use, sec]) => (
                <tr key={algo}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#7dd3fc', fontWeight: 600 }}>{algo}</td>
                  <td><span className="net-tag blue">{type}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#64748b' }}>{key}</td>
                  <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{use}</td>
                  <td style={{ fontSize: '0.82rem' }}>{sec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="net-nav">
        <button className="net-btn" onClick={() => navigate('/course/tcpip-mastery/lesson/application')}>← 上一模块</button>
        <button className="net-btn primary" onClick={() => navigate('/course/tcpip-mastery/lesson/diagnosis')}>下一模块：网络诊断 →</button>
      </div>
    </div>
  );
}
