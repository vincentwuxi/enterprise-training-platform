import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

const RLHF_STAGES = [
  {
    stage: '阶段 1', name: 'SFT（监督微调）',
    desc: '用高质量的人工标注对话数据对预训练模型进行指令微调',
    input: '< instruction, response > 对', output: 'SFT 模型', color: '#0ea5e9',
    detail: '这是对话模型的基础，让模型学会遵循指令的基本格式和风格'
  },
  {
    stage: '阶段 2', name: '训练奖励模型 (RM)',
    desc: '收集人类对多个模型输出的排名偏好，训练一个能预测人类偏好的奖励模型',
    input: '同一 prompt 的多个回复 + 人类排名', output: '奖励模型 (RM)', color: '#06b6d4',
    detail: 'RM 学会给每个输出打分：越符合人类期待（安全、有帮助、诚实）分越高'
  },
  {
    stage: '阶段 3', name: 'PPO 强化学习',
    desc: '用 PPO 算法以奖励模型为反馈信号，持续优化 SFT 模型的输出策略',
    input: 'SFT 模型 + RM', output: 'RLHF 对齐模型', color: '#7c3aed',
    detail: '同时加入 KL 散度惩罚，防止模型偏离 SFT 底座太远（避免奖励 hacking）'
  },
];

const DPO_COMPARISON = {
  rlhf: {
    name: 'RLHF (PPO)',
    pros: ['理论上限最高', '可以用 AI 反馈替代人类反馈 (RLAIF)', '已被 GPT-4、Claude 等顶级模型验证'],
    cons: ['训练复杂，需要 4 个模型同时在 GPU 上', '超参数敏感，容易不稳定', '工程成本极高，需要大量平台支持'],
    cost: '极高',
    stability: '⭐⭐',
  },
  dpo: {
    name: 'DPO',
    pros: ['无需奖励模型，大幅简化流程', '等价于隐式 RL，理论严格', '实践效果与 RLHF 可比甚至更好'],
    cons: ['对训练数据质量要求高', '数据分布敏感', '不能在线学习（offline only）'],
    cost: '中',
    stability: '⭐⭐⭐⭐',
  }
};

const PREFERENCE_DATA_EXAMPLE = {
  prompt: '用一句话解释量子纠缠',
  chosen: '量子纠缠是指两个粒子无论相距多远，测量其中一个会立即影响另一个的状态——这是量子力学中最神奇的现象之一。',
  rejected: '量子纠缠是量子力学的一个概念，粒子之间存在关联，这是爱因斯坦称为"幽灵般的超距作用"的现象，在量子计算中有重要应用，同时也在量子通信和量子密钥分发等领域发挥重要作用。',
  chosenWhy: '简洁清晰，覆盖核心概念，一句话收束',
  rejectedWhy: '冗长，"一句话"要求未遵循，堆砌信息',
};

const DPO_CODE = `from trl import DPOTrainer, DPOConfig
from transformers import AutoModelForCausalLM, AutoTokenizer

# 加载 SFT 底座模型（必须先完成 SFT 阶段）
model = AutoModelForCausalLM.from_pretrained("./sft_model")
tokenizer = AutoTokenizer.from_pretrained("./sft_model")

# 参考模型（用于 KL 散度计算，与训练模型相同但冻结）
ref_model = AutoModelForCausalLM.from_pretrained("./sft_model")

# DPO 训练配置
dpo_config = DPOConfig(
    output_dir="./dpo_output",
    beta=0.1,                # KL 散度系数，越大越保守（推荐 0.1-0.5）
    learning_rate=5e-7,      # DPO 比 SFT LR 小 10-100x
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    num_train_epochs=1,      # DPO 通常只需 1-3 epoch
    max_length=1024,
    max_prompt_length=512,
)

# DPO 数据格式：{"prompt": ..., "chosen": ..., "rejected": ...}
trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,
    args=dpo_config,
    train_dataset=dpo_dataset,
    tokenizer=tokenizer,
)
trainer.train()`;

export default function LessonRLHF() {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(null);
  const [activeTab, setActiveTab] = useState('rlhf');
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">❤️ 模块五：偏好对齐篇</div>
        <h1>RLHF & DPO：让模型符合人类期待</h1>
        <p className="lesson-intro">
          SFT 让模型学会回答问题，但不能保证回答<strong style={{color:'#7dd3fc'}}>安全、有用、诚实</strong>。RLHF（人类反馈强化学习）和 DPO（直接偏好优化）是对齐模型行为与人类价值观的核心技术——也是 ChatGPT、Claude 等顶级模型的秘密武器。
        </p>
      </header>

      {/* RLHF Stages */}
      <section className="lesson-section">
        <h3 className="mb-4">🔄 RLHF 三阶段流程（点击展开详情）</h3>
        <div className="space-y-3">
          {RLHF_STAGES.map((s, i) => (
            <div key={i} className="rounded-xl border cursor-pointer transition-all"
                 style={{borderColor: activeStage===i ? s.color+'60' : 'rgba(255,255,255,0.06)', background: activeStage===i ? s.color+'10' : 'rgba(15,23,42,0.6)'}}
                 onClick={() => setActiveStage(activeStage===i ? null : i)}>
              <div className="flex items-center gap-4 p-4">
                <div className="w-16 text-center text-xs font-black bg-slate-800 rounded-lg py-2 shrink-0" style={{color: s.color}}>{s.stage}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{s.name}</h4>
                  <p className="text-sm text-slate-400">{s.desc}</p>
                </div>
                <ArrowRight size={14} className={`text-slate-600 shrink-0 transition-transform ${activeStage===i ? 'rotate-90' : ''}`}/>
              </div>
              {activeStage === i && (
                <div className="px-4 pb-4 fade-in">
                  <div className="border-t border-white/5 pt-3 grid md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">📥 输入</p>
                      <p className="text-slate-300">{s.input}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">📤 输出</p>
                      <p className="text-slate-300">{s.output}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">💡 关键点</p>
                      <p className="text-slate-300 text-xs leading-relaxed">{s.detail}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Preference Data */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">📊 偏好数据示例：chosen vs rejected</h3>
        <div className="bg-black/40 border border-sky-500/20 rounded-xl p-4 text-sm mb-3">
          <p className="text-slate-500 text-xs mb-2">Prompt:</p>
          <p className="text-slate-200 font-bold">{PREFERENCE_DATA_EXAMPLE.prompt}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-emerald-900/15 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 font-bold text-xs mb-2">✅ Chosen（好回答）</p>
            <p className="text-slate-300 text-sm mb-2">{PREFERENCE_DATA_EXAMPLE.chosen}</p>
            <p className="text-emerald-600 text-xs">👍 {PREFERENCE_DATA_EXAMPLE.chosenWhy}</p>
          </div>
          <div className="bg-red-900/15 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 font-bold text-xs mb-2">❌ Rejected（差回答）</p>
            <p className="text-slate-300 text-sm mb-2">{PREFERENCE_DATA_EXAMPLE.rejected}</p>
            <p className="text-red-600 text-xs">👎 {PREFERENCE_DATA_EXAMPLE.rejectedWhy}</p>
          </div>
        </div>
      </section>

      {/* RLHF vs DPO */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">⚖️ RLHF vs DPO：如何选择？</h3>
        <div className="flex gap-2 mb-4">
          {[['rlhf', 'RLHF (PPO)'], ['dpo', 'DPO']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-sm border font-bold transition-all ${activeTab===key ? 'bg-sky-900/30 border-sky-400 text-sky-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="font-bold text-white">{DPO_COMPARISON[activeTab].name}</h4>
            <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">训练成本: {DPO_COMPARISON[activeTab].cost}</span>
            <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">稳定性: {DPO_COMPARISON[activeTab].stability}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-emerald-400 font-bold text-xs mb-2">✅ 优势</p>
              {DPO_COMPARISON[activeTab].pros.map(p => <p key={p} className="text-sm text-slate-400 mb-1">• {p}</p>)}
            </div>
            <div>
              <p className="text-red-400 font-bold text-xs mb-2">⚠️ 局限</p>
              {DPO_COMPARISON[activeTab].cons.map(c => <p key={c} className="text-sm text-slate-400 mb-1">• {c}</p>)}
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-sky-900/15 border border-sky-500/30 rounded-xl text-sm text-sky-300">
          💡 <strong>实践建议：</strong>90% 的企业场景用 DPO 就够了。RLHF 留给有专业 RL 团队 + 大规模预算的场景（如构建通用对话模型）。
        </div>
      </section>

      {/* DPO Code */}
      <section className="lesson-section mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3>🐍 DPO 训练代码（TRL 库）</h3>
          <button onClick={() => setShowCode(!showCode)} className="text-xs text-sky-400 border border-sky-500/30 px-3 py-1 rounded-lg">
            {showCode ? '收起' : '展开代码'}
          </button>
        </div>
        {showCode && (
          <div className="fade-in">
            <pre className="code-block text-xs leading-relaxed overflow-x-auto">{DPO_CODE}</pre>
          </div>
        )}
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/llm-finetuning-mastery/lesson/infra')}>
          对齐掌握！进入训练基础设施篇 →
        </button>
      </section>
    </div>
  );
}
