import './LessonCommon.css';

const CODE = `# ━━━━ 开源项目治理（Governance）━━━━

# ━━━━ 1. RFC 流程（Request for Comments）━━━━
# 大功能不能直接提 PR → 先写 RFC 讨论设计
#
# RFC 模板：
# rfcs/0001-new-routing-api.md
## Summary
一句话描述：引入 File-based Routing API

## Motivation
为什么需要这个变更？解决什么问题？

## Detailed Design
### API 设计
// pages/users/[id].tsx → /users/:id
export default function UserPage({ params }) { ... }

### 实现细节
1. 文件系统扫描 → 路由树生成
2. 动态路由匹配算法
3. 中间件注入点

## Drawbacks
- 增加了框架复杂度
- 与现有路由 API 不兼容

## Alternatives
1. 保持现有路由 → 但开发者体验差
2. 使用配置文件路由 → 但不如 File-based 直观

## Adoption Strategy
- 新项目默认使用
- 旧项目提供迁移工具
- 保留旧 API 到下一个 major 版本

# RFC 流程：
# 1. Author 提交 RFC PR
# 2. 社区评论（至少 2 周讨论期）
# 3. Core Team 投票
# 4. 通过 → 合并 RFC → 开始实现
# 5. 拒绝 → 写明原因 → 关闭 PR

# ━━━━ 2. GOVERNANCE.md 示例 ━━━━
# 项目角色：
# - Contributor：提交过 PR（任何人）
# - Triager：可以管理 Issue 和标签
# - Committer：可以直接合并 PR
# - Core Team：可以做架构决策
# - Release Manager：负责版本发布
# - BDFL / TSC：最终决策权

# 决策模型：
# - BDFL（一人决定）：Linux/Python
# - Consensus（共识制）：Rust/Node.js
# - Voting（投票制）：Apache 项目

# ━━━━ 3. Code of Conduct（行为准则）━━━━
# 几乎所有主流项目都采用 Contributor Covenant
# 核心原则：
# - 尊重所有参与者
# - 禁止骚扰、歧视、人身攻击
# - 建设性反馈 > 批评
# - 分歧时对事不对人

# ━━━━ 4. 成为 Committer 的路径 ━━━━
# 没有捷径，但有规律：
# Phase 1（1-3 月）：持续贡献 PR + 非代码贡献
# Phase 2（3-6 月）：帮忙 Review 其他人的 PR
# Phase 3（6-12 月）：参与架构讨论 + 写 RFC
# Phase 4：被邀请为 Committer / Core Team
# 
# 关键指标（非官方，但普遍认可）：
# - 10+ 个被合并的 PR
# - 5+ 个有价值的 Review
# - 积极参与 Issue Discussion
# - 在社区中帮助其他贡献者`;

export default function LessonGovernance() {
  return (
    <div className="os-lesson">
      <div className="os-hero">
        <div className="os-badge">// MODULE 06 · PROJECT GOVERNANCE</div>
        <h1>项目治理</h1>
        <p>开源不只是代码——<strong>RFC 流程决定"做什么"、Governance 决定"谁做主"、CoC 决定"怎么相处"</strong>。理解项目治理是从"贡献者"进阶为"核心成员"的必经之路。</p>
      </div>

      <div className="os-section">
        <div className="os-section-title">🏛️ 项目治理体系</div>
        <div className="os-code-wrap">
          <div className="os-code-head">
            <div className="os-code-dot" style={{ background: '#ef4444' }} /><div className="os-code-dot" style={{ background: '#f59e0b' }} /><div className="os-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>GOVERNANCE.md</span>
          </div>
          <div className="os-code">{CODE}</div>
        </div>
      </div>

      <div className="os-section">
        <div className="os-section-title">🏗️ 主流基金会治理模型</div>
        <div className="os-grid-3">
          {[
            { name: 'CNCF', model: '技术监督委员会（TOC）', projects: 'Kubernetes, Prometheus, Envoy', color: '#38bdf8' },
            { name: 'Apache', model: '精英主义（Meritocracy）', projects: 'Kafka, Spark, Flink', color: '#f97316' },
            { name: 'Linux Foundation', model: 'BDFL + 委员会', projects: 'Linux Kernel, Node.js', color: '#22c55e' },
          ].map((f, i) => (
            <div key={i} className="os-card" style={{ borderTop: `3px solid ${f.color}` }}>
              <div style={{ fontWeight: 700, color: f.color, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{f.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--os-muted)', marginBottom: '0.15rem' }}>🏛️ {f.model}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--os-muted)' }}>📦 {f.projects}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
