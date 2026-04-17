import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['TD 学习', 'Q-Learning', 'DQN 革命', 'Rainbow DQN'];

export default function LessonValueBased() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">📊 module_02 — 值函数方法</div>
      <div className="fs-hero">
        <h1>值函数方法：Q-Learning / DQN / Rainbow — 从表格到深度网络</h1>
        <p>
          从 TD 学习的 bootstrapping 思想出发，推导 <strong>Q-Learning</strong> 的
          off-policy 更新规则，理解 DeepMind 的 <strong>DQN</strong> 如何用经验回放和
          目标网络让深度 RL 首次成功，掌握 <strong>Rainbow DQN</strong> 的六大改进技巧。
          <strong>Atari 游戏是 Deep RL 的试金石</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 值函数方法</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 时序差分学习 (TD Learning)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> td_learning</div>
              <pre className="fs-code">{`# TD Learning: 结合 MC 和 DP 的优势

# ═══ 核心思想: Bootstrapping ═══
# MC: 等完整 episode 结束, 用真实 G_t 更新
# TD: 每步就更新, 用估计值代替真实回报!
#
# TD 目标: r + γ·V(s')  (即时奖励 + 估计的未来)
# TD 误差: δ = r + γ·V(s') - V(s)
# 更新:    V(s) ← V(s) + α·δ

def td_0(env, policy, alpha=0.01, gamma=0.99, n_episodes=10000):
    V = np.zeros(n_states)
    for _ in range(n_episodes):
        s = env.reset()
        while True:
            a = policy(s)
            s_next, r, done = env.step(a)
            # TD(0) 更新 — 每一步都学习!
            td_error = r + gamma * V[s_next] * (1 - done) - V[s]
            V[s] += alpha * td_error
            s = s_next
            if done:
                break
    return V

# ═══ MC vs TD 对比 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │              │ MC            │ TD(0)        │
# ├──────────────┼──────────────┼──────────────┤
# │ 更新时机     │ episode 结束 │ 每步          │
# │ 偏差         │ 无偏         │ 有偏 (bootstrapping)│
# │ 方差         │ 高           │ 低            │
# │ 马尔可夫假设 │ 不依赖       │ 依赖          │
# │ 在线学习     │ ❌           │ ✅            │
# │ 持续任务     │ ❌           │ ✅            │
# └──────────────┴──────────────┴──────────────┘

# ═══ SARSA: On-Policy TD 控制 ═══
# S → A → R → S' → A' (State-Action-Reward-State-Action)
# Q(s,a) ← Q(s,a) + α·[r + γ·Q(s',a') - Q(s,a)]
# a' 是用当前策略选的 → On-Policy (保守)
# → 学到的策略考虑了探索的影响

# ═══ TD(n) 和 TD(λ) ═══
# TD(0): 只看一步  — r + γV(s')
# TD(n): 看 n 步   — r₀ + γr₁ + ... + γⁿV(s_{t+n})
# TD(λ): 所有步的加权平均 (eligibility traces)
# λ=0 → TD(0), λ=1 → MC`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎯 Q-Learning: Off-Policy 突破</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> q_learning</div>
              <pre className="fs-code">{`# Q-Learning (Watkins, 1989): Off-Policy TD 控制

# ═══ 核心更新规则 ═══
# Q(s,a) ← Q(s,a) + α·[r + γ·max_{a'} Q(s',a') - Q(s,a)]
#                           ^^^^^^^^^^^^^^^^
#                           关键区别: 用 max 而不是当前策略!
#
# → 学习最优 Q*, 无论行为策略是什么!
# → 行为策略可以是 ε-greedy (探索)
# → 目标策略是 greedy (最优)

import numpy as np

def q_learning(env, alpha=0.1, gamma=0.99, epsilon=0.1, n_episodes=10000):
    Q = np.zeros((n_states, n_actions))
    
    for episode in range(n_episodes):
        s = env.reset()
        while True:
            # ε-Greedy 行为策略 (Off-Policy!)
            if np.random.random() < epsilon:
                a = np.random.randint(n_actions)  # 探索
            else:
                a = np.argmax(Q[s])               # 利用
            
            s_next, r, done = env.step(a)
            
            # Q-Learning 更新 (用 max!)
            td_target = r + gamma * np.max(Q[s_next]) * (1 - done)
            td_error = td_target - Q[s, a]
            Q[s, a] += alpha * td_error
            
            s = s_next
            if done:
                break
    
    # 最优策略: π*(s) = argmax_a Q(s,a)
    policy = np.argmax(Q, axis=1)
    return Q, policy

# ═══ SARSA vs Q-Learning ═══
# SARSA (On-Policy):
#   Q(s,a) ← Q(s,a) + α[r + γ·Q(s',a') - Q(s,a)]
#   a' 来自当前策略 → 安全但保守
#
# Q-Learning (Off-Policy):
#   Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',·) - Q(s,a)]
#   用 max → 直接学最优, 但可能过于乐观
#
# 悬崖漫步 (Cliff Walking) 例子:
# SARSA: 走远离悬崖的安全路线
# Q-Learning: 走悬崖边的最短路 (可能掉下去)

# ═══ 表格 Q-Learning 的局限 ═══
# 状态空间太大时 Q 表格放不下:
# - 围棋: 10^170 种状态
# - Atari: 210×160×3 = 100,800 像素
# - 机器人: 连续状态空间
# → 需要函数逼近: Q(s,a;θ) ≈ Q*(s,a)
# → 这就是 DQN 的动机!`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎮 DQN: 深度 Q 网络</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> dqn</div>
              <pre className="fs-code">{`# DQN (DeepMind, 2013/2015): Deep RL 的起点
# "Human-level control through deep reinforcement learning"

# ═══ 核心挑战: 为什么之前 DL+RL 不行? ═══
# 1. 数据非独立: 连续帧高度相关 → 破坏 SGD 假设
# 2. 目标不稳定: Q 目标随参数变化 → 训练发散
# 3. 非平稳分布: 策略改变 → 数据分布改变

# ═══ DQN 的两大创新 ═══

# 创新 1: 经验回放 (Experience Replay)
# 存储 (s, a, r, s', done) 到 Buffer
# 训练时随机采样 mini-batch → 打破时间相关性!
from collections import deque
import random

class ReplayBuffer:
    def __init__(self, capacity=100000):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size=32):
        return random.sample(self.buffer, batch_size)

# 创新 2: 目标网络 (Target Network)
# 两个网络:
#   Online Network: Q(s,a;θ)     ← 实时更新
#   Target Network: Q(s,a;θ⁻)   ← 定期同步 (每 10K 步)
# 损失: L = (r + γ max_a' Q(s',a';θ⁻) - Q(s,a;θ))²
#           ^^^^^^^^^^^^^^^^^^^^^^^^ 用旧参数计算, 更稳定!

import torch
import torch.nn as nn

class DQN(nn.Module):
    def __init__(self, n_actions):
        super().__init__()
        # Atari: 输入 84×84 灰度帧
        self.conv = nn.Sequential(
            nn.Conv2d(4, 32, 8, stride=4), nn.ReLU(),
            nn.Conv2d(32, 64, 4, stride=2), nn.ReLU(),
            nn.Conv2d(64, 64, 3, stride=1), nn.ReLU(),
        )
        self.fc = nn.Sequential(
            nn.Linear(7 * 7 * 64, 512), nn.ReLU(),
            nn.Linear(512, n_actions),  # 输出每个动作的 Q 值
        )
    
    def forward(self, x):
        x = self.conv(x / 255.0)  # 归一化像素
        return self.fc(x.view(x.size(0), -1))

# ═══ DQN 训练循环 ═══
# 1. 用 ε-greedy 选动作, 与环境交互
# 2. 存储 transition 到 Replay Buffer
# 3. 从 Buffer 采样 mini-batch
# 4. 计算 TD 目标 (用 Target Network)
# 5. 更新 Online Network
# 6. 每 C 步复制参数到 Target Network

# ═══ 成绩 ═══
# 49 个 Atari 游戏, 29 个超越人类水平!
# Breakout: 从 0 分到发现"打隧道"策略`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🌈 Rainbow DQN: 六大改进</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> rainbow_dqn</div>
              <pre className="fs-code">{`# Rainbow DQN (DeepMind, 2018): DQN 改进的集大成者

# ═══ 六大改进技术 ═══

rainbow_components = {
    "1. Double DQN (DDQN)": {
        "问题": "DQN 用 max 会过估计 Q 值",
        "解法": "分离选择和评估",
        "公式": "a* = argmax Q(s',a;θ), 但用 Q(s',a*;θ⁻) 评估",
    },
    "2. Prioritized Replay": {
        "问题": "均匀采样效率低",
        "解法": "按 TD 误差大小优先采样",
        "直觉": "从'惊讶'的经验中学得更多",
    },
    "3. Dueling Network": {
        "问题": "有些状态无论什么动作都好/差",
        "解法": "分离 V(s) 和 A(s,a)",
        "公式": "Q(s,a) = V(s) + A(s,a) - mean(A)",
    },
    "4. Multi-Step Return": {
        "问题": "TD(0) 只看一步, 偏差大",
        "解法": "用 n-step return",
        "N": "通常 n=3",
    },
    "5. Distributional RL (C51)": {
        "问题": "Q 值是期望, 丢失不确定性",
        "解法": "学习回报的完整分布 Z(s,a)",
        "方法": "51 个原子近似分布",
    },
    "6. Noisy Networks": {
        "问题": "ε-greedy 探索不够智能",
        "解法": "在网络权重中加入可学习噪声",
        "优势": "自适应探索, 无需手调 ε",
    },
}

# ═══ Rainbow 的效果 ═══
# 单独每项改进: 10-30% 提升
# 六项组合 (Rainbow): 200%+ 提升!
# 在 Atari 57 游戏上大幅超越 DQN

# ═══ DQN 之后的值函数方法 ═══
post_dqn = {
    "R2D2":     "循环 DQN (LSTM + Replay)",
    "Agent57":  "首个在所有 57 个 Atari 游戏超越人类",
    "MuZero":   "学习环境模型 + 规划 (AlphaGo 继任)",
    "MCTS":     "蒙特卡洛树搜索 (围棋/国际象棋)",
}

# ═══ 值函数方法的局限 ═══
# 1. 只能处理离散动作空间
#    → 机器人的关节角度是连续的!
# 2. max 操作在高维动作空间不可行
#    → 怎么在 1000 维空间找 argmax?
# 3. 确定性策略, 无法表示最优随机策略
# → 策略梯度方法解决这些问题!`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
