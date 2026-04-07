import React, { useState } from 'react';
import './LessonCommon.css';

// 交互式留存热力图
function RetentionHeatmap() {
  const cohorts = ['1月', '2月', '3月', '4月', '5月'];
  const data = [
    [100, 62, 44, 38, 34, 31, 29, 27],
    [100, 58, 41, 35, 31, 28, 26],
    [100, 65, 47, 40, 36, 33],
    [100, 61, 43, 37, 34],
    [100, 67, 49, 42],
  ];
  const [hovered, setHovered] = useState(null);

  const getColor = v => {
    if (v === 100) return { bg: '#06b6d4', text: '#fff' };
    if (v >= 60) return { bg: 'rgba(6,182,212,0.5)', text: '#e2e8f0' };
    if (v >= 40) return { bg: 'rgba(6,182,212,0.3)', text: '#94a3b8' };
    if (v >= 25) return { bg: 'rgba(6,182,212,0.15)', text: '#64748b' };
    return { bg: 'rgba(6,182,212,0.05)', text: '#475569' };
  };

  return (
    <div className="da-sim">
      <div className="da-sim-title">📅 留存率热力图（按注册月 Cohort）</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '.82rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '.4rem .6rem', color: 'var(--da-muted)', textAlign: 'left', whiteSpace: 'nowrap' }}>注册月</th>
              {['D0', 'D7', 'D14', 'D30', 'D60', 'D90', 'D120', 'D150'].map(d => (
                <th key={d} style={{ padding: '.4rem .6rem', color: 'var(--da-muted)', textAlign: 'center' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c, ci) => (
              <tr key={c}>
                <td style={{ padding: '.4rem .6rem', color: 'var(--da-text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{c}</td>
                {data[ci].map((v, di) => {
                  const { bg, text } = getColor(v);
                  const isHov = hovered && hovered[0] === ci && hovered[1] === di;
                  return (
                    <td key={di}
                      onMouseEnter={() => setHovered([ci, di])}
                      onMouseLeave={() => setHovered(null)}
                      style={{ padding: '.35rem .5rem', background: isHov ? '#06b6d4' : bg, color: isHov ? '#fff' : text, textAlign: 'center', borderRadius: '.3rem', cursor: 'default', fontWeight: v === 100 ? 800 : 400, transition: 'background .15s' }}>
                      {v}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="da-tip" style={{ marginTop: '1rem' }}>
        <strong>💡 阅读方式</strong>
        <p>横读一行 = 某一批用户随时间的留存变化。竖读一列 = 不同月份用户在同一时间点的留存对比（可判断功能迭代效果）。3月、5月留存明显提升，对应产品改版。</p>
      </div>
    </div>
  );
}

export default function LessonUserBehavior() {
  const [activeMetric, setActiveMetric] = useState('retention');

  const metrics = {
    retention: {
      label: '留存分析',
      content: `# 留存分析：用户黏性的核心度量

# ── 次日留存计算（Python）─────────────────────
import pandas as pd

events = pd.read_parquet('events.parquet')

def calc_retention(df, day_offset):
    """计算第 N 日留存率"""
    reg_day = df.groupby('user_id')['event_date'].min().rename('reg_date')
    df = df.join(reg_day, on='user_id')
    
    df['days_since_reg'] = (df['event_date'] - df['reg_date']).dt.days
    
    target = df[df['days_since_reg'] == day_offset]['user_id'].unique()
    base   = df[df['days_since_reg'] == 0]['user_id'].unique()
    
    return len(set(target) & set(base)) / len(base)

print(f"D1  留存: {calc_retention(events, 1):.1%}")
print(f"D7  留存: {calc_retention(events, 7):.1%}")
print(f"D30 留存: {calc_retention(events, 30):.1%}")`,
      output: `D1  留存: 62.3%
D7  留存: 38.1%
D30 留存: 24.7%

行业基准（移动App）:
D1 > 40% ✅  D7 > 20% ✅  D30 > 10% ✅`,
    },
    funnel: {
      label: '漏斗分析',
      content: `# 严格顺序漏斗分析（Python + Pandas）──────────
import pandas as pd

events = pd.read_csv('events.csv')  # user_id, event_type, event_time

FUNNEL = ['page_view', 'add_cart', 'checkout', 'payment']

def strict_funnel(df, steps):
    """严格顺序漏斗：必须按步骤顺序完成"""
    result = {}
    users = set(df[df.event_type == steps[0]].user_id)
    result[steps[0]] = len(users)
    
    for i in range(1, len(steps)):
        prev_step, curr_step = steps[i-1], steps[i]
        # 当前用户中：必须在上一步之后做了这一步
        prev_times = df[df.event_type == prev_step].groupby('user_id')['event_time'].min()
        curr_events = df[df.event_type == curr_step].merge(
            prev_times.rename('prev_time'), on='user_id')
        passed = curr_events[curr_events.event_time > curr_events.prev_time].user_id.unique()
        users = users & set(passed)
        result[curr_step] = len(users)
    
    return pd.DataFrame({'step': list(result.keys()),
                         'users': list(result.values())})

funnel_df = strict_funnel(events, FUNNEL)
funnel_df['conv_rate'] = funnel_df.users / funnel_df.users.iloc[0]
funnel_df['step_rate'] = funnel_df.users / funnel_df.users.shift(1)`,
      output: `         step   users  conv_rate  step_rate
0   page_view   52841      100%       —
1    add_cart   18974       35.9%    35.9%  ←瓶颈
2    checkout    9821       18.6%    51.8%
3     payment    8234       15.6%    83.8%

优化优先级：加购转化率改善1pp → 年增收约240万`,
    },
    path: {
      label: '路径分析',
      content: `# 用户行为路径分析（Sankey + Markov Chain）───
import pandas as pd
from collections import Counter

# ── 计算页面转移矩阵 ─────────────────────────────
events = events.sort_values(['user_id', 'event_time'])
events['next_page'] = events.groupby('user_id')['page'].shift(-1)

# 转移矩阵
transitions = events.dropna(subset=['next_page'])
matrix = transitions.groupby(['page', 'next_page']).size().unstack(fill_value=0)

# 转移概率
prob_matrix = matrix.div(matrix.sum(axis=1), axis=0).round(3)

# ── Top 流失路径 ──────────────────────────────────
exits = events[events['next_page'].isna()].groupby('page').size()
exit_rate = exits / matrix.sum(axis=1)
print("流失率最高的页面:")
print(exit_rate.sort_values(ascending=False).head(5))

# ── 最常见的 3 步路径 ─────────────────────────────
def get_paths(df, n=3):
    paths = []
    for uid, grp in df.groupby('user_id'):
        pages = grp['page'].tolist()
        for i in range(len(pages) - n + 1):
            paths.append(' → '.join(pages[i:i+n]))
    return Counter(paths).most_common(10)

print(get_paths(events))`,
      output: `流失率最高的页面:
checkout_page    0.482  ← 结算页流失最严重
search_result    0.381
product_detail   0.291

Top 3步路径:
首页→商品列表→商品详情    18234次
首页→搜索→商品详情        12891次
商品详情→购物车→结算       9821次  ← 核心转化路径`,
    },
  };

  const m = metrics[activeMetric];

  return (
    <div className="da-lesson">
      <div className="da-hero">
        <div className="da-hero-badge">👤 模块五</div>
        <h1>用户行为分析 — 漏斗 / 留存 / 路径</h1>
        <p>理解用户在产品中的行为模式。掌握留存 Cohort、转化漏斗、行为路径三大分析体系，找到增长杠杆点。</p>
      </div>

      <div className="da-goals">
        {[
          { icon: '📅', title: '留存分析', desc: 'D1/D7/D30 留存率，Cohort 热力图' },
          { icon: '🔽', title: '漏斗分析', desc: '严格顺序漏斗，定位最大流失步骤' },
          { icon: '🗺️', title: '路径分析', desc: 'Sankey 图，用户旅程与退出页分析' },
          { icon: '📐', title: '指标体系', desc: 'DAU/MAU/Stickiness/LTV/CAC 全掌握' },
        ].map(g => <div className="da-goal" key={g.title}><div className="da-goal-icon">{g.icon}</div><div><h3>{g.title}</h3><p>{g.desc}</p></div></div>)}
      </div>

      <RetentionHeatmap />

      <div className="da-section-title">💻 代码实战</div>
      <div className="da-tab-bar">
        {Object.entries(metrics).map(([k, v]) => (
          <button key={k} className={`da-tab${activeMetric === k ? ' active' : ''}`} onClick={() => setActiveMetric(k)}>{v.label}</button>
        ))}
      </div>
      <div className="da-code">
        <div className="da-code-header"><span className="da-code-lang">Python / Pandas</span></div>
        <pre>{m.content}</pre>
      </div>
      <div className="da-output">
        <span className="out-label">▶ 输出结果</span>
        {m.output}
      </div>

      <div className="da-section-title">📊 核心用户指标速查</div>
      <div className="da-table-wrap">
        <table className="da-table">
          <thead><tr><th>指标</th><th>公式</th><th>健康值参考</th><th>用途</th></tr></thead>
          <tbody>
            {[
              ['DAU/MAU (粘性)', 'DAU ÷ MAU', '社交 > 20%, 工具 > 10%', '核心活跃度，越高越好'],
              ['D1 留存率', '次日活跃 ÷ 新增', '> 35% 优秀', '新手引导质量'],
              ['LTV', 'ARPU × 平均生命周期', '>3x CAC 盈利', '用户终身价值'],
              ['CAC', '获客总成本 ÷ 新用户数', '越低越好', '渠道效率评估'],
              ['Churn Rate', '流失用户 ÷ 期初用户', '月流失 < 5% 健康', '流失预警'],
              ['NPS (净推荐值)', '推荐者% - 批评者%', '> 50 优秀', '用户满意度'],
            ].map(([m2, f, h, u]) => (
              <tr key={m2}>
                <td style={{ fontWeight: 700, color: 'var(--da-primary)' }}>{m2}</td>
                <td><code style={{ fontSize: '.78rem', color: '#a5d6ff' }}>{f}</code></td>
                <td><span className="da-badge green">{h}</span></td>
                <td style={{ color: 'var(--da-muted)' }}>{u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
