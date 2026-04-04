import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Double-slit experiment canvas animation
function DoubleSlit() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('wave'); // 'wave' | 'particle' | 'observed'
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const W = canvas.width, H = canvas.height;

    const particles = [];
    const hits = [];

    const drawWaveMode = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      // Draw slits barrier
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(W * 0.38, 0, 8, H * 0.38);
      ctx.fillRect(W * 0.38, H * 0.44, 8, H * 0.13);
      ctx.fillRect(W * 0.38, H * 0.57, 8, H * 0.43);

      // Slit labels
      ctx.fillStyle = '#818cf8';
      ctx.font = '11px monospace';
      ctx.fillText('狭缝A', W * 0.2, H * 0.4 + 5);
      ctx.fillText('狭缝B', W * 0.2, H * 0.565 + 5);

      // Draw wave interference pattern (right side)
      for (let y = 0; y < H; y++) {
        const slitA_y = H * 0.41;
        const slitB_y = H * 0.565;
        const dA = Math.sqrt(((W * 0.4) - W) ** 2 + (y - slitA_y) ** 2);
        const dB = Math.sqrt(((W * 0.4) - W) ** 2 + (y - slitB_y) ** 2);
        const phase = ((dA - dB) / 50) * 2 * Math.PI + t * 0.05;
        const intensity = (Math.cos(phase) + 1) / 2;
        const alpha = intensity * 0.7;
        ctx.fillStyle = `rgba(139,85,247,${alpha})`;
        ctx.fillRect(W * 0.41, y, W * 0.59, 1);
      }

      // Incoming waves (left side)
      for (let i = 0; i < 6; i++) {
        const x = W * 0.38 - ((t * 1.5 + i * 20) % (W * 0.38));
        ctx.beginPath();
        ctx.strokeStyle = `rgba(99,38,237,${0.2 + i * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('干涉条纹 (波)', W * 0.7, 20);
    };

    const drawParticleMode = (observed) => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      // Barrier
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(W * 0.38, 0, 8, H * 0.38);
      ctx.fillRect(W * 0.38, H * 0.44, 8, H * 0.13);
      ctx.fillRect(W * 0.38, H * 0.57, 8, H * 0.43);

      // Add new particles
      if (Math.random() < 0.3) {
        const slit = Math.random() < 0.5 ? H * 0.41 : H * 0.565;
        particles.push({ x: W * 0.4, y: slit + (Math.random() - 0.5) * 20, vx: 1.5, vy: (Math.random() - 0.5) * 0.8, age: 0 });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.age++;
        if (p.x > W * 0.85) {
          hits.push({ x: W * 0.9, y: p.y, age: 0, observed });
          particles.splice(i, 1);
          if (hits.length > 400) hits.shift();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#a78bfa';
          ctx.fill();
        }
      }

      // Draw hits on screen
      hits.forEach(h => {
        h.age++;
        const alpha = Math.max(0, 1 - h.age / 200);
        ctx.beginPath();
        ctx.arc(h.x, h.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = observed ? `rgba(6,182,212,${alpha})` : `rgba(168,85,247,${alpha})`;
        ctx.fill();
      });

      // Draw detector in observed mode
      if (observed) {
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('🔍 探测器', W * 0.4, 15);
        ctx.strokeStyle = '#06b6d440';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(W * 0.45, 0); ctx.lineTo(W * 0.45, H);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(observed ? '两条条纹 (粒子)' : '干涉条纹正在形成！', W * 0.6, 20);
    };

    const animate = () => {
      t++;
      if (mode === 'wave') drawWaveMode();
      else if (mode === 'particle') drawParticleMode(false);
      else drawParticleMode(true);
      animRef.current = requestAnimationFrame(animate);
    };

    particles.length = 0;
    hits.length = 0;
    t = 0;
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [mode]);

  return (
    <div className="quantum-viz" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { key: 'wave', label: '🌊 光波模式', desc: '不观察' },
          { key: 'particle', label: '🔵 粒子射出', desc: '不观察' },
          { key: 'observed', label: '👁 加装探测器', desc: '观察' },
        ].map(m => (
          <button
            key={m.key} onClick={() => setMode(m.key)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '700',
              background: mode === m.key ? 'rgba(139,85,247,0.3)' : 'rgba(139,85,247,0.08)',
              border: `1px solid ${mode === m.key ? '#7c3aed' : 'rgba(139,85,247,0.2)'}`,
              color: mode === m.key ? '#ddd6fe' : '#64748b', cursor: 'pointer',
            }}>
            {m.label}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} width={600} height={300} style={{ width: '100%', borderRadius: '12px' }} />
      <p style={{ fontSize: '0.8rem', color: '#475569', textAlign: 'center', marginTop: '0.5rem' }}>
        {mode === 'observed' ? '⚠️ 加装探测器后，干涉条纹消失——观测行为本身影响了结果！' : mode === 'wave' ? '电子以波传播，穿过双缝后产生干涉' : '电子像粒子一样一个一个射出，却会形成干涉条纹'}
      </p>
    </div>
  );
}

const THOUGHT_EXPERIMENTS = [
  {
    title: '单缝 vs 双缝',
    content: '关上一条缝，干涉条纹消失，屏幕上只有一条亮纹。打开两条缝，干涉条纹出现。但一次只发射一个电子也如此！一个电子是"同时穿过了两条缝"的？',
    icon: '🔬',
    insight: '每个单独的电子展现出波的整体模式，好像它"知道"所有可能的路径。',
  },
  {
    title: '观察就是干扰',
    content: '在缝边放探测器，试图"看"电子到底穿过哪条缝——干涉条纹立刻消失！决定观察的那一刻，量子世界就坍缩成了经典世界。',
    icon: '👁️',
    insight: '观测行为本身会扰动量子系统。这不是仪器精度问题，而是量子力学的基本原则。',
  },
  {
    title: '延迟选择实验',
    content: '约翰·惠勒设计的实验更诡异：可以在电子到达"很久之后"才决定是否观测。似乎电子在过去的路径取决于未来你的决定。',
    icon: '⏰',
    insight: '量子测量是对历史的"回溯"——这表明量子事件在被测量前没有确定的"发生方式"。',
  },
];

export default function LessonDuality() {
  const navigate = useNavigate();
  const [activeExp, setActiveExp] = useState(null);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🌊 模块二：波粒二象性</div>
        <h1>电子是波还是粒子？</h1>
        <p className="lesson-intro">
          这是物理史上最美与最令人崩溃的实验：双缝实验。理查德·费曼说，它包含了量子力学的<strong style={{ color: '#c4b5fd' }}>全部奥秘</strong>。当你真正理解它，你对"现实"的直觉会被彻底颠覆。
        </p>
      </header>

      {/* Setup */}
      <section className="lesson-section">
        <h3 className="mb-4">🔬 双缝实验：终极谜题</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
          想象一堵墙上有两条狭缝，墙后有一块屏幕。我们往缝里发射东西，观察屏幕上的落点分布。
          先用水波试试，再用沙粒，最后用一个个单独的电子……结果你根本猜不到。
        </p>
        <DoubleSlit />
      </section>

      {/* De Broglie Wavelength */}
      <section className="lesson-section">
        <h3 className="mb-4">📐 德布罗意物质波：万物皆有波长</h3>
        <div className="glass-panel">
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            1924年，路易·德布罗意在博士论文中提出：不仅仅是光子，所有物质粒子都具有波动性。其波长由以下公式决定：
          </p>
          <div className="formula-box">
            λ = h / p = h / (mv)
            <p className="formula-label">λ: 波长 | h: 普朗克常数 (6.626×10⁻³⁴ J·s) | p: 动量 | m: 质量 | v: 速度</p>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {[
              { obj: '电子（光速1%）', lambda: '~0.24 nm', note: '与原子间距同等量级，量子效应显著' },
              { obj: '棒球（140 km/h）', lambda: '~1×10⁻³⁴ m', note: '远小于原子核，量子效应完全不可测' },
              { obj: '你（步行）', lambda: '~10⁻³⁵ m', note: '比普朗克长度还小，量子效应为零' },
            ].map(r => (
              <div key={r.obj} className="quantum-card" style={{ textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{r.obj}</p>
                <p style={{ color: '#c4b5fd', fontWeight: '900', fontSize: '1rem' }}>{r.lambda}</p>
                <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem' }}>{r.note}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99,38,237,0.1)', borderRadius: '12px' }}>
            <p style={{ color: '#c4b5fd', fontSize: '0.875rem' }}>
              💡 这解释了为什么在日常生活中感受不到量子效应——我们的物体太重（动量太大），波长极短，量子效应完全湮没在经典世界中。
            </p>
          </div>
        </div>
      </section>

      {/* Thought Experiments */}
      <section className="lesson-section">
        <h3 className="mb-4">🧠 深入思考：三个令人崩溃的变体（点击展开）</h3>
        <div className="space-y-3">
          {THOUGHT_EXPERIMENTS.map((e, i) => (
            <div
              key={i}
              onClick={() => setActiveExp(activeExp === i ? null : i)}
              className="quantum-card"
              style={{ cursor: 'pointer', borderColor: activeExp === i ? 'rgba(139,85,247,0.5)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{e.icon}</span>
                <h4 style={{ color: '#ddd6fe', margin: 0 }}>{e.title}</h4>
              </div>
              {activeExp === i && (
                <div className="fade-in" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{e.content}</p>
                  <div style={{ background: 'rgba(139,85,247,0.15)', borderLeft: '3px solid #7c3aed', padding: '0.75rem', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ color: '#c4b5fd', fontSize: '0.875rem' }}>🎯 {e.insight}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', borderColor: 'rgba(139,85,247,0.3)', background: 'rgba(99,38,237,0.1)', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#c4b5fd', marginBottom: '0.5rem' }}>
          🌊🔵 真相：二象性
        </p>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8' }}>
          电子（以及所有量子粒子）既不是波，也不是粒子——它是一种全新的存在，<strong style={{ color: '#c4b5fd' }}>在不被观测时像波一样传播，在被观测时像粒子一样出现</strong>。
          这个答案不会让你的直觉满意，但它是真的。下一讲，我们深挖这个矛盾的根源——不确定性原理。
        </p>
      </div>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/quantum-mechanics-intro/lesson/uncertainty')}>
          进入下一章：不确定性原理 →
        </button>
      </section>
    </div>
  );
}
