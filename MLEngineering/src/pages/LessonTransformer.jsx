import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Attention 权重热力图模拟器
function AttentionHeatmap() {
  const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  const [queryToken, setQueryToken] = useState(1); // "cat"

  // 模拟 attention scores
  const ATTENTION = [
    [0.05, 0.35, 0.15, 0.10, 0.05, 0.30],  // The
    [0.10, 0.30, 0.25, 0.08, 0.07, 0.20],  // cat
    [0.08, 0.28, 0.30, 0.12, 0.08, 0.14],  // sat
    [0.05, 0.10, 0.15, 0.35, 0.20, 0.15],  // on
    [0.05, 0.08, 0.10, 0.15, 0.40, 0.22],  // the
    [0.08, 0.25, 0.18, 0.12, 0.12, 0.25],  // mat
  ];

  const scores = ATTENTION[queryToken];
  const maxScore = Math.max(...scores);

  return (
    <div className="ml-interactive">
      <h3>🎯 Self-Attention 权重热力图（点击 Query Token 查看注意力分布）</h3>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Token 选择 */}
        <div>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.4rem', fontWeight: 700 }}>点击设为 Query Token：</div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {TOKENS.map((tok, i) => (
              <button key={i} onClick={() => setQueryToken(i)}
                style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: i === queryToken ? 900 : 500, fontSize: '0.8rem', transition: 'all 0.15s', fontFamily: 'JetBrains Mono',
                  background: i === queryToken ? 'rgba(100,190,250,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${i === queryToken ? '#60a5fa80' : 'rgba(255,255,255,0.08)'}`,
                  color: i === queryToken ? '#60a5fa' : '#6b7280' }}>
                {tok}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#4b5563' }}>
            Query: <span style={{ color: '#60a5fa', fontWeight: 800 }}>"{TOKENS[queryToken]}"</span> 关注了 →
          </div>
        </div>

        {/* 热力图 */}
        <div>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.4rem', fontWeight: 700 }}>Attention Weights（越亮=权重越高）：</div>
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            {scores.map((score, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.2rem', transition: 'all 0.3s',
                  background: `rgba(96,165,250,${score / maxScore * 0.8 + 0.05})`,
                  border: `1px solid rgba(96,165,250,${score / maxScore * 0.6})`,
                  boxShadow: score === maxScore ? '0 0 12px rgba(96,165,250,0.4)' : 'none' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: score > 0.2 ? '#fff' : '#9ca3af', fontWeight: 700 }}>{score.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: i === queryToken ? '#60a5fa' : '#6b7280', fontWeight: i === queryToken ? 800 : 500 }}>{TOKENS[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#4b5563', lineHeight: 1.7 }}>
        💡 "{TOKENS[queryToken]}" 最关注 "{TOKENS[scores.indexOf(maxScore)]}"（分数：{maxScore.toFixed(2)}）。这正是 Attention 的本质：每个 token 动态"询问"其它 token 有多重要。
      </div>
    </div>
  );
}

const TRANSFORMER_CODE = `# Transformer 从零实现：Self-Attention + BERT + GPT 结构

import torch
import torch.nn as nn
import torch.nn.functional as F
import math

# ══════════════ 1. 缩放点积注意力（核心机制）══════════════
class ScaledDotProductAttention(nn.Module):
    """
    Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k) · V
    
    Q: Query（"我要查什么？"）
    K: Key  （"我有什么可查？"）
    V: Value（"查到了给你什么？"）
    d_k: 键的维度，用于缩放防止梯度消失
    """
    def forward(self, Q, K, V, mask=None):
        d_k = Q.size(-1)
        
        # 1. 计算相似度得分（Q和K的点积）
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
        
        # 2. 应用掩码（GPT 用因果掩码，防止看到未来 token）
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        # 3. softmax 归一化（得到注意力权重）
        attn_weights = F.softmax(scores, dim=-1)  # 每行之和=1
        
        # 4. 加权求值
        output = torch.matmul(attn_weights, V)
        return output, attn_weights

# ══════════════ 2. 多头注意力（Multi-Head Attention）══════════════
class MultiHeadAttention(nn.Module):
    """
    多头：在 h 个子空间中并行做注意力，捕捉不同类型的依赖关系
    """
    def __init__(self, d_model: int, n_heads: int):
        super().__init__()
        assert d_model % n_heads == 0
        self.d_k = d_model // n_heads
        self.n_heads = n_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.attention = ScaledDotProductAttention()
    
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        
        # 线性映射 + 分头（[B, L, d_model] → [B, h, L, d_k]）
        Q = self.W_q(Q).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        
        # 并行注意力
        out, weights = self.attention(Q, K, V, mask)  # [B, h, L, d_k]
        
        # 合并多头
        out = out.transpose(1, 2).contiguous().view(batch_size, -1, self.n_heads * self.d_k)
        return self.W_o(out)

# ══════════════ 3. Transformer Encoder Block ══════════════
class TransformerBlock(nn.Module):
    def __init__(self, d_model: int = 768, n_heads: int = 12, ff_dim: int = 3072, dropout: float = 0.1):
        super().__init__()
        self.attention = MultiHeadAttention(d_model, n_heads)
        self.ff = nn.Sequential(
            nn.Linear(d_model, ff_dim),
            nn.GELU(),                       # BERT/GPT 用 GELU（比 ReLU 更平滑）
            nn.Dropout(dropout),
            nn.Linear(ff_dim, d_model),
        )
        self.norm1 = nn.LayerNorm(d_model)   # Pre-LN（更稳定）
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        # Self-Attention + 残差连接 + Layer Norm
        x = x + self.dropout(self.attention(self.norm1(x), self.norm1(x), self.norm1(x), mask))
        # Feed-Forward + 残差 + Norm
        x = x + self.dropout(self.ff(self.norm2(x)))
        return x

# ══════════════ 4. 使用 HuggingFace 快速应用 ══════════════
from transformers import AutoModel, AutoTokenizer, pipeline

# BERT 文本分类（Pre-trained → Fine-tuned）
tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")
model = AutoModel.from_pretrained("bert-base-chinese")

# Tokenization
tokens = tokenizer("这个产品非常好用！", return_tensors="pt", padding=True, truncation=True)
# → {'input_ids': tensor([[101, 100, ... 102]]), 'attention_mask': ...}

output = model(**tokens)
cls_embedding = output.last_hidden_state[:, 0, :]  # [CLS] token 的向量 = 句子表示
print(cls_embedding.shape)  # → torch.Size([1, 768])

# 情感分析（一行搞定）
classifier = pipeline("sentiment-analysis", model="IDEA-CCNL/Erlangshen-Roberta-110M-Sentiment")
result = classifier("这个产品非常好用！")
# → [{'label': 'positive', 'score': 0.98}]`;

export default function LessonTransformer() {
  const navigate = useNavigate();

  return (
    <div className="lesson-ml">
      <div className="ml-badge blue">🤖 module_04 — Transformer & BERT</div>
      <div className="ml-hero">
        <h1>Transformer：Self-Attention / BERT / GPT / HuggingFace</h1>
        <p>2017 年 "Attention Is All You Need" 论文改变了整个 AI 领域。<strong>Self-Attention</strong> 让每个 token 动态关注其它 token，<strong>BERT</strong> 用 Encoder 做理解，<strong>GPT</strong> 用 Decoder 做生成，HuggingFace 让你一行代码用上它们。</p>
      </div>

      <AttentionHeatmap />

      <div className="ml-section">
        <h2 className="ml-section-title">🧮 Transformer 从零实现代码</h2>
        <div className="ml-code-wrap">
          <div className="ml-code-head"><div className="ml-code-dot" style={{ background: '#3b82f6' }}/><div className="ml-code-dot" style={{ background: '#8b5cf6' }}/><div className="ml-code-dot" style={{ background: '#10b981' }}/><span style={{ color: '#60a5fa', marginLeft: '0.5rem' }}>🤖 transformer.py</span></div>
          <div className="ml-code" style={{ maxHeight: 450, overflowY: 'auto' }}>{TRANSFORMER_CODE}</div>
        </div>
      </div>

      <div className="ml-nav">
        <button className="ml-btn" onClick={() => navigate('/course/ml-engineering/lesson/cnn')}>← 上一模块</button>
        <button className="ml-btn primary" onClick={() => navigate('/course/ml-engineering/lesson/finetuning')}>下一模块：Fine-tuning →</button>
      </div>
    </div>
  );
}
