import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Kafka 消息流动画模拟器
function KafkaVisualizer() {
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState([]);
  const [partitions, setPartitions] = useState([[], [], []]);
  const [offsets, setOffsets] = useState([0, 0, 0]);
  const [consumerOffsets, setConsumerOffsets] = useState([0, 0, 0]);
  const [msgCount, setMsgCount] = useState(0);
  const timerRef = useRef(null);

  const TOPICS = ['order.created', 'payment.confirmed', 'inventory.updated'];
  const COLORS = ['#f97316', '#0ea5e9', '#a78bfa'];
  const KEYS = ['user_001', 'user_002', 'user_003', 'user_001', 'user_004'];

  const produce = () => {
    const key = KEYS[Math.floor(Math.random() * KEYS.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    // Partition by key hash
    const partition = Math.abs(key.charCodeAt(key.length - 1)) % 3;
    const msgId = msgCount + 1;
    const newMsg = { id: msgId, key, topic, partition, ts: Date.now() };

    setMessages(prev => [...prev.slice(-11), newMsg]);
    setPartitions(prev => {
      const next = prev.map(p => [...p]);
      next[partition] = [...next[partition].slice(-4), newMsg];
      return next;
    });
    setOffsets(prev => {
      const next = [...prev];
      next[partition] = next[partition] + 1;
      return next;
    });
    setMsgCount(c => c + 1);
  };

  const consume = () => {
    setConsumerOffsets(prev => prev.map((o, i) => Math.min(o + 1, offsets[i])));
  };

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        produce();
        if (Math.random() > 0.3) consume();
      }, 700);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, msgCount, offsets]);

  const reset = () => { setMessages([]); setPartitions([[], [], []]); setOffsets([0, 0, 0]); setConsumerOffsets([0, 0, 0]); setMsgCount(0); setRunning(false); };

  return (
    <div className="de-interactive">
      <h3>📨 Kafka 消息流可视化（Topic: orders，3个 Partition）
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="de-btn primary" onClick={() => setRunning(r => !r)}>{running ? '⏸ 暂停' : '▶ 运行'}</button>
          <button className="de-btn" onClick={reset}>↺ 重置</button>
        </div>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.875rem' }}>
        {partitions.map((msgs, pi) => (
          <div key={pi} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <div style={{ width: 90, fontSize: '0.72rem', color: COLORS[pi], fontWeight: 700, flexShrink: 0 }}>
              Partition {pi}<br />
              <span style={{ color: '#1e4060', fontWeight: 400 }}>offset: {offsets[pi]}</span><br />
              <span style={{ color: '#22c55e', fontWeight: 400 }}>consumed: {consumerOffsets[pi]}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: '0.25rem', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.375rem', minHeight: 36, border: `1px solid ${COLORS[pi]}20` }}>
              {msgs.map((m, i) => (
                <div key={m.id} style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', fontFamily: 'JetBrains Mono', fontWeight: 700, flexShrink: 0,
                  background: i < consumerOffsets[pi] ? 'rgba(34,197,94,0.12)' : `${COLORS[pi]}18`,
                  border: `1px solid ${i < consumerOffsets[pi] ? '#22c55e40' : COLORS[pi] + '40'}`,
                  color: i < consumerOffsets[pi] ? '#22c55e' : COLORS[pi] }}>
                  #{m.id}<br />{m.key}
                </div>
              ))}
              {msgs.length === 0 && <span style={{ fontSize: '0.65rem', color: '#1e4060' }}>空</span>}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#1e4060', width: 40, textAlign: 'right', flexShrink: 0 }}>
              Lag: {Math.max(0, offsets[pi] - consumerOffsets[pi])}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        {messages.slice(-6).map(m => (
          <div key={m.id} style={{ padding: '0.2rem 0.5rem', borderRadius: '5px', fontSize: '0.65rem', fontFamily: 'JetBrains Mono',
            background: `${COLORS[m.partition]}12`, border: `1px solid ${COLORS[m.partition]}30`, color: COLORS[m.partition] }}>
            p{m.partition}:{m.key} ({m.topic.split('.')[0]})
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#1e4060' }}>
        ✅ 绿色=已消费 | 彩色=未消费 | Lag=积压量 | 相同Key路由到相同Partition
      </div>
    </div>
  );
}

const KAFKA_CONCEPTS = [
  {
    name: 'Topic & Partition', icon: '📦', color: '#f97316',
    code: `# Kafka Topic 创建与配置
kafka-topics.sh --create \\
  --bootstrap-server kafka:9092 \\
  --topic orders \\
  --partitions 6 \\         # 分区数 = 并行度上限（不能轻易扩容）
  --replication-factor 3 \\ # 副本数（建议生产>=3）
  --config retention.ms=604800000 \\    # 保留7天
  --config cleanup.policy=delete        # 过期删除（vs compact）

# 分区数选择原则：
# - 预估最大并发消费者数（分区>=消费者数才能充分并行）
# - 分区太多 → Leader 选举慢，ZooKeeper 压力大
# - 推荐：先用当前峰值TPS/单分区TPS计算，再×2冗余

# Topic 扩容（只能增加，不能减少！）
kafka-topics.sh --alter \\
  --bootstrap-server kafka:9092 \\
  --topic orders --partitions 12  # 警告！会导致按Key路由失效

# 查看 Topic 详情
kafka-topics.sh --describe --topic orders --bootstrap-server kafka:9092`,
  },
  {
    name: 'Producer 配置', icon: '🚀', color: '#0ea5e9',
    code: `from confluent_kafka import Producer

# 高可靠生产者配置
producer = Producer({
  'bootstrap.servers': 'kafka1:9092,kafka2:9092,kafka3:9092',
  'acks': 'all',           # 等待所有副本确认（最高可靠性）
  'retries': 10,           # 失败重试次数
  'retry.backoff.ms': 100, # 重试间隔
  'enable.idempotence': True,  # 精确一次语义（幂等发送）
  'max.in.flight.requests.per.connection': 5,
  'compression.type': 'lz4',  # 压缩（节省30-70%带宽）
  'batch.size': 65536,         # 批量发送大小（默认16KB，增大提升吞吐）
  'linger.ms': 5,              # 等待5ms积累更多消息再批量发送
})

def delivery_callback(err, msg):
    if err:
        print(f'❌ 发送失败: {err}')
    else:
        print(f'✅ 发送成功: partition={msg.partition()}, offset={msg.offset()}')

# 发送消息（Key决定分区路由！）
producer.produce(
    topic='orders',
    key=str(user_id),      # 相同Key → 相同Partition → 保证顺序
    value=json.dumps(order_data),
    callback=delivery_callback
)
producer.flush()  # 等待所有消息发送完毕`,
  },
  {
    name: 'Consumer 消费者组', icon: '👥', color: '#a78bfa',
    code: `from confluent_kafka import Consumer

# 消费者组：同一组内每个Partition只被一个消费者消费
consumer = Consumer({
  'bootstrap.servers': 'kafka:9092',
  'group.id': 'order-processor-group',  # 消费者组ID（关键！）
  'auto.offset.reset': 'earliest',      # 无offset时从最早开始
  'enable.auto.commit': False,          # 手动提交（防止数据丢失）
  'max.poll.interval.ms': 300000,       # 最大处理间隔5分钟
  'session.timeout.ms': 30000,          # 心跳超时触发Rebalance
})

consumer.subscribe(['orders', 'payments'])  # 订阅多个Topic

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None or msg.error():
            continue

        # 处理消息
        order = json.loads(msg.value())
        process_order(order)

        # 手动提交：确认处理成功后才提交offset
        consumer.commit(asynchronous=False)  # 同步提交更安全

except KeyboardInterrupt:
    consumer.close()

# 消费者组 Rebalance 触发时机：
# 1. 新消费者加入/离开
# 2. 消费者心跳超时
# 3. Topic 分区数变化
# → Rebalance 期间短暂停止消费，需保证幂等处理！`,
  },
  {
    name: 'Offset & 重放', icon: '⏪', color: '#22c55e',
    code: `# Kafka Offset 管理与消息重放

# 查看消费者组 Lag（积压量监控）
kafka-consumer-groups.sh \\
  --bootstrap-server kafka:9092 \\
  --describe --group order-processor-group

# 输出：
# TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# orders  0          1000            1000            0    ← 无积压
# orders  1          800             950             150  ← 有积压！
# orders  2          1100            1200            100

# 手动重置 Offset（数据回放关键操作）
# 1. 重置到最早（重新消费所有历史数据）
kafka-consumer-groups.sh \\
  --bootstrap-server kafka:9092 \\
  --group order-processor-group \\
  --topic orders \\
  --reset-offsets --to-earliest --execute

# 2. 重置到指定时间（精确到秒！）
kafka-consumer-groups.sh \\
  --bootstrap-server kafka:9092 \\
  --group order-processor-group \\
  --topic orders \\
  --reset-offsets \\
  --to-datetime 2024-01-15T00:00:00.000 \\
  --execute

# Python API 重置 Offset
from confluent_kafka import TopicPartition
partition = TopicPartition('orders', 0, offset=500)
consumer.assign([partition])
consumer.seek(partition)`,
  },
];

export default function LessonKafka() {
  const navigate = useNavigate();
  const [activeConcept, setActiveConcept] = useState(0);

  const c = KAFKA_CONCEPTS[activeConcept];

  return (
    <div className="lesson-de">
      <div className="de-badge orange">📨 module_02 — Kafka 核心</div>
      <div className="de-hero">
        <h1>Kafka 核心：Topic / Partition / 消费者组实战</h1>
        <p>Kafka 是数据工程的<strong>中枢神经系统</strong>。理解 Partition 路由规则、Consumer Group Rebalance 机制、Offset 管理，是构建高可靠实时管道的基础。</p>
      </div>

      {/* Kafka 可视化 */}
      <KafkaVisualizer />

      {/* 核心概念 */}
      <div className="de-section">
        <h2 className="de-section-title">🔑 Kafka 四大核心概念（切换查看配置代码）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {KAFKA_CONCEPTS.map((concept, i) => (
            <button key={i} onClick={() => setActiveConcept(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeConcept === i ? concept.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeConcept === i ? `${concept.color}10` : 'rgba(255,255,255,0.02)',
                color: activeConcept === i ? concept.color : '#1e4060' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{concept.icon}</div>
              {concept.name}
            </button>
          ))}
        </div>

        <div className="de-code-wrap">
          <div className="de-code-head">
            <div className="de-code-dot" style={{ background: '#ef4444' }} />
            <div className="de-code-dot" style={{ background: '#f59e0b' }} />
            <div className="de-code-dot" style={{ background: c.color }} />
            <span style={{ marginLeft: '0.5rem', color: c.color }}>{c.icon} {c.name}</span>
          </div>
          <div className="de-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflowY: 'auto' }}>{c.code}</div>
        </div>
      </div>

      {/* 关键参数速查 */}
      <div className="de-section">
        <h2 className="de-section-title">⚙️ Kafka 生产关键参数速查</h2>
        <div className="de-grid-2">
          {[
            { title: 'Producer 可靠性', params: [['acks=all', '等待所有副本确认'],['enable.idempotence=true','精确一次'],['retries=10','失败重试'],['compression.type=lz4','LZ4压缩']] },
            { title: 'Consumer 稳定性', params: [['group.id','消费者组，划分消费份额'],['enable.auto.commit=false','手动提交防丢'],['max.poll.interval.ms','处理超时触发Rebalance'],['session.timeout.ms','心跳超时触发Rebalance']] },
          ].map(group => (
            <div key={group.title} className="de-card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#f97316', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{group.title}</div>
              {group.params.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.2rem' }}>
                  <code style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>{k}</code>
                  <span style={{ fontSize: '0.7rem', color: '#1e4060', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="de-nav">
        <button className="de-btn" onClick={() => navigate('/course/data-engineering/lesson/data-arch')}>← 上一模块</button>
        <button className="de-btn primary" onClick={() => navigate('/course/data-engineering/lesson/kafka-streams')}>下一模块：Kafka Streams →</button>
      </div>
    </div>
  );
}
