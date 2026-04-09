import { useState } from 'react';
import './LessonCommon.css';

export default function LessonTools() {
  const [tab, setTab] = useState('function_calling');

  const codes = {
    function_calling: `# ━━━━ OpenAI Function Calling（原生）━━━━
from openai import OpenAI
import json, requests

client = OpenAI()

# 1. 定义工具（JSON Schema）
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的当前天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名，如北京、上海",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位",
                    },
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "搜索互联网上的最新信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "搜索关键词"},
                    "num_results": {"type": "integer", "description": "返回结果数量", "default": 5},
                },
                "required": ["query"],
            },
        },
    },
]

# 2. 工具执行函数
def execute_tool(name: str, args: dict) -> str:
    if name == "get_weather":
        # 实际调用天气 API
        return f"{args['city']}：晴天，28°C，湿度 60%"
    elif name == "search_web":
        return f"搜索 '{args['query']}' 的结果：[模拟结果...]"

# 3. Agent 循环
messages = [{"role": "user", "content": "北京明天天气怎么样？需要带伞吗？"}]

while True:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=tools,
        tool_choice="auto",  # auto / none / required
    )
    
    msg = response.choices[0].message
    messages.append(msg)
    
    # 没有工具调用 → 最终回答
    if not msg.tool_calls:
        print("最终答案：", msg.content)
        break
    
    # 执行所有工具调用
    for tool_call in msg.tool_calls:
        result = execute_tool(
            tool_call.function.name,
            json.loads(tool_call.function.arguments)
        )
        messages.append({
            "role": "tool",
            "content": result,
            "tool_call_id": tool_call.id,
        })`,

    langchain_tools: `# ━━━━ LangChain Tool 开发全攻略 ━━━━
from langchain.tools import tool, StructuredTool
from pydantic import BaseModel, Field
from typing import Optional

# ━━━━ 方式 1：@tool 装饰器（最简单）━━━━
@tool
def calculate_roi(investment: float, profit: float) -> str:
    """计算投资回报率（ROI）。
    
    Args:
        investment: 投入金额（元）
        profit: 净利润（元）
    Returns:
        ROI 百分比字符串
    """
    roi = (profit / investment) * 100
    return f"ROI = {roi:.2f}%（投入 {investment} 元，盈利 {profit} 元）"

# ━━━━ 方式 2：Pydantic Schema（复杂参数校验）━━━━
class DatabaseQueryInput(BaseModel):
    table: str = Field(description="要查询的表名")
    conditions: dict = Field(description="查询条件，键值对", default={})
    limit: int = Field(description="返回行数上限", default=10, ge=1, le=1000)

@tool(args_schema=DatabaseQueryInput)
def query_database(table: str, conditions: dict, limit: int) -> str:
    """安全地查询数据库，只允许 SELECT 操作"""
    # 构建安全查询（防止 SQL 注入）
    query = f"SELECT * FROM {table}"
    if conditions:
        where = " AND ".join([f"{k}='{v}'" for k, v in conditions.items()])
        query += f" WHERE {where}"
    query += f" LIMIT {limit}"
    return f"查询结果：{query}（模拟 5 条记录）"

# ━━━━ 方式 3：异步工具（IO 密集型必用）━━━━
from langchain.tools import AsyncTool

async def async_fetch_api(url: str, params: dict = {}) -> str:
    """异步调用外部 API"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as response:
            data = await response.json()
            return json.dumps(data[:3])  # 只返回前 3 条

api_tool = AsyncTool(
    name="fetch_api",
    description="异步调用 RESTful API 获取数据",
    coroutine=async_fetch_api,
)

# ━━━━ 工具安全限制（关键！）━━━━
@tool
def safe_execute_python(code: str) -> str:
    """在沙盒中执行 Python 代码"""
    # ⚠️ 严禁直接 exec(code)！
    # 必须使用沙盒环境（见 Module 8）
    FORBIDDEN = ["import os", "import subprocess", "open(", "__import__"]
    for f in FORBIDDEN:
        if f in code:
            return f"错误：代码包含禁止操作 '{f}'"
    # 安全执行...
    return "执行成功"`,

    tool_selection: `# ━━━━ 工具选择策略与最佳实践 ━━━━

# ━━━━ 1. Semantic Tool Router（语义路由）━━━━
from langchain.tools import Tool
from langchain_openai import OpenAIEmbeddings
import numpy as np

class SemanticToolRouter:
    """根据用户意图语义选择最相关工具"""
    
    def __init__(self, tools: list[Tool]):
        self.tools = tools
        self.embeddings = OpenAIEmbeddings()
        # 预计算所有工具描述的向量
        descriptions = [t.description for t in tools]
        self.tool_vectors = self.embeddings.embed_documents(descriptions)
    
    def select_tools(self, query: str, top_k: int = 3) -> list[Tool]:
        query_vec = self.embeddings.embed_query(query)
        query_arr = np.array(query_vec)
        
        scores = [
            np.dot(query_arr, np.array(tv)) /
            (np.linalg.norm(query_arr) * np.linalg.norm(tv))
            for tv in self.tool_vectors
        ]
        top_indices = np.argsort(scores)[-top_k:][::-1]
        return [self.tools[i] for i in top_indices]

# ━━━━ 2. 工具调用重试（网络工具必备）━━━━
from tenacity import retry, stop_after_attempt, wait_exponential

@tool
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
def resilient_web_search(query: str) -> str:
    """带重试机制的 Web 搜索"""
    return _do_search(query)

# ━━━━ 3. 工具调用缓存（减少重复 API 调用）━━━━
import hashlib, json
from functools import wraps

_cache = {}

def cached_tool(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        key = hashlib.md5(f"{func.__name__}{args}{kwargs}".encode()).hexdigest()
        if key in _cache:
            return _cache[key]
        result = func(*args, **kwargs)
        _cache[key] = result
        return result
    return wrapper

# ━━━━ 工具设计黄金法则 ━━━━
# 1. 一个工具只做一件事（单一职责）
# 2. 工具描述要精准（影响 LLM 是否会调用它）
# 3. 参数有类型注解 + Field(description=) → LLM 更准确传参
# 4. 返回值要友好（字符串，而不是复杂对象）
# 5. 所有写操作工具必须有确认机制（人工审批）`,
  };

  return (
    <div className="ag-lesson">
      <div className="ag-hero">
        <div className="ag-badge">// MODULE 02 · TOOL USE</div>
        <h1>Tool Use & Function Calling</h1>
        <p>工具调用能力让 LLM 从"只会说话"变成"能做事"。<strong>Function Calling 是 Agent 连接外部世界的接口</strong>——搜索引擎、数据库、API、代码执行——怎么设计、怎么保护，决定了 Agent 能做什么、不能做什么。</p>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">🔧 三种工具开发范式</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['function_calling', '⚡ OpenAI Function Calling'], ['langchain_tools', '🦜 LangChain Tools'], ['tool_selection', '🎯 工具选择与优化']].map(([k, l]) => (
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
        <div className="ag-section-title">📦 常用工具生态</div>
        <div className="ag-grid-3">
          {[
            { cat: '搜索 & 信息', tools: ['DuckDuckGo Search', 'Tavily（RAG优化）', 'Serper（Google）', 'Wikipedia'], color: '#7c3aed' },
            { cat: '代码 & 计算', tools: ['Python REPL', 'E2B Sandbox', 'WolframAlpha', 'Jupyter Kernel'], color: '#f59e0b' },
            { cat: '数据 & 存储', tools: ['SQL Database', 'pandas DataFrame', 'Vector Store（RAG）', 'File System'], color: '#10b981' },
            { cat: '浏览器 & Web', tools: ['Playwright', 'Selenium', 'Browser Use', 'Puppeteer'], color: '#06b6d4' },
            { cat: '通信 & 协作', tools: ['Gmail / Outlook', 'Slack', 'GitHub', 'Notion API'], color: '#ef4444' },
            { cat: '企业 & 自定义', tools: ['REST API Tool', 'GraphQL Tool', '内部系统 API', 'gRPC Tool'], color: '#a78bfa' },
          ].map((c, i) => (
            <div key={i} className="ag-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.85rem', marginBottom: '0.6rem' }}>{c.cat}</div>
              {c.tools.map((t, j) => <div key={j} style={{ fontSize: '0.82rem', color: 'var(--ag-muted)', marginBottom: '0.25rem' }}>→ {t}</div>)}
            </div>
          ))}
        </div>
        <div className="ag-warn">
          ⚠️ <strong>工具安全原则</strong>：写操作工具（发邮件/删文件/执行代码）必须实现 human-in-the-loop 确认机制。永远假设 Agent 可能被 Prompt Injection 操控，从而触发恶意工具调用。
        </div>
      </div>
    </div>
  );
}
