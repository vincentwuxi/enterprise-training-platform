import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 08 — 上线与运营
   灰度发布 / A/B 测试 / 用户反馈闭环
   ───────────────────────────────────────────── */

const OPS_SECTIONS = [
  { name: '灰度发布', icon: '🚀', tag: 'Canary',
    code: `# ─── AI 应用灰度发布策略 ───
# 与传统应用不同，AI 应用的灰度不仅是代码版本，
# 还包括 Prompt 版本、模型版本、参数版本。

# ─── 1. Feature Flag 系统 ───
from dataclasses import dataclass
from typing import Optional
import random

@dataclass
class FeatureFlag:
    name: str
    rollout_percentage: float  # 0-100
    allowed_tenants: list[str] = None  # 白名单
    model_version: str = "gpt-4o"
    prompt_version: str = "v1"
    config: dict = None

FLAGS = {
    "new_rag_pipeline": FeatureFlag(
        name="new_rag_pipeline",
        rollout_percentage=10,  # 10% 灰度
        model_version="gpt-4o",
        prompt_version="v2.1",
        config={"chunk_size": 1000, "reranker": True},
    ),
    "streaming_v2": FeatureFlag(
        name="streaming_v2",
        rollout_percentage=50,
        allowed_tenants=["tenant_001", "tenant_002"],  # 指定租户
    ),
}

def is_enabled(flag_name: str, tenant_id: str, user_id: str) -> bool:
    flag = FLAGS.get(flag_name)
    if not flag:
        return False
    
    # 白名单优先
    if flag.allowed_tenants and tenant_id in flag.allowed_tenants:
        return True
    
    # 按比例灰度 (基于 user_id hash，保证同一用户一致)
    hash_val = hash(f"{flag_name}:{user_id}") % 100
    return hash_val < flag.rollout_percentage

# ─── 2. Prompt 版本管理 (类似 Git) ───
class PromptRegistry:
    """Prompt 版本控制"""
    
    def __init__(self, db):
        self.db = db
    
    async def get_prompt(self, name: str, version: str = None):
        """获取指定版本的 Prompt"""
        if version:
            return await self.db.fetch_one(
                "SELECT * FROM prompts WHERE name=$1 AND version=$2",
                name, version
            )
        # 默认返回 production 版本
        return await self.db.fetch_one(
            "SELECT * FROM prompts WHERE name=$1 AND is_production=true",
            name
        )
    
    async def promote(self, name: str, version: str):
        """将 Prompt 版本升级到 production"""
        await self.db.execute(
            "UPDATE prompts SET is_production=false WHERE name=$1", name
        )
        await self.db.execute(
            "UPDATE prompts SET is_production=true WHERE name=$1 AND version=$2",
            name, version
        )

# ─── 3. 灰度发布检查清单 ───
# □ Prompt 回归测试通过 (自动化 eval)
# □ 延迟 P95 < 基线 * 1.2
# □ 错误率 < 0.5%
# □ 内部测试 3 天无异常
# □ 灰度 5% → 10% → 25% → 50% → 100%
# □ 每级至少观察 24 小时
# □ 准备回滚方案` },
  { name: 'A/B 测试', icon: '🔬', tag: 'Experiment',
    code: `# ─── AI 特有的 A/B 测试 ───
# 不只是 UI A/B，还有 Model A/B、Prompt A/B、Strategy A/B

from dataclasses import dataclass, field
from typing import Dict, List
import random
from datetime import datetime

@dataclass
class Experiment:
    name: str
    variants: Dict[str, dict]  # variant_name -> config
    metrics: List[str]         # 要追踪的指标
    traffic_split: Dict[str, float]  # variant -> 流量比例
    start_date: datetime = None
    end_date: datetime = None

# 实验定义
experiments = {
    "prompt_v2_test": Experiment(
        name="RAG Prompt V2 测试",
        variants={
            "control": {
                "prompt_version": "v1",
                "model": "gpt-4o",
                "temperature": 0.7,
            },
            "treatment_a": {
                "prompt_version": "v2",  # 新 Prompt
                "model": "gpt-4o",
                "temperature": 0.7,
            },
            "treatment_b": {
                "prompt_version": "v2",
                "model": "gpt-4o-mini",  # 更便宜的模型
                "temperature": 0.5,
            },
        },
        metrics=[
            "user_satisfaction",  # 👍/👎 评分
            "response_latency",   # 响应延迟
            "token_cost",         # Token 成本
            "follow_up_rate",     # 追问率 (越低越好)
            "citation_accuracy",  # 引用准确率
        ],
        traffic_split={"control": 0.4, "treatment_a": 0.4, "treatment_b": 0.2},
    ),
}

class ABTestManager:
    def assign_variant(self, experiment_name, user_id):
        """分配实验组 (基于 user_id hash，保证一致性)"""
        exp = experiments[experiment_name]
        hash_val = hash(f"{experiment_name}:{user_id}") % 1000 / 1000
        
        cumulative = 0
        for variant, ratio in exp.traffic_split.items():
            cumulative += ratio
            if hash_val < cumulative:
                return variant
        return list(exp.variants.keys())[0]
    
    async def track_metric(self, experiment, variant, user_id, metric, value):
        """记录实验指标"""
        await db.execute(
            """INSERT INTO experiment_metrics 
               (experiment, variant, user_id, metric, value, timestamp)
               VALUES ($1, $2, $3, $4, $5, now())""",
            experiment, variant, user_id, metric, value
        )
    
    async def analyze(self, experiment_name):
        """统计显著性分析"""
        from scipy import stats
        
        results = await db.fetch(
            "SELECT variant, metric, array_agg(value) as values "
            "FROM experiment_metrics WHERE experiment=$1 "
            "GROUP BY variant, metric",
            experiment_name,
        )
        
        # t-test 判断差异显著性
        # p < 0.05 → 统计显著
        for metric in experiments[experiment_name].metrics:
            control = get_values(results, "control", metric)
            for variant in ["treatment_a", "treatment_b"]:
                treatment = get_values(results, variant, metric)
                t_stat, p_value = stats.ttest_ind(control, treatment)
                print(f"{metric} | {variant}: p={p_value:.4f} {'✅' if p_value<0.05 else '❌'}")` },
  { name: '用户反馈闭环', icon: '🔄', tag: 'Feedback Loop',
    code: `# ─── 用户反馈 → 自动优化闭环 ───

# ─── 1. 多维度反馈收集 ───
from pydantic import BaseModel
from typing import Optional, Literal

class UserFeedback(BaseModel):
    conversation_id: str
    message_id: str
    
    # 显式反馈
    rating: Optional[Literal["positive", "negative"]] = None  # 👍/👎
    
    # 细分维度
    accuracy: Optional[int] = None      # 准确性 1-5
    helpfulness: Optional[int] = None   # 有用性 1-5
    
    # 文字反馈
    comment: Optional[str] = None
    
    # 隐式反馈 (自动采集)
    copied: bool = False          # 用户是否复制了回答
    regenerated: bool = False     # 是否点了重新生成
    follow_up: bool = False       # 是否追问了
    session_duration: float = 0   # 会话时长 (秒)

@app.post("/api/feedback")
async def submit_feedback(feedback: UserFeedback):
    # 存储反馈
    await db.save_feedback(feedback)
    
    # 如果是负面反馈，触发分析
    if feedback.rating == "negative":
        await analyze_negative_feedback(feedback)

# ─── 2. 负面反馈自动分析 ───
async def analyze_negative_feedback(feedback: UserFeedback):
    """用 LLM 分析失败原因"""
    conversation = await db.get_conversation(feedback.conversation_id)
    
    analysis = await llm.invoke(f"""
分析这个 AI 对话为什么得到了负面评分。

用户问题: {conversation.user_message}
AI 回答: {conversation.ai_response}
用户反馈: {feedback.comment or "无文字反馈"}

分类失败原因:
1. factual_error - 事实错误
2. irrelevant - 答非所问
3. incomplete - 回答不完整
4. hallucination - 编造信息
5. formatting - 格式问题
6. too_verbose - 太啰嗦
7. unclear - 表达不清
8. other - 其他

返回 JSON: {{"reason": "类别", "details": "具体分析", "suggestion": "改进建议"}}
""")
    
    # 写入分析报告
    await db.save_analysis(feedback.conversation_id, analysis)
    
    # 如果是系统性问题 (同类错误 >5次/天)，自动告警
    similar_count = await db.count_similar_failures(analysis.reason, hours=24)
    if similar_count > 5:
        await alert_team(f"系统性问题: {analysis.reason}, 24h内{similar_count}次")

# ─── 3. RLHF 风格: 反馈驱动优化 ───
async def weekly_prompt_optimization():
    """每周基于反馈自动优化 Prompt"""
    # 收集本周负面反馈
    negative_feedbacks = await db.get_weekly_negatives()
    
    # 聚类分析
    failure_categories = cluster_failures(negative_feedbacks)
    
    # 让 LLM 基于失败案例优化 Prompt
    current_prompt = await prompt_registry.get_prompt("rag_system")
    
    improved = await llm.invoke(f"""
基于以下失败案例，优化系统 Prompt:

当前 Prompt:
{current_prompt.content}

失败案例 (按类别):
{json.dumps(failure_categories, ensure_ascii=False)}

要求:
1. 针对每类失败，在 Prompt 中添加具体指令
2. 保持 Prompt 简洁 (<500 words)
3. 返回优化后的完整 Prompt
""")
    
    # 保存为新版本，进入 A/B 测试
    await prompt_registry.create_version(
        name="rag_system",
        content=improved,
        version="auto_v" + datetime.now().strftime("%Y%m%d"),
        source="auto_optimization",
    )` },
  { name: '监控仪表板', icon: '📊', tag: 'Dashboard',
    code: `# ─── AI 产品核心指标 (Golden Signals) ───

# ─── 1. 产品指标 ───
PRODUCT_METRICS = {
    # 质量
    "satisfaction_rate": "用户满意率 (👍比例)",      # 目标: >85%
    "citation_accuracy": "引用准确率",               # 目标: >90%
    "hallucination_rate": "幻觉率",                  # 目标: <5%
    
    # 体验
    "ttft_p95": "首 Token 延迟 P95",                 # 目标: <500ms
    "total_latency_p95": "端到端延迟 P95",           # 目标: <5s
    "stream_speed": "流式输出速度 (tok/s)",           # 目标: >30
    
    # 活跃度
    "dau": "日活用户",
    "messages_per_user": "人均对话数",
    "retention_d7": "7 日留存率",                    # 目标: >40%
    
    # 成本
    "cost_per_message": "每条消息成本",              # 目标: <$0.01
    "cache_hit_rate": "缓存命中率",                  # 目标: >30%
    "token_efficiency": "Token 效率 (有效token/总token)",
}

# ─── 2. Grafana Dashboard 配置 ───
DASHBOARD_PANELS = [
    # 质量面板
    {"title": "满意率 (24h)", "type": "gauge",
     "query": "sum(feedback_positive) / sum(feedback_total) * 100"},
    
    # 延迟面板
    {"title": "TTFT P95", "type": "timeseries",
     "query": "histogram_quantile(0.95, rate(ttft_seconds_bucket[5m]))"},
    
    # 成本面板
    {"title": "日成本趋势", "type": "timeseries",
     "query": "sum(increase(token_cost_total[1d]))"},
    
    # 留存面板
    {"title": "7日留存", "type": "stat",
     "query": "retention_d7_ratio"},
]

# ─── 3. 告警规则 ───
ALERTS = [
    {
        "name": "满意率下降",
        "condition": "satisfaction_rate < 80% for 1h",
        "severity": "critical",
        "action": "通知产品经理 + 自动回滚 Prompt"
    },
    {
        "name": "幻觉率飙升",
        "condition": "hallucination_rate > 10% for 30m",
        "severity": "critical",
        "action": "降级到保守 Prompt + 通知团队"
    },
    {
        "name": "成本异常",
        "condition": "daily_cost > 2 * avg(daily_cost[7d])",
        "severity": "warning",
        "action": "检查是否有异常租户"
    },
    {
        "name": "延迟退化",
        "condition": "ttft_p95 > 2s for 10m",
        "severity": "warning",
        "action": "检查 LLM API 状态 / 触发扩容"
    },
]

# ── 每日报告自动生成 ──
async def daily_report():
    metrics = await collect_all_metrics()
    report = await llm.invoke(f"""
生成今日 AI 产品运营报告:
{json.dumps(metrics)}

包含: 关键指标变化、异常分析、改进建议
""")
    await send_to_slack("#ai-ops", report)` },
];

export default function LessonGoLive() {
  const [secIdx, setSecIdx] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🧩 module_08 — 上线与运营</div>
      <div className="fs-hero">
        <h1>上线运营：让 AI 产品持续进化</h1>
        <p>
          产品上线才是真正的开始——<strong>灰度发布</strong>控制风险、<strong>A/B 测试</strong>验证改进、
          <strong>用户反馈闭环</strong>驱动优化、<strong>监控仪表板</strong>守护稳定。
          本模块给你一套 AI 产品的<strong>持续进化引擎</strong>。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🎯 运营四板斧</h2>
        <div className="fs-pills">
          {OPS_SECTIONS.map((s, i) => (
            <button key={i} className={`fs-btn ${i === secIdx ? 'primary' : ''}`}
              onClick={() => setSecIdx(i)}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #fb7185' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fb7185' }}>{OPS_SECTIONS[secIdx].icon} {OPS_SECTIONS[secIdx].name}</h3>
            <span className="fs-tag rose">{OPS_SECTIONS[secIdx].tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 ops_{OPS_SECTIONS[secIdx].tag.toLowerCase().replace(/\s/g, '_')}.py
            </div>
            <pre className="fs-code">{OPS_SECTIONS[secIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* AI product lifecycle */}
      <div className="fs-section">
        <h2 className="fs-section-title">♻️ AI 产品持续进化循环</h2>
        <div className="fs-card">
          <div className="fs-flow">
            {[
              { label: '📊 监控', bg: '#8b5cf6' }, { label: '🔄 反馈', bg: '#06b6d4' },
              { label: '📈 分析', bg: '#f59e0b' }, { label: '✍️ 优化', bg: '#22c55e' },
              { label: '🔬 A/B 测试', bg: '#ef4444' }, { label: '🚀 灰度', bg: '#a78bfa' },
              { label: '✅ 全量', bg: '#fb7185' },
            ].map((n, i, arr) => (
              <React.Fragment key={i}>
                <div className="fs-flow-node" style={{ background: `${n.bg}22`, border: `1px solid ${n.bg}44`, color: n.bg }}>{n.label}</div>
                {i < arr.length - 1 && <span className="fs-flow-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="fs-grid-4" style={{ marginTop: '0.75rem' }}>
          {[
            ['> 85%', '满意率', '#22c55e'],
            ['< 5%', '幻觉率', '#ef4444'],
            ['> 40%', '7日留存', '#06b6d4'],
            ['< $0.01', '每消息成本', '#f59e0b'],
          ].map(([v, l, c], i) => (
            <div key={i} className="fs-metric">
              <div className="fs-metric-value" style={{ color: c }}>{v}</div>
              <div className="fs-metric-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← AI SaaS 平台</button>
        <button className="fs-btn primary">🎓 课程完成！</button>
      </div>
    </div>
  );
}
