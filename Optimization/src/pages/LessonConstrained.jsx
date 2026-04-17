import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['KKT 条件', '罚函数法', 'SQP 与内点', '实战应用'];

export default function LessonConstrained() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🎯 module_03 — 约束优化</div>
      <div className="fs-hero">
        <h1>约束优化：KKT 条件 / 拉格朗日乘子 / SQP</h1>
        <p>
          现实中的优化问题几乎都有约束——资源限制、物理定律、安全边界。
          掌握从<strong>拉格朗日乘子</strong>到<strong>SQP</strong>的约束处理方法体系。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 约束优化深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 KKT 条件详解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> kkt.txt</div>
                <pre className="fs-code">{`═══ 拉格朗日乘子法 (等式约束) ═══

  min f(x)  s.t. h(x) = 0

  L(x, ν) = f(x) + νᵀh(x)

  最优性条件:
  ∇ₓL = ∇f + νᵀ∇h = 0   (梯度条件)
  h(x) = 0                (可行性)

  几何解释:
  在极值点, ∇f 与约束面的法向量 ∇h 平行!
  → ∇f = -ν·∇h

═══ KKT 条件 (不等式约束) ═══

  min f(x)
  s.t. gᵢ(x) ≤ 0  (m 个不等式)
       hⱼ(x) = 0  (p 个等式)

  KKT 条件 (必要条件):

  1. 稳定性 (Stationarity):
     ∇f(x*) + Σ μᵢ∇gᵢ(x*) + Σ νⱼ∇hⱼ(x*) = 0

  2. 原始可行 (Primal Feasibility):
     gᵢ(x*) ≤ 0,  hⱼ(x*) = 0

  3. 对偶可行 (Dual Feasibility):
     μᵢ ≥ 0

  4. 互补松弛 (Complementary Slackness):
     μᵢ · gᵢ(x*) = 0  ∀i

═══ 互补松弛的直觉 ═══

  对每个不等式约束:
  • gᵢ(x*) < 0 (不活跃/松弛): μᵢ = 0
    → 约束不起作用, 乘子为零
  
  • gᵢ(x*) = 0 (活跃/紧): μᵢ ≥ 0
    → 约束起作用, 乘子非负
    → μᵢ = 约束的"影子价格"

  → 只有活跃约束影响最优解!

═══ 约束品质 (LICQ 等) ═══

  KKT 是必要条件需要约束品质:
  
  LICQ (线性无关约束品质):
  活跃约束的梯度线性无关
  
  不满足 LICQ 时:
  • KKT 可能没有解
  • 乘子可能不唯一
  → 实际中大多满足, 但需要关注退化情况

═══ 二阶充分条件 ═══

  KKT 点 x* 是局部最小的充分条件:
  
  dᵀ ∇²ₓₓL(x*, μ*, ν*) d > 0
  
  ∀ d ≠ 0 在活跃约束的切空间中:
  ∇gᵢ(x*)ᵀd = 0 (活跃约束)
  ∇hⱼ(x*)ᵀd = 0 (等式约束)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔨 罚函数与增广拉格朗日</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> penalty.py</div>
                <pre className="fs-code">{`# ═══ 罚函数法 (Penalty Method) ═══
#
# 思想: 将约束违反加到目标函数中
#
# min f(x) + ρ/2 · Σ max(0, gᵢ(x))²  (不等式)
#            + ρ/2 · Σ hⱼ(x)²          (等式)
#
# ρ → ∞ 时逼近约束优化

import numpy as np
from scipy.optimize import minimize

def penalty_method(f, g_ineq, h_eq, x0, rho_0=1, rho_max=1e6):
    rho = rho_0
    x = x0.copy()
    
    while rho < rho_max:
        def penalized(x):
            obj = f(x)
            for gi in g_ineq:
                obj += rho/2 * max(0, gi(x))**2
            for hj in h_eq:
                obj += rho/2 * hj(x)**2
            return obj
        
        result = minimize(penalized, x, method='L-BFGS-B')
        x = result.x
        rho *= 10  # 增大罚参数
    
    return x

# 问题: ρ → ∞ 导致 Hessian 条件数 → ∞ → 数值不稳定!

# ═══ 增广拉格朗日法 (ALM / ADMM) ═══
#
# L_ρ(x, λ) = f(x) + λᵀh(x) + ρ/2 ‖h(x)‖²
#
# 同时更新 x 和 λ:
# xₖ₊₁ = argmin_x L_ρ(x, λₖ)     (最小化步)
# λₖ₊₁ = λₖ + ρ · h(xₖ₊₁)        (乘子更新)
#
# 优势: ρ 不需要 → ∞! 更稳定!

def augmented_lagrangian(f, h_eq, grad_f, grad_h, x0, 
                          rho=1.0, max_outer=50, max_inner=100):
    x = x0.copy()
    lam = np.zeros(len(h_eq(x0)))
    
    for k in range(max_outer):
        # 内循环: 固定 λ, 最小化增广拉格朗日
        def aug_lag(x):
            h = h_eq(x)
            return f(x) + lam @ h + rho/2 * np.sum(h**2)
        
        result = minimize(aug_lag, x, method='L-BFGS-B')
        x = result.x
        
        # 更新乘子
        h = h_eq(x)
        lam = lam + rho * h
        
        # 检查收敛
        if np.linalg.norm(h) < 1e-8:
            return x, lam
    
    return x, lam

# ═══ ADMM (Alternating Direction Method of Multipliers) ═══
#
# min f(x) + g(z)  s.t. Ax + Bz = c
#
# x-step: min_x f(x) + ρ/2 ‖Ax+Bz-c+u‖²
# z-step: min_z g(z) + ρ/2 ‖Ax+Bz-c+u‖²
# u-step: u = u + Ax + Bz - c
#
# 应用: 分布式优化, LASSO, 矩阵补全, 共识优化`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ SQP 与内点法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> sqp_interior.txt</div>
                <pre className="fs-code">{`═══ SQP (Sequential Quadratic Programming) ═══

  思想: 在每步解一个 QP 子问题 (牛顿法的约束版!)

  子问题:
  min  ∇fᵀd + ½dᵀBd        (二次近似)
  s.t. ∇gᵢᵀd + gᵢ ≤ 0     (线性化约束)
       ∇hⱼᵀd + hⱼ = 0

  B: Hessian 的近似 (BFGS 更新)
  d: 搜索方向
  xₖ₊₁ = xₖ + αₖd (加线搜索)

  特点:
  • 超线性收敛 (接近牛顿法!)
  • 处理一般非线性约束
  • 工业级方法 (SNOPT, IPOPT)

═══ 内点法 (Interior Point / Barrier) ═══

  min f(x) s.t. gᵢ(x) ≤ 0

  → min f(x) - (1/t) Σ log(-gᵢ(x))

  log barrier: -log(-gᵢ) 在 gᵢ=0 处 → +∞
  → 自动将迭代保持在可行域内部!

  中心路径: 随 t → ∞, 解沿着中心路径逼近最优!

  算法:
  1. 给定初始 t₀ 和可行点 x₀
  2. Centering step: 用牛顿法解 barrier 问题
  3. 增大 t: t = μ·t (μ ≈ 10~20)
  4. 重复直到 m/t < ε (对偶间隙!)

  复杂度: O(√m) 个牛顿步 即可!
  (m = 约束数, 与维度 n 无关!)

═══ scipy.optimize.minimize 约束接口 ═══

  from scipy.optimize import minimize

  # 等式约束
  eq_con = {'type': 'eq', 'fun': lambda x: h(x)}
  
  # 不等式约束 (gᵢ(x) ≥ 0 的约定!)
  ineq_con = {'type': 'ineq', 'fun': lambda x: -g(x)}
  
  result = minimize(
      fun=objective,
      x0=x_init,
      method='SLSQP',   # SQP 的一种
      constraints=[eq_con, ineq_con],
      bounds=[(0, None)] * n  # 变量下界
  )

═══ 方法对比 ═══

  方法       │ 约束类型    │ 收敛   │ 规模
  ───────────┼─────────────┼────────┼──────
  罚函数     │ 一般        │ 慢     │ 大
  ALM/ADMM   │ 等式/凸     │ 较快   │ 大
  SQP        │ 一般非线性  │ 快     │ 中
  内点法     │ 一般凸      │ 快     │ 大
  活动集     │ QP          │ 快     │ 小-中`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌍 实战应用</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> applications.txt</div>
                <pre className="fs-code">{`═══ 1. 模型压缩 (约束训练) ═══

  min  L(w)         (训练损失)
  s.t. ‖w‖₀ ≤ k    (稀疏约束: 至多 k 个非零)

  NP-hard! 松弛:
  → ‖w‖₁ ≤ τ  (L1 凸松弛 → LASSO)
  → |w| < ε → w = 0 (剪枝)

═══ 2. 物理约束 ML (Physics-Informed) ═══

  min  ‖prediction - data‖²
  s.t. PDE residual ≤ ε  (物理定律!)

  → 增广拉格朗日:
  L = ‖pred - data‖² + λᵀr + ρ/2 ‖r‖²
  r = PDE residual

═══ 3. 公平性约束 (AI Ethics) ═══

  min  Classification Error
  s.t. |P(ŷ=1|A=0) - P(ŷ=1|A=1)| ≤ ε
  
  A = 敏感属性 (性别/种族)
  → 约束优化保证公平性!

═══ 4. 最优控制 ═══

  min  ∫₀ᵀ [xᵀQx + uᵀRu] dt
  s.t. ẋ = Ax + Bu        (动力学)
       u_min ≤ u ≤ u_max  (输入约束)
       x ∈ X              (状态约束)

  → MPC (模型预测控制): 每步解一个 QP!
  → 自动驾驶, 机器人的核心!

═══ 5. 投资组合优化 ═══

  min  wᵀΣw              (风险)
  s.t. wᵀμ ≥ r_target    (目标收益)
       Σwᵢ = 1           (全投资)
       wᵢ ≥ 0            (不做空)
       wᵢ ≤ 0.4          (分散化)

  → QP 问题 → 内点法/活动集秒解!

═══ 求解器生态 ═══

  开源:
  • IPOPT: 大规模非线性 (内点法)
  • OSQP: 大规模 QP (ADMM)
  • SCS: 大规模凸 (一阶方法)
  • Pyomo: 建模语言

  商业:
  • Gurobi: LP/QP/MIP 工业标准
  • CPLEX: IBM, LP/QP/MIP
  • MOSEK: LP/QP/SOCP/SDP
  • KNITRO: 非线性优化

  Python 接口:
  • cvxpy: 凸优化建模 (最推荐!)
  • scipy.optimize: 通用优化
  • pyomo: 工业级建模`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
