import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['GraphRAG 原理', 'Leiden 社区检测', 'Map-Reduce 摘要', '实战部署'];

export default function LessonGraphRAG() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🕸️ module_04 — 微软 GraphRAG 深度</div>
      <div className="fs-hero">
        <h1>微软 GraphRAG：RAG 的下一代进化</h1>
        <p>
          传统 RAG 只能回答"局部问题"（某个段落说了什么），
          但无法回答<strong>"全局问题"</strong>（这些文档整体在讲什么）。
          微软 GraphRAG 通过<strong>知识图谱 + 社区检测 + 分层摘要</strong>，
          让 AI 拥有"全局视野"。本模块深度剖析 GraphRAG 架构、Leiden 社区检测算法、
          Map-Reduce 摘要策略，以及生产级部署实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 GraphRAG</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ GraphRAG vs Naive RAG</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> graphrag_architecture</div>
                <pre className="fs-code">{`GraphRAG vs Naive RAG:

传统 Naive RAG:
──────────────
Query → Embedding → 向量搜索 Top-K → LLM 生成

问题:
❌ 只能回答局部问题 ("第3章说了什么?")
❌ 无法回答全局问题 ("这本书的主题是什么?")
❌ 不理解实体之间的关系
❌ 多文档关联信息丢失

GraphRAG 架构:
──────────────
索引阶段 (Indexing):
1. 文档 → 文本块 (Chunks)
2. 每个块 → LLM 提取 实体 + 关系
3. 构建 知识图谱 (Entity Graph)
4. Leiden 社区检测 → 分层社区
5. 每个社区 → LLM 生成 社区摘要
   (多层级: 粗粒度 → 细粒度)

查询阶段 (Querying):
┌──── Local Search ────┐  ┌──── Global Search ────┐
│ 局部搜索:             │  │ 全局搜索:              │
│ Query → 实体匹配      │  │ Query → 所有社区摘要    │
│ → 邻域子图提取        │  │ → Map: 每个社区回答     │
│ → 构建上下文          │  │ → Reduce: 合并答案      │
│ → LLM 生成回答        │  │ → LLM 综合生成          │
│                       │  │                        │
│ 适合: 具体实体问题    │  │ 适合: 全局概览问题      │
│ "乔布斯创办了什么?"   │  │ "这些文档的主题是什么?" │
└───────────────────────┘  └────────────────────────┘

GraphRAG 优势:
✅ 能回答全局问题 (主题/趋势/总结)
✅ 理解实体关系 (多跳推理)
✅ 多文档关联 (跨文档知识)
✅ 分层理解 (宏观→微观)
✅ 可解释性强 (知识图谱可视化)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 Leiden 社区检测算法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> leiden_algorithm.py</div>
                <pre className="fs-code">{`# —— Leiden 社区检测: GraphRAG 的核心 ——
import igraph as ig
import leidenalg

# Leiden vs Louvain:
# Louvain 可能产生断连社区 (质量问题)
# Leiden 保证社区内部连通性 (更优)

def build_graph_and_detect_communities(triples: list):
    """从三元组构建图并检测社区"""
    
    # 1. 构建图
    G = ig.Graph(directed=False)
    entity_map = {}
    
    for triple in triples:
        for entity in [triple["subject"], triple["object"]]:
            if entity not in entity_map:
                entity_map[entity] = len(entity_map)
                G.add_vertex(name=entity)
        
        G.add_edge(
            entity_map[triple["subject"]],
            entity_map[triple["object"]],
            weight=triple.get("confidence", 1.0)
        )
    
    # 2. Leiden 多层级社区检测
    # Level 0: 最细粒度 (小社区)
    partition_fine = leidenalg.find_partition(
        G, leidenalg.ModularityVertexPartition,
        resolution_parameter=1.0
    )
    
    # Level 1: 中粒度
    partition_mid = leidenalg.find_partition(
        G, leidenalg.ModularityVertexPartition,
        resolution_parameter=0.5
    )
    
    # Level 2: 粗粒度 (大社区)
    partition_coarse = leidenalg.find_partition(
        G, leidenalg.ModularityVertexPartition,
        resolution_parameter=0.1
    )
    
    return {
        "fine": partition_fine,      # 例: 50 个小社区
        "medium": partition_mid,     # 例: 15 个中社区
        "coarse": partition_coarse   # 例: 5 个大社区
    }

# 直觉理解 Leiden:
# 想象一个社交网络:
# - 细粒度: 发现"同事群"、"高中同学群"、"羽毛球群"
# - 中粒度: 合并为 "工作圈"、"学校圈"、"运动圈"
# - 粗粒度: 合并为 "个人社交网络"
#
# GraphRAG 中:
# - 细粒度社区 → 具体主题 (如 "iPhone产品线")
# - 中粒度社区 → 领域主题 (如 "Apple消费电子")
# - 粗粒度社区 → 宏观主题 (如 "科技行业")`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 Map-Reduce 社区摘要</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> community_summarize.py</div>
                <pre className="fs-code">{`# —— GraphRAG 社区摘要 & 全局查询 ——

class GraphRAGSummarizer:
    """为每个社区生成摘要, 支持全局查询"""
    
    async def build_community_summaries(self, communities, entities, relations):
        """索引阶段: 为每个社区生成摘要"""
        summaries = {}
        
        for community_id, members in communities.items():
            # 收集该社区的实体和关系
            community_entities = [e for e in entities if e["id"] in members]
            community_relations = [
                r for r in relations
                if r["subject"] in members or r["object"] in members
            ]
            
            # LLM 生成社区摘要
            summary = await self.llm.generate(
                system="你是知识分析专家。根据以下实体和关系,生成该知识社区的摘要。",
                user=f"""
社区实体: {json.dumps(community_entities, ensure_ascii=False)}
社区关系: {json.dumps(community_relations, ensure_ascii=False)}

生成:
1. 社区标题 (5-10字)
2. 社区摘要 (100-200字, 描述核心主题和关键发现)
3. 关键实体 (Top 5)
4. 核心关系 (Top 5)
"""
            )
            summaries[community_id] = summary
        
        return summaries
    
    async def global_search(self, query: str, community_summaries: dict):
        """全局查询: Map-Reduce 模式"""
        
        # ---- MAP 阶段 ----
        # 每个社区独立回答查询
        map_results = []
        for cid, summary in community_summaries.items():
            answer = await self.llm.generate(
                system="根据以下社区知识摘要回答问题。如果不相关,返回'无关'。",
                user=f"社区摘要: {summary}\\n\\n问题: {query}"
            )
            if "无关" not in answer:
                map_results.append({
                    "community_id": cid,
                    "answer": answer,
                    "relevance": await self._score_relevance(query, answer)
                })
        
        # ---- REDUCE 阶段 ----
        # 合并所有社区的回答
        sorted_results = sorted(map_results, key=lambda x: x["relevance"], reverse=True)
        top_answers = sorted_results[:10]
        
        final_answer = await self.llm.generate(
            system="综合以下多个来源的信息,生成一个全面的回答。标注[来源N]。",
            user=f"问题: {query}\\n\\n各社区回答:\\n" + 
                 "\\n".join([f"[来源{i+1}] {a['answer']}" for i, a in enumerate(top_answers)])
        )
        
        return {
            "answer": final_answer,
            "sources": top_answers,
            "communities_consulted": len(map_results)
        }

# 示例:
# 问题: "这些文档整体在讨论什么技术趋势?"
# Naive RAG: ❌ 无法回答 (没有单个文档块包含全局信息)
# GraphRAG:  ✅ 综合 50 个社区摘要, 生成全局趋势分析`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🚀 GraphRAG 部署</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> deployment</div>
                <pre className="fs-code">{`GraphRAG 生产部署:

# 1. 安装
pip install graphrag

# 2. 初始化项目
graphrag init --root ./my_project

# 3. 配置 (settings.yaml)
llm:
  model: gpt-4o-mini
  api_key: $OPENAI_API_KEY

embeddings:
  model: text-embedding-3-small

chunks:
  size: 1200
  overlap: 100

community_reports:
  max_length: 2000

# 4. 索引构建 (耗时!)
graphrag index --root ./my_project

# 5. 查询
# Local Search (局部)
graphrag query --root ./my_project \\
  --method local \\
  --query "乔布斯创办了哪些公司?"

# Global Search (全局)
graphrag query --root ./my_project \\
  --method global \\
  --query "这些文档的核心主题?"

索引构建成本估算:
├── 100 页文档 → ~$2-5
├── 1000 页文档 → ~$20-50
├── 10000 页文档 → ~$200-500
└── 主要成本: LLM 调用`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>⚙️ 优化策略</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> optimization</div>
                <pre className="fs-code">{`GraphRAG 优化策略:

1. 成本优化
├── 索引用 gpt-4o-mini (便宜)
├── 查询用 gpt-4o (质量)
├── 批量索引减少 API 调用
├── 缓存社区摘要
└── 预估: 节省 60-70%

2. 质量优化
├── 自定义实体类型 Schema
├── 调整 Leiden resolution
├── 社区摘要 Prompt 优化
├── 增加 Entity Description
└── 添加 claim 提取

3. 性能优化
├── 并行实体/关系抽取
├── 增量索引 (新文档追加)
├── 预计算 Global Search
├── 社区摘要缓存
└── 向量索引加速

4. 替代方案
├── LightRAG (轻量级)
├── nano-graphrag (极简)
├── LlamaIndex KG 模式
├── LangChain + Neo4j
└── 自建 (灵活但工作量大)

最佳实践:
✅ 文档量 > 50 页时用 GraphRAG
✅ 需要全局问题时用 Global
✅ 需要精确实体时用 Local
❌ 实时性要求高时不合适
❌ 文档量 < 10 页时杀鸡用牛刀`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
