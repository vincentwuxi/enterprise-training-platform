import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 08 — 安全实战
   企业 AI 安全审计 Playbook
   ───────────────────────────────────────────── */

const AUDIT_PHASES = [
  { phase: 'Phase 1: 资产梳理', icon: '📋', duration: '1 周',
    desc: '全面盘点企业内所有 AI 系统及其使用方式',
    tasks: [
      { task: '列出所有 AI 模型/API（含影子IT）', detail: '包括工程团队直接调用的 API、内部微调的模型、第三方 AI SaaS' },
      { task: '分类风险等级', detail: '按 EU AI Act 风险分级标准（不可接受/高/有限/最低）对每个系统分类' },
      { task: '数据流映射', detail: '追踪训练数据来源、推理数据流入/流出、日志存储位置' },
      { task: '依赖关系图', detail: '哪些业务流程依赖 AI？AI 挂掉的影响面？' },
    ] },
  { phase: 'Phase 2: 安全测试', icon: '🔍', duration: '2 周',
    desc: '对高风险系统执行全面安全评估',
    tasks: [
      { task: '红队测试', detail: '使用 Garak/PyRIT 执行自动化攻击探针 + 手动对抗性测试' },
      { task: '幻觉评估', detail: '在业务场景上运行 HaluEval/TruthfulQA 基准 + 领域特定测试集' },
      { task: '偏见审计', detail: '使用反事实测试，检查模型在不同人群上的表现差异' },
      { task: '数据泄露测试', detail: '测试模型是否会泄露训练数据中的 PII/商业机密' },
    ] },
  { phase: 'Phase 3: 合规审查', icon: '⚖️', duration: '1 周',
    desc: '对照法规要求检查合规性',
    tasks: [
      { task: 'EU AI Act 合规检查', detail: '高风险系统是否满足：技术文档/人工监督/数据治理/记录保存' },
      { task: '数据保护影响评估 (DPIA)', detail: 'GDPR/PIPL 要求：处理个人数据的 AI 系统必须完成 DPIA' },
      { task: '透明度验证', detail: '是否明确告知用户正在与 AI 交互？是否提供 AI 决策解释？' },
      { task: '供应商合规审查', detail: '第三方 AI API 的 DPA/SCC 是否到位？数据存储地合规？' },
    ] },
  { phase: 'Phase 4: 修复加固', icon: '🔧', duration: '2-4 周',
    desc: '基于审计发现实施安全修复',
    tasks: [
      { task: '漏洞修复', detail: '按严重性排序（Critical > High > Medium > Low）逐一修复' },
      { task: '防御 Pipeline 部署', detail: '部署输入/输出 Guardrail、PII 过滤、毒性检测' },
      { task: '监控体系搭建', detail: 'LangSmith/Langfuse 追踪 + 异常检测 + 告警' },
      { task: '应急预案制定', detail: 'AI 系统故障/被攻击时的回滚方案和沟通模板' },
    ] },
  { phase: 'Phase 5: 持续治理', icon: '🔄', duration: '持续',
    desc: '建立长期安全治理机制',
    tasks: [
      { task: '定期复审 (季度)', detail: '每季度重复 Phase 2-3 的关键测试，更新风险评估' },
      { task: 'Prompt 版本管理', detail: '所有系统 Prompt 纳入 Git 版本控制，变更需审批' },
      { task: '安全培训', detail: '开发团队年度 AI 安全培训（含本课程内容）' },
      { task: '事故报告流程', detail: '建立 AI 安全事故分级上报和事后复盘机制' },
    ] },
];

const TOOLS_STACK = [
  { category: '红队测试', tools: [
    { name: 'Garak', use: 'LLM 漏洞自动扫描' },
    { name: 'PyRIT', use: '微软红队框架' },
  ]},
  { category: '输入/输出护栏', tools: [
    { name: 'LLM Guard', use: '注入/毒性/PII 检测' },
    { name: 'NeMo Guardrails', use: 'NVIDIA 对话安全框架' },
    { name: 'Guardrails AI', use: '结构化输出验证' },
  ]},
  { category: '可观测性', tools: [
    { name: 'LangSmith', use: 'LLM 调用追踪与评估' },
    { name: 'Langfuse', use: '开源 LLM 可观测性' },
    { name: 'Helicone', use: 'LLM 代理层监控' },
  ]},
  { category: '合规工具', tools: [
    { name: 'C2PA 工具链', use: '内容溯源签名验证' },
    { name: 'AI Fairness 360', use: 'IBM 偏见检测工具' },
    { name: 'Model Card Toolkit', use: 'Google Model Card 生成' },
  ]},
];

const INCIDENT_TEMPLATE = `# AI 安全事故报告模板

## 事故概况
- **事故编号**: AI-INC-2025-001
- **发现时间**: 2025-XX-XX HH:MM
- **严重等级**: Critical / High / Medium / Low
- **影响系统**: [系统名称]
- **影响范围**: [影响用户数/交易数]

## 事故描述
[详细描述发生了什么，如何发现的]

## 根因分析 (RCA)
- **直接原因**: [例如：Prompt Injection 导致系统 Prompt 泄露]
- **根本原因**: [例如：缺少输入过滤层]

## 时间线
| 时间 | 事件 |
|------|------|
| HH:MM | 用户报告异常行为 |
| HH:MM | 安全团队介入排查 |
| HH:MM | 确认攻击向量 |
| HH:MM | 实施临时缓解措施 |
| HH:MM | 完成永久修复 |
| HH:MM | 恢复正常服务 |

## 修复措施
### 短期 (已实施)
- [措施1]
- [措施2]

### 长期 (计划中)
- [措施3]
- [措施4]

## 经验教训
1. [教训1]
2. [教训2]

## 后续行动项
| 行动 | 负责人 | 截止日期 | 状态 |
|------|--------|---------|------|
| [行动1] | [姓名] | [日期] | ⬜ |
| [行动2] | [姓名] | [日期] | ⬜ |`;

export default function LessonAudit() {
  const [phaseIdx, setPhaseIdx] = useState(0);

  return (
    <div className="lesson-safety">
      <div className="sf-badge">🛡️ module_08 — 安全实战</div>

      <div className="sf-hero">
        <h1>企业 AI 安全审计 Playbook</h1>
        <p>
          从理论到实战——本模块提供一套可落地的<strong>五阶段企业 AI 安全审计框架</strong>，
          包含具体任务清单、工具栈推荐和事故报告模板，
          让你不仅能发现安全风险，更能系统性地修复和持续治理。
        </p>
      </div>

      {/* ─── 审计阶段 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🎯 五阶段审计框架</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {AUDIT_PHASES.map((p, i) => (
            <button key={i} onClick={() => setPhaseIdx(i)}
              className={`sf-btn ${i === phaseIdx ? 'primary' : ''}`}
              style={{ fontSize: '0.78rem' }}>
              {p.icon} {p.phase}
            </button>
          ))}
        </div>

        <div className="sf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, color: '#f87171', fontSize: '1.05rem' }}>
              {AUDIT_PHASES[phaseIdx].icon} {AUDIT_PHASES[phaseIdx].phase}
            </h3>
            <span className="sf-tag amber">⏱ {AUDIT_PHASES[phaseIdx].duration}</span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 1rem' }}>{AUDIT_PHASES[phaseIdx].desc}</p>

          {AUDIT_PHASES[phaseIdx].tasks.map((t, i) => (
            <div key={i} style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#f87171', fontSize: '0.8rem' }}>☐</span>
                <strong style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{t.task}</strong>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', paddingLeft: '1.3rem' }}>{t.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 工具栈 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🔧 安全工具栈</h2>
        <div className="sf-grid-2">
          {TOOLS_STACK.map((cat, i) => (
            <div key={i} className="sf-card">
              <h4 style={{ color: '#60a5fa', margin: '0 0 0.75rem', fontSize: '0.9rem' }}>{cat.category}</h4>
              {cat.tools.map((tool, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#e2e8f0', fontSize: '0.83rem' }}>{tool.name}</strong>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{tool.use}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── 生产 Pipeline ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🏗️ 完整安全 Pipeline 架构</h2>
        <div className="sf-code-wrap">
          <div className="sf-code-head">
            <span className="sf-code-dot" style={{ background: '#ef4444' }} />
            <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
            <span className="sf-code-dot" style={{ background: '#10b981' }} />
            🏗️ enterprise_ai_security_pipeline.py
          </div>
          <pre className="sf-code">{`# 企业级 AI 安全 Pipeline — 完整架构
class EnterpriseAISecurityPipeline:
    """
    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
    │  用户输入    │ →  │  输入 Guard   │ →  │  LLM 生成    │
    └─────────────┘    └──────────────┘    └──────────────┘
                            │ 拦截                │
                            ▼                     ▼
                       ┌──────────┐         ┌──────────────┐
                       │ 审计日志  │ ←────── │  输出 Guard   │
                       └──────────┘         └──────────────┘
                            │                     │ 安全输出
                            ▼                     ▼
                       ┌──────────┐         ┌──────────────┐
                       │ 监控告警  │         │  返回用户     │
                       └──────────┘         └──────────────┘
    """
    
    def __init__(self):
        # Layer 1: 输入安全
        self.input_guard = InputGuard(
            injection_detector=True,      # Prompt Injection 检测
            pii_scanner=True,             # PII 检测与脱敏
            toxicity_filter=True,         # 有害内容过滤
            rate_limiter=True,            # 频率限制
            encoding_normalizer=True,     # 编码攻击防护
        )
        
        # Layer 2: 系统 Prompt 安全
        self.prompt_hardener = PromptHardener(
            delimiter="<<<>>>",           # 用户输入隔离
            anti_injection_prefix=True,   # 防注入指令
            role_lock=True,               # 角色锁定
        )
        
        # Layer 3: 输出安全
        self.output_guard = OutputGuard(
            hallucination_check=True,     # 幻觉检测
            pii_redaction=True,           # PII 输出过滤
            toxicity_check=True,          # 毒性检测
            content_policy=True,          # 内容策略
        )
        
        # Layer 4: 监控
        self.monitor = SecurityMonitor(
            langsmith_project="prod",     # LangSmith 追踪
            alert_webhook="https://...",  # 告警 Webhook
            anomaly_detection=True,       # 异常模式检测
        )
    
    async def process(self, user_msg, session_id):
        # 1. 输入安全检查
        input_result = self.input_guard.check(user_msg)
        if input_result.blocked:
            self.monitor.log_blocked(session_id, input_result)
            return safe_rejection_message(input_result.reason)
        
        # 2. 安全 Prompt 构建
        safe_prompt = self.prompt_hardener.build(
            system_prompt=SYSTEM_PROMPT,
            user_input=input_result.sanitized_input,
        )
        
        # 3. LLM 调用
        response = await self.llm.generate(safe_prompt)
        
        # 4. 输出安全检查
        output_result = self.output_guard.check(response)
        if output_result.modified:
            response = output_result.safe_response
        
        # 5. 审计记录
        self.monitor.log(session_id, user_msg, response, 
                        risk_scores=output_result.scores)
        
        return response`}</pre>
        </div>
      </div>

      {/* ─── 事故报告模板 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">📝 AI 安全事故报告模板</h2>
        <div className="sf-code-wrap">
          <div className="sf-code-head">
            <span className="sf-code-dot" style={{ background: '#ef4444' }} />
            <span className="sf-code-dot" style={{ background: '#f59e0b' }} />
            <span className="sf-code-dot" style={{ background: '#10b981' }} />
            📋 incident_report_template.md
          </div>
          <pre className="sf-code" style={{ maxHeight: '350px' }}>{INCIDENT_TEMPLATE}</pre>
        </div>
      </div>

      {/* ─── 课程总结 ─── */}
      <div className="sf-section">
        <h2 className="sf-section-title">🎓 课程总结</h2>
        <div className="sf-grid-2">
          <div className="sf-alert critical">
            <strong>🔴 Core Message</strong><br/>
            AI 安全不是可选项，是生产系统的必选项。2025 年，不做安全审计的 AI 系统 = 定时炸弹。
          </div>
          <div className="sf-alert success">
            <strong>✅ 行动清单</strong><br/>
            1. 本周：给每个 AI 系统做风险分级<br/>
            2. 本月：对高风险系统跑 Garak 扫描<br/>
            3. 本季度：完成一轮完整安全审计
          </div>
        </div>
      </div>

      <div className="sf-nav">
        <button className="sf-btn">← AI 水印与溯源</button>
        <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>🎉 恭喜完课！</span>
      </div>
    </div>
  );
}
