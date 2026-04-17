import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['离线指标', '在线指标', '评估框架', '案例分析'];

export default function LessonSearchEval() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🔍 module_07 — 搜索质量评估</div>
      <div className="fs-hero">
        <h1>搜索质量评估：量化搜索效果</h1>
        <p>
          "搜索好不好"不能靠感觉，要靠<strong>数据</strong>。NDCG 衡量排序质量，
          MRR 衡量首条准确率，MAP 衡量全局召回——每个指标回答不同的问题。
          本模块系统覆盖离线评估指标、在线业务指标、自动化评估框架，
          以及真实业务中的评估案例分析。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 评估体系</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📏 核心离线评估指标</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> metrics.py</div>
                <pre className="fs-code">{`# —— 搜索/推荐核心评估指标 ——
import numpy as np

def precision_at_k(relevant, retrieved, k):
    """P@K: Top-K 中多少比例是相关的"""
    retrieved_k = retrieved[:k]
    return len(set(relevant) & set(retrieved_k)) / k

def recall_at_k(relevant, retrieved, k):
    """R@K: 相关文档中有多少被检索到了"""
    retrieved_k = retrieved[:k]
    return len(set(relevant) & set(retrieved_k)) / len(relevant)

def average_precision(relevant, retrieved):
    """AP: 精确率在每个相关位置的平均值"""
    hits = 0
    sum_precisions = 0
    for i, doc in enumerate(retrieved):
        if doc in relevant:
            hits += 1
            sum_precisions += hits / (i + 1)
    return sum_precisions / len(relevant) if relevant else 0

def mean_average_precision(relevant_lists, retrieved_lists):
    """MAP: 所有查询 AP 的平均值"""
    return np.mean([
        average_precision(r, p)
        for r, p in zip(relevant_lists, retrieved_lists)
    ])

def mrr(relevant_lists, retrieved_lists):
    """MRR: 第一个正确结果排在第几位"""
    reciprocal_ranks = []
    for relevant, retrieved in zip(relevant_lists, retrieved_lists):
        for i, doc in enumerate(retrieved):
            if doc in relevant:
                reciprocal_ranks.append(1.0 / (i + 1))
                break
        else:
            reciprocal_ranks.append(0.0)
    return np.mean(reciprocal_ranks)

def ndcg_at_k(relevant_scores, retrieved_scores, k):
    """NDCG@K: 归一化折损累积增益
    
    衡量排序质量: 相关度高的文档应排在前面
    DCG@K = Σ (2^rel - 1) / log2(i + 2)
    NDCG@K = DCG@K / IDCG@K
    """
    def dcg(scores, k):
        scores = scores[:k]
        return sum(
            (2**score - 1) / np.log2(i + 2)
            for i, score in enumerate(scores)
        )
    
    actual_dcg = dcg(retrieved_scores, k)
    ideal_dcg = dcg(sorted(relevant_scores, reverse=True), k)
    
    return actual_dcg / ideal_dcg if ideal_dcg > 0 else 0

# 示例:
# 搜索 "Python 教程", 返回 5 个结果
# 相关性打分: [3, 1, 2, 0, 3] (0-3 分)
# NDCG@5 = 0.82 (不错, 但排序可优化)
# 理想排序: [3, 3, 2, 1, 0] → NDCG@5 = 1.0`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📈 在线业务指标</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> 业务 KPI</div>
                <pre className="fs-code">{`搜索在线指标体系:

🔍 搜索质量指标:
├── 零结果率 (Zero Result Rate)
│   └── 目标: < 5%
├── 首页点击率 (Page 1 CTR)
│   └── 目标: > 60%
├── 首条点击率 (Position 1 CTR)
│   └── 目标: > 30%
├── 平均点击位置 (Avg Click Position)
│   └── 目标: < 3
├── 搜索放弃率 (Abandonment Rate)
│   └── 目标: < 20%
└── 改词搜索率 (Query Reformulation)
    └── 目标: < 15%

🎯 推荐质量指标:
├── 推荐 CTR
│   └── 电商: 5-15%, 内容: 10-30%
├── 推荐转化率 (CVR)
│   └── 电商: 1-5%
├── 覆盖率 (Coverage)
│   └── 被推荐物品占总物品比
├── 多样性 (Diversity)
│   └── 推荐列表内的类目多样性
├── 新颖度 (Novelty)
│   └── 推荐非热门物品的比例
└── 用户活跃度 (Engagement)
    └── DAU, 停留时长, 回访率`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 北极星指标</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> 核心 KPI</div>
                <pre className="fs-code">{`不同业务的北极星指标:

📱 短视频 (抖音/快手):
├── 核心: 人均观看时长
├── 辅助: 完播率, 互动率
└── 护栏: 多样性 > 阈值

🛒 电商 (淘宝/京东):
├── 核心: GMV (成交额)
├── 辅助: CTR, CVR, 客单价
└── 护栏: 退货率 < 阈值

📰 资讯 (今日头条):
├── 核心: 人均阅读量
├── 辅助: 点击率, 阅读完成率
└── 护栏: 内容质量分

🎵 音乐 (Spotify):
├── 核心: 月活跃天数
├── 辅助: 播放量, 添加收藏
└── 护栏: 跳过率 < 阈值

⚖️ 指标冲突处理:
├── CTR ↑ 但 时长 ↓ → 标题党
├── 多样性 ↑ 但 CTR ↓ → 正常
├── 设 guardrail 指标防劣化
└── Pareto 最优 多目标优化`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 自动化评估框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> eval_framework.py</div>
                <pre className="fs-code">{`# —— 搜索质量自动化评估框架 ——

class SearchEvalFramework:
    """端到端搜索质量评估"""
    
    def __init__(self, search_engine, golden_set_path):
        self.engine = search_engine
        self.golden_set = self.load_golden_set(golden_set_path)
    
    async def run_full_eval(self) -> dict:
        """执行完整评估"""
        results = {}
        
        for query_set_name, queries in self.golden_set.items():
            set_results = []
            
            for item in queries:
                query = item["query"]
                relevant_docs = item["relevant_doc_ids"]
                
                # 执行搜索
                retrieved = await self.engine.search(query, top_k=20)
                retrieved_ids = [r.id for r in retrieved]
                
                # 计算指标
                metrics = {
                    "p@5": precision_at_k(relevant_docs, retrieved_ids, 5),
                    "p@10": precision_at_k(relevant_docs, retrieved_ids, 10),
                    "r@10": recall_at_k(relevant_docs, retrieved_ids, 10),
                    "r@20": recall_at_k(relevant_docs, retrieved_ids, 20),
                    "mrr": 1.0 / (retrieved_ids.index(relevant_docs[0]) + 1)
                           if relevant_docs[0] in retrieved_ids else 0,
                    "ndcg@10": ndcg_at_k(
                        [item["relevance"].get(d, 0) for d in relevant_docs],
                        [item["relevance"].get(d, 0) for d in retrieved_ids],
                        10
                    ),
                    "latency_ms": retrieved[0].latency_ms if retrieved else 0,
                }
                set_results.append(metrics)
            
            # 聚合该查询集的指标
            results[query_set_name] = {
                metric: np.mean([r[metric] for r in set_results])
                for metric in set_results[0].keys()
            }
        
        return results
    
    def generate_report(self, results, baseline=None):
        """生成评估报告, 与 baseline 对比"""
        report = "# 搜索质量评估报告\\n\\n"
        for name, metrics in results.items():
            report += f"## {name}\\n"
            for metric, value in metrics.items():
                delta = ""
                if baseline and name in baseline:
                    diff = value - baseline[name].get(metric, 0)
                    delta = f" ({'↑' if diff > 0 else '↓'} {abs(diff):.4f})"
                report += f"  {metric}: {value:.4f}{delta}\\n"
        return report`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🏢 LLM-as-Judge</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> llm_judge.py</div>
                <pre className="fs-code">{`# LLM 自动评估搜索质量

async def llm_judge_relevance(
    query: str,
    document: str,
    model: str = "gpt-4o-mini"
):
    """用 LLM 评估文档相关性"""
    response = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": f"""
评估以下搜索结果与查询的相关性。

查询: {query}
文档: {document}

相关性评分 (0-3):
0 = 完全不相关
1 = 边缘相关 (提到相关概念)
2 = 相关 (部分回答查询)
3 = 高度相关 (完整回答查询)

返回 JSON: {{"score": N, "reason": "..."}}
"""}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

# 规模化评估:
# 1. 采样 200+ 查询
# 2. 每个查询 Top-10 结果
# 3. LLM 批量评分
# 4. 与人工标注对比 (Kappa > 0.7)
# 5. 计算 NDCG@10, MAP 等指标`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📋 Golden Set 构建</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> 标注流程</div>
                <pre className="fs-code">{`Golden Set 构建流程:

1️⃣ 查询采样
├── 从搜索日志采样
├── 覆盖高频/中频/长尾
├── 覆盖各类意图
└── 样本量: 500-2000 条

2️⃣ 标注方案
├── 4 级相关性 (0-3)
├── 每条 ≥ 2 人标注
├── 计算标注一致性 (Cohen's κ)
├── κ > 0.7 才合格
└── 不一致的交叉审核

3️⃣ 质量控制
├── 黄金标准题 (10%)
├── 标注员准确率监控
├── 定期重新标注
└── 版本管理

4️⃣ 更新策略
├── 每季度补充新查询
├── 新功能上线后补充
├── 删除过时查询
└── 保持 500+ 有效查询`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
