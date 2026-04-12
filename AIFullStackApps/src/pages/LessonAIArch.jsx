import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 01 — AI 全栈架构
   技术选型 / 系统设计 / 成本模型
   ───────────────────────────────────────────── */

const TECH_STACK = [
  { layer: '前端', icon: '🎨', tools: ['Next.js 15 / Nuxt 4', 'TailwindCSS + shadcn/ui', 'Vercel AI SDK', 'react-markdown + KaTeX'], color: '#8b5cf6' },
  { layer: '后端', icon: '⚙️', tools: ['FastAPI (Python)', 'LangChain / LangGraph', 'Celery + Redis', 'WebSocket / SSE'], color: '#06b6d4' },
  { layer: '数据', icon: '💾', tools: ['PostgreSQL + pgvector', 'Redis (缓存/会话)', 'S3 (文档存储)', 'Pinecone / Qdrant (向量)'], color: '#f59e0b' },
  { layer: 'AI/LLM', icon: '🧠', tools: ['OpenAI / Claude / Gemini', 'Ollama (本地开发)', 'LangSmith (Observability)', 'Embedding: text-embedding-3'], color: '#fb7185' },
  { layer: '基础设施', icon: '☁️', tools: ['Docker + K8s', 'Terraform / Pulumi', 'GitHub Actions CI/CD', 'Vercel / Railway / Fly.io'], color: '#22c55e' },
];

const ARCH_PATTERNS = [
  { name: 'Monolith + LLM', icon: '🏠', desc: 'FastAPI 单体 + LLM API 调用', 
    when: 'MVP / 单团队 / <1000 DAU', pros: '开发快、部署简单', cons: '扩展性差', complexity: '低' },
  { name: 'RAG Pipeline', icon: '🔍', desc: '前端 → API → Retriever → LLM → 流式返回',
    when: '知识库问答 / 文档助手', pros: '回答有依据、可引用', cons: '检索质量依赖 chunking', complexity: '中' },
  { name: 'Agent + Tools', icon: '🤖', desc: 'LLM 作为 Orchestrator 调用外部工具',
    when: '复杂任务 / 多步推理', pros: '灵活、可扩展', cons: '延迟高、不可控', complexity: '高' },
  { name: 'Multi-Agent', icon: '🏢', desc: '多 Agent 协作完成复杂工作流',
    when: '企业级 / 端到端自动化', pros: '模块化、各 Agent 专注', cons: '调试难、成本高', complexity: '很高' },
];

const COST_MODEL = [
  { item: 'LLM API (GPT-4o)', unit: '$2.50/M in, $10/M out', monthly1k: '$50-150', monthly10k: '$500-1500', monthly100k: '$5000-15000' },
  { item: 'Embedding', unit: '$0.02/M tokens', monthly1k: '$2', monthly10k: '$10', monthly100k: '$50' },
  { item: '向量数据库 (Pinecone)', unit: '$70/pod/月', monthly1k: '$70', monthly10k: '$140', monthly100k: '$700' },
  { item: 'PostgreSQL (RDS)', unit: 'db.t3.medium', monthly1k: '$35', monthly10k: '$70', monthly100k: '$200' },
  { item: '计算 (API 服务器)', unit: 'Railway / ECS', monthly1k: '$10', monthly10k: '$50', monthly100k: '$200' },
  { item: '总计', unit: '', monthly1k: '~$170', monthly10k: '~$770', monthly100k: '~$6150' },
];

export default function LessonAIArch() {
  const [patIdx, setPatIdx] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge">🧩 module_01 — AI 全栈架构</div>
      <div className="fs-hero">
        <h1>AI 全栈架构：从技术选型到成本模型</h1>
        <p>
          构建 AI 应用不是 "调个 API" 这么简单——你需要设计<strong>前后端分离的流式通信</strong>、
          <strong>向量数据库与关系型数据库的混合架构</strong>、以及精确到每请求的<strong>成本模型</strong>。
          本模块给你一个可以直接用的生产蓝图。
        </p>
      </div>

      {/* ─── 技术选型 ─── */}
      <div className="fs-section">
        <h2 className="fs-section-title">🛠️ 全栈技术选型</h2>
        <div className="fs-grid-2">{TECH_STACK.map((s, i) => (
          <div key={i} className="fs-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <h3 style={{ margin: '0 0 0.5rem', color: s.color, fontSize: '0.95rem' }}>{s.icon} {s.layer}</h3>
            {s.tools.map((t, j) => <div key={j} style={{ fontSize: '0.84rem', color: '#94a3b8', padding: '0.2rem 0' }}>• {t}</div>)}
          </div>
        ))}</div>
      </div>

      {/* ─── 架构模式 ─── */}
      <div className="fs-section">
        <h2 className="fs-section-title">🏗️ 四种 AI 应用架构模式</h2>
        <div className="fs-pills">
          {ARCH_PATTERNS.map((p, i) => (
            <button key={i} className={`fs-btn ${i === patIdx ? 'primary' : ''}`}
              onClick={() => setPatIdx(i)}>
              {p.icon} {p.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#a78bfa' }}>{ARCH_PATTERNS[patIdx].icon} {ARCH_PATTERNS[patIdx].name}</h3>
            <span className="fs-tag purple">复杂度: {ARCH_PATTERNS[patIdx].complexity}</span>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: '0 0 1rem' }}>{ARCH_PATTERNS[patIdx].desc}</p>
          <div className="fs-grid-3">
            <div className="fs-alert info"><strong>📋 适用场景</strong><br/>{ARCH_PATTERNS[patIdx].when}</div>
            <div className="fs-alert success"><strong>✅ 优势</strong><br/>{ARCH_PATTERNS[patIdx].pros}</div>
            <div className="fs-alert warning"><strong>⚠️ 局限</strong><br/>{ARCH_PATTERNS[patIdx].cons}</div>
          </div>
        </div>

        {/* architecture flow */}
        <div className="fs-card" style={{ marginTop: '1rem' }}>
          <h4 style={{ color: '#fbbf24', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>🔄 通用数据流:</h4>
          <div className="fs-flow">
            {[
              { label: '用户', bg: '#8b5cf6' }, { label: 'Next.js', bg: '#0ea5e9' },
              { label: 'FastAPI', bg: '#f97316' }, { label: 'LangChain', bg: '#22c55e' },
              { label: 'Vector DB', bg: '#a78bfa' }, { label: 'LLM API', bg: '#ef4444' },
              { label: 'SSE 流式', bg: '#eab308' },
            ].map((n, i, arr) => (
              <React.Fragment key={i}>
                <div className="fs-flow-node" style={{ background: `${n.bg}22`, border: `1px solid ${n.bg}44`, color: n.bg }}>{n.label}</div>
                {i < arr.length - 1 && <span className="fs-flow-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 成本模型 ─── */}
      <div className="fs-section">
        <h2 className="fs-section-title">💰 月度成本模型 (GPT-4o)</h2>
        <div className="fs-card">
          <table className="fs-table">
            <thead><tr><th>项目</th><th>单价</th><th>1K DAU</th><th>10K DAU</th><th>100K DAU</th></tr></thead>
            <tbody>{COST_MODEL.map((c, i) => (
              <tr key={i} style={c.item === '总计' ? { fontWeight: 700 } : {}}>
                <td><strong style={{ color: c.item === '总计' ? '#f59e0b' : '#a78bfa' }}>{c.item}</strong></td>
                <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{c.unit}</td>
                <td style={{ color: '#94a3b8' }}>{c.monthly1k}</td>
                <td style={{ color: '#94a3b8' }}>{c.monthly10k}</td>
                <td style={{ color: c.item === '总计' ? '#fbbf24' : '#94a3b8' }}>{c.monthly100k}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="fs-alert info">
          <strong>💡 成本优化核心策略：</strong>小模型路由 (简单→GPT-4o-mini)、语义缓存 (重复问题)、
          Streaming 减少超时重试、Prompt 压缩 (减少 token)。可降低 40-60% 成本。
        </div>
      </div>

      <div className="fs-nav">
        <span />
        <button className="fs-btn cyan">智能 ChatBot →</button>
      </div>
    </div>
  );
}
