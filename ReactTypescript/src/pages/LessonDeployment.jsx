import { useState } from 'react';
import './LessonCommon.css';

const WEEK_PLAN = [
  {
    day: 'Day 1-2', title: '项目搭建 & 认证',
    tasks: ['npx create-next-app@latest --typescript --tailwind --app', '配置 shadcn/ui + 数据库（Supabase/Neon）', '实现 NextAuth.js 邮箱+GitHub 登录', 'Prisma 数据库 Schema 设计'],
    code: `# Day 1: 项目初始化
npx create-next-app@latest ai-dashboard \\
  --typescript --tailwind --app --eslint

cd ai-dashboard

# 添加核心依赖
npm install @prisma/client prisma
npm install next-auth @auth/prisma-adapter
npm install @tanstack/react-query zustand
npm install ai @ai-sdk/openai
npx shadcn@latest init
npx shadcn@latest add button input dialog table card

# 初始化 Prisma
npx prisma init --datasource-provider postgresql

# schema.prisma
# model User {
#   id        String   @id @default(cuid())
#   email     String   @unique
#   name      String?
#   chats     Chat[]
#   createdAt DateTime @default(now())
# }
# model Chat {
#   id        String    @id @default(cuid())
#   userId    String
#   user      User      @relation(fields: [userId], references: [id])
#   messages  Message[]
#   createdAt DateTime  @default(now())
# }
# model Message {
#   id      String @id @default(cuid())
#   chatId  String
#   chat    Chat   @relation(fields: [chatId], references: [id])
#   role    String  // "user" | "assistant"
#   content String
#   createdAt DateTime @default(now())
# }

npx prisma db push   # 同步到数据库
npx prisma generate  # 生成类型`,
    output: '可登录的 Next.js 应用 + 数据库已就绪',
  },
  {
    day: 'Day 3-4', title: 'AI 对话功能',
    tasks: ['Next.js Route Handler 实现流式 AI API', '用 Vercel AI SDK useChat 实现前端对话', '消息持久化到数据库', '对话历史列表 + 侧边栏'],
    code: `// Day 3: AI 对话核心功能

// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { messages, chatId } = await req.json();
  const userId = session.user.id!;

  // 保存用户消息到数据库
  await db.message.create({
    data: {
      chatId,
      role: 'user',
      content: messages.at(-1).content,
    },
  });

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: '你是一个专业、友好的 AI 助手。',
    messages,
    onFinish: async ({ text }) => {
      // 流式结束后，保存 AI 回复
      await db.message.create({
        data: { chatId, role: 'assistant', content: text },
      });
    },
  });

  return result.toDataStreamResponse();
}

// components/ChatWindow.tsx
'use client';
import { useChat } from 'ai/react';
import { useAutoScroll } from '@/hooks/useAutoScroll';

export function ChatWindow({ chatId }: { chatId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { chatId },  // 告诉服务端保存到哪个对话
    initialMessages: [],
  });

  const bottomRef = useAutoScroll([messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}`,
    output: '完整 AI 对话功能，历史记录持久化',
  },
  {
    day: 'Day 5', title: 'Dashboard & 数据可视化',
    tasks: ['用 Recharts/Chart.js 展示用量统计', '用 React Query 获取 Dashboard 数据', '响应式 Layout（Sidebar + Main）', 'Server Component 优化首屏'],
    code: `// Day 5: Dashboard 页面（Server Component）

// app/dashboard/page.tsx
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { StatsCards } from '@/components/StatsCards';
import { UsageChart } from '@/components/UsageChart';
import { RecentChats } from '@/components/RecentChats';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id!;

  // 服务端直接查数据库，并行获取
  const [stats, recentChats, dailyUsage] = await Promise.all([
    db.message.aggregate({
      where: { chat: { userId } },
      _count: { _all: true },
    }),
    db.chat.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { messages: { take: 1 } },
    }),
    getDailyUsage(userId),  // 最近 7 天用量
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📊 使用概览</h1>
      
      {/* 统计卡片 */}
      <StatsCards totalMessages={stats._count._all} />

      {/* 折线图 */}
      <UsageChart data={dailyUsage} />

      {/* 最近对话 */}
      <RecentChats chats={recentChats} />
    </div>
  );
}

// components/UsageChart.tsx（客户端组件）
'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function UsageChart({ data }: { data: DailyData[] }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">最近 7 天消息量</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#475569" fontSize={12} />
          <YAxis stroke="#475569" fontSize={12} />
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}`,
    output: 'Dashboard 页面 + 数据可视化图表',
  },
  {
    day: 'Day 6-7', title: '测试 & 部署上线',
    tasks: ['Vitest 单测核心工具函数', 'Playwright E2E 测试登录+发消息流程', 'next.config.js 性能优化配置', '部署到 Vercel + 配置环境变量'],
    code: `// Day 6: 测试 + Day 7: 部署

// ━━━━ Vitest 单元测试 ━━━━
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom', globals: true },
});

// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatMessageDate, truncateMessage } from '@/lib/utils';

describe('formatMessageDate', () => {
  it('今天的消息显示时间', () => {
    const now = new Date();
    expect(formatMessageDate(now)).toMatch(/\\d{2}:\\d{2}/);
  });
  it('昨天显示"昨天"', () => {
    const yesterday = new Date(Date.now() - 86400000);
    expect(formatMessageDate(yesterday)).toBe('昨天');
  });
});

describe('truncateMessage', () => {
  it('超长消息截断加省略号', () => {
    const long = 'a'.repeat(200);
    expect(truncateMessage(long, 100)).toHaveLength(103);  // 100 + '...'
  });
});

// ━━━━ Playwright E2E 测试 ━━━━
// tests/chat.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AI Chat', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟已登录状态
    await page.goto('/');
    await page.getByTestId('login-btn').click();
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('发送消息并收到回复', async ({ page }) => {
    await page.getByTestId('new-chat-btn').click();
    await page.getByTestId('chat-input').fill('你好！');
    await page.getByTestId('send-btn').click();
    // 等待 AI 回复（流式输出，最多等 10s）
    await expect(page.getByTestId('assistant-message')).toBeVisible({ timeout: 10000 });
  });
});

# ━━━━ 部署到 Vercel ━━━━
# 1. 推送到 GitHub
# 2. Vercel 导入项目，自动检测 Next.js
# 3. 配置环境变量：
#    OPENAI_API_KEY=sk-xxx
#    DATABASE_URL=postgresql://...
#    NEXTAUTH_SECRET=$(openssl rand -base64 32)
#    NEXTAUTH_URL=https://your-domain.vercel.app
# 4. 部署！约需 2 分钟`,
    output: '测试通过 + 线上可访问的 AI 应用 🎉',
  },
];

export default function LessonDeployment() {
  const [day, setDay] = useState(0);
  const p = WEEK_PLAN[day];

  return (
    <div className="lesson-rt" style={{ background: 'var(--rt-bg)', minHeight: '100vh' }}>
      <div className="rt-hero">
        <div className="rt-badge" style={{ background: 'rgba(59,130,246,0.07)', borderColor: 'rgba(59,130,246,0.25)', color: '#60a5fa' }}>🚀 Module 08 · Capstone Project</div>
        <h1>实战项目 — 构建 AI 驱动的全栈应用</h1>
        <p>7 天端到端，从零搭建一个真实可用的 <strong>AI 对话 Dashboard 应用</strong>：Next.js 14 + TypeScript + Zustand + React Query + Vercel AI SDK + Prisma + 部署上线。</p>
      </div>

      <div className="rt-interactive">
        <h3>📅 7 天项目计划</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {WEEK_PLAN.map((p, i) => (
            <button key={i} className="rt-btn"
              style={{ background: day === i ? 'rgba(59,130,246,0.18)' : undefined, borderColor: day === i ? '#3b82f6' : undefined, color: day === i ? '#60a5fa' : undefined }}
              onClick={() => setDay(i)}>
              {p.day}
            </button>
          ))}
        </div>

        <div className="rt-card" style={{ borderColor: 'rgba(59,130,246,0.25)', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', color: '#60a5fa' }}>{p.day} — {p.title}</div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--rt-muted)', fontSize: '0.87rem', lineHeight: 2 }}>
            {p.tasks.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: '0.85rem', color: '#34d399' }}>
            📦 产出：{p.output}
          </div>
        </div>
        <div className="rt-code-wrap">
          <div className="rt-code-head">
            <div className="rt-code-dot" style={{ background: '#ef4444' }} /><div className="rt-code-dot" style={{ background: '#f59e0b' }} /><div className="rt-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{p.day.toLowerCase().replace(/\s+/g, '-')}.ts</span>
          </div>
          <div className="rt-code">{p.code}</div>
        </div>
      </div>

      <div className="rt-section">
        <div className="rt-section-title">🏁 最终项目功能清单</div>
        <div className="rt-code-wrap">
          <div className="rt-code-head"><span>final-project-checklist.md</span></div>
          <div className="rt-code">{`# AI Dashboard 功能清单

## 认证系统
✅ NextAuth.js 邮箱 + GitHub OAuth 登录
✅ 会话持久化 + middleware 保护路由

## AI 对话
✅ OpenAI GPT-4o-mini 流式对话（逐字输出）
✅ 对话历史持久化（Prisma + PostgreSQL）
✅ 多对话管理（新建/删除/重命名）
✅ Markdown 格式化 + 代码高亮

## Dashboard
✅ 使用量统计（总消息数、今日用量）
✅ 7天折线图（Recharts）
✅ 最近对话列表

## 技术质量
✅ TypeScript 全覆盖（strict mode）
✅ React Query 数据缓存
✅ Zustand 全局 UI 状态（侧边栏开关、主题）
✅ Vitest 单元测试覆盖率 > 60%
✅ Playwright E2E 核心流程测试

## 部署
✅ Vercel 云端部署
✅ 环境变量安全管理
✅ Vercel Analytics 监控 Web Vitals

## 可选进阶
□ RAG：上传 PDF → AI 基于文档回答
□ 图片生成：DALL-E 3 集成
□ 语音输入：Web Speech API
□ 导出对话为 Markdown/PDF

恭喜完成 React + TypeScript 全栈课程！🎉`}</div>
        </div>
      </div>
    </div>
  );
}
