import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Copy, CheckCircle2, ArrowRight } from 'lucide-react';
import './LessonCommon.css';

const SCENARIO = {
  title: '实战场景：为你的团队写一个"每日晨会主持"Skill',
  context: '你发现 AI Agent 在主持每日晨会时，总是不问"是否有阻塞问题"就结束了。你决定为它创建一个 Skill。',
};

const ITERATIONS = [
  {
    version: 'v0 - 糟糕的起点',
    label: '❌ 新手常犯的错误写法',
    color: 'red',
    code: `---
name: standup(meeting)
description: 用于每日晨会，召集团队成员，让每个人分享昨天的工作情况和今天的计划，然后询问是否有阻塞，最后宣布晨会结束。
---

# 每日站会

每天召集团队成员，让大家依次汇报：
1. 昨天完成了什么
2. 今天计划做什么  
3. 有没有阻塞问题

然后结束会议。`,
    problems: [
      'name 包含括号，违反命名规范',
      'description 描述了完整工作流程，Agent 可能不读正文',
      '缺少 YAML 格式头部（---）的正确闭合',
      '无 "Use when..." 开头',
      '无 Core Principle',
      '无红旗清单（Red Flags）',
      '无常见错误表',
    ],
  },
  {
    version: 'v1 - 结构正确，但缺深度',
    label: '⚠️ 格式对了，但对"最重要的漏洞"没有针对性',
    color: 'yellow',
    code: `---
name: daily-standup-facilitator
description: Use when facilitating daily standup meetings with a development team
---

# Daily Standup Facilitator

## Overview
Help facilitate daily standup meetings efficiently.

## When to Use
- Daily team standup meetings
- Sprint ceremonies

## Process
1. Ask each person: Yesterday / Today / Blockers
2. Keep it under 15 minutes
3. End the meeting`,
    problems: [
      'description 缺少具体症状，过于模糊',
      '无 Core Principle 揭示设计意图',
      '"Blockers" 是最关键的环节，但没有强调永不跳过',
      '无 Red Flags 清单',
      '无 Common Mistakes（如直接跳过阻塞问题）',
      '缺少 Iron Law 针对"跳过阻塞环节"这个已知问题',
    ],
  },
  {
    version: 'v2 - 生产级质量',
    label: '✅ 符合 Anthropic 官方规范的完整 Skill',
    color: 'emerald',
    code: `---
name: daily-standup-facilitator
description: Use when you are facilitating a daily standup meeting and need to ensure every team member shares updates and blockers are explicitly surfaced before closing the meeting
---

# Daily Standup Facilitator

## Overview

Structure daily standup so blockers surface every time — not just when someone remembers to ask.

**Core principle:** A standup without an explicit blockers question is an incomplete standup.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

\`\`\`
NEVER CLOSE A STANDUP WITHOUT ASKING EACH PERSON ABOUT BLOCKERS
\`\`\`

If blockers are not asked, the standup is not complete. Restart the blockers round.

## The Process

1. **Open standing** — announce format: Yesterday / Today / Blockers
2. **Round-robin** — each member gives all three answers
3. **Explicit Blockers Gate** — after all members: "Anyone have anything blocking progress that we haven't addressed?"
4. **Capture** — note blockers mentioned, assign owners
5. **Close** — only after Gate passes

## Red Flags — STOP

- Moving to close without completing the Blockers Gate
- "No one mentioned blockers so we're good" (Gate proves it)
- Meeting over 15 min → timecheck before Gate, not after

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping blockers when everyone seems busy | Always run the Gate. Takes 30 seconds. |
| Combining "Today" and "Blockers" into one question | Keep them separate — people miss blockers when combining |
| Closing when one person is absent | Get async update, still run Gate with present members |`,
    problems: [],
  },
];

const CHECKLIST_ITEMS = [
  { label: 'name 仅含字母、数字、连字符', check: 'daily-standup-facilitator ✅' },
  { label: 'description 以 "Use when..." 开头', check: 'Use when you are facilitating... ✅' },
  { label: 'description 只描述触发条件，无工作流', check: '仅说明"何时"，无"如何" ✅' },
  { label: 'description 字符数 < 500', check: '当前约 210 个字符 ✅' },
  { label: '有 Core Principle 一句话核心', check: '"A standup without blockers question..." ✅' },
  { label: '有 Iron Law 铁律（如适用）', check: '"NEVER CLOSE WITHOUT ASKING..." ✅' },
  { label: '有 Red Flags 清单', check: '3 条红旗 ✅' },
  { label: '有 Common Mistakes 表', check: '3 行错误 + 修复 ✅' },
  { label: '测试：先运行无 Skill 场景，文档化违规', check: '（你应该先做这步！）' },
];

export default function LessonWorkshop() {
  const navigate = useNavigate();
  const [activeVersion, setActiveVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const copyCode = () => {
    navigator.clipboard.writeText(ITERATIONS[2].code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🛠️ 模块五：实战工坊篇</div>
        <h1>从零写一个企业级 Skill</h1>
        <p className="lesson-intro">
          理论都学完了，现在用一个<strong style={{color:'#c4b5fd'}}>真实企业场景</strong>完整走一遍 Skill 的创作、迭代、改进流程，直到达到 Anthropic 官方质量标准。
        </p>
      </header>

      {/* Scenario */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-2">📋 实战场景</h3>
        <p className="text-sm text-gray-400 mb-3">{SCENARIO.context}</p>
        <div className="bg-violet-900/20 border border-violet-500/30 rounded-xl p-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            在没有 Skill 的情况下，你测试了 Agent 三次：每次 Agent 都在问完"今天计划什么"后，就宣布"好的，晨会结束！"<br/>
            <strong className="text-violet-300">这就是你的 RED 阶段基线</strong>——Agent 没有 Skill 时会跳过阻塞问题环节。
          </p>
        </div>
      </section>

      {/* Version Comparison */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">📈 Skill 版本迭代：从糟糕到生产级</h3>
        <div className="flex gap-2 flex-wrap mb-5">
          {ITERATIONS.map((v, i) => {
            const colors = { red: 'border-red-500 bg-red-900/20 text-red-300', yellow: 'border-yellow-500 bg-yellow-900/20 text-yellow-300', emerald: 'border-emerald-500 bg-emerald-900/20 text-emerald-300' };
            return (
              <button key={i} onClick={() => setActiveVersion(i)}
                className={`px-3 py-2 rounded-lg text-xs border-2 font-bold transition-all ${activeVersion === i ? colors[v.color] : 'border-gray-700 bg-black/20 text-gray-400'}`}>
                {v.version}
              </button>
            );
          })}
        </div>

        <div className="p-1 bg-black/30 rounded-xl mb-2">
          <p className={`text-sm font-bold px-3 py-2 ${ITERATIONS[activeVersion].color === 'red' ? 'text-red-300' : ITERATIONS[activeVersion].color === 'yellow' ? 'text-yellow-300' : 'text-emerald-300'}`}>
            {ITERATIONS[activeVersion].label}
          </p>
        </div>

        <div className="relative">
          <pre className="bg-black/70 border border-gray-700 rounded-xl p-4 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80">{ITERATIONS[activeVersion].code}</pre>
          {activeVersion === 2 && (
            <button onClick={copyCode} className="absolute top-3 right-3 bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded text-xs flex items-center gap-1">
              {copied ? <><CheckCircle2 size={10}/> 已复制</> : <><Copy size={10}/> 复制</>}
            </button>
          )}
        </div>

        {ITERATIONS[activeVersion].problems.length > 0 && (
          <div className="mt-4">
            <p className={`text-xs font-bold mb-2 ${ITERATIONS[activeVersion].color === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>
              🐛 发现的问题（{ITERATIONS[activeVersion].problems.length} 个）：
            </p>
            <div className="grid md:grid-cols-2 gap-1.5">
              {ITERATIONS[activeVersion].problems.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-400 bg-black/20 p-2 rounded-lg">
                  <span className="text-red-400 shrink-0">•</span>{p}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Deployment Checklist */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">✅ Skill 部署前质量检查清单（官方适配）</h3>
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 cursor-pointer"
                 onClick={() => setCheckedItems(prev => ({...prev, [i]: !prev[i]}))}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checkedItems[i] ? 'bg-violet-600 border-violet-500' : 'border-gray-600'}`}>
                {checkedItems[i] && <CheckCircle2 size={12} className="text-white"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">{item.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{item.check}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center">完成所有检查后，你的 Skill 才算真正准备好部署！</p>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skill-engineering/lesson/deploy')}>
          Skill 写好了！学习验证与部署 →
        </button>
      </section>
    </div>
  );
}
