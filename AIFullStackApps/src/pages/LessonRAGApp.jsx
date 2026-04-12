import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 03 — RAG 知识库应用
   文档处理 / 向量检索 / 混合搜索 / 引用溯源
   ───────────────────────────────────────────── */

const STAGES = [
  { name: '文档处理', icon: '📄', tag: 'Ingest',
    code: `# ─── 文档处理 Pipeline ───
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader, UnstructuredWordDocumentLoader,
    UnstructuredExcelLoader, CSVLoader
)
from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGVector
import hashlib

# 1. 多格式文档加载
LOADERS = {
    ".pdf":  PyPDFLoader,
    ".docx": UnstructuredWordDocumentLoader,
    ".xlsx": UnstructuredExcelLoader,
    ".csv":  CSVLoader,
}

def load_document(file_path: str):
    ext = Path(file_path).suffix.lower()
    loader = LOADERS.get(ext)
    if not loader:
        raise ValueError(f"不支持的格式: {ext}")
    return loader(file_path).load()

# 2. 智能分块
splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,          # 每块 800 字符
    chunk_overlap=200,       # 重叠 200
    separators=["\\n\\n", "\\n", "。", "！", "？", ".", " "],
    length_function=len,
)

# 3. Embedding + 入库
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = PGVector(
    connection="postgresql://user:pass@localhost/ragdb",
    collection_name="documents",
    embeddings=embeddings,
)

def ingest(file_path: str, metadata: dict):
    docs = load_document(file_path)
    chunks = splitter.split_documents(docs)
    
    # 去重 (基于内容 hash)
    unique_chunks = []
    for chunk in chunks:
        content_hash = hashlib.md5(chunk.page_content.encode()).hexdigest()
        chunk.metadata.update({
            **metadata,
            "content_hash": content_hash,
            "chunk_size": len(chunk.page_content),
        })
        unique_chunks.append(chunk)
    
    vectorstore.add_documents(unique_chunks)
    return len(unique_chunks)` },
  { name: '混合检索', icon: '🔍', tag: 'Retrieval',
    code: `# ─── 混合检索: 向量 + 关键词 + 重排序 ───
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_postgres import PGVector
from sentence_transformers import CrossEncoder

# 1. 向量检索 (语义相似)
vector_retriever = vectorstore.as_retriever(
    search_type="mmr",          # 最大边际相关性
    search_kwargs={
        "k": 10,                # 召回 10 条
        "fetch_k": 30,          # 候选池 30
        "lambda_mult": 0.7,     # 多样性权重
    }
)

# 2. BM25 关键词检索
bm25_retriever = BM25Retriever.from_documents(
    all_documents,
    k=10,
)

# 3. 混合检索 (Ensemble)
hybrid_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.6, 0.4],  # 语义 60% + 关键词 40%
)

# 4. Cross-Encoder 重排序
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-12-v2")

def retrieve_with_rerank(query: str, top_k: int = 5):
    # 粗筛
    candidates = hybrid_retriever.invoke(query)
    
    # 重排序
    pairs = [(query, doc.page_content) for doc in candidates]
    scores = reranker.predict(pairs)
    
    # 按分数排序
    ranked = sorted(
        zip(candidates, scores),
        key=lambda x: x[1],
        reverse=True
    )[:top_k]
    
    return [doc for doc, score in ranked]

# 5. 带元数据过滤
def filtered_retrieve(query, filters=None):
    """支持按文档类型、日期、来源过滤"""
    results = vectorstore.similarity_search(
        query, k=5,
        filter=filters  # {"source": "annual_report_2024.pdf"}
    )
    return results` },
  { name: '生成回答', icon: '✨', tag: 'Generation',
    code: `# ─── RAG 生成: 带引用的回答 ───
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List

# 结构化输出
class Citation(BaseModel):
    text: str = Field(description="引用的原文片段")
    source: str = Field(description="来源文档名")
    page: int = Field(description="页码")

class RAGResponse(BaseModel):
    answer: str = Field(description="回答内容")
    citations: List[Citation] = Field(description="引用列表")
    confidence: float = Field(description="置信度 0-1")

# RAG Prompt
RAG_PROMPT = ChatPromptTemplate.from_template("""
你是一个企业知识库助手。基于以下检索到的文档片段回答用户问题。

## 规则
1. 只基于提供的文档回答，不要编造信息
2. 如果文档中没有相关信息，明确说"未找到相关信息"
3. 每个关键论述都要标注引用来源 [来源: 文档名, 第X页]
4. 回答要结构化，使用标题和列表

## 检索到的文档
{context}

## 用户问题
{question}

请以 JSON 格式返回回答，包含 answer、citations、confidence 字段。
""")

llm = ChatOpenAI(model="gpt-4o", temperature=0)

async def rag_answer(question: str):
    # 1. 检索
    docs = retrieve_with_rerank(question, top_k=5)
    
    # 2. 组装 context
    context = "\\n\\n---\\n\\n".join([
        f"[文档: {d.metadata['source']}, 页: {d.metadata.get('page', '?')}]\\n{d.page_content}"
        for d in docs
    ])
    
    # 3. 生成 (结构化输出)
    chain = RAG_PROMPT | llm.with_structured_output(RAGResponse)
    result = await chain.ainvoke({
        "context": context,
        "question": question,
    })
    
    return result

# 使用示例
# result = await rag_answer("公司2024年营收是多少？")
# print(result.answer)
# print(result.citations)  # 带引用溯源！` },
  { name: '评估优化', icon: '📊', tag: 'Evaluation',
    code: `# ─── RAG 评估: 检索质量 + 生成质量 ───
from ragas import evaluate
from ragas.metrics import (
    context_precision,  # 检索精确率
    context_recall,     # 检索召回率
    faithfulness,       # 忠实度 (不编造)
    answer_relevancy,   # 回答相关性
)

# 1. 自动评估
eval_dataset = {
    "question": [
        "公司2024年总营收是多少？",
        "AI 部门的增长率是多少？",
    ],
    "answer": [rag_answers...],
    "contexts": [retrieved_contexts...],
    "ground_truth": [
        "公司2024年总营收为 150 亿元",
        "AI 部门同比增长 45%",
    ],
}

results = evaluate(
    eval_dataset,
    metrics=[
        context_precision,
        context_recall,
        faithfulness,
        answer_relevancy,
    ],
)
print(results)
# context_precision:  0.85
# context_recall:     0.78
# faithfulness:       0.92
# answer_relevancy:   0.88

# 2. 分块策略对比实验
CHUNK_CONFIGS = [
    {"size": 500,  "overlap": 100, "name": "small"},
    {"size": 800,  "overlap": 200, "name": "medium"},
    {"size": 1200, "overlap": 300, "name": "large"},
    {"size": 500,  "overlap": 100, "name": "semantic",
     "splitter": "semantic"},  # 语义分块
]

# 对每种配置运行评估，选最优
for config in CHUNK_CONFIGS:
    vectorstore = build_with_config(config)
    scores = evaluate_retrieval(vectorstore, test_queries)
    print(f"{config['name']}: recall={scores['recall']:.2f}")

# 3. 产出优化建议
# - chunk_size=800 + overlap=200 (中文最优)
# - MMR (去重) > 纯 cosine
# - 混合检索 > 纯向量检索
# - Cross-Encoder 重排序提升 15-25%` },
];

export default function LessonRAGApp() {
  const [stgIdx, setStgIdx] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🧩 module_03 — RAG 知识库</div>
      <div className="fs-hero">
        <h1>RAG 知识库：让 LLM 基于你的数据回答</h1>
        <p>
          RAG 不是"扔文档进向量数据库然后查询"这么简单——生产级 RAG 需要
          <strong>智能分块</strong>、<strong>混合检索 (向量+BM25)</strong>、
          <strong>Cross-Encoder 重排序</strong>、<strong>引用溯源</strong>。
          本模块从 Ingest 到 Evaluation 的完整 Pipeline。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🔄 RAG Pipeline 四阶段</h2>
        <div className="fs-pills">
          {STAGES.map((s, i) => (
            <button key={i} className={`fs-btn ${i === stgIdx ? 'primary' : ''}`}
              onClick={() => setStgIdx(i)}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fbbf24' }}>{STAGES[stgIdx].icon} {STAGES[stgIdx].name}</h3>
            <span className="fs-tag amber">{STAGES[stgIdx].tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 rag_{STAGES[stgIdx].tag.toLowerCase()}.py
            </div>
            <pre className="fs-code">{STAGES[stgIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="fs-section">
        <h2 className="fs-section-title">🏗️ RAG 系统架构</h2>
        <div className="fs-card">
          <div className="fs-flow">
            {[
              { label: '📄 文档', bg: '#8b5cf6' }, { label: '✂️ 分块', bg: '#06b6d4' },
              { label: '🔢 Embed', bg: '#f59e0b' }, { label: '💾 向量库', bg: '#22c55e' },
              { label: '🔍 混合检索', bg: '#ef4444' }, { label: '🎯 重排序', bg: '#a78bfa' },
              { label: '✨ 生成', bg: '#fb7185' },
            ].map((n, i, arr) => (
              <React.Fragment key={i}>
                <div className="fs-flow-node" style={{ background: `${n.bg}22`, border: `1px solid ${n.bg}44`, color: n.bg }}>{n.label}</div>
                {i < arr.length - 1 && <span className="fs-flow-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="fs-grid-4" style={{ marginTop: '0.75rem' }}>
          {[
            ['> 85%', '检索精确率', '#22c55e'],
            ['> 78%', '检索召回率', '#06b6d4'],
            ['> 90%', '忠实度', '#f59e0b'],
            ['< 2s', '端到端延迟', '#ef4444'],
          ].map(([v, l, c], i) => (
            <div key={i} className="fs-metric">
              <div className="fs-metric-value" style={{ color: c }}>{v}</div>
              <div className="fs-metric-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 智能 ChatBot</button>
        <button className="fs-btn rose">Text-to-SQL →</button>
      </div>
    </div>
  );
}
