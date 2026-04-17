import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['三路融合', 'Graph-Enhanced RAG', 'Reranking', '架构设计'];

export default function LessonHybridKGSearch() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🕸️ module_05 — 混合检索引擎</div>
      <div className="fs-hero">
        <h1>混合检索引擎：Vector + Graph + BM25 三路融合</h1>
        <p>
          单一检索方式都有盲区：向量搜索擅长语义但丢失精确匹配，
          BM25 擅长关键词但不理解语义，图搜索擅长关系但不理解自然语言。
          <strong>三路融合</strong>取长补短——用 BM25 抓关键词、向量抓语义、
          图遍历抓关系，最后用 Cross-Encoder 精排，构建工业级知识检索引擎。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔀 混合检索</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 Vector + Graph + BM25 三路融合</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> triple_fusion.py</div>
                <pre className="fs-code">{`# —— 三路融合检索引擎 ——

class TripleFusionSearch:
    """Vector + Graph + BM25 三路融合"""
    
    def __init__(self, vector_store, graph_db, bm25_index):
        self.vector = vector_store    # Qdrant / Pinecone
        self.graph = graph_db         # Neo4j
        self.bm25 = bm25_index        # Elasticsearch
    
    async def search(self, query: str, top_k=10, weights=None):
        """三路并行检索 + RRF 融合"""
        
        w = weights or {"vector": 0.4, "graph": 0.35, "bm25": 0.25}
        
        # ===== 并行执行三路检索 =====
        import asyncio
        
        vector_task = self._vector_search(query, top_k * 3)
        graph_task = self._graph_search(query, top_k * 3)
        bm25_task = self._bm25_search(query, top_k * 3)
        
        vector_results, graph_results, bm25_results = await asyncio.gather(
            vector_task, graph_task, bm25_task
        )
        
        # ===== RRF 融合排序 =====
        fused = self._reciprocal_rank_fusion(
            results_lists=[vector_results, graph_results, bm25_results],
            weights=[w["vector"], w["graph"], w["bm25"]],
            k=60  # RRF 常数
        )
        
        return fused[:top_k]
    
    def _reciprocal_rank_fusion(self, results_lists, weights, k=60):
        """加权 RRF 融合"""
        scores = {}
        
        for results, weight in zip(results_lists, weights):
            for rank, doc in enumerate(results):
                doc_id = doc["id"]
                rrf_score = weight * (1.0 / (k + rank + 1))
                scores[doc_id] = scores.get(doc_id, 0) + rrf_score
        
        # 按融合分数排序
        sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [{"id": doc_id, "score": score} for doc_id, score in sorted_docs]
    
    async def _vector_search(self, query, top_k):
        """语义向量检索"""
        embedding = await self.embed(query)
        return await self.vector.search(embedding, top_k=top_k)
    
    async def _graph_search(self, query, top_k):
        """知识图谱检索: 实体匹配 + 邻域扩展"""
        # 1. 从 query 提取实体
        entities = await self.extract_entities(query)
        
        # 2. 在图中匹配实体
        results = []
        for entity in entities:
            # 模糊匹配 + 向量匹配
            nodes = self.graph.session().run("""
                CALL db.index.vector.queryNodes('entityEmb', 5, $emb)
                YIELD node, score
                WITH node, score
                MATCH (node)-[r]-(neighbor)
                RETURN node, r, neighbor, score
                ORDER BY score DESC
            """, emb=entity["embedding"])
            results.extend(nodes)
        
        return results
    
    async def _bm25_search(self, query, top_k):
        """关键词 BM25 检索"""
        return await self.bm25.search(query, size=top_k)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 Graph-Enhanced RAG</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> graph_enhanced_rag.py</div>
                <pre className="fs-code">{`# —— Graph-Enhanced RAG: 知识图谱增强的 RAG ——

class GraphEnhancedRAG:
    """用知识图谱增强传统 RAG"""
    
    async def answer(self, query: str):
        """图增强 RAG 回答流程"""
        
        # 1. 实体识别
        entities = await self.extract_entities(query)
        # "乔布斯和马斯克谁更有影响力?" → [乔布斯, 马斯克]
        
        # 2. 子图提取 (围绕实体的局部知识)
        subgraph = await self.extract_subgraph(entities, hops=2)
        # 乔布斯 → Apple → iPhone → ...
        # 马斯克 → Tesla → SpaceX → ...
        
        # 3. 图上下文序列化 (Graph → Text)
        graph_context = self.serialize_subgraph(subgraph)
        # "乔布斯 创办了 Apple (1976), Apple 推出了 iPhone (2007)..."
        # "马斯克 创办了 Tesla (2003), SpaceX (2002)..."
        
        # 4. 向量检索补充文本上下文
        text_chunks = await self.vector_search(query, top_k=5)
        
        # 5. 构建增强 Prompt
        prompt = f"""
基于以下知识图谱信息和文档片段回答问题。

== 知识图谱上下文 ==
{graph_context}

== 相关文档 ==
{self.format_chunks(text_chunks)}

问题: {query}

要求:
- 优先使用知识图谱中的结构化信息
- 用文档内容补充细节
- 标注信息来源 [图谱] 或 [文档]
"""
        
        # 6. LLM 生成
        answer = await self.llm.generate(prompt)
        
        return {
            "answer": answer,
            "graph_context": subgraph,
            "text_sources": text_chunks,
            "entities_used": entities
        }
    
    def serialize_subgraph(self, subgraph):
        """将子图序列化为自然语言"""
        lines = []
        for triple in subgraph["triples"]:
            s, p, o = triple["subject"], triple["predicate"], triple["object"]
            attrs = triple.get("attributes", "")
            lines.append(f"• {s} → {p} → {o} {attrs}")
        
        return "\\n".join(lines)

# 效果对比:
# Q: "乔布斯离开Apple后发生了什么?"
# Naive RAG: 可能找不到完整信息链
# Graph RAG: 乔布斯→离开Apple(1985)→创办NeXT→Apple收购NeXT(1997)→回归CEO`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🎯 Graph-Aware Reranking</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> reranking.py</div>
                <pre className="fs-code">{`# Graph-Aware Reranking:
# 用图结构信息增强重排

class GraphAwareReranker:
    """结合图结构的重排序器"""
    
    async def rerank(self, query, candidates, graph):
        """综合多个信号重排序"""
        
        scored = []
        for doc in candidates:
            # 1. 语义相关性 (Cross-Encoder)
            semantic = await self.cross_encoder.score(
                query, doc.text
            )
            
            # 2. 图相关性 (实体覆盖)
            query_entities = self.extract_entities(query)
            doc_entities = doc.metadata.get("entities", [])
            entity_overlap = len(
                set(query_entities) & set(doc_entities)
            ) / max(len(query_entities), 1)
            
            # 3. 图中心性 (PageRank)
            entity_importance = np.mean([
                graph.pagerank.get(e, 0)
                for e in doc_entities
            ]) if doc_entities else 0
            
            # 4. 路径可达性
            path_score = self._path_reachability(
                query_entities, doc_entities, graph
            )
            
            # 5. 综合评分
            final = (
                0.4 * semantic +
                0.25 * entity_overlap +
                0.15 * entity_importance +
                0.2 * path_score
            )
            
            scored.append((doc, final))
        
        return sorted(scored, key=lambda x: x[1], reverse=True)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📐 权重调优</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> 调优指南</div>
                <pre className="fs-code">{`三路融合权重指南:

场景 1: 精确实体查询
"Apple 2024 年 Q3 财报"
└── BM25: 0.5, Vector: 0.3, Graph: 0.2

场景 2: 语义模糊查询
"科技公司创新战略"
└── Vector: 0.5, Graph: 0.3, BM25: 0.2

场景 3: 关系推理查询
"乔布斯和谁有合作关系?"
└── Graph: 0.6, Vector: 0.25, BM25: 0.15

场景 4: 多跳复杂查询
"投资了AI公司的PE基金有哪些?"
└── Graph: 0.7, Vector: 0.2, BM25: 0.1

自动权重学习:
├── 准备标注数据集 (query, relevant_docs)
├── Grid Search 不同权重组合
├── 以 NDCG@10 为优化目标
├── 交叉验证选最优权重
└── 按查询类型动态调整

动态权重 (高级):
├── 用 LLM 分类查询意图
├── 关键词意图 → BM25 权重 ↑
├── 语义意图 → Vector 权重 ↑
├── 关系意图 → Graph 权重 ↑
└── 实时 A/B 测试验证`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 混合检索系统架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> architecture</div>
                <pre className="fs-code">{`混合知识检索系统架构:

┌────────────────────────────────────────────────────┐
│                    用户查询                         │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│              Query 理解层                           │
│  实体识别 → 意图分类 → Query 改写 → 权重决策       │
└────────────────────┬───────────────────────────────┘
                     ▼
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  BM25    │  │  Dense   │  │  Graph   │
│ Elastic  │  │  Vector  │  │  Neo4j   │
│ Search   │  │  Search  │  │Traversal │
│          │  │  ANN     │  │ + SPARQL │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     └──────────────┼──────────────┘
                    ▼
┌────────────────────────────────────────────────────┐
│              融合排序层                              │
│  RRF 加权融合 → 去重 → 上下文组装                   │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│              精排层 (Reranking)                      │
│  Cross-Encoder + Graph-Aware Signals               │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│              生成层 (LLM)                           │
│  结构化图上下文 + 检索文档 → LLM 综合回答          │
└────────────────────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
