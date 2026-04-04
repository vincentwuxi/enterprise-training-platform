import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, FileCode2, Cpu, ChefHat, Activity, Zap } from 'lucide-react';
import './LessonCommon.css';

const COOKING_ITEMS = [
  {
    icon: Database, color: '#3b82f6',
    title: '1. 数据 (Data) = 食材',
    desc: 'AI 的燃料。没有海量的高质量数据，AI 什么也学不到。行业内有句绝对名言：',
    highlight: 'Garbage in, garbage out（垃圾入，垃圾出）',
    highlightColor: 'text-blue-300',
    extra: '训练 GPT-4 使用了约 45TB 文本，相当于 3000 万本书。',
  },
  {
    icon: FileCode2, color: '#8b5cf6',
    title: '2. 算法 (Algorithm) = 菜谱',
    desc: '背后的数学公式或逻辑步骤。算法就像厨师长传下来的秘籍，告诉计算机拿到这堆食材后，应该按照什么步骤进行翻炒提取规律。',
    extra: 'Transformer 是目前大模型最核心的算法架构，于 2017 年 Google 提出。',
  },
  {
    icon: Cpu, color: '#ef4444',
    title: '3. 算力 (Compute) = 灶台火候',
    desc: '处理海量数据的能力。目前深度学习极度依赖显卡（GPU/英伟达），这就是 AI 时代的工业燃气灶，让并行计算爆发。',
    extra: '训练 GPT-4 花费约 1 亿美元，耗电量相当于给一个普通家庭供电超过 300 年。',
  },
  {
    icon: ChefHat, color: '#10b981',
    title: '4. 模型 (Model) = 成品菜',
    desc: '算法（菜谱）把海量数据（食材）在算力（灶台）上炮制之后，提炼出的规律结晶！比如 ChatGPT 就是一份做好的顶级浓汤，供你随叫随到地品尝。',
    extra: 'GPT-4 有约 1.8 万亿参数，相当于人脑神经突触数量的 100 倍。',
  },
];

export default function LessonCooking() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('training');

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🧅 洋葱第二层</div>
         <h1>AI 是如何打造出来的？（底层运作）</h1>
         <p className="lesson-intro">
            大模型看起来像魔法，但其实像炒菜。我们可以用<strong>"做菜"</strong>来极其生动地比喻 AI 的制造和运作机制。
         </p>
      </header>

      <section className="lesson-section mt-6">
         <div className="cooking-grid">
            {COOKING_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="cooking-card glass-panel" style={{borderTop: `3px solid ${item.color}`}}>
                   <div className="cooking-header">
                      <Icon style={{color: item.color}} />
                      <h3>{item.title}</h3>
                   </div>
                   <p>{item.desc}{item.highlight && <><br/><strong className={item.highlightColor}>{item.highlight}</strong></>}</p>
                   <p className="text-xs mt-3 text-gray-400 border-t border-white/10 pt-2">💡 {item.extra}</p>
                </div>
              );
            })}
         </div>
      </section>

      <section className="lesson-section glass-panel mt-12" style={{padding: "2rem"}}>
         <h3>⚔️ 训练 VS 推理：切换感受</h3>
         <p className="text-gray-400 text-sm mb-6">这是 AI 运作中最关键的两个阶段，成本和速度截然不同：</p>

         <div className="flex gap-3 mb-6">
           <button onClick={() => setMode('training')}
             className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'training' ? 'border-orange-500/50 bg-orange-900/20 text-orange-200' : 'border-white/10 bg-black/20 text-gray-400'}`}>
             🔥 训练 (Training)
           </button>
           <button onClick={() => setMode('inference')}
             className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'inference' ? 'border-yellow-500/50 bg-yellow-900/20 text-yellow-200' : 'border-white/10 bg-black/20 text-gray-400'}`}>
             ⚡ 推理 (Inference)
           </button>
         </div>

         {mode === 'training' ? (
           <div className="p-5 rounded-xl bg-orange-900/10 border border-orange-500/20">
             <h4 className="text-orange-300 mb-3 flex items-center gap-2"><Activity size={18}/> 训练阶段</h4>
             <p className="text-gray-300 leading-relaxed">AI 在数据中心里<strong>疯狂"啃书"</strong>、消耗几千张 GPU 显卡反复校对学习，历时数月的过程。</p>
             <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
               <div className="bg-black/30 p-3 rounded-lg"><div className="text-2xl mb-1">⏱️</div><div className="text-orange-300 font-bold">耗时</div><div className="text-gray-400">数周至数月</div></div>
               <div className="bg-black/30 p-3 rounded-lg"><div className="text-2xl mb-1">💰</div><div className="text-orange-300 font-bold">成本</div><div className="text-gray-400">数百万~数亿美元</div></div>
               <div className="bg-black/30 p-3 rounded-lg"><div className="text-2xl mb-1">⚙️</div><div className="text-orange-300 font-bold">算力</div><div className="text-gray-400">数千块顶级 GPU</div></div>
             </div>
           </div>
         ) : (
           <div className="p-5 rounded-xl bg-yellow-900/10 border border-yellow-500/20">
             <h4 className="text-yellow-300 mb-3 flex items-center gap-2"><Zap size={18}/> 推理阶段</h4>
             <p className="text-gray-300 leading-relaxed">AI 学成"出山"后，你向它提问，它<strong>立刻调取已有知识</strong>给出答案的过程。就像向读破万卷书的天才请教。</p>
             <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
               <div className="bg-black/30 p-3 rounded-lg"><div className="text-2xl mb-1">⚡</div><div className="text-yellow-300 font-bold">速度</div><div className="text-gray-400">毫秒~数秒</div></div>
               <div className="bg-black/30 p-3 rounded-lg"><div className="text-2xl mb-1">💲</div><div className="text-yellow-300 font-bold">成本</div><div className="text-gray-400">极低（亿分之一训练成本）</div></div>
               <div className="bg-black/30 p-3 rounded-lg"><div className="text-2xl mb-1">🖥️</div><div className="text-yellow-300 font-bold">算力</div><div className="text-gray-400">普通服务器即可</div></div>
             </div>
           </div>
         )}
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery/lesson/learning')}>懂了！剥开第三层：机器怎么上课？</button>
      </section>
    </div>
  );
}
