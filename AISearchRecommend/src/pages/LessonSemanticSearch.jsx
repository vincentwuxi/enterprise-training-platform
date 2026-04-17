import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Embedding 原理', '相似度计算', '检索管线', 'Embedding 优化'];

export default function LessonSemanticSearch() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge">🔍 module_01 — 语义搜索基础</div>
      <div className="fs-hero">
        <h1>语义搜索：从关键词到理解意图</h1>
        <p>
          传统搜索靠关键词匹配，语义搜索靠<strong>理解含义</strong>。核心技术是
          <strong>Embedding</strong>——将文本/图片/代码映射到高维向量空间，
          让"机器学习"和"深度学习"在数学上靠近。本模块覆盖 Embedding 模型选型、
          相似度计算、端到端检索管线构建。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📐 核心概念</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧠 文本 Embedding 模型对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> embedding_models.py</div>
                <pre className="fs-code">{`# —— 主流 Embedding 模型对比与使用 ——
from openai import OpenAI
import google.generativeai as genai
from sentence_transformers import SentenceTransformer

# ── 1. OpenAI text-embedding-3 ──
client = OpenAI()
def openai_embed(texts: list[str], model="text-embedding-3-large"):
    """OpenAI Embedding: 3072 维, 支持缩维"""
    resp = client.embeddings.create(
        input=texts,
        model=model,
        dimensions=1024  # 可缩至 256/512/1024
    )
    return [e.embedding for e in resp.data]

# ── 2. Google Gemini Embedding ──
def gemini_embed(texts: list[str]):
    """Gemini Embedding: 768 维, 支持 task_type"""
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=texts,
        task_type="RETRIEVAL_DOCUMENT"  # 或 RETRIEVAL_QUERY
    )
    return result['embedding']

# ── 3. 开源: Sentence Transformers ──
model = SentenceTransformer('BAAI/bge-large-en-v1.5')
def local_embed(texts: list[str]):
    """BGE-Large: 1024 维, MTEB 榜单 Top"""
    return model.encode(texts, normalize_embeddings=True)

# ── 4. Cohere Embed v3 ──
import cohere
co = cohere.Client("YOUR_KEY")
def cohere_embed(texts: list[str]):
    """Cohere: 1024 维, 支持 input_type"""
    resp = co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document"  # 或 search_query
    )
    return resp.embeddings

# ── 模型对比 ──
# | 模型                      | 维度  | MTEB  | 成本         |
# |---------------------------|-------|-------|-------------|
# | text-embedding-3-large    | 3072  | 64.6  | $0.13/1M tok |
# | text-embedding-004        | 768   | 66.0  | 免费额度      |
# | bge-large-en-v1.5         | 1024  | 64.2  | 本地免费      |
# | embed-english-v3.0        | 1024  | 64.5  | $0.10/1M tok |
# | voyage-3-large            | 1024  | 67.2  | $0.18/1M tok |`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📏 相似度函数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> similarity.py</div>
                <pre className="fs-code">{`import numpy as np

def cosine_similarity(a, b):
    """余弦相似度: 最常用, 忽略向量长度"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def euclidean_distance(a, b):
    """欧氏距离: 越小越相似"""
    return np.linalg.norm(np.array(a) - np.array(b))

def dot_product(a, b):
    """内积: 归一化后等价余弦"""
    return np.dot(a, b)

def maximal_marginal_relevance(
    query_emb, doc_embs, scores, 
    lambda_=0.7, top_k=5
):
    """MMR: 兼顾相关性与多样性
    
    Score = λ * Sim(q, d) - (1-λ) * max(Sim(d, d'))
    """
    selected = []
    candidates = list(range(len(doc_embs)))
    
    for _ in range(top_k):
        best_idx, best_score = -1, -float('inf')
        for i in candidates:
            relevance = scores[i]
            redundancy = max(
                cosine_similarity(doc_embs[i], doc_embs[j])
                for j in selected
            ) if selected else 0
            
            mmr = lambda_ * relevance - (1-lambda_) * redundancy
            if mmr > best_score:
                best_score = mmr
                best_idx = i
        
        selected.append(best_idx)
        candidates.remove(best_idx)
    
    return selected`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🎯 距离选择指南</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> 选型建议</div>
                <pre className="fs-code">{`距离函数选择：

Cosine Similarity (余弦)
├── 适合: 文本相似度
├── 范围: [-1, 1]
├── 特点: 忽略向量长度
└── 推荐: ✅ 大部分场景首选

Dot Product (内积)
├── 适合: 归一化后的向量
├── 范围: 无限
├── 特点: 等价余弦 (归一化后)
└── 推荐: ✅ 高性能场景

Euclidean Distance (欧氏)
├── 适合: 图像/地理位置
├── 范围: [0, ∞)
├── 特点: 考虑绝对距离
└── 推荐: 特殊场景

最佳实践：
1. 文本搜索 → Cosine
2. 推荐系统 → Dot Product
3. 图像检索 → Cosine / L2
4. 已归一化 → Dot Product
5. MMR 去重 → Cosine + λ`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 端到端语义检索管线</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> retrieval_pipeline.py</div>
                <pre className="fs-code">{`# —— 生产级语义检索管线 ——
from dataclasses import dataclass

@dataclass
class SearchResult:
    id: str
    text: str
    score: float
    metadata: dict

class SemanticSearchPipeline:
    """端到端语义搜索管线"""
    
    def __init__(self, embedder, vector_store, reranker=None):
        self.embedder = embedder       # Embedding 模型
        self.vector_store = vector_store # 向量数据库
        self.reranker = reranker        # 可选 Reranker
    
    # ── 索引阶段 ──
    async def index(self, documents: list[dict]):
        """文档索引: 清洗 → 分块 → 编码 → 存储"""
        for doc in documents:
            # 1. 文本清洗
            text = self._clean(doc["text"])
            
            # 2. 智能分块 (递归字符分割)
            chunks = self._chunk(text, chunk_size=512, overlap=50)
            
            # 3. 批量 Embedding
            embeddings = await self.embedder.encode(
                [c["text"] for c in chunks]
            )
            
            # 4. 写入向量数据库
            await self.vector_store.upsert([
                {
                    "id": f"{doc['id']}_{i}",
                    "embedding": emb,
                    "metadata": {
                        "text": chunk["text"],
                        "doc_id": doc["id"],
                        "chunk_idx": i,
                        **doc.get("metadata", {})
                    }
                }
                for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
            ])
    
    # ── 检索阶段 ──
    async def search(self, query: str, top_k=10, filters=None) -> list:
        """搜索: 编码 → ANN → Rerank → 返回"""
        # 1. Query Embedding
        q_emb = await self.embedder.encode([query])
        
        # 2. 向量近邻搜索 (ANN)
        candidates = await self.vector_store.search(
            vector=q_emb[0],
            top_k=top_k * 3,  # 多取用于 Rerank
            filters=filters
        )
        
        # 3. Reranking (可选)
        if self.reranker:
            candidates = await self.reranker.rerank(
                query=query,
                documents=[c.metadata["text"] for c in candidates],
                top_k=top_k
            )
        
        return candidates[:top_k]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🚀 Embedding 优化技巧</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> 优化清单</div>
                <pre className="fs-code">{`Embedding 生产优化：

1️⃣ 分块策略
├── 按语义分割 (段落/章节)
├── 递归字符分割 (fallback)
├── 重叠 10-20% 保留上下文
└── 添加标题作为 chunk 前缀

2️⃣ 查询优化
├── Query Expansion (扩展)
├── HyDE: 假设文档法
├── 多视角查询生成
└── 查询分类 → 路由策略

3️⃣ 降维与量化
├── Matryoshka Embedding
│   └── 3072 → 512 维 精度损失 <2%
├── 二值量化 (Binary)
│   └── 内存减少 32x
├── 标量量化 (Scalar)
│   └── 内存减少 4x
└── PQ 乘积量化
    └── 兼顾精度与速度

4️⃣ 批量推理
├── 批量 Encode (batch_size=64)
├── GPU 加速推理
├── 异步并行处理
└── 缓存热门查询`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔥 HyDE 假设文档法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> hyde.py</div>
                <pre className="fs-code">{`# HyDE: Hypothetical Document Embedding
# 用 LLM 生成假设答案，再用答案做检索

async def hyde_search(query: str, pipeline):
    """HyDE 搜索: 提升短查询效果"""
    
    # 1. 用 LLM 生成假设文档
    hypothetical = await llm.generate(
        f"""请写一段详细回答以下问题的文字:
        问题: {query}
        回答:"""
    )
    
    # 2. 用假设文档做 Embedding
    results = await pipeline.search(
        hypothetical,  # 用生成的文档替代原查询
        top_k=10
    )
    
    return results

# 效果对比:
# 查询: "Python GIL"
# 原始搜索: 召回率 60%
# HyDE 搜索: 召回率 82% ↑`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
