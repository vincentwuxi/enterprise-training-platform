import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

// LoRA math visual
function LoRAMatrix({ r }) {
  return (
    <div className="flex items-center gap-3 justify-center flex-wrap">
      <div className="text-center">
        <div className="bg-sky-900/30 border border-sky-500/40 rounded-lg w-16 h-16 flex items-center justify-center text-xs text-sky-300 font-bold">d×d<br/><span className="text-slate-500 text-xs font-normal">frozen W</span></div>
        <p className="text-xs text-slate-500 mt-1">原始权重</p>
      </div>
      <span className="text-slate-500 text-lg">+</span>
      <div className="text-center">
        <div className="flex gap-1">
          <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-lg w-8 h-16 flex items-center justify-center text-xs text-emerald-300 font-bold">d×r</div>
          <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-lg w-8 h-16 flex items-center justify-center text-xs text-emerald-300 font-bold">r×d</div>
        </div>
        <p className="text-xs text-slate-500 mt-1">LoRA A,B</p>
      </div>
      <span className="text-slate-500 text-lg">=</span>
      <div className="text-center">
        <div className="text-xs text-slate-400">参数量比: <span className="text-emerald-400 font-bold">2dr / d² = {Math.round(2*r*1000/1000000*100)/100}%</span></div>
        <p className="text-xs text-slate-500">(d=1000, r={r})</p>
      </div>
    </div>
  );
}

const LORA_PARAMS = [
  { name: 'r (Rank)', typical: '4, 8, 16, 64', desc: '低秩矩阵的维度。越大越接近全量微调，越小训练越快、显存越少', tips: '任务复杂度高选 r=64; 简单格式任务 r=4 即可', color: '#0ea5e9' },
  { name: 'lora_alpha', typical: 'r 的 2 倍', desc: 'LoRA 的缩放系数（alpha/r 控制更新幅度），通常设为 r 的 1-2 倍', tips: '设 alpha=16 时，r=8 → 缩放 2x; r=16 → 缩放 1x', color: '#06b6d4' },
  { name: 'target_modules', typical: 'q_proj,v_proj', desc: '哪些层应用 LoRA。Attention 的 Q,K,V 和 FFN 层是常见目标', tips: '全量 PEFT: ["q","k","v","o","gate","up","down"]; 轻量: ["q","v"]', color: '#0891b2' },
  { name: 'lora_dropout', typical: '0.05~0.1', desc: 'LoRA 层的 dropout 率，防止过拟合', tips: '数据量少（< 1000 条）时可适当提高到 0.1-0.2', color: '#7c3aed' },
];

const QLORA_ADVANTAGES = [
  { title: '4-bit NF4 量化', desc: '底座模型以 4-bit NFloat4 存储，显存降低 75%', saving: '75%↓' },
  { title: 'Double Quantization', desc: '对量化常数再次量化，额外节省约 0.4 bit/参数', saving: '+0.4 bit↓' },
  { title: 'Paged Optimizers', desc: '梯度检查点 + 分页优化器，避免 OOM', saving: 'OOM↓' },
];

const GPU_REQUIREMENTS = [
  { method: 'SFT (全量)', model: '7B', vram: '~80GB', gpu: 'A100 x2 或更多', monthly: '~$800+' },
  { method: 'LoRA', model: '7B', vram: '~24GB', gpu: 'RTX 4090 / A10G', monthly: '~$100' },
  { method: 'QLoRA', model: '7B', vram: '~10GB', gpu: 'RTX 3080 / T4', monthly: '~$30' },
  { method: 'QLoRA', model: '70B', vram: '~48GB', gpu: 'A100 40G x1', monthly: '~$200' },
];

const LORA_CODE = `from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch

# === QLoRA：4-bit 量化底座 ===
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",       # NormalFloat4 量化类型
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,  # 双重量化进一步节省显存
)

model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    quantization_config=bnb_config,
    device_map="auto",
)

# === 配置 LoRA ===
lora_config = LoraConfig(
    r=16,                    # Rank
    lora_alpha=32,           # alpha = 2r (推荐)
    target_modules=[         # 应用 LoRA 的层
        "q_proj", "k_proj",
        "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
)

# 应用 LoRA 到模型
model = get_peft_model(model, lora_config)

# 打印可训练参数比例
model.print_trainable_parameters()
# 输出: trainable params: 20,971,520 || all params: 3,752,071,168 || trainable%: 0.56%`;

export default function LessonPEFT() {
  const navigate = useNavigate();
  const [rank, setRank] = useState(16);
  const [activeParam, setActiveParam] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">⚡ 模块四：高效微调篇</div>
        <h1>LoRA & QLoRA：参数高效微调</h1>
        <p className="lesson-intro">
          全量微调一个 7B 模型需要约 80GB 显存——这对大多数团队是不现实的。<strong style={{color:'#7dd3fc'}}>LoRA 通过只训练 0.1-1% 的参数，实现接近全量微调的效果</strong>；QLoRA 进一步将显存需求降到消费级 GPU 可接受的范围。
        </p>
      </header>

      {/* LoRA Principle */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">🔬 LoRA 核心原理：低秩分解（可交互）</h3>
        <p className="text-slate-400 text-sm mb-4">
          传统微调更新权重矩阵 W（形状 d×d）；LoRA 把更新量 ΔW 分解为两个小矩阵 A(d×r) 和 B(r×d) 的乘积，其中 <strong className="text-sky-300">r ≪ d</strong>（秩远小于维度）。
        </p>
        <LoRAMatrix r={rank}/>
        <div className="mt-5">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm text-slate-400 w-24">调整 r 值: {rank}</label>
            <input type="range" min={1} max={128} value={rank} onChange={e => setRank(Number(e.target.value))}
              className="flex-1 accent-sky-500"/>
            <span className="text-xs text-sky-300 w-20">r={rank} → {(2*rank/1000*100).toFixed(2)}% 参数</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
            {[[4,'极轻量','简单格式任务'],[16,'推荐默认','大多数场景'],[64,'接近全量','复杂多任务']].map(([v,label,best]) => (
              <div key={v} onClick={() => setRank(Number(v))} className={`p-2 rounded-lg border cursor-pointer transition-all ${rank===Number(v) ? 'border-sky-500 bg-sky-900/20 text-sky-300' : 'border-slate-700 text-slate-500'}`}>
                <p className="font-bold">r={v}</p>
                <p>{label}</p>
                <p className="text-slate-600">{best}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Parameters */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">🎛️ LoRA 关键参数详解（点击参数）</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {LORA_PARAMS.map((p, i) => (
            <button key={i} onClick={() => setActiveParam(i)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all"
              style={{ background: activeParam===i ? p.color+'20' : 'rgba(15,23,42,0.8)', borderColor: activeParam===i ? p.color+'60' : '#334155', color: activeParam===i ? '#f0f9ff' : '#64748b' }}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="p-4 rounded-xl border" style={{borderColor: LORA_PARAMS[activeParam].color+'40', background: LORA_PARAMS[activeParam].color+'08'}}>
          <p className="text-xs text-slate-500 mb-1">典型值: <code>{LORA_PARAMS[activeParam].typical}</code></p>
          <p className="text-sm text-slate-300 mb-2">{LORA_PARAMS[activeParam].desc}</p>
          <p className="text-sm text-emerald-300">💡 {LORA_PARAMS[activeParam].tips}</p>
        </div>
      </section>

      {/* QLoRA */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🧊 QLoRA：消费级 GPU 也能微调 70B 大模型</h3>
        <p className="text-slate-400 text-sm mb-4">QLoRA = 4-bit 量化底座 + LoRA 训练。底座权重量化存储（不更新），只有 LoRA 增量矩阵以 bf16 精度训练。</p>
        <div className="grid md:grid-cols-3 gap-3 mb-5">
          {QLORA_ADVANTAGES.map((a, i) => (
            <div key={i} className="p-4 rounded-xl border border-cyan-500/25 bg-cyan-900/10">
              <div className="text-emerald-400 font-bold text-sm mb-1">{a.saving}</div>
              <h4 className="font-bold text-white text-sm mb-1">{a.title}</h4>
              <p className="text-xs text-slate-400">{a.desc}</p>
            </div>
          ))}
        </div>
        <h4 className="font-bold text-slate-300 mb-3 text-sm">📉 同一模型不同方法显存对比</h4>
        <div className="space-y-1.5">
          {GPU_REQUIREMENTS.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/40 text-sm">
              <span className="text-sky-300 font-bold w-28 shrink-0">{r.method}</span>
              <span className="text-slate-500 w-12">{r.model}</span>
              <div className="flex-1 bg-slate-800 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{width: r.method === 'SFT (全量)' ? '100%' : r.method === 'LoRA' ? '30%' : r.model === '7B' ? '12%' : '60%'}}/></div>
              <span className="text-slate-400 w-16 text-xs">{r.vram}</span>
              <code className="text-xs text-slate-500 w-20">{r.monthly}/月</code>
            </div>
          ))}
        </div>
      </section>

      {/* Code */}
      <section className="lesson-section mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3>🐍 QLoRA 完整训练配置代码</h3>
          <button onClick={() => setShowCode(!showCode)} className="text-xs text-sky-400 border border-sky-500/30 px-3 py-1 rounded-lg hover:bg-sky-900/20">
            {showCode ? '收起' : '展开代码'}
          </button>
        </div>
        {showCode && (
          <div className="relative fade-in">
            <pre className="code-block text-xs leading-relaxed max-h-96 overflow-y-auto">{LORA_CODE}</pre>
            <button onClick={() => { navigator.clipboard.writeText(LORA_CODE); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
              className="absolute top-3 right-3 bg-sky-900/60 hover:bg-sky-700 text-sky-300 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
              {copied ? <><CheckCircle2 size={11}/> 已复制</> : <><Copy size={11}/> 复制</>}
            </button>
          </div>
        )}
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/llm-finetuning-mastery/lesson/rlhf')}>
          PEFT 掌握！进入 RLHF & DPO 对齐篇 →
        </button>
      </section>
    </div>
  );
}
