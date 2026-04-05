import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const LINK_QUALITY = [
  { factor: '链接来源网站的 DA/权威度', weight: 35, desc: 'DA 80+ 的媒体链接 ≈ 100 个 DA 20 的博客链接' },
  { factor: '链接来源页面的相关性', weight: 25, desc: '同行业的链接权重远大于不相关行业' },
  { factor: '锚文本匹配度', weight: 20, desc: '自然多样的锚文本，避免过度优化' },
  { factor: 'Dofollow vs Nofollow', weight: 10, desc: 'Dofollow 传递权重，Nofollow 不传递但有信号价值' },
  { factor: '链接位置', weight: 10, desc: '正文中的链接 > 侧边栏 > 页脚的链接' },
];

const LINK_STRATEGIES = [
  { icon: '📰', name: '客座博客（Guest Post）', difficulty: '中', quality: '高', desc: '主动联系同行业博主，提供高质量文章，换取文章中的外链。注意：不能大量购买！', badge: 'green' },
  { icon: '🔗', name: '链接诱饵（Link Bait）', difficulty: '高', quality: '极高', desc: '创作极具价值的内容（免费工具、行业报告、数据研究）自然吸引大量外链。', badge: 'green' },
  { icon: '🔍', name: '断链建设（Broken Link Building）', difficulty: '中', quality: '中', desc: '找到竞品网站外链中的 404 页面，联系链接方替换成你的内容。', badge: 'orange' },
  { icon: '📊', name: '竞品反溯（Competitive Analysis）', difficulty: '中', quality: '中', desc: '用 Ahrefs 分析竞品的外链来源，找到愿意链接的网站并主动联系。', badge: 'orange' },
  { icon: '🏛️', name: 'HARO（专家引用）', difficulty: '低', quality: '极高', desc: '注册 HARO，当记者需要专家观点时提供评论，获得媒体高权威链接。', badge: 'green' },
  { icon: '❌', name: '购买链接（Black Hat）', difficulty: '低', quality: '负面', desc: '违反 Google 政策，轻则降权，重则网站被直接移除索引，彻底失效。', badge: 'red' },
];

export default function LessonOffPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [score, setScore] = useState(null);

  const fakeCheck = () => {
    if (!url) return;
    setScore(Math.floor(Math.random() * 40 + 40));
  };

  return (
    <div className="lesson-seo">
      <div className="seo-badge">🔗 module_05 — 外链建设</div>

      <div className="seo-hero">
        <h1>外链建设：权威度是 SEO 的硬通货</h1>
        <p>如果说内容是 SEO 的身体，外链就是<strong>信用背书</strong>。一个权威网站链接到你，等于向 Google 说"这个内容值得信赖"。</p>
      </div>

      {/* 外链质量因素 */}
      <div className="seo-section">
        <h2 className="seo-section-title">⚖️ Google 如何衡量外链质量？</h2>
        <div className="seo-card">
          {LINK_QUALITY.map(f => (
            <div key={f.factor} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{f.factor}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>{f.weight}%</span>
              </div>
              <div className="seo-meter">
                <div className="seo-meter-fill" style={{ width: `${f.weight * 2.5}%`, background: 'linear-gradient(90deg, #059669, #34d399)' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.2rem 0 0' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 外链建设策略 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🏗️ 主流外链获取策略详解</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {LINK_STRATEGIES.map(s => (
            <div key={s.name} style={{ padding: '1rem 1.25rem', background: s.badge === 'red' ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.badge === 'red' ? 'rgba(239,68,68,0.2)' : s.badge === 'green' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`, borderRadius: '10px' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{s.name}</span>
                    <span className={`seo-tag ${s.badge}`}>品质：{s.quality}</span>
                    <span className="seo-tag blue">难度：{s.difficulty}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 外链检测 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🔍 模拟外链健康度检测</h2>
        <div className="seo-interactive">
          <h3>输入域名检测外链质量（演示）</h3>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input className="seo-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" style={{ flex: 1 }} />
            <button className="seo-btn primary" onClick={fakeCheck}>🔍 分析外链</button>
          </div>
          {score !== null && (
            <div className="seo-result">
              <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.75rem' }}>域名外链健康报告（演示数据）</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Domain Authority', value: score, unit: '/100', color: score >= 60 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171' },
                  { label: '外链总数', value: `${Math.floor(Math.random() * 5000 + 500)}`, unit: '个', color: '#60a5fa' },
                  { label: '引用域名数', value: `${Math.floor(Math.random() * 300 + 50)}`, unit: '个', color: '#a78bfa' },
                  { label: 'Dofollow 比例', value: `${Math.floor(Math.random() * 30 + 60)}`, unit: '%', color: '#34d399' },
                  { label: '有毒链接比例', value: `${Math.floor(Math.random() * 10 + 2)}`, unit: '%', color: '#f87171' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: m.color, fontFamily: 'JetBrains Mono' }}>{m.value}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{m.unit}</span></div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 外链清理 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🗑️ 有毒外链清理（Disavow）</h2>
        <div className="seo-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <p>如果你的网站有大量低质量或购买的外链，Google 可能对你进行惩罚。使用 Google Search Console 的 Disavow 工具告诉 Google 忽略这些链接。</p>
          <div className="seo-code">{`# disavow.txt — 提交给 Google Search Console 的外链否认文件

# 否认单个 URL
https://spam-site.com/bad-page.html

# 否认整个域名（推荐，彻底）
domain:cheap-links.xyz
domain:spam-directory.net
domain:link-farm-2024.com

# 带注释（Google 会忽略 # 开头的行）
# 以上均为购买链接，发现后已联系未回复`}</div>
        </div>
      </div>

      <div className="seo-nav">
        <button className="seo-btn" onClick={() => navigate('/course/seo-mastery/lesson/onpage')}>← 上一模块</button>
        <button className="seo-btn primary" onClick={() => navigate('/course/seo-mastery/lesson/content')}>下一模块：内容营销 →</button>
      </div>
    </div>
  );
}
