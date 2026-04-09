import { useState } from 'react';
import './LessonCommon.css';

const CASES = [
  {
    key: 'cursor',
    name: 'Cursor',
    icon: '⚡',
    tagline: 'The AI Code Editor',
    type: 'Copilot + Agent',
    arr: '$1亿 ARR（2024年）',
    users: '50万+付费用户',
    launch: '2023年',
    scores: [
      { label: '产品力', val: 95 },
      { label: '差异化', val: 90 },
      { label: '冷启动', val: 85 },
      { label: '商业模式', val: 88 },
    ],
    why: '在 VS Code 基础上 Fork，直接继承了用户习惯和插件生态，降低迁移成本；Tab 补全 + 自然语言编辑 + Agent 模式三档加速，覆盖从初级到高级程序员。',
    moat: '代码库理解（Codebase Indexing）+ 快捷键习惯养成 + 企业安全合规（SOC2）',
    lesson: '选择一个已有用户高频使用的"宿主"产品（VS Code），在其上叠加 AI 能力，而非从零构建使用场景。用户已经在 VS Code 里，你只需要让 AI 在正确的时机出现。',
    revenue: '个人 $20/月 · 业务版 $40/月/人 · 企业自定义',
  },
  {
    key: 'perplexity',
    name: 'Perplexity',
    icon: '🔍',
    tagline: 'The AI Answer Engine',
    type: 'Conversational Search',
    arr: '$1亿+ ARR（2024年）',
    users: '1500万月活（2024年）',
    launch: '2022年12月',
    scores: [
      { label: '产品力', val: 92 },
      { label: '差异化', val: 95 },
      { label: '冷启动', val: 78 },
      { label: '商业模式', val: 80 },
    ],
    why: '"每个答案都有引用"是关键差异化：解决了 ChatGPT 的幻觉信任问题；实时联网搜索解决了训练数据时效性；移动端体验优秀，App Store 评分 4.9。',
    moat: '引用来源系统（搜索引擎技术）+ 实时联网能力 + 专业版学术搜索',
    lesson: '找到用户对 ChatGPT "已有但未满足"的不满（幻觉、无来源、知识截止），针对性解决。差异化不是做得更多，而是做对用户真正在意的点。',
    revenue: 'Pro $20/月 · 企业版 $40/月/人',
  },
  {
    key: 'notionai',
    name: 'Notion AI',
    icon: '📝',
    tagline: 'AI built into your wiki',
    type: 'Copilot型（嵌入式）',
    arr: '贡献 Notion$1.6B 估值的核心功能',
    users: '4000万+ Notion 用户可用',
    launch: '2023年2月',
    scores: [
      { label: '产品力', val: 85 },
      { label: '差异化', val: 72 },
      { label: '冷启动', val: 98 },
      { label: '商业模式', val: 88 },
    ],
    why: '最强冷启动策略：直接向 4000 万现有用户推送，0 CAC 获客。AI 功能嵌入已有工作流（写文档时选中文字 → Space → AI 菜单），触发自然。',
    moat: '现有用户数据（文档内容）+ 工作流深度集成 + 品牌信任',
    lesson: '如果你有现有用户群，AI 产品最佳路径是"嵌入式"而非新产品——用户已经在这里，不需要打破习惯。Notion AI 的冷启动几乎是0成本的。',
    revenue: 'AI 功能 $10/月叠加（已付费用户）',
  },
  {
    key: 'midjourney',
    name: 'Midjourney',
    icon: '🎨',
    tagline: 'AI Image Generation Leader',
    type: 'Generative',
    arr: '$2亿 ARR（2024年估算）',
    users: '1600万Discord服务器成员',
    launch: '2022年7月',
    scores: [
      { label: '产品力', val: 90 },
      { label: '差异化', val: 85 },
      { label: '冷启动', val: 92 },
      { label: '商业模式', val: 88 },
    ],
    why: 'Discord 作为分发渠道的天才决策：用户在 Discord 生成图片，其他人看到结果自然传播，形成病毒式扩散；图片视觉冲击力极强，天然适合社交分享。',
    moat: '美学风格独特（"Midjourney 风"）+ 社区氛围 + 快速迭代（V1→V6 频繁更新）',
    lesson: 'Discord Bot 不是"技术限制"，而是精心设计的病毒传播机制——你在公开频道生成的图片，所有人都看到，形成强力社交证明。渠道即内容即传播。',
    revenue: '基础 $10/月 · 标准 $30/月 · Pro $60/月',
  },
  {
    key: 'github-copilot',
    name: 'GitHub Copilot',
    icon: '🐙',
    tagline: 'AI pair programmer',
    type: 'Copilot（编辑器插件）',
    arr: '$1亿 ARR（2023年）',
    users: '130万付费用户（2023年）',
    launch: '2021年6月',
    scores: [
      { label: '产品力', val: 88 },
      { label: '差异化', val: 80 },
      { label: '冷启动', val: 95 },
      { label: '商业模式', val: 92 },
    ],
    why: 'GitHub 生态直接触达 1 亿开发者；OpenAI Codex 技术领先；率先探索"AI 版权代码"问题并制定态度（企业版免除版权风险）；微软全力支持。',
    moat: 'GitHub 生态（Stars/Issues/PR 训练数据）+ 企业合规 + Visual Studio 深度集成',
    lesson: '数据护城河是最强壁垒——GitHub 上的代码是全球最好的训练数据，这是任何创业公司无法复制的。B2B AI 产品的关键护城河往往在数据而非模型。',
    revenue: '个人 $10/月 · 企业 $19/用户/月',
  },
];

export default function LessonCaseStudy() {
  const [active, setActive] = useState('cursor');
  const c = CASES.find(x => x.key === active);

  return (
    <div className="lp-lesson">
      <div className="lp-container">

        <div className="lp-hero">
          <div className="lp-badge">模块七 · Case Studies</div>
          <h1>10 个 AI 产品案例深度拆解</h1>
          <p>最快的学习是看别人如何成功（和失败）。深度拆解 Cursor、Perplexity、Notion AI、Midjourney 等顶级 AI 产品的产品决策、冷启动和护城河。</p>
        </div>

        <div className="lp-metrics">
          {[{ v: '5个', l: '深度案例' }, { v: '$1亿+', l: '多产品 ARR' }, { v: '护城河', l: '最后的壁垒' }, { v: '可复制', l: '的产品结论' }].map(m => (
            <div key={m.l} className="lp-metric-card"><div className="lp-metric-value">{m.v}</div><div className="lp-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Case Selector */}
        <div className="lp-section">
          <h2>📊 案例深度拆解</h2>
          <div className="lp-tabs">
            {CASES.map(x => (
              <button key={x.key} className={`lp-tab${active === x.key ? ' active' : ''}`} onClick={() => setActive(x.key)}>
                {x.icon} {x.name}
              </button>
            ))}
          </div>
          {c && (
            <div>
              <div className="lp-product-card">
                <div className="lp-product-header">
                  <div className="lp-product-icon">{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="lp-product-name">{c.name}</div>
                    <div className="lp-product-tagline">{c.tagline}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--lp-green)', fontWeight: 700, fontSize: '.9rem' }}>{c.arr}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--lp-muted)' }}>{c.users}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="lp-tag">{c.type}</span>
                  <span className="lp-tag blue">上线：{c.launch}</span>
                  <span className="lp-tag green">定价：{c.revenue}</span>
                </div>
                <div>
                  {c.scores.map((s, i) => (
                    <div key={i} className="lp-score-row">
                      <span className="lp-score-label">{s.label}</span>
                      <div className="lp-score-bar"><div className="lp-score-fill" style={{ width: `${s.val}%` }} /></div>
                      <span className="lp-score-val">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lp-grid-2" style={{ marginTop: '1rem' }}>
                <div className="lp-card">
                  <div className="lp-card-title" style={{ color: 'var(--lp-primary)' }}>🚀 为什么成功？</div>
                  <div className="lp-card-body">{c.why}</div>
                </div>
                <div className="lp-card">
                  <div className="lp-card-title" style={{ color: 'var(--lp-cyan)' }}>🏰 护城河</div>
                  <div className="lp-card-body">{c.moat}</div>
                </div>
              </div>
              <div className="lp-tip" style={{ marginTop: '1rem' }}>
                🎓 <span><strong>关键结论（可复用到你的产品）：</strong>{c.lesson}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pattern Summary */}
        <div className="lp-section">
          <h2>🔑 成功 AI 产品的共同规律</h2>
          <div className="lp-grid-2">
            {[
              { t: '寄生现有生态 > 从零构建', d: 'Cursor（VS Code）、Notion AI（Notion）、Copilot（GitHub）都是在巨大的现有用户群上叠加 AI，而非从零获客' },
              { t: '社交传播机制内建', d: 'Midjourney 的 Discord Bot 让生成结果自然被所有人看到。最好的增长是产品使用本身就是传播素材' },
              { t: '解决用户最痛的一点', d: 'Perplexity 专门解决 ChatGPT 的"幻觉无来源"问题。不是做得更多，而是解决竞品最让用户痛的缺陷' },
              { t: '数据护城河 > 模型护城河', d: 'GitHub Copilot 的护城河是代码数据，不是 Codex 模型（模型可被追赶）。企业私有数据是最强壁垒' },
            ].map((c, i) => (
              <div key={i} className="lp-card">
                <div className="lp-card-title">{c.t}</div>
                <div className="lp-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
