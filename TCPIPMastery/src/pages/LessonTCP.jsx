import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const HANDSHAKE_STEPS = [
  { from: 'client', label: 'SYN', seq: 'ISN=1000', flags: 'SYN=1 ACK=0', color: '#0ea5e9', desc: '客户端发起连接，选择初始序列号 ISN=1000，请求同步序列号' },
  { from: 'server', label: 'SYN-ACK', seq: 'ISN=5000 ACK=1001', flags: 'SYN=1 ACK=1', color: '#10b981', desc: '服务端确认客户端 SYN，同时发送自己的 ISN=5000，ACK=客户端ISN+1' },
  { from: 'client', label: 'ACK', seq: 'ACK=5001', flags: 'SYN=0 ACK=1', color: '#a78bfa', desc: '客户端确认服务端 SYN，连接建立完成。双方开始数据传输' },
];

const TEARDOWN_STEPS = [
  { from: 'client', label: 'FIN', desc: '主动方发送 FIN，表示数据发送完毕（进入 FIN_WAIT_1 状态）' },
  { from: 'server', label: 'ACK', desc: '被动方确认收到 FIN（进入 CLOSE_WAIT，主动方进入 FIN_WAIT_2）' },
  { from: 'server', label: 'FIN', desc: '被动方发送自己的 FIN（进入 LAST_ACK 状态）' },
  { from: 'client', label: 'ACK', desc: '主动方确认，进入 TIME_WAIT（等待 2MSL 后关闭）' },
];

const TCP_STATES = ['CLOSED', 'LISTEN', 'SYN_SENT', 'SYN_RCVD', 'ESTABLISHED', 'FIN_WAIT_1', 'FIN_WAIT_2', 'TIME_WAIT', 'CLOSE_WAIT', 'LAST_ACK'];

export default function LessonTCP() {
  const navigate = useNavigate();
  const [handshakeStep, setHandshakeStep] = useState(-1);
  const [teardownStep, setTeardownStep] = useState(-1);
  const [tab, setTab] = useState('handshake');

  return (
    <div className="lesson-net">
      <div className="net-badge">🤝 module_04 — TCP 协议</div>

      <div className="net-hero">
        <h1>TCP：可靠传输的艺术</h1>
        <p>TCP 最伟大的成就：在<strong>不可靠的网络</strong>上建立<strong>可靠的连接</strong>。通过三次握手、确认机制、重传控制、流量控制，TCP 让互联网的文件传输、邮件、HTTP 成为可能。</p>
      </div>

      {/* TCP 报头 */}
      <div className="net-section">
        <h2 className="net-section-title">📋 TCP 报头结构（20字节）</h2>
        <div className="net-card">
          <div className="packet-row" style={{ flexWrap: 'wrap' }}>
            {[
              { label: '源端口', bytes: '16位', cls: 'pf-blue', flex: 2 },
              { label: '目标端口', bytes: '16位', cls: 'pf-green', flex: 2 },
              { label: '序列号 (Sequence Number)', bytes: '32位', cls: 'pf-purple', flex: 4 },
              { label: '确认号 (ACK Number)', bytes: '32位', cls: 'pf-amber', flex: 4 },
              { label: '数据偏移', bytes: '4b', cls: 'pf-blue' },
              { label: '保留', bytes: '3b', cls: 'pf-blue' },
              { label: 'URG', bytes: '1b', cls: 'pf-red' },
              { label: 'ACK', bytes: '1b', cls: 'pf-green' },
              { label: 'PSH', bytes: '1b', cls: 'pf-amber' },
              { label: 'RST', bytes: '1b', cls: 'pf-red' },
              { label: 'SYN', bytes: '1b', cls: 'pf-blue' },
              { label: 'FIN', bytes: '1b', cls: 'pf-purple' },
              { label: '窗口大小', bytes: '16位', cls: 'pf-green', flex: 2 },
              { label: '校验和', bytes: '16位', cls: 'pf-amber', flex: 2 },
              { label: '紧急指针', bytes: '16位', cls: 'pf-red', flex: 2 },
            ].map((f, i) => (
              <div key={i} className={`packet-field ${f.cls}`} style={{ flex: f.flex || 1, minWidth: 36, fontSize: '0.65rem' }}>
                {f.label}<span className="pf-label">{f.bytes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 握手 / 挥手 交互 */}
      <div className="net-section">
        <h2 className="net-section-title">🔄 连接管理交互演示</h2>
        <div className="net-interactive">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {['handshake', 'teardown'].map(t => (
              <button key={t} className={`net-btn ${tab === t ? 'primary' : ''}`} onClick={() => { setTab(t); setHandshakeStep(-1); setTeardownStep(-1); }}>
                {t === 'handshake' ? '🤝 三次握手' : '👋 四次挥手'}
              </button>
            ))}
          </div>

          {tab === 'handshake' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center', width: '30%' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '8px', fontWeight: 700, color: '#38bdf8', marginBottom: '1rem' }}>Client</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {HANDSHAKE_STEPS.map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center',
                      flexDirection: s.from === 'client' ? 'row' : 'row-reverse',
                      opacity: i <= handshakeStep ? 1 : 0.2, transition: 'opacity 0.4s',
                    }}>
                      <div style={{ padding: '0.4rem 0.75rem', background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: s.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {s.label}
                        <div style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 400 }}>{s.seq}</div>
                      </div>
                      <div style={{ flex: 1, height: '2px', background: `${s.color}40`, margin: '0 0.5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: -6, [s.from === 'client' ? 'right' : 'left']: 0, color: s.color, fontSize: '14px' }}>▶</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', width: '30%' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', fontWeight: 700, color: '#34d399', marginBottom: '1rem' }}>Server</div>
                </div>
              </div>

              {handshakeStep >= 0 && handshakeStep < HANDSHAKE_STEPS.length && (
                <div style={{ background: `${HANDSHAKE_STEPS[handshakeStep].color}10`, border: `1px solid ${HANDSHAKE_STEPS[handshakeStep].color}25`, borderRadius: '8px', padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <strong style={{ color: HANDSHAKE_STEPS[handshakeStep].color }}>步骤 {handshakeStep + 1}：</strong>{HANDSHAKE_STEPS[handshakeStep].desc}
                </div>
              )}
              {handshakeStep >= 2 && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                  ✅ 连接建立成功！双方进入 ESTABLISHED 状态，可以开始数据传输
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="net-btn" onClick={() => setHandshakeStep(-1)}>重置</button>
                <button className="net-btn primary" onClick={() => setHandshakeStep(s => Math.min(2, s + 1))} disabled={handshakeStep >= 2}>
                  {handshakeStep < 0 ? '▶ 开始握手' : `步骤 ${handshakeStep + 2}/3`}
                </button>
              </div>
            </>
          )}

          {tab === 'teardown' && (
            <>
              <div className="net-steps">
                {TEARDOWN_STEPS.map((s, i) => (
                  <div key={i} className="net-step" style={{ opacity: i <= teardownStep ? 1 : 0.3, transition: 'opacity 0.3s', borderColor: i <= teardownStep ? 'rgba(14,165,233,0.3)' : undefined }}>
                    <div className="step-num" style={{ background: i <= teardownStep ? 'rgba(14,165,233,0.2)' : undefined }}>{i + 1}</div>
                    <div className="step-content">
                      <h4>{s.from === 'client' ? '👤 客户端' : '🖥️ 服务端'} → 发送 <code style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{s.label}</code></h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="net-btn" onClick={() => setTeardownStep(-1)}>重置</button>
                <button className="net-btn primary" onClick={() => setTeardownStep(s => Math.min(3, s + 1))} disabled={teardownStep >= 3}>
                  {teardownStep < 0 ? '▶ 开始挥手' : teardownStep >= 3 ? '完成' : `步骤 ${teardownStep + 2}/4`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 可靠性机制 */}
      <div className="net-section">
        <h2 className="net-section-title">🛡️ TCP 的四大可靠性机制</h2>
        <div className="net-grid-2">
          {[
            { title: '序列号与确认号', icon: '🔢', desc: '发送方为每个字节编号，接收方用 ACK 确认。接收方期望的下一个字节序号作为确认号返回。' },
            { title: '超时重传', icon: '⏰', desc: '发送方设置 RTO（重传超时），若在 RTO 内未收到 ACK，就重新发送数据段。' },
            { title: '滑动窗口', icon: '🪟', desc: '接收方通告窗口大小（WND），发送方在未确认数据不超过 WND 的前提下可连续发送多个段。' },
            { title: '拥塞控制', icon: '📈', desc: '慢启动 → 拥塞避免 → 快重传 → 快恢复。发送方根据网络状况动态调整发送速率。' },
          ].map(c => (
            <div key={c.title} className="net-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 常用端口 */}
      <div className="net-section">
        <h2 className="net-section-title">🔌 常用 TCP 端口速查</h2>
        <div className="net-card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
            {[
              ['80', 'HTTP'], ['443', 'HTTPS'], ['22', 'SSH'], ['21', 'FTP'],
              ['25', 'SMTP'], ['110', 'POP3'], ['143', 'IMAP'], ['3306', 'MySQL'],
              ['5432', 'PostgreSQL'], ['6379', 'Redis'], ['27017', 'MongoDB'], ['3389', 'RDP'],
            ].map(([port, name]) => (
              <div key={port} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)', borderRadius: '6px' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 700, color: '#38bdf8', minWidth: 35 }}>{port}</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="net-nav">
        <button className="net-btn" onClick={() => navigate('/course/tcpip-mastery/lesson/ip')}>← 上一模块</button>
        <button className="net-btn primary" onClick={() => navigate('/course/tcpip-mastery/lesson/udp')}>下一模块：UDP 协议 →</button>
      </div>
    </div>
  );
}
