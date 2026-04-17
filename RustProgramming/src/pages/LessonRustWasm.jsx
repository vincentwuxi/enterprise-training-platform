import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Wasm 基础', 'wasm-bindgen', 'wasm-pack 工程化', '性能优化'];

export default function LessonRustWasm() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🦀 module_07 — WebAssembly</div>
      <div className="fs-hero">
        <h1>WebAssembly：wasm-bindgen / wasm-pack / 浏览器集成</h1>
        <p>
          Rust 编译到 WebAssembly 可以在浏览器中获得<strong>接近原生的性能</strong>。
          wasm-bindgen 自动生成 JS 胶水代码，wasm-pack 提供完整的工具链。
          本模块从 Wasm 字节码的内存模型出发，深入 Rust→Wasm 的编译流程、
          JS 互操作、DOM 操作，以及图像处理 / 游戏引擎等真实性能优化场景。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦀 WebAssembly 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 Wasm 基础架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f74c00'}}></span> wasm_basics.rs</div>
                <pre className="fs-code">{`// ═══ WebAssembly 是什么? ═══
// 二进制指令格式, 在浏览器沙盒中以接近原生速度运行
// → 不是替代 JavaScript, 是补充!
// → 适合 CPU 密集型: 图像处理、加密、物理引擎、编解码
// → 不适合: DOM 操作、网络 I/O (用 JS 更合适)

// ═══ Wasm 内存模型 ═══
//
// ┌───────────────────────────────────────┐
// │           浏览器 (V8/SpiderMonkey)     │
// │                                       │
// │  ┌─────────────┐  ┌──────────────┐   │
// │  │  JavaScript │←→│  Wasm Module  │   │
// │  │   Heap      │  │              │   │
// │  │             │  │ ┌──────────┐ │   │
// │  │             │  │ │ Linear   │ │   │
// │  │             │  │ │ Memory   │ │   │
// │  │             │  │ │ (连续的  │ │   │
// │  │             │  │ │  字节数组)│ │   │
// │  │             │  │ └──────────┘ │   │
// │  └─────────────┘  └──────────────┘   │
// └───────────────────────────────────────┘
//
// Linear Memory:
// → 连续的字节数组 (ArrayBuffer)
// → 初始大小和最大大小可配置
// → 以 64KB 为单位增长 (page)
// → JS 和 Wasm 可以共享读写!

// ═══ Rust → Wasm 编译目标 ═══
// wasm32-unknown-unknown  — 纯 Wasm, 无 OS 依赖
// wasm32-wasi             — WASI (服务端 Wasm)
//
// 安装:
// rustup target add wasm32-unknown-unknown
//
// 编译:
// cargo build --target wasm32-unknown-unknown --release
//
// 输出: target/wasm32-unknown-unknown/release/mylib.wasm

// ═══ 最简 Wasm 导出 ═══
// lib.rs:
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}

// JavaScript 加载:
// const response = await fetch('mylib.wasm');
// const buffer = await response.arrayBuffer();
// const { instance } = await WebAssembly.instantiate(buffer);
// console.log(instance.exports.add(2, 3)); // 5

// ═══ Wasm 的限制 ═══
// 1. 只支持 4 种值类型: i32, i64, f32, f64
//    → String, Vec, struct 需要通过 Linear Memory 传递
// 2. 不能直接访问 DOM, Web API
//    → 需要通过 JS 桥接
// 3. 无系统调用 (文件、网络)
//    → WASI 提供标准化系统接口
// 4. 单线程 (SharedArrayBuffer + Web Workers 实现多线程)

// ═══ Wasm 大小优化 ═══
// Cargo.toml:
// [profile.release]
// opt-level = 'z'       # 优化大小而非速度
// lto = true            # Link-Time Optimization
// codegen-units = 1     # 单编译单元, 更好优化
// panic = 'abort'       # 不需要 unwinding
// strip = true          # 去除调试信息
//
// 额外工具:
// wasm-opt -Oz -o out.wasm in.wasm  (Binaryen 工具)
// → 通常可以再减少 10-20% 大小`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 wasm-bindgen 互操作</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> wasm_bindgen.rs</div>
                <pre className="fs-code">{`// ═══ wasm-bindgen — Rust ↔ JS 高效绑定 ═══
// Cargo.toml:
// [lib]
// crate-type = ["cdylib"]
//
// [dependencies]
// wasm-bindgen = "0.2"

use wasm_bindgen::prelude::*;

// ═══ 导出函数给 JS ═══
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

// JS 中使用:
// import { greet } from './pkg/mylib';
// console.log(greet("Rust")); // "Hello, Rust!"

// ═══ 导入 JS 函数到 Rust ═══
#[wasm_bindgen]
extern "C" {
    // 调用 JS 的 alert
    fn alert(s: &str);
    
    // 调用 console.log
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    
    // 调用 performance.now()
    #[wasm_bindgen(js_namespace = performance)]
    fn now() -> f64;
}

#[wasm_bindgen]
pub fn benchmark() {
    let start = now();
    // ... 计算 ...
    let elapsed = now() - start;
    log(&format!("Elapsed: {elapsed}ms"));
}

// ═══ 导出结构体 ═══
#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<u8>,
}

#[wasm_bindgen]
impl Universe {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Universe {
        Universe {
            width,
            height,
            cells: vec![0; (width * height) as usize],
        }
    }
    
    pub fn width(&self) -> u32 { self.width }
    pub fn height(&self) -> u32 { self.height }
    
    // 返回指向 Linear Memory 的指针
    pub fn cells_ptr(&self) -> *const u8 {
        self.cells.as_ptr()
    }
    
    pub fn tick(&mut self) {
        // 更新 cells...
    }
}

// JS 中使用:
// const universe = new Universe(64, 64);
// universe.tick();
//
// // 直接读取 Wasm 内存 (零拷贝!)
// const ptr = universe.cells_ptr();
// const cells = new Uint8Array(
//     wasm.memory.buffer, ptr, 64 * 64
// );

// ═══ web-sys — 浏览器 API 绑定 ═══
// Cargo.toml:
// [dependencies]
// web-sys = { version = "0.3", features = [
//     "Document", "Element", "HtmlElement", "Window",
//     "CanvasRenderingContext2d", "HtmlCanvasElement",
// ]}

use web_sys::{Document, HtmlCanvasElement};

#[wasm_bindgen]
pub fn draw_on_canvas() -> Result<(), JsValue> {
    let window = web_sys::window().unwrap();
    let document = window.document().unwrap();
    let canvas = document.get_element_by_id("canvas").unwrap();
    let canvas: HtmlCanvasElement = canvas.dyn_into()?;
    let ctx = canvas.get_context("2d")?.unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()?;
    
    ctx.set_fill_style(&"rgb(200, 0, 0)".into());
    ctx.fill_rect(10.0, 10.0, 50.0, 50.0);
    
    Ok(())
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 wasm-pack 工程化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> wasm_pack.txt</div>
                <pre className="fs-code">{`# ═══ wasm-pack 工作流 ═══
# 一站式工具: 编译 + 绑定生成 + npm 包打包

# 安装:
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 创建项目:
cargo generate --git https://github.com/rustwasm/wasm-pack-template
# 或手动:
# cargo init --lib my-wasm-lib

# 构建 (输出到 pkg/ 目录):
wasm-pack build --target web       # ES 模块 (浏览器)
wasm-pack build --target bundler   # Webpack/Vite
wasm-pack build --target nodejs    # Node.js
wasm-pack build --target no-modules # 全局 <script>

# ═══ 输出结构 ═══
# pkg/
# ├── mylib_bg.wasm         ← Wasm 二进制
# ├── mylib_bg.wasm.d.ts    ← TypeScript 类型
# ├── mylib.js              ← JS 胶水代码
# ├── mylib.d.ts            ← 导出函数类型
# └── package.json          ← npm 包描述

# ═══ 在 React/Vite 中使用 ═══
# 1. wasm-pack build --target web
# 2. 在 React 项目中:

# import init, { greet, Universe } from '../pkg/mylib';
#
# useEffect(() => {
#   init().then(() => {
#     console.log(greet("React"));
#     const universe = new Universe(128, 128);
#     // 渲染循环...
#   });
# }, []);

# ═══ 与 Vite 集成 ═══
# npm install vite-plugin-wasm
# npm install vite-plugin-top-level-await
#
# vite.config.ts:
# import wasm from 'vite-plugin-wasm';
# import topLevelAwait from 'vite-plugin-top-level-await';
#
# export default defineConfig({
#   plugins: [wasm(), topLevelAwait()],
# });
#
# 然后可以直接 import:
# import { greet } from 'my-wasm-lib';

# ═══ 测试 ═══
wasm-pack test --chrome --headless  # 浏览器测试
wasm-pack test --node               # Node.js 测试

# src/lib.rs:
# #[cfg(test)]
# mod tests {
#     use wasm_bindgen_test::*;
#     wasm_bindgen_test_configure!(run_in_browser);
#
#     #[wasm_bindgen_test]
#     fn test_greet() {
#         assert_eq!(greet("test"), "Hello, test!");
#     }
# }

# ═══ 发布到 npm ═══
wasm-pack login
wasm-pack publish`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 性能优化实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> wasm_perf.rs</div>
                <pre className="fs-code">{`// ═══ 性能优化原则 ═══
// 1. 减少 JS ↔ Wasm 边界调用
// 2. 使用 Linear Memory 批量传输数据
// 3. 避免不必要的拷贝

// ═══ 案例: 图像处理 ═══
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ImageProcessor {
    width: u32,
    height: u32,
    pixels: Vec<u8>,  // RGBA, 4 bytes per pixel
}

#[wasm_bindgen]
impl ImageProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            width, height,
            pixels: vec![0; (width * height * 4) as usize],
        }
    }
    
    pub fn pixels_ptr(&self) -> *const u8 { self.pixels.as_ptr() }
    pub fn pixels_mut_ptr(&mut self) -> *mut u8 { self.pixels.as_mut_ptr() }
    
    // 灰度化 — 在 Wasm 内部完成, 不跨边界
    pub fn grayscale(&mut self) {
        for chunk in self.pixels.chunks_exact_mut(4) {
            let gray = (0.299 * chunk[0] as f64
                      + 0.587 * chunk[1] as f64
                      + 0.114 * chunk[2] as f64) as u8;
            chunk[0] = gray; // R
            chunk[1] = gray; // G
            chunk[2] = gray; // B
            // Alpha 不变
        }
    }
    
    // 高斯模糊
    pub fn blur(&mut self, radius: u32) {
        let w = self.width as usize;
        let h = self.height as usize;
        let mut output = vec![0u8; self.pixels.len()];
        
        // 两次 1D 模糊 (水平 + 垂直), O(n*r) → O(n)
        // ... 高效实现 ...
        
        self.pixels = output;
    }
}

// JS 中使用 (零拷贝!):
// const processor = new ImageProcessor(canvas.width, canvas.height);
// 
// // 将 Canvas 数据写入 Wasm 内存
// const imageData = ctx.getImageData(0, 0, w, h);
// const wasmPtr = processor.pixels_mut_ptr();
// const wasmMem = new Uint8Array(wasm.memory.buffer, wasmPtr, w*h*4);
// wasmMem.set(imageData.data);
//
// // 在 Wasm 中处理 (快!)
// processor.grayscale();
// processor.blur(3);
//
// // 直接从 Wasm 内存读回 (零拷贝!)
// const resultPtr = processor.pixels_ptr();
// const result = new Uint8ClampedArray(wasm.memory.buffer, resultPtr, w*h*4);
// const newImageData = new ImageData(result, w, h);
// ctx.putImageData(newImageData, 0, 0);

// ═══ 性能对比 (1920x1080 图像) ═════
//
// 操作          │ JS (V8)   │ Wasm (Rust)│ 加速比
// ─────────────┼───────────┼───────────┼────────
// 灰度化       │ 12ms      │ 3ms       │ 4x
// 高斯模糊 r=5 │ 180ms     │ 28ms      │ 6.4x
// 边缘检测     │ 45ms      │ 8ms       │ 5.6x
// Mandelbrot   │ 850ms     │ 95ms      │ 8.9x
//
// 关键因素:
// → Wasm 有 SIMD 支持 (128-bit)
// → 无 GC 暂停
// → 可预测的内存布局
// → LLVM 深度优化

// ═══ WASI — 服务端 WebAssembly ═══
// WebAssembly System Interface — 标准化系统调用
//
// 安装: rustup target add wasm32-wasi
// 编译: cargo build --target wasm32-wasi
// 运行: wasmtime target/wasm32-wasi/debug/myapp.wasm
//
// 用途:
// → 沙盒化执行不可信代码
// → 跨平台分发 (Write once, run anywhere)
// → 边缘计算 (Cloudflare Workers, Fastly)
// → 插件系统 (替代 Lua/Python)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
