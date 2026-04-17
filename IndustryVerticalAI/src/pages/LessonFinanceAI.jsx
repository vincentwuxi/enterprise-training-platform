import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['智能风控', '反欺诈', '量化交易', '智能投顾'];

export default function LessonFinanceAI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🏭 module_02 — 金融 AI</div>
      <div className="fs-hero">
        <h1>金融 AI：风控 / 量化 / 反欺诈 / 智能投顾</h1>
        <p>
          金融是 AI 落地最成熟的行业——每 1% 的风控提升都价值数亿。
          本模块覆盖信贷风控（特征工程/评分卡/LLM增强审批）、
          反欺诈（实时检测/图网络/对抗攻击防御）、
          量化交易（因子挖掘/高频策略/LLM 情绪分析）、
          智能投顾（资产配置/风险画像/合规对话）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">💹 金融 AI</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ 智能信贷风控</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> credit_risk.py</div>
                <pre className="fs-code">{`# —— 智能信贷风控: 从传统评分卡到 LLM 增强 ——

class CreditRiskSystem:
    """信贷风控全链路"""
    
    # === 传统方案: 评分卡 (仍然是基石) ===
    def build_scorecard(self, df):
        """传统评分卡建模"""
        # 1. 特征工程 (金融特征)
        features = {
            "基础信息": ["年龄", "职业", "收入", "工作年限"],
            "信用历史": ["征信查询次数", "逾期次数", "信用卡使用率"],
            "行为特征": ["消费稳定性", "还款及时性", "转账频率"],
            "社交特征": ["通讯录质量", "社交活跃度"],
        }
        
        # 2. WOE (Weight of Evidence) 分箱
        for col in df.columns:
            woe = self.calculate_woe(df[col], df["label"])
            iv = self.calculate_iv(woe)  # IV > 0.3 = 强预测特征
        
        # 3. 逻辑回归评分卡
        model = LogisticRegression()
        model.fit(df_woe, labels)
        
        # 4. 评分映射 (分数 300-900)
        score = self.odds_to_score(model.predict_proba(x))
        return score
    
    # === LLM 增强方案 ===
    def llm_enhanced_review(self, application, scorecard_result):
        """LLM 增强信审"""
        # 传统评分卡: 快速过滤 (拒绝明显坏客户)
        if scorecard_result.score < 400:
            return {"decision": "reject", "reason": "信用评分过低"}
        
        # 灰区客户 (400-600): LLM 辅助审核
        if 400 <= scorecard_result.score <= 600:
            llm_analysis = await self.llm.analyze(f"""
作为信贷审批专家, 分析以下申请:

基本信息: {application.basic_info}
评分卡分数: {scorecard_result.score}
关键风险点: {scorecard_result.risk_factors}

请分析:
1. 主要风险因素
2. 有利因素
3. 建议: 通过/拒绝/补充材料
4. 建议额度和期限
""")
            return llm_analysis
        
        # 优质客户 (600+): 自动通过
        return {"decision": "approve", "amount": self.calc_amount(scorecard_result)}

# 效果:
# 传统评分卡: AUC 0.72, 坏账率 3.5%
# + ML 特征: AUC 0.78, 坏账率 2.8%
# + LLM 增强: AUC 0.82, 坏账率 2.2%
# 每降 1% 坏账率 ≈ 节省 $5-50M/年`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🚨 实时反欺诈</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> anti_fraud.py</div>
                <pre className="fs-code">{`# 反欺诈检测系统

class FraudDetection:
    """多层反欺诈引擎"""
    
    def detect(self, transaction):
        """实时反欺诈 (<50ms)"""
        scores = {}
        
        # Layer 1: 规则引擎 (2ms)
        scores["rules"] = self.rule_engine(transaction)
        # 规则: 单笔>5万 & 新设备 & 凌晨
        # → 风险分 +30
        
        # Layer 2: ML 模型 (10ms)
        features = self.extract_features(transaction)
        scores["ml"] = self.xgboost_model.predict(features)
        # 特征: 历史消费模式/设备指纹/地理位移
        
        # Layer 3: 图网络分析 (20ms)
        scores["graph"] = self.graph_analysis(transaction)
        # 关联: 收款方是否关联已知欺诈账户?
        # 黑产团伙: 共用设备/IP/收货地址
        
        # Layer 4: LLM 分析 (异步, 复杂case)
        if self.is_suspicious(scores):
            self.async_llm_review(transaction)
        
        # 综合决策
        final_score = self.ensemble(scores)
        return {
            "risk_score": final_score,
            "action": self.decide(final_score),
            # block / review / pass
        }
    
    def graph_analysis(self, txn):
        """图网络: 发现欺诈团伙"""
        # Neo4j Cypher 查询
        query = """
        MATCH (a:Account)-[:TRANSFER]->(b:Account)
        WHERE a.id = $account_id
        MATCH path = (b)-[:TRANSFER*1..3]->(c:Account)
        WHERE c.fraud_flag = true
        RETURN count(path) as fraud_connections
        """
        result = self.neo4j.run(query, account_id=txn.sender)
        return result["fraud_connections"]

# 效果:
# 规则引擎: 召回 40%, 精确 60%
# + ML: 召回 75%, 精确 85%
# + 图网络: 召回 90%, 精确 92%
# 误拒率: < 0.1% (核心指标)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🕵️ 欺诈类型与应对</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> fraud_types</div>
                <pre className="fs-code">{`金融欺诈类型与 AI 应对:

1️⃣ 信用卡盗刷
├── 特征: 异常地理/时间/金额
├── AI: 行为序列模型 (LSTM/Transformer)
├── 难点: 对抗性攻击 (模仿正常消费)
└── 效果: 检出率 95%+

2️⃣ 身份冒用
├── 特征: 设备指纹异常, 行为模式不同
├── AI: 生物特征+行为建模
├── 难点: 深度伪造 (DeepFake)
└── 应对: 多因子活体检测

3️⃣ 团伙欺诈
├── 特征: 关联账户协同作案
├── AI: 图神经网络 (GNN)
├── 难点: 隐蔽性强, 关系复杂
└── 效果: 团伙发现 ↑ 5-10x

4️⃣ 洗钱 (AML)
├── 特征: 分散→聚合→再分散
├── AI: 交易序列 + 图分析
├── 难点: 合规要求 (可解释性)
└── 监管: SAR 自动生成

5️⃣ 保险欺诈
├── 特征: 异常理赔模式
├── AI: 多模态 (图片+文本+数据)
├── 难点: 低频事件, 样本少
└── 效果: 欺诈检出 ↑ 3x

⚠️ 金融 AI 特殊要求:
├── 可解释性 (监管要求)
├── 公平性 (不能歧视)
├── 实时性 (<100ms)
└── 合规审计 (全链路留痕)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📈 AI 量化交易</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> quant.py</div>
                <pre className="fs-code">{`# —— AI 量化交易: 从因子挖掘到 LLM 情绪分析 ——

class AIQuantSystem:
    """AI 量化交易系统"""
    
    # 1. 传统因子 + ML 增强
    def ml_alpha_factor(self, market_data):
        """机器学习因子挖掘"""
        # 传统因子: 价值/动量/质量/波动率
        # ML 因子: 非线性组合 + 高维交互
        
        features = {
            "价格因子": self.price_features(market_data),     # 20维
            "财务因子": self.fundamental_features(market_data), # 50维
            "技术因子": self.technical_features(market_data),   # 30维
            "另类因子": self.alternative_features(market_data), # 10维
        }
        
        # LightGBM / TabNet 预测收益率
        prediction = self.model.predict(features)
        return prediction  # 预测 T+1 收益率排名
    
    # 2. LLM 情绪因子 (2024-25 新趋势)
    async def llm_sentiment_factor(self, news, reports):
        """LLM 驱动的情绪/事件因子"""
        for article in news:
            analysis = await self.llm.analyze(f"""
分析以下财经新闻对相关股票的影响:
标题: {article.title}
内容: {article.content[:500]}

输出 JSON:
- sentiment: -1到1 (负面到正面)
- magnitude: 0到1 (影响程度)
- affected_stocks: [股票代码列表]
- event_type: (财报/政策/并购/人事/行业)
- duration: (短期/中期/长期)
""")
        # 聚合为因子信号
        return self.aggregate_sentiment(analysis)
    
    # 3. 策略组合
    # ├── 选股: ML因子排名 → 选Top 10%
    # ├── 择时: 情绪因子 → 仓位调整
    # ├── 风控: 最大回撤 < 15%, 日VaR < 2%
    # └── 执行: TWAP/VWAP 算法交易

# ⚠️ 量化 AI 的现实:
# ├── Alpha 衰减: 因子有效期越来越短
# ├── 过拟合: 回测很美, 实盘亏钱
# ├── 数据成本: 另类数据 $50K-500K/年
# └── 算力竞争: 速度比准确更重要 (HFT)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 智能投顾</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> robo_advisor.py</div>
                <pre className="fs-code">{`# —— LLM 智能投顾: 合规对话 + 资产配置 ——

class RoboAdvisor:
    """LLM 驱动的智能投顾"""
    
    async def consultation(self, user_query, user_profile):
        """投顾对话 (带合规约束)"""
        
        # 1. 用户风险画像
        risk_profile = self.assess_risk(user_profile)
        # KYC: 年龄/收入/投资经验/风险偏好
        # 评分: 保守/稳健/平衡/积极/激进
        
        # 2. LLM 生成投资建议 (带安全护栏)
        response = await self.llm.generate(
            system="""
你是一名持牌金融顾问。严格遵守以下规则:
1. 不得承诺收益或保本
2. 必须提示投资风险
3. 不推荐单一标的, 推荐组合
4. 不得提供内幕信息
5. 建议需符合用户风险评级
6. 需要免责声明
""",
            user=f"""
用户风险等级: {risk_profile}
用户问题: {user_query}
市场速览: {self.market_brief()}

请提供专业的投资建议。
"""
        )
        
        # 3. 合规审查 (自动)
        compliance_check = await self.compliance_filter(response)
        if not compliance_check.passed:
            response = self.safe_response(compliance_check.issues)
        
        # 4. 资产配置建议
        allocation = self.optimize_portfolio(risk_profile)
        # 保守: 债券70% / 股票15% / 现金15%
        # 平衡: 债券40% / 股票40% / 另类20%
        # 激进: 债券10% / 股票70% / 另类20%
        
        return {
            "response": response,
            "allocation": allocation,
            "disclaimer": "投资有风险,入市需谨慎。以上建议仅供参考。",
            "compliance_log": compliance_check.log
        }

# 智能投顾需要的特殊能力:
# ├── 实时行情接入 (行情数据API)
# ├── 合规知识库 (证监会/银保监规定)
# ├── 产品库 (基金/理财产品信息)
# ├── 用户画像 (KYC/历史交易)
# └── 风险预警 (市场异常自动告警)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
