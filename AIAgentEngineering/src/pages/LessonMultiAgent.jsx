import { useState } from 'react';
import './LessonCommon.css';

export default function LessonMultiAgent() {
  const [tab, setTab] = useState('architecture');

  const codes = {
    architecture: `# ━━━━ Multi-Agent 系统架构模式 ━━━━

# ━━━━ 模式 1：Orchestrator + Subagent ━━━━
# Orchestrator 负责任务分解和结果汇总
# Subagents 各司其职，专注特定领域

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

ORCHESTRATOR_PROMPT = """你是一个任务协调器。
将用户的请求分解为子任务，并分配给专业 Agent：
- research_agent: 负责信息检索和事实核查
- code_agent: 负责代码编写和调试
- writer_agent: 负责文档和报告撰写

输出 JSON 格式的任务分配：
{"tasks": [{"agent": "xxx", "task": "xxx"}, ...]}"""

async def orchestrator_node(state):
    """任务分解与分配"""
    plan = await llm.ainvoke([
        {"role": "system", "content": ORCHESTRATOR_PROMPT},
        {"role": "user", "content": state["user_request"]},
    ])
    tasks = json.loads(plan.content)["tasks"]
    return {"task_queue": tasks, "results": []}

async def research_agent_node(state):
    """专业搜索 Agent"""
    task = next(t for t in state["task_queue"] if t["agent"] == "research_agent")
    result = await research_chain.ainvoke({"task": task["task"]})
    return {"results": state["results"] + [{"agent": "research", "result": result}]}

async def code_agent_node(state):
    """专业代码 Agent（沙盒执行）"""
    task = next(t for t in state["task_queue"] if t["agent"] == "code_agent")
    code = await code_chain.ainvoke({"task": task["task"]})
    execution_result = sandbox.run(code)  # E2B/Docker 沙盒
    return {"results": state["results"] + [{"agent": "code", "result": execution_result}]}

async def aggregator_node(state):
    """汇总所有子 Agent 结果"""
    all_results = "\n\n".join([f"[{r['agent']}]: {r['result']}" for r in state["results"]])
    final = await llm.ainvoke(f"综合以下结果，给出最终答案：\n{all_results}")
    return {"final_answer": final.content}`,

    crewai: `# ━━━━ CrewAI：角色扮演式 Multi-Agent ━━━━
# pip install crewai crewai-tools

from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, FileWriterTool

# ━━━━ 定义专业角色 ━━━━
researcher = Agent(
    role="Senior Research Analyst",
    goal="研究并分析 {topic} 的最新动态，提供深度洞察",
    backstory="""你是一位有10年经验的技术研究员，
    擅长从多维度分析技术趋势和市场动态。""",
    tools=[SerperDevTool()],         # 搜索工具
    llm="gpt-4o",
    verbose=True,
    max_iter=5,
)

writer = Agent(
    role="Technical Content Writer",
    goal="将研究结果转化为高质量的技术报告",
    backstory="""你是一位精通技术写作的专业作家，
    能够将复杂的技术内容转化为清晰易懂的读者友好文章。""",
    tools=[FileWriterTool()],        # 可写入文件
    llm="gpt-4o-mini",
    verbose=True,
)

reviewer = Agent(
    role="Quality Assurance Specialist",
    goal="审查报告的准确性、完整性和可读性",
    backstory="你是严格的质量审查专家，确保输出达到发布标准。",
    llm="gpt-4o-mini",
    verbose=True,
)

# ━━━━ 定义任务 ━━━━
research_task = Task(
    description="研究 {topic} 的当前状态：技术原理、主要玩家、最新进展。提供详实的事实和数据。",
    expected_output="3000字的研究报告，包含关键数据点和引用来源",
    agent=researcher,
)

writing_task = Task(
    description="基于研究报告，撰写一篇面向工程师的深度技术文章",
    expected_output="结构清晰的技术文章，含代码示例和实践建议",
    agent=writer,
    context=[research_task],  # 依赖 research_task 的输出
)

review_task = Task(
    description="审查文章并提出修改意见，确保技术准确性",
    expected_output="修订后的最终文章",
    agent=reviewer,
    context=[writing_task],
)

# ━━━━ 组建 Crew 并运行 ━━━━
crew = Crew(
    agents=[researcher, writer, reviewer],
    tasks=[research_task, writing_task, review_task],
    process=Process.sequential,     # Sequential / Hierarchical
    verbose=True,
    memory=True,                    # 启用持久化记忆
)

result = crew.kickoff(inputs={"topic": "AI Agent 工程最佳实践 2025"})`,

    autogen: `# ━━━━ AutoGen：对话驱动的 Multi-Agent ━━━━
# pip install pyautogen

import autogen

llm_config = {
    "model": "gpt-4o-mini",
    "api_key": os.environ["OPENAI_API_KEY"],
    "timeout": 60,
}

# ━━━━ 定义 Agent ━━━━
user_proxy = autogen.UserProxyAgent(
    name="User",
    human_input_mode="NEVER",          # NEVER / ALWAYS / TERMINATE
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: "TERMINATE" in x.get("content", ""),
    code_execution_config={
        "use_docker": True,            # 使用 Docker 沙盒执行代码
        "work_dir": "/tmp/autogen",
    },
)

engineer = autogen.AssistantAgent(
    name="Engineer",
    llm_config=llm_config,
    system_message="""你是一位精通 Python 和机器学习的工程师。
    编写高质量代码，并在每段代码末尾加 # TERMINATE 表示完成。""",
)

critic = autogen.AssistantAgent(
    name="Critic",
    llm_config=llm_config,
    system_message="""你是一位代码审查专家。
    审查 Engineer 的代码，发现问题时提出具体修改意见。
    代码完全正确时回复 "TERMINATE"。""",
)

# ━━━━ GroupChat：多 Agent 群聊协作 ━━━━
groupchat = autogen.GroupChat(
    agents=[user_proxy, engineer, critic],
    messages=[],
    max_round=20,
    speaker_selection_method="auto",   # LLM 自动决定谁发言
)
manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=llm_config)

# 启动对话
user_proxy.initiate_chat(
    manager,
    message="实现一个 RAG 系统的评测脚本，用 RAGAs 库评估 Faithfulness 和 Answer Relevancy",
)`,
  };

  return (
    <div className="ag-lesson">
      <div className="ag-hero">
        <div className="ag-badge">// MODULE 05 · MULTI-AGENT SYSTEMS</div>
        <h1>Multi-Agent 系统</h1>
        <p>单个 Agent 的能力有上限。<strong>Multi-Agent 系统通过职责分离、并行执行、专业协作</strong>突破边界——处现复杂任务的能力呈指数级增长。CrewAI 和 AutoGen 是当前最成熟的两个框架。</p>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">🤝 三种 Multi-Agent 实现方式</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['architecture', '🏗️ Orchestrator 架构'], ['crewai', '🚀 CrewAI 角色协作'], ['autogen', '💬 AutoGen 对话协作']].map(([k, l]) => (
            <button key={k} className={`ag-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ag-code-wrap">
          <div className="ag-code-head">
            <div className="ag-code-dot" style={{ background: '#ef4444' }} /><div className="ag-code-dot" style={{ background: '#f59e0b' }} /><div className="ag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.py</span>
          </div>
          <div className="ag-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">📊 框架选型指南</div>
        <div className="ag-card" style={{ overflowX: 'auto' }}>
          <table className="ag-table">
            <thead><tr><th>框架</th><th>核心理念</th><th>优势</th><th>适合场景</th></tr></thead>
            <tbody>
              {[
                ['LangGraph Multi-Agent', '显式图状态控制', '可控性最强，生产首选', '需要精确控制流程的企业应用'],
                ['CrewAI', '角色+职责的团队协作', '最快原型，角色设定直观', '内容生产/研究报告类任务'],
                ['AutoGen', 'LLM 驱动的对话协作', '代码执行能力强，迭代改进', '代码生成/数据分析任务'],
                ['手写 Orchestrator', '自定义 API 调用', '完全可控，无框架依赖', '超大规模/特殊需求'],
              ].map(([f, c, a, s], i) => (
                <tr key={i}>
                  <td><span className="ag-tag purple">{f}</span></td>
                  <td style={{ color: 'var(--ag-muted)', fontSize: '0.83rem' }}>{c}</td>
                  <td style={{ color: 'var(--ag-lavender)', fontSize: '0.83rem' }}>{a}</td>
                  <td style={{ color: 'var(--ag-muted)', fontSize: '0.83rem' }}>{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
