import { useState } from 'react';
import './LessonCommon.css';

const DATA_LAYERS = [
  { layer: '第一层：操作数据', icon: '💾', desc: '业务系统中的交易、行为、用户数据', examples: ['CRM 客户记录', 'ERP 订单数据', '用户点击流', '客服工单日志'], ai_value: '预测模型的核心原料，价值极高', maturity: '通常已有，可用性参差不齐' },
  { layer: '第二层：知识数据', icon: '📚', desc: '企业积累的文档、规则、专业知识', examples: ['产品手册', 'SOP 流程文档', '合同模板', '技术文档/Wiki'], ai_value: 'RAG 系统的知识库基础，直接影响 AI 问答质量', maturity: '通常分散，格式不一，需清理' },
  { layer: '第三层：人类反馈数据', icon: '👍', desc: '用户对 AI 输出的评价和反馈', examples: ['AI 回答的点赞/踩', '人工纠错记录', '客服满意度评分', '员工质量评估'], ai_value: '用于 Fine-tuning 提升模型适配性，是护城河', maturity: '大多数企业还没开始收集' },
];

export default function LessonData() {
  const [layer, setLayer] = useState(0);
  const l = DATA_LAYERS[layer];

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 06 · Data Strategy</div>
        <h1>数据战略</h1>
        <p>"AI 竞争的本质是数据竞争。"但管理者真正需要决策的，不是数据技术，而是：<strong>哪些数据值得投入、如何建立数据护城河、以及如何在不违规的前提下使用数据。</strong></p>
      </div>

      <div className="ex-section">
        <div className="ex-section-title">📊 企业 AI 三层数据架构</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {DATA_LAYERS.map((d, i) => (
            <button key={i} className={`ex-btn ${layer === i ? 'active' : ''}`} onClick={() => setLayer(i)}>
              {d.icon} {d.layer}
            </button>
          ))}
        </div>
        <div className="ex-grid-2">
          <div className="ex-card">
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{l.icon} {l.layer}</div>
            <div style={{ color: 'var(--ex-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>{l.desc}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {l.examples.map((e, i) => <span key={i} className="ex-tag gold">{e}</span>)}
            </div>
          </div>
          <div className="ex-card">
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--ex-gold)', fontWeight: 700, marginBottom: '0.3rem' }}>AI 价值</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--ex-muted)' }}>{l.ai_value}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ex-blue)', fontWeight: 700, marginBottom: '0.3rem' }}>当前成熟度</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--ex-muted)' }}>{l.maturity}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ex-section">
        <div className="ex-section-title">🛡️ 数据护城河：如何让数据成为竞争壁垒</div>
        <div className="ex-card">
          <div className="ex-steps">
            {[
              { phase: '第一步：数据盘点', desc: '识别企业内所有与目标场景相关的数据源。关键问题：数据在哪里？谁有权访问？更新频率是多少？' },
              { phase: '第二步：数据可访问性改造', desc: '打通数据孤岛（CRM/ERP/客服系统）。不需要一次性大工程——从 AI 项目的第一个场景需要的数据开始打通。' },
              { phase: '第三步：开始收集反馈数据', desc: '这是最有竞争护城河的数据。每个 AI 功能上线时，同步收集用户反馈：用户满意了吗？AI 哪里答错了？这些数据竞争对手无法复制。' },
              { phase: '第四步：建立数据飞轮', desc: '用户用 AI → 产生反馈数据 → 优化模型 → 更好的 AI → 吸引更多用户 → 更多数据。打通这个闭环，数据优势会随时间复利增长。' },
            ].map((s, i) => (
              <div key={i} className="ex-step">
                <div className="ex-step-num">{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ex-gold)', marginBottom: '0.3rem' }}>{s.phase}</div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--ex-muted)', lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ex-section">
        <div className="ex-section-title">⚖️ 数据使用合规要点</div>
        <div className="ex-grid-2">
          {[
            { t: '个人信息保护（PIPL/GDPR）', color: '#e74c3c', items: ['客户数据不得未经同意用于 AI 训练', '用户有权要求删除其数据', '跨境数据传输需合规审查', '需要指定数据安全负责人（DSO）'] },
            { t: '数据安全法（中国）', color: '#e67e22', items: ['重要数据需在境内存储（数据本地化）', '数据分级管理（核心/重要/一般）', '出境数据需通过安全评估', '互联网数据安全管理规定'] },
            { t: 'AI 使用道德规范', color: '#9b59b6', items: ['不得用客户数据训练后卖给竞争对手', '算法决策需要可解释性（金融/医疗）', '禁止用 AI 生成虚假用户评价', '员工监控 AI 需限制并告知'] },
            { t: '实际操作建议', color: '#2ecc71', items: ['法务部门提前介入 AI 项目，不是事后审查', '选择有合规承诺的 AI 厂商', '建立内部 AI 使用政策文件', '定期进行数据合规审计'] },
          ].map((c, i) => (
            <div key={i} className="ex-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 700, color: c.color, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{c.t}</div>
              {c.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.84rem', color: 'var(--ex-muted)' }}>
                  <span style={{ color: c.color, flexShrink: 0 }}>→</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
