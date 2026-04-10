import './LessonCommon.css';

const CODE = `-- ━━━━ 云 PostgreSQL 服务实战 ━━━━

-- ━━━━ 1. Supabase（Firebase 替代品）━━━━
-- Supabase = 开源 Firebase = PostgreSQL + Auth + Storage + Realtime

-- 创建项目后直接连接
-- psql postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

-- Row Level Security（行级安全，核心特性）
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 用户只能看到自己的帖子
CREATE POLICY "Users see own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能修改自己的帖子
CREATE POLICY "Users edit own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 管理员可以看到所有帖子
CREATE POLICY "Admins see all" ON posts
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Realtime 订阅（通过 WebSocket 推送变更）
-- JavaScript SDK:
-- supabase.channel('posts')
--   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' },
--     payload => console.log('New post:', payload.new))
--   .subscribe();

-- Edge Functions（Deno 运行时）
-- supabase functions new my-function
-- supabase functions deploy my-function

-- ━━━━ 2. Neon（Serverless PostgreSQL）━━━━
-- 核心特性：按需扩缩容 + 分支数据库

-- 创建分支（类似 Git）
-- neon branches create --name feature-auth
-- → 瞬间创建数据库副本（COW，不复制数据）
-- → 在分支上开发和测试
-- → 不影响生产数据

-- Serverless 特性：
-- ✅ 无连接时自动暂停（省钱）
-- ✅ 首次连接 < 500ms 冷启动
-- ✅ 按使用量计费（compute + storage）
-- ✅ 最大 16 vCPU，支持自动扩缩

-- 连接：使用 Neon 的 serverless 驱动
-- import { neon } from '@neondatabase/serverless';
-- const sql = neon(process.env.DATABASE_URL);
-- const posts = await sql\`SELECT * FROM posts WHERE id = \${id}\`;

-- ━━━━ 3. Vercel Postgres（与 Next.js 深度集成）━━━━
-- 底层就是 Neon！
-- 优势：与 Vercel 部署/环境变量/Preview 深度集成

-- import { sql } from '@vercel/postgres';
-- const { rows } = await sql\`SELECT * FROM users WHERE id = \${id}\`;

-- 在 Next.js Server Component 中直接查询
-- export default async function UserPage({ params }) {
--   const { rows } = await sql\`SELECT * FROM users WHERE id = \${params.id}\`;
--   return <div>{rows[0].name}</div>;
-- }

-- ━━━━ 4. AWS RDS PostgreSQL ━━━━
-- 企业级首选：自动备份/Multi-AZ/Read Replica

-- 关键配置：
-- 实例类型：db.r6g.xlarge（4 vCPU, 32 GB RAM）
-- 存储：gp3（IOPS 可独立配置）
-- Multi-AZ：开启（自动故障切换）
-- Read Replica：2 个（读写分离）
-- 备份保留：7 天
-- 加密：开启（KMS）
-- Performance Insights：开启（等效 pg_stat_statements）

-- ━━━━ 5. 选型建议 ━━━━
-- ┌──────────────┬──────────────────────────────────┐
-- │ 需求         │ 推荐                             │
-- ├──────────────┼──────────────────────────────────┤
-- │ 个人/MVP     │ Supabase Free Tier              │
-- │ Serverless   │ Neon（分支 + 按需扩缩）          │
-- │ Next.js      │ Vercel Postgres（深度集成）       │
-- │ 企业/合规    │ AWS RDS（Multi-AZ + Read Replica）│
-- │ 全球分布     │ CockroachDB（PG 兼容）           │
-- │ 完全自主     │ 自建 PG + Patroni               │
-- └──────────────┴──────────────────────────────────┘`;

export default function LessonCloudPG() {
  return (
    <div className="pg-lesson">
      <div className="pg-hero">
        <div className="pg-badge">// MODULE 08 · CLOUD POSTGRESQL</div>
        <h1>云服务实战</h1>
        <p>2024 年你不需要自己运维 PG——<strong>Supabase 给你 Firebase 体验 + PG 强大底层，Neon 分支数据库像分支代码一样，RDS Multi-AZ 自动故障切换企业级可靠</strong>。</p>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">☁️ 云 PostgreSQL</div>
        <div className="pg-code-wrap">
          <div className="pg-code-head">
            <div className="pg-code-dot" style={{ background: '#ef4444' }} /><div className="pg-code-dot" style={{ background: '#f59e0b' }} /><div className="pg-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>cloud-pg.sql</span>
          </div>
          <div className="pg-code">{CODE}</div>
        </div>
      </div>

      <div className="pg-section">
        <div className="pg-section-title">📊 云服务选型</div>
        <div className="pg-grid-2">
          {[
            { name: 'Supabase', for: '个人/MVP', feat: 'Auth+Storage+Realtime+RLS', cost: '免费起步', color: '#10b981' },
            { name: 'Neon', for: 'Serverless', feat: '分支数据库+按需扩缩', cost: '按用量', color: '#7c3aed' },
            { name: 'Vercel Postgres', for: 'Next.js', feat: '深度集成+Preview', cost: '按用量', color: '#336791' },
            { name: 'AWS RDS', for: '企业/合规', feat: 'Multi-AZ+Read Replica', cost: '按实例', color: '#f97316' },
          ].map((s, i) => (
            <div key={i} className="pg-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontWeight: 700, color: s.color, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pg-muted)', lineHeight: 1.8 }}>
                🎯 {s.for}<br/>
                ✨ {s.feat}<br/>
                💰 {s.cost}
              </div>
            </div>
          ))}
        </div>

        <div className="pg-tip">💡 <strong>PG 全链路回顾</strong>：内核(MVCC/WAL) → 高级 SQL(窗口/CTE/JSONB) → 索引(B-tree/GIN/EXPLAIN) → pgvector(RAG 闭环) → 分区(亿级优化) → 高可用(Patroni) → 调优(VACUUM/PgBouncer) → 云服务(Supabase/Neon)。<strong>一个数据库搞定关系型 + 文档 + 向量搜索 + 全文搜索。</strong></div>
      </div>
    </div>
  );
}
