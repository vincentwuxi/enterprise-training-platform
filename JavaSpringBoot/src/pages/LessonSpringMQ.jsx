import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Kafka 深入', 'RabbitMQ', '事件驱动架构', 'Spring Cloud Stream'];

export default function LessonSpringMQ() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">☕ module_07 — 消息驱动</div>
      <div className="fs-hero">
        <h1>消息驱动：Kafka / RabbitMQ / 事件驱动架构</h1>
        <p>
          消息队列是微服务间<strong>异步通信</strong>的核心基础设施——
          <strong>Kafka</strong> 以高吞吐日志存储支撑流处理场景，
          <strong>RabbitMQ</strong> 以灵活路由满足企业集成需求，
          <strong>事件驱动架构 (EDA)</strong> 将服务间的同步调用转变为异步事件流，
          实现系统解耦与弹性扩展。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">☕ 消息驱动深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📨 Kafka 深入</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b91c1c'}}></span> KafkaDeep.java</div>
                <pre className="fs-code">{`// ═══ Kafka 架构 ═══
// Topic → 分为多个 Partition → 分布在多个 Broker
// Producer → Partition (按 key hash) → Consumer Group
//
// 关键概念:
// Partition: 有序、不可变的消息日志 (只追加写!)
// Offset:    消息在 Partition 中的位置 (递增 ID)
// Consumer Group: 组内消费者分摊 Partition (并行消费)
// Replication:    每个 Partition 有 N 个副本 (Leader + Follower)

// ─── Spring Kafka Producer ───
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final KafkaTemplate<String, Object> kafka;

    public void publishOrderCreated(Order order) {
        var event = new OrderCreatedEvent(
            order.getId(), order.getUserId(), order.getTotal(),
            Instant.now());
        
        // key = orderId → 同一订单的所有事件在同一 Partition → 有序!
        kafka.send("order-events", order.getId().toString(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish event: {}", ex.getMessage());
                    // 重试 / 死信队列
                } else {
                    var meta = result.getRecordMetadata();
                    log.info("Published to {}:{}@{}",
                        meta.topic(), meta.partition(), meta.offset());
                }
            });
    }
}

// ─── Spring Kafka Consumer ───
@Component
public class OrderEventConsumer {

    @KafkaListener(
        topics = "order-events",
        groupId = "inventory-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void onOrderCreated(
            @Payload OrderCreatedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment ack) {
        
        log.info("Received order {} from partition {} offset {}",
            event.orderId(), partition, offset);
        
        try {
            inventoryService.deductStock(event); // 业务处理
            ack.acknowledge(); // 手动提交 offset
        } catch (Exception e) {
            // 不 ack → 重新消费 (at-least-once)
            log.error("Processing failed, will retry", e);
        }
    }
}

// ─── Kafka 配置 ───
@Configuration
public class KafkaConfig {
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = Map.of(
            ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka:9092",
            ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class,
            ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class,
            ProducerConfig.ACKS_CONFIG, "all",   // 所有副本确认
            ProducerConfig.RETRIES_CONFIG, 3,
            ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true // 幂等!
        );
        return new DefaultKafkaProducerFactory<>(props);
    }
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object>
            kafkaListenerContainerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(3); // 3 个消费线程
        factory.getContainerProperties()
            .setAckMode(ContainerProperties.AckMode.MANUAL);
        // 死信队列
        factory.setCommonErrorHandler(
            new DefaultErrorHandler(
                new DeadLetterPublishingRecoverer(kafkaTemplate),
                new FixedBackOff(1000L, 3) // 重试3次, 间隔1s
            ));
        return factory;
    }
}

// ═══ Kafka 生产配置要点 ═══
// acks=all: 所有 ISR 副本确认 → 不丢消息
// min.insync.replicas=2: 至少 2 个副本同步
// enable.idempotence=true: 生产者幂等 (去重)
// max.in.flight.requests=5: 窗口大小
// compression.type=lz4: 压缩 (减少网络/磁盘)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐰 RabbitMQ</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> RabbitMQ.java</div>
                <pre className="fs-code">{`// ═══ RabbitMQ vs Kafka ═══
//
//            │ RabbitMQ           │ Kafka
// ───────────┼────────────────────┼──────────────────
// 模型       │ 消息队列 (推模式)  │ 日志 (拉模式)
// 消息保留   │ 消费后删除         │ 保留到过期
// 路由       │ 灵活 (Exchange)    │ Topic + Partition
// 吞吐       │ 万级/秒           │ 百万级/秒
// 延迟       │ 微秒级            │ 毫秒级
// 顺序       │ 单队列有序        │ 分区内有序
// 适合       │ 任务队列/企业集成  │ 日志/流处理/大数据

// ═══ RabbitMQ Exchange 类型 ═══
//
// Direct:  routing_key 精确匹配
//   → Exchange ──routing_key=order── → Queue A
//
// Fanout:  广播到所有绑定的队列
//   → Exchange ── → Queue A
//                 → Queue B
//                 → Queue C
//
// Topic:   通配符匹配
//   → order.*     匹配 order.created, order.paid
//   → order.#     匹配 order.created.success
//
// Headers: 根据消息头匹配 (少用)

// ─── Spring AMQP 配置 ───
@Configuration
public class RabbitConfig {
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange("order.exchange", true, false);
    }
    
    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable("order.created.queue")
            .withArgument("x-dead-letter-exchange", "dlx.exchange")
            .withArgument("x-dead-letter-routing-key", "dlx.order")
            .withArgument("x-message-ttl", 300000) // 5 分钟 TTL
            .build();
    }
    
    @Bean
    public Binding binding() {
        return BindingBuilder
            .bind(orderCreatedQueue())
            .to(orderExchange())
            .with("order.created");
    }
    
    // 延迟队列 (插件: rabbitmq_delayed_message_exchange)
    @Bean
    public CustomExchange delayExchange() {
        return new CustomExchange("delay.exchange",
            "x-delayed-message", true, false,
            Map.of("x-delayed-type", "topic"));
    }
}

// ─── 生产者 ───
@Service
public class OrderRabbitPublisher {
    private final RabbitTemplate rabbit;

    public void publishOrderCreated(OrderEvent event) {
        rabbit.convertAndSend("order.exchange", "order.created", event,
            message -> {
                message.getMessageProperties().setDeliveryMode(
                    MessageDeliveryMode.PERSISTENT); // 持久化
                message.getMessageProperties().setMessageId(
                    UUID.randomUUID().toString()); // 幂等 key
                return message;
            });
    }

    // 延迟消息 (如: 30 分钟未支付自动取消)
    public void publishDelayedCancel(Long orderId, Duration delay) {
        rabbit.convertAndSend("delay.exchange", "order.cancel",
            new OrderCancelEvent(orderId),
            message -> {
                message.getMessageProperties().setDelay(
                    (int) delay.toMillis());
                return message;
            });
    }
}

// ─── 消费者 ───
@Component
public class OrderRabbitConsumer {
    @RabbitListener(queues = "order.created.queue",
                    concurrency = "3-10") // 动态并发
    public void onOrderCreated(OrderEvent event, Channel channel,
                               @Header(AmqpHeaders.DELIVERY_TAG) long tag)
            throws IOException {
        try {
            inventoryService.deductStock(event);
            channel.basicAck(tag, false); // 手动确认
        } catch (Exception e) {
            channel.basicNack(tag, false, true); // 拒绝并重新入队
        }
    }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 事件驱动架构 (EDA)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> EventDriven.txt</div>
                <pre className="fs-code">{`═══ 同步 vs 事件驱动 ═══

  同步 (HTTP 调用链):
    OrderService → UserService → PaymentService → NotifyService
    问题:
      → 任一服务故障 → 整个链路失败
      → 总延迟 = 所有调用延迟之和
      → 紧耦合 (每个服务知道下游地址)

  事件驱动:
    OrderService → 发布 "OrderCreated" 事件
    UserService       → 订阅 → 更新积分
    PaymentService    → 订阅 → 发起支付
    NotifyService     → 订阅 → 发短信
    
    优势:
      → 解耦! OrderService 不知道谁在消费
      → 弹性! 某个消费者故障不影响其他
      → 可扩展! 新增消费者无需修改发布者

═══ 事件溯源 (Event Sourcing) ═══

  传统: 存储当前状态 (数据库行)
    → orders 表: id=1, status=PAID, amount=100

  事件溯源: 存储事件序列
    → Event 1: OrderCreated(id=1, amount=100)
    → Event 2: OrderPaid(id=1, paymentId=999)
    → Event 3: OrderShipped(id=1, trackingNo=XYZ)
    → 当前状态 = 重放所有事件

  优势:
    → 完整审计日志 (天然合规)
    → 时间旅行 (任意时间点的状态)
    → 事件可以驱动其他系统

  挑战:
    → 事件 Schema 演进 (版本化!)
    → 读取性能 (需要 CQRS)
    → 复杂度高 (团队学习成本)

═══ CQRS (命令查询职责分离) ═══

  Command Side (写):
    → 验证 → 生成事件 → 存储事件
    → Event Store (Kafka / EventStoreDB)

  Query Side (读):
    → 消费事件 → 更新物化视图
    → 读优化: Elasticsearch / Redis / 读库

  写模型 ≠ 读模型:
    → 写: 领域模型 (DDD Aggregate)
    → 读: 视图模型 (针对查询优化的扁平结构)

═══ Outbox Pattern (可靠事件发布) ═══

  问题: 业务操作 + 发消息需要原子性!
    1. 存 DB 成功 → MQ 发送失败 → 数据不一致
    2. MQ 发送成功 → DB 提交失败 → 数据不一致

  Outbox 解决:
    1. 在同一个 DB 事务中:
       → 更新业务表 (orders)
       → 插入事件表 (outbox)
    2. 异步: CDC (Debezium) 捕获 outbox 表变更
       → 发送到 Kafka
    3. 消费者处理事件

  // 实现:
  @Transactional
  public Order createOrder(CreateOrderRequest req) {
      var order = orderRepo.save(new Order(req));
      
      outboxRepo.save(new OutboxEvent(
          "order-events", "OrderCreated",
          order.getId().toString(),
          objectMapper.writeValueAsString(new OrderCreatedEvent(order))
      ));
      
      return order;
  }
  // Debezium CDC → 自动发布到 Kafka`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>☁️ Spring Cloud Stream</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> CloudStream.java</div>
                <pre className="fs-code">{`// ═══ Spring Cloud Stream ═══
// 消息中间件的抽象层 — 切换 Kafka/Rabbit 只需改配置!

// ─── 函数式编程模型 (推荐) ───
@Configuration
public class StreamFunctions {

    // Supplier: 消息生产者 (定时触发)
    @Bean
    public Supplier<Flux<OrderEvent>> orderSource() {
        return () -> Flux.interval(Duration.ofSeconds(5))
            .map(i -> new OrderEvent("order-" + i, Instant.now()));
    }

    // Consumer: 消息消费者
    @Bean
    public Consumer<OrderEvent> orderSink() {
        return event -> {
            log.info("Received: {}", event);
            processOrder(event);
        };
    }

    // Function: 转换器 (消费 + 生产)
    @Bean
    public Function<OrderEvent, ShipmentEvent> orderToShipment() {
        return order -> {
            log.info("Transforming order {}", order.orderId());
            return new ShipmentEvent(order.orderId(), "PENDING");
        };
    }
}

// ─── 配置 ───
// application.yml:
spring:
  cloud:
    stream:
      bindings:
        orderSource-out-0:                # Supplier 输出
          destination: order-events       # Kafka topic 名
          producer:
            partition-key-expression: headers['orderId']
            partition-count: 3
        
        orderSink-in-0:                   # Consumer 输入
          destination: order-events
          group: inventory-service        # Consumer Group
          consumer:
            max-attempts: 3
            back-off-initial-interval: 1000
        
        orderToShipment-in-0:             # Function 输入
          destination: order-events
          group: shipment-service
        orderToShipment-out-0:            # Function 输出
          destination: shipment-events
      
      kafka:                              # Kafka 特有配置
        binder:
          brokers: kafka:9092
          auto-create-topics: true
          replication-factor: 3

// ═══ 切换到 RabbitMQ 只需修改依赖和配置! ═══
// pom.xml: spring-cloud-stream-binder-kafka
//       → spring-cloud-stream-binder-rabbit
// application.yml:
// spring.cloud.stream.rabbit.binder.addresses: rabbitmq:5672

// ═══ StreamBridge (命令式发送) ═══
@Service
public class EventPublisher {
    private final StreamBridge streamBridge;

    public void publish(String topic, Object event) {
        streamBridge.send(topic, event);
    }
    
    // 动态目标
    public void publishToPartition(String topic, String key, Object event) {
        streamBridge.send(topic,
            MessageBuilder.withPayload(event)
                .setHeader("partitionKey", key)
                .build());
    }
}

// ═══ 消息可靠性保障总结 ═══
//
// │ 层面      │ 措施                           │
// ├───────────┼────────────────────────────────┤
// │ 生产者    │ acks=all + 重试 + 幂等         │
// │ Broker    │ 副本 3 + min.insync=2          │
// │ 消费者    │ 手动 ack + 幂等消费            │
// │ 业务层    │ Outbox Pattern + 补偿事务       │
// │ 监控      │ 消费延迟告警 + 死信队列监控     │`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
