import { useState } from 'react';
import './LessonCommon.css';

const MEMORY_TYPES = [
  {
    key: 'conversational', name: '对话记忆', icon: '💬', color: '#8b5cf6',
    type: 'Short-term', storage: 'In-memory / Redis',
    desc: '记录对话历史，让 Agent 知道"之前说了什么"。最基础的记忆类型。',
    code: `from langchain.memory import ConversationBufferWindowMemory, ConversationSummaryMemory

# ━━━━ 滑动窗口记忆（只记最近 K 轮）━━━━
memory = ConversationBufferWindowMemory(
    k=5,                      # 只保留最近5轮对话
    memory_key="chat_history",
    return_messages=True,
)

# ━━━━ 摘要记忆（长对话压缩）━━━━
# 超过一定轮数后，用 LLM 将历史对话总结为摘要
from langchain.memory import ConversationSummaryBufferMemory

summary_memory = ConversationSummaryBufferMemory(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    max_token_limit=1000,       # 超过1000 token 就压缩
    memory_key="chat_history",
    return_messages=True,
)

# ━━━━ Redis 持久化（多会话/多用户）━━━━
from langchain.memory import RedisChatMessageHistory
from langchain.memory import ConversationBufferMemory

session_id = f"user_{user_id}_session_{session_id}"
history = RedisChatMessageHistory(session_id=session_id, url="redis://localhost:6379")
memory = ConversationBufferMemory(
    chat_memory=history,
    return_messages=True,
)`,
  },
  {
    key: 'entity', name: 'Entity 记忆', icon: '🏷️', color: '#f59e0b',
    type: 'Working Memory', storage: 'Dict / Knowledge Graph',
    desc: '跟踪对话中提到的实体（人物/产品/组织），自动提取和更新实体信息。',
    code: `from langchain.memory import ConversationEntityMemory

# Entity Memory 自动提取实体并维护实体档案
entity_memory = ConversationEntityMemory(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    memory_key="entities",
    input_key="input",
)

# 对话过程中自动提取：
# 用户："张三是我们公司的CTO，他负责AI项目"
# Entity Memory 自动记录：
# {
#   "张三": "公司CTO，负责AI项目",
#   "公司": "用户所在公司",
#   "AI项目": "张三负责的项目",
# }

# 后续对话时自动注入相关实体信息
# 用户："张三最近怎么样？"
# Agent 的上下文：[Entity Memory 中关于张三的信息...]

# ━━━━ 手动管理实体（更灵活）━━━━
entity_store = {}

def update_entity(name: str, info: str):
    if name not in entity_store:
        entity_store[name] = []
    entity_store[name].append(info)

def get_entity(name: str) -> str:
    return "; ".join(entity_store.get(name, ["未知"]))`,
  },
  {
    key: 'vector', name: 'Vector 记忆（长期）', icon: '🔢', color: '#10b981',
    type: 'Long-term', storage: 'Vector DB（Chroma/Pinecone）',
    desc: '基于向量相似度检索相关历史记忆。支持数百万条记忆，无限扩展，是长期记忆的标配。',
    code: `from langchain.memory import VectorStoreRetrieverMemory
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# ━━━━ Vector Store 记忆（无限长期记忆）━━━━
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(
    embedding_function=embeddings,
    persist_directory="./agent_memory",
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

memory = VectorStoreRetrieverMemory(
    retriever=retriever,
    memory_key="relevant_history",
)

# 存储记忆
memory.save_context(
    {"input": "用户偏好深色主题，喜欢简洁的代码风格"},
    {"output": "已记录用户偏好"},
)

# 检索相关记忆（自动根据当前对话检索）
relevant = memory.load_memory_variables({"input": "帮我写一段 Python 代码"})
# 会自动检索出之前存储的"代码风格偏好"记忆

# ━━━━ Mem0：专业 Agent 记忆库（推荐）━━━━
# pip install mem0ai
from mem0 import Memory

m = Memory()
m.add("用户喜欢用 FastAPI 而不是 Flask", user_id="user_123")
m.add("用户公司使用 PostgreSQL 数据库", user_id="user_123")

# 检索相关记忆
memories = m.search("数据库选型", user_id="user_123")`,
  },
  {
    key: 'episodic', name: 'Episodic 记忆', icon: '📖', color: '#06b6d4',
    type: 'Long-term', storage: 'Structured DB + Vector',
    desc: '记录完整的过去事件/任务执行经历，包括目标、过程、结果。让 Agent 从经验中学习。',
    code: `from datetime import datetime
from dataclasses import dataclass

@dataclass
class Episode:
    """一次完整任务的记录"""
    task: str
    steps: list[dict]       # 每步的思考和行动
    result: str
    success: bool
    duration_s: float
    timestamp: datetime = datetime.now()
    lessons_learned: str = ""  # LLM 总结的经验教训

# ━━━━ 记录 Episode ━━━━
class EpisodicMemory:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.episodes: list[Episode] = []
    
    def record(self, episode: Episode):
        """记录一次任务执行经历"""
        self.episodes.append(episode)
        # 存入向量数据库（以便检索）
        self.vectorstore.add_texts(
            texts=[f"任务：{episode.task}\n结果：{episode.result}\n经验：{episode.lessons_learned}"],
            metadatas=[{"success": episode.success, "timestamp": str(episode.timestamp)}]
        )
    
    def recall_similar(self, new_task: str) -> list[Episode]:
        """检索类似任务的历史经验"""
        results = self.vectorstore.similarity_search(new_task, k=3)
        return results  # 返回过去类似任务的经验

# ━━━━ 在 Agent 中使用 ━━━━
# 执行任务前：检索类似任务经验，避免重蹈覆辙
past_experience = episodic_memory.recall_similar(current_task)
system_prompt += f"\n\n历史经验参考：{past_experience}"`,
  },
];

export default function LessonMemory() {
  const [mem, setMem] = useState('conversational');
  const m = MEMORY_TYPES.find(x => x.key === mem) ?? {};

  return (
    <div className="ag-lesson">
      <div className="ag-hero">
        <div className="ag-badge">// MODULE 03 · MEMORY SYSTEMS</div>
        <h1>Memory 系统设计</h1>
        <p>没有记忆的 Agent 每次对话都是"初次见面"。<strong>四类记忆类型</strong>从短期到长期、从结构化到向量化，构成 Agent 的完整记忆体系。选对记忆类型，让 Agent 越来越聪明。</p>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">🧠 四类记忆类型</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {MEMORY_TYPES.map(mt => (
            <button key={mt.key} className={`ag-btn ${mem === mt.key ? 'active' : ''}`}
              style={{ borderColor: mem === mt.key ? mt.color : undefined, color: mem === mt.key ? mt.color : undefined }}
              onClick={() => setMem(mt.key)}>
              {mt.icon} {mt.name}
              <span className="ag-tag purple" style={{ marginLeft: '0.3rem' }}>{mt.type}</span>
            </button>
          ))}
        </div>
        <div className="ag-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="ag-card" style={{ borderTop: `3px solid ${m.color}` }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: m.color, marginBottom: '0.5rem' }}>{m.icon} {m.name}</div>
            <div style={{ color: 'var(--ag-muted)', fontSize: '0.87rem', lineHeight: 1.75, marginBottom: '0.75rem' }}>{m.desc}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="ag-tag purple">类型: {m.type}</span>
              <span className="ag-tag cyan">存储: {m.storage}</span>
            </div>
          </div>
          <div className="ag-card">
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--ag-lavender)' }}>适合场景</div>
            {mem === 'conversational' && ['客服对话 Bot（记住上下文）', '多轮问答助手', '会话状态管理（购物车等）'].map((s,i)=> <div key={i} style={{fontSize:'0.84rem',color:'var(--ag-muted)',marginBottom:'0.4rem'}}>→ {s}</div>)}
            {mem === 'entity' && ['人员/项目/产品跟踪', 'CRM 对话助手', '需要记住"谁是谁"的场景'].map((s,i)=> <div key={i} style={{fontSize:'0.84rem',color:'var(--ag-muted)',marginBottom:'0.4rem'}}>→ {s}</div>)}
            {mem === 'vector' && ['用户偏好长期记忆', '知识积累型 Agent', '跨会话记忆（数百万条）'].map((s,i)=> <div key={i} style={{fontSize:'0.84rem',color:'var(--ag-muted)',marginBottom:'0.4rem'}}>→ {s}</div>)}
            {mem === 'episodic' && ['任务型 Agent（学习经验）', 'Autonomous Agent', '避免重复错误的场景'].map((s,i)=> <div key={i} style={{fontSize:'0.84rem',color:'var(--ag-muted)',marginBottom:'0.4rem'}}>→ {s}</div>)}
          </div>
        </div>
        <div className="ag-code-wrap">
          <div className="ag-code-head">
            <div className="ag-code-dot" style={{ background: '#ef4444' }} /><div className="ag-code-dot" style={{ background: '#f59e0b' }} /><div className="ag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{mem}_memory.py</span>
          </div>
          <div className="ag-code">{m.code}</div>
        </div>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">🗺️ 记忆类型速查与组合策略</div>
        <div className="ag-card" style={{ overflowX: 'auto', marginBottom: '1rem' }}>
          <table className="ag-table">
            <thead><tr><th>类型</th><th>时效</th><th>容量</th><th>检索方式</th><th>推荐场景</th></tr></thead>
            <tbody>
              {MEMORY_TYPES.map(mt => (
                <tr key={mt.key}>
                  <td><span style={{ color: mt.color, fontWeight: 700, fontSize: '0.85rem' }}>{mt.icon} {mt.name}</span></td>
                  <td><span className={`ag-tag ${mt.type.includes('Long') ? 'green' : 'amber'}`}>{mt.type}</span></td>
                  <td style={{ color: 'var(--ag-muted)', fontSize: '0.83rem' }}>{mt.key === 'vector' || mt.key === 'episodic' ? '无限' : '有限（窗口）'}</td>
                  <td style={{ color: 'var(--ag-muted)', fontSize: '0.83rem' }}>{mt.key === 'vector' || mt.key === 'episodic' ? '语义相似度' : '顺序/实体名'}</td>
                  <td style={{ color: 'var(--ag-muted)', fontSize: '0.83rem' }}>{mt.storage.split('（')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ag-tip">
          💡 <strong>生产推荐组合</strong>：对话记忆（短期上下文）+ Vector 记忆（长期偏好/知识） + Episodic 记忆（任务经验）。三层叠加构成完整记忆体系，可覆盖 95% 的 Agent 记忆需求。
        </div>
      </div>
    </div>
  );
}
