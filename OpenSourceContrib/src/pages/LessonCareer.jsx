import './LessonCommon.css';

const CODE = `# ━━━━ 开源贡献的职业变现 ━━━━

# ━━━━ 1. 开源简历的写法 ━━━━
# 开源经验 > 学历 > 刷题（对有经验的工程师）

# 简历示例（开源部分）：
## Open Source Contributions
### Next.js (vercel/next.js) — Contributor
- Implemented file-based routing optimization (#12345)
  → Reduced route resolution time by 40%
- Fixed 3 critical SSR hydration bugs (#12346, #12347, #12348)
- Authored RFC for streaming SSR API (rfcs/0042)
- 15 merged PRs, 30+ Code Reviews

### shadcn/ui — Core Contributor
- Designed and implemented DatePicker component
- Improved accessibility: screen reader support for all components
- 2,500+ GitHub stars from contributed components

# 关键技巧：
# ✅ 量化影响（"reduced by 40%"、"15 merged PRs"）
# ✅ 链接到实际 PR/RFC
# ✅ 说明你的角色（Author/Reviewer/Maintainer）
# ❌ 不要只写 "contributed to Next.js"

# ━━━━ 2. 技术影响力建设 ━━━━
# 开源贡献 → 博客/演讲 → 技术影响力 → 职业机会
#
# 路径：
# 1. GitHub Profile 精心维护
#    → 钉置代表项目、完善 Bio、活跃贡献图
# 2. 技术博客
#    → 写你在开源中遇到的问题和解决方案
#    → "我如何为 Next.js 修复了一个 SSR Bug"
# 3. 技术演讲
#    → 本地 Meetup → 线上分享 → 大型会议
# 4. Twitter/X 技术账号
#    → 分享开源心得、与维护者互动
# 5. YouTube/B站 技术频道
#    → 录制开源贡献过程（Pair Programming）

# ━━━━ 3. 开源的商业模式 ━━━━
# ┌──────────────────┬───────────────────────────┐
# │ 模式             │ 代表项目                  │
# ├──────────────────┼───────────────────────────┤
# │ Open Core        │ GitLab/Supabase           │
# │ SaaS             │ Vercel(Next.js)/MongoDB    │
# │ Support/Training │ Red Hat/Canonical          │
# │ Dual License     │ MySQL/Qt                  │
# │ 赞助/捐赠        │ Vue.js/Babel              │
# │ 云服务           │ AWS(Elasticsearch)/CF     │
# │ Marketplace      │ WordPress Plugins         │
# └──────────────────┴───────────────────────────┘

# ━━━━ 4. 全职开源的现实 ━━━━
# 途径 1：加入开源公司
# → Vercel(Next.js), Cloudflare, Supabase, PlanetScale
# → 面试时你的开源贡献就是最好的"面试答案"

# 途径 2：GitHub Sponsors / Open Collective
# → 个人维护者通过赞助获得收入
# → 前提：项目有足够多的用户

# 途径 3：开源创业
# → 开源项目 → 商业版/云服务 → 融资
# → Supabase、Neon、Turso 都是这条路

# 途径 4：DevRel（开发者关系）
# → 技术布道 + 社区运营 + 内容创作
# → 需要：开源经验 + 表达能力 + 社区影响力`;

export default function LessonCareer() {
  return (
    <div className="os-lesson">
      <div className="os-hero">
        <div className="os-badge">// MODULE 08 · CAREER MONETIZATION</div>
        <h1>职业变现</h1>
        <p>开源不是"免费劳动"——<strong>它是最有说服力的简历、最有效的技术影响力建设工具、甚至可以成为全职职业</strong>。"我有 15 个 Merged PR 在 Next.js"比"我精通 React"有力 100 倍。</p>
      </div>

      <div className="os-section">
        <div className="os-section-title">💼 职业变现策略</div>
        <div className="os-code-wrap">
          <div className="os-code-head">
            <div className="os-code-dot" style={{ background: '#ef4444' }} /><div className="os-code-dot" style={{ background: '#f59e0b' }} /><div className="os-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>career.md</span>
          </div>
          <div className="os-code">{CODE}</div>
        </div>
      </div>

      <div className="os-section">
        <div className="os-section-title">🏁 开源贡献全链路回顾</div>
        <div className="os-steps">
          {[
            { step: '1', name: '找到项目', desc: 'Good First Issue + 社区评估 + 架构阅读', color: '#22c55e' },
            { step: '2', name: '第一个 PR', desc: 'Fork→Branch→Commit→Rebase→PR→Review', color: '#10b981' },
            { step: '3', name: '非代码贡献', desc: '文档/翻译/Issue Triage/社区支持', color: '#38bdf8' },
            { step: '4', name: 'Git 高级', desc: 'Rebase/Cherry-pick/Bisect/Worktree', color: '#a855f7' },
            { step: '5', name: 'CI/CD 贡献', desc: 'Actions/缓存/Lint/Release 自动化', color: '#f97316' },
            { step: '6', name: '项目治理', desc: 'RFC 流程/Governance/CoC 理解', color: '#fbbf24' },
            { step: '7', name: '自建项目', desc: 'README/LICENSE/CONTRIBUTING/社区运营', color: '#22c55e' },
            { step: '8', name: '职业变现', desc: '开源简历/技术影响力/商业模式/全职开源', color: '#f97316' },
          ].map((s, i) => (
            <div key={i} className="os-step">
              <div className="os-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--os-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="os-tip">💡 <strong>极强差异化</strong>：市面上没有任何培训课程教"如何做开源贡献"。这门课的每一个毕业生都会带着真实的 Merged PR 走出去——这比任何证书都有说服力。</div>
      </div>
    </div>
  );
}
