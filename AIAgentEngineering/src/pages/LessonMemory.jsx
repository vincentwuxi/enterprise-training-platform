import { useState } from 'react';
import './LessonCommon.css';

const MEMORY_TYPES = [
  {
    type: '工作记忆', en: 'Working Memory', icon: '⚡',
    desc: 'LLM 的上下文窗口，包含当前对话、工具结果、系统提示',
    limit: '最大 128K~1M token（取决于模型）',
    code: `# 工作记忆 = LLM 上下文窗口
# 自动由 AgentExecutor 管理，无需手动操作

# 超长对话时的 Token 压缩策略
from langchain.memory import ConversationTokenBufferMemory

memory = ConversationTokenBufferMemory(
    llm=ChatOpenAI(),
    max_token_limit=8000,  # 保留最近 8K tokens
    return_messages=True,
)
# 超出限制时自动截断旧消息`,
  },
  {
    type: '情节记忆', en: 'Episodic Memory', icon: '📖',
    desc: '对话历史的结构化存储，支持跨会话持久化',
    limit: '可持久化到数据库，无限制',
    code: `# 对话历史 Buffer（内存）
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(
    k=10,              # 保留最近 10 轮对话
    return_messages=True,
)

# 持久化到 Redis（跨会话）  
from langchain_community.chat_message_histories import RedisChatMessageHistory

history = RedisChatMessageHistory(
    session_id="user_123_session_456",
    url="redis://localhost:6379",
    ttl=86400,  # 24小时过期
)
memory = ConversationBufferMemory(
    chat_memory=history,
    return_messages=True,
)`,
  },
  {
    type: '语义记忆', en: 'Semantic Memory', icon: '🧬',
    desc: '向量数据库存储，通过语义相似度检索相关历史信息',
    limit: '百万级文档，亚秒级检索',
    code: `# 向量记忆：将重要信息存入向量数据库
from langchain.memory import VectorStoreRetrieverMemory
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

vectorstore = Chroma(
    embedding_function=OpenAIEmbeddings(),
    persist_directory="./agent_memory",
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
memory = VectorStoreRetrieverMemory(retriever=retriever)

# Agent 每次对话，自动检索相关历史
# "你还记得我上周说的项目需求吗？"
# → 向量检索 → 返回最相关的历史记录`,
  },
  {
    type: '程序记忆', en: 'Procedural Memory', icon: '⚙️',
    desc: 'Agent 可用的技能、工具和操作流程的静态注册表',
    limit: '固定在代码中，需要部署更新',
    code: `# 程序记忆 = 工具注册表 + 系统提示中的能力声明
AGENT_SKILLS = {
    "data_analysis": {
        "description": "分析 CSV/Excel 数据，生成统计报告",
        "tools": ["read_file", "run_python", "create_chart"],
        "example": "分析 sales_2024.csv 的月度趋势",
    },
    "web_research": {
        "description": "搜索网络信息，整合多来源内容",
        "tools": ["search_web", "fetch_url", "summarize"],
        "example": "调研竞争对手的定价策略",
    },
}
# 动态注入到 System Prompt
skill_desc = "\\n".join([f"- {k}: {v['description']}" 
                          for k, v in AGENT_SKILLS.items()])`,
  },
];

const ZEP_CODE = `# Zep — 生产级长期记忆解决方案
# 自动提取实体、总结对话、语义检索
from zep_cloud.client import AsyncZep
from zep_cloud import Message

zep = AsyncZep(api_key=os.environ["ZEP_API_KEY"])

# 添加消息到 Zep（自动处理：摘要/实体提取/向量化）
await zep.memory.add(
    session_id="user_123",
    messages=[
        Message(role_type="user",   content="我在做一个 B2B SaaS 项目"),
        Message(role_type="assistant", content="了解，请问目标客户是？"),
    ]
)

# 检索相关记忆（语义 + 实体 + 事实）
memory = await zep.memory.get(session_id="user_123")
# memory.context 包含:
# - 最近对话摘要
# - 识别出的实体（用户、公司、产品名）
# - 长期事实（"用户在做一个 B2B SaaS 项目"）

# 注入到 Agent Prompt
system_prompt = f"""
你是一个助手。以下是关于用户的记忆：
{memory.context}

基于上述背景继续对话。
"""`;

export default function LessonMemory() {
  const [memType, setMemType] = useState(0);
  const [activeTab, setActiveTab] = useState('types');

  const mem = MEMORY_TYPES[memType];

  return (
    <div className="ag-lesson">
      <div className="ag-container">

        <div className="ag-hero">
          <div className="ag-badge">模块四 · Memory & State</div>
          <h1>记忆与状态 — 让 Agent 记住上下文</h1>
          <p>没有记忆的 Agent 每次都从零开始。掌握四种记忆类型、跨会话持久化、向量记忆检索，以及 Zep 生产级记忆方案，构建真正"认识你"的 Agent。</p>
        </div>

        <div className="ag-metrics">
          {[
            { v: '4种', l: '记忆类型' },
            { v: 'Redis', l: '跨会话持久化' },
            { v: '向量', l: '语义记忆检索' },
            { v: 'Zep', l: '生产级解决方案' },
          ].map(m => (
            <div key={m.l} className="ag-metric-card">
              <div className="ag-metric-value">{m.v}</div>
              <div className="ag-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* Memory Types Explorer */}
        <div className="ag-section">
          <h2>🧠 四种记忆类型详解</h2>
          <div className="ag-tabs">
            {MEMORY_TYPES.map((m, i) => (
              <button key={i} className={`ag-tab${memType === i ? ' active' : ''}`} onClick={() => setMemType(i)}>
                {m.icon} {m.type}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>{mem.desc}</div>
                <div className="ag-tags">
                  <span className="ag-tag cyan">{mem.en}</span>
                  <span className="ag-tag amber">容量上限: {mem.limit}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ag-code">{mem.code}</div>
        </div>

        {/* Memory Architecture */}
        <div className="ag-section">
          <h2>🏗️ 生产级记忆架构</h2>
          <div className="ag-tabs">
            {[['types','分层架构'],['zep','Zep 长期记忆'],['state','状态管理']].map(([k,l]) => (
              <button key={k} className={`ag-tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'types' && (
            <div>
              <div className="ag-code">{`# 生产推荐：分层记忆架构
class LayeredMemory:
    """
    L1: 工作记忆（当前上下文窗口）      → 最快，容量最小
    L2: 情节记忆（Redis 对话历史）       → 毫秒级，GB级
    L3: 语义记忆（Chroma/Pinecone）     → 秒级，无限扩展
    """
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        # L2: Redis 对话历史
        self.episodic = RedisChatMessageHistory(
            session_id=session_id, url=REDIS_URL)
        # L3: 向量数据库
        self.semantic = Chroma(
            embedding_function=OpenAIEmbeddings(),
            collection_name=f"user_{session_id}",
        )
    
    async def remember(self, message: BaseMessage):
        """存储到 L2，重要内容同时向量化到 L3"""
        self.episodic.add_message(message)
        if self._is_important(message.content):
            self.semantic.add_texts([message.content])
    
    async def recall(self, query: str) -> str:
        """从 L2 + L3 综合检索"""
        recent = self.episodic.messages[-20:]  # 最近 20 条
        relevant = self.semantic.similarity_search(query, k=3)
        return self._format_context(recent, relevant)
    
    def _is_important(self, text: str) -> bool:
        """判断是否值得长期存储（可接 LLM 做分类）"""
        keywords = ["需求", "决定", "喜好", "项目", "目标"]
        return any(kw in text for kw in keywords)`}</div>
            </div>
          )}
          {activeTab === 'zep' && <div className="ag-code">{ZEP_CODE}</div>}
          {activeTab === 'state' && (
            <div>
              <div className="ag-code">{`# LangGraph 状态管理（下一模块详解）
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
import operator

# 定义 Agent 完整状态
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]  # 消息列表（自动追加）
    user_context: str                          # 用户背景信息
    task_status: str                           # 当前任务状态
    tool_results: dict                         # 工具执行结果缓存
    iteration_count: int                       # 循环次数（防止死循环）
    should_continue: bool                      # 是否继续执行

# 状态在图的每个节点间传递，持久保存在 Checkpoint
# 支持暂停、恢复、人工介入（HITL）`}</div>
            </div>
          )}
        </div>

        {/* Memory Best Practices */}
        <div className="ag-section">
          <h2>✅ 记忆设计最佳实践</h2>
          <div className="ag-grid-2">
            {[
              { t: '🔑 会话隔离', d: '每个用户/会话使用独立的 session_id，防止上下文污染和隐私泄露' },
              { t: '⏰ 自动过期', d: 'Redis TTL 设置合理过期时间（7-30天），避免历史记忆无限累积' },
              { t: '✂️  摘要压缩', d: '使用 ConversationSummaryMemory 对长对话自动生成摘要，节省 Token' },
              { t: '🔒 隐私过滤', d: '向量存储前过滤 PII（手机/身份证/密码），防止敏感信息被检索' },
              { t: '📊 记忆评估', d: '定期评估记忆的检索准确率，调整 embedding 模型和检索参数' },
              { t: '🔄 记忆更新', d: '用户纠正信息时，需要删除旧向量并插入新的，避免矛盾记忆共存' },
            ].map((c, i) => (
              <div key={i} className="ag-card">
                <div className="ag-card-title">{c.t}</div>
                <div className="ag-card-body">{c.d}</div>
              </div>
            ))}
          </div>
          <div className="ag-warn">⚠️ <span>记忆越丰富，每次查询的 Prompt 越长，Token 成本越高。必须做好<strong>相关性过滤</strong>，只注入与当前任务相关的记忆。</span></div>
        </div>

      </div>
    </div>
  );
}
