import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Token 成本计算器
const PRICING = {
  'gpt-4o':           { input: 2.50,  output: 10.00, ctx: '128K', badge: 'gpt' },
  'gpt-4o-mini':      { input: 0.15,  output: 0.60,  ctx: '128K', badge: 'gpt' },
  'gpt-4-turbo':      { input: 10.00, output: 30.00, ctx: '128K', badge: 'gpt' },
  'gemini-1.5-pro':   { input: 1.25,  output: 5.00,  ctx: '1M',   badge: 'gemini' },
  'gemini-1.5-flash': { input: 0.075, output: 0.30,  ctx: '1M',   badge: 'gemini' },
  'gemini-2.0-flash': { input: 0.10,  output: 0.40,  ctx: '1M',   badge: 'gemini' },
  'claude-3-5-sonnet':{ input: 3.00,  output: 15.00, ctx: '200K', badge: 'claude' },
  'claude-3-5-haiku': { input: 0.80,  output: 4.00,  ctx: '200K', badge: 'claude' },
  'claude-3-opus':    { input: 15.00, output: 75.00, ctx: '200K', badge: 'claude' },
};

function TokenCalculator() {
  const [model, setModel] = useState('gpt-4o');
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requestsPerDay, setRequestsPerDay] = useState(10000);

  const p = PRICING[model];
  const costPerRequest = (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
  const dailyCost = costPerRequest * requestsPerDay;
  const monthlyCost = dailyCost * 30;

  return (
    <div className="ai-interactive">
      <h3>💰 Token 成本计算器（实时对比三大平台定价）</h3>

      {/* 模型选择 */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {Object.entries(PRICING).map(([m, info]) => (
          <button key={m} onClick={() => setModel(m)}
            className={`ai-btn ${info.badge}`}
            style={{ fontSize: '0.68rem', padding: '0.3rem 0.625rem',
              opacity: model === m ? 1 : 0.4,
              fontWeight: model === m ? 800 : 500,
              transform: model === m ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.15s' }}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* 参数控制 */}
        <div style={{ flex: '0 0 260px' }}>
          {[
            ['输入 Tokens', inputTokens, setInputTokens, 100, 50000, 100],
            ['输出 Tokens', outputTokens, setOutputTokens, 50, 8000, 50],
            ['每日请求数', requestsPerDay, setRequestsPerDay, 100, 500000, 1000],
          ].map(([label, val, setter, min, max, step]) => (
            <div key={label} style={{ marginBottom: '0.625rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>
                <span>{label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#a78bfa', fontWeight: 700 }}>{val.toLocaleString()}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val}
                onChange={e => setter(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>
          ))}
        </div>

        {/* 成本结果 */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.4rem' }}>
            <span className={`ai-tag ${p.badge}`}>{model}</span>
            <span style={{ marginLeft: '0.4rem' }}>· Context: {p.ctx} · Input: ${p.input}/1M · Output: ${p.output}/1M</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              ['每次请求成本', `$${costPerRequest.toFixed(6)}`, costPerRequest > 0.01 ? '#f97316' : '#22c55e'],
              ['每日成本', `$${dailyCost.toFixed(2)}`, dailyCost > 100 ? '#ef4444' : '#f97316'],
              ['每月预估', `$${monthlyCost.toFixed(2)}`, '#8b5cf6'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: `${c}06`, border: `1px solid ${c}20`, borderRadius: '7px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{l}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, color: c, fontSize: '0.9rem' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* 同类模型对比 */}
          <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#334155', lineHeight: 1.7 }}>
            💡 同质量、低成本替代：
            {p.badge === 'gpt' && ' gpt-4o-mini 比 gpt-4o 便宜约 17x，轻量任务首选'}
            {p.badge === 'gemini' && ' gemini-1.5-flash 比 gemini-1.5-pro 便宜 16x，还有 100万 Token 上下文'}
            {p.badge === 'claude' && ' claude-3-5-haiku 比 claude-3-5-sonnet 便宜约 3.75x'}
          </div>
        </div>
      </div>
    </div>
  );
}

const MODELS_OVERVIEW = [
  { provider: 'OpenAI', logo: '🟢', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-o1', 'gpt-o3-mini'], strengths: ['Function Calling 最成熟', 'DALL·E 图像生成', '代码能力强', 'JSON Mode 稳定'], color: '#10b981' },
  { provider: 'Google', logo: '🟠', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-ultra', 'gemma-3'], strengths: ['最长上下文（1M Token）', '免费 Tier 很慷慨', 'Grounding（联网搜索）', '多模态（文/图/音/视）最强'], color: '#f97316' },
  { provider: 'Anthropic', logo: '🟡', models: ['claude-3-5-sonnet', 'claude-3-5-haiku', 'claude-3-opus', 'claude-3-7-sonnet'], strengths: ['200K 超长上下文', 'Extended Thinking（深度推理）', 'Prompt Caching 省成本', '代码 + 长文写作最强'], color: '#f59e0b' },
];

const SETUP_CODE = `# ── 安装三大 SDK ──
pip install openai google-generativeai anthropic

# ── API Key 管理（.env 文件）──
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
GOOGLE_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxx

# ── Python 读取环境变量 ──
from dotenv import load_dotenv
import os

load_dotenv()   # 读取 .env 文件到环境变量

# ── Hello World：三大平台第一次 API 调用 ──
import openai
from google import generativeai as genai
import anthropic

# 1️⃣  OpenAI GPT
client_oai = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])
resp = client_oai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好！请用一句话介绍自己。"}]
)
print("GPT:", resp.choices[0].message.content)
print("Tokens:", resp.usage.total_tokens, "| Cost: ~$", resp.usage.total_tokens * 0.00000015)

# 2️⃣  Google Gemini
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
gem_model = genai.GenerativeModel("gemini-2.0-flash")
resp2 = gem_model.generate_content("你好！请用一句话介绍自己。")
print("Gemini:", resp2.text)

# 3️⃣  Anthropic Claude
client_ant = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
resp3 = client_ant.messages.create(
    model="claude-3-5-haiku-20241022",
    max_tokens=100,
    messages=[{"role": "user", "content": "你好！请用一句话介绍自己。"}]
)
print("Claude:", resp3.content[0].text)

# ── API 响应结构对比 ──
# OpenAI:   resp.choices[0].message.content
# Gemini:   resp.text  (或 resp.candidates[0].content.parts[0].text)
# Claude:   resp.content[0].text`;

export default function LessonBasics() {
  const navigate = useNavigate();

  return (
    <div className="lesson-ai">
      <div className="ai-badge">🤖 module_01 — API 入门基础</div>
      <div className="ai-hero">
        <h1>AI 模型 API 入门：GPT / Gemini / Claude 全平台速览</h1>
        <p>三大 AI 平台各有专长：OpenAI GPT 的 <strong>Function Calling</strong> 最成熟，Google Gemini 支持 <strong>100万 Token 上下文</strong>，Anthropic Claude 的 <strong>200K 上下文</strong> + Extended Thinking 使其在长文档分析和深度推理领域无出其右。</p>
      </div>

      <TokenCalculator />

      <div className="ai-section">
        <h2 className="ai-section-title">🏆 三大平台能力对比</h2>
        <div className="ai-grid-3">
          {MODELS_OVERVIEW.map(p => (
            <div key={p.provider} className="ai-card" style={{ borderColor: `${p.color}22` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{p.logo}</div>
              <div style={{ fontWeight: 900, color: p.color, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{p.provider}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginBottom: '0.5rem' }}>
                {p.models.map(m => <span key={m} className="ai-tag" style={{ background: `${p.color}10`, color: p.color, fontSize: '0.6rem' }}>{m}</span>)}
              </div>
              {p.strengths.map(s => <div key={s} style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.15rem' }}>✦ {s}</div>)}
            </div>
          ))}
        </div>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">🚀 Hello World：三大平台第一次调用</h2>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#10b981' }}/><div className="ai-code-dot" style={{ background: '#f97316' }}/><div className="ai-code-dot" style={{ background: '#f59e0b' }}/><span style={{ color: '#a78bfa', marginLeft: '0.5rem' }}>🤖 hello_ai.py</span></div>
          <div className="ai-code">{SETUP_CODE}</div>
        </div>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">📋 HTTP 响应结构速查</h2>
        <div className="ai-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ai-table">
            <thead><tr><th>字段</th><th>OpenAI</th><th>Gemini</th><th>Claude</th></tr></thead>
            <tbody>
              {[
                ['正文提取', 'choices[0].message.content', 'text / candidates[0]...', 'content[0].text'],
                ['Model 名', 'model', '—（需手工记录）', 'model'],
                ['输入 Token', 'usage.prompt_tokens', 'usage_metadata.prompt_token_count', 'usage.input_tokens'],
                ['输出 Token', 'usage.completion_tokens', 'usage_metadata.candidates_token_count', 'usage.output_tokens'],
                ['Stop 原因', 'choices[0].finish_reason', 'candidates[0].finish_reason', 'stop_reason'],
              ].map(([f, oai, gem, ant]) => (
                <tr key={f}>
                  <td style={{ fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>{f}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#10b981' }}>{oai}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#f97316' }}>{gem}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#f59e0b' }}>{ant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ai-nav">
        <div />
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery/lesson/openai')}>下一模块：OpenAI GPT API →</button>
      </div>
    </div>
  );
}
