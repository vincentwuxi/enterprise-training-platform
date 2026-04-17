import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['async/await 原理', 'Tokio 运行时', '异步模式', '性能与陷阱'];

export default function LessonRustAsync() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🦀 module_05 — 异步编程</div>
      <div className="fs-hero">
        <h1>异步编程：async/await / Tokio / 异步 I/O</h1>
        <p>
          Rust 的 async/await 是<strong>零成本抽象</strong>——编译器将异步函数转换为状态机，
          没有 GC、没有运行时分配开销。配合 Tokio 运行时，可以在单线程上处理数万个并发连接。
          本模块从 Future trait 的底层原理出发，掌握 Tokio 的任务调度、异步 I/O、
          Stream 处理以及常见的性能陷阱。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦀 异步编程深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ async/await 底层原理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f74c00'}}></span> async_internals.rs</div>
                <pre className="fs-code">{`// ═══ Future Trait — 异步操作的核心抽象 ═══
//
// trait Future {
//     type Output;
//     fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) 
//         -> Poll<Self::Output>;
// }
//
// enum Poll<T> {
//     Ready(T),     // 完成: 返回值
//     Pending,      // 未完成: 注册 waker, 等待唤醒
// }

// ═══ async fn → 状态机 ═══
// 编译器自动将 async fn 转换为实现 Future 的状态机

async fn fetch_data() -> String {
    let response = make_request().await;   // 暂停点 1
    let parsed = parse(response).await;     // 暂停点 2
    parsed
}

// 编译器生成 (概念上):
// enum FetchDataFuture {
//     State0 { /* 初始状态 */ },
//     State1 { response: Response, /* 等待 parse */ },
//     State2 { parsed: String, /* 完成 */ },
// }
//
// impl Future for FetchDataFuture {
//     fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<String> {
//         match self.state {
//             State0 => {
//                 let req = make_request();
//                 match req.poll(cx) {
//                     Ready(response) => { self.state = State1 { response }; }
//                     Pending => return Pending,
//                 }
//             }
//             State1 { response } => {
//                 let parse = parse(response);
//                 match parse.poll(cx) {
//                     Ready(parsed) => return Ready(parsed),
//                     Pending => return Pending,
//                 }
//             }
//         }
//     }
// }

// ═══ 关键概念 ═══
// 1. Future 是惰性的: 创建不执行, 必须 .await 或被 executor 轮询
// 2. .await 只是当前 Future 让出执行权, 不阻塞线程!
// 3. 编译器在每个 .await 点将函数切分为状态
// 4. 零成本: 不需要堆分配! 状态机大小 = 跨 await 存活的变量之和

// ═══ Pin — 防止 self-referential Future 被移动 ═══
// async fn 生成的状态机可能包含自引用:
//
// async fn demo() {
//     let data = String::from("hello");
//     let reference = &data;  // 引用 data
//     some_async_op().await;  // 暂停点!
//     println!("{reference}"); // await 之后仍然使用引用
// }
//
// 状态机中 reference 指向同一个状态机里的 data
// → 如果状态机被 move, reference 变成悬挂指针!
// → Pin 保证 Future 不会被移动到不同的内存地址

// ═══ Waker 机制 ═══
// poll 返回 Pending 时, 需要注册一个 Waker
// → 当数据就绪时, Waker 通知 executor 重新 poll 这个 Future
// → 避免忙轮询 (busy polling)
//
// 调度流程:
// 1. Executor poll Future → Pending
// 2. Future 内部将 Waker 注册到 I/O 事件源 (如 epoll)
// 3. 数据就绪 → Waker 被触发
// 4. Executor 将 Future 放回就绪队列
// 5. 下次 poll → Ready(value)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 Tokio 运行时</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> tokio_runtime.rs</div>
                <pre className="fs-code">{`// ═══ Tokio — Rust 异步运行时标准 ═══
// Cargo.toml:
// tokio = { version = "1", features = ["full"] }

#[tokio::main]  // 创建多线程运行时
async fn main() {
    println!("Hello from Tokio!");
    
    // 启动异步任务
    let handle = tokio::spawn(async {
        // 异步计算...
        42
    });
    
    let result = handle.await.unwrap();
    println!("Result: {result}");
}

// ═══ Tokio 架构 ═══
//
// ┌────────────────────────────────────────┐
// │           Application Layer            │
// │  async fn  /  stream  /  channel       │
// ├────────────────────────────────────────┤
// │           Tokio Runtime                │
// │                                        │
// │  ┌──────────┐  ┌──────────┐           │
// │  │ Executor │  │  Timer   │           │
// │  │(调度器)  │  │(定时器)  │           │
// │  └──────────┘  └──────────┘           │
// │  ┌──────────┐  ┌──────────┐           │
// │  │  I/O     │  │Task Queue│           │
// │  │  Driver  │  │(任务队列)│           │
// │  └──────────┘  └──────────┘           │
// ├────────────────────────────────────────┤
// │        OS (epoll/kqueue/IOCP)          │
// └────────────────────────────────────────┘

// ═══ 运行时配置 ═══
// 多线程 (默认): CPU核数个工作线程
#[tokio::main]
async fn main_multi() { }

// 单线程 (适合测试/嵌入):
#[tokio::main(flavor = "current_thread")]
async fn main_single() { }

// 手动构建:
fn custom_runtime() {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(4)        // 工作线程数
        .enable_io()              // 启用异步 I/O
        .enable_time()            // 启用定时器
        .build()
        .unwrap();
    
    rt.block_on(async {
        // 在运行时中执行异步代码
    });
}

// ═══ TCP Server 示例 ═══
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

async fn tcp_server() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    
    loop {
        let (mut socket, addr) = listener.accept().await?;
        println!("New client: {addr}");
        
        // 每个连接一个任务 (不是线程!)
        tokio::spawn(async move {
            let mut buf = [0u8; 1024];
            loop {
                let n = socket.read(&mut buf).await.unwrap();
                if n == 0 { return; }  // 连接关闭
                socket.write_all(&buf[..n]).await.unwrap();
            }
        });
    }
    // 单线程可处理数万并发连接!
    // → 每个 task 只占 ~几百字节的状态机
    // → vs OS 线程的 ~8MB 栈空间
}

// ═══ 常用 Tokio 原语 ═══
async fn tokio_primitives() {
    // 超时
    use tokio::time::{timeout, Duration};
    let result = timeout(Duration::from_secs(5), async_op()).await;
    // Ok(value) 或 Err(Elapsed)
    
    // 定时器
    tokio::time::sleep(Duration::from_secs(1)).await;
    
    // Interval (定期执行)
    let mut interval = tokio::time::interval(Duration::from_secs(1));
    interval.tick().await;  // 立即
    interval.tick().await;  // 1s 后
    
    // select! — 竞争多个 Future
    tokio::select! {
        val = future_a() => println!("A finished: {val}"),
        val = future_b() => println!("B finished: {val}"),
    }
    // → 第一个完成的胜出, 其他被取消!
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 异步模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> async_patterns.rs</div>
                <pre className="fs-code">{`// ═══ 并发执行多个 Future ═══

// join! — 等待所有完成
async fn join_demo() {
    let (a, b, c) = tokio::join!(
        fetch_url("https://api.example.com/1"),
        fetch_url("https://api.example.com/2"),
        fetch_url("https://api.example.com/3"),
    );
    // 三个请求并发执行, 全部完成后返回
    // 注意: join 不是并行! 是在同一线程上交替推进
}

// try_join! — 任一失败立即返回
async fn try_join_demo() -> Result<(), Box<dyn std::error::Error>> {
    let (a, b) = tokio::try_join!(
        fetch_with_error("url1"),
        fetch_with_error("url2"),
    )?; // 任一 Err 就立即返回
    Ok(())
}

// ═══ Stream — 异步迭代器 ═══
// Cargo.toml: tokio-stream = "0.1"
use tokio_stream::StreamExt;

async fn stream_demo() {
    // 从 channel 创建 stream
    let (tx, rx) = tokio::sync::mpsc::channel(32);
    let mut stream = tokio_stream::wrappers::ReceiverStream::new(rx);
    
    tokio::spawn(async move {
        for i in 0..10 {
            tx.send(i).await.unwrap();
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    });
    
    // 消费 stream
    while let Some(value) = stream.next().await {
        println!("Received: {value}");
    }
}

// ═══ Tokio Channel 类型 ═══
//
// mpsc (多生产者单消费者):
// let (tx, mut rx) = tokio::sync::mpsc::channel(32);
// → 最常用, 带背压 (bounded channel)
//
// oneshot (一次性):
// let (tx, rx) = tokio::sync::oneshot::channel();
// → 只发送一个值, 适合 request-response
//
// broadcast (广播):
// let (tx, _rx) = tokio::sync::broadcast::channel(16);
// → 所有订阅者都收到消息
//
// watch (最新值):
// let (tx, rx) = tokio::sync::watch::channel(0);
// → 只保留最新值, 适合配置更新

// ═══ Semaphore — 限制并发 ═══
use tokio::sync::Semaphore;
use std::sync::Arc;

async fn rate_limited() {
    let semaphore = Arc::new(Semaphore::new(10)); // 最多10个并发
    let mut handles = vec![];
    
    for url in urls {
        let permit = semaphore.clone().acquire_owned().await.unwrap();
        handles.push(tokio::spawn(async move {
            let result = fetch_url(url).await;
            drop(permit); // 释放许可
            result
        }));
    }
    
    for h in handles {
        h.await.unwrap();
    }
}

// ═══ Graceful Shutdown ═══
async fn shutdown_example() {
    let (shutdown_tx, mut shutdown_rx) = tokio::sync::broadcast::channel(1);
    
    let server = tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = accept_connection() => { /* 处理连接 */ }
                _ = shutdown_rx.recv() => {
                    println!("Shutting down...");
                    break;
                }
            }
        }
    });
    
    // 收到 SIGTERM 时:
    tokio::signal::ctrl_c().await.unwrap();
    let _ = shutdown_tx.send(());
    server.await.unwrap();
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚠️ 性能与常见陷阱</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> async_pitfalls.rs</div>
                <pre className="fs-code">{`// ═══ 陷阱 1: 在 async 中阻塞线程 ═══
async fn bad_blocking() {
    // ❌ std::thread::sleep 会阻塞整个 Tokio 工作线程!
    std::thread::sleep(Duration::from_secs(5));
    
    // ✅ 使用 tokio::time::sleep
    tokio::time::sleep(Duration::from_secs(5)).await;
    
    // ✅ CPU 密集型任务用 spawn_blocking
    let result = tokio::task::spawn_blocking(|| {
        // 在独立线程池中运行阻塞代码
        expensive_computation()
    }).await.unwrap();
}

// ═══ 陷阱 2: 大型 Future ═══
async fn large_future() {
    let big_array = [0u8; 1_000_000]; // 1MB 在 Future 状态机中!
    some_async_op().await;
    use_data(&big_array);
}
// 修复: 使用 Box::pin 或移到堆上
async fn fixed_large_future() {
    let big_array = Box::new([0u8; 1_000_000]); // 堆上
    some_async_op().await;
    use_data(&big_array);
}

// ═══ 陷阱 3: 持有 MutexGuard 跨 await ═══
async fn bad_mutex() {
    let mutex = std::sync::Mutex::new(vec![1, 2, 3]);
    let mut guard = mutex.lock().unwrap();
    guard.push(4);
    some_async_op().await;  // ❌ MutexGuard 跨 await!
    // → 如果任务被调度到不同线程, std::sync::Mutex 未解锁
}

async fn fixed_mutex() {
    // 方案 1: 缩小锁范围
    let mutex = std::sync::Mutex::new(vec![1, 2, 3]);
    {
        let mut guard = mutex.lock().unwrap();
        guard.push(4);
    }  // guard 在 await 之前释放
    some_async_op().await;
    
    // 方案 2: 使用 tokio::sync::Mutex (异步感知)
    let mutex = tokio::sync::Mutex::new(vec![1, 2, 3]);
    let mut guard = mutex.lock().await;  // 异步锁
    guard.push(4);
    some_async_op().await;  // ✅ OK
}

// ═══ 陷阱 4: 忘记 .await ═══
async fn forgot_await() {
    let future = fetch_data();  // 只创建了 Future!
    // 没有 .await → 永远不会执行!
    
    let _ = fetch_data().await; // ✅ 正确
}

// ═══ 性能对比 ═══
// 
// 模型         │ 10K 连接   │ 内存      │ CPU 切换
// ────────────┼───────────┼──────────┼──────────
// 线程/连接    │ 10K 线程   │ ~80 GB   │ 内核上下文
// 线程池       │ N 线程     │ ~8 MB    │ 内核上下文
// async/await │ 10K 任务   │ ~几 MB   │ 用户态切换
//
// async 任务的栈: 状态机大小 (通常 < 1KB)
// OS 线程的栈:    默认 8MB (Linux)
//
// ═══ 何时用 async vs 线程 ═══
// async:
//   → I/O 密集型 (网络、文件、数据库)
//   → 需要高并发 (>1000 连接)
//   → 需要精细控制取消和超时
//
// 线程:
//   → CPU 密集型 (计算、加密、压缩)
//   → 需要简单的代码 (async 增加复杂性)
//   → 阻塞 API (同步数据库驱动)
//   → 并发数较低 (<100)
//
// 混合: Tokio + spawn_blocking 处理两种场景`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
