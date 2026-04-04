import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, Search, FileSpreadsheet } from 'lucide-react';
import './LessonCommon.css';

const ANALYSIS_FRAMEWORKS = [
  {
    name: '5W1H 数据解读框架',
    icon: '🔍',
    desc: '任何数据异常，用这 6 个问题穷举分析视角',
    questions: ['What — 指标发生了什么变化（上升/下降/异常）？', 'When — 什么时间节点开始变化？变化是突然还是持续？', 'Where — 哪些地区、渠道、用户群发生了变化？', 'Who — 哪类用户画像受影响最大？', 'Why — 最可能的原因是什么？有多个假设吗？', 'How — 应该采取什么行动？短期和长期如何处理？'],
  },
  {
    name: 'MECE 数据拆解法',
    icon: '🧩',
    desc: '不交叉、不遗漏地分解指标，找到真正的根因',
    questions: ['第一步：明确总指标（如：本月收入下降 15%）', '第二步：拆分为互斥子指标（新客户收入 vs 老客户收入）', '第三步：判断哪段跌了（如：新客收入跌 40%，老客正常）', '第四步：继续向下拆分（新客 → 渠道：付费广告 vs 自然增长）', '第五步：定位到最小粒度的根因（如：某广告平台 ROI 暴跌）', '第六步：制定针对性的行动方案'],
  },
];

const DATA_PROMPTS = [
  {
    title: '📊 让 AI 解读数据表格',
    scenario: '把 CSV/Excel 数据粘贴给 AI，让它分析规律',
    prompt: `以下是我们上半年各月的销售数据（单位：万元）：
1月: 120, 2月: 95, 3月: 148, 4月: 167, 5月: 189, 6月: 201

请帮我：
1. 识别总体趋势（用一句话说明）
2. 找出明显的异常月份并分析可能原因
3. 计算环比增长率，标注增长最快和最慢的月份
4. 基于趋势，给出7月的大致预测区间（低/中/高三个情景）
5. 给出 2 个改善业绩的数据驱动建议`,
  },
  {
    title: '📈 AI 辅助数据报告撰写',
    scenario: '输入关键数据，让 AI 自动生成分析性文字',
    prompt: `背景：我是某电商平台的数据分析师。以下是上月核心指标：
- DAU：85万（环比+12%，同比-3%）
- 下单转化率：3.2%（行业均值4.1%）
- 客单价：¥247（上月¥231，+6.9%）
- 退款率：8.7%（上月5.2%，+3.5%）
- Top3品类：服装(42%)、美妆(28%)、家居(18%)

请生成一段400字的月度数据解读，要求：
- 先说亮点（用数据支撑）
- 再点出问题（尤其是退款率异常）
- 结尾提出 2 个优先级最高的改善方向
- 语气专业，适合汇报给业务总监`,
  },
  {
    title: '🔎 AI 辅助用户行为分析',
    scenario: '描述用户行为数据，让 AI 提炼洞见',
    prompt: `我们做了一个用户调研（N=500，目标用户为25-35岁职场白领），结论摘要如下：
- 最常使用 AI 工具的场景：写作（67%）、搜索信息（58%）、翻译（45%）
- 使用最大痛点：结果不准确（72%）、需要反复修改（68%）、担心数据隐私（51%）
- 付费意愿：愿意订阅<50元/月(23%)、50-100元(31%)、>100元不愿意(46%)
- 品牌认知：ChatGPT(91%)、文心一言(73%)、Kimi(42%)、Claude(29%)

请从产品策略视角，给出 3 个基于数据的洞见和对应的产品改进建议。`,
  },
];

export default function LessonData() {
  const navigate = useNavigate();
  const [activeFramework, setActiveFramework] = useState(0);
  const [activePrompt, setActivePrompt] = useState(0);
  const [roiInputs, setRoiInputs] = useState({ hours: 10, salary: 25, aiCost: 20 });

  const weeklyTimeSaved = roiInputs.hours;
  const monthlyTimeSaved = weeklyTimeSaved * 4;
  const hourValueRMB = roiInputs.salary;
  const monthlySaving = monthlyTimeSaved * hourValueRMB;
  const aiMonthlyCost = roiInputs.aiCost;
  const netBenefit = monthlySaving - aiMonthlyCost;
  const roi = ((netBenefit / aiMonthlyCost) * 100).toFixed(0);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">📊 模块五：AI 数据分析</div>
        <h1>让 AI 成为你的数据分析师</h1>
        <p className="lesson-intro">
          数据分析不再只是数据团队的专利。<strong style={{color:'#a78bfa'}}>会问对问题，就能从数据中提炼洞见。</strong>这一节教你如何和 AI 共同完成从"原始数据"到"可落地决策"的完整链路。
        </p>
      </header>

      {/* Analysis Framework */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-4">🧠 分析框架：给 AI 的任务加上方法论骨架</h3>
        <p className="text-gray-400 text-sm mb-5">好的数据分析不只是让 AI "看看这份数据有什么规律"，而是给 AI 一套分析框架，让输出有结构、有逻辑：</p>
        <div className="flex gap-2 mb-5">
          {ANALYSIS_FRAMEWORKS.map((f, i) => (
            <button key={i} onClick={() => setActiveFramework(i)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${activeFramework === i ? 'bg-emerald-900/30 border-emerald-500 text-emerald-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {f.icon} {f.name}
            </button>
          ))}
        </div>
        <div className="p-5 bg-black/40 rounded-xl border border-white/5">
          <p className="text-sm text-gray-300 mb-4">{ANALYSIS_FRAMEWORKS[activeFramework].desc}</p>
          <div className="space-y-2">
            {ANALYSIS_FRAMEWORKS[activeFramework].questions.map((q, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-black/20">
                <span className="text-emerald-400 font-bold text-xs mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-sm text-gray-200">{q}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Prompt Templates */}
      <section className="lesson-section mt-10">
        <h3 className="mb-2">📋 数据分析 Prompt 模板库</h3>
        <p className="text-gray-400 text-sm mb-5">3 种最常见的数据分析场景，拿来即用：</p>
        <div className="flex gap-2 flex-wrap mb-5">
          {DATA_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setActivePrompt(i)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${activePrompt === i ? 'bg-blue-900/30 border-blue-500 text-blue-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {p.title}
            </button>
          ))}
        </div>
        <div className="glass-panel">
          <p className="text-xs text-gray-400 mb-3">📌 适用场景：{DATA_PROMPTS[activePrompt].scenario}</p>
          <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed bg-black/40 p-4 rounded-lg">{DATA_PROMPTS[activePrompt].prompt}</pre>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">💰 AI 效率 ROI 计算器</h3>
        <p className="text-gray-400 text-sm mb-5">AI 订阅值不值？用数字说话：</p>
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          <div>
            <label className="text-xs text-gray-400 block mb-2">每周 AI 帮你节省的工作时间（小时）<span className="text-white ml-1 font-bold">{roiInputs.hours}h</span></label>
            <input type="range" min={1} max={40} value={roiInputs.hours}
              onChange={e => setRoiInputs(p => ({...p, hours: +e.target.value}))}
              className="w-full accent-emerald-500"/>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">你的时薪估计（元/小时）<span className="text-white ml-1 font-bold">¥{roiInputs.salary}</span></label>
            <input type="range" min={10} max={200} step={5} value={roiInputs.salary}
              onChange={e => setRoiInputs(p => ({...p, salary: +e.target.value}))}
              className="w-full accent-emerald-500"/>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">AI 工具月订阅费（元）<span className="text-white ml-1 font-bold">¥{roiInputs.aiCost}</span></label>
            <input type="range" min={0} max={300} step={10} value={roiInputs.aiCost}
              onChange={e => setRoiInputs(p => ({...p, aiCost: +e.target.value}))}
              className="w-full accent-emerald-500"/>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { label: '每月节省时间', value: `${monthlyTimeSaved}h`, color: 'blue' },
            { label: '时间等值金额', value: `¥${(monthlyTimeSaved * hourValueRMB).toLocaleString()}`, color: 'emerald' },
            { label: 'AI 月成本', value: `¥${aiMonthlyCost}`, color: 'gray' },
            { label: '月净收益', value: `¥${netBenefit.toLocaleString()}`, color: netBenefit > 0 ? 'violet' : 'red' },
          ].map((item, i) => {
            const colors = { blue: 'border-blue-500/30 bg-blue-900/10 text-blue-300', emerald: 'border-emerald-500/30 bg-emerald-900/10 text-emerald-300', gray: 'border-gray-600/30 bg-gray-900/10 text-gray-300', violet: 'border-violet-500/30 bg-violet-900/10 text-violet-300', red: 'border-red-500/30 bg-red-900/10 text-red-300' };
            return (
              <div key={i} className={`p-3 rounded-xl border ${colors[item.color]}`}>
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="text-xl font-black">{item.value}</p>
              </div>
            );
          })}
        </div>
        <p className="text-center mt-4 text-sm">
          <span className="text-gray-400">投资回报率：</span>
          <span className={`font-black text-xl ml-2 ${netBenefit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{roi}%</span>
          {netBenefit > 0 && <span className="text-emerald-400 text-xs ml-2">🚀 每花 ¥1 在 AI，换回 {(monthlySaving / Math.max(aiMonthlyCost, 1)).toFixed(1)}x 等值时间</span>}
        </p>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery-pro/lesson/automation')}>
          数据满级！进入 AI 自动化工作流篇 →
        </button>
      </section>
    </div>
  );
}
