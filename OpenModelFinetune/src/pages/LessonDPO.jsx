import { useState } from 'react';
import './LessonCommon.css';

const METHODS = [
  {
    key: 'dpo', name: 'DPO（直接偏好优化）', year: '2023',
    desc: '将 RLHF 的复杂 RL 流程简化为一个分类损失，无需独立的 Reward Model，训练稳定。目前最常用的对齐方法。',
    pros: ['无需训练 Reward Model', '训练稳定，不易崩溃', '超参数简单（只有 β）', 'TRL 原生支持'],
    cons: ['需要高质量 chosen/rejected 对', '无法在线生成新数据', '改进幅度有上限'],
    code: `from trl import DPOTrainer, DPOConfig
from datasets import Dataset

# DPO 数据格式：chosen/rejected 对
dpo_data = [
    {
        "prompt": "解释机器学习中的过拟合",
        "chosen": "过拟合是指模型在训练集上表现很好，但在新数据上表现差。原因是模型过度记忆了训练数据的噪声。解决方法：正则化、Dropout、增加数据量。",
        "rejected": "过拟合就是模型学太多了，然后就不好了。"
    },
    # ... 更多对
]

dataset = Dataset.from_list(dpo_data)

# DPO 训练器
trainer = DPOTrainer(
    model=model,             # SFT 微调后的模型
    ref_model=ref_model,     # 参考模型（原始 SFT 模型，冻结）
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=DPOConfig(
        beta=0.1,            # KL 惩罚系数，越大越保守
        max_length=1024,
        learning_rate=5e-7,  # DPO 比 SFT 用更小 LR
        num_train_epochs=1,  # DPO 通常只需 1-2 epoch
        output_dir="dpo_output",
        bf16=True,
    ),
)
trainer.train()

# DPO 损失函数（理解用）：
# L_DPO = -E[log σ(β * (log π/π_ref(chosen) - log π/π_ref(rejected)))]
# 直觉：让模型对 chosen 的偏好比 rejected 高（由 β 控制强度）`,
  },
  {
    key: 'orpo', name: 'ORPO（无参考偏好优化）', year: '2024',
    desc: '在 SFT 损失中直接加入 Odds Ratio 偏好项，无需参考模型，节省 50% 显存，SFT + 对齐一步完成。',
    pros: ['无需参考模型（省 50% 显存）', 'SFT + 对齐合并训练', '适合资源受限场景'],
    cons: ['相比 DPO 改进幅度稍小', '需要 SFT 格式 + chosen/rejected'],
    code: `from trl import ORPOTrainer, ORPOConfig

# ORPO：SFT + DPO 一步到位
trainer = ORPOTrainer(
    model=model,              # 基础模型（不需要参考模型！）
    tokenizer=tokenizer,
    train_dataset=dataset,   # 同 DPO 数据格式
    args=ORPOConfig(
        lambda_=0.1,          # 偏好权重（类似 DPO 的 beta）
        max_length=1024,
        learning_rate=8e-6,
        num_train_epochs=3,   # 比 DPO 需要更多 epoch
        output_dir="orpo_output",
    ),
)
trainer.train()
# 总结：资源不足或想简化流程时，首选 ORPO`,
  },
  {
    key: 'rlhf', name: 'RLHF（完整版）', year: '2022',
    desc: '经典三阶段：SFT → Reward Model 训练 → PPO 强化学习。效果最强但流程复杂，适合有足够计算资源的团队。',
    pros: ['理论上效果最强', '可以在线生成数据', 'ChatGPT 原始技术路线'],
    cons: ['需要 3 个模型', 'PPO 训练极易不稳定', '计算成本高 3-4x', '调参极复杂'],
    code: `# RLHF 三阶段完整流程
# 阶段 1：SFT（已完成）
# model_sft = 上一模块训练完成的 SFT 模型

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 阶段 2：训练 Reward Model
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
from trl import RewardTrainer, RewardConfig

reward_trainer = RewardTrainer(
    model=model_for_rm,      # 在 SFT 模型上加线性头
    tokenizer=tokenizer,
    train_dataset=preference_dataset,  # chosen/rejected 对
    args=RewardConfig(
        output_dir="reward_model",
        per_device_train_batch_size=4,
        num_train_epochs=1,
        max_length=512,
    ),
)
reward_trainer.train()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 阶段 3：PPO 强化学习
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
from trl import PPOTrainer, PPOConfig, AutoModelForCausalLMWithValueHead

ppo_model = AutoModelForCausalLMWithValueHead.from_pretrained("model_sft")
ref_model  = AutoModelForCausalLMWithValueHead.from_pretrained("model_sft")

ppo_config = PPOConfig(
    model_name="model_sft",
    learning_rate=1e-5,
    batch_size=16,
    mini_batch_size=4,
    kl_penalty="kl",         # KL 散度惩罚防止偏离太多
    init_kl_coef=0.2,
    adap_kl_ctrl=True,       # 自适应 KL 系数
)

ppo_trainer = PPOTrainer(ppo_config, ppo_model, ref_model,
                          tokenizer, reward_model=reward_model)
# 警告：PPO 需要大量 GPU 资源和调参经验，新手建议先用 DPO！`,
  },
];

const PREF_DATA_GUIDE = `# 高质量偏好数据集构建（进阶版）

# 方法一：强弱模型对比（最简单）
# GPT-4 生成 chosen，GPT-3.5 生成 rejected
for prompt in prompts:
    chosen   = gpt4(prompt)      # 强模型 → chosen
    rejected = gpt35(prompt)     # 弱模型 → rejected
    pairs.append({"prompt": prompt, "chosen": chosen, "rejected": rejected})

# 方法二：同一模型多次采样 + 人工排序
for prompt in prompts:
    candidates = [model(prompt, temperature=0.8) for _ in range(4)]
    # 人工或 GPT-4 对 4 个候选排序
    chosen, rejected = best(candidates), worst(candidates)

# 方法三：Constitutional AI（Claude 使用的方法）
# 1. 让模型生成响应
# 2. 用 AI 根据宪法原则（无害、诚实、有帮助）评判
# 3. 让模型修改不符合原则的响应
# 4. 原响应=rejected，修改后=chosen

# 数据质量关键：
# ✅ chosen 和 rejected 的差异要清晰可辨
# ✅ 每个 prompt 都要有明确的"好"和"差"的标准
# ❌ 避免两个回答都很好或都很差（模型难以学习）`;

export default function LessonDPO() {
  const [method, setMethod] = useState('dpo');
  const m = METHODS.find(x => x.key === method);

  return (
    <div className="ft-lesson">
      <div className="ft-container">

        <div className="ft-hero">
          <div className="ft-badge">模块五 · Preference Alignment</div>
          <h1>偏好对齐 — DPO & RLHF 实战</h1>
          <p>SFT 让模型"知道怎么做"，对齐让模型"知道应该怎么做"。掌握 DPO（最常用）、ORPO（最省资源）、RLHF（最强效果）三条技术路线。</p>
        </div>

        <div className="ft-metrics">
          {[{ v: 'DPO', l: '首选对齐方法' }, { v: 'β=0.1', l: 'KL散度系数' }, { v: '1epoch', l: 'DPO通常足够' }, { v: 'chosen', l: '偏好数据核心' }].map(m => (
            <div key={m.l} className="ft-metric-card"><div className="ft-metric-value">{m.v}</div><div className="ft-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Alignment Roadmap */}
        <div className="ft-section">
          <h2>🗺️ 对齐技术路线选择</h2>
          <div className="ft-table-wrap">
            <table className="ft-table">
              <thead><tr><th>方法</th><th>显存需求</th><th>数据难度</th><th>训练稳定性</th><th>效果上限</th><th>推荐场景</th></tr></thead>
              <tbody>
                {[
                  ['DPO', '2x SFT', '中（需质量对）', '⭐⭐⭐⭐', '⭐⭐⭐⭐', '90%场景首选'],
                  ['ORPO', '1x SFT', '中', '⭐⭐⭐⭐⭐', '⭐⭐⭐', '资源受限，一步到位'],
                  ['RLHF+PPO', '4x SFT', '高（需RM）', '⭐⭐', '⭐⭐⭐⭐⭐', '追求极限效果'],
                  ['SimPO (2024)', '1.5x SFT', '中', '⭐⭐⭐⭐', '⭐⭐⭐⭐', 'DPO改进版，无ref模型'],
                ].map(([name, vram, data, stable, effect, rec], i) => (
                  <tr key={i}>
                    <td><span className="ft-tag">{name}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.8rem', color: 'var(--ft-cyan)' }}>{vram}</td>
                    <td style={{ fontSize: '.83rem' }}>{data}</td>
                    <td>{stable}</td>
                    <td>{effect}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--ft-accent)' }}>{rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Method Deep Dive */}
        <div className="ft-section">
          <h2>⚙️ 方法详解 & 实战代码</h2>
          <div className="ft-tabs">
            {METHODS.map(x => <button key={x.key} className={`ft-tab${method === x.key ? ' active' : ''}`} onClick={() => setMethod(x.key)}>{x.name.split('（')[0]}</button>)}
          </div>
          {m && (
            <div>
              <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem' }}>
                <span className="ft-tag">发布年份：{m.year}</span>
              </div>
              <p style={{ color: 'var(--ft-muted)', fontSize: '.88rem', lineHeight: 1.7, marginBottom: '1rem' }}>{m.desc}</p>
              <div className="ft-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="ft-card">
                  <div className="ft-card-title" style={{ color: 'var(--ft-green)' }}>✅ 优势</div>
                  <ul style={{ margin: '.4rem 0 0', paddingLeft: '1.2rem', color: 'var(--ft-muted)', fontSize: '.84rem', lineHeight: 2 }}>
                    {m.pros.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div className="ft-card">
                  <div className="ft-card-title" style={{ color: 'var(--ft-rose)' }}>⚠️ 局限</div>
                  <ul style={{ margin: '.4rem 0 0', paddingLeft: '1.2rem', color: 'var(--ft-muted)', fontSize: '.84rem', lineHeight: 2 }}>
                    {m.cons.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
              <div className="ft-code">{m.code}</div>
            </div>
          )}
        </div>

        {/* Preference Data Guide */}
        <div className="ft-section">
          <h2>📊 偏好数据集构建（三种方法）</h2>
          <div className="ft-code">{PREF_DATA_GUIDE}</div>
          <div className="ft-good">✅ <span><strong>最低数据量：</strong>DPO 有效果通常需要 500-2000 对高质量 chosen/rejected，质量远比数量重要。每对数据的差异必须清晰可辨，模糊的对比不如不加。</span></div>
        </div>

      </div>
    </div>
  );
}
