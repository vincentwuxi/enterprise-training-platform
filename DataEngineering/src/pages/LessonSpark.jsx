import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const SPARK_TOPICS = [
  {
    name: 'DataFrame API', icon: '🗂️', color: '#ef4444',
    code: `from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window

spark = SparkSession.builder \
  .appName("OrderAnalytics") \
  .config("spark.sql.adaptive.enabled", "true")  \   # AQE 自适应查询优化
  .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
  .getOrCreate()

# 读取数据（支持多种格式）
orders = spark.read.format("delta").load("s3://data-lake/orders/")
products = spark.read.parquet("s3://data-lake/products/")

# ── 宽表关联 & 聚合（推荐用 DataFrame API 而非 RDD！）──
result = (orders
  .filter(F.col("status") == "PAID")
  .join(products, on="product_id", how="left")            # 维度关联
  .withColumn("revenue", F.col("amount") * F.col("quantity"))
  .withColumn("order_date", F.to_date("order_time"))
  .groupBy("order_date", "category")
  .agg(
    F.count("order_id").alias("order_count"),
    F.sum("revenue").alias("total_revenue"),
    F.avg("amount").alias("avg_order_value"),
    F.countDistinct("user_id").alias("unique_buyers"),
    F.percentile_approx("amount", [0.5, 0.9, 0.99]).alias("percentiles"),
  )
  .orderBy("order_date", "total_revenue", ascending=[True, False])
)

# ── 窗口函数（排名/累计/移动平均）──
window_spec = Window.partitionBy("category").orderBy(F.desc("total_revenue"))
result_ranked = result.withColumn("rank", F.rank().over(window_spec))

# ── 写出到 Delta Lake ──
result_ranked.write \
  .format("delta") \
  .mode("overwrite") \
  .partitionBy("order_date") \
  .save("s3://data-lake/analytics/daily-sales/")`,
  },
  {
    name: 'Spark SQL & 优化', icon: '⚡', color: '#f97316',
    code: `# Spark SQL：直接用 SQL 查询 DataFrame
orders.createOrReplaceTempView("orders")
products.createOrReplaceTempView("products")

# 复杂 SQL：同比 + 排名
result = spark.sql("""
  WITH monthly_sales AS (
    SELECT
      date_trunc('month', order_time) AS month,
      product_id, category,
      SUM(amount) AS revenue,
      COUNT(*) AS order_count
    FROM orders WHERE status = 'PAID'
    GROUP BY 1, 2, 3
  ),
  with_yoy AS (
    SELECT
      m.*,
      LAG(revenue, 12) OVER (PARTITION BY product_id ORDER BY month) AS prev_year_revenue,
      RANK() OVER (PARTITION BY month ORDER BY revenue DESC) AS monthly_rank
    FROM monthly_sales m
  )
  SELECT *,
    ROUND((revenue - prev_year_revenue) / prev_year_revenue * 100, 2) AS yoy_growth_pct
  FROM with_yoy
  WHERE monthly_rank <= 10  -- 每月 Top 10 产品
  ORDER BY month, monthly_rank
""")

# ── 性能优化关键技巧 ──
# 1. 广播 JOIN（小表广播，避免 Shuffle）
from pyspark.sql.functions import broadcast
result = orders.join(broadcast(small_lookup_table), "id")  # 自动广播<10MB

# 2. 分区裁剪（Partition Pruning）
df = spark.read.parquet("s3://data-lake/orders/") \
  .filter(F.col("order_date") >= "2024-01-01")   # Spark 自动只读1月后分区

# 3. 列裁剪（只读需要的列）
df.select("order_id", "user_id", "amount")  # Parquet 列式存储大幅减少IO

# 4. 解决数据倾斜（加盐）
skewed = orders.withColumn("salt", (F.rand() * 10).cast("int"))
result = skewed.join(product.withColumn("salt", F.explode(F.array(*[F.lit(i) for i in range(10)]))),
                     ["product_id", "salt"])`,
  },
  {
    name: 'Structured Streaming', icon: '🌊', color: '#a78bfa',
    code: `# Spark Structured Streaming：微批�流处理
# 和批处理 DataFrame API 几乎相同！

from pyspark.sql.streaming import DataStreamWriter

# ── 读取 Kafka 流数据（和批完全一致的 API！）──
raw_stream = (spark.readStream
  .format("kafka")
  .option("kafka.bootstrap.servers", "kafka:9092")
  .option("subscribe", "orders-topic")
  .option("startingOffsets", "latest")
  .load()
)

# 解析 JSON 消息
order_schema = StructType([
    StructField("order_id", StringType()),
    StructField("amount", DoubleType()),
    StructField("product_id", StringType()),
    StructField("order_time", TimestampType()),
])
orders_stream = (raw_stream
  .selectExpr("CAST(value AS STRING) as json_value")
  .select(F.from_json("json_value", order_schema).alias("data"))
  .select("data.*")
  .withWatermark("order_time", "10 seconds")  # 事件时间 + Watermark
)

# ── 流式窗口聚合（和批 SQL 完全相同！）──
result = (orders_stream
  .groupBy(
    F.window("order_time", "5 minutes"),  # 5分钟滚动窗口
    "product_id"
  )
  .agg(F.sum("amount").alias("total_sales"))
)

# ── 写出：多种 Sink ──
# 1. 落地到 Delta Lake（批流一体）
query1 = result.writeStream \
  .format("delta") \
  .option("checkpointLocation", "/checkpoint/sales") \
  .outputMode("append") \
  .trigger(processingTime="30 seconds") \  # 每30秒微批
  .start("/delta/streaming-sales")

# 2. 输出到 Kafka
query2 = result.selectExpr("product_id AS key", "to_json(struct(*)) AS value") \
  .writeStream.format("kafka").option("topic", "sales-result").start()`,
  },
  {
    name: 'MLlib & 机器学习', icon: '🤖', color: '#22c55e',
    code: `from pyspark.ml.feature import VectorAssembler, StandardScaler, StringIndexer
from pyspark.ml.classification import GBTClassifier
from pyspark.ml import Pipeline
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.tuning import CrossValidator, ParamGridBuilder

# ── 分布式机器学习：CTR 预估模型 ──
# 特征工程
indexer = StringIndexer(inputCol="category", outputCol="category_idx")
assembler = VectorAssembler(
  inputCols=["amount", "user_age", "category_idx", "days_since_join", "prev_purchase_count"],
  outputCol="features"
)
scaler = StandardScaler(inputCol="features", outputCol="scaled_features")

# GBT 分类器
gbt = GBTClassifier(
  featuresCol="scaled_features",
  labelCol="is_purchased",  # 0/1
  maxIter=50,
  maxDepth=5,
)

# Pipeline：将所有步骤串联
pipeline = Pipeline(stages=[indexer, assembler, scaler, gbt])

# 超参数搜索
param_grid = (ParamGridBuilder()
  .addGrid(gbt.maxIter, [20, 50])
  .addGrid(gbt.stepSize, [0.05, 0.1])
  .build()
)

# 分布式 5折交叉验证
cv = CrossValidator(
  estimator=pipeline,
  estimatorParamMaps=param_grid,
  evaluator=BinaryClassificationEvaluator(metricName="areaUnderROC"),
  numFolds=5,
  parallelism=4  # 并行计算4个超参数组合
)

train_df, test_df = data.randomSplit([0.8, 0.2], seed=42)
cv_model = cv.fit(train_df)

# 评估 & 保存模型
predictions = cv_model.transform(test_df)
evaluator = BinaryClassificationEvaluator()
print(f"AUC: {evaluator.evaluate(predictions):.4f}")
cv_model.bestModel.write().overwrite().save("s3://models/ctr-model-v1/")`,
  },
];

export default function LessonSpark() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);

  const t = SPARK_TOPICS[activeTopic];

  return (
    <div className="lesson-de">
      <div className="de-badge red">⚡ module_05 — Apache Spark</div>
      <div className="de-hero">
        <h1>Apache Spark：DataFrame / 结构化流 / MLlib</h1>
        <p>Spark 是<strong>最广泛使用的大数据处理引擎</strong>。统一的 DataFrame API 让 ETL、SQL 分析、实时流处理、机器学习使用相同编程模型。AQE 自适应查询优化让性能调优几乎自动化。</p>
      </div>

      {/* 四大 API */}
      <div className="de-section">
        <h2 className="de-section-title">🔧 Spark 四大能力（切换查看代码）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {SPARK_TOPICS.map((topic, i) => (
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
            <span style={{ marginLeft: '0.5rem', color: t.color }}>{t.icon} {t.name} — PySpark</span>
          </div>
          <div className="de-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      {/* Spark vs Flink 选型 */}
      <div className="de-section">
        <h2 className="de-section-title">⚖️ Spark vs Flink 选型指南</h2>
        <div className="de-card">
          <table className="de-table">
            <thead><tr><th>维度</th><th>Apache Spark</th><th>Apache Flink</th></tr></thead>
            <tbody>
              {[
                ['流处理延迟', '秒级（微批），Continuous模式毫秒级', '真正毫秒级（逐条处理）'],
                ['批处理能力', '⭐⭐⭐⭐⭐ 核心强项', '⭐⭐⭐⭐ 支持但非最优'],
                ['机器学习', '⭐⭐⭐⭐⭐ MLlib 生态成熟', '⭐⭐ 有限支持'],
                ['状态管理', '微批快照，相对简单', '细粒度分布式状态，极强'],
                ['事件时间处理', '支持（Watermark），功能完整', '最完善，Watermark+Allowed Lateness'],
                ['运维复杂度', '⭐⭐⭐ 相对简单（YARN/K8s）', '⭐⭐⭐⭐ 复杂（JobManager/TaskManager）'],
                ['云生态集成', '⭐⭐⭐⭐⭐ Databricks/EMR原生支持', '⭐⭐⭐⭐ Confluent/阿里云Flink'],
                ['最佳场景', 'ETL/数仓/特征工程/ML/报表', '实时风控/CEP/实时数仓/低延迟告警'],
              ].map(([d, s, f]) => (
                <tr key={d}>
                  <td style={{ fontWeight: 700, color: '#bfecff', fontSize: '0.8rem' }}>{d}</td>
                  <td style={{ fontSize: '0.77rem', color: '#f87171' }}>{s}</td>
                  <td style={{ fontSize: '0.77rem', color: '#a78bfa' }}>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="de-nav">
        <button className="de-btn" onClick={() => navigate('/course/data-engineering/lesson/flink')}>← 上一模块</button>
        <button className="de-btn primary" onClick={() => navigate('/course/data-engineering/lesson/pipeline')}>下一模块：数据管道 →</button>
      </div>
    </div>
  );
}
