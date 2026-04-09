import { useState } from 'react';
import './LessonCommon.css';

const ARCH_CODE = `# 架构总览：GitHub PR 代码审查 Agent
#
# 触发: GitHub Webhook → PR 事件
# Flow: 获取代码变更 → 静态分析 → LLM 审查 → 生成评论 → 发布到 PR
#
# 技术栈:
# - LangGraph: 工作流编排（含 HITL）
# - GPT-4o: 代码理解与审查
# - GitHub API: 获取 PR 差异、发布评论
# - Semgrep: 静态安全扫描
# - Redis: 审查历史缓存（避免重复审查）

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated
import operator

class ReviewState(TypedDict):
    pr_url: str
    diff_content: str           # PR 代码变更
    static_issues: list[dict]   # Semgrep 发现的问题
    review_comments: list[dict] # LLM 生成的审查意见
    severity: str               # overall / blocking / warning
    messages: Annotated[list, operator.add]
    approved: bool | None       # 人工审批结果（HITL）`;

const TOOLS_CODE = `# 工具定义
from langchain_core.tools import tool
import subprocess, json, httpx

@tool
def fetch_pr_diff(pr_url: str) -> str:
    """获取 GitHub PR 的代码变更（diff）。
    Args:
        pr_url: PR 的完整 URL，如 https://github.com/org/repo/pull/123
    """
    # 解析 PR URL → owner/repo/pull_number
    parts = pr_url.rstrip("/").split("/")
    owner, repo, pull_number = parts[-4], parts[-3], parts[-1]
    
    r = httpx.get(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pull_number}/files",
        headers={"Authorization": f"Bearer {GITHUB_TOKEN}"},
    )
    files = r.json()
    diff_text = ""
    for f in files[:20]:  # 最多处理 20 个文件
        diff_text += f"\\n### {f['filename']} (+{f['additions']} -{f['deletions']})\\n"
        diff_text += (f.get("patch") or "")[:3000]  # 每文件限 3000 字符
    return diff_text

@tool
def run_static_analysis(code_diff: str) -> str:
    """对代码变更运行 Semgrep 静态安全扫描。
    Args:
        code_diff: Git diff 格式的代码变更内容
    """
    import tempfile, os
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
        # 提取新增代码行
        new_lines = [line[1:] for line in code_diff.splitlines() if line.startswith("+")]
        f.write("\\n".join(new_lines))
        fname = f.name
    
    result = subprocess.run(
        ["semgrep", "--config=auto", "--json", fname],
        capture_output=True, text=True, timeout=30,
    )
    os.unlink(fname)
    findings = json.loads(result.stdout).get("results", [])
    return json.dumps([{
        "rule": f["check_id"], "severity": f["extra"]["severity"],
        "message": f["extra"]["message"], "line": f["start"]["line"]
    } for f in findings[:10]])  # 最多返回 10 条

@tool
def post_pr_comment(pr_url: str, comment: str, review_type: str = "COMMENT") -> str:
    """向 GitHub PR 发布审查评论。
    Args:
        pr_url: PR 的完整 URL
        comment: 审查评论内容（Markdown 格式）
        review_type: APPROVE / REQUEST_CHANGES / COMMENT
    """
    parts = pr_url.rstrip("/").split("/")
    owner, repo, pull_number = parts[-4], parts[-3], parts[-1]
    
    r = httpx.post(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pull_number}/reviews",
        headers={"Authorization": f"Bearer {GITHUB_TOKEN}"},
        json={"event": review_type, "body": comment},
    )
    return f"评论已发布，状态: {r.status_code}"`;

const GRAPH_CODE = `# LangGraph 工作流定义
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import interrupt

# 工具列表
tools = [fetch_pr_diff, run_static_analysis, post_pr_comment]
llm = ChatOpenAI(model="gpt-4o", temperature=0)

REVIEW_PROMPT = """你是一名资深代码审查工程师。
审查代码时请关注:
1. 安全漏洞（SQL注入、XSS、未授权访问）
2. 性能问题（N+1查询、内存泄漏、阻塞调用）
3. 代码质量（重复代码、命名规范、函数复杂度）
4. 测试覆盖（关键路径是否有测试）

输出格式（JSON）:
{
  "severity": "blocking|warning|ok",
  "summary": "总体评价（1句话）",
  "issues": [
    {"type": "security|performance|quality", "file": "...", "line": 0, "description": "...", "suggestion": "..."}
  ]
}"""

def review_node(state: ReviewState) -> ReviewState:
    """核心 LLM 审查节点"""
    agent = create_react_agent(llm, tools, state_modifier=REVIEW_PROMPT)
    result = agent.invoke({
        "messages": [HumanMessage(
            f"请审查这个 PR: {state['pr_url']}\\n"
            f"静态分析结果：{json.dumps(state['static_issues'][:5])}\\n"
            "请获取代码变更并给出完整审查。"
        )]
    })
    return {"messages": result["messages"]}

def human_review_node(state: ReviewState) -> ReviewState:
    """HITL: blocking 级别问题需要人工确认"""
    if state.get("severity") == "blocking":
        decision = interrupt({
            "type": "review_approval",
            "pr_url": state["pr_url"],
            "issues": state["review_comments"],
            "question": "此 PR 存在 BLOCKING 级问题，是否阻止合并？"
        })
        return {"approved": decision.get("block_merge", True)}
    return {"approved": True}  # 非 blocking 自动通过

# 构建图
builder = StateGraph(ReviewState)
builder.add_node("fetch_and_analyze", fetch_and_analyze_node)
builder.add_node("llm_review",        review_node)
builder.add_node("human_review",      human_review_node)
builder.add_node("post_comment",      post_comment_node)

builder.set_entry_point("fetch_and_analyze")
builder.add_edge("fetch_and_analyze", "llm_review")
builder.add_edge("llm_review",        "human_review")
builder.add_conditional_edges("human_review", 
    lambda s: "post" if s.get("approved") else "end",
    {"post": "post_comment", "end": END}
)
builder.add_edge("post_comment", END)

# 编译（带 Checkpoint 支持 HITL 恢复）
graph = builder.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["human_review"],
)`;

const DEPLOY_CODE = `# 部署为 GitHub Actions + FastAPI 服务

# 1. FastAPI Webhook 端点
from fastapi import FastAPI, Request, BackgroundTasks

app = FastAPI()

@app.post("/webhook/github")
async def handle_webhook(request: Request, bg: BackgroundTasks):
    payload = await request.json()
    
    # 只处理 PR opened/synchronize 事件
    if payload.get("action") not in ["opened", "synchronize"]:
        return {"status": "ignored"}
    
    pr_url = payload["pull_request"]["html_url"]
    thread_id = f"pr_{payload['pull_request']['id']}"
    
    # 后台异步执行 Agent
    bg.add_task(
        run_review_agent,
        pr_url=pr_url,
        thread_id=thread_id,
    )
    return {"status": "review_started", "pr": pr_url}

# 2. 运行 Agent
async def run_review_agent(pr_url: str, thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    result = await graph.ainvoke(
        {"pr_url": pr_url, "messages": []},
        config=config,
    )
    logger.info(f"Review complete: {pr_url}, severity: {result.get('severity')}")`;

const SECTIONS = [
  { key: 'arch',   label: '架构设计',  code: ARCH_CODE },
  { key: 'tools',  label: '工具实现',  code: TOOLS_CODE },
  { key: 'graph',  label: 'LangGraph 工作流', code: GRAPH_CODE },
  { key: 'deploy', label: '部署上线',  code: DEPLOY_CODE },
];

const WEEKS = [
  {
    week: 'Week 1', title: '需求分析 & 技术选型',
    tasks: ['分析 PR 审查场景的核心需求', '确定工具链：GitHub API + Semgrep + LangGraph', '设计状态机图（节点+边+状态结构）', '搭建开发环境，验证 GitHub Webhook 接收'],
    output: '技术设计文档 + 环境就绪',
  },
  {
    week: 'Week 2', title: '核心工具开发',
    tasks: ['实现 fetch_pr_diff 工具', '集成 Semgrep 静态分析工具', '实现 post_pr_comment 工具', '单元测试每个工具，mock GitHub API'],
    output: '3个工具 + 测试用例',
  },
  {
    week: 'Week 3', title: 'LangGraph 工作流 & HITL',
    tasks: ['实现 4 个节点（fetch/review/human/post）', '配置条件边和 HITL 中断', '集成 Redis Checkpoint 持久化', '端对端测试（用真实 PR 验证）'],
    output: '完整工作流 + 持久化',
  },
  {
    week: 'Week 4', title: '安全加固 & 生产部署',
    tasks: ['添加 Guardrails 输入/输出防护', '运行 Red Team 对抗性测试', '部署 FastAPI + GitHub Actions', '接入 LangSmith 监控仪表盘'],
    output: '生产级 Agent 上线 🚀',
  },
];

export default function LessonAgentProject() {
  const [section, setSection] = useState('arch');
  const [expandedWeek, setExpandedWeek] = useState(0);

  return (
    <div className="ag-lesson">
      <div className="ag-container">

        <div className="ag-hero">
          <div className="ag-badge">模块八 · Capstone Project</div>
          <h1>实战项目 — 企业级 GitHub PR 审查 Agent</h1>
          <p>综合运用所有模块知识：LangGraph 工作流 + 工具调用 + HITL 人工介入 + 安全防护，构建一个真正跑在生产环境的代码审查 Agent。</p>
        </div>

        <div className="ag-metrics">
          {[
            { v: '4周', l: '项目周期' },
            { v: 'LangGraph', l: '工作流编排' },
            { v: 'HITL', l: '高危 PR 人工拦截' },
            { v: 'FastAPI', l: 'Webhook 服务' },
          ].map(m => (
            <div key={m.l} className="ag-metric-card">
              <div className="ag-metric-value">{m.v}</div>
              <div className="ag-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* Architecture Overview */}
        <div className="ag-section">
          <h2>🏗️ 系统架构</h2>
          <div className="ag-flow" style={{flexWrap:'wrap',gap:'0.5rem',marginBottom:'1.25rem'}}>
            {['GitHub PR', '→', 'Webhook', '→', 'FastAPI', '→', 'LangGraph', '→', 'GPT-4o\n+Tools', '→', 'PR Comment'].map((n,i) => (
              n === '→'
                ? <span key={i} className="ag-flow-arrow">→</span>
                : <div key={i} className="ag-flow-node" style={{fontSize:'0.78rem',whiteSpace:'pre-line',textAlign:'center'}}>{n}</div>
            ))}
          </div>
          <div className="ag-grid-3">
            {[
              { t: '📥 输入', d: 'GitHub Webhook 推送 PR 事件，包含 PR URL、作者、变更文件等元信息' },
              { t: '🔧 处理', d: 'LangGraph 编排：获取 Diff → 静态分析 → LLM 审查 → 可选人工确认' },
              { t: '📤 输出', d: '结构化审查评论发布到 GitHub PR，包含严重级别、问题描述和修复建议' },
            ].map((c, i) => (
              <div key={i} className="ag-card">
                <div className="ag-card-title">{c.t}</div>
                <div className="ag-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Sections */}
        <div className="ag-section">
          <h2>💻 完整代码实现</h2>
          <div className="ag-tabs">
            {SECTIONS.map(s => (
              <button key={s.key} className={`ag-tab${section === s.key ? ' active' : ''}`}
                onClick={() => setSection(s.key)}>{s.label}</button>
            ))}
          </div>
          <div className="ag-code">{SECTIONS.find(s => s.key === section)?.code}</div>
        </div>

        {/* 4-Week Plan */}
        <div className="ag-section">
          <h2>📅 四周开发计划</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {WEEKS.map((w, i) => (
              <div key={i} className="ag-card" style={{cursor:'pointer',borderColor: expandedWeek===i ? 'var(--ag-primary)' : 'var(--ag-border)'}}
                onClick={() => setExpandedWeek(expandedWeek===i ? -1 : i)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                    <span style={{background:'var(--ag-primary)',color:'#fff',padding:'0.2rem 0.75rem',borderRadius:'999px',fontSize:'0.78rem',fontWeight:700}}>{w.week}</span>
                    <span style={{fontWeight:600}}>{w.title}</span>
                  </div>
                  <span style={{color:'var(--ag-muted)'}}>{expandedWeek===i ? '▲' : '▼'}</span>
                </div>
                {expandedWeek === i && (
                  <div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid var(--ag-border)'}}>
                    <div className="ag-steps">
                      {w.tasks.map((t, j) => (
                        <div key={j} className="ag-step">
                          <div className="ag-step-content">
                            <div className="ag-step-desc">{t}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:'0.75rem',paddingTop:'0.75rem',borderTop:'1px solid var(--ag-border)',display:'flex',gap:'0.5rem',alignItems:'center'}}>
                      <span style={{fontSize:'0.78rem',color:'var(--ag-muted)'}}>本周交付：</span>
                      <span className="ag-tag green">{w.output}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Map */}
        <div className="ag-section">
          <h2>🗺️ 知识综合运用图</h2>
          <div className="ag-table-wrap">
            <table className="ag-table">
              <thead><tr><th>项目组件</th><th>对应模块</th><th>核心技术</th></tr></thead>
              <tbody>
                {[
                  ['PR 审查 Agent 整体', '模块一：Agent 架构', 'ReAct Pattern + 自主循环'],
                  ['工具调用', '模块三：Function Calling', 'GitHub API + Semgrep 工具封装'],
                  ['LangGraph 工作流', '模块五：LangGraph', '状态机 + 条件边 + Checkpoint'],
                  ['人工审核（HITL）', '模块五：LangGraph', 'interrupt() + 恢复机制'],
                  ['审查历史记忆', '模块四：记忆与状态', 'Redis 持久化 + 避免重复审查'],
                  ['安全防护', '模块七：安全评估', 'Guardrails + 输入验证'],
                  ['AgentExecutor', '模块二：LangChain', '工具注册 + verbose 调试'],
                ].map(([comp, mod, tech], i) => (
                  <tr key={i}>
                    <td style={{fontWeight:600,color:'var(--ag-primary)'}}>{comp}</td>
                    <td><span className="ag-tag">{mod}</span></td>
                    <td style={{fontSize:'0.85rem',color:'var(--ag-muted)'}}>{tech}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ag-tip" style={{marginTop:'1rem'}}>🎓 <span>完成本项目即可将"企业级 LangGraph Agent 开发"写入简历，包含完整的 GitHub 仓库链接和实际 PR 审查记录作为 Portfolio。</span></div>
        </div>

      </div>
    </div>
  );
}
