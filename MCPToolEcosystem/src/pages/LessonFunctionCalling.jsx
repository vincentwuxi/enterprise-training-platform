import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['基础调用', '并行调用', '嵌套 & 链式', '动态 Schema'];

export default function LessonFunctionCalling() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-container">
      <div className="lesson-badge">🔌 module_03 — Function Calling 高级</div>
      <h1 className="lesson-title">Function Calling 高级：AI 工具调用的极限</h1>
      <p className="lesson-subtitle">
        Function Calling 是 AI 模型与外部世界交互的核心机制。本模块从基础到高级：
        <strong>并行多工具调用</strong>、<strong>嵌套链式执行</strong>、
        <strong>动态 Schema 生成</strong>、<strong>流式工具调用</strong>——
        掌握 OpenAI / Anthropic / Google 三大平台的高级用法。
      </p>

      <section className="lesson-section">
        <h2 className="section-title">⚡ Function Calling 模式</h2>
        <div className="lesson-tabs">
          {tabs.map((t, i) => (
            <button key={i} className={`tab-btn ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="card-grid">
            <div className="info-card">
              <h3>🔵 OpenAI Function Calling</h3>
              <span className="card-badge">GPT-4o</span>
              <div className="code-block">
                <div className="code-header">🐍 openai_fc.py</div>
                <pre>{`from openai import OpenAI
client = OpenAI()

tools = [{
    "type": "function",
    "function": {
        "name": "get_stock_price",
        "description": "获取股票实时价格",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "股票代码 (如 AAPL)"
                },
                "currency": {
                    "type": "string",
                    "enum": ["USD", "CNY", "EUR"],
                    "default": "USD"
                }
            },
            "required": ["symbol"]
        }
    }
}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user",
        "content": "苹果和谷歌的股价是多少?"}],
    tools=tools,
    tool_choice="auto"  # auto/none/required
)

# 解析 tool_calls
for call in response.choices[0].message.tool_calls:
    print(f"调用: {call.function.name}")
    print(f"参数: {call.function.arguments}")`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🟣 Anthropic Tool Use</h3>
              <span className="card-badge">Claude</span>
              <div className="code-block">
                <div className="code-header">🐍 claude_tool_use.py</div>
                <pre>{`import anthropic
client = anthropic.Anthropic()

tools = [{
    "name": "get_stock_price",
    "description": "获取股票实时价格",
    "input_schema": {
        "type": "object",
        "properties": {
            "symbol": {
                "type": "string",
                "description": "股票代码"
            }
        },
        "required": ["symbol"]
    }
}]

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user",
        "content": "苹果股价多少?"}]
)

# Claude 返回 tool_use block
for block in response.content:
    if block.type == "tool_use":
        print(f"工具: {block.name}")
        print(f"参数: {block.input}")
        print(f"调用ID: {block.id}")`}</pre>
              </div>
            </div>

            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ 三大平台 Function Calling 对比</h3>
              <span className="card-badge">对比</span>
              <div className="code-block">
                <div className="code-header">📋 平台差异矩阵</div>
                <pre>{`| 特性             | OpenAI            | Anthropic         | Google Gemini      |
|-----------------|-------------------|-------------------|--------------------|
| 参数定义         | JSON Schema       | JSON Schema       | FunctionDeclaration|
| 并行调用         | ✅ 原生支持        | ✅ 支持            | ✅ 支持             |
| 强制调用         | tool_choice       | tool_choice       | tool_config        |
| 流式工具         | ✅ 增量 delta      | ✅ input_json_delta| ✅ 支持             |
| 嵌套调用         | 多轮对话实现       | 多轮对话实现        | 多轮对话实现         |
| Schema 严格模式  | strict: true      | ❌ 不支持          | ❌ 不支持            |
| 最大工具数       | 128               | 无硬限制           | 128                |`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 并行 Tool 调用</h3>
              <span className="card-badge">Parallel</span>
              <p>模型一次请求多个工具调用，减少交互轮次，大幅提升效率。</p>
              <div className="code-block">
                <div className="code-header">🐍 parallel_tool_calls.py</div>
                <pre>{`# —— 并行工具调用：一次请求触发多个工具 ——
import asyncio
from openai import OpenAI

client = OpenAI()

# 用户问: "比较 AAPL 和 GOOGL 的股价，并查看今天的天气"
# 模型会同时请求 3 个工具调用！

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user",
        "content": "比较苹果和谷歌的股价，并告诉我北京天气"}],
    tools=stock_tools + weather_tools,
    parallel_tool_calls=True  # 默认 True
)

msg = response.choices[0].message
print(f"并行调用数: {len(msg.tool_calls)}")
# 输出: 并行调用数: 3

# 关键: 并行执行所有工具调用
async def execute_parallel(tool_calls):
    tasks = []
    for call in tool_calls:
        fn = tool_registry[call.function.name]
        args = json.loads(call.function.arguments)
        tasks.append(fn(**args))
    
    # 所有工具同时执行！
    results = await asyncio.gather(*tasks)
    
    # 按顺序返回结果
    tool_messages = []
    for call, result in zip(tool_calls, results):
        tool_messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": json.dumps(result)
        })
    return tool_messages

# 第二轮: 把工具结果发回给模型
tool_results = await execute_parallel(msg.tool_calls)
final = client.chat.completions.create(
    model="gpt-4o",
    messages=messages + [msg] + tool_results
)
print(final.choices[0].message.content)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 嵌套 & 链式调用</h3>
              <span className="card-badge">Chaining</span>
              <div className="code-block">
                <div className="code-header">🐍 chained_tool_calls.py</div>
                <pre>{`# —— 链式工具调用: 工具结果触发下一个工具 ——
# 场景: "帮我找到上周最活跃的 GitHub PR 作者, 然后查他的 Jira 任务"

async def agentic_tool_loop(user_message: str, max_iterations=10):
    """Agent 循环：自动链式调用工具直到完成"""
    messages = [{"role": "user", "content": user_message}]
    
    for i in range(max_iterations):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=all_tools
        )
        
        msg = response.choices[0].message
        messages.append(msg)
        
        # 如果没有 tool_calls，说明 Agent 已完成
        if not msg.tool_calls:
            return msg.content
        
        # 执行所有工具调用
        print(f"🔄 迭代 {i+1}: {len(msg.tool_calls)} 个工具调用")
        for call in msg.tool_calls:
            fn_name = call.function.name
            args = json.loads(call.function.arguments)
            print(f"  └→ {fn_name}({args})")
            
            # 执行工具
            result = await tool_registry[fn_name](**args)
            
            # 结果反馈回消息流
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": str(result)
            })
    
    return "⚠️ 达到最大迭代次数"

# 执行示例
"""
🔄 迭代 1: 1 个工具调用
  └→ github_list_prs({"repo": "company/main", "days": 7})
🔄 迭代 2: 1 个工具调用  
  └→ github_get_user({"username": "alice"})
🔄 迭代 3: 1 个工具调用
  └→ jira_search({"assignee": "alice@company.com"})
✅ 完成: "Alice 上周提交了 12 个 PR，她的 Jira 上有..."
"""`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧬 动态 Schema 生成</h3>
              <span className="card-badge">Dynamic</span>
              <div className="code-block">
                <div className="code-header">🐍 dynamic_schema.py</div>
                <pre>{`# —— 动态工具 Schema：根据上下文生成工具定义 ——

class DynamicToolRegistry:
    """根据用户权限和上下文动态生成工具列表"""
    
    def __init__(self):
        self.all_tools = {}
        self.middlewares = []
    
    def register(self, name, fn, schema, roles=None, rate_limit=None):
        self.all_tools[name] = {
            "fn": fn,
            "schema": schema,
            "roles": roles or ["*"],
            "rate_limit": rate_limit
        }
    
    def get_tools_for_user(self, user) -> list[dict]:
        """根据用户角色动态过滤可用工具"""
        available = []
        for name, tool in self.all_tools.items():
            if "*" in tool["roles"] or user.role in tool["roles"]:
                available.append({
                    "type": "function",
                    "function": {
                        "name": name,
                        **tool["schema"]
                    }
                })
        return available
    
    def get_tools_for_context(self, context: dict) -> list[dict]:
        """根据对话上下文动态调整 Schema"""
        tools = []
        
        # 如果上下文包含数据库连接 → 暴露 DB 工具
        if "database" in context:
            db = context["database"]
            tools.append(self._build_db_tool(db))
        
        # 如果用户已认证 GitHub → 暴露 GitHub 工具
        if "github_token" in context:
            tools.extend(self._build_github_tools())
        
        # 根据对话历史推断需要的工具
        if any("图表" in m.get("content","") for m in context.get("messages",[])):
            tools.append(self._build_chart_tool())
        
        return tools

# 使用示例
registry = DynamicToolRegistry()
registry.register(
    "admin_delete_user",
    delete_user_fn,
    {"description": "删除用户", "parameters": {...}},
    roles=["admin"],  # 仅管理员可见
    rate_limit=10      # 每小时最多 10 次
)

# 普通用户看不到 admin 工具
tools = registry.get_tools_for_user(regular_user)  # 不含 admin_delete_user
tools = registry.get_tools_for_user(admin_user)     # 包含 admin_delete_user`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="lesson-section">
        <h2 className="section-title">🏭 生产级最佳实践</h2>
        <div className="card-grid">
          <div className="info-card">
            <h3>🛡️ 安全守则</h3>
            <span className="card-badge">Security</span>
            <div className="code-block">
              <pre>{`Function Calling 安全清单：

✅ 参数验证: 永远不信任 LLM 输出
   → Pydantic / Zod 强类型校验
✅ 权限控制: 按角色过滤工具
   → 最小权限原则  
✅ 速率限制: 防止 Agent 循环
   → 单次会话最大调用次数
✅ 审计日志: 记录每次调用
   → who/what/when/result
✅ 沙盒执行: 危险操作隔离
   → Docker / 子进程 / VM
✅ 人工确认: 高危操作二次确认
   → 删除/支付/发送邮件`}</pre>
            </div>
          </div>

          <div className="info-card">
            <h3>⚡ 性能优化</h3>
            <span className="card-badge">Performance</span>
            <div className="code-block">
              <pre>{`Function Calling 性能优化：

1. 工具数量控制
   └ 超过 20 个工具 → 准确率下降
   └ 策略: 动态加载相关工具

2. Schema 精简
   └ description 要短而精准
   └ 避免冗余的 enum 值

3. 并行执行
   └ asyncio.gather 并行调工具
   └ 减少 Agent 循环轮次

4. 缓存策略
   └ 幂等工具缓存结果
   └ TTL 控制缓存时效

5. 流式输出
   └ 边执行工具边生成回答
   └ 提升用户感知速度`}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
