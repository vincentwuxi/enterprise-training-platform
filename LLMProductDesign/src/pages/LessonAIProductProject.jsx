import { useState } from 'react';
import './LessonCommon.css';

const PROJECT_STAGES = [
  {
    stage: '第1-2天', title: '机会发现',
    desc: '找到值得解决的 AI 产品机会',
    tasks: [
      '选择一个你熟悉的垂直领域（你的工作？你的爱好？）',
      '在该领域找 5 个"重复且耗时"的任务',
      '用 ChatGPT/Claude 手动测试这些任务的 AI 可行性',
      '选择 AI 效果最好 & 用户痛感最强的一个',
    ],
    ai_use: '直接和 AI 对话，让 AI 帮你头脑风暴潜在的 AI 产品机会',
    output: '一句话产品定位：「[AI 产品名] 帮助 [目标用户] 更快完成 [具体任务]，通过 [AI 技术] 实现 [核心价值]」',
    icon: '🔍',
  },
  {
    stage: '第3-4天', title: '产品设计（UX + Prompt）',
    desc: '设计用户体验和核心 AI 能力',
    tasks: [
      '画出核心用户流程图（4-6个步骤）',
      '识别产品形态：Copilot / Agent / Generative / Search？',
      '设计 System Prompt（六层架构）并测试效果',
      '定义成功标准：用户完成什么才算"AI 帮到了"',
    ],
    ai_use: '用本课程模块三的 System Prompt 架构设计 AI 核心逻辑，用模块二的 UX 原则设计用户流程',
    output: 'System Prompt v1 + 核心用户流程图 + 5条验收标准',
    icon: '🎨',
  },
  {
    stage: '第5-6天', title: 'Prototype（原型）',
    desc: '快速构建可交互的产品原型',
    tasks: [
      '用 Dify/Coze 构建 AI 核心功能（无代码）',
      '或用 Gradio/Streamlit 快速搭建 Python Web UI',
      '让 3-5 个真实目标用户测试，观察使用过程',
      '记录所有"卡住的地方"和用户意外的使用方式',
    ],
    ai_use: '使用 AI 生成 Gradio 或 Streamlit 界面代码，让 AI 写 Python 而不是你手写',
    output: '可交互的 MVP + 5用户测试记录',
    icon: '🛠️',
  },
  {
    stage: '第7天', title: '商业模式 & 路线图',
    desc: '设计如何让产品持续生存',
    tasks: [
      '计算单用户月度 Token 成本（用模块六计算器）',
      '选择定价策略（Freemium / 订阅 / 按量）',
      '制定前30天冷启动计划（Niche 用户 / 内容 / 集成）',
      '规划 V1→V2 路线图（V1聚焦核心，V2引入差异化）',
    ],
    ai_use: '用 AI 生成竞品分析表格、帮你测算 LTV/CAC、生成 Pitch Deck 初稿',
    output: 'Business One Pager + 30天冷启动计划',
    icon: '💰',
  },
];

const PRDTEMPLATE = `# [AI 产品名] PRD v1.0

## TL;DR
[3句话描述：做什么 → 给谁 → 解决什么问题]

---

## 产品类型
☐ Copilot 型（AI 辅助用户）
☐ Agent 型（AI 自主执行）
☐ Generative 型（内容生成）
☐ Conversational Search 型

---

## 目标用户
**主要角色**：[用户类型 + 1句话特征描述]
**典型使用场景**：[用户在什么情况下会打开产品]
**当前如何解决**：[没有 AI 产品时用户怎么做]

---

## 核心问题（量化）
1. [痛点1]：[量化描述，如"每次需要 2 小时"]
2. [痛点2]：[量化描述]

---

## 产品解决方案（MVP，仅 3 个功能）
功能 1：[功能名]
  - 用户操作：[用户做什么]
  - AI 做什么：[AI 的核心动作]
  - 输出：[用户得到什么]

功能 2：[略]
功能 3：[略]

---

## System Prompt 核心设计
Role：[AI 的角色定义]
Task：[AI 的核心任务]
Output Format：[期望的输出格式]
Constraints：[禁止的行为]

---

## 成功指标
北极星指标：[一个最重要的指标]
目标（30天）：[具体数字]

---

## Token 成本估算
平均输入：[N] tokens
平均输出：[N] tokens  
预估 DAU：[N] 人
月度成本：$[X]（使用模块六计算器）

---

## 冷启动策略（前 30 天）
Week 1-2：[找到 10 个种子用户怎么做]
Week 3-4：[如何让这 10 人推荐给其他人]

---

## V1 → V2 路线图
V1（当前）：[核心功能，2周完成]
V2（下阶段）：[差异化功能，1个月后]`;

export default function LessonAIProductProject() {
  const [stage, setStage] = useState(0);
  const [showTemplate, setShowTemplate] = useState(false);
  const s = PROJECT_STAGES[stage];

  return (
    <div className="lp-lesson">
      <div className="lp-container">

        <div className="lp-hero">
          <div className="lp-badge">模块八 · Capstone Project</div>
          <h1>实战项目 — 设计你的第一个 AI 原生产品</h1>
          <p>7 天从想法到可演示的 AI 产品。串联本课程所有知识：产品类型选择 → UX 设计 → Prompt 工程 → 冷启动 → 指标定义 → 商业模式——这是你的 AI 产品 Portfolio。</p>
        </div>

        <div className="lp-metrics">
          {[{ v: '7天', l: '从 0 到 Demo' }, { v: '1套', l: '完整 PRD' }, { v: '5人', l: '真实用户测试' }, { v: 'Portfolio', l: '职业加分项' }].map(m => (
            <div key={m.l} className="lp-metric-card"><div className="lp-metric-value">{m.v}</div><div className="lp-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* 7-Day Plan */}
        <div className="lp-section">
          <h2>📅 7 天项目计划</h2>
          <div className="lp-tabs">
            {PROJECT_STAGES.map((p, i) => (
              <button key={i} className={`lp-tab${stage === i ? ' active' : ''}`} onClick={() => setStage(i)}>
                {p.icon} {p.stage}
              </button>
            ))}
          </div>
          <div className="lp-product-card" style={{ borderColor: 'var(--lp-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--lp-primary)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '.3rem' }}>{s.stage}</div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.title}</div>
                <div style={{ color: 'var(--lp-muted)', fontSize: '.85rem', marginTop: '.2rem' }}>{s.desc}</div>
              </div>
              <span className="lp-tag green" style={{ flexShrink: 0 }}>产出：{s.output.slice(0, 12)}...</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className="lp-steps">
                {s.tasks.map((task, i) => (
                  <div key={i} className="lp-step"><div><div className="lp-step-desc">{task}</div></div></div>
                ))}
              </div>
            </div>
            <div className="lp-info">🤖 <span><strong>AI 使用方式：</strong>{s.ai_use}</span></div>
            <div className="lp-tip">📦 <span><strong>阶段产出：</strong>{s.output}</span></div>
          </div>
        </div>

        {/* PRD Template */}
        <div className="lp-section">
          <h2>📄 AI 原生产品 PRD 完整模板</h2>
          <p style={{ color: 'var(--lp-muted)', fontSize: '.88rem', marginBottom: '1rem' }}>
            整合了本课程所有模块知识的一份 PRD 模板，覆盖产品类型、UX 设计、Prompt 设计、成本估算和冷启动计划。
          </p>
          <button className="lp-tab active" onClick={() => setShowTemplate(!showTemplate)}>
            {showTemplate ? '▲ 收起模板' : '▼ 展开完整 PRD 模板'}
          </button>
          {showTemplate && <div className="lp-code" style={{ marginTop: '0.75rem' }}>{PRDTEMPLATE}</div>}
        </div>

        {/* Course Cross-ref */}
        <div className="lp-section">
          <h2>🎓 课程路径联动</h2>
          <div className="lp-grid-2">
            {[
              { t: '← 前置课：AI Agent 工程实战', d: '如果你的产品需要 Multi-Agent 工作流、记忆管理或 LangGraph 状态机，返回 AI Agent 课深入工程化实现', tag: 'AI Agent', dir: '前置' },
              { t: '→ 延伸课：增长黑客 & 产品运营', d: '产品 Demo 完成后，用增长黑客课的 AARRR 框架设计冷启动和留存运营策略，让 AI 产品真正增长', tag: '增长黑客', dir: '延伸' },
              { t: '→ 延伸课：PM AI 升级手册', d: '希望用更多 AI 工具提升 PM 工作效率？PM AI 手册覆盖无代码搭建、数据分析、PRD 写作等与本课配合', tag: 'PM AI', dir: '延伸' },
              { t: '→ 延伸课：系统设计面试', d: '当你的 AI 产品需要从无代码升级为工程化实现，学习系统设计课了解 LLM Cache、向量数据库、流式架构', tag: '系统设计', dir: '延伸' },
            ].map((c, i) => (
              <div key={i} className="lp-card" style={{ borderLeft: `3px solid ${c.dir === '前置' ? 'var(--lp-cyan)' : 'var(--lp-primary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <div className="lp-card-title">{c.t}</div>
                  <span className={`lp-tag ${c.dir === '前置' ? 'cyan' : ''}`}>{c.tag}</span>
                </div>
                <div className="lp-card-body">{c.d}</div>
              </div>
            ))}
          </div>
          <div className="lp-good">
            🚀 <span><strong>恭喜完成「LLM 应用产品设计」全部 8 个模块！</strong>
            你现在具备了从 AI 产品定位到商业化落地的完整能力。下一步：完成你的第一个 AI 产品设计，让它成为向世界展示的 Portfolio 作品。</span>
          </div>
        </div>

      </div>
    </div>
  );
}
