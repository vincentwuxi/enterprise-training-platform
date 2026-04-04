import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RefreshCw, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import './LessonCommon.css';

const TDD_MAPPING = [
  { tdd: '测试用例', skill: '压力场景（Pressure Scenario）', desc: '用一个具有挑战性的真实场景来测试 Skill 是否有效' },
  { tdd: '生产代码', skill: 'SKILL.md 文档', desc: 'Skill 文档本身就是"实现代码"' },
  { tdd: 'RED — 测试失败', skill: 'Agent 在没有 Skill 时违规', desc: '无 Skill 时 Agent 会犯什么错？文档化具体的理由措辞' },
  { tdd: 'GREEN — 测试通过', skill: 'Agent 有 Skill 时合规', desc: '写完 Skill 后，Agent 在同样压力下能否遵守？' },
  { tdd: 'REFACTOR', skill: '堵上新发现的漏洞', desc: 'Agent 找到新的借口？追加明确的反驳，重新测试' },
];

const RATIONALIZATIONS = [
  { excuse: '"这个 Skill 太简单了，没必要测"', reality: '对你来说简单 ≠ 对其他 Agent 清晰。测！' },
  { excuse: '"这只是个参考文档，不是规则"', reality: '参考文档也有缺口和模糊之处。测检索场景。' },
  { excuse: '"我有信心写得很好"', reality: '过度自信是 Skill 质量的最大敌人。测！' },
  { excuse: '"测试太麻烦了，先部署再说"', reality: '部署未测试的 Skill 就像部署未测试的代码。' },
  { excuse: '"没时间测试"', reality: '之后修复有问题的 Skill 会花更多时间。' },
  { excuse: '"学术审查就够了"', reality: '阅读 ≠ 使用。必须测试实际应用场景。' },
];

const PRESSURE_TYPES = [
  { type: '⏱️ 时间压力', desc: '"快点，老板在等着要结果"', target: '测试 Agent 是否会因为着急而跳过 Skill 规定的步骤' },
  { type: '💰 沉没成本压力', desc: '"我已经花了 3 小时写了这段代码"', target: '测试 Agent 是否会因为舍不得丢弃代码而绕过 TDD 规定' },
  { type: '🤫 权威压力', desc: '"CTO 说不需要按 Skill 来"', target: '测试 Agent 是否会被权威覆盖而不遵守 Skill 规则' },
  { type: '😴 疲惫压力', desc: '"这已经是今天的第八个任务了"', target: '测试 Agent 在疲惫状态下是否仍然坚持 Skill 规范' },
];

const RED_GREEN_STEPS = [
  { phase: 'RED', color: '#ef4444', fill: '#fecaca', label: '写失败的测试（压力场景）', detail: '在没有 Skill 的情况下，给 Agent 一个充满压力的场景，观察它的违规行为和借口措辞' },
  { phase: 'VERIFY RED', color: '#f97316', fill: '#fed7aa', label: '记录 Agent 的违规模式', detail: '精确记录 Agent 用什么理由跳过了规则，这些借口将成为你 Skill 的反驳材料' },
  { phase: 'GREEN', color: '#22c55e', fill: '#bbf7d0', label: '写最小化 Skill', detail: '针对观察到的具体违规行为，写 Skill 来解决那些特定的问题，不要为假设场景写内容' },
  { phase: 'VERIFY GREEN', color: '#10b981', fill: '#a7f3d0', label: '用同样场景重新测试', detail: '带上 Skill 重新运行压力场景，Agent 应该现在能遵守规则了' },
  { phase: 'REFACTOR', color: '#6366f1', fill: '#c7d2fe', label: '堵漏洞，持续迭代', detail: 'Agent 找到新的合理化借口？追加明确的反驳内容，重新测试，直到 Bulletproof' },
];

export default function LessonTDD() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealedRationalization, setRevealedRationalization] = useState(null);
  const intervalRef = useRef(null);

  const playAnimation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveStep(-1);
    let i = 0;
    intervalRef.current = setInterval(() => {
      setActiveStep(i);
      i++;
      if (i >= RED_GREEN_STEPS.length) { clearInterval(intervalRef.current); setIsPlaying(false); }
    }, 900);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🔁 模块三：测试驱动篇</div>
        <h1>铁律：先测试再写 Skill</h1>
        <p className="lesson-intro">
          Anthropic 将写 Skill 等同于 TDD（测试驱动开发）。铁律是：<strong style={{color:'#c4b5fd'}}>No Skill Without a Failing Test First.</strong> 如果你没有看到 Agent 在没有 Skill 时失败，你就不知道这个 Skill 解决了什么问题。
        </p>
      </header>

      {/* TDD Mapping Table */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">🔄 TDD 概念向 Skill 创作的完整映射</h3>
        <p className="text-gray-400 text-sm mb-5">Anthropic 官方明确指出：写 Skill = 把 TDD 应用于过程文档（"Writing skills IS Test-Driven Development applied to process documentation."）</p>
        <div className="space-y-2">
          {TDD_MAPPING.map((item, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
              <div className="col-span-2 flex items-center">
                <span className="text-sm font-bold text-blue-300">{item.tdd}</span>
              </div>
              <div className="flex items-center justify-center"><ArrowRight size={16} className="text-gray-600"/></div>
              <div className="col-span-2">
                <p className="text-sm font-bold text-violet-300">{item.skill}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RED-GREEN-REFACTOR Animation */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🎬 RED-GREEN-REFACTOR 循环演示（可交互）</h3>
        <div className="space-y-2 mb-5">
          {RED_GREEN_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-500"
              style={{ borderColor: activeStep >= i ? step.color + '60' : '#ffffff10', background: activeStep >= i ? step.color + '12' : 'rgba(0,0,0,0.2)', opacity: activeStep >= 0 && activeStep < i ? 0.3 : 1 }}>
              <div className="w-20 shrink-0 font-black text-xs text-center py-1.5 rounded-lg" style={{ background: step.fill + '30', color: step.color }}>{step.phase}</div>
              <div>
                <p className="font-bold text-white text-sm mb-0.5">{step.label}</p>
                <p className="text-xs text-gray-400">{step.detail}</p>
              </div>
              {activeStep > i && <CheckCircle2 size={16} className="ml-auto shrink-0 mt-1" style={{color: step.color}}/>}
            </div>
          ))}
        </div>
        <button onClick={playAnimation}
          className="flex items-center gap-2 bg-violet-700 hover:bg-violet-600 px-5 py-2 rounded-full text-sm font-bold text-white transition-all">
          {isPlaying ? <><RefreshCw size={14} className="animate-spin"/> 运行中...</> : <><Play size={14}/> {activeStep >= 0 ? '重新演示' : '▶ 运行 TDD 循环'}</>}
        </button>
      </section>

      {/* Iron Law */}
      <section className="lesson-section glass-panel mt-8" style={{border: '2px solid #6d28d9'}}>
        <h3 className="mb-4 text-violet-300">⚖️ 铁律及其所有例外情况（来自官方原文）</h3>
        <div className="bg-black/60 p-4 rounded-xl text-center mb-4">
          <p className="text-2xl font-black text-white tracking-wider">NO SKILL WITHOUT A FAILING TEST FIRST</p>
        </div>
        <p className="text-sm text-gray-400 mb-3">以下理由都不能成为跳过测试的借口：</p>
        <div className="space-y-2">
          {['"只是简单的新增内容"', '"只是文档更新"', '"只是添加一个章节"', '"留作参考也是可以的"', '"边测试边修改吧"'].map((excuse, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-red-900/10 rounded-lg border border-red-500/20">
              <XCircle size={14} className="text-red-400 shrink-0"/>
              <p className="text-sm text-gray-300">{excuse}</p>
              <span className="ml-auto text-xs text-red-400">无效！</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-violet-300 font-bold mt-3">▶ 删除，从零开始。这是唯一正确的处理方式。</p>
      </section>

      {/* Pressure Types */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🧪 压力场景的 4 种类型（用来测试 Discipline Skill）</h3>
        <p className="text-gray-400 text-sm mb-5">对于纪律型 Skill（如 TDD、Verification），测试压力场景时需要组合多种压力，因为现实中往往是多重压力同时存在：</p>
        <div className="grid md:grid-cols-2 gap-4">
          {PRESSURE_TYPES.map((p, i) => (
            <div key={i} className="p-4 rounded-xl border border-violet-500/20 bg-violet-900/10">
              <h4 className="font-bold text-violet-200 mb-1">{p.type}</h4>
              <p className="text-xs text-gray-400 mb-2 italic">"{p.desc}"</p>
              <p className="text-xs text-gray-500">{p.target}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rationalization Table */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">💡 常见跳过测试的借口 vs 现实（点击展开）</h3>
        <div className="space-y-2">
          {RATIONALIZATIONS.map((item, i) => (
            <div key={i} className="p-3 rounded-xl border border-white/5 bg-black/20 cursor-pointer hover:border-violet-500/20 transition-all"
                 onClick={() => setRevealedRationalization(revealedRationalization === i ? null : i)}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300 italic">{item.excuse}</p>
                <ArrowRight size={14} className={`text-gray-600 transition-transform ${revealedRationalization === i ? 'rotate-90' : ''}`}/>
              </div>
              {revealedRationalization === i && (
                <div className="mt-2 pt-2 border-t border-white/5 fade-in">
                  <p className="text-sm text-violet-300 font-medium">{item.reality}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skill-engineering/lesson/gallery')}>
          TDD 铁律掌握！进入 14 个官方 Skill 解析 →
        </button>
      </section>
    </div>
  );
}
