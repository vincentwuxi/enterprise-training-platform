import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['SVD 直觉', '数学推导', '截断 SVD', '实战应用'];

export default function LessonSVD() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">📐 module_06 — 奇异值分解</div>
      <div className="fs-hero">
        <h1>SVD：线性代数的"瑞士军刀"</h1>
        <p>
          如果只能学一种矩阵分解，那就学 SVD。它适用于<strong>任何矩阵</strong>（不限方阵、不限秩），
          能用于图像压缩、推荐系统、降噪、伪逆、低秩近似……
          <strong>LoRA 微调的理论基础就是 SVD</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 奇异值分解 (SVD)</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💡 SVD 的几何直觉</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> svd_intuition</div>
                <pre className="fs-code">{`# SVD: 任何线性变换 = 旋转 → 缩放 → 旋转

import numpy as np

# ═══ SVD 定义 ═══
# A = U · Σ · Vᵀ
#
# A: m×n 矩阵 (任意!)
# U: m×m 正交矩阵 (左奇异向量)
# Σ: m×n 对角矩阵 (奇异值, σ₁ ≥ σ₂ ≥ ... ≥ 0)
# V: n×n 正交矩阵 (右奇异向量)

A = np.array([[3, 2, 2],
              [2, 3, -2]])  # 2×3 矩阵

U, sigma, Vt = np.linalg.svd(A)
print(f"U (左奇异向量):\\n{U.round(3)}")
print(f"σ (奇异值): {sigma.round(3)}")
print(f"Vᵀ (右奇异向量):\\n{Vt.round(3)}")

# 重建
Sigma = np.zeros_like(A, dtype=float)
np.fill_diagonal(Sigma, sigma)
A_reconstructed = U @ Sigma @ Vt
print(f"\\nUΣVᵀ = A? {np.allclose(A_reconstructed, A)}")

# ═══ 几何直觉 ═══
# Ax = U · Σ · Vᵀ · x
#
# 1. Vᵀx: 在输入空间旋转 (对齐到奇异方向)
# 2. Σ·: 沿各方向独立缩放 (拉伸/压缩)
# 3. U·: 在输出空间旋转 (对齐到输出方向)
#
# → 任何线性变换都可以分解为: 旋转-缩放-旋转!
# → 这比特征分解更通用 (特征分解要求方阵)

# ═══ 奇异值 vs 特征值 ═══
# 奇异值 = AᵀA 的特征值的平方根
# → σᵢ = √(λᵢ(AᵀA))
vals_ATA = np.linalg.eigvalsh(A.T @ A)
print(f"\\nAᵀA 特征值: {np.sort(vals_ATA)[::-1].round(3)}")
print(f"√特征值:    {np.sqrt(np.sort(vals_ATA)[::-1]).round(3)}")
print(f"奇异值:     {sigma.round(3)}")  # 相等!

# ═══ 奇异值的意义 ═══
# σ₁ = 矩阵的"最大拉伸量" = 算子范数 ||A||₂
# σᵢ 递减 → 依次是次重要的拉伸方向
# σᵢ = 0 → 该方向被"压扁" → 这个方向无信息
# 非零奇异值个数 = rank(A)!

print(f"\\nrank(A) = {np.sum(sigma > 1e-10)}")  # 2
print(f"||A||₂ = σ₁ = {sigma[0]:.3f}")

# ═══ SVD vs 特征分解 ═══
# ┌──────────────┬─────────────┬──────────────┐
# │ 特性          │ 特征分解     │ SVD          │
# ├──────────────┼─────────────┼──────────────┤
# │ 适用范围      │ 仅方阵      │ 任意矩阵     │
# │ 值           │ 可以是复数   │ 一定非负实数  │
# │ 向量         │ 不一定正交   │ 一定正交      │
# │ 可分解       │ 不一定       │ 一定可以!    │
# │ 关系         │ A = PΛP⁻¹   │ A = UΣVᵀ     │
# └──────────────┴─────────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 SVD 的数学推导</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> svd_math</div>
                <pre className="fs-code">{`# SVD 的推导: 从 AᵀA 和 AAᵀ 出发

import numpy as np

# ═══ 推导思路 ═══
# 1. 构造 AᵀA (n×n, 半正定对称)
# 2. AᵀA 的特征分解: AᵀA = VΛV ᵀ
# 3. 奇异值: σᵢ = √λᵢ
# 4. 左奇异向量: uᵢ = Avᵢ/σᵢ

A = np.array([[1, 1],
              [1, 0],
              [0, 1]])  # 3×2

# Step 1: AᵀA
ATA = A.T @ A
print(f"AᵀA = \\n{ATA}")

# Step 2: AᵀA 的特征分解
vals, V = np.linalg.eigh(ATA)
# 按降序排列
idx = np.argsort(vals)[::-1]
vals, V = vals[idx], V[:, idx]
print(f"特征值: {vals}")  # [3, 1]
print(f"V = \\n{V.round(4)}")

# Step 3: 奇异值
sigma = np.sqrt(vals)
print(f"奇异值: {sigma.round(4)}")  # [√3, 1]

# Step 4: 左奇异向量
U = np.zeros((3, 3))
for i in range(len(sigma)):
    U[:, i] = A @ V[:, i] / sigma[i]

# 补全 U 的正交基 (Null(Aᵀ) 的基)
# 用 Gram-Schmidt 或直接SVD
U_full, _, _ = np.linalg.svd(A)
print(f"U = \\n{U_full.round(4)}")

# ═══ 验证 ═══
Sigma = np.zeros_like(A, dtype=float)
np.fill_diagonal(Sigma, sigma)
print(f"UΣVᵀ = A? {np.allclose(U_full @ Sigma @ V.T, A)}")

# ═══ 紧凑 SVD vs 完整 SVD ═══
# 完整 SVD: U(m×m), Σ(m×n), Vᵀ(n×n)
# 紧凑 SVD: U(m×r), Σ(r×r), Vᵀ(r×n)  (r=rank)
# → 紧凑形式节省空间, 且包含全部信息!

# NumPy 的 full_matrices 参数
U_compact, s_compact, Vt_compact = np.linalg.svd(A, full_matrices=False)
print(f"\\n紧凑 SVD:")
print(f"U: {U_compact.shape}, Σ: {s_compact.shape}, Vᵀ: {Vt_compact.shape}")

# ═══ 外积展开 ═══
# A = Σᵢ σᵢ · uᵢ · vᵢᵀ
# = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + ... + σᵣuᵣvᵣᵀ
#
# 每一项 σᵢuᵢvᵢᵀ 是一个秩1矩阵
# σ₁ 最大 → 第一项"最重要"
# 截断前 k 项 → 最优秩-k 近似!

for i in range(len(s_compact)):
    rank1 = s_compact[i] * np.outer(U_compact[:, i], Vt_compact[i, :])
    print(f"σ_{i+1}·u_{i+1}·v_{i+1}ᵀ =\\n{rank1.round(3)}")`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>✂️ 截断 SVD：最优低秩近似</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> truncated_svd</div>
                <pre className="fs-code">{`# 截断 SVD 与 Eckart-Young 定理

import numpy as np

# ═══ Eckart-Young 定理 ═══
# 在所有秩≤k的矩阵中, SVD 截断到前k项是最优近似:
#
# A_k = Σᵢ₌₁ᵏ σᵢuᵢvᵢᵀ
#
# ||A - A_k||_F = √(σ_{k+1}² + ... + σ_r²)
# → 这是理论上最优的! 没有更好的秩-k近似!

# 创建一个"有结构"的矩阵
A = np.array([[ 5, 5, 0, 0],
              [ 5, 5, 0, 0],
              [ 0, 0, 3, 3],
              [ 0, 0, 3, 3],
              [ 1, 1, 1, 1]], dtype=float)

U, sigma, Vt = np.linalg.svd(A, full_matrices=False)
print(f"奇异值: {sigma.round(3)}")  # [10, 6, 1.414, ...]

# ═══ 秩-1 近似 ═══
A1 = sigma[0] * np.outer(U[:, 0], Vt[0, :])
error_1 = np.linalg.norm(A - A1, 'fro')
print(f"秩1近似误差: {error_1:.3f}")

# ═══ 秩-2 近似 ═══
A2 = (sigma[0] * np.outer(U[:, 0], Vt[0, :]) +
      sigma[1] * np.outer(U[:, 1], Vt[1, :]))
error_2 = np.linalg.norm(A - A2, 'fro')
print(f"秩2近似误差: {error_2:.3f}")

# ═══ 压缩率分析 ═══
# 原始: m×n 个数 = 5×4 = 20
# 秩k近似: k(m+n+1) = k(5+4+1) = 10k
# k=1: 存储 10 个数 → 压缩 50%!
# k=2: 存储 20 个数 → 压缩 0% (不划算)
#
# 对于大矩阵 (如 1000×1000):
# 原始: 1,000,000
# k=50: 50(2001) = 100,050 → 压缩 90%!

m, n = 1000, 1000
for k in [10, 50, 100]:
    storage = k * (m + n + 1)
    ratio = storage / (m * n)
    print(f"k={k:3d}: 存储 {storage:,}, 压缩率 {(1-ratio)*100:.1f}%")

# ═══ 图像压缩示例 ═══
# 一张灰度图 = 一个矩阵
# SVD 截断 → 保留主要"特征", 去掉噪声

# 模拟 256×256 灰度图
np.random.seed(42)
# 低秩结构 + 噪声
low_rank = np.outer(np.sin(np.linspace(0, 6, 256)),
                     np.cos(np.linspace(0, 8, 256)))
noise = 0.1 * np.random.randn(256, 256)
image = low_rank + noise

U, s, Vt = np.linalg.svd(image, full_matrices=False)

# 不同截断级别的误差
for k in [1, 5, 10, 30, 50]:
    img_k = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]
    psnr = 20 * np.log10(np.max(np.abs(image)) / 
                          np.sqrt(np.mean((image - img_k)**2)))
    ratio = k * (256 + 256 + 1) / (256 * 256)
    print(f"k={k:3d}: PSNR={psnr:.1f}dB, 压缩率={(1-ratio)*100:.1f}%")

# ═══ 能量保留 ═══
total_energy = np.sum(s**2)
for k in [1, 5, 10, 30]:
    retained = np.sum(s[:k]**2) / total_energy
    print(f"k={k:3d}: 能量保留 {retained*100:.1f}%")`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 SVD 实战应用</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> svd_applications</div>
                <pre className="fs-code">{`# SVD 在 AI/工程中的重要应用

import numpy as np

# ═══ 1. 推荐系统 (矩阵补全) ═══
# 用户-物品评分矩阵通常是稀疏+低秩的
# R ≈ U·Σ·Vᵀ  (截断到 k 维)
# 
# Netflix Prize:
# R (500K用户 × 17K电影) → k=100 的低秩近似
# 未评分 = U₁·Σ·V_jᵀ → 预测评分!

# 模拟评分矩阵 (5用户 × 4电影)
R = np.array([[5, 4, 0, 1],    # 用户1: 喜欢动作片
              [4, 5, 1, 0],    # 用户2: 喜欢动作片
              [1, 1, 5, 4],    # 用户3: 喜欢爱情片
              [0, 1, 4, 5],    # 用户4: 喜欢爱情片
              [3, 3, 3, 3]], dtype=float)  # 用户5: 都喜欢

U, s, Vt = np.linalg.svd(R, full_matrices=False)
# 截断到 k=2 → 发现"动作"和"爱情"两个潜在因子
R_approx = U[:, :2] @ np.diag(s[:2]) @ Vt[:2, :]
print(f"秩2近似 (预测评分):\\n{R_approx.round(1)}")

# ═══ 2. 文本 LSA (潜在语义分析) ═══
# 词-文档矩阵的 SVD → 发现语义主题
# 
# TF-IDF 矩阵 (词 × 文档)
# → SVD 截断 → 语义空间
# → "汽车"和"轿车"在语义空间中距离近!
# → 这是 Word2Vec 之前的降维方法

# ═══ 3. 图像降噪 ═══
# 信号 = 低秩成分
# 噪声 = 高秩成分
# → 截断 SVD 保留大奇异值 → 去噪!

np.random.seed(42)
signal = np.outer(np.ones(50), np.sin(np.linspace(0, 4*np.pi, 50)))
noisy = signal + 0.5 * np.random.randn(50, 50)

U, s, Vt = np.linalg.svd(noisy)
denoised = s[0] * np.outer(U[:, 0], Vt[0])  # 只保留最大奇异值
mse_before = np.mean((noisy - signal)**2)
mse_after = np.mean((denoised - signal)**2)
print(f"\\n降噪效果 — MSE: {mse_before:.3f} → {mse_after:.3f}")

# ═══ 4. LoRA (低秩适配) ═══
# LLM 微调: W_new = W + ΔW
# ΔW ≈ B·A  (低秩分解)
# 
# 为什么有效? 因为微调的权重更新 ΔW 往往是低秩的!
# → 实验表明 ΔW 的前几个奇异值就包含了 90%+ 的信息
# → 所以 LoRA 用 r=4~64 就够了

# 模拟: 原始权重 + 低秩更新
d = 128
W = np.random.randn(d, d) * 0.1  # 原始权重
delta_W_true = np.outer(np.random.randn(d), np.random.randn(d)) * 0.01

_, s_delta, _ = np.linalg.svd(delta_W_true)
print(f"\\nΔW 奇异值能量分布:")
total = np.sum(s_delta**2)
for k in [1, 4, 8]:
    ratio = np.sum(s_delta[:k]**2) / total
    print(f"  前{k}个: {ratio*100:.1f}%")

# ═══ 5. 伪逆 ═══
# A⁺ = V · Σ⁺ · Uᵀ
# Σ⁺: 非零奇异值取倒数, 零不变
# → 伪逆是 SVD 的直接产物!

# ═══ 应用总结 ═══
# ┌──────────────────┬───────────────────┐
# │ 应用              │ SVD 的角色         │
# ├──────────────────┼───────────────────┤
# │ 图像压缩          │ 截断 SVD 低秩近似  │
# │ 推荐系统          │ 矩阵补全 / 协同过滤│
# │ NLP/LSA          │ 降维 / 语义发现     │
# │ 降噪              │ 去除高频成分       │
# │ LoRA 微调         │ 低秩权重更新       │
# │ 伪逆              │ 最小二乘解         │
# │ 条件数估计         │ σ_max / σ_min     │
# └──────────────────┴───────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
