import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['框架迁移', '代码现代化', '技术债清理', '大规模重构'];

export default function LessonAIRefactoring() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🤖 module_06 — AI 重构大师</div>
      <div className="fs-hero">
        <h1>AI 重构大师：框架迁移 / 架构升级 / 代码现代化</h1>
        <p>
          全球约有 <strong>2600 亿行遗留代码</strong>仍在运行生产系统。
          AI 重构工具使"不可能的迁移"成为可能：jQuery → React、
          JavaScript → TypeScript、Class Components → Hooks、
          Express → Fastify——以往需要数月的工作，现在数天即可完成。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔄 AI 重构</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 AI 框架迁移实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> framework_migration</div>
                <pre className="fs-code">{`# —— AI 驱动的框架迁移策略 ——

# 常见迁移场景:
# ┌────────────────┬────────────────┬──────────┐
# │ From           │ To             │ AI 成功率 │
# ├────────────────┼────────────────┼──────────┤
# │ jQuery         │ React/Vue      │ 75-85%   │
# │ AngularJS (1.x)│ Angular 17+    │ 60-70%   │
# │ Class Component│ Functional+Hook│ 90-95%   │
# │ JavaScript     │ TypeScript     │ 85-90%   │
# │ Express        │ Fastify/Hono   │ 80-85%   │
# │ REST API       │ GraphQL        │ 70-75%   │
# │ Webpack        │ Vite           │ 85-90%   │
# │ CSS/SASS       │ Tailwind       │ 75-80%   │
# │ Redux          │ Zustand        │ 85-90%   │
# │ Create React   │ Next.js/Remix  │ 65-75%   │
# └────────────────┴────────────────┴──────────┘

# 实战: jQuery → React 迁移

# 阶段 1: 分析 (AI)
# Claude Code 分析整个 jQuery 代码库:
> 分析 src/legacy/ 下的所有 jQuery 代码,
  列出所有组件/页面/全局状态/事件绑定/Ajax调用,
  输出一个迁移计划表。

# AI 输出:
# ┌──────────────┬──────────┬──────────┐
# │ jQuery 文件   │ 复杂度   │ 依赖     │
# ├──────────────┼──────────┼──────────┤
# │ dashboard.js │ 高 (300行)│ modal.js │
# │ modal.js     │ 中 (120行)│ 无      │
# │ form.js      │ 低 (80行) │ api.js  │
# │ api.js       │ 低 (60行) │ 无      │
# └──────────────┴──────────┴──────────┘

# 阶段 2: 逐模块迁移 (AI + 人工)
# 从无依赖的叶子节点开始:
> 将 src/legacy/api.js 中的 jQuery Ajax 调用
  迁移为使用 fetch API 的 React hooks。
  保持完全相同的 API 接口和错误处理。
  @file:src/legacy/api.js

# 阶段 3: 测试验证 (AI)
> 为迁移后的 useApi hook 生成测试,
  确保与原 jQuery 版本行为一致。
  使用 MSW mock API 响应。

# 阶段 4: 渐进式替换
# 使用 React 的 createPortal 在 jQuery 页面中
# 嵌入 React 组件, 实现渐进式迁移`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📝 JS → TypeScript 迁移</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> ts_migration</div>
                <pre className="fs-code">{`# JS → TypeScript: 最高频迁移

# AI 迁移策略 (渐进式):

# Step 1: 配置 (tsconfig.json)
{
  "compilerOptions": {
    "allowJs": true,        // 允许混合
    "checkJs": false,       // 不检查 JS
    "strict": false,        // 先宽松
    "noImplicitAny": false, // 允许 any
  }
}

# Step 2: AI 批量重命名
# .js → .ts / .jsx → .tsx
# Claude Code: 
> 将 src/ 下所有 .js 文件重命名为 .ts,
  .jsx 重命名为 .tsx,
  更新所有 import 路径。

# Step 3: AI 添加类型 (逐文件)
> 为 src/utils/format.ts 添加 TypeScript 类型:
  - 推断所有函数参数和返回值类型
  - 创建必要的 interface/type
  - 不使用 any (除非真的无法推断)
  @file:src/utils/format.ts

# Step 4: 逐步收紧
# 月度目标:
# Month 1: strict: false, any 允许
# Month 2: noImplicitAny: true
# Month 3: strictNullChecks: true
# Month 4: strict: true

# AI 辅助统计:
# "扫描项目, 统计 any 使用数量,
#  按文件排序, 优先处理 any 最多的"

# 成效:
# ├── Bug 减少: -38% (类型捕获)
# ├── IDE 生产力: +25% (补全更准确)
# ├── 文档负担: -50% (类型即文档)
# └── 新人上手: -40% 时间`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>⚛️ Class → Hooks 迁移</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> hooks_migration</div>
                <pre className="fs-code">{`# React Class → Hooks: AI 95% 成功率

# AI 迁移规则 (自动映射):
# ┌───────────────────┬──────────────────┐
# │ Class              │ Hooks             │
# ├───────────────────┼──────────────────┤
# │ this.state         │ useState()        │
# │ this.setState      │ setXxx()          │
# │ componentDidMount  │ useEffect(,[])    │
# │ componentDidUpdate │ useEffect()       │
# │ componentWillUnmnt │ useEffect return  │
# │ this.props         │ 函数参数          │
# │ shouldComponentUpd │ React.memo()      │
# │ getDerivedState    │ useMemo()         │
# │ ref / createRef    │ useRef()          │
# │ context (Consumer) │ useContext()      │
# │ HOC               │ Custom hook       │
# │ render props      │ Custom hook       │
# └───────────────────┴──────────────────┘

# Cursor Agent 一键迁移:
> 将这个 Class Component 转换为
  Functional Component + Hooks。
  保持完全相同的行为和接口。
  @file:src/components/Dashboard.tsx

# AI 会自动:
# 1. 分析 state/lifecycle/ref 使用
# 2. 映射为对应 hooks
# 3. 提取复杂逻辑为 custom hooks
# 4. 保持 props interface 不变
# 5. 添加 React.memo 优化

# 需要人工审查的点:
# ├── this 绑定问题
# ├── 闭包 vs 类实例变量
# ├── useEffect 依赖数组
# └── 性能影响 (重渲染)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧹 AI 技术债清理工作流</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> tech_debt_cleanup</div>
                <pre className="fs-code">{`# —— AI 驱动的技术债系统性清理 ——

# Sprint 技术债治理流程:
┌─────────────────────────────────────────┐
│ 每 Sprint 分配 20% 容量给技术债         │
│                                         │
│ Week 1: AI 扫描 → 优先级排序            │
│  Claude Code:                           │
│  "扫描代码库, 识别技术债按影响排序"      │
│                                         │
│ Week 2: AI 自动修复低风险项             │
│  ├── 代码格式化 (Prettier)              │
│  ├── 导入排序 (ESLint auto-fix)         │
│  ├── 未使用代码删除                     │
│  ├── console.log 清理                  │
│  └── TODO 注释分类                     │
│                                         │
│ Week 3: AI 辅助修复中风险项             │
│  ├── 重复代码提取为函数                 │
│  ├── 魔法数字替换为常量                 │
│  ├── 长函数拆分                        │
│  ├── 复杂条件简化                      │
│  └── 错误处理补全                      │
│                                         │
│ Week 4: 人工修复高风险项                │
│  ├── 架构级别重构                      │
│  ├── 数据库 schema 调整                │
│  ├── API 契约变更                      │
│  └── 性能关键路径优化                  │
└─────────────────────────────────────────┘

# AI 自动修复示例 (低风险):

# 1. 死代码清理
> 扫描项目中未被任何文件导入的 export,
  列出可安全删除的文件和函数。
  排除: API 端点, 入口文件, 配置文件。

# 2. 依赖更新
> 分析 package.json 中的过时依赖,
  按安全风险排序, 给出更新策略:
  - 补丁版本: 直接更新
  - 小版本: 检查 changelog
  - 大版本: 评估 breaking changes

# 3. TODO 债务管理
> 搜索所有 TODO/FIXME/HACK 注释,
  分类为:
  - 🔴 安全相关 → 立即修复
  - 🟡 功能缺失 → 排进backlog
  - 🔵 优化建议 → 评估后处理
  - ⚪ 过时注释 → 直接删除`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 大规模重构策略</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> large_scale</div>
                <pre className="fs-code">{`# 大规模重构: AI 的最大价值场景

# 案例: 单体 → 微服务 (AI 辅助)

# Phase 1: AI 分析依赖关系图 (1周)
> 分析整个代码库的模块依赖关系,
  识别可以独立拆分的领域边界,
  输出依赖图 (Mermaid) 和拆分建议。

# AI 输出建议:
# ┌────────────────────────────────┐
# │ 拆分建议:                      │
# │ 1. auth-service (独立性: 95%)  │
# │ 2. user-service (独立性: 88%)  │
# │ 3. order-service (独立性: 72%) │
# │ 4. payment (独立性: 65%)       │
# │    ⚠️ 与 order 高耦合          │
# │ 5. notification (独立性: 92%)  │
# └────────────────────────────────┘

# Phase 2: AI 生成 API 契约 (1周)
> 基于当前代码中模块间的函数调用,
  生成 OpenAPI/gRPC 规范,
  作为微服务间的API契约。

# Phase 3: AI 逐模块迁移 (4-8周)
# 使用 Strangler Fig Pattern:
# 
# 旧单体  ←→  新微服务
#   │              ↑
#   └──── 流量渐迁 ──┘
#
# 每个模块:
# 1. AI 生成微服务骨架
# 2. AI 迁移业务逻辑
# 3. AI 生成集成测试
# 4. 人工审查 + 灰度切流

# Phase 4: 数据拆分 (最难)
# ⚠️ 数据库拆分不能完全交给 AI
# 人工决策: 数据归属/一致性/事务边界
# AI 辅助: 生成数据迁移脚本

# 大规模重构 ROI:
# ┌──────────┬──────────┬──────────┐
# │ 指标      │ 纯人工   │ AI 辅助  │
# ├──────────┼──────────┼──────────┤
# │ 时间      │ 12 个月  │ 4 个月   │
# │ 人力      │ 8 人     │ 3 人     │
# │ 风险      │ 高       │ 中       │
# │ 测试覆盖  │ +20%     │ +45%     │
# └──────────┴──────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
