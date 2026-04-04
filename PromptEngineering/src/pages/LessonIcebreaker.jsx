import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import './LessonCommon.css';

const MODELS = [
  { name: 'ChatGPT (GPT-4o)', company: 'OpenAI', emoji: '🟢', color: '#10a37f', strength: '代码辅助 / 通用强', best: '编程 / 多模态理解' },
  { name: 'Claude 3.5 Sonnet', company: 'Anthropic', emoji: '🟠', color: '#cc785c', strength: '长文推理 / 遵循指令', best: '长文写作 / 安全合规' },
  { name: 'Gemini Pro', company: 'Google', emoji: '🔵', color: '#4285f4', strength: '多模态 / Google 生态', best: '图片理解 / 搜索联动' },
  { name: 'Kimi (月之暗面)', company: '国内', emoji: '🇨🇳', color: '#6366f1', strength: '超长上下文 / 中文理解', best: '分析超长 PDF / 本地化场景' },
  { name: '豆包 (字节)', company: '国内', emoji: '🫛', color: '#f43f5e', strength: '创意内容 / 中文生成', best: '文案创作 / 日常对话' },
  { name: '通义千问 (阿里)', company: '国内', emoji: '☁️', color: '#f59e0b', strength: '企业知识库 / 工具调用', best: '企业内部接入 / 开发集成' },
];

const badPrompt = '帮我写个活动方案';
const goodPrompt = `# 角色设定
你是一位有10年企业品牌活动经验的资深策划总监。

# 背景信息
活动主题为「Q3 销售冲刺誓师大会」，参与人员约 80 人，
时长 2 小时，场地为公司大型会议室。

# 任务
请为我输出一份完整的活动方案，包含：
1. 活动流程（精确到分钟）
2. 互动环节设计（至少 2 个）
3. 主持人话术参考

# 格式要求
使用 Markdown 列表格式，突出每个环节的目的。`;

export default function LessonIcebreaker() {
  const navigate = useNavigate();
  const [showGood, setShowGood] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🧊 模块一：认知破冰</div>
         <h1>把它当超级实习生！</h1>
         <p className="lesson-intro">
            大模型不是全知全能的神，打破迷信，把它当作一个"刚毕业但博览群书的超级实习生"。你的指令质量，决定它的回答质量。
         </p>
      </header>

      <section className="lesson-section glass-panel">
         <h3 className="flex items-center gap-2 mb-6"><Zap className="text-yellow-400"/> 什么是大语言模型 (LLM)？</h3>
         <p>极简原理解析：高维度的<strong>"文字接龙"</strong> (Next Token Prediction)。它不具备真正的主观意识，所有的回答只是基于它阅读过的千亿级网页，推算出最有可能出现的下一个字词。</p>
         
         <div className="mt-8 flex gap-6 flex-wrap">
            <div className="flex-1 bg-black/20 p-6 rounded-xl border border-white/10">
               <h4 className="text-blue-400 mb-2">✅ 舒适区（它擅长什么）</h4>
               <ul className="list-disc pl-5 text-gray-300">
                  <li>总结归纳几万字的冗长会议纪要</li>
                  <li>格式转换（将杂乱文本转为标准 JSON/Excel）</li>
                  <li>角色扮演（扮演乔布斯点评产品）</li>
                  <li>发散创意（给活动想 10 个破冰点子）</li>
               </ul>
            </div>
            <div className="flex-1 bg-black/20 p-6 rounded-xl border border-white/10">
               <h4 className="text-red-400 mb-2">❌ 局限区（千万避坑）</h4>
               <ul className="list-disc pl-5 text-gray-300">
                  <li><strong>机器幻觉</strong>：一本正经地胡说八道！</li>
                  <li>复杂数学逻辑：接龙算不出微积分。</li>
                  <li>实时信息：训练数据通常停留在几个月前。</li>
               </ul>
            </div>
         </div>
      </section>

      <section className="lesson-section glass-panel mt-10">
         <h3 className="flex items-center gap-2"><AlertTriangle className="text-red-400"/> GIGO 铁律：垃圾入，垃圾出</h3>
         <p className="mt-4 text-lg text-gray-300">为什么同一款 AI，不同人用效果天差地别？一切取决于你的 Prompt 质量。亲眼看看差距有多大：</p>

         <div className="mt-6 bg-black/20 rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
               <span className="text-sm font-mono text-gray-400">{showGood ? '✅ 结构化好 Prompt' : '❌ 随手一句烂 Prompt'}</span>
               <button
                  onClick={() => setShowGood(!showGood)}
                  className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
               >
                  {showGood ? <ToggleRight className="text-green-400" size={20}/> : <ToggleLeft className="text-gray-500" size={20}/>}
                  {showGood ? '切换看烂 Prompt' : '切换看好 Prompt'}
               </button>
            </div>
            <pre className={`text-sm p-4 rounded-lg font-mono whitespace-pre-wrap leading-relaxed transition-colors ${
               showGood ? 'bg-green-900/20 border border-green-500/30 text-green-200' : 'bg-red-900/20 border border-red-500/30 text-red-200'
            }`}>{showGood ? goodPrompt : badPrompt}</pre>
            {!showGood && <p className="text-xs text-red-400 mt-3">⚠️ AI 收到这个会给你废话连篇的模板，与你的实际需求毫无关联。点击上方按钮看看正确姿势！</p>}
            {showGood && <p className="text-xs text-green-400 mt-3">✅ AI 收到这个会精确输出格式化方案！这就是 Prompt Engineering 的价值所在。</p>}
         </div>
      </section>

      <section className="lesson-section mt-12">
         <h3 className="mb-6">🏆 主流大模型选手图鉴</h3>
         <div className="grid md:grid-cols-3 gap-4">
            {MODELS.map(m => (
               <div key={m.name} className="glass-panel p-4 hover:-translate-y-1 transition-transform cursor-default" style={{borderTop: `3px solid ${m.color}`}}>
                  <div className="flex items-center gap-2 mb-3">
                     <span className="text-2xl">{m.emoji}</span>
                     <div>
                        <div className="font-bold text-sm text-white">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.company}</div>
                     </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-1"><span className="text-gray-300">核心优势：</span>{m.strength}</p>
                  <p className="text-xs text-gray-400"><span className="text-gray-300">最适场景：</span>{m.best}</p>
               </div>
            ))}
         </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/prompt-engineering-camp/lesson/frameworks')}>认知已刷新，进入万能心法篇！</button>
      </section>
    </div>
  );
}
