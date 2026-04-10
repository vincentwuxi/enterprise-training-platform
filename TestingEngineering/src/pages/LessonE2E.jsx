import { useState } from 'react';
import './LessonCommon.css';

const CODE_PW = `// ━━━━ Playwright E2E 测试 ━━━━
// 微软出品，支持 Chromium/Firefox/WebKit 三大引擎

// ━━━━ 1. 安装 & 配置 ━━━━
// npm init playwright@latest
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,  // CI 中自动重试
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',   // 失败时截图
    video: 'retain-on-failure',      // 失败时保留视频
    trace: 'on-first-retry',         // 重试时录制 Trace
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',   use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});

// ━━━━ 2. 基础 E2E 测试 ━━━━
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // 填写表单
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // 验证跳转到首页
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading')).toContainText('Welcome');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');  // 不跳转
  });
});

// ━━━━ 3. Page Object Model（POM）━━━━
// 封装页面交互，避免重复代码
// pages/login-page.ts
class LoginPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async getErrorMessage() {
    return this.page.getByTestId('error-message');
  }
}

// 使用：
test('login with POM', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});`;

const CODE_VISUAL = `// ━━━━ 视觉回归测试 ━━━━
// "像素级"对比：UI 是否和上次一样？

// ━━━━ 1. Playwright 截图对比 ━━━━
test('homepage should match screenshot', async ({ page }) => {
  await page.goto('/');
  // 等待所有动画完成
  await page.waitForLoadState('networkidle');

  // 全页截图对比
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01,    // 允许 1% 像素差异
    animations: 'disabled',     // 禁用动画
  });
});

test('button states should match', async ({ page }) => {
  await page.goto('/components/button');

  // 元素级截图
  const button = page.getByRole('button', { name: 'Submit' });
  await expect(button).toHaveScreenshot('button-default.png');

  // Hover 状态
  await button.hover();
  await expect(button).toHaveScreenshot('button-hover.png');

  // Focus 状态
  await button.focus();
  await expect(button).toHaveScreenshot('button-focus.png');
});

// ━━━━ 2. Chromatic（Storybook 视觉回归）━━━━
// 与设计系统课程闭环！
// 自动对每个 Story 截图 → 对比上一版本 → PR 中显示差异
//
// 工作流：
// 1. 开发者修改组件
// 2. CI 中运行 Chromatic
// 3. Chromatic 截图所有 Stories
// 4. 与基线对比 → 发现差异
// 5. 在 PR 中显示 "2 changes detected"
// 6. 设计师/工程师审核 → Accept / Deny

// ━━━━ 3. CI 集成 ━━━━
# .github/workflows/e2e.yml
name: E2E Tests
on: [pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

// ━━━━ 4. 常见 E2E 反模式 ━━━━
// ❌ 用 sleep 等待 → 用 waitForSelector / expect
// ❌ 测试第三方服务 → 用 route.fulfill Mock
// ❌ 每个功能都写 E2E → 只测关键路径
// ❌ 依赖测试执行顺序 → 每个测试独立
// ❌ 在 E2E 中测试边界值 → 那是单元测试的事`;

export default function LessonE2E() {
  const [tab, setTab] = useState('pw');
  const tabs = [
    { key: 'pw',     label: '🎭 Playwright', code: CODE_PW },
    { key: 'visual', label: '📸 视觉回归 & CI', code: CODE_VISUAL },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="te-lesson">
      <div className="te-hero">
        <div className="te-badge">// MODULE 05 · E2E TESTING</div>
        <h1>E2E 测试</h1>
        <p>E2E 测试是"最后一道防线"——<strong>Playwright 在真实浏览器中模拟用户操作，Page Object 封装页面交互，视觉回归像素级对比 UI 变化</strong>。E2E 不需要多，但关键流程一个都不能少。</p>
      </div>

      <div className="te-section">
        <div className="te-section-title">🎭 E2E 测试</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`te-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="te-code-wrap">
          <div className="te-code-head">
            <div className="te-code-dot" style={{ background: '#ef4444' }} /><div className="te-code-dot" style={{ background: '#f59e0b' }} /><div className="te-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'pw' ? 'login.spec.ts' : 'visual.spec.ts'}</span>
          </div>
          <div className="te-code">{t.code}</div>
        </div>
      </div>

      <div className="te-section">
        <div className="te-section-title">📊 Playwright vs Cypress</div>
        <div className="te-card" style={{ overflowX: 'auto' }}>
          <table className="te-table">
            <thead><tr><th>维度</th><th>Playwright</th><th>Cypress</th></tr></thead>
            <tbody>
              {[
                ['多浏览器', '✅ Chromium/FF/WebKit', '⚠️ 主要 Chrome'],
                ['多标签页', '✅ 原生支持', '❌ 不支持'],
                ['iframe', '✅ 原生支持', '⚠️ 有限'],
                ['速度', '⚡ 快（并行）', '🔶 中等'],
                ['调试', '✅ Trace Viewer', '✅ Time Travel'],
                ['社区', '🔵 增长中', '🟢 成熟'],
                ['推荐', '⭐ 新项目首选', '⭐ 已有项目'],
              ].map(([dim, pw, cy], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{dim}</td>
                  <td>{pw}</td>
                  <td>{cy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
