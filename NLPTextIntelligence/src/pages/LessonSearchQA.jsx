import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['语义检索', '阅读理解', 'RAG 架构', 'RAG 优化'];

export default function LessonSearchQA() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge blue">🔎 module_06 — 搜索 / 问答 / RAG</div>
      <div className="fs-hero">
        <h1>搜索 / 问答 / RAG：语义检索 / 阅读理解 / 检索增强生成</h1>
        <p>
          搜索和问答是企业 NLP 的<strong>高频刚需场景</strong>。本模块从
          <strong>BM25 → 向量检索 → 混合检索</strong>的语义搜索全链路，
          到 <strong>抽取式/生成式 QA</strong>，最终深入当下最火的
          <strong>RAG (Retrieval-Augmented Generation)</strong> 架构与工程优化。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔎 搜索与问答</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎯 语义检索</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> semantic_search</div>
              <pre className="fs-code">{`# 语义检索: 超越关键词匹配

# ═══ 检索方法演进 ═══

# 1. BM25 (经典关键词检索)
# score(q, d) = Σ IDF(t) · TF(t,d) · (k+1) / (TF(t,d) + k·(1-b+b·|d|/avgdl))
# k=1.2, b=0.75 (默认参数)
# 优势: 稳定, 快速, 无需训练
# 缺点: 无法理解语义 ("汽车" 搜不到 "轿车")

from rank_bm25 import BM25Okapi
corpus = [doc.split() for doc in documents]
bm25 = BM25Okapi(corpus)
scores = bm25.get_scores(query.split())

# 2. Dense Retrieval (向量检索)
# 用 BERT 编码 query 和 document → 余弦相似度
# 双塔模型: query encoder + doc encoder (独立编码)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('BAAI/bge-large-zh-v1.5')
q_emb = model.encode(["什么是机器学习"])
d_embs = model.encode(documents)
# cosine_similarity(q_emb, d_embs) → 排序

# 3. 混合检索 (Hybrid) — 生产环境首选!
# BM25 + Dense + 交叉编码器重排
hybrid_pipeline = {
    "阶段1 - 召回": "BM25 top-100 ∪ Dense top-100",
    "阶段2 - 精排": "Cross-Encoder 重排序 top-200 → top-10",
    "阶段3 - 业务": "时间/权限/业务规则过滤",
}

# ═══ 向量数据库 ═══
vector_databases = {
    "Milvus":      "开源, 分布式, 高性能",
    "Pinecone":    "托管服务, 开箱即用",
    "Weaviate":    "混合检索, GraphQL API",
    "Qdrant":      "Rust 实现, 过滤检索强",
    "Chroma":      "轻量, 适合原型",
    "FAISS":       "Meta 出品, 纯库非数据库",
}

# ═══ Embedding 模型选型 ═══
# MTEB 排行榜 (Massive Text Embedding Benchmark)
embedding_models = {
    "BGE-M3":           "多语言, 多粒度, 多功能",
    "E5-Large-v2":      "微软, 通用性强",
    "GTE-Qwen2":        "阿里, 中文最强之一",
    "Cohere Embed v3":  "商用 API, 效果好",
    "Voyage-3":         "Anthropic 投资, 代码检索强",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📖 阅读理解与问答</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> reading_comprehension</div>
              <pre className="fs-code">{`# 机器阅读理解 (MRC): 给定文档, 回答问题

# ═══ 任务类型 ═══
mrc_types = {
    "抽取式": "答案是文档中的一个片段 (SQuAD)",
    "生成式": "答案需要模型生成 (NarrativeQA)",
    "多选式": "从选项中选择 (RACE)",
    "判断式": "是/否 (BoolQ)",
}

# ═══ 抽取式 QA (BERT) ═══
# 输入: [CLS] question [SEP] context [SEP]
# 输出: start_logits, end_logits
# 答案: context[start:end]

from transformers import pipeline
qa = pipeline("question-answering", model="bert-large-chinese-qa")
result = qa(
    question="华为的总部在哪里?",
    context="华为技术有限公司总部位于深圳，是全球领先的ICT公司。"
)
# {'answer': '深圳', 'score': 0.95, 'start': 9, 'end': 11}

# ═══ 生成式 QA ═══
# 用 Seq2Seq 模型 (T5/BART) 生成答案
# 输入: "question: 什么是Python? context: Python是一种编程语言..."
# 输出: "Python是一种高级编程语言, 以简洁易读著称"
# 优势: 可以综合多处信息, 生成更自然的答案

# ═══ 多跳推理 (Multi-hop QA) ═══
# "LeBron James 效力的球队所在城市的人口?"
# 1. LeBron James → Lakers
# 2. Lakers → Los Angeles  
# 3. Los Angeles → 人口 3.9M
# → 需要多步检索和推理

# ═══ 表格问答 (Table QA) ═══
# 从结构化表格中回答问题
# "2023年Q3营收比Q2增长了多少?"
# → 需要定位表格单元格 + 计算
# 方法: TAPAS / TaPEx / LLM with SQL

# ═══ 对话式问答 ═══
# 多轮对话中的问答, 需要理解上下文
# Q1: "Python是什么?"  A1: "一种编程语言"
# Q2: "它有什么优势?"  → "它" = Python
# → 需要共指消解 + 对话历史建模`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏗️ RAG 架构</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> rag_architecture</div>
              <pre className="fs-code">{`# RAG: Retrieval-Augmented Generation
# 2024-2025 企业 AI 落地的核心架构

# ═══ RAG 解决什么问题? ═══
# 1. LLM 知识截止: 不知道最新信息
# 2. 幻觉: 编造不存在的事实
# 3. 领域知识: 不懂企业内部知识
# → RAG = 先检索相关知识, 再让 LLM 基于知识生成

# ═══ RAG 基本流程 ═══
# 1. 索引 (Indexing):  文档 → 切片 → 嵌入 → 向量库
# 2. 检索 (Retrieval): 查询 → 嵌入 → 向量检索 → top-k
# 3. 生成 (Generation): 查询 + top-k 文档 → LLM 生成答案

# ═══ 文档处理管线 ═══
class RAGPipeline:
    def __init__(self):
        self.embedder = SentenceTransformer('BAAI/bge-large-zh-v1.5')
        self.vectordb = Milvus()
        self.llm = ChatOpenAI(model="gpt-4o")
    
    # Step 1: 离线索引
    def index(self, documents):
        chunks = self.chunk_documents(documents)  # 切片
        embeddings = self.embedder.encode(chunks)  # 嵌入
        self.vectordb.insert(chunks, embeddings)   # 存储
    
    # Step 2-3: 在线检索+生成
    def query(self, question, top_k=5):
        q_emb = self.embedder.encode([question])
        docs = self.vectordb.search(q_emb, top_k=top_k)  # 检索
        prompt = f"""基于以下知识回答问题:
        
知识: {docs}

问题: {question}

如果知识中没有相关信息, 请说"我不确定"。"""
        return self.llm.invoke(prompt)  # 生成

# ═══ 文档切片策略 ═══
chunking_strategies = {
    "固定长度":       "512 tokens, 重叠 50 tokens",
    "语义切片":       "按段落/章节/主题切分",
    "递归切片":       "先按\\n\\n, 再按\\n, 再按句号",
    "Sentence Window": "每个句子为中心, 检索时返回窗口",
    "Parent-Child":    "小片段检索, 返回大上下文",
}

# ═══ RAG 框架对比 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │ 框架          │ 特点         │ 场景         │
# ├──────────────┼──────────────┼──────────────┤
# │ LangChain    │ 生态丰富     │ 快速原型     │
# │ LlamaIndex   │ 索引优化强   │ 知识库       │
# │ Haystack     │ Pipeline 化  │ 生产系统     │
# │ RAGFlow      │ 中文优化     │ 企业部署     │
# │ Dify         │ 低代码       │ 非技术人员   │
# └──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ RAG 高级优化</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> rag_optimization</div>
              <pre className="fs-code">{`# RAG 不是开箱即用的 — 需要系统优化!

# ═══ 检索优化 ═══
retrieval_optimization = {
    "Query Rewriting": {
        "HyDE":     "先让 LLM 生成假设答案, 再用答案检索",
        "Multi-Query": "将用户问题改写为多个检索查询",
        "Step-Back": "抽象问题到更高层次再检索",
    },
    "Reranking": {
        "Cross-Encoder": "BERT 交叉编码精排",
        "Cohere Rerank":  "API 重排序服务",
        "LLM Rerank":    "让 LLM 判断文档相关性",
    },
    "混合检索": {
        "BM25 + Dense":   "关键词 + 语义互补",
        "倒数排序融合":    "RRF: 1/(k+rank) 合并多路排名",
    },
}

# ═══ 生成优化 ═══
generation_optimization = {
    "上下文压缩":  "Long Context → 压缩到关键信息",
    "引用标注":    "答案中标注来源 [1][2]",
    "自我反思":    "Self-RAG: 判断是否需要检索, 验证答案",
    "多轮对话":    "保持对话历史, 上下文跟踪",
}

# ═══ Advanced RAG 架构 ═══

# 1. Corrective RAG (CRAG)
# 检索 → 评估文档质量 → 不好则 Web 搜索补充

# 2. Self-RAG (2023)
# 模型学会4种反思token:
# [Retrieve]: 是否需要检索?
# [IsRelevant]: 文档是否相关?
# [IsSupported]: 答案有文档支持?
# [IsUseful]: 答案对用户有用?

# 3. Agentic RAG (2024-2025)
# RAG + Agent: 
# 多工具: 向量检索 + SQL查询 + API调用
# 多步推理: 迭代检索 → 推理 → 验证
# 自主决策: 判断何时检索, 何时直接回答

# ═══ RAG 评估 ═══
rag_metrics = {
    "检索质量": {
        "Recall@k":       "相关文档是否被检索到",
        "MRR":            "第一个相关文档的排名",
        "NDCG":           "排序质量",
    },
    "生成质量": {
        "Faithfulness":   "答案忠实于检索文档",
        "Answer Relevancy": "答案与问题相关",
        "Context Precision": "检索的文档精确度",
    },
    "端到端": {
        "Answer Correctness": "答案正确性",
        "RAGAS":              "综合评估框架",
    },
}

# ═══ RAGAS 评估实战 ═══
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy
results = evaluate(dataset, metrics=[faithfulness, answer_relevancy])`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
