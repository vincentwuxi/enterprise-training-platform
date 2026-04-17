import { useState } from 'react';
import './LessonCommon.css';

const FUNNEL_STAGES = [
  { name: '访问首页', users: 10000, color: '#10b981' },
  { name: '浏览商品', users: 7200, color: '#34d399' },
  { name: '加入购物车', users: 3100, color: '#6ee7b7' },
  { name: '开始结算', users: 1800, color: '#a7f3d0' },
  { name: '完成支付', users: 980, color: '#d1fae5' },
];

const AB_CASES = [
  {
    name: '注册流程优化',
    control: { label: '5步表单', rate: 23 },
    variant: { label: '2步+社交登录', rate: 41 },
    sampleSize: 8000,
    confidence: 99,
    impact: '注册转化率 +78%，预估年增用户 12 万',
  },
  {
    name: 'CTA 按钮文案',
    control: { label: '"免费试用"', rate: 3.2 },
    variant: { label: '"30秒开始"', rate: 4.7 },
    sampleSize: 15000,
    confidence: 95,
    impact: 'CTR +47%，月均多获取 3200 用户',
  },
  {
    name: '定价页对比',
    control: { label: '3档定价', rate: 8.5 },
    variant: { label: '2档+推荐标签', rate: 12.1 },
    sampleSize: 5000,
    confidence: 97,
    impact: '付费转化率 +42%，ARPU 提升 15%',
  },
];

export default function LessonFunnelAB() {
  const [activeTab, setActiveTab] = useState('funnel');
  const [selectedCase, setSelectedCase] = useState(0);

  const maxUsers = FUNNEL_STAGES[0].users;

  return (
    <div className="gh-lesson">
      <div className="gh-container">

        <div className="gh-hero">
          <div className="gh-badge">模块五 · Funnel & A/B Testing</div>
          <h1>漏斗分析 & A/B 测试实战</h1>
          <p>数据驱动增长的两大支柱——漏斗帮你「找到问题」，A/B 测试帮你「验证方案」。掌握从假设到统计显著性的全流程实验方法论。</p>
        </div>

        <div className="gh-metrics">
          {[
            { v: '5层', l: '核心漏斗' },
            { v: 'p<0.05', l: '统计显著性' },
            { v: 'MDE', l: '最小检测效应' },
            { v: 'ICE', l: '实验排序框架' },
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
            {[['funnel','漏斗诊断'],['ab','A/B 测试'],['stats','统计原理'],['pitfalls','常见陷阱']].map(([k,l]) => (
              <button key={k} className={`gh-tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'funnel' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                漏斗分析的关键不是看每层的绝对数字，而是找到<strong>转化率骤降</strong>的层——那就是你的增长杠杆点。
              </p>
              <div className="gh-funnel">
                {FUNNEL_STAGES.map((s, i) => (
                  <div key={s.name} className="gh-funnel-step">
                    <span style={{fontSize:'1.1rem',fontWeight:600,minWidth:28}}>{i+1}</span>
                    <div style={{minWidth:120}}>
                      <div className="gh-funnel-label">{s.name}</div>
                      <div style={{fontSize:'0.78rem',color:'var(--gh-muted)'}}>{s.users.toLocaleString()} 用户</div>
                    </div>
                    <div className="gh-funnel-bar">
                      <div className="gh-funnel-fill" style={{width:`${(s.users/maxUsers)*100}%`,background:s.color}} />
                    </div>
                    <div className="gh-funnel-pct">
                      {i === 0 ? '100%' : `${((s.users / FUNNEL_STAGES[i-1].users)*100).toFixed(1)}%`}
                    </div>
                  </div>
                ))}
              </div>
              <div className="gh-warn">⚠️ <span>「浏览→加购」转化率仅 43%，这是<strong>最大漏点</strong>。说明用户看到了商品但没有购买意愿——可能是价格展示、评价缺失或推荐不精准。</span></div>
              <div className="gh-code">{`# Python: 漏斗分析自动化
import pandas as pd

def funnel_analysis(df, steps, user_col='user_id', event_col='event'):
    """计算每层转化率，自动标记最大漏点"""
    results = []
    for i, step in enumerate(steps):
        users = df[df[event_col] == step][user_col].nunique()
        rate = users / results[i-1]['users'] if i > 0 else 1.0
        results.append({'step': step, 'users': users, 'rate': rate})
    
    # 找到最大漏点
    min_rate_idx = min(range(1, len(results)), key=lambda i: results[i]['rate'])
    results[min_rate_idx]['bottleneck'] = True
    
    return pd.DataFrame(results)

# 使用示例
steps = ['page_view', 'browse', 'add_cart', 'checkout', 'purchase']
report = funnel_analysis(events_df, steps)
print(report.to_string(index=False))`}</div>
            </div>
          )}

          {activeTab === 'ab' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                A/B 测试不是「拍脑袋试试」，而是严谨的科学实验。每个实验都需要假设、对照组、足够样本和统计检验。
              </p>
              <div className="gh-grid-1">
                {AB_CASES.map((c, i) => (
                  <div
                    key={c.name}
                    className={`gh-card${selectedCase===i?' active':''}`}
                    style={{cursor:'pointer',border: selectedCase===i ? '2px solid var(--gh-primary)' : undefined}}
                    onClick={() => setSelectedCase(i)}
                  >
                    <div className="gh-card-title">🧪 {c.name}</div>
                    <div style={{display:'flex',gap:'1.5rem',margin:'0.75rem 0'}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'0.75rem',color:'var(--gh-muted)',marginBottom:4}}>对照组 {c.control.label}</div>
                        <div style={{fontSize:'1.5rem',fontWeight:700,color:'var(--gh-muted)'}}>{c.control.rate}%</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'0.75rem',color:'var(--gh-primary)',marginBottom:4}}>实验组 {c.variant.label}</div>
                        <div style={{fontSize:'1.5rem',fontWeight:700,color:'var(--gh-primary)'}}>{c.variant.rate}%</div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                      <span className="gh-badge" style={{fontSize:'0.7rem'}}>样本 {c.sampleSize.toLocaleString()}</span>
                      <span className="gh-badge" style={{fontSize:'0.7rem'}}>置信度 {c.confidence}%</span>
                    </div>
                    <div style={{fontSize:'0.82rem',color:'var(--gh-primary)',marginTop:'0.5rem',fontWeight:500}}>📈 {c.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                统计显著性是 A/B 测试的基石。没有足够的统计功效，你的结论就是掷硬币。
              </p>
              <div className="gh-formula">最小样本量 n = (Z²α/2 × p(1-p)) / MDE²</div>
              <div className="gh-code">{`# A/B 测试样本量计算器
from scipy import stats
import numpy as np

def calc_sample_size(baseline_rate, mde, alpha=0.05, power=0.8):
    """
    baseline_rate: 当前转化率 (e.g., 0.05)
    mde: 最小检测效应 (e.g., 0.01 = 绝对提升1%)
    alpha: 显著性水平 (通常 0.05)
    power: 统计功效 (通常 0.80)
    """
    z_alpha = stats.norm.ppf(1 - alpha/2)  # 1.96
    z_beta = stats.norm.ppf(power)          # 0.84
    
    p1 = baseline_rate
    p2 = baseline_rate + mde
    p_avg = (p1 + p2) / 2
    
    n = ((z_alpha * np.sqrt(2*p_avg*(1-p_avg)) + 
          z_beta * np.sqrt(p1*(1-p1) + p2*(1-p2)))**2) / mde**2
    
    return int(np.ceil(n))

# 示例: 当前转化率 5%，想检测 1% 的绝对提升
n = calc_sample_size(0.05, 0.01)
print(f"每组需要 {n:,} 个样本")  # ≈ 3,842
print(f"如果日流量 1000，需要跑 {np.ceil(n*2/1000):.0f} 天")`}</div>
              <div className="gh-grid-3">
                {[
                  {t:'α 错误 (假阳性)', d:'实际没有差异，却判定有差异。α=0.05 意味着 5% 概率犯此错误', e:'🎭'},
                  {t:'β 错误 (假阴性)', d:'实际有差异，却判定无差异。Power=0.8 意味着 20% 概率犯此错误', e:'👻'},
                  {t:'MDE (最小效应)', d:'你想检测的最小变化量。越小→需要的样本越多。通常设为商业可感知的最小改进', e:'📐'},
                ].map(c => (
                  <div key={c.t} className="gh-card">
                    <div className="gh-card-title">{c.e} {c.t}</div>
                    <div className="gh-card-body">{c.d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pitfalls' && (
            <div>
              <p style={{color:'var(--gh-muted)',marginBottom:'1.25rem',fontSize:'0.9rem'}}>
                90% 的 A/B 测试失败不是因为方案不好，而是因为实验设计有漏洞。
              </p>
              <div className="gh-grid-2">
                {[
                  {t:'🔍 偷看数据 (Peeking)', d:'实验还没跑完就看数据做决定，会显著提高假阳性率。解决：预设实验周期，中途不看结果。'},
                  {t:'🎯 多重比较', d:'同时测 10 个变体，总会有一个"显著"的——那是巧合。解决：Bonferroni 校正或 FDR 控制。'},
                  {t:'📆 时间效应', d:'工作日和周末用户行为不同。只跑了周一到周三就下结论。解决：实验周期至少覆盖完整的 1-2 个自然周。'},
                  {t:'🎯 选择偏差', d:'实验组和对照组的用户分布不均匀（如新旧用户比例不同）。解决：A/A 测试验证分流引擎。'},
                  {t:'🔄 新奇效应', d:'新功能上线初期数据好看，但用户新鲜劲过后就回落。解决：实验跑够 2-4 周，观察趋势稳定性。'},
                  {t:'📊 平均值陷阱', d:'平均转化率提升了，但高价值用户转化率下降了。解决：按用户分层分析差异（新/老/高价值）。'},
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
              {t:'绘制你的核心漏斗', d:'定义 5-7 步关键事件，量化每层流失率，找到最大漏点集中开火。'},
              {t:'设计你的第一个 A/B 实验', d:'写出假设 → 计算样本量 → 设置实验周期 → 等数据说话。'},
              {t:'建立实验文化', d:'用 ICE 框架排序实验优先级，每周至少上线 1 个，用数据驱动每一个产品决策。'},
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
