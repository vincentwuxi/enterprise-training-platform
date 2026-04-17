import { useState } from 'react';
import './LessonCommon.css';

const DATA_LAYERS = [
  { layer: '第一层：操作数据', icon: '💾', desc: '业务系统中的交易、行为、用户数据', examples: ['CRM 客户记录', 'ERP 订单数据', '用户点击流', '客服工单日志'], ai_value: '预测模型的核心原料，价值极高', maturity: '通常已有，可用性参差不齐' },
  { layer: '第二层：知识数据', icon: '📚', desc: '企业积累的文档、规则、专业知识', examples: ['产品手册', 'SOP 流程文档', '合同模板', '技术文档/Wiki'], ai_value: 'RAG 系统的知识库基础，直接影响 AI 问答质量', maturity: '通常分散，格式不一，需清理' },
  { layer: '第三层：人类反馈数据', icon: '👍', desc: '用户对 AI 输出的评价和反馈', examples: ['AI 回答的点赞/踩', '人工纠错记录', '客服满意度评分', '员工质量评估'], ai_value: '用于 Fine-tuning 提升模型适配性，是护城河', maturity: '大多数企业还没开始收集' },
];

const MATURITY_LEVELS = [
  { level: 'L1 临时型', score: '0-20', color: '#e74c3c', traits: ['数据散落在员工个人电脑和邮箱', '无统一的数据格式或命名规范', 'AI 项目每次都要"重新找数据"', '没有数据字典或元数据管理'], action: '建立基础数据目录，明确数据所有者' },
  { level: 'L2 可重复', score: '21-40', color: '#e67e22', traits: ['有基本的数据库和数据仓库', '部分数据有文档，但更新不及时', '数据质量问题时有发生', '数据准备工作占 AI 项目 70% 时间'], action: '标准化数据格式，建立数据质量监控' },
  { level: 'L3 标准化', score: '41-60', color: '#f59e0b', traits: ['统一的数据平台（如数据湖/Lakehouse）', '数据字典和血缘追踪已建立', '有数据质量 SLA（完整性>95%，时效<1h）', '数据准备工作降至 30% 以下'], action: '建设特征平台（Feature Store），加速 AI 实验' },
  { level: 'L4 量化管理', score: '61-80', color: '#38bdf8', traits: ['数据资产有明确的业务价值衡量', 'Self-service 数据平台，非技术人员可查询', '实时数据流接入 AI 模型', '数据治理委员会定期运作'], action: '建立数据飞轮，将 AI 反馈数据回流到训练集' },
  { level: 'L5 优化型', score: '81-100', color: '#2ecc71', traits: ['数据驱动的决策文化深入组织', '合成数据生成能力（补充稀有样本）', '联邦学习/隐私计算支撑跨部门协作', '数据资产已成为核心竞争壁垒'], action: '探索数据变现，建设行业级数据联盟' },
];

const DATA_FLYWHEEL = [
  { phase: '用户使用 AI 功能', icon: '🖱️', detail: '员工使用 AI 助手处理日常工作，客户使用 AI 客服解决问题', kpi: '日活 / 功能使用率' },
  { phase: '产生交互数据', icon: '📊', detail: '每次交互产生：输入 prompt、AI 输出、用户是否采纳、修改内容', kpi: '日均交互量 / 数据采集覆盖率' },
  { phase: '收集人类反馈', icon: '👍', detail: '用户对 AI 输出点赞/踩、纠错编辑、满意度评分', kpi: '反馈率 > 15% / 标注质量分' },
  { phase: '数据清洗 + 标注', icon: '🧹', detail: '自动 + 人工过滤低质数据，形成高质量训练集', kpi: '可用数据量 / 每周新增训练样本' },
  { phase: '模型迭代优化', icon: '🔄', detail: '用新数据微调模型（SFT/DPO），部署 A/B 测试', kpi: '模型准确率提升 / 用户满意度变化' },
  { phase: '更好的 AI 体验', icon: '✨', detail: 'AI 输出质量提升 → 用户信任增加 → 使用频率提高', kpi: '留存率 / NPS 提升' },
];

export default function LessonData() {
  const [layer, setLayer] = useState(0);
  const l = DATA_LAYERS[layer];
  const [maturity, setMaturity] = useState(2);

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 06 · Data Strategy</div>
        <h1>数据战略</h1>
        <p>"AI 竞争的本质是数据竞争。" 但管理者真正需要决策的，不是数据技术，而是：<strong>哪些数据值得投入、如何建立数据护城河、以及如何在不违规的前提下使用数据。</strong></p>
      </div>

      {/* Section 1: Three-Layer Data Architecture */}
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

      {/* Section 2: Data Maturity Assessment */}
      <div className="ex-section">
        <div className="ex-section-title">📈 数据成熟度评估模型</div>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {MATURITY_LEVELS.map((m, i) => (
            <button key={i} className={`ex-btn ${maturity === i ? 'active' : ''}`}
              style={{ borderColor: maturity === i ? m.color : undefined, color: maturity === i ? m.color : undefined, fontSize: '0.82rem' }}
              onClick={() => setMaturity(i)}>
              {m.level}
            </button>
          ))}
        </div>
        {(() => { const m = MATURITY_LEVELS[maturity]; return (
          <div className="ex-grid-2">
            <div className="ex-card" style={{ borderTop: `3px solid ${m.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: m.color, fontSize: '0.95rem' }}>{m.level}</div>
                <span className="ex-tag" style={{ background: `${m.color}18`, color: m.color }}>得分: {m.score}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--ex-gold)', marginBottom: '0.5rem' }}>典型特征：</div>
              {m.traits.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.84rem', color: 'var(--ex-muted)' }}>
                  <span style={{ color: m.color, flexShrink: 0 }}>→</span> {t}
                </div>
              ))}
            </div>
            <div className="ex-card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2ecc71', marginBottom: '0.75rem' }}>🎯 升级行动</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--ex-muted)', lineHeight: 1.75, padding: '0.75rem', background: 'rgba(46,204,113,0.06)', borderRadius: '8px', border: '1px solid rgba(46,204,113,0.15)' }}>
                {m.action}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--ex-muted)', marginBottom: '0.5rem' }}>成熟度等级分布（全球企业）：</div>
                <div style={{ display: 'flex', gap: '0.3rem', height: '24px' }}>
                  {[
                    { w: '25%', color: '#e74c3c', label: 'L1: 25%' },
                    { w: '30%', color: '#e67e22', label: 'L2: 30%' },
                    { w: '25%', color: '#f59e0b', label: 'L3: 25%' },
                    { w: '15%', color: '#38bdf8', label: 'L4: 15%' },
                    { w: '5%', color: '#2ecc71', label: 'L5: 5%' },
                  ].map((s, i) => (
                    <div key={i} style={{ width: s.w, background: i === maturity ? s.color : `${s.color}30`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff', fontWeight: i === maturity ? 700 : 400, transition: 'all 0.3s' }}
                      title={s.label}>{i === maturity ? s.label : ''}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ); })()}
      </div>

      {/* Section 3: Data Flywheel */}
      <div className="ex-section">
        <div className="ex-section-title">🔄 数据飞轮：AI 竞争的终极壁垒</div>
        <div className="ex-card">
          <div style={{ fontSize: '0.88rem', color: 'var(--ex-muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
            数据飞轮是指：<strong>用户使用 AI → 产生数据 → 优化模型 → 更好的 AI → 吸引更多用户</strong>的正循环。打通这个闭环后，数据优势会随时间复利增长，竞争对手无法复制。
          </div>
          <div className="ex-steps">
            {DATA_FLYWHEEL.map((s, i) => (
              <div key={i} className="ex-step">
                <div className="ex-step-num" style={{ fontSize: '1.1rem' }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ex-gold)' }}>{s.phase}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ex-blue)', fontFamily: 'JetBrains Mono,monospace' }}>KPI: {s.kpi}</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--ex-muted)', lineHeight: 1.65 }}>{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '1.5rem', color: 'var(--ex-gold)' }}>↻ 持续循环形成数据复利</div>
        </div>
      </div>

      {/* Section 4: Data Moat Strategy */}
      <div className="ex-section">
        <div className="ex-section-title">🛡️ 数据护城河：四步建设路径</div>
        <div className="ex-card">
          <div className="ex-steps">
            {[
              { phase: '第一步：数据盘点', desc: '识别企业内所有与目标场景相关的数据源。关键问题：数据在哪里？谁有权访问？更新频率是多少？质量如何？盘点结果产出《数据资产目录》。', budget: '2-4 周' },
              { phase: '第二步：数据可访问性改造', desc: '打通数据孤岛（CRM/ERP/客服系统）。不需要一次性大工程——从 AI 项目的第一个场景需要的数据开始打通。投入产出比最高的做法是建立 ETL Pipeline 自动化。', budget: '1-3 月' },
              { phase: '第三步：开始收集反馈数据', desc: '这是最有竞争护城河的数据。每个 AI 功能上线时，同步收集用户反馈：用户满意了吗？AI 哪里答错了？这些"标注数据"竞争对手无法复制。', budget: '持续投入' },
              { phase: '第四步：建立数据飞轮', desc: '用户用 AI → 产生反馈数据 → 优化模型 → 更好的 AI → 吸引更多用户 → 更多数据。打通这个闭环，数据优势会随时间复利增长。关键指标：每月新增可用训练样本数。', budget: '6-12 月见效' },
            ].map((s, i) => (
              <div key={i} className="ex-step">
                <div className="ex-step-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ex-gold)' }}>{s.phase}</div>
                    <span className="ex-tag blue">{s.budget}</span>
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--ex-muted)', lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 5: Build vs Buy Data Infra */}
      <div className="ex-section">
        <div className="ex-section-title">🏗️ 数据基础设施：自建 vs 外购决策</div>
        <div className="ex-card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ex-border, rgba(255,255,255,0.08))' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--ex-text, #fff)' }}>维度</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', color: '#38bdf8' }}>自建团队</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', color: '#f59e0b' }}>SaaS 方案</th>
              </tr>
            </thead>
            <tbody>
              {[
                { dim: '初始投入', build: '高（50-200万/年团队成本）', buy: '低（5-30万/年订阅费）' },
                { dim: '定制化', build: '完全定制，适配业务流程', buy: '标准功能，可能需妥协' },
                { dim: '数据安全', build: '数据完全自控', buy: '取决于供应商合规能力' },
                { dim: '迭代速度', build: '慢（需要全栈能力）', buy: '快（开箱即用）' },
                { dim: '技术风险', build: '招人难、留人难', buy: '供应商锁定风险' },
                { dim: '适用场景', build: '核心竞争力相关数据', buy: '非核心能力的通用需求' },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--ex-text, #fff)' }}>{r.dim}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--ex-muted)', fontSize: '0.8rem' }}>{r.build}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--ex-muted)', fontSize: '0.8rem' }}>{r.buy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ex-callout gold" style={{ marginTop: '0.75rem' }}>
            💡 <strong>黄金法则</strong>：能形成数据飞轮的核心数据（用户反馈、业务反馈）→ 自建。基础设施类（存储、ETL、BI）→ 优先 SaaS。
          </div>
        </div>
      </div>

      {/* Section 6: Compliance */}
      <div className="ex-section">
        <div className="ex-section-title">⚖️ 数据使用合规要点</div>
        <div className="ex-grid-2">
          {[
            { t: '个人信息保护（PIPL/GDPR）', color: '#e74c3c', items: ['客户数据不得未经同意用于 AI 训练', '用户有权要求删除其数据（被遗忘权）', '跨境数据传输需合规审查（数据出境安全评估）', '需要指定数据安全负责人（DSO）', '数据处理目的必须明确且最小必要'] },
            { t: '数据安全法（中国）', color: '#e67e22', items: ['重要数据需在境内存储（数据本地化）', '数据分级管理（核心/重要/一般）', '出境数据需通过安全评估', '互联网数据安全管理义务', '年度数据安全风险评估报告'] },
            { t: 'AI 使用道德规范', color: '#9b59b6', items: ['不得用客户数据训练后卖给竞争对手', '算法决策需要可解释性（金融/医疗）', '禁止用 AI 生成虚假用户评价', '员工监控 AI 需限制并告知', '标注工人的劳动权益保障'] },
            { t: '实际操作建议', color: '#2ecc71', items: ['法务部门提前介入 AI 项目，不是事后审查', '选择有合规承诺的 AI 厂商（SOC2/ISO27001）', '建立内部 AI 使用政策文件（见下方模板）', '定期进行数据合规审计（季度/半年）', '保留数据处理活动的完整审计日志'] },
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

      {/* Section 7: Cost-Benefit Framework */}
      <div className="ex-section">
        <div className="ex-section-title">💰 数据投入的 ROI 框架</div>
        <div className="ex-card">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ex-gold)', marginBottom: '1rem' }}>如何向 CEO 汇报数据投资回报？</div>
          <div className="ex-grid-3">
            {[
              { metric: '直接收入', formula: 'AI 功能驱动的增量收入', example: 'AI 推荐提升客单价 15%，按 1000万 GMV 算 = 150万增量', color: '#2ecc71' },
              { metric: '效率节省', formula: '自动化替代的人力成本', example: '智能客服处理 60% 问题，20 人客服团队 → 节省 8 人 = 80万/年', color: '#38bdf8' },
              { metric: '风险规避', formula: '减少的合规罚款/错误损失', example: 'AI 质检减少 90% 人为失误，避免年均 50万 的客户索赔', color: '#f59e0b' },
              { metric: '决策加速', formula: '缩短的决策周期 × 机会成本', example: '数据驱动决策从 2 周缩至 2 天，先发竞争优势难以量化', color: '#a78bfa' },
              { metric: '数据资产增值', formula: '数据飞轮带来的长期复利', example: '每月新增 10万 标注样本 → 模型精度持续领先竞争对手', color: '#ec4899' },
              { metric: '总投入', formula: '人力 + 工具 + 算力 + 合规成本', example: '首年投入 200-500万（数据团队+平台+算力租赁）', color: '#e74c3c' },
            ].map((m, i) => (
              <div key={i} className="ex-card" style={{ borderLeft: `3px solid ${m.color}`, padding: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: m.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{m.metric}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ex-muted)', marginBottom: '0.4rem', fontStyle: 'italic' }}>{m.formula}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ex-muted)', lineHeight: 1.6 }}>{m.example}</div>
              </div>
            ))}
          </div>
          <div className="ex-callout green" style={{ marginTop: '0.75rem' }}>
            💡 <strong>关键信息</strong>：数据战略的 ROI 通常在 12-18 个月后才显现。需要 CEO 的耐心和持续投入。建议用季度里程碑（而非月度 KPI）来评估数据建设进展。
          </div>
        </div>
      </div>
    </div>
  );
}
