import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Raft 状态机动画
const RAFT_NODES = ['Node-1 (Leader)', 'Node-2', 'Node-3', 'Node-4', 'Node-5'];

function RaftDemo() {
  const [leader, setLeader] = useState(0);
  const [term, setTerm] = useState(1);
  const [log, setLog] = useState([]);
  const [committed, setCommitted] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | propose | replicate | commit

  const propose = () => {
    const entry = { term, idx: log.length + 1, cmd: `set key${log.length + 1}=v${Date.now() % 1000}` };
    setPhase('propose');
    setLog(prev => [...prev, entry]);
    setTimeout(() => {
      setPhase('replicate');
      setTimeout(() => {
        setPhase('commit');
        setCommitted(prev => [...prev, entry]);
        setTimeout(() => setPhase('idle'), 800);
      }, 1200);
    }, 600);
  };

  const failLeader = () => {
    setPhase('idle');
    const newLeader = (leader + 1) % RAFT_NODES.length;
    setLeader(newLeader);
    setTerm(t => t + 1);
    setLog(prev => prev.slice(0, committed.length)); // 未提交的回滚
    setLog(prev => [...prev]);
    setLog(l => l);
  };

  const phaseColor = { idle: '#1e293b', propose: '#f59e0b', replicate: '#3b82f6', commit: '#22c55e' };
  const phaseName = { idle: '空闲', propose: 'Leader 提案', replicate: '多数派复制', commit: '提交到状态机' };

  return (
    <div className="sd-interactive">
      <h3>🗳️ Raft 共识算法状态机
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="sd-btn primary" onClick={propose} disabled={phase !== 'idle'}>📨 提案写入</button>
          <button className="sd-btn red" onClick={failLeader}>💥 Leader 宕机</button>
        </div>
      </h3>

      <div style={{ marginBottom: '0.75rem', padding: '0.4rem 0.75rem', background: `${phaseColor[phase]}20`, border: `1px solid ${phaseColor[phase]}30`, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: phaseColor[phase], fontFamily: 'JetBrains Mono' }}>
        Term={term} | Phase: {phaseName[phase]}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
        {RAFT_NODES.map((node, i) => (
          <div key={node} style={{ flex: 1, minWidth: 90, padding: '0.5rem', borderRadius: '8px', textAlign: 'center',
            background: i === leader ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
            border: `1.5px solid ${i === leader ? '#3b82f6' : phase === 'replicate' && i !== leader ? '#f59e0b40' : 'rgba(255,255,255,0.08)'}`,
            transition: 'all 0.3s' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: i === leader ? '#60a5fa' : '#64748b' }}>
              {i === leader ? '👑 Leader' : '📋 Follower'}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#334155', marginTop: '0.1rem' }}>
              Node-{i + 1}
            </div>
            <div style={{ marginTop: '0.3rem', fontSize: '0.55rem', color: '#334155' }}>
              log: {i === leader ? log.length : (phase === 'replicate' ? log.length : committed.length)} entries
            </div>
            {phase === 'replicate' && i !== leader && (
              <div style={{ fontSize: '0.55rem', color: '#f59e0b', marginTop: '0.15rem' }}>← 同步中…</div>
            )}
            {phase === 'commit' && (
              <div style={{ fontSize: '0.55rem', color: '#22c55e', marginTop: '0.15rem' }}>✅ 已提交</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
        已提交 {committed.length} 条 | Raft 多数派原则：{Math.floor(RAFT_NODES.length / 2) + 1}/{RAFT_NODES.length} 节点确认才提交
        {committed.slice(-1).map(e => <span key={e.idx} style={{ marginLeft: '0.5rem', fontFamily: 'JetBrains Mono', color: '#22c55e' }}>最新：{e.cmd}</span>)}
      </div>
    </div>
  );
}

const DIST_TOPICS = [
  {
    name: '分布式事务', icon: '💳', color: '#3b82f6',
    code: `# 分布式事务的四种解决方案

# ── 1. 两阶段提交 (2PC) — 强一致，性能差 ──
# Phase 1: Prepare（协调者问所有参与者：能执行吗？）
# Phase 2: Commit/Rollback（所有人Ready→Commit，否则Rollback）
# 缺点：阻塞、协调者单点故障

# ── 2. TCC (Try-Confirm-Cancel) — 业务侵入但高性能 ──
class OrderTCC:
    async def try_phase(self, order):
        # Try: 预留资源（冻结库存、预扣余额），不真正执行
        await inventory.freeze(order.product_id, order.quantity)
        await balance.pre_deduct(order.user_id, order.amount)

    async def confirm_phase(self, order):
        # Confirm: 确认执行（真正扣减）
        await inventory.deduct_frozen(order.product_id, order.quantity)
        await balance.confirm_deduct(order.user_id, order.amount)
        await order_service.create(order)

    async def cancel_phase(self, order):
        # Cancel: 回滚（释放冻结的资源）
        await inventory.unfreeze(order.product_id, order.quantity)
        await balance.unfreeze(order.user_id, order.amount)

# ── 3. SAGA (Saga Pattern) — 最终一致，适合长流程 ──
# 一系列本地事务，失败时执行补偿事务
saga = [
    Step(forward=create_order,    compensate=cancel_order),
    Step(forward=deduct_inventory, compensate=restore_inventory),
    Step(forward=deduct_balance,   compensate=refund_balance),
    Step(forward=trigger_shipping, compensate=cancel_shipping),
]

# ── 4. 本地消息表（最简单、可靠）──
async def create_order_with_message(order):
    async with db.transaction():
        await db.create_order(order)
        # 本地消息表与订单在同一个事务！
        await db.insert_outbox_message({
            'topic': 'order.created',
            'payload': order.to_json(),
            'status': 'PENDING'
        })
    # 定时任务扫描 outbox，发送到 Kafka（至少一次）`,
  },
  {
    name: '分布式锁', icon: '🔐', color: '#f59e0b',
    code: `# 分布式锁三大实现方案

# ── 1. Redis 分布式锁（Redlock 算法）──
import redis
import uuid
import time

class RedisDistributedLock:
    def __init__(self, redis_clients, ttl_ms=5000):
        self.clients = redis_clients   # 多个独立 Redis 节点
        self.ttl_ms = ttl_ms
        self.n = len(redis_clients)

    def acquire(self, resource: str) -> tuple[bool, str]:
        lock_id = str(uuid.uuid4())
        start = time.monotonic_ns() // 1_000_000

        successes = 0
        for client in self.clients:
            try:
                # SET key value NX PX millis（原子操作）
                ok = client.set(f"lock:{resource}", lock_id,
                                nx=True, px=self.ttl_ms)
                if ok: successes += 1
            except redis.ConnectionError:
                pass

        elapsed = time.monotonic_ns() // 1_000_000 - start
        # Redlock：多数派(N/2+1)成功 且 耗时小于TTL
        if successes >= (self.n // 2 + 1) and elapsed < self.ttl_ms:
            return True, lock_id        # 加锁成功
        else:
            self._release_all(resource, lock_id)  # 加锁失败，释放已获取的
            return False, ""

    def release(self, resource: str, lock_id: str) -> None:
        # Lua 脚本保证原子性（只删自己的锁）
        script = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
            return redis.call('del', KEYS[1])
        else
            return 0
        end"""
        for client in self.clients:
            client.eval(script, 1, f"lock:{resource}", lock_id)

# ── 2. Zookeeper 分布式锁（更可靠，但复杂）──
# 创建临时顺序节点 /locks/order-0000000001
# 序号最小的节点获得锁，Watch 前一个节点（非全局监听）
# 客户端断开 → 临时节点自动删除 → 无死锁！

# ── 3. 数据库乐观锁（适合低并发更新）──
# UPDATE orders SET status='PAID', version=version+1
# WHERE id=123 AND version=5
# 返回影响行数=0→被其他人更新了→重试`,
  },
  {
    name: '分布式 ID', icon: '🔢', color: '#22c55e',
    code: `# 分布式 ID 方案对比

# ── 1. UUID — 最简单，但无序，MySQL 索引效率差 ──
import uuid
uid = str(uuid.uuid4())  # "550e8400-e29b-41d4-a716-446655440000"

# ── 2. 雪花算法 (Snowflake) — 趋势递增，性能极高 ──
# 64bit = 1(符号位) + 41(毫秒时间戳) + 10(机器ID) + 12(序列号)
# 41位时间戳 = 2^41 ms ≈ 69年
# 10位机器ID = 2^10 = 1024台机器
# 12位序列号 = 2^12 = 4096 ID/ms/机器

class SnowflakeID:
    EPOCH = 1609459200000  # 2021-01-01 为起点

    def __init__(self, machine_id: int, datacenter_id: int):
        self.machine_id = machine_id & 0x1F       # 5位
        self.datacenter_id = datacenter_id & 0x1F  # 5位
        self.sequence = 0
        self.last_timestamp = 0

    def generate(self) -> int:
        timestamp = int(time.time() * 1000) - self.EPOCH
        if timestamp == self.last_timestamp:
            self.sequence = (self.sequence + 1) & 0xFFF  # 12位循环
            if self.sequence == 0: timestamp = self._wait_next_ms()
        else:
            self.sequence = 0
        self.last_timestamp = timestamp

        return (timestamp << 22) | (self.datacenter_id << 17) | (self.machine_id << 12) | self.sequence

# ── 3. 美团 Leaf（号段模式）──
# 数据库表 alloc: biz_tag | max_id | step | version
# 每次取一段 ID（如 10000个），内存发放，用完再取
# 避免每次 ID 都打 DB，支持 10万+ QPS

# ── 4. Redis INCR（简单有效）──
# order_id = await redis.incr("order_id_seq")
# 配合 key 格式：ORDER-2024-{8位id} 更易读
# 缺点：Redis 重启需持久化；单点（需Sentinel/Cluster）`,
  },
];

export default function LessonDistributed() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = DIST_TOPICS[activeTopic];

  return (
    <div className="lesson-sd">
      <div className="sd-badge purple">⚙️ module_06 — 分布式系统</div>
      <div className="sd-hero">
        <h1>分布式系统：Raft / 分布式事务 / 分布式锁</h1>
        <p>分布式系统的核心挑战是<strong>一致性 vs 可用性</strong>的权衡。Raft 协议解决共识问题，分布式事务解决跨服务数据一致性，分布式锁防止并发竞态——这三件事贯穿所有大规模系统设计。</p>
      </div>

      <RaftDemo />

      <div className="sd-section">
        <h2 className="sd-section-title">🔧 分布式核心模式</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {DIST_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? topic.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? `${topic.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? topic.color : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>
              {topic.name}
            </button>
          ))}
        </div>
        <div className="sd-code-wrap">
          <div className="sd-code-head">
            <div className="sd-code-dot" style={{ background: '#ef4444' }} />
            <div className="sd-code-dot" style={{ background: '#f59e0b' }} />
            <div className="sd-code-dot" style={{ background: t.color }} />
            <span style={{ color: t.color, marginLeft: '0.5rem' }}>{t.icon} {t.name}</span>
          </div>
          <div className="sd-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="sd-nav">
        <button className="sd-btn" onClick={() => navigate('/course/system-design/lesson/database')}>← 上一模块</button>
        <button className="sd-btn primary" onClick={() => navigate('/course/system-design/lesson/microservice')}>下一模块：微服务架构 →</button>
      </div>
    </div>
  );
}
