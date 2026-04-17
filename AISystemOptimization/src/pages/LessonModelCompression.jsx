import React, { useState } from 'react';
import './LessonCommon.css';

const sections = [
  { id: 'quantization', title: '量化技术', icon: '🔢' },
  { id: 'pruning', title: '剪枝与稀疏', icon: '✂️' },
  { id: 'distillation', title: '知识蒸馏', icon: '🧪' },
  { id: 'practice', title: '压缩实战', icon: '🛠️' },
];

export default function LessonModelCompression() {
  const [active, setActive] = useState(sections[0].id);
  return (
    <div className="lesson-page">
      <div className="lesson-tabs">
        {sections.map(s => (
          <button key={s.id} className={`lesson-tab ${active === s.id ? 'active' : ''}`} onClick={() => setActive(s.id)}>
            <span className="tab-icon">{s.icon}</span>{s.title}
          </button>
        ))}
      </div>
      <div className="lesson-content">
        {active === 'quantization' && <QuantizationSection />}
        {active === 'pruning' && <PruningSection />}
        {active === 'distillation' && <DistillationSection />}
        {active === 'practice' && <PracticeSection />}
      </div>
    </div>
  );
}

function QuantizationSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🔢</span>量化技术全景</h2>
      <p className="section-desc">量化将模型权重和激活值从高精度 (FP32/FP16) 降低到低精度 (INT8/INT4/FP8)，<strong>直接减小内存占用和带宽需求</strong>，是 LLM 推理优化的第一优先级。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>量化方法分类</h3>
          <div className="code-block">
{`量化方法
├── 按阶段分
│   ├── PTQ (Post-Training Quantization)
│   │   ├── 静态量化: 离线校准 → 确定 scale/zero-point
│   │   └── 动态量化: 运行时计算 scale
│   └── QAT (Quantization-Aware Training)
│       └── 训练中插入伪量化节点 → 更高精度
│
├── 按粒度分
│   ├── Per-Tensor:  整个 tensor 一组 scale
│   ├── Per-Channel: 每个输出通道一组 scale
│   ├── Per-Group:   每 128 个元素一组 (GPTQ)
│   └── Per-Token:   每个 token 一组 (W8A8)
│
└── 按精度分
    ├── FP8  (E4M3/E5M2): 2× 加速, 基本无损
    ├── INT8 (W8A8):       2× 加速, <1% 精度损失
    ├── INT4 (W4A16):      4× 压缩, 1-3% 损失
    └── INT2/Binary:       研究阶段, 损失大`}
          </div>
        </div>

        <div className="info-card">
          <h3>主流量化框架对比</h3>
          <table className="data-table">
            <thead>
              <tr><th>方法</th><th>精度</th><th>类型</th><th>校准数据</th><th>速度</th><th>精度损失</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>GPTQ</strong></td><td>INT4/INT3</td><td>Weight-only PTQ</td><td>128 样本</td><td>慢 (小时级)</td><td>很小</td></tr>
              <tr><td><strong>AWQ</strong></td><td>INT4</td><td>Weight-only PTQ</td><td>少量校准</td><td>快 (分钟级)</td><td>极小</td></tr>
              <tr><td><strong>GGUF/GGML</strong></td><td>Q4_K_M等</td><td>CPU 量化</td><td>无需</td><td>即时</td><td>小</td></tr>
              <tr><td><strong>SmoothQuant</strong></td><td>INT8 W8A8</td><td>Weight+Act</td><td>校准集</td><td>中等</td><td>极小</td></tr>
              <tr><td><strong>FP8 (原生)</strong></td><td>FP8</td><td>Training+Inf</td><td>无需</td><td>即时</td><td>几乎无</td></tr>
            </tbody>
          </table>
        </div>

        <div className="info-card">
          <h3>AWQ 量化实战</h3>
          <div className="code-block">
{`from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

model_path = "meta-llama/Llama-3-70B"
quant_path = "Llama-3-70B-AWQ"

# 1. 加载模型
model = AutoAWQForCausalLM.from_pretrained(
    model_path, safetensors=True
)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# 2. 配置量化参数
quant_config = {
    "zero_point": True,
    "q_group_size": 128,   # 每组 128 个权重
    "w_bit": 4,            # INT4 量化
    "version": "GEMM"      # GEMM kernel
}

# 3. 执行量化 (~30min for 70B)
model.quantize(tokenizer, quant_config=quant_config)

# 4. 保存量化模型
model.save_quantized(quant_path)
tokenizer.save_pretrained(quant_path)

# 结果: 140GB → 35GB, 推理速度 ↑ 2.5×`}
          </div>
        </div>
      </div>

      <div className="best-practice">
        <h4>💡 量化选型建议</h4>
        <ul>
          <li><strong>生产首选 AWQ</strong> — 量化速度快、精度损失极小、vLLM 原生支持</li>
          <li><strong>如果有 H100/H200</strong> — 直接用 FP8，几乎无精度损失，2× 加速</li>
          <li><strong>CPU/边缘推理</strong> — 使用 GGUF 格式 (llama.cpp)，Q4_K_M 是性价比最高的档位</li>
        </ul>
      </div>
    </section>
  );
}

function PruningSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">✂️</span>剪枝与稀疏化</h2>
      <p className="section-desc">剪枝通过移除模型中不重要的权重或结构来减少计算量。<strong>结构化剪枝</strong>可以在不需要特殊硬件的情况下实现真实加速。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>剪枝分类</h3>
          <div className="code-block">
{`剪枝策略
├── 非结构化剪枝 (Unstructured)
│   ├── Magnitude Pruning: 删除绝对值最小的权重
│   ├── SparseGPT: LLM 专用一次性剪枝
│   └── Wanda: 结合权重幅度 + 激活值
│   └── 问题: 产生稀疏矩阵, 需 2:4 硬件支持
│
├── 结构化剪枝 (Structured)
│   ├── 通道剪枝: 删除整个 filter/channel
│   ├── 层剪枝: 删除整层 (ShortGPT)
│   ├── 头剪枝: 删除 attention heads
│   └── 优点: 直接产生更小的 dense 模型
│
└── 半结构化稀疏 (N:M Sparsity)
    ├── 2:4 Sparsity (NVIDIA Ampere+)
    │   每 4 个元素中最多 2 个非零
    │   → Tensor Core 原生加速 ~2×
    └── 实际加速: 1.3-1.8× (有 overhead)`}
          </div>
        </div>

        <div className="info-card">
          <h3>2:4 稀疏实战</h3>
          <div className="code-block">
{`import torch
from torch.ao.pruning import WeightNormSparsifier

# NVIDIA 2:4 Structured Sparsity
# 每 4 个权重中保留 2 个最大的

model = load_model()

# 1. 应用 2:4 稀疏
sparsifier = WeightNormSparsifier(
    sparsity_level=0.5,      # 50% 稀疏
    sparse_block_shape=(1, 4), # 2:4 pattern
    zeros_per_block=2
)
sparsifier.prepare(model, config=[
    {"tensor_fqn": "*.weight"}
])
sparsifier.step()             # 执行剪枝
sparsifier.squash_mask()      # 固化 mask

# 2. cusparseLt 加速内核
# H100 Tensor Core 原生支持 2:4:
# FP16 2:4 → ~1.5× throughput
# INT8 2:4 → ~1.8× throughput`}
          </div>
        </div>
      </div>
    </section>
  );
}

function DistillationSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🧪</span>知识蒸馏</h2>
      <p className="section-desc">知识蒸馏 (Knowledge Distillation) 用大模型 (Teacher) 的输出指导小模型 (Student) 学习，实现 <strong>模型尺寸缩小 5-10× 同时保留 90%+ 能力</strong>。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>LLM 蒸馏策略</h3>
          <div className="code-block">
{`┌─────────────────────────────────────┐
│  Teacher: Llama-3-405B (FP16)       │
│  → 生成高质量训练数据 / Logits       │
└──────────────┬──────────────────────┘
               │ Distillation
               ▼
┌─────────────────────────────────────┐
│  Student: Llama-3-8B                │
│                                     │
│  Loss = α × CE(student, labels)     │
│       + β × KL(student_logits,      │
│               teacher_logits / T)   │
│       + γ × MSE(hidden_states)      │
│                                     │
│  T = Temperature (2-20)             │
│  → 软化 teacher logits 分布          │
└─────────────────────────────────────┘

实战结果:
  GPT-4 → Phi-3-mini (3.8B): 保留 80% 能力
  Llama-405B → Llama-70B:    保留 92% 能力
  Qwen-72B → Qwen-7B:       保留 85% 能力`}
          </div>
        </div>

        <div className="info-card">
          <h3>合成数据蒸馏 (最常用)</h3>
          <div className="code-block">
{`# 最实用的蒸馏方式:
# Teacher 生成高质量数据 → Student SFT

from openai import OpenAI

client = OpenAI()

# 1. Teacher 生成训练数据
prompts = load_seed_prompts()  # 种子提示
synthetic_data = []

for prompt in prompts:
    response = client.chat.completions.create(
        model="gpt-4o",           # Teacher
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        n=3                        # 每个 prompt 生成 3 个
    )
    for choice in response.choices:
        synthetic_data.append({
            "instruction": prompt,
            "output": choice.message.content
        })

# 2. Student SFT (微调)
# 使用 synthetic_data 微调 Llama-3-8B
# → 获得 "小而精" 的领域模型

# 成本: $50 生成 10K 高质量样本
# 效果: Student 在目标任务上接近 Teacher 90%`}
          </div>
        </div>
      </div>
    </section>
  );
}

function PracticeSection() {
  return (
    <section className="lesson-section">
      <h2 className="section-title"><span className="icon">🛠️</span>压缩方案选型与组合</h2>
      <p className="section-desc">实际生产中通常需要 <strong>组合多种压缩技术</strong>。以下是针对不同场景的推荐方案。</p>

      <div className="card-grid">
        <div className="info-card">
          <h3>压缩方案决策矩阵</h3>
          <table className="data-table">
            <thead>
              <tr><th>场景</th><th>模型</th><th>推荐方案</th><th>压缩比</th><th>精度保留</th></tr>
            </thead>
            <tbody>
              <tr><td>云端高吞吐</td><td>70B on H100</td><td>FP8 + vLLM</td><td>2×</td><td>99%+</td></tr>
              <tr><td>云端低成本</td><td>70B on A100</td><td>AWQ INT4 + vLLM</td><td>4×</td><td>97%</td></tr>
              <tr><td>边缘 GPU</td><td>7B on RTX 4090</td><td>GPTQ INT4 + ExLlama</td><td>4×</td><td>96%</td></tr>
              <tr><td>CPU 推理</td><td>7B on CPU</td><td>GGUF Q4_K_M + llama.cpp</td><td>4.5×</td><td>95%</td></tr>
              <tr><td>手机端</td><td>3B on iPhone</td><td>蒸馏 + CoreML INT4</td><td>10×</td><td>85%</td></tr>
              <tr><td>极致成本</td><td>70B→8B</td><td>蒸馏 + AWQ INT4</td><td>35×</td><td>80%</td></tr>
            </tbody>
          </table>
        </div>

        <div className="info-card">
          <h3>压缩技术组合顺序</h3>
          <div className="code-block">
{`推荐顺序 (从高到低优先级):
┌───────────────────────────────┐
│ 1. 知识蒸馏 (如果可接受小模型) │
│    405B → 70B → 8B            │
│    最大压缩比, 但需要训练      │
├───────────────────────────────┤
│ 2. 量化 (必做)                │
│    FP16 → FP8/INT8 → INT4    │
│    开箱即用, 效果确定         │
├───────────────────────────────┤
│ 3. 结构化剪枝/层删除         │
│    删除冗余 attention heads    │
│    需要评估 + 少量微调        │
├───────────────────────────────┤
│ 4. 2:4 稀疏化 (锦上添花)     │
│    需要 Ampere+ GPU           │
│    额外 1.3-1.5× 加速        │
└───────────────────────────────┘

注意: 量化 + 剪枝 同时使用需要
小心精度叠加损失, 建议单独评估`}
          </div>
        </div>
      </div>
    </section>
  );
}
