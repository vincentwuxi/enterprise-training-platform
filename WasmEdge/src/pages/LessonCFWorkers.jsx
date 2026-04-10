import { useState } from 'react';
import './LessonCommon.css';

const CODE_WORKERS = `// ━━━━ Cloudflare Workers 深度实战 ━━━━
// Workers = V8 Isolate（不是容器，不是 VM）
// 冷启动 < 5ms，全球 300+ PoP 节点

// ━━━━ 1. Workers 基础（Fetch Handler）━━━━
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 路由
    if (url.pathname === '/api/hello') {
      return Response.json({ message: 'Hello from Edge!' });
    }

    if (url.pathname === '/api/geo') {
      // request.cf 包含丰富的地理信息
      return Response.json({
        country: request.cf.country,
        city: request.cf.city,
        colo: request.cf.colo,           // 最近的 Cloudflare PoP
        timezone: request.cf.timezone,
        latlon: [request.cf.latitude, request.cf.longitude],
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

// ━━━━ 2. KV（全球分布式键值存储）━━━━
// 特点：最终一致性，读毫秒级，写秒级全球同步
// wrangler.toml
// [[kv_namespaces]]
// binding = "CACHE"
// id = "xxxx"

export default {
  async fetch(request, env) {
    const key = new URL(request.url).searchParams.get('key');

    // 读取（全球就近读取，极快）
    const value = await env.CACHE.get(key, 'json');
    if (value) return Response.json(value);

    // 写入（带 TTL）
    await env.CACHE.put(key, JSON.stringify({ ts: Date.now() }), {
      expirationTtl: 3600    // 1 小时过期
    });
    return Response.json({ cached: true });
  }
};`;

const CODE_D1R2 = `// ━━━━ 3. D1（边缘 SQLite 数据库）━━━━
// 完整的 SQL 数据库，跑在边缘节点
// wrangler.toml
// [[d1_databases]]
// binding = "DB"
// database_name = "my-app"
// database_id = "xxxx"

export default {
  async fetch(request, env) {
    // 建表
    await env.DB.exec(
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)"
    );

    // 参数化查询（防 SQL 注入）
    const stmt = env.DB.prepare(
      "INSERT INTO users (name, email) VALUES (?, ?)"
    );
    await stmt.bind("Alice", "alice@example.com").run();

    // 查询
    const { results } = await env.DB.prepare(
      "SELECT * FROM users WHERE name = ?"
    ).bind("Alice").all();

    return Response.json(results);
  }
};

// ━━━━ 4. R2（S3 兼容对象存储，零出口费）━━━━
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (request.method === 'PUT') {
      await env.BUCKET.put(key, request.body, {
        httpMetadata: { contentType: request.headers.get('content-type') },
      });
      return new Response('Uploaded', { status: 201 });
    }

    if (request.method === 'GET') {
      const object = await env.BUCKET.get(key);
      if (!object) return new Response('Not Found', { status: 404 });

      return new Response(object.body, {
        headers: { 'content-type': object.httpMetadata.contentType },
      });
    }
  }
};

// ━━━━ 5. Durable Objects（强一致性有状态）━━━━
// 用途：实时协作、游戏房间、分布式锁
export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.sessions = [];
  }

  async fetch(request) {
    const pair = new WebSocketPair();
    this.sessions.push(pair[1]);

    pair[1].accept();
    pair[1].addEventListener('message', msg => {
      // 广播给所有连接（强一致性！）
      for (const ws of this.sessions) {
        ws.send(msg.data);
      }
    });

    return new Response(null, { status: 101, webSocket: pair[0] });
  }
}`;

export default function LessonCFWorkers() {
  const [tab, setTab] = useState('workers');
  const tabs = [
    { key: 'workers', label: '⚡ Workers + KV', code: CODE_WORKERS },
    { key: 'd1r2',   label: '🗄️ D1 / R2 / Durable Objects', code: CODE_D1R2 },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="we-lesson">
      <div className="we-hero">
        <div className="we-badge">// MODULE 05 · CLOUDFLARE WORKERS</div>
        <h1>Cloudflare Workers 深度</h1>
        <p>Workers 是 Edge Computing 的"杀手级平台"——<strong>V8 Isolate 冷启动 &lt;5ms、300+ 全球节点、D1 边缘数据库、R2 零出口费存储、Durable Objects 强一致状态</strong>。这是完整的 Serverless 运行时。</p>
      </div>

      <div className="we-section">
        <div className="we-section-title">☁️ Workers 生态</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`we-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="we-code-wrap">
          <div className="we-code-head">
            <div className="we-code-dot" style={{ background: '#ef4444' }} /><div className="we-code-dot" style={{ background: '#f59e0b' }} /><div className="we-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>worker.js</span>
          </div>
          <div className="we-code">{t.code}</div>
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">🗃️ Workers 存储选型</div>
        <div className="we-grid-2">
          {[
            { name: 'KV', model: '键值存储', consistency: '最终一致', use: '缓存、配置、Session', color: '#06b6d4' },
            { name: 'D1', model: 'SQLite 数据库', consistency: '最终一致', use: 'CRUD 应用、元数据', color: '#d946ef' },
            { name: 'R2', model: '对象存储（S3 兼容）', consistency: '强一致', use: '文件、图片、备份', color: '#38bdf8' },
            { name: 'Durable Objects', model: '有状态 Actor', consistency: '强一致', use: '实时协作、游戏、锁', color: '#14b8a6' },
          ].map((s, i) => (
            <div key={i} className="we-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--we-muted)', marginBottom: '0.15rem' }}>📊 {s.model}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--we-muted)', marginBottom: '0.15rem' }}>🔒 {s.consistency}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--we-muted)' }}>🎯 {s.use}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
