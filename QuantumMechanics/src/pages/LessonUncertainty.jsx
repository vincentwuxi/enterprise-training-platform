import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Interactive Heisenberg uncertainty visualizer
function UncertaintyVisualizer() {
  const [positionPrecision, setPositionPrecision] = useState(50); // 0=precise, 100=fuzzy

  // Δx · Δp ≥ ħ/2
  // As position gets more precise (precision→100), momentum gets fuzzier
  const deltaX = (100 - positionPrecision) * 0.4 + 5;
  const deltaP = (positionPrecision) * 0.4 + 5;
  const product = (deltaX * deltaP).toFixed(0);
  const isOk = Number(product) >= 2000;

  const posBlobs = Math.round((100 - positionPrecision) / 10) + 1;
  const momBlobs = Math.round(positionPrecision / 10) + 1;

  return (
    <div className="glass-panel">
      <h4 style={{ color: '#ddd6fe', marginBottom: '1rem' }}>
        🎛️ 不确定性原理互动演示
      </h4>
      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
        <span>位置测量越精确 →</span>
        <span>← 动量测量越精确</span>
      </div>
      <input
        type="range" min={0} max={100} value={positionPrecision}
        onChange={e => setPositionPrecision(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#7c3aed', marginBottom: '1.5rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Position display */}
        <div style={{ background: 'rgba(99,38,237,0.1)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(139,85,247,0.25)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>位置不确定度 Δx</p>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            {Array.from({ length: posBlobs }).map((_, i) => (
              <div key={i} style={{
                width: `${Math.max(4, 60 / posBlobs)}px`,
                height: `${Math.max(4, 60 / posBlobs)}px`,
                borderRadius: '50%',
                background: '#7c3aed',
                opacity: 0.7 + i * 0.05,
              }} />
            ))}
          </div>
          <p style={{ fontWeight: '900', color: '#c4b5fd', fontSize: '1.1rem' }}>±{deltaX.toFixed(0)} pm</p>
        </div>

        {/* Momentum display */}
        <div style={{ background: 'rgba(6,182,212,0.08)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(6,182,212,0.2)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>动量不确定度 Δp</p>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            {Array.from({ length: momBlobs }).map((_, i) => (
              <div key={i} style={{
                width: `${Math.max(4, 60 / momBlobs)}px`,
                height: `${Math.max(4, 60 / momBlobs)}px`,
                borderRadius: '50%',
                background: '#06b6d4',
                opacity: 0.7 + i * 0.05,
              }} />
            ))}
          </div>
          <p style={{ fontWeight: '900', color: '#67e8f9', fontSize: '1.1rem' }}>±{deltaP.toFixed(0)} eV·s/m</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '12px', background: isOk ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isOk ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
        <p style={{ color: isOk ? '#4ade80' : '#f87171', fontWeight: '700', fontSize: '0.9rem' }}>
          Δx · Δp = {product} ≥ ħ/2 ✓ 海森堡不确定性原理始终成立
        </p>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '1rem', textAlign: 'center' }}>
        {positionPrecision > 70 ? '📍 知道了精确位置，动量却变得完全模糊——你不知道它往哪个方向跑' :
         positionPrecision < 30 ? '🚀 知道了精确速度，但粒子在哪里？完全无法确定' :
         '⚖️ 在位置和动量之间保持平衡——这是量子世界的宇宙宪法'}
      </p>
    </div>
  );
}

const MISCONCEPTIONS = [
  {
    wrong: '❌ 误解：不确定性是因为仪器不够精确',
    right: '✅ 真相：即使仪器达到理论完美极限，不确定性依然存在。它是宇宙的根本属性，不是测量技术的局限。',
    color: '#ef4444',
  },
  {
    wrong: '❌ 误解：粒子其实有确定的位置和动量，只是我们不知道',
    right: '✅ 真相：在被测量之前，粒子确实没有同时确定的位置和动量——不是"不知道"，是"不存在"。',
    color: '#f97316',
  },
  {
    wrong: '❌ 误解：不确定性只适用于微小粒子',
    right: '✅ 真相：原理对所有物体都成立，但日常宏观物体的 ħ/2 极其微小，完全无法被检测到。',
    color: '#eab308',
  },
];

const APPLICATIONS = [
  { icon: '☀️', name: '太阳的燃烧', desc: '太阳核心温度仍不足以让质子越过经典势垒，但量子不确定性的能量涨落让核聚变成为可能——这就是太阳的热核燃料' },
  { icon: '💾', name: '半导体与晶体管', desc: '现代芯片的晶体管利用量子隧穿效应在纳米尺度工作。不确定性原理是芯片物理极限的根本来源' },
  { icon: '💊', name: '分子稳定性', desc: '原子中的电子因为不确定性原理不能塌缩到原子核上（那样动量不确定性就无穷大了）——这解释了物质为何稳定存在' },
  { icon: '🔬', name: '能量-时间版本', desc: 'ΔE·Δt ≥ ħ/2：能量也不确定！微小时间间隔内的能量涨落产生"虚粒子"，是卡西米尔效应和霍金辐射的理论基础' },
];

export default function LessonUncertainty() {
  const navigate = useNavigate();
  const [showMath, setShowMath] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">❓ 模块三：不确定性原理</div>
        <h1>宇宙不允许被精确测量</h1>
        <p className="lesson-intro">
          1927年，27岁的沃纳·海森堡发现了物理学史上最颠覆性的原理：<strong style={{ color: '#c4b5fd' }}>无论技术多么先进，我们永远无法同时精确知道一个粒子的位置和动量</strong>。而且这不是一个技术问题，是宇宙本身的设计。
        </p>
      </header>

      {/* Core Principle */}
      <section className="lesson-section">
        <h3 className="mb-4">⚡ 核心原理：海森堡不等式</h3>
        <div className="formula-box" style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
          Δx · Δp ≥ ħ/2
          <p className="formula-label">位置不确定度 × 动量不确定度 ≥ 约化普朗克常数的一半 | 1927</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            { sym: 'Δx', name: '位置不确定度', unit: '米 (m)' },
            { sym: 'Δp', name: '动量不确定度', unit: 'kg·m/s' },
            { sym: 'ħ', name: '约化普朗克常数', unit: '≈ 1.055×10⁻³⁴ J·s' },
          ].map(v => (
            <div key={v.sym} style={{ textAlign: 'center', background: 'rgba(99,38,237,0.1)', borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(139,85,247,0.2)' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#c4b5fd', fontFamily: 'Georgia, serif' }}>{v.sym}</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{v.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#475569' }}>{v.unit}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setShowMath(!showMath)}
          style={{ background: 'rgba(139,85,247,0.15)', border: '1px solid rgba(139,85,247,0.3)', color: '#c4b5fd', padding: '0.5rem 1.5rem', borderRadius: '99px', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {showMath ? '收起推导思路' : '查看直觉推导：为什么？'}
        </button>
        {showMath && (
          <div className="fade-in glass-panel" style={{ borderColor: 'rgba(139,85,247,0.3)' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.8' }}>
              波具有频率，物质波的频率决定其动量（p = h/λ）。如果一列波是<strong style={{ color: '#c4b5fd' }}>无限长的纯正弦波</strong>，其频率（动量）精确，但位置无限弥散——到处都是。<br/><br/>
              如果要让波集中在<strong style={{ color: '#c4b5fd' }}>某个位置</strong>（形成"波包"），就必须叠加许多不同频率的波——这使得动量变得不精确。<br/><br/>
              这不是量子力学特有的：声学中的"时间-频率不确定性"（你不能同时精确确定一段声音的时刻和它的音调频率）也遵循相同的数学逻辑。<strong style={{ color: '#c4b5fd' }}>这是波的本质！</strong>
            </p>
          </div>
        )}
      </section>

      {/* Interactive Visualizer */}
      <section className="lesson-section">
        <h3 className="mb-4">🎛️ 互动演示：拖动感受不确定性的权衡</h3>
        <UncertaintyVisualizer />
      </section>

      {/* Misconceptions */}
      <section className="lesson-section">
        <h3 className="mb-4">🚫 最常见的三大误解</h3>
        <div className="space-y-3">
          {MISCONCEPTIONS.map((m, i) => (
            <div key={i} style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,5,40,0.6)', padding: '1rem' }}>
              <p style={{ color: m.color, fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{m.wrong}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.7' }}>{m.right}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Real-world Applications */}
      <section className="lesson-section">
        <h3 className="mb-4">🌍 不确定性原理如何影响真实世界？</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {APPLICATIONS.map(a => (
            <div key={a.name} className="quantum-card">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{a.icon}</div>
              <h4 style={{ color: '#ddd6fe', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{a.name}</h4>
              <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: '1.6' }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/quantum-mechanics-intro/lesson/schrodinger')}>
          进入下一章：薛定谔方程 →
        </button>
      </section>
    </div>
  );
}
