import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['率失真基础', '量化理论', '矢量量化', '现代有损压缩'];

export default function LessonRateDistortion() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📡 module_06 — 率失真理论</div>
      <div className="fs-hero">
        <h1>率失真理论：有损压缩 / 量化 / VQ</h1>
        <p>
          无损压缩的极限是熵——但如果允许一定失真呢？
          <strong>率失真理论</strong>给出了有损压缩的理论极限 R(D)，
          是 JPEG、MP3、H.264 等所有有损压缩标准的理论基石。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📡 率失真理论深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 率失真基础</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> rate_distortion.txt</div>
                <pre className="fs-code">{`═══ 率失真问题 ═══

  无损压缩: R ≥ H(X)     (不允许任何信息丢失)
  有损压缩: R ≥ R(D)     (允许失真 ≤ D)

  R(D) < H(X) 当 D > 0
  → 允许一点失真就能大幅降低所需比特率!

═══ 失真度量 ═══

  失真函数 d(x, x̂): 衡量原始 x 与重建 x̂ 的差异

  常见失真度量:
  ─────────────────────────────────────────
  汉明失真:    d(x, x̂) = 1{x ≠ x̂}  (离散)
  平方误差:    d(x, x̂) = (x - x̂)²   (连续, MSE)
  绝对误差:    d(x, x̂) = |x - x̂|    (连续, MAE)
  
  平均失真:
  D = E[d(X, X̂)] = Σ P(x, x̂) d(x, x̂)

═══ 率失真函数 R(D) ═══

  R(D) = min_{P(x̂|x): E[d(X,X̂)]≤D} I(X; X̂)

  在所有满足失真约束的编解码器中,
  找最小的互信息 (= 最小所需比特率)!

═══ 经典率失真函数 ═══

  1. 二元源 + 汉明失真:
     R(D) = H(p) - H(D),  0 ≤ D ≤ min(p, 1-p)
     R(D) = 0,             D ≥ min(p, 1-p)

  2. 高斯源 + MSE 失真:  ★ 最重要!
     X ~ N(0, σ²)
     R(D) = (1/2) log₂(σ²/D),  0 ≤ D ≤ σ²
     R(D) = 0,                   D ≥ σ²

     等价: D(R) = σ² · 2^(-2R)
     
     → 每增加 1 bit/样本, 失真减半!
     → 每增加 6 dB SNR, 需多 1 bit

═══ R(D) 的性质 ═══

  1. R(0) = H(X)      (零失真 = 无损压缩)
  2. R(D_max) = 0     (最大失真 = 不需传输)
  3. R(D) 是 D 的凸递减函数
  4. R(D) ≥ 0
  5. 对独立源: R(D)可分离 (每个源独立编码最优)

═══ 信息论与压缩的完整图景 ═══

                无损           有损
  ─────────────┼──────────────┼──────────
  理论极限     │ H(X)         │ R(D)
  最优方法     │ 算术编码     │ 变换+量化+熵编码
  差距         │ ~0 (已解决!) │ ~1-3 dB (持续缩小)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 量化理论</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> quantization.txt</div>
                <pre className="fs-code">{`═══ 标量量化 (Scalar Quantization) ═══

  将连续值映射到有限个离散级:
  Q: ℝ → {y₁, y₂, ..., y_L}

  L = 量化级数 = 2^B (B bit 量化)
  
  均匀量化:
  • 间距 Δ = (max-min)/L
  • 简单但非最优
  • 量化噪声: σ²_q = Δ²/12
  
  SQNR = 10·log₁₀(σ²_x / σ²_q)
       ≈ 6.02·B + 1.76 dB
  
  → 每增加 1 bit → +6 dB 信噪比!

═══ Lloyd-Max 量化器 (最优标量量化) ═══

  给定分布,找最优量化级和判决边界
  
  迭代算法:
  1. 固定量化级 {yᵢ}, 优化判决边界:
     tᵢ = (yᵢ + yᵢ₊₁) / 2   (中点规则)
  
  2. 固定边界 {tᵢ}, 优化量化级:
     yᵢ = E[X | tᵢ₋₁ ≤ X < tᵢ]  (条件均值, 质心)
  
  3. 重复直到收敛

  Python:
  import numpy as np
  
  def lloyd_max(data, n_levels, max_iter=100):
      # 初始化: 均匀量化级
      levels = np.linspace(data.min(), data.max(), n_levels)
      
      for _ in range(max_iter):
          # Step 1: 更新边界 (两级中点)
          bounds = (levels[:-1] + levels[1:]) / 2
          bounds = np.concatenate([[-np.inf], bounds, [np.inf]])
          
          # Step 2: 更新量化级 (各区间质心)
          new_levels = []
          for i in range(n_levels):
              mask = (data >= bounds[i]) & (data < bounds[i+1])
              if mask.any():
                  new_levels.append(data[mask].mean())
              else:
                  new_levels.append(levels[i])
          
          levels = np.array(new_levels)
      
      return levels

═══ 高分辨率量化理论 ═══

  当 B 足够大时 (高比特率近似):

  MSE ≈ (1/12) · Δ² · ∫ f(x)^{1/3} dx

  最优非均匀量化: 
  间距 Δ(x) ∝ f(x)^{-1/3}  (概率密集处细分!)

  对数量化 (μ-law, A-law):
  电话系统标准, 近似最优非均匀量化
  → 8 bit μ-law ≈ 12 bit 均匀 (动态范围)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧩 矢量量化 (VQ)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> vector_quantization.txt</div>
                <pre className="fs-code">{`═══ 矢量量化基础 ═══

  将向量空间划分为 L 个区域, 每个区域用一个代表点 (码字)
  
  码书: C = {c₁, c₂, ..., c_L}
  
  编码: 找最近码字 Q(x) = argmin_{cᵢ} d(x, cᵢ)
  传输: 码字索引 (⌈log₂L⌉ bit)
  解码: 查码书

  为什么矢量优于标量?

═══ VQ 的增益来源 ═══

  1. 空间增益:
     数据分布不均匀 → VQ 只在密集区域放码字
     (标量量化浪费空间在无数据区域)

  2. 记忆增益:
     样本间有相关性 → VQ 利用联合统计
     (标量量化忽略样本间关系)

  3. 形状增益:
     高维空间中球的填充效率更高

  理论保证:
  对 iid 高斯源, 维度 k → ∞ 时:
  VQ 的 MSE → 率失真函数 R(D)!

═══ LBG 算法 (VQ 设计) ═══

  Linde-Buzo-Gray, 1980 — VQ 版的 K-means!

  def lbg_vq(data, n_codewords, dim):
      # 初始化: 一个码字 = 全局质心
      codebook = [data.mean(axis=0)]
      
      while len(codebook) < n_codewords:
          # 分裂: 每个码字 → 两个 (加小扰动)
          new_cb = []
          for c in codebook:
              new_cb.append(c + 0.01)
              new_cb.append(c - 0.01)
          codebook = new_cb
          
          # K-means 迭代
          for _ in range(20):
              # 分配: 每个数据点 → 最近码字
              labels = assign(data, codebook)
              # 更新: 码字 = 簇的质心
              codebook = update_centroids(data, labels)
      
      return codebook

═══ VQ 的应用 ═══

  1. 语音编码:
     CELP (Code-Excited Linear Prediction)
     → GSM, VoLTE 的核心技术
     8 kbps 高质量语音!

  2. 图像压缩:
     分块 → VQ 编码 → 码书传输
     → 早期游戏纹理压缩 (S3TC/DXT)

  3. ML 中的量化:
     Product Quantization (PQ) → FAISS 向量检索
     将高维向量分成子空间, 各自 VQ
     → 10亿级向量近邻搜索!

  4. LLM 权重量化:
     GPTQ, AWQ → 4-bit/8-bit 量化
     本质是对权重矩阵做 VQ!
     → 减少 4× 内存, 精度损失 < 1%

═══ 率失真编码全景 ═══

  方案              │ 比率     │ 复杂度    │ 场景
  ──────────────────┼──────────┼───────────┼──────
  标量均匀量化      │ 较差     │ O(1)      │ ADC
  Lloyd-Max         │ 良好     │ O(L)      │ 音频
  矢量量化          │ 优秀     │ O(L·k)   │ 语音/图像
  变换+标量量化     │ 优秀     │ O(n log n)│ JPEG/MP3
  变换+熵编码       │ 接近R(D) │ O(n)      │ H.265`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎬 现代有损压缩</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> modern_lossy.txt</div>
                <pre className="fs-code">{`═══ 变换编码框架 ═══

  现代有损压缩的经典流水线:
  
  原始信号 → 变换 → 量化 → 熵编码 → 比特流
  
  变换: 去相关, 能量集中
  量化: 信息丢失的唯一环节!
  熵编码: 无损压缩量化结果

═══ 常用变换 ═══

  变换            │ 用途        │ 特点
  ────────────────┼─────────────┼──────────
  DCT (离散余弦)  │ JPEG,H.264 │ 实数, 块变换
  DWT (离散小波)  │ JPEG2000   │ 多分辨率
  KLT (Karhunen-  │ 理论最优   │ 数据自适应
      Loève)     │            │ 计算昂贵
  FFT            │ 音频MP3    │ 频域
  Learned        │ 神经压缩   │ 端到端优化

  KLT 定理: 对高斯源, KLT 是最优变换
  DCT: KLT 在 AR(1) 过程下的近似 → 接近最优!

═══ JPEG 压缩流程 ═══

  1. 色彩空间: RGB → YCbCr, 色度下采样 (4:2:0)
  2. 分块: 8×8 像素块
  3. DCT: 每块进行 2D DCT 变换
  4. 量化: DC系数+AC系数 ÷ 量化矩阵 (信息丢失!)
  5. 之字扫描: AC 系数按频率排序
  6. RLE+Huffman: 无损编码

  质量参数 Q 控制量化步长:
  Q=100: 几乎无损 (~1:3 压缩)
  Q=75:  肉眼难辨 (~1:15 压缩)
  Q=50:  可接受   (~1:30 压缩)
  Q=10:  明显伪影 (~1:80 压缩)

═══ 视频压缩: H.264/H.265 ═══

  时间冗余: 运动估计 + 运动补偿
  空间冗余: 帧内预测 + 变换编码
  统计冗余: CABAC (算术编码)

  帧类型:
  I帧: 独立编码 (关键帧)
  P帧: 前向预测 (参考前面的帧)
  B帧: 双向预测 (参考前后帧)

  H.265 vs H.264: 相同质量下码率减半!
  → 更大块 (64×64), 更精细预测, 更强变换

═══ 神经网络压缩 ═══

  Learned Image Compression (2018+):

  编码器 → 量化 → 熵编码 → 比特流
  (NN)    (直通) (学习先验)
  
  解码器 ← 反量化 ← 熵解码 ← 比特流
  (NN)

  R-D 损失: L = R + λ·D
  = E[-log₂ p(ŷ)] + λ·MSE(x, x̂)

  代表工作:
  • Ballé (2017): 超先验 (hyperprior)
  • Minnen (2018): 自回归 + 超先验
  • Cheng (2020): 高斯混合模型
  
  现状: 已超越传统 VVC (H.266) 的压缩率!
  → 但解码速度仍是瓶颈`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
