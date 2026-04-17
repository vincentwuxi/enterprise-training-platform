import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['JPA / Hibernate', 'MyBatis', 'Redis 缓存', '事务管理'];

export default function LessonSpringData() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☕ module_04 — 数据持久化</div>
      <div className="fs-hero">
        <h1>数据持久化：JPA / MyBatis / Redis / 事务管理</h1>
        <p>
          Spring Data 提供统一的数据访问抽象——
          <strong>JPA/Hibernate</strong> 以对象关系映射 (ORM) 简化 CRUD，
          <strong>MyBatis</strong> 以 SQL 映射提供精细控制，
          <strong>Redis</strong> 作为高性能缓存层加速读取。
          <strong>事务管理</strong>则是保障数据一致性的核心机制。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☕ 数据持久化深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗄️ JPA / Hibernate</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b91c1c'}}></span> JpaEntity.java</div>
                <pre className="fs-code">{`// ═══ 实体映射 ═══
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_status_created", columnList = "status,created_at")
})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.LAZY) // 延迟加载!
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL,
               orphanRemoval = true) // 级联 + 孤儿删除
    private List<OrderItem> items = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // 双向关联的维护方法
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}

// ═══ Spring Data JPA Repository ═══
public interface OrderRepository extends JpaRepository<Order, Long>,
        JpaSpecificationExecutor<Order> {

    // 方法名查询 (自动生成 SQL)
    List<Order> findByStatusAndCreatedAtAfter(
        OrderStatus status, LocalDateTime after);

    // JPQL
    @Query("SELECT o FROM Order o JOIN FETCH o.items " +
           "WHERE o.user.id = :userId AND o.status = :status")
    List<Order> findWithItems(@Param("userId") Long userId,
                              @Param("status") OrderStatus status);

    // 原生 SQL
    @Query(value = "SELECT DATE(created_at) as date, " +
           "COUNT(*) as cnt, SUM(total_amount) as total " +
           "FROM orders WHERE created_at > :since " +
           "GROUP BY DATE(created_at)", nativeQuery = true)
    List<DailySummary> dailySummary(@Param("since") LocalDateTime since);

    // 更新操作
    @Modifying
    @Query("UPDATE Order o SET o.status = :status WHERE o.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") OrderStatus s);
}

// ═══ N+1 问题 ═══
// 问题: 查 10 个 Order → 每个 Order 延迟加载 User → 11 条 SQL!
//
// 解决 1: JOIN FETCH (JPQL)
// @Query("SELECT o FROM Order o JOIN FETCH o.user")
//
// 解决 2: @EntityGraph
// @EntityGraph(attributePaths = {"user", "items"})
// List<Order> findAll();
//
// 解决 3: @BatchSize (Hibernate)
// @BatchSize(size = 20)  // 批量加载 20 个关联
//
// 建议: 始终用 FetchType.LAZY + 显式 FETCH/EntityGraph

// ═══ Specification (动态查询) ═══
public class OrderSpec {
    public static Specification<Order> hasStatus(OrderStatus s) {
        return (root, q, cb) -> cb.equal(root.get("status"), s);
    }
    public static Specification<Order> amountGreaterThan(BigDecimal a) {
        return (root, q, cb) -> cb.greaterThan(root.get("totalAmount"), a);
    }
}
// 组合:
orderRepo.findAll(hasStatus(PAID).and(amountGreaterThan(100)));`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📝 MyBatis</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> MyBatisMapper.java</div>
                <pre className="fs-code">{`// ═══ MyBatis vs JPA ═══
// JPA:     ORM, 对象驱动, 自动生成 SQL
// MyBatis: SQL Mapper, SQL 驱动, 手写 SQL
//
// 选 JPA:   简单 CRUD, 快速开发, DDD
// 选 MyBatis: 复杂 SQL, 精细优化, 已有 DB Schema

// ─── Mapper 接口 + 注解 ───
@Mapper
public interface UserMapper {

    @Select("SELECT * FROM users WHERE id = #{id}")
    @Results({
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "updatedAt", column = "updated_at")
    })
    User findById(Long id);

    @Insert("INSERT INTO users(name, email, age) " +
            "VALUES(#{name}, #{email}, #{age})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);
}

// ─── XML Mapper (复杂查询推荐) ───
// UserMapper.xml:
// <mapper namespace="com.example.mapper.UserMapper">
//
//   <resultMap id="userMap" type="User">
//     <id property="id" column="id"/>
//     <result property="name" column="name"/>
//     <collection property="orders" ofType="Order"
//                 select="findOrdersByUserId" column="id"/>
//   </resultMap>
//
//   <!-- 动态 SQL -->
//   <select id="search" resultMap="userMap">
//     SELECT * FROM users
//     <where>
//       <if test="name != null and name != ''">
//         AND name LIKE CONCAT('%', #{name}, '%')
//       </if>
//       <if test="minAge != null">
//         AND age >= #{minAge}
//       </if>
//       <if test="status != null">
//         AND status IN
//         <foreach item="s" collection="status"
//                  open="(" separator="," close=")">
//           #{s}
//         </foreach>
//       </if>
//     </where>
//     ORDER BY
//     <choose>
//       <when test="sortBy == 'name'">name</when>
//       <when test="sortBy == 'age'">age</when>
//       <otherwise>created_at DESC</otherwise>
//     </choose>
//     LIMIT #{offset}, #{limit}
//   </select>
//
// </mapper>

// ═══ MyBatis-Plus (增强) ═══
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 继承 CRUD: selectById, insert, updateById, deleteById
    // 无需写 SQL!
}

// Lambda 查询构建器
var users = userMapper.selectList(
    new LambdaQueryWrapper<User>()
        .like(User::getName, "Alice")
        .ge(User::getAge, 18)
        .orderByDesc(User::getCreatedAt)
        .last("LIMIT 10")
);

// 分页
IPage<User> page = userMapper.selectPage(
    new Page<>(1, 20),  // 第1页, 每页20
    new LambdaQueryWrapper<User>().eq(User::getStatus, "ACTIVE")
);

// ═══ JPA vs MyBatis 对比 ═══
//
//           │ JPA/Hibernate    │ MyBatis
// ──────────┼──────────────────┼──────────────
// 理念      │ ORM, 对象优先    │ SQL Mapper
// 学习曲线  │ 高 (LazyLoad陷阱)│ 中 (SQL 要手写)
// 简单 CRUD │ 极快             │ 需要 Mapper
// 复杂 SQL  │ 不适合           │ 强! (XML/注解)
// 缓存      │ 一级+二级+查询缓存│ 一级+二级
// 适合      │ DDD / 快速原型   │ 大型企业 / 复杂查询`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Redis 缓存</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> RedisCache.java</div>
                <pre className="fs-code">{`// ═══ Spring Cache 抽象 ═══
@Service
@CacheConfig(cacheNames = "users")
public class UserService {

    @Cacheable(key = "#id") // 缓存命中 → 不执行方法
    public UserDTO findById(Long id) {
        return userRepo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> notFound("User " + id));
    }

    @CachePut(key = "#result.id") // 更新缓存
    public UserDTO update(Long id, UpdateUserRequest req) {
        var user = userRepo.findById(id).orElseThrow();
        user.setName(req.name());
        return toDTO(userRepo.save(user));
    }

    @CacheEvict(key = "#id") // 删除缓存
    public void delete(Long id) {
        userRepo.deleteById(id);
    }

    @CacheEvict(allEntries = true) // 清空所有缓存
    @Scheduled(fixedRate = 3600000) // 每小时清理
    public void evictAll() {}
}

// ─── Redis 配置 ───
@Configuration
@EnableCaching
public class RedisConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory cf) {
        var config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeValuesWith(
                SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()))
            .disableCachingNullValues(); // 不缓存 null!

        return RedisCacheManager.builder(cf)
            .cacheDefaults(config)
            .withCacheConfiguration("users",
                config.entryTtl(Duration.ofMinutes(10)))
            .withCacheConfiguration("products",
                config.entryTtl(Duration.ofHours(1)))
            .build();
    }
}

// ═══ RedisTemplate (高级用法) ═══
@Component
public class RedisService {
    private final StringRedisTemplate redis;

    // 分布式锁
    public boolean tryLock(String key, Duration timeout) {
        return Boolean.TRUE.equals(
            redis.opsForValue().setIfAbsent(
                "lock:" + key, UUID.randomUUID().toString(),
                timeout));
    }

    // 限流 (滑动窗口)
    public boolean isAllowed(String key, int limit, Duration window) {
        String zkey = "ratelimit:" + key;
        long now = System.currentTimeMillis();
        
        redis.executePipelined((RedisCallback<Void>) conn -> {
            conn.zSetCommands().zRemRangeByScore(
                zkey.getBytes(), 0, now - window.toMillis());
            conn.zSetCommands().zAdd(
                zkey.getBytes(), now, String.valueOf(now).getBytes());
            conn.keyCommands().expire(
                zkey.getBytes(), window.getSeconds());
            return null;
        });
        
        Long count = redis.opsForZSet().zCard(zkey);
        return count != null && count <= limit;
    }

    // 排行榜
    public void addScore(String board, String member, double score) {
        redis.opsForZSet().incrementScore("rank:" + board, member, score);
    }
    public Set<ZSetOperations.TypedTuple<String>> topN(String board, int n) {
        return redis.opsForZSet().reverseRangeWithScores("rank:" + board, 0, n-1);
    }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔒 事务管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> Transaction.java</div>
                <pre className="fs-code">{`// ═══ @Transactional 深入 ═══

@Service
@Transactional(readOnly = true) // 类级别: 只读事务 (性能优化)
public class OrderService {

    @Transactional(
        propagation = Propagation.REQUIRED,  // 默认
        isolation = Isolation.READ_COMMITTED, // 隔离级别
        timeout = 30,                         // 超时 (秒)
        rollbackFor = Exception.class,        // 所有异常回滚
        noRollbackFor = BusinessWarningException.class
    )
    public OrderDTO createOrder(CreateOrderRequest req) {
        var order = new Order();
        order.setStatus(OrderStatus.PENDING);
        
        req.items().forEach(item -> {
            // 扣减库存 (乐观锁)
            int updated = productRepo.deductStock(
                item.productId(), item.quantity());
            if (updated == 0) {
                throw new InsufficientStockException(item.productId());
                // → 回滚整个事务!
            }
            order.addItem(toOrderItem(item));
        });
        
        return toDTO(orderRepo.save(order));
    }
}

// ═══ 事务传播行为 ═══
//
// REQUIRED (默认):
//   有事务 → 加入; 没有 → 新建
//   最常用!
//
// REQUIRES_NEW:
//   总是新建事务, 挂起当前事务
//   → 日志记录 (即使主事务回滚, 日志也要保存)
//
// NESTED:
//   有事务 → 嵌套事务 (Savepoint)
//   → 子事务回滚不影响父事务
//
// SUPPORTS:
//   有事务 → 加入; 没有 → 不用事务
//
// NOT_SUPPORTED:
//   不用事务, 挂起当前事务
//
// MANDATORY:
//   必须有事务, 否则抛异常
//
// NEVER:
//   不能有事务, 否则抛异常

// ─── 事务失效场景 (重要!) ───

// 1. 自调用 (最常见!)
@Service
public class BadService {
    @Transactional
    public void methodA() { ... } // ❌ 不生效!
    
    public void methodB() {
        this.methodA(); // 自调用绕过代理!
    }
}

// 2. 非 public 方法
@Transactional
private void internalMethod() {} // ❌ CGLIB 无法代理!

// 3. 异常被吞掉
@Transactional
public void process() {
    try {
        riskyOperation();
    } catch (Exception e) {
        log.error("failed", e); // ❌ 异常被 catch → 不回滚!
        // 解决: throw e; 或
        // TransactionAspectSupport.currentTransactionStatus()
        //     .setRollbackOnly();
    }
}

// 4. rollbackFor 不匹配
@Transactional  // 默认只回滚 RuntimeException!
public void process() throws IOException {
    throw new IOException("file error"); // ❌ 不回滚!
}
// 解决: @Transactional(rollbackFor = Exception.class)

// ═══ 乐观锁 vs 悲观锁 ═══

// 乐观锁 (@Version)
@Entity
public class Product {
    @Version
    private Integer version; // 每次更新自动 +1
    // UPDATE products SET stock=?, version=version+1
    // WHERE id=? AND version=?
    // → 版本不匹配 → OptimisticLockException
}

// 悲观锁 (SELECT FOR UPDATE)
@Query("SELECT p FROM Product p WHERE p.id = :id")
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<Product> findByIdForUpdate(@Param("id") Long id);
// → 其他事务等待锁释放 → 串行化 → 安全但慢`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
