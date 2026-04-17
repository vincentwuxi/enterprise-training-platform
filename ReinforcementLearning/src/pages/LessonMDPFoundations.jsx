import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['MDP 框架', '贝尔曼方程', '动态规划', '蒙特卡洛'];

export default function LessonMDPFoundations() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🎮 module_01 — 强化学习基础</div>
      <div className="fs-hero">
        <h1>强化学习基础：MDP / 贝尔曼方程 / 动态规划</h1>
        <p>
          强化学习的一切始于<strong>马尔可夫决策过程 (MDP)</strong>。
          本模块从 Agent-Environment 交互范式出发，推导贝尔曼方程的数学本质，
          理解策略评估与策略改进的迭代循环，掌握值迭代与策略迭代的动态规划算法。
          <strong>这是理解所有现代 RL 算法的数学基石</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧠 强化学习基础</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📐 马尔可夫决策过程 (MDP)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> mdp_framework</div>
              <pre className="fs-code">{`# 强化学习: Agent 在环境中通过试错学习最优策略

# ═══ Agent-Environment 交互循环 ═══
#
#    Agent (智能体)
#    ┌──────────────────┐
#    │  观察 s_t        │ ←── 状态 (State)
#    │  选择 a_t        │ ──→ 动作 (Action)
#    │  获得 r_t        │ ←── 奖励 (Reward)
#    │  转移到 s_{t+1}  │ ←── 下一状态
#    └──────────────────┘
#           ↕
#    Environment (环境)
#
# 目标: 最大化累积奖励 — 不是贪心, 而是长期最优!

# ═══ MDP 五元组 (S, A, P, R, γ) ═══
# S: 状态空间 (有限/连续)
# A: 动作空间 (离散/连续)
# P: 转移概率 P(s'|s,a) — 环境动力学
# R: 奖励函数 R(s,a,s') — 即时反馈
# γ: 折扣因子 (0 ≤ γ < 1) — 未来奖励衰减

# ═══ 核心概念 ═══

# 1. 策略 (Policy): π(a|s)
#    确定性: a = π(s)
#    随机性: π(a|s) = P(A=a | S=s)
#    → 目标: 找到最优策略 π*

# 2. 累积回报 (Return):
#    G_t = r_t + γ·r_{t+1} + γ²·r_{t+2} + ...
#    γ=0: 只看眼前 (短视)
#    γ=0.99: 重视未来 (远见)

# 3. 状态价值函数 V^π(s):
#    V^π(s) = E_π[G_t | S_t = s]
#    "从状态 s 出发, 遵循策略 π, 期望能获得多少回报"

# 4. 动作价值函数 Q^π(s,a):
#    Q^π(s,a) = E_π[G_t | S_t = s, A_t = a]
#    "在状态 s 采取动作 a, 之后遵循 π, 期望回报"

# ═══ MDP 的马尔可夫性质 ═══
# P(s_{t+1} | s_t, a_t, s_{t-1}, ..., s_0) = P(s_{t+1} | s_t, a_t)
# → 未来只依赖当前状态, 不依赖历史!
# → 极大简化了问题 (但现实中经常不满足)

# ═══ RL vs 监督学习 vs 无监督学习 ═══
# ┌──────────┬──────────────┬──────────────┬──────────────┐
# │          │ 监督学习      │ 无监督学习    │ 强化学习      │
# ├──────────┼──────────────┼──────────────┼──────────────┤
# │ 反馈     │ 标签 (正确答案)│ 无反馈       │ 奖励 (延迟)   │
# │ 数据     │ 固定数据集    │ 固定数据集    │ 交互产生      │
# │ 目标     │ 最小化损失    │ 发现结构     │ 最大化回报    │
# │ 挑战     │ 泛化          │ 评估难       │ 探索 vs 利用  │
# └──────────┴──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ 贝尔曼方程 (Bellman Equation)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> bellman_equation</div>
              <pre className="fs-code">{`# 贝尔曼方程: 强化学习的数学核心

# ═══ 贝尔曼期望方程 ═══
# 将价值函数分解为 "即时奖励 + 未来价值"
#
# V^π(s) = Σ_a π(a|s) · Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·V^π(s')]
#
# 直觉: 当前状态的价值 = 
#   E[这一步的奖励 + γ × 下一步的价值]

# Q 函数版本:
# Q^π(s,a) = Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·Σ_{a'} π(a'|s')·Q^π(s',a')]

# ═══ 贝尔曼最优方程 ═══
# V*(s) = max_a Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·V*(s')]
# Q*(s,a) = Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·max_{a'} Q*(s',a')]
#
# 最优策略: π*(s) = argmax_a Q*(s,a)
# → 如果知道 Q*, 直接贪心选择最大 Q 值的动作!

# ═══ 数值例子: 网格世界 ═══
import numpy as np

# 4x4 网格, 目标在右下角
# 状态: 0-15, 动作: 上下左右
grid_size = 4
n_states = grid_size * grid_size
gamma = 0.9

# 策略评估: 迭代计算 V^π
V = np.zeros(n_states)
for iteration in range(100):
    V_new = np.zeros(n_states)
    for s in range(n_states):
        if s == 15:  # 终止状态
            V_new[s] = 0
            continue
        # 随机策略: 等概率选择四个方向
        for a in range(4):  # 上下左右
            s_next = get_next_state(s, a)
            reward = -1  # 每步 -1, 鼓励尽快到达
            V_new[s] += 0.25 * (reward + gamma * V[s_next])
    V = V_new

# 收敛后 V 的值 (随机策略下):
# ┌──────┬──────┬──────┬──────┐
# │ -6.1 │ -4.3 │ -2.9 │ -1.7 │
# │ -4.3 │ -3.2 │ -2.0 │ -1.0 │
# │ -2.9 │ -2.0 │ -1.0 │ -0.3 │
# │ -1.7 │ -1.0 │ -0.3 │  0.0 │ ← 目标
# └──────┴──────┴──────┴──────┘
# → 越靠近目标, 价值越高 (奖励的负值越小)

# ═══ V 和 Q 的关系 ═══
# V^π(s) = Σ_a π(a|s) · Q^π(s,a)
# → V 是 Q 在策略下的期望
# Q^π(s,a) = R(s,a) + γ · Σ_{s'} P(s'|s,a) · V^π(s')
# → Q 是即时奖励加上后续 V 的期望`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 动态规划 (Dynamic Programming)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> dynamic_programming</div>
              <pre className="fs-code">{`# 动态规划: 已知 MDP 模型时的精确解法

# ═══ 前提: 需要完整的 MDP 模型 ═══
# 知道 P(s'|s,a) 和 R(s,a,s')
# 现实中通常不知道 → Model-Free 方法

# ═══ 1. 策略评估 (Policy Evaluation) ═══
# 给定策略 π, 计算其价值函数 V^π
# 反复应用贝尔曼期望方程直到收敛
def policy_evaluation(policy, P, R, gamma=0.99, theta=1e-6):
    V = np.zeros(n_states)
    while True:
        delta = 0
        for s in range(n_states):
            v = V[s]
            V[s] = sum(
                policy[s][a] * sum(
                    P[s][a][s1] * (R[s][a][s1] + gamma * V[s1])
                    for s1 in range(n_states)
                ) for a in range(n_actions)
            )
            delta = max(delta, abs(v - V[s]))
        if delta < theta:
            break
    return V

# ═══ 2. 策略改进 (Policy Improvement) ═══
# 用 V^π 贪心地构造更好的策略
# π'(s) = argmax_a Q^π(s,a)
#        = argmax_a Σ_{s'} P(s'|s,a)[R + γV^π(s')]
def policy_improvement(V, P, R, gamma=0.99):
    new_policy = {}
    for s in range(n_states):
        q_values = []
        for a in range(n_actions):
            q = sum(P[s][a][s1] * (R[s][a][s1] + gamma * V[s1])
                    for s1 in range(n_states))
            q_values.append(q)
        new_policy[s] = np.argmax(q_values)
    return new_policy

# ═══ 3. 策略迭代 (Policy Iteration) ═══
# 交替: 评估 → 改进 → 评估 → 改进 → ...
# 保证收敛到最优策略!
# 缺点: 每次评估需要完整收敛 (慢)

# ═══ 4. 值迭代 (Value Iteration) ═══
# 直接优化 V*, 不需要显式策略
# V(s) ← max_a Σ_{s'} P(s'|s,a)[R + γV(s')]
def value_iteration(P, R, gamma=0.99, theta=1e-6):
    V = np.zeros(n_states)
    while True:
        delta = 0
        for s in range(n_states):
            v = V[s]
            V[s] = max(
                sum(P[s][a][s1] * (R[s][a][s1] + gamma * V[s1])
                    for s1 in range(n_states))
                for a in range(n_actions)
            )
            delta = max(delta, abs(v - V[s]))
        if delta < theta:
            break
    return V

# ═══ 策略迭代 vs 值迭代 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │              │ 策略迭代      │ 值迭代       │
# ├──────────────┼──────────────┼──────────────┤
# │ 每步操作     │ 评估+改进     │ 只更新 V     │
# │ 收敛速度     │ 迭代次数少   │ 迭代次数多   │
# │ 每步开销     │ 评估收敛慢   │ 每步 O(|S||A|)│
# │ 总效率      │ 大问题优     │ 小问题优     │
# └──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎲 蒙特卡洛方法</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> monte_carlo</div>
              <pre className="fs-code">{`# 蒙特卡洛方法: 从经验中学习 (Model-Free!)

# ═══ 核心思想 ═══
# 不需要知道 P(s'|s,a)!
# 通过采样完整 episode, 用平均回报估计价值

# ═══ MC 策略评估 ═══
# 1. 遵循策略 π 生成 episode:
#    s_0, a_0, r_0, s_1, a_1, r_1, ..., s_T
# 2. 计算每个状态的回报 G_t = Σ γ^k r_{t+k}
# 3. V(s) ← average(所有访问 s 时的 G_t)

def mc_policy_evaluation(env, policy, n_episodes=10000, gamma=0.99):
    returns = {s: [] for s in range(n_states)}
    
    for _ in range(n_episodes):
        episode = generate_episode(env, policy)
        G = 0
        # 反向遍历 episode
        for t in range(len(episode)-1, -1, -1):
            s, a, r = episode[t]
            G = r + gamma * G
            returns[s].append(G)
    
    V = {s: np.mean(returns[s]) for s in returns if returns[s]}
    return V

# ═══ First-Visit vs Every-Visit ═══
# First-Visit MC:  每个 episode 只统计第一次访问 s 的回报
# Every-Visit MC: 统计 episode 中所有访问 s 的回报
# 两者都收敛, Every-Visit 偏差更小

# ═══ MC 控制 (寻找最优策略) ═══
# MC + ε-贪心策略改进:
# π(a|s) = 1-ε+ε/|A|   if a = argmax Q(s,a)
#         = ε/|A|        otherwise
# ε 保证探索: 以 ε 概率随机探索

# ═══ 探索 vs 利用 (Exploration vs Exploitation) ═══
# 强化学习的核心难题:
# 利用: 选择当前最优动作 (greedy)
# 探索: 尝试未知动作, 可能发现更优
exploration_methods = {
    "ε-Greedy":       "以 ε 概率随机, 1-ε 贪心",
    "ε-Decay":        "随时间减小 ε (先探索后利用)",
    "Softmax/Boltzmann": "按 Q 值的概率分布选择",
    "UCB":            "Upper Confidence Bound",
    "Thompson":       "贝叶斯后验采样",
    "Curiosity":      "内在奖励驱动探索 (ICM)",
}

# ═══ MC 的局限 ═══
# 1. 需要完整 episode (不能在线学习)
# 2. 高方差 (每次采样差异大)
# 3. 只适用于 episodic 任务
# → TD 方法解决这些问题!`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
