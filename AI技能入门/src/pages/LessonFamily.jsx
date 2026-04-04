import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './LessonCommon.css';

const FAMILY_NODES = [
  {
    id: 'ai',
    emoji: '🤖',
    title: '人工智能 (AI)',
    subtitle: '最外层的大概念',
    color: '#3b82f6',
    borderClass: 'box-1',
    desc: '让机器模拟人类智能（如看、听、思考、决策）的技术总称。',
    sub: [
      { label: '弱人工智能 (Narrow AI)', text: '只会干单一任务（如人脸识别、下棋）。目前世界上所有的 AI 都属于这一类。' },
      { label: '通用人工智能 (AGI)', text: '具备全面认知能力，是科幻电影里的 AI。是行业终极目标，尚未实现。' },
    ],
    examples: ['📍 高德地图导航', '🎵 音乐播放器推荐歌曲', '✉️ 邮件垃圾识别过滤'],
  },
  {
    id: 'ml',
    emoji: '🧠',
    title: '机器学习 (ML)',
    subtitle: 'AI 的核心实现方法',
    color: '#8b5cf6',
    borderClass: 'box-2',
    desc: '过去程序员手敲代码写死规则（If A, then B），而机器学习是喂给计算机海量数据，让它自己去"找规律"。',
    examples: ['📸 微信人脸支付识别', '🎬 Netflix 个性化推荐', '🛡️ 信用卡欺诈检测'],
  },
  {
    id: 'dl',
    emoji: '🕸️',
    title: '深度学习 (DL)',
    subtitle: '机器学习的高阶分支',
    color: '#10b981',
    borderClass: 'box-3',
    desc: '模仿人类大脑神经元结构，构建"人工神经网络"，极其擅长处理复杂的图像、声音、文本。近几年 AI 大爆发主要归功于它。',
    examples: ['🔍 Google 图片以图搜图', '🎤 Siri / 小爱同学语音识别', '🚗 自动驾驶障碍物识别'],
  },
  {
    id: 'genai',
    emoji: '✨',
    title: '生成式 AI (GenAI)',
    subtitle: '深度学习的明星应用方向',
    color: '#f59e0b',
    borderClass: 'box-4',
    desc: '过去的 AI 主要做"判断"（这张图是不是猫），而生成式 AI 主要做"创造"：写小说、画机甲猫、生成代码。',
    examples: ['💬 ChatGPT/Claude 对话', '🎨 Midjourney 生成图片', '🎬 Sora 文字生成视频'],
  },
];

export default function LessonFamily() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="lesson-page">
      <header className="lesson-header">
         <div className="category-tag">🧅 洋葱第一层</div>
         <h1>理清"AI 家族"的关系（宏观大局观）</h1>
         <p className="lesson-intro">
            很多人会把AI、机器学习、深度学习混为一谈。其实它们是层层包含的关系，就像一套<strong>俄罗斯套娃</strong>。点击每一层，查看它在日常生活中到底藏在哪里。
         </p>
      </header>

      <section className="lesson-section glass-panel" style={{padding: "2rem", marginBottom: "3rem"}}>
         <h3>🪆 概念套娃全景图（点击展开日常案例）</h3>
         
         <div className="matryoshka-container mt-6">
            {FAMILY_NODES.map((node) => (
              <div key={node.id} className={`matryoshka-box ${node.borderClass}`} style={{cursor: 'pointer'}} onClick={() => toggle(node.id)}>
                <div className="flex items-center justify-between">
                  <h4>{node.emoji} {node.title}</h4>
                  {expanded === node.id ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
                </div>
                <p className="text-sm mb-2" style={{color: node.color}}>{node.subtitle}</p>
                <p>{node.desc}</p>

                {node.sub && (
                  <ul className="check-list mt-2" style={{gap: '0.2rem'}}>
                    {node.sub.map((s, i) => (
                      <li key={i}><strong>{s.label}</strong>：{s.text}</li>
                    ))}
                  </ul>
                )}

                {expanded === node.id && (
                  <div className="mt-4 p-3 rounded-lg" style={{background: 'rgba(255,255,255,0.05)', borderTop: `2px solid ${node.color}`}}>
                    <p className="text-xs font-bold mb-2" style={{color: node.color}}>📱 你每天都在用它！日常案例：</p>
                    <div className="flex flex-wrap gap-2">
                      {node.examples.map((ex, i) => (
                        <span key={i} className="text-sm px-3 py-1 rounded-full" style={{background: node.color + '20', border: `1px solid ${node.color}50`, color: 'white'}}>{ex}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
         </div>
      </section>

      <section className="lesson-section footer-nav">
        <button className="nav-btn next" onClick={() => navigate('/course/ai-skills-mastery/lesson/cooking')}>已分清套娃！剥开第二层：AI 是怎么打造的？</button>
      </section>
    </div>
  );
}
