import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, XCircle, Copy, RefreshCw } from 'lucide-react';
import './LessonCommon.css';

const YAML_FIELDS = [
  { field: 'name', required: true, desc: '唯一标识符，仅用字母、数字和连字符', good: 'systematic-debugging', bad: 'systematic_debugging(2)', badReason: '含下划线和括号，违反命名规则' },
  { field: 'description', required: true, desc: '第三人称，仅描述"何时使用"，绝不描述"如何执行"', good: 'Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes', bad: 'Use when debugging - read errors, check changes, form hypothesis, implement fix', badReason: '描述了工作流程！会导致 Agent 跳过读取 Skill 正文' },
];

const SECTIONS = [
  { name: '# Overview', must: true, desc: '核心是什么？用 1-2 句话说明。包含 Core Principle。', example: '**Core principle:** Evidence before claims, always.' },
  { name: '## When to Use', must: true, desc: '详细的触发条件（症状、场景），以及何时不用。', example: 'Use ESPECIALLY when: Under time pressure, "quick fix" seems obvious...' },
  { name: '## The Iron Law', must: false, desc: '对于纪律型 Skill，以醒目的代码块声明不可妥协的规则。', example: '```\nNO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE\n```' },
  { name: '## Quick Reference', must: false, desc: '供快速扫描的表格或要点，Agent 阅读时最先看这里。', example: '| Phase | Key Activities | Success Criteria |' },
  { name: '## Common Mistakes / Rationalizations', must: false, desc: '常见错误表 + 抗合理化借口表。对纪律型 Skill 尤为重要。', example: '| "Issue is simple" | Simple issues have root causes too. |' },
  { name: '## Red Flags', must: false, desc: '让 Agent 进行自我检查的危险信号清单。', example: 'If you catch yourself thinking: "Quick fix for now, investigate later"' },
];

const CSO_GOOD_BAD = [
  {
    label: 'description 字段',
    bad: 'description: Use when executing plans - dispatches subagent per task with code review between tasks',
    good: 'description: Use when executing implementation plans with independent tasks in the current session',
    badWhy: '包含了工作流摘要 → Agent 可能只读 description 不读正文，只做一次 review 而非两次',
    goodWhy: '只描述触发条件 → Agent 会完整读取 Skill 正文，执行完整工作流',
  },
  {
    label: '名称命名',
    bad: 'skill-creation / debug-help / code-review',
    good: 'writing-skills / systematic-debugging / requesting-code-review',
    badWhy: '被动/名词式 → 搜索匹配率低',
    goodWhy: '动词 + 动名词形式 → 主动描述行为，更容易被发现',
  },
];

const BUILDER_TEMPLATE = `---
name: {名称，仅字母数字连字符}
description: Use when {具体的触发条件和症状}
---

# {Skill 标题}

## Overview

{核心是什么？1-2句话。}

**Core principle:** {一句话核心原则}

## When to Use

{触发此 Skill 的症状和场景，包括何时不用}

## Quick Reference

| 场景 | 做法 |
|------|------|
| {场景1} | {做法1} |

## Common Mistakes

| 错误 | 修复 |
|------|------|
| {错误1} | {修复1} |`;

export default function LessonStructure() {
  const navigate = useNavigate();
  const [activeYaml, setActiveYaml] = useState(0);
  const [activeCso, setActiveCso] = useState(0);
  const [skillName, setSkillName] = useState('');
  const [skillDesc, setSkillDesc] = useState('');
  const [descValid, setDescValid] = useState(null);
  const [copied, setCopied] = useState(false);

  const validateDesc = () => {
    const ok = skillDesc.toLowerCase().startsWith('use when');
    const noWorkflow = !/(dispatch|review|phase|step|run|execute|then|workflow)/i.test(skillDesc);
    if (!skillDesc) return setDescValid(null);
    setDescValid(ok && noWorkflow ? 'good' : ok ? 'warn' : 'bad');
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(BUILDER_TEMPLATE);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">📄 模块二：结构规范篇</div>
        <h1>解剖一个好 Skill 的结构</h1>
        <p className="lesson-intro">
          一个好的 Skill 不是随意写的 Markdown 文件。它遵循一套经过 Anthropic 工程实践验证的<strong style={{color:'#c4b5fd'}}>结构规范和搜索优化（CSO）</strong>。这一节带你完整解剖每个部分的作用和写法。
        </p>
      </header>

      {/* YAML Frontmatter */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">📋 YAML 前言：两个必填字段的陷阱</h3>
        <p className="text-gray-400 text-sm mb-5">每个 SKILL.md 必须有 YAML 前言块，包含 <code>name</code> 和 <code>description</code> 两个字段。这两个字段有严格的写法规范：</p>
        <div className="flex gap-2 mb-5">
          {YAML_FIELDS.map((f, i) => (
            <button key={i} onClick={() => setActiveYaml(i)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${activeYaml === i ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {f.required && '🔴 '}{f.field}
            </button>
          ))}
        </div>
        <div className="glass-panel" style={{padding:'1.2rem'}}>
          <p className="text-sm text-gray-400 mb-4">{YAML_FIELDS[activeYaml].desc}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-emerald-900/15 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-emerald-400 text-xs font-bold mb-2">✅ GOOD</p>
              <code className="text-sm text-emerald-200 block whitespace-pre-wrap">{YAML_FIELDS[activeYaml].good}</code>
            </div>
            <div className="bg-red-900/15 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-xs font-bold mb-2">❌ BAD</p>
              <code className="text-sm text-red-200 block whitespace-pre-wrap">{YAML_FIELDS[activeYaml].bad}</code>
              <p className="text-xs text-red-400 mt-2">{YAML_FIELDS[activeYaml].badReason}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🏗️ SKILL.md 正文结构：必填 vs 推荐</h3>
        <div className="space-y-3">
          {SECTIONS.map((s, i) => (
            <div key={i} className={`p-4 rounded-xl border ${s.must ? 'border-violet-500/30 bg-violet-900/10' : 'border-white/5 bg-black/20'}`}>
              <div className="flex items-center gap-3 mb-2">
                <code className="text-sm font-bold text-violet-300">{s.name}</code>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.must ? 'text-red-300 border-red-500/30 bg-red-900/20' : 'text-gray-500 border-gray-700'}`}>
                  {s.must ? '必填' : '推荐'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{s.desc}</p>
              <code className="text-xs text-gray-500 block">{s.example}</code>
            </div>
          ))}
        </div>
      </section>

      {/* CSO - Claude Search Optimization */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-2">🔍 CSO：Claude Search Optimization（搜索优化）</h3>
        <p className="text-gray-400 text-sm mb-5">
          Skill 必须能被未来的 Claude 实例<strong className="text-white">找到</strong>。Claude 通过读取 description 决定是否加载某个 Skill。以下是两个最关键的 CSO 规则：
        </p>
        <div className="flex gap-2 mb-4">
          {CSO_GOOD_BAD.map((c, i) => (
            <button key={i} onClick={() => setActiveCso(i)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${activeCso === i ? 'border-violet-500 bg-violet-900/30 text-violet-200' : 'border-gray-700 bg-black/20 text-gray-400'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <div className="bg-red-900/15 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 font-bold text-xs mb-2">❌ BAD</p>
            <code className="text-xs text-gray-300 block mb-2">{CSO_GOOD_BAD[activeCso].bad}</code>
            <p className="text-xs text-red-400">{CSO_GOOD_BAD[activeCso].badWhy}</p>
          </div>
          <div className="bg-emerald-900/15 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 font-bold text-xs mb-2">✅ GOOD</p>
            <code className="text-xs text-gray-300 block mb-2">{CSO_GOOD_BAD[activeCso].good}</code>
            <p className="text-xs text-emerald-400">{CSO_GOOD_BAD[activeCso].goodWhy}</p>
          </div>
        </div>
      </section>

      {/* Interactive Description Validator */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-3">🧪 Description 质量检测器（交互实验）</h3>
        <p className="text-gray-400 text-sm mb-4">输入你想写的 Skill name 和 description，看看是否符合规范：</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-violet-300 font-bold block mb-1">Skill name</label>
            <input className="w-full bg-black/50 border border-gray-700 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-violet-500 placeholder-gray-600"
              placeholder="仅字母、数字、连字符，如：daily-standup-helper"
              value={skillName} onChange={e => setSkillName(e.target.value)}/>
            {skillName && !/^[a-z0-9-]+$/.test(skillName) && (
              <p className="text-red-400 text-xs mt-1">❌ 包含非法字符！只允许小写字母、数字和连字符</p>
            )}
            {skillName && /^[a-z0-9-]+$/.test(skillName) && (
              <p className="text-emerald-400 text-xs mt-1">✅ 命名格式正确</p>
            )}
          </div>
          <div>
            <label className="text-xs text-violet-300 font-bold block mb-1">description</label>
            <textarea className="w-full bg-black/50 border border-gray-700 text-white text-sm rounded-xl p-3 resize-none focus:outline-none focus:border-violet-500 placeholder-gray-600"
              rows={3}
              placeholder='以 "Use when..." 开头，描述触发条件，不要包含执行步骤'
              value={skillDesc} onChange={e => { setSkillDesc(e.target.value); setDescValid(null); }}
              onBlur={validateDesc}/>
            {descValid === 'good' && <p className="text-emerald-400 text-xs mt-1">✅ 规范！以 "Use when" 开头，未包含工作流描述</p>}
            {descValid === 'warn' && <p className="text-yellow-400 text-xs mt-1">⚠️ 以 "Use when" 开头，但可能包含工作流描述（dispatch/review/step 等关键词），请检查</p>}
            {descValid === 'bad' && <p className="text-red-400 text-xs mt-1">❌ 必须以 "Use when..." 开头！当前写法会导致 Agent 无法正确识别触发时机</p>}
          </div>
        </div>
      </section>

      {/* Template */}
      <section className="lesson-section mt-8">
        <h3 className="mb-3">📋 完整 SKILL.md 模板（一键复制）</h3>
        <div className="relative">
          <pre className="bg-black/70 border border-violet-500/20 rounded-xl p-4 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">{BUILDER_TEMPLATE}</pre>
          <button onClick={copyTemplate} className="absolute top-3 right-3 bg-violet-900/60 hover:bg-violet-700 text-violet-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all">
            {copied ? <><CheckCircle2 size={11}/> 已复制</> : <><Copy size={11}/> 复制</>}
          </button>
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skill-engineering/lesson/tdd')}>
          结构掌握！进入 TDD 测试驱动写 Skill →
        </button>
      </section>
    </div>
  );
}
