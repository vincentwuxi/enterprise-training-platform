import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Layers, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

const PRETRAIN_VS_FINETUNE = [
  {
    phase: '预训练 (Pre-training)',
    emoji: '🌍',
    cost: '千万美元级',
    data: '万亿 Token（互联网全量文本）',
    goal: '学会"语言"：语法、事实、推理、常识',
    analogy: '大学本科教育——打通识基础',
    color: '#0ea5e9',
    params: '冻结后发放'
  },
  {
    phase: '微调 (Fine-tuning)',
    emoji: '🎯',
    cost: '百至千美元级',
    data: '千至百万条（领域/任务专属数据）',
    goal: '学会"任务"：特定风格、格式、知识、行为',
    analogy: '职业技能培训——专精特定方向',
    color: '#06b6d4',
    params: '全量或部分更新'
  },
];

const WHEN_TO_FINETUNE = [
  { icon: '✅', text: '需要特定输出格式（如 JSON、特定表格）', use: true },
  { icon: '✅', text: '需要注入私有/专业领域知识（如企业内部文档）', use: true },
  { icon: '✅', text: '需要一致的品牌声音或特定写作风格', use: true },
  { icon: '✅', text: '需要比 Prompt 工程更低的推理延迟和成本', use: true },
  { icon: '✅', text: '需要在边缘/本地部署（数据隐私要求）', use: true },
  { icon: '❌', text: '只需要快速尝试，Prompt 工程即可满足', use: false },
  { icon: '❌', text: '知识频繁变化（微调模型无法实时更新）', use: false },
  { icon: '❌', text: '数据量极少（< 100 条高质量样本），考虑 RAG', use: false },
];

const FINETUNE_METHODS = [
  { name: 'SFT', full: 'Supervised Fine-Tuning', desc: '监督微调：用标注好的输入-输出对训练', cost: '高（全参数）', quality: '★★★★', best: '格式遵循、指令跟随', color: '#0ea5e9' },
  { name: 'LoRA', full: 'Low-Rank Adaptation', desc: '低秩适配：只训练少量增量矩阵，效果接近全量', cost: '低（1-10% 参数）', quality: '★★★★', best: '大多数场景首选', color: '#06b6d4' },
  { name: 'QLoRA', full: 'Quantized LoRA', desc: '量化 LoRA：4-bit 量化底模，大幅降低显存需求', cost: '极低（消费级 GPU 可用）', quality: '★★★☆', best: '资源受限场景', color: '#0891b2' },
  { name: 'RLHF', full: 'Reinforcement Learning from Human Feedback', desc: '人类反馈强化学习：奖励模型 + PPO 对齐', cost: '极高（多阶段）', quality: '★★★★★', best: 'Chat 模型对齐', color: '#7c3aed' },
  { name: 'DPO', full: 'Direct Preference Optimization', desc: '直接偏好优化：RLHF 的简化替代方案', cost: '中', quality: '★★★★', best: '对齐偏好，更稳定', color: '#6d28d9' },
];

// Animated model architecture visualization
function ModelViz({ step }) {
  const layers = ['Embedding', 'Attention', 'FFN', 'Attention', 'FFN', 'Output'];
  return (
    <div className="flex flex-col gap-1.5 items-center py-3">
      {layers.map((name, i) => {
        const isActive = step === 0 ? true : (step === 1 && (name === 'FFN'));
        return (
          <div key={i} className="flex items-center gap-2 w-full max-w-xs">
            <div className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-500 flex-1
              ${isActive ? 'bg-sky-500/30 border-sky-400 border text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.4)]' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
              {name}
            </div>
            {step === 1 && name === 'FFN' && (
              <div className="text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 px-2 py-1 rounded-lg whitespace-nowrap fade-in">
                LoRA ✦
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LessonFoundation() {
  const navigate = useNavigate();
  const [vizStep, setVizStep] = useState(0);
  const [activeMethod, setActiveMethod] = useState(0);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🧠 模块一：原理认知篇</div>
        <h1>从预训练到微调</h1>
        <p className="lesson-intro">
          大模型微调（Fine-tuning）是 AI 工程师最核心的技能之一。它能让通用大模型变成<strong style={{color:'#7dd3fc'}}>懂你业务、会你语言、符合你风格</strong>的专属 AI 助手。这节课彻底讲清楚：它是什么、为什么要做、有哪些方法。
        </p>
      </header>

      {/* Pre-train vs Fine-tune */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">🌍 预训练 vs 微调：两个阶段，各司其职</h3>
        <div className="grid md:grid-cols-2 gap-5">
          {PRETRAIN_VS_FINETUNE.map((p, i) => (
            <div key={i} className="p-5 rounded-xl border" style={{borderColor: p.color + '40', background: p.color + '08'}}>
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h4 className="font-bold text-white mb-3">{p.phase}</h4>
              <div className="space-y-2 text-sm">
                {[['💰 成本', p.cost], ['📊 数据量', p.data], ['🎯 学习目标', p.goal], ['🎓 类比', p.analogy]].map(([label, val]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-slate-500 shrink-0 w-24">{label}</span>
                    <span className="text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive viz */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🔬 可视化：全量微调 vs LoRA（点击切换）</h3>
        <div className="glass-panel p-6">
          <div className="flex gap-3 mb-5">
            {['全量微调（更新所有参数）', 'LoRA（仅更新增量矩阵）'].map((label, i) => (
              <button key={i} onClick={() => setVizStep(i)}
                className={`px-4 py-2 rounded-xl text-sm border font-bold transition-all ${vizStep === i ? 'bg-sky-900/30 border-sky-400 text-sky-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-10 items-center justify-center">
            <ModelViz step={vizStep}/>
            <div className="text-sm space-y-3">
              {vizStep === 0 ? (
                <>
                  <p className="text-slate-300">所有层参数全部更新</p>
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-xs text-red-300">
                    ⚠️ 需要与模型等量的<br/>优化器状态显存<br/>（70B 模型 → 约 600GB）
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-300">仅更新每层的低秩矩阵 A, B</p>
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-300">
                    ✅ 可训练参数降至 0.1-10%<br/>显存需求大幅降低<br/>（7B 模型 → 约 16GB）
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* When to fine-tune */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🎯 什么时候应该微调？（官方决策清单）</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {WHEN_TO_FINETUNE.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${item.use ? 'border-emerald-500/20 bg-emerald-900/8' : 'border-red-500/20 bg-red-900/8'}`}>
              <span className="text-lg shrink-0">{item.icon}</span>
              <p className="text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-sky-900/15 border border-sky-500/30 rounded-xl text-sm text-sky-300">
          💡 <strong>决策树：</strong>先试 Prompt 工程 → 不够好？试 RAG → 还不够？才考虑微调 → 资源有限？选 LoRA/QLoRA
        </div>
      </section>

      {/* Method Overview */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">🗺️ 5 大主流微调方法快速对比（点击了解详情）</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {FINETUNE_METHODS.map((m, i) => (
            <button key={i} onClick={() => setActiveMethod(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeMethod === i ? 'text-white' : 'border-slate-700 text-slate-400 bg-slate-900/50'}`}
              style={activeMethod === i ? {background: m.color + '30', borderColor: m.color + '80', color: m.color} : {}}>
              {m.name}
            </button>
          ))}
        </div>
        <div className="p-4 rounded-xl border transition-all" style={{borderColor: FINETUNE_METHODS[activeMethod].color + '40', background: FINETUNE_METHODS[activeMethod].color + '08'}}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-white">{FINETUNE_METHODS[activeMethod].name}</h4>
              <p className="text-xs text-slate-500">{FINETUNE_METHODS[activeMethod].full}</p>
            </div>
            <div className="text-right text-xs">
              <p className="text-slate-400">质量: {FINETUNE_METHODS[activeMethod].quality}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-2">{FINETUNE_METHODS[activeMethod].desc}</p>
          <div className="flex gap-4 text-xs">
            <span className="text-slate-500">💰 成本: <span className="text-slate-300">{FINETUNE_METHODS[activeMethod].cost}</span></span>
            <span className="text-slate-500">🎯 最适合: <span className="text-slate-300">{FINETUNE_METHODS[activeMethod].best}</span></span>
          </div>
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/llm-finetuning-mastery/lesson/data')}>
          基础已打好！进入数据工程篇 →
        </button>
      </section>
    </div>
  );
}
