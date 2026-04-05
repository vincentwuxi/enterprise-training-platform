import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const WORKERS = [
  { id: 'master', label: 'Master 进程', desc: '读取配置、管理 Worker、信号处理', color: '#009639' },
  { id: 'w1', label: 'Worker 1', desc: '处理客户端请求', color: '#22c55e' },
  { id: 'w2', label: 'Worker 2', desc: '处理客户端请求', color: '#22c55e' },
  { id: 'w3', label: 'Worker 3', desc: '处理客户端请求', color: '#22c55e' },
  { id: 'w4', label: 'Worker 4', desc: '处理客户端请求', color: '#22c55e' },
];

function RequestSimulator() {
  const [reqs, setReqs] = useState([]);
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const id = Date.now();
      const worker = Math.floor(Math.random() * 4) + 1;
      setReqs(prev => [...prev.slice(-11), { id, worker, status: 'active' }]);
      setCount(c => c + 1);
      setTimeout(() => setReqs(prev => prev.map(r => r.id === id ? { ...r, status: 'done' } : r)), 800);
    }, 300);
    return () => clearInterval(t);
  }, [running]);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ flex: '0 0 auto' }}>
        <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <button className="ng-btn primary" onClick={() => setRunning(r => !r)}>
            {running ? '⏸ 暂停' : '▶ 启动请求流'}
          </button>
          <button className="ng-btn" onClick={() => { setReqs([]); setCount(0); setRunning(false); }}>重置</button>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#22c55e', marginBottom: '0.5rem' }}>
          已处理请求：<strong style={{ fontSize: '1.1rem' }}>{count}</strong>
        </div>
        {WORKERS.map(w => (
          <div key={w.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'rgba(0,150,57,0.05)', border: '1px solid rgba(0,150,57,0.15)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: w.color, boxShadow: running && w.id !== 'master' ? `0 0 6px ${w.color}` : 'none' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: w.color, fontWeight: 700 }}>{w.label}</span>
            <span style={{ fontSize: '0.68rem', color: '#1a3a25' }}>
              {reqs.filter(r => r.worker === parseInt(w.id.replace('w', '')) && r.status === 'active').length > 0 ? '⚡处理中' : ''}
            </span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: '0.72rem', color: '#1a3a25', marginBottom: '0.4rem' }}>📦 请求队列（最近12条）</div>
        <div style={{ maxHeight: 180, overflow: 'auto' }}>
          {reqs.slice().reverse().map(r => (
            <div key={r.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.25rem 0.5rem', borderRadius: '4px', marginBottom: '0.2rem', background: r.status === 'active' ? 'rgba(0,150,57,0.08)' : 'rgba(255,255,255,0.02)', fontSize: '0.72rem', fontFamily: 'JetBrains Mono' }}>
              <span style={{ color: r.status === 'active' ? '#22c55e' : '#1a3a25' }}>{r.status === 'active' ? '●' : '○'}</span>
              <span style={{ color: '#4a7a5a' }}>req#{r.id % 9999}</span>
              <span style={{ color: '#009639' }}>→ Worker {r.worker}</span>
              <span style={{ color: r.status === 'done' ? '#4a7a5a' : '#22c55e' }}>{r.status === 'done' ? '200 OK' : '处理中…'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const VS_ITEMS = [
  { aspect: '架构模型', nginx: '异步非阻塞，事件驱动', apache: '每请求一线程（prefork）或进程' },
  { aspect: '并发能力', nginx: '单机 10万+ 并发连接', apache: '几千并发（受内存限制）' },
  { aspect: '内存占用', nginx: '极低，数MB起', apache: '较高，线程数×内存' },
  { aspect: '静态文件', nginx: '极快，直接sendfile', apache: '较好，但 Nginx 更快' },
  { aspect: '动态内容', nginx: '通过 upstream 转发', apache: '内置 mod_php 等模块' },
  { aspect: '配置热更', nginx: 'nginx -s reload（不中断）', apache: 'apachectl graceful' },
  { aspect: '适用场景', nginx: '反向代理/API网关/静态资源', apache: '传统 PHP 应用/.htaccess' },
];

export default function LessonNginxCore() {
  const navigate = useNavigate();
  const [showVs, setShowVs] = useState(false);

  return (
    <div className="lesson-ng">
      <div className="ng-badge">🌿 module_01 — Nginx 核心</div>

      <div className="ng-hero">
        <h1>Nginx 核心：事件驱动与 Worker 进程模型</h1>
        <p>Nginx 能以<strong>1个进程处理10万并发连接</strong>，靠的不是多线程，而是异步非阻塞的事件驱动架构。理解这个模型，你就懂了为什么 Nginx 会成为互联网流量的"守门人"。</p>
      </div>

      {/* 进程模型架构 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🏗️ Master / Worker 进程架构</h2>
        <div className="ng-card">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#4a7a5a', lineHeight: '1.85', whiteSpace: 'pre' }}>{`
                    ┌──────────────────────────────────────────────────┐
                    │                 Master Process (PID 1)           │
                    │  • 读取并验证配置文件 nginx.conf                  │
                    │  • 管理 Worker 进程的生命周期                     │
                    │  • 接收信号：SIGHUP(热更配置) USR1(重开日志)     │
                    └──────────────────┬───────────────────────────────┘
                                   fork × CPU核心数
                  ┌────────────┬───────┴────────┬─────────────┐
                  ▼            ▼                ▼             ▼
           ┌──────────┐ ┌──────────┐    ┌──────────┐  ┌──────────┐
           │Worker #1 │ │Worker #2 │    │Worker #3 │  │Worker #4 │
           │epoll 事件│ │epoll 事件│    │epoll 事件│  │epoll 事件│
           │驱动循环  │ │驱动循环  │    │驱动循环  │  │驱动循环  │
           └──────────┘ └──────────┘    └──────────┘  └──────────┘
                ↕            ↕                ↕             ↕
           共享内存（upstream状态）+ 文件描述符（socket）

  ⚙️ 建议：worker_processes auto;  # 自动匹配 CPU 核心数
  ⚙️ 建议：worker_connections 65535; # 每个 Worker 最大连接数
  → 最大并发 = worker_processes × worker_connections`}</div>
        </div>
      </div>

      {/* 事件驱动模型 */}
      <div className="ng-section">
        <h2 className="ng-section-title">⚡ 事件驱动 vs 多线程（为什么 Nginx 这么快？）</h2>
        <div className="ng-grid-2">
          <div className="ng-card" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
            <h3 style={{ color: '#f87171' }}>❌ 传统多线程模型（Apache）</h3>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#4a7a5a', lineHeight: '1.8', whiteSpace: 'pre' }}>{`请求1 → 线程1（等待 DB 响应…阻塞）
请求2 → 线程2（等待文件 IO…阻塞）
请求3 → 线程3（等待网络…阻塞）
...
请求N → 线程N（内存耗尽！OOM）

问题：
• 每个线程 ~8MB 内存
• 1000 并发 = 8GB 内存
• 线程切换 = CPU 浪费`}</div>
          </div>
          <div className="ng-card" style={{ borderColor: 'rgba(0,150,57,0.25)' }}>
            <h3 style={{ color: '#22c55e' }}>✅ 事件驱动模型（Nginx）</h3>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#4a7a5a', lineHeight: '1.8', whiteSpace: 'pre' }}>{`单 Worker 线程（epoll 事件循环）:

1. 接收请求1 → 发送读取文件请求
   register callback → 继续下一个事件
2. 接收请求2 → 发起 upstream 连接
   register callback → 继续下一个事件
3. epoll 通知"文件读完了" → 执行 callback

优势：
• 1个线程服务数万连接
• 无阻塞等待，CPU 利用率极高`}</div>
          </div>
        </div>
      </div>

      {/* 请求模拟器 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🎮 Worker 请求分发模拟器</h2>
        <div className="ng-interactive">
          <h3>实时模拟 Nginx 将请求分发到 4 个 Worker</h3>
          <RequestSimulator />
        </div>
      </div>

      {/* Nginx vs Apache */}
      <div className="ng-section">
        <h2 className="ng-section-title">⚖️ Nginx vs Apache 对比</h2>
        <button className="ng-btn" style={{ marginBottom: '0.75rem' }} onClick={() => setShowVs(v => !v)}>
          {showVs ? '隐藏对比' : '展开详细对比'}
        </button>
        {showVs && (
          <div className="ng-card">
            <table className="ng-table">
              <thead><tr><th>对比维度</th><th>🌿 Nginx</th><th>🦅 Apache</th></tr></thead>
              <tbody>
                {VS_ITEMS.map(v => (
                  <tr key={v.aspect}>
                    <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>{v.aspect}</td>
                    <td style={{ fontSize: '0.82rem', color: '#22c55e' }}>✅ {v.nginx}</td>
                    <td style={{ fontSize: '0.82rem', color: '#4a7a5a' }}>{v.apache}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 安装 & 基本命令 */}
      <div className="ng-section">
        <h2 className="ng-section-title">🔧 安装与核心命令</h2>
        <div className="ng-term-wrapper">
          <div className="ng-term-header">
            <div className="ng-term-dot" style={{ background: '#ef4444' }} />
            <div className="ng-term-dot" style={{ background: '#f59e0b' }} />
            <div className="ng-term-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>bash — Nginx 核心命令</span>
          </div>
          <div className="ng-term">{`# Ubuntu/Debian 安装
sudo apt update && sudo apt install -y nginx

# 核心控制命令
nginx -t              # 验证配置语法（上线前必跑！）
nginx -s reload       # 热更配置，不中断现有连接
nginx -s stop         # 立即关闭（强制）
nginx -s quit         # 优雅关闭（等待请求处理完）
nginx -v              # 查看版本
nginx -V              # 查看版本 + 编译参数（模块列表）

# 常用操作
systemctl status nginx   # 查看运行状态
systemctl enable nginx   # 开机自启
tail -f /var/log/nginx/access.log   # 实时访问日志
tail -f /var/log/nginx/error.log    # 实时错误日志

# 配置文件位置
/etc/nginx/nginx.conf              # 主配置
/etc/nginx/conf.d/*.conf           # 站点配置（推荐）
/etc/nginx/sites-available/        # Ubuntu 风格`}</div>
        </div>
      </div>

      <div className="ng-nav">
        <div />
        <button className="ng-btn primary" onClick={() => navigate('/course/nginx-mastery/lesson/config')}>下一模块：配置精通 →</button>
      </div>
    </div>
  );
}
