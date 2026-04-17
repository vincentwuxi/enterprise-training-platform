import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'email', title: '邮件与沟通', icon: '📧' },
  { id: 'report', title: '报告与方案', icon: '📋' },
  { id: 'ppt', title: 'PPT 制作', icon: '🎯' },
  { id: 'copywriting', title: '文案创作', icon: '✨' },
];

export default function LessonAIWritingDocs() {
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
        {active === 'email' && <EmailSection />}
        {active === 'report' && <ReportSection />}
        {active === 'ppt' && <PPTSection />}
        {active === 'copywriting' && <CopywritingSection />}
      </div>
    </div>
  );
}

function EmailSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📧</span>AI 辅助邮件与商务沟通</h2>
      <p className="section-desc">邮件写作占职场人 <strong>每天 1-2 小时</strong>。用 AI 可以将邮件起草时间从 15 分钟缩短到 2 分钟，同时提升专业度。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>邮件 Prompt 模板库</h3>
          <div className="code-block">
{`📧 场景 1: 催办项目进度
─────────────────────
"你是一位经验丰富的项目经理。
请帮我写一封催办邮件:
- 收件人: 技术团队负责人张总
- 背景: Q2 产品迭代已延期 1 周
- 语气: 专业但不咄咄逼人
- 目标: 确认新的交付时间
- 长度: 不超过 200 字
- 结尾: 提供 2 个可选的沟通时间"

📧 场景 2: 回复客户投诉
─────────────────────
"你是一位资深的客户成功经理。
客户反馈: [粘贴客户原文]
请起草回复:
- 先表达歉意和理解
- 说明原因 (不推卸)
- 给出具体解决方案和时间线
- 提供补偿方案
- 语气: 真诚、专业、有温度"

📧 场景 3: 跨部门协调
─────────────────────
"请帮我写一封协调邮件:
- 发给: 市场部、产品部、技术部负责人
- 目的: 协调 618 大促技术保障
- 需要: 各部门本周五前提交资源需求
- 格式: 包含简表列出各部门需提供的信息"`}
          </div>
        </div>

        <div className="info-card">
          <h3>邮件改写技巧</h3>
          <div className="code-block">
{`# 用 AI 改写已有邮件

Prompt: "请改写这封邮件，使其更加
[专业/友好/简洁/正式]:

[粘贴你的邮件草稿]

要求:
1. 保持原意不变
2. 修正语法和用词
3. 最重要的信息放在第一段
4. 行动项用编号列出"

# 邮件风格一键切换:
原文: "这个方案不行，问题很多"

→ 正式版: "经初步评估，该方案存在几个
   需要优化的关键点，建议安排评审会
   深入讨论..."

→ 友好版: "方案整体思路不错！有几个
   地方我们可以一起优化一下，让它
   更有说服力..."

→ 英文版: "After initial review, I'd like
   to suggest a few refinements to
   strengthen the proposal..."`}
          </div>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 邮件 AI 使用最佳实践</h4>
        <ul>
          <li><strong>AI 起草 → 人工修改</strong> — 加入个人风格和内部信息，不要直接发送 AI 原文</li>
          <li><strong>敏感数据脱敏</strong> — 客户姓名、金额等用占位符替代</li>
          <li><strong>建立个人模板</strong> — 让 AI 学习你之前的邮件风格，保持一致性</li>
        </ul>
      </div>
    </section>
  );
}

function ReportSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📋</span>AI 辅助报告与方案写作</h2>
      <p className="section-desc">周报、月报、项目方案、可行性分析... 这些结构化写作是 AI 最擅长的领域。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>报告写作工作流</h3>
          <div className="code-block">
{`用 AI 写报告的 4 步法:

Step 1: 生成框架
  "请为 [主题] 生成一份报告大纲，
   包含 6-8 个章节，每章 3-5 个要点"

Step 2: 逐章填充
  "根据以下数据和信息，
   撰写报告第 3 章[市场分析]:
   - 数据: [粘贴数据]
   - 要求: 每段配一个数据图表描述
   - 字数: 800-1000 字"

Step 3: 优化润色
  "请审核以下报告章节:
   1. 检查逻辑是否自洽
   2. 数据引用是否准确
   3. 语言是否专业简洁
   4. 给出修改建议"

Step 4: 生成摘要
  "为这份完整报告生成:
   1. 执行摘要 (150 字)
   2. 3 个核心结论
   3. 2 个行动建议"`}
          </div>
        </div>

        <div className="info-card">
          <h3>周报/月报自动化</h3>
          <div className="code-block">
{`# AI 周报生成 Prompt

"根据以下本周工作记录，生成一份
结构清晰的周报:

工作记录:
[粘贴你的工作日志/todo/日历]

格式要求:
## 本周完成
- 按重要度排序，3-5 项
- 每项突出量化成果

## 进行中
- 当前进度百分比
- 预计完成时间

## 需要支持
- 具体需要谁、做什么

## 下周计划
- 按优先级排序，3-5 项

## 风险提示
- 如有延期/困难风险

要求: 简洁有力,每项不超过 2 行"

⏱️ 效果: 30 分钟 → 3 分钟`}
          </div>
        </div>
      </div>
    </section>
  );
}

function PPTSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🎯</span>AI 辅助 PPT 制作</h2>
      <p className="section-desc">用 AI 辅助 PPT 面向"思路 + 内容"，让你专注于设计和演讲。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>PPT 大纲生成</h3>
          <div className="code-block">
{`Prompt:
"请为以下主题生成 PPT 大纲:
主题: Q3 业务review 与 Q4 规划
时长: 30 分钟
受众: CEO 和高管团队
风格: 数据驱动、简洁

请输出:
1. 每页的标题
2. 每页 3-4 个核心要点
3. 每页建议使用的图表类型
4. 演讲者备注 (关键话术)

结构建议:
P1: 封面
P2: 执行摘要 (3 句话说完全貌)
P3-P5: Q3 核心数据 (图表为主)
P6: 成功案例/亮点
P7: 教训和改进
P8-P9: Q4 策略和目标
P10: 关键里程碑和资源需求
P11: Q&A"`}
          </div>
        </div>

        <div className="info-card">
          <h3>AI PPT 工具推荐</h3>
          <table className="data-table">
            <thead>
              <tr><th>工具</th><th>功能</th><th>适用场景</th><th>价格</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Gamma</strong></td><td>AI 一键生成 PPT</td><td>快速演示/提案</td><td>免费 / $10/月</td></tr>
              <tr><td><strong>Beautiful.ai</strong></td><td>智能排版设计</td><td>高质量商务演示</td><td>$12/月</td></tr>
              <tr><td><strong>讯飞智文</strong></td><td>中文 PPT 生成</td><td>中文报告演示</td><td>免费</td></tr>
              <tr><td><strong>ChatGPT + DALL·E</strong></td><td>大纲+配图</td><td>灵活定制</td><td>$20/月</td></tr>
              <tr><td><strong>Copilot (Office)</strong></td><td>PowerPoint 内嵌 AI</td><td>企业 Office 用户</td><td>$30/月</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CopywritingSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">✨</span>AI 文案创作</h2>
      <p className="section-desc">从产品文案到社交媒体，AI 帮你快速产出多版本文案进行测试。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>文案创作公式</h3>
          <div className="code-block">
{`# AIDA 公式 (经典营销文案)
"请用 AIDA 公式为以下产品写文案:
产品: [产品描述]
目标人群: [用户画像]
渠道: [朋友圈/公众号/小红书]

A - Attention: 抓住注意力的标题
I - Interest:  引发兴趣的痛点描述
D - Desire:   激发购买欲的利益点
A - Action:   明确的行动号召

请生成 3 个版本:
版本 A: 理性说服型 (数据驱动)
版本 B: 情感共鸣型 (故事化)
版本 C: 紧迫感型 (限时优惠)"

# 其他常用公式:
• PAS (Problem → Agitate → Solution)
• BAB (Before → After → Bridge)
• 4U (Useful → Urgent → Unique → Ultra)

# 多平台适配:
"请将以下文案适配为:
1. 朋友圈版 (120字内,3个emoji)
2. 小红书版 (标题+正文+标签)
3. 公众号版 (开头+正文+CTA)
4. 抖音文案 (15秒口播文案)"`}
          </div>
        </div>

        <div className="info-card">
          <h3>文案优化实例</h3>
          <div className="code-block">
{`原始文案 (平庸):
"我们的产品质量好，价格实惠，
 欢迎选购。"

AI 优化后 (版本 A: 数据驱动):
"10000+ 企业选择我们的 3 个理由:
 ① 故障率降低 67%
 ② 上手时间仅需 15 分钟
 ③ 年均节省 ¥12 万运营成本
 现在注册，首月免费体验 →"

AI 优化后 (版本 B: 故事化):
"三个月前，张经理还在为每天 200 条
 工单头疼。现在，他的团队处理效率
 提升了 3 倍，准时下班成了日常。
 如果你也想告别加班...
 点击了解他的选择 →"

AI 优化后 (版本 C: 社交化):
"同事问我最近怎么不加班了 😂
 不好意思说是偷偷用了这个工具...
 效率直接翻倍，老板都惊了 🤩
 悄悄收藏，别让太多人知道 👇"

→ 3 个版本 A/B 测试，选最优`}
          </div>
        </div>
      </div>
    </section>
  );
}
