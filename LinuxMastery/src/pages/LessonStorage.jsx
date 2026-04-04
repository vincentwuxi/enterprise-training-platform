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

// LVM size calculator
function LvmCalculator() {
  const [pvs, setPvs] = useState([{ name: '/dev/sdb', size: 500 }, { name: '/dev/sdc', size: 500 }]);
  const [lvSize, setLvSize] = useState(800);

  const totalVg = pvs.reduce((a, p) => a + p.size, 0);
  const canCreate = lvSize <= totalVg;

  return (
    <div className="glass-panel">
      <h4 style={{ marginBottom: '1.25rem' }}>📊 LVM 容量计算器</h4>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#4a6a4a', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'JetBrains Mono,monospace' }}>物理卷 (PV) 列表：</p>
        {pvs.map((pv, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <code style={{ color: '#ffb000', fontSize: '0.82rem', minWidth: '8rem' }}>{pv.name}</code>
            <input type="range" min={50} max={2000} step={50} value={pv.size} onChange={e => {
              const n = [...pvs]; n[i] = { ...n[i], size: Number(e.target.value) }; setPvs(n);
            }} style={{ flex: 1, accentColor: '#00ff41' }} />
            <span style={{ color: '#00ff41', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.82rem', minWidth: '3.5rem' }}>{pv.size}GB</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,20,0,0.8)', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(0,255,65,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.85rem' }}>
          <span style={{ color: '#4a6a4a' }}>VG 总容量</span>
          <span style={{ color: '#00ff41', fontWeight: '900' }}>{totalVg} GB</span>
        </div>
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ color: '#4a6a4a', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem', fontFamily: 'JetBrains Mono,monospace' }}>
          创建 LV 大小：<span style={{ color: lvSize > totalVg ? '#ff4444' : '#00ff41' }}>{lvSize} GB</span>
        </label>
        <input type="range" min={50} max={Math.max(totalVg + 200, 2000)} step={50} value={lvSize} onChange={e => setLvSize(Number(e.target.value))}
          style={{ width: '100%', accentColor: lvSize <= totalVg ? '#00ff41' : '#ff4444' }} />
      </div>
      <div style={{ padding: '1rem', borderRadius: '6px', background: canCreate ? 'rgba(0,255,65,0.08)' : 'rgba(255,68,68,0.08)', border: `1px solid ${canCreate ? 'rgba(0,255,65,0.3)' : 'rgba(255,68,68,0.3)'}` }}>
        {canCreate ? (
          <div className="terminal-body" style={{ padding: 0, fontSize: '0.78rem' }}>
            <div><span className="t-comment"># 执行命令</span></div>
            <div><span className="t-prompt">$</span> <span className="t-cmd">lvcreate</span> <span className="t-flag">-L</span> <span className="t-number">{lvSize}G</span> <span className="t-flag">-n</span> <span className="t-string">mylv</span> datavg</div>
            <div><span className="t-success">✅ 可用容量充足（剩余 {totalVg - lvSize} GB）</span></div>
          </div>
        ) : (
          <p style={{ color: '#ff4444', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.82rem' }}>
            ❌ {lvSize}GB 超出 VG 容量 ({totalVg}GB)，需要增加 PV 或缩小 LV
          </p>
        )}
      </div>
    </div>
  );
}

const FS_COMPARISON = [
  { fs: 'ext4', max_file: '16TB', max_fs: '1EB', journal: '✅', cow: '❌', feature: '最广泛支持，稳定成熟。Linux 默认文件系统，适合通用场景。' },
  { fs: 'xfs', max_file: '8EB', max_fs: '8EB', journal: '✅', cow: '❌', feature: '高性能大文件处理。RHEL 默认，适合数据库、视频存储。' },
  { fs: 'btrfs', max_file: '16EB', max_fs: '16EB', journal: '写时复制', cow: '✅', feature: '快照、压缩、RAID 内建。openSUSE 默认，功能强但复杂。' },
  { fs: 'zfs', max_file: '16EB', max_fs: '256TB', journal: '写时复制', cow: '✅', feature: '企业级，端到端校验、快照克隆。FreeBSD/Ubuntu 均支持。' },
  { fs: 'tmpfs', max_file: 'RAM大小', max_fs: 'RAM大小', journal: '无', cow: '❌', feature: '内存文件系统，/tmp 和 /run 常用。重启消失，极速。' },
];

const DISK_CMDS = [
  { cmd: 'lsblk -f', desc: '列出所有块设备、分区、挂载点和文件系统类型' },
  { cmd: 'fdisk -l', desc: '列出磁盘分区表（MBR 格式）' },
  { cmd: 'parted -l', desc: '列出磁盘分区表（支持 GPT 格式）' },
  { cmd: 'df -hT', desc: '显示文件系统挂载情况、容量和类型' },
  { cmd: 'du -sh /var/*', desc: '显示目录大小汇总（找大文件）' },
  { cmd: 'iostat -x 2', desc: '每2秒输出磁盘 I/O 统计（%util、await 是关键指标）' },
  { cmd: 'blkid', desc: '列出所有设备的 UUID 和文件系统类型' },
  { cmd: 'mount -a', desc: '挂载 /etc/fstab 中的所有条目' },
];

export default function LessonStorage() {
  const navigate = useNavigate();
  const [showRaid, setShowRaid] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">$ module_06 — 存储管理</div>
        <h1>分区、LVM 与文件系统</h1>
        <p className="lesson-intro">
          磁盘是 Linux 数据的家园。从 MBR/GPT 分区到 LVM 逻辑卷管理，从 ext4 到 xfs 文件系统，掌握存储层级让你<strong style={{ color: '#00ff41' }}>能在线扩容、不停机迁移、从容应对磁盘故障</strong>。
        </p>
      </header>

      {/* Disk Hierarchy */}
      <section className="lesson-section">
        <h3>📦 Linux 存储层次：硬件 → 分区 → LVM → 文件系统</h3>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '2px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { layer: '物理磁盘\n/dev/sda', color: '#ff8800', icon: '💾' },
            { layer: '→' },
            { layer: '分区\n/dev/sda1', color: '#ffb000', icon: '🗂️' },
            { layer: '→' },
            { layer: 'LVM PV\n物理卷', color: '#00e5ff', icon: '🧱' },
            { layer: '→' },
            { layer: 'LVM VG\n卷组', color: '#00cc99', icon: '📦' },
            { layer: '→' },
            { layer: 'LVM LV\n逻辑卷', color: '#00ff41', icon: '📁' },
            { layer: '→' },
            { layer: '文件系统\next4/xfs', color: '#a0ff60', icon: '🌲' },
          ].map((item, i) => item.layer === '→' ? (
            <div key={i} style={{ display: 'flex', alignItems: 'center', color: '#2a4a2a', fontSize: '1.2rem', padding: '0 0.25rem' }}>→</div>
          ) : (
            <div key={i} style={{ flex: 1, minWidth: '80px', padding: '0.75rem', borderRadius: '6px', background: `${item.color}10`, border: `1px solid ${item.color}30`, textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.icon}</div>
              <pre style={{ color: item.color, fontSize: '0.7rem', margin: 0, fontFamily: 'JetBrains Mono,monospace', whiteSpace: 'pre-wrap' }}>{item.layer}</pre>
            </div>
          ))}
        </div>
        <TerminalBlock title="磁盘分区与格式化" lines={[
          '<span class="t-comment"># 查看磁盘结构</span>',
          '<span class="t-prompt">#</span> lsblk <span class="t-flag">-f</span>',
          '<span class="t-output">NAME   FSTYPE  LABEL   UUID                                  MOUNTPOINT</span>',
          '<span class="t-output">sda</span>',
          '<span class="t-output">├─sda1 ext4            xxxxxx-xxxx                        /boot</span>',
          '<span class="t-output">└─sda2 LVM2_member     yyyyyy-yyyy</span>',
          '<span class="t-output">  ├─vg0-root ext4      zzzzzz-zzzz                        /</span>',
          '<span class="t-output">  └─vg0-home ext4      aaaaaa-aaaa                        /home</span>',
          '',
          '<span class="t-comment"># 新磁盘全流程：GPT 分区 → 格式化 → 挂载</span>',
          '<span class="t-prompt">#</span> parted <span class="t-flag">-s</span> /dev/sdb mklabel gpt mkpart primary ext4 <span class="t-string">0% 100%</span>',
          '<span class="t-prompt">#</span> mkfs.ext4 /dev/sdb1',
          '<span class="t-prompt">#</span> mkdir -p /data && mount /dev/sdb1 /data',
          '<span class="t-comment"># 永久挂载（写入 /etc/fstab）</span>',
          '<span class="t-prompt">#</span> echo <span class="t-string">"UUID=$(blkid -s UUID -o value /dev/sdb1) /data ext4 defaults 0 2"</span> >> /etc/fstab',
        ]} />
      </section>

      {/* LVM */}
      <section className="lesson-section">
        <h3>🧱 LVM：生产环境磁盘管理的标准</h3>
        <LvmCalculator />
        <TerminalBlock title="LVM 完整操作流程" lines={[
          '<span class="t-comment">## 第一步：创建物理卷 (PV)</span>',
          '<span class="t-prompt">#</span> pvcreate /dev/sdb /dev/sdc',
          '<span class="t-prompt">#</span> pvs   <span class="t-comment"># 查看 PV 列表</span>',
          '',
          '<span class="t-comment">## 第二步：创建卷组 (VG)</span>',
          '<span class="t-prompt">#</span> vgcreate datavg /dev/sdb /dev/sdc',
          '<span class="t-prompt">#</span> vgs   <span class="t-comment"># 查看 VG 信息</span>',
          '',
          '<span class="t-comment">## 第三步：创建逻辑卷 (LV)</span>',
          '<span class="t-prompt">#</span> lvcreate <span class="t-flag">-L</span> 800G <span class="t-flag">-n</span> data datavg',
          '<span class="t-prompt">#</span> lvs   <span class="t-comment"># 查看 LV 信息</span>',
          '',
          '<span class="t-comment">## 第四步：格式化+挂载</span>',
          '<span class="t-prompt">#</span> mkfs.xfs /dev/datavg/data',
          '<span class="t-prompt">#</span> mount /dev/datavg/data /data',
          '',
          '<span class="t-comment">## 在线扩容（不需要停服！）</span>',
          '<span class="t-prompt">#</span> lvextend <span class="t-flag">-L</span> +200G /dev/datavg/data   <span class="t-comment"># 增加 200GB</span>',
          '<span class="t-prompt">#</span> xfs_growfs /data                        <span class="t-comment"># xfs 在线扩展</span>',
          '<span class="t-comment"># ext4 用：resize2fs /dev/datavg/data</span>',
        ]} />
      </section>

      {/* Filesystem Comparison */}
      <section className="lesson-section">
        <h3>📊 文件系统横向对比</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,30,0,0.8)' }}>
                {['文件系统', '最大文件', '最大 FS', '日志', 'COW', '特点'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: '#4a6a4a', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.75rem', borderBottom: '1px solid rgba(0,255,65,0.15)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FS_COMPARISON.map((fs, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,255,65,0.06)', background: i % 2 === 0 ? 'rgba(0,10,0,0.3)' : 'transparent' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}><code style={{ color: '#00ff41', fontWeight: '700' }}>{fs.fs}</code></td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#7a9c7a', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem' }}>{fs.max_file}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#7a9c7a', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem' }}>{fs.max_fs}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#7a9c7a', fontSize: '0.78rem' }}>{fs.journal}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: fs.cow === '✅' ? '#00ff41' : '#2a4a2a', fontSize: '0.85rem' }}>{fs.cow}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#4a6a4a', lineHeight: '1.5', fontSize: '0.78rem' }}>{fs.feature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick reference */}
      <section className="lesson-section">
        <h3>🔧 存储工具速查</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {DISK_CMDS.map(t => (
            <div key={t.cmd} className="linux-card">
              <code style={{ color: '#00ff41', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>{t.cmd}</code>
              <p style={{ color: '#4a6a4a', fontSize: '0.78rem' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/linux-mastery/lesson/sysadmin')}>
          $ cd next_chapter  # 系统管理 →
        </button>
      </section>
    </div>
  );
}
