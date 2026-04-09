import { useState } from 'react';
import './LessonCommon.css';

const CODE_TYPEORM = `// ━━━━ TypeORM：Entity 定义与关系映射 ━━━━
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
  ManyToOne, OneToMany, ManyToMany, JoinTable, Index } from 'typeorm';

// ━━━━ User Entity ━━━━
@Entity('users')
@Index(['email'], { unique: true })   // 数据库索引
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ select: false })          // select: false → 查询时默认不返回密码！
  password: string;

  @Column({ type: 'enum', enum: ['user','admin','moderator'], default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  // 一对多：一个用户 → 多篇文章
  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  // 多对多：用户 ↔ 角色（自动创建中间表）
  @ManyToMany(() => Tag)
  @JoinTable({ name: 'user_tags' })
  tags: Tag[];
}

// ━━━━ Post Entity ━━━━
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  published: boolean;

  // 多对一：多篇文章 → 一个作者
  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;
}

// ━━━━ Repository 操作 ━━━━
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
  ) {}

  // QueryBuilder：复杂查询
  async findPublishedWithAuthor(page: number, limit: number) {
    return this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')  // JOIN 关联表
      .where('post.published = :pub', { pub: true })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();                           // [results, total]
  }
}`;

const CODE_PRISMA = `// ━━━━ Prisma：类型安全的现代 ORM ━━━━
// Prisma 特点：Schema 驱动、自动生成类型、强大的迁移工具

// prisma/schema.prisma
model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  password  String
  role      Role      @default(USER)
  posts     Post[]
  createdAt DateTime  @default(now())

  @@index([email])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  String
  tags      Tag[]
  createdAt DateTime @default(now())
}

enum Role { USER ADMIN MODERATOR }

// ━━━━ NestJS 集成 Prisma ━━━━
// prisma.service.ts（全局单例）
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

// posts.service.ts
@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // 完整类型推导！返回类型自动是 Post & { author: User }
  async findPublished(page: number, limit: number) {
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { published: true },
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where: { published: true } }),
    ]);
    return { posts, total, page, limit };
  }

  // 事务（多操作原子性）
  async createPostWithTags(dto: CreatePostDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: { ...dto, authorId: userId },
      });
      await tx.tag.createMany({
        data: dto.tags.map(name => ({ name, postId: post.id })),
      });
      return post;
    });
  }
}

// ━━━━ 数据库迁移 ━━━━
// npx prisma migrate dev --name add_post_tags    # 开发环境
// npx prisma migrate deploy                      # 生产环境`;

const CODE_MIGRATION = `// ━━━━ TypeORM vs Prisma 选型指南 ━━━━

// ┌──────────────┬────────────────────────┬──────────────────────────┐
// │              │ TypeORM                │ Prisma                   │
// ├──────────────┼────────────────────────┼──────────────────────────┤
// │ 类型安全     │ 中（装饰器推断）        │ 极强（自动生成类型）       │
// │ 学习曲线     │ 较陡（装饰器+关系）     │ 平缓（Prisma Schema）      │
// │ 迁移工具     │ TypeORM Migrations      │ Prisma Migrate（更强大）  │
// │ 性能         │ 好                     │ 好（底层用 Rust 引擎）     │
// │ 原生 SQL     │ QueryBuilder           │ $queryRaw                 │
// │ 社区生态     │ 大（NestJS 官方推荐）   │ 快速增长，DX 极好          │
// │ 多数据库     │ 支持多（MySQL/PG/SQLite）│ 主流数据库均支持           │
// └──────────────┴────────────────────────┴──────────────────────────┘

// 推荐：新项目用 Prisma（类型更安全，DX 更好）

// ━━━━ 数据库设计原则（NestJS 项目）━━━━

// 1. 软删除（不真正删除数据）
@Entity()
export class Post {
  @DeleteDateColumn()           // 软删除时间戳（null = 未删除）
  deletedAt: Date | null;
}
// 查询自动过滤已删除（typeorm.find 默认排除软删除）
// 手动查询包含软删除：{ withDeleted: true }

// 2. 乐观锁（并发更新保护）
@Entity()
export class Product {
  @VersionColumn()              // 每次更新自动 +1
  version: number;
}

// 3. 索引策略（影响查询性能的关键）
// - 高频查询字段：@Index()
// - 唯一约束：@Column({ unique: true })
// - 复合索引：@Index(['userId', 'createdAt'])
// - 全文搜索：PostgreSQL 的 @Index({ fulltext: true })

// 4. 连接池配置（生产必须）
TypeOrmModule.forRoot({
  ...config,
  extra: {
    max: 20,           // 连接池最大连接数
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
})`;

export default function LessonDatabase() {
  const [tab, setTab] = useState('typeorm');

  const tabs = [
    { key: 'typeorm',    label: '🔷 TypeORM 实战',   code: CODE_TYPEORM },
    { key: 'prisma',     label: '🔶 Prisma 实战',    code: CODE_PRISMA },
    { key: 'migration',  label: '📊 选型 & 设计原则', code: CODE_MIGRATION },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="nn-lesson">
      <div className="nn-hero">
        <div className="nn-badge">// MODULE 03 · DATABASE ENGINEERING</div>
        <h1>数据库工程</h1>
        <p>NestJS 项目中 TypeORM 和 Prisma 是最主流的两个 ORM。<strong>TypeORM 是"官方推荐"，Prisma 是"更好的开发体验"</strong>——两者各有所长，本模块都会深度覆盖。</p>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">🗄️ ORM 实战三主题</div>
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
        <div className="nn-section-title">⚠️ N+1 查询问题（最常见性能陷阱）</div>
        <div className="nn-grid-2">
          <div className="nn-card" style={{ borderTop: '3px solid var(--nn-red)' }}>
            <div style={{ fontWeight: 700, color: 'var(--nn-red)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>❌ 错误：N+1 查询</div>
            {['// 查询 100 篇文章', 'const posts = await postsRepo.find();', '// 然后逐一查询作者：触发 100 次额外查询！', 'for (const post of posts) {', '  post.author = await userRepo.findOne(post.authorId);', '}', '// 总计：1 + 100 = 101 次数据库查询'].map((l, i) => (
              <div key={i} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: i === 0 || i === 2 ? 'var(--nn-muted)' : '#fca5a5', lineHeight: 1.7 }}>{l}</div>
            ))}
          </div>
          <div className="nn-card" style={{ borderTop: '3px solid var(--nn-emerald)' }}>
            <div style={{ fontWeight: 700, color: 'var(--nn-emerald)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>✅ 正确：JOIN 一次查询</div>
            {[
              '// TypeORM - relations 一次 JOIN',
              "const posts = await postsRepo.find({",
              "  relations: ['author'],  // 自动 LEFT JOIN",
              "});",
              '// Prisma - include 一次查询',
              'const posts = await prisma.post.findMany({',
              "  include: { author: true },",
              '});',
              '// 总计：1 次数据库查询'].map((l, i) => (
              <div key={i} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: i === 0 || i === 4 || i === 8 ? 'var(--nn-muted)' : '#6ee7b7', lineHeight: 1.7 }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
