import { useState } from 'react';
import './LessonCommon.css';

const CODE_MODULE = `// ━━━━ NestJS 模块系统：依赖注入容器 ━━━━
// NestJS 的核心：每个功能封装在 Module 里，通过 DI 容器管理

// app.module.ts（根模块）
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),     // 全局配置，一次导入可全局使用
    TypeOrmModule.forRootAsync({                   // 异步配置（等待 ConfigService 注入）
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    UsersModule,
    PostsModule,
    AuthModule,
  ],
})
export class AppModule {}

// ━━━━ users.module.ts（功能模块）━━━━
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),  // 注册 Entity（Repository 自动可用）
    JwtModule.register({ secret: '...', expiresIn: '7d' }),
  ],
  controllers: [UsersController],               // HTTP 路由处理
  providers: [
    UsersService,                               // 业务逻辑
    UsersRepository,                            // 数据访问层
    { provide: 'CACHE_SERVICE', useClass: RedisCacheService },  // 自定义 Provider
  ],
  exports: [UsersService],                      // 导出给其他 Module 使用
})
export class UsersModule {}`;

const CODE_DI = `// ━━━━ 依赖注入（DI）深度实战 ━━━━
// NestJS DI 容器：自动管理类的实例化和生命周期

// ━━━━ Service：业务逻辑层 ━━━━
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,     // TypeORM Repository 自动注入
    private readonly jwtService: JwtService,           // NestJS 内置，自动注入
    private readonly configService: ConfigService,     // 配置服务，自动注入
    @Inject('MAIL_SERVICE')
    private readonly mailService: IMailService,        // 接口注入（方便替换实现）
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({ ...dto, password: hashed });
    await this.usersRepo.save(user);
    await this.mailService.sendWelcomeEmail(user.email);  // 发送欢迎邮件
    return user;
  }
}

// ━━━━ Provider 的三种注册方式 ━━━━
// 1. useClass（默认，最常用）
providers: [UsersService]
// 等价于：
providers: [{ provide: UsersService, useClass: UsersService }]

// 2. useValue（常量/配置/Mock 测试）
providers: [{ provide: 'JWT_CONFIG', useValue: { secret: 'xxx', expiresIn: '7d' } }]

// 3. useFactory（异步初始化，如数据库连接）
providers: [{
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const client = createClient({ url: config.get('REDIS_URL') });
    await client.connect();
    return client;
  },
}]

// ━━━━ Provider 作用域（Scope）━━━━
// DEFAULT（单例）：整个应用共享一个实例（默认，大多数情况用这个）
// REQUEST：每个 HTTP 请求创建新实例（有性能开销！）
// TRANSIENT：每次注入创建新实例
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  // 可以直接注入 Request 对象
  constructor(@Inject(REQUEST) private request: Request) {}
}`;

const CODE_PIPES = `// ━━━━ NestJS 五大核心组件 ━━━━
// Middleware → Guard → Interceptor → Pipe → ExceptionFilter

// ━━━━ 1. Pipe：请求数据转换与校验 ━━━━
// 自动 ValidationPipe（推荐全局启用）
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,          // 自动剥离 DTO 未声明的字段
  forbidNonWhitelisted: true, // 遇到未声明字段直接报错
  transform: true,          // 自动转换类型（string → number）
  transformOptions: { enableImplicitConversion: true },
}));

// DTO 定义（class-validator）
export class CreatePostDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(20)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// ━━━━ 2. Guard：路由级别的权限控制 ━━━━
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;  // 没有限制角色 → 放行
    const { user } = context.switchToHttp().getRequest();
    return roles.some(role => user.roles?.includes(role));
  }
}

// 使用装饰器
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete(':id')
async deleteUser(@Param('id') id: string) { ... }

// ━━━━ 3. Interceptor：AOP 切面编程 ━━━━
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        console.log(\`\${req.method} \${req.url} - \${ms}ms\`);
      }),
    );
  }
}

// ━━━━ 4. ExceptionFilter：统一异常处理 ━━━━
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}`;

export default function LessonNestArch() {
  const [tab, setTab] = useState('module');

  const tabs = [
    { key: 'module', label: '📦 Module 系统',     code: CODE_MODULE },
    { key: 'di',     label: '💉 DI 容器深度',     code: CODE_DI },
    { key: 'pipes',  label: '🛡️ 五大核心组件',    code: CODE_PIPES },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="nn-lesson">
      <div className="nn-hero">
        <div className="nn-badge">// MODULE 02 · NESTJS ARCHITECTURE</div>
        <h1>NestJS 企业架构</h1>
        <p>NestJS 将 Angular 的设计思想带入后端——<strong>模块化、依赖注入、装饰器驱动</strong>。对 React+TypeScript 工程师来说，这套思维体系极其亲切，上手成本远低于 Express。</p>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">🏗️ NestJS 三大主题</div>
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
        <div className="nn-section-title">🔄 请求生命周期（Request Lifecycle）</div>
        <div className="nn-card">
          <div className="nn-steps">
            {[
              ['Middleware', '最先执行，类似 Express middleware（日志/CORS/Body Parse）', '#0f766e'],
              ['Guard', '认证/授权检查，返回 false 则 403 Forbidden', '#0ea5e9'],
              ['Interceptor（前）', '请求到达 Handler 之前（记录开始时间/修改请求）', '#8b5cf6'],
              ['Pipe', 'DTO 校验与类型转换（ValidationPipe）', '#f59e0b'],
              ['Controller Handler', '实际路由处理函数（@Get/@Post 等）', '#10b981'],
              ['Interceptor（后）', 'Handler 返回后（响应转换/统一格式/记录耗时）', '#8b5cf6'],
              ['ExceptionFilter', '任何阶段抛出异常都会到这里处理', '#ef4444'],
            ].map(([name, desc, color], i) => (
              <div key={i} className="nn-step">
                <div className="nn-step-num" style={{ background: `${color}22`, borderColor: color, color }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{name}</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--nn-muted)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="nn-tip">
          💡 <strong>对 React 工程师的类比</strong>：NestJS 的 Module = React 的 Context；Guard = React Router 的 PrivateRoute；Interceptor = Redux Middleware；Pipe = Zod/Yup 表单验证。
        </div>
      </div>
    </div>
  );
}
