import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const TerminalBlock = ({ title = 'bash', lines }) => (
  <div className="terminal-block">
    <div className="terminal-topbar">
      <span className="terminal-dot red" /><span className="terminal-dot amber" /><span className="terminal-dot green" />
      <span className="terminal-title">{title}</span>
    </div>
    <div className="terminal-body">
      {lines.map((l, i) => <div key={i} dangerouslySetInnerHTML={{ __html: l }} />)}
    </div>
  </div>
);

// Process lifecycle animation
function ProcessLifecycle() {
  const [currentState, setCurrentState] = useState('created');
  const states = {
    created:  { label: '创建 (NEW)',     color: '#00e5ff', next: 'ready',   event: 'fork()/exec()' },
    ready:    { label: '就绪 (READY)',   color: '#00ff41', next: 'running', event: '调度器选中' },
    running:  { label: '运行 (RUNNING)', color: '#ffb000', next: 'waiting', event: 'I/O请求' },
    waiting:  { label: '等待 (WAITING)', color: '#ff4444', next: 'ready',   event: 'I/O完成' },
    zombie:   { label: '僵尸 (ZOMBIE)', color: '#888',    next: 'created', event: '父进程 wait()' },
  };

  const cycle = () => {
    const order = ['created', 'ready', 'running', 'waiting', 'ready', 'running', 'zombie', 'created'];
    const idx = order.indexOf(currentState);
    setCurrentState(order[(idx + 1) % order.length]);
  };

  const s = states[currentState];

  return (
    <div className="glass-panel" style={{ textAlign: 'center' }}>
      <h4 style={{ marginBottom: '1.5rem' }}>⚙️ 进程状态机（点击触发状态转换）</h4>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {Object.entries(states).map(([key, val]) => (
          <div key={key}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono,monospace',
              background: currentState === key ? `${val.color}20` : 'rgba(0,10,0,0.5)',
              border: `1px solid ${currentState === key ? val.color : 'rgba(0,255,65,0.1)'}`,
              color: currentState === key ? val.color : '#2a4a2a',
              boxShadow: currentState === key ? `0 0 12px ${val.color}50` : 'none',
              transition: 'all 0.3s' }}>
            {val.label}
          </div>
        ))}
      </div>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {currentState === 'running' ? '🏃' : currentState === 'waiting' ? '💤' : currentState === 'zombie' ? '👻' : currentState === 'ready' ? '🙋' : '🆕'}
      </div>
      <p style={{ color: s.color, fontWeight: '900', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.label}</p>
      <p style={{ color: '#4a6a4a', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        → 点击触发事件：<span style={{ color: '#00e5ff' }}>{s.event}</span> → <span style={{ color: states[s.next]?.color }}>{states[s.next]?.label}</span>
      </p>
      <button onClick={cycle}
        style={{ background: `${s.color}15`, border: `1px solid ${s.color}50`, color: s.color, padding: '0.6rem 2rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.85rem' }}>
        触发：{s.event} →
      </button>
    </div>
  );
}

const SIGNALS = [
  { sig: 'SIGTERM (15)', desc: '优雅终止请求，进程可捕获并清理。kill PID 默认发送此信号。', safe: '安全' },
  { sig: 'SIGKILL (9)',  desc: '强制终止，不可捕获、不可忽略。内核直接杀死进程。慎用。', safe: '危险' },
  { sig: 'SIGHUP (1)',   desc: '挂断信号。守护进程通常捕获它来重新加载配置（无需重启）。', safe: '安全' },
  { sig: 'SIGINT (2)',   desc: '中断信号。Ctrl+C 发送的就是它。大多数程序退出。', safe: '安全' },
  { sig: 'SIGSTOP (19)', desc: '暂停进程，不可捕获。Ctrl+Z 发送 SIGTSTP（可捕获版本）。', safe: '可逆' },
  { sig: 'SIGCONT (18)', desc: '继续运行被 SIGSTOP 暂停的进程。与 SIGSTOP 配对使用。', safe: '安全' },
  { sig: 'SIGSEGV (11)', desc: '段错误——访问了无效内存地址。通常是程序 bug 导致。', safe: '崩溃' },
  { sig: 'SIGCHLD (17)', desc: '子进程状态改变时发给父进程。父进程需调用 wait() 避免僵尸进程。', safe: '信息' },
];

const TOOLS = [
  { cmd: 'ps aux', desc: '查看所有进程（USER PID %CPU %MEM VSZ RSS TTY STAT CMD）' },
  { cmd: 'top / htop', desc: '实时进程监控，按 CPU/MEM 排序，支持交互式终止进程' },
  { cmd: 'pstree', desc: '以树状结构显示进程父子关系' },
  { cmd: 'pgrep nginx', desc: '按名称查找进程 PID（比 ps|grep 更精确）' },
  { cmd: 'lsof -p PID', desc: '查看进程打开的所有文件（网络连接、文件句柄等）' },
  { cmd: 'strace -p PID', desc: '实时跟踪进程的系统调用（调试神器）' },
  { cmd: 'nice / renice', desc: '设置/修改进程优先级（-20 最高优先，19 最低）' },
  { cmd: 'nohup cmd &', desc: '后台运行且免疫 SIGHUP（断开终端不停止）' },
];

export default function LessonProcess() {
  const navigate = useNavigate();
  const [showSignal, setShowSignal] = useState(null);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">$ module_04 — 进程管理</div>
        <h1>进程、信号与系统调用</h1>
        <p className="lesson-intro">
          进程是 Linux 系统的<strong style={{ color: '#00ff41' }}>运行单元</strong>。理解进程的生命周期、状态机、父子关系、信号机制与 /proc 接口，是排查系统故障、做性能优化、写系统工具的必备基础。
        </p>
      </header>

      {/* Process basics */}
      <section className="lesson-section">
        <h3>🔑 进程核心概念：PID、PPID 与 fork/exec</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { term: 'PID', sub: 'Process ID', desc: '每个进程唯一标识符，内核分配，进程死后 PID 回收复用。init/systemd 的 PID=1。' },
            { term: 'PPID', sub: 'Parent PID', desc: '父进程 ID。所有进程都有父进程，孤儿进程被 PID=1 收养。' },
            { term: 'fork()', sub: 'System Call', desc: '创建子进程：复制父进程的地址空间（写时复制 COW），子进程返回0，父进程返回子 PID。' },
            { term: 'exec()', sub: 'System Call', desc: '用新程序替换当前进程的代码段和数据段。fork+exec 是创建新进程的标准模式。' },
          ].map(c => (
            <div key={c.term} className="linux-card">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <code style={{ color: '#00ff41', fontSize: '1rem', fontWeight: '900' }}>{c.term}</code>
                <span style={{ color: '#4a6a4a', fontSize: '0.75rem' }}>{c.sub}</span>
              </div>
              <p style={{ color: '#7a9c7a', fontSize: '0.82rem', lineHeight: '1.65' }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <TerminalBlock title="进程查看实战" lines={[
          '<span class="t-comment"># 查看完整进程树</span>',
          '<span class="t-prompt">$</span> pstree <span class="t-flag">-p</span>',
          '<span class="t-output">systemd(1)─┬─sshd(856)───sshd(1234)───bash(1235)───pstree(1901)</span>',
          '<span class="t-output">           ├─nginx(987)─┬─nginx(988)</span>',
          '<span class="t-output">           │            └─nginx(989)</span>',
          '<span class="t-output">           └─postgres(1023)─┬─postgres(1024)</span>',
          '',
          '<span class="t-comment"># 查看进程的完整信息（通过 /proc 文件系统）</span>',
          '<span class="t-prompt">$</span> cat <span class="t-path">/proc/1234/status</span> | head -10',
          '<span class="t-output">Name:   bash</span>',
          '<span class="t-output">State:  S (sleeping)</span>',
          '<span class="t-output">Pid:    1234    PPid: 1233</span>',
          '<span class="t-output">VmRSS:  4096 kB  VmSize: 16384 kB</span>',
          '',
          '<span class="t-comment"># 查看进程的命令行参数</span>',
          '<span class="t-prompt">$</span> cat <span class="t-path">/proc/1234/cmdline</span> | tr <span class="t-string">\'\\0\'</span> <span class="t-string">\' \'</span>',
          '<span class="t-output">nginx -g daemon off; </span>',
        ]} />
      </section>

      {/* State Machine */}
      <section className="lesson-section">
        <h3>🔄 进程状态机：从创建到消亡</h3>
        <ProcessLifecycle />
        <div className="info-box warn" style={{ marginTop: '1rem' }}>
          ⚠️ <strong>僵尸进程（Zombie）：</strong> 子进程已退出但父进程还没调用 wait() 读取退出状态。进程处于 Z 状态，占用 PID 和进程表项。大量僵尸会耗尽 PID 资源。
          用 <code>ps aux | grep Z</code> 发现，发送 SIGCHLD 给父进程或直接 kill 父进程解决。
        </div>
      </section>

      {/* Signals */}
      <section className="lesson-section">
        <h3>📡 信号（Signal）：进程间的软件中断（点击展开）</h3>
        <p style={{ color: '#7a9c7a', marginBottom: '1rem', fontSize: '0.9rem' }}>
          信号是内核向进程发送的异步通知。每个信号有编号和行为，进程可以捕获、忽略或使用默认行为响应（但 SIGKILL 和 SIGSTOP 不可捕获）。
        </p>
        <div className="space-y-2">
          {SIGNALS.map((s, i) => (
            <div key={i} className={`expand-card ${showSignal === i ? 'open' : ''}`} onClick={() => setShowSignal(showSignal === i ? null : i)}>
              <div className="expand-header">
                <code style={{ color: s.safe === '危险' ? '#ff4444' : s.safe === '崩溃' ? '#ff6666' : '#00ff41', minWidth: '8rem', fontSize: '0.82rem' }}>{s.sig}</code>
                <span style={{ fontSize: '0.78rem', padding: '0.1rem 0.5rem', borderRadius: '3px', marginRight: '0.5rem',
                  background: s.safe === '危险' ? 'rgba(255,68,68,0.15)' : s.safe === '崩溃' ? 'rgba(255,100,0,0.15)' : 'rgba(0,255,65,0.1)',
                  color: s.safe === '危险' ? '#ff4444' : s.safe === '崩溃' ? '#ff8800' : '#00cc33',
                  fontFamily: 'JetBrains Mono,monospace' }}>{s.safe}</span>
                <span style={{ color: '#4a6a4a', fontSize: '0.8rem' }}>{s.desc.substring(0, 40)}...</span>
              </div>
              {showSignal === i && (
                <div className="expand-body fade-in">
                  <p style={{ color: '#a0c0a0', marginBottom: '0.75rem' }}>{s.desc}</p>
                  <TerminalBlock title="发送信号" lines={[
                    `<span class="t-comment"># 发送 ${s.sig.split(' ')[0]} 给进程</span>`,
                    `<span class="t-prompt">$</span> kill <span class="t-flag">-${s.sig.split('(')[1]?.replace(')', '') || s.sig.split(' ')[1]?.replace(/[()]/g, '')}</span> PID`,
                    `<span class="t-prompt">$</span> pkill <span class="t-flag">-${s.sig.split('(')[1]?.replace(')', '') || '15'}</span> nginx    <span class="t-comment"># 按名称发送</span>`,
                    `<span class="t-prompt">$</span> killall <span class="t-flag">-${s.sig.split('(')[1]?.replace(')', '') || '15'}</span> nginx`,
                  ]} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Process Tools */}
      <section className="lesson-section">
        <h3>🛠️ 进程管理核心工具速查</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {TOOLS.map(t => (
            <div key={t.cmd} className="linux-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <code style={{ color: '#00ff41', fontSize: '0.82rem' }}>{t.cmd}</code>
              <p style={{ color: '#4a6a4a', fontSize: '0.8rem', lineHeight: '1.6' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/linux-mastery/lesson/network')}>
          $ cd next_chapter  # 网络与防火墙 →
        </button>
      </section>
    </div>
  );
}
