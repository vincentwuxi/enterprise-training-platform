import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trophy, Zap, DollarSign, ChevronRight } from 'lucide-react';
import './LessonCommon.css';

const QUANT_COMPARISON = [
  { method: 'BF16 (原始)', vram: '14GB', speed: '100%', quality: '100%', bar: 100 },
  { method: 'GPTQ INT8', vram: '7GB', speed: '120%', quality: '99%', bar: 99 },
  { method: 'GPTQ INT4', vram: '3.5GB', speed: '150%', quality: '97%', bar: 97 },
  { method: 'GGUF Q4_K_M', vram: '3.8GB', speed: '140%', quality: '96%', bar: 96 },
  { method: 'GGUF Q2_K', vram: '2.1GB', speed: '200%', quality: '89%', bar: 89 },
];

const INFERENCE_FRAMEWORKS = [
  {
    name: 'vLLM', icon: '⚡',
    desc: 'NVIDIA GPU 首选，PagedAttention 显存管理，吞吐量比原生 HuggingFace 快 10-30x',
    best: 'GPU 推理 + 高并发 API 服务', lang: 'Python', deploy: 'pip install vllm',
    color: '#0ea5e9'
  },
  {
    name: 'llama.cpp', icon: '🦙',
    desc: '纯 CPU 推理框架，支持 GGUF 格式，Mac M1/M2 原生加速，无需 GPU',
    best: 'CPU 推理 / 本地部署 / MacBook', lang: 'C++', deploy: 'brew install llama.cpp',
    color: '#06b6d4'
  },
  {
    name: 'Ollama', icon: '🦅',
    desc: '基于 llama.cpp 的友好封装，一条命令本地运行，提供 REST API，支持 macOS/Linux/Windows',
    best: '开发测试 / 企业内网部署', lang: 'Go', deploy: 'curl -fsSL https://ollama.ai/install.sh | sh',
    color: '#059669'
  },
  {
    name: 'TGI (HuggingFace)', icon: '🤗',
    desc: 'HuggingFace 官方推理服务，支持 Docker 部署，带有 Token 流式输出和并发管理',
    best: '企业级 API 服务', lang: 'Rust/Python', deploy: 'docker pull ghcr.io/huggingface/text-generation-inference',
    color: '#f59e0b'
  },
];

const DEPLOYMENT_CALCULATOR = {
  services: [
    { name: '个人/开发测试', tokens: 10_000, daily: '1万 tokens/天', rec: 'Ollama (本地)', monthlyCost: '0' },
    { name: '小团队内部工具', tokens: 500_000, daily: '50万 tokens/天', rec: 'vLLM on RTX4090', monthlyCost: '~$50' },
    { name: '中型 SaaS 产品', tokens: 5_000_000, daily: '500万 tokens/天', rec: 'vLLM on A10G x2', monthlyCost: '~$500' },
    { name: '大型企业服务', tokens: 50_000_000, daily: '5000万 tokens/天', rec: 'vLLM on A100 x4 + K8s', monthlyCost: '~$5000' },
  ]
};

const DEPLOYMENT_CHECKLIST = [
  { item: '安全性', tasks: ['添加 API Key 鉴权', '设置请求频率限制 (Rate Limit)', '过滤有害内容 (Output Filter)', '私有化部署 (不泄露用户数据)'] },
  { item: '可靠性', tasks: ['多实例负载均衡', '健康检查 & 自动重启', '请求队列 (避免 OOM)', 'Fallback 到基础模型'] },
  { item: '可观测性', tasks: ['日志：每次请求的 prompt/response/latency', 'Metrics：吞吐量、错误率、P99 延迟', '定期人工抽查输出质量'] },
  { item: '持续迭代', tasks: ['收集用户反馈 (点赞/踩)', '定期更新训练数据 (持续学习)', '版本管理：保存并命名每个 checkpoint', 'A/B 测试新vs旧模型'] },
];

const VLLM_CODE = `from vllm import LLM, SamplingParams

# 加载微调后的模型（支持 LoRA 适配器）
llm = LLM(
    model="./output/best_model",
    enable_lora=True,           # 如果有 LoRA 适配器
    max_model_len=4096,
    gpu_memory_utilization=0.9, # 使用 90% GPU 显存
)

# 批量推理（高吞吐量）
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
)

prompts = [
    "分析这份财报的核心风险：...",
    "帮我优化这段 SQL：...",
]

outputs = llm.generate(prompts, sampling_params)
for output in outputs:
    print(output.outputs[0].text)`;

export default function LessonDeploy() {
  const navigate = useNavigate();
  const [activeFramework, setActiveFramework] = useState(0);
  const [activeScale, setActiveScale] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🚀 模块八：落地实战篇</div>
        <h1>微调模型投产：从训练到服务</h1>
        <p className="lesson-intro">
          训练完成只是开始。把微调模型稳定、高效、安全地部署到生产环境，服务真实用户——这才是工程师最终的交付物。本模块覆盖<strong style={{color:'#7dd3fc'}}>量化加速、推理框架、规模化部署和持续迭代</strong>的完整链路。
        </p>
      </header>

      {/* Quantization */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">🧊 量化：推理加速的第一步</h3>
        <p className="text-slate-400 text-sm mb-4">量化把模型权重从 16-bit 浮点数压缩为 8-bit/4-bit 整数，在轻微质量损失的前提下，将推理速度提升 50-100%，显存需求减少 50-75%。</p>
        <div className="space-y-2">
          {QUANT_COMPARISON.map((q, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-sm text-slate-300 w-36 shrink-0 font-mono">{q.method}</span>
              <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full transition-all duration-500"
                     style={{width: q.bar + '%', background: q.bar >= 98 ? '#0ea5e9' : q.bar >= 95 ? '#06b6d4' : '#94a3b8'}}/>
              </div>
              <div className="flex gap-3 text-xs text-slate-500 w-36 justify-end">
                <span className="text-emerald-300">{q.vram}</span>
                <span className="text-sky-300">{q.speed}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">横轴=质量保留率 | 7B 模型数据</p>
      </section>

      {/* Inference Frameworks */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">⚡ 4 大推理框架选型（点击对比）</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {INFERENCE_FRAMEWORKS.map((f, i) => (
            <button key={i} onClick={() => setActiveFramework(i)}
              className="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all"
              style={{ background: activeFramework===i ? f.color+'25' : 'rgba(15,23,42,0.8)', borderColor: activeFramework===i ? f.color+'60' : '#334155', color: activeFramework===i ? '#f0f9ff' : '#64748b' }}>
              {f.icon} {f.name}
            </button>
          ))}
        </div>
        <div className="glass-panel">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{INFERENCE_FRAMEWORKS[activeFramework].icon}</span>
            <div>
              <h4 className="font-bold text-white">{INFERENCE_FRAMEWORKS[activeFramework].name}</h4>
              <code className="text-xs text-slate-500">{INFERENCE_FRAMEWORKS[activeFramework].deploy}</code>
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-2">{INFERENCE_FRAMEWORKS[activeFramework].desc}</p>
          <p className="text-sm text-sky-300">🎯 最适合: {INFERENCE_FRAMEWORKS[activeFramework].best}</p>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-400">vLLM 高性能推理服务代码</p>
            <button onClick={() => setShowCode(!showCode)} className="text-xs text-sky-400 border border-sky-500/30 px-3 py-1 rounded-lg">{showCode ? '收起' : '展开'}</button>
          </div>
          {showCode && <pre className="code-block text-xs fade-in">{VLLM_CODE}</pre>}
        </div>
      </section>

      {/* Scale Calculator */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">💰 规模化部署成本计算器</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {DEPLOYMENT_CALCULATOR.services.map((s, i) => (
            <button key={i} onClick={() => setActiveScale(i)}
              className={`px-3 py-2 rounded-xl text-xs border font-bold transition-all ${activeScale===i ? 'bg-sky-900/30 border-sky-500 text-sky-200' : 'border-slate-700 text-slate-500 bg-slate-900/50'}`}>
              {s.name}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <p className="text-slate-500 text-xs mb-1">日请求量</p>
            <p className="text-sky-300 font-bold">{DEPLOYMENT_CALCULATOR.services[activeScale].daily}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <p className="text-slate-500 text-xs mb-1">推荐方案</p>
            <p className="text-white font-bold text-sm">{DEPLOYMENT_CALCULATOR.services[activeScale].rec}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <p className="text-slate-500 text-xs mb-1">月估算成本</p>
            <p className="text-emerald-400 font-black text-xl">{DEPLOYMENT_CALCULATOR.services[activeScale].monthlyCost}</p>
          </div>
        </div>
      </section>

      {/* Deployment Checklist */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">✅ 生产部署 Checklist（4 大维度）</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {DEPLOYMENT_CHECKLIST.map((section, si) => (
            <div key={si} className="glass-panel">
              <h4 className="font-bold text-sky-300 mb-3 text-sm">{section.item}</h4>
              <div className="space-y-2">
                {section.tasks.map((task, ti) => {
                  const key = `${si}-${ti}`;
                  return (
                    <div key={ti} className="flex items-center gap-2 cursor-pointer" onClick={() => setCheckedItems(p => ({...p, [key]: !p[key]}))}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checkedItems[key] ? 'bg-sky-500 border-sky-400' : 'border-slate-600'}`}>
                        {checkedItems[key] && <span className="text-xs text-white font-black">✓</span>}
                      </div>
                      <p className="text-xs text-slate-400">{task}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Graduation */}
      <section className="lesson-section glass-panel mt-12 text-center py-14"
        style={{borderTop: '4px solid #0ea5e9', background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(6,182,212,0.08))'}}>
        <Trophy size={64} className="mx-auto mb-4 text-yellow-400" style={{filter:'drop-shadow(0 0 24px rgba(250,204,21,0.5))'}}/>
        <h2 className="text-3xl font-black mb-3"
          style={{background: 'linear-gradient(to right, #bae6fd, #7dd3fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          🎓 恭喜完成《大模型微调实战营》！
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          你已经掌握了大模型微调工程的完整链路——从基础原理、数据工程、SFT/LoRA/QLoRA/RLHF/DPO，到评估体系和生产部署。
          这套技能正是当前 AI 工程师最核心的竞争力。
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs">
          {['预训练原理','数据工程','Alpaca格式','SFT全量','LoRA低秩','QLoRA量化','RLHF对齐','DPO偏好','LLM评估','失败诊断','vLLM服务','量化加速','生产部署'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full border border-sky-500/30 text-sky-300 bg-sky-900/15">{tag}</span>
          ))}
        </div>
        <button onClick={() => navigate('/dashboard')}
          className="text-white font-black py-3 px-8 rounded-full text-lg transition-all hover:scale-105 shadow-[0_0_25px_rgba(14,165,233,0.5)]"
          style={{background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)'}}>
          🚀 返回课程中心，继续探索
        </button>
      </section>
    </div>
  );
}
