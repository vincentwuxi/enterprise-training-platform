import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PROMPT_TECHNIQUES = [
  {
    name: 'Zero-Shot', icon: '🎯', color: '#a78bfa',
    desc: '直接提问，不提供示例。适合能力强的模型处理简单明确任务。',
    bad:  `# ❌ 模糊的零样本提示
分析这段文字。`,
    good: `# ✅ 明确的零样本提示
你是一名资深产品经理。请分析以下用户反馈，
输出格式：
- 核心问题（1句话）
- 影响程度（高/中/低）
- 建议优先级（P0/P1/P2）

用户反馈："App 每次打开都要重新登录，太烦了"`,
    output: `核心问题：登录 Session 未持久化，用户体验差
影响程度：高（直接影响日活用户留存）
建议优先级：P0（立即修复）`,
  },
  {
    name: 'Few-Shot', icon: '📚', color: '#10b981',
    desc: '提供2-5个示例，让模型学习输出格式和风格。适合需要特定格式的分类/提取任务。',
    bad:  `# ❌ 没有示例，输出格式不受控
判断评论情感。`,
    good: `# ✅ Few-Shot：用示例定义输出格式
判断以下评论的情感（仅输出：正面/负面/中性）

示例1：
输入：物流很快，包装完好
输出：正面

示例2：
输入：质量一般般，不好也不坏
输出：中性

示例3：
输入：和描述完全不符，差评！
输出：负面

现在判断：
输入：快递小哥态度很好，但商品有点小瑕疵`,
    output: `中性`,
  },
  {
    name: 'Chain of Thought', icon: '🔗', color: '#38bdf8',
    desc: '让模型"先想再答"，加入推理步骤。Complex reasoning 任务性能大幅提升。关键词："一步步思考"。',
    bad:  `# ❌ 直接要答案（复杂问题容易错）
一个团队每天能处理120份订单，7天能处理多少？`,
    good: `# ✅ Chain of Thought：强制显式推理
一个团队每天能处理120份订单，如果周末效率降低40%，
工作日5天+周末2天共7天能处理多少订单？

请一步步计算：`,
    output: `步骤1：工作日处理量
  工作日5天 × 120份/天 = 600份

步骤2：周末处理量
  周末效率降低40%，即处理 120 × (1-40%) = 72份/天
  周末2天 = 72 × 2 = 144份

步骤3：合计
  600 + 144 = 744份

答案：7天共处理 744 份订单。`,
  },
  {
    name: 'ReAct 模式', icon: '⚡', color: '#f59e0b',
    desc: 'Reasoning + Acting：模型交替思考和行动（调用工具），是 AI Agent 的基础框架。',
    bad:  `# ❌ 直接询问（无工具时无法获取实时信息）
今天上海的天气如何？`,
    good: `# ✅ ReAct：思考→行动→观察→再思考
系统：你有以下工具：
- search(query): 搜索实时信息
- get_weather(city): 获取天气

用户：上海今天适合骑行吗？`,
    output: `Thought: 需要查询上海今天的天气
Action: get_weather("上海")
Observation: 晴天，24°C，东南风3级，空气质量良

Thought: 天气晴好，温度适中，风力较小，适合户外运动
Answer: 今天上海非常适合骑行！天气晴朗，温度24°C，
东南风仅3级不会影响骑行舒适度，建议早上8-10点出发。`,
  },
  {
    name: 'Structured Output', icon: '📋', color: '#ec4899',
    desc: '强制模型输出 JSON/XML 等结构化格式，便于程序解析。结合 response_format 或 function calling。',
    bad:  `# ❌ 自然语言输出，难以解析
提取文章中的人物和地点。`,
    good: `# ✅ 强制 JSON 结构（OpenAI Structured Output）
from openai import OpenAI
from pydantic import BaseModel

class Article(BaseModel):
    persons: list[str]
    locations: list[str]
    keywords: list[str]
    summary: str

client = OpenAI()
completion = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": f"提取信息：{article}"}],
    response_format=Article,  # 强制返回 JSON Schema
)
result: Article = completion.choices[0].message.parsed`,
    output: `{
  "persons": ["马云", "孙正义"],
  "locations": ["杭州", "东京"],
  "keywords": ["投资", "互联网", "软银"],
  "summary": "软银创始人孙正义在杭州与马云商讨..."
}`,
  },
];

// Prompt 评分模拟器
function PromptSandbox() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [thinking, setThinking] = useState('');
  const [running, setRunning] = useState(false);

  const QUICK_PROMPTS = [
    { label: '🎯 Zero-Shot', text: '你是一名资深产品经理。分析用户反馈："App每次打开都要重新登录，太烦了"\n输出格式：\n- 核心问题\n- 影响程度（高/中/低）\n- 建议优先级（P0/P1/P2）' },
    { label: '🔗 Chain of Thought', text: '工作日每天处理120份订单，周末效率降40%。工作日5天+周末2天，7天共处理多少订单？请一步步计算：' },
    { label: '📋 结构化输出', text: '从以下文字提取信息，以JSON格式输出（persons, locations, keywords, summary）：\n\n"2024年，阿里巴巴在杭州举办年度峰会，马云出席并发表演讲，吸引了来自北京、上海的数千名开发者参与。"' },
    { label: '⚡ ReAct Agent', text: '用ReAct格式回答：如果GPT-4处理1000个请求，每个请求平均消耗2000个输入token和500个输出token，按$5/1M输入和$15/1M输出计费，总费用是多少？请展示思考过程。' },
  ];

  const MOCK_RESPONSES = {
    '产品经理': {
      think: '用户反馈指向 Session 持久化问题，影响所有用户的使用频率...',
      answer: `- 核心问题：登录 Session 未持久化，用户每次打开 App 必须重新登录
- 影响程度：高（直接影响日活用户体验和留存率）
- 建议优先级：P0（立即修复，预计影响所有注册用户）`
    },
    '订单': {
      think: '将问题分解：工作日5天 + 周末2天（效率降低40%）',
      answer: `步骤 1：工作日处理量
  5天 × 120份/天 = 600 份

步骤 2：周末处理量  
  120 × (1 - 40%) = 72 份/天
  2天 × 72份 = 144 份

步骤 3：合计
  600 + 144 = 744 份

✅ 7天共处理 744 份订单`
    },
    'JSON': {
      think: '识别文本中的人名、地名和关键词，提炼摘要...',
      answer: `{
  "persons": ["马云"],
  "locations": ["杭州", "北京", "上海"],
  "keywords": ["阿里巴巴", "年度峰会", "开发者"],
  "summary": "阿里巴巴2024年在杭州举办年度峰会，马云出席演讲，吸引全国数千开发者参与"
}`
    },
    'fee': {
      think: '计算输入费用 + 输出费用分别计算再求和...',
      answer: `Thought: 分别计算输入和输出费用

输入费用：
  1000请求 × 2000 token/请求 = 2,000,000 输入 token
  费用 = 2M × $5/1M = $10.00

输出费用：
  1000请求 × 500 token/请求 = 500,000 输出 token
  费用 = 0.5M × $15/1M = $7.50

Answer: 总费用 = $10.00 + $7.50 = $17.50`
    },
  };

  const simulate = async () => {
    if (!prompt.trim()) return;
    setRunning(true);
    setThinking('');
    setResponse('');

    // Choose mock response
    let chosen = { think: '分析问题中...理解用户需求...', answer: '（请选择上方的快捷提示模板体验模拟响应）' };
    for (const [key, val] of Object.entries(MOCK_RESPONSES)) {
      if (prompt.includes(key) || prompt.toLowerCase().includes(key.toLowerCase())) { chosen = val; break; }
    }

    // Simulate streaming thinking
    setThinking('💭 思考中...');
    await new Promise(r => setTimeout(r, 600));
    setThinking(chosen.think);
    await new Promise(r => setTimeout(r, 800));

    // Simulate streaming response
    let partial = '';
    const words = chosen.answer.split('');
    for (let i = 0; i < words.length; i++) {
      partial += words[i];
      setResponse(partial);
      if (i % 8 === 0) await new Promise(r => setTimeout(r, 15));
    }
    setRunning(false);
  };

  return (
    <div className="ai-interactive">
      <h3>🎮 Prompt 沙箱（模拟 GPT-4o 响应）</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p.label} onClick={() => { setPrompt(p.text); setResponse(''); setThinking(''); }}
            style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.07)', color: '#a78bfa' }}>
            {p.label}
          </button>
        ))}
      </div>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
        placeholder="输入 Prompt，或点击上方快捷模板..."
        style={{ width: '100%', padding: '0.625rem', background: '#020010', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '7px', color: '#d4c8ff', fontFamily: 'JetBrains Mono', fontSize: '0.78rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <button className="ai-btn primary" onClick={simulate} disabled={running || !prompt.trim()}>
          {running ? '⏳ 生成中…' : '▶ 发送 Prompt'}
        </button>
      </div>
      {thinking && (
        <div className="ai-thinking">💭 {thinking}</div>
      )}
      {response && (
        <div className="ai-response"><span style={{ color: '#10b981', fontWeight: 700 }}>GPT-4o：</span><br />{response}</div>
      )}
    </div>
  );
}

export default function LessonPrompting() {
  const navigate = useNavigate();
  const [activeTech, setActiveTech] = useState(0);
  const [view, setView] = useState('good');

  const t = PROMPT_TECHNIQUES[activeTech];

  return (
    <div className="lesson-ai">
      <div className="ai-badge green">✏️ module_02 — Prompt Engineering</div>
      <div className="ai-hero">
        <h1>Prompt Engineering：CoT / Few-Shot / 结构化输出</h1>
        <p>Prompt Engineering 是 LLM 应用的第一生产力。<strong>同一个问题，不同提示方式</strong>可以产生天壤之别的结果。掌握这些技术，不需要微调即可大幅提升模型表现。</p>
      </div>

      {/* Prompt 沙箱 */}
      <PromptSandbox />

      {/* 五大技术 */}
      <div className="ai-section">
        <h2 className="ai-section-title">🎯 五大 Prompt 技术（点击对比好坏示例）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {PROMPT_TECHNIQUES.map((tech, i) => (
            <button key={i} onClick={() => { setActiveTech(i); setView('good'); }}
              style={{ flex: 1, minWidth: 130, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                border: `1px solid ${activeTech === i ? tech.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTech === i ? `${tech.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTech === i ? tech.color : '#3b2d6b' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{tech.icon}</div>
              {tech.name}
            </button>
          ))}
        </div>

        <div style={{ padding: '0.6rem 0.875rem', background: `${t.color}08`, borderRadius: '8px', fontSize: '0.82rem', color: '#3b2d6b', marginBottom: '0.75rem' }}>
          {t.desc}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <button className={`ai-btn ${view === 'bad' ? 'active' : ''}`} style={{ borderColor: 'rgba(248,113,113,0.3)', color: view === 'bad' ? '#f87171' : '#3b2d6b' }} onClick={() => setView('bad')}>❌ 差的提示</button>
          <button className={`ai-btn ${view === 'good' ? 'active' : ''}`} style={{ borderColor: 'rgba(16,185,129,0.3)', color: view === 'good' ? '#10b981' : '#3b2d6b' }} onClick={() => setView('good')}>✅ 好的提示</button>
          <button className={`ai-btn ${view === 'output' ? 'active' : ''}`} style={{ borderColor: 'rgba(139,92,246,0.3)', color: view === 'output' ? '#a78bfa' : '#3b2d6b' }} onClick={() => setView('output')}>💬 模型输出</button>
        </div>

        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: view === 'bad' ? '#ef4444' : '#22c55e' }} />
            <div className="ai-code-dot" style={{ background: '#f59e0b' }} />
            <div className="ai-code-dot" style={{ background: t.color }} />
            <span style={{ marginLeft: '0.5rem', color: t.color }}>{t.icon} {t.name} — {view === 'bad' ? '❌ 差的提示' : view === 'good' ? '✅ 好的提示' : '💬 输出结果'}</span>
          </div>
          <div className="ai-code" style={{ color: view === 'output' ? '#a7f3d0' : view === 'bad' ? '#ffd0d0' : '#d4c8ff', fontSize: '0.77rem' }}>
            {view === 'bad' ? t.bad : view === 'good' ? t.good : t.output}
          </div>
        </div>
      </div>

      {/* Prompt 设计原则 */}
      <div className="ai-section">
        <h2 className="ai-section-title">📌 Prompt 设计 10 条黄金原则</h2>
        <div className="ai-grid-2">
          {[
            ['1. 明确角色定义', '在系统提示中定义模型的专业角色和行为准则'],
            ['2. 具体而非模糊', '"用3个要点总结"比"总结一下"好10倍'],
            ['3. 明确输出格式', '指定 JSON/Markdown/列表，便于程序解析'],
            ['4. 提供上下文', '给模型它需要的背景信息，不要假设它知道'],
            ['5. Few-Shot 示例', '2-5个高质量示例远比大段描述有效'],
            ['6. 思维链指令', '复杂任务加"请一步步思考"'],
            ['7. 限制输出长度', '"用不超过100字"或"3个要点"控制冗长'],
            ['8. 用分隔符隔离', '用 <document></document> 和 ### 分隔不同内容块'],
            ['9. 迭代测试优化', '每次只改一个变量，建立评估基准'],
            ['10. 负面约束', '明确说明"不要"或"避免"的内容'],
          ].map(([title, desc]) => (
            <div key={title} style={{ padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.82rem', flexShrink: 0 }}>{title}：</span>
              <span style={{ fontSize: '0.8rem', color: '#3b2d6b' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-nav">
        <button className="ai-btn" onClick={() => navigate('/course/llm-dev/lesson/llm-core')}>← 上一模块</button>
        <button className="ai-btn primary" onClick={() => navigate('/course/llm-dev/lesson/rag-basics')}>下一模块：RAG 基础 →</button>
      </div>
    </div>
  );
}
