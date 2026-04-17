import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Paxos', 'Raft', 'Zab 与变体', 'BFT 与区块链'];

export default function LessonConsensus() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🌐 module_02 — 共识算法</div>
      <div className="fs-hero">
        <h1>共识算法：Paxos / Raft / Zab / PBFT</h1>
        <p>
          共识 (Consensus) 是分布式系统的<strong>核心问题</strong>——
          让多个节点在某个值上达成一致。Paxos 是理论基石但难以理解和实现，
          Raft 以可理解性为目标成为工业标准 (etcd/Consul/TiKV)，
          Zab 服务于 ZooKeeper，PBFT 处理拜占庭故障 (区块链)。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 共识算法深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📜 Paxos (Lamport, 1989)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#0ea5e9'}}></span> paxos.txt</div>
                <pre className="fs-code">{`═══ 共识问题的形式化 ═══

  Safety (安全性):
    1. 只有被提议的值才能被选定 (Validity)
    2. 只有一个值被选定 (Agreement)
    3. 只有值被选定后, 进程才能获知 (Integrity)
  
  Liveness (活性):
    4. 最终会有值被选定 (Termination)
    → FLP: 异步模型中无法同时保证 Safety + Liveness

═══ Basic Paxos — 单值共识 ═══

三种角色:
  Proposer  — 提议一个值
  Acceptor  — 接受/拒绝提议
  Learner   — 学习最终结果

两阶段协议:

Phase 1: Prepare (准备)
  Proposer:
    1. 选择提案号 n (全局唯一, 递增)
    2. 发送 Prepare(n) 给多数 Acceptor

  Acceptor 收到 Prepare(n):
    如果 n > 之前承诺的最大提案号:
      1. 承诺不再接受 <n 的提案
      2. 返回: Promise(n, 之前已接受的最大提案)
    否则:
      拒绝 (或忽略)

Phase 2: Accept (接受)
  Proposer 收到多数 Promise:
    1. 如果有返回已接受的提案:
       使用最高编号的已接受值 (不能用自己的!)
    2. 否则: 使用自己提议的值
    3. 发送 Accept(n, v) 给多数 Acceptor

  Acceptor 收到 Accept(n, v):
    如果 n >= 之前承诺的最大提案号:
      接受! 记录 (n, v)
    否则:
      拒绝

═══ 为什么 Paxos 是正确的? ═══

  关键不变式:
    如果提案 (n₁, v₁) 被多数接受,
    则任何更高编号的被选定提案 (n₂, v₂) 必有 v₂ = v₁

  证明直觉:
    n₂ 的 Prepare 阶段必然联系到多数节点
    → 与接受 n₁ 的多数节点有交集
    → 至少一个节点会返回 (n₁, v₁)
    → Proposer 必须使用 v₁

═══ Paxos 的问题 ═══

  1. 活锁 (Livelock):
     两个 Proposer 互相打断:
     P1: Prepare(1) → 成功
     P2: Prepare(2) → 成功 (覆盖 P1 的承诺)
     P1: Accept(1) → 失败!
     P1: Prepare(3) → 成功 (覆盖 P2 的承诺)
     P2: Accept(2) → 失败!
     → 解决: 随机退避 + Leader 选举

  2. 只决定一个值 (Basic Paxos):
     → Multi-Paxos: 日志中每个位置运行一次 Paxos
     → 但 Multi-Paxos 的工程细节非常多

  3. 难以理解和实现:
     → Lamport 的原论文 "The Part-Time Parliament" 晦涩
     → "Paxos Made Simple" 依然不简单
     → 工程实现: Google Chubby, 但代码量巨大`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗳️ Raft (Ongaro & Ousterhout, 2014)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> raft.txt</div>
                <pre className="fs-code">{`═══ Raft 设计哲学: 可理解性 > 效率 ═══

  三个子问题:
    1. Leader 选举 (Leader Election)
    2. 日志复制 (Log Replication)
    3. 安全性 (Safety)

═══ 1. Leader 选举 ═══

  三种状态: Follower → Candidate → Leader

  正常状态: 1 个 Leader, 其余 Follower
  Leader 周期性发送心跳 (AppendEntries RPC)
  
  选举触发: Follower 超时未收到心跳
    1. Follower → Candidate
    2. 自增任期 (term), 投票给自己
    3. 发送 RequestVote RPC 给所有节点
    4. 收到多数票 → Leader!
       收到更高 term 的消息 → Follower
       超时 → 重新选举 (新 term)
  
  投票规则:
    → 每个 term 最多投一票 (先到先得)
    → 只投给日志至少和自己一样新的 Candidate
      (最后日志条目的 term 更大, 或 term 相同但更长)
    → 保证: 新 Leader 包含所有已提交的日志!

  选举超时: 随机化 (150-300ms)
    → 避免多个节点同时成为 Candidate
    → 通常只需一轮选举即可成功

═══ 2. 日志复制 ═══

  客户端请求 → Leader:
    1. Leader 追加日志条目 (index, term, command)
    2. 发送 AppendEntries 给所有 Follower
    3. 多数节点确认 → 标记为 committed
    4. 应用到状态机 → 回复客户端

  AppendEntries RPC:
    → prevLogIndex + prevLogTerm: 一致性检查
    → 如果 Follower 的 prevLogIndex 位置不匹配
      → Leader 递减 prevLogIndex 重试
      → 最终找到匹配点, 覆盖 Follower 的冲突日志

  日志匹配性质:
    如果两个日志在相同 index 有相同 term
    → 该 index 的命令相同
    → 该 index 之前的所有日志都相同

═══ 3. 安全性保证 ═══

  Election Safety: 每个 term 最多一个 Leader
  Leader Append-Only: Leader 不会覆盖自己的日志
  Log Matching: 如果两个日志条目 (index, term) 相同
                → 之前的所有条目也相同
  Leader Completeness: 已 committed 的日志一定在新 Leader 中
  State Machine Safety: 已应用的日志不会被撤销

═══ 工业实现 ═══

  etcd (CoreOS/K8s):     Go, 最成熟的 Raft 实现
  Consul (HashiCorp):    Go, 服务发现 + KV
  TiKV (PingCAP):        Rust, 分布式 KV (TiDB 底层)
  CockroachDB:           Go, Multi-Raft
  RethinkDB:             C++, 分布式数据库
  LogCabin:              C++, Raft 论文作者的参考实现
  
  性能:
    → Leader 切换: 约 150-300ms (选举超时)
    → 日志提交: 1-2 RTT
    → 吞吐: 单个 Raft 组 ~10K-100K ops/s
    → 扩展: Multi-Raft (TiKV: 每个 Region 一个 Raft 组)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 Zab 与 Multi-Paxos 变体</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> zab_variants.txt</div>
                <pre className="fs-code">{`═══ Zab (ZooKeeper Atomic Broadcast) ═══

  专为 ZooKeeper 设计:
  → 与 Paxos 类似, 但有关键差异
  → 保证: 状态变更的全序广播

  两阶段:
    1. 发现 (Discovery): 选举 Leader
    2. 同步 (Synchronization): Leader 同步历史
    3. 广播 (Broadcast): Leader 接收写请求, 广播

  Zab vs Raft:
    → Zab: 嵌套事务 ID (epoch, counter)
    → Raft: (term, index)
    → 都是 Leader-Based 复制
    → Zab 在 Leader 切换时更复杂

═══ Multi-Paxos ═══

  Basic Paxos 只决定一个值
  Multi-Paxos: 日志中每个位置 (slot) 运行一次 Paxos

  优化: 稳定 Leader
    → Leader 选定后, 跳过 Prepare 阶段
    → 直接发送 Accept → 一个 RTT 提交!
    → Leader 切换时才需要完整 Prepare

  Google Chubby:
    → Multi-Paxos 实现
    → 分布式锁服务
    → 内部使用: Bigtable, GFS Master 选主

═══ EPaxos (Egalitarian Paxos) ═══

  无 Leader 的共识算法:
  → 任何节点都可以提交命令
  → 只有在命令冲突时需要额外轮次
  
  优势:
    → 无 Leader 瓶颈
    → 更低的广域网延迟 (就近提交)
    → 负载均衡

  劣势:
    → 实现极其复杂
    → 冲突时延迟增加
    → 理解和调试困难

═══ Viewstamped Replication (VR) ═══

  早于 Paxos 的复制协议 (1988):
  → View-Change 协议处理 Leader 切换
  → 与 Raft 非常相似!
  → Raft 论文承认受 VR 启发

═══ 算法对比 ═══

                │ Paxos      │ Raft       │ Zab
  ──────────────┼────────────┼────────────┼───────────
  可理解性      │ 困难       │ 容易       │ 中等
  Leader        │ 可选       │ 必须       │ 必须
  提交延迟      │ 1-2 RTT   │ 1 RTT     │ 1 RTT
  日志连续      │ 允许空洞   │ 连续       │ 连续
  成员变更      │ 复杂       │ Joint      │ 复杂
  工业实现      │ Chubby     │ etcd/TiKV  │ ZooKeeper
  论文清晰度    │ ★☆☆☆☆     │ ★★★★★     │ ★★★☆☆`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ 拜占庭容错 (BFT)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> bft.txt</div>
                <pre className="fs-code">{`═══ 拜占庭将军问题 (Lamport, 1982) ═══

  N 个将军需要协商进攻/撤退
  最多 f 个叛徒 (可以发送矛盾消息)
  → 需要 N ≥ 3f + 1 个将军

  为什么 3f+1?
    f 个拜占庭节点 → 需要 2f+1 个正确节点
    但正确节点中可能有 f 个暂时不可达
    → 需要 f + (2f+1) = 3f+1 个节点

═══ PBFT (Practical BFT, 1999) ═══

  Miguel Castro & Barbara Liskov

  三阶段:
    1. Pre-prepare: Leader 分配序号, 广播提议
    2. Prepare: 每个节点广播 Prepare 消息
       → 收到 2f+1 个 Prepare → prepared
    3. Commit: 每个节点广播 Commit 消息
       → 收到 2f+1 个 Commit → committed

  视图变更 (View Change):
    → 怀疑 Leader 是拜占庭节点
    → 收集 2f+1 个 View-Change 消息
    → 新 Leader 接管

  性能:
    → 通信复杂度: O(n²)  (所有节点互相通信)
    → 适合小规模: <20 个节点
    → 不适合: 大规模公开网络

═══ 区块链共识 ═══

  Nakamoto Consensus (Bitcoin, 2008):
    → 工作量证明 (Proof of Work)
    → 概率性终局 (6 个确认 ≈ 安全)
    → 最长链规则
    → 吞吐: ~7 TPS, 确认: ~60 分钟
    → 能耗巨大

  Proof of Stake (Ethereum 2.0):
    → 质押代替算力
    → 验证者随机选择
    → Casper FFG: finality gadget
    → 吞吐: ~30 TPS, 确认: ~12 秒

  BFT 变体 (联盟链):
    Tendermint (Cosmos):
      → PBFT 变体, 确定性终局
      → 适合联盟链: 100+ 验证者
    HotStuff (Facebook Libra/Diem):
      → 线性通信复杂度 O(n)
      → Pipelined: 多个阶段并行

═══ CFT vs BFT 选型 ═══

  CFT (Crash Fault Tolerant):
    → 假设节点诚实但可能崩溃
    → Paxos / Raft
    → 内部系统: 自己控制所有节点

  BFT (Byzantine Fault Tolerant):
    → 假设节点可能恶意
    → PBFT / HotStuff
    → 跨组织: 不信任的参与者
    → 区块链: 完全不信任的环境

  BFT 的代价:
    → 需要更多节点 (3f+1 vs 2f+1)
    → 更高通信复杂度
    → 更大延迟
    → 除非必要, 不要用 BFT!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
