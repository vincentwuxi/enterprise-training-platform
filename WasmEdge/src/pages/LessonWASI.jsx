import './LessonCommon.css';

const CODE = `// ━━━━ WASI：WebAssembly System Interface ━━━━
// WASI = 让 Wasm 在浏览器之外运行的系统接口标准

// ━━━━ 核心问题 ━━━━
// Wasm 在浏览器里很好用 → 但浏览器外呢？
// 服务器、边缘、CLI 工具都需要文件/网络/时钟等系统能力
// WASI = 标准化的"系统调用"接口

// ━━━━ 1. WASI 提供的能力 ━━━━
// wasi:filesystem/filesystem    → 文件读写（沙箱隔离）
// wasi:sockets/tcp              → TCP 连接
// wasi:clocks/monotonic-clock   → 时间获取
// wasi:random/random            → 随机数生成
// wasi:cli/stdin / stdout       → 标准 I/O

// ━━━━ 2. Rust 编写 WASI 程序 ━━━━
// main.rs — 一个简单的 WASI CLI 工具
use std::fs;
use std::io;

fn main() {
    // 读取文件（WASI 运行时控制其可以访问哪些目录）
    let content = fs::read_to_string("/data/input.txt")
        .expect("Failed to read file");

    let word_count = content.split_whitespace().count();
    println!("Word count: {}", word_count);

    // 写入结果
    fs::write("/data/output.txt", format!("{}", word_count))
        .expect("Failed to write");
}

// 编译：
// rustup target add wasm32-wasip1
// cargo build --target wasm32-wasip1 --release

// 运行（Wasmtime）：
// wasmtime --dir /data::./local-data target/wasm32-wasip1/release/word_count.wasm
// --dir 参数：只授权 /data 目录（沙箱！）

// ━━━━ 3. WASI 运行时对比 ━━━━
// ┌──────────────┬────────────┬──────────┬──────────────────┐
// │ 运行时       │ 启动时间   │ 定位     │ 适用场景         │
// ├──────────────┼────────────┼──────────┼──────────────────┤
// │ Wasmtime     │ ~1ms       │ 标准实现 │ 服务端、CLI      │
// │ Wasmer       │ ~1ms       │ 通用     │ 包管理(WAPM)     │
// │ WasmEdge     │ <1ms      │ 轻量     │ 边缘/IoT/K8s     │
// │ wazero       │ <1ms      │ Go 纯实现│ Go 应用嵌入      │
// │ Node.js WASI │ ~5ms       │ Node 内置│ Node 应用扩展    │
// └──────────────┴────────────┴──────────┴──────────────────┘

// ━━━━ 4. Component Model（下一代 Wasm）━━━━
// 问题：当前的 Wasm 模块只能传递数字
// 解决：Component Model 定义了丰富的类型接口（WIT）

// example.wit（接口定义语言）
// package mycompany:image-processor@1.0.0;
//
// interface process {
//   record image { width: u32, height: u32, data: list<u8> }
//   grayscale: func(input: image) -> image;
//   resize: func(input: image, new-width: u32, new-height: u32) -> image;
// }
//
// world image-world {
//   export process;
// }

// Component Model 的意义：
// 1. 跨语言组合：Rust 组件 + Go 组件 + Python 组件 → 一个应用
// 2. 类型安全：WIT 定义接口 → 编译时检查
// 3. 安全沙箱：每个组件只能访问被授权的能力`;

export default function LessonWASI() {
  return (
    <div className="we-lesson">
      <div className="we-hero">
        <div className="we-badge">// MODULE 04 · WASI</div>
        <h1>WASI 系统接口</h1>
        <p>Docker 创始人 Solomon Hykes 说：<strong>"如果 2008 年就有 WASM+WASI，我们根本不需要发明 Docker"</strong>。WASI 让 Wasm 从浏览器走向服务器、边缘、IoT，成为真正的"一次编译，到处运行"。</p>
      </div>

      <div className="we-section">
        <div className="we-section-title">🔌 WASI 核心概念</div>
        <div className="we-code-wrap">
          <div className="we-code-head">
            <div className="we-code-dot" style={{ background: '#ef4444' }} /><div className="we-code-dot" style={{ background: '#f59e0b' }} /><div className="we-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>wasi.rs</span>
          </div>
          <div className="we-code">{CODE}</div>
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">🔒 Wasm 安全模型 vs 容器</div>
        <div className="we-grid-3">
          {[
            { name: 'Docker 容器', iso: '内核命名空间隔离', startup: '~300ms', size: '~100MB', color: '#38bdf8' },
            { name: 'Wasm (WASI)', iso: '沙箱（Capability-based）', startup: '<1ms', size: '~50KB', color: '#06b6d4' },
            { name: '原生进程', iso: '进程级隔离', startup: '~10ms', size: '~10MB', color: 'var(--we-muted)' },
          ].map((c, i) => (
            <div key={i} className="we-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.88rem', marginBottom: '0.5rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--we-muted)', marginBottom: '0.2rem' }}>🔒 {c.iso}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--we-muted)', marginBottom: '0.2rem' }}>⚡ 启动：{c.startup}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--we-muted)' }}>📦 体积：{c.size}</div>
            </div>
          ))}
        </div>
        <div className="we-tip">💡 <strong>Capability-based Security</strong>：WASI 不给程序"root 权限"，而是显式授权每项能力。程序只能访问被传入的文件句柄/网络地址——没有"全局文件系统"概念。这比 Linux 容器更安全。</div>
      </div>
    </div>
  );
}
