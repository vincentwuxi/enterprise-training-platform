import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TIMELINE = [
  { month: '第 0 月', phase: '启动阶段', actions: ['技术 SEO 审计（Core Web Vitals、robots、sitemap）', '关键词研究：确定 50 个目标词（核心词 5 个 + 长尾词 45 个）', '竞品分析：研究前 5 名的内容策略和外链结构'], result: '0 → 500 UV/月 (底部长尾词出排名)', color: '#3b82f6' },
  { month: '第 1-3 月', phase: '内容爆发期', actions: ['每周发布 3-4 篇长尾关键词文章（1500-2500 字）', '优化已有页面的 Title/H1/内部链接', '开始联系 5-10 个同行博主换链'], result: '500 → 8,000 UV/月 (+1500%)', color: '#a78bfa' },
  { month: '第 4-6 月', phase: '权威建设期', actions: ['发布 2 篇数据报告（获取自然外链）', '攻击核心关键词（KD 30-50 的词）', '优化 CTR 低于 2% 的页面的 Title/Description'], result: '8,000 → 35,000 UV/月 (+337%)', color: '#f59e0b' },
  { month: '第 7-12 月', phase: '规模化阶段', actions: ['聘用兼职内容作者，产能扩大 3 倍', '系统化外链建设（每月 10+ 高质量外链）', '建立内容聚类体系，攻击高难度词（KD 60+）'], result: '35,000 → 100,000 UV/月 (+186%)', color: '#10b981' },
];

const MISTAKES = [
  { mistake: '关键词堆砌', impact: '被 Google Panda 算法降权', fix: '关注用户阅读体验，TF-IDF 自然分布' },
  { mistake: '购买低质链接', impact: '被 Penguin 算法惩罚，严重可手动移除索引', fix: '只做白帽外链，使用 Disavow 工具清除有毒链接' },
  { mistake: '内容抄袭/重复', impact: '稀释页面权重，爬虫困惑，影响整站权威', fix: '使用 Canonical 标签，对薄内容页面 Noindex' },
  { mistake: '忽视移动端', impact: 'Mobile-First Indexing 降权，用户体验差', fix: '响应式设计，通过 Mobile-Friendly Test' },
  { mistake: '只看关键词不看意图', impact: '排名好但跳出率高，转化为零', fix: '先研究 SERP 前 10 的内容形式，再创作' },
  { mistake: '急于求成', impact: '采用 Black Hat 方法，短期见效长期崩', fix: 'SEO 是 12-24 个月的复利游戏，坚持白帽策略' },
];

export default function LessonCase() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  return (
    <div className="lesson-seo">
      <div className="seo-badge">🏆 module_08 — 实战案例</div>

      <div className="seo-hero">
        <h1>从 0 到 10 万月流量：完整 SEO 实战路线图</h1>
        <p>这是一个真实的 SEO 增长案例——一个垂直行业博客，从零开始，用 12 个月的时间达到月均 <strong>10 万自然访客</strong>。没有捷径，只有系统方法。</p>
      </div>

      {/* 增长时间轴 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📅 SEO 12 个月增长时间轴</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {TIMELINE.map((t, i) => (
            <button key={i} className={`seo-btn ${phase === i ? 'primary' : ''}`}
              onClick={() => setPhase(i)} style={phase !== i ? { borderColor: t.color + '40', color: t.color } : {}}>
              {t.month}
            </button>
          ))}
        </div>
        <div className="seo-interactive" style={{ borderColor: `${TIMELINE[phase].color}30` }}>
          <h3 style={{ color: TIMELINE[phase].color }}>{TIMELINE[phase].month}：{TIMELINE[phase].phase}</h3>
          <div className="seo-steps" style={{ marginBottom: '1rem' }}>
            {TIMELINE[phase].actions.map((a, i) => (
              <div key={i} className="seo-step" style={{ borderColor: `${TIMELINE[phase].color}25` }}>
                <div className="seo-step-num" style={{ color: TIMELINE[phase].color, background: `${TIMELINE[phase].color}15`, borderColor: `${TIMELINE[phase].color}30` }}>{i + 1}</div>
                <div className="seo-step-content"><p style={{ color: '#94a3b8' }}>{a}</p></div>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.875rem', background: `${TIMELINE[phase].color}10`, border: `1px solid ${TIMELINE[phase].color}30`, borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem' }}>📈</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.2rem' }}>阶段成果</div>
              <div style={{ fontWeight: 800, color: TIMELINE[phase].color, fontSize: '1rem', fontFamily: 'JetBrains Mono' }}>{TIMELINE[phase].result}</div>
            </div>
          </div>
        </div>

        {/* 总流量曲线 */}
        <div className="seo-card">
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[['0 UV', '起点'], ['8,000', '3个月'], ['35,000', '6个月'], ['100,000', '12个月']].map(([v, t]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#34d399', fontFamily: 'JetBrains Mono' }}>{v}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 常见错误 */}
      <div className="seo-section">
        <h2 className="seo-section-title">⚠️ SEO 最致命的 6 个错误</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {MISTAKES.map(m => (
            <div key={m.mistake} style={{ padding: '0.875rem 1rem', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '1rem', alignItems: 'start' }}>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.875rem' }}>❌ {m.mistake}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>后果：{m.impact}</div>
              <div style={{ fontSize: '0.8rem', color: '#34d399' }}>✅ 正确做法：{m.fix}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SEO 工具栈 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🛠️ 完整 SEO 工具栈推荐</h2>
        <div className="seo-grid-3">
          {[
            { cat: '必备免费', tools: ['Google Search Console', 'Google Analytics 4', 'Google Keyword Planner', 'Bing Webmaster Tools'], color: '#10b981' },
            { cat: '付费进阶', tools: ['Ahrefs（综合最强）', 'SEMrush（营销全套）', 'Screaming Frog（技术审计）', '5118（中文市场）'], color: '#3b82f6' },
            { cat: '辅助效率', tools: ['Surfer SEO（内容优化）', 'Clearscope（TF-IDF 分析）', 'PageSpeed Insights（速度）', 'Schema Markup Generator'], color: '#a78bfa' },
          ].map(g => (
            <div key={g.cat} className="seo-card" style={{ borderColor: `${g.color}25` }}>
              <h3 style={{ color: g.color }}>{g.cat}</h3>
              {g.tools.map(t => (
                <div key={t} style={{ fontSize: '0.82rem', color: '#64748b', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>• {t}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 课程总结 */}
      <div className="seo-section">
        <div className="seo-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,95,70,0.1))', borderColor: 'rgba(16,185,129,0.25)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#34d399' }}>🎓 恭喜完成 SEO 全课程！你已掌握的核心技能</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              '✅ 理解 Google 爬取、索引、排名机制',
              '✅ 用搜索意图框架研究关键词',
              '✅ 完成技术 SEO 审计与 Core Web Vitals 优化',
              '✅ 撰写 SERP 点击率最大化的元标签',
              '✅ 执行白帽外链建设策略',
              '✅ 用 EEAT 框架创作高质量内容',
              '✅ 用 GSC + GA4 数据驱动优化决策',
              '✅ 制定 12 个月 SEO 增长路线图',
            ].map(s => (
              <div key={s} style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="seo-nav">
        <button className="seo-btn" onClick={() => navigate('/course/seo-mastery/lesson/analytics')}>← 上一模块</button>
        <button className="seo-btn primary" onClick={() => navigate('/course/seo-mastery')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
