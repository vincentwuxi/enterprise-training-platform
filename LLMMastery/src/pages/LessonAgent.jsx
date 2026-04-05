import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const REACT_STEPS_DEMO = [
  { type: 'question', content: '帮我查一下今天 AAPL 的股价，并比较一下它过去一年的涨跌幅，给出简要投资分析。', color: '#38bdf8' },
  { type: 'thought',  content: '用户想要：①当前股价 ②过去一年价格数据 ③我的投资分析。我需要先搜索股票数据，再进行分析。', color: '#a78bfa' },
  { type: 'action',   content: 'search_stock(symbol="AAPL", period="1y")', color: '#f59e0b' },
  { type: 'observe',  content: '当前价格：$189.50 | 1年前：$168.20 | 涨幅：+12.6% | 52周高点：$199.62 | 市盈率：29.5', color: '#10b981' },
  { type: 'thought',  content: '已获取数据。AAPL 一年上涨 12.6%，跑赢标普500（约+15%略弱）。市盈率29.5相对偏高但符合科技股估值。', color: '#a78bfa' },
  { type: 'action',   content: 'calculate_pe_comparison(symbol="AAPL", benchmark="SPY")', color: '#f59e0b' },
  { type: 'observe',  content: 'AAPL PE: 29.5x | 行业中位PE: 25.3x | SPY PE: 24.1x | 溢价: +16%', color: '#10b981' },
  { type: 'answer',   content: '📊 AAPL 投资分析：\n当前价格 $189.50，过去一年上涨 12.6%（略弱于标普500的15%）。市盈率 29.5x，较行业中位数溢价约16%，估值偏贵。近期受 AI 功能整合和 iPhone 销量回暖支撑，但宏观利率风险存在。\n\n建议：短期观望，跌至 $170-175 支撑位可考虑分批建仓。', color: '#10b981' },
];

function AgentTracer() {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  const run = async () => {
    setRunning(true);
    setDone(false);
    setSteps([]);
    for (let i = 0; i < REACT_STEPS_DEMO.length; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 200 : 900));
      setSteps(prev => [...prev, REACT_STEPS_DEMO[i]]);
      if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    }
    setRunning(false);
    setDone(true);
  };

  const reset = () => { setSteps([]); setDone(false); };

  const ICONS = { question: '👤', thought: '💭', action: '⚡', observe: '👁️', answer: '✅' };
  const LABELS = { question: '用户', thought: 'Think', action: 'Action', observe: 'Observe', answer: '最终回答' };

  return (
    <div className="ai-interactive">
      <h3>⚡ ReAct Agent 实时追踪（模拟运行）
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="ai-btn primary" onClick={run} disabled={running}>
            {running ? '⏳ 运行中…' : '▶ 运行 Agent'}
          </button>
          {done && <button className="ai-btn" onClick={reset}>↺ 重置</button>}
        </div>
      </h3>

      <div ref={ref} style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.6rem', padding: '0.6rem 0.75rem', borderRadius: '8px', border: `1px solid ${step.color}25`, background: `${step.color}07`, animation: 'fadeIn 0.3s ease' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{ICONS[step.type]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', color: step.color, fontWeight: 700, marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {LABELS[step.type]}
              </div>
              <div style={{ fontFamily: step.type === 'action' || step.type === 'observe' ? 'JetBrains Mono' : 'Inter', fontSize: '0.78rem', color: step.type === 'answer' ? '#a7f3d0' : '#d4c8ff', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {step.content}
              </div>
            </div>
          </div>
        ))}
        {steps.length === 0 && !running && (
          <div style={{ textAlign: 'center', color: '#3b2d6b', fontSize: '0.82rem', padding: '2rem' }}>点击"运行 Agent"查看 ReAct 推理步骤</div>
        )}
      </div>
    </div>
  );
}

const TOOL_CODE = [
  'from langchain.agents import create_tool_calling_agent, AgentExecutor',
  'from langchain.tools import tool',
  'from langchain_openai import ChatOpenAI',
  '',
  '# ── 自定义工具定义 ──',
  '@tool',
  'def search_stock(symbol: str, period: str = "1m") -> str:',
  '    """搜索股票价格数据。symbol: 股票代码, period: 1d/1m/1y"""',
  '    import yfinance as yf',
  '    ticker = yf.Ticker(symbol)',
  '    hist = ticker.history(period=period)',
  '    current = ticker.fast_info.last_price',
  '    return f"当前价格: ${{current:.2f}}, {{period}}数据: {{hist.tail(3).to_string()}}"',
  '',
  '@tool',
  'def web_search(query: str) -> str:',
  '    """搜索互联网实时信息。适用于需要最新新闻/数据的查询。"""',
  '    from tavily import TavilyClient',
  '    client = TavilyClient(api_key="tvly-xxx")',
  '    results = client.search(query, max_results=3)',
  '    return "\\n".join([r["content"] for r in results["results"]])',
  '',
  '@tool',
  'def run_python(code: str) -> str:',
  '    """在沙箱中执行 Python 代码。适用于计算、数据处理。"""',
  '    import subprocess',
  '    result = subprocess.run(["python3", "-c", code],',
  '        capture_output=True, text=True, timeout=10)',
  '    return result.stdout or result.stderr',
  '',
  '# ── 创建 Agent ──',
  'tools = [search_stock, web_search, run_python]',
  'llm = ChatOpenAI(model="gpt-4o", temperature=0)',
  '',
  'agent = create_tool_calling_agent(',
  '    llm=llm, tools=tools,',
  '    prompt=hub.pull("hwchase17/openai-functions-agent")',
  ')',
  '',
  'agent_executor = AgentExecutor(',
  '    agent=agent, tools=tools,',
  '    verbose=True,       # 打印每个思考步骤',
  '    max_iterations=10,  # 防止无限循环',
  '    handle_parsing_errors=True',
  ')',
  '',
  'result = agent_executor.invoke({"input": "查今天AAPL股价并给投资建议"})',
].join('\n');

const MULTI_AGENT = [
  'from langgraph.graph import StateGraph, END',
  'from typing import TypedDict, Annotated',
  'import operator',
  '',
  '# ── 多 Agent 协作：研究员 + 写手 + 批评官 ──',
  '',
  'class State(TypedDict):',
  '    messages: Annotated[list, operator.add]',
  '    research: str',
  '    draft: str',
  '    final: str',
  '',
  '# Agent 1：研究员',
  'def researcher(state: State):',
  '    llm = ChatOpenAI(model="gpt-4o")',
  '    result = llm.invoke([',
  '        SystemMessage("你是研究员，负责收集信息和数据"),',
  '        HumanMessage(state["messages"][-1].content)',
  '    ])',
  '    return {"research": result.content}',
  '',
  '# Agent 2：写手',
  'def writer(state: State):',
  '    llm = ChatOpenAI(model="gpt-4o")',
  '    result = llm.invoke([',
  '        SystemMessage("你是写手，基于研究结果撰写清晰报告"),',
  '        HumanMessage(f"研究内容：{state[\'research\']}")  # noqa',
  '    ])',
  '    return {"draft": result.content}',
  '',
  '# Agent 3：批评官',
  'def critic(state: State):',
  '    llm = ChatOpenAI(model="gpt-4o")',
  '    result = llm.invoke([',
  '        SystemMessage("你是编辑，评估内容质量（输出 PASS 或 REVISE）"),',
  '        HumanMessage(f"草稿：{state[\'draft\']}")  # noqa',
  '    ])',
  '    if "PASS" in result.content:',
  '        return {"final": state["draft"]}',
  '    return {"messages": [HumanMessage("需要修改：" + result.content)]}',
  '',
  '# ── 构建 StateGraph（有向无环图）──',
  'workflow = StateGraph(State)',
  'workflow.add_node("researcher", researcher)',
  'workflow.add_node("writer", writer)',
  'workflow.add_node("critic", critic)',
  'workflow.set_entry_point("researcher")',
  'workflow.add_edge("researcher", "writer")',
  'workflow.add_edge("writer", "critic")',
  'workflow.add_conditional_edges("critic",',
  '    lambda s: "end" if s.get("final") else "researcher",',
  '    {"end": END, "researcher": "researcher"}',
  ')',
  'graph = workflow.compile()',
].join('\n');

export default function LessonAgent() {
  const navigate = useNavigate();
  const [codeTab, setCodeTab] = useState('tool');

  return (
    <div className="lesson-ai">
      <div className="ai-badge orange">⚡ module_05 — AI Agent</div>
      <div className="ai-hero">
        <h1>AI Agent：ReAct / 工具调用 / 多 Agent 协作</h1>
        <p>Agent = LLM + 工具 + 记忆 + 规划。<strong>ReAct 框架</strong>让 LLM 在思考（Reasoning）和行动（Acting）间交替，能够使用搜索/计算/代码执行等工具完成复杂任务。</p>
      </div>

      {/* ReAct 追踪演示 */}
      <AgentTracer />

      {/* 工具调用 & 多 Agent */}
      <div className="ai-section">
        <h2 className="ai-section-title">💻 Agent 代码实现</h2>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.625rem' }}>
          <button className={`ai-btn ${codeTab === 'tool' ? 'primary' : ''}`} onClick={() => setCodeTab('tool')}>🛠️ 工具定义 + Agent</button>
          <button className={`ai-btn ${codeTab === 'multi' ? 'primary' : ''}`} onClick={() => setCodeTab('multi')}>🤝 多 Agent 协作</button>
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} />
            <div className="ai-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ai-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem', color: '#f59e0b' }}>
              {codeTab === 'tool' ? '⚡ LangChain Tool Calling Agent' : '🤝 LangGraph Multi-Agent Workflow'}
            </span>
          </div>
          <div className="ai-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>
            {codeTab === 'tool' ? TOOL_CODE : MULTI_AGENT}
          </div>
        </div>
      </div>

      {/* Agent vs RAG 对比 */}
      <div className="ai-section">
        <h2 className="ai-section-title">⚖️ Agent vs RAG vs Fine-tuning 选型</h2>
        <div className="ai-card">
          <table className="ai-table">
            <thead><tr><th>场景</th><th>Agent</th><th>RAG</th><th>Fine-tuning</th></tr></thead>
            <tbody>
              {[
                ['需要外部工具/API', '✅ 首选', '❌ 不适合', '❌ 不适合'],
                ['内部知识库问答', '可结合', '✅ 首选', '可辅助'],
                ['风格/人设定制', '❌', '❌', '✅ 首选'],
                ['专业领域推理', '✅（含计算）', '❌', '✅'],
                ['延迟要求低', '❌（多轮慢）', '✅', '✅'],
                ['数据实时性', '✅（实时搜索）', '❌（需重建索引）', '❌（需重训）'],
                ['成本', '高（多次调用）', '中', '高（训练）低（推理）'],
              ].map(([s, a, r, f]) => (
                <tr key={s}>
                  <td style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.8rem' }}>{s}</td>
                  <td style={{ fontSize: '0.78rem', color: a.startsWith('✅') ? '#10b981' : '#3b2d6b' }}>{a}</td>
                  <td style={{ fontSize: '0.78rem', color: r.startsWith('✅') ? '#10b981' : '#3b2d6b' }}>{r}</td>
                  <td style={{ fontSize: '0.78rem', color: f.startsWith('✅') ? '#10b981' : '#3b2d6b' }}>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/llm-dev/lesson/rag-advanced')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/llm-dev/lesson/finetune')}>下一模块：Fine-tuning →</button>
      </div>
    </div>
  );
}
