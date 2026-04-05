import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const CRAWL_STEPS = [
  { icon: '🕷️', step: 'Crawling（爬取）', desc: 'Googlebot 从已知 URL 出发，跟随超链接发现新页面，将内容下载到服务器', duration: '持续进行', color: '#3b82f6' },
  { icon: '📄', step: 'Processing（处理）', desc: '解析 HTML、CSS、JS，提取文字、链接、元数据，识别规范 URL（Canonical）', duration: '毫秒级', color: '#a78bfa' },
  { icon: '📦', step: 'Indexing（索引）', desc: '将处理后的内容存入 Google 搜索索引，关联关键词权重、页面质量信号', duration: '数小时到数周', color: '#f59e0b' },
  { icon: '🏆', step: 'Ranking（排名）', desc: '用户搜索时，算法在 200+ 个信号中综合评分，毫秒内返回最相关结果', duration: '< 1 秒', color: '#10b981' },
];

const RANKING_FACTORS = [
  { factor: '内容相关性', weight: 30, desc: '内容与查询意图的匹配程度' },
  { factor: '链接权威度 (PageRank)', weight: 25, desc: '获得高质量外链的数量和质量' },
  { factor: 'Core Web Vitals', weight: 15, desc: 'LCP、CLS、INP 用户体验指标' },
  { factor: '移动端友好性', weight: 10, desc: 'Mobile-First Indexing 要求' },
  { factor: 'HTTPS 安全性', weight: 5, desc: '网站使用 SSL 证书' },
  { factor: '其余 200+ 信号', weight: 15, desc: '用户行为、品牌信号、新鲜度等' },
];

export default function LessonFoundation() {
  const navigate = useNavigate();
  const [crawlStep, setCrawlStep] = useState(-1);
  const [quizAns, setQuizAns] = useState(null);

  return (
    <div className="lesson-seo">
      <div className="seo-badge">📊 module_01 — SEO 认知基础</div>

      <div className="seo-hero">
        <h1>搜索引擎如何决定谁排第一？</h1>
        <p>SEO（搜索引擎优化）不是魔法，也不是作弊。它是一套基于<strong>搜索引擎算法逻辑</strong>的系统性工作方法。理解算法，才能让优化事半功倍。</p>
      </div>

      {/* 搜索引擎工作流程 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🔍 Google 搜索引擎工作流程</h2>
        <div className="seo-interactive">
          <h3>
            🕷️ 从爬取到排名的四个阶段
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="seo-btn" onClick={() => setCrawlStep(-1)}>重置</button>
              <button className="seo-btn primary" onClick={() => setCrawlStep(s => Math.min(3, s + 1))} disabled={crawlStep >= 3}>
                {crawlStep < 0 ? '▶ 开始' : '下一步'}
              </button>
            </div>
          </h3>
          <div className="seo-steps">
            {CRAWL_STEPS.map((s, i) => (
              <div key={i} className="seo-step" style={{ opacity: i <= crawlStep ? 1 : 0.25, transition: 'opacity 0.3s', borderColor: i <= crawlStep ? `${s.color}40` : undefined }}>
                <div className="seo-step-num" style={{ color: s.color, background: `${s.color}15`, borderColor: `${s.color}30`, fontSize: '1rem' }}>{s.icon}</div>
                <div className="seo-step-content">
                  <h4 style={{ color: i <= crawlStep ? s.color : undefined }}>{s.step}</h4>
                  <p>{s.desc}</p>
                  <p style={{ marginTop: '0.3rem' }}><span style={{ color: '#f59e0b', fontWeight: 600 }}>⏱ 时间：</span>{s.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 排名信号权重 */}
      <div className="seo-section">
        <h2 className="seo-section-title">⚖️ Google 200+ 排名信号（主要因素）</h2>
        <div className="seo-card">
          {RANKING_FACTORS.map(f => (
            <div key={f.factor} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{f.factor}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>{f.weight}%</span>
              </div>
              <div className="seo-meter">
                <div className="seo-meter-fill" style={{ width: `${f.weight * 3}%`, background: `linear-gradient(90deg, #059669, #10b981)` }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.2rem 0 0' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SEO vs SEM */}
      <div className="seo-section">
        <h2 className="seo-section-title">📊 SEO vs SEM vs 社交媒体流量</h2>
        <div className="seo-card">
          <table className="seo-table">
            <thead><tr><th>维度</th><th>SEO（自然搜索）</th><th>SEM（付费搜索）</th><th>社交媒体</th></tr></thead>
            <tbody>
              {[
                ['成本', '时间成本，无点击费', '每次点击付费（CPC）', '内容创作成本'],
                ['见效速度', '3-6 个月起效', '即时生效', '1-4 周'],
                ['持续性', '停止优化后效果延续', '停止付费即停止', '停止发布即减少'],
                ['可信度', '用户信任度高', '用户有广告意识', '中等'],
                ['ROI', '长期最高', '高但成本持续', '因平台而异'],
                ['竞争程度', '高但可积累', '竞价直接对抗', '内容质量竞争'],
              ].map(([d, seo, sem, social]) => (
                <tr key={d}>
                  <td style={{ fontWeight: 600, color: '#94a3b8' }}>{d}</td>
                  <td style={{ color: '#34d399', fontSize: '0.85rem' }}>{seo}</td>
                  <td style={{ color: '#60a5fa', fontSize: '0.85rem' }}>{sem}</td>
                  <td style={{ color: '#fbbf24', fontSize: '0.85rem' }}>{social}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 知识测验 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🧠 快速理解测验</h2>
        <div className="seo-interactive">
          <h3>Q: Googlebot 爬取了你的页面，马上就会排名吗？</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { ans: 'A', text: '是的，爬取后立即出现在搜索结果中', correct: false },
              { ans: 'B', text: '不是，还需要经过处理和索引两个阶段才可能排名', correct: true },
              { ans: 'C', text: '需要手动提交到 Google Search Console 才会索引', correct: false },
            ].map(o => (
              <div key={o.ans} onClick={() => setQuizAns(o.ans)}
                style={{
                  padding: '0.875rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                  background: quizAns === o.ans ? (o.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)') : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${quizAns === o.ans ? (o.correct ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)') : 'rgba(255,255,255,0.07)'}`,
                  fontSize: '0.875rem', color: '#e2e8f0',
                }}>
                <strong style={{ color: quizAns === o.ans ? (o.correct ? '#34d399' : '#f87171') : '#94a3b8', marginRight: '0.75rem' }}>{o.ans}.</strong>
                {o.text}
                {quizAns === o.ans && <span style={{ marginLeft: '0.75rem' }}>{o.correct ? '✅ 正确！' : '❌ 错误'}</span>}
              </div>
            ))}
          </div>
          {quizAns === 'B' && (
            <div style={{ marginTop: '0.75rem', padding: '0.875rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
              💡 正确！爬取只是第一步。页面需要被解析处理，然后进入索引，最终才有可能出现在排名中。新网站从爬取到出现排名通常需要数天到数周。
            </div>
          )}
        </div>
      </div>

      {/* 核心术语 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📖 SEO 核心术语速查</h2>
        <div className="seo-grid-2">
          {[
            { term: 'SERP', desc: '搜索引擎结果页(Search Engine Results Page)，用户看到的搜索结果页面' },
            { term: 'Organic Traffic', desc: '通过自然搜索（非付费）到达网站的访客流量' },
            { term: 'PageRank', desc: 'Google 衡量页面权威度的核心算法，基于外链数量和质量' },
            { term: 'Canonical', desc: '规范标签，告诉 Google 多个相似页面中哪个是"正版"' },
            { term: 'Robots.txt', desc: '告诉爬虫哪些页面可以/不可以爬取的文本文件' },
            { term: 'Sitemap', desc: '列出网站所有重要 URL 的 XML 文件，帮助 Google 完整索引' },
            { term: 'EEAT', desc: 'Experience/Expertise/Authoritativeness/Trustworthiness 内容质量框架' },
            { term: 'CTR', desc: '点击率，展示次数中有多少次带来了点击（Click-Through Rate）' },
          ].map(t => (
            <div key={t.term} style={{ padding: '0.875rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '8px' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginBottom: '0.3rem' }}>{t.term}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="seo-nav">
        <div />
        <button className="seo-btn primary" onClick={() => navigate('/course/seo-mastery/lesson/keyword')}>
          下一模块：关键词研究 →
        </button>
      </div>
    </div>
  );
}
