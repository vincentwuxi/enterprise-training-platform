import { useState, useMemo } from 'react';
import './LessonCommon.css';

// Synthetic retention cohort data
const COHORT = [
  { week: 'W1', d1:100, d7:62, d14:45, d30:32, d60:22, d90:18 },
  { week: 'W2', d1:100, d7:58, d14:41, d30:29, d60:20, d90:16 },
  { week: 'W3', d1:100, d7:65, d14:49, d30:35, d60:25, d90:19 },
  { week: 'W4', d1:100, d7:70, d14:53, d30:38, d60:27, d90:21 },
];

const STRATEGIES = [
  {
    name: '推送通知',
    icon: '🔔',
    best: '高意图用户，有明确行动点时',
    bad: '频率过高，无关内容 → 用户关闭通知',
    code: `// 留存推送策略（3-2-1原则）
// 3天无动作 → 生活化消息
// 2周无动作 → 个性化推荐  
// 1月无动作 → 挽留优惠

const sendRetentionPush = async (userId, daysSinceActive) => {
  if (daysSinceActive === 3) {
    await push(userId, { 
      title: "你上次进行到一半的内容还在等你",
      body: "继续你的学习之旅 →",
      link: "/continue"
    });
  } else if (daysSinceActive === 14) {
    const rec = await getPersonalRecommendation(userId);
    await push(userId, { title: rec.title, body: "专为你推荐" });
  }
};`,
  },
  {
    name: '生命周期邮件',
    icon: '📧',
    best: 'D3 / D7 / D30 触发节点，有价值内容',
    bad: '千篇一律的邮件，无个性化',
    code: `# 留存邮件触发规则（Customer.io 逻辑）
trigger: user.last_seen > 7_days AND user.activated == true
  send: "你错过了这些新功能..."
  include: personalized_content_recs

trigger: user.last_seen > 30_days
  send: "我们想念你 + 30天内容摘要"
  offer: premium_trial_7days

# 个性化变量
{{user.first_name}}, {{last_lesson_title}},
{{days_streak}}, {{progress_pct}}`,
  },
  {
    name: '习惯触发器',
    icon: '🔁',
    best: '嵌入用户的日常工作流',
    bad: '与用户场景脱节的强制提醒',
    code: `// Nir Eyal Hook Model
// 触发 → 行动 → 多变奖励 → 投入

// 1. 外部触发（推送/邮件）
// 2. 行动（最简步骤）
// 3. 多变奖励（信息/社交/物质）
// 4. 投入（数据/内容/社交资本）

// 例：Duolingo 打卡连击（Streak）
// 触发: 每日推送
// 行动: 5分钟课程
// 奖励: XP + 连击火焰 🔥
// 投入: 连击数 → 怕失去 → 更高留存`,
  },
];

function HeatmapCell({ value }) {
  const opacity = value / 100;
  const bg = `rgba(16, 185, 129, ${opacity})`;
  const textColor = opacity > 0.5 ? '#000' : 'var(--gh-text)';
  return (
    <td style={{
      background: bg, color: textColor, textAlign: 'center',
      padding: '0.55rem 0.75rem', fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.82rem', fontWeight: 600, border: '1px solid rgba(16,185,129,0.1)',
      transition: 'transform 0.1s',
    }}>{value}%</td>
  );
}

export default function LessonRetention() {
  const [stratIdx, setStratIdx] = useState(0);
  const [churnRate, setChurnRate] = useState(5);
  const [ltv, setLtv] = useState(200);

  const months = Math.floor(100 / churnRate);
  const clv = useMemo(() => Math.round(ltv * (100 / churnRate / 12)), [ltv, churnRate]);

  return (
    <div className="gh-lesson">
      <div className="gh-container">

        <div className="gh-hero">
          <div className="gh-badge">模块四 · Retention</div>
          <h1>留存策略 — 让用户长期回来</h1>
          <p>流失 1 个用户的成本 = 获取 5 个新用户的成本。Cohort 留存分析、推送策略与生命周期运营，构建让用户停不下来的产品粘性。</p>
        </div>

        {/* Cohort Heatmap */}
        <div className="gh-section">
          <h2>🔥 留存 Cohort 热力图</h2>
          <p style={{ color: 'var(--gh-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            颜色越深 = 留存率越高。每行是一个注册周期的用户群，每列是注册后的天数。
          </p>
          <div className="gh-table-wrap">
            <table className="gh-table" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>队列</th>
                  <th style={{ textAlign: 'center' }}>Day 1</th>
                  <th style={{ textAlign: 'center' }}>Day 7</th>
                  <th style={{ textAlign: 'center' }}>Day 14</th>
                  <th style={{ textAlign: 'center' }}>Day 30</th>
                  <th style={{ textAlign: 'center' }}>Day 60</th>
                  <th style={{ textAlign: 'center' }}>Day 90</th>
                </tr>
              </thead>
              <tbody>
                {COHORT.map(row => (
                  <tr key={row.week}>
                    <td style={{ fontWeight: 600, color: 'var(--gh-primary)' }}>{row.week}</td>
                    <HeatmapCell value={row.d1} />
                    <HeatmapCell value={row.d7} />
                    <HeatmapCell value={row.d14} />
                    <HeatmapCell value={row.d30} />
                    <HeatmapCell value={row.d60} />
                    <HeatmapCell value={row.d90} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gh-tip" style={{ marginTop: '1rem' }}>
            📈 <span>W4 留存明显改善（D7: 70% vs W1: 62%）——说明这期间上线的某个功能提升了粘性，需要具体分析是什么改变了用户行为。</span>
          </div>
          <div className="gh-code" style={{ marginTop: '1rem' }}>{`-- 留存 Cohort SQL（BigQuery / Redshift）
SELECT
  DATE_TRUNC(u.created_at, WEEK) AS cohort_week,
  ROUND(
    COUNT(DISTINCT CASE WHEN DATE_DIFF(e.created_at, u.created_at, DAY) BETWEEN 0 AND 1
      THEN e.user_id END) * 100.0 / COUNT(DISTINCT u.user_id), 1
  ) AS day_1_retention,
  ROUND(
    COUNT(DISTINCT CASE WHEN DATE_DIFF(e.created_at, u.created_at, DAY) BETWEEN 6 AND 8
      THEN e.user_id END) * 100.0 / COUNT(DISTINCT u.user_id), 1
  ) AS day_7_retention,
  ROUND(
    COUNT(DISTINCT CASE WHEN DATE_DIFF(e.created_at, u.created_at, DAY) BETWEEN 29 AND 31
      THEN e.user_id END) * 100.0 / COUNT(DISTINCT u.user_id), 1
  ) AS day_30_retention
FROM users u
LEFT JOIN events e ON e.user_id = u.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY 1
ORDER BY 1 DESC;`}</div>
        </div>

        {/* Churn & CLV Calculator */}
        <div className="gh-section">
          <h2>💸 流失率 × CLV 计算器</h2>
          <div className="gh-formula">CLV = 月均收入 × 平均生命周期（月）</div>
          <div className="gh-slider-wrap">
            <label>月流失率</label>
            <input type="range" className="gh-slider" min={1} max={20} step={0.5}
              value={churnRate} onChange={e => setChurnRate(+e.target.value)} />
            <span className="gh-slider-val">{churnRate}%</span>
          </div>
          <div className="gh-slider-wrap">
            <label>月均 ARPU</label>
            <input type="range" className="gh-slider" min={50} max={2000} step={50}
              value={ltv} onChange={e => setLtv(+e.target.value)} />
            <span className="gh-slider-val">¥{ltv}</span>
          </div>
          <div className="gh-grid-2">
            <div className="gh-result">
              <div className="gh-result-title">平均生命周期</div>
              <div className="gh-result-value">{months} 个月</div>
              <div className="gh-result-sub">1 ÷ 月流失率 {churnRate}%</div>
            </div>
            <div className="gh-result">
              <div className="gh-result-title">用户 CLV（客户终身价值）</div>
              <div className="gh-result-value" style={{ color: clv > 5000 ? 'var(--gh-primary)' : clv > 1000 ? 'var(--gh-accent)' : 'var(--gh-red)' }}>
                ¥{clv.toLocaleString()}
              </div>
              <div className="gh-result-sub">月流失率每降低 1%，CLV 提升约 {Math.round(ltv / (churnRate / 100) / (churnRate - 1) * 100 / clv)}%</div>
            </div>
          </div>
        </div>

        {/* Retention Strategies */}
        <div className="gh-section">
          <h2>🛠️ 留存策略工具箱</h2>
          <div className="gh-tabs">
            {STRATEGIES.map((s, i) => (
              <button key={i} className={`gh-tab${stratIdx === i ? ' active' : ''}`} onClick={() => setStratIdx(i)}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>
          <div className="gh-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="gh-card">
              <div className="gh-card-title" style={{ color: 'var(--gh-primary)' }}>✅ 最佳使用场景</div>
              <div className="gh-card-body">{STRATEGIES[stratIdx].best}</div>
            </div>
            <div className="gh-card">
              <div className="gh-card-title" style={{ color: 'var(--gh-red)' }}>❌ 常见误区</div>
              <div className="gh-card-body">{STRATEGIES[stratIdx].bad}</div>
            </div>
          </div>
          <div className="gh-code">{STRATEGIES[stratIdx].code}</div>
        </div>

        {/* Retention benchmarks */}
        <div className="gh-section">
          <h2>📊 行业留存率基准</h2>
          <div className="gh-table-wrap">
            <table className="gh-table">
              <thead><tr><th>产品类型</th><th>D1 留存</th><th>D7 留存</th><th>D30 留存</th><th>评级</th></tr></thead>
              <tbody>
                {[
                  ['社交 App',    '>60%', '>30%', '>15%', '✅ 优秀'],
                  ['内容/媒体',   '>50%', '>20%', '>10%', '✅ 优秀'],
                  ['工具类 SaaS', '>40%', '>20%', '>15%', '✅ 优秀'],
                  ['电商 App',    '>30%', '>15%', '>8%',  '✅ 优秀'],
                  ['游戏',        '>40%', '>20%', '>8%',  '✅ 优秀'],
                ].map(([type, d1, d7, d30, grade], i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{type}</td>
                    <td style={{ color: 'var(--gh-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{d1}</td>
                    <td style={{ color: 'var(--gh-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{d7}</td>
                    <td style={{ color: 'var(--gh-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{d30}</td>
                    <td><span className="gh-tag">{grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gh-key">🎯 <span>留存率低于行业均值 50% 时，<strong>优先修留存而非拉获客</strong>——漏桶不堵，注水无益。</span></div>
        </div>

      </div>
    </div>
  );
}
