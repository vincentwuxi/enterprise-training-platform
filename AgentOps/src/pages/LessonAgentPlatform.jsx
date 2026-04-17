import React from 'react';
import './LessonCommon.css';

export default function LessonAgentPlatform() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🚀 模块八：Agent 平台化运营 — 多 Agent 编排 / A/B 测试 / 灰度 / SRE</h1>
      <p className="lesson-subtitle">
        从单个 Agent 到 Agent 平台——规模化运营数十上百个 Agent 的工程体系
      </p>

      <section className="lesson-section">
        <h2>1. Agent 平台架构</h2>
        <div className="concept-card">
          <h3>🏗️ 企业 Agent 平台</h3>
          <div className="code-block">
{`# 企业级 Agent 平台架构
"""
┌─────────────────────────────────────────────────────┐
│                  Agent 管理控制台                     │
│  ┌─────────┬─────────┬─────────┬─────────┐         │
│  │ Agent   │ Prompt  │ 工具    │ 知识库   │         │
│  │ 注册表  │ 版本管理│ 市场    │ 管理    │         │
│  └────┬────┴────┬────┴────┬────┴────┬────┘         │
│       └─────────┴─────────┴─────────┘               │
│                    │                                 │
│  ┌─────────────────▼─────────────────────┐          │
│  │         Agent 运行时 (Runtime)          │          │
│  │  ┌──────┬──────┬──────┬──────┐        │          │
│  │  │路由  │编排  │护栏  │缓存  │        │          │
│  │  └──┬───┘└──┬──┘└──┬──┘└──┬──┘        │          │
│  │     └───────┴──────┴──────┘           │          │
│  └─────────────────┬─────────────────────┘          │
│                    │                                 │
│  ┌─────────────────▼─────────────────────┐          │
│  │         基础设施层                      │          │
│  │  ┌──────┬──────┬──────┬──────┐        │          │
│  │  │LLM   │向量DB│工具  │消息  │        │          │
│  │  │网关  │集群  │沙箱  │队列  │        │          │
│  │  └──────┴──────┴──────┴──────┘        │          │
│  └─────────────────┬─────────────────────┘          │
│                    │                                 │
│  ┌─────────────────▼─────────────────────┐          │
│  │         可观测性 & 治理                  │          │
│  │  ┌──────┬──────┬──────┬──────┐        │          │
│  │  │Trace │指标  │告警  │审计  │        │          │
│  │  └──────┴──────┴──────┴──────┘        │          │
│  └───────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘

Agent 注册表 (Agent Registry):
  每个 Agent 作为独立的"微服务":
  - agent_id: "customer-service-v2"
  - model: "gpt-4o"
  - prompt_version: "v2.3.1"
  - tools: ["search_kb", "query_order", "send_email"]
  - guardrails: ["injection_guard", "pii_filter"]
  - traffic_split: {"v2.3.1": 90, "v2.4.0-beta": 10}
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. Agent A/B 测试与灰度</h2>
        <div className="concept-card">
          <h3>🧪 Agent 版本管理与灰度发布</h3>
          <div className="code-block">
{`# Agent 灰度发布系统
class AgentDeploymentManager:
    """Agent 版本管理与灰度发布"""
    
    def __init__(self):
        self.deployments = {}
    
    def create_deployment(self, agent_id: str, config: dict):
        """创建灰度部署"""
        deployment = {
            "agent_id": agent_id,
            "versions": {
                "stable": {
                    "prompt_version": config["stable_prompt"],
                    "model": config["stable_model"],
                    "traffic_pct": 90,
                },
                "canary": {
                    "prompt_version": config["canary_prompt"],
                    "model": config["canary_model"],
                    "traffic_pct": 10,
                }
            },
            "rollback_criteria": {
                "error_rate_threshold": 0.05,  # 5% 错误率自动回滚
                "latency_p99_threshold": 10.0, # P99 > 10s 回滚
                "satisfaction_threshold": 3.5,  # CSAT < 3.5 回滚
            },
            "auto_promote_criteria": {
                "min_samples": 1000,            # 最少 1000 个样本
                "min_duration_hours": 24,        # 至少运行 24 小时
                "quality_improvement": 0.02,     # 质量提升 > 2%
            }
        }
        self.deployments[agent_id] = deployment
    
    def route_request(self, agent_id: str, request: dict) -> str:
        """根据灰度规则路由请求"""
        deployment = self.deployments[agent_id]
        
        # 一致性路由: 同一用户始终路由到同一版本
        user_hash = hash(request.get("user_id", "")) % 100
        
        cumulative = 0
        for version_name, version_config in deployment["versions"].items():
            cumulative += version_config["traffic_pct"]
            if user_hash < cumulative:
                return version_name
        
        return "stable"
    
    def check_rollback(self, agent_id: str, canary_metrics: dict) -> bool:
        """检查是否需要自动回滚"""
        criteria = self.deployments[agent_id]["rollback_criteria"]
        
        if canary_metrics["error_rate"] > criteria["error_rate_threshold"]:
            self.rollback(agent_id, "错误率超阈值")
            return True
        
        if canary_metrics["latency_p99"] > criteria["latency_p99_threshold"]:
            self.rollback(agent_id, "延迟过高")
            return True
        
        return False

# A/B 测试指标比较
"""
┌──────────────┬──────────┬──────────┬──────────┐
│ 指标         │ Stable   │ Canary   │ p-value  │
├──────────────┼──────────┼──────────┼──────────┤
│ 任务完成率   │ 87.3%    │ 89.1%    │ 0.023    │
│ 平均延迟     │ 2.4s     │ 2.1s     │ 0.001    │
│ 用户满意度   │ 4.1/5    │ 4.3/5    │ 0.045    │
│ 幻觉率       │ 2.8%     │ 2.1%     │ 0.031    │
│ 平均成本     │ $0.018   │ $0.015   │ 0.012    │
│ 转人工率     │ 12.5%    │ 10.8%    │ 0.089    │
└──────────────┴──────────┴──────────┴──────────┘
结论: Canary 版本全面优于 Stable, 建议 promote
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 多 Agent 编排</h2>
        <div className="concept-card">
          <h3>🎼 Multi-Agent 系统运维</h3>
          <div className="code-block">
{`# 多 Agent 编排模式
"""
模式 1: 路由器 (Router)
  中央路由 → 根据意图分发给专用 Agent
  ┌──────┐    ┌─────────────┐
  │ User │───▶│ Router Agent │
  └──────┘    └──┬──┬──┬────┘
                 │  │  │
         ┌───────┘  │  └───────┐
         ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │ Sales  │ │Support │ │Finance │
    │ Agent  │ │Agent   │ │Agent   │
    └────────┘ └────────┘ └────────┘

模式 2: 流水线 (Pipeline)
  Agent A → Agent B → Agent C (顺序执行)
  
模式 3: 协作 (Collaboration)
  多 Agent 讨论达成共识 (如代码评审)

模式 4: 监督 (Supervisor)
  Supervisor Agent 分配任务并审核结果
"""

# 多 Agent 运维挑战
multi_agent_challenges = {
    "级联故障": {
        "问题": "Agent A 的错误输出导致 Agent B 的错误决策",
        "防御": "每个 Agent 独立验证输入 + 跨 Agent 断路器"
    },
    "通信爆炸": {
        "问题": "N 个 Agent 相互通信 → O(N²) 消息",
        "防御": "中央编排器 + 消息总线 + Token 预算"
    },
    "死锁": {
        "问题": "Agent A 等 Agent B, Agent B 等 Agent A",
        "防御": "超时机制 + 有向无环图 (DAG) 约束"
    },
    "责任模糊": {
        "问题": "多 Agent 协作的结果出错,谁负责?",
        "防御": "每步审计 + 最终 Agent 承担输出责任"
    },
    "调试困难": {
        "问题": "Bug 在哪个 Agent 产生的?",
        "防御": "分布式 Tracing + Span 级别日志"
    }
}

# SRE for Agent
"""
Agent SRE 实践:
  SLO (服务级别目标):
    - 可用性: 99.9% (每月 < 43 分钟不可用)
    - 延迟: P95 < 5s, P99 < 15s
    - 质量: 任务成功率 > 92%
    - 安全: 0 起数据泄露事件

  Error Budget (错误预算):
    - 99.9% 可用性 → 每月 43 分钟 error budget
    - budget 耗尽 → 冻结新功能, 专注稳定性
    - budget 充裕 → 可以激进实验

  On-Call Runbook:
    - Page 1: 检查 LLM API 状态
    - Page 2: 检查工具 API 健康度
    - Page 3: 查看护栏触发率
    - Page 4: 检查 Token 成本异常
    - Page 5: 回滚到上一个 stable 版本
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. Agent 运维成熟度模型</h2>
        <div className="info-box">
          <h3>📋 Agent Ops 成熟度等级</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>等级</th><th>名称</th><th>能力</th><th>工具</th></tr>
            </thead>
            <tbody>
              <tr><td>L1</td><td>手工运维</td><td>手动部署/日志查看/人工监控</td><td>日志文件/SSH</td></tr>
              <tr><td>L2</td><td>基础自动化</td><td>CI/CD部署/基本监控/阈值告警</td><td>GitHub Actions/Grafana</td></tr>
              <tr><td>L3</td><td>可观测驱动</td><td>分布式Trace/评估套件/灰度</td><td>Langfuse/promptfoo</td></tr>
              <tr><td>L4</td><td>智能运维</td><td>自动回滚/模型路由/预测告警</td><td>自建平台/AIOps</td></tr>
              <tr><td>L5</td><td>自愈平台</td><td>自动诊断/自动修复/自动优化</td><td>Agent-运维-Agent</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：合规治理</span>
        <span></span>
      </div>
    </div>
  );
}
