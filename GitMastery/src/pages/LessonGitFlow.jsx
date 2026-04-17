import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Git Flow', 'GitHub Flow', 'Trunk-Based', '策略对比'];

export default function LessonGitFlow() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🔀 module_05 — 分支策略</div>
      <div className="fs-hero">
        <h1>分支策略：Git Flow / GitHub Flow / Trunk-Based</h1>
        <p>
          <strong>分支策略是团队效能的倍增器</strong>。错误的策略会导致"合并地狱"，
          正确的策略能让 10 人团队像 2 人一样敏捷。本模块对比三大主流分支策略，
          分析各自适用场景：Git Flow 适合版本化发布，GitHub Flow 适合持续部署，
          Trunk-Based 适合高频迭代。<strong>没有最好的策略，只有最适合的策略</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🗺️ 分支策略决策</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌊 Git Flow: 经典版本化发布</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> git_flow.sh</div>
                <pre className="fs-code">{`# ═══ Git Flow 分支模型 (Vincent Driessen, 2010) ═══
#
# main ─────────────────────●────────────●──────→ (生产环境)
#                          ↑            ↑
# release ────────────●───/  ────●─────/
#                     ↑          ↑
# develop ──●──●──●──●──●──●──●──●──●──●──●──→ (开发主线)
#            \\   /    \\       /
# feature     ──●      ──●──●  
#
# hotfix (从 main 分出, 修复后合回 main + develop)
# main ──●───────────────────●──→
#         \\                 /
# hotfix   ──●──●──────────

# ═══ 五种分支角色 ═══
# 1. main:    生产代码, 只能通过 release/hotfix 合入
# 2. develop: 开发主线, 集成所有 feature
# 3. feature: 功能分支, 从 develop 分出, 合回 develop
# 4. release: 预发布分支, 从 develop 分出, 合回 main + develop
# 5. hotfix:  紧急修复, 从 main 分出, 合回 main + develop

# ═══ 完整流程 ═══
# 开发新功能:
git switch develop
git switch -c feature/user-profile
# ... 开发 ...
git switch develop
git merge --no-ff feature/user-profile
git branch -d feature/user-profile

# 准备发布:
git switch develop
git switch -c release/v2.1.0
# 修复小 bug, 更新版本号, 更新 CHANGELOG
git switch main
git merge --no-ff release/v2.1.0
git tag -a v2.1.0 -m "Release 2.1.0"
git switch develop
git merge --no-ff release/v2.1.0     # 把 release 的修复同步回 develop
git branch -d release/v2.1.0

# 紧急修复:
git switch main
git switch -c hotfix/critical-bug
# ... 修复 ...
git switch main
git merge --no-ff hotfix/critical-bug
git tag -a v2.1.1 -m "Hotfix 2.1.1"
git switch develop
git merge --no-ff hotfix/critical-bug  # 同步到 develop
git branch -d hotfix/critical-bug

# ═══ 优缺点 ═══
# ✅ 适合: 版本化发布 (移动 App / 桌面软件 / SDK)
# ✅ 严格的发布流程, 适合大型团队
# ❌ 分支多, 流程复杂
# ❌ develop 和 main 双主线容易混乱
# ❌ 不适合持续部署`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🐙 GitHub Flow: 极简持续部署</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> github_flow.sh</div>
                <pre className="fs-code">{`# ═══ GitHub Flow (Scott Chacon, 2011) ═══
# 规则极简, 只有一条:
# main 分支始终是可部署的
#
# main ──●──●──●──●──●──●──●──────→ (始终可部署)
#         \\   /    \\       /
# feature  ──●      ──●──●
#                   ↑
#                   PR + Review + CI
#
# 整个流程只有 6 步:
# 1. 从 main 创建分支 (名字描述功能)
# 2. 提交代码
# 3. 开 Pull Request
# 4. Review + 讨论
# 5. 部署到 staging 测试 (或预览环境)
# 6. 合并到 main → 自动部署生产

# ═══ 实战 ═══
git switch main
git pull
git switch -c add-dark-mode

# 开发、测试...
git push -u origin add-dark-mode

# 在 GitHub 上创建 PR
# CI 自动跑测试
# Vercel/Netlify 自动创建预览部署
# 团队 Review

# Review 通过后, 合并 PR (通常 Squash Merge)
# Merge 触发 CD Pipeline → 自动部署到生产环境

# ═══ 与 Feature Flags 结合 ═══
# 大功能可以分多次小 PR 合并到 main
# 每次都隐藏在 Feature Flag 后面
# 全部完成后打开 Flag → 功能上线
#
# 好处:
# → main 始终可部署
# → 小 PR 容易 Review
# → 减少长生命周期分支
# → 可以按用户群灰度发布

# ═══ 部署环境管理 ═══
# 方案 1: 分支部署
# main → 生产环境
# PR → Preview/Staging (Vercel/Netlify 自动)
#
# 方案 2: 环境分支 (不推荐)
# main → 生产, staging → 预发, dev → 开发
# → 容易产生分支漂移, 不建议使用

# ═══ 优缺点 ═══
# ✅ 简单! 新人 5 分钟学会
# ✅ 适合 Web 应用 (SaaS / 网站)
# ✅ 天然适配 CI/CD
# ✅ PR 驱动, 代码质量有保障
# ❌ 不适合多版本并行维护
# ❌ 大功能需要 Feature Flag 配合`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏎️ Trunk-Based Development</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> trunk_based.sh</div>
                <pre className="fs-code">{`# ═══ Trunk-Based Development ═══
# Google / Facebook / Netflix 采用的模式
# 核心思想: 所有人直接向 trunk (main) 提交
#
# main ──●──●──●──●──●──●──●──●──●──→
#         ↑  ↑     ↑     ↑  ↑  ↑
#        直接提交到 main (或极短生命周期分支)
#
# 关键约束:
# 1. 分支生命周期 < 1 天
# 2. 每次提交都必须通过 CI
# 3. 必须搭配 Feature Flags
# 4. 必须有强力的自动化测试

# ═══ 两种变体 ═══

# 变体 1: 直接提交 (Google 内部)
git switch main
git pull --rebase
# ... 修改 (小变更) ...
git add . && git commit -m "fix: typo"
git push
# → 每天可能提交 10+ 次到 main
# → 依赖强大的 CI/CD 和测试覆盖

# 变体 2: 短期分支 (推荐入门)
git switch -c fix/button-color    # 生命周期 < 1 天
# ... 修改 ...
git push -u origin fix/button-color
# 创建 PR → 快速 Review → 合并
# → 分支在 PR 合并后立即删除

# ═══ 发布策略: Release from Trunk ═══
# 方法 1: 直接从 main tag 发布
git tag -a v3.2.0 -m "Release 3.2.0"
git push origin v3.2.0
# CI/CD 检测到 tag → 自动构建发布

# 方法 2: Release Branch (仅用于 hotfix)
git switch -c release/v3.2 main
# 发现 bug → cherry-pick 修复到 release 分支
git cherry-pick abc1234
git tag -a v3.2.1 -m "Patch"
# → release 分支只接收 cherry-pick, 不接新功能

# ═══ Feature Flags 是必需的 ═══
# 不完整的功能必须隐藏在 Flag 后面:
#
# // 使用 LaunchDarkly / Unleash / 自建
# if (featureFlags.isEnabled('new-checkout')) {
#   return <NewCheckout />;
# }
# return <OldCheckout />;
#
# Flag 的生命周期:
# 1. 开发时: 只对开发者开放
# 2. 测试时: 对内部用户开放
# 3. 灰度: 对 5% → 25% → 50% → 100% 用户开放
# 4. 全量后: 删除 Flag 和旧代码

# ═══ 优缺点 ═══
# ✅ 极简: 几乎没有分支管理开销
# ✅ 持续集成/部署的终极形态
# ✅ 减少合并冲突 (因为分支短)
# ✅ Google/Meta 工程规模已验证
# ❌ 需要成熟的 CI/CD 和测试基础
# ❌ 需要 Feature Flag 基础设施
# ❌ 对开发纪律要求极高`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 三大策略对比决策表</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> strategy_comparison</div>
                <pre className="fs-code">{`# ═══ 分支策略选型决策表 ═══
#
# ┌──────────────┬──────────────┬──────────────┬──────────────┐
# │              │ Git Flow     │ GitHub Flow  │ Trunk-Based  │
# ├──────────────┼──────────────┼──────────────┼──────────────┤
# │ 复杂度        │ 高 ⬛⬛⬛    │ 低 ⬛        │ 低 ⬛        │
# │ 分支数        │ 5种          │ 2种          │ 1种          │
# │ 发布频率      │ 按版本       │ 每次合并     │ 每次提交     │
# │ 适合团队      │ 10-50人      │ 2-20人       │ 任意规模     │
# │ CI/CD要求     │ 低           │ 中           │ 高           │
# │ Feature Flag │ 不需要        │ 可选         │ 必须         │
# │ 多版本维护    │ ✅ 原生支持  │ ❌           │ ❌           │
# │ 持续部署      │ ❌           │ ✅           │ ✅           │
# └──────────────┴──────────────┴──────────────┴──────────────┘

# ═══ 按产品类型选择 ═══
#
# 移动 App (iOS/Android):
# → Git Flow ✅
# → 因为: App Store 审核需要版本化发布, 需要维护多个线上版本
#
# Web SaaS (B2B/B2C):
# → GitHub Flow ✅ 或 Trunk-Based ✅
# → 因为: 只有一个线上版本, 可以随时部署
#
# 开源库 / SDK:
# → Git Flow ✅
# → 因为: 需要语义化版本, 可能并行维护 v1.x 和 v2.x
#
# 微服务架构:
# → Trunk-Based ✅ (每个服务独立 repo)
# → 因为: 服务独立部署, 不需要协调版本
#
# Monorepo (大型项目):
# → Trunk-Based ✅
# → 因为: Google 和 Meta 都用 Monorepo + Trunk-Based

# ═══ 团队成熟度决策 ═══
#
# 刚开始使用 Git 的团队:
#   → GitHub Flow (最简单, 5分钟学会)
#
# 需要版本发布的成熟团队:
#   → Git Flow (严格但安全)
#
# DevOps 文化成熟的精英团队:
#   → Trunk-Based (最高效但门槛最高)
#
# 建议路径:
# GitHub Flow → Git Flow → Trunk-Based
# (随团队成熟度逐步演进)

# ═══ 混合策略也是可以的 ═══
# 实践中很多团队采用"GitHub Flow + 发布分支":
# → 日常用 GitHub Flow (main + feature branches)
# → 发布时从 main 切 release 分支
# → hotfix cherry-pick 到 release 分支
# → 兼顾了简单和版本管理`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
