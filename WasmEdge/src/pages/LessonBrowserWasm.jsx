import './LessonCommon.css';

const CODE = `// ━━━━ 浏览器 Wasm 实战案例 ━━━━

// ━━━━ 1. 图像处理（Canvas → Wasm → Canvas）━━━━
// 思路：将 Canvas 像素数据传入 Wasm 内存，处理后写回

async function processImage(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;  // Uint8ClampedArray (RGBA)

  // 获取 Wasm 内存视图
  const wasmMemory = new Uint8Array(wasm.memory.buffer);

  // 复制像素到 Wasm 内存
  const ptr = wasm.alloc(pixels.length);
  wasmMemory.set(pixels, ptr);

  // 在 Wasm 中执行灰度转换（比 JS 快 10-30x）
  wasm.grayscale(ptr, pixels.length);

  // 读取结果
  imageData.data.set(wasmMemory.subarray(ptr, ptr + pixels.length));
  ctx.putImageData(imageData, 0, 0);
  wasm.dealloc(ptr, pixels.length);
}

// ━━━━ 2. SQLite in Browser（sql.js）━━━━
// SQLite 的 C 源码编译为 Wasm → 浏览器中运行完整 SQLite 数据库
import initSqlJs from 'sql.js';

const SQL = await initSqlJs({
  locateFile: f => \`https://sql.js.org/dist/\${f}\`
});
const db = new SQL.Database();

db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");
db.run("INSERT INTO users VALUES (1, 'Alice', 'alice@example.com')");

const results = db.exec("SELECT * FROM users WHERE name LIKE '%Ali%'");
console.log(results[0].values);  // [[1, 'Alice', 'alice@example.com']]

// 导出/导入数据库文件
const data = db.export();  // Uint8Array
const blob = new Blob([data], { type: 'application/x-sqlite3' });

// ━━━━ 3. 加密/哈希（比 JS 实现快 5x）━━━━
// 使用 Rust 的 sha2 crate 编译为 Wasm
import init, { sha256_hash } from './sha256-wasm/pkg';
await init();

const hash = sha256_hash("Hello, WebAssembly!");
// "5e2bf57d3f40c4b6df69daf1936cb766f832374b4fc0259a7cbff06e2f7f458c"
// 大文件哈希比 Web Crypto API 更灵活（支持流式处理）

// ━━━━ 4. Figma 的 Wasm 架构（真实案例）━━━━
// Figma 如何获得原生般的性能？
//
// ┌───────────────────────────────────────┐
// │           React UI Layer              │ ← JS：UI 控件、面板
// ├───────────────────────────────────────┤
// │        Wasm Rendering Engine          │ ← C++→Wasm：2D 渲染引擎
// │  (Skia-like custom engine)            │   比 Canvas 2D 快 5-10x
// ├───────────────────────────────────────┤
// │       WebGL / WebGPU Backend          │ ← GPU 加速
// ├───────────────────────────────────────┤
// │    SharedArrayBuffer (多线程)          │ ← Worker 中运行 Wasm
// └───────────────────────────────────────┘
//
// 关键设计决策：
// 1. 渲染引擎用 C++→Wasm（性能关键路径）
// 2. UI 层用 React（开发效率）
// 3. Web Workers 中运行 Wasm（不阻塞主线程）
// 4. SharedArrayBuffer 实现多线程（需要 COOP/COEP 头）`;

export default function LessonBrowserWasm() {
  return (
    <div className="we-lesson">
      <div className="we-hero">
        <div className="we-badge">// MODULE 03 · BROWSER WASM</div>
        <h1>浏览器 Wasm 实战</h1>
        <p>Figma 用 C++→Wasm 做渲染引擎、Google Earth 用 Wasm 做 3D 地图、Photoshop Web 版用 Wasm 做图像处理——<strong>这些"不可能在浏览器里跑"的应用都已经在跑了</strong>。</p>
      </div>

      <div className="we-section">
        <div className="we-section-title">🎯 四大实战案例</div>
        <div className="we-code-wrap">
          <div className="we-code-head">
            <div className="we-code-dot" style={{ background: '#ef4444' }} /><div className="we-code-dot" style={{ background: '#f59e0b' }} /><div className="we-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>browser-wasm.js</span>
          </div>
          <div className="we-code">{CODE}</div>
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">🏭 实际在用 Wasm 的产品</div>
        <div className="we-grid-2">
          {[
            { name: 'Figma', use: 'C++→Wasm 渲染引擎', boost: '比 Canvas 2D 快 5-10x', color: '#06b6d4' },
            { name: 'Google Earth', use: 'C++→Wasm 3D 地图渲染', boost: '无需安装插件', color: '#d946ef' },
            { name: 'Photoshop Web', use: 'C++→Wasm 图像处理', boost: '桌面级滤镜性能', color: '#38bdf8' },
            { name: 'AutoCAD Web', use: 'C++→Wasm CAD 引擎', boost: '30年 C++ 代码直接移植', color: '#14b8a6' },
          ].map((p, i) => (
            <div key={i} className="we-card" style={{ borderLeft: `3px solid ${p.color}` }}>
              <div style={{ fontWeight: 700, color: p.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--we-text)', marginBottom: '0.2rem' }}>{p.use}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--we-muted)' }}>✨ {p.boost}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
