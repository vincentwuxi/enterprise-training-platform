import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'intro', title: '自动化思维', icon: '🔄' },
  { id: 'nocode', title: '无代码工具', icon: '🧱' },
  { id: 'scenarios', title: '实战场景', icon: '🎯' },
  { id: 'rpa', title: 'RPA 桌面自动化', icon: '🖱️' },
];

export default function LessonAIWorkflowAutomation() {
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
        {active === 'intro' && <IntroSection />}
        {active === 'nocode' && <NocodeSection />}
        {active === 'scenarios' && <ScenariosSection />}
        {active === 'rpa' && <RPASection />}
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔄</span>自动化思维：找到你的"重复劳动"</h2>
      <p className="section-desc">如果一个任务你做过 3 次以上，且步骤大致相同，那它就<strong>值得自动化</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>自动化机会评估</h3>
          <div className="code-block">
{`# 你的工作中有多少可以自动化?

用 AI 审计你的日常工作:

Prompt:
"以下是我每周做的重复性工作:
[列出你的重复任务]

请按以下维度评估每个任务:

┌────────┬──────┬───────┬──────┐
│ 任务   │频次  │每次   │自动化│
│        │/周   │耗时   │难度  │
├────────┼──────┼───────┼──────┤
│ 发周报 │ 1次  │ 30min │ 低   │
│ 回询价 │ 10次 │ 15min │ 中   │
│ 更新表 │ 5次  │ 20min │ 低   │
│ 审批流 │ 15次 │ 5min  │ 低   │
│ 客户跟 │ 20次 │ 10min │ 中   │
│ 进报告 │      │       │      │
└────────┴──────┴───────┴──────┘

优先自动化: 高频 × 耗时 × 低难度
                      
发周报: 1 × 30 = 30 min → 自动化!
回询价: 10 × 15 = 150 min → 必须自动!
更新表: 5 × 20 = 100 min → 自动化!

→ 每周可节省 4.7 小时 ≈ 一个早上!`}
          </div>
        </div>

        <div className="info-card">
          <h3>自动化的三种方式</h3>
          <div className="code-block">
{`方式 1: AI 对话自动化 (最快)
────────────────────────
保存常用 Prompt → 一键生成
例: 每周五粘贴数据→AI出周报

门槛: ⭐ (零门槛)
效果: ⭐⭐⭐ (节省 30-50%)

方式 2: 无代码平台 (最灵活)
────────────────────────
Zapier / Make / n8n
拖拽式构建自动工作流
例: 邮件→解析→AI处理→回复

门槛: ⭐⭐ (需要学1-2天)
效果: ⭐⭐⭐⭐⭐ (完全自动化)

方式 3: RPA 桌面自动化 (最强)
────────────────────────
UiPath / 影刀 / Power Automate
模拟人类操作软件界面
例: 自动登录→导出→处理→上传

门槛: ⭐⭐⭐ (需要学1周)
效果: ⭐⭐⭐⭐⭐ (连内网都能自动化)

推荐路径:
先从方式1开始 → 2周后学方式2
→ 觉得不够再学方式3`}
          </div>
        </div>
      </div>
    </section>
  );
}

function NocodeSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🧱</span>无代码自动化工具</h2>
      <p className="section-desc">Zapier、Make、n8n — 不需要写代码，用 <strong>积木式拼接</strong> 构建自动工作流。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>Zapier 快速入门</h3>
          <div className="code-block">
{`# Zapier 核心概念

Trigger (触发器) → Action (动作)

一个 "Zap" = 一条自动化规则

示例 1: 邮件自动存档
┌──────────┐    ┌──────────┐
│ Trigger: │ → │ Action:  │
│ 收到邮件 │    │ 保存到   │
│ (Gmail)  │    │ Notion   │
└──────────┘    └──────────┘

示例 2: 表单→AI分析→通知
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 表单提交 │→│ ChatGPT  │→│ 发通知   │
│ (金数据) │  │ 分析内容 │  │ (飞书)   │
└──────────┘  └──────────┘  └──────────┘

示例 3: 客户跟进自动化
当 CRM 添加新客户
  → AI 生成个性化欢迎邮件
  → 自动发送
  → 3天后自动发跟进邮件
  → 标记为"已跟进"

# 连接 6000+ 应用:
Gmail, Slack, Notion, 飞书, 
Salesforce, HubSpot, Google Sheets,
ChatGPT, Claude, Airtable...`}
          </div>
        </div>

        <div className="info-card">
          <h3>工具对比</h3>
          <table className="data-table">
            <thead>
              <tr><th>工具</th><th>优势</th><th>劣势</th><th>免费额度</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Zapier</strong></td><td>最多集成App<br/>最易上手</td><td>免费版限制多<br/>高级功能贵</td><td>100 tasks/月</td></tr>
              <tr><td><strong>Make</strong></td><td>可视化强<br/>性价比高</td><td>学习曲线稍陡</td><td>1000 ops/月</td></tr>
              <tr><td><strong>n8n</strong></td><td>开源免费<br/>可自部署</td><td>需要自己部署<br/>社区支持</td><td>自部署免费</td></tr>
              <tr><td><strong>飞书自动化</strong></td><td>飞书生态<br/>中文</td><td>只能连飞书生态</td><td>随飞书使用</td></tr>
              <tr><td><strong>Power Automate</strong></td><td>Office 生态</td><td>微软生态内</td><td>有限免费</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ScenariosSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🎯</span>10 个高价值自动化场景</h2>
      <p className="section-desc">以下场景覆盖<strong>市场、销售、运营、HR、财务</strong>等常见部门，每个都可以节省数小时。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>职能部门自动化</h3>
          <div className="code-block">
{`📧 市场部
1. 竞品监控: 自动监控竞品网站变化
   → AI 生成竞品动态周报
   → 发送到营销群

2. 内容分发: 公众号文章发布
   → 自动同步到知乎/头条/小红书
   → AI 适配各平台格式

💼 销售部
3. 线索处理: 网站表单提交
   → AI 分析线索质量评分
   → 高分自动分配给销售
   → 低分自动发培育邮件

4. 报价自动化: 收到询价邮件
   → AI 提取需求 → 匹配产品
   → 生成报价单 → 发送审批

👥 HR 部
5. 简历筛选: 收到简历邮件
   → AI 评分 → 符合条件自动约面试
   → 不符合自动发感谢信

6. 新人 Onboarding: 入职当天
   → 自动发欢迎邮件+资料包
   → 开通各系统账号
   → 安排第一周培训日程`}
          </div>
        </div>

        <div className="info-card">
          <h3>通用场景自动化</h3>
          <div className="code-block">
{`📊 运营部
7. 日报自动化:
   每天 18:00 → 自动采集各渠道数据
   → AI 生成运营日报
   → 发送到管理层群
   → 异常数据单独 @负责人

💰 财务部
8. 发票处理:
   收到发票照片/PDF
   → AI OCR 识别信息
   → 自动填入报销系统
   → 触发审批流程

🔧 IT 部
9. 工单处理:
   IT 工单提交
   → AI 分类 (硬件/软件/权限)
   → 常见问题自动回复解决方案
   → 复杂问题分配给对应工程师

📋 通用
10. 信息聚合:
    关注的行业关键词出现在新闻中
    → AI 总结相关文章
    → 每天早上 9:00 推送到你手机
    → 一杯咖啡的时间了解行业动态

ROI 估算:
每个流程节省 2h/周
× 10 个流程
= 每周节省 20 小时 ≈ 2.5 个工作日`}
          </div>
        </div>
      </div>
    </section>
  );
}

function RPASection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🖱️</span>RPA 桌面自动化</h2>
      <p className="section-desc">RPA (机器人流程自动化) 可以操控<strong>任何桌面软件</strong>，包括没有 API 的内网系统。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>RPA 工具选择</h3>
          <table className="data-table">
            <thead>
              <tr><th>工具</th><th>特点</th><th>价格</th><th>适合</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>影刀 RPA</strong></td><td>中文最强，AI增强</td><td>免费版可用</td><td>国内企业首选</td></tr>
              <tr><td><strong>UiPath</strong></td><td>全球最大RPA</td><td>企业级</td><td>大型企业</td></tr>
              <tr><td><strong>Power Automate Desktop</strong></td><td>微软原生，免费</td><td>免费</td><td>Windows 用户</td></tr>
              <tr><td><strong>按键精灵</strong></td><td>脚本录制</td><td>免费</td><td>简单重复操作</td></tr>
            </tbody>
          </table>
        </div>

        <div className="info-card">
          <h3>RPA + AI 融合场景</h3>
          <div className="code-block">
{`# AI 让 RPA 更智能

传统 RPA:
按固定规则操作 → 遇到异常就卡住

AI + RPA:
遇到异常 → AI 判断 → 智能处理

示例: 审批单自动处理
─────────────────────
Step 1: RPA 登录 OA 系统
Step 2: 获取待审批单据列表
Step 3: 对每个单据:
  3a. RPA 打开单据详情
  3b. 截图/OCR 提取信息
  3c. AI 分析:
      "这是一张差旅报销单:
       金额 ¥3,500
       差旅目的: 客户拜访
       是否有发票: 是
       是否超标: 未超标\n       
       建议: 审批通过 ✅"
  3d. RPA 点击"通过"
  3e. 如果 AI 不确定 → 标记为待人工审核

→ 每天 50 张审批单
→ 从 2 小时减少到 15 分钟
→ 只需要人工处理 5-10 张异常`}
          </div>
        </div>
      </div>
    </section>
  );
}
