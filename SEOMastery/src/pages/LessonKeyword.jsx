import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const INTENT_TYPES = [
  { type: '信息型 (Informational)', icon: '💡', example: '"如何做 SEO"  "SEO 是什么"', strategy: '创作教程、指南、FAQ 内容', color: '#3b82f6' },
  { type: '导航型 (Navigational)', icon: '🧭', example: '"Ahrefs 登录"  "Google Search Console"', strategy: '优化品牌词，确保主页排名', color: '#a78bfa' },
  { type: '商业调研型 (Commercial)', icon: '🔍', example: '"最好的 SEO 工具"  "Ahrefs vs SEMrush"', strategy: '对比文章、测评、榜单内容', color: '#f59e0b' },
  { type: '交易型 (Transactional)', icon: '💳', example: '"购买 SEO 工具"  "SEO 咨询服务"', strategy: '产品/服务落地页，突出 CTA', color: '#10b981' },
];

const KEYWORD_MATRIX = [
  { kw: 'SEO 是什么', vol: '33,100', kd: 15, intent: '信息型', traffic: '高', priority: '高' },
  { kw: 'SEO 优化工具', vol: '8,100', kd: 42, intent: '商业型', traffic: '中', priority: '中' },
  { kw: 'SEO 服务报价', vol: '2,900', kd: 28, intent: '交易型', traffic: '低', priority: '高' },
  { kw: '关键词研究方法', vol: '1,600', kd: 22, intent: '信息型', traffic: '中', priority: '高' },
  { kw: '网站 SEO 诊断', vol: '1,200', kd: 18, intent: '信息型', traffic: '中', priority: '高' },
  { kw: 'Google 排名技巧', vol: '5,400', kd: 55, intent: '信息型', traffic: '中', priority: '低' },
];

export default function LessonKeyword() {
  const navigate = useNavigate();
  const [seed, setSeed] = useState('SEO 培训');
  const [generated, setGenerated] = useState([]);
  const [selectedIntent, setSelectedIntent] = useState(null);

  const generateKeywords = () => {
    if (!seed.trim()) return;
    const templates = [
      `${seed} 是什么`, `${seed} 怎么做`, `${seed} 工具推荐`, `${seed} 入门教程`,
      `${seed} 案例分析`, `${seed} 费用多少`, `免费${seed}`, `${seed} vs 付费推广`,
      `${seed} 技巧`, `${seed} 常见问题`,
    ];
    setGenerated(templates);
  };

  const kdColor = (kd) => kd < 25 ? '#34d399' : kd < 50 ? '#fbbf24' : '#f87171';
  const kdLabel = (kd) => kd < 25 ? '低竞争' : kd < 50 ? '中竞争' : '高竞争';

  return (
    <div className="lesson-seo">
      <div className="seo-badge">🔑 module_02 — 关键词研究</div>

      <div className="seo-hero">
        <h1>关键词研究：找到用户真实需求</h1>
        <p>关键词研究是 SEO 的<strong>战略起点</strong>。选错关键词，再好的内容也是徒劳。本模块教你用系统方法挖掘高价值关键词，构建完整的流量矩阵。</p>
      </div>

      {/* 搜索意图 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🎯 搜索意图（Search Intent）— SEO 最重要的概念</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>Google 最终目标是满足用户意图，理解意图才能创作正确内容。点击查看策略：</p>
        <div className="seo-grid-2">
          {INTENT_TYPES.map((t, i) => (
            <div key={i}
              onClick={() => setSelectedIntent(selectedIntent === i ? null : i)}
              style={{
                padding: '1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                background: selectedIntent === i ? `${t.color}12` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedIntent === i ? t.color + '45' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>{t.icon}</div>
              <div style={{ fontWeight: 700, color: t.color, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{t.type}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.4rem' }}>示例：{t.example}</div>
              {selectedIntent === i && (
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '0.5rem 0.75rem', background: `${t.color}08`, borderRadius: '6px', borderLeft: `3px solid ${t.color}` }}>
                  💡 内容策略：{t.strategy}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 关键词矩阵 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📊 关键词优先级矩阵</h2>
        <div className="seo-card">
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
            优先选择：<strong style={{ color: '#34d399' }}>搜索量中高 + 竞争度低</strong> 的关键词（甜蜜点）
          </p>
          <table className="seo-table">
            <thead><tr><th>关键词</th><th>月搜索量</th><th>竞争度(KD)</th><th>意图</th><th>优先级</th></tr></thead>
            <tbody>
              {KEYWORD_MATRIX.map(k => (
                <tr key={k.kw}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{k.kw}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: '#60a5fa', fontWeight: 600 }}>{k.vol}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="seo-meter" style={{ width: 60, margin: 0 }}>
                        <div className="seo-meter-fill" style={{ width: `${k.kd}%`, background: kdColor(k.kd) }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: kdColor(k.kd) }}>{k.kd} · {kdLabel(k.kd)}</span>
                    </div>
                  </td>
                  <td><span className="seo-tag green">{k.intent}</span></td>
                  <td><span className="seo-tag" style={{ background: k.priority === '高' ? 'rgba(16,185,129,0.12)' : k.priority === '中' ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.12)', color: k.priority === '高' ? '#34d399' : k.priority === '中' ? '#fbbf24' : '#94a3b8' }}>{k.priority}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 关键词生成器 */}
      <div className="seo-section">
        <h2 className="seo-section-title">⚡ 关键词头脑风暴工具</h2>
        <div className="seo-interactive">
          <h3>🌱 种子关键词扩展器</h3>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input className="seo-input" value={seed} onChange={e => setSeed(e.target.value)}
              placeholder="输入种子关键词..." style={{ flex: 1, minWidth: 200 }} />
            <button className="seo-btn primary" onClick={generateKeywords}>🔍 生成变体</button>
          </div>

          {generated.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.75rem' }}>生成 {generated.length} 个关键词变体（实际工具可生成数百个）：</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {generated.map((kw, i) => (
                  <span key={i} style={{ padding: '0.35rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', fontSize: '0.82rem', color: '#34d399', cursor: 'pointer' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 关键词研究工具 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🛠️ 关键词研究工具推荐</h2>
        <div className="seo-grid-3">
          {[
            { name: 'Google Keyword Planner', cost: '免费', best: '官方数据，广告词规划', tag: 'green' },
            { name: 'Google Search Console', cost: '免费', best: '查看实际排名关键词', tag: 'green' },
            { name: 'Ahrefs Keywords Explorer', cost: '付费', best: '最全面的竞争度分析', tag: 'orange' },
            { name: 'SEMrush', cost: '付费', best: '竞品关键词间谍工具', tag: 'orange' },
            { name: '5118 大数据', cost: '付费', best: '中文市场长尾词挖掘', tag: 'blue' },
            { name: 'AnswerThePublic', cost: '免费+', best: '提问式关键词挖掘', tag: 'green' },
          ].map(t => (
            <div key={t.name} className="seo-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', margin: 0 }}>{t.name}</h3>
                <span className={`seo-tag ${t.tag}`}>{t.cost}</span>
              </div>
              <p>最适合：{t.best}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 长尾关键词 */}
      <div className="seo-section">
        <h2 className="seo-section-title">🦒 长尾关键词策略（新站必读）</h2>
        <div className="seo-card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3 style={{ color: '#f87171' }}>❌ 新站盯大词的惨剧</h3>
              <p>关键词"SEO优化"：月搜 50,000，KD=85，前 10 名全是权威网站，新站 99% 没有机会出现在首页。</p>
            </div>
            <div>
              <h3 style={{ color: '#34d399' }}>✅ 正确姿势：长尾词积累权威</h3>
              <p>关键词"小红书 SEO 优化技巧"：月搜 400，KD=12，新站可在 3 个月内冲进前 5，积累信任度后再攻大词。</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
            🏆 <strong style={{ color: '#fbbf24' }}>80/20 法则：</strong>70% 的搜索流量来自长尾关键词。100 篇长尾词文章带来的流量，往往超过 1 篇大词文章。
          </div>
        </div>
      </div>

      <div className="seo-nav">
        <button className="seo-btn" onClick={() => navigate('/course/seo-mastery/lesson/foundation')}>← 上一模块</button>
        <button className="seo-btn primary" onClick={() => navigate('/course/seo-mastery/lesson/technical')}>下一模块：技术 SEO →</button>
      </div>
    </div>
  );
}
