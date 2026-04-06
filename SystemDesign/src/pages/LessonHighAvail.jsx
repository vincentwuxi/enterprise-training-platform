import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 负载均衡算法可视化
const LB_ALGOS = [
  {
    name: '轮询 (Round Robin)', color: '#3b82f6',
    desc: '依次轮流分发请求，适合所有服务器配置相同的场景。',
    simulate: (servers, reqIdx) => reqIdx % servers.length,
  },
  {
    name: '加权轮询 (Weighted RR)', color: '#22c55e',
    desc: '按权重比例分发，高配服务器承载更多流量。',
    simulate: (servers, reqIdx) => (reqIdx % 4 < 2 ? 0 : reqIdx % 4 < 3 ? 1 : 2), // 2:1:1
  },
  {
    name: '最少连接 (Least Conn)', color: '#f59e0b',
    desc: '把请求分发到当前连接数最少的服务器，适合处理时长差异大的场景。',
    simulate: (servers) => servers.reduce((m, s, i) => s.conn < servers[m].conn ? i : m, 0),
  },
  {
    name: 'IP 哈希 (IP Hash)', color: '#a855f7',
    desc: '根据客户端 IP 哈希固定路由，同一用户总访问同一台服务器（保持 Session）。',
    simulate: (servers, reqIdx, clientHash) => clientHash % servers.length,
  },
];

function LoadBalancerDemo() {
  const [algoIdx, setAlgoIdx] = useState(0);
  const [servers, setServers] = useState([
    { id: 'S1', conn: 0, total: 0, weight: 2, status: 'healthy' },
    { id: 'S2', conn: 0, total: 0, weight: 1, status: 'healthy' },
    { id: 'S3', conn: 0, total: 0, weight: 1, status: 'healthy' },
  ]);
  const [reqIdx, setReqIdx] = useState(0);
  const [log, setLog] = useState([]);
  const [lastHit, setLastHit] = useState(null);
  const clientHash = 2; // simulate fixed client IP hash

  const algo = LB_ALGOS[algoIdx];

  const sendReq = () => {
    const targetIdx = algo.simulate(servers, reqIdx, clientHash);
    setLastHit(targetIdx);
    setServers(prev => prev.map((s, i) => i === targetIdx ? { ...s, conn: s.conn + 1, total: s.total + 1 } : s));
    setLog(prev => [...prev.slice(-5), `REQ #${reqIdx + 1} → ${servers[targetIdx].id} (${algo.name.split(' ')[0]})`]);
    setReqIdx(r => r + 1);
    setTimeout(() => {
      setServers(prev => prev.map((s, i) => i === targetIdx && s.conn > 0 ? { ...s, conn: s.conn - 1 } : s));
    }, 1500);
  };

  const reset = () => { setServers(s => s.map(x => ({ ...x, conn: 0, total: 0 }))); setReqIdx(0); setLog([]); setLastHit(null); };

  const toggleServer = (idx) => setServers(prev => prev.map((s, i) => i === idx ? { ...s, status: s.status === 'healthy' ? 'down' : 'healthy' } : s));

  return (
    <div className="sd-interactive">
      <h3>⚖️ 负载均衡算法模拟器
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="sd-btn primary" onClick={sendReq}>发送请求</button>
          <button className="sd-btn" onClick={reset}>↺ 重置</button>
        </div>
      </h3>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {LB_ALGOS.map((a, i) => (
          <button key={i} onClick={() => { setAlgoIdx(i); reset(); }}
            style={{ flex: 1, minWidth: 120, padding: '0.5rem', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', textAlign: 'center', transition: 'all 0.2s',
              border: `1px solid ${algoIdx === i ? a.color + '60' : 'rgba(255,255,255,0.07)'}`,
              background: algoIdx === i ? `${a.color}10` : 'rgba(255,255,255,0.02)',
              color: algoIdx === i ? a.color : '#64748b' }}>
            {a.name}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{algo.desc}</p>

      {/* LB 架构图 */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 52, borderRadius: '8px', background: `${algo.color}15`, border: `1.5px solid ${algo.color}50`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: algo.color, fontWeight: 800, fontSize: '0.72rem' }}>
            <div>⚖️</div>LB
          </div>
        </div>
        <div style={{ fontSize: '1.2rem', color: '#334155' }}>→</div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {servers.map((s, i) => (
            <div key={s.id} style={{ cursor: 'pointer' }} onClick={() => toggleServer(i)}>
              <div style={{ width: 72, height: 72, borderRadius: '10px', border: `2px solid ${s.status === 'down' ? '#ef4444' : lastHit === i ? algo.color : '#1e293b'}`, background: s.status === 'down' ? 'rgba(239,68,68,0.05)' : lastHit === i ? `${algo.color}12` : 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: s.status === 'down' ? '#f87171' : lastHit === i ? algo.color : '#64748b' }}>{s.id}</div>
                <div style={{ fontSize: '0.58rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>conn:{s.conn}</div>
                <div style={{ fontSize: '0.58rem', color: '#3b82f6', fontFamily: 'JetBrains Mono' }}>total:{s.total}</div>
                <div style={{ fontSize: '0.5rem', color: s.status === 'down' ? '#f87171' : '#22c55e', marginTop: '0.1rem' }}>{s.status === 'down' ? '🔴 down' : '🟢 ok'}</div>
              </div>
              <div style={{ fontSize: '0.58rem', color: '#334155', textAlign: 'center', marginTop: '0.2rem' }}>weight={s.weight}</div>
            </div>
          ))}
        </div>
      </div>

      {log.length > 0 && (
        <div style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.5rem 0.75rem', fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>
          {log.map((l, i) => <div key={i} style={{ color: '#60a5fa', marginBottom: '0.1rem' }}>{l}</div>)}
        </div>
      )}
      <div style={{ fontSize: '0.68rem', color: '#334155', marginTop: '0.4rem' }}>💡 点击服务器可模拟故障，LB 会自动跳过宕机节点</div>
    </div>
  );
}

const HA_TOPICS = [
  {
    name: '主从复制', icon: '🗄️', color: '#3b82f6',
    code: `# MySQL 主从复制配置
# ── Primary (Master) ──
# my.cnf
[mysqld]
server-id = 1           # 每台服务器唯一 ID
log_bin = mysql-bin     # 开启 Binlog！
binlog_format = ROW     # 行级格式，更安全
binlog_row_image = FULL
expire_logs_days = 7    # Binlog 保留7天

# ── Replica (Slave) ──
[mysqld]
server-id = 2
relay_log = mysql-relay-bin
read_only = 1           # 只读！防止误写

# 在 Replica 上配置复制
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = 'primary.db.internal',
  SOURCE_USER = 'replicator',
  SOURCE_PASSWORD = '$REPL_PASSWORD',
  SOURCE_AUTO_POSITION = 1;  # GTID 模式（推荐）

START REPLICA;
SHOW REPLICA STATUS\\G
# ↑ 确认 Seconds_Behind_Source: 0（无延迟）

# ── 读写分离（应用层）──
# 写 → Primary，读 → Replica（随机选择）
class DBRouter:
    def __init__(self):
        self.primary = create_engine("mysql+aiomysql://primary/db")
        self.replicas = [
            create_engine("mysql+aiomysql://replica1/db"),
            create_engine("mysql+aiomysql://replica2/db"),
        ]
    
    def get_read_engine(self):
        return random.choice(self.replicas)`,
  },
  {
    name: '熔断降级', icon: '⚡', color: '#ef4444',
    code: `# 熔断器模式（Circuit Breaker）
# 防止一个服务的故障级联扩散到整个系统

from enum import Enum
import time, threading

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60, half_open_max=3):
        self.state = 'CLOSED'        # CLOSED=正常 | OPEN=熔断 | HALF_OPEN=探测
        self.failure_count = 0
        self.failure_threshold = failure_threshold   # 连续失败5次 → 熔断
        self.recovery_timeout = recovery_timeout     # 60秒后进入 HALF_OPEN
        self.half_open_successes = 0
        self.half_open_max = half_open_max           # 3次成功 → 恢复
        self.last_failure_time = None
        self._lock = threading.Lock()

    def call(self, func, *args, **kwargs):
        with self._lock:
            if self.state == 'OPEN':
                # 检查是否可以进入 HALF_OPEN
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = 'HALF_OPEN'
                else:
                    raise ServiceUnavailableError("Circuit OPEN - 返回降级数据！")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        with self._lock:
            if self.state == 'HALF_OPEN':
                self.half_open_successes += 1
                if self.half_open_successes >= self.half_open_max:
                    self.state = 'CLOSED'
                    self.failure_count = 0
            elif self.state == 'CLOSED':
                self.failure_count = max(0, self.failure_count - 1)

    def _on_failure(self):
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.state in ('CLOSED', 'HALF_OPEN') and self.failure_count >= self.failure_threshold:
                self.state = 'OPEN'
                print("🔴 Circuit OPEN! 服务熔断，停止请求下游")`,
  },
  {
    name: '限流策略', icon: '🚦', color: '#f59e0b',
    code: `# 四大限流算法对比

# ── 1. 固定窗口计数 (最简单，有边界突刺问题) ──
class FixedWindowRateLimiter:
    def __init__(self, limit=100, window_seconds=60):
        self.limit = limit
        self.window_seconds = window_seconds
        self.counter = defaultdict(lambda: {'count': 0, 'start': time.time()})

    def allow(self, user_id: str) -> bool:
        now = time.time()
        data = self.counter[user_id]
        if now - data['start'] >= self.window_seconds:
            data.update({'count': 0, 'start': now})
        data['count'] += 1
        return data['count'] <= self.limit

# ── 2. 令牌桶 (Token Bucket) — 推荐！允许突发流量 ──
class TokenBucket:
    def __init__(self, rate=100, capacity=200):  # 100/s，最多200令牌
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_refill = time.time()

    def consume(self, tokens=1) -> bool:
        now = time.time()
        # 按时间比例补充令牌
        self.tokens = min(self.capacity, self.tokens + (now - self.last_refill) * self.rate)
        self.last_refill = now
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False  # 限流！

# ── Redis 实现令牌桶（分布式限流）──
local current = redis.call('get', KEYS[1])
if current and tonumber(current) <= 0 then
    return 0  -- 拒绝
end
redis.call('decr', KEYS[1])
redis.call('expire', KEYS[1], ARGV[1])
return 1  -- 允许`,
  },
];

export default function LessonHighAvail() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = HA_TOPICS[activeTopic];

  return (
    <div className="lesson-sd">
      <div className="sd-badge green">🟢 module_02 — 高可用架构</div>
      <div className="sd-hero">
        <h1>高可用架构：负载均衡 / 主从复制 / 熔断降级</h1>
        <p>高可用（HA）的目标是 SLA 达到 <strong>99.99%</strong>（全年停机 &lt;52分钟）。核心三件套：负载均衡 消除单点故障，主从复制 保证数据冗余，熔断降级 防止级联崩溃。</p>
      </div>

      <LoadBalancerDemo />

      {/* SLA 速查 */}
      <div className="sd-section">
        <h2 className="sd-section-title">📊 SLA 可用性对照表</h2>
        <div className="sd-grid-4">
          {[['99%', '3.65天/年', '~$10k'], ['99.9%', '8.76小时/年', '~$50k'], ['99.99%', '52.6分钟/年', '~$200k'], ['99.999%', '5.26分钟/年', '~$1M+']].map(([sla, down, cost]) => (
            <div key={sla} className="sd-card" style={{ textAlign: 'center', padding: '1rem 0.75rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#60a5fa', fontFamily: 'JetBrains Mono' }}>{sla}</div>
              <div style={{ fontSize: '0.72rem', color: '#f87171', fontFamily: 'JetBrains Mono', margin: '0.2rem 0' }}>↓ {down}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>投入成本参考：{cost}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 三大主题 */}
      <div className="sd-section">
        <h2 className="sd-section-title">🔧 高可用三大核心模式</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {HA_TOPICS.map((topic, i) => (
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
          <div className="sd-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="sd-nav">
        <button className="sd-btn" onClick={() => navigate('/course/system-design/lesson/fundamentals')}>← 上一模块</button>
        <button className="sd-btn primary" onClick={() => navigate('/course/system-design/lesson/cache')}>下一模块：缓存系统 →</button>
      </div>
    </div>
  );
}
