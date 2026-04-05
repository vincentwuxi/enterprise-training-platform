import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const AUDIT_ITEMS = [
  { id: 'https', cat: 'HTTPS', text: '全站启用 HTTPS（SSL 证书）', impact: '高', link: 'https://search.google.com/search-console/' },
  { id: 'mobile', cat: '移动端', text: '通过 Google Mobile-Friendly Test', impact: '高', link: '' },
  { id: 'speed', cat: '速度', text: 'LCP ≤ 2.5秒（Core Web Vitals）', impact: '高', link: '' },
  { id: 'cls', cat: '速度', text: 'CLS ≤ 0.1（布局稳定性）', impact: '中', link: '' },
  { id: 'sitemap', cat: '爬行', text: '提交 sitemap.xml 到 Search Console', impact: '高', link: '' },
  { id: 'robots', cat: '爬行', text: 'robots.txt 没有错误阻止重要页面', impact: '高', link: '' },
  { id: 'canonical', cat: '复制内容', text: '所有页面有正确的 canonical 标签', impact: '中', link: '' },
  { id: 'noindex', cat: '索引', text: '重要页面没有 noindex 标签', impact: '高', link: '' },
  { id: '404', cat: '链接', text: '无 404 错误链接（检查 Search Console）', impact: '中', link: '' },
  { id: 'redirect', cat: '链接', text: '301 重定向链不超过 3 跳', impact: '低', link: '' },
  { id: 'hreflang', cat: '国际化', text: '多语言站点配置 hreflang（如适用）', impact: '中', link: '' },
  { id: 'schema', cat: '结构化数据', text: '关键页面配置 Schema.org 结构化数据', impact: '中', link: '' },
];

const CWV_METRICS = [
  { name: 'LCP', full: 'Largest Contentful Paint', good: '≤ 2.5s', needs: '2.5-4s', poor: '> 4s', tip: '优化最大内容元素（通常是首屏图片或视频）的加载速度。使用 CDN、压缩图片、预加载关键资源。' },
  { name: 'CLS', full: 'Cumulative Layout Shift', good: '≤ 0.1', needs: '0.1-0.25', poor: '> 0.25', tip: '给图片和广告位预留空间（width/height 属性），避免字体闪烁，不在顶部动态插入内容。' },
  { name: 'INP', full: 'Interaction to Next Paint', good: '≤ 200ms', needs: '200-500ms', poor: '> 500ms', tip: '减少主线程阻塞，拆分长任务（> 50ms），使用 Web Worker 处理复杂计算。' },
];

export default function LessonTechnical() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState({});
  const [activeMetric, setActiveMetric] = useState(null);

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const score = Object.values(checked).filter(Boolean).length;

  return (
    <div className="lesson-seo">
      <div className="seo-badge">⚙️ module_03 — 技术 SEO</div>

      <div className="seo-hero">
        <h1>技术 SEO：让搜索引擎读懂你的网站</h1>
        <p>再好的内容，如果搜索引擎无法爬取、无法正确索引，就等于零。技术 SEO 是一切优化的<strong>基础设施</strong>——它不产生内容，但决定内容能否被发现。</p>
      </div>

      {/* Core Web Vitals */}
      <div className="seo-section">
        <h2 className="seo-section-title">🚀 Core Web Vitals（核心体验指标）</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {CWV_METRICS.map(m => (
            <button key={m.name} className={`seo-btn ${activeMetric?.name === m.name ? 'primary' : ''}`}
              onClick={() => setActiveMetric(activeMetric?.name === m.name ? null : m)}>
              {m.name}
            </button>
          ))}
        </div>

        <div className="seo-grid-3" style={{ marginBottom: '1rem' }}>
          {CWV_METRICS.map(m => (
            <div key={m.name} className="seo-card" style={{ borderColor: activeMetric?.name === m.name ? 'rgba(16,185,129,0.4)' : undefined, cursor: 'pointer' }}
              onClick={() => setActiveMetric(activeMetric?.name === m.name ? null : m)}>
              <h3 style={{ fontSize: '1.1rem' }}>{m.name}</h3>
              <p style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.75rem' }}>{m.full}</p>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(16,185,129,0.12)', color: '#34d399', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>✅ {m.good}</span>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(245,158,11,0.12)', color: '#fbbf24', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>⚠️ {m.needs}</span>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>❌ {m.poor}</span>
              </div>
            </div>
          ))}
        </div>

        {activeMetric && (
          <div style={{ padding: '1.1rem 1.25rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '0.875rem', color: '#94a3b8' }}>
            <strong style={{ color: '#34d399' }}>💡 {activeMetric.name} 优化方法：</strong><br />{activeMetric.tip}
          </div>
        )}
      </div>

      {/* 技术 SEO 审计 */}
      <div className="seo-section">
        <h2 className="seo-section-title">✅ 技术 SEO 审计清单（{score}/{AUDIT_ITEMS.length} 完成）</h2>
        <div style={{ marginBottom: '0.75rem' }}>
          <div className="seo-meter">
            <div className="seo-meter-fill" style={{ width: `${(score / AUDIT_ITEMS.length) * 100}%`, background: score >= 10 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444' }} />
          </div>
          <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.3rem' }}>
            {score < 6 ? '⚠️ 需要大量技术优化' : score < 10 ? '🟡 中等水平，继续完善' : '✅ 技术 SEO 基础良好'}
          </p>
        </div>
        <div className="seo-checklist">
          {AUDIT_ITEMS.map(item => (
            <div key={item.id} className={`seo-check-item ${checked[item.id] ? 'checked' : ''}`}
              onClick={() => toggle(item.id)}>
              <div className="seo-check-box">{checked[item.id] ? '✓' : ''}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.875rem', color: checked[item.id] ? '#94a3b8' : '#e2e8f0', textDecoration: checked[item.id] ? 'line-through' : 'none' }}>{item.text}</span>
              </div>
              <span className={`seo-tag ${item.impact === '高' ? 'red' : item.impact === '中' ? 'orange' : 'blue'}`}>{item.impact}影响</span>
              <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: '#475569', whiteSpace: 'nowrap' }}>{item.cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* robots.txt */}
      <div className="seo-section">
        <h2 className="seo-section-title">🤖 robots.txt 配置示例</h2>
        <div className="seo-card">
          <div className="seo-code">{`# 允许所有搜索引擎爬取全站
User-agent: *
Allow: /

# 阻止爬取管理后台和用户私人页面
Disallow: /admin/
Disallow: /user/profile/
Disallow: /api/

# 阻止爬取搜索结果页（避免内容重复）
Disallow: /search?
Disallow: /*?sort=
Disallow: /*?filter=

# 指向 sitemap 位置
Sitemap: https://www.example.com/sitemap.xml
Sitemap: https://www.example.com/news-sitemap.xml

# 专门针对 Google 图片爬虫
User-agent: Googlebot-Image
Disallow: /private-images/`}</div>
        </div>
      </div>

      {/* 结构化数据 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📋 Schema.org 结构化数据</h2>
        <div className="seo-grid-2">
          {[
            { type: 'Article', effect: '显示文章发布日期和作者', code: '博客/新闻/教程页面' },
            { type: 'FAQPage', effect: '在 SERP 直接展开 FAQ 答案', code: '产品页、服务页 FAQ 区域' },
            { type: 'LocalBusiness', effect: '在 Google Maps 显示营业信息', code: '有实体地址的本地商家' },
            { type: 'Product', effect: '显示价格、库存、星级评分', code: '产品详情页' },
          ].map(s => (
            <div key={s.type} className="seo-card">
              <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem' }}>{s.type}</h3>
              <p><strong style={{ color: '#34d399' }}>效果：</strong>{s.effect}</p>
              <p><strong style={{ color: '#fbbf24' }}>适用页面：</strong>{s.code}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="seo-nav">
        <button className="seo-btn" onClick={() => navigate('/course/seo-mastery/lesson/keyword')}>← 上一模块</button>
        <button className="seo-btn primary" onClick={() => navigate('/course/seo-mastery/lesson/onpage')}>下一模块：页面优化 →</button>
      </div>
    </div>
  );
}
