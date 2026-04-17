import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['PCA 原理', 'PCA 实现', '核 PCA', 'ML 应用'];

export default function LessonPCA() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">📐 module_07 — PCA 与机器学习</div>
      <div className="fs-hero">
        <h1>PCA 与机器学习：降维 / 数据可视化 / 特征工程</h1>
        <p>
          PCA（主成分分析）是<strong>数据科学家的日常工具</strong>。
          它用特征分解/SVD 找到数据中方差最大的方向，实现降维、去噪和可视化。
          理解 PCA 的数学本质后，你会发现它和 Autoencoder、t-SNE
          之间的深层联系。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 PCA 与机器学习</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 PCA 的数学原理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> pca_theory</div>
                <pre className="fs-code">{`# PCA: 找到数据中方差最大的方向

import numpy as np

# ═══ 问题设置 ═══
# 高维数据 X ∈ ℝ^(n×d)  (n个样本, d个特征)
# 目标: 找 k 个方向 (k << d), 使投影后保留最多信息
# "信息" = 方差!  方差大 = 数据在这个方向上分散 = 信息量大

# ═══ PCA 步骤 ═══
# 1. 中心化: X̃ = X - μ
# 2. 协方差矩阵: C = (1/n) X̃ᵀX̃
# 3. 特征分解: C = VΛVᵀ
# 4. 选前 k 个特征向量 (主成分)
# 5. 投影: Z = X̃ · V_k  (降到 k 维)

# ═══ 为什么是协方差矩阵? ═══
# C[i,j] = Cov(特征i, 特征j)
# = E[(xᵢ - μᵢ)(xⱼ - μⱼ)]
#
# 对角线: C[i,i] = Var(特征i) = 每个特征的方差
# 非对角线: C[i,j] = 特征间的相关性
#
# PCA 的目标: 找一个旋转, 让协方差矩阵变成对角的
# → 对角化 = 让新坐标轴上的特征互不相关!

# ═══ 数学推导 ═══
# 最大化投影方差:
# max_w  wᵀCw  s.t. ||w||=1
#
# 拉格朗日: L = wᵀCw - λ(wᵀw - 1)
# ∂L/∂w = 2Cw - 2λw = 0
# → Cw = λw  ← 特征值问题!
#
# 最大方差 = 最大特征值 λ₁
# w₁ = 对应的特征向量
#
# 第二大方差 = 第二大特征值 λ₂
# w₂ = 对应的特征向量 (且 w₂ ⊥ w₁)

# ═══ 等价: SVD 视角 ═══
# X̃ = UΣVᵀ  (中心化数据的 SVD)
# C = (1/n)X̃ᵀX̃ = (1/n)VΣ²Vᵀ
# → V 的列 = PCA 的主成分!
# → Σ²/n = 协方差矩阵的特征值!
#
# 优势: 直接对 X 做 SVD, 不需要显式计算协方差矩阵
# (协方差矩阵可能 d×d 很大, 但 X 可以用截断 SVD)

# ═══ 信息保留量 ═══
# 前 k 个主成分保留的方差比例:
# r_k = (λ₁ + λ₂ + ... + λ_k) / (λ₁ + λ₂ + ... + λ_d)
#
# 经验法则:
# - r_k > 95% → 足够
# - 看 "elbow point" (方差解释比曲线的拐点)

np.random.seed(42)
X = np.random.randn(200, 5) @ np.diag([5, 3, 1, 0.5, 0.1])
X_centered = X - X.mean(axis=0)
C = np.cov(X_centered.T)
eigenvalues = np.linalg.eigvalsh(C)[::-1]
explained = eigenvalues / eigenvalues.sum()
cumulative = np.cumsum(explained)

print("主成分方差解释比:")
for i, (e, c) in enumerate(zip(explained, cumulative)):
    bar = '█' * int(e * 50)
    print(f"  PC{i+1}: {e*100:5.1f}% {bar}  (累积 {c*100:.1f}%)")`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 PCA 实现与对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> pca_implementation</div>
                <pre className="fs-code">{`# PCA: 从零实现 vs sklearn

import numpy as np

# ═══ 从零实现 PCA ═══
class PCA_Scratch:
    def __init__(self, n_components):
        self.n_components = n_components
        
    def fit(self, X):
        # 1. 中心化
        self.mean = X.mean(axis=0)
        X_centered = X - self.mean
        
        # 2. SVD (不需要显式计算协方差矩阵!)
        U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
        
        # 3. 保留前 k 个主成分
        self.components = Vt[:self.n_components]
        self.explained_variance = (S[:self.n_components]**2) / (X.shape[0]-1)
        self.explained_variance_ratio = (
            self.explained_variance / self.explained_variance.sum()
        )
        return self
    
    def transform(self, X):
        return (X - self.mean) @ self.components.T
    
    def inverse_transform(self, Z):
        return Z @ self.components + self.mean

# 测试
np.random.seed(42)
X = np.random.randn(100, 10) @ np.random.randn(10, 10) * 2

pca = PCA_Scratch(n_components=3)
pca.fit(X)
Z = pca.transform(X)
X_reconstructed = pca.inverse_transform(Z)

print(f"原始形状: {X.shape}")            # (100, 10)
print(f"降维后:   {Z.shape}")             # (100, 3)
print(f"方差解释: {pca.explained_variance_ratio.round(3)}")

# 重建误差
recon_error = np.mean((X - X_reconstructed)**2)
print(f"重建 MSE: {recon_error:.4f}")

# ═══ sklearn 对比 ═══
# from sklearn.decomposition import PCA
# pca_sk = PCA(n_components=3)
# Z_sk = pca_sk.fit_transform(X)
# print(pca_sk.explained_variance_ratio_)

# ═══ 增量 PCA (大数据) ═══
# 数据太大无法放入内存时:
# from sklearn.decomposition import IncrementalPCA
# ipca = IncrementalPCA(n_components=50, batch_size=1000)
# for batch in data_loader:
#     ipca.partial_fit(batch)

# ═══ 随机化 PCA (更快) ═══
# 不需要完整 SVD, 随机投影近似:
# from sklearn.decomposition import PCA
# pca_fast = PCA(n_components=50, svd_solver='randomized')
# O(nd·k) 而非 O(nd·min(n,d))

# ═══ 白化 (Whitening) ═══
# PCA + 标准化: 让每个主成分方差=1
# Z_white = Z / √(Λ)
# → 消除特征间的相关性 + 统一尺度
# → 常用于 ICA、GAN 训练前的预处理

# ═══ PCA 的局限 ═══
# 1. 只能发现线性关系
# 2. 对异常值敏感 (协方差不稳健)
# 3. 主成分不一定有物理意义
# 4. 方差大 ≠ 一定重要 (可能是噪声)
#
# 替代方案:
# - 核 PCA → 非线性降维
# - Robust PCA → 对异常值鲁棒
# - t-SNE/UMAP → 可视化用`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 核 PCA 与非线性降维</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#14b8a6'}}></span> kernel_pca</div>
                <pre className="fs-code">{`# 核 PCA: 当线性 PCA 不够用时

import numpy as np

# ═══ 问题: 线性 PCA 的局限 ═══
# PCA 找的是线性方向 → 无法处理非线性结构
# 例: 同心圆数据, 线性 PCA 完全无效

# 生成同心圆数据
np.random.seed(42)
n = 200
theta = np.random.uniform(0, 2*np.pi, n)
r1 = 1 + 0.1*np.random.randn(n//2)  # 内圈
r2 = 3 + 0.1*np.random.randn(n//2)  # 外圈
X = np.vstack([
    np.column_stack([r1*np.cos(theta[:n//2]), r1*np.sin(theta[:n//2])]),
    np.column_stack([r2*np.cos(theta[n//2:]), r2*np.sin(theta[n//2:])])
])
y = np.array([0]*(n//2) + [1]*(n//2))  # 标签

# 线性 PCA: 投到1维 → 两类完全混在一起!
X_centered = X - X.mean(axis=0)
U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
Z_linear = X_centered @ Vt[0]  # 投影到第一主成分
print(f"线性PCA 1D 投影: 内圈范围 [{Z_linear[:n//2].min():.2f}, {Z_linear[:n//2].max():.2f}]")
print(f"                  外圈范围 [{Z_linear[n//2:].min():.2f}, {Z_linear[n//2:].max():.2f}]")
# → 重叠! 无法分开!

# ═══ 核 PCA: 核技巧 ═══
# 思路: 把数据映射到高维空间 φ(x), 然后做 PCA
# 但不需要显式计算 φ(x)! 只需要核函数:
# K(x, y) = φ(x)ᵀφ(y)
#
# 常用核函数:
# - 线性核:  K(x,y) = xᵀy
# - RBF 核:  K(x,y) = exp(-γ||x-y||²)
# - 多项式核: K(x,y) = (xᵀy + c)^d

# RBF 核 PCA 实现
gamma = 0.5
K = np.exp(-gamma * np.sum((X[:, None] - X[None, :]) ** 2, axis=2))

# 中心化核矩阵
n = K.shape[0]
one_n = np.ones((n, n)) / n
K_centered = K - one_n @ K - K @ one_n + one_n @ K @ one_n

# 特征分解
vals, vecs = np.linalg.eigh(K_centered)
idx = np.argsort(vals)[::-1]
vals, vecs = vals[idx], vecs[:, idx]

# 投影到第一核主成分
Z_kernel = vecs[:, 0] * np.sqrt(vals[0])
print(f"\\n核PCA 1D 投影: 内圈范围 [{Z_kernel[:n//2].min():.2f}, {Z_kernel[:n//2].max():.2f}]")
print(f"                外圈范围 [{Z_kernel[n//2:].min():.2f}, {Z_kernel[n//2:].max():.2f}]")
# → 分开了! 核PCA 能捕捉非线性结构!

# ═══ PCA vs 其他降维方法 ═══
# ┌──────────────┬─────────┬──────────────────┐
# │ 方法          │ 线性?   │ 适用场景          │
# ├──────────────┼─────────┼──────────────────┤
# │ PCA          │ 线性    │ 通用降维/去相关    │
# │ 核 PCA        │ 非线性  │ 非线性流形        │
# │ t-SNE        │ 非线性  │ 2D/3D 可视化      │
# │ UMAP         │ 非线性  │ 可视化 + 保结构    │
# │ Autoencoder  │ 非线性  │ 复杂降维/生成      │
# │ ICA          │ 线性    │ 信号分离 (盲源)    │
# │ NMF          │ 线性    │ 非负数据 (图像/文本)│
# └──────────────┴─────────┴──────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 PCA 在 ML 中的应用</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> pca_ml_applications</div>
                <pre className="fs-code">{`# PCA 在机器学习流水线中的角色

import numpy as np

# ═══ 1. 特征预处理 ═══
# 高维数据 → PCA 降维 → 分类器
# 好处:
# - 去除多重共线性
# - 减少过拟合风险
# - 加速训练
# - 降噪

# 例: MNIST (784维) → PCA (50维) → SVM
# → 精度几乎不变, 训练速度提升 10x

# ═══ 2. 数据可视化 ═══
# 高维 → 2D/3D 投影 → 观察聚类结构
np.random.seed(42)
# 模拟3类高维数据
class1 = np.random.randn(50, 10) + [3, 0, 0, 0, 0, 0, 0, 0, 0, 0]
class2 = np.random.randn(50, 10) + [0, 3, 0, 0, 0, 0, 0, 0, 0, 0]
class3 = np.random.randn(50, 10) + [0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
X = np.vstack([class1, class2, class3])
X_centered = X - X.mean(axis=0)
U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
Z = X_centered @ Vt[:2].T  # 投影到2D
print(f"可视化: {X.shape} → {Z.shape}")

# ═══ 3. 异常检测 ═══
# 重建误差 = 异常分数
# 正常数据: 低维PCA可以很好重建
# 异常数据: 重建误差大 → 异常!

# PCA 降维 + 重建
k = 5  # 保留5个主成分
Z_k = X_centered @ Vt[:k].T
X_recon = Z_k @ Vt[:k]
recon_errors = np.sqrt(np.sum((X_centered - X_recon)**2, axis=1))
threshold = np.percentile(recon_errors, 95)
anomalies = recon_errors > threshold
print(f"异常样本数: {anomalies.sum()} / {len(X)}")

# ═══ 4. PCA 与 Autoencoder 的关系 ═══
# 线性 Autoencoder (无激活函数) = PCA!
#
# Encoder: Z = W_enc · X  (降维)
# Decoder: X̂ = W_dec · Z  (重建)
# Loss: ||X - X̂||²
#
# 最优解: W_enc = Vₖᵀ, W_dec = Vₖ
# → 完全等价于 PCA!
#
# 非线性 Autoencoder:
# 添加 ReLU 等激活 → 能学习非线性流形
# → "非线性 PCA" → 比核 PCA 更灵活

# ═══ 5. PCA 与 Whitening (ZCA) ═══
# ZCA Whitening: X_white = Λ^(-1/2) · Vᵀ · X
# → 数据变成球形分布 (单位协方差)
# → 常用于图像预处理、GAN 输入

cov = np.cov(X_centered.T)
vals, vecs = np.linalg.eigh(cov)
vals = np.maximum(vals, 1e-5)  # 防止除零
X_zca = X_centered @ vecs @ np.diag(1.0/np.sqrt(vals)) @ vecs.T
cov_white = np.cov(X_zca.T)
print(f"\\n白化后协方差对角线: {np.diag(cov_white).round(2)}")
# ≈ 全1 → 每个方向方差=1

# ═══ 选择 k 的经验法则 ═══
# 1. 方差 ≥ 95%: 找最小k使累积方差 ≥ 0.95
# 2. Kaiser 准则: 只保留特征值 > 1 的 (标准化后)
# 3. Scree plot: 特征值曲线的"肘部"
# 4. 交叉验证: 在下游任务上验证`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
