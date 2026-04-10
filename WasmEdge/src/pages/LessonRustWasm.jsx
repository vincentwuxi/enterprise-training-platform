import { useState } from 'react';
import './LessonCommon.css';

const CODE_SETUP = `# ━━━━ Rust → Wasm 工具链 ━━━━

# ━━━━ 1. 环境搭建 ━━━━
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 添加 Wasm 编译目标
rustup target add wasm32-unknown-unknown

# 安装 wasm-pack（Rust→Wasm 一键工具）
cargo install wasm-pack

# 创建项目
cargo new --lib my-wasm-lib
cd my-wasm-lib

# Cargo.toml
[lib]
crate-type = ["cdylib", "rlib"]   # cdylib = 动态库（Wasm 需要）

[dependencies]
wasm-bindgen = "0.2"               # JS↔Rust 绑定
js-sys = "0.3"                     # JS 内置对象绑定
web-sys = { version = "0.3", features = ["console", "Document", "Element"] }

[profile.release]
opt-level = "z"       # 最小体积优化
lto = true            # 链接时优化
codegen-units = 1     # 单编译单元（更好优化）
strip = true          # 去除调试符号`;

const CODE_BINDGEN = `// ━━━━ wasm-bindgen：JS↔Rust 无缝桥接 ━━━━
// src/lib.rs

use wasm_bindgen::prelude::*;

// ━━━━ 1. 导出函数给 JS 调用 ━━━━
#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0u32;
            let mut b = 1u32;
            for _ in 2..=n {
                let tmp = a + b;
                a = b;
                b = tmp;
            }
            b
        }
    }
}

// ━━━━ 2. 操作 DOM ━━━━
#[wasm_bindgen]
pub fn greet(name: &str) {
    // 调用 web-sys 操作 DOM
    let window = web_sys::window().unwrap();
    let document = window.document().unwrap();
    let body = document.body().unwrap();

    let el = document.create_element("p").unwrap();
    el.set_text_content(Some(&format!("Hello from Rust, {}!", name)));
    body.append_child(&el).unwrap();
}

// ━━━━ 3. 结构体导出 ━━━━
#[wasm_bindgen]
pub struct ImageProcessor {
    width: u32,
    height: u32,
    pixels: Vec<u8>,
}

#[wasm_bindgen]
impl ImageProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        Self { width, height, pixels: vec![0; (width * height * 4) as usize] }
    }

    pub fn grayscale(&mut self) {
        for chunk in self.pixels.chunks_exact_mut(4) {
            let gray = (0.299 * chunk[0] as f64
                      + 0.587 * chunk[1] as f64
                      + 0.114 * chunk[2] as f64) as u8;
            chunk[0] = gray;
            chunk[1] = gray;
            chunk[2] = gray;
        }
    }

    pub fn pixels_ptr(&self) -> *const u8 {
        self.pixels.as_ptr()
    }
}

// ━━━━ 4. 构建 & 使用 ━━━━
// wasm-pack build --target web --release
//
// JS 中使用：
// import init, { fibonacci, ImageProcessor } from './pkg/my_wasm_lib.js';
// await init();
// console.log(fibonacci(40));  // 瞬间完成（JS 版需要数秒）
//
// const proc = new ImageProcessor(1920, 1080);
// proc.grayscale();`;

const CODE_OPTIMIZE = `# ━━━━ Wasm 体积优化（生产必做）━━━━

# ━━━━ 优化前后对比 ━━━━
# 未优化：~200KB
# 优化后：~30KB（缩小 85%+）

# ━━━━ 1. Cargo.toml 配置 ━━━━
[profile.release]
opt-level = "z"          # 体积优化（vs "3" = 速度优化）
lto = true               # Link-Time Optimization
codegen-units = 1         # 单编译单元
panic = "abort"           # 不生成 panic 展开代码
strip = true              # 去除符号表

# ━━━━ 2. 使用 wee_alloc（小分配器）━━━━
# Cargo.toml
[dependencies]
wee_alloc = "0.4"

# src/lib.rs
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
# 节省 ~10KB（替代默认的 dlmalloc）

# ━━━━ 3. wasm-opt（Binaryen 优化器）━━━━
# wasm-pack 自动调用，或手动：
wasm-opt -Oz -o output.wasm input.wasm
# -Oz = 最小体积
# -O3 = 最大速度

# ━━━━ 4. 按需导入 web-sys features ━━━━
# 不要：
# web-sys = { version = "0.3" }
# 要（只导入需要的 API）：
web-sys = { version = "0.3", features = ["Document", "Element", "HtmlCanvasElement"] }

# ━━━━ 5. 体积分析 ━━━━
cargo install twiggy
twiggy top -n 20 pkg/my_wasm_lib_bg.wasm
# 显示 Wasm 中每个函数/数据的体积占比
# 找出"大胖子"函数并优化或移除

# ━━━━ 最终产物结构 ━━━━
# pkg/
#   my_wasm_lib_bg.wasm    (~30KB, gzip 后 ~15KB)
#   my_wasm_lib.js         (JS 胶水代码)
#   my_wasm_lib.d.ts       (TypeScript 类型声明)
#   package.json           (可直接 npm publish)`;

export default function LessonRustWasm() {
  const [tab, setTab] = useState('setup');
  const tabs = [
    { key: 'setup',    label: '🔧 环境搭建', code: CODE_SETUP },
    { key: 'bindgen',  label: '🔗 wasm-bindgen', code: CODE_BINDGEN },
    { key: 'optimize', label: '📦 体积优化', code: CODE_OPTIMIZE },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="we-lesson">
      <div className="we-hero">
        <div className="we-badge">// MODULE 02 · RUST → WASM</div>
        <h1>Rust → Wasm 工具链</h1>
        <p>Rust 是 Wasm 的"最佳拍档"——<strong>零运行时、无 GC、编译后体积极小</strong>。wasm-bindgen 让 Rust 和 JS 无缝互调，wasm-pack 一键构建出可直接 npm publish 的包。</p>
      </div>

      <div className="we-section">
        <div className="we-section-title">🦀 Rust→Wasm 三步走</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`we-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="we-code-wrap">
          <div className="we-code-head">
            <div className="we-code-dot" style={{ background: '#ef4444' }} /><div className="we-code-dot" style={{ background: '#f59e0b' }} /><div className="we-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'bindgen' ? 'lib.rs' : 'setup.sh'}</span>
          </div>
          <div className="we-code">{t.code}</div>
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">📊 编译语言 → Wasm 比较</div>
        <div className="we-card" style={{ overflowX: 'auto' }}>
          <table className="we-table">
            <thead><tr><th>语言</th><th>体积</th><th>性能</th><th>工具链成熟度</th><th>推荐场景</th></tr></thead>
            <tbody>
              {[
                ['Rust', '~30KB', '最优', '★★★★★', '生产级首选'],
                ['C/C++', '~50KB', '最优', '★★★★☆', '已有 C 代码移植'],
                ['AssemblyScript', '~20KB', '好', '★★★☆☆', 'TS 开发者入门'],
                ['Go', '~2MB', '好', '★★★☆☆', 'TinyGo 改善中'],
                ['Zig', '~15KB', '优秀', '★★☆☆☆', '实验性、潜力大'],
              ].map(([lang, size, perf, maturity, rec], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{lang}</td>
                  <td><span className="we-tag cyan">{size}</span></td>
                  <td style={{ color: 'var(--we-text)' }}>{perf}</td>
                  <td style={{ color: 'var(--we-amber)' }}>{maturity}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--we-muted)' }}>{rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
