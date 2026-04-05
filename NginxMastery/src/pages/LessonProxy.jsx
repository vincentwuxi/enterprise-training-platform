import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const ALGORITHMS = [
  {
    id: 'round_robin', name: '轮询 (Round Robin)', icon: '🔄', color: '#22c55e', default: true,
    desc: '按顺序依次分配请求到每个服务器，适用于服务器性能相同的场景。',
    config: `upstream backend {
    # 默认即为轮询，无需指定
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}`,
    assign: (servers, reqIdx) => reqIdx % servers.length,
  },
  {
    id: 'weighted', name: '加权轮询 (Weighted)', icon: '⚖️', color: '#fbbf24', default: false,
    desc: '按权重比例分配请求，性能强的服务器处理更多请求。weight=3 的服务器处理3倍流量。',
    config: `upstream backend {
    server 10.0.0.1:8080  weight=3;  # 高配机器
    server 10.0.0.2:8080  weight=2;  # 中配机器
    server 10.0.0.3:8080  weight=1;  # 低配机器
    # 比例：3:2:1，每6个请求分别处理3/2/1个
}`,
    assign: (servers, reqIdx) => {
      const pattern = [0,0,0,1,1,2];
      return pattern[reqIdx % 6];
    },
  },
  {
    id: 'least_conn', name: '最少连接 (Least Conn)', icon: '📉', color: '#38bdf8', default: false,
    desc: '将新请求分配给当前连接数最少的服务器，适用于处理时间差异大的长连接场景。',
    config: `upstream backend {
    least_conn;  # 关键指令
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}`,
    assign: (servers) => servers.reduce((minIdx, s, i, arr) => s.conns < arr[minIdx].conns ? i : minIdx, 0),
  },
  {
    id: 'ip_hash', name: 'IP Hash（会话保持）', icon: '🔒', color: '#a78bfa', default: false,
    desc: '根据客户端 IP 的哈希值固定路由到同一服务器，确保同一用户的所有请求都到同一个后端（Session 亲和性）。',
    config: `upstream backend {
    ip_hash;  # 同一 IP 始终路由到同一 server
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
    # 注意：某服务器下线时要标记 down，而非直接删除
    # server 10.0.0.4:8080  down;
}`,
    assign: (servers, reqIdx, clientIp) => clientIp % servers.length,
  },
  {
    id: 'random', name: 'Random（随机）', icon: '🎲', color: '#f97316', default: false,
    desc: 'Nginx 1.15.1+ 支持，随机选择服务器，可结合 least_conn 做两次随机取最优。',
    config: `upstream backend {
    random two least_conn;  # 随机选2个，取连接最少的
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}`,
    assign: (servers) => Math.floor(Math.random() * servers.length),
  },
];

function LBSimulator({ algo }) {
  const [servers, setServers] = useState([
    { id: 0, label: '10.0.0.1', conns: 0, handled: 0 },
    { id: 1, label: '10.0.0.2', conns: 0, handled: 0 },
    { id: 2, label: '10.0.0.3', conns: 0, handled: 0 },
  ]);
  const [requests, setRequests] = useState([]);
  const [reqIdx, setReqIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [clientIp] = useState(Math.floor(Math.random() * 255));
  const reqIdxRef = useRef(0);
  const serversRef = useRef(servers);
  serversRef.current = servers;

  useEffect(() => {
    setServers([
      { id: 0, label: '10.0.0.1', conns: 0, handled: 0 },
      { id: 1, label: '10.0.0.2', conns: 0, handled: 0 },
      { id: 2, label: '10.0.0.3', conns: 0, handled: 0 },
    ]);
    setRequests([]);
    setReqIdx(0);
    reqIdxRef.current = 0;
    setRunning(false);
  }, [algo.id]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const idx = reqIdxRef.current;
      const cur = serversRef.current;
      const target = algo.assign(cur, idx, clientIp);
      reqIdxRef.current = idx + 1;

      setServers(prev => prev.map((s, i) => i === target ? { ...s, conns: s.conns + 1, handled: s.handled + 1 } : s));
      const reqId = Date.now();
      setRequests(prev => [...prev.slice(-14), { id: reqId, server: target, serverLabel: cur[target].label }]);

      setTimeout(() => {
        setServers(prev => prev.map((s, i) => i === target ? { ...s, conns: Math.max(0, s.conns - 1) } : s));
      }, 1000 + Math.random() * 1500);

      setReqIdx(idx + 1);
    }, 400);
    return () => clearInterval(t);
  }, [running, algo]);

  const total = servers.reduce((s, sv) => s + sv.handled, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className="ng-btn primary" onClick={() => setRunning(r => !r)}>{running ? '⏸ 暂停' : '▶ 模拟请求'}</button>
        <button className="ng-btn" onClick={() => { setServers(s => s.map(sv => ({...sv, conns: 0, handled: 0}))); setRequests([]); setReqIdx(0); reqIdxRef.current = 0; setRunning(false); }}>重置</button>
        {algo.id === 'ip_hash' && <span style={{ fontSize: '0.75rem', color: '#a78bfa', padding: '0.5rem', borderRadius: '6px', background: 'rgba(124,58,237,0.1)' }}>🔒 模拟客户端 IP: 192.168.1.{clientIp}</span>}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {servers.map(sv => {
          const pct = total > 0 ? Math.round(sv.handled / total * 100) : 0;
          return (
            <div key={sv.id} style={{ flex: 1, padding: '0.875rem', borderRadius: '8px', border: `1px solid ${algo.color}30`, background: `${algo.color}08`, textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#4a7a5a', marginBottom: '0.3rem' }}>{sv.label}:8080</div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: algo.color }}>{sv.handled}</div>
              <div style={{ fontSize: '0.7rem', color: '#4a7a5a' }}>处理 {pct}%</div>
              <div style={{ fontSize: '0.68rem', color: '#22c55e', marginTop: '0.2rem' }}>活跃连接: {sv.conns}</div>
              <div className="ng-meter" style={{ marginTop: '0.4rem' }}>
                <div className="ng-meter-fill" style={{ width: `${pct}%`, background: algo.color }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ maxHeight: 100, overflow: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {requests.slice().reverse().map(r => (
          <span key={r.id} style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', padding: '0.12rem 0.4rem', borderRadius: '3px', background: `${algo.color}12`, color: algo.color }}>→ {r.serverLabel}</span>
        ))}
      </div>
    </div>
  );
}

export default function LessonProxy() {
  const navigate = useNavigate();
  const [activeAlgo, setActiveAlgo] = useState(0);

  return (
    <div className="lesson-ng">
      <div className="ng-badge">🔀 module_03 — 反向代理与负载均衡</div>

      <div className="ng-hero">
        <h1>反向代理与负载均衡：五大算法可视化</h1>
        <p>Nginx 反向代理是互联网架构的标配。<strong>负载均衡算法</strong>的选择直接影响后端服务的压力分布——选错算法可能导致某台服务器过载而其他服务器空闲。</p>
      </div>

      {/* 反向代理原理 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🔄 反向代理工作原理</h2>
        <div className="ng-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#4a7a5a', lineHeight: '1.9', whiteSpace: 'pre' }}>{`
客户端                    Nginx（反向代理）                    后端集群
                         ┌───────────────────┐
Browser ──HTTP──►        │  接收客户端请求    │   ──HTTP──► App Server 1 :8080
                         │  选择后端服务器    │   ──HTTP──► App Server 2 :8080
Mobile  ──HTTPS──►       │  转发并添加头部    │   ──HTTP──► App Server 3 :8080
                         │  等待后端响应      │
API     ──HTTP2──►       │  返回响应给客户端  │
                         └───────────────────┘

核心价值：
• 隐藏后端真实 IP（安全）
• 负载均衡（横向扩展）
• SSL 终止（减轻后端压力）
• 统一日志（可观测性）
• 缓存（减少后端压力）`}</div>
        </div>
      </div>

      {/* 负载均衡算法可视化 */}
      <div className="ng-section">
        <h2 className="ng-section-title">⚖️ 负载均衡算法模拟器（实时可视化）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {ALGORITHMS.map((algo, i) => (
            <button key={algo.id}
              onClick={() => setActiveAlgo(i)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
                border: `1px solid ${activeAlgo === i ? algo.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeAlgo === i ? `${algo.color}14` : 'rgba(255,255,255,0.02)',
                color: activeAlgo === i ? algo.color : '#4a7a5a',
              }}>
              {algo.icon} {algo.name}
            </button>
          ))}
        </div>

        <div className="ng-interactive" style={{ borderColor: `${ALGORITHMS[activeAlgo].color}25` }}>
          <h3 style={{ color: ALGORITHMS[activeAlgo].color }}>
            {ALGORITHMS[activeAlgo].icon} {ALGORITHMS[activeAlgo].name}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#4a7a5a', marginBottom: '1rem' }}>{ALGORITHMS[activeAlgo].desc}</p>
          <LBSimulator algo={ALGORITHMS[activeAlgo]} />
        </div>

        <div className="ng-term-wrapper" style={{ marginTop: '0.75rem' }}>
          <div className="ng-term-header">
            <div className="ng-term-dot" style={{ background: '#ef4444' }} />
            <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
            <div className="ng-term-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>upstream.conf — {ALGORITHMS[activeAlgo].name}</span>
          </div>
          <div className="ng-term" style={{ fontSize: '0.78rem' }}>{ALGORITHMS[activeAlgo].config}</div>
        </div>
      </div>

      {/* 故障转移 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🔧 健康检查与故障转移</h2>
        <div className="ng-grid-2">
          {[
            { title: '被动健康检查（内置）', color: '#22c55e', config: `upstream backend {
    server 10.0.0.1:8080
        max_fails=3       # 3次失败则标记为不健康
        fail_timeout=30s; # 30秒内不再转发
    # 30秒后自动尝试恢复
}` },
            { title: '主动健康检查（Nginx Plus）', color: '#a78bfa', config: `upstream backend {
    server 10.0.0.1:8080;
    # 需要 Nginx Plus 商业版
    health_check
        interval=10s  # 每10秒检查
        fails=2       # 2次失败标记不健康
        passes=1      # 1次成功恢复
        uri=/health;  # 检查路径
}` },
          ].map(h => (
            <div key={h.title} className="ng-card" style={{ borderColor: `${h.color}20` }}>
              <h3 style={{ color: h.color }}>{h.title}</h3>
              <div className="ng-term-wrapper">
                <div className="ng-term" style={{ fontSize: '0.72rem' }}>{h.config}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ng-nav">
        <button className="ng-btn" onClick={() => navigate('/course/nginx-mastery/lesson/config')}>← 上一模块</button>
        <button className="ng-btn primary" onClick={() => navigate('/course/nginx-mastery/lesson/ssl')}>下一模块：HTTPS 与安全 →</button>
      </div>
    </div>
  );
}
