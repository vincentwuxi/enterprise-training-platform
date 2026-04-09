import { useState } from 'react';
import './LessonCommon.css';

const RESEARCH_PROMPTS = [
  {
    key: 'interview', label: '用研访谈分析',
    scenario: '将 10 段用户访谈录音转文字后，用 AI 提炼核心洞察',
    prompt: `你是一位专业的 UX 研究员。我将提供多段用户访谈文字，请帮我：

1. **提炼核心痛点**（按出现频次排序，Top5）
2. **识别用户目标**（用户真正想达成的是什么）
3. **发现意外洞察**（用户提到但我们可能意想不到的点）
4. **引用原话**（每个洞察附上1-2句原始用户语录）

输出格式：结构化 Markdown，每个痛点5-6行

---
[在此粘贴访谈文字]`,
    output: '用户最常提到"找不到历史记录"（7/10人），其次是"通知太多"（6/10人）...',
    time: '10分钟',
    origin: '3周',
  },
  {
    key: 'competitor', label: '竞品分析',
    scenario: '快速生成一份结构化竞品分析报告',
    prompt: `你是一位资深产品分析师。请帮我对比分析以下竞品：
[竞品A] vs [竞品B] vs [我们的产品]

分析维度（每项评分1-5星）：
1. 核心功能完整度
2. 用户体验 / 易用性
3. 定价策略
4. 目标用户精准度
5. 增长策略 & 渠道
6. 技术壁垒

输出：
- 结构化对比表格
- 竞品核心差异化总结（200字）
- 我们产品的机会窗口（3条）
- 需要警惕的威胁（2条）`,
    output: '| 维度 | 竞品A | 竞品B | 我们 |\n|功能完整度|⭐⭐⭐⭐|⭐⭐⭐|⭐⭐⭐⭐⭐|...',
    time: '30分钟',
    origin: '2周',
  },
  {
    key: 'survey', label: '问卷数据分析',
    scenario: '将 500 份问卷的开放题文字答案批量分析',
    prompt: `以下是 [数量] 份用户问卷的开放题回答：
"您最希望我们改进哪个功能？"

请：
1. 对回答进行主题归类（不超过6个类别）
2. 统计每类出现频次与占比
3. 为每类选出最具代表性的3条回答
4. 识别高价值用户的回答特征（如提到付费/推荐等）

---
[粘贴所有开放题回答，每条一行]`,
    output: '主题一：功能缺失（38%，189条）\n主题二：性能问题（24%，120条）...',
    time: '1小时',
    origin: '1周',
  },
  {
    key: 'market', label: '市场调研报告',
    scenario: '基于公开资料生成行业趋势分析',
    prompt: `你是行业分析师，请基于你的知识库（截止日期：[年份]）帮我分析：

**行业：[填写行业名]**

分析框架：
1. 市场规模与增速（TAM/SAM/SOM）
2. 主要玩家格局（前5名及市场份额）
3. 关键技术趋势（3-5条）
4. 政策监管风险
5. 未来12个月的增长机会

要求：
- 尽可能引用具体数据（如无法确认，标注"估算"）
- 末尾标注信息局限性`,
    output: '中国 SaaS 市场 2024 年规模约 1200 亿元，CAGR 约 18%，前5玩家：...',
    time: '2小时',
    origin: '1个月',
  },
];

const AI_TOOLS = [
  { icon: '🤖', name: 'ChatGPT / Claude', use: '通用分析、文档生成、报告撰写', free: true },
  { icon: '🎙️', name: 'Otter.ai / 飞书妙记', use: '会议录音转文字、自动生成纪要', free: true },
  { icon: '📊', name: 'Notion AI', use: '在笔记中直接调用 AI 分析数据', free: false },
  { icon: '🔍', name: 'Perplexity', use: '实时联网搜索 + AI 整合分析', free: true },
  { icon: '📈', name: 'Tableau / Metabase + AI', use: '数据可视化 + 自然语言查询', free: false },
  { icon: '🗂️', name: 'Miro AI', use: 'AI 生成用户旅程图、亲和图分析', free: false },
];

export default function LessonResearch() {
  const [tab, setTab] = useState('interview');
  const p = RESEARCH_PROMPTS.find(r => r.key === tab);

  return (
    <div className="pm-lesson">
      <div className="pm-container">

        <div className="pm-hero">
          <div className="pm-badge">模块二 · AI Research</div>
          <h1>AI 辅助用户研究 & 竞品分析</h1>
          <p>3周的用研工作压缩到3天，2周的竞品报告30分钟完成——不是降低质量，而是把时间花在"判断"而非"整理"上。</p>
        </div>

        <div className="pm-metrics">
          {[{ v: '10x', l: '用研效率' }, { v: '30min', l: '竞品分析' }, { v: '批量', l: '开放题分析' }, { v: '实时', l: '市场洞察' }].map(m => (
            <div key={m.l} className="pm-metric-card"><div className="pm-metric-value">{m.v}</div><div className="pm-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Prompt Templates */}
        <div className="pm-section">
          <h2>📋 即用 Prompt 模板库</h2>
          <div className="pm-tabs">
            {RESEARCH_PROMPTS.map(r => (
              <button key={r.key} className={`pm-tab${tab === r.key ? ' active' : ''}`} onClick={() => setTab(r.key)}>
                {r.label}
              </button>
            ))}
          </div>
          {p && (
            <div>
              <p style={{ color: 'var(--pm-muted)', fontSize: '.88rem', marginBottom: '1rem' }}>
                <strong>场景：</strong>{p.scenario}
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <span className="pm-tag amber">⏱ 原来需要：{p.origin}</span>
                <span className="pm-tag green">✅ 现在只需：{p.time}</span>
              </div>
              <div className="pm-prompt-label">🤖 直接可用的 Prompt：</div>
              <div className="pm-prompt">{p.prompt}</div>
              <div className="pm-prompt-label" style={{ marginTop: '1rem' }}>📤 输出示例：</div>
              <div className="pm-code">{p.output}</div>
            </div>
          )}
        </div>

        {/* Workflow */}
        <div className="pm-section">
          <h2>🔄 AI 用研工作流（完整流程）</h2>
          <div className="pm-steps">
            {[
              { t: '收集原始数据', d: '录音 → Otter.ai/飞书妙记自动转文字 → 导出 TXT 文件' },
              { t: '批量 AI 分析', d: '将转写文字粘贴到 ChatGPT/Claude，使用上方 Prompt 模板一次性分析 10-20 段访谈' },
              { t: 'AI 聚类主题', d: '让 AI 对所有回答进行主题归类，产出亲和图（Affinity Map）结构' },
              { t: '人工验证代表性', d: '审查 AI 的归类结果，找 2-3 名真实用户验证核心洞察是否准确' },
              { t: '生成洞察报告', d: '用 AI 将验证后的洞察转化为结构化报告，附原始引语支撑' },
              { t: '转化为 How Might We', d: '把痛点转化为机会问题："我们如何能让用户更快找到历史记录？"' },
            ].map((s, i) => (
              <div key={i} className="pm-step">
                <div className="pm-step-content">
                  <div className="pm-step-title">{s.t}</div>
                  <div className="pm-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Stack */}
        <div className="pm-section">
          <h2>🧰 用研工具栈推荐</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {AI_TOOLS.map((t, i) => (
              <div key={i} className="pm-tool">
                <div className="pm-tool-icon">{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="pm-tool-name">{t.name}</div>
                  <div className="pm-tool-desc">{t.use}</div>
                </div>
                <span className={`pm-tag ${t.free ? 'green' : 'amber'}`}>{t.free ? '免费/免费版' : '付费'}</span>
              </div>
            ))}
          </div>
          <div className="pm-warn">⚠️ <span>注意：不要把未经脱敏的真实用户数据（包含姓名/手机号）直接粘贴到 ChatGPT 等公共 AI 服务，务必先脱敏处理。</span></div>
        </div>

      </div>
    </div>
  );
}
