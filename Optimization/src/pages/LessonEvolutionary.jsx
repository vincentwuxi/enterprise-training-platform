import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['遗传算法', '粒子群优化', '贝叶斯优化', '多目标优化'];

export default function LessonEvolutionary() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🎯 module_07 — 进化算法</div>
      <div className="fs-hero">
        <h1>进化算法：遗传算法 / 粒子群 / 贝叶斯优化</h1>
        <p>
          当目标函数是<strong>黑盒</strong>——没有梯度、不可微、甚至不连续时，
          进化算法从<strong>自然选择</strong>汲取灵感，而贝叶斯优化用<strong>代理模型</strong>
          智能地探索，成为超参数调优和工程设计的利器。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 进化算法深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧬 遗传算法 (GA)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> genetic_algorithm.py</div>
                <pre className="fs-code">{`# ═══ 遗传算法框架 ═══
#
# 灵感: 达尔文进化论!
# 种群 → 选择 → 交叉 → 变异 → 新种群 → 重复

import numpy as np

def genetic_algorithm(fitness_fn, n_genes, pop_size=100, 
                       n_gen=200, mutation_rate=0.01):
    # 初始化种群 (随机二进制编码)
    population = np.random.randint(0, 2, (pop_size, n_genes))
    
    for gen in range(n_gen):
        # 1. 适应度评估
        fitness = np.array([fitness_fn(ind) for ind in population])
        
        # 2. 选择 (锦标赛选择)
        parents = []
        for _ in range(pop_size):
            i, j = np.random.choice(pop_size, 2, replace=False)
            parents.append(population[i] if fitness[i] > fitness[j] 
                          else population[j])
        parents = np.array(parents)
        
        # 3. 交叉 (单点交叉)
        children = []
        for i in range(0, pop_size, 2):
            p1, p2 = parents[i], parents[min(i+1, pop_size-1)]
            point = np.random.randint(1, n_genes)
            c1 = np.concatenate([p1[:point], p2[point:]])
            c2 = np.concatenate([p2[:point], p1[point:]])
            children.extend([c1, c2])
        
        # 4. 变异 (位翻转)
        population = np.array(children[:pop_size])
        mask = np.random.random(population.shape) < mutation_rate
        population = np.where(mask, 1 - population, population)
        
        # 精英保留: 保留最好的个体
        best_idx = np.argmax(fitness)
        population[0] = parents[best_idx]
    
    fitness = np.array([fitness_fn(ind) for ind in population])
    return population[np.argmax(fitness)]

# ═══ 编码方式 ═══
#
# 二进制编码: 0/1 串 → 整数/离散优化
# 实数编码:   浮点数组 → 连续优化
# 排列编码:   排列 → TSP/调度
# 树编码:     语法树 → 遗传编程

# ═══ 选择算子 ═══
#
# 轮盘赌: P(i) = fᵢ/Σf → 适应度高的概率大
# 锦标赛: 随机选 k 个, 取最好 → 简单有效!
# 排名:   根据排名分配概率 → 不受适应度尺度影响

# ═══ 交叉算子 ═══
#
# 单点交叉: 一个切点, 交换尾部
# 两点交叉: 两个切点, 交换中间段
# 均匀交叉: 每位 50% 概率来自父/母
# 实数: SBX (模拟二进制交叉)
# 排列: PMX, OX, CX (保持有效排列!)

# ═══ 变异算子 ═══
#
# 位翻转: 0↔1 (二进制)
# 高斯扰动: x += N(0,σ) (实数)
# 交换: swap(i,j) (排列)
#
# 变异率通常: 1/n (n = 基因长度)

# ═══ CMA-ES (协方差矩阵自适应进化策略) ═══
#
# 实数优化最强的进化算法!
# → 自动学习搜索方向 (协方差矩阵)
# → 无需梯度, 旋转不变
# → 复杂度 O(n²) 每代 (n: 维度)
# → import cma; cma.fmin(f, x0, sigma0)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐦 粒子群优化 (PSO)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> pso.py</div>
                <pre className="fs-code">{`# ═══ PSO (Particle Swarm Optimization) ═══
#
# 灵感: 鸟群觅食!
# 每个粒子记住:
# → 个体最优 (personal best)
# → 群体最优 (global best)

import numpy as np

def pso(f, dim, n_particles=50, n_iter=200, 
        bounds=(-5, 5), w=0.7, c1=1.5, c2=1.5):
    # 初始化
    lo, hi = bounds
    pos = np.random.uniform(lo, hi, (n_particles, dim))
    vel = np.random.uniform(-1, 1, (n_particles, dim))
    
    # 个体最优和群体最优
    p_best = pos.copy()
    p_best_val = np.array([f(p) for p in pos])
    g_best = p_best[np.argmin(p_best_val)]
    g_best_val = np.min(p_best_val)
    
    for _ in range(n_iter):
        # 更新速度
        r1 = np.random.random((n_particles, dim))
        r2 = np.random.random((n_particles, dim))
        vel = (w * vel                         # 惯性
             + c1 * r1 * (p_best - pos)        # 个体认知
             + c2 * r2 * (g_best - pos))       # 社会学习
        
        # 更新位置
        pos = pos + vel
        pos = np.clip(pos, lo, hi)
        
        # 更新最优
        vals = np.array([f(p) for p in pos])
        improved = vals < p_best_val
        p_best[improved] = pos[improved]
        p_best_val[improved] = vals[improved]
        
        if np.min(vals) < g_best_val:
            g_best = pos[np.argmin(vals)]
            g_best_val = np.min(vals)
    
    return g_best, g_best_val

# ═══ PSO 参数 ═══
#
# w (惯性权重):
#   大 w → 全局探索 (速度快)
#   小 w → 局部开发 (精细搜索)
#   通常: w 从 0.9 衰减到 0.4
#
# c1 (认知系数): 个人经验的影响
# c2 (社会系数): 群体经验的影响
# 通常: c1 = c2 = 2.0

# ═══ 差分进化 (DE) ═══
#
# 另一种强力的实数优化方法!
#
# 变异: v = x_r1 + F*(x_r2 - x_r3)
# 交叉: 与目标向量混合 (CR 概率)
# 选择: 贪心 — 更好就替换!
#
# 参数: F ∈ [0.5, 1], CR ∈ [0.7, 1]
# 优势: 只有 2 个参数, 鲁棒!

from scipy.optimize import differential_evolution

result = differential_evolution(
    func=objective,
    bounds=[(-5, 5)] * n_dim,
    maxiter=1000,
    seed=42
)

# ═══ 群体智能对比 ═══
#
# 算法   │ 灵感      │ 优势         │ 劣势
# ───────┼───────────┼──────────────┼──────
# GA     │ 生物进化  │ 通用, 离散好 │ 参数多
# PSO    │ 鸟群      │ 简单, 连续好 │ 易早熟
# DE     │ 差分变异  │ 鲁棒, 少参数 │ 慢
# CMA-ES │ 协方差    │ 连续最强     │ O(n²)
# ACO    │ 蚁群      │ 路径问题好   │ 组合限`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 贝叶斯优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> bayesian_opt.py</div>
                <pre className="fs-code">{`# ═══ 贝叶斯优化 (BO) ═══
#
# 适用: 目标函数评估非常昂贵!
# 例如: 训练一个神经网络 = 几小时/几天
# → 不能像 GA/PSO 那样评估上万次!
# → BO: 用最少的评估找到最优!

# ═══ BO 框架 ═══
#
# 1. 代理模型 (Surrogate): 用简单模型拟合已有观测
#    → 高斯过程 (GP): 给出预测 + 不确定性!
#
# 2. 采集函数 (Acquisition): 决定下一步在哪里采样
#    → 平衡 探索 (不确定的区域) vs 开发 (预测好的区域)
#
# 3. 观测 → 更新代理 → 重复

# ═══ 高斯过程 (GP) 回顾 ═══
#
# f(x) ~ GP(μ(x), k(x,x'))
#
# 已知 n 个点后:
# μ_post(x) = k(x,X) K⁻¹ y        (后验均值)
# σ²_post(x) = k(x,x) - k(x,X) K⁻¹ k(X,x) (后验方差)
#
# → 有预测, 也有不确定性 → 完美的代理模型!

# ═══ 采集函数 ═══
#
# 1. EI (Expected Improvement):
#    EI(x) = E[max(f(x) - f_best, 0)]
#    → 最常用! 平衡探索与开发
#
# 2. UCB (Upper Confidence Bound):
#    UCB(x) = μ(x) + κ·σ(x)
#    → κ 大: 更探索, κ 小: 更开发
#
# 3. PI (Probability of Improvement):
#    PI(x) = P(f(x) > f_best + ε)
#    → 贪心, 可能过早停止

# ═══ 实战: 超参数调优 ═══

# pip install optuna
import optuna

def objective(trial):
    # 定义超参数搜索空间
    lr = trial.suggest_float('lr', 1e-5, 1e-1, log=True)
    n_layers = trial.suggest_int('n_layers', 1, 5)
    hidden_size = trial.suggest_categorical('hidden', [64, 128, 256])
    dropout = trial.suggest_float('dropout', 0.1, 0.5)
    
    # 训练模型并返回验证精度
    model = build_model(lr, n_layers, hidden_size, dropout)
    accuracy = train_and_evaluate(model)
    
    return accuracy

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)

print(study.best_params)    # 最优超参数!
print(study.best_value)     # 最优精度!

# ═══ BO 工具对比 ═══
#
# 工具      │ 特点           │ 适用
# ──────────┼────────────────┼──────
# Optuna    │ 简单, 剪枝!    │ 超参数
# Ray Tune  │ 分布式, 多策略 │ 大规模
# BoTorch   │ PyTorch 原生   │ 研究
# Hyperopt  │ TPE 算法       │ 通用
# Ax        │ Meta, 多目标   │ 工业
# W&B Sweeps│ 可视化好       │ 实验

# ═══ 何时用什么 ═══
#
# 评估次数   │ 维度  │ 推荐
# ───────────┼───────┼──────
# < 100      │ < 20  │ 贝叶斯优化 (BO)
# 100-10000  │ < 100 │ CMA-ES / DE
# > 10000    │ 任意  │ 随机搜索 + 网格
# 组合/离散  │ -     │ GA / 模拟退火`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 多目标优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> multi_objective.txt</div>
                <pre className="fs-code">{`═══ 多目标优化 ═══

  min [f₁(x), f₂(x), ..., fₘ(x)]

  多个目标通常冲突!
  → 没有同时最优的单一解
  → 而是一组折中解 (Pareto 前沿)

═══ Pareto 最优 ═══

  解 x 支配 y (x ≻ y):
  fᵢ(x) ≤ fᵢ(y) ∀i 且 ∃j: fⱼ(x) < fⱼ(y)

  Pareto 最优解: 不被任何其他解支配!
  Pareto 前沿: 所有 Pareto 最优解在目标空间的图像

  例: 模型设计
  目标 1: 最大化精度
  目标 2: 最小化计算量
  → Pareto: 一系列精度-效率的折中!

═══ NSGA-II (Non-dominated Sorting GA) ═══

  最流行的多目标进化算法!

  1. 非支配排序:
     → 第 1 层: 不被任何解支配的
     → 第 2 层: 只被第 1 层支配的
     → ...

  2. 拥挤度距离:
     → 同一层中, 更分散的优先
     → 维持 Pareto 前沿的多样性!

  3. 选择 + 交叉 + 变异 (同 GA)

  import pymoo
  from pymoo.algorithms.moo.nsga2 import NSGA2
  from pymoo.optimize import minimize

═══ 加权法 vs 进化法 ═══

  1. 加权求和:
     min Σ wᵢfᵢ(x)
     → 简单, 但不能找到非凸 Pareto 前沿!
     → 需要跑多次 (不同 w)

  2. ε-约束:
     min f₁(x)  s.t. fⱼ(x) ≤ εⱼ
     → 能找到所有 Pareto 解
     → 但需要选择 ε

  3. 进化法 (NSGA-II/MOEA/D):
     → 一次运行找到整个 Pareto 前沿!
     → 适合黑盒问题

═══ AI 中的多目标 ═══

  1. NAS (神经架构搜索):
     精度 vs 延迟 vs 参数量
     → NSGA-II 找 Pareto 架构!

  2. 模型压缩:
     精度 vs 大小 → 不同需求选不同点

  3. 联邦学习:
     全局性能 vs 公平性 vs 隐私

  4. 强化学习:
     奖励 vs 安全 vs 效率

═══ 课程总结: 优化方法选择决策树 ═══

  问题类型             → 推荐方法
  ─────────────────────────────────
  凸 + 中小规模        → 内点法/SQP
  凸 + 大稀疏          → ADMM/一阶方法
  LP                   → 单纯形/内点
  QP                   → OSQP/Gurobi
  整数规划             → 分支定界/Gurobi
  连续 + 梯度可得      → L-BFGS / AdamW
  连续无梯度 + 低维    → 贝叶斯优化
  连续无梯度 + 高维    → CMA-ES / DE
  组合/离散            → GA / 模拟退火
  超参数调优           → Optuna / BO
  多目标               → NSGA-II`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
