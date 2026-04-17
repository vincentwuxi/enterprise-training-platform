import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['OS 演进史', '内核架构', '系统调用', '中断与陷阱'];

export default function LessonOSIntro() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🖥️ module_01 — 操作系统概述</div>
      <div className="fs-hero">
        <h1>操作系统概述：演进 / 架构 / 系统调用 / 中断</h1>
        <p>
          操作系统是<strong>硬件与应用程序之间的抽象层</strong>——它管理 CPU、内存、磁盘、网络，
          并为上层提供统一的编程接口。本模块从批处理到分时再到现代微内核/混合内核的演进脉络出发，
          深入系统调用 (syscall) 的用户态/内核态切换机制，以及中断驱动 I/O 的底层原理。
          <strong>理解 OS = 理解计算机的"灵魂"</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🖥️ 操作系统入门</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📜 操作系统演进史</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#475569'}}></span> os_evolution.txt</div>
                <pre className="fs-code">{`# ═══ 操作系统演进时间线 ═══

# 第零代：裸机时代 (1940s-1950s)
# → 没有操作系统，程序员直接操作硬件
# → 用打孔卡片输入程序，手动切换作业
# → 问题: CPU 大量时间空闲 (等待 I/O)

# 第一代：批处理系统 (1950s-1960s)
# → 自动顺序执行多个作业 (Job)
# → 监控程序 (Monitor) 驻留内存
# → 多道批处理 (Multiprogramming):
#   当 Job A 等待 I/O 时, CPU 切换到 Job B
#
# 内存布局:
# ┌─────────────┐
# │   Monitor   │ ← 常驻内存, 管理作业调度
# ├─────────────┤
# │   Job A     │ ← 等待磁盘 I/O, CPU 空闲
# ├─────────────┤
# │   Job B     │ ← CPU 执行此作业
# ├─────────────┤
# │   Job C     │ ← 等待执行
# └─────────────┘

# 第二代：分时系统 (1960s-1970s)
# → 多个用户通过终端共享一台计算机
# → 时间片轮转: 每个用户获得 ~100ms CPU 时间
# → 交互式! 用户可以即时看到输出
# → 关键系统: MULTICS → 启发了 UNIX
# → UNIX (1969, Ken Thompson & Dennis Ritchie, Bell Labs)

# 第三代：个人电脑时代 (1980s-1990s)
# → MS-DOS (1981): 单任务, 命令行
# → Mac OS (1984): 第一个商用 GUI
# → Windows 3.0/95: 多任务 + GUI
# → Linux (1991, Linus Torvalds)

# 第四代：现代操作系统 (2000s-至今)
# → 多核处理器支持
# → 虚拟化 (VMware/KVM)
# → 容器化 (Docker/cgroups)
# → 实时 OS (RTOS) for IoT/嵌入式
# → 移动 OS: Android (Linux内核) / iOS (XNU)

# ═══ 操作系统的四大核心职责 ═══
# 1. 进程管理:  创建/调度/同步/终止进程
# 2. 内存管理:  分配/回收/虚拟内存/页面置换
# 3. 文件管理:  组织/存储/检索/保护文件
# 4. 设备管理:  驱动/缓冲/中断处理

# ═══ OS 的本质: 两个视角 ═══
# 视角 1 — 资源管理器:
#   OS 是 CPU/内存/磁盘/网络的"管家"
#   负责多个程序公平、安全地共享资源
#
# 视角 2 — 抽象机器:
#   OS 把复杂硬件抽象为简单接口:
#   磁盘 → 文件        (open/read/write)
#   内存 → 地址空间    (虚拟内存)
#   CPU  → 进程/线程   (fork/exec)
#   网卡 → 套接字      (socket)

# 设计哲学:
# "Everything is a file" — UNIX
# "Program to an interface, not an implementation" — OS 的核心理念`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 内核架构对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> kernel_architecture.txt</div>
                <pre className="fs-code">{`# ═══ 1. 宏内核 (Monolithic Kernel) ═══
# 所有 OS 服务运行在内核空间 (Ring 0)
# 代表: Linux, FreeBSD, 传统 UNIX
#
# ┌────────────────────────────────────────┐
# │            用户空间 (Ring 3)            │
# │  [App A]  [App B]  [Shell]  [GUI]     │
# ├────────────────────────────────────────┤
# │            内核空间 (Ring 0)            │
# │  ┌──────┬──────┬──────┬──────┐       │
# │  │ 进程 │ 内存 │ 文件 │ 网络 │       │
# │  │ 管理 │ 管理 │ 系统 │ 协议 │       │
# │  ├──────┼──────┼──────┼──────┤       │
# │  │      设备驱动程序层       │       │
# │  └──────────────────────────┘       │
# ├────────────────────────────────────────┤
# │              硬件                      │
# └────────────────────────────────────────┘
#
# ✅ 性能高: 内核内部函数调用, 无上下文切换
# ❌ 稳定性差: 一个驱动崩溃 → 整个系统宕机
# ❌ 安全性差: 所有代码在最高权限运行

# ═══ 2. 微内核 (Microkernel) ═══
# 只保留最核心功能在内核: IPC + 调度 + 内存映射
# 其余服务 (文件系统/网络/驱动) 运行在用户空间
# 代表: Minix, QNX, L4, Fuchsia (Google)
#
# ┌────────────────────────────────────────┐
# │            用户空间 (Ring 3)            │
# │  [App] [FS Server] [Net Server] [DRV] │
# │         ↕ IPC ↕         ↕ IPC ↕       │
# ├────────────────────────────────────────┤
# │     微内核 (Ring 0) — 极小!            │
# │  ┌────────┬──────────┬──────────┐     │
# │  │  IPC   │ 基本调度 │ 内存映射 │     │
# │  └────────┴──────────┴──────────┘     │
# ├────────────────────────────────────────┤
# │              硬件                      │
# └────────────────────────────────────────┘
#
# ✅ 稳定性: 驱动/FS 崩溃不影响内核
# ✅ 安全性: 最小权限原则
# ❌ 性能: 频繁的 IPC 和上下文切换

# ═══ 3. 混合内核 (Hybrid Kernel) ═══
# 兼顾宏内核的性能和微内核的设计理念
# 代表: Windows NT / macOS XNU
#
# XNU = Mach (微内核) + BSD (宏内核功能)
# → Mach: IPC, 虚拟内存, 线程调度
# → BSD:  网络, 文件系统, POSIX 接口

# ═══ 4. 外核 (Exokernel) ═══
# 最小化抽象, 让应用程序直接管理硬件资源
# 内核只负责资源分配和保护
# 代表: MIT Exokernel (学术), Unikernel (变体)
#
# ═══ Linux 内核源码规模 (6.x) ═══
# 总代码量: ~3000 万行 C 代码
# drivers/  → ~60% (设备驱动是最大部分)
# arch/     → ~15% (架构相关: x86/ARM/RISC-V)
# fs/       → ~8%  (文件系统)
# net/      → ~7%  (网络)
# kernel/   → ~3%  (核心调度/同步)
# mm/       → ~2%  (内存管理)
#
# "Linux 是带有微内核思想的宏内核"
# → 可加载内核模块 (LKM) 实现了部分微内核的灵活性`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔲 系统调用机制 (syscall)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> syscall_mechanism.c</div>
                <pre className="fs-code">{`// ═══ 系统调用: 用户程序请求内核服务的唯一入口 ═══
//
// 用户态 (Ring 3)         内核态 (Ring 0)
// ┌──────────────┐       ┌──────────────────┐
// │  printf()    │       │                  │
// │    ↓         │       │                  │
// │  write() ────┼──→ ───┼→ sys_write()     │
// │  (libc 包装) │ syscall│  (内核实现)      │
// │              │ ←── ←─┼─ 返回结果        │
// └──────────────┘       └──────────────────┘
//
// 切换过程 (x86-64):
// 1. 用户程序调用 libc 的 write()
// 2. libc 把 syscall 号放入 rax (write = 1)
// 3. 参数放入 rdi, rsi, rdx, r10, r8, r9
// 4. 执行 syscall 指令
// 5. CPU 自动:
//    - 保存用户态 RIP/RSP 到 MSR
//    - 切换到内核栈
//    - 跳转到内核入口 (entry_SYSCALL_64)
// 6. 内核根据 rax 查找 sys_call_table
// 7. 执行对应的内核函数
// 8. 返回值放入 rax, 执行 sysret 切回用户态

// ═══ C 代码: 直接使用 syscall ═══
#include <unistd.h>
#include <sys/syscall.h>

int main() {
    // 方式 1: 通过 libc 包装函数 (推荐)
    write(1, "Hello\\n", 6);        // fd=1 → stdout

    // 方式 2: 直接调用 syscall (底层)
    syscall(SYS_write, 1, "World\\n", 6);

    // 方式 3: 内联汇编 (最底层, x86-64)
    // asm volatile (
    //     "mov $1, %%rax\\n"    // syscall号: write=1
    //     "mov $1, %%rdi\\n"    // fd = stdout
    //     "mov %0, %%rsi\\n"    // buf
    //     "mov $6, %%rdx\\n"    // count
    //     "syscall"
    //     : : "r"("Hello\\n") : "rax","rdi","rsi","rdx"
    // );
    return 0;
}

// ═══ 常见 Linux 系统调用 ═══
// 号  名称          功能
// 0   read          读取文件/设备
// 1   write         写入文件/设备
// 2   open          打开文件
// 3   close         关闭文件描述符
// 9   mmap          内存映射
// 57  fork          创建子进程
// 59  execve        执行新程序
// 60  exit          终止进程
// 62  kill          发送信号
// 231 exit_group    终止进程组

// ═══ strace: 跟踪系统调用 ═══
// $ strace -c ls          # 统计 syscall 调用次数
// $ strace -e trace=open,read,write ls
// $ strace -p 1234        # 跟踪运行中的进程
//
// 示例输出:
// open(".", O_RDONLY|O_DIRECTORY) = 3
// getdents64(3, [...], 32768) = 720
// write(1, "file1.txt\\nfile2.txt\\n", 20) = 20
// close(3)                         = 0

// ═══ 系统调用的性能开销 ═══
// 一次 syscall ≈ 200-500ns (x86-64)
// 包括: 模式切换 + TLB flush + 寄存器保存/恢复
// → 对比: 普通函数调用 ≈ 1-5ns
// → 所以 libc 会缓冲 (如 printf 不是每次都 write)
// → vDSO: 某些 syscall 不需要切换到内核态
//   (如 gettimeofday, clock_gettime)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 中断与陷阱机制</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> interrupts_traps.txt</div>
                <pre className="fs-code">{`# ═══ 中断分类 ═══
#
# 中断 (Interrupt) — 来自硬件, 异步发生
# ┌──────────────────────────────────────┐
# │ 类型          举例                    │
# ├──────────────────────────────────────┤
# │ 时钟中断      定时器到期 (调度)       │
# │ I/O 中断      磁盘完成读取           │
# │ 键盘中断      用户按键               │
# │ 网络中断      网卡收到数据包         │
# └──────────────────────────────────────┘
#
# 异常 (Exception) — 来自 CPU, 同步发生
# ┌──────────────────────────────────────┐
# │ 类型          举例                    │
# ├──────────────────────────────────────┤
# │ Fault (故障)  缺页异常 → 可恢复      │
# │ Trap (陷阱)   syscall / 断点 → 有意  │
# │ Abort (中止)  硬件错误 → 不可恢复    │
# └──────────────────────────────────────┘

# ═══ 中断处理流程 (x86) ═══
#
# 1. 硬件设备产生中断信号
# 2. 中断控制器 (APIC) 将信号发送给 CPU
# 3. CPU 完成当前指令, 检测到中断
# 4. CPU 自动:
#    ├── 保存 RFLAGS, CS, RIP 到内核栈
#    ├── 禁用同级别中断 (cli)
#    └── 查找 IDT (中断描述符表)
# 5. 跳转到对应的中断处理程序 (ISR)
# 6. ISR 执行:
#    ├── 保存更多寄存器
#    ├── 处理中断 (如读取磁盘数据)
#    ├── 发送 EOI (End of Interrupt)
#    └── 恢复寄存器
# 7. 执行 iret 指令返回
# 8. CPU 恢复之前的执行状态

# ═══ IDT (中断描述符表) ═══
# 256 个条目, 每个指向一个处理函数
#
# 向量号    用途
# 0         除零异常
# 6         非法指令
# 13        一般保护故障 (GPF)
# 14        缺页异常 (Page Fault) ← 最重要!
# 32-47     硬件中断 (IRQ 0-15)
# 32        时钟中断 (PIT/APIC Timer)
# 33        键盘中断
# 128 (0x80) 传统系统调用入口 (int 0x80)

# ═══ 缺页异常 (Page Fault) 详解 ═══
# 最常见也最重要的异常!
#
# 触发场景:
# 1. 合法访问 → 页面在磁盘 (swap)
#    → OS 从磁盘加载页面到内存
#    → 更新页表, 重新执行指令
#
# 2. 合法访问 → 首次访问 (Demand Paging)
#    → OS 分配物理页, 清零
#    → 更新页表, 重新执行
#
# 3. 合法访问 → Copy-on-Write (fork 后)
#    → OS 复制页面, 标记为可写
#    → 重新执行写操作
#
# 4. 非法访问 → 段错误 (Segmentation Fault)
#    → OS 发送 SIGSEGV 信号给进程
#    → 进程被终止

# ═══ 中断的性能影响 ═══
# 硬件中断频率:
# 时钟中断: 250-1000 Hz (Linux 默认 CONFIG_HZ=250)
# 网络中断: 每秒可达数十万次 (万兆网卡)
#
# 优化技术:
# 1. NAPI (Linux): 高负载时从中断切换到轮询
# 2. 中断合并 (Interrupt Coalescing):
#    网卡积攒多个包后触发一次中断
# 3. 中断亲和性 (IRQ Affinity):
#    绑定特定中断到特定 CPU 核心
#    $ cat /proc/interrupts  # 查看中断统计
#    $ echo 4 > /proc/irq/44/smp_affinity  # 绑定到 CPU 2

# ═══ 用户态 vs 内核态 (保护环) ═══
# Ring 0: 内核态 — 完全硬件访问权限
# Ring 3: 用户态 — 受限, 不能直接访问硬件
#
# 用户态 → 内核态 的三种途径:
# 1. 系统调用 (Trap): int 0x80 / syscall
# 2. 异常 (Exception): 缺页 / 除零
# 3. 中断 (Interrupt): 时钟 / I/O 完成`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
