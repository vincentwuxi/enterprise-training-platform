import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 06 — 推理即服务
   Groq / Together / Fireworks / Replicate
   ───────────────────────────────────────────── */

const PROVIDERS = [
  { name: 'Groq', icon: '⚡', color: '#f97316', tag: '最快延迟',
    hardware: 'LPU (Language Processing Unit) — 定制 ASIC',
    speed: '~800 tok/s (Llama 3.1 70B)',
    pricing: 'Llama 3.1 8B: $0.05/M | 70B: $0.59/M | 405B: $0.80/M',
    models: 'Llama 3.x, Gemma 2, Mixtral, Whisper',
    pros: ['全球最低延迟 (TTFT <100ms)', '价格极具竞争力', 'OpenAI 兼容 API', '免费 tier 慷慨'],
    cons: ['模型选择有限 (仅主流开源)', '上下文限制 (最大 128K)', '不支持微调模型'],
    code: `from groq import Groq

client = Groq(api_key="gsk_xxx")

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain PagedAttention"}
    ],
    temperature=0.7,
    max_tokens=1024,
)
print(response.choices[0].message.content)

# 流式
stream = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Write a poem"}],
    stream=True,
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")` },

  { name: 'Together AI', icon: '🤝', color: '#3b82f6', tag: '最多模型',
    hardware: 'NVIDIA GPU 集群 (A100/H100)',
    speed: '~150 tok/s (Llama 3.1 70B)',
    pricing: 'Llama 3.1 8B: $0.18/M | 70B: $0.88/M | 405B: $5/M',
    models: '200+ 模型: Llama, Qwen, DeepSeek, Mistral, CodeLlama...',
    pros: ['模型最全 (200+)', '支持 Fine-tuning', '支持自定义 LoRA', '专用 Endpoints'],
    cons: ['速度不如 Groq', '大模型价格较高', '冷启动延迟'],
    code: `from together import Together

client = Together(api_key="xxx")

response = client.chat.completions.create(
    model="meta-llama/Llama-3.1-70B-Instruct-Turbo",
    messages=[
        {"role": "user", "content": "What is vLLM?"}
    ],
    max_tokens=512,
    temperature=0.7,
)
print(response.choices[0].message.content)

# Fine-tuning
response = client.fine_tuning.create(
    training_file="file-xxx",
    model="meta-llama/Llama-3.1-8B-Instruct",
    n_epochs=3,
    learning_rate=2e-5,
)` },

  { name: 'Fireworks AI', icon: '🎆', color: '#22c55e', tag: '最佳性价比',
    hardware: 'Optimized GPU cluster + 自有推理引擎 FireAttention',
    speed: '~200 tok/s (Llama 3.1 70B)',
    pricing: 'Llama 3.1 8B: $0.10/M | 70B: $0.90/M | 405B: $3/M',
    models: 'Llama, Qwen, Mixtral, Yi, 支持 LoRA',
    pros: ['FireAttention 引擎', '低成本长上下文', '支持 JSON mode', '函数调用稳定'],
    cons: ['模型数不如 Together', '国内访问不稳定'],
    code: `import fireworks.client
fireworks.client.api_key = "fw_xxx"

response = fireworks.client.ChatCompletion.create(
    model="accounts/fireworks/models/llama-v3p1-70b-instruct",
    messages=[
        {"role": "user", "content": "What is RLHF?"}
    ],
    max_tokens=512,
    temperature=0.7,
)
print(response.choices[0].message.content)` },

  { name: 'Replicate', icon: '🔁', color: '#a78bfa', tag: '最灵活',
    hardware: 'NVIDIA A40/A100 (按秒计费)',
    speed: '~100 tok/s (Llama 3.1 70B)',
    pricing: '按 GPU 秒计费: A40 ~$0.000575/s | A100 ~$0.001150/s',
    models: '任何开源模型 (通过 Cog 打包)',
    pros: ['任何模型都能部署', '按秒计费超灵活', '支持图片/音频/视频模型', 'API 简洁'],
    cons: ['冷启动慢 (首次 10-60s)', 'LLM 速度不如专业平台', '计费不可预测'],
    code: `import replicate

output = replicate.run(
    "meta/meta-llama-3.1-70b-instruct",
    input={
        "prompt": "What is quantization?",
        "max_tokens": 512,
        "temperature": 0.7,
    }
)
# output 是一个生成器
for token in output:
    print(token, end="")` },
];

export default function LessonInferenceAPI() {
  const [provIdx, setProvIdx] = useState(0);
  const p = PROVIDERS[provIdx];

  return (
    <div className="lesson-deploy">
      <div className="dp-badge teal">🚀 module_06 — 推理即服务</div>

      <div className="dp-hero">
        <h1>推理即服务：不用买 GPU 也能跑开源模型</h1>
        <p>
          不想管 GPU 服务器？<strong>推理即服务 (Inference-as-a-Service)</strong> 让你通过 API 
          调用开源模型——按 Token 计费，零运维。本模块对比 <strong>Groq、Together、Fireworks、Replicate</strong> 
          四大平台，帮你找到最适合的方案。
        </p>
      </div>

      {/* ─── 平台选择 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🏢 四大推理平台</h2>
        <div className="dp-pills">
          {PROVIDERS.map((prov, i) => (
            <button key={i} className={`dp-btn ${i === provIdx ? 'primary' : ''}`}
              onClick={() => setProvIdx(i)} style={{ fontSize: '0.78rem' }}>
              {prov.icon} {prov.name}
            </button>
          ))}
        </div>

        <div className="dp-card" style={{ borderLeftColor: p.color, borderLeftWidth: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: p.color }}>{p.icon} {p.name}</h3>
            <span className="dp-tag orange">{p.tag}</span>
          </div>

          <div className="dp-grid-2" style={{ marginBottom: '1rem' }}>
            {[
              ['🖥️ 硬件', p.hardware],
              ['⚡ 速度', p.speed],
              ['💰 定价', p.pricing],
              ['📦 模型', p.models],
            ].map(([label, val], i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{val}</div>
              </div>
            ))}
          </div>

          <div className="dp-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="dp-alert success"><strong>✅ 优势</strong><br/>{p.pros.map((pr, i) => <div key={i}>• {pr}</div>)}</div>
            <div className="dp-alert warning"><strong>⚠️ 局限</strong><br/>{p.cons.map((c, i) => <div key={i}>• {c}</div>)}</div>
          </div>

          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              🐍 {p.name.toLowerCase().replace(/\s/g, '_')}_client.py
            </div>
            <pre className="dp-code">{p.code}</pre>
          </div>
        </div>
      </div>

      {/* ─── 成本对比 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">💰 成本对比 (每百万 Token)</h2>
        <div className="dp-card">
          <table className="dp-table">
            <thead><tr><th>模型</th><th style={{ color: '#f97316' }}>⚡ Groq</th><th style={{ color: '#3b82f6' }}>🤝 Together</th><th style={{ color: '#22c55e' }}>🎆 Fireworks</th><th style={{ color: '#a78bfa' }}>🔁 Replicate</th><th style={{ color: '#94a3b8' }}>🔒 自托管</th></tr></thead>
            <tbody>
              {[
                ['Llama 3.1 8B', '$0.05', '$0.18', '$0.10', '~$0.15', '~$0.02/hr GPU'],
                ['Llama 3.1 70B', '$0.59', '$0.88', '$0.90', '~$0.65', '~$2/hr A100'],
                ['Llama 3.1 405B', '$0.80', '$5.00', '$3.00', 'N/A', '~$12/hr 8×A100'],
              ].map(([model, ...prices], i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#fb923c' }}>{model}</strong></td>
                  {prices.map((price, j) => <td key={j} style={{ color: '#94a3b8' }}>{price}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="dp-alert info">
          <strong>💡 自托管 vs API 的盈亏平衡点：</strong>
          日均 &gt;100M tokens → 自托管更划算。日均 &lt;10M tokens → API 更省心省钱。
        </div>
      </div>

      <div className="dp-nav">
        <button className="dp-btn">← 量化部署</button>
        <button className="dp-btn blue">容器化编排 →</button>
      </div>
    </div>
  );
}
