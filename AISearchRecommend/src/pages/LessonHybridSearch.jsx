import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['混合检索架构', 'BM25 + Dense', 'Reranking', '生产调优'];

export default function LessonHybridSearch() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🔍 module_03 — 混合检索</div>
      <div className="fs-hero">
        <h1>混合检索：BM25 + Dense + Reranking</h1>
        <p>
          单一检索方式各有盲区——关键词搜索不懂语义，语义搜索漏精确匹配。
          <strong>混合检索</strong>融合 BM25 稀疏检索 + Dense 稠密向量检索，
          再用 <strong>Cross-Encoder Reranker</strong> 精排，召回率可提升 20-40%。
          这是 2025 年生产级搜索的标准范式。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔀 混合检索体系</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 两阶段检索架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> 架构图</div>
                <pre className="fs-code">{`混合检索两阶段架构：

┌─────────────────────────────────────────────────────────┐
│                    用户查询                               │
│              "Python 异步编程最佳实践"                     │
└───────────────────────┬─────────────────────────────────┘
                        ▼
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  ┌──────────┐   ┌──────────┐   ┌──────────────┐
  │ BM25     │   │ Dense    │   │ Sparse       │
  │ 稀疏检索 │   │ 稠密检索 │   │ Learned      │
  │ (ES/Lucene)│ │ (向量库) │   │ (SPLADE)     │
  │ Top 100  │   │ Top 100  │   │ Top 100      │
  └────┬─────┘   └────┬─────┘   └──────┬───────┘
       │              │                │
       └──────────────┼────────────────┘
                      ▼
            ┌─────────────────┐
            │   RRF / 加权融合  │
            │  Reciprocal Rank │
            │   Fusion         │
            │   Top 50         │
            └────────┬────────┘
                     ▼
            ┌─────────────────┐
            │  Cross-Encoder   │
            │   Reranker       │
            │   精排 Top 10    │
            └────────┬────────┘
                     ▼
              最终搜索结果`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ BM25 + Dense 混合实现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> hybrid_search.py</div>
                <pre className="fs-code">{`# —— 生产级混合检索引擎 ——
from rank_bm25 import BM25Okapi
import numpy as np

class HybridSearchEngine:
    """BM25 + Dense 向量的混合检索"""
    
    def __init__(self, embedder, vector_store):
        self.embedder = embedder
        self.vector_store = vector_store
        self.bm25 = None
        self.corpus_map = {}  # id → text
    
    def build_bm25_index(self, documents: list[dict]):
        """构建 BM25 稀疏索引"""
        tokenized = [self._tokenize(d["text"]) for d in documents]
        self.bm25 = BM25Okapi(tokenized)
        self.corpus_map = {d["id"]: d for d in documents}
        self.doc_ids = [d["id"] for d in documents]
    
    def _tokenize(self, text: str) -> list[str]:
        """中英文混合分词"""
        import jieba
        return list(jieba.cut(text.lower()))
    
    async def search(
        self,
        query: str,
        top_k: int = 10,
        alpha: float = 0.5,  # Dense 权重
        method: str = "rrf"  # rrf | weighted
    ) -> list[dict]:
        """
        混合搜索
        alpha: Dense 权重 (0=纯BM25, 1=纯Dense, 0.5=均衡)
        """
        # 1. BM25 稀疏检索
        bm25_scores = self.bm25.get_scores(self._tokenize(query))
        bm25_ranking = np.argsort(bm25_scores)[::-1][:top_k * 3]
        
        # 2. Dense 向量检索
        q_emb = await self.embedder.encode([query])
        dense_results = await self.vector_store.search(
            vector=q_emb[0], top_k=top_k * 3
        )
        
        # 3. 分数融合
        if method == "rrf":
            return self._rrf_fusion(bm25_ranking, dense_results, top_k)
        else:
            return self._weighted_fusion(
                bm25_scores, bm25_ranking,
                dense_results, alpha, top_k
            )
    
    def _rrf_fusion(self, bm25_ranking, dense_results, top_k, k=60):
        """Reciprocal Rank Fusion (RRF)
        
        Score(d) = Σ 1 / (k + rank_i(d))
        k=60 是标准参数
        """
        scores = {}
        
        # BM25 排名得分
        for rank, idx in enumerate(bm25_ranking):
            doc_id = self.doc_ids[idx]
            scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
        
        # Dense 排名得分
        for rank, result in enumerate(dense_results):
            doc_id = result.id
            scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
        
        # 按 RRF 分数排序
        sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [{"id": doc_id, "rrf_score": score} for doc_id, score in sorted_docs[:top_k]]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 Cross-Encoder Reranking</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> reranker.py</div>
                <pre className="fs-code">{`# —— Reranking: 精排提升搜索质量 ——

# ── 1. Cross-Encoder 本地 Reranker ──
from sentence_transformers import CrossEncoder

class LocalReranker:
    def __init__(self, model_name="BAAI/bge-reranker-v2-m3"):
        self.model = CrossEncoder(model_name)
    
    def rerank(self, query: str, documents: list[str], top_k=10):
        """Cross-Encoder 精排: query+doc 拼接后打分"""
        pairs = [[query, doc] for doc in documents]
        scores = self.model.predict(pairs)
        
        ranked = sorted(
            zip(documents, scores),
            key=lambda x: x[1],
            reverse=True
        )
        return [{"text": doc, "score": float(s)} for doc, s in ranked[:top_k]]

# ── 2. Cohere Rerank API ──
import cohere

class CohereReranker:
    def __init__(self):
        self.client = cohere.Client("YOUR_KEY")
    
    def rerank(self, query: str, documents: list[str], top_k=10):
        results = self.client.rerank(
            model="rerank-english-v3.0",
            query=query,
            documents=documents,
            top_n=top_k,
            return_documents=True
        )
        return [{"text": r.document.text, "score": r.relevance_score}
                for r in results.results]

# ── 3. Jina Reranker ──
import requests

class JinaReranker:
    def rerank(self, query, documents, top_k=10):
        resp = requests.post(
            "https://api.jina.ai/v1/rerank",
            headers={"Authorization": "Bearer YOUR_KEY"},
            json={
                "model": "jina-reranker-v2-base-multilingual",
                "query": query,
                "documents": documents,
                "top_n": top_k
            }
        )
        return resp.json()["results"]

# Bi-Encoder vs Cross-Encoder:
# | 特性      | Bi-Encoder    | Cross-Encoder |
# |-----------|---------------|---------------|
# | 速度      | 极快 (预计算)  | 慢 (在线计算)  |
# | 精度      | 较好           | 最好           |
# | 用途      | 粗筛 (召回)    | 精排 (重排序)   |
# | 输入      | 独立编码       | 拼接编码        |`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔧 Alpha 参数调优</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> tuning.py</div>
                <pre className="fs-code">{`# 混合检索 Alpha 参数搜索
from sklearn.model_selection import ParameterGrid

def tune_alpha(engine, test_queries, ground_truth):
    """网格搜索最优 alpha"""
    best_alpha, best_ndcg = 0, 0
    
    for alpha in np.arange(0.0, 1.05, 0.05):
        ndcg_scores = []
        for query, relevant_ids in zip(test_queries, ground_truth):
            results = engine.search(query, alpha=alpha)
            ndcg = compute_ndcg(results, relevant_ids)
            ndcg_scores.append(ndcg)
        
        avg_ndcg = np.mean(ndcg_scores)
        if avg_ndcg > best_ndcg:
            best_ndcg = avg_ndcg
            best_alpha = alpha
    
    return best_alpha, best_ndcg

# 经验值:
# 技术文档搜索: alpha=0.6 (偏 Dense)
# 电商商品搜索: alpha=0.4 (偏 BM25)
# 法律条文检索: alpha=0.3 (精确匹配重要)
# 客服知识库:   alpha=0.7 (语义理解重要)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 SPLADE 学习稀疏</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> splade</div>
                <pre className="fs-code">{`SPLADE: 学习型稀疏检索

传统 BM25:
  "机器学习" → {机器:1, 学习:1}
  
SPLADE (学习稀疏):
  "机器学习" → {
    机器学习: 2.3,
    深度学习: 1.8,  ← 扩展词
    神经网络: 1.5,  ← 扩展词
    人工智能: 1.2,  ← 扩展词
    ML: 0.9,        ← 扩展词
  }

优势:
✅ 利用 BERT 语义能力
✅ 自动查询扩展
✅ 可用倒排索引加速
✅ 可解释性好 (看词权重)
✅ 与 Dense 互补性强

使用:
from transformers import AutoTokenizer, AutoModelForMaskedLM
model = AutoModelForMaskedLM.from_pretrained(
    "naver/splade-v3"
)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
