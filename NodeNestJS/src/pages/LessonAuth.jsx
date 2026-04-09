import { useState } from 'react';
import './LessonCommon.css';

const CODE_JWT = `// ━━━━ JWT + Passport：完整认证体系 ━━━━

// ━━━━ 1. 本地策略（用户名密码登录）━━━━
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });   // 默认是 username，这里改为 email
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('邮箱或密码错误');
    return user;
  }
}

// ━━━━ 2. JWT 策略（接口认证）━━━━
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    // payload 包含 JWT 中 sign 时的数据
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}

// ━━━━ 3. Auth Service ━━━━
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User): Promise<TokensDto> {
    const payload: JwtPayload = {
      sub: user.id, email: user.email, roles: user.roles,
    };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.REFRESH_SECRET,
        expiresIn: '7d',
      }),
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokensDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });
      const user = await this.usersService.findOne(payload.sub);
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Refresh token 无效或已过期');
    }
  }
}

// ━━━━ 4. Auth Controller ━━━━
@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(LocalAuthGuard)                    // 触发 LocalStrategy
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshTokens(token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User) {
    // 将 Refresh Token 加入黑名单（Redis 存储）
    await this.authService.revokeRefreshToken(user.id);
    return { message: '已退出登录' };
  }
}`;

const CODE_RBAC = `// ━━━━ RBAC（基于角色的访问控制）━━━━

// ━━━━ 1. Roles 装饰器 ━━━━
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ━━━━ 2. Roles Guard ━━━━
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 读取 @Roles('admin', 'moderator') 的元数据
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),          // 方法级别的 @Roles
      context.getClass(),            // 类级别的 @Roles
    ]);

    if (!requiredRoles) return true; // 没有 @Roles 装饰器 → 放行

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}

// ━━━━ 3. Public 装饰器（跳过 JWT 认证）━━━━
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (isPublic) return true;      // @Public() 跳过 JWT 验证
    return super.canActivate(context);
  }
}

// ━━━━ 4. 使用示例 ━━━━
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')                                // 整个 Controller 仅 admin 可访问
export class AdminController {

  @Get('users')
  getAllUsers() { ... }                         // 继承 admin 权限

  @Delete('users/:id')
  @Roles('super-admin')                        // 方法级覆盖：仅 super-admin
  deleteUser(@Param('id') id: string) { ... }

  @Get('stats')
  @Public()                                    // 统计数据无需认证（覆盖 Controller 级别）
  getStats() { ... }
}`;

const CODE_OAUTH = `// ━━━━ OAuth2 第三方登录（GitHub 示例）━━━━

// ━━━━ 1. GitHub Strategy ━━━━
@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails, photos } = profile;
    const user = await this.authService.findOrCreateOAuthUser({
      provider: 'github',
      providerId: id,
      email: emails[0].value,
      name: displayName,
      avatar: photos[0].value,
    });
    done(null, user);
  }
}

// ━━━━ 2. Auth Controller OAuth 路由 ━━━━
@Get('github')
@UseGuards(AuthGuard('github'))
githubLogin() {}               // 重定向到 GitHub 授权页

@Get('github/callback')
@UseGuards(AuthGuard('github'))
githubCallback(@CurrentUser() user: User, @Res() res: Response) {
  const { accessToken, refreshToken } = this.authService.login(user);
  // 重定向到前端，携带 Token（Cookie 或 URL 参数）
  res.redirect(\`\${this.configService.get('FRONTEND_URL')}/auth/callback?token=\${accessToken}\`);
}

// ━━━━ 3. 安全最佳实践 ━━━━
// Access Token：短期（15分钟），Bearer Token
// Refresh Token：长期（7天），HttpOnly Cookie（防 XSS）
// PKCE：OAuth 流程必须使用 code_challenge
// State 参数：防 CSRF 攻击
// Token 轮换：每次 Refresh 都发新 Refresh Token，旧的失效

// 设置 HttpOnly Cookie
res.cookie('refresh_token', refreshToken, {
  httpOnly: true,          // JS 无法读取（防 XSS）
  secure: true,            // 仅 HTTPS
  sameSite: 'strict',      // 防 CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 天
});`;

export default function LessonAuth() {
  const [tab, setTab] = useState('jwt');

  const tabs = [
    { key: 'jwt',   label: '🔑 JWT + Passport',  code: CODE_JWT },
    { key: 'rbac',  label: '🛡️ RBAC 角色权限',    code: CODE_RBAC },
    { key: 'oauth', label: '🐙 OAuth2 第三方登录', code: CODE_OAUTH },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="nn-lesson">
      <div className="nn-hero">
        <div className="nn-badge">// MODULE 05 · AUTHENTICATION & AUTHORIZATION</div>
        <h1>认证与授权</h1>
        <p>企业级应用的安全核心——<strong>JWT 无状态认证、RBAC 角色权限控制、OAuth2 第三方登录三位一体</strong>。NestJS + Passport 让复杂的认证逻辑变得模块化和可测试。</p>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">🔐 认证三大主题</div>
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
        <div className="nn-section-title">🔴 安全红线（生产必须遵守）</div>
        <div className="nn-grid-2">
          {[
            { title: 'Token 安全', items: ['Access Token 有效期 ≤ 15 分钟', 'Refresh Token 存 HttpOnly Cookie（禁用 localStorage）', '每次 Refresh 轮换新 Refresh Token（旧的失效）', 'Refresh Token 撤销：Redis 黑名单机制'], color: '#ef4444' },
            { title: '密码安全', items: ['bcrypt cost factor ≥ 12（不用 MD5/SHA1！）', '永远不在日志中打印密码', 'Entity @Column({ select: false }) 保护密码字段', '账号锁定：连续 5 次失败锁定 15 分钟'], color: '#f59e0b' },
            { title: 'HTTPS & Headers', items: ['生产环境强制 HTTPS', 'Helmet 中间件：XSS/CSP/HSTS 防护', 'CORS 配置：只允许白名单域名', 'Rate Limiting：登录接口 10次/分钟'], color: '#0ea5e9' },
            { title: 'JWT 误区', items: ['JWT 不能存敏感数据（Base64 可解码）', 'JWT 无法主动失效（用 Redis 黑名单替代）', 'HS256 vs RS256：内部服务用 HS256，公开 API 用 RS256', 'kid（Key ID）：多密钥轮换的关键'], color: '#8b5cf6' },
          ].map((c, i) => (
            <div key={i} className="nn-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: c.color, marginBottom: '0.75rem' }}>🔴 {c.title}</div>
              {c.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.83rem', color: 'var(--nn-muted)' }}>
                  <span style={{ color: c.color, flexShrink: 0 }}>→</span>{item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
