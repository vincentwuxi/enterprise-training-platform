import { useState } from 'react';
import './LessonCommon.css';

const TYPE_EXAMPLES = [
  {
    key: 'primitives', label: '基础类型',
    code: `// ━━━━ TypeScript 基础类型 ━━━━
// 原始类型
const name: string    = 'Alice';
const age: number     = 28;
const active: boolean = true;
const nothing: null   = null;
const missing: undefined = undefined;

// 字面量类型（更精确！）
let direction: 'left' | 'right' | 'up' | 'down' = 'left';
let httpStatus: 200 | 201 | 400 | 401 | 404 | 500 = 200;

// 数组
const nums: number[]       = [1, 2, 3];
const strs: Array<string>  = ['a', 'b'];

// 元组（固定长度+顺序的数组）
const point: [number, number]        = [10, 20];
const pair:  [string, number]        = ['age', 28];

// any（尽量避免！）vs unknown（类型安全的 any）
const dangerous: any     = "anything";  // ❌
const safer: unknown     = "anything";  // ✅ 使用前必须类型检查

// 类型断言（as）
const value = safer as string;          // 告诉 TS "我知道这是 string"`,
  },
  {
    key: 'interface', label: '接口与类型',
    code: `// ━━━━ interface vs type ━━━━
// interface：定义对象的"形状"，可扩展
interface User {
  id:       number;
  name:     string;
  email:    string;
  avatar?:  string;  // ? = 可选属性
  readonly createdAt: Date;  // readonly = 只读
}

// type：更灵活，可以定义联合/交叉类型
type Status = 'active' | 'inactive' | 'pending';
type ID     = string | number;

// 联合类型（Union）：A 或 B
type Result<T> = { data: T; error: null } | { data: null; error: string };

// 交叉类型（Intersection）：A 且 B
type AdminUser = User & { role: 'admin'; permissions: string[] };

// interface 可以声明合并（type 不行）
interface User { phone?: string; }  // ✅ 自动合并
// type User = { phone?: string }   // ❌ 报错：重复定义

// 实践建议：
// → 定义对象结构用 interface
// → 定义联合/变换类型用 type`,
  },
  {
    key: 'generics', label: '泛型',
    code: `// ━━━━ 泛型：类型的"变量" ━━━━
// 泛型函数：输入什么类型，返回什么类型
function identity<T>(value: T): T {
  return value;
}
const str  = identity<string>('hello');  // str: string
const num  = identity(42);               // 自动推断 num: number

// 泛型接口：API 响应的通用类型
interface ApiResponse<T> {
  data:    T;
  status:  number;
  message: string;
}

// 实际使用
type UserResponse    = ApiResponse<User>;
type UsersResponse   = ApiResponse<User[]>;
type ProductResponse = ApiResponse<{ id: number; name: string }>;

// 泛型约束（extends）：T 必须有某些属性
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
getLength('hello');      // ✅ string 有 length
getLength([1, 2, 3]);    // ✅ array 有 length
// getLength(42);        // ❌ number 没有 length

// 实战：通用的 fetch 函数
async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<T>;
}
const users = await fetchData<User[]>('/api/users');`,
  },
  {
    key: 'utility', label: 'Utility Types',
    code: `// ━━━━ TypeScript 内置 Utility Types ━━━━
interface User {
  id: number; name: string; email: string;
  password: string; createdAt: Date;
}

// Partial<T>：所有属性变可选（适合 update 操作）
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string; ... }

// Required<T>：所有属性变必填
type RequiredUser = Required<User>;

// Pick<T, K>：只保留指定属性
type UserPublic = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string }

// Omit<T, K>：排除指定属性（反向 Pick）
type UserWithoutPassword = Omit<User, 'password'>;

// Readonly<T>：所有属性变只读
type FrozenUser = Readonly<User>;

// Record<K, V>：键值映射类型
type UserMap = Record<string, User>;
// { [key: string]: User }

type Status = 'active' | 'inactive';
type StatusConfig = Record<Status, { label: string; color: string }>;

// ReturnType<T>：提取函数返回值类型
function createUser() { return { id: 1, name: 'Alice' }; }
type NewUser = ReturnType<typeof createUser>;  // { id: number; name: string }

// Parameters<T>：提取函数参数类型
function updateUser(id: number, data: Partial<User>) {}
type UpdateParams = Parameters<typeof updateUser>;  // [number, Partial<User>]`,
  },
  {
    key: 'narrowing', label: '类型守卫',
    code: `// ━━━━ 类型守卫（Type Narrowing）━━━━
type Cat = { meow: () => void; name: string };
type Dog = { bark: () => void; name: string };
type Animal = Cat | Dog;

// 方法1：typeof 守卫
function handle(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();  // TS 知道这里是 string
  }
  return value.toFixed(2);       // TS 知道这里是 number
}

// 方法2：in 操作符守卫
function makeSound(animal: Animal) {
  if ('meow' in animal) {
    animal.meow();  // TS 知道这里是 Cat
  } else {
    animal.bark();  // TS 知道这里是 Dog
  }
}

// 方法3：自定义类型守卫（is）
function isCat(animal: Animal): animal is Cat {
  return 'meow' in animal;
}

// 方法4：instanceof 守卫
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);  // TS 知道是 Error 类型
  }
}

// 方法5：非空断言（!）慎用
function processUser(user: User | null) {
  const name = user!.name;  // 告诉 TS "user 绝对不是 null"
  // 更好的做法：
  if (!user) throw new Error('User is required');
  const safeName = user.name;  // ✅
}`,
  },
];

const QUIZ = [
  { q: '什么时候用 interface，什么时候用 type？', a: '定义对象结构用 interface（支持声明合并，更语义化）；定义联合类型、元组、映射类型等用 type（更灵活）。实践中两者可以互换，保持项目一致性即可。' },
  { q: '泛型的本质是什么？', a: '泛型是"类型的变量"——让函数、接口、类在保持类型安全的前提下处理多种类型，避免重复定义（不用写 stringIdentity、numberIdentity...）。' },
  { q: '为什么要避免 any？', a: 'any 等于放弃类型检查，会传染（用了 any 的变量返回给其他变量也变 any），让 TypeScript 失去意义。用 unknown 替代 any，使用前强迫类型检查。' },
];

export default function LessonTypeScript() {
  const [tab, setTab] = useState('primitives');
  const [quizIdx, setQuizIdx] = useState(null);
  const t = TYPE_EXAMPLES.find(x => x.key === tab) ?? {};

  return (
    <div className="lesson-rt" style={{ background: 'var(--rt-bg)', minHeight: '100vh' }}>
      <div className="rt-hero">
        <div className="rt-badge ts">📘 Module 01 · TypeScript</div>
        <h1>TypeScript 类型系统精讲</h1>
        <p>从 <strong>JS 程序员</strong>到 <strong>TS 熟练者</strong>的关键一跳。掌握类型系统不是为了写更多代码——而是让编辑器成为你最聪明的同事，在运行前帮你发现 90% 的错误。</p>
      </div>

      {/* Why TS */}
      <div className="rt-section">
        <div className="rt-section-title">⚡ 为什么要用 TypeScript？</div>
        <div className="rt-grid-3">
          {[
            { icon: '🐛', t: '运行前发现错误', d: '80% 的 bug 是类型错误，TS 在编辑器里就能发现' },
            { icon: '🤝', t: '自动补全', d: '函数参数、对象属性、API 返回值全部有智能提示' },
            { icon: '📖', t: '代码即文档', d: '类型定义让别人（和3个月后的你）秒懂代码意图' },
            { icon: '🔧', t: '大型重构安全', d: '改一个类型，所有用到的地方都报错提示你修改' },
            { icon: '🏢', t: '团队协作', d: '接口类型定义是前后端对齐的契约，减少沟通成本' },
            { icon: '🚀', t: '主流生态', d: 'React/Next.js/Vite 全力支持，企业项目标配' },
          ].map((c, i) => (
            <div key={i} className="rt-card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{c.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.3rem' }}>{c.t}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--rt-muted)', lineHeight: 1.6 }}>{c.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Type Examples */}
      <div className="rt-section">
        <div className="rt-section-title">📚 核心类型系统（交互学习）</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {TYPE_EXAMPLES.map(x => (
            <button key={x.key} className={`rt-btn ts${tab === x.key ? '' : ''}`}
              style={{ background: tab === x.key ? 'rgba(49,120,198,0.2)' : undefined, borderColor: tab === x.key ? '#3b82f6' : undefined }}
              onClick={() => setTab(x.key)}>{x.label}</button>
          ))}
        </div>
        <div className="rt-code-wrap">
          <div className="rt-code-head">
            <div className="rt-code-dot" style={{ background: '#ef4444' }} />
            <div className="rt-code-dot" style={{ background: '#f59e0b' }} />
            <div className="rt-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>example.ts</span>
          </div>
          <div className="rt-code">{t.code}</div>
        </div>
      </div>

      {/* Cheatsheet */}
      <div className="rt-section">
        <div className="rt-section-title">🗺️ TypeScript 类型速查表</div>
        <div className="rt-card" style={{ overflowX: 'auto' }}>
          <table className="rt-table">
            <thead><tr><th>分类</th><th>语法</th><th>用途</th><th>例子</th></tr></thead>
            <tbody>
              {[
                ['字面量', 'type D = "a"|"b"', '限定具体值', '"left"|"right"'],
                ['联合', 'A | B', '或者关系', 'string | number'],
                ['交叉', 'A & B', '且关系（合并）', 'User & Admin'],
                ['泛型', 'T, <T extends X>', '类型变量', 'Array<T>'],
                ['Partial', 'Partial<T>', '全部可选', 'update 操作'],
                ['Pick', 'Pick<T,K>', '选取属性', '公开信息'],
                ['Omit', 'Omit<T,K>', '排除属性', '去密码字段'],
                ['Record', 'Record<K,V>', '键值映射', '状态配置表'],
                ['类型守卫', 'x is T', '类型收窄函数', 'isCat(x)'],
              ].map(([cat, syn, use, ex], i) => (
                <tr key={i}>
                  <td><span className="rt-tag ts">{cat}</span></td>
                  <td><code style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.8rem', color: '#61dafb' }}>{syn}</code></td>
                  <td style={{ color: 'var(--rt-muted)', fontSize: '0.85rem' }}>{use}</td>
                  <td style={{ color: '#a78bfa', fontSize: '0.82rem', fontFamily: 'JetBrains Mono,monospace' }}>{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz */}
      <div className="rt-section">
        <div className="rt-section-title">🧠 理解检验</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {QUIZ.map((q, i) => (
            <div key={i} className="rt-card" style={{ cursor: 'pointer' }} onClick={() => setQuizIdx(quizIdx === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Q{i + 1}. {q.q}</span>
                <span style={{ color: 'var(--rt-blue)', fontSize: '1.2rem' }}>{quizIdx === i ? '▲' : '▼'}</span>
              </div>
              {quizIdx === i && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--rt-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  {q.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
