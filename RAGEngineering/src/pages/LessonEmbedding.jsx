import { useState } from 'react';
import './LessonCommon.css';

const MODELS = [
  {
    key: 'openai-small', name: 'text-embedding-3-small', vendor: 'OpenAI',
    dim: 1536, maxTokens: 8191, cost: '$0.02/M tokens', latency: '~50ms',
    lang: '多语言', quality: 4, speed: 5, cost_score: 5,
    best: '通用首选，成本效益最高', note: '支持 dimensions 参数压缩维度节省存储',
    code: `from openai import OpenAI

client = OpenAI()

# 单条 Embedding
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="什么是 RAG 技术？",
    encoding_format="float",  # 或 "base64"（节省网络）
)
vector = response.data[0].embedding  # 1536维 float列表

# 批量 Embedding（推荐：减少 API 调用次数）
texts = ["文本1", "文本2", "文本3", ...]
response = client.embeddings.create(
    model="text-embedding-3-small",
    input=texts,  # 最多 2048 条/次
)
vectors = [item.embedding for item in response.data]

# 维度压缩（节省 50% 存储，精度损失约 3%）
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="长文本...",
    dimensions=768,  # 从 1536 压缩到 768
)`,
  },
  {
    key: 'bge', name: 'BGE-M3', vendor: 'BAAI（开源）',
    dim: 1024, maxTokens: 8192, cost: '免费（自部署）', latency: '~30ms（GPU）',
    lang: '中文最强', quality: 5, speed: 4, cost_score: 5,
    best: '中文场景首选，中英文双语效果极好', note: '支持稠密/稀疏/多向量三种检索模式',
    code: `from FlagEmbedding import BGEM3FlagModel

# 加载模型（首次运行自动下载）
model = BGEM3FlagModel(
    'BAAI/bge-m3',
    use_fp16=True,   # 半精度，节省显存
)

# 生成 Embedding（支持中英文混合）
texts = [
    "什么是检索增强生成？",
    "RAG 系统如何构建？",
]
output = model.encode(
    texts,
    batch_size=12,
    max_length=8192,
    return_dense=True,    # 稠密向量（适合语义搜索）
    return_sparse=True,   # 稀疏向量（适合关键词）
    return_colbert_vecs=False,
)

dense_vectors  = output['dense_vecs']   # 语义检索用
sparse_vectors = output['lexical_weights']  # 混合检索用

# BGE-M3 特殊优势：同时支持 dense + sparse
# 天然适合混合检索（Hybrid Retrieval）！

# pip install FlagEmbedding
# 需要：CUDA GPU 或 ARM Mac（MPS加速）`,
  },
  {
    key: 'st', name: 'sentence-transformers', vendor: '开源社区',
    dim: 768, maxTokens: 512, cost: '免费', latency: '~10ms（CPU）',
    lang: '多语言（需选对模型）', quality: 3, speed: 5, cost_score: 5,
    best: '本地测试、CPU 环境、快速验证', note: '模型库丰富，按场景选',
    code: `from sentence_transformers import SentenceTransformer

# 选模型：https://www.sbert.net/docs/pretrained_models.html
# 中文推荐：shibing624/text2vec-base-chinese
model = SentenceTransformer('BAAI/bge-base-zh-v1.5')

# 批量 Encoding（自动利用多核/GPU）
sentences = ["文本1", "文本2", "文本3"]
embeddings = model.encode(
    sentences,
    batch_size=64,
    show_progress_bar=True,
    normalize_embeddings=True,  # 归一化（余弦相似度必须）
)
# embeddings.shape: (3, 768)

# 计算相似度
from sentence_transformers import util
cos_sim = util.cos_sim(embeddings[0], embeddings[1])
print(f"相似度: {cos_sim.item():.4f}")

# 常用中文模型：
# shibing624/text2vec-base-chinese  → CPU 友好
# BAAI/bge-base-zh-v1.5           → 质量更高
# BAAI/bge-large-zh-v1.5          → 最高质量（4x显存）`,
  },
];

export default function LessonEmbedding() {
  const [model, setModel] = useState('bge');
  const m = MODELS.find(x => x.key === model) ?? {};

  const ScoreBar = ({ score, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div className="rag-bar-track" style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 6 }}>
        <div style={{ width: `${score * 20}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${color}, ${color}aa)`, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: '0.72rem', color: 'var(--rag-muted)', width: 20 }}>{score}/5</span>
    </div>
  );

  return (
    <div className="rag-lesson">
      <div className="rag-hero">
        <div className="rag-badge">// MODULE 03 · EMBEDDING ENGINEERING</div>
        <h1>Embedding 工程与模型选型</h1>
        <p>Embedding 模型决定了 RAG 系统"理解语义"的深度。选错模型，中文场景的检索准确率可能下降 30%+。本模块覆盖主流模型横评、批量处理优化、以及生产级 Embedding 工程最佳实践。</p>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">🔢 主流 Embedding 模型横评</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {MODELS.map(mo => (
            <button key={mo.key} className={`rag-btn ${model === mo.key ? 'active' : ''}`} onClick={() => setModel(mo.key)}>
              {mo.name}
              {mo.key === 'bge' && <span className="rag-tag green" style={{ marginLeft: '0.3rem' }}>中文首选</span>}
            </button>
          ))}
        </div>
        <div className="rag-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="rag-card">
            <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{m.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {[['厂商', m.vendor], ['向量维度', m.dim], ['最大Token', m.maxTokens], ['API成本', m.cost], ['延迟', m.latency], ['语言', m.lang]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--rag-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--rag-text)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[['检索质量', m.quality, '#10b981'], ['速度', m.speed, '#0ea5e9'], ['成本友好', m.cost_score, '#f59e0b']].map(([label, score, color]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--rag-muted)', marginBottom: '0.2rem' }}>{label}</div>
                  <ScoreBar score={score} color={color} />
                </div>
              ))}
            </div>
          </div>
          <div className="rag-card">
            <div style={{ fontSize: '0.82rem', color: 'var(--rag-emerald)', fontWeight: 700, marginBottom: '0.5rem' }}>🎯 最适场景</div>
            <div style={{ fontSize: '0.87rem', color: 'var(--rag-muted)', marginBottom: '1rem' }}>{m.best}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--rag-teal)', fontWeight: 700, marginBottom: '0.5rem' }}>💡 特性说明</div>
            <div style={{ fontSize: '0.87rem', color: 'var(--rag-muted)' }}>{m.note}</div>
          </div>
        </div>
        <div className="rag-code-wrap">
          <div className="rag-code-head">
            <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{m.key}_embedding.py</span>
          </div>
          <div className="rag-code">{m.code}</div>
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">⚡ 生产级 Embedding 工程最佳实践</div>
        <div className="rag-code-wrap">
          <div className="rag-code-head"><span>embedding_production.py</span></div>
          <div className="rag-code">{`import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
from openai import AsyncOpenAI
import numpy as np

client = AsyncOpenAI()

# ━━━━ 1. 带重试的 Embedding（生产必备）━━━━
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def embed_with_retry(texts: list[str]) -> list[list[float]]:
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=texts,
    )
    return [item.embedding for item in response.data]

# ━━━━ 2. 批量并发处理（大量文档时提速 10x）━━━━
async def batch_embed(texts: list[str], batch_size: int = 100) -> np.ndarray:
    """将大量文本拆分为批次并发处理"""
    batches = [texts[i:i+batch_size] for i in range(0, len(texts), batch_size)]
    
    # 并发调用，但限制并发数（避免超速率限制）
    semaphore = asyncio.Semaphore(5)  # 最多5个并发请求
    
    async def embed_batch(batch):
        async with semaphore:
            return await embed_with_retry(batch)
    
    results = await asyncio.gather(*[embed_batch(b) for b in batches])
    return np.vstack(results)  # 合并为大矩阵

# ━━━━ 3. 缓存（避免重复 Embedding 相同文本）━━━━
import hashlib, json, redis

cache = redis.Redis()

def get_cached_embedding(text: str) -> list[float] | None:
    key = f"emb:{hashlib.md5(text.encode()).hexdigest()}"
    cached = cache.get(key)
    if cached:
        return json.loads(cached)
    return None

def set_cached_embedding(text: str, vector: list[float], ttl: int = 86400):
    key = f"emb:{hashlib.md5(text.encode()).hexdigest()}"
    cache.setex(key, ttl, json.dumps(vector))

# ━━━━ 4. 归一化（余弦相似度必须做）━━━━
import numpy as np

def normalize(v: list[float]) -> list[float]:
    arr = np.array(v)
    return (arr / np.linalg.norm(arr)).tolist()

# ━━━━ 5. 查询 vs 文档不同处理（BGE 特有）━━━━
# BGE 模型对查询文本需要加前缀
query  = "Represent this sentence for searching relevant passages: 什么是 RAG？"
passage = "RAG 是检索增强生成技术..."  # 文档不加前缀`}</div>
        </div>
      </div>
    </div>
  );
}
