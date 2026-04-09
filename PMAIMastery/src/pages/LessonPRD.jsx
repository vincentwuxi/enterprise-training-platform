import { useState } from 'react';
import './LessonCommon.css';

const PRD_SECTIONS = [
  {
    key: 'bg', label: '背景 & 目标',
    prompt: `# PRD 背景与目标生成

你是资深产品经理，帮我撰写以下功能的 PRD 背景章节：

**功能名称**：[填写功能名]
**产品线**：[填写产品线]
**发现的问题**：[填写用户痛点]
**数据支撑**：[填写相关数据，如28%用户反馈xxx]

请输出：
1. 背景（3-5行，阐述为什么现在做这个）
2. 问题描述（量化痛点）
3. 目标（SMART 格式，包含北极星指标）  
4. 非目标（明确什么不在本期范围）`,
    example: `## 背景
在过去 Q3 用户调研中，我们发现有 34% 的活跃用户在使用搜索
功能时无法找到想要的内容，其中 67% 在 3 次搜索失败后直接
流失...

## 目标
- 将搜索结果满意率从 31% 提升至 60%（当季）
- 用户搜索后找到目标内容的比例达到 70%

## 非目标
- 本期不开发语音搜索功能
- 不涉及历史记录同步云端`,
  },
  {
    key: 'user', label: '用户故事',
    prompt: `# 用户故事自动生成

基于以下需求描述，帮我生成完整的用户故事：

**需求描述**：[填写需求]
**目标用户角色**：[如：月活跃用户、付费企业管理员、新注册用户]

输出格式（10-15条用户故事）：

**核心故事**（P0，必须实现）：
作为 [用户角色]，我希望 [做某事]，以便 [达到某目标]
✅ 验收标准（Acceptance Criteria）：
- [ ] 具体的验收条件1
- [ ] 具体的验收条件2

**增强故事**（P1，迭代实现）：
...

**边界故事**（P2，未来考虑）：
...`,
    example: `作为注册用户，我希望在搜索时看到历史记录建议，以便快速
找到之前搜过的内容

✅ 验收标准：
- [ ] 输入框聚焦时显示最近5条历史记录
- [ ] 点击历史记录项直接触发搜索
- [ ] 显示"清除历史"按钮
- [ ] 用户未登录时不显示历史（隐私保护）`,
  },
  {
    key: 'flow', label: '功能流程',
    prompt: `# 功能流程 & 边界条件分析

针对以下功能，帮我生成完整的交互流程和边界条件：

**功能**：[填写功能名]
**主要用户操作步骤**：[简述主流程]

请输出：
1. **主流程**（Mermaid 流程图代码）
2. **异常流程**（网络错误/权限不足/数据为空等）
3. **边界条件清单**（PM 最容易遗漏的细节）
4. **数据埋点建议**（关键行为打点列表）`,
    example: `**边界条件清单（PM 最常遗漏的）：**
□ 搜索词长度限制（建议 100 字符）
□ 搜索结果为空时的 Empty State
□ 网络超时（建议 3s 超时，显示重试）
□ 关键词含敏感词时的过滤逻辑
□ 搜索日志的隐私合规处理
□ 国际化：搜索词是否支持多语言`,
  },
  {
    key: 'review', label: 'AI 审查 PRD',
    prompt: `# PRD 漏洞扫描

你是一位资深产品评审专家，请审查以下 PRD，从这些维度找问题：

1. **逻辑漏洞**（前后矛盾、场景遗漏）
2. **用户体验问题**（流程过长、操作不直觉）
3. **技术可行性风险**（可能很难实现的需求）
4. **数据/隐私合规**（GDPR/个人信息保护法）
5. **缺失的验收标准**（模糊的、无法量化的）
6. **遗漏的边界条件**（空状态、错误处理、权限）

每个问题请说明：问题描述 + 建议修改方向

---
[粘贴你的 PRD 内容]`,
    example: `❗问题1（逻辑漏洞）：第3节"用户删除账号后数据保留30天"
与第7节"注销即刻清除所有数据"前后矛盾，需统一。

❗问题2（边界缺失）：搜索结果页未定义"结果为空"时
的页面设计，建议补充 Empty State 规范。

⚠️ 问题3（隐私合规）：搜索词将被记录到日志，
需补充数据脱敏和保留期限的说明。`,
  },
];

const DOCFLOW = [
  { step: '输入基础信息', time: '5分钟', icon: '📝', desc: '功能名、用户痛点、数据支撑' },
  { step: 'AI 生成初稿', time: '3分钟', icon: '🤖', desc: '背景+目标+用户故事+流程' },
  { step: '人工审核打磨', time: '30分钟', icon: '✏️', desc: '补充业务背景、调整优先级' },
  { step: 'AI 审查漏洞', time: '5分钟', icon: '🔍', desc: '扫描逻辑漏洞和边界遗漏' },
  { step: '发送评审', time: '即时', icon: '📨', desc: '发给产研同学组织 Review' },
];

export default function LessonPRD() {
  const [section, setSection] = useState('bg');
  const [showExample, setShowExample] = useState(false);

  const p = PRD_SECTIONS.find(s => s.key === section);

  return (
    <div className="pm-lesson">
      <div className="pm-container">

        <div className="pm-hero">
          <div className="pm-badge">模块三 · AI PRD Writing</div>
          <h1>AI 写 PRD & 用户故事</h1>
          <p>从"花3天写PRD"到"45分钟出高质量初稿"。用 AI 生成框架、填充内容、审查漏洞——PM 的价值在于判断，不在于打字。</p>
        </div>

        <div className="pm-metrics">
          {[{ v: '45min', l: '完整PRD初稿' }, { v: '0%', l: '格式错误' }, { v: 'AI 审查', l: '消灭边界遗漏' }, { v: '模板', l: '即拷即用' }].map(m => (
            <div key={m.l} className="pm-metric-card"><div className="pm-metric-value">{m.v}</div><div className="pm-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* PRD Writing Flow */}
        <div className="pm-section">
          <h2>⚡ AI 写 PRD 全流程（45分钟）</h2>
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {DOCFLOW.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ background: 'var(--pm-surface2)', border: '1px solid var(--pm-border)', borderRadius: 12, padding: '1rem', width: 130, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{step.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '.8rem', marginBottom: '0.3rem' }}>{step.step}</div>
                  <div style={{ color: 'var(--pm-primary)', fontWeight: 700, fontSize: '.82rem', marginBottom: '0.3rem' }}>{step.time}</div>
                  <div style={{ color: 'var(--pm-muted)', fontSize: '.72rem', lineHeight: 1.4 }}>{step.desc}</div>
                </div>
                {i < DOCFLOW.length - 1 && <div style={{ color: 'var(--pm-primary)', fontSize: '1.2rem', padding: '0 0.25rem', flexShrink: 0 }}>→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Templates */}
        <div className="pm-section">
          <h2>📋 PRD Prompt 模板库</h2>
          <div className="pm-tabs">
            {PRD_SECTIONS.map(s => (
              <button key={s.key} className={`pm-tab${section === s.key ? ' active' : ''}`} onClick={() => { setSection(s.key); setShowExample(false); }}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="pm-prompt-label">🤖 Prompt 模板（复制后填写方括号内容）：</div>
          <div className="pm-prompt">{p?.prompt}</div>
          <button className="pm-tab" style={{ marginTop: '0.5rem' }} onClick={() => setShowExample(!showExample)}>
            {showExample ? '▲ 收起' : '▼ 查看输出示例'}
          </button>
          {showExample && (
            <div>
              <div className="pm-prompt-label" style={{ marginTop: '0.75rem' }}>📤 AI 输出示例：</div>
              <div className="pm-code">{p?.example}</div>
            </div>
          )}
        </div>

        {/* Quality Checklist */}
        <div className="pm-section">
          <h2>✅ 高质量 PRD 自查清单</h2>
          <div className="pm-grid-2">
            {[
              { t: '问题定义清晰', items: ['有量化数据支撑', '明确说明了影响哪些用户', '数据来源可追溯'] },
              { t: '目标 SMART', items: ['有具体数字目标', '指定了时间节点', '区分了主目标和次目标'] },
              { t: '用户故事完整', items: ['涵盖主流程和异常流程', '每条故事有验收标准', 'P0/P1/P2 优先级标注'] },
              { t: '边界条件覆盖', items: ['空状态设计', '错误处理', '权限控制', '数据隐私'] },
            ].map((section, i) => (
              <div key={i} className="pm-card">
                <div className="pm-card-title" style={{ color: 'var(--pm-primary)' }}>✅ {section.t}</div>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', color: 'var(--pm-muted)', fontSize: '.83rem', lineHeight: 2 }}>
                  {section.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pm-tip">💡 <span>AI 生成的 PRD 最大问题是"泛而不精"——它不了解你的业务背景和历史决策。<strong>人工最重要的工作是补充"为什么这样决定"的业务背景。</strong></span></div>
        </div>

      </div>
    </div>
  );
}
