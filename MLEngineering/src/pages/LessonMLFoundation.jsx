import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 神经网络前向传播动画
function NeuralNetViz() {
  const [active, setActive] = useState(-1);
  const [weights, setWeights] = useState([0.5, -0.3, 0.8, 0.1, -0.6, 0.4]);

  const LAYERS = [
    { label: 'Input', nodes: ['x₁: 年龄', 'x₂: 收入', 'x₃: 信用'], color: '#3b82f6' },
    { label: 'Hidden', nodes: ['h₁', 'h₂', 'h₃', 'h₄'], color: '#10b981' },
    { label: 'Output', nodes: ['ŷ: 贷款批准'], color: '#f97316' },
  ];

  const randomizeWeights = () => {
    setWeights(Array.from({ length: 6 }, () => +(Math.random() * 2 - 1).toFixed(2)));
    setActive(-1);
  };

  return (
    <div className="ml-interactive">
      <h3>🧠 神经网络前向传播可视化（点击节点查看激活值）
        <button className="ml-btn" style={{ fontSize: '0.75rem' }} onClick={randomizeWeights}>🎲 随机权重</button>
      </h3>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {LAYERS.map((layer, li) => (
          <React.Fragment key={li}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center', minWidth: 90 }}>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{layer.label}</div>
              {layer.nodes.map((node, ni) => {
                const id = li * 10 + ni;
                const val = li === 0 ? [0.72, 0.45, 0.88][ni] : li === 1 ? Math.max(0, weights[ni] || 0.3) : 0.67;
                const isActive = active === id;
                return (
                  <div key={ni} onClick={() => setActive(isActive ? -1 : id)}
                    style={{ width: 72, height: 72, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                      background: isActive ? `${layer.color}30` : `${layer.color}10`,
                      border: `2px solid ${isActive ? layer.color : layer.color + '40'}`,
                      boxShadow: isActive ? `0 0 16px ${layer.color}40` : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>
                    <div style={{ fontSize: '0.6rem', color: layer.color, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{node}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: '#a1a1aa', marginTop: '0.15rem' }}>{val.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
            {li < LAYERS.length - 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0 }}>
                {weights.slice(li * 3, li * 3 + 3).map((w, wi) => (
                  <div key={wi} style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono', color: w > 0 ? '#10b981' : '#ef4444', fontWeight: 700, textAlign: 'center' }}>
                    w={w > 0 ? '+' : ''}{w}
                  </div>
                ))}
                <div style={{ width: 40, height: 2, background: 'linear-gradient(to right, #3b82f6, #10b981)', borderRadius: 1, opacity: 0.4, alignSelf: 'center' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 数学对应 */}
      <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.5rem' }}>
        {[
          ['线性变换', 'z = Wx + b', '#3b82f6'],
          ['ReLU 激活', 'h = max(0, z)', '#10b981'],
          ['输出层', 'ŷ = sigmoid(Wh + b)', '#f97316'],
        ].map(([label, formula, color]) => (
          <div key={label} style={{ padding: '0.4rem 0.625rem', background: `${color}08`, borderRadius: '6px', border: `1px solid ${color}18` }}>
            <div style={{ fontSize: '0.62rem', color: '#6b7280', marginBottom: '0.1rem' }}>{label}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color }}>{formula}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ML_TOPICS = [
  {
    name: '线性代数速成', icon: '📐', color: '#3b82f6',
    code: `# ML 必备线性代数 — NumPy 实战

import numpy as np

# ── 1. 向量与矩阵（神经网络的基本单元）──
x = np.array([1.0, 2.0, 3.0])          # 特征向量（输入层）
W = np.array([[0.5, -0.3, 0.8],         # 权重矩阵
              [0.1, -0.6, 0.4]])
b = np.array([0.1, 0.2])                # 偏置

# 前向传播：z = Wx + b
z = W @ x + b    # @ 是矩阵乘法，等价于 np.dot(W, x) + b
print(f"z = {z}")   # → [2.0, -0.9]

# ── 2. 激活函数（引入非线性）──
def relu(z):    return np.maximum(0, z)       # 最常用
def sigmoid(z): return 1 / (1 + np.exp(-z))  # 二分类输出
def tanh(z):    return np.tanh(z)             # 循环网络

h = relu(z)     # 隐藏层输出
print(f"h = {h}")   # → [2.0, 0.0]（负值被截断为0）

# ── 3. 梯度 = 导数（反向传播的核心）──
# 损失函数：MSE = (1/n) * Σ(ŷ - y)²
def mse_loss(y_pred, y_true):
    return np.mean((y_pred - y_true) ** 2)

# 梯度：∂L/∂W = ∂L/∂ŷ · ∂ŷ/∂W
# 链式法则：从输出层一路"反向"计算
y_pred, y_true = np.array([0.7]), np.array([1.0])
grad = 2 * (y_pred - y_true) / len(y_true)   # = -0.6

# ── 4. 奇异值分解 SVD（降维/压缩/推荐系统）──
A = np.random.randn(100, 50)   # 100 samples × 50 features
U, S, Vt = np.linalg.svd(A, full_matrices=False)

# 保留 Top-10 奇异值 = 信息压缩到10维
k = 10
A_compressed = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
print(f"压缩比：{k*150/(100*50):.1%}")   # 只用 30% 存储

# ── 5. 余弦相似度（Embedding 距离计算）──
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 词向量相似度（Word2Vec / BERT Embedding 都用这个）
vec_cat = np.array([0.8, 0.1, 0.3])    # "猫"的向量表示
vec_dog = np.array([0.7, 0.2, 0.4])    # "狗"的向量
vec_car = np.array([0.1, 0.9, 0.2])    # "汽车"的向量

print(f"猫-狗相似度: {cosine_sim(vec_cat, vec_dog):.3f}")  # 高！
print(f"猫-车相似度: {cosine_sim(vec_cat, vec_car):.3f}")  # 低！`,
  },
  {
    name: '概率 & 最优化', icon: '📊', color: '#10b981',
    code: `# ML 必备概率论 & 优化算法

import numpy as np
from scipy import stats

# ── 1. 概率分布（数据建模基础）──
# 高斯分布：大多数自然现象服从正态分布
mu, sigma = 170, 10   # 身高均值170cm，标准差10cm
heights = np.random.normal(mu, sigma, 10000)

# 概率密度 f(x) 和累积概率 F(x)
x = 180
pdf = stats.norm.pdf(x, mu, sigma)   # 密度值
cdf = stats.norm.cdf(x, mu, sigma)   # P(身高 ≤ 180cm)
print(f"P(身高 ≤ 180cm) = {cdf:.1%}")   # → 84.1%

# ── 2. 最大似然估计 MLE（参数估计的黄金法则）──
# 问题：10次投硬币，7次正面，估计正面概率 θ
# L(θ) = C(10,7) · θ^7 · (1-θ)^3
# 最大化 L → ∂log(L)/∂θ = 0 → θ_MLE = 7/10 = 0.7

# ── 3. 梯度下降（神经网络的学习引擎）──
# w_new = w_old - lr * ∂L/∂w

def gradient_descent(X, y, lr=0.01, epochs=1000):
    m, n = X.shape
    w = np.zeros(n)    # 随机初始化权重
    losses = []
    
    for epoch in range(epochs):
        y_pred = X @ w              # 前向传播
        error = y_pred - y
        grad = 2/m * X.T @ error    # 梯度计算
        w -= lr * grad              # 权重更新
        loss = np.mean(error**2)    # MSE 损失
        losses.append(loss)
    
    return w, losses

# ── 4. 优化器演化：SGD → Momentum → Adam ──
# Adam（现代网络默认选择）
def adam_update(param, grad, m, v, t, lr=1e-3, beta1=0.9, beta2=0.999):
    eps = 1e-8
    m = beta1 * m + (1 - beta1) * grad        # 一阶矩（动量）
    v = beta2 * v + (1 - beta2) * grad**2     # 二阶矩（自适应学习率）
    m_hat = m / (1 - beta1**t)     # 偏差修正
    v_hat = v / (1 - beta2**t)
    param -= lr * m_hat / (np.sqrt(v_hat) + eps)
    return param, m, v

# Adam 特性：
# ✦ 自动调整每个参数的学习率
# ✦ 收敛快，适合稀疏梯度（NLP任务）
# ✦ 绝大多数场景下 lr=1e-3 就是好的起点

# ── 5. 过拟合 vs 欠拟合 ──
# 欠拟合：模型太简单，训练误差高    → 加深网络
# 过拟合：模型太复杂，泛化误差高    → Dropout/L2/早停
# 偏差-方差权衡：Total Error = Bias² + Variance + Noise

# Dropout：随机丢弃神经元（训练时）
# L2正则化：在损失函数加 λ||w||₂² 惩罚大权重`,
  },
];

export default function LessonMLFoundation() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = ML_TOPICS[activeTopic];

  return (
    <div className="lesson-ml">
      <div className="ml-badge">🧠 module_01 — ML数学基础</div>
      <div className="ml-hero">
        <h1>机器学习数学基础：线性代数 / 概率论 / 优化算法</h1>
        <p>ML 不是魔法，是数学。<strong>矩阵乘法</strong>是神经网络前向传播的本质，<strong>梯度下降</strong>是反向传播的灵魂，<strong>最大似然估计</strong>是损失函数的理论基础。理解这三者，你就理解了深度学习80%的原理。</p>
      </div>

      <NeuralNetViz />

      <div className="ml-section">
        <h2 className="ml-section-title">📐 必备数学基础代码</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {ML_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              className="ml-btn"
              style={{ flex: 1, minWidth: 130, padding: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem',
                opacity: activeTopic === i ? 1 : 0.45,
                background: activeTopic === i ? `${topic.color}15` : 'rgba(16,185,129,0.03)' }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="ml-code-wrap">
          <div className="ml-code-head"><div className="ml-code-dot" style={{ background: '#ee4c2c' }}/><div className="ml-code-dot" style={{ background: '#10b981' }}/><div className="ml-code-dot" style={{ background: t.color }}/><span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}.py</span></div>
          <div className="ml-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="ml-section">
        <h2 className="ml-section-title">🗺️ ML 学习路径</h2>
        <div className="ml-grid-3">
          {[
            ['线性代数', '向量/矩阵/点积\n特征值/SVD', '#3b82f6', '2周'],
            ['概率统计', '分布/期望/MLE\n贝叶斯定理', '#10b981', '2周'],
            ['微积分', '偏导/链式法则\n雅可比矩阵', '#f97316', '1周'],
            ['优化理论', '梯度下降族\nAdam/Adagrad', '#8b5cf6', '1周'],
            ['信息论', '熵/KL散度\n交叉熵损失', '#fbbf24', '1周'],
            ['统计学习', '偏差-方差\nPAC学习理论', '#ef4444', '2周'],
          ].map(([title, content, color, time]) => (
            <div key={title} className="ml-card" style={{ borderColor: `${color}22` }}>
              <div style={{ fontWeight: 800, color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{title}</div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{content}</div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.62rem', color, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>⏱ {time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-nav">
        <div />
        <button className="ml-btn primary" onClick={() => navigate('/course/ml-engineering/lesson/pytorch')}>下一模块：PyTorch 核心 →</button>
      </div>
    </div>
  );
}
