import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Cpu, HardDrive, ChevronRight } from 'lucide-react';
import './LessonCommon.css';

const FRAMEWORKS = [
  {
    name: 'LLaMA-Factory',
    url: 'hiyouga/LLaMA-Factory',
    star: '⭐ 38k+',
    desc: '一站式微调平台，支持 100+ 模型、多种微调方法和 Web UI，零代码即可开始训练',
    support: ['SFT', 'LoRA', 'QLoRA', 'DPO', 'RLHF', 'PPO'],
    bestFor: '快速启动、不想写代码的团队',
    language: 'Python',
    color: '#0ea5e9',
  },
  {
    name: 'Axolotl',
    url: 'OpenAccess-AI-Collective/axolotl',
    star: '⭐ 9k+',
    desc: '灵活的配置文件驱动微调框架，支持 YAML 配置，覆盖主流 Llama/Mistral/Qwen 系列',
    support: ['SFT', 'LoRA', 'QLoRA', 'DPO'],
    bestFor: '需要高度灵活性的工程师',
    language: 'Python/YAML',
    color: '#06b6d4',
  },
  {
    name: 'TRL (HuggingFace)',
    url: 'huggingface/trl',
    star: '⭐ 12k+',
    desc: 'HuggingFace 官方 RL 库，专为 RLHF/DPO/PPO 设计，与 transformers 无缝集成',
    support: ['SFT', 'DPO', 'PPO', 'ORPO', 'KTO'],
    bestFor: '研究人员和想要精细控制的团队',
    language: 'Python',
    color: '#7c3aed',
  },
  {
    name: 'Unsloth',
    url: 'unslothai/unsloth',
    star: '⭐ 25k+',
    desc: '极致性能优化：比原生快 2-5x，显存节省 60%，LoRA/QLoRA 首选加速方案',
    support: ['SFT', 'LoRA', 'QLoRA', 'DPO'],
    bestFor: '资源受限但追求速度的团队',
    language: 'Python',
    color: '#059669',
  },
];

const GPU_COMPARISON = [
  { gpu: 'NVIDIA A100 80GB', vram: '80GB', bandwidth: '2TB/s', price: '$2.5/小时', tier: '🔴 顶级', best: '70B+ 全量训练', throughput: '🚀🚀🚀🚀🚀' },
  { gpu: 'NVIDIA A100 40GB', vram: '40GB', bandwidth: '1.6TB/s', price: '$1.5/小时', tier: '🟠 专业', best: '30-70B LoRA', throughput: '🚀🚀🚀🚀' },
  { gpu: 'NVIDIA A10G', vram: '24GB', bandwidth: '600GB/s', price: '$0.8/小时', tier: '🟡 平衡', best: '7-13B LoRA', throughput: '🚀🚀🚀' },
  { gpu: 'NVIDIA T4', vram: '16GB', bandwidth: '320GB/s', price: '$0.3/小时', tier: '🟢 入门', best: '7B QLoRA', throughput: '🚀🚀' },
  { gpu: 'RTX 4090（本地）', vram: '24GB', bandwidth: '1TB/s', price: '~$0.05/小时', tier: '✅ 本地', best: '7B QLoRA，高速', throughput: '🚀🚀🚀' },
];

const DISTRIBUTED_METHODS = [
  { name: 'DeepSpeed ZeRO', stage: 'ZeRO-1/2/3', desc: '微软开源的分布式优化器，将优化器状态、梯度、参数分片到多个 GPU', useCase: '单机多卡（2-8 GPU）', config: 'ds_config.json' },
  { name: 'FSDP', stage: 'PyTorch 原生', desc: 'HuggingFace/PyTorch 原生的 Fully Sharded Data Parallel，更简单的分片训练', useCase: '多机多卡（8-64 GPU）', config: 'fsdp_config.json' },
  { name: 'Megatron-LM', stage: '模型并行', desc: 'NVIDIA 的模型并行框架，适合超大模型（175B+）的张量并行训练', useCase: '大规模集群（64+ GPU）', config: '复杂，需要专业团队' },
];

const CLOUD_PLATFORMS = [
  { name: 'Lambda Cloud', pros: '最便宜的 A100，国内可注册', cons: '可用区有限', price: '$1.1/hr (A100)' },
  { name: 'RunPod', pros: '支持自定义镜像，按秒计费', cons: '带宽有限', price: '$1.44/hr (A100)' },
  { name: 'AWS SageMaker', pros: '企业级，内置 MLOps 工具', cons: '贵、配置复杂', price: '$3.2/hr (p3.2xlarge)' },
  { name: 'Google Colab Pro+', pros: '最简单，适合学习', cons: 'T4/A100 时间限制', price: '$50/月（固定）' },
];

const LLAMAFACTORY_YAML = `# LLaMA-Factory 训练配置示例（YAML）
model_name_or_path: Qwen/Qwen2.5-7B-Instruct
stage: sft              # 微调阶段：sft/dpo/ppo
do_train: true
finetuning_type: lora   # 微调方式：full/lora/qlora

dataset: alpaca_zh      # 使用内置中文数据集
template: qwen          # 使用 Qwen 的 prompt 模板
output_dir: ./saves/qwen2.5-7b-lora

# LoRA 参数
lora_rank: 8
lora_alpha: 16
lora_target: q_proj,v_proj

# 训练参数
per_device_train_batch_size: 4
gradient_accumulation_steps: 2
learning_rate: 0.0001
num_train_epochs: 3.0
lr_scheduler_type: cosine
warmup_ratio: 0.1
bf16: true

# 启动命令：llamafactory-cli train train_config.yaml`;

export default function LessonInfra() {
  const navigate = useNavigate();
  const [activeFramework, setActiveFramework] = useState(0);
  const [showYaml, setShowYaml] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🖥️ 模块六：工程实战篇</div>
        <h1>训练基础设施全解</h1>
        <p className="lesson-intro">
          拥有了好的算法和数据，还需要合适的工具和算力才能把微调跑起来。本模块覆盖<strong style={{color:'#7dd3fc'}}>主流训练框架对比、GPU 选型指南、云平台推荐和分布式训练方案</strong>，帮你花最少的钱，跑最好的训练。
        </p>
      </header>

      {/* Framework Comparison */}
      <section className="lesson-section">
        <h3 className="mb-4">🛠️ 4 大主流微调框架对比（点击切换）</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {FRAMEWORKS.map((f, i) => (
            <button key={i} onClick={() => setActiveFramework(i)}
              className="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all"
              style={{ background: activeFramework===i ? f.color+'20' : 'rgba(15,23,42,0.8)', borderColor: activeFramework===i ? f.color+'60' : '#334155', color: activeFramework===i ? '#f0f9ff' : '#64748b' }}>
              {f.name}
            </button>
          ))}
        </div>
        <div className="glass-panel" style={{borderColor: FRAMEWORKS[activeFramework].color+'30'}}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-bold text-white">{FRAMEWORKS[activeFramework].name}</h4>
              <code className="text-xs text-slate-500">{FRAMEWORKS[activeFramework].url}</code>
            </div>
            <span className="text-xs text-slate-400">{FRAMEWORKS[activeFramework].star}</span>
          </div>
          <p className="text-sm text-slate-300 mb-3">{FRAMEWORKS[activeFramework].desc}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {FRAMEWORKS[activeFramework].support.map(s => (
              <span key={s} className="text-xs text-sky-300 bg-sky-900/20 border border-sky-500/30 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
          <p className="text-sm text-slate-400">🎯 最适合: <span className="text-white">{FRAMEWORKS[activeFramework].bestFor}</span></p>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-400">LLaMA-Factory YAML 配置示例（推荐新手）</p>
            <button onClick={() => setShowYaml(!showYaml)} className="text-xs text-sky-400 border border-sky-500/30 px-3 py-1 rounded-lg">
              {showYaml ? '收起' : '展开'}
            </button>
          </div>
          {showYaml && <pre className="code-block text-xs fade-in max-h-80 overflow-y-auto">{LLAMAFACTORY_YAML}</pre>}
        </div>
      </section>

      {/* GPU Comparison */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🖥️ GPU 选型对比表</h3>
        <div className="space-y-2">
          {GPU_COMPARISON.map((g, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/40 text-sm flex-wrap">
              <span className="text-slate-300 font-bold w-40 shrink-0">{g.gpu}</span>
              <span className="text-sky-300 w-16 shrink-0">{g.vram}</span>
              <div className="flex-1 text-slate-500 text-xs hidden md:block">{g.best}</div>
              <span className="text-emerald-400 font-bold text-xs">{g.price}</span>
              <span className="text-xs">{g.throughput}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Cloud Platforms */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">☁️ 云 GPU 平台推荐</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {CLOUD_PLATFORMS.map((p, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <h4 className="font-bold text-white mb-1">{p.name}</h4>
              <p className="text-xs text-emerald-400 mb-0.5">✅ {p.pros}</p>
              <p className="text-xs text-red-400 mb-1">⚠️ {p.cons}</p>
              <code className="text-xs text-sky-300">{p.price}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Distributed Training */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🔗 分布式训练方案（当单卡不够用时）</h3>
        <div className="space-y-3">
          {DISTRIBUTED_METHODS.map((m, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-700/40 bg-slate-900/50">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-white">{m.name}</h4>
                <span className="text-xs border border-sky-500/30 text-sky-300 px-2 py-0.5 rounded">{m.stage}</span>
                <span className="text-xs text-slate-500 ml-auto">{m.useCase}</span>
              </div>
              <p className="text-sm text-slate-400">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-sky-900/15 border border-sky-500/30 rounded-xl text-sm text-sky-300">
          💡 <strong>新手建议：</strong>单卡 RTX4090 用 QLoRA 开始；需要多卡时选 DeepSpeed ZeRO-2；不要过早考虑分布式，先把单卡跑好。
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/llm-finetuning-mastery/lesson/eval')}>
          基础设施搭好！进入评估与迭代篇 →
        </button>
      </section>
    </div>
  );
}
