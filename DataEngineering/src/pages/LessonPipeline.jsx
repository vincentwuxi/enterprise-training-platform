import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PIPELINE_TOPICS = [
  {
    name: 'CDC / Debezium', icon: '🔄', color: '#f97316',
    desc: 'Change Data Capture：捕获数据库每一行变更（INSERT/UPDATE/DELETE），转化为 Kafka 事件。无需修改应用代码，无侵入式数据同步。',
    code: `# Debezium：MySQL CDC → Kafka（零代码数据变更捕获）
# docker-compose.yml
debezium:
  image: debezium/connect:2.6
  environment:
    BOOTSTRAP_SERVERS: kafka:9092
    GROUP_ID: 1
    CONFIG_STORAGE_TOPIC: debezium_connect_configs
    OFFSET_STORAGE_TOPIC: debezium_connect_offsets
    STATUS_STORAGE_TOPIC: debezium_connect_statuses

# 注册 MySQL Connector（REST API）
curl -X POST http://debezium:8083/connectors -H "Content-Type: application/json" -d '{
  "name": "mysql-orders-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184054",
    "database.include.list": "shopdb",         # 监听的库
    "table.include.list": "shopdb.orders,shopdb.users",  # 监听的表
    "topic.prefix": "mysql",                   # Topic 前缀
    "snapshot.mode": "initial"                 # 初始全量快照后增量
  }
}'

# 输出 Kafka Topic: mysql.shopdb.orders
# 消息格式：
{
  "op": "u",       # u=update, c=create, d=delete, r=read(snapshot)
  "before": {"id": 1, "status": "PENDING"},   # 变更前
  "after":  {"id": 1, "status": "PAID"},      # 变更后
  "source": {"ts_ms": 1704067200000, "db": "shopdb", "table": "orders"}
}`,
  },
  {
    name: 'Delta Lake / Iceberg', icon: '🏔️', color: '#0ea5e9',
    desc: '开放表格式：在云存储（S3/OSS）上实现 ACID 事务 + Schema Evolution + Time Travel + 增量读取（CDC），无需传统数据仓库。',
    code: `# Apache Iceberg：开放表格式（Netflix/Apple/Netflix使用）
# Delta Lake：Databricks推广（与 Iceberg 竞合关系）

# ── Delta Lake 实战 ──
from delta.tables import DeltaTable

# ACID 事务写入（并发安全）
df.write.format("delta").mode("append").save("/delta/orders")

# UPSERT（MERGE INTO）
delta_table = DeltaTable.forPath(spark, "/delta/orders")
delta_table.alias("target").merge(
    source=new_data.alias("source"),
    condition="target.order_id = source.order_id"
).whenMatchedUpdate(set={"status": "source.status", "updated_at": "source.updated_at"}) \
 .whenNotMatchedInsertAll() \
 .execute()

# 时间旅行：查询历史版本
spark.read.format("delta") \
  .option("versionAsOf", 42) \   # 第42个版本
  .load("/delta/orders")

spark.read.format("delta") \
  .option("timestampAsOf", "2024-01-15") \  # 某时刻快照
  .load("/delta/orders")

# Schema Evolution（字段自动扩展）
df_with_new_col.write.format("delta") \
  .option("mergeSchema", "true") \  # 自动添加新字段
  .mode("append").save("/delta/orders")

# 增量读取（CDF: Change Data Feed）
spark.read.format("delta") \
  .option("readChangeFeed", "true") \
  .option("startingVersion", 0) \
  .table("orders")  # 返回所有 insert/update/delete 行`,
  },
  {
    name: 'Airflow 工作流', icon: '✈️', color: '#a78bfa',
    desc: 'Apache Airflow：数据管道编排工具。DAG（有向无环图）定义任务依赖，支持定时调度、重试、告警和可视化监控。',
    code: `from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from airflow.providers.apache.kafka.operators.produce import ProduceToTopicOperator
from airflow.utils.dates import days_ago
from datetime import timedelta

# ── 数据管道 DAG 定义 ──
with DAG(
    dag_id='daily_sales_etl',
    description='每日销售数据 ETL → 数仓 → 报表',
    schedule_interval='0 2 * * *',  # 每天凌晨2点
    start_date=days_ago(1),
    catchup=False,
    default_args={
        'retries': 3,              # 失败自动重试3次
        'retry_delay': timedelta(minutes=5),
        'email_on_failure': True,
        'email': ['data-team@company.com'],
    },
) as dag:

    # 任务1：从 MySQL 全量同步（Spark）
    extract = SparkSubmitOperator(
        task_id='extract_mysql_to_s3',
        application='/jobs/extract_orders.py',
        conf={'spark.executor.memory': '4g'},
    )

    # 任务2：数据清洗和转换
    transform = SparkSubmitOperator(
        task_id='transform_and_enrich',
        application='/jobs/transform_orders.py',
    )

    # 任务3：写入数仓（Delta Lake）
    load = SparkSubmitOperator(
        task_id='load_to_data_warehouse',
        application='/jobs/load_delta.py',
    )

    # 任务4：刷新 BI 报表缓存
    refresh_bi = PythonOperator(
        task_id='refresh_metabase_cache',
        python_callable=lambda: requests.post('http://metabase/api/cache/invalidate'),
    )

    # 定义任务依赖（DAG拓扑）
    extract >> transform >> load >> refresh_bi`,
  },
  {
    name: 'Flink CDC 实时管道', icon: '⚡', color: '#22c55e',
    desc: 'Flink CDC：结合 Debezium + Flink SQL，构建数据库变更 → 实时数仓的端到端管道，延迟小于 1 秒。',
    code: `# Flink SQL + CDC：实时同步 MySQL → ClickHouse 数仓
# 无需 Spark 批处理，延迟 < 1 秒！

# 1. 定义 MySQL CDC Source（Flink CDC Connector）
t_env.execute_sql("""
  CREATE TABLE mysql_orders (
    id          BIGINT,
    user_id     BIGINT,
    product_id  BIGINT,
    amount      DECIMAL(10,2),
    status      STRING,
    created_at  TIMESTAMP(3),
    PRIMARY KEY (id) NOT ENFORCED
  ) WITH (
    'connector' = 'mysql-cdc',          -- Flink CDC 连接器
    'hostname' = 'mysql',
    'port' = '3306',
    'username' = 'flink',
    'password' = 'flink123',
    'database-name' = 'shopdb',
    'table-name' = 'orders'
  )
""")

# 2. 定义 ClickHouse Sink（OLAP 分析数据库）
t_env.execute_sql("""
  CREATE TABLE clickhouse_orders_summary (
    product_id BIGINT,
    hour       TIMESTAMP,
    order_count BIGINT,
    total_amount DECIMAL(15,2),
    PRIMARY KEY (product_id, hour) NOT ENFORCED
  ) WITH (
    'connector' = 'clickhouse',
    'url' = 'clickhouse://clickhouse:8123/analytics',
    'table-name' = 'orders_hourly'
  )
""")

# 3. 实时增量聚合（Flink SQL 自动处理 CDC 撤回消息）
t_env.execute_sql("""
  INSERT INTO clickhouse_orders_summary
  SELECT
    product_id,
    TUMBLE_START(created_at, INTERVAL '1' HOUR) AS hour,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount
  FROM mysql_orders
  WHERE status = 'PAID'
  GROUP BY product_id, TUMBLE(created_at, INTERVAL '1' HOUR)
""")  # 持续运行，MySQL变更实时同步到 ClickHouse!`,
  },
];

export default function LessonPipeline() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);

  const t = PIPELINE_TOPICS[activeTopic];

  return (
    <div className="lesson-de">
      <div className="de-badge teal">🔗 module_06 — 数据管道</div>
      <div className="de-hero">
        <h1>数据管道：CDC / Debezium / Delta Lake / Airflow</h1>
        <p>现代数据管道的核心是<strong>低延迟、零代码侵入地同步生产数据库变更</strong>。CDC + 开放表格式 + 工作流编排三件套，构建从 OLTP 到 OLAP 的完整链路。</p>
      </div>

      {/* 四大主题 */}
      <div className="de-section">
        <h2 className="de-section-title">🔧 数据管道四大工具（切换查看配置）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {PIPELINE_TOPICS.map((topic, i) => (
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

        <div style={{ padding: '0.5rem 0.875rem', background: `${t.color}08`, borderRadius: '8px', fontSize: '0.82rem', color: '#1e4060', marginBottom: '0.625rem' }}>
          {t.desc}
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

      {/* 端到端数据流 */}
      <div className="de-section">
        <h2 className="de-section-title">🗺️ 端到端数据管道架构</h2>
        <div className="de-card" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#1e4060', lineHeight: '2.2' }}>
          <pre style={{ color: '#bfecff', margin: 0 }}>{`
MySQL/PostgreSQL    →   Debezium CDC   →   Kafka Topic
(OLTP 生产库)           (零侵入捕获)        orders.created
                                             └─ op:INSERT
                                             └─ op:UPDATE

Kafka Topic   →   Flink / Spark Streaming   →   Delta Lake (S3/OSS)
              1秒延迟       数据清洗/关联/聚合      ACID事务 + 时间旅行
                            Watermark+窗口计算      Schema Evolution

Delta Lake   →   Airflow 调度 + dbt 数据建模   →   ClickHouse / Redshift
              批处理层：T+1全量聚合                   OLAP 分析数据库
              支持时间旅行回溯                        毫秒级响应

ClickHouse   →   Metabase / SuperSet / Grafana   →   最终用户
              BI 报表工具                              实时大屏 / 自助分析`}</pre>
        </div>
      </div>

      <div className="de-nav">
        <button className="de-btn" onClick={() => navigate('/course/data-engineering/lesson/spark')}>← 上一模块</button>
        <button className="de-btn primary" onClick={() => navigate('/course/data-engineering/lesson/monitor')}>下一模块：监控与调优 →</button>
      </div>
    </div>
  );
}
