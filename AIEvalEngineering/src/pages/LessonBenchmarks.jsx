import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 02 — 基准测试百科
   MMLU / HumanEval / HELM / MT-Bench
   ───────────────────────────────────────────── */

const BENCHMARKS = [
  { name: 'MMLU', fullname: 'Massive Multitask Language Understanding', icon: '📚', org: 'UC Berkeley',
    category: '知识与推理', subjects: '57 学科（STEM / 人文 / 社科 / 专业）', size: '15,908 题',
    format: '4 选 1 选择题', metric: 'Accuracy (%)',
    scores: [
      { model: 'GPT-4o', score: 88.7 }, { model: 'Claude 3.5 Sonnet', score: 88.3 },
      { model: 'Gemini 1.5 Pro', score: 85.9 }, { model: 'Llama 3 70B', score: 82.0 },
      { model: 'Mixtral 8x22B', score: 77.8 },
    ],
    limitation: '选择题格式过于简单；数据可能已泄入训练集（contamination）' },
  { name: 'HumanEval', fullname: 'OpenAI HumanEval', icon: '💻', org: 'OpenAI',
    category: '代码生成', subjects: 'Python 编程题', size: '164 题',
    format: '函数实现 + 单元测试验证', metric: 'pass@k (k=1,10,100)',
    scores: [
      { model: 'GPT-4o', score: 90.2 }, { model: 'Claude 3.5 Sonnet', score: 92.0 },
      { model: 'DeepSeek Coder V2', score: 90.2 }, { model: 'Llama 3 70B', score: 81.7 },
      { model: 'CodeLlama 34B', score: 62.2 },
    ],
    limitation: '只有 164 题，覆盖面窄；不包含系统设计、调试等真实编程场景' },
  { name: 'MT-Bench', fullname: 'Multi-Turn Benchmark', icon: '💬', org: 'LMSYS',
    category: '对话能力', subjects: '8 类多轮对话（写作/推理/数学/编码/提取/角色扮演/STEM/人文）', size: '80 题（×2 轮）',
    format: '多轮对话 + GPT-4 打分', metric: 'GPT-4 评分 (1-10)',
    scores: [
      { model: 'GPT-4o', score: 9.3 }, { model: 'Claude 3.5 Sonnet', score: 9.1 },
      { model: 'Gemini 1.5 Pro', score: 8.9 }, { model: 'Llama 3 70B', score: 8.5 },
      { model: 'Mixtral 8x7B', score: 8.3 },
    ],
    limitation: '依赖 GPT-4 打分（Judge 偏见）；仅 80 题样本量小' },
  { name: 'HELM', fullname: 'Holistic Evaluation of Language Models', icon: '📊', org: 'Stanford',
    category: '综合评估', subjects: '42 场景 × 7 指标（准确率/校准度/鲁棒性/公平性/偏见/毒性/效率）', size: '10,000+ 题',
    format: '多任务多指标', metric: '多指标雷达图',
    scores: [
      { model: 'GPT-4o', score: '最佳' }, { model: 'Claude 3.5 Sonnet', score: '次佳' },
      { model: 'Gemini 1.5 Pro', score: '强' }, { model: 'Llama 3 70B', score: '良好' },
    ],
    limitation: '评估成本高（全部跑完需数千美元）；更新频率低' },
  { name: 'TruthfulQA', fullname: 'TruthfulQA', icon: '🔍', org: 'University of Oxford',
    category: '真实性', subjects: '38 类别的"容易答错"问题', size: '817 题',
    format: '生成式 + GPT-Judge 打分', metric: '% Truthful + % Informative',
    scores: [
      { model: 'GPT-4o', score: 83.0 }, { model: 'Claude 3.5', score: 81.0 },
      { model: 'Llama 3 70B', score: 65.0 }, { model: 'GPT-3.5', score: 47.0 },
    ],
    limitation: '数据集固定，新迷信/误解未覆盖；评估"真实性"本身存在争议' },
  { name: 'Chatbot Arena (ELO)', fullname: 'LMSYS Chatbot Arena', icon: '🏟️', org: 'LMSYS',
    category: '人类偏好', subjects: '真实用户盲测对比', size: '1M+ 投票',
    format: '双盲 A/B 测试 + ELO 评分', metric: 'ELO Rating',
    scores: [
      { model: 'GPT-4o', score: '1287' }, { model: 'Claude 3.5 Sonnet', score: '1271' },
      { model: 'Gemini 1.5 Pro', score: '1260' }, { model: 'Llama 3 70B', score: '1207' },
    ],
    limitation: '投票偏好受格式/长度/风格影响；英语偏重' },
];

export default function LessonBenchmarks() {
  const [benchIdx, setBenchIdx] = useState(0);
  const b = BENCHMARKS[benchIdx];

  return (
    <div className="lesson-eval">
      <div className="ev-badge gold">📊 module_02 — 基准测试百科</div>

      <div className="ev-hero">
        <h1>基准测试百科：读懂 LLM 排行榜</h1>
        <p>
          每周都有新的"SOTA"宣布——但 MMLU 分数高真的意味着模型好用吗？
          本模块深入<strong>六大核心基准</strong>，教你正确解读分数、
          识别 Benchmark contamination，以及构建自己的领域评估集。
        </p>
      </div>

      {/* ─── 基准选择器 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🏆 六大核心基准测试</h2>
        <div className="ev-pills">
          {BENCHMARKS.map((b, i) => (
            <button key={i} className={`ev-btn ${i === benchIdx ? 'primary' : 'gold'}`}
              onClick={() => setBenchIdx(i)} style={{ fontSize: '0.78rem' }}>
              {b.icon} {b.name}
            </button>
          ))}
        </div>

        <div className="ev-card highlight">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, color: '#fde047', fontSize: '1.05rem' }}>{b.icon} {b.fullname}</h3>
            <span className="ev-tag gold">{b.category}</span>
          </div>

          <div className="ev-grid-3" style={{ marginBottom: '1rem' }}>
            <div className="ev-metric">
              <div className="ev-metric-value" style={{ color: '#5eead4', fontSize: '1rem' }}>{b.subjects.split('（')[0]}</div>
              <div className="ev-metric-label">测试范围</div>
            </div>
            <div className="ev-metric">
              <div className="ev-metric-value" style={{ color: '#fde047' }}>{b.size}</div>
              <div className="ev-metric-label">题目数量</div>
            </div>
            <div className="ev-metric">
              <div className="ev-metric-value" style={{ color: '#a5b4fc', fontSize: '0.9rem' }}>{b.metric}</div>
              <div className="ev-metric-label">评估指标</div>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>📝 <strong>格式：</strong>{b.format}</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1rem' }}>📌 <strong>范围：</strong>{b.subjects}</p>

          {/* Leaderboard */}
          <h4 style={{ color: '#e2e8f0', margin: '0 0 0.5rem', fontSize: '0.85rem' }}>📊 排行榜（2025 截至日期数据）</h4>
          {b.scores.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0' }}>
              <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: i === 0 ? '#fde047' : '#64748b' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </span>
              <span style={{ width: '140px', fontSize: '0.82rem', color: '#e2e8f0' }}>{s.model}</span>
              <div className="ev-score" style={{ flex: 1 }}>
                <div className="ev-score-bar">
                  <div className="ev-score-fill" style={{
                    width: `${typeof s.score === 'number' ? s.score : 95}%`,
                    background: i === 0 ? '#14b8a6' : i === 1 ? '#22d3ee' : '#3b82f6'
                  }} />
                </div>
                <span className="ev-score-label" style={{ color: i === 0 ? '#14b8a6' : '#94a3b8' }}>{s.score}</span>
              </div>
            </div>
          ))}

          <div className="ev-alert warning" style={{ marginTop: '1rem' }}>
            <strong>⚠️ 局限性：</strong>{b.limitation}
          </div>
        </div>
      </div>

      {/* ─── 构建自有评估集 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🛠️ 构建你自己的评估集</h2>
        <div className="ev-code-wrap">
          <div className="ev-code-head">
            <span className="ev-code-dot" style={{ background: '#ef4444' }} />
            <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
            <span className="ev-code-dot" style={{ background: '#10b981' }} />
            🐍 build_eval_dataset.py
          </div>
          <pre className="ev-code">{`# 构建领域评估集 — 三步法
import json

# Step 1: 从生产日志中提取 Bad Case
def extract_bad_cases(feedback_db, min_rating=2):
    """从用户反馈中提取低分案例"""
    bad_cases = feedback_db.query(
        "SELECT prompt, response, rating, feedback "
        "FROM conversations WHERE rating <= ?", 
        [min_rating]
    )
    return [{"input": c.prompt, 
             "expected_behavior": c.feedback,
             "source": "production_feedback"} for c in bad_cases]

# Step 2: LLM 辅助扩展
def expand_eval_set(seed_cases, model="gpt-4o"):
    """用 LLM 生成变体测试用例"""
    expanded = []
    for case in seed_cases:
        variants = model.generate(f"""
        基于以下测试用例，生成 5 个变体（改变措辞/场景/难度）：
        输入: {case['input']}
        期望行为: {case['expected_behavior']}
        
        输出格式: JSON 数组 [{{"input": "...", "expected": "..."}}]
        """)
        expanded.extend(json.loads(variants))
    return expanded

# Step 3: 人工审核 + 标注
def build_golden_dataset(auto_cases, reviewers=3):
    """3 人交叉审核，确保高质量"""
    golden = []
    for case in auto_cases:
        votes = [reviewer.label(case) for reviewer in reviewers]
        if agreement(votes) >= 2/3:  # 2/3 一致同意
            golden.append({**case, "quality": "golden"})
    return golden

# 最终评估集结构
eval_dataset = {
    "name": "my-product-eval-v1",
    "version": "1.0.0",
    "size": len(golden),
    "categories": {
        "accuracy": 120,      # 准确率测试
        "safety": 50,         # 安全性测试
        "edge_cases": 80,     # 边界情况
        "regression": 100,    # 回归测试（历史 bug）
    },
    "cases": golden
}`}</pre>
        </div>
      </div>

      <div className="ev-nav">
        <button className="ev-btn">← 评估基础</button>
        <button className="ev-btn gold">LLM-as-Judge →</button>
      </div>
    </div>
  );
}
