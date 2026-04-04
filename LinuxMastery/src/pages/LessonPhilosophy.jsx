import React, { useState } from 'react';
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

const PILLARS = [
  { icon: '📄', name: 'Everything is a File', desc: '设备、管道、网络套接字——Linux 把一切抽象为文件，统一了操作接口。你 cat 一个串口设备就像 cat 一个文本文件一样。', detail: '/dev/sda（磁盘）、/dev/null（黑洞）、/proc/cpuinfo（CPU 信息）、/sys/class/net/eth0（网卡）——全是文件。' },
  { icon: '🧩', name: '一个程序只做一件事', desc: '每个工具专注做好一件事：ls 只列目录、grep 只过滤文本、wc 只计数。组合它们才是 Linux 的魔法。', detail: '理查德·斯托曼总结：小而美的工具 + 管道组合 = 无限能力。这也是 Unix 哲学的精华。' },
  { icon: '🔗', name: '管道与组合', desc: 'cmd1 | cmd2 | cmd3——左边的输出变成右边的输入，无需中间文件，无需改代码，只需想象力。', detail: 'ps aux | grep nginx | awk \'{print $2}\' | xargs kill -9 ——用三个独立工具完成查找并结束进程' },
  { icon: '📝', name: '纯文本是万能接口', desc: '配置文件、日志、进程通信——能用文本的地方不用二进制。文本可读、可 diff、可版本控制、可管道处理。', detail: '/etc/nginx/nginx.conf、~/.bashrc、/var/log/syslog——所有重要配置都是 human-readable 文本。' },
  { icon: '🔇', name: '沉默是金', desc: '命令成功不输出任何东西。0 = 成功，非 0 = 失败。只在需要时说话——脚本友好，可组合。', detail: 'cp file.txt backup/ 成功时什么都不说。echo $? 输出0。失败时才告诉你出了什么问题。' },
  { icon: '👤', name: '每个用户都有自己的空间', desc: 'root 万能但危险，普通用户受限但安全。最小权限原则（Principle of Least Privilege）是 Linux 安全的基石。', detail: 'sudo 是"需要时借用超级权限"。好的 Linux 使用习惯：能不用 root 就不用 root。' },
];

const LAYERS = [
  { layer: '用户空间 (User Space)', color: '#00ff41', items: ['应用程序 (nginx, bash, python…)', '标准库 (glibc, musl)', '系统调用接口 (syscall)'] },
  { layer: '内核空间 (Kernel Space)', color: '#00e5ff', items: ['进程调度 (CFS Scheduler)', '内存管理 (Virtual Memory)', '文件系统 (VFS → ext4/xfs)', '网络协议栈 (TCP/IP)', '设备驱动 (Drivers)'] },
  { layer: '硬件 (Hardware)', color: '#ffb000', items: ['CPU · Memory · Disk · NIC · GPU'] },
];

const DISTROS = [
  { name: 'Ubuntu / Debian', use: '桌面 / 云服务器首选', pkg: 'apt', family: 'Debian', color: '#E95420' },
  { name: 'CentOS / RHEL / Rocky', use: '企业生产环境标准', pkg: 'yum/dnf', family: 'RHEL', color: '#EE0000' },
  { name: 'Arch Linux', use: '极客 DIY / 滚动更新', pkg: 'pacman', family: 'Arch', color: '#1793D1' },
  { name: 'Alpine Linux', use: 'Docker 镜像 / 嵌入式', pkg: 'apk', family: 'Alpine', color: '#0D597F' },
  { name: 'Amazon Linux / openEuler', use: '云原生 / 国产替代', pkg: 'dnf', family: 'RHEL系', color: '#FF9900' },
];

const EVERYTHING_EXAMPLES = [
  { path: '/dev/sda', desc: '第一块物理磁盘', type: '块设备' },
  { path: '/dev/null', desc: '黑洞，写入丢弃，读取为空', type: '字符设备' },
  { path: '/dev/urandom', desc: '随机数生成器', type: '字符设备' },
  { path: '/proc/cpuinfo', desc: 'CPU 详细信息（内核动态生成）', type: 'procfs' },
  { path: '/proc/meminfo', desc: '内存使用情况（实时）', type: 'procfs' },
  { path: '/proc/1/fd/', desc: 'PID=1 进程打开的文件描述符', type: 'procfs' },
  { path: '/sys/class/net/eth0', desc: '网卡配置与状态', type: 'sysfs' },
  { path: '/sys/block/sda/size', desc: '磁盘大小（扇区数）', type: 'sysfs' },
  { path: '/tmp/my.sock', desc: 'Unix Domain Socket（进程间通信）', type: 'socket' },
];

export default function LessonPhilosophy() {
  const navigate = useNavigate();
  const [openPillar, setOpenPillar] = useState(null);
  const [showAllFiles, setShowAllFiles] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">$ module_01 — Linux 哲学</div>
        <h1>Everything is a File</h1>
        <p className="lesson-intro">
          理解 Linux 不是背命令，而是理解它的<strong style={{ color: '#00ff41' }}>设计哲学</strong>。1969 年从贝尔实验室诞生的 Unix，用六个原则构建了世界 90% 以上服务器的操作系统基础。一旦你理解这些原则，Linux 的每个设计决策都会变得理所当然。
        </p>
      </header>

      {/* Linux Kernel Architecture */}
      <section className="lesson-section">
        <h3>🏗️ Linux 系统架构：三层世界</h3>
        <div className="space-y-3">
          {LAYERS.map(l => (
            <div key={l.layer} style={{ borderRadius: '8px', border: `1px solid ${l.color}30`, background: `${l.color}06`, padding: '1rem 1.25rem' }}>
              <p style={{ color: l.color, fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{l.layer}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {l.items.map(item => (
                  <span key={item} style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', borderRadius: '4px', background: `${l.color}12`, border: `1px solid ${l.color}25`, color: '#a0c0a0' }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <TerminalBlock title="系统调用示例" lines={[
          '<span class="t-comment"># 查看系统调用——从用户到内核的桥梁</span>',
          '<span class="t-prompt">root@linux:~#</span> <span class="t-cmd">strace</span> <span class="t-flag">-e trace=read,write,open</span> cat /etc/hostname',
          '<span class="t-output">openat(AT_FDCWD, "/etc/hostname", O_RDONLY) = 3</span>',
          '<span class="t-output">read(3, "myserver\\n", 131072)             = 9</span>',
          '<span class="t-output">write(1, "myserver\\n", 9)                 = 9</span>',
          '<span class="t-output">myserver</span>',
          '<span class="t-comment"># 一个简单的 cat 命令底层触发了 openat → read → write 三个系统调用</span>',
        ]} />
      </section>

      {/* Six Pillars */}
      <section className="lesson-section">
        <h3>⚙️ Unix/Linux 六大设计哲学（点击展开）</h3>
        <div className="space-y-2">
          {PILLARS.map((p, i) => (
            <div key={i} className={`expand-card ${openPillar === i ? 'open' : ''}`} onClick={() => setOpenPillar(openPillar === i ? null : i)}>
              <div className="expand-header">
                <span style={{ fontSize: '1.25rem' }}>{p.icon}</span>
                <span style={{ color: openPillar === i ? '#00ff41' : '#c8d9c8', fontFamily: 'JetBrains Mono, monospace' }}>{p.name}</span>
                <span style={{ marginLeft: 'auto', color: '#2a4a2a', fontSize: '0.75rem' }}>{p.desc.substring(0, 40)}...</span>
              </div>
              {openPillar === i && (
                <div className="expand-body fade-in">
                  <p style={{ color: '#a0c0a0', marginBottom: '0.75rem' }}>{p.desc}</p>
                  <div className="info-box tip">💡 {p.detail}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Everything is a File - interactive */}
      <section className="lesson-section">
        <h3>📄 Everything is a File — 深度解析</h3>
        <p style={{ color: '#7a9c7a', marginBottom: '1rem', lineHeight: '1.75' }}>
          Linux 最颠覆性的设计：一切都通过统一的文件接口操作。你用同一套 API（open/read/write/close）操作磁盘文件、串口、网络连接、内核数据。
        </p>
        <TerminalBlock title="Everything is a File 实战" lines={[
          '<span class="t-comment"># 读取 CPU 信息——这是文件，不是命令</span>',
          '<span class="t-prompt">$</span> <span class="t-cmd">cat</span> <span class="t-path">/proc/cpuinfo</span> | grep "model name" | head -1',
          '<span class="t-output">model name : Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz</span>',
          '',
          '<span class="t-comment"># 写入文件来改变内核行为</span>',
          '<span class="t-prompt">root#</span> <span class="t-cmd">echo</span> <span class="t-string">1</span> > <span class="t-path">/proc/sys/net/ipv4/ip_forward</span>',
          '<span class="t-comment"># 上面这行开启了 IP 转发（让服务器变成路由器）</span>',
          '',
          '<span class="t-comment"># 向设备文件写入来控制硬件</span>',
          '<span class="t-prompt">root#</span> <span class="t-cmd">echo</span> <span class="t-string">1</span> > <span class="t-path">/sys/class/leds/power_led/brightness</span>',
          '<span class="t-comment"># 点亮电源指示灯——写文件！</span>',
          '',
          '<span class="t-comment"># 从随机设备生成密码</span>',
          '<span class="t-prompt">$</span> <span class="t-cmd">head</span> <span class="t-flag">-c</span> 16 <span class="t-path">/dev/urandom</span> | base64',
          '<span class="t-output">kT9mZqRx3BvLpN2w</span>',
        ]} />
        <div style={{ marginTop: '1.25rem' }}>
          <button onClick={() => setShowAllFiles(!showAllFiles)}
            style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', padding: '0.5rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem' }}>
            {showAllFiles ? '收起' : '查看更多"一切皆文件"示例'}
          </button>
          {showAllFiles && (
            <div className="fade-in" style={{ marginTop: '1rem', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(0,255,65,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,30,0,0.8)', color: '#4a6a4a' }}>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontFamily: 'JetBrains Mono,monospace' }}>路径</th>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>描述</th>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>类型</th>
                  </tr>
                </thead>
                <tbody>
                  {EVERYTHING_EXAMPLES.map((e, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(0,255,65,0.06)', background: i % 2 === 0 ? 'rgba(0,10,0,0.4)' : 'transparent' }}>
                      <td style={{ padding: '0.6rem 1rem', fontFamily: 'JetBrains Mono,monospace', color: '#ffb000', fontSize: '0.78rem' }}>{e.path}</td>
                      <td style={{ padding: '0.6rem 1rem', color: '#7a9c7a' }}>{e.desc}</td>
                      <td style={{ padding: '0.6rem 1rem', color: '#00e5ff', fontSize: '0.75rem' }}>{e.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Distros */}
      <section className="lesson-section">
        <h3>🐧 Linux 发行版生态图谱</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {DISTROS.map(d => (
            <div key={d.name} className="linux-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
                <p style={{ color: '#c8d9c8', fontWeight: '700', fontSize: '0.875rem' }}>{d.name}</p>
              </div>
              <p style={{ color: '#4a6a4a', fontSize: '0.78rem', marginBottom: '0.35rem' }}>{d.use}</p>
              <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '3px', background: 'rgba(0,255,65,0.08)', color: '#00cc33', fontFamily: 'JetBrains Mono,monospace' }}>{d.pkg}</span>
            </div>
          ))}
        </div>
        <div className="info-box note" style={{ marginTop: '1rem' }}>
          📌 <strong>如何选择？</strong> 学习推荐 Ubuntu（资料最多）；生产环境用 Rocky Linux / RHEL；容器镜像用 Alpine（5MB！）；想精通内核用 Arch Linux。
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/linux-mastery/lesson/shell')}>
          $ cd next_chapter  # Shell 精通 →
        </button>
      </section>
    </div>
  );
}
