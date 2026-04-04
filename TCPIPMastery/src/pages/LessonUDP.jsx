import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const USE_CASES = [
  { name: 'DNS 查询', why: '单次请求/响应，速度优先，丢包重试成本低', protocol: 'UDP :53' },
  { name: '视频直播', why: '实时性 > 可靠性，丢几帧不影响观看体验', protocol: 'UDP/RTP' },
  { name: '在线游戏', why: '低延迟关键，一个旧数据包重传意义不大', protocol: 'UDP' },
  { name: 'VoIP 语音', why: '延迟敏感，乱序可接受，无需重传历史语音', protocol: 'UDP/RTP' },
  { name: 'TFTP 传输', why: '小文件快速传输，简单场景无需TCP复杂性', protocol: 'UDP :69' },
  { name: 'DHCP 分配', why: '广播场景，客户端无IP无法建立TCP连接', protocol: 'UDP :67/68' },
];

const COMPARE_ROWS = [
  ['连接', '需要三次握手建立连接', '无连接，直接发送'],
  ['可靠性', '保证：确认+重传+排序', '不保证：发送即忘'],
  ['顺序', '保证按序到达', '不保证，可能乱序'],
  ['速度', '较慢（控制开销大）', '快（最小开销）'],
  ['头部大小', '20-60 字节', '8 字节（固定）'],
  ['流量控制', '有（滑动窗口）', '无'],
  ['拥塞控制', '有（慢启动等）', '无（需应用层实现）'],
  ['适用场景', '文件传输、网页、邮件', 'DNS、视频流、游戏、VoIP'],
];

export default function LessonUDP() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="lesson-net">
      <div className="net-badge">⚡ module_05 — UDP 协议</div>

      <div className="net-hero">
        <h1>UDP：简约即是力量</h1>
        <p>UDP 只有 8 字节头部，没有握手、没有重传、没有拥塞控制。这不是缺陷，而是<strong>设计哲学</strong>：将控制权交给应用层，换取极致的低延迟和高吞吐。</p>
      </div>

      {/* UDP 报头 */}
      <div className="net-section">
        <h2 className="net-section-title">📋 UDP 报头（仅 8 字节，极简设计）</h2>
        <div className="net-card">
          <div className="packet-row">
            <div className="packet-field pf-blue" style={{ flex: 2 }}>源端口<span className="pf-label">16位</span></div>
            <div className="packet-field pf-green" style={{ flex: 2 }}>目标端口<span className="pf-label">16位</span></div>
            <div className="packet-field pf-amber" style={{ flex: 2 }}>长度<span className="pf-label">16位</span></div>
            <div className="packet-field pf-purple" style={{ flex: 2 }}>校验和<span className="pf-label">16位</span></div>
          </div>
          <div className="packet-field pf-blue" style={{ textAlign: 'center', padding: '1rem', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '4px', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#7dd3fc' }}>
            数据（Data）— 可变长度
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
            对比 TCP 的 20 字节头部，UDP 节省 60% 的头部开销。对于每秒百万次 DNS 查询的场景，这个差距至关重要。
          </p>
        </div>
      </div>

      {/* TCP vs UDP 对比 */}
      <div className="net-section">
        <h2 className="net-section-title">⚖️ TCP vs UDP 详细对比</h2>
        <div className="net-card">
          <table className="net-table">
            <thead>
              <tr>
                <th>特性</th>
                <th style={{ color: '#38bdf8' }}>TCP</th>
                <th style={{ color: '#34d399' }}>UDP</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(([item, tcp, udp]) => (
                <tr key={item}>
                  <td style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.875rem' }}>{item}</td>
                  <td style={{ color: '#7dd3fc', fontSize: '0.82rem' }}>{tcp}</td>
                  <td style={{ color: '#34d399', fontSize: '0.82rem' }}>{udp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 使用场景选择器 */}
      <div className="net-section">
        <h2 className="net-section-title">🎯 为什么这些场景选 UDP？（点击查看原因）</h2>
        <div className="net-interactive">
          <h3>💡 应用场景分析</h3>
          <div className="net-grid-3" style={{ marginBottom: '1rem' }}>
            {USE_CASES.map((u, i) => (
              <div key={i}
                onClick={() => setSelected(selected === i ? null : i)}
                style={{
                  padding: '0.875rem',
                  background: selected === i ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected === i ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '0.3rem', fontSize: '0.9rem' }}>{u.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#0ea5e9' }}>{u.protocol}</div>
              </div>
            ))}
          </div>

          {selected !== null && (
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', fontSize: '0.875rem', color: '#94a3b8' }}>
              <strong style={{ color: '#34d399' }}>{USE_CASES[selected].name}</strong> 选择 UDP 的原因：
              <br />{USE_CASES[selected].why}
            </div>
          )}
        </div>
      </div>

      {/* QUIC 协议 */}
      <div className="net-section">
        <h2 className="net-section-title">🚀 QUIC：基于 UDP 的下一代协议</h2>
        <div className="net-card" style={{ borderColor: 'rgba(167,139,250,0.25)' }}>
          <h3 style={{ color: '#a78bfa' }}>Google 发明，HTTP/3 的底层传输</h3>
          <div className="net-grid-2">
            {[
              { p: 'UDP 基础', d: '避开操作系统 TCP 实现限制，在用户态实现可靠传输' },
              { p: '0-RTT 握手', d: '首次连接 1-RTT，再次连接 0-RTT，TLS 握手内置' },
              { p: '多路复用', d: '一条连接同时传多个流，单个流丢包不阻塞其他流' },
              { p: '连接迁移', d: '手机从 Wi-Fi 切 4G，连接不中断（基于 Connection ID）' },
            ].map((f, i) => (
              <div key={i} style={{ padding: '0.75rem', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.3rem' }}>{f.p}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="net-nav">
        <button className="net-btn" onClick={() => navigate('/course/tcpip-mastery/lesson/tcp')}>← 上一模块</button>
        <button className="net-btn primary" onClick={() => navigate('/course/tcpip-mastery/lesson/application')}>下一模块：应用层协议 →</button>
      </div>
    </div>
  );
}
