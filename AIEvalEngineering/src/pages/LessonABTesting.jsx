import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 05 — A/B 测试与线上评估
   统计显著性 / Interleaving / 漏斗指标
   ───────────────────────────────────────────── */

const AB_CONCEPTS = [
  { name: '为什么需要线上评估？', icon: '🤔',
    content: '离线评估只能告诉你"模型在测试集上表现如何"，但无法预测用户的真实感受。生产环境有噪音、有边界输入、有上下文依赖——只有线上评估才能给出最终裁决。',
    key: '离线评分 90 分，线上可能翻车——线上评估是最终裁判。' },
  { name: '流量分配策略', icon: '🔀',
    content: '将用户随机分为控制组（A）和实验组（B），确保两组在人口统计、使用习惯上均匀分布。通常从 5% 流量开始，逐步扩大到 50/50。',
    key: '5% → 20% → 50% 渐进式放量，确保风险可控。' },
  { name: '样本量计算', icon: '📐',
    content: '多少用户才能得出可靠结论？这取决于效应大小（MDE）和显著性水平。经验法则：检测 2% 的提升，通常需要每组 ~5000 样本。',
    key: 'n = (Z²×2p(1-p)) / δ² — 别在样本不够时就下结论。' },
  { name: '统计显著性', icon: '📊',
    content: 'p-value < 0.05 表示"结果不太可能是随机波动"。但要同时看置信区间和效应大小——统计显著 ≠ 业务显著。',
    key: 'p < 0.05 AND 效应大小 > MDE，两个条件都要满足。' },
];

const METHODS = [
  { name: 'Classic A/B Test', desc: '用户随机分组，一组用旧版（A），一组用新版（B）',
    pros: '简单直观', cons: '需要大流量、运行时间长',
    code: `# A/B 测试显著性计算
from scipy import stats
import numpy as np

# 实验数据
group_a = {"users": 5000, "success": 3200}  # 64.0%
group_b = {"users": 5000, "success": 3350}  # 67.0%

# 双样本比例 z-test  
p_a = group_a["success"] / group_a["users"]
p_b = group_b["success"] / group_b["users"]
p_pool = (group_a["success"] + group_b["success"]) / \\
         (group_a["users"] + group_b["users"])

se = np.sqrt(p_pool*(1-p_pool) * (1/group_a["users"] + 1/group_b["users"]))
z_stat = (p_b - p_a) / se
p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))

print(f"A: {p_a:.3f}, B: {p_b:.3f}")
print(f"Uplift: {(p_b-p_a)/p_a:.1%}")
print(f"Z-statistic: {z_stat:.3f}")
print(f"P-value: {p_value:.4f}")
print(f"Significant: {p_value < 0.05}")  # True → B 胜出!` },
  { name: 'Interleaving', desc: '在同一对话中混合 A/B 的输出，用 LLM 选择偏好',
    pros: '样本效率高 10x', cons: '只适合可对比的输出',
    code: `# Interleaving: 在相同请求上对比两个 Prompt
import random

async def interleaved_eval(user_query, prompt_a, prompt_b):
    # 同时调用两个版本
    resp_a = await llm(prompt_a + user_query)
    resp_b = await llm(prompt_b + user_query)
    
    # 随机排列，消除位置偏见
    if random.random() > 0.5:
        first, second = resp_a, resp_b
        order = "a_first"
    else:
        first, second = resp_b, resp_a
        order = "b_first"
    
    # LLM-as-Judge 选择偏好
    winner = await judge(user_query, first, second)
    
    # 记录结果（还原真实 A/B 归属）
    return {
        "query": user_query,
        "actual_winner": "A" if (winner == 1 and order == "a_first") 
                              or (winner == 2 and order == "b_first") else "B",
        "order": order
    }` },
  { name: 'Multi-Armed Bandit', desc: '动态调整流量比例，把更多流量导向表现好的版本',
    pros: '减少"遗憾"（用差版本的损失）', cons: '不保证统计显著性',
    code: `# Thompson Sampling for LLM A/B Testing
import numpy as np

class ThompsonBandit:
    def __init__(self, n_arms=2):
        self.alpha = np.ones(n_arms)  # success counts + 1
        self.beta = np.ones(n_arms)   # failure counts + 1
    
    def select_arm(self):
        """基于 Beta 分布采样选择版本"""
        samples = [np.random.beta(a, b) 
                   for a, b in zip(self.alpha, self.beta)]
        return np.argmax(samples)
    
    def update(self, arm, reward):
        """更新成功/失败计数"""
        if reward:  # 用户满意
            self.alpha[arm] += 1
        else:
            self.beta[arm] += 1

bandit = ThompsonBandit(n_arms=3)  # 3 个 Prompt 版本
for _ in range(10000):
    arm = bandit.select_arm()      # 选择版本
    reward = serve_user(arm)       # 服务用户并获取反馈
    bandit.update(arm, reward)     # 更新信念` },
];

const METRICS = [
  { name: '任务完成率', icon: '✅', desc: '用户是否完成了他们想做的事？', formula: '成功完成 / 总尝试', importance: 'CRITICAL' },
  { name: '用户满意度 (CSAT)', icon: '😊', desc: '用户对 AI 回答的直接评分', formula: '(👍 - 👎) / 总反馈', importance: 'HIGH' },
  { name: '首次解决率 (FCR)', icon: '1️⃣', desc: '一次对话就解决问题的比例', formula: '单轮解决 / 总对话', importance: 'HIGH' },
  { name: '对话轮次', icon: '🔄', desc: '用户需要几轮才能得到满意答案？越少越好', formula: 'avg(turns_per_session)', importance: 'MEDIUM' },
  { name: '逃逸率', icon: '🚪', desc: '用户中途放弃对话的比例', formula: '未完成会话 / 总会话', importance: 'HIGH' },
  { name: '延迟 (TTFT/TPS)', icon: '⏱️', desc: '首 Token 时间和每秒 Token 数', formula: 'P50/P95/P99', importance: 'MEDIUM' },
  { name: '成本 ($/query)', icon: '💰', desc: '每次查询的 API 费用', formula: 'total_cost / queries', importance: 'MEDIUM' },
  { name: '安全拦截率', icon: '🛡️', desc: '触发安全过滤的查询比例', formula: 'blocked / total', importance: 'HIGH' },
];

export default function LessonABTesting() {
  const [methodIdx, setMethodIdx] = useState(0);

  return (
    <div className="lesson-eval">
      <div className="ev-badge gold">📊 module_05 — A/B 测试</div>

      <div className="ev-hero">
        <h1>A/B 测试与线上评估：让数据说话</h1>
        <p>
          "离线评分高不等于线上效果好。" 本模块讲解<strong>三种线上评估方法</strong>
          （经典 A/B / Interleaving / Multi-Armed Bandit）、统计显著性计算、
          以及 LLM 产品的<strong>八大核心指标</strong>。
        </p>
      </div>

      {/* ─── 基础概念 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">📚 核心概念</h2>
        <div className="ev-grid-2">
          {AB_CONCEPTS.map((c, i) => (
            <div key={i} className="ev-card">
              <h4 style={{ margin: '0 0 0.5rem', color: '#5eead4' }}>{c.icon} {c.name}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.7, margin: '0 0 0.5rem' }}>{c.content}</p>
              <div style={{ fontSize: '0.78rem', color: '#fde047', background: 'rgba(234,179,8,0.05)', padding: '0.5rem', borderRadius: '6px' }}>
                💡 {c.key}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 方法详解 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">🔬 三种线上评估方法</h2>
        <div className="ev-pills">
          {METHODS.map((m, i) => (
            <button key={i} className={`ev-btn ${i === methodIdx ? 'primary' : 'gold'}`}
              onClick={() => setMethodIdx(i)} style={{ fontSize: '0.78rem' }}>
              {m.name}
            </button>
          ))}
        </div>
        <div className="ev-card highlight">
          <h3 style={{ margin: '0 0 0.5rem', color: '#fde047' }}>{METHODS[methodIdx].name}</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 0.75rem' }}>{METHODS[methodIdx].desc}</p>
          <div className="ev-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="ev-alert pass"><strong>✅ 优势：</strong>{METHODS[methodIdx].pros}</div>
            <div className="ev-alert warning"><strong>⚠️ 局限：</strong>{METHODS[methodIdx].cons}</div>
          </div>
          <div className="ev-code-wrap">
            <div className="ev-code-head">
              <span className="ev-code-dot" style={{ background: '#ef4444' }} />
              <span className="ev-code-dot" style={{ background: '#f59e0b' }} />
              <span className="ev-code-dot" style={{ background: '#10b981' }} />
              🐍 ab_testing.py
            </div>
            <pre className="ev-code">{METHODS[methodIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* ─── 核心指标 ─── */}
      <div className="ev-section">
        <h2 className="ev-section-title">📈 LLM 产品八大核心指标</h2>
        <div className="ev-card">
          <table className="ev-table">
            <thead><tr><th>指标</th><th>说明</th><th>计算公式</th><th>优先级</th></tr></thead>
            <tbody>
              {METRICS.map((m, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#5eead4' }}>{m.icon} {m.name}</strong></td>
                  <td style={{ color: '#94a3b8' }}>{m.desc}</td>
                  <td><code style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>{m.formula}</code></td>
                  <td><span className={`ev-tag ${m.importance === 'CRITICAL' ? 'coral' : m.importance === 'HIGH' ? 'gold' : 'teal'}`}>{m.importance}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ev-nav">
        <button className="ev-btn">← LangSmith</button>
        <button className="ev-btn gold">RAG 评估 →</button>
      </div>
    </div>
  );
}
