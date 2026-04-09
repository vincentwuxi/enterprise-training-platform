import { useState } from 'react';
import './LessonCommon.css';

const DATABASES = [
  {
    key: 'pgvector', name: 'pgvector', type: '关系型扩展', logo: '🐘',
    strength: '已有 PostgreSQL → 零额外基础设施；支持完整 SQL 过滤', weakness: '性能低于专用向量DB（>100万向量时需 HNSW 索引）',
    scale: '< 500万', cost: '0（自托管）or Supabase/Neon $25/月起',
    best: '已有 PG 的团队，< 500万向量，数据安全要求高',
    code: `-- ━━━━ pgvector 完整实战 ━━━━
-- 安装扩展
CREATE EXTENSION vector;

-- 创建表
CREATE TABLE documents (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT,
    embedding   vector(1536),    -- text-embedding-3-small 维度
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 HNSW 索引（>10万数据必须！）
-- m=16, ef_construction=64 是常用默认值
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 余弦相似度搜索（最常用）
SELECT 
    id, content, metadata,
    1 - (embedding <=> $1::vector) AS similarity
FROM documents
WHERE metadata->>'category' = 'refund'   -- 先过滤，再向量搜索！
ORDER BY embedding <=> $1::vector        -- <=> 是余弦距离
LIMIT 5;

-- Python 使用
from pgvector.psycopg import register_vector
import psycopg

conn = psycopg.connect("postgresql://localhost/mydb")
register_vector(conn)

# 写入
conn.execute(
    "INSERT INTO documents (content, embedding, metadata) VALUES (%s, %s, %s)",
    (chunk_text, embedding_vector, {"source": "manual.pdf", "page": 3})
)

# 查询
results = conn.execute(
    "SELECT content, 1-(embedding<=>%s) as score FROM documents ORDER BY embedding<=>%s LIMIT 5",
    (query_vector, query_vector)
).fetchall()`,
  },
  {
    key: 'pinecone', name: 'Pinecone', type: '托管向量DB', logo: '🌲',
    strength: '零运维，自动扩展，毫秒级查询，过滤强大', weakness: '数据在云端(隐私)，按量收费，价格较贵',
    scale: '无上限', cost: '$0 (1M vectors) ~ $70/月 (pods)',
    best: '快速上线，无运维能力，1000万+ 向量',
    code: `from pinecone import Pinecone, ServerlessSpec

# ━━━━ 初始化 Pinecone ━━━━
pc = Pinecone(api_key="your-api-key")

# 创建 Index（Serverless，按使用付费）
pc.create_index(
    name="rag-knowledge-base",
    dimension=1536,              # 匹配 embedding 维度
    metric="cosine",             # 余弦相似度
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1",
    )
)

index = pc.Index("rag-knowledge-base")

# ━━━━ 批量写入（建议每批 100 条）━━━━
vectors = [
    {
        "id": f"doc_{i}",
        "values": embedding,
        "metadata": {
            "text": chunk_text,
            "source": "manual.pdf",
            "page": page_num,
            "category": "refund",
        }
    }
    for i, (chunk_text, embedding) in enumerate(chunks_with_embeddings)
]

# upsert 既可新增也可更新
index.upsert(vectors=vectors, batch_size=100, namespace="prod")

# ━━━━ 查询（带 Metadata 过滤）━━━━
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True,
    filter={                           # 先过滤，再向量排序
        "category": {"$eq": "refund"},
        "page": {"$gte": 1, "$lte": 50}
    },
    namespace="prod",
)

for match in results["matches"]:
    print(f"Score: {match['score']:.4f} | {match['metadata']['text'][:100]}")`,
  },
  {
    key: 'chroma', name: 'Chroma', type: '本地/云端', logo: '🎨',
    strength: '极简 API，本地零配置，最适合快速原型', weakness: '生产可靠性一般，大规模性能差',
    scale: '< 100万 (本地)', cost: '0（本地）/ $0.09/GB（云端）',
    best: 'POC 阶段、本地开发、学习用途',
    code: `import chromadb
from chromadb.config import Settings

# ━━━━ 本地 Chroma（最简单）━━━━
client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="knowledge_base",
    metadata={"hnsw:space": "cosine"},  # 相似度度量
)

# 写入（自动去重：相同 id 会 update）
collection.upsert(
    documents=["文档内容1", "文档内容2"],      # 原文
    embeddings=[[0.1, 0.2, ...], [0.3, ...]],  # 向量
    metadatas=[
        {"source": "a.pdf", "page": 1},
        {"source": "b.pdf", "page": 5},
    ],
    ids=["doc_1", "doc_2"],
)

# 查询（直接传文本，自动调用 Embedding）
results = collection.query(
    query_embeddings=[query_vector],   # 或 query_texts=["问题"]
    n_results=5,
    where={"source": {"$eq": "a.pdf"}},  # Metadata 过滤
)

documents = results["documents"][0]
metadatas = results["metadatas"][0]
distances = results["distances"][0]

# ━━━━ 与 LangChain 集成 ━━━━
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

vectordb = Chroma(
    persist_directory="./chroma_db",
    embedding_function=OpenAIEmbeddings(),
    collection_name="knowledge_base",
)
retriever = vectordb.as_retriever(search_kwargs={"k": 5})`,
  },
];

export default function LessonVectorDB() {
  const [db, setDb] = useState('pgvector');
  const d = DATABASES.find(x => x.key === db) ?? {};

  return (
    <div className="rag-lesson">
      <div className="rag-hero">
        <div className="rag-badge">// MODULE 04 · VECTOR DATABASE</div>
        <h1>向量数据库深度实战</h1>
        <p>向量数据库不只是"存向量的地方"，索引策略、过滤机制、查询优化都直接影响检索的速度和精度。本模块深度对比 pgvector/Pinecone/Chroma，并给出<strong>适合每个阶段的选型建议</strong>。</p>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">🗄️ 向量数据库选型对比</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {DATABASES.map(db => (
            <button key={db.key} className={`rag-btn ${d.key === db.key ? 'active' : ''}`} onClick={() => setDb(db.key)}>
              {db.logo} {db.name} <span className="rag-tag teal" style={{ marginLeft: '0.3rem' }}>{db.type}</span>
            </button>
          ))}
        </div>
        <div className="rag-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="rag-card">
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>{d.logo} {d.name}</div>
            {[
              ['✅ 优势', d.strength, 'var(--rag-emerald)'],
              ['⚠️ 局限', d.weakness, 'var(--rag-red)'],
              ['📊 适合规模', d.scale, 'var(--rag-teal)'],
              ['💰 成本', d.cost, 'var(--rag-amber)'],
              ['🎯 最佳场景', d.best, 'var(--rag-mint)'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.75rem', color: c, fontWeight: 700, marginBottom: '0.2rem' }}>{k}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--rag-muted)', lineHeight: 1.6 }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="rag-card">
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--rag-emerald)', marginBottom: '0.75rem' }}>📐 HNSW vs IVF 索引选型</div>
            <div className="rag-code-wrap" style={{ margin: 0 }}>
              <div className="rag-code-head"><span>index_strategy.md</span></div>
              <div className="rag-code" style={{ fontSize: '0.72rem' }}>{`# HNSW（层级导航小世界）
# 适合：< 1000万向量，高召回率要求
# 特点：查询极快（<1ms），构建慢，内存占用高
# pgvector: CREATE INDEX USING hnsw
# 参数：m=16（连接数），ef=64（构建质量）
#        ef_search=100（查询时更高=更准但更慢）

# IVF（倒排文件索引）
# 适合：> 1000万向量，内存受限
# 特点：构建快，内存小，需要 nprobe 调优
# nlist=4096（分区数），nprobe=32（搜索分区数）
# nprobe 越大 = 越准 but 越慢

# 生产建议：
# 数据量 < 100万  → HNSW m=16 ef=64
# 数据量 100万-1千万 → HNSW m=32 ef=128
# 数据量 > 1千万   → IVF + PQ 量化压缩
#                     或 Pinecone 托管服务

# 召回率 vs 延迟权衡：
# HNSW ef_search=10  → p99 1ms,  召回率 90%
# HNSW ef_search=50  → p99 3ms,  召回率 97%
# HNSW ef_search=200 → p99 12ms, 召回率 99.5%`}</div>
            </div>
          </div>
        </div>
        <div className="rag-code-wrap">
          <div className="rag-code-head">
            <div className="rag-code-dot" style={{ background: '#ef4444' }} /><div className="rag-code-dot" style={{ background: '#f59e0b' }} /><div className="rag-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{d.key}_example.py</span>
          </div>
          <div className="rag-code">{d.code}</div>
        </div>
      </div>

      <div className="rag-section">
        <div className="rag-section-title">📊 选型决策流程图</div>
        <div className="rag-card" style={{ overflowX: 'auto' }}>
          <table className="rag-table">
            <thead><tr><th>阶段</th><th>推荐方案</th><th>原因</th><th>迁移成本</th></tr></thead>
            <tbody>
              {[
                ['POC/原型（< 1月）', 'Chroma（本地）', '零配置，代码最简，快速验证', '低（LangChain 切DB只改1行）'],
                ['开发/测试（1-3月）', 'pgvector（Supabase）', '免费，SQL熟悉，真实压测', '低'],
                ['生产小规模（< 100万）', 'pgvector + HNSW', '统一基础设施，运维简单', '中'],
                ['生产中规模（100万-1千万）', 'pgvector 或 Pinecone', '按团队运维能力选择', '中'],
                ['生产大规模（> 1千万）', 'Pinecone / Weaviate', '托管扩缩容，专业向量DB', '高（提前规划）'],
              ].map(([phase, sol, reason, cost], i) => (
                <tr key={i}>
                  <td><span className="rag-tag teal">{phase}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--rag-emerald)', fontSize: '0.85rem' }}>{sol}</td>
                  <td style={{ color: 'var(--rag-muted)', fontSize: '0.83rem' }}>{reason}</td>
                  <td><span className={`rag-tag ${cost.includes('低') ? 'green' : cost.includes('高') ? 'red' : 'amber'}`}>{cost}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rag-tip">
          💡 <strong>迁移友好性设计：</strong>用 LangChain 的 VectorStore 抽象层写代码，切换向量数据库只需改 1 行初始化代码。不要把项目和特定向量DB强耦合。
        </div>
      </div>
    </div>
  );
}
