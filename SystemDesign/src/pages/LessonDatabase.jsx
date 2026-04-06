import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 一致性哈希环动画
const VIRTUAL_NODES = 3; // virtual nodes per server
const RING_SIZE = 360;

function ConsistentHashRing() {
  const [servers, setServers] = useState([
    { id: 'Server-A', color: '#3b82f6', angle: 30 },
    { id: 'Server-B', color: '#22c55e', angle: 150 },
    { id: 'Server-C', color: '#f59e0b', angle: 270 },
  ]);
  const [requests, setRequests] = useState([]);
  const [removing, setRemoving] = useState(false);

  const cx = 150, cy = 150, r = 110;

  const angleToPos = (deg) => ({
    x: cx + r * Math.cos((deg - 90) * Math.PI / 180),
    y: cy + r * Math.sin((deg - 90) * Math.PI / 180),
  });

  const findServer = (reqAngle) => {
    const sorted = [...servers].sort((a, b) => a.angle - b.angle);
    return sorted.find(s => s.angle >= reqAngle) || sorted[0];
  };

  const sendRequest = () => {
    const angle = Math.floor(Math.random() * 360);
    const target = findServer(angle);
    const req = { id: Date.now(), angle, targetId: target.id, color: target.color };
    setRequests(prev => [...prev.slice(-4), req]);
  };

  const addServer = () => {
    if (servers.length >= 5) return;
    const angle = Math.floor(Math.random() * 360);
    setServers(prev => [...prev, { id: `Server-${String.fromCharCode(65 + prev.length)}`, color: '#a855f7', angle }]);
  };

  const removeServer = () => {
    if (servers.length <= 2) return;
    setServers(prev => prev.slice(0, -1));
  };

  return (
    <div className="sd-interactive">
      <h3>⭕ 一致性哈希环（可视化）
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="sd-btn" onClick={sendRequest}>发送请求</button>
          <button className="sd-btn green" onClick={addServer}>+ 节点</button>
          <button className="sd-btn red" onClick={removeServer}>- 节点</button>
        </div>
      </h3>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width={300} height={300} viewBox="0 0 300 300">
          {/* 哈希环 */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
          
          {/* 虚拟节点（每个服务器3个虚拟节点） */}
          {servers.map(server => (
            Array.from({ length: VIRTUAL_NODES }, (_, vi) => {
              const vAngle = (server.angle + vi * (120)) % 360;
              const pos = angleToPos(vAngle);
              return (
                <circle key={`${server.id}-v${vi}`} cx={pos.x} cy={pos.y} r={4} fill={server.color + '40'} stroke={server.color} strokeWidth="1" />
              );
            })
          ))}
          
          {/* 实体节点 */}
          {servers.map(server => {
            const pos = angleToPos(server.angle);
            return (
              <g key={server.id}>
                <circle cx={pos.x} cy={pos.y} r={10} fill={`${server.color}20`} stroke={server.color} strokeWidth="1.5" />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={server.color} fontSize="7" fontWeight="700" fontFamily="JetBrains Mono">
                  {server.id.split('-')[1]}
                </text>
              </g>
            );
          })}

          {/* 最近一次请求的路由 */}
          {requests.slice(-1).map(req => {
            const pos = angleToPos(req.angle);
            return (
              <g key={req.id}>
                <circle cx={pos.x} cy={pos.y} r={6} fill={`${req.color}60`} stroke={req.color} strokeWidth="1.5" strokeDasharray="2 2" />
                <text x={cx} y={cy} textAnchor="middle" fill={req.color} fontSize="8" fontWeight="700">
                  → {req.targetId}
                </text>
              </g>
            );
          })}

          {/* 中心 */}
          <circle cx={cx} cy={cy} r={20} fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="700">Hash Ring</text>
        </svg>

        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>当前节点</div>
          {servers.map(s => (
            <div key={s.id} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ color: s.color, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{s.id}</span>
              <span style={{ color: '#334155' }}>angle={s.angle}°</span>
            </div>
          ))}

          {requests.length > 0 && (
            <>
              <div style={{ marginTop: '0.75rem', marginBottom: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>请求路由日志</div>
              {requests.slice(-3).map((r, i) => (
                <div key={r.id} style={{ fontSize: '0.68rem', color: r.color, fontFamily: 'JetBrains Mono', marginBottom: '0.1rem' }}>
                  req@{r.angle}° → {r.targetId}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: '#64748b' }}>
        💡 增/删节点时，只有邻近的少量数据需要迁移（普通哈希需要全量迁移）。虚拟节点（每服务器3个）保证数据均匀分布。
      </div>
    </div>
  );
}

const DB_TOPICS = [
  {
    name: '分库分表', icon: '🗂️', color: '#3b82f6',
    code: [
      '# 分库分表策略',
      '',
      '# ── 为什么要分库分表？──',
      '# 单表超过 500万~1000万行时：索引 B+树变深，查询变慢',
      '# 单库 QPS 上限约 5000~10000，CPU/磁盘 I/O 成为瓶颈',
      '',
      '# ── 垂直分库（按业务拆分）──',
      '# 拆前：一个 DB 包含所有表',
      '# 拆后：user_db | order_db | product_db | payment_db',
      '# 优点：解耦，各业务独立扩容',
      '# 缺点：跨库 JOIN 变难，需要应用层聚合',
      '',
      '# ── 垂直分表（按字段冷热）──',
      'user_base(id, name, phone, email)    # 热数据，频繁查询',
      'user_profile(user_id, avatar, bio)   # 冷数据，偶尔查询',
      '',
      '# ── 水平分表（Hash取模）──',
      'shard_id = hash(user_id) % 32  # 分32张表：order_0 ~ order_31',
      '',
      '# ── ShardingSphere 配置 ──',
      'rules:',
      '  - !SHARDING',
      '    tables:',
      '      order:',
      '        # 2个库x32张表（使用范围语法指定节点）',
      '        actualDataNodes: ds_0.order_0, ds_0.order_1, ..., ds_1.order_31',
      '        databaseStrategy:',
      '          standard:',
      '            shardingColumn: user_id',
      '            shardingAlgorithmName: db-inline',
      '        tableStrategy:',
      '          standard:',
      '            shardingColumn: order_id',
      '            shardingAlgorithmName: order-hash',
      '    shardingAlgorithms:',
      '      order-hash:',
      '        type: HASH_MOD',
      '        props:',
      '          sharding-count: 32',
    ].join('\n'),
  },
  {
    name: '一致性哈希', icon: '⭕', color: '#22c55e',
    code: `# 一致性哈希（Consistent Hashing）原理与实现

import hashlib
from sortedcontainers import SortedDict

class ConsistentHash:
    def __init__(self, virtual_nodes=150):
        self.ring = SortedDict()     # 哈希环（有序字典）
        self.virtual_nodes = virtual_nodes  # 虚拟节点数（越多越均匀）
        self.nodes = set()

    def add_node(self, node: str) -> None:
        self.nodes.add(node)
        for i in range(self.virtual_nodes):
            vnode_key = f"{node}#VN{i}"
            hash_val = int(hashlib.md5(vnode_key.encode()).hexdigest(), 16)
            self.ring[hash_val] = node
        print(f"✅ 节点 {node} 加入（影响数据量 ≈ 1/{len(self.nodes)+1}）")

    def remove_node(self, node: str) -> None:
        self.nodes.discard(node)
        for i in range(self.virtual_nodes):
            vnode_key = f"{node}#VN{i}"
            hash_val = int(hashlib.md5(vnode_key.encode()).hexdigest(), 16)
            self.ring.pop(hash_val, None)
        print(f"❌ 节点 {node} 移除（只影响邻近分片数据）")

    def get_node(self, key: str) -> str:
        if not self.ring: raise LookupError("哈希环为空")
        hash_val = int(hashlib.md5(key.encode()).hexdigest(), 16)
        # 顺时针找第一个不小于 hash_val 的虚拟节点
        idx = self.ring.bisect_left(hash_val)
        if idx == len(self.ring): idx = 0   # 绕环
        return self.ring.values()[idx]

# 使用
ch = ConsistentHash(virtual_nodes=150)
ch.add_node("Redis-1")
ch.add_node("Redis-2")
ch.add_node("Redis-3")

print(ch.get_node("user:1001"))   # → Redis-2
print(ch.get_node("session:abc")) # → Redis-1

# 添加新节点（只有约 1/4 的 key 需要迁移）
ch.add_node("Redis-4")
# 移除节点（只有该节点的 key 迁移到下一个）
ch.remove_node("Redis-1")`,
  },
  {
    name: '读写分离 & NewSQL', icon: '🔮', color: '#a855f7',
    code: `# 读写分离架构 + NewSQL 选型

# ── 读写分离（Proxy 层，对应用透明）──
# 基于 ProxySQL 或 MaxScale
# 所有写请求 → Primary
# 所有读请求 → Replica（可配置权重）

import sqlalchemy
# 应用层读写分离（SQLAlchemy）
engines = {
    'write': create_engine("mysql://primary:3306/db"),
    'read': create_engine("mysql://replica1:3306/db,mysql://replica2:3306/db",
                          strategy="replica_set",  # 随机选Replica
                          engine_kwargs={'pool_size': 20})
}

class ReadWriteSession:
    def write(self):
        return Session(bind=engines['write'])
    def read(self):
        return Session(bind=engines['read'])

# ── MySQL → TiDB 迁移（为什么需要 NewSQL）──
# 当 MySQL 分库分表维护成本过高时：
# TiDB = MySQL 兼容 + 自动分片 + 分布式事务 + HTAP

# TiDB 架构：
# TiDB Server（SQL层）← 无状态，水平扩展
# PD（调度中心）← 存储 Region 路由
# TiKV（KV存储）← RocksDB + Raft 协议
# TiFlash（列存）← AP 查询加速（HTAP）

# 迁移工具：DM（Data Migration）
# mysql2tidb --host=tidb-server --db=mydb --table=orders \\
#   --chunk-size=10000 --threads=8

# 分布式事务（TiDB 自动处理跨分片事务）
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  # 可能在分片1
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  # 可能在分片2
COMMIT;
# TiDB 内部使用 Percolator 两阶段提交，对应用透明！`,
  },
];

export default function LessonDatabase() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = DB_TOPICS[activeTopic];

  return (
    <div className="lesson-sd">
      <div className="sd-badge blue">🗄️ module_05 — 数据库扩展</div>
      <div className="sd-hero">
        <h1>数据库扩展：分库分表 / 一致性哈希 / NewSQL</h1>
        <p>单机数据库的极限是 <strong>5000~10000 QPS</strong>，千万级数据后查询变慢。分库分表解决存储瓶颈，一致性哈希解决节点变更时的数据迁移，TiDB 等 NewSQL 提供更优雅的分布式方案。</p>
      </div>

      <ConsistentHashRing />

      <div className="sd-section">
        <h2 className="sd-section-title">🔧 数据库扩展三大方案</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {DB_TOPICS.map((topic, i) => (
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
        <button className="sd-btn" onClick={() => navigate('/course/system-design/lesson/mq')}>← 上一模块</button>
        <button className="sd-btn primary" onClick={() => navigate('/course/system-design/lesson/distributed')}>下一模块：分布式系统 →</button>
      </div>
    </div>
  );
}
