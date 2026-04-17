import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['RLHF 全景', '奖励模型', 'PPO 对齐', '挑战与实战'];

export default function LessonRLHF() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🧬 module_05 — RLHF</div>
      <div className="fs-hero">
        <h1>RLHF：人类反馈强化学习 — ChatGPT 对齐的核心技术</h1>
        <p>
          RLHF 是让 LLM 从"能力强"变为"有用且安全"的关键技术。本模块深入
          <strong>InstructGPT/ChatGPT 的三阶段管线</strong>：SFT → 奖励模型训练 →
          PPO 微调。理解<strong>Bradley-Terry 偏好模型</strong>的数学推导，掌握
          Reward Hacking 的防御策略，剖析 RLHF 在工业界的<strong>真实工程挑战</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧬 RLHF 深度</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏗️ RLHF 三阶段管线</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> rlhf_pipeline</div>
              <pre className="fs-code">{`# RLHF (Ouyang et al., 2022): InstructGPT → ChatGPT 的核心

# ═══ 为什么需要 RLHF? ═══
# 预训练 LLM: 预测下一个 token → 不知道人类偏好
# SFT: 模仿人类示范 → 但只有正样本, 分布偏移
# RLHF: 从人类反馈中学习偏好 → 对齐人类价值观
#
# 对齐的三大目标: Helpful + Harmless + Honest

# ═══ 三阶段管线 ═══
#
# ┌─────────────────────────────────────────────┐
# │ Stage 1: SFT (Supervised Fine-Tuning)       │
# │ ─────────────────────────────────────────── │
# │ 输入: Base LLM + 人工标注的指令→回答对      │
# │ 方法: 标准交叉熵损失 fine-tune              │
# │ 输出: SFT Model (π_SFT)                     │
# │ 数据量: ~13K 高质量示范                      │
# └─────────────────────────────────────────────┘
#              ↓
# ┌─────────────────────────────────────────────┐
# │ Stage 2: Reward Model (RM) Training         │
# │ ─────────────────────────────────────────── │
# │ 输入: 同一 prompt 的多个回答 + 人类排序      │
# │ 方法: Bradley-Terry 偏好模型                 │
# │ 输出: Reward Model r_θ(x, y) → 标量分数     │
# │ 数据量: ~33K 对比对                          │
# └─────────────────────────────────────────────┘
#              ↓
# ┌─────────────────────────────────────────────┐
# │ Stage 3: PPO Fine-Tuning                    │
# │ ─────────────────────────────────────────── │
# │ 输入: SFT Model + Reward Model              │
# │ 方法: PPO + KL 惩罚 (防偏离 SFT)            │
# │ 输出: RLHF Model (π_RLHF)                   │
# │ 目标: max E[R(x,y)] - β·KL(π_RLHF||π_SFT)  │
# └─────────────────────────────────────────────┘

# ═══ 各阶段的关系 ═══
# SFT:  教模型"怎么回答问题" (能力获取)
# RM:   学习"什么是好的回答" (偏好建模)
# PPO:  优化模型"生成好的回答" (策略优化)

# ═══ LLM as RL 问题 ═══
# State:    prompt + 已生成 tokens
# Action:   下一个 token (词表大小 ~32K)
# Policy:   LLM π_θ(token | context)
# Reward:   RM 对完整回答的打分 (稀疏!)
# Episode:  一次完整的 prompt→response 生成`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏆 奖励模型 (Reward Model)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> reward_model</div>
              <pre className="fs-code">{`# 奖励模型: 将人类偏好量化为标量奖励

# ═══ 数据收集 ═══
# 1. 给定 prompt x
# 2. SFT 模型生成 K 个候选回答: y_1, y_2, ..., y_K
# 3. 人类标注员排序: y_w ≻ y_l (w=win, l=lose)
# InstructGPT: 每个 prompt 生成 4~9 个候选, 两两比较

# ═══ Bradley-Terry 偏好模型 ═══
# 假设: 人类偏好由潜在奖励决定
# P(y_w ≻ y_l | x) = σ(r(x, y_w) - r(x, y_l))
#                   = 1 / (1 + exp(-(r(x,y_w) - r(x,y_l))))
#
# 直觉: 奖励差越大 → 偏好概率越高

# ═══ RM 训练损失 ═══
# L_RM = -E[log σ(r(x, y_w) - r(x, y_l))]
# 最大化好回答和差回答的奖励差!

import torch
import torch.nn as nn

class RewardModel(nn.Module):
    def __init__(self, base_model):
        super().__init__()
        self.backbone = base_model  # 从 SFT 模型初始化
        self.reward_head = nn.Linear(hidden_size, 1)
    
    def forward(self, input_ids, attention_mask):
        outputs = self.backbone(input_ids, attention_mask=attention_mask)
        # 取最后一个 token 的隐藏状态
        last_hidden = outputs.last_hidden_state[:, -1, :]
        reward = self.reward_head(last_hidden)
        return reward.squeeze(-1)

def rm_loss(reward_chosen, reward_rejected):
    """Bradley-Terry 损失"""
    return -torch.log(torch.sigmoid(reward_chosen - reward_rejected)).mean()

# ═══ RM 训练技巧 ═══
rm_tricks = {
    "排序归一化":  "同一 prompt 的奖励做归一化",
    "数据清洗":    "去除标注不一致的数据",
    "模型大小":    "通常与策略模型同大小或略小",
    "正则化":      "防止奖励值过大 → 奖励 hacking",
    "标注质量":    "Inter-annotator agreement > 70%",
}

# ═══ 从排序到对比 ═══
# K个候选排序 → C(K,2) 个对比对
# K=4 → 6 对, K=9 → 36 对
# 数据效率大幅提升!

# ═══ RM 评估指标 ═══
# Accuracy: RM 能否正确预测人类偏好?
# InstructGPT: ~72% accuracy (vs 人类 ~75%)
# → RM 不完美! 这导致了 Reward Hacking 问题`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎮 PPO 对齐训练</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> ppo_alignment</div>
              <pre className="fs-code">{`# PPO in RLHF: LLM 策略优化

# ═══ RLHF 目标函数 ═══
# max_θ E_{x~D, y~π_θ}[R(x,y)] - β·KL(π_θ || π_SFT)
#
# R(x,y): Reward Model 打分
# KL 惩罚: 防止策略偏离 SFT 太远 (模式崩塌)
# β: KL 系数 (需要仔细调节)

# ═══ 训练架构 (4个模型!) ═══
# 1. Actor (Policy Model): π_θ — 生成回答 (可训练)
# 2. Critic (Value Model): V_φ — 估计价值 (可训练)
# 3. Reward Model: r_ψ — 打分 (冻结)
# 4. Reference Model: π_ref = π_SFT — 计算 KL (冻结)

# ═══ 训练循环 ═══
def rlhf_training_loop():
    for batch in dataloader:
        prompts = batch["prompt"]
        
        # Step 1: 生成回答
        with torch.no_grad():
            responses = actor.generate(prompts, max_length=512)
        
        # Step 2: 计算奖励
        with torch.no_grad():
            rewards = reward_model(prompts, responses)
        
        # Step 3: 计算 KL 惩罚
        with torch.no_grad():
            ref_logprobs = reference_model.log_prob(prompts, responses)
        actor_logprobs = actor.log_prob(prompts, responses)
        kl_penalty = actor_logprobs - ref_logprobs
        
        # Step 4: 调整奖励 (每个 token 的 KL 惩罚)
        adjusted_rewards = rewards - beta * kl_penalty
        
        # Step 5: 计算 GAE 优势
        values = critic(prompts, responses)
        advantages = compute_gae(adjusted_rewards, values)
        
        # Step 6: PPO 更新 Actor
        for epoch in range(ppo_epochs):
            ratio = compute_ratio(actor, old_logprobs, prompts, responses)
            actor_loss = ppo_clip_loss(ratio, advantages)
            actor_loss.backward()
            actor_optimizer.step()
        
        # Step 7: 更新 Critic
        critic_loss = (values - returns).pow(2).mean()
        critic_loss.backward()
        critic_optimizer.step()

# ═══ KL 系数自适应 ═══
# 如果 KL < KL_target: 减小 β (给模型更多自由)
# 如果 KL > KL_target: 增大 β (收紧约束)
# KL_target 通常设为 6~10 nats

# ═══ GPU 内存挑战 ═══
# 4个模型同时在显存中!
# 7B 模型: 4 × 28GB = 112GB → 至少 2×A100
# 解决方案:
# - LoRA: Actor 只训练低秩适配器 → 减少 3x 显存
# - DeepSpeed ZeRO: 模型并行 + 梯度分片
# - vLLM: 高效推理 (生成阶段)
# - Actor/Critic 共享 backbone`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚠️ RLHF 挑战与实战</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> rlhf_challenges</div>
              <pre className="fs-code">{`# RLHF 的核心挑战与工业实践

# ═══ 1. Reward Hacking (奖励攻击) ═══
# 模型学会"欺骗"奖励模型而不是真正改善!
reward_hacking_examples = {
    "文本变长":  "更长的回答通常得分更高 (RM的偏见)",
    "格式套路":  "总是加'当然...' '很好的问题...'",
    "重复内容":  "重复关键词提升 RM 分数",
    "谄媚迎合":  "无条件同意用户, 即使用户是错的",
}
# 防御: 加大 KL 惩罚 / 迭代训练 RM / 长度归一化奖励

# ═══ 2. Reward Model 局限 ═══
rm_limitations = {
    "标注不一致": "不同标注员对同一回答评价不同",
    "偏见放大":   "RM 学到标注员的偏见 (如偏好长文本)",
    "分布外泛化": "RM 在训练分布外的回答上不可靠",
    "多维度混淆": "一个标量无法表达多维质量",
}

# ═══ 3. 训练不稳定 ═══
# RLHF 训练超参数极其敏感:
instability_issues = {
    "KL 爆炸":    "β 太小, 策略剧烈偏离",
    "奖励崩塌":   "RM 分数趋同, 梯度消失",
    "遗忘能力":   "RLHF 后基础能力下降 (alignment tax)",
    "模式崩塌":   "只生成几种固定回答",
}

# ═══ 工业级 RLHF 实战配置 ═══
industrial_rlhf = {
    "模型规模": "7B-70B",
    "RM 数据":  "100K-1M 对比对",
    "PPO Epoch": "1-4",
    "KL 系数":  "0.02-0.2 (自适应)",
    "学习率":   "1e-6 ~ 5e-6",
    "Batch":    "512-1024 prompts",
    "训练时长": "数小时到数天 (看规模)",
    "GPU":      "8×A100 到 256×H100",
}

# ═══ RLHF 的替代方案 ═══
alternatives = {
    "DPO":    "直接偏好优化, 无需 RM (下一讲!)",
    "GRPO":   "组相对策略优化 (DeepSeek)",
    "KTO":    "只需 好/坏 标签, 无需对比",
    "RLAIF":  "AI 反馈替代人类反馈 (Constitutional AI)",
    "ReST":   "Reinforced Self-Training",
    "SPIN":   "Self-Play Fine-Tuning",
}
# → DPO 家族正在取代 RLHF 成为主流!`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
