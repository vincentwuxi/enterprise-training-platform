import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['标准形式', '单纯形法', '对偶与灵敏度', '内点法与求解'];

export default function LessonLinearProg() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🎯 module_04 — 线性规划</div>
      <div className="fs-hero">
        <h1>线性规划：单纯形法 / 对偶 / 灵敏度分析</h1>
        <p>
          线性规划是运筹学的基石——每年有价值数十亿美元的决策依赖 LP。
          从<strong>单纯形法</strong>的几何直觉到<strong>对偶理论</strong>的经济学解释，
          掌握 LP 就掌握了优化的根基。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 线性规划深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 标准形式与建模</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> lp_standard.txt</div>
                <pre className="fs-code">{`═══ LP 标准形式 ═══

  min  cᵀx
  s.t. Ax = b
       x ≥ 0

  任何 LP 都可以化为标准形式!

  变换技巧:
  • max → min: 取负  min(-cᵀx)
  • ≤ → =:   加松弛变量  Ax + s = b, s ≥ 0
  • ≥ → =:   减剩余变量  Ax - s = b, s ≥ 0
  • 无界 x:  x = x⁺ - x⁻, x⁺,x⁻ ≥ 0

═══ LP 的几何 ═══

  可行域: 多面体 (半空间交集)
  目标: 等值线 (超平面)
  最优解: 在多面体的顶点!

  基本可行解 (BFS) = 顶点
  → m×n 矩阵, 顶点最多 C(n,m) 个

═══ 建模示例: 生产计划 ═══

  两种产品: A ($40/个), B ($30/个)
  三种原料约束:
  • 原料 1: 2A + 1B ≤ 100
  • 原料 2: 1A + 1B ≤ 80
  • 原料 3: 1A + 3B ≤ 120

  max  40x₁ + 30x₂
  s.t. 2x₁ + x₂ ≤ 100
       x₁ + x₂ ≤ 80
       x₁ + 3x₂ ≤ 120
       x₁, x₂ ≥ 0

═══ LP 的特殊情况 ═══

  1. 无界: 目标可以无限改善 (可行域无界)
  2. 不可行: 约束矛盾 (空可行域)
  3. 退化: 多个基对应同一顶点
  4. 多最优: 最优面 (无穷多最优解)

═══ 网络流 LP ═══

  min Σ cᵢⱼ xᵢⱼ
  s.t. Σⱼ xᵢⱼ - Σⱼ xⱼᵢ = bᵢ  (流守恒)
       0 ≤ xᵢⱼ ≤ uᵢⱼ           (容量)

  特殊结构 → 专用高效算法!
  • 最短路 (Dijkstra)
  • 最大流 (Ford-Fulkerson)
  • 最小费用流
  • 分配问题 (Hungarian)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 单纯形法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> simplex.txt</div>
                <pre className="fs-code">{`═══ 单纯形法核心思想 ═══

  1. 从一个顶点出发
  2. 沿着边移动到更好的相邻顶点
  3. 重复直到没有更好的邻居 → 最优!

  为什么有效:
  • LP 的最优解一定在顶点
  • 每步目标值严格改善 (非退化情况)
  • 顶点数有限 → 必然终止

═══ 单纯形表 (Tableau) ═══

  标准形式: min cᵀx, s.t. Ax = b, x ≥ 0

  基本变量 B: 非零变量 (正好 m 个)
  非基变量 N: 零变量 (n-m 个)

  x_B = B⁻¹b - B⁻¹N·x_N

  缩减费用 (Reduced Cost):
  c̄_N = c_N - c_B^T B⁻¹ N

  最优性判定: c̄_N ≥ 0 → 最优!
  
  枢轴操作 (Pivot):
  选入基: c̄_j < 0 的列 (改善方向)
  选出基: 最小比率测试 (保持可行)

═══ 两阶段法 ═══

  阶段 I:  min Σ yᵢ s.t. Ax + y = b, x,y ≥ 0
           → 找到可行起点 (y = 0 时可行)
  
  阶段 II: 从可行起点开始, 优化原目标

═══ 退化与反循环 ═══

  退化: 基本变量等于 0
  → 枢轴可能不改善目标值!
  → 可能循环!

  反循环规则:
  • Bland 规则: 选最小下标 (保证终止)
  • 最小比率规则的字典序 (Lexicographic)
  → 理论保证, 实际几乎不循环

═══ 复杂度 ═══

  理论最坏: 指数! (Klee-Minty 反例)
  实际: O(m) 次迭代 (经验!)
  每次迭代: O(mn) 运算

  → 实际中极快! 几百万变量也能秒解!
  → 但理论保证不如内点法

═══ 修正单纯形法 ═══

  不维护完整表, 只存 B⁻¹ (或其 LU 分解)
  → 稀疏时只操作非零元 → 大幅加速!
  → 工业级求解器的标准`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ 对偶与灵敏度</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> duality_lp.txt</div>
                <pre className="fs-code">{`═══ LP 对偶 ═══

  原问题 (Primal):           对偶 (Dual):
  min  cᵀx                  max  bᵀy
  s.t. Ax = b               s.t. Aᵀy ≤ c
       x ≥ 0

  对偶的对偶 = 原问题!

═══ LP 强对偶定理 ═══

  如果原问题和对偶都可行, 则:
  max bᵀy* = min cᵀx* (强对偶!)

  互补松弛:
  xⱼ* (cⱼ - aⱼᵀy*) = 0  ∀j
  
  → 如果 xⱼ* > 0, 则对偶约束紧!
  → 如果对偶约束松, 则 xⱼ* = 0!

═══ 对偶的经济学解释 ═══

  原问题: 生产者利润最大化
  • x: 产品数量
  • c: 利润 (负成本)
  • b: 资源总量
  • A: 单位资源消耗

  对偶: 资源定价!
  • y: 资源的影子价格 (边marginal value)
  • bᵀy: 资源的总价值
  • Aᵀy ≤ c: 产品的资源成本 ≤ 售价

  y* = ∂(最优利润)/∂(资源量)
  → 每单位额外资源值多少钱!

═══ 灵敏度分析 ═══

  1. 目标系数变化 (c → c + Δc):
     如果 Δcⱼ 使 c̄_j 仍 ≥ 0 → 基不变!
     允许范围: c̄_j/更新系数 → 求范围

  2. 右端项变化 (b → b + Δb):
     新解: x*_B = B⁻¹(b + Δb) ≥ 0 时基不变
     最优值变化: Δz* = yᵀΔb (影子价格!)

  3. 新增变量:
     检查 c̄_new = c_new - c_Bᵀ B⁻¹ a_new
     < 0 → 应该引入! (当前解非最优)

  4. 新增约束:
     检查当前解是否满足
     不满足 → 用对偶单纯形法修复

═══ 灵敏度的实际价值 ═══

  "如果多给 1 吨原料, 利润增加多少?"
  → 看影子价格 y*!

  "价格波动 ±10%, 最优方案变不变?"
  → 看允许范围!

  → 比最优解本身更有价值的信息!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🖥️ 内点法与求解实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> lp_solve.py</div>
                <pre className="fs-code">{`# ═══ LP 内点法 ═══
#
# 不沿边走 (单纯形), 而是穿过内部!
#
# 障碍问题:
# min cᵀx - (1/t) Σ log(xᵢ)
# s.t. Ax = b
#
# KKT 系统 (牛顿步):
# [0  Aᵀ I] [Δy]   [-rp]
# [A  0  0] [Δx] = [-rd]
# [S  0  X] [Δs]   [-rc]

# 复杂度: O(n³·⁵ log(1/ε)) → 多项式时间!
# 每步: O(n³) (解牛顿系统)
# 迭代: O(√n) (与问题规模根号相关!)

# ═══ SciPy 求解 ═══

from scipy.optimize import linprog

# min cᵀx s.t. A_ub·x ≤ b_ub, A_eq·x = b_eq
result = linprog(
    c=[40, 30],           # 目标 (最小化!)
    A_ub=[[2,1],[1,1],[1,3]],
    b_ub=[100, 80, 120],
    method='highs'         # HiGHS 求解器 (推荐!)
)
print(result.x)   # 最优解
print(-result.fun) # 最大利润 (取负!)

# ═══ PuLP 建模 (更直观) ═══

from pulp import *

prob = LpProblem("production", LpMaximize)
x1 = LpVariable("A", lowBound=0)
x2 = LpVariable("B", lowBound=0)

prob += 40*x1 + 30*x2                    # 目标
prob += 2*x1 + x2 <= 100                 # 约束
prob += x1 + x2 <= 80
prob += x1 + 3*x2 <= 120

prob.solve(PULP_CBC_CMD(msg=0))
print(f"A={value(x1)}, B={value(x2)}")
print(f"Profit={value(prob.objective)}")

# ═══ 求解器对比 ═══
#
# 求解器   │ 类型   │ LP 规模        │ 开源
# ─────────┼────────┼────────────────┼──────
# HiGHS    │ 单+内  │ 10⁶ 变量      │ ✓
# GLPK     │ 单纯形 │ 10⁵ 变量      │ ✓
# CBC      │ 单+内  │ 10⁶ 变量      │ ✓
# Gurobi   │ 全     │ 10⁸ 变量      │ ✗
# CPLEX    │ 全     │ 10⁸ 变量      │ ✗
#
# 经验: Gurobi ≈ CPLEX >> HiGHS > CBC > GLPK

# ═══ 大规模 LP 技巧 ═══
#
# 1. 预处理 (Presolve):
#    • 去除冗余约束
#    • 固定变量 (bounds tightening)
#    • → 可减少 50-90% 规模!
#
# 2. 列生成 (Column Generation):
#    变量太多 → 只生成需要的列
#    → 切割 & 装箱问题的标准方法!
#
# 3. Benders 分解:
#    大问题 → 主问题 + 子问题
#    → 随机规划的标准方法!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
