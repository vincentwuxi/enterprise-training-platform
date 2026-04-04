import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PACKET_JOURNEY = [
  { step: 1, loc: '你的浏览器', action: '用户输入 www.google.com，浏览器创建 HTTP 请求', layer: '应用层', color: '#a78bfa' },
  { step: 2, loc: '应用层 → 传输层', action: 'TCP 将请求分段，添加端口号（源:52341 目标:443），建立可靠连接', layer: '传输层', color: '#0ea5e9' },
  { step: 3, loc: '传输层 → 网络层', action: 'IP 添加源IP和目标IP地址，确定路由路径', layer: '网络层', color: '#10b981' },
  { step: 4, loc: '网络层 → 链路层', action: '以太网帧封装，添加 MAC 地址，数据变成比特流', layer: '链路层', color: '#f59e0b' },
  { step: 5, loc: '路由器跳转', action: '数据经过 15+ 个路由器，每跳重新路由决策', layer: '物理传输', color: '#ef4444' },
  { step: 6, loc: '目标服务器', action: '逐层解封装：比特流→帧→IP包→TCP段→HTTP请求', layer: '解封装', color: '#34d399' },
];

const KEY_CONCEPTS = [
  { icon: '📦', title: '分组交换', desc: '数据被切分成小包独立传输，比电路交换更高效、更健壮。即使部分路径故障，数据包可绕道而行。' },
  { icon: '🔀', title: '协议栈', desc: '每一层只关心自己的工作，对上提供服务，对下使用服务。模块化设计让互联网可以独立演进各层技术。' },
  { icon: '🌐', title: 'IP 寻址', desc: '就像邮政地址，IP 地址唯一标识每台设备。路由器根据 IP 地址决定数据包的下一跳去向。' },
  { icon: '🤝', title: '端到端原则', desc: '复杂性尽量放在端点，网络核心保持"哑管道"。这是互联网持续创新的根本原因。' },
];

export default function LessonOverview() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const runAnimation = () => {
    setAnimating(true);
    setActiveStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setActiveStep(i);
      if (i >= PACKET_JOURNEY.length - 1) { clearInterval(timer); setAnimating(false); }
    }, 900);
  };

  return (
    <div className="lesson-net">
      <div className="net-badge">🌐 module_01 — 网络世界观</div>

      <div className="net-hero">
        <h1>互联网是怎么工作的？</h1>
        <p>你按下回车键的那一刻，数据经历了什么？一封邮件如何穿越大洋到达对面？理解这一切，是掌握 TCP/IP 的<strong>第一步</strong>。</p>
      </div>

      {/* 数据包旅程动画 */}
      <div className="net-section">
        <h2 className="net-section-title">📡 数据包旅程模拟器</h2>
        <div className="net-interactive">
          <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🚀 一个 HTTP 请求的完整旅程</span>
            <button className="net-btn primary" onClick={runAnimation} disabled={animating}>
              {animating ? '传输中...' : '▶ 开始模拟'}
            </button>
          </h3>

          {/* Journey steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {PACKET_JOURNEY.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '0.75rem 1rem',
                background: i <= activeStep ? `${s.color}12` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i <= activeStep ? s.color + '40' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px',
                transition: 'all 0.4s ease',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: i <= activeStep ? s.color : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, color: i <= activeStep ? '#fff' : '#475569',
                  transition: 'all 0.4s',
                }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: i <= activeStep ? '#f1f5f9' : '#475569', marginBottom: '0.2rem' }}>
                    {s.loc}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: `${s.color}20`, color: s.color }}>{s.layer}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: i <= activeStep ? '#94a3b8' : '#334155' }}>{s.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 分组交换 vs 电路交换 */}
      <div className="net-section">
        <h2 className="net-section-title">⚡ 为什么选分组交换？</h2>
        <div className="net-card" style={{ borderColor: 'rgba(14,165,233,0.25)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3>🚫 电路交换（旧电话网）</h3>
              <div className="net-steps">
                {['通话前先建立专用链路', '链路独占，无法共享', '一旦链路断开通话中断', '资源利用率低（约 40%）'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span style={{ color: '#ef4444' }}>✗</span> {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ color: '#10b981' }}>✅ 分组交换（互联网）</h3>
              <div className="net-steps">
                {['数据切块独立传输', '共享链路，复用资源', '路径故障可自动绕行', '资源利用率高（80%+）'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span style={{ color: '#10b981' }}>✓</span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 核心概念 */}
      <div className="net-section">
        <h2 className="net-section-title">🧠 核心概念</h2>
        <div className="net-grid-2">
          {KEY_CONCEPTS.map((c, i) => (
            <div key={i} className="net-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 互联网规模数字 */}
      <div className="net-section">
        <h2 className="net-section-title">📊 互联网的规模</h2>
        <div className="net-grid-4">
          {[
            { num: '50亿+', label: '互联网用户' },
            { num: '200亿+', label: 'IoT 设备' },
            { num: '5.8万', label: '自治系统(AS)' },
            { num: '3.3拍字节', label: '每日流量（2024）' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1.2 }}>{s.num}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="net-nav">
        <div />
        <button className="net-btn primary" onClick={() => navigate('/course/tcpip-mastery/lesson/model')}>
          下一模块：OSI 与 TCP/IP 模型 →
        </button>
      </div>
    </div>
  );
}
