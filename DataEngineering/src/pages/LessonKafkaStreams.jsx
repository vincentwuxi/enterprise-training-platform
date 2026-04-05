import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const KS_CONCEPTS = [
  {
    name: 'KStream 无界流', icon: '🌊', color: '#0ea5e9',
    desc: '每条消息都是独立记录，像数据库的 INSERT。适合日志/事件/用户行为等不断产生的数据流。',
    code: `from kafka.streams import KafkaStreams, StreamsBuilder
from kafka.streams.kstream import KStream, TimeWindows, Suppressed, Consumed, Produced
from kafka.streams.state import Stores
import java.time.Duration as Duration

builder = StreamsBuilder()

# 创建 KStream（消费 orders topic）
orders: KStream = builder.stream(
    "orders-topic",
    Consumed.with_(Serdes.String(), order_serde)
)

# 流处理：过滤 + 转换 + 输出
processed = (orders
  .filter(lambda k, v: v.status == "PAID")         # 只处理已支付订单
  .mapValues(lambda v: OrderEnriched(v, calculate_tax(v)))  # 添加税费计算
  .selectKey(lambda k, v: v.product_category)       # 重新按商品分类分区
  .peek(lambda k, v: print(f"Processing: {k}"))     # 调试打印（不改变流）
)

# 输出到新 Topic
processed.to("enriched-orders-topic",
  Produced.with_(Serdes.String(), enriched_serde))

# 分叉（同一数据流多个下游）
branches = orders.split() \
  .branch(lambda k, v: v.amount > 1000, "high-value") \
  .branch(lambda k, v: v.amount <= 1000, "normal") \
  .defaultBranch("unknown")

branches["high-value"].to("vip-orders-topic")
branches["normal"].to("regular-orders-topic")`,
  },
  {
    name: 'KTable 变化日志流', icon: '📋', color: '#f97316',
    desc: '每条消息是键值更新（UPSERT）。同Key的新消息覆盖旧消息。用于维护实时状态（用户积分/库存余量），底层存 RocksDB。',
    code: `builder = StreamsBuilder()

# KTable：压实（Changelog）语义，相同 Key 只保留最新值
user_profiles: KTable = builder.table(
    "user-profiles-topic",   # 需 compaction 策略 Topic
    Consumed.with_(Serdes.String(), profile_serde),
    Materialized.as_("user-profiles-store")  # 物化视图（可查询！）
)

# KTable 交互式查询（无需查数据库！）
streams_instance = KafkaStreams(builder.build(), config)
streams_instance.start()

# 直接从流处理应用读取状态
store = streams_instance.store(
    StoreQueryParameters.fromNameAndType("user-profiles-store",
    QueryableStoreTypes.key_value_store())
)
user = store.get("user_001")  # 毫秒级查询！

# KStream JOIN KTable（流 JOIN 维度表/基础数据）
orders = builder.stream("orders-topic")
products = builder.table("products-topic")  # 产品信息维度表

enriched = orders.join(
    products,
    lambda order_v, product_v: EnrichedOrder(order_v, product_v),
    Joined.with_(Serdes.String(), order_serde, product_serde)
)
# 每条 order 自动 JOIN 最新 product 信息！`,
  },
  {
    name: '聚合 & 窗口', icon: '📊', color: '#a78bfa',
    desc: 'Kafka Streams 原生支持滚动/滑动/会话窗口聚合，结果存本地 RocksDB，高可用。',
    code: `builder = StreamsBuilder()
orders = builder.stream("orders-topic")

# ── 滚动窗口聚合（每5分钟不重叠的窗口）──
tumbling_agg = (orders
  .groupBy(lambda k, v: v.product_id)
  .windowedBy(
    TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(5))
  )
  .aggregate(
    lambda: {"count": 0, "total": 0.0},   # 初始值
    lambda k, v, agg: {
      "count": agg["count"] + 1,
      "total": agg["total"] + v.amount
    },
    Materialized.with_(Serdes.String(), agg_serde)
  )
)

# 输出窗口结果（包含窗口开始/结束时间）
tumbling_agg.toStream() \
  .map(lambda wk, v: (f"{wk.key()}@{wk.window().start()}", v)) \
  .to("sales-by-5min-topic")

# ── 会话窗口（用户活跃会话检测）──
session_agg = (orders
  .groupBy(lambda k, v: v.user_id)
  .windowedBy(
    SessionWindows.ofInactivityGapWithNoGrace(Duration.ofMinutes(30))
    # 30分钟无活动，视为会话结束
  )
  .count(Materialized.as_("session-store"))
)

# ── Suppress（等窗口完全关闭再输出，避免提前聚合）──
final_result = (tumbling_agg
  .suppress(Suppressed.untilWindowCloses(
    Suppressed.BufferConfig.unbounded()
  ))
)`,
  },
  {
    name: '全局表 & 错误处理', icon: '🌐', color: '#22c55e',
    code: `# GlobalKTable：跨所有分区可查询（维度数据广播）
# 区别：普通KTable只能和同Partition数据JOIN
global_products: GlobalKTable = builder.globalTable(
    "products-topic",  # 数据量不大的维度表全量广播
    Materialized.as_("global-products-store")
)

# Stream JOIN GlobalKTable（不需要key相同，自定义JOIN条件）
enriched = orders.join(
    global_products,
    lambda order_key, order_value: order_value.product_id,  # key提取器
    lambda order_v, product_v: EnrichedOrder(order_v, product_v)
)

# ── 错误处理 & Dead Letter Queue (DLQ) ──
def safe_process(key, value):
    try:
        return process_order(value)
    except Exception as e:
        # 发送到 DLQ，不中断流处理
        producer.produce("orders-dlq", key=key,
            value=json.dumps({"error": str(e), "original": value}))
        return None

result = orders \
  .mapValues(lambda v: safe_process(v.key, v)) \
  .filter(lambda k, v: v is not None)  # 过滤掉处理失败的消息

# ── 生产故障恢复：Standby Replicas ──
config["num.standby.replicas"] = 1  # 保留一个热备（快速故障转移）
config["state.dir"] = "/kafka-streams/state"  # RocksDB 状态目录
    `,
    desc: 'GlobalKTable 跨所有分区广播，适合小型维度表。配合 DLQ 实现生产级错误处理。',
  },
];

// Topology 图展示
function TopologyDiagram() {
  return (
    <div className="de-card" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#1e4060', lineHeight: '2.2', padding: '1rem 1.25rem' }}>
      <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.3rem' }}>// Kafka Streams Topology（处理器有向图）</div>
      <pre style={{ color: '#bfecff', margin: 0 }}>{`
Source Processor: [orders-topic]
         │  Consumed.with(Serdes.String(), OrderSerde)
         ▼
Filter Processor: status == "PAID"
         │
         ▼
MapValues Processor: add tax calculation
         │
         ├──────────────────────────────┐
         ▼                              ▼
 Branch: amount>1000           Branch: amount<=1000
 [high-value-topic]             [regular-orders-topic]
         │
         ▼
 WindowedAggregate (5min tumbling)
 [internal: orders-KSTREAM-AGGREGATE-STATE-STORE]
         │  → RocksDB 本地持久化
         ▼
Suppress (until window closes)
         │
Sink Processor: [sales-by-5min-topic]`}</pre>
    </div>
  );
}

export default function LessonKafkaStreams() {
  const navigate = useNavigate();
  const [activeConcept, setActiveConcept] = useState(0);

  const c = KS_CONCEPTS[activeConcept];

  return (
    <div className="lesson-de">
      <div className="de-badge">🧩 module_03 — Kafka Streams</div>
      <div className="de-hero">
        <h1>Kafka Streams：KStream / KTable / DSL 流处理</h1>
        <p>Kafka Streams 是<strong>嵌入 Java/Python 应用的轻量级流处理库</strong>——无需部署集群，直接在微服务内完成流处理。KStream（无界流）+ KTable（变化日志）组合覆盖绝大多数流处理场景。</p>
      </div>

      {/* Topology */}
      <div className="de-section">
        <h2 className="de-section-title">🗺️ Kafka Streams Topology（处理器有向图）</h2>
        <TopologyDiagram />
      </div>

      {/* 四大概念 */}
      <div className="de-section">
        <h2 className="de-section-title">⚡ 四大核心概念（切换查看代码）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {KS_CONCEPTS.map((concept, i) => (
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

        <div style={{ padding: '0.5rem 0.875rem', background: `${c.color}08`, borderRadius: '8px', fontSize: '0.82rem', color: '#1e4060', marginBottom: '0.625rem' }}>
          {c.desc}
        </div>

        <div className="de-code-wrap">
          <div className="de-code-head">
            <div className="de-code-dot" style={{ background: '#ef4444' }} />
            <div className="de-code-dot" style={{ background: '#f59e0b' }} />
            <div className="de-code-dot" style={{ background: c.color }} />
            <span style={{ marginLeft: '0.5rem', color: c.color }}>{c.icon} {c.name} — Kafka Streams DSL</span>
          </div>
          <div className="de-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflowY: 'auto' }}>{c.code}</div>
        </div>
      </div>

      {/* KStream vs KTable */}
      <div className="de-section">
        <h2 className="de-section-title">📋 KStream vs KTable vs GlobalKTable</h2>
        <div className="de-card">
          <table className="de-table">
            <thead><tr><th>特性</th><th>KStream</th><th>KTable</th><th>GlobalKTable</th></tr></thead>
            <tbody>
              {[
                ['消息语义', 'INSERT（无限流）', 'UPSERT（覆盖更新）', 'UPSERT（全量广播）'],
                ['存储范围', '无状态（或窗口状态）', '当前分区范围', '所有分区（全量）'],
                ['JOIN 限制', '需同分区Key', '需同分区Key', '无限制（任意Key）'],
                ['适用数据', '事件/日志/行为', '状态/配置/余量', '维度表/字典数据'],
                ['数据量限制', '无限制', '较大（per shard）', '小型（全量在内存/磁盘）'],
                ['典型例子', '点击流/下单事件', '用户余额/库存', '商品分类/地区码'],
              ].map(([feat, ks, kt, gkt]) => (
                <tr key={feat}>
                  <td style={{ fontWeight: 700, color: '#bfecff', fontSize: '0.8rem' }}>{feat}</td>
                  <td style={{ fontSize: '0.77rem', color: '#38bdf8' }}>{ks}</td>
                  <td style={{ fontSize: '0.77rem', color: '#f97316' }}>{kt}</td>
                  <td style={{ fontSize: '0.77rem', color: '#22c55e' }}>{gkt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="de-nav">
        <button className="de-btn" onClick={() => navigate('/course/data-engineering/lesson/kafka')}>← 上一模块</button>
        <button className="de-btn primary" onClick={() => navigate('/course/data-engineering/lesson/flink')}>下一模块：Apache Flink →</button>
      </div>
    </div>
  );
}
