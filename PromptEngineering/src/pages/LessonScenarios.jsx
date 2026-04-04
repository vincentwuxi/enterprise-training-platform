import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, FileJson, Bug, Users, Megaphone, Copy, Check } from 'lucide-react';
import './LessonCommon.css';

const SCENARIOS = [
  {
    icon: Send,
    iconColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    promptColor: 'text-blue-300',
    promptBorder: 'border-blue-400',
    title: '场景 A：跨文化邮件沟通',
    tag: '行政 / 外贸',
    bad: '帮我把这封邮件翻译成日文',
    good: '你现在是一位拥有20年合资企业经验的日本籍项目总监。请把以下索赔邮件翻译成日文，要求语气极其委婉但态度坚决，符合日式高情商商务礼仪。最后用一段表达期待继续合作的客套话结尾。\n\n###\n[粘贴你的原文]\n###',
  },
  {
    icon: FileJson,
    iconColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
    promptColor: 'text-green-300',
    promptBorder: 'border-green-400',
    title: '场景 B：非结构化数据清洗',
    tag: '财务 / HR',
    bad: '帮我整理一下这些客户反馈',
    good: '这里有100条非结构化的客诉文字记录。\n请从每条中精确提取以下字段：\n- 日期（无则填"未知"）\n- 情绪：正面/负面/中性\n- 核心诉求（一句话）\n- 退款金额（无则填"无"）\n\n要求：严格按 CSV 格式输出，第一行为表头，不需要任何额外解释。\n\n###\n[粘贴原始客诉文字]\n###',
  },
  {
    icon: Bug,
    iconColor: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8b5cf6',
    promptColor: 'text-purple-300',
    promptBorder: 'border-purple-400',
    title: '场景 C：代码调试辅助',
    tag: '研发 / 测试',
    bad: '这段代码报错了，帮我看看',
    good: '你是一位熟悉 React 性能优化的资深前端架构师。\n\n我的组件出现了内存泄漏警告，错误信息如下：\n[粘贴报错]\n\n请你：\n1. 先推断最可能的三种泄漏原因（按概率排序）\n2. 针对最高概率的原因，提供修复代码片段\n3. 解释修改的原理，让初级工程师也能看懂',
  },
  {
    icon: Megaphone,
    iconColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
    promptColor: 'text-amber-300',
    promptBorder: 'border-amber-400',
    title: '场景 D：爆款文案逆向工程',
    tag: '运营 / 市场',
    bad: '帮我写一个产品推广文案',
    good: '你是一位擅长小红书"种草"内容的资深文案策划，深谙 Z 世代的语言风格。\n\n【参考爆款文案】\n"姐妹们！我发现了一个秘密武器..."\n（分析这个结构：悬念开头→痛点共鸣→产品登场→佐证细节→行动号召）\n\n请用完全相同的结构，为【XX产品】创作3个不同风格（俏皮/专业/情感）的完整种草文案，字数在200字以内。',
  },
  {
    icon: Users,
    iconColor: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: '#ec4899',
    promptColor: 'text-pink-300',
    promptBorder: 'border-pink-400',
    title: '场景 E：HR 招聘提效',
    tag: 'HR / 招聘',
    bad: '帮我写一个Java开发工程师的职位描述',
    good: '你是一位在互联网头部公司担任10年技术招聘的资深 HR 专家。\n\n请为我们公司起草一份 Java 后端高级工程师的职位描述，要求：\n- 薪资范围：30-45K·14薪\n- 核心技术栈：Spring Boot, MySQL, Redis, Kafka\n- 突出公司文化亮点：扁平、技术驱动\n- 格式：分为【岗位职责】【任职要求】【我们提供】三个部分\n- 语言：专业但不失亲切，能吸引有 3-5 年经验的候选人',
  },
];

export default function LessonScenarios() {
  const navigate = useNavigate();
  const [activeScene, setActiveScene] = useState(0);
  const [showGood, setShowGood] = useState(true);
  const [copied, setCopied] = useState(false);

  const scene = SCENARIOS[activeScene];
  const Icon = scene.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(scene.good);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">💼 模块四：场景落地</div>
         <h1>职场效率 10 倍提升</h1>
         <p className="lesson-intro">
            选择你最熟悉的工作场景，查看烂 Prompt 与好 Prompt 的改造对比，一键复制直接上手！
         </p>
      </header>

      <section className="lesson-section">
        {/* Scene selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SCENARIOS.map((s, i) => {
            const SIcon = s.icon;
            return (
              <button
                key={i}
                onClick={() => { setActiveScene(i); setShowGood(true); setCopied(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeScene === i ? s.bgColor : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeScene === i ? s.borderColor : 'rgba(255,255,255,0.1)'}`,
                  color: activeScene === i ? 'white' : '#9ca3af'
                }}
              >
                <SIcon size={14} style={{color: s.iconColor}}/>
                {s.title.split('：')[1]}
              </button>
            );
          })}
        </div>

        {/* Active scene detail card */}
        <div className="glass-panel p-6 rounded-2xl" style={{borderTop: `3px solid ${scene.borderColor}`}}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{background: scene.bgColor}}>
              <Icon size={22} style={{color: scene.iconColor}}/>
            </div>
            <div>
              <h3 className="text-xl m-0">{scene.title}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{background: scene.bgColor, color: scene.iconColor}}>{scene.tag}</span>
            </div>
          </div>

          {/* Before/After toggle */}
          <div className="flex gap-2 mb-4 mt-6">
            <button onClick={() => setShowGood(false)} className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${!showGood ? 'border-red-500/50 bg-red-500/20 text-red-200' : 'border-white/10 bg-black/20 text-gray-400'}`}>
              ❌ 改造前（烂 Prompt）
            </button>
            <button onClick={() => setShowGood(true)} className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${showGood ? 'border-green-500/50 bg-green-500/20 text-green-200' : 'border-white/10 bg-black/20 text-gray-400'}`}>
              ✅ 改造后（好 Prompt）
            </button>
          </div>

          <div className="relative">
            <pre className={`text-sm p-5 rounded-xl font-mono whitespace-pre-wrap leading-relaxed border transition-colors ${showGood ? 'bg-green-900/20 border-green-500/30 text-green-100' : 'bg-red-900/20 border-red-500/30 text-red-100'}`}>
              {showGood ? scene.good : scene.bad}
            </pre>
            {showGood && (
              <button onClick={handleCopy} className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all" style={{background: copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: copied ? '#10b981' : '#9ca3af'}}>
                {copied ? <Check size={12}/> : <Copy size={12}/>}
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
          {!showGood && <p className="text-xs text-red-400 mt-2">⚠️ 这样的指令 AI 只会给你一个毫无针对性的通用范本，点击"改造后"看升级版本！</p>}
        </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/prompt-engineering-camp/lesson/enterprise')}>全场景已掌握！进入企业级应用</button>
      </section>
    </div>
  );
}
