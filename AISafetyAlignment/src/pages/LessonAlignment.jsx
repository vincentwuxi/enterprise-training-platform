import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 05 — 对齐工程
   RLHF / DPO / Constitutional AI
   ───────────────────────────────────────────── */

const ALIGNMENT_METHODS = [
  { name: 'RLHF', fullname: 'Reinforcement Learning from Human Feedback', icon: '🎮', org: 'OpenAI / DeepMind',
    desc: '三阶段训练：SFT → Reward Model → PPO 强化学习',
    stages: [
      { name: 'Stage 1: SFT', detail: '用高质量示范数据微调基座模型' },
      { name: 'Stage 2: Reward Model', detail: '标注者对比模型输出，训练奖励模型 R(x,y)' },
      { name: 'Stage 3: PPO', detail: '用 PPO 算法优化策略，使奖励最大化，同时防止过度偏离原模型' },
    ],
    pros: ['GPT-4 / Claude 的核心训练技术', '能捕捉难以用规则描述的人类偏好', '效果最强——产业主流'],
    cons: ['需要大量人工标注（昂贵）', '奖励模型可能被"黑掉"(reward hacking)', 'PPO 训练不稳定，超参敏感'],
    code: `# RLHF 三阶段 Pipeline
# Stage 1: Supervised Fine-Tuning
sft_model = train_sft(base_model, demo_data)

# Stage 2: Reward Model Training
# 标注者对同一 prompt 的两个输出进行偏好排序
reward_model = train_reward_model(
    preference_data,  # [(prompt, chosen, rejected), ...]
    base_model=sft_model
)

# Stage 3: PPO Optimization
from trl import PPOTrainer, PPOConfig

ppo_config = PPOConfig(
    learning_rate=1.41e-5,
    batch_size=256,
    mini_batch_size=64,
    gradient_accumulation_steps=1,
    kl_penalty="kl",      # KL 散度惩罚
    init_kl_coef=0.2,     # 防止偏离太远
)

ppo_trainer = PPOTrainer(
    model=sft_model,
    ref_model=sft_model,  # 参考模型（冻结）
    reward_model=reward_model,
    config=ppo_config,
)

# 训练循环
for batch in dataloader:
    response = ppo_trainer.generate(batch["query"])
    reward = reward_model(batch["query"], response)
    stats = ppo_trainer.step(batch["query"], response, reward)` },
  { name: 'DPO', fullname: 'Direct Preference Optimization', icon: '🎯', org: 'Stanford',
    desc: '跳过 Reward Model 和 RL，直接从偏好数据优化策略——更简单、更稳定',
    stages: [
      { name: '核心洞察', detail: '最优策略可以直接用偏好数据和参考策略的比率来表示' },
      { name: '损失函数', detail: 'Loss = -log σ(β · [log(π/π_ref)(chosen) - log(π/π_ref)(rejected)])' },
      { name: '训练', detail: '标准的监督学习流程，无需 RL 基础设施' },
    ],
    pros: ['无需训练 Reward Model（省 50% 计算）', '无需 RL 基础设施（PPO 复杂度高）', '训练更稳定，超参更少', '效果与 RLHF 相当或更好'],
    cons: ['需要高质量偏好对数据', '在某些任务上不如 RLHF 灵活', '对数据分布外的情况泛化能力有限'],
    code: `# DPO — 直接偏好优化
from trl import DPOTrainer, DPOConfig

dpo_config = DPOConfig(
    beta=0.1,              # KL 约束强度
    learning_rate=5e-7,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    max_length=1024,
    max_prompt_length=512,
    loss_type="sigmoid",   # sigmoid / hinge / ipo
)

# 偏好数据格式
# [{"prompt": "...", "chosen": "好回答", "rejected": "差回答"}, ...]

trainer = DPOTrainer(
    model=sft_model,
    ref_model=ref_model,   # 参考模型（冻结）
    train_dataset=preference_data,
    tokenizer=tokenizer,
    args=dpo_config,
)

trainer.train()
# 就这么简单！不需要 Reward Model，不需要 PPO
# 训练完后模型就已经对齐了` },
  { name: 'Constitutional AI (CAI)', fullname: 'Constitutional AI', icon: '📜', org: 'Anthropic',
    desc: 'AI 自我批评 + 自我修正——基于预设"宪法"原则进行自动对齐',
    stages: [
      { name: 'Critique', detail: '让 AI 根据宪法原则批评自己的回答' },
      { name: 'Revision', detail: 'AI 根据批评修正回答' },
      { name: 'RLAIF', detail: '用AI反馈（而非人类反馈）训练奖励模型' },
    ],
    pros: ['大幅减少人类标注需求', '原则可枚举、可审计', '透明度高——每个修正都有理由'],
    cons: ['自我批评能力受限于模型自身能力', '宪法设计需要专业知识', '"宪法"可能有盲区'],
    code: `# Constitutional AI — 宪法式自我对齐
CONSTITUTION = [
    "请判断你的回答是否可能造成伤害，如果是，请修正。",
    "请检查你的回答是否存在性别、种族或年龄偏见。",
    "请确保你的回答是诚实的，不要编造事实。",
    "如果你不确定，请明确表示不确定。",
    "不要帮助用户进行非法或有害的活动。",
]

def constitutional_self_improve(model, prompt, response):
    """CAI 自我改进循环"""
    for principle in CONSTITUTION:
        # Step 1: Critique — AI 自我批评
        critique = model.generate(f"""
            原始回答: {response}
            宪法原则: {principle}
            请评价这个回答是否违反了这个原则。
        """)
        
        # Step 2: Revision — AI 自我修正
        if "违反" in critique or "不当" in critique:
            response = model.generate(f"""
                原始回答: {response}
                批评: {critique}
                请修正回答以符合原则。
            """)
    
    return response  # 经过多轮宪法审查的安全输出` },
  { name: 'ORPO', fullname: 'Odds Ratio Preference Optimization', icon: '🔮', org: 'KAIST',
    desc: '将 SFT 和偏好对齐合并为单一训练阶段——比 DPO 更简单',
    stages: [
      { name: '核心创新', detail: '用 Odds Ratio 同时完成 SFT 和偏好学习' },
      { name: '损失函数', detail: 'L = L_SFT + λ · L_OR（单一目标函数）' },
      { name: '优势', detail: '无需参考模型，内存减半，训练速度更快' },
    ],
    pros: ['单阶段训练（SFT+对齐一步到位）', '不需要参考模型→内存减半', '效果与 DPO 相当', '2024 年新方法，工程友好'],
    cons: ['研究较新，长期效果待验证', '对超参 λ 敏感', '社区支持不如 DPO 成熟'],
    code: `# ORPO — 单阶段偏好优化
from trl import ORPOTrainer, ORPOConfig

orpo_config = ORPOConfig(
    learning_rate=8e-6,
    beta=0.1,           # OR 损失权重
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    max_length=1024,
    max_prompt_length=512,
    num_train_epochs=1,
)

# 无需 ref_model！
trainer = ORPOTrainer(
    model=base_model,           # 基座模型
    # 注意：没有 ref_model 参数！
    train_dataset=preference_data,
    tokenizer=tokenizer,
    args=orpo_config,
)

trainer.train()
# 一步完成 SFT + 偏好对齐` },
];

export default function LessonAlignment() {
  const [methodIdx, setMethodIdx] = useState(0);

  const m = ALIGNMENT_METHODS[methodIdx];

  return (
    <div className="lesson-safety">
      <div className="sf-badge amber">🛡️ module_05 — 对齐工程</div>

      <div className="sf-hero">
        <h1>对齐工程：让 AI 遵循人类意图</h1>
        <p>
          对齐（Alignment）是确保 AI 输出符合人类价值观和意图的核心技术。
          本模块深入<strong>四大对齐方法</strong>——RLHF（产业主流）、DPO（更简单替代）、
          Constitutional AI（自动化对齐）、ORPO（单阶段对齐），
          对比训练复杂度、效果和适用场景。
        </p>
      </div>

      {/* ─── 方法选择 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🎯 四大对齐方法</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {ALIGNMENT_METHODS.map((a, i) => (
            <button key={i} className={`sf-btn ${i === methodIdx ? 'primary' : 'amber'}`}
              onClick={() => setMethodIdx(i)} style={{ fontSize: '0.78rem' }}>
              {a.icon} {a.name}
            </button>
          ))}
        </div>

        <div className="sf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '1.05rem' }}>
              {m.icon} {m.fullname}
            </h3>
            <span className="sf-tag amber">{m.org}</span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 1rem', lineHeight: 1.7 }}>{m.desc}</p>

          {/* 阶段 */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {m.stages.map((s, i) => (
              <div key={i} style={{ flex: '1 1 180px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.3rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>{s.detail}</div>
              </div>
            ))}
          </div>

          {/* 优缺点 */}
          <div className="sf-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#34d399', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>✅ 优势</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {m.pros.map((p, i) => <li key={i} style={{ color: '#94a3b8', padding: '0.15rem 0', fontSize: '0.82rem' }}>{p}</li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>⚠️ 局限</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {m.cons.map((c, i) => <li key={i} style={{ color: '#94a3b8', padding: '0.15rem 0', fontSize: '0.82rem' }}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div className="sf-code-wrap">
            <div className="sf-code-head">
              <span className="sf-code-dot" style={{ background: '#ef4444' }} />
              <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
              <span className="sf-code-dot" style={{ background: '#10b981' }} />
              🐍 {m.name.toLowerCase()}_training.py
            </div>
            <pre className="sf-code">{m.code}</pre>
          </div>
        </div>
      </div>

      {/* ─── 选择指南 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🗺️ 选型决策树</h2>
        <div className="sf-grid-2">
          <div className="sf-alert success">
            <strong>选 DPO 如果：</strong><br/>
            ✅ 有高质量偏好对数据<br/>
            ✅ 计算资源有限（无需 RL）<br/>
            ✅ 追求训练稳定性
          </div>
          <div className="sf-alert warning">
            <strong>选 RLHF 如果：</strong><br/>
            ✅ 需要最极致的对齐效果<br/>
            ✅ 有充足计算和标注资源<br/>
            ✅ 在做 Frontier 模型闭源训练
          </div>
          <div className="sf-alert info">
            <strong>选 CAI 如果：</strong><br/>
            ✅ 需要减少人类标注成本<br/>
            ✅ 能力强的基座模型（能自我批评）<br/>
            ✅ 需要可审计的对齐过程
          </div>
          <div className="sf-alert critical">
            <strong>选 ORPO 如果：</strong><br/>
            ✅ 想一步到位（SFT+对齐）<br/>
            ✅ GPU 内存紧张（无需 ref model）<br/>
            ✅ 小团队快速迭代
          </div>
        </div>
      </div>

      <div className="sf-nav">
        <button className="sf-btn">← 偏见与公平</button>
        <button className="sf-btn amber">AI 法规合规 →</button>
      </div>
    </div>
  );
}
