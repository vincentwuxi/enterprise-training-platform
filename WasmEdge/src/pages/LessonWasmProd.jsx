import './LessonCommon.css';

const CODE = `// ━━━━ Wasm + Edge 生产工程 ━━━━

// ━━━━ 1. 性能基准测试 ━━━━
// 比较 JS vs Wasm 在不同任务上的性能

async function benchmark(name, fn, iterations = 1000) {
  // 预热
  for (let i = 0; i < 10; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;

  console.log(name + ": " + (elapsed / iterations).toFixed(3) + " ms/op");
}

// 典型基准结果：
// ┌──────────────────────┬──────────┬──────────┬──────────┐
// │ 任务                 │ JS       │ Wasm     │ 加速比   │
// ├──────────────────────┼──────────┼──────────┼──────────┤
// │ Fibonacci(40)        │ 820ms    │ 28ms     │ 29x      │
// │ SHA-256 (1MB)        │ 12ms     │ 2.4ms    │ 5x       │
// │ JSON Parse (100KB)   │ 0.8ms    │ 1.2ms    │ 0.67x ❌ │
// │ Image Grayscale(4K)  │ 45ms     │ 3ms      │ 15x      │
// │ Matrix Multiply 512  │ 180ms    │ 8ms      │ 22x      │
// │ String Concat        │ 0.1ms    │ 0.3ms    │ 0.33x ❌ │
// └──────────────────────┴──────────┴──────────┴──────────┘
// 规律：计算密集 → Wasm 快 5-30x
//       I/O 密集 / 字符串操作 → JS 更快（Wasm↔JS 桥接开销）

// ━━━━ 2. 调试 Wasm ━━━━
// Chrome DevTools 支持 Wasm 源码级调试

// Cargo.toml（开启 DWARF 调试信息）
// [profile.dev]
// debug = true
// opt-level = 0

// wasm-pack build --dev  (开发模式，不优化)

// Chrome DevTools：
// 1. Sources 面板 → 找到 .wasm 文件
// 2. 安装 "C/C++ DevTools Support" 扩展
// 3. 可以在 Rust 源码上设置断点！
// 4. 查看变量、调用栈、单步执行

// ━━━━ 3. Edge 应用监控 ━━━━
// Cloudflare Workers 监控：
export default {
  async fetch(request, env, ctx) {
    const start = Date.now();

    try {
      const response = await handleRequest(request, env);

      // 异步上报指标（不阻塞响应）
      ctx.waitUntil(
        env.ANALYTICS.writeDataPoint({
          blobs: [request.url, response.status.toString()],
          doubles: [Date.now() - start],  // 延迟 ms
          indexes: [request.cf?.colo],     // PoP 节点
        })
      );

      return response;
    } catch (error) {
      // 错误上报
      ctx.waitUntil(
        env.ANALYTICS.writeDataPoint({
          blobs: [request.url, error.message],
          doubles: [Date.now() - start],
          indexes: ['error'],
        })
      );
      return new Response('Internal Error', { status: 500 });
    }
  }
};

// ━━━━ 4. 渐进迁移策略 ━━━━
// 不要一次性重写！按 "热点函数" 逐步迁移到 Wasm

// 阶段 1：识别性能热点
// → 用 Chrome Performance 面板找到 > 10ms 的函数

// 阶段 2：热点函数 → Rust/Wasm
// → 只替换计算密集函数，保持 JS 胶水层

// 阶段 3：共享内存优化
// → 减少 JS↔Wasm 数据复制（用 SharedArrayBuffer）

// 阶段 4：Web Worker 隔离
// → 将 Wasm 移到 Worker 线程，不阻塞主线程

// 阶段 5：完整模块迁移
// → 渲染引擎 / 物理引擎 / 数据处理管线

// ━━━━ 避坑指南 ━━━━
// ❌ 不要用 Wasm 做 DOM 操作（反而更慢）
// ❌ 不要频繁跨 JS↔Wasm 边界传输大数据
// ❌ 不要指望 Wasm 解决所有性能问题
// ✅ 计算密集 + 大规模数据处理 → Wasm
// ✅ I/O + DOM + 字符串 → 保持 JS
// ✅ 混合架构：JS 做胶水层 + Wasm 做核心引擎`;

export default function LessonWasmProd() {
  return (
    <div className="we-lesson">
      <div className="we-hero">
        <div className="we-badge">// MODULE 08 · PRODUCTION ENGINEERING</div>
        <h1>生产工程</h1>
        <p>Wasm 不是银弹——<strong>计算密集任务快 5-30 倍，但 DOM 操作和字符串处理反而更慢</strong>。本模块教你如何精确识别热点、渐进迁移、监控度量，避免"为了 Wasm 而 Wasm"的陷阱。</p>
      </div>

      <div className="we-section">
        <div className="we-section-title">🏭 生产工程全流程</div>
        <div className="we-code-wrap">
          <div className="we-code-head">
            <div className="we-code-dot" style={{ background: '#ef4444' }} /><div className="we-code-dot" style={{ background: '#f59e0b' }} /><div className="we-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>production.ts</span>
          </div>
          <div className="we-code">{CODE}</div>
        </div>
      </div>

      <div className="we-section">
        <div className="we-section-title">🏁 全课程回顾</div>
        <div className="we-steps">
          {[
            { step: '1', name: 'Wasm 核心', desc: '线性内存 + 模块 + 二进制格式 — 理解底层原理', color: '#06b6d4' },
            { step: '2', name: 'Rust→Wasm', desc: 'wasm-pack + wasm-bindgen — 编写生产级 Wasm 模块', color: '#d946ef' },
            { step: '3', name: '浏览器实战', desc: '图像处理 / SQLite / Figma 架构 — 真实场景', color: '#38bdf8' },
            { step: '4', name: 'WASI', desc: '系统接口 + Component Model — 浏览器之外的 Wasm', color: '#14b8a6' },
            { step: '5', name: 'CF Workers', desc: 'KV / D1 / R2 / Durable Objects — 最完善 Edge 平台', color: '#06b6d4' },
            { step: '6', name: 'Edge Runtime', desc: 'Vercel / Deno / Fastly — 多平台选型', color: '#d946ef' },
            { step: '7', name: 'Edge AI', desc: 'ONNX Web / Transformers.js / Workers AI — 端侧推理', color: '#38bdf8' },
            { step: '8', name: '生产工程', desc: '性能基准 / 调试 / 监控 / 渐进迁移 — 落地避坑', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} className="we-step">
              <div className="we-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--we-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="we-tip">💡 <strong>与其他课程闭环</strong>：Cloudflare 课（网络层）→ <strong>本课（计算层）</strong>→ AI 基础设施（GPU 层）。从 CDN 到 Edge Runtime 到 GPU 集群，你掌握了现代互联网应用的完整计算栈。</div>
      </div>
    </div>
  );
}
