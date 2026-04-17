import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'landscape', title: 'AI 工具全景', icon: '🗺️' },
  { id: 'prompt', title: 'Prompt 工程', icon: '✍️' },
  { id: 'compare', title: '平台选型', icon: '⚖️' },
  { id: 'safety', title: '安全与边界', icon: '🛡️' },
];

export default function LessonAIAssistantBasics() {
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
        {active === 'landscape' && <LandscapeSection />}
        {active === 'prompt' && <PromptSection />}
        {active === 'compare' && <CompareSection />}
        {active === 'safety' && <SafetySection />}
      </div>
    </div>
  );
}

function LandscapeSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🗺️</span>AI 助手工具全景</h2>
      <p className="section-desc">2025 年的 AI 助手已经从"聊天玩具"进化为<strong>真正的工作伙伴</strong>。理解不同 AI 工具的定位和能力边界，是高效使用的第一步。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>主流 AI 助手对比</h3>
          <table className="data-table">
            <thead>
              <tr><th>工具</th><th>擅长</th><th>特色功能</th><th>免费额度</th></tr>
            </thead>
            <tbody>
              <tr><td>🟢 <strong>ChatGPT</strong></td><td>通用对话、创意写作</td><td>GPTs 商店、DALL·E 画图、联网搜索</td><td>GPT-4o mini 免费</td></tr>
              <tr><td>🟠 <strong>Claude</strong></td><td>长文分析、代码、逻辑</td><td>200K 上下文、Artifacts、Projects</td><td>Claude 3.5 Sonnet 限量</td></tr>
              <tr><td>🔵 <strong>Gemini</strong></td><td>多模态、Google 生态</td><td>Deep Research、与 Gmail/Docs 集成</td><td>Gemini Pro 免费</td></tr>
              <tr><td>🟣 <strong>豆包</strong></td><td>中文对话、日常助手</td><td>语音通话、AI 搜索、总结网页</td><td>完全免费</td></tr>
              <tr><td>🟡 <strong>Kimi</strong></td><td>超长文档、学术</td><td>200 万字上下文、论文解读</td><td>基础功能免费</td></tr>
              <tr><td>⚪ <strong>Perplexity</strong></td><td>AI 搜索引擎</td><td>实时联网、引用来源、学术搜索</td><td>每天 5 次 Pro</td></tr>
            </tbody>
          </table>
        </div>

        <div className="info-card">
          <h3>AI 能做什么？（按场景分）</h3>
          <div className="code-block">
{`📝 写作与文案
├── 写邮件、写报告、写总结
├── 改写润色、翻译
├── 生成 PPT 大纲和文案
└── 社交媒体文案创作

📖 阅读与研究
├── 总结长文档 / PDF / 论文
├── 提取关键信息和数据
├── 对比分析多篇文章
└── 生成阅读笔记

📊 数据与分析
├── Excel 数据清洗和分析
├── 写公式和函数
├── 生成图表和可视化
└── 简单数据建模

🤝 沟通与协作
├── 生成会议纪要
├── 准备面试题目
├── 编写 FAQ 和知识库
└── 客户邮件回复

🎯 思考与决策
├── 头脑风暴 / SWOT 分析
├── 制定计划和方案
├── 优缺点对比
└── 风险评估`}
          </div>
        </div>

        <div className="info-card">
          <h3>AI 的能力边界（重要!）</h3>
          <div className="code-block">
{`✅ AI 擅长:
• 从大量信息中提取和总结
• 按模板生成结构化内容
• 多语言翻译和改写
• 头脑风暴，提供多角度思路
• 解释复杂概念，用简单语言复述

⚠️ AI 需要人工检核:
• 具体数字和数据（可能编造）
• 最新新闻和事件（知识有截止日）
• 专业领域的精确判断
• 法律、医疗等高风险建议

❌ AI 不能替代:
• 最终的商业判断和决策
• 人际关系和情商
• 创造性的突破性想法
• 对企业内部机密信息的了解
• 承担法律责任`}
          </div>
        </div>
      </div>
    </section>
  );
}

function PromptSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">✍️</span>Prompt 工程 — 让 AI 精准输出</h2>
      <p className="section-desc">同样的 AI，不同的 Prompt 效果可以差 10 倍。掌握 <strong>Prompt 工程的核心公式</strong>，是提升 AI 使用效率的关键。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>万能 Prompt 公式: RACE</h3>
          <div className="code-block">
{`R - Role (角色)
    让 AI 扮演一个专家角色
    "你是一位资深市场营销总监..."

A - Action (任务)
    明确告诉 AI 要做什么
    "请帮我撰写一份季度营销报告..."

C - Context (背景)
    提供必要的上下文信息
    "我们公司是做 B2B SaaS 的，
     Q3 营收增长 15%，新客户 120 家..."

E - Example (示例/格式)
    告诉 AI 期望的输出格式
    "请使用以下结构:
     1. 执行摘要 (3 句话)
     2. 核心数据亮点
     3. 挑战与机遇
     4. 下季度建议"`}
          </div>
        </div>

        <div className="info-card">
          <h3>5 个立即能用的 Prompt 技巧</h3>
          <div className="code-block">
{`技巧 1: 给 AI 一个身份
  ❌ "帮我写个邮件"
  ✅ "你是一位专业的商务沟通顾问，
      请帮我写一封催款邮件..."

技巧 2: 给具体约束
  ❌ "总结这篇文章"
  ✅ "用 3 个要点总结这篇文章，
      每个要点不超过 30 字"

技巧 3: 给示例 (Few-shot)
  "请按以下风格改写:
   原文: 本产品性价比高
   改写: 以同类 50% 的价格，
         获得 200% 的性能体验
   ---
   现在改写: 我们的服务很专业"

技巧 4: 分步思考 (Chain-of-Thought)
  "请一步一步分析这个问题:
   1. 首先分析原因
   2. 然后列出可选方案
   3. 最后给出推荐和理由"

技巧 5: 让 AI 反问你
  "在回答之前，请先问我 3 个
   你需要了解的关键问题"`}
          </div>
        </div>

        <div className="info-card">
          <h3>Prompt 实战：10 个高频场景</h3>
          <table className="data-table">
            <thead>
              <tr><th>场景</th><th>推荐 Prompt 开头</th></tr>
            </thead>
            <tbody>
              <tr><td>写周报</td><td>"根据以下工作内容，生成一份结构清晰的周报，重点突出成果和下周计划..."</td></tr>
              <tr><td>改邮件</td><td>"请将这封邮件改写得更专业、礼貌，同时保持原意。语气: 正式但友好..."</td></tr>
              <tr><td>总结会议</td><td>"请从以下会议记录中提取: 1. 核心决议 2. 待办事项(含负责人) 3. 未解决议题..."</td></tr>
              <tr><td>数据分析</td><td>"分析这组销售数据，找出 Top 3 趋势和 2 个异常点，用非技术语言解释..."</td></tr>
              <tr><td>翻译文档</td><td>"翻译以下内容为中文，保持专业术语不翻译，语气正式，适合商务场景..."</td></tr>
              <tr><td>头脑风暴</td><td>"请用 SCAMPER 方法，为以下产品问题生成 10 个创新解决方案..."</td></tr>
              <tr><td>写 PPT</td><td>"为以下主题生成 10 页 PPT 大纲，包含每页的标题、要点和建议配图..."</td></tr>
              <tr><td>学新技能</td><td>"作为一位耐心的教师，用简单类比解释[概念]，假设我是完全的初学者..."</td></tr>
              <tr><td>面试准备</td><td>"我要面试[职位]，请生成 10 个可能的面试问题及参考答案..."</td></tr>
              <tr><td>竞品分析</td><td>"对比分析以下 3 个竞品的优劣势，输出 SWOT 分析表格..."</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CompareSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">⚖️</span>AI 平台选型指南</h2>
      <p className="section-desc">不同的工作场景适合不同的 AI 工具。选对工具，效率翻倍。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>按场景选工具</h3>
          <div className="code-block">
{`你的需求是什么?
│
├── 日常对话 / 快速问答
│   → 豆包 (免费、中文好)
│   → ChatGPT (通用、生态丰富)
│
├── 处理长文档 / PDF / 论文
│   → Kimi (200万字上下文)
│   → Claude (200K + Projects)
│
├── 搜索 / 研究 / 求证
│   → Perplexity (实时联网+引用)
│   → Gemini Deep Research
│
├── 写代码 / 技术问题
│   → Claude (代码能力最强)
│   → ChatGPT + Canvas (可视化)
│
├── 写长文 / 报告 / 方案
│   → Claude (逻辑清晰, 格式好)
│   → ChatGPT (创意多, 风格活)
│
├── 数据分析 / Excel
│   → ChatGPT (Advanced Data Analysis)
│   → Google Gemini (Sheets 集成)
│
└── 图片生成 / 设计
    → Midjourney (最高质量)
    → ChatGPT DALL·E (方便快捷)
    → 豆包 (中文理解好)`}
          </div>
        </div>

        <div className="info-card">
          <h3>企业用户推荐组合</h3>
          <table className="data-table">
            <thead>
              <tr><th>角色</th><th>主力工具</th><th>辅助工具</th><th>月预算</th></tr>
            </thead>
            <tbody>
              <tr><td>管理层</td><td>Claude Pro</td><td>Perplexity Pro</td><td>$40</td></tr>
              <tr><td>市场/运营</td><td>ChatGPT Plus</td><td>Midjourney</td><td>$30</td></tr>
              <tr><td>产品经理</td><td>Claude Pro</td><td>Kimi 会员</td><td>$25</td></tr>
              <tr><td>销售</td><td>豆包 (免费)</td><td>ChatGPT</td><td>$0-20</td></tr>
              <tr><td>行政/HR</td><td>豆包 (免费)</td><td>Kimi</td><td>$0</td></tr>
              <tr><td>研发工程师</td><td>Claude Pro</td><td>Cursor</td><td>$40</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SafetySection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🛡️</span>AI 使用安全与规范</h2>
      <p className="section-desc">在企业中使用 AI 必须遵守 <strong>数据安全和合规要求</strong>。以下红线不可触碰。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>🚨 企业 AI 使用红线</h3>
          <div className="code-block">
{`绝对不能做:
❌ 将客户个人信息输入公共 AI
   (姓名、电话、身份证、地址)
   
❌ 上传公司未公开的财务数据
   (营收、利润、预算等)

❌ 分享核心商业机密
   (技术方案、定价策略、并购计划)

❌ 将 AI 输出直接作为合同/法律文件
   (必须法务审核)

❌ 未经授权用 AI 生成公司对外声明

应该做:
✅ 使用企业版 AI (数据不训练模型)
✅ 敏感信息脱敏后再输入
✅ AI 输出必须人工审核
✅ 标注"AI 辅助生成"
✅ 遵守公司 AI 使用政策`}
          </div>
        </div>

        <div className="info-card">
          <h3>输出验证清单</h3>
          <table className="data-table">
            <thead>
              <tr><th>验证项</th><th>风险</th><th>检查方法</th></tr>
            </thead>
            <tbody>
              <tr><td>事实准确性</td><td>AI 幻觉/编造数据</td><td>交叉验证关键数据</td></tr>
              <tr><td>时效性</td><td>信息可能过时</td><td>确认数据截止日期</td></tr>
              <tr><td>版权合规</td><td>可能含版权内容</td><td>用查重工具验证</td></tr>
              <tr><td>偏见检查</td><td>可能有性别/文化偏见</td><td>敏感内容人工审读</td></tr>
              <tr><td>品牌一致</td><td>语气/风格不符</td><td>按品牌指南修改</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
