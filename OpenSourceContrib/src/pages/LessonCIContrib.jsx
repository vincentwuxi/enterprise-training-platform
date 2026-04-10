import './LessonCommon.css';

const CODE = `# ━━━━ CI/CD 贡献（GitHub Actions）━━━━

# ━━━━ 1. 典型开源项目的 CI 流水线 ━━━━
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]   # 多版本测试
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "\${{ matrix.node-version }}" }
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4   # 上报覆盖率
        if: matrix.node-version == 20

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]   # 依赖 lint 和 test 通过
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

# ━━━━ 2. 可以贡献的 CI 改进 ━━━━
# ① 加速 CI（缓存依赖）
      - uses: actions/cache@v4
        with:
          path: ~/.npm
          key: "\${{ runner.os }}-node-\${{ hashFiles('package-lock.json') }}"

# ② 添加 Lint 检查
      - uses: reviewdog/action-eslint@v1   # PR 中内联显示 lint 错误
        with:
          reporter: github-pr-review

# ③ 添加 Bundle Size 检查
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: "\${{ secrets.GITHUB_TOKEN }}"
          # PR 中显示："Bundle size increased by 2.3KB"

# ④ 自动化 Release（Changesets）
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: changesets/action@v1
        with:
          publish: npm run release
        env:
          GITHUB_TOKEN: "\${{ secrets.GITHUB_TOKEN }}"
          NPM_TOKEN: "\${{ secrets.NPM_TOKEN }}"

# ━━━━ 3. 常见 CI 贡献场景 ━━━━
# - 修复 CI 偶尔失败（flaky test）
# - 添加新的 Node/Python/Rust 版本支持
# - 优化 CI 速度（缓存/并行/条件运行）
# - 添加 Dependabot / Renovate 自动依赖更新
# - 添加 CodeQL 安全扫描
# - 自动化 CHANGELOG 生成`;

export default function LessonCIContrib() {
  return (
    <div className="os-lesson">
      <div className="os-hero">
        <div className="os-badge">// MODULE 05 · CI/CD CONTRIBUTIONS</div>
        <h1>CI/CD 贡献</h1>
        <p>CI/CD 是开源项目的"质量守门员"——<strong>帮项目优化 CI 速度、修复 Flaky Test、添加覆盖率报告、设置自动化 Release</strong>。这类贡献技术含量高、维护者非常需要但很少有人做。</p>
      </div>

      <div className="os-section">
        <div className="os-section-title">⚙️ CI/CD 贡献指南</div>
        <div className="os-code-wrap">
          <div className="os-code-head">
            <div className="os-code-dot" style={{ background: '#ef4444' }} /><div className="os-code-dot" style={{ background: '#f59e0b' }} /><div className="os-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>ci.yml</span>
          </div>
          <div className="os-code">{CODE}</div>
        </div>
      </div>

      <div className="os-section">
        <div className="os-section-title">🎯 CI 贡献六方向</div>
        <div className="os-grid-3">
          {[
            { name: '缓存优化', desc: '减少依赖安装时间', impact: 'CI 速度 +50%', color: '#22c55e' },
            { name: 'Flaky Test 修复', desc: '找到并修复不稳定测试', impact: '维护者最头疼的问题', color: '#ef4444' },
            { name: '自动依赖更新', desc: 'Renovate/Dependabot 配置', impact: '安全漏洞自动修复', color: '#38bdf8' },
            { name: 'Bundle Size 检查', desc: 'PR 中自动报告体积变化', impact: '防止意外增大', color: '#f97316' },
            { name: '安全扫描', desc: 'CodeQL/Trivy 自动检查', impact: '发现潜在漏洞', color: '#a855f7' },
            { name: '自动 Release', desc: 'Changesets + 自动发布 npm', impact: '维护者一键发版', color: '#fbbf24' },
          ].map((c, i) => (
            <div key={i} className="os-card" style={{ borderLeft: `3px solid ${c.color}`, padding: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--os-muted)', marginBottom: '0.15rem' }}>{c.desc}</div>
              <div style={{ fontSize: '0.78rem', color: c.color }}>💡 {c.impact}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
