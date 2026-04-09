import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './LessonCommon.css';

const HOOKS = [
  {
    key: 'useState', name: 'useState', color: '#61dafb',
    desc: '管理组件局部状态，状态改变触发重渲染',
    code: `import { useState } from 'react';

// 基础用法
function Counter() {
  const [count, setCount] = useState(0);         // 初始值 0
  const [text, setText]   = useState('');        // 初始值 ""
  const [user, setUser]   = useState<User|null>(null);  // TS 泛型

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>  {/* 函数式更新 */}
        +1
      </button>
    </div>
  );
}

// ⚠️ 常见陷阱：状态是引用类型时，必须创建新对象
const [items, setItems] = useState<string[]>([]);

// ❌ 错误：直接 push 不会触发重渲染
items.push('new item');

// ✅ 正确：返回新数组
setItems(prev => [...prev, 'new item']);
setItems(prev => prev.filter(x => x !== 'delete this'));

// ✅ 对象也要展开
setUser(prev => ({ ...prev!, name: 'new name' }));

// 懒初始化（计算初始值的代价大时）
const [heavy] = useState(() => computeExpensiveValue()); // 只执行一次`,
    pitfalls: ['直接 mutate 状态不触发重渲染', '异步函数中读取到旧状态（闭包陷阱）', '多个 setState 会批量合并（React 18 自动批处理）'],
  },
  {
    key: 'useEffect', name: 'useEffect', color: '#a78bfa',
    desc: '执行副作用（数据获取、DOM操作、订阅）',
    code: `import { useEffect, useState } from 'react';

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  // ━━━━ 依赖数组规则 ━━━━
  useEffect(() => {
    // 每次渲染后执行（不推荐！）
  });

  useEffect(() => {
    // 只在 mount 时执行一次
  }, []);

  useEffect(() => {
    // userId 变化时执行
    let cancelled = false;  // 防止竞态条件
    
    fetchUser(userId).then(user => {
      if (!cancelled) setUser(user);
    });

    // 清除函数（cleanup）：组件 unmount 或 userId 变化前执行
    return () => { cancelled = true; };
  }, [userId]);

  // ⚠️ 陷阱：React 严格模式下 effect 执行两次！
  // 这是为了帮你发现没有正确 cleanup 的副作用

  return <div>{user?.name}</div>;
}

// ✅ 现代推荐：用 React Query / SWR 替代 useEffect 做数据获取
// useEffect 只用于：DOM 直接操作、事件监听、第三方库集成`,
    pitfalls: ['忘记清除订阅/定时器导致内存泄漏', '依赖数组不完整导致旧数据', '在 effect 里直接 async（应该在内部定义 async 函数再调用）'],
  },
  {
    key: 'useMemo', name: 'useMemo & useCallback', color: '#10b981',
    desc: '缓存计算结果和函数引用，避免不必要的重计算',
    code: `import { useMemo, useCallback, memo } from 'react';

// useMemo：缓存计算结果
function FilteredList({ items, filter }: Props) {
  // ❌ 每次渲染都重新过滤（items 1万条时很慢）
  const list = items.filter(x => x.name.includes(filter));

  // ✅ 只有 items 或 filter 变化时才重新计算
  const filteredList = useMemo(
    () => items.filter(x => x.name.includes(filter)),
    [items, filter]
  );

  return <ul>{filteredList.map(item => <li>{item.name}</li>)}</ul>;
}

// useCallback：缓存函数引用（配合 React.memo 使用）
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次父组件渲染，handleClick 都是新引用
  //    → 导致 Child 也重新渲染！
  const handleClick = () => console.log('clicked');

  // ✅ 函数引用稳定，Child 不会因此重渲染
  const stableClick = useCallback(
    () => console.log('clicked'),
    []  // 无依赖，永远稳定
  );

  return <Child onClick={stableClick} />;
}

// React.memo：对子组件做 props 浅比较
const Child = memo(function Child({ onClick }: { onClick: () => void }) {
  console.log('Child renders');  // 只有 onClick 引用变化时才打印
  return <button onClick={onClick}>Click me</button>;
});

// 原则：不要过度优化！
// → 先写清晰代码，Profiler 发现瓶颈再加 memo/useMemo/useCallback`,
    pitfalls: ['过度使用 memo 反而更慢（比较本身有成本）', 'useMemo 依赖数组不完整导致缓存失效', 'useCallback 里读取旧状态（用 ref 解决）'],
  },
  {
    key: 'useRef', name: 'useRef', color: '#f59e0b',
    desc: '持久化引用：访问 DOM 元素 或 保存不触发渲染的值',
    code: `import { useRef, useEffect } from 'react';

// 用途1：访问 DOM 元素
function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();  // 组件挂载后聚焦
  }, []);

  return <input ref={inputRef} />;
}

// 用途2：保存不触发重渲染的值（相当于实例变量）
function Timer() {
  const [count, setCount]     = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const start = () => {
    intervalRef.current = setInterval(
      () => setCount(c => c + 1), 1000
    );
  };

  const stop = () => {
    clearInterval(intervalRef.current);  // 不更新 state，不触发渲染
  };

  return <div>{count} <button onClick={start}>Start</button> <button onClick={stop}>Stop</button></div>;
}

// 用途3：解决闭包陷阱（保存最新的 state/props）
function EventLogger() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count;  // 每次渲染同步最新值

  useEffect(() => {
    const handler = () => {
      // 闭包捕获的 count 是旧值！
      // countRef.current 始终是最新值 ✅
      console.log('current count:', countRef.current);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);  // 正确：空依赖，但通过 ref 访问最新值
}`,
    pitfalls: ['修改 ref.current 不触发重渲染（注意 vs state 的区别）', '初始值为 null 时，需要用可选链访问 ref.current?.xxx', 'forwardRef 用于让父组件访问子组件的 ref'],
  },
  {
    key: 'custom', name: '自定义 Hook', color: '#fb7185',
    desc: '提取重复逻辑，让组件更简洁',
    code: `// ━━━━ 自定义 Hook：useFetch ━━━━
// 把数据获取逻辑从组件里提取出来
import { useState, useEffect } from 'react';

interface FetchState<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
}

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null, loading: true, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));

    fetch(url)
      .then(r => r.json())
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch(err => { if (!cancelled) setState({ data: null, loading: false, error: err.message }); });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}

// 使用：组件变得极简
function UserList() {
  const { data, loading, error } = useFetch<User[]>('/api/users');

  if (loading) return <Spinner />;
  if (error)   return <ErrorMsg message={error} />;
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// ━━━━ 其他常见自定义 Hook ━━━━
function useLocalStorage<T>(key: string, initial: T) { /* ... */ }
function useDebounce<T>(value: T, delay: number): T   { /* ... */ }
function useWindowSize(): { width: number; height: number } { /* ... */ }
function useOnClickOutside(ref: RefObject<Element>, cb: () => void) { /* ... */ }`,
    pitfalls: ['Hook 名称必须以 use 开头', '只能在函数组件或其他 Hook 中调用（不能在条件判断里）', 'Hook 调用顺序必须稳定（不能在循环/条件里调用）'],
  },
];

export default function LessonReactHooks() {
  const [hook, setHook] = useState('useState');
  const h = HOOKS.find(x => x.key === hook) ?? {};

  return (
    <div className="lesson-rt" style={{ background: 'var(--rt-bg)', minHeight: '100vh' }}>
      <div className="rt-hero">
        <div className="rt-badge react">⚛️ Module 02 · React Hooks</div>
        <h1>React Hooks 深度精通</h1>
        <p>Hooks 彻底改变了 React 的写法。不只是会用——要理解<strong>每个 Hook 解决什么问题</strong>、<strong>底层原理是什么</strong>、<strong>有哪些坑</strong>，才能在生产代码里写出正确高效的组件。</p>
      </div>

      {/* Hook Selector */}
      <div className="rt-section">
        <div className="rt-section-title">🎣 Hook 深度解析</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {HOOKS.map(x => (
            <button key={x.key} className="rt-btn"
              style={{ borderColor: hook === x.key ? x.color : undefined, color: hook === x.key ? x.color : undefined, background: hook === x.key ? `${x.color}12` : undefined }}
              onClick={() => setHook(x.key)}>
              {x.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: h.color }} />
          <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{h.name}</span>
          <span style={{ color: 'var(--rt-muted)', fontSize: '0.87rem' }}>— {h.desc}</span>
        </div>

        <div className="rt-code-wrap">
          <div className="rt-code-head">
            <div className="rt-code-dot" style={{ background: '#ef4444' }} /><div className="rt-code-dot" style={{ background: '#f59e0b' }} /><div className="rt-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem', color: h.color }}>example.tsx</span>
          </div>
          <div className="rt-code">{h.code}</div>
        </div>

        <div style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f87171', marginBottom: '0.5rem' }}>⚠️ 常见陷阱：</div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--rt-muted)', fontSize: '0.85rem', lineHeight: 2 }}>
            {h.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </div>

      {/* Hooks Rules */}
      <div className="rt-section">
        <div className="rt-section-title">📜 Hooks 使用规则（违反就报错）</div>
        <div className="rt-grid-2">
          {[
            { rule: '只在函数组件或自定义 Hook 里调用', detail: '不能在普通 JS 函数、class 组件里调用 Hook', icon: '✅' },
            { rule: '只在顶层调用，不要在条件/循环里', detail: 'React 依赖 Hook 调用顺序来识别状态，换顺序就乱了', icon: '✅' },
            { rule: 'Hook 名称必须以 use 开头', detail: '这是约定，让 React 工具和 ESLint 能识别和检查', icon: '✅' },
            { rule: '依赖数组要诚实完整', detail: '用到的变量都要加进去，用 eslint-plugin-react-hooks 帮你检查', icon: '✅' },
          ].map((r, i) => (
            <div key={i} className="rt-card" style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '0.1rem' }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{r.rule}</div>
                <div style={{ color: 'var(--rt-muted)', fontSize: '0.83rem', lineHeight: 1.6 }}>{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hooks Decision Chart */}
      <div className="rt-section">
        <div className="rt-section-title">🗺️ 选择哪个 Hook？</div>
        <div className="rt-code-wrap">
          <div className="rt-code-head"><span>hook-selector.md</span></div>
          <div className="rt-code">{`我需要...                                    → 用什么 Hook
──────────────────────────────────────────────────────
保存会触发重渲染的数据                           → useState
执行数据获取/订阅/DOM操作                        → useEffect
保存不触发重渲染的数据（实例变量）                → useRef
直接操作 DOM 元素（focus/scroll/测量尺寸）        → useRef
缓存复杂计算结果（避免重复计算）                   → useMemo
缓存函数引用（配合 React.memo 防止子组件重渲染）   → useCallback
跨深层组件传递数据（避免 prop drilling）           → useContext
在更新前读取 DOM（如滚动位置）                    → useLayoutEffect
推迟非紧急 UI 更新（如大列表过滤）                → useTransition / useDeferredValue
复用上面的逻辑组合                               → 自定义 Hook

外部数据获取（API 请求）                         → React Query / SWR（推荐）
全局状态管理                                    → Zustand / Redux Toolkit`}</div>
        </div>
      </div>
    </div>
  );
}
