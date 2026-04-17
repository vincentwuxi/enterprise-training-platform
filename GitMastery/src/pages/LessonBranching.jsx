import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['分支基础', 'Merge 策略', 'Rebase 精通', '冲突解决'];

export default function LessonBranching() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🌿 module_02 — 分支与合并</div>
      <div className="fs-hero">
        <h1>分支与合并：Merge / Rebase / Cherry-pick</h1>
        <p>
          Git 的分支模型是它最强大的特性——创建分支只需 <strong>41 字节</strong>（一个 SHA-1 引用）。
          本模块深入 Merge vs Rebase 的本质区别，掌握 fast-forward / 三路合并 / squash merge
          等策略，学会 cherry-pick 精确移植提交，以及高效解决合并冲突的实战技巧。
          <strong>理解"分支就是指针"是突破 Git 的关键</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌿 分支管理全攻略</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔖 分支的本质：一个 40 字符的指针</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> branch_basics.sh</div>
                <pre className="fs-code">{`# ═══ 分支的本质 ═══
# 分支 = 一个文件, 内容是 40 字符的 SHA-1 哈希
cat .git/refs/heads/main
# → e3f1a2b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
#
# 创建分支 = 创建一个 41 字节的文件
# 切换分支 = 修改 .git/HEAD 的内容
# → 这就是 Git 分支如此轻量级的原因

# ═══ 分支 CRUD ═══
git branch                        # 列出本地分支
git branch -a                     # 列出所有分支 (含远程)
git branch -v                     # 带最新提交信息
git branch feature/auth           # 创建分支 (不切换)
git switch feature/auth           # 切换分支 (推荐, 比 checkout 更安全)
git switch -c feature/payment     # 创建 + 切换
git branch -d feature/auth        # 删除已合并的分支
git branch -D feature/abandoned   # 强制删除未合并分支
git branch -m old-name new-name   # 重命名分支

# ═══ HEAD 与分离头指针 ═══
# HEAD 通常指向一个分支 (间接引用):
#   .git/HEAD → ref: refs/heads/main
#
# 分离 HEAD (Detached HEAD):
git checkout abc1234              # HEAD 直接指向提交
# → 此时的提交不属于任何分支!
# → 解决方案: 创建新分支保存
git switch -c rescue-branch

# ═══ 分支命名规范 ═══
# feature/user-auth      → 新功能
# fix/login-crash        → Bug 修复
# hotfix/cve-2024-1234   → 紧急修复
# release/v2.1.0         → 发布分支
# chore/update-deps      → 维护任务
# experiment/new-algo    → 实验性分支

# ═══ 查看分支关系 ═══
git log --oneline --graph --all --decorate
# * abc1234 (HEAD -> main) Merge feature/auth
# |\\
# | * def5678 (feature/auth) Add OAuth2
# | * ghi9012 Add login page
# |/
# * jkl3456 Initial commit

# 查看哪些分支已合并到 main
git branch --merged main          # 可以安全删除
git branch --no-merged main       # 还有未合并的工作`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 合并策略全景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> merge_strategies.sh</div>
                <pre className="fs-code">{`# ═══ 1. Fast-Forward Merge (快进合并) ═══
# 条件: main 没有新提交, feature 是 main 的直接后代
#
# Before:                    After:
# main ──A──B                main ──A──B──C──D
#             \\              (feature 被 "纳入" main)
#              C──D (feature)
#
git switch main
git merge feature/auth       # 如果可能, 默认 fast-forward
# → 不产生合并提交, 历史是一条直线

# ═══ 2. 三路合并 (3-way Merge) ═══
# 条件: main 和 feature 各自有新提交, 需要找共同祖先
#
# Before:                    After:
# main ──A──B──E             main ──A──B──E──M (merge commit)
#             \\                         \\   /
#              C──D (feature)            C──D
#
git switch main
git merge --no-ff feature/auth  # 强制创建合并提交
# → 保留分支历史, 方便 revert 整个功能

# ═══ 3. Squash Merge ═══
# 把 feature 的所有提交压缩为一个提交到 main
#
# Before:                    After:
# main ──A──B                main ──A──B──S (squashed)
#             \\              (feature 的 C+D 被压缩为 S)
#              C──D (feature)
#
git switch main
git merge --squash feature/auth
git commit -m "feat: add user authentication"
# → 适合: feature 分支有很多临时/WIP 提交
# → 缺点: 丢失了所有细粒度的提交信息

# ═══ Cherry-pick: 精确移植提交 ═══
# 只把某个特定提交应用到当前分支
git cherry-pick abc1234              # 移植单个提交
git cherry-pick abc1234 def5678      # 移植多个提交
git cherry-pick abc1234..def5678     # 移植范围
git cherry-pick -n abc1234          # 只应用变更, 不自动提交

# 场景: 在 feature 分支修了一个 bug,
#       需要立刻 hotfix 到 main 但 feature 还没完成
# → cherry-pick 该 fix 提交到 main

# ═══ 合并策略选型 ═══
# ┌──────────────┬──────────────┬──────────────────┐
# │ 策略          │ 适用场景      │ 历史效果          │
# ├──────────────┼──────────────┼──────────────────┤
# │ Fast-Forward │ 简单线性开发  │ 一条直线          │
# │ --no-ff      │ 功能分支合并  │ 保留分支结构      │
# │ --squash     │ 杂乱的 WIP   │ 干净的单提交      │
# │ cherry-pick  │ 精确移植      │ 创建新提交副本    │
# └──────────────┴──────────────┴──────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⛓️ Rebase 深度解析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> rebase_mastery.sh</div>
                <pre className="fs-code">{`# ═══ Rebase 的本质: "变基" = 重放提交 ═══
#
# Before rebase:                After rebase:
# main ──A──B──E                main ──A──B──E
#             \\                                \\
#              C──D (feature)                    C'──D' (feature)
#
# C' 和 D' 是全新的提交 (不同的 SHA-1)
# 内容相同, 但父提交变了 → 历史被"改写"了

git switch feature/auth
git rebase main                  # 把 feature 的基底移到 main 的最新提交
# 然后回到 main, fast-forward:
git switch main
git merge feature/auth           # 现在一定是 fast-forward

# ═══ Merge vs Rebase: 核心区别 ═══
# Merge:  保留真实历史, 产生合并提交, 适合公共分支
# Rebase: 重写线性历史, 更整洁, 只能用于私有分支
#
# 黄金法则: 永远不要 rebase 已经 push 到公共分支的提交!
# → 因为 rebase 会改变 commit hash
# → 其他人的历史会跟你的产生分歧

# ═══ Interactive Rebase (最强大的历史编辑器) ═══
git rebase -i HEAD~5             # 编辑最近 5 个提交
# 编辑器打开:
# pick abc1234 feat: add login page
# pick def5678 fix: typo
# pick ghi9012 feat: add dashboard
# pick jkl3456 wip: debugging
# pick mno7890 feat: add settings
#
# 可用命令:
# pick   = 保留该提交
# reword = 保留提交, 修改提交信息
# edit   = 保留提交, 暂停让你修改
# squash = 合并到前一个提交 (保留信息)
# fixup  = 合并到前一个提交 (丢弃信息)
# drop   = 删除该提交
# 还可以调换行的顺序 → 提交顺序会改变

# 实战: 清理提交历史
# pick abc1234 feat: add login page
# fixup def5678 fix: typo                ← 合并到上面
# pick ghi9012 feat: add dashboard
# drop jkl3456 wip: debugging            ← 删除调试提交
# pick mno7890 feat: add settings

# ═══ onto: 精确控制变基起点 ═══
# 把 feature 从 dev 移到 main:
git rebase --onto main dev feature
# 把提交 C-D-E 从 dev 上摘下来, 接到 main 上

# ═══ Rebase 冲突处理 ═══
# rebase 逐个重放提交, 每个都可能冲突
git rebase main
# CONFLICT... 手动解决冲突
git add .
git rebase --continue            # 继续下一个提交
# 或
git rebase --abort               # 放弃整个 rebase
git rebase --skip                # 跳过当前提交`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💥 合并冲突解决实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> conflict_resolution.sh</div>
                <pre className="fs-code">{`# ═══ 冲突是怎么产生的 ═══
# 两个分支修改了同一个文件的同一行
# Git 无法自动决定保留哪个 → 需要人工介入

# ═══ 冲突标记解读 ═══
# 文件中会出现:
# <<<<<<< HEAD
# const API_URL = "https://api.prod.com";    ← 当前分支 (main)
# ||||||| merged common ancestor
# const API_URL = "https://api.staging.com";  ← 共同祖先 (diff3 模式)
# =======
# const API_URL = "https://api.dev.com";     ← 合入分支 (feature)
# >>>>>>> feature/new-api

# ═══ 解决步骤 ═══
# 1. 查看冲突文件
git status                       # 标记为 "both modified"

# 2. 手动编辑: 删除标记, 保留正确的代码
# const API_URL = process.env.API_URL || "https://api.prod.com";

# 3. 标记为已解决
git add src/config.js

# 4. 完成合并
git commit                       # 自动生成合并提交信息

# ═══ 工具辅助 ═══
git mergetool                    # 打开配置的合并工具
# 推荐工具:
# - VS Code 内建合并编辑器 (最易用)
# - IntelliJ IDEA 的三路合并
# - vimdiff (终端爱好者)

# ═══ 策略: 减少冲突的最佳实践 ═══
# 1. 频繁同步: 每天 rebase/merge main 到 feature 分支
git switch feature
git rebase main                  # 每天早上做一次

# 2. 小提交: 大量小提交比少量大提交更容易解决冲突
# 3. 代码规范: 统一格式避免格式变更导致的假冲突
# 4. CODEOWNERS: 明确文件所有权, 减少同时修改

# ═══ 特殊冲突场景 ═══
# 文件被删除 vs 被修改
git checkout --theirs -- file.txt   # 采用对方版本
git checkout --ours -- file.txt     # 采用自己版本

# 二进制文件冲突 (图片等)
git checkout --theirs -- logo.png   # 只能二选一

# ═══ 测试合并是否会冲突 (不实际合并) ═══
git merge --no-commit --no-ff feature
git diff --cached                    # 查看合并结果
git merge --abort                    # 取消这次"试合并"

# ═══ Rerere: 记住冲突解决方案 ═══
git config --global rerere.enabled true
# → Git 会记住你解决冲突的方式
# → 下次遇到相同冲突自动应用相同的解决方案
# → rebase 多次重放提交时特别有用`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
