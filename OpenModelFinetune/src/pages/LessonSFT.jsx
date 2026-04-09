import { useState } from 'react';
import './LessonCommon.css';

const HYPERPARAMS = [
  { name: 'learning_rate', rec: '1e-4 ~ 2e-4', low: '< 5e-5: 学习过慢', high: '> 5e-4: 训练不稳定', tip: 'LoRA 微调比全参数用更大 LR，余弦退火调度效果好' },
  { name: 'num_train_epochs', rec: '2 ~ 5', low: '< 2: 欠拟合', high: '> 8: 过拟合', tip: '数据量越大 epoch 可越少；数据少则需更多 epoch' },
  { name: 'per_device_batch_size', rec: '2 ~ 8', low: '1: 训练不稳定', high: '> 16: 可能 OOM', tip: '配合 gradient_accumulation 等效大 batch，batch=2, accum=8 ≈ batch=16' },
  { name: 'gradient_accumulation', rec: '4 ~ 16', low: '1: 相当于小 batch', high: '> 32: 收益递减', tip: '等效 batch_size = per_device_batch × GPU数 × accumulation_steps' },
  { name: 'warmup_ratio', rec: '0.03 ~ 0.1', low: '0: 可能训练初期震荡', high: '> 0.2: 预热太长', tip: '前3-10%步骤从0到目标LR线性增加，防止灾难性更新' },
  { name: 'max_seq_length', rec: '2048 ~ 4096', low: '< 512: 数据截断损失', high: '> 8192: 显存翻倍', tip: '根据数据实际长度设定；超出截断但不影响主要内容' },
];

const DIAGNOSES = [
  {
    key: 'overfit', label: '过拟合',
    symptoms: ['Train loss 持续降低，Eval loss 从某点开始上升', '模型在训练数据上表现完美，新数据上表现差'],
    fixes: ['减少 epoch数', '增加 lora_dropout(0.05~0.1)', '增加训练数据多样性', '降低 learning_rate'],
    loss_shape: '📉📈（训练降，验证升）',
  },
  {
    key: 'underfit', label: '欠拟合',
    symptoms: ['Train loss 和 Eval loss 都居高不下', '模型无法遵循格式要求，输出乱码'],
    fixes: ['增加 epoch数', '提高 rank（r）', '提高 learning_rate', '检查数据格式是否正确'],
    loss_shape: '📊📊（两者都高且平稳）',
  },
  {
    key: 'catastrophic', label: '灾难性遗忘',
    symptoms: ['微调后领域任务好了，但通用对话能力崩了', '输出格式错误，无法正常对话'],
    fixes: ['减小 rank', '加入通用对话数据混合训练（10-20%）', '降低 learning_rate', '减少训练轮数'],
    loss_shape: '⚠️ 领域 loss 低，但通用能力测评分暴跌',
  },
  {
    key: 'instability', label: '训练不稳定',
    symptoms: ['Loss 剧烈震荡，NaN 出现', '模型权重梯度爆炸'],
    fixes: ['降低 learning_rate（除以10）', '增加 warmup_ratio', '检查数据中是否有特殊字符/编码错误', '启用 gradient_clipping（max_grad_norm=1.0）'],
    loss_shape: '📈📉📈（Loss 震荡剧烈）',
  },
];

export default function LessonSFT() {
  const [diagTab, setDiagTab] = useState('overfit');
  const [paramTab, setParamTab] = useState(0);
  const diag = DIAGNOSES.find(d => d.key === diagTab);

  return (
    <div className="ft-lesson">
      <div className="ft-container">

        <div className="ft-hero">
          <div className="ft-badge">模块四 · SFT Full Pipeline</div>
          <h1>指令微调（SFT）全流程实战</h1>
          <p>从零到出结果：完整的 SFT 训练代码、超参数调优艺术、Loss 曲线解读和常见问题诊断手册——让你第一次微调就能出好结果。</p>
        </div>

        <div className="ft-metrics">
          {[{ v: '3h', l: 'Colab 7B微调时间' }, { v: 'cosine', l: '推荐LR调度' }, { v: 'grad_accum', l: '模拟大batch' }, { v: 'eval_loss', l: '过拟合预警' }].map(m => (
            <div key={m.l} className="ft-metric-card"><div className="ft-metric-value">{m.v}</div><div className="ft-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Full Training Code */}
        <div className="ft-section">
          <h2>🚀 完整 SFT 训练代码（可直接运行）</h2>
          <div className="ft-code">{`# 完整 QLoRA + SFT 训练脚本（基于 Unsloth + TRL）
# 环境：Google Colab Pro / RTX 3090 24GB
# 安装：pip install unsloth trl datasets peft

from unsloth import FastLanguageModel
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset
import torch

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. 加载模型（QLoRA 4-bit）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name   = "unsloth/Qwen2.5-7B-Instruct",  # 换这里选模型
    max_seq_length = 2048,
    load_in_4bit   = True,
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. 配置 LoRA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
model = FastLanguageModel.get_peft_model(
    model,
    r              = 16,          # ↑ 提高质量
    lora_alpha     = 32,          # = 2 * r
    target_modules = ["q_proj", "k_proj", "v_proj",
                       "o_proj", "gate_proj", "up_proj"],
    lora_dropout   = 0,
    use_gradient_checkpointing = "unsloth",
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. 准备数据集（Alpaca 格式）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALPACA_PROMPT = """<|im_start|>system
你是一位专业助手，回答准确、简洁。<|im_end|>
<|im_start|>user
{instruction}

{input}<|im_end|>
<|im_start|>assistant
{output}<|im_end|>"""

def format_dataset(examples):
    texts = []
    for inst, inp, out in zip(
        examples["instruction"],
        examples.get("input", [""] * len(examples["instruction"])),
        examples["output"]
    ):
        texts.append(ALPACA_PROMPT.format(
            instruction=inst, input=inp, output=out
        ) + tokenizer.eos_token)
    return {"text": texts}

dataset = load_dataset("json", data_files="your_data.json", split="train")
dataset = dataset.map(format_dataset, batched=True, remove_columns=dataset.column_names)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. 训练配置（关键超参数）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
trainer = SFTTrainer(
    model=model, tokenizer=tokenizer,
    train_dataset=dataset,
    args=SFTConfig(
        output_dir            = "./sft_output",
        num_train_epochs      = 3,
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 8,     # 等效 batch=16
        warmup_ratio          = 0.05,
        learning_rate         = 2e-4,
        lr_scheduler_type     = "cosine",    # 余弦退火
        logging_steps         = 10,
        save_strategy         = "epoch",
        eval_strategy         = "epoch",     # 监控过拟合
        load_best_model_at_end= True,
        bf16                  = True,
        max_grad_norm         = 1.0,         # 梯度裁剪防爆炸
        dataset_text_field    = "text",
    ),
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. 开始训练！
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
trainer.train()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. 保存（合并 LoRA 权重）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
model.save_pretrained_merged(
    "merged_model",
    tokenizer,
    save_method = "merged_16bit",  # 合并为完整模型
)
# 或保存 GGUF 格式直接用 Ollama
model.save_pretrained_gguf("model_gguf", tokenizer, quantization_method="q4_k_m")`}</div>
        </div>

        {/* Hyperparameter Guide */}
        <div className="ft-section">
          <h2>⚙️ 超参数调优指南</h2>
          <div className="ft-tabs">
            {HYPERPARAMS.map((p, i) => <button key={i} className={`ft-tab${paramTab === i ? ' active' : ''}`} onClick={() => setParamTab(i)}><span className="ft-ic" style={{ fontSize: '.7rem' }}>{p.name.split('_')[0]}</span></button>)}
          </div>
          {(() => {
            const p = HYPERPARAMS[paramTab];
            return (
              <div className="ft-card" style={{ borderColor: 'var(--ft-primary)' }}>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--ft-accent)', fontWeight: 700, fontSize: '1rem', marginBottom: '.5rem' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
                  <span className="ft-tag">推荐值：{p.rec}</span>
                </div>
                <div style={{ fontSize: '.84rem', color: 'var(--ft-muted)', marginBottom: '.75rem' }}>{p.tip}</div>
                <div className="ft-grid-2">
                  <div className="ft-warn" style={{ margin: 0 }}>⬇️ <span><strong>过低：</strong>{p.low}</span></div>
                  <div className="ft-good" style={{ margin: 0 }}>⬆️ <span><strong>过高：</strong>{p.high}</span></div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Diagnosis Guide */}
        <div className="ft-section">
          <h2>🩺 训练问题诊断手册</h2>
          <div className="ft-tabs">
            {DIAGNOSES.map(d => <button key={d.key} className={`ft-tab${diagTab === d.key ? ' active' : ''}`} onClick={() => setDiagTab(d.key)}>{d.label}</button>)}
          </div>
          {diag && (
            <div>
              <div className="ft-tip">📊 <span><strong>Loss 特征：</strong>{diag.loss_shape}</span></div>
              <div className="ft-grid-2" style={{ marginTop: '.75rem' }}>
                <div className="ft-card">
                  <div className="ft-card-title" style={{ color: 'var(--ft-rose)' }}>🔍 症状</div>
                  <ul style={{ margin: '.5rem 0 0', paddingLeft: '1.2rem', color: 'var(--ft-muted)', fontSize: '.85rem', lineHeight: 2 }}>
                    {diag.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="ft-card">
                  <div className="ft-card-title" style={{ color: 'var(--ft-green)' }}>🔧 修复方案</div>
                  <ul style={{ margin: '.5rem 0 0', paddingLeft: '1.2rem', color: 'var(--ft-muted)', fontSize: '.85rem', lineHeight: 2 }}>
                    {diag.fixes.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inference Code */}
        <div className="ft-section">
          <h2>🧪 训练后推理验证</h2>
          <div className="ft-code">{`# 微调完成后，快速验证效果
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    "merged_model", max_seq_length=2048, load_in_4bit=True
)
FastLanguageModel.for_inference(model)  # 开启 2x 推理加速

def chat(instruction, input_text=""):
    prompt = ALPACA_PROMPT.format(
        instruction=instruction, input=input_text, output=""
    )
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    outputs = model.generate(
        **inputs,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
    )
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response.split("<|im_start|>assistant\\n")[-1]

# 对比微调前后效果
print("微调后：", chat("用 Python 实现快速排序", ""))

# 批量评估：在验证集上跑一遍，人工抽查 20-30 个样本
# 重点关注：格式是否符合、内容是否准确、风格是否一致`}</div>
        </div>

      </div>
    </div>
  );
}
