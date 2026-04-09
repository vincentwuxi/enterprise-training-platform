import { useState } from 'react';
import './LessonCommon.css';

const PATTERNS = [
  {
    key: 'react', name: 'ReAct', icon: '🔄',
    full: 'Reasoning + Acting',
    desc: '最基础、最广泛使用的 Agent 模式。交替执行"思考"和"行动"，每次行动后观察结果再决定下一步。',
    loop: [
      { label: 'Thought', color: '#a78bfa', desc: '分析当前状态，决定下一步行动' },
      { label: 'Action',  color: '#f59e0b', desc: '调用工具（搜索/计算/API…）' },
      { label: 'Observation', color: '#10b981', desc: '观察工具返回结果' },
    ],
    pros: ['实现简单，可解释性强', '适合工具调用明确的任务'],
    cons: ['容易陷入无效循环', '复杂任务规划能力弱'],
    code: `from langchain.agents import create_react_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain import hub
from langchain.tools import DuckDuckGoSearchRun, Calculator

# 工具列表
tools = [
    DuckDuckGoSearchRun(name="web_search"),
    Calculator(name="calculator"),
]

# 使用官方 ReAct prompt 模板
prompt = hub.pull("hwchase17/react")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 创建 ReAct Agent
agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,         # 打印思考过程
    handle_parsing_errors=True,
    max_iterations=10,    # 防止无限循环
)

# 运行
result = agent_executor.invoke({
    "input": "特斯拉今天股价是多少？比昨天涨了多少百分比？"
})
print(result["output"])

# 输出格式：
# Thought: 我需要查询特斯拉今天的股价
# Action: web_search
# Action Input: "Tesla stock price today 2025"
# Observation: $248.50...
# Thought: 现在需要查昨天的价格...
# [继续循环直到得出答案]`,
  },
  {
    key: 'plan', name: 'Plan-and-Execute', icon: '📋',
    full: 'Planner + Executor',
    desc: '先用 LLM 制定完整计划（多步骤任务列表），再逐步执行。适合需要全局规划的复杂任务。',
    loop: [
      { label: 'Plan', color: '#a78bfa', desc: 'LLM 分析目标，生成完整步骤列表' },
      { label: 'Execute Step N', color: '#f59e0b', desc: '执行当前步骤（调用工具/子Agent）' },
      { label: 'Replan（可选）', color: '#06b6d4', desc: '执行结果出乎预料时重新规划' },
    ],
    pros: ['全局规划能力强', '适合 10+ 步骤的复杂任务'],
    cons: ['初始计划可能不完善', '执行中途调整计划代价高'],
    code: `from langchain_experimental.plan_and_execute import (
    PlanAndExecute, load_agent_executor, load_chat_planner
)
from langchain_openai import ChatOpenAI
from langchain.tools import DuckDuckGoSearchRun

tools = [DuckDuckGoSearchRun()]
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Planner：负责制定计划（用能力更强的模型）
planner = load_chat_planner(llm)

# Executor：负责执行每一步（用较小的模型节省成本）
executor_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
executor = load_agent_executor(executor_llm, tools, verbose=True)

# 组合 Plan-and-Execute Agent
agent = PlanAndExecute(planner=planner, executor=executor, verbose=True)

result = agent.invoke({
    "input": "研究 Anthropic 公司：分析其最新产品、主要竞争对手、估值历史，并写一份 500 字的投资分析报告"
})

# 输出：
# 计划：
# 1. 搜索 Anthropic 最新产品发布
# 2. 搜索 Anthropic 主要竞争对手
# 3. 搜索 Anthropic 融资历史和估值
# 4. 综合信息写投资分析报告
# [逐步执行...]`,
  },
  {
    key: 'reflection', name: 'Reflection', icon: '🪞',
    full: 'Generate + Critique + Revise',
    desc: 'Agent 生成输出后，用另一个 LLM（或同一个）对输出进行批判性审查，再根据反馈修订。类似"自我审查"。',
    loop: [
      { label: 'Generate', color: '#a78bfa', desc: '生成初始答案/代码/文档' },
      { label: 'Reflect', color: '#ef4444', desc: '批判性地检查问题、遗漏、错误' },
      { label: 'Revise', color: '#10b981', desc: '根据反馈修订并改进输出' },
    ],
    pros: ['显著提升输出质量', '无需额外训练即可自我改进'],
    cons: ['消耗更多 Token 和时间', '需要设置终止条件（N 轮）'],
    code: `from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# 生成者 Prompt
GENERATE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "你是一位专业的技术文档写作者。"),
    ("human", "请写一篇关于 {topic} 的技术博客文章（约500字）。"),
])

# 反思者 Prompt
REFLECT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """你是一位严格的技术文章评审专家。
请评审以下文章，指出：
1. 技术不准确的地方
2. 遗漏的重要内容
3. 表达可以改进的地方
给出具体的修改建议（3-5条）。"""),
    ("human", "文章主题：{topic}\n\n文章内容：\n{content}"),
])

# Reflection 循环
async def reflection_agent(topic: str, max_rounds: int = 3) -> str:
    # 初始生成
    content = (GENERATE_PROMPT | llm).invoke({"topic": topic}).content
    
    for round_n in range(max_rounds):
        # 反思
        critique = (REFLECT_PROMPT | llm).invoke({
            "topic": topic,
            "content": content,
        }).content
        
        # 修订
        revise_prompt = f"""基于以下评审意见修订文章：

评审意见：{critique}

原文：{content}

请给出修订后的完整文章："""
        content = llm.invoke(revise_prompt).content
        print(f"Round {round_n + 1} complete")
    
    return content`,
  },
];

export default function LessonFoundation() {
  const [pattern, setPattern] = useState('react');
  const p = PATTERNS.find(x => x.key === pattern) ?? {};

  return (
    <div className="ag-lesson">
      <div className="ag-hero">
        <div className="ag-badge">// MODULE 01 · AGENT FOUNDATION</div>
        <h1>Agent 原理与推理架构</h1>
        <p>AI Agent = LLM + 记忆 + 工具 + 规划。<strong>ReAct、Plan-and-Execute、Reflection</strong> 是三种最核心的推理模式，理解它们的优劣和适用场景，是设计生产级 Agent 的起点。</p>
      </div>

      <div className="ag-section">
        <div className="ag-grid-4">
          {[
            { v: '≠ Chatbot', l: 'Agent 能自主决策和行动' },
            { v: 'Tool Use', l: '调用外部工具是核心能力' },
            { v: 'Loop', l: '思考-行动-观察循环' },
            { v: 'Memory', l: '记忆让 Agent 持续进化' },
          ].map((s, i) => (
            <div key={i} className="ag-metric">
              <div className="ag-metric-val" style={{ fontSize: '1.1rem' }}>{s.v}</div>
              <div className="ag-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">🧠 三大推理模式深度对比</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {PATTERNS.map(p => (
            <button key={p.key} className={`ag-btn ${pattern === p.key ? 'active' : ''}`} onClick={() => setPattern(p.key)}>
              {p.icon} {p.name} <span className="ag-tag purple" style={{ marginLeft: '0.3rem' }}>{p.full}</span>
            </button>
          ))}
        </div>
        <div className="ag-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="ag-card">
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>{p.icon} {p.name} — {p.full}</div>
            <div style={{ color: 'var(--ag-muted)', fontSize: '0.88rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p.desc}</div>
            <div className="ag-loop">
              {p.loop?.map((step, i) => (
                <div key={i}>
                  <div className="ag-loop-item">
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, fontSize: '0.8rem', color: step.color, flexShrink: 0 }}>{step.label}</span>
                    <span style={{ fontSize: '0.83rem', color: 'var(--ag-muted)' }}>{step.desc}</span>
                  </div>
                  {i < p.loop.length - 1 && <div className="ag-loop-arrow">↓</div>}
                </div>
              ))}
              <div style={{ textAlign: 'center', color: 'var(--ag-violet)', fontSize: '0.78rem', marginTop: '0.3rem' }}>↺ 循环直到任务完成</div>
            </div>
          </div>
          <div className="ag-card">
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ag-green)', marginBottom: '0.5rem' }}>✅ 优势</div>
            {p.pros?.map((pro, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--ag-muted)', marginBottom: '0.35rem' }}>→ {pro}</div>)}
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ag-red)', marginBottom: '0.5rem', marginTop: '0.75rem' }}>⚠️ 局限</div>
            {p.cons?.map((con, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--ag-muted)', marginBottom: '0.35rem' }}>→ {con}</div>)}
          </div>
        </div>
        <div className="ag-code-wrap">
          <div className="ag-code-head">
            <div className="ag-code-dot" style={{ background: '#ef4444' }} /><div className="ag-code-dot" style={{ background: '#f59e0b' }} /><div className="ag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{p.key}_agent.py</span>
          </div>
          <div className="ag-code">{p.code}</div>
        </div>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">📊 推理模式选型指南</div>
        <div className="ag-card" style={{ overflowX: 'auto' }}>
          <table className="ag-table">
            <thead><tr><th>场景特征</th><th>推荐模式</th><th>理由</th></tr></thead>
            <tbody>
              {[
                ['简单工具调用（1-3次）', 'ReAct', '实现最简单，足够应对'],
                ['需要搜索并合成信息', 'ReAct', '灵活适应搜索结果'],
                ['复杂多步骤任务（10+ 步）', 'Plan-and-Execute', '全局规划，避免迷失方向'],
                ['输出质量要求极高', 'Reflection', '多轮自我审查显著提升质量'],
                ['生产稳定性优先', 'LangGraph（显式工作流）', '可控、可监控、可回滚'],
                ['多智能体协作', 'Multi-Agent（模块七）', '职责分离，并行处理'],
              ].map(([s, r, reason], i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--ag-muted)', fontSize: '0.84rem' }}>{s}</td>
                  <td><span className="ag-tag purple">{r}</span></td>
                  <td style={{ color: 'var(--ag-muted)', fontSize: '0.83rem' }}>{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
