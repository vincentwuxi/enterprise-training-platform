import './LessonCommon.css';

const CODE = `-- ━━━━ pgvector 向量搜索（与 RAG 闭环！）━━━━
-- pgvector = 在 PostgreSQL 中存储和搜索向量嵌入
-- 不需要额外的向量数据库（Pinecone/Weaviate）

-- ━━━━ 1. 安装 pgvector ━━━━
CREATE EXTENSION IF NOT EXISTS vector;

-- ━━━━ 2. 创建向量表 ━━━━
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(1536)  -- OpenAI text-embedding-3-small 维度
);

-- ━━━━ 3. 插入嵌入向量 ━━━━
-- 通常由应用层调用 Embedding API 后写入
INSERT INTO documents (title, content, embedding) VALUES
  ('PostgreSQL Guide', 'PostgreSQL is...', '[0.1, 0.2, ...]'::vector);

-- ━━━━ 4. 语义搜索（最近邻查询）━━━━
-- 余弦距离（最常用）
SELECT id, title, 1 - (embedding <=> query_embedding) AS similarity
FROM documents
ORDER BY embedding <=> query_embedding  -- <=> 余弦距离
LIMIT 10;

-- L2 距离（欧几里德）
SELECT * FROM documents
ORDER BY embedding <-> query_embedding  -- <-> L2 距离
LIMIT 10;

-- 内积（高性能，需归一化向量）
SELECT * FROM documents
ORDER BY embedding <#> query_embedding  -- <#> 负内积
LIMIT 10;

-- ━━━━ 5. ANN 索引（近似最近邻）━━━━

-- 方案 A：IVFFlat（适合 <100 万行）
-- 原理：将向量空间划分为 nlist 个区域→只搜索最近的 nprobe 个区域
CREATE INDEX idx_docs_ivfflat ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);  -- lists ≈ sqrt(rows)

-- 搜索时设置探测数量
SET ivfflat.probes = 10;  -- 越大越精确，但越慢

-- 方案 B：HNSW（推荐！适合 100 万+ 行）
-- 原理：分层可导航小世界图，建索引慢但搜索快
CREATE INDEX idx_docs_hnsw ON documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

-- m: 每个节点的最大连接数（越大越精确，内存越大）
-- ef_construction: 建索引时的探索范围（越大越慢但越精确）

-- 搜索时设置探索范围
SET hnsw.ef_search = 100;  -- 越大越精确

-- ━━━━ 6. IVFFlat vs HNSW 对比 ━━━━
-- ┌───────────────┬──────────────┬──────────────┐
-- │               │ IVFFlat      │ HNSW         │
-- ├───────────────┼──────────────┼──────────────┤
-- │ 建索引速度    │ ⚡ 快         │ 🔶 慢        │
-- │ 查询速度      │ 🔶 中等       │ ⚡ 快         │
-- │ 查询精度      │ 🔶 中等       │ ⭐ 高         │
-- │ 内存占用      │ 💚 少         │ 🔶 多        │
-- │ 适合规模      │ <100 万       │ 100 万+      │
-- │ 推荐          │ 原型/小数据   │ 生产环境     │
-- └───────────────┴──────────────┴──────────────┘

-- ━━━━ 7. RAG 完整查询示例 ━━━━
-- 用户问："PostgreSQL 的 MVCC 是什么？"
-- 1. 应用层将问题转为嵌入向量
-- 2. 在 PG 中搜索最相似的文档
-- 3. 将文档作为上下文发送给 LLM

WITH query AS (
  SELECT '[0.1, 0.2, ...]'::vector(1536) AS embedding
)
SELECT
  d.title,
  d.content,
  1 - (d.embedding <=> q.embedding) AS similarity
FROM documents d, query q
WHERE d.metadata->>'category' = 'database'  -- 元数据过滤
  AND 1 - (d.embedding <=> q.embedding) > 0.7  -- 相似度阈值
ORDER BY d.embedding <=> q.embedding
LIMIT 5;

-- → 将 top-5 文档送入 LLM 生成答案
-- → 这就是 RAG（Retrieval-Augmented Generation）！

-- ━━━━ 8. 为什么用 PG 而不是专用向量数据库？━━━━
-- ✅ 一个数据库搞定：结构化数据 + 向量搜索 + 全文搜索
-- ✅ ACID 事务：向量和业务数据保持一致
-- ✅ SQL 生态：直接 JOIN/WHERE/GROUP BY
-- ✅ 已有基础设施：备份/监控/复制 复用
-- ✅ 成本低：不需要额外的 Pinecone 费用
-- ⚠️ 但如果向量 >1 亿行，考虑专用向量数据库`;

export default function LessonPgvector() {
  return (
    <div className="pg-lesson">
      <div className="pg-hero">
        <div className="pg-badge">// MODULE 04 · PGVECTOR</div>
        <h1>pgvector 向量搜索</h1>
        <p>不需要 Pinecone 也能做 RAG——<strong>pgvector 让 PostgreSQL 同时处理结构化数据 + 向量语义搜索，HNSW 索引在百万级数据下毫秒级返回，与 RAG 工程课完美闭环</strong>。</p>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">🔍 pgvector 全流程</div>
        <div className="pg-code-wrap">
          <div className="pg-code-head">
            <div className="pg-code-dot" style={{ background: '#ef4444' }} /><div className="pg-code-dot" style={{ background: '#f59e0b' }} /><div className="pg-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>pgvector_rag.sql</span>
          </div>
          <div className="pg-code">{CODE}</div>
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📊 IVFFlat vs HNSW</div>
        <div className="pg-grid-2">
          {[
            { name: 'IVFFlat', build: '⚡ 快', query: '🔶 中', precision: '🔶 中', mem: '💚 少', scale: '<100 万', rec: '原型/小数据', color: '#336791' },
            { name: 'HNSW', build: '🔶 慢', query: '⚡ 快', precision: '⭐ 高', mem: '🔶 多', scale: '100 万+', rec: '⭐ 生产推荐', color: '#4f46e5' },
          ].map((idx, i) => (
            <div key={i} className="pg-card" style={{ borderTop: `3px solid ${idx.color}` }}>
              <div style={{ fontWeight: 800, color: idx.color, fontSize: '1.1rem', marginBottom: '0.6rem' }}>{idx.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pg-muted)', lineHeight: 1.9 }}>
                建索引：{idx.build}<br/>
                查询速度：{idx.query}<br/>
                精度：{idx.precision}<br/>
                内存：{idx.mem}<br/>
                规模：{idx.scale}<br/>
                <strong style={{ color: '#93c5fd' }}>{idx.rec}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className="pg-tip">💡 <strong>与 RAG 工程课闭环</strong>：RAG 课教如何切分文档和生成嵌入，本模块教如何在 PG 中存储和搜索这些嵌入——结合起来就是完整的生产级 RAG pipeline。</div>
      </div>
    </div>
  );
}
