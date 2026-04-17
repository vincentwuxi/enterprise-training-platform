import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Result 与 Option', '自定义错误', '集合类型', '智能指针'];

export default function LessonRustErrors() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🦀 module_03 — 错误处理与集合</div>
      <div className="fs-hero">
        <h1>错误处理与集合：Result / Option / Vec / HashMap / 智能指针</h1>
        <p>
          Rust 用类型系统<strong>强制你处理错误</strong>——没有异常 (Exception)，没有 try-catch。
          Result{'<T, E>'} 和 ? 运算符让错误处理既安全又优雅。本模块深入错误处理的最佳实践、
          Vec/HashMap/BTreeMap 等集合的底层实现，以及 Box/Rc/Arc 等智能指针的使用场景。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦀 错误处理与数据结构</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ Result 与 ? 运算符</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f74c00'}}></span> result.rs</div>
                <pre className="fs-code">{`// ═══ Rust 的错误处理哲学 ═══
// 1. 可恢复错误: Result<T, E>   → 调用者处理
// 2. 不可恢复错误: panic!()     → 程序崩溃
//
// Rust 没有异常! 错误是返回值的一部分

// enum Result<T, E> {
//     Ok(T),    // 成功, 包含值
//     Err(E),   // 失败, 包含错误信息
// }

use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    // 方式 1: match 处理
    let f = File::open("username.txt");
    let mut f = match f {
        Ok(file) => file,
        Err(e) => return Err(e),  // 提前返回错误
    };
    let mut s = String::new();
    match f.read_to_string(&mut s) {
        Ok(_) => Ok(s),
        Err(e) => Err(e),
    }
}

// 方式 2: ? 运算符 — 语法糖, 等价于上面的 match
fn read_username_v2() -> Result<String, io::Error> {
    let mut f = File::open("username.txt")?;  // 错误自动返回
    let mut s = String::new();
    f.read_to_string(&mut s)?;                // 错误自动返回
    Ok(s)
}

// 方式 3: 链式调用
fn read_username_v3() -> Result<String, io::Error> {
    let mut s = String::new();
    File::open("username.txt")?.read_to_string(&mut s)?;
    Ok(s)
}

// 方式 4: 标准库封装
fn read_username_v4() -> Result<String, io::Error> {
    std::fs::read_to_string("username.txt")
}

// ═══ ? 运算符的工作原理 ═══
// expression?  展开为:
// match expression {
//     Ok(val) => val,
//     Err(e) => return Err(From::from(e)),
//                        ^^^^^^^^^^^^^^^^
//                        自动类型转换!
// }
// → 如果错误类型不同, 会自动调用 From trait 转换

// ═══ unwrap 和 expect — 快速但危险 ═══
fn unwrap_demo() {
    let f = File::open("hello.txt").unwrap();
    // → Ok 时返回值, Err 时 panic!
    
    let f = File::open("hello.txt")
        .expect("Failed to open hello.txt");
    // → 同 unwrap, 但可以自定义 panic 消息
    
    // 何时使用 unwrap:
    // 1. 示例代码 / 原型
    // 2. 你确定不会失败 (如 "127.0.0.1".parse::<IpAddr>())
    // 3. 测试代码中
}

// ═══ Option 的组合子 ═══
fn option_combinators() {
    let some_val: Option<i32> = Some(42);
    let none_val: Option<i32> = None;
    
    // map: 转换内部值
    let doubled = some_val.map(|x| x * 2);     // Some(84)
    
    // and_then (flatMap): 链式 Option 操作
    let result = some_val
        .and_then(|x| if x > 10 { Some(x) } else { None })
        .and_then(|x| Some(x.to_string()));     // Some("42")
    
    // unwrap_or / unwrap_or_else: 默认值
    let val = none_val.unwrap_or(0);             // 0
    let val = none_val.unwrap_or_else(|| compute_default());
    
    // ok_or: Option → Result
    let result: Result<i32, &str> = some_val.ok_or("not found");
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚠️ 自定义错误与 thiserror/anyhow</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> custom_errors.rs</div>
                <pre className="fs-code">{`// ═══ 自定义错误类型 ═══
use std::fmt;
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    NotFound(String),
    ParseError(ParseIntError),
    IoError(std::io::Error),
    Custom(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(item) => write!(f, "Not found: {item}"),
            AppError::ParseError(e) => write!(f, "Parse error: {e}"),
            AppError::IoError(e) => write!(f, "IO error: {e}"),
            AppError::Custom(msg) => write!(f, "{msg}"),
        }
    }
}

impl std::error::Error for AppError {}

// From trait 让 ? 自动转换错误类型
impl From<ParseIntError> for AppError {
    fn from(e: ParseIntError) -> Self {
        AppError::ParseError(e)
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::IoError(e)
    }
}

fn do_something() -> Result<i32, AppError> {
    let content = std::fs::read_to_string("number.txt")?; // io::Error → AppError
    let num: i32 = content.trim().parse()?; // ParseIntError → AppError
    Ok(num * 2)
}

// ═══ thiserror — 库错误类型的最佳实践 ═══
// Cargo.toml: thiserror = "1"

use thiserror::Error;

#[derive(Error, Debug)]
enum DataError {
    #[error("Record not found: {id}")]
    NotFound { id: u64 },
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("IO error")]
    Io(#[from] std::io::Error),  // 自动实现 From!
    
    #[error("Parse error")]  
    Parse(#[from] ParseIntError),
}
// → 自动生成 Display, Error, From 实现
// → 适合写库: 调用者可以 match 不同的错误变体

// ═══ anyhow — 应用级错误处理 ═══
// Cargo.toml: anyhow = "1"
//
// use anyhow::{Result, Context, bail, ensure};
//
// fn main() -> anyhow::Result<()> {
//     let config = std::fs::read_to_string("config.toml")
//         .context("Failed to read config file")?;
//     //  ^^^^^^^^ 添加上下文信息
//
//     let port: u16 = config.parse()
//         .context("Failed to parse port number")?;
//
//     ensure!(port > 1024, "Port must be > 1024, got {port}");
//     //      ^^^^^^^^^^^ 条件不满足就返回错误
//
//     if port == 0 { bail!("Port cannot be zero"); }
//     //             ^^^^^ 直接返回错误
//
//     Ok(())
// }
//
// thiserror vs anyhow:
// ┌────────────┬──────────────────────┬─────────────────────┐
// │            │ thiserror            │ anyhow              │
// ├────────────┼──────────────────────┼─────────────────────┤
// │ 适用场景   │ 写库 (library)       │ 写应用 (binary)     │
// │ 错误类型   │ 自定义 enum          │ anyhow::Error (通用)│
// │ 是否可match│ ✅ 精确匹配变体      │ ❌ 不鼓励 match     │
// │ 上下文     │ 手动添加             │ .context() 方便     │
// └────────────┴──────────────────────┴─────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 集合类型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> collections.rs</div>
                <pre className="fs-code">{`use std::collections::HashMap;

// ═══ Vec<T> — 动态数组 ═══
fn vec_demo() {
    // 创建
    let mut v: Vec<i32> = Vec::new();
    let v2 = vec![1, 2, 3];  // 宏创建
    
    // 增删
    v.push(1);
    v.push(2);
    v.push(3);
    let last = v.pop();  // Some(3)
    
    // 访问
    let third = &v[2];        // 可能 panic! (越界)
    let third = v.get(2);     // Option<&i32>, 安全
    
    // ⚠️ 所有权陷阱!
    let first = &v[0];        // 不可变借用
    // v.push(4);             // ❌ 可变借用! 可能触发重新分配
    println!("{first}");       // 不可变借用还在使用
    
    // 遍历
    for i in &v { print!("{i} "); }        // 不可变
    for i in &mut v { *i += 10; }          // 可变
    for i in v { print!("{i} "); }         // 消费 (move)
    // v 已经无效!
    
    // Vec 内存布局:
    // 栈: [ptr | len | capacity]
    //       │     3      4
    //       ↓
    // 堆: [1, 2, 3, _, _, ...]
    // push 导致容量不足时: 重新分配 (通常 2x)
    // → 所有指向旧位置的引用都会失效!
}

// ═══ String — UTF-8 字符串 ═══
fn string_demo() {
    let mut s = String::from("hello");
    s.push(' ');           // 追加字符
    s.push_str("world");   // 追加切片
    
    // String = Vec<u8> 的包装, 保证 UTF-8
    // &str = &[u8] 的包装 (字符串切片)
    
    // ⚠️ 不能按索引访问!
    // let c = s[0];  // ❌ 编译错误!
    // 原因: UTF-8 是变长编码
    // "hello" → 5 bytes (ASCII 每字符 1 byte)
    // "你好"  → 6 bytes (中文每字符 3 bytes)
    
    // 遍历字符:
    for c in "你好world".chars() { print!("{c} "); }
    // 你 好 w o r l d
    
    // 遍历字节:
    for b in "你好".bytes() { print!("{b} "); }
    // 228 189 160 229 165 189
    
    // 切片 (必须在字符边界!):
    let s = "你好world";
    let hello = &s[0..6];  // "你好" (6 bytes)
    // let bad = &s[0..1]; // ❌ panic! 不在字符边界
}

// ═══ HashMap<K, V> ═══
fn hashmap_demo() {
    let mut scores = HashMap::new();
    scores.insert("Alice", 100);
    scores.insert("Bob", 85);
    
    // 获取
    let alice = scores.get("Alice");   // Option<&i32>
    
    // 只在不存在时插入
    scores.entry("Carol").or_insert(90);
    
    // 更新: 统计单词频率
    let text = "hello world wonderful world";
    let mut word_count = HashMap::new();
    for word in text.split_whitespace() {
        let count = word_count.entry(word).or_insert(0);
        *count += 1;
    }
    // {"hello": 1, "world": 2, "wonderful": 1}
    
    // 遍历
    for (key, value) in &scores {
        println!("{key}: {value}");
    }
    
    // ⚠️ 所有权: String key 会 move 进 HashMap!
    let key = String::from("Alice");
    let mut map = HashMap::new();
    map.insert(key, 100);
    // println!("{key}");  // ❌ key 已移入 map
    
    // 用 &str 或 .clone() 避免
}

// ═══ 其他集合 ═══
// BTreeMap<K, V>  — 有序, B-tree, O(log n)
// HashSet<T>      — 无序集合, O(1) 查找
// BTreeSet<T>     — 有序集合, O(log n)
// VecDeque<T>     — 双端队列 (环形缓冲区)
// LinkedList<T>   — 双向链表 (很少用!)
// BinaryHeap<T>   — 最大堆 / 优先队列`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📍 智能指针</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> smart_pointers.rs</div>
                <pre className="fs-code">{`// ═══ Box<T> — 堆上分配 ═══
fn box_demo() {
    let b = Box::new(5);  // 在堆上分配 i32
    println!("{b}");       // 自动解引用
    
    // 使用场景:
    // 1. 编译期大小未知的类型 (递归类型)
    // 2. 大数据避免栈上复制
    // 3. Trait 对象 (dyn Trait)
    
    // 递归类型:
    enum List {
        Cons(i32, Box<List>),  // Box 使大小固定!
        Nil,
    }
    
    use List::{Cons, Nil};
    let list = Cons(1, Box::new(Cons(2, Box::new(Nil))));
}

// ═══ Rc<T> — 引用计数 (单线程) ═══
use std::rc::Rc;

fn rc_demo() {
    let data = Rc::new(vec![1, 2, 3]);
    let a = Rc::clone(&data);  // 引用计数 +1
    let b = Rc::clone(&data);  // 引用计数 +1
    
    println!("count: {}", Rc::strong_count(&data)); // 3
    drop(a);
    println!("count: {}", Rc::strong_count(&data)); // 2
    // 计数为 0 时自动释放
    
    // ⚠️ Rc 只能不可变共享!
    // 需要可变? → Rc<RefCell<T>>
}

// ═══ RefCell<T> — 运行时借用检查 ═══
use std::cell::RefCell;

fn refcell_demo() {
    let data = RefCell::new(vec![1, 2, 3]);
    
    // 运行时借用检查 (违反规则会 panic!)
    let mut borrow = data.borrow_mut();  // 可变借用
    borrow.push(4);
    drop(borrow);  // 必须先释放
    
    let read = data.borrow();  // 不可变借用
    println!("{read:?}");
    
    // Rc<RefCell<T>> 模式: 多个所有者 + 可变
    let shared = Rc::new(RefCell::new(0));
    let a = Rc::clone(&shared);
    let b = Rc::clone(&shared);
    *a.borrow_mut() += 10;
    *b.borrow_mut() += 20;
    println!("{}", shared.borrow()); // 30
}

// ═══ Arc<T> + Mutex<T> — 多线程共享 ═══
use std::sync::{Arc, Mutex};

fn arc_mutex_demo() {
    // Arc = Atomic Reference Counting (线程安全)
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = std::thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }
    
    for h in handles { h.join().unwrap(); }
    println!("Result: {}", *counter.lock().unwrap()); // 10
}

// ═══ 智能指针对比 ═══
// ┌─────────────┬──────────┬──────────┬──────────┐
// │ 类型        │ 所有者   │ 可变性   │ 线程安全 │
// ├─────────────┼──────────┼──────────┼──────────┤
// │ Box<T>      │ 单个     │ 正常     │ ✅       │
// │ Rc<T>       │ 多个     │ 不可变   │ ❌       │
// │ Arc<T>      │ 多个     │ 不可变   │ ✅       │
// │ RefCell<T>  │ 单个     │ 运行时   │ ❌       │
// │ Mutex<T>    │ 单个     │ 运行时   │ ✅       │
// │ RwLock<T>   │ 单个     │ 运行时   │ ✅       │
// └─────────────┴──────────┴──────────┴──────────┘
//
// 常见组合:
// Rc<RefCell<T>>     — 单线程多所有者可变
// Arc<Mutex<T>>      — 多线程多所有者可变
// Arc<RwLock<T>>     — 多线程多读少写`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
