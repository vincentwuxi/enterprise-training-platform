import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['类型与变量', '函数与控制流', '错误处理', '包与模块'];

export default function LessonGoBasics() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐹 module_01 — Go 基础</div>
      <div className="fs-hero">
        <h1>Go 基础：类型系统 / 函数 / 错误处理 / 包管理</h1>
        <p>
          Go 的设计哲学是<strong>"少即是多" (Less is more)</strong>——没有继承、没有泛型（1.18 前）、
          没有异常。简洁的语法背后是精心设计的类型系统、值语义、多返回值错误处理和
          强大的包管理生态。本模块从零开始，构建扎实的 Go 基础。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐹 Go 基础深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📌 类型与变量</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00add8'}}></span> types.go</div>
                <pre className="fs-code">{`package main

import "fmt"

// ═══ 变量声明 ═══
func variables() {
    // 方式1: var 声明 (显式类型)
    var name string = "Go"
    var age int = 15
    
    // 方式2: 短变量声明 (类型推断, 只在函数内)
    lang := "Go"     // 等价于 var lang string = "Go"
    version := 1.22  // float64
    
    // 方式3: 零值初始化 (Go 没有未初始化变量!)
    var count int     // 0
    var flag bool     // false
    var msg string    // "" (空字符串)
    var ptr *int      // nil
    
    // 批量声明
    var (
        x int    = 1
        y float64 = 2.0
        z string  = "three"
    )
    
    // 常量
    const Pi = 3.14159
    const (
        StatusOK    = 200
        StatusNotFound = 404
    )
    
    // iota — 自增常量
    const (
        Sunday = iota  // 0
        Monday         // 1
        Tuesday        // 2
    )
    
    // iota 位运算技巧
    const (
        Read    = 1 << iota  // 1 (001)
        Write                // 2 (010)
        Execute              // 4 (100)
    )
    // ReadWrite := Read | Write  // 3 (011)
}

// ═══ 基本类型 ═══
// 整数: int, int8, int16, int32, int64
//       uint, uint8 (byte), uint16, uint32, uint64
//       uintptr (指针大小)
// 浮点: float32, float64
// 复数: complex64, complex128
// 布尔: bool
// 字符串: string (不可变 UTF-8 字节序列)
// 别名: byte = uint8, rune = int32 (Unicode 码点)

// ═══ 复合类型 ═══
func compositeTypes() {
    // 数组 (固定长度, 值类型!)
    arr := [5]int{1, 2, 3, 4, 5}
    arr2 := [...]int{1, 2, 3}  // 长度由编译器推断
    // 数组赋值是复制! a2 := arr → 独立副本
    
    // 切片 (动态数组, 引用底层数组)
    s := []int{1, 2, 3}
    s = append(s, 4, 5)       // 追加
    s2 := s[1:3]              // 切片 [2, 3]
    s3 := make([]int, 5, 10)  // len=5, cap=10
    
    // 切片内部结构:
    // ┌─────┬─────┬─────┐
    // │ ptr │ len │ cap │  ← 24 bytes (3个字)
    // └──┬──┴─────┴─────┘
    //    │
    //    ↓
    // [1, 2, 3, 4, 5, _, _, _, _, _]  ← 底层数组
    
    // Map (哈希表)
    m := map[string]int{
        "Alice": 100,
        "Bob":   85,
    }
    m["Carol"] = 90
    val, ok := m["Alice"]  // ok=true, val=100
    delete(m, "Bob")
    
    // Map 注意事项:
    // → 无序遍历 (每次 for range 顺序不同!)
    // → 不可取地址 &m["key"] ❌
    // → 零值 map 可读不可写: var m map[string]int; m["x"] = 1 // panic!
    // → 必须 make 或字面量初始化
}

// ═══ 指针 ═══
func pointers() {
    x := 42
    p := &x       // p 是 *int, 指向 x
    fmt.Println(*p) // 42 (解引用)
    *p = 100
    fmt.Println(x)  // 100
    
    // Go 没有指针算术! (p++ ❌)
    // → 安全: 不能随意访问内存
    // → new() 分配零值并返回指针
    q := new(int)  // *int, 指向 0
}

// ═══ 类型转换 ═══
func typeConversion() {
    var i int = 42
    var f float64 = float64(i)  // 必须显式!
    var u uint = uint(f)
    
    // Go 没有隐式类型转换!
    // var x int32 = 1
    // var y int64 = x  // ❌ 编译错误!
    // var y int64 = int64(x)  // ✅
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 函数与控制流</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00758d'}}></span> functions.go</div>
                <pre className="fs-code">{`package main

// ═══ 函数 ═══
func add(a, b int) int {
    return a + b
}

// 多返回值 (核心特性!)
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

// 命名返回值
func swap(a, b int) (x, y int) {
    x = b
    y = a
    return  // 裸 return, 返回命名的 x, y
}

// 可变参数
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
// sum(1, 2, 3)    → 6
// sum([]int{1,2}...) → 展开切片

// 函数是一等公民
func apply(f func(int, int) int, a, b int) int {
    return f(a, b)
}

// 闭包
func makeCounter() func() int {
    count := 0
    return func() int {
        count++  // 捕获外部变量
        return count
    }
}

// ═══ defer — 延迟执行 ═══
func readFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()  // 函数返回时执行, 无论是否出错!
    // → LIFO 顺序: 多个 defer 后进先出
    // → 参数在 defer 语句执行时求值
    
    // 读取文件...
    return nil
}

// ═══ 控制流 ═══
func controlFlow() {
    // if — 可以带初始化语句
    if err := doSomething(); err != nil {
        // err 只在 if/else 块内可见
        fmt.Println(err)
    }
    
    // for — Go 唯一的循环
    for i := 0; i < 10; i++ { }     // C 风格
    for i < 10 { }                    // while
    for { }                           // 无限循环
    
    // for range — 遍历
    nums := []int{1, 2, 3}
    for i, v := range nums { }       // 索引 + 值
    for _, v := range nums { }       // 只要值
    for i := range nums { }          // 只要索引
    
    for k, v := range map[string]int{"a": 1} { }  // Map
    for i, c := range "Hello 你好" { }  // 字符串: i=字节偏移, c=rune
    
    // switch — 不需要 break!
    switch day := time.Now().Weekday(); day {
    case time.Saturday, time.Sunday:
        fmt.Println("Weekend")
    case time.Monday:
        fmt.Println("Monday :(")
    default:
        fmt.Println("Weekday")
    }
    
    // type switch
    switch v := x.(type) {
    case int:
        fmt.Println("int:", v)
    case string:
        fmt.Println("string:", v)
    default:
        fmt.Println("unknown")
    }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚠️ 错误处理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> errors.go</div>
                <pre className="fs-code">{`package main

import (
    "errors"
    "fmt"
)

// ═══ Go 的错误处理: 多返回值 + error 接口 ═══
// type error interface {
//     Error() string
// }
// 没有 try-catch! 错误是普通的值

func readConfig(path string) (Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return Config{}, fmt.Errorf("read config: %w", err)
        //                                        ^^
        //                                        %w 包装错误!
    }
    
    var config Config
    if err := json.Unmarshal(data, &config); err != nil {
        return Config{}, fmt.Errorf("parse config: %w", err)
    }
    
    return config, nil
}

// ═══ 错误包装与解包 (Go 1.13+) ═══
func errorWrapping() {
    err := readConfig("missing.toml")
    
    // errors.Is — 检查错误链中是否包含特定错误
    if errors.Is(err, os.ErrNotExist) {
        fmt.Println("File not found")
    }
    
    // errors.As — 提取特定类型的错误
    var pathErr *os.PathError
    if errors.As(err, &pathErr) {
        fmt.Println("Path:", pathErr.Path)
    }
    
    // errors.Unwrap — 获取包装的内层错误
    inner := errors.Unwrap(err)
}

// ═══ 自定义错误类型 ═══
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error: %s - %s", e.Field, e.Message)
}

// 哨兵错误 (Sentinel Errors)
var (
    ErrNotFound  = errors.New("not found")
    ErrForbidden = errors.New("forbidden")
    ErrConflict  = errors.New("conflict")
)

func findUser(id int) (User, error) {
    // ...
    return User{}, fmt.Errorf("user %d: %w", id, ErrNotFound)
}

// ═══ panic 与 recover ═══
// panic — 不可恢复的错误 (程序级别的bug)
// → 数组越界、nil 指针解引用会自动 panic
// → 不要用 panic 做正常错误处理!

func mustParse(s string) int {
    v, err := strconv.Atoi(s)
    if err != nil {
        panic(fmt.Sprintf("mustParse(%q): %v", s, err))
    }
    return v
}

// recover — 捕获 panic (类似 catch)
// 只能在 defer 中使用!
func safeHandler() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered:", r)
            // 记录日志, 但不要吞掉错误
        }
    }()
    
    // 可能 panic 的代码...
    riskyOperation()
}

// ═══ 错误处理最佳实践 ═══
// 1. 错误要加上下文: fmt.Errorf("open database: %w", err)
// 2. 在调用栈底层定义错误, 上层包装
// 3. 不要忽略错误! (golangci-lint 会检查)
// 4. 只在 main/init/goroutine 入口使用 recover
// 5. 库代码永远返回 error, 不要 panic
// 6. 使用 errors.Is/As 而不是字符串比较`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 包与模块管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> modules.go</div>
                <pre className="fs-code">{`// ═══ Go Modules (go.mod) ═══
// 初始化:
// go mod init github.com/user/project
//
// go.mod 文件:
// module github.com/user/project
// 
// go 1.22
// 
// require (
//     github.com/gin-gonic/gin v1.9.1
//     golang.org/x/sync v0.7.0
// )

// ═══ 依赖管理命令 ═══
// go get github.com/pkg/errors@v0.9.1  // 添加依赖
// go mod tidy                            // 清理无用依赖
// go mod download                        // 下载依赖
// go mod vendor                          // 复制到 vendor/
// go mod graph                           // 依赖图
// go mod why -m <module>                 // 为什么需要

// ═══ 包的可见性规则 ═══
// 大写开头 = 导出 (public)
// 小写开头 = 未导出 (private)

package user

type User struct {
    Name  string  // 导出 (其他包可访问)
    email string  // 未导出 (仅本包可访问)
}

func NewUser(name, email string) *User {  // 导出: 工厂函数
    return &User{Name: name, email: email}
}

func (u *User) Email() string {  // 导出: getter
    return u.email
}

// ═══ internal 目录 ═══
// myproject/
// ├── cmd/
// │   └── server/
// │       └── main.go        ← 入口
// ├── internal/               ← 只有本模块能导入!
// │   ├── auth/
// │   │   └── auth.go
// │   └── database/
// │       └── db.go
// ├── pkg/                    ← 公共包, 其他项目可导入
// │   └── api/
// │       └── api.go
// ├── go.mod
// └── go.sum

// ═══ init() 函数 ═══
// 每个包可以有多个 init(), 在 main() 前自动执行
func init() {
    // 注册驱动、初始化全局变量等
    // 注意: 不要有副作用, 不要太重!
}

// ═══ Go 工具链 ═══
// go build      — 编译
// go run        — 编译并运行
// go test       — 运行测试
// go vet        — 静态检查
// go fmt        — 格式化 (= gofmt)
// go doc        — 查看文档
// go generate   — 运行 //go:generate 指令
// go install    — 安装到 $GOPATH/bin
// go work       — Workspace (多模块项目)

// ═══ 交叉编译 ═══
// GOOS=linux GOARCH=amd64 go build -o app-linux
// GOOS=darwin GOARCH=arm64 go build -o app-mac
// GOOS=windows GOARCH=amd64 go build -o app.exe
// → 零依赖静态二进制! (默认 CGO_ENABLED=0)

// ═══ 构建标签 (Build Tags) ═══
//go:build linux && amd64
// → 只在 Linux AMD64 上编译

//go:build !windows
// → 除 Windows 外都编译

// ═══ 代码生成 ═══
//go:generate stringer -type=Color
//go:generate mockgen -source=repo.go -destination=mock_repo.go`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
