import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['偏见检测', '公平性指标', '可解释性', '实战工具'];

export default function LessonFairnessXAI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">⚖️ module_05 — AI 公平与可解释</div>
      <div className="fs-hero">
        <h1>AI 公平与可解释：偏见检测 / 公平性指标 / SHAP / LIME / XAI</h1>
        <p>
          AI 系统的偏见可能导致<strong>系统性歧视</strong>——从招聘筛选到信贷审批，
          不公平的 AI 决策会放大社会不平等。EU AI Act 明确要求高风险 AI 系统的"公平性"和"可解释性"。
          本模块系统讲解偏见的来源与检测方法、主流公平性指标（EO/DP/CF）的数学定义，
          以及 SHAP、LIME 等可解释性技术的工程实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚖️ AI 公平与可解释</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 AI 偏见来源全景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> bias_sources</div>
                <pre className="fs-code">{`# AI 偏见的来源与传播链

# 偏见传播链:
社会偏见 → 数据偏见 → 模型偏见 → 决策偏见 → 反馈循环
   ↑                                              │
   └──────── 偏见被放大和固化 ←────────────────────┘

# 1. 数据偏见 (Data Bias)
data_bias = {
    "表征偏见 (Representation)": {
        "描述": "训练数据不能代表目标群体",
        "案例": "面部识别在深色皮肤上准确率低",
        "原因": "训练集中白人面孔占比过高",
    },
    "历史偏见 (Historical)": {
        "描述": "数据反映了历史中的不公正",
        "案例": "招聘AI偏好男性(因历史录用数据)",
        "原因": "过去的歧视性决策嵌入数据",
    },
    "测量偏见 (Measurement)": {
        "描述": "数据收集方式引入系统误差",
        "案例": "犯罪预测偏向巡逻密集区域",
        "原因": "更多巡逻→更多逮捕→更多数据",
    },
    "选择偏见 (Selection)": {
        "描述": "数据采样方式不随机",
        "案例": "仅用线上调查→忽略非互联网用户",
        "原因": "样本不代表全体",
    },
    "标签偏见 (Label)": {
        "描述": "标注者的偏见影响标签质量",
        "案例": "情感分析中的文化差异",
        "原因": "标注者背景单一",
    },
}

# 2. 算法偏见 (Algorithmic Bias)
algorithm_bias = {
    "聚合偏见": "一个模型无法适应所有子群体",
    "学习偏见": "模型放大训练数据中的微小偏差",
    "评估偏见": "评估指标在不同群体上表现不一致",
    "部署偏见": "模型用于非预期的人群或场景",
}

# 3. 受保护属性 (Protected Attributes)
protected_attributes = [
    "种族/民族 (Race/Ethnicity)",
    "性别 (Gender/Sex)",
    "年龄 (Age)",
    "宗教 (Religion)",
    "残疾 (Disability)",
    "性取向 (Sexual Orientation)",
    "婚姻状况 (Marital Status)",
    "国籍 (Nationality)",
    "社会经济地位",
]

# 经典案例:
# ├── Amazon 招聘 AI 歧视女性 (2018) → 项目废弃
# ├── COMPAS 累犯预测偏向非裔 (ProPublica 报道)
# ├── Apple Card 信贷额度性别差异 (2019)
# ├── Google Photos 将黑人标记为"大猩猩"
# ├── Uber/Lyft 定价算法对低收入社区不利
# └── 医疗AI将更多资源分配给白人 (2019 Science)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 公平性指标体系</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> fairness_metrics</div>
                <pre className="fs-code">{`# AI 公平性指标的数学定义

# 符号约定:
# A: 受保护属性 (如性别: A=0 女, A=1 男)
# Y: 真实标签 (0/1)
# Ŷ: 预测标签 (0/1)

# ═══════════════════════════════════════════
# 1. 统计均等 (Statistical Parity / DP)
# ═══════════════════════════════════════════
# 定义: P(Ŷ=1|A=0) = P(Ŷ=1|A=1)
# 含义: 正预测率在所有群体中相等
# 例如: 男女获得贷款的批准率应相同
# 
# 指标: |P(Ŷ=1|A=0) - P(Ŷ=1|A=1)| < ε
# 通常 ε = 0.05 (5%差异阈值)
#
# 80%规则 (四分之五法则):
# P(Ŷ=1|A=0) / P(Ŷ=1|A=1) ≥ 0.8
# 美国EEOC:低于80%可能构成歧视证据

# ═══════════════════════════════════════════
# 2. 机会均等 (Equal Opportunity / EO)
# ═══════════════════════════════════════════
# 定义: P(Ŷ=1|A=0,Y=1) = P(Ŷ=1|A=1,Y=1)
# 含义: 真正例率(TPR/召回率)在各群体中相等
# 例如: 合格候选人中,男女被录用的概率应相同
# 比DP更宽松: 只关注"应该得到正面结果"的群体

# ═══════════════════════════════════════════
# 3. 均等赔率 (Equalized Odds)
# ═══════════════════════════════════════════
# 定义: P(Ŷ=1|A=0,Y=y) = P(Ŷ=1|A=1,Y=y) ∀y
# 含义: TPR 和 FPR 在各群体中都相等
# 比EO更严格: 同时考虑假正例

# ═══════════════════════════════════════════
# 4. 反事实公平 (Counterfactual Fairness)
# ═══════════════════════════════════════════
# 定义: P(Ŷ_A←a|X,A=a)=P(Ŷ_A←a'|X,A=a)
# 含义: 在反事实世界中改变受保护属性,
#       预测结果不应改变
# 例如: 一个女性申请者,如果她是男性,
#       贷款结果应该相同

# ═══════════════════════════════════════════
# 5. 校准 (Calibration)
# ═══════════════════════════════════════════
# 定义: P(Y=1|Ŷ=p,A=a)=p  ∀a,p
# 含义: 预测概率在各群体中都准确
# 例如: 预测70%违约概率的人群中,
#       男女实际违约率都应≈70%

# ⚠️ 不可能定理 (Impossibility Theorem):
# DP, EO, Calibration 不能同时满足!
# (除非基础率相同 or 完美分类器)
# 
# → 必须根据场景选择最重要的指标
# ├── 招聘 → Equal Opportunity (合格者机会平等)
# ├── 信贷 → Equalized Odds (减少误判)
# ├── 广告 → Statistical Parity (曝光均等)
# └── 司法 → Calibration (预测准确性)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔬 可解释性技术 (XAI)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> xai_techniques</div>
                <pre className="fs-code">{`# 可解释性AI (XAI) 技术体系

# 为什么需要可解释性?
EU_AI_Act_Art13 = """
高风险AI系统应以足够透明的方式
设计和开发, 使部署者能够理解
系统的输出并适当使用。
"""

# 可解释性分类:
# ┌───────────┬──────────────────────┐
# │ 类型       │ 说明                 │
# ├───────────┼──────────────────────┤
# │ 固有可解释 │ 模型本身可理解       │
# │ (线性回归/决策树/规则)            │
# ├───────────┼──────────────────────┤
# │ 事后解释   │ 对黑盒模型做解释     │
# │ (SHAP/LIME/Grad-CAM)            │
# ├───────────┼──────────────────────┤
# │ 全局解释   │ 解释整体模型行为     │
# │ (特征重要性/PDP/ALE)             │
# ├───────────┼──────────────────────┤
# │ 局部解释   │ 解释单个预测         │
# │ (SHAP值/LIME/反事实)             │
# └───────────┴──────────────────────┘

# SHAP (SHapley Additive exPlanations)
SHAP = {
    "基础": "博弈论Shapley值",
    "含义": "每个特征对预测的边际贡献",
    "特点": [
        "数学严谨 (唯一满足4条公理)",
        "全局+局部解释",
        "模型无关",
    ],
    "变体": {
        "KernelSHAP": "模型无关(慢)",
        "TreeSHAP": "树模型专用(快)",
        "DeepSHAP": "深度学习专用",
        "GradientSHAP": "梯度近似",
    }
}

# LIME (Local Interpretable
#       Model-agnostic Explanations)
LIME = {
    "原理": "在局部用简单模型近似黑盒",
    "步骤": [
        "1.在预测点附近扰动输入",
        "2.用黑盒模型预测扰动样本",
        "3.用简单模型(线性)拟合局部",
        "4.简单模型的系数即解释",
    ],
    "优点": "直观/快速/模型无关",
    "缺点": "不稳定/局部近似可能不准"
}

# Grad-CAM (梯度加权类激活映射)
Grad_CAM = {
    "适用": "CNN图像分类",
    "原理": "用梯度加权特征图",
    "输出": "热力图(高亮决策区域)",
    "应用": "医疗影像/自动驾驶"
}`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 反事实解释</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> counterfactual</div>
                <pre className="fs-code">{`# 反事实解释 (Counterfactual)
# "如果X变了, 结果会不同吗?"

# 定义:
# 找到与输入最小差异的样本,
# 使模型预测结果改变

# 示例: 贷款审批被拒
原始输入 = {
    "年收入": 45000,
    "负债比": 0.45,
    "信用分": 620,
    "就业年限": 2,
}
# 预测: 拒绝 ❌

反事实 = {
    "年收入": 45000,  # 不变
    "负债比": 0.35,   # ← 降低10%
    "信用分": 650,    # ← 提高30分
    "就业年限": 2,    # 不变
}
# 预测: 批准 ✅

# 解释: "如果您的负债比降低到35%
#        且信用分提高到650,
#        您的贷款将被批准"

# 反事实解释的优势:
# ├── 可行动 (告诉用户怎么改)
# ├── 直观 (人类自然思维方式)
# ├── 满足 GDPR Art.22 要求
# └── 不泄露模型内部结构

# 工具:
# ├── DiCE (Microsoft)
# ├── Alibi (SeldonIO)
# ├── Carla (框架比较)
# └── CFNOW

# EU AI Act 视角:
# → 高风险AI的部署者需要
#   理解决策原因
# → 反事实解释是最佳实践
# → 尤其在金融/人力/社会服务`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛠️ 公平性与可解释性工具</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> fairness_tools</div>
                <pre className="fs-code">{`# 公平性与可解释性工具生态

# ═══ 公平性检测工具 ═══

# 1. AI Fairness 360 (IBM)
aif360 = {
    "语言": "Python",
    "功能": [
        "70+ 公平性指标",
        "12+ 偏见缓解算法",
        "预处理/中处理/后处理",
    ],
    "示例": """
    from aif360.metrics import BinaryLabelDatasetMetric
    
    metric = BinaryLabelDatasetMetric(
        dataset,
        unprivileged_groups=[{'gender': 0}],
        privileged_groups=[{'gender': 1}]
    )
    
    print(f"统计均等差异: {metric.mean_difference()}")
    print(f"异质影响: {metric.disparate_impact()}")
    """,
}

# 2. Fairlearn (Microsoft)
fairlearn = {
    "语言": "Python",
    "功能": [
        "公平性指标计算",
        "约束优化缓解",
        "可视化仪表板",
    ],
    "示例": """
    from fairlearn.metrics import (
        MetricFrame,
        demographic_parity_difference,
        equalized_odds_difference,
    )
    
    mf = MetricFrame(
        metrics={"accuracy": accuracy_score},
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=gender
    )
    
    print(mf.by_group)  # 分组准确率
    print(f"DP差异: {demographic_parity_difference(...)}")
    """,
}

# ═══ 可解释性工具 ═══

# 3. SHAP
SHAP_usage = """
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# 全局重要性
shap.summary_plot(shap_values, X_test)

# 单个预测解释  
shap.waterfall_plot(shap_values[0])

# 依赖图
shap.dependence_plot("age", shap_values, X_test)
"""

# 4. LIME
LIME_usage = """
from lime.lime_tabular import LimeTabularExplainer

explainer = LimeTabularExplainer(
    X_train, feature_names=features,
    class_names=['reject', 'approve']
)

exp = explainer.explain_instance(
    X_test[0], model.predict_proba
)
exp.show_in_notebook()
"""

# 5. InterpretML (Microsoft)
# ├── 固有可解释模型 (EBM)
# ├── SHAP/LIME 集成
# └── 可视化仪表板

# ═══ 合规报告工具 ═══
# ├── Model Card Toolkit (Google)
# ├── FactSheets (IBM)
# ├── Datasheets for Datasets
# └── AI VerifyToolkit (新加坡)

# 推荐工作流:
# 1. 数据阶段 → AIF360 检测数据偏见
# 2. 训练阶段 → Fairlearn 约束优化
# 3. 评估阶段 → SHAP + 公平性指标
# 4. 部署阶段 → 持续监测 + Model Card
# 5. 审计阶段 → 合规报告生成`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
