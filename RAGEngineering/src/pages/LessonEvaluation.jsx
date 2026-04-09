import { useState } from 'react';
import './LessonCommon.css';

const METRICS = [
  { key: 'faithfulness', name: 'Faithfulness（忠实度）', icon: '🎯', color: '#10b981',
    desc: '生成的答案有多少比例能被检索到的上下文所支撑？检测幻觉的核心指标。',
    formula: '|答案中有上下文支撑的语句| / |答案中总语句数|',
    good: '>= 0.85', acceptable: '0.70-0.85', bad: '< 0.70',
    tips: '分数低意味着模型在"创造"答案而非引用。检查：Prompt 约束是否足够强？检索文档是否相关？'},
  { key: 'answer_relevance', name: 'Answer Relevance（答案相关性）', icon: '💡', color: '#0ea5e9',
    desc: '生成的答案与用户问题的相关程度。答案虽然忠实但没有回答问题，也是问题。',
    formula: '通过 LLM 从答案反向生成问题，测量与原问题的相似度',
    good: '>= 0.90', acceptable: '0.75-0.90', bad: '< 0.75',
    tips: '分数低意味着答案偏题。检查：检索结果是否跑偏？Prompt 是否正确理解了用户意图？'},
  { key: 'context_recall', name: 'Context Recall（上下文召回率）', icon: '📚', color: '#f59e0b',
    desc: '参考答案中的信息有多少比例能被检索到的文档覆盖？衡量检索阶段的质量。',
    formula: '|与真实答案对齐的上下文语句| / |真实答案中总语句数|',
    good: '>= 0.80', acceptable: '0.65-0.80', bad: '< 0.65',
    tips: '分数低意味着检索没找到需要的文档。检查：Chunk 策略、向量搜索 k 值、是否需要混合检索。'},
  { key: 'context_precision', name: 'Context Precision（上下文精度）', icon: '🔬', color: '#8b5cf6',
    desc: '检索到的文档中，多少比例是真正有用的？衡量检索噪音。',
    formula: '|检索文档中有用的| / |检索文档总数|',
    good: '>= 0.80', acceptable: '0.60-0.80', bad: '< 0.60',
    tips: '分数低意味着检索引入了大量无关文档，干扰生成。考虑：Reranker、更严格的过滤条件。'},
];

export default function LessonEvaluation() {
  const [metric, setMetric] = useState('faithfulness');
  const m = METRICS.find(x => x.key === metric) ?? {};

  return (
    <div className="rag-lesson">
      <div className="rag-hero">
        <div className="rag-badge">// MODULE 07 · RAGAS EVALUATION</div>
        <h1>RAGAs 评估框架与调优</h1>
        <p>"你的 RAG 够好吗？"不能靠感觉，要靠<strong>量化指标</strong>。RAGAs（RAG Assessment）是目前最广泛使用的 RAG 评估框架，4 个核心指标覆盖检索和生成两个阶段的质量，帮你找到系统的瓶颈。</p>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">📊 RAGAs 四大核心指标</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {METRICS.map(mm => (
            <button key={mm.key} className={`rag-btn ${metric === mm.key ? 'active' : ''}`}
              style={{ borderColor: metric === mm.key ? mm.color : undefined, color: metric === mm.key ? mm.color : undefined }}
              onClick={() => setMetric(mm.key)}>
              {mm.icon} {mm.name.split('（')[0]}
            </button>
          ))}
        </div>
        <div className="rag-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="rag-card" style={{ borderTop: `3px solid ${m.color}` }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: m.color, marginBottom: '0.75rem' }}>{m.icon} {m.name}</div>
            <div style={{ color: 'var(--rag-muted)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1rem' }}>{m.desc}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--rag-muted)', marginBottom: '0.4rem' }}>计算公式：</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: m.color, background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.75rem', borderRadius: 6, lineHeight: 1.7 }}>{m.formula}</div>
          </div>
          <div className="rag-card">
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>分数参考</div>
            {[['✅ 优秀', m.good, '#10b981'], ['⚠️ 可接受', m.acceptable, '#f59e0b'], ['❌ 需优化', m.bad, '#ef4444']].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                <span style={{ color: c }}>{l}</span>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--rag-text)' }}>{v}</span>
              </div>
            ))}
            <div className="rag-tip" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
              🔧 <strong>优化建议：</strong> {m.tips}
            </div>
          </div>
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">🧪 RAGAs 实战代码</div>
        <div className="rag-code-wrap">
          <div className="rag-code-head">
            <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>ragas_evaluation.py</span>
          </div>
          <div className="rag-code">{`# pip install ragas datasets langchain-openai

from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_recall,
    context_precision,
)
from datasets import Dataset

# ━━━━ 准备评估数据集 ━━━━
# 需要：问题 + 参考答案（可以人工标注或从文档中选）
eval_data = {
    "question": [
        "退货政策是什么？",
        "产品保修期多长？",
        "如何联系客服？",
    ],
    "answer": [              # RAG 系统生成的答案
        "七天无理由退货...",
        "整机保修一年...",
        "拨打 400-xxx-xxxx...",
    ],
    "contexts": [            # 检索到的文档列表
        ["退货政策：购买后7天内可无理由退货..."],
        ["质保服务：整机保修一年，配件保修三个月..."],
        ["联系我们：客服热线 400-xxx-xxxx，工作日9-18点"],
    ],
    "ground_truth": [        # 人工标注的标准答案（context_recall 需要）
        "七天无理由退货，收到后7天内发起申请",
        "整机保修1年，配件保修3个月",
        "客服热线 400-xxx-xxxx",
    ],
}

dataset = Dataset.from_dict(eval_data)

# ━━━━ 运行评估 ━━━━
result = evaluate(
    dataset=dataset,
    metrics=[faithfulness, answer_relevancy, context_recall, context_precision],
    llm=ChatOpenAI(model="gpt-4o-mini"),
    embeddings=OpenAIEmbeddings(),
)

print(result)
# {'faithfulness': 0.87, 'answer_relevancy': 0.93,
#  'context_recall': 0.79, 'context_precision': 0.82}

# ━━━━ 自动化 CI 评估（在每次代码变更后运行）━━━━
THRESHOLDS = {
    "faithfulness":     0.85,
    "answer_relevancy": 0.90,
    "context_recall":   0.80,
    "context_precision": 0.80,
}

for metric_name, threshold in THRESHOLDS.items():
    score = result[metric_name]
    status = "✅ PASS" if score >= threshold else "❌ FAIL"
    print(f"{status} {metric_name}: {score:.3f} (threshold: {threshold})")`}</div>
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">🔧 RAG 调优决策树</div>
        <div className="rag-card" style={{ overflowX: 'auto' }}>
          <table className="rag-table">
            <thead><tr><th>症状</th><th>可能原因</th><th>优化方向</th></tr></thead>
            <tbody>
              {[
                ['Faithfulness 低（幻觉多）', 'Prompt 约束不够 / 检索文档质量差', '加强 Prompt 约束 + 提升 Context Precision'],
                ['Answer Relevancy 低（偏题）', '检索结果跑偏 / 问题理解错误', '检查 Embedding 质量 + 用 HyDE/Multi-Query'],
                ['Context Recall 低（漏掉关键文档）', 'Chunking 破坏关键信息 / k 值太小 / 语义匹配失败', '优化 Chunking + 混合检索 + 增大 k'],
                ['Context Precision 低（噪音多）', '向量空间不够精确 / 缺少过滤', '更好的 Embedding 模型 + Reranker + Metadata 过滤'],
                ['整体效果差但指标还行', '测试集覆盖度不足 / 分布偏差', '扩大测试集，增加边界案例'],
              ].map(([s, r, o], i) => (
                <tr key={i}>
                  <td><span className="rag-tag red">{s}</span></td>
                  <td style={{ color: 'var(--rag-muted)', fontSize: '0.83rem' }}>{r}</td>
                  <td style={{ color: 'var(--rag-emerald)', fontSize: '0.83rem' }}>{o}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
