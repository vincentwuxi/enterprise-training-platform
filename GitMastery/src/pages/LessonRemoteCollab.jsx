import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['📡 远程仓库', '📋 PR 与 Code Review', '🍴 Fork 工作流', '👥 团队协作'];

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
          驱动的协作流程，学习 Fork 开源贡献工作流。
          <strong>团队协作能力 = Git 技术 + 沟通能力</strong>。
        </p>
      </div>

      {/* 远程交互模型 */}
      <div className="pipeline">
        {[
          { icon:'💻', text:'Local Branch', sub:'main', bg:'rgba(139,92,246,0.12)', color:'#a78bfa' },
          { icon:'🔽', text:'fetch', sub:'只下载,不合并', bg:'rgba(6,182,212,0.1)', color:'#67e8f9' },
          { icon:'📡', text:'Remote Tracking', sub:'origin/main', bg:'rgba(245,158,11,0.12)', color:'#fbbf24' },
          { icon:'🔼', text:'push', sub:'推送到远程', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
          { icon:'☁️', text:'Remote', sub:'GitHub/GitLab', bg:'rgba(249,115,22,0.12)', color:'#fb923c' },
        ].map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="pipeline-arrow">{i % 2 === 0 ? '←' : '→'}</span>}
            <div className="pipeline-stage" style={{background:s.bg, border:`1px solid ${s.color}33`, color:s.color}}>
              <span>{s.icon} {s.text}</span><small>{s.sub}</small>
            </div>
          </React.Fragment>
        ))}
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 远程协作核心技能</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>📡 远程仓库操作</h3>
            <div className="concept-card">
              <h4>Fetch vs Pull — 关键区别</h4>
              <p><strong>fetch</strong>：只下载远程变更到 origin/main，不修改本地 main。安全！</p>
              <p><strong>pull</strong>：= fetch + merge/rebase。可能产生冲突。</p>
            </div>

            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> remote_operations.sh</div>
              <pre className="fs-code">{`# ═══ 远程仓库管理 ═══
git remote -v                    # 查看远程仓库
git remote add upstream https://github.com/org/repo.git
git remote rename origin github
git remote remove old-remote

# ═══ Fetch (安全下载) ═══
git fetch origin                 # 下载所有远程分支更新
git fetch origin main            # 只获取 main 分支
git fetch --all                  # 获取所有远程仓库
git fetch --prune                # 清除已删除的远程分支引用

# ═══ Pull 策略 ═══
git pull                         # = fetch + merge (默认)
git pull --rebase                # = fetch + rebase (推荐!)
git pull --ff-only               # 只在可以 fast-forward 时才 pull

# ═══ Push ═══
git push origin main             # 推送到 origin
git push -u origin feature       # 推送并设置上游跟踪
git push --force-with-lease      # 安全的强制推送 (推荐)
git push origin --delete feature # 删除远程分支
git push --tags                  # 推送所有标签`}</pre>
            </div>

            <div className="danger-box">
              ❌ <strong>git push --force</strong> 会覆盖远程分支！团队协作中应该用 <code>--force-with-lease</code>，它会检查远程是否有你不知道的新提交。
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>上游跟踪分支</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> tracking.sh</div>
              <pre className="fs-code">{`git branch -vv                   # 查看跟踪关系
# * main     abc1234 [origin/main] Latest commit
#   feature  def5678 [origin/feature: ahead 2, behind 1]
#
# ahead 2:  本地有 2 个提交未推送
# behind 1: 远程有 1 个提交未拉取

git branch --set-upstream-to=origin/main main

# Tag 管理
git tag -a v1.0.0 -m "Release 1.0.0"  # 注释标签 (推荐)
git push origin v1.0.0                 # 推送标签`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>📋 Pull Request 与 Code Review</h3>
            <h4 style={{color:'#fb923c', margin:'0 0 0.5rem'}}>PR 驱动的开发流程</h4>
            <div className="pipeline">
              {[
                { icon:'🌿', text:'创建分支', sub:'switch -c feature', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
                { icon:'💻', text:'开发提交', sub:'add + commit', bg:'rgba(249,115,22,0.12)', color:'#fb923c' },
                { icon:'🔼', text:'Push', sub:'push -u origin', bg:'rgba(6,182,212,0.12)', color:'#67e8f9' },
                { icon:'📋', text:'创建 PR', sub:'GitHub/GitLab', bg:'rgba(139,92,246,0.12)', color:'#a78bfa' },
                { icon:'👁️', text:'Code Review', sub:'同事审查', bg:'rgba(245,158,11,0.12)', color:'#fbbf24' },
                { icon:'✅', text:'Merge', sub:'合并到 main', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="pipeline-arrow">→</span>}
                  <div className="pipeline-stage" style={{background:s.bg, border:`1px solid ${s.color}33`, color:s.color}}>
                    <span>{s.icon} {s.text}</span><small>{s.sub}</small>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>Code Review 最佳实践</h4>
            <div className="comparison-grid">
              <div>
                <div className="label after">✅ DO (作为 Reviewer)</div>
                <div className="sandbox-output">{`• 先理解目标再看代码
• 提出可操作的建议
• 区分 blocking / nit
• 赞美好的设计
• 给出代码示例
• 30 分钟内完成首次 review`}</div>
              </div>
              <div>
                <div className="label before">❌ DON'T</div>
                <div className="sandbox-output">{`• 逐行吹毛求疵
• "这代码不太好" (无建设性)
• 全标 "Request Changes"
• 只指出问题不赞美
• "你应该知道怎么改"
• 拖延超过 24 小时不 review`}</div>
              </div>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>Review 评论前缀规范</h4>
            <div className="fs-grid-3">
              {[
                { prefix: '[nit]', desc: '代码风格, 不阻塞', color: '#64748b' },
                { prefix: '[question]', desc: '不理解, 需要解释', color: '#06b6d4' },
                { prefix: '[suggest]', desc: '可选的改进', color: '#f59e0b' },
                { prefix: '[blocking]', desc: '必须修改才合并', color: '#ef4444' },
                { prefix: '[praise]', desc: '做得好的部分', color: '#22c55e' },
                { prefix: '[TODO]', desc: '可后续跟进', color: '#8b5cf6' },
              ].map(({ prefix, desc, color }) => (
                <div key={prefix} className="fs-metric" style={{borderColor:`${color}22`, padding:'0.5rem'}}>
                  <div className="fs-metric-value" style={{color, fontSize:'0.82rem'}}>{prefix}</div>
                  <div className="fs-metric-label" style={{textTransform:'none'}}>{desc}</div>
                </div>
              ))}
            </div>

            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 <strong>GitHub CLI 加速</strong>：<code>gh pr create --title "feat: add profile"</code> / <code>gh pr checkout 42</code> / <code>gh pr merge 42 --squash</code>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>🍴 Fork 工作流 (开源贡献)</h3>
            <div className="concept-card">
              <h4>Fork vs Clone — 核心区别</h4>
              <p><strong>Clone</strong>：下载仓库到本地，你有 push 权限（如果是自己的仓库）。</p>
              <p><strong>Fork</strong>：在 GitHub 上复制一份到自己账号，你对 fork 有完整权限，通过 PR 向原始仓库贡献。</p>
            </div>

            <h4 style={{color:'#fb923c', margin:'1rem 0 0.5rem'}}>开源贡献标准流程</h4>
            <div className="pipeline">
              {[
                { icon:'🍴', text:'Fork', sub:'GitHub 上', bg:'rgba(249,115,22,0.12)', color:'#fb923c' },
                { icon:'📥', text:'Clone', sub:'你的 fork', bg:'rgba(6,182,212,0.12)', color:'#67e8f9' },
                { icon:'🔗', text:'Add upstream', sub:'原始仓库', bg:'rgba(245,158,11,0.12)', color:'#fbbf24' },
                { icon:'🌿', text:'Branch', sub:'基于最新 main', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
                { icon:'💻', text:'Develop', sub:'修改代码', bg:'rgba(139,92,246,0.12)', color:'#a78bfa' },
                { icon:'📋', text:'PR', sub:'→ 原始仓库', bg:'rgba(249,115,22,0.12)', color:'#fb923c' },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="pipeline-arrow">→</span>}
                  <div className="pipeline-stage" style={{background:s.bg, border:`1px solid ${s.color}33`, color:s.color}}>
                    <span>{s.icon} {s.text}</span><small>{s.sub}</small>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> fork_workflow.sh</div>
              <pre className="fs-code">{`# 1. Clone 自己的 fork
git clone git@github.com:you/react.git && cd react

# 2. 添加上游仓库
git remote add upstream https://github.com/facebook/react.git
# origin   = 你的 fork    (有 push 权限)
# upstream = 原始仓库      (只有 fetch 权限)

# 3. 保持同步
git fetch upstream
git switch main
git rebase upstream/main         # 同步上游到本地 main
git push origin main             # 更新你的 fork

# 4. 创建功能分支 → 开发 → 推送
git switch -c fix/typo-in-docs
git add . && git commit -m "docs: fix typo in hooks guide"
git push origin fix/typo-in-docs

# 5. 在 GitHub 创建 PR: you:fix/typo-in-docs → facebook:main

# 6. PR 过期？上游有新提交？
git fetch upstream
git rebase upstream/main         # 变基到最新
git push --force-with-lease      # 强制推送更新 PR`}</pre>
            </div>

            <div className="tip-box">
              💡 <strong>贡献前必读</strong>：先看项目的 <code>CONTRIBUTING.md</code>，先开 Issue 讨论方案，遵循 commit 规范，一个 PR 只做一件事。
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>👥 团队协作模式</h3>
            <h4 style={{color:'#fb923c', margin:'0 0 0.5rem'}}>团队每日工作流</h4>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> daily_workflow.sh</div>
              <pre className="fs-code">{`# 早上开始工作:
git switch main && git pull --rebase      # 同步最新代码
git switch -c feature/my-task             # 创建任务分支

# 开发过程中 (频繁提交):
git add -p && git commit -m "feat: implement X"

# 推送前同步:
git fetch origin main
git rebase origin/main                    # 基于最新 main 变基
git push -u origin feature/my-task        # 推送

# PR 合并后:
git switch main && git pull
git branch -d feature/my-task`}</pre>
            </div>

            <h4 style={{color:'#fb923c', margin:'1.5rem 0 0.5rem'}}>保护分支设置 (GitHub/GitLab)</h4>
            <div className="fs-grid-2">
              {[
                { icon:'🔒', title:'需要 PR 才能合并', desc:'禁止直接 push 到 main' },
                { icon:'👁️', title:'至少 1-2 个 approver', desc:'确保代码被审查' },
                { icon:'✅', title:'CI 必须通过', desc:'自动化质量门禁' },
                { icon:'🔄', title:'分支与 base 保持最新', desc:'避免过期代码合并' },
                { icon:'🚫', title:'禁止 force-push', desc:'保护历史不被改写' },
                { icon:'📝', title:'CODEOWNERS 文件', desc:'自动分配 reviewer' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="concept-card" style={{margin:'0'}}>
                  <h4>{icon} {title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>

            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 <strong>Git Worktree</strong>：<code>git worktree add ../hotfix hotfix/urgent</code> — 在另一个目录检出分支，不需要 stash 当前工作！
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
