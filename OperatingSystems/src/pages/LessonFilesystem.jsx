import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['文件系统基础', 'VFS 与 ext4', '日志文件系统', 'FUSE 与现代 FS'];

export default function LessonFilesystem() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📁 module_06 — 文件系统</div>
      <div className="fs-hero">
        <h1>文件系统：VFS / ext4 / 日志 / FUSE</h1>
        <p>
          文件系统将<strong>无序的磁盘块变成有组织的文件和目录</strong>。
          本模块从 inode / superblock 等核心数据结构出发，理解 Linux VFS 层如何
          统一所有文件系统接口，深入 ext4 的 extent tree / journal 实现细节，
          以及如何用 FUSE 在用户态实现自己的文件系统。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📁 文件系统深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗂️ 文件系统基础</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#475569'}}></span> fs_basics.txt</div>
                <pre className="fs-code">{`# ═══ 文件 = 一组有名字的字节序列 ═══
# OS 视角: 文件 = inode (元数据) + 数据块
# 
# 文件名只是目录中的一个条目,
# 真正代表文件的是 inode!

# ═══ inode (索引节点) ═══
# 每个文件/目录对应一个 inode
# inode 号是文件系统内的唯一标识
#
# struct inode {
#   mode_t  mode;       // 文件类型 + 权限 (rwxr-xr-x)
#   uid_t   uid;        // 所有者
#   gid_t   gid;        // 组
#   off_t   size;       // 文件大小
#   time_t  atime;      // 最后访问时间
#   time_t  mtime;      // 最后修改时间
#   time_t  ctime;      // inode 变更时间
#   nlink_t nlink;      // 硬链接数
#   blksize_t blksize;  // 块大小
#   block_t blocks[15]; // 数据块指针 (传统)
# };
#
# 注意: inode 不存储文件名!
# 文件名 → 在目录的数据块中 (目录项)

# ═══ 目录 = 特殊的文件 ═══
# 目录的数据块存储一系列目录项:
# 
# 目录 /home/user/ 的内容:
# ┌──────────┬─────────────────┐
# │ inode 号 │  文件名          │
# ├──────────┼─────────────────┤
# │ 42       │ .  (当前目录)    │
# │ 100      │ .. (父目录)      │
# │ 157      │ hello.c          │
# │ 203      │ notes.txt        │
# │ 301      │ projects/ (子目录)│
# └──────────┴─────────────────┘

# ═══ 硬链接 vs 软链接 ═══
# 
# 硬链接 (Hard Link):
# → 多个目录项指向同一个 inode
# → ln file1 file2
# → 删除一个名字, inode 还在 (nlink--)
# → nlink=0 时文件真正被删除
# → 不能跨文件系统, 不能链接目录
#
# 软链接 (Symbolic Link):
# → 一个新文件, 内容是目标路径
# → ln -s file1 link1
# → 可以跨文件系统, 可以链目录
# → 目标被删则变成 "悬挂链接"
#
# $ ls -li
# 157 -rw-r--r-- 2 user group 1024 hello.c    ← nlink=2
# 157 -rw-r--r-- 2 user group 1024 hello2.c   ← 同一inode
# 400 lrwxrwxrwx 1 user group    7 link → hello.c

# ═══ 文件描述符 (File Descriptor) ═══
# 进程通过 fd (整数) 引用打开的文件
#
# 进程 fd 表     系统打开文件表     inode 表
# ┌───┬──────┐  ┌──────────────┐  ┌──────────┐
# │ 0 │stdin │→ │ offset=0     │→ │ inode 42 │
# │ 1 │stdout│→ │ offset=1024  │→ │ inode 1  │
# │ 2 │stderr│→ │ flags=O_RDWR │  │          │
# │ 3 │ file │→ │ offset=512   │→ │ inode 157│
# └───┴──────┘  │ ref_count=2  │  └──────────┘
#               └──────────────┘
#
# fork() 后: 父子共享系统打开文件表 → 共享 offset!
# dup2(): 复制 fd → 指向同一系统表项
# 
# $ ls -la /proc/$$/fd  # 查看当前进程的 fd
# 0 → /dev/pts/0 (stdin)
# 1 → /dev/pts/0 (stdout)
# 255 → /dev/pts/0`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐧 VFS 与 ext4</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> vfs_ext4.txt</div>
                <pre className="fs-code">{`# ═══ VFS (虚拟文件系统) ═══
# Linux 的文件系统抽象层
# → 用户程序用相同的 API (open/read/write/close)
# → VFS 分发到不同的文件系统实现
#
# 用户程序: open("/mnt/usb/file.txt")
#    ↓
# VFS 层: 查找路径, 确定文件系统类型
#    ↓
# ext4 / ntfs / nfs / proc / tmpfs ...
#    ↓
# 块设备层 (Block I/O)
#    ↓
# 磁盘驱动
#
# VFS 四大核心对象:
# 1. superblock:  文件系统的全局信息
# 2. inode:       文件的元数据
# 3. dentry:      目录项 (路径名→inode 的缓存)
# 4. file:        打开的文件实例

# ═══ ext4 磁盘布局 ═══
# ext4 将磁盘划分为多个 Block Group
#
# ┌──────┬──────┬──────┬──────┬──────┬──────┐
# │BG 0  │BG 1  │BG 2  │BG 3  │...   │BG N  │
# └──────┴──────┴──────┴──────┴──────┴──────┘
#
# 每个 Block Group:
# ┌───────────┬───────┬───────┬───────┬───────────┐
# │ Super     │ GDT   │Data   │inode  │ Data      │
# │ Block     │       │Bitmap │Bitmap │ Blocks    │
# │ (备份)    │       │       │Table  │           │
# └───────────┴───────┴───────┴───────┴───────────┘
#
# → Data Bitmap: 哪些数据块已使用 (1bit/block)
# → inode Bitmap: 哪些 inode 已使用
# → inode Table: 所有 inode 的数组

# ═══ ext4 Extent Tree ═══
# ext4 用 extent 替代传统的间接块指针
#
# 传统 (ext2/3): 每个块一个指针 → 大文件需要多级间接
# Extent:        描述连续的一段块 (起始块号+长度)
#
# struct ext4_extent {
#   __le32 ee_block;    // 逻辑块号
#   __le16 ee_len;      // 连续块数 (最大 32768)
#   __le16 ee_start_hi; // 物理块号高位
#   __le32 ee_start_lo; // 物理块号低位
# };
#
# 一个文件如果是连续存储的:
# → 只需要 1 个 extent! (起始块+长度)
# → 比间接块指针高效得多
#
# 大文件: 使用 B+树组织多个 extent
# inode → extent header → [extent | extent_idx]
#                           ↓
#                    extent_block → [extent, extent, ...]

# ═══ ext4 关键特性 ═══
# 最大文件:     16 TB (4KB block)
# 最大文件系统:  1 EB (1024 PB)  
# 最大文件名:   255 字节
# 延迟分配:     先写到缓存, 不立即分配块
# 多块分配:     一次分配多个连续块
# 在线碎片整理: e4defrag
# 纳秒时间戳:   inode 中时间精度到纳秒`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📝 日志文件系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> journaling.txt</div>
                <pre className="fs-code">{`# ═══ 为什么需要日志? ═══
# 
# 场景: 删除一个文件需要:
# 1. 从目录项中移除         ← 如果这里断电?
# 2. 释放 inode
# 3. 释放数据块
# 4. 更新 bitmap
#
# 只完成部分步骤 → 文件系统不一致!
# → 目录项没了, 但 inode/块未释放 (泄漏)
# → 或者相反: inode 释放了, 目录项还在 (悬挂引用)
#
# 没有日志时的修复: fsck
# → 扫描整个文件系统, 检查一致性
# → 大磁盘需要数小时! 不可接受

# ═══ 日志 (Journal) 的原理 ═══
# 
# 写-前-日志 (Write-Ahead Logging, WAL):
# 1. 在修改文件系统之前, 先把操作记录到日志
# 2. 日志写入完成后, 再修改实际文件系统数据
# 3. 如果中途崩溃:
#    → 日志完整 → 重放日志 (redo)
#    → 日志不完整 → 丢弃日志 (未提交)
#
# 日志操作:
# ┌──────────────────────────────────────────┐
# │ Transaction Begin                       │
# │ ├── 写入新目录项到日志                   │
# │ ├── 写入更新的 inode 到日志              │  
# │ ├── 写入更新的 bitmap 到日志             │
# │ Transaction Commit                      │ ← 原子操作
# └──────────────────────────────────────────┘
#       ↓ (Checkpoint: 将日志内容写到实际位置)
# 实际位置更新完成后, 日志项可以回收

# ═══ ext4 日志模式 ═══
# 
# 1. Journal (完整日志)
#    → 数据+元数据都写日志
#    → 最安全, 最慢 (数据写两次)
#    → mount -o data=journal
#
# 2. Ordered (有序, 默认)
#    → 只有元数据写日志
#    → 但保证: 数据先于元数据写入磁盘
#    → 安全且性能好
#    → mount -o data=ordered
#
# 3. Writeback (回写)
#    → 只有元数据写日志
#    → 数据和元数据的写入顺序不保证
#    → 最快, 但崩溃后可能看到旧数据
#    → mount -o data=writeback

# ═══ 日志检查点 (Checkpoint) ═══
# 日志空间有限 (通常 128MB)
# → 已提交且已刷入磁盘的事务可以回收
# → 如果日志写满: 必须等待检查点完成
#
# JBD2 (Journaling Block Device 2):
# ext4 的日志子系统, 独立于文件系统逻辑

# ═══ Copy-on-Write (COW) 文件系统 ═══
# 另一种一致性方案: 不修改原数据, 写新位置
#
# Btrfs (B-tree FS):
# → COW B-tree, 快照几乎零开销
# → 子卷 (subvolume), 透明压缩
# → 校验和 (文件数据 + 元数据)
# → RAID 级别 (0/1/5/6/10)
#
# ZFS:
# → 起源 Solaris, 现在 OpenZFS
# → 端到端校验, 自愈 (self-healing)
# → 128位, 理论容量 256 千万亿 ZB
# → Copy-on-Write + 事务组
# → 数据去重, 压缩, 加密
# → 但: CDDL 许可证, 不在 Linux 主线`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔌 FUSE 与现代文件系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> fuse_modern.py</div>
                <pre className="fs-code">{`# ═══ FUSE (Filesystem in Userspace) ═══
# 在用户态实现文件系统!
# → 不需要修改内核, 不需要 root
# → 开发简单, 适合原型和特殊用途
#
# 架构:
# 用户程序: ls /mnt/myfs/
#     ↓ 系统调用
# VFS 层
#     ↓
# FUSE 内核模块 (/dev/fuse)
#     ↓ 通过文件描述符传消息
# FUSE 用户态守护进程 (你写的代码!)
#     ↓
# 实际操作 (S3/HTTP/数据库/...)

# ═══ Python FUSE 示例 (内存文件系统) ═══
# pip install fusepy

from fuse import FUSE, FuseOSError, Operations
import stat, errno, time

class MemoryFS(Operations):
    def __init__(self):
        self.files = {}
        self.data = {}
        now = time.time()
        self.files['/'] = dict(
            st_mode=stat.S_IFDIR | 0o755,
            st_nlink=2, st_size=0,
            st_ctime=now, st_mtime=now, st_atime=now
        )
    
    def getattr(self, path, fh=None):
        if path not in self.files:
            raise FuseOSError(errno.ENOENT)
        return self.files[path]
    
    def readdir(self, path, fh):
        return ['.', '..'] + [
            name[1:] for name in self.files
            if name != '/' and '/' not in name[1:]
        ]
    
    def create(self, path, mode):
        self.files[path] = dict(
            st_mode=stat.S_IFREG | mode,
            st_nlink=1, st_size=0,
            st_ctime=time.time(),
            st_mtime=time.time(),
            st_atime=time.time()
        )
        self.data[path] = b''
        return 0
    
    def write(self, path, data, offset, fh):
        d = self.data.get(path, b'')
        self.data[path] = d[:offset] + data
        self.files[path]['st_size'] = len(self.data[path])
        return len(data)
    
    def read(self, path, size, offset, fh):
        return self.data.get(path, b'')[offset:offset+size]

# 挂载: FUSE(MemoryFS(), '/mnt/memfs', foreground=True)
# 然后: echo "Hello" > /mnt/memfs/test.txt 就能用了!

# ═══ FUSE 实际应用 ═══
# sshfs:     通过 SSH 挂载远程目录
# s3fs:      把 AWS S3 bucket 挂载为本地目录
# rclone:    支持 40+ 云存储的 FUSE
# encfs:     加密文件系统
# ntfs-3g:   NTFS 读写支持 (Linux 上)
# mergerfs:  合并多个目录为一个视图

# ═══ 现代文件系统趋势 ═══
#
# 1. 分布式文件系统
# CephFS:     分布式, POSIX, 自愈
# GlusterFS:  无中心, 可扩展
# HDFS:       大数据 (Hadoop)
# JuiceFS:    云原生, 兼容 POSIX
#
# 2. 对象存储 (非传统文件系统)
# S3/MinIO:   HTTP API, 无目录层次
# 对象 = 数据 + 元数据 + 唯一 ID
#
# 3. 内存文件系统
# tmpfs:      内存中, /tmp /dev/shm
# ramfs:      无大小限制, 不交换到磁盘
# DAX:        直接访问持久内存 (Intel Optane)

# ═══ 文件系统性能调优 ═══
# $ mount -o noatime /dev/sda1 /data  # 不更新访问时间
# $ tune2fs -l /dev/sda1              # 查看FS参数
# $ filefrag /path/to/file            # 查看碎片
# $ fio --name=test --rw=randread     # I/O 基准测试
#     --size=1G --runtime=30s`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
