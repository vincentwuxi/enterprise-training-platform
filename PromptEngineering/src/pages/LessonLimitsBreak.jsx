import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Merge, ArrowRight } from 'lucide-react';
import './LessonCommon.css';

const COT_EXAMPLES = {
  bad: {
    label: '❌ 直接回答（高错误率）',
    prompt: '小明有15个苹果，分给3个朋友，第一个朋友拿了苹果总数的三分之一，第二个朋友比第一个朋友多拿了2个，第三个朋友拿了剩下的，请问第三个朋友拿了几个？',
    response: '第三个朋友拿了 3 个苹果。',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  good: {
    label: '✅ 思维链输出（精准推理）',
    prompt: '...Let\'s think step by step.',
    response: `第一步：总数 = 15 个
第一个朋友 = 15 × 1/3 = 5 个

第二步：第二个朋友比第一个多 2 个
第二个朋友 = 5 + 2 = 7 个

第三步：已分出 5 + 7 = 12 个
剩余 = 15 - 12 = 3 个

✅ 第三个朋友拿了 3 个苹果。（恰巧这题一样，但复杂题中 CoT 能大幅减少错误）`,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  }
};

const CHAIN_STEPS = [
  { icon: '📄', label: '输入长文章', desc: '原始材料' },
  { icon: '💡', label: '提炼核心要点', desc: 'Prompt 1' },
  { icon: '📝', label: '构建段落大纲', desc: 'Prompt 2' },
  { icon: '✍️', label: '逐段精写扩展', desc: 'Prompt 3' },
  { icon: '✨', label: '格式化排版', desc: 'Prompt 4' },
];

export default function LessonLimitsBreak() {
  const navigate = useNavigate();
  const [cotMode, setCotMode] = useState('bad');

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🔥 模块三：突破极限</div>
         <h1>激发 AI 深度推理的高阶策略</h1>
         <p className="lesson-intro">
            大模型不能直接胜任复杂的逻辑推理？教你如何用两句话，让它的推理质量强行翻倍！
         </p>
      </header>

      <section className="lesson-section glass-panel">
         <h3 className="mb-4">1. 从 Zero-Shot 到 Few-Shot（少样本提示）</h3>
         <p className="text-gray-300 mb-4">比起讲一堆复杂的抽象规则，直接给 AI 两到三个标准的"输入-输出"映射例子，能瞬间让它明白任务规则。</p>
         
         <div className="bg-black/30 p-4 border-l-4 border-emerald-500 rounded font-mono text-sm leading-relaxed mb-2">
            <span className="text-gray-500">{'// 向 AI 提供少样本案例 (Few-Shot)'}</span><br/>
            文本: "今天的咖啡太难喝了，像泥水。" {`=>`} 情感: <span className="text-red-400">负面</span><br/>
            文本: "虽然经历了波折，结果却很赞。" {`=>`} 情感: <span className="text-green-400">正面</span><br/>
            文本: "这次会议没有明确结论，感觉有点虚。" {`=>`} 情感:
         </div>
         <p className="text-xs text-gray-500">AI 会严格遵循你给出的映射格式填写"负面"，而非输出一大段废话分析。</p>
      </section>

      <section className="lesson-section glass-panel">
         <h3 className="flex items-center gap-2 mb-6"><BrainCircuit className="text-yellow-400"/> 2. 魔法句：思维链 (CoT) —— 可视化对比</h3>
         <p className="text-gray-300 mb-2">核心魔法：在指令末尾加上 <code className="bg-black/30 px-2 py-0.5 rounded text-yellow-300">"Let's think step by step"</code>。强迫 AI 先展示推理过程，再给出答案。</p>
         <p className="text-gray-400 text-sm mb-6">亲眼看看有没有 CoT 对于推理质量的影响：</p>

         <div className="flex gap-2 mb-4">
           <button onClick={() => setCotMode('bad')} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${cotMode === 'bad' ? 'bg-red-500/30 border border-red-500/50 text-red-200' : 'bg-black/20 border border-white/10 text-gray-400'}`}>
             ❌ 无 CoT（直接回答）
           </button>
           <button onClick={() => setCotMode('good')} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${cotMode === 'good' ? 'bg-green-500/30 border border-green-500/50 text-green-200' : 'bg-black/20 border border-white/10 text-gray-400'}`}>
             ✅ 有 CoT（逐步推理）
           </button>
         </div>

         <div className="rounded-xl p-4 border transition-colors" style={{background: COT_EXAMPLES[cotMode].bgColor, borderColor: COT_EXAMPLES[cotMode].color + '50'}}>
           <div className="text-xs font-mono mb-3" style={{color: COT_EXAMPLES[cotMode].color}}>{COT_EXAMPLES[cotMode].label}</div>
           <div className="text-xs text-gray-400 mb-2">AI 输出：</div>
           <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed font-mono">{COT_EXAMPLES[cotMode].response}</pre>
         </div>
      </section>

      <section className="lesson-section glass-panel">
         <h3 className="flex items-center gap-2 mb-6"><Merge className="text-purple-400"/> 3. 提示词链（Prompt Chaining）流程图</h3>
         <p className="text-gray-300 mb-6">抵制"一步登天"的幻想。把复杂任务拆解为有序的多步骤流水线，每个 Prompt 只解决一件事：</p>

         <div className="flex items-center gap-2 flex-wrap justify-center">
           {CHAIN_STEPS.map((step, i) => (
             <React.Fragment key={i}>
               <div className="flex flex-col items-center text-center p-4 glass-panel rounded-xl min-w-24" style={{borderTop: '3px solid #8b5cf6'}}>
                 <span className="text-3xl mb-2">{step.icon}</span>
                 <div className="text-sm font-medium text-white">{step.label}</div>
                 <div className="text-xs text-purple-400 mt-1">{step.desc}</div>
               </div>
               {i < CHAIN_STEPS.length - 1 && <ArrowRight className="text-purple-400 shrink-0" size={20}/>}
             </React.Fragment>
           ))}
         </div>

         <div className="mt-6 bg-black/20 p-4 rounded-lg border border-purple-500/20">
           <p className="text-sm text-gray-300"><strong className="text-purple-300">反向提问 (Reverse Prompting)：</strong>让 AI 转守为攻！发送："我想做个季度复盘，请你主动向我提问，直到你收集到所有你需要的背景再执行。" AI 会像资深顾问一样倒逼你把需求想清楚。</p>
         </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/prompt-engineering-camp/lesson/scenarios')}>心法大成！进入职场 10 倍落地篇</button>
      </section>
    </div>
  );
}
