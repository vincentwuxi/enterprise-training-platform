import React from 'react';
import './LessonCommon.css';

export default function LessonAgentDebugging() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🔧 模块五：Agent 故障排查 — 幻觉诊断 / 工具失败 / 循环检测 / 死锁</h1>
      <p className="lesson-subtitle">
        AI Agent 的 Bug 不会抛出堆栈——掌握 Agent 特有的故障排查方法论
      </p>

      <section className="lesson-section">
        <h2>1. Agent 故障分类学</h2>
        <div className="info-box">
          <h3>🐛 Agent 生产故障 Top 10</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>排名</th><th>故障类型</th><th>频率</th><th>影响</th><th>典型症状</th></tr>
            </thead>
            <tbody>
              <tr><td>#1</td><td>幻觉/编造</td><td>高</td><td>信任危机</td><td>自信地给出错误信息</td></tr>
              <tr><td>#2</td><td>工具调用失败</td><td>高</td><td>任务中断</td><td>API 超时/参数错误</td></tr>
              <tr><td>#3</td><td>无限循环</td><td>中</td><td>成本爆炸</td><td>反复调用同一工具</td></tr>
              <tr><td>#4</td><td>上下文丢失</td><td>中</td><td>用户困惑</td><td>"忘记"之前的对话</td></tr>
              <tr><td>#5</td><td>指令漂移</td><td>中</td><td>质量下降</td><td>偏离 System Prompt</td></tr>
              <tr><td>#6</td><td>选错工具</td><td>中</td><td>错误操作</td><td>用搜索代替查询DB</td></tr>
              <tr><td>#7</td><td>参数提取错误</td><td>中</td><td>工具误操作</td><td>日期/金额解析错误</td></tr>
              <tr><td>#8</td><td>并发竞态</td><td>低</td><td>数据不一致</td><td>多 Agent 操作同一资源</td></tr>
              <tr><td>#9</td><td>令牌溢出</td><td>低</td><td>截断/报错</td><td>上下文超过窗口限制</td></tr>
              <tr><td>#10</td><td>模型退化</td><td>低</td><td>渐进质量下降</td><td>API 提供商模型更新</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 循环与死锁检测</h2>
        <div className="concept-card">
          <h3>🔄 Agent 循环检测与断路器</h3>
          <div className="code-block">
{`# Agent 循环检测与自动断路
class AgentCircuitBreaker:
    """Agent 循环/死锁检测与断路器"""
    
    def __init__(self, max_iterations=15, max_same_tool=5, max_cost=1.0):
        self.max_iterations = max_iterations
        self.max_same_tool = max_same_tool
        self.max_cost_usd = max_cost
        self.history = []
        self.total_cost = 0.0
    
    def check(self, step: dict) -> tuple[bool, str | None]:
        """每步调用前检查,返回 (是否继续, 中止原因)"""
        self.history.append(step)
        self.total_cost += step.get("cost", 0)
        
        # 检查 1: 总迭代次数
        if len(self.history) > self.max_iterations:
            return False, f"超过最大迭代次数 ({self.max_iterations})"
        
        # 检查 2: 相同工具连续调用
        recent_tools = [h["tool"] for h in self.history[-self.max_same_tool:]]
        if len(recent_tools) == self.max_same_tool and len(set(recent_tools)) == 1:
            return False, f"工具 '{recent_tools[0]}' 连续调用 {self.max_same_tool} 次"
        
        # 检查 3: 相同参数重复调用 (死循环)
        recent = self.history[-3:]
        if len(recent) == 3:
            sigs = [f"{h['tool']}:{h.get('params','')}" for h in recent]
            if len(set(sigs)) == 1:
                return False, f"检测到重复调用模式: {sigs[0]}"
        
        # 检查 4: 成本预算
        if self.total_cost > self.max_cost_usd:
            return False, f"超过成本预算 (" + str(self.total_cost) + " > " + str(self.max_cost_usd) + ")"
        
        # 检查 5: 输出震荡 (A→B→A→B)
        if len(self.history) >= 4:
            last4 = [h.get("decision") for h in self.history[-4:]]
            if last4[0] == last4[2] and last4[1] == last4[3] and last4[0] != last4[1]:
                return False, f"检测到决策震荡: {last4}"
        
        return True, None
    
    def get_recovery_action(self, reason: str) -> str:
        """根据中止原因选择恢复策略"""
        if "连续调用" in reason or "重复调用" in reason:
            return "summarize_and_retry"  # 总结已有结果,换个思路
        elif "成本预算" in reason:
            return "switch_to_cheaper_model"  # 切换便宜模型
        elif "决策震荡" in reason:
            return "escalate_to_human"  # 交给人类决策
        else:
            return "graceful_exit"  # 优雅退出

# 使用
breaker = AgentCircuitBreaker(max_iterations=15, max_cost=0.50)

for step in agent.run(user_input):
    ok, reason = breaker.check(step)
    if not ok:
        action = breaker.get_recovery_action(reason)
        handle_circuit_break(action, reason, breaker.history)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 幻觉诊断与修复</h2>
        <div className="concept-card">
          <h3>🎭 幻觉根因分析</h3>
          <div className="code-block">
{`# 幻觉类型与根因
"""
类型 1: 知识幻觉 (Knowledge Hallucination)
  症状: 编造不存在的事实/数据
  根因: 模型预训练数据不包含该知识
  修复: 接入 RAG + 事实校验
  
类型 2: 逻辑幻觉 (Reasoning Hallucination)
  症状: 推理步骤看似合理但结论错误
  根因: 复杂推理能力不足
  修复: Chain-of-Thought + 分步验证

类型 3: 指令幻觉 (Instruction Hallucination)
  症状: 执行了用户没要求的操作
  根因: System Prompt 歧义/过长
  修复: 精简 Prompt + 明确边界

类型 4: 工具幻觉 (Tool Hallucination)
  症状: 编造工具返回结果
  根因: 工具调用失败但未正确处理
  修复: 强制检查工具返回状态

类型 5: 自信幻觉 (Confidence Hallucination)
  症状: 不确定时不说"不确定"
  根因: 模型默认生成高置信回复
  修复: 校准 + 强制输出置信度
"""

# 幻觉诊断工具
class HallucinationDiagnoser:
    def diagnose(self, response: str, context: dict) -> dict:
        checks = {
            "knowledge": self._check_knowledge(response, context.get("sources")),
            "reasoning": self._check_reasoning(response, context.get("steps")),
            "tool_result": self._check_tool_consistency(response, context.get("tool_outputs")),
            "instruction": self._check_instruction_adherence(response, context.get("system_prompt")),
        }
        
        issues = {k: v for k, v in checks.items() if v["has_issue"]}
        return {
            "hallucination_detected": len(issues) > 0,
            "issues": issues,
            "recommended_fix": self._suggest_fix(issues)
        }
    
    def _check_tool_consistency(self, response, tool_outputs):
        """检查回复是否与工具输出一致"""
        if not tool_outputs:
            return {"has_issue": False}
        
        # 用 LLM 检查一致性
        result = llm_judge(f"""
        Agent 回复: {response}
        工具返回: {tool_outputs}
        
        回复中的数据是否与工具返回一致? 
        列出所有不一致之处。
        """)
        return result`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 故障排查清单</h2>
        <div className="info-box">
          <h3>📋 Agent Ops 故障排查 Runbook</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>症状</th><th>首要检查</th><th>常见原因</th><th>修复</th></tr>
            </thead>
            <tbody>
              <tr><td>回复变差</td><td>模型版本是否变化</td><td>API 提供商更新模型</td><td>固定模型版本/回滚</td></tr>
              <tr><td>延迟飙升</td><td>Trace 时间分布</td><td>工具 API 变慢/循环</td><td>超时设置/缓存/并行</td></tr>
              <tr><td>成本异常</td><td>Token 使用趋势</td><td>Prompt 膨胀/循环</td><td>上下文压缩/断路器</td></tr>
              <tr><td>拒绝回答</td><td>护栏触发日志</td><td>护栏规则过严</td><td>调整阈值/白名单</td></tr>
              <tr><td>工具出错</td><td>工具返回状态码</td><td>API Key 过期/限流</td><td>Key 轮转/限流处理</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：人机协作</span>
        <span className="nav-next">下一模块：成本工程 →</span>
      </div>
    </div>
  );
}
