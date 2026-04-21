import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['🪝 Git Hooks', '🔧 Pre-commit 框架', '🔄 CI/CD 集成', '📦 自动化工作流'];

export default function LessonHooksCI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🪝 module_06 — Git Hooks 与 CI/CD</div>
      <div className="fs-hero">
        <h1>Git Hooks 与 CI/CD：Pre-commit / Lint / 自动化</h1>
        <p>
          Git Hooks 让你在 Git 操作的<strong>关键节点注入自定义逻辑</strong>——
          提交前自动格式化代码、推送前跑测试、合并后自动部署。
          结合 CI/CD 管线，构建<strong>质量门禁 + 自动化交付</strong>的完整体系。
        </p>
      </div>

      {/* 自动化流水线 */}
      <div className="pipeline">
        {[
          { icon:'✏️', text:'Code', sub:'编写代码', bg:'rgba(249,115,22,0.12)', color:'#fb923c' },
          { icon:'🪝', text:'Pre-commit', sub:'Lint + Format', bg:'rgba(139,92,246,0.12)', color:'#a78bfa' },
          { icon:'📝', text:'Commit', sub:'提交到本地', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
          { icon:'🪝', text:'Pre-push', sub:'Test', bg:'rgba(245,158,11,0.12)', color:'#fbbf24' },
          { icon:'🔼', text:'Push', sub:'推送到远程', bg:'rgba(6,182,212,0.12)', color:'#67e8f9' },
          { icon:'⚙️', text:'CI/CD', sub:'Build + Test + Deploy', bg:'rgba(239,68,68,0.12)', color:'#f87171' },
        ].map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="pipeline-arrow">→</span>}
            <div className="pipeline-stage" style={{background:s.bg, border:`1px solid ${s.color}33`, color:s.color}}>
              <span>{s.icon} {s.text}</span><small>{s.sub}</small>
            </div>
          </React.Fragment>
        ))}
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🪝 自动化质量保证</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>🪝 Git Hooks 全览</h3>
            <div className="concept-card">
              <h4>什么是 Git Hooks？</h4>
              <p>存放在 <code>.git/hooks/</code> 目录下的可执行脚本。Git 在特定操作（commit、push、merge 等）的前后自动触发这些脚本。</p>
              <p>脚本<strong>返回 0 = 放行</strong>，非 0 = 阻止操作。</p>
            </div>

            <h4 style={{color:'#fb923c', margin:'1rem 0 0.5rem'}}>常用 Hooks</h4>
            <table className="fs-table">
              <thead><tr><th>Hook</th><th>触发时机</th><th>典型用途</th><th>重要性</th></tr></thead>
              <tbody>
                <tr><td><code>pre-commit</code></td><td>commit 前</td><td>Lint、格式检查、类型检查</td><td><span className="fs-tag green">⭐⭐⭐</span></td></tr>
                <tr><td><code>commit-msg</code></td><td>提交信息写入后</td><td>校验 Conventional Commits 格式</td><td><span className="fs-tag green">⭐⭐</span></td></tr>
                <tr><td><code>pre-push</code></td><td>push 前</td><td>运行单元测试</td><td><span className="fs-tag amber">⭐⭐</span></td></tr>
                <tr><td><code>prepare-commit-msg</code></td><td>编辑器打开前</td><td>自动填充模板</td><td><span className="fs-tag amber">⭐</span></td></tr>
                <tr><td><code>post-merge</code></td><td>merge 完成后</td><td>自动 npm install</td><td><span className="fs-tag amber">⭐</span></td></tr>
                <tr><td><code>post-checkout</code></td><td>checkout 完成后</td><td>清理缓存、安装依赖</td><td><span className="fs-tag amber">⭐</span></td></tr>
              </tbody>
            </table>

            <div className="fs-code-wrap" style={{marginTop:'0.75rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> .git/hooks/pre-commit</div>
              <pre className="fs-code">{`#!/bin/sh
# 手写 pre-commit hook 示例

# 1. 检查是否有调试代码
if git diff --cached --diff-filter=ACM | grep -n "console.log\\|debugger\\|TODO:" ; then
  echo "❌ 发现调试代码! 请移除后再提交"
  exit 1
fi

# 2. 运行 lint (只检查暂存的文件)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\\.js$')
if [ -n "$STAGED_FILES" ]; then
  npx eslint $STAGED_FILES
  if [ $? -ne 0 ]; then
    echo "❌ ESLint 检查未通过!"
    exit 1
  fi
fi

# 3. 检查文件大小 (防止提交大文件)
MAX_SIZE=5242880  # 5MB
for file in $(git diff --cached --name-only); do
  size=$(wc -c < "$file" 2>/dev/null || echo 0)
  if [ "$size" -gt "$MAX_SIZE" ]; then
    echo "❌ $file 超过 5MB! 请用 Git LFS"
    exit 1
  fi
done

echo "✅ Pre-commit checks passed!"
exit 0`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>🔧 Pre-commit 框架 — 工业级方案</h3>
            <div className="concept-card">
              <h4>为什么不手写 Hooks？</h4>
              <p>手写 hooks 不会被 Git 共享（.git/hooks 不被跟踪）。需要专门的框架来管理 hooks 并让团队共享。</p>
            </div>

            <div className="comparison-grid">
              <div>
                <div className="label" style={{color:'#22c55e'}}>Husky (Node.js 生态)</div>
                <div className="fs-code-wrap">
                  <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> setup</div>
                  <pre className="fs-code">{`# 安装 Husky
npm install --save-dev husky
npx husky init

# .husky/pre-commit
npx lint-staged

# package.json 中配置 lint-staged：
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.css": "prettier --write",
    "*.md": "prettier --write"
  }
}`}</pre>
                </div>
              </div>
              <div>
                <div className="label" style={{color:'#f59e0b'}}>pre-commit (Python 生态)</div>
                <div className="fs-code-wrap">
                  <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> .pre-commit-config.yaml</div>
                  <pre className="fs-code">{`repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black
  - repo: https://github.com/PyCQA/flake8
    rev: 7.0.0
    hooks:
      - id: flake8`}</pre>
                </div>
              </div>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>commitlint — 校验提交信息</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> commitlint.config.js</div>
              <pre className="fs-code">{`// 安装: npm i -D @commitlint/{cli,config-conventional}
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'ci', 'revert'
    ]],
    'subject-max-length': [2, 'always', 72],
  }
};

// .husky/commit-msg:
// npx --no -- commitlint --edit $1
// → "add new feature" ❌ 被拒绝
// → "feat: add auth"  ✅ 通过`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>🔄 CI/CD 集成</h3>

            <div className="comparison-grid">
              <div>
                <div className="label" style={{color:'#f97316'}}>GitHub Actions</div>
                <div className="fs-code-wrap">
                  <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> .github/workflows/ci.yml</div>
                  <pre className="fs-code">{`name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.TOKEN }}
          publish_dir: ./dist`}</pre>
                </div>
              </div>
              <div>
                <div className="label" style={{color:'#f59e0b'}}>GitLab CI</div>
                <div className="fs-code-wrap">
                  <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> .gitlab-ci.yml</div>
                  <pre className="fs-code">{`stages:
  - lint
  - test
  - build
  - deploy

lint:
  stage: lint
  script:
    - npm ci
    - npm run lint
  only: [merge_requests]

test:
  stage: test
  script:
    - npm ci
    - npm test -- --coverage
  coverage: /Statements.*?(\\d+)%/

build:
  stage: build
  script:
    - npm ci && npm run build
  artifacts:
    paths: [dist/]

deploy:
  stage: deploy
  script:
    - rsync -avz dist/ server:/www/
  only: [main]`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>📦 自动化工作流最佳实践</h3>
            <div className="fs-grid-2">
              <div className="concept-card">
                <h4>🏷️ 自动版本发布</h4>
                <p>使用 <code>semantic-release</code> 根据 Conventional Commits 自动决定版本号、生成 CHANGELOG、创建 GitHub Release。</p>
              </div>
              <div className="concept-card">
                <h4>🤖 Dependabot / Renovate</h4>
                <p>自动检测过期依赖并创建 PR。配合 CI 自动测试，安全地保持依赖最新。</p>
              </div>
              <div className="concept-card">
                <h4>📊 PR 自动检查清单</h4>
                <p>CI 自动添加：bundle size 变化、测试覆盖率、Lighthouse 分数、TypeScript 类型安全检查。</p>
              </div>
              <div className="concept-card">
                <h4>🔐 Secret 扫描</h4>
                <p>使用 <code>gitleaks</code> / <code>trufflehog</code> 在 pre-commit 或 CI 中自动扫描泄露的密钥和凭证。</p>
              </div>
            </div>

            <div className="fs-code-wrap" style={{marginTop:'0.75rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> post-merge hook</div>
              <pre className="fs-code">{`#!/bin/sh
# .husky/post-merge — 合并后自动安装新依赖

# 检查 package.json 是否有变更
CHANGED_FILES="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

if echo "$CHANGED_FILES" | grep -q "package.json"; then
  echo "📦 package.json changed → running npm install..."
  npm install
fi

if echo "$CHANGED_FILES" | grep -q "Gemfile"; then
  echo "💎 Gemfile changed → running bundle install..."
  bundle install
fi`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
