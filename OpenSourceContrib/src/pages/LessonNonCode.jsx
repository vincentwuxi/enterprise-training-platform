import './LessonCommon.css';

const CODE = `# ━━━━ 非代码贡献（被严重低估！）━━━━
# 非代码贡献 ≠ 二等贡献
# 很多核心维护者说："好的文档比好的代码更稀缺"

# ━━━━ 1. 文档贡献 ━━━━
# 文档是项目的"门面"，直接影响用户量

# 贡献类型：
# - 修错别字 / 语法错误（最简单的起步）
# - 补充 API 文档（缺失的参数说明）
# - 添加使用示例（最受欢迎！）
# - 改进新手教程（Getting Started）
# - 添加架构文档（帮助新贡献者理解代码）

# 工具：
# - 大部分项目用 Markdown（GitHub 直接编辑）
# - 文档站：Docusaurus / VitePress / Nextra
# - API 文档：TypeDoc / rustdoc / Sphinx

# ━━━━ 2. 翻译贡献 ━━━━
# 国际化（i18n）是开源项目扩大影响力的关键

# 翻译平台：
# - Crowdin（最常用，React/Next.js/Vue 都用）
# - Transifex
# - Weblate（开源方案）
# - 直接提交翻译文件的 PR

# 翻译原则：
# ✅ 保持技术术语的英文（不翻译 API, Hook, State）
# ✅ 保持代码示例不翻译
# ✅ 使用地道的中文表达（不是机翻）
# ✅ 保持与英文版本同步更新

# ━━━━ 3. Issue Triage（问题分类）━━━━
# 很多项目 Issue 堆积如山 → Triage 是巨大价值

# Triage 流程：
# 1. 阅读 Issue → 判断类型（Bug/Feature/Question）
# 2. 尝试复现 Bug → 补充复现步骤
# 3. 标记标签 → bug / enhancement / duplicate / wontfix
# 4. 关联相关 Issue / PR
# 5. 如果是简单问题 → 直接回答
# 6. 如果是重复问题 → 标记 duplicate + 链接原 Issue

# 价值：维护者最感激的贡献之一
# 因为他们的时间都花在 Code Review 上，没空 Triage

# ━━━━ 4. 社区支持 ━━━━
# 在 Discord/GitHub Discussions 中帮助其他用户

# 技巧：
# - 回答新人的安装/配置问题
# - 分享你的使用经验和最佳实践
# - 帮助 Bug 报告者提供最小复现示例
# - 在 Stack Overflow 回答项目相关问题

# ━━━━ 5. 设计贡献 ━━━━
# - Logo / 品牌设计
# - 官网 UI/UX 改进
# - 文档站主题优化
# - 演示视频 / GIF 制作

# ━━━━ 非代码贡献的简历价值 ━━━━
# "我是 Next.js 文档的中文翻译贡献者"
# → 证明你深度理解了 Next.js
# "我帮 FastAPI 做了 200+ Issue Triage"
# → 证明你的问题分析能力和社区责任感`;

export default function LessonNonCode() {
  return (
    <div className="os-lesson">
      <div className="os-hero">
        <div className="os-badge">// MODULE 03 · NON-CODE CONTRIBUTIONS</div>
        <h1>非代码贡献</h1>
        <p>开源贡献不只是写代码——<strong>文档、翻译、Issue Triage、社区支持同样有巨大价值</strong>。很多核心维护者亲口说："好的文档比好的代码更稀缺，帮忙 Triage Issue 是最感激的贡献。"</p>
      </div>

      <div className="os-section">
        <div className="os-section-title">📝 非代码贡献全景</div>
        <div className="os-code-wrap">
          <div className="os-code-head">
            <div className="os-code-dot" style={{ background: '#ef4444' }} /><div className="os-code-dot" style={{ background: '#f59e0b' }} /><div className="os-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>non-code.md</span>
          </div>
          <div className="os-code">{CODE}</div>
        </div>
      </div>

      <div className="os-section">
        <div className="os-section-title">🎯 五大非代码贡献方向</div>
        <div className="os-grid-3">
          {[
            { icon: '📖', name: '文档', diff: '⭐ 最容易起步', value: '门面价值最高', color: '#22c55e' },
            { icon: '🌍', name: '翻译', diff: '⭐ 中文母语优势', value: '帮项目触达中国市场', color: '#38bdf8' },
            { icon: '🏷️', name: 'Issue Triage', diff: '⭐⭐ 中等难度', value: '维护者最感激', color: '#f97316' },
            { icon: '💬', name: '社区支持', diff: '⭐ 随时随地', value: '建立技术影响力', color: '#a855f7' },
            { icon: '🎨', name: '设计', diff: '⭐⭐ 需要设计能力', value: 'Logo/官网/视频', color: '#fbbf24' },
          ].map((c, i) => (
            <div key={i} className="os-card" style={{ borderTop: `3px solid ${c.color}`, padding: '0.9rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.88rem', marginBottom: '0.35rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--os-muted)', marginBottom: '0.15rem' }}>难度：{c.diff}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--os-muted)' }}>价值：{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
