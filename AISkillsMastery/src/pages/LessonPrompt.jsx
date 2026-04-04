import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, RefreshCw, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

const CRAFT_PARTS = {
  C: { label: 'C — Context 背景', color: '#7c3aed', placeholder: '在什么情况下提问？\n例：我是一名刚创业的电商店主，没有任何市场营销经验…', tips: '给 AI 你的身份、场景和背景信息。AI 没有读心术，你的上下文越清晰，结果越精准。' },
  R: { label: 'R — Role 角色', color: '#2563eb', placeholder: '给 AI 扮演一个专家角色\n例：你是一位有 15 年经验的品牌策略顾问…', tips: '赋予 AI 专家角色，能显著提升输出专业度。角色越具体，效果越好。' },
  A: { label: 'A — Action 行动', color: '#0284c7', placeholder: '你要 AI 具体做什么？\n例：帮我分析并写出 3 个差异化的品牌定位方向…', tips: '用动词开头，明确任务类型（分析/写作/计划/对比/总结…）。' },
  F: { label: 'F — Format 格式', color: '#059669', placeholder: '希望以什么形式输出？\n例：用编号列表输出，每个方向包含：定位一句话、目标用户、核心卖点', tips: '指定输出格式可以让 AI 直接给你可用的内容，而不是杂乱的散文。' },
  T: { label: 'T — Tone 语气', color: '#d97706', placeholder: '期望的语气风格？\n例：语言直白简洁，避免过于学术，像朋友推荐一样的感觉。', tips: '语气决定内容的"温度"。专业/幽默/简洁/严肃/鼓励……都可以明确指定。' },
};

const BAD_GOOD_PAIRS = [
  {
    bad: '帮我写一篇文章',
    good: '你是一位科技自媒体作者。请帮我写一篇面向程序员读者的文章，主题是"为什么你应该学会使用 AI 结对编程"。要求：标题吸引人，正文约 800 字，包含 3 个具体的使用场景案例，语言风格轻松有趣，不要用太多专业术语。',
    issue: '太模糊：没有主题、读者、长度、风格任何信息',
  },
  {
    bad: '分析一下我们的竞争对手',
    good: '你是一位市场分析专家。请从以下 4 个维度分析小红书在中国社交媒体市场的竞争态势：①用户画像 ②核心功能差异 ③变现模式 ④近一年的战略动向。每个维度用 bullet point 列出 3 个关键点，最后给出一句结论。',
    issue: '没说分析哪个竞品、从什么角度、要输出什么格式',
  },
  {
    bad: '给我一些营销建议',
    good: '我正在推广一款面向中小学生家长的 K12 在线英语课程，客单价 2980 元/年，主要渠道是抖音。请给我 5 个可以在本周落地执行的低成本获客建议，每个建议说明：实施步骤、预期效果和注意事项。',
    issue: '没有产品信息、目标群体、渠道、预算任何约束条件',
  },
];

export default function LessonPrompt() {
  const navigate = useNavigate();
  const [craftParts, setCraftParts] = useState({ C: '', R: '', A: '', F: '', T: '' });
  const [assembled, setAssembled] = useState('');
  const [activePair, setActivePair] = useState(0);
  const [copied, setCopied] = useState(false);

  const assembleCraft = () => {
    const parts = [];
    if (craftParts.R) parts.push(`【角色】${craftParts.R.trim()}`);
    if (craftParts.C) parts.push(`【背景】${craftParts.C.trim()}`);
    if (craftParts.A) parts.push(`【任务】${craftParts.A.trim()}`);
    if (craftParts.F) parts.push(`【格式】${craftParts.F.trim()}`);
    if (craftParts.T) parts.push(`【语气】${craftParts.T.trim()}`);
    setAssembled(parts.join('\n\n'));
  };

  const copyAssembled = () => {
    navigator.clipboard.writeText(assembled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">✍️ 模块二：提示词核心心法</div>
        <h1>CRAFT 框架：写出让 AI 秒懂的指令</h1>
        <p className="lesson-intro">
          和 AI 沟通的本质，是<strong style={{color:'#a78bfa'}}>信息传递</strong>。你给的信息越完整、越精准，AI 的输出就越有价值。CRAFT 是一个经过实战验证的 5 要素提示词框架。
        </p>
      </header>

      {/* Bad vs Good Comparator */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">⚡ 先看差距：好坏 Prompt 的天壤之别</h3>
        <div className="flex gap-2 mb-5 flex-wrap">
          {BAD_GOOD_PAIRS.map((p, i) => (
            <button key={i} onClick={() => setActivePair(i)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${activePair === i ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              案例 {i + 1}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-900/15 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-400 font-bold text-sm">❌ 糟糕的 Prompt</span>
            </div>
            <p className="text-sm font-mono text-gray-200 bg-black/40 p-3 rounded-lg mb-3 leading-relaxed">{BAD_GOOD_PAIRS[activePair].bad}</p>
            <p className="text-xs text-red-400"><strong>问题：</strong>{BAD_GOOD_PAIRS[activePair].issue}</p>
          </div>
          <div className="bg-emerald-900/15 border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-400 font-bold text-sm">✅ 高质量的 Prompt</span>
            </div>
            <p className="text-sm font-mono text-gray-200 bg-black/40 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">{BAD_GOOD_PAIRS[activePair].good}</p>
          </div>
        </div>
      </section>

      {/* CRAFT Framework Explainer */}
      <section className="lesson-section mt-10">
        <h3 className="mb-2">🔧 CRAFT 框架：5 个维度组装完美 Prompt</h3>
        <p className="text-gray-400 text-sm mb-6">不是每次都需要5个维度，但理解每个维度能帮你在关键时刻"补全信息缺口"：</p>
        <div className="space-y-3">
          {Object.entries(CRAFT_PARTS).map(([key, part]) => (
            <div key={key} className="p-4 rounded-xl border border-white/5 bg-black/30 flex gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-white text-lg"
                   style={{background: part.color}}>
                {key}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white mb-0.5">{part.label}</h4>
                <p className="text-xs text-gray-400 mb-2">{part.tips}</p>
                <div className="text-xs text-gray-500 italic">" {part.placeholder.split('\n')[1]} "</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CRAFT Builder */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-2">🛠️ 动手实验：用 CRAFT 拼装你的 Prompt</h3>
        <p className="text-gray-400 text-sm mb-5">填写你感兴趣的场景，点击"组装 Prompt"生成可直接复制到 ChatGPT 的完整指令：</p>
        <div className="space-y-4">
          {Object.entries(CRAFT_PARTS).map(([key, part]) => (
            <div key={key}>
              <label className="text-xs font-bold mb-1.5 block" style={{color: part.color}}>{part.label}</label>
              <textarea
                className="w-full bg-black/50 border border-gray-700 text-white text-sm rounded-xl p-3 resize-none focus:outline-none focus:border-violet-500 transition-colors placeholder-gray-600"
                rows={2}
                placeholder={part.placeholder}
                value={craftParts[key]}
                onChange={e => setCraftParts(p => ({...p, [key]: e.target.value}))}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={assembleCraft}
            className="bg-violet-600 hover:bg-violet-500 px-5 py-2 rounded-full text-sm font-bold text-white transition-all flex items-center gap-2">
            <RefreshCw size={15}/> 组装 Prompt
          </button>
        </div>
        {assembled && (
          <div className="mt-5 relative">
            <pre className="bg-black/60 border border-violet-500/30 text-sm text-gray-200 p-4 rounded-xl whitespace-pre-wrap leading-relaxed font-mono">{assembled}</pre>
            <button onClick={copyAssembled}
              className="absolute top-3 right-3 bg-violet-600/80 hover:bg-violet-500 px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1 transition-all">
              {copied ? <><CheckCircle2 size={12}/> 已复制</> : <><Copy size={12}/> 复制</>}
            </button>
          </div>
        )}
      </section>

      {/* Advanced Tips */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🚀 进阶技巧：让 Prompt 效果再翻倍</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: '🎯', title: '给示例（Few-shot）', desc: '在 Prompt 里插入 1-3 个"输入→输出"的示例对，比任何描述都管用。AI 直接学你的格式和风格。', code: '示例：\n输入："天气不好"\n输出方向："灰蒙蒙的天空像倒扣的铁锅..."' },
            { icon: '🔗', title: '链式思考（Chain of Thought）', desc: '在 Prompt 末尾加上"请一步步思考"，让 AI 展示推理过程，能大幅提升复杂问题的准确率。', code: '在解答前，请先列出分析步骤，再给出最终结论。' },
            { icon: '🔄', title: '迭代优化（Iteration）', desc: '一次完美的 Prompt 不存在。策略是：先发——看结果——补充约束——再发。把 AI 当协作者，不断精炼。', code: '试试在回复后追问：\n"你刚才第3点可以展开更多例子吗？"' },
            { icon: '📌', title: '约束边界（Constraint）', desc: '告诉 AI 什么不要做，往往和告诉它要做什么同样重要。明确限制能防止输出偏题或格式混乱。', code: '要求：不要使用官方语气，不要超过 300 字，不要列出显而易见的建议。' },
          ].map((item, i) => (
            <div key={i} className="glass-panel" style={{padding: '1.2rem'}}>
              <h4 className="font-bold text-white flex items-center gap-2 mb-2"><span>{item.icon}</span>{item.title}</h4>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">{item.desc}</p>
              <code className="text-xs text-violet-300 bg-violet-900/20 p-2 rounded-lg block whitespace-pre-wrap">{item.code}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery-pro/lesson/writing')}>
          Prompt 学通！进入 AI 写作加速器 →
        </button>
      </section>
    </div>
  );
}
