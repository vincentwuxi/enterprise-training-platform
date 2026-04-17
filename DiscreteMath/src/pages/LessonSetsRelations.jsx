import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['集合运算', '关系及其性质', '等价关系与划分', '偏序与格'];

export default function LessonSetsRelations() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔢 module_02 — 集合与关系</div>
      <div className="fs-hero">
        <h1>集合与关系：集合运算 / 等价关系 / 偏序</h1>
        <p>
          集合论是整个数学的语言——
          <strong>集合运算</strong>对应数据库的 JOIN/UNION/INTERSECT，
          <strong>等价关系</strong>是分类/分组的数学抽象，
          <strong>偏序</strong>定义了依赖关系和拓扑排序的理论基础。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 集合与关系深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 集合运算</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> sets.txt</div>
                <pre className="fs-code">{`═══ 集合基础 ═══

  集合: 不重复元素的无序集 (collection)
  
  表示法:
    枚举: A = {1, 2, 3}
    描述: B = {x ∈ ℤ | x > 0 ∧ x < 10}
    构造: C = {x² | x ∈ {1,2,3}} = {1, 4, 9}

  特殊集合:
    ∅       空集
    ℕ       自然数 {0, 1, 2, ...}
    ℤ       整数
    ℚ       有理数
    ℝ       实数
    𝒫(A)    A 的幂集 (所有子集构成的集合)

═══ 运算 ═══

  运算      │ 符号      │ 定义                    │ SQL 对应
  ──────────┼───────────┼─────────────────────────┼──────────
  并集      │ A ∪ B     │ {x | x∈A ∨ x∈B}       │ UNION
  交集      │ A ∩ B     │ {x | x∈A ∧ x∈B}       │ INTERSECT
  差集      │ A \ B     │ {x | x∈A ∧ x∉B}       │ EXCEPT
  对称差    │ A △ B     │ (A\B) ∪ (B\A)           │ XOR
  补集      │ Aᶜ        │ U \ A (U=全集)          │ NOT IN
  笛卡尔积  │ A × B     │ {(a,b) | a∈A, b∈B}    │ CROSS JOIN

  |A ∪ B| = |A| + |B| - |A ∩ B|  (容斥原理的最简形式!)

═══ 幂集 (Power Set) ═══

  𝒫({a, b}) = {∅, {a}, {b}, {a,b}}
  
  |𝒫(A)| = 2^|A|
  
  应用:
  • 子集枚举 → 位掩码! (bitmask)
  • {a,b,c}: 000=∅, 001={c}, 010={b}, 011={b,c}, ...
  
  Python:
    from itertools import combinations
    A = {1, 2, 3}
    power_set = []
    for r in range(len(A) + 1):
        power_set.extend(combinations(A, r))

═══ 集合运算律 ═══

  交换律:  A ∪ B = B ∪ A
  结合律:  (A ∪ B) ∪ C = A ∪ (B ∪ C)
  分配律:  A ∩ (B ∪ C) = (A∩B) ∪ (A∩C)
  De Morgan: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ   ← 命题逻辑的推广!
             (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ
  吸收律:  A ∪ (A ∩ B) = A
  
  ↕ 完全对应命题逻辑! (∪↔∨, ∩↔∧, ᶜ↔¬)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 关系及其性质</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> relations.txt</div>
                <pre className="fs-code">{`═══ 二元关系 ═══

  R ⊆ A × B — 关系是笛卡尔积的子集

  例: A = {1,2,3}, R = {(1,2), (2,3), (1,3)} 即 "小于"

  表示:
  • 集合: R = {(a,b), ...}
  • 矩阵: M[i][j] = 1 iff (aᵢ, aⱼ) ∈ R  (邻接矩阵!)
  • 有向图: 节点=元素, 边=关系对

═══ 关系的四大性质 ═══

  性质      │ 定义                        │ 矩阵特征      │ 图特征
  ──────────┼─────────────────────────────┼───────────────┼──────────
  自反性    │ ∀a, (a,a)∈R               │ 对角线全1      │ 每个节点有自环
  对称性    │ (a,b)∈R → (b,a)∈R         │ M = Mᵀ        │ 双向边
  反对称性  │ (a,b)∈R ∧ (b,a)∈R → a=b  │ 上/下三角      │ 无双向边(除自环)
  传递性    │ (a,b)∈R ∧ (b,c)∈R → (a,c)∈R │ M² ≤ M     │ 路径可直达

  例: ≤ 在 ℤ 上: 自反 ✓ 反对称 ✓ 传递 ✓ → 偏序!
      =  在 ℤ 上: 自反 ✓ 对称 ✓ 传递 ✓ → 等价关系!
      <  在 ℤ 上: 非自反 反对称 ✓ 传递 ✓ → 严格偏序

═══ 关系的闭包 ═══

  闭包: 添加最少的元素使关系满足某性质

  自反闭包:  r(R) = R ∪ {(a,a) | a ∈ A}     (加对角线)
  对称闭包:  s(R) = R ∪ {(b,a) | (a,b) ∈ R} (加反向边)
  传递闭包:  t(R) = R ∪ R² ∪ R³ ∪ ...        (Warshall算法!)

  传递闭包算法 (Warshall):
    for k = 1 to n:
      for i = 1 to n:
        for j = 1 to n:
          M[i][j] = M[i][j] ∨ (M[i][k] ∧ M[k][j])
  
  时间: O(n³)  — 与 Floyd-Warshall 同构!

═══ 复合关系 ═══

  S ∘ R: 先走 R 再走 S
  (a, c) ∈ S ∘ R ⟺ ∃b, (a,b)∈R ∧ (b,c)∈S
  
  矩阵表示: M(S∘R) = M(R) · M(S)  (布尔乘法!)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏷️ 等价关系与划分</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> equivalence.txt</div>
                <pre className="fs-code">{`═══ 等价关系 ═══

  满足 自反 + 对称 + 传递 的关系

  例:
  • 同余: a ≡ b (mod n) ⟺ n | (a-b)
    3 ≡ 8 (mod 5) ✓  (5 | 5)
    
  • 字符串同构: "abc" ~ "xyz" (相同结构)
  • 图同构: 拓扑结构相同

═══ 等价类 [a] ═══

  [a] = {x ∈ A | (x, a) ∈ R}
  
  "与 a 等价的所有元素的集合"

  例: ℤ 上 mod 3 的等价类
    [0] = {..., -6, -3, 0, 3, 6, 9, ...}
    [1] = {..., -5, -2, 1, 4, 7, 10, ...}
    [2] = {..., -4, -1, 2, 5, 8, 11, ...}

  性质:
  1. [a] ≠ ∅           (非空, 至少包含 a)
  2. a ~ b ⟹ [a] = [b]  (等价则类相同)
  3. a ≁ b ⟹ [a] ∩ [b] = ∅  (不等价则不相交)

═══ 划分 (Partition) ═══

  集合 A 的一个划分 = A 的若干非空子集，
  两两不相交且并集 = A

  定理: 等价关系 ⟺ 划分
  
  • 给定等价关系 → 等价类构成划分
  • 给定划分 → "在同一块中" 构成等价关系

  例: {1,2,3,4,5,6} 的划分:
    {{1,3,5}, {2,4,6}}  → 奇偶分类
    {{1,2}, {3,4}, {5,6}} → 连续配对
    {{1,2,3,4,5,6}}      → 平凡划分 (全体)

═══ 在计算机中的应用 ═══

# ─── 1. 并查集 (Union-Find) ───
# 维护等价类的经典数据结构

  class UnionFind:
      def __init__(self, n):
          self.parent = list(range(n))
          self.rank = [0] * n
      
      def find(self, x):          # 路径压缩
          if self.parent[x] != x:
              self.parent[x] = self.find(self.parent[x])
          return self.parent[x]
      
      def union(self, x, y):      # 按秩合并
          px, py = self.find(x), self.find(y)
          if px == py: return
          if self.rank[px] < self.rank[py]:
              px, py = py, px
          self.parent[py] = px
          if self.rank[px] == self.rank[py]:
              self.rank[px] += 1
  
  # 均摊 O(α(n)) ≈ O(1) per operation!

# ─── 2. 应用场景 ───
  • 连通分量检测
  • Kruskal MST
  • 社交网络朋友圈
  • 图像连通区域标记
  • 编译器别名分析`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 偏序与格</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> partial_orders.txt</div>
                <pre className="fs-code">{`═══ 偏序关系 (Partial Order) ═══

  满足 自反 + 反对称 + 传递 → (A, ≤) 是偏序集 (Poset)

  例:
  • (ℤ, ≤) — 全序!
  • (𝒫(S), ⊆) — 子集关系
  • (ℕ, |) — 整除关系 (2|6 但 2∤5)
  • 任务依赖图 — 偏序!

  全序 vs 偏序:
    全序: ∀a,b, a≤b 或 b≤a (可比较)
    偏序: 可能存在 a⊀b 且 b⊀a (不可比!)

═══ Hasse 图 ═══

  偏序的可视化: 省略自反/传递边, 元素从下到上排列

  ({1,2,3,4,6,12}, |) 的 Hasse 图:
  
        12
       / \\
      4   6
      |  / \\
      2   3
       \\ /
        1

═══ 特殊元素 ═══

  元素      │ 定义
  ──────────┼─────────────────────────────
  最大元    │ ∀a∈S, a ≤ m       (唯一，如果存在)
  最小元    │ ∀a∈S, m ≤ a       (唯一，如果存在)
  极大元    │ 不存在 a, m < a    (可能多个!)
  极小元    │ 不存在 a, a < m    (可能多个!)
  上界      │ ∀a∈S, a ≤ u      (可能不在 S 中)
  下界      │ ∀a∈S, l ≤ a
  上确界(sup)│ 最小上界 (LUB)
  下确界(inf)│ 最大下界 (GLB)

═══ 格 (Lattice) ═══

  每对元素都有 sup 和 inf 的偏序集

  例: (𝒫({a,b,c}), ⊆) 是格
    sup(X,Y) = X ∪ Y   (join, ∨)
    inf(X,Y) = X ∩ Y   (meet, ∧)

  布尔格: 有补的分配格 → Boolean Algebra!
    补: ∀a, ∃ā, a∧ā=0, a∨ā=1
    → 和命题逻辑同构!

═══ 拓扑排序 (偏序→全序) ═══

  把偏序关系线性化 (满足所有依赖)

  算法 (Kahn's):
    1. 找入度为 0 的节点加入队列
    2. 弹出节点, 输出, 删除其出边
    3. 新的入度 0 节点加入队列
    4. 重复直到队列为空

  应用:
  • 编译依赖: Makefile
  • 课程先修: 必须先学 A 再学 B
  • 任务调度: CI/CD pipeline
  • 包管理: npm/pip 依赖解析

  from collections import deque
  def topo_sort(graph):
      in_deg = {v: 0 for v in graph}
      for u in graph:
          for v in graph[u]:
              in_deg[v] += 1
      q = deque(v for v in in_deg if in_deg[v] == 0)
      result = []
      while q:
          u = q.popleft()
          result.append(u)
          for v in graph[u]:
              in_deg[v] -= 1
              if in_deg[v] == 0:
                  q.append(v)
      return result if len(result) == len(graph) else None  # 有环!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
