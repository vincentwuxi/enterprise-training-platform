import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, AlertCircle, Check } from 'lucide-react';
import './LessonCommon.css';

const EVAL_DIMENSIONS = [
  {
    name: '自动化 Benchmark',
    icon: '🤖',
    desc: '用标准测试集自动评分，快速、客观、可复现',
    methods: [
      { name: 'MMLU', score: '57 topics 专业知识考题', use: '通用知识能力' },
      { name: 'HumanEval', score: 'Python 代码正确率', use: '代码生成能力' },
      { name: 'C-Eval / CMMLU', score: '中文知识理解', use: '中文垂直场景' },
      { name: 'MT-Bench', score: '多轮对话质量评分', use: '对话能力' },
    ],
    color: '#0ea5e9',
  },
  {
    name: 'LLM-as-Judge',
    icon: '🧑‍⚖️',
    desc: '用强大的 LLM（GPT-4/Claude）对模型输出打分，接近人工评估质量',
    methods: [
      { name: '单模型评分', score: '1-10 分打分', use: '快速批量评估' },
      { name: 'A/B 对比', score: '哪个回答更好', use: '微调前后对比' },
      { name: 'G-Eval', score: '多维度打分（流畅性/准确性/相关性）', use: '精细质量分析' },
    ],
    color: '#7c3aed',
  },
  {
    name: '人工评估',
    icon: '👤',
    desc: '最准确但最耗时，用于最终上线前的质量把关',
    methods: [
      { name: 'Elo 评级', score: '两两比较，计算综合排名', use: '多模型排名' },
      { name: '领域专家打分', score: '专业评分标准', use: '专业垂直领域' },
      { name: '用户研究', score: '真实用户满意度', use: '上线前验证' },
    ],
    color: '#059669',
  },
];

const COMMON_PROBLEMS = [
  {
    problem: '灾难性遗忘 (Catastrophic Forgetting)',
    desc: '微调后模型忘记了预训练中学到的通用能力',
    signal: '在旧任务上表现显著下降，原版能回答，微调后不能',
    solution: ['降低学习率（1e-5 级别）', '减少训练 epoch', '混合通用指令数据（如 Alpaca）进行多任务训练', '使用 LoRA 而非全量微调'],
    color: '#ef4444',
  },
  {
    problem: '过拟合 (Overfitting)',
    desc: '模型过度记忆训练数据，泛化能力差',
    signal: 'train loss 低但 val loss 高，训练集样本完全复述，测试集表现差',
    solution: ['增加数据多样性', '减少 epoch', '增大 dropout', '使用更小的 LoRA rank', '检查是否有重复数据'],
    color: '#f97316',
  },
  {
    problem: '奖励欺骗 (Reward Hacking)',
    desc: 'RLHF 训练中模型学会"欺骗"奖励模型而非真正改进',
    signal: '奖励模型分数高但人类评估差，输出变得奉承/重复/夸大',
    solution: ['加强 KL 散度惩罚', '更频繁地更新奖励模型', '使用多个奖励模型集成', '人工定期审查高分输出'],
    color: '#8b5cf6',
  },
  {
    problem: '数据泄漏 (Data Leakage)',
    desc: 'Benchmark 测试题出现在训练集中，导致评分虚高',
    signal: '在标准 benchmark 上得分远超规模相近的模型',
    solution: ['去重：用 MinHash 过滤训练集中的 benchmark 样本', '使用内部 hold-out 测试集', '多个 benchmark 交叉验证'],
    color: '#0891b2',
  },
];

const JUDGE_PROMPT = `你是一个专业的 AI 回答质量评估专家。请评估以下回答的质量。

【问题】{question}
【回答】{response}

请从以下 4 个维度分别打分（1-5 分）：
1. **准确性**: 回答是否正确、无事实错误
2. **完整性**: 是否充分回答了问题
3. **清晰度**: 表达是否清晰易懂
4. **有用性**: 对用户是否真正有帮助

输出格式（JSON）：
{{
  "accuracy": <1-5>,
  "completeness": <1-5>,
  "clarity": <1-5>,
  "helpfulness": <1-5>,
  "total": <平均分>,
  "feedback": "<一句话总结主要问题>"
}}`;

// Interactive scorer
function InteractiveJudge() {
  const [question, setQuestion] = useState('如何用Python实现快速排序？');
  const [response, setResponse] = useState('');
  const [scores, setScores] = useState(null);

  const judge = () => {
    if (!response) return;
    const acc = response.length > 200 && response.includes('def') ? 5 : response.length > 100 ? 4 : 2;
    const comp = response.length > 300 ? 5 : response.length > 150 ? 4 : 3;
    const clarity = response.includes('```') || response.includes('例如') ? 5 : 4;
    const helpfulness = response.includes('python') || response.includes('def') || response.includes('排序') ? 4 : 3;
    const total = ((acc + comp + clarity + helpfulness) / 4).toFixed(1);
    setScores({ accuracy: acc, completeness: comp, clarity, helpfulness, total });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-sky-300 font-bold block mb-1">问题</label>
        <input className="w-full bg-black/50 border border-slate-700 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-sky-500"
          value={question} onChange={e => { setQuestion(e.target.value); setScores(null); }}/>
      </div>
      <div>
        <label className="text-xs text-sky-300 font-bold block mb-1">模型回答（粘贴微调模型的输出）</label>
        <textarea className="w-full bg-black/50 border border-slate-700 text-slate-200 text-sm rounded-xl p-3 resize-none focus:outline-none focus:border-sky-500 font-mono"
          rows={5} placeholder="粘贴你的模型输出..." value={response} onChange={e => { setResponse(e.target.value); setScores(null); }}/>
      </div>
      <button onClick={judge} disabled={!response}
        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-sm font-bold transition-all">
        🧑‍⚖️ LLM-as-Judge 评分
      </button>
      {scores && (
        <div className="mt-3 p-4 bg-sky-900/15 border border-sky-500/30 rounded-xl fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {[['准确性', scores.accuracy], ['完整性', scores.completeness], ['清晰度', scores.clarity], ['有用性', scores.helpfulness]].map(([dim, score]) => (
              <div key={dim} className="text-center bg-black/30 rounded-lg p-2">
                <p className="text-xs text-slate-500">{dim}</p>
                <p className={`text-2xl font-black ${score >= 4 ? 'text-emerald-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{score}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-slate-500 text-sm">综合评分: </span>
            <span className={`text-3xl font-black ${Number(scores.total) >= 4 ? 'text-emerald-400' : Number(scores.total) >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{scores.total}</span>
            <span className="text-slate-500 text-sm"> / 5</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonEval() {
  const navigate = useNavigate();
  const [activeEval, setActiveEval] = useState(0);
  const [activeProblem, setActiveProblem] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">📊 模块七：评估优化篇</div>
        <h1>模型评估：如何量化微调效果？</h1>
        <p className="lesson-intro">
          "我感觉微调后模型好多了" 不是工程结论。<strong style={{color:'#7dd3fc'}}>系统化的评估体系</strong>才能告诉你微调是否成功，在哪里失败，以及如何迭代改进。
        </p>
      </header>

      {/* Eval Dimensions */}
      <section className="lesson-section">
        <h3 className="mb-4">📐 3 层评估体系（点击切换）</h3>
        <div className="flex gap-2 mb-4">
          {EVAL_DIMENSIONS.map((e, i) => (
            <button key={i} onClick={() => setActiveEval(i)}
              className="px-3 py-2 rounded-xl text-sm border font-bold transition-all"
              style={{ background: activeEval===i ? e.color+'20' : 'rgba(15,23,42,0.8)', borderColor: activeEval===i ? e.color+'60' : '#334155', color: activeEval===i ? '#f0f9ff' : '#64748b' }}>
              {e.icon} {e.name}
            </button>
          ))}
        </div>
        <div className="glass-panel">
          <p className="text-sm text-slate-400 mb-4">{EVAL_DIMENSIONS[activeEval].desc}</p>
          <div className="space-y-2">
            {EVAL_DIMENSIONS[activeEval].methods.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                <code className="text-sky-300 text-sm font-bold w-40 shrink-0">{m.name}</code>
                <p className="text-sm text-slate-400 flex-1">{m.score}</p>
                <span className="text-xs text-slate-600 w-24 text-right">{m.use}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Judge */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-3">🧑‍⚖️ LLM-as-Judge 模拟器（动手体验）</h3>
        <p className="text-slate-500 text-sm mb-4">输入一道题和模型回答，体验 LLM Judge 如何从 4 个维度评分：</p>
        <InteractiveJudge/>
        <div className="mt-4">
          <button onClick={() => setShowPrompt(!showPrompt)} className="text-xs text-sky-400 border border-sky-500/30 px-3 py-1 rounded-lg">
            {showPrompt ? '收起' : '查看对应的 Judge Prompt 模板'}
          </button>
          {showPrompt && <pre className="code-block text-xs mt-2 fade-in">{JUDGE_PROMPT}</pre>}
        </div>
      </section>

      {/* Common Problems */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">⚠️ 微调常见失败模式诊断手册（点击展开）</h3>
        <div className="space-y-3">
          {COMMON_PROBLEMS.map((p, i) => (
            <div key={i} className="rounded-xl border cursor-pointer transition-all"
                 style={{borderColor: activeProblem===i ? p.color+'50' : 'rgba(255,255,255,0.06)', background: activeProblem===i ? p.color+'08' : 'rgba(15,23,42,0.6)'}}
                 onClick={() => setActiveProblem(activeProblem===i ? null : i)}>
              <div className="flex items-center gap-4 p-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{background: p.color}}/>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{p.problem}</h4>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </div>
              </div>
              {activeProblem === i && (
                <div className="px-4 pb-4 fade-in">
                  <div className="border-t border-white/5 pt-3 space-y-3">
                    <div className="bg-yellow-900/15 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-yellow-400 font-bold text-xs mb-1">🔍 识别信号</p>
                      <p className="text-xs text-slate-300">{p.signal}</p>
                    </div>
                    <div>
                      <p className="text-emerald-400 font-bold text-xs mb-1">✅ 解决方案</p>
                      {p.solution.map(s => <p key={s} className="text-xs text-slate-400 mb-0.5">• {s}</p>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/llm-finetuning-mastery/lesson/deploy')}>
          评估完毕！进入生产部署篇 →
        </button>
      </section>
    </div>
  );
}
