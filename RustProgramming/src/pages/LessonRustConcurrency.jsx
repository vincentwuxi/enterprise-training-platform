import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['线程与消息传递', '共享状态并发', 'Send 与 Sync', 'Rayon 并行'];

export default function LessonRustConcurrency() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🦀 module_04 — 并发编程</div>
      <div className="fs-hero">
        <h1>并发编程：线程 / Arc{'<Mutex>'} / Channel / Rayon</h1>
        <p>
          Rust 的并发安全是 <strong>"无畏并发" (Fearless Concurrency)</strong> 的体现——
          编译器在编译期就阻止数据竞争。Send/Sync trait 让类型系统成为并发安全的守护者，
          Channel 提供 Go 风格的消息传递，Arc{'<Mutex>'} 处理共享状态，Rayon 让数据并行
          只需一行代码改动。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦀 并发编程深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧵 线程与消息传递</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f74c00'}}></span> threads_channels.rs</div>
                <pre className="fs-code">{`use std::thread;
use std::sync::mpsc;
use std::time::Duration;

// ═══ 创建线程 ═══
fn thread_basics() {
    // spawn 创建新 OS 线程
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("spawned thread: {i}");
            thread::sleep(Duration::from_millis(1));
        }
    });
    
    // 主线程继续执行...
    for i in 1..5 {
        println!("main thread: {i}");
        thread::sleep(Duration::from_millis(1));
    }
    
    handle.join().unwrap();  // 等待子线程结束
    // join() 返回 Result, unwrap 获取值或 panic
}

// ═══ move 闭包: 线程获取数据所有权 ═══
fn move_to_thread() {
    let v = vec![1, 2, 3];
    
    // ❌ 不用 move: 闭包借用了 v, 但线程可能比 v 活得久!
    // let handle = thread::spawn(|| { println!("{v:?}"); });
    
    // ✅ 使用 move: v 的所有权转移到线程
    let handle = thread::spawn(move || {
        println!("{v:?}");
    });
    // println!("{v:?}"); // ❌ v 已经 move
    handle.join().unwrap();
}

// ═══ Channel: 消息传递 ═══
// mpsc = Multiple Producer, Single Consumer
fn channel_demo() {
    let (tx, rx) = mpsc::channel();
    
    // 生产者线程
    thread::spawn(move || {
        let msgs = vec!["hi", "from", "the", "thread"];
        for msg in msgs {
            tx.send(msg).unwrap();
            thread::sleep(Duration::from_millis(200));
        }
        // tx 在这里被 drop, 通道关闭
    });
    
    // 消费者 (主线程)
    // rx.recv()  — 阻塞等待
    // rx.try_recv() — 非阻塞
    for received in rx {  // rx 实现了 Iterator!
        println!("Got: {received}");
    }
    // 通道关闭时迭代器结束
}

// ═══ 多生产者 ═══
fn multi_producer() {
    let (tx, rx) = mpsc::channel();
    
    for i in 0..3 {
        let tx_clone = tx.clone();  // clone 发送端
        thread::spawn(move || {
            tx_clone.send(format!("msg from thread {i}")).unwrap();
        });
    }
    drop(tx);  // 必须 drop 原始 tx, 否则 rx 永远不会结束!
    
    for msg in rx {
        println!("{msg}");
    }
}

// ═══ crossbeam channel (更强大) ═══
// Cargo.toml: crossbeam-channel = "0.5"
//
// use crossbeam_channel::{bounded, unbounded, select};
// 
// // 有界和无界通道
// let (s, r) = bounded(10);     // 缓冲区大小 10
// let (s, r) = unbounded();     // 无限缓冲
//
// // select! 宏: 同时等待多个通道
// select! {
//     recv(r1) -> msg => println!("r1: {msg:?}"),
//     recv(r2) -> msg => println!("r2: {msg:?}"),
//     default(Duration::from_secs(1)) => println!("timeout"),
// }`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔒 共享状态并发</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> shared_state.rs</div>
                <pre className="fs-code">{`use std::sync::{Arc, Mutex, RwLock};
use std::thread;

// ═══ Mutex<T> — 互斥锁 ═══
fn mutex_demo() {
    let m = Mutex::new(5);
    
    {
        let mut num = m.lock().unwrap();
        // lock() 返回 MutexGuard<T>
        // → 实现了 Deref 和 DerefMut
        // → 离开作用域自动 unlock (RAII!)
        *num = 6;
    }  // MutexGuard drop, 自动解锁
    
    println!("{:?}", m);  // Mutex { data: 6 }
}

// ═══ Arc<Mutex<T>> — 多线程共享可变状态 ═══
fn arc_mutex_counter() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
            // MutexGuard 在这里 drop, 自动解锁
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Result: {}", *counter.lock().unwrap()); // 10
    
    // 为什么不用 Rc? 
    // → Rc 不是线程安全的 (非原子引用计数)
    // → 编译器会阻止你: Rc doesn't implement Send!
}

// ═══ RwLock<T> — 读写锁 ═══
fn rwlock_demo() {
    let lock = Arc::new(RwLock::new(vec![1, 2, 3]));
    
    // 多个读者可以同时获取
    let lock1 = Arc::clone(&lock);
    let r1 = thread::spawn(move || {
        let data = lock1.read().unwrap();  // 读锁
        println!("Reader 1: {data:?}");
    });
    
    let lock2 = Arc::clone(&lock);
    let r2 = thread::spawn(move || {
        let data = lock2.read().unwrap();  // 可以同时读
        println!("Reader 2: {data:?}");
    });
    
    // 写者独占
    let lock3 = Arc::clone(&lock);
    let w = thread::spawn(move || {
        let mut data = lock3.write().unwrap();  // 写锁
        data.push(4);
    });
    
    r1.join().unwrap();
    r2.join().unwrap();
    w.join().unwrap();
}

// ═══ 原子类型 — 无锁并发 ═══
use std::sync::atomic::{AtomicUsize, Ordering};

fn atomic_demo() {
    let counter = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];
    
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 {
                counter.fetch_add(1, Ordering::Relaxed);
            }
        }));
    }
    
    for h in handles { h.join().unwrap(); }
    println!("{}", counter.load(Ordering::Relaxed)); // 10000
    
    // Ordering:
    // Relaxed  — 只保证原子性, 不保证顺序 (最快)
    // Acquire  — 读操作: 后续读不会重排到前面
    // Release  — 写操作: 前面的写不会重排到后面
    // AcqRel   — Acquire + Release
    // SeqCst   — 全序一致 (最慢, 最安全)
}

// ═══ 死锁预防 ═══
// Rust 防止数据竞争, 但不防止死锁!
// 最佳实践:
// 1. 锁住尽量少的代码
// 2. 固定锁的获取顺序
// 3. 使用 try_lock() 避免永久等待
// 4. parking_lot crate: 更高效的锁实现`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📡 Send 与 Sync Trait</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> send_sync.rs</div>
                <pre className="fs-code">{`// ═══ Rust 并发安全的基石: Send 和 Sync ═══
// 这两个 marker trait 让编译器自动检查线程安全

// ── Send ──
// 类型可以安全地在线程间 *转移所有权*
// → 几乎所有类型都是 Send
// → 例外: Rc<T> (非原子引用计数)
//         裸指针 *const T, *mut T
// 
// 如果 T: Send, 可以 move 到另一个线程:
// thread::spawn(move || { use_value(t); })

// ── Sync ──
// 类型可以安全地在线程间 *共享引用*
// → T: Sync 意味着 &T: Send
// → 例外: Cell<T>, RefCell<T> (非原子内部可变性)
//         Rc<T>
//
// 如果 T: Sync, 多个线程可以同时持有 &T

// ═══ 关系 ═══
// Send + Sync:   大多数类型 (i32, String, Vec, Arc, Mutex)
// Send + !Sync:  Cell<T>, RefCell<T> — 可以 move 但不能共享
// !Send + !Sync: Rc<T> — 既不能 move 也不能共享
// !Send + Sync:  几乎不存在 (人为构造)

// ═══ 编译器自动推导 ═══
// 如果一个结构体的所有字段都是 Send, 则该结构体自动 Send
// 如果一个结构体的所有字段都是 Sync, 则该结构体自动 Sync
struct MyStruct {
    data: Vec<i32>,    // Vec<i32>: Send + Sync ✓
    name: String,      // String: Send + Sync ✓
}
// → MyStruct 自动是 Send + Sync

struct NotSend {
    data: std::rc::Rc<i32>,  // Rc: !Send ✗
}
// → NotSend 自动是 !Send
// → 编译器不让你把它传到其他线程!

// ═══ 手动实现 (unsafe!) ═══
// struct MyRawPtr(*mut i32);
// unsafe impl Send for MyRawPtr {}
// unsafe impl Sync for MyRawPtr {}
// → 你在向编译器保证这个类型是线程安全的
// → 如果错了, 会导致 UB (未定义行为)!

// ═══ 实际例子: 为什么 Rc 不是 Send ═══
// use std::rc::Rc;
// use std::thread;
//
// let data = Rc::new(42);
// let data_clone = Rc::clone(&data);
//
// thread::spawn(move || {
//     println!("{}", data_clone);
// });
// 
// 编译错误:
// error[E0277]: \`Rc<i32>\` cannot be sent between threads safely
//   --> src/main.rs:7:5
//   |
//   = help: the trait \`Send\` is not implemented for \`Rc<i32>\`
//
// → 编译器直接阻止! 改用 Arc 就行了

// ═══ Scoped Threads (Rust 1.63+) ═══
fn scoped_threads() {
    let mut data = vec![1, 2, 3];
    
    std::thread::scope(|s| {
        // 作用域线程: 可以安全地借用 data!
        s.spawn(|| {
            println!("{data:?}");  // 不可变借用 ✅
        });
        s.spawn(|| {
            println!("{:?}", data.len()); // 不可变借用 ✅
        });
    });
    // 所有线程在 scope 结束时自动 join
    // → 编译器能证明 data 在线程结束后还活着
    
    data.push(4);  // ✅ 所有线程已结束, 可以修改
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Rayon 数据并行</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> rayon_parallel.rs</div>
                <pre className="fs-code">{`// ═══ Rayon: 数据并行库 ═══
// Cargo.toml: rayon = "1.8"
// 一行代码将串行迭代变为并行!

use rayon::prelude::*;

fn rayon_basics() {
    let data: Vec<i32> = (1..1_000_000).collect();
    
    // 串行:
    let sum: i32 = data.iter().sum();
    
    // 并行: 把 .iter() 换成 .par_iter() 就行!
    let sum: i32 = data.par_iter().sum();
    
    // 并行 map + filter + collect
    let result: Vec<i32> = data.par_iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * x)
        .collect();
    
    // 并行排序
    let mut v = vec![5, 3, 1, 4, 2];
    v.par_sort();           // 并行排序
    v.par_sort_unstable();  // 并行不稳定排序 (更快)
}

// ═══ Rayon 工作原理: Work-Stealing ═══
//
// 线程池 (默认 = CPU 核数):
// ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
// │Thread 0 │ │Thread 1 │ │Thread 2 │ │Thread 3 │
// │[task][t]│ │[task]   │ │  空     │ │[task]   │
// └─────────┘ └─────────┘ └─────────┘ └─────────┘
//                            │ 偷 ↗
//                            └──────── 从忙碌线程偷任务
//
// → 每个线程有自己的 deque
// → 空闲线程从其他线程的 deque 末尾偷任务
// → 自动负载均衡, 非常高效

// ═══ join: 并行执行两个任务 ═══
fn parallel_merge_sort(v: &mut [i32]) {
    if v.len() <= 1024 { 
        v.sort(); 
        return; 
    }
    let mid = v.len() / 2;
    let (left, right) = v.split_at_mut(mid);
    
    rayon::join(
        || parallel_merge_sort(left),
        || parallel_merge_sort(right),
    );
    // merge(left, right); // 合并两个有序数组
}

// ═══ scope: 更灵活的并行 ═══
fn rayon_scope() {
    let mut results = vec![0; 4];
    
    rayon::scope(|s| {
        for (i, result) in results.iter_mut().enumerate() {
            s.spawn(move |_| {
                *result = expensive_computation(i);
            });
        }
    });
    // 所有任务完成后才继续
    println!("{results:?}");
}

fn expensive_computation(n: usize) -> i32 {
    std::thread::sleep(std::time::Duration::from_millis(100));
    (n * n) as i32
}

// ═══ 性能对比 ═══
// 10M 个元素求和:
// 
// 方式                  │ 耗时
// ─────────────────────┼──────
// for 循环              │ ~8ms
// .iter().sum()         │ ~8ms (编译器优化)
// .par_iter().sum()     │ ~2ms (4核CPU)
// 手写 thread + channel │ ~3ms (线程创建开销)
//
// Rayon 优势:
// 1. API 几乎和 Iterator 一样
// 2. 自动利用所有 CPU 核心
// 3. Work-stealing 自动负载均衡
// 4. 零线程创建开销 (线程池复用)
// 5. 编译器保证安全 (Send + Sync)
//
// ⚠️ 陷阱:
// → 不是所有操作都适合并行: 数据量太小, 开销 > 收益
// → I/O 密集型不适合 Rayon (用 async 代替)
// → 注意缓存局部性: 过细的并行反而变慢`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
