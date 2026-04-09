import { useState } from 'react';
import './LessonCommon.css';

const PERF_TIPS = [
  {
    key: 'memo', label: 'React.memo & Profiler', icon: '🔬',
    before: '父组件状态变化 → 所有子组件无条件重渲染（即使 props 没变）',
    after: 'React.memo 浅比较 props → props 没变的子组件跳过渲染',
    impact: '高', effort: '低',
    code: `// ━━━━ 第1步：用 Profiler 找瓶颈 ━━━━
// React DevTools → Profiler 标签 → 录制 → 分析火焰图

// ━━━━ 第2步：React.memo 防止不必要重渲染 ━━━━
// ❌ 问题：Parent 的 count 变化 → ProductCard 无辜重渲染
function Parent() {
  const [count, setCount] = useState(0);
  const [products] = useState(mockProducts);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// ✅ 修复：wrap with memo，props 未变则跳过
const ProductCard = memo(function ProductCard({ product }: Props) {
  return <div>{product.name}</div>;
});

// ━━━━ 误区：memo 不是银弹 ━━━━
// memo 自身有成本（浅比较），小组件可能反而更慢
// 只在 Profiler 确认有问题后才加！

// ━━━━ 自定义比较函数 ━━━━
const ProductCard = memo(
  function ProductCard({ product }: Props) { ... },
  (prev, next) => prev.product.id === next.product.id  // 自定义比较
);`,
  },
  {
    key: 'splitting', label: '代码分割 & 懒加载', icon: '✂️',
    before: 'App 所有代码打包进一个 JS 文件 → 首屏加载时间长',
    after: '按路由/功能切割 → 只加载当前页需要的代码',
    impact: '极高', effort: '低',
    code: `// ━━━━ React.lazy + Suspense：组件级懒加载 ━━━━
import { lazy, Suspense } from 'react';

// 只有渲染时才下载 chunk
const HeavyChart     = lazy(() => import('./HeavyChart'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}

// ━━━━ Next.js 内置动态导入 ━━━━
import dynamic from 'next/dynamic';

// 禁用 SSR（适合只在浏览器运行的库如地图）
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <p>加载地图...</p>,
});

// 按需加载（用户点击才下载）
const Editor = dynamic(() => import('@/components/RichEditor'), {
  loading: () => <Skeleton className="h-64" />,
});

// ━━━━ Bundle 分析 ━━━━
// npm install @next/bundle-analyzer
// ANALYZE=true npm run build
// 会打开可视化分析页面，找出哪个依赖最大

// 常见的大包：
// moment.js → 用 date-fns（tree-shakeable）
// lodash    → 按需导入 import debounce from 'lodash/debounce'
// 完整 icon 库 → 只导入用到的 icon`,
  },
  {
    key: 'virtualize', label: '虚拟化长列表', icon: '📋',
    before: '渲染 10000 条数据 → DOM 节点爆炸 → 首屏卡顿几秒',
    after: '只渲染可见区域的 ~20 条 → 60fps 流畅滚动',
    impact: '极高', effort: '中',
    code: `// ━━━━ 虚拟化：只渲染可视范围内的列表项 ━━━━
// 安装：npm install @tanstack/react-virtual

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualList({ items }: { items: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count:         items.length,
    getScrollElement: () => parentRef.current,
    estimateSize:  () => 72,    // 每行预估高度（px）
    overscan:      5,           // 可视区域外额外渲染行数
  });

  return (
    <div
      ref={parentRef}
      style={{ height: '600px', overflow: 'auto' }}
    >
      {/* 撑开滚动高度（= 所有行高度之和） */}
      <div style={{ height: virtualizer.getTotalSize() + 'px', position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top:    virtualRow.start + 'px',
              left:   0, right: 0,
              height: virtualRow.size + 'px',
            }}
          >
            <ProductRow product={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// 10000 行数据，DOM 里只有 ~25 个节点 ✅`,
  },
  {
    key: 'webvitals', label: 'Web Vitals 优化', icon: '📊',
    before: 'LCP 差 / CLS 高 / FID 慢 → Google 排名下降，用户流失',
    after: '针对性优化三大核心指标 → 提升 SEO 和用户体验',
    impact: '高', effort: '高',
    code: `// ━━━━ Core Web Vitals 三大指标 ━━━━
// LCP（最大内容绘制）< 2.5s  → 首屏主要内容多快显示
// CLS（累积布局偏移）< 0.1   → 内容加载时页面是否跳动
// FID/INP（输入延迟）< 200ms → 点击按钮到有反应的延迟

// ━━━━ LCP 优化 ━━━━
// 1. 图片优化（Next.js Image 组件）
import Image from 'next/image';

<Image
  src="/hero.webp"
  alt="Hero image"
  width={1200} height={600}
  priority                    // 首屏图片加 priority（不懒加载）
  placeholder="blur"          // 模糊占位符（避免布局偏移）
  blurDataURL="data:..."
/>

// 2. 字体优化（避免 FOIT/FOUT）
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });

// ━━━━ CLS 优化 ━━━━
// 为所有图片/视频/广告预留空间
// ❌ 没有尺寸的图片会撑开布局
<img src="photo.jpg" />  // 没有 width/height → CLS

// ✅ 预留空间或使用 aspect-ratio
<div style={{ aspectRatio: '16/9' }}>
  <Image fill src="photo.jpg" alt="" />
</div>

// ━━━━ 监控 ━━━━
// next.config.js
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    sendToAnalytics(metric);  // 发给 Vercel Analytics / GA4
  }
}`,
  },
];

export default function LessonPerformance() {
  const [tip, setTip] = useState('memo');
  const t = PERF_TIPS.find(x => x.key === tip) ?? {};

  return (
    <div className="lesson-rt" style={{ background: 'var(--rt-bg)', minHeight: '100vh' }}>
      <div className="rt-hero">
        <div className="rt-badge green">⚡ Module 06 · Performance</div>
        <h1>React 性能优化实战</h1>
        <p><strong>过早优化是万恶之源</strong>——但性能问题出现在生产环境更可怕。掌握正确的优化流程：先用 Profiler <strong>找到真正的瓶颈</strong>，再<strong>针对性优化</strong>，而不是到处乱加 memo。</p>
      </div>

      <div className="rt-section">
        <div className="rt-section-title">📊 性能优化四大武器</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {PERF_TIPS.map(x => (
            <button key={x.key} className="rt-btn"
              style={{ background: tip === x.key ? 'rgba(16,185,129,0.12)' : undefined, borderColor: tip === x.key ? '#10b981' : undefined, color: tip === x.key ? '#34d399' : undefined }}
              onClick={() => setTip(x.key)}>
              {x.icon} {x.label}
            </button>
          ))}
        </div>

        <div className="rt-grid-2" style={{ marginBottom: '1rem' }}>
          <div className="rt-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, marginBottom: '0.4rem' }}>❌ 优化前</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--rt-muted)', lineHeight: 1.6 }}>{t.before}</div>
          </div>
          <div className="rt-card" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, marginBottom: '0.4rem' }}>✅ 优化后</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--rt-muted)', lineHeight: 1.6 }}>{t.after}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="rt-tag" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>影响：{t.impact}</span>
          <span className="rt-tag" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>成本：{t.effort}</span>
        </div>
        <div className="rt-code-wrap">
          <div className="rt-code-head">
            <div className="rt-code-dot" style={{ background: '#ef4444' }} /><div className="rt-code-dot" style={{ background: '#f59e0b' }} /><div className="rt-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem', color: '#34d399' }}>{t.key}.tsx</span>
          </div>
          <div className="rt-code">{t.code}</div>
        </div>
      </div>

      <div className="rt-section">
        <div className="rt-section-title">🗺️ 性能优化检查清单</div>
        <div className="rt-code-wrap">
          <div className="rt-code-head"><span>perf-checklist.md</span></div>
          <div className="rt-code">{`# React 性能优化 Checklist

## 🔍 分析（先做这个！）
□ 用 React DevTools Profiler 录制并找到重渲染热点
□ 用 Lighthouse 跑一遍 Performance 分数
□ 用 @next/bundle-analyzer 分析 bundle 大小

## ⚛️ React 层优化
□ 频繁渲染的子组件 → React.memo
□ 大型列表（>100条）→ @tanstack/react-virtual 虚拟化
□ 复杂计算 → useMemo（先确认计算确实慢）
□ 传给 memo 子组件的函数 → useCallback
□ 数据获取改用 React Query（避免 useEffect 滥用）

## 📦 Bundle 优化
□ 重型组件（Editor/Chart/Map）→ dynamic import
□ 重型库（moment/lodash）→ tree-shakeable 替代品
□ 图片 → next/image（懒加载/WebP/尺寸优化）

## 🌐 网络优化
□ 首屏图片加 priority
□ 字体用 next/font（避免 FOUT）
□ Server Components 替代客户端数据获取
□ API 响应加缓存（React Query staleTime / Next.js fetch cache）

## 📊 监控
□ 接入 Vercel Analytics 监控真实 Web Vitals
□ LCP < 2.5s  ✅
□ CLS < 0.1   ✅
□ INP < 200ms ✅`}</div>
        </div>
      </div>
    </div>
  );
}
