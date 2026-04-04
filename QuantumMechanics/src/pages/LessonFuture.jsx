import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import './LessonCommon.css';

const QUANTUM_TECH = [
  {
    icon: '💻',
    name: '量子计算机',
    desc: '利用量子叠加和纠缠，量子比特（Qubit）可同时处于 0 和 1 的叠加态，实现"量子并行计算"。',
    status: '🟡 研究阶段',
    leaders: ['IBM（Eagle, Osprey 系列）', 'Google（Sycamore）', 'ionQ', '中国（九章光量子）'],
    breakthrough: 'Google 2019年用 Sycamore 在 200 秒内完成经典超算需 10,000 年的计算——量子优越性首次实现',
    applications: ['破解 RSA 加密（当 Qubit 达数百万稳定位）', '药物分子模拟与材料发现', '机器学习优化加速', '密码学革命'],
    color: '#7c3aed',
  },
  {
    icon: '🔐',
    name: '量子密码学（QKD）',
    desc: '量子密钥分发利用量子测量的不可克隆性：任何窃听行为都会干扰量子态，被立即发现。物理上无条件安全。',
    status: '🟢 已在商用',
    leaders: ['中国"墨子号"卫星（2017，全球首个）', '瑞士 ID Quantique', '东芝量子密码'],
    breakthrough: '中国在 2020 年实现跨越 4,600 km 的量子密钥分发（北京-维也纳），信息理论上无条件保密',
    applications: ['银行与金融安全通信', '政府机密通信', '医疗数据保护', '抵抗量子计算机破解威胁'],
    color: '#059669',
  },
  {
    icon: '🔬',
    name: '量子传感器',
    desc: '量子系统对环境扰动极度敏感（这在计算中是噪声，在传感中是优势）。量子传感器的精度超越任何经典设备。',
    status: '🟢 已在商用',
    leaders: ['Q-NEXT', 'Honeywell', '中国科大', 'MIT Lincoln Lab'],
    breakthrough: '原子钟精度达 10^-18 秒（宇宙年龄内误差不超过 1 秒），是 GPS 精度的核心',
    applications: ['GPS 替代（水下/地下导航）', '脑磁图（无创神经成像）', '地下资源探测', '引力波探测（LIGO）'],
    color: '#0ea5e9',
  },
  {
    icon: '🌐',
    name: '量子互联网',
    desc: '通过量子纠缠和量子隐形传态，构建全球量子通信网络，在任意节点间安全分发量子密钥。',
    status: '🔴 研究阶段',
    leaders: ['荷兰 QuTech', '中国量子城域网（合肥、北京）', 'AWS Quantum Networking'],
    breakthrough: '2021年：中国科大实现千公里尺度量子纠缠分发，量子中继节点首次实现',
    applications: ['量子安全的全球金融网络', '分布式量子计算集群', '量子密钥的长距离分发'],
    color: '#a855f7',
  },
];

const QUANTUM_MILESTONES_FUTURE = [
  { year: '2025', event: '100 逻辑量子比特', desc: '错误纠正后的逻辑 Qubit 规模扩大，为实用算法奠基' },
  { year: '2027-2030', event: '量子优势实用化', desc: '量子计算机首次在药物发现或物流优化中超越经典计算' },
  { year: '2030+', event: '量子互联网节点', desc: '10+ 城市量子网络节点联通，量子密钥全球分发' },
  { year: '2035+', event: '千逻辑比特时代', desc: 'RSA 加密威胁成为现实，后量子密码学标准全面部署' },
  { year: '2050+', event: '量子计算机普及', desc: '类似今天云计算般，量子计算作为云服务面向普通开发者' },
];

export default function LessonFuture() {
  const navigate = useNavigate();
  const [activeTech, setActiveTech] = useState(null);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🚀 模块七：量子技术革命</div>
        <h1>量子未来：正在到来的革命</h1>
        <p className="lesson-intro">
          20 世纪，量子力学给了我们激光、半导体、MRI——这是第一次量子革命。现在，<strong style={{ color: '#c4b5fd' }}>第二次量子革命</strong>正在发生：我们不再只是观察和利用量子现象，而是主动<strong style={{ color: '#c4b5fd' }}>设计和控制单个量子系统</strong>，打造量子计算机、量子互联网和量子传感器。
        </p>
      </header>

      {/* Four pillars */}
      <section className="lesson-section">
        <h3 className="mb-4">🔬 四大量子技术支柱（点击展开详情）</h3>
        <div className="space-y-3">
          {QUANTUM_TECH.map((tech, i) => (
            <div key={i} onClick={() => setActiveTech(activeTech === i ? null : i)}
              style={{ cursor: 'pointer', borderRadius: '16px', padding: '1.25rem', transition: 'all 0.2s',
                background: activeTech === i ? tech.color + '0f' : 'rgba(10,5,40,0.7)',
                border: `1px solid ${activeTech === i ? tech.color + '50' : 'rgba(139,85,247,0.1)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2rem' }}>{tech.icon}</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#e2e8f0', margin: '0 0 0.25rem', fontSize: '1rem' }}>{tech.name}</h4>
                  <p style={{ color: '#475569', fontSize: '0.8rem', margin: 0 }}>{tech.desc}</p>
                </div>
                <span style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.75rem', borderRadius: '99px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{tech.status}</span>
              </div>

              {activeTech === i && (
                <div className="fade-in" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase' }}>主要领导者</p>
                      {tech.leaders.map(l => (
                        <p key={l} style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>• {l}</p>
                      ))}
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase' }}>关键应用</p>
                      {tech.applications.map(a => (
                        <p key={a} style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>• {a}</p>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '10px', background: tech.color + '15', borderLeft: `3px solid ${tech.color}` }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>🏆 <strong style={{ color: '#ddd6fe' }}>代表性突破：</strong>{tech.breakthrough}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Future Timeline */}
      <section className="lesson-section">
        <h3 className="mb-4">📅 量子未来时间线（预测）</h3>
        <div className="space-y-3">
          {QUANTUM_MILESTONES_FUTURE.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(10,5,40,0.6)', border: '1px solid rgba(139,85,247,0.12)', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '6rem', textAlign: 'center' }}>
                <p style={{ fontWeight: '900', color: '#c4b5fd', fontSize: '0.85rem' }}>{m.year}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{m.event}</p>
                <p style={{ color: '#64748b', fontSize: '0.825rem' }}>{m.desc}</p>
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: '0.5rem', boxShadow: '0 0 8px rgba(124,58,237,0.8)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* First quantum revolution recap */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">💡 你已经在使用第一次量子革命的成果</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {[
            { icon: '📱', name: '手机芯片', tech: '半导体 & 量子力学' },
            { icon: '💿', name: '固态硬盘', tech: '量子隧穿（闪存）' },
            { icon: '🏥', name: 'MRI 医疗', tech: '核磁共振量子自旋' },
            { icon: '🌐', name: '光纤通信', tech: '激光（受激辐射）' },
            { icon: '📡', name: 'GPS 卫星', tech: '原子钟（量子频标）' },
            { icon: '☀️', name: '太阳能电池', tech: '光电效应' },
          ].map(t => (
            <div key={t.name} style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '12px', background: 'rgba(99,38,237,0.1)', border: '1px solid rgba(139,85,247,0.15)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{t.icon}</div>
              <p style={{ color: '#ddd6fe', fontSize: '0.8rem', fontWeight: '600' }}>{t.name}</p>
              <p style={{ color: '#475569', fontSize: '0.7rem' }}>{t.tech}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Graduation */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(99,38,237,0.12), rgba(168,85,247,0.08))', borderRadius: '20px', border: '1px solid rgba(139,85,247,0.3)', marginTop: '3rem' }}>
        <Trophy size={64} style={{ color: '#fbbf24', margin: '0 auto', display: 'block', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 24px rgba(251,191,36,0.5))' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(to right, #f5f3ff, #ddd6fe, #c4b5fd)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🎓 恭喜完成《量子力学知识普及》！
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.8' }}>
          从黑体辐射到量子计算机，你已经走过了量子力学 120 年的核心思想历程。
          正如费曼所说：<strong style={{ color: '#c4b5fd' }}>"如果你认为自己理解了量子力学，那你就是还没理解它。"</strong>
          但现在，你拥有了正确地"不理解"它的基础——这已经足够让你站在智识巨人的肩膀上。
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {['量子革命', '黑体辐射', '光电效应', '波粒二象性', '双缝实验', '德布罗意', '不确定性原理', '海森堡', '薛定谔方程', '波函数', '叠加态', '量子纠缠', '贝尔不等式', '量子隧穿', 'STM', '量子计算机', 'QKD', '量子传感器'].map(tag => (
            <span key={tag} style={{ padding: '0.3rem 0.75rem', borderRadius: '99px', border: '1px solid rgba(139,85,247,0.3)', color: '#c4b5fd', fontSize: '0.75rem', background: 'rgba(99,38,237,0.12)' }}>
              {tag}
            </span>
          ))}
        </div>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '99px', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 30px rgba(124,58,237,0.6)' }}>
          🚀 返回课程中心，继续探索
        </button>
      </section>
    </div>
  );
}
