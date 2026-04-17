import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Mamba/SSM', 'Mixture of Experts', 'RWKV', '技术展望'];

export default function LessonFrontierArch() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔮 module_08 — 前沿架构</div>
      <div className="fs-hero">
        <h1>前沿架构：Mamba / Mixture of Experts / RWKV — 超越 Transformer</h1>
        <p>
          Transformer 统治了 2017-2024，但它的<strong>二次复杂度瓶颈</strong>
          催生了新一代架构。本模块深入解析<strong>状态空间模型 (Mamba)</strong>
          的线性注意力、<strong>混合专家 (MoE)</strong> 的条件计算、
          <strong>RWKV 的线性 Transformer</strong>，以及超长上下文（10M+ tokens）
          的前沿探索。理解这些趋势，就理解了<strong>下一代 AI 基础设施</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔮 前沿架构</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐍 Mamba: 状态空间模型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> mamba_ssm</div>
                <pre className="fs-code">{`# Mamba (Gu & Dao, 2023): 超越 Transformer 的挑战者

# ═══ Transformer 的瓶颈 ═══
# Self-Attention: O(N²) 复杂度
# - N=2K: 4M 次计算 → 可以
# - N=128K: 16B 次计算 → 很慢
# - N=1M: 1T 次计算 → 不可行
# 目标: O(N) 的序列建模方法

# ═══ 状态空间模型 (SSM) ═══
# 来自控制理论的连续时间系统:
# ẋ(t) = A·x(t) + B·u(t)    (状态方程)
# y(t) = C·x(t) + D·u(t)    (输出方程)
#
# 离散化后:
# x_k = Ā·x_{k-1} + B̄·u_k
# y_k = C·x_k
# → 类似 RNN, 但有特殊的矩阵结构 (HiPPO)

# ═══ S4: Structured State Spaces ═══
# 关键发现: A 矩阵用 HiPPO 初始化
# → 能高效记忆长距离依赖
# HiPPO: 最优多项式逼近, 压缩历史信息

# ═══ Mamba: Selective SSM ═══
# S4 的问题: A, B, C 是固定的 → 内容无关
# Mamba 创新: 让 B, C, Δ 依赖输入
#
# B = Linear(x)     ← 输入相关!
# C = Linear(x)     ← 输入相关!
# Δ = softplus(Linear(x)) ← 选择性遗忘
#
# → "选择性"扫描: 决定保留/遗忘哪些信息
# 类比: Transformer 的 attention 是"全局查询"
#       Mamba 的选择性是"流式过滤"

# ═══ Mamba 架构 ═══
mamba_arch = {
    "核心":    "选择性 SSM + 硬件感知扫描",
    "复杂度":  "O(N) 时间 + O(N) 空间",
    "推理":    "O(1) 每步 (像 RNN, 无需 KV-Cache!)",
    "训练":    "并行扫描算法 (像 CNN)",
    "参数":    "仅 Transformer 的 60%",
}

# ═══ Mamba-2 (2024) ═══
# 统一 SSM 和 Attention:
# SSD (Structured State Space Duality)
# → 证明 SSM ≈ 某种结构化注意力
# → 可以混合 SSM 层和 Attention 层

# ═══ 性能对比 ═══
# ┌──────────┬──────────────┬──────────────┐
# │ 模型      │ 长文本速度    │ 质量         │
# ├──────────┼──────────────┼──────────────┤
# │ Transformer│ 慢 (O(N²))  │ 最佳         │
# │ Mamba     │ 快 (O(N))    │ 接近 (≤3B)   │
# │ Jamba     │ 混合         │ 兼顾         │
# └──────────┴──────────────┴──────────────┘
# 
# Jamba (AI21, 2024): 
# 混合 Transformer + Mamba 层 → 两者优势兼得`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧩 混合专家模型 (MoE)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> mixture_of_experts</div>
                <pre className="fs-code">{`# MoE: 条件计算 — 用更多参数但不增加推理成本

# ═══ 核心思想 ═══
# 不是每个 token 都用全部参数!
# Router 决定每个 token 激活哪些"专家"
# 参数量大 → 性能好
# 激活参数少 → 推理快

# ═══ MoE 层结构 ═══
# 替换 Transformer 中的 FFN:
#
# 标准 FFN:  x → W₁ → GELU → W₂ → out
# MoE:      x → Router → 选择 Top-K 专家
#                         Expert₁(x) * g₁
#                       + Expert₂(x) * g₂  → out
#
# Router: G(x) = softmax(W_g · x)  → 门控权重
# 每个 Expert = 独立的 FFN

# 伪代码:
# class MoELayer:
#   def forward(x):
#     gate_scores = router(x)          # (batch, n_experts)
#     top_k = gate_scores.topk(k=2)    # 选 Top-2
#     output = sum(gate[i] * expert[i](x) for i in top_k)
#     return output

# ═══ MoE 代表模型 ═══
moe_models = {
    "Switch Transformer (2022)": {
        "专家数": "2048 个",
        "总参数": "1.6T",
        "激活参数": "~1B (每次只用 1 个专家)",
        "特点": "Top-1 routing, 极致稀疏",
    },
    "Mixtral 8x7B (Mistral, 2024)": {
        "专家数": "8 个",
        "总参数": "46.7B",
        "激活参数": "12.9B (Top-2)",
        "性能": "≈ LLaMA-2-70B, 推理快 6x",
    },
    "DeepSeek-V3 (2024)": {
        "专家数": "256 个 (细粒度)",
        "总参数": "671B",
        "激活参数": "37B",
        "特点": "共享专家 + 路由专家",
    },
    "Qwen2-MoE (阿里)": {
        "总参数": "57B",
        "激活参数": "14B",
    },
}

# ═══ MoE 的挑战 ═══
moe_challenges = {
    "负载均衡":    "所有 token 涌向少数专家 → 辅助损失",
    "训练不稳定":  "路由器梯度稀疏 → z-loss / 噪声注入",
    "通信开销":    "专家分布在不同GPU → All-to-All 通信",
    "内存需求":    "所有专家都要加载 (即使只激活部分)",
    "推理调度":    "不同 token → 不同专家 → batch 效率低",
}

# ═══ MoE 的未来 ═══
# 1. 更细粒度: 256+ 专家 (DeepSeek-V3)
# 2. 专家特化: 不同专家处理不同语言/任务
# 3. 与 Mamba 混合: 稀疏 + 线性复杂度`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ RWKV: 线性 Transformer</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> rwkv</div>
                <pre className="fs-code">{`# RWKV: 结合 RNN 和 Transformer 的优势

# ═══ 核心理念 ═══
# Transformer 优势: 并行训练, 全局注意力
# RNN 优势: O(1) 推理, 无限上下文
# RWKV: 训练时像 Transformer, 推理时像 RNN

# ═══ RWKV 名称含义 ═══
# R: Receptance (接受门控)
# W: Weight (位置衰减权重)
# K: Key
# V: Value
# → 每个通道有独立的衰减率

# ═══ 核心机制: WKV ═══
# wkv_t = Σ (w^{t-i} · e^{k_i}) · v_i / Σ (w^{t-i} · e^{k_i})
# 
# w: 时间衰减因子 (每个通道独立, 可学习)
# → 越近的 token, 权重越大 (指数衰减)
# → 可以递归计算! O(1) per step

# ═══ RWKV vs Transformer ═══
comparison = {
    "训练并行性":  "RWKV ✅ | Transformer ✅",
    "推理复杂度":  "RWKV O(1) | Transformer O(N)",
    "上下文长度":  "RWKV ∞ | Transformer 有限",
    "全局注意力":  "RWKV ❌ | Transformer ✅",
    "KV-Cache":    "RWKV 不需要 | Transformer 需要",
    "内存占用":    "RWKV 常数 | Transformer 线性增长",
}

# ═══ RWKV 版本演进 ═══
rwkv_versions = {
    "RWKV-4 (2023)": "首个可用版本, 14B 参数",
    "RWKV-5 Eagle":  "多头机制 + 矩阵值状态",
    "RWKV-6 Finch":  "数据依赖的衰减, 更像 Mamba",
    "RWKV-7 Goose":  "2025, 状态演化 + 内积注意力",
}

# ═══ 对比: 三大线性复杂度架构 ═══
# ┌──────────┬──────────────┬──────────────┬──────────────┐
# │          │ Mamba        │ RWKV         │ RetNet       │
# ├──────────┼──────────────┼──────────────┼──────────────┤
# │ 来源     │ SSM (控制论) │ RNN+Attention│ Retention    │
# │ 选择性   │ 输入依赖     │ 位置衰减     │ 衰减注意力   │
# │ 并行训练 │ 扫描算法     │ 矩阵形式    │ 分块并行    │
# │ 推理     │ RNN 模式     │ RNN 模式    │ RNN 模式    │
# │ 生态     │ 学术→工业   │ 开源社区    │ 微软研究    │
# └──────────┴──────────────┴──────────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔭 2025 技术展望</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> frontier_outlook</div>
                <pre className="fs-code">{`# 深度学习前沿: 2025 技术趋势

# ═══ 1. 混合架构成为主流 ═══
hybrid_architectures = {
    "Jamba (AI21)":     "Transformer + Mamba",
    "Zamba (Zyphra)":   "Mamba + 共享 Attention",
    "Griffin (Google)":  "Gated Linear RNN + Attention",
    "Hymba (NVIDIA)":   "Mamba + 滑动窗口注意力",
    "趋势": "纯 Transformer 正在被混合架构取代",
}

# ═══ 2. 超长上下文 ═══
long_context = {
    "Gemini 2.0":  "2M tokens 上下文",
    "Claude 3.5":  "200K tokens",
    "GPT-4 Turbo": "128K tokens",
    "技术路线": {
        "RoPE 外推":     "YaRN / NTK-aware / ABF",
        "稀疏注意力":    "BigBird / Longformer",
        "Ring Attention": "序列并行分布式",
        "Mamba/SSM":      "原生线性复杂度",
    },
}

# ═══ 3. 推理时计算 (Test-Time Compute) ═══
test_time_compute = {
    "思维链 (CoT)":     "让模型'思考'更久",
    "Tree of Thoughts":  "搜索最优推理路径",
    "验证器 (ORM/PRM)": "奖励模型评估推理步骤",
    "o1/o3":            "OpenAI, 推理时扩展计算",
    "DeepSeek-R1":      "RL 训练长推理链",
    "趋势": "训练时 scaling → 推理时 scaling",
}

# ═══ 4. 多模态原生架构 ═══
multimodal_native = {
    "原生多模态": "文本/图像/音频/视频统一 token",
    "代表": "Gemini / GPT-4o / Chameleon",
    "技术": "所有模态共享 Transformer backbone",
    "挑战": "不同模态的分辨率/帧率差异",
}

# ═══ 5. 世界模型 ═══
world_models = {
    "JEPA (Yann LeCun)": "预测潜空间而非像素",
    "V-JEPA":            "视频理解的世界模型",
    "Sora":              "视频生成 = 世界模拟器?",
    "GAIA-1":            "自动驾驶世界模型",
    "目标": "从被动预测 → 主动理解物理规律",
}

# ═══ 学习路线图 ═══
# MLP → CNN → RNN → Transformer → GPT/BERT
#                                     ↓
#                              Diffusion / ViT
#                                     ↓
#                         Mamba / MoE / RWKV (前沿)
#                                     ↓
#                      多模态统一 / 世界模型 (未来)
#
# 关键: 掌握 Transformer 是基础, 
#       了解 Mamba/MoE 是趋势,
#       理解 scaling law 是核心!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
