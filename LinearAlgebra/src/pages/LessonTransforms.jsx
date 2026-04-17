import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['矩阵即函数', '2D 几何变换', '高维变换', 'AI 中的变换'];

export default function LessonTransforms() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">📐 module_02 — 线性变换</div>
      <div className="fs-hero">
        <h1>线性变换：矩阵是函数，不是数字表格</h1>
        <p>
          矩阵不是死板的数字网格——<strong>每个矩阵都是一个函数</strong>，
          它把向量"变换"到另一个向量。旋转、缩放、投影、剪切……
          所有几何变换都可以用矩阵描述。理解这一点，你就能看穿
          <strong>Transformer 中 QKV 矩阵到底在做什么</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔄 线性变换</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 矩阵 = 线性函数</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> matrix_as_function</div>
                <pre className="fs-code">{`# 矩阵的本质: 一个向量到向量的函数

# ═══ 线性变换的定义 ═══
# T: V → W 是线性变换 ←→ 满足:
# 1. T(u + v) = T(u) + T(v)     (保持加法)
# 2. T(cv) = c·T(v)             (保持标量乘)
#
# 合并: T(au + bv) = a·T(u) + b·T(v)
# → "线性"的本质: 保持线性组合!

import numpy as np

# ═══ 矩阵乘法 = 线性变换 ═══
# 变换 T(v) = Av  (矩阵A左乘向量v)
A = np.array([[2, 1],
              [0, 3]])

v = np.array([1, 1])
w = np.array([2, -1])

# 验证线性性
Tv = A @ v          # [3, 3]
Tw = A @ w          # [3, -3]
Tvw = A @ (v + w)   # [6, 0]
print(f"T(v + w) = {Tvw}")
print(f"T(v) + T(w) = {Tv + Tw}")  # 也是 [6, 0] ✓

# ═══ 矩阵的列 = 基向量的像 ═══
# A = [T(e₁) | T(e₂) | ... | T(eₙ)]
# → 矩阵的第 j 列 = 第 j 个标准基向量经变换后的位置!

e1 = np.array([1, 0])
e2 = np.array([0, 1])

print(f"e₁ 变换后: {A @ e1}")  # [2, 0] = A的第1列
print(f"e₂ 变换后: {A @ e2}")  # [1, 3] = A的第2列

# 这就是理解矩阵最关键的直觉:
# 矩阵 A 告诉你 "坐标轴去哪了"
# 输入的每个向量就是标准基的线性组合
# → 输出 = 新基向量的相同线性组合

# ═══ 变换的复合 = 矩阵乘法 ═══
# T₂ ∘ T₁ 对应 A₂ · A₁
# 先应用 A₁, 再应用 A₂
# 注意顺序: 从右往左读!

A1 = np.array([[0, -1], [1, 0]])   # 逆时针旋转 90°
A2 = np.array([[2, 0], [0, 2]])    # 缩放 2 倍
composite = A2 @ A1                 # 先旋转, 再缩放

v = np.array([1, 0])
print(f"先旋转再缩放: {composite @ v}")  # [0, 2]
print(f"等价于分步:    {A2 @ (A1 @ v)}") # [0, 2] ✓

# ⚠️ 矩阵乘法不满足交换律!
# A₁·A₂ ≠ A₂·A₁  (先旋转再缩放 ≠ 先缩放再旋转... 等等)
# 这个例子碰巧相等, 因为缩放矩阵和所有矩阵交换
# 但一般情况下 AB ≠ BA!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌀 2D 几何变换大全</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> geometric_transforms</div>
                <pre className="fs-code">{`# 所有 2D 几何变换的矩阵表示

import numpy as np

# ═══ 1. 缩放 (Scaling) ═══
# 沿 x 缩放 sx, 沿 y 缩放 sy
def scale(sx, sy):
    return np.array([[sx, 0],
                     [0, sy]])

S = scale(2, 3)  # x方向扩大2倍, y方向扩大3倍
# [[2, 0],
#  [0, 3]]
print(f"缩放 (1,1): {S @ [1,1]}")  # [2, 3]

# ═══ 2. 旋转 (Rotation) ═══
# 逆时针旋转 θ 角
def rotate(theta_deg):
    θ = np.radians(theta_deg)
    return np.array([[np.cos(θ), -np.sin(θ)],
                     [np.sin(θ),  np.cos(θ)]])

R = rotate(45)  # 逆时针45°
print(f"旋转45° (1,0): {R @ [1,0]}")  # [0.707, 0.707]

# 性质: R 是正交矩阵 → R⁻¹ = Rᵀ
# → 旋转的逆 = 反方向旋转 = 矩阵转置!
print(f"R @ Rᵀ = I? {np.allclose(R @ R.T, np.eye(2))}")  # True

# ═══ 3. 反射 (Reflection) ═══
# 关于 x 轴反射
reflect_x = np.array([[ 1,  0],
                       [ 0, -1]])

# 关于 y 轴反射
reflect_y = np.array([[-1,  0],
                       [ 0,  1]])

# 关于 y=x 反射 (就是转置!)
reflect_yx = np.array([[0, 1],
                        [1, 0]])

# ═══ 4. 剪切 (Shear) ═══
# x 方向剪切
shear_x = np.array([[1, 0.5],
                     [0, 1  ]])
print(f"剪切 (1,1): {shear_x @ [1,1]}")  # [1.5, 1]

# ═══ 5. 投影 (Projection) ═══
# 投影到 x 轴
proj_x = np.array([[1, 0],
                    [0, 0]])

# 投影到向量 u 的方向
def proj_matrix(u):
    u = u / np.linalg.norm(u)  # 单位化
    return np.outer(u, u)       # uuᵀ

P = proj_matrix(np.array([1, 2]))
print(f"投影到(1,2)方向: {P @ [3, 1]}")
# 投影是幂等的: P² = P
print(f"P²=P? {np.allclose(P @ P, P)}")  # True

# ═══ 变换的组合 ═══
# 先旋转 30°, 再缩放 (2, 0.5), 再剪切
T = shear_x @ scale(2, 0.5) @ rotate(30)
# 一个矩阵搞定所有变换!

# ═══ 变换特征总结 ═══
# ┌──────────┬──────────┬──────────────────┐
# │ 变换      │ det(A)   │ 特征             │
# ├──────────┼──────────┼──────────────────┤
# │ 旋转      │ 1        │ 保面积, 保角度    │
# │ 缩放      │ sx·sy    │ 面积变为 |det| 倍 │
# │ 反射      │ -1       │ 翻转方向          │
# │ 剪切      │ 1        │ 保面积, 变角度    │
# │ 投影      │ 0        │ 降维! 不可逆      │
# └──────────┴──────────┴──────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧊 高维变换与矩阵分解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> high_dim_transforms</div>
                <pre className="fs-code">{`# 高维线性变换

import numpy as np

# ═══ 像 (Image) 与核 (Kernel) ═══
# 对于 T: ℝⁿ → ℝᵐ (即 m×n 矩阵 A)
#
# 像 Im(T) = {T(v) | v ∈ ℝⁿ} = 输出能到达的空间
#          = A 的列空间 Col(A)
#
# 核 Ker(T) = {v | T(v) = 0⃗} = 被"压扁"到零的输入
#          = A 的零空间 Null(A)
#
# 秩-零化度定理:
# dim(Im) + dim(Ker) = dim(输入空间) = n

A = np.array([[1, 2, 3],
              [4, 5, 6]])  # 2×3 矩阵: ℝ³ → ℝ²

# 这是一个"压缩"变换!
# 3维输入 → 2维输出 → 必然有信息丢失
rank = np.linalg.matrix_rank(A)  # 2
nullity = A.shape[1] - rank       # 1
print(f"rank={rank}, nullity={nullity}")
# 有1维信息被"压扁"了

# ═══ 可逆性 ═══
# 矩阵 A 可逆 ←→ 以下等价:
# • det(A) ≠ 0
# • rank(A) = n (满秩)
# • Null(A) = {0⃗} (零空间只有零向量)
# • A 的列线性无关
# • A 有 n 个非零特征值
# • Ax = b 对任意 b 有唯一解

B = np.array([[1, 2],
              [3, 4]])
print(f"det(B) = {np.linalg.det(B):.1f}")  # -2 ≠ 0 → 可逆!
print(f"B⁻¹ = \\n{np.linalg.inv(B)}")

# 验证 B·B⁻¹ = I
print(f"BB⁻¹ = I? {np.allclose(B @ np.linalg.inv(B), np.eye(2))}")

# ═══ 正交变换 (Orthogonal Transform) ═══
# A 正交 ←→ AᵀA = I ←→ A⁻¹ = Aᵀ
# → 保持长度和角度不变!
# → 旋转和反射都是正交变换

# 3D 旋转矩阵 (绕 z 轴)
def rot_z(theta_deg):
    θ = np.radians(theta_deg)
    return np.array([
        [np.cos(θ), -np.sin(θ), 0],
        [np.sin(θ),  np.cos(θ), 0],
        [0,          0,          1]
    ])

Rz = rot_z(60)
v = np.array([1, 0, 0])
Rv = Rz @ v
print(f"旋转前长度: {np.linalg.norm(v):.2f}")
print(f"旋转后长度: {np.linalg.norm(Rv):.2f}")  # 相同!

# ═══ 换基公式 ═══
# 设 B = [b₁|b₂|...|bₙ] 是新基矩阵
# v 在标准基下的坐标 x_std
# v 在新基下的坐标 x_B
#
# x_std = B · x_B       (从新基到标准基)
# x_B = B⁻¹ · x_std     (从标准基到新基)
#
# 线性变换在新基下的矩阵:
# A_B = B⁻¹ · A · B     ← 相似变换!
# → 对角化就是找一组"好的"基, 让 A 变成对角矩阵!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 AI 中的线性变换</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> transforms_in_ai</div>
                <pre className="fs-code">{`# AI 中到处都是线性变换!

import numpy as np

# ═══ 1. 全连接层 = 线性变换 ═══
# nn.Linear(in, out) 就是 y = Wx + b
# W 是 out × in 矩阵
# 它把 in 维空间映射到 out 维空间

# 例: GPT 的 Embedding 层
# vocab_size = 50257, d_model = 768
# Embedding 矩阵 E ∈ ℝ^(50257 × 768)
# E 的每一行 = 一个 token 的向量表示
# → "cat" → one-hot (50257维) → E → 768维稠密向量

# ═══ 2. Attention 中的 QKV 投影 ═══
# Q = X · W_Q    (d_model → d_k)
# K = X · W_K    (d_model → d_k)
# V = X · W_V    (d_model → d_v)
#
# W_Q 把输入投影到"查询空间"
# W_K 把输入投影到"键空间"
# W_V 把输入投影到"值空间"
#
# 注意力 = softmax(QKᵀ/√d_k) · V
#   QKᵀ ∈ ℝ^(n×n) → 就是两组向量的"相似度矩阵"!
#   → 每个位置关注哪些其他位置

d_model, d_k, seq_len = 768, 64, 128

X = np.random.randn(seq_len, d_model)  # 输入序列
W_Q = np.random.randn(d_model, d_k)     # Q 投影
W_K = np.random.randn(d_model, d_k)     # K 投影

Q = X @ W_Q  # (128, 64)
K = X @ W_K  # (128, 64)

# 注意力分数 = QKᵀ / √d_k
attn_scores = Q @ K.T / np.sqrt(d_k)  # (128, 128)
print(f"Attention 矩阵形状: {attn_scores.shape}")

# ═══ 3. CNN 卷积 = 受限的线性变换 ═══
# 2D 卷积等价于一个特殊的稀疏矩阵
# 普通全连接: 参数 = n² (每个输入连每个输出)
# 卷积: 参数 = k²    (只有局部连接 + 权重共享)
# → 参数从 n² 降到 k² → 这就是 CNN 的效率秘诀!

# ═══ 4. Batch Normalization = 仿射变换 ═══
# BN(x) = γ · (x - μ) / σ + β
# = (γ/σ) · x + (β - γμ/σ)
# = a · x + b  ← 线性变换!

# ═══ 5. ResNet 残差连接 ═══
# y = F(x) + x
# 等价于学习 F(x) = y - x (残差)
# 从矩阵角度: y = (W + I)x
# → 恒等映射 I 保证梯度直接流过!
# → 这就是为什么 ResNet 能训练 1000 层

# ═══ 6. LoRA 低秩适配 ═══
# 原始: W ∈ ℝ^(d×d)           参数: d²
# LoRA: W + BA, B∈ℝ^(d×r), A∈ℝ^(r×d)  参数: 2dr
# r << d → 参数大幅减少!
# 
# 例: d=4096, r=8 → 原始 1670万, LoRA 6.5万 (减少 99.6%!)
d, r = 4096, 8
print(f"Full: {d*d:,} params")
print(f"LoRA: {2*d*r:,} params")
print(f"压缩率: {2*d*r/(d*d)*100:.1f}%")

# ═══ 线性变换在 AI 中的角色总结 ═══
# ┌──────────────┬───────────────────────┐
# │ AI 组件       │ 线性变换的作用         │
# ├──────────────┼───────────────────────┤
# │ Embedding    │ 离散 → 连续空间映射    │
# │ QKV 投影     │ 提取 query/key/value   │
# │ FFN          │ 维度变换 d→4d→d        │
# │ 卷积          │ 局部特征提取           │
# │ BatchNorm    │ 分布标准化             │
# │ 残差连接      │ 恒等+残差变换          │
# │ LoRA         │ 低秩近似微调           │
# └──────────────┴───────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
