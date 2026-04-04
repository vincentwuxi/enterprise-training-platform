import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// ── Subnet Calculator ──
function calcSubnet(ip, prefix) {
  try {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => p < 0 || p > 255)) return null;
    const p = parseInt(prefix);
    if (isNaN(p) || p < 0 || p > 32) return null;

    const ipInt = parts.reduce((acc, o) => (acc << 8) + o, 0) >>> 0;
    const mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const hosts = p >= 31 ? (32 - p === 0 ? 1 : 2) : Math.pow(2, 32 - p) - 2;

    const toIP = n => [(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF].join('.');
    const maskStr = toIP(mask);
    return { network: toIP(network), broadcast: toIP(broadcast), hosts, mask: maskStr, first: toIP(network + 1), last: toIP(broadcast - 1) };
  } catch { return null; }
}

const IPV4_CLASSES = [
  { cls: 'A', range: '1.0.0.0 – 126.255.255.255', default: '/8', hosts: '16,777,214', use: '大型企业、骨干网' },
  { cls: 'B', range: '128.0.0.0 – 191.255.255.255', default: '/16', hosts: '65,534', use: '中型企业、大学' },
  { cls: 'C', range: '192.0.0.0 – 223.255.255.255', default: '/24', hosts: '254', use: '小型网络、家庭' },
  { cls: 'D', range: '224.0.0.0 – 239.255.255.255', default: '组播', hosts: '—', use: '多播（Multicast）' },
  { cls: 'E', range: '240.0.0.0 – 255.255.255.255', default: '保留', hosts: '—', use: '实验用途' },
];

const PRIVATE_RANGES = [
  { range: '10.0.0.0/8', count: '16,777,216', typical: '大型内网' },
  { range: '172.16.0.0/12', count: '1,048,576', typical: '中型内网' },
  { range: '192.168.0.0/16', count: '65,536', typical: '家庭/小型网络' },
];

export default function LessonIP() {
  const navigate = useNavigate();
  const [ip, setIp] = useState('192.168.1.100');
  const [prefix, setPrefix] = useState('24');
  const result = calcSubnet(ip, prefix);

  return (
    <div className="lesson-net">
      <div className="net-badge">🌐 module_03 — IP 协议</div>

      <div className="net-hero">
        <h1>IP 协议：互联网的寻址语言</h1>
        <p>就像每栋房子有门牌号，每台联网设备有 IP 地址。IP 协议负责<strong>逻辑寻址</strong>和<strong>路由转发</strong>——它是整个互联网的"地基"。</p>
      </div>

      {/* IPv4 报头 */}
      <div className="net-section">
        <h2 className="net-section-title">📋 IPv4 报头结构（20字节）</h2>
        <div className="net-card">
          <div className="packet-row" style={{ flexWrap: 'wrap' }}>
            {[
              { label: '版本', bytes: '4b', cls: 'pf-blue' },
              { label: 'IHL', bytes: '4b', cls: 'pf-blue' },
              { label: 'DSCP', bytes: '6b', cls: 'pf-green' },
              { label: 'ECN', bytes: '2b', cls: 'pf-green' },
              { label: '总长度', bytes: '16b', cls: 'pf-amber', flex: 2 },
              { label: '标识', bytes: '16b', cls: 'pf-purple', flex: 2 },
              { label: 'Flags', bytes: '3b', cls: 'pf-red' },
              { label: '分片偏移', bytes: '13b', cls: 'pf-red' },
              { label: 'TTL', bytes: '8b', cls: 'pf-amber' },
              { label: '协议', bytes: '8b', cls: 'pf-blue' },
              { label: '头部校验和', bytes: '16b', cls: 'pf-green', flex: 2 },
              { label: '源 IP 地址', bytes: '32位', cls: 'pf-purple', flex: 4 },
              { label: '目标 IP 地址', bytes: '32位', cls: 'pf-blue', flex: 4 },
            ].map((f, i) => (
              <div key={i} className={`packet-field ${f.cls}`} style={{ flex: f.flex || 1, minWidth: 40 }}>
                {f.label}
                <span className="pf-label">{f.bytes}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { f: 'TTL', d: '生存时间，每经过一个路由器减1，归0则丢弃。防止包无限循环。' },
              { f: '协议字段', d: '标识上层协议：6=TCP，17=UDP，1=ICMP' },
              { f: '标识/Flags/偏移', d: '用于 IP 分片重组，当数据包超过 MTU 时分割传输' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0ea5e9', marginBottom: '0.3rem', fontFamily: 'JetBrains Mono, monospace' }}>{f.f}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 子网计算器 */}
      <div className="net-section">
        <h2 className="net-section-title">🧮 实时子网计算器</h2>
        <div className="net-interactive">
          <h3>⚡ 输入 IP 地址和前缀长度</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b' }}>IP 地址</label>
              <input className="net-input" value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.100" style={{ width: 160 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b' }}>前缀长度 /</label>
              <input className="net-input" type="number" min="0" max="32" value={prefix}
                onChange={e => setPrefix(e.target.value)} style={{ width: 80 }} />
            </div>
          </div>

          {result ? (
            <div className="net-result">
              <span className="res-label">子网计算结果 ({ip}/{prefix})</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: '子网掩码', value: result.mask },
                  { label: '网络地址', value: result.network },
                  { label: '广播地址', value: result.broadcast },
                  { label: '可用主机数', value: result.hosts.toLocaleString() },
                  { label: '第一个主机', value: result.first },
                  { label: '最后一个主机', value: result.last },
                ].map(r => (
                  <div key={r.label}>
                    <div style={{ fontSize: '0.68rem', color: '#475569', marginBottom: '0.2rem' }}>{r.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#34d399', fontWeight: 700 }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem' }}>
              ⚠️ 请输入有效的 IPv4 地址（如 192.168.1.0）和前缀长度（0-32）
            </div>
          )}

          {/* 快速选择 */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {[['192.168.1.0', '24'], ['10.0.0.0', '8'], ['172.16.0.0', '12'], ['10.10.10.0', '28']].map(([i, p]) => (
              <button key={p+i} className="net-btn" onClick={() => { setIp(i); setPrefix(p); }}>
                {i}/{p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* IP 地址分类 */}
      <div className="net-section">
        <h2 className="net-section-title">🗂️ IPv4 地址分类</h2>
        <div className="net-card">
          <table className="net-table">
            <thead><tr><th>类别</th><th>范围</th><th>默认掩码</th><th>主机数</th><th>用途</th></tr></thead>
            <tbody>
              {IPV4_CLASSES.map(c => (
                <tr key={c.cls}>
                  <td><span className="net-tag blue">Class {c.cls}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#7dd3fc' }}>{c.range}</td>
                  <td><span className="net-tag green">{c.default}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>{c.hosts}</td>
                  <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{c.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 私有 IP */}
      <div className="net-section">
        <h2 className="net-section-title">🔒 私有 IP 地址段（RFC 1918）</h2>
        <div className="net-grid-3">
          {PRIVATE_RANGES.map(r => (
            <div key={r.range} className="net-card">
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>{r.range}</div>
              <p>可用主机：<strong style={{ color: '#34d399' }}>{r.count}</strong></p>
              <p>典型应用：{r.typical}</p>
            </div>
          ))}
        </div>
      </div>

      {/* IPv4 vs IPv6 */}
      <div className="net-section">
        <h2 className="net-section-title">🆚 IPv4 vs IPv6</h2>
        <div className="net-card">
          <table className="net-table">
            <thead><tr><th>对比项</th><th>IPv4</th><th>IPv6</th></tr></thead>
            <tbody>
              {[
                ['地址长度', '32 位', '128 位'],
                ['地址数量', '约 43 亿', '约 340 万亿亿亿'],
                ['表示方式', '点分十进制 192.168.1.1', '冒号十六进制 2001:db8::1'],
                ['头部长度', '20-60 字节（可变）', '40 字节（固定）'],
                ['NAT 需求', '必须（地址不足）', '不需要（地址充足）'],
                ['安全性', 'IPSec 可选', 'IPSec 强制'],
                ['自动配置', '需要 DHCP', 'SLAAC 无状态自动配置'],
              ].map(([item, v4, v6]) => (
                <tr key={item}>
                  <td style={{ fontWeight: 600, color: '#94a3b8' }}>{item}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#f59e0b' }}>{v4}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#34d399' }}>{v6}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="net-nav">
        <button className="net-btn" onClick={() => navigate('/course/tcpip-mastery/lesson/model')}>← 上一模块</button>
        <button className="net-btn primary" onClick={() => navigate('/course/tcpip-mastery/lesson/tcp')}>下一模块：TCP 协议 →</button>
      </div>
    </div>
  );
}
