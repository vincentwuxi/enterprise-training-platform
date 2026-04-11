import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 01 — 评估基础
   Eval-Driven Development / 评估分类学
   ───────────────────────────────────────────── */

const EVAL_MATURITY = [
  { level: 'L0: Vibe Check', icon: '👀', desc: '手动阅读输出，凭感觉判断好不好', risk: '主观、不可复现、无法规模化', color: '#ef4444' },
  { level: 'L1: 手动评估集', icon: '📝', desc: '构建固定 Prompt+期望输出对，手动打分', risk: '覆盖率低、成本高、迭代慢', color: '#f59e0b' },
  { level: 'L2: 自动化评估', icon: '🤖', desc: '用脚本/框架自动运行评估，LLM-as-Judge', risk: '评估质量依赖 Judge 模型', color: '#eab308' },
  { level: 'L3: CI/CD 集成', icon: '🚀', desc: '评估作为 PR 门禁，阻止回归的 Prompt 合并', risk: '需要维护评估基础设施', color: '#22d3ee' },
  { level: 'L4: 线上评估闭环', icon: '🔄', desc: 'A/B 测试 + 用户反馈 → 自动构建新评估用例', risk: '数据隐私、标注成本', color: '#10b981' },
];

const EVAL_TAXONOMY = [
  { category: '自动化维度', items: [
    { name: '精确匹配 (Exact Match)', desc: '输出和参考答案完全一致', when: '代码生成、SQL、数学', difficulty: '低' },
    { name: '模糊匹配 (Fuzzy Match)', desc: 'BLEU/ROUGE/BERTScore 等模糊相似度', when: '翻译、摘要', difficulty: '低' },
    { name: '规则检查 (Rule-based)', desc: '正则/JSON Schema/格式验证', when: '结构化输出、API 调用', difficulty: '低' },
    { name: 'LLM-as-Judge', desc: '让 LLM 对输出打分或做偏好选择', when: '开放式生成、创意写作', difficulty: '中' },
    { name: '人工评估 (Human Eval)', desc: '领域专家评分', when: '最终质量把关', difficulty: '高' },
  ]},
  { category: '评估对象维度', items: [
    { name: '单轮问答', desc: '单一 Prompt → 单一 Response', when: '基础能力测试', difficulty: '低' },
    { name: '多轮对话', desc: '上下文保持、指代消解、对话连贯性', when: '聊天机器人', difficulty: '中' },
    { name: 'RAG 系统', desc: '检索质量 + 生成质量 + 忠实度', when: '知识库问答', difficulty: '中' },
    { name: 'Agent 系统', desc: '工具调用正确性 + 轨迹合理性 + 任务完成', when: '自主 Agent', difficulty: '高' },
    { name: '端到端产品', desc: '用户满意度 + 业务指标 + 安全合规', when: '生产系统', difficulty: '高' },
  ]},
];

const ANTI_PATTERNS = [
  { name: '⚠️ 只看 Benchmark', desc: 'MMLU 分数高 ≠ 产品能用。基准测试和真实业务场景之间有巨大鸿沟。' },
  { name: '⚠️ 评估集泄露', desc: '评估数据出现在训练集中，导致分数虚高。Benchmark contamination 是行业公认难题。' },
  { name: '⚠️ Goodhart 定律', desc: '"当一个指标成为目标时，它就不再是一个好指标。" 模型可能过度优化单一指标。' },
  { name: '⚠️ 一次性评估', desc: '模型、Prompt 和数据都在变。评估必须是持续的、自动化的，不是上线前跑一次。' },
  { name: '⚠️ 忽略边界情况', desc: '评估集只包含"正常"用例，忽略了对抗性输入、多语言、长上下文等边界场景。' },
];

export default function LessonEvalFundamentals() {
  const [taxIdx, setTaxIdx] = useState(0);

  return (
    <div className="lesson-eval">
      <div className="ev-badge">📊 module_01 — 评估基础</div>

      <div className="ev-hero">
        <h1>评估基础：从 Vibe Check 到 Eval-Driven Development</h1>
        <p>
          "If you can't measure it, you can't improve it." — AI 产品的每一次迭代，
          都应该由<strong>评估数据驱动</strong>。本模块建立评估方法论框架：
          五级成熟度模型、评估分类学（自动化 × 评估对象）、以及常见反模式。
        </p>
      </div>

      {/* ─── 成熟度模型 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🎯 评估成熟度五级模型</h2>
        {EVAL_MATURITY.map((l, i) => (
          <div key={i} className="ev-card" style={{ borderLeftColor: l.color, borderLeftWidth: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: l.color }}>{l.icon} {l.level}</h3>
              <div className="ev-score">
                <div className="ev-score-bar" style={{ width: '120px' }}>
                  <div className="ev-score-fill" style={{ width: `${(i + 1) * 20}%`, background: l.color }} />
                </div>
                <span className="ev-score-label" style={{ color: l.color }}>L{i}</span>
              </div>
            </div>
            <p style={{ color: '#94a3b8', margin: '0 0 0.3rem', fontSize: '0.88rem' }}>{l.desc}</p>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>⚠️ 风险: {l.risk}</span>
          </div>
        ))}
      </div>

      {/* ─── 评估分类学 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">📐 评估分类学</h2>
        <div className="ev-pills">
          {EVAL_TAXONOMY.map((cat, i) => (
            <button key={i} className={`ev-btn ${i === taxIdx ? 'primary' : ''}`}
              onClick={() => setTaxIdx(i)} style={{ fontSize: '0.8rem' }}>
              {cat.category}
            </button>
          ))}
        </div>
        <div className="ev-card">
          <table className="ev-table">
            <thead>
              <tr><th>方法</th><th>说明</th><th>适用场景</th><th>成本</th></tr>
            </thead>
            <tbody>
              {EVAL_TAXONOMY[taxIdx].items.map((item, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#5eead4' }}>{item.name}</strong></td>
                  <td style={{ color: '#94a3b8' }}>{item.desc}</td>
                  <td style={{ color: '#94a3b8' }}>{item.when}</td>
                  <td><span className={`ev-tag ${item.difficulty === '低' ? 'green' : item.difficulty === '中' ? 'gold' : 'coral'}`}>{item.difficulty}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Eval-Driven Development ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🔄 Eval-Driven Development 流程</h2>
        <div className="ev-code-wrap">
          <div className="ev-code-head">
            <span className="ev-code-dot" style={{ background: '#ef4444' }} />
            <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
            <span className="ev-code-dot" style={{ background: '#10b981' }} />
            📋 eval_driven_dev.md
          </div>
          <pre className="ev-code">{`# Eval-Driven Development (EDD) — 核心流程

## 1. 失败先行 (Failure First)
── 从用户报告的 bad case 开始
── 每个 bug 转化为一个评估用例
── 构建 "LLM 的单元测试"

## 2. 评估集构建 (Dataset)
── Golden dataset: 人工标注的高质量测试集 (~200-500 条)
── Silver dataset: LLM 辅助生成 + 人工审核 (~2000 条)
── Edge cases: 对抗性/多语言/长上下文/格式化场景

## 3. 基线测量 (Baseline)
── 在修改前跑一次完整评估，记录基线分数
── 多指标并行: 准确率 + 延迟 + 成本 + 安全

## 4. 迭代修改 (Iterate)
── 修改 Prompt / 模型 / 参数
── 保持其他变量不变（控制变量法）

## 5. 回归测试 (Regression)
── 确认新改动没有破坏已修复的 case
── 评估分数必须 >= 基线才能合并

## 6. 部署 + 监控 (Deploy & Monitor)
── A/B 测试验证线上效果
── 用户反馈 → 新评估用例 → 回到 Step 1`}</pre>
        </div>
      </div>

      {/* ─── 反模式 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🚫 评估五大反模式</h2>
        <div className="ev-grid-2">
          {ANTI_PATTERNS.map((a, i) => (
            <div key={i} className="ev-alert warning">
              <strong>{a.name}</strong><br/>{a.desc}
            </div>
          ))}
        </div>
      </div>

      <div className="ev-nav">
        <span />
        <button className="ev-btn gold">基准测试百科 →</button>
      </div>
    </div>
  );
}
