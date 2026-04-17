import { useState } from 'react';
import './LessonCommon.css';

const RISKS = [
  {
    risk: 'AI 幻觉风险', icon: '🌀', level: '高', probability: '极高', impact: '高',
    desc: 'LLM 会"自信地说错话"。在医疗诊断、法律建议、财务数据场景，幻觉可能造成直接损失。GPT-4 的幻觉率仍有 3-5%，在关键领域不可接受。',
    mitigation: ['人类审核（Human-in-the-Loop）机制', '关键决策场景设置"AI 不得独立决策"规则', '在产品中明显标注"AI 生成内容，请核实"', 'RAG 技术：让 AI 只引用可追溯的文档而非凭空回答', '设置"置信度阈值"：低置信度时拒绝回答'],
    cases: ['律所使用 ChatGPT 生成法律摘要，未经核实提交，援引了不存在的判例（Mata v. Avianca）', '医疗建议类 AI 给出错误药物剂量', '某金融公司 AI 报告引用不存在的数据源'],
    cost: '法律诉讼 10-100万+, 声誉损失难以估量',
  },
  {
    risk: '数据泄露风险', icon: '🔓', level: '高', probability: '高', impact: '极高',
    desc: '将敏感数据发送给第三方 AI 服务，可能导致数据外泄或被用于训练，违反保密协议或数据保护法。三星半导体代码泄露事件引发全球关注。',
    mitigation: ['制定明确的"禁止发送给 AI"数据清单', '使用支持数据不被训练的企业版 API', '金融/医疗等高敏场景考虑私有化部署', '定期员工培训：什么信息不能给 AI 看', 'DLP（数据防泄漏）工具拦截敏感内容'],
    cases: ['三星工程师将内部代码和会议记录发给 ChatGPT', '员工将客户 PII 数据粘贴到 AI 工具', '某咨询公司客户项目资料被上传到 AI 平台'],
    cost: '合规罚款 100-1000万+, 客户信任丧失',
  },
  {
    risk: '供应商依赖风险', icon: '⛓️', level: '中', probability: '中', impact: '中高',
    desc: '过度依赖单一 AI 供应商，一旦涨价、服务中断或政策变化，将陷入被动。OpenAI 的 API 定价已多次调整，部分行业被禁止使用。',
    mitigation: ['避免在核心功能上单一供应商依赖', '保持 2 个以上备选供应商能力评估', '关键 Prompt 和逻辑在代码层抽象，易于切换', '合同中争取锁定价格和 SLA 条款', '关键场景准备开源模型备选方案'],
    cases: ['OpenAI 的 API 价格多次调整', '某服务因违反使用条款被封号，业务中断', 'Google Bard API 突然下线某功能'],
    cost: '业务中断 1-7 天, 迁移成本 20-50万',
  },
  {
    risk: '员工抵触风险', icon: '😤', level: '中', probability: '高', impact: '中',
    desc: 'AI 工具落地的最大失败原因是人，而非技术。员工担心被替代或工作流被打乱而拒绝使用。Gartner 调查显示 47% 的 AI 项目因组织阻力失败。',
    mitigation: ['明确传达：AI 是帮你做枯燥工作，不是替代你', '让基层员工参与 AI 工具的需求定义和测试', '成功案例的持续宣传和激励机制', '给员工时间适应，不要强制立即100%采用', '设立 AI Champion 角色：每个部门选 1-2 人先行试用'],
    cases: ['印度某大型银行 AI 客服被员工抵制，实际使用率不到20%', '某制造企业 AI 质检上线后，质检员集体投诉"被监控"'],
    cost: 'AI 项目 ROI 为零, 团队士气受损',
  },
  {
    risk: '监管合规风险', icon: '📜', level: '中高', probability: '中高', impact: '高',
    desc: 'AI 监管法规快速演进，企业需要提前布局，避免合规滞后风险。EU AI Act 已于2025年全面生效，中国《生成式AI服务管理暂行办法》2023年实施。',
    mitigation: ['指定专人（法务/合规）跟踪 AI 法规动向', '欧盟《AI 法案》对高风险 AI 系统有强制要求', '中国《生成式 AI 服务管理暂行办法》', '金融/医疗行业的 AI 应用审批要求', '建立 AI 系统的风险分级与备案制度'],
    cases: ['多家银行因 AI 信贷模型存在歧视性被罚款', '意大利暂时封锁 ChatGPT 因隐私合规问题', '欧盟对 Meta AI 训练数据发出禁令'],
    cost: '罚款按收入 2-6% 计算, 最高数亿',
  },
];

const RISK_MATRIX = [
  { name: 'AI 幻觉', x: 90, y: 75, color: '#e74c3c' },
  { name: '数据泄露', x: 70, y: 90, color: '#e74c3c' },
  { name: '供应商依赖', x: 50, y: 60, color: '#e67e22' },
  { name: '员工抵触', x: 75, y: 45, color: '#f59e0b' },
  { name: '监管合规', x: 60, y: 75, color: '#e67e22' },
];

export default function LessonRisk() {
  const [riskIdx, setRiskIdx] = useState(0);
  const r = RISKS[riskIdx];

  const levelColor = { '高': '#e74c3c', '中高': '#e67e22', '中': '#f59e0b', '极高': '#dc2626' };

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 07 · Risk & Compliance</div>
        <h1>AI 风险与合规</h1>
        <p>部署 AI 不可不知的风险边界。管理者的职责不是回避 AI 带来的风险，而是<strong>识别、量化并在可接受范围内管理它</strong>——就像管理任何业务风险一样。</p>
      </div>

      {/* Section 1: Risk Radar */}
      <div className="ex-section">
        <div className="ex-section-title">⚠️ 五大 AI 风险深度解析</div>
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
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <span className="ex-tag" style={{ background: `${levelColor[r.level]}18`, color: levelColor[r.level] }}>等级: {r.level}</span>
                  <span className="ex-tag" style={{ background: 'rgba(231,76,60,0.08)', color: '#e74c3c' }}>概率: {r.probability}</span>
                  <span className="ex-tag" style={{ background: 'rgba(243,156,18,0.08)', color: '#f39c12' }}>影响: {r.impact}</span>
                </div>
              </div>
            </div>
            <div style={{ color: 'var(--ex-muted)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '1rem' }}>{r.desc}</div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e74c3c', marginBottom: '0.5rem' }}>📰 真实案例：</div>
            {r.cases.map((c, i) => (
              <div key={i} className="ex-callout red" style={{ marginBottom: '0.4rem', padding: '0.5rem 0.75rem', fontSize: '0.83rem' }}>{c}</div>
            ))}
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(231,76,60,0.06)', borderRadius: '6px', border: '1px solid rgba(231,76,60,0.15)', fontSize: '0.82rem', color: '#e74c3c' }}>
              💸 <strong>潜在损失：</strong>{r.cost}
            </div>
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

      {/* Section 2: Risk Matrix Visualization */}
      <div className="ex-section">
        <div className="ex-section-title">🎯 AI 风险矩阵</div>
        <div className="ex-card">
          <div style={{ position: 'relative', width: '100%', paddingBottom: '60%', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Grid lines */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            {/* Quadrant labels */}
            <div style={{ position: 'absolute', left: '15%', top: '15%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', fontWeight: 600 }}>低概率 高影响</div>
            <div style={{ position: 'absolute', right: '10%', top: '15%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', fontWeight: 600 }}>高概率 高影响</div>
            <div style={{ position: 'absolute', left: '15%', bottom: '15%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', fontWeight: 600 }}>低概率 低影响</div>
            <div style={{ position: 'absolute', right: '10%', bottom: '15%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', fontWeight: 600 }}>高概率 低影响</div>
            {/* Axis labels */}
            <div style={{ position: 'absolute', left: '50%', bottom: '2%', transform: 'translateX(-50%)', fontSize: '0.72rem', color: 'var(--ex-muted)' }}>发生概率 →</div>
            <div style={{ position: 'absolute', left: '2%', top: '50%', transform: 'rotate(-90deg) translateX(-50%)', fontSize: '0.72rem', color: 'var(--ex-muted)', transformOrigin: 'left center' }}>影响程度 →</div>
            {/* Risk dots */}
            {RISK_MATRIX.map((rm, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${rm.x}%`, bottom: `${100 - rm.y}%`,
                transform: 'translate(-50%, 50%)', textAlign: 'center', cursor: 'pointer',
              }} onClick={() => setRiskIdx(i)}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%', background: rm.color,
                  boxShadow: `0 0 12px ${rm.color}60`, margin: '0 auto 4px',
                  border: riskIdx === i ? '2px solid #fff' : 'none',
                  transform: riskIdx === i ? 'scale(1.4)' : 'scale(1)', transition: 'all 0.2s',
                }} />
                <div style={{ fontSize: '0.68rem', color: rm.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{rm.name}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ex-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            点击风险点可切换上方详情 | 右上象限（高概率+高影响）需要<strong style={{ color: '#e74c3c' }}>立即行动</strong>
          </div>
        </div>
      </div>

      {/* Section 3: Regulatory Landscape */}
      <div className="ex-section">
        <div className="ex-section-title">🌍 全球 AI 监管地图</div>
        <div className="ex-card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ex-border, rgba(255,255,255,0.08))' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--ex-text, #fff)' }}>地区/法规</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', color: 'var(--ex-text, #fff)' }}>生效时间</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--ex-text, #fff)' }}>核心要求</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', color: 'var(--ex-text, #fff)' }}>罚则</th>
              </tr>
            </thead>
            <tbody>
              {[
                { reg: '🇪🇺 EU AI Act', time: '2025', req: '高风险 AI 系统需注册、审计、人工监督', penalty: '3500万€ 或 7% 收入' },
                { reg: '🇨🇳 生成式AI管理办法', time: '2023.8', req: '备案制、内容安全审查、训练数据合法性', penalty: '依法予以处罚' },
                { reg: '🇨🇳 算法推荐管理规定', time: '2022.3', req: '透明度、用户关闭权、反大数据杀熟', penalty: '停业整顿' },
                { reg: '🇺🇸 行政命令 14110', time: '2023.10', req: '安全测试报告、红队评估、水印标记', penalty: '联邦合同限制' },
                { reg: '🇬🇧 AI Safety Institute', time: '2023', req: '前沿模型安全评估、自愿承诺', penalty: '行业自律' },
                { reg: '🌐 OECD AI 原则', time: '2019', req: '透明、公平、可问责、安全', penalty: '无强制力' },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--ex-text, #fff)' }}>{r.reg}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--ex-muted)' }}>{r.time}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--ex-muted)' }}>{r.req}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: '#e74c3c', fontWeight: 600, fontSize: '0.78rem' }}>{r.penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: AI Policy Template */}
      <div className="ex-section">
        <div className="ex-section-title">📄 企业 AI 使用政策模板</div>
        <div className="ex-card">
          {[
            { title: '1. 适用范围', content: '本政策适用于所有使用 AI 工具（ChatGPT/Copilot/文心/通义等）处理公司业务的员工、外包人员和合作方。', icon: '📋' },
            { title: '2. 禁止行为', content: '• 向外部 AI 工具发送：客户 PII、未公开财务数据、商业机密、受 NDA 保护的信息\n• 将 AI 生成内容直接发送给客户而不经过人工审核\n• 使用 AI 生成虚假评价、虚假内容\n• 让 AI 执行超出其能力范围的决策（如独立审批贷款）', icon: '🚫' },
            { title: '3. 鼓励行为', content: '• 使用 AI 提升个人生产力（写作、研究、代码辅助、数据分析）\n• 探索 AI 在工作流中的应用并向团队分享\n• 记录 AI 使用中的问题和改进建议', icon: '✅' },
            { title: '4. 审核要求', content: '以下场景 AI 生成内容必须人工审核后方可使用：\n• 对外发布内容（营销、新闻稿、公告）\n• 法律/合规文件（合同条款、隐私政策）\n• 财务报告（数据必须从源系统核实）\n• 医疗/安全建议（需持照专业人员复核）', icon: '🔍' },
            { title: '5. 数据分级', content: '• 🔴 禁止级：客户 PII、交易数据、薪资信息 → 严禁发送给任何外部 AI\n• 🟡 受限级：内部战略文档、未发布产品 → 仅限企业版 AI 工具（API 模式）\n• 🟢 公开级：已发布产品信息、公开数据 → 可使用任何 AI 工具', icon: '🏷️' },
            { title: '6. 违规后果', content: '违反本政策视情节轻重予以警告、绩效影响或解除合同处理。数据泄露事件将启动安全事件响应流程。', icon: '⚖️' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '0.75rem 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1rem' }}>{s.icon}</span>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ex-gold)' }}>{s.title}</div>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--ex-muted)', lineHeight: 1.7, whiteSpace: 'pre-line', paddingLeft: '1.5rem' }}>{s.content}</div>
            </div>
          ))}
        </div>
        <div className="ex-callout green" style={{ marginTop: '0.75rem' }}>
          💡 建议：在 AI 工具全面推广前，让法务团队审阅此政策。可以从草案开始，<strong>3个月更新一次</strong>——AI 环境变化太快，不要制定"10年政策"。
        </div>
      </div>

      {/* Section 5: Risk Response Playbook */}
      <div className="ex-section">
        <div className="ex-section-title">🚨 AI 事件响应手册</div>
        <div className="ex-card">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ex-gold)', marginBottom: '1rem' }}>当 AI 出事时，应按以下步骤响应：</div>
          <div className="ex-steps">
            {[
              { phase: 'T+0h: 发现 & 遏制', desc: '立即下线出问题的 AI 功能，切换到人工备选方案。通知事件负责人（IT 安全 + 法务 + 业务线负责人）。', color: '#e74c3c' },
              { phase: 'T+2h: 评估 & 通报', desc: '评估影响范围：受影响用户数、泄露数据范围、是否涉及客户 PII。必要时向监管机构报告（GDPR 要求 72 小时内）。', color: '#e67e22' },
              { phase: 'T+24h: 根因分析', desc: '完成初步根因分析（RCA）：是模型幻觉？数据泄露？Prompt 注入攻击？失败的安全护栏？形成初步报告。', color: '#f59e0b' },
              { phase: 'T+72h: 修复 & 恢复', desc: '实施修复措施（更新护栏、修补漏洞、增加审核流程），经测试验证后恢复服务。发布面向受影响用户的通知。', color: '#38bdf8' },
              { phase: 'T+2w: 复盘 & 改进', desc: '召开事件复盘会议，更新 AI 使用政策、风险登记册和应急预案。将经验写入内部知识库。', color: '#2ecc71' },
            ].map((s, i) => (
              <div key={i} className="ex-step">
                <div className="ex-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color, fontSize: '0.7rem', width: '2.2rem', height: '2.2rem' }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: s.color, marginBottom: '0.3rem' }}>{s.phase}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--ex-muted)', lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
