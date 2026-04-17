import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Record & Sealed', 'Pattern Matching', 'Virtual Thread', 'API 改进'];

export default function LessonJavaModern() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☕ module_01 — Java 17+ 新特性</div>
      <div className="fs-hero">
        <h1>Java 17+ 新特性：Record / Sealed / Pattern / Virtual Thread</h1>
        <p>
          Java 从 17 到 21 经历了语言层面的重大革新——
          <strong>Record</strong> 消除 POJO 样板代码，<strong>Sealed Class</strong> 实现代数数据类型，
          <strong>Pattern Matching</strong> 带来现代化的类型分解，
          <strong>Virtual Thread</strong> (Loom) 将并发编程从回调地狱中解放出来。
          这些特性让 Java 焕发新生，在现代后端开发中保持强大竞争力。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☕ Java 新特性深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 Record 与 Sealed Class</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b91c1c'}}></span> RecordDemo.java</div>
                <pre className="fs-code">{`// ═══ Record (Java 16+) — 不可变数据载体 ═══
// 传统 POJO 需要: 字段 + 构造器 + getter + equals + hashCode + toString
// Record 一行搞定:

public record Point(double x, double y) {}

// 编译器自动生成:
//   - private final 字段
//   - 全参构造器
//   - x(), y() 访问器 (不是 getX()!)
//   - equals(), hashCode(), toString()

// ─── 紧凑构造器 (Compact Constructor) ───
public record User(String name, String email, int age) {
    // 紧凑构造器: 没有参数列表, 用于验证
    public User {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("name required");
        if (age < 0 || age > 150)
            throw new IllegalArgumentException("invalid age: " + age);
        // 不需要 this.name = name; (自动赋值!)
        email = email.toLowerCase().trim(); // 可以修改参数
    }
}

// ─── Record 可以有自定义方法 ───
public record Money(BigDecimal amount, Currency currency) {
    public Money add(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalArgumentException("currency mismatch");
        return new Money(amount.add(other.amount), currency);
    }
    
    // 静态工厂方法
    public static Money of(double amount, String currencyCode) {
        return new Money(
            BigDecimal.valueOf(amount),
            Currency.getInstance(currencyCode)
        );
    }
}
// 使用: Money price = Money.of(99.99, "USD");

// ─── Record 的限制 ───
// 1. 不能继承类 (隐式 extends Record)
// 2. 字段 final (不可变!)
// 3. 不能声明实例字段 (只有 record 组件)
// 4. 可以实现接口!

public record Event(String type, Instant timestamp)
    implements Comparable<Event> {
    @Override
    public int compareTo(Event o) {
        return timestamp.compareTo(o.timestamp);
    }
}

// ═══ Sealed Class (Java 17) — 受限继承 ═══
// 精确控制谁可以继承/实现

public sealed interface Shape
    permits Circle, Rectangle, Triangle {
    double area();
}

public record Circle(double radius) implements Shape {
    public double area() { return Math.PI * radius * radius; }
}
public record Rectangle(double w, double h) implements Shape {
    public double area() { return w * h; }
}
public final class Triangle implements Shape {
    private final double base, height;
    // ... constructor, area()
    public double area() { return 0.5 * base * height; }
}

// Sealed 的价值:
// 1. 编译器知道所有子类 → 穷举检查!
// 2. Pattern Matching switch 可以省略 default
// 3. 代数数据类型 = sealed + record = 函数式!

// permits 规则:
// - 子类必须在同一模块 (或同一文件)
// - 子类必须是 final, sealed, 或 non-sealed`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 Pattern Matching</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> PatternMatching.java</div>
                <pre className="fs-code">{`// ═══ instanceof Pattern (Java 16) ═══

// 传统写法:
if (obj instanceof String) {
    String s = (String) obj;  // 多余的强转!
    System.out.println(s.length());
}

// 新写法:
if (obj instanceof String s) {
    System.out.println(s.length());  // s 直接可用!
}

// 甚至可以:
if (obj instanceof String s && s.length() > 5) {
    // s 的作用域在 && 右侧和 if 体内
}

// ═══ Switch Pattern Matching (Java 21) ═══

// 传统 switch: 只能匹配常量
// 新 switch: 可以匹配类型、解构、守卫条件!

static String describe(Object obj) {
    return switch (obj) {
        case Integer i when i < 0  -> "negative: " + i;
        case Integer i             -> "positive: " + i;
        case String s when s.isBlank() -> "blank string";
        case String s              -> "string: " + s;
        case int[] arr             -> "array[" + arr.length + "]";
        case null                  -> "null!";
        default                    -> "unknown: " + obj;
    };
}

// ═══ Record Pattern (Java 21) — 解构匹配 ═══
// 结合 sealed + record + pattern = 极度强大

sealed interface Expr permits Num, Add, Mul {}
record Num(int value) implements Expr {}
record Add(Expr left, Expr right) implements Expr {}
record Mul(Expr left, Expr right) implements Expr {}

// 递归求值 — 嵌套解构!
static int eval(Expr expr) {
    return switch (expr) {
        case Num(var v)          -> v;
        case Add(var l, var r)   -> eval(l) + eval(r);
        case Mul(var l, var r)   -> eval(l) * eval(r);
        // 不需要 default! sealed 保证穷举!
    };
}

// 使用:
var expr = new Add(new Num(1), new Mul(new Num(2), new Num(3)));
eval(expr); // → 1 + (2 * 3) = 7

// ═══ 嵌套 Record Pattern ═══

record Address(String city, String street) {}
record Person(String name, Address address) {}

static String getCity(Object obj) {
    return switch (obj) {
        case Person(var name, Address(var city, _))
            -> name + " lives in " + city;
        default -> "unknown";
    };
}
// _ 是未命名变量 (Java 22) — 忽略不关心的部分

// ═══ switch 表达式增强 ═══

// 箭头语法 (无 fall-through)
int numDays = switch (month) {
    case JAN, MAR, MAY, JUL, AUG, OCT, DEC -> 31;
    case APR, JUN, SEP, NOV -> 30;
    case FEB -> isLeapYear ? 29 : 28;
};

// yield: 在 block 中返回值
String result = switch (code) {
    case 200 -> "OK";
    case 404 -> "Not Found";
    default -> {
        log.warn("unexpected code: {}", code);
        yield "Error: " + code;
    }
};`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧵 Virtual Thread (Project Loom)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> VirtualThread.java</div>
                <pre className="fs-code">{`// ═══ Virtual Thread (Java 21) ═══
// 轻量级线程: 百万级并发, 无需回调/异步

// ─── 为什么需要 Virtual Thread? ───
// 传统 Platform Thread:
//   → 1:1 映射到 OS 线程
//   → 每个线程 ~1MB 栈
//   → 1000 线程 ≈ 1GB 内存
//   → I/O 阻塞时浪费 OS 线程!

// Virtual Thread:
//   → M:N 映射 (多个 VT 在少量 Carrier Thread 上)
//   → 每个 VT ~几 KB 栈 (按需增长)
//   → 100 万 VT ≈ 几 GB 内存
//   → I/O 阻塞时自动 unmount, 让出 Carrier Thread!

// ─── 创建 Virtual Thread ───

// 方式 1: Thread.ofVirtual()
Thread vt = Thread.ofVirtual().name("vt-1").start(() -> {
    System.out.println("Hello from " + Thread.currentThread());
});

// 方式 2: Executors (推荐!)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    // 每个任务一个 Virtual Thread — 不需要线程池!
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> {
            // 模拟 I/O 操作
            var result = httpClient.send(request, bodyHandler);
            processResult(result);
        });
    }
} // try-with-resources 自动关闭, 等待所有任务完成

// ─── Spring Boot 集成 (3.2+) ───
// application.yml:
//   spring.threads.virtual.enabled: true
// 一行配置, 所有请求处理切换到 Virtual Thread!

// ─── 性能对比 ───
// 场景: 10000 并发请求, 每个请求调用外部 API (100ms)
//
// Platform Thread Pool (200 线程):
//   → 200 并发 → 50 批 → 5000ms 总耗时
//
// Virtual Thread (10000 个):
//   → 10000 并发 → 1 批 → 100ms 总耗时!

// ─── 注意事项 ───
// 1. Pinning: synchronized 块内 I/O 会 pin 住 Carrier Thread
//    → 解决: 用 ReentrantLock 替代 synchronized
synchronized (lock) {
    socket.read(); // BAD: pin Carrier Thread!
}
lock.lock();
try {
    socket.read(); // GOOD: 不 pin!
} finally {
    lock.unlock();
}

// 2. 不要池化 Virtual Thread!
//    → ThreadPool 是给昂贵的 Platform Thread 设计的
//    → VT 极其便宜, 用完丢弃!

// 3. ThreadLocal 谨慎使用:
//    → 100 万 VT 各一份 ThreadLocal → 内存爆炸
//    → 使用 ScopedValue (Java 21 Preview) 替代

// ═══ Structured Concurrency (Preview) ═══
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    var user  = scope.fork(() -> fetchUser(id));
    var order = scope.fork(() -> fetchOrder(id));
    
    scope.join();           // 等待所有子任务
    scope.throwIfFailed();  // 如果有失败 → 抛出
    
    return new UserOrder(user.get(), order.get());
}
// 任何子任务失败 → 自动取消其他子任务!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 API 与工具改进</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> APIImprovements.java</div>
                <pre className="fs-code">{`// ═══ Text Block (Java 15) ═══
String json = """
        {
            "name": "Alice",
            "age": 30,
            "roles": ["admin", "user"]
        }
        """;
// → 自动去除公共前导空白
// → 末尾 """ 的位置决定缩进基准

String sql = """
        SELECT u.name, u.email
        FROM users u
        JOIN orders o ON u.id = o.user_id
        WHERE o.total > %d
        """.formatted(100);  // 格式化

// ═══ 增强的 NullPointerException (Java 17) ═══
// 旧: NullPointerException (哪个是 null??)
//   employee.getAddress().getCity().toUpperCase()
// 新: Cannot invoke "String.toUpperCase()" because
//     the return value of "Address.getCity()" is null
// → 精确告诉你哪个调用返回了 null!

// ═══ Stream API 增强 ═══

// Stream.toList() (Java 16) — 简化收集
var names = users.stream()
    .map(User::name)
    .toList();  // 不需要 Collectors.toList()!
// 注意: 返回不可变 List!

// Stream.mapMulti() (Java 16) — 替代 flatMap
users.stream()
    .<String>mapMulti((user, consumer) -> {
        if (user.age() > 18) {
            consumer.accept(user.name());
            consumer.accept(user.email());
        }
    })
    .toList();

// Gatherers (Java 22 Preview) — 自定义中间操作
stream.gather(Gatherers.windowSliding(3))  // 滑动窗口

// ═══ String 增强 ═══
"  hello  ".strip();        // "hello" (Unicode 感知)
"  hello  ".stripLeading(); // "hello  "
"hello".repeat(3);          // "hellohellohello"
"hello\\nworld".lines();     // Stream<String>
" ".isBlank();               // true
"hello".indent(4);          // "    hello\\n"

// ═══ Collection 工厂方法 ═══
var list = List.of("a", "b", "c");         // 不可变
var set  = Set.of(1, 2, 3);               // 不可变
var map  = Map.of("k1", "v1", "k2", "v2"); // 不可变
var copy = List.copyOf(mutableList);        // 不可变副本

// ═══ HttpClient (Java 11) ═══
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))
    .followRedirects(HttpClient.Redirect.NORMAL)
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .build();

// 同步
HttpResponse<String> resp = client.send(request,
    HttpResponse.BodyHandlers.ofString());

// 异步
CompletableFuture<HttpResponse<String>> future =
    client.sendAsync(request, HttpResponse.BodyHandlers.ofString());

// ═══ 其他重要特性 ═══
// Java 17: 随机数生成器 API 改进
var rng = RandomGenerator.of("L128X256MixRandom");

// Java 21: Sequenced Collections
SequencedCollection<String> seq = new LinkedHashSet<>();
seq.addFirst("first");
seq.addLast("last");
seq.reversed();  // 反转视图`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
