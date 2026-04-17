import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Claude Code', 'Codex CLI', 'OpenHands/Devin', '实战对比'];

export default function LessonAgenticCoding() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🤖 module_02 — Agentic Coding</div>
      <div className="fs-hero">
        <h1>Agentic Coding：AI 自主编程的新时代</h1>
        <p>
          从"辅助编程"到"自主编程"——<strong>Claude Code / Codex CLI / OpenHands / Devin</strong>
          代表了 AI 编程的范式转变。不再是一行一行补全，而是描述目标后 AI 自主完成：
          读取代码库、规划方案、编写代码、运行测试、修复错误——全程自动化。
          本模块深度解析 Agentic Coding 的架构、能力边界与最佳实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦾 Agentic Coding</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🟣 Claude Code 深度实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> claude_code.sh</div>
                <pre className="fs-code">{`# —— Claude Code: Anthropic 的终端 AI Agent ——

# 安装 & 启动
$ npm install -g @anthropic-ai/claude-code
$ claude    # 进入交互模式

# 核心能力架构:
┌─────────────────────────────────────────┐
│              Claude Code                 │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ 代码读取  │  │ 文件编辑  │  │ 终端   ││
│  │ Read Code │  │ Write    │  │ Bash   ││
│  └────┬─────┘  └────┬─────┘  └───┬────┘│
│       │              │            │      │
│  ┌────┴──────────────┴────────────┴────┐│
│  │        思考 → 规划 → 执行 → 验证     ││
│  │     (200K Context Window)           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘

# 实战用例:

# 1. 功能开发 (最常见)
> 实现用户认证模块, 使用 JWT + Redis Session,
  支持 OAuth2 (Google/GitHub), 包含完整测试

# Claude Code 会:
# ├── 扫描项目结构 (package.json, tsconfig)
# ├── 理解现有代码架构 (路由/中间件/DB模型)
# ├── 制定实现计划 (6-8 步)
# ├── 安装依赖 (npm install jsonwebtoken ioredis)
# ├── 创建/修改 8-12 个文件
# ├── 运行测试 (自动修复失败用例)
# └── 总结变更 (类似 PR 描述)

# 2. Bug 修复
> 用户报告: 在 Safari 上登录后页面闪烁。
  检查 auth flow 并修复。

# 3. 代码迁移
> 将 src/legacy/ 下的 jQuery 代码
  迁移到 React 组件, 保持功能一致。

# 4. CLAUDE.md (项目记忆文件)
# 类似 .cursorrules 但更强大
# Claude Code 会自动读取并遵循

# ---- CLAUDE.md 示例 ----
## 项目架构
- monorepo (pnpm workspaces)
- packages/api: Express + Prisma
- packages/web: Next.js 14 (App Router)
- packages/shared: 共享类型和工具

## 开发规范
- 所有 API 端点必须有 Zod 校验
- 数据库操作统一在 repository 层
- 禁止在 component 中直接调用 API

## 常见陷阱
- Prisma 不支持 Edge Runtime (用 API Route)
- Redis 连接需要 TLS (production 环境)
- 前端路由使用 i18n middleware

## 测试
- pnpm test: 运行所有测试
- pnpm test:api: 只测 API
- pnpm test:e2e: Playwright E2E`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🧪 OpenAI Codex CLI</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> codex_cli.sh</div>
                <pre className="fs-code">{`# OpenAI Codex CLI: 开源终端 Agent

# 安装
$ npm install -g @openai/codex
$ codex "实现一个 Redis 缓存中间件"

# 三种运行模式:
┌────────────────────────────────┐
│ 1. suggest (建议模式)           │
│    只展示计划, 不执行            │
│    codex --mode suggest "..."  │
├────────────────────────────────┤
│ 2. auto-edit (自动编辑)         │
│    自动编辑文件, 终端需确认      │
│    codex --mode auto-edit "..." │
├────────────────────────────────┤
│ 3. full-auto (全自动)           │
│    完全自主, 包括运行命令        │
│    codex --mode full-auto "..." │
│    ⚠️ 需要沙箱环境              │
└────────────────────────────────┘

# 特色: 本地沙箱安全执行
# 使用 Docker/Firecracker 隔离
# AI 运行的命令在沙箱中执行
# 不会影响宿主系统

# 支持自定义模型:
$ OPENAI_MODEL=gpt-4o codex "..."
$ OPENAI_MODEL=o3-mini codex "..."

# 与 Claude Code 对比:
┌──────────┬───────────┬──────────┐
│ 特性      │Claude Code│Codex CLI │
├──────────┼───────────┼──────────┤
│ 模型      │Claude 4  │GPT-4o/o3│
│ 上下文    │200K      │128K     │
│ 沙箱      │❌ 直接执行│✅ Docker │
│ 开源      │❌        │✅       │
│ 价格      │API 计费  │API 计费 │
│ 最佳场景  │大型重构  │安全实验 │
└──────────┴───────────┴──────────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🤖 自主编程最佳实践</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> best_practices</div>
                <pre className="fs-code">{`# Agentic Coding 最佳实践

# 🟢 适合 Agent 的任务:
├── CRUD API 端点实现
├── 组件批量创建 (表单/列表/详情页)
├── 测试用例批量生成
├── 代码迁移 (框架/语言/版本)
├── 文档生成 (API/README/注释)
├── 配置文件创建 (CI/CD/Docker)
└── 样板代码 (boilerplate)

# 🔴 不适合 Agent 的任务:
├── 核心算法设计 (需要创造性)
├── 安全关键代码 (加密/认证)
├── 性能瓶颈优化 (需要 profiling)
├── 复杂并发/分布式逻辑
└── 业务规则决策 (需要领域专家)

# 📋 使用清单:
1. ✅ 提供足够上下文
   - CLAUDE.md / .cursorrules
   - 相关代码文件引用
   
2. ✅ 分步骤给任务
   ❌ "重写整个项目"
   ✅ "先迁移 auth 模块, 然后..."
   
3. ✅ 设置验证检查点
   - Agent 完成一步 → 人工审查
   - 运行测试确认无回归
   
4. ✅ 版本控制保护
   - 先 commit 当前状态
   - Agent 在新 branch 操作
   - 出问题随时 git revert

5. ✅ 安全边界
   - 禁止访问 .env 文件
   - 禁止 npm publish
   - 禁止删除 production DB`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🖐️ OpenHands (前 OpenDevin)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> openhands</div>
                <pre className="fs-code">{`# OpenHands: 开源 AI 软件工程师

# 核心理念:
# AI Agent = 一个虚拟开发者
# 有自己的 IDE + Terminal + Browser

架构:
┌──────────────────────────────┐
│         OpenHands Agent       │
│  ┌────────────────────────┐  │
│  │   LLM (Claude/GPT/本地) │  │
│  └────────┬───────────────┘  │
│           │                  │
│  ┌────────┴───────────────┐  │
│  │     Action Space        │  │
│  │  ├── CodeAction (写代码) │  │
│  │  ├── CmdAction (终端)   │  │
│  │  ├── BrowseAction (浏览)│  │
│  │  ├── FileRead (读文件)  │  │
│  │  └── FileWrite (写文件) │  │
│  └────────────────────────┘  │
│           │                  │
│  ┌────────┴───────────────┐  │
│  │    Docker Sandbox       │  │
│  │    (安全隔离执行)        │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

# 启动:
$ docker run -p 3000:3000 \\
  ghcr.io/all-hands-ai/openhands
# 打开 localhost:3000

优势:
├── 完全开源 (MIT License)
├── 支持任意 LLM 后端
├── Docker 沙箱隔离
├── Web UI 可视化操作
├── SWE-bench 排名前列
└── 社区活跃 (30K+ Stars)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🌟 Devin & 商业方案</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> devin</div>
                <pre className="fs-code">{`# Devin: Cognition 的 AI 软件工程师

# 定位: 异步 AI 开发者
# 不是实时辅助, 而是"分配任务后自主完成"

工作模式:
┌────────────────────────────────┐
│ 1. Slack 中分配任务               │
│    "@Devin 修复 issue #234"      │
│                                │
│ 2. Devin 自主工作 (分钟~小时)    │
│    ├── Clone repo               │
│    ├── 分析问题                  │
│    ├── 编写代码                  │
│    ├── 运行测试                  │
│    ├── 部署到 staging            │
│    └── 提交 PR                  │
│                                │
│ 3. 人类 Review PR              │
│    ├── Approve → Merge          │
│    └── 反馈 → Devin 修改        │
└────────────────────────────────┘

Agentic Coding 全景图 (2025):
┌─────────────────────────────────┐
│          商业产品                 │
│ ├── Devin (Cognition) $500/月    │
│ ├── Claude Code (Anthropic)     │
│ ├── Cursor Agent (Anysphere)    │
│ ├── Windsurf Cascade (Codeium)  │
│ └── Amazon Q Developer         │
│                                 │
│          开源方案                 │
│ ├── OpenHands (All Hands AI)    │
│ ├── SWE-Agent (Princeton)       │
│ ├── Aider (CLI Agent)           │
│ ├── Mentat (AbanteAI)           │
│ └── Continue (VS Code 插件)     │
│                                 │
│       评测基准                   │
│ ├── SWE-bench (GitHub Issues)   │
│ ├── HumanEval (代码生成)         │
│ ├── MBPP (基础编程)              │
│ └── LiveCodeBench (真实环境)     │
└─────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏆 SWE-bench 实战对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> benchmark_comparison</div>
                <pre className="fs-code">{`# SWE-bench Verified 排行榜 (2025 Q2):
# 任务: 解决真实 GitHub Issues (Django/Flask/scikit-learn等)

┌──────────────────┬────────┬────────┬──────┐
│ Agent             │解决率   │平均耗时 │ 成本  │
├──────────────────┼────────┼────────┼──────┤
│ Claude Code       │ 72.7% │ 3.2min │ $1.2 │
│ Devin 2.0         │ 69.5% │ 8.5min │ $3.5 │
│ OpenHands+Claude  │ 61.3% │ 4.1min │ $1.5 │
│ Amazon Q          │ 50.8% │ 5.2min │ $0.8 │
│ SWE-Agent+GPT-4o  │ 45.2% │ 6.8min │ $2.1 │
│ Aider+Claude      │ 42.6% │ 2.1min │ $0.6 │
│ Copilot Workspace │ 38.4% │ 7.2min │ $1.0 │
└──────────────────┴────────┴────────┴──────┘

按任务复杂度分析:
┌────────────┬────────┬────────┬────────┐
│ 复杂度      │Claude  │ Devin  │OpenHands│
│            │ Code   │  2.0   │+Claude │
├────────────┼────────┼────────┼────────┤
│ 简单(1文件) │ 92%   │ 88%   │ 82%    │
│ 中等(2-5)  │ 75%   │ 72%   │ 64%    │
│ 复杂(5+)   │ 48%   │ 45%   │ 35%    │
│ 跨项目     │ 25%   │ 30%   │ 18%    │
└────────────┴────────┴────────┴────────┘

关键洞察:
1. 单文件修改 → 所有 Agent 都很强 (85%+)
2. 多文件协同 → 差距显现 (Claude Code 领先)
3. 跨项目依赖 → 所有 Agent 都挣扎 (<30%)
4. 速度 vs 质量: Aider 最快但成功率低
5. 成本: Amazon Q 最便宜, Devin 最贵

选择建议:
├── 个人开发者: Claude Code (性价比最高)
├── 团队协作:   Devin (异步工作流)
├── 预算有限:   OpenHands (免费开源)
├── 隐私敏感:   OpenHands+本地模型
└── 日常编码:   Cursor Agent (集成最好)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
