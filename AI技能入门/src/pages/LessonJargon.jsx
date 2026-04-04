import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Bot, BookOpen } from 'lucide-react';
import './LessonCommon.css';

// Deterministic pseudo-tokenizer (not random, mimics BPE-like chunking)
// Uses a fixed set of common Chinese word patterns
const COMMON_WORDS = ['人工智能', '机器学习', '深度学习', '大模型', '算法', '数据', '程序员', '非常', '一门', '学科', '有趣', '你好'];

const deterministicTokenize = (text) => {
  if (!text.trim()) return [];
  let remaining = text;
  const result = [];
  while (remaining.length > 0) {
    let matched = false;
    // Try to match longer words first
    for (const word of COMMON_WORDS) {
      if (remaining.startsWith(word)) {
        result.push(word);
        remaining = remaining.slice(word.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Fall back to single character
      result.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }
  return result;
};

const CONTEXT_BOOKS = [
  { title: '一般对话', tokens: '4K', chars: '约 3000 汉字', color: '#6366f1' },
  { title: 'GPT-3.5', tokens: '16K', chars: '约 12000 汉字', color: '#3b82f6' },
  { title: 'Claude 3', tokens: '200K', chars: '约 15 万汉字 (~2 本红楼梦)', color: '#10b981' },
  { title: 'Gemini 1.5', tokens: '1M', chars: '约 75 万汉字 (~10 本红楼梦)', color: '#f59e0b' },
];

export default function LessonJargon() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('你好！人工智能是一门非常有趣的学科。');

  const tokens = deterministicTokenize(inputText);

  const JARGON_CARDS = [
    {
      icon: BookOpen, color: '#3b82f6',
      title: 'LLM（大语言模型）',
      tagline: '专门处理文字的巨无霸',
      content: '用几千个维度的数学概率推算下一个字是什么——这就是"超级文字接龙"。GPT-4、Claude、Kimi 的底座都叫 LLM。',
    },
    {
      icon: Wand2, color: '#10b981',
      title: 'Prompt Engineering（提示词工程）',
      tagline: '普通人的最强技能护城河',
      content: '向 AI "念咒语"的技巧。只要带上 <strong>身份 + 任务 + 格式约束</strong>，你得到的回答质量将碾压随手发一句的小白。',
    },
    {
      icon: Bot, color: '#ec4899',
      title: 'Agent（智能体）',
      tagline: '大脑外接了手脚',
      content: '大模型是"大脑"（能思考），Agent 是"大脑+手脚"（能行动）。帮你查网页、预订机票、操作软件——这是 AI 接下来最重要的方向。',
    },
  ];

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🧅 洋葱第四层</div>
         <h1>大模型时代的"黑话"（当下最实用）</h1>
         <p className="lesson-intro">
            每天在新闻或产品里都会碰到各种英文缩写。对于普通大众来说，掌握最核心的 <strong>5 个</strong>就已经碾压 99% 的朋友圈了。
         </p>
      </header>

      {/* Token Simulator – fixed deterministic */}
      <section className="lesson-section glass-panel" style={{padding: "2rem"}}>
         <h3>📝 Token（词元）：AI 看文字的方式</h3>
         <p className="mt-2 text-gray-300">LLM 不是靠查表回答问题的，而是用<strong>"超级文字接龙"</strong>推算下一个字的概率。它先把文字切成"词元碎片"才能处理。</p>

         <div className="tokenizer-simulator mt-6 mb-4 p-5" style={{background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <h4 className="mb-3">🔬 词元切分模拟器（输入中文体验）</h4>
            <input
              type="text"
              className="w-full p-3 rounded bg-transparent border border-gray-600 text-white focus:outline-none focus:border-blue-500 mb-4"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入一段中文试试..."
            />
            <div className="flex flex-wrap gap-2 min-h-8">
               {tokens.map((token, idx) => (
                 <span key={idx} className="token-chip bg-blue-900/50 border border-blue-500/30 px-2 py-1 rounded text-sm text-blue-200">
                    {token}
                 </span>
               ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 border-t border-white/10 pt-3">
              <span>共 <strong className="text-blue-400">{tokens.length}</strong> 个词元</span>
              <span>原文 <strong className="text-gray-400">{inputText.length}</strong> 个字符</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">注：本模拟器使用简化规则演示分词逻辑，实际模型使用 BPE 算法，计费和计算均以词元为单位。</p>
         </div>
      </section>

      {/* Context Window Visualization */}
      <section className="lesson-section glass-panel mt-8" style={{padding: "2rem"}}>
        <h3 className="mb-2">🧠 上下文窗口（Context Window）：AI 的短期记忆</h3>
        <p className="text-gray-300 text-sm mb-6">这是模型一次能"记住"并处理的最大文字量。超出了，它就会忘掉你最前面说的话。看看不同模型的"记忆容量"有多大差距：</p>
        <div className="space-y-3">
          {CONTEXT_BOOKS.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs w-24 text-right shrink-0 text-gray-400">{item.title}</span>
              <div className="flex-1 bg-black/30 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center px-3 text-xs text-white font-medium transition-all"
                  style={{
                    width: `${[2, 8, 40, 100][i]}%`,
                    background: item.color,
                    minWidth: '60px',
                  }}
                >
                  {item.tokens}
                </div>
              </div>
              <span className="text-xs text-gray-400 w-44 shrink-0">{item.chars}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">📚《红楼梦》全本约 73 万字，作为参照。</p>
      </section>

      {/* Jargon Cards */}
      <section className="lesson-section mt-10">
         <h3 className="mb-6">🛠️ 其他 3 个必懂黑话</h3>
         <div className="ethics-grid gap-6">
            {JARGON_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="ethics-card glass-panel" style={{borderLeftColor: card.color}}>
                   <div className="ethics-header">
                      <Icon style={{color: card.color}} />
                      <div>
                        <h3 className="text-base m-0 ml-2">{card.title}</h3>
                        <p className="text-xs ml-2 mt-0.5" style={{color: card.color}}>{card.tagline}</p>
                      </div>
                   </div>
                   <p className="text-gray-300 mt-2 text-sm" dangerouslySetInnerHTML={{__html: card.content}}/>
                </div>
              );
            })}
         </div>
      </section>

      <section className="lesson-section footer-nav mt-12">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery/lesson/limits')}>全部读懂了！剥开最后一层：AI 致命弱点</button>
      </section>
    </div>
  );
}
