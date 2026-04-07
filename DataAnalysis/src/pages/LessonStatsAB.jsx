import React, { useState } from 'react';
import './LessonCommon.css';

// 交互式 A/B 测试计算器
function ABCalculator() {
  const [control, setControl] = useState({ visitors: 10000, conversions: 320 });
  const [variant, setVariant] = useState({ visitors: 10000, conversions: 380 });

  const cr_a = control.conversions / control.visitors;
  const cr_b = variant.conversions / variant.visitors;
  const lift = ((cr_b - cr_a) / cr_a * 100).toFixed(1);

  // Z-test for proportions
  const p_pool = (control.conversions + variant.conversions) / (control.visitors + variant.visitors);
  const se = Math.sqrt(p_pool * (1 - p_pool) * (1 / control.visitors + 1 / variant.visitors));
  const z = Math.abs((cr_b - cr_a) / se);
  const significant = z > 1.96; // p < 0.05, two-tailed

  // 样本量计算（80%功效，5%显著性）
  const minSamplePerGroup = Math.ceil(
    2 * Math.pow(1.96 + 0.84, 2) * cr_a * (1 - cr_a) / Math.pow(cr_b - cr_a, 2)
  );

  const color = significant ? 'var(--da-accent)' : '#f87171';

  return (
    <div className="da-sim">
      <div className="da-sim-title">🧪 A/B 测试显著性计算器</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: '对照组 A', state: control, setter: setControl },
          { label: '实验组 B', state: variant, setter: setVariant },
        ].map(({ label, state, setter }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--da-border)', borderRadius: '.75rem', padding: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '.75rem', color: 'var(--da-primary)', fontSize: '.85rem' }}>{label}</div>
            {[
              { key: 'visitors', label: '访问量', min: 100 },
              { key: 'conversions', label: '转化数', min: 1 },
            ].map(({ key, label: lbl, min }) => (
              <div key={key} style={{ marginBottom: '.6rem' }}>
                <label style={{ fontSize: '.78rem', color: 'var(--da-muted)', display: 'block', marginBottom: '.2rem' }}>{lbl}</label>
                <input
                  type="number" min={min} value={state[key]}
                  onChange={e => setter(s => ({ ...s, [key]: Math.max(min, +e.target.value) }))}
                  style={{ width: '100%', background: '#0d1117', border: '1px solid var(--da-border)', borderRadius: '.5rem', padding: '.4rem .7rem', color: 'var(--da-text)', fontSize: '.88rem' }}
                />
              </div>
            ))}
            <div style={{ marginTop: '.5rem', fontSize: '.82rem', color: 'var(--da-primary)', fontWeight: 700 }}>
              转化率：{(state.conversions / state.visitors * 100).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* 结果卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.75rem' }}>
        {[
          { label: '相对提升', value: `${lift > 0 ? '+' : ''}${lift}%`, sub: 'Relative Lift', color: lift > 0 ? '#10b981' : '#f87171' },
          { label: 'Z 统计量', value: z.toFixed(3), sub: z > 1.96 ? '> 1.96 ✅' : '< 1.96 ❌', color },
          { label: '显著性', value: significant ? 'p < 0.05' : 'p ≥ 0.05', sub: significant ? '✅ 统计显著' : '❌ 不显著', color },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--da-card)', border: `1px solid ${c.color}40`, borderRadius: '.75rem', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--da-muted)', marginBottom: '.3rem' }}>{c.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--da-muted)', marginTop: '.2rem' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {!isNaN(minSamplePerGroup) && isFinite(minSamplePerGroup) && minSamplePerGroup > 0 && (
        <div className="da-tip" style={{ marginTop: '1rem' }}>
          <strong>📐 最小样本量建议</strong>
          <p>要检测到当前效果大小，每组至少需要 <strong style={{ color: 'var(--da-primary)' }}>{minSamplePerGroup.toLocaleString()}</strong> 个样本（80% 检验功效，双侧 α=0.05）。共需 {(minSamplePerGroup * 2).toLocaleString()} 人。</p>
        </div>
      )}
    </div>
  );
}

export default function LessonStatsAB() {
  const [concept, setConcept] = useState(0);
  const concepts = [
    {
      title: '假设检验基础',
      content: [
        { term: 'H₀（零假设）', def: '两组没有差异。A/B 测试默认前提，我们试图"推翻"它。' },
        { term: 'H₁（备择假设）', def: 'B 组转化率 ≠ A 组（双侧），或 B > A（单侧）。' },
        { term: 'p-value', def: '在H₀成立的前提下，观测到当前或更极端结果的概率。p < 0.05 拒绝H₀。' },
        { term: '显著性水平 α', def: '通常取 0.05（允许5%概率犯第一类错误：误报有差异）。' },
        { term: '检验功效 (1-β)', def: '通常取 0.8，真实有差异时80%能检测到（避免漏报）。' },
        { term: '效应量 (Effect Size)', def: '差异的实际大小。统计显著≠业务显著，效应量小可能无实际价值。' },
      ],
    },
    {
      title: 'A/A 测试',
      content: [
        { term: '目的', def: '实验前先分两个完全相同的组，验证测试系统本身无偏差。' },
        { term: '通过标准', def: 'A/A 测试显著率应 ≤ 5%（等于随机噪声水平），超过则说明分流机制有问题。' },
        { term: '辛普森悖论', def: '分组不均匀时，整体趋势可能与分组内趋势相反。按维度分层分析可以发现。' },
        { term: '新奇效应', def: '用户因为新鲜感点击实验组，过几天行为回归正常。实验至少运行 1 个完整业务周期。' },
        { term: '多重测试问题', def: '同时测试 20 个指标，即使全是随机数据也会有1个"显著"。用 Bonferroni 矫正。' },
        { term: '网络效应', def: '社交产品中用户会互相影响，需要"集群随机化"而非个体随机化。' },
      ],
    },
    {
      title: '贝叶斯 A/B 测试',
      content: [
        { term: '与频率派区别', def: '频率派输出 p-value，贝叶斯输出"B 优于 A 的概率"，更直观。' },
        { term: '先验分布', def: '用历史转化率 Beta(α₀, β₀) 作为先验，新数据更新后验。' },
        { term: '后验分析', def: '"B 优于 A 的概率 = 95%"比"p = 0.04"更容易向业务方解释。' },
        { term: '提前停止', def: '贝叶斯可以在满足置信阈值时提前停止，频率派不能（多重检验问题）。' },
        { term: 'Beta-Binomial 模型', def: '最适合转化率 A/B 测试的贝叶斯模型，适合二元结果（转化/不转化）。' },
        { term: '实现工具', def: 'pymc3、scipy.stats.beta、Google Optimize 内置贝叶斯模式。' },
      ],
    },
  ];

  return (
    <div className="da-lesson">
      <div className="da-hero">
        <div className="da-hero-badge">🧪 模块四</div>
        <h1>统计推断 & A/B 测试 — 数据驱动决策</h1>
        <p>掌握假设检验、A/B 测试设计、样本量计算和结果解读。避免"p-hacking"和常见陷阱，让数据真正驱动产品决策。</p>
      </div>

      <div className="da-goals">
        {[
          { icon: '📐', title: '假设检验', desc: 'H₀/H₁ / p-value / 显著性水平 / 功效' },
          { icon: '🧪', title: 'A/B 测试设计', desc: '样本量计算、分层随机、运行时长' },
          { icon: '⚠️', title: '常见陷阱', desc: 'p-hacking / 新奇效应 / 辛普森悖论' },
          { icon: '📊', title: '贝叶斯方法', desc: '后验概率直接量化"B 优于 A 的置信度"' },
        ].map(g => <div className="da-goal" key={g.title}><div className="da-goal-icon">{g.icon}</div><div><h3>{g.title}</h3><p>{g.desc}</p></div></div>)}
      </div>

      {/* 交互计算器 */}
      <ABCalculator />

      {/* 概念解析 */}
      <div className="da-section-title">📚 核心概念精讲</div>
      <div className="da-tab-bar">
        {concepts.map((c, i) => <button key={c.title} className={`da-tab${concept === i ? ' active' : ''}`} onClick={() => setConcept(i)}>{c.title}</button>)}
      </div>
      <div className="da-table-wrap">
        <table className="da-table">
          <thead><tr><th>概念</th><th>解释</th></tr></thead>
          <tbody>
            {concepts[concept].content.map(({ term, def }) => (
              <tr key={term}>
                <td style={{ fontWeight: 700, color: 'var(--da-primary)', whiteSpace: 'nowrap' }}>{term}</td>
                <td style={{ color: 'var(--da-muted)', lineHeight: 1.6 }}>{def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* A/B 测试流程 */}
      <div className="da-section-title">🔄 A/B 测试 SOP</div>
      <ol className="da-steps">
        {[
          { n: '01', h: '明确指标 (OEC)', d: '定义主指标（转化率）和护栏指标（不能变差的指标，如客诉率）。' },
          { n: '02', h: '计算样本量', d: '基于当前基准转化率、期望提升幅度、α=0.05、功效=0.8 计算每组最小样本。' },
          { n: '03', h: '先做 A/A 测试', d: '验证分流系统无偏差，显著率应 ≤ 5%。' },
          { n: '04', h: '启动实验', d: '随机分流，推荐按用户ID哈希（而非随机数），保证同一用户始终在同一组。' },
          { n: '05', h: '等待完整周期', d: '至少运行 1-2 个完整业务周期（避免周一/周末效应），不要提前停止。' },
          { n: '06', h: '分析结果', d: '整体显著性 → 分层分析 → 检查护栏指标 → 评估实际效应量。' },
        ].map(s => (
          <li key={s.n}>
            <div className="da-step-num">{s.n}</div>
            <div className="da-step-body"><h4>{s.h}</h4><p>{s.d}</p></div>
          </li>
        ))}
      </ol>

      <div className="da-warn">
        <strong>⚠️ p-hacking：数据分析最常见的错误</strong>
        <p>反复更换分析维度、反复"看"中间结果直到 p &lt; 0.05，本质是多重比较。正确做法：预先登记分析计划（Pre-registration），固定分析维度和停止时间，不在实验中途决定是否停止。</p>
      </div>
    </div>
  );
}
