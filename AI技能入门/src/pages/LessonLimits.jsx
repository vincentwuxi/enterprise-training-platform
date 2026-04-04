import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TriangleAlert, EyeOff, PackageOpen, PlayCircle, CheckCircle, XCircle, Trophy } from 'lucide-react';
import './LessonCommon.css';

const HALLUCINATION_CASES = [
  {
    scenario: '引用法庭判决',
    quote: '美国律师 Michael Cohen 用 ChatGPT 起草法律文件，AI 捏造了多个"从未存在的法庭案件"作为判例引用，最终被法官当庭批评。',
    lesson: '法律、医学等高风险领域，AI 的任何引用必须人工核查原始出处。',
  },
  {
    scenario: '学术论文造假',
    quote: 'ChatGPT 在被要求推荐学术文献时，会一本正经地生成"看起来很真实"的论文标题、作者和期刊名，但这些论文根本不存在。',
    lesson: '引用任何 AI 给出的论文或数据，务必去 Google Scholar 搜索验证原文。',
  },
];

const QUIZ = [
  {
    q: '下列哪个说法最准确？',
    options: ['AI 就等于机器学习', '深度学习是机器学习的一个子集', '生成式 AI 比深度学习更基础', 'AGI 已经实现了'],
    answer: 1,
    explain: 'ML（机器学习）⊇ DL（深度学习）⊇ 应用方向（如 GenAI），是层层包含的关系。',
  },
  {
    q: '训练 GPT-4 这样的大模型主要消耗的是什么？',
    options: ['大量人工标注员的时间', '海量高质量文本数据 + 巨量 GPU 算力 + 庞大资金', '只需要一台普通电脑跑几天', '主要靠算法，不需要太多数据'],
    answer: 1,
    explain: 'AI 的"三驾马车"是数据（食材）+ 算法（菜谱）+ 算力（灶台），缺一不可，训练成本动辄千万美元。',
  },
  {
    q: '强化学习最核心的机制是什么？',
    options: ['给 AI 海量带标注的练习册', '没有任何数据，让 AI 全靠逻辑推理', '在环境中通过"奖励/惩罚"信号让 AI 不断试错学习', '无监督地自动聚类发现规律'],
    answer: 2,
    explain: '强化学习像"训狗"，做对了发饼干（奖励），做错了扣分（惩罚），AI 在反复试错中自己找到最优策略。',
  },
  {
    q: '大语言模型（LLM）说"幻觉"是指什么？',
    options: ['模型回答速度太慢', '模型一本正经地编造看似合理但实际不存在的信息', '模型无法理解图片', '模型只在特定时间段可用'],
    answer: 1,
    explain: 'LLM 是"文字接龙"机器，不知道答案时也会"流畅地续写"出错误内容，而不是说"我不知道"。这是当前最大的隐患。',
  },
  {
    q: '当 AI 给出一个重要的法律或医学建议时，你应该：',
    options: ['直接采用，AI 比人更精准', '截屏发朋友圈，AI 说的都是干货', '将其作为参考起点，但一定要去原始权威来源核查验证', '换一个 AI 工具再问一遍，取平均值'],
    answer: 2,
    explain: '幻觉 + 偏见 + 截止日期等多重局限，决定了 AI 在高风险领域只能作为"助手"，不能作为"仲裁者"。人工核查不可省略。',
  },
];

export default function LessonLimits() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (qi, ai) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qi]: ai }));
  };

  const score = QUIZ.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🧅 洋葱第五层</div>
         <h1>AI 的局限与风险（保持清醒认知）</h1>
         <p className="lesson-intro">
            不要盲目神化 AI，任何颠覆性技术都伴随着巨大的阴暗面。了解底线和短板，你才是一个合格的"驾驶员"。
         </p>
      </header>

      <section className="lesson-section mt-8">
         <div className="cooking-grid">
            <div className="cooking-card glass-panel" style={{borderTop: "3px solid #ef4444"}}>
               <div className="cooking-header">
                  <TriangleAlert className="text-red-400" />
                  <h3>1. 幻觉 (Hallucination)</h3>
               </div>
               <p className="font-bold text-red-300">绝不可以作为事实真理机！</p>
               <p className="mt-2">因为它是做文字接龙的。当你问它偏门冷词，它<strong>死活不会承认自己不懂</strong>，它会一本正经胡说八道地瞎编古诗词的下半句给你。关键领域一定要人工核查！</p>
            </div>

            <div className="cooking-card glass-panel" style={{borderTop: "3px solid #f59e0b"}}>
               <div className="cooking-header">
                  <EyeOff className="text-yellow-400" />
                  <h3>2. 偏见 (Bias)</h3>
               </div>
               <p className="font-bold text-yellow-300">它戴着全人类积累的有色眼镜。</p>
               <p className="mt-2">它的知识全来自互联网。历史上的歧视数据如果没删干净，AI 判断简历时就会悄悄偏好特定群体，抛弃其他求职者。<strong>别把你的重大命运交由它拍板。</strong></p>
            </div>

            <div className="cooking-card glass-panel" style={{borderTop: "3px solid #8b5cf6"}}>
               <div className="cooking-header">
                  <PackageOpen className="text-purple-400" />
                  <h3>3. 黑盒效应 (Black Box)</h3>
               </div>
               <p className="font-bold text-purple-300">最顶级的科学家也拆不开的魔盒。</p>
               <p className="mt-2">几千亿级别的参数网络纠缠，算出了极度准确的结果，但人类<strong>无法解释</strong>"它具体是依据哪串神经元推出来的"。结果无法被验证和追溯！</p>
            </div>
         </div>
      </section>

      {/* Hallucination real cases */}
      <section className="lesson-section glass-panel mt-10" style={{padding: "1.5rem"}}>
        <h3 className="mb-4 text-red-300">⚠️ 幻觉翻车真实案例（引以为戒）</h3>
        <div className="space-y-4">
          {HALLUCINATION_CASES.map((c, i) => (
            <div key={i} className="p-4 rounded-xl bg-red-900/10 border border-red-500/20">
              <p className="text-sm font-bold text-red-300 mb-1">📋 场景：{c.scenario}</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-2">"{c.quote}"</p>
              <p className="text-xs text-yellow-400">💡 教训：{c.lesson}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next steps */}
      <section className="lesson-section glass-panel mt-10" style={{padding: "2rem", borderLeft: "4px solid #10b981", background: "rgba(16, 185, 129, 0.05)"}}>
         <h2 className="flex items-center gap-3 text-2xl mb-6">
            <PlayCircle className="text-green-500" size={32}/>
            初学者的下一步行动建议
         </h2>
         <ol className="text-base" style={{lineHeight: '2', paddingLeft: '1.5rem', color: 'var(--text-secondary)'}}>
            <li className="mb-3">
              <strong className="text-white">先当"体验官"，别急着写代码：</strong>
              先去注册 Kimi、豆包、ChatGPT，在用中感受什么是幻觉，什么是好 Prompt。
            </li>
            <li className="mb-3">
              <strong className="text-white">在折腾中学习：</strong>
              每天让 AI 帮你做一件真实的工作，感受它的能力上限和局限。
            </li>
            <li>
              <strong className="text-white">观看神级科普课：</strong>
              吴恩达（Andrew Ng）教授的 <a href="https://www.bilibili.com/search?keyword=吴恩达+AI+for+Everyone" target="_blank" rel="noopener noreferrer" className="text-green-400 underline hover:text-green-300">《AI for Everyone》（B 站搜索）</a>，全球公认最好的零基础 AI 启蒙课。
            </li>
         </ol>
      </section>

      {/* Final Quiz */}
      <section className="lesson-section mt-12">
        <h2 className="text-2xl mb-2">🎯 洋葱通关测验</h2>
        <p className="text-gray-400 text-sm mb-8">恭喜你剥完了全部 5 层！用 5 道题验证一下你的学习成果：</p>

        {QUIZ.map((q, qi) => (
          <div key={qi} className="glass-panel p-6 rounded-xl mb-5">
            <p className="font-medium mb-4 text-white"><span className="text-gray-500 mr-2">Q{qi + 1}.</span>{q.q}</p>
            <div className="space-y-2">
              {q.options.map((opt, ai) => {
                const isSelected = answers[qi] === ai;
                const isCorrect = q.answer === ai;
                let style = 'border-white/10 bg-black/20 text-gray-300';
                if (submitted) {
                  if (isCorrect) style = 'border-green-500/50 bg-green-900/20 text-green-200';
                  else if (isSelected && !isCorrect) style = 'border-red-500/50 bg-red-900/20 text-red-200';
                } else if (isSelected) {
                  style = 'border-amber-500/50 bg-amber-900/20 text-amber-200';
                }
                return (
                  <button key={ai} onClick={() => handleAnswer(qi, ai)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex items-start gap-2 ${style}`}>
                    <span className="font-bold shrink-0 mt-0.5">{String.fromCharCode(65+ai)}.</span>
                    <span>{opt}</span>
                    {submitted && isCorrect && <CheckCircle size={16} className="text-green-400 shrink-0 ml-auto mt-0.5"/>}
                    {submitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 shrink-0 ml-auto mt-0.5"/>}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-3 p-3 rounded bg-blue-900/20 border border-blue-500/20 text-xs text-blue-200">
                💡 <strong>解析：</strong>{q.explain}
              </div>
            )}
          </div>
        ))}

        {!submitted ? (
          <div className="flex justify-center">
            <button onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < QUIZ.length}
              className="px-8 py-3 rounded-lg font-medium text-white disabled:opacity-40 transition-all"
              style={{background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)'}}>
              提交答案，查看我得了几分！
            </button>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-xl text-center" style={{borderTop: '3px solid #10b981'}}>
            <Trophy size={40} className="mx-auto mb-3 text-emerald-400"/>
            <h3 className="text-2xl font-bold text-white">答对 {score} / {QUIZ.length} 题</h3>
            <p className="text-gray-300 mt-2">
              {score === 5 ? '🎉 满分通关！这颗洋葱被你彻底剥透了！你已是 AI 扫盲界的明白人！' :
               score >= 3 ? '🌟 优秀！大部分核心概念已经建立，继续保持批判性思维！' :
               '💪 还有一些概念需要巩固，建议回看对应的洋葱层再来一次！'}
            </p>
          </div>
        )}
      </section>

      <section className="lesson-section footer-nav mt-8">
        <button className="nav-btn next finish-course" onClick={() => navigate('/dashboard')}>🎉 恭喜你完整剥开了这颗 AI 洋葱！返回毕业中心</button>
      </section>
    </div>
  );
}
