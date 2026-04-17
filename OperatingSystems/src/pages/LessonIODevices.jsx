import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['I/O 模型', '设备驱动', '磁盘调度', 'io_uring'];

export default function LessonIODevices() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">⚙️ module_07 — I/O 与设备管理</div>
      <div className="fs-hero">
        <h1>I/O 与设备管理：驱动模型 / DMA / 磁盘调度</h1>
        <p>
          I/O 是操作系统中<strong>最复杂也最影响性能的子系统</strong>。CPU 速度纳秒级，
          磁盘毫秒级——6 个数量级的差距催生了缓冲、DMA、异步 I/O 等一系列优化经典。
          本模块深入 Linux I/O 栈从系统调用到磁盘扇区的完整路径，理解设备驱动模型、
          DMA 零拷贝、以及 io_uring 为何是 Linux I/O 的未来。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ I/O 系统深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📡 I/O 模型对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#475569'}}></span> io_models.txt</div>
                <pre className="fs-code">{`# ═══ I/O 的核心挑战 ═══
# CPU 速度 vs I/O 速度:
#
# CPU 寄存器:    ~1ns
# L1 缓存:      ~1ns
# L2 缓存:      ~4ns
# L3 缓存:      ~10ns
# 内存 (DRAM):  ~100ns
# NVMe SSD:     ~10μs       (比内存慢 100x)
# SATA SSD:     ~100μs      (比内存慢 1000x)
# HDD:          ~10ms       (比内存慢 100,000x!)
# 网络 (LAN):   ~0.5ms
# 网络 (跨洋):  ~100ms
#
# → CPU 等待 I/O = 极大浪费!

# ═══ 五种 I/O 模型 (Stevens, UNIX网络编程) ═══
#
# 1. 阻塞 I/O (Blocking)
# → read() 阻塞直到数据就绪
# → 最简单, 但线程被占用
# → 每个连接一个线程 → 不可扩展
#
# 2. 非阻塞 I/O (Non-blocking)
# → read() 立即返回 EAGAIN
# → 应用循环检查 (轮询) → 浪费 CPU
# → fcntl(fd, F_SETFL, O_NONBLOCK)
#
# 3. I/O 多路复用 (select/poll/epoll)
# → 一个线程监视多个 fd
# → select:  最多 1024 fd, 全量扫描
# → poll:    无限制, 但仍全量扫描
# → epoll:   O(1) 事件通知, Linux 专有
# → epoll 是 Nginx/Redis/Node.js 的基础!
#
# 4. 信号驱动 I/O (SIGIO)
# → 数据就绪时内核发信号
# → 很少使用 (信号太重量级)
#
# 5. 异步 I/O (AIO / io_uring)
# → 发起请求后立即返回
# → 数据完全就绪后通知应用
# → 真正的异步: 内核完成所有工作

# ═══ epoll 核心 API ═══
#
# int epfd = epoll_create1(0);
# 
# struct epoll_event ev;
# ev.events = EPOLLIN | EPOLLET;  // Edge-triggered
# ev.data.fd = listen_fd;
# epoll_ctl(epfd, EPOLL_CTL_ADD, listen_fd, &ev);
#
# struct epoll_event events[MAX_EVENTS];
# while (1) {
#     int n = epoll_wait(epfd, events, MAX_EVENTS, -1);
#     for (int i = 0; i < n; i++) {
#         if (events[i].data.fd == listen_fd) {
#             accept();  // 新连接
#         } else {
#             read();    // 数据就绪
#         }
#     }
# }
#
# Level-triggered (LT): 只要有数据就通知 (默认)
# Edge-triggered (ET): 状态变化时通知一次 (高性能)

# ═══ Linux I/O 栈 ═══
# 
# 应用程序: write(fd, buf, size)
#     ↓
# VFS: 找到对应文件系统
#     ↓
# Page Cache: 数据写入缓存页 (延迟写)
#     ↓
# 文件系统: ext4 映射逻辑块→物理块
#     ↓
# Block Layer: I/O 调度, 合并请求
#     ↓
# Device Driver: 发送命令到硬件
#     ↓
# 磁盘控制器 → 物理磁盘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 设备驱动与 DMA</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> device_driver.txt</div>
                <pre className="fs-code">{`# ═══ 设备分类 ═══
#
# 块设备 (Block Device):
# → 以固定大小块 (512B/4KB) 为单位读写
# → 支持随机访问
# → 例: HDD, SSD, 光驱
# → /dev/sda, /dev/nvme0n1
#
# 字符设备 (Character Device):
# → 以字节流方式读写, 顺序访问
# → 例: 键盘, 鼠标, 串口, 终端
# → /dev/tty, /dev/random
#
# 网络设备:
# → 通过套接字接口访问
# → 例: eth0, wlan0
# → 不出现在 /dev 中

# ═══ DMA (直接内存访问) ═══
# 没有 DMA 时 (PIO, 程序化 I/O):
# CPU 亲自搬运每个字节: 设备→寄存器→内存
# → CPU 被占用, 无法做其他事情!
#
# 有 DMA 时:
# 1. CPU 告诉 DMA 控制器: 源地址, 目标地址, 大小
# 2. DMA 控制器直接在设备和内存之间传输数据
# 3. 传输完成后, DMA 向 CPU 发送中断
# → CPU 只参与启动和结束, 中间时间可以做其他事!
#
# CPU → [命令] → DMA 控制器
#                     ↕ (直接传输)
#               设备 ←→ 内存
#                     ↓
#               [完成中断] → CPU

# ═══ 零拷贝 (Zero-Copy) ═══
# 传统文件发送 (read + write):
# 
# read(file_fd, buf, size):
#   磁盘 → DMA → 内核缓冲区 → CPU → 用户缓冲区
#                 (拷贝1)          (拷贝2)
# write(socket_fd, buf, size):
#   用户缓冲区 → CPU → Socket 缓冲区 → DMA → 网卡
#                (拷贝3)              (拷贝4)
# → 4 次拷贝, 2 次用户态↔内核态切换!

# sendfile() 零拷贝:
#   磁盘 → DMA → 内核缓冲区 → DMA → 网卡
#                 (拷贝1)      (拷贝2)
# → 2 次 DMA 拷贝, 0 次 CPU 拷贝!
# → Nginx/Kafka 大量使用 sendfile

#include <sys/sendfile.h>
// sendfile(socket_fd, file_fd, &offset, count);

# splice(): 在两个 fd 之间直接移动数据
# → 通过管道中间交换, 比 sendfile 更灵活

# ═══ Linux 设备模型 ═══
# 
# /sys (sysfs): 内核设备信息的用户态视图
# /sys/class/     → 按功能分类
# /sys/bus/       → 按总线分类 (PCI/USB/I2C)
# /sys/devices/   → 物理设备层次
# /sys/block/     → 块设备
#
# udev: 动态设备管理
# → 内核发现新设备 → 发送 uevent → udevd 创建 /dev 节点
# → 规则文件: /etc/udev/rules.d/
#
# $ lsblk         # 列出块设备
# $ lspci         # PCI 设备
# $ lsusb         # USB 设备
# $ cat /proc/devices  # 主设备号列表`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💿 磁盘调度算法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> disk_scheduling.txt</div>
                <pre className="fs-code">{`# ═══ HDD 结构与寻道 ═══
# 
# 盘片 (Platter) → 磁道 (Track) → 扇区 (Sector)
#
# 读写一个扇区的时间:
# = 寻道时间 (Seek) + 旋转延迟 + 传输时间
#   ~5-8ms           ~4ms (7200RPM)  ~0.01ms
#
# 寻道时间占大头! → 磁盘调度的目标: 最小化总寻道

# ═══ 调度算法对比 ═══
# 
# 请求队列: 98, 183, 37, 122, 14, 124, 65, 67
# 当前磁头: 53
#
# ── FCFS (先来先服务) ──
# 53→98→183→37→122→14→124→65→67
# 总移动: 640 柱面
# → 不优化, 磁头来回跳
#
# ── SSTF (最短寻道时间优先) ──
# 53→65→67→37→14→98→122→124→183
# 总移动: 236 柱面
# → 贪心, 但可能饥饿 (远处的请求等很久)
#
# ── SCAN (电梯算法) ──
# 磁头单向移动到一端, 然后反转
# 53→37→14→[0]→65→67→98→122→124→183
# → 像电梯一样, 不会饥饿
#
# ── C-SCAN (环形 SCAN) ──
# 只有一个方向服务, 到底后跳回起点
# 53→65→67→98→122→124→183→[199]→[0]→14→37
# → 更公平: 两端的请求等待时间更均匀
#
# ── LOOK / C-LOOK ──
# SCAN 的优化: 不需要走到绝对边界
# 53→65→67→98→122→124→183→37→14
# → 到最远请求就反转, 不浪费行程

# ═══ SSD 的 I/O 调度 ═══
# SSD 没有寻道时间! 随机访问 ≈ 100μs
# → 磁盘调度算法对 SSD 意义不大
# → Linux 对 SSD 使用: 
#   none/noop: 不做排序, 直接提交
#   mq-deadline: 防饥饿的截止时间调度
#   bfq: 公平带宽分配 (适合桌面)
#
# $ cat /sys/block/sda/queue/scheduler
# [mq-deadline] none
# $ echo none > /sys/block/nvme0n1/queue/scheduler

# ═══ Page Cache (页缓存) ═══
# 内核缓存: 把磁盘数据缓存在内存中
# 
# 读: 先查 Page Cache
#   命中 → 直接返回 (无磁盘 I/O!)
#   未命中 → 从磁盘读取, 加入缓存, 预读
# 
# 写: 写入 Page Cache (脏页)
#   → pdflush/writeback 线程定期刷盘
#   → /proc/sys/vm/dirty_ratio: 脏页阈值 (默认20%)
#   → sync / fsync: 强制刷盘
#
# $ free -h
# Mem:  32G total, 4G used, 2G free, 26G buff/cache
#                                    ↑ Page Cache!
# 
# Linux 会用所有"空闲"内存做 Page Cache
# → 这不是内存泄漏! 需要时立即释放`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 io_uring: Linux I/O 的未来</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> io_uring.c</div>
                <pre className="fs-code">{`// ═══ io_uring (Linux 5.1+, Jens Axboe) ═══
// 传统异步 I/O (AIO) 的替代, 真正高性能异步
//
// 核心思想: 用户态和内核共享两个环形缓冲区
// → 提交请求: 无需系统调用!
// → 获取结果: 无需系统调用!
//
// ┌──────────────────────────────────┐
// │ 用户态                           │
// │  ┌──────────────┐               │
// │  │ SQ (提交队列)  │ → 写入请求   │
// │  └──────┬───────┘               │
// │         │ mmap 共享内存          │
// │  ┌──────┴───────┐               │
// │  │ CQ (完成队列)  │ ← 读取结果   │
// │  └──────────────┘               │
// ├──────────────────────────────────┤
// │ 内核态                           │
// │  io_uring 工作线程               │
// │  → 取出 SQ 中的请求             │
// │  → 执行 I/O 操作                │
// │  → 将结果放入 CQ                │
// └──────────────────────────────────┘
//
// io_uring 的优势:
// 1. 零系统调用: 通过共享内存通信
// 2. 批量提交: 一次提交多个 I/O 请求
// 3. 支持所有 I/O: read/write/accept/connect/send/recv
// 4. 链式请求: op1 完成后自动触发 op2
// 5. 固定缓冲区: 减少内存映射开销

// ═══ liburing 使用示例 ═══
#include <liburing.h>

int main() {
    struct io_uring ring;
    io_uring_queue_init(256, &ring, 0);  // 256个队列项
    
    int fd = open("data.bin", O_RDONLY);
    char buf[4096];
    
    // 准备请求
    struct io_uring_sqe *sqe = io_uring_get_sqe(&ring);
    io_uring_prep_read(sqe, fd, buf, sizeof(buf), 0);
    sqe->user_data = 42;  // 用户自定义标识
    
    // 提交 (可以积攒多个再提交)
    io_uring_submit(&ring);
    
    // 等待完成
    struct io_uring_cqe *cqe;
    io_uring_wait_cqe(&ring, &cqe);
    
    printf("Read %d bytes, user_data=%llu\\n",
           cqe->res, cqe->user_data);
    
    io_uring_cqe_seen(&ring, cqe);  // 标记已处理
    io_uring_queue_exit(&ring);
    return 0;
}

// ═══ io_uring 性能数据 (高端NVMe SSD) ═══
// 
// 方式           QD=1 IOPS    QD=128 IOPS
// sync read      ~200K        N/A
// libaio         ~180K        ~1.5M
// io_uring       ~220K        ~2.0M  ← 最高!
// io_uring+poll  ~240K        ~2.5M  
//
// ⚠️ io_uring 安全考量
// 2021-2022 多个 CVE (提权漏洞)
// → 某些容器运行时默认禁用 (Docker)
// → Google 在 ChromeOS/Android 禁用
// → 但长期来看是 Linux I/O 的方向

// ═══ 对比总结 ═══
// ┌──────────┬──────────┬──────────┬────────────┐
// │ 方式     │ 系统调用 │ 批量     │ 适用       │
// ├──────────┼──────────┼──────────┼────────────┤
// │ sync     │ 每次1个  │ 不支持   │ 简单应用   │
// │ epoll    │ 通知就绪 │ 部分     │ 网络服务器 │
// │ AIO      │ 仅文件   │ 支持     │ 数据库     │
// │ io_uring │ 几乎零   │ 强大     │ 全场景     │
// └──────────┴──────────┴──────────┴────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
