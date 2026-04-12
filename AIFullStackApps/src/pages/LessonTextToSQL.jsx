import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 04 — Text-to-SQL
   Schema Linking / 查询生成 / 安全执行 / 可视化
   ───────────────────────────────────────────── */

const PIPELINE = [
  { name: 'Schema Linking', icon: '🔗', tag: 'Context',
    code: `# ─── Schema 自动发现 + 上下文注入 ───
import sqlalchemy
from typing import List, Dict

class SchemaLinker:
    """自动发现数据库 Schema 并构建 LLM 上下文"""
    
    def __init__(self, connection_string: str):
        self.engine = sqlalchemy.create_engine(connection_string)
        self.inspector = sqlalchemy.inspect(self.engine)
    
    def get_schema_context(self, tables: List[str] = None) -> str:
        """生成 Schema DDL 上下文"""
        if not tables:
            tables = self.inspector.get_table_names()
        
        context_parts = []
        for table in tables:
            columns = self.inspector.get_columns(table)
            pk = self.inspector.get_pk_constraint(table)
            fks = self.inspector.get_foreign_keys(table)
            
            # 构建 DDL
            col_defs = []
            for col in columns:
                col_def = f"  {col['name']} {col['type']}"
                if col['name'] in (pk.get('constrained_columns', [])):
                    col_def += " PRIMARY KEY"
                if not col.get('nullable', True):
                    col_def += " NOT NULL"
                col_defs.append(col_def)
            
            # 外键
            for fk in fks:
                ref = f"{fk['referred_table']}({','.join(fk['referred_columns'])})"
                col_def = f"  FOREIGN KEY ({','.join(fk['constrained_columns'])}) REFERENCES {ref}"
                col_defs.append(col_def)
            
            ddl = f"CREATE TABLE {table} (\\n" + ",\\n".join(col_defs) + "\\n);"
            context_parts.append(ddl)
        
        return "\\n\\n".join(context_parts)
    
    def get_sample_data(self, table: str, limit=3) -> str:
        """获取样本数据帮助 LLM 理解字段含义"""
        with self.engine.connect() as conn:
            result = conn.execute(
                sqlalchemy.text(f"SELECT * FROM {table} LIMIT {limit}")
            )
            rows = [dict(r._mapping) for r in result]
        return f"-- 样本数据 ({table}):\\n-- {rows}"

    def find_relevant_tables(self, question: str) -> List[str]:
        """用 LLM 或关键词匹配找相关表"""
        all_tables = self.inspector.get_table_names()
        # 简单实现: 用 LLM 筛选
        response = llm.invoke(f"""
给定用户问题: "{question}"
以下数据库表中，哪些可能相关？只返回表名列表。
表: {all_tables}
""")
        return parse_table_list(response.content)` },
  { name: 'SQL 生成', icon: '⚡', tag: 'Generation',
    code: `# ─── LLM SQL 生成 (多策略) ───
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

TEXT_TO_SQL_PROMPT = ChatPromptTemplate.from_template("""
你是一个 SQL 专家。基于以下数据库 Schema，将用户的自然语言问题转换为 SQL 查询。

## 数据库 Schema
{schema}

## 样本数据
{sample_data}

## 规则
1. 只生成 SELECT 查询，禁止 INSERT/UPDATE/DELETE/DROP
2. 使用参数化查询防止 SQL 注入
3. 大表查询必须加 LIMIT (默认 100)
4. 使用表别名提高可读性
5. 对金额字段使用适当的格式化
6. 如果问题模糊，生成最合理的查询并说明假设

## 用户问题
{question}

请返回 JSON:
{{
  "sql": "生成的 SQL 查询",
  "explanation": "查询逻辑说明",
  "assumptions": ["如果有假设，列出来"],
  "complexity": "simple | medium | complex"
}}
""")

llm = ChatOpenAI(model="gpt-4o", temperature=0)

async def generate_sql(question: str, schema: str, samples: str):
    chain = TEXT_TO_SQL_PROMPT | llm
    result = await chain.ainvoke({
        "schema": schema,
        "sample_data": samples,
        "question": question,
    })
    return parse_json(result.content)

# ─── 自我修复: SQL 执行失败时自动修复 ───
async def generate_with_retry(question, schema, max_retries=3):
    sql_result = await generate_sql(question, schema, samples)
    
    for attempt in range(max_retries):
        try:
            data = execute_safe(sql_result["sql"])
            return {"data": data, "sql": sql_result["sql"]}
        except Exception as e:
            # 把错误信息反馈给 LLM 修复
            fix_prompt = f"""
SQL 执行失败:
Query: {sql_result['sql']}
Error: {str(e)}

请修复这个 SQL 查询。
"""
            sql_result = await generate_sql(
                fix_prompt, schema, samples
            )
    
    raise Exception("SQL 生成失败，已尝试 3 次")` },
  { name: '安全执行', icon: '🛡️', tag: 'Execution',
    code: `# ─── SQL 安全执行引擎 ───
import sqlparse
import re
from typing import Tuple, List, Dict

class SQLSafeExecutor:
    """安全执行 LLM 生成的 SQL"""
    
    # 危险操作黑名单
    BLOCKED_KEYWORDS = [
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER',
        'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE',
        'EXEC', 'EXECUTE', 'CALL',
        'INTO OUTFILE', 'LOAD_FILE',
    ]
    
    MAX_ROWS = 1000
    TIMEOUT_SECONDS = 30
    
    def validate(self, sql: str) -> Tuple[bool, str]:
        """验证 SQL 安全性"""
        # 1. 解析 SQL
        parsed = sqlparse.parse(sql)
        if not parsed:
            return False, "无法解析 SQL"
        
        stmt = parsed[0]
        
        # 2. 只允许 SELECT
        if stmt.get_type() != 'SELECT':
            return False, f"只允许 SELECT，检测到: {stmt.get_type()}"
        
        # 3. 关键词检查
        sql_upper = sql.upper()
        for keyword in self.BLOCKED_KEYWORDS:
            if keyword in sql_upper:
                return False, f"包含危险关键词: {keyword}"
        
        # 4. 注入检查
        injection_patterns = [
            r';\\s*(DROP|DELETE|INSERT|UPDATE)',  # 多语句注入
            r'--',                                 # 注释注入
            r'/\\*',                                # 块注释
            r'UNION\\s+SELECT',                    # UNION 注入
        ]
        for pattern in injection_patterns:
            if re.search(pattern, sql, re.IGNORECASE):
                return False, f"检测到注入模式"
        
        # 5. 确保有 LIMIT
        if 'LIMIT' not in sql_upper:
            sql += f" LIMIT {self.MAX_ROWS}"
        
        return True, sql
    
    def execute(self, sql: str) -> Dict:
        """安全执行并返回结果"""
        is_valid, result = self.validate(sql)
        if not is_valid:
            return {"error": result, "data": None}
        
        try:
            # 使用只读连接 + 超时
            with self.readonly_engine.connect() as conn:
                conn.execute(sqlalchemy.text(
                    f"SET statement_timeout = {self.TIMEOUT_SECONDS * 1000}"
                ))
                result = conn.execute(sqlalchemy.text(result))
                columns = list(result.keys())
                rows = [dict(r._mapping) for r in result]
                
                return {
                    "columns": columns,
                    "data": rows,
                    "row_count": len(rows),
                    "sql": result,
                }
        except Exception as e:
            return {"error": str(e), "data": None}` },
  { name: '结果可视化', icon: '📊', tag: 'Visualization',
    code: `# ─── 智能可视化推荐 ───
from typing import List, Dict

class SmartVisualizer:
    """根据数据特征自动推荐最佳可视化方式"""
    
    CHART_RULES = {
        "bar":  {"min_categories": 2, "max_categories": 20, "numeric_cols": 1},
        "line": {"time_column": True, "numeric_cols": 1},
        "pie":  {"min_categories": 2, "max_categories": 8, "numeric_cols": 1},
        "table": {"default": True},
        "number": {"single_value": True},
    }
    
    def recommend(self, columns, data, question) -> Dict:
        """智能推荐图表类型"""
        # 用 LLM 分析最佳展示方式
        response = llm.invoke(f"""
分析以下查询结果，推荐最佳可视化方式。

问题: {question}
列名: {columns}
数据量: {len(data)} 行
样本: {data[:3]}

返回 JSON:
{{
  "chart_type": "bar|line|pie|table|number|scatter",
  "x_axis": "列名",
  "y_axis": "列名",
  "title": "图表标题",
  "config": {{}},        // 额外配置
  "insight": "一句话数据洞察"
}}
""")
        return parse_json(response.content)

# ─── 前端 React 组件 ───
# components/SQLResultChart.tsx
import { BarChart, LineChart, PieChart } from "recharts";

function SQLResultChart({ data, config }) {
  switch (config.chart_type) {
    case "bar":
      return (
        <BarChart data={data} width={600} height={400}>
          <XAxis dataKey={config.x_axis} />
          <YAxis />
          <Bar dataKey={config.y_axis} fill="#8b5cf6" />
          <Tooltip />
        </BarChart>
      );
    case "line":
      return (
        <LineChart data={data} width={600} height={400}>
          <XAxis dataKey={config.x_axis} />
          <YAxis />
          <Line dataKey={config.y_axis} stroke="#06b6d4" />
          <Tooltip />
        </LineChart>
      );
    case "number":
      return (
        <div className="metric-card">
          <div className="value">{data[0]?.[config.y_axis]}</div>
          <div className="label">{config.title}</div>
        </div>
      );
    default:
      return <DataTable columns={columns} data={data} />;
  }
}` },
];

export default function LessonTextToSQL() {
  const [pipeIdx, setPipeIdx] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🧩 module_04 — Text-to-SQL</div>
      <div className="fs-hero">
        <h1>Text-to-SQL：用自然语言查数据库</h1>
        <p>
          "上个月销售额最高的 10 个产品是什么？"——不用写 SQL，LLM 帮你生成并执行。
          但生产级 Text-to-SQL 需要 <strong>Schema Linking</strong>、<strong>安全沙箱执行</strong>、
          <strong>自我修复</strong>、<strong>智能可视化</strong>。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🔄 Text-to-SQL Pipeline</h2>
        <div className="fs-pills">
          {PIPELINE.map((p, i) => (
            <button key={i} className={`fs-btn ${i === pipeIdx ? 'primary' : ''}`}
              onClick={() => setPipeIdx(i)}>
              {p.icon} {p.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #fb7185' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fb7185' }}>{PIPELINE[pipeIdx].icon} {PIPELINE[pipeIdx].name}</h3>
            <span className="fs-tag rose">{PIPELINE[pipeIdx].tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 text_to_sql_{PIPELINE[pipeIdx].tag.toLowerCase()}.py
            </div>
            <pre className="fs-code">{PIPELINE[pipeIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* Safety */}
      <div className="fs-section">
        <h2 className="fs-section-title">🛡️ 安全要点</h2>
        <div className="fs-grid-2">
          <div className="fs-alert danger"><strong>🚫 绝对禁止</strong><br/>• 直接执行 LLM 生成的 SQL<br/>• 使用 admin 权限连接<br/>• 不设执行超时<br/>• 返回超过 1000 行</div>
          <div className="fs-alert success"><strong>✅ 必须做到</strong><br/>• 只读连接 (READ ONLY)<br/>• SQL 解析 + 白名单<br/>• 30s 超时限制<br/>• 敏感列脱敏</div>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← RAG 知识库</button>
        <button className="fs-btn green">AI 工作流 →</button>
      </div>
    </div>
  );
}
