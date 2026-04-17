import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['MapReduce', 'Spark', '流处理', '计算框架对比'];

export default function LessonDistComputing() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🌐 module_06 — 分布式计算</div>
      <div className="fs-hero">
        <h1>分布式计算：MapReduce / Spark / Stream Processing</h1>
        <p>
          分布式计算将<strong>大规模数据处理作业</strong>分配到集群中并行执行。
          MapReduce 奠基了批处理范式，Spark 以内存计算取代磁盘 shuffle 实现数量级提升，
          Flink/Kafka Streams 则开创了事件驱动的实时流处理。
          理解其核心——分区、Shuffle、容错——是大数据系统设计的基础。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 分布式计算深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗺️ MapReduce (Google, 2004)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#0ea5e9'}}></span> mapreduce.txt</div>
                <pre className="fs-code">{`═══ MapReduce 编程模型 ═══

  用户只需定义两个函数:

  map(key, value) → list of (key2, value2)
  reduce(key2, list of value2) → list of (key3, value3)

  框架负责:
    → 分区 (Partitioning)
    → 排序 (Sorting)
    → Shuffle (传输到 Reducer)
    → 容错 (重新执行失败的 Task)

═══ WordCount 经典示例 ═══

  输入: "hello world hello spark"

  Map 阶段:
    "hello world hello spark"
    → ("hello", 1), ("world", 1), ("hello", 1), ("spark", 1)

  Shuffle & Sort:
    → "hello": [1, 1]
    → "spark": [1]
    → "world": [1]

  Reduce 阶段:
    → ("hello", 2), ("spark", 1), ("world", 1)

═══ 执行流程 ═══

  1. 输入分片 (Input Split):
     → 每个 HDFS Block (128MB) 一个 Map Task
     → 1TB 数据 ≈ 8000 个 Map Task

  2. Map:
     → 每个 Task 读取本地数据 (数据局部性!)
     → 输出写到本地磁盘 (不写 HDFS)

  3. Shuffle:
     → 按 key 的 hash 分配到 Reducer
     → 网络传输 (最大瓶颈!)
     → Combiner: Map 端预聚合, 减少传输量
       ("hello", 1), ("hello", 1) → ("hello", 2)

  4. Sort:
     → 每个 Reducer 对收到的数据排序
     → 相同 key 的数据连续排列

  5. Reduce:
     → 对每个 key 的 values 执行聚合
     → 输出写 HDFS (3 副本)

═══ 容错机制 ═══

  Map Task 失败:
    → 重新执行 (输入在 HDFS, 可重读)
    → 已完成的输出在本地磁盘, 丢失也重算

  Reduce Task 失败:
    → 重新执行 (从 Map 输出重新拉数据)
    → 如果 Map 节点也挂了 → Map 也重算

  Straggler (慢节点):
    → 推测执行 (Speculative Execution)
    → 在另一个节点启动相同 Task
    → 谁先完成用谁的结果

═══ MapReduce 的局限 ═══

  1. 中间结果写磁盘:
     → 每个 MapReduce 的输出 → HDFS → 下个阶段读取
     → 磁盘 I/O 成为瓶颈
     → 迭代算法 (ML/图计算) 极慢

  2. 只有 Map 和 Reduce 两个原语:
     → 复杂 DAG 需要多轮 MapReduce
     → 每轮都写磁盘 → 延迟累积

  3. 不支持实时处理:
     → 批处理: 输入 → 处理 → 输出
     → 延迟: 分钟到小时
     → 不适合实时分析`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Apache Spark</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> spark.txt</div>
                <pre className="fs-code">{`═══ Spark 核心创新: RDD ═══

  Resilient Distributed Dataset:
    → 不可变的分布式数据集合
    → 惰性计算 (Lazy Evaluation)
    → 内存计算 (中间结果不写磁盘!)
    → 容错: 通过 Lineage (血统) 重算, 而非复制

  Transformation (惰性, 不立即执行):
    → map, filter, flatMap, groupByKey, reduceByKey
    → join, union, distinct, sortByKey

  Action (触发执行):
    → collect, count, first, take, saveAsTextFile
    → reduce, foreach

═══ Spark 执行模型 ═══

  算子:
    Narrow Dependency (窄依赖):
      → 每个父分区只对应一个子分区
      → map, filter, union
      → 可以流水线 (Pipeline) 执行

    Wide Dependency (宽依赖):
      → 一个父分区对应多个子分区 (Shuffle!)
      → groupByKey, reduceByKey, join
      → 需要网络传输, 产生新的 Stage

  DAG Scheduler:
    → 用户代码 → DAG (有向无环图)
    → 以 Shuffle 为界划分 Stage
    → 每个 Stage 内部可以流水线执行
    → Stage 间需要等待 Shuffle

  WordCount (Spark):
    sc.textFile("hdfs://...")           // RDD
      .flatMap(line => line.split(" ")) // Narrow
      .map(word => (word, 1))           // Narrow
      .reduceByKey(_ + _)               // Wide (Shuffle!)
      .saveAsTextFile("output")         // Action

═══ Spark SQL / DataFrame ═══

  DataFrame = 带 Schema 的 RDD
    → Catalyst 优化器: 查询优化 (谓词下推, 列裁剪)
    → Tungsten: 内存管理 + 代码生成
    → 比 RDD API 快 2-5x

  Spark SQL 示例:
    spark.sql("
      SELECT city, COUNT(*) as cnt
      FROM orders
      WHERE amount > 100
      GROUP BY city
      ORDER BY cnt DESC
    ")
    → 自动优化: 先过滤再聚合 → 减少 Shuffle

═══ Spark vs MapReduce 性能 ═══

  迭代算法 (如 PageRank, K-Means):
    → MapReduce: 每次迭代写磁盘 → 100x 慢!
    → Spark: 数据在内存 → 1 次读 + N 次迭代
    → Spark: 10-100x faster

  单次 ETL:
    → 差异不大 (Shuffle 仍是瓶颈)
    → Spark ≈ 2-3x faster (流水线优化)

  内存不足时:
    → Spark 溢出到磁盘 (≈ MapReduce 速度)
    → 但比 MapReduce 多了内存管理开销`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌊 流处理 (Stream Processing)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> streaming.txt</div>
                <pre className="fs-code">{`═══ 批处理 vs 流处理 ═══

  批处理 (Batch):
    → 处理有界数据集 (bounded)
    → 高吞吐, 高延迟 (分钟~小时)
    → MapReduce, Spark Batch

  流处理 (Stream):
    → 处理无界数据流 (unbounded)
    → 低延迟 (毫秒~秒)
    → Flink, Kafka Streams, Spark Streaming

  Lambda 架构:
    → 批处理层 (准确, 慢) + 流处理层 (近似, 快)
    → 两套代码, 维护成本高!

  Kappa 架构:
    → 只有流处理层
    → 重新消费 Kafka 日志 = 批处理
    → Flink 的设计哲学

═══ Apache Flink ═══

  核心特性:
    → 真正的事件驱动流处理 (不是微批!)
    → 有状态计算 + Exactly-Once 语义
    → 事件时间处理 (Event Time)
    → 统一批流处理 (Table API / SQL)

  窗口 (Window):
    Tumbling Window: 固定大小, 无重叠
      [0-5min] [5-10min] [10-15min]
    
    Sliding Window: 固定大小, 有重叠
      [0-5min] [2-7min] [4-9min]  (步长 2min)
    
    Session Window: 按活动间隔
      用户 5 分钟无操作 → 结束会话
    
    Global Window: 手动触发

  水印 (Watermark):
    → 事件可能延迟到达 (乱序)
    → Watermark = "预计不会再有比这更早的事件"
    → Watermark(t) 到达 → 触发 t 之前的窗口计算
    → 迟到事件: 丢弃 / 更新 / Side Output

═══ Exactly-Once 语义 ═══

  三种语义:
    At-Most-Once:  消息最多处理一次 (可能丢)
    At-Least-Once: 消息至少处理一次 (可能重复)
    Exactly-Once:  消息恰好处理一次

  Flink 的 Exactly-Once:
    1. Checkpoint: 定期快照算子状态
       → Chandy-Lamport 分布式快照算法
       → Barrier 在数据流中传播
       → 所有算子收到 Barrier → 保存状态
    
    2. 恢复: 从最近 Checkpoint 恢复
       → 重放 Kafka 中的消息 (从 Checkpoint offset)
       → 状态恢复到 Checkpoint 时刻

    3. 端到端 Exactly-Once:
       → Kafka → Flink → Kafka: 2PC
       → Flink 作为 Kafka 事务生产者

═══ Kafka Streams ═══

  嵌入式流处理库 (不是独立集群!):
    → 直接在 Java/Kotlin 应用中使用
    → 无需 YARN/K8s, 部署为普通 JVM 进程
    → 状态存储: RocksDB (嵌入式)
    → Exactly-Once via Kafka 事务
    → 适合: 微服务中的流处理`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 计算框架对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> comparison.txt</div>
                <pre className="fs-code">{`═══ 框架对比矩阵 ═══

              │ MapReduce │ Spark     │ Flink     │ Kafka Streams
  ────────────┼───────────┼───────────┼───────────┼─────────────
  模型        │ 批处理    │ 批+微批   │ 流+批     │ 流处理
  延迟        │ 分钟~小时 │ 秒~分钟   │ 毫秒~秒   │ 毫秒~秒
  状态管理    │ 无        │ 有限      │ 完整      │ RocksDB
  容错        │ 重算      │ 重算+检查 │ Checkpoint│ Kafka 事务
  编程模型    │ Map+Reduce│ RDD/DF/SQL│ DataStream│ KStream/KTable
  部署        │ YARN      │ YARN/K8s  │ YARN/K8s  │ 嵌入式
  成熟度      │ 遗留      │ 最成熟    │ 快速增长  │ 轻量级

═══ Shuffle — 分布式计算的瓶颈 ═══

  Shuffle = 按 key 将数据重新分配到不同节点
  
  MapReduce Shuffle:
    Map → 分区 → 排序 → 写磁盘
    → 网络传输                    ← 瓶颈!
    Reduce → 合并排序 → 处理
  
  Spark Shuffle:
    Sort-Based Shuffle (默认):
      → Map 输出排序 → 写磁盘
      → Reduce 拉取 → 合并
    Tungsten Shuffle:
      → 堆外内存 → 减少 GC
  
  优化手段:
    → Map 端预聚合 (Combiner)
    → 压缩 (LZ4, Snappy, Zstd)
    → 数据局部性 (尽量本地读)
    → Broadcast Join (小表广播, 避免 Shuffle!)

═══ 现代数据架构趋势 ═══

  Data Lakehouse:
    → 数据湖 (S3/HDFS) + 数据仓库功能
    → Delta Lake (Databricks)
    → Apache Iceberg
    → Apache Hudi
    → ACID on 数据湖!

  Ray:
    → 通用分布式计算框架
    → 不仅是数据处理, 还有 ML 训练 / 推理
    → Actor 模型 + Task 模型
    → OpenAI 用 Ray 训练 GPT

  Presto / Trino:
    → 交互式查询引擎
    → 直接查询多种数据源 (HDFS, S3, MySQL)
    → 毫秒到分钟的查询延迟
    → Facebook 开源

═══ 选型指南 ═══

  "我有 TB 级日志, 做每日报表"
    → Spark Batch + Delta Lake

  "我需要实时计算用户画像"
    → Flink + Kafka

  "我需要在微服务中做流式聚合"
    → Kafka Streams (无需独立集群)

  "我需要交互式 SQL 分析"
    → Trino / Spark SQL / ClickHouse

  "我需要训练 ML 模型"
    → Spark MLlib / Ray`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
