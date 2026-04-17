import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['网络与故障模型', '时间与时钟', '理论基石', '系统模型'];

export default function LessonDistFundamentals() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🌐 module_01 — 分布式基础</div>
      <div className="fs-hero">
        <h1>分布式基础：网络模型 / 时钟 / 故障模型 / FLP</h1>
        <p>
          分布式系统的本质挑战来自三个根本约束：<strong>网络不可靠</strong>、
          <strong>没有全局时钟</strong>、<strong>节点会失败</strong>。
          理解这些基础约束和 FLP 不可能性定理，才能在设计系统时做出正确的权衡。
          CAP、BASE、PACELC 等理论框架指导着每一个工程决策。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 分布式基础深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔌 网络模型与故障模型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#0ea5e9'}}></span> network_model.txt</div>
                <pre className="fs-code">{`═══ 分布式系统的 8 个谬误 (Fallacies) ═══
Peter Deutsch, 1994:

  1. 网络是可靠的         → 消息丢失、重复、乱序
  2. 延迟为零             → 跨数据中心 100ms+
  3. 带宽是无限的         → 序列化/传输有成本
  4. 网络是安全的         → 中间人攻击、窃听
  5. 拓扑不会改变         → 节点动态加入/退出
  6. 只有一个管理员       → 多团队、多供应商
  7. 传输成本为零         → 跨 AZ/Region 流量费用
  8. 网络是同质的         → 不同硬件、不同带宽

═══ 网络通信模型 ═══

1. 同步模型 (Synchronous):
   → 消息延迟有已知上界 Δ
   → 处理时间有已知上界
   → 时钟漂移有已知上界
   → 实际系统几乎不满足!

2. 异步模型 (Asynchronous):
   → 消息延迟无上界
   → 处理时间无上界
   → 无全局时钟
   → 最强的假设, 最难设计

3. 部分同步模型 (Partially Synchronous):
   → 存在上界, 但不知道具体值
   → 或者: 系统最终会变得同步 (GST)
   → 实际系统最常见的假设
   → Raft, Paxos 都基于部分同步

═══ 故障模型 ═══

  按严重程度排列:

  1. 崩溃故障 (Crash Failure):
     → 节点停止运行, 不再发送消息
     → 最温和: 停了就是停了
     → 所有共识算法至少处理这种

  2. 崩溃-恢复故障 (Crash-Recovery):
     → 节点崩溃后可能恢复
     → 需要持久化状态 (WAL)
     → 实际系统最常见

  3. 遗漏故障 (Omission Failure):
     → 节点遗漏发送或接收某些消息
     → 网络分区是一种遗漏故障

  4. 拜占庭故障 (Byzantine Failure):
     → 节点可以表现出任意行为
     → 包括: 发送矛盾的消息、伪造数据
     → 最严重: 需要 3f+1 个节点容忍 f 个故障
     → 区块链场景必须处理

  容忍 f 个故障节点需要:
    崩溃故障: 2f+1 个节点 (多数即可)
    拜占庭:   3f+1 个节点 (需要超级多数)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⏰ 时间、时序与时钟</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> clocks.txt</div>
                <pre className="fs-code">{`═══ 为什么时间在分布式系统中如此困难? ═══

  物理时钟不同步:
    → 石英振荡器漂移: 约 10-50 ppm (百万分之一)
    → 每天偏差: 约 0.86-4.3 秒
    → NTP 同步精度: 毫秒级 (LAN) ~ 百毫秒 (WAN)
    → GPS 同步: 微秒级 (昂贵)

  问题: 两个事件 A 和 B, 哪个先发生?
    → 不同机器的时间戳不可直接比较!

═══ 逻辑时钟 (Logical Clock) ═══

Lamport 时钟 (1978):
  规则:
    1. 每次本地事件: counter++
    2. 发送消息: attach(counter); counter++
    3. 接收消息: counter = max(counter, msg.counter) + 1
  
  性质:
    如果 a → b (a happens-before b), 则 L(a) < L(b)
    ⚠️ 反之不成立! L(a) < L(b) 不能推出 a → b
    → 只提供偏序, 不能检测并发

═══ 向量时钟 (Vector Clock) ═══

  每个节点维护一个向量 [c₁, c₂, ..., cₙ]
  
  规则:
    1. 本地事件: V[i]++  (自己的分量)
    2. 发送消息: V[i]++; attach(V)
    3. 接收消息: V[j] = max(V[j], msg.V[j]) for all j; V[i]++
  
  比较:
    V(a) < V(b) ⟺ ∀i: V(a)[i] ≤ V(b)[i] 且 ∃j: V(a)[j] < V(b)[j]
    V(a) ∥ V(b) ⟺ 既非 V(a) < V(b), 也非 V(b) < V(a) → 并发!
  
  性质:
    a → b ⟺ V(a) < V(b)    (充要条件!)
    → 完美检测因果关系和并发
  
  缺点: 向量大小 = 节点数 (大规模系统不可行)

═══ 混合逻辑时钟 (HLC) ═══

  结合物理时钟和逻辑时钟:
    HLC = (physical_time, logical_counter)
  
  → 在物理时钟足够精确时 ≈ 物理时间
  → 在时钟漂移时回退到逻辑计数
  → CockroachDB, YugabyteDB 使用 HLC

═══ TrueTime (Google Spanner) ═══

  TrueTime API:
    TT.now() → [earliest, latest]  (区间, 不是点!)
    TT.after(t) → true if t 一定已过
    TT.before(t) → true if t 一定未到
  
  实现: GPS + 原子钟同步
    → 误差: 通常 <7ms (非常小!)
    → 但仍然是区间, 不是精确值
  
  Spanner 的 commit-wait:
    → 写事务提交时等待 2ε (误差区间的两倍)
    → 保证: 如果 T1 提交在 T2 开始之前 → 全局看到 T1 < T2
    → 代价: 每个写事务延迟增加 ~14ms`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 理论基石</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> theorems.txt</div>
                <pre className="fs-code">{`═══ FLP 不可能性定理 (1985) ═══

Fischer, Lynch, Paterson:

  在异步系统中, 即使只有一个节点可能崩溃,
  也不存在确定性共识算法能在有限时间内终止。

  严格表述:
    异步模型 + 至少 1 个崩溃故障
    → 不存在既安全 (Safety) 又活性 (Liveness) 的共识

  直觉: 
    A 和 B 投票, 等 C 的回复
    → C 崩溃了? 还是消息延迟?
    → 永远无法区分! → 等还是不等?

  实践影响:
    → Paxos/Raft 在部分同步模型下工作 (绕过 FLP)
    → 使用超时来检测故障 (可能误判)
    → 牺牲终止性 (Liveness) 保证安全 (Safety)

═══ CAP 定理 (Brewer, 2000) ═══

  分布式系统不能同时满足:
    C — 一致性 (Consistency): 所有节点看到相同数据
    A — 可用性 (Availability): 每个请求都能收到响应
    P — 分区容忍 (Partition tolerance): 网络分区时仍工作

  ⚠️ 注意: P 是必须的 (网络分区必然发生!)
  → 实际选择是: CP 还是 AP

  CP 系统 (牺牲可用性):
    → etcd / ZooKeeper / HBase
    → 分区时拒绝写入, 保证一致
    → 谁: 金融交易, 配置中心

  AP 系统 (牺牲一致性):
    → Cassandra / DynamoDB / DNS
    → 分区时仍可读写, 稍后修复冲突
    → 谁: 社交动态, 购物车

═══ PACELC (扩展 CAP) ═══

  如果有分区 (P):
    选择 A (可用性) 还是 C (一致性)?
  否则 (Else):
    选择 L (延迟) 还是 C (一致性)?

  → 即使没有分区, 一致性和延迟也有权衡!

  PA/EL: DynamoDB (可用优先, 低延迟)
  PC/EC: VoltDB (一致优先)
  PA/EC: 大多数系统的实际选择

═══ BASE 理论 ═══

  与 ACID 对应:
    BA — 基本可用 (Basically Available)
    S  — 软状态 (Soft State): 可以有中间状态
    E  — 最终一致 (Eventually Consistent)

  核心思想: 放弃强一致性, 换取高可用和性能
  → 系统在一段时间后达到一致状态
  → 适合: 大规模互联网应用`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 系统模型与设计范式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> system_models.txt</div>
                <pre className="fs-code">{`═══ Happens-Before 关系 (Lamport, 1978) ═══

  定义 → (happens-before):
    1. 同一进程内: a 在 b 之前 → a → b
    2. 消息传递: send(m) → recv(m)
    3. 传递性: a → b 且 b → c → a → c
  
  并发: 如果 ¬(a → b) 且 ¬(b → a) → a ∥ b
    → 没有因果关系, 可以任意排序

  因果一致性 (Causal Consistency):
    如果 a → b, 则所有节点先看到 a 再看到 b
    但并发事件可以任意排序

═══ 复制策略 ═══

  主从复制 (Leader-Follower):
    写 → Leader (单点)
    读 → Leader 或 Follower
    → 简单, 但 Leader 是瓶颈/单点故障
    → MySQL, PostgreSQL, Redis Sentinel

  多主复制 (Multi-Leader):
    写 → 任何 Leader
    → 需要冲突解决 (Last-Write-Wins / CRDT / 用户解决)
    → CockroachDB, Galera Cluster

  无主复制 (Leaderless):
    读写 → 任意节点, 法定人数 (Quorum)
    W + R > N → 保证读到最新值
      N=3, W=2, R=2: 双写双读
      N=3, W=3, R=1: 全写单读 (读优化)
      N=3, W=1, R=3: 单写全读 (写优化)
    → Cassandra, DynamoDB, Riak

═══ 幂等性 (Idempotency) ═══

  分布式系统中消息可能重复:
    → 网络重传 + 超时 → 同一请求执行多次

  幂等操作: f(x) = f(f(x))
    幂等: SET key=value, DELETE id=5
    非幂等: balance += 100, counter++

  实现幂等的方法:
    1. 唯一请求 ID (idempotency key)
       → 服务端记录已处理的请求 ID
       → 重复请求直接返回缓存结果
    2. 版本号/乐观锁
       → UPDATE ... WHERE version = expected_version
    3. Token 机制
       → 先获取 token, 带 token 提交

═══ 超时与故障检测 ═══

  Phi Accrual Failure Detector:
    → 不是二元 (存活/故障), 而是概率
    → 基于历史心跳间隔计算怀疑度 φ
    → φ > 阈值 → 认为故障
    → Akka, Cassandra 使用

  SWIM 协议:
    → 去中心化故障检测
    → 节点间互相 ping, 间接探测
    → 与成员列表管理结合
    → HashiCorp Memberlist 使用`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
