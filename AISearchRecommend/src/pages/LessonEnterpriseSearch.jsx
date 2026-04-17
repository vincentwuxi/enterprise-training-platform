import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['统一搜索架构', '多模态搜索', '知识图谱增强', '运维 & 优化'];

export default function LessonEnterpriseSearch() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🔍 module_08 — 企业搜索平台</div>
      <div className="fs-hero">
        <h1>企业搜索平台：统一架构 × 多模态 × 知识图谱</h1>
        <p>
          企业内部散落着数十种数据源——文档、代码、邮件、工单、数据库、Confluence、Slack。
          <strong>统一搜索平台</strong>将一切连接起来，让员工"一句话找到一切"。
          本模块覆盖企业搜索架构设计、多模态搜索 (文本+图片+视频)、
          知识图谱增强检索、以及搜索平台的运维和成本优化。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🏢 企业搜索</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 企业统一搜索架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> architecture</div>
                <pre className="fs-code">{`企业统一搜索平台架构:

┌─────────────────────────────────────────────────────┐
│                    搜索入口层                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│  │ Web UI  │ │ Slack   │ │ API     │ │ Mobile   │ │
│  │ 搜索框  │ │ Bot     │ │ 接口    │ │ App      │ │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘ │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│              Query 处理层                             │
│  意图识别 → Query 改写 → 路由分发 → 权限检查         │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│              混合检索层                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐        │
│  │ BM25     │ │ Dense    │ │ Knowledge    │        │
│  │ ES/Solr  │ │ 向量库   │ │ Graph        │        │
│  └──────────┘ └──────────┘ └──────────────┘        │
│              RRF 融合 + Reranking                    │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│              数据连接层 (Connectors)                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐ │
│  │Google│ │Conflu│ │GitHub│ │Slack │ │Salesforce│ │
│  │Drive │ │-ence │ │Code  │ │Msgs  │ │CRM Data  │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐ │
│  │Notion│ │Jira  │ │Email │ │ShareP│ │Database  │ │
│  │Pages │ │Issues│ │Inbox │ │-oint │ │Tables    │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘ │
└─────────────────────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🖼️ 多模态搜索引擎</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> multimodal_search.py</div>
                <pre className="fs-code">{`# —— 多模态搜索: 文本/图片/视频/代码统一检索 ——

class MultiModalSearchEngine:
    """跨模态统一搜索引擎"""
    
    def __init__(self):
        # 多模态 Embedding 模型
        self.text_embedder = load_model("text-embedding-3-large")
        self.image_embedder = load_model("clip-ViT-L-14")
        self.code_embedder = load_model("voyage-code-3")
        
        # 统一向量空间 (CLIP 系列)
        self.unified_embedder = load_model("jina-clip-v2")
    
    async def search(self, query, modalities=None, top_k=10):
        """
        跨模态搜索
        query: 文本查询 或 图片 URL
        modalities: ["text", "image", "code", "video"]
        """
        # 1. 查询编码 (文本 or 图片)
        if isinstance(query, str):
            q_emb = await self.unified_embedder.encode_text(query)
        else:
            q_emb = await self.unified_embedder.encode_image(query)
        
        # 2. 多模态并行检索
        results = []
        tasks = []
        
        for modality in (modalities or ["text", "image", "code"]):
            tasks.append(self._search_modality(q_emb, modality, top_k))
        
        modality_results = await asyncio.gather(*tasks)
        
        # 3. 跨模态融合排序
        all_results = []
        for mod_results in modality_results:
            all_results.extend(mod_results)
        
        # 4. 跨模态 Reranking
        return await self._cross_modal_rerank(query, all_results, top_k)
    
    async def index_document(self, doc):
        """索引多模态文档"""
        embeddings = {}
        
        if doc.text:
            embeddings["text"] = await self.text_embedder.encode(doc.text)
        
        if doc.images:
            for img in doc.images:
                embeddings[f"image_{img.id}"] = await self.image_embedder.encode(img)
        
        if doc.code_blocks:
            for code in doc.code_blocks:
                embeddings[f"code_{code.id}"] = await self.code_embedder.encode(code)
        
        await self.vector_store.upsert(doc.id, embeddings, doc.metadata)

# 应用场景:
# "类似这张图的产品" → 以图搜图 (CLIP)
# "查找处理支付的代码" → 代码语义搜索
# "红色连衣裙" → 图片+文本混合搜索
# "上周会议录像中提到预算的部分" → 视频搜索`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🕸️ 知识图谱增强搜索</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> kg_search.py</div>
                <pre className="fs-code">{`# —— 知识图谱 + 搜索: 理解实体关系 ——

class KGEnhancedSearch:
    """知识图谱增强的搜索引擎"""
    
    def __init__(self, search_engine, knowledge_graph):
        self.search = search_engine
        self.kg = knowledge_graph
    
    async def search_with_kg(self, query: str, top_k=10):
        """知识图谱增强搜索"""
        
        # 1. 实体识别与链接
        entities = await self.extract_entities(query)
        # "苹果最新手机" → [("苹果", "Apple Inc."), ("手机", "iPhone")]
        
        # 2. 知识图谱扩展
        expanded_context = []
        for entity in entities:
            # 查询实体的关系
            relations = await self.kg.query(f"""
                MATCH (e:Entity {{name: '{entity.name}'}})-[r]->(related)
                RETURN e, type(r) as relation, related
                LIMIT 20
            """)
            expanded_context.extend(relations)
        
        # 3. 构建增强查询
        enhanced_query = self._build_enhanced_query(query, expanded_context)
        
        # 4. 混合检索
        text_results = await self.search.hybrid_search(enhanced_query, top_k=top_k*2)
        
        # 5. 知识图谱验证 & 补充
        verified_results = []
        for result in text_results:
            # 用 KG 验证事实准确性
            kg_score = await self._kg_verify(result, entities)
            result.kg_confidence = kg_score
            verified_results.append(result)
        
        # 6. 生成知识面板 (类似 Google Knowledge Panel)
        knowledge_panel = await self._generate_panel(entities, expanded_context)
        
        return {
            "results": sorted(verified_results, key=lambda x: x.combined_score, reverse=True)[:top_k],
            "knowledge_panel": knowledge_panel,
            "related_entities": [e.name for e in entities],
        }

# 知识图谱搜索增强效果:
# "Python GIL" 搜索时:
# KG 知道 GIL → Global Interpreter Lock → CPython → 多线程
# → 自动扩展到相关概念, 提升召回率 30%+`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📊 搜索平台监控</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> 监控体系</div>
                <pre className="fs-code">{`搜索平台运维指标:

🟢 可用性:
├── 搜索 API 可用性 > 99.9%
├── P50 延迟 < 100ms
├── P99 延迟 < 500ms
└── 零结果率 < 5%

📦 索引健康:
├── 索引延迟 < 5min
├── 文档覆盖率 > 98%
├── 向量维度一致性
└── 元数据完整性

💰 成本监控:
├── Embedding API 调用量
├── 向量存储成本
├── Reranker API 成本
├── LLM 调用成本
└── 基础设施费用

⚠️ 告警规则:
├── 延迟 > 1s → P1
├── 错误率 > 1% → P1
├── 索引延迟 > 1h → P2
├── 月成本超预算 20% → P2
└── 零结果率突增 → P2`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>💰 成本优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> 优化策略</div>
                <pre className="fs-code">{`搜索平台成本优化:

1. Embedding 成本节约
├── 批量处理 (非实时)
├── 缓存热门查询 Embedding
├── 使用开源模型替代 API
├── 降维 (3072→512)
└── 预估省: 40-60%

2. 向量存储优化
├── 标量量化 (4x 压缩)
├── 冷数据迁移磁盘
├── 按租户分区
├── 定期清理过期数据
└── 预估省: 50-70%

3. Reranker 优化
├── 只 Rerank Top-50 (非全部)
├── 缓存高频 Query 结果
├── 轻量级 Reranker (蒸馏)
├── 批量 Rerank
└── 预估省: 60%

4. 缓存策略
├── 热门查询: Redis 缓存
├── TTL: 5min (搜索), 1h (推荐)
├── 缓存命中率目标: > 30%
├── CDN 加速静态结果
└── 预估省: 30-50%

5. 架构优化
├── 按需伸缩 (K8s HPA)
├── 离线预计算推荐列表
├── Spot 实例降成本
└── 冷热分离存储`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
