import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TRANSFORMER_STEPS = [
  { name: '输入嵌入 (Embedding)', icon: '📝', color: '#a78bfa',
    desc: '将 token（词片段）映射为高维向量。GPT-4 使用 ~100K token 词表，每个 token → 12288 维向量（d_model）。',
    formula: 'X = TokenEmbedding(token) + PositionalEncoding(pos)' },
  { name: '多头自注意力 (MHA)', icon: '👁️', color: '#10b981',
    desc: '每个 token 关注序列中所有其他 token 的相关性。Q/K/V 三个矩阵计算注意力分数，多头并行捕获不同语义关系。',
    formula: 'Attention(Q,K,V) = softmax(QK^T / √d_k) · V' },
  { name: '前馈网络 (FFN)', icon: '🧠', color: '#38bdf8',
    desc: '每个位置独立通过两层全连接网络（中间层维度 = 4×d_model）。这是模型"记忆"事实知识的主要位置。',
    formula: 'FFN(x) = max(0, xW₁+b₁)W₂+b₂  (d_ff = 4×d_model)' },
  { name: '层归一化 (LayerNorm)', icon: '⚖️', color: '#f59e0b',
    desc: '每个残差连接后应用 LayerNorm，稳定训练过程。Pre-LN（GPT 风格）比 Post-LN 训练更稳定。',
    formula: 'LayerNorm(x) = γ · (x - μ)/σ + β' },
  { name: '堆叠 N 层', icon: '🏗️', color: '#ec4899',
    desc: 'GPT-3=96层, GPT-4≈120层, Llama-3-70B=80层。层数越深，模型能力越强，但推理成本线性增加。',
    formula: 'GPT-4: ~120 layers, 96 heads, d_model=12288' },
];

const MODEL_COMPARISON = [
  { model: 'GPT-4o',        provider: 'OpenAI',     params: '~200B', ctx: '128K', cost: '$5/1M', best: '通用对话/代码/推理' },
  { model: 'Claude 3.5 Sonnet', provider: 'Anthropic', params: '~70B', ctx: '200K', cost: '$3/1M', best: '长文档分析/安全合规' },
  { model: 'Gemini 1.5 Pro', provider: 'Google',    params: '~340B', ctx: '2M',   cost: '$3.5/1M', best: '超长上下文/多模态' },
  { model: 'Llama-3.1-70B', provider: 'Meta(开源)',  params: '70B',  ctx: '128K', cost: '自托管', best: '开源/本地部署/微调' },
  { model: 'Qwen2.5-72B',   provider: '阿里(开源)',  params: '72B',  ctx: '128K', cost: '自托管', best: '中文能力强/国内合规' },
  { model: 'DeepSeek-V3',   provider: 'DeepSeek',   params: '671B(MoE)', ctx: '64K', cost: '$0.27/1M', best: '极低成本/代码推理' },
];

const SCALING_POINTS = [
  { phase: '预训练 (Pre-training)', desc: '在万亿级 Token 语料上自回归预测下一个 Token，学习语言规律、世界知识和推理能力。通常需要数千 GPU 数月时间。', color: '#a78bfa' },
  { phase: 'SFT 指令微调', desc: '在高质量问答对上监督学习，让模型学会"对话格式"和"遵循指令"。数据质量 >> 数据数量（1000条精标 > 1M条噪声数据）。', color: '#10b981' },
  { phase: 'RLHF/DPO 对齐', desc: '人类偏好数据 + 强化学习，让模型输出更符合人类价值观（无害、无偏、有帮助）。ChatGPT 的核心秘密。', color: '#f59e0b' },
];

export default function LessonLLMCore() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const s = TRANSFORMER_STEPS[activeStep];

  return (
    <div className="lesson-ai">
      <div className="ai-badge">🤖 module_01 — LLM 基础</div>
      <div className="ai-hero">
        <h1>LLM 基础：Transformer 架构与大模型原理</h1>
        <p>所有大模型（GPT-4/Claude/Llama）都基于 <strong>Transformer</strong> 架构。理解注意力机制、预训练到对齐的三阶段流程，帮助你正确使用和定制大模型，而不是把它当黑盒。</p>
      </div>

      {/* Transformer 可视化 */}
      <div className="ai-section">
        <h2 className="ai-section-title">🏗️ Transformer 核心组件（点击逐步学习）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {TRANSFORMER_STEPS.map((step, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              style={{ flex: 1, minWidth: 150, padding: '0.65rem 0.5rem', borderRadius: '9px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.2s',
                border: `1px solid ${activeStep === i ? step.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeStep === i ? `${step.color}12` : 'rgba(255,255,255,0.02)',
                color: activeStep === i ? step.color : '#3b2d6b' }}>
              <div style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>{step.icon}</div>
              {step.name.split(' ')[0]} {step.name.split(' ')[1]}
            </button>
          ))}
        </div>

        <div className="ai-card" style={{ borderColor: `${s.color}30` }}>
          <h3 style={{ color: s.color, fontSize: '1rem', marginBottom: '0.5rem' }}>{s.icon} {s.name}</h3>
          <p style={{ marginBottom: '0.75rem' }}>{s.desc}</p>
          <div style={{ background: '#020010', borderRadius: '7px', padding: '0.625rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: '#c4b5fd', border: `1px solid ${s.color}20` }}>
            {s.formula}
          </div>
        </div>

        {/* 完整架构简图 */}
        <div className="ai-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#3b2d6b', lineHeight: '2', whiteSpace: 'pre' }}>{`
  Input Tokens: ["The", "quick", "brown", "fox"]
       │
       ▼ Token Embedding + Positional Encoding
  [vec₁] [vec₂] [vec₃] [vec₄]   (每个 token → d_model 维向量)
       │
   ┌───┴──────────────× N 层─────────────────────┐
   │  ┌─────────────────────────────────────────┐ │
   │  │  Multi-Head Self-Attention               │ │
   │  │  Q = XWq  K = XWk  V = XWv             │ │
   │  │  Attn = softmax(QK^T/√d_k)V             │ │
   │  └───────────────────────────────┐          │ │
   │  + Residual Connection           │LayerNorm │ │
   │  ┌─────────────────────────────────────────┐ │
   │  │  Feed Forward Network (FFN)              │ │
   │  │  2层线性变换 + ReLU/SiLU激活             │ │
   │  └───────────────────────────────┐          │ │
   │  + Residual Connection           │LayerNorm │ │
   └──────────────────────────────────────────────┘
       │
       ▼ Linear + Softmax
  Next Token Distribution: P(fox|The quick brown) = 0.82 ✓`}</div>
        </div>
      </div>

      {/* 主流模型对比 */}
      <div className="ai-section">
        <h2 className="ai-section-title">📊 主流 LLM 选型对比（2025年）</h2>
        <div className="ai-card">
          <table className="ai-table">
            <thead><tr><th>模型</th><th>提供商</th><th>参数量</th><th>上下文</th><th>价格(输入)</th><th>最适合</th></tr></thead>
            <tbody>
              {MODEL_COMPARISON.map(m => (
                <tr key={m.model}>
                  <td style={{ fontWeight: 700, color: '#a78bfa', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>{m.model}</td>
                  <td style={{ fontSize: '0.78rem' }}>{m.provider}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#10b981' }}>{m.params}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#38bdf8' }}>{m.ctx}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#f59e0b' }}>{m.cost}</td>
                  <td style={{ fontSize: '0.75rem', color: '#3b2d6b' }}>{m.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 三阶段训练 */}
      <div className="ai-section">
        <h2 className="ai-section-title">🔄 大模型三阶段训练流程</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SCALING_POINTS.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.875rem', padding: '1rem', borderRadius: '10px', border: `1px solid ${p.color}25`, background: `${p.color}06` }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${p.color}20`, color: p.color, fontWeight: 900, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: 700, color: p.color, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{p.phase}</div>
                <div style={{ fontSize: '0.8rem', color: '#3b2d6b' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-nav">
        <div />
        <button className="ai-btn primary" onClick={() => navigate('/course/llm-dev/lesson/prompting')}>下一模块：Prompt Engineering →</button>
      </div>
    </div>
  );
}
