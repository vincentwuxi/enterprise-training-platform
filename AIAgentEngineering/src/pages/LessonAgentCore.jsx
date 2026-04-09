import { useState } from 'react';
import './LessonCommon.css';

const COMPONENTS = [
  {
    id: 'perceive', label: '感知 Perceive', emoji: '👁️',
    desc: '接收外部输入：用户消息、工具返回值、环境状态',
    detail: '输入可以是文本、图像、结构化数据、API 响应等。现代 Agent 的感知层已支持多模态。',
    code: `# 感知层示例：解析工具的返回数据
class AgentState(TypedDict):
    messages: list[BaseMessage]
    tool_results: dict[str, Any]
    context: str

def perceive(state: AgentState, new_input: str) -> AgentState:
    """将新消息追加到 Agent 上下文"""
    return {
        **state,
        "messages": state["messages"] + [HumanMessage(content=new_input)]
    }`
  },
  {
    id: 'plan', label: '规划 Plan', emoji: '🧠',
    desc: '通过 LLM 推理，决定下一步行动（使用哪个工具、如何分解任务）',
    detail: 'ReAct（Reasoning + Acting）是主流框架：先 Thought → 再 Action → 观察结果 → 循环。',
    code: `# ReAct 推理链（LangChain AgentExecutor 内部逻辑）
# Thought: 我需要先查询天气再订机票
# Action: search_weather
# Action Input: {"city": "北京", "date": "2024-03-15"}
# Observation: 天气晴朗，气温 12°C
# Thought: 天气合适，现在查询航班
# Action: search_flights
# Action Input: {"from": "上海", "to": "北京", "date": "..."}`
  },
  {
    id: 'act', label: '行动 Act', emoji: '⚡',
    desc: '执行具体工具调用：搜索引擎、代码执行器、API、数据库查询',
    detail: '行动的可靠性直接决定 Agent 的实用性。需要对工具输出做格式校验和错误处理。',
    code: `# 工具执行层（带重试和错误处理）
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), 
       wait=wait_exponential(min=1, max=10))
async def execute_tool(tool_name: str, args: dict) -> str:
    tool = tool_registry.get(tool_name)
    if not tool:
        return f"Error: Tool '{tool_name}' not found"
    try:
        result = await tool.arun(**args)
        return str(result)[:4096]  # 截断过长输出
    except Exception as e:
        return f"Tool execution failed: {e}"`
  },
  {
    id: 'memory', label: '记忆 Memory', emoji: '💾',
    desc: '存储对话历史、工具结果、用户偏好，支持跨会话的长期记忆',
    detail: '分为工作记忆（上下文窗口）、情节记忆（对话历史）、语义记忆（向量检索）、程序记忆（技能/工具）。',
    code: `# 四种记忆类型实现
# 1. 工作记忆（Working Memory）= LLM 上下文窗口
# 2. 情节记忆（Episodic）= 对话历史 Buffer
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=ChatOpenAI(), max_token_limit=2000)

# 3. 语义记忆（Semantic）= 向量数据库
from langchain.vectorstores import Chroma
vectorstore = Chroma.from_documents(docs, embeddings)

# 4. 程序记忆（Procedural）= 工具/技能注册表
tools = [search_tool, calc_tool, code_tool]`
  },
];

const REACT_TRACE = [
  { type: 'thought', content: '用户问 2024 年 Q4 苹果营收，我需要搜索最新财报数据。', color: '#8b5cf6' },
  { type: 'action', content: 'search_web("Apple Q4 2024 revenue earnings report")', color: '#06b6d4' },
  { type: 'observe', content: 'Apple Q4 FY2024: Revenue $94.9B, up 6% YoY. iPhone $46.2B, Services $24.9B.', color: '#10b981' },
  { type: 'thought', content: '已获取数据。服务收入 $24.9B 增长显著，应重点分析。现在组织回答。', color: '#8b5cf6' },
  { type: 'action', content: 'format_response(data=revenue_data, highlight="services_growth")', color: '#06b6d4' },
  { type: 'final', content: 'Apple Q4 2024 营收 $94.9B（+6% YoY），其中服务业务 $24.9B，继续保持高速增长...', color: '#f59e0b' },
];

const TYPE_COLORS = { thought: '#8b5cf6', action: '#06b6d4', observe: '#10b981', final: '#f59e0b' };
const TYPE_LABELS = { thought: '🧠 Thought', action: '⚡ Action', observe: '👁️ Observe', final: '✅ Final Answer' };

export default function LessonAgentCore() {
  const [activeComp, setActiveComp] = useState('perceive');
  const [traceStep, setTraceStep] = useState(0);
  const comp = COMPONENTS.find(c => c.id === activeComp);

  return (
    <div className="ag-lesson">
      <div className="ag-container">

        <div className="ag-hero">
          <div className="ag-badge">模块一 · Agent Architecture</div>
          <h1>Agent 架构原理 — 从 LLM 到自主智能体</h1>
          <p>LLM 只是"大脑"，Agent 是有手有脚能干活的"机器人"。理解感知-规划-行动-记忆四核心，掌握 ReAct 推理框架，这是所有 Agent 工程的基石。</p>
        </div>

        <div className="ag-metrics">
          {[
            { v: 'ReAct', l: '核心推理框架' },
            { v: '4', l: '架构核心组件' },
            { v: 'Tool', l: '能力扩展方式' },
            { v: 'Loop', l: '自主循环模式' },
          ].map(m => (
            <div key={m.l} className="ag-metric-card">
              <div className="ag-metric-value">{m.v}</div>
              <div className="ag-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* LLM vs Agent */}
        <div className="ag-section">
          <h2>🤖 LLM vs Agent — 本质区别</h2>
          <div className="ag-grid-2">
            <div className="ag-card">
              <div className="ag-card-title">🗣️ 单纯 LLM</div>
              <div className="ag-code" style={{ marginTop: '0.75rem', fontSize: '0.78rem' }}>{`输入: "帮我查一下明天北京天气"
输出: "很抱歉，我无法实时访问
       网络获取天气信息..."

特点:
- 静态知识截止日期
- 无法执行操作
- 单轮无记忆
- 知识 → 语言`}</div>
            </div>
            <div className="ag-card" style={{ borderColor: 'var(--ag-primary)' }}>
              <div className="ag-card-title" style={{ color: 'var(--ag-primary)' }}>⚡ Agent</div>
              <div className="ag-code" style={{ marginTop: '0.75rem', fontSize: '0.78rem' }}>{`输入: "帮我查一下明天北京天气"
→ [调用天气 API: Beijing, tomorrow]
→ [获取结果: 晴 12°C ~ 20°C]
输出: "明天北京天气晴朗，12°C到20°C
       建议穿轻薄外套..."

特点:
- 实时外部工具
- 可执行操作
- 多轮有记忆
- 知识 + 行动`}</div>
            </div>
          </div>
          <div className="ag-tip">🧭 <span>定义：<strong>Agent = LLM + 工具调用 + 记忆 + 规划循环</strong>。Agent 能感知环境、制定计划、执行操作，并根据结果调整策略。</span></div>
        </div>

        {/* 4 Components */}
        <div className="ag-section">
          <h2>🏗️ Agent 四核心组件</h2>
          <div className="ag-tabs">
            {COMPONENTS.map(c => (
              <button key={c.id} className={`ag-tab${activeComp === c.id ? ' active' : ''}`}
                onClick={() => setActiveComp(c.id)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          {comp && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.4rem', color: 'var(--ag-text)' }}>
                  {comp.emoji} {comp.desc}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--ag-muted)', lineHeight: 1.7 }}>{comp.detail}</div>
              </div>
              <div className="ag-code">{comp.code}</div>
            </div>
          )}
        </div>

        {/* ReAct Framework */}
        <div className="ag-section">
          <h2>🔁 ReAct 推理框架 — 逐步演示</h2>
          <p style={{ color: 'var(--ag-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            ReAct = <strong>Re</strong>asoning + <strong>Act</strong>ing。交替进行"思考"和"行动"，每次行动的结果都会反馈成新的观察，驱动下一轮思考。
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="ag-tags">
              <span className="ag-tag">步骤 {traceStep + 1} / {REACT_TRACE.length}</span>
              <span className="ag-tag cyan">{TYPE_LABELS[REACT_TRACE[traceStep].type]}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="ag-tab" onClick={() => setTraceStep(Math.max(0, traceStep - 1))} disabled={traceStep === 0}>← 上一步</button>
              <button className="ag-tab" onClick={() => setTraceStep(Math.min(REACT_TRACE.length - 1, traceStep + 1))} disabled={traceStep === REACT_TRACE.length - 1}>下一步 →</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {REACT_TRACE.map((t, i) => (
              <div key={i} style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                border: `1px solid ${i <= traceStep ? t.color + '60' : 'var(--ag-border)'}`,
                background: i === traceStep ? `${t.color}18` : i < traceStep ? `${t.color}08` : 'transparent',
                opacity: i > traceStep ? 0.3 : 1,
                transition: 'all 0.3s',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: t.color, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  {TYPE_LABELS[t.type]}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: 'var(--ag-text)', lineHeight: 1.6 }}>
                  {t.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Types */}
        <div className="ag-section">
          <h2>🗂️ Agent 模式对比</h2>
          <div className="ag-table-wrap">
            <table className="ag-table">
              <thead><tr><th>模式</th><th>特征</th><th>适用场景</th><th>复杂度</th></tr></thead>
              <tbody>
                {[
                  ['单轮 Agent', '一次规划，一次执行，无循环', '简单问答、数据提取', <span className="ag-tag green">低</span>],
                  ['ReAct Agent', '思考-行动-观察循环，动态决策', '研究助手、信息检索', <span className="ag-tag amber">中</span>],
                  ['Plan-and-Execute', '先整体规划再逐步执行', '复杂多步任务', <span className="ag-tag amber">中</span>],
                  ['Multi-Agent', '多个 Agent 分工协作', '软件开发、复杂报告', <span className="ag-tag red">高</span>],
                  ['Self-Reflective', '自我评估并迭代改进输出', '代码生成、内容创作', <span className="ag-tag red">高</span>],
                ].map(([mode, feat, scene, comp], i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--ag-primary)' }}>{mode}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--ag-muted)' }}>{feat}</td>
                    <td style={{ fontSize: '0.85rem' }}>{scene}</td>
                    <td>{comp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="ag-section">
          <h2>📚 本章小结</h2>
          <div className="ag-steps">
            {[
              { t: 'Agent ≠ LLM', d: 'Agent 在 LLM 基础上增加了工具调用、记忆和规划循环，具备与环境交互的能力' },
              { t: '掌握 ReAct 框架', d: '交替推理和行动是当前最主流的 Agent 推理模式，理解 Thought→Action→Observation 循环' },
              { t: '四核心组件缺一不可', d: '感知（输入处理）+ 规划（LLM推理）+ 行动（工具执行）+ 记忆（上下文管理）' },
              { t: '按任务选择 Agent 模式', d: '简单任务用单轮，复杂多步用 ReAct，团队协作用 Multi-Agent，不要过度设计' },
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
  );
}
