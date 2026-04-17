import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['多跳推理', '推理链', '因果分析', '复杂 QA'];

export default function LessonMultiHopReasoning() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🕸️ module_06 — 多跳推理</div>
      <div className="fs-hero">
        <h1>多跳推理：让 AI 像侦探一样追踪线索</h1>
        <p>
          "马斯克投资的公司的竞争对手的CEO是谁？"——这个问题需要 3 跳推理。
          传统搜索无法回答，但<strong>知识图谱 + LLM</strong> 可以沿着关系链逐步推理。
          本模块覆盖多跳路径查询、LLM 推理链构建、因果关系分析、
          以及 HotpotQA/MultiRC 级别的复杂多步 QA。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧠 推理</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 多跳推理原理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> multi_hop.py</div>
                <pre className="fs-code">{`# —— 知识图谱多跳推理 ——

class MultiHopReasoner:
    """知识图谱上的多跳推理器"""
    
    async def reason(self, query: str, max_hops: int = 4):
        """多跳推理主流程"""
        
        # 1. 问题分解 (Decompose)
        sub_questions = await self.decompose_question(query)
        # "马斯克投资的公司的竞品CEO是谁?"
        # → Q1: "马斯克投资了哪些公司?"
        # → Q2: "这些公司的竞争对手是?"
        # → Q3: "竞争对手的CEO是谁?"
        
        # 2. 逐跳推理 (Hop by Hop)
        context = {}
        reasoning_chain = []
        
        for i, sub_q in enumerate(sub_questions):
            # 提取当前跳需要的起始实体
            start_entities = self._get_entities_from_context(sub_q, context)
            
            # 在图上查询
            hop_results = await self.graph_query(start_entities, sub_q)
            
            # 记录推理链
            reasoning_chain.append({
                "hop": i + 1,
                "question": sub_q,
                "start_entities": start_entities,
                "found_entities": hop_results,
                "evidence": self._collect_evidence(hop_results)
            })
            
            # 更新上下文 (下一跳的输入)
            context[f"hop_{i+1}"] = hop_results
        
        # 3. 综合回答
        answer = await self.synthesize(query, reasoning_chain)
        
        return {
            "answer": answer,
            "reasoning_chain": reasoning_chain,
            "hops": len(sub_questions),
            "confidence": self._chain_confidence(reasoning_chain)
        }
    
    async def graph_query(self, entities, question):
        """在图上执行单跳查询"""
        results = []
        for entity in entities:
            # 动态 Cypher 生成
            cypher = await self.generate_cypher(entity, question)
            # 例: MATCH (e {name:$name})-[:INVESTED_IN]->(c) RETURN c
            
            records = self.graph.session().run(cypher, name=entity)
            results.extend([r["c"]["name"] for r in records])
        
        return list(set(results))

# 推理链示例:
# Q: "马斯克投资的公司的竞品CEO是谁?"
# 
# Hop 1: 马斯克 -[:INVESTED_IN]-> [Tesla, SpaceX, xAI]
# Hop 2: Tesla -[:COMPETES_WITH]-> [BYD, Rivian, Lucid]
#         SpaceX -[:COMPETES_WITH]-> [Blue Origin]
# Hop 3: BYD -[:CEO]-> 王传福
#         Rivian -[:CEO]-> RJ Scaringe
#         Blue Origin -[:CEO]-> Jeff Bezos
# 
# Answer: 王传福(BYD), RJ Scaringe(Rivian), Jeff Bezos(Blue Origin)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⛓️ LLM + KG 推理链 (Chain of Knowledge)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> chain_of_knowledge.py</div>
                <pre className="fs-code">{`# —— Chain of Knowledge: LLM + KG 联合推理 ——

class ChainOfKnowledge:
    """
    CoK: 将 Chain-of-Thought 和 Knowledge Graph 结合
    每一步推理都有 KG 事实支撑
    """
    
    async def reason(self, query: str):
        """带知识支撑的推理链"""
        
        reasoning_prompt = f"""
你是一个推理专家。请用以下格式逐步推理:

问题: {query}

推理格式:
Step 1: [推理步骤描述]
  知识查询: [需要查什么知识]
  知识结果: [等待知识图谱返回]
  推理结论: [基于知识的结论]

Step 2: ...

最终答案: ...

注意: 每步推理必须有知识图谱事实支撑, 不要凭空推断。
"""
        
        # 交互式推理 (LLM ↔ KG 交替)
        steps = []
        current_context = ""
        
        for step_num in range(1, 6):  # 最多 5 步
            # LLM 生成推理步骤和知识需求
            step = await self.llm.generate(
                reasoning_prompt + current_context +
                f"\\n\\n请生成 Step {step_num}:"
            )
            
            # 解析知识查询需求
            kg_query = self._parse_kg_query(step)
            
            if kg_query:
                # 在 KG 中查询
                kg_result = await self.query_knowledge_graph(kg_query)
                step = step.replace("[等待知识图谱返回]", str(kg_result))
            
            steps.append(step)
            current_context += f"\\n{step}"
            
            # 检查是否已得出最终答案
            if "最终答案" in step:
                break
        
        return {
            "reasoning_chain": steps,
            "final_answer": self._extract_answer(steps[-1]),
            "kg_facts_used": self._count_facts(steps),
            "confidence": self._assess_confidence(steps)
        }

# 示例:
# Q: "为什么 iPhone 的竞争对手在中国市场增长更快?"
#
# Step 1: 首先确定 iPhone 的主要竞争对手
#   知识查询: iPhone → COMPETES_WITH → ?
#   知识结果: [华为 Mate, 小米, OPPO, vivo]
#   推理: 需要比较这些品牌在中国市场的表现
#
# Step 2: 查询各品牌在中国的市场份额趋势
#   知识查询: 各品牌 → MARKET_SHARE → 中国 (2023-2024)
#   知识结果: 华为 +15%, Apple -3%
#   推理: 华为增长最快, 可能与制裁解除有关
#
# Step 3: 分析华为增长的原因
#   知识查询: 华为 → LAUNCHED → 2024 → [Mate 60 Pro]
#   知识结果: 华为自研麒麟9000s芯片突破
#   推理: 技术自主 + 国产替代情绪 → 增长引擎`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔍 因果分析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> causal.py</div>
                <pre className="fs-code">{`# 因果关系推理

class CausalReasoner:
    """知识图谱上的因果推理"""
    
    # 因果关系类型
    CAUSAL_RELS = [
        "CAUSES", "LEADS_TO", "ENABLES",
        "PREVENTS", "AFFECTS", "RESULTS_IN"
    ]
    
    async def find_causal_chain(self, cause, effect):
        """寻找因果链路"""
        
        # 在图上搜索因果路径
        result = self.graph.session().run("""
            MATCH path = (cause {name: $cause})
                  -[:CAUSES|LEADS_TO|ENABLES*1..5]->
                  (effect {name: $effect})
            RETURN path
            ORDER BY length(path)
            LIMIT 5
        """, cause=cause, effect=effect)
        
        return [self._format_path(r["path"]) for r in result]
    
    async def what_if(self, entity, change):
        """假设推理: 如果 X 改变, 会影响什么?"""
        
        # 沿因果链正向传播
        impacts = self.graph.session().run("""
            MATCH (e {name: $entity})
                  -[:CAUSES|LEADS_TO|AFFECTS*1..3]->
                  (impacted)
            RETURN impacted.name, length(path) AS distance
            ORDER BY distance
        """, entity=entity)
        
        return impacts

# 示例: "加息 → ? → ?"
# 加息 → 借贷成本↑ → 企业利润↓
# 加息 → 美元升值 → 出口竞争力↓
# 加息 → 房贷利率↑ → 房价↓`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🧩 推理模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> patterns</div>
                <pre className="fs-code">{`知识图谱推理模式:

1️⃣ 跨类型推理
"哪些物理学家也是企业家?"
MATCH (p:Physicist)-[:FOUNDED]->(c:Company)
RETURN p.name, c.name
→ Elon Musk (Physics → Tesla)

2️⃣ 时序推理
"在 iPhone 发布之前, 诺基亚做了什么?"
MATCH (event1)-[:BEFORE]->(event2)
WHERE event2.name = "iPhone发布"
→ 诺基亚推出 N95 (2006)

3️⃣ 反事实推理
"如果没有 CUDA, AI 发展会怎样?"
→ 沿反向因果链分析:
  CUDA → GPU训练 → 深度学习爆发
  无CUDA → 可能延迟 5-10 年

4️⃣ 类比推理
"A 之于 B, 如同 C 之于 ?"
TransE: h_A - h_B ≈ h_C - h_?
→ 解出h_? 最近邻实体

5️⃣ 规则推理
IF (X)-[:PARENT]->(Y) AND
   (Y)-[:PARENT]->(Z)
THEN (X)-[:GRANDPARENT]->(Z)

6️⃣ 缺失链接预测
已知: (A)-[:FRIEND]->(B)
      (B)-[:FRIEND]->(C)
预测: (A)-[:FRIEND]->(C) ?
→ 用 KG Embedding 评分`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏆 复杂多步 QA 系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> complex_qa.py</div>
                <pre className="fs-code">{`# —— 复杂多步 QA: HotpotQA 级别 ——

class ComplexQASystem:
    """处理复杂多步推理问题"""
    
    QUESTION_TYPES = {
        "比较": "比较两个实体的某个属性",
        "桥接": "通过中间实体连接两个不直接相关的事物",
        "聚合": "需要汇总多个实体的信息",
        "时序": "涉及时间顺序的推理",
        "因果": "需要推理因果关系",
        "反事实": "假设性推理"
    }
    
    async def answer(self, query: str):
        """分类问题类型 → 选择推理策略"""
        
        # 1. 问题类型分类
        q_type = await self.classify_question(query)
        
        # 2. 根据类型选择推理策略
        strategies = {
            "比较": self._comparison_reasoning,
            "桥接": self._bridge_reasoning,
            "聚合": self._aggregation_reasoning,
            "时序": self._temporal_reasoning,
            "因果": self._causal_reasoning,
        }
        
        strategy = strategies.get(q_type, self._general_reasoning)
        result = await strategy(query)
        
        return result
    
    async def _bridge_reasoning(self, query):
        """桥接推理: A→B→C 链式"""
        # Q: "Tim Cook 领导的公司的创始人是哪所大学毕业的?"
        # Hop1: Tim Cook → CEO_OF → Apple
        # Hop2: Apple → FOUNDED_BY → 乔布斯
        # Hop3: 乔布斯 → STUDIED_AT → Reed College
        # Answer: Reed College
        pass
    
    async def _comparison_reasoning(self, query):
        """比较推理: 对比两个实体"""
        # Q: "Google 和 Microsoft 谁在 AI 领域投资更多?"
        # Step1: 查询 Google AI 投资 (DeepMind, Anthropic...)
        # Step2: 查询 Microsoft AI 投资 (OpenAI, Inflection...)
        # Step3: 对比金额/数量/领域
        pass

# HotpotQA 基准:
# 2跳问题: F1 ≈ 0.85 (知识图谱增强后)
# 3跳问题: F1 ≈ 0.72
# 4跳问题: F1 ≈ 0.58 (开放挑战)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
