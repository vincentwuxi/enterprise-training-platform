import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Consumer Lag 实时监控仪表盘
function LagMonitor() {
  const [groups, setGroups] = useState([
    { name: 'order-processor', lag: 0, partitions: [0, 0, 0, 0, 0, 0], alert: false },
    { name: 'payment-service', lag: 0, partitions: [0, 0, 0], alert: false },
    { name: 'analytics-job',   lag: 0, partitions: [0, 0, 0, 0, 0, 0, 0, 0], alert: false },
  ]);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTick(t => {
          const nextT = t + 1;
          setGroups(prev => prev.map((g, gi) => {
            // Simulate varying lag patterns
            const noise = () => Math.floor(Math.random() * 50 - 10);
            const baseLag = gi === 0 ? (nextT > 15 ? 800 + Math.random() * 500 : 20 + nextT * 5) : // spike at t>15
                            gi === 1 ? Math.max(0, 50 + Math.sin(nextT * 0.5) * 30) :
                                       Math.max(0, 1200 - nextT * 50 + noise()); // recovering lag
            const partitions = g.partitions.map(() => Math.max(0, Math.floor(baseLag / g.partitions.length + noise())));
            const totalLag = partitions.reduce((a, b) => a + b, 0);
            return { ...g, lag: totalLag, partitions, alert: totalLag > 500 };
          }));
          return nextT;
        });
      }, 800);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const reset = () => { setTick(0); setRunning(false); setGroups(g => g.map(x => ({ ...x, lag: 0, partitions: x.partitions.map(() => 0), alert: false }))); };

  return (
    <div className="de-interactive">
      <h3>📊 Kafka Consumer Lag 实时监控仪表盘
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="de-btn primary" onClick={() => setRunning(r => !r)}>{running ? '⏸ 暂停' : '▶ 模拟积压'}</button>
          <button className="de-btn" onClick={reset}>↺ 重置</button>
        </div>
      </h3>

      {groups.map(group => (
        <div key={group.name} style={{ marginBottom: '0.875rem', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${group.alert ? 'rgba(239,68,68,0.4)' : 'rgba(14,165,233,0.15)'}`, background: group.alert ? 'rgba(239,68,68,0.04)' : 'rgba(14,165,233,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: '#38bdf8', fontWeight: 700 }}>{group.name}</span>
              {group.alert && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '3px', fontWeight: 700 }}>⚠️ LAG ALERT</span>}
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, fontSize: '1.1rem', color: group.alert ? '#f87171' : group.lag > 100 ? '#fbbf24' : '#22c55e' }}>{group.lag.toLocaleString()}</span>
          </div>

          <div className="de-meter">
            <div className="de-meter-fill" style={{ width: `${Math.min(100, (group.lag / 2000) * 100)}%`, background: group.alert ? 'linear-gradient(90deg,#dc2626,#ef4444)' : group.lag > 100 ? 'linear-gradient(90deg,#d97706,#fbbf24)' : 'linear-gradient(90deg,#16a34a,#22c55e)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            {group.partitions.map((lag, pi) => (
              <div key={pi} style={{ width: 28, textAlign: 'center', fontSize: '0.6rem', color: lag > 200 ? '#f87171' : lag > 50 ? '#fbbf24' : '#22c55e', fontFamily: 'JetBrains Mono' }}>
                P{pi}<br />{lag}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ fontSize: '0.7rem', color: '#1e4060' }}>
        🟢 &lt;100: 正常 | 🟡 100-500: 关注 | 🔴 &gt;500: 告警，需扩容消费者 | 注意：Lag持续增加=消费速度低于生产速度
      </div>
    </div>
  );
}

const TUNING_TOPICS = [
  {
    name: 'Kafka 性能调优', icon: '⚡', color: '#f97316',
    code: `# Kafka Broker 关键性能参数

# ── server.properties ──
num.network.threads=8               # 网络处理线程数
num.io.threads=16                   # IO线程数（建议=CPU核数*2）
socket.send.buffer.bytes=102400     # Socket 发送缓冲区 100KB
socket.receive.buffer.bytes=102400  # Socket 接收缓冲区
socket.request.max.bytes=104857600  # 最大请求100MB

log.segment.bytes=1073741824        # 单个日志段 1GB
log.retention.hours=168             # 保留7天
log.cleanup.policy=delete           # 超期删除（vs compact）
log.flush.interval.messages=10000   # 每1万条刷一次磁盘（生产可调大）

# ── Topic 级别优化 ──
# 消息大的 Topic（如图片元数据）
kafka-configs.sh --bootstrap-server kafka:9092 \
  --entity-type topics --entity-name large-events \
  --alter --add-config \
  max.message.bytes=10485760,    # 10MB消息上限
  retention.bytes=10737418240    # 每个分区保留10GB

# ── 性能基准测试 ──
# Producer 压测
kafka-producer-perf-test.sh \
  --topic perf-test --num-records 1000000 \
  --record-size 1024 --throughput -1 \
  --producer-props bootstrap.servers=kafka:9092 acks=1

# Consumer 压测
kafka-consumer-perf-test.sh \
  --bootstrap-server kafka:9092 \
  --topic perf-test --messages 1000000 --group perf-group`,
  },
  {
    name: 'Flink 背压处理', icon: '🌊', color: '#8b5cf6',
    code: `# Flink 背压（Backpressure）：下游处理速度跟不上上游产出速度

# 诊断：Flink Web UI → Jobs → SubTask → Backpressure
# OK: 0% 绿色 | Moderate: 17-50% 黄色 | High: >50% 红色

# ── 背压解决方案 ──

# 方案1：增加并行度（最直接）
data_stream.set_parallelism(8)  # 由4增加到8
# 或
env.set_parallelism(8)          # 设置全局并行度

# 方案2：异步IO（避免同步等待外部系统）
from pyflink.datastream.functions import AsyncFunction
from pyflink.datastream import AsyncDataStream

class AsyncDatabaseLookup(AsyncFunction):
    async def async_invoke(self, value, result_future):
        # 异步查询，不阻塞流水线
        user = await self.db.get_user_async(value.user_id)
        result_future.complete([EnrichedOrder(value, user)])

enriched = AsyncDataStream.unordered_wait(
    data_stream, AsyncDatabaseLookup(),
    timeout=1000,     # 1秒超时
    capacity=100      # 最多100个并发请求
)

# 方案3：RocksDB 状态后端调优（大状态 Job）
env.set_state_backend(EmbeddedRocksDBStateBackend())
env.get_configuration().set_string(
    "state.backend.rocksdb.block.cache-size", "256 mb"  # L1缓存
)

# 方案4：算子链 Chaining（减少序列化/网络传输）
# Flink 默认会自动 chain 相邻算子，可以禁止 chain 来增加并发
stream.map(fn1).disableChaining()  # 独立调度
      .filter(fn2)`,
  },
  {
    name: 'Spark 调优', icon: '⚙️', color: '#ef4444',
    code: `# Spark 性能调优 Checklist

# ── 1. 内存调优 ──
spark.executor.memory=8g
spark.executor.memoryOverhead=2g        # JVM overhead
spark.sql.adaptive.enabled=true         # AQE 自适应查询（Spark 3.0+）
spark.sql.adaptive.coalescePartitions.enabled=true  # 自动合并小分区
spark.sql.adaptive.skewJoin.enabled=true            # 自动处理倾斜JOIN

# ── 2. Shuffle 调优 ──
spark.sql.shuffle.partitions=200        # 默认200，大数据集可增至1000-2000
# 实际调优：output_size_bytes / 128MB ≈ 合理分区数
spark.shuffle.compress=true            # Shuffle 数据压缩
spark.io.compression.codec=lz4         # LZ4 最快，snappy 平衡

# ── 3. 数据倾斜处理 ──
# 诊断：Spark UI → Stage → Task Duration 差异大 = 倾斜
from pyspark.sql.functions import rand

# 方法1：倾斜 Key 加盐（Salt Trick）
SALT_NUM = 10
joined = (orders
  .withColumn("salt", (rand() * SALT_NUM).cast("int"))
  .join(
    product.withColumn("salt", F.explode(F.array(*[F.lit(i) for i in range(SALT_NUM)]))),
    ["product_id", "salt"]
  )
  .drop("salt")
)

# 方法2：Skew Hint（Spark 3.0+）
spark.sql("SELECT /*+ SKEW('t1', 'col_a', 1234) */ * FROM t1 JOIN t2")

# ── 4. 文件格式建议 ──
# Parquet > ORC > CSV（列式存储，查询性能数量级提升）
# 文件大小：128MB~1GB（避免小文件：Compaction）
# 分区数：每个分区数据量约 128MB 为宜

# ── 常见性能陷阱 ──
# ❌ collect() 大数据集（OOM）
# ❌ UDF（Python UDF 很慢，优先用 built-in functions）
# ❌ count() + show() 多次触发 Action（缓存中间结果）
df.cache()          # 或
df.persist(StorageLevel.MEMORY_AND_DISK)`,
  },
];

export default function LessonMonitor() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);

  const t = TUNING_TOPICS[activeTopic];

  return (
    <div className="lesson-de">
      <div className="de-badge teal">📊 module_07 — 监控与调优</div>
      <div className="de-hero">
        <h1>监控与调优：Lag 监控 / 背压 / 性能参数</h1>
        <p>数据工程最常见的生产故障：<strong>Kafka Lag 积压暴增</strong>（消费速度跟不上）、<strong>Flink 背压</strong>（下游处理慢导致数据堆积）、<strong>Spark 倾斜</strong>（部分任务跑几十倍长）。</p>
      </div>

      {/* Lag 监控 */}
      <LagMonitor />

      {/* 调优主题 */}
      <div className="de-section">
        <h2 className="de-section-title">🛠️ 三大引擎调优（切换查看）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {TUNING_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#1e4060' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>

        <div className="de-code-wrap">
          <div className="de-code-head">
            <div className="de-code-dot" style={{ background: '#ef4444' }} />
            <div className="de-code-dot" style={{ background: '#f59e0b' }} />
            <div className="de-code-dot" style={{ background: t.color }} />
            <span style={{ marginLeft: '0.5rem', color: t.color }}>{t.icon} {t.name}</span>
          </div>
          <div className="de-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      {/* 告警指标速查 */}
      <div className="de-section">
        <h2 className="de-section-title">🚨 生产监控必备指标</h2>
        <div className="de-grid-3">
          {[
            { name: 'Kafka Lag', threshold: '> 10万 告警, > 50万 紧急', tool: 'kafka-consumer-groups + Prometheus', color: '#f97316' },
            { name: 'Flink 背压', threshold: 'Backpressure > 50% 告警', tool: 'Flink Web UI / Prometheus Exporter', color: '#8b5cf6' },
            { name: '消费者 TPS', threshold: '低于预期 TPS 50% 告警', tool: 'records-consumed-rate Metric', color: '#0ea5e9' },
            { name: 'GC 时间', threshold: 'GC > 5% CPU 时间告警', tool: 'JVM GC Metrics / G1GC 日志', color: '#ef4444' },
            { name: 'Checkpoint 时间', threshold: '> 60s 或失败 3 次', tool: 'Flink Metrics + 告警规则', color: '#22c55e' },
            { name: 'Schema 变更', threshold: '生产 Schema 不兼容变更', tool: 'Confluent Schema Registry + 兼容性检查', color: '#14b8a6' },
          ].map(item => (
            <div key={item.name} className="de-card" style={{ borderColor: `${item.color}20`, padding: '0.875rem' }}>
              <div style={{ fontWeight: 700, color: item.color, fontSize: '0.82rem', marginBottom: '0.3rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#e0f0ff', marginBottom: '0.2rem' }}>阈值：{item.threshold}</div>
              <div style={{ fontSize: '0.68rem', color: '#1e4060' }}>工具：{item.tool}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="de-nav">
        <button className="de-btn" onClick={() => navigate('/course/data-engineering/lesson/pipeline')}>← 上一模块</button>
        <button className="de-btn primary" onClick={() => navigate('/course/data-engineering/lesson/project')}>下一模块：生产实战 →</button>
      </div>
    </div>
  );
}
