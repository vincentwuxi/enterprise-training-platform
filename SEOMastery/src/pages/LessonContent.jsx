import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const CONTENT_TYPES = [
  { type: '权威指南', icon: '📕', traffic: '极高', links: '极高', time: '高', best: '攻主关键词', color: '#10b981' },
  { type: '数据报告', icon: '📊', traffic: '中', links: '极高', time: '极高', best: '获取媒体外链', color: '#3b82f6' },
  { type: '教程/How-to', icon: '🎓', traffic: '高', links: '中', time: '中', best: '长尾词流量', color: '#a78bfa' },
  { type: '对比文章', icon: '⚖️', traffic: '高', links: '低', time: '中', best: '商业意图词', color: '#f59e0b' },
  { type: '信息图', icon: '🎨', traffic: '低', links: '高', time: '高', best: '外链诱饵', color: '#ec4899' },
  { type: '工具/计算器', icon: '🔧', traffic: '极高', links: '极高', time: '极高', best: '自动获取链接', color: '#34d399' },
  { type: '清单/模板', icon: '📋', traffic: '中', links: '中', time: '低', best: '实用流量', color: '#06b6d4' },
  { type: '问答/FAQ', icon: '❓', traffic: '低', links: '低', time: '低', best: '填充 Featured Snippet', color: '#64748b' },
];

const CONTENT_CALENDAR = [
  { week: '第1周', task: '关键词研究与内容规划', action: '确定目标关键词、意图、对标文章' },
  { week: '第2周', task: '内容创作（草稿）', action: '撰写 2000-3000 字初稿，不要边写边优化' },
  { week: '第3周', task: '内容优化与多媒体', action: 'SEO 优化、添加图片/视频/数据可视化' },
  { week: '第4周', task: '发布与推广', action: '发布、社媒分发、联系行业博主推广' },
  { week: '第5-8周', task: '内容更新与外链跟踪', action: '监测排名，获取反馈，持续迭代内容' },
];

export default function LessonContent() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="lesson-seo">
      <div className="seo-badge">✍️ module_06 — 内容营销</div>

      <div className="seo-hero">
        <h1>内容营销：用内容赢得搜索份额</h1>
        <p>SEO 的本质是<strong>用最好的内容回答用户的问题</strong>。内容营销不是为了算法写作，而是为用户创造真实价值——算法只是用来奖励好内容的机器。</p>
      </div>

      {/* 内容类型选择器 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📚 内容类型 ROI 分析（点击查看详情）</h2>
        <div className="seo-grid-4">
          {CONTENT_TYPES.map((c, i) => (
            <div key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{
                padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                background: selected === i ? `${c.color}14` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected === i ? c.color + '40' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: selected === i ? c.color : '#e2e8f0', fontSize: '0.82rem' }}>{c.type}</div>
            </div>
          ))}
        </div>

        {selected !== null && (
          <div style={{ marginTop: '1rem', padding: '1.1rem 1.25rem', background: `${CONTENT_TYPES[selected].color}08`, border: `1px solid ${CONTENT_TYPES[selected].color}30`, borderRadius: '10px' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>自然流量</div><div style={{ fontWeight: 700, color: CONTENT_TYPES[selected].color }}>{CONTENT_TYPES[selected].traffic}</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>获取外链</div><div style={{ fontWeight: 700, color: CONTENT_TYPES[selected].color }}>{CONTENT_TYPES[selected].links}</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>制作成本</div><div style={{ fontWeight: 700, color: '#f59e0b' }}>{CONTENT_TYPES[selected].time}</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>最适场景</div><div style={{ fontWeight: 700, color: '#94a3b8' }}>{CONTENT_TYPES[selected].best}</div></div>
            </div>
          </div>
        )}
      </div>

      {/* EEAT */}
      <div className="seo-section">
        <h2 className="seo-section-title">🏆 EEAT — Google 内容质量框架</h2>
        <div className="seo-grid-2">
          {[
            { letter: 'E', name: 'Experience（亲身经历）', desc: '作者有没有亲身使用或经历过所写的内容？用第一人称真实案例、截图数据体现。', example: '"我用这个方法 3 个月把流量提升了 300%"' },
            { letter: 'E', name: 'Expertise（专业知识）', desc: '作者是否有相关领域的专业背景？通过作者资质栏、机构介绍、引用数据来体现。', example: '文章末尾写明作者 10 年 SEO 经验、认证资质' },
            { letter: 'A', name: 'Authoritativeness（权威性）', desc: '网站/作者在行业内的影响力和认可度。被媒体引用、同行推荐、奖项背书。', example: '曾被 36kr/虎嗅引用、Moz 合作专栏作者' },
            { letter: 'T', name: 'Trustworthiness（可信度）', desc: '内容的准确性、来源透明度、联系方式可达性。引用权威来源、及时纠错。', example: '所有数据附原始来源链接，联系方式真实可达' },
          ].map(e => (
            <div key={e.letter + e.name} className="seo-card" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#10b981', fontSize: '1.1rem', flexShrink: 0 }}>{e.letter}</div>
                <div>
                  <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.9rem' }}>{e.name}</h3>
                  <p style={{ marginBottom: '0.5rem' }}>{e.desc}</p>
                  <div style={{ padding: '0.4rem 0.75rem', background: 'rgba(16,185,129,0.05)', borderRadius: '4px', fontSize: '0.77rem', color: '#64748b', borderLeft: '2px solid #10b981' }}>示例：{e.example}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 内容发布日历 */}
      <div className="seo-section">
        <h2 className="seo-section-title">📅 内容 SEO 执行日历（单篇文章）</h2>
        <div className="seo-steps">
          {CONTENT_CALENDAR.map((c, i) => (
            <div key={i} className="seo-step">
              <div className="seo-step-num">{c.week}</div>
              <div className="seo-step-content">
                <h4>{c.task}</h4>
                <p>{c.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Snippet */}
      <div className="seo-section">
        <h2 className="seo-section-title">⭐ 抢占精选摘要（Featured Snippet）</h2>
        <div className="seo-card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          <div className="seo-grid-2">
            {[
              { type: '段落型', tip: '直接在内容中写一个简短（40-60字）的直接回答，放在 H2 问题标题正下方' },
              { type: '列表型', tip: '使用 ol/ul 无序列表，每条不超过 8 个，总步骤不超过 8 步' },
              { type: '表格型', tip: '对比类内容使用 HTML table，Google 会直接抓取表格显示' },
              { type: '视频型', tip: '在 YouTube 发布教程视频，Google 有时会抽取视频片段作为摘要' },
            ].map(s => (
              <div key={s.type} style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.3rem', fontSize: '0.875rem' }}>{s.type}摘要</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.tip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="seo-nav">
        <button className="seo-btn" onClick={() => navigate('/course/seo-mastery/lesson/offpage')}>← 上一模块</button>
        <button className="seo-btn primary" onClick={() => navigate('/course/seo-mastery/lesson/analytics')}>下一模块：数据分析 →</button>
      </div>
    </div>
  );
}
