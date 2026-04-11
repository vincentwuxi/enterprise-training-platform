import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 07 — Agent 评估
   工具调用 / 轨迹评估 / 任务完成率
   ───────────────────────────────────────────── */

const AGENT_DIMENSIONS = [
  { name: '任务完成率', icon: '✅', weight: '30%',
    desc: 'Agent 是否最终完成了用户的任务？',
    metrics: ['Binary success (0/1)', '部分完成度 (0-1 连续)', '超时 vs 成功 vs 失败'],
    code: `def evaluate_task_completion(agent_result, ground_truth):
    """评估任务是否完成"""
    if agent_result["status"] == "error":
        return 0.0
    if agent_result["status"] == "timeout":
        return 0.0
    
    # 检查关键输出是否匹配
    key_facts = extract_key_facts(ground_truth)
    matched = sum(1 for f in key_facts 
                  if f in agent_result["output"])
    return matched / len(key_facts)` },
  { name: '工具调用正确性', icon: '🔧', weight: '25%',
    desc: 'Agent 是否调用了正确的工具、传入了正确的参数？',
    metrics: ['工具选择准确率', '参数正确率', '调用顺序正确性', '错误恢复能力'],
    code: `def evaluate_tool_calls(predicted_calls, expected_calls):
    """评估工具调用的正确性"""
    scores = {
        "tool_selection": 0,  # 是否选择了正确的工具
        "arg_accuracy": 0,    # 参数是否正确
        "order_correct": 0,   # 调用顺序是否正确
    }
    
    for pred, exp in zip(predicted_calls, expected_calls):
        if pred["tool_name"] == exp["tool_name"]:
            scores["tool_selection"] += 1
        if pred["arguments"] == exp["arguments"]:
            scores["arg_accuracy"] += 1
    
    # 检查顺序（编辑距离）
    scores["order_correct"] = 1 - levenshtein(
        [p["tool_name"] for p in predicted_calls],
        [e["tool_name"] for e in expected_calls]
    ) / max(len(predicted_calls), len(expected_calls))
    
    return {k: v/len(expected_calls) for k, v in scores.items()}` },
  { name: '轨迹质量', icon: '🛤️', weight: '20%',
    desc: 'Agent 的推理路径是否高效、合理？有没有多余的步骤？',
    metrics: ['步骤效率 (实际步数/最优步数)', '无效动作比例', '循环检测', '回溯率'],
    code: `def evaluate_trajectory(trajectory, optimal_trajectory):
    """评估 Agent 轨迹质量"""
    # 步骤效率
    efficiency = len(optimal_trajectory) / max(len(trajectory), 1)
    
    # 无效动作（不推进任务的步骤）
    invalid_actions = sum(
        1 for step in trajectory 
        if step["type"] == "thought" and not step["advances_task"]
    )
    invalid_ratio = invalid_actions / max(len(trajectory), 1)
    
    # 循环检测
    seen_states = set()
    loops = 0
    for step in trajectory:
        state_hash = hash(str(step["state"]))
        if state_hash in seen_states:
            loops += 1
        seen_states.add(state_hash)
    
    return {
        "efficiency": min(efficiency, 1.0),
        "invalid_ratio": invalid_ratio,
        "loops": loops,
        "total_steps": len(trajectory),
        "optimal_steps": len(optimal_trajectory),
    }` },
  { name: '安全与授权', icon: '🛡️', weight: '15%',
    desc: 'Agent 是否遵守了权限边界？有没有执行越权操作？',
    metrics: ['越权调用检测', '敏感数据泄露', '未确认的破坏操作', '权限升级检测'],
    code: `def evaluate_safety(trajectory, permissions):
    """评估 Agent 安全性"""
    violations = []
    for step in trajectory:
        if step["type"] == "tool_call":
            tool = step["tool_name"]
            # 检查是否有调用权限
            if tool not in permissions["allowed_tools"]:
                violations.append({
                    "type": "unauthorized_tool",
                    "tool": tool,
                    "step": step["index"]
                })
            # 检查是否执行了破坏操作
            if tool in ["delete_file", "drop_table", "send_email"]:
                if not step.get("user_confirmed"):
                    violations.append({
                        "type": "unconfirmed_destructive",
                        "tool": tool,
                    })
    return {
        "violations": violations,
        "safe": len(violations) == 0,
        "severity": max((v.get("severity", 1) for v in violations), default=0)
    }` },
  { name: '成本效率', icon: '💰', weight: '10%',
    desc: '完成任务消耗了多少 Token / API 调用？',
    metrics: ['Token 总消耗', 'API 调用次数', '延迟（端到端）', '每任务成本'],
    code: `def evaluate_cost(trajectory):
    """评估成本效率"""
    total_tokens = sum(s.get("tokens", 0) for s in trajectory)
    total_calls = sum(1 for s in trajectory if s["type"] == "llm_call")
    total_time = trajectory[-1]["timestamp"] - trajectory[0]["timestamp"]
    
    return {
        "total_tokens": total_tokens,
        "total_calls": total_calls,
        "total_time_ms": total_time,
        "cost_usd": total_tokens * 0.000003,  # 按 $3/M tokens
    }` },
];

const FRAMEWORKS = [
  { name: 'AgentBench', org: 'Tsinghua', desc: '8 个真实环境的 Agent 基准', tasks: 'OS/DB/WebBrowsing/Game', url: 'github.com/THUDM/AgentBench' },
  { name: 'SWE-bench', org: 'Princeton', desc: '从 GitHub Issue 到 PR 的代码修复', tasks: '2294 个真实 Issue', url: 'swe-bench.com' },
  { name: 'GAIA', org: 'Meta/HuggingFace', desc: '需要多步推理 + 工具使用的 QA', tasks: '466 题，3 个难度级别', url: 'huggingface.co/gaia-benchmark' },
  { name: 'WebArena', org: 'CMU', desc: '真实网站上的网页操作任务', tasks: '812 个浏览器操作任务', url: 'webarena.dev' },
  { name: 'ToolBench', org: '清华/RapidAPI', desc: '16000+ 真实 API 的工具使用评估', tasks: '跨 16K API 的复杂任务', url: 'github.com/OpenBMB/ToolBench' },
];

export default function LessonAgentEval() {
  const [dimIdx, setDimIdx] = useState(0);

  return (
    <div className="lesson-eval">
      <div className="ev-badge indigo">📊 module_07 — Agent 评估</div>

      <div className="ev-hero">
        <h1>Agent 评估：比 LLM 更难衡量的系统</h1>
        <p>
          Agent 不仅要"说得对"，还要"做得对"。工具选择、调用顺序、轨迹效率、
          安全合规——每一层都可能出错。本模块构建<strong>五维 Agent 评估框架</strong>，
          并介绍五大 Agent 基准测试。
        </p>
      </div>

      {/* ─── 五维评估 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">📐 五维评估框架</h2>
        <div className="ev-pills">
          {AGENT_DIMENSIONS.map((d, i) => (
            <button key={i} className={`ev-btn ${i === dimIdx ? 'primary' : 'indigo'}`}
              onClick={() => setDimIdx(i)} style={{ fontSize: '0.78rem' }}>
              {d.icon} {d.name}
            </button>
          ))}
        </div>

        <div className="ev-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#a5b4fc' }}>{AGENT_DIMENSIONS[dimIdx].icon} {AGENT_DIMENSIONS[dimIdx].name}</h3>
            <span className="ev-tag indigo">权重: {AGENT_DIMENSIONS[dimIdx].weight}</span>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: '0 0 1rem' }}>{AGENT_DIMENSIONS[dimIdx].desc}</p>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#5eead4', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>子指标：</h4>
            <div className="ev-grid-2">
              {AGENT_DIMENSIONS[dimIdx].metrics.map((m, i) => (
                <div key={i} style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                  📌 {m}
                </div>
              ))}
            </div>
          </div>

          <div className="ev-code-wrap">
            <div className="ev-code-head">
              <span className="ev-code-dot" style={{ background: '#ef4444' }} />
              <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
              <span className="ev-code-dot" style={{ background: '#10b981' }} />
              🐍 agent_eval.py
            </div>
            <pre className="ev-code">{AGENT_DIMENSIONS[dimIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* ─── 基准测试 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🏆 五大 Agent 基准测试</h2>
        <div className="ev-card">
          <table className="ev-table">
            <thead><tr><th>基准</th><th>机构</th><th>说明</th><th>任务范围</th></tr></thead>
            <tbody>
              {FRAMEWORKS.map((f, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#5eead4' }}>{f.name}</strong></td>
                  <td style={{ color: '#94a3b8' }}>{f.org}</td>
                  <td style={{ color: '#94a3b8' }}>{f.desc}</td>
                  <td><span className="ev-tag teal">{f.tasks}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ev-nav">
        <button className="ev-btn">← RAG 评估</button>
        <button className="ev-btn gold">评估 Pipeline →</button>
      </div>
    </div>
  );
}
