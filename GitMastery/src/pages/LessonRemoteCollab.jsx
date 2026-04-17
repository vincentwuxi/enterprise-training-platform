import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['远程仓库', 'PR 与 Code Review', 'Fork 工作流', '团队协作'];

export default function LessonRemoteCollab() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🌐 module_03 — 远程协作</div>
      <div className="fs-hero">
        <h1>远程协作：Push / Pull / Fork / PR / Code Review</h1>
        <p>
          Git 的分布式特性意味着<strong>每个开发者都拥有完整的仓库副本</strong>。
          本模块深入 remote / fetch / pull / push 的网络交互模型，掌握 Pull Request
          驱动的协作流程，学习 Fork 开源贡献工作流，以及如何写出高质量的 Code Review。
          <strong>团队协作能力 = Git 技术 + 沟通能力</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 远程协作核心技能</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📡 远程仓库操作大全</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> remote_operations.sh</div>
                <pre className="fs-code">{`# ═══ 远程仓库的本质 ═══
# remote = 一个 URL 的别名 + 远程跟踪分支的集合
# 默认: origin = 你 clone 的那个仓库

git remote -v                    # 查看远程仓库
# origin  git@github.com:user/repo.git (fetch)
# origin  git@github.com:user/repo.git (push)

git remote add upstream https://github.com/org/repo.git
git remote rename origin github
git remote remove old-remote

# ═══ Fetch vs Pull ═══
# fetch: 只下载, 不合并 (安全)
# pull:  fetch + merge (可能产生冲突)
#
# ┌──────────┐  fetch   ┌──────────────────┐
# │  Remote  │ ───────→ │ Remote-Tracking  │
# │ (GitHub) │          │ (origin/main)    │
# └──────────┘          └──────────────────┘
#                              │ merge/rebase
#                              ↓
#                       ┌──────────────────┐
#                       │    Local Branch   │
#                       │     (main)       │
#                       └──────────────────┘

git fetch origin                 # 下载所有远程分支更新
git fetch origin main            # 只获取 main 分支
git fetch --all                  # 获取所有远程仓库
git fetch --prune                # 清除已删除的远程分支引用

# Pull 策略
git pull                         # = fetch + merge (默认)
git pull --rebase                # = fetch + rebase (推荐!)
git pull --ff-only               # 只在可以 fast-forward 时才 pull

# ═══ Push ═══
git push origin main             # 推送 main 到 origin
git push -u origin feature       # 推送并设置上游跟踪
git push --force-with-lease      # 安全的强制推送 (推荐)
git push --force                 # 危险! 覆盖远程 (慎用)
git push origin --delete feature  # 删除远程分支
git push --tags                  # 推送所有标签

# ═══ 上游跟踪分支 ═══
git branch -vv                   # 查看跟踪关系
# * main     abc1234 [origin/main] Latest commit
#   feature  def5678 [origin/feature: ahead 2, behind 1]
#
# ahead 2:  本地有 2 个提交未推送
# behind 1: 远程有 1 个提交未拉取

git branch --set-upstream-to=origin/main main

# ═══ Tag 管理 ═══
git tag v1.0.0                   # 轻量标签
git tag -a v1.0.0 -m "Release 1.0.0"  # 注释标签 (推荐)
git tag -a v1.0.1 abc1234        # 给历史提交打标签
git push origin v1.0.0           # 推送单个标签
git push origin --tags           # 推送所有标签`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 Pull Request 与 Code Review</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> pull_request_workflow.sh</div>
                <pre className="fs-code">{`# ═══ PR 驱动的开发流程 ═══
#
# 1. 创建分支
git switch -c feature/user-profile
#
# 2. 开发 + 提交 (多次小提交)
git add . && git commit -m "feat: add profile page"
git add . && git commit -m "feat: add avatar upload"
git add . && git commit -m "test: add profile tests"
#
# 3. 推送到远程
git push -u origin feature/user-profile
#
# 4. 在 GitHub/GitLab 上创建 PR
# 5. Code Review + CI 通过
# 6. 合并 PR (Squash 或 Merge)
# 7. 删除分支
git switch main && git pull
git branch -d feature/user-profile

# ═══ PR 描述模板 ═══
# ## What
# 添加用户个人资料页面
#
# ## Why
# 用户需要管理自己的头像和个人信息 (Issue #123)
#
# ## How
# - 新增 ProfilePage 组件
# - 集成 S3 图片上传
# - 添加表单验证
#
# ## Testing
# - [x] 单元测试通过
# - [x] 手动测试上传流程
# - [ ] 需要 staging 环境验证
#
# ## Screenshots
# (附上 UI 截图)

# ═══ Code Review 最佳实践 ═══
#
# 作为 Reviewer:
# ┌──────────────────────────────────────────────┐
# │ ✅ DO                  │ ❌ DON'T             │
# ├──────────────────────────────────────────────┤
# │ 先理解目标再看代码      │ 逐行吹毛求疵         │
# │ 提出可操作的建议        │ "这代码不太好"       │
# │ 区分 blocking/nit      │ 全标 "Request Changes"│
# │ 赞美好的设计           │ 只指出问题           │
# │ 给出代码示例           │ "你应该知道怎么改"    │
# └──────────────────────────────────────────────┘
#
# Review 评论前缀:
# [nit]:     代码风格, 不阻塞合并
# [question]: 不理解, 需要解释
# [suggest]:  可选的改进建议
# [blocking]: 必须修改才能合并
# [praise]:   做得好的部分

# ═══ GitHub CLI 加速 ═══
gh pr create --title "feat: add profile" --body "..."
gh pr list                       # 列出所有 PR
gh pr checkout 42                # 切换到 PR #42 的分支
gh pr review 42 --approve        # 批准 PR
gh pr merge 42 --squash          # Squash 合并`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🍴 Fork 工作流 (开源贡献)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> fork_workflow.sh</div>
                <pre className="fs-code">{`# ═══ Fork 工作流: 开源贡献的标准流程 ═══
#
# 1. Fork: 在 GitHub 上 fork 目标仓库到自己账号
#    github.com/facebook/react → github.com/you/react
#
# 2. Clone 自己的 fork
git clone git@github.com:you/react.git
cd react
#
# 3. 添加上游仓库
git remote add upstream https://github.com/facebook/react.git
git remote -v
# origin    git@github.com:you/react.git (fetch)    ← 你的 fork
# upstream  https://github.com/facebook/react.git    ← 原始仓库

# 4. 保持同步
git fetch upstream
git switch main
git rebase upstream/main         # 同步上游到本地 main
git push origin main             # 更新你的 fork

# 5. 创建功能分支 (基于最新 upstream/main)
git switch -c fix/typo-in-docs
# ... 修改代码 ...
git add . && git commit -m "docs: fix typo in hooks guide"
git push origin fix/typo-in-docs

# 6. 创建 PR: 从 you:fix/typo-in-docs → facebook:main
# 7. 项目维护者 review 和合并
# 8. 清理
git switch main
git branch -d fix/typo-in-docs
git push origin --delete fix/typo-in-docs

# ═══ 常见问题: PR 过期了 ═══
# 你的 PR 提交了一周, 上游有了新提交, 产生冲突
# 解决方案:
git fetch upstream
git switch fix/typo-in-docs
git rebase upstream/main         # 变基到最新
# 解决冲突...
git push --force-with-lease      # 强制推送更新 PR

# ═══ 大型开源项目的贡献流程 ═══
# 1. 先看 CONTRIBUTING.md
# 2. 先开 Issue 讨论方案
# 3. 遵循项目的 commit 规范
# 4. 确保 CI 通过
# 5. 一个 PR 只做一件事
# 6. 写清楚 PR 描述

# ═══ 维护者角度 ═══
# 拉取别人的 PR 到本地测试:
git fetch origin pull/42/head:pr-42
git switch pr-42                 # 切换到 PR 分支进行测试`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>👥 团队协作模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> team_collaboration.sh</div>
                <pre className="fs-code">{`# ═══ 团队每日工作流 ═══
#
# 早上开始工作:
git switch main
git pull --rebase                # 同步最新代码
git switch -c feature/my-task    # 创建今日任务分支

# 开发过程中 (频繁提交):
git add -p                       # 精细暂存
git commit -m "feat: implement X"

# 推送前同步:
git fetch origin main
git rebase origin/main           # 基于最新 main 变基
# 解决可能的冲突...
git push -u origin feature/my-task

# 创建 PR, 等待 Review...
# PR 合并后:
git switch main
git pull
git branch -d feature/my-task

# ═══ 保护分支设置 (GitHub/GitLab) ═══
# main/master 分支应设置:
# ✅ 需要 PR 才能合并 (禁止直接 push)
# ✅ 至少 1-2 个 approver
# ✅ CI 必须通过
# ✅ 要求分支与 base 保持最新
# ✅ 禁止 force-push
# ✅ 启用 signed commits (可选)

# ═══ CODEOWNERS 文件 ═══
# 文件路径: .github/CODEOWNERS
# 自动为 PR 分配 reviewer
#
# 语法: <pattern> <owners>
# *                    @team/leads          # 默认所有文件
# /src/auth/           @alice @bob          # 认证模块
# /src/payment/        @team/payment        # 支付模块
# *.sql                @team/dba            # 数据库变更
# /docs/               @team/docs           # 文档
# Dockerfile           @team/devops         # 容器配置
# .github/workflows/   @team/devops         # CI/CD

# ═══ 并行开发的分支隔离 ═══
# 功能开关 (Feature Flags) + 主干开发:
# → 代码合并到 main, 但功能被开关控制
# → 避免长生命周期分支导致的合并地狱
#
# if (featureFlags.newCheckout) {
#   return <NewCheckoutPage />;
# } else {
#   return <OldCheckoutPage />;
# }

# ═══ Git Worktree: 同时操作多个分支 ═══
git worktree add ../hotfix-branch hotfix/urgent
# → 在另一个目录检出 hotfix 分支
# → 不需要 stash 当前工作
# → 完成后:
git worktree remove ../hotfix-branch`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
