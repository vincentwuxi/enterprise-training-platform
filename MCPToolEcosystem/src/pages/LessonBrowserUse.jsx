import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Browser Use', 'Playwright AI', 'Web Agent 架构', '生产实战'];

export default function LessonBrowserUse() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-container">
      <div className="lesson-badge">🔌 module_04 — AI 浏览器自动化</div>
      <h1 className="lesson-title">AI 浏览器自动化：让 AI 驾驭浏览器</h1>
      <p className="lesson-subtitle">
        浏览器是信息世界的入口。<strong>Browser Use</strong> 让 LLM 像人一样操作浏览器——
        点击按钮、填写表单、提取数据、导航页面。本模块覆盖
        Browser Use 框架、Playwright AI 自动化、Web Agent 架构设计，
        以及电商比价、数据采集等真实生产案例。
      </p>

      <section className="lesson-section">
        <h2 className="section-title">🌐 浏览器 AI 技术栈</h2>
        <div className="lesson-tabs">
          {tabs.map((t, i) => (
            <button key={i} className={`tab-btn ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🖥️ Browser Use 框架</h3>
              <span className="card-badge">browser-use</span>
              <p>开源的 AI 浏览器自动化框架，让 LLM 通过视觉或 DOM 理解网页并执行操作。</p>
              <div className="code-block">
                <div className="code-header">🐍 browser_use_demo.py</div>
                <pre>{`# —— Browser Use: 让 AI 自主操控浏览器 ——
from browser_use import Agent
from langchain_openai import ChatOpenAI

# 初始化 AI 浏览器 Agent
agent = Agent(
    task="""
    1. 打开 Amazon.com
    2. 搜索 "mechanical keyboard"
    3. 筛选价格 $50-$100
    4. 找到评分最高的 3 个产品
    5. 提取名称、价格、评分
    6. 按评分排序返回结果
    """,
    llm=ChatOpenAI(model="gpt-4o"),
    max_actions_per_step=5
)

# 运行 Agent (自动打开浏览器)
result = await agent.run()
print(result)

# Agent 自主完成:
# 1. 导航到 Amazon → 2. 输入搜索词 → 3. 点击筛选
# 4. 遍历商品卡片 → 5. 提取信息 → 6. 格式化输出`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🧠 Browser Use 工作原理</h3>
              <span className="card-badge">原理</span>
              <div className="code-block">
                <div className="code-header">📋 执行流程</div>
                <pre>{`Browser Use 执行循环：

Loop:
│
├─ 1. 观察 (Observe)
│  ├─ 截图当前页面 → Vision
│  ├─ 提取 DOM 树 → 可交互元素
│  └─ 合并为页面状态描述
│
├─ 2. 思考 (Think)
│  ├─ LLM 分析当前状态
│  ├─ 对比目标任务
│  └─ 决定下一步动作
│
├─ 3. 行动 (Act)
│  ├─ click(selector)
│  ├─ type(selector, text)
│  ├─ scroll(direction)
│  ├─ navigate(url)
│  └─ extract(selectors)
│
├─ 4. 检查 (Check)
│  ├─ 任务完成? → 退出
│  └─ 继续? → 回到 1
│
└─ 最大步数限制 → 超时退出`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>⚙️ 高级配置</h3>
              <span className="card-badge">Config</span>
              <div className="code-block">
                <div className="code-header">🐍 advanced_config.py</div>
                <pre>{`from browser_use import Agent, BrowserConfig

# 浏览器配置
config = BrowserConfig(
    headless=True,        # 无头模式
    disable_security=False,
    extra_chromium_args=[
        "--no-sandbox",
        "--disable-gpu"
    ],
    proxy={
        "server": "http://proxy:8080"
    }
)

agent = Agent(
    task="...",
    llm=ChatOpenAI(model="gpt-4o"),
    browser_config=config,
    # 注入 Cookie（登录态）
    injected_cookies=[{
        "name": "session",
        "value": "abc123",
        "domain": ".example.com"
    }],
    # 自定义系统 Prompt
    system_prompt_class=MyPrompt,
    # 最大操作步数
    max_actions_per_step=3,
    max_steps=50
)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎭 Playwright + AI 混合自动化</h3>
              <span className="card-badge">Playwright</span>
              <div className="code-block">
                <div className="code-header">🐍 playwright_ai.py</div>
                <pre>{`# —— Playwright + LLM: 结构化脚本 + AI 智能填补 ——
from playwright.async_api import async_playwright
from openai import OpenAI

client = OpenAI()

async def ai_form_filler(page, form_data: dict):
    """AI 智能表单填写：自动识别字段并填写"""
    
    # 1. 提取页面所有表单元素
    fields = await page.evaluate("""() => {
        const inputs = document.querySelectorAll('input, select, textarea');
        return Array.from(inputs).map(el => ({
            type: el.type,
            name: el.name || el.id,
            label: el.labels?.[0]?.textContent || el.placeholder || '',
            selector: el.id ? '#' + el.id : '[name="' + el.name + '"]'
        }));
    }""")
    
    # 2. 让 AI 匹配数据到字段
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": f"""匹配数据到表单字段:
            
表单字段: {json.dumps(fields, ensure_ascii=False)}
数据: {json.dumps(form_data, ensure_ascii=False)}

返回 JSON: [{{"selector": "...", "value": "...", "action": "fill|select|check"}}]"""
        }],
        response_format={"type": "json_object"}
    )
    
    mappings = json.loads(response.choices[0].message.content)
    
    # 3. 执行填写
    for m in mappings["fields"]:
        match m["action"]:
            case "fill":
                await page.fill(m["selector"], m["value"])
            case "select":
                await page.select_option(m["selector"], m["value"])
            case "check":
                await page.check(m["selector"])

# 使用示例
async with async_playwright() as p:
    browser = await p.chromium.launch()
    page = await browser.new_page()
    await page.goto("https://example.com/signup")
    
    await ai_form_filler(page, {
        "姓名": "张三",
        "邮箱": "zhang@example.com",
        "公司": "ABC 科技有限公司",
        "职位": "工程经理"
    })`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ Web Agent 架构设计</h3>
              <span className="card-badge">Architecture</span>
              <div className="code-block">
                <div className="code-header">📋 三层架构</div>
                <pre>{`Web Agent 三层架构：

┌──────────────────────────────────────┐
│          🧠 决策层 (LLM)              │
│  ├── 任务规划 (Task Decomposition)    │
│  ├── 状态推理 (State Reasoning)       │
│  ├── 错误恢复 (Error Recovery)        │
│  └── 目标检测 (Goal Detection)        │
├──────────────────────────────────────┤
│         🔧 中间件层 (Middleware)       │
│  ├── 页面状态提取 (DOM → 结构化)      │
│  ├── 动作映射 (Action Mapping)        │
│  ├── 历史记忆 (Action History)        │
│  ├── 安全过滤 (Action Filter)         │
│  └── 重试逻辑 (Retry & Fallback)     │
├──────────────────────────────────────┤
│          🌐 浏览器层 (Browser)         │
│  ├── Playwright / Puppeteer           │
│  ├── 截图 / DOM 提取                  │
│  ├── 事件执行                         │
│  └── 网络拦截 / Cookie 管理           │
└──────────────────────────────────────┘`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🔄 错误恢复策略</h3>
              <span className="card-badge">Resilience</span>
              <div className="code-block">
                <div className="code-header">📋 恢复模式</div>
                <pre>{`Web Agent 错误恢复：

1. 元素未找到
   → 等待 + 重试
   → AI 推理替代 selector
   → 截图让 Vision 重新定位

2. 页面跳转异常
   → 检测 URL 变化
   → 自动后退 + 重试
   → 任务分解重新规划

3. CAPTCHA / 验证码
   → 暂停 → 人工介入
   → 或接入验证码服务

4. 登录态失效
   → 检测 401/403
   → 自动重新登录
   → Cookie 刷新

5. 网络超时
   → 指数退避重试
   → 降级到缓存数据`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>📊 观察策略</h3>
              <span className="card-badge">Observation</span>
              <div className="code-block">
                <div className="code-header">📋 DOM vs Vision</div>
                <pre>{`页面观察策略对比：

📝 DOM 模式：
├── 提取可交互元素列表
├── 文本量 → Token 成本
├── 精确定位（selector）
├── 无法理解视觉布局
└── 适合: 结构化页面

📸 Vision 模式：
├── 截图 → GPT-4V 分析
├── 理解视觉布局和颜色
├── 可处理 Canvas/SVG
├── Token 成本较高
└── 适合: 复杂/动态页面

🔀 混合模式（推荐）：
├── DOM 提取 + 截图辅助
├── 先用 DOM 定位
├── 失败时回退到 Vision
└── 兼顾精度和成本`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="card-grid">
            <div className="info-card">
              <h3>🛒 电商比价 Agent</h3>
              <span className="card-badge">案例</span>
              <div className="code-block">
                <div className="code-header">🐍 price_comparison.py</div>
                <pre>{`agent = Agent(
    task="""
    在以下网站搜索 "AirPods Pro 2":
    1. Amazon.com
    2. BestBuy.com
    3. Walmart.com
    
    提取每个网站的:
    - 产品名称
    - 价格
    - 配送时间
    - 用户评分
    
    以表格格式返回比较结果,
    标注最低价格。
    """,
    llm=ChatOpenAI(model="gpt-4o")
)

result = await agent.run()
# 输出结构化比价表格`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>📊 竞品监控</h3>
              <span className="card-badge">案例</span>
              <div className="code-block">
                <div className="code-header">🐍 competitor_monitor.py</div>
                <pre>{`# 定时任务: 每天监控竞品定价
import schedule

async def monitor_competitors():
    agent = Agent(
        task="""
        1. 打开竞品 A 的定价页
        2. 提取所有套餐和价格
        3. 打开竞品 B 的定价页
        4. 提取所有套餐和价格
        5. 与我们的定价对比
        6. 标注显著差异 (>10%)
        """,
        llm=ChatOpenAI(model="gpt-4o")
    )
    result = await agent.run()
    
    # 差异超过阈值 → 发送告警
    if has_significant_changes(result):
        await send_slack_alert(result)
    
    # 保存历史记录
    save_to_database(result)

schedule.every().day.at("09:00").do(
    lambda: asyncio.run(monitor_competitors())
)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
