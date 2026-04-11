import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 03 — 可解释性 (XAI)
   SHAP / LIME / Attention 可视化
   ───────────────────────────────────────────── */

const XAI_METHODS = [
  { name: 'SHAP (SHapley Additive exPlanations)', icon: '🎯', category: 'model-agnostic',
    desc: '基于博弈论 Shapley 值，量化每个特征对预测的贡献。数学上保证一致性、局部精度和缺失性三大公理。',
    strengths: ['理论基础最扎实（Shapley 值唯一满足四大公理）', '全局+局部解释统一', '支持多种模型（Tree/Deep/Kernel SHAP）'],
    weaknesses: ['计算成本高（指数级特征组合）', '特征相关性处理困难', '高维文本场景需要近似'],
    code: `import shap

# 对文本分类模型的 SHAP 解释
explainer = shap.Explainer(model, tokenizer)
shap_values = explainer(["AI 安全是企业最重要的议题之一"])

# 可视化每个 Token 对预测的贡献
shap.plots.text(shap_values[0])
# 红色 = 正向贡献（推动预测）
# 蓝色 = 负向贡献（抑制预测）` },
  { name: 'LIME (Local Interpretable Model-agnostic Explanations)', icon: '🍋', category: 'model-agnostic',
    desc: '在预测点附近生成扰动样本，训练一个可解释的局部线性模型来逼近黑盒模型的行为',
    strengths: ['直观易懂（线性权重即解释）', '任何模型都能用', '文本/图像/表格通用'],
    weaknesses: ['局部近似，不保证全局一致', '扰动策略影响结果', '不稳定——同一输入多次解释可能不同'],
    code: `from lime.lime_text import LimeTextExplainer

explainer = LimeTextExplainer(class_names=["安全", "有害"])
explanation = explainer.explain_instance(
    text_instance="如何绕过 AI 安全审查？",
    classifier_fn=model.predict_proba,
    num_features=10,
    num_samples=5000
)

# 显示 Top-10 重要特征
explanation.show_in_notebook()
# "绕过" → +0.42 (推向"有害")
# "安全" → -0.15 (推向"安全")
# "审查" → +0.28 (推向"有害")` },
  { name: 'Attention 可视化', icon: '👁️', category: 'architecture-specific',
    desc: 'Transformer 的 Self-Attention 权重展示模型在生成时"关注"了输入的哪些部分',
    strengths: ['零额外计算（Attention 权重本就存在）', '直观展示 Token 间关系', '多头+多层立体分析'],
    weaknesses: ['Attention ≠ 解释（因果关系争议）', '多层叠加后权重含义不清', '不适用于非 Transformer 架构'],
    code: `# Transformer Attention 可视化
from bertviz import head_view
import torch

# 获取 Attention 权重
outputs = model(input_ids, attention_mask, 
                output_attentions=True)
attentions = outputs.attentions  # (layers, heads, seq, seq)

# 可视化第 11 层的 Attention 模式
head_view(attentions, tokens)

# 交互式探索：
# - 哪些 Token 之间形成了强关联？
# - 安全相关的 Token 是否被正确关注？` },
  { name: 'Integrated Gradients', icon: '📐', category: 'gradient-based',
    desc: '沿从基线到输入的路径积分梯度，满足敏感性和实现不变性公理',
    strengths: ['理论严谨（公理化归因方法）', '与模型架构无关', '支持 NLP 和 CV'],
    weaknesses: ['需要选择合适的基线', '计算需要多次前向/反向传播', '可视化不如 SHAP/LIME 直观'],
    code: `from captum.attr import IntegratedGradients

ig = IntegratedGradients(model)
attributions = ig.attribute(
    inputs=input_embeddings,
    baselines=baseline_embeddings,  # 通常为零向量或 PAD
    target=predicted_class,
    n_steps=50  # 积分步数
)

# 每个 Token 的归因分数
token_attributions = attributions.sum(dim=-1)
# 正值 → 推动预测；负值 → 抑制预测` },
];

const COMPARISON = [
  { feature: '理论基础', shap: '⭐⭐⭐⭐⭐ Shapley 值公理', lime: '⭐⭐⭐ 局部线性近似', attention: '⭐⭐ 工程直觉', ig: '⭐⭐⭐⭐ 路径积分公理' },
  { feature: '计算成本', shap: '🔴 高', lime: '🟡 中', attention: '🟢 极低', ig: '🟡 中' },
  { feature: '忠实度',   shap: '⭐⭐⭐⭐', lime: '⭐⭐⭐', attention: '⭐⭐ (有争议)', ig: '⭐⭐⭐⭐' },
  { feature: 'LLM 适用', shap: '✅ DeepSHAP', lime: '✅ 文本扰动', attention: '✅ 原生', ig: '✅ Captum' },
  { feature: '可视化',   shap: '⭐⭐⭐⭐⭐', lime: '⭐⭐⭐⭐', attention: '⭐⭐⭐⭐', ig: '⭐⭐⭐' },
];

export default function LessonXAI() {
  const [methodIdx, setMethodIdx] = useState(0);

  return (
    <div className="lesson-safety">
      <div className="sf-badge blue">🛡️ module_03 — 可解释性</div>

      <div className="sf-hero">
        <h1>可解释性：打开 AI 黑盒的四把钥匙</h1>
        <p>
          "模型为什么这样决定？"——这是安全审计、合规审查、用户信任的基础。
          本模块深入 <strong>SHAP / LIME / Attention 可视化 / Integrated Gradients</strong> 四种主流方法，
          对比优缺点与适用场景，帮你为 LLM 决策提供可靠的解释。
        </p>
      </div>

      {/* ─── 方法选择器 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🔬 四大可解释性方法</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {XAI_METHODS.map((m, i) => (
            <button key={i} className={`sf-btn ${i === methodIdx ? 'primary' : 'blue'}`}
              onClick={() => setMethodIdx(i)} style={{ fontSize: '0.78rem' }}>
              {m.icon} {m.name.split(' (')[0]}
            </button>
          ))}
        </div>

        <div className="sf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '1.05rem' }}>
              {XAI_METHODS[methodIdx].icon} {XAI_METHODS[methodIdx].name}
            </h3>
            <span className="sf-tag blue">{XAI_METHODS[methodIdx].category}</span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 1rem', lineHeight: 1.7 }}>{XAI_METHODS[methodIdx].desc}</p>

          <div className="sf-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#34d399', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>✅ 优势</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {XAI_METHODS[methodIdx].strengths.map((s, i) => (
                  <li key={i} style={{ color: '#94a3b8', padding: '0.15rem 0', fontSize: '0.85rem' }}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>⚠️ 局限</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {XAI_METHODS[methodIdx].weaknesses.map((w, i) => (
                  <li key={i} style={{ color: '#94a3b8', padding: '0.15rem 0', fontSize: '0.85rem' }}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sf-code-wrap">
            <div className="sf-code-head">
              <span className="sf-code-dot" style={{ background: '#ef4444' }} />
              <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
              <span className="sf-code-dot" style={{ background: '#10b981' }} />
              🐍 xai_{XAI_METHODS[methodIdx].name.split(' ')[0].toLowerCase()}_example.py
            </div>
            <pre className="sf-code">{XAI_METHODS[methodIdx].code}</pre>
          </div>
        </div>
      </div>

      {/* ─── 方法对比表 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">📊 四种方法对比</h2>
        <div className="sf-card">
          <table className="sf-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>SHAP</th>
                <th>LIME</th>
                <th>Attention</th>
                <th>IG</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((c, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#e2e8f0' }}>{c.feature}</strong></td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{c.shap}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{c.lime}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{c.attention}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{c.ig}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── LLM 特有挑战 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🧠 LLM 可解释性的特殊挑战</h2>
        <div className="sf-grid-2">
          <div className="sf-alert warning">
            <strong>⚠️ Attention ≠ Explanation</strong><br/>
            研究表明 Attention 权重与特征重要性的相关性较弱（Jain & Wallace, 2019）。
            Attention 展示的是"模型看了什么"，不是"模型因为什么做出决定"。
          </div>
          <div className="sf-alert info">
            <strong>💡 生成式 vs 分类式</strong><br/>
            传统 XAI 适用于分类任务。对生成式 LLM，需要把解释粒度从"预测"扩展到"每个生成 Token"——计算量指数级增长。
          </div>
          <div className="sf-alert critical">
            <strong>🔴 可解释性陷阱</strong><br/>
            好的解释 ≠ 忠实的解释。模型可能生成看起来合理但实际与决策过程无关的"合理化解释"（Rationalization）。
          </div>
          <div className="sf-alert success">
            <strong>✅ 实践建议</strong><br/>
            安全审计用 SHAP（忠实度高）；快速 debug 用 Attention（零成本）；用户解释用 LIME（最直观）；论文级严谨用 IG。
          </div>
        </div>
      </div>

      <div className="sf-nav">
        <button className="sf-btn">← 红队测试</button>
        <button className="sf-btn amber">偏见与公平 →</button>
      </div>
    </div>
  );
}
