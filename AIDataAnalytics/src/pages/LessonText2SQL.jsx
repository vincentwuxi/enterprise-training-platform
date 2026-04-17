import React from 'react';
import './LessonCommon.css';

export default function LessonText2SQL() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">💬 模块二：Text2SQL — 自然语言查询数据库 / NL2SQL / 语义解析</h1>
      <p className="lesson-subtitle">
        让业务人员用母语和数据对话，从模型原理到生产部署
      </p>

      <section className="lesson-section">
        <h2>1. Text2SQL 技术全景</h2>
        <div className="info-box">
          <h3>📈 NL2SQL 技术演进</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>代表</th><th>准确率 (Spider)</th><th>特点</th></tr>
            </thead>
            <tbody>
              <tr><td>规则模板</td><td>关键词匹配</td><td>~30%</td><td>简单但脆弱</td></tr>
              <tr><td>Seq2Seq</td><td>IRNet / RAT-SQL</td><td>~65%</td><td>编码器-解码器</td></tr>
              <tr><td>预训练</td><td>RESDSQL / PICARD</td><td>~75%</td><td>SQL 预训练 + 约束解码</td></tr>
              <tr><td>LLM Zero-shot</td><td>GPT-4 + Prompt</td><td>~72%</td><td>无需训练, 灵活</td></tr>
              <tr><td>LLM + RAG</td><td>DIN-SQL / DAIL-SQL</td><td>~85%</td><td>Schema 检索 + Few-shot</td></tr>
              <tr><td>Agent 式</td><td>MAC-SQL / Chess</td><td>~87%</td><td>多步推理 + 自纠错</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. LLM Text2SQL 实战</h2>
        <div className="concept-card">
          <h3>🔥 基于 LLM 的 Text2SQL 管线</h3>
          <div className="code-block">
{`import openai
import duckdb

# ═══ 核心流程 ═══
# 用户问题 → Schema 检索 → Prompt 构造 → LLM 生成 SQL → 执行 → 结果解读

# 1. Schema 信息提取
def extract_schema(db_path: str) -> str:
    """提取数据库 schema 信息"""
    con = duckdb.connect(db_path)
    tables = con.execute(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='main'"
    ).fetchall()
    
    schema_info = []
    for (table,) in tables:
        columns = con.execute(f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '{table}'
        """).fetchall()
        
        # 采样数据帮助 LLM 理解数据含义
        sample = con.execute(f"SELECT * FROM {table} LIMIT 3").fetchdf()
        
        col_info = ", ".join([f"{c} ({t})" for c, t in columns])
        schema_info.append(f"Table: {table}\\nColumns: {col_info}\\nSample:\\n{sample}")
    
    return "\\n\\n".join(schema_info)

# 2. Prompt 模板
TEXT2SQL_PROMPT = """你是一个 SQL 专家。根据用户的自然语言问题生成对应的 SQL 查询。

数据库 Schema:
{schema}

规则:
1. 只生成 SELECT 查询, 禁止 INSERT/UPDATE/DELETE
2. 使用标准 SQL 语法
3. 对模糊的列名, 优先选择最相关的列
4. 如果需要日期过滤, 使用 ISO 格式
5. 聚合查询必须包含 GROUP BY
6. 输出纯 SQL, 不要解释

相似问题参考 (Few-shot):
{examples}

用户问题: {question}

SQL:"""

# 3. 生成 SQL
def text2sql(question: str, schema: str, examples: str = "") -> str:
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": TEXT2SQL_PROMPT.format(
                schema=schema, examples=examples, question=question
            )
        }],
        temperature=0,       # 确定性输出
        max_tokens=500,
    )
    sql = response.choices[0].message.content.strip()
    # 清理 markdown 代码块
    sql = sql.replace('\`\`\`sql', '').replace('\`\`\`', '').strip()
    return sql

# 4. 安全执行
def safe_execute(sql: str, db_path: str):
    """安全执行 SQL (只允许 SELECT)"""
    sql_upper = sql.strip().upper()
    if not sql_upper.startswith("SELECT") and not sql_upper.startswith("WITH"):
        raise ValueError("只允许 SELECT 查询")
    
    con = duckdb.connect(db_path, read_only=True)
    try:
        result = con.execute(sql).fetchdf()
        return result
    except Exception as e:
        return f"SQL 执行错误: {e}"

# 5. 结果解读
def interpret_result(question, sql, result):
    """用 LLM 解读查询结果"""
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": f"""用户问题: {question}
执行的 SQL: {sql}
查询结果:
{result.to_string()}

请用简洁的中文解读这个查询结果, 给出关键洞察。"""
        }],
    )
    return response.choices[0].message.content`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. Text2SQL 准确率优化</h2>
        <div className="concept-card">
          <h3>🎯 提升 Text2SQL 准确率的 7 大策略</h3>
          <div className="code-block">
{`# 策略 1: Schema 精简 (只提供相关表)
"""
问题: 完整 schema 太长 → LLM 困惑
方案: 用 Embedding 检索相关表/列
"""
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

# 预计算所有表+列的 embedding
table_descriptions = {
    "orders": "订单表: 订单ID, 客户ID, 金额, 日期, 状态",
    "customers": "客户表: 客户ID, 姓名, 地区, 注册日期",
    "products": "商品表: 商品ID, 名称, 类别, 价格",
}
table_embeddings = {k: model.encode(v) for k, v in table_descriptions.items()}

# 根据用户问题检索相关表
question_emb = model.encode("上个月华东地区销售额最高的产品")
# → 匹配: orders, customers, products

# 策略 2: Few-shot 示例检索
"""
维护一个 (问题, SQL) 对的示例库
用语义相似度检索最相关的 3-5 个示例
"""

# 策略 3: 自纠错 (Self-Correction)
def text2sql_with_correction(question, schema, max_retries=3):
    sql = text2sql(question, schema)
    
    for attempt in range(max_retries):
        try:
            result = safe_execute(sql, db_path)
            if isinstance(result, str) and "错误" in result:
                raise Exception(result)
            return sql, result
        except Exception as e:
            # 将错误反馈给 LLM 重新生成
            sql = text2sql(
                f"{question}\\n\\n上一次生成的 SQL 报错:\\n{sql}\\n错误: {e}\\n请修正",
                schema
            )
    return sql, "多次重试仍失败"

# 策略 4: SQL 语法约束解码
# 策略 5: 业务术语映射 (同义词/缩写 → 标准列名)
# 策略 6: 查询分解 (复杂问题拆成多步)
# 策略 7: 人工反馈循环 (记录修正, 持续改进)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. Text2SQL 产品与工具</h2>
        <div className="info-box">
          <h3>📋 Text2SQL 产品选型</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>产品</th><th>类型</th><th>特点</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>Vanna.ai</td><td>开源框架</td><td>RAG + LLM, 可微调</td><td>自建 Text2SQL</td></tr>
              <tr><td>SQLCoder</td><td>开源模型</td><td>专用 Text2SQL 模型</td><td>本地部署</td></tr>
              <tr><td>Dataherald</td><td>开源平台</td><td>企业级 NL2SQL</td><td>复杂企业场景</td></tr>
              <tr><td>ThoughtSpot</td><td>商用 BI</td><td>搜索式分析</td><td>企业 BI</td></tr>
              <tr><td>Mode / Hex</td><td>Notebook BI</td><td>AI SQL 辅助</td><td>数据团队协作</td></tr>
              <tr><td>ChatBI (百度)</td><td>商用</td><td>中文优化</td><td>国内企业</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：分析基础</span>
        <span className="nav-next">下一模块：AutoML →</span>
      </div>
    </div>
  );
}
