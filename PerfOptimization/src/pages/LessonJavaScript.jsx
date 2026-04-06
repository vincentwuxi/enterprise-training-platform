import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// Core Web Vitals 分数模拟器
const CWV_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000, unit: 'ms', icon: '🖼️', name: 'Largest Contentful Paint', desc: '最大内容绘制时间（感知加载速度）' },
  FID: { good: 100, poor: 300, unit: 'ms', icon: '👆', name: 'First Input Delay', desc: '首次输入延迟（交互响应速度）' },
  CLS: { good: 0.1, poor: 0.25, unit: '', icon: '🔀', name: 'Cumulative Layout Shift', desc: '累积布局偏移（视觉稳定性）' },
  INP: { good: 200, poor: 500, unit: 'ms', icon: '⚡', name: 'Interaction to Next Paint', desc: '交互到下次绘制（新版FID替代）' },
  TTFB: { good: 800, poor: 1800, unit: 'ms', icon: '🌐', name: 'Time to First Byte', desc: '首字节时间（服务器响应速度）' },
};

function CWVSimulator() {
  const [values, setValues] = useState({ LCP: 3200, FID: 85, CLS: 0.18, INP: 280, TTFB: 950 });

  const getStatus = (key, val) => {
    const t = CWV_THRESHOLDS[key];
    if (val <= t.good) return { label: 'Good', color: '#22c55e' };
    if (val <= t.poor) return { label: 'Needs Improvement', color: '#f97316' };
    return { label: 'Poor', color: '#ef4444' };
  };

  const sliderConfig = {
    LCP: { min: 500, max: 6000, step: 100 },
    FID: { min: 10, max: 500, step: 10 },
    CLS: { min: 0, max: 0.5, step: 0.01 },
    INP: { min: 50, max: 800, step: 10 },
    TTFB: { min: 100, max: 3000, step: 50 },
  };

  const goodCount = Object.entries(values).filter(([k, v]) => v <= CWV_THRESHOLDS[k].good).length;
  const score = Math.round(goodCount / 5 * 100);

  return (
    <div className="po-interactive">
      <h3>📊 Core Web Vitals 交互式模拟器（拖动调整数值）
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', fontWeight: 900,
          color: score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444' }}>
          {goodCount}/5 Good
        </div>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {Object.entries(values).map(([key, val]) => {
          const t = CWV_THRESHOLDS[key];
          const st = getStatus(key, val);
          const cfg = sliderConfig[key];
          const goodPct = (t.good / cfg.max) * 100;
          const poorPct = (t.poor / cfg.max) * 100;
          return (
            <div key={key} style={{ padding: '0.5rem 0.625rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: `1px solid ${st.color}18` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span>{t.icon}</span>
                <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', flex: 1 }}>{key}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, color: st.color, fontSize: '0.85rem' }}>
                  {key === 'CLS' ? val.toFixed(2) : val}{t.unit}
                </span>
                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: `${st.color}15`, color: st.color, fontWeight: 700 }}>{st.label}</span>
              </div>
              <div style={{ position: 'relative', marginBottom: '0.2rem' }}>
                {/* 颜色区带 */}
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%', height: 4, borderRadius: 2, background: `linear-gradient(to right, #22c55e ${goodPct}%, #f97316 ${goodPct}% ${poorPct}%, #ef4444 ${poorPct}%)`, opacity: 0.3, zIndex: 0 }} />
                <input type="range" min={cfg.min} max={cfg.max} step={cfg.step}
                  value={val}
                  onChange={e => setValues(v => ({ ...v, [key]: cfg.step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: st.color, position: 'relative', zIndex: 1 }} />
              </div>
              <div style={{ fontSize: '0.62rem', color: '#334155' }}>Good: ≤{t.good}{t.unit} / Poor: {'>'}{t.poor}{t.unit}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const JS_TOPICS = [
  {
    name: 'React 性能', icon: '⚛️', color: '#61dafb',
    code: `// React 性能优化：避免无效重渲染

import React, { useState, useMemo, useCallback, memo } from 'react';

// ── 1. memo：跳过 props 未变化的子组件渲染 ──
const ExpensiveChild = memo(({ data, onAction }) => {
  // 只有 data 或 onAction 引用变化时才重渲染
  console.log('ExpensiveChild rendered');
  return <div>{data.map(d => <Item key={d.id} item={d} />)}</div>;
}, (prev, next) => {
  // 自定义比较：只比较 data.length（细粒度控制）
  return prev.data.length === next.data.length;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [data] = useState([...Array(1000).keys()].map(i => ({ id: i })));

  // ── 2. useCallback：稳定函数引用（避免子组件因函数变化重渲染）──
  const handleAction = useCallback((id) => {
    console.log('action', id);
  }, []);   // 空依赖：引用永不变化

  // ── 3. useMemo：缓存昂贵计算结果 ──
  const processedData = useMemo(() => {
    return data.filter(d => d.id % 2 === 0)  // 假设这是昂贵操作
               .map(d => ({ ...d, label: \`Item \${d.id}\` }));
  }, [data]);   // 只有 data 变化时重新计算

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {/* 每次 count 变化时 Parent 重渲染，但 ExpensiveChild 不重渲染！ */}
      <ExpensiveChild data={processedData} onAction={handleAction} />
    </div>
  );
}

// ── 4. 虚拟列表（渲染 1M 条数据的唯一正确方式）──
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  );
  return (
    <FixedSizeList height={600} width={800} itemSize={35} itemCount={items.length}>
      {Row}
    </FixedSizeList>
  );
}
// 无论列表有 100 还是 1,000,000 条，DOM 中只有 ~20 个元素！

// ── 5. 关键 DevTools：React Profiler ──
// Chrome DevTools → Components → ⏱ Profiler
// 录制交互 → 看 "What caused this render?"
// 目标：避免 Render > 16ms（60fps = 每帧 16.7ms）`,
  },
  {
    name: 'Bundle 优化', icon: '📦', color: '#f97316',
    code: `// JavaScript Bundle 体积优化：用户体验 = 包越小越好

// ── 1. Vite / Webpack Bundle 分析 ──
// npm run build && npx vite-bundle-analyzer
// 找体积最大的依赖，考虑替换或按需加载

// ── 2. 代码分割（Code Splitting）──
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ❌ 所有页面一次性加载（首屏巨大）
import AdminPage from './pages/Admin';
import DashboardPage from './pages/Dashboard';

// ✅ 按路由懒加载（用到才下载）
const AdminPage = lazy(() => import('./pages/Admin'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />    {/* 访问 /admin 才下载 */}
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}

// ── 3. Tree Shaking（只打包用到的代码）──
// ❌ 引入整个 lodash（~70KB gzip）
import _ from 'lodash';
const arr = _.groupBy(data, 'category');

// ✅ 只引入 groupBy（~3KB）
import groupBy from 'lodash/groupBy';
// 或使用 lodash-es + import { groupBy } from 'lodash-es';

// ── 4. 图片优化（通常是最大的性能杀手！）──
// 现代格式：WebP(-30%), AVIF(-50%) vs JPEG
// 响应式图片：srcset + sizes
<img
  src="hero-800w.webp"
  srcSet="hero-400w.webp 400w, hero-800w.webp 800w, hero-1200w.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
  loading="lazy"           // 懒加载（非首屏图片）
  decoding="async"         // 异步解码（不阻塞主线程）
  fetchPriority="high"    // LCP 图片设为 high（提升 LCP 分数）
  alt="Hero image"
/>

// ── 5. 关键渲染路径优化 ──
// <link rel="preload">：提前加载关键资源
// <link rel="prefetch">：空闲时预加载下一页
// defer/async: <script defer>（DOMContentLoaded后执行）
// Critical CSS 内联：首屏样式直接写入 <head> 避免 render blocking`,
  },
];

export default function LessonJavaScript() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(0);
  const t = JS_TOPICS[activeTopic];

  return (
    <div className="lesson-po">
      <div className="po-badge blue">🌐 module_04 — JavaScript 性能优化</div>
      <div className="po-hero">
        <h1>JavaScript 性能：Core Web Vitals / React / Bundle 优化</h1>
        <p>Web 性能影响转化率：页面加载时间每<strong>增加 1 秒</strong>，转化率下降 7%。Google 的 Core Web Vitals（LCP/FID/CLS/INP）直接影响 SEO 排名，掌握 DevTools 火焰图和 React Profiler 是必备技能。</p>
      </div>

      <CWVSimulator />

      <div className="po-section">
        <h2 className="po-section-title">⚛️ React & Bundle 优化代码</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {JS_TOPICS.map((topic, i) => (
            <button key={i} onClick={() => setActiveTopic(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTopic === i ? '#3b82f660' : 'rgba(255,255,255,0.07)'}`,
                background: activeTopic === i ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                color: activeTopic === i ? '#60a5fa' : '#64748b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{topic.icon}</div>{topic.name}
            </button>
          ))}
        </div>
        <div className="po-code-wrap">
          <div className="po-code-head"><div className="po-code-dot" style={{ background: '#ef4444' }}/><div className="po-code-dot" style={{ background: '#f97316' }}/><div className="po-code-dot" style={{ background: '#3b82f6' }}/><span style={{ color: '#60a5fa', marginLeft: '0.5rem' }}>{t.icon} {t.name}.tsx</span></div>
          <div className="po-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{t.code}</div>
        </div>
      </div>

      <div className="po-nav">
        <button className="po-btn" onClick={() => navigate('/course/perf-optimization/lesson/python')}>← 上一模块</button>
        <button className="po-btn primary" onClick={() => navigate('/course/perf-optimization/lesson/database')}>下一模块：数据库调优 →</button>
      </div>
    </div>
  );
}
