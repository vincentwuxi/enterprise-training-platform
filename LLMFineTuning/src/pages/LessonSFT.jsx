import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Copy, CheckCircle2, PlayCircle } from 'lucide-react';
import './LessonCommon.css';

const SFT_PROCESS = [
  { step: '1', title: '准备数据集', detail: '将数据转换为模型要求的格式，划分 train/val/test，推荐 8:1:1', icon: '📊' },
  { step: '2', title: '加载底座模型', detail: '选择合适规模（7B/13B/70B）和适合任务的底座，用 transformers 加载权重', icon: '🤖' },
  { step: '3', title: '配置训练参数', detail: '学习率、batch size、epoch、最大序列长度、warmup 步数', icon: '⚙️' },
  { step: '4', title: '开始训练', detail: '监控 training loss 和 validation loss 曲线，避免过拟合', icon: '🚀' },
  { step: '5', title: '保存 Checkpoint', detail: '定期保存权重，取 validation loss 最低时的 checkpoint', icon: '💾' },
  { step: '6', title: '评估与推理', detail: '在测试集上评估，与底座模型对比效果', icon: '🎯' },
];

const HYPERPARAMS = [
  {
    name: 'learning_rate',
    typical: '1e-4 ~ 2e-4',
    effect: '过高：训练不稳定（loss 振荡）；过低：收敛太慢',
    tips: '使用余弦退火（cosine annealing）调度，配合 warmup_ratio=0.1',
    color: '#0ea5e9',
  },
  {
    name: 'per_device_train_batch_size',
    typical: '1~8（取决于 GPU 显存）',
    effect: '太小训练噪声大；结合 gradient_accumulation 等效扩大 batch',
    tips: '显存不足时先减 batch_size，再开 gradient_checkpointing',
    color: '#06b6d4',
  },
  {
    name: 'num_train_epochs',
    typical: '1~5',
    effect: '太少欠拟合；太多过拟合（val loss 上升）',
    tips: '1,000 条数据通常 3 epoch 足够；大数据集 1-2 epoch',
    color: '#0891b2',
  },
  {
    name: 'max_seq_length',
    typical: '512~4096',
    effect: '需覆盖最长样本；超出部分截断（影响长文本样本）',
    tips: '先分析数据集的 token 长度分布，取 P95 作为 max_length',
    color: '#7c3aed',
  },
  {
    name: 'warmup_ratio',
    typical: '0.05~0.15',
    effect: '训练初期 LR 从 0 线性升到目标值，稳定早期训练',
    tips: '短训练（<1000 steps）可设 0.1；长训练可适当降低',
    color: '#2563eb',
  },
];

const CODE_FULL = `from transformers import (
    AutoModelForCausalLM, 
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import load_dataset

# === 1. 加载底座模型 ===
model_name = "Qwen/Qwen2.5-7B-Instruct"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# === 2. 加载并预处理数据集 ===
dataset = load_dataset("json", data_files="train.jsonl")

def format_alpaca(example):
    if example["input"]:
        prompt = f"### Instruction:\\n{example['instruction']}\\n\\n### Input:\\n{example['input']}\\n\\n### Response:\\n"
    else:
        prompt = f"### Instruction:\\n{example['instruction']}\\n\\n### Response:\\n"
    return {"text": prompt + example["output"] + tokenizer.eos_token}

dataset = dataset.map(format_alpaca)

# === 3. 配置训练参数 ===
training_args = TrainingArguments(
    output_dir="./output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,   # 等效 batch=16
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_ratio=0.1,
    fp16=True,                        # 半精度训练
    logging_steps=10,
    save_strategy="epoch",
    evaluation_strategy="epoch",
    load_best_model_at_end=True,
)

# === 4. 开始训练 ===
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    data_collator=DataCollatorForLanguageModeling(
        tokenizer, mlm=False
    ),
)
trainer.train()

# === 5. 保存模型 ===
trainer.save_model("./output/best_model")`;

const LOSS_PROBLEMS = [
  { curve: '📉📉 Train↓ Val↓', desc: '正常收敛', status: 'good', action: '继续训练' },
  { curve: '📉↔️ Train↓ Val→', desc: '过拟合早期', status: 'warn', action: '降低 epoch，增加数据多样性' },
  { curve: '📉📈 Train↓ Val↑', desc: '严重过拟合', status: 'bad', action: '回滚到 val_loss 最低 checkpoint' },
  { curve: '📈📈 Train↑ Val↑', desc: 'LR 过高', status: 'bad', action: '降低 10x learning_rate，从头开始' },
  { curve: '→→ Train→ Val→', desc: 'LR 过低/数据问题', status: 'warn', action: '提高 LR，检查数据格式' },
];

export default function LessonSFT() {
  const navigate = useNavigate();
  const [activeParam, setActiveParam] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(CODE_FULL);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">⚙️ 模块三：全量微调篇</div>
        <h1>Supervised Fine-Tuning (SFT)</h1>
        <p className="lesson-intro">
          SFT 是最直接的微调方式：用输入-输出对明确告诉模型"在这个任务里，正确答案是什么"。这节课覆盖完整 SFT 管道、关键超参数解析和 Loss 曲线诊断。
        </p>
      </header>

      {/* Process */}
      <section className="lesson-section">
        <h3 className="mb-4">🔄 SFT 完整流程（6 步）</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {SFT_PROCESS.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-sky-500/30 transition-all">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-sky-600 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{s.step}</span>
                <h4 className="font-bold text-white text-sm">{s.title}</h4>
              </div>
              <p className="text-xs text-slate-500">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hyperparameters */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">🎛️ 关键超参数调优指南（点击参数名）</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {HYPERPARAMS.map((p, i) => (
            <button key={i} onClick={() => setActiveParam(i)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all border"
              style={{
                background: activeParam === i ? p.color + '20' : 'rgba(15,23,42,0.8)',
                borderColor: activeParam === i ? p.color + '60' : '#334155',
                color: activeParam === i ? '#f0f9ff' : '#64748b'
              }}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="p-4 rounded-xl border" style={{borderColor: HYPERPARAMS[activeParam].color + '40', background: HYPERPARAMS[activeParam].color + '08'}}>
          <div className="flex items-center gap-3 mb-3">
            <code className="text-sky-300 font-bold">{HYPERPARAMS[activeParam].name}</code>
            <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">典型值: {HYPERPARAMS[activeParam].typical}</span>
          </div>
          <p className="text-sm text-slate-300 mb-2">⚠️ 影响: {HYPERPARAMS[activeParam].effect}</p>
          <p className="text-sm text-emerald-300">💡 技巧: {HYPERPARAMS[activeParam].tips}</p>
        </div>
      </section>

      {/* Loss Diagnosis */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">📉 Loss 曲线诊断手册</h3>
        <div className="space-y-2">
          {LOSS_PROBLEMS.map((p, i) => (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${p.status === 'good' ? 'border-emerald-500/20 bg-emerald-900/8' : p.status === 'warn' ? 'border-yellow-500/20 bg-yellow-900/8' : 'border-red-500/20 bg-red-900/8'}`}>
              <code className="text-base w-44 shrink-0 text-slate-300">{p.curve}</code>
              <span className={`text-sm flex-1 ${p.status === 'good' ? 'text-emerald-300' : p.status === 'warn' ? 'text-yellow-300' : 'text-red-300'}`}>{p.desc}</span>
              <span className="text-xs text-slate-500 text-right">{p.action}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Code */}
      <section className="lesson-section mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3>🐍 完整 SFT 训练代码（HuggingFace Transformers）</h3>
          <button onClick={() => setShowCode(!showCode)} className="text-xs text-sky-400 border border-sky-500/30 px-3 py-1 rounded-lg hover:bg-sky-900/20 transition-all">
            {showCode ? '收起' : '展开代码'}
          </button>
        </div>
        {showCode && (
          <div className="relative fade-in">
            <pre className="code-block text-xs leading-relaxed max-h-96 overflow-y-auto">{CODE_FULL}</pre>
            <button onClick={copyCode} className="absolute top-3 right-3 bg-sky-900/60 hover:bg-sky-700 text-sky-300 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-all">
              {copied ? <><CheckCircle2 size={11}/> 已复制</> : <><Copy size={11}/> 复制</>}
            </button>
          </div>
        )}
        {!showCode && (
          <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl flex items-center gap-3 cursor-pointer hover:border-sky-500/30" onClick={() => setShowCode(true)}>
            <PlayCircle size={20} className="text-sky-400"/>
            <p className="text-sm text-slate-400">点击展开：包含数据加载、模型配置、训练循环的完整可运行代码</p>
          </div>
        )}
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/llm-finetuning-mastery/lesson/peft')}>
          SFT 掌握！进入 LoRA/QLoRA 高效微调 →
        </button>
      </section>
    </div>
  );
}
