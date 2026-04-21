import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['🌊 Git Flow', '🚀 GitHub Flow', '🏎️ Trunk-Based', '📊 策略选型'];

export default function LessonGitFlow() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🌿 module_05 — 分支策略</div>
      <div className="fs-hero">
        <h1>分支策略：Git Flow / GitHub Flow / Trunk-Based</h1>
        <p>
          分支策略决定了团队<strong>如何组织代码、何时集成、如何发布</strong>。
          没有"最好"的策略——只有最适合你团队规模和发布频率的策略。
          <strong>选错策略 = 合并地狱</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌿 三大主流分支策略</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>🌊 Git Flow — 经典但重量级</h3>
            <div className="concept-card">
              <h4>适合：版本化发布的传统软件（移动 App、桌面软件、企业系统）</h4>
              <p>由 Vincent Driessen 在 2010 年提出。严格定义了 5 种分支类型和它们的生命周期。</p>
            </div>

            <h4 style={{color:'#fb923c', margin:'1rem 0 0.5rem'}}>5 种分支类型</h4>
            <div className="fs-grid-2">
              {[
                { branch:'main', desc:'生产环境代码，只接受 release/hotfix 合入', life:'永久', color:'#ef4444' },
                { branch:'develop', desc:'开发主线，所有 feature 合入此分支', life:'永久', color:'#22c55e' },
                { branch:'feature/*', desc:'新功能开发，从 develop 创建', life:'数天~数周', color:'#06b6d4' },
                { branch:'release/*', desc:'发布准备，冻结新功能只修 bug', life:'数天', color:'#f59e0b' },
                { branch:'hotfix/*', desc:'生产环境紧急修复，从 main 创建', life:'数小时', color:'#fb7185' },
              ].map(({ branch, desc, life, color }) => (
                <div key={branch} className="concept-card" style={{margin:'0', borderColor:`${color}33`}}>
                  <h4 style={{color}}><span className="git-chip branch" style={{color, background:`${color}15`}}>{branch}</span></h4>
                  <p>{desc}</p>
                  <p style={{fontSize:'0.75rem'}}>生命周期：{life}</p>
                </div>
              ))}
            </div>

            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> git_flow.sh</div>
              <pre className="fs-code">{`# ═══ 使用 git-flow 工具 ═══
brew install git-flow-avh

git flow init                    # 初始化 (设置分支名)
git flow feature start auth      # 创建 feature/auth (基于 develop)
git flow feature finish auth     # 合并到 develop + 删除分支
git flow release start v1.2.0    # 创建 release/v1.2.0 (基于 develop)
git flow release finish v1.2.0   # 合并到 main + develop + 打标签
git flow hotfix start fix-crash  # 创建 hotfix/fix-crash (基于 main)
git flow hotfix finish fix-crash # 合并到 main + develop

# ═══ 不用工具,手动操作 ═══
# Feature:
git switch develop && git switch -c feature/payment
# ... 开发完成 ...
git switch develop && git merge --no-ff feature/payment
git branch -d feature/payment

# Release:
git switch develop && git switch -c release/v1.2.0
# ... 只改 bug / 版本号 ...
git switch main && git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release 1.2.0"
git switch develop && git merge --no-ff release/v1.2.0`}</pre>
            </div>

            <div className="warning-box">
              ⚠️ <strong>Git Flow 的问题</strong>：分支太多，合并步骤复杂，CI/CD 需要跑在多个分支上。对于频繁部署的 Web 应用来说太重了。
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>🚀 GitHub Flow — 简洁高效</h3>
            <div className="concept-card">
              <h4>适合：持续部署的 Web 应用和 SaaS 产品</h4>
              <p>只有 <strong>main + feature branches</strong>。main 永远可部署。每次合并到 main 就自动部署。</p>
            </div>

            <div className="pipeline">
              {[
                { icon:'🌿', text:'Branch', sub:'从 main 创建', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
                { icon:'💻', text:'Commit', sub:'频繁小提交', bg:'rgba(249,115,22,0.12)', color:'#fb923c' },
                { icon:'📋', text:'PR', sub:'创建 Pull Request', bg:'rgba(139,92,246,0.12)', color:'#a78bfa' },
                { icon:'👁️', text:'Review', sub:'Code Review + CI', bg:'rgba(6,182,212,0.12)', color:'#67e8f9' },
                { icon:'🔀', text:'Merge', sub:'合并到 main', bg:'rgba(245,158,11,0.12)', color:'#fbbf24' },
                { icon:'🚀', text:'Deploy', sub:'自动部署', bg:'rgba(34,197,94,0.12)', color:'#4ade80' },
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
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> github_flow.sh</div>
              <pre className="fs-code">{`# GitHub Flow 全流程 (5 步)
# 1. 从 main 创建分支
git switch main && git pull
git switch -c feature/user-profile

# 2. 频繁提交
git add -p && git commit -m "feat: add profile page"
git add -p && git commit -m "feat: add avatar upload"

# 3. 推送并创建 PR
git push -u origin feature/user-profile
gh pr create --title "feat: add user profile"

# 4. Code Review + CI 通过
# 5. Merge + Auto Deploy
gh pr merge --squash

# 规则:
# ✅ main 永远可部署
# ✅ feature 分支名要有描述性
# ✅ PR 必须通过 CI
# ✅ 合并后自动部署`}</pre>
            </div>

            <div className="tip-box">
              💡 <strong>GitHub Flow 最适合</strong>：10人以下团队、Web 应用、有 CI/CD 管线、每天多次部署。GitHub 自身就用这个流程。
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>🏎️ Trunk-Based Development — 极限效率</h3>
            <div className="concept-card">
              <h4>适合：大型团队（Google、Facebook 级别）+ 特性开关</h4>
              <p>所有人直接在 main (trunk) 上开发。分支生命周期 <strong>{"<"} 1 天</strong>。代码在 main 中但功能被 Feature Flag 控制。</p>
            </div>

            <div className="comparison-grid">
              <div>
                <div className="label after">核心原则</div>
                <div className="sandbox-output">{`✅ 所有开发基于 main
✅ 分支生命周期 < 24 小时
✅ 频繁集成 (每天多次)
✅ Feature Flags 控制上线
✅ 完善的自动化测试
✅ CI 在 < 10 分钟内完成`}</div>
              </div>
              <div>
                <div className="label before">前提条件</div>
                <div className="sandbox-output">{`⚠️ 需要强大的 CI/CD 管线
⚠️ 需要 Feature Flag 系统
⚠️ 需要完善的测试覆盖
⚠️ 需要团队高度纪律
⚠️ 需要自动化代码审查
⚠️ 适合高级工程团队`}</div>
              </div>
            </div>

            <div className="fs-code-wrap" style={{marginTop:'0.75rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> trunk_based.js</div>
              <pre className="fs-code">{`// Feature Flag 示例 — 代码在 main 中但功能被控制
function CheckoutPage() {
  if (featureFlags.isEnabled('new-checkout-v2')) {
    return <NewCheckoutV2 />;   // 新版本 (只对 10% 用户开放)
  }
  return <LegacyCheckout />;    // 旧版本 (90% 用户)
}

// 渐进式发布:
// Week 1: 内部员工 → Week 2: 5% → Week 3: 50% → Week 4: 100%
// 如果出问题: 关闭 Flag 即可, 不需要回滚代码

// 常用 Feature Flag 服务:
// - LaunchDarkly (企业级)
// - Unleash (开源)
// - 自建: 简单的 JSON 配置 + 缓存`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <h3>📊 策略选型指南</h3>
            <table className="fs-table">
              <thead><tr><th>维度</th><th>Git Flow</th><th>GitHub Flow</th><th>Trunk-Based</th></tr></thead>
              <tbody>
                <tr><td>复杂度</td><td><span className="fs-tag red">高</span></td><td><span className="fs-tag green">低</span></td><td><span className="fs-tag amber">中</span></td></tr>
                <tr><td>团队规模</td><td>5-50 人</td><td>1-20 人</td><td>20-1000+ 人</td></tr>
                <tr><td>部署频率</td><td>按版本 (周/月)</td><td>每天多次</td><td>每天数十次</td></tr>
                <tr><td>分支生命周期</td><td>天~周</td><td>小时~天</td><td>{"<"} 1 天</td></tr>
                <tr><td>常驻分支数</td><td>2 (main + develop)</td><td>1 (main)</td><td>1 (main/trunk)</td></tr>
                <tr><td>回滚方式</td><td>Git revert</td><td>Git revert</td><td>Feature Flag</td></tr>
                <tr><td>前提条件</td><td>纪律性</td><td>CI/CD</td><td>CI/CD + Feature Flag</td></tr>
                <tr><td>典型用户</td><td>企业软件/App</td><td>GitHub/创业公司</td><td>Google/Facebook</td></tr>
              </tbody>
            </table>

            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 <strong>实际建议</strong>：大多数团队应该从 <strong>GitHub Flow</strong> 开始。如果发布流程需要更多控制，再过渡到 Git Flow。只有团队工程成熟度很高时，才考虑 Trunk-Based。
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
