import './LessonCommon.css';

const CODE = `# ━━━━ 找到你的第一个开源项目 ━━━━

# ━━━━ 1. Good First Issue：入门最佳起点 ━━━━
# GitHub 搜索技巧：
# https://github.com/search?q=label%3A%22good+first+issue%22+language%3ATypeScript+is%3Aopen
#
# 推荐搜索组合：
# label:"good first issue" language:TypeScript is:open
# label:"help wanted" language:Python stars:>1000
# label:"beginner-friendly" language:Rust is:open

# 推荐平台：
# - https://goodfirstissue.dev （按语言分类）
# - https://up-for-grabs.net （按标签分类）
# - https://www.codetriage.com （邮件推送）
# - https://github.com/firstcontributions/first-contributions

# ━━━━ 2. 如何评估一个项目是否值得贡献 ━━━━
# ✅ 活跃度检查（最重要！）：
# - 最近一次提交 < 2 周
# - Issue 回复时间 < 3 天
# - PR 合并时间 < 2 周
# - Contributor 数量 > 20

# ✅ 社区文化检查：
# - CONTRIBUTING.md 是否清晰？
# - Code of Conduct 是否存在？
# - Issue/PR 中维护者是否友善？
# - 是否有 Discord/Slack 社区？
# - 新人 PR 是否被认真 Review？

# ❌ 避免的项目：
# - 最近提交 > 6 个月（可能已废弃）
# - PR 堆积 > 50 个未处理
# - Issue 中维护者态度冷漠/攻击性
# - 没有 CONTRIBUTING.md
# - 单人维护的个人项目（bus factor = 1）

# ━━━━ 3. 项目架构快速阅读法 ━━━━
# 第一步：README.md → 了解项目做什么
# 第二步：CONTRIBUTING.md → 了解开发规范
# 第三步：目录结构 → 理解代码组织
# 第四步：package.json / Cargo.toml → 看依赖
# 第五步：找到入口文件（main.ts / lib.rs）
# 第六步：git log --oneline -20 → 看最近改了什么
# 第七步：CI 配置（.github/workflows/）→ 看测试要求

# ━━━━ 4. 推荐的入门级贡献方向 ━━━━
# （按难度递增排列）
# Level 0: 修错别字 / 修文档 / 补注释
# Level 1: 修简单 Bug（有明确复现步骤）
# Level 2: 补测试用例（增加覆盖率）
# Level 3: 实现小功能（有 RFC/Design Doc）
# Level 4: 重构代码（需要理解架构）
# Level 5: 设计并实现新功能（需要 RFC）`;

export default function LessonFindProject() {
  return (
    <div className="os-lesson">
      <div className="os-hero">
        <div className="os-badge">// MODULE 01 · FIND YOUR PROJECT</div>
        <h1>找到你的项目</h1>
        <p>开源贡献的第一步不是写代码——<strong>是找到一个活跃的、社区友善的、有 Good First Issue 的项目</strong>。选错项目会让你的 PR 无人理睬，选对项目会让你在第一周就获得 Merge。</p>
      </div>

      <div className="os-section">
        <div className="os-section-title">🔍 找项目全攻略</div>
        <div className="os-code-wrap">
          <div className="os-code-head">
            <div className="os-code-dot" style={{ background: '#ef4444' }} /><div className="os-code-dot" style={{ background: '#f59e0b' }} /><div className="os-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>find-project.md</span>
          </div>
          <div className="os-code">{CODE}</div>
        </div>
      </div>

      <div className="os-section">
        <div className="os-section-title">🌟 推荐入门项目（按语言）</div>
        <div className="os-grid-3">
          {[
            { lang: 'TypeScript', projects: ['shadcn/ui', 'tRPC', 'Turborepo', 'Cal.com'], color: '#38bdf8' },
            { lang: 'Python', projects: ['FastAPI', 'Pydantic', 'Ruff', 'Streamlit'], color: '#fbbf24' },
            { lang: 'Rust', projects: ['Tokio', 'Axum', 'Tauri', 'Nushell'], color: '#f97316' },
            { lang: 'Go', projects: ['Hugo', 'Cobra', 'K9s', 'Traefik'], color: '#22c55e' },
            { lang: 'React', projects: ['Next.js', 'Remix', 'Radix UI', 'React Aria'], color: '#a855f7' },
            { lang: '文档/翻译', projects: ['MDN Web Docs', 'Kubernetes Docs', 'Rust Book 翻译'], color: 'var(--os-muted)' },
          ].map((l, i) => (
            <div key={i} className="os-card" style={{ borderTop: `3px solid ${l.color}` }}>
              <div style={{ fontWeight: 700, color: l.color, fontSize: '0.88rem', marginBottom: '0.45rem' }}>{l.lang}</div>
              {l.projects.map((p, j) => (
                <div key={j} style={{ fontSize: '0.82rem', color: 'var(--os-muted)', marginBottom: '0.2rem' }}>→ {p}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
