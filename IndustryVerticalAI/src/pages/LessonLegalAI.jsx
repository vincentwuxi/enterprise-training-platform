import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['合同审查', '类案检索', '法律问答', '合规风控'];

export default function LessonLegalAI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge orange">🏭 module_05 — 法律 AI</div>
      <div className="fs-hero">
        <h1>法律 AI：合同审查 / 类案检索 / 法律问答 / 合规</h1>
        <p>
          法律行业正经历 AI 颠覆——GPT-4 已通过美国律师资格考试前 10%。
          本模块覆盖 AI 合同审查（条款提取/风险识别/自动修订/多语言）、
          智能类案检索（语义检索/判决预测/案情比对）、
          法律问答（RAG+法律知识库/多轮咨询）、
          以及企业合规风控（法规监控/合规审查/尽职调查）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚖️ 法律 AI</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📝 AI 合同审查</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> contract_review.py</div>
                <pre className="fs-code">{`# —— AI 合同审查: 从人工逐条到分钟级审查 ——

class ContractReviewer:
    """AI 合同审查引擎"""
    
    async def review(self, contract_text, contract_type="sales"):
        """全自动合同审查"""
        
        # 1. 合同解析 (OCR + 结构化)
        parsed = await self.parse_contract(contract_text)
        # ├── 合同类型识别 (买卖/租赁/劳动/融资)
        # ├── 章节分割 (定义/权利义务/违约/争议)
        # └── 关键条款提取 (金额/日期/主体)
        
        # 2. 条款级风险分析
        risks = []
        for clause in parsed.clauses:
            analysis = await self.llm.analyze(f"""
你是资深法律顾问。分析以下合同条款的风险:

合同类型: {contract_type}
条款标题: {clause.title}
条款内容: {clause.text}

我方立场: 买方 (需保护买方利益)

请分析:
1. 风险等级: 高/中/低/无
2. 风险说明: 为什么有风险
3. 法律依据: 相关法条
4. 修改建议: 具体修改方案

JSON 格式输出。
""")
            risks.append(analysis)
        
        # 3. 缺失条款检测
        missing = self.check_completeness(parsed, contract_type)
        # 常见遗漏: 不可抗力/知识产权/保密/反腐
        
        # 4. 生成审查报告
        report = self.generate_report(parsed, risks, missing)
        
        return report

    风险条款检测示例:
    ┌─────────────────┬──────┬──────────────────────┐
    │ 条款类型         │ 风险  │ AI 建议               │
    ├─────────────────┼──────┼──────────────────────┤
    │ 无限制赔偿责任   │ 🔴高 │ 增加赔偿上限 (合同额x2)│
    │ 单方面解约权     │ 🔴高 │ 增加对等解约条件        │
    │ 过长付款账期     │ 🟡中 │ 缩短至30天+逾期利息    │
    │ 模糊的验收标准   │ 🟡中 │ 量化验收指标           │
    │ 缺少保密条款     │ 🟡中 │ 补充保密义务和范围      │
    │ 知识产权归属不明  │ 🔴高 │ 明确归属+使用许可      │
    │ 不可抗力范围过窄  │ 🟢低 │ 增加疫情/制裁等情形    │
    └─────────────────┴──────┴──────────────────────┘

    效果:
    ├── 审查时间: 2小时 → 5分钟 (24x 提速)
    ├── 风险检出率: 95% (vs 人工 80%)
    ├── 成本: $500 → $50/份
    └── 注意: 复杂合同仍需律师确认`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 智能类案检索</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> case_search.py</div>
                <pre className="fs-code">{`# —— 智能类案检索: 语义理解 + 判决预测 ——

class LegalCaseSearch:
    """AI 驱动的类案检索系统"""
    
    async def search(self, case_description):
        """语义类案检索"""
        
        # 1. 案情要素提取 (LLM)
        elements = await self.extract_elements(case_description)
        # {
        #   "案由": "劳动合同纠纷",
        #   "争议焦点": ["违法解除", "经济补偿"],
        #   "关键事实": ["工作年限5年", "未提前30天通知"],
        #   "适用法条": ["劳动合同法第47条", "第87条"],
        #   "诉讼请求": ["赔偿金", "补发工资"]
        # }
        
        # 2. 多维度检索
        results = self.hybrid_search(
            # 语义: 案情描述向量相似度
            semantic=self.encode(case_description),
            # 结构化: 案由/法条/法院级别
            filters={
                "案由": elements["案由"],
                "法院级别": "中级以上",
                "年份": ">2020",
            },
            # 要素: 争议焦点匹配
            element_match=elements["争议焦点"],
        )
        
        # 3. 类案分析 (LLM)
        for case in results[:10]:
            case.analysis = await self.llm.analyze(f"""
比较以下两个案件的异同:

待分析案件: {case_description[:300]}
参考案件: {case.summary}

分析:
1. 事实相似度 (0-100)
2. 法律适用相似度 (0-100)
3. 关键异同点
4. 参考价值评估
5. 预测胜诉概率
""")
        
        return results

    # 4. 判决预测 (辅助)
    async def predict_outcome(self, case):
        """基于历史判决预测结果"""
        similar_cases = await self.search(case)
        
        # 统计历史判决趋势
        outcomes = self.analyze_trends(similar_cases)
        # ├── 原告胜诉率: 65%
        # ├── 平均赔偿额: ¥85,000
        # ├── 常见判决理由: [...]
        # └── 上诉改判率: 12%
        
        return outcomes

    # 法律 AI 知识库规模:
    # ├── 裁判文书网: 1.3亿+判决书
    # ├── 法律法规: 60万+条
    # ├── 司法解释: 2万+条
    # └── 案例分析: 100万+篇`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>💬 法律问答系统</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> legal_qa</div>
                <pre className="fs-code">{`法律 AI 问答系统架构:

RAG + 法律知识库:
┌─────────────────────────────┐
│ 用户问题                     │
│ "公司拖欠工资3个月怎么办?"    │
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ 1. 问题分类 + 意图识别        │
│ ├── 领域: 劳动法             │
│ ├── 意图: 法律咨询           │
│ └── 紧急: 是 (权益受损)      │
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ 2. RAG 检索                  │
│ ├── 法条: 劳动法 50/85条     │
│ ├── 司法解释: 劳动争议解释四  │
│ ├── 类案: 3个相关判例         │
│ └── 指南: 劳动仲裁流程       │
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ 3. LLM 生成回答              │
│ ├── 法律分析 + 法条引用       │
│ ├── 维权步骤建议             │
│ ├── 准备材料清单             │
│ ├── 时效提醒 (1年仲裁时效)   │
│ └── 免责声明                 │
└─────────────────────────────┘

关键能力:
├── 多轮对话: 追问细节
├── 法条引用: 精确到条款
├── 计算: 赔偿金/经济补偿计算
├── 表格生成: 证据清单模板
└── 文书生成: 起诉状/仲裁申请

⚠️ 限制与合规:
├── 不替代律师 (仅供参考)
├── 复杂案件推荐线下咨询
├── 不提供诉讼策略建议
└── 明确告知信息时效性`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🏢 企业合规 AI</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> compliance</div>
                <pre className="fs-code">{`企业合规 AI 应用:

1️⃣ 法规监控 (RegTech)
├── 实时追踪法规更新
│   全球 200+ 监管机构
├── AI 解读: 新规对企业的影响
├── 自动关联公司业务线
└── 效果: 合规响应时间 ↓ 80%

2️⃣ 合规审查自动化
├── 营销材料审查
│   广告法/消保法/行业规定
├── 产品合规检查
│   标准/认证/进出口
├── 数据隐私审查
│   GDPR/个保法/CCPA
└── 效果: 审查效率 ↑ 5x

3️⃣ 尽职调查 (DD)
├── 企业背景调查
│   工商/诉讼/处罚/关联方
├── 反洗钱 (AML/KYC)
│   身份验证/制裁筛查
├── 反腐 (FCPA/UK Bribery Act)
│   政治暴露人 (PEP) 筛查
└── 效果: DD 时间 50h → 5h

4️⃣ 内部合规培训
├── AI 生成定制化培训内容
├── 场景化合规测试
├── 违规行为预警
└── 合规文化评估

法律 AI 产品生态:
├── 通义法睿 (阿里): 法律大模型
├── GPTLaw: 法律GPT
├── 法信: 裁判文书检索
├── 北大法宝: 法律数据库+AI
└── Harvey: 法律AI (海外, $2B估值)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
