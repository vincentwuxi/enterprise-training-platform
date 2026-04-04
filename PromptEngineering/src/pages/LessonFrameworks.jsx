import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import './LessonCommon.css';

export default function LessonFrameworks() {
  const navigate = useNavigate();
  const [role, setRole] = useState('资深的人力资源专员');
  const [task, setTask] = useState('撰写一份给候选人的拒信');
  const [format, setFormat] = useState('字数在150字以内，语气委婉，最后一定要祝愿他未来职场顺利');
  const [copied, setCopied] = useState(false);

  const generatedPrompt = `# 角色设定\n你现在是一名${role || '[你的角色]'}。\n\n# 执行任务\n你的任务是：${task || '[你的任务]'}。\n\n# 输出格式与要求\n必须严格遵守以下要求：\n${format || '[格式要求]'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🧠 模块二：核心心法</div>
         <h1>构建优质提示词的万能框架</h1>
         <p className="lesson-intro">
            告别"随便聊聊"的模糊指令，掌握结构化表达，让 AI 秒懂你的真实意图。
         </p>
      </header>

      <section className="lesson-section glass-panel mb-8">
         <h3 className="mb-4 text-xl">四大黄金原则</h3>
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-lg flex gap-3"><CheckCircle2 className="text-green-500 shrink-0"/><span><strong>指令明确</strong>：多用强动词，少用模糊的形容词。</span></div>
            <div className="bg-black/20 p-4 rounded-lg flex gap-3"><CheckCircle2 className="text-green-500 shrink-0"/><span><strong>提供背景</strong>：给它充足的输入数据和前情提要。</span></div>
            <div className="bg-black/20 p-4 rounded-lg flex gap-3"><CheckCircle2 className="text-green-500 shrink-0"/><span><strong>输出约束</strong>：指明格式、字数、受众、甚至排版标签。</span></div>
            <div className="bg-black/20 p-4 rounded-lg flex gap-3"><CheckCircle2 className="text-green-500 shrink-0"/><span><strong>肯定表达</strong>：告诉它"要做什么"，而不是"不要做什么"。</span></div>
         </div>
      </section>

      <section className="lesson-section glass-panel mb-8">
         <h3 className="mb-6">入门万能公式 —— RTF 框架实时生成器</h3>
         <p className="text-gray-300 mb-6">RTF 代表 <strong>Role（角色）</strong> + <strong>Task（任务）</strong> + <strong>Format（格式）</strong>。修改下方输入框，实时生成一段可直接使用的高质量提示词！</p>
         
         <div className="prompt-builder">
            <div className="input-group">
               <span className="input-label">👤 Role (角色设定)：你想让 AI 成为谁？</span>
               <input type="text" className="prompt-input" value={role} onChange={e => setRole(e.target.value)} />
            </div>
            <div className="input-group">
               <span className="input-label">🎯 Task (拆解任务)：具体要做什么事？</span>
               <input type="text" className="prompt-input" value={task} onChange={e => setTask(e.target.value)} />
            </div>
            <div className="input-group">
               <span className="input-label">📐 Format (格式要求)：输出的载体和语气限制是什么？</span>
               <textarea className="prompt-input" value={format} onChange={e => setFormat(e.target.value)} rows={2} />
            </div>

            <div className="mt-4 flex items-center justify-center">
               <ChevronRight size={32} className="text-gray-500 rotate-90" />
            </div>

            <div className="relative">
              <div className="generated-prompt-box">{generatedPrompt}</div>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
                style={{background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: copied ? '#10b981' : '#9ca3af'}}
              >
                {copied ? <Check size={14}/> : <Copy size={14}/>}
                {copied ? '已复制！' : '一键复制'}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">直接将复制的内容粘贴到任意大模型对话框中发送，效果立竿见影。</p>
         </div>
      </section>

      <section className="lesson-section glass-panel">
        <h3 className="mb-4">🔧 进阶分隔符魔法</h3>
        <p className="text-gray-300 mb-4">当你的 Prompt 里既有指令又有待处理的文本时，使用分隔符能让 AI 精准区分"你想要什么"和"你给的材料"，大幅减少理解偏差。</p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="text-xs text-red-400 mb-2 font-mono">❌ 容易混淆的写法</div>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{`总结以下文章并翻译成英文这是一篇关于气候变化的研究报告全球平均气温上升...`}</pre>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="text-xs text-green-400 mb-2 font-mono">✅ 使用分隔符的清晰写法</div>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{`总结以下文章并翻译成英文：\n\n###\n这是一篇关于气候变化的研究报告，\n全球平均气温上升...\n###`}</pre>
          </div>
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/prompt-engineering-camp/lesson/limitsbreak')}>太实用了，带我突破推理极限！</button>
      </section>
    </div>
  );
}
