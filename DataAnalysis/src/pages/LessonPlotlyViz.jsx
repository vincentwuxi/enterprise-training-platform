import React, { useState } from 'react';
import './LessonCommon.css';

const CHART_DATA = {
  bar: { title: '柱状图 — 分类比较', emoji: '📊' },
  line: { title: '折线图 — 趋势分析', emoji: '📈' },
  scatter: { title: '散点图 — 相关性', emoji: '🔵' },
  funnel: { title: '漏斗图 — 转化分析', emoji: '🔽' },
};

const CODES = {
  bar: `import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

df = pd.DataFrame({
    'category': ['Electronics', 'Clothing', 'Food', 'Sports', 'Beauty'],
    'revenue': [2840000, 1560000, 980000, 720000, 450000],
    'growth': [12.3, -2.1, 8.7, 15.2, 6.4],
})

# ── 基础柱状图（1行代码）────────────────────────
fig = px.bar(df, x='category', y='revenue',
             color='growth',              # 颜色映射增长率
             color_continuous_scale='RdYlGn',   # 红→绿
             title='各品类营收 & 增长率',
             text='revenue',             # 柱顶显示数值
             template='plotly_dark')

fig.update_traces(texttemplate='%{text:,.0f}', textposition='outside')
fig.update_layout(
    coloraxis_colorbar_title='增长率%',
    height=450, font_size=13,
    plot_bgcolor='rgba(0,0,0,0)',
)
fig.show()  # 交互式：可缩放、悬停、下载`,

  line: `import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd

# 多指标折线图 + 双Y轴
fig = make_subplots(specs=[[{"secondary_y": True}]])

fig.add_trace(go.Scatter(
    x=dates, y=dau,
    name='DAU(日活)', mode='lines+markers',
    line=dict(color='#06b6d4', width=2.5),
    marker=dict(size=6),
    fill='tozeroy',                    # 面积图
    fillcolor='rgba(6,182,212,0.08)',
), secondary_y=False)

fig.add_trace(go.Scatter(
    x=dates, y=revenue,
    name='营收(万元)', mode='lines',
    line=dict(color='#10b981', width=2, dash='dot'),
), secondary_y=True)                   # 使用第二Y轴

fig.update_layout(
    title='DAU 与营收趋势（双Y轴）',
    hovermode='x unified',             # 悬停时一次显示所有系列
    template='plotly_dark',
    legend=dict(x=0.01, y=0.99),
)`,

  scatter: `import plotly.express as px

# 散点图：揭示用户使用时长 vs 付费金额关系
fig = px.scatter(
    df_users,
    x='avg_session_duration',   # X轴：平均会话时长(分钟)
    y='total_payment',          # Y轴：累计付费金额
    color='user_level',         # 颜色：用户等级
    size='order_count',         # 大小：订单数量
    hover_data=['user_id','city'],   # 悬停显示额外信息
    trendline='ols',            # 添加OLS趋势线（线性回归）
    trendline_color_override='#f59e0b',
    title='使用时长 vs 付费金额相关性分析',
    labels={
        'avg_session_duration': '平均会话时长(min)',
        'total_payment': '累计付费(元)',
    },
    template='plotly_dark',
    color_discrete_map={
        'Regular': '#06b6d4',
        'Silver': '#94a3b8',
        'Gold': '#f59e0b',
        'Diamond': '#a78bfa',
    }
)
fig.update_traces(marker=dict(opacity=0.7, line=dict(width=0.5)))`,

  funnel: `import plotly.graph_objects as go

# 转化漏斗：电商购买流程
stages = ['访问首页', '浏览商品', '加入购物车', '提交订单', '完成支付']
values = [52841, 31204, 18974, 9821, 8234]
colors = ['#06b6d4','#0ea5e9','#7c3aed','#db2777','#10b981']

fig = go.Figure(go.Funnel(
    y=stages,
    x=values,
    textposition="inside",
    textinfo="value+percent initial+percent previous",
    opacity=0.85,
    marker=dict(color=colors, line=dict(width=2, color='rgba(255,255,255,0.1)')),
    connector=dict(line=dict(color='rgba(255,255,255,0.1)', width=1)),
))
fig.update_layout(
    title='电商购买转化漏斗（2024 Q1）',
    template='plotly_dark',
    height=420,
)
# 整体转化率：8234/52841 = 15.6%
# 最大流失：访问→浏览 下降41%（首页体验优化空间最大）`,
};

export default function LessonPlotlyViz() {
  const [type, setType] = useState('bar');

  // 简单 SVG 模拟图表
  const MockChart = ({ t }) => {
    if (t === 'bar') return (
      <svg viewBox="0 0 400 200" style={{ width: '100%', height: 200 }}>
        {[{ x: 30, h: 140, v: '284万', c: '#10b981' }, { x: 100, h: 80, v: '156万', c: '#06b6d4' }, { x: 170, h: 50, v: '98万', c: '#0ea5e9' }, { x: 240, h: 36, v: '72万', c: '#7c3aed' }, { x: 310, h: 22, v: '45万', c: '#a78bfa' }].map(b => (
          <g key={b.x}>
            <rect x={b.x} y={195 - b.h} width={50} height={b.h} rx={4} fill={b.c} opacity={0.85} />
            <text x={b.x + 25} y={192 - b.h} textAnchor="middle" fill="#e2e8f0" fontSize={10}>{b.v}</text>
          </g>
        ))}
        {['电子', '服装', '食品', '运动', '美妆'].map((l, i) => <text key={l} x={30 + i * 70 + 25} y={200} textAnchor="middle" fill="#94a3b8" fontSize={9}>{l}</text>)}
      </svg>
    );
    if (t === 'line') return (
      <svg viewBox="0 0 400 200" style={{ width: '100%', height: 200 }}>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity=".3"/><stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/></linearGradient></defs>
        <path d="M20,160 C60,140 90,110 130,90 S180,60 220,50 S290,55 340,40 L380,35" stroke="#06b6d4" strokeWidth="2.5" fill="none"/>
        <path d="M20,160 C60,140 90,110 130,90 S180,60 220,50 S290,55 340,40 L380,35 L380,195 L20,195Z" fill="url(#lg)"/>
        {[20, 90, 160, 230, 300, 370].map((x, i) => <circle key={x} cx={x} cy={[160,110,90,50,40,35][i]} r={4} fill="#06b6d4"/>)}
        {['1月','2月','3月','4月','5月','6月'].map((m, i) => <text key={m} x={20 + i * 70} y={200} fill="#94a3b8" fontSize={9} textAnchor="middle">{m}</text>)}
      </svg>
    );
    if (t === 'scatter') return (
      <svg viewBox="0 0 400 200" style={{ width: '100%', height: 200 }}>
        {[[50,150,8,'#06b6d4'],[80,120,12,'#10b981'],[120,80,6,'#06b6d4'],[160,60,16,'#f59e0b'],[200,40,10,'#f59e0b'],[240,30,20,'#a78bfa'],[280,20,8,'#a78bfa'],[100,100,14,'#10b981'],[180,55,8,'#06b6d4'],[320,15,18,'#a78bfa']].map(([x,y,r,c],i) =>
          <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={0.75}/>
        )}
        <line x1="20" y1="170" x2="380" y2="10" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" opacity={0.6}/>
        <text x={10} y={200} fill="#94a3b8" fontSize={9}>使用时长→</text>
        <text x={10} y={20} fill="#94a3b8" fontSize={9} writingMode="vertical-rl">付费金额→</text>
      </svg>
    );
    return (
      <svg viewBox="0 0 400 240" style={{ width: '100%', height: 240 }}>
        {[{ y: 10, w: 360, l: '访问首页', v: '52,841', c: '#06b6d4' }, { y: 60, w: 280, l: '浏览商品', v: '31,204', c: '#0ea5e9' }, { y: 110, w: 200, l: '加入购物车', v: '18,974', c: '#7c3aed' }, { y: 160, w: 110, l: '提交订单', v: '9,821', c: '#db2777' }, { y: 210, w: 90, l: '完成支付', v: '8,234', c: '#10b981' }].map(b => (
          <g key={b.y}>
            <rect x={(400 - b.w) / 2} y={b.y} width={b.w} height={38} rx={4} fill={b.c} opacity={0.85}/>
            <text x={200} y={b.y + 14} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="bold">{b.l}</text>
            <text x={200} y={b.y + 28} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={9}>{b.v}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="da-lesson">
      <div className="da-hero">
        <div className="da-hero-badge">📈 模块三</div>
        <h1>Plotly 交互可视化 — 让数据会说话</h1>
        <p>用 Plotly Express 的极简 API 创建专业级交互图表。覆盖柱图/折线/散点/漏斗四大分析场景，以及双Y轴、趋势线等高级技巧。</p>
      </div>

      <div className="da-goals">
        {[
          { icon: '📊', title: '柱状/条形图', desc: '分类对比，颜色映射第三维度' },
          { icon: '📈', title: '折线/面积图', desc: '时序趋势，双Y轴多指标并排' },
          { icon: '🔵', title: '散点图', desc: '相关性分析，OLS趋势线一键添加' },
          { icon: '🔽', title: '漏斗图', desc: '转化分析，自动计算各步流失率' },
        ].map(g => <div className="da-goal" key={g.title}><div className="da-goal-icon">{g.icon}</div><div><h3>{g.title}</h3><p>{g.desc}</p></div></div>)}
      </div>

      {/* 图表选择器 + 预览 */}
      <div className="da-sim">
        <div className="da-sim-title">🎨 图表类型实战</div>
        <div className="da-tab-bar">
          {Object.entries(CHART_DATA).map(([k, v]) => (
            <button key={k} className={`da-tab${type === k ? ' active' : ''}`} onClick={() => setType(k)}>
              {v.emoji} {v.title}
            </button>
          ))}
        </div>

        {/* SVG 模拟图表 */}
        <div style={{ background: '#0d1117', border: '1px solid var(--da-border)', borderRadius: '.75rem', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '.75rem', color: 'var(--da-muted)', marginBottom: '.5rem' }}>📊 图表预览（示意）</div>
          <MockChart t={type} />
        </div>

        <div className="da-code">
          <div className="da-code-header"><span className="da-code-lang">Python / Plotly</span></div>
          <pre>{CODES[type]}</pre>
        </div>
      </div>

      {/* 图表选择原则 */}
      <div className="da-section-title">🎯 选对图表类型</div>
      <div className="da-table-wrap">
        <table className="da-table">
          <thead><tr><th>分析目的</th><th>推荐图表</th><th>反例（错误选择）</th></tr></thead>
          <tbody>
            {[
              ['比较分类大小', '柱状图 / 条形图', '饼图（超过5类就很乱）'],
              ['展示时序趋势', '折线图 / 面积图', '柱状图（无法连续感）'],
              ['分析两变量关系', '散点图 + 趋势线', '折线图（X轴不是时间）'],
              ['显示占比构成', '堆叠条形 / 树图', '3D饼图（视觉误导）'],
              ['转化漏斗流程', '漏斗图 / 桑基图', '普通柱状图（丢失顺序含义）'],
              ['地理分布', '地图 / Choropleth', '柱状图（信息量大损失）'],
              ['分布形态', '箱线图 / 小提琴图', '折线图（无法看分布）'],
            ].map(([p, g, b]) => (
              <tr key={p}>
                <td style={{ fontWeight: 600 }}>{p}</td>
                <td><span className="da-badge green">{g}</span></td>
                <td style={{ color: '#f87171' }}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="da-tip">
        <strong>💡 dashboard 设计原则</strong>
        <p>一个仪表盘最多展示 6 个图表，遵循"金字塔"原则：顶部一个核心KPI大数字 → 中间 2-3 个趋势图 → 底部 2-3 个明细分析。颜色不超过 4 种，同类指标用同色系。</p>
      </div>
    </div>
  );
}
