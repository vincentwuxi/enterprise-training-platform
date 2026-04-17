import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['变量与不可变性', '所有权系统', '借用与引用', '生命周期'];

export default function LessonRustBasics() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🦀 module_01 — Rust 基础</div>
      <div className="fs-hero">
        <h1>Rust 基础：所有权 / 借用 / 生命周期</h1>
        <p>
          Rust 的<strong>所有权系统 (Ownership)</strong> 是理解这门语言的关键。
          它在编译期就消除了数据竞争、悬挂指针、双重释放等内存安全问题，
          实现了<strong>零运行时开销</strong>的内存管理。本模块从变量绑定出发，
          深入 move/borrow/lifetime 三大核心概念，理解 Rust 编译器如何在不用 GC
          的前提下保证内存安全。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦀 核心所有权系统</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📌 变量与不可变性</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f74c00'}}></span> variables.rs</div>
                <pre className="fs-code">{`// ═══ Rust 变量默认不可变! ═══
fn main() {
    let x = 5;
    // x = 6;  // ❌ 编译错误! cannot assign twice to immutable variable
    
    let mut y = 5;  // mut 关键字声明可变变量
    y = 6;          // ✅ 可以修改
    
    // ═══ Shadowing (遮蔽) ≠ 可变 ═══
    let x = 5;       // 绑定 x = 5
    let x = x + 1;   // 新绑定, 遮蔽旧 x, x = 6
    let x = x * 2;   // 再次遮蔽, x = 12
    // → 每个 let 创建一个新变量, 前一个"消失"
    // → 可以改变类型! (mut 不能)
    
    let spaces = "   ";       // &str
    let spaces = spaces.len(); // usize — 类型改变了!
    
    // ═══ 常量 vs 不可变变量 ═══
    const MAX_POINTS: u32 = 100_000;  // 编译期求值
    // → 类型注解必须写
    // → 必须是编译期常量表达式
    // → 全局作用域有效, 不可 shadow
}

// ═══ 基本类型 (Copy 语义) ═══
// 整数: i8, i16, i32, i64, i128, isize
//       u8, u16, u32, u64, u128, usize
// 浮点: f32, f64
// 布尔: bool (true, false)
// 字符: char (4 bytes, Unicode scalar)
// 元组: (i32, f64, bool)
// 数组: [i32; 5]  (固定长度)

// ═══ 类型推断 ═══
fn type_inference() {
    let guess: u32 = "42".parse().expect("Not a number!");
    // 如果不写 :u32, 编译器不知道 parse 成什么类型
    
    let v = vec![1, 2, 3]; // Vec<i32>, 编译器推断
    let v: Vec<f64> = vec![1.0, 2.0]; // 显式指定

    // 元组解构
    let tup = (500, 6.4, 'a');
    let (x, y, z) = tup;  // 模式解构
    let first = tup.0;     // 索引访问
    
    // 数组 vs Vec
    let arr = [3; 5];    // [3, 3, 3, 3, 3], 栈上, 固定长度
    let v = vec![3; 5];  // 堆上, 动态长度
}

// ═══ 函数与表达式 ═══
fn add_one(x: i32) -> i32 {
    x + 1  // 最后一个表达式就是返回值, 不加分号!
    // 等价于 return x + 1;
}

// Rust 是表达式语言: if/match/block 都有返回值
fn expression_demo() {
    let y = {
        let x = 3;
        x + 1  // 块表达式的值 = 最后一个表达式
    }; // y = 4
    
    let condition = true;
    let number = if condition { 5 } else { 6 }; // if 是表达式!
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔑 所有权系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#b7410e'}}></span> ownership.rs</div>
                <pre className="fs-code">{`// ═══ 所有权三大规则 ═══
// 1. Rust 中每个值有且仅有一个 "所有者" (owner)
// 2. 同一时刻只能有一个所有者
// 3. 当所有者离开作用域, 值被自动释放 (drop)

fn ownership_demo() {
    // ─── 栈上数据: Copy ───
    let x = 5;
    let y = x;  // Copy! x 和 y 都是 5, 都有效
    println!("{x}, {y}");  // ✅ 都能用

    // ─── 堆上数据: Move ───
    let s1 = String::from("hello");
    let s2 = s1;  // Move! s1 的所有权转移给 s2
    // println!("{s1}");  // ❌ 编译错误! value used after move
    println!("{s2}");  // ✅ s2 是新的所有者
}

// ═══ 内存布局: String 的 Move ═══
//
// 栈上:              堆上:
// s1: [ptr|len|cap]  → [ h | e | l | l | o ]
//      │   5    5
// 
// s2 = s1 (Move):
// s1: [无效]         
// s2: [ptr|len|cap]  → [ h | e | l | l | o ]
//      │   5    5
//
// → 不是深拷贝! 只是栈上的指针/长度/容量被复制
// → s1 被标记为无效, 防止 double free!

fn move_semantics() {
    // ─── 函数参数也是 move ───
    let s = String::from("hello");
    takes_ownership(s);     // s 的所有权 move 到函数内
    // println!("{s}");     // ❌ s 已经无效

    // ─── 函数返回值也转移所有权 ───
    let s2 = gives_ownership();  // 所有权从函数 move 出来
    let s3 = String::from("world");
    let s4 = takes_and_gives_back(s3);  // s3 进去, s4 出来
}

fn takes_ownership(s: String) {
    println!("{s}");
}   // s 离开作用域, drop() 被调用, 内存释放

fn gives_ownership() -> String {
    String::from("yours")  // 所有权转移给调用者
}

fn takes_and_gives_back(s: String) -> String {
    s   // 原封不动返回 (所有权转移)
}

// ═══ Clone: 深拷贝 ═══
fn clone_demo() {
    let s1 = String::from("hello");
    let s2 = s1.clone();  // 深拷贝! 堆上数据也复制
    println!("{s1}, {s2}"); // ✅ 都有效
    // → clone 是显式的, 提醒你 "这里有性能开销"
}

// ═══ Copy trait ═══
// 实现了 Copy 的类型, 赋值时自动复制而不是 move
// 规则: 如果类型或其部分实现了 Drop, 就不能实现 Copy
//
// 自动 Copy 的类型:
// → 所有整数/浮点/布尔/字符类型
// → 元组 (如果所有元素都 Copy): (i32, bool) ✓
// → 引用 &T 是 Copy (但 &mut T 不是!)
// → 数组 [T; N] (如果 T 是 Copy)
//
// 不是 Copy 的:
// → String, Vec<T>, Box<T>, HashMap<K,V>
// → 任何拥有堆内存的类型`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 借用与引用</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> borrowing.rs</div>
                <pre className="fs-code">{`// ═══ 引用 (Reference) = 借用 (Borrow) ═══
// 不转移所有权, 只"借用"数据
// → 类似 C 的指针, 但编译器保证安全!

fn borrow_demo() {
    let s = String::from("hello");
    let len = calculate_length(&s);  // 传引用, 不转移所有权
    println!("'{s}' length = {len}"); // ✅ s 仍然有效!
}

fn calculate_length(s: &String) -> usize {
    s.len()
    // 注意: s 是借用的, 不能修改!
    // s.push_str("x"); // ❌ cannot borrow as mutable
}   // s 离开作用域, 但它不拥有所有权, 所以不 drop

// ═══ 可变引用 ═══
fn mutable_ref() {
    let mut s = String::from("hello");
    change(&mut s);  // 可变借用
    println!("{s}");  // "hello, world"
}

fn change(s: &mut String) {
    s.push_str(", world");  // ✅ 可以修改
}

// ═══ 借用规则 (Borrow Checker 核心) ═══
//
// 在任意给定时间, 你只能拥有以下之一:
// 1. 一个可变引用 (&mut T)
// 2. 任意数量的不可变引用 (&T)
//
// → 不能同时存在 &mut T 和 &T !

fn borrow_rules() {
    let mut s = String::from("hello");
    
    // ✅ 多个不可变引用
    let r1 = &s;
    let r2 = &s;
    println!("{r1}, {r2}");  // OK, 都是只读
    
    // ✅ r1, r2 不再使用后, 可以创建 &mut
    let r3 = &mut s;   // NLL (Non-Lexical Lifetimes) 允许!
    println!("{r3}");
    
    // ❌ 不可变引用和可变引用不能共存
    // let r1 = &s;
    // let r2 = &mut s;  // 编译错误! cannot borrow as mutable
    // println!("{r1}, {r2}");
}

// ═══ 悬挂引用 — Rust 编译器阻止! ═══
// fn dangle() -> &String {
//     let s = String::from("hello");
//     &s   // ❌ s 在函数结束时被释放, 引用悬挂!
// }        // 编译器: "this function's return type contains 
//          //  a borrowed value, but there is no value to borrow from"
// 
// 正确做法: 返回所有权
fn no_dangle() -> String {
    let s = String::from("hello");
    s   // ✅ 所有权转移给调用者
}

// ═══ 切片 (Slice) — 引用的一种 ═══
fn slice_demo() {
    let s = String::from("hello world");
    
    let hello: &str = &s[0..5];   // 字符串切片
    let world: &str = &s[6..11];
    // &str 就是 String 的切片类型!
    // 字符串字面量 "hello" 的类型就是 &str
    
    // 切片保证原始数据不被修改:
    let mut s = String::from("hello world");
    let word = first_word(&s);  // 不可变借用
    // s.clear();  // ❌ 错误! 可变借用与不可变借用冲突
    println!("{word}");
    
    // 数组切片
    let a = [1, 2, 3, 4, 5];
    let slice: &[i32] = &a[1..3];  // [2, 3]
}

fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &byte) in bytes.iter().enumerate() {
        if byte == b' ' {
            return &s[..i];
        }
    }
    &s[..]
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⏳ 生命周期</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> lifetimes.rs</div>
                <pre className="fs-code">{`// ═══ 生命周期 = 引用的有效作用域 ═══
// 每个引用都有一个生命周期
// 大多数时候编译器可以推断 (lifetime elision)
// 有时需要手动标注, 告诉编译器引用之间的关系

// ═══ 为什么需要生命周期标注? ═══

// 这个函数会编译失败:
// fn longest(x: &str, y: &str) -> &str {
//     if x.len() > y.len() { x } else { y }
// }
// 错误: missing lifetime specifier
// → 编译器不知道返回值的生命周期和哪个参数一样长!

// ═══ 生命周期标注语法 ═══
// 'a 是生命周期参数 (惯例: 'a, 'b, 'c)
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
// 含义: 返回值的生命周期 = x 和 y 中较短的那个

fn lifetime_usage() {
    let string1 = String::from("long string");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
        println!("longest: {result}"); // ✅ 在 string2 作用域内
    }
    // println!("{result}"); // ❌ string2 已经无效!
    // result 的生命周期 = min('string1, 'string2) = 'string2
}

// ═══ 结构体中的生命周期 ═══
// 如果结构体包含引用, 必须标注生命周期
struct ImportantExcerpt<'a> {
    part: &'a str,  // 结构体不能活得比 part 引用的数据久
}

fn struct_lifetime() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt { part: first_sentence };
    // i 的生命周期 ≤ novel 的生命周期 ✓
    println!("{}", i.part);
}

// ═══ 生命周期省略规则 (Elision Rules) ═══
// 编译器在三种情况下自动推断,无需手动标注:
//
// 规则 1: 每个引用参数获得独立的生命周期
//   fn f(x: &str) → fn f<'a>(x: &'a str)
//   fn f(x: &str, y: &str) → fn f<'a, 'b>(x: &'a str, y: &'b str)
//
// 规则 2: 如果恰好一个输入生命周期, 赋给所有输出
//   fn f(x: &str) -> &str → fn f<'a>(x: &'a str) -> &'a str
//
// 规则 3: 如果是方法 (&self 或 &mut self), self 的生命周期赋给输出
//   fn method(&self, s: &str) -> &str → 返回值的生命周期 = self

// ═══ 'static 生命周期 ═══
// 整个程序运行期间都有效
let s: &'static str = "I live forever";
// 字符串字面量都是 'static, 因为编译进了二进制
// → 谨慎使用! 大多数时候你不需要 'static

// ═══ 综合例子: 泛型 + Trait + 生命周期 ═══
use std::fmt::Display;

fn longest_with_announce<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: Display,
{
    println!("Announcement: {ann}");
    if x.len() > y.len() { x } else { y }
}

// ═══ 常见生命周期误区 ═══
// 
// ❌ "生命周期标注延长了引用的生命周期"
// ✅ 生命周期标注只是告诉编译器引用之间的关系
//    它不改变任何值的实际生命周期!
//
// ❌ "'a 是一个具体的时间段"
// ✅ 'a 是一个泛型参数, 由调用者决定具体范围
//
// ❌ "到处写 'static 就安全了"
// ✅ 'static 通常意味着内存泄漏, 除非数据确实需要永久存活`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
