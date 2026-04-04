import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Animated cat in superposition
function SchrodingerCat() {
  const [boxOpen, setBoxOpen] = useState(false);
  const [isAlive, setIsAlive] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [superpositionFrame, setSuperpositionFrame] = useState(0);

  useEffect(() => {
    if (!boxOpen) {
      const interval = setInterval(() => {
        setSuperpositionFrame(f => f + 1);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [boxOpen]);

  const openBox = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setBoxOpen(true);
      setIsAlive(Math.random() > 0.5);
      setIsAnimating(false);
    }, 600);
  };

  const reset = () => {
    setBoxOpen(false);
    setIsAlive(null);
    setSuperpositionFrame(0);
  };

  return (
    <div className="glass-panel" style={{ textAlign: 'center' }}>
      <h4 style={{ color: '#ddd6fe', marginBottom: '1.5rem' }}>🐱 薛定谔的猫：叠加态可视化</h4>

      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
        {/* Box */}
        <div style={{
          width: '200px', height: '180px', border: '3px solid rgba(139,85,247,0.6)',
          borderRadius: '12px', background: 'rgba(10,5,40,0.9)', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: boxOpen ? 'none' : '0 0 30px rgba(139,85,247,0.4)',
          transition: 'all 0.6s ease',
          opacity: isAnimating ? 0.5 : 1,
          margin: '0 auto',
        }}>
          {!boxOpen ? (
            <div>
              {/* Superposition animation */}
              <div style={{ fontSize: superpositionFrame % 2 === 0 ? '3rem' : '2.5rem', opacity: superpositionFrame % 2 === 0 ? 1 : 0.5, transition: 'all 0.3s' }}>
                {superpositionFrame % 4 < 2 ? '😺' : '💀'}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '0.5rem' }}>
                |ψ⟩ = √½|生⟩ + √½|死⟩
              </p>
            </div>
          ) : (
            <div className="fade-in">
              <div style={{ fontSize: '4rem' }}>{isAlive ? '😺' : '💀'}</div>
              <p style={{ color: isAlive ? '#4ade80' : '#f87171', fontWeight: '700', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {isAlive ? '✅ 猫是活的！' : '❌ 猫已死亡！'}
              </p>
            </div>
          )}

          {/* Lid indicator */}
          {!boxOpen && (
            <div style={{ position: 'absolute', top: '-2px', left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, transparent, rgba(139,85,247,0.8), transparent)' }} />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!boxOpen ? (
          <button onClick={openBox}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '99px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
            🔓 打开盒子（测量！）
          </button>
        ) : (
          <button onClick={reset}
            style={{ background: 'rgba(139,85,247,0.2)', color: '#c4b5fd', border: '1px solid rgba(139,85,247,0.4)', padding: '0.75rem 2rem', borderRadius: '99px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
            🔄 重新做实验
          </button>
        )}
      </div>

      <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '1.5rem', maxWidth: '400px', margin: '1.5rem auto 0' }}>
        {boxOpen
          ? `波函数坍缩！盒子被打开时，叠加态瞬间坍缩为确定结果。每次实验都是一次新的随机。`
          : '盒子未打开时，猫处于"生"与"死"的量子叠加态，两种可能同时存在。'}
      </p>
    </div>
  );
}

// Wave function probability visualizer
function WaveFunctionViz() {
  const [n, setN] = useState(1); // quantum number
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, H);

    const midY = H / 2;
    const amplitude = H * 0.35;

    // Draw wave function (ψ)
    ctx.beginPath();
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x++) {
      const xNorm = x / W;
      const y = midY - amplitude * Math.sin(n * Math.PI * xNorm) * Math.exp(-xNorm * 0.2);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw |ψ|² (probability density)
    for (let x = 0; x < W; x++) {
      const xNorm = x / W;
      const psi = Math.sin(n * Math.PI * xNorm) * Math.exp(-xNorm * 0.2);
      const prob = psi * psi;
      const barH = prob * H * 0.7;
      const alpha = 0.15 + prob * 0.5;
      ctx.fillStyle = `rgba(168,85,247,${alpha})`;
      ctx.fillRect(x, H - barH, 1, barH);
    }

    // Labels
    ctx.fillStyle = '#7c3aed';
    ctx.font = '11px monospace';
    ctx.fillText(`ψ(x) — 波函数 (n=${n})`, 10, 20);
    ctx.fillStyle = '#a855f7';
    ctx.font = '11px monospace';
    ctx.fillText(`|ψ|² — 概率密度`, 10, 35);

    // Midline
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [n]);

  return (
    <div className="quantum-viz" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#64748b', fontSize: '0.8rem', alignSelf: 'center' }}>量子数 n:</span>
        {[1, 2, 3, 4, 5].map(num => (
          <button key={num} onClick={() => setN(num)}
            style={{ width: '32px', height: '32px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem',
              background: n === num ? 'rgba(139,85,247,0.4)' : 'rgba(139,85,247,0.1)',
              border: `1px solid ${n === num ? '#7c3aed' : 'rgba(139,85,247,0.2)'}`,
              color: n === num ? '#ddd6fe' : '#64748b', cursor: 'pointer' }}>
            {num}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} width={600} height={200} style={{ width: '100%', borderRadius: '12px' }} />
      <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.5rem', textAlign: 'center' }}>
        紫色曲线 ψ(x) = 波函数 | 紫色背景 |ψ|² = 粒子在该位置被发现的概率 | n={n} 个波峰
      </p>
    </div>
  );
}

const INTERPRETATIONS = [
  {
    name: '哥本哈根诠释（主流）',
    author: '玻尔、海森堡',
    core: '波函数是完整的现实描述。测量导致波函数坍缩。在测量前谈论粒子"真正在哪"是无意义的。',
    verdict: '简单实用，大多数物理学家使用',
    color: '#7c3aed',
  },
  {
    name: '多宇宙诠释',
    author: '休·艾弗雷特（1957）',
    core: '波函数永不坍缩。每次测量，宇宙分裂成多个分支，每个结果在不同的"宇宙"中都实现了。你在其中一个宇宙看到猫活着。',
    verdict: '数学优雅，没有坍缩问题，但代价是无穷多个宇宙',
    color: '#06b6d4',
  },
  {
    name: '隐变量理论',
    author: '玻姆、爱因斯坦（支持）',
    core: '量子随机性只是"隐藏变量"带来的表象。粒子其实有确定的位置，只是被隐变量导引。贝尔不等式实验否定了局域隐变量。',
    verdict: '爱因斯坦的最爱，但实验已排除局域版本',
    color: '#f59e0b',
  },
];

export default function LessonSchrodinger() {
  const navigate = useNavigate();
  const [activeInterp, setActiveInterp] = useState(0);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🐱 模块四：薛定谔方程</div>
        <h1>既生又死：量子叠加态</h1>
        <p className="lesson-intro">
          薛定谔方程是量子力学的灵魂——它预言了粒子的"波函数"如何随时间演化。而波函数最震撼的预言是：在被观测之前，粒子可以同时处于多种状态的<strong style={{ color: '#c4b5fd' }}>叠加态</strong>。薛定谔用一只猫把这个荒诞推到了极致。
        </p>
      </header>

      {/* Schrödinger Equation */}
      <section className="lesson-section">
        <h3 className="mb-4">📐 薛定谔方程：量子世界的 F=ma</h3>
        <div className="formula-box" style={{ fontSize: '1.3rem' }}>
          iħ ∂ψ/∂t = Ĥψ
          <p className="formula-label">i: 虚数单位 | ħ: 约化普朗克常数 | ψ: 波函数 | Ĥ: 哈密顿算符（总能量）</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            { term: 'ψ (波函数)', meaning: '包含了粒子所有可测量量的完整信息。|ψ|² 是概率密度。' },
            { term: 'Ĥ (哈密顿算符)', meaning: '系统的总能量算符，包含动能和势能，决定系统如何演化。' },
            { term: 'iħ ∂ψ/∂t', meaning: '波函数随时间的变化率，是虚数的——量子演化本质上是复数的。' },
          ].map(t => (
            <div key={t.term} className="quantum-card">
              <code style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#c4b5fd' }}>{t.term}</code>
              <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: '1.6' }}>{t.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wave Function Visualizer */}
      <section className="lesson-section">
        <h3 className="mb-4">🌊 波函数可视化：氢原子轨道</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
          量子数 n 决定电子可能存在的能量轨道。n 越大，波函数有越多的波峰，概率分布越分散——电子有更大的机会出现在更远的地方。
        </p>
        <WaveFunctionViz />
      </section>

      {/* Schrödinger's Cat */}
      <section className="lesson-section">
        <h3 className="mb-4">🐱 薛定谔的猫：叠加态思想实验</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          1935年，薛定谔本人提出这个思想实验来<strong style={{ color: '#f97316' }}>嘲讽</strong>量子力学的荒谬性：如果把一只猫放进盒子，触发装置由一个放射性原子的衰变决定，那么在打开盒子之前，猫应该与原子一样，处于"生"与"死"的叠加态！
        </p>
        <SchrodingerCat />
      </section>

      {/* Interpretations */}
      <section className="lesson-section">
        <h3 className="mb-4">🧩 三种量子力学诠释（点击切换）</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {INTERPRETATIONS.map((interp, i) => (
            <button key={i} onClick={() => setActiveInterp(i)}
              style={{ padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '700',
                background: activeInterp === i ? interp.color + '30' : 'rgba(99,38,237,0.08)',
                border: `1px solid ${activeInterp === i ? interp.color + '80' : 'rgba(139,85,247,0.2)'}`,
                color: activeInterp === i ? '#f0f0ff' : '#64748b', cursor: 'pointer' }}>
              {interp.name.split('（')[0]}
            </button>
          ))}
        </div>
        <div className="glass-panel" style={{ borderColor: INTERPRETATIONS[activeInterp].color + '30' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#ddd6fe' }}>{INTERPRETATIONS[activeInterp].name}</h4>
              <p style={{ color: '#475569', fontSize: '0.8rem' }}>提出者：{INTERPRETATIONS[activeInterp].author}</p>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '0.75rem' }}>
            {INTERPRETATIONS[activeInterp].core}
          </p>
          <div style={{ background: INTERPRETATIONS[activeInterp].color + '15', borderLeft: `3px solid ${INTERPRETATIONS[activeInterp].color}`, padding: '0.75rem', borderRadius: '0 8px 8px 0' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>评价：{INTERPRETATIONS[activeInterp].verdict}</p>
          </div>
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/quantum-mechanics-intro/lesson/entanglement')}>
          进入下一章：量子纠缠 →
        </button>
      </section>
    </div>
  );
}
