import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Docker / K8s 部署', 'JVM 调优', '性能监控', '生产最佳实践'];

export default function LessonSpringDeploy() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☕ module_08 — 部署与调优</div>
      <div className="fs-hero">
        <h1>部署与调优：Docker / K8s / JVM 调优 / 监控</h1>
        <p>
          从开发到生产的"最后一公里"——
          <strong>Docker 多阶段构建</strong>打包精简镜像，<strong>K8s</strong> 编排容器实现弹性伸缩，
          <strong>JVM 调优</strong>解决 GC 停顿和内存瓶颈，
          <strong>Micrometer + Prometheus</strong> 构建完整的可观测体系。
          这些是 Java 应用生产运维的核心技能。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☕ 部署与调优深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐳 Docker / K8s 部署</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b91c1c'}}></span> Dockerfile</div>
                <pre className="fs-code">{`# ═══ 多阶段构建 (Optimized Dockerfile) ═══

# Stage 1: 构建
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
# 先下载依赖 (Docker 缓存层!)
RUN ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw package -DskipTests -B
# 分层解包 (Spring Boot Layered JAR)
RUN java -Djarmode=layertools -jar target/*.jar extract

# Stage 2: 运行 (精简镜像)
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app  # 非 root!
WORKDIR /app

# 按变更频率分层 (利用 Docker 缓存)
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \\
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \\
    "-XX:+UseG1GC", \\
    "-XX:MaxRAMPercentage=75.0", \\
    "-Djava.security.egd=file:/dev/urandom", \\
    "org.springframework.boot.loader.launch.JarLauncher"]

# 最终镜像大小: ~200MB (vs 完整 JDK 镜像 ~500MB)

# ═══ K8s Deployment ═══
# deployment.yml:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxSurge: 1         # 滚动更新: 最多多 1 个 Pod
      maxUnavailable: 0   # 不允许不可用 (零停机!)
  template:
    spec:
      containers:
      - name: app
        image: registry.example.com/order-service:v1.2.3
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 500m       # 0.5 核
            memory: 512Mi
          limits:
            cpu: 2000m      # 2 核
            memory: 1Gi     # JVM 堆 = 75% ≈ 768MB
        
        # 就绪探针 (流量切入)
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 20   # Spring 启动时间
          periodSeconds: 5
        
        # 存活探针 (重启)
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
          failureThreshold: 3

        # 优雅关闭
        lifecycle:
          preStop:
            exec:
              command: ["sh", "-c", "sleep 5"]  # 等 LB 摘流量
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: prod
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password

# ═══ 优雅关闭 (Graceful Shutdown) ═══
# application.yml:
server:
  shutdown: graceful    # 等待进行中的请求完成
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s  # 最多等 30 秒`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ JVM 调优</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> JvmTuning.txt</div>
                <pre className="fs-code">{`═══ JVM 内存模型 ═══

  ┌──────────────────────────────────────┐
  │            JVM Memory                │
  ├──────────────┬───────────────────────┤
  │   Heap       │  堆 (对象实例)         │
  │   ├ Young    │  新生代 (Eden+S0+S1)  │
  │   │  ├ Eden  │  新对象分配           │
  │   │  └ S0/S1 │  存活对象             │
  │   └ Old      │  老年代 (长期存活)     │
  ├──────────────┼───────────────────────┤
  │  Metaspace   │  类元数据 (native)     │
  ├──────────────┼───────────────────────┤
  │  Stack       │  线程栈 (每线程独立)   │
  ├──────────────┼───────────────────────┤
  │  Direct Mem  │  NIO 直接内存          │
  └──────────────┴───────────────────────┘

═══ GC 选择 ═══

  G1GC (Java 17+ 默认):
    → 适合 4GB-16GB 堆
    → 目标: 可控的停顿时间 (默认 200ms)
    → 参数:
      -XX:+UseG1GC
      -XX:MaxGCPauseMillis=100    # 目标停顿 100ms
      -XX:G1HeapRegionSize=16m    # Region 大小
      -XX:InitiatingHeapOccupancyPercent=45

  ZGC (Java 21 稳定):
    → 适合大堆 (TB 级)
    → 停顿 < 1ms! (亚毫秒级)
    → 参数:
      -XX:+UseZGC
      -XX:+ZGenerational            # 分代 ZGC (Java 21)
      -XX:SoftMaxHeapSize=1g        # 软上限

  选择:
    堆 < 4GB:   G1GC
    堆 4-16GB:  G1GC 或 ZGC  
    堆 > 16GB:  ZGC
    低延迟要求:  ZGC (P99 < 1ms)

═══ 容器环境调优 ═══

  # 容器内存感知 (Java 10+)
  -XX:+UseContainerSupport          # 自动识别 cgroup 限制
  -XX:MaxRAMPercentage=75.0         # 堆 = 容器内存的 75%
  # 剩 25% 给: Metaspace + Stack + Direct + Buffer

  # 危险! 不要用固定值:
  # -Xmx512m  ← 容器 limit 变了怎么办?
  # 用 MaxRAMPercentage 自动适配!

  # 快速启动 (CDS: Class Data Sharing)
  # 1. 训练运行生成 archive:
  java -XX:ArchiveClassesAtExit=app.jsa -jar app.jar
  # 2. 生产使用 archive:
  java -XX:SharedArchiveFile=app.jsa -jar app.jar
  # 启动速度提升 ~30%!

═══ 线上诊断 ═══

  # 堆转储 (OOM 分析)
  -XX:+HeapDumpOnOutOfMemoryError
  -XX:HeapDumpPath=/tmp/heapdump.hprof

  # Arthas (阿里诊断工具, 生产神器)
  java -jar arthas-boot.jar
  > dashboard               # 实时面板
  > thread -n 3             # 最忙的3个线程
  > trace com.example.* *   # 方法调用链 + 耗时
  > watch com.example.UserService findById returnObj
  > jad com.example.UserService  # 反编译

  # jcmd (JDK 内置)
  jcmd <pid> GC.heap_info     # 堆信息
  jcmd <pid> Thread.print     # 线程 dump
  jcmd <pid> VM.native_memory # 原生内存`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 性能监控</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> Monitoring.java</div>
                <pre className="fs-code">{`// ═══ Spring Boot Actuator ═══
// 内置生产级运维端点

// application.yml:
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus, env
  endpoint:
    health:
      show-details: when_authorized  # 只对认证用户展示详情
      probes:
        enabled: true     # K8s liveness/readiness
  health:
    db:
      enabled: true
    redis:
      enabled: true
    diskSpace:
      enabled: true

// 常用端点:
// /actuator/health      → 健康检查
// /actuator/metrics     → 指标列表
// /actuator/prometheus  → Prometheus 格式指标
// /actuator/env         → 环境变量
// /actuator/info        → 应用信息
// /actuator/loggers     → 动态调整日志级别!

// ═══ Micrometer + Prometheus + Grafana ═══

// 自定义 Metrics
@Component
public class OrderMetrics {
    private final Counter orderCreated;
    private final Timer orderProcessTime;
    private final AtomicInteger activeOrders;

    public OrderMetrics(MeterRegistry registry) {
        orderCreated = Counter.builder("orders.created")
            .description("Total orders created")
            .tag("type", "standard")
            .register(registry);
        
        orderProcessTime = Timer.builder("orders.process.time")
            .description("Order processing duration")
            .publishPercentiles(0.5, 0.9, 0.95, 0.99) // 分位数
            .sla(Duration.ofMillis(100), Duration.ofMillis(500))
            .register(registry);
        
        activeOrders = registry.gauge("orders.active",
            new AtomicInteger(0));
    }

    public void recordOrderCreated() {
        orderCreated.increment();
    }
    
    public Timer.Sample startTimer() {
        return Timer.start();
    }
    
    public void stopTimer(Timer.Sample sample) {
        sample.stop(orderProcessTime);
    }
}

// ─── 使用 @Timed 自动计时 ───
@Service
public class OrderService {
    @Timed(value = "order.create", percentiles = {0.95, 0.99})
    public OrderDTO createOrder(CreateOrderRequest req) { ... }
}

// 需要注册 TimedAspect Bean:
@Bean
public TimedAspect timedAspect(MeterRegistry registry) {
    return new TimedAspect(registry);
}

// ═══ Prometheus 抓取配置 ═══
// prometheus.yml:
scrape_configs:
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['order-service:8080']
        labels:
          app: order-service

// K8s ServiceMonitor:
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
spec:
  selector:
    matchLabels:
      app: order-service
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 15s

// ═══ Grafana Dashboard 关键指标 ═══
// 
// RED 方法:
// Rate:     rate(http_server_requests_seconds_count[5m])
// Error:    rate(http_server_requests_seconds_count{status=~"5.."}[5m])
// Duration: http_server_requests_seconds{quantile="0.99"}
//
// JVM:
// jvm_memory_used_bytes
// jvm_gc_pause_seconds_max
// jvm_threads_live_threads
// process_cpu_usage
//
// HikariCP:
// hikaricp_connections_active
// hikaricp_connections_pending`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏭 生产最佳实践</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> BestPractices.txt</div>
                <pre className="fs-code">{`═══ 连接池优化 ═══

# HikariCP (Spring Boot 默认)
spring:
  datasource:
    hikari:
      maximum-pool-size: 20        # CPU 核数 * 2 + 磁盘数
      minimum-idle: 5
      connection-timeout: 30000    # 获取连接超时
      idle-timeout: 600000         # 空闲连接存活时间
      max-lifetime: 1800000        # 连接最大存活时间 (30min)
      leak-detection-threshold: 60000  # 连接泄漏检测!
  
  # 最佳 pool size 公式 (HikariCP 官方):
  # connections = ((core_count * 2) + effective_spindle_count)
  # 例: 4 核 + 1 SSD → (4*2) + 1 = 9
  # 不要过大! 过多连接 → DB 上下文切换开销

═══ 日志最佳实践 ═══

# logback-spring.xml
<configuration>
  <!-- 异步日志 (避免阻塞业务线程!) -->
  <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>512</queueSize>
    <discardingThreshold>0</discardingThreshold>  # 不丢弃
    <appender-ref ref="FILE"/>
  </appender>
  
  <!-- JSON 格式 (ELK 友好) -->
  <appender name="JSON" class="...ConsoleAppender">
    <encoder class="...LogstashEncoder">
      <includeMdcKeyName>traceId</includeMdcKeyName>
      <includeMdcKeyName>userId</includeMdcKeyName>
    </encoder>
  </appender>
  
  <!-- 按环境区分 -->
  <springProfile name="dev">
    <root level="DEBUG"><appender-ref ref="CONSOLE"/></root>
  </springProfile>
  <springProfile name="prod">
    <root level="INFO"><appender-ref ref="ASYNC_FILE"/></root>
  </springProfile>
</configuration>

═══ Spring Boot 生产检查清单 ═══

□ 安全
  ✅ Actuator 端点鉴权 (不暴露 /env, /shutdown)
  ✅ 敏感配置加密 (Jasypt / Vault)
  ✅ HTTPS 强制
  ✅ 依赖漏洞扫描 (OWASP dependency-check)

□ 性能
  ✅ 连接池大小合理 (不超过 20)
  ✅ N+1 查询检查 (Hibernate show-sql + p6spy)
  ✅ 缓存策略 (Redis TTL + 降级)
  ✅ 异步日志 (AsyncAppender)
  ✅ JVM: MaxRAMPercentage + G1/ZGC

□ 可靠性
  ✅ 优雅关闭 (server.shutdown=graceful)
  ✅ 健康检查 (readiness + liveness)
  ✅ 熔断降级 (Resilience4j)
  ✅ 重试 + 幂等
  ✅ 死信队列 (DLQ)

□ 可观测性
  ✅ 结构化日志 (JSON + traceId)
  ✅ Prometheus 指标 (/actuator/prometheus)
  ✅ 链路追踪 (Micrometer + Jaeger)
  ✅ 告警规则 (P99 延迟 / 错误率 / CPU)

□ 部署
  ✅ 多阶段 Docker 构建 (分层 JAR)
  ✅ 非 root 用户运行
  ✅ K8s: resource limits + HPA
  ✅ 滚动更新 (maxUnavailable=0)
  ✅ 配置外部化 (环境变量 / ConfigMap)

═══ 启动优化 ═══

Spring Boot 启动慢? 检查:
  1. 组件扫描范围过大
     → @ComponentScan 限制 basePackages
  2. 自动配置太多
     → spring.autoconfigure.exclude 排除不需要的
  3. 延迟初始化
     → spring.main.lazy-initialization=true
     → 首次请求才创建 Bean (开发用, 生产慎用)
  4. GraalVM Native Image
     → 启动 < 100ms, 内存 < 100MB
     → 但编译慢, 部分反射/动态代理不支持`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
