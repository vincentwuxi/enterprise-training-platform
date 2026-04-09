import { useState } from 'react';
import './LessonCommon.css';

const GRAPH_NODES = [
  { id: 'start',    label: '▶ START',         x: 50,  y: 50,  color: '#10b981' },
  { id: 'agent',    label: '🧠 Agent Node',   x: 50,  y: 160, color: '#8b5cf6' },
  { id: 'tools',    label: '⚡ Tool Node',    x: 10,  y: 280, color: '#06b6d4' },
  { id: 'human',    label: '👤 Human Review', x: 90,  y: 280, color: '#f59e0b' },
  { id: 'end',      label: '⏹ END',          x: 50,  y: 390, color: '#ef4444' },
];

const TABS = [
  {
    key: 'basic',
    label: '基础图',
    code: `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next: str

# 构建图
builder = StateGraph(AgentState)

# 添加节点
builder.add_node("agent", call_model)      # LLM 推理节点
builder.add_node("tools", call_tools)      # 工具执行节点

# 设置入口
builder.set_entry_point("agent")

# 添加条件边（Agent 决定下一步）
def should_continue(state: AgentState) -> str:
    last_msg = state["messages"][-1]
    if last_msg.tool_calls:
        return "tools"   # → 执行工具
    return END           # → 结束

builder.add_conditional_edges("agent", should_continue)
builder.add_edge("tools", "agent")  # 工具结果返回 Agent

# 编译并运行
graph = builder.compile()
result = graph.invoke({"messages": [HumanMessage("帮我搜索最新 AI 新闻")]})`,
  },
  {
    key: 'conditional',
    label: '条件分支',
    code: `# 复杂条件分支：根据任务类型路由到不同节点
def route_task(state: AgentState) -> str:
    """根据用户意图路由到不同处理路径"""
    intent = state.get("intent", "")
    
    if "代码" in intent or "编程" in intent:
        return "code_agent"      # → 代码专家 Agent
    elif "搜索" in intent or "查找" in intent:
        return "search_agent"    # → 搜索 Agent
    elif "分析" in intent:
        return "analysis_agent"  # → 数据分析 Agent
    else:
        return "general_agent"   # → 通用 Agent

builder.add_conditional_edges(
    "router",
    route_task,
    {
        "code_agent":     "code_agent",
        "search_agent":   "search_agent",
        "analysis_agent": "analysis_agent",
        "general_agent":  "general_agent",
    }
)`,
  },
  {
    key: 'hitl',
    label: '人工介入 HITL',
    code: `# HITL (Human-in-the-Loop): 危险操作前暂停等待人工确认
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import interrupt

# 关键节点：执行前请求人工确认
def risky_action_node(state: AgentState):
    action = state["pending_action"]
    
    # interrupt() 暂停图执行，等待外部输入
    human_decision = interrupt({
        "question": f"即将执行: {action}，请确认",
        "action":    action,
        "severity":  "high",
    })
    
    if human_decision["approved"]:
        return execute_action(action)
    else:
        return {"messages": [AIMessage("操作已取消")]}

# 使用 Checkpoint 持久化暂停状态
checkpointer = MemorySaver()  # 生产用 PostgresSaver
graph = builder.compile(
    checkpointer=checkpointer,
    interrupt_before=["risky_action"],  # 在此节点前暂停
)

# 恢复执行（人工确认后）
graph.invoke(
    Command(resume={"approved": True}),
    config={"configurable": {"thread_id": "task_123"}}
)`,
  },
  {
    key: 'loop',
    label: '循环与终止',
    code: `# 带循环的 Agent：自我改进直到满足质量标准
def should_revise(state: AgentState) -> str:
    iteration = state.get("iteration_count", 0)
    
    # 防止无限循环
    if iteration >= 5:
        return "end"
    
    # 质量评估
    quality_score = evaluate_output(state["last_output"])
    if quality_score >= 0.85:
        return "end"     # 质量达标，结束
    else:
        return "revise"  # 质量不足，继续改进

# 循环计数器（在节点中更新）
def revise_node(state: AgentState) -> AgentState:
    return {
        **state,
        "iteration_count": state.get("iteration_count", 0) + 1,
        "messages": state["messages"] + [
            SystemMessage(f"第{state.get('iteration_count',0)+1}次改进...")
        ]
    }

builder.add_conditional_edges("evaluate", should_revise, {
    "end": END, "revise": "revise_node"
})
builder.add_edge("revise_node", "agent")`,
  },
];

export default function LessonLangGraph() {
  const [activeTab, setActiveTab] = useState('basic');
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <div className="ag-lesson">
      <div className="ag-container">

        <div className="ag-hero">
          <div className="ag-badge">模块五 · LangGraph</div>
          <h1>LangGraph — 复杂工作流与条件分支</h1>
          <p>LangChain 适合线性任务，LangGraph 适合复杂工作流。用有向图描述 Agent 的状态转移、条件路由、循环改进和人工介入——构建真正生产级的 Agent 系统。</p>
        </div>

        <div className="ag-metrics">
          {[
            { v: 'Graph', l: '有向状态图' },
            { v: 'HITL', l: '人工介入节点' },
            { v: 'State', l: '持久化 Checkpoint' },
            { v: 'Loop', l: '自我改进循环' },
          ].map(m => (
            <div key={m.l} className="ag-metric-card">
              <div className="ag-metric-value">{m.v}</div>
              <div className="ag-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* LangChain vs LangGraph */}
        <div className="ag-section">
          <h2>⚖️ LangChain vs LangGraph — 如何选择</h2>
          <div className="ag-grid-2">
            <div className="ag-card">
              <div className="ag-card-title">🔗 LangChain AgentExecutor</div>
              <div className="ag-card-body" style={{marginBottom:'0.75rem'}}>适合线性任务，开箱即用，配置简单</div>
              <div className="ag-tags">
                <span className="ag-tag green">✅ 简单问答</span>
                <span className="ag-tag green">✅ 单一工具链</span>
                <span className="ag-tag green">✅ 快速原型</span>
                <span className="ag-tag red">❌ 复杂分支</span>
                <span className="ag-tag red">❌ 人工审核</span>
                <span className="ag-tag red">❌ 状态持久化</span>
              </div>
            </div>
            <div className="ag-card" style={{borderColor:'var(--ag-primary)'}}>
              <div className="ag-card-title" style={{color:'var(--ag-primary)'}}>🕸️ LangGraph</div>
              <div className="ag-card-body" style={{marginBottom:'0.75rem'}}>适合复杂工作流，精确控制每个节点</div>
              <div className="ag-tags">
                <span className="ag-tag">✅ 条件路由</span>
                <span className="ag-tag">✅ 循环改进</span>
                <span className="ag-tag">✅ 人工介入</span>
                <span className="ag-tag">✅ 状态持久化</span>
                <span className="ag-tag">✅ 多 Agent 编排</span>
                <span className="ag-tag amber">⚠️ 学习曲线</span>
              </div>
            </div>
          </div>
          <div className="ag-tip">🎯 <span><strong>决策规则</strong>：任务有分支判断或需要人工审核 → 用 LangGraph；线性执行且不需要状态持久化 → 用 AgentExecutor。</span></div>
        </div>

        {/* Graph Visualization */}
        <div className="ag-section">
          <h2>🕸️ 核心概念：节点、边、状态</h2>
          <div className="ag-grid-2">
            <div>
              {/* Simple SVG Graph Diagram */}
              <svg viewBox="0 0 200 450" style={{width:'100%',maxWidth:300,height:'auto',display:'block',margin:'0 auto'}}>
                {/* Edges */}
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#8b5cf6" opacity="0.7"/>
                  </marker>
                </defs>
                <line x1="100" y1="75" x2="100" y2="145" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrow)" opacity="0.7"/>
                <line x1="75"  y1="185" x2="35"  y2="265" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrow)" opacity="0.7"/>
                <line x1="125" y1="185" x2="165" y2="265" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrow)" opacity="0.7"/>
                <line x1="35"  y1="300" x2="90"  y2="375" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrow)" opacity="0.7"/>
                <line x1="165" y1="300" x2="110" y2="375" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrow)" opacity="0.7"/>
                {/* Nodes */}
                {[
                  { y:50,  label:'▶ START',       color:'#10b981', textColor:'#000' },
                  { y:160, label:'🧠 Agent',       color:'#8b5cf6', textColor:'#fff' },
                  { y:278, label:'⚡ Tools',       color:'#06b6d4', textColor:'#000', x:35 },
                  { y:278, label:'👤 Human',       color:'#f59e0b', textColor:'#000', x:165 },
                  { y:390, label:'⏹ END',         color:'#ef4444', textColor:'#fff' },
                ].map((n, i) => (
                  <g key={i}>
                    <rect x={(n.x || 100) - 40} y={n.y - 18} width={80} height={36}
                      rx={8} fill={n.color} opacity={0.9}/>
                    <text x={n.x || 100} y={n.y + 5} textAnchor="middle"
                      fill={n.textColor} fontSize="9" fontWeight="600">{n.label}</text>
                  </g>
                ))}
                {/* Condition label */}
                <text x="100" y="230" textAnchor="middle" fill="#7c6fa0" fontSize="8">条件边</text>
              </svg>
            </div>
            <div>
              <div className="ag-steps">
                {[
                  { t: '节点 (Node)', d: '图中的每个处理单元，可以是 LLM 调用、工具执行、人工审核等任意 Python 函数' },
                  { t: '边 (Edge)', d: '节点之间的连接关系，分为普通边（固定流向）和条件边（动态路由）' },
                  { t: '状态 (State)', d: 'TypedDict 定义的共享数据结构，在所有节点间传递和更新，是图的"血液"' },
                  { t: 'Checkpoint', d: '状态快照机制，支持暂停恢复、错误回滚、人工介入后继续执行' },
                ].map((s, i) => (
                  <div key={i} className="ag-step">
                    <div className="ag-step-content">
                      <div className="ag-step-title">{s.t}</div>
                      <div className="ag-step-desc">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="ag-section">
          <h2>💻 LangGraph 实战代码</h2>
          <div className="ag-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`ag-tab${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}>{t.label}</button>
            ))}
          </div>
          <div className="ag-code">{TABS.find(t => t.key === activeTab)?.code}</div>
        </div>

        {/* Use Cases */}
        <div className="ag-section">
          <h2>🎯 LangGraph 典型应用场景</h2>
          <div className="ag-grid-3">
            {[
              { t: '代码审查 Agent', d: 'PR → 静态分析 → LLM 审查 → 人工仲裁 → 反馈', tag: '本课实战' },
              { t: '内容生成流水线', d: '大纲 → 初稿 → 自我评估 → 修改（循环3次）→ 发布', tag: '创作类' },
              { t: '客服路由系统', d: '分类 → 路由到专业 Agent → 人工升级 → 满意度收集', tag: '服务类' },
              { t: '研究报告生成', d: '问题分解 → 并行搜索 → 汇总 → 事实核查 → 输出', tag: '研究类' },
              { t: '数据管道 Agent', d: '提取 → 清洗 → 验证 → 异常 → 人工确认 → 入库', tag: '数据类' },
              { t: '安全审计 Agent', d: '扫描代码 → 分类漏洞 → 高危暂停 → 修复建议', tag: '安全类' },
            ].map((c, i) => (
              <div key={i} className="ag-card">
                <div className="ag-card-title">{c.t}</div>
                <div className="ag-card-body">{c.d}</div>
                <div className="ag-tags" style={{marginTop:'0.5rem'}}><span className="ag-tag cyan">{c.tag}</span></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
