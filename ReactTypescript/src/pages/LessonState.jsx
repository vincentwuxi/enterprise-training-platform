import { useState } from 'react';
import './LessonCommon.css';

const SOLUTIONS = [
  {
    key: 'context', name: 'Context API', tag: 'React 内置',
    color: '#61dafb', suitable: '主题/语言/用户信息等低频更新', notFor: '频繁更新的状态（会导致全树重渲染）',
    code: `// ━━━━ Context API：跨组件传递数据 ━━━━
// 1. 创建 Context（加 TypeScript 类型）
interface ThemeContextType {
  theme:     'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// 2. 自定义 Hook 封装（防止忘记包裹 Provider）
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}

// 3. Provider 组件
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light'|'dark'>('dark');
  const toggleTheme = useCallback(() => 
    setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 4. 任意层级使用
function Header() {
  const { theme, toggleTheme } = useTheme();  // 直接用，无需 prop drilling
  return <button onClick={toggleTheme}>{theme}</button>;
}

// ⚠️ Context 性能陷阱：
// Context value 变化 → 所有 Consumer 重渲染
// 解决：拆分 Context、或用 Zustand 替代`,
  },
  {
    key: 'zustand', name: 'Zustand', tag: '全局状态推荐',
    color: '#f59e0b', suitable: '全局 UI 状态、购物车、用户信息、多组件共享状态', notFor: '服务端数据（用 React Query）',
    code: `// ━━━━ Zustand：轻量级全局状态 ━━━━
// 安装：npm install zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. 定义 Store（TypeScript 完整支持）
interface CartStore {
  items:    CartItem[];
  total:    number;
  addItem:    (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart:  () => void;
}

const useCartStore = create<CartStore>()(
  persist(  // 持久化到 localStorage
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (item) => set(state => ({
        items: [...state.items, item],
        total: state.total + item.price,
      })),
      
      removeItem: (id) => set(state => ({
        items: state.items.filter(i => i.id !== id),
        total: state.total - (state.items.find(i => i.id === id)?.price ?? 0),
      })),
      
      clearCart: () => set({ items: [], total: 0 }),
    }),
    { name: 'cart-storage' }  // localStorage key
  )
);

// 2. 组件中使用（只订阅需要的状态！）
function CartBadge() {
  // 只订阅 items.length，不会因 total 变化重渲染
  const count = useCartStore(state => state.items.length);
  return <Badge>{count}</Badge>;
}

function CartTotal() {
  const total = useCartStore(state => state.total);
  return <span>¥{total.toFixed(2)}</span>;
}

// 3. 在任何地方操作 Store（无需 dispatch/action）
function AddToCartButton({ item }: { item: Product }) {
  const addItem = useCartStore(state => state.addItem);
  return <button onClick={() => addItem(item)}>加入购物车</button>;
}`,
  },
  {
    key: 'reactquery', name: 'TanStack Query', tag: '服务端状态推荐',
    color: '#10b981', suitable: 'API 数据获取/缓存/同步/分页/乐观更新', notFor: '纯客户端 UI 状态（用 Zustand）',
    code: `// ━━━━ TanStack Query（React Query）：服务端状态管理 ━━━━
// 安装：npm install @tanstack/react-query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 在 App.tsx 根组件包裹 Provider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 },  // 5分钟内数据视为新鲜
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
      <ReactQueryDevtools />  {/* 开发时查看缓存状态 */}
    </QueryClientProvider>
  );
}

// ━━━━ useQuery：数据获取（替代 useEffect + fetch）━━━━
function UserList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],             // 缓存 key（唯一标识）
    queryFn:  () => fetchUsers(),    // 获取数据的函数
    staleTime: 60_000,               // 1分钟内不重新请求
    refetchOnWindowFocus: true,      // 窗口重新激活时刷新
  });

  if (isLoading) return <Spinner />;
  if (isError)   return <p>Error: {error.message}</p>;
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// ━━━━ useMutation：数据写入（含乐观更新）━━━━
function CreateUser() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (newUser: CreateUserDTO) => createUser(newUser),
    
    // 乐观更新：先在 UI 里添加，等 API 返回再确认
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const prev = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (old: User[]) => [...old, { ...newUser, id: 'temp' }]);
      return { prev };  // 返回用于回滚的数据
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['users'], context?.prev);  // 失败时回滚
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });  // 重新获取最新数据
    },
  });

  return <button onClick={() => mutation.mutate({ name: 'Alice' })}>创建用户</button>;
}`,
  },
];

export default function LessonState() {
  const [tab, setTab] = useState('context');
  const s = SOLUTIONS.find(x => x.key === tab) ?? {};

  return (
    <div className="lesson-rt" style={{ background: 'var(--rt-bg)', minHeight: '100vh' }}>
      <div className="rt-hero">
        <div className="rt-badge purple">🗄️ Module 03 · State Management</div>
        <h1>现代状态管理全景</h1>
        <p>React 状态管理的最大误区是<strong>"选一个然后用在所有地方"</strong>。正确方式：把状态分类，用合适的工具管理对应的状态层。</p>
      </div>

      {/* State Classification */}
      <div className="rt-section">
        <div className="rt-section-title">🗂️ 状态分类（先分类，再选工具）</div>
        <div className="rt-card" style={{ overflowX: 'auto' }}>
          <table className="rt-table">
            <thead><tr><th>状态类型</th><th>例子</th><th>推荐工具</th><th>原因</th></tr></thead>
            <tbody>
              {[
                ['组件局部状态', '表单输入、弹窗开关、Tab 选中', 'useState', '不需要跨组件共享'],
                ['跨组件共享 UI 状态', '主题、语言、用户信息、购物车', 'Zustand', '简单直接，无需 Redux 样板代码'],
                ['服务端状态（API 数据）', '用户列表、文章详情', 'React Query', '自带缓存/加载/错误/重试'],
                ['表单状态', '注册表单、动态字段', 'React Hook Form', '性能最好，校验最方便'],
                ['URL 状态', '搜索词、筛选条件、分页', 'useSearchParams', '可分享、浏览器前进后退'],
              ].map(([type, ex, tool, reason], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{type}</td>
                  <td style={{ color: 'var(--rt-muted)', fontSize: '0.83rem' }}>{ex}</td>
                  <td><span className="rt-tag" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontFamily: 'JetBrains Mono,monospace' }}>{tool}</span></td>
                  <td style={{ color: 'var(--rt-muted)', fontSize: '0.82rem' }}>{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Solution Deep Dive */}
      <div className="rt-section">
        <div className="rt-section-title">🔬 工具深度解析</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {SOLUTIONS.map(x => (
            <button key={x.key} className="rt-btn"
              style={{ borderColor: tab === x.key ? x.color : undefined, color: tab === x.key ? x.color : undefined, background: tab === x.key ? `${x.color}12` : undefined }}
              onClick={() => setTab(x.key)}>
              {x.name} <span className="rt-tag ts" style={{ marginLeft: '0.3rem', padding: '0.1rem 0.4rem' }}>{x.tag}</span>
            </button>
          ))}
        </div>

        <div className="rt-grid-2" style={{ marginBottom: '1rem' }}>
          <div className="rt-card" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#34d399', marginBottom: '0.4rem' }}>✅ 适合场景</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--rt-muted)' }}>{s.suitable}</div>
          </div>
          <div className="rt-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f87171', marginBottom: '0.4rem' }}>❌ 不适合</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--rt-muted)' }}>{s.notFor}</div>
          </div>
        </div>
        <div className="rt-code-wrap">
          <div className="rt-code-head">
            <div className="rt-code-dot" style={{ background: '#ef4444' }} /><div className="rt-code-dot" style={{ background: '#f59e0b' }} /><div className="rt-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem', color: s.color }}>{s.name.toLowerCase().replace(' ', '-')}.tsx</span>
          </div>
          <div className="rt-code">{s.code}</div>
        </div>
      </div>

      {/* Architecture Tip */}
      <div className="rt-section">
        <div className="rt-section-title">🏗️ 推荐架构组合</div>
        <div className="rt-code-wrap">
          <div className="rt-code-head"><span>recommended-stack.md</span></div>
          <div className="rt-code">{`# 现代 React 状态管理推荐栈

├── 局部 UI 状态        → useState / useReducer
├── 复杂表单            → React Hook Form + Zod（数据校验）
├── 全局 UI 状态        → Zustand（购物车/主题/通知/用户信息）
├── 服务端数据          → TanStack Query（CRUD/分页/缓存/同步）
├── URL/路由状态        → React Router / Next.js useSearchParams
└── 实时数据            → TanStack Query + WebSocket / SSE

# 架构分层：

[UI 组件] ←→ [Zustand Store] ←→ [Local State]
                     ↕
             [TanStack Query]
                     ↕
              [API / Server]

# 规则：
- React Query cache 永远是"真相的唯一来源"（不要把 API 数据存入 Zustand！）
- Zustand 只存 API 获取不到的纯客户端状态
- 能用 URL 表达的状态就用 URL（支持分享和书签）`}</div>
        </div>
      </div>
    </div>
  );
}
