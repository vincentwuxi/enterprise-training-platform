import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Stash 暂存', 'Reset 三模式', 'Reflog 后悔药', 'Bisect 二分调试'];

export default function LessonAdvancedOps() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🔧 module_04 — 高级操作</div>
      <div className="fs-hero">
        <h1>高级操作：Stash / Reset / Reflog / Bisect / Blame</h1>
        <p>
          掌握这些"瑞士军刀"级别的命令，是从 Git 用户升级为 <strong>Git 高手</strong> 的标志。
          Stash 让你随时切换上下文，Reflog 是"后悔药"，Bisect 用二分法
          精准定位引入 bug 的提交，Blame 追溯每一行代码的作者。
          <strong>这些工具在紧急故障排查时可以救命</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔧 高级操作工具箱</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 Stash: 临时保存工作现场</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> stash_mastery.sh</div>
                <pre className="fs-code">{`# ═══ 场景: 你正在开发 feature, 突然需要修 hotfix ═══
# 当前有未提交的修改, 但不想提交半成品
# → Stash 把修改"藏"起来, 恢复干净的工作区

# ═══ 基本用法 ═══
git stash                        # 保存当前修改 (已跟踪文件)
git stash -u                     # 包括未跟踪文件
git stash -a                     # 包括 .gitignore 忽略的文件
git stash push -m "WIP: auth"    # 添加描述 (推荐!)
git stash push -- src/auth.js    # 只 stash 指定文件

# 去处理 hotfix...
git switch main && git switch -c hotfix/urgent
# 修复 + 提交 + 推送...
git switch feature/auth

# ═══ 恢复 Stash ═══
git stash pop                    # 恢复并删除 stash
git stash apply                  # 恢复但保留 stash (可多次使用)
git stash apply stash@{2}        # 恢复指定的 stash

# ═══ 管理 Stash ═══
git stash list                   # 列出所有 stash
# stash@{0}: On feature/auth: WIP: auth validation
# stash@{1}: On main: quick experiment
# stash@{2}: WIP on feature/payment: abc1234 payment flow

git stash show                   # 查看最新 stash 的修改摘要
git stash show -p                # 查看完整 diff
git stash show stash@{2}         # 查看指定 stash

git stash drop stash@{1}         # 删除指定 stash
git stash clear                  # 清空所有 stash (危险!)

# ═══ Stash 高级技巧 ═══
# 从 stash 创建分支 (避免冲突):
git stash branch new-feature stash@{0}
# → 基于 stash 创建时的提交创建新分支
# → 自动 apply stash 并删除

# 只 stash 暂存区内容:
git stash --staged               # Git 2.35+ 新增
# → 只保存已 git add 的修改

# ═══ Stash 内部原理 ═══
# stash 实际上创建了两个提交:
# 1. index commit  → 暂存区状态
# 2. working tree commit → 工作区状态 (以 index commit 为父)
# 这两个提交保存在 refs/stash 引用中`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 Reset 三模式深度解析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> reset_modes.sh</div>
                <pre className="fs-code">{`# ═══ Reset 的三个层次 ═══
#
# git reset 移动 HEAD 指针到指定 commit
# 三个 flag 控制对暂存区和工作区的影响:
#
# ┌──────────┬────────────┬────────────┬────────────┐
# │ 模式      │ HEAD       │ 暂存区     │ 工作区     │
# ├──────────┼────────────┼────────────┼────────────┤
# │ --soft   │ ✅ 移动    │ ❌ 不动    │ ❌ 不动    │
# │ --mixed  │ ✅ 移动    │ ✅ 重置    │ ❌ 不动    │
# │ --hard   │ ✅ 移动    │ ✅ 重置    │ ✅ 重置    │
# └──────────┴────────────┴────────────┴────────────┘

# ═══ --soft: 只移动 HEAD ═══
# 用途: 合并最近几个提交为一个
git reset --soft HEAD~3
# → 最近 3 个提交的修改全部保留在暂存区
git commit -m "feat: combined feature commit"
# → 效果等同于 squash

# ═══ --mixed (默认): 移动 HEAD + 清空暂存区 ═══
# 用途: 重新选择哪些文件进入提交
git reset HEAD~1                 # 等同于 git reset --mixed HEAD~1
# → 修改回到工作区 (未暂存状态)
# → 可以重新 git add 部分文件再提交

# ═══ --hard: 三者全部重置 ═══
# 用途: 彻底丢弃修改
git reset --hard HEAD~1
# → 代码被永久删除 (除非用 reflog 恢复)
# ⚠️ 这是 Git 中最危险的命令之一

# ═══ Reset 单个文件 ═══
git reset HEAD -- file.txt       # 取消暂存 (= git restore --staged)
git checkout HEAD -- file.txt    # 恢复到上次提交 (= git restore)

# ═══ 实战场景 ═══
# 场景 1: 刚提交了, 发现忘了加文件
git reset --soft HEAD~1          # 撤回提交
git add forgotten.txt
git commit -m "complete commit"

# 场景 2: 刚 push 了错误提交到 main
# ❌ 不要 reset (会改写公共历史)
# ✅ 使用 revert
git revert HEAD                  # 创建反向提交

# 场景 3: 要把 main 强制回退到某个版本
git reset --hard abc1234
git push --force-with-lease      # ⚠️ 需要权限 + 通知团队

# ═══ Reset vs Checkout vs Restore ═══
# ┌──────────┬──────────────────┬──────────────┐
# │ 命令      │ 作用              │ 安全性       │
# ├──────────┼──────────────────┼──────────────┤
# │ reset    │ 移动分支指针      │ ⚠ 改写历史  │
# │ checkout │ 移动 HEAD         │ ✅ 不改历史  │
# │ restore  │ 恢复文件          │ ⚠ 丢失修改  │
# │ revert   │ 创建反向提交      │ ✅ 安全      │
# └──────────┴──────────────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🕰️ Reflog: Git 的"后悔药"</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> reflog_rescue.sh</div>
                <pre className="fs-code">{`# ═══ Reflog 是什么 ═══
# Reference Log: 记录 HEAD 和分支引用的每一次移动
# → 即使 reset --hard 删除了提交, reflog 仍然记录着
# → 默认保留 90 天
# → 只存在于本地 (不会 push 到远程)

git reflog                       # 查看 HEAD 的移动记录
# abc1234 HEAD@{0}: commit: feat: add login
# def5678 HEAD@{1}: reset: moving to HEAD~1
# ghi9012 HEAD@{2}: commit: this was deleted by reset
# jkl3456 HEAD@{3}: checkout: moving from main to feature

# ═══ 救回被删除的提交 ═══
# 你不小心 git reset --hard HEAD~3, 删除了 3 个提交
# 别慌! 提交还在 reflog 中:
git reflog
# 找到被删除前的 commit hash
git reset --hard HEAD@{2}        # 恢复到那个状态!

# ═══ 救回被删除的分支 ═══
git branch -D feature/important  # 手滑删除了分支
git reflog                       # 找到该分支最后一个提交
# 找到: abc1234 HEAD@{5}: commit: last commit on feature/important
git branch feature/important abc1234  # 重建分支!

# ═══ Reflog 高级用法 ═══
# 查看特定分支的 reflog:
git reflog show main
git reflog show feature/auth

# 基于时间的引用:
git diff main@{yesterday}        # 昨天的 main
git diff main@{2.hours.ago}      # 2 小时前的 main
git log main@{2024-01-01}..main  # 2024年至今的提交

# ═══ 实战: 撤销一个失败的 rebase ═══
git rebase main                  # rebase 搞砸了, 历史乱了
git reflog                       # 找到 rebase 前的 HEAD
# abc1234 HEAD@{5}: rebase (start): ...
# def5678 HEAD@{6}: checkout: moving from feature to feature
#                   ↑ 这就是 rebase 前的状态
git reset --hard HEAD@{6}        # 回到 rebase 前!

# ═══ Reflog 过期配置 ═══
# 可达的 reflog 条目保留 90 天
# 不可达的保留 30 天
git config --global gc.reflogExpire 180.days
git config --global gc.reflogExpireUnreachable 90.days

# ═══ 重要提醒 ═══
# reflog 是纯本地的!
# → git clone 不会带 reflog
# → 换电脑后不存在
# → 依赖 reflog 不是长久之计
# → 重要代码务必及时 push`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 Bisect & Blame: 精确定位问题</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> bisect_blame.sh</div>
                <pre className="fs-code">{`# ═══ Git Bisect: 二分法定位 Bug ═══
#
# 场景: "上周还好好的, 今天就报错了"
# 最近有 200 个提交, 哪个引入了 bug?
# → 二分法: 只需 log₂(200) ≈ 8 次测试就能找到!

# 手动 bisect:
git bisect start
git bisect bad                   # 当前版本有 bug
git bisect good v1.0.0           # 已知 v1.0.0 没问题
# Git 自动 checkout 中间的提交
# 测试... 如果有 bug:
git bisect bad
# 测试... 如果没 bug:
git bisect good
# 重复 7-8 次后:
# "abc1234 is the first bad commit"
git bisect reset                 # 回到原来的分支

# ═══ 自动化 bisect (更强大!) ═══
git bisect start HEAD v1.0.0
git bisect run npm test          # 自动运行测试!
# → Git 自动 checkout + 运行测试 + 标记 good/bad
# → 完全无人值守, 找到引入 bug 的精确提交

# 自定义测试脚本:
git bisect run ./test-login.sh
# test-login.sh:
# #!/bin/bash
# npm test -- --grep "login" || exit 1

# ═══ Git Blame: 追问"谁写的这行代码" ═══
git blame src/auth.js
# abc1234 (Alice  2024-01-15  10) function login(user) {
# def5678 (Bob    2024-02-03  11)   if (!user.email) {
# ghi9012 (Alice  2024-01-15  12)     throw new Error("missing email");
# jkl3456 (Eve    2024-03-01  13)   }

# 常用选项:
git blame -L 10,20 src/auth.js   # 只看第 10-20 行
git blame -L /function login/ src/auth.js  # 从匹配行开始
git blame -w src/auth.js         # 忽略空白符变更
git blame -M src/auth.js         # 检测行在文件内的移动
git blame -C src/auth.js         # 检测从其他文件复制的行

# ═══ Git Log 追踪文件历史 ═══
git log --follow -- src/auth.js  # 跟踪重命名
git log -p -- src/auth.js        # 文件的完整变更历史
git log --all -S "function login" # 搜索代码在何时被添加/删除

# ═══ Git Grep: 全仓库搜索 ═══
git grep "TODO"                  # 搜索当前工作区
git grep "FIXME" HEAD~10         # 搜索 10 个提交前
git grep -n "import.*React"      # 带行号
git grep --count "console.log"   # 统计每个文件的匹配数
git grep -l "deprecated"          # 只列出包含匹配的文件名

# ═══ 总结: 调试工具选型 ═══
# ┌──────────┬──────────────────────────────┐
# │ 工具      │ 场景                          │
# ├──────────┼──────────────────────────────┤
# │ bisect   │ 找到引入 bug 的具体提交       │
# │ blame    │ 追溯某行代码的作者和提交       │
# │ log -S   │ 某段代码是在哪个提交添加的     │
# │ grep     │ 跨版本全文搜索               │
# │ show     │ 查看某个提交的详细变更        │
# └──────────┴──────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
