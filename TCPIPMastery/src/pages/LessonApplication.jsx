import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const DNS_STEPS = [
  { actor: 'Browser', action: '查浏览器缓存', result: '未命中', color: '#a78bfa' },
  { actor: 'OS', action: '查本地 /etc/hosts 和操作系统缓存', result: '未命中', color: '#6366f1' },
  { actor: '本地 DNS 服务器', action: '查询配置的 DNS（如 8.8.8.8）', result: '递归查询开始', color: '#0ea5e9' },
  { actor: '根域名服务器', action: '返回 .com 顶级域名服务器地址', result: 'TLD NS: 192.5.6.30', color: '#10b981' },
  { actor: '.com TLD 服务器', action: '返回 google.com 权威 DNS 服务器', result: 'Auth NS: 216.239.32.10', color: '#f59e0b' },
  { actor: 'google.com 权威 DNS', action: '返回 www.google.com 的 A 记录', result: 'A: 142.250.185.78', color: '#ef4444' },
];

const HTTP_METHODS = [
  { method: 'GET', color: '#10b981', desc: '获取资源，幂等，可缓存，参数在 URL 中' },
  { method: 'POST', color: '#0ea5e9', desc: '创建资源，非幂等，数据在请求体中' },
  { method: 'PUT', color: '#f59e0b', desc: '全量更新资源，幂等' },
  { method: 'PATCH', color: '#a78bfa', desc: '部分更新资源，非幂等' },
  { method: 'DELETE', color: '#ef4444', desc: '删除资源，幂等' },
  { method: 'HEAD', color: '#64748b', desc: '同 GET 但不返回响应体，常用于探活' },
];

const HTTP_STATUS = [
  { code: '2xx', name: '成功', examples: '200 OK · 201 Created · 204 No Content', color: '#10b981' },
  { code: '3xx', name: '重定向', examples: '301 Moved Permanently · 302 Found · 304 Not Modified', color: '#0ea5e9' },
  { code: '4xx', name: '客户端错误', examples: '400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found', color: '#f59e0b' },
  { code: '5xx', name: '服务端错误', examples: '500 Internal Server Error · 502 Bad Gateway · 503 Service Unavailable', color: '#ef4444' },
];

export default function LessonApplication() {
  const navigate = useNavigate();
  const [dnsStep, setDnsStep] = useState(-1);
  const [activeProto, setActiveProto] = useState('http');

  return (
    <div className="lesson-net">
      <div className="net-badge">🌍 module_06 — 应用层协议</div>

      <div className="net-hero">
        <h1>应用层精讲：HTTP / DNS / TLS</h1>
        <p>HTTP 是 Web 的语言，DNS 是互联网的电话簿，TLS 是安全的保障。这三个协议支撑了你每天 99% 的上网行为。</p>
      </div>

      {/* 协议选择标签 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'http', label: '🌐 HTTP/HTTPS' },
          { key: 'dns',  label: '📖 DNS' },
          { key: 'tls',  label: '🔒 TLS/SSL' },
          { key: 'dhcp', label: '🏠 DHCP' },
        ].map(p => (
          <button key={p.key} className={`net-btn ${activeProto === p.key ? 'primary' : ''}`}
            onClick={() => setActiveProto(p.key)}>{p.label}</button>
        ))}
      </div>

      {/* HTTP Panel */}
      {activeProto === 'http' && (
        <>
          <div className="net-section">
            <h2 className="net-section-title">🌐 HTTP 请求/响应结构</h2>
            <div className="net-grid-2">
              <div className="net-card">
                <h3>📤 HTTP 请求</h3>
                <div className="net-code">{`GET /api/users HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGc...
User-Agent: Mozilla/5.0

// 请求体（POST/PUT 时有内容）`}</div>
              </div>
              <div className="net-card">
                <h3>📥 HTTP 响应</h3>
                <div className="net-code">{`HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=3600
X-Request-Id: abc-123

{
  "users": [...],
  "total": 42
}`}</div>
              </div>
            </div>
          </div>

          <div className="net-section">
            <h2 className="net-section-title">🔧 HTTP Methods</h2>
            <div className="net-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {HTTP_METHODS.map(m => (
                  <div key={m.method} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0.75rem', background: `${m.color}08`, border: `1px solid ${m.color}20`, borderRadius: '6px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '0.85rem', color: m.color, minWidth: 60 }}>{m.method}</span>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="net-section">
            <h2 className="net-section-title">📊 HTTP 状态码速查</h2>
            <div className="net-card">
              {HTTP_STATUS.map(s => (
                <div key={s.code} style={{ marginBottom: '0.75rem', padding: '0.75rem 1rem', background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: s.color }}>{s.code}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{s.examples}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="net-section">
            <h2 className="net-section-title">🚀 HTTP/1.1 vs HTTP/2 vs HTTP/3</h2>
            <div className="net-card">
              <table className="net-table">
                <thead><tr><th>特性</th><th>HTTP/1.1</th><th>HTTP/2</th><th>HTTP/3</th></tr></thead>
                <tbody>
                  {[
                    ['底层传输', 'TCP', 'TCP', 'QUIC (UDP)'],
                    ['多路复用', '❌（队头阻塞）', '✅（帧级别）', '✅（流级别）'],
                    ['头部压缩', '❌', '✅ HPACK', '✅ QPACK'],
                    ['服务端推送', '❌', '✅', '✅'],
                    ['TLS', '可选', '强制', '内置'],
                    ['部署时间', '1997', '2015', '2022 (RFC9114)'],
                  ].map(([f, v1, v2, v3]) => (
                    <tr key={f}>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>{f}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#64748b' }}>{v1}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#38bdf8' }}>{v2}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#34d399' }}>{v3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* DNS Panel */}
      {activeProto === 'dns' && (
        <>
          <div className="net-section">
            <h2 className="net-section-title">📖 DNS 递归解析过程（访问 www.google.com）</h2>
            <div className="net-interactive">
              <h3 style={{ justifyContent: 'space-between' }}>
                🔍 DNS 解析模拟器
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  <button className="net-btn" onClick={() => setDnsStep(-1)}>重置</button>
                  <button className="net-btn primary" onClick={() => setDnsStep(s => Math.min(DNS_STEPS.length - 1, s + 1))} disabled={dnsStep >= DNS_STEPS.length - 1}>
                    {dnsStep < 0 ? '▶ 开始解析' : '下一步'}
                  </button>
                </div>
              </h3>
              <div className="net-steps">
                {DNS_STEPS.map((s, i) => (
                  <div key={i} className="net-step" style={{ opacity: i <= dnsStep ? 1 : 0.25, transition: 'opacity 0.3s', borderColor: i <= dnsStep ? `${s.color}40` : undefined }}>
                    <div className="step-num" style={{ color: s.color, background: `${s.color}15`, borderColor: `${s.color}30` }}>{i + 1}</div>
                    <div className="step-content">
                      <h4>{s.actor} → {s.action}</h4>
                      <p>结果: <code style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{s.result}</code></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="net-section">
            <h2 className="net-section-title">📝 DNS 记录类型速查</h2>
            <div className="net-card">
              <table className="net-table">
                <thead><tr><th>记录类型</th><th>用途</th><th>示例</th></tr></thead>
                <tbody>
                  {[
                    ['A', '域名 → IPv4 地址', 'google.com → 142.250.185.78'],
                    ['AAAA', '域名 → IPv6 地址', 'google.com → 2404:6800::200e'],
                    ['CNAME', '域名别名', 'www.example.com → example.com'],
                    ['MX', '邮件服务器', 'example.com → mail.example.com (优先级 10)'],
                    ['NS', '权威域名服务器', 'example.com → ns1.example.com'],
                    ['TXT', '文本记录', 'SPF, DKIM, 域名验证'],
                    ['PTR', 'IP → 域名（反向解析）', '8.8.8.8 → dns.google'],
                  ].map(([type, use, ex]) => (
                    <tr key={type}>
                      <td><span className="net-tag blue" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{type}</span></td>
                      <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{use}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#7dd3fc' }}>{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TLS Panel */}
      {activeProto === 'tls' && (
        <>
          <div className="net-section">
            <h2 className="net-section-title">🔒 TLS 1.3 握手过程</h2>
            <div className="net-card">
              <div className="net-steps">
                {[
                  { title: 'Client Hello', desc: '客户端发送支持的 TLS 版本、加密套件列表、Nonce 随机数' },
                  { title: 'Server Hello + Certificate', desc: '服务端选择加密套件，发送证书（含公钥）和服务端 Nonce' },
                  { title: 'Certificate Verify', desc: '服务端用私钥对握手记录签名，证明拥有私钥' },
                  { title: 'Finished', desc: '双方都发送 Finished 消息，验证整个握手完整性' },
                  { title: '0-RTT 或 1-RTT 数据', desc: 'TLS 1.3 只需 1-RTT 完成握手（恢复会话可 0-RTT）' },
                ].map((s, i) => (
                  <div key={i} className="net-step">
                    <div className="step-num">{i + 1}</div>
                    <div className="step-content">
                      <h4 style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.title}</h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="net-section">
            <h2 className="net-section-title">🔑 核心密码学概念</h2>
            <div className="net-grid-2">
              {[
                { title: '非对称加密', desc: '公钥加密，私钥解密。用于握手阶段交换密钥。算法：RSA-2048, ECDSA P-256' },
                { title: '对称加密', desc: '握手后使用，性能高。算法：AES-128-GCM, ChaCha20-Poly1305' },
                { title: 'ECDH 密钥交换', desc: '双方各自生成密钥对，交换公钥后计算相同的共享密钥，不传输实际密钥' },
                { title: '证书链', desc: '根 CA → 中间 CA → 服务端证书。浏览器内置根 CA，逐级验证签名' },
              ].map((c, i) => (
                <div key={i} className="net-card" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
                  <h3 style={{ color: '#a78bfa' }}>🔐 {c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* DHCP Panel */}
      {activeProto === 'dhcp' && (
        <div className="net-section">
          <h2 className="net-section-title">🏠 DHCP：自动 IP 分配（DORA 过程）</h2>
          <div className="net-steps">
            {[
              { title: 'Discover', desc: '客户端广播发现请求（源IP: 0.0.0.0，目标: 255.255.255.255 UDP:67）', flag: 'BROADCAST' },
              { title: 'Offer', desc: 'DHCP 服务器提供IP地址 + 掩码 + 网关 + DNS + 租期', flag: 'SERVER→CLIENT' },
              { title: 'Request', desc: '客户端广播声明接受某服务器的 Offer（通知其他服务器）', flag: 'BROADCAST' },
              { title: 'ACK', desc: '服务端确认，IP地址分配完成，客户端开始使用该IP', flag: 'CONFIRMED' },
            ].map((s, i) => (
              <div key={i} className="net-step">
                <div className="step-num">{['D','O','R','A'][i]}</div>
                <div className="step-content">
                  <h4>{s.title} <span className="net-tag blue" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{s.flag}</span></h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="net-nav">
        <button className="net-btn" onClick={() => navigate('/course/tcpip-mastery/lesson/udp')}>← 上一模块</button>
        <button className="net-btn primary" onClick={() => navigate('/course/tcpip-mastery/lesson/security')}>下一模块：网络安全 →</button>
      </div>
    </div>
  );
}
