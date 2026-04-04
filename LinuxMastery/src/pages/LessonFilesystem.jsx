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

const FHS_DIRS = [
  { path: '/', desc: '根目录，一切的起点。整个文件系统树的根。' },
  { path: '/bin', desc: '所有用户可用的基础命令：ls, cp, mv, cat, grep 等（符号链接到 /usr/bin）' },
  { path: '/sbin', desc: '系统管理命令：fdisk, iptables, shutdown, reboot（需要 root）' },
  { path: '/etc', desc: '系统和应用配置文件。纯文本，可版本控制。/etc/passwd, /etc/nginx/ ...' },
  { path: '/home', desc: '普通用户的家目录。每位用户拥有 /home/用户名 目录。' },
  { path: '/root', desc: 'root 用户的家目录（不是 /home/root，是独立的 /root）' },
  { path: '/var', desc: '可变数据：日志 /var/log、数据库 /var/lib、邮件 /var/spool、缓存 /var/cache' },
  { path: '/tmp', desc: '临时文件，重启清除。脚本可用，但别存重要数据！' },
  { path: '/proc', desc: '内核虚拟文件系统，实时输出进程和内核信息（全在内存，不占磁盘）' },
  { path: '/sys', desc: 'sysfs：内核设备模型的接口，读写文件可直接配置内核和硬件' },
  { path: '/dev', desc: '设备文件：/dev/sda（磁盘）/dev/null（黑洞）/dev/tty（终端）' },
  { path: '/usr', desc: '用户级程序和数据：/usr/bin（命令）/usr/lib（库）/usr/share（共享数据）' },
  { path: '/lib', desc: '系统共享库（.so 文件），供 /bin 和 /sbin 中的命令使用' },
  { path: '/opt', desc: '第三方软件的可选安装目录（如 /opt/nginx, /opt/java）' },
  { path: '/mnt /media', desc: '挂载点：临时挂载磁盘分区、光驱、USB 设备的位置' },
  { path: '/boot', desc: '启动文件：内核镜像 vmlinuz、initrd、GRUB 引导器配置' },
  { path: '/run', desc: 'tmpfs，运行时数据：PID 文件、Unix socket、systemd 运行时数据' },
];

// Permission calculator
function PermissionCalc() {
  const [perms, setPerms] = useState({ ur: true, uw: true, ux: false, gr: true, gw: false, gx: false, or: true, ow: false, ox: false });

  const calc = () => {
    const u = (perms.ur ? 4 : 0) + (perms.uw ? 2 : 0) + (perms.ux ? 1 : 0);
    const g = (perms.gr ? 4 : 0) + (perms.gw ? 2 : 0) + (perms.gx ? 1 : 0);
    const o = (perms.or ? 4 : 0) + (perms.ow ? 2 : 0) + (perms.ox ? 1 : 0);
    return { u, g, o, octal: `${u}${g}${o}`, symbolic: `-${perms.ur?'r':'-'}${perms.uw?'w':'-'}${perms.ux?'x':'-'}${perms.gr?'r':'-'}${perms.gw?'w':'-'}${perms.gx?'x':'-'}${perms.or?'r':'-'}${perms.ow?'w':'-'}${perms.ox?'x':'-'}` };
  };

  const p = calc();

  const Row = ({ label, keys }) => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,255,65,0.06)' }}>
      <span style={{ minWidth: '3.5rem', color: '#4a6a4a', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem' }}>{label}</span>
      {keys.map(([k, name]) => (
        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', color: perms[k] ? '#00ff41' : '#2a4a2a', fontSize: '0.85rem' }}>
          <input type="checkbox" checked={perms[k]} onChange={e => setPerms({ ...perms, [k]: e.target.checked })} style={{ accentColor: '#00ff41' }} />
          {name}
        </label>
      ))}
      <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', color: '#ffb000', fontSize: '0.9rem' }}>
        {label === 'User' ? p.u : label === 'Group' ? p.g : p.o}
      </span>
    </div>
  );

  return (
    <div className="glass-panel">
      <h4 style={{ marginBottom: '1rem' }}>🔐 权限计算器（实时）</h4>
      <Row label="User"  keys={[['ur','read'],['uw','write'],['ux','exec']]} />
      <Row label="Group" keys={[['gr','read'],['gw','write'],['gx','exec']]} />
      <Row label="Other" keys={[['or','read'],['ow','write'],['ox','exec']]} />
      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,20,0,0.8)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(0,255,65,0.25)' }}>
          <p style={{ color: '#4a6a4a', fontSize: '0.8rem', marginBottom: '0.25rem' }}>八进制</p>
          <p style={{ color: '#00ff41', fontSize: '2rem', fontFamily: 'JetBrains Mono,monospace', fontWeight: '900' }}>{p.octal}</p>
          <code style={{ fontSize: '0.8rem' }}>chmod {p.octal} file</code>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,20,0,0.8)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(0,255,65,0.25)' }}>
          <p style={{ color: '#4a6a4a', fontSize: '0.8rem', marginBottom: '0.25rem' }}>符号表示</p>
          <p style={{ color: '#00e5ff', fontSize: '1.5rem', fontFamily: 'JetBrains Mono,monospace', fontWeight: '900' }}>{p.symbolic}</p>
          <p style={{ color: '#4a6a4a', fontSize: '0.75rem' }}>ls -la 命令的输出格式</p>
        </div>
      </div>
    </div>
  );
}

const SPECIAL_PERMS = [
  { bit: 'SUID (4xxx)', symbol: 's（user x位）', example: '/usr/bin/passwd', effect: '执行时以文件所有者权限运行（而非调用者）。passwd 命令需要写 /etc/shadow，所以设了 SUID。', risk: '高危：如果 SUID 程序有漏洞，可直接提权到 root' },
  { bit: 'SGID (2xxx)', symbol: 's（group x位）', example: '/usr/bin/write', effect: '执行时以文件所属组权限运行。用于目录时，新文件继承目录的组。', risk: '中等：新建文件自动继承组权限，适合团队共享目录' },
  { bit: 'Sticky (1xxx)', symbol: 't（other x位）', example: '/tmp', effect: '目录中的文件只有所有者才能删除（即使 other 有写权限）。/tmp 就是这样实现的。', risk: '保护性：防止用户删除别人的文件' },
];

export default function LessonFilesystem() {
  const navigate = useNavigate();
  const [activeDir, setActiveDir] = useState(null);
  const [activeSp, setActiveSp] = useState(null);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">$ module_03 — 文件系统</div>
        <h1>目录树与权限体系</h1>
        <p className="lesson-intro">
          Linux 的文件系统是一棵树，<strong style={{ color: '#00ff41' }}>所有内容都挂在 / 之下</strong>，包括磁盘、网络、内核数据。理解 FHS（文件系统层次标准）和权限模型，你才能真正驾驭 Linux 的每一个角落。
        </p>
      </header>

      {/* FHS Directory Tree */}
      <section className="lesson-section">
        <h3>🌳 FHS 目录标准：Linux 的路标系统（点击展开）</h3>
        <div className="space-y-2">
          {FHS_DIRS.map((d, i) => (
            <div key={i} className={`expand-card ${activeDir === i ? 'open' : ''}`} onClick={() => setActiveDir(activeDir === i ? null : i)}>
              <div className="expand-header">
                <code style={{ color: '#ffb000', minWidth: '8rem', fontSize: '0.82rem' }}>{d.path}</code>
                <span style={{ color: '#4a6a4a', fontSize: '0.8rem' }}>{d.desc.substring(0, 45)}...</span>
              </div>
              {activeDir === i && (
                <div className="expand-body fade-in">
                  <p style={{ color: '#a0c0a0' }}>{d.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <TerminalBlock title="探索目录结构" lines={[
          '<span class="t-comment"># 展示目录树（需要 tree 命令）</span>',
          '<span class="t-prompt">$</span> tree <span class="t-flag">-L</span> 2 /etc/ | head -30',
          '<span class="t-path">/etc/</span>',
          '<span class="t-output">├── apt/</span>',
          '<span class="t-output">│   ├── apt.conf.d/</span>',
          '<span class="t-output">│   └── sources.list</span>',
          '<span class="t-output">├── cron.d/</span>',
          '<span class="t-output">├── nginx/</span>',
          '<span class="t-output">│   ├── nginx.conf</span>',
          '<span class="t-output">│   └── sites-enabled/</span>',
          '<span class="t-output">└── systemd/</span>',
          '',
          '<span class="t-comment"># 查看 proc 文件系统——内核的窗口</span>',
          '<span class="t-prompt">$</span> cat <span class="t-path">/proc/loadavg</span>',
          '<span class="t-output">0.52 0.38 0.21 1/312 9854</span>',
          '<span class="t-comment"># 1分钟/5分钟/15分钟负载 / 活跃进程数/总进程 / 最新PID</span>',
        ]} />
      </section>

      {/* Permission System */}
      <section className="lesson-section">
        <h3>🔐 权限模型：读透 rwxrwxrwx</h3>
        <TerminalBlock title="权限解读" lines={[
          '<span class="t-prompt">$</span> ls <span class="t-flag">-la</span> /usr/bin/passwd',
          '<span class="t-error">-rwsr-xr-x</span> 1 root root 68208 Apr  2 00:00 <span class="t-path">/usr/bin/passwd</span>',
          '<span class="t-comment"># ↑ 解读：</span>',
          '<span class="t-comment"># - = 普通文件 (d=目录 l=链接 c=字符设备 b=块设备 p=管道)</span>',
          '<span class="t-comment"># rws = User:  read+write+SUID(s 取代 x，执行时以 root 身份运行)</span>',
          '<span class="t-comment"># r-x = Group: read+exec</span>',
          '<span class="t-comment"># r-x = Other: read+exec</span>',
          '',
          '<span class="t-comment"># 修改权限</span>',
          '<span class="t-prompt">$</span> chmod <span class="t-flag">755</span> script.sh        <span class="t-comment"># 八进制: rwxr-xr-x</span>',
          '<span class="t-prompt">$</span> chmod <span class="t-flag">u+x,g-w,o=r</span> file  <span class="t-comment"># 符号: user加x, group去w, other只留r</span>',
          '<span class="t-prompt">$</span> chown <span class="t-flag">user:group</span> file     <span class="t-comment"># 修改所有者和所属组</span>',
          '<span class="t-prompt">$</span> chown <span class="t-flag">-R</span> www-data:www-data /var/www/  <span class="t-comment"># 递归修改</span>',
        ]} />
        <PermissionCalc />
      </section>

      {/* Special Permissions */}
      <section className="lesson-section">
        <h3>⚡ 特殊权限位：SUID / SGID / Sticky（点击展开）</h3>
        <div className="space-y-2">
          {SPECIAL_PERMS.map((sp, i) => (
            <div key={i} className={`expand-card ${activeSp === i ? 'open' : ''}`} onClick={() => setActiveSp(activeSp === i ? null : i)}>
              <div className="expand-header">
                <code style={{ color: '#ff4444', minWidth: '6rem', fontSize: '0.82rem' }}>{sp.bit}</code>
                <span style={{ color: '#7a9c7a' }}>符号：<code>{sp.symbol}</code></span>
                <span style={{ color: '#4a6a4a', fontSize: '0.8rem', marginLeft: '1rem' }}>示例：{sp.example}</span>
              </div>
              {activeSp === i && (
                <div className="expand-body fade-in">
                  <p style={{ marginBottom: '0.5rem', color: '#a0c0a0' }}>{sp.effect}</p>
                  <div className={`info-box ${i === 0 ? 'danger' : i === 1 ? 'warn' : 'tip'}`}>🔒 风险评估：{sp.risk}</div>
                  <TerminalBlock title="设置特殊权限位" lines={[
                    `<span class="t-prompt">$</span> chmod <span class="t-flag">${i === 0 ? '4' : i === 1 ? '2' : '1'}755</span> /path/to/file   <span class="t-comment"># 八进制设置</span>`,
                    `<span class="t-prompt">$</span> chmod <span class="t-flag">${i === 0 ? 'u+s' : i === 1 ? 'g+s' : '+t'}</span> /path/to/file     <span class="t-comment"># 符号设置</span>`,
                    `<span class="t-comment"># 查找系统中所有 SUID 文件（安全审计必做）</span>`,
                    `<span class="t-prompt">$</span> find / <span class="t-flag">-perm -4000</span> -type f 2>/dev/null`,
                  ]} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="lesson-section">
        <h3>🔗 软链接 vs 硬链接</h3>
        <div className="compare-grid">
          <div className="linux-card">
            <h4 style={{ color: '#00ff41', marginBottom: '0.75rem' }}>硬链接 (Hard Link)</h4>
            <p style={{ color: '#7a9c7a', fontSize: '0.85rem', lineHeight: '1.7', marginBottom: '0.75rem' }}>
              与原文件共享同一个 inode（磁盘数据块）。删除原文件不影响硬链接，数据依然存在。只能在同一文件系统内创建，不能指向目录。
            </p>
            <code style={{ display: 'block', fontSize: '0.78rem' }}>ln file.txt link.txt</code>
          </div>
          <div className="linux-card">
            <h4 style={{ color: '#00e5ff', marginBottom: '0.75rem' }}>软链接 (Symbolic Link)</h4>
            <p style={{ color: '#7a9c7a', fontSize: '0.85rem', lineHeight: '1.7', marginBottom: '0.75rem' }}>
              类似 Windows 快捷方式，存储目标路径字符串。原文件删除则软链接失效（悬空链接）。可跨文件系统、可指向目录。最常用。
            </p>
            <code style={{ display: 'block', fontSize: '0.78rem' }}>ln -s /original/path /link/path</code>
          </div>
        </div>
        <TerminalBlock title="链接实战" lines={[
          '<span class="t-comment"># 创建软链接（让 /opt/java 指向具体版本）</span>',
          '<span class="t-prompt">$</span> ln <span class="t-flag">-s</span> /opt/jdk-21 /opt/java',
          '<span class="t-prompt">$</span> ls <span class="t-flag">-la</span> /opt/java',
          '<span class="t-output">lrwxrwxrwx 1 root root 11 Apr 4 → /opt/jdk-21</span>',
          '',
          '<span class="t-comment"># 查看文件 inode（硬链接数量在第2列）</span>',
          '<span class="t-prompt">$</span> stat /etc/passwd',
          '<span class="t-output">File: /etc/passwd</span>',
          '<span class="t-output">Size: 2847 Inodes: 131073 Links: 1</span>',
        ]} />
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/linux-mastery/lesson/process')}>
          $ cd next_chapter  # 进程管理 →
        </button>
      </section>
    </div>
  );
}
