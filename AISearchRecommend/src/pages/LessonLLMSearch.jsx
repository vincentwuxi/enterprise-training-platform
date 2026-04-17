import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Query 理解', 'RAG 搜索', '对话式检索', 'Agentic Search'];

export default function LessonLLMSearch() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🔍 module_05 — LLM 增强搜索</div>
      <div className="fs-hero">
        <h1>LLM 增强搜索：AI 重新定义检索</h1>
        <p>
          LLM 不只是生成文本——它能<strong>理解查询意图</strong>、<strong>改写模糊查询</strong>、
          <strong>分解复杂问题</strong>、<strong>综合多源结果</strong>。
          本模块覆盖 Query 理解 → RAG 搜索管线 → 对话式检索 → Agentic Search（Agent 自主搜索），
          构建下一代 AI-Native 搜索引擎。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧠 LLM + 搜索</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 LLM Query 理解系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> query_understanding.py</div>
                <pre className="fs-code">{`# —— LLM 驱动的 Query 理解 ——
from openai import OpenAI

client = OpenAI()

class QueryUnderstanding:
    """用 LLM 理解和增强用户查询"""
    
    async def analyze(self, query: str) -> dict:
        """一次调用完成全部理解"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": f"""
分析以下搜索查询，返回 JSON:

查询: "{query}"

返回:
{{
  "intent": "informational|navigational|transactional",
  "entities": ["提取的实体"],
  "topic": "主题分类",
  "is_ambiguous": true/false,
  "expanded_queries": ["改写/扩展的查询变体"],
  "filters": {{"category": null, "date_range": null, "language": null}},
  "sub_questions": ["如果是复杂问题，分解为子问题"]
}}"""}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    
    async def rewrite(self, query: str, context: str = "") -> list[str]:
        """查询改写: 生成多个搜索变体"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": f"""
为以下查询生成 5 个语义等价但表达不同的搜索查询:
原始查询: "{query}"
{f"对话上下文: {context}" if context else ""}

返回 JSON 数组: ["query1", "query2", ...]
"""}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)["queries"]
    
    async def decompose(self, query: str) -> list[str]:
        """复杂查询分解: 拆分为可独立检索的子问题"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": f"""
将以下复杂问题分解为 2-4 个独立的子问题:
问题: "{query}"

每个子问题应该可以独立搜索回答。返回 JSON 数组。
"""}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)["sub_questions"]

# 示例:
# 输入: "对比 React 和 Vue 哪个更适合大型项目"
# 分解:
#   1. "React 在大型项目中的优势和劣势"
#   2. "Vue 在大型项目中的优势和劣势"
#   3. "React vs Vue 性能对比"
#   4. "React vs Vue 生态系统和社区支持"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 生产级 RAG 搜索管线</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> rag_pipeline.py</div>
                <pre className="fs-code">{`# —— 生产级 RAG 搜索: 检索增强生成 ——

class ProductionRAGPipeline:
    """生产级 RAG 搜索管线"""
    
    def __init__(self, search_engine, reranker, llm):
        self.search = search_engine
        self.reranker = reranker
        self.llm = llm
        self.query_engine = QueryUnderstanding()
    
    async def answer(self, query: str, history: list = None) -> dict:
        """端到端 RAG 回答"""
        
        # 1. Query 理解与多视角扩展
        analysis = await self.query_engine.analyze(query)
        queries = [query] + analysis.get("expanded_queries", [])
        
        # 2. 子问题分解 (复杂查询)
        if analysis.get("sub_questions"):
            queries.extend(analysis["sub_questions"])
        
        # 3. 多查询并行检索
        all_chunks = []
        for q in queries[:5]:  # 最多 5 个查询
            results = await self.search.hybrid_search(
                q, top_k=20, alpha=0.6
            )
            all_chunks.extend(results)
        
        # 4. 去重 + Reranking
        unique_chunks = self._deduplicate(all_chunks)
        reranked = await self.reranker.rerank(
            query=query,
            documents=[c.text for c in unique_chunks],
            top_k=8
        )
        
        # 5. 上下文窗口优化 (按相关性截断)
        context = self._build_context(reranked, max_tokens=4000)
        
        # 6. LLM 生成回答 (含引用)
        answer = await self.llm.generate(
            system="""你是一个精准的搜索助手。
基于提供的参考资料回答问题。
- 必须引用来源 [1][2]...
- 不确定的内容标注"不确定"
- 无法回答时明确说明""",
            user=f"问题: {query}\\n\\n参考资料:\\n{context}",
            temperature=0.1
        )
        
        # 7. 幻觉检测
        hallucination_score = await self._check_hallucination(
            answer, reranked
        )
        
        return {
            "answer": answer,
            "sources": [{"text": c.text, "score": c.score} for c in reranked[:5]],
            "hallucination_risk": hallucination_score,
            "query_analysis": analysis
        }`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💬 对话式检索引擎</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> conversational_search.py</div>
                <pre className="fs-code">{`# —— 对话式检索: 多轮搜索交互 ——

class ConversationalSearch:
    """支持多轮上下文的对话式搜索"""
    
    def __init__(self, rag_pipeline, llm):
        self.rag = rag_pipeline
        self.llm = llm
        self.sessions = {}
    
    async def chat(self, session_id: str, message: str) -> dict:
        """处理对话式搜索请求"""
        
        # 获取或创建会话
        session = self.sessions.setdefault(session_id, {
            "history": [],
            "context_stack": []
        })
        
        # 1. 指代消解 (Coreference Resolution)
        resolved_query = await self._resolve_coreference(
            message, session["history"]
        )
        # "它的价格是多少" → "iPhone 16 Pro Max 的价格是多少"
        
        # 2. 判断是否需要新检索
        needs_search = await self._needs_new_search(
            resolved_query, session
        )
        
        if needs_search:
            # 3. RAG 检索回答
            result = await self.rag.answer(
                resolved_query,
                history=session["history"]
            )
            session["context_stack"].append(result["sources"])
        else:
            # 直接用已有上下文回答
            result = await self._answer_from_context(
                resolved_query, session
            )
        
        # 4. 更新历史
        session["history"].append({"role": "user", "content": message})
        session["history"].append({"role": "assistant", "content": result["answer"]})
        
        # 5. 生成追问建议
        follow_ups = await self._suggest_follow_ups(
            resolved_query, result["answer"]
        )
        
        return {
            "answer": result["answer"],
            "sources": result.get("sources", []),
            "follow_up_suggestions": follow_ups,
            "resolved_query": resolved_query
        }
    
    async def _resolve_coreference(self, query, history):
        """用 LLM 解析指代词"""
        if not history:
            return query
        
        resp = await self.llm.generate(
            system="根据对话历史,将查询中的指代词替换为具体实体,返回改写后的查询",
            user=f"历史: {history[-4:]}\\n当前: {query}"
        )
        return resp.strip()`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🤖 Agentic Search</h3>
              <span className="fs-tag purple">Next-Gen</span>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> agentic_search</div>
                <pre className="fs-code">{`Agentic Search 架构:
AI Agent 自主规划搜索策略

┌─────────────────────────┐
│      用户复杂问题         │
│ "对比 2024 年中美 AI 政策 │
│  对创业公司的影响"         │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  1. Agent 规划搜索策略    │
│  ├── 分解子问题          │
│  ├── 选择搜索工具        │
│  └── 规划执行顺序        │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  2. 多工具并行搜索       │
│  ├── 内部知识库 (RAG)    │
│  ├── 互联网搜索 (Tavily) │
│  ├── 学术论文 (Semantic) │
│  └── 新闻数据 (News API) │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  3. 结果评估与迭代       │
│  ├── 信息充分? → 综合   │
│  ├── 信息不足? → 补搜   │
│  └── 有矛盾?   → 验证   │
└───────────┬─────────────┘
            ▼
      综合分析报告`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔧 搜索工具编排</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> tools</div>
                <pre className="fs-code">{`Agentic Search 工具集:

搜索工具:
├── vector_search(query, filters)
│   └── 内部知识库语义搜索
├── web_search(query)
│   └── Tavily/Serper 互联网搜索
├── academic_search(query)
│   └── Semantic Scholar API
├── news_search(query, date_range)
│   └── 新闻聚合搜索
└── code_search(query, repo)
    └── 代码库搜索

分析工具:
├── compare(items, criteria)
│   └── 对比分析
├── summarize(documents)
│   └── 长文本摘要
├── fact_check(claim, sources)
│   └── 事实核查
└── synthesize(results)
    └── 多源综合

质量工具:
├── evaluate_relevance(query, docs)
│   └── 相关性评分
├── detect_contradiction(docs)
│   └── 矛盾检测
└── assess_freshness(docs)
    └── 时效性评估`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
