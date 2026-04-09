import { useState } from 'react';
import './LessonCommon.css';

const RISKS = [
  {
    risk: 'AI 幻觉风险', icon: '🌀', level: '高',
    desc: 'LLM 会"自信地说错话"。在医疗诊断、法律建议、财务数据场景，幻觉可能造成直接损失。',
    mitigation: ['人类审核（Human-in-the-Loop）机制', '关键决策场景设置"AI 不得独立决策"规则', '在产品中明显标注"AI 生成内容，请核实"', 'RAG 技术：让 AI 只引用可追溯的文档而非凭空回答'],
    cases: ['律所使用 ChatGPT 生成法律摘要，未经核实提交，援引了不存在的判例（Mata v. Avianca）', '医疗建议类 AI 给出错误药物剂量'],
  },
  {
    risk: '数据泄露风险', icon: '🔓', level: '高',
    desc: '将敏感数据发送给第三方 AI 服务，可能导致数据外泄或被用于训练，违反保密协议或数据保护法。',
    mitigation: ['制定明确的"禁止发送给 AI"数据清单', '使用支持数据不被训练的企业版 API', '金融/医疗等高敏场景考虑私有化部署', '定期员工培训：什么信息不能给 AI 看'],
    cases: ['三星工程师将内部代码和会议记录发给 ChatGPT', '员工将客户 PII 数据粘贴到 AI 工具'],
  },
  {
    risk: '供应商依赖风险', icon: '⛓️', level: '中',
    desc: '过度依赖单一 AI 供应商，一旦涨价、服务中断或政策变化，将陷入被动。',
    mitigation: ['避免在核心功能上单一供应商依赖', '保持 2 个以上备选供应商能力评估', '关键 Prompt 和逻辑在代码层抽象，易于切换', '合同中争取锁定价格和 SLA 条款'],
    cases: ['OpenAI 的 API 价格多次调整', '某服务因违反使用条款被封号，业务中断'],
  },
  {
    risk: '员工抵触风险', icon: '😤', level: '中',
    desc: 'AI 工具落地的最大失败原因是人，而非技术。员工担心被替代或工作流被打乱而拒绝使用。',
    mitigation: ['明确传达：AI 是帮你做枯燥工作，不是替代你', '让基层员工参与 AI 工具的需求定义和测试', '成功案例的持续宣传和激励机制', '给员工时间适应，不要强制立即100%采用'],
    cases: ['印度某大型银行 AI 客服被员工抵制，实际使用率不到20%'],
  },
  {
    risk: '监管合规风险', icon: '📜', level: '中高',
    desc: 'AI 监管法规快速演进，企业需要提前布局，避免合规滞后风险。',
    mitigation: ['指定专人（法务/合规）跟踪 AI 法规动向', '欧盟《AI 法案》对高风险 AI 系统有强制要求', '中国《生成式 AI 服务管理暂行办法》', '金融/医疗行业的 AI 应用审批要求'],
    cases: ['多家银行因 AI 信贷模型存在歧视性被罚款', '意大利暂时封锁 ChatGPT 因隐私合规问题'],
  },
];

export default function LessonRisk() {
  const [riskIdx, setRiskIdx] = useState(0);
  const r = RISKS[riskIdx];

  const levelColor = { '高': '#e74c3c', '中高': '#e67e22', '中': '#f59e0b' };

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 07 · Risk & Compliance</div>
        <h1>AI 风险与合规</h1>
        <p>部署 AI 不可不知的风险边界。管理者的职责不是回避 AI 带来的风险，而是<strong>识别、量化并在可接受范围内管理它</strong>——就像管理任何业务风险一样。</p>
      </div>

      {/* Risk Radar */}
      <div className="ex-section">
        <div className="ex-section-title">⚠️ 五大 AI 风险类型</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {RISKS.map((risk, i) => (
            <button key={i} className={`ex-btn ${riskIdx === i ? 'active' : ''}`}
              style={{ borderColor: riskIdx === i ? levelColor[risk.level] : undefined, color: riskIdx === i ? levelColor[risk.level] : undefined }}
              onClick={() => setRiskIdx(i)}>
              {risk.icon} {risk.risk}
            </button>
          ))}
        </div>
        <div className="ex-grid-2">
          <div className="ex-card">
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{r.risk}</div>
                <span className="ex-tag" style={{ background: `${levelColor[r.level]}18`, color: levelColor[r.level] }}>风险等级：{r.level}</span>
              </div>
            </div>
            <div style={{ color: 'var(--ex-muted)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '1rem' }}>{r.desc}</div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e74c3c', marginBottom: '0.5rem' }}>📰 真实案例：</div>
            {r.cases.map((c, i) => (
              <div key={i} className="ex-callout red" style={{ marginBottom: '0.4rem', padding: '0.5rem 0.75rem', fontSize: '0.83rem' }}>{c}</div>
            ))}
          </div>
          <div className="ex-card">
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#2ecc71' }}>✅ 管控措施：</div>
            {r.mitigation.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.6rem', fontSize: '0.87rem', color: 'var(--ex-muted)', lineHeight: 1.6 }}>
                <span style={{ color: '#2ecc71', flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Policy Template */}
      <div className="ex-section">
        <div className="ex-section-title">📄 企业 AI 使用政策要素（模板）</div>
        <div className="ex-card">
          {[
            { title: '1. 适用范围', content: '本政策适用于所有使用 AI 工具（ChatGPT/Copilot/文心等）处理公司业务的员工。' },
            { title: '2. 禁止行为', content: '• 向 AI 工具发送：客户 PII、未公开财务数据、商业机密、受 NDA 保护的信息\n• 将 AI 生成内容直接发送给客户而不经过人工审核\n• 使用 AI 生成虚假评价、虚假内容' },
            { title: '3. 鼓励行为', content: '• 使用 AI 提升个人生产力（写作、研究、代码辅助）\n• 探索 AI 在工作流中的应用并向团队分享' },
            { title: '4. 审核要求', content: '以下场景 AI 生成内容必须人工审核后方可使用：对外发布内容、法律/合规文件、财务报告、医疗建议' },
            { title: '5. 违规后果', content: '违反本政策视情节轻重予以警告、绩效影响或解除合同处理。' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ex-gold)', marginBottom: '0.35rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--ex-muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{s.content}</div>
            </div>
          ))}
        </div>
        <div className="ex-callout green" style={{ marginTop: '0.75rem' }}>
          💡 建议：在 AI 工具全面推广前，让法务团队审阅此政策。可以从草案开始，3个月更新一次——AI 环境变化太快，不要制定"10年政策"。
        </div>
      </div>
    </div>
  );
}
