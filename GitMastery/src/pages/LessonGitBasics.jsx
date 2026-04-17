import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['初始化与配置', '暂存区机制', '提交与历史', 'diff 与撤销'];

export default function LessonGitBasics() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge">🔀 module_01 — Git 基础</div>
      <div className="fs-hero">
        <h1>Git 基础：仓库 / 暂存区 / 提交 / 历史</h1>
        <p>
          Git 不是简单的"保存"工具。它是一台<strong>内容寻址文件系统</strong>，
          每一次 commit 都是整棵文件树的快照。本模块从 <strong>git init</strong> 开始，
          深入理解工作区 → 暂存区 → 本地仓库的三层架构，掌握 add / commit / log / diff / reset
          的底层语义。<strong>理解暂存区 (stage) 是从初学者到高手的分水岭</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📂 Git 核心工作流</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ 初始化与全局配置</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> git_init_config.sh</div>
                <pre className="fs-code">{`# ═══ 1. 全局配置 (只需执行一次) ═══
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 推荐配置
git config --global init.defaultBranch main       # 默认分支名
git config --global core.autocrlf input           # Mac/Linux
git config --global pull.rebase true              # pull 时默认 rebase
git config --global fetch.prune true              # fetch 自动清理远程已删分支
git config --global diff.algorithm histogram      # 更好的 diff 算法
git config --global merge.conflictstyle diff3     # 三路合并冲突显示

# 查看所有配置
git config --list --show-origin

# ═══ 2. 初始化仓库 ═══
mkdir my-project && cd my-project
git init                         # 创建 .git 目录
# .git 结构:
# .git/
# ├── HEAD            → 当前分支指针 (ref: refs/heads/main)
# ├── config          → 仓库级配置
# ├── objects/        → 所有对象存储 (blob/tree/commit)
# ├── refs/
# │   ├── heads/      → 本地分支指针
# │   └── tags/       → 标签指针
# ├── hooks/          → 钩子脚本
# └── index           → 暂存区 (二进制文件)

# ═══ 3. .gitignore 最佳实践 ═══
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
vendor/
.venv/

# Build
dist/
build/
*.o
*.pyc
__pycache__/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Secrets (永远不要提交!)
.env
*.pem
*.key
EOF

# 全局 gitignore
git config --global core.excludesFile ~/.gitignore_global`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 暂存区 (Staging Area) 深度解析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> staging_area.sh</div>
                <pre className="fs-code">{`# ═══ Git 三层架构 ═══
#
# ┌──────────────┐    git add     ┌──────────────┐   git commit   ┌──────────────┐
# │  工作区       │ ──────────→   │  暂存区       │ ──────────→   │  本地仓库     │
# │ (Working Dir) │              │ (Stage/Index) │              │ (Repository) │
# └──────────────┘   ←──────────  └──────────────┘              └──────────────┘
#                   git restore                                    │
#                                                                  │ git push
#                                                                  ↓
#                                                          ┌──────────────┐
#                                                          │  远程仓库     │
#                                                          │   (Remote)   │
#                                                          └──────────────┘
#
# 暂存区的作用: 精确控制哪些变更进入下一次提交
# → 你可以修改 10 个文件, 但只提交其中 3 个

# ═══ 精细化暂存 ═══
git add file.txt                 # 暂存单个文件
git add src/                     # 暂存整个目录
git add *.js                     # 通配符暂存
git add -A                       # 暂存所有变更 (新增+修改+删除)
git add -u                       # 只暂存已跟踪文件的修改和删除

# ═══ 交互式暂存 (高手必备) ═══
git add -p                       # --patch: 逐块选择暂存
# 每个 hunk 可以选择:
#   y = 暂存此块
#   n = 跳过此块
#   s = 拆分为更小的块
#   e = 手动编辑暂存内容
#
# 场景: 一个文件里有 bug fix + feature, 你只想先提交 bug fix
# → git add -p 可以精确到行级别的暂存

# ═══ 查看暂存状态 ═══
git status                       # 概览
git status -s                    # 短格式: M=修改 A=新增 D=删除 ??=未跟踪
git diff                         # 工作区 vs 暂存区
git diff --staged                # 暂存区 vs 最新提交 (= 即将提交的内容)
git diff HEAD                    # 工作区 vs 最新提交

# ═══ 取消暂存 ═══
git restore --staged file.txt    # 从暂存区移除 (保留工作区修改)
git restore file.txt             # 丢弃工作区修改 (危险! 不可恢复)
git restore --source=HEAD~3 file.txt  # 恢复到 3 个提交前的版本`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📝 提交与历史操作</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> commit_history.sh</div>
                <pre className="fs-code">{`# ═══ 提交的本质 ═══
# 每个 commit 是一个不可变的快照对象:
# {
#   tree:      "a1b2c3..."     // 文件树的 SHA-1 哈希
#   parent:    "d4e5f6..."     // 父提交 (链表结构)
#   author:    "name <email>"  // 作者 + 时间戳
#   committer: "name <email>"  // 提交者 (可以不同)
#   message:   "feat: ..."     // 提交信息
# }

# ═══ 提交最佳实践 ═══
git commit -m "feat: add user authentication"
git commit -m "fix: resolve null pointer in parser"
git commit -m "refactor: extract database connection pool"

# Conventional Commits 规范:
# feat:     新功能
# fix:      Bug 修复
# docs:     文档变更
# style:    代码格式 (不影响逻辑)
# refactor: 重构 (非 feat/fix)
# perf:     性能优化
# test:     测试
# chore:    构建/工具/依赖
# ci:       CI 配置

# ═══ 修改上一次提交 ═══
git commit --amend -m "fix: correct error message"   # 修改提交信息
git add forgotten_file.txt
git commit --amend --no-edit                         # 追加文件到上次提交

# ═══ 查看历史 ═══
git log                              # 完整日志
git log --oneline                    # 一行摘要
git log --oneline --graph --all      # ASCII 分支图 (最常用!)
git log --since="2024-01-01"         # 时间过滤
git log --author="Alice"             # 作者过滤
git log -- src/auth.js               # 文件历史
git log -S "TODO"                    # 搜索代码变更 (pickaxe)
git log --oneline -n 10              # 最近 10 条

# ═══ 高级历史查询 ═══
git log --format="%h %an %ar %s"     # 自定义格式
git shortlog -sn                     # 按作者统计提交数
git log --diff-filter=D -- "*.py"    # 查看被删除的 Python 文件
git log --merges                     # 只看合并提交
git log --no-merges                  # 排除合并提交

# ═══ 查看单个提交 ═══
git show abc1234                     # 查看提交详情 + diff
git show abc1234:src/main.js         # 查看该提交时的文件内容`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 diff 与撤销操作全景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> diff_undo.sh</div>
                <pre className="fs-code">{`# ═══ diff 三重对比 ═══
#
# 场景: 你修改了 3 个文件, add 了 2 个
#
# git diff           → 未暂存的修改 (工作区 vs 暂存区)
# git diff --staged  → 已暂存的修改 (暂存区 vs HEAD)
# git diff HEAD      → 所有修改 (工作区 vs HEAD)
#
# ┌─────────┐  diff  ┌─────────┐ diff --staged ┌─────────┐
# │ Working │ ←────→ │  Stage  │ ←───────────→ │  HEAD   │
# │  Dir    │        │ (Index) │               │(Commit) │
# └─────────┘        └─────────┘               └─────────┘
#       └──────────────── diff HEAD ──────────────────┘

# 比较分支
git diff main..feature          # main 到 feature 的差异
git diff main...feature         # feature 从 main 分出后的变更

# ═══ 撤销操作速查表 ═══
# ┌──────────────────┬──────────────────────────────────────┬────────┐
# │ 场景              │ 命令                                 │ 安全性 │
# ├──────────────────┼──────────────────────────────────────┼────────┤
# │ 撤销工作区修改    │ git restore <file>                   │ ⚠ 危险 │
# │ 取消暂存          │ git restore --staged <file>          │ ✅ 安全│
# │ 修改上次提交      │ git commit --amend                   │ ⚠ 慎用 │
# │ 撤销提交(保留代码) │ git reset --soft HEAD~1              │ ✅ 安全│
# │ 撤销提交+暂存     │ git reset --mixed HEAD~1 (默认)      │ ✅ 安全│
# │ 彻底删除提交      │ git reset --hard HEAD~1              │ ❌ 危险│
# │ 安全撤销公共提交   │ git revert <commit>                  │ ✅ 安全│
# └──────────────────┴──────────────────────────────────────┴────────┘

# ═══ Reset 三模式详解 ═══
# --soft:  只移动 HEAD → 暂存区和工作区都保留
#          用途: 合并最近几次提交为一个
# --mixed: 移动 HEAD + 清空暂存区 → 工作区保留
#          用途: 重新选择哪些文件进入提交
# --hard:  移动 HEAD + 清空暂存区 + 清空工作区
#          用途: 彻底丢弃修改 (危险!)

# ═══ Revert vs Reset ═══
# Reset:  改写历史 → 只能用于未 push 的本地提交
# Revert: 创建新提交来撤销 → 安全, 可用于公共分支
git revert abc1234               # 创建一个"反向提交"
git revert HEAD~3..HEAD          # 撤销最近 3 个提交
git revert -m 1 <merge-commit>  # 撤销合并提交 (取第一个父提交)

# ═══ 终极后悔药: Reflog ═══
git reflog                       # 查看 HEAD 的所有移动记录
git reset --hard HEAD@{3}        # 恢复到 3 步操作前的状态
# Reflog 保留 90 天 → 几乎任何误操作都可以恢复`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
