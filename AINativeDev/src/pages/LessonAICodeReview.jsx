import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['自动审查', '安全扫描', 'Tech Debt', '集成流程'];

export default function LessonAICodeReview() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🤖 module_03 — AI Code Review</div>
      <div className="fs-hero">
        <h1>AI Code Review：自动审查 / 安全扫描 / Tech Debt 检测</h1>
        <p>
          代码审查是工程质量的最后防线，但人工 Review 平均只能发现 <strong>60% 的问题</strong>。
          AI Code Review 通过 LLM 分析代码变更、检测安全漏洞、评估架构一致性、
          量化技术债务，将审查质量提升到 85%+。本模块覆盖从 PR 自动审查到
          企业级安全扫描的完整实战。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔍 AI Code Review</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 AI PR 自动审查系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> ai_review.py</div>
                <pre className="fs-code">{`# —— AI Code Review 系统架构 ——

class AICodeReviewer:
    """企业级 AI 代码审查系统"""
    
    def __init__(self):
        self.llm = Claude(model="claude-sonnet-4")
        self.rules = self.load_review_rules()
    
    async def review_pr(self, pr: PullRequest):
        """审查一个 PR 的完整流程"""
        
        # 1. 获取变更内容
        diff = pr.get_diff()
        changed_files = pr.get_changed_files()
        
        # 2. 多维度审查
        results = await asyncio.gather(
            self.review_correctness(diff),      # 正确性
            self.review_security(diff),          # 安全性
            self.review_performance(diff),       # 性能
            self.review_style(diff),             # 风格
            self.review_architecture(diff),      # 架构
            self.review_test_coverage(diff),     # 测试
        )
        
        # 3. 生成审查报告
        report = self.generate_report(results)
        
        # 4. 在 PR 中留下评论
        if report.has_critical_issues:
            pr.request_changes(report.to_markdown())
        elif report.has_suggestions:
            pr.comment(report.to_markdown())
        else:
            pr.approve("LGTM! ✅ AI Review 通过")
        
        return report

    async def review_correctness(self, diff):
        """正确性审查"""
        prompt = f"""
审查以下代码变更的正确性:

{diff}

检查:
1. 逻辑错误 (边界条件/空值处理/类型错误)
2. 并发问题 (竞态条件/死锁/数据竞争)
3. 资源泄漏 (未关闭连接/文件/定时器)
4. 错误处理 (未捕获异常/错误吞没)
5. API 契约违反 (参数类型/返回值)

对每个问题给出:
- 严重度: 🔴 Critical / 🟡 Warning / 🔵 Info
- 具体位置: 文件名 + 行号
- 问题描述
- 修复建议 + 代码示例
"""
        return await self.llm.analyze(prompt)

# 主流 AI Code Review 工具:
# ┌──────────────┬────────┬──────────────────┐
# │ 工具          │ 价格   │ 特色              │
# ├──────────────┼────────┼──────────────────┤
# │ CodeRabbit   │ $15/人 │ 最深度的PR审查     │
# │ Codium/Qodo  │ $19/人 │ 测试生成+审查      │
# │ Sourcery     │ $14/人 │ Python 专精       │
# │ Copilot PR   │ 含订阅 │ GitHub 原生集成    │
# │ Amazon Q     │ $19/人 │ AWS 生态集成      │
# │ Codeium      │ 免费   │ 基础审查免费       │
# └──────────────┴────────┴──────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🛡️ AI 安全漏洞扫描</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> security_scan.py</div>
                <pre className="fs-code">{`# AI 安全漏洞检测

class AISecurityScanner:
    """LLM 驱动的安全扫描"""
    
    VULN_CATEGORIES = [
        "SQL Injection",
        "XSS (Cross-Site Scripting)", 
        "SSRF (Server-Side Request Forgery)",
        "Path Traversal",
        "Insecure Deserialization",
        "Hardcoded Secrets",
        "Broken Access Control",
        "Cryptographic Failures",
        "Dependency Vulnerabilities",
        "API Security Misconfiguration",
    ]
    
    async def scan(self, code, context):
        """深度安全扫描"""
        
        # 1. 静态分析 (传统 SAST)
        sast_results = await self.run_sast([
            "semgrep",     # 模式匹配
            "bandit",      # Python 安全
            "eslint-security", # JS 安全
        ])
        
        # 2. AI 增强分析 (发现 SAST 遗漏)
        ai_results = await self.llm.analyze(f"""
作为安全专家, 审查以下代码:
{code}

项目上下文: {context}

重点检查:
1. 业务逻辑漏洞 (SAST 无法检测)
2. 上下文相关的权限绕过
3. 数据流中的注入点
4. 隐式信任边界
5. 时序攻击可能

每个漏洞给出:
- CVSS 评分 (0-10)
- CWE 编号
- 攻击向量
- PoC 代码
- 修复方案
""")
        
        # 3. 合并去重
        return self.merge_results(
            sast_results, ai_results
        )

# AI vs 传统 SAST 检测率对比:
# ┌──────────────┬──────┬──────┬──────┐
# │ 漏洞类型      │ SAST │  AI  │AI+SAST│
# ├──────────────┼──────┼──────┼──────┤
# │ SQL Injection│ 85%  │ 72%  │ 95%  │
# │ XSS          │ 78%  │ 80%  │ 93%  │
# │ 业务逻辑漏洞  │ 12%  │ 65%  │ 68%  │
# │ 权限绕过      │ 35%  │ 70%  │ 82%  │
# │ 密钥泄露      │ 90%  │ 88%  │ 98%  │
# │ 误报率        │ 40%  │ 15%  │ 12%  │
# └──────────────┴──────┴──────┴──────┘
# 结论: AI+SAST 组合效果最佳`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔐 Secret Detection</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> secret_detection</div>
                <pre className="fs-code">{`# AI 密钥泄露检测

# 传统方法: 正则匹配
# ├── GitHub Secret Scanning
# ├── TruffleHog
# ├── GitLeaks
# └── 问题: 高误报 + 遗漏变形密钥

# AI 方法: 语义理解
class AISecretDetector:
    
    def detect(self, code):
        """AI 密钥检测"""
        
        # 1. 正则预筛 (快速过滤)
        candidates = regex_scan(code)
        
        # 2. AI 语义验证 (减少误报)
        for match in candidates:
            context = get_surrounding_code(match)
            is_real = self.llm.classify(
                f"这是真实密钥还是示例/测试值?"
                f"代码: {context}"
            )
            if is_real:
                yield SecurityIssue(
                    type="SECRET_LEAK",
                    severity="CRITICAL",
                    file=match.file,
                    line=match.line,
                    fix="使用环境变量或 Secret Manager"
                )
        
        # 3. 检测变形密钥
        # base64 编码的密钥
        # 拼接的密钥 (key = part1 + part2)
        # 配置文件中的密钥
        # 日志中打印的密钥

# pre-commit hook 集成:
# .pre-commit-config.yaml
# repos:
#   - repo: local
#     hooks:
#       - id: ai-secret-scan
#         name: AI Secret Scanner
#         entry: python -m ai_secret_scan
#         language: python
#         types: [text]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💰 AI 技术债务检测与量化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> tech_debt.py</div>
                <pre className="fs-code">{`# —— AI 技术债务量化系统 ——

class TechDebtAnalyzer:
    """用 AI 检测和量化技术债务"""
    
    DEBT_DIMENSIONS = {
        "代码质量债务": {
            "重复代码":       {"weight": 3, "metric": "duplication_ratio"},
            "过长函数":       {"weight": 2, "metric": "avg_function_length"},
            "深层嵌套":       {"weight": 2, "metric": "max_nesting_depth"},
            "魔法数字":       {"weight": 1, "metric": "magic_number_count"},
            "命名不一致":     {"weight": 1, "metric": "naming_inconsistency"},
        },
        "架构债务": {
            "循环依赖":       {"weight": 5, "metric": "circular_deps"},
            "上帝类":         {"weight": 4, "metric": "god_class_count"},
            "层级违反":       {"weight": 4, "metric": "layer_violations"},
            "紧耦合":         {"weight": 3, "metric": "coupling_score"},
        },
        "依赖债务": {
            "过时依赖":       {"weight": 3, "metric": "outdated_deps"},
            "安全漏洞依赖":   {"weight": 5, "metric": "vulnerable_deps"},
            "未使用依赖":     {"weight": 1, "metric": "unused_deps"},
        },
        "测试债务": {
            "低测试覆盖":     {"weight": 3, "metric": "coverage_gaps"},
            "脆弱测试":       {"weight": 2, "metric": "flaky_test_count"},
            "缺少集成测试":   {"weight": 3, "metric": "missing_integration"},
        },
    }
    
    async def full_analysis(self, repo):
        """全面技术债务分析"""
        
        # 1. 静态指标收集
        metrics = self.collect_metrics(repo)
        
        # 2. AI 深度分析 (找出隐藏债务)
        ai_insights = await self.llm.analyze(f"""
分析代码库的技术债务:
- 文件数: {metrics.file_count}
- 代码行: {metrics.total_lines}
- 依赖数: {metrics.dep_count}

重点关注:
1. 架构级别的设计问题
2. 即将成为瓶颈的代码
3. 需要重构的 hotspot
4. 阻碍新人上手的复杂度
""")
        
        # 3. 量化为"人天"
        return {
            "total_debt": "128 人天",
            "critical":   "32 人天 (25%)",
            "monthly_interest": "8 人天/月",
            "top_files": [
                ("src/api/handler.ts", "12天", "上帝类+无测试"),
                ("src/utils/legacy.js", "8天", "jQuery遗留代码"),
                ("src/store/global.ts", "6天", "全局状态混乱"),
            ],
            "recommendation": "每 Sprint 分配 20% 时间还债"
        }

# 技术债务趋势可视化:
# 
#  债务(人天)
#  200│     ╱ 不还债
#  150│   ╱
#  128│─╱──── 当前
#  100│╱
#   50│  ╲──── 每Sprint还20%
#    0│    ╲___
#     └──────────── 时间(月)
#      0  3  6  9  12`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ CI/CD 集成实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> github_action.yml</div>
                <pre className="fs-code">{`# GitHub Actions: AI Code Review 自动化

name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 完整历史, 用于 diff
      
      # 1. AI PR 审查 (CodeRabbit)
      - name: AI Code Review
        uses: coderabbit-ai/ai-pr-reviewer@latest
        with:
          openai_model: gpt-4o
          review_level: detailed
          auto_approve: false  # 不自动合并
      
      # 2. 安全扫描
      - name: Security Scan
        uses: semgrep/semgrep-action@v1
        with:
          config: auto  # 自动选择规则
      
      # 3. 密钥检测
      - name: Secret Detection
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
      
      # 4. 技术债务检查
      - name: Tech Debt Check
        run: |
          npx @sonarqube/scanner \\
            -Dsonar.qualitygate.wait=true
      
      # 5. AI 测试覆盖率分析
      - name: AI Coverage Analysis
        if: always()
        run: |
          # 检查新增代码是否有测试覆盖
          python scripts/ai_coverage_check.py \\
            --diff-base origin/main \\
            --min-coverage 80

# 质量门禁 (Quality Gate):
# ┌────────────────┬───────┬──────────┐
# │ 检查项          │ 阈值  │ 阻断合并? │
# ├────────────────┼───────┼──────────┤
# │ AI Review 严重  │ 0     │ ✅ 是    │
# │ 安全漏洞 (High) │ 0     │ ✅ 是    │
# │ 密钥泄露        │ 0     │ ✅ 是    │
# │ 测试覆盖率      │ ≥80%  │ ✅ 是    │
# │ 技术债务增量    │ ≤2h   │ ⚠️ 警告  │
# │ AI Review 建议  │ -     │ ❌ 否    │
# └────────────────┴───────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
