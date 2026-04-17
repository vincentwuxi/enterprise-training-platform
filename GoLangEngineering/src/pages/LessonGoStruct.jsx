import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['结构体', '方法与接收器', '接口与多态', '泛型 (1.18+)'];

export default function LessonGoStruct() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐹 module_02 — 结构体与接口</div>
      <div className="fs-hero">
        <h1>结构体与接口：组合优于继承 / 接口鸭子类型</h1>
        <p>
          Go 没有类 (class)、没有继承。通过<strong>组合 (Composition)</strong> 替代继承，
          通过<strong>接口隐式实现</strong> (鸭子类型) 实现多态。这套设计看似简陋，
          实则是 Go "大道至简" 哲学的精华，也是编写可测试、可扩展代码的关键。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐹 结构体与接口深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 结构体</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00add8'}}></span> struct.go</div>
                <pre className="fs-code">{`package main

// ═══ 结构体定义 ═══
type User struct {
    ID        int64
    Name      string
    Email     string
    CreatedAt time.Time
}

// 构造函数 (Go 惯例: NewXxx)
func NewUser(name, email string) *User {
    return &User{
        ID:        generateID(),
        Name:      name,
        Email:     email,
        CreatedAt: time.Now(),
    }
}

// ═══ 结构体初始化 ═══
func structInit() {
    // 字面量 (推荐: 指定字段名)
    u1 := User{Name: "Alice", Email: "a@b.com"}
    
    // 位置初始化 (不推荐: 改字段顺序就挂)
    u2 := User{1, "Bob", "b@c.com", time.Now()}
    
    // 零值初始化
    var u3 User  // 所有字段为零值
    
    // 指针
    u4 := &User{Name: "Carol"}  // 等价于 new(User)
}

// ═══ 结构体嵌入 (Embedding) — 组合! ═══
type Address struct {
    Street string
    City   string
    State  string
}

type Employee struct {
    User      // 匿名嵌入! (不是继承!)
    Address   // 可以嵌入多个
    Salary    float64
    ManagerID int64
}

func embedded() {
    emp := Employee{
        User:    User{Name: "Dave", Email: "d@e.com"},
        Address: Address{City: "Beijing"},
        Salary:  100000,
    }
    
    // 字段提升 (Promotion): 嵌入类型的字段和方法提升到外层
    fmt.Println(emp.Name)    // ← 等价于 emp.User.Name
    fmt.Println(emp.City)    // ← 等价于 emp.Address.City
    
    // ⚠️ 如果有字段名冲突, 外层优先 (遮蔽)
    // ⚠️ 嵌入的类型不是继承! Employee 不是 User!
}

// ═══ 结构体标签 (Struct Tags) ═══
type Article struct {
    ID      int    \`json:"id" db:"article_id"\`
    Title   string \`json:"title" validate:"required,max=200"\`
    Content string \`json:"content,omitempty"\`
    Hidden  string \`json:"-"\`  // JSON 中忽略
}

// 通过反射读取:
// field, _ := reflect.TypeOf(Article{}).FieldByName("Title")
// tag := field.Tag.Get("json")  // "title"

// ═══ 值语义 vs 指针语义 ═══
func valueSemantic() {
    u1 := User{Name: "Alice"}
    u2 := u1       // 复制! u2 是独立副本
    u2.Name = "Bob"
    // u1.Name 仍然是 "Alice"
    
    // 何时用指针?
    // 1. 需要修改原始值
    // 2. 结构体很大 (避免复制开销)
    // 3. 需要表达 nil (空值)
    
    // 何时用值?
    // 1. 小结构体 (<=3个字段)
    // 2. 不可变数据
    // 3. map 的 key (必须是可比较类型)
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 方法与接收器</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00758d'}}></span> methods.go</div>
                <pre className="fs-code">{`package main

// ═══ 方法: 有接收器的函数 ═══

// 值接收器: 操作副本
func (u User) FullName() string {
    return u.Name + " <" + u.Email + ">"
}

// 指针接收器: 操作原始值
func (u *User) SetEmail(email string) {
    u.Email = email  // 修改原始对象
}

func methods() {
    u := User{Name: "Alice", Email: "old@a.com"}
    
    fmt.Println(u.FullName())  // 值接收器, 安全
    u.SetEmail("new@a.com")   // 指针接收器, 修改 u
    
    // Go 自动取地址/解引用:
    // u.SetEmail(...)  等价于  (&u).SetEmail(...)
    // (&u).FullName()  等价于  (*(&u)).FullName()
}

// ═══ 接收器选择规则 ═══
// 使用指针接收器:
// 1. 需要修改接收器的值
// 2. 接收器很大 (避免复制)
// 3. 一致性: 如果有一个方法用指针, 所有方法都用指针
//
// 使用值接收器:
// 1. 不需要修改
// 2. 接收器是 map/chan/func (本身就是引用)
// 3. 接收器是小的不可变 struct

// ═══ 方法集规则 (接口实现!) ═══
// 值类型 T 的方法集:   T 的值接收器方法
// 指针类型 *T 的方法集: T 和 *T 的所有方法
//
// 这意味着:
// → 如果接口要求 SetEmail, 只有 *User 实现了, User 没有!
// → var w io.Writer = u   // ❌ (如果 Write 是指针接收器)
// → var w io.Writer = &u  // ✅

// ═══ 方法值与方法表达式 ═══
func methodValues() {
    u := User{Name: "Alice"}
    
    // 方法值: 绑定接收器
    fn := u.FullName
    fmt.Println(fn())  // "Alice <>"
    
    // 方法表达式: 接收器作为第一个参数
    fn2 := User.FullName
    fmt.Println(fn2(u))  // "Alice <>"
    
    // 常用于高阶函数:
    users := []User{{Name: "A"}, {Name: "B"}}
    sort.Slice(users, func(i, j int) bool {
        return users[i].Name < users[j].Name
    })
}

// ═══ 为任意类型定义方法 ═══
type StringSlice []string

func (s StringSlice) Contains(target string) bool {
    for _, v := range s {
        if v == target {
            return true
        }
    }
    return false
}

// 但不能为其他包的类型定义方法!
// func (s string) MyMethod() {} // ❌ 编译错误!
// 解决: 创建新类型 type MyString string`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎭 接口与多态</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> interfaces.go</div>
                <pre className="fs-code">{`package main

// ═══ 接口: 隐式实现 (鸭子类型) ═══
// "If it walks like a duck and quacks like a duck, it's a duck"

type Writer interface {
    Write(data []byte) (int, error)
}

// 任何有 Write 方法的类型自动实现 Writer!
// 不需要 implements 关键字!

type FileWriter struct { path string }

func (fw *FileWriter) Write(data []byte) (int, error) {
    // 写入文件...
    return len(data), nil
}
// FileWriter 自动实现了 Writer ✅

type MemoryWriter struct { buf []byte }

func (mw *MemoryWriter) Write(data []byte) (int, error) {
    mw.buf = append(mw.buf, data...)
    return len(data), nil
}
// MemoryWriter 也自动实现了 Writer ✅

// 多态: 使用接口
func WriteAll(w Writer, data []byte) error {
    _, err := w.Write(data)
    return err
}

// ═══ 接口组合 ═══
type Reader interface {
    Read(p []byte) (int, error)
}

type ReadWriter interface {
    Reader  // 嵌入 Reader
    Writer  // 嵌入 Writer
}
// 等价于:
// type ReadWriter interface {
//     Read(p []byte) (int, error)
//     Write(data []byte) (int, error)
// }

// ═══ 空接口 interface{} (any) ═══
func printAnything(v any) {  // any = interface{}
    fmt.Println(v)
}
// 任何类型都实现了空接口!
// → 类似 Java 的 Object, TypeScript 的 any
// → 尽量少用, 失去了类型安全

// ═══ 类型断言与类型检查 ═══
func typeAssertions(v any) {
    // 类型断言
    s, ok := v.(string)
    if ok {
        fmt.Println("string:", s)
    }
    
    // 类型 switch
    switch val := v.(type) {
    case int:
        fmt.Println("int:", val)
    case string:
        fmt.Println("string:", val)
    case []byte:
        fmt.Println("bytes:", len(val))
    default:
        fmt.Printf("unknown: %T\\n", val)
    }
}

// ═══ 常用标准库接口 ═══
// io.Reader      — Read(p []byte) (n int, err error)
// io.Writer      — Write(p []byte) (n int, err error)
// io.Closer      — Close() error
// fmt.Stringer   — String() string
// error          — Error() string
// sort.Interface — Len, Less, Swap
// http.Handler   — ServeHTTP(w, r)
// json.Marshaler — MarshalJSON() ([]byte, error)
// context.Context — 超时与取消

// ═══ 接口设计原则 ═══
// 1. 小接口: 1-3 个方法 (Go 标准库平均 1.7 个)
// 2. 在消费端定义接口, 不在实现端
//    → package service 定义 Repository 接口
//    → package postgres 实现 PostgresRepo
// 3. 接受接口, 返回结构体
//    → func NewService(repo Repository) *Service
// 4. 不要为了"以防万一"创建接口
//    → 只有需要多态时才用`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔷 泛型 (Go 1.18+)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> generics.go</div>
                <pre className="fs-code">{`package main

// ═══ 类型参数 ═══
func Min[T constraints.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}
// Min(3, 5)       → 3 (int)
// Min("a", "b")   → "a" (string)
// Min(3.14, 2.71) → 2.71 (float64)

// ═══ 类型约束 ═══
// constraints.Ordered = 可比较的有序类型
// comparable = 可以用 == 比较的类型

// 自定义约束
type Number interface {
    ~int | ~int32 | ~int64 | ~float32 | ~float64
    // ~ 前缀: 包括底层类型 (type MyInt int)
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}

// ═══ 泛型结构体 ═══
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}

// 使用:
// s := Stack[int]{}
// s.Push(1)
// s.Push(2)
// val, ok := s.Pop()  // 2, true

// ═══ 泛型 Map/Filter/Reduce ═══
func Map[T, U any](slice []T, f func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = f(v)
    }
    return result
}

func Filter[T any](slice []T, pred func(T) bool) []T {
    var result []T
    for _, v := range slice {
        if pred(v) {
            result = append(result, v)
        }
    }
    return result
}

func Reduce[T, U any](slice []T, init U, f func(U, T) U) U {
    acc := init
    for _, v := range slice {
        acc = f(acc, v)
    }
    return acc
}

// ═══ 泛型最佳实践 ═══
// 1. 优先使用接口, 泛型用于接口不方便的场景
// 2. 适合泛型的场景:
//    → 数据结构 (Stack, Queue, Tree)
//    → 通用算法 (Sort, Map, Filter)
//    → 减少 interface{} / reflect 使用
//
// 3. 不适合泛型的场景:
//    → 方法参数类型不同时 (用接口)
//    → 实现差异大时 (用接口)
//
// 4. Go 泛型 vs 其他语言:
//    → 没有特化 (specialization)
//    → 没有泛型方法 (只有泛型函数和类型)
//    → 编译时单态化 (类似 Rust, 非擦除)
//    → 约束是接口的扩展`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
