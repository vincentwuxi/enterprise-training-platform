import './LessonCommon.css';

const CODE = `// ━━━━ TDD 实战（Test-Driven Development）━━━━

// ━━━━ 1. Red-Green-Refactor 循环 ━━━━
// 🔴 Red：先写一个失败的测试
// 🟢 Green：写最少的代码让测试通过
// 🔵 Refactor：重构代码（测试保护下安全重构）

// ━━━━ 实战演练：实现一个密码校验器 ━━━━

// 🔴 Step 1：写第一个失败测试
describe('PasswordValidator', () => {
  it('should reject password shorter than 8 characters', () => {
    expect(validatePassword('short')).toEqual({
      valid: false,
      errors: ['Password must be at least 8 characters'],
    });
  });
});

// 🟢 Step 2：写最少代码让测试通过
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  return { valid: errors.length === 0, errors };
}
// ✅ 测试通过！

// 🔴 Step 3：加第二个测试
  it('should require at least one uppercase letter', () => {
    expect(validatePassword('abcdefgh')).toEqual({
      valid: false,
      errors: ['Password must contain an uppercase letter'],
    });
  });

// 🟢 Step 4：更新代码
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  return { valid: errors.length === 0, errors };
}
// ✅ 测试通过！

// 🔴 继续添加规则...
  it('should require at least one number', () => {
    expect(validatePassword('Abcdefgh')).toEqual({
      valid: false,
      errors: ['Password must contain a number'],
    });
  });

  it('should accept valid password', () => {
    expect(validatePassword('Abcdefg1')).toEqual({
      valid: true,
      errors: [],
    });
  });

// 🔵 Refactor：提取规则模式
const RULES = [
  { test: (p) => p.length >= 8, msg: 'at least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), msg: 'an uppercase letter' },
  { test: (p) => /[0-9]/.test(p), msg: 'a number' },
  { test: (p) => /[!@#$]/.test(p), msg: 'a special character' },
];

function validatePassword(password) {
  const errors = RULES
    .filter(rule => !rule.test(password))
    .map(rule => 'Password must contain ' + rule.msg);
  return { valid: errors.length === 0, errors };
}
// ✅ 所有测试仍然通过！重构成功！

// ━━━━ 2. TDD 在遗留代码中的应用 ━━━━
// 遗留代码 = 没有测试的代码
// Michael Feathers《Working Effectively with Legacy Code》
//
// 策略："先套上安全网，再改代码"
// 1. 找到要修改的代码
// 2. 找到"接缝"（Seam）= 可以注入 Mock 的点
// 3. 写"认定测试"（Characterization Test）
//    → 不是测正确性，而是记录当前行为
// 4. 在认定测试保护下进行修改
// 5. 添加新功能的 TDD 测试

// ━━━━ 3. TDD 的常见误解 ━━━━
// ❌ "TDD 太慢了" → 前期慢，后期快（Bug 减少 40-80%）
// ❌ "100% 覆盖率" → TDD 不追求覆盖率，追求设计
// ❌ "先写测试不知道写什么" → 说明你还没想清楚需求
// ❌ "UI 不适合 TDD" → 行为可以 TDD，布局用视觉回归
// ❌ "TDD = 单元测试" → TDD 可以用在任何层级`;

export default function LessonTDD() {
  return (
    <div className="te-lesson">
      <div className="te-hero">
        <div className="te-badge">// MODULE 07 · TDD</div>
        <h1>TDD 实战</h1>
        <p>TDD 不是"先写测试"这么简单——<strong>Red-Green-Refactor 循环是一种设计方法论：先定义"什么是正确的"，再写代码实现它，最后在测试保护下大胆重构</strong>。Bug 减少 40-80%，重构信心提升 100%。</p>
      </div>

      <div className="te-section">
        <div className="te-section-title">🔄 TDD 实战</div>
        <div className="te-code-wrap">
          <div className="te-code-head">
            <div className="te-code-dot" style={{ background: '#ef4444' }} /><div className="te-code-dot" style={{ background: '#f59e0b' }} /><div className="te-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>password-validator.test.ts</span>
          </div>
          <div className="te-code">{CODE}</div>
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">🔴🟢🔵 三步循环</div>
        <div className="te-grid-3">
          {[
            { step: '🔴 Red', action: '写一个失败的测试', why: '先定义"正确"是什么', color: '#ef4444' },
            { step: '🟢 Green', action: '写最少代码让测试通过', why: '不多不少，刚好满足', color: '#22c55e' },
            { step: '🔵 Refactor', action: '重构代码（测试保护）', why: '安全重构，信心满满', color: '#38bdf8' },
          ].map((s, i) => (
            <div key={i} className="te-card" style={{ borderTop: `3px solid ${s.color}`, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.step}</div>
              <div style={{ fontWeight: 600, color: s.color, fontSize: '0.88rem', marginBottom: '0.25rem' }}>{s.action}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--te-muted)' }}>{s.why}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
