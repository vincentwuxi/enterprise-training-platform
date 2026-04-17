import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['增量更新', '图谱演化', '质量保证', '成本优化'];

export default function LessonKGProduction() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🕸️ module_08 — 生产工程</div>
      <div className="fs-hero">
        <h1>KG 生产工程：从实验到工业级</h1>
        <p>
          知识图谱不是一次性项目——它是一个<strong>活的系统</strong>。
          新数据不断涌入、知识会过时、实体会合并、关系会变化。
          本模块覆盖增量更新管线（CDC + 流式抽取）、图谱演化管理（版本控制 + 变更审计）、
          质量保证体系（一致性验证 + 覆盖率监控）、以及成本优化（LLM 调用 + 存储 + 查询）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 生产运维</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 增量更新管线</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> incremental_update.py</div>
                <pre className="fs-code">{`# —— 知识图谱增量更新管线 ——

class KGIncrementalPipeline:
    """增量更新: 新数据自动融入知识图谱"""
    
    def __init__(self, extractor, graph_db, quality_checker):
        self.extractor = extractor
        self.graph = graph_db
        self.checker = quality_checker
    
    async def process_new_document(self, document):
        """处理新文档 → 增量更新图谱"""
        
        # 1. 变更检测 (已有文档的更新?)
        doc_hash = self.compute_hash(document)
        is_update = await self.check_existing(doc_hash)
        
        # 2. 实体 & 关系抽取
        entities = await self.extractor.extract_entities(document.text)
        relations = await self.extractor.extract_relations(document.text, entities)
        
        # 3. 实体消歧 (与已有图谱对齐)
        resolved_entities = []
        for entity in entities:
            existing = await self.find_existing_entity(entity)
            if existing:
                # 合并属性 (保留更新的)
                merged = self.merge_entity(existing, entity)
                resolved_entities.append(merged)
            else:
                # 新实体
                resolved_entities.append(entity)
        
        # 4. 冲突检测
        conflicts = await self.detect_conflicts(resolved_entities, relations)
        if conflicts:
            # 自动解决或标记人工审核
            resolved = await self.resolve_conflicts(conflicts)
        
        # 5. 质量验证
        quality_score = await self.checker.validate(
            resolved_entities, relations
        )
        
        if quality_score < 0.7:
            await self.send_to_human_review(document, resolved_entities, relations)
            return {"status": "pending_review", "score": quality_score}
        
        # 6. 原子写入 (事务)
        async with self.graph.transaction() as tx:
            for entity in resolved_entities:
                await tx.run("""
                    MERGE (e:Entity {id: $id})
                    SET e += $properties,
                        e.updated_at = datetime()
                """, id=entity["id"], properties=entity["props"])
            
            for rel in relations:
                await tx.run("""
                    MATCH (s:Entity {id: $sid}), (o:Entity {id: $oid})
                    MERGE (s)-[r:RELATION {type: $type}]->(o)
                    SET r.confidence = $conf,
                        r.source = $source,
                        r.updated_at = datetime()
                """, sid=rel["subject"], oid=rel["object"],
                   type=rel["predicate"], conf=rel["confidence"],
                   source=document.id)
        
        # 7. 更新索引 (向量 + 全文)
        await self.update_indexes(resolved_entities)
        
        return {"status": "success", "entities": len(resolved_entities),
                "relations": len(relations), "quality": quality_score}
    
    async def run_cdc_stream(self, source):
        """CDC 流式增量更新"""
        async for change in source.stream_changes():
            if change.type == "INSERT":
                await self.process_new_document(change.document)
            elif change.type == "UPDATE":
                await self.process_update(change.document, change.diff)
            elif change.type == "DELETE":
                await self.process_deletion(change.document_id)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📜 图谱版本管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> versioning</div>
                <pre className="fs-code">{`图谱演化管理:

1️⃣ 时间感知知识 (Temporal KG)
# 每条知识带有效期
(Apple)-[:CEO {from: 2011, to: null}]->(Tim Cook)
(Apple)-[:CEO {from: 1997, to: 2011}]->(乔布斯)

# 时间查询
MATCH (c:Company {name:"Apple"})-[r:CEO]->(p)
WHERE r.from <= 2005 AND (r.to IS NULL OR r.to >= 2005)
RETURN p.name
# → 乔布斯 (2005年的Apple CEO)

2️⃣ 变更审计日志
┌──────────────────────────────┐
│ Change Log                   │
├──────────────────────────────┤
│ 2024-06-15 ADD               │
│   (Apple)-[:LAUNCHED]->(AI)  │
│   source: WWDC 新闻稿        │
│   confidence: 0.95           │
│   approved_by: auto          │
├──────────────────────────────┤
│ 2024-07-01 UPDATE            │
│   (Apple).market_cap=3.5T    │
│   previous: 3.2T             │
│   source: Bloomberg          │
└──────────────────────────────┘

3️⃣ Schema 演化
# 新增节点类型 (无需停机)
CREATE CONSTRAINT FOR (ai:AIModel)
  REQUIRE ai.id IS UNIQUE

# 关系类型迁移
# WORKS_AT → EMPLOYED_AT
MATCH (p)-[old:WORKS_AT]->(c)
CREATE (p)-[:EMPLOYED_AT {
  since: old.since
}]->(c)
DELETE old`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔄 知识过期管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> ttl.py</div>
                <pre className="fs-code">{`知识过期与刷新:

知识生命周期:
├── 永久知识: "地球绕太阳转"
├── 长期知识: "Python 创始人是 Guido"
├── 中期知识: "Apple CEO 是 Tim Cook"
├── 短期知识: "今天天气晴"
└── 事件知识: "WWDC 2024 发布 AI"

TTL 策略:
class KnowledgeTTL:
    TTL_CONFIG = {
        "fact": None,       # 永不过期
        "role": 365*2,      # 2年刷新
        "metric": 90,       # 季度刷新
        "event": 30,        # 月度归档
        "news": 7,          # 周度清理
    }
    
    async def refresh_expired(self):
        """定期刷新过期知识"""
        expired = self.graph.session().run("""
            MATCH (e)-[r]->(t)
            WHERE r.updated_at < datetime() - 
                  duration({days: $ttl})
            RETURN e, r, t
        """, ttl=self.TTL_CONFIG["metric"])
        
        for record in expired:
            # 重新抽取验证
            still_valid = await self.verify(record)
            if not still_valid:
                # 标记过期而非删除
                self.mark_expired(record)

过期处理:
✅ 标记过期 (soft delete)
✅ 保留历史版本
✅ 查询时过滤过期知识
❌ 不直接删除 (可能恢复)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>✅ 知识图谱质量保证</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> quality_assurance.py</div>
                <pre className="fs-code">{`# —— 知识图谱质量保证体系 ——

class KGQualityAssurance:
    """知识图谱全方位质量检查"""
    
    async def full_audit(self) -> dict:
        """执行完整质量审计"""
        
        results = {
            # 1. 结构完整性
            "orphan_nodes": await self._check_orphans(),
            # 没有任何关系的孤立节点
            
            "disconnected_components": await self._check_connectivity(),
            # 互不相连的子图数量
            
            "schema_violations": await self._check_schema(),
            # 违反 Schema 约束的节点/关系
            
            # 2. 数据质量
            "duplicate_entities": await self._check_duplicates(),
            # 疑似重复的实体 (编辑距离 < 2)
            
            "missing_properties": await self._check_completeness(),
            # 缺少必要属性的节点
            
            "contradictions": await self._check_contradictions(),
            # 矛盾知识 (如同一人有两个出生日期)
            
            # 3. 覆盖率
            "entity_coverage": await self._check_entity_coverage(),
            # 重要实体是否已入图
            
            "relation_density": await self._check_density(),
            # 关系密度 (edges / nodes)
            
            # 4. 新鲜度
            "stale_knowledge": await self._check_freshness(),
            # 超过 TTL 未更新的知识占比
        }
        
        # 综合质量分数
        results["overall_score"] = self._compute_score(results)
        
        return results
    
    async def _check_contradictions(self):
        """检测矛盾知识"""
        # 同一实体的同一属性有不同值
        contradictions = self.graph.session().run("""
            MATCH (e:Entity)
            WITH e, e.born AS born
            WHERE born IS NOT NULL
            WITH e.name AS name, collect(DISTINCT born) AS births
            WHERE size(births) > 1
            RETURN name, births
        """)
        return list(contradictions)
    
    async def _check_duplicates(self):
        """检测重复实体"""
        # 名称相似度 > 0.9 的不同实体
        duplicates = self.graph.session().run("""
            MATCH (a:Entity), (b:Entity)
            WHERE id(a) < id(b)
              AND apoc.text.jaroWinklerDistance(a.name, b.name) > 0.9
            RETURN a.name, b.name,
                   apoc.text.jaroWinklerDistance(a.name, b.name) AS similarity
            ORDER BY similarity DESC
            LIMIT 100
        """)
        return list(duplicates)

# 质量仪表板指标:
# ├── 节点数: 1.2M (↑3% MTD)
# ├── 关系数: 4.5M (↑5% MTD)
# ├── 孤立节点: 0.3% (✅ < 1%)
# ├── 重复率: 0.1% (✅ < 0.5%)
# ├── 矛盾数: 12 (⚠️ 需审核)
# ├── 过期率: 8% (✅ < 10%)
# └── 综合评分: 94/100`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>💰 成本优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> cost.py</div>
                <pre className="fs-code">{`KG 成本分解与优化:

成本构成 (月度):
┌────────────────┬──────┬──────┐
│ 项目            │ 占比  │ 费用  │
├────────────────┼──────┼──────┤
│ LLM 调用 (抽取) │ 40%  │ $800 │
│ Neo4j 实例      │ 25%  │ $500 │
│ 向量 Embedding  │ 15%  │ $300 │
│ 存储 (SSD)      │ 10%  │ $200 │
│ 计算 (CDC/ETL)  │ 10%  │ $200 │
└────────────────┴──────┴──────┘
Total: ~$2000/月 (中等规模)

优化策略:

1. LLM 成本 (↓60%)
├── 批量抽取 (非实时)
├── gpt-4o-mini 替代 gpt-4o
├── 缓存已处理文档 hash
├── 分层: 简单用规则,复杂用LLM
└── 开源模型本地部署

2. 图数据库 (↓40%)
├── 冷热分层 (热:内存,冷:磁盘)
├── 归档历史图谱快照
├── 读写分离 (Read Replica)
└── 按需扩缩容

3. Embedding (↓50%)
├── 缓存热门实体 Embedding
├── 增量更新 (只嵌入新节点)
├── 降维 (3072→512, 损失<2%)
└── 本地模型 (BGE-M3)

4. 查询优化 (↓延迟)
├── 常用子图预计算
├── 热门路径查询缓存
├── 图算法结果物化
└── Cypher 查询优化`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 运维清单</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> 运维</div>
                <pre className="fs-code">{`KG 日常运维清单:

📅 每日:
├── ☐ 增量更新管线运行正常
├── ☐ 抽取质量 > 0.85
├── ☐ 查询延迟 P99 < 500ms
└── ☐ 错误日志检查

📅 每周:
├── ☐ 重复实体检测 & 合并
├── ☐ 低置信度知识审核
├── ☐ 新数据源接入验证
└── ☐ 成本报告

📅 每月:
├── ☐ 全量质量审计
├── ☐ Schema 演化评审
├── ☐ 过期知识清理
├── ☐ 备份验证
└── ☐ 性能基准测试

📅 每季度:
├── ☐ 本体论 (Ontology) 审查
├── ☐ 覆盖率评估
├── ☐ ROI 评估
├── ☐ 用户满意度调研
└── ☐ 技术栈升级评估

监控告警:
├── 增量管线延迟 > 1h → P2
├── 抽取质量 < 0.7 → P1
├── 查询错误率 > 1% → P1
├── 存储使用 > 80% → P2
└── 月成本超预算 → P3`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
