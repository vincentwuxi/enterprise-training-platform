import { useState } from 'react';
import './LessonCommon.css';

const VENDORS_GLOBAL = [
  { name: 'OpenAI GPT-4o', org: 'OpenAI（微软投资）', strength: '综合能力最强，生态最大', weakness: '价格较高，数据在美国', price: '¥0.03/千token起', best: '通用场景，产品快速原型', compliance: '中等', support: '社区', score: 5 },
  { name: 'Claude 3.5 Sonnet', org: 'Anthropic', strength: '长上下文，安全性最好', weakness: '工具集成略少', price: '¥0.02/千token起', best: '文档分析，合同审查', compliance: '高', support: '企业', score: 4 },
  { name: 'Gemini 2.0 Flash', org: 'Google DeepMind', strength: '速度最快，多模态强', weakness: 'API稳定性待验证', price: '¥0.01/千token起', best: '高频调用，图文混合', compliance: '中等', support: '企业', score: 4 },
];

const VENDORS_CHINA = [
  { name: 'Qwen（通义千问）', org: '阿里云', strength: '中文最强，Alibaba云生态', weakness: '国际化场景略弱', price: '¥0.004/千token起', best: '中文内容，电商场景', compliance: '高（国内合规）', support: '企业级', score: 5 },
  { name: 'DeepSeek-V3', org: 'DeepSeek AI', strength: '性价比极高，开源可私有化', weakness: '服务稳定性需验证', price: '¥0.002/千token起', best: '代码生成，技术场景', compliance: '可私有部署', support: '社区+商业', score: 4 },
  { name: 'Doubao（豆包）', org: '字节跳动', strength: '速度快，与飞书/抖音生态融合', weakness: '逻辑推理稍弱', price: '¥0.0008/千token起', best: '内容创作，办公场景', compliance: '高', support: '企业', score: 4 },
  { name: 'ERNIE 4.0（文心）', org: '百度', strength: '搜索+知识深度，多模态', weakness: '接口易用性待优化', price: '¥0.006/千token起', best: '知识检索，政务场景', compliance: '高', support: '企业级', score: 3 },
];

const BUILD_BUY = [
  { option: '完全自研', cost: '极高（千万级+）', time: '12-24月', control: '完全', maintain: '需自建团队', when: '超大型企业，核心竞争力就是AI能力（如AI公司）', suitable: false },
  { option: '采购 SaaS\n（如 Copilot/Notion AI）', cost: '低（订阅制）', time: '1-4周', control: '无', maintain: '供应商负责', when: '个人或小团队提效，非核心业务流程', suitable: true },
  { option: '基于 API 定制开发', cost: '中（50-500万）', time: '2-6月', control: '高', maintain: '需小型技术团队', when: '✅ 大多数企业的最佳选择', suitable: true },
  { option: '私有化部署开源模型', cost: '中高（100-1000万）', time: '3-12月', control: '最高', maintain: '重', when: '金融/医疗等合规敏感，或数据不可出境', suitable: false },
];

export default function LessonVendor() {
  const [region, setRegion] = useState('china');
  const [selected, setSelected] = useState(null);
  const vendors = region === 'global' ? VENDORS_GLOBAL : VENDORS_CHINA;

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 04 · Vendor Strategy</div>
        <h1>AI 供应商选型</h1>
        <p>市场上 AI 工具眼花缭乱。本模块提供<strong>选型决策框架</strong>：先明确"自研 vs 采购 vs 外包"的战略方向，再从主流厂商中找到最匹配业务需求的组合。</p>
      </div>

      {/* Build vs Buy */}
      <div className="ex-section">
        <div className="ex-section-title">⚖️ 战略选择：自研 vs 采购 vs 外包</div>
        <div className="ex-card" style={{ overflowX: 'auto' }}>
          <table className="ex-table">
            <thead><tr><th>方案</th><th>成本</th><th>上线时间</th><th>控制度</th><th>维护</th><th>适合场景</th></tr></thead>
            <tbody>
              {BUILD_BUY.map((b, i) => (
                <tr key={i} style={{ background: b.option.includes('API') ? 'rgba(212,160,84,0.04)' : undefined }}>
                  <td style={{ fontWeight: 700, whiteSpace: 'pre-line' }}>
                    {b.option.includes('API') && <span className="ex-tag gold" style={{ fontSize: '0.65rem', marginRight: '0.4rem' }}>推荐</span>}
                    {b.option}
                  </td>
                  <td style={{ color: 'var(--ex-muted)', fontSize: '0.84rem' }}>{b.cost}</td>
                  <td style={{ color: 'var(--ex-muted)', fontSize: '0.84rem' }}>{b.time}</td>
                  <td style={{ fontSize: '0.84rem' }}>{b.control}</td>
                  <td style={{ color: 'var(--ex-muted)', fontSize: '0.84rem' }}>{b.maintain}</td>
                  <td style={{ fontSize: '0.83rem', color: b.option.includes('API') ? 'var(--ex-gold)' : 'var(--ex-muted)' }}>{b.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ex-callout gold" style={{ marginTop: '0.75rem' }}>
          💼 <strong>管理者决策建议：</strong>90% 的非 AI 公司应选择"基于 API 定制开发"路径。它在控制度、成本、速度之间取得最佳平衡，且可随时迁移到更好的模型。
        </div>
      </div>

      {/* Vendor Comparison */}
      <div className="ex-section">
        <div className="ex-section-title">🏪 主流大模型厂商横评</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button className={`ex-btn ${region === 'china' ? 'active' : ''}`} onClick={() => setRegion('china')}>🇨🇳 国内厂商</button>
          <button className={`ex-btn ${region === 'global' ? 'active' : ''}`} onClick={() => setRegion('global')}>🌐 国际厂商</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vendors.map((v, i) => (
            <div key={i} className="ex-card"
              style={{ cursor: 'pointer', borderColor: selected === i ? 'rgba(212,160,84,0.4)' : undefined }}
              onClick={() => setSelected(selected === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ex-muted)' }}>{v.org}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ex-muted)' }}>{v.price}</span>
                  <span style={{ color: 'var(--ex-gold)' }}>{'★'.repeat(v.score)}{'☆'.repeat(5 - v.score)}</span>
                  <span style={{ color: 'var(--ex-muted)', fontSize: '1rem' }}>{selected === i ? '▲' : '▼'}</span>
                </div>
              </div>
              {selected === i && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  {[['✅ 优势', v.strength, '#2ecc71'], ['⚠️ 局限', v.weakness, '#e74c3c'], ['🎯 最适场景', v.best, '#d4a054'], ['🔒 合规性', v.compliance, '#4a90d9']].map(([k, val, c]) => (
                    <div key={k}>
                      <div style={{ color: c, fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.3rem' }}>{k}</div>
                      <div style={{ color: 'var(--ex-muted)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selection Checklist */}
      <div className="ex-section">
        <div className="ex-section-title">✅ 供应商尽职调查清单</div>
        <div className="ex-grid-2">
          {[
            { title: '技术能力', items: ['在你的任务类型上测试实际效果（不只看 benchmark）', '延迟和吞吐量是否满足业务需要', '上下文窗口长度（长文档场景）', '多模态需求（图片/语音/视频）'] },
            { title: '商务与合规', items: ['数据主权：训练数据是否会用你的数据？', '数据存储地域（是否符合法规）', 'SLA 协议（可用性 99.9%+）', '价格模式：是否有企业折扣/包量'] },
            { title: '生态与集成', items: ['与现有系统的集成成本（ERP/CRM/飞书）', '开发文档质量和 SDK 完整度', '社区活跃度和案例数量', '是否支持私有化部署选项'] },
            { title: '厂商风险评估', items: ['是否有客户集中风险（依赖一家供应商）', '财务可持续性（不会突然关闭 API）', '价格稳定性（历史涨价记录）', '关键人才流失风险（创始人依赖度）'] },
          ].map((c, i) => (
            <div key={i} className="ex-card">
              <div style={{ fontWeight: 700, color: 'var(--ex-gold)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{c.title}</div>
              {c.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.84rem', color: 'var(--ex-muted)' }}>
                  <span style={{ color: 'var(--ex-gold)', flexShrink: 0 }}>□</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
