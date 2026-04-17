import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['v0.dev/bolt.new', 'Lovable/Replit', '工作流对比', '企业应用'];

export default function LessonPromptToApp() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🤖 module_05 — Prompt-to-App</div>
      <div className="fs-hero">
        <h1>Prompt-to-App：从一句话到完整应用</h1>
        <p>
          "用一句话生成一个完整的 Web 应用"——<strong>v0.dev / bolt.new / Lovable / Replit Agent</strong>
          正在让这成为现实。这不是玩具级 Demo，而是生产级代码：
          响应式 UI + 数据库 + API + 认证 + 部署——30 分钟内完成以往需要一周的工作。
          本模块深度对比各平台的能力边界、最佳工作流和企业级应用场景。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🚀 Prompt-to-App</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🎨 v0.dev (Vercel)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> v0_dev</div>
                <pre className="fs-code">{`# v0.dev: Vercel 的 AI UI 生成器

定位: UI 组件 → 页面 → 全栈应用
技术栈: React + Next.js + shadcn/ui + Tailwind

核心能力:
┌──────────────────────────────────┐
│ 1. 文字描述 → UI 组件            │
│    "做一个暗色主题的定价页面,     │
│     包含3个方案的对比卡片"        │
│                                  │
│ 2. 截图 → 代码还原               │
│    上传 Figma/Dribbble 截图      │
│    → 像素级别还原为 React 代码    │
│                                  │
│ 3. 迭代优化                      │
│    "把按钮改成圆角,               │
│     添加hover渐变效果,            │
│     价格用更大的字号"             │
│                                  │
│ 4. 一键部署                      │
│    → Vercel 自动部署 + CDN        │
└──────────────────────────────────┘

输出质量:
├── 响应式设计 (Mobile First)
├── Accessibility (aria标签)
├── TypeScript 类型安全
├── shadcn/ui 组件库
├── 可直接 npm install 使用
└── 支持导出到 Next.js 项目

局限性:
├── UI 为主, 后端逻辑较弱
├── 复杂交互需要手动调整
├── 数据库/API 需额外实现
└── 定制化有限 (shadcn 风格)

定价:
├── Free: 200 生成/月
├── Premium: $20/月 (无限)
└── Team: $30/人/月`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>⚡ bolt.new (StackBlitz)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> bolt_new</div>
                <pre className="fs-code">{`# bolt.new: 浏览器内全栈开发

定位: 全栈应用 (前端+后端+DB)
技术栈: 灵活 (React/Vue/Svelte/Node)

核心差异: WebContainer
┌──────────────────────────────────┐
│ 其他工具: 生成代码 → 用户自己运行 │
│                                  │
│ bolt.new: 生成代码 → 浏览器内运行 │
│ ├── Node.js 在浏览器内执行        │
│ ├── npm install 在浏览器内运行    │
│ ├── 实时预览 (无需等待部署)       │
│ └── SQLite 在浏览器内运行        │
└──────────────────────────────────┘

示例 Prompt:
"创建一个项目管理工具:
 - 看板视图 (拖拽排序)
 - 用户登录 (邮箱+密码)
 - SQLite 数据存储
 - 暗色主题
 - 响应式设计"

bolt.new 会:
1. 初始化 Vite + React 项目
2. 安装依赖 (dnd-kit, better-sqlite3)
3. 创建 DB schema + API routes
4. 生成前端组件 (Board, Card, Auth)
5. 实时预览 (浏览器内运行)
6. 一键部署到 Netlify

优势:
├── 全栈完整 (非仅UI)
├── 实时运行预览
├── 支持文件编辑 (像真IDE)
├── 可导出完整项目
└── 免费额度较多

局限:
├── 复杂后端受限 (WebContainer)
├── 不支持容器化服务
└── 数据库仅 SQLite (浏览器限制)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>💝 Lovable (原 GPT Engineer)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> lovable</div>
                <pre className="fs-code">{`# Lovable: AI 全栈应用构建器

定位: MVP 快速交付
技术栈: React + Supabase + Tailwind

核心流程:
┌──────────────────────────────────┐
│ Prompt → 完整应用 → 一键部署     │
│                                  │
│ 后端: Supabase (PostgreSQL)      │
│ ├── 自动创建表结构               │
│ ├── 自动配置 RLS 策略            │
│ ├── 自动生成 API                │
│ └── 自动配置认证 (Auth)          │
│                                  │
│ 前端: React + shadcn/ui          │
│ ├── 响应式页面                   │
│ ├── 表单验证                     │
│ ├── 实时数据订阅                 │
│ └── 路由和导航                   │
│                                  │
│ 部署: 一键到 Lovable 云          │
│ └── 自定义域名支持               │
└──────────────────────────────────┘

真实案例:
"创建一个餐厅预订系统:
 - 餐厅列表 (搜索+筛选)
 - 在线预订 (选日期/时间/人数) 
 - 用户账户 (预订历史)
 - 餐厅后台 (管理预订)
 - 邮件通知"

→ 45 分钟完成, 包含:
  10+ 页面, 15+ API, 5 个表
  支持 100+ 并发用户

适合:
├── 创业 MVP
├── 内部工具
├── 客户 Demo
└── Hackathon 项目`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🤖 Replit Agent</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> replit_agent</div>
                <pre className="fs-code">{`# Replit Agent: 云端 AI 开发环境

定位: 端到端应用开发+部署
环境: 完整 Linux 容器

核心差异: 真实执行环境
┌──────────────────────────────────┐
│ v0.dev:    生成代码              │
│ bolt.new:  浏览器沙箱            │
│ Lovable:   受限技术栈            │
│                                  │
│ Replit:    完整 Linux 环境       │
│ ├── 任意语言 (Python/Go/Rust)    │
│ ├── 任意数据库 (PostgreSQL/Redis)│
│ ├── Docker 容器                  │
│ ├── 自定义系统包                 │
│ └── 后台任务/定时任务            │
└──────────────────────────────────┘

Agent 工作流:
1. 描述需求 (自然语言)
2. Agent 制定开发计划
3. 创建文件结构
4. 编写代码 (逐文件)
5. 安装依赖 (npm/pip/cargo)
6. 运行和调试
7. 部署到 Replit 云

优势:
├── 技术栈无限制
├── 真实服务器环境  
├── 持久化数据库
├── WebSocket/长连接
├── 定时任务/后台服务
└── 多人协作

局限:
├── 生成速度较慢 (完整环境)
├── 资源限制 (免费层)
├── 部署性能受限
└── 不适合大型项目`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 Prompt-to-App 工具全面对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> comparison</div>
                <pre className="fs-code">{`# Prompt-to-App 工具全面对比 (2025 Q2)

┌──────────────┬─────────┬──────────┬──────────┬──────────┐
│ 维度          │ v0.dev  │ bolt.new │ Lovable  │ Replit   │
├──────────────┼─────────┼──────────┼──────────┼──────────┤
│ 前端质量      │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐  │ ⭐⭐⭐   │
│ 后端能力      │ ⭐⭐     │ ⭐⭐⭐   │ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐⭐│
│ 数据库支持    │ ❌      │ SQLite  │ Supabase │ 任意DB   │
│ 用户认证      │ ❌      │ 基础    │ ✅ 完整  │ ✅ 完整  │
│ 实时预览      │ ✅      │ ✅      │ ✅       │ ✅       │
│ 代码导出      │ ✅      │ ✅      │ ✅       │ ✅       │
│ 部署          │ Vercel  │ Netlify │ Lovable  │ Replit   │
│ 迭代优化      │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐  │ ⭐⭐⭐   │
│ 学习曲线      │ 低      │ 低      │ 低       │ 中       │
│ 月费          │ $20     │ $20     │ $25      │ $25      │
│ 最佳场景      │ UI组件  │ 原型    │ MVP      │ 全栈     │
└──────────────┴─────────┴──────────┴──────────┴──────────┘

场景推荐矩阵:
┌─────────────────────┬──────────────────┐
│ 需求                 │ 推荐工具          │
├─────────────────────┼──────────────────┤
│ 落地页/营销页面      │ v0.dev           │
│ 组件库/设计系统      │ v0.dev           │
│ 快速原型/验证想法    │ bolt.new         │
│ 创业 MVP (含后端)   │ Lovable          │
│ 内部工具/管理后台    │ Lovable / Replit │
│ 复杂全栈应用        │ Replit Agent      │
│ 特殊技术栈 (Python)  │ Replit Agent      │
│ Hackathon 48h       │ bolt.new          │
│ 客户演示/POC        │ Lovable           │
└─────────────────────┴──────────────────┘

投资回报 (创业场景):
传统开发 MVP: 2 开发者 × 4 周 = $16,000
Prompt-to-App: 1 人 × 1 周 = $1,500 (工具+人力)
节省: 90% 成本, 75% 时间`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏢 企业级应用实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> enterprise</div>
                <pre className="fs-code">{`# Prompt-to-App 企业级实战模式

# 模式 1: AI 原型 → 人工精制
┌─────────────────────────────────────┐
│ Day 1: AI 生成 MVP (bolt.new)       │
│ Day 2-3: 人工精制核心逻辑           │
│ Day 4: AI 生成测试                  │
│ Day 5: 部署到 staging               │
│ Week 2: 用户测试 → 迭代             │
└─────────────────────────────────────┘

# 模式 2: AI 组件库 → 组装应用
┌─────────────────────────────────────┐
│ 1. v0.dev 生成 UI 组件库            │
│    (导航/表单/表格/图表/auth...)     │
│                                     │
│ 2. 人工搭建应用架构                  │
│    (路由/状态管理/API层)             │
│                                     │
│ 3. 组装组件 + 接入后端               │
│                                     │
│ 4. AI 辅助精制                      │
│    (性能优化/accessibility/测试)     │
└─────────────────────────────────────┘

# 模式 3: 内部工具批量生产
企业痛点: 每个部门都需要内部工具
传统: 排队等 IT 部门开发 (6个月+)

AI 方案:
├── HR: "员工请假审批系统" → 2天
├── 财务: "报销审核看板" → 1天  
├── 运营: "数据指标 Dashboard" → 3天
├── 销售: "客户跟进 CRM" → 3天
└── 总计: 9天 vs 传统 24个月

⚠️ Prompt-to-App 的边界:
├── ✅ 适合: CRUD / 表单 / Dashboard
├── ✅ 适合: < 20 页面的应用
├── ⚠️ 谨慎: 复杂业务逻辑
├── ❌ 不适合: 实时系统 (交易/游戏)
├── ❌ 不适合: 高并发系统
└── ❌ 不适合: 安全关键系统`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
