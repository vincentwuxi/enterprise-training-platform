import { useState } from 'react';
import './LessonCommon.css';

const FRAMEWORKS = [
  {
    name: 'AutoGen',
    org: 'Microsoft',
    desc: '对话驱动的多 Agent 框架，Agent 之间通过消息传递协作完成任务',
    strength: ['对话式协作自然','内置 Code Executor','支持人工介入','社区活跃'],
    weakness: ['调试复杂','消息风暴风险','不支持复杂状态图'],
    code: `import autogen

# 定义 Agent
assistant = autogen.AssistantAgent(
    name="助理",
    llm_config={"model": "gpt-4o"},
    system_message="你是一个擅长编写 Python 代码的助手。",
)
user_proxy = autogen.UserProxyAgent(
    name="用户代理",
    human_input_mode="NEVER",     # 全自动
    code_execution_config={
        "work_dir": "coding",
        "use_docker": True,       # 沙箱执行
    },
    max_consecutive_auto_reply=10,
)

# 启动对话
user_proxy.initiate_chat(
    assistant,
    message="写一个 Python 脚本，分析 CSV 文件并画出销售趋势图",
)
# AutoGen 自动：写代码 → 执行 → 发现错误 → 修复 → 再执行...`,
  },
  {
    name: 'CrewAI',
    org: 'CrewAI',
    desc: '基于角色的多 Agent 框架，像搭建一支"团队"，每个 Agent 有明确职责',
    strength: ['角色概念清晰','任务分配直观','内置工具丰富','企业采用广泛'],
    weakness: ['灵活性较低','定制化成本高','开源版功能受限'],
    code: `from crewai import Agent, Task, Crew, Process

# 定义团队成员（Agent）
researcher = Agent(
    role="市场研究员",
    goal="深度研究竞争对手的产品策略",
    backstory="你是顶级市场分析师，擅长从海量数据中提炼洞察",
    tools=[search_tool, web_scraper],
    llm=ChatOpenAI(model="gpt-4o"),
    verbose=True,
)
analyst = Agent(
    role="数据分析师",
    goal="基于研究数据撰写结构化分析报告",
    backstory="你精通数据解读和商业洞察，报告逻辑严密",
    tools=[python_repl, chart_generator],
)
writer = Agent(
    role="商业写作专家",
    goal="将分析结果转化为清晰的执行建议文档",
    backstory="你有 10 年商业写作经验，擅长将复杂分析简化",
)

# 定义任务（Task）
research_task = Task(
    description="搜集 OpenAI、Anthropic、Google DeepMind 的最新产品动态",
    expected_output="包含产品名、价格、核心功能的对比表格",
    agent=researcher,
)
analysis_task = Task(
    description="基于研究结果，分析竞争格局和市场机会",
    expected_output="SWOT 分析报告（1500字）",
    agent=analyst,
    context=[research_task],  # 依赖上一个任务的输出
)

# 组建团队并执行
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task],
    process=Process.sequential,  # 顺序执行
    verbose=True,
)
result = crew.kickoff()`,
  },
  {
    name: 'LangGraph Multi',
    org: 'LangChain',
    desc: '基于图状态机的多 Agent 编排，最灵活，适合复杂工作流',
    strength: ['极致灵活','精确控制流程','状态持久化','HITL 支持'],
    weakness: ['学习曲线陡','代码量多','需要深度理解图模型'],
    code: `from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent

# 创建专业化子 Agent
code_agent   = create_react_agent(llm, [python_repl, file_tools])
search_agent = create_react_agent(llm, [search_tool, web_scraper])
qa_agent     = create_react_agent(llm, [test_runner])

# 监督者 Agent（决策路由）
def supervisor(state):
    """决定调用哪个子 Agent"""
    response = supervisor_llm.invoke([
        SystemMessage("根据任务内容，选择: code_agent/search_agent/qa_agent/FINISH"),
        *state["messages"]
    ])
    return {"next": parse_agent_choice(response)}

# 构建 Supervisor 图
builder = StateGraph(AgentState)
builder.add_node("supervisor",    supervisor)
builder.add_node("code_agent",    code_agent)
builder.add_node("search_agent",  search_agent)
builder.add_node("qa_agent",      qa_agent)

builder.set_entry_point("supervisor")
builder.add_conditional_edges("supervisor", lambda s: s["next"], {
    "code_agent":   "code_agent",
    "search_agent": "search_agent",
    "qa_agent":     "qa_agent",
    "FINISH":        END,
})
for agent in ["code_agent", "search_agent", "qa_agent"]:
    builder.add_edge(agent, "supervisor")  # 完成后回到监督者`,
  },
];

const PATTERNS = [
  {
    name: 'Supervisor 模式',
    desc: '一个监督者 Agent 分配任务给多个专业化 Worker Agent',
    when: '任务可分解、各子任务独立',
    svg_desc: 'Supervisor → [CodeAgent, SearchAgent, QAAgent]'
  },
  {
    name: 'Pipeline 模式',
    desc: '多个 Agent 顺序执行，前一个的输出是后一个的输入',
    when: '任务有明确先后依赖关系',
    svg_desc: 'Researcher → Analyst → Writer → Reviewer'
  },
  {
    name: 'Debate 模式',
    desc: '多个 Agent 对同一问题提出不同观点，裁判 Agent 综合判断',
    when: '需要多视角验证、减少偏见',
    svg_desc: 'Agent1 ⇄ Agent2 → Judge → Final Answer'
  },
  {
    name: 'Swarm 模式',
    desc: 'Agent 自主选择将任务交接给合适的同伴，去中心化协作',
    when: '任务边界模糊，需要动态分工',
    svg_desc: 'Any Agent → handoff → Specialist Agent'
  },
];

export default function LessonMultiAgent() {
  const [framework, setFramework] = useState(0);
  const [pattern, setPattern] = useState(0);

  const fw = FRAMEWORKS[framework];

  return (
    <div className="ag-lesson">
      <div className="ag-container">

        <div className="ag-hero">
          <div className="ag-badge">模块六 · Multi-Agent Systems</div>
          <h1>Multi-Agent 系统 — AutoGen 与 CrewAI 编排</h1>
          <p>单个 Agent 有上下文限制和专业边界。Multi-Agent 系统通过角色分工、并行执行和相互校验，解决单 Agent 无法胜任的复杂任务。</p>
        </div>

        <div className="ag-metrics">
          {[
            { v: 'AutoGen', l: 'Microsoft 对话式' },
            { v: 'CrewAI', l: '角色团队模型' },
            { v: '4种', l: '协作模式' },
            { v: 'Supervisor', l: '推荐入门模式' },
          ].map(m => (
            <div key={m.l} className="ag-metric-card">
              <div className="ag-metric-value">{m.v}</div>
              <div className="ag-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* Why Multi-Agent */}
        <div className="ag-section">
          <h2>🤔 为什么需要 Multi-Agent？</h2>
          <div className="ag-grid-3">
            {[
              { t: '上下文限制', d: '单 Agent 上下文窗口有限，复杂任务需要"接力"处理' },
              { t: '专业分工', d: '不同 Agent 使用不同 Prompt/工具，各自成为某领域专家' },
              { t: '并行加速', d: '互不依赖的子任务可以同时执行，大幅减少总耗时' },
              { t: '相互校验', d: '一个 Agent 生成，另一个验证，减少幻觉和错误' },
              { t: '容错设计', d: '某个 Agent 失败时可降级或重试，整体系统更健壮' },
              { t: '成本优化', d: '简单子任务用小模型，复杂推理才用 GPT-4，节省成本' },
            ].map((c, i) => (
              <div key={i} className="ag-card">
                <div className="ag-card-title">{c.t}</div>
                <div className="ag-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Framework Comparison */}
        <div className="ag-section">
          <h2>⚖️ 框架对比与代码实现</h2>
          <div className="ag-tabs">
            {FRAMEWORKS.map((f, i) => (
              <button key={i} className={`ag-tab${framework === i ? ' active' : ''}`} onClick={() => setFramework(i)}>
                {f.name} <span style={{fontSize:'0.7rem',opacity:0.7}}>({f.org})</span>
              </button>
            ))}
          </div>
          <p style={{color:'var(--ag-muted)',fontSize:'0.9rem',marginBottom:'1rem'}}>{fw.desc}</p>
          <div className="ag-grid-2" style={{marginBottom:'1rem'}}>
            <div className="ag-card">
              <div className="ag-card-title" style={{color:'var(--ag-green)'}}>✅ 优势</div>
              <ul style={{margin:'0.5rem 0 0',paddingLeft:'1.2rem',color:'var(--ag-muted)',fontSize:'0.85rem',lineHeight:1.8}}>
                {fw.strength.map((s,i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="ag-card">
              <div className="ag-card-title" style={{color:'var(--ag-red)'}}>⚠️ 局限</div>
              <ul style={{margin:'0.5rem 0 0',paddingLeft:'1.2rem',color:'var(--ag-muted)',fontSize:'0.85rem',lineHeight:1.8}}>
                {fw.weakness.map((s,i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
          <div className="ag-code">{fw.code}</div>
        </div>

        {/* Collaboration Patterns */}
        <div className="ag-section">
          <h2>🕸️ 四种协作模式</h2>
          <div className="ag-tabs">
            {PATTERNS.map((p, i) => (
              <button key={i} className={`ag-tab${pattern === i ? ' active' : ''}`} onClick={() => setPattern(i)}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="ag-card">
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'0.9rem',color:'var(--ag-primary)',marginBottom:'0.75rem',fontWeight:600}}>
              {PATTERNS[pattern].svg_desc}
            </div>
            <div style={{fontSize:'0.92rem',marginBottom:'0.5rem'}}>{PATTERNS[pattern].desc}</div>
            <div className="ag-tags"><span className="ag-tag cyan">适用：{PATTERNS[pattern].when}</span></div>
          </div>
          <div className="ag-tip">🎯 <span><strong>入门推荐 Supervisor 模式</strong>：逻辑清晰、易于调试、可控性强。在掌握后再探索更复杂的 Swarm 模式。</span></div>
        </div>

        {/* Production Considerations */}
        <div className="ag-section">
          <h2>🏭 Multi-Agent 生产注意事项</h2>
          <div className="ag-code">{`# 关键风险与应对策略

# 1. Token 爆炸（Agent 间消息过长）
def truncate_agent_message(msg: str, max_tokens: int = 2000) -> str:
    """Agent 间消息传递时强制截断"""
    tokens = tiktoken.encode(msg)
    if len(tokens) > max_tokens:
        return tiktoken.decode(tokens[:max_tokens]) + "\\n[内容已截断...]"
    return msg

# 2. 循环检测（Agent A 调用 B，B 调用 A）
class LoopDetector:
    def __init__(self, max_visits: int = 3):
        self.visit_count = defaultdict(int)
        self.max_visits = max_visits
    
    def check(self, agent_name: str) -> bool:
        self.visit_count[agent_name] += 1
        if self.visit_count[agent_name] > self.max_visits:
            raise RuntimeError(f"Agent {agent_name} 疑似陷入循环，已访问 {self.max_visits} 次")
        return True

# 3. 成本上限（整个 Multi-Agent 任务）
class CostGuard:
    def __init__(self, max_cost_usd: float = 1.0):
        self.max_cost = max_cost_usd
        self.current_cost = 0.0
    
    def record(self, tokens_used: int, model: str):
        cost = tokens_used * MODEL_COSTS[model]
        self.current_cost += cost
        if self.current_cost > self.max_cost:
            raise RuntimeError(f"成本超限 $" + str(round(self.current_cost, 2)) + " > $" + str(self.max_cost))`}</div>
        </div>

      </div>
    </div>
  );
}
