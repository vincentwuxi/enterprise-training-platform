import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Bot, Database, Zap, Trophy, CheckCircle2 } from 'lucide-react';
import './LessonCommon.css';

const AGENT_STEPS = [
  { icon: '🎯', title: '接收目标', desc: '用户发出自然语言指令，如"帮我调研竞争对手并生成报告"', color: '#7c3aed' },
  { icon: '🧠', title: 'LLM 规划', desc: 'Agent 的"大脑"将目标拆解为多个子任务步骤，制定执行计划', color: '#2563eb' },
  { icon: '🔧', title: '调用工具', desc: '根据子任务调用工具：搜索网络、执行代码、读写文件、调用 API', color: '#0284c7' },
  { icon: '👁️', title: '观察结果', desc: '将工具返回的结果反馈给 LLM，判断是否需要调整计划', color: '#059669' },
  { icon: '🔁', title: '迭代直到完成', desc: '循环"规划→执行→观察"，直到所有子任务完成，最终汇总输出', color: '#d97706' },
];

const RAG_STEPS = [
  { n: '1', title: '文档入库', desc: '将企业知识库（PDF/Wiki/聊天记录）上传，切分成小块（Chunk）', icon: '📥' },
  { n: '2', title: 'Embedding 向量化', desc: '将每个文本块转为数学向量（高维空间中的坐标），存入向量数据库', icon: '🔢' },
  { n: '3', title: '用户提问', desc: '用户的问题同样被向量化，在向量空间中搜索"最相近"的知识块', icon: '❓' },
  { n: '4', title: '注入上下文', desc: '将检索到的相关知识块 + 用户问题，一起作为 Prompt 发送给 LLM', icon: '📋' },
  { n: '5', title: 'LLM 生成答案', desc: 'LLM 基于注入的真实知识生成回答，而非凭空想象，大幅降低幻觉', icon: '✅' },
];

const MY_AI_CONFIGS = [
  { title: '个人研究助理', role: '你是一个专业的学术研究助理', goal: '帮我快速提炼文献核心观点，发现争议点，生成引用建议', tools: ['文献搜索', 'PDF 解析', '摘要生成'], memory: '用户研究领域、偏好的引用格式', suitable: '研究生、学者、咨询顾问' },
  { title: '销售 AI 助理', role: '你是一个资深销售教练，了解 SPIN 和 MEDDIC 销售方法论', goal: '分析客户信息，生成个性化开场白，预测客户异议和应对话术', tools: ['CRM 数据读取', '邮件模板生成', '竞品分析'], memory: 'CRM 中的客户历史互动', suitable: 'B2B 销售、客户成功' },
  { title: '内容创作助理', role: '你了解我的写作风格和目标受众，是我的创作搭档', goal: '帮我生成选题、起草内容、检查文章质量，保持一致的品牌声音', tools: ['热点话题搜索', '数据图表生成', '图片提示词'], memory: '历史内容风格样本、受众画像', suitable: '自媒体作者、品牌内容团队' },
];

export default function LessonBuild() {
  const navigate = useNavigate();
  const [agentStep, setAgentStep] = useState(-1);
  const [activeConfig, setActiveConfig] = useState(0);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [finished, setFinished] = useState(false);

  const runAgentAnimation = () => {
    setAgentStep(-1);
    let i = 0;
    const timer = setInterval(() => {
      setAgentStep(i);
      i++;
      if (i >= AGENT_STEPS.length) {
        clearInterval(timer);
        setTimeout(() => setAgentStep(AGENT_STEPS.length), 400);
      }
    }, 700);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="category-tag">🤖 模块八：构建你的 AI 助理</div>
        <h1>从用户到创造者：搭建专属 AI Agent</h1>
        <p className="lesson-intro">
          前七个模块教你用好现有的 AI。最后一步——<strong style={{color:'#a78bfa'}}>你自己来定义 AI 的行为，构建一个专属于你的 AI 工作伙伴。</strong>这是从"AI 用户"到"AI 建造者"的临界跨越。
        </p>
      </header>

      {/* Agent Architecture */}
      <section className="lesson-section glass-panel">
        <h3 className="mb-2">🤖 AI Agent 是什么？为什么比单纯 ChatGPT 强大 10 倍？</h3>
        <p className="text-gray-400 text-sm mb-5">
          普通 ChatGPT：你问 → 它答 → 结束。<br/>
          <strong className="text-white">AI Agent</strong>：你给目标 → 它自主规划多步骤 → 调用工具 → 观察反馈 → 直到完成任务。
        </p>

        <div className="space-y-2 mb-5">
          {AGENT_STEPS.map((step, i) => (
            <div key={i} className={`flex items-start gap-4 p-3 rounded-xl border-2 transition-all duration-400 ${agentStep >= i ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}
              style={{ borderColor: agentStep >= i ? step.color + '80' : 'transparent', background: agentStep >= i ? step.color + '15' : 'rgba(0,0,0,0.2)' }}>
              <span className="text-xl shrink-0">{step.icon}</span>
              <div>
                <h4 className="font-bold text-white text-sm mb-0.5">{step.title}</h4>
                <p className="text-xs text-gray-400">{step.desc}</p>
              </div>
              {agentStep === i && <div className="ml-auto shrink-0 w-2 h-2 bg-current rounded-full animate-pulse" style={{color: step.color}}></div>}
              {agentStep > i && <CheckCircle2 className="ml-auto shrink-0" size={16} style={{color: step.color}}/>}
            </div>
          ))}
          {agentStep === AGENT_STEPS.length && (
            <div className="p-3 bg-emerald-900/20 border border-emerald-500/40 rounded-xl text-center text-emerald-400 font-bold animate-pulse">
              🎉 Agent 完成任务，生成最终报告！
            </div>
          )}
        </div>
        <button onClick={runAgentAnimation} className="bg-violet-600 hover:bg-violet-500 px-5 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2 transition-all">
          <Zap size={15}/> {agentStep === -1 ? '▶ 运行 Agent 演示' : '🔄 重新演示'}
        </button>
      </section>

      {/* RAG Architecture */}
      <section className="lesson-section mt-10">
        <h3 className="mb-4">📚 RAG：让 AI 基于你的知识库回答，彻底告别幻觉</h3>
        <p className="text-gray-400 text-sm mb-5">
          RAG（Retrieval Augmented Generation，检索增强生成）是让 AI 变成你企业专属"智能顾问"的核心技术。<br/>
          原理是：先从你的知识库里找到相关信息，再让 AI 基于真实知识生成答案。
        </p>
        <div className="space-y-2">
          {RAG_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-violet-900/50 border border-violet-500/30 flex items-center justify-center text-xs font-black text-violet-300 shrink-0">{step.n}</div>
              <span className="text-xl shrink-0">{step.icon}</span>
              <div>
                <h4 className="font-bold text-white text-sm mb-0.5">{step.title}</h4>
                <p className="text-xs text-gray-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-xs text-blue-300">
          💡 <strong>无代码搭建 RAG 的工具：</strong>Dify.ai（全中文、免费私有部署）、Coze（字节、拖拽构建）、Langchain（开发者向）
        </div>
      </section>

      {/* Custom AI Config */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-4">⚙️ 3 个专属 AI 助理配置蓝图</h3>
        <div className="flex gap-2 flex-wrap mb-5">
          {MY_AI_CONFIGS.map((c, i) => (
            <button key={i} onClick={() => setActiveConfig(i)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${activeConfig === i ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-black/30 border-gray-700 text-gray-400'}`}>
              {c.title}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {[
            { label: '🗣️ 角色定义（System Prompt）', value: MY_AI_CONFIGS[activeConfig].role, color: 'violet' },
            { label: '🎯 核心目标', value: MY_AI_CONFIGS[activeConfig].goal, color: 'blue' },
            { label: '🛠️ 工具权限', value: MY_AI_CONFIGS[activeConfig].tools.join('、'), color: 'emerald' },
            { label: '🧠 记忆类型', value: MY_AI_CONFIGS[activeConfig].memory, color: 'orange' },
            { label: '👤 适合人群', value: MY_AI_CONFIGS[activeConfig].suitable, color: 'pink' },
          ].map((item, i) => {
            const textColors = { violet: 'text-violet-300', blue: 'text-blue-300', emerald: 'text-emerald-300', orange: 'text-orange-300', pink: 'text-pink-300' };
            return (
              <div key={i} className="flex gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                <label className={`text-xs font-bold shrink-0 w-44 ${textColors[item.color]}`}>{item.label}</label>
                <p className="text-sm text-gray-200">{item.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Build Your Own */}
      <section className="lesson-section glass-panel mt-10">
        <h3 className="mb-3">📝 现在就动手：写出你的第一个 System Prompt</h3>
        <p className="text-gray-400 text-sm mb-4">System Prompt 是定义 AI 角色的根指令。把下面的模板补充完整，直接粘贴到任意 AI 工具的"自定义角色"里使用：</p>
        <div className="bg-black/40 border border-gray-700 rounded-xl p-4 font-mono text-sm text-gray-300 mb-3">
          <p>你是一个专业的 <span className="text-violet-300 bg-violet-900/20 px-1 rounded">[职业角色]</span> 助手，</p>
          <p>专注于帮助 <span className="text-blue-300 bg-blue-900/20 px-1 rounded">[目标用户]</span> 完成 <span className="text-emerald-300 bg-emerald-900/20 px-1 rounded">[核心任务]</span>。</p>
          <p>你的输出风格是 <span className="text-orange-300 bg-orange-900/20 px-1 rounded">[风格描述]</span>，</p>
          <p>每次回答都要包含 <span className="text-pink-300 bg-pink-900/20 px-1 rounded">[必要格式要素]</span>。</p>
          <p>请避免 <span className="text-red-300 bg-red-900/20 px-1 rounded">[不想要的行为]</span>。</p>
        </div>
        <textarea
          className="w-full bg-black/50 border border-gray-700 text-white text-sm rounded-xl p-4 resize-none focus:outline-none focus:border-violet-500 transition-colors"
          rows={6}
          placeholder="用上面的模板，写出你自己的 System Prompt..."
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
        />
        {systemPrompt.length > 30 && (
          <p className="text-emerald-400 text-xs mt-2">✅ 太棒了！你的第一个 System Prompt 已写好。把它粘贴到 ChatGPT 的"自定义指令"或 Claude 的"系统提示"里试试吧！</p>
        )}
      </section>

      {/* Graduation */}
      <section className="lesson-section glass-panel mt-10 text-center py-12" style={{borderTop: '4px solid #7c3aed', background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(37,99,235,0.1))'}}>
        <Trophy size={60} className="mx-auto mb-4 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]"/>
        <h2 className="text-3xl font-black mb-3" style={{background: 'linear-gradient(to right, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          🎓 恭喜完成《AI 全能实战营》！
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          你已经完成了从 AI 认知重塑、提示词工程、写作与编程加速、数据分析、自动化流水线、多模态创作，到构建专属 AI 助理的完整进阶之路。
          <br/><br/>
          <strong className="text-white">现在的你，不只是在"使用 AI"，而是在"驾驭 AI"。</strong>
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs">
          {['AI 认知重塑', 'CRAFT 提示词', 'AI写作', '10x编程', '数据分析', 'AI自动化', '多模态创作', 'Agent构建', 'RAG知识库', 'System Prompt'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full border text-purple-300 border-purple-500/40 bg-purple-900/20">{tag}</span>
          ))}
        </div>
        <button onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-black py-3 px-8 rounded-full shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all hover:scale-105 text-lg">
          🚀 返回课程中心，继续探索
        </button>
      </section>
    </div>
  );
}
