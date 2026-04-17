import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['互信息', 'KL 散度', '数据处理不等式', 'f-散度族'];

export default function LessonMutualInfo() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📡 module_02 — 互信息与 KL 散度</div>
      <div className="fs-hero">
        <h1>互信息与 KL 散度：信道模型 / 数据处理不等式</h1>
        <p>
          <strong>互信息 (Mutual Information)</strong> 量化两个变量间的统计依赖性，
          <strong>KL 散度</strong> 衡量分布间的"距离"——它们是机器学习中交叉熵损失、
          VAE 的 ELBO、GAN 训练的理论核心。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📡 互信息与 KL 散度深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 互信息 (Mutual Information)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> mutual_information.txt</div>
                <pre className="fs-code">{`═══ 互信息定义 ═══

  I(X; Y) = Σ_x Σ_y P(x,y) log₂ [P(x,y) / (P(x)P(y))]

  等价表达式:
  I(X; Y) = H(X) - H(X|Y)        "知道 Y 后 X 减少的不确定性"
          = H(Y) - H(Y|X)        "知道 X 后 Y 减少的不确定性"
          = H(X) + H(Y) - H(X,Y) "总信息 - 联合信息"
          = D_KL(P(X,Y) || P(X)P(Y))  "联合分布与独立假设的差距"

═══ 核心性质 ═══

  1. I(X;Y) ≥ 0                (互信息非负!)
  2. I(X;Y) = 0 ⟺ X⊥Y        (独立则互信息为零)
  3. I(X;Y) = I(Y;X)           (对称!)
  4. I(X;X) = H(X)              (自互信息 = 熵)
  5. I(X;Y) ≤ min(H(X), H(Y))  (不超过单个熵)

═══ Venn 图 ═══

      ┌─────────────────────┐
      │ H(X)    I(X;Y)  H(Y)│
      │  ┌──────┬──────┐    │
      │  │H(X|Y)│ I    │H(Y|X)
      │  │      │(X;Y) │    │
      │  └──────┴──────┘    │
      │     H(X,Y)          │
      └─────────────────────┘

  H(X,Y) = H(X) + H(Y) - I(X;Y)
         = H(X|Y) + I(X;Y) + H(Y|X)

═══ 计算例子 ═══

  X = 天气 {晴=0.7, 雨=0.3}
  Y = 带伞 {是, 否}

  P(Y=是|晴)=0.1, P(Y=是|雨)=0.9

  联合分布:
         │  是     │  否
  ───────┼─────────┼──────
  晴     │  0.07   │ 0.63
  雨     │  0.27   │ 0.03

  H(X) = 0.881, H(Y) = H(0.34) = 0.930
  H(X,Y) = 1.245
  I(X;Y) = 0.881 + 0.930 - 1.245 = 0.566 bit

  → 知道是否带伞提供了 0.566 bit 关于天气的信息

═══ 条件互信息 ═══

  I(X; Y | Z) = H(X|Z) - H(X|Y,Z)

  "在已知 Z 的条件下，Y 对 X 提供的额外信息"

  链式法则: I(X₁,...,Xₙ; Y) = Σ I(Xᵢ; Y | X₁,...,Xᵢ₋₁)

═══ 在 ML 中的应用 ═══

  1. 特征选择: 选 I(特征; 标签) 最大的特征
  2. 聚类评估: 归一化互信息 NMI
  3. InfoGAN: 最大化 I(c; G(z,c)) 使生成可控
  4. InfoNCE: I(X;Y) 的下界估计 → 对比学习!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📏 KL 散度 (Kullback-Leibler Divergence)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> kl_divergence.txt</div>
                <pre className="fs-code">{`═══ KL 散度定义 ═══

  D_KL(P || Q) = Σ P(x) log₂ [P(x) / Q(x)]
               = E_P [log₂ P(X)/Q(X)]

  "用 Q 近似 P 时，每个样本平均多编码多少 bit"

═══ 与交叉熵的关系 ═══

  交叉熵: H(P, Q) = -Σ P(x) log₂ Q(x)

  关系: H(P, Q) = H(P) + D_KL(P || Q)

  最小化交叉熵 ⟺ 最小化 KL 散度!
  (因为 H(P) 对 Q 来说是常数)

  → 这就是 ML 用交叉熵做损失函数的原因!

═══ KL 散度的性质 ═══

  1. D_KL(P||Q) ≥ 0              (Gibbs 不等式!)
  2. D_KL(P||Q) = 0 ⟺ P = Q     (当且仅当分布相同)
  3. D_KL(P||Q) ≠ D_KL(Q||P)     (不对称! 不是距离!)
  4. 不满足三角不等式              (不是度量!)

  正向 KL: D_KL(P||Q) — "寻模式" (mode-covering)
  反向 KL: D_KL(Q||P) — "找峰值" (mode-seeking)

  正向 KL(P||Q): Q 在 P>0 的地方不能为 0
    → Q 必须覆盖 P 的所有模式 (oversmoothing)
    → 用于: 最大似然估计 MLE

  反向 KL(Q||P): Q 只关注 P 的高概率区域
    → Q 倾向于忽略 P 的小模式 (mode-dropping)
    → 用于: 变分推断 VI, VAE

═══ 计算例子 ═══

  P = [0.5, 0.3, 0.2]  (真实分布)
  Q = [0.4, 0.4, 0.2]  (近似分布)

  D_KL(P||Q) = 0.5·log(0.5/0.4) + 0.3·log(0.3/0.4) 
             + 0.2·log(0.2/0.2)
           = 0.5·0.322 + 0.3·(-0.415) + 0
           = 0.161 - 0.124 = 0.037 bit

  Python:
  import numpy as np
  
  def kl_divergence(p, q):
      p, q = np.array(p), np.array(q)
      return np.sum(p * np.log2(p / q))
  
  # 注意: 需要 q(x)>0 在 p(x)>0 的地方!

═══ 在 ML 中的核心地位 ═══

  损失函数         │ 信息论形式
  ─────────────────┼──────────────────────
  分类交叉熵       │ H(P_label, P_model)
  MSE (高斯假设)   │ 与 D_KL 等价
  VAE ELBO         │ E[log p(x|z)] - D_KL(q||p)
  GAN 目标         │ 2·JSD(P_data||P_gen) - log4`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 数据处理不等式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> data_processing.txt</div>
                <pre className="fs-code">{`═══ 数据处理不等式 (DPI) ═══

  如果 X → Y → Z 构成马尔可夫链:

  I(X; Z) ≤ I(X; Y)

  "处理数据不会增加信息!"
  
  每一步处理只会丢失或保持信息, 绝不会创造新信息

═══ 直觉理解 ═══

  原始数据 X → 压缩 Y → 再压缩 Z

  X 的信息量 ≥ Y 的信息量 ≥ Z 的信息量

  例: 照片(10MB) → JPEG(1MB) → 缩略图(50KB)
  每步都会丢失细节, 无法从缩略图恢复原照片!

═══ 充要条件 ═══

  I(X; Z) = I(X; Y) ⟺ X → Y → Z 中 X-Z 可通过 Y 完全恢复
  
  即: I(X; Y|Z) = 0  (Z 包含了 Y 中关于 X 的全部信息)
  这是"充分统计量"的信息论定义!

═══ 充分统计量 ═══

  T(X) 是关于 θ 的充分统计量:
  
  I(X; θ) = I(T(X); θ)

  T(X) 保留了 X 中关于 θ 的全部信息!

  例: n 个高斯样本 {X₁,...,Xₙ} ~ N(μ, σ²)
  充分统计量 T = (X̄, S²) (样本均值和方差)
  → 只需这两个数, 不需要原始 n 个数据!

═══ 在深度学习中的意义 ═══

  信息瓶颈理论 (Tishby, 2015):
  
  深层网络的每一层形成马尔可夫链:
  X → T₁ → T₂ → ... → Tₙ → Y

  DPI 告诉我们: 
  I(X; T₁) ≥ I(X; T₂) ≥ ... ≥ I(X; Tₙ)

  训练过程分两阶段:
  1. 拟合阶段: I(T; Y) 增加 (学习有用信息)
  2. 压缩阶段: I(T; X) 减少 (丢弃无用信息)
  
  → 好的表示 = 保留任务相关信息, 丢弃噪声!

═══ 应用场景 ═══

  1. 特征工程: 变换不增加信息 → 要选对原始特征
  2. 数据增强: 增强不创造新信息, 但可以暴露已有信息
  3. 知识蒸馏: 学生模型的信息量 ≤ 教师模型
  4. 隐私保护: 差分隐私 = 控制 I(数据; 输出)
  5. 表示学习: 
     目标: max I(Z; Y), min I(Z; X\Y)
     即: 最大化任务信息, 最小化冗余`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 f-散度族</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> f_divergence.txt</div>
                <pre className="fs-code">{`═══ f-散度 (f-Divergence) 统一框架 ═══

  D_f(P || Q) = Σ Q(x) f(P(x)/Q(x))

  其中 f 是凸函数, f(1) = 0

  所有常见散度都是 f-散度的特例!

═══ 特殊情况 ═══

  名称              │ f(t)              │ 散度公式
  ──────────────────┼───────────────────┼─────────────
  KL 散度           │ t·log(t)          │ Σ P log(P/Q)
  反向 KL           │ -log(t)           │ Σ Q log(Q/P)
  JS 散度           │ 见下               │ (KL(P||M)+KL(Q||M))/2
  χ² 散度           │ (t-1)²            │ Σ (P-Q)²/Q
  Hellinger         │ (√t - 1)²         │ Σ (√P - √Q)²
  Total Variation   │ |t-1|/2           │ (1/2)Σ|P-Q|

═══ Jensen-Shannon 散度 (JSD) ═══

  JSD(P || Q) = (1/2)D_KL(P||M) + (1/2)D_KL(Q||M)
  
  其中 M = (P+Q)/2

  性质:
  • 对称! JSD(P||Q) = JSD(Q||P)
  • 有界: 0 ≤ JSD ≤ 1 (以 bit 为单位)
  • √JSD 是度量 (满足三角不等式!)

  GAN 的原始目标:
  min_G max_D [E_P log D(x) + E_Q log(1-D(x))]
  = 2·JSD(P_data || P_gen) - log 4

  → 原始 GAN 最小化 JSD!

═══ Wasserstein 距离 (非 f-散度) ═══

  W(P, Q) = inf_γ E_{(x,y)~γ} [d(x, y)]

  也叫 Earth Mover's Distance (EMD)
  
  优势: 即使 P, Q 支撑集不重叠也有梯度!
  (KL/JSD 在此情况下 = ∞ 或常数 → 梯度消失)

  → WGAN 使用 Wasserstein 距离替代 JSD

═══ 在生成模型中的选择 ═══

  模型      │ 散度/距离
  ──────────┼──────────────────
  GAN       │ JSD (原始) / W (WGAN)
  VAE       │ KL (反向) → ELBO
  Flow      │ KL (正向) → MLE
  Diffusion │ KL → 分步去噪
  EBM       │ Fisher 散度 → Score matching

═══ Python: 散度计算器 ═══

  import numpy as np
  
  def kl(p, q):
      return np.sum(p * np.log2(p / q + 1e-10))
  
  def jsd(p, q):
      m = (p + q) / 2
      return (kl(p, m) + kl(q, m)) / 2
  
  def hellinger(p, q):
      return np.sqrt(np.sum((np.sqrt(p) - np.sqrt(q))**2))
  
  def tv(p, q):
      return 0.5 * np.sum(np.abs(p - q))
  
  # Pinsker 不等式: TV(P,Q) ≤ √(D_KL(P||Q)/2)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
