import { useState } from 'react';
import './LessonCommon.css';

const PATTERNS = [
  {
    key: 'research', name: 'Research Agent', icon: '🔬', color: '#8b5cf6',
    desc: '自主搜索、综合、分析多个来源，生成深度研究报告。',
    tools: ['Web Search（Tavily）', 'Academic Search（ArXiv）', 'Wikipedia', 'PDF Reader'],
    code: `# Research Agent：自动化深度研究
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub

tools = [
    TavilySearchResults(max_results=5, search_depth="advanced"),
    ArxivQueryRun(),          # 学术论文搜索
    WikipediaQueryRun(),      # 百科信息
    PDFReader(),              # 读取在线 PDF
]

# 专用 Research Prompt
RESEARCH_PROMPT = """你是一位专业的研究分析师。
任务：{input}

你必须：
1. 搜索至少3个不同来源
2. 交叉验证关键信息
3. 注明信息来源和时效性
4. 最后生成结构化报告：摘要/详细分析/结论/参考来源"""

agent = AgentExecutor(
    agent=create_react_agent(llm, tools, hub.pull("hwchase17/react")),
    tools=tools,
    max_iterations=15,
    verbose=True,
)

# 运行研究任务
result = agent.invoke({"input": "分析2025年AI Agent框架的发展现状，对比LangGraph/CrewAI/AutoGen的市场采用率"})`,
  },
  {
    key: 'code', name: 'Code Agent', icon: '💻', color: '#f59e0b',
    desc: '生成、执行、调试代码。在沙盒中运行并根据输出自动修复错误。',
    tools: ['Python REPL（沙盒）', 'E2B Sandbox', 'GitHub API', 'Bash Shell（受限）'],
    code: `# Code Agent：沙盒代码生成与执行
from e2b_code_interpreter import CodeInterpreter  # E2B 沙盒
from langchain.tools import StructuredTool

# 创建安全的代码执行工具
sandbox = CodeInterpreter.create()

def execute_python(code: str) -> str:
    """在 E2B 沙盒中安全执行 Python 代码"""
    execution = sandbox.notebook.exec_cell(code)
    
    if execution.error:
        return f"执行错误：{execution.error.name}: {execution.error.value}"
    
    output = "\n".join([str(r.text) for r in execution.results if r.text])
    if execution.logs.stdout:
        output += "\n标准输出：" + "\n".join(execution.logs.stdout)
    return output or "代码执行成功（无输出）"

code_execution_tool = StructuredTool.from_function(
    name="execute_python",
    description="在安全沙盒中执行Python代码。包含pandas/numpy/matplotlib等常用库。",
    func=execute_python,
)

# Code Agent 提示词
CODE_PROMPT = """你是一位精通 Python 的工程师。
要求：
1. 先分析需求，输出解决方案思路
2. 编写代码，使用 execute_python 工具运行
3. 如果出错，分析错误原因并修复
4. 最多尝试3次修复
5. 给出代码说明和使用示例

代码规范：类型注解 + 文档字符串 + 单元测试"""

result = agent.invoke({"input": "用 pandas 分析这个 CSV 文件中的销售数据，生成月度趋势图"})`,
  },
  {
    key: 'browser', name: 'Browser Agent', icon: '🌐', color: '#10b981',
    desc: '控制浏览器完成网页操作：填表、点击、数据提取，实现真正的 RPA。',
    tools: ['Playwright', 'Browser Use', 'Screenshot', 'DOM 操作'],
    code: `# Browser Agent：AI 驱动的网页操作
# pip install browser-use playwright

from browser_use import Agent as BrowserAgent
from langchain_openai import ChatOpenAI
import asyncio

async def browser_agent_example():
    agent = BrowserAgent(
        task="""
        1. 访问 https://github.com/trending
        2. 收集今日 Top 10 趋势仓库的名称、描述和 Star 数
        3. 筛选出 Python 相关仓库
        4. 整理为 JSON 格式返回
        """,
        llm=ChatOpenAI(model="gpt-4o"),  # 需要视觉能力的模型
    )
    
    result = await agent.run()
    return result

# ━━━━ 自定义 Playwright Agent ━━━━
from playwright.async_api import async_playwright
from langchain.tools import tool

@tool
async def click_element(selector: str) -> str:
    """点击页面元素"""
    await page.click(selector)
    return f"已点击 {selector}"

@tool
async def fill_form(selector: str, value: str) -> str:
    """填写表单字段"""
    await page.fill(selector, value)
    return f"已填写 {selector}={value}"

@tool
async def extract_text(selector: str) -> str:
    """提取页面文本"""
    element = await page.query_selector(selector)
    return await element.inner_text() if element else "元素不存在"

browser_tools = [click_element, fill_form, extract_text]

# ⚠️ Browser Agent 安全注意：
# 必须限制可访问域名白名单
# 禁止访问涉及登录/支付的敏感页面
# 记录所有操作日志审计`,
  },
  {
    key: 'data', name: 'Data Analysis Agent', icon: '📊', color: '#06b6d4',
    desc: '自然语言驱动数据分析：SQL 查询、可视化生成、洞察提炼。',
    tools: ['SQL Database', 'pandas', 'matplotlib/plotly', 'PandasAI'],
    code: `# Data Analysis Agent：自然语言数据分析
from langchain_community.agent_toolkits import create_sql_agent
from langchain_community.utilities import SQLDatabase
from pandasai import SmartDataframe  # 自然语言 DataFrame 操作

# ━━━━ SQL Agent ━━━━
db = SQLDatabase.from_uri("postgresql://user:pwd@localhost/analytics_db")

sql_agent = create_sql_agent(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    db=db,
    agent_type="openai-tools",
    verbose=True,
    max_iterations=5,
)

# 自然语言查询
result = sql_agent.invoke({
    "input": "按月统计2024年每个产品类别的销售额，找出增长最快的类别"
})
# Agent 自动生成：
# SELECT category, EXTRACT(MONTH FROM date), SUM(revenue)
# FROM orders WHERE YEAR(date)=2024
# GROUP BY category, EXTRACT(MONTH FROM date)
# ORDER BY growth_rate DESC

# ━━━━ PandasAI：更友好的 DataFrame 操作 ━━━━
import pandas as pd
from pandasai import SmartDataframe
from pandasai.llm import OpenAI

df = pd.read_csv("sales_data.csv")
smart_df = SmartDataframe(df, config={"llm": OpenAI(api_token="...")})

# 直接自然语言操作 DataFrame
response = smart_df.chat("按季度绘制销售额折线图，标注同比增长率")
# PandasAI 自动生成 pandas + matplotlib 代码并执行！

# ━━━━ 洞察提炼 Agent ━━━━
INSIGHT_PROMPT = """分析以下数据发现重要商业洞察：
1. 找出关键趋势（增长/下降/异常）
2. 识别潜在问题（下滑/异常值）
3. 提出具体的行动建议（可执行，非泛泛而谈）
4. 量化影响（如"Q3 收入下滑 15%，若不干预，Q4 损失约 200万"）"""`,
  },
];

export default function LessonPatterns() {
  const [pat, setPat] = useState('research');
  const p = PATTERNS.find(x => x.key === pat) ?? {};

  return (
    <div className="ag-lesson">
      <div className="ag-hero">
        <div className="ag-badge">// MODULE 07 · AGENT PATTERNS</div>
        <h1>六大 Agent 设计模式</h1>
        <p>不同业务场景需要不同的 Agent 设计。<strong>Research/Code/Browser/Data Analysis</strong> 是覆盖 80% 企业需求的四种核心 Agent 模式，每种都有完整的工具栈和提示词设计。</p>
      </div>

      <div className="ag-section">
        <div className="ag-section-title">🎯 四种核心 Agent 模式</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {PATTERNS.map(p => (
            <button key={p.key} className={`ag-btn ${pat === p.key ? 'active' : ''}`}
              style={{ borderColor: pat === p.key ? p.color : undefined, color: pat === p.key ? p.color : undefined }}
              onClick={() => setPat(p.key)}>
              {p.icon} {p.name}
            </button>
          ))}
        </div>
        <div className="ag-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="ag-card" style={{ borderTop: `3px solid ${p.color}` }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: p.color, marginBottom: '0.5rem' }}>{p.icon} {p.name}</div>
            <div style={{ color: 'var(--ag-muted)', fontSize: '0.87rem', lineHeight: 1.75, marginBottom: '0.75rem' }}>{p.desc}</div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--ag-lavender)', marginBottom: '0.5rem' }}>工具栈：</div>
            {p.tools?.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.83rem', color: 'var(--ag-muted)' }}>
                <span style={{ color: p.color, flexShrink: 0 }}>→</span> {t}
              </div>
            ))}
          </div>
          <div className="ag-card">
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ag-lavender)', marginBottom: '0.75rem' }}>企业应用场景</div>
            {pat === 'research' && ['竞品分析自动化', '行业趋势报告', '投资标的尽调', '专利检索与分析'].map((s,i) => <div key={i} style={{fontSize:'0.84rem',color:'var(--ag-muted)',marginBottom:'0.35rem'}}>→ {s}</div>)}
            {pat === 'code' && ['自动化测试生成', '遗留代码重构', '数据处理脚本', '算法实现和优化'].map((s,i) => <div key={i} style={{fontSize:'0.84rem',color:'var(--ag-muted)',marginBottom:'0.35rem'}}>→ {s}</div>)}
            {pat === 'browser' && ['竞价数据爬取', '价格监控', '表单自动填写', '网页数据同步'].map((s,i) => <div key={i} style={{fontSize:'0.84rem',color:'var(--ag-muted)',marginBottom:'0.35rem'}}>→ {s}</div>)}
            {pat === 'data' && ['自助式数据分析', '自动报表生成', '异常检测告警', 'BI 自然语言查询'].map((s,i) => <div key={i} style={{fontSize:'0.84rem',color:'var(--ag-muted)',marginBottom:'0.35rem'}}>→ {s}</div>)}
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
    </div>
  );
}
