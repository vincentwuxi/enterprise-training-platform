import React from 'react';
import './LessonCommon.css';

export default function LessonHumanAgentCollab() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🤝 模块四：人机协作设计 — HITL / 审批流 / 置信度路由 / 回退策略</h1>
      <p className="lesson-subtitle">
        最好的 Agent 不是替代人，而是与人协作——设计优雅的人机交互模式
      </p>

      <section className="lesson-section">
        <h2>1. 人机协作策略矩阵</h2>
        <div className="info-box">
          <h3>📐 何时需要人类介入</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>场景</th><th>Agent 角色</th><th>人类角色</th><th>模式</th></tr>
            </thead>
            <tbody>
              <tr><td>低风险 + 高置信</td><td>自主执行</td><td>异步审计</td><td>全自动</td></tr>
              <tr><td>低风险 + 低置信</td><td>草拟方案</td><td>选择/修改</td><td>建议模式</td></tr>
              <tr><td>高风险 + 高置信</td><td>准备执行</td><td>一键审批</td><td>审批模式</td></tr>
              <tr><td>高风险 + 低置信</td><td>收集信息</td><td>完全决策</td><td>辅助模式</td></tr>
              <tr><td>超出能力范围</td><td>承认局限</td><td>接管处理</td><td>优雅转人工</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. HITL (Human-in-the-Loop) 实现</h2>
        <div className="concept-card">
          <h3>🔄 人机协作工作流引擎</h3>
          <div className="code-block">
{`# HITL 审批工作流实现
from enum import Enum
from dataclasses import dataclass
import asyncio

class ApprovalStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    MODIFIED = "modified"
    TIMEOUT = "timeout"

@dataclass
class ApprovalRequest:
    action: str
    parameters: dict
    risk_level: str        # low/medium/high/critical
    confidence: float
    context: str
    timeout_seconds: int = 300  # 5分钟超时
    auto_approve_if: str | None = None  # 自动审批条件

class HITLWorkflow:
    """人机协作工作流引擎"""
    
    # 自动化等级配置
    AUTOMATION_POLICY = {
        "search_info":     {"auto": True,  "audit": False},
        "send_email":      {"auto": False, "notify": "slack", "timeout": 300},
        "refund_small":    {"auto": True,  "max_amount": 100, "audit": True},
        "refund_large":    {"auto": False, "notify": "pagerduty", "timeout": 600},
        "modify_account":  {"auto": False, "requires": "manager_approval"},
        "delete_data":     {"auto": False, "requires": "double_approval"},
    }
    
    async def request_approval(self, request: ApprovalRequest) -> ApprovalStatus:
        policy = self.AUTOMATION_POLICY.get(request.action, {"auto": False})
        
        # 检查是否可以自动审批
        if policy.get("auto") and request.confidence > 0.95:
            if "max_amount" in policy:
                amount = request.parameters.get("amount", 0)
                if amount <= policy["max_amount"]:
                    self._log_auto_approval(request)
                    return ApprovalStatus.APPROVED
            else:
                self._log_auto_approval(request)
                return ApprovalStatus.APPROVED
        
        # 需要人工审批
        ticket = await self._create_approval_ticket(request)
        await self._notify_approver(ticket, policy)
        
        # 等待审批 (带超时)
        try:
            result = await asyncio.wait_for(
                self._wait_for_decision(ticket),
                timeout=request.timeout_seconds
            )
            return result
        except asyncio.TimeoutError:
            return await self._handle_timeout(request)
    
    async def _handle_timeout(self, request: ApprovalRequest) -> ApprovalStatus:
        """超时处理策略"""
        if request.risk_level in ("low", "medium"):
            # 低风险: 超时自动通过
            return ApprovalStatus.APPROVED
        else:
            # 高风险: 超时拒绝 + 升级
            await self._escalate(request)
            return ApprovalStatus.TIMEOUT

# 使用示例
hitl = HITLWorkflow()

async def agent_refund(customer_id: str, amount: float, reason: str):
    action = "refund_small" if amount <= 100 else "refund_large"
    
    status = await hitl.request_approval(ApprovalRequest(
        action=action,
        parameters={"customer_id": customer_id, "amount": amount},
        risk_level="low" if amount <= 100 else "high",
        confidence=0.92,
        context=f"客户 {customer_id} 因'{reason}'申请退款 ¥{amount}"
    ))
    
    if status == ApprovalStatus.APPROVED:
        execute_refund(customer_id, amount)
        return f"退款 ¥{amount} 已处理"
    elif status == ApprovalStatus.REJECTED:
        return "退款申请未通过审批，已转交客服主管"
    else:
        return "退款正在审核中，我们会尽快回复您"`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 优雅降级策略</h2>
        <div className="concept-card">
          <h3>⬇️ Agent 降级 (Graceful Degradation)</h3>
          <div className="code-block">
{`# 当 Agent 能力不足时的降级策略
"""
降级阶梯 (从高到低):
  
  Level 5: 全自主 Agent (多工具, 多步推理)
      ↓ 触发: 复杂度过高 / 置信度低
  Level 4: 简化 Agent (单工具, 直接回答)
      ↓ 触发: 工具失败 / 超时
  Level 3: RAG 检索回答 (知识库直查)
      ↓ 触发: 检索无结果
  Level 2: 模板回复 (预设回答模板)
      ↓ 触发: 全部失败
  Level 1: 转人工 (保留完整上下文)
"""

class GracefulDegradation:
    async def handle(self, user_input: str) -> str:
        # Level 5: 尝试完整 Agent
        try:
            result = await asyncio.wait_for(
                self.full_agent(user_input), timeout=30
            )
            if result.confidence > 0.7:
                return result.response
        except (TimeoutError, Exception) as e:
            log.warning(f"Full agent failed: {e}")
        
        # Level 4: 简化 Agent
        try:
            result = await asyncio.wait_for(
                self.simple_agent(user_input), timeout=15
            )
            if result.confidence > 0.6:
                return result.response + "\\n(简化模式回答)"
        except Exception as e:
            log.warning(f"Simple agent failed: {e}")
        
        # Level 3: RAG 直查
        try:
            docs = self.rag_search(user_input, top_k=3)
            if docs and docs[0].score > 0.8:
                return f"根据知识库: {docs[0].content}"
        except Exception:
            pass
        
        # Level 2: 模板回复
        template = self.match_template(user_input)
        if template:
            return template
        
        # Level 1: 转人工
        ticket = await self.create_human_ticket(
            user_input=user_input,
            context=self.get_conversation_context(),
            reason="所有自动化路径失败"
        )
        return f"抱歉,这个问题需要人工处理。已为您创建工单 #{ticket.id},客服将在 10 分钟内联系您。"
    
    def match_template(self, user_input: str) -> str | None:
        """基于意图匹配预设回复模板"""
        templates = {
            "工作时间": "我们的工作时间是周一至周五 9:00-18:00",
            "联系方式": "您可以拨打 400-xxx-xxxx 或发邮件至 help@company.com",
        }
        for keyword, response in templates.items():
            if keyword in user_input:
                return response
        return None`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 反馈循环设计</h2>
        <div className="info-box">
          <h3>📋 用户反馈 → Agent 改进闭环</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>反馈类型</th><th>收集方式</th><th>改进动作</th></tr>
            </thead>
            <tbody>
              <tr><td>显式好/差评</td><td>回复后的 👍/👎</td><td>标注数据 → 微调/Few-shot</td></tr>
              <tr><td>人工修正</td><td>人类编辑 Agent 回复</td><td>修正数据 → Prompt 优化</td></tr>
              <tr><td>选择偏好</td><td>A/B 测试选择</td><td>RLHF / DPO 训练</td></tr>
              <tr><td>行为信号</td><td>用户是否继续追问</td><td>完整性评估改进</td></tr>
              <tr><td>升级记录</td><td>Agent → 人工的次数</td><td>识别 Agent 能力短板</td></tr>
              <tr><td>任务完成</td><td>用户是否达成目标</td><td>端到端成功率优化</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：安全护栏</span>
        <span className="nav-next">下一模块：故障排查 →</span>
      </div>
    </div>
  );
}
