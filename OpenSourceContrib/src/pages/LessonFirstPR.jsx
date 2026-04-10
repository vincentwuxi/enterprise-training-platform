import { useState } from 'react';
import './LessonCommon.css';

const CODE_FLOW = `# ━━━━ 第一个 PR 全流程 ━━━━

# ━━━━ Step 1: Fork 项目 ━━━━
# 在 GitHub 上点击 Fork → 创建你的副本

# ━━━━ Step 2: Clone 并设置上游 ━━━━
git clone https://github.com/YOUR_NAME/project.git
cd project
git remote add upstream https://github.com/ORIGINAL/project.git
# origin = 你的 Fork, upstream = 原始仓库

# ━━━━ Step 3: 创建功能分支 ━━━━
git checkout -b fix/typo-in-readme
# 分支命名规范：
# fix/xxx    → 修复 Bug
# feat/xxx   → 新功能
# docs/xxx   → 文档更新
# refactor/xxx → 重构
# test/xxx   → 添加测试

# ━━━━ Step 4: 编写代码 + 测试 ━━━━
# 1. 阅读 CONTRIBUTING.md 了解规范
# 2. 运行现有测试：npm test / cargo test
# 3. 修改代码
# 4. 添加测试（如果需要）
# 5. 运行 lint：npm run lint / cargo clippy
# 6. 确保所有测试通过

# ━━━━ Step 5: Conventional Commits ━━━━
# 提交信息格式（几乎所有大项目都要求）：
# <type>(<scope>): <subject>
#
# type:
#   feat     → 新功能
#   fix      → Bug 修复
#   docs     → 文档
#   style    → 格式（不影响逻辑）
#   refactor → 重构
#   test     → 测试
#   chore    → 构建/工具
#   perf     → 性能优化

git add .
git commit -m "fix(parser): handle edge case in URL validation

Fixes #1234

The URL parser was not handling query strings with
encoded characters. Added decoding step before validation.

Co-authored-by: Alice <alice@example.com>"

# ━━━━ Step 6: 同步上游 + Rebase ━━━━
git fetch upstream
git rebase upstream/main
# 如果有冲突：解决冲突 → git rebase --continue

# ━━━━ Step 7: Push + 创建 PR ━━━━
git push origin fix/typo-in-readme
# 在 GitHub 上创建 Pull Request`;

const CODE_REVIEW = `# ━━━━ Code Review 应对指南 ━━━━

# ━━━━ 1. PR 模板（大部分项目都有）━━━━
## 描述
修复 URL 解析器对编码字符的处理

## 变更类型
- [x] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## 关联 Issue
Fixes #1234

## 测试
- [x] 现有测试通过
- [x] 添加了新测试覆盖边界案例
- [x] 手动验证了修复效果

## Checklist
- [x] 代码遵循项目编码规范
- [x] 自我 Review 了变更
- [x] 添加了必要的注释
- [x] 更新了相关文档
- [x] 变更不引入新的 Warning

# ━━━━ 2. 收到 Review 反馈后 ━━━━
# ✅ 正确态度：
# - "谢谢反馈！我来修改。"
# - "好建议，我之前没考虑到这个场景。"
# - "我有不同看法，理由是... 你怎么看？"（礼貌讨论）

# ❌ 错误态度：
# - "这不是 Bug，是 Feature"
# - "你的建议太多了，我不想改"
# - 沉默不回复（维护者会关闭 PR）

# ━━━━ 3. 常见 Review 反馈类型 ━━━━
# nit: → 小建议，可选（但最好改）
# suggestion: → 建议修改的代码
# question: → 需要解释你的设计决策
# blocking: → 必须修改，否则不会合并

# ━━━━ 4. 修改后更新 PR ━━━━
# 不要创建新 PR！在同一分支上继续提交
git add .
git commit -m "fix: address review feedback"
git push origin fix/typo-in-readme
# PR 会自动更新

# 如果维护者要求 squash：
git rebase -i HEAD~3   # 合并最近 3 个提交
# 将 pick 改为 squash → 保存 → 编辑提交信息
git push --force-with-lease origin fix/typo-in-readme`;

export default function LessonFirstPR() {
  const [tab, setTab] = useState('flow');
  const tabs = [
    { key: 'flow',   label: '🔄 PR 全流程', code: CODE_FLOW },
    { key: 'review', label: '💬 Code Review 应对', code: CODE_REVIEW },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="os-lesson">
      <div className="os-hero">
        <div className="os-badge">// MODULE 02 · FIRST PULL REQUEST</div>
        <h1>第一个 PR</h1>
        <p>你的第一个被 Merge 的 PR 是开源之旅的"里程碑"——<strong>Fork → Branch → Conventional Commits → Rebase → PR 模板 → Code Review</strong>。遵循这个流程，你的 PR 通过率会大幅提升。</p>
      </div>

      <div className="os-section">
        <div className="os-section-title">🚀 PR 两大主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`os-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="os-code-wrap">
          <div className="os-code-head">
            <div className="os-code-dot" style={{ background: '#ef4444' }} /><div className="os-code-dot" style={{ background: '#f59e0b' }} /><div className="os-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab === 'flow' ? 'pr-workflow.sh' : 'pr-template.md'}</span>
          </div>
          <div className="os-code">{t.code}</div>
        </div>
      </div>

      <div className="os-section">
        <div className="os-section-title">7️⃣ PR 七步流程</div>
        <div className="os-steps">
          {[
            { name: 'Fork', desc: '在 GitHub 上创建项目副本', color: '#22c55e' },
            { name: 'Clone + Upstream', desc: '克隆并设置上游远程仓库', color: '#10b981' },
            { name: 'Branch', desc: '创建功能分支（fix/feat/docs）', color: '#38bdf8' },
            { name: 'Code + Test', desc: '编写代码 + 运行测试 + Lint', color: '#a855f7' },
            { name: 'Commit', desc: 'Conventional Commits 格式提交', color: '#f97316' },
            { name: 'Rebase', desc: '同步上游最新代码，解决冲突', color: '#fbbf24' },
            { name: 'PR + Review', desc: '创建 PR → 应对 Review → Merge 🎉', color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} className="os-step">
              <div className="os-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--os-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
