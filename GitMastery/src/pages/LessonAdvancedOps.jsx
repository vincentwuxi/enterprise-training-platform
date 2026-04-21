import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['🗃️ Stash', '⏪ Reset 与 Reflog', '🔍 Bisect 与 Blame', '🛠️ 高级技巧'];

export default function LessonAdvancedOps() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🔧 module_04 — 高级操作</div>
      <div className="fs-hero">
        <h1>高级操作：Stash / Reset / Reflog / Bisect / Blame</h1>
        <p>
          掌握这些高级命令，你就能从容应对<strong>99% 的 Git 紧急情况</strong>。
          Stash 临时保存工作、Reset 精确撤销、Reflog 恢复误删、Bisect 二分查找 bug 引入点、
          Blame 追溯每一行代码的作者。<strong>这些是区分 Git 用户和 Git 高手的关键技能</strong>。
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
          <div className="fs-card">
            <h3>🗃️ Stash — 临时保存工作进度</h3>
            <div className="concept-card">
              <h4>什么时候需要 Stash？</h4>
              <p>你正在 feature 分支写代码，突然需要切到 main 修一个紧急 bug。但当前的修改还不想 commit（半成品代码）。</p>
              <p>Stash 把你的修改"藏起来"，恢复干净的工作区，等你处理完再"取出来"继续工作。</p>
            </div>

            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> stash_mastery.sh</div>
              <pre className="fs-code">{`# ═══ 基本 Stash ═══
git stash                        # 保存所有修改 (已跟踪文件)
git stash -u                     # 包含未跟踪的新文件
git stash -a                     # 包含 .gitignore 的文件 (慎用)
git stash save "WIP: payment flow" # 带描述信息 (推荐!)

# ═══ 查看 & 恢复 ═══
git stash list                   # 列出所有 stash
# stash@{0}: On feature: WIP: payment flow
# stash@{1}: On main: quick experiment

git stash show                   # 查看最新 stash 的变更摘要
git stash show -p                # 查看完整 diff

git stash pop                    # 恢复最新的 stash + 删除记录
git stash apply                  # 恢复但不删除记录 (可重复应用)
git stash apply stash@{2}       # 恢复指定的 stash
git stash drop stash@{1}        # 删除指定 stash
git stash clear                  # 清空所有 stash (危险!)

# ═══ 高级用法 ═══
git stash branch fix-branch      # 从 stash 创建新分支 (推荐!)
# → 当 pop 时有冲突, 用这个更安全

# 只 stash 部分文件
git stash push -m "only styles" -- src/styles/
git stash push -p                 # 交互式选择要 stash 的块`}</pre>
            </div>

            <div className="tip-box">
              💡 <strong>Pro Tip</strong>：用 <code>git stash save "描述信息"</code> 而非 <code>git stash</code>。当你有多个 stash 时，描述信息能帮你找到正确的那个。
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>⏪ Reset 三模式 & Reflog 后悔药</h3>

            <h4 style={{color:'#fb923c', margin:'0 0 0.5rem'}}>Reset 三模式对比</h4>
            <div className="fs-grid-3">
              <div className="concept-card" style={{borderColor:'rgba(34,197,94,0.3)'}}>
                <h4 style={{color:'#4ade80'}}>--soft</h4>
                <p><strong>只移动 HEAD</strong></p>
                <p>暂存区 ✅ 工作区 ✅</p>
                <p style={{color:'#4ade80'}}>用途：合并提交</p>
              </div>
              <div className="concept-card" style={{borderColor:'rgba(245,158,11,0.3)'}}>
                <h4 style={{color:'#fbbf24'}}>--mixed (默认)</h4>
                <p><strong>移动 HEAD + 清暂存</strong></p>
                <p>暂存区 ❌ 工作区 ✅</p>
                <p style={{color:'#fbbf24'}}>用途：重新选择文件</p>
              </div>
              <div className="concept-card" style={{borderColor:'rgba(239,68,68,0.3)'}}>
                <h4 style={{color:'#f87171'}}>--hard ⚠️</h4>
                <p><strong>全部清除</strong></p>
                <p>暂存区 ❌ 工作区 ❌</p>
                <p style={{color:'#f87171'}}>用途：彻底丢弃</p>
              </div>
            </div>

            <div className="fs-code-wrap" style={{marginTop:'0.75rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> reset_examples.sh</div>
              <pre className="fs-code">{`# ═══ 常见场景 ═══

# 场景1: 合并最近3次提交为一个
git reset --soft HEAD~3
git commit -m "feat: combine 3 commits"

# 场景2: 提交了不该提交的文件
git reset --mixed HEAD~1         # 撤销提交, 文件回到工作区
git add correct_files.txt        # 重新选择
git commit -m "correct commit"

# 场景3: 彻底放弃最近的修改
git reset --hard HEAD~1          # ⚠️ 一切都丢了!
# 但是... reflog 可以救你`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>🛟 Reflog — 终极后悔药</h4>
            <div className="concept-card" style={{borderColor:'rgba(34,197,94,0.3)'}}>
              <h4 style={{color:'#4ade80'}}>Reflog 记录了 HEAD 的每一次移动</h4>
              <p>即使 <code>git reset --hard</code> 丢失了提交，reflog 还保留着引用。<strong>保留 90 天</strong>。</p>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> reflog_rescue.sh</div>
              <pre className="fs-code">{`git reflog                       # 查看 HEAD 的所有移动记录
# abc1234 HEAD@{0}: reset: moving to HEAD~3
# def5678 HEAD@{1}: commit: WIP: important work
# ghi9012 HEAD@{2}: commit: feat: add login
# jkl3456 HEAD@{3}: checkout: moving from main to feature

# 恢复到 3 步操作前的状态:
git reset --hard HEAD@{3}

# 或者只恢复某个丢失的提交:
git cherry-pick def5678

# 查看特定分支的 reflog:
git reflog show feature/auth`}</pre>
            </div>
            <div className="warning-box">
              ⚠️ Reflog 只存在于<strong>本地</strong>，不会被推送到远程。且默认只保留 90 天。如果你 clone 一个新仓库，它的 reflog 是空的。
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>🔍 Bisect (二分查找 bug) & Blame (追溯代码)</h3>

            <div className="concept-card">
              <h4>🎯 Git Bisect — 用二分法找到引入 bug 的提交</h4>
              <p>如果你知道"v1.0 是好的，当前版本有 bug"，bisect 可以在 <strong>O(log n)</strong> 次测试内找到罪魁祸首。1000 个提交只需测试 ~10 次！</p>
            </div>

            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> bisect.sh</div>
              <pre className="fs-code">{`# ═══ 手动 Bisect ═══
git bisect start
git bisect bad                   # 当前版本有 bug
git bisect good v1.0             # v1.0 是好的

# Git 自动 checkout 中间的提交
# 你测试后告诉 Git 结果:
git bisect good                  # 这个版本没问题
# 或
git bisect bad                   # 这个版本有 bug

# 重复几次后 Git 会告诉你:
# abc1234 is the first bad commit
# Author: Bob <bob@company.com>
# Date: Mon Jan 15 2024
# fix: update API endpoint   ← 就是这次提交引入了 bug!

git bisect reset                 # 回到原始状态

# ═══ 自动 Bisect (更强大!) ═══
# 写一个测试脚本, 返回 0=good, 非0=bad
git bisect start HEAD v1.0
git bisect run npm test          # 自动二分! 全程无人值守`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>📜 Blame — 追溯每一行代码的作者</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> blame.sh</div>
              <pre className="fs-code">{`git blame src/auth.js            # 显示每行的最后修改者
# abc1234 (Alice 2024-01-15  1) const jwt = require('jsonwebtoken');
# def5678 (Bob   2024-02-20  2) const SECRET = process.env.JWT_SECRET;
# ghi9012 (Alice 2024-01-15  3) 
# jkl3456 (Carol 2024-03-10  4) function verify(token) {

git blame -L 10,20 src/auth.js   # 只看第 10-20 行
git blame -w src/auth.js         # 忽略空白变更
git blame -C src/auth.js         # 检测跨文件移动的代码
git blame --since="2024-01-01" src/auth.js

# 在 VS Code 中: GitLens 插件提供内联 blame 显示`}</pre>
            </div>

            <div className="tip-box">
              💡 <strong>Bisect + 自动化测试</strong> 是定位回归 bug 的终极武器。写好单元测试，<code>git bisect run</code> 帮你全自动定位！
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>🛠️ 更多高级技巧</h3>

            <div className="fs-grid-2">
              <div className="concept-card">
                <h4>🧹 git clean — 清理未跟踪文件</h4>
                <p><code>git clean -fd</code> 删除未跟踪的文件和目录。<code>-n</code> 参数可以先预览要删除的文件。</p>
              </div>
              <div className="concept-card">
                <h4>📋 git archive — 导出干净的源码</h4>
                <p><code>git archive --format=tar.gz HEAD -o release.tar.gz</code> 可以导出不包含 .git 的源码压缩包。</p>
              </div>
              <div className="concept-card">
                <h4>🪵 git log --all --graph</h4>
                <p>用 ASCII 艺术显示完整的分支拓扑图。搭配 <code>--oneline</code> 更紧凑。</p>
              </div>
              <div className="concept-card">
                <h4>📊 git shortlog -sn</h4>
                <p>按提交数量统计每个作者的贡献。加 <code>--since</code> 可以统计特定时间段。</p>
              </div>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>文件考古学</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> file_archaeology.sh</div>
              <pre className="fs-code">{`# ═══ 搜索代码历史 ═══
git log -S "TODO"                    # 搜索添加/删除了 "TODO" 的提交
git log -G "function\\s+auth"         # 正则搜索
git log --diff-filter=D -- "*.py"    # 查看被删除的 Python 文件
git log --follow -- old_name.js      # 跟踪文件重命名

# ═══ 恢复被删除的文件 ═══
# 找到删除文件的提交:
git log --diff-filter=D -- path/to/deleted_file
# 恢复 (取删除提交的父提交):
git checkout abc1234^ -- path/to/deleted_file

# ═══ 查看文件在某个时间点的内容 ═══
git show HEAD~5:src/config.js        # 5 个提交前的版本
git show main:package.json           # main 分支的版本

# ═══ 统计 ═══
git diff --stat HEAD~10              # 最近 10 次提交的文件变更统计
git log --numstat --format="" | awk '{add+=$1; del+=$2} END {print "+" add " -" del}'`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
