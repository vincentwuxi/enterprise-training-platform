import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 06 — RAG 评估
   RAGAS / 检索质量 / 忠实度 / 端到端评估
   ───────────────────────────────────────────── */

const RAGAS_METRICS = [
  { name: 'Faithfulness', zh: '忠实度', icon: '🎯', range: '0-1',
    desc: '生成的回答是否忠实于检索到的上下文？有没有"编造"不在文档中的信息？',
    formula: '(回答中能被上下文支持的陈述数) / (回答中总陈述数)',
    good: '>0.85', color: '#10b981' },
  { name: 'Answer Relevancy', zh: '答案相关性', icon: '📌', range: '0-1',
    desc: '回答是否真正回答了用户的问题？',
    formula: '生成 N 个反向问题，计算与原始问题的余弦相似度平均值',
    good: '>0.80', color: '#3b82f6' },
  { name: 'Context Precision', zh: '上下文精确度', icon: '🔬', range: '0-1',
    desc: '检索到的文档是否精确？无关文档的比例低吗？',
    formula: '(相关文档排名的加权分数) — 排名靠前的文档权重更大',
    good: '>0.75', color: '#eab308' },
  { name: 'Context Recall', zh: '上下文召回率', icon: '📡', range: '0-1',
    desc: '参考答案中的信息是否都被检索到的文档覆盖了？',
    formula: '(参考答案中被上下文覆盖的陈述数) / (参考答案中总陈述数)',
    good: '>0.80', color: '#8b5cf6' },
];

const RETRIEVAL_METRICS = [
  { name: 'Hit Rate@K', desc: '前 K 个检索结果中是否包含正确文档？', formula: 'has_relevant(top_k) / total_queries', type: '检索' },
  { name: 'MRR (Mean Reciprocal Rank)', desc: '第一个正确文档的排名的倒数的平均值', formula: 'mean(1/rank_of_first_relevant)', type: '检索' },
  { name: 'NDCG@K', desc: '归一化折损累积增益，衡量排序质量', formula: 'DCG@K / IDCG@K', type: '检索' },
  { name: 'Chunk Utilization', desc: '检索到的 Chunk 中，被生成模型实际使用的比例', formula: 'cited_chunks / retrieved_chunks', type: '使用率' },
  { name: 'Noise Robustness', desc: '加入无关文档后，回答质量是否保持稳定？', formula: 'score_with_noise / score_without_noise', type: '鲁棒性' },
];

export default function LessonRAGEval() {
  const [ragasIdx, setRagasIdx] = useState(0);
  const m = RAGAS_METRICS[ragasIdx];

  return (
    <div className="lesson-eval">
      <div className="ev-badge green">📊 module_06 — RAG 评估</div>

      <div className="ev-hero">
        <h1>RAG 评估：检索质量 × 生成质量</h1>
        <p>
          RAG 系统有两个失败点——<strong>检索失败</strong>（找不到或找错文档）和
          <strong>生成失败</strong>（有文档但回答不忠实）。本模块构建完整的 RAG
          评估体系：RAGAS 四大指标 + 检索专项指标 + 端到端评估 Pipeline。
        </p>
      </div>

      {/* ─── RAGAS 指标 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">📐 RAGAS 四大核心指标</h2>
        <div className="ev-pills">
          {RAGAS_METRICS.map((m, i) => (
            <button key={i} className={`ev-btn ${i === ragasIdx ? 'primary' : 'green'}`}
              onClick={() => setRagasIdx(i)} style={{ fontSize: '0.78rem' }}>
              {m.icon} {m.name}
            </button>
          ))}
        </div>

        <div className="ev-card pass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: m.color }}>{m.icon} {m.name} ({m.zh})</h3>
            <span className="ev-tag green">范围: {m.range}</span>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: '0 0 1rem' }}>{m.desc}</p>

          <div className="ev-grid-2">
            <div className="ev-metric">
              <div className="ev-metric-label">计算公式</div>
              <div style={{ fontSize: '0.82rem', color: '#a5b4fc', marginTop: '0.3rem' }}>{m.formula}</div>
            </div>
            <div className="ev-metric">
              <div className="ev-metric-value" style={{ color: m.color }}>{m.good}</div>
              <div className="ev-metric-label">建议阈值</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 检索指标 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🔍 检索专项指标</h2>
        <div className="ev-card">
          <table className="ev-table">
            <thead><tr><th>指标</th><th>说明</th><th>公式</th><th>类型</th></tr></thead>
            <tbody>
              {RETRIEVAL_METRICS.map((r, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#5eead4' }}>{r.name}</strong></td>
                  <td style={{ color: '#94a3b8' }}>{r.desc}</td>
                  <td><code style={{ fontSize: '0.75rem', color: '#fde047' }}>{r.formula}</code></td>
                  <td><span className="ev-tag teal">{r.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── RAGAS 代码 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🐍 RAGAS 实战代码</h2>
        <div className="ev-code-wrap">
          <div className="ev-code-head">
            <span className="ev-code-dot" style={{ background: '#ef4444' }} />
            <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
            <span className="ev-code-dot" style={{ background: '#10b981' }} />
            🐍 ragas_eval.py
          </div>
          <pre className="ev-code">{`# ─── RAGAS 完整评估 Pipeline ───
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# Step 1: 准备评估数据
eval_data = {
    "question": [
        "什么是向量数据库？",
        "RAG 和微调的区别是什么？",
    ],
    "answer": [
        "向量数据库是专门存储和检索高维向量的数据库...",
        "RAG 通过检索外部文档来增强生成，而微调...",
    ],
    "contexts": [
        [["向量数据库是一种专门设计用于存储、索引和查询..."]],
        [["RAG (检索增强生成) 是一种将检索系统与生成模型...",
          "微调是通过在特定数据集上训练来调整模型..."]],
    ],
    "ground_truth": [
        "向量数据库是一种数据库系统，专门用于存储...",
        "RAG 使用外部知识库检索，微调直接修改模型...",
    ],
}

dataset = Dataset.from_dict(eval_data)

# Step 2: 运行评估
result = evaluate(
    dataset=dataset,
    metrics=[
        faithfulness,        # 忠实度
        answer_relevancy,    # 答案相关性
        context_precision,   # 上下文精确度
        context_recall,      # 上下文召回率
    ],
    llm=ChatOpenAI(model="gpt-4o"),
    embeddings=OpenAIEmbeddings(),
)

print(result)
# {'faithfulness': 0.92, 'answer_relevancy': 0.88,
#  'context_precision': 0.81, 'context_recall': 0.85}

# Step 3: 设置门禁
THRESHOLDS = {
    "faithfulness": 0.85,
    "answer_relevancy": 0.80,
    "context_precision": 0.75,
    "context_recall": 0.80,
}
passed = all(result[k] >= v for k, v in THRESHOLDS.items())
print(f"评估{'✅ 通过' if passed else '❌ 未通过'}")`}</pre>
        </div>
      </div>

      {/* ─── 诊断清单 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🩺 RAG 故障诊断清单</h2>
        <div className="ev-grid-2">
          <div className="ev-alert fail">
            <strong>❌ Faithfulness 低</strong><br/>
            → 模型"编造"了检索结果中没有的信息<br/>
            → 解决: 加强 System Prompt（"只基于提供的文档回答"）；降低 temperature
          </div>
          <div className="ev-alert fail">
            <strong>❌ Context Recall 低</strong><br/>
            → 检索器找不到正确文档<br/>
            → 解决: 优化 Embedding 模型 / Chunk 策略 / 重新索引
          </div>
          <div className="ev-alert warning">
            <strong>⚠️ Context Precision 低</strong><br/>
            → 检索到太多无关文档，噪音干扰生成<br/>
            → 解决: 增加 Reranker / 减少 top_k / 优化查询改写
          </div>
          <div className="ev-alert warning">
            <strong>⚠️ Answer Relevancy 低</strong><br/>
            → 回答跑题，没有直接回答用户的问题<br/>
            → 解决: 改进 Prompt（要求直接回答）/ 查询理解模块
          </div>
        </div>
      </div>

      <div className="ev-nav">
        <button className="ev-btn">← A/B 测试</button>
        <button className="ev-btn gold">Agent 评估 →</button>
      </div>
    </div>
  );
}
