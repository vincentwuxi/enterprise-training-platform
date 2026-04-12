import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 01 — 部署基础
   模型格式 / 量化原理 / 硬件选型
   ───────────────────────────────────────────── */

const MODEL_FORMATS = [
  { name: 'PyTorch (.pt/.bin)', icon: '🔥', desc: 'PyTorch 原生权重格式，训练时的默认输出',
    pros: '生态最广、调试方便', cons: '文件大、加载慢、不适合推理优化', usage: '研发/微调阶段' },
  { name: 'SafeTensors (.safetensors)', icon: '🔒', desc: 'HuggingFace 安全张量格式，防止代码注入',
    pros: '安全(无 pickle)、加载快、支持 mmap', cons: '生态比 .pt 略小', usage: '推荐的存储/分发格式' },
  { name: 'GGUF (.gguf)', icon: '🦙', desc: 'llama.cpp 使用的量化格式，CPU/GPU 混合推理',
    pros: '极致压缩、CPU 可跑、Ollama 原生支持', cons: '精度损失、不支持训练', usage: '本地/边缘部署' },
  { name: 'GPTQ (.gptq)', icon: '⚡', desc: 'GPU 专用量化格式，post-training 量化',
    pros: 'GPU 推理快、精度损失小', cons: '仅 GPU、量化过程慢', usage: 'GPU 服务器部署' },
  { name: 'AWQ (.awq)', icon: '🎯', desc: 'Activation-Aware 量化，保留重要权重精度',
    pros: '比 GPTQ 更快、精度更好', cons: '生态较新', usage: '生产级 GPU 部署' },
  { name: 'ONNX (.onnx)', icon: '🔄', desc: '跨框架通用格式，支持 ONNX Runtime 优化',
    pros: '跨平台、推理优化成熟', cons: 'LLM 支持有限', usage: '传统 ML / 小模型' },
];

const HARDWARE = [
  { name: 'NVIDIA A100 80GB', type: 'GPU', vram: '80 GB', bandwidth: '2 TB/s', price: '~$2/hr (cloud)',
    models: '70B FP16 / 405B 量化', color: '#22c55e' },
  { name: 'NVIDIA H100 80GB', type: 'GPU', vram: '80 GB', bandwidth: '3.35 TB/s', price: '~$3.5/hr',
    models: '70B FP16 / 405B FP8', color: '#22c55e' },
  { name: 'NVIDIA L40S 48GB', type: 'GPU', vram: '48 GB', bandwidth: '864 GB/s', price: '~$1.2/hr',
    models: '34B FP16 / 70B 量化', color: '#3b82f6' },
  { name: 'NVIDIA RTX 4090 24GB', type: 'GPU', vram: '24 GB', bandwidth: '1 TB/s', price: '~$1600 买断',
    models: '13B FP16 / 34B 量化', color: '#3b82f6' },
  { name: 'Apple M4 Max 128GB', type: 'SoC', vram: '128 GB (统一内存)', bandwidth: '546 GB/s', price: '~$5000 买断',
    models: '70B Q4 / 34B FP16', color: '#a78bfa' },
  { name: 'CPU (64GB RAM)', type: 'CPU', vram: 'N/A (系统 RAM)', bandwidth: '~50 GB/s', price: '~$0.1/hr',
    models: '7B Q4 (~30 tok/s)', color: '#f97316' },
];

const VRAM_CALC = [
  { param: '1B', fp32: '4 GB', fp16: '2 GB', int8: '1 GB', int4: '0.5 GB' },
  { param: '7B', fp32: '28 GB', fp16: '14 GB', int8: '7 GB', int4: '3.5 GB' },
  { param: '13B', fp32: '52 GB', fp16: '26 GB', int8: '13 GB', int4: '6.5 GB' },
  { param: '34B', fp32: '136 GB', fp16: '68 GB', int8: '34 GB', int4: '17 GB' },
  { param: '70B', fp32: '280 GB', fp16: '140 GB', int8: '70 GB', int4: '35 GB' },
  { param: '405B', fp32: '1.6 TB', fp16: '810 GB', int8: '405 GB', int4: '~200 GB' },
];

export default function LessonDeployFundamentals() {
  const [fmtIdx, setFmtIdx] = useState(0);

  return (
    <div className="lesson-deploy">
      <div className="dp-badge">🚀 module_01 — 部署基础</div>

      <div className="dp-hero">
        <h1>部署基础：模型格式、量化原理与硬件选型</h1>
        <p>
          模型训练完只是开始——怎么把它变成可服务的 API？本模块打牢<strong>部署三大基础</strong>：
          模型文件格式（6 种格式对比）、VRAM 估算公式、以及从消费级 GPU 到 H100 的硬件选型指南。
        </p>
      </div>

      {/* ─── 模型格式 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">📦 六大模型格式对比</h2>
        <div className="dp-pills">
          {MODEL_FORMATS.map((f, i) => (
            <button key={i} className={`dp-btn ${i === fmtIdx ? 'primary' : ''}`}
              onClick={() => setFmtIdx(i)} style={{ fontSize: '0.78rem' }}>
              {f.icon} {f.name.split(' (')[0]}
            </button>
          ))}
        </div>
        <div className="dp-card perf">
          <h3 style={{ margin: '0 0 0.5rem', color: '#fb923c' }}>{MODEL_FORMATS[fmtIdx].icon} {MODEL_FORMATS[fmtIdx].name}</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.7 }}>{MODEL_FORMATS[fmtIdx].desc}</p>
          <div className="dp-grid-3">
            <div className="dp-alert success"><strong>✅ 优势</strong><br/>{MODEL_FORMATS[fmtIdx].pros}</div>
            <div className="dp-alert warning"><strong>⚠️ 局限</strong><br/>{MODEL_FORMATS[fmtIdx].cons}</div>
            <div className="dp-alert info"><strong>🎯 适用</strong><br/>{MODEL_FORMATS[fmtIdx].usage}</div>
          </div>
        </div>
      </div>

      {/* ─── VRAM 估算 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">💾 VRAM 估算速查表</h2>
        <div className="dp-alert info">
          💡 <strong>经验公式：</strong> VRAM ≈ 参数量 × 每参数字节数 × 1.2 (overhead)。
          例如 7B FP16 = 7×10⁹ × 2 bytes × 1.2 ≈ 16.8 GB
        </div>
        <div className="dp-card">
          <table className="dp-table">
            <thead><tr><th>模型参数</th><th>FP32 (4B/param)</th><th>FP16 (2B)</th><th>INT8 (1B)</th><th>INT4 (0.5B)</th></tr></thead>
            <tbody>
              {VRAM_CALC.map((v, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#fb923c' }}>{v.param}</strong></td>
                  <td style={{ color: '#ef4444' }}>{v.fp32}</td>
                  <td style={{ color: '#f59e0b' }}>{v.fp16}</td>
                  <td style={{ color: '#22c55e' }}>{v.int8}</td>
                  <td style={{ color: '#14b8a6' }}>{v.int4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 硬件选型 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🖥️ 硬件选型指南</h2>
        <div className="dp-card">
          <table className="dp-table">
            <thead><tr><th>硬件</th><th>显存</th><th>带宽</th><th>价格</th><th>适合模型</th></tr></thead>
            <tbody>
              {HARDWARE.map((h, i) => (
                <tr key={i}>
                  <td><strong style={{ color: h.color }}>{h.name}</strong><br/><span className="dp-tag orange">{h.type}</span></td>
                  <td style={{ color: '#94a3b8' }}>{h.vram}</td>
                  <td style={{ color: '#94a3b8' }}>{h.bandwidth}</td>
                  <td style={{ color: '#fde047' }}>{h.price}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{h.models}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 决策树 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🌳 部署方案决策树</h2>
        <div className="dp-code-wrap">
          <div className="dp-code-head">
            <span className="dp-code-dot" style={{ background: '#ef4444' }} />
            <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
            <span className="dp-code-dot" style={{ background: '#22c55e' }} />
            📋 deployment_decision.md
          </div>
          <pre className="dp-code">{`你的模型需要什么？
│
├── 🔒 数据不能出境？
│   ├── 是 → 自托管 (vLLM / TGI / Ollama)
│   │   ├── 有 GPU？ → vLLM (高并发) / TGI (HuggingFace 生态)
│   │   └── 无 GPU？ → Ollama + GGUF 量化 / llama.cpp
│   └── 否 → 继续 ↓
│
├── 📈 并发量 > 100 QPS？
│   ├── 是 → vLLM (多 GPU) / Triton + TensorRT-LLM
│   └── 否 → 继续 ↓
│
├── 💰 预算敏感？
│   ├── 是 → Groq (最便宜 LPU) / Together AI / 量化部署
│   └── 否 → 继续 ↓
│
├── 🚀 延迟 < 100ms TTFT？
│   ├── 是 → Groq (LPU 硬件加速) / Fireworks AI
│   └── 否 → 继续 ↓
│
├── 🧪 实验/开发阶段？
│   ├── 是 → Ollama (最简单) / HuggingFace Inference API
│   └── 否 → 生产 → vLLM + K8s + 负载均衡
│
└── 端侧/边缘部署？
    ├── 是 → llama.cpp + GGUF / MLC-LLM / Ollama
    └── 否 → 标准服务器部署`}</pre>
        </div>
      </div>

      <div className="dp-nav">
        <span />
        <button className="dp-btn green">Ollama 本地部署 →</button>
      </div>
    </div>
  );
}
