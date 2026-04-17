import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['金融 KG', '医疗 KG', '法律 KG', '选型指南'];

export default function LessonIndustryKG() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🕸️ module_07 — 行业知识图谱</div>
      <div className="fs-hero">
        <h1>行业知识图谱：金融 / 医疗 / 法律 实战</h1>
        <p>
          通用知识图谱解决 80% 的问题，但行业需要<strong>领域深度</strong>。
          金融 KG 追踪企业关联和风险传导，医疗 KG 连接疾病-症状-药物-基因，
          法律 KG 关联法规-判例-实体。
          本模块覆盖三大行业知识图谱的本体设计、数据源接入、特殊推理需求，
          以及落地时的 ROI 评估方法。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🏭 行业 KG</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💰 金融知识图谱</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> finance_kg.cypher</div>
                <pre className="fs-code">{`// —— 金融知识图谱: 企业关联与风险传导 ——

// 本体设计 (Ontology)
// 节点类型:
// (:Company)     — 企业 {名称, 统一社会信用代码, 行业, 注册资本}
// (:Person)      — 人物 {姓名, 身份证号, 职位}
// (:Fund)        — 基金 {名称, 规模, 类型}
// (:Stock)       — 股票 {代码, 交易所}
// (:Risk)        — 风险事件 {类型, 等级, 日期}
// (:Industry)    — 行业 {名称, 分类代码}

// 关系类型:
// SHAREHOLDER    — 持股 {比例, 类型}
// DIRECTOR       — 任职 {职位, 起始}
// GUARANTEES     — 担保 {金额, 期限}
// SUPPLIES_TO    — 供应商 {金额占比}
// INVESTS_IN     — 投资 {金额, 轮次}
// HAS_RISK       — 存在风险 {类型}
// CONTROLS       — 实际控制

// 场景 1: 企业关联穿透
// "查找 A 公司的实际控制人及其控制的所有企业"
MATCH path = (person:Person)-[:CONTROLS*1..5]->(target:Company {name: "A公司"})
RETURN person, path

// 场景 2: 担保链风险传导
// "如果 B 公司违约, 哪些公司会受影响?"
MATCH (b:Company {name: "B公司"})<-[:GUARANTEES*1..4]-(affected:Company)
RETURN affected.name, length(path) AS 风险距离
ORDER BY 风险距离

// 场景 3: 供应链分析
// "Intel 芯片断供影响链"
MATCH (intel:Company {name: "Intel"})
      <-[:SUPPLIES_TO*1..3]-(downstream:Company)
RETURN downstream.name, downstream.industry

// 场景 4: 隐性关联发现
// "表面无关联, 但通过人物/基金间接关联的企业"
MATCH (a:Company {name: "A"})<-[:SHAREHOLDER|DIRECTOR*1..3]->
      ()-[:SHAREHOLDER|DIRECTOR*1..3]->(b:Company {name: "B"})
WHERE a <> b
RETURN DISTINCT path

// 数据源:
// 天眼查/企查查 → 工商数据
// Wind/Bloomberg → 财务数据
// 法院公告 → 诉讼/失信
// 新闻 → 舆情事件
// 年报 → 关联交易`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏥 医疗知识图谱</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> medical_kg</div>
                <pre className="fs-code">{`// —— 医疗知识图谱: 疾病-症状-药物-基因 ——

// 本体设计:
// (:Disease)     — 疾病 {ICD-10编码, 描述, 科室}
// (:Symptom)     — 症状 {描述, 严重程度}
// (:Drug)        — 药物 {通用名, 商品名, ATC编码}
// (:Gene)        — 基因 {名称, 位置, 功能}
// (:Protein)     — 蛋白质 {名称, 结构}
// (:Treatment)   — 治疗方案 {类型, 证据等级}
// (:ClinicalTrial) — 临床试验 {NCT编号, 阶段}

// 关系:
// HAS_SYMPTOM       — 表现症状 {频率, 权重}
// TREATS            — 治疗 {一线/二线, 证据等级}
// INTERACTS_WITH    — 药物相互作用 {类型, 严重性}
// ASSOCIATED_GENE   — 关联基因 {OR值, p-value}
// CONTRAINDICATED   — 禁忌症
// CAUSES            — 引起 (副作用)

// 场景 1: 辅助诊断
// "患者有发热、咳嗽、胸痛, 可能是什么病?"
MATCH (d:Disease)-[:HAS_SYMPTOM]->(s:Symptom)
WHERE s.name IN ["发热", "咳嗽", "胸痛"]
WITH d, count(s) AS matched, collect(s.name) AS symptoms
ORDER BY matched DESC
RETURN d.name, matched, symptoms LIMIT 10

// 场景 2: 药物相互作用检查
// "阿司匹林和华法林能一起吃吗?"
MATCH (d1:Drug {name: "阿司匹林"})
      -[r:INTERACTS_WITH]-
      (d2:Drug {name: "华法林"})
RETURN r.type, r.severity, r.mechanism
// → 严重: 增加出血风险

// 场景 3: 基因-疾病-药物通路
// "BRCA1 基因突变 → 相关疾病 → 靶向药物"
MATCH (g:Gene {name: "BRCA1"})
      -[:ASSOCIATED_GENE]->(d:Disease)
      <-[:TREATS]-(drug:Drug)
WHERE drug.type = "靶向"
RETURN d.name, drug.name, drug.mechanism

// 数据源:
// UMLS (统一医学语言系统) — 130 万概念
// SNOMED CT — 35 万临床术语
// DrugBank — 药物数据
// OMIM — 基因-疾病
// PubMed — 文献挖掘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ 法律知识图谱</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> legal_kg</div>
                <pre className="fs-code">{`// —— 法律知识图谱: 法规-判例-实体 ——

// 本体设计:
// (:Law)          — 法律法规 {名称, 级别, 生效日期}
// (:Article)      — 法条 {条文号, 内容}
// (:Case)         — 判例 {案号, 法院, 日期, 结果}
// (:Party)        — 当事人 {名称, 角色}
// (:Judge)        — 法官 {姓名, 法院}
// (:LegalConcept) — 法律概念 {定义, 适用范围}
// (:Evidence)     — 证据 {类型, 描述}

// 关系:
// REFERENCES      — 引用法条
// SUPERSEDES      — 替代/修订
// SIMILAR_TO      — 类似判例
// RULED_BY        — 审判法官
// INVOLVES        — 涉及当事人
// DEFINES         — 定义概念
// APPLIED_IN      — 适用于

// 场景 1: 类案检索 (Graph-Enhanced)
// "商标侵权+惩罚性赔偿, 类似判例?"
MATCH (c:Case)-[:REFERENCES]->(a:Article)
WHERE a.content CONTAINS "商标侵权"
  AND a.content CONTAINS "惩罚性赔偿"
WITH c
MATCH (c)-[:INVOLVES]->(p:Party)
RETURN c.case_number, c.result, c.court, c.date
ORDER BY c.date DESC

// 场景 2: 法条关联分析
// "引用《民法典》第1024条的所有判例的判决趋势"
MATCH (a:Article {law: "民法典", number: "1024"})
      <-[:REFERENCES]-(c:Case)
WITH c.year AS year, c.result AS result, count(*) AS cnt
RETURN year, result, cnt
ORDER BY year

// 场景 3: 合同条款风险检查
// 用 LLM 抽取合同实体 → 在法律 KG 中验证合规性
// "该竞业限制条款是否超过法定24个月上限?"
MATCH (concept:LegalConcept {name: "竞业限制"})
      -[:DEFINED_BY]->(article:Article)
RETURN article.content
// → "竞业限制期限不得超过二年" (劳动合同法第24条)

// 数据源:
// 中国裁判文书网 — 1亿+ 判例
// 法信 — 法律法规库
// 北大法宝 — 学术分析
// 合同文本 — LLM 抽取`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🗺️ 行业 KG 选型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> 选型指南</div>
                <pre className="fs-code">{`行业 KG 图数据库选型:

┌──────────┬────────┬────────┬────────┐
│          │ Neo4j  │ Neptune│ TigerG │
├──────────┼────────┼────────┼────────┤
│ 规模     │ 中     │ 大     │ 超大   │
│ 查询     │ Cypher │ SPARQL │ GSQL   │
│ 托管     │ Aura   │ AWS    │ 自建   │
│ 成本     │ 中     │ 按需   │ 高     │
│ 向量支持 │ 5.x ✅ │ ✅     │ ❌     │
│ 社区     │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐  │ ⭐⭐    │
│ 适合     │ 通用   │ AWS   │ 超大图 │
└──────────┴────────┴────────┴────────┘

推荐:
• 中小型 (<1亿节点): Neo4j
• AWS 生态: Amazon Neptune
• 超大规模: TigerGraph
• 轻量嵌入: Memgraph`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 ROI 评估</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> ROI</div>
                <pre className="fs-code">{`行业 KG ROI 评估:

投入:
├── 本体设计: 2-4 周
├── 数据源接入: 4-8 周
├── KG 构建: 4-12 周
├── 应用开发: 4-8 周
├── 基础设施: ~$2-5K/月
└── 总计: 3-6 个月

产出:
金融:
├── 风控效率 ↑ 40-60%
├── 关联发现 ↑ 300%
└── 审查时间 ↓ 50%

医疗:
├── 诊断辅助准确率 ↑ 20%
├── 药物交互检查 ↑ 90%
└── 文献检索效率 ↑ 60%

法律:
├── 类案检索 ↑ 200%
├── 合同审查 ↓ 70% 时间
└── 合规覆盖率 ↑ 80%

关键成功因素:
✅ 领域专家深度参与
✅ 高质量数据源
✅ 清晰的业务场景
✅ 增量构建 (MVP first)
❌ 避免: 追求完美后上线`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
