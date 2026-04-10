import './LessonCommon.css';

const CODE = `// ━━━━ API 测试（Supertest + 契约测试）━━━━

// ━━━━ 1. Supertest（Node.js HTTP 测试）━━━━
// 直接测试 Express/NestJS 路由，无需启动服务器

import request from 'supertest';
import { app } from './app';  // Express app

describe('GET /api/users', () => {
  it('should return 200 and list of users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer test-token')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          email: expect.stringMatching(/@/),
        }),
      ])
    );
  });

  it('should return 401 without token', async () => {
    await request(app)
      .get('/api/users')
      .expect(401);
  });
});

describe('POST /api/users', () => {
  it('should create user and return 201', async () => {
    const newUser = { name: 'Alice', email: 'alice@example.com' };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .set('Authorization', 'Bearer admin-token')
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Alice');
  });

  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Bob', email: 'not-an-email' })
      .set('Authorization', 'Bearer admin-token')
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    );
  });
});

// ━━━━ 2. 契约测试（Consumer-Driven Contracts）━━━━
// 前后端分离时：前端期望的响应格式 = 后端实际的响应格式
// 工具：Pact / MSW（Mock Service Worker）

// consumer.pact.test.ts（前端写期望）
const interaction = {
  state: 'a user exists',
  uponReceiving: 'a request for user',
  withRequest: {
    method: 'GET',
    path: '/api/users/1',
  },
  willRespondWith: {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      id: '1',
      name: like('Alice'),      // 类型匹配即可
      email: term({
        matcher: '.*@.*',       // 正则匹配
        generate: 'a@b.com',
      }),
    },
  },
};

// → 生成契约文件 → 后端验证是否满足契约
// → 契约变更 → CI 自动检测 → 防止接口不兼容

// ━━━━ 3. OpenAPI 驱动测试 ━━━━
// 用 OpenAPI spec 自动验证响应格式
import { createResponseValidator } from 'express-openapi-validator';

// 自动检查：
// ✅ 响应状态码是否在 spec 中定义
// ✅ 响应 body 是否符合 JSON Schema
// ✅ 必填字段是否存在
// ✅ 字段类型是否正确

// ━━━━ 4. 数据库测试（测试容器）━━━━
// 使用 Testcontainers 启动临时数据库
import { PostgreSqlContainer } from '@testcontainers/postgresql';

let container;
let db;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  db = await connectToDatabase(container.getConnectionUri());
  await db.migrate();  // 运行迁移
});

afterAll(async () => {
  await container.stop();  // 销毁容器
});

it('should insert and query user', async () => {
  await db.query("INSERT INTO users (name) VALUES ('Alice')");
  const result = await db.query("SELECT * FROM users WHERE name = 'Alice'");
  expect(result.rows[0].name).toBe('Alice');
});`;

export default function LessonAPITest() {
  return (
    <div className="te-lesson">
      <div className="te-hero">
        <div className="te-badge">// MODULE 04 · API TESTING</div>
        <h1>API 测试</h1>
        <p>API 是前后端的"契约"——<strong>Supertest 直接测 Express 路由无需启浏览器，契约测试保证前后端接口永不 break，Testcontainers 启动临时数据库做真实集成测试</strong>。</p>
      </div>

      <div className="te-section">
        <div className="te-section-title">🔌 API 测试实战</div>
        <div className="te-code-wrap">
          <div className="te-code-head">
            <div className="te-code-dot" style={{ background: '#ef4444' }} /><div className="te-code-dot" style={{ background: '#f59e0b' }} /><div className="te-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>api.test.ts</span>
          </div>
          <div className="te-code">{CODE}</div>
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">📊 API 测试三层</div>
        <div className="te-grid-3">
          {[
            { name: 'Supertest', layer: '单服务内部', what: '路由/中间件/参数校验', when: '每个 API endpoint', color: '#059669' },
            { name: '契约测试', layer: '服务间接口', what: '前后端/微服务接口兼容性', when: '接口变更时', color: '#7c3aed' },
            { name: 'Testcontainers', layer: '数据库集成', what: '真实 SQL 执行/迁移验证', when: '数据层变更时', color: '#38bdf8' },
          ].map((l, i) => (
            <div key={i} className="te-card" style={{ borderTop: `3px solid ${l.color}` }}>
              <div style={{ fontWeight: 700, color: l.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{l.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)', marginBottom: '0.15rem' }}>📍 {l.layer}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)', marginBottom: '0.15rem' }}>🎯 {l.what}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)' }}>📅 {l.when}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
