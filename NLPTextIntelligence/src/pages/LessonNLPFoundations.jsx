import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['文本预处理', '词向量', '文本表示', '语言模型'];

export default function LessonNLPFoundations() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">📝 module_01 — NLP 基础</div>
      <div className="fs-hero">
        <h1>NLP 基础：分词 / 词向量 / 文本表示 — 文本智能的数学基石</h1>
        <p>
          一切 NLP 系统的起点是<strong>如何将文本转化为计算机可处理的数值表示</strong>。
          本模块从中英文分词出发，掌握 Word2Vec / GloVe / FastText 词向量原理，
          理解 TF-IDF → BoW → n-gram 语言模型的演进，构建从文本到向量的完整工程链路。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📝 NLP 基础</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>✂️ 文本预处理与分词</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> text_preprocessing</div>
              <pre className="fs-code">{`# NLP 预处理管线: 原始文本 → 结构化表示

# ═══ 英文预处理 ═══
import re
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

def preprocess_english(text):
    text = text.lower()                    # 1. 小写化
    text = re.sub(r'[^a-zA-Z0-9\\s]', '', text)  # 2. 去标点
    tokens = word_tokenize(text)           # 3. 分词 (空格 + 规则)
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]  # 4. 词形还原
    return tokens
# "The dogs are running quickly" → ["the", "dog", "be", "running", "quickly"]

# ═══ 中文分词 (核心难点!) ═══
# 中文没有天然空格分隔, 分词歧义多:
# "南京市长江大桥" → "南京市/长江/大桥" or "南京/市长/江大桥"?

# 方法演进:
chinese_segmentation = {
    "规则分词":   "正向/逆向最大匹配 (基于词典)",
    "统计分词":   "HMM / CRF (jieba 默认)",
    "深度分词":   "BiLSTM-CRF / BERT-CRF",
    "Subword":    "BPE / WordPiece / SentencePiece (LLM 标配)",
}

import jieba
text = "自然语言处理是人工智能的核心技术"
print(list(jieba.cut(text)))
# ['自然语言', '处理', '是', '人工智能', '的', '核心', '技术']

# ═══ Subword Tokenization (现代主流) ═══
# 为什么不用词级分词?
# 1. OOV 问题: 新词/罕见词无法表示
# 2. 词表过大: 中文可能 50 万+ 词
# 3. 形态变化: running/runs/ran 是不同词
#
# BPE (Byte-Pair Encoding):
# 从字符开始, 反复合并最频繁的字符对
# "lowest" → "l o w e s t" → "lo w est" → "low est"
# GPT 系列使用

# WordPiece (BERT 使用):
# 类似 BPE, 但用似然而非频率选择合并
# "unbelievable" → "un ##believ ##able"
# ## 前缀表示非词首

from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")
tokens = tokenizer.tokenize("自然语言处理是人工智能的核心技术")
# ['自', '然', '语', '言', '处', '理', '是', '人', '工', '智', '能', '的', '核', '心', '技', '术']
# BERT 中文: 字级别分词!`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎯 词向量 (Word Embeddings)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> word_embeddings</div>
              <pre className="fs-code">{`# 词向量: 将离散词映射到连续向量空间

# ═══ 分布式假设 ═══
# "You shall know a word by the company it keeps" —Firth, 1957
# 出现在相似上下文中的词, 语义也相似

# ═══ Word2Vec (Mikolov, 2013) ═══
# 两种架构:
# 1. CBOW:   上下文 → 预测中心词
# 2. Skip-gram: 中心词 → 预测上下文 (更常用)
#
# Skip-gram 目标:
# max Σ_{(w,c)} log P(c|w)
# P(c|w) = softmax(v_c · v_w)
# → 词表太大, softmax 太慢
# → Negative Sampling: 只更新少量负样本

from gensim.models import Word2Vec

sentences = [["自然", "语言", "处理"], ["深度", "学习", "模型"]]
model = Word2Vec(sentences, vector_size=100, window=5, min_count=1)

# 词向量的魔法:
# king - man + woman ≈ queen
# Paris - France + Japan ≈ Tokyo

# ═══ GloVe (Pennington, 2014) ═══
# Global Vectors: 结合全局共现统计和局部上下文
# 目标: f(w_i, w_j, w_k) 拟合 log X_{ij} (共现矩阵)
# J = Σ f(X_ij) · (w_i^T w_j + b_i + b_j - log X_ij)²

# ═══ FastText (Bojanowski, 2017) ═══
# 子词级别的词向量 → 解决 OOV!
# "apple" → <ap, app, ppl, ple, le>
# 词向量 = 子词向量之和
# 优势: 可以为未见过的词生成向量

# ═══ 词向量对比 ═══
# ┌──────────┬──────────────┬──────────────┬──────────────┐
# │          │ Word2Vec     │ GloVe        │ FastText     │
# ├──────────┼──────────────┼──────────────┼──────────────┤
# │ 训练方式 │ 局部窗口     │ 全局共现     │ 子词 + 窗口  │
# │ OOV 处理 │ ❌           │ ❌           │ ✅           │
# │ 多义词   │ ❌ 一词一向量│ ❌           │ ❌           │
# │ 语义组合 │ 线性类比     │ 线性类比     │ 词素感知     │
# │ 速度     │ 快           │ 中           │ 快           │
# └──────────┴──────────────┴──────────────┴──────────────┘
# → 静态词向量的根本问题: 无法处理一词多义!
# → 动态上下文词向量 (ELMo → BERT) 解决此问题`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📊 文本表示方法</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> text_representation</div>
              <pre className="fs-code">{`# 文本表示: 从词级别到文档级别

# ═══ 1. 词袋模型 (Bag of Words) ═══
from sklearn.feature_extraction.text import CountVectorizer
corpus = ["I love NLP", "NLP is fun", "I love deep learning"]
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(corpus)
# 词表: [deep, fun, is, learning, love, nlp]
# "I love NLP" → [0, 0, 0, 0, 1, 1]
# 问题: 丢失词序, 维度高, 稀疏

# ═══ 2. TF-IDF ═══
from sklearn.feature_extraction.text import TfidfVectorizer
# TF(t,d) = 词频 / 文档总词数
# IDF(t) = log(文档总数 / 包含词 t 的文档数)
# TF-IDF = TF × IDF
# → 常见词 (的/是/了) IDF 低, 特征词 IDF 高
tfidf = TfidfVectorizer()
X_tfidf = tfidf.fit_transform(corpus)
# 企业应用: 关键词提取 / 文档相似度 / 搜索排序

# ═══ 3. 词向量聚合 ═══
import numpy as np
def doc2vec_avg(doc_tokens, word_vectors, dim=300):
    """简单平均词向量"""
    vectors = [word_vectors[w] for w in doc_tokens if w in word_vectors]
    if not vectors:
        return np.zeros(dim)
    return np.mean(vectors, axis=0)

# 改进: TF-IDF 加权平均 / SIF (Smooth Inverse Frequency)

# ═══ 4. 句向量 ═══
sentence_methods = {
    "平均池化":     "BERT [CLS] 或 mean pooling",
    "Sentence-BERT": "对比学习训练的句向量 (2019)",
    "E5 / BGE":     "中文最强句向量 (2023-2024)",
    "Cohere Embed": "商用嵌入 API",
}

# ═══ Sentence-BERT 实战 ═══
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('BAAI/bge-large-zh-v1.5')
sentences = ["今天天气真好", "天气非常不错", "我喜欢编程"]
embeddings = model.encode(sentences)
# cosine_similarity(e[0], e[1]) ≈ 0.92 (语义相似!)
# cosine_similarity(e[0], e[2]) ≈ 0.31 (语义不同)

# ═══ 文本表示演进 ═══
# BoW → TF-IDF → Word2Vec → ELMo → BERT → 句向量模型
# 趋势: 静态→动态, 词级→句级, 单语→多语`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧮 语言模型基础</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> language_models</div>
              <pre className="fs-code">{`# 语言模型: NLP 的概率基础

# ═══ 什么是语言模型? ═══
# P(w_1, w_2, ..., w_n) — 给句子打概率分数
# 链式法则: P(w1...wn) = Π P(w_t | w_1...w_{t-1})
# → 本质: 预测下一个词!

# ═══ N-gram 语言模型 ═══
# 马尔可夫假设: P(w_t | w_1...w_{t-1}) ≈ P(w_t | w_{t-n+1}...w_{t-1})
# Unigram: P(w_t)
# Bigram:  P(w_t | w_{t-1})
# Trigram: P(w_t | w_{t-2}, w_{t-1})

# 估计: P(wi | wi-1) = count(wi-1, wi) / count(wi-1)
# 问题: 稀疏性! → 平滑技术 (Laplace / Kneser-Ney)

# ═══ 评估指标: 困惑度 (Perplexity) ═══
# PPL = exp(-1/N · Σ log P(w_i | context))
# 直觉: "模型有多困惑" — 越低越好
# 等价于: 模型在每个位置平均有多少"选择"
# GPT-4: PPL ≈ 5-10 (英文)
# 人类: PPL ≈ 20 (因为人类更多样)

# ═══ 神经语言模型演进 ═══
neural_lm_evolution = {
    "NNLM (2003)":    "Bengio, 前馈网络, 固定窗口",
    "RNN-LM (2010)":  "Mikolov, 循环网络, 可变长度",
    "LSTM-LM":        "长短期记忆, 缓解梯度消失",
    "ELMo (2018)":    "双向 LSTM, 上下文词向量",
    "GPT (2018)":     "Transformer Decoder, 自回归",
    "BERT (2018)":    "Transformer Encoder, 掩码 LM",
    "GPT-3 (2020)":   "175B 参数, In-Context Learning",
    "LLaMA/Qwen":     "开源 LLM 时代",
}

# ═══ 预训练范式对比 ═══
# ┌──────────┬──────────────┬──────────────┬──────────────┐
# │ 范式      │ 代表         │ 目标         │ 适用任务     │
# ├──────────┼──────────────┼──────────────┼──────────────┤
# │ 自回归    │ GPT          │ 预测下一词   │ 生成         │
# │ 掩码 LM  │ BERT         │ 还原掩码词   │ 理解/分类    │
# │ Seq2Seq  │ T5/BART      │ 去噪自编码   │ 生成+理解    │
# │ 前缀 LM  │ GLM/UniLM    │ 混合目标     │ 通用         │
# └──────────┴──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
