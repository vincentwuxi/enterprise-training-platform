import { useState } from 'react';
import './LessonCommon.css';

const PROMPT_TABS = ['basic', 'citation', 'hallucination', 'structured'];

export default function LessonGeneration() {
  const [tab, setTab] = useState('basic');

  const codes = {
    basic: `# ━━━━ RAG Prompt 核心模板 ━━━━
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """你是一个专业的知识库助手。
请严格基于以下参考文档回答用户问题。

规则：
1. 只使用参考文档中的信息回答，不要添加文档中没有的内容
2. 如果文档中没有相关信息，明确说"根据现有文档，我无法回答这个问题"
3. 回答要简洁准确，保持与文档一致的表述
4. 如有多个文档支持，综合所有文档给出完整回答

参考文档：
{context}"""),
    ("human", "{question}"),
])

# 完整 RAG Chain
def rag_answer(question: str, retrieved_docs: list) -> str:
    context = "\n\n---文档分隔---\n\n".join([
        f"[文档{i+1}] {doc.page_content}"
        for i, doc in enumerate(retrieved_docs)
    ])
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    chain = RAG_PROMPT | llm
    
    response = chain.invoke({
        "context": context,
        "question": question,
    })
    return response.content`,

    citation: `# ━━━━ 带引用溯源的 RAG Prompt ━━━━
CITATION_PROMPT = """你是一个专业助手，严格基于参考文档回答问题。
回答时，每个关键陈述后用 [来源N] 标注来自哪个文档。

参考文档：
{context}

用户问题：{question}

回答格式：
[正式的回答内容，关键点后标注[来源1]、[来源2]等]

引用来源：
- [来源1]：文档标题 - 具体页码/章节
- [来源2]：...

如果某个观点没有文档支持，不要回答该部分。"""

# 格式化文档（包含元数据）
def format_docs_with_citation(docs: list) -> str:
    parts = []
    for i, doc in enumerate(docs):
        meta = doc.metadata
        source_info = f"{meta.get('source', '未知文档')} P{meta.get('page', '?')}"
        parts.append(f"[来源{i+1}] ({source_info})\n{doc.page_content}")
    return "\n\n".join(parts)

# 结果示例：
# "退货期限为30天 [来源1]，但特殊商品（生鲜/电子）不适用 [来源2]。
# 
# 引用来源：
# - [来源1]: 产品使用手册.pdf P12 退货政策章节
# - [来源2]: 特殊商品说明.pdf P3"`,

    hallucination: `# ━━━━ 幻觉控制策略 ━━━━

# 策略1：明确设置 temperature=0（确定性输出）
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 策略2：在 Prompt 中强制约束
STRICT_PROMPT = """基于以下文档回答，如果文档没有明确提到相关内容，
回答："抱歉，根据当前文档库，我无法找到关于"{question}"的准确信息。
建议您联系客服获取最新信息。"

严禁：
- 推测或猜测文档中没有的信息
- 说"可能"、"大概"、"应该"等模糊词（除非文档本身用了这些词）
- 混入你自己的知识（只用文档内容）

文档：{context}
问题：{question}"""

# 策略3：置信度检测（事后验证）
VERIFY_PROMPT = """给定用户问题、参考文档和AI回答，判断回答是否有幻觉。

问题：{question}
参考文档：{context}
AI回答：{answer}

判断标准：
- FAITHFUL：回答完全基于文档
- HALLUCINATION：包含文档中没有的信息

只输出 FAITHFUL 或 HALLUCINATION，不要解释。"""

def check_hallucination(question, context, answer) -> bool:
    result = llm.invoke(VERIFY_PROMPT.format(...)).content
    return result.strip() == "HALLUCINATION"`,

    structured: `# ━━━━ 结构化输出（带 Pydantic 验证）━━━━
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser

class RAGResponse(BaseModel):
    answer: str = Field(description="基于文档的回答")
    confidence: float = Field(ge=0, le=1, description="置信度 0-1")
    has_answer: bool = Field(description="文档中是否有足够信息回答")
    sources: list[str] = Field(description="引用的来源文件列表")
    follow_up: list[str] = Field(description="建议的追问问题", max_items=3)

parser = PydanticOutputParser(pydantic_object=RAGResponse)

STRUCTURED_PROMPT = """基于以下文档回答问题。

{format_instructions}

文档：{context}
问题：{question}"""

chain = (
    ChatPromptTemplate.from_template(STRUCTURED_PROMPT)
    | ChatOpenAI(model="gpt-4o-mini", temperature=0)
    | parser
)

result: RAGResponse = chain.invoke({
    "context": context,
    "question": "退货流程是什么？",
    "format_instructions": parser.get_format_instructions(),
})

# result.answer        → "退货需在30天内..."
# result.confidence    → 0.92
# result.has_answer    → True
# result.sources       → ["product_manual.pdf"]
# result.follow_up     → ["退款多久到账？", "哪些商品不支持退货？"]`,
  };

  return (
    <div className="rag-lesson">
      <div className="rag-hero">
        <div className="rag-badge">// MODULE 06 · GENERATION & PROMPTING</div>
        <h1>生成与 RAG Prompt 工程</h1>
        <p>检索做得再好，Prompt 不对，生成质量也会崩。RAG Prompt 工程有其独特的挑战：<strong>如何约束模型只用检索到的内容</strong>、如何实现引用溯源、如何控制幻觉——这些是生产级 RAG 的核心。</p>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">✍️ RAG Prompt 四种核心模式</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['basic', '📝 基础模板'], ['citation', '📎 引用溯源'], ['hallucination', '🛡️ 幻觉控制'], ['structured', '📦 结构化输出']].map(([k, l]) => (
            <button key={k} className={`rag-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="rag-code-wrap">
          <div className="rag-code-head">
            <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_prompt.py</span>
          </div>
          <div className="rag-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">⚡ Context 窗口优化策略</div>
        <div className="rag-card" style={{ overflowX: 'auto' }}>
          <table className="rag-table">
            <thead><tr><th>策略</th><th>描述</th><th>适用场景</th><th>实现复杂度</th></tr></thead>
            <tbody>
              {[
                ['Lost-in-middle 问题', 'LLM 倾向关注上下文头尾，中间内容被遗忘', '长上下文（>4K tokens）', '⭐ 将最重要文档放首位'],
                ['文档压缩（Compression）', '先用小模型压缩每个文档到关键句，再送LLM', '大量文档，Token成本敏感', '⭐⭐'],
                ['Map-Reduce', '每个文档单独生成摘要，最后合并综合', '需要综合大量文档的问题', '⭐⭐⭐'],
                ['Refine Chain', '逐文档迭代细化答案（前一个答案 + 新文档 → 新答案）', '需要全面考虑所有来源', '⭐⭐⭐'],
                ['上下文排序优化', '按相关性分数降序排列（最相关的放前面）', '通用，代价最低', '⭐'],
              ].map(([s, d, a, c], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--rag-emerald)', fontSize: '0.85rem' }}>{s}</td>
                  <td style={{ color: 'var(--rag-muted)', fontSize: '0.83rem' }}>{d}</td>
                  <td style={{ color: 'var(--rag-muted)', fontSize: '0.83rem' }}>{a}</td>
                  <td style={{ fontSize: '0.83rem' }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rag-warn">
          ⚠️ <strong>Lost-in-the-Middle 警告：</strong>Stanford 研究表明，当上下文长度超过 4K tokens，LLM 对中间部分的注意力急剧下降。始终把最相关的文档放在 context 的<strong>开头和结尾</strong>。
        </div>
      </div>
    </div>
  );
}
