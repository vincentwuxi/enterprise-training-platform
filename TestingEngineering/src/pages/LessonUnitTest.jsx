import { useState } from 'react';
import './LessonCommon.css';

const CODE_BASIC = `// ━━━━ 单元测试基础（Vitest / Jest）━━━━

// ━━━━ 1. 安装（Vitest 推荐）━━━━
// npm install -D vitest
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,        // 全局 describe/it/expect
    environment: 'node',  // 或 'jsdom' for React
    coverage: {
      provider: 'v8',     // 覆盖率引擎
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 80, branches: 80 },  // 覆盖率门禁
    },
  },
});

// ━━━━ 2. 基础断言 ━━━━
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

// math.test.ts
import { describe, it, expect } from 'vitest';
import { add, divide } from './math';

describe('add', () => {
  it('should add two positive numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it('should handle zero', () => {
    expect(add(0, 0)).toBe(0);
  });
});

describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should throw on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle floating point', () => {
    expect(divide(1, 3)).toBeCloseTo(0.333, 3);
  });
});`;

const CODE_MOCK = `// ━━━━ Mock / Stub / Spy ━━━━

// ━━━━ 1. Mock：替换整个模块 ━━━━
// user-service.ts
import { db } from './database';

export async function getUser(id: string) {
  const user = await db.findById(id);
  if (!user) throw new Error('User not found');
  return { ...user, displayName: user.name.toUpperCase() };
}

// user-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getUser } from './user-service';

// Mock 整个 database 模块
vi.mock('./database', () => ({
  db: {
    findById: vi.fn(),
  },
}));

import { db } from './database';

describe('getUser', () => {
  it('should return user with display name', async () => {
    // 设置 Mock 返回值
    (db.findById as any).mockResolvedValue({ id: '1', name: 'alice' });

    const user = await getUser('1');
    expect(user.displayName).toBe('ALICE');
    expect(db.findById).toHaveBeenCalledWith('1');
  });

  it('should throw if user not found', async () => {
    (db.findById as any).mockResolvedValue(null);
    await expect(getUser('999')).rejects.toThrow('User not found');
  });
});

// ━━━━ 2. Spy：监视函数调用（不替换实现）━━━━
it('should call logger on error', () => {
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  handleError(new Error('test'));
  
  expect(logSpy).toHaveBeenCalledWith('Error:', 'test');
  logSpy.mockRestore();  // 恢复原始实现
});

// ━━━━ 3. 快照测试（Snapshot）━━━━
it('should match snapshot', () => {
  const result = generateConfig({ env: 'production', port: 3000 });
  expect(result).toMatchInlineSnapshot(\`
    {
      "env": "production",
      "port": 3000,
      "debug": false,
    }
  \`);
});

// ━━━━ 4. 参数化测试 ━━━━
it.each([
  [1, 1, 2],
  [0, 0, 0],
  [-1, 1, 0],
  [100, 200, 300],
])('add(%i, %i) = %i', (a, b, expected) => {
  expect(add(a, b)).toBe(expected);
});

// ━━━━ 5. 异步测试 ━━━━
it('should fetch data', async () => {
  const data = await fetchUser('1');
  expect(data).toEqual({ id: '1', name: 'Alice' });
});

// 超时控制
it('should complete within 1 second', async () => {
  await expect(slowOperation()).resolves.toBeDefined();
}, 1000);  // 超过 1 秒即失败`;

export default function LessonUnitTest() {
  const [tab, setTab] = useState('basic');
  const tabs = [
    { key: 'basic', label: '🧪 基础断言', code: CODE_BASIC },
    { key: 'mock',  label: '🎭 Mock / Spy / 快照', code: CODE_MOCK },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="te-lesson">
      <div className="te-hero">
        <div className="te-badge">// MODULE 02 · UNIT TESTING</div>
        <h1>单元测试</h1>
        <p>单元测试是金字塔的"地基"——<strong>1ms 级速度、零外部依赖、精确定位到函数级的错误</strong>。Vitest 比 Jest 快 10 倍，Mock/Spy 让你隔离一切外部依赖，快照测试防止意外输出变更。</p>
      </div>

      <div className="te-section">
        <div className="te-section-title">🧪 单元测试核心</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`te-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="te-code-wrap">
          <div className="te-code-head">
            <div className="te-code-dot" style={{ background: '#ef4444' }} /><div className="te-code-dot" style={{ background: '#f59e0b' }} /><div className="te-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'basic' ? 'math.test.ts' : 'user-service.test.ts'}</span>
          </div>
          <div className="te-code">{t.code}</div>
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">📊 覆盖率指标</div>
        <div className="te-grid-4">
          {[
            { name: 'Lines', desc: '行覆盖率', target: '≥80%', color: '#059669' },
            { name: 'Branches', desc: '分支覆盖率', target: '≥80%', color: '#7c3aed' },
            { name: 'Functions', desc: '函数覆盖率', target: '≥90%', color: '#38bdf8' },
            { name: 'Statements', desc: '语句覆盖率', target: '≥80%', color: '#f97316' },
          ].map((m, i) => (
            <div key={i} className="te-metric" style={{ borderTop: `2px solid ${m.color}` }}>
              <div className="te-metric-val" style={{ color: m.color, fontSize: '1.1rem' }}>{m.target}</div>
              <div className="te-metric-label">{m.name}：{m.desc}</div>
            </div>
          ))}
        </div>
        <div className="te-tip">💡 <strong>覆盖率陷阱</strong>：100% 覆盖率 ≠ 没有 Bug。覆盖率只说明"代码被执行了"，不说明"逻辑是正确的"。追求 80% 覆盖率 + 高质量断言，比追求 100% 覆盖率更有价值。</div>
      </div>
    </div>
  );
}
