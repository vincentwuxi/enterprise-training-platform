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

const SYSTEMD_CMDS = [
  { cmd: 'systemctl status nginx', desc: '查看服务状态（Active/Inactive、最近日志）' },
  { cmd: 'systemctl start/stop/restart nginx', desc: '启动/停止/重启服务' },
  { cmd: 'systemctl enable/disable nginx', desc: '设置开机自启 / 取消自启' },
  { cmd: 'systemctl reload nginx', desc: '热重载配置（不中断连接）' },
  { cmd: 'systemctl list-units --type=service', desc: '列出所有 service 单元' },
  { cmd: 'systemctl list-units --failed', desc: '列出所有失败的单元' },
  { cmd: 'journalctl -u nginx -f', desc: '实时跟踪 nginx 服务日志' },
  { cmd: 'journalctl --since "1 hour ago"', desc: '查看最近1小时的系统日志' },
  { cmd: 'journalctl -p err -n 50', desc: '查看最近50条 ERROR 级别日志' },
  { cmd: 'systemd-analyze blame', desc: '分析各服务启动时间，优化启动速度' },
];

const CRON_EXAMPLES = [
  { expr: '* * * * *', desc: '每分钟执行一次' },
  { expr: '0 * * * *', desc: '每小时整点执行' },
  { expr: '0 2 * * *', desc: '每天凌晨2点执行' },
  { expr: '0 2 * * 0', desc: '每周日凌晨2点执行' },
  { expr: '0 2 1 * *', desc: '每月1日凌晨2点执行' },
  { expr: '*/5 * * * *', desc: '每5分钟执行一次' },
  { expr: '0 8-18 * * 1-5', desc: '工作日8到18点每小时执行' },
  { expr: '@reboot', desc: '系统重启后执行一次' },
  { expr: '@daily', desc: '等同于 0 0 * * *' },
];

function CronBuilder() {
  const [min, setMin] = useState('0'); const [hour, setHour] = useState('2');
  const [dom, setDom] = useState('*'); const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*'); const [cmd, setCmd] = useState('/usr/bin/backup.sh');

  const cron = `${min} ${hour} ${dom} ${month} ${dow} ${cmd}`;
  const desc = `${dom === '*' ? '每天' : `每月${dom}日`}${hour === '*' ? '每小时' : `${hour}时`}${min === '*' ? '每分钟' : `${min}分`}${dow !== '*' ? ['周日','周一','周二','周三','周四','周五','周六'][dow] || '' : ''} 执行 ${cmd}`;

  const Field = ({ label, value, set, options }) => (
    <div>
      <label style={{ color: '#4a6a4a', fontSize: '0.72rem', display: 'block', marginBottom: '0.25rem', fontFamily: 'JetBrains Mono,monospace' }}>{label}</label>
      <select value={value} onChange={e => set(e.target.value)}
        style={{ width: '100%', background: '#020d02', border: '1px solid rgba(0,255,65,0.25)', color: '#00ff41', padding: '0.35rem', borderRadius: '4px', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem' }}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="glass-panel">
      <h4 style={{ marginBottom: '1.25rem' }}>⏰ Cron 表达式构建器</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Field label="分 (0-59)" value={min} set={setMin} options={[{v:'*',l:'*每分'},{v:'0',l:'0'},{v:'*/5',l:'每5分'},{v:'*/15',l:'每15分'},{v:'*/30',l:'每30分'}]} />
        <Field label="时 (0-23)" value={hour} set={setHour} options={[{v:'*',l:'*每小時'},{v:'0',l:'0'},{v:'2',l:'2'},{v:'8',l:'8'},{v:'12',l:'12'},{v:'18',l:'18'}]} />
        <Field label="日 (1-31)" value={dom} set={setDom} options={[{v:'*',l:'*每天'},{v:'1',l:'1'},{v:'15',l:'15'}]} />
        <Field label="月 (1-12)" value={month} set={setMonth} options={[{v:'*',l:'*每月'},{v:'1',l:'1'},{v:'6',l:'6'},{v:'12',l:'12'}]} />
        <Field label="周 (0-6)" value={dow} set={setDow} options={[{v:'*',l:'*每天'},{v:'0',l:'周日'},{v:'1',l:'周一'},{v:'5',l:'周五'},{v:'1-5',l:'工作日'}]} />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ color: '#4a6a4a', fontSize: '0.72rem', display: 'block', marginBottom: '0.25rem', fontFamily: 'JetBrains Mono,monospace' }}>执行命令</label>
        <input value={cmd} onChange={e => setCmd(e.target.value)}
          style={{ width: '100%', background: '#020d02', border: '1px solid rgba(0,255,65,0.25)', color: '#00ff41', padding: '0.4rem', borderRadius: '4px', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.82rem' }} />
      </div>
      <div style={{ background: '#010801', borderRadius: '6px', padding: '0.75rem 1rem', border: '1px solid rgba(0,255,65,0.2)', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.82rem' }}>
        <span style={{ color: '#4a6a4a' }}># crontab 条目：</span><br />
        <span style={{ color: '#00ff41' }}>{cron}</span>
      </div>
      <p style={{ color: '#4a6a4a', fontSize: '0.8rem', marginTop: '0.5rem' }}>💬 含义：{desc}</p>
    </div>
  );
}

const SYSTEMD_UNIT = `[Unit]
Description=My Web Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=webapp
Group=webapp
WorkingDirectory=/opt/webapp
EnvironmentFile=/etc/webapp/env
ExecStart=/opt/webapp/bin/server --port 8080
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=webapp

# 安全加固
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=/var/lib/webapp /var/log/webapp

[Install]
WantedBy=multi-user.target`;

const USER_MGMT = [
  { cmd: 'useradd -m -s /bin/bash -G sudo alice', desc: '创建用户 alice，有家目录，bash shell，加入 sudo 组' },
  { cmd: 'passwd alice', desc: '设置或修改用户密码' },
  { cmd: 'usermod -aG docker alice', desc: '追加用户到 docker 组（-a 避免覆盖现有组）' },
  { cmd: 'userdel -r alice', desc: '删除用户及其家目录（-r 是关键！）' },
  { cmd: 'visudo', desc: '安全编辑 sudoers 文件（有语法检查）' },
  { cmd: 'id alice', desc: '查看用户的 UID、GID 和所有组' },
  { cmd: 'groups alice', desc: '查看用户所属的所有组' },
  { cmd: 'su - alice', desc: '切换到 alice 用户（- 加载其环境变量）' },
];

export default function LessonSysadmin() {
  const navigate = useNavigate();
  const [showUnit, setShowUnit] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">$ module_07 — 系统管理</div>
        <h1>驾驭 systemd 与自动化运维</h1>
        <p className="lesson-intro">
          现代 Linux 系统管理的核心是 <strong style={{ color: '#00ff41' }}>systemd</strong>——服务管理、日志、定时任务、Socket 激活全包了。配合 cron/systemd timer 和 Ansible，实现基础设施即代码。
        </p>
      </header>

      {/* systemd */}
      <section className="lesson-section">
        <h3>⚙️ systemd：现代 Linux 的 PID 1</h3>
        <div className="info-box note" style={{ marginBottom: '1rem' }}>
          📌 systemd 是 Linux 的第一个进程（PID=1），负责系统初始化、服务管理、挂载文件系统、设备管理、日志收集（journald）等一切系统级任务。取代了传统的 SysV init。
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {SYSTEMD_CMDS.map(t => (
            <div key={t.cmd} className="linux-card">
              <code style={{ color: '#00ff41', fontSize: '0.78rem', display: 'block', marginBottom: '0.3rem' }}>{t.cmd}</code>
              <p style={{ color: '#4a6a4a', fontSize: '0.78rem' }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Custom service unit */}
        <button onClick={() => setShowUnit(!showUnit)}
          style={{ marginBottom: '1rem', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.25)', color: '#00cc33', padding: '0.5rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem' }}>
          {showUnit ? '▲ 收起' : '▼ 展开：自定义服务 Unit 文件（生产模板）'}
        </button>
        {showUnit && (
          <div className="fade-in">
            <div className="info-box tip" style={{ marginBottom: '0.75rem' }}>
              💡 Unit 文件路径：<code>/etc/systemd/system/webapp.service</code>，修改后运行 <code>systemctl daemon-reload</code> 使其生效。
            </div>
            <div className="terminal-block">
              <div className="terminal-topbar">
                <span className="terminal-dot red" /><span className="terminal-dot amber" /><span className="terminal-dot green" />
                <span className="terminal-title">/etc/systemd/system/webapp.service</span>
              </div>
              <pre className="terminal-body" style={{ whiteSpace: 'pre-wrap', color: '#7fff7f', fontSize: '0.78rem', lineHeight: '1.7' }}>{SYSTEMD_UNIT}</pre>
            </div>
          </div>
        )}
      </section>

      {/* Cron */}
      <section className="lesson-section">
        <h3>⏰ Cron 与定时任务：自动化的基石</h3>
        <CronBuilder />
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>常用 Cron 表达式速查</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,20,0,0.8)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#4a6a4a', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.75rem' }}>表达式</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#4a6a4a', fontSize: '0.75rem' }}>含义</th>
                </tr>
              </thead>
              <tbody>
                {CRON_EXAMPLES.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,255,65,0.06)' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}><code style={{ color: '#00ff41', fontSize: '0.8rem' }}>{c.expr}</code></td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#7a9c7a', fontSize: '0.82rem' }}>{c.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* User Management */}
      <section className="lesson-section">
        <h3>👤 用户与权限管理</h3>
        <TerminalBlock title="用户管理实战" lines={[
          '<span class="t-comment"># /etc/passwd 格式: 用户名:密码:UID:GID:注释:家目录:Shell</span>',
          '<span class="t-prompt">$</span> cat <span class="t-path">/etc/passwd</span> | grep -v <span class="t-string">"nologin"</span> | grep -v <span class="t-string">"false"</span>',
          '<span class="t-output">root:x:0:0:root:/root:/bin/bash</span>',
          '<span class="t-output">alice:x:1000:1000:Alice:/home/alice:/bin/bash</span>',
          '',
          '<span class="t-comment"># sudo 配置：让 alice 免密运行特定命令</span>',
          '<span class="t-prompt">#</span> visudo  <span class="t-comment"># 添加如下行：</span>',
          '<span class="t-output">alice ALL=(ALL) NOPASSWD: /bin/systemctl restart webapp</span>',
          '',
          '<span class="t-comment"># SSH 密钥认证（比密码更安全）</span>',
          '<span class="t-prompt">$</span> ssh-keygen <span class="t-flag">-t ed25519 -C</span> <span class="t-string">"alice@company.com"</span>',
          '<span class="t-prompt">$</span> ssh-copy-id <span class="t-flag">-i</span> ~/.ssh/id_ed25519.pub alice@server',
        ]} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {USER_MGMT.map(t => (
            <div key={t.cmd} className="linux-card">
              <code style={{ color: '#00ff41', fontSize: '0.78rem', display: 'block', marginBottom: '0.3rem' }}>{t.cmd}</code>
              <p style={{ color: '#4a6a4a', fontSize: '0.78rem' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Package Management */}
      <section className="lesson-section">
        <h3>📦 软件包管理：apt vs dnf vs pacman</h3>
        <div className="compare-grid">
          <TerminalBlock title="Debian/Ubuntu (apt)" lines={[
            '<span class="t-prompt">#</span> apt update && apt upgrade <span class="t-flag">-y</span>',
            '<span class="t-prompt">#</span> apt install <span class="t-flag">-y</span> nginx postgresql',
            '<span class="t-prompt">#</span> apt search nginx',
            '<span class="t-prompt">#</span> apt show nginx',
            '<span class="t-prompt">#</span> apt remove --purge nginx',
            '<span class="t-prompt">#</span> apt autoremove',
            '<span class="t-prompt">#</span> dpkg -l | grep nginx  <span class="t-comment"># 查询已安装</span>',
          ]} />
          <TerminalBlock title="RHEL/Rocky (dnf)" lines={[
            '<span class="t-prompt">#</span> dnf update <span class="t-flag">-y</span>',
            '<span class="t-prompt">#</span> dnf install <span class="t-flag">-y</span> nginx postgresql',
            '<span class="t-prompt">#</span> dnf search nginx',
            '<span class="t-prompt">#</span> dnf info nginx',
            '<span class="t-prompt">#</span> dnf remove nginx',
            '<span class="t-prompt">#</span> dnf history  <span class="t-comment"># 操作历史</span>',
            '<span class="t-prompt">#</span> rpm -qa | grep nginx',
          ]} />
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/linux-mastery/lesson/performance')}>
          $ cd next_chapter  # 性能调优 →
        </button>
      </section>
    </div>
  );
}
