import { useState } from 'react';
import './LessonCommon.css';

const CODE_STORIES = `// ━━━━ Storybook 7/8：组件文档化 ━━━━

// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],           // 自动生成 API 文档
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: '按钮变体',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },  // 记录点击事件
  },
  parameters: {
    layout: 'centered',
    docs: { description: { component: '通用按钮组件，支持多种变体和尺寸。' } },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

// ━━━━ 基础 Stories ━━━━
export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

// ━━━━ 组合 Story（展示所有变体）━━━━
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {(['primary','secondary','ghost','danger'] as const).map(v => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
    </div>
  ),
};

// ━━━━ 交互测试（play function）━━━━
import { within, userEvent, expect } from '@storybook/test';

export const ClickTest: Story = {
  args: { children: 'Click Me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(button).toHaveFocus();    // 验证焦点
    await expect(button).toBeEnabled();     // 验证状态
  },
};`;

const CODE_CHROMATIC = `// ━━━━ Chromatic：视觉回归测试 ━━━━

// ━━━━ 1. 安装与配置 ━━━━
// npx chromatic --project-token=xxx

// .github/workflows/chromatic.yml
// name: Chromatic
// on: pull_request
// jobs:
//   chromatic:
//     steps:
//       - uses: chromaui/action@v1
//         with:
//           projectToken: secrets.CHROMATIC_TOKEN
//           exitZeroOnChanges: true  # 有变化不失败

// ━━━━ 2. 工作流 ━━━━
// 1. 开发者提交 PR
// 2. Chromatic 自动截屏所有 Stories
// 3. 对比 baseline（上次通过的截图）
// 4. 差异 > 阈值 → 标记为 Changed
// 5. 设计师在 Chromatic 面板中 Accept / Reject
// 6. Accept → 更新 baseline → PR 可合并

// ━━━━ 3. Storybook 配置优化 ━━━━
// .storybook/preview.ts
const preview: Preview = {
  parameters: {
    // 响应式视口
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
    // 背景色切换
    backgrounds: {
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
    // 无障碍检查
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

// ━━━━ 4. Storybook 插件推荐 ━━━━
// @storybook/addon-a11y        → 无障碍实时检查
// @storybook/addon-interactions→ 交互测试
// @storybook/addon-designs     → 嵌入 Figma 设计稿
// @storybook/addon-viewport    → 响应式预览
// storybook-dark-mode          → 暗色模式切换`;

export default function LessonStorybook() {
  const [tab, setTab] = useState('stories');
  const tabs = [
    { key: 'stories',   label: '📖 Stories & Controls', code: CODE_STORIES },
    { key: 'chromatic', label: '🔍 Chromatic 视觉回归', code: CODE_CHROMATIC },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ds-lesson">
      <div className="ds-hero">
        <div className="ds-badge">// MODULE 04 · STORYBOOK</div>
        <h1>Storybook 组件文档</h1>
        <p>Storybook 是设计系统的"展厅"——<strong>每个组件都有独立的文档页，支持实时交互控制、无障碍检查、视觉回归测试</strong>。Chromatic 的自动截屏对比则确保每次变更都不会悄悄破坏现有 UI。</p>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">📚 Storybook 两大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`ds-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="ds-code-wrap">
          <div className="ds-code-head">
            <div className="ds-code-dot" style={{ background: '#ef4444' }} /><div className="ds-code-dot" style={{ background: '#f59e0b' }} /><div className="ds-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>Button.stories.tsx</span>
          </div>
          <div className="ds-code">{t.code}</div>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">🔄 Chromatic 工作流</div>
        <div className="ds-steps">
          {[
            { name: 'PR 提交', desc: '开发者修改组件代码并提交 Pull Request', color: '#7c3aed' },
            { name: '自动截屏', desc: 'Chromatic CI 对所有 Stories 进行截屏（每个视口尺寸）', color: '#a855f7' },
            { name: '像素对比', desc: '与 baseline 截图逐像素对比，标记有差异的 Story', color: '#ec4899' },
            { name: '设计审查', desc: '设计师在 Chromatic 面板中 Accept 或 Reject 变化', color: '#f43f5e' },
            { name: 'Baseline 更新', desc: 'Accept 后自动更新 baseline → PR 可以合并', color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} className="ds-step">
              <div className="ds-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--ds-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
