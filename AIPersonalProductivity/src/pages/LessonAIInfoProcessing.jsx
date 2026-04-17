import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'reading', title: '高效阅读', icon: '📖' },
  { id: 'summary', title: '智能总结', icon: '📝' },
  { id: 'translate', title: '翻译与改写', icon: '🌐' },
  { id: 'research', title: 'AI 研究', icon: '🔬' },
];

export default function LessonAIInfoProcessing() {
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
        {active === 'reading' && <ReadingSection />}
        {active === 'summary' && <SummarySection />}
        {active === 'translate' && <TranslateSection />}
        {active === 'research' && <ResearchSection />}
      </div>
    </div>
  );
}

function ReadingSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📖</span>AI 辅助高效阅读</h2>
      <p className="section-desc">每天面对数十封邮件、多篇报告和行业资讯，AI可以将<strong>阅读效率提升 5-10 倍</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>长文档速读工作流</h3>
          <div className="code-block">
{`📄 处理一个 50 页的行业报告:

Step 1: 全局概览 (2 分钟)
  "请用 5 句话总结这份报告的核心观点，
   并列出最关键的 3 个数据。"
   
Step 2: 目标定位 (1 分钟)
  "我最关心 [企业数字化转型] 相关内容，
   请告诉我应该重点阅读哪些章节，
   以及每章的核心结论。"

Step 3: 深入提问 (5 分钟)
  "报告中提到的 3 个行业趋势，
   哪个对 B2B SaaS 公司影响最大？
   请结合报告数据分析。"

Step 4: 生成笔记 (1 分钟)
  "请将以上分析整理为一页 A4 笔记:
   包含核心观点、关键数据和我的
   行动建议。"

⏱️ 传统阅读: 2-3 小时
⏱️ AI 辅助: 10-15 分钟
💡 效率提升: 10x+`}
          </div>
        </div>

        <div className="info-card">
          <h3>推荐阅读工具</h3>
          <table className="data-table">
            <thead>
              <tr><th>工具</th><th>核心功能</th><th>最佳场景</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Kimi</strong></td><td>200 万字超长上下文</td><td>长报告/论文/书籍</td></tr>
              <tr><td><strong>Claude Projects</strong></td><td>多文档项目空间</td><td>持续跟踪多个文档</td></tr>
              <tr><td><strong>ChatGPT</strong></td><td>PDF 直接上传分析</td><td>快速单文档分析</td></tr>
              <tr><td><strong>通义读光</strong></td><td>OCR+文档理解</td><td>扫描件/图片文档</td></tr>
              <tr><td><strong>Readwise Reader</strong></td><td>AI 高亮+摘要</td><td>日常文章阅读</td></tr>
              <tr><td><strong>Elicit</strong></td><td>学术论文 AI 助手</td><td>文献综述/学术研究</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SummarySection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📝</span>智能总结技术</h2>
      <p className="section-desc">不同类型的内容需要不同的总结策略。掌握 <strong>分层总结</strong> 技巧，信息提取效率翻倍。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>总结 Prompt 模板</h3>
          <div className="code-block">
{`# 分层总结法

Level 1: 一句话总结
  "用一句话概括这篇文章的核心观点"

Level 2: 要点总结
  "用 5 个 bullet points 总结关键信息，
   每个要点不超过 30 字"

Level 3: 结构化总结
  "请按以下结构总结:
   1. 核心论点 (1 句)
   2. 支撑论据 (3 点)
   3. 数据/案例 (关键数字)
   4. 作者结论
   5. 我的行动建议"

Level 4: 对比总结 (多篇文章)
  "请对比以下 3 篇文章:
   [文章 A] [文章 B] [文章 C]
   输出:
   - 共识点 (3 者都同意的)
   - 分歧点 (意见不同的)
   - 综合结论 (你的建议)"

# 特殊格式总结:
"将这份报告总结为:
 1. 给老板看的版本 (3句话+数据)
 2. 给团队看的版本 (行动清单)
 3. 给客户看的版本 (价值导向)"`}
          </div>
        </div>

        <div className="info-card">
          <h3>视频/音频内容处理</h3>
          <div className="code-block">
{`# 视频/播客/会议录音 → 文字+总结

工具推荐:
┌──────────────────────────────────┐
│ 飞书妙记 — 自动录音+转文字+AI总结│
│ 通义听悟 — 支持多语言实时转写    │
│ Otter.ai — 英文会议转录首选      │
│ 讯飞听见 — 中文语音转写最准确    │
└──────────────────────────────────┘

完整工作流:
1. 上传录音/视频 → 自动转文字
2. AI 识别发言人
3. 自动生成会议纪要:
   - 核心议题
   - 每人的关键发言
   - 决议事项
   - TODO 及负责人
4. 一键分享给参会者

# 处理 YouTube/B站视频:
步骤:
1. 复制视频链接
2. 粘贴到 Kimi / 通义千问
3. Prompt: "请总结这个视频的核心内容，
   列出关键知识点和时间戳"
4. 生成带时间戳的学习笔记`}
          </div>
        </div>
      </div>
    </section>
  );
}

function TranslateSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🌐</span>AI 翻译与多语言改写</h2>
      <p className="section-desc">AI 翻译已远超传统翻译工具。它能理解语境、保留语气、适配文化差异。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>商务翻译 Prompt</h3>
          <div className="code-block">
{`# 超越"直译"的翻译 Prompt

❌ 普通: "翻译这段话"
   → 直译,可能不地道

✅ 专业: "请将以下中文翻译为英文:
   要求:
   1. 语气: 商务正式
   2. 专业术语保留原文 (括号标注)
   3. 符合英文表达习惯,不要中式英语
   4. 数字和日期按英文格式
   5. 人名保留拼音

   [粘贴原文]"

# 文化适配翻译:
"将这份中文市场方案翻译为英文，
 面向美国市场:
 - 将中国案例替换为对应的美国案例
 - 节日/活动适配为美国场景
 - 货币换算为美元
 - 保持营销调性"

# 多语言一键翻译:
"将以下内容翻译为以下 5 种语言:
 英文、日文、韩文、法文、西班牙文
 输出为表格,方便对照检查"`}
          </div>
        </div>

        <div className="info-card">
          <h3>改写与风格转换</h3>
          <div className="code-block">
{`# AI 改写比翻译更强大

场景 1: 简化专业文档
  "将以下技术文档改写为产品经理
   能理解的版本,避免技术术语,
   用类比解释复杂概念"

场景 2: 升级文档档次
  "将以下口语化的笔记改写为
   正式的项目提案格式,
   补充必要的结构和论证"

场景 3: 缩写长文
  "将这篇 5000 字的报告精简为
   1000 字的版本,保留所有关键数据
   和核心结论"

场景 4: 扩写要点
  "将以下 5 个要点扩写为一篇
   2000 字的分析文章,每个要点
   配一个具体案例"

场景 5: 语气转换
  原文 → 更积极 / 更谨慎 / 更学术
  / 更口语 / 更有说服力`}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResearchSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔬</span>AI 辅助研究与信息收集</h2>
      <p className="section-desc">用 AI 做竞品调研、行业分析和市场研究，让你的信息搜索<strong>从小时级缩短到分钟级</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>AI 研究工作流</h3>
          <div className="code-block">
{`# 用 Perplexity + Claude 做深度研究

Step 1: 用 Perplexity 搜索 (实时信息)
  "2025 年中国企业 SaaS 市场规模
   和增长趋势，引用权威数据源"
  → 获得带来源引用的实时数据

Step 2: 用 Claude 深度分析
  "基于以下数据 [粘贴搜索结果]:
   1. 市场趋势分析 (3 个关键趋势)
   2. 竞争格局变化
   3. 我们公司的机遇和威胁
   4. SWOT 分析表格"

Step 3: 交叉验证
  "请检查以上分析是否有明显的
   逻辑漏洞或数据矛盾"

Step 4: 生成报告
  "将以上研究整合为一份
   3 页的研究简报，
   适合发送给管理层"`}
          </div>
        </div>

        <div className="info-card">
          <h3>竞品分析模板</h3>
          <div className="code-block">
{`Prompt:
"请对以下 3 个竞品进行全面分析:
竞品 A: [名称] — [官网]
竞品 B: [名称] — [官网]  
竞品 C: [名称] — [官网]

请输出:

1. 功能对比表
   (核心功能 × 3 家对比)

2. 定价策略对比
   (价格区间、收费模式、免费版差异)

3. 目标用户画像差异
   (各自主攻哪类客户)

4. 优劣势分析
   (每家 3 个优点 + 3 个不足)

5. 技术架构差异
   (如有公开信息)

6. 市场定位地图
   (横轴: 价格,纵轴: 功能丰富度)

7. 我们的差异化机会
   (基于以上分析,建议我们的定位)"

→ 传统做法: 2-3 天
→ AI 辅助: 2-3 小时 (含验证)`}
          </div>
        </div>
      </div>
    </section>
  );
}
