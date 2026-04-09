import { useState } from 'react';
import './LessonCommon.css';

const AARRR = [
  { stage: 'Acquisition', cn: '获取', emoji: '📣', desc: '用户是怎么找到你的', color: '#10b981', pct: 100 },
  { stage: 'Activation', cn: '激活', emoji: '⚡', desc: '用户是否有良好的初次体验', color: '#34d399', pct: 42 },
  { stage: 'Retention', cn: '留存', emoji: '🔄', desc: '用户是否会回来', color: '#6ee7b7', pct: 22 },
  { stage: 'Referral', cn: '推荐', emoji: '🚀', desc: '用户是否推荐给他人', color: '#a7f3d0', pct: 12 },
  { stage: 'Revenue', cn: '收入', emoji: '💰', desc: '你是否从用户身上赚钱', color: '#d1fae5', pct: 6 },
];

const NORTH_STAR = [
  { product: 'Facebook', metric: '月活用户 / 10天内加到10个朋友', why: '社交网络价值源于连接' },
  { product: 'Airbnb', metric: '每晚预订数量', why: '平台价值 = 交易频次' },
  { product: 'Slack', metric: '团队发送 2000 条消息', why: '达到"粘性阈值"即留存' },
  { product: 'Netflix', metric: '月活付费会员数', why: '订阅制 = 留存即收入' },
  { product: 'Uber', metric: '每周双边完成订单数', why: '司机+乘客双边网络效应' },
];

export default function LessonGrowthFoundation() {
  const [activeTab, setActiveTab] = useState('aarrr');
  const [nsExpanded, setNsExpanded] = useState(null);

  return (
    <div className="gh-lesson">
      <div className="gh-container">

        <div className="gh-hero">
          <div className="gh-badge">模块一 · Growth Foundation</div>
          <h1>增长思维与 AARRR 框架</h1>
          <p>从"感觉增长"到"系统增长"——掌握北极星指标、增长飞轮与 AARRR 转化模型，建立数据驱动的增长操作系统。</p>
        </div>

        <div className="gh-metrics">
          {[
            { v: 'AARRR', l: '增长框架' },
            { v: '1个', l: '北极星指标' },
            { v: '飞轮', l: '增长模式' },
            { v: '∞', l: '可持续增长' },
          ].map(m => (
            <div key={m.l} className="gh-metric-card">
              <div className="gh-metric-value">{m.v}</div>
              <div className="gh-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="gh-section">
          <h2>🧭 核心框架</h2>
          <div className="gh-tabs">
            {[['aarrr','AARRR 漏斗'],['northstar','北极星指标'],['flywheel','增长飞轮']].map(([k,l]) => (
              <button key={k} className={`gh-tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'aarrr' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                Dave McClure 提出的增长漏斗——每一层都是一个待优化的杠杆点，找到最薄弱的环节集中开火。
              </p>
              <div className="gh-funnel">
                {AARRR.map(s => (
                  <div key={s.stage} className="gh-funnel-step">
                    <span style={{fontSize:'1.3rem'}}>{s.emoji}</span>
                    <div style={{minWidth:120}}>
                      <div className="gh-funnel-label">{s.cn} <span style={{color:'var(--gh-muted)',fontWeight:400,fontSize:'0.8rem'}}>/ {s.stage}</span></div>
                      <div style={{fontSize:'0.78rem',color:'var(--gh-muted)'}}>{s.desc}</div>
                    </div>
                    <div className="gh-funnel-bar">
                      <div className="gh-funnel-fill" style={{width:`${s.pct}%`,background:s.color}} />
                    </div>
                    <div className="gh-funnel-pct">{s.pct}%</div>
                  </div>
                ))}
              </div>
              <div className="gh-tip" style={{marginTop:'1rem'}}>
                💡 <span>漏斗分析的关键：<strong>不要同时优化所有层</strong>。先找到"最大漏点"——如果激活率只有 20%，优化获客只会浪费预算。</span>
              </div>
            </div>
          )}

          {activeTab === 'northstar' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                北极星指标（NSM）= 最能代表你为用户创造的核心价值的单一指标。它是整个团队的对齐工具。
              </p>
              <div className="gh-formula">NSM = 反映用户获得核心价值那一刻的频次或量级</div>
              <div className="gh-table-wrap">
                <table className="gh-table">
                  <thead><tr><th>产品</th><th>北极星指标</th><th>背后逻辑</th></tr></thead>
                  <tbody>
                    {NORTH_STAR.map((r,i) => (
                      <tr key={i} style={{cursor:'pointer'}} onClick={() => setNsExpanded(nsExpanded===i?null:i)}>
                        <td style={{fontWeight:600,color:'var(--gh-primary)'}}>{r.product}</td>
                        <td>{r.metric}</td>
                        <td style={{color:'var(--gh-muted)',fontSize:'0.82rem'}}>{r.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="gh-warn">⚠️ <span>避免把<strong>收入</strong>当北极星——它是结果，不是驱动力。找交付用户价值的动作指标。</span></div>
              <div className="gh-code">{`# 定义北极星指标的三个问题
1. 用户在什么时刻真正"获得价值"？
   → Slack：团队发出第一条消息
   → Airbnb：房客完成第一次住宿
   
2. 这个时刻多久发生一次？
   → 频次越高，指标越好追踪和优化
   
3. 这个指标能预测长期留存和收入吗？
   → 相关性 > 0.7 才值得作为 NSM`}</div>
            </div>
          )}

          {activeTab === 'flywheel' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                增长飞轮（Growth Flywheel）≠ 增长漏斗。飞轮是<strong>自我强化</strong>的循环——每次循环都比上一次更快、更省力。
              </p>
              <div className="gh-grid-2">
                {[
                  {title:'Amazon 飞轮', steps:['低价格 →','更多客户 →','更多卖家 →','更多品类 →','更好的客户体验 →','更低成本 →','更低价格 ↺']},
                  {title:'Airbnb 飞轮', steps:['更多房源 →','更多旅行者 →','更多评价 →','更可信的平台 →','更多房东愿意入驻 →','更多房源 ↺']},
                ].map(fw => (
                  <div key={fw.title} className="gh-card">
                    <div className="gh-card-title" style={{color:'var(--gh-primary)'}}>{fw.title}</div>
                    <div className="gh-steps" style={{marginTop:'0.75rem'}}>
                      {fw.steps.map((s,i) => (
                        <div key={i} style={{fontSize:'0.83rem',color: s.includes('↺') ? 'var(--gh-primary)' : 'var(--gh-text)',fontWeight: s.includes('↺')?700:400}}>
                          {s.includes('↺') ? '🔄 ' : `${i+1}. `}{s}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="gh-key">🧲 <span>设计飞轮的关键：<strong>找到正反馈回路</strong>。你的产品中，哪个行为会带来更多这个行为本身？</span></div>
            </div>
          )}
        </div>

        {/* Growth System */}
        <div className="gh-section">
          <h2>⚙️ 增长操作系统</h2>
          <div className="gh-code">{`# 增长团队的工作节奏（ICE 评分框架）
# Impact × Confidence × Ease ÷ 3 = 优先级得分

实验想法                    Impact  Confidence  Ease  ICE
----------------------------------------------------------
注册流程从 5 步缩减到 2 步     9      7          6    7.3  ← 优先
首页 CTA 按钮改为绿色          5      8          9    7.3  ← 优先
增加用户评价模块               7      6          5    6.0
邮件 onboarding 序列优化       8      5          7    6.7
推荐奖励提高到 50 元           6      4          8    6.0

# 每周实验节奏
周一: 复盘上周实验数据，决定是否推全 / 放弃 / 迭代
周二: Head-to-head 评审本周实验方案
周三-周四: 实验上线
周五: 数据 check-in（快速决策）`}</div>
          <div className="gh-grid-3">
            {[
              { t:'🎯 专注', d:'每次只聚焦一个增长环节，避免同时开太多实验造成数据污染' },
              { t:'📊 量化', d:'每个实验必须有明确的成功指标（KPI）和统计显著性要求' },
              { t:'⚡ 速度', d:'实验周期越短越好（1-2周），快速迭代比完美方案更重要' },
            ].map(c => (
              <div key={c.t} className="gh-card">
                <div className="gh-card-title">{c.t}</div>
                <div className="gh-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="gh-section">
          <h2>📚 本章小结</h2>
          <div className="gh-steps">
            <div className="gh-step">
              <div className="gh-step-content">
                <div className="gh-step-title">找到你的北极星指标</div>
                <div className="gh-step-desc">问自己：用户在什么时刻真正体验到你的核心价值？量化这一刻。</div>
              </div>
            </div>
            <div className="gh-step">
              <div className="gh-step-content">
                <div className="gh-step-title">绘制 AARRR 漏斗并量化每层转化率</div>
                <div className="gh-step-desc">用数据定位最大漏点，集中资源击穿单点突破。</div>
              </div>
            </div>
            <div className="gh-step">
              <div className="gh-step-content">
                <div className="gh-step-title">建立实验文化</div>
                <div className="gh-step-desc">用 ICE 评分排列实验优先级，每周至少上线 1-2 个实验。</div>
              </div>
            </div>
            <div className="gh-step">
              <div className="gh-step-content">
                <div className="gh-step-title">设计你的飞轮</div>
                <div className="gh-step-desc">识别产品中的正反馈回路，让每次用户行为都强化下一次增长。</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
