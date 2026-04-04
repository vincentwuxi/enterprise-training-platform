import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

const TOKEN_SENTENCE = "大 语 言 模 型 不 是 在 思 考 ， 而 是 在 预 测 下 一 个 词";
const TOKENS = TOKEN_SENTENCE.split(' ');

const AI_ABILITIES = [
  { task: '写一封专业的商务回执邮件', can: true, reason: '文本生成是 LLM 的核心能力，在大量邮件语料上训练' },
  { task: '帮我计算 2^100 等于多少', can: false, reason: 'LLM 本质是语言模型，不是计算器。大数运算可能出错，需借助代码解释器工具' },
  { task: '总结这篇20页报告的核心观点', can: true, reason: '长文本摘要是 LLM 的强项，尤其适合提炼要点、简化信息' },
  { task: '预测明天的股票涨跌', can: false, reason: 'AI 没有预知未来的能力。它的"知识"在训练截止日期后停止更新' },
  { task: '将这段中文翻译成法语', can: true, reason: '在多语言语料上训练，翻译质量优秀，尤其是主流语言对之间' },
  { task: '告诉我你真实的感受和情绪', can: false, reason: 'LLM 没有意识和情感。它输出"情感"文字，但这是模式匹配，不是真实体验' },
  { task: '帮我头脑风暴10个产品功能创意', can: true, reason: '创意激发和多角度发散是 LLM 的优势之一' },
  { task: '精准记住我上周告诉你的内容', can: false, reason: '大多数 LLM 只有当前对话的记忆（上下文窗口），无跨会话长期记忆' },
];

const AI_FAMILY = [
  { id: 'ai', label: '🤖 人工智能 (AI)', color: '#7c3aed', sub: '让机器模拟人类智能的技术总称', children: ['ml'] },
  { id: 'ml', label: '📊 机器学习 (ML)', color: '#2563eb', sub: '让机器从数据中自动学习规律', children: ['dl'] },
  { id: 'dl', label: '🧠 深度学习 (DL)', color: '#0284c7', sub: '用神经网络层层提取特征', children: ['llm'] },
  { id: 'llm', label: '💬 大语言模型 (LLM)', color: '#059669', sub: 'GPT/Claude/Gemini 就在这里！', children: [] },
];

export default function LessonFoundation() {
  const navigate = useNavigate();
  const [tokenIdx, setTokenIdx] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState([]);
  const [activeAbility, setActiveAbility] = useState(null);
  const [abilityAnswered, setAbilityAnswered] = useState({});
  const timerRef = useRef(null);

  const startTokenAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setVisibleTokens([]);
    setTokenIdx(-1);
    let i = 0;
    timerRef.current = setInterval(() => {
      setVisibleTokens(prev => [...prev, TOKENS[i]]);
      i++;
      if (i >= TOKENS.length) {
        clearInterval(timerRef.current);
        setIsAnimating(false);
      }
    }, 200);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const guessAbility = (idx, guess) => {
    setAbilityAnswered(prev => ({ ...prev, [idx]: guess }));
    setActiveAbility(idx);
  };

  const allAnswered = Object.keys(abilityAnswered).length === AI_ABILITIES.length;

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🤖 模块一：重新认识 AI</div>
        <h1>拆解 LLM 的魔法</h1>
        <p className="lesson-intro">
          大多数人对 AI 的认知要么过分神化，要么过分贬低。这一节的目标只有一个：<strong style={{color:'#a78bfa'}}>建立一个准确的 AI 认知地图</strong>——知道它是什么，能做什么，做不了什么。
        </p>
      </header>

      {/* AI Family Tree */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">🪆 AI 大家族：理清套娃关系</h3>
        <p className="text-gray-400 text-sm mb-6">很多人混淆 AI、机器学习、深度学习和大模型的关系。它们是<strong className="text-white">层层嵌套</strong>的关系：</p>
        <div className="space-y-3">
          {AI_FAMILY.map((item, i) => (
            <div key={item.id} className="flex items-start gap-4" style={{ paddingLeft: `${i * 28}px` }}>
              <div className="h-8 w-1 rounded-full mt-1 shrink-0" style={{background: item.color, opacity: 0.6}}></div>
              <div className="flex-1 p-4 rounded-xl border" style={{borderColor: item.color + '40', background: item.color + '10'}}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{item.label}</span>
                  {i === AI_FAMILY.length - 1 && <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">你正在学的</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Token Animation */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-2">🎲 LLM 的核心秘密：它在"猜"下一个词</h3>
        <p className="text-gray-400 text-sm mb-5">
          ChatGPT 不是在理解你，它在做一件事——<strong className="text-white">根据前面所有词的概率，预测最可能出现的下一个词</strong>。这个过程叫"自回归生成"，每次生成一个 Token（词或词片段）。
        </p>
        <div className="bg-black/50 border border-gray-700 rounded-xl p-6 mb-4 min-h-[100px] flex flex-wrap gap-2 items-center">
          {visibleTokens.length === 0 && !isAnimating && (
            <p className="text-gray-600 text-sm w-full text-center">点击下方按钮，观看 Token 逐个生成的过程 ↓</p>
          )}
          {visibleTokens.map((token, i) => (
            <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
              style={{
                background: `hsl(${(i * 30) % 360}, 60%, 25%)`,
                border: `1px solid hsl(${(i * 30) % 360}, 60%, 40%)`,
                animation: 'tokenAppear 0.2s ease forwards'
              }}>
              {token}
            </span>
          ))}
          {isAnimating && <span className="w-3 h-5 bg-violet-500 animate-pulse rounded-sm"></span>}
        </div>
        <div className="flex gap-3">
          <button onClick={startTokenAnimation}
            className="bg-violet-600 hover:bg-violet-500 px-5 py-2 rounded-full text-sm font-bold text-white transition-all flex items-center gap-2">
            <Zap size={16}/> {isAnimating ? 'Token 生成中...' : (visibleTokens.length > 0 ? '🔄 再来一遍' : '▶ 开始 Token 生成演示')}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">💡 "Token" 不等于"字"。"Prompt Engineering" 可能被分成 ["Prompt", " Eng", "ineering"] 三个 Token</p>
      </section>

      {/* Ability Boundary Test */}
      <section className="lesson-section mt-10">
        <h3 className="mb-2">🧪 AI 能力边界测试：你猜 AI 能做到吗？</h3>
        <p className="text-gray-400 text-sm mb-6">对于下面每个任务，先猜测 AI 是否能很好地完成，点击后看真实答案：</p>
        <div className="grid md:grid-cols-2 gap-3">
          {AI_ABILITIES.map((item, i) => {
            const answered = abilityAnswered[i] !== undefined;
            const userGuess = abilityAnswered[i];
            const correct = answered && (userGuess === item.can);
            return (
              <div key={i} className={`p-4 rounded-xl border transition-all ${answered ? (item.can ? 'border-emerald-500/40 bg-emerald-900/10' : 'border-red-500/40 bg-red-900/10') : 'border-white/10 bg-black/30 hover:border-white/20'}`}>
                <p className="text-sm text-gray-200 mb-3">{item.task}</p>
                {!answered ? (
                  <div className="flex gap-2">
                    <button onClick={() => guessAbility(i, true)} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50 transition-all">✅ AI 能做</button>
                    <button onClick={() => guessAbility(i, false)} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-red-900/30 text-red-300 border border-red-500/30 hover:bg-red-900/50 transition-all">❌ AI 做不好</button>
                  </div>
                ) : (
                  <div>
                    <p className={`text-xs font-bold mb-1 ${item.can ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.can ? '✅ AI 能很好地完成' : '⚠️ AI 做不好这个'}
                      {correct ? ' （你猜对了！）' : ' （颠覆认知？）'}
                    </p>
                    <p className="text-xs text-gray-400">{item.reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {allAnswered && (
          <div className="mt-5 p-4 rounded-xl bg-violet-900/20 border border-violet-500/30 text-center">
            <p className="text-violet-300 font-bold">🎯 能力边界测试完成！理解 AI 的局限，才能更好地驾驭它。</p>
          </div>
        )}
      </section>

      {/* Key Concepts */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">📚 5 个必须知道的核心概念</h3>
        <div className="space-y-3">
          {[
            { term: 'Token', def: 'LLM 处理文本的基本单位，大约 3-4 个汉字或 1.3 个英文单词对应 1 个 Token。Token 数量决定了调用成本和上下文窗口大小。' },
            { term: '上下文窗口 (Context Window)', def: 'LLM 每次能"看到"的最大文本量。GPT-4 是 128K Tokens，Claude 3 是 200K Tokens。超出这个窗口的内容，模型完全看不到。' },
            { term: '幻觉 (Hallucination)', def: 'LLM 有时会"自信地编造"不存在的事实。这是语言模型的固有缺陷，不是 Bug，而是"猜测下一个词"机制的副作用。' },
            { term: '温度 (Temperature)', def: '控制 AI 输出的随机性。Temperature=0 每次输出几乎相同；Temperature=1 更有创意但可能偏题。写代码用低温，写创意用高温。' },
            { term: '系统提示词 (System Prompt)', def: '对话开始前给 AI 设定的"角色与规则"。你每次打开 ChatGPT，它之所以知道自己是 AI 助手，就是系统提示词的作用。' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
              <span className="text-violet-400 font-black text-lg shrink-0 w-6">{i + 1}</span>
              <div>
                <h4 className="font-bold text-white mb-1">{item.term}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.def}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery-pro/lesson/prompt')}>
          认知已重塑！进入提示词核心心法 →
        </button>
      </section>
    </div>
  );
}
