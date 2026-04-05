import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ADV_TECHNIQUES = [
  {
    name: '混合检索', icon: '🔀', color: '#a78bfa',
    desc: '向量检索（语义）+ BM25（关键词）融合，用 RRF 算法合并排名。解决向量检索对精确专有名词/编号匹配弱的问题。',
    code: `from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever

# 向量检索器（语义相似度）
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# BM25 检索器（关键词精确匹配）
bm25_retriever = BM25Retriever.from_documents(documents)
bm25_retriever.k = 5

# Ensemble：RRF 融合排名（各0.5权重）
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.5, 0.5]  # 可调整，关键词查询可提高BM25权重
)

# 何时使用混合检索？
# - 文档包含大量专有名词、型号、编码
# - 用户可能用精确关键词搜索（如"合同GB-2024-001"）
# - 向量检索查不到的边缘case

results = ensemble_retriever.invoke("什么是 GB-2024-001 合同条款？")` },
  {
    name: '重排序 (Reranking)', icon: '🎯', color: '#10b981',
    desc: '召回Top-20后，用Cross-Encoder精排到Top-5。召回用Bi-Encoder（快），精排用Cross-Encoder（准），两阶段检索显著提升质量。',
    code: `# 两阶段检索：召回 → 重排序
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

# 第一阶段：快速召回 Top-20（Bi-Encoder）
base_retriever = vectorstore.as_retriever(search_kwargs={"k": 20})

# 第二阶段：精确重排序（Cross-Encoder，慢但准）
model = HuggingFaceCrossEncoder(
    model_name="BAAI/bge-reranker-v2-m3",  # 中英文双语重排序
    model_kwargs={"device": "cuda"}
)
compressor = CrossEncoderReranker(model=model, top_n=5)  # 精选5条

# 两阶段检索器
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=base_retriever
)

# 使用（与普通检索器接口一致）
results = compression_retriever.invoke("年假政策是什么？")
# Bi-Encoder 先召回20个，Cross-Encoder 精排后返回5个最相关的` },
  {
    name: 'HyDE 假设文档', icon: '✨', color: '#38bdf8',
    desc: 'HyDE (Hypothetical Document Embeddings)：先让 LLM 生成一篇假设性回答，用假设回答的向量而非问题向量去检索，命中率更高。',
    code: `from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# HyDE：用 LLM 生成假设文档，以此向量检索
HYDE_PROMPT = ChatPromptTemplate.from_template("""
请为以下问题写一段简短的假设性回答，假设文档中有完整信息。
仅写回答内容，不要引言。

问题：{question}
假设性回答：""")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)

# HyDE Chain
hyde_chain = (
    HYDE_PROMPT
    | llm 
    | StrOutputParser()
)

# 使用 HyDE 生成假设文档
question = "公司报销的最高限额是多少？"
hypothetical_doc = hyde_chain.invoke({"question": question})
# 生成："公司报销政策规定，国内出差每日餐饮限额150元，住宿限额500元..."

# 用假设文档的向量检索（而非用问题向量）
results = vectorstore.similarity_search(hypothetical_doc, k=5)
# 效果：找到真实的报销政策文档，准确率显著提升` },
  {
    name: '多查询扩展', icon: '🔄', color: '#f59e0b',
    desc: '一个用户问题可能用多种角度提问。大模型自动生成3-5个等价问题，并行检索后去重合并，全面覆盖相关文档。',
    code: `from langchain.retrievers.multi_query import MultiQueryRetriever

# 多查询检索：从不同角度扩展问题
multi_retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(k=5),
    llm=ChatOpenAI(model="gpt-4o-mini", temperature=0.3),
)

# 原始问题："年假怎么申请？"
# 模型自动生成3个角度（内部过程）：
# 1. "员工年假申请的流程是什么？"
# 2. "如何在系统中提交年假申请？"
# 3. "年假申请需要提前多少天？"

# 并行检索 3 个问题，合并去重结果
results = multi_retriever.invoke("年假怎么申请？")
# 比单一问题检索召回率提升约 25%

# 自定义查询生成 Prompt（可针对你的领域优化）
from langchain.retrievers.multi_query import MultiQueryRetriever

custom_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一名HR专家，生成5个与以下问题等价的HR相关查询"),
    ("user", "原始问题：{question}\\n请生成5个角度不同的相关问题（每行一个）：")
])` },
  {
    name: 'RAG 评估体系', icon: '📊', color: '#ec4899',
    desc: 'RAGAS 框架：上下文精确率/召回率/回答忠实度/回答相关性四维评测，量化 RAG 系统质量。',
    code: `from ragas import evaluate
from ragas.metrics import (
    faithfulness,          # 忠实度：回答是否基于检索内容（防幻觉）
    answer_relevancy,      # 相关性：回答是否回应了问题
    context_precision,     # 上下文精确率：检索块是否与答案相关
    context_recall,        # 上下文召回率：参考答案所需内容是否都被检索到
)
from datasets import Dataset

# 准备评测数据集
eval_data = {
    "question": ["年假政策是什么？", "如何申请报销？"],
    "answer": [rag_answers[0], rag_answers[1]],          # RAG 生成的回答
    "contexts": [retrieved_docs[0], retrieved_docs[1]],  # 检索到的文档块
    "ground_truth": ["员工年假...", "报销申请流程..."],  # 人工编写的参考答案
}

result = evaluate(
    Dataset.from_dict(eval_data),
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall]
)

print(result)
# {'faithfulness': 0.92, 'answer_relevancy': 0.88,
#  'context_precision': 0.85, 'context_recall': 0.91}
# 
# 🎯 生产标准：各指标 > 0.80 才可上线` },
];

export default function LessonRAGAdvanced() {
  const navigate = useNavigate();
  const [activeTech, setActiveTech] = useState(0);

  const t = ADV_TECHNIQUES[activeTech];

  return (
    <div className="lesson-ai">
      <div className="ai-badge blue">🚀 module_04 — RAG 进阶</div>
      <div className="ai-hero">
        <h1>RAG 进阶：混合检索 / 重排序 / 评估体系</h1>
        <p>基础 RAG 在生产中往往召回率不足 70%。进阶技术——<strong>混合检索 + 重排序 + HyDE</strong>——可将质量提升至 90%+。再配合 RAGAS 评估框架，形成可迭代的优化循环。</p>
      </div>

      {/* 五大进阶技术 */}
      <div className="ai-section">
        <h2 className="ai-section-title">⚡ RAG 进阶五大技术（切换查看代码）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {ADV_TECHNIQUES.map((tech, i) => (
            <button key={i} onClick={() => setActiveTech(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s',
                border: `1px solid ${activeTech === i ? tech.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTech === i ? `${tech.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTech === i ? tech.color : '#3b2d6b' }}>
              <div style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>{tech.icon}</div>
              {tech.name}
            </button>
          ))}
        </div>

        <div style={{ padding: '0.625rem 0.875rem', background: `${t.color}08`, borderRadius: '8px', fontSize: '0.82rem', color: '#3b2d6b', marginBottom: '0.625rem' }}>
          {t.desc}
        </div>

        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} />
            <div className="ai-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ai-code-dot" style={{ background: t.color }} />
            <span style={{ marginLeft: '0.5rem', color: t.color }}>{t.icon} {t.name} — Python 代码</span>
          </div>
          <div className="ai-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      {/* 效果提升对比 */}
      <div className="ai-section">
        <h2 className="ai-section-title">📈 技术叠加效果对比（答案忠实度）</h2>
        <div className="ai-card">
          {[
            { name: '基础 RAG（向量检索）', score: 0.68, color: '#3b2d6b' },
            { name: '+ 混合检索（+BM25）', score: 0.76, color: '#f59e0b' },
            { name: '+ 重排序（+Reranker）', score: 0.84, color: '#10b981' },
            { name: '+ HyDE + 多查询', score: 0.91, color: '#a78bfa' },
            { name: '+ Fine-tuned Embedding', score: 0.95, color: '#38bdf8' },
          ].map(item => (
            <div key={item.name} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: item.color, fontWeight: item.score > 0.8 ? 700 : 400 }}>{item.name}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: item.score > 0.8 ? '#10b981' : '#f59e0b' }}>{(item.score * 100).toFixed(0)}%</span>
              </div>
              <div className="ai-meter">
                <div className="ai-meter-fill" style={{ width: `${item.score * 100}%`, background: `linear-gradient(90deg, ${item.color}80, ${item.color})` }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: '0.75rem', color: '#3b2d6b', marginTop: '0.5rem' }}>🎯 生产标准：忠实度 &gt; 0.80。评测工具：RAGAS</div>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/llm-dev/lesson/rag-basics')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/llm-dev/lesson/agent')}>下一模块：AI Agent →</button>
      </div>
    </div>
  );
}
