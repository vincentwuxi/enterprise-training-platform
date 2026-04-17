import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['图的本质', '属性图 vs RDF', '图论速通', '知识表示'];

export default function LessonKGFoundation() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🕸️ module_01 — 知识图谱基础</div>
      <div className="fs-hero">
        <h1>知识图谱：让机器理解世界的关系</h1>
        <p>
          搜索引擎能找到包含"乔布斯"的网页，但<strong>知识图谱</strong>知道
          "乔布斯 → 创办 → Apple → 产品 → iPhone → 竞品 → Pixel"。
          它不是文本检索，而是<strong>结构化知识推理</strong>。
          本模块从图的本质出发，覆盖属性图 vs RDF、图论核心算法、知识表示方法，
          为后续 Neo4j 实战和 GraphRAG 打好基础。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📐 知识图谱基础</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 什么是知识图谱？</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> knowledge_graph_intro</div>
                <pre className="fs-code">{`知识图谱 = 实体 + 关系 + 属性

核心数据模型: 三元组 (Triple)
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Subject  │───▶│ Predicate │───▶│  Object   │
│   (主语)  │    │  (谓语)   │    │  (宾语)   │
└──────────┘    └──────────┘    └──────────┘

示例三元组:
(乔布斯,     创办,     Apple)
(Apple,      总部位于,  库比蒂诺)
(iPhone,     属于品牌,  Apple)
(乔布斯,     毕业于,    Reed College)
(Tim Cook,   继任,      乔布斯)

知识图谱可视化:

    Reed College ◀── 毕业于 ── 乔布斯
                                │
                              创办
                                │
                                ▼
    库比蒂诺 ◀── 总部 ── Apple ──▶ iPhone
                          │           │
                        CEO         竞品
                          │           │
                          ▼           ▼
                      Tim Cook      Pixel ──▶ Google

为什么比文本更强?
┌─────────────────┬────────────────────────────┐
│ 文本搜索         │ 知识图谱                    │
├─────────────────┼────────────────────────────┤
│ "乔布斯创办Apple" │ (乔布斯)-[创办]->(Apple)     │
│ 只能匹配关键词    │ 能推理: 乔布斯和Tim Cook     │
│                   │ 是前后任CEO                  │
│ 无法回答跳跃问题  │ 多跳: 乔布斯→Apple→iPhone    │
│                   │ →竞品→Pixel→Google           │
└─────────────────┴────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📊 属性图 (Property Graph)</h3>
              <span className="fs-tag green">Neo4j / TigerGraph</span>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> property_graph</div>
                <pre className="fs-code">{`属性图模型 (Property Graph):
Neo4j, TigerGraph, Amazon Neptune

特点:
✅ 节点和边都可以有属性
✅ 边有类型和方向
✅ 直观, 灵活, 查询高效
✅ 工程实践首选

节点 (Node):
┌────────────────────┐
│ Person             │
│ ──────────────     │
│ name: "乔布斯"     │
│ born: 1955         │
│ nationality: "US"  │
└────────────────────┘

边 (Relationship):
(乔布斯)-[:FOUNDED {year: 1976}]->(Apple)

Cypher 查询 (Neo4j):
MATCH (p:Person)-[:FOUNDED]->(c:Company)
WHERE p.name = "乔布斯"
RETURN c.name, c.founded_year

优势:
• 灵活 Schema (Schema-optional)
• 高效的图遍历 (邻接表存储)
• 丰富的查询语言 (Cypher/Gremlin)
• 适合实时推荐/社交/欺诈检测`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔗 RDF (Resource Description Framework)</h3>
              <span className="fs-tag purple">W3C 标准</span>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> rdf_model</div>
                <pre className="fs-code">{`RDF 模型 (W3C 标准):
Wikidata, DBpedia, Google KG

特点:
✅ W3C 国际标准
✅ 语义互操作性强
✅ 本体论 (Ontology) 支持
❌ 查询较复杂 (SPARQL)
❌ 工程实践门槛高

三元组 (Triple):
<http://dbpedia.org/Steve_Jobs>
  <http://schema.org/founder>
  <http://dbpedia.org/Apple_Inc> .

SPARQL 查询:
SELECT ?company WHERE {
  dbr:Steve_Jobs dbo:founded ?company .
  ?company dbo:industry dbr:Technology .
}

属性图 vs RDF 选型:
┌──────────┬──────────┬──────────┐
│          │ 属性图    │ RDF      │
├──────────┼──────────┼──────────┤
│ 灵活性   │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐    │
│ 标准化   │ ⭐⭐⭐    │ ⭐⭐⭐⭐⭐ │
│ 查询效率 │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐    │
│ 互操作   │ ⭐⭐     │ ⭐⭐⭐⭐⭐ │
│ 工程复杂 │ 低       │ 高       │
│ 推荐场景 │ 企业应用  │ 学术/开放 │
└──────────┴──────────┴──────────┘

结论: 工程实践选属性图(Neo4j)
      开放数据/学术选 RDF`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧮 图论速通：KG 必备算法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> graph_algorithms.py</div>
                <pre className="fs-code">{`# —— 知识图谱必备图论算法 ——
import networkx as nx

# 1. 图遍历: BFS & DFS
def bfs_knowledge_search(graph, start, target_type, max_hops=3):
    """广度优先: 找最短知识路径"""
    visited = set()
    queue = [(start, [start], 0)]
    
    while queue:
        node, path, depth = queue.pop(0)
        if depth > max_hops:
            break
        if graph.nodes[node].get("type") == target_type:
            return path
        for neighbor in graph.neighbors(node):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor], depth + 1))
    return None

# 2. 最短路径: Dijkstra
# "乔布斯 和 Sundar Pichai 之间的关系链?"
path = nx.shortest_path(G, "乔布斯", "Sundar_Pichai")
# → [乔布斯, Apple, iPhone, 竞品, Pixel, Google, Sundar_Pichai]

# 3. PageRank: 实体重要性排序
pagerank = nx.pagerank(G)
# → {"Google": 0.15, "Apple": 0.12, "乔布斯": 0.08, ...}
# 用于知识图谱中的实体重要性排序

# 4. 社区检测: Leiden 算法 (GraphRAG 核心!)
import leidenalg
import igraph as ig

# 将 NetworkX 转为 igraph
ig_graph = ig.Graph.from_networkx(G)
# Leiden 社区检测
partition = leidenalg.find_partition(
    ig_graph, leidenalg.ModularityVertexPartition
)
# → 自动发现知识社区 (GraphRAG 的基石)

# 5. 中心性: 找关键节点
betweenness = nx.betweenness_centrality(G)
# 介数中心性高 = 连接不同知识领域的桥梁节点

# 6. 连通分量: 找孤立知识岛
components = list(nx.connected_components(G.to_undirected()))
# 孤立分量 = 知识图谱中未被连接的知识碎片`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📚 知识表示方法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> 表示方法</div>
                <pre className="fs-code">{`知识表示层级:

1️⃣ 符号表示 (Symbolic)
├── 三元组: (S, P, O)
├── 本体论: OWL/RDFS
├── 逻辑规则: A ∧ B → C
└── 优势: 精确, 可解释

2️⃣ 分布式表示 (Embedding)
├── TransE: h + r ≈ t
├── TransR: 关系空间映射
├── RotatE: 旋转关系建模
├── ComplEx: 复数空间
└── 优势: 可泛化, 支持推理

3️⃣ 混合表示 (Neuro-Symbolic)
├── KG Embedding + Logic Rules
├── GNN on KG (R-GCN)
├── LLM + KG 融合
└── 优势: 精确 + 泛化

TransE 示例:
h(乔布斯) + r(创办) ≈ t(Apple)
h(马斯克) + r(创办) ≈ t(Tesla)

→ 学到 "创办" 关系的向量表示
→ 可推理: 谁可能创办新公司?`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🏗️ 主流知识图谱</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> 开放 KG</div>
                <pre className="fs-code">{`主流知识图谱对比:

🌍 通用知识图谱:
┌──────────┬─────────┬──────────┐
│ 名称      │ 三元组数 │ 特点      │
├──────────┼─────────┼──────────┤
│ Wikidata │ 15B+    │ 开放/社区 │
│ DBpedia  │ 3B+     │ Wikipedia │
│ YAGO     │ 2B+     │ 时间感知 │
│ Google KG│ 500B+   │ 商业/搜索 │
│ Freebase │ 3B+     │ 已归档   │
└──────────┴─────────┴──────────┘

🏢 行业知识图谱:
├── 金融: 企业关联/供应链/风控
├── 医疗: UMLS/SNOMED/药物交互
├── 法律: 法规条文/判例关系
└── 电商: 商品属性/品类体系

🔧 构建方式:
├── 人工构建: 精确但昂贵
├── 半自动: 规则+人工审核
├── LLM 自动构建: 新方向!
└── 众包: Wikidata 模式`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
