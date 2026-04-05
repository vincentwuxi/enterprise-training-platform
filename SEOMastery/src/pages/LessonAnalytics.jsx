import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const MOCK_DATA = {
  months: ['10月', '11月', '12月', '1月', '2月', '3月'],
  clicks: [1240, 2100, 3800, 5200, 7100, 9800],
};

const KEY_METRICS = [
  { name: '自然点击量', value: '9,800', change: '+38%', desc: '通过自然搜索点击进入网站的次数' },
  { name: '展示量', value: '148,000', change: '+28%', desc: 'SERP 中展示你网站的总次数（无论是否点击）' },
  { name: '平均排名', value: '4.2 位', change: '↑6位', desc: '所有关键词的平均排名位置（越小越好）' },
  { name: '平均 CTR', value: '6.6%', change: '+0.8%', desc: '展示次数中转化为点击的百分比' },
];

const GSC_REPORTS = [
  { name: '效果报告', tool: 'Search Console', color: 'blue', insight: '查看哪些关键词带来流量，找出高展示低点击的词优化 Title/Description' },
  { name: 'Core Web Vitals', tool: 'Search Console', color: 'blue', insight: '识别 CWV 不达标的页面，优先修复 LCP 问题' },
  { name: '移动端可用性', tool: 'Search Console', color: 'blue', insight: '找出移动端体验差的页面，避免 Mobile-First Indexing 降权' },
  { name: '流量来源分析', tool: 'GA4', color: 'orange', insight: '分析自然流量用户行为，找出高跳出率页面做内容改进' },
  { name: 'Top 着陆页', tool: 'GA4', color: 'orange', insight: '找出自然流量最多的页面，进一步优化转化率和内部链接' },
  { name: '关键词排名追踪', tool: 'Ahrefs / SEMrush', color: 'green', insight: '每周追踪目标关键词排名波动，及时发现算法更新影响' },
];

export default function LessonAnalytics() {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const maxClicks = Math.max(...MOCK_DATA.clicks);

  return (
    <div className="lesson-seo">
      <div className="seo-badge">📈 module_07 — SEO 数据分析</div>

      <div className="seo-hero">
        <h1>SEO 数据分析：让数据告诉你下一步做什么</h1>
        <p>没有数据支撑的 SEO 是盲目的。通过 Google Search Console 和 GA4，你能精准看到<strong>哪些页面需要优化、哪些关键词有机会</strong>。</p>
      </div>

      {/* 核心指标仪表盘 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📊 SEO 核心指标仪表盘（模拟数据）</h2>
        <div className="seo-grid-4">
          {KEY_METRICS.map((m, i) => (
            <div key={i}
              onClick={() => setActiveIdx(i)}
              style={{ padding: '1.1rem', background: activeIdx === i ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', fontFamily: 'JetBrains Mono', lineHeight: 1.2 }}>{m.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem', marginBottom: '0.4rem' }}>{m.name}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>{m.change} 环比</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
          💡 <strong style={{ color: '#34d399' }}>{KEY_METRICS[activeIdx].name}</strong>：{KEY_METRICS[activeIdx].desc}
        </div>
      </div>

      {/* SVG 增长趋势图 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📈 6 个月自然点击量增长趋势</h2>
        <div className="seo-interactive">
          <svg width="100%" viewBox="0 0 560 190" style={{ overflow: 'visible' }}>
            {[0, 40, 80, 120, 160].map(y => (
              <line key={y} x1="50" y1={y + 10} x2="540" y2={y + 10} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {MOCK_DATA.months.map((m, i) => (
              <text key={m} x={50 + i * 98} y={185} fill="#475569" fontSize="11" textAnchor="middle">{m}</text>
            ))}
            {MOCK_DATA.clicks.map((v, i) => {
              const h = (v / maxClicks) * 150;
              return (
                <g key={i}>
                  <rect x={30 + i * 98} y={165 - h} width={36} height={h} rx={5}
                    fill={i === MOCK_DATA.clicks.length - 1 ? 'rgba(16,185,129,0.9)' : 'rgba(16,185,129,0.4)'} />
                  <text x={48 + i * 98} y={162 - h} fill="#34d399" fontSize="9" textAnchor="middle">
                    {v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 分析报告 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🔍 关键分析报告与洞察</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {GSC_REPORTS.map((r, i) => (
            <div key={i} style={{ padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <span className={`seo-tag ${r.color}`} style={{ whiteSpace: 'nowrap' }}>{r.tool}</span>
              <div>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{r.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>💡 {r.insight}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 优化机会矩阵 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🎯 数据驱动的优化机会识别</h2>
        <div className="seo-card">
          <table className="seo-table">
            <thead><tr><th>数据场景</th><th>信号</th><th>优化动作</th></tr></thead>
            <tbody>
              {[
                ['高展示低点击', 'CTR < 2%，排名 5-15', '优化 Title & Description，提升吸引力'],
                ['排名徘徊 11-15 位', '波动但无法进首页', '增加内容深度，获取外链'],
                ['排名波动剧烈', '同词波动超 10 位', '检查内容是否匹配最新搜索意图'],
                ['流量暴跌', '单日流量下降 30%+', '核查算法更新日期，手动惩罚，技术问题'],
                ['意外排名长尾词', '未针对但出现排名', '创建专属内容页面深挖该词'],
              ].map(([scene, signal, action]) => (
                <tr key={scene}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{scene}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#60a5fa' }}>{signal}</td>
                  <td style={{ fontSize: '0.82rem', color: '#34d399' }}>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="seo-nav">
        <button className="seo-btn" onClick={() => navigate('/course/seo-mastery/lesson/content')}>← 上一模块</button>
        <button className="seo-btn primary" onClick={() => navigate('/course/seo-mastery/lesson/case')}>下一模块：实战案例 →</button>
      </div>
    </div>
  );
}
