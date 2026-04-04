import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const OSI_LAYERS = [
  { num: 7, name: '应用层', en: 'Application', color: '#a78bfa', pdu: '数据 (Data)', protocols: 'HTTP, HTTPS, FTP, SMTP, DNS, SSH', role: '为用户程序提供网络服务接口' },
  { num: 6, name: '表示层', en: 'Presentation', color: '#8b5cf6', pdu: '数据 (Data)', protocols: 'SSL/TLS, JPEG, ASCII, UTF-8', role: '数据格式转换、加密解密、压缩' },
  { num: 5, name: '会话层', en: 'Session',      color: '#6366f1', pdu: '数据 (Data)', protocols: 'NetBIOS, RPC, NFS', role: '建立、管理、终止通信会话' },
  { num: 4, name: '传输层', en: 'Transport',    color: '#0ea5e9', pdu: '数据段 (Segment)', protocols: 'TCP, UDP, SCTP', role: '端对端可靠传输，流量控制' },
  { num: 3, name: '网络层', en: 'Network',      color: '#10b981', pdu: '数据包 (Packet)', protocols: 'IP, ICMP, OSPF, BGP', role: '逻辑寻址、路由选择' },
  { num: 2, name: '链路层', en: 'Data Link',   color: '#f59e0b', pdu: '帧 (Frame)', protocols: 'Ethernet, Wi-Fi, PPP, ARP', role: '节点间可靠传输，MAC寻址' },
  { num: 1, name: '物理层', en: 'Physical',     color: '#ef4444', pdu: '比特 (Bit)', protocols: '光纤, 双绞线, 无线电波, 光', role: '比特流传输，物理介质规范' },
];

const TCPIP_LAYERS = [
  { name: '应用层', color: '#a78bfa', osiMap: '5,6,7', protocols: 'HTTP/S, DNS, FTP, SMTP, SSH, DHCP' },
  { name: '传输层', color: '#0ea5e9', osiMap: '4', protocols: 'TCP, UDP' },
  { name: '网络层', color: '#10b981', osiMap: '3', protocols: 'IP, ICMP, ARP' },
  { name: '网络访问层', color: '#f59e0b', osiMap: '1,2', protocols: 'Ethernet, Wi-Fi, PPP' },
];

const ENCAP_STEPS = ['应用数据', 'TCP 段头', 'IP 包头', '以太网帧头', '比特流'];

export default function LessonModel() {
  const navigate = useNavigate();
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [encapStep, setEncapStep] = useState(0);

  return (
    <div className="lesson-net">
      <div className="net-badge">📚 module_02 — OSI 与 TCP/IP 模型</div>

      <div className="net-hero">
        <h1>协议分层：互联网的"积木哲学"</h1>
        <p>OSI 7层模型是<strong>理论标准</strong>，TCP/IP 4层模型是<strong>工程实践</strong>。理解分层的目的不是背诵层名，而是理解"关注点分离"如何让互联网持续演进。</p>
      </div>

      {/* OSI 模型交互 */}
      <div className="net-section">
        <h2 className="net-section-title">🏗️ OSI 七层模型（点击查看详情）</h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '260px' }}>
            {OSI_LAYERS.map(l => (
              <div key={l.num}
                onClick={() => setSelectedLayer(selectedLayer?.num === l.num ? null : l)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.8rem 1rem', marginBottom: '4px',
                  background: selectedLayer?.num === l.num ? `${l.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedLayer?.num === l.num ? l.color + '60' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '6px', flexShrink: 0,
                  background: `${l.color}20`, border: `1px solid ${l.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800, color: l.color,
                }}>L{l.num}</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{l.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{l.en} · PDU: {l.pdu}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div style={{ flex: '1', minWidth: '260px' }}>
            {selectedLayer ? (
              <div className="net-card" style={{ borderColor: `${selectedLayer.color}40`, height: '100%' }}>
                <div style={{ fontSize: '0.7rem', color: selectedLayer.color, fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Layer {selectedLayer.num} — {selectedLayer.en}
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: '0 0 0.75rem' }}>{selectedLayer.name}</h3>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>{selectedLayer.role}</p>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>主要协议</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#7dd3fc', lineHeight: 1.8 }}>{selectedLayer.protocols}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#334155', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                👈 点击左侧任意层查看详细信息
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TCP/IP 4层模型 */}
      <div className="net-section">
        <h2 className="net-section-title">🔧 TCP/IP 四层模型（实际工作中使用）</h2>
        <div className="net-card">
          <table className="net-table">
            <thead>
              <tr>
                <th>TCP/IP 层</th>
                <th>对应 OSI 层</th>
                <th>核心协议</th>
              </tr>
            </thead>
            <tbody>
              {TCPIP_LAYERS.map(l => (
                <tr key={l.name}>
                  <td><span className="net-tag blue" style={{ background: `${l.color}18`, color: l.color }}>{l.name}</span></td>
                  <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#6b7280' }}>L{l.osiMap}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#7dd3fc' }}>{l.protocols}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 数据封装过程 */}
      <div className="net-section">
        <h2 className="net-section-title">📦 数据封装 / 解封装过程</h2>
        <div className="net-interactive">
          <h3>
            封装演示（发送方）
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <button className="net-btn" onClick={() => setEncapStep(Math.max(0, encapStep - 1))} disabled={encapStep === 0}>←</button>
              <button className="net-btn primary" onClick={() => setEncapStep(Math.min(ENCAP_STEPS.length - 1, encapStep + 1))} disabled={encapStep === ENCAP_STEPS.length - 1}>下一步 →</button>
            </div>
          </h3>
          <div style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: '#64748b' }}>步骤 {encapStep + 1}/{ENCAP_STEPS.length}：{['应用层生成数据', '传输层封装TCP头', '网络层封装IP头', '链路层封装帧头', '转为物理比特流'][encapStep]}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: '以太网帧头', color: '#f59e0b', show: encapStep >= 3 },
              { label: 'IP 包头', color: '#10b981', show: encapStep >= 2 },
              { label: 'TCP 段头', color: '#0ea5e9', show: encapStep >= 1 },
              { label: '应用层数据 (HTTP Request)', color: '#a78bfa', show: encapStep >= 0 },
            ].map((f, i) => (
              <div key={i} style={{
                padding: f.show ? '0.6rem 1rem' : '0',
                background: f.show ? `${f.color}12` : 'transparent',
                border: f.show ? `1px solid ${f.color}35` : '1px solid transparent',
                borderRadius: '6px',
                overflow: 'hidden',
                maxHeight: f.show ? '60px' : '0',
                transition: 'all 0.4s ease',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.82rem',
                color: f.color,
                fontWeight: 600,
              }}>{f.show ? f.label : ''}</div>
            ))}
            {encapStep >= 4 && (
              <div style={{ padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#f87171', letterSpacing: '0.05em' }}>
                01001000 01100101 01101100 01101100 01101111 ... (物理比特流)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="net-nav">
        <button className="net-btn" onClick={() => navigate('/course/tcpip-mastery/lesson/overview')}>← 上一模块</button>
        <button className="net-btn primary" onClick={() => navigate('/course/tcpip-mastery/lesson/ip')}>下一模块：IP 协议 →</button>
      </div>
    </div>
  );
}
