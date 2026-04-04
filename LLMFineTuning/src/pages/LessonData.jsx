import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, AlertCircle, CheckCircle2, RefreshCw, Wand2 } from 'lucide-react';
import './LessonCommon.css';

const DATA_FORMATS = [
  {
    name: 'Alpaca 格式',
    desc: '最常见的指令微调格式，Llama、Mistral、Qwen 系列广泛采用',
    template: `{
  "instruction": "将下面的文言文翻译成现代汉语",
  "input": "学而时习之，不亦说乎",
  "output": "学习了知识后经常温习，不是很愉快吗？"
}`,
    color: 'sky',
    pros: ['结构清晰', '支持有/无 input 两种形式', '工具链支持最广'],
    cons: ['不支持多轮对话'],
  },
  {
    name: 'ShareGPT / ChatML 格式',
    desc: '多轮对话格式，适合训练聊天模型，HuggingFace 和 LLaMA-Factory 广泛支持',
    template: `{
  "conversations": [
    {"from": "human", "value": "帮我分析这份财报"},
    {"from": "gpt", "value": "好的，请分享财报内容..."},
    {"from": "human", "value": "这是Q3报告..."},
    {"from": "gpt", "value": "根据Q3数据分析..."}
  ]
}`,
    color: 'cyan',
    pros: ['支持多轮对话', '与主流 Chat 模型对齐', '自然对话流程'],
    cons: ['多轮标注成本高'],
  },
  {
    name: 'DPO 偏好格式',
    desc: '用于 RLHF/DPO 训练的偏好数据格式，包含 chosen（好回答）和 rejected（差回答）',
    template: `{
  "prompt": "Python 如何读取 CSV 文件？",
  "chosen": "推荐使用 pandas：\\nimport pandas as pd\\ndf = pd.read_csv('file.csv')\\n# 功能强大，支持各种参数",
  "rejected": "你可以用 Python 的 open() 函数打开文件..."
}`,
    color: 'violet',
    pros: ['直接表达偏好对比', '与 DPO 训练直接对接', '无需奖励模型'],
    cons: ['标注主观性强', '需要领域专家'],
  },
];

const DATA_QUALITY_RULES = [
  { rule: '多样性', icon: '🌈', desc: '避免重复模式，覆盖目标分布的不同子场景', bad: '100 条都是"翻译古文"任务', good: '翻译、摘要、问答、代码、分析各 20 条' },
  { rule: '准确性', icon: '✅', desc: '输出必须正确无误，尤其是事实类、代码类任务', bad: '代码示例有 Bug，知识存在错误', good: '每条输出经过验证，代码可运行' },
  { rule: '格式一致性', icon: '📐', desc: '相同任务类型保持一致的输出风格和格式', bad: '同类任务有时用 Markdown 列表，有时用段落', good: '建立模板，统一输出格式规范' },
  { rule: '难度分布', icon: '📊', desc: '包含简单、中等、复杂样本，避免过于单一', bad: '全是简单 QA，缺乏复杂推理样本', good: '遵循 2:5:3 的简单:中等:复杂比例' },
  { rule: '毒性过滤', icon: '🛡️', desc: '移除包含有害、偏见、违法内容的样本', bad: '含有歧视性语言、不实信息', good: '通过安全模型 + 人工双重过滤' },
];

const RAW_EXAMPLES = [
  { label: '❌ 低质量样本', text: 'Q: 怎么写代码？\nA: 可以学Python，挺好的。', color: 'red', issues: ['问题过于模糊', '答案无实质内容', '无法复现'] },
  { label: '✅ 高质量样本', text: 'Q: Python中如何高效读取大型CSV文件（>1GB）？\nA: 推荐使用 pandas 的 chunksize 参数分块读取，避免内存溢出：\n```python\nfor chunk in pd.read_csv("large.csv", chunksize=10000):\n    process(chunk)\n```\n这样每次只加载 10,000 行到内存，降低约 95% 的内存占用。', color: 'emerald', issues: ['具体问题场景', '可执行代码示例', '量化性能收益'] },
];

const DATA_SIZES = [
  { size: '< 100 条', signal: '⚠️', rec: '先考虑 RAG + Few-shot，数据太少微调效果不稳定' },
  { size: '100–1,000 条', signal: '🟡', rec: '可以微调，推荐 LoRA，建议专注 1-2 个子任务' },
  { size: '1,000–10,000 条', signal: '✅', rec: '微调甜蜜区，大部分垂直场景都能取得好效果' },
  { size: '10,000–100,000 条', signal: '🚀', rec: '可尝试更多任务混合，考虑全量微调或大 rank LoRA' },
  { size: '> 100,000 条', signal: '🌟', rec: '接近持续预训练规模，可以显著改变模型知识覆盖' },
];

export default function LessonData() {
  const navigate = useNavigate();
  const [activeFormat, setActiveFormat] = useState(0);
  const [activeRule, setActiveRule] = useState(null);
  const [sampleScore, setSampleScore] = useState(null);

  // Simple data quality scorer
  const scoreSample = (text) => {
    let score = 0;
    if (text.length > 100) score += 20;
    if (text.includes('```')) score += 30;
    if (text.match(/\d+/)) score += 15;
    if (text.includes('？') || text.includes('?')) score += 10;
    if (text.length > 300) score += 25;
    return Math.min(score, 100);
  };

  const [customSample, setCustomSample] = useState('');

  const colors = { sky: { border: 'border-sky-500/30', bg: 'bg-sky-900/10', text: 'text-sky-300' }, cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-900/10', text: 'text-cyan-300' }, violet: { border: 'border-violet-500/30', bg: 'bg-violet-900/10', text: 'text-violet-300' } };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">📊 模块二：数据准备篇</div>
        <h1>数据决定微调上限</h1>
        <p className="lesson-intro">
          "垃圾进，垃圾出" 在微调中尤其致命。<strong style={{color:'#7dd3fc'}}>高质量的 1,000 条数据，远胜于低质量的 100,000 条。</strong>这一节系统覆盖数据格式、质量标准、数量需求和数据工程工具链。
        </p>
      </header>

      {/* Data Formats */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">📋 3 种主流训练数据格式（点击切换）</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {DATA_FORMATS.map((f, i) => (
            <button key={i} onClick={() => setActiveFormat(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeFormat === i ? `${colors[f.color].border} ${colors[f.color].bg} ${colors[f.color].text}` : 'border-slate-700 text-slate-400 bg-slate-900/50'}`}>
              {f.name}
            </button>
          ))}
        </div>
        <div className={`p-4 rounded-xl border ${colors[DATA_FORMATS[activeFormat].color].border} ${colors[DATA_FORMATS[activeFormat].color].bg}`}>
          <p className="text-sm text-slate-300 mb-3">{DATA_FORMATS[activeFormat].desc}</p>
          <pre className="code-block text-xs mb-3">{DATA_FORMATS[activeFormat].template}</pre>
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-emerald-400 font-bold mb-1">✅ 优势</p>
              {DATA_FORMATS[activeFormat].pros.map(p => <p key={p} className="text-slate-400">• {p}</p>)}
            </div>
            <div>
              <p className="text-red-400 font-bold mb-1">⚠️ 局限</p>
              {DATA_FORMATS[activeFormat].cons.map(c => <p key={c} className="text-slate-400">• {c}</p>)}
            </div>
          </div>
        </div>
      </section>

      {/* Quality Examples */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">🔍 好数据 vs 坏数据（真实对比）</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {RAW_EXAMPLES.map((ex, i) => (
            <div key={i} className={`p-4 rounded-xl border ${ex.color === 'red' ? 'border-red-500/30 bg-red-900/8' : 'border-emerald-500/30 bg-emerald-900/8'}`}>
              <p className={`font-bold text-sm mb-2 ${ex.color === 'red' ? 'text-red-300' : 'text-emerald-300'}`}>{ex.label}</p>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap mb-3 bg-black/30 p-2 rounded-lg leading-relaxed">{ex.text}</pre>
              <div>
                <p className={`text-xs font-bold mb-1 ${ex.color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>{ex.color === 'red' ? '存在的问题：' : '质量亮点：'}</p>
                {ex.issues.map(issue => <p key={issue} className="text-xs text-slate-500">• {issue}</p>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Rules */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-4">📏 5 条数据质量铁律（点击展开解析）</h3>
        <div className="space-y-2">
          {DATA_QUALITY_RULES.map((r, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-700/50 bg-slate-900/30 cursor-pointer hover:border-sky-500/30 transition-all"
                 onClick={() => setActiveRule(activeRule === i ? null : i)}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{r.icon}</span>
                <span className="font-bold text-slate-200 text-sm">{r.rule}</span>
                <span className="text-xs text-slate-500 flex-1">{r.desc}</span>
              </div>
              {activeRule === i && (
                <div className="mt-3 grid md:grid-cols-2 gap-2 fade-in">
                  <div className="bg-red-900/15 border border-red-500/20 rounded-lg p-2.5">
                    <p className="text-red-400 text-xs font-bold mb-1">❌ 反例</p>
                    <p className="text-xs text-slate-400">{r.bad}</p>
                  </div>
                  <div className="bg-emerald-900/15 border border-emerald-500/20 rounded-lg p-2.5">
                    <p className="text-emerald-400 text-xs font-bold mb-1">✅ 正例</p>
                    <p className="text-xs text-slate-400">{r.good}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Data Size Guide */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">📈 数据量需求参考指南</h3>
        <div className="space-y-2">
          {DATA_SIZES.map((d, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/40">
              <code className="text-sky-300 text-sm font-bold w-36 shrink-0">{d.size}</code>
              <span className="text-xl shrink-0">{d.signal}</span>
              <p className="text-sm text-slate-400">{d.rec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Quality Scorer */}
      <section className="lesson-section glass-panel mt-8">
        <h3 className="mb-3">🧪 数据样本质量评估器（交互体验）</h3>
        <p className="text-slate-500 text-sm mb-4">粘贴一条训练样本文本，AI 会基于多个维度给出质量评分参考：</p>
        <textarea className="w-full bg-black/50 border border-slate-700 text-slate-200 text-sm rounded-xl p-4 resize-none focus:outline-none focus:border-sky-500 placeholder-slate-600 font-mono"
          rows={5} placeholder={'粘贴你的训练样本...\n例：Q: 如何实现... A: 使用以下方法...'}
          value={customSample} onChange={e => { setCustomSample(e.target.value); setSampleScore(null); }}/>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => setSampleScore(scoreSample(customSample))}
            disabled={!customSample}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all">
            <Wand2 size={14}/> 评估质量
          </button>
          {sampleScore !== null && (
            <div className="flex items-center gap-3 fade-in">
              <div className="flex gap-1">
                {[20,40,60,80,100].map(threshold => (
                  <div key={threshold} className={`w-8 h-2 rounded-full ${sampleScore >= threshold ? 'bg-sky-400' : 'bg-slate-700'}`}/>
                ))}
              </div>
              <span className={`text-sm font-bold ${sampleScore >= 80 ? 'text-emerald-400' : sampleScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {sampleScore}分 — {sampleScore >= 80 ? '质量良好 ✅' : sampleScore >= 50 ? '可以改进 ⚠️' : '需要优化 ❌'}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/llm-finetuning-mastery/lesson/sft')}>
          数据就绪！开始 SFT 监督微调 →
        </button>
      </section>
    </div>
  );
}
