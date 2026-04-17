import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['NER 实体识别', '关系抽取', '三元组生成', '自动构建'];

export default function LessonKGExtraction() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🕸️ module_03 — LLM 驱动知识抽取</div>
      <div className="fs-hero">
        <h1>LLM 驱动知识抽取：自动构建知识图谱</h1>
        <p>
          传统知识图谱需要专家手工构建，成本极高。
          <strong>LLM 改变了这一切</strong>——GPT-4 可以从任意文本中自动提取实体、
          识别关系、生成三元组，让知识图谱构建效率提升 100 倍。
          本模块覆盖 NER 实体识别、LLM 关系抽取、结构化三元组生成、
          以及端到端自动知识图谱构建管线。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🤖 知识抽取</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 命名实体识别 (NER)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> ner_extraction.py</div>
                <pre className="fs-code">{`# —— LLM 驱动的命名实体识别 ——
from openai import OpenAI
import json

client = OpenAI()

async def extract_entities(text: str, entity_types: list = None) -> list:
    """用 LLM 从文本中提取命名实体"""
    
    default_types = [
        "Person", "Organization", "Location", "Product",
        "Technology", "Event", "Date", "Money"
    ]
    types = entity_types or default_types
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"""
从以下文本中提取所有命名实体。

实体类型: {', '.join(types)}

文本:
"{text}"

返回 JSON 数组:
[{{
  "text": "实体原文",
  "type": "实体类型",
  "normalized": "标准化名称",
  "description": "一句话描述",
  "confidence": 0.95
}}]

规则:
- 合并指代同一实体的不同表述 (如 "苹果公司" = "Apple")
- confidence < 0.7 的不要返回
- 嵌套实体分别提取 (如 "Apple CEO Tim Cook" → Apple + Tim Cook)
"""}],
        response_format={"type": "json_object"},
        temperature=0
    )
    
    return json.loads(response.choices[0].message.content)["entities"]

# 示例输入:
text = """
2024年6月，苹果公司CEO Tim Cook 在 WWDC 大会上发布了 Apple Intelligence。
该功能集成了 OpenAI 的 GPT-4o 模型，运行在 Apple Silicon M4 芯片上。
这标志着苹果正式进入生成式 AI 领域，与 Google Gemini 和 Microsoft Copilot 直接竞争。
"""

# 输出:
# [
#   {"text": "苹果公司", "type": "Organization", "normalized": "Apple Inc."},
#   {"text": "Tim Cook", "type": "Person", "normalized": "Tim Cook"},
#   {"text": "WWDC", "type": "Event", "normalized": "WWDC 2024"},
#   {"text": "Apple Intelligence", "type": "Product", "normalized": "Apple Intelligence"},
#   {"text": "OpenAI", "type": "Organization", "normalized": "OpenAI"},
#   {"text": "GPT-4o", "type": "Technology", "normalized": "GPT-4o"},
#   ...
# ]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 LLM 关系抽取 (Relation Extraction)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> relation_extraction.py</div>
                <pre className="fs-code">{`# —— LLM 驱动的关系抽取 ——

RELATION_SCHEMA = {
    "Person-Organization": [
        "FOUNDED", "CEO_OF", "WORKS_AT", "INVESTED_IN", "LEFT"
    ],
    "Organization-Product": [
        "PRODUCES", "LAUNCHED", "DISCONTINUED"
    ],
    "Organization-Organization": [
        "ACQUIRED", "COMPETES_WITH", "PARTNERS_WITH", "INVESTED_IN"
    ],
    "Product-Technology": [
        "USES", "BUILT_ON", "INTEGRATES"
    ],
    "Organization-Location": [
        "HEADQUARTERED_IN", "OPERATES_IN", "FOUNDED_IN"
    ]
}

async def extract_relations(text: str, entities: list) -> list:
    """从文本和实体中提取关系"""
    
    entity_names = [e["normalized"] for e in entities]
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"""
从以下文本中提取实体之间的关系。

已识别实体: {entity_names}

关系类型 Schema:
{json.dumps(RELATION_SCHEMA, ensure_ascii=False, indent=2)}

文本:
"{text}"

返回 JSON 数组:
[{{
  "subject": "主语实体",
  "predicate": "关系类型",
  "object": "宾语实体",
  "evidence": "支持该关系的原文片段",
  "confidence": 0.9,
  "temporal": "时间信息(如有)"
}}]

规则:
- 只提取文本中明确表达的关系, 不要推理
- predicate 必须来自 Schema
- 每条关系必须有证据 (evidence)
"""}],
        response_format={"type": "json_object"},
        temperature=0
    )
    
    return json.loads(response.choices[0].message.content)["relations"]

# 输出:
# [
#   {"subject": "Tim Cook", "predicate": "CEO_OF", "object": "Apple Inc.",
#    "evidence": "苹果公司CEO Tim Cook", "confidence": 0.98},
#   {"subject": "Apple Inc.", "predicate": "LAUNCHED", "object": "Apple Intelligence",
#    "evidence": "发布了 Apple Intelligence", "confidence": 0.95},
#   {"subject": "Apple Intelligence", "predicate": "INTEGRATES", "object": "GPT-4o",
#    "evidence": "集成了 OpenAI 的 GPT-4o", "confidence": 0.92},
#   {"subject": "Apple Inc.", "predicate": "COMPETES_WITH", "object": "Google",
#    "evidence": "与 Google Gemini 直接竞争", "confidence": 0.88},
# ]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔺 三元组生成 & 融合</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> triple_generation.py</div>
                <pre className="fs-code">{`# —— 三元组生成与去重融合 ——

class TripleGenerator:
    """从关系抽取结果生成标准化三元组"""
    
    def __init__(self, entity_resolver, neo4j_driver):
        self.resolver = entity_resolver
        self.driver = neo4j_driver
    
    async def generate_triples(self, text: str) -> list:
        """端到端: 文本 → 三元组"""
        
        # 1. 实体识别
        entities = await extract_entities(text)
        
        # 2. 实体消歧 & 链接 (Entity Resolution)
        resolved = []
        for entity in entities:
            # "苹果" → 是水果还是公司?
            # 通过上下文判断
            canonical = await self.resolver.resolve(
                entity, context=text
            )
            resolved.append(canonical)
        
        # 3. 关系抽取
        relations = await extract_relations(text, resolved)
        
        # 4. 生成三元组
        triples = []
        for rel in relations:
            triple = {
                "subject": {"id": self._entity_id(rel["subject"]),
                           "name": rel["subject"]},
                "predicate": rel["predicate"],
                "object": {"id": self._entity_id(rel["object"]),
                          "name": rel["object"]},
                "metadata": {
                    "source": text[:100],
                    "confidence": rel["confidence"],
                    "extracted_at": datetime.now().isoformat(),
                    "temporal": rel.get("temporal")
                }
            }
            triples.append(triple)
        
        # 5. 去重 (与已有图谱对比)
        new_triples = await self._deduplicate(triples)
        
        return new_triples
    
    async def _deduplicate(self, triples):
        """去重: 避免重复插入已有知识"""
        new = []
        for t in triples:
            exists = self.driver.session().run("""
                MATCH (s {id: $sid})-[r]->(o {id: $oid})
                WHERE type(r) = $rel
                RETURN count(r) > 0 AS exists
            """, sid=t["subject"]["id"], oid=t["object"]["id"],
               rel=t["predicate"])
            
            if not exists.single()["exists"]:
                new.append(t)
        return new

# 实体消歧策略:
# 1. 字符串匹配 + 编辑距离
# 2. 上下文 Embedding 相似度
# 3. 知识库链接 (Wikidata ID)
# 4. LLM 判断 (最后手段)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🏭 端到端 KG 构建管线</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> pipeline</div>
                <pre className="fs-code">{`KG 自动构建管线:

┌─────────────────────┐
│   原始数据源          │
│  文档/网页/PDF/API   │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  1. 文档预处理       │
│  分块 / 清洗 / OCR   │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  2. NER 实体抽取     │
│  LLM + spaCy 混合    │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  3. 实体消歧与链接   │
│  去重/合并/Wikidata  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  4. 关系抽取         │
│  LLM + Schema 约束   │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  5. 三元组验证       │
│  置信度过滤/人工审核 │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  6. 写入 Neo4j       │
│  MERGE 幂等写入      │
└─────────────────────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 质量控制</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> quality</div>
                <pre className="fs-code">{`KG 构建质量控制:

精确率 vs 召回率权衡:
┌──────────┬──────────┬───────┐
│ 策略      │ 精确率    │ 召回率 │
├──────────┼──────────┼───────┤
│ 高置信度  │ 95%+     │ 60%   │
│ 中置信度  │ 85%      │ 80%   │
│ 低置信度  │ 70%      │ 95%   │
└──────────┴──────────┴───────┘

推荐: 高精确率 + 人工补充

质量指标:
├── 实体覆盖率
│   └── 已知实体被识别的比例
├── 关系准确率
│   └── 抽取关系的正确比例
├── 消歧准确率
│   └── 实体链接的正确比例
├── 图谱连通性
│   └── 最大连通分量占比
└── 新鲜度
    └── 知识更新延迟

人机协同:
├── LLM 自动抽取 (80%)
├── 低置信度 → 人工审核 (15%)
├── 关键实体 → 专家验证 (5%)
└── 反馈循环优化 Prompt`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
