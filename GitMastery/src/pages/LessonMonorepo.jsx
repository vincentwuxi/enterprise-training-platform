import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['📦 Submodule', '🌳 Subtree', '🏗️ Monorepo 工具', '📊 方案选型'];

export default function LessonMonorepo() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">📦 module_07 — Monorepo 与大型仓库</div>
      <div className="fs-hero">
        <h1>Monorepo 与大型仓库：Submodule / Subtree / Nx / Turborepo</h1>
        <p>
          当项目规模增长，你会面临<strong>多仓库 (Polyrepo) vs 单仓库 (Monorepo)</strong> 的选择。
          本模块深入 Git Submodule/Subtree 的跨仓库管理，以及 Nx/Turborepo
          等现代 Monorepo 构建工具。<strong>Google 和 Meta 的整个代码库都在一个仓库中</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📦 大型仓库管理</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>📦 Git Submodule — "仓库中的仓库"</h3>
            <div className="concept-card">
              <h4>Submodule 的本质</h4>
              <p>Submodule 在父仓库中保存一个<strong>指向子仓库特定 commit 的引用</strong>。子仓库保持独立的 .git 目录和完整历史。</p>
              <p>类比：就像在项目中放了一个"书签"，指向另一个仓库的某个版本。</p>
            </div>

            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> submodule_ops.sh</div>
              <pre className="fs-code">{`# ═══ 添加 Submodule ═══
git submodule add https://github.com/lib/shared-utils.git libs/utils
# 创建 .gitmodules 文件 + libs/utils 目录

# ═══ Clone 含 Submodule 的仓库 ═══
git clone --recurse-submodules https://github.com/my/project.git
# 或者分步:
git clone https://github.com/my/project.git
git submodule init               # 注册 submodule
git submodule update             # 拉取 submodule 代码

# ═══ 更新 Submodule 到最新 ═══
git submodule update --remote     # 拉取子仓库最新提交
# 然后在父仓库 commit 这个变更:
git add libs/utils
git commit -m "chore: update shared-utils to latest"

# ═══ 遍历所有 Submodule ═══
git submodule foreach 'git pull origin main'
git submodule foreach 'git checkout main && git pull'

# ═══ 删除 Submodule (步骤较复杂) ═══
git submodule deinit libs/utils
git rm libs/utils
rm -rf .git/modules/libs/utils
git commit -m "chore: remove shared-utils submodule"`}</pre>
            </div>

            <div className="warning-box">
              ⚠️ <strong>Submodule 常见坑</strong>：忘记 <code>--recurse-submodules</code> 导致代码不全；submodule 指向的是 commit 而非分支，更新后要在父仓库重新 commit。
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>🌳 Git Subtree — 更简单的替代方案</h3>
            <div className="concept-card">
              <h4>Subtree vs Submodule</h4>
              <p>Subtree 把外部仓库的代码<strong>直接合并到目录中</strong>，不需要 .gitmodules 文件，clone 时自动包含所有代码。对使用者完全透明。</p>
            </div>

            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> subtree_ops.sh</div>
              <pre className="fs-code">{`# ═══ 添加 Subtree ═══
git subtree add --prefix=libs/utils \\
  https://github.com/lib/shared-utils.git main --squash

# ═══ 拉取更新 ═══
git subtree pull --prefix=libs/utils \\
  https://github.com/lib/shared-utils.git main --squash

# ═══ 推送修改回上游 ═══
# 如果你在主仓库中修改了 subtree 的代码:
git subtree push --prefix=libs/utils \\
  https://github.com/lib/shared-utils.git feature/fix

# ═══ 简化: 添加 remote 别名 ═══
git remote add utils https://github.com/lib/shared-utils.git
git subtree pull --prefix=libs/utils utils main --squash`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>Submodule vs Subtree</h4>
            <table className="fs-table">
              <thead><tr><th>特性</th><th>Submodule</th><th>Subtree</th></tr></thead>
              <tbody>
                <tr><td>Clone 体验</td><td>需要 <code>--recurse</code></td><td>✅ 自动包含</td></tr>
                <tr><td>独立历史</td><td>✅ 完全独立</td><td>混合在一起</td></tr>
                <tr><td>学习成本</td><td>较高</td><td>✅ 较低</td></tr>
                <tr><td>回推修改</td><td>✅ 直接操作</td><td>需要 subtree push</td></tr>
                <tr><td>CI/CD</td><td>需特殊配置</td><td>✅ 无需配置</td></tr>
                <tr><td>推荐场景</td><td>大型共享库</td><td>小型依赖</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>🏗️ 现代 Monorepo 工具</h3>

            <div className="fs-grid-2">
              <div className="concept-card" style={{borderColor:'rgba(6,182,212,0.3)'}}>
                <h4 style={{color:'#67e8f9'}}>🏎️ Turborepo</h4>
                <p>Vercel 出品。<strong>增量构建 + 远程缓存</strong>。配置简单，适合 JavaScript/TypeScript 项目。</p>
                <ul>
                  <li>智能任务调度 (拓扑排序)</li>
                  <li>远程缓存 (Vercel Remote Cache)</li>
                  <li>增量构建 (只构建变更的包)</li>
                </ul>
              </div>
              <div className="concept-card" style={{borderColor:'rgba(139,92,246,0.3)'}}>
                <h4 style={{color:'#a78bfa'}}>🔧 Nx</h4>
                <p>Nrwl 出品。<strong>依赖图分析 + 代码生成器</strong>。支持 React/Angular/Node 等。</p>
                <ul>
                  <li>受影响项目检测 (affected)</li>
                  <li>分布式任务执行 (Nx Cloud)</li>
                  <li>插件生态 (代码脚手架)</li>
                </ul>
              </div>
              <div className="concept-card" style={{borderColor:'rgba(249,115,22,0.3)'}}>
                <h4 style={{color:'#fb923c'}}>📦 pnpm Workspaces</h4>
                <p>轻量级方案，用 pnpm 内建的 workspace 功能管理多包。不需要额外工具。</p>
                <ul>
                  <li>硬链接节省磁盘空间</li>
                  <li>内置 workspace 协议</li>
                  <li>与 Turborepo 搭配最佳</li>
                </ul>
              </div>
              <div className="concept-card" style={{borderColor:'rgba(34,197,94,0.3)'}}>
                <h4 style={{color:'#4ade80'}}>🐻 Bazel / Buck2</h4>
                <p>Google/Meta 级别的构建系统。支持<strong>任意语言</strong>的增量构建和远程执行。</p>
                <ul>
                  <li>语言无关 (Go, Java, Python...)</li>
                  <li>分布式远程执行</li>
                  <li>学习成本极高</li>
                </ul>
              </div>
            </div>

            <div className="fs-code-wrap" style={{marginTop:'0.75rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> turbo.json</div>
              <pre className="fs-code">{`// Turborepo 配置示例
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],      // 先构建依赖包
      "outputs": ["dist/**"]        // 缓存构建产物
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}

// 使用: turbo run build --filter=@app/web
// → 只构建 @app/web 及其依赖, 跳过未变更的包`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>📊 Polyrepo vs Monorepo</h3>
            <div className="comparison-grid">
              <div>
                <div className="label before">Polyrepo (多仓库)</div>
                <div className="sandbox-output">{`✅ 团队自治, 独立部署
✅ 权限隔离清晰
✅ 仓库体积小
❌ 跨项目修改困难
❌ 依赖版本不一致
❌ 代码共享困难
❌ 重构成本高`}</div>
              </div>
              <div>
                <div className="label after">Monorepo (单仓库)</div>
                <div className="sandbox-output">{`✅ 原子化跨项目修改
✅ 统一依赖版本
✅ 代码共享直接 import
✅ 统一 CI/CD + 工具链
❌ 仓库体积大
❌ 需要增量构建工具
❌ 权限管理更复杂
❌ 需要 Git 性能优化`}</div>
              </div>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>大型仓库性能优化</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> git_performance.sh</div>
              <pre className="fs-code">{`# ═══ Sparse Checkout (只检出部分目录) ═══
git clone --filter=blob:none --sparse https://github.com/org/monorepo.git
cd monorepo
git sparse-checkout set packages/my-app packages/shared

# ═══ Shallow Clone (只克隆最近的历史) ═══
git clone --depth=1 https://github.com/org/monorepo.git
git fetch --deepen=100           # 需要时加深历史

# ═══ Git LFS (大文件存储) ═══
git lfs install
git lfs track "*.psd" "*.zip" "*.bin"
git add .gitattributes

# ═══ 维护命令 ═══
git gc --aggressive              # 压缩优化
git maintenance start            # 自动后台维护 (Git 2.29+)
git fsck                         # 检查仓库完整性`}</pre>
            </div>

            <div className="tip-box">
              💡 <strong>推荐组合</strong>：pnpm workspaces + Turborepo + GitHub Actions。轻量级起步，按需扩展。
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
