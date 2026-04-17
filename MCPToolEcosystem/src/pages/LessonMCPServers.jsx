import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['数据库 Server', 'API 网关 Server', '文件系统 Server', '组合 Server'];

export default function LessonMCPServers() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-container">
      <div className="lesson-badge">🔌 module_02 — MCP 实战</div>
      <h1 className="lesson-title">MCP 实战：构建生产级 Tool Server</h1>
      <p className="lesson-subtitle">
        理论之后是实战。本模块手把手构建 4 种最常用的 MCP Server：
        <strong>数据库查询</strong>（PostgreSQL/MySQL 自然语言查询）、
        <strong>API 网关</strong>（REST/GraphQL 转 MCP）、
        <strong>文件系统</strong>（安全沙盒文件操作）、
        <strong>组合 Server</strong>（多数据源聚合）。每个都是可直接部署的生产级代码。
      </p>

      <section className="lesson-section">
        <h2 className="section-title">🛠️ 四大 Server 实战</h2>
        <div className="lesson-tabs">
          {tabs.map((t, i) => (
            <button key={i} className={`tab-btn ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗄️ PostgreSQL MCP Server</h3>
              <span className="card-badge">Database</span>
              <div className="code-block">
                <div className="code-header">🐍 mcp_postgres_server.py</div>
                <pre>{`# —— PostgreSQL MCP Server: 让 AI 安全查询数据库 ——
from mcp.server.fastmcp import FastMCP
import asyncpg

mcp = FastMCP("postgres-server")
pool = None

@mcp.tool()
async def query_db(
    sql: str,
    params: list[str] | None = None
) -> str:
    """执行只读 SQL 查询（自动阻止写操作）
    
    Args:
        sql: SQL 查询语句（仅支持 SELECT）
        params: 查询参数（防 SQL 注入）
    """
    # 安全检查
    normalized = sql.strip().upper()
    dangerous = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE"]
    if any(normalized.startswith(d) for d in dangerous):
        return "⛔ 安全限制：仅允许 SELECT 查询"
    
    async with pool.acquire() as conn:
        # 设置只读事务
        async with conn.transaction(readonly=True):
            rows = await conn.fetch(sql, *(params or []))
            return format_table(rows)

@mcp.resource("db://tables")
async def list_tables() -> str:
    """列出所有可查询的表"""
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT table_name, 
                   pg_size_pretty(pg_total_relation_size(table_name::text))
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        return "\\n".join(f"📋 {r[0]} ({r[1]})" for r in rows)

@mcp.resource("db://schema/{table}")
async def get_schema(table: str) -> str:
    """获取表的字段定义和索引"""
    async with pool.acquire() as conn:
        cols = await conn.fetch("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position
        """, table)
        return format_schema(table, cols)

@mcp.prompt()
async def sql_helper(question: str) -> str:
    """生成 SQL 查询辅助 Prompt"""
    tables = await list_tables()
    return f"""用户问题：{question}

可用表：
{tables}

请生成安全的 SELECT 查询来回答用户问题。
注意：
1. 使用参数化查询防止注入
2. 添加 LIMIT 避免返回过多数据
3. 优先使用索引字段"""

@mcp.lifespan()
async def lifespan(server):
    global pool
    pool = await asyncpg.create_pool(
        "postgresql://readonly:pwd@localhost/analytics",
        min_size=2, max_size=10
    )
    yield
    await pool.close()

if __name__ == "__main__":
    mcp.run()`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 REST API → MCP 网关</h3>
              <span className="card-badge">API Gateway</span>
              <div className="code-block">
                <div className="code-header">🐍 mcp_api_gateway.py</div>
                <pre>{`# —— 将任意 REST API 转为 MCP Server ——
from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("api-gateway")

# 配置式定义 API 端点
API_CONFIG = {
    "jira": {
        "base_url": "https://company.atlassian.net/rest/api/3",
        "auth": ("email", "JIRA_API_TOKEN"),
    },
    "github": {
        "base_url": "https://api.github.com",
        "auth_header": "Bearer GITHUB_TOKEN",
    },
    "notion": {
        "base_url": "https://api.notion.com/v1",
        "auth_header": "Bearer NOTION_TOKEN",
    }
}

@mcp.tool()
async def jira_search(jql: str, max_results: int = 10) -> str:
    """搜索 Jira Issues
    
    Args:
        jql: JQL 查询表达式
        max_results: 最大返回数量
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_CONFIG['jira']['base_url']}/search",
            params={"jql": jql, "maxResults": max_results},
            auth=API_CONFIG['jira']['auth']
        )
        issues = resp.json()["issues"]
        return format_issues(issues)

@mcp.tool()
async def github_list_prs(
    repo: str,
    state: str = "open"
) -> str:
    """列出 GitHub PR
    
    Args:
        repo: 仓库名（owner/repo 格式）
        state: PR 状态（open/closed/all）
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_CONFIG['github']['base_url']}/repos/{repo}/pulls",
            params={"state": state},
            headers={"Authorization": API_CONFIG['github']['auth_header']}
        )
        return format_prs(resp.json())

@mcp.tool()
async def notion_search(query: str) -> str:
    """搜索 Notion 页面"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_CONFIG['notion']['base_url']}/search",
            json={"query": query},
            headers={
                "Authorization": API_CONFIG['notion']['auth_header'],
                "Notion-Version": "2022-06-28"
            }
        )
        return format_notion_results(resp.json())`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📁 安全沙盒文件系统 Server</h3>
              <span className="card-badge">Filesystem</span>
              <div className="code-block">
                <div className="code-header">🐍 mcp_fs_server.py</div>
                <pre>{`# —— 安全文件系统 MCP Server ——
from mcp.server.fastmcp import FastMCP
from pathlib import Path
import os

ALLOWED_ROOT = Path("/data/workspace")  # 沙盒根目录
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

mcp = FastMCP("filesystem-server")

def safe_path(relative: str) -> Path:
    """路径安全检查：防止目录遍历攻击"""
    resolved = (ALLOWED_ROOT / relative).resolve()
    if not str(resolved).startswith(str(ALLOWED_ROOT.resolve())):
        raise ValueError(f"⛔ 路径越界: {relative}")
    return resolved

@mcp.tool()
async def read_file(path: str) -> str:
    """读取文件内容
    
    Args:
        path: 相对于工作区的文件路径
    """
    target = safe_path(path)
    if target.stat().st_size > MAX_FILE_SIZE:
        return f"⛔ 文件过大: {target.stat().st_size} bytes"
    return target.read_text(encoding="utf-8")

@mcp.tool()
async def write_file(path: str, content: str) -> str:
    """写入文件（自动创建目录）"""
    target = safe_path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    return f"✅ 已写入 {target} ({len(content)} 字符)"

@mcp.tool()
async def list_directory(
    path: str = ".",
    pattern: str = "*"
) -> str:
    """列出目录内容"""
    target = safe_path(path)
    entries = sorted(target.glob(pattern))
    lines = []
    for e in entries[:100]:  # 限制数量
        rel = e.relative_to(ALLOWED_ROOT)
        icon = "📁" if e.is_dir() else "📄"
        size = f" ({e.stat().st_size}B)" if e.is_file() else ""
        lines.append(f"{icon} {rel}{size}")
    return "\\n".join(lines)

@mcp.tool()
async def search_files(
    pattern: str,
    content_pattern: str | None = None
) -> str:
    """搜索文件（支持内容搜索）"""
    results = []
    for f in ALLOWED_ROOT.rglob(pattern):
        if content_pattern and f.is_file():
            text = f.read_text(errors="ignore")
            if content_pattern.lower() in text.lower():
                results.append(str(f.relative_to(ALLOWED_ROOT)))
        elif not content_pattern:
            results.append(str(f.relative_to(ALLOWED_ROOT)))
    return f"找到 {len(results)} 个文件:\\n" + "\\n".join(results[:50])`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 组合 Server: 多数据源聚合</h3>
              <span className="card-badge">Composite</span>
              <div className="code-block">
                <div className="code-header">🐍 mcp_composite_server.py</div>
                <pre>{`# —— 组合 Server: 将多个数据源聚合为统一 MCP 接口 ——
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("enterprise-composite")

@mcp.tool()
async def employee_360(employee_id: str) -> str:
    """员工360度视图 — 聚合 HR/项目/绩效数据
    
    Args:
        employee_id: 员工工号
    """
    # 并行查询多个数据源
    hr_data, projects, reviews = await asyncio.gather(
        query_hr_system(employee_id),
        query_project_system(employee_id),
        query_review_system(employee_id)
    )
    
    return f"""## 👤 员工 {employee_id} 全景视图

### 基本信息 (HR)
- 姓名: {hr_data['name']}
- 部门: {hr_data['dept']}
- 入职: {hr_data['join_date']}

### 项目参与 (PM)
{format_projects(projects)}

### 绩效记录 (Review)
{format_reviews(reviews)}"""

@mcp.tool()
async def cross_system_report(
    report_type: str,
    date_range: str
) -> str:
    """跨系统数据报表
    
    Args:
        report_type: 报表类型 (sales/engineering/hr)
        date_range: 日期范围 (2024-Q1)
    """
    match report_type:
        case "sales":
            crm = await query_crm(date_range)
            finance = await query_finance(date_range)
            return merge_sales_report(crm, finance)
        case "engineering":
            jira = await query_jira_stats(date_range)
            github = await query_github_stats(date_range)
            return merge_eng_report(jira, github)
        case "hr":
            headcount = await query_headcount(date_range)
            turnover = await query_turnover(date_range)
            return merge_hr_report(headcount, turnover)`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🏗️ Server 架构模式</h3>
              <span className="card-badge">最佳实践</span>
              <div className="code-block">
                <div className="code-header">📋 设计模式</div>
                <pre>{`MCP Server 设计模式：

1️⃣ 单一职责 Server
   ├── 每个 Server 一个数据源
   ├── 简单、可独立部署
   └── 适合: 工具数 < 10

2️⃣ 网关 Server
   ├── 一个 Server 代理多个 API
   ├── 统一认证和限流
   └── 适合: 类似 API 的聚合

3️⃣ 组合 Server
   ├── 聚合多数据源的业务逻辑
   ├── 跨系统关联查询
   └── 适合: 企业级复杂场景

4️⃣ 代理 Server (Proxy)
   ├── 在远程 Server 前加安全层
   ├── 日志/审计/限流
   └── 适合: 生产环境`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>📦 发布 Server</h3>
              <span className="card-badge">Distribution</span>
              <div className="code-block">
                <div className="code-header">📋 发布checklist</div>
                <pre>{`MCP Server 发布清单：

□ pyproject.toml / package.json 完整
□ README 包含安装和配置说明
□ claude_desktop_config 示例
□ 输入参数有完整 description
□ 错误处理覆盖所有异常路径
□ 敏感信息通过 env 传递
□ 添加速率限制 (Rate Limit)
□ 日志记录所有 Tool 调用
□ Docker 镜像（可选）
□ 发布到 npm / PyPI`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
