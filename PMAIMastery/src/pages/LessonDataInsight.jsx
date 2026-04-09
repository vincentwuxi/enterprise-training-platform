import { useState } from 'react';
import './LessonCommon.css';

const DATA_TABS = [
  {
    key: 'funnel', label: '漏斗分析',
    prompt: `你是数据分析专家，帮我分析以下用户转化漏斗数据，找出瓶颈并给出改进建议：

**产品**：[产品名/功能]
**漏斗数据**：
- 访问首页：[N人]
- 注册页面：[N人]（转化率 X%）
- 完成注册：[N人]（转化率 X%）
- 完成 Onboarding：[N人]（转化率 X%）
- 第一次核心行为：[N人]（转化率 X%）

请输出：
1. 找出最大漏斗瓶颈（跌幅最大的环节）
2. 可能的原因假设（按优先级排序）
3. 用 A/B 测试验证的具体方案（3条）
4. 快速改进措施（不需要 A/B 测试就能做的）`,
    example: `📍 最大瓶颈：注册→完成注册 转化率仅 31%，远低于行业均值 55%

🔍 原因假设（按可能性排序）：
1. 注册字段过多（高概率）：行业最佳实践是注册只需邮箱+密码
2. 手机验证码发送慢（中概率）：超过30秒用户会放弃
3. 缺少社交登录（中概率）：Google/微信一键登录转化率高30-40%

✅ A/B 测试方案：
A: 将注册字段从8个减少到3个（邮箱+密码+昵称）
B: 增加 Google 一键登录
C: 优化验证码发送速度并增加进度反馈`,
  },
  {
    key: 'retention', label: '留存分析',
    prompt: `帮我解读以下用户留存数据，识别留存问题并提出改进方向：

**留存数据（注册后N天留存率）**：
- D1 留存：X%
- D7 留存：X%
- D30 留存：X%
- D90 留存：X%

**对比数据**（如有）：
- 行业均值 / 竞品数据
- 不同用户分组（如按注册渠道/功能使用情况）

请输出：
1. 留存曲线形态判断（健康/断崖型/缓降型）
2. 危险信号识别
3. 提升留存的5个核心策略
4. 需要追加的细分数据分析`,
    example: `📈 留存形态：断崖型 — D1→D7 跌幅达 68%，典型的 Onboarding 失效症状

⚠️ 危险信号：
D1 留存 45% 说明初体验及格
D7 仅 14% 说明用户"没上瘾"就流失了
关键问题：用户在 D1 内是否体验到了 Aha Moment？

💡 留存提升5大策略：
1. 找到 Aha Moment：分析 D30 留存用户 vs 流失用户的行为差异
2. 优化 Onboarding：D1 内引导用户完成 3 个关键行为
3. Push 通知策略：D2、D4、D7 精准触达
4. 习惯培养：每天邮件/通知，提供新内容
5. 按分群运营：高意向用户 vs 低意向用户差异对待`,
  },
  {
    key: 'ab', label: 'A/B 测试解读',
    prompt: `帮我解读以下 A/B 测试结果，判断是否值得全量发布：

**测试基本信息**：
- 测试名称：[功能/变体名]
- 测试时长：[N天]
- 样本量：对照组 N 人，实验组 N 人
- 流量分配：对照 50% / 实验 50%

**核心指标结果**：
- 主指标（如转化率）：对照 X%，实验 Y%，提升 Z%
- 显著性水平：p = [如 0.03]
- 置信区间：[如 +2.1% ~ +8.3%]

**次要指标**：
- 指标A：[变化情况]
- 指标B：[变化情况]

请判断：是否全量发布？原因？`,
    example: `✅ 建议全量发布

**核心判断依据**：
- 主指标提升 5.2%，p=0.03（< 0.05 显著）
- 95% 置信区间 [+2.1%, +8.3%] 全为正值，说明提升真实
- 次要指标无负面影响

⚠️ 注意事项：
- 测试时长 7 天，建议至少覆盖 2 个完整周期（含周末效应）
- 当前样本量 1200 人/组，建议追加测试至统计功效 80%



📋 全量发布清单：
□ 回滚方案准备好
□ 监控关键指标 48 小时
□ 准备好用户反馈收集通道`,
  },
];

export default function LessonDataInsight() {
  const [tab, setTab] = useState('funnel');
  const [showExample, setShowExample] = useState(false);
  const p = DATA_TABS.find(d => d.key === tab);

  return (
    <div className="pm-lesson">
      <div className="pm-container">

        <div className="pm-hero">
          <div className="pm-badge">模块五 · AI Data Insight</div>
          <h1>AI 数据洞察 — 让数字开口说话</h1>
          <p>不懂 SQL 也能做数据分析。用 AI 解读漏斗、留存、A/B 测试——5 分钟看懂一份数据报告，找到产品改进的下一步。</p>
        </div>

        <div className="pm-metrics">
          {[{ v: '5min', l: '漏斗诊断' }, { v: 'A/B', l: 'AI 解读显著性' }, { v: '留存', l: '自动找瓶颈' }, { v: '洞察', l: '驱动决策' }].map(m => (
            <div key={m.l} className="pm-metric-card"><div className="pm-metric-value">{m.v}</div><div className="pm-metric-label">{m.l}</div></div>
          ))}
        </div>

        <div className="pm-section">
          <h2>📊 数据分析 Prompt 模板库</h2>
          <div className="pm-tabs">
            {DATA_TABS.map(d => <button key={d.key} className={`pm-tab${tab === d.key ? ' active' : ''}`} onClick={() => { setTab(d.key); setShowExample(false); }}>{d.label}</button>)}
          </div>
          <div className="pm-prompt">{p?.prompt}</div>
          <button className="pm-tab" onClick={() => setShowExample(!showExample)}>
            {showExample ? '▲ 收起示例' : '▼ 查看 AI 输出示例'}
          </button>
          {showExample && <div className="pm-code" style={{ marginTop: '0.75rem' }}>{p?.example}</div>}
        </div>

        <div className="pm-section">
          <h2>📈 PM 必懂的5个数据概念</h2>
          <div className="pm-grid-2">
            {[
              { t: 'DAU / MAU & 粘性', d: 'DAU/MAU = 用户粘性，健康产品通常 > 20%。低于10%说明用户没有高频习惯' },
              { t: 'Aha Moment', d: '用户"顿悟产品价值"的关键行为。找到它：比较留存用户和流失用户的行为差异' },
              { t: 'NPS（净推荐值）', d: '推荐者% - 贬低者% = NPS。>50分优秀，0-50分良好，<0分危险，需要立即行动' },
              { t: 'Cohort 留存矩阵', d: '按注册时间分组追踪留存。横轴=时间，纵轴=注册周期，颜色越深=留存越好' },
              { t: 'LTV（生命周期价值）', d: 'LTV = ARPU × 平均生命周期。LTV > 3×CAC 是健康的商业模式门槛' },
              { t: 'p值与显著性', d: 'p < 0.05 才可宣称"有效"。A/B 测试 p > 0.05 = 结论不可靠，不能全量' },
            ].map((c, i) => (
              <div key={i} className="pm-card">
                <div className="pm-card-title" style={{ color: 'var(--pm-primary)' }}>{c.t}</div>
                <div className="pm-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pm-section">
          <h2>🤝 与数据分析师高效协作</h2>
          <div className="pm-code">{`# 好的数据需求怎么写（给分析师的需求单）

❌ 坏的需求：
"帮我看看搜索数据怎么样"（模糊、无法执行）

✅ 好的需求：
背景：我们上周上线了搜索相关词功能
假设：该功能应该提升用户找到内容的比率
需要的数据：
  - 上线前后（各取7天）搜索成功率对比
    定义：搜索后点击了至少一个结果 = 成功
  - 按用户活跃度分层（高/中/低活跃）
  - 对照组 vs 实验组（如果有 A/B 分组）
时间要求：明天 EOD 前
输出格式：Excel + 简单图表

# 为什么这样做？
好的数据需求 = 背景 + 假设 + 精确定义 + 分层维度 + 时间
这样分析师可以一次出结果，而不是来回沟通3次`}</div>
        </div>

      </div>
    </div>
  );
}
