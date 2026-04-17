import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['TRPO', 'PPO 算法', 'GAE', 'PPO 工程'];

export default function LessonPPO() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🔒 module_04 — PPO 与信赖域方法</div>
      <div className="fs-hero">
        <h1>PPO 与信赖域方法：TRPO / PPO / GAE — RLHF 的训练引擎</h1>
        <p>
          PPO 是当前最广泛使用的 RL 算法，也是 <strong>ChatGPT RLHF 管线的核心</strong>。
          本模块从 TRPO 的信赖域约束出发，推导 PPO 的截断代理目标函数，
          理解 <strong>GAE (广义优势估计)</strong> 的偏差-方差调控，
          最后深入 PPO 工程化实现的<strong>13 个关键细节</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔒 PPO 深度</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎯 TRPO: 信赖域策略优化</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> trpo</div>
              <pre className="fs-code">{`# TRPO (Schulman, 2015): 保证策略单调改进

# ═══ 策略梯度的根本问题 ═══
# 学习率太大 → 策略崩塌 (性能暴跌)
# 学习率太小 → 训练极慢
# → 需要限制每步更新的幅度!

# ═══ 代理目标 (Surrogate Objective) ═══
# 不直接优化 J(θ), 而是优化:
# L(θ) = E[r(θ) · A^π_old]
# 其中 r(θ) = π_θ(a|s) / π_{θ_old}(a|s)  (重要性采样比)
#
# 当 r(θ) ≈ 1 时, L(θ) 是 J(θ) 的一阶近似

# ═══ KL 散度约束 ═══
# maximize L(θ)
# subject to: E[KL(π_{θ_old} || π_θ)] ≤ δ
#
# → 限制新旧策略的差异不超过 δ
# → 保证策略单调改进!

# ═══ 数学推导 (简化版) ═══
# 定理: 如果 KL(π_old || π_new) ≤ δ, 则:
#   J(π_new) ≥ L_{π_old}(π_new) - C·δ
#   C = 2·ε·γ / (1-γ)², ε = max|A(s,a)|
#
# → 最大化 L(θ) 同时控制 KL → 保证 J 改进

# ═══ TRPO 的实现 ═══
# 1. 采集数据 (rollout)
# 2. 计算优势函数 A(s,a)
# 3. 用共轭梯度法近似求解约束优化:
#    max L(θ)  s.t.  KL ≤ δ
# 4. 线搜索 (line search) 确保改进

# ═══ TRPO 的问题 ═══
# 1. 实现复杂 (共轭梯度 + 线搜索)
# 2. 不兼容参数共享 (Actor-Critic)
# 3. 二阶优化计算开销大
# → PPO: 一阶近似 TRPO, 简单但同样有效!`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ PPO: 近端策略优化</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> ppo_algorithm</div>
              <pre className="fs-code">{`# PPO (Schulman, 2017): 简洁强大的 RL 算法
# → ChatGPT RLHF 使用的核心训练算法!

# ═══ PPO-Clip: 截断代理目标 ═══
# L_CLIP = E[min(r(θ)·A, clip(r(θ), 1-ε, 1+ε)·A)]
#
# r(θ) = π_θ(a|s) / π_{θ_old}(a|s)
# ε = 0.2 (截断范围)
#
# 当 A > 0 (好动作):
#   r > 1+ε → 被截断, 不会过度增加概率
# 当 A < 0 (差动作):
#   r < 1-ε → 被截断, 不会过度减少概率
# → 自动限制更新幅度, 替代 TRPO 的 KL 约束!

import torch

def ppo_loss(old_log_probs, new_log_probs, advantages, clip_epsilon=0.2):
    """PPO-Clip 损失函数"""
    ratio = torch.exp(new_log_probs - old_log_probs)  # r(θ)
    
    # 截断项
    clipped_ratio = torch.clamp(ratio, 1.0 - clip_epsilon, 1.0 + clip_epsilon)
    
    # 取较小值 → 保守更新
    surrogate1 = ratio * advantages
    surrogate2 = clipped_ratio * advantages
    policy_loss = -torch.min(surrogate1, surrogate2).mean()
    
    return policy_loss

# ═══ PPO 完整目标函数 ═══
# L = L_CLIP - c₁·L_VF + c₂·H
# L_CLIP: 策略损失 (clip)
# L_VF:   值函数损失 (MSE)
# H:      熵奖励 (鼓励探索)
# c₁=0.5, c₂=0.01

# ═══ PPO 训练流程 ═══
# for iteration in range(N):
#   1. 用当前策略采集 T 步数据
#   2. 计算 GAE 优势 A_t
#   3. 对采集的数据做 K 个 epoch 的优化:
#      (通常 K=3~10, minibatch=64)
#      - 计算 ratio = π_new / π_old
#      - 计算 clip loss
#      - 更新参数
#   4. 丢弃数据, 重新采集

# ═══ 为什么 PPO 如此流行? ═══
ppo_advantages = {
    "实现简单":   "无需共轭梯度/线搜索",
    "效果好":     "匹配或超越 TRPO",
    "通用性":     "离散/连续/多目标都行",
    "鲁棒性":     "超参数不敏感 (ε=0.2 通吃)",
    "可扩展":     "容易分布式训练",
    "RLHF核心":   "ChatGPT/Claude/LLaMA 训练用",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📊 GAE: 广义优势估计</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> gae</div>
              <pre className="fs-code">{`# GAE (Generalized Advantage Estimation, 2016)
# PPO/TRPO 的标配优势估计方法

# ═══ 偏差-方差困境 ═══
# MC 优势: A = G_t - V(s_t)   → 无偏但高方差
# TD 优势: A = δ_t = r + γV(s') - V(s)  → 低方差但有偏
# → 能否折中?

# ═══ GAE 公式 ═══
# A^GAE(γ,λ) = Σ_{l=0}^{∞} (γλ)^l · δ_{t+l}
#
# δ_t = r_t + γ·V(s_{t+1}) - V(s_t)  (TD 误差)
#
# λ = 0: A = δ_t (纯 TD, 低方差高偏差)
# λ = 1: A = G_t - V(s_t) (纯 MC, 高方差无偏差)
# λ = 0.95: 平衡点 (PPO 默认值)

def compute_gae(rewards, values, dones, gamma=0.99, lam=0.95):
    """计算广义优势估计"""
    advantages = []
    gae = 0
    
    for t in reversed(range(len(rewards))):
        if t == len(rewards) - 1:
            next_value = 0
        else:
            next_value = values[t + 1]
        
        delta = rewards[t] + gamma * next_value * (1 - dones[t]) - values[t]
        gae = delta + gamma * lam * (1 - dones[t]) * gae
        advantages.insert(0, gae)
    
    return torch.FloatTensor(advantages)

# ═══ 直觉理解 ═══
# GAE 是不同步长 TD 优势的加权平均:
# A^(1) = δ_t                       (1步TD)
# A^(2) = δ_t + γλ·δ_{t+1}          (2步)
# A^(3) = δ_t + γλ·δ_{t+1} + (γλ)²·δ_{t+2}  (3步)
# ...
# A^GAE = 加权平均, 权重 (γλ)^l 指数衰减

# ═══ GAE 超参数选择 ═══
# ┌──────┬──────────────┬──────────────┐
# │ λ    │ 偏差          │ 方差         │
# ├──────┼──────────────┼──────────────┤
# │ 0    │ 高 (纯TD)    │ 低           │
# │ 0.95 │ 中 (推荐!)   │ 中           │
# │ 1    │ 0 (纯MC)     │ 高           │
# └──────┴──────────────┴──────────────┘
# 实践: γ=0.99, λ=0.95 几乎是通用最优值`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔧 PPO 工程化: 13 个关键细节</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> ppo_engineering</div>
              <pre className="fs-code">{`# "Implementation Matters in Deep RL" (Engstrom, 2020)
# PPO 性能的 50%+ 来自工程细节, 不只是算法!

# ═══ 13 个关键实现细节 ═══
ppo_details = {
    # 数据处理
    "1. 观测归一化":  "Running mean/std 归一化状态",
    "2. 奖励裁剪":    "奖励 clip 到 [-10, 10]",
    "3. 优势归一化":  "A = (A - mean) / (std + 1e-8)",
    
    # 网络架构
    "4. 正交初始化":  "权重正交初始化, 偏置为 0",
    "5. 激活函数":    "Tanh (不用 ReLU)",
    "6. 值函数头":    "输出层权重缩放 0.01",
    
    # 训练技巧
    "7. 梯度裁剪":    "max_grad_norm = 0.5",
    "8. 学习率衰减":  "线性衰减到 0",
    "9. Mini-batch":  "数据打散成 mini-batch",
    "10. 多轮更新":   "同一批数据更新 K=3~10 次",
    
    # 损失函数
    "11. 值函数 clip": "类似策略 clip 的值函数约束",
    "12. 熵系数":     "0.01, 随训练可衰减",
    "13. 双精度 GAE":  "GAE 用 float64 计算",
}

# ═══ PPO 超参数配置 (经验值) ═══
ppo_hyperparams = {
    # 基础参数
    "clip_epsilon":    0.2,      # 截断范围
    "gamma":           0.99,     # 折扣因子
    "gae_lambda":      0.95,     # GAE λ
    "learning_rate":   3e-4,     # 初始学习率
    
    # 训练参数
    "n_steps":         2048,     # 每次采集步数
    "n_epochs":        10,       # 每批数据更新轮数
    "batch_size":      64,       # mini-batch 大小
    "max_grad_norm":   0.5,      # 梯度裁剪
    
    # 损失权重
    "vf_coef":         0.5,      # 值函数损失系数
    "ent_coef":        0.01,     # 熵损失系数
}

# ═══ PPO 在 RLHF 中的特殊配置 ═══
ppo_rlhf_config = {
    "KL 惩罚":     "加入 KL(π_RL || π_SFT) 惩罚项",
    "KL 系数":     "β = 0.02~0.2, 可自适应",
    "经验采集":    "从 SFT 模型采集 prompt + response",
    "奖励信号":    "Reward Model 打分",
    "参考模型":    "冻结的 SFT 模型 (计算 KL)",
    "挑战":        "奖励黑客 / 模式崩塌 / 训练不稳定",
}

# ═══ 工具库推荐 ═══
# Stable-Baselines3: 最简单的 PPO 实现
# CleanRL: 单文件实现, 适合学习
# TRL: HuggingFace RLHF 库 (PPO + DPO)
# OpenRLHF: 分布式 RLHF 训练框架`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
