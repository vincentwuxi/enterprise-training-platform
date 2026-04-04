import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Copy, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

const WRITING_SCENARIOS = [
  {
    id: 'email',
    label: '📧 商务邮件',
    icon: '📧',
    situations: [
      {
        name: '拒绝请求',
        prompt: `你是一位资深职场写作教练。\n请帮我写一封委婉拒绝合作邀约的商务邮件。\n背景：对方是一家小型供应商，提出希望独家合作，但我们有采购多元化的政策要求。\n要求：语气礼貌尊重，给对方留面子，说明原因但不显得强硬，保留未来合作空间。\n格式：标准邮件结构，不超过 200 字。`,
        output: `主题：关于独家合作提案的回复\n\n感谢您对我方公司的信任，以及提出此次独家合作的想法。\n\n经内部评估，考虑到公司目前采购多元化的战略需要，我们暂时无法进行独家合作安排，敬请理解。\n\n这并不影响我们对贵方产品和服务的认可。若未来有合适机会，希望与您进一步探讨合作可能性。\n\n再次感谢您的诚意邀约。\n\n[您的姓名]`
      },
      {
        name: '催款邮件',
        prompt: `职业：账款管理专员。\n请写一封催收 30 天逾期未付款的商务邮件。\n背景：款项金额为 ¥58,000，合同约定付款周期为 30 天，对方可能只是忘了。\n要求：保持专业友好，提醒而非催逼，附上下一步行动要求（确认或支付时间）。`,
        output: `主题：关于 2024Q1 合同款项 — 温馨提醒\n\n您好，\n\n核实我司账务，截至今日，贵方 2024Q1 合同款项（¥58,000）已超出约定付款周期 30 天，尚未入账到账。\n\n理解双方业务繁忙，故以此邮件友情提醒。如款项已处理，还请告知预计到账时间；如遇异常情况，欢迎联系我们协商解决方案。\n\n烦请在本周五（X月X日）前给予确认，感谢您的配合。\n\n[您的姓名] | [职位]`
      }
    ]
  },
  {
    id: 'report',
    label: '📊 工作汇报',
    icon: '📊',
    situations: [
      {
        name: '月度周报',
        prompt: `你是一位职场写作专家。\n帮我把以下凌乱的工作记录整理成一份清晰的月度汇报：\n- 完成了官网改版上线\n- 开了很多会\n- 新媒体账号涨了2000粉\n- 没完成的：Q2预算报告\n- 跟设计部门合作不太顺\n要求：突出成果数据，弱化过程，加入下月计划，格式用【本月完成】【未完成事项】【下月重点】三段。`,
        output: `【本月完成事项】\n• 官方网站改版顺利上线，完成里程碑节点交付\n• 新媒体账号运营成效显著，本月净增粉丝 2,000+，环比增长稳健\n• 与设计部协同推进多项视觉物料需求，积累跨部门协作经验\n\n【未完成事项及说明】\n• Q2 预算报告：受官网改版项目占用较多精力，计划顺延至下月 10 日前完成\n\n【下月工作重点】\n1. 完成 Q2 预算报告并提交审批（目标：5月10日前）\n2. 建立跨部门需求对接机制，提升协作效率\n3. 持续推进新媒体内容，目标新增粉丝 2,500+`
      }
    ]
  },
  {
    id: 'marketing',
    label: '📣 营销文案',
    icon: '📣',
    situations: [
      {
        name: '朋友圈文案',
        prompt: `你是一位擅长情感共鸣的品牌文案师。\n产品：一款有机咖啡豆，来自云南，单次手冲约 15 元，主打"放慢生活节奏"的理念。\n写一条适合老板本人发朋友圈的文案，营造真实感，不要太像广告，适合配上一张窗边咖啡图片。\n语气：温暖治愈，有生活感，不超过 120 字。`,
        output: `周日下午，煮一杯自己的咖啡。\n\n不是为了提神，只是想在这一切开始之前，安静地陪自己待一会儿。\n\n从云南山里来的豆子，闻起来有点青草气，入口有淡淡的柑橘尾调——就像那个地方的早晨一样，慢。\n\n你有多久没有为自己，泡过一杯不赶时间的咖啡了？`
      },
      {
        name: '活动推广',
        prompt: `为一场线下 AI 工具实操工作坊写一个报名页标题和副标题 + 一段不超过 80 字的课程亮点介绍。\n活动特色：6 小时实战，手把手教 ChatGPT/Midjourney/Notion AI，限定 30 人小班。\n目标人群：职场白领，30 岁左右，用 AI 提升工作效率。`,
        output: `标题：6 小时，让 AI 变成你最高效的工作搭档\n副标题：ChatGPT × Midjourney × Notion AI 实操小班，限 30 人，边学边用\n\n📌 课程亮点\n不讲理论，全程实操。带上你真实的工作难题，现场和老师一起用AI拆解。学完即用，走出教室就能提效——这不是又一门"听完就忘"的AI课。`
      }
    ]
  }
];

const WRITING_STYLES = ['📝 正式专业', '😄 轻松幽默', '💪 激励鼓舞', '🎨 文艺感性', '📱 网络流行体'];

export default function LessonWriting() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeSit, setActiveSit] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [copied, setCopied] = useState('');

  const scenario = WRITING_SCENARIOS[activeScenario];
  const situation = scenario.situations[activeSit];

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const WRITING_PROCESS = [
    { step: '1', title: '定义读者与目的', desc: '先问：谁会读这段话？他们读完要做什么行动？目的不同，写法截然不同。', color: '#7c3aed' },
    { step: '2', title: '给 AI 最简模板', desc: '先让 AI 生成初稿。不求完美，求快速拿到可改的内容素材。', color: '#2563eb' },
    { step: '3', title: '精准追问迭代', desc: '"第三段太平淡，可以更有画面感吗？" "结尾改成引发反思的疑问句。"', color: '#0284c7' },
    { step: '4', title: '注入个人风格', desc: 'AI 的初稿是骨架，你的经历、语言习惯、品牌声音是血肉，最后 20% 靠你加工。', color: '#059669' },
  ];

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">✍️ 模块三：AI 写作加速器</div>
        <h1>10 倍写作效能：从空白到爆款</h1>
        <p className="lesson-intro">
          写作是 AI 当前<strong style={{color:'#a78bfa'}}>最成熟的应用场景</strong>。不是让 AI 替代你写作，而是让 AI 承担"从零到60分"的劳动，你专注"从60到95分"的创造。
        </p>
      </header>

      {/* Writing Process */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-5">🔄 AI 写作的正确姿势：4 步创作流程</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {WRITING_PROCESS.map(step => (
            <div key={step.step} className="text-center p-4 rounded-xl bg-black/30 border border-white/5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-black text-white text-lg"
                   style={{background: step.color}}>
                {step.step}
              </div>
              <h4 className="font-bold text-white text-sm mb-2">{step.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scenario Template Library */}
      <section className="lesson-section mt-10">
        <h3 className="mb-2">📚 场景模板库：拿来即用的写作 Prompt</h3>
        <p className="text-gray-400 text-sm mb-5">选择场景查看实战 Prompt 和 AI 输出示例：</p>

        <div className="flex gap-2 mb-5 flex-wrap">
          {WRITING_SCENARIOS.map((s, i) => (
            <button key={s.id} onClick={() => { setActiveScenario(i); setActiveSit(0); setShowPrompt(false); setShowOutput(false); }}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${activeScenario === i ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {scenario.situations.map((s, i) => (
            <button key={i} onClick={() => { setActiveSit(i); setShowPrompt(false); setShowOutput(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${activeSit === i ? 'border-blue-500 bg-blue-900/20 text-blue-200' : 'border-gray-700 bg-black/20 text-gray-500'}`}>
              {s.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-black/40 border border-violet-500/20 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5 cursor-pointer" onClick={() => setShowPrompt(!showPrompt)}>
              <span className="text-sm font-bold text-violet-300">📋 Prompt 模板</span>
              <span className="text-xs text-gray-500">{showPrompt ? '▲ 收起' : '▼ 展开'}</span>
            </div>
            {showPrompt && (
              <div className="p-4 relative">
                <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed">{situation.prompt}</pre>
                <button onClick={() => copyText(situation.prompt, 'prompt')}
                  className="absolute top-4 right-4 text-xs bg-violet-900/50 text-violet-300 px-2 py-1 rounded flex items-center gap-1">
                  {copied === 'prompt' ? <><CheckCircle2 size={11}/> 已复制</> : <><Copy size={11}/> 复制</>}
                </button>
              </div>
            )}
          </div>

          <div className="bg-black/40 border border-emerald-500/20 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5 cursor-pointer" onClick={() => setShowOutput(!showOutput)}>
              <span className="text-sm font-bold text-emerald-300">🤖 AI 输出示例</span>
              <span className="text-xs text-gray-500">{showOutput ? '▲ 收起' : '▼ 展开'}</span>
            </div>
            {showOutput && (
              <div className="p-4 relative">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{situation.output}</pre>
                <button onClick={() => copyText(situation.output, 'output')}
                  className="absolute top-4 right-4 text-xs bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded flex items-center gap-1">
                  {copied === 'output' ? <><CheckCircle2 size={11}/> 已复制</> : <><Copy size={11}/> 复制</>}
                </button>
              </div>
            )}
          </div>

          {!showPrompt && !showOutput && (
            <div className="flex gap-3">
              <button onClick={() => setShowPrompt(true)} className="bg-violet-600/50 hover:bg-violet-600 border border-violet-500 text-violet-200 px-4 py-2 rounded-lg text-sm font-medium transition-all">查看 Prompt 模板</button>
              <button onClick={() => setShowOutput(true)} className="bg-emerald-600/50 hover:bg-emerald-600 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-lg text-sm font-medium transition-all">查看输出示例</button>
            </div>
          )}
        </div>
      </section>

      {/* Writing Style Switcher */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-3">🎨 风格切换魔法：同一内容，不同语气</h3>
        <p className="text-gray-400 text-sm mb-5">核心内容：<em className="text-white">"下周一上午 10 点，全员开一个季度复盘会议，请大家准时参加。"</em></p>
        <div className="flex flex-wrap gap-2 mb-4">
          {WRITING_STYLES.map((style, i) => (
            <button key={i} onClick={() => setSelectedStyle(selectedStyle === i ? null : i)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedStyle === i ? 'bg-violet-900/40 border-violet-400 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {style}
            </button>
          ))}
        </div>
        {selectedStyle !== null && (
          <div className="p-4 bg-black/40 border border-violet-500/30 rounded-xl text-sm text-gray-200 leading-relaxed fade-in">
            {selectedStyle === 0 && <p>各位同事，请注意：<br/>季度复盘会议定于下周一（X月X日）上午10:00正式召开，请全体人员准时出席，做好相应工作总结准备。</p>}
            {selectedStyle === 1 && <p>📢 大新闻！！下周一10点，咱们要开个"照镜子"大会——季度复盘！这个会嘛，可能会有点犀利，可能会有点真相，但绝对比刷手机有营养🤭 别迟到哦～</p>}
            {selectedStyle === 2 && <p>🔥 团队集结号！<br/>一个季度的努力、成长、突破——值得被好好看见。下周一10点，我们开季度复盘会，一起为下一阶段的冲锋蓄力！每一个你的声音都很重要，准时到场！</p>}
            {selectedStyle === 3 && <p>时间走得很快，又到了回望的节点。<br/>下周一上午十点，我们聚在一起，翻开这个季度的故事，看看哪些值得继续，哪些需要放下。期待你的到来。</p>}
            {selectedStyle === 4 && <p>orz 下周一十点要开季度复盘会，全体宝子请准时到场，有坑会一起填，有功要一起庆！不来的那位……懂的都懂 👀</p>}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">💡 在 Prompt 里加一句"用[风格]的语气改写"，可以快速切换任何内容的表达方式</p>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery-pro/lesson/coding')}>
          写作满级！挑战 AI 编程加速器 →
        </button>
      </section>
    </div>
  );
}
