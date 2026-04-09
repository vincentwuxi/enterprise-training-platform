import { useState } from 'react';
import './LessonCommon.css';

const ROLES = [
  { role: 'AI 产品经理', icon: '🎯', urgency: '立即招聘',
    desc: '连接业务需求与技术落地，是 AI 项目最关键的角色',
    must: ['理解 LLM 能力边界（会用，无需会写）', '业务分析与需求拆解', '数据感知：会读懂数据分析报告', 'Prompt 工程基础'],
    salary: '50-100万/年', interview: ['描述一个你用 AI 工具解决过的实际问题', '如何定义 AI 项目的成功指标？'] },
  { role: 'AI 工程师 / LLM Engineer', icon: '⚙️', urgency: '优先招聘',
    desc: '负责将 AI 能力集成到产品系统中，是落地执行的主力',
    must: ['Python 编程（熟练）', 'LLM API 调用与 RAG 开发', 'Prompt 工程与 Fine-tuning 基础', '向量数据库（Pinecone/pgvector）'],
    salary: '60-150万/年', interview: ['现场用 Python 调用一个 LLM API 并做流式输出', '设计一个 RAG 系统的架构（白板题）'] },
  { role: '数据工程师', icon: '🏗️', urgency: '必要支撑',
    desc: 'AI 的质量上限由数据质量决定，数据工程师是地基',
    must: ['SQL 熟练，ETL 流程', '数据管道工具（Airflow/dbt）', '数据质量监控', '对业务逻辑有理解'],
    salary: '40-90万/年', interview: ['你如何设计一个保障数据质量的流程？', 'ETL 和 ELT 的区别及适用场景？'] },
  { role: 'AI 产品运营', icon: '📣', urgency: '推广阶段招聘',
    desc: '负责 AI 工具的内部推广、培训和用户反馈收集',
    must: ['内部培训设计', '用户采用率提升策略', '反馈机制与数据收集', '跨部门沟通协调'],
    salary: '30-60万/年', interview: ['如何推动一个阻力较大的新工具在团队内推广？'] },
];

const MANAGEMENT = [
  { q: '如何设定 AI 团队的 OKR？', a: '避免纯技术指标（模型准确率 xx%），聚焦业务结果：\n• O：客服 AI 解决率提升至 70%\n• KR1：月均工单量增长 30% 但人力不增加\n• KR2：用户满意度维持 85% 以上\n• KR3：AI 响应时间＜2秒（覆盖 99%）' },
  { q: '技术 Leader 和业务 Leader 谁主导 AI 项目？', a: '最佳实践：双负责人制。\n• 技术 Leader 负责：可行性评估、技术选型、工程交付\n• 业务 Leader 负责：场景优先级、ROI 定义、用户推广\n• 关键：业务 Leader 是"项目发起人（Sponsor）"，有最终否决权——避免技术自嗨' },
  { q: '如何评估 AI 工程师的能力水平？', a: '分三层评估：\n1. 基础层：能用 API 调通基础 demo（门槛）\n2. 工程层：能设计 RAG 系统、处理生产问题（核心）\n3. 专家层：能做 Fine-tuning 、成本优化（高级）\n\n大多数场景只需要工程层能力，不需要研究员。别为工程问题招研究员，浪费双方时间。' },
  { q: '如果没有预算招 AI 团队，怎么办？', a: '3个低成本路径：\n1. 现有工程师培训（3个月）：效果最有持续性\n2. 外部 AI 咨询公司 POC（3-6月）：速度快，验证可行性\n3. 采购外部 SaaS：没有开发就没有技术债，先跑业务价值\n\n原则：不要在还没验证场景价值前招全职 AI 团队。' },
];

export default function LessonTeam() {
  const [role, setRole] = useState(0);
  const [faqIdx, setFaqIdx] = useState(null);
  const r = ROLES[role];

  return (
    <div className="ex-lesson">
      <div className="ex-hero">
        <div className="ex-module-badge">Module 05 · Team Building</div>
        <h1>组建 AI 团队</h1>
        <p>AI 人才是当前最稀缺的资源。本模块提供：<strong>你真正需要什么人</strong>（而不是被猎头忽悠招错）、如何写出吸引顶尖 AI 人才的 JD、以及 AI 团队的日常管理方法。</p>
      </div>

      {/* Core Insight */}
      <div className="ex-callout gold">
        💡 <strong>最重要的认知：</strong>大多数企业 AI 项目不需要"AI 科学家"，需要的是能<strong>快速落地 AI 应用</strong>的工程师。两者薪资差 2-3 倍，能力需求完全不同。
      </div>

      {/* Roles */}
      <div className="ex-section">
        <div className="ex-section-title">👨‍💼 AI 团队核心角色图谱</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {ROLES.map((r, i) => (
            <button key={i} className={`ex-btn ${role === i ? 'active' : ''}`} onClick={() => setRole(i)}>
              {r.icon} {r.role}
            </button>
          ))}
        </div>
        <div className="ex-grid-2">
          <div className="ex-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.icon} {r.role}</div>
                <div style={{ color: 'var(--ex-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{r.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="ex-tag gold">{r.urgency}</span>
                <div style={{ fontSize: '0.82rem', color: '#2ecc71', marginTop: '0.4rem' }}>{r.salary}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--ex-gold)', marginBottom: '0.5rem' }}>必备能力：</div>
            {r.must.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--ex-muted)' }}>
                <span style={{ color: 'var(--ex-green)' }}>✓</span> {m}
              </div>
            ))}
          </div>
          <div className="ex-card">
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🎤 面试必问问题</div>
            {r.interview.map((q, i) => (
              <div key={i} className="ex-callout blue" style={{ marginBottom: '0.5rem', borderRadius: 6 }}>
                <span style={{ fontWeight: 600, fontSize: '0.87rem' }}>Q：{q}</span>
              </div>
            ))}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--ex-gold)', marginBottom: '0.5rem' }}>⚠️ 红线（直接 Pass）：</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--ex-muted)', lineHeight: 1.7 }}>
                • 只会写 PPT 谈 AI 愿景，无法 Demo<br/>
                • 极具防御性：谈技术细节时含糊其词<br/>
                • 期望从零开始"搭基础设施"，而非快速落地
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management FAQ */}
      <div className="ex-section">
        <div className="ex-section-title">❓ 管理者最常问的 4 个问题</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {MANAGEMENT.map((m, i) => (
            <div key={i} className="ex-card" style={{ cursor: 'pointer' }} onClick={() => setFaqIdx(faqIdx === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.93rem' }}>Q：{m.q}</span>
                <span style={{ color: 'var(--ex-gold)', fontSize: '1.1rem', flexShrink: 0 }}>{faqIdx === i ? '▲' : '▼'}</span>
              </div>
              {faqIdx === i && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--ex-muted)', fontSize: '0.88rem', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                  {m.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Org Structure */}
      <div className="ex-section">
        <div className="ex-section-title">🏢 推荐 AI 团队组织架构</div>
        <div className="ex-card">
          <div className="ex-steps">
            {[
              { phase: '初期（0-6月）：中央化 AI 小组', desc: '3-5 人精英团队，直接向 CTO/CEO 汇报。优先选 2 个高价值场景做 POC，快速验证可行性。避免过早分散到各业务线。' },
              { phase: '成长期（6-18月）：中央 + 嵌入式', desc: '中央团队负责平台能力和最佳实践，同时在战略业务线嵌入 1 名 AI PM。中央团队输出 AI 中台，嵌入团队贴近业务需求。' },
              { phase: '成熟期（18月+）：联邦制', desc: '各业务线有独立 AI 能力，中央只负责共享基础设施（向量数据库、微调平台、安全合规）。最终目标：让 AI 能力成为每个业务线的标配。' },
            ].map((s, i) => (
              <div key={i} className="ex-step">
                <div className="ex-step-num">{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.3rem', color: 'var(--ex-gold)' }}>{s.phase}</div>
                  <div style={{ color: 'var(--ex-muted)', fontSize: '0.86rem', lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
