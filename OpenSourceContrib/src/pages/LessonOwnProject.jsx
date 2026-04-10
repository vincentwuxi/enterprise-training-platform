import './LessonCommon.css';

const CODE = `# ━━━━ 自建开源项目 ━━━━

# ━━━━ 1. README.md（项目的"门面"）━━━━
# 好的 README 结构：

# 🚀 ProjectName
> 一句话描述：解决什么问题

[![CI](badge-url)](actions-url)
[![npm](badge-url)](npm-url)
[![License](badge-url)](license-url)

## ✨ Features
- Feature 1：xxx
- Feature 2：xxx
- Feature 3：xxx

## 📦 Installation
\`\`\`bash
npm install project-name
# or
pnpm add project-name
\`\`\`

## 🚀 Quick Start
\`\`\`typescript
import { something } from 'project-name';
// 最小可运行示例（< 10 行）
\`\`\`

## 📖 Documentation
[Full Documentation →](https://docs.example.com)

## 🤝 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License
MIT © [Your Name](https://github.com/yourname)

# ━━━━ 2. LICENSE 选择 ━━━━
# MIT：最宽松（推荐大部分项目）
# Apache 2.0：有专利保护（推荐企业项目）
# GPL 3.0：传染性（使用者必须也开源）
# BSD：类似 MIT，更简洁
# MPL 2.0：文件级 Copyleft（折中方案）
# AGPL 3.0：最严格（SaaS 也必须开源）

# ━━━━ 3. CONTRIBUTING.md 模板 ━━━━
# # Contributing to ProjectName
# ## Development Setup
# 1. Fork the repository
# 2. Clone: git clone ...
# 3. Install: pnpm install
# 4. Test: pnpm test
#
# ## Pull Request Process
# 1. Create a feature branch from main
# 2. Follow Conventional Commits
# 3. Ensure all tests pass
# 4. Update documentation if needed
# 5. Submit PR and fill in the template
#
# ## Code Style
# - ESLint + Prettier (auto-formatted)
# - TypeScript strict mode
# - Test coverage > 80%

# ━━━━ 4. 版本发布策略 ━━━━
# Semantic Versioning（语义化版本）：
# MAJOR.MINOR.PATCH
# 1.0.0 → 1.0.1（Bug fix）
# 1.0.0 → 1.1.0（New feature, backward compatible）
# 1.0.0 → 2.0.0（Breaking change）

# 发布流程：
# 1. Changesets 收集变更说明
# 2. CI 自动创建 Release PR
# 3. 合并 → 自动发布到 npm
# 4. 自动生成 GitHub Release + CHANGELOG

# ━━━━ 5. 社区运营 ━━━━
# 早期（0-100 star）：
# - 在 Twitter/X + Reddit + HackerNews 发布
# - 写博客介绍项目的设计决策
# - 在相关 Discord 频道分享
#
# 成长期（100-1000 star）：
# - 创建 Discord 社区
# - 设置 Good First Issue 标签
# - 定期发 Release Notes / Newsletter
# - 参加/组织 Meetup
#
# 成熟期（1000+ star）：
# - 申请加入 CNCF / OpenJS 等基金会
# - 建立 Core Team + Governance
# - 寻找商业赞助 / Open Collective`;

export default function LessonOwnProject() {
  return (
    <div className="os-lesson">
      <div className="os-hero">
        <div className="os-badge">// MODULE 07 · OWN PROJECT</div>
        <h1>自建开源项目</h1>
        <p>从"贡献者"到"创建者"是质的飞跃——<strong>一个好的 README 是项目的"销售页"、LICENSE 决定法律保护、CONTRIBUTING.md 决定社区门槛</strong>。社区运营能力决定项目能不能从 0 到 1000 star。</p>
      </div>

      <div className="os-section">
        <div className="os-section-title">📦 自建项目全指南</div>
        <div className="os-code-wrap">
          <div className="os-code-head">
            <div className="os-code-dot" style={{ background: '#ef4444' }} /><div className="os-code-dot" style={{ background: '#f59e0b' }} /><div className="os-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>README.md</span>
          </div>
          <div className="os-code">{CODE}</div>
        </div>
      </div>

      <div className="os-section">
        <div className="os-section-title">📄 开源许可证选型</div>
        <div className="os-grid-3">
          {[
            { lic: 'MIT', freedom: '最宽松', req: '保留版权声明即可', use: '大部分个人项目', color: '#22c55e' },
            { lic: 'Apache 2.0', freedom: '宽松 + 专利', req: '声明变更 + 保留许可', use: '企业级项目', color: '#38bdf8' },
            { lic: 'GPL 3.0', freedom: '传染性', req: '衍生作品必须开源', use: 'Linux/WordPress', color: '#f97316' },
            { lic: 'MPL 2.0', freedom: '文件级 Copyleft', req: '修改的文件必须开源', use: 'Firefox/Rust', color: '#a855f7' },
            { lic: 'BSL 1.1', freedom: '延迟开源', req: 'N 年后变为开源', use: 'HashiCorp 系列', color: '#fbbf24' },
            { lic: 'AGPL 3.0', freedom: '最严格', req: 'SaaS 也必须开源', use: 'MongoDB/Grafana', color: '#ef4444' },
          ].map((l, i) => (
            <div key={i} className="os-card" style={{ borderLeft: `3px solid ${l.color}`, padding: '0.85rem' }}>
              <span className="os-tag green" style={{ marginBottom: '0.3rem', display: 'inline-block' }}>{l.lic}</span>
              <div style={{ fontSize: '0.82rem', color: 'var(--os-muted)', marginBottom: '0.15rem' }}>🔓 {l.freedom}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--os-muted)', marginBottom: '0.15rem' }}>📋 {l.req}</div>
              <div style={{ fontSize: '0.78rem', color: l.color }}>📦 {l.use}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
