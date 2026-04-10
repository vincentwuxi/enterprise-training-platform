import './LessonCommon.css';

const CODE_FIGMA = `/* ━━━━ Figma 设计规范最佳实践 ━━━━ */

/* ━━━━ 1. Auto Layout 规则（必须一致！）━━━━ */
// Card 组件的 Figma Auto Layout 设置：
// Direction: Vertical
// Spacing: 16px (--space-4)
// Padding: 24px (--space-6)
// Alignment: Top-Left
// Fill: Hug contents (宽) / Fixed (高)

// 对应的 CSS：
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
}

/* ━━━━ 2. 组件变体（Variants）━━━━ */
// Figma 中 Button 组件的变体矩阵：
// ┌──────────┬────────┬───────┬──────┬──────────┐
// │          │ Default│ Hover │ Focus│ Disabled │ (State)
// ├──────────┼────────┼───────┼──────┼──────────┤
// │ Primary  │ ●      │ ●     │ ●    │ ●        │
// │ Secondary│ ●      │ ●     │ ●    │ ●        │
// │ Ghost    │ ●      │ ●     │ ●    │ ●        │
// │ Danger   │ ●      │ ●     │ ●    │ ●        │
// └──────────┴────────┴───────┴──────┴──────────┘
//             × 3 Sizes (sm/md/lg) = 48 个变体

// Figma 变体属性设置：
// Property 1: variant = Primary | Secondary | Ghost | Danger
// Property 2: size = sm | md | lg
// Property 3: state = Default | Hover | Focus | Disabled
// Property 4: icon = None | Left | Right | Both

/* ━━━━ 3. Design Token → Figma Variables ━━━━ */
// Figma Variables (2024 新功能) 直接映射 CSS Variables：
// Figma: color/primary → CSS: --color-primary
// Figma: space/4       → CSS: --space-4
// Figma: radius/md     → CSS: --radius-md

// 使用 Figma Tokens Studio 插件同步：
// 1. 定义 JSON Token 文件
// 2. 插件自动同步到 Figma Variables
// 3. 导出 CSS Variables / Tailwind Config / Style Dictionary

/* ━━━━ 4. Design API（Figma REST API）━━━━ */
// 自动化设计资产导出：
// GET /v1/files/{file_key}/components
// GET /v1/images/{file_key}?ids={node_ids}&format=svg

// 用途：
// - CI 自动检查组件命名规范
// - 自动导出图标 SVG 到代码仓库
// - 设计变更 → 自动创建 PR

/* ━━━━ 5. Figma → Code 的交接规范 ━━━━ */
// 设计师交付 Checklist：
// ✅ 所有组件使用 Auto Layout
// ✅ 颜色全部用 Variables（不硬编码）
// ✅ 间距全部用 Spacing Token
// ✅ 包含所有交互状态（Hover/Focus/Disabled）
// ✅ 响应式断点标注（Mobile/Tablet/Desktop）
// ✅ 暗色模式变体（如果需要）`;

export default function LessonFigma() {
  return (
    <div className="ds-lesson">
      <div className="ds-hero">
        <div className="ds-badge">// MODULE 02 · FIGMA DESIGN SPEC</div>
        <h1>Figma 设计规范</h1>
        <p>Figma 不只是画图工具——<strong>它是设计系统的"源文件"</strong>。Auto Layout 对应 Flexbox、Variables 对应 CSS Variables、Component Variants 对应 React Props。设计与代码的一致性，从 Figma 规范开始。</p>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">🎨 Figma 设计规范代码</div>
        <div className="ds-code-wrap">
          <div className="ds-code-head">
            <div className="ds-code-dot" style={{ background: '#ef4444' }} /><div className="ds-code-dot" style={{ background: '#f59e0b' }} /><div className="ds-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>figma-spec.css</span>
          </div>
          <div className="ds-code">{CODE_FIGMA}</div>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">🔄 Figma → Code 映射</div>
        <div className="ds-card" style={{ overflowX: 'auto' }}>
          <table className="ds-table">
            <thead><tr><th>Figma 概念</th><th>CSS/React 对应</th><th>同步方式</th></tr></thead>
            <tbody>
              {[
                ['Auto Layout', 'display: flex + gap', '1:1 映射'],
                ['Variables (Color)', 'CSS Custom Properties', 'Tokens Studio 插件'],
                ['Component Variants', 'React Props (variant/size)', '手动实现'],
                ['Boolean Property', 'React Props (boolean)', 'showIcon={true}'],
                ['Instance Swap', 'React children / slot', 'Compound Pattern'],
                ['Responsive (Constraints)', 'CSS Grid / @media', '断点系统'],
              ].map(([figma, code, sync], i) => (
                <tr key={i}>
                  <td><span className="ds-tag violet">{figma}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem', color: 'var(--ds-text)' }}>{code}</td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--ds-muted)' }}>{sync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">✅ 设计师交付 Checklist</div>
        <div className="ds-grid-3">
          {[
            { title: '结构规范', items: ['所有组件用 Auto Layout', '嵌套不超过 5 层', '命名遵循 BEM 风格'], color: '#7c3aed' },
            { title: 'Token 规范', items: ['颜色 100% 用 Variables', '间距 100% 用 Spacing Token', '字体用 Typography Style'], color: '#ec4899' },
            { title: '交互规范', items: ['4 种状态（Default/Hover/Focus/Disabled）', '加载态和空态设计', '错误态和成功态反馈'], color: '#38bdf8' },
          ].map((c, i) => (
            <div key={i} className="ds-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.87rem', marginBottom: '0.6rem' }}>{c.title}</div>
              {c.items.map((item, j) => (
                <div key={j} style={{ fontSize: '0.82rem', color: 'var(--ds-muted)', marginBottom: '0.3rem' }}>✅ {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
