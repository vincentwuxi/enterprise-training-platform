import React from 'react';
import './LessonCommon.css';

export default function LessonAutoML() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🤖 模块三：AutoML 自动化建模 — 特征工程 / 模型选择 / 超参优化</h1>
      <p className="lesson-subtitle">
        让 AI 自动完成从数据到模型的全流程，解放分析师的双手
      </p>

      <section className="lesson-section">
        <h2>1. AutoML 全景</h2>
        <div className="info-box">
          <h3>🗺️ AutoML 技术栈</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>框架</th><th>类型</th><th>特点</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>Auto-sklearn</td><td>开源</td><td>基于 sklearn, 贝叶斯优化</td><td>经典 ML 任务</td></tr>
              <tr><td>AutoGluon</td><td>开源 (AWS)</td><td>多层堆叠, 表格数据 SOTA</td><td>表格/图像/文本/多模态</td></tr>
              <tr><td>FLAML</td><td>开源 (微软)</td><td>轻量快速, 资源感知</td><td>资源受限场景</td></tr>
              <tr><td>PyCaret</td><td>开源</td><td>低代码, 可视化友好</td><td>快速原型验证</td></tr>
              <tr><td>H2O AutoML</td><td>开源/商用</td><td>企业级, 可解释性</td><td>金融/风控</td></tr>
              <tr><td>Google Vertex AI</td><td>云服务</td><td>全托管, 与 GCP 集成</td><td>企业级生产</td></tr>
              <tr><td>Azure AutoML</td><td>云服务</td><td>全托管, 可解释性</td><td>微软生态</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. AutoGluon — 表格数据 SOTA</h2>
        <div className="concept-card">
          <h3>🏆 AutoGluon-Tabular 实战</h3>
          <div className="code-block">
{`from autogluon.tabular import TabularDataset, TabularPredictor

# AutoGluon: 3 行代码建模, Kaggle 竞赛级精度
# 自动: 数据清洗 → 特征工程 → 模型选择 → 调参 → 集成

# 1. 加载数据
train_data = TabularDataset("train.csv")
test_data = TabularDataset("test.csv")

# 2. 一键训练 (AutoGluon 自动完成所有工作)
predictor = TabularPredictor(
    label="target",           # 目标列
    eval_metric="roc_auc",    # 评估指标
    problem_type="binary",    # 任务类型: binary/multiclass/regression
    path="models/",           # 模型保存路径
).fit(
    train_data,
    time_limit=3600,          # 训练时间限制 (秒)
    presets="best_quality",   # 质量优先 (vs "medium_quality" / "optimize_for_deployment")
    # 内部自动训练:
    # - 多种模型: LightGBM, XGBoost, CatBoost, RandomForest, NN, KNN...
    # - 多层堆叠 (Multi-layer Stacking)
    # - 交叉验证 + 集成
)

# 3. 评估
leaderboard = predictor.leaderboard(test_data)
print(leaderboard[["model", "score_val", "pred_time_val", "fit_time"]])
"""
┌──────────────────────┬───────────┬──────────┬──────────┐
│ model                │ score_val │ pred_time│ fit_time │
├──────────────────────┼───────────┼──────────┼──────────┤
│ WeightedEnsemble_L2  │ 0.9234   │ 0.15s    │ 45s      │
│ LightGBMXT           │ 0.9189   │ 0.02s    │ 12s      │
│ CatBoost             │ 0.9156   │ 0.03s    │ 28s      │
│ XGBoost              │ 0.9134   │ 0.02s    │ 15s      │
│ NeuralNetTorch       │ 0.9078   │ 0.08s    │ 120s     │
│ RandomForest         │ 0.8945   │ 0.05s    │ 8s       │
└──────────────────────┴───────────┴──────────┴──────────┘
"""

# 4. 预测
predictions = predictor.predict(test_data)
probabilities = predictor.predict_proba(test_data)

# 5. 特征重要性
importance = predictor.feature_importance(test_data)
print(importance.head(10))

# 6. 部署导出
# 直接 pickle 保存, 或导出为 ONNX
predictor.save("production_model/")`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. LLM + AutoML: 新范式</h2>
        <div className="concept-card">
          <h3>🧠 LLM 驱动的智能建模</h3>
          <div className="code-block">
{`# CAAFE: LLM 自动特征工程
# Context-Aware Automated Feature Engineering
"""
传统 AutoML: 基于预定义的特征变换 (多项式/交叉/分箱)
LLM AutoML: 理解特征语义, 创造有业务含义的新特征

示例:
  输入特征: [年龄, 收入, 贷款金额, 工作年限]
  LLM 创造: 
    - 收入/贷款金额 (偿债能力比)
    - 年龄-工作年限 (开始工作年龄, 反映教育水平)
    - 贷款金额/收入 × 12 (偿还月数估算)
"""

# CAAFE 使用
from caafe import CAAFEClassifier
import openai

caafe_clf = CAAFEClassifier(
    base_classifier="autogluon",
    llm_model="gpt-4o",
    iterations=10,           # LLM 迭代次数
    feature_descriptions={   # 特征描述 (帮助 LLM 理解)
        "age": "客户年龄",
        "income": "年收入 (元)",
        "loan_amount": "贷款金额 (元)",
        "work_years": "工作年限",
    }
)

caafe_clf.fit(X_train, y_train)
# LLM 自动生成的特征:
# - debt_to_income = loan_amount / income
# - work_start_age = age - work_years
# - monthly_payment_ratio = (loan_amount / 360) / (income / 12)

# LLM 辅助模型解释
def explain_model(predictor, feature_importance, sample):
    """用 LLM 生成模型解释报告"""
    prompt = f"""
    模型预测结果分析:
    - 任务: 信用贷款违约预测
    - 最终模型: 加权集成 (LightGBM + CatBoost + XGBoost)
    - AUC: 0.923
    - 特征重要性 Top 10: {feature_importance.head(10).to_dict()}
    - 示例预测: {sample.to_dict()}
    
    请生成一份简洁的业务解读报告, 包括:
    1. 模型核心逻辑 (用业务语言)
    2. 关键风险因子分析
    3. 对业务的建议
    """
    return llm_generate(prompt)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. AutoML 最佳实践</h2>
        <div className="info-box">
          <h3>📋 AutoML 使用指南</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>场景</th><th>推荐框架</th><th>关键配置</th></tr>
            </thead>
            <tbody>
              <tr><td>快速基线</td><td>PyCaret</td><td>setup() → compare_models()</td></tr>
              <tr><td>最高精度</td><td>AutoGluon</td><td>presets="best_quality"</td></tr>
              <tr><td>资源受限</td><td>FLAML</td><td>time_budget=60, 自动控制</td></tr>
              <tr><td>可解释性</td><td>H2O AutoML</td><td>开启 SHAP 解释</td></tr>
              <tr><td>生产部署</td><td>Vertex AI / Azure</td><td>全托管 + CI/CD</td></tr>
              <tr><td>时序预测</td><td>AutoGluon-TS</td><td>多模型对比</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：Text2SQL</span>
        <span className="nav-next">下一模块：AI 探索性分析 →</span>
      </div>
    </div>
  );
}
