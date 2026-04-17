import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['net/http', 'encoding/json', 'io 与 bufio', 'context 与 sync'];

export default function LessonGoStdlib() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐹 module_04 — 标准库精讲</div>
      <div className="fs-hero">
        <h1>标准库精讲：net/http / encoding/json / io / context</h1>
        <p>
          Go 标准库是<strong>"电池包含 (Batteries Included)"</strong> 的典范，
          生产级的 HTTP 服务器、JSON 编解码、I/O 抽象、并发原语全部内置。
          掌握标准库是写出 Go idiomatic 代码的关键——很多时候你不需要第三方框架。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐹 标准库深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 net/http</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00add8'}}></span> http_server.go</div>
                <pre className="fs-code">{`package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
)

// ═══ 最简 HTTP 服务器 ═══
func simpleServer() {
    // Go 1.22+: 新路由模式
    mux := http.NewServeMux()
    
    // 精确匹配 + 方法
    mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("OK"))
    })
    
    // 路径参数 (Go 1.22+)
    mux.HandleFunc("GET /users/{id}", getUser)
    mux.HandleFunc("POST /users", createUser)
    mux.HandleFunc("PUT /users/{id}", updateUser)
    mux.HandleFunc("DELETE /users/{id}", deleteUser)
    
    // 配置服务器
    server := &http.Server{
        Addr:         ":8080",
        Handler:      mux,
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  120 * time.Second,
    }
    
    log.Printf("Server starting on :8080")
    log.Fatal(server.ListenAndServe())
}

func getUser(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")  // Go 1.22+ 路径参数
    
    user := User{ID: id, Name: "Alice"}
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// ═══ 中间件模式 ═══
type Middleware func(http.Handler) http.Handler

func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func cors(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        next.ServeHTTP(w, r)
    })
}

// 链式调用:
// handler := logging(cors(mux))

// ═══ HTTP 客户端 ═══
func httpClient() {
    client := &http.Client{
        Timeout: 10 * time.Second,
        Transport: &http.Transport{
            MaxIdleConns:        100,
            MaxIdleConnsPerHost: 10,
            IdleConnTimeout:     90 * time.Second,
        },
    }
    // ⚠️ 复用 client! 不要每次请求都创建
    // http.DefaultClient 没有超时设置, 生产环境不要用!
    
    resp, err := client.Get("https://api.example.com/data")
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()  // 必须关闭! 否则连接泄漏
    
    var data Response
    json.NewDecoder(resp.Body).Decode(&data)
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 encoding/json</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> json.go</div>
                <pre className="fs-code">{`package main

import (
    "encoding/json"
    "fmt"
    "time"
)

// ═══ 结构体标签控制 JSON 序列化 ═══
type Article struct {
    ID        int       \`json:"id"\`
    Title     string    \`json:"title"\`
    Content   string    \`json:"content,omitempty"\`  // 零值时省略
    Tags      []string  \`json:"tags"\`
    CreatedAt time.Time \`json:"created_at"\`
    Secret    string    \`json:"-"\`  // 永远忽略
}

func jsonDemo() {
    // 编码 (Marshal)
    article := Article{
        ID: 1, Title: "Go JSON", Tags: []string{"go", "json"},
    }
    
    data, _ := json.Marshal(article)
    fmt.Println(string(data))
    
    // 美化输出
    pretty, _ := json.MarshalIndent(article, "", "  ")
    fmt.Println(string(pretty))
    
    // 解码 (Unmarshal)
    var decoded Article
    json.Unmarshal(data, &decoded)
}

// ═══ 自定义序列化 ═══
type UnixTime struct {
    time.Time
}

func (t UnixTime) MarshalJSON() ([]byte, error) {
    return json.Marshal(t.Unix())
}

func (t *UnixTime) UnmarshalJSON(data []byte) error {
    var unix int64
    if err := json.Unmarshal(data, &unix); err != nil {
        return err
    }
    t.Time = time.Unix(unix, 0)
    return nil
}

// ═══ 流式 JSON (大文件) ═══
func streamJSON(w io.Writer, items []Item) error {
    enc := json.NewEncoder(w)
    enc.SetIndent("", "  ")
    
    for _, item := range items {
        if err := enc.Encode(item); err != nil {
            return err
        }
    }
    return nil
}

func parseStream(r io.Reader) error {
    dec := json.NewDecoder(r)
    for dec.More() {
        var item Item
        if err := dec.Decode(&item); err != nil {
            return err
        }
        process(item)
    }
    return nil
}

// ═══ 动态 JSON (map / interface{}) ═══
func dynamicJSON() {
    data := []byte(\`{"name":"Go","version":1.22,"features":["generics","range"]}\`)
    
    var result map[string]any
    json.Unmarshal(data, &result)
    
    name := result["name"].(string)       // 需要类型断言
    version := result["version"].(float64) // JSON 数字默认 float64!
    
    // json.Number 保持精度
    dec := json.NewDecoder(bytes.NewReader(data))
    dec.UseNumber()
    var result2 map[string]any
    dec.Decode(&result2)
    num := result2["version"].(json.Number)
    v, _ := num.Int64()  // 精确转换
}

// ═══ 性能对比 ═══
// encoding/json (标准库):  基准, 使用反射
// github.com/json-iterator: ~2x 快, API 兼容
// github.com/bytedance/sonic: ~5x 快, JIT 编译
// github.com/goccy/go-json:  ~3x 快, 代码生成`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 io 与 bufio</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> io_bufio.go</div>
                <pre className="fs-code">{`package main

import (
    "bufio"
    "bytes"
    "io"
    "os"
    "strings"
)

// ═══ io 核心接口 ═══
// type Reader interface { Read(p []byte) (n int, err error) }
// type Writer interface { Write(p []byte) (n int, err error) }
// type Closer interface { Close() error }
// type ReadWriter interface { Reader; Writer }
// type ReadCloser interface { Reader; Closer }

// ═══ io 组合工具 ═══
func ioUtilities() {
    // 复制
    src := strings.NewReader("Hello, World!")
    dst := &bytes.Buffer{}
    n, _ := io.Copy(dst, src)  // 32KB 缓冲区
    
    // 限制读取
    limited := io.LimitReader(src, 5)  // 最多读 5 字节
    
    // 多路读取 (TeeReader): 读取时同时写入
    var log bytes.Buffer
    tee := io.TeeReader(src, &log)
    io.ReadAll(tee)  // log 也有一份副本
    
    // 多路写入 (MultiWriter)
    file, _ := os.Create("output.txt")
    multi := io.MultiWriter(os.Stdout, file)
    fmt.Fprintln(multi, "writes to both!")
    
    // 管道: 内存中的同步 Reader/Writer
    pr, pw := io.Pipe()
    go func() {
        fmt.Fprintln(pw, "piped data")
        pw.Close()
    }()
    data, _ := io.ReadAll(pr)
}

// ═══ bufio — 带缓冲的 I/O ═══
func bufioDemo() {
    // Scanner: 按行/词/字节读取
    file, _ := os.Open("data.txt")
    defer file.Close()
    
    scanner := bufio.NewScanner(file)
    // scanner.Split(bufio.ScanWords)  // 按词
    // scanner.Split(bufio.ScanBytes)  // 按字节
    
    for scanner.Scan() {  // 默认按行
        line := scanner.Text()
        process(line)
    }
    if err := scanner.Err(); err != nil {
        log.Fatal(err)
    }
    
    // ⚠️ Scanner 默认最大 token 64KB
    // 大行: scanner.Buffer(make([]byte, 0), 10*1024*1024)
    
    // buffered Writer: 减少系统调用
    bw := bufio.NewWriter(os.Stdout)
    fmt.Fprintln(bw, "buffered!")
    bw.Flush()  // 必须 Flush!
    
    // buffered Reader
    br := bufio.NewReader(file)
    line, _ := br.ReadString('\\n')
    peek, _ := br.Peek(10)  // 偷看前 10 字节不消费
}

// ═══ 文件操作 ═══
func fileOps() {
    // 读取整个文件
    data, err := os.ReadFile("config.json")
    
    // 写入文件
    err = os.WriteFile("output.txt", []byte("hello"), 0644)
    
    // 流式文件操作
    f, err := os.OpenFile("log.txt",
        os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
    defer f.Close()
    
    // 目录操作
    entries, _ := os.ReadDir(".")
    for _, e := range entries {
        info, _ := e.Info()
        fmt.Printf("%s %d\\n", e.Name(), info.Size())
    }
    
    // 临时文件
    tmp, _ := os.CreateTemp("", "prefix-*.txt")
    defer os.Remove(tmp.Name())
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 实用标准库包</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> stdlib_misc.go</div>
                <pre className="fs-code">{`package main

import (
    "crypto/sha256"
    "log/slog"
    "regexp"
    "sort"
    "strings"
    "text/template"
    "time"
)

// ═══ strings / bytes ═══
func stringOps() {
    s := "Hello, 世界!"
    
    strings.Contains(s, "世界")     // true
    strings.HasPrefix(s, "Hello")  // true
    strings.Split("a,b,c", ",")    // ["a","b","c"]
    strings.Join([]string{"a","b"}, "-") // "a-b"
    strings.TrimSpace("  hi  ")    // "hi"
    strings.ReplaceAll(s, "Hello", "Hi")
    
    // 高效字符串拼接 (避免 += 循环)
    var b strings.Builder
    for i := 0; i < 1000; i++ {
        b.WriteString("data")
    }
    result := b.String()
}

// ═══ time ═══
func timeOps() {
    now := time.Now()
    
    // 格式化: Go 使用 "参考时间" 而非 %Y%m%d
    // 参考时间: Mon Jan 2 15:04:05 MST 2006
    //           1   2  3  4  5       6
    fmt.Println(now.Format("2006-01-02 15:04:05"))
    fmt.Println(now.Format(time.RFC3339))
    
    // 解析
    t, _ := time.Parse("2006-01-02", "2024-03-15")
    
    // 时间计算
    future := now.Add(24 * time.Hour)
    diff := future.Sub(now)  // Duration
    
    // 定时器
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()
    for t := range ticker.C {
        fmt.Println("Tick:", t)
    }
}

// ═══ log/slog (Go 1.21+) — 结构化日志 ═══
func slogDemo() {
    // JSON 格式日志
    logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelDebug,
    }))
    
    logger.Info("user login",
        slog.String("user", "alice"),
        slog.Int("attempt", 3),
        slog.Duration("latency", 150*time.Millisecond),
    )
    // {"time":"...","level":"INFO","msg":"user login",
    //  "user":"alice","attempt":3,"latency":"150ms"}
    
    // 分组
    logger.Info("request",
        slog.Group("http",
            slog.String("method", "GET"),
            slog.Int("status", 200),
        ),
    )
}

// ═══ regexp ═══
func regexpDemo() {
    // 编译 (只编译一次!)
    re := regexp.MustCompile(\`(\\w+)@(\\w+\\.\\w+)\`)
    
    re.MatchString("user@example.com")  // true
    
    matches := re.FindStringSubmatch("user@example.com")
    // ["user@example.com", "user", "example.com"]
    
    result := re.ReplaceAllString(
        "contact: admin@go.dev",
        "[$1 at $2]",  // 引用捕获组
    )
}

// ═══ sort ═══
func sortDemo() {
    // 基本排序
    nums := []int{3, 1, 4, 1, 5, 9}
    sort.Ints(nums)
    
    // 自定义排序
    users := []User{{Name: "Bob"}, {Name: "Alice"}}
    sort.Slice(users, func(i, j int) bool {
        return users[i].Name < users[j].Name
    })
    
    // 稳定排序
    sort.SliceStable(users, func(i, j int) bool {
        return users[i].Age < users[j].Age
    })
    
    // 二分查找
    idx := sort.SearchInts(nums, 4)
    // Go 1.21+: slices.Sort, slices.BinarySearch
}`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
