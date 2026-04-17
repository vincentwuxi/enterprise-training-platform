import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['风险分级', '合规义务', 'GPAI 规定', '实操清单'];

export default function LessonEUAIAct() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">⚖️ module_02 — EU AI Act 深度</div>
      <div className="fs-hero">
        <h1>EU AI Act 深度解析：风险分级 / 合规流程 / 技术文档</h1>
        <p>
          EU AI Act 是全球首部<strong>综合性 AI 立法</strong>，采用基于风险的分级监管框架。
          从"不可接受风险"（社会评分系统）到"最小风险"（垃圾邮件过滤），
          不同风险等级对应不同合规义务。本模块逐条解读法案核心条款，
          特别深入<strong>高风险 AI 系统</strong>的合规要求与 GPAI 模型的透明度义务。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🇪🇺 EU AI Act</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔺 AI 风险分级金字塔</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> risk_classification</div>
                <pre className="fs-code">{`# EU AI Act 风险分级体系

          ▲ 不可接受风险 (PROHIBITED)
         ╱ ╲  完全禁止使用
        ╱   ╲ 
       ╱     ╲ ├── 社会评分系统 (政府对公民打分)
      ╱       ╲├── 实时远程生物识别 (公共场所面部识别)*
     ╱  ❌禁止  ╲── 利用弱势群体的操纵性AI
    ╱           ╲── 基于生物特征的情感推断 (工作/教育)
   ╱─────────────╲── 无差别面部图像抓取 (互联网/CCTV)
  ╱               ╲
 ╱  🔴 高风险       ╲  严格合规要求
╱  (HIGH RISK)       ╲
├── Annex I: 产品安全法规覆盖的AI
│   ├── 医疗器械中的AI
│   ├── 汽车安全系统中的AI
│   ├── 航空/铁路安全AI
│   └── 电梯/压力设备AI
├── Annex III: 独立高风险AI系统
│   ├── 生物识别 (远程身份验证)
│   ├── 关键基础设施 (水/电/交通)
│   ├── 教育 & 职业培训 (录取/评分)
│   ├── 就业 (招聘/绩效/解雇)
│   ├── 公共服务 (社会福利/信用评分)
│   ├── 执法 (犯罪预测/证据分析)
│   ├── 移民 & 边境 (签证/庇护)
│   └── 司法 (量刑辅助/法律研究)
╱─────────────────────────────╲
╱  🟡 有限风险 (LIMITED RISK)    ╲  透明度义务
├── Chatbot (必须告知用户是AI)
├── 深度伪造 (必须明确标识)
├── 情感识别系统 (必须告知)
└── AI 生成内容 (必须标识)
╱───────────────────────────────╲
╱  🟢 最小风险 (MINIMAL RISK)     ╲  无强制要求
├── 垃圾邮件过滤
├── 游戏AI / 推荐系统
├── 库存管理AI
└── 绝大多数AI应用属于此类

* 执法例外: 特定严重犯罪可使用实时生物识别

# 分类判断关键:
# "你的AI系统是否在做可能影响个人基本权利的决策?"
# 如果是 → 大概率是高风险`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 高风险 AI 系统合规义务</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> high_risk_obligations</div>
                <pre className="fs-code">{`# 高风险 AI 系统: 提供者(Provider)义务

# Art.9 风险管理系统
risk_management = {
    "要求": "建立并维护风险管理系统",
    "内容": [
        "识别和分析已知及可预见风险",
        "评估风险的可能性和严重性",
        "采取风险缓解措施",
        "测试和验证缓解措施有效性",
        "持续监测和更新风险评估",
    ],
    "关键": "贯穿AI系统整个生命周期"
}

# Art.10 数据与数据治理
data_governance = {
    "要求": "训练/验证/测试数据集的质量管理",
    "内容": [
        "数据收集流程文档化",
        "数据标注方法和标准",
        "数据清洗和预处理",
        "偏见检测和缓解",
        "数据隐私合规 (GDPR)",
        "数据代表性评估",
    ]
}

# Art.11 技术文档
technical_docs = {
    "要求": "上市前编制完整技术文档",
    "内容": [
        "系统一般描述 (用途/功能/限制)",
        "开发过程详细记录",
        "监控和测试程序",
        "设计规范和算法逻辑",
        "数据集描述",
        "性能指标和测试结果",
        "风险管理措施",
        "与其他系统的交互说明",
    ]
}

# Art.12 记录保持 (日志)
logging = {
    "要求": "自动记录系统运行日志",
    "内容": [
        "每次使用的开始/结束时间",
        "输入数据的参考信息",
        "人工监督者的识别信息",
    ],
    "保留期": "至少 6 个月 (除非另有法律要求)"
}

# Art.13 透明度信息
transparency = {
    "要求": "向部署者提供使用说明书",
    "内容": [
        "提供者身份和联系方式",
        "系统能力和局限性",
        "预期用途和禁止用途",
        "人工监督的措施和建议",
        "预期准确率/鲁棒性/安全性",
    ]
}

# Art.14 人工监督
human_oversight = {
    "要求": "确保可由人有效监督",
    "措施": [
        "操作者理解系统能力和局限",
        "能够监测系统运行",
        "能够中止系统运行 (kill switch)",
        "能够推翻系统决策",
    ]
}

# Art.15 准确性、鲁棒性和安全性
accuracy_robustness = {
    "要求": "达到适当水平",
    "测试": [
        "准确率/精确率/召回率基准",
        "对抗攻击鲁棒性",
        "网络安全防护",
        "故障安全机制",
    ]
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🤖 GPAI 通用 AI 模型规定</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> gpai_rules</div>
                <pre className="fs-code">{`# GPAI (General Purpose AI) 模型规定
# 针对: GPT-4/Claude/Gemini 等大模型

# 所有 GPAI 模型的基本义务:
┌──────────────────────────────────┐
│ 1. 技术文档                      │
│    模型能力/局限/训练信息         │
│                                  │
│ 2. 下游部署者信息                 │
│    向使用者提供集成所需信息       │
│                                  │
│ 3. 版权合规                      │
│    遵守版权法 / 提供训练数据摘要  │
│                                  │
│ 4. EU 数据库注册                  │
│    在 EU AI 数据库中注册          │
└──────────────────────────────────┘

# "系统风险" GPAI (额外义务):
# 判断标准: 训练算力 > 10^25 FLOPs
# (目前包括: GPT-4, Gemini Ultra 等)

┌──────────────────────────────────┐
│ 5. 模型评估                      │
│    对抗测试 / 安全评估            │
│                                  │
│ 6. 风险缓解                      │
│    系统风险的识别和缓解措施       │
│                                  │
│ 7. 事件报告                      │
│    严重事件向 AI Office 报告      │
│                                  │
│ 8. 网络安全                      │
│    模型和基础设施的安全防护       │
└──────────────────────────────────┘

# 开源模型特殊待遇:
# ├── 基本义务简化 (文档+版权)
# ├── 免除下游义务传递
# └── 但系统风险模型不享受豁免

# 时间线:
# 2025.08 GPAI 义务开始执行
# AI Office 发布实施准则`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>⏰ 合规时间表</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> timeline</div>
                <pre className="fs-code">{`# EU AI Act 分阶段执行时间表

2024.08.01 ── 法案正式生效
  │
  ├── 6个月后 (2025.02)
  │   🔴 禁止不可接受风险AI系统
  │   └── 社会评分/操纵性AI禁令
  │
  ├── 12个月后 (2025.08)
  │   🟡 GPAI 模型义务生效
  │   ├── 透明度义务
  │   ├── 技术文档
  │   └── 版权合规
  │
  ├── 24个月后 (2026.08)
  │   🔴 高风险AI系统义务生效
  │   ├── 独立高风险(Annex III)
  │   ├── 风险管理/数据治理
  │   ├── 技术文档/日志记录
  │   └── 人工监督/透明度
  │
  └── 36个月后 (2027.08)
      🟡 嵌入产品的高风险AI
      ├── 医疗器械中的AI
      ├── 汽车安全AI
      └── 其他受监管产品

# 现在该做什么:
# ┌──────────────────────┐
# │ ✅ 立即: 系统清单盘点 │
# │ ✅ 立即: 风险分级评估 │
# │ ✅ Q1-Q2: 治理架构   │
# │ ✅ Q3-Q4: 技术合规   │
# │ ⚠️ 2026前: 全面就绪  │
# └──────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>✅ EU AI Act 合规实操清单</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> compliance_checklist</div>
                <pre className="fs-code">{`# EU AI Act 合规检查清单 (高风险 AI 系统)

□ 1. 系统分类
  □ 确定 AI 系统是否属于高风险 (Annex I/III)
  □ 确定角色: 提供者 / 部署者 / 进口商 / 分销商
  □ 评估是否有豁免 (军事/安全/研究/开源)

□ 2. 风险管理 (Art.9)
  □ 建立风险管理系统
  □ 识别已知和可预见风险
  □ 制定风险缓解措施
  □ 定期审查和更新

□ 3. 数据治理 (Art.10)
  □ 训练数据质量评估报告
  □ 偏见检测报告 (protected attributes)
  □ 数据集文档 (来源/标注/分布)
  □ GDPR 合法性基础文档

□ 4. 技术文档 (Art.11)
  □ 系统描述 (用途/功能/架构)
  □ 算法设计文档
  □ 训练和验证方法
  □ 性能指标报告
  □ 已知局限性声明

□ 5. 日志系统 (Art.12)
  □ 自动日志记录功能
  □ 日志保留策略 (≥6个月)
  □ 日志访问控制

□ 6. 透明度 (Art.13)
  □ 用户使用说明书
  □ 系统能力和局限说明
  □ 人工监督指南

□ 7. 人工监督 (Art.14)
  □ 监督机制设计
  □ 操作员培训计划
  □ kill switch 实现
  □ 决策推翻流程

□ 8. 合格评定 (Art.43)
  □ 内部合格评定 或
  □ 第三方评定 (高风险场景)
  □ CE 标志
  □ EU AI 数据库注册

□ 9. 上市后监控 (Art.72)
  □ 持续监控计划
  □ 事件报告机制
  □ 用户反馈收集
  □ 定期复评`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
