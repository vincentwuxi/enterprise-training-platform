import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['分片策略', '复制与容灾', 'LSM-Tree / B+Tree', '分布式文件系统'];

export default function LessonDistStorage() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🌐 module_05 — 分布式存储</div>
      <div className="fs-hero">
        <h1>分布式存储：分片 / 复制 / LSM-Tree / 一致性哈希</h1>
        <p>
          分布式存储解决<strong>单机容量和吞吐的上限</strong>——
          通过分片 (Sharding) 将数据分散到多个节点，通过复制 (Replication)
          提供容错和读扩展。底层存储引擎 (LSM-Tree vs B+Tree) 决定了读写性能特征。
          一致性哈希解决了节点动态变化时的数据迁移问题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 分布式存储深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 数据分片 (Sharding / Partitioning)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#0ea5e9'}}></span> sharding.txt</div>
                <pre className="fs-code">{`═══ 分片的目标 ═══

  → 水平扩展: 数据量超过单机容量
  → 负载均衡: 请求分散到多个节点
  → 减少影响半径: 单节点故障只影响部分数据

═══ 分片策略 ═══

1. 哈希分片 (Hash Partitioning):
   shard = hash(key) % N

   优点: 数据均匀分布
   缺点: 范围查询需要扫所有分片!
         N 变化时需要大量数据迁移

2. 范围分片 (Range Partitioning):
   用户 A-G → Shard 1
   用户 H-N → Shard 2
   用户 O-Z → Shard 3

   优点: 范围查询高效 (扫少量分片)
   缺点: 热点! (某些范围访问量大)
   例子: HBase (按 rowkey 范围)

3. 一致性哈希 (Consistent Hashing):
   节点和 key 映射到环上 (0 ~ 2³²):
   
   key 沿环顺时针找到第一个节点 → 数据归属
   
   优势:
     → 新增节点: 只迁移一部分数据
     → 删除节点: 只影响后继节点
     → 迁移量: ~K/N (K=总 key 数, N=节点数)
   
   虚拟节点 (Virtual Nodes):
     → 每个物理节点映射到 100-200 个虚拟节点
     → 解决数据倾斜问题
     → Cassandra, DynamoDB, Riak

4. 目录式分片 (Directory-Based):
   → 中心化映射表: key → shard
   → 灵活但有单点
   → MongoDB Config Server

═══ 热点问题 ═══

  问题: 某些 key 被大量访问 (明星微博, 秒杀商品)
  
  解决:
    1. key 加随机后缀: user:123 → user:123:rand(0-9)
       读时聚合所有后缀 (散列读)
    2. 本地缓存热点 key
    3. 特殊路由: 热点 key 复制到多个分片
    4. TiDB: 自动分裂热点 Region

═══ 跨分片查询 ═══

  聚合查询 (SUM, COUNT, AVG):
    → Scatter-Gather: 每个分片计算局部结果 → 汇总
    → 分析: 并行化, 延迟 = max(所有分片)

  JOIN:
    → 跨分片 JOIN 非常昂贵!
    → 策略: 数据共置 (co-locate), 相关数据放同一分片
    → CockroachDB: Range co-location`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 复制与容灾</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> replication.txt</div>
                <pre className="fs-code">{`═══ 复制拓扑 ═══

  单主复制 (Single-Leader):
    写 → Leader → 异步复制到 Follower
    读 → Leader 或 Follower
    
    同步复制: 写确认前等所有 Follower
      → 强一致, 但慢 + Follower 故障阻塞写入
    异步复制: 写确认不等 Follower
      → 快, 但 Leader 故障可能丢数据
    半同步: 至少 1 个 Follower 确认
      → MySQL semi-sync replication

  多主复制 (Multi-Leader):
    → 每个数据中心一个 Leader
    → 跨 DC 写入不阻塞
    → 冲突解决: LWW / CRDT / 自定义
    → MySQL Group Replication, CockroachDB

  无主复制 (Leaderless):
    → 写发到 W 个节点, 读从 R 个节点
    → W + R > N → 保证读到最新
    → Cassandra, DynamoDB, Riak

═══ 主从切换 (Failover) ═══

  自动 Failover 的挑战:

  1. 如何检测 Leader 故障?
     → 心跳超时 (通常 5-30s)
     → 误判风险: 网络延迟 ≠ 故障!

  2. 选择哪个 Follower?
     → 复制进度最新的 (数据丢失最少)
     → Raft: 自动选举

  3. 脑裂 (Split Brain):
     → 旧 Leader 恢复, 以为自己还是 Leader
     → 两个 Leader 同时写入 → 数据冲突!
     → 解决: Fencing Token (旧 Leader 的 token 失效)

  4. 数据丢失:
     → 异步复制: 新 Leader 可能缺少最新数据
     → GitHub 2012 事件: MySQL 主从切换丢数据

═══ 多数据中心复制 ═══

  Active-Passive:
    → 主 DC 处理所有写入
    → 备 DC 只读 + 灾备
    → 切换时间: 分钟级

  Active-Active:
    → 多个 DC 同时处理写入
    → 需要冲突解决
    → 切换: 秒级 (DNS/负载均衡)
    → CockroachDB, Spanner

  RPO vs RTO:
    RPO (Recovery Point Objective):
      → 最多丢失多少数据 (最后备份到故障的时间)
      → 同步复制: RPO ≈ 0
      → 异步复制: RPO = 复制延迟
    
    RTO (Recovery Time Objective):
      → 恢复服务需要多长时间
      → 自动 Failover: RTO < 30s
      → 手动 Failover: RTO = 分钟到小时`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌲 存储引擎: LSM-Tree vs B+Tree</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> storage_engines.txt</div>
                <pre className="fs-code">{`═══ B+Tree (传统数据库) ═══

  结构: 平衡搜索树, 内节点存 key, 叶节点存数据
  
  写入: 找到叶节点 → 原地更新 (in-place update)
    → 需要随机 I/O!
    → WAL (Write-Ahead Log) 保证崩溃恢复
  
  读取: 从根到叶, O(log N)
    → 3-4 层 ≈ 3-4 次磁盘 I/O
    → 内部节点通常在内存中 → 1-2 次 I/O
  
  优势: 读快 (原地存储, 没有冗余)
  劣势: 写有随机 I/O (SSD 友好, HDD 慢)
  
  使用: MySQL InnoDB, PostgreSQL, SQLite

═══ LSM-Tree (Log-Structured Merge-Tree) ═══

  核心思想: 将随机写转换为顺序写

  写入流程:
    1. 写入 MemTable (内存, 有序结构, 如红黑树)
    2. MemTable 满 → flush 到磁盘 (SSTable, 有序文件)
    3. 后台 Compaction: 合并多个 SSTable

  读取流程:
    1. 查 MemTable
    2. 查最新 SSTable → 次新 → ...
    3. Bloom Filter: 快速判断 key 是否在某 SSTable
       → 避免无效的磁盘读取

  Compaction 策略:
    Size-Tiered (STCS):
      → 类似大小的 SSTable 合并
      → 空间放大大 (最坏 2x)
      → Cassandra 默认

    Leveled (LCS):
      → 分层, 每层大小是上层的 10x
      → 空间放大小 (~1.1x)
      → 读放大小 (每层最多一个 SSTable 匹配)
      → RocksDB 默认

  放大因子:
    写放大 (Write Amplification):
      → 一次逻辑写 → 多次物理写 (Compaction)
      → LSM: 10-30x (取决于层数和压缩策略)
      → SSD 寿命消耗!

    读放大 (Read Amplification):
      → 一次逻辑读 → 多次物理读 (查多层)
      → Bloom Filter 大幅缓解

    空间放大 (Space Amplification):
      → 数据冗余 (未合并的旧版本)
      → Leveled 优于 Size-Tiered

═══ 对比总结 ═══

              │ B+Tree      │ LSM-Tree
  ────────────┼─────────────┼──────────────
  写入模式    │ 随机写      │ 顺序写
  写吞吐      │ 中          │ 高 (5-10x)
  读延迟      │ 低 (确定)   │ 中 (可变)
  空间效率    │ 好          │ 中 (碎片)
  写放大      │ 低          │ 高 (10-30x)
  范围扫描    │ 高效        │ 较慢
  事务支持    │ 原生        │ 复杂
  代表        │ InnoDB      │ RocksDB
              │ PostgreSQL  │ LevelDB
              │             │ Cassandra`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📁 分布式文件系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> dfs.txt</div>
                <pre className="fs-code">{`═══ GFS / HDFS 架构 ═══

  Google File System (2003) / Hadoop DFS:

  架构:
    Master (NameNode):
      → 元数据: 文件名 → Chunk 列表
      → Chunk 位置: Chunk → DataNode 映射
      → 单点! (HDFS HA: Active/Standby NameNode)
    
    ChunkServer (DataNode):
      → 存储 Chunk (默认 64MB/128MB)
      → 每个 Chunk 3 副本

  写入:
    1. Client → Master: 创建文件
    2. Master 返回 Chunk 位置
    3. Client → Primary ChunkServer: 写数据
    4. Primary → Secondary: 链式复制
    5. 所有确认 → 写入成功

  适用: 大文件, 追加写, 批量读
  不适用: 小文件, 随机写, 低延迟

═══ 对象存储 (S3 / MinIO) ═══

  与文件系统的区别:
    → 扁平命名空间 (Bucket + Key, 无目录层次)
    → 不可变 (PUT 整个对象, 无部分更新)
    → HTTP API (GET/PUT/DELETE)
    → 按用量计费

  S3 一致性 (2020 年 12 月后):
    → 强一致! (PUT/DELETE 后 GET 立即可见)
    → 之前是最终一致 (读到旧版本)

  MinIO:
    → S3 兼容的开源对象存储
    → Erasure Coding: 数据 + 校验分片
    → 比 3 副本更省空间 (1.5x vs 3x)

═══ 新一代存储架构 ═══

  存算分离 (Disaggregated Storage):
    传统: 计算 + 存储在同一节点
    新: 计算层 (无状态) + 存储层 (共享)
    
    优势:
      → 独立扩展计算和存储
      → 弹性伸缩 (云友好)
      → 存储层: S3, EBS, Ceph
    
    代表:
      → Snowflake (数仓)
      → TiDB + S3 (TiFlash)
      → CockroachDB on S3 (实验)

  Tiered Storage:
    热数据: SSD (快, 贵)
    温数据: HDD (慢, 便宜)
    冷数据: S3 / Glacier (最慢, 最便宜)
    
    → Kafka Tiered Storage
    → Elasticsearch Frozen Tier

═══ 一致性哈希变体 ═══

  Jump Consistent Hash:
    → 无需存储映射表
    → O(ln n) 时间计算
    → Google 论文 (2014)
    → 适合: 节点数固定或很少变化

  Rendezvous Hashing (HRW):
    → key 与每个节点计算权重
    → 选权重最高的节点
    → 节点变化时迁移量最小
    → 适合: CDN 负载均衡

  Multi-Probe Consistent Hashing:
    → Google 的改进
    → 多次 hash 取最近节点
    → 比虚拟节点更均匀`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
