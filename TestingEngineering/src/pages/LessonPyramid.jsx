import './LessonCommon.css';

const CODE = `// ━━━━ 测试金字塔（Test Pyramid）━━━━
// Mike Cohn 提出的经典模型

// ━━━━ 1. 金字塔三层 ━━━━
//
//          /\\          E2E（端到端）
//         /  \\         5-10% · 最慢 · 最贵 · 最脆弱
//        /    \\        浏览器自动化、全链路
//       /──────\\
//      / 集成测试 \\     20-30% · 中等速度
//     /  Integration \\  API/数据库/服务间交互
//    /────────────────\\
//   /    单元测试       \\   60-70% · 最快 · 最便宜
//  /     Unit Tests      \\  函数/类/模块
// /________________________\\

// ━━━━ 2. 为什么是金字塔？━━━━
// 单元测试：1ms/个，0 外部依赖 → 多写
// 集成测试：100ms/个，需要 DB/API → 适量写
// E2E 测试：10s/个，需要浏览器 → 少写
//
// 反模式：冰淇淋甜筒（E2E 多，单元少）
//          /\\
//         /  \\        手动测试（最多…）
//        /────\\
//       / E2E  \\      大量 E2E（很慢）
//      /────────\\
//     / 集成测试  \\    一些集成
//    /────────────\\
//   /  单元测试    \\   几乎没有…
//  → CI 跑 2 小时，Flaky Test 满天飞

// ━━━━ 3. 每种测试的 ROI ━━━━
// ┌──────────┬──────────┬──────────┬──────────┬──────────┐
// │ 类型     │ 速度     │ 维护成本 │ 信心     │ 定位精度 │
// ├──────────┼──────────┼──────────┼──────────┼──────────┤
// │ 单元测试 │ ⚡ 1ms   │ 💚 低    │ 🔵 中    │ ⭐⭐⭐⭐⭐ │
// │ 集成测试 │ 🔶 100ms │ 🟡 中    │ 🔵🔵 高  │ ⭐⭐⭐    │
// │ E2E 测试 │ 🔴 10s   │ 🔴 高    │ 🔵🔵🔵 最高│ ⭐       │
// │ 手动测试 │ 🔴 分钟级│ 🔴 极高  │ 🔵🔵🔵 最高│ ⭐⭐     │
// └──────────┴──────────┴──────────┴──────────┴──────────┘

// ━━━━ 4. 现代测试框架选型 ━━━━
// 单元测试：
//   Jest（React 生态标准）
//   Vitest（Vite 生态，比 Jest 快 10x）
//   pytest（Python）
//   Go testing（Go 内置）

// 组件测试：
//   React Testing Library（用户行为驱动）
//   Vue Test Utils
//   Storybook（视觉测试）

// API 测试：
//   Supertest（Node.js HTTP 测试）
//   Pactum（契约测试）
//   httpx（Python）

// E2E 测试：
//   Playwright（微软，推荐，多浏览器）
//   Cypress（前端友好，单浏览器）

// 性能测试：
//   k6（Grafana Labs，JS 脚本）
//   Locust（Python）
//   Artillery（Node.js）

// ━━━━ 5. 测试不是写越多越好 ━━━━
// "测试应该带来信心，而不是负担"
// 好的测试 = 改代码时敢重构
// 坏的测试 = 改代码时先改测试`;

export default function LessonPyramid() {
  return (
    <div className="te-lesson">
      <div className="te-hero">
        <div className="te-badge">// MODULE 01 · TEST PYRAMID</div>
        <h1>测试金字塔</h1>
        <p>测试不是"写越多越好"——<strong>70% 单元 + 20% 集成 + 10% E2E 是被验证过的最优比例</strong>。反模式是"冰淇淋甜筒"：E2E 堆一堆，CI 跑 2 小时，Flaky Test 满天飞。</p>
      </div>

      <div className="te-section">
        <div className="te-section-title">🔺 测试金字塔</div>
        <div className="te-code-wrap">
          <div className="te-code-head">
            <div className="te-code-dot" style={{ background: '#ef4444' }} /><div className="te-code-dot" style={{ background: '#f59e0b' }} /><div className="te-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>test-pyramid.md</span>
          </div>
          <div className="te-code">{CODE}</div>
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">📊 金字塔 vs 反模式</div>
        <div className="te-grid-3">
          {[
            { name: '单元测试', pct: '60-70%', speed: '⚡ 1ms', cost: '💚 低', color: '#059669' },
            { name: '集成测试', pct: '20-30%', speed: '🔶 100ms', cost: '🟡 中', color: '#7c3aed' },
            { name: 'E2E 测试', pct: '5-10%', speed: '🔴 10s', cost: '🔴 高', color: '#f97316' },
          ].map((t, i) => (
            <div key={i} className="te-card" style={{ borderTop: `3px solid ${t.color}` }}>
              <div style={{ fontWeight: 700, color: t.color, fontSize: '0.88rem', marginBottom: '0.4rem' }}>{t.name}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: t.color, fontFamily: 'JetBrains Mono,monospace', marginBottom: '0.3rem' }}>{t.pct}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)', marginBottom: '0.15rem' }}>速度：{t.speed}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)' }}>维护：{t.cost}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">🛠️ 框架选型速查</div>
        <div className="te-grid-4">
          {[
            { name: 'Vitest', type: '单元', lang: 'JS/TS', why: '比 Jest 快 10x', color: '#059669' },
            { name: 'RTL', type: '组件', lang: 'React', why: '用户行为驱动', color: '#7c3aed' },
            { name: 'Supertest', type: 'API', lang: 'Node', why: 'HTTP 断言', color: '#38bdf8' },
            { name: 'Playwright', type: 'E2E', lang: '多语言', why: '多浏览器自动化', color: '#f97316' },
          ].map((f, i) => (
            <div key={i} className="te-metric" style={{ borderTop: `2px solid ${f.color}` }}>
              <div className="te-metric-val" style={{ color: f.color, fontSize: '1rem' }}>{f.name}</div>
              <div className="te-metric-label">{f.type} · {f.lang}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
