import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import './LessonCommon.css';

const COMPARISONS = [
  {
    label: 'Prompt vs Skill',
    left: { title: '❌ 普通 Prompt', color: 'red', items: ['一次性的，特定于当前任务', '存在于对话框里，对话结束即消亡', '告诉 AI"这次要做什么"', '不可测试，不可复用', '无法被其他团队成员共享'] },
    right: { title: '✅ AI Skill', color: 'emerald', items: ['可复用的参考指南，跨项目生效', '存在于文件系统，版本控制管理', '教会 AI "遇到这类问题时如何思考"', '可测试：用压力场景验证 Agent 是否合规', '团队可共享，社区可贡献'] },
  },
  {
    label: 'Skill vs CLAUDE.md',
    left: { title: '📌 CLAUDE.md', color: 'yellow', items: ['项目特定配置', '约定：命名规范、代码风格', '仅在本项目内有效', '描述项目约束和规则', '是项目的"房规"'] },
    right: { title: '🔧 AI Skill', color: 'violet', items: ['跨项目通用技术', '可迁移的技巧、模式与方法论', '在任何项目中可调用', '描述解决通用问题的方式', '是 Agent 的"技能书"'] },
  },
];

const SKILL_TYPES = [
  { type: 'Technique（技法）', icon: '🔧', desc: '有明确步骤可遵循的具体方法', example: 'systematic-debugging（系统性调试 4 步法）', color: 'violet' },
  { type: 'Pattern（心智模型）', icon: '🧠', desc: '思考问题的通用框架', example: 'brainstorming（需求 → 设计 → 实现的决策流程）', color: 'blue' },
  { type: 'Reference（参考手册）', icon: '📖', desc: 'API 文档、语法指南、工具手册', example: '企业内部系统 API 文档 Skill', color: 'emerald' },
  { type: 'Discipline（纪律规则）', icon: '⚖️', desc: '执行纪律：在压力下必须遵守的铁律', example: 'test-driven-development（无测试不写代码）', color: 'orange' },
];

const WHEN_TO_CREATE = [
  { icon: '✅', text: '技巧对你来说不是显而易见的（你曾踩过坑）', good: true },
  { icon: '✅', text: '你会在多个项目中反复用到这个方法', good: true },
  { icon: '✅', text: '这个模式具有普遍性，其他人也会受益', good: true },
  { icon: '✅', text: '你发现 Agent 在某类场景下会犯错误', good: true },
  { icon: '❌', text: '一次性解决方案（只适用于这一个任务）', good: false },
  { icon: '❌', text: '项目特定约定（应放在 CLAUDE.md）', good: false },
  { icon: '❌', text: '可以用脚本/正则表达式自动验证的规则（自动化它）', good: false },
  { icon: '❌', text: '知名框架已有完善文档的标准实践', good: false },
];

export default function LessonOverview() {
  const navigate = useNavigate();
  const [activeComparison, setActiveComparison] = useState(0);
  const [revealedType, setRevealedType] = useState(null);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🤖 模块一：认知重塑篇</div>
        <h1>重新定义 AI Skill</h1>
        <p className="lesson-intro">
          大多数人认为"给 AI 写个提示词"就是 Skill——这是最常见的认知误区。<strong style={{color:'#c4b5fd'}}>AI Skill 本质上是工程级的过程文档</strong>，是让 AI Agent 在遇到特定类型问题时"调取"并遵循的可复用参考指南。
        </p>
      </header>

      {/* Core Definition */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">🧬 Skill 的官方定义（来自 Anthropic writing-skills）</h3>
        <blockquote className="border-l-4 border-violet-500 pl-5 py-2 bg-violet-900/10 rounded-r-xl">
          <p className="text-lg text-white leading-relaxed italic">
            "A skill is a reference guide for proven techniques, patterns, or tools. Skills help future Claude instances find and apply effective approaches."
          </p>
          <footer className="text-xs text-gray-500 mt-2">— Anthropic writing-skills/SKILL.md</footer>
        </blockquote>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-300 font-bold text-sm mb-2">✅ Skills 是：</p>
            <ul className="text-sm text-gray-300 space-y-1">
              {['可复用的技巧与模式', '可迁移的工具使用参考', '供未来 Agent 实例查找并应用的指南', '类似 TDD 的文档工程'].map(t => <li key={t} className="flex items-center gap-2"><span className="text-emerald-400">•</span>{t}</li>)}
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-300 font-bold text-sm mb-2">❌ Skills 不是：</p>
            <ul className="text-sm text-gray-300 space-y-1">
              {['你某次解决问题的叙述性日记', '项目特定的配置规则', '标准实践的简单重复', '一成不变的纪律说明'].map(t => <li key={t} className="flex items-center gap-2"><span className="text-red-400">•</span>{t}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🔬 概念对比：彻底理清边界</h3>
        <div className="flex gap-2 mb-5">
          {COMPARISONS.map((c, i) => (
            <button key={i} onClick={() => setActiveComparison(i)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${activeComparison === i ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[COMPARISONS[activeComparison].left, COMPARISONS[activeComparison].right].map((side, i) => {
            const colors = { red: 'border-red-500/30 bg-red-900/10', emerald: 'border-emerald-500/30 bg-emerald-900/10', yellow: 'border-yellow-500/30 bg-yellow-900/10', violet: 'border-violet-500/30 bg-violet-900/10' };
            const textColors = { red: 'text-red-300', emerald: 'text-emerald-300', yellow: 'text-yellow-300', violet: 'text-violet-300' };
            return (
              <div key={i} className={`p-5 rounded-xl border ${colors[side.color]}`}>
                <h4 className={`font-bold mb-3 ${textColors[side.color]}`}>{side.title}</h4>
                <ul className="space-y-2">
                  {side.items.map(item => <li key={item} className="text-sm text-gray-300 flex items-start gap-2"><span>•</span>{item}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Skill Types */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🗂️ 4 种 Skill 类型（点击展开官方说明）</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {SKILL_TYPES.map((s, i) => {
            const colors = { violet: 'border-violet-500/30 bg-violet-900/10', blue: 'border-blue-500/30 bg-blue-900/10', emerald: 'border-emerald-500/30 bg-emerald-900/10', orange: 'border-orange-500/30 bg-orange-900/10' };
            return (
              <div key={i} className={`p-4 rounded-xl border cursor-pointer transition-all ${colors[s.color]} ${revealedType === i ? 'shadow-lg' : 'hover:opacity-90'}`}
                   onClick={() => setRevealedType(revealedType === i ? null : i)}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{s.icon}</span>
                  <h4 className="font-bold text-white">{s.type}</h4>
                </div>
                <p className="text-xs text-gray-400 mb-2">{s.desc}</p>
                {revealedType === i && (
                  <div className="mt-2 pt-2 border-t border-white/10 fade-in">
                    <p className="text-xs text-gray-400 font-bold mb-1">官方示例：</p>
                    <code className="text-xs">{s.example}</code>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* When to Create */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">🎯 何时应该创建一个 Skill？（官方判断标准）</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {WHEN_TO_CREATE.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${item.good ? 'border-emerald-500/20 bg-emerald-900/5' : 'border-red-500/20 bg-red-900/5'}`}>
              <span className="text-lg shrink-0">{item.icon}</span>
              <p className="text-sm text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Iron Law Preview */}
      <section className="lesson-section glass-panel mt-6" style={{borderLeft: '4px solid #6d28d9'}}>
        <div className="flex gap-3 items-start">
          <AlertCircle className="text-violet-400 shrink-0 mt-1" size={20}/>
          <div>
            <h4 className="font-bold text-violet-300 mb-1">⚠️ 铁律预告：No Skill Without a Failing Test First</h4>
            <p className="text-sm text-gray-300 leading-relaxed">Anthropic 官方将写 Skill 等同于 TDD（测试驱动开发）：在写任何 Skill 之前，你必须先用"压力场景"让 Agent 在没有 Skill 时暴露问题（RED），然后写 Skill 让 Agent 通过测试（GREEN）。模块三将详细展开这一方法论。</p>
          </div>
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skill-engineering/lesson/structure')}>
          认知已建立！解剖 Skill 结构规范 →
        </button>
      </section>
    </div>
  );
}
