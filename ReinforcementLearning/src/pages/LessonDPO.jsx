import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['DPO 原理', 'DPO 变体', 'GRPO', '对齐实战'];

export default function LessonDPO() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge indigo">💎 module_06 — DPO 与现代对齐</div>
      <div className="fs-hero">
        <h1>DPO 与现代对齐：DPO / GRPO / KTO — 无需奖励模型的新范式</h1>
        <p>
          DPO 证明了<strong>不需要训练奖励模型</strong>也能做对齐，将 RLHF 简化为
          一个分类问题。本模块推导 DPO 的数学等价性 (RLHF → closed-form solution)，
          掌握 <strong>GRPO (DeepSeek)</strong> 的组相对优化、
          <strong>KTO</strong> 的二元反馈方法，以及 Online/Iterative DPO 等前沿技术。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">💎 DPO 与现代对齐</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📐 DPO: 直接偏好优化</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> dpo_derivation</div>
              <pre className="fs-code">{`# DPO (Rafailov et al., 2023): 对齐的范式转变

# ═══ RLHF 的关键洞察 ═══
# RLHF 目标:
# max E[R(x,y)] - β·KL(π || π_ref)
#
# 这个优化问题有 closed-form 解:
# π*(y|x) = π_ref(y|x) · exp(R(x,y)/β) / Z(x)
#
# 反解奖励:
# R(x,y) = β · log(π*(y|x) / π_ref(y|x)) + β·log Z(x)
#
# → 最优策略隐含地定义了奖励函数!

# ═══ DPO 推导 ═══
# 将 R 代入 Bradley-Terry 模型:
# P(y_w ≻ y_l) = σ(R(x,y_w) - R(x,y_l))
#
# 代入 R = β·log(π/π_ref) + C:
# P(y_w ≻ y_l) = σ(β·[log π(y_w)/π_ref(y_w) - log π(y_l)/π_ref(y_l)])
#
# Z(x) 抵消了! → 不需要学习奖励模型!

# ═══ DPO 损失函数 ═══
# L_DPO = -E[log σ(β · (log π_θ(y_w|x)/π_ref(y_w|x)
#                       - log π_θ(y_l|x)/π_ref(y_l|x)))]

import torch
import torch.nn.functional as F

def dpo_loss(policy_logps_chosen, policy_logps_rejected,
             ref_logps_chosen, ref_logps_rejected, beta=0.1):
    """DPO 损失: 极其简洁!"""
    # 计算 log-ratio
    chosen_rewards = beta * (policy_logps_chosen - ref_logps_chosen)
    rejected_rewards = beta * (policy_logps_rejected - ref_logps_rejected)
    
    # Bradley-Terry loss
    loss = -F.logsigmoid(chosen_rewards - rejected_rewards).mean()
    
    # 用于监控的指标
    chosen_reward = chosen_rewards.detach().mean()
    rejected_reward = rejected_rewards.detach().mean()
    reward_margin = (chosen_reward - rejected_reward).item()
    
    return loss, chosen_reward, rejected_reward

# ═══ DPO vs RLHF 对比 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │              │ RLHF (PPO)   │ DPO          │
# ├──────────────┼──────────────┼──────────────┤
# │ 需要 RM     │ ✅ (单独训练) │ ❌           │
# │ 训练复杂度  │ 4个模型      │ 2个模型 (π+π_ref)│
# │ 显存需求    │ 高 (~4x)     │ 低 (~2x)     │
# │ 训练稳定性  │ 敏感         │ 稳定         │
# │ 超参数      │ 多 (PPO+KL)  │ 少 (只有β)   │
# │ 在线探索    │ ✅ (生成新数据)│ ❌ (离线)   │
# │ 效果        │ 大规模优     │ 中等规模优   │
# └──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔀 DPO 变体家族</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> dpo_variants</div>
              <pre className="fs-code">{`# DPO 催生了一系列改进变体

# ═══ IPO (Identity Preference Optimization) ═══
# 问题: DPO 假设 BT 模型, 但人类偏好不总满足
# 解法: 用 ψ-偏好 loss 替代 BT 假设
# L_IPO = (log π(yw)/πref(yw) - log π(yl)/πref(yl) - 1/2β)²

# ═══ KTO (Kahneman-Tversky Optimization) ═══
# 问题: 收集偏好对 (y_w ≻ y_l) 成本高
# 解法: 只需要二元标签 (好/坏)!
# L_KTO = -E_w[σ(β·r_w - z_ref)] - E_l[σ(z_ref - β·r_l)]
# z_ref = E[β·KL] (基线)
# 灵感: 前景理论 (损失厌恶 > 收益偏好)
def kto_loss(chosen_logps, rejected_logps, ref_chosen, ref_rejected, beta=0.1):
    kl = (chosen_logps - ref_chosen).mean().detach()  # baseline
    chosen_rewards = beta * (chosen_logps - ref_chosen)
    rejected_rewards = beta * (rejected_logps - ref_rejected)
    
    chosen_loss = -F.logsigmoid(chosen_rewards - kl)
    rejected_loss = -F.logsigmoid(kl - rejected_rewards)
    return (chosen_loss.mean() + rejected_loss.mean()) / 2

# ═══ Online / Iterative DPO ═══
# 问题: Offline DPO 用的是 π_SFT 的数据, 分布偏移
# 解法: 训练过程中用当前 π_θ 生成新的偏好数据
# 1. π_θ 生成候选回答
# 2. 用 RM (或 AI) 评判偏好
# 3. 立即用新数据做 DPO 更新
# → 比 offline DPO 效果显著提升!

# ═══ SimPO (Simple Preference Optimization) ═══
# 不需要 reference model!
# 用回答的平均 log-prob 作为隐式奖励
# r = (1/|y|) · log π_θ(y|x)  (length-normalized)
# 简单到令人发指, 效果却很好

# ═══ ORPO (Odds Ratio Preference Optimization) ═══
# 将 SFT 和偏好对齐合为一步
# 不需要 reference model + 不需要单独 SFT
# L_ORPO = L_SFT + λ · L_OR
# L_OR 基于 odds ratio 而非 log ratio

# ═══ 变体对比 ═══
# ┌──────────┬──────────┬──────────┬──────────┐
# │ 方法      │ 需要对比对│ 需要Ref  │ 复杂度   │
# ├──────────┼──────────┼──────────┼──────────┤
# │ DPO      │ ✅       │ ✅       │ 中       │
# │ IPO      │ ✅       │ ✅       │ 中       │
# │ KTO      │ ❌ (二元) │ ✅       │ 低       │
# │ SimPO    │ ✅       │ ❌       │ 低       │
# │ ORPO     │ ✅       │ ❌       │ 低       │
# └──────────┴──────────┴──────────┴──────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🚀 GRPO: DeepSeek 的对齐创新</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> grpo</div>
              <pre className="fs-code">{`# GRPO (Group Relative Policy Optimization)
# DeepSeek-R1/V3 使用的核心对齐算法

# ═══ 核心思想 ═══
# PPO 需要 Critic Network → 显存翻倍
# GRPO: 不需要 Critic! 用组内相对排名替代!

# ═══ GRPO 算法 ═══
# 1. 对每个 prompt, 生成一组 G 个回答:
#    {y_1, y_2, ..., y_G} ~ π_θ(·|x)
#
# 2. 用规则/RM 对每个回答打分:
#    {r_1, r_2, ..., r_G}
#
# 3. 组内归一化得到优势:
#    A_i = (r_i - mean(r)) / std(r)
#    → 好回答 A>0, 差回答 A<0 (相对排名!)
#
# 4. PPO-Clip 更新:
#    L = -E[min(ratio·A, clip(ratio)·A)] + β·KL

def grpo_loss(old_logprobs, new_logprobs, rewards, ref_logprobs,
              clip_epsilon=0.2, beta=0.01):
    """GRPO 损失函数"""
    # 组内奖励归一化
    advantages = (rewards - rewards.mean()) / (rewards.std() + 1e-8)
    
    # PPO Clip
    ratio = torch.exp(new_logprobs - old_logprobs)
    clipped = torch.clamp(ratio, 1 - clip_epsilon, 1 + clip_epsilon)
    policy_loss = -torch.min(ratio * advantages, clipped * advantages).mean()
    
    # KL 惩罚 (token-level)
    kl = new_logprobs - ref_logprobs
    kl_loss = beta * kl.mean()
    
    return policy_loss + kl_loss

# ═══ GRPO vs PPO ═══
# ┌──────────────┬──────────────┬──────────────┐
# │              │ PPO          │ GRPO         │
# ├──────────────┼──────────────┼──────────────┤
# │ Critic       │ 需要 (显存↑) │ 不需要       │
# │ 优势估计     │ GAE (V网络)  │ 组内归一化   │
# │ 生成数量     │ 1 per prompt │ G per prompt │
# │ 适用场景     │ 通用         │ 可验证奖励   │
# └──────────────┴──────────────┴──────────────┘

# ═══ GRPO 适用场景 ═══
# 数学推理: 答案可验证 → 二元奖励
# 代码生成: 测试用例通过/失败
# DeepSeek-R1: 先用 GRPO 训练冷启动, 再 SFT + RL

# ═══ GRPO 在 DeepSeek-R1 中的流程 ═══
deepseek_r1_pipeline = {
    "Stage 1": "GRPO 冷启动 — 纯 RL (无 SFT!)",
    "Stage 2": "拒绝采样 → 收集好数据 → SFT",
    "Stage 3": "再次 GRPO 微调",
    "Stage 4": "DPO 偏好对齐 (安全性)",
    "关键发现": "RL 训练中自发涌现 Chain-of-Thought!",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔧 对齐实战指南</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> alignment_practice</div>
              <pre className="fs-code">{`# 实战: 如何选择和实施对齐方案

# ═══ 方案选择决策树 ═══
# 有大量高质量对比数据?
#   ├─ 是 → 模型规模?
#   │   ├─ < 13B → DPO (简单高效)
#   │   └─ ≥ 70B → RLHF (PPO, 效果更好)
#   └─ 否 → 有二元反馈?
#       ├─ 是 → KTO
#       └─ 否 → RLAIF (用 AI 生成偏好)

# ═══ DPO 实战配置 (TRL 库) ═══
from trl import DPOTrainer, DPOConfig

config = DPOConfig(
    model_name="meta-llama/Llama-3-8B-Instruct",
    
    # 核心参数
    beta=0.1,                  # KL 系数 (0.05-0.5)
    learning_rate=5e-7,        # 比 SFT 低 10x
    max_length=1024,
    max_prompt_length=512,
    
    # 训练参数
    per_device_train_batch_size=4,
    gradient_accumulation_steps=8,
    num_train_epochs=3,
    warmup_ratio=0.1,
    
    # LoRA (推荐)
    use_peft=True,
    lora_r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    
    # 损失类型
    loss_type="sigmoid",  # sigmoid (DPO) / ipo / kto
)

# ═══ 数据格式 ═══
# [{"prompt": "...", "chosen": "...", "rejected": "..."}, ...]
# chosen: 人类偏好的好回答
# rejected: 人类不偏好的差回答

# ═══ 对齐评估基准 ═══
eval_benchmarks = {
    "AlpacaEval 2":   "GPT-4 作为裁判, 胜率评估",
    "MT-Bench":       "多轮对话, GPT-4 打分 (1-10)",
    "Arena-Hard":     "Chatbot Arena 的自动化版本",
    "HumanEval+":     "代码生成准确率",
    "TruthfulQA":     "事实准确性",
    "BBH":            "推理能力 (不应下降!)",
}

# ═══ 常见问题排查 ═══
troubleshooting = {
    "reward margin 不增加":  "β太大 / 数据质量差 / 学习率太高",
    "train loss 不下降":    "数据中 chosen≈rejected / 需要更强SFT",
    "评估分数下降":        "过拟合 / alignment tax / 需检查通用能力",
    "生成重复":            "β太小 / 过度优化 / 增加温度",
    "拒绝变多":            "安全训练过度 / 需要平衡 helpful vs safe",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
