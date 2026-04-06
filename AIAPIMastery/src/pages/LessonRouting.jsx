import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ROUTING_CODE = `# LiteLLM：统一三大平台的单一接口

pip install litellm

# ── 1. 统一调用接口（换模型只需改一个参数！）──
from litellm import completion

# OpenAI
resp = completion(model="gpt-4o", messages=[{"role":"user","content":"你好"}])

# Gemini
resp = completion(model="gemini/gemini-2.0-flash", messages=[{"role":"user","content":"你好"}])

# Claude
resp = completion(model="anthropic/claude-3-5-sonnet-20241022", messages=[{"role":"user","content":"你好"}])

# 本地 Ollama（免费！）
resp = completion(model="ollama/llama3.2", messages=[{"role":"user","content":"你好"}], api_base="http://localhost:11434")

# 统一访问方式：resp.choices[0].message.content

# ── 2. 负载均衡（在多个模型间分流）──
from litellm import Router

router = Router(
    model_list=[
        # 主力模型（权重 3）：处理大部分流量
        {
            "model_name": "best-model",
            "litellm_params": {"model": "gpt-4o", "api_key": OPENAI_KEY},
            "tpm": 100000,     # 每分钟 Token 限制
            "weight": 3,
        },
        # 备用模型（权重 1）：超载时接管
        {
            "model_name": "best-model",
            "litellm_params": {"model": "anthropic/claude-3-5-sonnet-20241022"},
            "weight": 1,
        },
    ],
    routing_strategy="least-busy",   # 最低负载路由
)

response = router.completion(model="best-model", messages=[...])

# ── 3. 智能 Fallback（主模型失败自动切换）──
router_with_fallback = Router(
    model_list=[
        {"model_name": "primary",  "litellm_params": {"model": "gpt-4o"}},
        {"model_name": "fallback1","litellm_params": {"model": "anthropic/claude-3-5-sonnet-20241022"}},
        {"model_name": "fallback2","litellm_params": {"model": "gemini/gemini-1.5-pro"}},
    ],
    fallbacks=[{
        "primary": ["fallback1", "fallback2"]  # 按顺序尝试
    }],
    allowed_fails=3,    # 允许主模型失败3次后才切换
    cooldown_time=60,   # 失败冷却期（秒）
)

# GPT-4o 如果返回 429/500，自动尝试 Claude，再试 Gemini
response = router_with_fallback.completion(model="primary", messages=[...])

# ── 4. 按任务路由（选最便宜够用的模型）──
TASK_MODEL_MAP = {
    "simple_qa":      "gpt-4o-mini",      # $0.15/1M—简单问答
    "code_review":    "gpt-4o",           # $2.5/1M—代码任务
    "long_document":  "gemini/gemini-1.5-pro",  # 超长上下文
    "reasoning":      "claude-3-7-sonnet-20250219",  # 推理任务
    "free_tier":      "gemini/gemini-2.0-flash",     # 免费！
}

def smart_route(task: str, prompt: str) -> str:
    model = TASK_MODEL_MAP.get(task, "gpt-4o-mini")
    token_count = len(prompt.split()) * 1.3  # 估算 Token 数
    
    # 超过 100K Token 强制用 Gemini（唯一支持）
    if token_count > 100000:
        model = "gemini/gemini-1.5-pro"
    
    resp = completion(model=model, messages=[{"role":"user","content":prompt}])
    return resp.choices[0].message.content

# ── 5. LiteLLM Proxy Server（团队统一网关）──
# litellm --model gpt-4o --port 8080
# 所有团队成员的代码指向内部网关：
openai_client = openai.OpenAI(base_url="http://internal-gateway:8080/v1")
# 统一计费、限速、日志！`;

const LITELLM_ROUTING_DEMO = [
  { task: '简单问答', model: 'gpt-4o-mini', cost: '$0.15/1M', reason: '够用且最便宜' },
  { task: '代码审阅', model: 'gpt-4o', cost: '$2.50/1M', reason: 'GPT 代码能力强' },
  { task: '长文档(500K tok)', model: 'gemini-1.5-pro', cost: '$1.25/1M', reason: '唯一支持1M上下文' },
  { task: '深度推理', model: 'claude-3-7-sonnet', cost: '$3.00/1M', reason: 'Extended Thinking最强' },
  { task: '高频调用', model: 'gemini-2.0-flash', cost: '$0.10/1M', reason: '最低成本，有免费额度' },
];

export default function LessonRouting() {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(0);
  const item = LITELLM_ROUTING_DEMO[selectedTask];
  const badge = item.model.includes('gpt') ? 'gpt' : item.model.includes('claude') ? 'claude' : 'gemini';

  return (
    <div className="lesson-ai">
      <div className="ai-badge purple">🔀 module_07 — 多模型路由 & 编排</div>
      <div className="ai-hero">
        <h1>多模型路由 & 编排：LiteLLM / Fallback / 智能成本优化</h1>
        <p><strong>LiteLLM</strong> 用一套统一接口调用所有模型，无需学三套 SDK。智能路由让每个任务自动选最合适（且最便宜）的模型，Fallback 确保一个模型限流时自动切换，零停机。</p>
      </div>

      <div className="ai-interactive">
        <h3>🎯 智能任务路由演示（按任务自动选模型）</h3>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {LITELLM_ROUTING_DEMO.map((item, i) => (
            <button key={i} onClick={() => setSelectedTask(i)}
              style={{ flex: 1, minWidth: 100, padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: '0.72rem', fontWeight: selectedTask === i ? 800 : 500, transition: 'all 0.15s',
                border: `1px solid ${selectedTask === i ? '#8b5cf650' : 'rgba(255,255,255,0.07)'}`,
                background: selectedTask === i ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                color: selectedTask === i ? '#a78bfa' : '#64748b' }}>
              {item.task}
            </button>
          ))}
        </div>
        <div style={{ padding: '0.75rem', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '8px', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#475569' }}>任务类型</div>
            <div style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '0.9rem' }}>{item.task}</div>
          </div>
          <div style={{ fontSize: '1.2rem', color: '#334155' }}>→</div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#475569' }}>路由到</div>
            <span className={`ai-tag ${badge}`} style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}>{item.model}</span>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#475569' }}>定价</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, color: '#10b981', fontSize: '0.85rem' }}>{item.cost}</div>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: '0.65rem', color: '#475569' }}>路由理由</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.reason}</div>
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#334155' }}>
          💡 智能路由的核心原则：够用即可（不要为简单任务付高价），上下文决定模型，性价比优先
        </div>
      </div>

      <div className="ai-section">
        <h2 className="ai-section-title">🔧 LiteLLM 完整路由代码</h2>
        <div className="ai-code-wrap">
          <div className="ai-code-head"><div className="ai-code-dot" style={{ background: '#10b981' }}/><div className="ai-code-dot" style={{ background: '#f59e0b' }}/><div className="ai-code-dot" style={{ background: '#8b5cf6' }}/><span style={{ color: '#a78bfa', marginLeft: '0.5rem' }}>🔀 litellm_routing.py</span></div>
          <div className="ai-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{ROUTING_CODE}</div>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/ai-api-mastery/lesson/streaming')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/ai-api-mastery/lesson/production')}>下一模块：生产最佳实践 →</button>
      </div>
    </div>
  );
}
