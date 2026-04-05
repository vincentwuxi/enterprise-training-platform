import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PIPELINE_STEPS = [
  { step: '文档加载', icon: '📄', color: '#a78bfa',
    desc: '支持 PDF/Word/HTML/Markdown/网页。关键：保留文档结构（标题/段落），不要把整个文件当字符串。',
    code: `# LangChain 文档加载
from langchain_community.document_loaders import (
    PyPDFLoader,       # PDF
    WebBaseLoader,     # 网页
    UnstructuredWordDocumentLoader,  # Word
)
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 加载 PDF
loader = PyPDFLoader("company-policy.pdf")
documents = loader.load()   # 每页一个 Document 对象

# 网页（自动清理 HTML 标签）
loader = WebBaseLoader("https://docs.example.com")
docs = loader.load()

# 文本分块（重叠避免知识被截断）
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,        # 每块约512 token
    chunk_overlap=64,      # 64 token 重叠（保留上下文）
    separators=["\\n\\n", "\\n", "。", " "],  # 按语义单元分割
)
chunks = splitter.split_documents(documents)
print(f"共 {len(chunks)} 个文本块")` },
  { step: '向量嵌入', icon: '🔢', color: '#10b981',
    desc: '每个文本块被 Embedding 模型转为高维向量（1536-4096维）。语义相似的文本，向量在空间中距离近。',
    code: `from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import OllamaEmbeddings

# OpenAI text-embedding-3-large（最高质量）
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
    dimensions=3072  # 可缩减至 256/512 节省存储
)

# 中文优选：bge-large-zh-v1.5（开源）
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
embeddings = HuggingFaceBgeEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5",
    model_kwargs={"device": "cuda"},
    encode_kwargs={"normalize_embeddings": True}
)

# 嵌入单个文本
vector = embeddings.embed_query("什么是RAG？")
# → [0.023, -0.145, 0.892, ...]  (3072维浮点数)

# 批量嵌入（文档入库）
vectors = embeddings.embed_documents([c.page_content for c in chunks])
print(f"向量维度：{len(vectors[0])}")  # 3072` },
  { step: '向量数据库', icon: '🗄️', color: '#38bdf8',
    desc: '存储向量并支持近似最近邻（ANN）搜索。生产环境推荐 Qdrant/Pinecone，本地开发用 ChromaDB 或 FAISS。',
    code: `# 方案1：Qdrant（生产推荐，支持混合检索）
from qdrant_client import QdrantClient
from langchain_qdrant import QdrantVectorStore

client = QdrantClient(url="http://localhost:6333")
vectorstore = QdrantVectorStore.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="company-kb",
    url="http://localhost:6333",
)

# 方案2：ChromaDB（本地开发，零配置）
from langchain_chroma import Chroma
vectorstore = Chroma.from_documents(chunks, embeddings, persist_directory="./chroma_db")

# 方案3：FAISS（内存/离线，最快）
from langchain_community.vectorstores import FAISS
vectorstore = FAISS.from_documents(chunks, embeddings)
vectorstore.save_local("faiss_index")
vectorstore = FAISS.load_local("faiss_index", embeddings)

# 向量搜索
results = vectorstore.similarity_search_with_score(
    query="年假政策是什么？",
    k=5,  # 返回最相关的5个文本块
)` },
  { step: '检索生成', icon: '🔍', color: '#f59e0b',
    desc: '用户问题被嵌入后，检索最相关片段，注入 LLM 上下文窗口，要求仅基于检索内容回答。',
    code: `from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# RAG Prompt 模板（关键：告知仅基于上下文回答）
RAG_PROMPT = PromptTemplate(
    template="""你是公司内部知识库助手。请仅根据以下参考文档回答问题。
如果文档中没有相关信息，请明确说"文档中未提及该信息"，不要编造。

参考文档：
{context}

用户问题：{question}

回答：""",
    input_variables=["context", "question"]
)

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 创建 RAG Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",   # 将所有检索块 stuff 进上下文
    retriever=vectorstore.as_retriever(
        search_kwargs={"k": 5, "score_threshold": 0.7}
    ),
    chain_type_kwargs={"prompt": RAG_PROMPT},
    return_source_documents=True,  # 返回引用来源
)

result = qa_chain.invoke({"query": "年假政策是什么？"})
print(result["result"])        # 模型回答
print(result["source_documents"])  # 引用的文档块` },
];

// 向量检索可视化
function VectorViz() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const DOCS = [
    { id: 1, text: '员工年假政策：工作满1年享有10天年假，满3年15天，满5年20天', score: 0 },
    { id: 2, text: '薪资发放：每月15日发放当月工资，年终奖在春节前发放', score: 0 },
    { id: 3, text: '年假申请流程：提前3天在HR系统申请，经理审批后生效', score: 0 },
    { id: 4, text: '报销政策：差旅费需附发票，5个工作日内完成报销', score: 0 },
    { id: 5, text: '年假可累积使用，最多可跨年度保留5天，超出自动清零', score: 0 },
  ];

  const QUERY_MAP = {
    '年假': [0.95, 0.12, 0.88, 0.08, 0.82],
    '假期': [0.90, 0.11, 0.85, 0.07, 0.78],
    '工资': [0.10, 0.97, 0.08, 0.15, 0.09],
    '薪资': [0.09, 0.95, 0.07, 0.12, 0.08],
    '报销': [0.05, 0.15, 0.06, 0.93, 0.05],
    '申请': [0.70, 0.12, 0.91, 0.55, 0.65],
  };

  const search = () => {
    let scores = [0, 0, 0, 0, 0];
    for (const [key, vals] of Object.entries(QUERY_MAP)) {
      if (query.includes(key)) {
        scores = scores.map((s, i) => Math.max(s, vals[i]));
      }
    }
    if (scores.every(s => s === 0)) scores = [0.35, 0.22, 0.30, 0.18, 0.28];
    const withScore = DOCS.map((d, i) => ({ ...d, score: scores[i] }))
      .sort((a, b) => b.score - a.score);
    setResults(withScore);
  };

  return (
    <div className="ai-interactive">
      <h3>🔍 向量检索可视化（模拟余弦相似度）</h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {['年假政策', '薪资发放', '报销流程', '申请流程'].map(q => (
          <button key={q} onClick={() => { setQuery(q); setResults([]); }}
            style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, border: '1px solid rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.07)', color: '#38bdf8' }}>
            {q}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="输入搜索问题（如：年假政策是什么）"
          style={{ flex: 1, padding: '0.5rem 0.75rem', background: '#020010', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '6px', color: '#d4c8ff', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', outline: 'none' }} />
        <button className="ai-btn blue" onClick={search}>🔍 搜索</button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#3b2d6b', marginBottom: '0.4rem' }}>余弦相似度排名（Top 5）：</div>
          {results.map((r, i) => (
            <div key={r.id} style={{ marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                <span style={{ color: i === 0 ? '#10b981' : i === 1 ? '#38bdf8' : '#3b2d6b', fontWeight: i < 2 ? 700 : 400 }}>{i < 2 ? '✅' : '  '} #{i + 1} {r.text.slice(0, 30)}…</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: r.score > 0.7 ? '#10b981' : r.score > 0.4 ? '#fbbf24' : '#3b2d6b', fontWeight: 700 }}>{r.score.toFixed(2)}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${r.score * 100}%`, borderRadius: 3, background: r.score > 0.7 ? 'linear-gradient(90deg,#059669,#10b981)' : r.score > 0.4 ? 'linear-gradient(90deg,#d97706,#fbbf24)' : '#3b2d6b', transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(16,185,129,0.07)', borderRadius: '6px', fontSize: '0.75rem', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            ✅ Top 2 文档（得分 &gt; 0.7）将被注入 LLM 上下文，用于回答生成
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonRAGBasics() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const s = PIPELINE_STEPS[activeStep];

  return (
    <div className="lesson-ai">
      <div className="ai-badge blue">📚 module_03 — RAG 基础</div>
      <div className="ai-hero">
        <h1>RAG 基础：文档解析 / 嵌入 / 向量检索</h1>
        <p>RAG（检索增强生成）解决了 LLM 的两大痛点：<strong>知识截止时间</strong>和<strong>幻觉问题</strong>。原理：把你的文档变成可以被 LLM 精准查阅的"搜索引擎"，让模型基于事实回答。</p>
      </div>

      {/* 向量检索可视化 */}
      <VectorViz />

      {/* RAG Pipeline 四步 */}
      <div className="ai-section">
        <h2 className="ai-section-title">🔄 RAG Pipeline 四步（点击查看代码）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {PIPELINE_STEPS.map((step, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeStep === i ? step.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeStep === i ? `${step.color}10` : 'rgba(255,255,255,0.02)',
                color: activeStep === i ? step.color : '#3b2d6b' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{step.icon}</div>
              {step.step}
            </button>
          ))}
        </div>

        <div style={{ padding: '0.6rem 0.875rem', background: `${s.color}08`, borderRadius: '8px', fontSize: '0.82rem', color: '#3b2d6b', marginBottom: '0.625rem' }}>
          {s.desc}
        </div>

        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} />
            <div className="ai-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ai-code-dot" style={{ background: s.color }} />
            <span style={{ marginLeft: '0.5rem', color: s.color }}>{s.icon} {s.step} — Python / LangChain</span>
          </div>
          <div className="ai-code" style={{ fontSize: '0.75rem', maxHeight: 360, overflowY: 'auto' }}>{s.code}</div>
        </div>
      </div>

      {/* 向量数据库对比 */}
      <div className="ai-section">
        <h2 className="ai-section-title">🗄️ 向量数据库选型对比</h2>
        <div className="ai-card">
          <table className="ai-table">
            <thead><tr><th>数据库</th><th>适用场景</th><th>混合检索</th><th>云托管</th><th>推荐指数</th></tr></thead>
            <tbody>
              {[
                ['Qdrant', '生产+高性能，支持过滤', '✅ 支持 BM25+向量', '✅ Qdrant Cloud', '⭐⭐⭐⭐⭐'],
                ['Pinecone', '纯云托管，无需运维', '✅ 支持', '✅ 全托管', '⭐⭐⭐⭐'],
                ['Weaviate', '图谱+向量混合', '✅ 支持', '✅ 支持', '⭐⭐⭐⭐'],
                ['ChromaDB', '本地开发/原型', '❌ 暂不支持', '❌ 本地', '⭐⭐⭐（开发）'],
                ['FAISS', '内存/离线/超快', '❌ 不支持', '❌ 本地', '⭐⭐（小规模）'],
                ['pgvector', '已有 PostgreSQL 的项目', '❌ 需扩展', '✅ 支持', '⭐⭐⭐（简单场景）'],
              ].map(([db, scene, hybrid, cloud, stars]) => (
                <tr key={db}>
                  <td style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>{db}</td>
                  <td style={{ fontSize: '0.78rem' }}>{scene}</td>
                  <td style={{ fontSize: '0.75rem', color: hybrid.startsWith('✅') ? '#10b981' : '#3b2d6b' }}>{hybrid}</td>
                  <td style={{ fontSize: '0.75rem', color: cloud.startsWith('✅') ? '#10b981' : '#3b2d6b' }}>{cloud}</td>
                  <td style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{stars}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/llm-dev/lesson/prompting')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/llm-dev/lesson/rag-advanced')}>下一模块：RAG 进阶 →</button>
      </div>
    </div>
  );
}
