import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['交叉熵与损失', 'VAE 与 ELBO', '对比学习', '信息论视角'];

export default function LessonInfoML() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📡 module_07 — 信息论与机器学习</div>
      <div className="fs-hero">
        <h1>信息论与机器学习：交叉熵 / ELBO / InfoNCE</h1>
        <p>
          信息论与机器学习深度交融——
          <strong>交叉熵</strong>是分类的标准损失，
          <strong>KL 散度</strong>驱动 VAE 的 ELBO，
          <strong>互信息</strong>是对比学习、自监督学习的核心目标。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📡 信息论与 ML 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 交叉熵与损失函数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> cross_entropy.txt</div>
                <pre className="fs-code">{`═══ 交叉熵损失 = 信息论 + ML ═══

  交叉熵: H(P, Q) = -Σ P(x) log Q(x)
  
  = H(P) + D_KL(P || Q)

  在分类中:
  P = 真实标签分布 (one-hot)
  Q = 模型预测概率

  min H(P, Q) ⟺ min D_KL(P || Q) ⟺ MLE!

═══ 二分类交叉熵 ═══

  L = -[y·log(p) + (1-y)·log(1-p)]

  y ∈ {0, 1} (真实标签)
  p = σ(z) = 1/(1+e^(-z)) (模型预测)

  梯度: ∂L/∂z = p - y  ← 多优美!

  Python (PyTorch):
  import torch.nn.functional as F
  loss = F.binary_cross_entropy_with_logits(logits, labels)

═══ 多分类交叉熵 ═══

  L = -Σᵢ yᵢ log(pᵢ)
    = -log(p_correct)    (one-hot 时)

  pᵢ = softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)

  Python:
  loss = F.cross_entropy(logits, labels)
  # 内部: log_softmax + nll_loss

═══ 为什么交叉熵而不是 MSE？ ═══

  MSE: L = (y - p)²
  → 梯度: 2(p-y)·p·(1-p)  ← 当 p≈0 或 p≈1 时梯度消失!
  
  交叉熵:
  → 梯度: p - y  ← 始终有效, 不会饱和!

  信息论解释:
  • MSE: 假设误差高斯分布 → 最大化高斯似然
  • CE:  最大化多项式分布似然 → 信息论最优!

═══ 标签平滑 (Label Smoothing) ═══

  传统 one-hot: P = [0, 0, 1, 0, 0]
  平滑后:       P = [0.02, 0.02, 0.92, 0.02, 0.02]

  P_smooth = (1-ε)·P_one_hot + ε/K

  信息论理解:
  • one-hot 的 H(P) = 0 → 模型过度自信
  • 平滑后 H(P) > 0 → 模型保留一定不确定性
  • ε = 0.1 效果最好 (ImageNet, Transformer)

═══ Focal Loss (焦点损失) ═══

  FL = -(1-p)^γ · log(p)

  γ > 0 时:
  • 容易样本 (p≈1): 权重 → 0 (忽略!)
  • 困难样本 (p≈0): 权重 ≈ 1 (关注!)

  → 解决类别不平衡 (RetinaNet, 2017)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ VAE 与 ELBO</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> vae_elbo.txt</div>
                <pre className="fs-code">{`═══ VAE 的信息论推导 ═══

  目标: 最大化数据的对数似然 log p(x)

  log p(x) = ELBO + D_KL(q(z|x) || p(z|x))

  因为 D_KL ≥ 0, 所以:
  log p(x) ≥ ELBO

═══ ELBO (Evidence Lower Bound) ═══

  ELBO = E_q[log p(x|z)] - D_KL(q(z|x) || p(z))
         ↑ 重建项            ↑ 正则化项

  重建项: 拉近 x̂ 和 x (让重建好)
  KL 项:  拉近 q(z|x) 和先验 p(z)=N(0,I) (让潜变量规范)

  两者的平衡 = 率失真权衡!

═══ β-VAE ═══

  L = E_q[log p(x|z)] - β · D_KL(q(z|x) || p(z))

  β > 1: 更强正则化 → 更好的解纠缠表示
  β < 1: 更好重建 → 更弱的潜变量结构
  β = 1: 标准 VAE

  信息论理解:
  β-VAE = 率失真优化!
  β 是 R-D 曲线上的拉格朗日乘子

  R = I(X; Z) ≈ D_KL(q(z|x) || p(z))  (信息率)
  D = -E_q[log p(x|z)]                   (失真)

  → VAE 的训练就是在 R-D 曲线上找最优点!

═══ KL 散度的计算 ═══

  q(z|x) = N(μ, σ²),  p(z) = N(0, 1)

  D_KL(q||p) = (1/2)(μ² + σ² - log σ² - 1)

  Python:
  kl_loss = 0.5 * torch.sum(mu**2 + logvar.exp() - logvar - 1)

═══ 重参数化技巧 ═══

  z = μ + σ · ε,  ε ~ N(0, 1)

  将随机采样 → 确定性函数 + 外部噪声
  → 可以反向传播!

  Python:
  def reparameterize(mu, logvar):
      std = torch.exp(0.5 * logvar)
      eps = torch.randn_like(std)
      return mu + std * eps

═══ VAE 的信息瓶颈视角 ═══

  X → Z → X̂

  信息瓶颈:
  min I(X; Z) - β · I(Z; Y)
  → 在 VAE 中 Y = X (自监督)
  → 最大化重建同时最小化编码信息

  KL 坍缩 (Posterior Collapse):
  q(z|x) → p(z) = N(0,I) for all x
  → I(X; Z) → 0, 解码器忽略 z
  → 解决: KL 退火, 自由位技术`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 对比学习与 InfoNCE</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> contrastive.txt</div>
                <pre className="fs-code">{`═══ 互信息估计问题 ═══

  问题: I(X; Y) 通常不可直接计算!
  (需要知道联合分布和边际分布)

  解决: 构造下界, 通过神经网络估计

═══ InfoNCE (Noise-Contrastive Estimation) ═══

  I(X; Y) ≥ E[log (e^{f(x,y)} / (1/N)Σᵢ e^{f(x,yᵢ)})]

  = E[log N] - L_InfoNCE

  L_InfoNCE = -E[log (e^{sim(x,y⁺)/τ} / 
                       Σⱼ e^{sim(x,yⱼ)/τ})]

  x, y⁺: 正样本对 (来自联合分布)
  yⱼ: N-1 个负样本 (来自边际分布)
  τ: 温度参数

  → 本质: (N+1)-分类问题! 分辨真配对 vs 假配对

═══ SimCLR 框架 ═══

  1. 数据增强: x → (x̃ᵢ, x̃ⱼ) 两个视图
  2. 编码器: f(x̃) → h (表示)
  3. 投影头: g(h) → z (用于对比)
  4. 对比损失: InfoNCE

  sim(zᵢ, zⱼ) = zᵢ·zⱼ / (‖zᵢ‖·‖zⱼ‖)  (余弦相似度)

  Python:
  def info_nce_loss(features, temperature=0.07):
      # features: (2N, D) — N 对正样本
      labels = torch.arange(N).repeat(2)
      
      sim = F.cosine_similarity(
          features.unsqueeze(0), 
          features.unsqueeze(1), dim=-1
      ) / temperature
      
      # 掩码: 排除自身
      mask = ~torch.eye(2*N, dtype=bool)
      sim = sim[mask].view(2*N, -1)
      
      # 正样本位置
      pos = ...  # 配对位置
      
      loss = F.cross_entropy(sim, pos)
      return loss

═══ CLIP = 跨模态 InfoNCE ═══

  Image → Image Encoder → zᵢ
  Text  → Text Encoder  → zₜ
  
  目标: 最大化 I(Image; Text)
  = 最大化配对 (zᵢ, zₜ) 的相似度
  + 最小化非配对的相似度

  → 通过 InfoNCE 实现:
  对称的图像-文本对比损失

═══ 信息论理解对比学习 ═══

  InfoNCE 优化的目标:
  max I(view₁; view₂)

  = max I(X; Z)  其中 Z 是学到的表示

  好的表示: 保留输入中与任务相关的信息
  差的表示: 只保留噪声或无关细节

  温度 τ 的作用:
  τ → 0: 硬负样本挖掘 (只关注最难的负样本)
  τ → ∞: 均匀对待所有负样本
  τ = 0.07: 实践中效果好 (SimCLR, CLIP)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔭 ML 的信息论视角</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> info_ml_panorama.txt</div>
                <pre className="fs-code">{`═══ ML 方法的信息论统一 ═══

  方法          │ 信息论目标              │ 具体形式
  ──────────────┼────────────────────────┼──────────────
  MLE           │ min D_KL(P_data||P_θ)  │ max log p(x;θ)
  交叉熵        │ min H(P, Q)            │ -Σ y log ŷ
  VAE           │ max ELBO               │ E[log p]-D_KL
  GAN           │ min JSD(P_r||P_g)      │ minmax game
  Diffusion     │ min D_KL (分步)        │ ε-prediction
  Flow          │ min D_KL (正向)        │ change of var.
  InfoGAN       │ max I(c; G(z,c))       │ 变分下界
  SimCLR        │ max I(v₁; v₂)          │ InfoNCE
  CLIP          │ max I(img; txt)        │ 对称 NCE

═══ 最小描述长度 (MDL) ═══

  模型选择 = 压缩!

  总描述长度 = L(模型) + L(数据|模型)
  = 模型复杂度 + 数据拟合程度

  → 奥卡姆剃刀的信息论形式化!

  与贝叶斯的关系:
  -log P(θ|D) = -log P(D|θ) - log P(θ) + const
                = L(数据|模型) + L(模型) + const

  → MDL ≈ MAP ≈ BIC!

═══ PAC-Bayes 与信息复杂度 ═══

  泛化界:
  E[L_test] ≤ E[L_train] + √(D_KL(Q||P) / (2n))

  Q = 基于训练数据选择的后验
  P = 不依赖数据的先验

  D_KL(Q||P) = 算法从数据中提取的信息量!

  → 过拟合 ⟺ 从数据中提取了太多信息
  → 正则化 ⟺ 限制提取的信息量

═══ 深度学习三大信息论原理 ═══

  1. 信息瓶颈 (IB):
     好的表示 Z 应满足:
     max I(Z; Y) s.t. I(Z; X) ≤ R
     "保留任务信息, 丢弃无关信息"

  2. 数据处理不等式 (DPI):
     X → T₁ → T₂ → ... → Y
     I(X; Tₖ) 逐层递减
     "深层网络是逐步提取信息的管道"

  3. 最小充分统计量:
     T(X) 使得 I(T; Y) = I(X; Y) 且 I(T; X) 最小
     "最紧凑的有用表示"

═══ 前沿方向 ═══

  1. 信息论 + LLM:
     → tokenization = 信源编码
     → attention = 信息路由
     → KV cache 压缩 = 率失真

  2. 信息论 + 隐私:
     → 差分隐私 = 限制 I(数据; 输出)
     → 联邦学习 = 分布式信源编码

  3. 信息论 + 因果推断:
     → 因果熵力
     → 信息几何 + 因果结构`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
