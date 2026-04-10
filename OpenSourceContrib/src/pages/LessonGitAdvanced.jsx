import { useState } from 'react';
import './LessonCommon.css';

const CODE = `# ━━━━ Git 高级工作流（开源贡献必备）━━━━

# ━━━━ 1. Interactive Rebase（整理提交历史）━━━━
# 开源项目要求"干净的提交历史"
git rebase -i HEAD~5   # 交互式编辑最近 5 个提交

# 编辑器中显示：
# pick a1b2c3d feat: add URL parser
# pick b2c3d4e fix: handle edge case
# pick c3d4e5f fix: typo
# pick d4e5f6g fix: another typo
# pick e5f6g7h test: add parser tests

# 修改为：（合并修错别字的提交）
# pick a1b2c3d feat: add URL parser
# squash b2c3d4e fix: handle edge case
# squash c3d4e5f fix: typo
# squash d4e5f6g fix: another typo
# pick e5f6g7h test: add parser tests
# → 4 个提交合并为 2 个干净的提交

# ━━━━ 2. Cherry-pick（移植特定提交）━━━━
# 从其他分支"摘取"一个提交到当前分支
git cherry-pick abc1234
# 场景：backport 修复到旧版本分支
# main 上修了一个 Bug → cherry-pick 到 v1.x 分支

# ━━━━ 3. Git Bisect（二分法找 Bug）━━━━
# "这个 Bug 什么时候引入的？" → bisect 自动找到
git bisect start
git bisect bad              # 当前提交是坏的
git bisect good v1.0.0      # v1.0.0 时是好的
# Git 自动 checkout 中间的提交 → 你测试 → good/bad
# 重复几次就能找到引入 Bug 的精确提交

# 自动化 bisect（用脚本判断好坏）：
git bisect run npm test
# Git 自动运行测试，测试失败 = bad，通过 = good

# ━━━━ 4. Git Worktree（多分支同时工作）━━━━
# 不用 stash/checkout！并行处理多个分支
git worktree add ../project-bugfix fix/critical-bug
git worktree add ../project-feature feat/new-api
# → 三个目录同时工作：main + bugfix + feature
# → 互不干扰，各自独立运行

git worktree list   # 查看所有 worktree
git worktree remove ../project-bugfix   # 完成后删除

# ━━━━ 5. Git Reflog（后悔药）━━━━
# 误操作？reflog 记录了一切
git reflog
# abc1234 HEAD@{0}: rebase: (finish)
# def5678 HEAD@{1}: rebase: (pick) feat: add parser
# ... 
# ghi9012 HEAD@{5}: commit: this was before rebase

# 恢复到 rebase 前的状态：
git reset --hard HEAD@{5}
# reflog 保留 30 天内的所有操作记录

# ━━━━ 6. 高级 Diff 技巧 ━━━━
git diff --stat              # 只看修改了哪些文件
git diff --word-diff         # 单词级 diff（适合文档）
git log --pretty=format:"%h %an %s" --graph  # 图形化日志
git shortlog -sn             # 贡献者排行榜
git blame -L 10,20 file.ts   # 查看特定行的最后修改者`;

export default function LessonGitAdvanced() {
  return (
    <div className="os-lesson">
      <div className="os-hero">
        <div className="os-badge">// MODULE 04 · GIT ADVANCED</div>
        <h1>Git 高级工作流</h1>
        <p>开源贡献对 Git 技能的要求远超日常开发——<strong>Interactive Rebase 整理历史、Cherry-pick 移植修复、Bisect 二分法找 Bug、Worktree 并行开发</strong>。这些是"Git 高手"和"Git 用户"的分水岭。</p>
      </div>

      <div className="os-section">
        <div className="os-section-title">🔧 Git 高级命令</div>
        <div className="os-code-wrap">
          <div className="os-code-head">
            <div className="os-code-dot" style={{ background: '#ef4444' }} /><div className="os-code-dot" style={{ background: '#f59e0b' }} /><div className="os-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>git-advanced.sh</span>
          </div>
          <div className="os-code">{CODE}</div>
        </div>
      </div>

      <div className="os-section">
        <div className="os-section-title">📊 Git 高级命令速查</div>
        <div className="os-grid-3">
          {[
            { cmd: 'rebase -i', use: '整理提交历史（squash/fixup）', when: 'PR 被要求 squash 时', color: '#22c55e' },
            { cmd: 'cherry-pick', use: '移植特定提交到其他分支', when: 'Backport 修复到旧版本', color: '#38bdf8' },
            { cmd: 'bisect', use: '二分法定位引入 Bug 的提交', when: '"这个 Bug 什么时候出现的？"', color: '#f97316' },
            { cmd: 'worktree', use: '实体多分支并行工作目录', when: '同时修 Bug + 开发新功能', color: '#a855f7' },
            { cmd: 'reflog', use: '查看所有操作历史（后悔药）', when: '误操作后恢复', color: '#fbbf24' },
            { cmd: 'blame -L', use: '查看特定行的最后修改者', when: '理解代码变更原因', color: '#10b981' },
          ].map((g, i) => (
            <div key={i} className="os-card" style={{ borderLeft: `3px solid ${g.color}`, padding: '0.85rem' }}>
              <span className="os-tag green" style={{ marginBottom: '0.35rem', display: 'inline-block', fontFamily: 'JetBrains Mono,monospace' }}>{g.cmd}</span>
              <div style={{ fontSize: '0.82rem', color: 'var(--os-text)', marginBottom: '0.15rem' }}>{g.use}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--os-muted)' }}>📌 {g.when}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
