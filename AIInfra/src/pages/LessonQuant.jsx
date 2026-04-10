import { useState } from 'react';
import './LessonCommon.css';

const CODE_THEORY = `# ━━━━ 量化理论：FP32 → INT8 → INT4 ━━━━

# 核心思想：用更少的 bit 表示权重，换取更小的模型和更快的推理
# 关键权衡：位宽 ↓ → 模型体积 ↓ + 推理速度 ↑ + 精度 ↓

# ━━━━ 对称量化（Symmetric Quantization）━━━━
# 将 FP32 范围映射到 [-127, 127]
# scale = max(|W|) / 127
# W_int8 = round(W / scale)
# W_dequant = W_int8 * scale

import torch

def symmetric_quantize(tensor: torch.Tensor, bits: int = 8):
    qmax = 2 ** (bits - 1) - 1   # 127 for INT8
    scale = tensor.abs().max() / qmax
    quantized = torch.round(tensor / scale).clamp(-qmax, qmax).to(torch.int8)
    return quantized, scale

def dequantize(quantized, scale):
    return quantized.float() * scale

# ━━━━ 非对称量化（Asymmetric Quantization）━━━━
# 范围 [min, max] → [0, 255]
# zero_point = round(-min / scale)
# scale = (max - min) / 255

# ━━━━ 分组量化（Group Quantization，主流方法）━━━━
# 每 group_size 个参数共享一个 scale（通常 128）
# 比全层共享一个 scale 精度更高
# GPTQ、AWQ、GGUF 都使用分组量化

def group_quantize(tensor, group_size=128, bits=4):
    qmax = 2 ** (bits - 1) - 1
    # 按 group_size 分组
    groups = tensor.reshape(-1, group_size)
    scales = groups.abs().max(dim=1, keepdim=True).values / qmax
    quantized = torch.round(groups / scales).clamp(-qmax, qmax)
    return quantized.to(torch.int8), scales

# ━━━━ 量化误差评估 ━━━━
# 量化前后用 PPL（Perplexity）衡量质量：
# FP16 → 5.68 PPL（基准）
# GPTQ INT4 → 5.72 PPL（+0.04，几乎无损）
# AWQ INT4 → 5.70 PPL（+0.02，最优）
# Round-to-Nearest INT4 → 6.15 PPL（+0.47，明显退化）`;

const CODE_METHODS = `# ━━━━ 四大主流量化方法对比 ━━━━

# ━━━━ 1. GPTQ（校准数据集量化，GPU 推理首选）━━━━
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig

quantize_config = BaseQuantizeConfig(
    bits=4,
    group_size=128,        # 每 128 参数一组
    desc_act=True,         # 按激活值排序（更精确但更慢）
    damp_percent=0.01,     # 求解 Hessian 的阻尼系数
)
# 用 128 条校准数据估算最优量化参数
model.quantize(calibration_data)
# 特点：需要校准数据，量化过程较慢（~分钟），推理快

# ━━━━ 2. AWQ（激活感知量化，精度最高）━━━━
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained(model_path)
model.quantize(tokenizer, quant_config={
    "zero_point": True,
    "q_group_size": 128,
    "w_bit": 4,
    "version": "GEMM",    # GEMM（大 batch 快）/ GEMV（小 batch 快）
})
# 特点：保留 1% 最重要权重用 FP16（激活感知）
# 精度通常比 GPTQ 高 0.01-0.05 PPL

# ━━━━ 3. GGUF（llama.cpp 格式，CPU 推理首选）━━━━
# GGUF = GPT-Generated Unified Format
# 特点：单文件格式，支持 CPU + GPU 混合推理
# 量化变体：Q4_K_M（推荐）/ Q5_K_M / Q8_0 等

# 使用 llama.cpp 量化
# ./quantize model.gguf model-Q4_K_M.gguf Q4_K_M

# Q4_K_M：4-bit 混合量化
# - 重要层用更高精度（attention 层）
# - 不重要层用低精度（FFN 层）
# - 在精度和速度之间取得最佳平衡

# ━━━━ 4. SmoothQuant（INT8 量化，适合 INT8 硬件）━━━━
# 将量化难度从激活值"平滑"到权重
# 适合 INT8 Tensor Core（A100/H100）
# 比 FP16 推理快 1.5x，精度几乎无损

# ━━━━ 选择指南 ━━━━
# GPU 推理服务 → AWQ（精度最高）或 GPTQ
# CPU / 边缘设备 → GGUF（llama.cpp / Ollama）
# INT8 硬件（A100/H100）→ SmoothQuant
# 消费级 GPU 微调 → QLoRA（训练时量化，见微调课）`;

const CODE_EVAL = `# ━━━━ 量化质量评估 & 实测数据 ━━━━

# ━━━━ Llama 3 8B 量化精度实测 ━━━━
# ┌──────────────────┬──────────┬──────────┬──────────┬──────────┐
# │ 方法             │ 体积     │ PPL(↓好) │ MMLU(↑好)│ 推理速度  │
# ├──────────────────┼──────────┼──────────┼──────────┼──────────┤
# │ FP16（基准）     │ 16 GB    │ 5.68     │ 68.2%    │ 1x       │
# │ GPTQ INT4        │ 4.2 GB   │ 5.72     │ 67.8%    │ 2.5x     │
# │ AWQ INT4         │ 4.2 GB   │ 5.70     │ 68.0%    │ 2.8x     │
# │ GGUF Q4_K_M      │ 4.6 GB   │ 5.75     │ 67.5%    │ 2.0x     │
# │ GGUF Q8_0        │ 8.5 GB   │ 5.69     │ 68.1%    │ 1.5x     │
# │ SmoothQuant INT8 │ 8.5 GB   │ 5.69     │ 68.1%    │ 1.8x     │
# │ RTN INT4（天真） │ 4.2 GB   │ 6.15     │ 65.2%    │ 2.5x     │
# └──────────────────┴──────────┴──────────┴──────────┴──────────┘
# RTN = Round-to-Nearest（最简单的量化，质量最差，不推荐）

# ━━━━ 评估量化模型的正确方式 ━━━━
import lm_eval

results = lm_eval.simple_evaluate(
    model="hf",
    model_args="pretrained=./model-awq-4bit",
    tasks=["mmlu", "hellaswag", "winogrande", "gsm8k"],
    num_fewshot=5,
    batch_size="auto",
)

# 核心评估指标：
# 1. PPL（Perplexity）：越低越好，衡量语言建模质量
# 2. MMLU：知识广度，下降 > 2% 视为显著退化
# 3. 任务特定指标：根据你的应用场景选择
# 4. 推理速度（tokens/s）：用 vLLM benchmark

# ━━━━ 量化选择速查 ━━━━
# 预算充足，精度优先 → FP16（不量化）
# 平衡精度和速度    → AWQ INT4 + vLLM
# 显存极其有限      → GGUF Q4_K_M + llama.cpp
# 服务大量并发      → AWQ INT4 + vLLM（容量翻倍）
# A100/H100 生产    → SmoothQuant INT8（硬件原生支持）`;

export default function LessonQuant() {
  const [tab, setTab] = useState('theory');
  const tabs = [
    { key: 'theory',  label: '🧮 量化理论',              code: CODE_THEORY },
    { key: 'methods', label: '⚙️ GPTQ/AWQ/GGUF/SmoothQ', code: CODE_METHODS },
    { key: 'eval',    label: '📊 精度实测 & 选型',        code: CODE_EVAL },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 04 · MODEL QUANTIZATION</div>
        <h1>模型量化工程</h1>
        <p>量化是"用最少的 bit 跑最大的模型"——<strong>将 16GB 的 FP16 模型压缩到 4GB 的 INT4，推理速度提升 2-3 倍，精度损失仅 0.04 PPL</strong>。这是生产级推理服务化的核心技术。</p>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">🗜️ 量化三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`ai-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} /><div className="ai-code-dot" style={{ background: '#f59e0b' }} /><div className="ai-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_quant.py</span>
          </div>
          <div className="ai-code">{t.code}</div>
        </div>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">📊 精度 vs 体积 阶梯</div>
        <div className="ai-card">
          {['FP32 (32bit) → 32GB', 'FP16/BF16 (16bit) → 16GB', 'INT8 (8bit) → 8GB', 'INT4/NF4 (4bit) → 4GB', 'FP4 (4bit, Blackwell) → 4GB'].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 4, height: 8 }}>
                <div style={{ height: '100%', borderRadius: 4, background: ['#64748b','#38bdf8','#fbbf24','#f97316','#ef4444'][i], width: [100,50,25,12.5,12.5][i] + '%', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ai-muted)', minWidth: 230 }}>{l}</div>
            </div>
          ))}
          <div style={{ fontSize: '0.78rem', color: 'var(--ai-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>（以 Llama 3 8B 参数为例，显示参数本身的存储空间）</div>
        </div>
      </div>
    </div>
  );
}
