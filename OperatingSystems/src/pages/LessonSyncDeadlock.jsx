import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['临界区与互斥', '信号量与条件变量', '经典同步问题', '死锁'];

export default function LessonSyncDeadlock() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔒 module_04 — 同步与死锁</div>
      <div className="fs-hero">
        <h1>同步与死锁：互斥 / 信号量 / 死锁检测与预防</h1>
        <p>
          当多个线程共享资源时，<strong>竞态条件 (Race Condition)</strong> 几乎是最常见的并发 bug。
          本模块从 Peterson 算法的思想实验出发，理解互斥锁 (mutex)、信号量 (semaphore)、
          条件变量 (condition variable) 的底层实现，攻克生产者-消费者 / 读者-写者 / 哲学家就餐三大经典问题，
          并掌握死锁的四个必要条件与工程化预防策略。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔒 同步原语与死锁</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏁 临界区与互斥</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> critical_section.c</div>
                <pre className="fs-code">{`// ═══ 竞态条件 (Race Condition) ═══
// 当多个线程同时访问共享数据,
// 且至少有一个是写操作时, 结果取决于执行顺序

int counter = 0;  // 共享变量

void* increment(void* arg) {
    for (int i = 0; i < 1000000; i++) {
        counter++;  // ← 不是原子操作!
        // 实际是 3 条指令:
        // 1. LOAD  counter → register    (读)
        // 2. ADD   register, 1           (加)
        // 3. STORE register → counter    (写)
        // 
        // 线程 A: LOAD(0) → ADD(1) → 
        // 线程 B:         LOAD(0) → ADD(1) → STORE(1)
        // 线程 A:                            → STORE(1)
        // 结果: counter=1, 而不是 2!  ← 丢失更新
    }
    return NULL;
}
// 2 个线程各加 100万次, 期望 counter=200万
// 实际结果可能是 130-170 万 (每次都不同!)

// ═══ 临界区 (Critical Section) ═══
// 访问共享资源的代码段, 需要互斥保护
//
// Entry Section (进入区) — 请求进入
// → Critical Section (临界区) — 操作共享资源
// Exit Section (退出区) — 释放锁
// → Remainder Section (剩余区) — 其他代码

// ═══ 互斥锁 (Mutex) ═══
#include <pthread.h>

pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
int counter = 0;

void* safe_increment(void* arg) {
    for (int i = 0; i < 1000000; i++) {
        pthread_mutex_lock(&lock);    // 进入临界区
        counter++;                     // 安全操作
        pthread_mutex_unlock(&lock);   // 退出临界区
    }
    return NULL;
}
// 现在结果一定是 200万 (但更慢, 因为串行化)

// ═══ 自旋锁 (Spinlock) ═══
// 不睡眠, 忙等待 — 适合临界区极短的场景
//
// while (test_and_set(&lock)) { }  // 忙等
// // 临界区
// lock = 0;  // 释放
//
// test_and_set: 原子指令, x86 上是 XCHG
// → 读取旧值, 设置新值, 返回旧值 (一条指令)
//
// 自旋锁 vs 互斥锁:
// ┌──────────┬─────────────────┬─────────────────┐
// │ 属性     │ 自旋锁          │ 互斥锁          │
// ├──────────┼─────────────────┼─────────────────┤
// │ 等待方式 │ 忙等 (消耗CPU) │ 睡眠 (让出CPU)  │
// │ 适用场景 │ 临界区<10μs    │ 临界区>10μs     │
// │ 上下文   │ 内核/中断       │ 用户态/内核     │
// │ 持有期间 │ 不能睡眠!      │ 可以睡眠        │
// └──────────┴─────────────────┴─────────────────┘

// ═══ 原子操作 ═══
// 硬件提供的不可分割的操作
// x86: LOCK 前缀 + CMPXCHG (比较并交换)
//
// __sync_fetch_and_add(&counter, 1);  // GCC 内建
// atomic_fetch_add(&counter, 1);       // C11 _Atomic
//
// CAS (Compare-And-Swap) — 无锁编程的基石:
// bool CAS(int *ptr, int expected, int new_val) {
//   if (*ptr == expected) { 
//     *ptr = new_val; return true; 
//   }
//   return false;
// } // 整个操作是原子的!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚦 信号量与条件变量</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> semaphore_condvar.c</div>
                <pre className="fs-code">{`// ═══ 信号量 (Semaphore) — Dijkstra, 1965 ═══
// 一个整数计数器 + 等待队列
// 操作: P (wait/down) 和 V (signal/up)
//
// P(sem): sem--; if (sem < 0) 阻塞;
// V(sem): sem++; if (有等待者) 唤醒一个;
//
// 二元信号量 (sem=1): 等价于互斥锁
// 计数信号量 (sem=N): 限制并发数

#include <semaphore.h>

sem_t sem;
sem_init(&sem, 0, 3);  // 初始值=3, 最多3个并发

// 线程:
sem_wait(&sem);    // P操作: sem--, 可能阻塞
// ... 使用共享资源 (最多同时3个线程) ...
sem_post(&sem);    // V操作: sem++, 可能唤醒

// ═══ 生产者-消费者 (信号量实现) ═══
#define BUF_SIZE 10
int buffer[BUF_SIZE];
int in = 0, out = 0;

sem_t empty;  // 空槽位数, 初始=BUF_SIZE
sem_t full;   // 已占用槽位数, 初始=0
sem_t mutex;  // 互斥锁, 初始=1

void* producer(void* arg) {
    while (1) {
        int item = produce();
        sem_wait(&empty);          // 等待空槽位
        sem_wait(&mutex);          // 进入临界区
        buffer[in] = item;
        in = (in + 1) % BUF_SIZE;
        sem_post(&mutex);          // 退出临界区
        sem_post(&full);           // 通知消费者
    }
}

void* consumer(void* arg) {
    while (1) {
        sem_wait(&full);           // 等待数据
        sem_wait(&mutex);          // 进入临界区
        int item = buffer[out];
        out = (out + 1) % BUF_SIZE;
        sem_post(&mutex);          // 退出临界区
        sem_post(&empty);          // 通知生产者
        consume(item);
    }
}

// ═══ 条件变量 (Condition Variable) ═══
// 比信号量更灵活: 等待 "条件成立" 再继续
// 必须与 mutex 配合使用!

pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  cond = PTHREAD_COND_INITIALIZER;
int data_ready = 0;

// 等待方:
pthread_mutex_lock(&mtx);
while (!data_ready) {           // ← 必须用 while, 不是 if!
    pthread_cond_wait(&cond, &mtx);
    // wait 会: 1. 释放 mutex  2. 阻塞
    //          3. 被唤醒后重新获取 mutex
}
// 使用 data
pthread_mutex_unlock(&mtx);

// 通知方:
pthread_mutex_lock(&mtx);
data_ready = 1;
pthread_cond_signal(&cond);     // 唤醒一个等待者
// pthread_cond_broadcast(&cond); // 唤醒所有等待者
pthread_mutex_unlock(&mtx);

// ⚠️ 为什么必须用 while 而不是 if?
// → 虚假唤醒 (Spurious Wakeup)
// → 被唤醒时条件可能已经不满足了
//   (另一个线程先消费了数据)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧩 经典同步问题</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> classic_problems.txt</div>
                <pre className="fs-code">{`# ═══ 1. 读者-写者问题 ═══
# 多个读者可以同时读 (共享锁)
# 写者需要独占访问 (排他锁)
#
# 读者优先策略 (可能饿死写者):
#   读者:
#     lock(mutex)
#     read_count++
#     if (read_count == 1) lock(write_lock) // 第一个读者锁住
#     unlock(mutex)
#     // ... 读取 ...
#     lock(mutex)
#     read_count--
#     if (read_count == 0) unlock(write_lock) // 最后一个释放
#     unlock(mutex)
#
#   写者:
#     lock(write_lock)
#     // ... 写入 ...
#     unlock(write_lock)
#
# Linux 实现: pthread_rwlock_t (读写锁)
# pthread_rwlock_rdlock(&rwl);  // 读锁 (共享)
# pthread_rwlock_wrlock(&rwl);  // 写锁 (独占)

# ═══ 2. 哲学家就餐问题 (Dijkstra) ═══
#
#           P0
#          /    \\
#     C4 /      \\ C0
#       /        \\
#     P4    🍝    P1
#       \\        /
#    C3  \\     / C1
#         \\  /
#     P3 ── P2
#         C2
#
# 5个哲学家围坐, 5支筷子
# 需要同时拿到左右两支筷子才能吃
#
# 朴素解法 → 死锁!
# 每人都拿起左边的筷子, 等右边的 → 永远等
#
# 解决方案:
# 1. 资源有序: 奇数哲学家先拿左, 偶数先拿右
# 2. 限制同时就餐人数 ≤ 4 (信号量=4)
# 3. 同时拿两支或都不拿 (原子操作)
# 4. Chandy/Misra 解法 (分布式, 脏/干净令牌)

# ═══ 3. 睡觉的理发师问题 ═══
# 理发店: 1 个理发师, N 个等候椅
#
# 理发师:
#   while (1) {
#     sem_wait(&customers); // 没客人就睡觉
#     sem_post(&barber);    // 理发师就绪
#     cut_hair();
#   }
#
# 顾客:
#   lock(mutex);
#   if (waiting < N) {      // 有空椅子
#     waiting++;
#     sem_post(&customers); // 唤醒理发师
#     unlock(mutex);
#     sem_wait(&barber);    // 等理发师
#     get_haircut();
#   } else {
#     unlock(mutex);        // 走掉
#   }

# ═══ 现代并发模式 ═══
# 1. 无锁数据结构 (Lock-free)
#    → 基于 CAS, 高并发下性能优于锁
#    → 如 Java ConcurrentHashMap
#
# 2. RCU (Read-Copy-Update)
#    → Linux 内核大量使用
#    → 读者无开销, 写者创建副本
#    → 适合读多写少场景
#
# 3. 消息传递 (CSP)
#    → Go: channel, Erlang: mailbox
#    → "Don't communicate by sharing memory;
#       share memory by communicating."
#
# 4. 事务内存 (STM)
#    → 把内存操作包装成事务
#    → 冲突自动重试
#    → Intel TSX (硬件), Haskell STM (软件)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💀 死锁</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> deadlock.txt</div>
                <pre className="fs-code">{`# ═══ 死锁定义 ═══
# 一组进程中, 每个进程都在等待只能由该组中
# 其他进程才能释放的资源 → 永远等待下去

# ═══ 死锁的四个必要条件 (Coffman, 1971) ═══
# 必须同时满足, 缺一不可:
#
# 1. 互斥 (Mutual Exclusion)
#    → 资源不能被共享, 一次只能一个进程使用
#
# 2. 持有并等待 (Hold and Wait)
#    → 进程已持有一个资源, 还在等待另一个
#
# 3. 不可抢占 (No Preemption)
#    → 资源只能由持有者主动释放
#
# 4. 循环等待 (Circular Wait)
#    → P1→P2→P3→...→Pn→P1 形成环

# ═══ 死锁示例 ═══
# 线程 A              线程 B
# lock(mutex_1)        lock(mutex_2)
# lock(mutex_2) ← 阻塞  lock(mutex_1) ← 阻塞
#               ↑                    ↑
#               └── A 等 B ──── B 等 A

# ═══ 死锁预防 (Prevention) ═══
# 打破四个条件中的一个:
#
# 打破互斥: 使用无锁算法 / 共享锁
# 打破持有等待: 一次性请求所有资源
# 打破不可抢占: 超时放弃并释放已有资源
# 打破循环等待: 资源编号, 按顺序申请 ← 最实用!
#
# 例: 所有锁按地址排序, 总是先锁小地址
# if (&mutex_a < &mutex_b) {
#     lock(&mutex_a); lock(&mutex_b);
# } else {
#     lock(&mutex_b); lock(&mutex_a);
# }

# ═══ 死锁避免 (Avoidance) ═══
# 银行家算法 (Banker's Algorithm, Dijkstra):
# → 模拟资源分配, 判断是否进入"不安全状态"
# → 不安全状态: 可能导致死锁
# → 安全状态: 存在至少一个安全序列
#
# Available = [3, 3, 2]  (A, B, C 三种资源)
#
# ┌────┬──────────┬──────────┬───────────┐
# │ Pi │ Max Need │ Allocated│  Need     │
# ├────┼──────────┼──────────┼───────────┤
# │ P0 │ 7, 5, 3  │ 0, 1, 0  │ 7, 4, 3  │
# │ P1 │ 3, 2, 2  │ 2, 0, 0  │ 1, 2, 2  │
# │ P2 │ 9, 0, 2  │ 3, 0, 2  │ 6, 0, 0  │
# │ P3 │ 2, 2, 2  │ 2, 1, 1  │ 0, 1, 1  │
# │ P4 │ 4, 3, 3  │ 0, 0, 2  │ 4, 3, 1  │
# └────┴──────────┴──────────┴───────────┘
#
# 安全序列: <P1, P3, P4, P2, P0>
# → P1 请求 [1,2,2] ≤ Available [3,3,2] ✓
# → P1 完成后释放, Available = [5,3,2]
# → P3 请求 [0,1,1] ≤ [5,3,2] ✓ → ...

# ═══ 死锁检测与恢复 ═══
# 允许死锁发生, 但能检测并恢复
#
# 检测: 资源分配图 (RAG)
# → 进程→资源: 请求边
# → 资源→进程: 分配边
# → 如果图中有环 = 死锁
#
# 恢复:
# 1. 终止进程 (杀掉代价最小的)
# 2. 资源抢占 (回滚某个进程)
# 3. 检查点重启 (事务回滚)

# ═══ 实践经验 ═══
# 1. 锁排序: 全局统一的获取顺序
# 2. 超时: pthread_mutex_timedlock()
# 3. 尽量减少锁粒度和持有时间
# 4. 用更高级的抽象 (channel, actor)
# 5. Linux: lockdep 工具检测潜在死锁
#    CONFIG_LOCKDEP=y (开发/调试内核时启用)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
