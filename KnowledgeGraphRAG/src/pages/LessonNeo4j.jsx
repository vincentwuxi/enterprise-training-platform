import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Cypher 查询', '建模模式', '性能调优', '全文+向量'];

export default function LessonNeo4j() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🕸️ module_02 — Neo4j 实战</div>
      <div className="fs-hero">
        <h1>Neo4j 图数据库：知识图谱的工程基石</h1>
        <p>
          Neo4j 是全球最流行的图数据库，Facebook 用它做社交推荐，
          NASA 用它管理知识，eBay 用它做欺诈检测。
          本模块覆盖 Cypher 查询语言精通、图数据建模最佳实践、
          性能调优（索引/查询优化/内存管理）、以及 Neo4j 5.x 的全文搜索和向量索引。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔷 Neo4j 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 Cypher 查询语言精通</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> cypher_mastery.cypher</div>
                <pre className="fs-code">{`// —— Cypher 查询语言: 从入门到高级 ——

// 1. 创建节点和关系
CREATE (jobs:Person {name: "乔布斯", born: 1955})
CREATE (apple:Company {name: "Apple", founded: 1976})
CREATE (jobs)-[:FOUNDED {year: 1976}]->(apple)

// 2. 基础查询
MATCH (p:Person)-[:FOUNDED]->(c:Company)
RETURN p.name, c.name

// 3. 多跳查询 (知识图谱核心!)
// "乔布斯创办的公司的产品的竞争对手是谁?"
MATCH (p:Person {name: "乔布斯"})
      -[:FOUNDED]->(company)
      -[:PRODUCES]->(product)
      -[:COMPETES_WITH]->(competitor)
RETURN competitor.name, product.name

// 4. 可变长度路径 (1-3 跳)
MATCH path = (a:Person {name: "乔布斯"})
             -[*1..3]-(b:Person {name: "Sundar Pichai"})
RETURN path

// 5. 最短路径
MATCH p = shortestPath(
  (a:Person {name: "乔布斯"})-[*]-(b:Person {name: "马斯克"})
)
RETURN p, length(p)

// 6. 聚合与统计
MATCH (c:Company)-[:PRODUCES]->(p:Product)
RETURN c.name, count(p) AS product_count
ORDER BY product_count DESC
LIMIT 10

// 7. WITH 管道 (子查询)
MATCH (p:Person)-[:WORKS_AT]->(c:Company)
WITH c, count(p) AS employee_count
WHERE employee_count > 1000
MATCH (c)-[:LOCATED_IN]->(city:City)
RETURN c.name, employee_count, city.name

// 8. UNWIND + MERGE (批量导入)
UNWIND $triples AS triple
MERGE (s:Entity {name: triple.subject})
MERGE (o:Entity {name: triple.object})
MERGE (s)-[r:RELATION {type: triple.predicate}]->(o)

// 9. APOC 图算法
CALL apoc.algo.pageRank(null, null) YIELD node, score
RETURN node.name, score ORDER BY score DESC LIMIT 10`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🏗️ 图数据建模模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> 建模模式</div>
                <pre className="fs-code">{`图数据建模最佳实践:

1️⃣ 实体建模 (节点标签)
├── 用名词做标签: Person, Company
├── 多标签: (:Person:CEO)
├── 属性精简: 只存查询需要的
└── 避免: 万能节点 (:Entity)

2️⃣ 关系建模
├── 用动词做类型: FOUNDED, WORKS_AT
├── 方向有意义: (A)-[:MANAGES]->(B)
├── 关系带属性: [:WORKS_AT {since:2020}]
├── 避免: 过多关系类型 (>50种)
└── 技巧: 中间节点模式

3️⃣ 中间节点模式 (Intermediate Node)
# 错误: 关系上放太多属性
(人)-[:EMPLOYED_AT {公司,职位,时间}]->(?)

# 正确: 用中间节点
(人)-[:HAS_ROLE]->(角色)-[:AT]->(公司)
  角色节点: {title, start, end}

4️⃣ 时间建模
方案 A: 属性 {valid_from, valid_to}
方案 B: 时间链 [:NEXT_VERSION]->
方案 C: 时间树 Year->Month->Day

5️⃣ 反模式 (Anti-patterns)
❌ 用属性替代关系
❌ 超级节点 (度 > 100K)
❌ 深度嵌套属性 (用节点)
❌ 频繁变更的属性存节点`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📐 KG Schema 设计</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> schema.cypher</div>
                <pre className="fs-code">{`// 知识图谱 Schema 设计示例
// —— 企业知识图谱 ——

// 节点类型 (Labels)
// (:Person)       — 人物
// (:Company)      — 公司
// (:Product)      — 产品
// (:Technology)   — 技术
// (:Industry)     — 行业
// (:Location)     — 地点
// (:Event)        — 事件
// (:Document)     — 文档

// 关系类型 (Relationships)
// FOUNDED         — 创办
// WORKS_AT        — 就职于
// PRODUCES        — 生产
// USES_TECH       — 使用技术
// LOCATED_IN      — 位于
// COMPETES_WITH   — 竞争
// INVESTED_IN     — 投资
// ACQUIRED        — 收购
// MENTIONED_IN    — 被提及于

// 约束 & 索引
CREATE CONSTRAINT FOR (p:Person)
  REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT FOR (c:Company)
  REQUIRE c.id IS UNIQUE;

CREATE INDEX FOR (p:Person)
  ON (p.name);

CREATE INDEX FOR (d:Document)
  ON (d.created_at);

// 复合索引
CREATE INDEX FOR (p:Product)
  ON (p.category, p.name);`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Neo4j 性能调优</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> performance.conf</div>
                <pre className="fs-code">{`# —— Neo4j 性能调优全指南 ——

# 1. 内存配置 (neo4j.conf)
server.memory.heap.initial_size=4g
server.memory.heap.max_size=8g
server.memory.pagecache.size=16g
# 规则: PageCache ≥ 数据文件大小
# Heap: 4-16GB (看并发)

# 2. 查询优化
# PROFILE 分析执行计划
PROFILE MATCH (p:Person)-[:FOUNDED]->(c:Company)
WHERE p.name = "乔布斯"
RETURN c

# 查看 DB Hits (越少越好):
# ✅ NodeIndexSeek: 1 hit
# ❌ AllNodesScan: 1000000 hits

# 3. 索引策略
# B-Tree 索引: 等值/范围查询
CREATE INDEX FOR (p:Person) ON (p.name)

# 全文索引: 模糊搜索
CREATE FULLTEXT INDEX personSearch
FOR (p:Person) ON EACH [p.name, p.bio]

# 向量索引 (Neo4j 5.x): 语义搜索
CREATE VECTOR INDEX entityEmbedding
FOR (e:Entity) ON (e.embedding)
OPTIONS {indexConfig: {
  \`vector.dimensions\`: 1536,
  \`vector.similarity_function\`: 'cosine'
}}

# 4. 超级节点处理
# 问题: 某节点有 100K+ 关系 (如 "中国")
# 方案 1: 加关系类型过滤
MATCH (c:Country {name:"中国"})-[:CAPITAL]->(city)
# 方案 2: 分层建模
# (中国)-[:HAS_PROVINCE]->(省)-[:HAS_CITY]->(市)

# 5. 批量导入
# 小量 (<10K): Cypher UNWIND
# 中量 (<1M): APOC periodic.iterate
# 大量 (>1M): neo4j-admin import`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 Neo4j + 向量搜索 + 全文搜索</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> hybrid_neo4j.py</div>
                <pre className="fs-code">{`# —— Neo4j 混合搜索: 图 + 向量 + 全文 ——
from neo4j import GraphDatabase
from openai import OpenAI

client = OpenAI()
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

class Neo4jHybridSearch:
    """Neo4j 原生: 图遍历 + 向量 + 全文 三合一"""
    
    async def search(self, query: str, top_k=10):
        """混合搜索"""
        # 1. 向量语义搜索
        query_emb = client.embeddings.create(
            model="text-embedding-3-small", input=query
        ).data[0].embedding
        
        vector_results = self.session.run("""
            CALL db.index.vector.queryNodes(
                'entityEmbedding', $k, $embedding
            ) YIELD node, score
            RETURN node.name AS name, node.description AS desc,
                   score, labels(node) AS types
        """, embedding=query_emb, k=top_k)
        
        # 2. 全文模糊搜索
        fulltext_results = self.session.run("""
            CALL db.index.fulltext.queryNodes(
                'entitySearch', $query
            ) YIELD node, score
            RETURN node.name, score
            LIMIT $k
        """, query=query, k=top_k)
        
        # 3. 图遍历增强 (从语义搜索命中的节点出发)
        graph_results = self.session.run("""
            CALL db.index.vector.queryNodes(
                'entityEmbedding', 5, $embedding
            ) YIELD node, score
            WITH node, score
            MATCH (node)-[r]-(neighbor)
            RETURN node.name AS source, type(r) AS relation,
                   neighbor.name AS target, score
            ORDER BY score DESC
            LIMIT 50
        """, embedding=query_emb)
        
        # 4. 融合排序
        return self._fuse_results(vector_results, fulltext_results, graph_results)

# Neo4j 5.x 向量索引 = 内置 ANN 搜索
# 无需外部向量数据库!
# 图结构 + 向量 + 全文 = 最强知识检索`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
