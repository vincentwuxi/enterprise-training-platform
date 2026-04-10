import { useState } from 'react';
import './LessonCommon.css';

const COLORS = [
  { name: 'Primary', shades: [{s:'50',c:'#faf5ff'},{s:'100',c:'#f3e8ff'},{s:'200',c:'#e9d5ff'},{s:'300',c:'#d8b4fe'},{s:'400',c:'#c084fc'},{s:'500',c:'#a855f7'},{s:'600',c:'#9333ea'},{s:'700',c:'#7c3aed'},{s:'800',c:'#6b21a8'},{s:'900',c:'#581c87'}] },
  { name: 'Accent', shades: [{s:'50',c:'#fdf2f8'},{s:'100',c:'#fce7f3'},{s:'200',c:'#fbcfe8'},{s:'300',c:'#f9a8d4'},{s:'400',c:'#f472b6'},{s:'500',c:'#ec4899'},{s:'600',c:'#db2777'},{s:'700',c:'#be185d'},{s:'800',c:'#9d174d'},{s:'900',c:'#831843'}] },
];

const CODE_TOKENS = `/* ━━━━ Design Tokens：设计系统的 API ━━━━ */
/* Design Token = 设计决策的"变量化表达" */
/* 用变量而不是硬编码值 → 一处修改，全局生效 */

/* ━━━━ tokens/colors.css ━━━━ */
:root {
  /* 语义化颜色（推荐！不要用 --blue-500 这种原始名称） */
  --color-primary:       #7c3aed;
  --color-primary-hover: #6d28d9;
  --color-primary-light: #ede9fe;
  --color-accent:        #ec4899;
  --color-success:       #22c55e;
  --color-warning:       #f59e0b;
  --color-error:         #ef4444;

  /* 语义化表面颜色 */
  --color-bg:            #ffffff;
  --color-bg-subtle:     #f8fafc;
  --color-surface:       #ffffff;
  --color-surface-raised:#f1f5f9;
  --color-border:        #e2e8f0;
  --color-text:          #0f172a;
  --color-text-muted:    #64748b;
}

/* ━━━━ tokens/typography.css ━━━━ */
:root {
  --font-sans:    'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  /* Type Scale（推荐：Major Third 1.25 比例）*/
  --text-xs:      0.75rem;    /* 12px */
  --text-sm:      0.875rem;   /* 14px */
  --text-base:    1rem;       /* 16px */
  --text-lg:      1.125rem;   /* 18px */
  --text-xl:      1.25rem;    /* 20px */
  --text-2xl:     1.5rem;     /* 24px */
  --text-3xl:     1.875rem;   /* 30px */
  --text-4xl:     2.25rem;    /* 36px */

  --leading-tight:   1.25;
  --leading-normal:  1.5;
  --leading-relaxed: 1.75;
}

/* ━━━━ tokens/spacing.css ━━━━ */
:root {
  /* 4px 基础单位的倍数系统 */
  --space-0:  0;
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;
}

/* ━━━━ tokens/motion.css ━━━━ */
:root {
  --duration-fast:   150ms;
  --duration-normal: 250ms;
  --duration-slow:   400ms;
  --easing-default:  cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in:       cubic-bezier(0.4, 0, 1, 1);
  --easing-out:      cubic-bezier(0, 0, 0.2, 1);
  --easing-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
}`;

export default function LessonDesignToken() {
  const [pal, setPal] = useState(0);

  return (
    <div className="ds-lesson">
      <div className="ds-hero">
        <div className="ds-badge">// MODULE 01 · DESIGN TOKENS</div>
        <h1>Design Token</h1>
        <p>Design Token 是设计系统的"API"——<strong>颜色、排版、间距、动效的每一个值都用语义化变量表达</strong>。改一个 Token，Theme 全局更新。这是实现暗色模式、品牌换肤的基础。</p>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">🎨 调色板可视化</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {COLORS.map((c, i) => (
            <button key={i} className={`ds-btn ${pal === i ? 'active' : ''}`} onClick={() => setPal(i)}>{c.name}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.35rem' }}>
          {COLORS[pal].shades.map(s => (
            <div key={s.s}>
              <div className="ds-swatch" style={{ background: s.c }} />
              <div style={{ fontSize: '0.68rem', color: 'var(--ds-muted)', textAlign: 'center' }}>{s.s}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--ds-muted)', textAlign: 'center', fontFamily: 'JetBrains Mono,monospace' }}>{s.c}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">📝 Token 定义代码</div>
        <div className="ds-code-wrap">
          <div className="ds-code-head">
            <div className="ds-code-dot" style={{ background: '#ef4444' }} /><div className="ds-code-dot" style={{ background: '#f59e0b' }} /><div className="ds-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>tokens.css</span>
          </div>
          <div className="ds-code">{CODE_TOKENS}</div>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">📊 Token 四大维度</div>
        <div className="ds-grid-4">
          {[
            { icon: '🎨', name: '颜色', items: ['Primary / Accent / Neutral', '语义化命名（不用 blue-500）', '明暗模式各一套值'], color: '#7c3aed' },
            { icon: '📝', name: '排版', items: ['Type Scale（1.25 倍率）', '行高系统（tight/normal/relaxed）', '字重（400/500/600/700/800）'], color: '#ec4899' },
            { icon: '📐', name: '间距', items: ['4px 基础单位', '倍数系统（4/8/12/16/24/32）', '圆角系统（sm/md/lg/full）'], color: '#38bdf8' },
            { icon: '✨', name: '动效', items: ['duration（150/250/400ms）', 'easing（default/in/out/spring）', 'prefers-reduced-motion 适配'], color: '#22c55e' },
          ].map((t, i) => (
            <div key={i} className="ds-card" style={{ borderTop: `3px solid ${t.color}`, padding: '0.9rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{t.icon}</div>
              <div style={{ fontWeight: 700, color: t.color, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.name}</div>
              {t.items.map((item, j) => (
                <div key={j} style={{ fontSize: '0.78rem', color: 'var(--ds-muted)', marginBottom: '0.25rem' }}>→ {item}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="ds-tip">💡 <strong>命名原则</strong>：Token 命名用"用途"而非"值"。<code style={{ color: 'var(--ds-purple)' }}>--color-primary</code> 而非 <code style={{ color: 'var(--ds-rose)' }}>--purple-700</code>。因为品牌色可能变，但"Primary"的语义不会变。</div>
      </div>
    </div>
  );
}
