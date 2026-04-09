import { useState } from 'react';
import './LessonCommon.css';

const MYTHS = [
  { myth: '"AI 就是 ChatGPT"', truth: 'ChatGPT 只是 AI 应用的冰山一角。真正影响企业的 AI 是：供应链预测、客户意图分析、代码自动生成、合同审查、内容个性化……它们运行在幕后，每天节省数百万美元。', icon: '🧊' },
  { myth: '"AI 会替代所有人"', truth: '麦肯锡研究：AI 自动化的是"任务"而非"职位"。未来 5 年，AI 将改变 70% 岗位的部分工作内容，但创造的新岗位数量（提示工程师、AI 产品经理、数据标注审核）将超过淘汰数量。', icon: '🔮' },
  { myth: '"AI 是 IT 部门的事"', truth: '最成功的 AI 转型都由业务部门主导。Salesforce 研究：AI ROI 正相关于"业务 Leader 参与度"，而非技术投入规模。', icon: '💼' },
  { myth: '"要等技术成熟再投入"', truth: 'AI 是"边用边熟"的技术。现在不建立内部能力和数据积累，3年后将面临更大的竞争差距。Google/Amazon 从未等待"完美时机"。', icon: '⏰' },
  { myth: '"我们公司数据不够"', truth: '大多数企业的数据量已足够用于 AI 应用落地。问题不在数据量，在于数据的可访问性、清洁度和业务场景定义。', icon: '📊' },
];

const AI_TYPES = [
  { type: '预测性 AI', desc: '分析历史数据预测未来结果', examples: ['销售预测', '需求规划', '设备预维护', '流失预警'], maturity: '成熟', invest: '中', roi: '高', color: '#2ecc71' },
  { type: '生成式 AI\n（大语言模型）', desc: '理解自然语言，生成文本/代码/图片', examples: ['客服自动化', '内容创作', '代码辅助', '合同起草'], maturity: '快速成熟', invest: '中', roi: '极高', color: '#d4a054' },
  { type: 'AI Agent', desc: '自主执行多步骤任务，做决策', examples: ['自动化流程', '研究助理', '销售 SDR', '运营监控'], maturity: '成长期', invest: '高', roi: '变革性', color: '#9b59b6' },
  { type: '计算机视觉', desc: '分析图像和视频数据', examples: ['质量检测', '安防监控', '零售分析', '医疗诊断'], maturity: '成熟', invest: '高', roi: '行业差异大', color: '#4a90d9' },
];

export default function LessonCognition() {
  const [myth, setMyth] = useState(0);
  const [aiType, setAiType] = useState(0);

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 01 · AI Cognition</div>
        <h1>AI 认知重建</h1>
        <p>在制定任何 AI 战略之前，管理者需要建立<strong>不被媒体和销售话术左右</strong>的独立判断。本模块用商业语言而非技术术语，帮你建立对 AI 能力与限制的清醒认知。</p>
      </div>

      {/* Key Stats */}
      <div className="ex-section">
        <div className="ex-section-title">📈 2025 年 AI 商业现实</div>
        <div className="ex-grid-4">
          {[
            { v: '78%', l: '财富500强已部署生成式AI' },
            { v: '3.7×', l: '领先采用者的生产力提升倍数' },
            { v: '$4.4T', l: '麦肯锡估算AI年度经济价值' },
            { v: '18月', l: '平均AI项目从决策到ROI的时间' },
          ].map((s, i) => (
            <div key={i} className="ex-stat-card">
              <div className="ex-stat-value">{s.v}</div>
              <div className="ex-stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Myth Busting */}
      <div className="ex-section">
        <div className="ex-section-title">💡 5 个最常见的管理者 AI 误解</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {MYTHS.map((m, i) => (
            <button key={i} className={`ex-btn ${myth === i ? 'active' : ''}`} onClick={() => setMyth(i)}>
              {m.icon} 误解 {i + 1}
            </button>
          ))}
        </div>
        <div className="ex-card-gold">
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ex-red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>❌ 常见误解</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ex-text)', marginTop: '0.5rem' }}>{MYTHS[myth].myth}</div>
          </div>
          <div style={{ borderTop: '1px solid rgba(212,160,84,0.1)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ex-green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✅ 更准确的认知</span>
            <div style={{ color: 'var(--ex-muted)', fontSize: '0.92rem', lineHeight: 1.8, marginTop: '0.5rem' }}>{MYTHS[myth].truth}</div>
          </div>
        </div>
      </div>

      {/* AI Types */}
      <div className="ex-section">
        <div className="ex-section-title">🗂️ 四大 AI 技术类型（商业视角）</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {AI_TYPES.map((t, i) => (
            <button key={i} className={`ex-btn ${aiType === i ? 'active' : ''}`}
              style={{ borderColor: aiType === i ? AI_TYPES[i].color : undefined, color: aiType === i ? AI_TYPES[i].color : undefined }}
              onClick={() => setAiType(i)}>
              {t.type.split('\n')[0]}
            </button>
          ))}
        </div>
        <div className="ex-grid-2">
          <div className="ex-card">
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', color: AI_TYPES[aiType].color }}>{AI_TYPES[aiType].type}</div>
            <div style={{ color: 'var(--ex-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.7 }}>{AI_TYPES[aiType].desc}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {AI_TYPES[aiType].examples.map((e, i) => <span key={i} className="ex-tag gold">{e}</span>)}
            </div>
          </div>
          <div className="ex-card">
            {[
              ['技术成熟度', AI_TYPES[aiType].maturity],
              ['初始投入', AI_TYPES[aiType].invest],
              ['ROI 潜力', AI_TYPES[aiType].roi],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ color: 'var(--ex-muted)', fontSize: '0.88rem' }}>{k}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v}</span>
              </div>
            ))}
            <div className="ex-callout gold" style={{ marginTop: '1rem', marginBottom: 0 }}>
              💼 <strong>管理者决策要点：</strong>以上 4 类技术不互斥。领先企业通常从预测性 AI 起步（风险低，ROI 快），积累经验后推进生成式 AI 和 Agent。
            </div>
          </div>
        </div>
      </div>

      {/* Power of Now */}
      <div className="ex-section">
        <div className="ex-section-title">⏱️ 为什么是现在？</div>
        <div className="ex-card" style={{ overflowX: 'auto' }}>
          <table className="ex-table">
            <thead><tr><th>时间窗口</th><th>技术能力</th><th>竞争格局</th><th>管理者应对</th></tr></thead>
            <tbody>
              {[
                ['2022-2023', 'ChatGPT 爆发，能力令人惊艳但不稳定', '先行者试水，多数企业观望', '收集信息，设立 AI 专项小组'],
                ['2024-2025（现在）', '模型成本下降90%，企业落地案例成熟', '领先者已获得效率优势，差距拉开', '⚠️ 必须启动，不落地就落后'],
                ['2026-2027', 'AI Agent 大规模部署，自主工作流普及', '未转型企业将面临结构性竞争劣势', '现在不行动，届时代价更高'],
              ].map(([t, tech, comp, action], i) => (
                <tr key={i}>
                  <td><span className="ex-tag gold">{t}</span></td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--ex-muted)' }}>{tech}</td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--ex-muted)' }}>{comp}</td>
                  <td style={{ fontSize: '0.84rem', fontWeight: i === 1 ? 700 : 400, color: i === 1 ? 'var(--ex-gold)' : undefined }}>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ex-quote">
        "每一个行业都将被 AI 重塑，区别只在于你是主动引领还是被动接受。"
        <cite>— Jensen Huang，NVIDIA CEO</cite>
      </div>
    </div>
  );
}
