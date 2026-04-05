import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

export default function LessonOnPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('SEO 从入门到精通：完整学习指南');
  const [desc, setDesc] = useState('系统学习 SEO 知识，掌握关键词研究、技术优化、内容策略和外链建设，让网站获得持续自然流量增长。');
  const [url, setUrl] = useState('https://www.example.com › seo › guide');

  const titleLen = title.length;
  const descLen = desc.length;
  const titleOk = titleLen >= 40 && titleLen <= 60;
  const descOk = descLen >= 120 && descLen <= 160;

  const headingRules = [
    { tag: 'H1', rule: '每页唯一一个 H1，包含主关键词，与 Title 相关但不完全相同', ok: true },
    { tag: 'H2', rule: '分区标题，包含变体关键词和相关词，帮助内容扫描', ok: true },
    { tag: 'H3-H6', rule: 'H2 的子节点，无需强行插入关键词，自然书写', ok: true },
    { tag: 'WARNING', rule: '不要为关键词跳过层级（如 H1 直接到 H4）', ok: false },
  ];

  return (
    <div className="lesson-seo">
      <div className="seo-badge">📝 module_04 — 页面优化</div>

      <div className="seo-hero">
        <h1>On-Page SEO：每一个页面都是排名战场</h1>
        <p>On-Page SEO 是直接在页面上完成的优化。从 Title 标签到内部链接结构，每个元素都在告诉 Google：<strong>这个页面值得排第一</strong>。</p>
      </div>

      {/* SERP 预览器 */}
      <div className="seo-section">
        <h2 className="seo-section-title">👁️ SERP 实时预览器</h2>
        <div className="seo-interactive">
          <h3>✏️ 编辑并实时预览搜索结果样式</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Title 标签</label>
                <span style={{ fontSize: '0.72rem', color: titleOk ? '#34d399' : '#f87171', fontFamily: 'JetBrains Mono' }}>
                  {titleLen}/60 {titleOk ? '✅' : titleLen < 40 ? '⚠️ 太短' : '⚠️ 太长'}
                </span>
              </div>
              <input className="seo-input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Meta Description</label>
                <span style={{ fontSize: '0.72rem', color: descOk ? '#34d399' : '#f87171', fontFamily: 'JetBrains Mono' }}>
                  {descLen}/160 {descOk ? '✅' : descLen < 120 ? '⚠️ 太短' : '⚠️ 太长'}
                </span>
              </div>
              <textarea className="seo-textarea" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>显示 URL</label>
              <input className="seo-input" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
          </div>

          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0 0 0' }}>
            <div style={{ fontSize: '0.72rem', color: '#475569', padding: '0.5rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Google 搜索结果预览：</div>
            <div style={{ padding: '1rem 1.5rem' }}>
              <div className="serp-url">{url}</div>
              <div className="serp-title">{title || '请输入 Title 标签...'}</div>
              <div className="serp-date">2026年4月5日 — </div>
              <div className="serp-desc">{desc || '请输入 Meta Description...'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 标题层级 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🏗️ 标题层级（H1-H6）规范</h2>
        <div className="seo-card">
          {headingRules.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.65rem', background: r.ok ? 'transparent' : 'rgba(239,68,68,0.06)', borderRadius: '6px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', fontWeight: 700, minWidth: 60, color: r.tag === 'WARNING' ? '#f87171' : '#34d399' }}>
                {r.tag === 'WARNING' ? '⚠️' : `<${r.tag}>`}
              </span>
              <span style={{ fontSize: '0.85rem', color: r.ok ? '#94a3b8' : '#f87171' }}>{r.rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* URL 结构 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🔗 SEO 友好的 URL 结构</h2>
        <div className="seo-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { type: '❌ 糟糕', url: 'https://example.com/p?id=12345&cat=3&ref=home', reason: '无意义参数，爬虫难以理解页面主题' },
              { type: '❌ 糟糕', url: 'https://example.com/SEO-Optimization-Guide-2026-Complete.html', reason: '大写字母、过长、后缀暴露技术栈' },
              { type: '✅ 优质', url: 'https://example.com/seo/keyword-research-guide/', reason: '小写、用连字符、反映内容层级、包含关键词' },
            ].map((u, i) => (
              <div key={i} style={{ padding: '0.75rem', background: u.type.includes('✅') ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${u.type.includes('✅') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`, borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: u.type.includes('✅') ? '#34d399' : '#f87171' }}>{u.type}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#7dd3fc', marginBottom: '0.3rem', wordBreak: 'break-all' }}>{u.url}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>原因：{u.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 内部链接 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🕸️ 内部链接策略</h2>
        <div className="seo-grid-2">
          {[
            { title: '主题聚类模型', desc: '围绕核心页面（支柱页面）创作相关子页面，所有子页面链向支柱页面，形成主题权威集群。', key: '支柱页面 ← 10-20 个子页面' },
            { title: '锚文本优化', desc: '使用描述性锚文本（如"关键词研究方法"），避免"点击这里"这类无意义锚文本。', key: '描述性 > 通用 > 品牌词' },
            { title: '链接深度控制', desc: '重要页面距离首页的点击次数不超过 3 次，越重要的页面越需要来自首页的链接。', key: '首页 → 分类 → 内容页 = 3 层' },
            { title: '孤岛页面检测', desc: '没有任何内部链接指向的页面爬虫难以发现，定期使用工具扫描孤岛页面并补充链接。', key: '使用 Screaming Frog 扫描' },
          ].map(c => (
            <div key={c.title} className="seo-card">
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: 'rgba(16,185,129,0.06)', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#34d399' }}>{c.key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 关键词密度 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📏 关键词使用最佳实践</h2>
        <div className="seo-card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          <table className="seo-table">
            <thead><tr><th>位置</th><th>建议</th><th>重要性</th></tr></thead>
            <tbody>
              {[
                ['Title 标签', '主关键词靠前放', '🔴 极高'],
                ['H1 标签', '完整包含主关键词', '🔴 极高'],
                ['首段（前100字）', '自然出现主关键词', '🔴 高'],
                ['Meta Description', '包含主关键词，吸引点击', '🟡 中（影响 CTR）'],
                ['图片 Alt 属性', '描述性文字含相关词', '🟡 中'],
                ['URL  slug', '简短含主关键词', '🟡 中'],
                ['内容正文', 'TF-IDF 自然分布，密度约 1-2%', '🟢 低（自然即可）'],
                ['锚文本', '描述性词汇，不堆砌', '🟡 中'],
              ].map(([pos, sug, importance]) => (
                <tr key={pos}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{pos}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{sug}</td>
                  <td style={{ fontSize: '0.82rem' }}>{importance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="seo-nav">
        <button className="seo-btn" onClick={() => navigate('/course/seo-mastery/lesson/technical')}>← 上一模块</button>
        <button className="seo-btn primary" onClick={() => navigate('/course/seo-mastery/lesson/offpage')}>下一模块：外链建设 →</button>
      </div>
    </div>
  );
}
