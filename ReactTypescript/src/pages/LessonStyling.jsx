import { useState } from 'react';
import './LessonCommon.css';

const PATTERNS = [
  {
    key: 'compound', name: '复合组件', icon: '🧩',
    desc: '父组件通过 Context 和子组件隐式通信，让用户灵活组合',
    when: 'Select/Tabs/Accordion 等有固定子组件结构的复杂组件',
    code: `// 复合组件（Compound Components）
// 目标：<Select> 和 <Select.Option> 隐式共享状态

const SelectContext = createContext<SelectContextType | null>(null);

function Select({ children, value, onChange }: SelectProps) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select-container">{children}</div>
    </SelectContext.Provider>
  );
}

// 子组件通过 Context 访问父状态
Select.Option = function Option({ value, children }: OptionProps) {
  const ctx = useContext(SelectContext)!;
  const isSelected = ctx.value === value;
  
  return (
    <div
      className={isSelected ? 'option selected' : 'option'}
      onClick={() => ctx.onChange(value)}
    >
      {children}
    </div>
  );
};

// 使用者可以灵活控制结构
<Select value={selected} onChange={setSelected}>
  <Select.Option value="react">React</Select.Option>
  <Select.Option value="vue">Vue</Select.Option>
  <Select.Option value="svelte">Svelte</Select.Option>
</Select>`,
  },
  {
    key: 'renderprops', name: 'Render Props', icon: '🎭',
    desc: '通过函数 prop 让调用者控制渲染逻辑（现在多用 Hook 替代）',
    when: '需要共享逻辑但不限定 UI 结构（已逐渐被 Hook 取代）',
    code: `// Render Props：逻辑的容器，渲染权交给调用者
// 现代写法更推荐用自定义 Hook，但在某些场景仍有用

// 追踪鼠标位置的 Render Prop 组件
function MouseTracker({ render }: { render: (pos: Position) => ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  
  return (
    <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
      {render(pos)}
    </div>
  );
}

// 使用者决定如何用鼠标位置渲染
<MouseTracker
  render={({ x, y }) => (
    <div style={{ position: 'fixed', left: x, top: y }}>
      🎯 ({x}, {y})
    </div>
  )}
/>

// ━━━━ 现代等价：自定义 Hook ━━━━
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return pos;
}

// 更简洁的使用方式（推荐）
function Cursor() {
  const { x, y } = useMousePosition();
  return <div style={{ left: x, top: y }}>🎯</div>;
}`,
  },
  {
    key: 'headless', name: 'Headless UI', icon: '🦴',
    desc: '分离逻辑与 UI，逻辑由库提供，样式完全自定义',
    when: '需要完全自定义样式但不想重写复杂交互逻辑（如 Radix UI、Headless UI）',
    code: `// Headless UI：逻辑 ✅，样式 ❌（自己写）
// 使用 @radix-ui/react-dialog 为例

import * as Dialog from '@radix-ui/react-dialog';

// Radix 提供了完整的对话框逻辑（可访问性/键盘/焦点管理）
// 你只需要写 className
function MyModal({ trigger, children }: ModalProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />   {/* 你写 CSS */}
        <Dialog.Content className="modal-content">    {/* 你写 CSS */}
          {children}
          <Dialog.Close className="modal-close">×</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// 使用
<MyModal trigger={<button>打开</button>}>
  <h2>自定义内容</h2>
  <p>样式完全由你决定</p>
</MyModal>

// 主流 Headless 库：
// @radix-ui         → 最全面，Next.js 首选
// @headlessui/react → Tailwind Labs 官方
// downshift         → 专注 select/combobox
// react-aria        → Adobe，可访问性最好`,
  },
  {
    key: 'controlled', name: '受控 vs 非受控', icon: '⚙️',
    desc: '表单元素的状态由 React 管理（受控）或 DOM 管理（非受控）',
    when: '受控：需要实时验证/联动/联表单；非受控：性能敏感/简单表单',
    code: `// ━━━━ 受控组件（Controlled）━━━━
// React state 是"唯一真相来源"
function ControlledForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    // 实时验证 ✅
    setError(val.includes('@') ? '' : '无效的邮箱格式');
  };

  return (
    <div>
      <input value={email} onChange={handleChange} />
      {error && <span className="error">{error}</span>}
      <p>已输入：{email}</p>
    </div>
  );
}

// ━━━━ 非受控组件（Uncontrolled）━━━━
// DOM 自己管状态，通过 ref 按需读取
function UncontrolledForm() {
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value;  // 提交时才读
    console.log('Submit:', email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={emailRef} defaultValue="" type="email" />
      <button type="submit">提交</button>
    </form>
  );
}

// ━━━━ 生产推荐：React Hook Form ━━━━
// 性能和体验最好，底层用非受控 + 智能触发验证
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('无效邮箱'),
  password: z.string().min(8, '至少8位'),
});

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit">提交</button>
    </form>
  );
}`,
  },
];

export default function LessonStyling() {
  const [pattern, setPattern] = useState('compound');
  const p = PATTERNS.find(x => x.key === pattern) ?? {};

  return (
    <div className="lesson-rt" style={{ background: 'var(--rt-bg)', minHeight: '100vh' }}>
      <div className="rt-hero">
        <div className="rt-badge purple">🎨 Module 04 · Components & Styling</div>
        <h1>组件设计模式与样式系统</h1>
        <p>优秀的 React 组件不只是"能用"，而是<strong>可复用</strong>、<strong>可维护</strong>、<strong>易理解</strong>。掌握这 4 种模式，加上 Tailwind CSS 的现代样式方案，让你的组件库达到开源水准。</p>
      </div>

      {/* Component Patterns */}
      <div className="rt-section">
        <div className="rt-section-title">🧩 4 种核心组件模式</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {PATTERNS.map(x => (
            <button key={x.key} className="rt-btn"
              style={{ background: pattern === x.key ? 'rgba(139,92,246,0.15)' : undefined, borderColor: pattern === x.key ? '#8b5cf6' : undefined, color: pattern === x.key ? '#a78bfa' : undefined }}
              onClick={() => setPattern(x.key)}>
              {x.icon} {x.name}
            </button>
          ))}
        </div>
        <div className="rt-card" style={{ borderColor: 'rgba(139,92,246,0.2)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
            <span style={{ fontWeight: 700 }}>{p.name}</span>
          </div>
          <div style={{ color: 'var(--rt-muted)', fontSize: '0.87rem', marginBottom: '0.5rem' }}>{p.desc}</div>
          <div style={{ fontSize: '0.82rem', color: '#a78bfa' }}>✅ 适用：{p.when}</div>
        </div>
        <div className="rt-code-wrap">
          <div className="rt-code-head">
            <div className="rt-code-dot" style={{ background: '#ef4444' }} /><div className="rt-code-dot" style={{ background: '#f59e0b' }} /><div className="rt-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{p.key}.tsx</span>
          </div>
          <div className="rt-code">{p.code}</div>
        </div>
      </div>

      {/* Tailwind CSS */}
      <div className="rt-section">
        <div className="rt-section-title">🎨 Tailwind CSS — 现代样式方案</div>
        <div className="rt-code-wrap">
          <div className="rt-code-head"><span>tailwind-patterns.tsx</span></div>
          <div className="rt-code">{`// ━━━━ Tailwind CSS 核心用法 ━━━━
// 不是 inline style——是预定义的原子类，构建时按需生成

// ❌ 传统 CSS（维护两个文件）
<button className="primary-btn">Click</button>
// .primary-btn { background: blue; padding: 8px 16px; border-radius: 6px; }

// ✅ Tailwind（一行搞定，co-location 更易维护）
<button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white
                    font-semibold transition-colors duration-200">
  Click
</button>

// ━━━━ 常用 Tailwind 模式 ━━━━
// 响应式（mobile-first）
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 暗色模式
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// Flexbox 布局
<div className="flex items-center justify-between gap-4 flex-wrap">

// 条件样式（推荐用 clsx/cn 库）
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// cn 函数：合并类名并处理冲突
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

function Button({ variant, disabled }: ButtonProps) {
  return (
    <button className={cn(
      "px-4 py-2 rounded-md font-semibold transition-all",
      variant === 'primary'   && "bg-blue-600 text-white hover:bg-blue-700",
      variant === 'secondary' && "border border-gray-300 hover:bg-gray-50",
      disabled && "opacity-50 cursor-not-allowed",
    )}>
      {children}
    </button>
  );
}

// ━━━━ Shadcn/UI：最佳 Tailwind + Radix 组合 ━━━━
// npx shadcn@latest init
// npx shadcn@latest add button dialog table form
// 代码直接复制到你的项目，完全可以自定义！`}</div>
        </div>
      </div>

      {/* Component Structure */}
      <div className="rt-section">
        <div className="rt-section-title">📁 推荐的组件文件结构</div>
        <div className="rt-code-wrap">
          <div className="rt-code-head"><span>component-structure.md</span></div>
          <div className="rt-code">{`src/
├── components/
│   ├── ui/              # 基础原子组件（Button/Input/Dialog）
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── index.ts    # 统一导出
│   ├── features/        # 业务功能组件（UserCard/ProductList）
│   │   ├── user/
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserCard.test.tsx
│   │   │   └── useUserCard.ts    # 组件逻辑 Hook
│   │   └── product/
│   └── layouts/         # 页面布局（Sidebar/Header）
├── hooks/               # 全局自定义 Hook
├── stores/              # Zustand stores
└── lib/                 # 工具函数

# 组件文件模板（标准结构）
// UserCard.tsx
interface UserCardProps {          // 1. Props 类型
  user: User;
  onEdit?: (id: number) => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  // 2. Hooks
  // 3. 事件处理
  // 4. 派生状态（useMemo）
  // 5. JSX
  return ( ... );
}

export type { UserCardProps };    // 导出类型（方便外部扩展）`}</div>
        </div>
      </div>
    </div>
  );
}
