import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 03 — vLLM 高性能推理
   PagedAttention / Continuous Batching
   ───────────────────────────────────────────── */

const VLLM_FEATURES = [
  { name: 'PagedAttention', icon: '📄', desc: 'KV Cache 分页管理，像操作系统的虚拟内存一样管理 GPU 显存',
    detail: '传统方法预分配固定大小 KV Cache，浪费 60-80% 显存。PagedAttention 按需分配 4KB 页，显存利用率 >95%。',
    impact: '吞吐量提升 2-4x，支持更长上下文和更多并发' },
  { name: 'Continuous Batching', icon: '🔄', desc: '请求级动态批处理，不等齐就开跑',
    detail: '传统 Static Batching 要等一批请求都完成才开始下一批。Continuous Batching 在每个 step 插入新请求、移除完成的请求。',
    impact: '延迟降低 50%+，吞吐量提升 5-10x（vs naive batching）' },
  { name: 'Tensor Parallelism', icon: '🔗', desc: '多 GPU 张量并行，单模型跨多卡推理',
    detail: '通过 Megatron 风格的张量并行，将注意力头和 FFN 层分布到多个 GPU 上。NCCL 通信，接近线性加速。',
    impact: '70B 模型 4×A100 = ~100 tok/s，405B 模型 8×H100 可运行' },
  { name: 'Speculative Decoding', icon: '🏃', desc: '投机解码，用小模型草拟 + 大模型验证',
    detail: '小模型（如 1B）快速生成 K 个候选 Token，大模型一次验证。命中率 70-90% 时，速度提升 2-3x。',
    impact: '降低延迟而不损失质量，适合延迟敏感场景' },
];

export default function LessonVLLM() {
  const [featIdx, setFeatIdx] = useState(0);

  return (
    <div className="lesson-deploy">
      <div className="dp-badge blue">🚀 module_03 — vLLM</div>

      <div className="dp-hero">
        <h1>vLLM：生产级 LLM 推理引擎</h1>
        <p>
          vLLM 是当前最流行的高性能 LLM 推理框架——<strong>PagedAttention</strong> 
          和 <strong>Continuous Batching</strong> 让它的吞吐量比 HuggingFace Transformers 
          高 10-24 倍。本模块从原理到生产配置，让你掌握 vLLM 的全部能力。
        </p>
      </div>

      {/* ─── 核心特性 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">⚡ 四大核心技术</h2>
        <div className="dp-pills">
          {VLLM_FEATURES.map((f, i) => (
            <button key={i} className={`dp-btn ${i === featIdx ? 'primary' : 'blue'}`}
              onClick={() => setFeatIdx(i)} style={{ fontSize: '0.78rem' }}>
              {f.icon} {f.name}
            </button>
          ))}
        </div>
        <div className="dp-card docker">
          <h3 style={{ margin: '0 0 0.5rem', color: '#60a5fa' }}>{VLLM_FEATURES[featIdx].icon} {VLLM_FEATURES[featIdx].name}</h3>
          <p style={{ color: '#e2e8f0', margin: '0 0 0.5rem', lineHeight: 1.7 }}>{VLLM_FEATURES[featIdx].desc}</p>
          <p style={{ color: '#94a3b8', margin: '0 0 0.75rem', fontSize: '0.88rem', lineHeight: 1.7 }}>{VLLM_FEATURES[featIdx].detail}</p>
          <div className="dp-alert success">
            <strong>📈 性能影响：</strong>{VLLM_FEATURES[featIdx].impact}
          </div>
        </div>
      </div>

      {/* ─── 快速上手 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🚀 vLLM 快速上手</h2>
        <div className="dp-code-wrap">
          <div className="dp-code-head">
            <span className="dp-code-dot" style={{ background: '#ef4444' }} />
            <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
            <span className="dp-code-dot" style={{ background: '#22c55e' }} />
            🖥️ vllm_quickstart.sh
          </div>
          <pre className="dp-code">{`# ─── 安装 ───
pip install vllm

# ─── 方法 1: 命令行启动 OpenAI 兼容服务 ───
vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --tensor-parallel-size 1 \\       # GPU 数量
  --max-model-len 8192 \\           # 最大上下文
  --gpu-memory-utilization 0.9 \\   # GPU 显存使用率
  --dtype auto \\                    # 自动选择精度
  --quantization awq               # 可选量化

# 测试 (OpenAI 兼容!)
curl http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "meta-llama/Llama-3.1-8B-Instruct",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 512
  }'`}</pre>
        </div>
      </div>

      {/* ─── Python API ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🐍 Python API 高级用法</h2>
        <div className="dp-code-wrap">
          <div className="dp-code-head">
            <span className="dp-code-dot" style={{ background: '#ef4444' }} />
            <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
            <span className="dp-code-dot" style={{ background: '#22c55e' }} />
            🐍 vllm_advanced.py
          </div>
          <pre className="dp-code">{`from vllm import LLM, SamplingParams

# ─── 离线批量推理 ───
llm = LLM(
    model="meta-llama/Llama-3.1-8B-Instruct",
    tensor_parallel_size=2,       # 2 GPU 并行
    max_model_len=8192,
    gpu_memory_utilization=0.9,
    trust_remote_code=True,
)

sampling = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
    stop=["<|eot_id|>"],
)

# 批量处理（vLLM 自动优化 batching）
prompts = [
    "Explain quantum computing in simple terms.",
    "Write a Python function for binary search.",
    "What is the capital of France?",
]
outputs = llm.generate(prompts, sampling)

for output in outputs:
    print(f"Prompt: {output.prompt[:50]}...")
    print(f"Output: {output.outputs[0].text[:100]}...")
    print(f"Tokens: {len(output.outputs[0].token_ids)}")
    print("---")

# ─── 多 LoRA 适配器 ───
from vllm.lora.request import LoRARequest

llm = LLM(
    model="meta-llama/Llama-3.1-8B-Instruct",
    enable_lora=True,
    max_loras=4,                  # 同时最多 4 个 LoRA
    max_lora_rank=64,
)

# 不同请求使用不同 LoRA
output_medical = llm.generate(
    ["Diagnose this symptom..."],
    sampling,
    lora_request=LoRARequest("medical", 1, "path/to/medical-lora")
)
output_legal = llm.generate(
    ["Interpret this contract..."],
    sampling,
    lora_request=LoRARequest("legal", 2, "path/to/legal-lora")
)`}</pre>
        </div>
      </div>

      {/* ─── 性能调优 ─── */}
      <div className="dp-section">
        <h2 className="dp-section-title">🔧 性能调优关键参数</h2>
        <div className="dp-card">
          <table className="dp-table">
            <thead><tr><th>参数</th><th>默认</th><th>说明</th><th>调优建议</th></tr></thead>
            <tbody>
              {[
                ['--gpu-memory-utilization', '0.9', 'GPU 显存使用率', '高并发设 0.95，OOM 降到 0.8'],
                ['--max-model-len', '模型最大', '最大上下文窗口', '按实际需求设小可省显存'],
                ['--tensor-parallel-size', '1', 'GPU 并行数', '70B→2-4, 405B→8'],
                ['--max-num-seqs', '256', '最大并发序列', '高并发调高，显存不足调低'],
                ['--enforce-eager', 'False', '禁用 CUDA Graph', 'Debug 时开启，生产关闭'],
                ['--quantization', 'None', '量化方法', 'awq 最佳平衡, gptq 也可'],
                ['--kv-cache-dtype', 'auto', 'KV Cache 精度', 'fp8 可省 50% KV Cache 显存'],
                ['--enable-prefix-caching', 'False', '前缀复用缓存', '长 System Prompt 场景必开'],
              ].map(([p, d, desc, tip], i) => (
                <tr key={i}>
                  <td><code style={{ color: '#60a5fa', fontSize: '0.75rem' }}>{p}</code></td>
                  <td style={{ color: '#fde047' }}>{d}</td>
                  <td style={{ color: '#94a3b8' }}>{desc}</td>
                  <td style={{ color: '#86efac', fontSize: '0.82rem' }}>{tip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dp-nav">
        <button className="dp-btn">← Ollama</button>
        <button className="dp-btn blue">TGI & Triton →</button>
      </div>
    </div>
  );
}
