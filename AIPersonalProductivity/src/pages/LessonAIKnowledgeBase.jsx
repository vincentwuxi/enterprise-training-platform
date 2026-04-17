import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'pkm', title: '知识管理体系', icon: '🧩' },
  { id: 'tools', title: '工具实战', icon: '🔧' },
  { id: 'personal-rag', title: '个人 RAG', icon: '🤖' },
  { id: 'habit', title: '知识习惯', icon: '🌱' },
];

export default function LessonAIKnowledgeBase() {
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
        {active === 'pkm' && <PKMSection />}
        {active === 'tools' && <ToolsSection />}
        {active === 'personal-rag' && <PersonalRAGSection />}
        {active === 'habit' && <HabitSection />}
      </div>
    </div>
  );
}

function PKMSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🧩</span>AI 时代的知识管理体系</h2>
      <p className="section-desc">传统的知识管理是"存起来以后用"。AI 时代的知识管理是 <strong>"存进去 + 让 AI 帮你用"</strong>。这是根本性的范式转变。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>知识管理 3.0 演进</h3>
          <div className="code-block">
{`知识管理的三个时代:

1.0 文件夹时代 (2005)
├── 📁 工作文档
│   ├── 📁 2024年
│   │   ├── 周报/
│   │   └── 项目/
│   └── 📁 参考资料
│       └── 行业报告/
└── 问题: 存了就忘, 找不到, 不会用

2.0 笔记工具时代 (2015)
├── 🏷️ 标签体系
├── 🔗 双向链接
├── 📝 Notion / Obsidian / 飞书
└── 问题: 手动整理耗时, 知识是"死"的

3.0 AI 知识助手时代 (2025) ← 现在
├── 🤖 自动提取 & 分类
├── 💬 对话式检索 (自然语言问答)
├── 🧠 自动生成洞察和关联
├── 📤 按需输出 (报告/邮件/PPT)
└── 核心: 知识是"活"的, 随用随取

关键转变:
存储 → 存储 + 对话
分类 → 分类 + 语义搜索
查找 → 提问 (自然语言)
笔记 → 个人知识库 AI`}
          </div>
        </div>

        <div className="info-card">
          <h3>PARA 知识管理框架</h3>
          <div className="code-block">
{`PARA 框架 (适配 AI 时代):

P - Projects (项目)
  有明确目标和截止日期的任务
  例: Q3 新产品上线、年度预算编制
  AI 角色: 项目知识助手,快速检索项目资料

A - Areas (领域)  
  需要持续维护的职责
  例: 团队管理、客户关系、个人技能
  AI 角色: 领域知识库,回答专业问题

R - Resources (资源)
  未来可能有用的参考信息
  例: 行业报告、学习笔记、灵感收集
  AI 角色: 智能检索,需要时自动推荐

A - Archive (档案)
  已完成但可能需要回溯的内容
  例: 结项报告、历史方案、旧版文档
  AI 角色: 历史经验库,"上次我们怎么做的?"

→ 用 Notion / 飞书建立 PARA 结构
→ 接入 AI 搜索,实现对话式知识检索`}
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔧</span>AI 知识管理工具实战</h2>
      <p className="section-desc">选择适合自己的工具，建立 AI 赋能的知识管理系统。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Notion AI 知识库搭建</h3>
          <div className="code-block">
{`# Notion AI 知识管理实战

1. 建立知识库结构:
📋 Database: "知识卡片"
├── 字段:
│   ├── 标题 (Title)
│   ├── 分类 (Select: 技术/管理/行业)
│   ├── 来源 (URL/书名/会议)
│   ├── 标签 (Multi-select)
│   ├── AI 摘要 (由 AI 自动填)
│   └── 个人笔记 (手动补充)
└── 视图: 按分类/按时间/看板

2. 用 Notion AI 增强:
• 写笔记时 → AI 自动补充关联知识
• 搜索时 → 自然语言语义搜索
• 整理时 → AI 自动打标签和分类
• 输出时 → AI 基于知识库生成报告

3. 知识收集自动化:
Browser Extension → Notion Web Clipper
  → 自动保存网页/文章
  → AI 自动生成摘要和标签
  → 存入对应的 Database`}
          </div>
        </div>

        <div className="info-card">
          <h3>工具对比与选型</h3>
          <table className="data-table">
            <thead>
              <tr><th>工具</th><th>AI 能力</th><th>适合人群</th><th>价格</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Notion AI</strong></td><td>内嵌 AI 写作/搜索</td><td>团队协作为主</td><td>$10/月</td></tr>
              <tr><td><strong>飞书知识库</strong></td><td>AI 搜索/智能助手</td><td>企业用户</td><td>企业版</td></tr>
              <tr><td><strong>Obsidian + AI</strong></td><td>本地 AI 插件</td><td>技术人/个人</td><td>免费+插件</td></tr>
              <tr><td><strong>Mem</strong></td><td>AI-First 笔记</td><td>自动整理爱好者</td><td>$10/月</td></tr>
              <tr><td><strong>Tana</strong></td><td>超级标签+AI</td><td>knowledge worker</td><td>$10/月</td></tr>
              <tr><td><strong>语雀</strong></td><td>AI 辅助写作</td><td>中文团队</td><td>免费/付费</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function PersonalRAGSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🤖</span>构建个人 RAG 知识库</h2>
      <p className="section-desc">RAG (检索增强生成) 让你可以 <strong>用自然语言对话的方式查询自己所有的文档和笔记</strong>。这是知识管理的终极形态。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>什么是个人 RAG？</h3>
          <div className="code-block">
{`# 个人 RAG 原理 (简化版)

你的文档                     你的问题
   │                             │
   ▼                             ▼
[切片] 把文档分成小块        [理解] 理解问题含义
   │                             │
   ▼                             ▼
[向量化] 转为数学表示        [搜索] 在向量中找相似
   │                             │
   ▼                             │
[存储] 存入向量数据库  ←─────────┘
   │
   ▼
[拼接] 把相关片段 + 问题 → 发给 AI
   │
   ▼
[回答] AI 基于你的文档内容回答

效果:
你: "我们上次跟 XX 客户谈的价格方案
    是什么? 有没有折扣记录?"
    
AI: "根据 2024/11/15 的会议纪要,
    与 XX 客户谈的是年框方案:
    标准版 ¥98K/年, 给了 15% 折扣
    最终成交价 ¥83.3K/年。
    来源: [会议纪要_20241115.pdf]"`}
          </div>
        </div>

        <div className="info-card">
          <h3>零代码搭建方案</h3>
          <div className="code-block">
{`# 方案 1: Claude Projects (最简单)
1. 打开 Claude → Projects
2. 创建新 Project
3. 上传你的文档 (PDF/Word/TXT)
4. 设置 Project Instructions
5. 开始对话 ✅
限制: 单项目 200K tokens

# 方案 2: ChatGPT + GPTs
1. 创建自定义 GPT
2. 上传 Knowledge 文件
3. 设置 Instructions
4. 私人使用
限制: 文件大小有上限

# 方案 3: 飞书知识库 + AI
1. 在飞书中建立知识空间
2. 上传/编写所有文档
3. 使用飞书 AI 搜索和问答
4. 团队共享 ✅
限制: 需要飞书企业版

# 方案 4: AnythingLLM (进阶)
1. 本地安装 AnythingLLM
2. 导入文档文件夹
3. 选择 AI 模型 (OpenAI/本地)
4. 数据完全本地 🔒
适合: 对数据安全要求高`}
          </div>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 个人 RAG 最佳实践</h4>
        <ul>
          <li><strong>定期更新</strong> — 每周将新文档同步到知识库，保持信息新鲜</li>
          <li><strong>分类管理</strong> — 按项目/领域创建不同的 Project，避免信息混杂</li>
          <li><strong>注意安全</strong> — 机密文档使用本地方案(如AnythingLLM)，不上传云端</li>
        </ul>
      </div>
    </section>
  );
}

function HabitSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🌱</span>AI 知识管理习惯养成</h2>
      <p className="section-desc">工具再好，没有持续的输入和整理习惯，知识库就是空壳。建立 <strong>可持续的知识管理节奏</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>每日/每周知识管理节奏</h3>
          <div className="code-block">
{`📅 每日 (10 分钟)
─────────────────
早: 浏览 3 条行业资讯 (Perplexity)
   → AI 一句话总结 → 存入知识库
   
中: 处理收集箱
   → 待读文章 AI 快速总结
   → 决定: 深读 / 存档 / 删除

晚: 工作笔记归档
   → 今天学到了什么
   → AI 自动打标签

📅 每周 (30 分钟)
─────────────────
• 回顾本周知识卡片
• AI 自动生成"本周知识周报"
• 识别知识盲区: 
  "本周关注最多的 3 个话题是什么?
   哪些领域我还缺乏了解?"

📅 每月 (1 小时)
─────────────────
• 知识库大扫除
• 更新个人 PARA 结构
• AI 生成"月度学习报告"
• 设定下月学习目标`}
          </div>
        </div>

        <div className="info-card">
          <h3>从"知道"到"做到"</h3>
          <div className="code-block">
{`知识管理的终极目标:
不是收藏更多内容,
而是在需要时能立刻调用

费曼技巧 + AI:
──────────────
1. 学到新知识后
2. 让 AI 扮演初学者
3. 你向它解释这个知识
4. AI 指出你解释不清楚的地方
5. 你补充学习 → 再解释

Prompt:
"现在你是一位完全不了解 [主题] 
 的职场新人。请听我的解释，
 然后指出我说得不够清楚、
 可能有误或缺失的部分:"

第二大脑的价值:
──────────────
不是替代思考,
而是让你有更多时间进行高质量思考

• 信息收集 → 交给 AI
• 信息整理 → 交给 AI
• 信息检索 → 交给 AI
• 深度思考 → 你自己 ✨
• 创意判断 → 你自己 ✨
• 关系建立 → 你自己 ✨`}
          </div>
        </div>
      </div>
    </section>
  );
}
