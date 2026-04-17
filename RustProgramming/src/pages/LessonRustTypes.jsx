import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['枚举与模式匹配', 'Trait 系统', '泛型', '高级类型'];

export default function LessonRustTypes() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🦀 module_02 — 类型系统</div>
      <div className="fs-hero">
        <h1>类型系统：Enum / Pattern Match / Trait / 泛型</h1>
        <p>
          Rust 的类型系统是其<strong>表达力和安全性</strong>的核心。代数数据类型 (ADT)
          让你用 enum 精确建模业务领域，模式匹配保证穷举覆盖，Trait 实现了零成本多态，
          泛型配合 Trait Bound 让代码既抽象又高效。本模块深入类型系统的每个角落。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦀 类型系统深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 枚举与模式匹配</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f74c00'}}></span> enum_pattern.rs</div>
                <pre className="fs-code">{`// ═══ Rust Enum: 代数数据类型 (Sum Type) ═══
// 不是 C 的枚举! Rust enum 的每个变体可以携带不同数据

// 基础枚举
enum Direction { North, South, East, West }

// 携带数据的枚举 — 每个变体可以是不同类型!
enum Message {
    Quit,                       // 无数据
    Move { x: i32, y: i32 },   // 命名字段 (类似结构体)
    Write(String),              // 字符串
    ChangeColor(u8, u8, u8),   // 元组
}

// → 比 C 的 union + tag 安全得多
// → 大小 = 最大变体的大小 + 判别符 (tag)

// ═══ Option<T> — null 的安全替代 ═══
// enum Option<T> { Some(T), None }
// Rust 没有 null! Option 强制你处理空值

fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some(String::from("Alice")) } 
    else { None }
}

fn option_demo() {
    let user = find_user(1);
    // user.len();  // ❌ 编译错误! Option<String> 没有 len()
    
    // 方法1: match 穷举
    match user {
        Some(name) => println!("Found: {name}"),
        None => println!("Not found"),
    }
    
    // 方法2: if let (只关心一种情况)
    if let Some(name) = find_user(2) {
        println!("Found: {name}");
    } else {
        println!("Not found");
    }
    
    // 方法3: 链式调用
    let greeting = find_user(1)
        .map(|name| format!("Hello, {name}!"))
        .unwrap_or_else(|| "Hello, stranger!".into());
    
    // 方法4: ? 运算符 (在返回 Option 的函数中)
    // let name = find_user(1)?;  // None 时提前返回
}

// ═══ 模式匹配 (Pattern Matching) ═══
fn pattern_demo(msg: Message) {
    match msg {
        Message::Quit => println!("Quit"),
        Message::Move { x, y } => println!("Move to ({x}, {y})"),
        Message::Write(text) => println!("Write: {text}"),
        Message::ChangeColor(r, g, b) => println!("Color: {r},{g},{b}"),
    }
    // → match 必须穷举所有变体! 少一个就编译错误
    // → 这就是 Rust 安全的秘密之一
}

// 模式匹配的威力
fn patterns() {
    let x = 42;
    match x {
        1 => println!("one"),
        2 | 3 => println!("two or three"),    // 或模式
        4..=10 => println!("four to ten"),     // 范围模式
        n if n % 2 == 0 => println!("even"),   // match guard
        _ => println!("other"),                // 通配符
    }
    
    // 解构结构体
    struct Point { x: i32, y: i32 }
    let p = Point { x: 0, y: 7 };
    match p {
        Point { x: 0, y } => println!("On y-axis at {y}"),
        Point { x, y: 0 } => println!("On x-axis at {x}"),
        Point { x, y } => println!("({x}, {y})"),
    }
    
    // let 也是模式匹配!
    let (a, b, c) = (1, 2, 3);
    let Point { x, y } = p;
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧬 Trait 系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> traits.rs</div>
                <pre className="fs-code">{`// ═══ Trait = 共享行为的定义 ═══
// 类似其他语言的 Interface, 但更强大

trait Summary {
    fn summarize_author(&self) -> String;  // 必须实现
    
    fn summarize(&self) -> String {
        // 默认实现 (可以调用其他方法)
        format!("(Read more from {}...)", self.summarize_author())
    }
}

struct Article {
    title: String,
    author: String,
    content: String,
}

impl Summary for Article {
    fn summarize_author(&self) -> String {
        self.author.clone()
    }
    
    fn summarize(&self) -> String {
        format!("{}, by {} — {}", self.title, self.author,
                &self.content[..50])
    }
}

struct Tweet { username: String, content: String }

impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
    // 使用默认的 summarize() 实现
}

// ═══ Trait 作为参数 (静态分发) ═══
// 编译期决定调用哪个实现 → 零成本!
fn notify(item: &impl Summary) {
    println!("Breaking: {}", item.summarize());
}

// 完整写法 (Trait Bound):
fn notify_full<T: Summary>(item: &T) {
    println!("Breaking: {}", item.summarize());
}

// 多个 Trait Bound:
fn notify_complex(item: &(impl Summary + std::fmt::Display)) { }
fn notify_where<T>(item: &T)
where T: Summary + std::fmt::Display + Clone { }

// ═══ Trait 作为返回值 ═══
fn returns_summarizable() -> impl Summary {
    Tweet { username: "bot".into(), content: "hello".into() }
    // 注意: 只能返回一种具体类型!
    // if 条件 { Article{..} } else { Tweet{..} } // ❌ 不行
}

// ═══ Trait Object (动态分发) ═══
// dyn Trait — 运行时多态, 有 vtable 开销
fn print_all(items: &[&dyn Summary]) {
    for item in items {
        println!("{}", item.summarize());
    }
}

// Box<dyn Trait> — 堆上的 Trait 对象
fn create_summarizer(kind: &str) -> Box<dyn Summary> {
    if kind == "article" {
        Box::new(Article { 
            title: "Rust".into(), author: "Ferris".into(),
            content: "Rust is great...".repeat(10) 
        })
    } else {
        Box::new(Tweet { username: "crab".into(), content: "🦀".into() })
    }
}

// ═══ 常用标准库 Trait ═══
// Display  — 用户友好的打印 (fmt::Display)
// Debug    — 调试打印 (#[derive(Debug)])
// Clone    — 深拷贝 (.clone())
// Copy     — 隐式按位复制 (栈上小类型)
// PartialEq, Eq     — 相等比较
// PartialOrd, Ord   — 排序比较
// Hash     — 哈希 (用于 HashMap)
// Default  — 默认值
// Iterator — 迭代器
// From/Into — 类型转换
// Drop     — 析构函数 (RAII)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 泛型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> generics.rs</div>
                <pre className="fs-code">{`// ═══ 泛型函数 ═══
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in &list[1..] {
        if item > largest {
            largest = item;
        }
    }
    largest
}

// ═══ 泛型结构体 ═══
struct Point<T> {
    x: T,
    y: T,
}

// 不同类型的坐标
struct PointMixed<T, U> {
    x: T,
    y: U,
}

// 泛型方法
impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

// 只对特定类型实现方法
impl Point<f64> {
    fn distance_from_origin(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
// Point<i32> 没有 distance_from_origin 方法!

// ═══ 泛型的零成本抽象 ═══
// Rust 在编译期对泛型做 "单态化" (Monomorphization)
//
// let integer = Point { x: 5, y: 10 };
// let float = Point { x: 1.0, y: 4.0 };
//
// 编译器生成:
// struct Point_i32 { x: i32, y: i32 }
// struct Point_f64 { x: f64, y: f64 }
//
// → 运行时完全没有泛型的开销!
// → 但可能增大二进制大小 (每种类型一份代码)

// ═══ 关联类型 vs 泛型参数 ═══
// Trait 中的关联类型: 实现者决定类型
trait Iterator {
    type Item;  // 关联类型
    fn next(&mut self) -> Option<Self::Item>;
}

// vs 泛型 Trait (可以为同一类型实现多次):
trait Add<Rhs = Self> {
    type Output;
    fn add(self, rhs: Rhs) -> Self::Output;
}

// ═══ Phantom Data — 零大小标记类型 ═══
use std::marker::PhantomData;

struct Meters;
struct Kilometers;

struct Distance<Unit> {
    value: f64,
    _unit: PhantomData<Unit>,  // 不占空间!
}

impl Distance<Meters> {
    fn to_km(self) -> Distance<Kilometers> {
        Distance { value: self.value / 1000.0, _unit: PhantomData }
    }
}

// let d: Distance<Meters> = Distance { value: 5000.0, _unit: PhantomData };
// let km = d.to_km();  // 类型安全的单位转换!
// km + d;  // ❌ 不同单位不能直接运算

// ═══ const 泛型 (Rust 1.51+) ═══
fn print_array<T: std::fmt::Debug, const N: usize>(arr: [T; N]) {
    println!("{arr:?}");
}
// print_array([1, 2, 3]);     // N=3
// print_array([1, 2, 3, 4]);  // N=4, 不同的函数!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧪 高级类型特性</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> advanced_types.rs</div>
                <pre className="fs-code">{`// ═══ 闭包 (Closures) ═══
// 闭包 = 匿名函数 + 捕获环境变量
fn closure_demo() {
    let x = 4;
    let equal_to_x = |z| z == x;  // 捕获 x
    assert!(equal_to_x(4));
    
    // 闭包的三种捕获方式 (编译器自动选择最低权限):
    // FnOnce — 获取所有权 (move)
    // FnMut  — 可变借用
    // Fn     — 不可变借用
    
    let mut list = vec![1, 2, 3];
    let mut push_to = |val| list.push(val);  // FnMut (可变借用)
    push_to(4);
    
    // move 闭包: 强制获取所有权
    let data = vec![1, 2, 3];
    let closure = move || println!("{data:?}");
    // println!("{data:?}");  // ❌ data 已经 move 进闭包
    closure();
    
    // 闭包在 spawn 线程时常用 move:
    // std::thread::spawn(move || { /* 使用 data */ });
}

// 闭包作为参数和返回值
fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(x)
}

fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n  // 返回闭包
}

// ═══ 迭代器 (Iterator) ═══
fn iterator_demo() {
    let v = vec![1, 2, 3, 4, 5];
    
    // 迭代器是惰性的! 不消费就不计算
    let doubled: Vec<i32> = v.iter()
        .filter(|&&x| x > 2)    // 过滤: [3, 4, 5]
        .map(|&x| x * 2)        // 映射: [6, 8, 10]
        .collect();              // 收集到 Vec
    
    // 常用迭代器适配器:
    // .map()           转换每个元素
    // .filter()        过滤
    // .enumerate()     带索引
    // .zip()           合并两个迭代器
    // .chain()         连接
    // .flat_map()      展平
    // .take(n)         取前 n 个
    // .skip(n)         跳过前 n 个
    // .peekable()      可以预览下一个
    // .windows(n)      滑动窗口
    // .chunks(n)       分块
    
    // 消费者:
    // .collect()       收集到集合
    // .sum()           求和
    // .count()         计数
    // .any() / .all()  布尔判断
    // .find()          查找
    // .fold()          折叠 (reduce)
    // .for_each()      副作用
    
    // fold 示例 (类似 reduce):
    let sum = v.iter().fold(0, |acc, &x| acc + x);
    // 0 + 1 + 2 + 3 + 4 + 5 = 15
}

// ═══ 自定义迭代器 ═══
struct Counter { count: u32 }

impl Counter {
    fn new() -> Counter { Counter { count: 0 } }
}

impl Iterator for Counter {
    type Item = u32;
    fn next(&mut self) -> Option<Self::Item> {
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

// 实现 Iterator 后自动获得 70+ 个方法!
// Counter::new().zip(Counter::new().skip(1))
//               .map(|(a, b)| a * b)
//               .filter(|x| x % 3 == 0)
//               .sum::<u32>();

// ═══ 迭代器性能 ═══
// 迭代器在 Rust 中是零成本抽象!
// 编译器将链式调用展开为手写循环等效的代码
// → 没有虚函数调用
// → 没有动态分发
// → LLVM 可以完全内联优化
// → 性能 = 手写 for 循环 (甚至更好, 因为 bounds check elision)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
