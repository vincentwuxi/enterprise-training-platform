import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['RNN/LSTM', 'Attention 机制', 'Transformer', 'GPT & BERT'];

export default function LessonSequenceModels() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🔤 module_03 — 序列模型与 Transformer</div>
      <div className="fs-hero">
        <h1>序列模型与 Transformer：从 RNN 到 Attention is All You Need</h1>
        <p>
          Transformer 是<strong>大模型时代的地基</strong>。本模块从 RNN/LSTM 的
          序列建模出发，解析注意力机制的数学推导，完整拆解 Transformer 的
          Multi-Head Attention、位置编码、Layer Normalization，最终理解
          <strong>GPT (Decoder-only) 和 BERT (Encoder-only)</strong> 为何主导了 NLP。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧩 序列建模</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔁 RNN 与 LSTM</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> rnn_lstm</div>
                <pre className="fs-code">{`# 循环神经网络: 处理序列数据的经典方法

import torch
import torch.nn as nn

# ═══ 1. Vanilla RNN ═══
# h_t = tanh(W_hh · h_{t-1} + W_xh · x_t + b)
# y_t = W_hy · h_t
# 问题: 梯度消失 → 无法捕捉长距离依赖
rnn = nn.RNN(input_size=128, hidden_size=256, num_layers=2, batch_first=True)

# ═══ 2. LSTM (Long Short-Term Memory, 1997) ═══
# 核心: Cell State (记忆传送带) + 三个门控
#
# 遗忘门: f_t = σ(W_f · [h_{t-1}, x_t] + b_f)
#   → 决定丢弃哪些旧信息
# 输入门: i_t = σ(W_i · [h_{t-1}, x_t] + b_i)
#   → 决定存储哪些新信息
# 候选值: C̃_t = tanh(W_C · [h_{t-1}, x_t] + b_C)
# Cell 更新: C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t
# 输出门: o_t = σ(W_o · [h_{t-1}, x_t] + b_o)
# 隐藏态: h_t = o_t ⊙ tanh(C_t)

lstm = nn.LSTM(
    input_size=128,
    hidden_size=256,
    num_layers=2,
    batch_first=True,
    bidirectional=True,  # 双向 LSTM
    dropout=0.3,
)

# LSTM 文本分类
class TextClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, 
                           batch_first=True, bidirectional=True)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
    
    def forward(self, x):
        emb = self.embed(x)                    # (B, T, E)
        output, (h_n, c_n) = self.lstm(emb)    # (B, T, 2H)
        # 取最后一个时间步的双向隐藏态
        hidden = torch.cat([h_n[-2], h_n[-1]], dim=1)
        return self.fc(hidden)

# ═══ 3. GRU (Gated Recurrent Unit) ═══
# LSTM 的简化版: 合并遗忘门+输入门, 无 Cell State
# 参数更少, 效果相当
gru = nn.GRU(input_size=128, hidden_size=256, batch_first=True)

# ═══ RNN 家族局限性 ═══
# 1. 顺序计算 → 无法并行化 → 训练慢
# 2. 长距离依赖仍然困难 (即使 LSTM)
# 3. 固定大小隐藏向量 = 信息瓶颈
# → Attention 机制解决了这些问题!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 注意力机制 (Attention)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> attention_mechanism</div>
                <pre className="fs-code">{`# 注意力: 让模型"关注"最相关的信息

# ═══ 1. Seq2Seq 的瓶颈 ═══
# Encoder 将整个句子压缩为一个固定向量 → 信息丢失
# 注意力: 解码时动态回看编码器的所有位置

# ═══ 2. Bahdanau Attention (2014) ═══
# score(s_t, h_i) = v^T · tanh(W_s·s_t + W_h·h_i)
# α_ti = softmax(score)   → 注意力权重
# context = Σ α_ti · h_i  → 上下文向量

# ═══ 3. Scaled Dot-Product Attention ═══
# 最简洁最强大的形式 (Transformer 的核心)
#
# Attention(Q, K, V) = softmax(Q·K^T / √d_k) · V
#
# Q (Query):  "我在找什么?"
# K (Key):    "我有什么特征?"
# V (Value):  "我的实际内容"
# √d_k:       缩放因子, 防止 softmax 饱和

import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    # 计算注意力分数
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    
    # 因果掩码 (GPT 解码时用)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))
    
    # Softmax → 注意力权重
    attn_weights = F.softmax(scores, dim=-1)
    
    # 加权求和 → 输出
    output = torch.matmul(attn_weights, V)
    return output, attn_weights

# ═══ 4. 自注意力 (Self-Attention) ═══
# Q = K = V 都来自同一个序列
# 每个 token 都关注序列中的所有 token
# → 直接捕捉任意距离的依赖关系!
#
# "The cat sat on the mat because it was tired"
#  → "it" 会注意到 "cat" (远距离指代消解)

# ═══ 注意力可视化 ═══
#        The  cat  sat  on  the  mat
# The  [ 0.1  0.1  0.2  0.1  0.3  0.2 ]
# cat  [ 0.1  0.4  0.1  0.1  0.1  0.2 ]
# sat  [ 0.1  0.2  0.3  0.2  0.1  0.1 ]
# ...  (每行是一个 query 对所有 key 的权重)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Transformer 完整拆解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> transformer_architecture</div>
                <pre className="fs-code">{`# "Attention is All You Need" (Vaswani et al., 2017)
# 论文引用 > 13 万次 — AI 领域最重要的论文

# ═══ Transformer 结构 ═══
#
# Encoder (×N):          Decoder (×N):
# ┌─────────────┐        ┌─────────────────┐
# │ Multi-Head  │        │ Masked Multi-   │
# │ Attention   │        │ Head Attention   │
# │ (Self)      │        │ (Self, Causal)   │
# ├─────────────┤        ├─────────────────┤
# │ Add & Norm  │        │ Add & Norm      │
# ├─────────────┤        ├─────────────────┤
# │ Feed        │  ←───  │ Cross-Attention │
# │ Forward     │        │ (Enc-Dec)       │
# ├─────────────┤        ├─────────────────┤
# │ Add & Norm  │        │ Feed Forward    │
# └─────────────┘        └─────────────────┘

import torch.nn as nn

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, n_heads=8):
        super().__init__()
        self.d_k = d_model // n_heads
        self.n_heads = n_heads
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, Q, K, V, mask=None):
        B, T, D = Q.size()
        # 多头分割: (B, T, D) → (B, H, T, d_k)
        q = self.W_q(Q).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        k = self.W_k(K).view(B, -1, self.n_heads, self.d_k).transpose(1, 2)
        v = self.W_v(V).view(B, -1, self.n_heads, self.d_k).transpose(1, 2)
        
        # Scaled Dot-Product Attention
        scores = (q @ k.transpose(-2, -1)) / (self.d_k ** 0.5)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        attn = scores.softmax(dim=-1)
        out = attn @ v
        
        # 合并多头: (B, H, T, d_k) → (B, T, D)
        out = out.transpose(1, 2).contiguous().view(B, T, D)
        return self.W_o(out)

# ═══ 位置编码 (Positional Encoding) ═══
# Transformer 没有顺序概念 → 需要位置信息
# PE(pos, 2i)   = sin(pos / 10000^(2i/d))
# PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
# 现代: RoPE (Rotary Position Embedding)

# ═══ Feed-Forward Network ═══
# FFN(x) = GELU(x·W₁ + b₁)·W₂ + b₂
# 通常 d_ff = 4 × d_model (扩张→压缩)
ffn = nn.Sequential(
    nn.Linear(512, 2048),
    nn.GELU(),
    nn.Linear(2048, 512),
)

# ═══ 为什么 Transformer 如此成功? ═══
# 1. 完全并行: 无需顺序计算 (RNN 不行)
# 2. 全局感受野: 每个token看到所有token
# 3. 可扩展性: 参数/数据/算力 三项缩放`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 GPT vs BERT: 两条路线</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> gpt_vs_bert</div>
                <pre className="fs-code">{`# Transformer 的两大应用范式

# ═══ BERT (Encoder-only, 2018, Google) ═══
# Bidirectional Encoder Representations from Transformers
# 
# 预训练任务:
# 1. MLM (Masked Language Model):
#    "The [MASK] sat on the mat" → "cat"
#    随机遮住 15% token, 让模型预测
# 2. NSP (Next Sentence Prediction):
#    判断两个句子是否相邻
#
# 特征: 双向理解 → 适合理解类任务
# 应用: 文本分类 / NER / 问答 / 语义相似度

# ═══ GPT (Decoder-only, 2018, OpenAI) ═══
# Generative Pre-trained Transformer
#
# 预训练任务:
#   自回归语言模型: P(x_t | x_1, ..., x_{t-1})
#   从左到右逐 token 预测下一个
#
# GPT-1 (117M) → GPT-2 (1.5B) → GPT-3 (175B) → GPT-4 (?)
# 
# 特征: 单向生成 → 适合生成类任务
# 应用: 文本生成 / 对话 / 代码 / 推理

# ═══ 架构对比 ═══
# ┌──────────┬───────────────┬──────────────┬──────────────┐
# │          │ BERT          │ GPT          │ T5           │
# ├──────────┼───────────────┼──────────────┼──────────────┤
# │ 结构     │ Encoder-only  │ Decoder-only │ Enc-Dec      │
# │ 方向     │ 双向          │ 单向(左→右)  │ 双向+单向    │
# │ 预训练   │ MLM + NSP     │ 自回归       │ Span Corrupt │
# │ 生成能力 │ 弱            │ 强           │ 强(seq2seq)  │
# │ 理解能力 │ 强            │ 中→强(规模) │ 强           │
# │ 代表     │ BERT/RoBERTa  │ GPT-4/LLaMA  │ T5/Flan-T5   │
# └──────────┴───────────────┴──────────────┴──────────────┘

# ═══ 为什么 GPT 路线胜出? ═══
# 1. 缩放定律 (Scaling Law): 参数越多越智能
# 2. In-Context Learning: 无需微调, 给几个例子就能学
# 3. 涌现能力: 超过某个规模突然获得新能力
# 4. 工程简单: 自回归 = 只需 KV-Cache, 易于部署

# ═══ 2024 趋势 ═══
# Decoder-only 成为绝对主流:
# GPT-4, Claude, Gemini, LLaMA, Qwen, DeepSeek
# → BERT 仍有价值(嵌入模型/小型分类), 但不再是主角`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
