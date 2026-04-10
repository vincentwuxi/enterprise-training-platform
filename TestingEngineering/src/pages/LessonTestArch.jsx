import './LessonCommon.css';

const CODE = `// ━━━━ 测试架构（组织级测试策略）━━━━

// ━━━━ 1. 测试策略文档 ━━━━
# 项目测试策略
## 测试金字塔比例
- 单元测试：~200 个（Vitest，覆盖率 > 80%）
- 组件测试：~50 个（RTL，关键组件 + a11y）
- API 测试：~30 个（Supertest，所有 endpoint）
- E2E 测试：~15 个（Playwright，核心用户流程）
- 性能测试：~5 个（k6，关键 API SLA）

## CI 运行策略
- PR 提交：单元 + 组件 + API（< 3 分钟）
- Merge to main：+ E2E（< 10 分钟）
- 每日定时：+ 性能测试 + 视觉回归
- 发布前：全量测试 + 浸泡测试

## 覆盖率门禁
- Lines: 80%（阻断合并）
- Branches: 75%（警告）
- 新增代码: 90%（必须覆盖）

// ━━━━ 2. Flaky Test 治理 ━━━━
// Flaky Test = 有时通过有时失败的测试（最恶心的问题）

// 常见原因 & 解决方案：
// ┌──────────────────────┬─────────────────────────────┐
// │ 原因                 │ 解决方案                    │
// ├──────────────────────┼─────────────────────────────┤
// │ 竞态条件（Race）     │ await waitFor() 替代 sleep  │
// │ 外部依赖不稳定       │ Mock/Container 隔离         │
// │ 时间敏感             │ 用 fake timers              │
// │ 随机数据             │ 固定 seed 或固定测试数据    │
// │ 环境差异（CI/本地）  │ Docker 统一环境             │
// │ 测试间依赖           │ 每个测试独立 setup/teardown │
// │ 数据库状态污染       │ 事务回滚或测试数据隔离      │
// └──────────────────────┴─────────────────────────────┘

// Flaky Test 处理流程：
// 1. 标记为 @flaky → 不阻断 CI
// 2. 记录到 Flaky Test 看板
// 3. 每周 Flaky Test 会议 → 分配修复
// 4. 修复后移除 @flaky 标记
// 5. 超过 30 天未修复 → 删除测试

// ━━━━ 3. 测试数据管理 ━━━━
// ❌ 反模式：所有测试共享一份种子数据
// ✅ 正确：每个测试自己创建数据

// Factory 模式（推荐）
const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  ...overrides,
});

it('should display user name', () => {
  const user = createUser({ name: 'Alice' });
  render(<UserCard user={user} />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
});

// ━━━━ 4. 质量门禁（Quality Gate）━━━━
// PR 合并前必须满足的条件：
// ✅ 所有测试通过
// ✅ 覆盖率 > 80%
// ✅ 0 个 lint 错误
// ✅ 0 个 TypeScript 错误
// ✅ Bundle size 未超标
// ✅ 至少 1 个 Code Review Approval
// ✅ 无安全漏洞（Snyk/CodeQL）

// GitHub Branch Protection 配置：
// Settings → Branches → main → Require status checks
// → Required: lint, test, typecheck, coverage

// ━━━━ 5. 测试文化建设 ━━━━
// 代码覆盖率是"滞后指标"
// 测试文化是"领先指标"
//
// 文化指标：
// - 开发者是否主动写测试？（不是被逼的）
// - PR Review 是否检查测试质量？
// - Bug 修复是否先写回归测试？
// - 新功能是否有测试计划？
// - Flaky Test 是否被及时修复？`;

export default function LessonTestArch() {
  return (
    <div className="te-lesson">
      <div className="te-hero">
        <div className="te-badge">// MODULE 08 · TEST ARCHITECTURE</div>
        <h1>测试架构</h1>
        <p>个人写测试是技能，组织级测试策略是架构——<strong>测试金字塔比例、CI 运行策略、Flaky Test 治理流程、质量门禁</strong>。测试架构决定了一个团队是"被测试拖慢"还是"被测试加速"。</p>
      </div>

      <div className="te-section">
        <div className="te-section-title">🏗️ 测试架构全景</div>
        <div className="te-code-wrap">
          <div className="te-code-head">
            <div className="te-code-dot" style={{ background: '#ef4444' }} /><div className="te-code-dot" style={{ background: '#f59e0b' }} /><div className="te-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>test-strategy.md</span>
          </div>
          <div className="te-code">{CODE}</div>
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">🏁 测试工程全链路回顾</div>
        <div className="te-steps">
          {[
            { step: '1', name: '测试金字塔', desc: '70/20/10 比例 + ROI 分析 + 框架选型', color: '#059669' },
            { step: '2', name: '单元测试', desc: 'Vitest + Mock/Spy/快照 + 参数化 + 覆盖率', color: '#10b981' },
            { step: '3', name: '组件测试', desc: 'RTL 用户行为驱动 + 异步 + 表单 + a11y', color: '#7c3aed' },
            { step: '4', name: 'API 测试', desc: 'Supertest + 契约测试 + Testcontainers', color: '#38bdf8' },
            { step: '5', name: 'E2E 测试', desc: 'Playwright + POM + 视觉回归 + CI 集成', color: '#f97316' },
            { step: '6', name: '性能测试', desc: 'k6 四种模式 + SLA 验证 + 基准测试', color: '#fbbf24' },
            { step: '7', name: 'TDD 实战', desc: 'Red-Green-Refactor + 遗留代码策略', color: '#059669' },
            { step: '8', name: '测试架构', desc: '策略文档 + Flaky 治理 + 质量门禁', color: '#7c3aed' },
          ].map((s, i) => (
            <div key={i} className="te-step">
              <div className="te-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--te-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="te-tip">💡 <strong>与所有课程闭环</strong>：React+TS 课用 RTL 组件测试、Node.js 课用 Supertest API 测试、CI/CD 课用 Playwright E2E + 质量门禁、性能优化课用 k6 负载测试。测试工程是所有课程的"质量地基"。</div>
      </div>
    </div>
  );
}
