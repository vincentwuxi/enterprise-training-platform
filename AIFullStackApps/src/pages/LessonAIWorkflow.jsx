import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 05 — AI 工作流引擎
   LangGraph / 多步编排 / 人机协作
   ───────────────────────────────────────────── */

const PATTERNS = [
  { name: 'Sequential Chain', icon: '📝', tag: '顺序链',
    desc: '最简单的模式：多个 LLM 调用按顺序执行，前一步输出作为下一步输入。',
    when: '提取 → 分析 → 生成报告',
    code: `# ─── Sequential Chain: 文档分析报告 ───
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o")

# Step 1: 提取关键信息
extract_prompt = ChatPromptTemplate.from_template("""
从以下文档中提取关键数据点:
{document}

返回 JSON: {{"metrics": [...], "entities": [...], "dates": [...]}}
""")

# Step 2: 深度分析
analyze_prompt = ChatPromptTemplate.from_template("""
基于以下提取的数据进行深度分析:
{extracted_data}

分析趋势、异常和相关性。
""")

# Step 3: 生成报告
report_prompt = ChatPromptTemplate.from_template("""
基于以下分析结果，生成一份专业报告:
{analysis}

要求: 包含摘要、关键发现、建议。
""")

# 组合链
chain = (
    {"document": lambda x: x["doc"]}
    | extract_prompt | llm | parse_json    # Step 1
    | {"extracted_data": lambda x: x}
    | analyze_prompt | llm                  # Step 2
    | {"analysis": lambda x: x.content}
    | report_prompt | llm                   # Step 3
)

result = await chain.ainvoke({"doc": document_text})` },
  { name: 'Router Agent', icon: '🔀', tag: '路由分发',
    desc: 'LLM 作为路由器，根据输入意图分发到不同处理分支。',
    when: '客服系统 (退款/查询/投诉 → 不同处理流程)',
    code: `# ─── Router: 意图识别 + 分支路由 ───
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class State(TypedDict):
    query: str
    intent: str
    response: str

# 路由节点: 判断意图
def classify_intent(state: State) -> State:
    response = llm.invoke(f"""
判断用户意图，返回一个类别:
- refund: 退款相关
- inquiry: 查询相关  
- complaint: 投诉相关
- general: 一般问题

用户消息: {state["query"]}
只返回类别名。
""")
    return {"intent": response.content.strip()}

# 路由函数
def route(state: State) -> str:
    return state["intent"]

# 各分支处理
def handle_refund(state):
    # 查询订单 → 验证退款资格 → 发起退款
    return {"response": "退款处理中..."}

def handle_inquiry(state):
    # RAG 知识库检索 → 生成回答
    return {"response": "查询结果..."}

def handle_complaint(state):
    # 情感分析 → 升级到人工 / 自动处理
    return {"response": "已记录投诉..."}

def handle_general(state):
    return {"response": llm.invoke(state["query"]).content}

# 构建 Graph
graph = StateGraph(State)
graph.add_node("classify", classify_intent)
graph.add_node("refund", handle_refund)
graph.add_node("inquiry", handle_inquiry)
graph.add_node("complaint", handle_complaint)
graph.add_node("general", handle_general)

graph.set_entry_point("classify")
graph.add_conditional_edges("classify", route, {
    "refund": "refund",
    "inquiry": "inquiry",
    "complaint": "complaint",
    "general": "general",
})
for node in ["refund", "inquiry", "complaint", "general"]:
    graph.add_edge(node, END)

app = graph.compile()` },
  { name: 'ReAct Agent', icon: '🤖', tag: '推理行动',
    desc: 'LLM 交替进行推理 (Reasoning) 和行动 (Acting)，直到完成任务。',
    when: '复杂研究、数据分析、多步骤问题解决',
    code: `# ─── ReAct Agent: 推理 + 行动循环 ───
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
import requests

llm = ChatOpenAI(model="gpt-4o")

# 定义工具
@tool
def search_web(query: str) -> str:
    """搜索互联网获取最新信息"""
    # 使用 Tavily / SerpAPI
    response = tavily.search(query, max_results=5)
    return "\\n".join([r["content"] for r in response["results"]])

@tool
def query_database(sql: str) -> str:
    """查询内部数据库"""
    return safe_executor.execute(sql)

@tool
def calculate(expression: str) -> str:
    """执行数学计算"""
    return str(eval(expression))  # 生产中用 sympy

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """发送邮件通知"""
    # 需要人工确认!
    return f"邮件已准备: to={to}, subject={subject}"

# 创建 ReAct Agent
agent = create_react_agent(
    llm,
    tools=[search_web, query_database, calculate, send_email],
    prompt="""你是一个智能助手。使用可用工具完成用户任务。
每一步先思考 (Thought)，再决定行动 (Action)。
如果信息足够，直接给出最终回答。""",
)

# 执行 (支持流式)
async for event in agent.astream(
    {"messages": [("user", "帮我查一下Q3营收并对比去年同期增长率")]},
    stream_mode="values",
):
    # 每一步推理/行动都会输出
    print(event["messages"][-1])` },
  { name: 'Human-in-Loop', icon: '👤', tag: '人机协作',
    desc: '在关键节点暂停，等待人工审批后继续。适用于高风险操作。',
    when: '退款审批、合同生成、数据修改',
    code: `# ─── Human-in-the-Loop: 关键操作人工审批 ───
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresSaver
from typing import TypedDict, Optional

class ApprovalState(TypedDict):
    task: str
    plan: str
    approved: Optional[bool]
    result: str
    human_feedback: Optional[str]

# 1. AI 生成执行计划
def generate_plan(state):
    plan = llm.invoke(f"""
为以下任务生成执行计划:
{state["task"]}

返回详细步骤和预期影响。
""")
    return {"plan": plan.content}

# 2. 等待人工审批 (Graph 在此暂停!)
def wait_for_approval(state):
    # LangGraph 会在此中断，等待外部输入
    # 前端显示审批界面
    pass

# 3. 检查审批结果
def check_approval(state) -> str:
    if state.get("approved"):
        return "execute"
    return "reject"

# 4. 执行
def execute_plan(state):
    result = execute_actions(state["plan"])
    return {"result": result}

def reject_plan(state):
    return {"result": f"已取消。原因: {state.get('human_feedback', '用户拒绝')}"}

# Graph
graph = StateGraph(ApprovalState)
graph.add_node("plan", generate_plan)
graph.add_node("approval", wait_for_approval)
graph.add_node("execute", execute_plan)
graph.add_node("reject", reject_plan)

graph.set_entry_point("plan")
graph.add_edge("plan", "approval")
graph.add_conditional_edges("approval", check_approval, {
    "execute": "execute",
    "reject": "reject",
})
graph.add_edge("execute", END)
graph.add_edge("reject", END)

# 带持久化 (支持断点续跑)
checkpointer = PostgresSaver.from_conn_string(DATABASE_URL)
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["approval"],  # 在审批节点中断!
)

# ─── API 端 ───
# POST /workflow/start  → 启动, 返回 thread_id
# GET  /workflow/{id}    → 获取当前状态和计划
# POST /workflow/{id}/approve  → 人工审批
# POST /workflow/{id}/reject   → 人工拒绝

# 审批后继续执行
app.update_state(
    config={"configurable": {"thread_id": thread_id}},
    values={"approved": True, "human_feedback": "已审核，执行"},
)
# Graph 从中断点恢复执行!` },
];

export default function LessonAIWorkflow() {
  const [patIdx, setPatIdx] = useState(0);
  const p = PATTERNS[patIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🧩 module_05 — AI 工作流引擎</div>
      <div className="fs-hero">
        <h1>AI 工作流引擎：用 LangGraph 编排复杂任务</h1>
        <p>
          单次 LLM 调用解决不了复杂业务——你需要<strong>多步编排</strong>、<strong>条件分支</strong>、
          <strong>循环重试</strong>、<strong>人机协作</strong>。LangGraph 把 AI 工作流变成可视化的
          <strong>状态机图</strong>，每一步都可追溯、可中断、可恢复。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🔄 四种编排模式</h2>
        <div className="fs-pills">
          {PATTERNS.map((pat, i) => (
            <button key={i} className={`fs-btn ${i === patIdx ? 'primary' : ''}`}
              onClick={() => setPatIdx(i)}>
              {pat.icon} {pat.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#4ade80' }}>{p.icon} {p.name}</h3>
            <span className="fs-tag green">{p.tag}</span>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: '0 0 0.5rem' }}>{p.desc}</p>
          <div className="fs-alert info" style={{ marginBottom: '1rem' }}><strong>📋 适用场景：</strong>{p.when}</div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 workflow_{p.tag}.py
            </div>
            <pre className="fs-code">{p.code}</pre>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="fs-section">
        <h2 className="fs-section-title">📊 编排框架对比</h2>
        <div className="fs-card">
          <table className="fs-table">
            <thead><tr><th>特性</th><th style={{ color: '#22c55e' }}>LangGraph</th><th style={{ color: '#06b6d4' }}>CrewAI</th><th style={{ color: '#f59e0b' }}>AutoGen</th><th style={{ color: '#a78bfa' }}>Dify</th></tr></thead>
            <tbody>
              {[
                ['抽象层级', '底层 (状态图)', '高层 (角色)', '高层 (对话)', '无代码'],
                ['灵活性', '⭐⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐⭐', '⭐⭐'],
                ['人机协作', '✅ 原生支持', '❌', '✅ 部分', '✅'],
                ['持久化', '✅ CheckPointer', '❌', '❌', '✅ 内置'],
                ['流式输出', '✅ astream', '❌', '❌', '✅'],
                ['学习曲线', '陡峭', '平缓', '中等', '几乎为零'],
                ['适合谁', '工程师', '快速原型', '研究', '非技术人员'],
              ].map(([feat, ...vals], i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#fb7185' }}>{feat}</strong></td>
                  {vals.map((v, j) => <td key={j} style={{ color: '#94a3b8', fontSize: '0.84rem' }}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← Text-to-SQL</button>
        <button className="fs-btn cyan">多模态应用 →</button>
      </div>
    </div>
  );
}
