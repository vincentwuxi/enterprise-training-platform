import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 实时大屏数字动画
function RealtimeDashboard() {
  const [metrics, setMetrics] = useState({
    gmv: 2341897, orders: 8765, users: 43210, tps: 342, lag: 23
  });
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setMetrics(prev => ({
          gmv: prev.gmv + Math.floor(Math.random() * 5000 + 1000),
          orders: prev.orders + Math.floor(Math.random() * 5 + 1),
          users: prev.users + Math.floor(Math.random() * 3),
          tps: Math.floor(300 + Math.random() * 150),
          lag: Math.floor(10 + Math.random() * 40),
        }));
      }, 600);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const fmt = (n) => n >= 1e6 ? `¥${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `¥${(n / 1e3).toFixed(1)}K` : `¥${n}`;

  return (
    <div className="de-interactive" style={{ background: 'linear-gradient(135deg, #000a14 0%, #001428 100%)' }}>
      <h3>📺 电商实时大屏（Kafka → Flink → ClickHouse → Grafana）
        <button className="de-btn primary" onClick={() => setRunning(r => !r)} style={{ background: running ? 'rgba(34,197,94,0.2)' : undefined, borderColor: running ? '#22c55e40' : undefined, color: running ? '#22c55e' : undefined }}>
          {running ? '🔴 LIVE' : '▶ 模拟实时'}
        </button>
      </h3>

      <div className="de-grid-4" style={{ marginBottom: '1rem' }}>
        {[
          { label: '实时 GMV', value: fmt(metrics.gmv), sub: '今日累计', color: '#22c55e', icon: '💰' },
          { label: '实时订单数', value: metrics.orders.toLocaleString(), sub: '笔 今日', color: '#0ea5e9', icon: '📦' },
          { label: '活跃用户', value: metrics.users.toLocaleString(), sub: '人 在线', color: '#f97316', icon: '👥' },
          { label: 'Pipeline TPS', value: metrics.tps, sub: 'msg/s', color: metrics.tps > 400 ? '#f87171' : '#a78bfa', icon: '⚡' },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center', padding: '1rem 0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${m.color}20` }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>{m.icon}</div>
            <div style={{ fontSize: '0.65rem', color: '#1e4060', fontWeight: 600, marginBottom: '0.15rem' }}>{m.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: m.color, fontFamily: 'JetBrains Mono', lineHeight: 1.2 }}>{m.value}</div>
            <div style={{ fontSize: '0.6rem', color: '#1e4060' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* 简易柱状图：热销品 Top 5 */}
      <div style={{ fontSize: '0.72rem', color: '#1e4060', marginBottom: '0.3rem' }}>🏆 实时热销排行 Top 5（按GMV）</div>
      {[
        { name: 'iPhone 16 Pro', pct: 0.85 + Math.random() * 0.05 },
        { name: 'AirPods Pro 3', pct: 0.65 + Math.random() * 0.05 },
        { name: 'MacBook Air M4', pct: 0.52 + Math.random() * 0.05 },
        { name: 'iPad Pro M4', pct: 0.38 + Math.random() * 0.05 },
        { name: 'Apple Watch S10', pct: 0.29 + Math.random() * 0.05 },
      ].map((p, i) => (
        <div key={p.name} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
          <span style={{ width: 18, fontSize: '0.65rem', color: i < 3 ? '#fbbf24' : '#1e4060', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
          <span style={{ width: 130, fontSize: '0.7rem', color: '#bfecff', flexShrink: 0 }}>{p.name}</span>
          <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5 }}>
            <div style={{ height: '100%', width: `${p.pct * 100}%`, borderRadius: 5, background: `linear-gradient(90deg, #0369a1, #0ea5e9)`, transition: 'width 0.5s' }} />
          </div>
          <span style={{ width: 45, textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#38bdf8' }}>{(p.pct * 100).toFixed(0)}%</span>
        </div>
      ))}

      <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#1e4060' }}>
        Kafka Lag: <span style={{ color: metrics.lag < 50 ? '#22c55e' : '#f87171', fontWeight: 700 }}>{metrics.lag}</span> | 数据新鲜度: &lt;1s | by Flink + ClickHouse + Grafana
      </div>
    </div>
  );
}

const ARCH_CODE = `# 电商实时大屏：端到端完整技术实现
# 数据流：订单系统 MySQL → Debezium CDC → Kafka
#          → Flink 实时计算 → ClickHouse → Grafana

# ── 1. Debezium MySQL CDC 配置 ──
# POST /debezium/connectors
connector_config = {
    "name": "ecommerce-cdc",
    "config": {
        "connector.class": "io.debezium.connector.mysql.MySqlConnector",
        "database.hostname": "mysql-prod",
        "database.server.name": "ecom",
        "table.include.list": "ecom.orders, ecom.users, ecom.products",
        "snapshot.mode": "initial",
        "decimal.handling.mode": "double"
    }
}

# ── 2. Flink SQL 实时计算层 ──
# 2a. 定义 Kafka Source（CDC 格式）
t_env.execute_sql("""
  CREATE TABLE kafka_orders (
    id BIGINT, user_id BIGINT, product_id BIGINT,
    amount DECIMAL(10,2), status STRING, created_at TIMESTAMP(3),
    WATERMARK FOR created_at AS created_at - INTERVAL '5' SECOND
  ) WITH (
    'connector' = 'kafka',
    'topic' = 'ecom.ecom.orders',
    'properties.bootstrap.servers' = 'kafka:9092',
    'format' = 'debezium-json'   -- 直接解析 Debezium CDC 格式！
  )
""")

# 2b. 定义 ClickHouse Sink
t_env.execute_sql("""
  CREATE TABLE clickhouse_realtime_gmv (
    window_start TIMESTAMP, window_end TIMESTAMP,
    gmv DECIMAL(20,2), order_count BIGINT, unique_users BIGINT
  ) WITH (
    'connector' = 'clickhouse',
    'url' = 'clickhouse://clickhouse:8123/ecom_analytics',
    'table-name' = 'realtime_gmv_1min'
  )
""")

# 2c. 实时1分钟 GMV 聚合 SQL
t_env.execute_sql("""
  INSERT INTO clickhouse_realtime_gmv
  SELECT
    TUMBLE_START(created_at, INTERVAL '1' MINUTE),
    TUMBLE_END(created_at, INTERVAL '1' MINUTE),
    SUM(amount)             AS gmv,
    COUNT(*)                AS order_count,
    COUNT(DISTINCT user_id) AS unique_users
  FROM kafka_orders
  WHERE status = 'PAID'
  GROUP BY TUMBLE(created_at, INTERVAL '1' MINUTE)
""")`;

const CLICKHOUSE_CODE = `-- ClickHouse：高性能实时 OLAP（每秒可查询亿级数据）

-- 建表：分区 + 排序键 + 副本
CREATE TABLE ecom_analytics.realtime_sales
(
    event_time   DateTime,
    product_id   UInt64,
    category     String,
    amount       Decimal(10, 2),
    user_id      UInt64
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/real_sales', '{replica}')
PARTITION BY toYYYYMMDD(event_time)   -- 按天分区
ORDER BY (product_id, event_time)     -- 排序键决定查询速度
TTL event_time + toIntervalDay(90)    -- 90天后自动过期删除
SETTINGS index_granularity = 8192;

-- 实时 GMV 查询（毫秒级返回！）
SELECT
    toStartOfMinute(event_time) AS minute,
    sum(amount)                 AS gmv,
    count()                     AS order_count
FROM realtime_sales
WHERE event_time >= now() - INTERVAL 1 HOUR
  AND status = 'PAID'
GROUP BY minute
ORDER BY minute;

-- 近实时排行榜（漏斗分析）
SELECT product_id, sum(amount) AS revenue,
       rank() OVER (ORDER BY revenue DESC) AS rank
FROM realtime_sales
WHERE toDate(event_time) = today()
GROUP BY product_id
HAVING rank <= 10;

-- 物化视图：预计算加速（数据写入时自动触发）
CREATE MATERIALIZED VIEW mv_hourly_gmv
ENGINE = SummingMergeTree()
ORDER BY (product_id, hour)
AS SELECT
    product_id,
    toStartOfHour(event_time) AS hour,
    sum(amount)               AS gmv,
    count()                   AS cnt
FROM realtime_sales
GROUP BY product_id, hour;`;

export default function LessonProject() {
  const navigate = useNavigate();
  const [codeTab, setCodeTab] = useState('arch');
  const [checklist, setChecklist] = useState({});
  const toggle = k => setChecklist(p => ({ ...p, [k]: !p[k] }));

  const CHECKLIST = [
    'MySQL Debezium CDC → Kafka，覆盖 INSERT/UPDATE/DELETE',
    'Kafka 6个分区，Replication Factor=3，7天保留',
    'Flink SQL 实时1分钟/5分钟/1小时滚动窗口聚合',
    'Flink Checkpoint 1分钟，状态存 S3，精确一次',
    'ClickHouse 分区+排序键设计（toYYYYMMDD+product_id）',
    'ClickHouse 物化视图预计算小时/天级聚合',
    'Grafana 大屏：GMV折线图+热销排行+用户漏斗',
    'Kafka Consumer Lag < 5万，告警阈值设置完毕',
    'Flink 背压监控，并行度调优完成',
    'Airflow DAG：每日全量对账（批处理纠偏）',
    'Delta Lake 全量历史存储，支持时间旅行回查',
    'Schema Registry 管理 Avro Schema 版本',
  ];
  const done = Object.values(checklist).filter(Boolean).length;

  const STACK = [
    { layer: 'OLTP 生产数据库', icon: '🗄️', tech: 'MySQL 8.0 + PostgreSQL 16', color: '#f97316' },
    { layer: 'CDC 变更捕获', icon: '🔄', tech: 'Debezium 2.6 + Kafka Connect', color: '#fbbf24' },
    { layer: '消息队列', icon: '📨', tech: 'Confluent Kafka 7.6 + Schema Registry', color: '#f97316' },
    { layer: '实时计算引擎', icon: '⚡', tech: 'Apache Flink 1.18 (SQL + CEP)', color: '#8b5cf6' },
    { layer: '批处理引擎', icon: '🔥', tech: 'Apache Spark 3.5 + Delta Lake 3.0', color: '#ef4444' },
    { layer: '实时 OLAP', icon: '📊', tech: 'ClickHouse 24.x (副本+分片)', color: '#0ea5e9' },
    { layer: '工作流编排', icon: '✈️', tech: 'Apache Airflow 2.8 + K8s Executor', color: '#22c55e' },
    { layer: '大屏可视化', icon: '📺', tech: 'Grafana 10 + Metabase + SuperSet', color: '#14b8a6' },
  ];

  return (
    <div className="lesson-de">
      <div className="de-badge green">🏭 module_08 — 生产实战</div>
      <div className="de-hero">
        <h1>生产实战：电商实时大屏完整项目</h1>
        <p>把前 7 个模块整合为完整的<strong>实时数仓系统</strong>：MySQL → Debezium CDC → Kafka → Flink SQL → ClickHouse → Grafana 大屏。端到端延迟 &lt; 3 秒，支持亿级数据毫秒查询。</p>
      </div>

      {/* 实时大屏演示 */}
      <RealtimeDashboard />

      {/* 技术栈分层 */}
      <div className="de-section">
        <h2 className="de-section-title">🏗️ 完整技术栈（8层架构）</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {STACK.map((s, i) => (
            <div key={s.layer} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.65rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}15` }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{s.icon}</span>
              <span style={{ fontWeight: 700, color: s.color, fontSize: '0.8rem', minWidth: 140, flexShrink: 0 }}>{s.layer}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#bfecff' }}>{s.tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 代码 */}
      <div className="de-section">
        <h2 className="de-section-title">💻 关键代码实现</h2>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.625rem' }}>
          <button className={`de-btn ${codeTab === 'arch' ? 'primary' : ''}`} onClick={() => setCodeTab('arch')}>⚡ Flink SQL 实时管道</button>
          <button className={`de-btn ${codeTab === 'ch' ? 'primary' : ''}`} style={{ borderColor: codeTab === 'ch' ? undefined : undefined }} onClick={() => setCodeTab('ch')}>🔵 ClickHouse 建表优化</button>
        </div>
        <div className="de-code-wrap">
          <div className="de-code-head">
            <div className="de-code-dot" style={{ background: '#ef4444' }} />
            <div className="de-code-dot" style={{ background: '#f59e0b' }} />
            <div className="de-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: '#22c55e' }}>{codeTab === 'arch' ? '⚡ End-to-End: MySQL → Flink → ClickHouse' : '🔵 ClickHouse OLAP 建表 & 查询优化'}</span>
          </div>
          <div className="de-code" style={{ fontSize: '0.73rem', maxHeight: 420, overflowY: 'auto' }}>
            {codeTab === 'arch' ? ARCH_CODE : CLICKHOUSE_CODE}
          </div>
        </div>
      </div>

      {/* 上线清单 */}
      <div className="de-section">
        <h2 className="de-section-title">✅ 生产上线清单（{done}/{CHECKLIST.length} 完成）</h2>
        <div className="de-meter" style={{ marginBottom: '0.75rem', height: 8 }}>
          <div className="de-meter-fill" style={{ width: `${(done / CHECKLIST.length) * 100}%`, background: 'linear-gradient(90deg,#0369a1,#0ea5e9,#22c55e)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '0.3rem' }}>
          {CHECKLIST.map((item, i) => (
            <div key={i} onClick={() => toggle(i)}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.55rem 0.75rem', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.13s',
                background: checklist[i] ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${checklist[i] ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.05)'}` }}>
              <div style={{ width: 16, height: 16, border: `1.5px solid ${checklist[i] ? '#22c55e' : '#1e4060'}`, borderRadius: '3px', background: checklist[i] ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900, color: '#000', flexShrink: 0, marginTop: 2 }}>
                {checklist[i] ? '✓' : ''}
              </div>
              <span style={{ fontSize: '0.77rem', color: checklist[i] ? '#22c55e' : '#1e4060' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 结课 */}
      <div className="de-section">
        <div className="de-card" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.07), rgba(34,197,94,0.04))', borderColor: 'rgba(14,165,233,0.3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成 数据工程 & 实时计算 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.4rem', textAlign: 'left' }}>
            {['✅ Lambda/Kappa/流批一体三大架构选型', '✅ Kafka Partition/Consumer Group/Offset', '✅ Kafka Streams KStream/KTable/窗口聚合', '✅ Flink Watermark事件时间动画演示', '✅ Spark DataFrame/SQL/Streaming/MLlib', '✅ Debezium CDC + Delta Lake + Airflow', '✅ Consumer Lag实时监控+背压处理专项', '✅ 完整电商实时大屏端到端实现'].map(s => (
              <div key={s} style={{ fontSize: '0.8rem', color: '#1e4060' }}>{s}</div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            🏆 推荐认证：Confluent Certified Developer ⭐ Databricks Certified Associate ⭐ ClickHouse Certified Developer
          </div>
        </div>
      </div>

      <div className="de-nav">
        <button className="de-btn" onClick={() => navigate('/course/data-engineering/lesson/monitor')}>← 上一模块</button>
        <button className="de-btn primary" onClick={() => navigate('/course/data-engineering')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
