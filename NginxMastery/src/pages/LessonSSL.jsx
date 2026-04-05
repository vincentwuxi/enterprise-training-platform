import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TLS_STEPS = [
  { step: '① Client Hello', color: '#38bdf8', dir: '→', desc: '客户端支持的 TLS 版本列表、密码套件列表、随机数 Client Random', detail: 'TLS 1.3, CipherSuites: TLS_AES_128_GCM_SHA256...\nClient Random: 0x3e7a12b9...' },
  { step: '② Server Hello', color: '#22c55e', dir: '←', desc: '服务器选择 TLS 版本和密码套件，发送服务器证书（含公钥）、随机数 Server Random', detail: 'Selected: TLS 1.3 + TLS_AES_256_GCM_SHA384\nServer Certificate: *.example.com\nServer Random: 0x8f2c45d1...' },
  { step: '③ 证书校验', color: '#fbbf24', dir: ' ', desc: '客户端使用 CA 根证书验证服务器证书的合法性（证书链校验），提取服务器公钥', detail: 'CA signatures OK\nCertificate chain: leaf → intermediate → root CA\nPublic Key extracted: RSA 2048bit' },
  { step: '④ 密钥交换', color: '#a78bfa', dir: '→', desc: '使用服务器公钥加密 Pre-Master Secret（或 ECDHE 交换），双方计算出 Session Key', detail: 'ECDHE Key Exchange (TLS 1.3)\nBoth sides compute: Master Secret\n= PRF(Client Random + Server Random + Pre-Master)' },
  { step: '⑤ 握手完成', color: '#009639', dir: '↔', desc: '双方发送 Finished 消息验证握手完整性，后续通信使用对称加密（AES 等）', detail: 'Finished (HMAC verification)\nApplication Data encrypted with:\nSession Key (AES-256-GCM)' },
];

const SECURITY_HEADERS = [
  { header: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload', icon: '🔒', desc: '强制 HTTPS（HSTS），max-age=1年。preload 可进入浏览器预加载名单' },
  { header: 'X-Content-Type-Options', value: 'nosniff', icon: '🛡️', desc: '禁止浏览器 MIME 类型嗅探，防止 MIME 混淆攻击' },
  { header: 'X-Frame-Options', value: 'DENY', icon: '🚫', desc: '禁止页面被 iframe 嵌入，防止点击劫持（Clickjacking）' },
  { header: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'nonce-xxx'", icon: '📋', desc: '内容安全策略，限制资源加载来源，防止 XSS 攻击' },
  { header: 'X-XSS-Protection', value: '1; mode=block', icon: '🛡️', desc: '启用浏览器 XSS 过滤器（较老浏览器）' },
  { header: 'Referrer-Policy', value: 'strict-origin-when-cross-origin', icon: '🔗', desc: '控制 Referrer Header 发送策略，防止敏感 URL 泄漏' },
  { header: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()', icon: '📷', desc: '禁用不需要的浏览器权限（摄像头/麦克风/定位等）' },
];

export default function LessonSSL() {
  const navigate = useNavigate();
  const [activeTls, setActiveTls] = useState(null);
  const [activeHeader, setActiveHeader] = useState(null);

  const TLS_CONFIG = `server {
    listen 443 ssl http2;
    server_name app.example.com;

    # 证书配置（Let's Encrypt 或商业证书）
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 仅允许 TLS 1.2 和 1.3（禁用 1.0/1.1）
    ssl_protocols TLSv1.2 TLSv1.3;

    # 推荐的加密套件（Mozilla 现代配置）
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;  # TLS 1.3 不需要服务器优先

    # Session 复用（提升重连性能）
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;  # 禁用 Session Tickets（前向保密）

    # OCSP Stapling（证书吊销检查，减少客户端等待）
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=60s;

    # HSTS（严格 HTTPS，1年）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # 其他安全头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# HTTP 强制跳转 HTTPS
server {
    listen 80;
    server_name app.example.com;
    return 301 https://$host$request_uri;
}`;

  return (
    <div className="lesson-ng">
      <div className="ng-badge">🔐 module_04 — HTTPS 与安全</div>

      <div className="ng-hero">
        <h1>HTTPS 与安全：TLS 握手、证书与安全头</h1>
        <p>HTTPS 不是可选项而是基准要求。理解 <strong>TLS 握手过程</strong>，配置好 <strong>SSL 参数和安全响应头</strong>，能让你的 Web 服务同时获得安全性和性能。</p>
      </div>

      {/* TLS 握手交互演示 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🤝 TLS 1.3 握手过程（点击每步展开）</h2>
        <div className="ng-card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: '#4a7a5a' }}>
            <span>🖥️ 客户端 (Browser)</span>
            <div style={{ flex: 1, borderBottom: '1px dashed rgba(0,150,57,0.2)', alignSelf: 'center' }} />
            <span>🖥️ 服务器 (Nginx)</span>
          </div>
          <div className="ng-steps" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {TLS_STEPS.map((s, i) => (
              <div key={i} onClick={() => setActiveTls(activeTls === i ? null : i)}
                style={{ padding: '0.875rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                  border: `1px solid ${activeTls === i ? s.color + '50' : 'rgba(255,255,255,0.06)'}`,
                  background: activeTls === i ? `${s.color}0d` : 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: s.color, minWidth: 160, fontSize: '0.82rem' }}>{s.step}</span>
                  <span style={{ fontSize: '1.1rem', color: s.color }}>{s.dir}</span>
                  <span style={{ fontSize: '0.82rem', color: '#4a7a5a' }}>{s.desc}</span>
                </div>
                {activeTls === i && (
                  <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.875rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: s.color, whiteSpace: 'pre' }}>{s.detail}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', background: 'rgba(0,150,57,0.06)', borderRadius: '6px', fontSize: '0.8rem', color: '#4a7a5a' }}>
            ⚡ TLS 1.3 仅需 <strong style={{ color: '#22c55e' }}>1-RTT</strong> 即可完成握手（相比 TLS 1.2 的 2-RTT），0-RTT 复连更快
          </div>
        </div>
      </div>

      {/* SSL 完整配置 */}
      <div className="ng-section">
        <h2 className="ng-section-title">⚙️ 生产级 SSL/TLS 配置</h2>
        <div className="ng-term-wrapper">
          <div className="ng-term-header">
            <div className="ng-term-dot" style={{ background: '#ef4444' }} />
            <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
            <div className="ng-term-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>/etc/nginx/conf.d/ssl.conf</span>
          </div>
          <div className="ng-term" style={{ fontSize: '0.74rem', maxHeight: '400px', overflow: 'auto' }}>{TLS_CONFIG}</div>
        </div>
      </div>

      {/* 安全响应头 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🛡️ HTTP 安全响应头（点击查看作用）</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {SECURITY_HEADERS.map((h, i) => (
            <div key={h.header} onClick={() => setActiveHeader(activeHeader === i ? null : i)}
              style={{ padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${activeHeader === i ? 'rgba(0,150,57,0.4)' : 'rgba(255,255,255,0.05)'}`,
                background: activeHeader === i ? 'rgba(0,150,57,0.07)' : 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem' }}>{h.icon}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#22c55e', fontSize: '0.78rem', fontWeight: 700, minWidth: 240 }}>{h.header}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#38bdf8', fontSize: '0.72rem' }}>{h.value}</span>
              </div>
              {activeHeader === i && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#4a7a5a', paddingLeft: '2rem' }}>{h.desc}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="ng-nav">
        <button className="ng-btn" onClick={() => navigate('/course/nginx-mastery/lesson/proxy')}>← 上一模块</button>
        <button className="ng-btn primary" onClick={() => navigate('/course/nginx-mastery/lesson/microservices')}>下一模块：微服务架构 →</button>
      </div>
    </div>
  );
}
