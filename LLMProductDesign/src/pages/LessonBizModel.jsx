import { useState } from 'react';
import './LessonCommon.css';

const PRICING_MODELS = [
  {
    key: 'freemium', name: 'Freemium（免费增值）', icon: '🎁',
    desc: '免费提供核心价值，高级功能或使用量付费解锁',
    bestFor: '消费级 C 端、高病毒传播需求',
    examples: 'ChatGPT Free vs Plus / Notion Free vs Team',
    pros: ['获客成本极低', '大用户基数有利于数据飞轮', '口碑传播自然'],
    cons: ['免费用户极少转付费（1-5%）', 'Token 成本被免费用户消耗', '难以支撑高计算成本 AI'],
    ratio: 3,
  },
  {
    key: 'subscription', name: '订阅制（SaaS）', icon: '💳',
    desc: '按月/年付费，解锁功能或用量',
    bestFor: '企业 B2B、稳定工作流需求',
    examples: 'Cursor $20/月 / GitHub Copilot $10/月',
    pros: ['可预期 MRR', '有利于 LTV 计算', '用户倾向长期使用'],
    cons: ['获客成本较高', '需要持续传递价值防 Churn', '价格不能太高需符合感知价值'],
    ratio: 7,
  },
  {
    key: 'usage', name: '按量计费', icon: '📊',
    desc: '按 API 调用次数/Token 数/图片数付费',
    bestFor: '开发者 API 产品、用量差异大的场景',
    examples: 'OpenAI API / AWS Bedrock / Replicate',
    pros: ['轻量上手零门槛', '高用量用户多付', '适合开发者集成'],
    cons: ['收入不可预期', '用量心理障碍（担心超费）', '难以预测 COGS'],
    ratio: 5,
  },
  {
    key: 'enterprise', name: '企业定制合同', icon: '🏢',
    desc: '年度合同、定制部署、SLA 保障',
    bestFor: '大型企业、合规要求高的行业（金融/医疗）',
    examples: 'OpenAI Enterprise / Anthropic 企业版',
    pros: ['单笔合同金额大（$10万+）', '留存率高（部署后难迁移）', '数据安全更可控'],
    cons: ['销售周期长（3-12个月）', '需要专属客户成功团队', '需要 SOC2/ISO27001 认证'],
    ratio: 9,
  },
];

const TOKEN_COST = {
  input_per_1m: 3.0,   // GPT-4o 价格（美元/百万 token）
  output_per_1m: 15.0,
};

export default function LessonBizModel() {
  const [pricing, setPricing] = useState('freemium');
  const [avgInput, setAvgInput] = useState(500);
  const [avgOutput, setAvgOutput] = useState(800);
  const [dau, setDau] = useState(1000);
  const [callsPerUser, setCallsPerUser] = useState(5);

  const dailyInputM = (avgInput * dau * callsPerUser) / 1_000_000;
  const dailyOutputM = (avgOutput * dau * callsPerUser) / 1_000_000;
  const dailyCost = dailyInputM * TOKEN_COST.input_per_1m + dailyOutputM * TOKEN_COST.output_per_1m;
  const monthlyCost = (dailyCost * 30).toFixed(0);
  const costPerUser = ((dailyCost * 30) / dau).toFixed(2);

  const p = PRICING_MODELS.find(x => x.key === pricing);

  return (
    <div className="lp-lesson">
      <div className="lp-container">

        <div className="lp-hero">
          <div className="lp-badge">模块六 · Business Model</div>
          <h1>AI 产品商业模式设计</h1>
          <p>AI 产品的商业模式设计有一个特殊挑战：Token 成本随用量线性增长，而用户感知价值不一定如此。学会计算成本结构、设计定价策略、构建护城河。</p>
        </div>

        <div className="lp-metrics">
          {[{ v: '成本优先', l: 'Token 先算清楚' }, { v: 'LTV>3x', l: 'CAC 健康门槛' }, { v: '数据', l: '最强护城河' }, { v: '免费', l: '是武器不是慈善' }].map(m => (
            <div key={m.l} className="lp-metric-card"><div className="lp-metric-value">{m.v}</div><div className="lp-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Token Cost Calculator */}
        <div className="lp-section">
          <h2>🧮 Token 成本计算器（GPT-4o 定价）</h2>
          <p style={{ color: 'var(--lp-muted)', fontSize: '.88rem', marginBottom: '1.25rem' }}>
            在定价前，先算清楚你的成本结构。调整参数，实时查看月度 Token 成本：
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: `DAU（每日活跃用户）：${dau.toLocaleString()}`, min: 100, max: 50000, val: dau, step: 100, set: setDau },
              { label: `每用户每天调用次数：${callsPerUser}次`, min: 1, max: 50, val: callsPerUser, step: 1, set: setCallsPerUser },
              { label: `平均输入 Token 数：${avgInput}`, min: 100, max: 5000, val: avgInput, step: 100, set: setAvgInput },
              { label: `平均输出 Token 数：${avgOutput}`, min: 100, max: 5000, val: avgOutput, step: 100, set: setAvgOutput },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontSize: '.83rem', color: 'var(--lp-muted)', minWidth: 260 }}>{s.label}</label>
                <input type="range" style={{ flex: 1, accentColor: 'var(--lp-primary)' }}
                  min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(+e.target.value)} />
              </div>
            ))}
          </div>
          <div className="lp-grid-3">
            <div style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--lp-muted)', marginBottom: '.4rem' }}>月度 Token 成本（GPT-4o）</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--lp-primary)' }}>${monthlyCost}</div>
            </div>
            <div style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--lp-muted)', marginBottom: '.4rem' }}>每用户月度成本</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--lp-amber)' }}>${costPerUser}</div>
            </div>
            <div style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--lp-muted)', marginBottom: '.4rem' }}>若定价 $20/月，毛利率</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: costPerUser < 10 ? 'var(--lp-green)' : 'var(--lp-rose)' }}>
                {costPerUser < 20 ? `${Math.round((1 - costPerUser / 20) * 100)}%` : '亏损'}
              </div>
            </div>
          </div>
          <div className="lp-warn">⚠️ <span>当每用户月成本超过定价的 30% 时，商业模式存在风险。此时需要：限流（Free 用户）、缓存（相同问题）、换小模型（非核心功能）、或提升价格。</span></div>
        </div>

        {/* Pricing Models */}
        <div className="lp-section">
          <h2>💰 四种定价模式对比</h2>
          <div className="lp-tabs">
            {PRICING_MODELS.map(m => <button key={m.key} className={`lp-tab${pricing === m.key ? ' active' : ''}`} onClick={() => setPricing(m.key)}>{m.icon} {m.name.split('（')[0]}</button>)}
          </div>
          {p && (
            <div>
              <div className="lp-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="lp-card">
                  <div className="lp-card-title">📌 定义</div>
                  <div className="lp-card-body">{p.desc}</div>
                  <div style={{ marginTop: '.75rem' }}>
                    <div style={{ fontSize: '.78rem', color: 'var(--lp-muted)' }}>最适合：{p.bestFor}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--lp-muted)', marginTop: '.3rem' }}>代表：{p.examples}</div>
                  </div>
                </div>
                <div className="lp-card">
                  <div style={{ marginBottom: '.5rem' }}>
                    <div className="lp-card-title" style={{ color: 'var(--lp-green)' }}>✅ 优点</div>
                    <ul style={{ margin: '.3rem 0 0', paddingLeft: '1.2rem', color: 'var(--lp-muted)', fontSize: '.83rem', lineHeight: 1.9 }}>
                      {p.pros.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="lp-card-title" style={{ color: 'var(--lp-rose)' }}>⚠️ 缺点</div>
                    <ul style={{ margin: '.3rem 0 0', paddingLeft: '1.2rem', color: 'var(--lp-muted)', fontSize: '.83rem', lineHeight: 1.9 }}>
                      {p.cons.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Moat Framework */}
        <div className="lp-section">
          <h2>🏰 AI 产品护城河框架</h2>
          <div className="lp-grid-2">
            {[
              { t: '数据护城河 🥇', d: '私有数据（用户行为/垂直领域标注）是最强壁垒——竞品付不起这个价格，花不起这个时间。强度：最强', color: 'var(--lp-primary)' },
              { t: '工作流绑定 🥈', d: '深度嵌入用户日常工作流，切换成本极高（迁移数据+重新学习）。如 Cursor 的用户要放弃快捷键习惯才能离开。强度：高', color: 'var(--lp-cyan)' },
              { t: '网络效应 🥈', d: '用户越多，产品越好（Midjourney 的风格是社区共同养成的）。或企业内用户越多，协作数据越丰富。强度：高', color: 'var(--lp-amber)' },
              { t: '品牌 & 信任 🥉', d: '垂直领域建立第一心智（"法律问题问Harvey"）。但品牌护城河相对脆弱，产品革新可以打破。强度：中', color: 'var(--lp-green)' },
            ].map((c, i) => (
              <div key={i} className="lp-card" style={{ borderLeft: `3px solid ${c.color}` }}>
                <div className="lp-card-title" style={{ color: c.color }}>{c.t}</div>
                <div className="lp-card-body">{c.d}</div>
              </div>
            ))}
          </div>
          <div className="lp-tip">💡 <span>模型能力<strong>不是护城河</strong>——GPT-4 今天的优势，6个月后可能已是 Claude/Gemini 的标配。AI 产品的壁垒必须建立在数据、工作流绑定或网络效应上。</span></div>
        </div>

      </div>
    </div>
  );
}
