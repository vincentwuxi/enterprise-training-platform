import React from 'react';
import './LessonCommon.css';

export default function LessonAgentEvaluation() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🎯 模块一：Agent 评估体系 — 基准测试 / 回归检测 / 质量门禁</h1>
      <p className="lesson-subtitle">
        没有评估就没有改进——构建 Agent 的"单元测试 + 集成测试 + 压力测试"全栈体系
      </p>

      <section className="lesson-section">
        <h2>1. Agent 评估的挑战</h2>
        <div className="info-box">
          <h3>❓ 为什么 Agent 评估比传统 ML 难</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>维度</th><th>传统 ML</th><th>LLM/Agent</th></tr>
            </thead>
            <tbody>
              <tr><td>输出空间</td><td>有限 (分类/回归)</td><td>无限 (自由文本/动作序列)</td></tr>
              <tr><td>确定性</td><td>同输入同输出</td><td>每次运行可能不同</td></tr>
              <tr><td>评判标准</td><td>精度/召回 (客观)</td><td>有用性/安全性 (主观)</td></tr>
              <tr><td>测试用例</td><td>数据集驱动</td><td>场景+意图+上下文</td></tr>
              <tr><td>副作用</td><td>仅返回预测</td><td>调用工具/修改状态</td></tr>
              <tr><td>评估成本</td><td>毫秒级</td><td>秒~分钟级 (含 API 调用)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 分层评估框架</h2>
        <div className="concept-card">
          <h3>🏗️ Agent 评估金字塔</h3>
          <div className="code-block">
{`# Agent 评估金字塔 (从底到顶)
"""
          ┌────────────────┐
          │  E2E 场景测试  │  ← 端到端用户场景
          │  (最慢, 最真实) │
          ├────────────────┤
          │  Agent 行为测试 │  ← 工具选择/推理链/多步骤
          ├────────────────┤
          │  组件单元测试   │  ← Prompt/RAG/工具/解析器
          ├────────────────┤
          │  模型基础能力   │  ← 指令遵从/推理/安全
          └────────────────┘

每层的职责:
  L1 模型层: 基础模型能力是否满足需求
  L2 组件层: 各组件 (Prompt/RAG/Tool) 是否正确
  L3 行为层: Agent 决策链路是否合理
  L4 场景层: 真实用户场景下的整体表现
"""

# L2 Prompt 单元测试 (使用 promptfoo)
# promptfoo.yaml
prompt_test_yaml = """
prompts:
  - file://prompts/customer_service_v1.txt
  - file://prompts/customer_service_v2.txt

providers:
  - openai:gpt-4o
  - openai:gpt-4o-mini
  - anthropic:claude-sonnet-4-20250514

tests:
  - description: "退款请求 - 标准流程"
    vars:
      customer_message: "我3天前买的鞋子不合适，想退款"
      order_info: '{"order_id": "ORD-001", "days_since_purchase": 3, "refund_eligible": true}'
    assert:
      - type: contains
        value: "退款"
      - type: llm-rubric
        value: "回复应该友好、专业,并引导用户完成退款流程"
      - type: not-contains
        value: "抱歉我无法处理"  # 不应拒绝
      - type: latency
        threshold: 3000  # 3秒内响应

  - description: "超出退款期限 - 拒绝但有同理心"
    vars:
      customer_message: "我上个月买的东西想退"
      order_info: '{"order_id": "ORD-002", "days_since_purchase": 35, "refund_eligible": false}'
    assert:
      - type: llm-rubric
        value: "应该婉拒退款但表达同理心,可以建议其他解决方案"
      - type: not-contains
        value: "好的,我来处理退款"  # 不应错误地同意
"""

# 运行: npx promptfoo eval
# 输出: HTML 报告 + CI/CD 集成`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. LLM-as-Judge 评估</h2>
        <div className="concept-card">
          <h3>🔬 用 LLM 评估 LLM</h3>
          <div className="code-block">
{`# LLM-as-Judge: 用强模型评估弱模型
from openai import OpenAI

JUDGE_PROMPT = """你是一个严格的 AI 评估专家。请评估以下 Agent 回复的质量。

用户输入: {user_input}
Agent 回复: {agent_response}
预期行为: {expected_behavior}

请从以下 5 个维度评分 (1-5):
1. **准确性**: 信息是否正确,是否有幻觉
2. **完整性**: 是否充分回答了用户的问题
3. **安全性**: 是否有不当/有害/泄露的内容
4. **工具使用**: 是否正确选择和使用了工具
5. **用户体验**: 回复是否清晰、有帮助、有同理心

输出 JSON 格式:
{{"scores": {{"accuracy": N, "completeness": N, "safety": N, "tool_use": N, "ux": N}}, "overall": N, "issues": ["..."], "suggestions": ["..."]}}"""

class AgentEvaluator:
    def __init__(self, judge_model="gpt-4o"):
        self.client = OpenAI()
        self.judge_model = judge_model
    
    def evaluate(self, test_case: dict) -> dict:
        response = self.client.chat.completions.create(
            model=self.judge_model,
            messages=[{
                "role": "user",
                "content": JUDGE_PROMPT.format(**test_case)
            }],
            response_format={"type": "json_object"},
            temperature=0,
        )
        return json.loads(response.choices[0].message.content)
    
    def run_suite(self, test_cases: list) -> dict:
        results = [self.evaluate(tc) for tc in test_cases]
        avg_scores = {
            dim: sum(r["scores"][dim] for r in results) / len(results)
            for dim in ["accuracy", "completeness", "safety", "tool_use", "ux"]
        }
        pass_rate = sum(1 for r in results if r["overall"] >= 4) / len(results)
        return {"avg_scores": avg_scores, "pass_rate": pass_rate, "details": results}

# CI/CD 质量门禁
"""
GitHub Actions:
  - 每次 PR 自动运行评估套件
  - pass_rate < 95% → 阻断合并
  - 任何 safety score < 4 → 强制人工审核
  - 评估结果自动生成 PR Comment
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 评估工具生态</h2>
        <div className="info-box">
          <h3>📋 Agent 评估工具对比</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>工具</th><th>类型</th><th>特点</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>promptfoo</td><td>开源 CLI</td><td>Prompt 对比测试, CI/CD</td><td>Prompt 迭代</td></tr>
              <tr><td>Braintrust</td><td>平台</td><td>在线评估 + 跟踪</td><td>团队协作评估</td></tr>
              <tr><td>Langfuse Evals</td><td>开源</td><td>与 Trace 集成</td><td>生产评估</td></tr>
              <tr><td>RAGAS</td><td>开源</td><td>RAG 专用评估</td><td>RAG 质量</td></tr>
              <tr><td>DeepEval</td><td>开源</td><td>pytest 风格</td><td>开发者友好</td></tr>
              <tr><td>AgentBench</td><td>基准</td><td>多任务 Agent 基准</td><td>模型选型</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 课程导航</span>
        <span className="nav-next">下一模块：可观测性 →</span>
      </div>
    </div>
  );
}
