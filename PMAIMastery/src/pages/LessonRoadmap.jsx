import { useState } from 'react';
import './LessonCommon.css';

const ICE_FEATURES = [
  { name: '搜索智能补全', impact: 8, confidence: 7, ease: 6 },
  { name: '个性化推荐 Feed', impact: 9, confidence: 5, ease: 3 },
  { name: '一键分享功能', impact: 6, confidence: 9, ease: 8 },
  { name: 'AI 客服助手', impact: 7, confidence: 6, ease: 5 },
  { name: '批量操作功能', impact: 5, confidence: 8, ease: 7 },
];

const OKR_TEMPLATES = [
  {
    key: 'growth', label: '增长类 OKR',
    prompt: `基于以下产品情况，帮我制定本季度 OKR：

**产品阶段**：[早期增长/成熟优化/转型期]
**核心挑战**：[如：用户留存率低，注册-激活漏斗转化差]
**北极星指标**：[如：DAU/月留存率/GMV]
**当前数据**：[如：DAU 10万，月留存 28%]
**资源限制**：[如：产品团队2人，工程3人]

请输出：
1. O（目标，鼓舞人心的方向句，1条）
2. KR1-KR3（关键结果，必须量化且可追踪）
3. 每个 KR 的当前基线和目标值
4. 达成 KR 需要的关键产品举措（2-3条）
5. 风险 & 依赖（可能的阻碍）`,
    example: `**O：让用户爱上我们的产品，成为他们日常不可缺少的习惯**

**KR1**：月活用户留存率从 28% 提升至 42%（+50%）
KR 基线：2024Q1 月留存 28%，目标 Q2 末 42%
关键举措：优化 D1-D7 激活流程，新增 Push 策略

**KR2**：用户平均 Session 时长从 3.2min 提升至 5min
关键举措：推荐算法优化，Feed 内容多样性提升

**KR3**：NPS 从 32 提升至 50
关键举措：修复 Top10 用户痛点，优化搜索体验`,
  },
  {
    key: 'ai', label: 'AI 功能 OKR',
    prompt: `我们计划在产品中推出 AI 功能，帮我制定衡量 AI 功能价值的 OKR：

**AI 功能类型**：[如：AI 写作助手/AI 推荐/AI 客服]
**目标用户**：[功能的主要使用者]
**假设的用户价值**：[AI 帮助用户节省了什么/获得了什么]

帮我设计：
1. 衡量 AI 使用率的 KR（覆盖率）
2. 衡量 AI 价值的 KR（效率提升/质量提升）
3. 衡量 AI 满意度的 KR（用户反馈）
4. 衡量 AI 安全性的 KR（幻觉率/投诉率控制）

注意：AI 功能的 OKR 要避免只看使用次数，
更要关注"真正帮助用户完成了什么任务"`,
    example: `**O：让 AI 写作助手成为创作者效率提升的核心引擎**

**KR1**：AI 辅助写作覆盖率（使用 AI 功能的 DAU/总 DAU）达 35%
**KR2**：使用 AI 功能的用户平均发帖速度提升 40%（vs 对照组）
**KR3**：AI 功能满意度（用户点"好用"的比例）≥ 75%
**KR4**：AI 内容事故率（因 AI 幻觉引发投诉）< 0.1%`,
  },
];

export default function LessonRoadmap() {
  const [features, setFeatures] = useState(ICE_FEATURES);
  const [okrTab, setOkrTab] = useState('growth');
  const [showPrompt, setShowPrompt] = useState(false);

  const scored = features.map(f => ({
    ...f,
    score: ((f.impact + f.confidence + f.ease) / 3).toFixed(1)
  })).sort((a, b) => b.score - a.score);

  const okr = OKR_TEMPLATES.find(o => o.key === okrTab);

  const updateFeature = (idx, field, val) => {
    const updated = [...features];
    updated[idx] = { ...updated[idx], [field]: Number(val) };
    setFeatures(updated);
  };

  return (
    <div className="pm-lesson">
      <div className="pm-container">

        <div className="pm-hero">
          <div className="pm-badge">模块六 · Roadmap & Prioritization</div>
          <h1>AI 辅助产品规划 & 优先级决策</h1>
          <p>ICE/RICE 框架 AI 化、OKR 自动生成、路线图与 AI 项目对齐——把时间花在"为什么做"而非"做什么"的排列组合上。</p>
        </div>

        <div className="pm-metrics">
          {[{ v: 'ICE', l: '优先级框架' }, { v: 'OKR', l: 'AI 辅助制定' }, { v: '路线图', l: '自动生成' }, { v: '数据驱动', l: '消灭拍脑袋' }].map(m => (
            <div key={m.l} className="pm-metric-card"><div className="pm-metric-value">{m.v}</div><div className="pm-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* ICE Scoring */}
        <div className="pm-section">
          <h2>⚖️ 交互式 ICE 优先级评分</h2>
          <p style={{ color: 'var(--pm-muted)', fontSize: '.88rem', marginBottom: '1rem' }}>
            ICE = （Impact 影响 + Confidence 把握 + Ease 易实现）/ 3，拖动滑块调整评分，系统自动排序。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="pm-card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--pm-primary)', fontWeight: 700, fontSize: '1rem' }}>
                    ICE: {((f.impact + f.confidence + f.ease) / 3).toFixed(1)}
                  </span>
                </div>
                {[['impact', '影响力 Impact', 'rose'], ['confidence', '把握度 Confidence', 'blue'], ['ease', '易实现 Ease', 'green']].map(([field, label, color]) => (
                  <div key={field} className="pm-slider-wrap">
                    <label>{label} {f[field]}/10</label>
                    <input type="range" min={1} max={10} value={f[field]} onChange={e => updateFeature(i, field, e.target.value)} />
                    <span className={`pm-tag ${color}`}>{f[field]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="pm-prompt-label">📊 优先级排序结果（实时更新）：</div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>排名</th><th>功能</th><th>Impact</th><th>Confidence</th><th>Ease</th><th>ICE 分</th></tr></thead>
              <tbody>
                {scored.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: i === 0 ? 'var(--pm-primary)' : '' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{f.name}</td>
                    <td>{f.impact}</td><td>{f.confidence}</td><td>{f.ease}</td>
                    <td><span style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--pm-primary)', fontWeight: 700 }}>{f.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-warn">⚠️ <span>ICE 是辅助工具，不是决策者。当 ICE 高分功能与战略方向有冲突时，<strong>战略优先</strong>。分数是对话的起点，不是终点。</span></div>
        </div>

        {/* OKR Generator */}
        <div className="pm-section">
          <h2>🎯 OKR 生成 Prompt 模板</h2>
          <div className="pm-tabs">
            {OKR_TEMPLATES.map(o => (
              <button key={o.key} className={`pm-tab${okrTab === o.key ? ' active' : ''}`} onClick={() => { setOkrTab(o.key); setShowPrompt(false); }}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="pm-prompt">{okr?.prompt}</div>
          <button className="pm-tab" onClick={() => setShowPrompt(!showPrompt)}>
            {showPrompt ? '▲ 收起示例' : '▼ 查看 AI 输出示例'}
          </button>
          {showPrompt && <div className="pm-code" style={{ marginTop: '0.75rem' }}>{okr?.example}</div>}
        </div>

        {/* Roadmap Prompt */}
        <div className="pm-section">
          <h2>🗓️ 季度路线图生成</h2>
          <div className="pm-prompt">{`基于以下信息，帮我生成季度产品路线图：

**已确认 P0 功能**：[列表]
**团队资源**：前端N人、后端N人、设计N人
**季度时长**：12周

请按时间轴排列，考虑：
1. 功能间的依赖关系（B 依赖 A 先完成）
2. 设计、开发、测试各阶段时间
3. 灰度发布和全量发布节奏
4. 预留 20% 时间处理 Bug 和技术债

输出格式：
- 每周甘特图概要
- 关键里程碑（Milestone M1/M2/M3）
- 风险 Buffer 安排`}</div>
          <div className="pm-tip">💡 <span>路线图 AI 生成之后，最重要的步骤是<strong>和工程负责人对齐</strong>——AI 不了解你们的技术债和团队状态，工程师对时间的估算才是最终依据。</span></div>
        </div>

      </div>
    </div>
  );
}
