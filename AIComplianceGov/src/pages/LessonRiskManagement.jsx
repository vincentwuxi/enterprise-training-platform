import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['NIST AI RMF', 'ISO 42001', '红队测试', '影响评估'];

export default function LessonRiskManagement() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">⚖️ module_06 — AI 风险管理</div>
      <div className="fs-hero">
        <h1>AI 风险管理：NIST AI RMF / ISO 42001 / 影响评估 / 红队测试</h1>
        <p>
          AI 风险管理是 EU AI Act 的<strong>核心要求</strong>之一——高风险 AI 系统必须建立贯穿全生命周期的风险管理体系。
          本模块深入解读两大国际标准：<strong>NIST AI Risk Management Framework</strong>
          和 <strong>ISO/IEC 42001 (AI管理体系)</strong>，
          并讲解 AI 系统特有的红队测试方法论和影响评估实务。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 AI 风险管理</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏛️ NIST AI Risk Management Framework</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> nist_ai_rmf</div>
                <pre className="fs-code">{`# NIST AI Risk Management Framework (AI RMF 1.0)
# 发布: 2023.01 | 更新: 持续迭代中
# 性质: 自愿性框架 (但被EU AI Act参考)

# 核心理念: "可信赖AI" (Trustworthy AI)
# 七大特性:
trustworthy_ai = [
    "有效且可靠 (Valid & Reliable)",
    "安全 (Safe)",
    "安全且有韧性 (Secure & Resilient)",
    "可问责且透明 (Accountable & Transparent)",
    "可解释且可理解 (Explainable & Interpretable)",
    "隐私增强 (Privacy-Enhanced)",
    "公平—有害偏见管理 (Fair - Bias Managed)",
]

# ═══════════════════════════════════════
# AI RMF 四大核心功能
# ═══════════════════════════════════════

# 1. GOVERN (治理) — 贯穿全流程
GOVERN = {
    "GV.1": "建立AI风险管理的政策和流程",
    "GV.2": "明确角色、职责和权限",
    "GV.3": "建立多元化团队参与机制",
    "GV.4": "组织层面的风险容忍度",
    "GV.5": "将AI风险纳入企业风险管理",
    "GV.6": "AI风险管理的资源保障",
    "目标": "建立文化和结构基础",
}

# 2. MAP (映射) — 识别上下文和风险
MAP = {
    "MP.1": "明确AI系统的预期用途和影响人群",
    "MP.2": "对AI系统进行分类和优先级排序",
    "MP.3": "识别AI特有的风险和益处",
    "MP.4": "评估第三方AI组件的风险",
    "MP.5": "识别受影响的利益相关方",
    "目标": "理解 context → 才能管理风险",
}

# 3. MEASURE (度量) — 评估和监控风险
MEASURE = {
    "MS.1": "选择合适的指标和方法",
    "MS.2": "评估AI系统的七大特性",
    "MS.3": "进行测试、评估和验证(TEV)",
    "MS.4": "监控AI系统的持续表现",
    "目标": "量化风险水平",
}

# 4. MANAGE (管理) — 应对风险
MANAGE = {
    "MG.1": "制定风险应对策略",
    "MG.2": "实施风险缓解措施",
    "MG.3": "持续改进和更新",
    "MG.4": "风险沟通和报告",
    "目标": "将风险降至可接受水平",
}

# 实施建议:
# ┌──────────────────────────────────────┐
# │ Phase 1: GOVERN 先行                 │
# │  └── 建立治理架构和文化              │
# │ Phase 2: MAP 全面盘点                │
# │  └── 识别所有AI系统和风险            │
# │ Phase 3: MEASURE 量化评估            │
# │  └── 建立指标和基线                  │
# │ Phase 4: MANAGE 持续运营             │
# │  └── 缓解、监控、迭代              │
# └──────────────────────────────────────┘

# NIST 配套资源:
# ├── AI RMF Playbook (实施指南)
# ├── Crosswalk (与EU AI Act映射)
# ├── Profiles (行业特定指南)
# └── Generative AI Profile (GenAI专项)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📜 ISO/IEC 42001 AI 管理体系</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> iso_42001</div>
                <pre className="fs-code">{`# ISO/IEC 42001:2023 — AI 管理体系 (AIMS)
# 全球首个 AI 管理体系国际标准
# 发布: 2023.12 | 可认证标准

# 标准定位:
# ├── 类似 ISO 27001 (信息安全) 之于网络安全
# ├── ISO 42001 之于 AI 治理
# ├── 可认证 → 企业可获得认证证书
# └── EU AI Act 合规的有力支撑

# 标准结构 (基于 Annex SL):
┌──────────────────────────────────────────┐
│ 4. 组织环境                               │
│    ├── 理解组织及其环境                    │
│    ├── 理解利益相关方的需求和期望          │
│    └── 确定 AIMS 的范围                    │
├──────────────────────────────────────────┤
│ 5. 领导力                                 │
│    ├── 最高管理层承诺                      │
│    ├── AI 政策                             │
│    └── 组织角色和职责                      │
├──────────────────────────────────────────┤
│ 6. 规划                                   │
│    ├── 应对风险和机遇的措施                │
│    ├── AI 目标及其实现计划                 │
│    └── AI 影响评估                         │
├──────────────────────────────────────────┤
│ 7. 支持                                   │
│    ├── 资源                                │
│    ├── 能力                                │
│    ├── 意识                                │
│    ├── 沟通                                │
│    └── 文档化信息                          │
├──────────────────────────────────────────┤
│ 8. 运行                                   │
│    ├── 运行规划和控制                      │
│    ├── AI 风险评估                         │
│    ├── AI 风险处置                         │
│    └── AI 系统生命周期管理                  │
├──────────────────────────────────────────┤
│ 9. 绩效评估                               │
│    ├── 监控、测量、分析和评价              │
│    ├── 内部审计                            │
│    └── 管理评审                            │
├──────────────────────────────────────────┤
│ 10. 改进                                  │
│    ├── 不符合和纠正措施                    │
│    └── 持续改进                            │
└──────────────────────────────────────────┘

# 核心附录:
# Annex A: AI 控制措施 (39 个控制项)
# Annex B: AI 管理实施指南
# Annex C: AI 引用的其他标准
# Annex D: AI 与其他管理体系整合

# 认证路径:
# Step 1: Gap 分析 (现状 vs 标准要求)
# Step 2: AIMS 建设 (6-12个月)
# Step 3: 内部审计
# Step 4: 管理评审
# Step 5: 认证审核 (Stage 1 + Stage 2)
# Step 6: 获得证书 (3年有效)
# Step 7: 年度监督审核

# 与 EU AI Act 的关系:
# ISO 42001 认证不等于 EU AI Act 合规
# 但: 认证大大简化合规证明过程
# EU 正在制定协调标准 (Harmonised Standards)
# → 未来 ISO 42001 可能成为"默认合规路径"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔴 AI 红队测试方法论</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> ai_red_teaming</div>
                <pre className="fs-code">{`# AI 红队测试 (AI Red Teaming)

# 定义: 模拟对抗性攻击, 发现AI系统的
# 安全/伦理/功能性漏洞

# 与传统红队的区别:
# ┌──────────┬────────────────┬────────────────┐
# │ 维度      │ 传统网络安全    │ AI 红队         │
# ├──────────┼────────────────┼────────────────┤
# │ 目标      │ 系统入侵       │ 滥用/偏见/泄露  │
# │ 攻击面    │ 代码/网络/社工  │ 提示/数据/模型  │
# │ 工具      │ 渗透测试工具    │ 对抗Prompt/注入 │
# │ 评估      │ CVE/CVSS       │ 安全分类学      │
# │ 团队      │ 安全工程师      │ 安全+伦理+领域  │
# └──────────┴────────────────┴────────────────┘

# AI 红队测试维度:

Dimension_1 = "安全测试"
# ├── Prompt Injection (提示注入)
# │   ├── 直接注入: 绕过系统指令
# │   └── 间接注入: 通过外部数据源
# ├── Jailbreaking (越狱)
# │   ├── DAN (Do Anything Now)
# │   ├── 角色扮演攻击
# │   └── 多步推理绕过
# ├── 数据泄露
# │   ├── 训练数据提取
# │   ├── 系统Prompt泄露
# │   └── PII 泄露
# └── 模型窃取
#     └── 通过API查询复制模型

Dimension_2 = "伦理测试"
# ├── 偏见探测 (系统性歧视输出)
# ├── 有害内容生成 (暴力/仇恨)
# ├── 虚假信息生成 (看似可信的谎言)
# ├── 版权侵权 (逐字复制训练数据)
# └── 隐私侵犯 (推断个人信息)

Dimension_3 = "鲁棒性测试"
# ├── 对抗样本 (图像微扰)
# ├── 输入变异 (拼写错误/同义替换)
# ├── 分布外测试 (异常输入)
# └── 长尾场景测试

# 红队测试流程:
# Phase 1: 范围界定 (什么系统/什么风险)
# Phase 2: 威胁建模 (STRIDE for AI)
# Phase 3: 攻击执行 (手动+自动)
# Phase 4: 发现记录 (严重性分级)
# Phase 5: 修复建议 (缓解措施)
# Phase 6: 复测验证 (修复有效性)

# 自动化工具:
# ├── Garak (NVIDIA, LLM漏洞扫描)
# ├── PyRIT (Microsoft, 红队工具)
# ├── ART (IBM, 对抗鲁棒性)
# ├── Counterfit (Microsoft)
# └── Promptfoo (Prompt测试框架)

# EU AI Act 要求:
# Art.9: 高风险AI必须进行风险评估
# GPAI系统风险模型: 必须进行对抗测试
# → AI红队测试是合规的关键手段`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 AI 影响评估 (AIIA)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> ai_impact_assessment</div>
                <pre className="fs-code">{`# AI 影响评估 (AI Impact Assessment)

# AIIA vs DPIA:
# ├── DPIA: 聚焦数据保护/隐私
# ├── AIIA: 更广泛, 涵盖社会/经济/伦理影响
# └── AIIA 可包含 DPIA 作为子集

# AIIA 评估框架:

Section_1 = "系统描述"
# ├── AI系统名称和版本
# ├── 预期用途和部署环境
# ├── 技术架构概述
# ├── 受影响群体识别
# └── 部署规模和地域

Section_2 = "权利影响评估"
# ├── 对基本权利的影响
# │   ├── 隐私权
# │   ├── 非歧视权
# │   ├── 人格尊严
# │   ├── 个人自由
# │   ├── 获得公正审判权
# │   └── 民主与法治
# ├── 对弱势群体的差异化影响
# │   ├── 儿童
# │   ├── 残疾人
# │   ├── 老年人
# │   └── 少数族裔
# └── 影响程度评估 (低/中/高/极高)

Section_3 = "社会影响评估"
# ├── 就业影响 (岗位替代/创造)
# ├── 社会公平影响
# ├── 信息获取影响
# ├── 民主参与影响
# └── 环境影响 (能源消耗)

Section_4 = "风险-收益分析"
# ┌──────────────────────────────────────┐
# │ 预期收益          │ 潜在风险          │
# ├──────────────────┼──────────────────┤
# │ 效率提升 60%      │ 偏见歧视风险      │
# │ 成本降低 40%      │ 就业影响          │
# │ 用户体验改善      │ 隐私泄露风险      │
# │ 决策一致性提高    │ 过度依赖AI        │
# └──────────────────┴──────────────────┘
# 结论: 收益是否大于风险?
# 且: 风险能否通过缓解措施降至可接受?

Section_5 = "缓解措施"
# ├── 技术措施 (偏见检测/解释性/安全)
# ├── 组织措施 (人工审核/培训/治理)
# ├── 法律措施 (合同/隐私政策/告知)
# └── 监控措施 (持续评估/审计)

Section_6 = "决策与审批"
# ├── 评估结论 (可接受/需修改/不可接受)
# ├── 条件批准 (附带缓解措施)
# ├── 审批签字 (AI治理委员会)
# └── 审查时间表 (定期复评)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
