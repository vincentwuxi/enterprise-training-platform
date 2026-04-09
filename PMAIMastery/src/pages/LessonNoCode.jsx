import { useState } from 'react';
import './LessonCommon.css';

const TOOLS = [
  {
    key: 'dify', name: 'Dify', icon: '🟣',
    type: 'AI 应用开发平台', free: true,
    bestFor: '构建带 RAG 知识库的 AI 助手、工作流自动化',
    useCases: ['内部知识库问答机器人', '多步骤 AI 工作流', '自定义 API 集成'],
    difficulty: '低（可视化拖拉）',
    demo: `# Dify 应用搭建示例：产品知识库问答机器人

1. 上传文档：把 PRD、FAQ、help docs 上传为知识库
   支持格式：PDF、Word、Markdown、网页 URL

2. 创建应用：选择"知识库问答"模板
   设置 System Prompt：
   "你是产品助手，只回答关于[产品名]的问题，
    不确定时说'这需要联系产品团队确认'"

3. 调整参数：
   - 召回数量：3-5 条（平衡准确和速度）
   - 相似度阈值：0.7（过滤不相关内容）

4. 发布：生成分享链接 / 嵌入网页 / 对接飞书机器人

# 效果：客服同学 70% 的重复问题直接被 AI 解答`,
  },
  {
    key: 'coze', name: 'Coze（扣子）', icon: '🟡',
    type: 'Bot 搭建平台', free: true,
    bestFor: '快速搭建企业微信/飞书/抖音 Bot，含工具调用',
    useCases: ['飞书自动化客服 Bot', '内容生成 Bot', '数据查询 Bot'],
    difficulty: '极低（无代码）',
    demo: `# Coze 搭建飞书日报生成 Bot

Persona（角色）：
  你是日报撰写助手，帮用户把工作记录整理为
  美观的日报格式

Prompt 模板：
  用户说："今天做了：xxx"
  你输出：
  📅 [日期] 工作日报
  ✅ 今日完成
  [整理要点，加上 emoji]
  📋 明日计划（如用户提供）
  🔖 风险 & 阻塞（如有）

插件配置：
  - 时间插件：自动获取今日日期
  - 飞书发送：Bot 直接推送到指定群

# 3步部署：创建Bot → 配置Prompt → 接入飞书`,
  },
  {
    key: 'zapier', name: 'Zapier / Make', icon: '⚡',
    type: '自动化工作流', free: false,
    bestFor: '连接不同 SaaS 工具，事件触发自动执行',
    useCases: ['用户注册 → 自动发欢迎邮件', '表单提交 → 自动创建 Jira', 'Slack 消息 → AI 总结 + 发邮件'],
    difficulty: '低（可视化连线）',
    demo: `# Zapier 自动化示例：用户反馈闭环

触发器：用户在 Typeform 提交反馈表单
↓
步骤1：ChatGPT（OpenAI）
  Prompt: "分析以下用户反馈，判断：
  1. 情绪（正面/负面/中性）
  2. 功能类别
  3. 紧急程度（1-5）
  反馈内容：{{feedback}}"
↓
步骤2：Filter（过滤器）
  只有紧急程度 >= 4 才继续
↓
步骤3：Jira（创建 Issue）
  标题: "[紧急] {{category}} - {{summary}}"
  优先级: 根据 AI 判断自动设置
↓
步骤4：Slack 通知产品经理

# 效果：0人工干预，紧急反馈5分钟内变成 Jira`,
  },
  {
    key: 'notion', name: 'Notion AI + 数据库', icon: '⬛',
    type: '知识管理 + AI', free: false,
    bestFor: 'PM 日常工作台：PRD 库、会议纪要、数据库',
    useCases: ['AI 自动生成会议纪要', '一键总结长文档', '产品数据库自动填充'],
    difficulty: '极低（已有 Notion 用户无门槛）',
    demo: `# Notion AI 常用魔法操作

1. 会议录音 → 纪要（30秒）
   粘贴转写文字 → 选中 → "总结" → 选"会议纪要格式"
   
2. 竞品资料 → 结构化表格
   粘贴竞品页面文字 → "转为结构化表格"
   
3. 用户访谈 → 洞察提炼
   粘贴访谈内容 → "找出关键主题"
   
4. PRD 草稿 → 补充细节
   选中某段模糊的需求描述 → "让它更具体，补充验收标准"
   
5. 数据库视图 + AI 字段
   可以创建"AI 摘要"字段，自动总结每条记录的关键信息`,
  },
];

export default function LessonNoCode() {
  const [tool, setTool] = useState('dify');
  const t = TOOLS.find(x => x.key === tool);

  return (
    <div className="pm-lesson">
      <div className="pm-container">

        <div className="pm-hero">
          <div className="pm-badge">模块四 · No-Code AI Building</div>
          <h1>无代码 AI 产品搭建</h1>
          <p>PM 不一定要写代码，但要能 Build。用 Dify、Coze、Zapier——你亲手搭建的第一个 AI 应用，会让你对 AI 产品的理解从文字升维到体感。</p>
        </div>

        <div className="pm-metrics">
          {[{ v: '0行', l: '代码' }, { v: '2小时', l: '上线 AI 应用' }, { v: '4个', l: '核心平台' }, { v: '自己', l: '就能 Build' }].map(m => (
            <div key={m.l} className="pm-metric-card"><div className="pm-metric-value">{m.v}</div><div className="pm-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Tool Selector */}
        <div className="pm-section">
          <h2>🛠️ 四大平台详解 & 实操步骤</h2>
          <div className="pm-tabs">
            {TOOLS.map(x => (
              <button key={x.key} className={`pm-tab${tool === x.key ? ' active' : ''}`} onClick={() => setTool(x.key)}>
                {x.icon} {x.name}
              </button>
            ))}
          </div>
          {t && (
            <div>
              <div className="pm-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="pm-card">
                  <div className="pm-card-title">📌 平台定位</div>
                  <div className="pm-card-body">{t.type}</div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '.82rem', color: 'var(--pm-muted)', marginBottom: '0.4rem' }}>最适合：{t.bestFor}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`pm-tag ${t.free ? 'green' : 'amber'}`}>{t.free ? '免费可用' : '需付费'}</span>
                      <span className="pm-tag blue">难度：{t.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="pm-card">
                  <div className="pm-card-title">🎯 典型应用场景</div>
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', color: 'var(--pm-muted)', fontSize: '.85rem', lineHeight: 2 }}>
                    {t.useCases.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </div>
              </div>
              <div className="pm-prompt-label">📖 实操示例（可直接参照搭建）：</div>
              <div className="pm-code">{t.demo}</div>
            </div>
          )}
        </div>

        {/* Platform Selection Guide */}
        <div className="pm-section">
          <h2>🧭 如何选择合适的平台？</h2>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>我的需求是...</th><th>推荐平台</th><th>预计上线时间</th></tr></thead>
              <tbody>
                {[
                  ['搭建知识库问答机器人（FAQ/文档查询）', 'Dify', '2-4小时'],
                  ['接入飞书/企微，快速上线 AI Bot', 'Coze（扣子）', '1-2小时'],
                  ['连接多个 SaaS 工具，事件自动触发', 'Zapier / Make', '2-4小时'],
                  ['在 Notion 中强化日常 PM 工作流', 'Notion AI', '即开即用'],
                  ['复杂的多步骤 AI 工作流', 'Dify（工作流模式）', '半天'],
                  ['面向外部用户的 AI 产品 MVP', 'Dify + 自定义前端', '1-2天'],
                ].map(([need, platform, time], i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '.87rem' }}>{need}</td>
                    <td><span className="pm-tag">{platform}</span></td>
                    <td style={{ color: 'var(--pm-green)', fontWeight: 600, fontSize: '.85rem' }}>{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PM's First Build */}
        <div className="pm-section">
          <h2>🚀 PM 的第一个 AI 应用：48小时挑战</h2>
          <div className="pm-steps">
            {[
              { t: '选题（30分钟）', d: '找一个你日常工作中重复做的事情：写周报？分析用户反馈？整理会议纪要？就从这里入手' },
              { t: '搭建（2-4小时）', d: '用 Dify 或 Coze 搭建最简单版本：只实现核心功能，不追求完美' },
              { t: '自己用一周', d: '先不对外分享，自己实际使用一周，记录哪里好用哪里不好用' },
              { t: '分享给团队（第8天）', d: '把这个小工具分享给 1-3 个同事，观察他们的使用方式，有没有你没想到的用法' },
              { t: '迭代或放弃', d: '如果没人用，思考是产品问题还是推广问题；如果有人用，继续完善' },
            ].map((s, i) => (
              <div key={i} className="pm-step">
                <div className="pm-step-content">
                  <div className="pm-step-title">{s.t}</div>
                  <div className="pm-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pm-good">✅ <span>亲手 Build 带来的洞察是读 100 篇文章无法替代的。当你的工具第一个真实用户出现时，你对 AI 产品的理解会发生质变。</span></div>
        </div>

      </div>
    </div>
  );
}
