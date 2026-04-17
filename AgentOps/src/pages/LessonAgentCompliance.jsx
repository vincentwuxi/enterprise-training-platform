import React from 'react';
import './LessonCommon.css';

export default function LessonAgentCompliance() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">⚖️ 模块七：Agent 合规治理 — 审计日志 / 数据主权 / 责任归属 / 风控</h1>
      <p className="lesson-subtitle">
        Agent 越自主，治理越关键——满足企业级合规与审计要求
      </p>

      <section className="lesson-section">
        <h2>1. Agent 治理框架</h2>
        <div className="concept-card">
          <h3>🏛️ 企业 Agent 治理全景</h3>
          <div className="code-block">
{`# Agent 企业级治理框架
"""
┌─────────────────────────────────────────────────┐
│               Agent 治理框架                     │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │ 策略层 (Policy Layer)                 │       │
│  │ · Agent 使用政策                      │       │
│  │ · 数据分类与访问策略                   │       │
│  │ · 人工审核触发条件                     │       │
│  │ · 可接受使用场景                       │       │
│  └────────────────┬─────────────────────┘       │
│                   ▼                              │
│  ┌──────────────────────────────────────┐       │
│  │ 控制层 (Control Layer)                │       │
│  │ · 身份认证与授权 (RBAC)               │       │
│  │ · 输入/输出护栏                       │       │
│  │ · 工具权限矩阵                        │       │
│  │ · 速率限制与预算控制                   │       │
│  └────────────────┬─────────────────────┘       │
│                   ▼                              │
│  ┌──────────────────────────────────────┐       │
│  │ 记录层 (Record Layer)                 │       │
│  │ · 完整审计日志                        │       │
│  │ · 决策链可追溯                        │       │
│  │ · 数据沿袭 (Data Lineage)             │       │
│  │ · 模型版本快照                        │       │
│  └────────────────┬─────────────────────┘       │
│                   ▼                              │
│  ┌──────────────────────────────────────┐       │
│  │ 监督层 (Oversight Layer)              │       │
│  │ · 定期审计报告                        │       │
│  │ · 公平性/偏见检测                     │       │
│  │ · 合规违规告警                        │       │
│  │ · 第三方审计支持                       │       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 审计日志系统</h2>
        <div className="concept-card">
          <h3>📝 不可篡改的 Agent 审计日志</h3>
          <div className="code-block">
{`# Agent 审计日志设计
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import hashlib, json

class AuditEventType(Enum):
    AGENT_INVOKED = "agent.invoked"
    TOOL_CALLED = "agent.tool.called"
    TOOL_RESULT = "agent.tool.result"
    LLM_CALLED = "agent.llm.called"
    DECISION_MADE = "agent.decision"
    HUMAN_ESCALATED = "agent.human.escalated"
    HUMAN_APPROVED = "agent.human.approved"
    DATA_ACCESSED = "agent.data.accessed"
    OUTPUT_DELIVERED = "agent.output.delivered"
    GUARDRAIL_TRIGGERED = "agent.guardrail.triggered"

@dataclass
class AuditRecord:
    event_type: AuditEventType
    timestamp: datetime = field(default_factory=datetime.utcnow)
    trace_id: str = ""
    user_id: str = ""
    agent_id: str = ""
    session_id: str = ""
    
    # 内容
    input_data: dict = field(default_factory=dict)
    output_data: dict = field(default_factory=dict)
    metadata: dict = field(default_factory=dict)
    
    # 安全
    data_classification: str = "internal"  # public/internal/confidential/restricted
    pii_detected: bool = False
    pii_fields: list = field(default_factory=list)
    
    # 完整性 (防篡改)
    previous_hash: str = ""
    record_hash: str = ""
    
    def compute_hash(self):
        """链式哈希,确保日志不可篡改"""
        content = json.dumps({
            "event": self.event_type.value,
            "timestamp": self.timestamp.isoformat(),
            "trace_id": self.trace_id,
            "input": self.input_data,
            "output": self.output_data,
            "prev_hash": self.previous_hash,
        }, sort_keys=True)
        self.record_hash = hashlib.sha256(content.encode()).hexdigest()

# 审计日志存储
"""
存储方案:
  热数据 (30天): Elasticsearch / ClickHouse → 快速查询
  温数据 (1年):  S3 + Parquet → 定期审计   
  冷数据 (7年):  S3 Glacier → 合规保留

WORM (Write Once Read Many):
  - S3 Object Lock — 对象不可删除/覆盖
  - 满足金融/医疗合规的日志保留要求
"""

# 合规报告生成
def generate_compliance_report(period: str) -> dict:
    return {
        "period": period,
        "total_requests": count_requests(period),
        "human_escalation_rate": calc_escalation_rate(period),
        "guardrail_triggers": count_guardrail_triggers(period),
        "pii_access_log": list_pii_accesses(period),
        "data_classification_summary": classify_data_access(period),
        "model_versions_used": list_model_versions(period),
        "anomaly_events": list_anomalies(period),
    }`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 数据主权与隐私</h2>
        <div className="info-box">
          <h3>📋 Agent 数据合规要点</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>合规法规</th><th>Agent 影响</th><th>应对措施</th></tr>
            </thead>
            <tbody>
              <tr><td>GDPR (欧盟)</td><td>用户数据发送到 LLM API</td><td>本地部署 / 数据脱敏</td></tr>
              <tr><td>中国数据安全法</td><td>数据出境限制</td><td>国内模型 / 阿里云/腾讯云</td></tr>
              <tr><td>HIPAA (医疗)</td><td>PHI 不可外传</td><td>本地模型 + BAA 协议</td></tr>
              <tr><td>SOC 2</td><td>访问控制审计</td><td>RBAC + 日志 + 加密</td></tr>
              <tr><td>AI Act (欧盟)</td><td>高风险 AI 系统认定</td><td>人工监督 + 可解释性</td></tr>
              <tr><td>行业标准</td><td>金融/保险特殊要求</td><td>模型可解释 + 公平性审计</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 责任归属与风控</h2>
        <div className="concept-card">
          <h3>⚠️ Agent 决策的责任链</h3>
          <div className="code-block">
{`# Agent 出错了谁负责?
"""
责任归属矩阵:

  Agent 决策类型     │ 责任主体        │ 风控措施
  ─────────────────┼────────────────┼──────────────
  信息回答错误       │ 知识库维护方    │ 免责声明+溯源
  工具操作错误       │ Agent 运营方    │ 审批+回滚能力
  推荐导致损失       │ 需法律判定      │ 投资者适当性
  泄露用户隐私       │ 数据控制方      │ PII脱敏+加密
  歧视性决策        │ 模型训练方+部署 │ 公平性审计
  
关键原则:
  1. 可追溯: 每个决策都能追溯到数据+模型+Prompt
  2. 可解释: 用户有权了解 Agent 为什么这样决策
  3. 可回滚: 高风险操作必须支持撤销
  4. 免责声明: 明确告知用户 AI 生成内容的局限性
  5. 兜底方案: 永远有人工兜底的路径
"""

# 风控分级策略
risk_levels = {
    "P0_critical": {
        "actions": ["资金转账", "账户删除", "合同签署"],
        "policy": "双人审批 + 延迟执行 + 短信确认",
        "rollback": "7天内可撤销"
    },
    "P1_high": {
        "actions": ["订单修改", "权限变更", "发送通知"],
        "policy": "单人审批 + 审计日志",
        "rollback": "24小时内可撤销"
    },
    "P2_medium": {
        "actions": ["信息查询", "报告生成", "数据分析"],
        "policy": "自动执行 + 异步审计",
        "rollback": "N/A (只读操作)"
    },
    "P3_low": {
        "actions": ["闲聊", "帮助文档", "状态查询"],
        "policy": "自动执行 + 采样审计",
        "rollback": "N/A"
    }
}`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：成本工程</span>
        <span className="nav-next">下一模块：平台化运营 →</span>
      </div>
    </div>
  );
}
