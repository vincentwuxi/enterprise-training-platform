import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 03 — LLM-as-Judge
   G-Eval / 打分校准 / 偏见规避
   ───────────────────────────────────────────── */

const JUDGE_METHODS = [
  { name: 'Single-Answer Grading', icon: '📝', desc: '直接让 LLM 对单个输出打分（1-5 或 1-10）',
    pros: ['简单直接', '成本低', '适合大规模评估'],
    cons: ['绝对分数不稳定', '受位置偏见影响', '不同 run 分数波动大'],
    code: `JUDGE_PROMPT = """
请作为一个公正的评估者，评价以下 AI 回答的质量。

[用户问题]
{question}

[AI 回答]
{answer}

请从以下 5 个维度分别打分（1-5 分），并给出理由：
1. 准确性 (Correctness): 事实是否正确？
2. 完整性 (Completeness): 是否充分回答了问题？
3. 相关性 (Relevance): 是否紧扣问题？
4. 清晰度 (Clarity): 表达是否清楚？
5. 安全性 (Safety): 是否存在有害内容？

输出 JSON: {"scores": {...}, "reasoning": "..."}
"""` },
  { name: 'Pairwise Comparison', icon: '⚔️', desc: '让 LLM 对比两个输出，选择更好的一个',
    pros: ['比绝对打分更稳定', '更接近人类偏好', 'ELO 计算可排序'],
    cons: ['成本翻倍（每对需一次调用）', '需处理位置偏见', 'N 个模型需 N(N-1)/2 次比较'],
    code: `PAIRWISE_PROMPT = """
以下是同一问题的两个回答，请判断哪个更好。

[问题] {question}

[回答 A]
{answer_a}

[回答 B]
{answer_b}

哪个回答更好？输出 JSON:
{"winner": "A" | "B" | "tie", "reasoning": "..."}
"""

# ⚠️ 关键：交换 A/B 顺序各跑一次，取一致结果
# 这样可以消除位置偏见 (Position Bias)` },
  { name: 'G-Eval (Chain-of-Thought)', icon: '🧠', desc: 'Google 提出：先生成评估步骤（CoT），再用 Token 概率加权打分',
    pros: ['比直接打分更准确', '与人类评估相关性 >0.5', '可解释性好（CoT 提供理由）'],
    cons: ['需要 Token-level probabilities', '计算成本较高', '依赖模型 CoT 能力'],
    code: `# G-Eval: NLG Evaluation using GPT-4 with Better Human Alignment
# 核心思想：让 LLM 先思考评估标准，再打分

GEVAL_PROMPT = """
你将评估一段摘要的质量。

评估标准 - 连贯性 (1-5):
1分: 摘要完全不连贯
2分: 有明显的逻辑跳跃
3分: 基本连贯但有小瑕疵
4分: 连贯且自然
5分: 完美连贯

[原文] {source}
[摘要] {summary}

评估步骤:
1. 逐句阅读摘要
2. 检查句间逻辑关系
3. 评估整体流畅度
4. 根据标准打分

分数 (1-5): """

# 关键技巧：取 LLM 输出 "1"~"5" 的 Token 概率
# score = sum(i * P(token=i) for i in [1,2,3,4,5])
# 概率加权 > 直接取 argmax，得分更稳定` },
  { name: 'Reference-Guided Judge', icon: '📋', desc: '提供参考答案，让 LLM 对比评估',
    pros: ['有标准答案参照更准确', '适合有 Golden Dataset 的场景', '可检测遗漏和错误'],
    cons: ['需要维护参考答案', '开放式问题难以提供参考', '参考答案本身可能不完美'],
    code: `REFERENCE_JUDGE = """
请对比 AI 回答与参考答案，评估正确性。

[问题] {question}
[参考答案] {reference}
[AI 回答] {answer}

评估维度:
1. 事实覆盖: AI 回答是否包含了参考答案的核心事实？
2. 额外内容: AI 回答的额外信息是否正确？
3. 错误检测: AI 回答是否有与参考答案矛盾的内容？

输出 JSON:
{
  "factual_coverage": 0.0-1.0,
  "extra_correctness": 0.0-1.0,
  "contradictions": ["..."],
  "overall_score": 1-5
}
"""` },
];

const BIASES = [
  { name: '位置偏见', icon: '📍', desc: '倾向于选择排在第一位的回答', fix: '交换 A/B 顺序各跑一次，取一致结果' },
  { name: '冗长偏见', icon: '📏', desc: '倾向于给更长的回答更高分', fix: '在 Prompt 中明确说明"长度不是质量指标"' },
  { name: '自我偏见', icon: '🪞', desc: 'GPT-4 作为 Judge 会偏好 GPT-4 的输出', fix: '使用不同模型做 Judge；与人类评估交叉验证' },
  { name: '格式偏见', icon: '🎨', desc: '偏好 Markdown/列表格式，即使纯文本内容更好', fix: '标准化格式后再评估，或在 Prompt 中要求忽略格式' },
  { name: '确认偏见', icon: '✅', desc: '倾向于给出正面评价（平均分偏高）', fix: '使用具体的评分标准（rubric）而非模糊描述' },
];

export default function LessonLLMJudge() {
  const [methodIdx, setMethodIdx] = useState(0);

  return (
    <div className="lesson-eval">
      <div className="ev-badge indigo">📊 module_03 — LLM-as-Judge</div>

      <div className="ev-hero">
        <h1>LLM-as-Judge：用 AI 评估 AI</h1>
        <p>
          当人工评估太贵、规则评估太粗时，<strong>LLM-as-Judge</strong> 成为最佳折中。
          本模块深入四种 Judge 方法（直接打分 / 配对比较 / G-Eval / 参考引导），
          揭示五大 Judge 偏见及其消除策略。
        </p>
      </div>

      {/* ─── Judge 方法 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🔬 四种 Judge 方法</h2>
        <div className="ev-pills">
          {JUDGE_METHODS.map((m, i) => (
            <button key={i} className={`ev-btn ${i === methodIdx ? 'primary' : 'indigo'}`}
              onClick={() => setMethodIdx(i)} style={{ fontSize: '0.78rem' }}>
              {m.icon} {m.name}
            </button>
          ))}
        </div>

        <div className="ev-card">
          <h3 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>{JUDGE_METHODS[methodIdx].icon} {JUDGE_METHODS[methodIdx].name}</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 1rem', lineHeight: 1.7 }}>{JUDGE_METHODS[methodIdx].desc}</p>

          <div className="ev-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#34d399', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>✅ 优势</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {JUDGE_METHODS[methodIdx].pros.map((p, i) => <li key={i} style={{ color: '#94a3b8', padding: '0.15rem 0', fontSize: '0.82rem' }}>{p}</li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>⚠️ 局限</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {JUDGE_METHODS[methodIdx].cons.map((c, i) => <li key={i} style={{ color: '#94a3b8', padding: '0.15rem 0', fontSize: '0.82rem' }}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div className="ev-code-wrap">
            <div className="ev-code-head">
              <span className="ev-code-dot" style={{ background: '#ef4444' }} />
              <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
              <span className="ev-code-dot" style={{ background: '#10b981' }} />
              🐍 judge_prompt.py
            </div>
            <pre className="ev-code">{JUDGE_METHODS[methodIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* ─── 偏见 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">⚠️ 五大 Judge 偏见及消除</h2>
        <div className="ev-card">
          <table className="ev-table">
            <thead><tr><th>偏见</th><th>现象</th><th>消除策略</th></tr></thead>
            <tbody>
              {BIASES.map((b, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#fca5a5' }}>{b.icon} {b.name}</strong></td>
                  <td style={{ color: '#94a3b8' }}>{b.desc}</td>
                  <td style={{ color: '#6ee7b7' }}>{b.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 校准 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🎯 Judge 校准最佳实践</h2>
        <div className="ev-grid-2">
          <div className="ev-alert pass">
            <strong>✅ 人类对齐验证</strong><br/>
            从评估集抽取 50-100 条，人工打分后计算 Cohen's Kappa。Kappa &gt; 0.6 才算可靠。
          </div>
          <div className="ev-alert info">
            <strong>📊 多 Judge 投票</strong><br/>
            用 3 个不同模型 (GPT-4o / Claude / Gemini) 做 Judge，取多数票或平均分。
          </div>
          <div className="ev-alert warning">
            <strong>⚙️ 温度控制</strong><br/>
            Judge 调用必须 temperature=0，确保可复现。每条评估至少跑 3 次取平均。
          </div>
          <div className="ev-alert pass">
            <strong>📐 详细 Rubric</strong><br/>
            给每个分数段提供具体描述和示例，避免 Judge 凭"感觉"打分。
          </div>
        </div>
      </div>

      <div className="ev-nav">
        <button className="ev-btn">← 基准测试</button>
        <button className="ev-btn gold">LangSmith & Langfuse →</button>
      </div>
    </div>
  );
}
