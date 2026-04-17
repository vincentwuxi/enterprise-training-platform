import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Spring MVC', 'REST API 设计', 'WebFlux 响应式', '异常与校验'];

export default function LessonSpringWeb() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☕ module_03 — Web 开发</div>
      <div className="fs-hero">
        <h1>Web 开发：Spring MVC / REST / WebFlux 响应式</h1>
        <p>
          Spring MVC 是 Java Web 开发的事实标准——
          基于 <strong>DispatcherServlet</strong> 的请求分发模型处理 HTTP 请求，
          <strong>REST API</strong> 设计遵循统一接口约束，
          <strong>WebFlux</strong> 则基于 Reactor 提供非阻塞的响应式编程模型，
          适用于高并发 I/O 密集型场景。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☕ Web 开发深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 Spring MVC 请求处理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b91c1c'}}></span> SpringMVC.java</div>
                <pre className="fs-code">{`// ═══ DispatcherServlet 处理流程 ═══
//
// Client → DispatcherServlet (前端控制器)
//   → HandlerMapping (找到 @RequestMapping 方法)
//   → HandlerAdapter (调用 Controller 方法)
//   → Controller (业务处理)
//   → ViewResolver / HttpMessageConverter (渲染/序列化)
//   → Response

// ─── Controller 示例 ───
@RestController  // @Controller + @ResponseBody
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/v1/users?page=0&size=20&sort=name,asc
    @GetMapping
    public Page<UserDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {
        return userService.findAll(PageRequest.of(page, size,
            Sort.by(Sort.Direction.ASC, sort.split(",")[0])));
    }

    // GET /api/v1/users/123
    @GetMapping("/{id}")
    public UserDTO getById(@PathVariable Long id) {
        return userService.findById(id);
    }

    // POST /api/v1/users
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO create(@Valid @RequestBody CreateUserRequest req) {
        return userService.create(req);
    }

    // PUT /api/v1/users/123
    @PutMapping("/{id}")
    public UserDTO update(@PathVariable Long id,
                          @Valid @RequestBody UpdateUserRequest req) {
        return userService.update(id, req);
    }

    // DELETE /api/v1/users/123
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}

// ─── 拦截器 (Interceptor) ───
@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req,
            HttpServletResponse resp, Object handler) {
        String token = req.getHeader("Authorization");
        if (token == null || !isValid(token)) {
            resp.setStatus(401);
            return false; // 中断请求
        }
        req.setAttribute("userId", extractUserId(token));
        return true;
    }
}

// 注册拦截器
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuthInterceptor())
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/auth/**");
    }
}

// ─── Filter vs Interceptor ───
// Filter:      Servlet 规范, 在 DispatcherServlet 之前
// Interceptor: Spring 规范, 在 DispatcherServlet 之后
// 用 Filter:   跨域CORS, 编码, 压缩, 日志
// 用 Interceptor: 鉴权, 限流, 审计 (可访问 Spring Bean)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 REST API 设计</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> RestDesign.txt</div>
                <pre className="fs-code">{`═══ RESTful API 设计规范 ═══

  URL 设计:
    ✅ /api/v1/users            (复数名词)
    ✅ /api/v1/users/123/orders  (层级关系)
    ❌ /api/v1/getUser          (不要用动词!)
    ❌ /api/v1/user_list        (不要下划线)

  HTTP 方法语义:
    GET    → 读取 (幂等, 安全, 可缓存)
    POST   → 创建 (非幂等!)
    PUT    → 全量更新 (幂等)
    PATCH  → 部分更新 (幂等)
    DELETE → 删除 (幂等)

  状态码:
    200 OK              → 成功
    201 Created         → 创建成功 (POST 后)
    204 No Content      → 删除成功
    400 Bad Request     → 参数错误
    401 Unauthorized    → 未认证
    403 Forbidden       → 无权限
    404 Not Found       → 资源不存在
    409 Conflict        → 资源冲突
    422 Unprocessable   → 业务校验失败
    429 Too Many Req    → 限流
    500 Internal Error  → 服务器错误

═══ 统一响应格式 ═══

  // 成功响应
  {
    "code": 0,
    "message": "success",
    "data": { "id": 123, "name": "Alice" },
    "timestamp": "2024-01-01T00:00:00Z"
  }

  // 错误响应
  {
    "code": 40001,
    "message": "Validation failed",
    "errors": [
      { "field": "email", "message": "invalid format" }
    ],
    "traceId": "abc-123-def"
  }

═══ 分页设计 ═══

  请求: GET /api/v1/users?page=0&size=20
  
  响应 (Spring Page):
  {
    "content": [ ... ],
    "totalElements": 150,
    "totalPages": 8,
    "size": 20,
    "number": 0,
    "first": true,
    "last": false
  }

  Cursor 分页 (大数据量):
  GET /api/v1/events?cursor=eyJpZCI6MTAwfQ&limit=20
  → 基于排序字段 (而非 OFFSET) → 性能稳定!

═══ 版本策略 ═══

  URL: /api/v1/users  → /api/v2/users  (推荐)
  Header: Accept: application/vnd.api.v1+json
  Param: /api/users?version=1

═══ HATEOAS ═══

  {
    "id": 123,
    "name": "Alice",
    "_links": {
      "self":   { "href": "/api/v1/users/123" },
      "orders": { "href": "/api/v1/users/123/orders" },
      "delete": { "href": "/api/v1/users/123", "method": "DELETE" }
    }
  }
  → 客户端通过链接发现操作 (不硬编码 URL)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ WebFlux 响应式编程</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> WebFlux.java</div>
                <pre className="fs-code">{`// ═══ 为什么需要 WebFlux? ═══
//
// Spring MVC (Servlet): 一个请求一个线程 (阻塞模型)
//   → 200 线程 → 最多 200 并发
//   → 线程在等待 DB/API 响应时被浪费!
//
// WebFlux (Netty): 事件循环 (非阻塞)
//   → 少量线程处理大量并发
//   → I/O 等待时不占用线程
//   → 适合: 高并发 + I/O 密集 (网关, BFF)

// ─── Reactor 核心: Mono 和 Flux ───
// Mono<T>: 0 或 1 个元素 (类似 CompletableFuture)
// Flux<T>: 0 到 N 个元素 (类似 Stream, 但异步)

// WebFlux Controller
@RestController
@RequestMapping("/api/v1/users")
public class UserReactiveController {

    private final UserReactiveService userService;

    // 返回 Mono → 单个用户
    @GetMapping("/{id}")
    public Mono<UserDTO> getById(@PathVariable Long id) {
        return userService.findById(id);
    }

    // 返回 Flux → 用户列表 (流式!)
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<UserDTO> streamUsers() {
        return userService.findAll()
            .delayElements(Duration.ofMillis(100)); // SSE 流式推送
    }
}

// ─── 响应式 Service ───
@Service
public class UserReactiveService {
    private final WebClient webClient;

    // 并发调用两个外部 API → 合并结果
    public Mono<UserProfile> getProfile(Long userId) {
        Mono<User> user = webClient.get()
            .uri("/users/{id}", userId)
            .retrieve()
            .bodyToMono(User.class);

        Mono<List<Order>> orders = webClient.get()
            .uri("/users/{id}/orders", userId)
            .retrieve()
            .bodyToFlux(Order.class)
            .collectList();

        // zip: 并发执行, 两个都完成后合并
        return Mono.zip(user, orders, UserProfile::new);
    }
}

// ─── WebClient (替代 RestTemplate) ───
@Bean
public WebClient webClient(WebClient.Builder builder) {
    return builder
        .baseUrl("https://api.example.com")
        .defaultHeader("Content-Type", "application/json")
        .filter(ExchangeFilterFunctions.basicAuthentication("u", "p"))
        .build();
}

// 链式调用
webClient.post()
    .uri("/api/orders")
    .bodyValue(new CreateOrderRequest(...))
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError,
        resp -> Mono.error(new ClientException(...)))
    .bodyToMono(OrderDTO.class)
    .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
    .timeout(Duration.ofSeconds(5));

// ─── MVC vs WebFlux 选型 ───
//
//         │ Spring MVC     │ WebFlux
// ────────┼────────────────┼──────────────
// 线程    │ 阻塞, 多线程   │ 非阻塞, 少线程
// 适合    │ CRUD, 事务密集 │ 高并发, I/O 密集
// 数据库  │ JDBC, JPA      │ R2DBC (响应式)
// 模板    │ Thymeleaf      │ 有限支持
// 调试    │ 简单 (同步栈)  │ 困难 (异步栈)
// 生态    │ 最成熟         │ 在完善
// 选择    │ 大多数场景     │ 网关/BFF/SSE`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ 异常处理与参数校验</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> Validation.java</div>
                <pre className="fs-code">{`// ═══ 全局异常处理 ═══
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // 参数校验失败 (RequestBody)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException e) {
        var errors = e.getBindingResult().getFieldErrors().stream()
            .map(f -> new FieldError(f.getField(), f.getDefaultMessage()))
            .toList();
        return ErrorResponse.of(40001, "Validation failed", errors);
    }

    // 业务异常
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        log.warn("Business error: {}", e.getMessage());
        return ResponseEntity.status(e.getHttpStatus())
            .body(ErrorResponse.of(e.getCode(), e.getMessage()));
    }

    // 资源不存在
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException e) {
        return ErrorResponse.of(40401, e.getMessage());
    }

    // 兜底: 未知异常
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleUnknown(Exception e) {
        log.error("Unexpected error", e);
        return ErrorResponse.of(50000, "Internal server error");
    }
}

// ─── 自定义业务异常 ───
@Getter
public class BusinessException extends RuntimeException {
    private final int code;
    private final HttpStatus httpStatus;
    
    public static BusinessException notFound(String msg) {
        return new BusinessException(40401, msg, HttpStatus.NOT_FOUND);
    }
    public static BusinessException conflict(String msg) {
        return new BusinessException(40901, msg, HttpStatus.CONFLICT);
    }
}

// ═══ Bean Validation ═══
public record CreateUserRequest(
    @NotBlank(message = "name is required")
    @Size(min = 2, max = 50)
    String name,
    
    @NotBlank @Email
    String email,
    
    @NotNull @Min(0) @Max(150)
    Integer age,
    
    @Pattern(regexp = "^1[3-9]\\\\d{9}$", message = "invalid phone")
    String phone,
    
    @Valid  // 嵌套校验!
    @NotNull
    AddressRequest address
) {}

// ─── 自定义校验注解 ───
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {
    String message() default "email already exists";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class UniqueEmailValidator
        implements ConstraintValidator<UniqueEmail, String> {
    @Autowired
    private UserRepository userRepo;
    
    @Override
    public boolean isValid(String email, ConstraintValidatorContext ctx) {
        return email != null && !userRepo.existsByEmail(email);
    }
}

// ─── 分组校验 ───
public interface OnCreate {}
public interface OnUpdate {}

public record UserRequest(
    @Null(groups = OnCreate.class)    // 创建时不能有 ID
    @NotNull(groups = OnUpdate.class) // 更新时必须有 ID
    Long id,
    
    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    String name
) {}

// Controller 中:
@PostMapping
public UserDTO create(
    @Validated(OnCreate.class) @RequestBody UserRequest req) { }

@PutMapping("/{id}")
public UserDTO update(
    @Validated(OnUpdate.class) @RequestBody UserRequest req) { }`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
