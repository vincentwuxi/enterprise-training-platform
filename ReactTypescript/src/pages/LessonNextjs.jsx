import { useState } from 'react';
import './LessonCommon.css';

const RENDERING = [
  {
    key: 'csr', name: 'CSR', full: '客户端渲染', color: '#61dafb',
    html: 'HTML 空壳', ttfb: '快', ttfb_note: '', fcp: '慢', seo: '差',
    when: '后台管理系统、登录后才有内容的应用',
    code: `// CSR（默认行为）：数据在浏览器里获取
'use client';  // Next.js App Router 中声明客户端组件

function ProductList() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  });

  if (isLoading) return <Skeleton />;
  return <ul>{data?.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
// 问题：用户先看到空白/骨架屏，SEO 爬虫只看到空 HTML`,
  },
  {
    key: 'ssg', name: 'SSG', full: '静态生成', color: '#10b981',
    html: '构建时完整 HTML', ttfb: '极快', fcp: '极快', seo: '最好',
    when: '博客、文档、营销页面（内容不频繁变化）',
    code: `// SSG（Static Site Generation）：构建时生成 HTML
// Next.js App Router 默认行为！Server Component + 无动态数据 = SSG

// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(p => ({ slug: p.slug }));  // 预生成所有路径
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);  // 构建时执行！不在运行时
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}

// 效果：构建产物包含每篇文章的完整 HTML
// → TTFB 极快（CDN 直接返回静态文件）
// → SEO 完美
// → 缺点：内容更新需要重新构建`,
  },
  {
    key: 'ssr', name: 'SSR', full: '服务端渲染', color: '#f59e0b',
    html: '请求时完整 HTML', ttfb: '中', fcp: '快', seo: '最好',
    when: '电商商品页、个性化内容、需要 SEO 的动态内容',
    code: `// SSR（Server-Side Rendering）：每次请求时在服务端渲染
// App Router：添加 dynamic = 'force-dynamic' 或用动态函数

// app/products/[id]/page.tsx
export const dynamic = 'force-dynamic';  // 或 用 cookies()/headers() 自动触发

export default async function ProductPage({ params }: Props) {
  // 这段代码在服务端运行，不打包到客户端！
  const product = await db.product.findUnique({ where: { id: params.id } });
  
  if (!product) notFound();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>¥{product.price}</p>
      <AddToCartButton productId={product.id} />  {/* 客户端组件 */}
    </div>
  );
}

// 添加 generateMetadata 让 SEO 完美
export async function generateMetadata({ params }: Props) {
  const product = await getProduct(params.id);
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.image] },
  };
}`,
  },
  {
    key: 'rsc', name: 'RSC', full: 'React Server Components', color: '#a78bfa',
    html: '流式 HTML', ttfb: '快', fcp: '极快', seo: '最好',
    when: '现代 Next.js 14+ 应用，App Router 默认推荐',
    code: `// RSC（React Server Components）：Next.js 14 App Router 核心
// 默认 Server Component：在服务端渲染，不发送 JS 到客户端！

// ━━━━ Server Component（默认）━━━━
// app/dashboard/page.tsx
async function DashboardPage() {
  // 直接访问数据库！不需要 API（服务端代码）
  const [users, stats] = await Promise.all([
    db.user.findMany({ take: 10 }),
    db.analytics.getStats(),
  ]);

  return (
    <div>
      <Stats data={stats} />         {/* Server Component */}
      <UserTable users={users} />    {/* Server Component */}
      <SearchBar />                  {/* Client Component (需要交互) */}
    </div>
  );
}

// ━━━━ Client Component（需要交互才用）━━━━
'use client';  // 只有这个文件和它的子树发送到客户端

function SearchBar() {
  const [query, setQuery] = useState('');  // 需要状态 → Client
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

// ━━━━ 关键规则 ━━━━
// Server → Client：✅ 可以传递 props（包括 ReactNode children）
// Client → Server：❌ 不能导入 Server Component

// 最佳实践：尽量让组件树"顶层 Server，叶子 Client"
// 减少客户端 JS bundle 大小，提升性能`,
  },
];

const ROUTE_TYPES = [
  { path: 'app/page.tsx', desc: '根路由 /', icon: '🏠' },
  { path: 'app/about/page.tsx', desc: '/about 静态路由', icon: '📄' },
  { path: 'app/blog/[slug]/page.tsx', desc: '/blog/:slug 动态路由', icon: '🔀' },
  { path: 'app/shop/[...all]/page.tsx', desc: '/shop/a/b/c 捕获所有', icon: '🌊' },
  { path: 'app/(admin)/dashboard/page.tsx', desc: '路由组（不影响 URL）', icon: '📁' },
  { path: 'app/api/users/route.ts', desc: 'API 路由 GET/POST', icon: '🔌' },
  { path: 'app/layout.tsx', desc: '共享布局（Sidebar/Header）', icon: '🖼️' },
  { path: 'middleware.ts', desc: '全局中间件（鉴权/重定向）', icon: '🛡️' },
];

export default function LessonNextjs() {
  const [rendering, setRendering] = useState('rsc');
  const r = RENDERING.find(x => x.key === rendering) ?? {};

  return (
    <div className="lesson-rt" style={{ background: 'var(--rt-bg)', minHeight: '100vh' }}>
      <div className="rt-hero">
        <div className="rt-badge next">▲ Module 05 · Next.js Full Stack</div>
        <h1>Next.js 全栈实战</h1>
        <p>Next.js 14 的 App Router 彻底改变了全栈 React 开发方式。<strong>Server Components</strong> 让你直接在组件里访问数据库，<strong>Server Actions</strong> 替代了一大堆 API Routes，理解这些是现代前端工程师最核心的竞争力。</p>
      </div>

      {/* Rendering Strategies */}
      <div className="rt-section">
        <div className="rt-section-title">🖥️ 四种渲染策略对比</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {RENDERING.map(x => (
            <button key={x.key} className="rt-btn"
              style={{ background: rendering === x.key ? `${x.color}18` : undefined, borderColor: rendering === x.key ? x.color : undefined, color: rendering === x.key ? x.color : undefined }}
              onClick={() => setRendering(x.key)}>
              <span className="rt-tag ts">{x.name}</span> {x.full}
            </button>
          ))}
        </div>
        <div className="rt-grid-2" style={{ marginBottom: '1rem' }}>
          {[['初始 HTML', r.html], ['SEO', r.seo], ['首屏时间', r.fcp], ['适合场景', r.when]].map(([k, v]) => (
            <div key={String(k)} className="rt-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--rt-muted)', marginBottom: '0.3rem' }}>{k}</div>
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="rt-code-wrap">
          <div className="rt-code-head">
            <div className="rt-code-dot" style={{ background: '#ef4444' }} /><div className="rt-code-dot" style={{ background: '#f59e0b' }} /><div className="rt-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem', color: r.color }}>{r.key}-example.tsx</span>
          </div>
          <div className="rt-code">{r.code}</div>
        </div>
      </div>

      {/* App Router Structure */}
      <div className="rt-section">
        <div className="rt-section-title">📁 App Router 文件约定</div>
        <div className="rt-grid-2">
          {ROUTE_TYPES.map((rt, i) => (
            <div key={i} className="rt-card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{rt.icon}</span>
              <div>
                <code style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: '#61dafb' }}>{rt.path}</code>
                <div style={{ color: 'var(--rt-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{rt.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Server Actions */}
      <div className="rt-section">
        <div className="rt-section-title">⚡ Server Actions — 告别 API Routes</div>
        <div className="rt-code-wrap">
          <div className="rt-code-head"><span>server-actions.tsx</span></div>
          <div className="rt-code">{`// ━━━━ Server Action：直接在组件里写服务端逻辑 ━━━━
// 不需要再写 /api/xxx 路由！

// actions/user.ts
'use server';  // 标记为 Server Action

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name:  z.string().min(2),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const parsed = CreateUserSchema.safeParse({
    name:  formData.get('name'),
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.user.create({ data: parsed.data });
  revalidatePath('/users');  // 刷新 /users 页面缓存
  return { success: true };
}

// ━━━━ 在组件中使用 ━━━━
// app/users/new/page.tsx
import { createUser } from '@/actions/user';

export default function NewUserPage() {
  return (
    <form action={createUser}>       // ← 直接传 Server Action！
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">创建</button>
    </form>
  );
}

// useActionState 处理加载/错误状态（React 19 / Next.js 14+）
'use client';
import { useActionState } from 'react';

function NewUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);
  
  return (
    <form action={formAction}>
      {state?.error && <p className="error">{state.error.email}</p>}
      <input name="email" type="email" />
      <button disabled={isPending}>{isPending ? '创建中...' : '创建'}</button>
    </form>
  );
}`}</div>
        </div>
      </div>
    </div>
  );
}
