import { useState } from 'react';
import './LessonCommon.css';

const CODE_UNIT = `// ━━━━ Jest 单元测试：Service 层测试 ━━━━

// posts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepo: jest.Mocked<Repository<Post>>;

  beforeEach(async () => {
    // 创建测试模块（替换真实依赖为 Mock）
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: CacheManager,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsRepo = module.get(getRepositoryToken(Post));
  });

  describe('findOne', () => {
    it('应该返回指定 ID 的文章', async () => {
      const mockPost: Post = {
        id: 'uuid-123',
        title: '测试文章',
        content: '内容...',
        published: true,
        author: { id: 'user-1', name: 'Alice' } as User,
        createdAt: new Date(),
      };

      postsRepo.findOne.mockResolvedValue(mockPost);  // Mock 返回值

      const result = await service.findOne('uuid-123');

      expect(result).toEqual(mockPost);
      expect(postsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        relations: ['author'],
      });
    });

    it('文章不存在时应该抛出 NotFoundException', async () => {
      postsRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('not-exist')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('应该创建并保存文章', async () => {
      const dto: CreatePostDto = { title: '新文章', content: '内容', published: false };
      const mockPost = { id: 'new-uuid', ...dto, author: { id: 'user-1' } as User };

      postsRepo.create.mockReturnValue(mockPost as Post);
      postsRepo.save.mockResolvedValue(mockPost as Post);

      const result = await service.create(dto, 'user-1');

      expect(postsRepo.create).toHaveBeenCalledWith({ ...dto, authorId: 'user-1' });
      expect(postsRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('new-uuid');
    });
  });
});`;

const CODE_E2E = `// ━━━━ Supertest E2E 测试：完整 HTTP 流 ━━━━

// test/posts.e2e-spec.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdPostId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],         // 导入真实 AppModule（用测试数据库）
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // 登录获取 JWT Token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'test123' });
    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /posts → 应该返回分页列表', async () => {
    const res = await request(app.getHttpServer())
      .get('/posts')
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(res.body).toMatchObject({
      data: expect.any(Array),
      total: expect.any(Number),
      page: 1,
      limit: 10,
    });
  });

  it('POST /posts → 未认证应该返回 401', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({ title: '测试', content: '内容...' })
      .expect(401);
  });

  it('POST /posts → 认证后创建文章', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', \`Bearer \${authToken}\`)
      .send({ title: '完整 E2E 测试文章', content: '这是一篇测试文章的内容，超过 20 个字符', published: false })
      .expect(201);

    createdPostId = res.body.id;
    expect(res.body.title).toBe('完整 E2E 测试文章');
  });

  it('PUT /posts/:id → 更新文章', async () => {
    const res = await request(app.getHttpServer())
      .put(\`/posts/\${createdPostId}\`)
      .set('Authorization', \`Bearer \${authToken}\`)
      .send({ title: '更新后的标题', published: true })
      .expect(200);

    expect(res.body.title).toBe('更新后的标题');
    expect(res.body.published).toBe(true);
  });

  it('POST /posts → DTO 校验失败应返回 400 + 错误详情', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', \`Bearer \${authToken}\`)
      .send({ title: 'ab', content: '太短' })   // 标题太短（< 5 字符）
      .expect(400);

    expect(res.body.message).toContain('title must be longer than');
  });
});`;

const CODE_COVERAGE = `// ━━━━ 测试覆盖率 + Mock 最佳实践 ━━━━

// ━━━━ jest.config.ts ━━━━
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coverageThresholds: {
    global: {
      branches: 80,     // 分支覆盖率 ≥ 80%
      functions: 85,    // 函数覆盖率 ≥ 85%
      lines: 85,        // 行覆盖率 ≥ 85%
      statements: 85,
    },
  },
  testEnvironment: 'node',
};

// ━━━━ 常用 Mock 技巧 ━━━━

// 1. Mock 整个模块
jest.mock('../mail/mail.service');

// 2. Mock 只有部分方法
jest.spyOn(service, 'sendEmail').mockResolvedValue(undefined);

// 3. Mock 时序控制
const mockFn = jest.fn()
  .mockResolvedValueOnce(firstResult)   // 第 1 次调用
  .mockResolvedValueOnce(secondResult)  // 第 2 次调用
  .mockRejectedValue(new Error('失败')); // 第 3 次调用失败

// 4. 验证调用次数和参数
expect(mailService.send).toHaveBeenCalledTimes(1);
expect(mailService.send).toHaveBeenCalledWith(
  expect.objectContaining({ to: 'test@example.com' })
);

// ━━━━ 测试数据库（推荐：SQLite in-memory）━━━━
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',        // 内存数据库，测试后自动清除
  entities: [User, Post, Tag],
  synchronize: true,           // 测试环境自动同步 Schema
})

// ━━━━ 测试命令 ━━━━
// pnpm test               → 运行所有单元测试
// pnpm test:watch         → 监听文件变化
// pnpm test:cov           → 生成覆盖率报告
// pnpm test:e2e           → 运行 E2E 测试
// pnpm test:debug         → 调试模式`;

export default function LessonTesting() {
  const [tab, setTab] = useState('unit');

  const tabs = [
    { key: 'unit',     label: '🧪 Jest 单元测试', code: CODE_UNIT },
    { key: 'e2e',      label: '🌐 Supertest E2E', code: CODE_E2E },
    { key: 'coverage', label: '📊 覆盖率 + Mock',  code: CODE_COVERAGE },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="nn-lesson">
      <div className="nn-hero">
        <div className="nn-badge">// MODULE 07 · TESTING</div>
        <h1>测试体系</h1>
        <p>NestJS 的依赖注入架构让测试变得极其简单——<strong>单元测试 Mock 替换真实依赖，E2E 测试验证完整 HTTP 流程</strong>。一个有完善测试的 NestJS 项目可以安全地重构和上线。</p>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">🧪 测试三大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`nn-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="nn-code-wrap">
          <div className="nn-code-head">
            <div className="nn-code-dot" style={{ background: '#ef4444' }} />
            <div className="nn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="nn-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.spec.ts</span>
          </div>
          <div className="nn-code">{t.code}</div>
        </div>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">📋 测试策略（测试金字塔）</div>
        <div className="nn-grid-3">
          {[
            { title: '单元测试（70%）', icon: '🔬', color: '#10b981', desc: 'Service/Repository 层，Mock 所有外部依赖。执行速度极快（< 1ms/test）。', commands: ['pnpm test', 'pnpm test:watch'] },
            { title: '集成测试（20%）', icon: '🔗', color: '#0ea5e9', desc: '验证模块间协作（Service + Repository + 真实数据库）。使用 SQLite In-Memory。', commands: ['pnpm test:integration'] },
            { title: 'E2E 测试（10%）', icon: '🌐', color: '#8b5cf6', desc: '完整 HTTP 流（Controller → Service → DB）。最贴近真实环境，最慢最昂贵。', commands: ['pnpm test:e2e'] },
          ].map((c, i) => (
            <div key={i} className="nn-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.87rem', marginBottom: '0.5rem' }}>{c.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--nn-muted)', lineHeight: 1.65, marginBottom: '0.75rem' }}>{c.desc}</div>
              {c.commands.map((cmd, j) => (
                <div key={j} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.76rem', color: 'var(--nn-emerald)', background: 'rgba(15,118,110,0.08)', padding: '0.25rem 0.5rem', borderRadius: 4, marginBottom: '0.25rem' }}>{cmd}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
