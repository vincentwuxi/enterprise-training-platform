import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['一致性层级', '最终一致性', 'CRDT', '实际系统'];

export default function LessonConsistency() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🌐 module_03 — 一致性模型</div>
      <div className="fs-hero">
        <h1>一致性模型：强一致 / 最终一致 / 因果 / CRDT</h1>
        <p>
          一致性模型定义了分布式系统中<strong>"读操作能看到什么"</strong>——
          从最强的线性一致性 (Linearizability) 到最弱的最终一致性 (Eventual Consistency)，
          理解这个谱系是做出正确架构权衡的关键。
          CRDT (无冲突复制数据类型) 在不需要协调的前提下提供强最终一致性。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 一致性模型深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 一致性层级</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#0ea5e9'}}></span> consistency_levels.txt</div>
                <pre className="fs-code">{`═══ 一致性模型谱系 (从强到弱) ═══

  严格一致性 (Strict)           ← 理论上的, 需要全局时钟
  ────────────────────────────────
  线性一致性 (Linearizability)  ← 最强实际可实现
  ────────────────────────────────
  顺序一致性 (Sequential)       ← 弱于线性
  ────────────────────────────────
  因果一致性 (Causal)           ← 保持因果序
  PRAM 一致性                   ← 保持单客户端序
  ────────────────────────────────
  最终一致性 (Eventual)         ← 最弱

═══ 线性一致性 (Linearizability) ═══

  也叫: 原子一致性, 强一致性
  
  定义:
    1. 每个操作看起来在其调用和完成之间的某个时刻原子执行
    2. 所有操作的全序与实时顺序一致
  
  直觉:
    → 系统表现得像只有一个副本
    → 一旦写入被确认, 所有后续读取都能看到

  时间线:
    Client A: |--- Write(x=1) ---|
    Client B:            |--- Read(x) ---|
                                → 必须返回 1!
                                   (因为读的调用在写的完成之后)

  实现代价:
    → 需要共识 (Raft/Paxos): 写延迟 = 多数确认
    → 读也需要共识 (或 ReadIndex/LeaseRead)
    → 性能最差, 但保证最强
    → Spanner, etcd, CockroachDB

═══ 顺序一致性 (Sequential Consistency) ═══

  Lamport, 1979:
  
  定义:
    所有操作的某个全序排列, 满足:
    1. 单个进程内的操作顺序被保持
    2. 不要求与实时顺序一致
  
  vs 线性一致性:
    线性: Write(x=1) →实时→ Read(x) 必须看到 1  
    顺序: 允许 Read(x) 在全序中排在 Write 之前
         (即使实时时间上 Read 更晚)

  实际影响:
    → CPU 内存模型 (x86-TSO ≈ 顺序一致)
    → ZooKeeper 的单客户端顺序保证

═══ 因果一致性 (Causal Consistency) ═══

  只保持有因果关系的操作的顺序:
  
  如果 A causally-before B:
    → 所有节点先看到 A 再看到 B
  
  并发操作:
    → 不同节点可以看到不同顺序!

  实现:
    → 向量时钟追踪因果关系
    → COPS (Columbia), Eiger (Facebook)
    → MongoDB 的因果读写 (causally consistent sessions)

  优势:
    → 比线性一致性快得多 (不需要全局协调)
    → 比最终一致性强 (不会看到因果违规)
    → 对很多应用来说 "足够好"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⏳ 最终一致性</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> eventual_consistency.txt</div>
                <pre className="fs-code">{`═══ 最终一致性 (Eventual Consistency) ═══

  定义:
    如果没有新的更新, 最终所有副本会收敛到相同状态
  
  不保证:
    → 收敛需要多长时间 (可能秒、分钟、甚至小时)
    → 中间状态是什么 (可能读到旧值)
    → 不同客户端看到的顺序 (可能不一致)
  
  经典场景:
    DNS: 更新后需要 TTL 时间传播
    CDN: 缓存失效周期
    S3: 曾经是最终一致 (现在是强一致!)

═══ 冲突解决策略 ═══

  多个并发写入 → 冲突! 怎么办?

  1. Last-Write-Wins (LWW):
     → 时间戳最大的写入胜出
     → 简单, 但可能丢失写入!
     → Cassandra 默认策略
     → 问题: 时钟偏差 → 错误的 "最后"

  2. 多值 (Multi-Value):
     → 保留所有冲突版本 (兄弟值 / siblings)
     → 由客户端或应用层解决
     → Riak 的方式
     → Amazon Dynamo: 购物车合并

  3. 应用层合并:
     → 自定义合并函数
     → 例: 购物车 → 合并所有添加的商品
     → 需要领域知识

  4. CRDT (见下一 Tab):
     → 数学保证无冲突合并
     → 不需要协调!

═══ 读写一致性保证 ═══

  应用常需要的额外保证:

  Read-Your-Writes:
    → 你的写入, 你一定能立即读到
    → 实现: 读写同一节点, 或带版本号路由
    → Session Consistency

  Monotonic Reads:
    → 不会读到比之前更旧的值
    → 实现: 带向量时钟的 session

  Monotonic Writes:
    → 你的写入按顺序执行
    → 实现: 有序提交到同一节点

  Writes-Follow-Reads:
    → 你读到 A 后基于 A 的写入, 其他人不会看到
      你的写入但看不到 A
    → 因果依赖

═══ 反熵 (Anti-Entropy) ═══

  确保副本收敛的机制:

  Read Repair:
    → 读时检测不一致, 修复过期副本
    → Cassandra, DynamoDB

  Merkle Tree:
    → 哈希树比较, 快速发现差异
    → 只传输不同的数据
    → Cassandra, Riak

  Gossip Protocol:
    → 节点间随机交换信息
    → 指数级传播: O(log N) 轮次
    → Cassandra 成员管理`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧩 CRDT (无冲突复制数据类型)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> crdt.txt</div>
                <pre className="fs-code">{`═══ CRDT 核心思想 ═══

  Conflict-Free Replicated Data Types:
  → 数学上保证: 并发操作总能自动合并
  → 不需要共识/协调! → 高可用 + 低延迟
  → 代价: 只支持特定的数据结构

  两种风格:
    State-based (CvRDT): 传播完整状态, 合并 (merge)
    Operation-based (CmRDT): 传播操作, 要求因果顺序交付

═══ 常见 CRDT 类型 ═══

G-Counter (只增计数器):
  每个节点维护自己的计数:
    Node A: [A:3, B:0, C:0]
    Node B: [A:0, B:5, C:0]
    Node C: [A:0, B:0, C:2]
  
  合并: 每个分量取 max
    merge → [A:3, B:5, C:2]
    总值 = 3 + 5 + 2 = 10
  
  递增: 只增加自己的分量

PN-Counter (增减计数器):
  两个 G-Counter: P (正) 和 N (负)
  值 = sum(P) - sum(N)

G-Set (只增集合):
  合并 = 并集 (union)
  → 元素只能添加, 不能删除

2P-Set (增删集合):
  添加集 A + 删除集 R
  元素在集合中 ⟺ 在 A 中且不在 R 中
  → 删除后不能重新添加!

OR-Set (Observed-Remove Set):
  最实用的集合 CRDT
  每个元素带有唯一标签 (tag)
  添加: 创建新标签
  删除: 删除所有已观察到的标签
  → 并发 add 和 remove → add 胜出!
  → Redis 的 CRDT 模块使用 OR-Set

LWW-Register:
  带时间戳的寄存器
  合并: 时间戳最大的值胜出
  → 最简单的 "键值" CRDT

LWW-Map / MV-Map:
  → 键值对的 CRDT
  → 每个键独立管理冲突

═══ δ-CRDT ═══

  优化: 不传输完整状态, 只传输增量 (δ)
  → 减少网络带宽
  → 多个增量可以合并后一起发送

═══ 实际应用 ═══

  Redis Enterprise: CRDT for Geo-distributed
  Riak: 全面的 CRDT 支持
  Figma: 协同编辑使用 CRDT
  Apple Notes: CRDT 同步
  Automerge: CRDT 库 (JS/Rust)
  Yjs: CRDT for real-time collaboration`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏢 实际系统的一致性选择</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> real_systems.txt</div>
                <pre className="fs-code">{`═══ 数据库一致性对比 ═══

  系统           │ 默认          │ 可选
  ───────────────┼───────────────┼──────────────
  Spanner        │ 线性一致      │ —
  CockroachDB    │ 序列化隔离    │ —
  etcd           │ 线性一致      │ —
  ZooKeeper      │ 顺序一致      │ 线性 (sync)
  MongoDB        │ 最终一致      │ 因果/线性
  Cassandra      │ 最终一致      │ Quorum 可调
  DynamoDB       │ 最终一致      │ 强一致读
  Redis Cluster  │ 最终一致      │ WAIT 命令

═══ 可调一致性 (Tunable Consistency) ═══

  Cassandra 的 Consistency Level:
    ONE:    写/读 1 个节点确认
    QUORUM: 写/读 ⌊N/2⌋+1 个节点确认
    ALL:    写/读 所有节点确认
    LOCAL_QUORUM: 本地 DC 内 Quorum

  配置示例 (N=3):
    W=QUORUM(2), R=QUORUM(2): 强一致 (W+R>N)
    W=ONE(1), R=ALL(3): 强一致但写快读慢
    W=ONE(1), R=ONE(1): 最终一致, 最快

═══ 一致性 vs 性能权衡 ═══

  强一致 (线性):
    延迟: 高 (需要多数确认, 跨区域 100ms+)
    吞吐: 低 (全局协调)
    适用: 金融交易, 全局锁, Leader 选举

  因果一致:
    延迟: 中 (只需因果依赖, 本地提交)
    吞吐: 中高
    适用: 社交网络, 协同编辑, 评论系统

  最终一致:
    延迟: 低 (本地写入, 异步复制)
    吞吐: 高
    适用: CDN, DNS, 购物车, 指标收集

═══ 常见陷阱 ═══

  1. "我们用了 3 副本, 所以是强一致的"
     → 错! 需要 Quorum 读 + 写, 不只是复制

  2. "Redis 主从是强一致的"
     → 错! 默认异步复制, Leader 故障可能丢数据
     → WAIT 命令可以等待复制, 但不保证

  3. "DynamoDB 是最终一致的"
     → 不全对! 可以指定 ConsistentRead=true
     → 但只对单个分区有效

  4. "微服务 API 调用后数据立即可见"
     → 很可能不是! 异步事件/消息 → 最终一致
     → 解决: 显式读自己的写 (会话亲和)

  5. "Cassandra QUORUM 就是线性一致"
     → 不是! Quorum 只保证读到最新 写入
     → 但不保证操作的实时全序 (compare-and-swap)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
