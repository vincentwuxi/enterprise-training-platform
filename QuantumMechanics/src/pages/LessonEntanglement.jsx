import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Entanglement simulator
function EntanglementSim() {
  const [measured, setMeasured] = useState(null); // null | {alice, bob}
  const [history, setHistory] = useState([]);

  const measure = () => {
    // 50/50 random, but always anti-correlated (Bell state |↑↓⟩ - |↓↑⟩)
    const alice = Math.random() > 0.5 ? '↑' : '↓';
    const bob = alice === '↑' ? '↓' : '↑'; // always opposite = entangled!
    const result = { alice, bob };
    setMeasured(result);
    setHistory(h => [result, ...h].slice(0, 8));
  };

  const reset = () => {
    setMeasured(null);
  };

  return (
    <div className="glass-panel">
      <h4 style={{ color: '#ddd6fe', marginBottom: '1.5rem', textAlign: 'center' }}>
        🔮 纠缠粒子测量模拟器
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Alice */}
        <div style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '16px', background: 'rgba(99,38,237,0.1)', border: `2px solid ${measured ? 'rgba(139,85,247,0.6)' : 'rgba(139,85,247,0.2)'}`, transition: 'border-color 0.3s' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>🔭 爱丽丝（北京）</p>
          <div style={{ fontSize: '3rem', minHeight: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {measured ? (
              <span className="fade-in" style={{ color: measured.alice === '↑' ? '#a78bfa' : '#67e8f9' }}>{measured.alice}</span>
            ) : (
              <span style={{ color: '#334155', fontSize: '1.5rem' }}>?</span>
            )}
          </div>
          <p style={{ color: '#475569', fontSize: '0.75rem' }}>{measured ? `自旋${measured.alice === '↑' ? '向上' : '向下'}` : '叠加态中...'}</p>
        </div>

        {/* Connection indicator */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🔗</div>
          <div style={{
            width: '40px', height: '2px', margin: '0 auto',
            background: measured ? 'linear-gradient(to right, #7c3aed, #06b6d4)' : 'rgba(99,38,237,0.3)',
            transition: 'background 0.3s',
            boxShadow: measured ? '0 0 8px rgba(139,85,247,0.6)' : 'none',
          }} />
          <p style={{ fontSize: '0.65rem', color: '#334155', marginTop: '0.25rem' }}>量子纠缠</p>
        </div>

        {/* Bob */}
        <div style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '16px', background: 'rgba(6,182,212,0.08)', border: `2px solid ${measured ? 'rgba(6,182,212,0.5)' : 'rgba(6,182,212,0.15)'}`, transition: 'border-color 0.3s' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>🔭 鲍勃（上海）</p>
          <div style={{ fontSize: '3rem', minHeight: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {measured ? (
              <span className="fade-in" style={{ color: measured.bob === '↑' ? '#a78bfa' : '#67e8f9' }}>{measured.bob}</span>
            ) : (
              <span style={{ color: '#334155', fontSize: '1.5rem' }}>?</span>
            )}
          </div>
          <p style={{ color: '#475569', fontSize: '0.75rem' }}>{measured ? `自旋${measured.bob === '↑' ? '向上' : '向下'}` : '叠加态中...'}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {!measured ? (
          <button onClick={measure}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', border: 'none', padding: '0.75rem 2.5rem', borderRadius: '99px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 20px rgba(124,58,237,0.5)' }}>
            ⚡ 爱丽丝测量粒子A
          </button>
        ) : (
          <div>
            <p className="fade-in" style={{ color: '#4ade80', fontWeight: '700', marginBottom: '0.75rem' }}>
              ✅ 粒子B（在上海！）立即显示反向自旋：{measured.bob === '↑' ? '向上' : '向下'}
            </p>
            <button onClick={reset}
              style={{ background: 'rgba(139,85,247,0.2)', color: '#c4b5fd', border: '1px solid rgba(139,85,247,0.4)', padding: '0.6rem 1.5rem', borderRadius: '99px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
              🔄 重置（新的纠缠对）
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
          <p style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '0.5rem' }}>历史记录（始终反相关）：</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {history.map((h, i) => (
              <span key={i} style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(99,38,237,0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                A:{h.alice} B:{h.bob}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const BELL_EXPERIMENTS = [
  { year: '1972', team: 'Clauser & Freedman（伯克利）', result: '✅ 违反贝尔不等式，支持量子力学', note: '首次实验验证' },
  { year: '1982', team: 'Aspect 等（巴黎）', result: '✅ 更严格验证，排除时间漏洞', note: '首次动态测量' },
  { year: '2015', team: 'Hensen 等（代尔夫特）', result: '✅ "无漏洞"实验，同时关闭主要漏洞', note: '里程碑实验' },
  { year: '2022', team: 'Aspect, Clauser, Zeilinger', result: '🏆 三人获得诺贝尔物理奖', note: '量子纠缠实验的最高荣誉' },
];

const NO_FASTER_THAN_LIGHT = [
  { q: '纠缠粒子之间真的在传递信息吗？', a: '不！测量结果是随机的。爱丽丝不能控制自己测量到什么，所以无法编码信息。只有双方对比各自的结果，才能发现相关性——而这个对比过程需要通过普通（光速以内）的通信。' },
  { q: '为什么爱因斯坦把它叫做"幽灵般的超距作用"？', a: '爱因斯坦认为这意味着量子力学不完整，必须有"隐变量"（局域实在性）来解释。但贝尔不等式实验证明，任何局域隐变量理论都与量子力学预测不符。爱因斯坦错了。' },
  { q: '量子通信是利用纠缠传递信息吗？', a: '量子密钥分发（QKD）利用纠缠的统计关联来探测窃听者。但信息本身仍然通过经典信道传递。量子隐形传态需要一条经典信道辅助，总体速度不超光速。' },
];

export default function LessonEntanglement() {
  const navigate = useNavigate();
  const [expandedQ, setExpandedQ] = useState(null);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🔗 模块五：量子纠缠</div>
        <h1>幽灵般的超距作用</h1>
        <p className="lesson-intro">
          爱因斯坦一生中最大的对手不是任何人，而是这个量子力学的奇异预言：两个粒子可以在宇宙任何地方保持瞬时关联。他嘲笑说这是<strong style={{ color: '#c4b5fd' }}>"幽灵般的超距作用"</strong>，但实验一次次证明他错了。
        </p>
      </header>

      {/* What is Entanglement */}
      <section className="lesson-section">
        <h3 className="mb-4">🔗 什么是量子纠缠？</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.8' }}>
          两个粒子在相互作用后，可以形成一个整体量子态——无论它们被分开多远，测量其中一个的属性，另一个的属性会立即（<strong style={{ color: '#c4b5fd' }}>瞬时！</strong>）确定。这种关联超越了任何经典关联（比如事先约定），是真正由量子力学产生的非局域相关性。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ color: '#f87171', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>❌ 普通关联（经典）</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              像一双手套——左手套在北京，右手套在上海。你看到北京的是左手，就知道上海的是右手。
              但这个"关联"是提前确定的，没有神秘之处。
            </p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>✅ 量子纠缠（非经典）</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              纠缠的粒子在测量前<strong style={{ color: '#4ade80' }}>都没有确定的属性</strong>——不是不知道，是真的不存在。
              贝尔不等式实验证明，这不能用任何隐藏的预先协议来解释。
            </p>
          </div>
        </div>
      </section>

      {/* Simulator */}
      <section className="lesson-section">
        <h3 className="mb-4">🎮 交互模拟：纠缠粒子测量</h3>
        <EntanglementSim />
      </section>

      {/* Bell Inequality experiments */}
      <section className="lesson-section">
        <h3 className="mb-4">🏆 贝尔不等式实验：历史上最重要的实验之一</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
          1964年，约翰·斯图尔特·贝尔提出了一个数学不等式：如果自然界是"局域实在"的（粒子有隐藏属性，且没有超光速影响），那么测量结果必须满足此不等式。量子力学预测它会被违反。实验结果支持量子力学。
        </p>
        <div className="space-y-3">
          {BELL_EXPERIMENTS.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(10,5,40,0.6)', border: '1px solid rgba(139,85,247,0.15)', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '3.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: '900', color: '#c4b5fd', fontSize: '0.9rem' }}>{e.year}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{e.team}</p>
                <p style={{ color: e.result.includes('🏆') ? '#fbbf24' : '#4ade80', fontSize: '0.85rem' }}>{e.result}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap' }}>{e.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="lesson-section">
        <h3 className="mb-4">❓ 最想问的三个问题（点击展开）</h3>
        <div className="space-y-3">
          {NO_FASTER_THAN_LIGHT.map((item, i) => (
            <div key={i} onClick={() => setExpandedQ(expandedQ === i ? null : i)}
              style={{ cursor: 'pointer', padding: '1rem', borderRadius: '12px', border: `1px solid ${expandedQ === i ? 'rgba(139,85,247,0.4)' : 'rgba(255,255,255,0.07)'}`, background: expandedQ === i ? 'rgba(99,38,237,0.1)' : 'rgba(10,5,40,0.6)', transition: 'all 0.2s' }}>
              <p style={{ color: '#ddd6fe', fontWeight: '600', fontSize: '0.9rem' }}>Q: {item.q}</p>
              {expandedQ === i && (
                <p className="fade-in" style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.7', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  A: {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/quantum-mechanics-intro/lesson/tunneling')}>
          进入下一章：量子隧穿 →
        </button>
      </section>
    </div>
  );
}
