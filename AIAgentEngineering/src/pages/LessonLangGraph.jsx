import { useState } from 'react';
import './LessonCommon.css';

export default function LessonLangGraph() {
  const [tab, setTab] = useState('basic');

  const codes = {
    basic: `# ━━━━ LangGraph 核心概念与基础用法 ━━━━
# pip install langgraph langchain-openai

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated
import operator

# ━━━━ 1. 定义状态（State）━━━━
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]  # 追加模式
    current_task: str
    tool_results: list
    final_answer: str
    iterations: int

# ━━━━ 2. 定义节点（Nodes）━━━━
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def agent_node(state: AgentState) -> AgentState:
    """主要决策节点"""
    response = llm.invoke(state["messages"])
    return {
        "messages": [response],
        "iterations": state.get("iterations", 0) + 1,
    }

def tool_node(state: AgentState) -> AgentState:
    """工具执行节点"""
    last_message = state["messages"][-1]
    # 执行工具调用
    tool_results = execute_tools(last_message.tool_calls)
    return {"tool_results": tool_results}

def should_continue(state: AgentState) -> str:
    """条件路由函数：返回下一个节点名称"""
    last_msg = state["messages"][-1]
    
    # 超出最大迭代次数 → 强制结束
    if state.get("iterations", 0) >= 10:
        return "end"
    
    # 有工具调用 → 执行工具
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tools"
    
    # 没有工具调用 → 已有答案，结束
    return "end"

# ━━━━ 3. 构建图（Graph）━━━━
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

# 设置入口
workflow.set_entry_point("agent")

# 添加边
workflow.add_conditional_edges(
    "agent",             # 从 agent 节点出发
    should_continue,     # 路由函数
    {
        "tools": "tools",  # 返回 "tools" → 执行工具节点
        "end": END,        # 返回 "end" → 结束
    }
)
workflow.add_edge("tools", "agent")  # 工具执行后回到 agent

# 编译
app = workflow.compile()

# 运行
result = app.invoke({
    "messages": [{"role": "user", "content": "帮我查一下今天上海的天气"}],
    "iterations": 0,
})`,

    hitl: `# ━━━━ Human-in-the-Loop（人工介入）━━━━

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# MemorySaver 支持暂停和恢复
checkpointer = MemorySaver()

def review_action_node(state: AgentState) -> AgentState:
    """需要人工审批的节点"""
    pending_action = state.get("pending_action")
    # ⚠️ 这里 interrupt 会暂停执行，等待人工确认
    return {"awaiting_approval": True, "pending_action": pending_action}

def route_after_review(state: AgentState) -> str:
    """检查人工审批结果"""
    if state.get("human_approved"):
        return "execute"
    else:
        return "cancel"

workflow = StateGraph(AgentState)
workflow.add_node("plan", plan_node)
workflow.add_node("review", review_action_node)      # 人工审批节点
workflow.add_node("execute", execute_node)
workflow.add_node("cancel", cancel_node)

workflow.add_conditional_edges("review", route_after_review, {
    "execute": "execute",
    "cancel": END,
})

# 编译（带 checkpointer 支持暂停/恢复）
app = workflow.compile(checkpointer=checkpointer)

# ━━━━ 使用流程 ━━━━
config = {"configurable": {"thread_id": "approval-001"}}

# 第一阶段：运行到 review 节点暂停
result = app.invoke(initial_state, config=config)
# 系统暂停，发送邮件/通知给审批者

# 审批者决策后，更新状态并恢复
app.update_state(config, {"human_approved": True, "approved_by": "alice"})
# 继续从暂停点执行
final_result = app.invoke(None, config=config)`,

    streaming: `# ━━━━ LangGraph 流式输出 + 可视化 ━━━━

# ━━━━ 流式执行（实时看到每步结果）━━━━
async def stream_agent(user_query: str):
    config = {"configurable": {"thread_id": "stream-001"}}
    
    async for event in app.astream_events(
        {"messages": [{"role": "user", "content": user_query}]},
        config=config,
        version="v2",
    ):
        event_type = event["event"]
        
        if event_type == "on_chat_model_stream":
            # LLM 流式输出每个 token
            token = event["data"]["chunk"].content
            if token:
                print(token, end="", flush=True)
        
        elif event_type == "on_tool_start":
            # 工具开始执行
            tool_name = event["name"]
            tool_input = event["data"]["input"]
            print(f"\n🔧 调用工具：{tool_name}({tool_input})")
        
        elif event_type == "on_tool_end":
            # 工具执行完成
            print(f"✅ 工具结果：{event['data']['output'][:100]}...")

# ━━━━ 可视化图结构 ━━━━
# 方式 1：ASCII 图（终端）
print(app.get_graph().draw_ascii())

# 方式 2：Mermaid 图（导出到文档）
mermaid = app.get_graph().draw_mermaid()
print(mermaid)

# 方式 3：LangGraph Studio（可视化 IDE）
# langgraph dev  ← 启动本地 Studio

# ━━━━ 状态检查点（调试）━━━━
# 查看图中某个 checkpoint 的状态
config = {"configurable": {"thread_id": "debug-001"}}
state_history = list(app.get_state_history(config))
for state in state_history[-5:]:
    print(f"Step: {state.next}, Iterations: {state.values.get('iterations')}")`,
  };

  return (
    <div className="ag-lesson">
      <div className="ag-hero">
        <div className="ag-badge">// MODULE 04 · LANGGRAPH</div>
        <h1>LangGraph 状态机</h1>
        <p>LangGraph 用图（Graph）的方式精确控制 Agent 的执行流程。相比黑盒式 Agent，<strong>LangGraph 可控、可观测、支持 Human-in-the-Loop——是生产级 Agent 的最佳选择</strong>。</p>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">🗺️ LangGraph 三大核心主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['basic', '🔷 基础图构建'], ['hitl', '👁️ Human-in-the-Loop'], ['streaming', '⚡ 流式 + 可视化']].map(([k, l]) => (
            <button key={k} className={`ag-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ag-code-wrap">
          <div className="ag-code-head">
            <div className="ag-code-dot" style={{ background: '#ef4444' }} /><div className="ag-code-dot" style={{ background: '#f59e0b' }} /><div className="ag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_langgraph.py</span>
          </div>
          <div className="ag-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">📊 LangGraph vs 传统 Agent 对比</div>
        <div className="ag-card" style={{ overflowX: 'auto' }}>
          <table className="ag-table">
            <thead><tr><th>维度</th><th style={{ color: 'var(--ag-violet)' }}>LangGraph</th><th style={{ color: 'var(--ag-amber)' }}>传统 AgentExecutor</th></tr></thead>
            <tbody>
              {[
                ['执行流程', '显式图结构，每步可见', '黑盒循环，不透明'],
                ['条件分支', '精确的条件路由函数', '依赖 LLM 判断（不稳定）'],
                ['暂停/恢复', '✅ 支持 Checkpoint', '❌ 不支持'],
                ['Human-in-Loop', '✅ 内置 interrupt 机制', '❌ 需要自己实现'],
                ['并行执行', '✅ 节点可并行', '❌ 顺序执行'],
                ['调试体验', '✅ LangGraph Studio 可视化', '⚠️ 只能看日志'],
                ['生产稳定性', '✅ 精确控制，易测试', '⚠️ 依赖 LLM 规划准确性'],
              ].map(([dim, lg, ae], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{dim}</td>
                  <td style={{ color: 'var(--ag-lavender)', fontSize: '0.84rem' }}>{lg}</td>
                  <td style={{ color: 'var(--ag-muted)', fontSize: '0.84rem' }}>{ae}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ag-tip">
          💡 <strong>建议</strong>：原型阶段用 ReAct AgentExecutor 快速验证，生产阶段迁移到 LangGraph。LangGraph 的多出的开发成本在调试和维护阶段会成倍回收。
        </div>
      </div>
    </div>
  );
}
