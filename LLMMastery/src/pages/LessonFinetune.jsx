import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// LoRA 参数计算器
function LoraCalculator() {
  const [baseModel, setBaseModel] = useState('7B');
  const [rank, setRank] = useState(16);
  const [alpha, setAlpha] = useState(32);

  const MODEL_PARAMS = { '1B': 1, '7B': 7, '13B': 13, '70B': 70, '72B': 72 };
  const totalB = MODEL_PARAMS[baseModel] * 1e9;
  const scale = alpha / rank;
  // Approximate LoRA trainable params: 2 * r * d for each attention layer
  // Assume ~32 layers, d_model ~ sqrt(params/4)
  const dModel = Math.round(Math.sqrt(totalB / 4));
  const numLayers = baseModel === '70B' || baseModel === '72B' ? 80 : baseModel === '13B' ? 40 : 32;
  const loraParams = Math.round(2 * rank * dModel * numLayers * 4 / 1e6); // 4 matrices (q,k,v,o)
  const ratio = (loraParams / (totalB / 1e6) * 100).toFixed(2);
  const trainableGB = (loraParams * 4 / 1024).toFixed(2); // fp32
  const baseGB = Math.round(totalB * 2 / 1e9); // bf16
  const gpuNeeded = baseModel === '70B' || baseModel === '72B' ? '4×A100 80G' : baseModel === '13B' ? '2×A100 40G' : '1×A100 40G';

  return (
    <div className="ai-interactive">
      <h3>🔢 LoRA 参数计算器（交互式）</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#3b2d6b', marginBottom: '0.3rem' }}>基础模型</div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {Object.keys(MODEL_PARAMS).map(m => (
              <button key={m} onClick={() => setBaseModel(m)}
                style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: `1px solid ${baseModel === m ? '#a78bfa60' : 'rgba(255,255,255,0.07)'}`, background: baseModel === m ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)', color: baseModel === m ? '#a78bfa' : '#3b2d6b' }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: '0.75rem', color: '#3b2d6b', marginBottom: '0.3rem' }}>LoRA Rank r = {rank}（越大=更多参数=更强修改力，通常 8-64）</div>
          <input type="range" min={4} max={128} step={4} value={rank} onChange={e => setRank(+e.target.value)}
            style={{ width: '100%', accentColor: '#8b5cf6' }} />
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: '0.75rem', color: '#3b2d6b', marginBottom: '0.3rem' }}>Alpha α = {alpha}（缩放系数，通常 = 2×rank）</div>
          <input type="range" min={4} max={256} step={4} value={alpha} onChange={e => setAlpha(+e.target.value)}
            style={{ width: '100%', accentColor: '#10b981' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.5rem' }}>
        {[
          { label: '可训练参数', value: `${loraParams}M`, hint: `占总量 ${ratio}%`, color: '#a78bfa' },
          { label: '训练显存需求', value: trainableGB + ' GB', hint: `基础模型 ${baseGB}GB（bf16）`, color: '#10b981' },
          { label: '推荐 GPU 配置', value: gpuNeeded, hint: '使用 DeepSpeed / FSDP', color: '#f59e0b' },
          { label: 'LoRA 缩放因子', value: `α/r = ${scale.toFixed(1)}`, hint: '控制学习强度', color: '#38bdf8' },
        ].map(item => (
          <div key={item.label} style={{ padding: '0.75rem', borderRadius: '8px', border: `1px solid ${item.color}25`, background: `${item.color}06`, textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#3b2d6b', marginBottom: '0.2rem' }}>{item.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: item.color, fontFamily: 'JetBrains Mono' }}>{item.value}</div>
            <div style={{ fontSize: '0.65rem', color: '#3b2d6b', marginTop: '0.15rem' }}>{item.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FINETUNE_METHODS = [
  {
    name: '全量微调\n(Full SFT)', icon: '🏋️', color: '#f87171',
    when: '有 A100×8+ 集群，且需要大幅改变模型行为', cost: '极高（数千GPU小时）',
    code: `# 全量微调：更新所有参数（通常不现实，仅大厂能做）
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=8,  # 等效 batch=32
    learning_rate=2e-5,
    bf16=True,                  # bfloat16 混合精度
    deepspeed="ds_config.json", # DeepSpeed ZeRO-3 分片
    save_steps=500,
)
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)
trainer.train()` },
  {
    name: 'LoRA 微调', icon: '🪡', color: '#a78bfa',
    when: '主流选择。单卡 A100 即可微调 7B-13B 模型', cost: '中（数十GPU小时）',
    code: `from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
import torch

# LoRA：只在注意力层插入低秩矩阵，冻结原始权重
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,               # LoRA rank
    lora_alpha=32,      # 缩放因子 α/r = 2
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: 85M || all params: 7.2B (1.18%)

# 训练后合并（推理时无额外开销）
merged = model.merge_and_unload()` },
  {
    name: 'QLoRA', icon: '💎', color: '#10b981',
    when: '单卡消费级 GPU（RTX 3090/4090 24GB）微调 7B-13B', cost: '低（几十美元云GPU）',
    code: `# QLoRA：4-bit 量化基础模型 + LoRA 微调
# 70B 模型可在单张 A100 80G 卡上微调！
from transformers import BitsAndBytesConfig
from trl import SFTTrainer

# 4-bit NF4 量化（精度损失极小）
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,  # 双重量化进一步节省显存
    bnb_4bit_quant_type="nf4",       # NF4（NormalFloat4）精度最优
    bnb_4bit_compute_dtype=torch.bfloat16,
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-70B-Instruct",
    quantization_config=bnb_config,  # 4bit加载
    device_map="auto",
)

# 使用 LoRA 只训练少量参数
model = get_peft_model(model, lora_config)

trainer = SFTTrainer(
    model=model, dataset_text_field="text",
    max_seq_length=2048,
    # 消费级显卡必备：梯度检查点（用计算换显存）
    args=TrainingArguments(gradient_checkpointing=True, ...)
)` },
  {
    name: 'DPO 对齐', icon: '🎯', color: '#f59e0b',
    when: '有偏好对数据（chosen vs rejected），替代 RLHF 的高效对齐方案', cost: '中（比 RLHF 便宜得多）',
    code: `# DPO (Direct Preference Optimization)：无需奖励模型
# 直接从偏好对 (chosen, rejected) 学习
from trl import DPOTrainer, DPOConfig

# 数据格式：成对比较
# {"prompt": "...", "chosen": "好的回答", "rejected": "坏的回答"}

dpo_config = DPOConfig(
    beta=0.1,           # KL 散度惩罚系数（越大越保守）
    loss_type="sigmoid", # 原始 DPO loss
    learning_rate=5e-7,  # 比 SFT 更小的学习率
    num_train_epochs=3,
)

dpo_trainer = DPOTrainer(
    model=sft_model,     # 基于 SFT 后的模型继续对齐
    ref_model=None,      # None = 使用初始化时的模型作为参考
    args=dpo_config,
    train_dataset=preference_dataset,  # chosen/rejected 对
    tokenizer=tokenizer,
)

dpo_trainer.train()
# 效果：比 PPO（RLHF）更稳定，不需要额外的 Reward Model
# DPO 已成为 Llama-3/Mistral 等模型对齐的主流方案` },
];

export default function LessonFinetune() {
  const navigate = useNavigate();
  const [activeMethod, setActiveMethod] = useState(1); // Default LoRA

  const m = FINETUNE_METHODS[activeMethod];

  return (
    <div className="lesson-ai">
      <div className="ai-badge pink">🧬 module_06 — Fine-tuning</div>
      <div className="ai-hero">
        <h1>Fine-tuning：LoRA / QLoRA / DPO 微调实战</h1>
        <p>微调让通用大模型变成<strong>你的专属模型</strong>：特定领域知识、特定输出风格、特定语言能力。<strong>LoRA</strong> 通过低秩近似，只用1%的参数让模型学会新技能，是当前最主流方案。</p>
      </div>

      {/* LoRA 参数计算器 */}
      <LoraCalculator />

      {/* 微调方法 */}
      <div className="ai-section">
        <h2 className="ai-section-title">⚙️ 微调方法（点击查看代码）</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {FINETUNE_METHODS.map((method, i) => (
            <button key={i} onClick={() => setActiveMethod(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'pre-line', transition: 'all 0.2s',
                border: `1px solid ${activeMethod === i ? method.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeMethod === i ? `${method.color}10` : 'rgba(255,255,255,0.02)',
                color: activeMethod === i ? method.color : '#3b2d6b' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.15rem' }}>{method.icon}</div>
              {method.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, padding: '0.6rem 0.875rem', background: `${m.color}08`, borderRadius: '8px', border: `1px solid ${m.color}20`, fontSize: '0.78rem', color: '#3b2d6b' }}>
            <span style={{ color: m.color, fontWeight: 700 }}>适用场景：</span>{m.when}
          </div>
          <div style={{ padding: '0.6rem 0.875rem', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.78rem', color: '#3b2d6b' }}>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>成本：</span>{m.cost}
          </div>
        </div>

        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} />
            <div className="ai-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ai-code-dot" style={{ background: m.color }} />
            <span style={{ marginLeft: '0.5rem', color: m.color }}>{m.icon} {m.name.replace('\n', ' ')} — Python / HuggingFace</span>
          </div>
          <div className="ai-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflowY: 'auto' }}>{m.code}</div>
        </div>
      </div>

      {/* 数据集准备 */}
      <div className="ai-section">
        <h2 className="ai-section-title">📊 微调数据集规范（质量 &gt;&gt; 数量）</h2>
        <div className="ai-grid-2">
          {[
            { title: 'SFT 指令数据格式', code: `{"messages": [\n  {"role": "system", "content": "你是医疗助手"},\n  {"role": "user", "content": "头痛怎么办？"},\n  {"role": "assistant", "content": "头痛可能由..."}\n]}`, color: '#a78bfa' },
            { title: 'DPO 偏好对格式', code: `{"prompt": "解释量子纠缠",\n "chosen": "量子纠缠是...[准确详细]",\n "rejected": "量子纠缠就是...[简陋错误]"}`, color: '#10b981' },
          ].map(item => (
            <div key={item.title} className="ai-card" style={{ borderColor: `${item.color}25`, padding: '1rem' }}>
              <div style={{ fontWeight: 700, color: item.color, fontSize: '0.82rem', marginBottom: '0.5rem' }}>{item.title}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#a7f3d0', background: '#020010', padding: '0.5rem', borderRadius: '6px', whiteSpace: 'pre' }}>{item.code}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['SFT最少500条高质量数据', 'DPO需要成对chosen/rejected数据', '数据质量 >> 数据量（1000精标>100万噪声）', '用GPT-4生成并人工标注（SOTA实践）'].map(t => (
            <span key={t} className="ai-tag purple" style={{ fontSize: '0.72rem' }}>ℹ️ {t}</span>
          ))}
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/llm-dev/lesson/agent')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/llm-dev/lesson/deploy')}>下一模块：部署与优化 →</button>
      </div>
    </div>
  );
}
