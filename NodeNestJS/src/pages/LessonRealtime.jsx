import { useState } from 'react';
import './LessonCommon.css';

const CODE_WEBSOCKET = `// ━━━━ WebSocket：实时双向通信 ━━━━

// ━━━━ 1. WebSocket Gateway ━━━━
import { WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
  namespace: '/chat',   // 命名空间隔离（不同功能）
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;     // Socket.io Server 实例

  private userSocketMap = new Map<string, string>();  // userId → socketId

  // 连接建立时
  async handleConnection(client: Socket) {
    const user = await this.authService.validateSocket(client);
    if (!user) return client.disconnect();     // 未认证 → 断开
    this.userSocketMap.set(user.id, client.id);
    console.log(\`用户 \${user.name} 连接，socketId: \${client.id}\`);
  }

  // 断开连接时
  handleDisconnect(client: Socket) {
    const userId = [...this.userSocketMap.entries()]
      .find(([_, sid]) => sid === client.id)?.[0];
    if (userId) this.userSocketMap.delete(userId);
  }

  // 监听客户端事件
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.create(data);

    // 1. 发送给房间内所有人
    this.server.to(data.roomId).emit('new_message', message);

    // 2. 发送给特定用户（私信）
    const targetSocketId = this.userSocketMap.get(data.toUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('private_message', message);
    }

    return { success: true, messageId: message.id };  // 返回给发送者
  }

  @SubscribeMessage('join_room')
  joinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    client.join(roomId);     // 加入房间
    client.to(roomId).emit('user_joined', { socketId: client.id });
  }
}`;

const CODE_BULL = `// ━━━━ Bull 任务队列：异步任务处理 ━━━━
// 场景：发送邮件、图片处理、数据导出、定时任务

// ━━━━ 1. 模块配置 ━━━━
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: { host: config.get('REDIS_HOST'), port: config.get('REDIS_PORT') },
        defaultJobOptions: {
          removeOnComplete: 100,   // 保留最近 100 个成功任务
          removeOnFail: 50,        // 保留最近 50 个失败任务
          attempts: 3,             // 失败重试 3 次
          backoff: { type: 'exponential', delay: 1000 },  // 指数退避
        },
      }),
    }),
    BullModule.registerQueue({ name: 'email' }),
    BullModule.registerQueue({ name: 'image-processing' }),
  ],
})
export class WorkerModule {}

// ━━━━ 2. 队列 Producer（添加任务）━━━━
@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcomeEmail(user: User) {
    await this.emailQueue.add('welcome', {
      to: user.email,
      name: user.name,
    }, {
      delay: 5000,           // 5 秒后执行（等待用户完成注册流程）
      priority: 1,           // 优先级（数字越小越高）
    });
  }

  async sendBulkEmail(users: User[], template: string) {
    const jobs = users.map(user => ({
      name: 'bulk',
      data: { to: user.email, template },
      opts: { attempts: 3 },
    }));
    await this.emailQueue.addBulk(jobs);   // 批量添加
  }
}

// ━━━━ 3. 队列 Consumer（处理任务）━━━━
@Processor('email')
export class EmailProcessor {
  @Process('welcome')
  async sendWelcome(job: Job<WelcomeEmailDto>) {
    const { to, name } = job.data;
    // 实际发送邮件（nodemailer / SendGrid / Resend）
    await this.mailer.sendMail({
      to,
      subject: '欢迎加入！',
      html: \`<h1>你好，\${name}！</h1>\`,
    });
    return { sent: true };     // 返回值存储在 job.returnvalue
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    console.error(\`任务 \${job.id} 失败（第 \${job.attemptsMade} 次）:\`, error.message);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    console.log(\`任务 \${job.id} 完成:\`, result);
  }
}`;

const CODE_REDIS = `// ━━━━ Redis 缓存：数据加速 ━━━━

// ━━━━ 1. 缓存模块配置 ━━━━
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: 60 * 5,    // 默认 5 分钟过期
      }),
    }),
  ],
})
export class AppModule {}

// ━━━━ 2. 自动缓存（装饰器方式）━━━━
@Controller('posts')
export class PostsController {
  @Get()
  @CacheKey('all_posts')       // 自定义缓存 key
  @CacheTTL(300)               // 缓存 5 分钟
  @UseInterceptors(CacheInterceptor)
  findAll() {
    return this.postsService.findAll();  // 第二次请求直接返回缓存
  }
}

// ━━━━ 3. 手动缓存（精细控制）━━━━
@Injectable()
export class PostsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async findOne(id: string): Promise<Post> {
    const cacheKey = \`post:\${id}\`;

    // Cache-Aside 模式
    const cached = await this.cacheManager.get<Post>(cacheKey);
    if (cached) return cached;    // 缓存命中，直接返回

    const post = await this.prisma.post.findUniqueOrThrow({ where: { id } });

    await this.cacheManager.set(cacheKey, post, 300);  // 存入缓存 5 分钟
    return post;
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.prisma.post.update({ where: { id }, data: dto });
    await this.cacheManager.del(\`post:\${id}\`);   // 更新后删除缓存（缓存失效）
    await this.cacheManager.del('all_posts');      // 列表缓存也要清除
    return post;
  }
}

// ━━━━ 4. 分布式锁（防止缓存击穿）━━━━
async findOneWithLock(id: string): Promise<Post> {
  const lockKey = \`lock:post:\${id}\`;
  const lock = await this.redisClient.set(lockKey, '1', { EX: 5, NX: true });

  if (!lock) {
    // 其他实例正在查询数据库，等待 50ms 后重试
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.findOne(id);
  }
  try {
    const post = await this.prisma.post.findUniqueOrThrow({ where: { id } });
    await this.cacheManager.set(\`post:\${id}\`, post, 300);
    return post;
  } finally {
    await this.redisClient.del(lockKey);  // 释放锁
  }
}`;

export default function LessonRealtime() {
  const [tab, setTab] = useState('websocket');

  const tabs = [
    { key: 'websocket', label: '📡 WebSocket 实时通信', code: CODE_WEBSOCKET },
    { key: 'bull',      label: '⚙️ Bull 任务队列',       code: CODE_BULL },
    { key: 'redis',     label: '🚀 Redis 缓存策略',       code: CODE_REDIS },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="nn-lesson">
      <div className="nn-hero">
        <div className="nn-badge">// MODULE 06 · REALTIME & ASYNC</div>
        <h1>实时与异步</h1>
        <p>现代后端不仅仅是 REST API——<strong>WebSocket 实现实时推送、Bull 队列解耦异步任务、Redis 缓存加速热点数据</strong>。这三项技术组合，让你的后端具备生产级的吞吐能力。</p>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">⚡ 实时与异步三主题</div>
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
        <div className="nn-section-title">📊 三种异步通信方式对比</div>
        <div className="nn-card" style={{ overflowX: 'auto' }}>
          <table className="nn-table">
            <thead><tr><th>方式</th><th>方向</th><th>延迟</th><th>适合场景</th><th>库</th></tr></thead>
            <tbody>
              {[
                ['WebSocket', '双向', '极低(<10ms)', '聊天/协作/游戏/仪表盘实时数据', 'socket.io (@nestjs/websockets)'],
                ['SSE（Server-Sent Event）', '服务端→客户端', '低', '通知推送/进度报告/实时日志', '@nestjs/sse + EventSource'],
                ['Bull 队列', '异步解耦', '可控（秒~分钟）', '邮件/图片处理/数据导出/定时任务', '@nestjs/bull + Redis'],
                ['gRPC', '双向流', '极低', '微服务间通信/大数据流', '@nestjs/microservices'],
              ].map(([way, dir, lat, scene, lib], i) => (
                <tr key={i}>
                  <td><span className="nn-tag teal">{way}</span></td>
                  <td style={{ color: 'var(--nn-muted)', fontSize: '0.83rem' }}>{dir}</td>
                  <td style={{ color: 'var(--nn-emerald)', fontWeight: 600, fontSize: '0.84rem' }}>{lat}</td>
                  <td style={{ color: 'var(--nn-muted)', fontSize: '0.82rem' }}>{scene}</td>
                  <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.75rem', color: 'var(--nn-sky)' }}>{lib}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
