import React, { useState, useCallback } from 'react';
import './LessonCommon.css';

const tabs = ['🌿 分支基础', '🔀 Merge 策略', '⛓️ Rebase 精通', '💥 冲突解决', '🎮 分支可视化'];

/* ── Branch Visualizer ── */
function BranchViz() {
  const [mode, setMode] = useState('ff'); // ff, 3way, squash, rebase
  const diagrams = {
    ff: {
      title: 'Fast-Forward Merge',
      desc: 'main 没有新提交，feature 是 main 的直接后代',
      before: 'main ──A──B\n              \\\\\n               C──D (feature)',
      after:  'main ──A──B──C──D\n(feature 被 "纳入" main，不产生合并提交)',
      cmd: 'git switch main && git merge feature',
    },
    '3way': {
      title: '三路合并 (3-way Merge)',
      desc: 'main 和 feature 各自有新提交，需要找共同祖先',
      before: 'main ──A──B──E\n              \\\\\n               C──D (feature)',
      after:  'main ──A──B──E──M (merge commit)\n              \\\\       /\n               C────D',
      cmd: 'git switch main && git merge --no-ff feature',
    },
    squash: {
      title: 'Squash Merge',
      desc: '把 feature 的所有提交压缩为一个到 main',
      before: 'main ──A──B\n              \\\\\n               C──D──E (feature, 3 WIP commits)',
      after:  'main ──A──B──S (squashed)\n(C+D+E 被压缩为单个提交 S)',
      cmd: 'git switch main && git merge --squash feature && git commit',
    },
    rebase: {
      title: 'Rebase (变基)',
      desc: '把 feature 的基底移到 main 的最新提交',
      before: 'main ──A──B──E\n              \\\\\n               C──D (feature)',
      after:  "main ──A──B──E\n                    \\\\\n                     C'──D' (feature, 新 hash!)",
      cmd: 'git switch feature && git rebase main',
    },
  };
  const d = diagrams[mode];
  return (
    <div className="sandbox">
      <div className="sandbox-header">
        <h4>🎨 合并策略可视化</h4>
      </div>
      <div className="sandbox-body">
        <div className="fs-pills" style={{marginBottom:'0.75rem'}}>
          {Object.entries(diagrams).map(([k, v]) => (
            <button key={k} className={`fs-btn ${mode === k ? 'primary' : ''}`}
              onClick={() => setMode(k)} style={{fontSize:'0.72rem', padding:'0.3rem 0.6rem'}}>{v.title}</button>
          ))}
        </div>
        <p style={{color:'#94a3b8', fontSize:'0.82rem', margin:'0 0 0.5rem'}}>{d.desc}</p>
        <div className="comparison-grid">
          <div>
            <div className="label before">Before</div>
            <div className="sandbox-output">{d.before}</div>
          </div>
          <div>
            <div className="label after">After</div>
            <div className="sandbox-output">{d.after}</div>
          </div>
        </div>
        <div className="fs-code-wrap" style={{marginTop:'0.75rem'}}>
          <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> command</div>
          <pre className="fs-code" style={{maxHeight:'60px'}}>{d.cmd}</pre>
        </div>
      </div>
    </div>
  );
}

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
          等策略，学会高效解决合并冲突。
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
          <div className="fs-card">
            <h3>🔖 分支的本质：一个 40 字符的指针</h3>
            <div className="concept-card">
              <h4>为什么 Git 分支如此轻量？</h4>
              <p>分支 = 一个文件，内容是 <strong>40 字符的 SHA-1 哈希</strong>。创建分支 = 创建 41 字节文件。切换分支 = 修改 .git/HEAD 的内容。</p>
              <p>对比 SVN：SVN 分支 = 复制整个目录树。Git 分支 = 写入一个 41B 文件。</p>
            </div>

            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> branch_basics.sh</div>
              <pre className="fs-code">{`# 分支就是一个文件:
cat .git/refs/heads/main
# → e3f1a2b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0

# ═══ 分支 CRUD ═══
git branch                        # 列出本地分支
git branch -a                     # 列出所有分支 (含远程)
git branch -v                     # 带最新提交信息
git switch -c feature/payment     # 创建 + 切换 (推荐用 switch)
git branch -d feature/auth        # 删除已合并的分支
git branch -D feature/abandoned   # 强制删除未合并的
git branch -m old-name new-name   # 重命名`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>分支命名规范</h4>
            <div className="fs-grid-3">
              {[
                { prefix: 'feature/', desc: '新功能', ex: 'feature/user-auth', color: '#22c55e' },
                { prefix: 'fix/', desc: 'Bug 修复', ex: 'fix/login-crash', color: '#ef4444' },
                { prefix: 'hotfix/', desc: '紧急修复', ex: 'hotfix/cve-2024-1234', color: '#fb7185' },
                { prefix: 'release/', desc: '发布分支', ex: 'release/v2.1.0', color: '#f59e0b' },
                { prefix: 'chore/', desc: '维护', ex: 'chore/update-deps', color: '#64748b' },
                { prefix: 'experiment/', desc: '实验性', ex: 'experiment/new-algo', color: '#8b5cf6' },
              ].map(({ prefix, desc, ex, color }) => (
                <div key={prefix} className="fs-card" style={{padding:'0.7rem', borderColor:`${color}22`}}>
                  <span className="git-chip branch" style={{color, background:`${color}15`}}>{prefix}</span>
                  <div style={{color:'#94a3b8', fontSize:'0.75rem', marginTop:'0.3rem'}}>{desc}</div>
                  <div style={{color:'#475569', fontSize:'0.68rem', fontFamily:'JetBrains Mono, monospace', marginTop:'0.15rem'}}>{ex}</div>
                </div>
              ))}
            </div>

            <div className="warning-box" style={{marginTop:'1rem'}}>
              ⚠️ <strong>分离 HEAD (Detached HEAD)</strong>：<code>git checkout abc1234</code> 会直接指向提交而非分支。此时的新提交不属于任何分支！解决方案：<code>git switch -c rescue-branch</code>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>🔀 合并策略全景</h3>
            <BranchViz />

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>Cherry-pick：精确移植提交</h4>
            <div className="concept-card">
              <h4>🍒 什么时候用 Cherry-pick？</h4>
              <p>在 feature 分支修了一个 bug，需要立刻 hotfix 到 main，但 feature 还没完成 → cherry-pick 该 fix 提交到 main。</p>
            </div>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> cherry-pick.sh</div>
              <pre className="fs-code">{`git cherry-pick abc1234              # 移植单个提交
git cherry-pick abc1234 def5678      # 移植多个提交
git cherry-pick abc1234..def5678     # 移植范围
git cherry-pick -n abc1234           # 只应用变更, 不自动提交`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>策略选型速查</h4>
            <table className="fs-table">
              <thead><tr><th>策略</th><th>适用场景</th><th>历史效果</th><th>推荐度</th></tr></thead>
              <tbody>
                <tr><td>Fast-Forward</td><td>简单线性开发</td><td>一条直线</td><td><span className="fs-tag green">常用</span></td></tr>
                <tr><td>--no-ff</td><td>功能分支合并</td><td>保留分支结构</td><td><span className="fs-tag green">推荐</span></td></tr>
                <tr><td>--squash</td><td>杂乱的 WIP 提交</td><td>干净的单提交</td><td><span className="fs-tag amber">适度</span></td></tr>
                <tr><td>cherry-pick</td><td>精确移植</td><td>创建新提交副本</td><td><span className="fs-tag amber">场景化</span></td></tr>
              </tbody>
            </table>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>⛓️ Rebase 深度解析</h3>
            <div className="concept-card">
              <h4>Rebase 的本质："变基" = 重放提交</h4>
              <p>Rebase 把 feature 分支的提交<strong>逐个重放</strong>到目标分支上。重放产生<strong>全新的提交</strong>（不同 SHA-1），虽然内容相同但父提交变了。</p>
            </div>

            <div className="danger-box">
              ❌ <strong>黄金法则</strong>：永远不要 rebase 已经 push 到公共分支的提交！因为 rebase 会改变 commit hash，其他人的历史会跟你的产生分歧。
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>Interactive Rebase —— 最强大的历史编辑器</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> interactive_rebase.sh</div>
              <pre className="fs-code">{`git rebase -i HEAD~5             # 编辑最近 5 个提交

# 编辑器打开, 每行一个提交:
# pick abc1234 feat: add login page
# pick def5678 fix: typo              ← 改为 fixup (合并到上面)
# pick ghi9012 feat: add dashboard
# pick jkl3456 wip: debugging         ← 改为 drop (删除)
# pick mno7890 feat: add settings

# 可用命令:
# pick   = 保留该提交
# reword = 保留提交, 修改提交信息
# edit   = 暂停让你修改
# squash = 合并到前一个提交 (保留两个信息)
# fixup  = 合并到前一个提交 (丢弃信息)
# drop   = 删除该提交
# 还可以调换行的顺序 → 提交顺序会改变!`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>Merge vs Rebase 对比</h4>
            <div className="comparison-grid">
              <div>
                <div className="label before">Merge</div>
                <div className="sandbox-output">{`✅ 保留真实历史
✅ 安全, 不改写已有提交
✅ 适合公共分支
❌ 历史图谱复杂
❌ 多合并提交噪音

git switch main
git merge feature`}</div>
              </div>
              <div>
                <div className="label after">Rebase</div>
                <div className="sandbox-output">{`✅ 线性整洁的历史
✅ 没有多余的合并提交
✅ git bisect 更高效
❌ 改写历史 (新 hash)
❌ 只能用于私有分支

git switch feature
git rebase main`}</div>
              </div>
            </div>

            <div className="tip-box">
              💡 <strong>团队黄金工作流</strong>：在 feature 分支用 <code>rebase</code> 保持最新；合回 main 时用 <code>merge --no-ff</code> 保留分支历史。两全其美！
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>💥 合并冲突解决实战</h3>
            <div className="concept-card">
              <h4>冲突是怎么产生的？</h4>
              <p>两个分支修改了<strong>同一个文件的同一行</strong>。Git 无法自动决定保留哪个版本，需要人工介入。</p>
            </div>

            <h4 style={{color:'#fb923c', margin:'1rem 0 0.5rem'}}>冲突标记解读 (diff3 模式)</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> conflict_markers</div>
              <pre className="fs-code">{`<<<<<<< HEAD
const API_URL = "https://api.prod.com";    ← 当前分支 (ours)
||||||| merged common ancestor
const API_URL = "https://api.staging.com";  ← 共同祖先 (diff3 模式)
=======
const API_URL = "https://api.dev.com";     ← 合入分支 (theirs)
>>>>>>> feature/new-api

// 解决方案: 删除标记, 保留正确的代码
const API_URL = process.env.API_URL || "https://api.prod.com";`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>冲突解决步骤</h4>
            <div className="pipeline">
              {[
                { icon:'🔍', text:'git status', sub:'查看冲突文件', bg:'rgba(249,115,22,0.12)', color:'#fb923c' },
                { icon:'✏️', text:'手动编辑', sub:'删除冲突标记', bg:'rgba(239,68,68,0.12)', color:'#f87171' },
                { icon:'✅', text:'git add .', sub:'标记已解决', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
                { icon:'💾', text:'git commit', sub:'完成合并', bg:'rgba(139,92,246,0.12)', color:'#a78bfa' },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="pipeline-arrow">→</span>}
                  <div className="pipeline-stage" style={{background:s.bg, border:`1px solid ${s.color}33`, color:s.color}}>
                    <span>{s.icon} {s.text}</span><small>{s.sub}</small>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <h4 style={{color:'#fb923c', margin:'1rem 0 0.5rem'}}>减少冲突的最佳实践</h4>
            <div className="fs-grid-2">
              <div className="concept-card">
                <h4>🔄 频繁同步</h4>
                <p>每天早上 <code>git rebase main</code>，把主线的最新变更合入你的 feature 分支。</p>
              </div>
              <div className="concept-card">
                <h4>📐 小提交</h4>
                <p>大量小提交比少量大提交更容易解决冲突。单个提交只做一件事。</p>
              </div>
              <div className="concept-card">
                <h4>📋 CODEOWNERS</h4>
                <p>明确文件所有权，减少多人同时修改同一文件的概率。</p>
              </div>
              <div className="concept-card">
                <h4>🧠 Rerere</h4>
                <p><code>git config rerere.enabled true</code> — Git 记住你的冲突解决方案，下次自动应用！</p>
              </div>
            </div>
          </div>
        )}

        {active === 4 && (
          <div className="fs-card">
            <BranchViz />
            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 切换上方的合并策略按钮，观察 Fast-Forward / 三路合并 / Squash / Rebase 对提交历史的不同影响。
            </div>
            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>实用命令速查</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> branch_utils.sh</div>
              <pre className="fs-code">{`# 可视化分支图
git log --oneline --graph --all --decorate

# 查看已合并/未合并的分支
git branch --merged main          # 可以安全删除
git branch --no-merged main       # 还有未合并的工作

# 测试合并是否会冲突 (不实际合并)
git merge --no-commit --no-ff feature
git diff --cached                    # 查看合并结果
git merge --abort                    # 取消"试合并"

# 精确控制变基起点
git rebase --onto main dev feature   # 把 feature 从 dev 移到 main`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
