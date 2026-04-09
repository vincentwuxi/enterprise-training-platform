import { useState } from 'react';
import './LessonCommon.css';

const CASES = [
  {
    company: '某金融科技公司', size: '500人', scenario: '客服智能化',
    investment: '¥180万/年（含 API + 人力 + 工具）',
    benefits: [
      { item: '客服人力节省（8人→3人处理同等工单量）', value: 250 },
      { item: '平均处理时长从 8分钟降至 2分钟', value: 80 },
      { item: '客户满意度提升带来的续费收入增加', value: 120 },
      { item: '夜间/节假日全覆盖，避免遗漏商机', value: 60 },
    ],
    totalBenefit: 510, paybackMonths: 4.2,
  },
  {
    company: '某电商运营团队', size: '200人', scenario: '内容与营销自动化',
    investment: '¥60万/年',
    benefits: [
      { item: '产品描述/社媒内容生成，节省8名内容编辑', value: 120 },
      { item: '个性化推荐提升转化率（+15%）', value: 200 },
      { item: 'A/B测试提速，迭代效率3倍提升', value: 50 },
    ],
    totalBenefit: 370, paybackMonths: 1.9,
  },
];

export default function LessonROI() {
  const [headcount, setHeadcount] = useState(5);
  const [avgSalary, setAvgSalary] = useState(25);
  const [autoRate, setAutoRate] = useState(40);
  const [errRate, setErrRate] = useState(5);
  const [caseIdx, setCaseIdx] = useState(0);

  // ROI Calculator
  const annualSalaryCost = headcount * avgSalary * 10000;
  const laborSaving = annualSalaryCost * (autoRate / 100) * 0.8;
  const errorSaving = annualSalaryCost * 0.1 * (errRate / 100) * 10;
  const totalBenefit = laborSaving + errorSaving;
  const aiCost = Math.max(50000, headcount * 8000);
  const netROI = totalBenefit - aiCost;
  const roiPct = Math.round((netROI / aiCost) * 100);
  const paybackMonths = aiCost > 0 ? Math.round((aiCost / totalBenefit) * 12 * 10) / 10 : 0;

  const c = CASES[caseIdx];

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 03 · ROI Framework</div>
        <h1>ROI 测算模型</h1>
        <p>董事会只关心一件事：<strong>这笔钱值得花吗？</strong>本模块提供可复用的 AI 项目 ROI 测算框架，帮你在投资决策前量化价值，在复盘时证明成效。</p>
      </div>

      {/* ROI Framework */}
      <div className="ex-section">
        <div className="ex-section-title">📐 AI 项目 ROI 四象限模型</div>
        <div className="ex-grid-2">
          {[
            { q: '硬性成本节省', color: '#2ecc71', items: ['人力替代或提效（量化为工时×时薪）', '错误减少带来的损失降低', '流程提速带来的库存/资金占用减少', '外包/服务成本降低'] },
            { q: '收入增长贡献', color: '#d4a054', items: ['转化率提升 × 客单价 × 月交易量', '客户生命周期价值提升（流失率下降）', '新产品/服务能力（AI 赋能的创新营收）', '市场响应速度提升抢占的商机'] },
            { q: '风险价值（难量化但真实）', color: '#4a90d9', items: ['合规违规的潜在罚款避免', '声誉风险降低（客服质量对NPS影响）', '关键人才流失风险对冲', '数据资产增值（训练数据护城河）'] },
            { q: 'AI 项目全成本（别低估）', color: '#e74c3c', items: ['API + 云计算费用（通常被低估3-5倍）', '内部人力：PM + 工程师 + 业务时间', '数据清理与标注成本', '变革管理（培训 + 流程重设计）'] },
          ].map((q, i) => (
            <div key={i} className="ex-card" style={{ borderTop: `3px solid ${q.color}` }}>
              <div style={{ fontWeight: 700, color: q.color, marginBottom: '0.75rem', fontSize: '0.95rem' }}>{q.q}</div>
              {q.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--ex-muted)' }}>
                  <span style={{ color: q.color, flexShrink: 0 }}>→</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive ROI Calculator */}
      <div className="ex-section">
        <div className="ex-section-title">🧮 ROI 快速估算计算器</div>
        <div className="ex-grid-2">
          <div className="ex-card-gold">
            <div style={{ fontWeight: 700, marginBottom: '1.25rem' }}>📥 输入参数</div>
            {[
              { label: `AI 辅助人员规模：${headcount} 人`, min: 1, max: 100, val: headcount, set: setHeadcount },
              { label: `平均薪资：¥${avgSalary}万/年`, min: 8, max: 100, val: avgSalary, set: setAvgSalary },
              { label: `AI 可自动化工作比例：${autoRate}%`, min: 5, max: 80, val: autoRate, set: setAutoRate },
              { label: `当前人工错误率：${errRate}%`, min: 1, max: 30, val: errRate, set: setErrRate },
            ].map(({ label, min, max, val, set }, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--ex-muted)', marginBottom: '0.4rem' }}>{label}</div>
                <input className="ex-slider" type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))} />
              </div>
            ))}
          </div>
          <div className="ex-card">
            <div style={{ fontWeight: 700, marginBottom: '1.25rem' }}>📤 年度 ROI 估算</div>
            {[
              { label: 'AI 年度投入（含 API + 工具 + 人力）', value: `¥${(aiCost / 10000).toFixed(1)}万`, color: '#e74c3c' },
              { label: '人力效率提升节省', value: `¥${(laborSaving / 10000).toFixed(1)}万`, color: '#2ecc71' },
              { label: '错误减少节省', value: `¥${(errorSaving / 10000).toFixed(1)}万`, color: '#2ecc71' },
              { label: '年度净收益', value: `¥${(netROI / 10000).toFixed(1)}万`, color: netROI > 0 ? '#d4a054' : '#e74c3c' },
              { label: 'ROI 百分比', value: `${roiPct}%`, color: roiPct > 0 ? '#d4a054' : '#e74c3c' },
              { label: '预计投资回收期', value: `${paybackMonths} 个月`, color: '#4a90d9' },
            ].map(({ label, value, color }, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ fontSize: '0.83rem', color: 'var(--ex-muted)' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
            <div className="ex-callout gold" style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.82rem' }}>
              ⚠️ 此为估算工具，真实 ROI 需结合具体场景建模。建议在每个 POC 项目立项前制作正式的商业方案（Business Case）。
            </div>
          </div>
        </div>
      </div>

      {/* Real Cases */}
      <div className="ex-section">
        <div className="ex-section-title">📋 真实案例参考</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {CASES.map((c, i) => (
            <button key={i} className={`ex-btn ${caseIdx === i ? 'active' : ''}`} onClick={() => setCaseIdx(i)}>
              {c.scenario}
            </button>
          ))}
        </div>
        <div className="ex-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{c.company}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ex-muted)' }}>{c.size} · {c.scenario}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--ex-muted)' }}>年度投入</div>
              <div style={{ fontWeight: 700, color: 'var(--ex-red)' }}>{c.investment}</div>
            </div>
          </div>
          {c.benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--ex-muted)' }}>{b.item}</span>
              <span style={{ fontWeight: 700, color: '#2ecc71', flexShrink: 0 }}>+¥{b.value}万</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ex-muted)' }}>年度总收益</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2ecc71' }}>¥{c.totalBenefit}万</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--ex-muted)' }}>投资回收期</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ex-gold)' }}>{c.paybackMonths} 个月</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
