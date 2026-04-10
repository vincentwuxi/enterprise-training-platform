import './LessonCommon.css';

const CODE = `// ━━━━ React 组件测试（React Testing Library）━━━━
// 核心理念："测试用户行为，而不是实现细节"

// ━━━━ 1. 基础组件测试 ━━━━
// Counter.tsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('should start at 0', () => {
    render(<Counter />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('should increment on click', async () => {
    render(<Counter />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '+1' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: '+1' }));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('should reset to 0', async () => {
    render(<Counter />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '+1' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});

// ━━━━ 2. 异步组件测试 ━━━━
// UserProfile.tsx（调用 API）
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/' + userId)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); });
  }, [userId]);

  if (loading) return <div role="status">Loading...</div>;
  return <h1>{user.name}</h1>;
}

// UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';

// Mock fetch
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ name: 'Alice' }),
  });
});

it('should show loading then user name', async () => {
  render(<UserProfile userId="1" />);

  // 先显示 Loading
  expect(screen.getByRole('status')).toHaveTextContent('Loading...');

  // 等待异步加载完成
  await waitFor(() => {
    expect(screen.getByRole('heading')).toHaveTextContent('Alice');
  });
});

// ━━━━ 3. 表单测试 ━━━━
it('should submit form with valid data', async () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: 'Login' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});

it('should show validation error for empty email', async () => {
  render(<LoginForm onSubmit={vi.fn()} />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: 'Login' }));

  expect(screen.getByText('Email is required')).toBeInTheDocument();
});

// ━━━━ 4. a11y 断言（无障碍测试）━━━━
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<LoginForm onSubmit={vi.fn()} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// ━━━━ 5. 查询优先级（RTL 推荐顺序）━━━━
// 1. getByRole     → 最推荐（语义化，a11y 友好）
// 2. getByLabelText → 表单元素
// 3. getByText      → 文本内容
// 4. getByTestId    → 最后手段（维护成本高）
//
// ❌ 不推荐：
// getByClassName → 测试实现细节
// querySelector  → 耦合 DOM 结构`;

export default function LessonComponent() {
  return (
    <div className="te-lesson">
      <div className="te-hero">
        <div className="te-badge">// MODULE 03 · COMPONENT TESTING</div>
        <h1>React 组件测试</h1>
        <p>React Testing Library 的核心理念：<strong>"测试用户行为，而不是实现细节"</strong>——不要测试 state 是否变了，而是测试用户点击后屏幕上显示了什么。这让你敢重构而不怕测试全红。</p>
      </div>

      <div className="te-section">
        <div className="te-section-title">🧩 组件测试实战</div>
        <div className="te-code-wrap">
          <div className="te-code-head">
            <div className="te-code-dot" style={{ background: '#ef4444' }} /><div className="te-code-dot" style={{ background: '#f59e0b' }} /><div className="te-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>component.test.tsx</span>
          </div>
          <div className="te-code">{CODE}</div>
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">🔍 RTL 查询优先级</div>
        <div className="te-steps">
          {[
            { name: 'getByRole', desc: '最推荐 — 语义化查询，a11y 友好', ex: "getByRole('button', { name: 'Submit' })", color: '#059669' },
            { name: 'getByLabelText', desc: '表单元素 — 通过 label 关联', ex: "getByLabelText('Email')", color: '#10b981' },
            { name: 'getByText', desc: '文本内容 — 适合静态文案', ex: "getByText('Welcome back')", color: '#7c3aed' },
            { name: 'getByTestId', desc: '最后手段 — 维护成本高', ex: "getByTestId('user-avatar')", color: '#f97316' },
          ].map((q, i) => (
            <div key={i} className="te-step">
              <div className="te-step-num" style={{ background: `${q.color}18`, borderColor: q.color, color: q.color }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: 700, color: q.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{q.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--te-muted)', marginBottom: '0.15rem' }}>{q.desc}</div>
                <code style={{ fontSize: '0.75rem', color: '#6ee7b7', background: 'rgba(5,150,105,0.08)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{q.ex}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
