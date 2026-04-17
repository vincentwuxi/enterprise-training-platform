import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['整数规划', '分支定界', '组合优化', 'TSP 实战'];

export default function LessonIntegerComb() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🎯 module_06 — 整数与组合优化</div>
      <div className="fs-hero">
        <h1>整数与组合优化：分支定界 / 启发式 / TSP</h1>
        <p>
          当变量必须是整数时，优化从"简单"变成<strong>NP-hard</strong>——
          但通过<strong>分支定界</strong>、<strong>割平面</strong>和巧妙的松弛技术，
          我们可以在实际中高效求解令人惊讶大的问题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 整数与组合优化深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔢 整数规划 (IP / MIP)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> integer_prog.txt</div>
                <pre className="fs-code">{`═══ 整数规划 (IP) ═══

  min  cᵀx
  s.t. Ax ≤ b
       x ∈ ℤⁿ  (整数!)

  混合整数规划 (MIP):
  部分变量整数, 部分连续

  0-1 整数规划:
  x ∈ {0, 1}ⁿ  (二值决策!)

═══ 为什么难？ ═══

  LP: 多项式时间可解 (内点法)
  IP: NP-hard! (最坏情况指数时间)

  直觉: 取整不行!
  LP 松弛解: x* = [2.7, 1.3] → 取整 [3, 1]
  → 可能不可行!
  → 可能远非最优!

  天真枚举: 2ⁿ 种可能 (n=100 → 10³⁰!) 

═══ LP 松弛 ═══

  去掉整数约束: x ∈ ℤ → x ∈ ℝ
  → 变成 LP, 快速求解!
  
  LP 松弛值 ≤ IP 最优值 (提供下界!)
  
  整数间隙 (Integrality Gap):
  = IP最优 / LP松弛 → 越接近 1 越好!

  如果 LP 解恰好是整数 → 恭喜, 它就是 IP 最优!
  → 全幺模矩阵 (TU) 的 LP 总是整数解!
  → 网络流、分配问题等天然 TU!

═══ 建模技巧 ═══

  1. 逻辑约束:
     "至多选 3 个": Σ xᵢ ≤ 3  (xᵢ ∈ {0,1})
     "选 A 则必选 B": x_A ≤ x_B
     "A 或 B 至少一个": x_A + x_B ≥ 1

  2. 指示约束 (Big-M):
     "如果 x_i = 1 则 f(y) ≤ b":
     f(y) ≤ b + M(1-xᵢ)  (M 足够大)
     
     ⚠️ M 太大 → 数值问题!
     → 尽量紧: M = 实际上界

  3. 分段线性:
     用 SOS2 变量或二进制展开

═══ 应用场景 ═══

  • 排班 / 调度
  • 选址 / 网络设计
  • 投资组合 (买入整数股)
  • 切割 / 装箱
  • 电力调度 (机组启停)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌲 分支定界</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> branch_bound.txt</div>
                <pre className="fs-code">{`═══ 分支定界 (Branch & Bound) ═══

  核心思想: 分而治之 + 剪枝!

  1. 松弛 (Bound):
     解 LP 松弛 → 得到下界
     
  2. 分支 (Branch):
     选一个非整数变量 xⱼ = 2.7
     分两个子问题:
     → xⱼ ≤ 2 (左分支)
     → xⱼ ≥ 3 (右分支)

  3. 剪枝 (Prune):
     • LP 松弛不可行 → 剪!
     • LP 松弛值 ≥ 当前最好整数解 → 剪!
     • LP 解全是整数 → 更新最好解!

═══ 搜索树示例 ═══

          LP松弛 z=5.3
          x₁=2.7 (非整数)
         /           \
    x₁≤2             x₁≥3
    z=4.8             z=5.1
    x₂=1.5            x₂=1 (整数!)
    /     \           → 可行解! UB=5.1
  x₂≤1   x₂≥2
  z=4.2   z=4.9
  (整数!)  > UB=5.1
  UB=4.2   → 剪枝!

  最优: z*=5.1 (x₁=3, x₂=1)

═══ 加速技术 ═══

  1. 割平面 (Cutting Planes):
     添加额外不等式, 不切掉整数解, 
     但切掉 LP 松弛的非整数解!
     → Gomory 割, 混合整数舍入割
     → 加强 LP 松弛 → 间隙缩小!

  2. Branch & Cut:
     分支定界 + 每个节点加割平面
     → 现代 MIP 求解器的标准!

  3. 分支变量选择:
     • 最不可行: 选最接近 0.5 的 (简单)
     • 强分支: 试几个, 选界提升最多的 (慢但好)
     • 可靠性分支: 混合策略 (默认)

  4. 预处理:
     • 变量固定 (probing)
     • 约束传播
     • 系数加强
     → 减少 50-90% 搜索空间!

  5. 启发式 (Heuristics):
     • 在树搜索过程中找可行解
     • RINS, Pump, Octane...
     → 早找到好的上界 → 多剪枝!

═══ 现代 MIP 求解速度 ═══

  Gurobi 2024 vs 1991:
  → 约 200 亿倍加速!
  → 50% 算法 + 50% 硬件`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧩 组合优化经典问题</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> combinatorial.txt</div>
                <pre className="fs-code">{`═══ NP-hard 经典问题 ═══

  1. 背包问题 (Knapsack):
     max Σ vᵢxᵢ  s.t. Σ wᵢxᵢ ≤ W, xᵢ ∈ {0,1}
     → 动态规划 O(nW) (伪多项式)
     → 贪心: 价值密度排序 → 近似比 1/2

  2. 集合覆盖 (Set Cover):
     用最少的集合覆盖全集
     → 贪心: 每次选覆盖最多未覆盖元素的集合
     → 近似比: O(ln n) — 几乎最优!

  3. 图着色:
     用最少颜色给图着色, 相邻节点不同色
     → NP-hard! 
     → 贪心、禁忌搜索

  4. 最大割 (Max-Cut):
     将图的节点分两组, 最大化跨组边数
     → SDP 松弛: Goemans-Williamson 0.878 近似!

═══ 近似算法 ═══

  对 NP-hard 问题:
  不求最优, 只求"足够好" + 保证质量!

  近似比 ρ: 算法解 ≥ ρ · 最优解

  经典结果:
  • 顶点覆盖: 2-近似 (取边两端)
  • 集合覆盖: O(ln n)-近似 (贪心)
  • Max-Cut:   0.878-近似 (SDP)
  • TSP (三角): 1.5-近似 (Christofides)

═══ 元启发式 ═══

  对特别大的问题, 放弃理论保证,
  用智能搜索找好解:

  1. 局部搜索:
     从可行解出发, 不断改善邻域
     → 2-opt, 3-opt (交换边)
     → 卡在局部最优!

  2. 模拟退火 (Simulated Annealing):
     以概率 exp(-ΔE/T) 接受差解
     T 逐渐降低 (退火!)
     → 理论: T→0 足够慢 → 收敛到全局最优
     → 实际: 调参是艺术

  3. 禁忌搜索 (Tabu Search):
     记住最近访问过的解 → 不重复!
     → 系统地探索解空间
     → 车辆路径问题的强力方法

  4. 变邻域搜索 (VNS):
     多种邻域结构交替使用
     → 当一种卡住时换另一种

═══ 亚马逊/谷歌规模 ═══

  物流路径: 百万包裹 → 启发式 
  广告竞价: 实时 → 贪心近似
  芯片布局: 百万门 → 模拟退火 / RL (AlphaChip!)
  → 数学最优 vs 工程近似 → 实际选近似!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗺️ TSP 实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> tsp.py</div>
                <pre className="fs-code">{`# ═══ TSP (旅行商问题) ═══
#
# 给定 n 个城市和距离矩阵
# 找最短的环形路线访问每个城市恰好一次
#
# NP-hard! n 个城市 → (n-1)!/2 种可能路线
# n=20: 6×10¹⁶, n=100: 无法枚举!

import numpy as np
from scipy.spatial.distance import pdist, squareform

# ═══ 贪心最近邻 ═══

def nearest_neighbor(dist_matrix):
    n = len(dist_matrix)
    visited = [False] * n
    tour = [0]
    visited[0] = True
    
    for _ in range(n - 1):
        curr = tour[-1]
        nearest = -1
        min_dist = float('inf')
        for j in range(n):
            if not visited[j] and dist_matrix[curr][j] < min_dist:
                min_dist = dist_matrix[curr][j]
                nearest = j
        tour.append(nearest)
        visited[nearest] = True
    
    return tour
# 快但不好: 通常比最优差 20-50%

# ═══ 2-opt 改善 ═══

def two_opt(tour, dist_matrix):
    n = len(tour)
    improved = True
    while improved:
        improved = False
        for i in range(1, n - 1):
            for j in range(i + 1, n):
                # 反转 tour[i:j+1]
                d_old = (dist_matrix[tour[i-1]][tour[i]] + 
                         dist_matrix[tour[j]][tour[(j+1)%n]])
                d_new = (dist_matrix[tour[i-1]][tour[j]] + 
                         dist_matrix[tour[i]][tour[(j+1)%n]])
                if d_new < d_old:
                    tour[i:j+1] = reversed(tour[i:j+1])
                    improved = True
    return tour
# 每次反转一段 → 通常改善到最优的 5-10% 内

# ═══ MIP 精确求解 (Miller-Tucker-Zemlin) ═══

from scipy.optimize import milp, LinearConstraint, Bounds

# 适用于小规模 (n ≤ 30~50)
# 大规模: Concorde TSP Solver (专用!)
# → 已精确解决过 85,900 城市的 TSP!

# ═══ 各方法对比 ═══
#
# 方法          │ 复杂度        │ 质量     │ 规模上限
# ──────────────┼───────────────┼──────────┼────────
# 暴力枚举      │ O(n!)         │ 最优     │ n ≤ 15
# 分支定界      │ 指数 (实际快) │ 最优     │ n ≤ 100K
# DP (Held-Karp)│ O(2ⁿ·n²)     │ 最优     │ n ≤ 25
# 最近邻        │ O(n²)         │ ~1.2-1.5 │ 无限
# 2-opt         │ O(n²·iter)    │ ~1.05    │ n ≤ 10⁵
# LKH           │ 复杂          │ ~1.00x   │ n ≤ 10⁶
# OR-Tools      │ 多种          │ 好       │ n ≤ 10⁵

# Google OR-Tools:
# from ortools.constraint_solver import routing_enums_pb2
# from ortools.constraint_solver import pywrapcp
# → 工业级路径规划!

# ═══ AI 方法 ═══
#
# 1. 学习构造: 用指针网络 (Pointer Net) 直接生成路线
# 2. 学习改善: 用 RL 学习 2-opt 策略
# 3. 学习分支: 用 GNN 加速分支定界
# → 还不如 LKH, 但差距在缩小!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
