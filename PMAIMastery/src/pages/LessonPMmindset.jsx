import { useState } from 'react';
import './LessonCommon.css';

const THREATS = [
  { role: '执行型 PM', risk: '高危', desc: '主要工作是写文档、排期、跟进进度', ai: 'AI 已能自动生成 PRD、创建 Jira、追踪状态' },
  { role: '调研型 PM', risk: '中危', desc: '以收集需求、整理用研报告为主', ai: 'AI 可以批量分析用户访谈、自动生成洞察报告' },
  { role: '策略型 PM', risk: '低危', desc: '负责产品战略、商业模式、跨部门决策', ai: 'AI 辅助分析数据，但战略判断仍需人' },
  { role: '创新型 PM', risk: '极低', desc: '引领创造新品类、颠覆式产品', ai: 'AI 是你的工具，你是 AI 的指挥官' },
];

const TEN_X = [
  { before: '2周完成一份竞品分析', after: '2小时，AI 辅助框架+数据', lever: '10x 效率' },
  { before: '3天写完一版 PRD', after: '半天，AI 生成初稿+人工打磨', lever: '6x 效率' },
  { before: '1个月做用研', after: '3天，AI 分析录音+提炼主题', lever: '10x 效率' },
  { before: '数据分析靠 BA 支持', after: '自己用 AI 5分钟出洞察', lever: '自主化' },
  { before: '沟通依赖记忆和 PPT', after: 'AI 自动整理会议纪要、生成 Action', lever: '零流失' },
];

const SKILLS = [
  { skill: 'Prompt Engineering', level: 90, desc: '与 AI 高效沟通是核心竞争力' },
  { skill: '问题框架思维', level: 85, desc: '告诉 AI "问什么"比"怎么做"更重要' },
  { skill: '数据判断力', level: 80, desc: 'AI 给出数据，你来判断有无意义' },
  { skill: '用户同理心', level: 95, desc: 'AI 不懂情感，PM 的人味是护城河' },
  { skill: '跨职能协作', level: 75, desc: '推动 AI 项目落地需要影响力' },
];

export default function LessonPMmindset() {
  const [riskTab, setRiskTab] = useState(0);
  const [activeSkill, setActiveSkill] = useState(null);

  return (
    <div className="pm-lesson">
      <div className="pm-container">

        <div className="pm-hero">
          <div className="pm-badge">模块一 · AI PM Mindset</div>
          <h1>AI 时代 PM 的角色重塑</h1>
          <p>不是 AI 取代 PM，而是"用 AI 的 PM"取代"不用 AI 的 PM"。了解威胁与机会，建立 10x PM 心智，把 AI 变成你职业生涯最强的杠杆。</p>
        </div>

        <div className="pm-metrics">
          {[
            { v: '10x', l: '效率杠杆' },
            { v: '5分钟', l: 'AI 产出竞品报告' },
            { v: '2年', l: '技能迭代窗口' },
            { v: '你', l: '才是战略指挥官' },
          ].map(m => (
            <div key={m.l} className="pm-metric-card">
              <div className="pm-metric-value">{m.v}</div>
              <div className="pm-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* Threat Assessment */}
        <div className="pm-section">
          <h2>⚠️ PM 岗位 AI 威胁评估</h2>
          <div className="pm-tabs">
            {THREATS.map((t, i) => (
              <button key={i} className={`pm-tab${riskTab === i ? ' active' : ''}`} onClick={() => setRiskTab(i)}>
                {t.role}
              </button>
            ))}
          </div>
          <div className="pm-card" style={{
            borderColor: riskTab === 0 ? 'var(--pm-rose)' : riskTab === 1 ? 'var(--pm-amber)' : riskTab === 2 ? 'var(--pm-blue)' : 'var(--pm-green)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div className="pm-card-title" style={{ fontSize: '1.05rem' }}>{THREATS[riskTab].role}</div>
              <span className={`pm-tag ${riskTab === 0 ? 'rose' : riskTab === 1 ? 'amber' : riskTab === 2 ? 'blue' : 'green'}`}>
                {THREATS[riskTab].risk}
              </span>
            </div>
            <p style={{ marginBottom: '0.75rem', lineHeight: 1.7, fontSize: '0.9rem' }}>
              <strong>当前主要工作：</strong>{THREATS[riskTab].desc}
            </p>
            <div className="pm-warn">
              🤖 <span><strong>AI 冲击：</strong>{THREATS[riskTab].ai}</span>
            </div>
          </div>
          <div className="pm-tip">
            💡 <span>判断自己处于哪个层级，<strong>主动向高价值层迁移</strong>。策略型和创新型 PM 的核心资产是"判断力"，这是 AI 短期内无法替代的。</span>
          </div>
        </div>

        {/* 10x PM */}
        <div className="pm-section">
          <h2>🚀 10x PM 的效率公式</h2>
          <p style={{ color: 'var(--pm-muted)', fontSize: '.9rem', marginBottom: '1.25rem' }}>
            10x PM 不是做更多工作——而是用 AI 把重复性工作压缩为近乎零，把节省的时间全部投入高价值判断。
          </p>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>原来需要</th><th>AI 时代</th><th>效果</th></tr></thead>
              <tbody>
                {TEN_X.map((r, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--pm-muted)', fontSize: '.85rem' }}>❌ {r.before}</td>
                    <td style={{ color: 'var(--pm-green)', fontSize: '.85rem' }}>✅ {r.after}</td>
                    <td><span className="pm-tag green">{r.lever}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Core Skills */}
        <div className="pm-section">
          <h2>🧠 AI 时代 PM 核心技能雷达</h2>
          <p style={{ color: 'var(--pm-muted)', fontSize: '.88rem', marginBottom: '1.25rem' }}>
            点击技能卡查看详情。AI 时代最重要的技能并非技术，而是"与 AI 提问的艺术"和"判断 AI 输出质量"的元能力。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {SKILLS.map((s, i) => (
              <div key={i} style={{ cursor: 'pointer' }} onClick={() => setActiveSkill(activeSkill === i ? null : i)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{s.skill}</span>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--pm-primary)', fontSize: '.82rem' }}>{s.level}%</span>
                </div>
                <div style={{ background: 'var(--pm-surface2)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${s.level}%`,
                    background: `linear-gradient(90deg, var(--pm-primary-dk), var(--pm-accent))`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                {activeSkill === i && (
                  <div className="pm-tip" style={{ marginTop: '0.5rem' }}>
                    💡 <span>{s.desc}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 30-60-90 Plan */}
        <div className="pm-section">
          <h2>📅 30-60-90 天 AI 升级计划</h2>
          <div className="pm-steps">
            {[
              { t: '第 1-30 天：工具熟悉期', d: '掌握 ChatGPT/Claude 基础用法，用 AI 完成日常至少 3 件事（写邮件/总结会议/分析数据），建立 Prompt 习惯' },
              { t: '第 31-60 天：流程嵌入期', d: '把 AI 嵌入核心工作流：用 AI 写 PRD 初稿、做竞品分析、提炼用研洞察，每次输出都比同事快 50%' },
              { t: '第 61-90 天：策略应用期', d: '用 AI 辅助做产品决策（优先级框架、路线图规划），主导团队 AI 工具选型，成为部门内 AI 布道者' },
            ].map((s, i) => (
              <div key={i} className="pm-step">
                <div className="pm-step-content">
                  <div className="pm-step-title">{s.t}</div>
                  <div className="pm-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pm-good">✅ <span>完成这 90 天计划后，你的工作效率预计提升 3-5x，并建立起他人难以快速复制的 AI 工作体系。</span></div>
        </div>

      </div>
    </div>
  );
}
