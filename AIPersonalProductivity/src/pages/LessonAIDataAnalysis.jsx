import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'excel', title: 'Excel / 表格', icon: '📊' },
  { id: 'viz', title: '数据可视化', icon: '📈' },
  { id: 'insight', title: '洞察挖掘', icon: '💡' },
  { id: 'dashboard', title: '自动化报表', icon: '🖥️' },
];

export default function LessonAIDataAnalysis() {
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
        {active === 'excel' && <ExcelSection />}
        {active === 'viz' && <VizSection />}
        {active === 'insight' && <InsightSection />}
        {active === 'dashboard' && <DashboardSection />}
      </div>
    </div>
  );
}

function ExcelSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📊</span>AI 辅助 Excel 与表格处理</h2>
      <p className="section-desc">不用学复杂公式，用自然语言告诉 AI 你想要什么，它帮你写公式、做透视表、清洗数据。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>用 AI 写 Excel 公式</h3>
          <div className="code-block">
{`# 告别记公式的日子!

你说: "帮我写一个公式: 如果 B 列的
销售额大于 10 万，显示'超标'，
否则如果大于 5 万 显示'达标'，
否则显示'未达标'"

AI 给你:
=IF(B2>100000,"超标",
  IF(B2>50000,"达标","未达标"))

# 更复杂的场景:

你说: "我需要一个公式: 统计每个部门
的平均销售额，但排除已离职员工
(状态列 = '离职' 的不算)"

AI 给你:
=AVERAGEIFS(D:D, A:A, "销售部",
  E:E, "<>离职")

# 数据清洗:

你说: "B 列的日期格式混乱，有
'2024/01/15'、'2024-01-15'、
'Jan 15, 2024' 等格式，
帮我统一为 YYYY-MM-DD"

AI: 给你一个清洗方案 + VBA 脚本

# 数据透视表:

你说: "帮我用这份销售数据做一个
按月份和产品分类的交叉分析表"

AI: 给你透视表的设置步骤 + 公式版本`}
          </div>
        </div>

        <div className="info-card">
          <h3>ChatGPT 高级数据分析</h3>
          <div className="code-block">
{`# ChatGPT Advanced Data Analysis

Step 1: 上传 Excel/CSV 文件

Step 2: 用自然语言提问
  "分析这份销售数据:
   1. 哪个产品类别增长最快?
   2. 哪个区域的退货率最高?
   3. 环比增长趋势如何?
   4. 请生成一个可视化图表"

Step 3: AI 自动执行 Python 代码
  → 数据清洗
  → 计算统计指标
  → 生成图表
  → 输出结论

Step 4: 追问和深入
  "把第 2 点展开: 退货率高的原因
   可能是什么? 请交叉分析退货
   与物流渠道、产品价格的关系"

⚠️ 注意: 敏感数据请脱敏!
  可用: 飞书多维表格 (数据不出境)
  可用: 本地 Code Interpreter`}
          </div>
        </div>
      </div>
    </section>
  );
}

function VizSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">📈</span>AI 数据可视化</h2>
      <p className="section-desc">让 AI 选择合适的图表类型、配色方案和布局，生成 <strong>专业级数据可视化</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>图表选择指南</h3>
          <div className="code-block">
{`# 让 AI 选择最佳图表类型

Prompt:
"我有以下数据 [描述数据类型]:
请推荐最适合的图表类型和理由。

AI 的图表决策树:
───────────────
你要展示什么?
│
├── 趋势/变化 → 折线图 📈
│   "过去 12 个月的月收入变化"
│
├── 对比/排名 → 柱状图 📊
│   "各部门的季度业绩对比"
│
├── 占比/构成 → 饼图/环形图 🥧
│   "各渠道的收入占比"
│
├── 关系/相关 → 散点图 ⚬
│   "广告投入与销售额的关系"
│
├── 分布 → 直方图/箱线图 📦
│   "客户年龄分布"
│
├── 流程/转化 → 漏斗图 🔽
│   "用户注册到付费的转化漏斗"
│
└── 地理数据 → 地图 🗺️
   "各省份销售额热力图"

Prompt 技巧:
"请用 [工具] 生成图表:
 数据: [粘贴或描述]
 风格: 简洁商务风 / 暗色科技风
 配色: 公司品牌色 #_____
 注: 标注关键数据点"`}
          </div>
        </div>

        <div className="info-card">
          <h3>AI 可视化工具</h3>
          <table className="data-table">
            <thead>
              <tr><th>工具</th><th>功能</th><th>适用场景</th><th>门槛</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>ChatGPT</strong></td><td>上传数据自动画图</td><td>快速分析+图表</td><td>零门槛</td></tr>
              <tr><td><strong>飞书多维表格</strong></td><td>AI 图表+仪表盘</td><td>团队数据看板</td><td>零门槛</td></tr>
              <tr><td><strong>Tableau AI</strong></td><td>专业 BI + AI</td><td>企业级数据分析</td><td>中等</td></tr>
              <tr><td><strong>Flourish</strong></td><td>动态图表生成</td><td>演示/对外报告</td><td>低</td></tr>
              <tr><td><strong>Napkin AI</strong></td><td>文字→信息图</td><td>概念/流程可视化</td><td>零门槛</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function InsightSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">💡</span>AI 数据洞察挖掘</h2>
      <p className="section-desc">AI 不只是画图工具，更能帮你从数据中 <strong>发现隐藏的规律和异常</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>让 AI 发现数据洞察</h3>
          <div className="code-block">
{`# 主动让 AI 发现你没想到的

Prompt 1: 发现异常
"分析这份数据，找出:
 1. 3 个最显著的异常值
 2. 可能的原因分析
 3. 建议的跟进行动"

Prompt 2: 预测趋势
"基于过去 12 个月的数据:
 1. 下个季度的预测范围
 2. 预测的置信度
 3. 可能影响预测的风险因素"

Prompt 3: 交叉分析
"请对以下维度做交叉分析:
 - 客户类型 × 产品类别 × 季节
 找出哪些组合的表现最好/最差"

Prompt 4: Root Cause 分析
"本月销售额下降 15%:
 请帮我做 Root Cause 分析
 (鱼骨图/5Why 方法):
 1. 按渠道分解下降来源
 2. 按产品分解
 3. 按区域分解
 4. 找出下降最大的单一因素"

Prompt 5: 给建议
"基于以上分析，如果你是
 这家公司的 CMO，你会:
 1. 立即做什么 (本周)
 2. 短期做什么 (本月)
 3. 中期调整什么 (本季度)"`}
          </div>
        </div>

        <div className="info-card">
          <h3>数据叙事 (Data Storytelling)</h3>
          <div className="code-block">
{`# 让 AI 把数据变成故事

场景: 准备给管理层的数据汇报

Prompt:
"基于以下数据分析结果:
[粘贴数据和图表描述]

请帮我写一段数据叙事:
1. 用 SBA 框架:
   S - Situation (背景/现状)
   B - Bridge (转折/发现)
   A - Action (建议/行动)

2. 把数字翻译成业务语言:
   ❌ 'DAU 环比增长 3.2%'
   ✅ '每天多了 5000 个活跃用户,
       相当于每月多了 15 万次
       潜在购买机会'

3. 选一个最有冲击力的数字做标题:
   ❌ 'Q3 业务分析报告'
   ✅ '我们在 Q3 损失了 ¥200 万,
       但有 3 个方法可以扭转'

→ 好的数据汇报 = 数据 + 故事 + 行动"`}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🖥️</span>自动化数据报表</h2>
      <p className="section-desc">重复性报表是最该自动化的任务。用 AI + 工具实现 <strong>"数据到报告" 一键生成</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>报表自动化方案</h3>
          <div className="code-block">
{`# 报表自动化的 3 个层次

Level 1: 半自动 (人人可做)
──────────────────────
1. 每周导出 Excel 数据
2. 上传 ChatGPT
3. 用固定 Prompt 生成分析
4. 粘贴到报告模板
⏱️ 30 分钟/次

Level 2: 低代码自动化
──────────────────────
1. 飞书多维表格 → 自动汇总
2. AI 自动生成周报文档
3. 自动发送到群聊
⏱️ 设置一次, 之后 0 分钟

Level 3: 实时看板
──────────────────────
1. 数据源 → API 自动采集
2. BI 工具实时可视化
3. AI 自动发现异常并告警
4. 手机随时查看
⏱️ 完全自动化

# 推荐工具组合:
日报: 飞书多维表格 + AI
周报: Notion AI + 模板
月报: ChatGPT + Excel
季报: Tableau / PowerBI + AI`}
          </div>
        </div>

        <div className="info-card">
          <h3>AI 报表 Prompt 库</h3>
          <div className="code-block">
{`# 固定报表 Prompt (保存复用)

日报 Prompt:
"分析今天的运营数据 [粘贴]:
输出格式:
📊 今日概览: 3 个核心指标
📈 同比/环比: 与昨日/上周对比
⚠️ 异常: 需要关注的数据
✅ 亮点: 表现突出的方面"

周报 Prompt:  
"根据本周数据 [粘贴]:
1. 本周总结 (3 句话)
2. Top 3 成就
3. 关键指标趋势 (表格)
4. 需要关注的风险
5. 下周重点"

月报 Prompt:
"请生成月度经营分析报告:
数据: [粘贴本月数据]
上月数据: [粘贴上月数据]
年度目标: [粘贴目标]

输出:
1. 执行摘要
2. 收入分析 (vs 目标达成率)
3. 增长引擎分析
4. 成本结构变化
5. 趋势预测
6. 建议和行动计划"

💡 把这些 Prompt 保存为模板,
   每次只需要换数据就行!`}
          </div>
        </div>
      </div>
    </section>
  );
}
