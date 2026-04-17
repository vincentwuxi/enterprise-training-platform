import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['协议架构', 'Server 开发', 'Client 集成', 'Transport 层'];

export default function LessonMCPProtocol() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-container">
      <div className="lesson-badge">🔌 module_01 — MCP 协议深度</div>
      <h1 className="lesson-title">MCP 协议深度：AI 的通用工具接口</h1>
      <p className="lesson-subtitle">
        <strong>Model Context Protocol (MCP)</strong> 是 Anthropic 开源的 AI 工具调用标准协议。
        它让 AI 模型以统一方式连接任意数据源和工具——数据库、API、文件系统、浏览器——
        就像 USB 让所有外设即插即用一样。本模块从协议规范到实现全面拆解。
      </p>

      <section className="lesson-section">
        <h2 className="section-title">🏗️ MCP 四层架构</h2>
        <div className="lesson-tabs">
          {tabs.map((t, i) => (
            <button key={i} className={`tab-btn ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="card-grid">
            <div className="info-card">
              <h3>🖥️ Host (宿主)</h3>
              <span className="card-badge">顶层</span>
              <p>AI 应用本身（如 Claude Desktop、Cursor IDE）。Host 管理 MCP Client 的生命周期、安全策略和用户交互。</p>
              <div className="code-block">
                <div className="code-header">📋 Host 职责</div>
                <pre>{`Host 关键职责：
├── 创建/销毁 MCP Client 实例
├── 管理 Server 连接权限
├── 聚合多 Server 上下文 → LLM
├── 执行安全策略（用户确认 Tool 调用）
└── 协调多 Client 间的资源访问`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🔗 Client (客户端)</h3>
              <span className="card-badge">中间层</span>
              <p>协议的客户端实现。每个 Client 维护与一个 Server 的 1:1 有状态会话。</p>
              <div className="code-block">
                <div className="code-header">📋 Client 能力</div>
                <pre>{`Client 能力列表：
├── roots    → 向 Server 暴露文件系统根
├── sampling → 允许 Server 请求 LLM 补全
└── 协商     → 能力协商 (Capability Negotiation)`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>⚙️ Server (服务端)</h3>
              <span className="card-badge">核心</span>
              <p>工具和数据的提供者。Server 暴露 Resources、Tools、Prompts 三大原语。</p>
              <div className="code-block">
                <div className="code-header">📋 Server 三大原语</div>
                <pre>{`MCP Server Primitives:
├── Resources → 数据暴露（文件/DB/API 响应）
│   └── URI 寻址: file:///、postgres://
├── Tools     → 可执行动作（函数调用）
│   └── JSON Schema 参数定义
└── Prompts   → 预定义模板（可复用上下文）
    └── 参数化 prompt 片段`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🚌 Transport (传输层)</h3>
              <span className="card-badge">底层</span>
              <p>MCP 使用 JSON-RPC 2.0 消息格式，支持 stdio 和 HTTP+SSE 两种传输方式。</p>
              <div className="code-block">
                <div className="code-header">📋 消息类型</div>
                <pre>{`JSON-RPC 2.0 消息类型：
├── Request  → { method, params, id }
├── Response → { result, id } | { error, id }
└── Notification → { method, params }  // 无 id`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐍 Python MCP Server 开发</h3>
              <span className="card-badge">Python SDK</span>
              <div className="code-block">
                <div className="code-header">🔵 mcp_weather_server.py</div>
                <pre>{`# —— MCP Server: 天气查询工具 ——
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather-server")

# 定义 Resource: 城市天气数据
@mcp.resource("weather://{city}/current")
async def get_weather_resource(city: str) -> str:
    """获取城市当前天气（Resource 模式）"""
    # 实际项目中调用天气 API
    data = await fetch_weather_api(city)
    return json.dumps(data, ensure_ascii=False)

# 定义 Tool: 天气预报查询
@mcp.tool()
async def get_forecast(
    city: str,
    days: int = 3
) -> str:
    """查询未来 N 天天气预报
    
    Args:
        city: 城市名称（中文或英文）
        days: 预报天数（1-7）
    """
    forecast = await fetch_forecast_api(city, days)
    return format_forecast(forecast)

# 定义 Prompt: 天气分析模板
@mcp.prompt()
async def weather_analysis(city: str) -> str:
    """生成天气分析 prompt 模板"""
    weather = await get_weather_resource(city)
    return f"""请分析 {city} 的天气状况：
    
当前天气数据：{weather}

请给出：
1. 出行建议
2. 穿衣推荐  
3. 健康提醒"""

# 启动 Server
if __name__ == "__main__":
    mcp.run()  # 默认 stdio Transport`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>📦 TypeScript MCP Server</h3>
              <span className="card-badge">TypeScript SDK</span>
              <div className="code-block">
                <div className="code-header">🟢 mcp_db_server.ts</div>
                <pre>{`import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "database-server",
  version: "1.0.0"
});

// Tool: 执行 SQL 查询
server.tool(
  "query_database",
  "在数据库上执行只读 SQL 查询",
  {
    sql: z.string().describe("SQL 查询语句"),
    database: z.enum(["users", "orders", "analytics"])
  },
  async ({ sql, database }) => {
    // 安全检查: 只允许 SELECT
    if (!sql.trim().toUpperCase().startsWith("SELECT")) {
      return { content: [{ type: "text",
        text: "⛔ 安全限制: 只允许 SELECT 查询" }] };
    }
    const result = await executeQuery(database, sql);
    return { content: [{ type: "text",
      text: JSON.stringify(result, null, 2) }] };
  }
);

// Resource: 数据库 Schema
server.resource(
  "schema",
  "db://schema/{table}",
  async (uri) => {
    const table = uri.pathname.split("/").pop();
    const schema = await getTableSchema(table);
    return { contents: [{ uri: uri.href,
      text: JSON.stringify(schema) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>⚙️ 配置与注册</h3>
              <span className="card-badge">claude_desktop_config</span>
              <div className="code-block">
                <div className="code-header">📋 claude_desktop_config.json</div>
                <pre>{`{
  "mcpServers": {
    "weather": {
      "command": "python",
      "args": ["mcp_weather_server.py"],
      "env": {
        "WEATHER_API_KEY": "your-key"
      }
    },
    "database": {
      "command": "node",
      "args": ["mcp_db_server.js"],
      "env": {
        "DB_CONNECTION": "postgresql://..."
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/me/documents"
      ]
    }
  }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔌 MCP Client 集成到 LLM 应用</h3>
              <span className="card-badge">Client SDK</span>
              <div className="code-block">
                <div className="code-header">🐍 mcp_client_integration.py</div>
                <pre>{`# —— 将 MCP Server 集成到自己的 AI 应用 ——
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import anthropic

async def run_with_mcp_tools():
    # 1. 连接 MCP Server
    server_params = StdioServerParameters(
        command="python",
        args=["mcp_weather_server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 2. 初始化连接（能力协商）
            await session.initialize()
            
            # 3. 发现可用工具
            tools = await session.list_tools()
            print(f"可用工具: {[t.name for t in tools.tools]}")
            
            # 4. 转换为 Claude API 格式
            claude_tools = [{
                "name": tool.name,
                "description": tool.description,
                "input_schema": tool.inputSchema
            } for tool in tools.tools]
            
            # 5. 调用 Claude + MCP 工具
            client = anthropic.Anthropic()
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                tools=claude_tools,
                messages=[{"role": "user",
                    "content": "北京今天天气怎么样？"}]
            )
            
            # 6. 如果 Claude 请求 Tool 调用
            for block in response.content:
                if block.type == "tool_use":
                    # 通过 MCP 执行工具
                    result = await session.call_tool(
                        block.name,
                        arguments=block.input
                    )
                    print(f"工具结果: {result.content}")`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>📋 能力协商流程</h3>
              <span className="card-badge">Lifecycle</span>
              <div className="code-block">
                <div className="code-header">📋 MCP 会话生命周期</div>
                <pre>{`MCP 会话生命周期：
                
1. Initialize
   Client → Server: initialize(capabilities)
   Server → Client: initializeResult(capabilities)
   Client → Server: initialized (通知)
   
2. Operation (正常交互)
   ├── list_tools → 发现工具
   ├── call_tool  → 调用工具
   ├── list_resources → 发现资源
   ├── read_resource  → 读取资源
   └── list_prompts   → 发现 Prompt

3. Shutdown
   Client → close() → 清理资源`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🔄 多 Server 聚合</h3>
              <span className="card-badge">Multi-Server</span>
              <div className="code-block">
                <div className="code-header">📋 Host 聚合模式</div>
                <pre>{`Host 多 Server 编排：

Claude Desktop (Host)
├── Client A → Weather Server
│   └── Tools: get_forecast
├── Client B → Database Server
│   └── Tools: query_database
├── Client C → Filesystem Server
│   └── Tools: read_file, write_file
└── Client D → GitHub Server
    └── Tools: create_pr, list_issues

LLM 看到所有 Server 的工具合集,
自动选择最合适的工具来回答用户问题`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="card-grid">
            <div className="info-card">
              <h3>📡 stdio Transport</h3>
              <span className="card-badge">本地</span>
              <p>通过标准输入/输出 (stdin/stdout) 通信。适用于本地进程间通信。</p>
              <div className="code-block">
                <div className="code-header">📋 stdio 特点</div>
                <pre>{`stdio Transport:
├── 通信方式: stdin/stdout 管道
├── 适用场景: 本地工具、IDE 插件
├── 进程模型: Host 通过 spawn 启动 Server
├── 生命周期: Host 管理 Server 进程
├── 安全性: 继承操作系统进程隔离
└── 限制: 无法跨网络`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🌐 Streamable HTTP Transport</h3>
              <span className="card-badge">远程</span>
              <p>基于 HTTP + SSE 的流式传输。支持远程 Server 和跨网络通信。</p>
              <div className="code-block">
                <div className="code-header">🐍 http_transport.py</div>
                <pre>{`from mcp.server.fastmcp import FastMCP

mcp = FastMCP("remote-server")

@mcp.tool()
async def analyze(text: str) -> str:
    """远程文本分析工具"""
    return await run_analysis(text)

# 启动 HTTP Transport
if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        host="0.0.0.0",
        port=8080,
        path="/mcp"
    )`}</pre>
              </div>
            </div>

            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ Transport 对比决策表</h3>
              <span className="card-badge">选型指南</span>
              <div className="code-block">
                <div className="code-header">📋 Transport 选型矩阵</div>
                <pre>{`| 维度         | stdio           | Streamable HTTP    |
|-------------|-----------------|---------------------|
| 部署位置     | 本地进程         | 本地/远程均可         |
| 启动方式     | Host spawn      | 独立运行              |
| 并发支持     | 单客户端         | 多客户端              |
| 网络穿透     | ❌ 无法跨网络    | ✅ 支持               |
| 认证授权     | OS 进程隔离      | OAuth 2.0 / API Key  |
| 状态管理     | 进程绑定         | Session 管理          |
| 典型场景     | IDE 插件/CLI    | 企业内部/SaaS 工具     |
| 推荐指数     | ⭐⭐⭐⭐ 简单    | ⭐⭐⭐⭐⭐ 生产级      |`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="lesson-section">
        <h2 className="section-title">⚡ MCP vs 传统 Tool Calling</h2>
        <div className="card-grid">
          <div className="info-card">
            <h3>❌ 传统方式</h3>
            <span className="card-badge" style={{ background: '#ef4444' }}>硬编码</span>
            <div className="code-block">
              <pre>{`# 每个工具都要硬编码到应用中
def handle_tool_call(name, args):
    if name == "search":
        return search_api(args)
    elif name == "database":
        return db_query(args)
    elif name == "email":
        return send_email(args)
    # 每加一个工具都要改代码...
    # N 个 AI 应用 × M 个工具 = N×M 集成`}</pre>
            </div>
          </div>

          <div className="info-card">
            <h3>✅ MCP 方式</h3>
            <span className="card-badge" style={{ background: '#22c55e' }}>即插即用</span>
            <div className="code-block">
              <pre>{`# MCP: 工具自动发现、统一协议
async with mcp_client(server) as session:
    # 自动发现所有工具
    tools = await session.list_tools()
    
    # 统一调用接口
    result = await session.call_tool(
        name=tool_name,
        arguments=args
    )
    # N 个 AI 应用 + M 个 Server = N+M 集成`}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
