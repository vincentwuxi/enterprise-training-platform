import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ARCHITECTURES = [
  {
    name: 'Lambda 架构', icon: '⚡', color: '#f97316',
    pros: ['成熟稳定，大厂广泛使用', '批处理层保证数据准确性', '离线数据重新处理能力强'],
    cons: ['维护两套代码（批+流）成本高', '数据延迟较高（小时/天级）', '批流结果合并复杂'],
    components: ['Batch Layer（Hadoop/Spark）→ 批处理全量数据', 'Speed Layer（Kafka+Flink）→ 实时最近数据', 'Serving Layer（HBase/Cassandra）→ 查询合并结果'],
    useCase: 'T+1 报表 + 实时看板双需求，如金融对账',
    code: `# Lambda 架构示例
# ── Batch Layer（每天凌晨跑全量，Spark）──
# 昨天所有订单聚合
batch_result = spark.sql("""
  SELECT date, product_id, sum(amount) as daily_sales
  FROM orders WHERE date = current_date - 1
  GROUP BY date, product_id
""")
batch_result.write.mode("overwrite").saveAsTable("batch_sales")

# ── Speed Layer（Kafka + Flink 实时增量）──
# 今天0点到现在的实时数据
stream_result = flink_env.from_source(kafka_source)
  .filter(lambda e: e.date == today)
  .key_by("product_id")
  .sum("amount")
  .sink(redis_sink)  # 存 Redis 实时缓存

# ── Serving Layer（查询时合并）──
def get_total_sales(product_id):
    batch = db.query(f"SELECT * FROM batch_sales WHERE product_id={product_id}")
    realtime = redis.get(f"realtime:{product_id}")
    return batch.daily_sales + realtime  # 合并！`,
  },
  {
    name: 'Kappa 架构', icon: '🌊', color: '#0ea5e9',
    pros: ['只有一套流处理代码', '延迟低（秒级甚至毫秒级）', 'Kafka 保留长期历史数据，可重放'],
    cons: ['重新处理历史数据需重放整个 Topic', '对流处理引擎要求高', '状态管理复杂'],
    components: ['Stream Layer（Kafka + Flink/Kafka Streams）→ 唯一处理层', 'Kafka 长期保留（改变 retention.ms=-1）', 'Serving Layer（数据库/API）→ 直接存查询结果'],
    useCase: '实时性优先，无需大规模历史重算，如实时推荐',
    code: `# Kappa 架构：只有流处理，无批处理
# ── 唯一处理层（Kafka Streams）──
builder = StreamsBuilder()

# 实时聚合（用时间窗口代替批处理）
sales_stream = builder.stream("orders-topic")
windowed_sales = (sales_stream
  .groupBy(lambda k, v: v.product_id)
  .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofHours(1)))
  .aggregate(
    lambda: 0,
    lambda k, v, agg: agg + v.amount,
    Materialized.as("sales-store")  # 存入本地状态
  )
)

# 重新处理历史数据（回放 Kafka Topic）
# 只需将 auto.offset.reset=earliest 重新消费即可！
# 不需要另一套 Spark 批处理代码
windowed_sales.toStream().to("sales-result-topic")`,
  },
  {
    name: '流批一体（Lakehouse）', icon: '🏠', color: '#8b5cf6',
    pros: ['统一引擎（Flink/Spark 同时跑流批）', 'ACID 事务支持（Delta Lake/Iceberg）', 'Data Skipping + 列式存储，查询快'],
    cons: ['技术栈复杂，团队学习曲线高', '成熟度相对 Lambda 低', '小文件问题需要 Compaction'],
    components: ['Stream Ingestion（Kafka → Delta/Iceberg）', 'Unified Compute（Spark/Flink 流批同引擎）', 'Open Table Format（Delta Lake/Apache Iceberg）'],
    useCase: '云原生数据平台，如 Databricks Lakehouse Architecture',
    code: `# 流批一体：Apache Spark + Delta Lake
from delta.tables import DeltaTable
from pyspark.sql import SparkSession

spark = SparkSession.builder \
  .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
  .getOrCreate()

# ── 流处理：Kafka → Delta Lake（增量写入）──
kafka_stream = (spark.readStream
  .format("kafka")
  .option("kafka.bootstrap.servers", "kafka:9092")
  .option("subscribe", "orders-topic")
  .load())

query = (kafka_stream.writeStream
  .format("delta")              # 写入 Delta Lake！
  .option("checkpointLocation", "/delta/orders/_checkpoint")
  .outputMode("append")
  .trigger(processingTime="10 seconds")  # 微批
  .start("/delta/orders"))

# ── 批处理：同样的 Delta Table 直接查询！──
# 无需额外 ETL！流和批共享同一份数据
df = spark.read.format("delta").load("/delta/orders")
result = df.groupBy("product_id").agg(sum("amount"))

# ACID 事务：时间旅行（回查历史）
history_df = spark.read.format("delta") \
  .option("timestampAsOf", "2024-01-01") \
  .load("/delta/orders")`,
  },
];

const TECH_COMPARE = [
  { tech: 'Kafka', role: '消息队列 / 事件总线', latency: '毫秒级', throughput: '百万 msg/s', state: '无状态', use: '解耦/缓冲/重放' },
  { tech: 'Kafka Streams', role: '嵌入式流处理库', latency: '毫秒级', throughput: '高', state: '本地状态(RocksDB)', use: '微服务内部流处理' },
  { tech: 'Apache Flink', role: '分布式流批统一引擎', latency: '毫秒级', throughput: '极高', state: '分布式状态', use: '复杂事件/实时数仓' },
  { tech: 'Apache Spark', role: '分布式批处理+微批流', latency: '秒~分钟级', throughput: '极高', state: '微批快照', use: 'ETL/机器学习/数仓' },
  { tech: 'Delta Lake', role: '开放表格式/数据湖', latency: 'N/A（存储层）', throughput: 'N/A', state: 'ACID持久化', use: '统一批流存储' },
];

export default function LessonDataArch() {
  const navigate = useNavigate();
  const [activeArch, setActiveArch] = useState(0);
  const [showCode, setShowCode] = useState(false);

  const arch = ARCHITECTURES[activeArch];

  return (
    <div className="lesson-de">
      <div className="de-badge orange">📐 module_01 — 数据架构</div>
      <div className="de-hero">
        <h1>数据架构：Lambda / Kappa / 流批一体 设计</h1>
        <p>在选择 Kafka/Flink/Spark 之前，必须先确定<strong>架构范式</strong>。三种主流架构各有适用场景，理解它们的权衡取舍，是所有数据工程决策的基础。</p>
      </div>

      {/* 架构对比 */}
      <div className="de-section">
        <h2 className="de-section-title">🏗️ 三大数据架构（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {ARCHITECTURES.map((a, i) => (
            <button key={i} onClick={() => { setActiveArch(i); setShowCode(false); }}
              style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                border: `1px solid ${activeArch === i ? a.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeArch === i ? `${a.color}12` : 'rgba(255,255,255,0.02)',
                color: activeArch === i ? a.color : '#1e4060' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{a.icon}</div>
              {a.name}
            </button>
          ))}
        </div>

        <div className="de-card" style={{ borderColor: `${arch.color}30` }}>
          {/* 组件 */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: arch.color, fontSize: '0.82rem', marginBottom: '0.4rem' }}>🔧 核心组件</div>
            {arch.components.map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.78rem', color: '#1e4060', marginBottom: '0.2rem' }}>
                <span style={{ color: arch.color, flexShrink: 0 }}>▶</span>{c}
              </div>
            ))}
          </div>

          {/* 优缺点 */}
          <div className="de-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.75rem', marginBottom: '0.3rem' }}>✅ 优势</div>
              {arch.pros.map(p => <div key={p} style={{ fontSize: '0.77rem', color: '#1e4060', marginBottom: '0.15rem' }}>• {p}</div>)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.75rem', marginBottom: '0.3rem' }}>⚠️ 局限</div>
              {arch.cons.map(c => <div key={c} style={{ fontSize: '0.77rem', color: '#1e4060', marginBottom: '0.15rem' }}>• {c}</div>)}
            </div>
          </div>

          <div style={{ padding: '0.5rem 0.875rem', background: `${arch.color}10`, borderRadius: '6px', fontSize: '0.78rem', color: '#1e4060' }}>
            🎯 <strong style={{ color: arch.color }}>典型场景：</strong>{arch.useCase}
          </div>

          <button className="de-btn" onClick={() => setShowCode(!showCode)}
            style={{ marginTop: '0.75rem', borderColor: `${arch.color}40`, color: arch.color }}>
            {showCode ? '▲ 收起' : '▼ 查看代码示例'}
          </button>
        </div>

        {showCode && (
          <div className="de-code-wrap">
            <div className="de-code-head">
              <div className="de-code-dot" style={{ background: '#ef4444' }} />
              <div className="de-code-dot" style={{ background: '#f59e0b' }} />
              <div className="de-code-dot" style={{ background: arch.color }} />
              <span style={{ marginLeft: '0.5rem', color: arch.color }}>{arch.icon} {arch.name} — 代码示例</span>
            </div>
            <div className="de-code" style={{ fontSize: '0.75rem', maxHeight: 360 }}>{arch.code}</div>
          </div>
        )}
      </div>

      {/* 技术栈全景 */}
      <div className="de-section">
        <h2 className="de-section-title">📊 数据工程技术栈全景对比</h2>
        <div className="de-card">
          <table className="de-table">
            <thead><tr><th>技术</th><th>定位</th><th>延迟</th><th>状态管理</th><th>典型用途</th></tr></thead>
            <tbody>
              {TECH_COMPARE.map(t => (
                <tr key={t.tech}>
                  <td style={{ fontWeight: 800, color: t.tech === 'Kafka' ? '#f97316' : t.tech === 'Flink' ? '#a78bfa' : t.tech === 'Spark' ? '#f87171' : t.tech === 'Delta Lake' ? '#22c55e' : '#38bdf8', fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>{t.tech}</td>
                  <td style={{ fontSize: '0.78rem' }}>{t.role}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: t.latency.includes('毫') ? '#22c55e' : t.latency.includes('秒') ? '#fbbf24' : '#1e4060' }}>{t.latency}</td>
                  <td style={{ fontSize: '0.75rem', color: '#1e4060' }}>{t.state}</td>
                  <td style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{t.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="de-nav">
        <div />
        <button className="de-btn primary" onClick={() => navigate('/course/data-engineering/lesson/kafka')}>下一模块：Kafka 核心 →</button>
      </div>
    </div>
  );
}
