import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 05 — 量化部署
   GGUF / GPTQ / AWQ / llama.cpp 性能实测
   ───────────────────────────────────────────── */

const QUANT_METHODS = [
  { name: 'GGUF (llama.cpp)', icon: '🦙', type: 'Post-Training', precision: '2-8 bit',
    desc: 'llama.cpp 格式，CPU/GPU 混合推理。量化发生在权重上，使用 k-quant 方法最小化精度损失。',
    pros: ['CPU 可运行', 'Mac/Linux/Windows', 'Ollama 原生支持', '量化速度快'],
    cons: ['GPU 利用率不如原生 CUDA', '大模型 CPU 推理仍然慢'],
    variants: [
      { name: 'Q2_K', bits: '2-3', size: '7B→2.7GB', quality: '⭐', speed: '快', note: '质量差，仅测试用' },
      { name: 'Q4_K_M', bits: '4', size: '7B→4.1GB', quality: '⭐⭐⭐', speed: '快', note: '最佳平衡，推荐' },
      { name: 'Q5_K_M', bits: '5', size: '7B→4.8GB', quality: '⭐⭐⭐⭐', speed: '中', note: '高质量，稍大' },
      { name: 'Q6_K', bits: '6', size: '7B→5.5GB', quality: '⭐⭐⭐⭐⭐', speed: '慢', note: '接近原始精度' },
      { name: 'Q8_0', bits: '8', size: '7B→7.2GB', quality: '⭐⭐⭐⭐⭐', speed: '慢', note: '几乎无损' },
    ] },
  { name: 'GPTQ', icon: '⚡', type: 'Post-Training', precision: '3-8 bit',
    desc: '基于二阶信息 (Hessian) 的权重量化。逐层量化，最小化每层输出误差。',
    pros: ['GPU 推理快', '精度保持好', 'vLLM/TGI 原生支持', '成熟稳定'],
    cons: ['仅 GPU', '量化过程慢 (数小时)', '需要校准数据'],
    variants: [
      { name: 'GPTQ-4bit-128g', bits: '4', size: '7B→3.9GB', quality: '⭐⭐⭐⭐', speed: '快', note: '标准配置' },
      { name: 'GPTQ-4bit-32g', bits: '4', size: '7B→4.2GB', quality: '⭐⭐⭐⭐⭐', speed: '中', note: '更精确' },
      { name: 'GPTQ-3bit', bits: '3', size: '7B→3.0GB', quality: '⭐⭐⭐', speed: '快', note: '极致压缩' },
    ] },
  { name: 'AWQ', icon: '🎯', type: 'Post-Training', precision: '4 bit',
    desc: 'Activation-Aware Weight Quantization。保留对激活值影响大的关键权重通道精度。',
    pros: ['比 GPTQ 快 1.5x', '精度损失更小', 'vLLM 推荐量化', '量化速度快'],
    cons: ['主要只支持 4-bit', '生态略小于 GPTQ'],
    variants: [
      { name: 'AWQ-4bit-128g', bits: '4', size: '7B→3.9GB', quality: '⭐⭐⭐⭐⭐', speed: '最快', note: '推荐默认' },
    ] },
  { name: 'BitsAndBytes', icon: '🧮', type: 'Runtime', precision: '4/8 bit',
    desc: 'HuggingFace 集成的即时量化，加载时自动量化，不需要预处理。',
    pros: ['零配置', '与 transformers 无缝集成', '支持 QLoRA 训练', '不需要预量化'],
    cons: ['推理速度不如预量化', '仅 NVIDIA GPU', '不支持 vLLM'],
    variants: [
      { name: 'load_in_8bit', bits: '8', size: '7B→7.5GB', quality: '⭐⭐⭐⭐⭐', speed: '慢', note: 'LLM.int8()' },
      { name: 'load_in_4bit (NF4)', bits: '4', size: '7B→4.0GB', quality: '⭐⭐⭐⭐', speed: '慢', note: 'QLoRA 用' },
    ] },
];

export default function LessonQuantization() {
  const [methIdx, setMethIdx] = useState(0);
  const m = QUANT_METHODS[methIdx];

  return (
    <div className="lesson-deploy">
      <div className="dp-badge">🚀 module_05 — 量化部署</div>

      <div className="dp-hero">
        <h1>量化部署：用 1/4 显存跑同样的模型</h1>
        <p>
          量化是把 FP16 权重压缩到 INT4/INT8 的技术——<strong>显存减少 50-75%</strong>，
          而精度损失通常 &lt;1%。本模块深入 <strong>GGUF、GPTQ、AWQ、BitsAndBytes</strong>  
          四种主流量化方案，并提供实测性能对比。
        </p>
      </div>

      {/* ─── 方法对比 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🧮 四大量化方法</h2>
        <div className="dp-pills">
          {QUANT_METHODS.map((q, i) => (
            <button key={i} className={`dp-btn ${i === methIdx ? 'primary' : ''}`}
              onClick={() => setMethIdx(i)} style={{ fontSize: '0.78rem' }}>
              {q.icon} {q.name}
            </button>
          ))}
        </div>
        <div className="dp-card perf">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#fb923c' }}>{m.icon} {m.name}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="dp-tag orange">{m.type}</span>
              <span className="dp-tag green">{m.precision}</span>
            </div>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: '0 0 1rem' }}>{m.desc}</p>
          <div className="dp-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="dp-alert success"><strong>✅ 优势</strong><br/>{m.pros.map((p, i) => <div key={i}>• {p}</div>)}</div>
            <div className="dp-alert warning"><strong>⚠️ 局限</strong><br/>{m.cons.map((c, i) => <div key={i}>• {c}</div>)}</div>
          </div>
          <h4 style={{ color: '#fde047', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>变体对比 (7B 模型)：</h4>
          <table className="dp-table">
            <thead><tr><th>变体</th><th>位宽</th><th>大小</th><th>质量</th><th>速度</th><th>备注</th></tr></thead>
            <tbody>
              {m.variants.map((v, i) => (
                <tr key={i}>
                  <td><code style={{ color: '#60a5fa', fontSize: '0.78rem' }}>{v.name}</code></td>
                  <td style={{ color: '#fde047' }}>{v.bits}-bit</td>
                  <td style={{ color: '#94a3b8' }}>{v.size}</td>
                  <td>{v.quality}</td>
                  <td><span className="dp-tag green">{v.speed}</span></td>
                  <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── llama.cpp ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🦙 llama.cpp 实战</h2>
        <div className="dp-code-wrap">
          <div className="dp-code-head">
            <span className="dp-code-dot" style={{ background: '#ef4444' }} />
            <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
            <span className="dp-code-dot" style={{ background: '#22c55e' }} />
            🖥️ llama_cpp_guide.sh
          </div>
          <pre className="dp-code">{`# ─── 从源码编译 (GPU 加速) ───
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# CUDA (NVIDIA GPU)
cmake -B build -DGGML_CUDA=ON
cmake --build build --config Release -j

# Metal (Apple Silicon)
cmake -B build -DGGML_METAL=ON
cmake --build build --config Release -j

# ─── 下载 GGUF 模型 ───
# 从 HuggingFace 下载量化模型
# 推荐: TheBloke 或 bartowski 的量化版
# 例: https://huggingface.co/bartowski/Llama-3.1-8B-Instruct-GGUF

# ─── 推理 ───
./build/bin/llama-cli \\
  -m models/llama-3.1-8b-instruct-q4_k_m.gguf \\
  -p "What is reinforcement learning?" \\
  -n 256 \\         # 生成 token 数
  -ngl 99 \\        # GPU offload 层数 (99 = 全部)
  --ctx-size 4096   # 上下文长度

# ─── 作为 API 服务器 ───
./build/bin/llama-server \\
  -m models/llama-3.1-8b-instruct-q4_k_m.gguf \\
  --host 0.0.0.0 --port 8080 \\
  -ngl 99 \\
  --ctx-size 8192 \\
  --parallel 4 \\   # 并发数
  --cont-batching   # 连续批处理

# 兼容 OpenAI API!
curl http://localhost:8080/v1/chat/completions \\
  -d '{"messages":[{"role":"user","content":"Hi!"}]}'

# ─── 自己量化模型 ───
# 先转换 HuggingFace 模型
python convert_hf_to_gguf.py \\
  meta-llama/Llama-3.1-8B-Instruct \\
  --outfile llama-3.1-8b.gguf

# 量化
./build/bin/llama-quantize \\
  llama-3.1-8b.gguf \\
  llama-3.1-8b-q4_k_m.gguf \\
  q4_k_m`}</pre>
        </div>
      </div>

      {/* ─── 选型建议 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🎯 量化选型速查</h2>
        <div className="dp-grid-2">
          <div className="dp-alert success">
            <strong>✅ Mac / CPU 个人使用</strong><br/>
            → GGUF Q4_K_M + Ollama，最简单
          </div>
          <div className="dp-alert info">
            <strong>📊 GPU 服务器生产环境</strong><br/>
            → AWQ 4-bit + vLLM，最佳性价比
          </div>
          <div className="dp-alert warning">
            <strong>⚠️ 需要 QLoRA 微调</strong><br/>
            → BitsAndBytes NF4 + PEFT
          </div>
          <div className="dp-alert info">
            <strong>📊 NVIDIA 极致性能</strong><br/>
            → TensorRT-LLM FP8 + Triton
          </div>
        </div>
      </div>

      <div className="dp-nav">
        <button className="dp-btn">← TGI & Triton</button>
        <button className="dp-btn green">推理即服务 →</button>
      </div>
    </div>
  );
}
