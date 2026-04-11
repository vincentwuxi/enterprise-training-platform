import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 04 — LangSmith & Langfuse
   追踪 / 数据集 / 在线评估
   ───────────────────────────────────────────── */

const PLATFORMS = [
  { name: 'LangSmith', icon: '🦜', company: 'LangChain (Harrison Chase)',
    features: ['LLM 调用追踪 (Tracing)', '评估数据集管理', '在线评估 (Online Evaluation)',
      '对比实验 (A/B Experiments)', 'Hub (Prompt 版本管理)', '人工标注界面'],
    pricing: '免费 5K traces/月 → Plus $39/月 → Enterprise',
    integration: 'LangChain / LangGraph / Python / JS / REST API',
    bestFor: '已使用 LangChain 生态的团队' },
  { name: 'Langfuse', icon: '🔍', company: 'Langfuse GmbH (开源)',
    features: ['LLM 追踪 + 成本统计', '评估数据集 + 在线评估', 'Session 级追踪',
      '用户反馈收集', '自部署 (Self-hosted)', 'OpenTelemetry 兼容'],
    pricing: '开源免费 → Cloud: Hobby 免费 → Pro $59/月',
    integration: 'OpenAI SDK / LangChain / LlamaIndex / FastAPI / REST',
    bestFor: '需要自部署或数据不出境的团队' },
  { name: 'Braintrust', icon: '🧠', company: 'Braintrust Data',
    features: ['评估 + 日志 + Prompt Playground', 'CI/CD 集成', '实时评估仪表板',
      'Dataset 版本控制', '多模态支持', 'SSO / RBAC'],
    pricing: '免费 1000 spans/月 → Pro $50/月',
    integration: 'Python / TypeScript / REST / GitHub Actions',
    bestFor: '重视 CI/CD 集成和可视化的团队' },
  { name: 'Arize Phoenix', icon: '🔥', company: 'Arize AI (开源)',
    features: ['LLM 追踪 + Embedding 可视化', '评估 + 检索分析', '本地运行 Notebook 友好',
      '幻觉检测', 'OpenTelemetry 原生', '自部署'],
    pricing: '完全开源免费',
    integration: 'OpenAI / LangChain / LlamaIndex / DSPy',
    bestFor: '研究/实验阶段，需要深度 Embedding 分析' },
];

export default function LessonLangSmith() {
  const [platIdx, setPlatIdx] = useState(0);
  const p = PLATFORMS[platIdx];

  return (
    <div className="lesson-eval">
      <div className="ev-badge">📊 module_04 — LangSmith & Langfuse</div>

      <div className="ev-hero">
        <h1>LLM 可观测性平台：追踪、评估、迭代</h1>
        <p>
          "盲人调参"是 LLM 开发的第一大坑。<strong>可观测性平台</strong>让每一次 LLM 调用
          可追踪、可复现、可评估。本模块对比四大平台，并给出从零接入 LangSmith 和 Langfuse 的完整代码。
        </p>
      </div>

      {/* ─── 平台对比 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🔬 四大平台对比</h2>
        <div className="ev-pills">
          {PLATFORMS.map((p, i) => (
            <button key={i} className={`ev-btn ${i === platIdx ? 'primary' : ''}`}
              onClick={() => setPlatIdx(i)} style={{ fontSize: '0.78rem' }}>
              {p.icon} {p.name}
            </button>
          ))}
        </div>

        <div className="ev-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, color: '#5eead4', fontSize: '1.05rem' }}>{p.icon} {p.name}</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.company}</span>
          </div>
          <div className="ev-grid-3" style={{ marginBottom: '1rem' }}>
            {p.features.map((f, i) => (
              <div key={i} style={{ background: 'rgba(20,184,166,0.04)', border: '1px solid rgba(20,184,166,0.12)', borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                ✅ {f}
              </div>
            ))}
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 0.3rem' }}>💰 <strong style={{ color: '#fde047' }}>定价：</strong>{p.pricing}</p>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 0.3rem' }}>🔗 <strong style={{ color: '#a5b4fc' }}>集成：</strong>{p.integration}</p>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>🎯 <strong style={{ color: '#34d399' }}>适合：</strong>{p.bestFor}</p>
        </div>
      </div>

      {/* ─── LangSmith 接入 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🦜 LangSmith 完整接入</h2>
        <div className="ev-code-wrap">
          <div className="ev-code-head">
            <span className="ev-code-dot" style={{ background: '#ef4444' }} />
            <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
            <span className="ev-code-dot" style={{ background: '#10b981' }} />
            🐍 langsmith_setup.py
          </div>
          <pre className="ev-code">{`# ─── Step 1: 开启追踪 ───
import os
os.environ["LANGSMITH_API_KEY"] = "lsv2_pt_..."
os.environ["LANGSMITH_PROJECT"] = "my-chatbot-v2"
os.environ["LANGSMITH_TRACING"] = "true"

from langsmith import Client
ls = Client()

# ─── Step 2: 追踪 LLM 调用 ───
from langsmith import traceable
from openai import OpenAI
client = OpenAI()

@traceable(name="chat_completion", run_type="llm")
def generate_response(user_input: str, system_prompt: str):
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input},
        ],
        temperature=0.7
    )
    return resp.choices[0].message.content

# ─── Step 3: 创建评估数据集 ───
dataset = ls.create_dataset("qa-eval-v1", description="QA 评估集")
ls.create_examples(
    inputs=[
        {"question": "什么是 RAG？"},
        {"question": "RLHF 和 DPO 的区别？"},
    ],
    outputs=[
        {"answer": "检索增强生成 (RAG) 是将外部知识..."},
        {"answer": "RLHF 使用奖励模型，DPO 直接..."},
    ],
    dataset_id=dataset.id,
)

# ─── Step 4: 运行评估 ───
from langsmith.evaluation import evaluate, LangChainStringEvaluator

def predict(inputs: dict) -> dict:
    answer = generate_response(inputs["question"], "你是一个 AI 专家")
    return {"answer": answer}

results = evaluate(
    predict,
    data="qa-eval-v1",
    evaluators=[
        LangChainStringEvaluator("qa"),         # QA 准确率
        LangChainStringEvaluator("helpfulness"), # 有用性
    ],
    experiment_prefix="gpt4o-v2",
    max_concurrency=4,
)
# 结果自动上传到 LangSmith Dashboard`}</pre>
        </div>
      </div>

      {/* ─── Langfuse 接入 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🔍 Langfuse 完整接入</h2>
        <div className="ev-code-wrap">
          <div className="ev-code-head">
            <span className="ev-code-dot" style={{ background: '#ef4444' }} />
            <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
            <span className="ev-code-dot" style={{ background: '#10b981' }} />
            🐍 langfuse_setup.py
          </div>
          <pre className="ev-code">{`# ─── Langfuse: OpenAI SDK 零侵入接入 ───
from langfuse.openai import openai  # 替换 import

# 所有 OpenAI 调用自动追踪！
response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "什么是评估？"}],
    metadata={                         # 自定义元数据
        "user_id": "user-123",
        "session_id": "session-456",
        "tags": ["production", "qa"],
    }
)

# ─── 附加评分 ───
from langfuse import Langfuse
lf = Langfuse()
lf.score(
    name="user_feedback",
    value=1,                           # 1=好, 0=差
    trace_id=response._langfuse_trace_id,
    comment="用户点击了👍"
)

# ─── 自部署 (Docker Compose) ───
# docker-compose.yml:
# services:
#   langfuse-server:
#     image: langfuse/langfuse:2
#     ports: ["3000:3000"]
#     environment:
#       DATABASE_URL: postgresql://...
#       NEXTAUTH_SECRET: mysecret
#       SALT: mysalt`}</pre>
        </div>
      </div>

      <div className="ev-nav">
        <button className="ev-btn">← LLM-as-Judge</button>
        <button className="ev-btn gold">A/B 测试 →</button>
      </div>
    </div>
  );
}
