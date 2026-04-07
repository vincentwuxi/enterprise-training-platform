import React from 'react';
import './LessonCommon.css';

const OUTLINE = [
  { step: '第一周', tasks: ['数据清洗：处理10万行原始交易数据（缺失值/格式/异常值）', '探索性分析：用户画像、地域分布、品类偏好'], deliverable: '清洁数据集 + EDA 报告' },
  { step: '第二周', tasks: ['SQL 分析：用窗口函数计算 RFM 用户价值分层', '留存 Cohort：按注册来源计算 D1/D7/D30 留存'], deliverable: 'RFM 用户分层 + 留存分析报告' },
  { step: '第三周', tasks: ['A/B 测试分析：分析已有实验数据，判断新推荐算法是否显著提升 CTR', '漏斗分析：找到转化率最低的步骤'], deliverable: 'A/B 测试报告 + 漏斗优化建议' },
  { step: '第四周', tasks: ['流失预测：训练 GBM 模型识别高流失风险用户', 'Dashboard：用 Metabase 搭建运营日报看板'], deliverable: '流失预测模型 + 可交互 Dashboard' },
];

const CODE_SNIPPETS = [
  {
    title: 'Step 1：RFM 用户分层',
    code: `import pandas as pd
from datetime import datetime

# 计算每个用户的 R/F/M 值
snapshot_date = datetime(2024, 12, 31)

rfm = orders.groupby('user_id').agg(
    R=('order_date', lambda x: (snapshot_date - x.max()).days),  # 最近购买距今天数
    F=('order_id', 'count'),          # 购买频次
    M=('amount', 'sum'),              # 累计消费金额
).reset_index()

# 分位数打分（5分最佳，1分最差）
rfm['R_score'] = pd.qcut(rfm.R, 5, labels=[5,4,3,2,1]).astype(int)
rfm['F_score'] = pd.qcut(rfm.F.rank(method='first'), 5, labels=[1,2,3,4,5]).astype(int)
rfm['M_score'] = pd.qcut(rfm.M, 5, labels=[1,2,3,4,5]).astype(int)

rfm['RFM_segment'] = rfm['R_score'].astype(str) + rfm['F_score'].astype(str) + rfm['M_score'].astype(str)

# 业务分层
def segment(row):
    if row.R_score >= 4 and row.F_score >= 4: return '💎 忠实高价值'
    if row.R_score >= 4 and row.M_score >= 4: return '🌟 高潜力新客'
    if row.R_score <= 2 and row.F_score >= 3: return '⚠️ 流失风险老客'
    if row.R_score <= 2 and row.F_score <= 2: return '❌ 已流失'
    return '📦 普通用户'

rfm['label'] = rfm.apply(segment, axis=1)
print(rfm.label.value_counts())`,
    output: `📦 普通用户         45,821  (45.8%)
❌ 已流失           22,341  (22.3%)
⚠️ 流失风险老客    18,234  (18.2%)
🌟 高潜力新客       9,820   (9.8%)
💎 忠实高价值       3,784   (3.8%)

💡 洞察：3.8% 的忠实用户贡献了 42% 的营收
   优先保护和激活这批用户的价值最高`
  },
  {
    title: 'Step 2：最终分析报告结构',
    code: `# ── 电商用户增长分析报告（模板）───────────────
"""
执行摘要（给管理层）
├── 核心结论：3 条最重要发现
├── 关键指标：本季度 MAU / 营收 / 净留存
└── 行动建议：按优先级排列的 3 个建议

1. 用户概况
   ├── 用户规模：新增 / 活跃 / 流失
   ├── 地域分布：Top 城市贡献集中度
   └── 用户生命周期分布

2. 留存分析
   ├── Cohort 留存热力图
   ├── 关键洞察：哪批用户留存最高？什么原因？
   └── 建议：复制高留存队列的获客渠道

3. 转化漏斗
   ├── 漏斗各步转化率
   ├── 流失瓶颈：加购→下单转化率仅 35%
   └── 假设：结算页复杂度高，推荐简化方案

4. A/B 测试结论
   ├── 实验：新推荐算法 vs 旧算法
   ├── 结果：CTR 提升 12.3%（p < 0.01，统计显著）
   └── 估算影响：年增收 ≈ ¥2,840,000

5. 附录：数据说明 & SQL/代码
"""

# 用 Plotly 生成交互式全页报告
import plotly.graph_objects as go
from plotly.subplots import make_subplots

fig = make_subplots(rows=2, cols=2, subplot_titles=[
    'MAU 趋势', '用户分层饼图', '漏斗转化', '留存热力图'
])
# ... 添加各子图
fig.update_layout(title_text='2024 Q4 用户增长分析报告', height=900)
fig.write_html('growth_report_2024Q4.html')  # 可分享的交互式 HTML`,
    output: `✅ 报告已生成：growth_report_2024Q4.html
   文件大小：2.3 MB（含所有交互图表）
   可直接用浏览器打开，无需任何依赖

关键结论摘要：
1. 3月留存提升 8pp → 归因于新手引导优化
2. 结算页流失率 48% → 建议简化填写流程（预计提升营收 15%）
3. 高价值用户 (3.8%) 贡献营收 42% → 设计 VIP 专属权益体系`
  }
];

export default function LessonCaseStudy() {
  return (
    <div className="da-lesson">
      <div className="da-hero">
        <div className="da-hero-badge">🎯 模块八</div>
        <h1>实战项目 — 电商用户增长分析报告</h1>
        <p>综合运用前七个模块的所有技能，完成一份完整的电商平台季度用户增长分析报告，从原始数据到可视化报告，模拟真实工作场景。</p>
      </div>

      <div className="da-goals">
        {[
          { icon: '📦', title: '真实数据集', desc: '10万行订单数据 + 用户行为日志' },
          { icon: '🧹', title: '端到端流程', desc: '从数据清洗到最终报告全流程' },
          { icon: '📊', title: 'RFM 分层', desc: '用窗口函数实现用户价值分层' },
          { icon: '📋', title: '汇报报告', desc: '生成可分享的交互式 HTML 报告' },
        ].map(g => <div className="da-goal" key={g.title}><div className="da-goal-icon">{g.icon}</div><div><h3>{g.title}</h3><p>{g.desc}</p></div></div>)}
      </div>

      {/* 项目时间轴 */}
      <div className="da-section-title">📅 四周项目计划</div>
      <ol className="da-steps">
        {OUTLINE.map(o => (
          <li key={o.step}>
            <div className="da-step-num" style={{ fontSize: '.65rem', width: 36, height: 36, minWidth: 36 }}>{o.step}</div>
            <div className="da-step-body" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.4rem' }}>
                <h4 style={{ margin: 0 }}>任务</h4>
                <span className="da-badge green">{o.deliverable}</span>
              </div>
              <ul style={{ margin: '.3rem 0 0', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                {o.tasks.map((t, i) => <li key={i} style={{ color: 'var(--da-muted)', fontSize: '.8rem', lineHeight: 1.6 }}>{t}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      {/* 核心代码 */}
      {CODE_SNIPPETS.map(s => (
        <div key={s.title}>
          <div className="da-section-title">{s.title}</div>
          <div className="da-code">
            <div className="da-code-header"><span className="da-code-lang">Python</span></div>
            <pre>{s.code}</pre>
          </div>
          <div className="da-output">
            <span className="out-label">▶ 输出</span>
            {s.output}
          </div>
        </div>
      ))}

      {/* 技能清单 */}
      <div className="da-section-title">✅ 完成本课程后你能做什么</div>
      <div className="da-cards">
        {[
          { icon: '📊', h: '独立完成数据分析', d: '从数据清洗到可视化报告，端到端不求人' },
          { icon: '🧪', h: '设计并分析 A/B 测试', d: '严格计算样本量，正确解读显著性，输出决策建议' },
          { icon: '👤', h: '构建用户分析体系', d: 'RFM 分层、留存 Cohort、漏斗分析全套落地' },
          { icon: '📈', h: '搭建业务仪表盘', d: 'Metabase/Grafana 快速上线，让团队都能看数据' },
          { icon: '🤖', h: '用 ML 增强分析', d: '流失预测、异常检测、趋势预测，让分析有预见性' },
          { icon: '💬', h: '用数据讲故事', d: '清晰的报告结构 + 交互可视化，说服管理层' },
        ].map(c => <div className="da-card" key={c.h}><div className="da-card-icon">{c.icon}</div><h3>{c.h}</h3><p>{c.d}</p></div>)}
      </div>
    </div>
  );
}
