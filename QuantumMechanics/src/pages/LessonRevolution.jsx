import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Interactive blackbody radiation simulator
function BlackbodySimulator() {
  const [temp, setTemp] = useState(3000);

  const getColor = (t) => {
    if (t < 1000) return '#ff2200';
    if (t < 2000) return '#ff6600';
    if (t < 3500) return '#ffaa00';
    if (t < 5000) return '#ffe066';
    if (t < 7000) return '#ffffff';
    return '#b0c8ff';
  };

  const getPeak = (t) => {
    // Wien's displacement law: λ_max = 2.898×10^6 nm·K / T
    const nm = Math.round(2898000 / t);
    if (nm < 380) return `紫外线 (${nm} nm)`;
    if (nm < 450) return `紫色 (${nm} nm)`;
    if (nm < 495) return `蓝色 (${nm} nm)`;
    if (nm < 570) return `绿色 (${nm} nm)`;
    if (nm < 625) return `黄色 (${nm} nm)`;
    if (nm < 740) return `红色 (${nm} nm)`;
    return `红外线 (${nm} nm)`;
  };

  const getTotalPower = (t) => {
    // Stefan-Boltzmann: relative power ∝ T^4
    return ((t / 6000) ** 4 * 100).toFixed(1);
  };

  const color = getColor(temp);

  return (
    <div className="glass-panel">
      <h4 className="text-slate-300 font-bold mb-4">🌡️ 黑体辐射交互模拟（维恩位移定律）</h4>
      <div className="flex flex-col items-center gap-6">
        {/* Glowing orb representing the blackbody */}
        <div className="relative flex items-center justify-content: center">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 mx-auto"
            style={{
              background: `radial-gradient(circle, ${color}ff 0%, ${color}88 50%, transparent 80%)`,
              boxShadow: `0 0 40px ${color}80, 0 0 80px ${color}40`,
              width: '112px', height: '112px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <span className="text-3xl font-black text-white" style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>☀</span>
          </div>
        </div>

        {/* Slider */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>1000 K (深红)</span>
            <span>温度：<strong className="text-slate-200">{temp.toLocaleString()} K</strong></span>
            <span>10000 K (蓝白)</span>
          </div>
          <input
            type="range" min={1000} max={10000} step={100}
            value={temp} onChange={e => setTemp(Number(e.target.value))}
            className="w-full h-2 rounded-full cursor-pointer"
            style={{ accentColor: color }} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 w-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          <div className="text-center bg-black/30 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">辐射峰值</p>
            <p className="text-sm font-bold" style={{ color }}>{getPeak(temp)}</p>
          </div>
          <div className="text-center bg-black/30 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">参考天体温度</p>
            <p className="text-sm font-bold text-slate-200">
              {temp < 2000 ? '红矮星' : temp < 4000 ? '橙矮星' : temp < 6000 ? '太阳' : temp < 8000 ? '天狼星' : '蓝超巨星'}
            </p>
          </div>
          <div className="text-center bg-black/30 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">相对辐射功率</p>
            <p className="text-sm font-bold text-purple-300">{getTotalPower(temp)}%</p>
          </div>
        </div>

        <div className="text-xs text-slate-500 text-center p-3 rounded-xl bg-black/20 w-full">
          💡 经典物理"紫外灾难"：经典理论预测高温物体辐射能量趋向无穷大（在紫外方向），但实验完全不符。
          普朗克在 1900 年假设能量量子化（<code>E = hν</code>），完美预测了这条曲线，量子力学由此诞生。
        </div>
      </div>
    </div>
  );
}

const TIMELINE_EVENTS = [
  { year: '1887', name: '光电效应困惑', desc: '赫兹发现光照射金属可以激发电子，但强度不重要——频率才是关键。经典波动理论完全无法解释。', color: '#ef4444' },
  { year: '1900', name: '普朗克量子假说', desc: '马克斯·普朗克提出能量只能以"量子"形式一份一份地传输：E = hν。他本人都不相信这是真的，以为只是数学技巧。', color: '#f97316' },
  { year: '1905', name: '爱因斯坦光子论', desc: '爱因斯坦（26岁！）用"光量子（光子）"解释了光电效应，断言光本身就是粒子的集合。此为他Nobel奖的贡献。', color: '#eab308' },
  { year: '1913', name: '玻尔原子模型', desc: '玻尔提出电子只能在特定轨道运行，跃迁时吸收或放出特定频率的光——解释了氢原子光谱。', color: '#22c55e' },
  { year: '1924', name: '德布罗意物质波', desc: '德布罗意大胆假设：不只是光，所有物质（电子、质子甚至你！）都具有波动性，λ = h/p。', color: '#06b6d4' },
  { year: '1926', name: '薛定谔方程诞生', desc: '薛定谔写下了量子力学的核心运动方程，描述粒子波函数如何随时间演化。量子力学框架正式形成。', color: '#8b5cf6' },
  { year: '1927', name: '不确定性原理', desc: '海森堡发现，位置与动量不能同时被精确测量——这不是技术限制，是宇宙的根本规律。', color: '#a855f7' },
];

export default function LessonRevolution() {
  const navigate = useNavigate();
  const [activeEvent, setActiveEvent] = useState(null);
  const [showFormula, setShowFormula] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">⚡ 模块一：量子革命</div>
        <h1>当经典物理遇到困境</h1>
        <p className="lesson-intro">
          19 世纪末，人们以为物理学已经完成了。牛顿力学解释了天体运动，麦克斯韦方程征服了电磁波——但几个小小的"细节"，却彻底颠覆了整座物理大厦，引爆了人类思想史上最伟大的一场革命。
        </p>
      </header>

      {/* Intro: Classical Triumph */}
      <section className="lesson-section">
        <h3 className="mb-4">🏛️ 1900年前：经典物理的辉煌</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🍎', name: '牛顿力学', desc: 'F=ma 统治了 200 年，精确预测行星、炮弹、摆锤的运动轨迹' },
            { icon: '🌊', name: '麦克斯韦电磁论', desc: '统一了电、磁、光，预言了无线电波的存在并被实验证实' },
            { icon: '🌡️', name: '热力学', desc: '从蒸汽机到制冷机，完整描述了热与功的互相转化关系' },
          ].map(c => (
            <div key={c.name} className="quantum-card">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <h4 style={{ color: '#ddd6fe', marginBottom: '0.5rem' }}>{c.name}</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(99,38,237,0.08)', borderColor: 'rgba(139,85,247,0.2)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            著名物理学家开尔文勋爵在 1900 年说：<strong style={{ color: '#c4b5fd' }}>"物理学的天空只剩两朵乌云。"</strong>
            他没想到，这两朵"乌云"——黑体辐射 和 光电效应——将彻底颠覆整个物理世界。
          </p>
        </div>
      </section>

      {/* Blackbody Radiation Simulator */}
      <section className="lesson-section">
        <h3 className="mb-4">🌡️ 第一朵乌云：黑体辐射危机</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          任何有温度的物体都会发光——炉火是红色，熔浆是橙色，太阳是黄白色。但经典物理预测，高温物体辐射的能量在高频（紫外）方向会趋向<strong style={{ color: '#f87171' }}>无穷大</strong>，被称为"<strong style={{ color: '#f87171' }}>紫外灾难</strong>"——这与实验和常识完全矛盾。
        </p>
        <BlackbodySimulator />
      </section>

      {/* Photoelectric Effect */}
      <section className="lesson-section">
        <h3 className="mb-4">💡 第二朵乌云：光电效应的秘密</h3>
        <div className="glass-panel">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem' }}>❌ 经典波动论的预言（错的）</p>
              <ul style={{ fontSize: '0.85rem', color: '#94a3b8', listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>• 光越强，打出的电子能量越大</li>
                <li style={{ marginBottom: '0.5rem' }}>• 任何颜色的光，只要够亮，都能打出电子</li>
                <li>• 需要等一段时间"积累"能量</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem' }}>✅ 实验结果（真实的）</p>
              <ul style={{ fontSize: '0.85rem', color: '#94a3b8', listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>• 电子能量只与光的<strong style={{ color: '#4ade80' }}>频率</strong>有关</li>
                <li style={{ marginBottom: '0.5rem' }}>• 低于某频率（阈值），再强的光也打不出电子</li>
                <li>• 几乎瞬间发生，无需等待</li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => setShowFormula(!showFormula)}
              style={{ background: 'rgba(139,85,247,0.2)', border: '1px solid rgba(139,85,247,0.4)', color: '#c4b5fd', padding: '0.5rem 1.5rem', borderRadius: '99px', cursor: 'pointer', fontSize: '0.85rem' }}>
              {showFormula ? '收起' : '查看爱因斯坦的解释'}
            </button>
            {showFormula && (
              <div className="fade-in" style={{ marginTop: '1rem' }}>
                <div className="formula-box">
                  E = hν — φ = ½mv²
                  <p className="formula-label">光子能量(hν) 减去 逸出功(φ) = 电子动能 | 爱因斯坦，1905</p>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  爱因斯坦颠覆性地提出：光不是连续的波，而是由一个个"光子"组成的粒子流，每个光子携带能量 E = hν（h 是普朗克常数，ν 是频率）。
                  此发现让他获得了 1921 年诺贝尔物理学奖——注意，不是因为相对论！
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="lesson-section">
        <h3 className="mb-4">📅 量子革命时间线（点击展开）</h3>
        <div className="space-y-3">
          {TIMELINE_EVENTS.map((ev, i) => (
            <div
              key={i}
              onClick={() => setActiveEvent(activeEvent === i ? null : i)}
              style={{
                borderRadius: '12px', border: `1px solid ${activeEvent === i ? ev.color + '50' : 'rgba(255,255,255,0.07)'}`,
                background: activeEvent === i ? ev.color + '0f' : 'rgba(10,5,40,0.6)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: ev.color, width: '3rem', flexShrink: 0 }}>{ev.year}</span>
                <div style={{ fontWeight: '700', color: '#e2e8f0' }}>{ev.name}</div>
              </div>
              {activeEvent === i && (
                <div className="fade-in" style={{ padding: '0 1rem 1rem 4rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7' }}>{ev.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(99,38,237,0.1)', borderColor: 'rgba(139,85,247,0.3)', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#c4b5fd', marginBottom: '0.5rem' }}>🎯 核心洞见</p>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
          量子力学不是从某个天才的头脑中凭空而来的——它是为了解释实验与理论之间的矛盾而被"逼出来的"。 下一个问题更奇异：光和电子，到底是<strong style={{ color: '#c4b5fd' }}>波</strong>还是<strong style={{ color: '#c4b5fd' }}>粒子</strong>？
        </p>
      </div>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/quantum-mechanics-intro/lesson/duality')}>
          进入下一章：波粒二象性 →
        </button>
      </section>
    </div>
  );
}
