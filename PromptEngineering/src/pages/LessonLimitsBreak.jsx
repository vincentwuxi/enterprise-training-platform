import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Merge, ArrowRight, Sparkles } from 'lucide-react';
import './LessonCommon.css';

const tabs = ['Few-Shot 提示', '思维链 (CoT)', '提示词链', '高阶策略'];

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

✅ 第三个朋友拿了 3 个苹果。`,
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
  const [active, setActive] = useState(0);
  const [cotMode, setCotMode] = useState('bad');

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🔥 模块三：突破极限</div>
         <h1>激发 AI 深度推理的高阶策略</h1>
         <p className="lesson-intro">
            大模型面对复杂推理容易翻车？掌握 <strong>Few-Shot / Chain-of-Thought / Prompt Chaining / Tree-of-Thought</strong> 等高阶策略，
            让推理质量提升 2-5 倍，从"运气好才对"变成"稳定输出高质量"。
         </p>
      </header>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'2rem',justifyContent:'center'}}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding:'0.5rem 1.2rem', borderRadius:8, fontSize:'0.85rem', fontWeight:600, cursor:'pointer',
            border: active===i ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
            background: active===i ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
            color: active===i ? '#fbbf24' : '#9ca3af', transition: 'all 0.2s',
          }}>{t}</button>
        ))}
      </div>

      {active === 0 && (
        <>
          <section className="lesson-section glass-panel mb-8">
             <h3 className="mb-4">1. Zero-Shot vs Few-Shot：给 AI 看"标准答案"</h3>
             <p className="text-gray-300 mb-4">比起讲一堆复杂的抽象规则，直接给 AI 2-3 个标准的"输入→输出"映射案例，能瞬间让它明白任务规则。</p>
             
             <div className="grid md:grid-cols-2 gap-4 mb-6">
               <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5">
                 <div className="text-sm text-red-400 font-bold mb-3">❌ Zero-Shot（直接问）</div>
                 <div className="bg-black/30 p-3 rounded font-mono text-xs text-gray-300">
                   <div className="text-gray-500 mb-2"># 只给规则，没给示例</div>
                   <div>请判断以下文本的情感倾向（正面/负面/中性）：</div>
                   <div className="mt-2 text-white">"虽然经历了波折，但结果很赞。"</div>
                 </div>
                 <p className="text-xs text-red-400/70 mt-3">AI 可能输出一长段分析，而不是你要的简洁标签</p>
               </div>
               <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-5">
                 <div className="text-sm text-green-400 font-bold mb-3">✅ Few-Shot（先给示例）</div>
                 <div className="bg-black/30 p-3 rounded font-mono text-xs text-gray-300">
                   <div className="text-gray-500 mb-2"># 先给 2-3 个标准案例</div>
                   <div>文本: "今天的咖啡太难喝了" → 情感: <span className="text-red-400">负面</span></div>
                   <div>文本: "经历波折，结果很赞" → 情感: <span className="text-green-400">正面</span></div>
                   <div>文本: "会议在三楼举行" → 情感: <span className="text-blue-400">中性</span></div>
                   <div className="mt-2">文本: "服务态度太差了" → 情感:</div>
                 </div>
                 <p className="text-xs text-green-400/70 mt-3">AI 会严格遵循示例格式，只输出标签</p>
               </div>
             </div>

             <div className="bg-black/20 p-5 rounded-xl border border-white/5">
               <h4 className="text-yellow-400 font-bold text-sm mb-3">🎯 Few-Shot 黄金法则</h4>
               <div className="grid md:grid-cols-2 gap-3">
                 {[
                   { rule: '示例数量: 2-5 个最佳', detail: '太少不够学，太多浪费 token' },
                   { rule: '覆盖边界 case', detail: '正面/负面/中性都要有示例' },
                   { rule: '示例格式统一', detail: '每个示例的输入→输出格式必须一致' },
                   { rule: '随机打散顺序', detail: '避免 AI 只学到最后一个示例的模式' },
                   { rule: '用真实数据', detail: '不要编造示例，用你业务中的真实案例' },
                   { rule: '标注清晰明确', detail: '"正面" 而不是 "这个评论比较积极"' },
                 ].map(r => (
                   <div key={r.rule} className="bg-black/30 p-3 rounded-lg">
                     <div className="text-sm text-white font-medium">{r.rule}</div>
                     <div className="text-xs text-gray-500 mt-1">{r.detail}</div>
                   </div>
                 ))}
               </div>
             </div>
          </section>

          <section className="lesson-section glass-panel">
            <h3 className="mb-4">📊 Few-Shot 的威力：分类任务准确率对比</h3>
            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {[
                  { label: 'Zero-Shot (无示例)', pct: 62, color: '#ef4444' },
                  { label: '1-Shot (1 个示例)', pct: 74, color: '#f59e0b' },
                  { label: '3-Shot (3 个示例)', pct: 88, color: '#22c55e' },
                  { label: '5-Shot (5 个示例)', pct: 92, color: '#06b6d4' },
                  { label: '5-Shot + CoT', pct: 96, color: '#8b5cf6' },
                ].map(b => (
                  <div key={b.label} style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                    <span style={{width:140,fontSize:'0.78rem',color:'#9ca3af',flexShrink:0,textAlign:'right'}}>{b.label}</span>
                    <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:4,height:24,overflow:'hidden'}}>
                      <div style={{width:`${b.pct}%`,background:b.color,height:'100%',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:8,transition:'width 0.6s ease'}}>
                        <span style={{fontSize:'0.7rem',fontWeight:700,color:'white'}}>{b.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">* 数据基于 GPT-4 在情感分类任务上的实测，不同任务和模型结果会有差异</p>
            </div>
          </section>
        </>
      )}

      {active === 1 && (
        <>
          <section className="lesson-section glass-panel mb-8">
             <h3 className="flex items-center gap-2 mb-6"><BrainCircuit className="text-yellow-400"/> 2. 思维链 (Chain-of-Thought) — 核心魔法</h3>
             <p className="text-gray-300 mb-2">核心魔法：在指令末尾加上 <code className="bg-black/30 px-2 py-0.5 rounded text-yellow-300">"Let's think step by step"</code>。强迫 AI 先展示推理过程，再给出最终答案。</p>
             <p className="text-gray-400 text-sm mb-6">亲眼看看有没有 CoT 对推理质量的影响：</p>

             <div className="flex gap-2 mb-4">
               <button onClick={() => setCotMode('bad')} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${cotMode === 'bad' ? 'bg-red-500/30 border border-red-500/50 text-red-200' : 'bg-black/20 border border-white/10 text-gray-400'}`}>
                 ❌ 无 CoT
               </button>
               <button onClick={() => setCotMode('good')} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${cotMode === 'good' ? 'bg-green-500/30 border border-green-500/50 text-green-200' : 'bg-black/20 border border-white/10 text-gray-400'}`}>
                 ✅ 有 CoT
               </button>
             </div>

             <div className="rounded-xl p-4 border transition-colors" style={{background: COT_EXAMPLES[cotMode].bgColor, borderColor: COT_EXAMPLES[cotMode].color + '50'}}>
               <div className="text-xs font-mono mb-3" style={{color: COT_EXAMPLES[cotMode].color}}>{COT_EXAMPLES[cotMode].label}</div>
               <div className="text-xs text-gray-400 mb-2">AI 输出：</div>
               <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed font-mono">{COT_EXAMPLES[cotMode].response}</pre>
             </div>
          </section>

          <section className="lesson-section glass-panel mb-8">
            <h3 className="mb-4">🧠 CoT 变体：选择最适合你的推理模式</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {[
                {
                  name: 'Zero-Shot CoT', tag: '最简单', color: '#22c55e',
                  desc: '只需在末尾加一句魔法咒语',
                  prompt: '"请分析这个问题。Let\'s think step by step."',
                  when: '多步推理、数学、逻辑题',
                  effect: '准确率提升 20-40%',
                },
                {
                  name: 'Manual CoT', tag: '最精确', color: '#3b82f6',
                  desc: '手动编写推理步骤示例（Few-Shot + CoT）',
                  prompt: '"问题: X → 思考: Step1→Step2→Step3 → 答: Y\\n问题: ..."',
                  when: '特定领域、需要特定推理模式',
                  effect: '准确率提升 30-50%',
                },
                {
                  name: 'Self-Consistency', tag: '最稳定', color: '#8b5cf6',
                  desc: '同一问题生成多条推理路径，投票选最优',
                  prompt: '"temperature=0.7, 生成 5 条推理路径, 取多数答案"',
                  when: '重要决策、不容出错的场景',
                  effect: '显著减少随机错误',
                },
                {
                  name: 'Tree-of-Thought', tag: '最强大', color: '#f59e0b',
                  desc: '像下棋一样，每一步展开多个选项，评估后选最优',
                  prompt: '"生成 3 个方案 → 评估利弊 → 选最优 → 继续深入"',
                  when: '复杂的规划问题、多步策略',
                  effect: 'SOTA 级推理能力',
                },
              ].map(v => (
                <div key={v.name} className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <span style={{fontWeight:700,color:v.color,fontSize:'0.95rem'}}>{v.name}</span>
                    <span style={{fontSize:'0.65rem',background:`${v.color}20`,color:v.color,padding:'2px 8px',borderRadius:20,fontWeight:600}}>{v.tag}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{v.desc}</p>
                  <div className="bg-black/30 p-2 rounded font-mono text-xs text-gray-400 mb-2">{v.prompt}</div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <div className="text-xs"><span className="text-gray-500">场景：</span><span className="text-gray-300">{v.when}</span></div>
                    <div className="text-xs"><span className="text-gray-500">效果：</span><span style={{color:v.color}}>{v.effect}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="lesson-section glass-panel">
            <h3 className="mb-4">⚡ CoT 实战模板</h3>
            <div className="bg-black/20 p-4 rounded-xl border border-purple-500/20 font-mono text-sm">
              <pre className="whitespace-pre-wrap text-gray-300">{`# 通用 CoT 模板

你是一位严谨的分析师。请按照以下步骤分析问题：

## 分析步骤
1. **理解问题**：用你自己的话复述问题
2. **列出已知条件**：逐条罗列关键信息
3. **识别隐含假设**：有哪些前提条件
4. **分步推理**：一步一步展开逻辑
5. **自我检查**：回顾推理过程，检查是否有漏洞
6. **输出结论**：给出最终答案 + 置信度

## 问题
[你的具体问题]

## 重要
- 每一步都要写出来，不要跳步
- 如果某一步不确定，明确标注"⚠️ 不确定"
- 最终答案前，先用一句话总结推理路径`}</pre>
            </div>
          </section>
        </>
      )}

      {active === 2 && (
        <>
          <section className="lesson-section glass-panel mb-8">
             <h3 className="flex items-center gap-2 mb-6"><Merge className="text-purple-400"/> 3. 提示词链（Prompt Chaining）</h3>
             <p className="text-gray-300 mb-6">抵制"一步登天"的幻想。把复杂任务拆解为有序的多步骤流水线，每个 Prompt 只解决一件事：</p>

             <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
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
          </section>

          <section className="lesson-section glass-panel mb-8">
            <h3 className="mb-4">📋 实战案例：用 Prompt 链写一份商业计划书</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {[
                { step: 'Prompt 1: 市场调研', prompt: '"分析 [行业] 的市场规模、增速、主要玩家。输出 Markdown 表格。"', output: '市场数据表格', color: '#3b82f6' },
                { step: 'Prompt 2: 竞品分析', prompt: '"基于上面的市场数据，分析 Top 5 竞品的优劣势和定价策略。"', output: '竞品对比矩阵', color: '#8b5cf6' },
                { step: 'Prompt 3: 价值主张', prompt: '"根据竞品分析，找出未被满足的市场需求，提出我们的差异化价值主张。"', output: '核心卖点', color: '#22c55e' },
                { step: 'Prompt 4: 商业模式', prompt: '"基于价值主张，设计收入模型、定价策略和获客渠道。"', output: '商业画布', color: '#f59e0b' },
                { step: 'Prompt 5: 财务预测', prompt: '"根据商业模式，做 3 年财务预测（收入/成本/盈亏）。"', output: 'P&L 表格', color: '#ef4444' },
                { step: 'Prompt 6: 整合成文', prompt: '"将以上内容整合为一份专业的 BP，适合向 VC 展示。"', output: '完整 BP', color: '#ec4899' },
              ].map((s, i) => (
                <div key={i} className="bg-black/20 p-4 rounded-xl flex items-center gap-4 border border-white/5">
                  <div style={{width:32,height:32,borderRadius:'50%',background:s.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.85rem',color:'white',flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:s.color,fontSize:'0.88rem',marginBottom:2}}>{s.step}</div>
                    <div className="font-mono text-xs text-gray-400">{s.prompt}</div>
                  </div>
                  <div style={{fontSize:'0.75rem',color:'#9ca3af',flexShrink:0}}>→ {s.output}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-black/20 p-3 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400"><strong className="text-yellow-400">关键：</strong>每一步的输出都是下一步的输入。这样即使中间某一步出错，你只需要重做那一步，不用从头开始。</p>
            </div>
          </section>

          <section className="lesson-section glass-panel">
            <h3 className="mb-4">🔄 反向提问（Reverse Prompting）</h3>
            <p className="text-gray-300 mb-4">让 AI 转守为攻！让它主动提问，倒逼你把需求想清楚：</p>
            <div className="bg-black/20 p-4 rounded-xl border border-purple-500/20 font-mono text-sm">
              <pre className="whitespace-pre-wrap text-gray-300">{`# 反向提问模板

你是一位资深的 [项目经理/产品经理/咨询顾问]。

我想做一件事: [简述你的目标]

在你开始执行之前，请先向我提出所有你需要的信息。
一次只问一个问题，等我回答后再问下一个。
当你收集到足够的信息后，告诉我"信息收集完毕"，
然后一次性输出完整方案。

开始提问吧。`}</pre>
            </div>
            <p className="text-xs text-gray-500 mt-3">这个技巧特别适合你"知道自己想要什么结果，但说不清楚需求"的场景。让 AI 像资深顾问一样引导你。</p>
          </section>
        </>
      )}

      {active === 3 && (
        <>
          <section className="lesson-section glass-panel mb-8">
            <h3 className="flex items-center gap-2 mb-6"><Sparkles className="text-yellow-400"/> 4. 高阶推理策略</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-black/20 p-5 rounded-xl border border-blue-500/20">
                <div className="text-sm font-bold text-blue-400 mb-3">🪞 自我反思 (Reflexion)</div>
                <p className="text-xs text-gray-300 mb-3">让 AI 审查自己的输出并改进：</p>
                <div className="bg-black/30 p-3 rounded font-mono text-xs text-gray-400">
                  <div>第一轮: 回答问题</div>
                  <div>第二轮: "审查上面的回答，找出</div>
                  <div>  可能的错误或遗漏"</div>
                  <div>第三轮: "根据审查结果，输出</div>
                  <div>  改进后的最终版本"</div>
                </div>
              </div>
              <div className="bg-black/20 p-5 rounded-xl border border-purple-500/20">
                <div className="text-sm font-bold text-purple-400 mb-3">🎭 角色辩论 (Debate)</div>
                <p className="text-xs text-gray-300 mb-3">让 AI 扮演正反双方辩论：</p>
                <div className="bg-black/30 p-3 rounded font-mono text-xs text-gray-400">
                  <div>"关于 [议题]，请分别以支持者</div>
                  <div> 和反对者的角色各给出 5 个论点。</div>
                  <div> 然后以裁判角色总结双方观点，</div>
                  <div> 给出你的最终判断。"</div>
                </div>
              </div>
              <div className="bg-black/20 p-5 rounded-xl border border-green-500/20">
                <div className="text-sm font-bold text-green-400 mb-3">🔍 假设验证 (Verification)</div>
                <p className="text-xs text-gray-300 mb-3">让 AI 主动质疑自己的假设：</p>
                <div className="bg-black/30 p-3 rounded font-mono text-xs text-gray-400">
                  <div>"回答这个问题。然后列出你</div>
                  <div> 回答中的所有隐含假设。</div>
                  <div> 逐一验证每个假设是否成立。</div>
                  <div> 如果有假设不成立，修正答案。"</div>
                </div>
              </div>
              <div className="bg-black/20 p-5 rounded-xl border border-orange-500/20">
                <div className="text-sm font-bold text-orange-400 mb-3">📊 多角度分析 (Multi-Lens)</div>
                <p className="text-xs text-gray-300 mb-3">从不同视角分析同一问题：</p>
                <div className="bg-black/30 p-3 rounded font-mono text-xs text-gray-400">
                  <div>"分析 [决策]，从以下角度各写</div>
                  <div> 3 条：技术可行性 / 商业价值 /</div>
                  <div> 用户体验 / 法律合规 / 运维成本</div>
                  <div> 最后综合评分 1-10。"</div>
                </div>
              </div>
            </div>
          </section>

          <section className="lesson-section glass-panel mb-8">
            <h3 className="mb-4">🏗️ Meta-Prompting：让 AI 写 Prompt</h3>
            <p className="text-gray-300 mb-4">最强大的进阶技巧——让 AI 帮你优化 Prompt 本身：</p>
            <div className="bg-black/20 p-4 rounded-xl border border-yellow-500/20 font-mono text-sm">
              <pre className="whitespace-pre-wrap text-gray-300">{`# Meta-Prompt 模板

我要用 AI 完成以下任务：
[描述你的任务]

请为我设计一个高质量的 Prompt，要求：
1. 包含清晰的角色设定
2. 任务描述具体、可执行
3. 输出格式有明确约束
4. 包含 2-3 个 Few-Shot 示例
5. 有防幻觉的安全提示

请直接输出可以复制使用的 Prompt，不要解释。`}</pre>
            </div>
            <div className="mt-4 bg-black/20 p-3 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400"><strong className="text-yellow-400">为什么有效：</strong>GPT-4 / Claude 这类模型在训练数据中见过大量高质量 Prompt 模板。让它们写 Prompt，往往比你自己写更结构化、更全面。</p>
            </div>
          </section>

          <section className="lesson-section glass-panel">
            <h3 className="mb-4">📈 策略选择决策树</h3>
            <div className="bg-black/20 p-5 rounded-xl border border-white/5">
              <div style={{fontFamily:'monospace',fontSize:'0.82rem',color:'#d1d5db',lineHeight:1.8}}>
                <pre className="whitespace-pre-wrap">{`你的任务是...
│
├─ 简单任务（分类/翻译/摘要）
│   └─ ✅ Zero-Shot + 明确指令即可
│
├─ 需要特定输出格式？
│   └─ ✅ Few-Shot（给 2-3 个示例）
│
├─ 涉及多步推理/逻辑？
│   ├─ 简单推理 → ✅ Zero-Shot CoT
│   └─ 复杂推理 → ✅ Manual CoT + Self-Consistency
│
├─ 超级复杂的规划任务？
│   └─ ✅ Tree-of-Thought
│
├─ 需要高质量长内容？
│   └─ ✅ Prompt Chaining（拆成多步）
│
└─ 对结果质量要求极高？
    └─ ✅ 自我反思 + 角色辩论 + 投票`}</pre>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/prompt-engineering-camp/lesson/scenarios')}>心法大成！进入职场 10 倍落地篇</button>
      </section>
    </div>
  );
}
