import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Unsafe Rust', 'FFI 与 C 互操作', '内存布局', '实际应用'];

export default function LessonRustUnsafe() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🦀 module_06 — Unsafe 与 FFI</div>
      <div className="fs-hero">
        <h1>Unsafe Rust 与 FFI：原始指针 / C 互操作 / 内存布局</h1>
        <p>
          <code>unsafe</code> 不是"关闭安全检查"——它是<strong>你向编译器做出的安全承诺</strong>。
          你承诺在 unsafe 块中不制造未定义行为 (UB)，作为交换，编译器允许你做 5 件特殊的事。
          本模块深入 unsafe 的正确使用方式、C FFI 互操作、内存布局控制，以及如何构建
          安全的抽象来封装 unsafe 代码。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦀 Unsafe 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚠️ Unsafe 的五种超能力</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f74c00'}}></span> unsafe_rust.rs</div>
                <pre className="fs-code">{`// ═══ unsafe 允许你做的 5 件事 ═══
// 1. 解引用原始指针 (raw pointer)
// 2. 调用 unsafe 函数或方法
// 3. 访问或修改可变静态变量
// 4. 实现 unsafe trait
// 5. 访问 union 的字段

// ═══ 1. 原始指针 ═══
fn raw_pointers() {
    let mut num = 5;
    
    // 创建原始指针不需要 unsafe!
    let r1 = &num as *const i32;   // 不可变原始指针
    let r2 = &mut num as *mut i32; // 可变原始指针
    
    // 解引用需要 unsafe
    unsafe {
        println!("r1 = {}", *r1);
        *r2 = 10;
        println!("r2 = {}", *r2);
    }
    
    // 原始指针 vs 引用:
    // → 可以同时有 *const 和 *mut (引用不行!)
    // → 可以为 null (引用不行!)
    // → 不保证指向有效内存
    // → 不参与生命周期/借用检查
    // → 没有自动 drop
    
    // 创建指向任意地址的指针:
    let address = 0x012345usize;
    let _r = address as *const i32;  // 合法但解引用可能 UB!
}

// ═══ 2. 调用 unsafe 函数 ═══
unsafe fn dangerous() {
    // 整个函数体都是 unsafe 上下文
    println!("This is dangerous!");
}

fn caller() {
    unsafe {
        dangerous();
    }
}

// 安全抽象封装 unsafe:
fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();
    let ptr = values.as_mut_ptr();
    
    assert!(mid <= len);  // 前置检查保证安全!
    
    unsafe {
        (
            std::slice::from_raw_parts_mut(ptr, mid),
            std::slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
    // → 外部接口是安全的!
    // → unsafe 被限制在最小范围内
    // → 这就是 std 库的实现方式!
}

// ═══ 3. 可变静态变量 ═══
static mut COUNTER: u32 = 0;

fn add_to_count(inc: u32) {
    unsafe {
        COUNTER += inc;  // 全局可变状态 = 数据竞争风险!
    }
}
// → 多线程访问 COUNTER 是 UB!
// → 正确做法: 使用 AtomicU32 或 Mutex

// ═══ 4. unsafe trait ═══
// 实现者必须保证某种不变量
unsafe trait Trustworthy {
    fn do_thing(&self);
}

unsafe impl Trustworthy for MyType {
    fn do_thing(&self) { /* 保证不违反不变量 */ }
}

// ═══ 5. Union ═══
#[repr(C)]
union MyUnion {
    i: i32,
    f: f32,
}

fn union_demo() {
    let u = MyUnion { i: 42 };
    unsafe {
        println!("{}", u.i);  // OK
        println!("{}", u.f);  // 重新解释比特位!
    }
    // 主要用于 FFI (对应 C 的 union)
}

// ═══ 常见 UB (未定义行为) — 必须避免! ═══
// 1. 解引用 null/悬挂指针
// 2. 数据竞争 (多线程无同步的读写)
// 3. 创建无效的引用 (&T 必须对齐且非null)
// 4. 违反类型不变量 (如非UTF-8的String)
// 5. 破坏借用规则 (通过指针绕过)
// 6. 读取未初始化内存
// 7. 整数溢出 (debug 模式 panic, release 包装)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 FFI 与 C 互操作</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> ffi.rs</div>
                <pre className="fs-code">{`// ═══ 调用 C 函数 (Rust → C) ═══

// 声明外部 C 函数
extern "C" {
    fn abs(input: i32) -> i32;
    fn strlen(s: *const std::os::raw::c_char) -> usize;
    fn printf(format: *const std::os::raw::c_char, ...) -> i32;
}

fn call_c() {
    unsafe {
        println!("abs(-3) = {}", abs(-3));
    }
}

// ═══ 从 C 调用 Rust (C → Rust) ═══

// #[no_mangle] 防止 Rust 改变函数名
// extern "C" 使用 C 调用约定
#[no_mangle]
pub extern "C" fn rust_add(a: i32, b: i32) -> i32 {
    a + b
}

// C 头文件 (用 cbindgen 自动生成):
// int32_t rust_add(int32_t a, int32_t b);

// ═══ 类型映射 ═══
// Rust         → C
// i8           → int8_t
// u8           → uint8_t
// i32          → int32_t
// f64          → double
// bool         → bool (_Bool)
// *const T     → const T*
// *mut T       → T*
// &str         → ❌ 不能直接用!
// String       → ❌ 不能直接用!
//
// C 字符串: std::ffi::CString / CStr
use std::ffi::{CString, CStr};

fn string_ffi() {
    // Rust → C
    let rust_string = "Hello, C!";
    let c_string = CString::new(rust_string).unwrap();
    // CString 保证以 \\0 结尾, 内容不含 \\0
    
    unsafe {
        some_c_function(c_string.as_ptr());
    }
    
    // C → Rust
    unsafe {
        let c_ptr: *const i8 = get_string_from_c();
        let c_str = CStr::from_ptr(c_ptr);
        let rust_str: &str = c_str.to_str().unwrap();
        // 或者 to_string_lossy() 处理非 UTF-8
    }
}

// ═══ 绑定 C 库 (bindgen) ═══
// Cargo.toml:
// [build-dependencies]
// bindgen = "0.69"
// cc = "1.0"
//
// build.rs:
// fn main() {
//     // 编译 C 代码
//     cc::Build::new()
//         .file("src/mylib.c")
//         .compile("mylib");
//     
//     // 生成 Rust 绑定
//     let bindings = bindgen::Builder::default()
//         .header("src/mylib.h")
//         .generate()
//         .expect("Unable to generate bindings");
//     
//     let out_path = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap());
//     bindings
//         .write_to_file(out_path.join("bindings.rs"))
//         .expect("Couldn't write bindings");
// }
//
// src/lib.rs:
// include!(concat!(env!("OUT_DIR"), "/bindings.rs"));

// ═══ 回调函数 ═══
// C 函数接受回调:
// void register_callback(void (*cb)(int));

extern "C" {
    fn register_callback(cb: extern "C" fn(i32));
}

extern "C" fn my_callback(value: i32) {
    println!("Callback: {value}");
}

fn register() {
    unsafe {
        register_callback(my_callback);
    }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 内存布局</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> memory_layout.rs</div>
                <pre className="fs-code">{`// ═══ Rust 的默认布局 ═══
// Rust 编译器可以自由重排字段以减少填充!
struct Default { a: u8, b: u64, c: u8 }
// Rust 可能重排为: b(8) + a(1) + c(1) + padding(6) = 16
// 或优化为: b(8) + a(1) + c(1) + padding(6) = 16
// 甚至: b(8) + a(1) + c(1) = 10 (如果不需要对齐)

// ═══ #[repr(C)] — C 兼容布局 ═══
// 字段按声明顺序排列, 遵守 C 对齐规则
#[repr(C)]
struct CLayout {
    a: u8,    // offset 0, size 1
              // 7 bytes padding
    b: u64,   // offset 8, size 8
    c: u8,    // offset 16, size 1
              // 7 bytes padding
}             // total: 24 bytes (not 10!)

// 更好的排列:
#[repr(C)]
struct CLayoutOptimized {
    b: u64,   // offset 0, size 8
    a: u8,    // offset 8, size 1
    c: u8,    // offset 9, size 1
              // 6 bytes padding
}             // total: 16 bytes

// ═══ 其他 repr ═══
#[repr(transparent)]
struct Wrapper(u32);
// → 和内部类型完全相同的布局
// → 用于 newtype 模式 + FFI

#[repr(u8)]
enum Color { Red = 0, Green = 1, Blue = 2 }
// → 指定 enum 判别符的类型

#[repr(packed)]
struct Packed { a: u8, b: u64 }
// → 无填充! 大小 = 9 bytes
// → ⚠️ 可能导致未对齐访问 (某些平台 UB)

#[repr(align(64))]
struct CacheAligned { data: [u8; 64] }
// → 强制 64 字节对齐 (cache line 优化)

// ═══ 检查布局 ═══
fn check_layout() {
    use std::mem;
    
    println!("size: {}", mem::size_of::<CLayout>());     // 24
    println!("align: {}", mem::align_of::<CLayout>());   // 8
    
    // Zero-sized types (ZST):
    println!("(): {}", mem::size_of::<()>());             // 0
    println!("PhantomData: {}", mem::size_of::<std::marker::PhantomData<u64>>()); // 0
    // → ZST 不占内存, 但有类型信息!
    
    // Enum 的大小:
    println!("Option<u8>: {}", mem::size_of::<Option<u8>>());     // 2
    println!("Option<Box<T>>: {}", mem::size_of::<Option<Box<i32>>>()); // 8
    // Niche optimization: Box 不可能为 0, 所以 None = 0
    // → Option<Box<T>> 和 Box<T> 一样大!
    println!("Option<&T>: {}", mem::size_of::<Option<&i32>>());   // 8
    // 同理: &T 不可能为 null, None 用 null 表示
}

// ═══ MaybeUninit — 安全地处理未初始化内存 ═══
use std::mem::MaybeUninit;

fn init_array() -> [u32; 1000] {
    let mut array: [MaybeUninit<u32>; 1000] = 
        unsafe { MaybeUninit::uninit().assume_init() };
    
    for (i, elem) in array.iter_mut().enumerate() {
        elem.write(i as u32);  // 安全地写入
    }
    
    unsafe {
        // 所有元素都已初始化, 可以安全转换
        std::mem::transmute(array)
    }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 实际应用场景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> unsafe_practical.rs</div>
                <pre className="fs-code">{`// ═══ 场景 1: 自定义分配器 ═══
use std::alloc::{alloc, dealloc, Layout};

fn custom_alloc() {
    let layout = Layout::new::<[u8; 1024]>();
    unsafe {
        let ptr = alloc(layout);
        if ptr.is_null() { panic!("allocation failed"); }
        
        // 使用内存...
        *ptr = 42;
        
        dealloc(ptr, layout);
    }
}

// ═══ 场景 2: 侵入式链表 ═══
// 标准库中 LinkedList 每个节点堆分配
// 侵入式链表: 节点嵌入到数据结构中, 零额外分配
struct Node {
    data: i32,
    next: *mut Node,  // 原始指针
    prev: *mut Node,
}

struct IntrusiveList {
    head: *mut Node,
    tail: *mut Node,
}

impl IntrusiveList {
    fn push_front(&mut self, node: *mut Node) {
        unsafe {
            (*node).next = self.head;
            (*node).prev = std::ptr::null_mut();
            if !self.head.is_null() {
                (*self.head).prev = node;
            } else {
                self.tail = node;
            }
            self.head = node;
        }
    }
}

// ═══ 场景 3: SIMD 内在函数 ═══
#[cfg(target_arch = "x86_64")]
fn simd_add(a: &[f32; 8], b: &[f32; 8]) -> [f32; 8] {
    #[cfg(target_feature = "avx")]
    unsafe {
        use std::arch::x86_64::*;
        let va = _mm256_loadu_ps(a.as_ptr());
        let vb = _mm256_loadu_ps(b.as_ptr());
        let vc = _mm256_add_ps(va, vb);
        let mut result = [0f32; 8];
        _mm256_storeu_ps(result.as_mut_ptr(), vc);
        result
    }
}

// ═══ 场景 4: 构建安全的抽象 ═══
// unsafe 代码的最佳实践:
// 1. 最小化 unsafe 范围
// 2. 在 unsafe 上面写注释说明安全不变量
// 3. 用安全 API 封装
// 4. 用测试 + Miri 验证

// 示例: 安全的 split_at_mut 封装
pub fn split_at_mut<T>(slice: &mut [T], mid: usize) -> (&mut [T], &mut [T]) {
    let len = slice.len();
    let ptr = slice.as_mut_ptr();
    
    // SAFETY: mid <= len, 所以两个切片不重叠
    // ptr 来自有效的切片, 所以不为 null
    // 两个切片的总长度 = 原始切片长度
    assert!(mid <= len, "mid out of bounds");
    
    unsafe {
        (
            std::slice::from_raw_parts_mut(ptr, mid),
            std::slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

// ═══ Miri — unsafe 代码检测工具 ═══
// rustup +nightly component add miri
// cargo +nightly miri test
//
// Miri 能检测:
// → 越界访问
// → 使用 after free
// → 未对齐的引用
// → 无效的 enum 判别值
// → 数据竞争 (实验性)
// → 违反 Stacked Borrows (借用模型)
//
// ⚠️ Miri 不能检测:
// → 内存泄漏 (不是 UB)
// → 死锁 (不是 UB)
// → 逻辑错误`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
