import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['REINFORCE', 'Actor-Critic', 'A2C / A3C', '连续动作'];

export default function LessonPolicyGradient() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🎯 module_03 — 策略梯度</div>
      <div className="fs-hero">
        <h1>策略梯度：REINFORCE / Actor-Critic / A2C / A3C</h1>
        <p>
          策略梯度直接优化策略本身，解决了值函数方法无法处理<strong>连续动作空间</strong>
          的难题。本模块从策略梯度定理出发，推导 REINFORCE 算法，引入
          <strong>基线 (Baseline)</strong> 降低方差，构建 <strong>Actor-Critic</strong>
          二元架构，理解 A2C 同步和 A3C 异步训练的工程实现。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 策略梯度</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📐 REINFORCE 算法</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> reinforce</div>
              <pre className="fs-code">{`# 策略梯度: 直接参数化并优化策略

# ═══ 为什么需要策略梯度? ═══
# 值函数方法: Q(s,a) → argmax (只能离散)
# 策略梯度:   π_θ(a|s) → 直接输出动作概率
# 优势:
# 1. 天然支持连续动作空间
# 2. 可以学习随机策略 (石头剪刀布)
# 3. 策略参数化更平滑 → 收敛更稳定

# ═══ 策略梯度定理 ═══
# 目标: J(θ) = E_π[Σ γ^t r_t] (最大化期望回报)
# 梯度: ∇_θ J(θ) = E_π[Σ ∇_θ log π_θ(a_t|s_t) · G_t]
#
# 直觉:
# - G_t 高 → 增加 log π(a|s) → 更可能选这个动作
# - G_t 低 → 减少 log π(a|s) → 更少选这个动作
# → "强化好的动作, 惩罚差的动作"

import torch
import torch.nn as nn
import torch.distributions as dist

class PolicyNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, action_dim), nn.Softmax(dim=-1),
        )
    
    def forward(self, state):
        return self.net(state)

def reinforce(env, policy, optimizer, gamma=0.99, n_episodes=5000):
    for episode in range(n_episodes):
        states, actions, rewards = [], [], []
        s = env.reset()
        
        # 采集完整 episode
        while True:
            probs = policy(torch.FloatTensor(s))
            m = dist.Categorical(probs)
            a = m.sample()
            s_next, r, done = env.step(a.item())
            
            states.append(s)
            actions.append(a)
            rewards.append(r)
            s = s_next
            if done:
                break
        
        # 计算折扣回报
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + gamma * G
            returns.insert(0, G)
        returns = torch.FloatTensor(returns)
        returns = (returns - returns.mean()) / (returns.std() + 1e-8)
        
        # 策略梯度更新
        loss = 0
        for t in range(len(states)):
            probs = policy(torch.FloatTensor(states[t]))
            m = dist.Categorical(probs)
            log_prob = m.log_prob(actions[t])
            loss -= log_prob * returns[t]
        
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

# ═══ REINFORCE 的问题 ═══
# 高方差! 每个 episode 的 G_t 波动很大
# → 解决: 引入基线 (Baseline)
# ∇J = E[∇log π(a|s) · (G_t - b(s))]
# b(s) = V(s) 是最好的基线
# (G_t - V(s)) = A(s,a) ← 优势函数!`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎭 Actor-Critic 架构</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> actor_critic</div>
              <pre className="fs-code">{`# Actor-Critic: 结合策略梯度和值函数

# ═══ 两个网络 ═══
# Actor (策略网络):  π_θ(a|s) — 决定做什么
# Critic (价值网络): V_φ(s)   — 评价做得好不好
#
# Actor:  "我选这个动作"
# Critic: "这个动作比平均水平好/差 A(s,a)"
# Actor:  "那我增加/减少这个动作的概率"

# ═══ 优势函数 (Advantage Function) ═══
# A(s,a) = Q(s,a) - V(s)
# "这个动作比平均水平好多少?"
# A > 0: 好动作 → 增加概率
# A < 0: 差动作 → 减少概率
#
# 实践中用 TD 误差近似:
# A ≈ δ = r + γV(s') - V(s)

import torch.nn as nn

class ActorCritic(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        # 共享特征提取
        self.shared = nn.Sequential(
            nn.Linear(state_dim, 256), nn.ReLU(),
        )
        # Actor 头: 输出动作概率
        self.actor = nn.Sequential(
            nn.Linear(256, 128), nn.ReLU(),
            nn.Linear(128, action_dim), nn.Softmax(dim=-1),
        )
        # Critic 头: 输出状态价值
        self.critic = nn.Sequential(
            nn.Linear(256, 128), nn.ReLU(),
            nn.Linear(128, 1),
        )
    
    def forward(self, state):
        features = self.shared(state)
        action_probs = self.actor(features)
        state_value = self.critic(features)
        return action_probs, state_value

# ═══ Actor-Critic 更新 ═══
# 1. 采样 (s, a, r, s')
# 2. TD 误差: δ = r + γV(s') - V(s)
# 3. Critic 更新: 最小化 δ² (或 Huber loss)
# 4. Actor 更新: ∇θ = ∇log π(a|s) · δ

# ═══ Actor-Critic 变体 ═══
ac_variants = {
    "基础 AC":    "TD(0) 优势, 高偏差",
    "n-step AC":  "n-step return, 偏差-方差折中",
    "GAE":        "广义优势估计, 指数加权 (PPO 使用)",
    "A2C":        "同步多 worker",
    "A3C":        "异步多 worker",
    "SAC":        "最大熵 AC (连续控制 SOTA)",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ A2C 与 A3C</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> a2c_a3c</div>
              <pre className="fs-code">{`# A3C (Mnih et al., 2016): 异步优势 Actor-Critic

# ═══ 核心思想: 并行采集经验 ═══
# 问题: 单个 agent 采集数据太慢
# 解法: 多个 worker 并行交互不同环境
#
# A3C 架构:
#   Global Network (共享参数)
#       ↕ 梯度聚合
#   Worker 1: 环境1, 采集→计算梯度→异步更新
#   Worker 2: 环境2, 采集→计算梯度→异步更新
#   Worker 3: 环境3, ...
#   ...
#   Worker N: 环境N, ...

# ═══ A3C vs A2C ═══
#
# A3C (Asynchronous): 
#   每个 worker 独立更新全局网络
#   不等其他 worker → 速度快
#   但异步更新可能导致梯度过时 (stale gradient)
#
# A2C (Synchronous):
#   所有 worker 同步采集 → 同步更新
#   等所有 worker 完成 → 汇总梯度 → 一次更新
#   更稳定, 现代实践中更常用

# ═══ A2C 实现 ═══
import torch.multiprocessing as mp

class A2C:
    def __init__(self, n_workers=8):
        self.model = ActorCritic(state_dim, action_dim)
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=3e-4)
        self.envs = [make_env() for _ in range(n_workers)]
    
    def train_step(self):
        # 所有环境同步执行 n_steps
        all_states, all_actions, all_rewards = [], [], []
        for env in self.envs:
            # 采集 n_steps 的经验
            states, actions, rewards = rollout(env, self.model, n_steps=5)
            all_states.extend(states)
            all_actions.extend(actions)
            all_rewards.extend(rewards)
        
        # 计算 GAE 优势
        advantages = compute_gae(all_rewards, all_values, gamma=0.99, lam=0.95)
        
        # 统一更新
        actor_loss = -(log_probs * advantages.detach()).mean()
        critic_loss = advantages.pow(2).mean()
        entropy_loss = -entropy.mean()  # 鼓励探索
        
        loss = actor_loss + 0.5 * critic_loss + 0.01 * entropy_loss
        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), 0.5)
        self.optimizer.step()

# ═══ 熵正则化 ═══
# L_entropy = -Σ π(a|s) log π(a|s)
# 鼓励策略保持多样性, 防止过早收敛到次优
# 系数通常 0.01~0.1`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🤖 连续动作空间</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> continuous_control</div>
              <pre className="fs-code">{`# 连续动作空间: 机器人控制的核心

# ═══ 离散 vs 连续动作 ═══
# 离散: Atari 上下左右 → Categorical 分布
# 连续: 机器人关节角度 → Gaussian 分布
#
# 策略输出均值和标准差:
# π(a|s) = N(μ_θ(s), σ_θ(s)²)

class ContinuousPolicy(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(state_dim, 256), nn.ReLU(),
            nn.Linear(256, 256), nn.ReLU(),
        )
        self.mean = nn.Linear(256, action_dim)
        self.log_std = nn.Parameter(torch.zeros(action_dim))
    
    def forward(self, state):
        features = self.shared(state)
        mean = self.mean(features)
        std = self.log_std.exp()
        return torch.distributions.Normal(mean, std)

# 采样动作:
# dist = policy(state)
# action = dist.sample()      # 重参数化采样
# log_prob = dist.log_prob(action).sum(-1)

# ═══ DDPG (Deep Deterministic Policy Gradient) ═══
# 连续空间的 DQN
# Actor: μ_θ(s) → 确定性动作
# Critic: Q_φ(s,a) → 评估
# 用 Ornstein-Uhlenbeck 噪声探索

# ═══ TD3 (Twin Delayed DDPG) ═══
# DDPG 的三项改进:
td3_improvements = {
    "Twin Critic":    "两个 Q 网络, 取较小值 → 防过估计",
    "Delayed Update": "Actor 更新频率低于 Critic",
    "Target Smoothing": "目标动作加噪声 → 更鲁棒",
}

# ═══ SAC (Soft Actor-Critic) ═══
# 最大熵 RL: 最大化 回报 + 策略熵
# J = E[Σ r_t + α·H(π(·|s_t))]
# α 自动调节 (temperature)
# → 连续控制 SOTA, 探索能力强
sac_advantages = {
    "自动α调节":  "不需要手动调熵系数",
    "样本效率":    "Off-Policy + 经验回放",
    "稳定性":      "两个 Q 网络 + 最大熵",
    "探索":        "熵正则化天然鼓励探索",
}

# ═══ 连续控制基准 ═══
# MuJoCo: HalfCheetah / Humanoid / Ant
# DMControl: 多种物理模拟任务
# IsaacGym: GPU 并行物理仿真 (NVIDIA)
# → SAC 和 PPO 是当前最常用的选择`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
