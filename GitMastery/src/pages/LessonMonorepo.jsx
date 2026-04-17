import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Monorepo 理念', 'Submodule & Subtree', 'Nx & Turborepo', '大仓最佳实践'];

export default function LessonMonorepo() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">📦 module_07 — Monorepo</div>
      <div className="fs-hero">
        <h1>Monorepo 与大型仓库管理</h1>
        <p>
          Google 用一个仓库管理 <strong>20 亿行代码</strong>，Meta 的 Monorepo 有
          <strong>数百万个文件</strong>。本模块深入 Monorepo vs Polyrepo 的架构决策，
          掌握 Submodule/Subtree 的跨仓库引用，以及 Nx/Turborepo 等现代 Monorepo
          工具的高效构建与依赖管理。<strong>大型项目的 Git 管理是完全不同的技能</strong>。
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
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏢 Monorepo vs Polyrepo 决策</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> monorepo_vs_polyrepo.sh</div>
                <pre className="fs-code">{`# ═══ 概念对比 ═══
#
# Polyrepo (多仓库):
# ├── frontend-repo/
# ├── backend-api-repo/
# ├── shared-utils-repo/
# ├── mobile-app-repo/
# └── infra-config-repo/
#
# Monorepo (单仓库):
# monorepo/
# ├── apps/
# │   ├── frontend/
# │   ├── backend-api/
# │   └── mobile-app/
# ├── packages/
# │   ├── shared-utils/
# │   ├── ui-components/
# │   └── config/
# ├── infra/
# └── package.json

# ═══ 对比决策表 ═══
# ┌──────────────┬──────────────────┬──────────────────┐
# │ 维度          │ Monorepo         │ Polyrepo         │
# ├──────────────┼──────────────────┼──────────────────┤
# │ 代码共享      │ ✅ 直接 import   │ ❌ 需要发 npm 包  │
# │ 原子提交      │ ✅ 跨项目原子变更 │ ❌ 需要协调多 repo │
# │ 依赖管理      │ ✅ 单一版本      │ ❌ 版本不一致     │
# │ CI/CD        │ ⚠ 需要智能构建   │ ✅ 各自独立       │
# │ 权限控制      │ ⚠ 需要 CODEOWNERS│ ✅ repo 级隔离    │
# │ 仓库大小      │ ❌ 可能很大      │ ✅ 各自小巧       │
# │ 新人上手      │ ⚠ 复杂度高      │ ✅ 关注范围小     │
# │ 重构          │ ✅ 全局重构      │ ❌ 跨 repo 痛苦   │
# └──────────────┴──────────────────┴──────────────────┘

# ═══ 谁在用 Monorepo ═══
# Google:    Piper (内部工具, 20 亿行代码)
# Meta:      Mercurial → 自研 Eden
# Microsoft: Git + VFS for Git
# Uber:      Go Monorepo
# Airbnb:    JavaScript Monorepo
# Vercel:    Turborepo (他们自己开发的)
# Nx:        自己的 Monorepo 用 Nx 管理

# ═══ 何时选 Monorepo ═══
# ✅ 多个项目共享大量代码
# ✅ 团队需要频繁跨项目修改
# ✅ 想要统一的工具链和配置
# ✅ 需要原子化的跨项目提交
#
# ❌ 何时不要 Monorepo:
# ❌ 项目之间完全独立
# ❌ 不同项目使用不同语言/工具链
# ❌ 需要严格的访问控制`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 Submodule & Subtree</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> submodule_subtree.sh</div>
                <pre className="fs-code">{`# ═══ Git Submodule: 引用另一个仓库 ═══
# 用途: 在一个 repo 中引用另一个 repo 的特定版本

# 添加 submodule
git submodule add https://github.com/org/shared-lib.git libs/shared
# → 创建 .gitmodules 文件
# → libs/shared 指向 shared-lib 的某个 commit

# 克隆含 submodule 的项目
git clone --recursive https://github.com/org/project.git
# 或
git clone https://github.com/org/project.git
git submodule init
git submodule update

# 更新 submodule 到最新
cd libs/shared
git pull origin main
cd ../..
git add libs/shared
git commit -m "chore: update shared-lib"

# 批量更新所有 submodule
git submodule update --remote --merge

# ═══ Submodule 的痛点 ═══
# ❌ 忘记 --recursive clone → 空目录
# ❌ 切换分支时 submodule 不自动更新
# ❌ 合并冲突难以解决
# ❌ CI/CD 需要额外配置
# ❌ 新人容易困惑

# ═══ Git Subtree: 另一种方案 ═══
# 把外部 repo 的代码"复制"进来, 作为目录的一部分

# 添加 subtree
git subtree add --prefix=libs/shared \
    https://github.com/org/shared-lib.git main --squash

# 拉取上游更新
git subtree pull --prefix=libs/shared \
    https://github.com/org/shared-lib.git main --squash

# 推送本地修改回上游
git subtree push --prefix=libs/shared \
    https://github.com/org/shared-lib.git main

# ═══ Submodule vs Subtree ═══
# ┌──────────────┬──────────────────┬─────────────────┐
# │ 维度          │ Submodule        │ Subtree         │
# ├──────────────┼──────────────────┼─────────────────┤
# │ 存储方式      │ 指针引用         │ 完整复制        │
# │ clone         │ 需要 --recursive │ 正常 clone      │
# │ 独立开发      │ ✅ 各自独立      │ ⚠ 需要 push回  │
# │ 离线开发      │ ❌ 需要网络      │ ✅ 代码在本地   │
# │ 仓库大小      │ ✅ 不增加        │ ❌ 增加         │
# │ 学习成本      │ ❌ 高            │ ✅ 低           │
# │ 适用场景      │ 大型依赖/框架    │ 小型共享库      │
# └──────────────┴──────────────────┴─────────────────┘
#
# 推荐: 如果可能, 优先用 npm/pip 包管理
# → 只有两个 repo 确实需要紧密耦合时才考虑 submodule/subtree`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Nx & Turborepo 现代 Monorepo 工具</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> modern_monorepo.sh</div>
                <pre className="fs-code">{`# ═══ 现代 Monorepo 工具解决的核心问题 ═══
# 1. 增量构建: 只构建变更的包
# 2. 任务编排: 按依赖顺序执行 build/test
# 3. 缓存: 缓存构建产物, 避免重复工作
# 4. 影响分析: 哪些包受到了变更的影响

# ═══ Turborepo (Vercel) ═══
npx create-turbo@latest my-monorepo

# turbo.json
# {
#   "tasks": {
#     "build": {
#       "dependsOn": ["^build"],       // 先构建依赖
#       "outputs": ["dist/**"]         // 缓存构建产物
#     },
#     "test": {
#       "dependsOn": ["build"]
#     },
#     "lint": {},                       // 无依赖, 可并行
#     "dev": {
#       "cache": false,                // dev 不缓存
#       "persistent": true
#     }
#   }
# }

turbo run build                  # 构建所有包 (自动增量)
turbo run build --filter=web     # 只构建 web 及其依赖
turbo run test --affected        # 只测试受变更影响的包

# ═══ Nx (Nrwl) ═══
npx create-nx-workspace@latest my-workspace

# Nx 核心概念:
# 1. 项目图 (Project Graph): 自动分析依赖关系
# 2. 任务图 (Task Graph): 按依赖顺序调度
# 3. 计算缓存: 本地 + 远程缓存
# 4. 受影响分析: 基于 Git diff

nx graph                         # 可视化项目依赖图!
nx build my-app                  # 构建 (自动增量)
nx affected --target=test        # 只测试受影响的项目
nx run-many --target=build --all # 构建所有项目

# ═══ Turborepo vs Nx ═══
# ┌──────────────┬──────────────────┬──────────────────┐
# │ 维度          │ Turborepo        │ Nx               │
# ├──────────────┼──────────────────┼──────────────────┤
# │ 定位          │ 轻量级构建编排   │ 完整开发平台     │
# │ 学习成本      │ 低               │ 中高             │
# │ 代码生成      │ ❌               │ ✅ generators    │
# │ 插件生态      │ 基础             │ 丰富             │
# │ 远程缓存      │ Vercel Remote    │ Nx Cloud         │
# │ 语言支持      │ JS/TS            │ JS/TS/Go/Rust等  │
# │ 项目可视化    │ ❌               │ ✅ nx graph      │
# └──────────────┴──────────────────┴──────────────────┘

# ═══ pnpm Workspace (轻量方案) ═══
# pnpm-workspace.yaml:
# packages:
#   - 'apps/*'
#   - 'packages/*'
#
# pnpm install                     # 安装所有依赖 (共享 node_modules)
# pnpm --filter web dev            # 只启动 web
# pnpm --filter './packages/**' build  # 构建所有包`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 大型仓库实战技巧</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> large_repo_tips.sh</div>
                <pre className="fs-code">{`# ═══ 1. Sparse Checkout: 只检出需要的目录 ═══
# 仓库有 100 个包, 你只需要 3 个
git clone --filter=blob:none --sparse https://github.com/org/monorepo.git
cd monorepo
git sparse-checkout set apps/web packages/shared packages/ui
# → 只有这 3 个目录有文件, 其他是空的
# → 节省磁盘和 clone 时间

git sparse-checkout add packages/config   # 添加更多目录
git sparse-checkout list                   # 查看当前配置

# ═══ 2. Shallow Clone: 只克隆最近的历史 ═══
git clone --depth 1 https://github.com/org/repo.git
# → 只克隆最新的 1 个提交
# → CI/CD 中节省大量时间

git clone --depth 100             # 最近 100 个提交
git fetch --unshallow             # 后续需要完整历史时

# ═══ 3. Partial Clone: 按需下载对象 ═══
git clone --filter=blob:none https://github.com/org/repo.git
# → 克隆提交和树, 但不下载文件内容
# → 实际访问文件时才下载
# → 适合超大仓库

# ═══ 4. Git LFS (Large File Storage) ═══
# 管理大文件 (图片/视频/模型/数据集)
git lfs install
git lfs track "*.psd"            # 追踪 Photoshop 文件
git lfs track "*.model"          # 追踪模型文件
git lfs track "dataset/**"       # 追踪数据集目录
# → .gitattributes 自动更新
# → 大文件存储在 LFS 服务器, Git 只保存指针

git lfs ls-files                 # 查看 LFS 管理的文件
git lfs pull                     # 下载 LFS 文件

# ═══ 5. 清理仓库历史中的大文件 ═══
# 不小心提交了 500MB 的文件, 即使删除了,
# 历史中仍然存在, 仓库巨大
#
# 方案 1: git filter-repo (推荐)
pip install git-filter-repo
git filter-repo --path data/huge.csv --invert-paths
# → 从所有历史中删除该文件

# 方案 2: BFG Repo-Cleaner
java -jar bfg.jar --strip-blobs-bigger-than 100M
git reflog expire --all && git gc --prune=now --aggressive

# ═══ 6. 性能优化配置 ═══
git config core.fsmonitor true             # 文件系统监控 (加速 status)
git config core.untrackedcache true        # 缓存未跟踪文件
git config feature.manyFiles true          # 大仓库优化
git config pack.threads 0                  # 多线程打包
git maintenance start                      # 后台优化任务

# ═══ 仓库大小诊断 ═══
git count-objects -vH              # 查看对象数和仓库大小
git rev-list --objects --all |
  git cat-file --batch-check |
  sort -k3 -n -r | head -20       # 找到最大的对象`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
