import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Agent 架构', 'Code Interpreter', 'SQL Agent', '生产部署'];

export default function LessonDataAgent() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🤖 module_06 — LLM 数据 Agent</div>
      <div className="fs-hero">
        <h1>LLM 数据 Agent：代码解释器 / SQL Agent / 多轮分析 / 生产部署</h1>
        <p>
          传统 BI 需要人工写 SQL、拖拽图表、手动解读数据。
          <strong>LLM 数据 Agent</strong> 让分析师用自然语言驱动整个流程：
          自动生成代码、查询数据库、创建可视化、输出业务洞察。
          本模块从架构设计到生产部署，构建企业级数据分析 Agent。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🤖 数据 Agent</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 数据 Agent 设计模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> agent_architecture</div>
                <pre className="fs-code">{`# 数据分析 Agent: 四种核心架构模式

# ═══ 1. Code Interpreter (代码解释器) ═══
# LLM → 生成 Python/R 代码 → 沙箱执行 → 返回结果
# 产品: ChatGPT Code Interpreter / Claude Artifacts
code_interpreter = {
    "输入":   "自然语言分析需求",
    "LLM":    "理解需求 → 生成 pandas/plotly 代码",
    "执行":   "Docker 沙箱 + 资源限制",
    "输出":   "数据表 + 可视化 + 文字洞察",
    "优势":   "灵活度最高, 可做任何 Python 能做的事",
    "劣势":   "安全风险高, 需要严格沙箱",
}

# ═══ 2. SQL Agent (Text-to-SQL) ═══
# LLM → 生成 SQL → 查询数据库 → 返回结果
# 产品: Vanna.ai / ChatBI / Databricks AI/BI
sql_agent = {
    "输入":   "自然语言问题",
    "Schema": "表结构 + 字段说明 (元数据)",
    "LLM":    "Text-to-SQL 生成查询",
    "执行":   "只读连接 + EXPLAIN 前置",
    "输出":   "查询结果 + 自动可视化",
    "优势":   "安全(只读), 直连企业数据仓库",
    "劣势":   "受限于 SQL 表达能力",
}

# ═══ 3. Multi-Tool Agent (多工具编排) ═══
# LLM → 选择合适的工具 → 执行 → 循环
# 产品: Julius AI / Hex AI / Jupyter AI
multi_tool = {
    "工具集": [
        "Python 执行器 (pandas/sklearn)",
        "SQL 查询器 (数据库)",
        "图表生成器 (Plotly/ECharts)",
        "文件读取器 (CSV/Excel/PDF)",
        "统计计算器 (scipy)",
        "网络搜索器 (外部数据)",
    ],
    "路由":   "LLM 根据需求选择工具组合",
    "优势":   "能力最全面",
    "复杂度": "高 (工具协调 + 错误处理)",
}

# ═══ 4. Multi-Agent (多 Agent 协作) ═══
# 多个专业 Agent 分工协作
# 框架: AutoGen / CrewAI / LangGraph
multi_agent = {
    "分析师 Agent": "理解需求 → 制定分析计划",
    "工程师 Agent": "编写 SQL/Python 代码",
    "审核员 Agent": "验证结果合理性 + 安全检查",
    "报告员 Agent": "生成高管可读的报告",
    "流程": """
    分析师: "需要按地区+月度分析销售趋势"
      → 工程师: 编写 SQL 查询 + Python 处理
      → 审核员: 检查 SQL 注入 + 数据合理性
      → 报告员: 生成 PPT 级别的洞察报告
    """,
}

# ═══ Agent 工作流: ReAct 循环 ═══
# 用户: "分析上季度各地区销售趋势, 找出增长最快的产品"
#
# Agent ReAct 循环:
# ┌─────────────────────────────────────────────┐
# │ Thought: 需要销售数据, 按地区和时间维度分析 │
# │ Action:  SQL查询 → 获取上季度销售明细       │
# │ Observation: 返回 15,000 行数据             │
# │                                             │
# │ Thought: 数据量大, 用 pandas 聚合分析        │
# │ Action:  Python → groupby + 计算环比增长    │
# │ Observation: 华东增长 23%, 华南增长 18%      │
# │                                             │
# │ Thought: 需要按产品细分找增长最快的          │
# │ Action:  Python → 产品增速排名 + 可视化     │
# │ Observation: 产品 A 增长 47%, 产品 B 31%    │
# │                                             │
# │ Final: 生成报告 (趋势图 + 排名 + 建议)      │
# └─────────────────────────────────────────────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 架构选型决策</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> selection_guide</div>
                <pre className="fs-code">{`# 数据 Agent 架构选型指南

# ┌──────────────┬─────────┬─────────┬─────────┐
# │ 维度          │ Code    │ SQL     │ Multi   │
# │              │ Interp  │ Agent   │ Agent   │
# ├──────────────┼─────────┼─────────┼─────────┤
# │ 灵活度        │ ★★★★★  │ ★★★    │ ★★★★   │
# │ 安全性        │ ★★     │ ★★★★★  │ ★★★    │
# │ 实施复杂度    │ ★★★    │ ★★     │ ★★★★★  │
# │ 企业数据仓库  │ ★★★    │ ★★★★★  │ ★★★★   │
# │ 探索性分析    │ ★★★★★  │ ★★★    │ ★★★★   │
# │ 非技术用户    │ ★★★★   │ ★★★★★  │ ★★★    │
# │ 生产可靠性    │ ★★★    │ ★★★★   │ ★★     │
# └──────────────┴─────────┴─────────┴─────────┘

# 选型建议:
# ┌────────────────────────────┬──────────────┐
# │ 场景                       │ 推荐架构      │
# ├────────────────────────────┼──────────────┤
# │ 业务人员自助查询            │ SQL Agent    │
# │ 数据科学家探索分析          │ Code Interp  │
# │ 自动化报表生成              │ Multi-Tool   │
# │ 复杂分析 Pipeline          │ Multi-Agent  │
# │ 内部 BI 平台嵌入           │ SQL Agent    │
# │ 客户面向的分析服务          │ Code Interp  │
# └────────────────────────────┴──────────────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🛠️ 产品生态</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> product_landscape</div>
                <pre className="fs-code">{`# 数据分析 Agent 产品生态 (2025)

# ═══ 商业产品 ═══
commercial = {
    "Julius AI": {
        "类型": "SaaS",
        "特点": "最佳用户体验, 多数据源",
        "数据源": "CSV/Excel/SQL/Google Sheets",
        "价格": "免费起 / $20+/月",
    },
    "ChatGPT Code Interpreter": {
        "类型": "OpenAI 内置",
        "特点": "GPT 生态, 文件上传分析",
        "限制": "无法连接外部数据库",
    },
    "Hex AI": {
        "类型": "协作 Notebook",
        "特点": "团队协作 + AI 辅助",
        "适合": "数据团队",
    },
    "Databricks AI/BI": {
        "类型": "企业级",
        "特点": "Lakehouse + AI 查询",
        "适合": "大规模数据平台",
    },
}

# ═══ 开源框架 ═══
opensource = {
    "PandasAI":     "最简单, df.chat('...')",
    "Vanna.ai":     "Text-to-SQL, RAG增强",
    "LangChain":    "最灵活的 Agent 框架",
    "LlamaIndex":   "RAG + 数据查询",
    "CrewAI":       "多 Agent 协作",
    "AutoGen":      "微软, 对话式 Agent",
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔥 Code Interpreter Agent 实现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> code_interpreter_agent.py</div>
                <pre className="fs-code">{`# 企业级 Code Interpreter Agent 实现

from openai import OpenAI
import subprocess, tempfile, json, os

class DataAnalysisAgent:
    """LLM 驱动的数据分析 Agent (生产级)"""
    
    def __init__(self, model="gpt-4o"):
        self.client = OpenAI()
        self.model = model
        self.conversation = []
        self.execution_history = []  # 代码执行历史
        self.data_context = {}       # 已加载的数据集元信息
    
    SYSTEM_PROMPT = """你是一个高级数据分析师 Agent。

你可以:
1. 编写 Python 代码分析数据 (pandas, plotly, scipy, sklearn)
2. 创建可视化图表 (plotly/matplotlib)
3. 执行统计检验和机器学习建模
4. 给出业务洞察和行动建议

规则:
- 所有代码必须可直接执行, 不要省略 import
- 图表用 plotly, 保存为 HTML/PNG
- 处理缺失值: 先检查 df.isnull().sum()
- 大表先 df.shape + df.head() 探索
- 结果要有业务解读, 不只是数字
- 如果数据不足以得出结论, 明确说明
- 数值结果保留合适的小数位
"""
    
    TOOLS = [{
        "type": "function",
        "function": {
            "name": "execute_python",
            "description": "在沙箱中执行 Python 数据分析代码",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "完整可执行的 Python 代码"
                    },
                    "purpose": {
                        "type": "string",
                        "description": "代码执行目的的简短描述"
                    }
                },
                "required": ["code", "purpose"]
            }
        }
    }]
    
    def analyze(self, question: str, max_iterations: int = 5):
        """多轮分析: 生成代码 → 执行 → 解读 → 迭代"""
        self.conversation.append({
            "role": "user", "content": question
        })
        
        for iteration in range(max_iterations):
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    *self.conversation
                ],
                tools=self.TOOLS,
                tool_choice="auto",
            )
            
            msg = response.choices[0].message
            
            # 无工具调用 → 最终回答
            if not msg.tool_calls:
                self.conversation.append(msg)
                return {
                    "answer": msg.content,
                    "iterations": iteration,
                    "code_executed": len(self.execution_history),
                }
            
            # 处理工具调用
            self.conversation.append(msg)
            for tool_call in msg.tool_calls:
                args = json.loads(tool_call.function.arguments)
                code = args["code"]
                purpose = args.get("purpose", "")
                
                # 安全检查
                if self._is_dangerous(code):
                    result = "⚠️ 代码包含危险操作, 已拒绝执行"
                else:
                    result = self._execute_sandbox(code)
                
                self.execution_history.append({
                    "code": code, "purpose": purpose,
                    "result": result[:2000],  # 截断
                })
                
                self.conversation.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result[:2000],
                })
        
        return {"answer": "达到最大迭代次数", "iterations": max_iterations}
    
    def _execute_sandbox(self, code: str) -> str:
        """Docker 沙箱执行 (生产应使用容器隔离)"""
        with tempfile.NamedTemporaryFile(
            suffix=".py", mode="w", delete=False, dir="/tmp"
        ) as f:
            # 注入安全前缀
            safe_code = """
import warnings; warnings.filterwarnings('ignore')
import pandas as pd, numpy as np
import plotly.express as px, plotly.graph_objects as go
""" + code
            f.write(safe_code)
            f.flush()
            try:
                result = subprocess.run(
                    ["python", f.name],
                    capture_output=True, text=True,
                    timeout=30,
                    env={**os.environ, "MPLBACKEND": "Agg"},
                )
                output = result.stdout or result.stderr
                return output if output else "(代码执行成功, 无输出)"
            except subprocess.TimeoutExpired:
                return "⚠️ 执行超时 (30秒限制)"
            finally:
                os.unlink(f.name)
    
    def _is_dangerous(self, code: str) -> bool:
        """基础安全检查"""
        dangerous = [
            "os.system", "subprocess", "shutil.rmtree",
            "exec(", "eval(", "__import__",
            "open(", "requests.", "urllib",
        ]
        return any(d in code for d in dangerous)

# ═══ 使用示例 ═══
agent = DataAnalysisAgent()
result = agent.analyze(
    "加载 sales.csv, 分析各月销售趋势并预测下个月"
)
print(result["answer"])

# 多轮对话
result = agent.analyze("在上面的基础上, 按地区拆分来看")
result = agent.analyze("导出增长最快的 Top 5 产品清单")`}</pre>
              </div>
            </div>

            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 PandasAI 快速集成</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> pandasai_integration.py</div>
                <pre className="fs-code">{`# PandasAI: 最简单的数据分析 Agent 集成

from pandasai import SmartDataframe, SmartDatalake
import pandas as pd

# ═══ 单表分析 ═══
df = pd.read_csv("sales.csv")
sdf = SmartDataframe(df, config={
    "llm": "gpt-4o",
    "save_charts": True,           # 自动保存图表
    "save_charts_path": "./charts",
    "verbose": True,               # 显示生成的代码
    "enable_cache": True,          # 缓存相同查询
    "max_retries": 3,              # 代码执行失败重试
    "custom_whitelisted_dependencies": ["plotly", "scipy"],
})

# 自然语言分析 (底层自动生成 pandas 代码)
answer = sdf.chat("哪个地区的销售额最高? 画一个柱状图")
answer = sdf.chat("计算每个产品类别的同比增长率")
answer = sdf.chat("找出 VIP 客户 (消费 top 10%) 的特征画像")
answer = sdf.chat("用 KMeans 将客户分成 4 个群体, 可视化")

# ═══ 多表联合分析 (SmartDatalake) ═══
orders = SmartDataframe(pd.read_csv("orders.csv"))
products = SmartDataframe(pd.read_csv("products.csv"))
customers = SmartDataframe(pd.read_csv("customers.csv"))

lake = SmartDatalake([orders, products, customers])
answer = lake.chat(
    "哪些客户购买了最多种类的产品? "
    "这些客户的平均客单价是多少?"
)

# ═══ LangChain Pandas Agent ═══
from langchain_experimental.agents import (
    create_pandas_dataframe_agent
)
from langchain_openai import ChatOpenAI

agent = create_pandas_dataframe_agent(
    ChatOpenAI(model="gpt-4o", temperature=0),
    df,
    verbose=True,
    agent_type="openai-tools",
    allow_dangerous_code=True,
    max_iterations=10,
)

result = agent.invoke(
    "分析销售额和客单价的关系, "
    "用散点图显示并计算 Pearson 相关系数, "
    "如果显著则做线性回归"
)

# ═══ Jupyter 集成 ═══
# pip install jupyter-ai
# 在 Jupyter 中直接使用:
# %%ai chatgpt
# 分析这个 DataFrame 的分布特征
# 并检查是否有多重共线性问题`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗃️ SQL Agent: Text-to-SQL 实现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> sql_agent.py</div>
                <pre className="fs-code">{`# SQL Agent: 自然语言 → SQL 查询 → 业务洞察

# ═══ 核心挑战 ═══
# 1. Schema 理解: LLM 需要知道表结构和字段含义
# 2. SQL 正确性: 生成的 SQL 必须语法正确
# 3. 性能安全: 防止全表扫描/笛卡尔积
# 4. 结果解读: 将数字转化为业务洞察

# ═══ Vanna.ai: 最佳开源 Text-to-SQL ═══
import vanna
from vanna.openai import OpenAI_Chat
from vanna.chromadb import ChromaDB_VectorStore

class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        OpenAI_Chat.__init__(self, config=config)

vn = MyVanna(config={
    "model": "gpt-4o",
    "api_key": os.environ["OPENAI_API_KEY"],
})

# ═══ Step 1: Schema 训练 (一次性) ═══
# 方法 A: 直接连接数据库提取 DDL
vn.connect_to_postgres(
    host="localhost", dbname="analytics",
    user="readonly", password="***", port=5432
)

# 方法 B: 手动添加训练数据
vn.train(ddl="""
    CREATE TABLE orders (
        order_id INT PRIMARY KEY,
        customer_id INT,
        product_id INT,
        amount DECIMAL(10,2),  -- 订单金额 (元)
        quantity INT,
        order_date DATE,
        region VARCHAR(50),    -- 销售地区
        channel VARCHAR(20)    -- 渠道: online/offline
    );
""")

# 添加业务文档 (增强理解)
vn.train(documentation="""
    - 'amount' 字段是人民币, 包含折扣后的实际支付金额
    - 'region' 包含: 华东/华南/华北/华西/东北
    - Q1=1-3月, Q2=4-6月, Q3=7-9月, Q4=10-12月
    - VIP 客户定义: 年消费 > 10万
    - 客单价 = SUM(amount) / COUNT(DISTINCT order_id)
""")

# 添加示例 SQL (Few-shot 学习)
vn.train(
    question="上个月每个地区的销售额是多少?",
    sql="""
        SELECT region, SUM(amount) as total_sales
        FROM orders
        WHERE order_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND order_date < DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY region
        ORDER BY total_sales DESC;
    """
)

# ═══ Step 2: 自然语言查询 ═══
sql = vn.generate_sql("今年 Q2 各地区销售额同比变化?")
# 生成:
# SELECT region,
#   SUM(CASE WHEN EXTRACT(YEAR FROM order_date)=2025 THEN amount END) as this_year,
#   SUM(CASE WHEN EXTRACT(YEAR FROM order_date)=2024 THEN amount END) as last_year,
#   ROUND((this_year - last_year) / last_year * 100, 2) as yoy_pct
# FROM orders
# WHERE EXTRACT(QUARTER FROM order_date) = 2
# GROUP BY region ORDER BY yoy_pct DESC;

result = vn.run_sql(sql)          # 执行查询
chart = vn.generate_plotly_code(  # 自动可视化
    question="今年 Q2 各地区销售额同比变化?",
    sql=sql, df=result
)

# ═══ Step 3: 启动 Web 界面 ═══
from vanna.flask import VannaFlaskApp
app = VannaFlaskApp(vn)
app.run()  # http://localhost:8084`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔒 SQL Agent 安全机制</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> sql_safety</div>
                <pre className="fs-code">{`# SQL Agent 安全防线 (六层防护)

# Layer 1: 只读连接
# CREATE USER analytics_agent
# WITH PASSWORD '***'
# READONLY;
# GRANT SELECT ON schema public TO analytics_agent;

# Layer 2: SQL 预检
def validate_sql(sql: str) -> tuple:
    """SQL 安全校验"""
    sql_upper = sql.upper().strip()
    
    # 禁止写操作
    forbidden = ["INSERT", "UPDATE", "DELETE",
                 "DROP", "ALTER", "TRUNCATE",
                 "CREATE", "GRANT", "REVOKE"]
    for f in forbidden:
        if f in sql_upper:
            return False, f"禁止 {f} 操作"
    
    # 禁止危险模式
    if ";" in sql and sql_upper.count("SELECT") > 1:
        return False, "禁止多语句执行"
    
    return True, "通过"

# Layer 3: EXPLAIN 前置 (防止慢查询)
def check_query_cost(cursor, sql: str):
    cursor.execute(f"EXPLAIN (FORMAT JSON) {sql}")
    plan = cursor.fetchone()[0][0]
    estimated_rows = plan["Plan"]["Plan Rows"]
    if estimated_rows > 1_000_000:
        raise Exception(
            f"查询预估扫描 {estimated_rows} 行, "
            f"超过 100 万行限制"
        )

# Layer 4: 超时控制
# SET statement_timeout = '30s';

# Layer 5: 行级安全 (RLS)
# ALTER TABLE orders ENABLE RLS;
# CREATE POLICY agent_policy ON orders
#   FOR SELECT USING (region IN (...));

# Layer 6: 结果脱敏
def mask_pii(df):
    """脱敏个人信息"""
    for col in df.columns:
        if "phone" in col or "mobile" in col:
            df[col] = df[col].apply(
                lambda x: x[:3]+"****"+x[-4:] if x else x
            )
        if "email" in col:
            df[col] = df[col].apply(
                lambda x: x.split("@")[0][:2]+"***@"+x.split("@")[1]
            )
    return df`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📈 Text-to-SQL 精度优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> accuracy_tips</div>
                <pre className="fs-code">{`# Text-to-SQL 精度从 60% 提升到 90%+

# ═══ 精度瓶颈分析 ═══
# 1. Schema 理解错误 (40%): 选错表/列
# 2. SQL 逻辑错误 (30%): JOIN/聚合写错
# 3. 业务理解偏差 (20%): "增长"是环比还是同比?
# 4. 语法错误 (10%): 方言差异

# ═══ 优化策略 ═══

# 策略 1: 丰富 Schema 注释
# 不是 "amount DECIMAL" → 而是
# "amount DECIMAL -- 订单金额(元), 含折扣, 不含运费"

# 策略 2: Few-shot 示例 (最有效!)
# 添加 20-50 个高质量 Q→SQL 对
# 覆盖: 聚合/JOIN/子查询/窗口函数

# 策略 3: RAG 检索相似查询
# 用户新问题 → Embedding → 
# 检索最相似的历史 Q→SQL →
# 作为 Few-shot 注入 Prompt

# 策略 4: Self-Correction 自修复
# SQL 执行报错 → 将错误信息反馈给 LLM
# → 生成修正后的 SQL → 重试

# 策略 5: 业务术语词典
glossary = {
    "客单价": "SUM(amount)/COUNT(DISTINCT order_id)",
    "复购率": "有2+订单客户 / 总客户数",
    "GMV":    "SUM(amount * quantity)",
    "转化率": "下单用户 / 访问用户",
}

# ═══ 评估指标 ═══
# Execution Accuracy: SQL 执行结果是否正确
# Exact Match:        SQL 文本是否完全匹配
# (推荐用 Execution Accuracy, 同一个问题可以有多种正确SQL)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 数据 Agent 生产部署架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> production_architecture</div>
                <pre className="fs-code">{`# 企业级数据 Agent 部署架构

# ┌─────────────────────────────────────────────────────┐
# │                 Frontend (React/Vue)                │
# │  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐  │
# │  │ 对话界面  │ │ 图表展示  │ │ 数据表格/导出       │  │
# │  └────┬─────┘ └────┬─────┘ └──────────┬──────────┘  │
# └───────┼────────────┼──────────────────┼─────────────┘
#         │            │                  │
#         ▼            ▼                  ▼
# ┌─────────────────────────────────────────────────────┐
# │              API Gateway (FastAPI/Flask)             │
# │  ┌──────────┐ ┌──────────┐ ┌───────────────────┐    │
# │  │ 认证鉴权  │ │ 限流     │ │ 请求路由           │    │
# │  └──────────┘ └──────────┘ └───────────────────┘    │
# └───────────────────┬─────────────────────────────────┘
#                     │
#         ┌───────────┼───────────┐
#         ▼           ▼           ▼
# ┌──────────┐ ┌──────────┐ ┌──────────┐
# │ SQL Agent│ │ Code     │ │ RAG      │
# │          │ │ Executor │ │ Retriever│
# │ (只读DB) │ │ (Docker) │ │ (向量库) │
# └──────────┘ └──────────┘ └──────────┘
#       │           │             │
#       ▼           ▼             ▼
# ┌──────────┐ ┌──────────┐ ┌──────────┐
# │ 数据仓库  │ │ 沙箱环境  │ │ 知识库   │
# │(Snowflake│ │(K8s Pod) │ │(Pinecone)│
# │ BigQuery)│ │ 30s超时  │ │          │
# └──────────┘ └──────────┘ └──────────┘

# ═══ 关键组件配置 ═══

# 1. 代码沙箱 (Docker + gVisor)
sandbox_config = {
    "runtime":    "gvisor",          # 安全容器运行时
    "cpu":        "1 core",          # 资源限制
    "memory":     "512MB",
    "timeout":    "30s",
    "network":    "none",            # 禁止网络访问
    "filesystem": "read-only",       # 只读文件系统
    "packages":   [                  # 允许的 Python 包
        "pandas", "numpy", "scipy",
        "plotly", "matplotlib", "seaborn",
        "sklearn", "statsmodels",
    ],
}

# 2. 缓存策略
cache_config = {
    "query_cache":   "Redis, TTL=1h",   # SQL结果缓存
    "llm_cache":     "语义相似查询复用",  # 节省 API 成本
    "chart_cache":   "CDN, TTL=24h",    # 图表缓存
}

# 3. 监控指标
monitoring = {
    "SQL 执行成功率":     "目标 > 95%",
    "平均响应时间":       "目标 < 10s",
    "LLM Token 用量":    "日/周/月统计",
    "用户满意度":         "👍/👎 反馈率",
    "危险查询拦截率":     "审计日志",
}`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔐 安全治理框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> security_governance</div>
                <pre className="fs-code">{`# 数据 Agent 安全治理 (五层防线)

# ┌──────────────┬─────────────────────┐
# │ 风险          │ 防护措施             │
# ├──────────────┼─────────────────────┤
# │ 数据泄露      │ PII 检测 + 动态脱敏 │
# │ 权限越界      │ RBAC + 行级安全     │
# │ SQL 注入      │ 参数化 + 预检       │
# │ 代码注入      │ Docker 沙箱 + 白名单│
# │ 幻觉输出      │ 结果验证 + 溯源     │
# │ 计算爆炸      │ EXPLAIN + 资源限制  │
# │ 提示词注入    │ 输入净化 + 角色隔离 │
# │ 不当内容      │ 输出过滤 + 审计     │
# └──────────────┴─────────────────────┘

# ═══ RBAC 权限模型 ═══
permissions = {
    "viewer": {
        "tables": ["sales_summary", "product_stats"],
        "operations": ["SELECT"],
        "row_limit": 1000,
        "columns_masked": ["customer_phone", "email"],
    },
    "analyst": {
        "tables": ["orders", "customers", "products"],
        "operations": ["SELECT"],
        "row_limit": 100000,
        "code_execution": True,
    },
    "admin": {
        "tables": ["*"],
        "operations": ["SELECT"],
        "row_limit": None,
        "code_execution": True,
        "export": True,
    },
}

# ═══ 审计日志 ═══
# 记录每次查询:
# - 用户身份
# - 原始问题
# - 生成的 SQL/代码
# - 执行结果摘要
# - 访问的表和字段
# - 是否触发安全规则`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📋 实施路线图</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> implementation_roadmap</div>
                <pre className="fs-code">{`# 企业数据 Agent 实施路线图

# ═══ Phase 1: POC (2-4 周) ═══
phase_1 = {
    "目标": "验证可行性 + 衡量价值",
    "范围": "1 个业务场景 + 1-2 张核心表",
    "技术": "Vanna.ai / PandasAI + GPT-4o",
    "用户": "3-5 个种子分析师",
    "指标": [
        "SQL 生成正确率 > 80%",
        "用户满意度 > 3.5/5",
        "分析效率提升 > 2x",
    ],
}

# ═══ Phase 2: MVP (1-2 月) ═══
phase_2 = {
    "目标": "内部发布可用产品",
    "范围": "接入数据仓库 + 10+ 张表",
    "新增": [
        "Web 界面 (React + FastAPI)",
        "用户认证 + 权限管理",
        "查询缓存 + 历史记录",
        "基础安全防护",
    ],
    "用户": "单个部门 20-50 人",
}

# ═══ Phase 3: 生产 (2-3 月) ═══
phase_3 = {
    "目标": "全公司推广",
    "新增": [
        "Docker 沙箱 (Code Interpreter)",
        "多数据源 (SQL + CSV + API)",
        "自动化报表 (定时 Agent)",
        "Slack/飞书 Bot 集成",
        "完善审计 + 监控",
    ],
    "用户": "全公司 200+ 人",
}

# ═══ Phase 4: 智能化 (持续) ═══
phase_4 = {
    "目标": "从工具到智能分析伙伴",
    "方向": [
        "主动洞察 (异常检测 → 推送)",
        "预测分析 (时序预测 + 归因)",
        "自然语言报告生成",
        "多 Agent 协作分析",
    ],
}

# ═══ ROI 测算 ═══
# 假设: 50 个分析师, 平均每天 5 个查询
# Before: 每个查询 30min (写 SQL + 做图 + 解读)
# After:  每个查询 5min (提问 + 审核)
# 节省: 50 × 5 × 25min = 6,250 min/天 = ~104h/天
# 按 $50/h: 年节省 = 104h × 250天 × $50 = $1.3M
# Agent 成本: ~$30K/年 (API + 基础设施)
# ROI: 43x`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
