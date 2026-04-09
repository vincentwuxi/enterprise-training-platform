import { useState } from 'react';
import './LessonCommon.css';

const TABS = ['hybrid', 'reranker', 'query'];

export default function LessonRetrieval() {
  const [tab, setTab] = useState('hybrid');

  return (
    <div className="rag-lesson">
      <div className="rag-hero">
        <div className="rag-badge">// MODULE 05 · HYBRID RETRIEVAL</div>
        <h1>混合检索 + Reranker 精排</h1>
        <p>纯语义检索会遗漏含有精确关键词的文档；纯关键词检索理解不了同义词和语义。<strong>混合检索 + Reranker</strong> 是目前生产环境 RAG 召回率最优的方案，效果超过单独任何一种。</p>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">🔍 三种检索策略</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[['hybrid', '🔀 混合检索（推荐）'], ['reranker', '📊 Reranker 精排'], ['query', '🔧 查询增强']].map(([k, l]) => (
            <button key={k} className={`rag-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'hybrid' && (
          <div>
            <div className="rag-grid-2" style={{ marginBottom: '0.75rem' }}>
              {[
                { title: '语义检索（Dense）', color: '#10b981', desc: '理解语义，抓住"相似意思"但用词不同的文档', good: ['同义词/近义词', '模糊问题', '上下文理解'], bad: ['精确关键词（产品型号）', '代码/命令', '专有名词'] },
                { title: '关键词检索（BM25）', color: '#0ea5e9', desc: '基于词频，精确匹配特定词汇，不依赖 Embedding', good: ['产品型号/代码', '人名/地名', '精确语句查找'], bad: ['同义词', '拼写错误', '语义相关但词不重叠'] },
              ].map((r, i) => (
                <div key={i} className="rag-card" style={{ borderTop: `3px solid ${r.color}` }}>
                  <div style={{ fontWeight: 700, color: r.color, marginBottom: '0.5rem' }}>{r.title}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--rag-muted)', marginBottom: '0.75rem' }}>{r.desc}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', fontSize: '0.82rem' }}>
                    {r.good.map(g => <div key={g}><span style={{ color: '#10b981' }}>✓ </span><span style={{ color: 'var(--rag-muted)' }}>{g}</span></div>)}
                    {r.bad.map(g => <div key={g}><span style={{ color: '#ef4444' }}>✗ </span><span style={{ color: 'var(--rag-muted)' }}>{g}</span></div>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="rag-code-wrap">
              <div className="rag-code-head">
                <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
                <span style={{ marginLeft: '0.5rem' }}>hybrid_retrieval.py</span>
              </div>
              <div className="rag-code">{`from rank_bm25 import BM25Okapi
import numpy as np

# ━━━━ BM25 关键词检索 ━━━━
class BM25Retriever:
    def __init__(self, documents: list[str]):
        tokenized = [doc.split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized)
        self.docs = documents

    def retrieve(self, query: str, k: int = 20) -> list[tuple]:
        scores = self.bm25.get_scores(query.split())
        top_k_idx = np.argsort(scores)[-k:][::-1]
        return [(self.docs[i], scores[i]) for i in top_k_idx]

# ━━━━ 混合检索 + Reciprocal Rank Fusion ━━━━
def reciprocal_rank_fusion(
    dense_results:  list[tuple],   # (doc, score) from vector DB
    sparse_results: list[tuple],   # (doc, score) from BM25
    k: int = 60,                   # RRF 平滑参数，通常 60
    alpha: float = 0.5,            # dense 权重（0.5 = 均等）
) -> list[tuple]:
    """
    RRF 分数 = alpha / (k + dense_rank) + (1-alpha) / (k + sparse_rank)
    只考虑排名，不考虑原始分数（消除不同量纲问题）
    """
    doc_scores = {}

    for rank, (doc, _) in enumerate(dense_results):
        doc_scores[doc] = doc_scores.get(doc, 0) + alpha / (k + rank + 1)

    for rank, (doc, _) in enumerate(sparse_results):
        doc_scores[doc] = doc_scores.get(doc, 0) + (1 - alpha) / (k + rank + 1)

    return sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)

# ━━━━ 使用示例 ━━━━
bm25_retriever = BM25Retriever(all_documents)

def hybrid_search(query: str, k: int = 5):
    # 语义检索（向量DB）
    dense_results = vectorstore.similarity_search_with_score(query, k=20)
    # BM25 关键词检索
    sparse_results = bm25_retriever.retrieve(query, k=20)
    # RRF 融合排序
    fused = reciprocal_rank_fusion(dense_results, sparse_results)
    return fused[:k]

# 效果提升实验（同一测试集）：
# Dense only:  Recall@5 = 62%
# BM25 only:   Recall@5 = 55%
# Hybrid RRF:  Recall@5 = 78%  ← +16% 提升！`}</div>
            </div>
          </div>
        )}

        {tab === 'reranker' && (
          <div>
            <div className="rag-tip" style={{ marginBottom: '0.75rem' }}>
              💡 <strong>Reranker 的作用：</strong>检索阶段（Recall）快速拿回 Top-20 候选文档，Reranker（Precision）精排后取 Top-5 送入 LLM。双阶段：召回快 + 精排准。
            </div>
            <div className="rag-code-wrap">
              <div className="rag-code-head">
                <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
                <span style={{ marginLeft: '0.5rem' }}>reranker.py</span>
              </div>
              <div className="rag-code">{`# ━━━━ CrossEncoder Reranker（本地，最常用）━━━━
from sentence_transformers import CrossEncoder

# BGE-Reranker 是目前中文效果最好的开源 Reranker
reranker = CrossEncoder('BAAI/bge-reranker-v2-m3', max_length=512)

def rerank(query: str, candidates: list[str], top_k: int = 5) -> list[tuple]:
    """
    CrossEncoder 对每个 (query, doc) 对计算相关性分数
    比 Bi-Encoder 更准确，但速度更慢（不适合大规模检索）
    """
    pairs = [(query, doc) for doc in candidates]
    scores = reranker.predict(pairs, batch_size=32)
    
    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return ranked[:top_k]

# ━━━━ Cohere Rerank API（云端）━━━━
import cohere

co = cohere.Client("your-api-key")

def cohere_rerank(query: str, candidates: list[str], top_k: int = 5):
    results = co.rerank(
        query=query,
        documents=candidates,
        top_n=top_k,
        model="rerank-multilingual-v2.0",  # 支持中文
    )
    return [(r.document["text"], r.relevance_score) for r in results.results]

# ━━━━ 完整两阶段 RAG Pipeline ━━━━
def two_stage_rag(query: str) -> str:
    # 第一阶段：快速检索 Top-20
    candidates = hybrid_search(query, k=20)   # 混合检索
    candidate_texts = [doc for doc, _ in candidates]

    # 第二阶段：Reranker 精排 → Top-5
    reranked = rerank(query, candidate_texts, top_k=5)
    top_docs = [doc for doc, score in reranked]

    # 生成
    context = "\n\n---\n\n".join(top_docs)
    return generate_answer(query, context)

# 效果提升：
# 无 Reranker:     Precision@5 = 74%
# + CrossEncoder:  Precision@5 = 89%  ← +15% 提升！`}</div>
            </div>
          </div>
        )}

        {tab === 'query' && (
          <div className="rag-code-wrap">
            <div className="rag-code-head">
              <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>query_enhancement.py</span>
            </div>
            <div className="rag-code">{`from langchain_openai import ChatOpenAI
from langchain.retrievers.multi_query import MultiQueryRetriever

llm = ChatOpenAI(model="gpt-4o-mini")

# ━━━━ 1. Multi-Query（自动生成多个查询版本）━━━━
# 用 LLM 把用户问题改写成多个角度，合并检索结果
retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    llm=llm,
)
# 输入："怎么退货？"
# LLM 生成：["退货流程是什么？", "如何申请退款？", "订单取消步骤"]
# 三个查询各检索 5 条 → 去重合并 → 最多 15 条候选

# ━━━━ 2. HyDE（假设文档扩展）━━━━
# 先让 LLM 生成一个假设性答案，用答案的向量检索文档
def hyde_retrieve(query: str, k: int = 5) -> list:
    # 生成假设答案（不要求真实，只要语义相关）
    hypothetical_answer = llm.invoke(
        f"请用3-5句话回答这个问题（可以假设）：{query}"
    ).content

    # 用假设答案的向量检索（效果比用问题向量更好）
    results = vectorstore.similarity_search(hypothetical_answer, k=k)
    return results

# ━━━━ 3. 查询分解（复杂问题拆分）━━━━
def decompose_query(query: str) -> list[str]:
    prompt = f"""将以下问题分解为 2-3 个更简单的子问题：
问题：{query}
只返回子问题列表，每行一个："""
    response = llm.invoke(prompt).content
    return [q.strip() for q in response.split("\n") if q.strip()]

# 示例：
# 复杂："比较 A 产品和 B 产品的退货政策，哪个更用户友好？"
# 分解：["A 产品退货政策是什么？", "B 产品退货政策是什么？"]
# 分别检索后合并上下文再生成综合答案`}</div>
          </div>
        )}
      </div>
    </div>
  );
}
