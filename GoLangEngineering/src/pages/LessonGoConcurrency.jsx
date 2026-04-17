import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Goroutine 原理', 'Channel 通信', 'Select 与超时', '并发模式'];

export default function LessonGoConcurrency() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐹 module_03 — 并发编程</div>
      <div className="fs-hero">
        <h1>并发编程：Goroutine / Channel / Select / WaitGroup</h1>
        <p>
          Go 的并发是语言级别的核心特性——<strong>"不要通过共享内存通信，通过通信来共享内存"</strong>。
          Goroutine 的创建成本仅 ~2KB 栈空间，调度由 Go 运行时的 GMP 模型管理。
          Channel 提供类型安全的通信原语，Select 实现多路复用。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐹 并发编程深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Goroutine 与 GMP 调度</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00add8'}}></span> goroutine.go</div>
                <pre className="fs-code">{`package main

import (
    "fmt"
    "sync"
    "time"
)

// ═══ Goroutine — 轻量级协程 ═══
func goroutineDemo() {
    // 用 go 关键字启动
    go func() {
        fmt.Println("Hello from goroutine!")
    }()
    
    // 带参数
    go process("task1")
    go process("task2")
    
    time.Sleep(time.Second) // 等待 goroutine 完成 (不推荐!)
}

// ═══ WaitGroup — 等待多个 goroutine ═══
func waitGroupDemo() {
    var wg sync.WaitGroup
    
    urls := []string{"url1", "url2", "url3"}
    
    for _, url := range urls {
        wg.Add(1)  // 计数器 +1
        go func(u string) {
            defer wg.Done()  // 计数器 -1
            fetch(u)
        }(url)  // ⚠️ 必须传参! 不要闭包捕获 range 变量
    }
    
    wg.Wait()  // 阻塞直到计数器归零
}

// Go 1.22+ loop variable fix:
// for _, url := range urls {
//     wg.Add(1)
//     go func() {  // 不需要传参了!
//         defer wg.Done()
//         fetch(url)  // 每次迭代 url 是新变量
//     }()
// }

// ═══ GMP 调度模型 ═══
//
// G (Goroutine):  用户态协程, 初始栈 2-8KB (可动态增长到 1GB)
// M (Machine):    OS 线程 (默认最多 10000 个)
// P (Processor):  逻辑处理器 (默认 = CPU 核数, GOMAXPROCS)
//
// ┌──────────────────────────────────────────────┐
// │                  Go Runtime                   │
// │                                               │
// │  P0:                    P1:                   │
// │  ┌─────────┐           ┌─────────┐           │
// │  │ Local Q  │           │ Local Q  │           │
// │  │[G3][G4] │           │[G7][G8] │           │
// │  └────┬────┘           └────┬────┘           │
// │       │                     │                 │
// │  ┌────▼────┐           ┌────▼────┐           │
// │  │M0 (OS线程)│          │M1 (OS线程)│          │
// │  │ 运行 G1  │           │ 运行 G5  │           │
// │  └─────────┘           └─────────┘           │
// │                                               │
// │  Global Queue: [G9][G10][G11]                 │
// └──────────────────────────────────────────────┘
//
// 调度策略:
// 1. 每个 P 有本地运行队列 (Local Queue, 最多 256)
// 2. 超出的放到全局队列 (Global Queue)
// 3. M 从绑定的 P 的本地队列取 G 执行
// 4. 本地队列空了 → 从全局队列偷一批
// 5. 全局也空了 → Work Stealing! 从其他 P 偷一半
//
// 抢占式调度:
// Go 1.14+: 异步抢占 (通过信号 SIGURG)
// → 长时间运行的 goroutine 也能被抢占
// → 之前只在函数调用时检查 (协作式)

// ═══ goroutine 栈增长 ═══
// 初始 2-8KB → 按需增长 → 最大 1GB
// 增长策略: 复制式栈 (Copyable Stack)
// → 检测到栈不够 → 分配新的更大的栈
// → 复制旧栈内容到新栈
// → 更新所有指向旧栈的指针
// → 释放旧栈

// vs OS 线程: 固定 8MB 栈, 不能增长!
// → 10000 个 goroutine: ~20MB
// → 10000 个 OS 线程: ~80GB`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📡 Channel 通信</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00758d'}}></span> channel.go</div>
                <pre className="fs-code">{`package main

// ═══ Channel — 类型安全的通信管道 ═══

func channelBasics() {
    // 无缓冲 (Unbuffered): 同步通信
    ch := make(chan int)
    
    go func() {
        ch <- 42  // 发送: 阻塞直到有接收者
    }()
    
    val := <-ch   // 接收: 阻塞直到有发送者
    fmt.Println(val) // 42
    
    // 有缓冲 (Buffered): 异步通信
    bch := make(chan string, 3)  // 容量 3
    bch <- "a"  // 不阻塞 (缓冲区未满)
    bch <- "b"  // 不阻塞
    bch <- "c"  // 不阻塞
    // bch <- "d" // 阻塞! 缓冲区满了
    
    fmt.Println(<-bch)  // "a" (FIFO)
}

// ═══ 方向约束 ═══
func producer(out chan<- int) {
    // chan<- : 只能发送
    for i := 0; i < 10; i++ {
        out <- i
    }
    close(out)  // 关闭 channel
}

func consumer(in <-chan int) {
    // <-chan : 只能接收
    for val := range in {  // range 自动检测 close
        fmt.Println(val)
    }
}

func pipeline() {
    ch := make(chan int)
    go producer(ch)
    consumer(ch)
}

// ═══ Channel 操作规则 ═══
// 
// 操作      │ nil channel │ closed channel │ 正常 channel
// ─────────┼─────────────┼───────────────┼─────────────
// 发送 ch<- │ 永久阻塞    │ panic!        │ 正常/阻塞
// 接收 <-ch │ 永久阻塞    │ 零值, false   │ 正常/阻塞
// 关闭 close│ panic!      │ panic!        │ 正常
//
// 关键点:
// 1. 只有发送方关闭 channel, 永远不要由接收方关闭!
// 2. 关闭已关闭的 channel 会 panic
// 3. 向已关闭的 channel 发送会 panic
// 4. 从已关闭的 channel 接收, 会立即返回零值

// ═══ 常见 Channel 模式 ═══

// Fan-out: 一个生产者, 多个消费者
func fanOut() {
    jobs := make(chan int, 100)
    
    // 启动 3 个 worker
    var wg sync.WaitGroup
    for w := 0; w < 3; w++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for job := range jobs {
                fmt.Printf("Worker %d: job %d\\n", id, job)
            }
        }(w)
    }
    
    // 发送任务
    for i := 0; i < 10; i++ {
        jobs <- i
    }
    close(jobs)
    wg.Wait()
}

// Fan-in: 多个生产者, 合并到一个 channel
func fanIn(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for val := range c {
                out <- val
            }
        }(ch)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 Select 与超时</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> select_timeout.go</div>
                <pre className="fs-code">{`package main

import (
    "context"
    "time"
)

// ═══ select — Channel 多路复用 ═══
func selectDemo() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    
    go func() {
        time.Sleep(100 * time.Millisecond)
        ch1 <- "from ch1"
    }()
    
    go func() {
        time.Sleep(200 * time.Millisecond)
        ch2 <- "from ch2"
    }()
    
    // 等待第一个就绪
    select {
    case msg := <-ch1:
        fmt.Println(msg)
    case msg := <-ch2:
        fmt.Println(msg)
    }
    // → 如果多个同时就绪, 随机选一个!
}

// ═══ 超时控制 ═══
func withTimeout() {
    ch := make(chan string)
    
    go func() {
        time.Sleep(2 * time.Second)
        ch <- "result"
    }()
    
    select {
    case result := <-ch:
        fmt.Println("Got:", result)
    case <-time.After(1 * time.Second):
        fmt.Println("Timeout!")
    }
}

// ═══ 非阻塞操作 ═══
func nonBlocking(ch chan int) {
    select {
    case val := <-ch:
        fmt.Println("Received:", val)
    default:
        fmt.Println("No data available")
    }
}

// ═══ context — 超时、取消、值传递 ═══
func contextDemo() {
    // 超时 Context
    ctx, cancel := context.WithTimeout(
        context.Background(),
        5 * time.Second,
    )
    defer cancel()  // 必须调用! 防止泄漏
    
    result := make(chan string, 1)
    go func() {
        result <- slowOperation()
    }()
    
    select {
    case res := <-result:
        fmt.Println("Result:", res)
    case <-ctx.Done():
        fmt.Println("Cancelled:", ctx.Err())
    }
}

// ═══ Context 传播 ═══
func handleRequest(ctx context.Context, userID int) error {
    // 创建子 Context
    ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    defer cancel()
    
    // 传递给下游
    user, err := fetchUser(ctx, userID)
    if err != nil {
        return err
    }
    
    orders, err := fetchOrders(ctx, user.ID)
    if err != nil {
        return err
    }
    
    return nil
}

func fetchUser(ctx context.Context, id int) (*User, error) {
    // 在 select 中检查 ctx
    select {
    case <-ctx.Done():
        return nil, ctx.Err()  // context.DeadlineExceeded
    case user := <-doQuery(id):
        return user, nil
    }
}

// ═══ Context 最佳实践 ═══
// 1. context.Background() 只在 main/init/test 中使用
// 2. 不要存储在 struct 中, 作为第一个参数传递
// 3. 不要传 nil context, 用 context.TODO()
// 4. context.WithValue 只用于请求作用域的数据
//    (如 trace ID, auth token), 不要传业务参数
// 5. 一定要调用 cancel! (defer cancel())`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 并发模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> patterns.go</div>
                <pre className="fs-code">{`package main

import (
    "sync"
    "golang.org/x/sync/errgroup"
)

// ═══ Worker Pool (工作池) ═══
func workerPool(numWorkers int, jobs <-chan Job) <-chan Result {
    results := make(chan Result, len(jobs))
    
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(workerID int) {
            defer wg.Done()
            for job := range jobs {
                results <- process(job)
            }
        }(i)
    }
    
    go func() {
        wg.Wait()
        close(results)
    }()
    
    return results
}

// ═══ errgroup — 优雅的并发错误处理 ═══
func errgroupDemo(ctx context.Context) error {
    g, ctx := errgroup.WithContext(ctx)
    
    var user *User
    var orders []Order
    
    g.Go(func() error {
        var err error
        user, err = fetchUser(ctx, 1)
        return err
    })
    
    g.Go(func() error {
        var err error
        orders, err = fetchOrders(ctx, 1)
        return err
    })
    
    if err := g.Wait(); err != nil {
        return err  // 返回第一个错误
    }
    
    // 此时 user 和 orders 都已就绪
    return nil
}

// ═══ 限速器 (Rate Limiter) ═══
func rateLimiter() {
    // 令牌桶: 每秒 10 个请求
    limiter := time.NewTicker(100 * time.Millisecond)
    defer limiter.Stop()
    
    for req := range requests {
        <-limiter.C  // 等待令牌
        go handleRequest(req)
    }
}

// ═══ sync.Once — 只执行一次 ═══
var (
    instance *Database
    once     sync.Once
)

func GetDB() *Database {
    once.Do(func() {
        instance = connectDatabase()
    })
    return instance
}

// ═══ sync.Map — 并发安全的 Map ═══
func syncMapDemo() {
    var m sync.Map
    
    m.Store("key1", "value1")
    val, ok := m.Load("key1")
    m.Delete("key1")
    m.Range(func(key, value any) bool {
        fmt.Println(key, value)
        return true  // false 停止遍历
    })
    
    // 适用场景: key 集合稳定, 读多写少
    // 不适用: 频繁写入 → 用 sync.RWMutex + map
}

// ═══ sync.Pool — 对象池 ═══
var bufPool = sync.Pool{
    New: func() any {
        return make([]byte, 0, 1024)
    },
}

func processRequest() {
    buf := bufPool.Get().([]byte)
    buf = buf[:0]  // reset
    
    // 使用 buf...
    
    bufPool.Put(buf)  // 归还到池中
    // → 减少 GC 压力, 避免频繁分配
}

// ═══ 数据竞争检测 ═══
// go run -race main.go    ← 启用 Race Detector!
// go test -race ./...
//
// 检测到竞争会打印:
// WARNING: DATA RACE
// Goroutine 7 at ... (读取)
// Goroutine 6 at ... (写入)
//
// CI 中必须开启! 发现竞争立即修复`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
