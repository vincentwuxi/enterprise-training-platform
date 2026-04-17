import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Spring Cloud 全景', '注册中心与配置', 'API 网关', '熔断与链路'];

export default function LessonSpringCloud() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☕ module_06 — 微服务架构</div>
      <div className="fs-hero">
        <h1>微服务架构：Spring Cloud / 注册中心 / 网关 / 熔断</h1>
        <p>
          Spring Cloud 提供了一套完整的微服务基础设施——
          <strong>Nacos</strong> 做服务注册与配置中心，<strong>Spring Cloud Gateway</strong> 做 API 网关，
          <strong>Resilience4j</strong> 实现熔断降级，<strong>OpenFeign</strong> 简化服务间调用。
          这些组件协同工作，构建出高可用的分布式系统。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☕ 微服务架构深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 Spring Cloud 技术全景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b91c1c'}}></span> spring_cloud.txt</div>
                <pre className="fs-code">{`═══ Spring Cloud 组件矩阵 (2024+) ═══

  组件          │ Netflix (停更)  │ 当前推荐
  ──────────────┼─────────────────┼───────────────
  服务注册      │ Eureka          │ Nacos / Consul
  配置中心      │ Spring Config   │ Nacos / Apollo
  网关          │ Zuul            │ Spring Cloud Gateway
  负载均衡      │ Ribbon          │ Spring Cloud LoadBalancer
  服务调用      │ Feign           │ OpenFeign
  熔断降级      │ Hystrix         │ Resilience4j / Sentinel
  链路追踪      │ Sleuth          │ Micrometer Tracing
  消息          │ —               │ Spring Cloud Stream

═══ 微服务架构全景 ═══

         ┌──── API Gateway (Spring Cloud Gateway) ────┐
         │  路由 / 限流 / 鉴权 / 日志                    │
         └─────────────────┬──────────────────────────┘
                           │
    ┌──────────┬────────────┼────────────┬──────────┐
    │          │            │            │          │
  User       Order       Payment    Inventory   Notify
  Service    Service     Service    Service     Service
    │          │            │            │          │
    └──────────┴────────────┴────────────┴──────────┘
         │                              │
    ┌────┴────┐                   ┌─────┴─────┐
    │  Nacos  │                   │   Kafka   │
    │ Registry│                   │   / MQ    │
    │ + Config│                   │           │
    └─────────┘                   └───────────┘

═══ OpenFeign (声明式 HTTP 客户端) ═══

// 接口声明 (像本地方法一样调用远程服务!)
@FeignClient(
    name = "user-service",           // Nacos 注册的服务名
    fallbackFactory = UserFeignFallback.class,
    configuration = FeignConfig.class
)
public interface UserFeignClient {

    @GetMapping("/api/users/{id}")
    UserDTO getById(@PathVariable("id") Long id);

    @PostMapping("/api/users")
    UserDTO create(@RequestBody CreateUserRequest req);

    @GetMapping("/api/users")
    Page<UserDTO> list(@RequestParam("page") int page,
                       @RequestParam("size") int size);
}

// 降级工厂
@Component
public class UserFeignFallback
        implements FallbackFactory<UserFeignClient> {
    @Override
    public UserFeignClient create(Throwable cause) {
        return new UserFeignClient() {
            public UserDTO getById(Long id) {
                log.warn("Fallback getUser: {}", cause.getMessage());
                return UserDTO.defaultUser(); // 返回默认值
            }
            // ...
        };
    }
}

// Feign 配置
@Configuration
public class FeignConfig {
    @Bean
    public Request.Options options() {
        return new Request.Options(
            5, TimeUnit.SECONDS,   // 连接超时
            10, TimeUnit.SECONDS,  // 读超时
            true);                  // 跟随重定向
    }
    
    @Bean
    public Retryer retryer() {
        return new Retryer.Default(100, 1000, 3); // 最多重试3次
    }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 注册中心与配置中心</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> NacosConfig.txt</div>
                <pre className="fs-code">{`═══ Nacos 服务注册 ═══

# application.yml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        namespace: dev          # 环境隔离
        group: DEFAULT_GROUP
        weight: 1               # 负载均衡权重
        metadata:
          version: v2           # 灰度发布标识

# 服务启动后自动注册到 Nacos
# 其他服务通过 "order-service" 发现

═══ Nacos 配置中心 ═══

# bootstrap.yml (优先于 application.yml 加载)
spring:
  cloud:
    nacos:
      config:
        server-addr: nacos:8848
        namespace: dev
        file-extension: yml
        shared-configs:
          - data-id: common.yml   # 共享配置
            group: DEFAULT_GROUP
            refresh: true

# 配置发布在 Nacos 控制台:
# Data ID: order-service-dev.yml
# Group:   DEFAULT_GROUP
# 内容:
#   order:
#     max-items: 50
#     expire-minutes: 30

═══ 动态刷新配置 ═══

@Component
@RefreshScope  // 配置变更时自动刷新!
public class OrderConfig {
    @Value("\${order.max-items:20}")
    private int maxItems;
    
    @Value("\${order.expire-minutes:60}")
    private int expireMinutes;
}

// 或使用 @ConfigurationProperties (推荐)
@ConfigurationProperties(prefix = "order")
public record OrderProperties(
    int maxItems,
    int expireMinutes
) {}
// Nacos 修改配置 → 实时生效 → 无需重启!

═══ 灰度发布 (通过 Nacos metadata) ═══

// 自定义负载均衡规则: 只路由到相同版本
public class VersionLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        String targetVersion = getVersionFromHeader(request);
        
        return serviceInstanceListSupplier.get()
            .map(instances -> instances.stream()
                .filter(i -> targetVersion.equals(
                    i.getMetadata().get("version")))
                .toList())
            .map(this::randomChoose);
    }
}

═══ 配置中心对比 ═══

           │ Nacos        │ Apollo       │ Spring Config
  ─────────┼──────────────┼──────────────┼──────────────
  实时推送  │ ✅ 长轮询    │ ✅ 长轮询    │ ❌ 需要 Bus
  灰度发布  │ ✅           │ ✅           │ ❌
  权限管理  │ 基础         │ 细粒度       │ Git 权限
  运维复杂度│ 中           │ 高           │ 低
  推荐      │ 中小型       │ 大型企业     │ 简单场景`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚪 Spring Cloud Gateway</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> Gateway.java</div>
                <pre className="fs-code">{`// ═══ Gateway 架构 ═══
// 基于 WebFlux (Netty) — 非阻塞!
//
// Client → Gateway → Route Predicate → Filter Chain → Upstream
//
// Route:     路由规则 (Path/Header/Method → 目标服务)
// Predicate: 匹配条件 (路径/时间/Header/Cookie)
// Filter:    过滤器 (请求/响应修改)

// ─── YAML 配置路由 ───
// application.yml:
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service    # lb:// = 负载均衡
          predicates:
            - Path=/api/users/**
            - Method=GET,POST,PUT,DELETE
          filters:
            - StripPrefix=1         # 去掉 /api 前缀
            - AddRequestHeader=X-Request-Source, gateway
            - RequestRateLimiter=10, 20, #{@userKeyResolver}

        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
            - Header=X-Api-Version, v2  # 只匹配 v2
          filters:
            - StripPrefix=1
            - CircuitBreaker=orderCB, /fallback/order

// ═══ 自定义 Global Filter ═══
@Component
@Order(-1)  // 最高优先级
public class AuthGlobalFilter implements GlobalFilter {

    private final JwtTokenProvider jwt;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                              GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        
        // 白名单路径跳过认证
        if (isWhiteListed(path)) {
            return chain.filter(exchange);
        }
        
        String token = request.getHeaders()
            .getFirst("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }
        
        token = token.substring(7);
        if (!jwt.isValid(token)) {
            return unauthorized(exchange);
        }
        
        // 将用户信息传递到下游
        String userId = jwt.getUsername(token);
        ServerHttpRequest mutated = request.mutate()
            .header("X-User-Id", userId)
            .build();
        
        return chain.filter(exchange.mutate().request(mutated).build());
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}

// ═══ 限流 (RequestRateLimiter + Redis) ═══
@Bean
public KeyResolver userKeyResolver() {
    return exchange -> Mono.justOrEmpty(
        exchange.getRequest().getHeaders().getFirst("X-User-Id"))
        .defaultIfEmpty("anonymous");
}

// application.yml:
// spring.cloud.gateway.routes[0].filters:
//   - name: RequestRateLimiter
//     args:
//       redis-rate-limiter.replenishRate: 10   # 令牌/秒
//       redis-rate-limiter.burstCapacity: 20   # 桶容量
//       key-resolver: "#{@userKeyResolver}"

// ═══ Gateway vs Nginx ═══
//
//          │ Gateway            │ Nginx
// ─────────┼────────────────────┼──────────────
// 语言      │ Java (WebFlux)    │ C
// 服务发现  │ ✅ Nacos 集成     │ 需要额外配置
// 动态路由  │ ✅ Nacos 配置     │ 需要重载
// 自定义    │ Java Filter       │ Lua / Module
// 性能      │ 中高              │ 极高
// 适合      │ 微服务内部网关    │ 边缘负载均衡`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 熔断降级与链路追踪</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> Resilience.java</div>
                <pre className="fs-code">{`// ═══ Resilience4j 熔断器 ═══
// application.yml:
resilience4j:
  circuitbreaker:
    instances:
      payment-service:
        slidingWindowSize: 10          # 统计窗口大小
        minimumNumberOfCalls: 5        # 最小调用数
        failureRateThreshold: 50       # 失败率阈值 (%)
        waitDurationInOpenState: 30s   # 熔断持续时间
        permittedNumberOfCallsInHalfOpenState: 3
        recordExceptions:
          - java.io.IOException
          - java.util.concurrent.TimeoutException

  retry:
    instances:
      payment-service:
        maxAttempts: 3
        waitDuration: 1s
        retryExceptions:
          - java.io.IOException

  ratelimiter:
    instances:
      payment-api:
        limitForPeriod: 100            # 周期内允许的请求数
        limitRefreshPeriod: 1s
        timeoutDuration: 500ms

// ─── 使用注解 ───
@Service
public class PaymentService {

    @CircuitBreaker(name = "payment-service",
                    fallbackMethod = "paymentFallback")
    @Retry(name = "payment-service")
    @RateLimiter(name = "payment-api")
    public PaymentResult processPayment(PaymentRequest req) {
        return paymentGateway.charge(req);
    }

    // 降级方法 (参数 + Throwable)
    private PaymentResult paymentFallback(PaymentRequest req,
                                          Throwable ex) {
        log.warn("Payment fallback: {}", ex.getMessage());
        return PaymentResult.pending(req.getOrderId());
        // 创建待处理记录, 后续异步补偿
    }
}

// ═══ Sentinel (阿里开源, 功能更强) ═══
// 比 Resilience4j 多:
//   → 系统自适应保护 (CPU/Load 阈值)
//   → 热点参数限流 (对特定参数值限流)
//   → 集群限流 (Token Server)
//   → Dashboard (可视化控制台, 动态规则)

// ═══ Micrometer Tracing (链路追踪) ═══
// 替代 Spring Cloud Sleuth (已停更)

// pom.xml:
// <dependency>
//   <groupId>io.micrometer</groupId>
//   <artifactId>micrometer-tracing-bridge-otel</artifactId>
// </dependency>
// <dependency>
//   <groupId>io.opentelemetry</groupId>
//   <artifactId>opentelemetry-exporter-otlp</artifactId>
// </dependency>

// application.yml:
management:
  tracing:
    sampling:
      probability: 1.0    # 100% 采样 (生产用 0.1)
  otlp:
    tracing:
      endpoint: http://jaeger:4318/v1/traces

// 自动注入 TraceId 到日志:
// logback-spring.xml:
// <pattern>%d{HH:mm:ss} [%X{traceId}] [%thread] %-5level %logger - %msg%n</pattern>

// 调用链示例:
// Gateway [traceId=abc]
//   → UserService [traceId=abc, spanId=001]
//     → OrderService [traceId=abc, spanId=002]
//       → PaymentService [traceId=abc, spanId=003]
// 
// Jaeger UI: 完整调用瀑布图 + 延迟分析

// ═══ 分布式事务 ═══
// Seata (AT 模式):
//   1. TM (事务管理器) 发起全局事务
//   2. 各 RM (资源管理器) 本地事务提交
//   3. 全部成功 → 全局提交
//   4. 任一失败 → 全局回滚 (Undo Log 补偿)
//
// 更推荐: 最终一致性 (消息队列 + 补偿)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
