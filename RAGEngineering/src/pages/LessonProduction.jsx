import { useState } from 'react';
import './LessonCommon.css';

const STACKS = ['langchain', 'llamaindex', 'fastapi'];

const CODES = {
  langchain: `# ━━━━ LangChain 生产级 RAG 完整实现 ━━━━
# pip install langchain langchain-openai langchain-community chromadb

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import PGVector
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import ChatPromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# ━━━━ 1. 向量存储（生产用 pgvector）━━━━
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = PGVector(
    connection_string="postgresql://user:pwd@localhost/ragdb",
    embedding_function=embeddings,
    collection_name="knowledge_base",
)

# ━━━━ 2. 高级检索器（带 Reranker）━━━━
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from sentence_transformers import CrossEncoder

base_retriever = vectorstore.as_retriever(search_kwargs={"k": 20})
reranker = CrossEncoder("BAAI/bge-reranker-v2-m3")
compressor = CrossEncoderReranker(model=reranker, top_n=5)

retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=base_retriever,
)

# ━━━━ 3. 对话记忆（多轮对话）━━━━
memory = ConversationBufferWindowMemory(
    memory_key="chat_history",
    return_messages=True,
    k=5,  # 记录最近5轮对话
    output_key="answer",
)

# ━━━━ 4. 自定义 Prompt ━━━━
CUSTOM_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """你是专业的客服助手，基于以下文档和对话历史回答问题。
    
参考文档：
{context}

规则：只引用文档内容，无法回答时明确说明。"""),
    ("human", "对话历史：{chat_history}\n\n当前问题：{question}"),
])

# ━━━━ 5. 对话 RAG Chain ━━━━
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        streaming=True,                    # 流式输出
        callbacks=[StreamingStdOutCallbackHandler()],
    ),
    retriever=retriever,
    memory=memory,
    combine_docs_chain_kwargs={"prompt": CUSTOM_PROMPT},
    return_source_documents=True,
    verbose=False,
)

# 使用
result = qa_chain.invoke({"question": "退货政策是什么？"})
print(result["answer"])
print([doc.metadata for doc in result["source_documents"]])`,

  llamaindex: `# ━━━━ LlamaIndex 生产级 RAG ━━━━
# pip install llama-index llama-index-vector-stores-pinecone

from llama_index.core import VectorStoreIndex, Settings, StorageContext
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.pinecone import PineconeVectorStore

# ━━━━ 1. 全局配置 ━━━━
Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.chunk_size = 512
Settings.chunk_overlap = 64

# ━━━━ 2. 向量存储 ━━━━
from pinecone import Pinecone
pc = Pinecone(api_key="your-key")
pinecone_index = pc.Index("rag-index")
vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# ━━━━ 3. 建立索引（文档入库）━━━━
from llama_index.core import SimpleDirectoryReader
documents = SimpleDirectoryReader("./docs").load_data()
index = VectorStoreIndex.from_documents(
    documents, storage_context=storage_context
)

# ━━━━ 4. 高级查询引擎 ━━━━
retriever = VectorIndexRetriever(index=index, similarity_top_k=20)
reranker = SentenceTransformerRerank(
    model="BAAI/bge-reranker-v2-m3",
    top_n=5,
)

query_engine = RetrieverQueryEngine(
    retriever=retriever,
    node_postprocessors=[reranker],
)

# ━━━━ 5. 流式查询 ━━━━
streaming_engine = index.as_query_engine(streaming=True)
streaming_response = streaming_engine.query("产品保修期多长？")
streaming_response.print_response_stream()  # 流式输出

# LlamaIndex 优势：
# - 比 LangChain 更专注 RAG
# - 内置支持多种高级检索策略（SubQuestion/RouterQuery）
# - 对大型文档集合的处理更成熟`,

  fastapi: `# ━━━━ FastAPI 生产级 RAG API ━━━━
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio, json, time

app = FastAPI(title="RAG Knowledge Base API")

# ━━━━ 数据模型 ━━━━
class QueryRequest(BaseModel):
    question: str
    session_id: str = "default"
    stream: bool = False
    max_docs: int = 5

class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]
    latency_ms: float
    tokens_used: int

# ━━━━ 非流式 API ━━━━
@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    start = time.time()
    try:
        # 检索
        docs = await retriever.aget_relevant_documents(req.question)
        # 生成
        result = await qa_chain.ainvoke({"question": req.question})
        
        return QueryResponse(
            answer=result["answer"],
            sources=[{"content": d.page_content[:200], **d.metadata} for d in docs],
            latency_ms=(time.time() - start) * 1000,
            tokens_used=result.get("tokens", 0),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ━━━━ 流式 API（SSE）━━━━
@app.post("/query/stream")
async def query_stream(req: QueryRequest):
    async def event_generator():
        async for chunk in qa_chain.astream({"question": req.question}):
            if "answer" in chunk:
                yield f"data: {json.dumps({'token': chunk['answer']})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no"},
    )

# ━━━━ 健康检查 ━━━━
@app.get("/health")
async def health():
    return {"status": "ok", "vectordb": "connected", "llm": "ready"}

# ━━━━ 缓存热点查询 ━━━━
from functools import lru_cache
import hashlib

query_cache = {}

@app.post("/query/cached")
async def query_cached(req: QueryRequest):
    cache_key = hashlib.md5(req.question.encode()).hexdigest()
    if cache_key in query_cache:
        return {**query_cache[cache_key], "cached": True}
    result = await query(req)
    query_cache[cache_key] = result.dict()
    return result

# uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`,
};

export default function LessonProduction() {
  const [stack, setStack] = useState('langchain');

  return (
    <div className="rag-lesson">
      <div className="rag-hero">
        <div className="rag-badge">// MODULE 08 · PRODUCTION DEPLOYMENT</div>
        <h1>生产部署 — 完整项目实战</h1>
        <p>把所有模块的知识串联成<strong>可部署的生产级 RAG 系统</strong>。LangChain/LlamaIndex 完整实现、FastAPI 服务化、Docker 容器化、成本监控与优化——真实的工程，不是 Demo。</p>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">⚙️ 三种技术栈完整实现</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[['langchain', '🦜 LangChain'], ['llamaindex', '🦙 LlamaIndex'], ['fastapi', '⚡ FastAPI Service']].map(([k, l]) => (
            <button key={k} className={`rag-btn ${stack === k ? 'active' : ''}`} onClick={() => setStack(k)}>{l}</button>
          ))}
        </div>
        <div className="rag-code-wrap">
          <div className="rag-code-head">
            <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{stack}_production.py</span>
          </div>
          <div className="rag-code">{CODES[stack]}</div>
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">🐳 Docker 生产部署</div>
        <div className="rag-code-wrap">
          <div className="rag-code-head"><span>docker-compose.yml</span></div>
          <div className="rag-code">{`version: '3.9'
services:
  # RAG API 服务
  rag-api:
    build: .
    ports: ["8000:8000"]
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://postgres:password@db:5432/ragdb
      - REDIS_URL=redis://redis:6379
    depends_on: [db, redis]
    deploy:
      replicas: 2          # 水平扩展
      resources:
        limits: {cpus: '1', memory: 2G}

  # PostgreSQL + pgvector
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: ragdb
      POSTGRES_PASSWORD: password
    volumes: ["pgdata:/var/lib/postgresql/data"]
    ports: ["5432:5432"]

  # Redis 缓存（高频查询）
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports: ["6379:6379"]

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf"]
    depends_on: [rag-api]

volumes:
  pgdata:

# Dockerfile
# FROM python:3.11-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]`}</div>
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">💰 成本优化策略</div>
        <div className="rag-card" style={{ overflowX: 'auto' }}>
          <table className="rag-table">
            <thead><tr><th>优化点</th><th>方法</th><th>节省估算</th><th>实现成本</th></tr></thead>
            <tbody>
              {[
                ['Embedding 缓存', 'Redis 缓存相同文本的向量（TTL 7天）', '30-50% Embedding 费用', '⭐'],
                ['查询结果缓存', '相同/相似问题直接返回缓存答案', '20-40% LLM 调用', '⭐⭐'],
                ['模型降级', '简单问题用 gpt-4o-mini，复杂用 gpt-4o', '50-70% LLM 费用', '⭐⭐'],
                ['上下文压缩', '用小模型压缩文档后再送 LLM，减少 Token', '30-50% Generation Token', '⭐⭐'],
                ['批量 Embedding', '文档入库时批量处理，减少 API 调用次数', '10-20% Embedding 费用', '⭐'],
                ['本地 Embedding', '部署 BGE-M3（GPU）替代 OpenAI Embedding', '100% Embedding 费用', '⭐⭐⭐'],
              ].map(([o, m, s, c]) => (
                <tr key={o}>
                  <td style={{ fontWeight: 600, color: 'var(--rag-emerald)', fontSize: '0.85rem' }}>{o}</td>
                  <td style={{ color: 'var(--rag-muted)', fontSize: '0.83rem' }}>{m}</td>
                  <td><span className="rag-tag green">{s}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rag-tip">
          💡 <strong>成本控制经验</strong>：大多数 RAG 系统 70% 的成本在 LLM 生成阶段。优先考虑模型降级和查询缓存，可将 token 成本降低 50%+，且对用户体验影响极小。
        </div>
      </div>
    </div>
  );
}
