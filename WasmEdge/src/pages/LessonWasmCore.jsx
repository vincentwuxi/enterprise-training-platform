import './LessonCommon.css';

const CODE = `// ━━━━ WebAssembly 核心概念 ━━━━

// ━━━━ 1. 什么是 WebAssembly？━━━━
// Wasm = 浏览器的"第二编程语言"（JS 之外）
// 特点：
// - 二进制格式（.wasm）：体积小，加载快
// - 接近原生性能：编译后直接在虚拟机执行
// - 安全沙箱：无法直接访问 DOM/文件系统/网络
// - 多语言支持：Rust/C/C++/Go/AssemblyScript → Wasm

// ━━━━ 2. WAT（WebAssembly Text Format）━━━━
// 人类可读的 Wasm 文本格式（S-expression）
(module
  ;; 函数类型声明
  (type (func (param i32 i32) (result i32)))

  ;; 导出一个加法函数
  (func (export "add") (param i32 i32) (result i32)
    local.get 0    ;; 取第一个参数
    local.get 1    ;; 取第二个参数
    i32.add        ;; 整数加法
  )

  ;; 线性内存：256 页（16MB）
  (memory (export "memory") 256)

  ;; 全局变量
  (global (export "counter") (mut i32) (i32.const 0))
)

// ━━━━ 3. JavaScript 加载 Wasm ━━━━
// 方式 1：instantiateStreaming（推荐：流式编译）
const response = await fetch('/module.wasm');
const { instance } = await WebAssembly.instantiateStreaming(response, {
  env: {
    // 导入 JS 函数给 Wasm 调用
    consoleLog: (value) => console.log('Wasm says:', value),
  },
});
const result = instance.exports.add(40, 2); // 42

// 方式 2：compile + instantiate（分步）
const module = await WebAssembly.compileStreaming(fetch('/module.wasm'));
const instance2 = await WebAssembly.instantiate(module, imports);

// ━━━━ 4. 线性内存（Linear Memory）━━━━
// Wasm 的内存 = 一个可增长的 ArrayBuffer
const memory = instance.exports.memory;
const view = new Uint8Array(memory.buffer);

// JS 和 Wasm 共享同一块内存！
// 这是 JS↔Wasm 传递复杂数据（字符串/数组/结构体）的唯一方式
view[0] = 72;  // 'H'
view[1] = 101; // 'e'
view[2] = 108; // 'l'

// 字符串传递：JS 写入内存 → 告诉 Wasm 指针和长度
instance.exports.processString(0, 3);

// ━━━━ 5. 四种数据类型 ━━━━
// i32：32 位整数（最常用）
// i64：64 位整数
// f32：32 位浮点
// f64：64 位浮点
// 注意：没有字符串/数组类型！必须通过线性内存传递`;

export default function LessonWasmCore() {
  return (
    <div className="we-lesson">
      <div className="we-hero">
        <div className="we-badge">// MODULE 01 · WEBASSEMBLY CORE</div>
        <h1>WebAssembly 核心</h1>
        <p>WebAssembly 是浏览器的"第二引擎"——<strong>C/Rust 编写的代码以接近原生的速度在浏览器沙箱中运行</strong>。Figma、Google Earth、Photoshop Web 版都在用它。理解线性内存、模块和二进制格式是一切的基础。</p>
      </div>

      <div className="we-section">
        <div className="we-section-title">⚙️ Wasm 核心概念</div>
        <div className="we-code-wrap">
          <div className="we-code-head">
            <div className="we-code-dot" style={{ background: '#ef4444' }} /><div className="we-code-dot" style={{ background: '#f59e0b' }} /><div className="we-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>wasm-core.wat</span>
          </div>
          <div className="we-code">{CODE}</div>
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">📊 Wasm vs JavaScript 性能</div>
        <div className="we-grid-4">
          {[
            { v: '10-30x', l: '计算密集任务加速比', color: 'var(--we-cyan)' },
            { v: '<1ms', l: '冷启动时间', color: 'var(--we-magenta)' },
            { v: '~50KB', l: '典型 Wasm 模块体积', color: 'var(--we-sky)' },
            { v: '4GB', l: '线性内存上限（32-bit）', color: 'var(--we-green)' },
          ].map((s, i) => (
            <div key={i} className="we-metric">
              <div className="we-metric-val" style={{ color: s.color, fontSize: '1.3rem' }}>{s.v}</div>
              <div className="we-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">🏗️ Wasm 架构四要素</div>
        <div className="we-grid-2">
          {[
            { name: '模块（Module）', desc: '编译后的 .wasm 二进制文件。可以被缓存、共享、多次实例化。类似于一个"可执行文件"。', color: '#06b6d4' },
            { name: '实例（Instance）', desc: '模块的运行时实例。包含导出的函数、内存、全局变量。每个实例可以有不同的导入。', color: '#d946ef' },
            { name: '线性内存（Memory）', desc: '一段连续的、可增长的字节数组。JS 和 Wasm 共享同一块内存，通过 ArrayBuffer 交互。', color: '#38bdf8' },
            { name: '表（Table）', desc: '存储函数引用的数组。用于间接函数调用（类似 C 的函数指针表），是实现动态分发的机制。', color: '#14b8a6' },
          ].map((e, i) => (
            <div key={i} className="we-card" style={{ borderTop: `3px solid ${e.color}` }}>
              <div style={{ fontWeight: 700, color: e.color, fontSize: '0.88rem', marginBottom: '0.4rem' }}>{e.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--we-muted)', lineHeight: 1.65 }}>{e.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
