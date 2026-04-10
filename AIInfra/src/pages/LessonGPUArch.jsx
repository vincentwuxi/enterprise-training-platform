import { useState } from 'react';
import './LessonCommon.css';

const GPUS = [
  { name: 'RTX 4090', arch: 'Ada Lovelace', cores: '16,384 CUDA / 512 Tensor', vram: '24GB GDDR6X', bw: '1,008 GB/s', tflops: '82.6 FP32', price: '~$1,599', use: '消费级最强：个人 QLoRA 微调、推理服务' },
  { name: 'A100 (80GB)', arch: 'Ampere', cores: '6,912 CUDA / 432 Tensor', vram: '80GB HBM2e', bw: '2,039 GB/s', tflops: '312 TF32', price: '~$15,000', use: '训练主力：70B 模型训练、大规模推理' },
  { name: 'H100 (SXM)', arch: 'Hopper', cores: '16,896 CUDA / 528 Tensor', vram: '80GB HBM3', bw: '3,350 GB/s', tflops: '990 TF32', price: '~$30,000', use: 'AI 旗舰：万亿参数训练、Transformer Engine' },
  { name: 'H200', arch: 'Hopper+', cores: '同 H100', vram: '141GB HBM3e', bw: '4,800 GB/s', tflops: '同 H100', price: '~$35,000', use: '超大模型：HBM3e 显存翻倍、推理吞吐最强' },
  { name: 'B200', arch: 'Blackwell', cores: '18,432 CUDA / 576 Tensor', vram: '192GB HBM3e', bw: '8,000 GB/s', tflops: '2,250 FP4', price: '~$35,000+', use: '2025 旗舰：FP4 推理、NVLink 1.8TB/s 互联' },
];

export default function LessonGPUArch() {
  const [gpu, setGpu] = useState(0);
  const g = GPUS[gpu];

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 01 · GPU HARDWARE ARCHITECTURE</div>
        <h1>GPU 硬件架构</h1>
        <p>理解 AI 为什么"烧钱"——答案在硬件里。<strong>一颗 H100 GPU 的 Tensor Core 每秒执行 990 万亿次浮点运算</strong>，是 CPU 的数百倍。但只有理解 SM、内存层级和互联拓扑，才能写出真正利用这些算力的代码。</p>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">🔧 GPU 硬件层级结构</div>
        <div className="ai-card" style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-orange)', marginBottom: '1rem' }}>📐 NVIDIA GPU 三级计算层级</div>
          <div className="ai-steps">
            {[
              { name: 'SM（Streaming Multiprocessor）', desc: 'GPU 的基本计算单元。H100 有 132 个 SM，每个 SM 包含 128 个 CUDA Core + 4 个 Tensor Core。SM 内的线程共享 Shared Memory。', color: '#f97316' },
              { name: 'CUDA Core（标量运算）', desc: '执行 FP32/FP64/INT32 标量运算的基础单元。类似 CPU 的 ALU，但数量极多（H100 有 16,896 个）。', color: '#fbbf24' },
              { name: 'Tensor Core（张量运算）', desc: '专为矩阵乘法设计的加速单元。一个 Tensor Core 在一个时钟周期内执行 4×4 矩阵的 FMA（乘-加）运算。这就是 AI 训练的核心加速器。', color: '#38bdf8' },
            ].map((s, i) => (
              <div key={i} className="ai-step">
                <div className="ai-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--ai-muted)', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-card">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ai-sky)', marginBottom: '1rem' }}>🗄️ GPU 内存层级（由快到慢）</div>
          <div className="ai-grid-4">
            {[
              { name: 'Register', size: '~256KB/SM', lat: '0 cycle', desc: '每个线程私有，最快' },
              { name: 'Shared Memory', size: '~228KB/SM (H100)', lat: '~20 cycle', desc: 'SM 内线程共享，可编程' },
              { name: 'L2 Cache', size: '~50MB', lat: '~200 cycle', desc: '全局共享，自动管理' },
              { name: 'HBM（主显存）', size: '80-192GB', lat: '~400 cycle', desc: '最大但最慢，带宽决定上限' },
            ].map((m, i) => (
              <div key={i} className="ai-card" style={{ borderTop: `3px solid ${['#f97316','#fbbf24','#38bdf8','#a78bfa'][i]}`, padding: '0.85rem' }}>
                <div style={{ fontWeight: 700, color: ['#f97316','#fbbf24','#38bdf8','#a78bfa'][i], fontSize: '0.82rem', marginBottom: '0.3rem' }}>{m.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: 'var(--ai-text)', marginBottom: '0.2rem' }}>{m.size}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ai-muted)' }}>延迟：{m.lat}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ai-muted)', marginTop: '0.15rem' }}>{m.desc}</div>
              </div>
            ))}
          </div>
          <div className="ai-warn">⚠️ <strong>Memory Bandwidth 是 LLM 推理的瓶颈</strong>：大模型推理是"访存密集型"（memory-bound），不是"计算密集型"。所以 HBM 带宽（而非 TFLOPS）决定了推理吞吐量上限。H200 的 4,800 GB/s 比 A100 的 2,039 GB/s 快 2.4 倍 → 推理吞吐量也提升约 2 倍。</div>
        </div>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">🖥️ 主流 GPU 硬件对比</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {GPUS.map((g2, i) => (
            <button key={i} className={`ai-btn ${gpu === i ? 'active' : ''}`} onClick={() => setGpu(i)}>{g2.name}</button>
          ))}
        </div>
        <div className="ai-card" style={{ borderTop: '3px solid var(--ai-orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--ai-orange)' }}>{g.name}</div>
            <span className="ai-tag sky">{g.arch}</span>
          </div>
          <div className="ai-grid-3" style={{ marginBottom: '0.75rem' }}>
            {[
              { l: '计算核心', v: g.cores },
              { l: '显存', v: g.vram },
              { l: '带宽', v: g.bw },
              { l: '算力', v: g.tflops },
              { l: '价格', v: g.price },
            ].map((item, i) => (
              <div key={i} style={{ fontSize: '0.83rem' }}>
                <span style={{ color: 'var(--ai-muted)' }}>{item.l}：</span>
                <span style={{ color: 'var(--ai-text)', fontWeight: 600, fontFamily: 'JetBrains Mono,monospace' }}>{item.v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ai-muted)', borderTop: '1px solid var(--ai-border)', paddingTop: '0.6rem' }}>
            <span style={{ color: 'var(--ai-orange)', fontWeight: 700 }}>典型场景：</span>{g.use}
          </div>
        </div>
      </div>
    </div>
  );
}
