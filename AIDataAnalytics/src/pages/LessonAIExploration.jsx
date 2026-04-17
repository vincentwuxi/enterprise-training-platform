import React from 'react';
import './LessonCommon.css';

export default function LessonAIExploration() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🔍 模块四：AI 驱动探索性分析 — 异常检测 / 模式发现 / 因果推断</h1>
      <p className="lesson-subtitle">
        让 AI 自动发现数据中隐藏的模式、异常和因果关系
      </p>

      <section className="lesson-section">
        <h2>1. AI 驱动的 EDA</h2>
        <div className="concept-card">
          <h3>🤖 自动化探索性分析</h3>
          <div className="code-block">
{`# AI EDA: 让 LLM 自动分析数据并生成洞察
import pandas as pd
from ydata_profiling import ProfileReport

# 1. 自动 Profiling (全面数据画像)
df = pd.read_csv("business_data.csv")
profile = ProfileReport(
    df,
    title="Business Data Analysis",
    explorative=True,
    correlations={
        "auto": {"calculate": True},
        "spearman": {"calculate": True},
        "phi_k": {"calculate": True},   # 混合类型相关性
    },
    missing_diagrams={
        "bar": True,
        "matrix": True,
        "heatmap": True,
    }
)
profile.to_file("data_profile.html")

# 2. LLM 驱动的 EDA (让 AI 自主分析)
def ai_eda(df, business_context: str):
    """LLM 自动生成分析计划并执行"""
    summary = f"""
    数据集概览:
    - 行数: {len(df)}, 列数: {len(df.columns)}
    - 列名: {list(df.columns)}
    - 数据类型: {df.dtypes.to_dict()}
    - 缺失值: {df.isnull().sum().to_dict()}
    - 数值列统计: {df.describe().to_dict()}
    
    业务背景: {business_context}
    """
    
    analysis_plan = llm_generate(f"""
    基于以下数据集信息, 生成 5 个最有价值的分析方向:
    {summary}
    
    对每个方向:
    1. 提出具体的分析问题
    2. 给出对应的 Python 代码
    3. 预期可能发现什么
    """)
    return analysis_plan

# 3. Sweetviz — 对比分析
import sweetviz as sv

# 训练/测试集对比
report = sv.compare(
    [train_df, "Training"],
    [test_df, "Test"],
    target_feat="churn"
)
report.show_html("comparison.html")

# 4. D-Tale — 交互式分析
import dtale
d = dtale.show(df, host="localhost", port=40000)
# 浏览器打开可交互式探索, 支持自动相关性/异常检测`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 智能异常检测</h2>
        <div className="concept-card">
          <h3>🚨 时序异常检测体系</h3>
          <div className="code-block">
{`# 异常检测方法全景
"""
统计方法:     Z-Score / IQR / Grubbs → 简单快速
ML 方法:      Isolation Forest / LOF / One-Class SVM → 中等复杂
深度学习:     Autoencoder / LSTM-AE → 时序数据
概率模型:     Prophet / ARIMA 残差 → 时序趋势感知
基于 LLM:     异常描述 + 根因分析 → 可解释性强
"""

# PyOD: 统一异常检测库 (30+ 算法)
from pyod.models.iforest import IForest
from pyod.models.ecod import ECOD
from pyod.models.copod import COPOD

# ECOD: 经验累积分布, 无参数, 快速
clf = ECOD(contamination=0.05)
clf.fit(X_train)
labels = clf.predict(X_test)       # 0: 正常, 1: 异常
scores = clf.decision_scores_     # 异常分数

# 多模型集成 (提升稳健性)
from pyod.models.combination import average, maximization

models = {
    "IForest": IForest(contamination=0.05),
    "ECOD": ECOD(contamination=0.05),
    "COPOD": COPOD(contamination=0.05),
}
all_scores = []
for name, model in models.items():
    model.fit(X_train)
    all_scores.append(model.decision_scores_)

# 集成: 多数投票
ensemble_scores = average(all_scores)

# 时序异常: 使用 Facebook Prophet
from prophet import Prophet

m = Prophet(
    changepoint_prior_scale=0.05,
    seasonality_prior_scale=10,
    interval_width=0.99,     # 99% 置信区间
)
m.fit(ts_data)
forecast = m.predict(future)

# 超出置信区间 → 异常
anomalies = ts_data[
    (ts_data['y'] > forecast['yhat_upper']) |
    (ts_data['y'] < forecast['yhat_lower'])
]`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 因果推断</h2>
        <div className="concept-card">
          <h3>⚖️ 因果推断框架 (DoWhy)</h3>
          <div className="code-block">
{`import dowhy
from dowhy import CausalModel

# 因果推断 vs 相关分析
"""
相关分析: 广告支出 ↑ → 销量 ↑ (相关)
因果分析: 广告支出 ↑ 真的导致 销量 ↑ 吗?
  → 排除: 季节因素 / 促销活动 / 竞争对手

DoWhy 四步法:
  1. Model:    建立因果图 (DAG)
  2. Identify:  识别因果效应的数学表达
  3. Estimate:  用数据估计因果效应
  4. Refute:    敏感性分析 (结论是否稳定)
"""

# 1. 定义因果模型
model = CausalModel(
    data=df,
    treatment="ad_spend",        # 干预变量 (广告支出)
    outcome="sales",             # 结果变量 (销量)
    common_causes=["season", "price", "competitor_ads"],  # 混杂因素
    instruments=["ad_budget"],   # 工具变量
)

# 2. 识别因果效应
identified = model.identify_effect(proceed_when_unidentifiable=True)

# 3. 估计因果效应
estimate = model.estimate_effect(
    identified,
    method_name="backdoor.linear_regression",
    # 其他方法: propensity_score_matching, iv.wald_estimator
)
print(f"因果效应: 广告每增加 1 万元, 销量增加 {estimate.value:.2f} 件")

# 4. 稳健性检验
refutation = model.refute_estimate(
    identified, estimate,
    method_name="random_common_cause",  # 添加随机混杂因素
    num_simulations=100
)
print(f"P-value: {refutation.refutation_result['p_value']:.4f}")
# p > 0.05 → 结论稳健`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. A/B 测试进阶</h2>
        <div className="info-box">
          <h3>📋 A/B 测试完整流程</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>关键步骤</th><th>AI 辅助</th></tr>
            </thead>
            <tbody>
              <tr><td>设计</td><td>假设 / 样本量 / 分组</td><td>LLM 辅助假设生成</td></tr>
              <tr><td>执行</td><td>随机化 / 合规检查</td><td>自动 SRM 检测</td></tr>
              <tr><td>分析</td><td>统计检验 / 效应量</td><td>贝叶斯 AB 自动分析</td></tr>
              <tr><td>决策</td><td>ROI 评估 / 风险判断</td><td>AI 决策建议</td></tr>
              <tr><td>推广</td><td>灰度 / 全量发布</td><td>自动异常监控</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：AutoML</span>
        <span className="nav-next">下一模块：智能可视化 →</span>
      </div>
    </div>
  );
}
