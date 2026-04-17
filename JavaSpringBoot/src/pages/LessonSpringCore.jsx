import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['IoC 容器', 'AOP 切面', 'Bean 生命周期', '配置与 Profile'];

export default function LessonSpringCore() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☕ module_02 — Spring 核心</div>
      <div className="fs-hero">
        <h1>Spring 核心：IoC 容器 / AOP / Bean 生命周期</h1>
        <p>
          Spring Framework 的核心是 <strong>IoC (控制反转)</strong> 容器和 <strong>AOP (面向切面编程)</strong>——
          IoC 通过依赖注入 (DI) 解耦组件，AOP 将日志、事务、安全等横切关注点从业务逻辑中分离。
          理解 Bean 生命周期、作用域和条件装配是掌握整个 Spring 生态的基础。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☕ Spring 核心深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 IoC 容器与依赖注入</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b91c1c'}}></span> IoCContainer.java</div>
                <pre className="fs-code">{`// ═══ IoC (Inversion of Control) ═══
// 核心思想: 对象不自己创建依赖, 而是由容器注入

// 传统方式 (紧耦合):
class OrderService {
    private final UserRepo repo = new MySQLUserRepo(); // 硬编码!
}

// Spring DI (松耦合):
@Service
class OrderService {
    private final UserRepo repo; // 接口!
    
    // 构造器注入 (推荐! 不可变 + 便于测试)
    public OrderService(UserRepo repo) {
        this.repo = repo;
    }
}

// ─── 三种注入方式 ───

// 1. 构造器注入 (首选)
@Service
public class PaymentService {
    private final OrderRepo orderRepo;
    private final NotificationService notifier;
    
    // Spring 自动注入 (单构造器可省略 @Autowired)
    public PaymentService(OrderRepo orderRepo,
                          NotificationService notifier) {
        this.orderRepo = orderRepo;
        this.notifier = notifier;
    }
}

// 2. Setter 注入 (可选依赖)
@Service
public class ReportService {
    private EmailSender emailSender;
    
    @Autowired(required = false) // 可选!
    public void setEmailSender(EmailSender sender) {
        this.emailSender = sender;
    }
}

// 3. 字段注入 (不推荐!)
@Service
public class BadService {
    @Autowired  // 缺点: 不可变性差, 不利于测试
    private UserRepo repo;
}

// ─── 多实现选择 ───

public interface NotificationService {
    void send(String msg);
}

@Service
@Primary  // 默认使用这个
public class EmailNotification implements NotificationService { }

@Service("sms")
public class SmsNotification implements NotificationService { }

@Service
public class OrderProcessor {
    // @Qualifier 精确指定
    public OrderProcessor(
        @Qualifier("sms") NotificationService notifier) { }
}

// ─── 自动装配规则 ───
// 1. 按类型查找 (byType)
// 2. 多个匹配 → 按名称 (byName, 参数名匹配 Bean 名)
// 3. 仍有歧义 → @Primary / @Qualifier
// 4. 都没有 → 启动失败: NoUniqueBeanDefinitionException`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>✂️ AOP 面向切面编程</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> AopDemo.java</div>
                <pre className="fs-code">{`// ═══ AOP 核心概念 ═══
// 
// Aspect  (切面):   横切关注点的模块化 (日志/事务/安全)
// Advice  (通知):   切面的行为 (Before/After/Around)
// JoinPoint(连接点): 程序执行的某个点 (方法调用)
// Pointcut (切点):   匹配 JoinPoint 的表达式
// Weaving  (织入):   将切面代码织入目标代码

// ─── 实战: 方法执行日志 ───
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    // Pointcut: 匹配 service 包下所有 public 方法
    @Pointcut("execution(* com.example.service.*.*(..))")
    private void serviceLayer() {}

    // Around Advice: 最强大 (可以控制是否执行目标方法)
    @Around("serviceLayer()")
    public Object logExecution(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        Object[] args = pjp.getArgs();
        
        log.info(">>> {} args={}", method, Arrays.toString(args));
        long start = System.nanoTime();
        try {
            Object result = pjp.proceed(); // 执行目标方法!
            long ms = (System.nanoTime() - start) / 1_000_000;
            log.info("<<< {} returned={} ({}ms)", method, result, ms);
            return result;
        } catch (Exception e) {
            log.error("!!! {} threw {}", method, e.getMessage());
            throw e;
        }
    }
}

// ─── 实战: 自定义注解 + AOP ───
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    int value() default 10;    // 每秒请求数
    String key() default "";   // 限流 key
}

@Aspect
@Component
public class RateLimitAspect {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    @Around("@annotation(rateLimit)")
    public Object limit(ProceedingJoinPoint pjp, RateLimit rateLimit)
            throws Throwable {
        String key = rateLimit.key().isEmpty()
            ? pjp.getSignature().toShortString()
            : rateLimit.key();
        
        Bucket bucket = buckets.computeIfAbsent(key,
            k -> Bucket.builder()
                .addLimit(Bandwidth.simple(rateLimit.value(),
                    Duration.ofSeconds(1)))
                .build());
        
        if (!bucket.tryConsume(1)) {
            throw new TooManyRequestsException("Rate limit exceeded");
        }
        return pjp.proceed();
    }
}

// 使用:
@Service
public class ApiService {
    @RateLimit(value = 100, key = "api-search")
    public SearchResult search(String query) { ... }
}

// ─── AOP 底层: 代理模式 ───
// JDK 动态代理: 目标实现了接口 → Proxy.newProxyInstance
// CGLIB 代理:   目标没有接口 → 生成子类 (字节码增强)
// Spring Boot 默认: 始终使用 CGLIB (proxyTargetClass=true)

// 陷阱: 自调用不走代理!
@Service
public class UserService {
    @Transactional
    public void createUser(User u) { ... }
    
    public void batchCreate(List<User> users) {
        users.forEach(this::createUser);
        // ❌ createUser 的 @Transactional 不生效!
        // 因为 this 是真实对象, 不是代理!
    }
}
// 解决: 注入自身, 或使用 AopContext.currentProxy()`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>♻️ Bean 生命周期</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> BeanLifecycle.java</div>
                <pre className="fs-code">{`// ═══ Bean 生命周期全流程 ═══
//
// 1. 实例化 (Instantiation)
//    → 调用构造器创建对象
//
// 2. 属性填充 (Populate Properties)
//    → 依赖注入 (@Autowired, @Value)
//
// 3. Aware 接口回调
//    → BeanNameAware.setBeanName()
//    → BeanFactoryAware.setBeanFactory()
//    → ApplicationContextAware.setApplicationContext()
//
// 4. BeanPostProcessor.postProcessBeforeInitialization()
//    → 所有 BPP 的 before 方法
//    → @PostConstruct 在这里执行!
//
// 5. InitializingBean.afterPropertiesSet()
//    → 或 @Bean(initMethod = "init")
//
// 6. BeanPostProcessor.postProcessAfterInitialization()
//    → AOP 代理在这里创建!
//
// 7. Bean 就绪, 可以使用
//
// 8. @PreDestroy → DisposableBean.destroy()

// ─── 实战示例 ───
@Component
public class ConnectionPool implements InitializingBean, DisposableBean {
    
    @Value("\${db.pool.size:10}")
    private int poolSize;
    
    private List<Connection> connections;
    
    @PostConstruct  // 在依赖注入完成后
    public void postConstruct() {
        log.info("@PostConstruct: poolSize={}", poolSize);
    }
    
    @Override
    public void afterPropertiesSet() {
        // 初始化连接池
        connections = IntStream.range(0, poolSize)
            .mapToObj(i -> createConnection())
            .toList();
        log.info("Pool initialized with {} connections", poolSize);
    }
    
    @PreDestroy
    public void preDestroy() {
        log.info("@PreDestroy: closing connections");
    }

    @Override
    public void destroy() {
        connections.forEach(Connection::close);
        log.info("All connections closed");
    }
}

// ═══ Bean 作用域 (Scope) ═══

// singleton (默认): 整个容器一个实例
@Scope("singleton")

// prototype: 每次注入创建新实例
@Scope("prototype")

// request: 每个 HTTP 请求一个实例
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)

// session: 每个 HTTP Session 一个实例
@Scope("session")

// 陷阱: Singleton 注入 Prototype
@Component
public class SingletonService {
    @Autowired
    private PrototypeBean proto; // ❌ 总是同一个实例!
    
    // 解决方案 1: ObjectProvider
    @Autowired
    private ObjectProvider<PrototypeBean> protoProvider;
    public void doWork() {
        var proto = protoProvider.getObject(); // 每次新实例
    }
    
    // 解决方案 2: @Lookup
    @Lookup
    protected PrototypeBean createProto() { return null; }
}

// ═══ 条件装配 ═══
@Configuration
public class StorageConfig {
    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "s3")
    public StorageService s3Storage() { return new S3Storage(); }
    
    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "local")
    public StorageService localStorage() { return new LocalStorage(); }
    
    @Bean
    @ConditionalOnMissingBean(StorageService.class)
    public StorageService defaultStorage() { return new LocalStorage(); }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ 配置与 Profile</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> Configuration.java</div>
                <pre className="fs-code">{`// ═══ 配置文件优先级 (从高到低) ═══
//
// 1. 命令行参数: --server.port=9090
// 2. 环境变量:   SERVER_PORT=9090
// 3. application-{profile}.yml
// 4. application.yml
// 5. @PropertySource
// 6. 默认值

// ─── 类型安全的配置 ───
@ConfigurationProperties(prefix = "app.cache")
@Validated
public record CacheProperties(
    @NotNull String type,           // app.cache.type
    @Min(1) int maxSize,            // app.cache.max-size
    @DurationUnit(ChronoUnit.SECONDS)
    Duration ttl,                   // app.cache.ttl (30s, 5m)
    Map<String, String> headers     // app.cache.headers.x-key=value
) {}

// application.yml:
// app:
//   cache:
//     type: redis
//     max-size: 1000
//     ttl: 5m
//     headers:
//       x-cache-control: max-age=300

// ═══ Profile ═══

// application-dev.yml:
// spring:
//   datasource:
//     url: jdbc:h2:mem:devdb
//   jpa:
//     show-sql: true

// application-prod.yml:  
// spring:
//   datasource:
//     url: jdbc:postgresql://prod-db:5432/appdb
//   jpa:
//     show-sql: false

// 激活方式:
// 1. spring.profiles.active=prod (配置文件)
// 2. --spring.profiles.active=prod (命令行)
// 3. SPRING_PROFILES_ACTIVE=prod (环境变量)
// 4. @ActiveProfiles("test") (测试)

// ─── Profile 条件 Bean ───
@Configuration
public class DataSourceConfig {
    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        // H2 内存数据库, 快速启动
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .addScript("schema.sql")
            .build();
    }
    
    @Bean
    @Profile("prod")
    public DataSource prodDataSource(DataSourceProperties props) {
        return HikariDataSource(props);
    }
}

// ═══ 自动配置原理 ═══
// @SpringBootApplication 包含:
//   @EnableAutoConfiguration → 扫描 META-INF/spring.factories
//   → 加载所有 AutoConfiguration 类
//   → @Conditional* 决定哪些生效

// 例: DataSourceAutoConfiguration
@Configuration
@ConditionalOnClass(DataSource.class)       // 有 DataSource 类
@ConditionalOnMissingBean(DataSource.class) // 用户没自定义
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    @Bean
    public DataSource dataSource(DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }
}

// 查看自动配置报告:
// 启动参数: --debug
// 或  application.yml: debug: true
// 输出: Positive matches / Negative matches / Exclusions

// ═══ 自定义 Starter ═══
// 1. 创建 xxx-spring-boot-autoconfigure 模块
// 2. 创建 @Configuration + @Conditional* 类
// 3. 注册到 META-INF/spring/
//    org.springframework.boot.autoconfigure.AutoConfiguration.imports
// 4. 创建 xxx-spring-boot-starter 模块 (只有依赖)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
