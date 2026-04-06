import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 实时系统指标模拟器
function SystemMonitor() {
  const [metrics, setMetrics] = useState({ cpu: 45, mem: 62, io: 28, net: 15 });
  const [history, setHistory] = useState(Array(30).fill(null).map(() => ({ cpu: 40+Math.random()*20, io: 20+Math.random()*15 })));
  const [running, setRunning] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    if (!running) return clearInterval(timer.current);
    timer.current = setInterval(() => {
      setMetrics(m => ({
        cpu: Math.max(5, Math.min(98, m.cpu + (Math.random()-0.48)*8)),
        mem: Math.max(20, Math.min(90, m.mem + (Math.random()-0.49)*3)),
        io:  Math.max(0,  Math.min(100, m.io  + (Math.random()-0.47)*12)),
        net: Math.max(0,  Math.min(100, m.net + (Math.random()-0.5)*10)),
      }));
      setHistory(h => [...h.slice(1), { cpu: metrics.cpu, io: metrics.io }]);
    }, 800);
    return () => clearInterval(timer.current);
  }, [running, metrics.cpu, metrics.io]);

  const getColor = v => v > 80 ? '#ef4444' : v > 60 ? '#f97316' : '#22c55e';

  // SVG sparkline
  const W = 200, H = 40;
  const cpuPath = history.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i/29)*W},${H - (p?.cpu||40)/100*H}`).join(' ');

  return (
    <div className="po-interactive">
      <h3>📡 实时系统指标监控
        <button className={`po-btn ${running ? '' : 'green'}`} onClick={() => setRunning(r => !r)} style={{ fontSize: '0.75rem' }}>
          {running ? '⏸ 暂停' : '▶ 继续'}
        </button>
      </h3>
      <div className="po-grid-4" style={{ marginBottom: '0.875rem' }}>
        {[['CPU', metrics.cpu, '用户态+内核态'], ['内存', metrics.mem, 'RSS占比'], ['磁盘 I/O', metrics.io, '等待率%'], ['网络', metrics.net, '带宽利用率']].map(([name, val, sub]) => (
          <div key={name} className="po-metric" style={{ borderColor: `${getColor(val)}25` }}>
            <div className="po-metric-val" style={{ color: getColor(val) }}>{val.toFixed(0)}%</div>
            <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.72rem', margin: '0.1rem 0' }}>{name}</div>
            <div style={{ marginTop: '0.3rem' }}>
              <div className="po-progress"><div className="po-progress-fill" style={{ width: `${val}%`, background: getColor(val) }} /></div>
            </div>
            <div className="po-metric-label">{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#0a0a10', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', padding: '0.4rem 0.625rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#475569', marginBottom: '0.15rem' }}>CPU 折线（30秒）</div>
          <svg width={W} height={H}>
            <path d={cpuPath} fill="none" stroke={getColor(metrics.cpu)} strokeWidth={1.5} opacity={0.8} />
            <line x1={0} y1={H*0.2} x2={W} y2={H*0.2} stroke="rgba(239,68,68,0.2)" strokeWidth={1} strokeDasharray="3 3" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 180, fontSize: '0.72rem', color: '#475569', lineHeight: 2 }}>
          <div style={{ color: metrics.cpu > 80 ? '#ef4444' : '#22c55e' }}>{metrics.cpu > 80 ? '🔴' : '🟢'} CPU {'>'} 80%: {metrics.cpu > 80 ? '考虑水平扩容或代码优化' : '正常'}</div>
          <div style={{ color: metrics.mem > 80 ? '#ef4444' : '#22c55e' }}>{metrics.mem > 80 ? '🔴' : '🟢'} 内存 {'>'} 80%: {metrics.mem > 80 ? '检查内存泄漏' : '正常'}</div>
          <div style={{ color: metrics.io > 70 ? '#f97316' : '#22c55e' }}>{metrics.io > 70 ? '🟡' : '🟢'} I/O Wait {'>'} 70%: {metrics.io > 70 ? '磁盘瓶颈，考虑 SSD 或缓存' : '正常'}</div>
        </div>
      </div>
    </div>
  );
}

const LINUX_TOOLS = [
  {
    category: 'CPU 分析', icon: '🧠', color: '#ef4444',
    tools: [
      { cmd: 'perf top', desc: '实时查看热点函数（类似 top 但显示到函数级别）' },
      { cmd: 'perf record -g -p PID', desc: '采样指定进程（-g 含调用栈），生成 perf.data' },
      { cmd: 'perf report --stdio', desc: '文本格式查看热点函数百分比' },
      { cmd: 'mpstat -P ALL 1', desc: '每个 CPU 核的利用率分布（找 CPU 不均衡）' },
    ],
  },
  {
    category: '内存分析', icon: '💾', color: '#3b82f6',
    tools: [
      { cmd: 'free -h', desc: '总内存/已用/可用/Swap 使用情况' },
      { cmd: 'vmstat 1 10', desc: '包含 si/so（swap in/out），paging 活动' },
      { cmd: 'cat /proc/$PID/smaps', desc: '进程内存段详情：PSS/RSS/anonymous/shared' },
      { cmd: 'valgrind --tool=massif', desc: 'C/C++ 堆内存分配分析，生成堆快照' },
    ],
  },
  {
    category: '磁盘 I/O', icon: '💿', color: '#f97316',
    tools: [
      { cmd: 'iostat -xdz 1', desc: '%util(设备利用率) await(平均等待ms) 每秒读写MB' },
      { cmd: 'iotop -P', desc: '实时显示进程级 I/O 读写速率（需 root）' },
      { cmd: 'blktrace /dev/sda', desc: '块设备 I/O 完整追踪，用于找 seek 模式' },
      { cmd: 'fio --bs=4k --direct=1', desc: '精确测量磁盘 IOPS/带宽/延迟基准值' },
    ],
  },
  {
    category: '网络分析', icon: '🌐', color: '#22c55e',
    tools: [
      { cmd: 'ss -s', desc: '套接字统计：TCP连接状态分布（CLOSE_WAIT太多？）' },
      { cmd: 'tcpdump -i eth0 -w out.pcap', desc: '抓包保存为 pcap，Wireshark 可视化分析' },
      { cmd: 'nethogs eth0', desc: '进程级网络带宽实时监控' },
      { cmd: 'nstat -az', desc: '网络栈统计：重传/RST/OOM 等内核计数器' },
    ],
  },
];

const EBPF_CODE = `# eBPF 现代性能分析工具（bcc / bpftrace）

# ── 1. 追踪所有慢于 10ms 的系统调用 ──
bpftrace -e '
  tracepoint:syscalls:sys_enter_read { @start[tid] = nsecs; }
  tracepoint:syscalls:sys_exit_read  /(@start[tid])/ {
    $lat = (nsecs - @start[tid]) / 1000000;
    if ($lat > 10) { printf("read() took %dms, PID=%d\n", $lat, pid); }
    delete(@start[tid]);
  }
'

# ── 2. 统计 CPU 栈分布（火焰图数据源）──
sudo perf record -F 99 -g -p $(pgrep python3) -- sleep 30
sudo perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg
open flame.svg    # 在浏览器打开 SVG 交互火焰图

# ── 3. 追踪 ext4 文件系统慢操作 ──
funclatency 'ext4_file_write_iter'   # 显示延迟分布直方图

# ── 4. TCP 重传分析 ──
tcpretrans                           # 实时打印 TCP 重传事件（含进程名+远端IP）

# ── 5. 函数调用频次统计 ──
funccount 'python:*' -p $(pgrep uvicorn)  # 统计 Python 函数调用次数

# ── 6. 系统调用延迟直方图 ──
syscount -L -p PID    # 显示各系统调用的次数和总延迟

# ── perf 常用场景速查 ──
# CPU 密集：perf top -g
# 等待分析：perf trace --event 'sched:*' sleep 5
# Cache Miss：perf stat -e L1-dcache-load-misses,LLC-load-misses ./program
# 分支预测失败：perf stat -e branch-misses,branch-instructions ./program`;

export default function LessonLinux() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(0);
  const cat = LINUX_TOOLS[activeCategory];

  return (
    <div className="lesson-po">
      <div className="po-badge red">🐧 module_02 — Linux 系统调优</div>
      <div className="po-hero">
        <h1>Linux 系统调优：perf / eBPF / CPU / I/O 分析</h1>
        <p>Linux 提供丰富的内核级性能工具。<strong>perf</strong> 是 CPU 级别采样器，<strong>eBPF</strong> 是无侵入式动态追踪神器，结合实时指标（vmstat/iostat/ss）可以在30秒内定位90%的系统性能问题。</p>
      </div>

      <SystemMonitor />

      <div className="po-section">
        <h2 className="po-section-title">🔧 Linux 性能工具速查（按类别）</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {LINUX_TOOLS.map((c, i) => (
            <button key={i} onClick={() => setActiveCategory(i)}
              style={{ flex: 1, minWidth: 120, padding: '0.625rem', borderRadius: '9px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.15s',
                border: `1px solid ${activeCategory === i ? c.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeCategory === i ? `${c.color}10` : 'rgba(255,255,255,0.02)',
                color: activeCategory === i ? c.color : '#64748b' }}>
              <div>{c.icon}</div>{c.category}
            </button>
          ))}
        </div>
        <div className="po-card" style={{ borderColor: `${cat.color}15`, padding: '0' }}>
          <table className="po-table">
            <thead><tr><th style={{ color: cat.color }}>命令</th><th>说明</th></tr></thead>
            <tbody>
              {cat.tools.map(t => (
                <tr key={t.cmd}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: cat.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{t.cmd}</td>
                  <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="po-section">
        <h2 className="po-section-title">🔬 eBPF / perf 高级用法</h2>
        <div className="po-code-wrap">
          <div className="po-code-head"><div className="po-code-dot" style={{ background: '#ef4444' }}/><div className="po-code-dot" style={{ background: '#f97316' }}/><div className="po-code-dot" style={{ background: '#22c55e' }}/><span style={{ color: '#22c55e', marginLeft: '0.5rem' }}>🔬 ebpf-perf.sh</span></div>
          <div className="po-code" style={{ maxHeight: 380, overflowY: 'auto' }}>{EBPF_CODE}</div>
        </div>
      </div>

      <div className="po-nav">
        <button className="po-btn" onClick={() => navigate('/course/perf-optimization/lesson/foundation')}>← 上一模块</button>
        <button className="po-btn primary" onClick={() => navigate('/course/perf-optimization/lesson/python')}>下一模块：Python 性能 →</button>
      </div>
    </div>
  );
}
