import React from 'react';
import './LessonCommon.css';

export default function LessonAgentCost() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">💰 模块六：Agent 成本工程 — Token 优化 / 缓存 / 模型路由 / 预算控制</h1>
      <p className="lesson-subtitle">
        Agent 能力越强花钱越多——用工程手段在质量和成本间找到最优解
      </p>

      <section className="lesson-section">
        <h2>1. Agent 成本结构解析</h2>
        <div className="concept-card">
          <h3>💸 Agent 请求的成本构成</h3>
          <div className="code-block">
{`# 一个典型 Agent 请求的成本分解
"""
用户问题: "帮我查一下上个月的销售报表"

  ┌─────────────────────────────────────────┐
  │ LLM 调用 #1 (意图识别)                   │
  │ GPT-4o-mini: 500 input + 50 output      │
  │ 成本: $0.0001                            │
  ├─────────────────────────────────────────┤
  │ RAG 检索 (知识库)                        │
  │ Embedding: 500 tokens × $0.02/1M         │
  │ 向量检索: $0.0001                        │
  ├─────────────────────────────────────────┤
  │ LLM 调用 #2 (生成 SQL)                   │
  │ GPT-4o: 2000 input + 200 output          │
  │ 成本: $0.006                             │
  ├─────────────────────────────────────────┤
  │ 工具调用 (数据库查询)                     │
  │ DB 计算: ~$0.001                         │
  ├─────────────────────────────────────────┤
  │ LLM 调用 #3 (结果解读 + 可视化)          │
  │ GPT-4o: 3000 input + 500 output          │
  │ 成本: $0.01                              │
  ├─────────────────────────────────────────┤
  │ 总成本: ~$0.017 / 请求                   │
  │ 日均 1000 请求 → $17/天 → $510/月       │
  └─────────────────────────────────────────┘

成本分布 (典型):
  LLM 调用:     70-85%  ← 主要优化目标
  向量检索:     5-15%
  工具调用:     5-10%
  基础设施:     5-10%
"""

# 模型价格对比 (2026 年)
model_pricing = {
    "gpt-4o":         {"input": 2.50, "output": 10.00},    # $/M tokens
    "gpt-4o-mini":    {"input": 0.15, "output": 0.60},
    "claude-sonnet":  {"input": 3.00, "output": 15.00},
    "claude-haiku":   {"input": 0.25, "output": 1.25},
    "gemini-2-flash": {"input": 0.075, "output": 0.30},
    "deepseek-v3":    {"input": 0.27, "output": 1.10},
    "qwen-plus":      {"input": 0.50, "output": 2.00},
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 智能模型路由</h2>
        <div className="concept-card">
          <h3>🔀 按复杂度/风险动态选择模型</h3>
          <div className="code-block">
{`# 模型路由: 简单问题用便宜模型, 复杂问题用贵模型
class SmartModelRouter:
    """基于请求特征的智能模型路由"""
    
    ROUTES = {
        "tier_1_fast": {
            "model": "gpt-4o-mini",
            "cost_per_1k": 0.00015,
            "criteria": ["简单问答", "闲聊", "格式转换"]
        },
        "tier_2_balanced": {
            "model": "gpt-4o",
            "cost_per_1k": 0.0025,
            "criteria": ["数据分析", "报告生成", "一般工具调用"]
        },
        "tier_3_premium": {
            "model": "claude-sonnet-4-20250514",
            "cost_per_1k": 0.003,
            "criteria": ["复杂推理", "代码生成", "高风险决策"]
        }
    }
    
    def __init__(self):
        self.classifier = self._load_complexity_classifier()
    
    def route(self, request: dict) -> str:
        # 策略 1: 基于任务复杂度分类
        complexity = self.classifier.predict(request["message"])
        
        # 策略 2: 基于历史表现
        if request.get("retry_count", 0) > 0:
            # 重试时升级模型
            return self._upgrade_model(request["current_model"])
        
        # 策略 3: 基于用户等级
        if request.get("user_tier") == "premium":
            return "tier_3_premium"
        
        # 策略 4: 基于预算剩余
        if self._budget_remaining() < 0.2:  # 预算不足 20%
            return "tier_1_fast"
        
        return f"tier_{complexity}"

# 成本节省效果 (示例)
"""
优化前: 所有请求用 GPT-4o
  1000 req/天 × 3000 tokens × $2.5/M = $7.5/天

优化后: 智能路由
  600 req (简单) × 1000 tokens × $0.15/M = $0.09
  300 req (中等) × 3000 tokens × $2.5/M  = $2.25
  100 req (复杂) × 5000 tokens × $3/M    = $1.50
  总计: $3.84/天 → 节省 49%
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 语义缓存</h2>
        <div className="concept-card">
          <h3>📦 LLM 语义缓存系统</h3>
          <div className="code-block">
{`# 语义缓存: 相似问题直接返回缓存结果
import hashlib
from sentence_transformers import SentenceTransformer
import redis
import numpy as np

class SemanticCache:
    """基于语义相似度的 LLM 缓存"""
    
    def __init__(self, similarity_threshold=0.95):
        self.encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self.redis = redis.Redis()
        self.threshold = similarity_threshold
        self.stats = {"hits": 0, "misses": 0}
    
    def get(self, query: str) -> str | None:
        """查找语义相似的缓存"""
        query_emb = self.encoder.encode(query)
        
        # 搜索相似 query (Redis Vector Search)
        results = self.redis.ft("cache_idx").search(
            f"*=>[KNN 5 @embedding $vec AS score]",
            query_params={"vec": query_emb.tobytes()}
        )
        
        for doc in results.docs:
            if float(doc.score) >= self.threshold:
                self.stats["hits"] += 1
                return doc.response
        
        self.stats["misses"] += 1
        return None
    
    def set(self, query: str, response: str, ttl: int = 3600):
        """存储缓存"""
        query_emb = self.encoder.encode(query)
        key = hashlib.md5(query.encode()).hexdigest()
        
        self.redis.hset(f"cache:{key}", mapping={
            "query": query,
            "response": response,
            "embedding": query_emb.tobytes(),
        })
        self.redis.expire(f"cache:{key}", ttl)
    
    @property
    def hit_rate(self):
        total = self.stats["hits"] + self.stats["misses"]
        return self.stats["hits"] / total if total > 0 else 0

# 缓存效果
"""
典型命中率: 30-60% (取决于用户问题多样性)
成本节省:   命中率 × 原始成本
延迟改善:   缓存命中 <10ms vs LLM 调用 1-5s
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 全方位成本优化</h2>
        <div className="info-box">
          <h3>📋 Agent 成本优化清单</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>策略</th><th>节省幅度</th><th>实现难度</th><th>质量影响</th></tr>
            </thead>
            <tbody>
              <tr><td>智能模型路由</td><td>30-50%</td><td>中</td><td>低</td></tr>
              <tr><td>语义缓存</td><td>20-40%</td><td>中</td><td>无</td></tr>
              <tr><td>Prompt 压缩</td><td>15-30%</td><td>低</td><td>低</td></tr>
              <tr><td>上下文窗口管理</td><td>10-25%</td><td>中</td><td>中</td></tr>
              <tr><td>批量调用 (Batch API)</td><td>50%</td><td>低</td><td>延迟增加</td></tr>
              <tr><td>Prompt Caching</td><td>50-90%</td><td>低</td><td>无</td></tr>
              <tr><td>循环断路器</td><td>防止100x爆炸</td><td>低</td><td>无</td></tr>
              <tr><td>本地小模型替代</td><td>80-95%</td><td>高</td><td>需验证</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：故障排查</span>
        <span className="nav-next">下一模块：合规治理 →</span>
      </div>
    </div>
  );
}
