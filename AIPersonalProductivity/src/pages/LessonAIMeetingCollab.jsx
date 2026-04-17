import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'meeting', title: '会议提效', icon: '🎙️' },
  { id: 'schedule', title: '日程管理', icon: '📅' },
  { id: 'collab', title: '团队协作', icon: '🤝' },
  { id: 'communication', title: '跨部门沟通', icon: '💬' },
];

export default function LessonAIMeetingCollab() {
  const [active, setActive] = useState(sections[0].id);
  return (
    <div className="lesson-page">
      <div className="lesson-tabs">
        {sections.map(s => (
          <button key={s.id} className={`lesson-tab ${active === s.id ? 'active' : ''}`} onClick={() => setActive(s.id)}>
            <span className="tab-icon">{s.icon}</span>{s.title}
          </button>
        ))}
      </div>
      <div className="lesson-content">
        {active === 'meeting' && <MeetingSection />}
        {active === 'schedule' && <ScheduleSection />}
        {active === 'collab' && <CollabSection />}
        {active === 'communication' && <CommunicationSection />}
      </div>
    </div>
  );
}

function MeetingSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🎙️</span>AI 会议效率革命</h2>
      <p className="section-desc">职场人每周平均花 <strong>11 小时在会议上</strong>，其中 30% 被认为是低效会议。AI 可以让会议价值最大化。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>AI 全流程会议管理</h3>
          <div className="code-block">
{`🔵 会前 — AI 准备
───────────────────
1. 自动生成议程
   Prompt: "基于以下背景信息，
   为 30 分钟的项目同步会生成议程:
   - 参会人: [名单]
   - 上次会议决议: [粘贴]
   - 本周进展: [粘贴]
   输出: 议题 + 时间分配 + 需要准备的材料"

2. 准备讨论材料
   → AI 总结上次会议 TODO 完成情况
   → AI 生成需要讨论的数据概要

🟢 会中 — AI 记录
───────────────────
1. 实时语音转文字 (飞书妙记/通义听悟)
2. 自动识别发言人
3. 实时标注关键决定和 TODO

🔴 会后 — AI 总结与跟进
───────────────────
1. 自动生成会议纪要:
   - 核心决定 (3-5 条)
   - TODO 清单 (含负责人和截止日)
   - 未解决议题  
2. 一键发送给参会者
3. TODO 自动同步到项目管理工具
4. 下次会前自动提醒未完成项`}
          </div>
        </div>

        <div className="info-card">
          <h3>会议纪要 Prompt 模板</h3>
          <div className="code-block">
{`# 通用会议纪要生成

"请根据以下会议记录/录音转写文本，
生成结构化的会议纪要:

[粘贴会议转写文本]

请按以下格式输出:

📋 会议信息
• 主题: 
• 日期/时间:
• 参会人:

📌 核心决定
1. [决定内容] — 决定人: XX
2. ...

✅ 行动项 (TODO)
┌──────┬───────┬────────┐
│ 事项 │ 负责人 │ 截止日 │  
├──────┼───────┼────────┤
│      │       │        │
└──────┴───────┴────────┘

❓ 待讨论/悬而未决
1. ...

💡 要点回顾 (每人发言要点)
• 张三: ...
• 李四: ...

📎 下次会议
• 建议时间:
• 需要准备:"

⏱️ 手动写纪要: 30+ 分钟
⏱️ AI 生成: 2 分钟`}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScheduleSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📅</span>AI 日程与时间管理</h2>
      <p className="section-desc">让 AI 帮你规划时间，识别时间浪费，自动处理日程冲突。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>AI 时间管理工作流</h3>
          <div className="code-block">
{`# 每日时间规划

早晨 Prompt:
"根据以下信息，帮我规划今天的工作:

日历: [今日会议安排]
待办: [粘贴 TODO 列表]
优先级: [紧急项目/截止日]
能量: [早上精力好/下午易疲劳]

请输出:
1. 建议的时间块安排
   (深度工作 / 会议 / 琐事)
2. 每个任务的预估时间
3. 建议的休息时间
4. 今天最重要的 3 件事 (MIT)

规则:
- 深度工作安排在上午
- 会议尽量批量安排
- 每 90 分钟休息 15 分钟
- 16:00 后安排低能量任务"

# 周末周回顾 Prompt:
"分析我本周的日历和完成情况:
[粘贴本周日程 + TODO完成度]

请分析:
1. 时间使用分布 (会议/深度工作/碎片)
2. 哪些时间被浪费了
3. 效率最高的时段
4. 下周优化建议"`}
          </div>
        </div>

        <div className="info-card">
          <h3>AI 日程工具推荐</h3>
          <table className="data-table">
            <thead>
              <tr><th>工具</th><th>AI 功能</th><th>核心优势</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Motion</strong></td><td>AI 自动排日程</td><td>根据优先级/截止日自动规划每天</td></tr>
              <tr><td><strong>Reclaim.ai</strong></td><td>智能时间块</td><td>保护深度工作时间,灵活调整</td></tr>
              <tr><td><strong>Calendly + AI</strong></td><td>智能约会</td><td>自动找最优会议时间</td></tr>
              <tr><td><strong>飞书日历</strong></td><td>AI 会议助手</td><td>与飞书生态深度集成</td></tr>
              <tr><td><strong>Todoist + AI</strong></td><td>智能任务分类</td><td>自然语言添加任务</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CollabSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🤝</span>AI 赋能团队协作</h2>
      <p className="section-desc">AI 不只是个人工具，更是<strong>团队协作的加速器</strong>。用 AI 消除信息差、加速对齐、提升团队产出。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>团队 AI 协作场景</h3>
          <div className="code-block">
{`场景 1: 项目状态同步
──────────────────
问题: 项目组 10 个人，每人进度不同
传统: 每周开同步会 → 1 小时
AI 方案:
• 每人在飞书/Notion 更新进度
• AI 自动生成项目周报
• 关键风险自动预警
• 管理者 2 分钟了解全貌

场景 2: 知识传承
──────────────────
问题: 老员工离职，经验带走
传统: 写交接文档 → 不完整
AI 方案:
• 建立团队知识库 (Project as RAG)
• 新人可以直接"对话"问知识库
• Q: "我们之前处理 XX 类客户投诉
     的标准流程是什么？"
• AI 从历史文档中找到答案

场景 3: 头脑风暴
──────────────────
问题: 会上只有 2-3 个人说话
AI 方案:
1. 先让 AI 从多角度生成 20 个idea
2. 团队成员评分和补充
3. AI 整理投票结果
4. 结合团队智慧 + AI 广度`}
          </div>
        </div>

        <div className="info-card">
          <h3>团队 AI 工具栈推荐</h3>
          <div className="code-block">
{`高效团队的 AI 工具组合:

📝 文档协作
└── Notion AI / 飞书文档 + AI
    → 协同编辑 + AI 辅助写作

💬 即时沟通
└── 飞书 / Slack + AI Bot
    → AI 回答常见问题
    → AI 总结长消息串

📋 项目管理
└── Linear / Jira + AI
    → AI 自动分类 Issue
    → AI 建议优先级

📊 数据看板
└── 飞书多维表格 / Airtable + AI
    → AI 自动生成报表
    → 异常数据自动预警

📧 客户沟通
└── AI 邮件助手
    → 自动起草回复
    → 情绪分析预警

成本估算 (10 人团队):
Notion Team: $10 × 10 = $100/月
Slack Pro: $8 × 10 = $80/月
AI 工具: ~$200/月
总计: ~$380/月 = ¥2700/月
人效提升: 20-30% ⚡`}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunicationSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">💬</span>AI 辅助跨部门沟通</h2>
      <p className="section-desc">跨部门沟通的核心痛点是 <strong>"说的不是同一种语言"</strong>。AI 可以当翻译器，消除部门壁垒。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>跨部门沟通技巧</h3>
          <div className="code-block">
{`# 向不同受众解释同一件事

Prompt:
"请将以下技术决策解释给不同受众:

技术决策: 将数据库从 MySQL 迁移到
PostgreSQL，预计停服 4 小时

请分别写给:
1. CEO (关注: 业务影响和风险)
2. 产品经理 (关注: 功能影响和时间线)
3. 销售团队 (关注: 客户如何沟通)
4. 客服团队 (关注: 用户问题话术)

每个版本:
- 不超过 100 字
- 只说对方关心的点
- 避免专业术语
- 给出明确的行动建议"

# 化解分歧的 Prompt:
"我和 [部门] 在 [议题] 上有分歧:
我的观点: [...]
对方观点: [...]
请帮我:
1. 分析双方立场的合理性
2. 找到共同利益点
3. 建议 2-3 个折中方案
4. 用对方的语言写一封提案"`}
          </div>
        </div>

        <div className="info-card">
          <h3>向上汇报 Prompt</h3>
          <div className="code-block">
{`# 让 AI 帮你准备向上汇报

Prompt:
"帮我准备向 VP 的 15 分钟汇报:

背景: [项目/业务背景]
数据: [关键数据]
问题: [当前挑战]
方案: [我的建议]

请输出:

1. 电梯演讲版 (30 秒)
   → 一句话说清楚要什么

2. 结构化汇报 (15 分钟)
   → 现状3句话 → 问题2个 → 方案对比
   → 资源需求 → 时间线

3. 预判老板可能问的问题 (5 个)
   → 每个问题准备好回答

4. 一页纸总结 (会后发邮件用)
   → 核心结论 + 需要的审批/支持

要求:
- 数据说话,少说感受
- 给选择题不给问答题
- 风险和对策一起说"`}
          </div>
        </div>
      </div>
    </section>
  );
}
