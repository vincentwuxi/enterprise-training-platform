import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['向量本质', '线性组合与张成', '基与维度', '向量空间公理'];

export default function LessonVectors() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">📐 module_01 — 向量与向量空间</div>
      <div className="fs-hero">
        <h1>向量与向量空间：从几何直觉到抽象代数</h1>
        <p>
          忘掉"向量就是有方向的箭头"这种说法。在线性代数中，
          <strong>向量是向量空间的元素</strong>——它可以是一个箭头、一列数字、
          一个函数、一张图片的像素、甚至 GPT 的 Token Embedding。
          本模块从三个视角理解向量，构建<strong>线性组合、张成空间、基与维度</strong>的完整直觉。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📐 向量与向量空间</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 三种视角理解向量</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> vectors_three_views</div>
                <pre className="fs-code">{`# 向量的三种等价理解

# ═══ 视角一：物理学家的箭头 ═══
# 向量 = 有大小和方向的箭头
# v⃗ = (3, 4)  →  从原点指向 (3,4) 的箭头
#   长度 |v⃗| = √(3² + 4²) = 5
#   方向 θ = arctan(4/3) ≈ 53.13°

import numpy as np

v = np.array([3, 4])
magnitude = np.linalg.norm(v)    # 5.0
direction = np.arctan2(v[1], v[0])  # 0.927 rad ≈ 53.13°

# ═══ 视角二：计算机科学家的有序列表 ═══
# 向量 = 一组有序数字 (元组/数组)
# 房子 = [面积, 卧室数, 距地铁km, 楼层]
house = np.array([120, 3, 0.5, 15])  # 4维向量!

# 每个维度 = 一个特征 (feature)
# ML 中，一条数据 = 一个特征向量
# MNIST 图片 → 784 维向量 (28×28 像素展平)

# ═══ 视角三：数学家的抽象元素 ═══
# 向量 = 满足向量空间公理的任何东西
# 只要能做 "加法" 和 "标量乘法" 就行!

# 例1: 多项式也是向量
# p(x) = 3x² + 2x + 1
# q(x) = x² - x + 4
# p + q = 4x² + x + 5  ← 加法满足!
# 2p = 6x² + 4x + 2    ← 标量乘法满足!

# 例2: 函数也是向量
# f(x) = sin(x), g(x) = cos(x)
# (f + g)(x) = sin(x) + cos(x)  ← 合法向量!

# 例3: GPT 的 Token Embedding 是 d 维向量
# "猫" → [0.23, -0.87, 0.45, ...] ∈ ℝ⁴⁰⁹⁶
# "狗" → [0.31, -0.76, 0.52, ...] ∈ ℝ⁴⁰⁹⁶
# "猫" - "狗" → 语义差异向量!

# ═══ NumPy 向量运算 ═══
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(f"加法:     {a + b}")       # [5, 7, 9]
print(f"标量乘:   {3 * a}")       # [3, 6, 9]
print(f"点积:     {np.dot(a, b)}")  # 1·4 + 2·5 + 3·6 = 32
print(f"范数:     {np.linalg.norm(a):.2f}")  # √14 ≈ 3.74
print(f"单位化:   {a / np.linalg.norm(a)}")   # 方向不变, 长度=1

# ═══ 点积的几何意义 ═══
# a⃗ · b⃗ = |a⃗| |b⃗| cos(θ)
# 
# cos(θ) > 0 → 夹角 < 90°  → 同向
# cos(θ) = 0 → 夹角 = 90°  → 正交 (垂直)
# cos(θ) < 0 → 夹角 > 90°  → 反向
#
# 在 NLP 中: 余弦相似度 = a⃗·b⃗ / (|a⃗||b⃗|)
# "猫"和"狗"的相似度 ≈ 0.85 (很像!)
# "猫"和"汽车"的相似度 ≈ 0.12 (不相关)

cosine_sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
print(f"余弦相似度: {cosine_sim:.4f}")  # 0.9746`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 线性组合与张成空间 (Span)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> linear_combination_span</div>
                <pre className="fs-code">{`# 线性组合: 向量空间的核心操作

# ═══ 线性组合定义 ═══
# 给定向量 v₁, v₂, ..., vₙ
# 它们的线性组合 = c₁v₁ + c₂v₂ + ... + cₙvₙ
#   其中 c₁, c₂, ..., cₙ 是任意标量

import numpy as np
import matplotlib
# matplotlib.use('Agg')  # For non-GUI environments

v1 = np.array([1, 0])  # x轴方向
v2 = np.array([0, 1])  # y轴方向

# 线性组合: 3v₁ + 2v₂ = (3, 2)
result = 3 * v1 + 2 * v2  # → [3, 2]

# ═══ 张成空间 (Span) ═══
# Span({v₁, v₂}) = 所有可能的线性组合的集合
# = {c₁v₁ + c₂v₂ | c₁, c₂ ∈ ℝ}
#
# 直觉:
#   1个非零向量的 Span → 一条直线
#   2个不共线向量的 Span → 一个平面
#   3个线性无关向量的 Span → 整个 ℝ³

# 例: v₁ 和 v₂ 能张成什么?
v1 = np.array([1, 2])
v2 = np.array([3, 6])  # v₂ = 3·v₁ → 共线!

# Span({v₁, v₂}) = 一条直线 (y = 2x)
# 因为 c₁v₁ + c₂v₂ = (c₁ + 3c₂)·v₁ → 还是 v₁ 方向

# ═══ 线性无关 (Linearly Independent) ═══
# 向量组 {v₁, ..., vₙ} 线性无关 ←→
# c₁v₁ + c₂v₂ + ... + cₙvₙ = 0⃗ 的唯一解是 c₁=c₂=...=cₙ=0
#
# 直觉: 没有一个向量可以用其他向量"凑出来"

# 检验线性无关性
A = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 9]])

rank = np.linalg.matrix_rank(A)
print(f"矩阵秩 = {rank}")  # 2 → 只有2个线性无关向量!
# 第三行 = 2×第二行 - 第一行: [7,8,9] = 2[4,5,6] - [1,2,3]

# ═══ AI 中的应用 ═══
# Word Embedding 的线性组合:
#   king - man + woman ≈ queen
#   → v_king - v_man + v_woman ≈ v_queen
#   → 语义关系被编码为向量运算!
#
# Attention 中的 Value 加权:
#   output = Σ αᵢ · vᵢ
#   = α₁v₁ + α₂v₂ + ... + αₙvₙ
#   → 注意力输出 = Value 向量的线性组合!
#   → αᵢ = softmax(QKᵀ/√d) 就是组合系数

# 验证 Word2Vec 类比
# king = np.array([0.8, 0.2, -0.3, ...])
# man  = np.array([0.5, 0.1, -0.1, ...])
# woman = np.array([0.4, 0.3, 0.2, ...])
# queen_approx = king - man + woman  # 线性组合!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📏 基 (Basis) 与维度 (Dimension)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> basis_and_dimension</div>
                <pre className="fs-code">{`# 基 = 向量空间的"坐标系统"

# ═══ 基的定义 ═══
# 向量空间 V 的一组基 = 满足两个条件的向量组:
# 1. 线性无关 (没有冗余)
# 2. 张成整个 V  (没有遗漏)
#
# 维度 dim(V) = 基中向量的个数

import numpy as np

# ═══ 标准基 (Standard Basis) ═══
# ℝ² 的标准基: e₁ = (1,0),  e₂ = (0,1)
# ℝ³ 的标准基: e₁ = (1,0,0), e₂ = (0,1,0), e₃ = (0,0,1)
e1 = np.array([1, 0, 0])
e2 = np.array([0, 1, 0])
e3 = np.array([0, 0, 1])

# 任何 ℝ³ 中的向量都是标准基的线性组合:
v = np.array([3, -2, 5])
# v = 3·e₁ + (-2)·e₂ + 5·e₃
# 坐标 (3, -2, 5) 就是在标准基下的系数!

# ═══ 非标准基 (换个坐标系) ═══
# 用不同的基看同一个向量, 坐标会变!
B = np.array([[1, 1],
              [1, -1]])  # 新基: b₁=(1,1), b₂=(1,-1)

v = np.array([3, 1])    # 标准基下的坐标

# 求 v 在新基 B 下的坐标
coords_in_B = np.linalg.solve(B.T, v)
print(f"标准基坐标: {v}")          # [3, 1]
print(f"新基坐标:   {coords_in_B}") # [2, 1]
# 验证: 2·(1,1) + 1·(1,-1) = (3, 1) ✓

# ═══ 为什么换基很重要? ═══
# 在 AI 中, "换基" 无处不在:
#
# 1. PCA (主成分分析)
#    原始特征基 → 方差最大方向基 → 降维
#
# 2. Fourier 变换
#    时域基 → 频域基 (sin/cos 函数组成的基)
#
# 3. Embedding
#    One-hot 基 (|V| 维) → 稠密向量基 (d 维)
#    → 这就是为什么 Embedding 能把 50000 维降到 768 维!

# ═══ 维度公式 ═══
# dim(V + W) = dim(V) + dim(W) - dim(V ∩ W)
#
# 秩-零化度定理 (Rank-Nullity):
# 对于 m×n 矩阵 A:
#   rank(A) + nullity(A) = n
#   列空间维度 + 零空间维度 = 列数

A = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 9]])
r = np.linalg.matrix_rank(A)
n = A.shape[1]  # 列数=3
print(f"rank(A) = {r}, nullity(A) = {n - r}")
# rank=2, nullity=1 → 零空间是1维 (一条直线)

# ═══ 维度的直觉 ═══
# ┌─────────────┬──────┬──────────────┐
# │ 向量空间     │ 维度  │ 基的例子      │
# ├─────────────┼──────┼──────────────┤
# │ 一条直线     │ 1    │ 直线方向向量  │
# │ 一个平面     │ 2    │ 平面上2个方向 │
# │ ℝ³ 全空间   │ 3    │ {e₁,e₂,e₃}   │
# │ ℝⁿ          │ n    │ n个标准基     │
# │ 多项式 ≤ 3次│ 4    │ {1, x, x², x³}│
# │ GPT Token   │ 4096 │ Embedding 基  │
# └─────────────┴──────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📜 向量空间公理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> vector_space_axioms</div>
                <pre className="fs-code">{`# 向量空间的 8 条公理

# ═══ 什么是向量空间? ═══
# 一个集合 V + 一个域 F (通常是 ℝ) + 两个运算:
#   1. 向量加法: v + w
#   2. 标量乘法: c · v
# 满足以下 8 条规则:

# ═══ 加法公理 (4条) ═══
# A1. 封闭性:  v, w ∈ V → v + w ∈ V
# A2. 交换律:  v + w = w + v
# A3. 结合律:  (u + v) + w = u + (v + w)
# A4. 零向量:  存在 0⃗ ∈ V, 使得 v + 0⃗ = v

# ═══ 标量乘法公理 (4条) ═══
# S1. 封闭性:  c ∈ F, v ∈ V → c·v ∈ V
# S2. 乘法结合: a(bv) = (ab)v
# S3. 分配律1:  a(v + w) = av + aw
# S4. 分配律2:  (a + b)v = av + bv
# 额外: 1·v = v

# ═══ 验证: ℝ² 是向量空间 ═══
import numpy as np

v = np.array([1, 2])
w = np.array([3, 4])

# A1: 封闭性
print(v + w)       # [4, 6] ∈ ℝ² ✓

# A2: 交换律
print(np.allclose(v + w, w + v))  # True ✓

# A4: 零向量
zero = np.zeros(2)
print(np.allclose(v + zero, v))   # True ✓

# S3: 分配律
print(np.allclose(2 * (v + w), 2*v + 2*w))  # True ✓

# ═══ 反例: 什么不是向量空间? ═══
#
# 1. ℝ² 中第一象限的点 { (x,y) | x≥0, y≥0 }
#    → 标量乘法不封闭! (-1)·(1,2) = (-1,-2) 不在第一象限
#
# 2. 过 (1,0) 的直线 y = x - 1
#    → 加法不封闭! (1,0) + (2,1) = (3,1) 不在这条线上
#    → 向量空间的子空间必须过原点!
#
# 3. 所有行列式为 1 的矩阵
#    → 加法不封闭! det(A)=1, det(B)=1 不推出 det(A+B)=1

# ═══ 不常见但合法的向量空间 ═══
#
# 1. 矩阵空间 ℝᵐˣⁿ  (m×n 矩阵)
#    dim = m·n
#    → CNN 的卷积核就是矩阵空间的元素!
#
# 2. 函数空间 C[a,b]  (连续函数)
#    dim = ∞ (无限维!)
#    → Fourier 级数 = 在无限维函数空间找基
#
# 3. 多项式空间 Pₙ  (次数 ≤ n 的多项式)
#    dim = n + 1
#    基 = {1, x, x², ..., xⁿ}

# ═══ 子空间 (Subspace) ═══
# V 的子空间 W ⊂ V 需满足:
# 1. 0⃗ ∈ W           (包含零向量)
# 2. v, w ∈ W → v + w ∈ W  (加法封闭)
# 3. c ∈ F, v ∈ W → cv ∈ W  (标量乘封闭)
#
# 矩阵的四个基本子空间:
# ┌───────────────────┬─────────────────────┐
# │ 子空间             │ 直觉                 │
# ├───────────────────┼─────────────────────┤
# │ 列空间 Col(A)      │ Ax=b 有解的 b 的集合 │
# │ 零空间 Null(A)     │ Ax=0 的解的集合      │
# │ 行空间 Row(A)      │ 列空间 of Aᵀ         │
# │ 左零空间 Null(Aᵀ)  │ 零空间 of Aᵀ         │
# └───────────────────┴─────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
