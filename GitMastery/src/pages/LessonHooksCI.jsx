import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Git Hooks', 'Pre-commit 框架', 'GitHub Actions', '自动化流水线'];

export default function LessonHooksCI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">⚡ module_06 — Hooks & CI/CD</div>
      <div className="fs-hero">
        <h1>Git Hooks 与 CI/CD：Pre-commit / Lint / 自动化</h1>
        <p>
          Git Hooks 是<strong>在特定事件时自动执行脚本</strong>的机制。
          搭配 Husky/pre-commit 框架，可以在提交前自动格式化代码、跑 lint、运行测试。
          再结合 GitHub Actions，构建从<strong>提交到部署</strong>的完整自动化流水线。
          <strong>好的工程团队，80% 的质量靠自动化保障</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚡ 自动化工具链</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🪝 Git Hooks 原生机制</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#a78bfa'}}></span> git_hooks.sh</div>
                <pre className="fs-code">{`# ═══ Git Hooks 是什么 ═══
# .git/hooks/ 目录下的可执行脚本
# 在特定 Git 事件触发时自动执行
# 退出码 0 → 继续操作; 非 0 → 阻止操作

ls .git/hooks/
# pre-commit.sample    → 提交前
# prepare-commit-msg.sample
# commit-msg.sample    → 提交信息写完后
# pre-push.sample      → push 前
# pre-rebase.sample    → rebase 前
# post-merge.sample    → merge 后

# ═══ 常用 Hook 时机 ═══
# ┌───────────────────┬─────────────────────────────┐
# │ Hook              │ 触发时机                     │
# ├───────────────────┼─────────────────────────────┤
# │ pre-commit        │ git commit 前               │
# │ prepare-commit-msg│ 编辑器打开前                │
# │ commit-msg        │ 提交信息写完后              │
# │ post-commit       │ 提交完成后                  │
# │ pre-push          │ git push 前                 │
# │ pre-rebase        │ git rebase 前               │
# │ post-merge        │ merge 完成后                │
# │ post-checkout     │ checkout/switch 后          │
# └───────────────────┴─────────────────────────────┘

# ═══ 手写 pre-commit hook ═══
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# 阻止提交 console.log
if git diff --cached --name-only | xargs grep -l 'console.log' 2>/dev/null; then
    echo "❌ Error: Found console.log in staged files!"
    echo "   Please remove before committing."
    exit 1
fi

# 阻止提交到 main 分支
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "main" ]; then
    echo "❌ Error: Direct commits to main are not allowed!"
    echo "   Please create a feature branch."
    exit 1
fi

echo "✅ Pre-commit checks passed"
EOF
chmod +x .git/hooks/pre-commit

# ═══ commit-msg hook: 校验提交信息格式 ═══
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|perf|test|chore|ci)(\(.+\))?: .{1,72}$"
if ! echo "$commit_msg" | head -1 | grep -qE "$pattern"; then
    echo "❌ Invalid commit message format!"
    echo "   Expected: type(scope): description"
    echo "   Example:  feat(auth): add OAuth2 login"
    exit 1
fi
EOF
chmod +x .git/hooks/commit-msg

# ⚠️ 问题: .git/hooks 不会被提交到 repo
# → 每个开发者需要手动设置 → 用框架解决`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐶 Husky + lint-staged 实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> husky_setup.sh</div>
                <pre className="fs-code">{`# ═══ Husky: 管理 Git Hooks 的标准工具 ═══
# 解决问题: 让 hooks 可以提交到 repo, 团队共享

# 安装
npm install --save-dev husky lint-staged
npx husky init                   # 创建 .husky/ 目录

# ═══ 配置 pre-commit hook ═══
# .husky/pre-commit
echo "npx lint-staged" > .husky/pre-commit

# ═══ lint-staged: 只检查暂存的文件 ═══
# package.json 中添加:
# {
#   "lint-staged": {
#     "*.{js,jsx,ts,tsx}": [
#       "eslint --fix",        // 自动修复 lint 问题
#       "prettier --write"     // 自动格式化
#     ],
#     "*.{css,scss}": [
#       "prettier --write"
#     ],
#     "*.{json,md}": [
#       "prettier --write"
#     ]
#   }
# }

# 效果: git commit 时自动:
# 1. 只处理已 git add 的文件 (不碰其他文件)
# 2. 运行 eslint --fix 修复代码问题
# 3. 运行 prettier 格式化代码
# 4. 如果修复失败 → 阻止提交

# ═══ commitlint: 校验提交信息 ═══
npm install --save-dev @commitlint/{cli,config-conventional}

# commitlint.config.js
# module.exports = {
#   extends: ['@commitlint/config-conventional'],
#   rules: {
#     'type-enum': [2, 'always', [
#       'feat', 'fix', 'docs', 'style', 'refactor',
#       'perf', 'test', 'chore', 'ci', 'build'
#     ]],
#     'subject-max-length': [2, 'always', 72],
#   }
# };

echo "npx commitlint --edit \$1" > .husky/commit-msg

# ═══ Python 项目: pre-commit 框架 ═══
# pip install pre-commit
# 创建 .pre-commit-config.yaml:
# repos:
#   - repo: https://github.com/psf/black
#     rev: 23.12.1
#     hooks:
#       - id: black
#   - repo: https://github.com/pycqa/isort
#     rev: 5.13.2
#     hooks:
#       - id: isort
#   - repo: https://github.com/pycqa/flake8
#     rev: 7.0.0
#     hooks:
#       - id: flake8
#   - repo: https://github.com/pre-commit/mirrors-mypy
#     rev: v1.8.0
#     hooks:
#       - id: mypy
#
# pre-commit install               # 安装 hooks
# pre-commit run --all-files       # 手动运行所有检查`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 GitHub Actions 实战模板</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> github_actions.yaml</div>
                <pre className="fs-code">{`# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# 并发: 同一分支的新提交取消旧的运行
concurrency:
  group: ci-${"${{ github.ref }}"}
  cancel-in-progress: true

jobs:
  # ═══ Job 1: 代码质量检查 ═══
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  # ═══ Job 2: 单元测试 ═══
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]    # 多版本测试
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${"${{ matrix.node-version }}"}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4  # 上传覆盖率
        with:
          token: ${"${{ secrets.CODECOV_TOKEN }}"}

  # ═══ Job 3: 构建 ═══
  build:
    needs: [lint, test]            # 依赖前两个 job
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

  # ═══ Job 4: 部署 (仅 main 分支) ═══
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production        # 需要审批
    steps:
      - uses: actions/download-artifact@v4
        with: { name: build-output, path: dist/ }
      - name: Deploy to Production
        run: |
          # 部署到 Vercel / AWS / GCP
          npx vercel deploy dist/ --prod --token=${"${{ secrets.VERCEL_TOKEN }}"}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 完整自动化流水线架构</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> full_pipeline.sh</div>
                <pre className="fs-code">{`# ═══ 完整的 DevOps 自动化链路 ═══
#
# 开发者提交代码:
# git push → GitHub
#     │
#     ├── Pre-commit (本地)
#     │   ├── lint-staged (ESLint + Prettier)
#     │   ├── commitlint (提交信息格式)
#     │   └── 单元测试 (快速子集)
#     │
#     ├── PR Check (GitHub Actions)
#     │   ├── Lint + TypeCheck
#     │   ├── 单元测试 + 覆盖率
#     │   ├── Build 验证
#     │   ├── Preview 部署 (Vercel/Netlify)
#     │   └── Danger.js / PR 自动评论
#     │
#     ├── Merge to Main
#     │   ├── 完整测试套件
#     │   ├── E2E 测试 (Playwright/Cypress)
#     │   ├── 安全扫描 (Snyk/Dependabot)
#     │   ├── 构建 Docker 镜像
#     │   └── 推送到 Container Registry
#     │
#     └── 部署
#         ├── Staging (自动)
#         ├── Canary/灰度 (自动, 监控指标)
#         └── Production (审批 或 自动)

# ═══ 自动化最佳实践 ═══
#
# 1. 本地检查要快 (< 10 秒):
#    → lint-staged 只检查变更文件
#    → 不要在 pre-commit 跑完整测试
#
# 2. CI 要有缓存:
#    → 缓存 node_modules / pip / Docker layers
#    → 首次运行 2min → 后续 30s
#
# 3. 并行化:
#    → lint / test / typecheck 并行运行
#    → matrix 测试多版本/多平台
#
# 4. 快速反馈:
#    → PR 评论中显示测试结果
#    → 发布覆盖率变化
#    → 发布 bundle size 变化

# ═══ 高级: Semantic Release ═══
# 基于 Conventional Commits 自动:
# 1. 决定版本号 (major/minor/patch)
# 2. 生成 CHANGELOG
# 3. 创建 Git Tag
# 4. 发布 npm 包
# 5. 创建 GitHub Release
#
# npm install --save-dev semantic-release
#
# 提交信息 → 版本号:
# feat: → minor (1.0.0 → 1.1.0)
# fix:  → patch (1.0.0 → 1.0.1)
# feat!: → major (1.0.0 → 2.0.0)
# BREAKING CHANGE: → major

# ═══ 自动化检查清单 ═══
# ┌──────────────────┬────────────┬──────────┐
# │ 阶段              │ 工具        │ 耗时     │
# ├──────────────────┼────────────┼──────────┤
# │ pre-commit       │ Husky      │ < 10s    │
# │ PR CI            │ GH Actions │ < 5min   │
# │ Merge CI         │ GH Actions │ < 15min  │
# │ Deploy           │ ArgoCD     │ < 5min   │
# │ 监控             │ Datadog    │ 持续     │
# └──────────────────┴────────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
