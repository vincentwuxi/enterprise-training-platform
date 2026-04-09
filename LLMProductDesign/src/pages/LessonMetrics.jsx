import { useState } from 'react';
import './LessonCommon.css';

const METRIC_LAYERS = [
  {
    key: 'usage', label: '使用率指标',
    desc: '衡量用户是否在用 AI 功能',
    metrics: [
      { name: 'AI 功能渗透率', formula: 'AI MAU / 总 MAU', good: '> 30%', warn: '< 10%' },
      { name: 'AI 功能人均使用频次', formula: 'AI 调用次数 / AI MAU', good: '每天 3+', warn: '每周 < 1' },
      { name: '功能发现率', formula: '触达 AI 入口 / 登录用户', good: '> 60%', warn: '< 30%' },
    ],
  },
  {
    key: 'quality', label: '质量指标',
    desc: '衡量 AI 输出质量',
    metrics: [
      { name: '输出采纳率', formula: '用户接受 AI 建议 / 触发 AI 次数', good: '> 50%', warn: '< 20%' },
      { name: 'Bad Case 率', formula: '用户反馈差 / AI 总调用', good: '< 1%', warn: '> 5%' },
      { name: '任务完成率', formula: '用 AI 完成目标任务 / AI 任务触发', good: '> 70%', warn: '< 40%' },
    ],
  },
  {
    key: 'business', label: '业务影响指标',
    desc: '衡量 AI 对业务核心指标的贡献',
    metrics: [
      { name: 'AI 用户留存 vs 对照组', formula: 'AI用户D30留存 - 非AI用户D30留存', good: '> +15%', warn: '< +5%' },
      { name: 'AI 用户 LTV', formula: 'AI用户平均LTV / 基线用户LTV', good: '> 1.5x', warn: '< 1.1x' },
      { name: 'AI 驱动的转化', formula: '因AI功能升级付费 / 升级总数', good: '> 20%', warn: '< 5%' },
    ],
  },
  {
    key: 'cost', label: '成本效率指标',
    desc: '衡量 AI 的成本是否合理',
    metrics: [
      { name: '每次 AI 调用成本', formula: 'Token成本 / 调用次数', good: '< $0.01', warn: '> $0.05' },
      { name: '缓存命中率', formula: '命中缓存 / 总请求', good: '> 40%', warn: '< 10%' },
      { name: 'AI Gross Margin', formula: '(AI收入 - Token成本) / AI收入', good: '> 60%', warn: '< 30%' },
    ],
  },
];

const EVAL_METHODS = [
  {
    method: 'LLM-as-Judge',
    desc: '用 GPT-4/Claude 对 AI 输出自动评分',
    code: `# 用 GPT-4 自动评判 AI 输出质量
def llm_judge(question: str, ai_answer: str, 
              ground_truth: str = None) -> dict:
    
    judge_prompt = f"""请评估以下 AI 回答的质量（1-5分）：

问题：{question}
AI 回答：{ai_answer}
{"参考答案：" + ground_truth if ground_truth else ""}

评分维度：
- 准确性（1-5）：事实是否正确
- 相关性（1-5）：是否回答了问题
- 完整性（1-5）：是否覆盖了必要信息
- 简洁性（1-5）：是否过于冗长

以 JSON 格式输出：
{{"accuracy": X, "relevance": X, "completeness": X, 
  "conciseness": X, "overall": X, "reason": "..."}}"""
    
    result = gpt4.complete(judge_prompt)
    return parse_json(result)

# 批量评估整个测试集
scores = [llm_judge(q, a) for q, a in test_pairs]
avg_score = sum(s["overall"] for s in scores) / len(scores)`,
    pros: ['可批量自动化', '成本低（$0.001/次）', '与人类判断相关性 >80%'],
  },
  {
    method: 'A/B Split Testing',
    desc: '对照组 vs 实验组，测量业务指标提升',
    code: `# AI 功能 A/B 测试设计
class AIFeatureABTest:
    def __init__(self, feature_name: str, traffic_split: float = 0.5):
        self.feature = feature_name
        self.split = traffic_split
    
    def assign_group(self, user_id: str) -> str:
        # 用用户 ID 哈希保证粘性（同用户始终在同一组）
        h = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
        return "treatment" if (h % 100) < self.split * 100 else "control"
    
    def track_metric(self, user_id: str, metric: str, value: float):
        group = self.assign_group(user_id)
        analytics.track({
            "group": group,
            "metric": metric,
            "value": value,
            "timestamp": now(),
        })
    
    def analyze(self) -> dict:
        # 计算统计显著性（t-test）
        control = get_metrics("control")
        treatment = get_metrics("treatment")
        p_value = scipy.stats.ttest_ind(control, treatment).pvalue
        lift = (mean(treatment) - mean(control)) / mean(control)
        return {"lift": lift, "p_value": p_value, 
                "significant": p_value < 0.05}`,
    pros: ['因果关系清晰', '业务指标直接量化', '有统计学背书'],
  },
];

export default function LessonMetrics() {
  const [layer, setLayer] = useState('usage');
  const [evalMethod, setEvalMethod] = useState('LLM-as-Judge');
  const ml = METRIC_LAYERS.find(x => x.key === layer);
  const em = EVAL_METHODS.find(x => x.method === evalMethod);

  return (
    <div className="lp-lesson">
      <div className="lp-container">

        <div className="lp-hero">
          <div className="lp-badge">模块五 · AI Metrics & Evaluation</div>
          <h1>AI 产品评估 & 迭代框架</h1>
          <p>AI 产品的指标体系与传统产品不同——你不仅要衡量"用了多少次"，更要衡量"AI 帮用户完成了什么"。建立四层指标体系 + LLM 评估方法论。</p>
        </div>

        <div className="lp-metrics">
          {[{ v: '4层', l: '指标体系' }, { v: 'LLM-Judge', l: '自动评估' }, { v: 'A/B Test', l: '业务验证' }, { v: 'Bad Case', l: '持续改进' }].map(m => (
            <div key={m.l} className="lp-metric-card"><div className="lp-metric-value">{m.v}</div><div className="lp-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* 4-Layer Metrics */}
        <div className="lp-section">
          <h2>📊 AI 产品四层指标体系</h2>
          <div className="lp-tabs">
            {METRIC_LAYERS.map(x => <button key={x.key} className={`lp-tab${layer === x.key ? ' active' : ''}`} onClick={() => setLayer(x.key)}>{x.label}</button>)}
          </div>
          {ml && (
            <div>
              <p style={{ color: 'var(--lp-muted)', fontSize: '.87rem', marginBottom: '1rem' }}>{ml.desc}</p>
              <div className="lp-table-wrap">
                <table className="lp-table">
                  <thead><tr><th>指标</th><th>计算公式</th><th>健康值</th><th>危险值</th></tr></thead>
                  <tbody>
                    {ml.metrics.map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td><span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.78rem', color: 'var(--lp-accent)' }}>{m.formula}</span></td>
                        <td><span className="lp-tag green">{m.good}</span></td>
                        <td><span className="lp-tag rose">{m.warn}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="lp-warn">⚠️ <span>别用<strong>"AI 调用次数"</strong>当北极星指标——次数高不等于价值高。以"用户因 AI 完成的任务数"或"AI 带来的留存提升"为目标更准确。</span></div>
        </div>

        {/* Evaluation Methods */}
        <div className="lp-section">
          <h2>🧪 AI 输出质量评估方法</h2>
          <div className="lp-tabs">
            {EVAL_METHODS.map(x => <button key={x.method} className={`lp-tab${evalMethod === x.method ? ' active' : ''}`} onClick={() => setEvalMethod(x.method)}>{x.method}</button>)}
          </div>
          {em && (
            <div>
              <p style={{ color: 'var(--lp-muted)', fontSize: '.88rem', marginBottom: '0.75rem' }}>{em.desc}</p>
              <div className="lp-code">{em.code}</div>
              <div className="lp-good">✅ <span><strong>优势：</strong>{em.pros.join(' · ')}</span></div>
            </div>
          )}
        </div>

        {/* Iteration Loop */}
        <div className="lp-section">
          <h2>🔁 AI 产品快速迭代循环</h2>
          <div className="lp-steps">
            {[
              { t: '监控 Bad Case（每日）', d: '收集用户负反馈、LLM Judge 低分输出，形成 Bad Case 数据集（目标：每周 50+ 条）' },
              { t: '根因分析（每周）', d: '分析 Bad Case 根因：是 Prompt 问题？上下文不足？模型能力限制？还是 UX 设计问题？' },
              { t: 'Prompt 迭代（每周）', d: '针对根因修改 System Prompt，在测试集上验证改善效果（Bad Case 修复率 > 60% 才发布）' },
              { t: 'A/B 测试上线（双周）', d: '重要改动用 A/B 测试上线，观察核心业务指标（留存、采纳率）是否改善' },
              { t: 'Fine-tune（季度）', d: '积累足够多的 Good Case 数据后（500+ 条），考虑对小模型 Fine-tune，降低成本同时提高质量' },
            ].map((s, i) => (
              <div key={i} className="lp-step">
                <div>
                  <div className="lp-step-title">{s.t}</div>
                  <div className="lp-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
