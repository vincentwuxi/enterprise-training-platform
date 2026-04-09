import { useState } from 'react';
import './LessonCommon.css';

const TOOL_EXAMPLES = [
  {
    name: '搜索工具', icon: '🔍',
    code: `from langchain_core.tools import tool
from langchain_community.tools import TavilySearchResults

# 使用内置搜索工具
search = TavilySearchResults(max_results=5)

# 或自定义工具（推荐方式）
@tool
def search_company_info(company: str, aspect: str) -> str:
    """搜索公司信息。
    
    Args:
        company: 公司名称，如 "OpenAI"
        aspect: 查询方向，如 "funding", "products", "news"
    """
    results = tavily_client.search(
        query=f"{company} {aspect}",
        search_depth="advanced",
        max_results=3
    )
    return "\\n".join([r["content"] for r in results["results"]])`
  },
  {
    name: '代码执行', icon: '💻',
    code: `from langchain_experimental.tools import PythonREPLTool

# ⚠️ 沙箱执行，生产环境需隔离
python_repl = PythonREPLTool()

# 自定义安全执行器
@tool
def run_python(code: str) -> str:
    """在沙箱环境中执行 Python 代码并返回结果。
    
    Args:
        code: 要执行的 Python 代码字符串
    """
    import subprocess, tempfile
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
        f.write(code)
        fname = f.name
    result = subprocess.run(
        ["python", "-c", code],
        capture_output=True, text=True, timeout=10,
        # 资源限制（Docker 容器中更安全）
    )
    return result.stdout or result.stderr`
  },
  {
    name: '数据库查询', icon: '🗄️',
    code: `from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit

# 连接数据库
db = SQLDatabase.from_uri("postgresql://user:pass@host/db")
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
sql_tools = toolkit.get_tools()

# 或自定义 SQL 工具
@tool
def query_sales_data(sql: str) -> str:
    """执行 SQL 查询销售数据（只允许 SELECT）。
    
    Args:
        sql: SQL 查询语句，仅支持 SELECT
    """
    if not sql.strip().upper().startswith("SELECT"):
        return "Error: 仅允许 SELECT 查询"
    conn = get_db_connection()
    result = pd.read_sql(sql, conn)
    return result.to_markdown(index=False)`
  },
  {
    name: '文件操作', icon: '📁',
    code: `from langchain_community.tools.file_management import (
    ReadFileTool, WriteFileTool, ListDirectoryTool
)

# 内置文件工具（限定工作目录）
file_tools = [
    ReadFileTool(root_dir="/workspace"),
    WriteFileTool(root_dir="/workspace"),
    ListDirectoryTool(root_dir="/workspace"),
]

# 自定义 PDF 读取
@tool  
def read_pdf(file_path: str, pages: str = "all") -> str:
    """读取 PDF 文件内容。
    
    Args:
        file_path: PDF 文件路径（相对于 /workspace）
        pages: 页码范围，如 "1-5" 或 "all"
    """
    from pypdf import PdfReader
    reader = PdfReader(f"/workspace/{file_path}")
    # ... 解析页码范围并返回文本`
  },
];

const MCP_INTRO = `# MCP (Model Context Protocol) — Anthropic 推出的开放标准
# 统一 AI 与工具的通信接口，类似 API 的"USB-C"

# MCP Server（工具提供方）
class FileSystemMCPServer:
    @mcp.tool()
    async def read_file(self, path: str) -> str:
        """读取文件"""
        with open(path) as f:
            return f.read()
    
    @mcp.resource("file://{path}")
    async def get_file_resource(self, path: str) -> str:
        return open(path).read()

# MCP Client（Agent 侧）
from anthropic import Anthropic
client = Anthropic()

# Claude 自动发现并调用 MCP 工具
response = client.beta.messages.create(
    model="claude-opus-4-5",
    mcp_servers=[{"url": "http://localhost:8080/mcp"}],
    messages=[{"role": "user", "content": "读取 config.json 并分析配置"}]
)`;

const PARALLEL_CODE = `# 并行工具调用（GPT-4 / Claude 3.5 支持）
# 一次 LLM 推理可以触发多个工具并发执行

# 示例：用户问"比较 TSLA 和 AAPL 的最新股价"
# LLM 输出：同时调用两个工具
tool_calls = [
    {"name": "get_stock_price", "arguments": {"symbol": "TSLA"}},
    {"name": "get_stock_price", "arguments": {"symbol": "AAPL"}},
]

# 并发执行
import asyncio
results = await asyncio.gather(*[
    execute_tool(call["name"], call["arguments"]) 
    for call in tool_calls
])
# TSLA: $248.5, AAPL: $189.3 → 同时返回 → 大幅减少延迟

# LangChain 自动处理并行调用
executor = AgentExecutor(
    agent=agent, tools=tools,
    # 启用并行工具调用（默认已支持）
)`;

export default function LessonToolCalling() {
  const [toolIdx, setToolIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('custom');

  return (
    <div className="ag-lesson">
      <div className="ag-container">

        <div className="ag-hero">
          <div className="ag-badge">模块三 · Tool Calling</div>
          <h1>工具调用 — Function Calling 与 MCP 协议</h1>
          <p>工具是 Agent 的"双手"。从 OpenAI Function Calling 到 Anthropic MCP 开放标准，再到自定义工具的安全设计——掌握工具调用的完整体系。</p>
        </div>

        <div className="ag-metrics">
          {[
            { v: '@tool', l: 'LangChain 工具装饰器' },
            { v: 'MCP', l: 'Anthropic 开放标准' },
            { v: '并行', l: '多工具同时执行' },
            { v: 'Schema', l: 'JSON Schema 参数定义' },
          ].map(m => (
            <div key={m.l} className="ag-metric-card">
              <div className="ag-metric-value">{m.v}</div>
              <div className="ag-metric-label">{m.l}</div>
            </div>
          ))}
        </div>

        {/* Tool Examples */}
        <div className="ag-section">
          <h2>🛠️ 常用工具类型与实现</h2>
          <div className="ag-tabs">
            {TOOL_EXAMPLES.map((t, i) => (
              <button key={i} className={`ag-tab${toolIdx === i ? ' active' : ''}`} onClick={() => setToolIdx(i)}>
                {t.icon} {t.name}
              </button>
            ))}
          </div>
          <div className="ag-code">{TOOL_EXAMPLES[toolIdx].code}</div>
          <div className="ag-tip">💡 <span>使用 <code>@tool</code> 装饰器时，<strong>docstring 就是工具描述</strong>，LLM 会基于 docstring 决定何时调用这个工具，写好注释比写代码更重要。</span></div>
        </div>

        {/* Function Calling vs MCP */}
        <div className="ag-section">
          <h2>⚡ Function Calling vs MCP 协议</h2>
          <div className="ag-tabs">
            {[['custom','自定义 Function Calling'],['mcp','MCP 开放协议'],['parallel','并行工具调用']].map(([k,l]) => (
              <button key={k} className={`ag-tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>
          {activeTab === 'custom' && (
            <div>
              <div className="ag-code">{`# OpenAI Function Calling 原生格式
import openai

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "parameters": {
            "type": "object",
            "properties": {
                "city":  {"type": "string", "description": "城市名，如'北京'"},
                "unit":  {"type": "string", "enum": ["celsius", "fahrenheit"]},
                "days":  {"type": "integer", "description": "预报天数(1-7)"}
            },
            "required": ["city"]
        }
    }
}]

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "明天北京天气怎么样？"}],
    tools=tools,
    tool_choice="auto",  # auto/required/none
)

# 解析工具调用
if response.choices[0].finish_reason == "tool_calls":
    for tool_call in response.choices[0].message.tool_calls:
        func_name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)
        result = call_function(func_name, args)
        # 将结果回传给模型继续推理`}</div>
            </div>
          )}
          {activeTab === 'mcp' && <div className="ag-code">{MCP_INTRO}</div>}
          {activeTab === 'parallel' && <div className="ag-code">{PARALLEL_CODE}</div>}
        </div>

        {/* Tool Design Principles */}
        <div className="ag-section">
          <h2>🎯 工具设计黄金法则</h2>
          <div className="ag-grid-2">
            {[
              { t: '✅ 单一职责', d: '每个工具只做一件事。get_user_name 和 get_user_email 分开，而非 get_user_info 返回一切' },
              { t: '✅ 描述精准', d: '工具描述需包含：是什么、何时用、不能做什么、返回格式。LLM 会严格依赖描述做决策' },
              { t: '✅ 输入验证', d: '用 Pydantic 校验所有参数，拒绝无效输入并返回明确错误信息' },
              { t: '✅ 幂等性', d: '工具多次调用结果一致（特别是写操作），避免 Agent 重试时造成副作用' },
              { t: '❌ 避免副作用链', d: '工具不应自动触发其他操作（如发邮件工具不应同时归档邮件）' },
              { t: '❌ 避免无限循环', d: '工具不应调用另一个会调用 LLM 的工具，防止递归消耗' },
            ].map((c, i) => (
              <div key={i} className="ag-card">
                <div className="ag-card-title">{c.t}</div>
                <div className="ag-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Registry Pattern */}
        <div className="ag-section">
          <h2>📦 企业级工具注册表模式</h2>
          <div className="ag-code">{`# 生产推荐：动态工具注册 + 权限控制
class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, BaseTool] = {}
        self._permissions: dict[str, list[str]] = {}
    
    def register(self, tool: BaseTool, allowed_roles: list[str]):
        self._tools[tool.name] = tool
        self._permissions[tool.name] = allowed_roles
    
    def get_tools_for_user(self, user_role: str) -> list[BaseTool]:
        """根据用户角色返回可用工具"""
        return [
            tool for name, tool in self._tools.items()
            if user_role in self._permissions.get(name, [])
        ]

# 注册工具并设置权限
registry = ToolRegistry()
registry.register(search_tool,    allowed_roles=["user", "admin"])
registry.register(delete_db_tool, allowed_roles=["admin"])  # 高权限工具限制
registry.register(send_email_tool, allowed_roles=["user", "admin"])

# Agent 实例化时动态注入工具
tools = registry.get_tools_for_user(current_user.role)
executor = AgentExecutor(agent=agent, tools=tools)`}</div>
        </div>

      </div>
    </div>
  );
}
