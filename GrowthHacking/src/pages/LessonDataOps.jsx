import { useState } from 'react';
import './LessonCommon.css';

const METRIC_TREE = [
  { level: 0, name: '北极星: 月活付费会员数', emoji: '⭐', color: '#10b981' },
  { level: 1, name: 'L1: 新增付费用户', emoji: '📈', color: '#34d399' },
  { level: 1, name: 'L1: 付费用户留存率', emoji: '🔄', color: '#34d399' },
  { level: 2, name: 'L2: 注册转化率', emoji: '📝', color: '#6ee7b7' },
  { level: 2, name: 'L2: 试用→付费转化率', emoji: '💳', color: '#6ee7b7' },
  { level: 2, name: 'L2: 30日留存', emoji: '📊', color: '#6ee7b7' },
  { level: 2, name: 'L2: 月均使用频次', emoji: '🔁', color: '#6ee7b7' },
];

const DASHBOARD_MODULES = [
  { name: '实时概览', desc: '今日 PV/UV、注册数、付费数、收入 — 一眼看全局', icon: '📊' },
  { name: '漏斗监控', desc: '核心转化漏斗的每日/周趋势，自动标红异常环节', icon: '🔍' },
  { name: '留存热力图', desc: 'Cohort 留存矩阵 — 哪一周的用户质量最高？', icon: '🗓️' },
  { name: '实验看板', desc: '当前运行中的 A/B 测试、样本进度、置信度实时更新', icon: '🧪' },
  { name: '渠道 ROI', desc: '各获客渠道的 CAC、LTV/CAC、回本周期', icon: '💰' },
  { name: '预警系统', desc: '关键指标超出 ±2σ 自动报警 — Slack/飞书/企微推送', icon: '🚨' },
];

const OKR_EXAMPLE = [
  { o: 'O1: 提升新用户激活率到 60%', krs: [
    'KR1: Onboarding 完成率从 35% 提升到 55%',
    'KR2: 新用户首日关键行为完成率 ≥ 40%',
    'KR3: 7日留存率从 25% 提升到 38%',
  ]},
  { o: 'O2: 建立数据驱动的实验文化', krs: [
    'KR1: 每周上线 ≥ 2 个 A/B 实验',
    'KR2: 实验文档率 100%（假设/指标/结论）',
    'KR3: 季度实验成功率 ≥ 30%',
  ]},
];

export default function LessonDataOps() {
  const [activeTab, setActiveTab] = useState('metrics');

  return (
    <div className="gh-lesson">
      <div className="gh-container">

        <div className="gh-hero">
          <div className="gh-badge">模块七 · Data-Driven Ops</div>
          <h1>数据驱动运营 — 指标体系与看板</h1>
          <p>不可度量的就不可优化。从北极星指标分解出指标树，搭建自动化看板，建立数据驱动的运营决策闭环。</p>
        </div>

        <div className="gh-metrics">
          {[
            { v: 'NSM', l: '北极星指标' },
            { v: 'OKR', l: '目标管理' },
            { v: '≤5', l: '核心看板数' },
            { v: '自动化', l: '报告流程' },
          ].map(m => (
            <div key={m.l} className="gh-metric-card">
              <div className="gh-metric-value">{m.v}</div>
              <div className="gh-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="gh-section">
          <h2>🧭 核心内容</h2>
          <div className="gh-tabs">
            {[['metrics','指标体系'],['dashboard','看板设计'],['okr','OKR落地'],['automation','自动化报告']].map(([k,l]) => (
              <button key={k} className={`gh-tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'metrics' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                指标体系 = 将北极星指标<strong>逐层分解</strong>为可执行的二级/三级指标。每个团队负责 2-3 个指标，全公司对齐。
              </p>
              <div className="gh-card" style={{padding:'1.25rem'}}>
                {METRIC_TREE.map((m, i) => (
                  <div key={i} style={{
                    paddingLeft: m.level * 28 + 'px',
                    padding: '0.5rem 0 0.5rem ' + (m.level * 28) + 'px',
                    borderLeft: m.level > 0 ? '2px solid var(--gh-border)' : 'none',
                    marginLeft: m.level > 0 ? 14 : 0,
                  }}>
                    <span style={{fontSize:'1rem'}}>{m.emoji}</span>{' '}
                    <span style={{fontWeight: m.level === 0 ? 700 : 500, color: m.level === 0 ? 'var(--gh-primary)' : undefined, fontSize: m.level === 0 ? '1rem' : '0.88rem'}}>
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="gh-code">{`# 指标分解框架
北极星指标 (NSM)
├── L1 输入指标（可直接影响 NSM 的 2-3 个核心杠杆）
│   ├── L2 过程指标（衡量 L1 进展的可执行指标）
│   │   ├── L3 操作指标（一线员工/系统每天看的数字）
│   │   └── ...
│   └── ...
└── ...

# 好指标的 SMART 原则
# S (Specific):  "注册转化率" ✅  vs "增长" ❌
# M (Measurable): 可埋点可计算
# A (Actionable):  团队能影响它
# R (Relevant):    跟 NSM 有因果关系
# T (Time-bound):  有时间窗口（日/周/月）`}</div>
              <div className="gh-warn">⚠️ <span>避免<strong>虚荣指标</strong>：PV、注册总数、下载量看起来好看但不可执行。关注留存率、NPS、LTV 等质量指标。</span></div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                一个好的增长看板应该在 30 秒内回答：「我们现在好不好？哪里出了问题？」
              </p>
              <div className="gh-grid-3">
                {DASHBOARD_MODULES.map(d => (
                  <div key={d.name} className="gh-card">
                    <div className="gh-card-title">{d.icon} {d.name}</div>
                    <div className="gh-card-body">{d.desc}</div>
                  </div>
                ))}
              </div>
              <div className="gh-code">{`# Metabase / Superset 看板搭建示例 (SQL)

-- 1. 每日核心指标汇总
SELECT
  DATE(created_at) AS date,
  COUNT(DISTINCT user_id) AS dau,
  COUNT(DISTINCT CASE WHEN event='signup' THEN user_id END) AS signups,
  COUNT(DISTINCT CASE WHEN event='purchase' THEN user_id END) AS purchasers,
  SUM(CASE WHEN event='purchase' THEN amount ELSE 0 END) AS revenue
FROM events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1 ORDER BY 1;

-- 2. Cohort 留存矩阵
WITH cohorts AS (
  SELECT user_id, DATE_TRUNC('week', MIN(created_at)) AS cohort_week
  FROM events WHERE event = 'signup' GROUP BY 1
)
SELECT
  c.cohort_week,
  EXTRACT(WEEK FROM e.created_at) - EXTRACT(WEEK FROM c.cohort_week) AS week_n,
  COUNT(DISTINCT e.user_id) AS retained_users
FROM cohorts c
JOIN events e ON c.user_id = e.user_id
GROUP BY 1, 2 ORDER BY 1, 2;`}</div>
            </div>
          )}

          {activeTab === 'okr' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                OKR（目标与关键结果）是将指标体系落到团队行动的管理工具。每个季度设定 2-3 个 O，每个 O 下 3 个可量化的 KR。
              </p>
              <div className="gh-grid-1">
                {OKR_EXAMPLE.map(o => (
                  <div key={o.o} className="gh-card">
                    <div className="gh-card-title" style={{color:'var(--gh-primary)',fontSize:'1rem'}}>{o.o}</div>
                    <div style={{marginTop:'0.75rem'}}>
                      {o.krs.map(kr => (
                        <div key={kr} style={{fontSize:'0.88rem',padding:'0.35rem 0',display:'flex',alignItems:'baseline',gap:8}}>
                          <span style={{color:'var(--gh-primary)'}}>◉</span> {kr}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="gh-tip">💡 <span>OKR 的关键：KR 必须是<strong>结果</strong>而非<strong>任务</strong>。"发布 3 个版本"是任务，"激活率提升到 60%"是结果。</span></div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                手动写周报 = 低效浪费。自动化报告让团队把时间花在分析和行动上。
              </p>
              <div className="gh-code">{`# 自动化周报生成（Python + Slack/飞书）
import schedule
from datetime import datetime, timedelta

def generate_weekly_report():
    """每周一 9:00 自动推送增长周报"""
    end = datetime.now()
    start = end - timedelta(days=7)
    
    metrics = {
        'DAU 均值': query_avg_dau(start, end),
        '新增注册': query_signups(start, end),
        '注册转化率': f"{query_signup_rate(start, end):.1%}",
        '7日留存': f"{query_retention_7d(start, end):.1%}",
        '实验数': query_experiments_count(start, end),
        '收入': f"¥{query_revenue(start, end):,.0f}",
    }
    
    # 对比上周，标注 ↑↓ 和百分比变化
    last_week = get_last_week_metrics()
    report = format_comparison(metrics, last_week)
    
    # 自动推送
    send_to_slack(channel='#growth', message=report)
    send_to_feishu(chat_id='growth_team', content=report)

schedule.every().monday.at("09:00").do(generate_weekly_report)

# 异常预警（实时）
def alert_on_anomaly(metric_name, current_value, baseline, threshold=2):
    """指标偏离基线 2σ 时自动报警"""
    deviation = abs(current_value - baseline.mean) / baseline.std
    if deviation > threshold:
        direction = "📈 暴涨" if current_value > baseline.mean else "📉 暴跌"
        send_alert(f"🚨 {metric_name} {direction}！"
                   f"当前: {current_value}, 基线: {baseline.mean:.1f}±{baseline.std:.1f}")`}</div>
              <div className="gh-grid-3">
                {[
                  {t:'📅 日报', d:'关键指标 + 昨日变化 + 异常标注。自动发群，无需人工。'},
                  {t:'📊 周报', d:'趋势分析 + 实验回顾 + 下周计划。包含 Cohort 留存和漏斗。'},
                  {t:'📈 月报', d:'北极星进展 + OKR 完成度 + 战略级洞察。面向管理层。'},
                ].map(c => (
                  <div key={c.t} className="gh-card">
                    <div className="gh-card-title">{c.t}</div>
                    <div className="gh-card-body">{c.d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="gh-section">
          <h2>📚 本章小结</h2>
          <div className="gh-steps">
            {[
              {t:'搭建指标树', d:'从北极星逐层分解到可执行指标，确保每个团队有明确的量化目标。'},
              {t:'搭建增长看板', d:'用 Metabase/Superset 搭建 6 个核心模块，30 秒内回答"我们现在好不好"。'},
              {t:'建立自动化报告', d:'日报/周报/月报全自动化，异常预警实时推送，把人力释放给分析和行动。'},
            ].map(s => (
              <div key={s.t} className="gh-step">
                <div className="gh-step-content">
                  <div className="gh-step-title">{s.t}</div>
                  <div className="gh-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
