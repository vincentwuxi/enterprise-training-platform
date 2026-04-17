import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['进程基础', '进程生命周期', '线程模型', '进程间通信'];

export default function LessonProcessThread() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔄 module_02 — 进程与线程</div>
      <div className="fs-hero">
        <h1>进程与线程：创建 / 状态 / 调度 / 线程模型</h1>
        <p>
          进程是<strong>资源分配的基本单位</strong>，线程是<strong>CPU 调度的基本单位</strong>。
          本模块从 PCB (进程控制块) 的数据结构出发，深入 fork/exec/wait 的 UNIX 进程模型，
          解析用户线程 vs 内核线程的映射关系，以及 Linux 中 task_struct 的实现细节。
          <strong>理解 fork() 是理解 UNIX 的关键</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔄 进程与线程深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 进程基础与 PCB</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#475569'}}></span> process_basics.c</div>
                <pre className="fs-code">{`// ═══ 什么是进程? ═══
// 进程 = 正在执行的程序 + 它的资源
// 
// 程序 (Program): 磁盘上的二进制文件 (静态)
// 进程 (Process): 程序的运行实例 (动态)
// 
// 一个程序可以产生多个进程
// (如同时打开两个 Chrome 窗口 = 两个进程)

// ═══ 进程的地址空间 ═══
// 
// 高地址  ┌──────────────────┐  0xFFFF...
//         │    内核空间       │  ← 用户程序不可访问
//         ├──────────────────┤  0x7FFF...
//         │    栈 (Stack) ↓  │  ← 局部变量, 函数调用
//         │                  │
//         │    (空闲区域)     │
//         │                  │
//         │    堆 (Heap)  ↑  │  ← malloc/new
//         ├──────────────────┤
//         │   BSS (未初始化) │  ← int count; 
//         ├──────────────────┤
//         │   Data (已初始化)│  ← int x = 42;
//         ├──────────────────┤
//         │   Text (代码段)  │  ← 可执行指令, 只读
// 低地址  └──────────────────┘  0x0000...

// ═══ PCB (进程控制块) — 内核中的进程描述 ═══
// Linux 中叫 task_struct, 约 6KB 大小

// struct task_struct {  // Linux 简化版
//   volatile long state;       // 进程状态
//   pid_t pid;                 // 进程 ID
//   pid_t tgid;                // 线程组 ID (主线程PID)
//   struct task_struct *parent; // 父进程
//   struct list_head children;  // 子进程链表
//   struct mm_struct *mm;       // 内存描述符
//   struct files_struct *files; // 打开的文件表
//   int prio;                  // 调度优先级
//   u64 utime, stime;          // 用户态/内核态CPU时间
//   // ... 还有 ~700 个字段
// };

// ═══ fork() — UNIX 进程创建的核心 ═══
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    printf("Parent PID: %d\\n", getpid());
    
    pid_t pid = fork();  // 创建子进程
    // fork() 的魔法: 
    //   调用一次, 返回两次!
    //   父进程: pid = 子进程的 PID (>0)
    //   子进程: pid = 0
    
    if (pid < 0) {
        perror("fork failed");
        return 1;
    } else if (pid == 0) {
        // ─── 子进程 ───
        printf("Child PID: %d, Parent: %d\\n",
               getpid(), getppid());
        // 子进程是父进程的 "副本":
        // - 独立的地址空间 (Copy-on-Write)
        // - 继承打开的文件描述符
        // - 继承环境变量、信号处理
        // 但: PID 不同, fork返回值不同
    } else {
        // ─── 父进程 ───
        int status;
        waitpid(pid, &status, 0); // 等待子进程
        printf("Child exited with: %d\\n", 
               WEXITSTATUS(status));
    }
    return 0;
}

// ═══ Copy-on-Write (COW) ═══
// fork() 并不会立刻复制全部内存!
// → 父子进程共享同一物理页面 (标记为只读)
// → 只有当某一方 写入 时, 才复制该页
// → 极大减少 fork 的开销
// → 特别对 fork+exec 模式超高效`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔁 进程状态与生命周期</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> process_lifecycle.txt</div>
                <pre className="fs-code">{`# ═══ 进程五状态模型 ═══
#
#          fork()         调度器选中
#   新建 ────────→ 就绪 ────────→ 运行
#  (New)          (Ready)         (Running)
#                  ↑    ╲           │  │
#                  │     ╲ 时间片    │  │
#                  │      ╲ 到期     │  │
#                  │       ╲─────── ┘  │
#                  │                    │
#                  │ I/O 完成     等待 I/O / 
#                  │ / 事件发生   / 事件
#                  │                    │
#                  └──── 阻塞 ←────────┘
#                       (Blocked)
#                          │
#                          │ 终止
#                          ↓
#                        终止 (Terminated/Zombie)

# ═══ Linux 进程状态 (task_struct->state) ═══
# TASK_RUNNING       (R)  运行中 或 在就绪队列中
# TASK_INTERRUPTIBLE (S)  可中断睡眠 (等待信号/事件)
# TASK_UNINTERRUPTIBLE (D) 不可中断睡眠 (通常等硬件I/O)
# __TASK_STOPPED     (T)  被信号 SIGSTOP 暂停
# __TASK_TRACED      (t)  被 ptrace 跟踪 (调试)
# EXIT_ZOMBIE        (Z)  已终止,等待父进程 wait()
# EXIT_DEAD          (X)  已终止,正在被回收

# ═══ 僵尸进程 (Zombie) ═══
# 子进程已退出, 但父进程没有调用 wait()
# → 子进程的 task_struct 残留在内核中
# → 占用 PID 和少量内存
# → ps 输出显示 "Z" 状态
#
# 危害: PID 是有限的 (/proc/sys/kernel/pid_max)
#       大量僵尸进程会耗尽 PID
#
# 解决:
# 1. 父进程调用 wait()/waitpid()
# 2. 信号处理: signal(SIGCHLD, SIG_IGN)
# 3. 二次 fork (孤儿进程由 init 接管)
# 4. kill 父进程 → 僵尸被 init 回收

# ═══ 孤儿进程 (Orphan) ═══
# 父进程先于子进程退出
# → 子进程被 init (PID=1) 收养
# → init 会自动 wait() 回收
# → 所以孤儿进程通常不是问题

# ═══ 进程家族树 ═══
# $ pstree -p
#
# systemd(1)─┬─sshd(1234)───sshd(2345)───bash(2346)
#             ├─nginx(3456)─┬─nginx(3457)
#             │             └─nginx(3458)
#             ├─dockerd(4567)───containerd(4568)
#             └─cron(5678)

# ═══ exec() — 程序替换 ═══
# fork + exec = UNIX 创建新进程的标准模式
#
# fork(): 创建一个 clone
# exec(): 用新程序 替换 当前进程的地址空间
#
# pid_t pid = fork();
# if (pid == 0) {
#     // 子进程: 替换为 ls 程序
#     execvp("ls", (char*[]){"ls", "-la", NULL});
#     // exec 成功后, 下面的代码永远不会执行
#     perror("exec failed");
# }

# ═══ 上下文切换 (Context Switch) ═══
# 当 CPU 从进程 A 切换到进程 B:
# 1. 保存 A 的寄存器 (通用/浮点/向量) 到 A 的 PCB
# 2. 保存 A 的 PC (程序计数器)
# 3. 刷新 TLB (页表缓存) — 开销最大!
# 4. 从 B 的 PCB 恢复寄存器
# 5. 恢复 B 的 PC, 继续执行 B
#
# 一次上下文切换 ≈ 1-10 μs (取决于 TLB miss 率)
# → 这就是为什么线程比进程轻量
#   线程切换不需要刷新 TLB (共享地址空间)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧵 线程模型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> thread_model.c</div>
                <pre className="fs-code">{`// ═══ 进程 vs 线程 ═══
// 
// ┌──────────┬──────────────────┬──────────────────┐
// │  属性    │     进程          │     线程          │
// ├──────────┼──────────────────┼──────────────────┤
// │ 地址空间 │ 独立 (隔离)      │ 共享 (同进程)     │
// │ 创建开销 │ 大 (复制页表)    │ 小 (共享页表)     │
// │ 切换开销 │ 大 (刷TLB)       │ 小 (不刷TLB)      │
// │ 通信方式 │ IPC (管道/共享内存)│ 直接读写共享变量  │
// │ 崩溃影响 │ 不影响其他进程   │ 可能导致整个进程崩溃│
// │ 资源     │ 独立文件表/信号处理│ 共享文件/信号     │
// │ 调试     │ 相对容易         │ 竞态条件难debug   │
// └──────────┴──────────────────┴──────────────────┘

// ═══ 线程映射模型 ═══
//
// 1:1 模型 (Linux NPTL, 现代 UNIX)
// 每个用户线程对应一个内核线程
// ┌──────────┐     ┌──────────┐
// │ U-Thread │────→│ K-Thread │→ CPU
// │ U-Thread │────→│ K-Thread │→ CPU
// │ U-Thread │────→│ K-Thread │→ CPU
// └──────────┘     └──────────┘
// ✅ 真正并行  ✅ 一个阻塞不影响其他
// ❌ 创建开销略大  ❌ 内核线程数有上限

// M:1 模型 (Green Threads)
// 多个用户线程映射到一个内核线程
// ┌──────────┐     ┌──────────┐
// │ U-Thread │────╲│ K-Thread │→ CPU
// │ U-Thread │────→│          │
// │ U-Thread │────╱│          │
// └──────────┘     └──────────┘
// ✅ 创建极快  ✅ 超轻量
// ❌ 不能真正并行  ❌ 一个阻塞全部阻塞

// M:N 模型 (Go goroutine, Erlang)
// M 个用户线程映射到 N 个内核线程 (M>N)
// ┌──────────┐     ┌──────────┐
// │ U-Thread │──╲  │ K-Thread │→ CPU
// │ U-Thread │───→ │ K-Thread │→ CPU 
// │ U-Thread │──╱  │          │
// │ U-Thread │╱    └──────────┘
// └──────────┘
// ✅ 真正并行 + 超轻量  ✅ 用户态调度器
// ❌ 实现复杂

// ═══ POSIX Threads (pthreads) 示例 ═══
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

void* worker(void* arg) {
    int id = *(int*)arg;
    printf("Thread %d: PID=%d, TID=%lu\\n",
           id, getpid(), pthread_self());
    // 注意: 所有线程的 getpid() 返回值相同!
    return NULL;
}

int main() {
    pthread_t threads[4];
    int ids[4];
    
    for (int i = 0; i < 4; i++) {
        ids[i] = i;
        pthread_create(&threads[i], NULL, worker, &ids[i]);
    }
    for (int i = 0; i < 4; i++) {
        pthread_join(threads[i], NULL);  // 等待线程结束
    }
    return 0;
}
// 编译: gcc -pthread thread_demo.c -o demo

// ═══ Linux 的实现: clone() ═══
// Linux 中进程和线程都是 task_struct
// fork()   = clone(SIGCHLD, 0)
// pthread  = clone(CLONE_VM | CLONE_FS |
//                  CLONE_FILES | CLONE_SIGHAND, stack)
//
// CLONE_VM:    共享虚拟内存空间
// CLONE_FS:    共享文件系统信息
// CLONE_FILES: 共享文件描述符表
// CLONE_SIGHAND: 共享信号处理
//
// Linux 不区分"进程"和"线程" — 统一称为"任务 (task)"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📡 进程间通信 (IPC)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> ipc_mechanisms.c</div>
                <pre className="fs-code">{`// ═══ IPC 机制对比 ═══
//
// ┌───────────────┬──────────┬──────────┬──────────┐
// │   机制        │  速度    │  容量    │  适用场景 │
// ├───────────────┼──────────┼──────────┼──────────┤
// │ 管道 (Pipe)   │  快      │ 64KB缓冲│ 父子进程  │
// │ 命名管道(FIFO)│  快      │ 64KB    │ 任意进程  │
// │ 消息队列      │  中      │ 可配置  │ 消息传递  │
// │ 共享内存      │  最快    │ 可配置  │ 大数据交换│
// │ 信号 (Signal) │  快      │ 1 bit   │ 异步通知  │
// │ 套接字(Socket)│  较慢    │ 无限    │ 跨网络    │
// │ Unix Socket   │  快      │ 无限    │ 同机通信  │
// └───────────────┴──────────┴──────────┴──────────┘

// ═══ 1. 管道 (Pipe) ═══
#include <unistd.h>
int main() {
    int pipefd[2];  // [0]=读端, [1]=写端
    pipe(pipefd);
    
    pid_t pid = fork();
    if (pid == 0) {
        // 子进程: 写入管道
        close(pipefd[0]);  // 关闭读端
        write(pipefd[1], "Hello from child", 16);
        close(pipefd[1]);
    } else {
        // 父进程: 从管道读取
        close(pipefd[1]);  // 关闭写端
        char buf[64];
        read(pipefd[0], buf, sizeof(buf));
        printf("Received: %s\\n", buf);
        close(pipefd[0]);
    }
    // Shell 中的管道: ls | grep .txt | wc -l
    // 就是连接了三个进程的管道链!
}

// ═══ 2. 共享内存 (最快的IPC) ═══
#include <sys/mman.h>
#include <fcntl.h>
// 生产者:
int fd = shm_open("/my_shm", O_CREAT|O_RDWR, 0666);
ftruncate(fd, 4096);
char *ptr = mmap(NULL, 4096, PROT_READ|PROT_WRITE,
                 MAP_SHARED, fd, 0);
sprintf(ptr, "Shared data: %d", 42);
// 消费者:
// 同样的 shm_open + mmap, 直接读取 ptr
// ⚠️ 需要同步机制 (信号量/互斥锁)!

// ═══ 3. 信号 (Signal) ═══
// 异步通知机制, UNIX 最古老的 IPC
//
// 常见信号:
// SIGINT  (2)  Ctrl+C, 终止进程
// SIGKILL (9)  强制杀死 (不可捕获!)
// SIGSEGV (11) 段错误
// SIGTERM (15) 优雅终止 (默认 kill)
// SIGCHLD (17) 子进程状态改变
// SIGSTOP (19) 暂停进程 (不可捕获)
// SIGUSR1 (10) 用户自定义信号
//
#include <signal.h>
void handler(int sig) {
    printf("Caught signal %d\\n", sig);
}
int main() {
    signal(SIGINT, handler);  // 注册处理函数
    while (1) pause();        // 等待信号
}
// $ kill -USR1 <pid>   # 发送信号

// ═══ 4. Unix Domain Socket ═══
// Docker / systemd / X11 都使用 Unix Socket
// 比 TCP 快 2-3x (无网络协议开销)
// 
// 服务端: socket(AF_UNIX, SOCK_STREAM, 0)
//         bind("/var/run/myapp.sock")
//         listen() → accept()
// 客户端: connect("/var/run/myapp.sock")
//
// $ ls -la /var/run/docker.sock
// → dockerd 通过 Unix Socket 通信

// ═══ 现代替代方案 ═══
// D-Bus:     Linux 桌面环境的标准 IPC
// io_uring:  Linux 5.1+ 异步 I/O 框架
// gRPC:      跨语言跨网络的高性能 RPC
// Binder:    Android 进程间通信机制`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
