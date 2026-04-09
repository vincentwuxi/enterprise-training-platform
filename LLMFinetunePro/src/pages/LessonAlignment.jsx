import { useState } from 'react';
import './LessonCommon.css';

export default function LessonAlignment() {
  const [tab, setTab] = useState('rlhf');

  const codes = {
    rlhf: `# ━━━━ RLHF 三阶段训练流程 ━━━━
# Reinforcement Learning from Human Feedback
# 目标：让模型输出符合人类偏好（有用/无害/诚实）

# ━━━━ 阶段 1：SFT（监督微调）━━━━
# 用高质量人工写作的"示范回答"做指令微调
# 此阶段即前面几个模块的内容

# ━━━━ 阶段 2：训练奖励模型（Reward Model）━━━━
# 数据：同一 prompt 的多个回答，人工排序（哪个更好？）
# 输出：一个标量分数，代表回答质量

from trl import RewardTrainer, RewardConfig
from transformers import AutoModelForSequenceClassification

# 奖励模型 = 在 SFT 模型基础上加分类头
reward_model = AutoModelForSequenceClassification.from_pretrained(
    "meta-llama/Meta-Llama-3-8B-Instruct",
    num_labels=1,           # 输出一个标量分数
    torch_dtype=torch.bfloat16,
)

reward_config = RewardConfig(
    output_dir="./reward_model",
    num_train_epochs=1,     # 奖励模型不用太多轮次
    per_device_train_batch_size=4,
    learning_rate=1e-5,     # 比 SFT 更低的 LR
    max_length=512,
)

# 数据格式：{"chosen": "...", "rejected": "..."}
reward_trainer = RewardTrainer(
    model=reward_model,
    args=reward_config,
    train_dataset=pref_dataset,
    tokenizer=tokenizer,
)
reward_trainer.train()

# ━━━━ 阶段 3：PPO 强化学习 ━━━━
# 用奖励模型的分数作为奖励信号，RL 优化 SFT 模型
from trl import PPOConfig, PPOTrainer, AutoModelForCausalLMWithValueHead

ppo_config = PPOConfig(
    learning_rate=1e-5,
    batch_size=16,
    mini_batch_size=4,
    gradient_accumulation_steps=4,
    optimize_cuda_cache=True,
    # KL 散度惩罚：防止模型跑偏太远
    kl_penalty="kl",
    init_kl_coef=0.05,      # KL 系数（越大越保守）
    target_kl=6,             # 目标 KL 值
)

model = AutoModelForCausalLMWithValueHead.from_pretrained(sft_model_path)
ref_model = AutoModelForCausalLMWithValueHead.from_pretrained(sft_model_path)

ppo_trainer = PPOTrainer(
    config=ppo_config,
    model=model,
    ref_model=ref_model,     # 参考模型（KL 惩罚基准）
    tokenizer=tokenizer,
    reward_model=reward_model,
)

# PPO 训练循环
for batch in dataloader:
    queries = batch["input_ids"]
    responses = model.generate(queries, max_new_tokens=256)
    rewards = reward_model.score(queries, responses)
    stats = ppo_trainer.step(queries, responses, rewards)`,

    dpo: `# ━━━━ DPO（Direct Preference Optimization）━━━━
# 2023 年 Stanford 提出：绕过 RM，直接从偏好数据优化策略模型
# 优点：不需要训练奖励模型，更稳定，资源消耗少 50%

# ━━━━ DPO 数学核心 ━━━━
# 优化目标（简化版）：
# 使 chosen 的对数概率 - rejected 的对数概率 最大化
# 同时保持与参考模型（SFT 模型）的 KL 距离不太大

# DPO Loss = -E[log σ(β(log π_θ(y_w|x)/π_ref(y_w|x)
#                     - log π_θ(y_l|x)/π_ref(y_l|x)))]
# 其中：y_w = chosen, y_l = rejected, β = 温度参数

from trl import DPOTrainer, DPOConfig

# DPO 配置
dpo_config = DPOConfig(
    output_dir="./dpo-model",
    num_train_epochs=1,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=5e-7,           # DPO 用极低 LR（比 SFT 低 100-200x）！
    beta=0.1,                     # 温度参数（越高越保守）
    loss_type="sigmoid",          # "sigmoid"（DPO）/"ipo"（IPO）
    label_smoothing=0.0,
    max_length=1024,
    max_prompt_length=512,
    bf16=True,
    warmup_ratio=0.1,
    optim="rmsprop",              # DPO 推荐 RMSprop（比 Adam 更稳定）
)

# 数据格式（DPO 专用）
# {"prompt": "...", "chosen": "...", "rejected": "..."}
dpo_trainer = DPOTrainer(
    model=sft_model,
    ref_model=None,               # None = 用 SFT 模型的 frozen copy
    args=dpo_config,
    train_dataset=pref_dataset,
    eval_dataset=eval_dataset,
    tokenizer=tokenizer,
)
dpo_trainer.train()

# ━━━━ DPO vs RLHF 选择 ━━━━
# ┌──────────────┬────────────────┬──────────────────────┐
# │              │ RLHF (PPO)     │ DPO                  │
# ├──────────────┼────────────────┼──────────────────────┤
# │ 复杂度       │ 高（3 阶段）    │ 低（1 阶段）          │
# │ 资源消耗     │ 高             │ 低 ~50%              │
# │ 稳定性       │ 较难调（PPO）   │ 稳定                  │
# │ 效果         │ 最强（OpenAI用）│ 接近，工程成本更低    │
# │ 开源生态     │ TRL PPO        │ TRL DPO（推荐）      │
# └──────────────┴────────────────┴──────────────────────┘`,

    grpo: `# ━━━━ GRPO（Group Relative Policy Optimization）━━━━
# DeepSeek R1 使用的对齐算法，2024 年最新进展
# 核心创新：不需要奖励模型！用规则奖励函数替代

# ━━━━ GRPO vs PPO ━━━━
# PPO：需要训练奖励模型（参数同等大），资源 2x
# GRPO：对同一 prompt 采样 G 个回答，用相对排名作为奖励
#       无需单独的 Reward Model！

from trl import GRPOConfig, GRPOTrainer

# 奖励函数（规则定义，无需训练）
def correctness_reward(prompts, completions, answers, **kwargs):
    """数学题：答案正确给 +1，错误给 -1"""
    rewards = []
    for completion, answer in zip(completions, answers):
        extracted = extract_answer(completion)   # 从 <answer>...</answer> 提取
        reward = 1.0 if extracted == answer else -1.0
        rewards.append(reward)
    return rewards

def format_reward(completions, **kwargs):
    """格式奖励：有 <think>...</think> 给 +0.5"""
    rewards = []
    for c in completions:
        has_think = "<think>" in c and "</think>" in c
        rewards.append(0.5 if has_think else 0.0)
    return rewards

def combined_reward(prompts, completions, answers, **kwargs):
    """组合多个奖励信号"""
    r1 = correctness_reward(prompts, completions, answers)
    r2 = format_reward(completions)
    return [a + b for a, b in zip(r1, r2)]

# GRPO 训练配置
grpo_config = GRPOConfig(
    output_dir="./grpo-model",
    num_train_epochs=1,
    per_device_train_batch_size=2,
    learning_rate=1e-6,
    num_generations=8,              # 每个 prompt 采样 8 个回答（G=8）
    max_prompt_length=512,
    max_completion_length=2048,     # 推理模型需要更长的输出
    temperature=0.7,
    beta=0.001,                     # KL 惩罚系数
)

trainer = GRPOTrainer(
    model=model,
    reward_funcs=combined_reward,
    args=grpo_config,
    train_dataset=math_dataset,     # 数学/推理数据集
)
trainer.train()

# ━━━━ GRPO 特别适合 ━━━━
# 数学推理：答案正确与否是完美的奖励信号
# 代码生成：单元测试通过 = 奖励
# 格式遵从：有 CoT 思考链 = 奖励`,
  };

  return (
    <div className="ft-lesson">
      <div className="ft-hero">
        <div className="ft-badge">// MODULE 06 · ALIGNMENT</div>
        <h1>RLHF & DPO 偏好对齐</h1>
        <p>微调让模型会做领域任务，而偏好对齐让模型<strong>知道怎么说话</strong>——有用、无害、诚实。RLHF 是 ChatGPT 的技术基础；DPO 是更工程友好的替代；GRPO 是 DeepSeek R1 的秘密武器。</p>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">🎯 三种偏好对齐方法</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['rlhf', '🏆 RLHF（PPO 三阶段）'], ['dpo', '⚡ DPO（直接偏好优化）'], ['grpo', '🧠 GRPO（DeepSeek 方法）']].map(([k, l]) => (
            <button key={k} className={`ft-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ft-code-wrap">
          <div className="ft-code-head">
            <div className="ft-code-dot" style={{ background: '#ef4444' }} /><div className="ft-code-dot" style={{ background: '#f59e0b' }} /><div className="ft-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_alignment.py</span>
          </div>
          <div className="ft-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">📊 对齐方法演进时间线</div>
        <div className="ft-steps">
          {[
            { year: '2022', name: 'InstructGPT / RLHF', color: '#e11d48', desc: 'OpenAI 首次用 RLHF 训练 ChatGPT。三阶段：SFT → RM → PPO。效果颠覆性，但工程复杂。' },
            { year: '2023', name: 'DPO', color: '#6366f1', desc: 'Stanford 提出。绕过 RM，直接优化偏好对比。资源减半，稳定性更好，迅速成为主流选择。' },
            { year: '2024', name: 'ORPO / SimPO', color: '#f59e0b', desc: '无需参考模型的改进版 DPO 变体。进一步简化流程，减少显存需求。' },
            { year: '2025', name: 'GRPO（DeepSeek R1）', color: '#10b981', desc: '规则奖励函数代替奖励模型。特别适合数学/代码推理任务，是"让模型学会思考"的突破。' },
          ].map((s, i) => (
            <div key={i} className="ft-step">
              <div className="ft-step-num" style={{ background: `${s.color}22`, borderColor: s.color, color: s.color }}>{s.year.slice(2)}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--ft-muted)', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="ft-tip">
          💡 <strong>2025 年工程推荐选择</strong>：① 没有人工标注数据 → GRPO（规则奖励）；② 有 chosen/rejected 对 → DPO；③ 追求极致效果且资源充足 → RLHF PPO。绝大多数工程场景用 DPO 即可。
        </div>
      </div>
    </div>
  );
}
