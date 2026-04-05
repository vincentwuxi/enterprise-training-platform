import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const SYSTEM_LAYERS = [
  { layer: '用户界面层', icon: '💬', color: '#38bdf8', services: ['Web React SPA（流式显示）', '微信小程序 / APP', 'Slack Bot 企业集成', 'REST / WebSocket API'] },
  { layer: '网关与路由层', icon: '🚪', color: '#f59e0b', services: ['FastAPI API Gateway（限流/鉴权）', '模型路由（GPT-4o/本地LLM）', '语义缓存（GPTCache + Qdrant）', '用户 Token 余额管理'] },
  { layer: 'RAG 检索引擎', icon: '🔍', color: '#a78bfa', services: ['Qdrant 向量数据库（混合检索）', 'BGE-Reranker 重排序', '多查询扩展（Query Expansion）', '文档摄入 Pipeline（LangChain）'] },
  { layer: 'LLM 推理服务', icon: '🤖', color: '#10b981', services: ['vLLM 本地模型（主力）', 'OpenAI GPT-4o（复杂问题）', 'Embedding 服务（BGE / OpenAI）', 'LoRA 专域微调模型（选配）'] },
  { layer: '数据存储层', icon: '🗄️', color: '#ec4899', services: ['PostgreSQL（用户数据/会话）', 'Qdrant（知识库向量索引）', 'Redis（缓存/限流计数器）', 'S3/OSS（原始文档存储）'] },
  { layer: '可观测性', icon: '📊', color: '#14b8a6', services: ['Prometheus + Grafana（指标）', 'LangSmith（LLM 调用追踪）', 'RAGAS 自动评测（答案质量）', 'Sentry（错误监控）'] },
];

const PROJECT_CODE = `# ── 企业知识库 AI 助手：完整后端实现 ──
# 技术栈：FastAPI + LangChain + Qdrant + vLLM

from fastapi import FastAPI, UploadFile, WebSocket
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationSummaryBufferMemory
from qdrant_client import QdrantClient
import asyncio, tempfile, os

app = FastAPI(title="Enterprise KB Assistant")

# ── 向量数据库 & 检索器初始化 ──
qdrant = QdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))
emb = OpenAIEmbeddings(
    model="text-embedding-3-large",
    openai_api_base=os.getenv("OPENAI_API_BASE"),
)
vectorstore = QdrantVectorStore(
    client=qdrant, collection_name="enterprise-kb", embedding=emb,
)

# 两阶段检索：Bi-Encoder 召回 → Cross-Encoder 重排
base_retriever = vectorstore.as_retriever(search_kwargs={"k": 20})
reranker = CrossEncoderReranker(
    model=HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-v2-m3"),
    top_n=5
)
retriever = ContextualCompressionRetriever(
    base_compressor=reranker, base_retriever=base_retriever
)

# LLM（vLLM 自托管，降低成本）
llm = ChatOpenAI(
    model="Qwen2.5-7B-Instruct",
    openai_api_base="http://vllm-server:8000/v1",
    openai_api_key="internal-key",
    temperature=0,
)

# ── API 路由 ──

# 1. 文档上传 & 入库
@app.post("/api/documents/upload")
async def upload_document(file: UploadFile, namespace: str = "general"):
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    
    loader = PyPDFLoader(tmp_path)
    docs = loader.load()
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=512, chunk_overlap=64
    )
    chunks = splitter.split_documents(docs)
    
    # 增加元数据（用于过滤检索范围）
    for chunk in chunks:
        chunk.metadata.update({"namespace": namespace, "filename": file.filename})
    
    vectorstore.add_documents(chunks)
    os.unlink(tmp_path)
    return {"message": f"成功入库 {len(chunks)} 个文本块"}

# 2. WebSocket 流式对话
@app.websocket("/ws/chat")
async def websocket_chat(ws: WebSocket, namespace: str = "general"):
    await ws.accept()
    
    memory = ConversationSummaryBufferMemory(
        llm=llm, max_token_limit=2000,
        return_messages=True, memory_key="chat_history"
    )
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm, retriever=retriever,
        memory=memory, verbose=False,
        combine_docs_chain_kwargs={"prompt": RAG_PROMPT}
    )
    
    while True:
        question = await ws.receive_text()
        
        # 流式回复（token by token）
        async for token in chain.astream({"question": question}):
            if "answer" in token:
                await ws.send_json({"type": "token", "content": token["answer"]})
        
        await ws.send_json({"type": "done"})

# 3. 知识库健康评估
@app.get("/api/kb/health")
async def kb_health():
    from ragas import evaluate
    from ragas.metrics import faithfulness, answer_relevancy
    # 运行抽样评测...
    return {"faithfulness": 0.91, "relevancy": 0.88, "status": "healthy"}`;

const FRONTEND_CODE = `// React 前端：流式显示 + 引用来源
import { useState, useRef, useEffect } from 'react';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const wsRef = useRef(null);

  const connect = () => {
    wsRef.current = new WebSocket('ws://api.example.com/ws/chat');
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'token') {
        // 流式追加 token
        setMessages(prev => {
          const msgs = [...prev];
          const last = msgs[msgs.length - 1];
          if (last?.role === 'assistant') {
            last.content += data.content;  // 字符级追加
          }
          return msgs;
        });
      }
    };
  };

  const send = () => {
    setMessages(prev => [
      ...prev,
      { role: 'user', content: input },
      { role: 'assistant', content: '' },  // 占位，等待流式填充
    ]);
    wsRef.current.send(input);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
      </div>
      <div className="input-bar">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()} />
        <button onClick={send}>发送</button>
      </div>
    </div>
  );
}`;

export default function LessonProject() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState(null);
  const [codeTab, setCodeTab] = useState('backend');
  const [checklist, setChecklist] = useState({});
  const toggle = k => setChecklist(p => ({ ...p, [k]: !p[k] }));

  const CHECKLIST = [
    '文档解析Pipeline支持PDF/Word/HTML/网页',
    '向量数据库（Qdrant）集群部署，含备份策略',
    '混合检索（向量+BM25）+ 重排序（BGE-Reranker）',
    'vLLM 部署本地模型，配置 AWQ 4bit 量化',
    '语义缓存（GPTCache）降低重复调用成本',
    'FastAPI Gateway：JWT鉴权/限流/错误处理',
    'WebSocket 流式回复（token级别）',
    '对话记忆（ConversationSummaryBufferMemory）',
    'RAGAS 自动评测（每日定时运行）',
    'LangSmith 调用链路追踪',
    'Prometheus + Grafana 监控仪表盘',
    'CI/CD：代码推送触发评测→自动部署',
  ];
  const done = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="lesson-ai">
      <div className="ai-badge green">🏭 module_08 — 生产实战</div>
      <div className="ai-hero">
        <h1>生产实战：企业知识库 AI 助手完整项目</h1>
        <p>把前7个模块融合成真实产品：<strong>文档上传 → 向量入库 → 混合检索 → LLM 生成 → 流式回复</strong>。这是2024年最高频的 LLM 应用落地场景。</p>
      </div>

      {/* 系统架构分层 */}
      <div className="ai-section">
        <h2 className="ai-section-title">🏗️ 系统架构六层（点击展开技术栈）</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {SYSTEM_LAYERS.map((layer, i) => (
            <div key={layer.layer} onClick={() => setActiveLayer(activeLayer === i ? null : i)}
              style={{ padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${activeLayer === i ? layer.color + '50' : 'rgba(255,255,255,0.06)'}`,
                background: activeLayer === i ? `${layer.color}08` : 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.05rem' }}>{layer.icon}</span>
                <span style={{ fontWeight: 700, color: layer.color, fontSize: '0.88rem', minWidth: 130 }}>{layer.layer}</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {activeLayer === i
                    ? layer.services.map(s => <span key={s} className="ai-tag" style={{ background: `${layer.color}12`, color: layer.color, fontSize: '0.7rem' }}>{s}</span>)
                    : <span style={{ fontSize: '0.72rem', color: '#3b2d6b' }}>{layer.services.join(' · ')}</span>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 代码实现 */}
      <div className="ai-section">
        <h2 className="ai-section-title">💻 完整代码实现</h2>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.625rem' }}>
          <button className={`ai-btn ${codeTab === 'backend' ? 'primary' : ''}`} onClick={() => setCodeTab('backend')}>🐍 FastAPI 后端</button>
          <button className={`ai-btn ${codeTab === 'frontend' ? 'primary' : ''}`} onClick={() => setCodeTab('frontend')}>⚛️ React 前端流式</button>
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} />
            <div className="ai-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ai-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>
              {codeTab === 'backend' ? '🐍 main.py — FastAPI + RAG + vLLM' : '⚛️ ChatInterface.jsx — 流式显示'}
            </span>
          </div>
          <div className="ai-code" style={{ fontSize: '0.73rem', maxHeight: 460, overflowY: 'auto' }}>
            {codeTab === 'backend' ? PROJECT_CODE : FRONTEND_CODE}
          </div>
        </div>
      </div>

      {/* 上线清单 */}
      <div className="ai-section">
        <h2 className="ai-section-title">✅ 生产上线清单（{done}/{CHECKLIST.length} 完成）</h2>
        <div className="ai-meter" style={{ marginBottom: '0.75rem' }}>
          <div className="ai-meter-fill" style={{ width: `${(done / CHECKLIST.length) * 100}%`, background: 'linear-gradient(90deg, #5b21b6, #8b5cf6, #10b981)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '0.3rem' }}>
          {CHECKLIST.map((item, i) => (
            <div key={i} onClick={() => toggle(i)}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.55rem 0.75rem', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.13s',
                background: checklist[i] ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${checklist[i] ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)'}` }}>
              <div style={{ width: 18, height: 18, border: `1.5px solid ${checklist[i] ? '#10b981' : '#3b2d6b'}`, borderRadius: '3px', background: checklist[i] ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                {checklist[i] ? '✓' : ''}
              </div>
              <span style={{ fontSize: '0.78rem', color: checklist[i] ? '#10b981' : '#3b2d6b' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 完成总结 */}
      <div className="ai-section">
        <div className="ai-card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(16,185,129,0.04))', borderColor: 'rgba(139,92,246,0.3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#a78bfa', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成 LLM 应用开发 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.5rem', textAlign: 'left' }}>
            {['✅ Transformer 架构原理 + 主流模型选型对比', '✅ 五大 Prompt Engineering 技术 + 交互沙箱', '✅ RAG Pipeline（加载/嵌入/向量库/检索）', '✅ RAG 进阶（混合/重排/HyDE/RAGAS 评估）', '✅ ReAct Agent 追踪 + 工具调用 + 多 Agent', '✅ LoRA 参数计算器 + QLoRA/DPO 微调代码', '✅ 量化选择器 + vLLM/Ollama/FastAPI 部署', '✅ 企业 AI 助手完整架构 + 生产代码'].map(s => (
              <div key={s} style={{ fontSize: '0.82rem', color: '#3b2d6b' }}>{s}</div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#f59e0b' }}>
            🏆 推荐认证：AWS AI Practitioner ⭐ Google Professional ML Engineer ⭐ DeepLearning.AI LLMOps Specialization
          </div>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/llm-dev/lesson/deploy')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/llm-dev')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
