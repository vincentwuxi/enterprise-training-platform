import './LessonCommon.css';

const CODE = `// ━━━━ Edge Runtime 对比：Vercel / Deno / Fastly ━━━━

// ━━━━ 1. Vercel Edge Functions ━━━━
// 基于 V8 Isolate（与 Cloudflare Workers 类似）
// 与 Next.js 深度集成

// app/api/geo/route.ts（Next.js App Router）
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';  // 声明使用 Edge Runtime

export async function GET(request: NextRequest) {
  const country = request.geo?.country ?? 'Unknown';
  const city = request.geo?.city ?? 'Unknown';

  return NextResponse.json({
    message: "Hello from Vercel Edge!",
    location: { country, city },
    // Edge Middleware 可以做 A/B 测试、地理路由
  });
}

// middleware.ts（Edge Middleware：在路由之前执行）
import { NextResponse } from 'next/server';

export function middleware(request) {
  // 中国用户 → 重写到中国服务器
  if (request.geo?.country === 'CN') {
    return NextResponse.rewrite(new URL('/cn' + request.nextUrl.pathname, request.url));
  }
  return NextResponse.next();
}

// ━━━━ 2. Deno Deploy ━━━━
// 基于 Deno 运行时，原生 TypeScript、Web 标准 API
// 35 个全球区域，冷启动 ~10ms

// main.ts（Deno Deploy）
Deno.serve(async (request) => {
  const url = new URL(request.url);

  if (url.pathname === '/api/time') {
    return Response.json({
      time: new Date().toISOString(),
      region: Deno.env.get('DENO_REGION'),   // 运行区域
    });
  }

  // 使用 Deno KV（内置全球分布式 KV 存储）
  const kv = await Deno.openKv();
  await kv.set(['visits', 'count'], 42);
  const entry = await kv.get(['visits', 'count']);

  return Response.json({ visits: entry.value });
});

// ━━━━ 3. Fastly Compute（Wasm 原生）━━━━
// 唯一真正在 Edge 上运行 Wasm 的平台
// 使用 Rust/Go/JS SDK 编译为 Wasm

// Rust SDK 示例
use fastly::{Request, Response};

#[fastly::main]
fn main(req: Request) -> Result<Response, fastly::Error> {
    // 地理路由
    let client_ip = req.get_client_ip_addr().unwrap();
    let geo = fastly::geo::geo_lookup(client_ip).unwrap();

    let mut resp = Response::new();
    resp.set_body(format!("Hello from {} ({})", geo.city(), geo.country_code()));
    Ok(resp)
}

// ━━━━ 4. Edge Runtime 对比 ━━━━
// ┌──────────────────┬───────────┬──────────┬───────────┬──────────────┐
// │ 平台             │ 运行时    │ 冷启动   │ 存储      │ 最适合       │
// ├──────────────────┼───────────┼──────────┼───────────┼──────────────┤
// │ CF Workers       │ V8 Isolate│ <5ms     │ KV/D1/R2  │ 全栈 Edge App│
// │ Vercel Edge      │ V8 Isolate│ <10ms    │ KV/Postgres│ Next.js 应用 │
// │ Deno Deploy      │ Deno      │ ~10ms    │ Deno KV   │ TS 优先项目  │
// │ Fastly Compute   │ Wasm 原生 │ ~1ms     │ KV/Object │ 高性能 CDN   │
// │ AWS Lambda@Edge  │ Node.js   │ ~100ms   │ DynamoDB  │ AWS 生态     │
// └──────────────────┴───────────┴──────────┴───────────┴──────────────┘`;

export default function LessonEdgeRuntime() {
  return (
    <div className="we-lesson">
      <div className="we-hero">
        <div className="we-badge">// MODULE 06 · EDGE RUNTIME</div>
        <h1>Edge Runtime</h1>
        <p>Edge Runtime 不只有 Cloudflare——<strong>Vercel Edge Functions 与 Next.js 深度集成、Deno Deploy 原生 TypeScript、Fastly Compute 是唯一真正的 Wasm 原生 Edge 平台</strong>。本模块教你理解每个平台的取舍。</p>
      </div>

      <div className="we-section">
        <div className="we-section-title">🌐 四大 Edge 平台</div>
        <div className="we-code-wrap">
          <div className="we-code-head">
            <div className="we-code-dot" style={{ background: '#ef4444' }} /><div className="we-code-dot" style={{ background: '#f59e0b' }} /><div className="we-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>edge-runtime.ts</span>
          </div>
          <div className="we-code">{CODE}</div>
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">📊 选型决策树</div>
        <div className="we-steps">
          {[
            { name: '用 Next.js？', desc: '→ Vercel Edge Functions（深度集成，middleware + API route）', color: '#06b6d4' },
            { name: '需要完整数据栈？', desc: '→ Cloudflare Workers（KV + D1 + R2 + DO 最完善）', color: '#d946ef' },
            { name: 'TypeScript 优先 + Deno 生态？', desc: '→ Deno Deploy（内置 KV + 原生 TS）', color: '#38bdf8' },
            { name: '需要极致性能 + Wasm 原生？', desc: '→ Fastly Compute（唯一真正的 Wasm Edge）', color: '#14b8a6' },
            { name: '已锁定 AWS？', desc: '→ Lambda@Edge（冷启动较慢但生态完整）', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} className="we-step">
              <div className="we-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--we-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
