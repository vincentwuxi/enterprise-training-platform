import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const MQ_TOPICS = [
  {
    name: 'Kafka 核心', icon: '📨', color: '#f59e0b',
    code: `# Kafka 核心概念 + 生产配置

# ── Producer 最佳实践 ──
from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=['kafka1:9092', 'kafka2:9092', 'kafka3:9092'],
    acks='all',                          # 所有副本确认（最强保证）
    enable_idempotence=True,             # 幂等写入（防重复）
    retries=3,                           # 失败重试3次
    max_in_flight_requests_per_connection=5,
    compression_type='lz4',             # 压缩减少带宽
    batch_size=16384,                    # 16KB 批量发送（提升吞吐）
    linger_ms=10,                        # 等10ms凑batch（延迟换吞吐）
    key_serializer=str.encode,
    value_serializer=lambda v: json.dumps(v).encode()
)

# 带 Key 的消息 → 保证同一 Key 路由到同一 Partition（顺序性）
future = producer.send(
    topic='order-events',
    key=f'order-{order_id}',            # Key = 订单ID → 顺序保证
    value={'type': 'ORDER_CREATED', 'order_id': order_id, 'amount': 299.90},
    headers=[('trace-id', b'req-abc123')]  # 链路追踪
)
record_metadata = future.get(timeout=10)   # 等待确认
print(f"发送成功：partition={record_metadata.partition}, offset={record_metadata.offset}")

# ── Consumer Group 配置 ──
consumer = KafkaConsumer(
    'order-events',
    group_id='payment-service',         # 消费者组（相同组内负载均衡）
    bootstrap_servers=['kafka1:9092'],
    auto_offset_reset='earliest',       # 从最早消息开始（新组首次）
    enable_auto_commit=False,           # 手动提交 Offset（避免丢消息）
    max_poll_records=100,               # 每次最多拉100条
)
for message in consumer:
    try:
        process_order_event(message.value)
        consumer.commit()               # 处理成功后手动提交
    except Exception:
        # 不提交 → 下次重新消费（At-Least-Once 语义）
        log.error("处理失败，等待重试")`,
  },
  {
    name: '消息可靠性', icon: '🛡️', color: '#22c55e',
    code: `# 消息队列可靠性三层保障

# ── 1. At-Most-Once（最多一次）: 可能丢消息 ──
# auto_commit=True → 消费消息后立刻提交 Offset
# 如果处理失败，Offset 已提交，消息丢失！

# ── 2. At-Least-Once（至少一次）: 可能重复 ──
# 手动提交 Offset，处理完成再提交
# 如果处理完但提交前宕机 → 重启后重复消费！
# 解决：幂等处理（去重表/版本号）

async def process_payment(msg: PaymentEvent) -> None:
    # 幂等去重：用消息ID防重复处理
    if await redis.setnx(f"processed:{msg.event_id}", 1, ex=86400):
        await db.execute_payment(msg)    # 只有首次才执行
        await redis.delete(f"lock:{msg.order_id}")
    else:
        log.info(f"重复消息，跳过: {msg.event_id}")
    await consumer.commit()              # 最后提交 Offset

# ── 3. Exactly-Once（精确一次）: 最强保证 ──
# Kafka Transactions + Consumer + DB 事务联动
producer = KafkaProducer(transactional_id='payment-producer-1')
producer.init_transactions()

producer.begin_transaction()
try:
    # 读→处理→写 原子操作
    producer.send('payments', key=order_id, value=payment_result)
    # 同时提交 Consumer Offset（Kafka 内部事务！）
    producer.send_offsets_to_transaction({tp: offset}, consumer_group)
    producer.commit_transaction()
except Exception:
    producer.abort_transaction()   # 回滚！消息未发出，Offset未提交

# ── 死信队列 (DLQ) ──
# 重试3次仍失败 → 送入死信队列，人工处理
MAX_RETRY = 3
if message.headers.get('retry-count', 0) >= MAX_RETRY:
    producer.send('order-events-dlq', value=message.value)  # 死信队列
else:
    producer.send('order-events', value=message.value,
                  headers={'retry-count': str(retry + 1)})`,
  },
  {
    name: 'Kafka vs RabbitMQ', icon: '⚖️', color: '#3b82f6',
    code: `# Kafka vs RabbitMQ vs RocketMQ 选型对比

选型矩阵：
┌─────────────┬────────────────────┬──────────────────┬────────────────┐
│ 特性         │ Kafka              │ RabbitMQ         │ RocketMQ       │
├─────────────┼────────────────────┼──────────────────┼────────────────┤
│ 吞吐量       │ 百万/秒 🏆          │ 万级/秒           │ 十万级/秒      │
│ 延迟         │ 毫秒级（批量）      │ 微秒级 🏆         │ 毫秒级         │
│ 消息顺序     │ Partition内有序     │ Queue内有序       │ 严格顺序消息   │
│ 消息堆积     │ 支持，保留天级 🏆   │ 不适合大量堆积   │ 支持，内存态  │
│ 消息回放     │ 支持（重置Offset）🏆 │ 不支持           │ 支持           │
│ 协议         │ 自研协议            │ AMQP/MQTT        │ 自研协议       │
│ 适用场景     │ 流处理/日志/事件    │ 任务队列/RPC     │ 交易/风控      │
└─────────────┴────────────────────┴──────────────────┴────────────────┘

# ── Kafka 选型原则 ──
选 Kafka 当：
  ✅ 需要超高吞吐（日志收集、用户行为流）
  ✅ 需要消息回放（Flink/Spark 流计算）
  ✅ 事件驱动微服务解耦

选 RabbitMQ 当：
  ✅ 任务队列（Celery后台任务）
  ✅ 需要复杂路由（Exchange+RoutingKey）
  ✅ 消息量不大，延迟敏感

选 RocketMQ 当：
  ✅ 金融交易、严格顺序消息
  ✅ 分布式事务消息（2PC最终一致）
  ✅ 阿里云生态

# ── 消息顺序性保证 ──
# Kafka：同一 Key → 同一 Partition → 顺序消费
# 但注意：Kafka 不保证跨 Partition 顺序！
# 场景：订单创建→支付→发货（同一订单ID → 同一Partition）`,
  },
];

const PATTERNS = [
  { name: '异步解耦', icon: '🔀', desc: '订单服务发消息，库存/支付异步处理，互不等待。失败不影响主链路。', color: '#3b82f6' },
  { name: '流量削峰', icon: '🏔️', desc: '秒杀 10 万请求 → MQ 缓冲 → 库存服务 1000/s 处理。防止 DB 击垮。', color: '#f59e0b' },
  { name: '最终一致', icon: '🔄', desc: '跨服务事务：A 扣钱发消息，B 收消息加货。失败重试保证最终成功。', color: '#22c55e' },
  { name: '事件驱动', icon: '⚡', desc: '用户注册事件 → 触发邮件/积分/推荐多个下游，轻松扩展新业务。', color: '#a855f7' },
];

export default function LessonMQ() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = MQ_TOPICS[activeTopic];

  return (
    <div className="lesson-sd">
      <div className="sd-badge amber">📨 module_04 — 消息队列</div>
      <div className="sd-hero">
        <h1>消息队列：Kafka / 可靠性保证 / 选型对比</h1>
        <p>消息队列是分布式系统的<strong>异步总线</strong>：解耦服务、削峰限流、保证最终一致性。Kafka 以超高吞吐著称，RabbitMQ 适合任务队列，RocketMQ 主导金融交易场景。</p>
      </div>

      {/* 四大使用模式 */}
      <div className="sd-interactive">
        <h3>🔄 消息队列四大使用模式</h3>
        <div className="sd-grid-4">
          {PATTERNS.map(p => (
            <div key={p.name} className="sd-card" style={{ borderColor: `${p.color}20`, padding: '1rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 800, color: p.color, fontSize: '0.82rem', marginBottom: '0.3rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sd-section">
        <h2 className="sd-section-title">📖 Kafka 三大核心主题</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {MQ_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>
        <div className="sd-code-wrap">
          <div className="sd-code-head">
            <div className="sd-code-dot" style={{ background: '#ef4444' }} />
            <div className="sd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="sd-code-dot" style={{ background: t.color }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span>
          </div>
          <div className="sd-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="sd-nav">
        <button className="sd-btn" onClick={() => navigate('/course/system-design/lesson/cache')}>← 上一模块</button>
        <button className="sd-btn primary" onClick={() => navigate('/course/system-design/lesson/database')}>下一模块：数据库扩展 →</button>
      </div>
    </div>
  );
}
