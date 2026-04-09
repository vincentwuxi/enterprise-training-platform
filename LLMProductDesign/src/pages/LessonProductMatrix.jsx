import { useState } from 'react';
import './LessonCommon.css';

const PRODUCT_TYPES = [
  {
    key: 'copilot',
    name: 'Copilot 型',
    icon: '🤝',
    tagline: '副驾驶：AI 辅助人类完成任务',
    desc: '用户主导，AI 在"旁边"提供建议、补全、生成。人类有最终控制权。',
    examples: ['GitHub Copilot（代码补全）', 'Notion AI（文档辅助）', 'Grammarly（写作建议）', 'Adobe Firefly（设计辅助）'],
    strengths: ['用户信任度高', '出错代价小（人可审查）', '易于集成进现有工作流'],
    challenges: ['价值感知弱（"我自己也会写"）', '需要 UI 设计降低打断感', '差异化难（功能易复制）'],
    when: '用户需要在原有工作流中提效，不愿完全交出控制权',
    metric: '补全采纳率、效率提升时间',
    color: 'var(--lp-blue)',
  },
  {
    key: 'agent',
    name: 'Agent 型',
    icon: '🤖',
    tagline: '自动完成多步骤复杂任务',
    desc: 'AI 自主规划和执行任务，用户给目标，AI 给结果。可能需要人工介入关键节点（HITL）。',
    examples: ['Devin（自主写代码）', 'AutoGPT', 'Cursor Agent Mode', '自动化邮件处理 Agent'],
    strengths: ['解决高价值复杂任务', '时间节省最显著', '差异化强（技术壁垒高）'],
    challenges: ['可靠性要求极高', '出错代价大', '用户信任度需要积累', 'Token 成本高'],
    when: '任务可被明确定义，允许 AI 自主决策，且结果可以被验证',
    metric: '任务完成率、人工介入次数',
    color: 'var(--lp-primary)',
  },
  {
    key: 'generative',
    name: 'Generative 型',
    icon: '🎨',
    tagline: '内容生成与创作加速',
    desc: '用户提供创意方向，AI 生成内容（文字/图像/视频/代码）。创作过程的加速器。',
    examples: ['Midjourney（图像生成）', 'Jasper（营销文案）', 'Suno（音乐生成）', 'Runway（视频生成）'],
    strengths: ['产出令人惊艳，WoW 时刻强', '爆炸式增长可能', '直接面向 C 端消费者'],
    challenges: ['版权风险', '质量不稳定', '商业化路径不清晰', '竞争极激烈'],
    when: '目标用户有创作需求但技能或时间不足，追求内容数量或探索新创意',
    metric: '内容生成量、用户创作频率',
    color: 'var(--lp-amber)',
  },
  {
    key: 'search',
    name: 'Conversational Search 型',
    icon: '🔍',
    tagline: '对话式知识发现',
    desc: '用自然语言查询替代关键词搜索，AI 综合多来源给出答案并附引用。',
    examples: ['Perplexity AI', 'ChatGPT Browse', 'Bing Chat', '企业内部知识库问答'],
    strengths: ['降低信息获取门槛', '企业知识库场景企业愿意付费', '引用增加可信度'],
    challenges: ['幻觉风险（编造引用）', '依赖数据质量', '与 Google 正面竞争'],
    when: '用户有明确信息需求，已有知识库/数据源，需要降低搜索和阅读成本',
    metric: '搜索成功率、答案满意度',
    color: 'var(--lp-cyan)',
  },
];

const DECISION_MATRIX = [
  { q: '任务是否高度重复且可定义？', copilot: true, agent: true, gen: false, search: false },
  { q: '用户能接受 AI 犯错？', copilot: true, agent: false, gen: true, search: true },
  { q: '需要多步骤自主执行？', copilot: false, agent: true, gen: false, search: false },
  { q: '内容创作是核心价值？', copilot: false, agent: false, gen: true, search: false },
  { q: '已有知识库/私有数据？', copilot: false, agent: false, gen: false, search: true },
  { q: '用户需要保持控制感？', copilot: true, agent: false, gen: true, search: true },
];

export default function LessonProductMatrix() {
  const [active, setActive] = useState('copilot');
  const p = PRODUCT_TYPES.find(t => t.key === active);

  return (
    <div className="lp-lesson">
      <div className="lp-container">

        <div className="lp-hero">
          <div className="lp-badge">模块一 · Product Type Matrix</div>
          <h1>LLM 产品类型矩阵</h1>
          <p>AI 产品设计的第一个关键决策：你在做哪种产品？Copilot、Agent、Generative、Conversational Search——形态不同，设计原则、商业逻辑、成功指标全然不同。</p>
        </div>

        <div className="lp-metrics">
          {[{ v: '4种', l: '核心产品形态' }, { v: '形态优先', l: '设计的第一决策' }, { v: 'WoW', l: '时刻设计' }, { v: '可靠性', l: 'Agent 的生死线' }].map(m => (
            <div key={m.l} className="lp-metric-card"><div className="lp-metric-value">{m.v}</div><div className="lp-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Type Selector */}
        <div className="lp-section">
          <h2>🗂️ 四大产品形态深度解析</h2>
          <div className="lp-tabs">
            {PRODUCT_TYPES.map(t => (
              <button key={t.key} className={`lp-tab${active === t.key ? ' active' : ''}`} onClick={() => setActive(t.key)}>
                {t.icon} {t.name}
              </button>
            ))}
          </div>
          {p && (
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{p.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.name}</div>
                  <div style={{ color: p.color, fontSize: '.88rem', fontWeight: 600 }}>{p.tagline}</div>
                </div>
              </div>
              <p style={{ color: 'var(--lp-muted)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>{p.desc}</p>
              <div className="lp-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="lp-card" style={{ borderColor: 'rgba(52,211,153,.3)' }}>
                  <div className="lp-card-title" style={{ color: 'var(--lp-green)' }}>✅ 优势</div>
                  <ul style={{ margin: '.5rem 0 0', paddingLeft: '1.2rem', color: 'var(--lp-muted)', fontSize: '.85rem', lineHeight: 2 }}>
                    {p.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="lp-card" style={{ borderColor: 'rgba(251,113,133,.3)' }}>
                  <div className="lp-card-title" style={{ color: 'var(--lp-rose)' }}>⚠️ 挑战</div>
                  <ul style={{ margin: '.5rem 0 0', paddingLeft: '1.2rem', color: 'var(--lp-muted)', fontSize: '.85rem', lineHeight: 2 }}>
                    {p.challenges.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
              <div className="lp-grid-2">
                <div className="lp-info">📦 <span><strong>代表产品：</strong>{p.examples.join('、')}</span></div>
                <div className="lp-cyan">🎯 <span><strong>适用场景：</strong>{p.when}</span></div>
              </div>
              <div className="lp-tip">📊 <span><strong>核心成功指标：</strong>{p.metric}</span></div>
            </div>
          )}
        </div>

        {/* Decision Matrix */}
        <div className="lp-section">
          <h2>⚖️ 产品形态选择决策矩阵</h2>
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>判断问题</th>
                  <th>🤝 Copilot</th>
                  <th>🤖 Agent</th>
                  <th>🎨 Generative</th>
                  <th>🔍 Search</th>
                </tr>
              </thead>
              <tbody>
                {DECISION_MATRIX.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '.85rem' }}>{row.q}</td>
                    {[row.copilot, row.agent, row.gen, row.search].map((v, j) => (
                      <td key={j} style={{ textAlign: 'center', fontSize: '1.1rem' }}>{v ? '✅' : '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lp-tip">💡 <span>决策矩阵不是唯一答案，而是<strong>强迫你想清楚假设</strong>。多数成功 AI 产品是混合形态——Copilot + Agent（如 Cursor），或 Search + Generative（如 Perplexity）。</span></div>
        </div>

        {/* Anti-patterns */}
        <div className="lp-section">
          <h2>🚫 四大产品决策反模式</h2>
          <div className="lp-grid-2">
            {[
              { t: '把 Copilot 做成 Agent', d: '用户不需要 AI 自主操作，强推 Agent 模式会引发信任危机。先做 Copilot 积累可靠性。' },
              { t: '为生成而生成', d: '没有明确用户痛点，只是"用 AI 生成内容"。内容生成必须连接到用户已有的工作流或创作需求。' },
              { t: '过度 Prompt 化产品', d: '要求用户每次写很长 Prompt 才能使用，是"把负担转移给用户"。好的 AI 产品应该有合理的默认值。' },
              { t: '"AI 套壳"产品', d: '只是在 OpenAI API 外面包一层 UI，没有差异化价值。防护：有独特数据、独特工作流、或独特模型。' },
            ].map((c, i) => (
              <div key={i} className="lp-card">
                <div className="lp-card-title" style={{ color: 'var(--lp-rose)' }}>❌ {c.t}</div>
                <div className="lp-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
