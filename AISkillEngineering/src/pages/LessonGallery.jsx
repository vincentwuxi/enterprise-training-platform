import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, ExternalLink, Filter } from 'lucide-react';
import './LessonCommon.css';

const SKILLS = [
  {
    name: 'using-superpowers', type: 'Discipline', category: '元技能',
    desc: '对话开始前调用"所有相关 Skill"的元协议',
    trigger: '开始任何对话时',
    designPhilosophy: '用 EXTREMELY-IMPORTANT 标签和流程图强制执行"先调用 Skill"的习惯，包含完整的合理化借口清单',
    keyPattern: 'Invoke relevant skills BEFORE any response or action — even a 1% chance means invoke',
    color: 'violet',
  },
  {
    name: 'brainstorming', type: 'Pattern', category: '设计工作流',
    desc: '将想法转化为设计规格书的协作对话流程',
    trigger: '任何创意工作或构建功能之前',
    designPhilosophy: '用 HARD-GATE 标签强制禁止在设计批准前执行任何代码，用 dot 流程图清晰展示从探索到实现的完整路径',
    keyPattern: 'Do NOT write code until design is presented and user approves — EVERY project, regardless of perceived simplicity',
    color: 'blue',
  },
  {
    name: 'writing-plans', type: 'Technique', category: '设计工作流',
    desc: '为多步骤任务编写原子化、无占位符的实施计划',
    trigger: '有 spec 或需求，执行之前',
    designPhilosophy: '"No Placeholders" 原则：每一步都必须包含工程师实际需要的内容。计划=bite-sized tasks，每步 2-5 分钟',
    keyPattern: 'Every step contains actual content (code, commands, expected output) — never "TBD" or "Add appropriate handling"',
    color: 'blue',
  },
  {
    name: 'executing-plans', type: 'Technique', category: '执行工作流',
    desc: '在独立会话中按计划执行任务并在关键点停止',
    trigger: '有写好的实施计划需要执行时',
    designPhilosophy: '偏好 subagent-driven-development，遇到 Blocker 立即停止请求帮助，不猜测解决方案',
    keyPattern: 'Stop immediately when blocked — ask, don\'t guess',
    color: 'green',
  },
  {
    name: 'subagent-driven-development', type: 'Technique', category: '执行工作流',
    desc: '每个任务派发一个新 subagent，并在任务间执行代码审查',
    trigger: '执行有独立任务的实施计划时',
    designPhilosophy: '新鲜 subagent 保持聚焦，不被积累的上下文污染。每个任务后两阶段 review：spec 合规 + 代码质量',
    keyPattern: 'Fresh subagent per task + two-stage review = clean context + consistent quality',
    color: 'green',
  },
  {
    name: 'dispatching-parallel-agents', type: 'Pattern', category: '执行工作流',
    desc: '将独立问题并行分发给多个 Agent 同时处理',
    trigger: '面对 2+ 个独立的、无共享状态的任务时',
    designPhilosophy: '用 dot 流程图帮助判断是否应该并行，精确构建 agent prompt（聚焦、自包含、有明确输出要求）',
    keyPattern: 'One agent per independent domain — focused scope, isolated context, concurrent execution',
    color: 'green',
  },
  {
    name: 'test-driven-development', type: 'Discipline', category: '工程纪律',
    desc: '实现任何功能或 Bug Fix 前，必须先写失败的测试',
    trigger: '实现任何功能或 Bug Fix 之前',
    designPhilosophy: 'Iron Law + Iron Law 的所有例外清晰列举的"No Exceptions"清单 + 完整的合理化借口反驳表。是最精密的 Discipline Skill 样本',
    keyPattern: 'Write test → Watch it fail → Write minimal code → Watch it pass → Refactor. DELETE code written without test first.',
    color: 'red',
  },
  {
    name: 'systematic-debugging', type: 'Technique', category: '工程纪律',
    desc: '遇到任何 Bug、测试失败或异常行为时，在提出修复前先找根因',
    trigger: '遇到任何 Bug 或异常行为时',
    designPhilosophy: '4 个清晰阶段（根因调查 → 模式分析 → 假设检验 → 实现）+ 3 次修复失败后强制讨论架构的规则',
    keyPattern: 'If ≥ 3 fixes failed → Stop and question architecture, not attempt fix #4',
    color: 'orange',
  },
  {
    name: 'verification-before-completion', type: 'Discipline', category: '工程纪律',
    desc: '声称工作完成或提交前，必须先运行验证命令并确认输出',
    trigger: '即将声称工作完成、修复或提交前',
    designPhilosophy: 'The Gate Function：5 步验证流程，Red Flags 清单，对每种"完成声明"的验证表格',
    keyPattern: 'Identify what command proves the claim → Run it → Read full output → THEN claim',
    color: 'red',
  },
  {
    name: 'requesting-code-review', type: 'Technique', category: '协作工作流',
    desc: '完成任务或重要功能后，提交前进行代码审查',
    trigger: '完成任务、实现重要功能或合并前',
    designPhilosophy: '向专用 subagent 派发代码审查，传入精确构建的上下文（不是自己的对话历史），确保 reviewer 聚焦于工作产物',
    keyPattern: 'Reviewer gets precisely crafted context — never your session\'s history',
    color: 'blue',
  },
  {
    name: 'receiving-code-review', type: 'Technique', category: '协作工作流',
    desc: '作为被审查方，处理代码审查反馈',
    trigger: '收到代码审查反馈时',
    designPhilosophy: '将反馈分为 Critical/Important/Minor，指导如何不卑不亢地推回错误评审意见',
    keyPattern: 'Fix Critical immediately, fix Important before proceeding, push back invalid feedback with evidence',
    color: 'blue',
  },
  {
    name: 'finishing-a-development-branch', type: 'Technique', category: '协作工作流',
    desc: '实现完成后，确定如何整合工作（合并、PR 或保留分支）',
    trigger: '实现完成、所有测试通过，需要决定如何整合时',
    designPhilosophy: '结构化 4 选项（本地合并/Push+PR/保留/丢弃），只有 Option 4 需要输入"discard"确认，防止误操作',
    keyPattern: 'Verify tests → Present exactly 4 options → Execute choice → Cleanup worktree',
    color: 'green',
  },
  {
    name: 'using-git-worktrees', type: 'Reference', category: '工具技能',
    desc: '需要隔离工作空间或执行实施计划前，创建 Git Worktree',
    trigger: '开始需要隔离的功能开发或执行实施计划前',
    designPhilosophy: '详细的目录优先级选择流程 + 安全验证（.gitignore 检查防止提交 worktree 内容）+ 清晰的依赖图',
    keyPattern: 'Priority: existing dir > CLAUDE.md > ask user. Always verify directory is gitignored.',
    color: 'yellow',
  },
  {
    name: 'writing-skills', type: 'Technique', category: '元技能',
    desc: '创建新 Skill、编辑现有 Skill 或在部署前验证 Skill',
    trigger: '创建、编辑或验证 Skill 时',
    designPhilosophy: '这个课程整门课都在讲这个 Skill！TDD 映射表 + CSO 章节 + 铁律铁律 + 反模式清单 + Token 效率控制',
    keyPattern: 'Writing skills IS TDD for process documentation. Same Iron Law. Same cycle.',
    color: 'violet',
  },
];

const COLORS = {
  violet: 'border-violet-500/30 bg-violet-900/10',
  blue: 'border-blue-500/30 bg-blue-900/10',
  green: 'border-emerald-500/30 bg-emerald-900/10',
  red: 'border-red-500/30 bg-red-900/10',
  orange: 'border-orange-500/30 bg-orange-900/10',
  yellow: 'border-yellow-500/30 bg-yellow-900/10',
};
const TYPE_COLORS = { Discipline: 'bg-red-900/30 text-red-300 border-red-500/30', Pattern: 'bg-blue-900/30 text-blue-300 border-blue-500/30', Technique: 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30', Reference: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' };
const CATEGORIES = ['全部', '元技能', '设计工作流', '执行工作流', '工程纪律', '协作工作流', '工具技能'];

export default function LessonGallery() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('全部');
  const [activeSkill, setActiveSkill] = useState(null);

  const filtered = filter === '全部' ? SKILLS : SKILLS.filter(s => s.category === filter);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🗂️ 模块四：官方案例篇</div>
        <h1>14 个官方 Skill 全景解析</h1>
        <p className="lesson-intro">
          Anthropic 官方提供了 14 个高质量 Skill 作为参考标准。通过逐一分析它们的设计哲学和 Key Pattern，你能提炼出写好任何 Skill 的通用原则。
        </p>
      </header>

      {/* Category Filter */}
      <section className="lesson-section">
        <div className="flex gap-2 flex-wrap mb-5">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setFilter(cat); setActiveSkill(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${filter === cat ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {cat} {cat === '全部' ? `(${SKILLS.length})` : `(${SKILLS.filter(s=>s.category===cat).length})`}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((skill, i) => (
            <div key={skill.name} onClick={() => setActiveSkill(activeSkill === i ? null : i)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${COLORS[skill.color]} ${activeSkill === i ? 'ring-1 ring-violet-500' : 'hover:opacity-90'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <code className="text-sm font-bold text-white block mb-1">{skill.name}</code>
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-bold ${TYPE_COLORS[skill.type]}`}>{skill.type}</span>
                  <span className="text-xs text-gray-600 ml-2">{skill.category}</span>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">{skill.desc}</p>
              <p className="text-xs text-gray-500">触发条件：{skill.trigger}</p>

              {activeSkill === i && (
                <div className="mt-4 space-y-3 border-t border-white/10 pt-3 fade-in">
                  <div>
                    <p className="text-xs font-bold text-violet-300 mb-1">🎨 设计哲学</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{skill.designPhilosophy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300 mb-1">🔑 核心 Pattern（原文）</p>
                    <code className="text-xs text-emerald-200 block bg-black/40 p-2 rounded-lg">{skill.keyPattern}</code>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Design Principles Summary */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">💎 从 14 个官方 Skill 中提炼的 6 大设计原则</h3>
        <div className="space-y-3">
          {[
            { n: '1', title: '铁律优先', desc: '所有 Discipline Skill 都有一个大写、用代码块包裹的 NO xxx WITHOUT xxx FIRST 铁律，醒目不可忽视' },
            { n: '2', title: '流程图 > 文字描述', desc: '复杂的决策流程（如 brainstorming 的 9 步工作流）用 dot 语言流程图表达，而非用段落描述' },
            { n: '3', title: '反驳表必不可少', desc: '每个 Discipline Skill 都有 | Excuse | Reality | 对照表，预先堵死 Agent 的合理化借口' },
            { n: '4', title: 'Description 只写触发条件', desc: '绝不在 description 里写工作流摘要，否则 Agent 会把 description 当捷径跳过正文' },
            { n: '5', title: 'Token 效率', desc: 'getting-started 类 Skill < 150 词，高频加载 Skill < 200 词，其他 < 500 词。引用而不重复。' },
            { n: '6', title: '一个绝佳例子胜过多个平庸例子', desc: '每个 Skill 只选最有代表性的代码示例，用注释解释"为什么"而非"是什么"' },
          ].map(p => (
            <div key={p.n} className="flex gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
              <span className="bg-violet-700 text-white font-black w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0">{p.n}</span>
              <div>
                <h4 className="font-bold text-white text-sm mb-0.5">{p.title}</h4>
                <p className="text-xs text-gray-400">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skill-engineering/lesson/workshop')}>
          全景看完！动手写一个企业级 Skill →
        </button>
      </section>
    </div>
  );
}
