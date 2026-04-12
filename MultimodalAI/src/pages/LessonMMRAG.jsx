import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 07 — 多模态 RAG
   图文混合检索 / 跨模态搜索
   ───────────────────────────────────────────── */

const RAG_TOPICS = [
  { name: '多模态嵌入', icon: '🧲', tag: 'Embedding',
    code: `# ─── 多模态嵌入: 让图文可搜索 ───

# ═══ 1. OpenAI 文本嵌入 + CLIP 图像嵌入 ═══
from openai import OpenAI
from transformers import CLIPModel, CLIPProcessor
from PIL import Image
import torch
import numpy as np

client = OpenAI()

class MultimodalEmbedder:
    """多模态嵌入: 统一不同模态到同一向量空间"""
    
    def __init__(self):
        # 文本嵌入
        self.text_model = "text-embedding-3-large"
        
        # 图像嵌入 (CLIP)
        self.clip_model = CLIPModel.from_pretrained(
            "openai/clip-vit-large-patch14"
        )
        self.clip_processor = CLIPProcessor.from_pretrained(
            "openai/clip-vit-large-patch14"
        )
    
    def embed_text(self, texts: list) -> np.ndarray:
        """文本 → 向量"""
        response = client.embeddings.create(
            model=self.text_model,
            input=texts,
        )
        return np.array([d.embedding for d in response.data])
    
    def embed_image(self, image_paths: list) -> np.ndarray:
        """图像 → 向量 (CLIP)"""
        images = [Image.open(p) for p in image_paths]
        inputs = self.clip_processor(images=images, return_tensors="pt")
        
        with torch.no_grad():
            features = self.clip_model.get_image_features(**inputs)
            features = features / features.norm(dim=-1, keepdim=True)
        
        return features.numpy()
    
    def embed_image_as_text(self, image_path: str) -> np.ndarray:
        """
        图像 → 文本描述 → 文本向量
        适用于文本检索系统中混入图片
        """
        # GPT-4o Vision 生成描述
        description = self._describe_image(image_path)
        
        # 用文本嵌入
        return self.embed_text([description])[0]

# ═══ 2. 统一嵌入模型 (推荐生产) ═══
# Voyage AI: voyage-multimodal-3 — 原生多模态嵌入
import voyageai

class VoyageMultimodalEmbedder:
    """Voyage AI 多模态嵌入 (文本+图片 → 同一空间)"""
    
    def __init__(self):
        self.client = voyageai.Client()
    
    def embed(self, inputs: list) -> np.ndarray:
        """
        inputs: 混合列表
        - 文本: "some text"
        - 图片: PIL.Image 对象
        """
        result = self.client.multimodal_embed(
            inputs=inputs,
            model="voyage-multimodal-3",
            input_type="document",
        )
        return np.array(result.embeddings)

# ═══ 3. Jina CLIP v2 (开源) ═══
from sentence_transformers import SentenceTransformer

class JinaMultimodalEmbedder:
    def __init__(self):
        self.model = SentenceTransformer("jinaai/jina-clip-v2")
    
    def encode(self, items):
        """文本或图片路径列表"""
        return self.model.encode(items)` },
  { name: '多模态索引', icon: '🗄️', tag: 'Index',
    code: `# ─── 多模态向量索引: 图文混合存储 ───
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, Text, Integer, Enum
from sqlalchemy.orm import DeclarativeBase
import asyncio

class Base(DeclarativeBase):
    pass

class MultimodalDocument(Base):
    """多模态文档: 统一存储文本/图片/表格"""
    __tablename__ = "mm_documents"
    
    id = Column(String, primary_key=True)
    doc_id = Column(String, index=True)         # 原始文档ID
    chunk_type = Column(Enum("text", "image", "table", "chart", name="chunk_type"))
    
    # 内容
    content = Column(Text)           # 文本内容 / 图片描述
    image_url = Column(String)       # 图片 URL (如果是图片)
    page_number = Column(Integer)    # 所在页码
    
    # 向量 (统一维度)
    embedding = Column(Vector(1024))  # 多模态嵌入
    
    # 元数据
    metadata_ = Column("metadata", Text)

# ─── 索引构建 Pipeline ───
class MultimodalIndexer:
    """构建多模态索引"""
    
    def __init__(self, embedder, db):
        self.embedder = embedder
        self.db = db
    
    async def index_pdf(self, pdf_path: str, doc_id: str):
        """PDF → 多模态索引"""
        processor = PDFProcessor()
        data = processor.extract_all(pdf_path)
        
        chunks = []
        
        for page in data["pages"]:
            # 1. 文本块
            text_chunks = self._split_text(page["text"], chunk_size=500)
            for i, chunk in enumerate(text_chunks):
                chunks.append({
                    "id": f"{doc_id}_p{page['page']}_t{i}",
                    "doc_id": doc_id,
                    "chunk_type": "text",
                    "content": chunk,
                    "page_number": page["page"],
                })
            
            # 2. 表格
            for i, table in enumerate(page["tables"]):
                table_text = self._table_to_text(table)
                chunks.append({
                    "id": f"{doc_id}_p{page['page']}_tab{i}",
                    "doc_id": doc_id,
                    "chunk_type": "table",
                    "content": table_text,
                    "page_number": page["page"],
                })
            
            # 3. 图片/图表
            for i, img in enumerate(page["images"]):
                # 用 Vision LLM 生成描述
                desc = await self._describe_image(img["data"])
                img_url = await self._upload_image(img["data"])
                
                chunks.append({
                    "id": f"{doc_id}_p{page['page']}_img{i}",
                    "doc_id": doc_id,
                    "chunk_type": "image",
                    "content": desc,      # 图片描述 (用于文本检索)
                    "image_url": img_url,  # 原图 (用于展示)
                    "page_number": page["page"],
                })
        
        # 批量嵌入
        texts = [c["content"] for c in chunks]
        embeddings = self.embedder.embed_text(texts)
        
        # 写入数据库
        for chunk, emb in zip(chunks, embeddings):
            chunk["embedding"] = emb.tolist()
            await self.db.insert(MultimodalDocument(**chunk))
        
        print(f"✅ 索引完成: {len(chunks)} 块 (文本+表格+图片)")` },
  { name: '跨模态检索', icon: '🔍', tag: 'Retrieval',
    code: `# ─── 跨模态检索: 文搜图、图搜文、一切搜一切 ───

class MultimodalRetriever:
    """跨模态检索器"""
    
    def __init__(self, embedder, db):
        self.embedder = embedder
        self.db = db
    
    async def search(self, query, top_k=10, modalities=None):
        """
        统一搜索接口
        query: 文本 或 图片路径
        modalities: ["text", "image", "table"] 过滤
        """
        # 1. 判断 query 类型
        if isinstance(query, str) and not query.endswith(('.jpg', '.png')):
            query_embedding = self.embedder.embed_text([query])[0]
        else:
            query_embedding = self.embedder.embed_image([query])[0]
        
        # 2. 向量检索
        filter_clause = ""
        if modalities:
            types = ", ".join(f"'{m}'" for m in modalities)
            filter_clause = f"AND chunk_type IN ({types})"
        
        results = await self.db.execute(f"""
            SELECT *, embedding <=> $1 AS distance
            FROM mm_documents
            WHERE TRUE {filter_clause}
            ORDER BY embedding <=> $1
            LIMIT {top_k}
        """, [query_embedding])
        
        return [dict(r) for r in results]
    
    async def hybrid_search(self, query: str, top_k=10):
        """混合检索: 向量 + 关键词 + 重排序"""
        
        # 1. 向量检索
        vector_results = await self.search(query, top_k=top_k * 2)
        
        # 2. 全文检索 (BM25)
        bm25_results = await self.db.execute("""
            SELECT *, ts_rank(to_tsvector('chinese', content), 
                   plainto_tsquery('chinese', $1)) as bm25_score
            FROM mm_documents
            WHERE to_tsvector('chinese', content) @@ plainto_tsquery('chinese', $1)
            ORDER BY bm25_score DESC
            LIMIT $2
        """, [query, top_k * 2])
        
        # 3. RRF 融合
        combined = self._rrf_fusion(vector_results, bm25_results)
        
        # 4. Cross-Encoder 重排序
        reranked = await self._rerank(query, combined[:top_k * 2])
        
        return reranked[:top_k]
    
    def _rrf_fusion(self, *result_lists, k=60):
        """Reciprocal Rank Fusion"""
        scores = {}
        for results in result_lists:
            for rank, doc in enumerate(results):
                doc_id = doc["id"]
                if doc_id not in scores:
                    scores[doc_id] = {"doc": doc, "score": 0}
                scores[doc_id]["score"] += 1 / (k + rank + 1)
        
        return sorted(scores.values(), key=lambda x: x["score"], reverse=True)

# ─── 实战: 多模态问答 ───
async def multimodal_qa(query: str, retriever):
    """检索增强的多模态回答"""
    # 检索相关内容
    results = await retriever.hybrid_search(query, top_k=5)
    
    # 构建上下文 (文本 + 图片)
    context_parts = []
    image_urls = []
    for r in results:
        if r["chunk_type"] == "image":
            context_parts.append(f"[图片: {r['content']}]")
            image_urls.append(r["image_url"])
        else:
            context_parts.append(r["content"])
    
    # 多模态回答 (文本 + 引用图片)
    messages = [{"role": "user", "content": [
        {"type": "text", "text": f"""
基于以下检索到的内容回答问题:

{chr(10).join(context_parts)}

问题: {query}

要求: 引用来源页码，如果有相关图表请说明。
"""},
        # 附上检索到的图片
        *[{"type": "image_url", "image_url": {"url": url}} for url in image_urls[:3]],
    ]}]
    
    resp = client.chat.completions.create(model="gpt-4o", messages=messages)
    return resp.choices[0].message.content` },
  { name: 'ColPali', icon: '⚡', tag: 'ColPali',
    code: `# ─── ColPali: 革命性的多模态检索 ───
# 直接用图片做检索! 不需要 OCR/分块/嵌入文本

# ─── 传统 Pipeline vs ColPali ───
# 传统: PDF → OCR → 分块 → 文本嵌入 → 检索
#   问题: OCR 错误传播，丢失布局/图表信息
#
# ColPali: PDF → 逐页截图 → 视觉嵌入 → 检索
#   优势: 零 OCR，保留所有视觉信息!

from colpali_engine.models import ColPali, ColPaliProcessor
from colpali_engine.utils.torch_utils import get_torch_device
import torch

class ColPaliRetriever:
    """ColPali: 基于视觉的文档检索"""
    
    def __init__(self):
        self.device = get_torch_device("auto")
        self.model = ColPali.from_pretrained(
            "vidore/colpali-v1.2",
            torch_dtype=torch.bfloat16,
        ).to(self.device).eval()
        self.processor = ColPaliProcessor.from_pretrained("vidore/colpali-v1.2")
    
    def index_pages(self, page_images: list) -> torch.Tensor:
        """
        索引: 每页截图 → 多向量嵌入 (Late Interaction)
        
        关键创新: 每张图片不是一个向量，而是 1024 个 patch 向量!
        这使得检索可以精确匹配局部区域（表格、图表、文字）
        """
        batch = self.processor.process_images(page_images)
        batch = {k: v.to(self.device) for k, v in batch.items()}
        
        with torch.no_grad():
            embeddings = self.model(**batch)
        # → (N, 1024, 128)  # N页 × 1024个patch × 128维
        
        return embeddings
    
    def search(self, query: str, page_embeddings, top_k=5):
        """
        检索: 文本 query → 与每页的 patch 向量做 MaxSim
        """
        # 编码 query
        batch = self.processor.process_queries([query])
        batch = {k: v.to(self.device) for k, v in batch.items()}
        
        with torch.no_grad():
            q_emb = self.model(**batch)
        # → (1, T, 128)  # T个query token × 128维
        
        # MaxSim 计算 (Late Interaction)
        scores = []
        for page_emb in page_embeddings:
            # 每个 query token 找最匹配的 page patch
            sim = torch.einsum("td,pd->tp", q_emb[0], page_emb)
            # 取每个 query token 的最大匹配分
            max_sim = sim.max(dim=-1).values
            # 所有 query token 求和
            score = max_sim.sum().item()
            scores.append(score)
        
        # 排序返回
        ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
        return ranked[:top_k]

# ─── ColPali 优势 ───
# ✅ 零 OCR: 不需要文本提取，直接用图片检索
# ✅ 布局感知: 理解表格、图表、多栏排版
# ✅ 多语言: 天然支持任何语言 (因为看图不看字)
# ✅ 精确匹配: Late Interaction 比单向量精确
# ❌ 限制: 存储大 (每页1024个向量)，推理需GPU

# ─── 生产建议 ───
# 1. 简单文档 (纯文本): 传统 RAG 即可
# 2. 复杂文档 (表格/图表多): ColPali 更优
# 3. 混合方案: ColPali 粗检索 + GPT-4o 精分析` },
];

export default function LessonMMRAG() {
  const [topicIdx, setTopicIdx] = useState(0);
  const t = RAG_TOPICS[topicIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge" style={{ background: '#7c3aed22', color: '#a78bfa', borderColor: '#7c3aed44' }}>
        🎨 module_07 — 多模态 RAG
      </div>
      <div className="fs-hero">
        <h1>多模态 RAG：图文混合检索的终极形态</h1>
        <p>
          传统 RAG 只能搜文字——但企业知识库里充满了<strong>图表、表格、PDF 扫描件</strong>。
          本模块从<strong>多模态嵌入</strong>到<strong>ColPali 视觉检索</strong>，
          构建能"搜图找文、搜文找图"的<strong>全模态知识库</strong>。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🔍 检索技术演进</h2>
        <div className="fs-pills">
          {RAG_TOPICS.map((t, i) => (
            <button key={i} className={`fs-btn ${i === topicIdx ? 'primary' : ''}`}
              onClick={() => setTopicIdx(i)}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#a78bfa' }}>{t.icon} {t.name}</h3>
            <span className="fs-tag" style={{ background: '#7c3aed22', color: '#a78bfa', borderColor: '#7c3aed44' }}>{t.tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 mm_rag_{t.tag.toLowerCase()}.py
            </div>
            <pre className="fs-code">{t.code}</pre>
          </div>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 文档智能</button>
        <button className="fs-btn primary">生产部署 →</button>
      </div>
    </div>
  );
}
