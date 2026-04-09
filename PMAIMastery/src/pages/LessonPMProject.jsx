import { useState } from 'react';
import './LessonCommon.css';

const PROJECT_PHASES = [
  {
    phase: '第一周', title: '机会发现 & 问题定义',
    tasks: [
      '用 AI 进行 10 份用户访谈（或分析已有录音）',
      '竞品分析：5个竞品的核心功能对比矩阵',
      '定义核心用户痛点（量化，有数据支撑）',
      '制定北极星指标（1个核心指标）',
    ],
    ai_use: '用 ChatGPT 生成访谈提纲 → 用 Otter.ai 转写 → 用 Claude 提炼主题',
    output: '用研洞察报告（2页）',
  },
  {
    phase: '第二周', title: '产品定义 & PRD 撰写',
    tasks: [
      '确定 MVP 功能范围（必须 ≤ 5个核心功能）',
      '用 AI 生成 PRD 初稿（背景、用户故事、流程）',
      '与（假想的）工程师 PRD 评审',
      '制定 ICE 优先级，确认第一个版本只做什么',
    ],
    ai_use: '使用本课程模块三的 PRD Prompt 模板全套',
    output: 'PRD（包含用户故事、竞品分析、数据目标）',
  },
  {
    phase: '第三周', title: '无代码 MVP 搭建',
    tasks: [
      '用 Dify 或 Coze 搭建核心 AI 功能',
      '用 Notion 搭建产品 Landing Page（介绍产品价值）',
      '招募 5 名种子用户测试（可以是同事/朋友）',
      '收集第一批定性反馈',
    ],
    ai_use: '使用模块四的 Dify/Coze 实操步骤，2小时内上线',
    output: '可点击的 MVP + 5份种子用户反馈',
  },
  {
    phase: '第四周', title: '数据分析 & GTM 策略',
    tasks: [
      '分析种子用户的使用数据（留存/活跃/漏斗）',
      '用 AI 解读数据、找改进方向',
      '制定 GTM（Go-to-Market）策略',
      '完成产品 Demo 演示（结合增长黑客课的传播策略）',
    ],
    ai_use: '使用模块五的数据分析 Prompt，5分钟诊断留存问题',
    output: '数据洞察报告 + GTM One Pager',
  },
];

const PRODUCT_TEMPLATE = `## AI 原生产品 One Pager 模板

### 产品名称 & Slogan
[产品名] — [一句话价值主张]

### 核心问题（Problem）
现在 [目标用户] 面临的主要挑战是：
- 痛点1：[量化描述]
- 痛点2：[量化描述]

### 解决方案（Solution）
[产品名] 通过 AI [核心技术] 帮助用户 [实现什么结果]

核心功能（仅3个）：
1. [功能] → 解决 [哪个痛点]
2. [功能] → 解决 [哪个痛点]
3. [功能] → 解决 [哪个痛点]

### 目标用户（Target User）
主要用户：[职位/行为特征]
次要用户：[职位/行为特征]
不是我们的用户：[明确排除]

### 商业模式（Business Model）
收费方式：[免费增值/订阅/按量]
定价：[免费版 + 专业版 $X/月]
竞争优势：[为什么用户选你]

### 北极星指标（North Star）
[指标名]：当前 [X] → 目标 [Y]（3个月内）

### 资源需求（Resources）
技术：[N人/N周，或 Dify 无代码方案]
市场：[冷启动策略：内容/社区/KOL]`;

export default function LessonPMProject() {
  const [phase, setPhase] = useState(0);
  const [showTemplate, setShowTemplate] = useState(false);
  const ph = PROJECT_PHASES[phase];

  return (
    <div className="pm-lesson">
      <div className="pm-container">

        <div className="pm-hero">
          <div className="pm-badge">模块八 · Capstone Project</div>
          <h1>实战项目 — 从零规划一款 AI 原生产品</h1>
          <p>把这门课的所有技能串联起来。4 周完成一个完整的 AI 产品从发现机会到 MVP 上线的全流程——这是你向任何面试官展示 AI PM 能力的最强作品集。</p>
        </div>

        <div className="pm-metrics">
          {[{ v: '4周', l: '完整项目周期' }, { v: 'MVP', l: '真实可用产品' }, { v: '0代码', l: '无代码搭建' }, { v: '作品集', l: '面试加分项' }].map(m => (
            <div key={m.l} className="pm-metric-card"><div className="pm-metric-value">{m.v}</div><div className="pm-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* 4-Week Plan */}
        <div className="pm-section">
          <h2>📅 4 周项目计划</h2>
          <div className="pm-tabs">
            {PROJECT_PHASES.map((p, i) => (
              <button key={i} className={`pm-tab${phase === i ? ' active' : ''}`} onClick={() => setPhase(i)}>
                {p.phase}
              </button>
            ))}
          </div>
          <div className="pm-card" style={{ borderColor: 'var(--pm-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--pm-primary)', fontWeight: 700, marginBottom: '0.3rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>{ph.phase}</div>
                <div className="pm-card-title" style={{ fontSize: '1.05rem' }}>{ph.title}</div>
              </div>
              <span className="pm-tag green">产出：{ph.output}</span>
            </div>
            <div className="pm-steps">
              {ph.tasks.map((task, i) => (
                <div key={i} className="pm-step">
                  <div className="pm-step-content">
                    <div className="pm-step-desc">{task}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-info" style={{ marginTop: '1rem' }}>🤖 <span><strong>AI 使用方式：</strong>{ph.ai_use}</span></div>
          </div>
        </div>

        {/* Product Template */}
        <div className="pm-section">
          <h2>📄 AI 原生产品 One Pager 模板</h2>
          <p style={{ color: 'var(--pm-muted)', fontSize: '.88rem', marginBottom: '1rem' }}>
            在开始做任何功能之前，先完成这份 One Pager。它强迫你想清楚"为什么做"，而不是一上来就争论"怎么做"。
          </p>
          <button className="pm-tab active" onClick={() => setShowTemplate(!showTemplate)}>
            {showTemplate ? '▲ 收起模板' : '▼ 展开完整模板'}
          </button>
          {showTemplate && <div className="pm-prompt" style={{ marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>{PRODUCT_TEMPLATE}</div>}
        </div>

        {/* Course Integration */}
        <div className="pm-section">
          <h2>🔗 本课程技能串联 & 推荐延伸</h2>
          <div className="pm-grid-2">
            {[
              { t: '增长黑客课联动', d: '完成 MVP 后，应用增长黑客课的 AARRR 框架制定冷启动策略——用户从哪来？如何激活？如何留存？', tag: '增长黑客' },
              { t: 'AI Agent 工程课联动', d: '如果你的 AI 产品需要多步骤自动化（如 AI 助手），学习 AI Agent Engineering 课了解 LangGraph/Multi-Agent 架构', tag: 'AI Agent' },
              { t: '数据分析课联动', d: 'MVP 上线后，用数据分析课的可视化技巧搭建产品 Dashboard，追踪北极星指标实时变化', tag: '数据分析' },
              { t: '系统设计联动（未来）', d: '当你的产品需要从无代码升级为工程化实现，了解系统设计课的架构决策——缓存、消息队列、数据库选型', tag: '系统设计' },
            ].map((c, i) => (
              <div key={i} className="pm-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div className="pm-card-title">{c.t}</div>
                  <span className="pm-tag blue">{c.tag}</span>
                </div>
                <div className="pm-card-body">{c.d}</div>
              </div>
            ))}
          </div>
          <div className="pm-good">
            🎓 <span><strong>恭喜完成 PM AI 升级手册全部 8 个模块！</strong>
            你现在掌握了：AI 心智、用研提效、PRD 写作、无代码搭建、数据洞察、优先级决策、工程协作——这是 AI 时代产品经理最完整的技能图谱。
            下一步：完成实战项目，把作品放进你的 Portfolio。</span>
          </div>
        </div>

      </div>
    </div>
  );
}
