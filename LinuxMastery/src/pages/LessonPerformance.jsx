import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
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

const BOTTLENECKS = [
  {
    name: 'CPU 瓶颈',
    color: '#ff8800',
    symptoms: ['load avg 持续 > CPU 核数', 'top 中 %us（用户）或 %sy（内核）居高不下', 'wa（等待）低，说明不是 IO 慢'],
    tools: [
      { cmd: 'top / htop', desc: '实时 CPU 使用率，按 P 排序进程' },
      { cmd: 'mpstat -P ALL 1', desc: '每核 CPU 使用率（发现热点核心）' },
      { cmd: 'perf top', desc: '函数级热点分析（找内核/用户代码热点）' },
      { cmd: 'pidstat -u 1', desc: '按进程显示 CPU 使用率变化' },
    ],
    tuning: [
      'taskset -cp 0,1 PID  # 绑定进程到特定 CPU核（减少上下文切换）',
      'nice/renice 调整进程优先级',
      'numactl --cpunodebind=0 cmd  # NUMA 感知调度',
    ]
  },
  {
    name: '内存瓶颈',
    color: '#00e5ff',
    symptoms: ['free -h 显示可用内存持续走低', 'vmstat si/so 列非零（发生 swap）', 'OOM killer 在 dmesg 中的日志'],
    tools: [
      { cmd: 'free -h', desc: '内存/Swap 使用概览（buff/cache 可回收）' },
      { cmd: 'vmstat 1', desc: 'si/so 是关键：swap in/out 说明物理内存不足' },
      { cmd: 'smem / pmap -x PID', desc: '进程内存详细分布（PSS 更准确）' },
      { cmd: 'cat /proc/meminfo', desc: '详细内存分类：Buffers/Cached/Dirty 等' },
    ],
    tuning: [
      'sysctl vm.swappiness=10  # 减少 swap 倾向（生产服务器推荐值）',
      'sysctl vm.dirty_ratio=10  # 脏页比例（写密集场景调低）',
      'echo 3 > /proc/sys/vm/drop_caches  # 手动释放 page cache（谨慎使用）',
    ]
  },
  {
    name: 'I/O 瓶颈',
    color: '#00ff41',
    symptoms: ['iostat 中 %util 接近 100%', 'top 中 %wa（IO wait）高', 'ls/MySQL 操作明显变慢'],
    tools: [
      { cmd: 'iostat -x 1', desc: '%util: 磁盘繁忙度；await: 平均延迟（ms）' },
      { cmd: 'iotop -o', desc: '实时按进程显示 I/O 占用（需 root）' },
      { cmd: 'blktrace/blkparse', desc: '块层 I/O 追踪（深度诊断 I/O 类型）' },
      { cmd: 'fio --randread --bs=4k', desc: 'I/O 性能基准测试（IOPS/带宽）' },
    ],
    tuning: [
      'echo deadline > /sys/block/sda/queue/scheduler  # HDD 推荐 deadline 调度器',
      'echo none > /sys/block/nvme0n1/queue/scheduler  # SSD/NVMe 推荐 none(mq-deadline)',
      'sysctl vm.dirty_writeback_centisecs=100  # 脏页写回频率',
    ]
  },
  {
    name: '网络瓶颈',
    color: '#a855f7',
    symptoms: ['ss -s 中 TIME_WAIT 数量巨大', 'netstat 中 Recv-Q/Send-Q 积压', '网络延迟或丢包'],
    tools: [
      { cmd: 'sar -n DEV 1', desc: '网卡吞吐量实时监控（rxkB/s txkB/s）' },
      { cmd: 'ss -s', desc: '连接状态统计：TIME_WAIT/CLOSE_WAIT 趋势' },
      { cmd: 'tcpdump -i eth0 -w dump.pcap', desc: '抓包保存，用 Wireshark 深度分析' },
      { cmd: 'nethogs / iftop', desc: '按进程/连接实时显示网络带宽' },
    ],
    tuning: [
      'sysctl net.ipv4.tcp_tw_reuse=1  # 允许复用 TIME_WAIT 连接',
      'sysctl net.core.somaxconn=65535  # 增大连接队列（高并发服务）',
      'sysctl net.ipv4.tcp_max_syn_backlog=65535',
    ]
  },
];

const SYSCTL_PARAMS = [
  { param: 'vm.swappiness', default: '60', prod: '10', desc: '内存满多久开始用 swap（0-100），越低越不用 swap' },
  { param: 'net.ipv4.tcp_tw_reuse', default: '0', prod: '1', desc: '允许 TIME_WAIT socket 被新连接复用' },
  { param: 'net.core.somaxconn', default: '128', prod: '65535', desc: '监听队列最大连接数（nginx/应用层 backlog）' },
  { param: 'fs.file-max', default: '98000', prod: '1000000', desc: '系统级最大文件描述符数量' },
  { param: 'kernel.pid_max', default: '32768', prod: '65536', desc: '系统最大 PID 数（高并发容器场景需增大）' },
  { param: 'vm.dirty_ratio', default: '20', prod: '10', desc: '触发强制写回的脏页比例（写密集调低）' },
  { param: 'net.ipv4.tcp_fin_timeout', default: '60', prod: '30', desc: 'TCP FIN_WAIT2 超时时间（秒）' },
];

export default function LessonPerformance() {
  const navigate = useNavigate();
  const [activeBottleneck, setActiveBottleneck] = useState(0);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">$ module_08 — 性能调优</div>
        <h1>压榨内核的每一滴性能</h1>
        <p className="lesson-intro">
          性能问题 80% 是 CPU / 内存 / I/O / 网络四个层面之一的瓶颈。掌握<strong style={{ color: '#00ff41' }}>定位 → 量化 → 调参</strong>的系统方法论，你就能在生产环境中做出有数据支撑的优化决策。
        </p>
      </header>

      {/* Performance Method */}
      <section className="lesson-section">
        <h3>📐 Brendan Gregg 性能分析方法论</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { step: '1 定义基线', icon: '📏', desc: '先量化"慢"——响应时间、IOPS、CPU%……没有数字就没有优化' },
            { step: '2 Top-Down 分解', icon: '🔝', desc: '从宏观（load avg）到微观（函数 CPU 时间），逐层下钻' },
            { step: '3 排除法', icon: '❌', desc: '一个时间只改一个变量，用数据否定或确认假设' },
            { step: '4 USE 方法论', icon: '⚡', desc: '对每个资源检查 Utilization / Saturation / Errors' },
          ].map(s => (
            <div key={s.step} className="linux-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <p style={{ color: '#00ff41', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>{s.step}</p>
              <p style={{ color: '#4a6a4a', fontSize: '0.8rem', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <TerminalBlock title="Linux 60 秒速检：服务器刚挂了，先看什么" lines={[
          '<span class="t-comment"># 1. 系统负载和进程概况</span>',
          '<span class="t-prompt">$</span> uptime',
          '<span class="t-output"> 19:00:01 up 5 days, load average: <span class="t-error">8.23, 7.98, 6.50</span></span>',
          '',
          '<span class="t-comment"># 2. dmesg 看内核报错（OOM？硬件故障？）</span>',
          '<span class="t-prompt">#</span> dmesg <span class="t-flag">-T | tail -20</span>',
          '',
          '<span class="t-comment"># 3. vmstat 1 5(1秒采样5次): r=运行队列 b=阻塞 si/so=swap</span>',
          '<span class="t-prompt">$</span> vmstat 1 5',
          '<span class="t-output">procs  memory       swap     io      system     cpu</span>',
          '<span class="t-output"> r  b  swpd free  si  so   bi   bo   in   cs  us sy id wa</span>',
          '<span class="t-output"><span class="t-error"> 6</span>  0   0 1.2G   0   0  100  200 1200 5000  60  5 30 <span class="t-error">5</span></span>',
          '',
          '<span class="t-comment"># 4. CPU 详情（%wa 高 = IO 等待，%sy 高 = 内核态忙）</span>',
          '<span class="t-prompt">$</span> mpstat <span class="t-flag">-P ALL</span> 1 3',
          '',
          '<span class="t-comment"># 5. 磁盘繁忙度（%util 接近100 = IO 等待）</span>',
          '<span class="t-prompt">$</span> iostat <span class="t-flag">-x</span> 1 3',
        ]} />
      </section>

      {/* Four Bottlenecks */}
      <section className="lesson-section">
        <h3>🎯 四大瓶颈诊断（点击切换）</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {BOTTLENECKS.map((b, i) => (
            <button key={i} onClick={() => setActiveBottleneck(i)}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem', cursor: 'pointer',
                background: activeBottleneck === i ? `${b.color}18` : 'rgba(0,255,65,0.04)',
                border: `1px solid ${activeBottleneck === i ? b.color + '60' : 'rgba(0,255,65,0.12)'}`,
                color: activeBottleneck === i ? b.color : '#4a6a4a' }}>
              {b.name}
            </button>
          ))}
        </div>
        <div className="glass-panel fade-in" style={{ borderColor: BOTTLENECKS[activeBottleneck].color + '25' }}>
          <h4 style={{ color: BOTTLENECKS[activeBottleneck].color, marginBottom: '1rem' }}>{BOTTLENECKS[activeBottleneck].name} 诊断与优化</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: '#4a6a4a', fontSize: '0.78rem', marginBottom: '0.5rem', fontWeight: '700' }}>⚠️ 症状特征</p>
              {BOTTLENECKS[activeBottleneck].symptoms.map(s => (
                <p key={s} style={{ color: '#7a9c7a', fontSize: '0.82rem', marginBottom: '0.3rem' }}>• {s}</p>
              ))}
            </div>
            <div>
              <p style={{ color: '#4a6a4a', fontSize: '0.78rem', marginBottom: '0.5rem', fontWeight: '700' }}>🛠️ 诊断工具</p>
              {BOTTLENECKS[activeBottleneck].tools.map(t => (
                <div key={t.cmd} style={{ marginBottom: '0.4rem' }}>
                  <code style={{ color: BOTTLENECKS[activeBottleneck].color, fontSize: '0.78rem' }}>{t.cmd}</code>
                  <p style={{ color: '#4a6a4a', fontSize: '0.75rem' }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: '#4a6a4a', fontSize: '0.78rem', marginBottom: '0.5rem', fontWeight: '700' }}>⚡ 调优手段</p>
            {BOTTLENECKS[activeBottleneck].tuning.map(t => (
              <div key={t} style={{ background: 'rgba(0,5,0,0.6)', borderRadius: '4px', padding: '0.4rem 0.75rem', marginBottom: '0.35rem', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: '#7fff7f' }}>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* sysctl Reference */}
      <section className="lesson-section">
        <h3>⚙️ 生产级 sysctl 参数速查</h3>
        <div className="info-box warn" style={{ marginBottom: '1rem' }}>
          ⚠️ sysctl 参数修改立即生效但重启丢失。永久生效需写入 <code>/etc/sysctl.d/99-tuning.conf</code>，然后执行 <code>sysctl --system</code>。
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,20,0,0.8)' }}>
                {['参数', '默认值', '生产推荐', '说明'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#4a6a4a', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.75rem', borderBottom: '1px solid rgba(0,255,65,0.15)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SYSCTL_PARAMS.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,255,65,0.06)', background: i % 2 === 0 ? 'rgba(0,10,0,0.3)' : 'transparent' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}><code style={{ color: '#00ff41', fontSize: '0.78rem' }}>{p.param}</code></td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#ff8800', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem' }}>{p.default}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#4ade80', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', fontWeight: '700' }}>{p.prod}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#4a6a4a', lineHeight: '1.5', fontSize: '0.78rem' }}>{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Graduation */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(0,50,0,0.3), rgba(0,30,0,0.5))', borderRadius: '12px', border: '1px solid rgba(0,255,65,0.3)', marginTop: '3rem' }}>
        <Trophy size={60} style={{ color: '#00ff41', margin: '0 auto', display: 'block', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(0,255,65,0.7))' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(to right, #c8ffd4, #00ff41)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🎓 恭喜完成《Linux 从入门到精通》！
        </h2>
        <p style={{ color: '#7a9c7a', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.8', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.9rem' }}>
          从 "Everything is a File" 到内核调参，你已经走过了 Linux 系统的完整知识版图。<br />
          记住 Linus Torvalds 的话：<br />
          <strong style={{ color: '#00ff41' }}>"RTFM and then hack it."</strong><br />
          最好的学习，是动手改出问题、再改回来。
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {['Linux哲学', 'Everything is a File', 'Bash脚本', '管道', 'FHS', '权限模型', 'SUID', '进程', 'fork/exec', '信号', '/proc', 'TCP/IP', 'iptables', 'DNS', 'LVM', 'ext4', 'xfs', 'systemd', 'cron', 'sysctl', 'iostat', 'perf', 'vmstat'].map(tag => (
            <span key={tag} style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(0,255,65,0.25)', color: '#4a8a4a', fontSize: '0.72rem', background: 'rgba(0,255,65,0.05)', fontFamily: 'JetBrains Mono,monospace' }}>{tag}</span>
          ))}
        </div>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'linear-gradient(135deg, #006600, #009900)', color: '#c8ffc8', border: '1px solid rgba(0,255,65,0.5)', padding: '1rem 2.5rem', borderRadius: '6px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', fontFamily: 'JetBrains Mono,monospace', boxShadow: '0 8px 30px rgba(0,160,0,0.5)' }}>
          $ cd /dashboard  # 返回课程中心
        </button>
      </section>
    </div>
  );
}
