import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Quantum tunneling probability calculator
function TunnelingCalculator() {
  const [particleMass, setParticleMass] = useState('electron'); // electron | proton | alpha
  const [barrierHeight, setBarrierHeight] = useState(5);  // eV
  const [barrierWidth, setBarrierWidth] = useState(1);    // Angstroms
  const [particleEnergy, setParticleEnergy] = useState(2); // eV

  const MASSES = { electron: 9.109e-31, proton: 1.673e-27, alpha: 6.644e-27 };
  const NAMES = { electron: '电子', proton: '质子', alpha: 'α粒子' };

  const calcT = () => {
    if (particleEnergy >= barrierHeight) return 1;
    const m = MASSES[particleMass];
    const hbar = 1.055e-34;
    const eV = 1.602e-19;
    const V = barrierHeight * eV;
    const E = particleEnergy * eV;
    const a = barrierWidth * 1e-10;
    const kappa = Math.sqrt(2 * m * (V - E)) / hbar;
    // T ≈ 16(E/V)(1 - E/V) * exp(-2κa) for κa >> 1
    const T = 16 * (E / V) * (1 - E / V) * Math.exp(-2 * kappa * a);
    return Math.min(T, 1);
  };

  const T = calcT();
  const Tpct = (T * 100).toExponential(2);
  const isSignificant = T > 1e-10;

  return (
    <div className="glass-panel">
      <h4 style={{ color: '#ddd6fe', marginBottom: '1.5rem' }}>
        ⚛️ 量子隧穿概率计算器
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>粒子类型</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.keys(MASSES).map(k => (
              <button key={k} onClick={() => setParticleMass(k)}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer',
                  background: particleMass === k ? 'rgba(139,85,247,0.3)' : 'rgba(139,85,247,0.08)',
                  border: `1px solid ${particleMass === k ? '#7c3aed' : 'rgba(139,85,247,0.2)'}`,
                  color: particleMass === k ? '#ddd6fe' : '#64748b' }}>
                {NAMES[k]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>势垒高度 V: {barrierHeight} eV</label>
          <input type="range" min={1} max={20} value={barrierHeight} onChange={e => setBarrierHeight(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed' }} />
        </div>
        <div>
          <label style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>势垒宽度 a: {barrierWidth} Å</label>
          <input type="range" min={0.1} max={5} step={0.1} value={barrierWidth} onChange={e => setBarrierWidth(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed' }} />
        </div>
        <div>
          <label style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>粒子能量 E: {particleEnergy} eV</label>
          <input type="range" min={0.1} max={barrierHeight - 0.1} step={0.1} value={particleEnergy} onChange={e => setParticleEnergy(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '16px',
        background: isSignificant ? 'rgba(99,38,237,0.12)' : 'rgba(15,23,42,0.8)',
        border: `2px solid ${isSignificant ? 'rgba(139,85,247,0.5)' : 'rgba(255,255,255,0.05)'}` }}>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>隧穿概率 T</p>
        <p style={{ fontSize: '2rem', fontWeight: '900', color: isSignificant ? '#c4b5fd' : '#334155' }}>{Tpct}%</p>
        <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          {particleEnergy >= barrierHeight ? '🎯 粒子能量超过势垒，经典穿越！' :
            T > 1e-3 ? '✅ 量子隧穿概率显著，会在实际中发生' :
            T > 1e-20 ? '⚠️ 隧穿概率极低，但仍非零' : '❌ 有效隧穿概率接近零（粒子太重或势垒太宽）'}
        </p>
      </div>
    </div>
  );
}

const APPLICATIONS = [
  {
    icon: '☀️',
    name: '恒星核聚变',
    desc: '太阳核心温度（~1500万K）按经典计算，质子动能远不足以克服库仑势垒（~1 MeV），但量子隧穿让质子以约 10⁻²⁰ 的概率穿越。每秒数十亿次的尝试使聚变持续发生——太阳因此燃烧了 50 亿年并将再燃烧 50 亿年。',
    color: '#f97316',
  },
  {
    icon: '💾',
    name: '扫描隧道显微镜（STM）',
    desc: '1981年，IBM 发明 STM——针尖与样品之间留有真空间隙，电子通过量子隧穿流过。隧穿概率对距离极度敏感（1 Å 的变化带来数量级的电流变化），使 STM 能分辨单个原子，分辨率达 0.01 Å。',
    color: '#06b6d4',
  },
  {
    icon: '🔋',
    name: '隧道二极管与闪存',
    desc: '隧道二极管利用电子穿越薄势垒形成特殊电流-电压特性，用于高速振荡器。闪存（SSD）中，电子通过量子隧穿穿越氧化层写入和擦除存储单元——这是你电脑存储信息的方式。',
    color: '#22c55e',
  },
  {
    icon: '🧬',
    name: '生物量子效应',
    desc: '酶催化的氢原子转移（如 DNA 复制和 ATP 合成过程中），质子可通过隧穿越过势垒。维生素 B12 等辅酶的氢转移速率中，量子隧穿贡献高达 90%——生命本身依赖量子效应。',
    color: '#a855f7',
  },
  {
    icon: '☢️',
    name: '放射性 α 衰变',
    desc: '重核（如铀-238）中的 α 粒子被强力"囚禁"在核势阱中。α 粒子每秒撞击势垒约 10²¹ 次，每次都有极小的隧穿概率，最终一次成功——铀-238 的半衰期由此确定为 44.7 亿年。',
    color: '#ef4444',
  },
];

export default function LessonTunneling() {
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState(null);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🌀 模块六：量子隧穿</div>
        <h1>穿墙而过的粒子</h1>
        <p className="lesson-intro">
          在经典世界里，一个球没有足够的能量就无法越过山顶——这是常识。但在量子世界，即使没有足够能量，粒子也有一定概率<strong style={{ color: '#c4b5fd' }}>直接穿越势垒</strong>，就像它从未存在一样。这不是魔法，是波函数在势垒内的指数衰减留下了一条非零的"尾巴"。
        </p>
      </header>

      {/* Core concept */}
      <section className="lesson-section">
        <h3 className="mb-4">💡 核心原理：波函数不会突然截止</h3>
        <div className="glass-panel" style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '1rem' }}>
            想象一道无法越过的"墙"——一个方形势垒，高度为 V，粒子能量为 E &lt; V。按经典力学，100% 反弹。
            但波函数是连续的，即使在势垒内部也不会为零，而是以 <code>e^(-κx)</code> 指数衰减。
            如果墙足够薄，波函数在另一侧仍有非零振幅——即粒子有一定概率"出现"在对面！
          </p>
          <div className="formula-box">
            T ≈ 16(E/V)(1-E/V) · e^(-2κa)，其中 κ = √[2m(V-E)] / ħ
            <p className="formula-label">T: 隧穿概率 | κ: 衰减因子 | a: 势垒宽度 | m: 粒子质量</p>
          </div>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(6,182,212,0.1)', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.25)' }}>
          <p style={{ color: '#67e8f9', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>🔑 三大关键因素</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {[
              { what: '势垒越宽', effect: '隧穿概率指数级下降' },
              { what: '势垒越高', effect: '隧穿概率指数级下降' },
              { what: '粒子越重', effect: '隧穿概率指数级下降' },
            ].map(f => (
              <div key={f.what} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{f.what}</p>
                <p style={{ color: '#f87171', fontSize: '0.78rem' }}>→ {f.effect}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="lesson-section">
        <h3 className="mb-4">🧮 互动计算器：探索不同参数下的隧穿概率</h3>
        <TunnelingCalculator />
      </section>

      {/* Applications */}
      <section className="lesson-section">
        <h3 className="mb-4">🌍 量子隧穿正在改变世界（点击展开）</h3>
        <div className="space-y-3">
          {APPLICATIONS.map((a, i) => (
            <div key={i} onClick={() => setActiveApp(activeApp === i ? null : i)}
              style={{ cursor: 'pointer', padding: '1rem', borderRadius: '12px', transition: 'all 0.2s',
                background: activeApp === i ? a.color + '0f' : 'rgba(10,5,40,0.6)',
                border: `1px solid ${activeApp === i ? a.color + '50' : 'rgba(255,255,255,0.07)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{a.icon}</span>
                <h4 style={{ color: '#e2e8f0', margin: 0, fontSize: '0.95rem' }}>{a.name}</h4>
              </div>
              {activeApp === i && (
                <p className="fade-in" style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.75', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {a.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/quantum-mechanics-intro/lesson/future')}>
          进入最终章：量子技术的未来 →
        </button>
      </section>
    </div>
  );
}
