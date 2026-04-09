import { useState } from 'react';
import './LessonCommon.css';

const VS_ITEMS = [
  { dim: '适合场景', rag: '知识经常更新（文档/规则/产品信息）', ft: '固定任务风格/格式（摘要风格、特定语气）' },
  { dim: '知识边界', rag: '动态扩展，添加文档即生效', ft: '训练截止后固定，更新需重新训练' },
  { dim: '可追溯性', rag: '✅ 能引用来源文档', ft: '❌ 黑盒，无法知道答案来自哪里' },
  { dim: '幻觉控制', rag: '✅ "只回答检索到的内容"', ft: '❌ 易自信地说错，难以约束范围' },
  { dim: '开发成本', rag: '低（1-2 周上线原型）', ft: '高（数据标注+训练+评估，数月）' },
  { dim: '运行成本', rag: '每次查询需检索+调用 LLM', ft: '调用成本低（模型已内置知识）' },
  { dim: '冷启动', rag: '任何语料直接可用', ft: '需要 1000+ 标注样本才能有效果' },
];

const PIPELINE_STEPS = [
  { label: 'Document Loader', desc: 'PDF/Word/Web/DB', icon: '📄' },
  { label: 'Text Splitter', desc: 'Chunking 策略', icon: '✂️' },
  { label: 'Embedding Model', desc: '文本→向量', icon: '🔢' },
  { label: 'Vector Store', desc: '索引存储', icon: '🗄️' },
  { label: 'Retriever', desc: '相似度检索', icon: '🔍' },
  { label: 'Reranker', desc: '精排结果', icon: '📊' },
  { label: 'LLM + Prompt', desc: '生成回答', icon: '🤖' },
];

const WHEN_RAG = [
  { use: true,  case: '企业知识库问答（HR 政策/产品文档）', reason: '文档频繁更新，需要引用溯源' },
  { use: true,  case: '客服自动化（基于产品手册）', reason: '答案必须限定在已知范围内' },
  { use: true,  case: '代码库 Q&A / 技术文档检索', reason: '大量私有代码文档无法进入训练集' },
  { use: true,  case: '法律/合同审查辅助', reason: '确保每句话有明确文件来源' },
  { use: false, case: '文本风格统一（摘要/翻译）', reason: '风格任务用 Fine-tuning 更稳定' },
  { use: false, case: '实体识别/结构化抽取', reason: '结构化任务 FT 准确率更高' },
  { use: false, case: '代码生成（通用编程任务）', reason: 'Codex 类模型已内置充分知识' },
];

export default function LessonFoundation() {
  const [show, setShow] = useState('pipeline');

  return (
    <div className="rag-lesson">
      <div className="rag-hero">
        <div className="rag-badge">// MODULE 01 · RAG FUNDAMENTALS</div>
        <h1>RAG 原理与架构</h1>
        <p>检索增强生成（Retrieval-Augmented Generation）是 2025 年企业 AI 落地的<strong>首选架构</strong>。理解它的完整 pipeline、与 Fine-tuning 的本质区别、以及何时该用 RAG，是每个 AI 工程师的核心竞争力。</p>
      </div>

      {/* Stats */}
      <div className="rag-section">
        <div className="rag-grid-4">
          {[
            { v: '74%', l: '企业采用RAG作为主要AI落地方式' },
            { v: '3-4×', l: '比微调更快的原型验证速度' },
            { v: '85%+', l: '事实准确率（良好RAG系统）' },
            { v: '2周', l: 'RAG MVP 上线典型时间' },
          ].map((s, i) => (
            <div key={i} className="rag-metric">
              <div className="rag-metric-val">{s.v}</div>
              <div className="rag-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div className="rag-section">
        <div className="rag-section-title">🔄 RAG 完整 Pipeline</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {['pipeline', 'code', 'arch'].map(t => (
            <button key={t} className={`rag-btn ${show === t ? 'active' : ''}`} onClick={() => setShow(t)}>
              {t === 'pipeline' ? '📊 流程图' : t === 'code' ? '💻 代码' : '🏗️ 系统设计'}
            </button>
          ))}
        </div>
        {show === 'pipeline' && (
          <div>
            <div className="rag-card" style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--rag-muted)', marginBottom: '0.75rem', fontWeight: 700 }}>📥 INDEXING PHASE（离线，文档入库时执行一次）</div>
              <div className="rag-pipeline">
                {PIPELINE_STEPS.slice(0, 4).map((s, i) => (
                  <div key={i} className="rag-pipe-step">
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                    <div className="rag-pipe-label">{s.label}</div>
                    <div className="rag-pipe-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rag-card">
              <div style={{ fontSize: '0.78rem', color: 'var(--rag-muted)', marginBottom: '0.75rem', fontWeight: 700 }}>🔍 RETRIEVAL + GENERATION PHASE（在线，每次查询执行）</div>
              <div className="rag-pipeline">
                {[{ label: 'User Query', desc: '用户问题', icon: '💬' }, ...PIPELINE_STEPS.slice(1, 3), ...PIPELINE_STEPS.slice(4)].map((s, i) => (
                  <div key={i} className="rag-pipe-step" style={{ borderColor: i >= 4 ? 'rgba(14,165,233,0.2)' : undefined }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                    <div className="rag-pipe-label" style={{ color: i >= 4 ? 'var(--rag-teal)' : undefined }}>{s.label}</div>
                    <div className="rag-pipe-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {show === 'code' && (
          <div className="rag-code-wrap">
            <div className="rag-code-head">
              <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>rag_pipeline.py</span>
            </div>
            <div className="rag-code">{`# ━━━━ 最简 RAG Pipeline（LangChain）━━━━
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA

# ━━━━ INDEXING PHASE（一次性）━━━━
# 1. 加载文档
loader = PyPDFLoader("product_manual.pdf")
documents = loader.load()

# 2. 切分（Chunking）
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=64,
    separators=["\n\n", "\n", "。", "！", "？", " ", ""],
)
chunks = splitter.split_documents(documents)
print(f"文档切分为 {len(chunks)} 个 chunks")

# 3. Embedding + 存入向量数据库
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",
)

# ━━━━ RETRIEVAL + GENERATION PHASE（每次查询）━━━━
# 4. 创建 Retriever
retriever = vectorstore.as_retriever(
    search_type="mmr",      # Maximum Marginal Relevance（多样性+相关性）
    search_kwargs={"k": 5, "fetch_k": 20},
)

# 5. 构建 RAG Chain
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True,
)

# 6. 查询
result = qa_chain.invoke({"query": "产品的退货政策是什么？"})
print("答案：", result["result"])
print("来源：", [doc.metadata for doc in result["source_documents"]])`}</div>
          </div>
        )}
        {show === 'arch' && (
          <div className="rag-card">
            <div className="rag-code-wrap" style={{ margin: 0 }}>
              <div className="rag-code-head"><span>architecture.md</span></div>
              <div className="rag-code">{`# RAG 系统设计决策点

## 规模分级

### 小型（<10万文档）：单机部署
Documents → Chroma/FAISS（本地）→ 单个 LLM API
适合：POC、小团队内部工具、快速原型

### 中型（10万-1000万文档）：托管向量DB
Documents → Pinecone/Weaviate（云托管）→ LLM API
+ Redis 缓存高频查询
适合：生产级产品、SaaS 服务

### 大型（>1000万文档）：自托管分布式
Documents → pgvector with pg partition / Milvus → 
  负载均衡 → 多 LLM 实例
+ 查询缓存 + Reranker 服务
适合：企业级、高并发、数据隐私要求高

## 关键设计决策

1. Chunking 策略 → 影响检索召回率（最重要）
2. Embedding 模型 → 决定语义理解质量
3. 向量数据库 → 决定规模和成本
4. 检索策略 → 精度 vs 速度权衡
5. Reranker → 精准度的最后一道关键优化
6. Prompt 设计 → 决定生成质量和幻觉程度`}</div>
            </div>
          </div>
        )}
      </div>

      {/* RAG vs Fine-tuning */}
      <div className="rag-section">
        <div className="rag-section-title">⚔️ RAG vs Fine-tuning：选型决策指南</div>
        <div className="rag-card" style={{ overflowX: 'auto', marginBottom: '1rem' }}>
          <table className="rag-table">
            <thead><tr><th>维度</th><th style={{ color: 'var(--rag-emerald)' }}>RAG</th><th style={{ color: 'var(--rag-purple)' }}>Fine-tuning</th></tr></thead>
            <tbody>
              {VS_ITEMS.map((v, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--rag-text)', fontSize: '0.85rem' }}>{v.dim}</td>
                  <td style={{ color: 'var(--rag-muted)', fontSize: '0.84rem' }}>{v.rag}</td>
                  <td style={{ color: 'var(--rag-muted)', fontSize: '0.84rem' }}>{v.ft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {WHEN_RAG.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.65rem', borderRadius: 8, background: 'var(--rag-card)', border: '1px solid var(--rag-border)' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{w.use ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{w.case}</div>
                <div style={{ color: 'var(--rag-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{w.reason}</div>
              </div>
              <span className={`rag-tag ${w.use ? 'green' : 'red'}`} style={{ flexShrink: 0, marginLeft: 'auto', alignSelf: 'center' }}>{w.use ? 'RAG ✓' : 'FT 更好'}</span>
            </div>
          ))}
        </div>
        <div className="rag-tip" style={{ marginTop: '1rem' }}>
          💡 <strong>最佳实践：RAG + Fine-tuning 结合</strong> — Fine-tuning 调整模型的输出格式和语气，RAG 提供最新的知识。两者不互斥，高级场景常结合使用。
        </div>
      </div>
    </div>
  );
}
