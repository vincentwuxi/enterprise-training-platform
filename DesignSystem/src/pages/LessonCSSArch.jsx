import { useState } from 'react';
import './LessonCommon.css';

const CODE_CSS = `/* ━━━━ CSS 架构方案对比 ━━━━ */

/* ━━━━ 1. CSS Modules（推荐：中型项目）━━━━ */
/* Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-default);
}
.primary { background: var(--color-primary); color: white; }
.secondary { background: transparent; border: 1px solid var(--color-border); }

/* Button.tsx */
// import styles from './Button.module.css';
// className={clsx(styles.button, styles[variant])}

/* ━━━━ 2. Vanilla Extract（推荐：大型设计系统）━━━━ */
// button.css.ts（编译时 CSS-in-JS，零运行时）
// import { style, styleVariants } from '@vanilla-extract/css';
//
// export const button = style({
//   display: 'inline-flex',
//   alignItems: 'center',
//   fontWeight: 600,
//   borderRadius: vars.radius.md,
//   transition: 'all 150ms ease',
// });
//
// export const variants = styleVariants({
//   primary: { background: vars.color.primary, color: 'white' },
//   secondary: { background: 'transparent', border: '1px solid' },
// });
// 优势：TypeScript 类型安全 + 零运行时 + 变量直接引用 Token

/* ━━━━ 3. Styled Components / Emotion（运行时 CSS-in-JS）━━━━ */
// const StyledButton = styled.button<{ variant: string }>\`
//   display: inline-flex;
//   background: \${p => p.variant === 'primary' ? 'var(--color-primary)' : 'transparent'};
// \`;
// 劣势：运行时开销 + SSR 复杂度 + bundle 增大

/* ━━━━ 4. Tailwind CSS（实用优先）━━━━ */
// <button className="inline-flex items-center font-semibold
//   rounded-lg bg-purple-600 text-white hover:bg-purple-700">
// 优势：开发速度极快
// 劣势：className 冗长，不适合组件库发布

/* ━━━━ 选型对比 ━━━━ */
// ┌──────────────────┬────────────┬─────────┬────────────┐
// │ 方案             │ 运行时开销 │ TS 支持 │ 推荐场景   │
// ├──────────────────┼────────────┼─────────┼────────────┤
// │ CSS Modules      │ 零         │ 弱      │ 中型项目   │
// │ Vanilla Extract  │ 零         │ 强      │ 大型设计系统│
// │ Styled-Components│ 有         │ 中      │ 快速原型   │
// │ Tailwind CSS     │ 零         │ 中      │ 产品开发   │
// │ Panda CSS        │ 零         │ 强      │ 新项目     │
// └──────────────────┴────────────┴─────────┴────────────┘`;

export default function LessonCSSArch() {
  return (
    <div className="ds-lesson">
      <div className="ds-hero">
        <div className="ds-badge">// MODULE 05 · CSS ARCHITECTURE</div>
        <h1>CSS 架构</h1>
        <p>CSS 架构是设计系统工程中最容易被低估的环节。<strong>CSS Modules 简洁可靠、Vanilla Extract 类型安全零运行时、Tailwind 开发速度极快</strong>——不存在"最好的"方案，只有"最合适你团队的"方案。</p>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">🎨 四种 CSS 架构方案</div>
        <div className="ds-code-wrap">
          <div className="ds-code-head">
            <div className="ds-code-dot" style={{ background: '#ef4444' }} /><div className="ds-code-dot" style={{ background: '#f59e0b' }} /><div className="ds-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>css-architecture.ts</span>
          </div>
          <div className="ds-code">{CODE_CSS}</div>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">📊 方案选型矩阵</div>
        <div className="ds-grid-2">
          {[
            { name: 'CSS Modules', pros: ['零运行时开销', '天然作用域隔离', 'Vite/Next.js 原生支持'], cons: ['TypeScript 类型弱', '不支持动态主题'], color: '#7c3aed' },
            { name: 'Vanilla Extract', pros: ['编译时 CSS-in-JS（零运行时）', 'TypeScript 完整类型安全', '变量 + 主题原生支持'], cons: ['学习曲线', '需要构建插件'], color: '#ec4899' },
            { name: 'Tailwind CSS', pros: ['开发速度最快', '生态丰富（shadcn/ui）', '按需生成、体积小'], cons: ['className 冗长', '不适合发布组件库'], color: '#38bdf8' },
            { name: 'Panda CSS（新星）', pros: ['Vanilla Extract + Tailwind 结合', '零运行时 + 类型安全', 'Recipe/Slot Pattern'], cons: ['社区较新', '生态还在成长'], color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} className="ds-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.6rem' }}>{s.name}</div>
              <div style={{ marginBottom: '0.5rem' }}>
                {s.pros.map((p, j) => <div key={j} style={{ fontSize: '0.8rem', color: 'var(--ds-green)', marginBottom: '0.2rem' }}>✅ {p}</div>)}
              </div>
              {s.cons.map((c, j) => <div key={j} style={{ fontSize: '0.8rem', color: 'var(--ds-muted)', marginBottom: '0.2rem' }}>⚠️ {c}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
