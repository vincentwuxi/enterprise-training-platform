import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Cursor 深度', 'Windsurf/Copilot', 'Context 工程', '效率对比'];

export default function LessonAIIDE() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🤖 module_01 — AI IDE 工程</div>
      <div className="fs-hero">
        <h1>AI IDE 工程：让 AI 成为你的首席副驾驶</h1>
        <p>
          2025 年，<strong>超过 70% 的专业开发者</strong>已经在使用 AI 编程辅助工具。
          但大多数人只用到 10% 的能力。本模块深入 Cursor / Windsurf / GitHub Copilot
          三大 AI IDE 的高级技巧——.cursorrules 项目规范、Context 窗口管理、
          Multi-file Composer、Agent Mode——帮你从"被动补全"升级到"主动编程"。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 AI IDE</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Cursor 深度掌控</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> .cursorrules</div>
                <pre className="fs-code">{`# —— Cursor Rules: 项目级 AI 编程规范 ——

# .cursorrules 是 Cursor 的"宪法"——
# 所有 AI 生成的代码都会遵循这份规范

# 📁 文件位置: 项目根目录/.cursorrules
# 📝 格式: Markdown

# ---- 示例: React + TypeScript 项目 ----

## 项目概述
这是一个企业级 SaaS 平台, 使用 React 18 + TypeScript + Zustand。

## 代码风格
- 使用 functional components, 禁止 class components
- 所有 props 必须定义 TypeScript interface
- 使用 named exports, 避免 default export
- CSS 使用 CSS Modules (.module.css)

## 命名规范
- 组件: PascalCase (UserProfile.tsx)
- hooks: camelCase, use 前缀 (useAuth.ts)
- 工具函数: camelCase (formatDate.ts)
- 常量: UPPER_SNAKE_CASE
- API 路由: kebab-case

## 架构约束
- 状态管理: Zustand (禁止 Redux/Context 滥用)
- 数据获取: TanStack Query (禁止 useEffect fetch)
- 表单: React Hook Form + Zod 校验
- 路由: React Router v6 (使用 loader pattern)

## 错误处理
- API 调用必须有 try/catch
- 使用 Error Boundary 包装页面组件
- 统一错误格式: { code, message, details }

## 安全规则
- 禁止硬编码任何密钥/Token
- 用户输入必须经过 sanitize
- API 响应必须类型校验

## 测试要求
- 新组件必须有对应 .test.tsx
- 使用 Vitest + Testing Library
- 关键路径 E2E 用 Playwright

# ---- 高级技巧 ----

# 1. 分层 Rules (项目 + 目录级)
# .cursorrules           ← 全局
# src/api/.cursorrules   ← API 层专属规则
# src/ui/.cursorrules    ← UI 层专属规则

# 2. 动态 Context (@引用)
# 在 Cursor Chat 中:
# @file:src/types/user.ts   ← 引用类型定义
# @folder:src/api/          ← 引用整个目录
# @web:https://docs.xxx     ← 引用在线文档
# @codebase                 ← 搜索整个代码库

# 3. Composer 多文件编辑
# Cmd+I → 描述需求 → Cursor 同时修改多个文件
# 例: "添加用户头像上传功能"
# → 同时修改 API route + 组件 + Store + Types`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🧠 Cursor Agent Mode</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> agent_mode</div>
                <pre className="fs-code">{`Cursor Agent Mode (2025+):
自主执行多步任务, 不只是补全

工作流:
┌─────────────────────────────────┐
│ 1. 用户描述需求                   │
│    "实现 GitHub OAuth 登录"       │
│                                 │
│ 2. Agent 分析 → 制定计划          │
│    ├── 安装 next-auth             │
│    ├── 创建 OAuth App 配置         │
│    ├── 添加 API route             │
│    ├── 创建登录按钮组件            │
│    ├── 更新 middleware             │
│    └── 添加 session provider      │
│                                 │
│ 3. 逐步执行 (可中断/修改)          │
│    ├── 读取现有代码 → 理解架构      │
│    ├── 生成代码 → 写入文件          │
│    ├── 运行终端命令 (npm install)   │
│    └── 自我验证 (检查类型错误)      │
│                                 │
│ 4. 用户审查 → Accept/Reject       │
└─────────────────────────────────┘

Agent 能力矩阵:
┌──────────┬──────┬──────┬────────┐
│ 能力      │Tab补全│Chat  │Agent   │
├──────────┼──────┼──────┼────────┤
│ 单行补全  │ ✅   │ -    │ -      │
│ 多行生成  │ ✅   │ ✅   │ ✅     │
│ 多文件编辑│ -    │ 手动 │ ✅自动 │
│ 读取文件  │ -    │ @引用│ ✅自动 │
│ 终端操作  │ -    │ -    │ ✅     │
│ 自我修复  │ -    │ -    │ ✅     │
│ 上下文理解│ 当前行│当前文件│全项目  │
└──────────┴──────┴──────┴────────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📋 高效 Prompt 模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> prompt_patterns</div>
                <pre className="fs-code">{`# AI IDE 高效 Prompt 模式大全

# 1. 📐 架构模式 (先设计后编码)
"设计一个支付模块的架构:
 - 支持微信/支付宝/Stripe
 - 幂等性保证
 - 异步通知处理
 先给出接口定义和数据模型,
 不要写实现代码。"

# 2. 🔍 诊断模式 (定位问题)
"这个组件在 Safari 上渲染异常,
 可能的原因有哪些?
 请按可能性从高到低排列,
 并给出每种原因的验证方法。"

# 3. 🔄 重构模式 (改善质量)
"重构这个函数:
 - 消除重复代码
 - 提高可测试性
 - 保持 API 不变
 @file:src/utils/parser.ts"

# 4. 📝 文档模式 (生成文档)
"为这个 API 模块生成:
 1. JSDoc 注释
 2. README 使用示例
 3. OpenAPI Schema
 @folder:src/api/payments/"

# 5. 🧪 测试模式 (生成测试)
"为 @file:src/hooks/useCart.ts
 生成完整测试:
 - 覆盖所有分支
 - 包含边界情况
 - Mock API 调用
 使用 Vitest + Testing Library"

# ⚠️ 反模式 (避免):
# ❌ "帮我写个好的代码" (太模糊)
# ❌ 一次性提出 10 个需求 (太多)
# ❌ 不提供上下文 (缺少@引用)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🏄 Windsurf (Codeium)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> windsurf</div>
                <pre className="fs-code">{`# Windsurf: Codeium 的 AI IDE

核心差异化: Cascade (级联 Agent)
┌──────────────────────────────┐
│ Cascade = 多步推理 Agent       │
│                              │
│ 1. 理解整个代码库 (codebase)   │
│ 2. 多文件协同编辑              │
│ 3. 终端命令执行                │
│ 4. 自动安装依赖                │
│ 5. 实时预览                   │
│ 6. 错误自动修复                │
└──────────────────────────────┘

特色功能:
├── Supercomplete: 预测下一步操作
│   (不只补全代码, 预测你要做什么)
├── Cascade Write: 多文件并行编辑
├── Cascade Chat: 带代码库上下文
├── 内置终端集成: Agent 可执行命令
└── 免费额度较大 (比 Cursor 慷慨)

Windsurf vs Cursor vs Copilot:
┌──────────┬────────┬────────┬────────┐
│ 功能      │Windsurf│ Cursor │Copilot │
├──────────┼────────┼────────┼────────┤
│ 代码补全  │ ⭐⭐⭐⭐│ ⭐⭐⭐⭐│ ⭐⭐⭐⭐│
│ Agent模式 │ ⭐⭐⭐⭐│ ⭐⭐⭐⭐⭐│ ⭐⭐⭐ │
│ 多文件编辑│ ⭐⭐⭐⭐│ ⭐⭐⭐⭐⭐│ ⭐⭐⭐ │
│ 代码库理解│ ⭐⭐⭐⭐│ ⭐⭐⭐⭐│ ⭐⭐⭐ │
│ 价格      │ $10/月 │ $20/月 │ $10/月 │
│ 免费额度  │ 大     │ 中     │ 少     │
│ VS Code  │ Fork   │ Fork   │ 插件   │
│ 离线支持  │ 部分   │ 部分   │ ❌     │
└──────────┴────────┴────────┴────────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🐙 GitHub Copilot 进阶</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> copilot</div>
                <pre className="fs-code">{`# GitHub Copilot 2025 进阶功能

# 1. Copilot Workspace (Preview)
# 从 Issue → 代码的完整工作流
# Issue描述 → 计划 → 代码 → PR
# 全程 AI 驱动, 人类审核

# 2. Copilot Chat 高级用法
# /explain   解释代码
# /tests     生成测试
# /fix       修复问题
# /doc       生成文档
# /optimize  优化性能
# @workspace 搜索项目
# @terminal  分析错误

# 3. Copilot in CLI
$ gh copilot suggest "find large files"
# 建议: find . -type f -size +100M

$ gh copilot explain "awk '{print $2}'"
# 解释: 打印每行的第二个字段

# 4. Copilot for PR
# 自动生成 PR 描述和摘要
# 自动审查代码变更
# 建议改进和最佳实践

# 5. Copilot Extensions
# 自定义 Agent:
# @docker: Docker 专家
# @azure:  Azure 部署
# @sentry: 错误追踪
# 企业可创建内部 Extensions

# 6. .github/copilot-instructions.md
# 项目级 Copilot 指令 (类似 .cursorrules)
# 定义编码规范和项目上下文`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 Context 工程: AI 编程的核心技能</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> context_engineering.md</div>
                <pre className="fs-code">{`# Context 工程: 决定 AI 编码质量的关键

核心洞察: AI 生成代码的质量 = f(Context 质量)
          Context 不够 → 幻觉代码
          Context 过多 → 注意力稀释
          Context 精准 → 高质量输出

四层 Context 架构:
┌──────────────────────────────────────────┐
│ Layer 4: 项目规范 (.cursorrules)           │
│ → 编码风格/架构约束/安全规则               │
├──────────────────────────────────────────┤
│ Layer 3: 代码库 Context (@codebase)        │
│ → 相关文件/类型定义/依赖关系               │
├──────────────────────────────────────────┤
│ Layer 2: 当前文件 Context                  │
│ → 导入/函数签名/周围代码                   │
├──────────────────────────────────────────┤
│ Layer 1: 用户意图 (Prompt)                 │
│ → 自然语言描述/示例/约束                   │
└──────────────────────────────────────────┘

Context 窗口管理策略:

1. 最小充分原则
   ✅ @file:src/types/user.ts    ← 只引用需要的
   ❌ @folder:src/               ← 全引太多噪声

2. 类型优先策略
   先引入类型定义 → AI 自动推导实现
   @file:types/api.d.ts
   @file:types/database.d.ts
   "根据这些类型实现 UserService"

3. 示例驱动策略
   @file:src/api/products.ts  ← 已有的好代码
   "参考这个文件的风格, 实现 OrdersAPI"

4. 渐进式 Context
   第一步: 只给接口定义 → 生成骨架
   第二步: 加入数据库 schema → 完善实现
   第三步: 加入测试用例 → 修复边界

Context 预算分配 (128K 窗口):
┌─────────────┬───────┬──────────────┐
│ 内容         │ 占比  │ Token 估算    │
├─────────────┼───────┼──────────────┤
│ 系统规则     │ ~5%  │ ~6K          │
│ 代码库文件   │ ~40% │ ~50K         │
│ 当前文件     │ ~15% │ ~20K         │
│ 对话历史     │ ~20% │ ~25K         │
│ AI 输出空间  │ ~20% │ ~25K         │
└─────────────┴───────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 AI IDE 效率实测对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> benchmark</div>
                <pre className="fs-code">{`AI IDE 效率实测 (2025 Q2 数据):

测试场景: 从零实现一个 Todo API + 前端
┌──────────────┬────────┬────────┬────────┬────────┐
│ 指标          │ 纯手写 │Copilot │ Cursor │ Claude │
│              │        │  Chat  │ Agent  │  Code  │
├──────────────┼────────┼────────┼────────┼────────┤
│ 完成时间      │ 4.5h  │ 2.8h   │ 1.5h   │ 0.8h   │
│ 代码行数      │ 850   │ 920    │ 880    │ 910    │
│ Bug 数量      │ 3     │ 5      │ 4      │ 6      │
│ 测试覆盖率    │ 65%   │ 72%    │ 85%    │ 78%    │
│ 代码质量(1-10)│ 8.5   │ 7.5    │ 8.0    │ 7.0    │
│ 人工审查时间  │ 0     │ 15min  │ 20min  │ 30min  │
└──────────────┴────────┴────────┴────────┴────────┘

关键发现:
1. AI 加速 2-5x, 但 Bug 也增多
2. Agent 模式最快, 但需要更多审查
3. "AI 生成 + 人类审查" > 纯人写
4. 项目规范(.cursorrules) 能减少 40% Bug

不同任务类型的最佳工具选择:
┌───────────────┬──────────────────────┐
│ 任务类型       │ 推荐工具              │
├───────────────┼──────────────────────┤
│ 日常编码       │ Copilot Tab补全       │
│ 功能实现       │ Cursor Composer       │
│ 新项目脚手架   │ Claude Code / Agent   │
│ 代码审查       │ Copilot for PR        │
│ 调试修复       │ Cursor Chat + @error  │
│ 文档编写       │ Copilot /doc          │
│ 重构优化       │ Cursor Agent Mode     │
│ 原型开发       │ v0.dev / bolt.new     │
│ 遗留系统       │ Claude Code (大上下文)│
└───────────────┴──────────────────────┘

投资回报 (ROI) 测算:
├── Cursor Pro: $20/月 × 12 = $240/年
├── 效率提升: ~40% (保守估计)
├── 初级开发者年薪: $80K
├── 节省: $80K × 40% = $32K/年
└── ROI: $32K / $240 = 133x 回报`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
