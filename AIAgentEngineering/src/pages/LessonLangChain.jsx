import { useState } from 'react';
import './LessonCommon.css';

const LCEL_STEPS = [
  { label: '定义 Prompt', code: `from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的代码审查助手。"),
    ("human", "{input}"),
])` },
  { label: '连接 LLM', code: `from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0,
    streaming=True,        # 流式输出
    max_tokens=2048,
)` },
  { label: '添加 OutputParser', code: `from langchain_core.output_parsers import StrOutputParser

# 简单字符串解析
parser = StrOutputParser()

# 或结构化 JSON 解析
from langchain_core.output_parsers import JsonOutputParser
json_parser = JsonOutputParser()` },
  { label: '组合成 Chain（LCEL）', code: `# LCEL 管道操作符 | 链接组件
chain = prompt | llm | parser

# 同步调用
result = chain.invoke({"input": "审查这段 Python 代码..."})

# 异步流式输出
async for chunk in chain.astream({"input": "..."}):
    print(chunk, end="", flush=True)` },
  { label: '升级为 Agent', code: `from langchain.agents import create_tool_calling_agent, AgentExecutor

# 绑定工具
tools = [search_tool, code_runner, file_reader]
agent = create_tool_calling_agent(llm, tools, prompt)

# AgentExecutor 管理循环
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,           # 打印推理过程
    max_iterations=10,      # 防止死循环
    handle_parsing_errors=True,
)
result = executor.invoke({"input": "帮我分析 main.py 的性能问题"})` },
];

const AGENT_TYPES = [
  {
    name: 'Tool Calling Agent',
    when: '首选',
    desc: '使用 LLM 原生 Function Calling / Tool Use，结构化可靠，推荐优先使用',
    code: `# GPT-4 / Claude 3 原生工具调用
agent = create_tool_calling_agent(
    llm=ChatOpenAI(model="gpt-4o"),
    tools=tools,
    prompt=prompt,
)`,
  },
  {
    name: 'ReAct Agent',
    when: '备选',
    desc: '通过 Prompt 引导 LLM 输出 Thought/Action/Observation 格式，兼容不支持 Function Calling 的模型',
    code: `# 适合开源模型（Mistral / Llama）
from langchain.agents import create_react_agent
agent = create_react_agent(
    llm=Ollama(model="mistral"),
    tools=tools, prompt=react_prompt,
)`,
  },
  {
    name: 'Structured Chat',
    when: '多输入工具',
    desc: '工具参数超过 1 个时使用，输出结构化 JSON 参数',
    code: `from langchain.agents import create_structured_chat_agent
# 适合工具入参复杂的场景
# 如: book_flight(city, date, seat_class, ...)
agent = create_structured_chat_agent(llm, tools, prompt)`,
  },
];

export default function LessonLangChain() {
  const [lcelStep, setLcelStep] = useState(0);
  const [agentType, setAgentType] = useState(0);

  return (
    <div className="ag-lesson">
      <div className="ag-container">

        <div className="ag-hero">
          <div className="ag-badge">模块二 · LangChain Engineering</div>
          <h1>LangChain 实战 — Chain 与 Agent 工程化</h1>
          <p>从 Prompt 到完整 Agent 的工程化路径。掌握 LCEL 管道组合、AgentExecutor 运行时、调试技巧，以及生产环境的最佳实践。</p>
        </div>

        {/* LCEL Pipeline */}
        <div className="ag-section">
          <h2>🔗 LCEL 管道 — 5 步构建 Agent</h2>
          <div className="ag-info">ℹ️ <span>LCEL（LangChain Expression Language）使用 <code style={{background:'rgba(6,182,212,0.15)',padding:'0 4px',borderRadius:4}}>|</code> 管道操作符组合组件，天然支持流式、异步、批处理。</span></div>

          {/* Step Navigator */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {LCEL_STEPS.map((s, i) => (
              <button key={i}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem',
                  border: `1px solid ${i === lcelStep ? 'var(--ag-primary)' : 'var(--ag-border)'}`,
                  background: i === lcelStep ? 'var(--ag-primary)' : 'transparent',
                  color: i === lcelStep ? '#fff' : 'var(--ag-muted)',
                  fontWeight: i === lcelStep ? 600 : 400,
                }}
                onClick={() => setLcelStep(i)}>
                {i + 1}. {s.label}
              </button>
            ))}
          </div>

          {/* Flow diagram */}
          <div className="ag-flow" style={{ marginBottom: '1rem' }}>
            {['Prompt', '|', 'LLM', '|', 'Parser', '→', 'Agent + Tools'].map((n, i) => (
              n === '|' || n === '→'
                ? <span key={i} className="ag-flow-arrow">{n}</span>
                : <div key={i} className={`ag-flow-node${lcelStep >= Math.floor(i / 2) ? ' active' : ''}`}>{n}</div>
            ))}
          </div>

          <div className="ag-code">{LCEL_STEPS[lcelStep].code}</div>
        </div>

        {/* Agent Types */}
        <div className="ag-section">
          <h2>🤖 三种 Agent 类型选择</h2>
          <div className="ag-tabs">
            {AGENT_TYPES.map((t, i) => (
              <button key={i} className={`ag-tab${agentType === i ? ' active' : ''}`} onClick={() => setAgentType(i)}>
                {t.name}
                <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', opacity: 0.8 }}>({t.when})</span>
              </button>
            ))}
          </div>
          <div className="ag-card">
            <div className="ag-card-body" style={{ marginBottom: '0.75rem', fontSize: '0.92rem' }}>{AGENT_TYPES[agentType].desc}</div>
            <div className="ag-code">{AGENT_TYPES[agentType].code}</div>
          </div>
        </div>

        {/* Debug & Trace */}
        <div className="ag-section">
          <h2>🔍 调试与追踪 — LangSmith</h2>
          <div className="ag-code">{`# 配置 LangSmith 追踪（生产必备）
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls__..."
os.environ["LANGCHAIN_PROJECT"] = "my-agent-prod"

# 每次 Agent 运行都会在 LangSmith Dashboard 记录:
# - 完整推理链（每个 Thought/Action/Observation）
# - Token 使用量和成本
# - 延迟分布
# - 失败的工具调用

# 本地快速调试
executor = AgentExecutor(
    agent=agent, tools=tools,
    verbose=True,           # 打印推理过程到控制台
    return_intermediate_steps=True,  # 返回所有中间步骤
)
result = executor.invoke({"input": "..."})
for step in result["intermediate_steps"]:
    print(f"Tool: {step[0].tool}, Input: {step[0].tool_input}")
    print(f"Output: {step[1][:200]}")  # 截断输出`}</div>
          <div className="ag-warn">⚠️ <span>生产环境必须设置 <code>max_iterations</code> 和 <code>max_execution_time</code>，防止 Agent 进入无限循环消耗大量 token 和成本。</span></div>
        </div>

        {/* Production Checklist */}
        <div className="ag-section">
          <h2>✅ LangChain Agent 生产清单</h2>
          <div className="ag-grid-2">
            {[
              { t: '🔒 输入/输出验证', d: '使用 Pydantic 校验工具参数，防止注入攻击和意外输入' },
              { t: '⏱️ 超时与重试', d: 'LLM 调用设置 timeout=30s，工具调用使用 tenacity 重试' },
              { t: '💰 成本控制', d: 'max_tokens 限制输出，中间步骤截断，监控 token 消耗' },
              { t: '📊 可观测性', d: 'LangSmith + Prometheus 监控错误率、延迟、成功率' },
              { t: '🔄 降级策略', d: 'gpt-4o 失败 → fallback 到 gpt-4o-mini，工具失败 → 返回友好提示' },
              { t: '🧪 回归测试', d: '维护 golden dataset，每次更新 prompt 后自动运行 eval' },
            ].map((c, i) => (
              <div key={i} className="ag-card">
                <div className="ag-card-title">{c.t}</div>
                <div className="ag-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
