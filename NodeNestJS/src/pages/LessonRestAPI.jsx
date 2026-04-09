import { useState } from 'react';
import './LessonCommon.css';

const CODE_CRUD = `// ━━━━ 完整 REST API：Controller + Service ━━━━
import { Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('posts')
@UseGuards(JwtAuthGuard)         // 整个 Controller 都需要认证
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // GET /posts?page=1&limit=10&search=keyword&sort=createdAt:desc
  @Get()
  @Public()                      // 自定义装饰器：跳过认证
  findAll(@Query() query: FindPostsQueryDto) {
    return this.postsService.findAll(query);
  }

  // GET /posts/:id（UUID 自动校验）
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  // POST /posts
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: User,   // 自定义装饰器：从 JWT 取当前用户
  ) {
    return this.postsService.create(dto, user.id);
  }

  // PUT /posts/:id
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(id, dto, user.id);
  }

  // DELETE /posts/:id
  @Delete(':id')
  @Roles('admin')                  // 只有 admin 可以删除
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }
}`;

const CODE_DTO = `// ━━━━ DTO + class-validator + class-transformer ━━━━
import { IsString, IsOptional, IsBoolean, IsArray, IsEnum,
  MinLength, MaxLength, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ━━━━ 创建 DTO ━━━━
export class CreatePostDto {
  @ApiProperty({ example: '10 个提升代码质量的技巧', minLength: 5, maxLength: 200 })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: '代码质量是...' })
  @IsString()
  @MinLength(20)
  content: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// ━━━━ 查询 DTO（分页 + 排序 + 搜索）━━━━
export class FindPostsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)            // 字符串自动转 Number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())  // 自动去除首尾空格
  search?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'title', 'views'] })
  @IsOptional()
  @IsEnum(['createdAt', 'title', 'views'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}

// ━━━━ 响应 DTO（统一响应格式）━━━━
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  get hasNextPage() {
    return this.page < this.totalPages;
  }
}`;

const CODE_SWAGGER = `// ━━━━ Swagger + API 版本控制 ━━━━

// ━━━━ Swagger 配置（main.ts）━━━━
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('完整的 RESTful API 文档')
  .setVersion('1.0')
  .addBearerAuth(             // 添加 JWT 认证按钮
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'JWT-auth',
  )
  .addTag('posts', '文章管理')
  .addTag('users', '用户管理')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,   // 刷新页面后保留 JWT
    defaultModelsExpandDepth: -1, // 默认折叠 Schema
  },
});

// ━━━━ Controller 上的 Swagger 注解 ━━━━
@ApiTags('posts')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'posts', version: '1' })   // URL 版本控制
export class PostsController {

  @ApiOperation({ summary: '获取文章列表（支持分页、搜索、排序）' })
  @ApiResponse({ status: 200, description: '成功', type: PaginatedResponseDto })
  @ApiResponse({ status: 401, description: '未认证' })
  @Get()
  findAll(@Query() query: FindPostsQueryDto) { ... }

  @ApiOperation({ summary: '创建新文章' })
  @ApiBody({ type: CreatePostDto })
  @Post()
  create(@Body() dto: CreatePostDto) { ... }
}

// ━━━━ API 版本控制（三种策略）━━━━
// 方式 1：URI 版本（最常用）
// /v1/posts, /v2/posts
app.enableVersioning({ type: VersioningType.URI });

// 方式 2：Header 版本
// Header: X-API-Version: 1
app.enableVersioning({ type: VersioningType.HEADER, header: 'X-API-Version' });

// 方式 3：Media Type 版本
// Accept: application/json;v=1
app.enableVersioning({ type: VersioningType.MEDIA_TYPE, key: 'v=' });

// 同一 Controller 同时处理 v1 和 v2
@Controller({ path: 'posts', version: ['1', '2'] })
export class PostsController {}

@Controller({ path: 'posts', version: '3' })
export class PostsV3Controller {}`;

export default function LessonRestAPI() {
  const [tab, setTab] = useState('crud');

  const tabs = [
    { key: 'crud',    label: '🔧 Controller + CRUD', code: CODE_CRUD },
    { key: 'dto',     label: '📋 DTO + 分页排序',    code: CODE_DTO },
    { key: 'swagger', label: '📖 Swagger + 版本控制', code: CODE_SWAGGER },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="nn-lesson">
      <div className="nn-hero">
        <div className="nn-badge">// MODULE 04 · REST API ENGINEERING</div>
        <h1>REST API 工程</h1>
        <p>从路由定义到自动生成 API 文档——NestJS 让 REST API 工程化达到极致。<strong>DTO 自动校验、Swagger 零配置文档、版本控制三位一体</strong>，是 NestJS 相比 Express 最大的生产力优势。</p>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">🌐 REST API 三大主题</div>
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
            <span style={{ marginLeft: '0.5rem' }}>{tab}.ts</span>
          </div>
          <div className="nn-code">{t.code}</div>
        </div>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">📊 REST API 设计规范速查</div>
        <div className="nn-card" style={{ overflowX: 'auto' }}>
          <table className="nn-table">
            <thead><tr><th>操作</th><th>Method</th><th>URL 示例</th><th>Status Code</th><th>响应</th></tr></thead>
            <tbody>
              {[
                ['列表查询', 'GET', '/v1/posts?page=1&limit=10', '200 OK', '{ data: [], total, page }'],
                ['单条查询', 'GET', '/v1/posts/:id', '200 / 404', '{ id, title, ... }'],
                ['创建', 'POST', '/v1/posts', '201 Created', '{ id, ...newPost }'],
                ['完整更新', 'PUT', '/v1/posts/:id', '200 OK', '{ id, ...updatedPost }'],
                ['部分更新', 'PATCH', '/v1/posts/:id', '200 OK', '{ id, ...changedFields }'],
                ['删除', 'DELETE', '/v1/posts/:id', '204 No Content', '（无响应体）'],
              ].map(([op, method, url, status, resp], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, fontSize: '0.84rem' }}>{op}</td>
                  <td><span className={`nn-tag ${method === 'GET' ? 'sky' : method === 'POST' ? 'teal' : method === 'DELETE' ? 'red' : 'amber'}`}>{method}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: 'var(--nn-muted)' }}>{url}</td>
                  <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: status.startsWith('2') ? 'var(--nn-emerald)' : 'var(--nn-red)' }}>{status}</td>
                  <td style={{ color: 'var(--nn-muted)', fontSize: '0.8rem' }}>{resp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="nn-grid-4" style={{ marginTop: '1.25rem' }}>
          {[
            { v: '< 200ms', l: 'API 响应时间目标（P95）' },
            { v: '100条', l: '单次查询 limit 最大值（防 DoS）' },
            { v: 'v1/v2', l: 'URI 版本控制（最推荐）' },
            { v: 'JWT', l: '无状态认证（不用 Session）' },
          ].map((s, i) => (
            <div key={i} className="nn-metric">
              <div className="nn-metric-val" style={{ fontSize: '1.2rem' }}>{s.v}</div>
              <div className="nn-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
