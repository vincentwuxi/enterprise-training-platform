import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Flink 窗口 & Watermark 动画
function WindowWatermarkDemo() {
  const [events, setEvents] = useState([]);
  const [watermark, setWatermark] = useState(-1);
  const [windows, setWindows] = useState([]);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  const EVENT_TIMES = [0, 1, 3, 2, 5, 4, 8, 6, 10, 7, 12, 9, 15, 11, 20];
  const LATE_ALLOWANCE = 3; // 允许乱序 3 秒
  const WINDOW_SIZE = 5;    // 5秒窗口

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTime(t => {
          const nextT = t + 1;
          if (nextT >= EVENT_TIMES.length * 1.5) {
            setRunning(false);
            return t;
          }

          // 产生事件（event time 是乱序的）
          const eventIdx = Math.floor(nextT * 0.8);
          if (eventIdx < EVENT_TIMES.length) {
            const eventTime = EVENT_TIMES[eventIdx];
            setEvents(prev => [...prev, { id: eventIdx, eventTime, arrivalTime: nextT }]);

            // Watermark = max event time seen - late allowance
            setWatermark(prev => Math.max(prev, eventTime - LATE_ALLOWANCE));
          }
          return nextT;
        });
      }, 600);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const maxEventTime = events.length > 0 ? Math.max(...events.map(e => e.eventTime)) : 0;
  const currentWm = Math.max(-1, maxEventTime - LATE_ALLOWANCE);

  // Compute closed windows
  const closedWindows = [];
  for (let w = 0; w * WINDOW_SIZE <= maxEventTime; w++) {
    const start = w * WINDOW_SIZE, end = start + WINDOW_SIZE;
    const closed = currentWm >= end;
    const eventsInWindow = events.filter(e => e.eventTime >= start && e.eventTime < end);
    if (eventsInWindow.length > 0 || start <= maxEventTime)
      closedWindows.push({ start, end, closed, count: eventsInWindow.length });
  }

  const reset = () => { setEvents([]); setWatermark(-1); setWindows([]); setTime(0); setRunning(false); };

  return (
    <div className="de-interactive">
      <h3>⏱️ Flink Watermark & 事件时间窗口动画
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="de-btn purple" onClick={() => setRunning(r => !r)}>{running ? '⏸ 暂停' : '▶ 运行'}</button>
          <button className="de-btn" onClick={reset}>↺ 重置</button>
        </div>
      </h3>

      {/* 时间轴 */}
      <div style={{ position: 'relative', height: 60, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem', border: '1px solid rgba(139,92,246,0.2)' }}>
        {/* 时间刻度 */}
        {Array.from({ length: 22 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(i / 21) * 100}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.05)', fontSize: '0.55rem', color: '#1e4060', paddingLeft: 2 }}>{i}</div>
        ))}

        {/* Watermark 线 */}
        {currentWm >= 0 && (
          <div style={{ position: 'absolute', left: `${(currentWm / 21) * 100}%`, top: 0, bottom: 0, borderLeft: '2px dashed #22c55e', zIndex: 10 }}>
            <span style={{ background: '#22c55e', color: '#000', fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.25rem', position: 'absolute', top: 2, whiteSpace: 'nowrap' }}>WM:{currentWm}s</span>
          </div>
        )}

        {/* 事件点 */}
        {events.map(e => (
          <div key={e.id} style={{ position: 'absolute', left: `${(e.eventTime / 21) * 100}%`, top: 15, width: 10, height: 10, borderRadius: '50%',
            background: e.eventTime <= currentWm ? '#a78bfa' : '#38bdf8', border: '2px solid rgba(255,255,255,0.3)', transform: 'translateX(-50%)' }}
            title={`事件${e.id}: eventTime=${e.eventTime}s`} />
        ))}

        {/* 窗口色块 */}
        {closedWindows.map((w, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(w.start / 21) * 100}%`, width: `${(WINDOW_SIZE / 21) * 100}%`, top: 30, height: 20, borderRadius: '3px', opacity: 0.5,
            background: w.closed ? '#a78bfa' : 'rgba(56,189,248,0.3)', border: `1px solid ${w.closed ? '#8b5cf6' : '#38bdf8'}`, fontSize: '0.55rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {w.start}-{w.end}s {w.closed ? '✓' : '…'} ({w.count})
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem', color: '#1e4060' }}>
        <span>🔵 待处理事件</span>
        <span style={{ color: '#a78bfa' }}>🟣 已过Watermark事件（乱序但被接受）</span>
        <span style={{ color: '#22c55e' }}>━━ Watermark （最大事件时间 - {LATE_ALLOWANCE}s迟到容忍）</span>
        <span style={{ color: '#8b5cf6' }}>■ 已关闭窗口（WM超过窗口结束时间）</span>
      </div>

      <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(139,92,246,0.07)', borderRadius: '6px', fontSize: '0.75rem', color: '#a78bfa' }}>
        当前 Watermark: {Math.max(0, currentWm)}s | 最大事件时间: {maxEventTime}s | 已关闭窗口: {closedWindows.filter(w => w.closed).length} 个
      </div>
    </div>
  );
}

const FLINK_APIS = [
  {
    name: 'DataStream API', icon: '🌊', color: '#a78bfa',
    code: `from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import KafkaSource, KafkaOffsetsInitializer
from pyflink.common.watermark_strategy import WatermarkStrategy, Duration

env = StreamExecutionEnvironment.get_execution_environment()
env.set_parallelism(4)  # 全局并行度

# ── Kafka Source（事件时间 + Watermark）──
source = KafkaSource.builder() \
  .set_bootstrap_servers("kafka:9092") \
  .set_topics("orders") \
  .set_group_id("flink-consumer") \
  .set_starting_offsets(KafkaOffsetsInitializer.earliest()) \
  .set_value_only_deserializer(OrderDeserializer()) \
  .build()

watermark_strategy = (
  WatermarkStrategy
  .for_bounded_out_of_orderness(Duration.of_seconds(5))  # 允许乱序5秒
  .with_timestamp_assigner(OrderTimestampAssigner())      # 从消息中提取事件时间
)

stream = env.from_source(source, watermark_strategy, "Kafka Orders")

# ── 核心转换 ──
result = (stream
  .filter(lambda order: order.status == "PAID")
  .map(lambda order: (order.product_id, order.amount), 
       output_type=Types.TUPLE([Types.STRING(), Types.FLOAT()]))
  .key_by(lambda t: t[0])  # 按产品分区
  .window(TumblingEventTimeWindows.of(Time.minutes(5)))  # 5分钟滚动窗口
  .aggregate(SalesAggregateFunction(),   # 自定义聚合函数
             SalesProcessWindowFunction())  # 窗口trigger后处理
)

# ── Kafka Sink ──
result.add_sink(
  FlinkKafkaProducer("sales-result", SalesSerializer(), producer_config)
)

env.execute("Order Sales Aggregation")`,
  },
  {
    name: 'Table API / Flink SQL', icon: '📋', color: '#0ea5e9',
    code: `from pyflink.table import StreamTableEnvironment, EnvironmentSettings

settings = EnvironmentSettings.new_instance().in_streaming_mode().build()
t_env = StreamTableEnvironment.create(settings)

# ── 定义 Source 表（连接 Kafka）──
t_env.execute_sql("""
  CREATE TABLE orders (
    order_id     STRING,
    product_id   STRING,
    user_id      STRING,
    amount       DOUBLE,
    status       STRING,
    order_time   TIMESTAMP(3),
    WATERMARK FOR order_time AS order_time - INTERVAL '5' SECOND  -- 事件时间+Watermark
  ) WITH (
    'connector' = 'kafka',
    'topic' = 'orders-topic',
    'properties.bootstrap.servers' = 'kafka:9092',
    'format' = 'json',
    'scan.startup.mode' = 'earliest-offset'
  )
""")

# ── Flink SQL 窗口聚合（SQL方式！无需写Java/Python）──
t_env.execute_sql("""
  SELECT
    TUMBLE_START(order_time, INTERVAL '5' MINUTE) AS window_start,
    TUMBLE_END(order_time, INTERVAL '5' MINUTE)   AS window_end,
    product_id,
    COUNT(*)        AS order_count,
    SUM(amount)     AS total_sales,
    AVG(amount)     AS avg_order_value
  FROM orders
  WHERE status = 'PAID'
  GROUP BY
    TUMBLE(order_time, INTERVAL '5' MINUTE),  -- 5分钟滚动窗口
    product_id
""").print()

# ── 定义 Sink 表（输出到 MySQL）──
t_env.execute_sql("""
  CREATE TABLE sales_summary (
    window_start TIMESTAMP, window_end TIMESTAMP,
    product_id STRING, order_count BIGINT, total_sales DOUBLE,
    PRIMARY KEY (window_start, product_id) NOT ENFORCED
  ) WITH (
    'connector' = 'jdbc',
    'url' = 'jdbc:mysql://mysql:3306/analytics',
    'table-name' = 'sales_summary'
  )
""")`,
  },
  {
    name: 'CEP 复杂事件处理', icon: '🔍', color: '#f97316',
    code: `from pyflink.cep import CEP, Pattern
from pyflink.cep.pattern import Pattern as FlinkPattern

# ── Flink CEP：复杂事件模式匹配 ──
# 场景：检测用户5分钟内3次登录失败后登录成功→疑似暴力破解

login_events = env.from_source(kafka_source, watermark, "Login Events")
user_stream = login_events.key_by(lambda e: e.user_id)

# 定义事件模式：3次失败后1次成功
pattern = (FlinkPattern.begin("first_fail")
  .where(lambda event, _: event.type == "LOGIN_FAIL")
  .times_or_more(3)  # 至少3次失败
  .within(Time.minutes(5))  # 5分钟内发生

  .followed_by("success")   # 紧随一次登录成功
  .where(lambda event, _: event.type == "LOGIN_SUCCESS")
)

# 应用 CEP 模式
pattern_stream = CEP.pattern(user_stream, pattern)

# 提取匹配结果
alerts = pattern_stream.select(lambda pattern_match: Alert(
  user_id=pattern_match["success"][0].user_id,
  fail_count=len(pattern_match["first_fail"]),
  risk_level="HIGH",
  message="疑似暴力破解攻击！"
))

alerts.add_sink(alert_sink)  # 发送告警`,
  },
  {
    name: '状态管理 & 容错', icon: '💾', color: '#22c55e',
    code: `# Flink 有状态流处理：精确一次语义
from pyflink.datastream.functions import KeyedProcessFunction
from pyflink.datastream.state import ValueStateDescriptor

class OrderDeduplicator(KeyedProcessFunction):
    """
    幂等去重：确保每个 order_id 只处理一次
    状态存储在 RocksDB，Checkpoint 到 S3，精确一次保证
    """
    def open(self, context):
        # 初始化状态：记录已处理的订单ID
        self.seen_state = self.runtime_context.get_state(
          ValueStateDescriptor("seen", Types.BOOLEAN())
        )
        # 注册清理定时器（避免状态无限增长）
        self.ttl_config = StateTtlConfig.new_builder(Time.days(1)) \
          .set_update_type(StateTtlConfig.UpdateType.OnCreateAndWrite) \
          .build()

    def process_element(self, order, ctx):
        if not self.seen_state.value():
            self.seen_state.update(True)
            yield order  # 第一次见到，处理
        # else: 重复消息，丢弃

# Checkpoint：故障恢复的核心
env.enable_checkpointing(60000)  # 每60秒做一次 Checkpoint
env.get_checkpoint_config().set_checkpoint_storage("s3://my-bucket/checkpoints")
env.get_checkpoint_config().set_checkpointing_mode(
  CheckpointingMode.EXACTLY_ONCE  # 精确一次！
)
env.get_checkpoint_config().set_min_pause_between_checkpoints(30000)

# Savepoint：手动保存，用于版本升级/停机维护
# flink savepoint <job-id> s3://my-bucket/savepoints/sp-v2`,
  },
];

export default function LessonFlink() {
  const navigate = useNavigate();
  const [activeAPI, setActiveAPI] = useState(0);

  const api = FLINK_APIS[activeAPI];

  return (
    <div className="lesson-de">
      <div className="de-badge purple">🌊 module_04 — Apache Flink</div>
      <div className="de-hero">
        <h1>Apache Flink：窗口 / Watermark / 状态管理</h1>
        <p>Flink 是<strong>真正的流批统一引擎</strong>：支持毫秒级延迟、事件时间处理、分布式状态、精确一次语义。Watermark 机制是处理乱序流数据的核心创新。</p>
      </div>

      {/* Watermark 动画 */}
      <WindowWatermarkDemo />

      {/* API */}
      <div className="de-section">
        <h2 className="de-section-title">💻 Flink 四大 API（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {FLINK_APIS.map((a, i) => (
            <button key={i} onClick={() => setActiveAPI(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeAPI === i ? a.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeAPI === i ? `${a.color}10` : 'rgba(255,255,255,0.02)',
                color: activeAPI === i ? a.color : '#1e4060' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{a.icon}</div>
              {a.name}
            </button>
          ))}
        </div>

        <div className="de-code-wrap">
          <div className="de-code-head">
            <div className="de-code-dot" style={{ background: '#ef4444' }} />
            <div className="de-code-dot" style={{ background: '#f59e0b' }} />
            <div className="de-code-dot" style={{ background: api.color }} />
            <span style={{ marginLeft: '0.5rem', color: api.color }}>{api.icon} {api.name} — PyFlink</span>
          </div>
          <div className="de-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{api.code}</div>
        </div>
      </div>

      {/* 窗口类型速查 */}
      <div className="de-section">
        <h2 className="de-section-title">⏰ Flink 四种窗口类型速查</h2>
        <div className="de-grid-2">
          {[
            { type: '滚动窗口\nTumbling', desc: '固定大小，不重叠。每5分钟统计一次销售额。', eg: 'TUMBLE(time, INTERVAL \'5\' MINUTE)', color: '#a78bfa' },
            { type: '滑动窗口\nSliding', desc: '固定大小，重叠滑动。过去1小时内每5分钟计算一次。', eg: 'HOP(time, INTERVAL \'5\' MINUTE, INTERVAL \'1\' HOUR)', color: '#0ea5e9' },
            { type: '会话窗口\nSession', desc: '活动间隔超过阈值则切分会话。用户30分钟不活动则结束会话。', eg: 'SESSION(time, INTERVAL \'30\' MINUTE)', color: '#f97316' },
            { type: '累积窗口\nCumulate', desc: 'Flink 独有！同一天内不断累积，每小时出一次当日累计报表。', eg: 'CUMULATE(time, INTERVAL \'1\' HOUR, INTERVAL \'1\' DAY)', color: '#22c55e' },
          ].map(w => (
            <div key={w.type} className="de-card" style={{ borderColor: `${w.color}20`, padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: w.color, fontSize: '0.85rem', whiteSpace: 'pre-line', marginBottom: '0.4rem' }}>{w.type}</div>
              <div style={{ fontSize: '0.78rem', color: '#1e4060', marginBottom: '0.4rem' }}>{w.desc}</div>
              <code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.67rem', color: '#bfecff', background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.5rem', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>{w.eg}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="de-nav">
        <button className="de-btn" onClick={() => navigate('/course/data-engineering/lesson/kafka-streams')}>← 上一模块</button>
        <button className="de-btn primary" onClick={() => navigate('/course/data-engineering/lesson/spark')}>下一模块：Apache Spark →</button>
      </div>
    </div>
  );
}
