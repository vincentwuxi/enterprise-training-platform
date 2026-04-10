import { useState } from 'react';
import './LessonCommon.css';

const CODE_COMPOUND = `// ━━━━ Compound Pattern（复合组件）━━━━
// 灵感：HTML <select> + <option> 的关系

import { createContext, useContext, useState } from 'react';

// 1. 共享上下文
const TabsContext = createContext(null);

// 2. 父组件
function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// 3. 子组件
function TabList({ children }) {
  return <div role="tablist" className="tab-list">{children}</div>;
}

function Tab({ value, children }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={active === value}
      className={\`tab \${active === value ? 'active' : ''}\`}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

// 4. 挂载子组件
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// 使用：极其直观的 API
<Tabs defaultValue="design">
  <Tabs.List>
    <Tabs.Tab value="design">Design</Tabs.Tab>
    <Tabs.Tab value="code">Code</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="design">设计相关内容</Tabs.Panel>
  <Tabs.Panel value="code">代码相关内容</Tabs.Panel>
</Tabs>`;

const CODE_POLYMORPHIC = `// ━━━━ Polymorphic Component（多态组件）━━━━
// 同一个组件可以渲染为不同的 HTML 元素

import { forwardRef } from 'react';

// as prop：渲染为任意元素
function Button({ as: Component = 'button', variant = 'primary', size = 'md', ...props }) {
  return (
    <Component
      className={\`btn btn-\${variant} btn-\${size}\`}
      {...props}
    />
  );
}

// 使用：渲染为不同元素
<Button>普通按钮</Button>                   // → <button>
<Button as="a" href="/link">链接按钮</Button> // → <a>
<Button as={Link} to="/page">路由按钮</Button> // → <Link>

// ━━━━ TypeScript 类型安全的多态组件 ━━━━
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
} & Omit<React.ComponentPropsWithoutRef<E>, 'as' | 'variant' | 'size'>;

function Button<E extends React.ElementType = 'button'>({
  as, variant = 'primary', size = 'md', className, ...props
}: PolymorphicProps<E>) {
  const Component = as || 'button';
  return (
    <Component
      className={\`btn btn--\${variant} btn--\${size} \${className ?? ''}\`}
      {...props}
    />
  );
}

// 现在有完整的类型推断：
<Button>OK</Button>                          // button 的所有属性
<Button as="a" href="/link">Link</Button>    // a 的 href 属性
// <Button as="a" onClick={...}>            // ✅ a 支持 onClick
// <Button as="input" type="text" />        // ✅ 自动推断 input 属性`;

const CODE_HEADLESS = `// ━━━━ Headless Component（无样式组件）━━━━
// 只提供逻辑和无障碍，样式完全由使用者控制
// 代表库：Headless UI、Radix UI、React Aria

// ━━━━ 自己实现 Headless Dropdown ━━━━
function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  // 键盘导航
  const onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        setIsOpen(prev => !prev);
        break;
      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        // 聚焦下一个选项...
        break;
    }
  };

  return {
    isOpen, setIsOpen, selected, setSelected,
    triggerProps: {
      ref: triggerRef,
      role: 'combobox',
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox',
      onClick: () => setIsOpen(!isOpen),
      onKeyDown,
    },
    listProps: {
      ref: listRef,
      role: 'listbox',
      'aria-label': 'Options',
    },
    getOptionProps: (value) => ({
      role: 'option',
      'aria-selected': selected === value,
      onClick: () => { setSelected(value); setIsOpen(false); },
    }),
  };
}

// 使用：样式完全自定义
function CustomDropdown() {
  const { isOpen, triggerProps, listProps, getOptionProps, selected } = useDropdown();

  return (
    <div className="my-custom-dropdown-wrapper">
      <button {...triggerProps} className="my-trigger-style">
        {selected ?? '选择选项'}
      </button>
      {isOpen && (
        <ul {...listProps} className="my-list-style">
          {['React', 'Vue', 'Svelte'].map(opt => (
            <li key={opt} {...getOptionProps(opt)} className="my-option-style">
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ━━━━ 推荐 Headless 库 ━━━━
// Radix UI：最完善的无障碍实现（推荐！）
// Headless UI：Tailwind 团队出品
// React Aria：Adobe 出品，a11y 最严谨
// Ariakit：轻量，API 设计优美`;

export default function LessonComponent() {
  const [tab, setTab] = useState('compound');
  const tabs = [
    { key: 'compound',    label: '🧩 Compound 复合组件', code: CODE_COMPOUND },
    { key: 'polymorphic', label: '🔀 Polymorphic 多态',   code: CODE_POLYMORPHIC },
    { key: 'headless',    label: '👻 Headless 无样式',    code: CODE_HEADLESS },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ds-lesson">
      <div className="ds-hero">
        <div className="ds-badge">// MODULE 03 · REACT COMPONENT PATTERNS</div>
        <h1>React 组件架构</h1>
        <p>组件库的核心不是"好看"——<strong>是可组合（Compound）、可变形（Polymorphic）、可定制（Headless）</strong>。这三种模式是 Radix UI、Chakra UI、shadcn/ui 等顶级组件库的设计基石。</p>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">🏗️ 三大组件模式</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`ds-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="ds-code-wrap">
          <div className="ds-code-head">
            <div className="ds-code-dot" style={{ background: '#ef4444' }} /><div className="ds-code-dot" style={{ background: '#f59e0b' }} /><div className="ds-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.tsx</span>
          </div>
          <div className="ds-code">{t.code}</div>
        </div>
      </div>

      <div className="ds-section">
        <div className="ds-section-title">📊 模式选择指南</div>
        <div className="ds-grid-3">
          {[
            { name: 'Compound', when: '多个子组件需要共享状态', ex: 'Tabs, Accordion, Menu, Dialog', lib: 'Radix UI', color: '#7c3aed' },
            { name: 'Polymorphic', when: '同一组件需要渲染为不同 HTML 元素', ex: 'Button as a/Link, Text as h1/p/span', lib: 'Chakra UI', color: '#ec4899' },
            { name: 'Headless', when: '提供逻辑和 a11y，样式完全开放', ex: 'Dropdown, Combobox, DatePicker', lib: 'React Aria', color: '#38bdf8' },
          ].map((p, i) => (
            <div key={i} className="ds-card" style={{ borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontWeight: 700, color: p.color, fontSize: '0.88rem', marginBottom: '0.4rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ds-muted)', marginBottom: '0.3rem' }}>📌 {p.when}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ds-muted)', marginBottom: '0.3rem' }}>💡 {p.ex}</div>
              <div style={{ fontSize: '0.82rem', color: p.color }}>📦 {p.lib}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
