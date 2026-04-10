import './LessonCommon.css';

const CODE_PUBLISH = `# ━━━━ 组件库发布工程 ━━━━

# ━━━━ 1. Monorepo 结构（pnpm workspace）━━━━
# /packages
#   /tokens        → Design Tokens（CSS Variables + JSON）
#   /core          → 核心组件（Button, Input, Dialog...）
#   /icons         → 图标库（SVG → React Component）
#   /hooks         → 通用 Hooks（useTheme, useFocusTrap...）
#   /utils         → 工具函数
# /apps
#   /docs          → Storybook 文档站
#   /playground    → 项目演示应用
# /tools
#   /eslint-config → 共享 ESLint 配置
#   /tsconfig      → 共享 TypeScript 配置

# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'

# ━━━━ 2. 构建配置（tsup / Rollup）━━━━
# packages/core/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],      # 双格式输出
  dts: true,                    # 生成 .d.ts 类型声明
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],  # peer dependencies
  treeshake: true,              # Tree-shaking
  splitting: true,              # 代码分割
  minify: false,                # 组件库不压缩（交给消费者）
});

# packages/core/package.json（关键字段）
{
  "name": "@mydesign/core",
  "version": "1.0.0",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  }
}

# ━━━━ 3. Changesets（版本管理）━━━━
# 安装：pnpm add -Dw @changesets/cli
# 初始化：npx changeset init

# 开发者提交变更时：
npx changeset
# → 选择影响的包
# → 选择版本类型（major/minor/patch）
# → 写变更说明

# CI 自动发版：
npx changeset version   # 更新 package.json + CHANGELOG
npx changeset publish   # 发布到 npm

# ━━━━ 4. CI/CD 自动化 ━━━━
# .github/workflows/release.yml
# on:
#   push:
#     branches: [main]
# jobs:
#   release:
#     steps:
#       - uses: changesets/action@v1
#         with:
#           publish: pnpm changeset publish
#           version: pnpm changeset version
#         env:
#           NPM_TOKEN: secrets.NPM_TOKEN`;

export default function LessonPublish() {
  return (
    <div className="ds-lesson">
      <div className="ds-hero">
        <div className="ds-badge">// MODULE 08 · COMPONENT LIBRARY PUBLISHING</div>
        <h1>组件库发布</h1>
        <p>设计系统的终点是"被使用"——<strong>Monorepo 组织多包、tsup 双格式构建、Changesets 语义化版本管理、CI 自动发布到 npm</strong>。做好这一步，你的设计系统才真正成为一个"产品"。</p>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">📦 发布工程全流程</div>
        <div className="ds-code-wrap">
          <div className="ds-code-head">
            <div className="ds-code-dot" style={{ background: '#ef4444' }} /><div className="ds-code-dot" style={{ background: '#f59e0b' }} /><div className="ds-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>publish.sh</span>
          </div>
          <div className="ds-code">{CODE_PUBLISH}</div>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">🏁 设计系统全链路回顾</div>
        <div className="ds-steps">
          {[
            { step: '1', name: 'Design Tokens', desc: '颜色/排版/间距/动效的变量化体系 — 设计系统的 API', color: '#7c3aed' },
            { step: '2', name: 'Figma 设计规范', desc: 'Auto Layout + Variables + Variants — 设计与代码的桥梁', color: '#a855f7' },
            { step: '3', name: '组件架构', desc: 'Compound/Polymorphic/Headless — 顶级组件库的设计模式', color: '#ec4899' },
            { step: '4', name: 'Storybook 文档', desc: 'Stories + Controls + Chromatic — 组件的"展厅"和"质检"', color: '#f43f5e' },
            { step: '5', name: 'CSS 架构', desc: 'Modules/Vanilla Extract/Tailwind — 选最合适团队的方案', color: '#38bdf8' },
            { step: '6', name: '无障碍工程', desc: 'WCAG 2.2 + ARIA + 焦点管理 — 面向所有用户', color: '#22c55e' },
            { step: '7', name: '暗色模式', desc: 'Token 切换 + 系统偏好 + SSR 防闪烁 — "零修改"切换', color: '#fbbf24' },
            { step: '8', name: '组件库发布', desc: 'Monorepo + Changesets + CI — 让设计系统成为"产品"', color: '#7c3aed' },
          ].map((s, i) => (
            <div key={i} className="ds-step">
              <div className="ds-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--ds-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="ds-tip">💡 <strong>与 React 课程的衔接</strong>：React+TypeScript 课程教你"会写组件"，本课程教你"会做设计系统"——从单兵作战到组织级标准化。掌握设计系统工程的前端工程师，在团队中的影响力和不可替代性会提升一个量级。</div>
      </div>
    </div>
  );
}
