import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Security 架构', 'JWT 认证', 'OAuth2 / OIDC', '权限控制'];

export default function LessonSpringSecurity() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☕ module_05 — 安全认证</div>
      <div className="fs-hero">
        <h1>安全认证：Spring Security / OAuth2 / JWT</h1>
        <p>
          Spring Security 是 Java 安全框架的标准——
          基于 <strong>过滤器链 (Filter Chain)</strong> 实现认证与授权，
          <strong>JWT</strong> 提供无状态的 Token 认证机制，
          <strong>OAuth2/OIDC</strong> 实现第三方登录和授权委托。
          正确配置安全策略是企业级应用的刚性需求。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☕ 安全认证深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ Spring Security 架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b91c1c'}}></span> SecurityArchitecture.java</div>
                <pre className="fs-code">{`// ═══ 过滤器链 (SecurityFilterChain) ═══
//
// HTTP Request
//   → SecurityContextPersistenceFilter (恢复上下文)
//   → CorsFilter (跨域)
//   → CsrfFilter (CSRF 防护)
//   → LogoutFilter (登出)
//   → UsernamePasswordAuthenticationFilter (表单登录)
//   → BearerTokenAuthenticationFilter (JWT)
//   → ExceptionTranslationFilter (异常转换)
//   → FilterSecurityInterceptor (授权检查)
//   → Controller

// ─── Spring Security 6.x 配置 ───
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // 方法级安全
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())  // REST API 无需 CSRF
            .cors(cors -> cors.configurationSource(corsConfig()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE).hasAuthority("DELETE_PRIVILEGE")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, resp, e) -> {
                    resp.setStatus(401);
                    resp.getWriter().write("{\\"error\\":\\"Unauthorized\\"}");
                })
                .accessDeniedHandler((req, resp, e) -> {
                    resp.setStatus(403);
                    resp.getWriter().write("{\\"error\\":\\"Forbidden\\"}");
                })
            )
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // cost = 12 (~250ms)
        // 不要用: MD5, SHA-256 (不加盐, 彩虹表!)
        // BCrypt: 自带盐, 自适应 cost
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration c)
            throws Exception {
        return c.getAuthenticationManager();
    }

    private CorsConfigurationSource corsConfig() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://app.example.com"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}

// ═══ UserDetailsService ═══
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        var user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(email));
        
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .roles(user.getRoles().toArray(String[]::new))
            .authorities(user.getPermissions().toArray(String[]::new))
            .accountLocked(user.isLocked())
            .disabled(!user.isActive())
            .build();
    }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔑 JWT 认证</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> JwtAuth.java</div>
                <pre className="fs-code">{`// ═══ JWT 结构 ═══
// Header.Payload.Signature
// eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.HMAC_SIGNATURE
//
// Header:  {"alg": "HS256", "typ": "JWT"}
// Payload: {"sub": "user@example.com", "roles": ["USER"],
//           "iat": 1700000000, "exp": 1700003600}
// Signature: HMAC-SHA256(base64(header) + "." + base64(payload), secret)

@Component
public class JwtTokenProvider {
    @Value("\${jwt.secret}")
    private String secret;
    
    @Value("\${jwt.access-token-expiry:3600000}")  // 1 小时
    private long accessTokenExpiry;
    
    @Value("\${jwt.refresh-token-expiry:604800000}") // 7 天
    private long refreshTokenExpiry;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserDetails user) {
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("roles", user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessTokenExpiry))
            .signWith(getSigningKey())
            .compact();
    }
    
    public String generateRefreshToken(UserDetails user) {
        return Jwts.builder()
            .subject(user.getUsername())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiry))
            .signWith(getSigningKey())
            .compact();
    }

    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            getClaims(token); // 自动验证签名和过期
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}

// ─── JWT 过滤器 ───
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwt;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse resp, FilterChain chain)
            throws ServletException, IOException {
        
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwt.isValid(token)) {
                String username = jwt.getUsername(token);
                var userDetails = userDetailsService.loadUserByUsername(username);
                var auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, resp);
    }
}

// ─── 登录接口 ───
@PostMapping("/api/auth/login")
public AuthResponse login(@RequestBody LoginRequest req) {
    var auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.email(), req.password()));
    var user = (UserDetails) auth.getPrincipal();
    return new AuthResponse(
        jwt.generateAccessToken(user),
        jwt.generateRefreshToken(user));
}

// ─── Token 续签 ───
@PostMapping("/api/auth/refresh")
public AuthResponse refresh(@RequestBody RefreshRequest req) {
    if (!jwt.isValid(req.refreshToken()))
        throw new InvalidTokenException();
    String username = jwt.getUsername(req.refreshToken());
    var user = userDetailsService.loadUserByUsername(username);
    return new AuthResponse(
        jwt.generateAccessToken(user),
        req.refreshToken()); // refreshToken 不更新
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 OAuth2 / OIDC</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> OAuth2.java</div>
                <pre className="fs-code">{`// ═══ OAuth2 授权码流程 (Authorization Code) ═══
//
// 1. 用户点击 "用 Google 登录"
// 2. 重定向到 Google 授权页面:
//    GET https://accounts.google.com/o/oauth2/auth
//        ?client_id=xxx
//        &redirect_uri=https://app.com/callback
//        &response_type=code
//        &scope=openid email profile
//        &state=随机值 (防 CSRF)
//
// 3. 用户授权 → Google 重定向回来:
//    GET https://app.com/callback?code=AUTH_CODE&state=xxx
//
// 4. 后端用 AUTH_CODE 换 Token:
//    POST https://oauth2.googleapis.com/token
//    {client_id, client_secret, code, redirect_uri, grant_type}
//    → 返回: {access_token, id_token, refresh_token}
//
// 5. 用 access_token 调用 Google API 获取用户信息

// ─── Spring Boot OAuth2 Client 配置 ───
// application.yml:
// spring:
//   security:
//     oauth2:
//       client:
//         registration:
//           google:
//             client-id: \${GOOGLE_CLIENT_ID}
//             client-secret: \${GOOGLE_CLIENT_SECRET}
//             scope: openid, email, profile
//           github:
//             client-id: \${GITHUB_CLIENT_ID}
//             client-secret: \${GITHUB_CLIENT_SECRET}
//             scope: user:email

// ─── 自定义 OAuth2 登录成功处理 ───
@Component
public class OAuth2LoginSuccessHandler
        implements AuthenticationSuccessHandler {
    
    private final UserService userService;
    private final JwtTokenProvider jwtProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req,
            HttpServletResponse resp,
            Authentication auth) throws IOException {
        
        var oauth2User = (OAuth2User) auth.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String provider = ((OAuth2AuthenticationToken) auth)
            .getAuthorizedClientRegistrationId(); // "google"
        
        // 创建或关联本地用户
        var user = userService.findOrCreateOAuth2User(email, name, provider);
        
        // 签发 JWT
        String token = jwtProvider.generateAccessToken(user);
        
        // 重定向到前端 (携带 token)
        resp.sendRedirect(
            "https://app.com/auth/callback?token=" + token);
    }
}

// ═══ OIDC (OpenID Connect) ═══
// OAuth2 的身份层扩展:
//   OAuth2: 授权 (我允许你访问我的资源)
//   OIDC:   认证 (我是谁) + 授权
//
// OIDC 额外提供:
//   → id_token (JWT 格式, 包含用户身份信息)
//   → UserInfo Endpoint
//   → Discovery (.well-known/openid-configuration)
//   → 标准 Scope: openid, profile, email, address, phone

// ═══ OAuth2 Resource Server (受保护的 API) ═══
// application.yml:
// spring:
//   security:
//     oauth2:
//       resourceserver:
//         jwt:
//           issuer-uri: https://accounts.google.com
//           # 或 jwk-set-uri: https://.../.well-known/jwks.json

@Bean
public SecurityFilterChain resourceServerChain(HttpSecurity http)
        throws Exception {
    return http
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt
                .jwtAuthenticationConverter(jwtConverter())))
        .build();
}

// 自定义 JWT → Authentication 转换
private JwtAuthenticationConverter jwtConverter() {
    var converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(jwt -> {
        var roles = jwt.getClaimAsStringList("roles");
        return roles.stream()
            .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
            .collect(Collectors.toList());
    });
    return converter;
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ 权限控制</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> Authorization.java</div>
                <pre className="fs-code">{`// ═══ 方法级安全 ═══

@Service
public class DocumentService {
    
    // 角色检查
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAll() { ... }
    
    // 权限检查
    @PreAuthorize("hasAuthority('DOCUMENT_WRITE')")
    public DocumentDTO create(CreateDocRequest req) { ... }
    
    // SpEL 表达式 (访问参数!)
    @PreAuthorize("#userId == authentication.principal.id " +
                  "or hasRole('ADMIN')")
    public List<DocumentDTO> findByUser(Long userId) { ... }
    
    // 返回值过滤
    @PostAuthorize("returnObject.ownerId == authentication.principal.id")
    public DocumentDTO findById(Long id) { ... }
    
    // 集合过滤
    @PostFilter("filterObject.isPublic or " +
                "filterObject.ownerId == authentication.principal.id")
    public List<DocumentDTO> findAll() { ... }
    
    // 自定义权限评估器
    @PreAuthorize("@documentPermission.canEdit(#id, authentication)")
    public DocumentDTO update(Long id, UpdateDocRequest req) { ... }
}

// ─── 自定义权限评估器 ───
@Component("documentPermission")
public class DocumentPermissionEvaluator {
    private final DocumentRepository docRepo;

    public boolean canEdit(Long docId, Authentication auth) {
        var doc = docRepo.findById(docId).orElse(null);
        if (doc == null) return false;
        
        var userId = ((CustomUserDetails) auth.getPrincipal()).getId();
        
        // 管理员可编辑所有
        if (auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            return true;
        
        // 所有者可编辑
        return doc.getOwnerId().equals(userId);
    }
}

// ═══ RBAC vs ABAC ═══
//
// RBAC (Role-Based Access Control):
//   用户 → 角色 → 权限
//   简单, 适合大多数场景
//   
//   User: Alice → Roles: [ADMIN, EDITOR]
//   Role ADMIN → Permissions: [USER_MANAGE, DOC_DELETE]
//   Role EDITOR → Permissions: [DOC_CREATE, DOC_EDIT]
//
// ABAC (Attribute-Based Access Control):
//   基于属性的动态决策
//   更灵活, 但更复杂
//   
//   规则: IF user.department == resource.department
//         AND user.clearance >= resource.classification
//         AND time.hour BETWEEN 9 AND 18
//         THEN ALLOW
//
// 推荐: RBAC + 少量 ABAC 扩展

// ═══ 数据库 RBAC 模型 ═══
//
// users ──M:N── user_roles ──M:N── roles
//                                    │
//                              role_permissions
//                                    │
//                               permissions
//
// @Entity
// public class Role {
//     @Id private Long id;
//     private String name; // ADMIN, EDITOR, VIEWER
//     
//     @ManyToMany(fetch = FetchType.EAGER)
//     @JoinTable(name = "role_permissions",
//         joinColumns = @JoinColumn(name = "role_id"),
//         inverseJoinColumns = @JoinColumn(name = "permission_id"))
//     private Set<Permission> permissions;
// }

// ═══ 安全最佳实践 ═══
// 1. 密码: BCrypt (cost >= 12) + salt (自带)
// 2. JWT: 短有效期 (15-60min) + Refresh Token
// 3. Refresh Token: 存 DB, 支持主动撤销
// 4. HTTPS: 生产环境必须!
// 5. 敏感数据: 不放 JWT Payload (用 opaque token 查 DB)
// 6. Rate Limit: 登录接口限流 (防暴力破解)
// 7. 日志: 登录/授权失败记录审计日志
// 8. 依赖: 及时更新 Spring Security 版本`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
