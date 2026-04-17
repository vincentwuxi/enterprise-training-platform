import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['编码规范', 'PR 自动化', '知识管理', '质量门禁'];

export default function LessonTeamAIWorkflow() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🤖 module_08 — 团队 AI 工作流</div>
      <div className="fs-hero">
        <h1>团队 AI 工作流：编码规范 / PR 自动化 / 知识管理 / 质量门禁</h1>
        <p>
          个人使用 AI 编程很容易，但让<strong>整个团队</strong>系统性地采用 AI 工具
          才是真正的组织升级。本模块覆盖：AI 编码规范体系（.cursorrules / CLAUDE.md 标准化）、
          PR 自动化流水线（AI 审查 + 自动标签 + 智能分配）、
          团队知识管理（AI 驱动的内部文档 + 代码搜索）、
          以及企业级质量门禁（AI 评分 + 合规检查 + 度量体系）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">👥 团队 AI 工作流</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 团队 AI 编码规范体系</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> team_rules</div>
                <pre className="fs-code">{`# —— 团队 AI 编码规范体系 ——

# 问题: 每个人的 AI 生成代码风格不一致
# 方案: 统一的 AI 规范文件

# 三层规范架构:
┌─────────────────────────────────────┐
│ Layer 1: 组织级 (Organization)       │
│ .github/.cursorrules.org            │
│ - 公司级编码标准                     │
│ - 安全规则 (不可覆盖)                │
│ - 技术栈约束                         │
├─────────────────────────────────────┤
│ Layer 2: 项目级 (Project)            │
│ .cursorrules / CLAUDE.md            │
│ - 项目架构说明                       │
│ - 依赖规则                           │
│ - 测试要求                           │
├─────────────────────────────────────┤
│ Layer 3: 模块级 (Module)             │
│ src/api/.cursorrules                │
│ - API 设计规范                       │
│ - 数据验证要求                       │
│ - 错误码标准                         │
└─────────────────────────────────────┘

# 规范文件模板:

## 🏢 组织级规范 (强制, 不可覆盖)

### 安全红线
- 禁止硬编码任何密钥 (API Key/Token/Password)
- 所有用户输入必须校验和转义  
- 认证使用统一 AuthService, 禁止自建
- 生产数据禁止出现在测试/日志中
- 依赖更新需要安全审查

### 代码标准
- TypeScript strict mode (全项目)
- 函数体不超过 50 行
- 文件不超过 300 行
- 圈复杂度不超过 10
- 必须有错误处理 (禁止空 catch)

### AI 使用规则
- AI 生成的代码必须经过人工审查
- 禁止将生产数据作为 AI prompt 的 context
- 禁止使用 AI 生成加密/安全相关代码
- AI 生成的测试需要人工验证断言合理性

## 📝 项目级范本 (团队维护)
# 包含:
# - 项目架构图 (Mermaid)
# - 目录结构说明
# - 命名规范 (变量/函数/文件/API)
# - 已有的工具函数列表 (避免 AI 重复造轮子)
# - 第三方库使用指南 (用哪个, 不用哪个)
# - 常见陷阱 (踩过的坑记录)
# - 测试规范 (覆盖率要求/Mock策略)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔄 PR 自动化流水线</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> pr_automation.yml</div>
                <pre className="fs-code">{`# PR 全流程 AI 自动化

name: AI PR Pipeline
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  # 1. AI 自动标签
  auto-label:
    runs-on: ubuntu-latest
    steps:
      - name: AI Label PR
        uses: actions/labeler@v5
        # AI 分析变更内容,自动打标:
        # feat / fix / refactor / docs
        # frontend / backend / infra
        # size/S / size/M / size/L

  # 2. AI 自动分配审查者
  auto-assign:
    runs-on: ubuntu-latest
    steps:
      - name: AI Assign Reviewers
        run: |
          # AI 分析:
          # - 变更的模块 → 模块负责人
          # - 变更的复杂度 → 高级/初级审查
          # - 审查者工作量均衡
          python scripts/ai_assign_reviewer.py

  # 3. AI 代码审查
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: coderabbit-ai/ai-pr-reviewer@v2
        with:
          review_level: detailed
          language: zh-CN

  # 4. AI PR 描述生成
  pr-description:
    runs-on: ubuntu-latest
    steps:
      - name: Generate PR Description
        run: |
          # AI 分析 diff → 
          # 生成结构化 PR 描述:
          # ## 变更概述
          # ## 变更详情
          # ## 测试覆盖
          # ## 部署影响
          # ## 截图 (if UI changes)

# PR 效率提升:
# ┌──────────────┬──────┬──────┐
# │ 环节          │ 传统 │ AI   │
# ├──────────────┼──────┼──────┤
# │ 写PR描述      │ 15m  │ 0m   │
# │ 找审查者      │ 5m   │ 0m   │
# │ 等待审查      │ 4h   │ 5m   │
# │ 修复评审意见  │ 1h   │ 20m  │
# │ 合并          │ -    │ 自动 │
# │ 总计          │ 5.5h │ 25m  │
# └──────────────┴──────┴──────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 AI PR 度量看板</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> metrics</div>
                <pre className="fs-code">{`# 团队 AI 效能度量

# DORA 指标 + AI 增强:
┌──────────────────────────────────┐
│ 📈 部署频率                       │
│ Before AI: 周 2 次               │
│ After AI:  日 3+ 次              │
│ 提升: 7.5x                      │
├──────────────────────────────────┤
│ ⏱️ 变更前置时间                   │
│ Before: PR提交→上线 48h          │
│ After:  PR提交→上线 4h           │
│ 提升: 12x                       │
├──────────────────────────────────┤
│ 🔴 变更失败率                     │
│ Before: 15%                     │
│ After:  5% (AI审查+测试)         │
│ 提升: 3x                        │
├──────────────────────────────────┤
│ 🔧 故障恢复时间                   │
│ Before: 2h 平均                  │
│ After:  15min (AI自愈)           │
│ 提升: 8x                        │
└──────────────────────────────────┘

# AI 使用效能:
├── AI 代码采用率: 65%
│   (AI生成代码占总提交比例)
├── AI 审查覆盖率: 100%
│   (所有PR都经过AI审查)
├── AI 发现问题比例: 38%
│   (AI审查发现的问题/总问题)
├── AI 测试生成占比: 45%
│   (AI生成的测试/总测试)
└── 开发者满意度: 8.2/10

# Dashboard 工具:
├── LinearB (工程效能分析)
├── Jellyfish (AI 工程管理)
├── Sleuth (DORA 指标追踪)
├── Swarmia (团队生产力)
└── 自建 Grafana Dashboard`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧠 AI 驱动团队知识管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> knowledge_mgmt</div>
                <pre className="fs-code">{`# —— AI 团队知识管理系统 ——

# 问题: 团队知识分散在各处
# ├── Slack 消息 (搜不到)
# ├── Confluence (过时)
# ├── 代码注释 (不完整)
# ├── 口口相传 (人走知识走)
# └── 个人笔记 (不共享)

# AI 解决方案:

# 1. 代码库知识化 (最重要!)
# AI 自动从代码中提取知识:
class CodeKnowledgeExtractor:
    """从代码库提取结构化知识"""
    
    async def extract(self, repo):
        return {
            # 架构文档 (自动生成)
            "architecture": self.analyze_architecture(repo),
            # API 文档 (从代码生成)
            "api_docs": self.generate_api_docs(repo),
            # 决策记录 (从 PR/commit 提取)
            "decisions": self.extract_from_prs(repo),
            # 常见问题 (从 issues/bugs 提取)
            "faq": self.extract_from_issues(repo),
            # 上手指南 (从项目结构生成)
            "onboarding": self.generate_guide(repo),
        }

# 2. 智能代码搜索
# 传统: 关键词搜索 → 结果太多/太少
# AI: 语义搜索 → 理解意图

# 示例:
# 搜索: "用户认证是怎么做的?"
# 传统: 返回所有包含"认证"的文件 (50+)
# AI: 返回 auth 模块 + 流程图 + 配置说明

# 3. 新人 AI 助手
# Slack Bot → 新人提问 → AI 从代码库回答
# 
# 新人: "数据库连接在哪里配置?"
# AI: "数据库配置在 src/config/database.ts,
#      使用 Prisma ORM, 连接字符串从
#      DATABASE_URL 环境变量读取。
#      本地开发参考 .env.example。
#      [链接: database.ts L12-35]"
#
# 效果: 新人上手时间 2周 → 3天

# 4. 知识更新闭环
# Code Change → AI 检测文档是否需要更新
# → 自动创建 PR 更新文档
# → 确保文档不过时

# 5. Architecture Decision Records (ADR)
# AI 从 PR 讨论中自动生成 ADR:
# - 决策背景
# - 考虑的方案
# - 选择的理由
# - 后果和影响`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 企业级 AI 质量门禁</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> quality_gate</div>
                <pre className="fs-code">{`# —— 企业级 AI 质量门禁体系 ——

# 三道防线:
┌─────────────────────────────────────────┐
│ 🛡️ 第一道: 开发时 (IDE/Pre-commit)      │
│  ├── .cursorrules 编码规范检查           │
│  ├── AI 实时代码审查 (Cursor/Copilot)    │
│  ├── pre-commit hooks (格式/lint/密钥)   │
│  └── AI 测试覆盖提醒                    │
├─────────────────────────────────────────┤
│ 🛡️ 第二道: PR 审查 (CI/CD)              │
│  ├── AI Code Review (CodeRabbit)        │
│  ├── 安全扫描 (Semgrep + AI)            │
│  ├── 测试 + 突变测试                    │
│  ├── 技术债务增量检查                    │
│  └── AI 架构一致性验证                  │
├─────────────────────────────────────────┤
│ 🛡️ 第三道: 部署时 (Release Gate)        │
│  ├── AI Canary 分析 (灰度监控)          │
│  ├── 性能回归检测                       │
│  ├── AI 安全审计                        │
│  └── 合规检查 (GDPR/SOC2/HIPAA)        │
└─────────────────────────────────────────┘

# AI 质量评分系统:
class AIQualityScore:
    """计算 PR 的 AI 质量评分"""
    
    def score(self, pr):
        scores = {
            "correctness":  self.ai_review_score(pr),     # 0-25
            "security":     self.security_score(pr),      # 0-25
            "test_quality": self.test_score(pr),          # 0-25
            "maintainability": self.maintain_score(pr),   # 0-25
        }
        total = sum(scores.values())
        
        # 评级:
        # A (90+): 自动合并
        # B (75-89): 快速审查
        # C (60-74): 正常审查
        # D (40-59): 重点审查
        # F (<40): 需要重写
        
        return {
            "total": total,
            "grade": self.to_grade(total),
            "details": scores,
            "suggestions": self.get_suggestions(scores),
        }

# 团队 AI 成熟度模型:
# ┌────────┬──────────────────────────────┐
# │ Level  │ 特征                          │
# ├────────┼──────────────────────────────┤
# │ L1 个人│ 个别成员用 Copilot/Cursor     │
# │ L2 团队│ 统一 AI 工具 + .cursorrules   │
# │ L3 流程│ AI 集成 CI/CD + 质量门禁      │
# │ L4 自动│ AI 自动审查/测试/自愈         │
# │ L5 智能│ AI 驱动决策/架构/知识管理     │
# └────────┴──────────────────────────────┘
# 目标: 6个月内从 L1 → L3
#        12个月内从 L3 → L4`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
