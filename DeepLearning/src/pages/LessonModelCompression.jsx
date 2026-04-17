import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['知识蒸馏', '剪枝 & 量化', 'NAS', '部署优化'];

export default function LessonModelCompression() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">⚡ module_07 — 模型压缩与高效推理</div>
      <div className="fs-hero">
        <h1>模型压缩与高效推理：知识蒸馏 / 剪枝 / 量化 / NAS</h1>
        <p>
          大模型很强，但<strong>部署到端侧和生产环境</strong>需要高效推理。
          本模块覆盖知识蒸馏（DistilBERT/TinyLLaMA）、结构化剪枝、
          <strong>INT8/INT4/GPTQ/AWQ 量化</strong>、神经架构搜索（NAS），
          以及 ONNX/TensorRT/vLLM 部署优化的完整技术栈。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚡ 高效推理</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎓 知识蒸馏 (Knowledge Distillation)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> knowledge_distillation</div>
                <pre className="fs-code">{`# 知识蒸馏: 大模型教小模型

# ═══ 核心思想 (Hinton, 2015) ═══
# Teacher (大模型, 准确但慢) → Student (小模型, 快但弱)
# 不只学 hard label, 而是学 soft probability
#
# 例: 猫的图片
# Hard label: [1, 0, 0] (猫, 狗, 鸟)
# Soft label: [0.7, 0.2, 0.1] ← 包含"像狗"的信息!
# → 这种"暗知识"(dark knowledge)帮助小模型更好学习

# ═══ 蒸馏损失 ═══
# L = α·L_hard + (1-α)·L_soft
# L_hard = CE(student_logits, true_labels)
# L_soft = KL(softmax(s/T), softmax(t/T)) * T²
# T = temperature (通常 3~20, 越大分布越平滑)

import torch
import torch.nn as nn
import torch.nn.functional as F

class DistillationLoss(nn.Module):
    def __init__(self, temperature=4.0, alpha=0.7):
        super().__init__()
        self.T = temperature
        self.alpha = alpha
    
    def forward(self, student_logits, teacher_logits, labels):
        # 硬标签损失
        hard_loss = F.cross_entropy(student_logits, labels)
        
        # 软标签损失 (KL 散度)
        soft_student = F.log_softmax(student_logits / self.T, dim=1)
        soft_teacher = F.softmax(teacher_logits / self.T, dim=1)
        soft_loss = F.kl_div(soft_student, soft_teacher, 
                            reduction='batchmean') * (self.T ** 2)
        
        return self.alpha * soft_loss + (1 - self.alpha) * hard_loss

# ═══ 蒸馏实战 ═══
distillation_examples = {
    "DistilBERT":  "BERT-base → 60% 参数, 97% 性能",
    "TinyBERT":    "4 层, 14.5M 参数, 96% 性能",
    "MiniLM":      "12层→6层, 注意力蒸馏",
    "TinyLLaMA":   "1.1B 参数, 3T token 训练",
    "Gemma-2B":    "从 Gemini 蒸馏的小模型",
}

# ═══ 特征蒸馏 ═══
# 不只蒸馏输出, 还蒸馏中间层特征
# FitNets: 中间层 hint → 学生学更深表示
# PKT: 概率知识转移
# CRD: 对比蒸馏 (最佳效果)

# ═══ LLM 时代的蒸馏 ═══
# 1. 数据蒸馏: GPT-4 生成数据 → 训练小模型
# 2. 指令蒸馏: Alpaca/Vicuna (ChatGPT数据训练)
# 3. 推理蒸馏: DeepSeek-R1 → 蒸馏推理链路`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>✂️ 剪枝与量化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> pruning_quantization</div>
                <pre className="fs-code">{`# 剪枝和量化: 直接压缩模型

# ═══ 1. 模型剪枝 (Pruning) ═══
# 移除不重要的权重/通道/层

# 非结构化剪枝: 将小权重置零
import torch.nn.utils.prune as prune
model = nn.Linear(100, 50)
prune.l1_unstructured(model, name='weight', amount=0.3)
# 30% 最小权重 → 0 (但矩阵仍是稠密的)

# 结构化剪枝: 移除整个通道/层
prune.ln_structured(model, 'weight', amount=0.2, n=2, dim=0)
# → 实际减少计算量 (通道数减少)

# ═══ 2. 模型量化 (Quantization) ═══
# 将 FP32 (32位浮点) → INT8/INT4 (低位整数)
# → 模型大小减少 4-8x, 推理速度提升 2-4x

# 量化公式:
# q = round(x / scale + zero_point)
# x ≈ scale * (q - zero_point)  (反量化)

# 后训练量化 (PTQ): 不需要重新训练
import torch.quantization
model_fp32 = build_model()
model_int8 = torch.quantization.quantize_dynamic(
    model_fp32, {nn.Linear}, dtype=torch.qint8
)
# 大小: 400MB → 100MB

# ═══ 3. LLM 量化方法 ═══
llm_quantization = {
    "GPTQ": {
        "原理": "逐层量化, Hessian 矫正",
        "精度": "INT4, 几乎无损",
        "速度": "GPU 推理优化",
    },
    "AWQ": {
        "原理": "激活感知量化, 保护重要权重",
        "精度": "INT4, 略优于 GPTQ",
        "优势": "通用硬件兼容",
    },
    "GGUF": {
        "原理": "llama.cpp 格式, CPU 推理",
        "精度": "Q2~Q8 灵活选择",
        "优势": "M1/M2 Mac 友好",
    },
    "bitsandbytes": {
        "原理": "混合精度, INT4/NF4",
        "工具": "HuggingFace 集成",
        "QLoRA": "量化 + LoRA 微调",
    },
}

# ═══ 量化选型 ═══
# ┌──────────┬─────────┬──────────┬──────────┐
# │ 方法      │ 精度     │ 硬件      │ 场景     │
# ├──────────┼─────────┼──────────┼──────────┤
# │ GPTQ     │ INT4    │ GPU      │ 服务端   │
# │ AWQ      │ INT4    │ GPU/CPU  │ 通用     │
# │ GGUF     │ Q4~Q8   │ CPU/Mac  │ 本地    │
# │ QLoRA    │ NF4     │ GPU      │ 微调    │
# └──────────┴─────────┴──────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 神经架构搜索 (NAS)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> nas</div>
                <pre className="fs-code">{`# NAS: 让 AI 设计 AI 架构

# ═══ 核心问题 ═══
# ResNet/VGG/Transformer 都是人类设计的
# 能否自动搜索最优架构?

# ═══ 搜索空间 ═══
# 每一层的选择:
search_space = {
    "操作": ["3x3 conv", "5x5 conv", "3x3 depthwise",
             "skip connection", "max pool", "attention"],
    "通道数": [32, 64, 128, 256],
    "步幅":   [1, 2],
    "激活":   ["ReLU", "SiLU", "GELU"],
}
# 搜索空间大小: ~10^18 种可能!

# ═══ 搜索方法 ═══
nas_methods = {
    "强化学习 NAS (2017)": {
        "方法": "RNN 控制器生成架构, 验证精度作为 reward",
        "成本": "800 GPU·天 (~ $100K)",
        "代表": "NASNet",
    },
    "DARTS (2019)": {
        "方法": "连续松弛, 梯度优化 (可微分NAS)",
        "成本": "1.5 GPU·天",
        "优势": "1000x 加速",
    },
    "One-Shot NAS": {
        "方法": "训练一个超网络, 子网络共享权重",
        "代表": "OFA (Once-for-All)",
        "优势": "一次训练, 多种部署",
    },
    "EfficientNet (2019)": {
        "方法": "NAS 搜索基线 + 复合缩放",
        "成果": "SOTA ImageNet, 8.4x 小于之前",
    },
}

# ═══ Hardware-Aware NAS ═══
# 不只优化精度, 还优化:
# - 延迟 (ms)
# - 内存 (MB)
# - 能耗 (mW)
# 目标: max Accuracy s.t. Latency < 10ms

# ═══ NAS 在 LLM 时代 ═══
# 搜索 Transformer 配置:
# - 层数 vs 宽度 vs 头数
# - FFN 比例 (4x? 8x?)
# - Attention 变体 (GQA? MQA?)
# → Llama 3: 研究过不同配置的 scaling 效果`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 部署优化工具链</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> deployment</div>
                <pre className="fs-code">{`# 从训练到生产的推理优化

# ═══ 1. ONNX Runtime ═══
# 跨平台推理框架
# PyTorch → ONNX → ONNX Runtime
import torch
model = build_model()
torch.onnx.export(model, dummy_input, "model.onnx",
                  dynamic_axes={'input': {0: 'batch'}})
# onnxruntime 推理:
# import onnxruntime as ort
# sess = ort.InferenceSession("model.onnx")
# result = sess.run(None, {"input": data})

# ═══ 2. TensorRT (NVIDIA) ═══
# GPU 推理加速 (2-6x speedup)
# 自动: 层融合 / kernel 优化 / 精度校准
# FP32 → FP16 → INT8 逐步加速
# 典型: ResNet-50 从 7ms → 1.2ms

# ═══ 3. vLLM (LLM 推理) ═══
# PagedAttention: 动态 KV-Cache 管理
# Continuous Batching: 动态请求合并
# → 吞吐量提升 2-24x
vllm_features = {
    "PagedAttention": "类似 OS 虚拟内存管理 KV-Cache",
    "Tensor Parallel": "多 GPU 分割模型",
    "Prefix Caching":  "系统提示词复用",
    "Speculative Decoding": "小模型草拟 + 大模型验证",
}
# python -m vllm.entrypoints.openai.api_server \\
#   --model meta-llama/Llama-3-8B-Instruct

# ═══ 4. 端侧推理框架 ═══
edge_frameworks = {
    "TensorFlow Lite":  "手机 (Android/iOS)",
    "Core ML":          "Apple 设备",
    "MNN (阿里)":       "移动端高性能",
    "NCNN (腾讯)":      "移动端/嵌入式",
    "llama.cpp":        "CPU 上跑 LLM",
    "MLC-LLM":          "跨平台 LLM 部署",
    "ExecuTorch":       "Meta, PyTorch 端侧",
}

# ═══ 5. 推理加速技巧 ═══
optimization_tricks = {
    "Flash Attention":    "IO-aware 注意力 (2-4x)",
    "KV-Cache":           "避免重复计算",
    "Speculative Decode": "小模型预测, 大模型验证",
    "Batch Processing":   "批量处理请求",
    "Model Sharding":     "模型切分到多 GPU",
    "Continuous Batching": "动态批处理",
}

# ═══ 选型总结 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │ 场景          │ 工具          │ 加速比       │
# ├──────────────┼──────────────┼──────────────┤
# │ GPU CV/NLP   │ TensorRT     │ 2-6x         │
# │ GPU LLM      │ vLLM/TGI     │ 2-24x        │
# │ CPU 推理     │ ONNX Runtime │ 2-3x         │
# │ 手机端       │ TFLite/CoreML│ 3-10x        │
# │ 本地 LLM     │ llama.cpp    │ CPU 可跑!    │
# └──────────────┴──────────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
