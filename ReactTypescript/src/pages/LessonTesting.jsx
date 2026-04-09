import { useState } from 'react';
import './LessonCommon.css';

const AI_FEATURES = [
  {
    key: 'streaming', name: '流式对话组件', icon: '💬',
    desc: '实现 ChatGPT 式的逐字输出效果，比等待完整响应体验好 10 倍',
    code: `// ━━━━ 流式 AI 对话组件 ━━━━
// 安装：npm install ai openai
// Vercel AI SDK 是最佳实践

// app/api/chat/route.ts（服务端）
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: openai('gpt-4o'),
    system: '你是一个专业的编程助手，回答简洁准确。',
    messages,
    maxTokens: 1024,
  });

  return result.toDataStreamResponse();  // 自动处理流式输出
}

// ━━━━ 客户端：使用 useChat Hook ━━━━
'use client';
import { useChat } from 'ai/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (err) => console.error('Chat error:', err),
  });

  return (
    <div className="flex flex-col h-[600px]">
      {/* 消息列表（自动滚动到底部） */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map(msg => (
          <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={msg.role === 'user'
              ? 'inline-block bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-xs'
              : 'inline-block bg-gray-800 text-gray-100 rounded-2xl px-4 py-2 max-w-lg'
            }>
              {msg.content}
              {/* isLoading 时显示打字动画 */}
              {isLoading && msg === messages.at(-1) && (
                <span className="animate-pulse ml-1">▌</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="输入消息..."
            className="flex-1 bg-gray-800 rounded-xl px-4 py-2 text-white"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 rounded-xl disabled:opacity-50"
          >
            {isLoading ? '...' : '发送'}
          </button>
        </div>
      </form>
    </div>
  );
}`,
  },
  {
    key: 'rag', name: 'RAG 聊天界面', icon: '🔍',
    desc: '基于你自己文档的 AI 问答界面（检索增强生成）',
    code: `// ━━━━ RAG（检索增强生成）前端界面 ━━━━
// 核心流程：用户问题 → 向量检索相似文档 → 拼接上下文 → LLM 回答

// app/api/rag-chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { db } from '@/lib/db';  // 你的向量数据库（pgvector/Pinecone）

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userQuestion = messages.at(-1).content;

  // 1. 将用户问题向量化
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: userQuestion,
  });

  // 2. 在向量数据库里检索最相关的文档片段
  const contexts = await db.raw(
    'SELECT content FROM documents ORDER BY embedding <-> $1 LIMIT 5',
    [JSON.stringify(embedding)]
  );

  // 3. 构建带上下文的 System Prompt
  const systemPrompt = \`你是专业助手，只根据以下文档回答：

\${contexts.map(c => c.content).join('\\n\\n')}

如果文档中没有相关信息，说明你不知道，不要编造。\`;

  // 4. 流式生成回答
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}

// ━━━━ 客户端：显示参考来源 ━━━━
'use client';
import { useChat } from 'ai/react';

function RAGChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/rag-chat',
    // 通过 data 字段获取引用来源
    onResponse: async (res) => {
      const sources = res.headers.get('X-Sources');
      if (sources) setContextSources(JSON.parse(sources));
    },
  });

  return (
    <div>
      <MessageList messages={messages} />
      {contextSources.length > 0 && (
        <div className="sources">
          <h4>📎 参考来源：</h4>
          {contextSources.map(s => (
            <a key={s.id} href={s.url}>{s.title}</a>
          ))}
        </div>
      )}
      <ChatInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} />
    </div>
  );
}`,
  },
  {
    key: 'aiapi', name: '直连 AI API', icon: '🔌',
    desc: '不用 Vercel AI SDK，直接调用 OpenAI / Claude API 的基础方法',
    code: `// ━━━━ 直接调用 OpenAI API（Next.js Route Handler）━━━━
// 不依赖第三方 SDK，适合定制化需求

// app/api/generate/route.ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // 务必放在服务端，不能暴露给前端！
});

// 普通响应（等待完整输出）
export async function POST(req: Request) {
  const { prompt, model = 'gpt-4o-mini' } = await req.json();
  
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 512,
    temperature: 0.7,
  });

  return Response.json({
    content: completion.choices[0].message.content,
    usage: completion.usage,
  });
}

// 流式响应（ReadableStream）
export async function PUT(req: Request) {
  const { messages } = await req.json();

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages,
    stream: true,   // ← 开启流式
  });

  // 转成 ReadableStream 返回给前端
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// ━━━━ 前端消费流式响应 ━━━━
async function streamChat(messages: Message[]) {
  const res = await fetch('/api/generate', {
    method: 'PUT',
    body: JSON.stringify({ messages }),
    headers: { 'Content-Type': 'application/json' },
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    setReply(prev => prev + text);  // 逐步更新 UI
  }
}`,
  },
];

export default function LessonTesting() {
  const [feat, setFeat] = useState('streaming');
  const f = AI_FEATURES.find(x => x.key === feat) ?? {};

  return (
    <div className="lesson-rt" style={{ background: 'var(--rt-bg)', minHeight: '100vh' }}>
      <div className="rt-hero">
        <div className="rt-badge" style={{ background: 'rgba(97,218,251,0.07)', borderColor: 'rgba(97,218,251,0.25)', color: '#61dafb' }}>🤖 Module 07 · AI Integration</div>
        <h1>AI 功能集成实战</h1>
        <p>React 是接入 AI 能力最顺滑的前端框架。掌握 <strong>Vercel AI SDK</strong>、流式对话组件、RAG 聊天界面，让你能快速为任何 React 应用加上 AI 超能力。</p>
      </div>

      {/* Feature Selector */}
      <div className="rt-section">
        <div className="rt-section-title">🧩 三种 AI 集成场景</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {AI_FEATURES.map(x => (
            <button key={x.key} className="rt-btn"
              style={{ background: feat === x.key ? 'rgba(97,218,251,0.1)' : undefined, borderColor: feat === x.key ? '#61dafb' : undefined, color: feat === x.key ? '#61dafb' : undefined }}
              onClick={() => setFeat(x.key)}>
              {x.icon} {x.name}
            </button>
          ))}
        </div>
        <div className="rt-card" style={{ borderColor: 'rgba(97,218,251,0.2)', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{f.icon} {f.name}</div>
          <div style={{ color: 'var(--rt-muted)', fontSize: '0.87rem' }}>{f.desc}</div>
        </div>
        <div className="rt-code-wrap">
          <div className="rt-code-head">
            <div className="rt-code-dot" style={{ background: '#ef4444' }} /><div className="rt-code-dot" style={{ background: '#f59e0b' }} /><div className="rt-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem', color: '#61dafb' }}>{f.key}.tsx</span>
          </div>
          <div className="rt-code">{f.code}</div>
        </div>
      </div>

      {/* Security */}
      <div className="rt-section">
        <div className="rt-section-title">🔒 AI 集成安全要点</div>
        <div className="rt-grid-2">
          {[
            { t: 'API Key 绝对不能暴露到前端', d: '所有 AI API 调用必须通过 Next.js Route Handler 或 Server Action，API Key 只存在服务端环境变量', icon: '🔑', color: 'rgba(239,68,68,0.15)', tc: '#f87171' },
            { t: '请求频率限制', d: '加 rate limiting（如 upstash/ratelimit），防止用户刷爆你的 API 配额', icon: '⏱️', color: 'rgba(249,115,22,0.15)', tc: '#fb923c' },
            { t: 'Prompt Injection 防护', d: '对用户输入做过滤，不要直接拼接到 system prompt 中，用结构化数据传递', icon: '🛡️', color: 'rgba(139,92,246,0.15)', tc: '#a78bfa' },
            { t: '成本控制', d: '设置 max_tokens 上限，记录每个用户的 token 消耗，超额提示或暂停服务', icon: '💰', color: 'rgba(16,185,129,0.15)', tc: '#34d399' },
          ].map((s, i) => (
            <div key={i} className="rt-card" style={{ borderColor: s.color }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span>{s.icon}</span><span style={{ fontWeight: 700, color: s.tc, fontSize: '0.9rem' }}>{s.t}</span>
              </div>
              <div style={{ color: 'var(--rt-muted)', fontSize: '0.84rem', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Stack */}
      <div className="rt-section">
        <div className="rt-section-title">📦 推荐 AI 前端技术栈</div>
        <div className="rt-code-wrap">
          <div className="rt-code-head"><span>ai-stack.md</span></div>
          <div className="rt-code">{`# React + AI 推荐技术栈 2025

## 框架
Next.js 14+（App Router）      → 服务端处理 API Key，流式响应

## AI SDK
Vercel AI SDK（ai）            → 最佳 DX，支持 OpenAI/Anthropic/Google
  ├── useChat                  → 多轮对话
  ├── useCompletion            → 单次生成
  └── generateText/streamText  → 服务端调用

## AI Provider
OpenAI GPT-4o-mini             → 性价比最高，日常任务首选
Anthropic Claude 3.5 Haiku     → 长上下文处理，安全性好
Google Gemini 2.0 Flash        → 速度最快，多模态

## 向量数据库（RAG）
pgvector（PostgreSQL 扩展）    → 无需额外服务，Supabase/Neon 支持
Pinecone                       → 托管服务，大规模首选

## UI 组件
shadcn/ui + Tailwind           → 快速搭建聊天界面
react-markdown                 → 渲染 AI 输出的 Markdown
highlight.js / shiki            → 代码高亮

## 部署
Vercel                         → 最佳 Next.js 体验，AI 功能开箱即用
Cloudflare Workers             → 边缘部署，低延迟`}</div>
        </div>
      </div>
    </div>
  );
}
