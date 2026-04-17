import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['核心对比', 'Pinecone', 'Milvus / Qdrant', '选型决策'];

export default function LessonVectorDB() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🔍 module_02 — 向量数据库</div>
      <div className="fs-hero">
        <h1>向量数据库实战：存储与检索十亿级向量</h1>
        <p>
          向量数据库是语义搜索的<strong>基础设施</strong>。不同于传统数据库存行/列，
          向量库存储高维向量并提供亚毫秒级 ANN（近似最近邻）检索。
          本模块深入 <strong>Pinecone / Milvus / Qdrant / Weaviate</strong> 四大主流方案——
          架构原理、索引算法 (HNSW/IVF)、CRUD 实战、性能调优。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🗄️ 向量存储</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 向量数据库核心对比</h3>
              <table className="fs-table">
                <thead>
                  <tr>
                    <th>特性</th><th>Pinecone</th><th>Milvus</th><th>Qdrant</th><th>Weaviate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>类型</td><td><span className="fs-tag amber">托管SaaS</span></td><td><span className="fs-tag green">开源</span></td><td><span className="fs-tag green">开源</span></td><td><span className="fs-tag green">开源</span></td></tr>
                  <tr><td>索引算法</td><td>自研</td><td>HNSW/IVF/DiskANN</td><td>HNSW</td><td>HNSW</td></tr>
                  <tr><td>最大维度</td><td>20,000</td><td>32,768</td><td>65,536</td><td>65,536</td></tr>
                  <tr><td>标量过滤</td><td>✅ 原生</td><td>✅ 强大</td><td>✅ 强大</td><td>✅ GraphQL</td></tr>
                  <tr><td>多租户</td><td>Namespace</td><td>Partition</td><td>Collection</td><td>Multi-tenancy</td></tr>
                  <tr><td>混合搜索</td><td>Sparse+Dense</td><td>✅ 全功能</td><td>✅ Sparse</td><td>✅ BM25+Dense</td></tr>
                  <tr><td>本地部署</td><td>❌</td><td>✅ K8s</td><td>✅ Docker</td><td>✅ Docker</td></tr>
                  <tr><td>适合场景</td><td>快速上线</td><td>大规模/多索引</td><td>高性能/Rust</td><td>GraphQL生态</td></tr>
                </tbody>
              </table>
            </div>

            <div className="fs-card">
              <h3>🌳 ANN 索引算法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> 索引原理</div>
                <pre className="fs-code">{`ANN 近似最近邻索引算法：

HNSW (分层导航小世界图)
├── 构建: 多层跳表 + 近邻连接
├── 查询: 从顶层贪心搜索到底层
├── 参数: M=16, efConstruction=200
├── 优点: 查询快, 精度高
├── 缺点: 内存占用大
└── 适合: 通用场景首选

IVF (倒排文件索引)
├── 构建: K-Means 聚类
├── 查询: 只搜索最近的 nprobe 个簇
├── 参数: nlist=1024, nprobe=64
├── 优点: 内存省, 支持 PQ
├── 缺点: 精度略低
└── 适合: 十亿级大数据

DiskANN (微软)
├── 构建: 图 + 磁盘优化
├── 查询: SSD 友好的搜索
├── 优点: 低成本, 大规模
├── 缺点: 延迟稍高
└── 适合: 成本敏感场景`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>⚡ 量化压缩</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> 量化方法</div>
                <pre className="fs-code">{`向量量化 = 用更少的位表示向量

PQ 乘积量化:
├── 切分向量 → 子空间
├── 每个子空间 K-Means
├── 用码本 ID 替代原始值
├── 压缩比: 32x
└── 精度损失: ~5%

SQ 标量量化:
├── float32 → int8
├── 压缩比: 4x
├── 精度损失: <2%
└── 推荐: 首选方案

Binary 二值量化:
├── float32 → 1 bit
├── 压缩比: 32x
├── 精度损失: ~10%
├── 需要 Rescore
└── 场景: 粗筛阶段`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌲 Pinecone Serverless 实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> pinecone_ops.py</div>
                <pre className="fs-code">{`# —— Pinecone: 全托管向量数据库 ——
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key="YOUR_KEY")

# 1. 创建 Serverless 索引
pc.create_index(
    name="product-search",
    dimension=1024,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)
index = pc.Index("product-search")

# 2. 写入向量 (批量 Upsert)
vectors = [
    {"id": "prod_001", "values": embed("iPhone 16 Pro Max"), 
     "metadata": {"category": "phone", "price": 1199, "brand": "Apple"}},
    {"id": "prod_002", "values": embed("Samsung Galaxy S25"), 
     "metadata": {"category": "phone", "price": 999, "brand": "Samsung"}},
]
index.upsert(vectors=vectors, namespace="electronics")

# 3. 语义搜索 + 元数据过滤
results = index.query(
    vector=embed("性价比高的旗舰手机"),
    top_k=5,
    namespace="electronics",
    filter={
        "price": {"$lte": 1000},
        "category": {"$eq": "phone"}
    },
    include_metadata=True
)

for match in results.matches:
    print(f"{match.id}: {match.score:.4f} - {match.metadata}")

# 4. Sparse-Dense 混合搜索
results = index.query(
    vector=embed("wireless earbuds noise cancellation"),
    sparse_vector={
        "indices": [102, 485, 1032],   # BM25 token IDs
        "values": [0.8, 0.6, 0.3]
    },
    top_k=10
)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🐋 Milvus 分布式向量库</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> milvus_ops.py</div>
                <pre className="fs-code">{`# Milvus: 开源分布式向量数据库
from pymilvus import (
    connections, Collection,
    FieldSchema, CollectionSchema,
    DataType, utility
)

connections.connect("default", host="localhost", port="19530")

# 定义 Schema
fields = [
    FieldSchema("id", DataType.VARCHAR, max_length=64, is_primary=True),
    FieldSchema("embedding", DataType.FLOAT_VECTOR, dim=1024),
    FieldSchema("text", DataType.VARCHAR, max_length=2048),
    FieldSchema("category", DataType.VARCHAR, max_length=32),
    FieldSchema("score", DataType.FLOAT),
]
schema = CollectionSchema(fields, "Product search collection")
collection = Collection("products", schema)

# 创建 HNSW 索引
index_params = {
    "metric_type": "COSINE",
    "index_type": "HNSW",
    "params": {"M": 32, "efConstruction": 256}
}
collection.create_index("embedding", index_params)
collection.load()

# 混合查询
results = collection.search(
    data=[query_embedding],
    anns_field="embedding",
    param={"metric_type": "COSINE", "params": {"ef": 128}},
    limit=10,
    expr='category == "electronics" and score > 4.0',
    output_fields=["text", "category", "score"]
)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🦀 Qdrant 高性能向量库</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> qdrant_ops.py</div>
                <pre className="fs-code">{`# Qdrant: Rust 构建的高性能向量库
from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams, Distance,
    PointStruct, Filter,
    FieldCondition, Range
)

client = QdrantClient(url="http://localhost:6333")

# 创建集合
client.create_collection(
    collection_name="articles",
    vectors_config=VectorParams(
        size=1024,
        distance=Distance.COSINE
    ),
    # 多向量支持
    # vectors_config={
    #     "title": VectorParams(size=384, distance=Distance.COSINE),
    #     "content": VectorParams(size=1024, distance=Distance.COSINE),
    # }
)

# 搜索 + 过滤
results = client.search(
    collection_name="articles",
    query_vector=query_emb,
    query_filter=Filter(
        must=[
            FieldCondition(
                key="year",
                range=Range(gte=2024)
            )
        ]
    ),
    limit=10,
    with_payload=True
)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧭 向量数据库选型决策树</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> 选型指南</div>
                <pre className="fs-code">{`向量数据库选型决策树：

START: 你的数据规模?
│
├── < 100 万向量
│   ├── 不想运维? → Pinecone Serverless ✅
│   ├── 需要本地? → Qdrant (Docker) ✅
│   └── 已有 PG?  → pgvector 插件 ✅
│
├── 100 万 - 1 亿向量
│   ├── 云托管优先? → Pinecone / Zilliz Cloud
│   ├── 需要混合搜索? → Weaviate / Milvus
│   └── 极致性能? → Qdrant (调优 HNSW)
│
└── > 1 亿向量
    ├── 分布式必须? → Milvus (K8s 集群)
    ├── 成本敏感?   → Milvus + DiskANN
    └── 多模态?     → Weaviate (内置向量化)

额外考虑因素：
├── 团队 Rust 经验 → Qdrant
├── 团队 Go 经验   → Milvus / Weaviate
├── GraphQL 生态    → Weaviate
├── 已有 ElasticSearch → ES kNN 插件
└── 原型验证       → Chroma (嵌入式)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
