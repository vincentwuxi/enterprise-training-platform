import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'learn', title: 'AI 辅助学习', icon: '📚' },
  { id: 'skills', title: '技能提升路线', icon: '🚀' },
  { id: 'brand', title: '个人品牌', icon: '🌟' },
  { id: 'future', title: 'AI 时代生存', icon: '🔮' },
];

export default function LessonAILearningGrowth() {
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
        {active === 'learn' && <LearnSection />}
        {active === 'skills' && <SkillsSection />}
        {active === 'brand' && <BrandSection />}
        {active === 'future' && <FutureSection />}
      </div>
    </div>
  );
}

function LearnSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📚</span>AI 辅助学习方法论</h2>
      <p className="section-desc">AI 不只是搜索 + 回答。它可以成为你的 <strong>私人导师</strong>，按你的节奏和水平教学。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>AI 学习 5 步法</h3>
          <div className="code-block">
{`Step 1: 诊断 — 了解自己的水平
─────────────────────────────
Prompt: "我想学习 [主题]。
请问我 5 个诊断性问题，
评估我目前的知识水平。"

AI 根据你的回答判断:
→ 初学者 / 有基础 / 进阶

Step 2: 地图 — 生成学习路线
─────────────────────────────
"基于我的水平 [初学者]，
请为我制定一个 4 周的学习计划:
- 每周的学习主题
- 每天投入 30 分钟
- 包含实践任务
- 推荐学习资源"

Step 3: 学习 — 概念讲解
─────────────────────────────
"请用简单的类比解释 [概念]:
- 假设我是 10 岁小孩
- 用生活中的例子
- 一步步推进,不要跳步"

Step 4: 练习 — 测验巩固
─────────────────────────────
"关于刚才学的 [概念]:
请出 5 道选择题测验我
每题给出正确答案和解释"

Step 5: 输出 — 费曼验证
─────────────────────────────
"我尝试用自己的话解释 [概念]:
[你的解释]
请指出我理解不准确的地方"`}
          </div>
        </div>

        <div className="info-card">
          <h3>AI 学习场景模板</h3>
          <table className="data-table">
            <thead>
              <tr><th>学习需求</th><th>推荐 Prompt</th></tr>
            </thead>
            <tbody>
              <tr><td>学新领域</td><td>"用 80/20 法则，告诉我学 [领域] 最重要的 20% 知识是什么"</td></tr>
              <tr><td>理解论文</td><td>"解读这篇论文的核心贡献，用非专业语言，并指出它的局限性"</td></tr>
              <tr><td>考试准备</td><td>"作为 [考试] 的辅导老师，教我最容易丢分的 5 个知识点"</td></tr>
              <tr><td>技能迁移</td><td>"我擅长 [A技能]，想学 [B技能]，告诉我可以迁移的能力和需要新学的部分"</td></tr>
              <tr><td>读书笔记</td><td>"用 '核心观点 → 支撑论据 → 我的思考 → 行动计划' 格式总结这本书"</td></tr>
              <tr><td>学英语</td><td>"你是雅思口语考官，请和我进行 Part 2 模拟练习，纠正我的语法错误"</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🚀</span>AI 时代技能提升路线</h2>
      <p className="section-desc">AI 改变了"什么技能有价值"。学会 <strong>与 AI 协作</strong> 比单纯学 AI 更重要。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>AI 时代核心技能矩阵</h3>
          <div className="code-block">
{`能力象限:

      AI 容易替代
         ↑
    ┌────┼────────────┐
    │ 🔴│🟡           │
    │ 数据│基础分析    │
    │ 录入│报表制作    │
    │    │翻译/转写   │
    │    │            │
  低─────┼────────────── 高
  价 │ 🟢│🟣           │
  值 │ 人际│战略思维    │价值
    │ 关系│创意判断    │
    │ 谈判│AI 协作    │
    │    │跨域整合    │
    └────┴────────────┘
       AI 难以替代

结论:
🔴 将被 AI 替代 — 尽快转型
🟡 被 AI 增强 — 学会用 AI 做
🟢 AI 无法替代 — 持续加强
🟣 人 + AI 共创 — 最高价值`}
          </div>
        </div>

        <div className="info-card">
          <h3>个人 AI 能力提升路径</h3>
          <div className="code-block">
{`# 从 AI 用户到 AI 专家的 5 级进阶

Level 1: AI 消费者 (1 周)
  ✅ 会用 ChatGPT/Claude 对话
  ✅ 能写基础 Prompt
  → 大多数人在这一层

Level 2: AI 高效用户 (1 月)
  ✅ 掌握 RACE 等 Prompt 框架
  ✅ 建立个人 Prompt 模板库
  ✅ 日常工作 30%+ 用 AI 辅助

Level 3: AI 流程优化者 (3 月)
  ✅ 用 Zapier/Make 搭建自动化
  ✅ 建立个人/团队 AI 知识库
  ✅ 能评估和选型 AI 工具
  → 成为团队的"AI 达人"

Level 4: AI 产品设计者 (6 月)
  ✅ 能用 AI 设计解决方案
  ✅ 了解 RAG/Agent 基本原理
  ✅ 能用 AI API 搭建简单应用
  → 可以兼任"AI 产品经理"

Level 5: AI 战略推动者 (1 年+)
  ✅ 制定团队/部门 AI 转型策略
  ✅ 评估 AI 投入产出比
  ✅ 培训和赋能其他同事
  → 成为公司的 AI 领导者

你现在在哪一级? 目标是哪一级?`}
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🌟</span>AI 辅助个人品牌建设</h2>
      <p className="section-desc">在 AI 时代，会用 AI 输出高质量内容的人将拥有 <strong>指数级的影响力杠杆</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>AI 内容创作工作流</h3>
          <div className="code-block">
{`# 一周产出一个月的内容

1人 + AI 的内容矩阵:
──────────────────
周一: 深度文章 (公众号/知乎)
  → AI 生成大纲 → 你加观点 → AI 润色

周三: 短内容 (朋友圈/微博/小红书)
  → 从长文中提取精华 → AI 改写适配

周五: 视频/播客素材
  → 长文 → AI 生成口播文案
  → 你录制 → AI 字幕/剪辑

内容生产 SOP:
1. 选题: AI 分析热点 + 你的专长
   "分析 [领域] 近期热门话题,
    结合我的经验在 [方向],
    推荐 5 个选题"

2. 大纲: AI 生成 → 你调整
3. 初稿: AI 写 80% → 你加干货
4. 优化: AI 检查 → 你终审
5. 分发: AI 适配各平台格式

⏱️ 原本: 写一篇文章 4 小时
⏱️ 现在: 1 小时产出一篇高质量文章`}
          </div>
        </div>

        <div className="info-card">
          <h3>LinkedIn / 社交平台策略</h3>
          <div className="code-block">
{`# AI 辅助职场社交

LinkedIn/脉脉 内容策略:

Prompt:
"我是 [职位] ，在 [领域] 有
 [N年] 经验。请帮我:

1. 定位: 我应该打造什么人设?
   (给出 3 个方向)
   
2. 内容日历: 一个月的发帖计划
   Week 1: 行业洞察
   Week 2: 实战经验分享
   Week 3: 工具/方法论教程
   Week 4: 观点/思考类

3. 今天发一条: 主题是 [XX]
   - 用 Hook 开头 (引发好奇)
   - 配合 3 个具体案例
   - 结尾留一个互动问题
   - 加合适的 Hashtag"

# 简历优化:
"请优化我的简历/LinkedIn 简介:
原文: [粘贴]
目标职位: [XX]
要求:
1. 用 STAR 法则重写经历
2. 量化每个成就
3. 加入行业关键词
4. 突出 AI 相关能力"`}
          </div>
        </div>
      </div>
    </section>
  );
}

function FutureSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔮</span>AI 时代的职场生存指南</h2>
      <p className="section-desc">AI 不会取代你，但<strong>会用 AI 的人会取代不会用的人</strong>。现在开始改变还不晚。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>AI 对各岗位的影响评估</h3>
          <div className="code-block">
{`# 不是替代, 是重新定义

高增强岗位 (AI 让你更强):
✅ 产品经理 — AI 辅助用研分析
✅ 市场营销 — AI 辅助内容+分析
✅ 销售 — AI 辅助客户洞察
✅ 项目经理 — AI 辅助进度管理
✅ 战略分析 — AI 辅助数据研究
→ 核心: 学会用 AI 放大你的能力

高转型岗位 (需要重新定义):
⚠️ 翻译 — 从翻译到"审校+本地化"
⚠️ 客服 — 从回复到"复杂问题解决"
⚠️ 数据录入 — 从录入到"数据治理"
⚠️ 初级文案 — 从写作到"创意策划"
→ 核心: 从"执行"升级到"判断"

AI 难替代的领域:
🟢 需要物理操作的工作
🟢 需要深度人际关系的工作
🟢 需要现场判断的工作
🟢 需要创造性突破的工作
🟢 需要承担法律责任的工作`}
          </div>
        </div>

        <div className="info-card">
          <h3>你的 AI 行动计划</h3>
          <div className="code-block">
{`# 今天就开始的行动清单

本周 (30 分钟):
□ 注册 1 个 AI 工具 (推荐: 豆包/ChatGPT)
□ 用 AI 完成 1 个工作任务
□ 保存本课的 3 个 Prompt 模板

本月 (每天 15 分钟):
□ 建立个人 Prompt 模板库 (10+)
□ 用 AI 写一份完整的工作报告
□ 尝试 AI 辅助阅读一篇长报告
□ 在 Notion/飞书建立个人知识库

本季度:
□ 掌握 2-3 个 AI 工具的高级用法
□ 搭建 1 个自动化工作流
□ 分享 AI 使用经验给同事
□ 每月节省 10 小时重复工作

半年后:
□ 成为团队的 "AI 达人"
□ 能帮同事解决 AI 使用问题
□ 建立系统的 AI 辅助工作流
□ 工作效率提升 30%+

记住:
🎯 最好的学习方式是用起来
🎯 每天多用一点, 就多强一点
🎯 不需要精通技术, 只需要会"用"
🎯 AI 是工具, 你才是主角 ✨`}
          </div>
        </div>
      </div>

      <div className="best-practice">
        <h4>🎓 课程核心收获回顾</h4>
        <ul>
          <li>✅ <strong>AI 助手</strong> — 掌握 RACE Prompt 公式，精准驾驭 AI 输出</li>
          <li>✅ <strong>写作效率</strong> — 邮件/报告/PPT/文案 全场景 AI 辅助</li>
          <li>✅ <strong>信息处理</strong> — 长文档速读、智能总结、多语言翻译</li>
          <li>✅ <strong>知识管理</strong> — PARA 框架 + 个人 RAG 知识库</li>
          <li>✅ <strong>会议协作</strong> — AI 全流程会议管理，团队提效</li>
          <li>✅ <strong>数据分析</strong> — 自然语言操控 Excel，一键可视化</li>
          <li>✅ <strong>自动化</strong> — Zapier/Make/RPA 消灭重复劳动</li>
          <li>✅ <strong>个人成长</strong> — AI 学习法、技能进阶路线、个人品牌</li>
        </ul>
      </div>
    </section>
  );
}
