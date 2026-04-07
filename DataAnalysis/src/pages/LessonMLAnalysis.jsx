import React, { useState } from 'react';
import './LessonCommon.css';

export default function LessonMLAnalysis() {
  const [model, setModel] = useState('churn');
  const models = {
    churn: {
      label: '流失预测',
      desc: '提前30天预测哪些用户将要流失，主动干预挽留',
      code: `import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

# ── 特征工程 ──────────────────────────────────────
df['days_since_last_login'] = (pd.Timestamp.now() - df['last_login_date']).dt.days
df['avg_session_duration'] = df['total_session_time'] / df['session_count'].clip(1)
df['purchase_frequency']   = df['order_count'] / df['tenure_days'].clip(1)
df['support_tickets']      = df['ticket_count']  # 客服工单数（负向特征）

FEATURES = [
    'days_since_last_login',   # 最近登录距今天数
    'avg_session_duration',    # 平均会话时长
    'purchase_frequency',      # 购买频率
    'support_tickets',          # 客服工单（越多越可能流失）
    'plan_tier',               # 订阅档位
    'payment_failures',        # 支付失败次数
]

X = df[FEATURES]
y = df['churned_30d']  # 标签：30天内是否流失

# ── 训练模型 ──────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y)

model = GradientBoostingClassifier(n_estimators=200, max_depth=4, learning_rate=0.05)
model.fit(X_train, y_train)

print("AUC-ROC:", roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))
print(classification_report(y_test, model.predict(X_test)))

# ── 输出高风险用户列表 ────────────────────────────
df['churn_prob'] = model.predict_proba(X)[:, 1]
high_risk = df[df.churn_prob > 0.7].sort_values('churn_prob', ascending=False)
high_risk[['user_id', 'churn_prob', 'plan_tier']].to_csv('high_risk_users.csv')`,
      output: `AUC-ROC: 0.847

              precision  recall  f1-score  support
churned(1)       0.71    0.68      0.69     1842
active (0)       0.94    0.95      0.94     8158

高风险用户: 1,247 人  (预计30天内流失)
最重要特征:
  1. days_since_last_login  0.342
  2. purchase_frequency      0.218
  3. support_tickets         0.187`,
    },
    anomaly: {
      label: '异常检测',
      desc: '自动发现数据异常（刷单、系统故障、业务异常）',
      code: `import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# ── 方法一：Isolation Forest（无监督）────────────
features = ['order_amount', 'session_duration', 'click_count', 'ip_diversity']
X = df[features]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

iso = IsolationForest(contamination=0.02,  # 预期异常比例 2%
                       n_estimators=200, random_state=42)
df['anomaly_score'] = iso.fit_predict(X_scaled)
df['anomaly'] = df['anomaly_score'] == -1  # -1 = 异常

print(f"检测到异常: {df.anomaly.sum()} 条 ({df.anomaly.mean():.1%})")

# ── 方法二：Z-Score（统计法）────────────────────
df['zscore'] = (df['daily_revenue'] - df['daily_revenue'].mean()) / df['daily_revenue'].std()
df['is_outlier'] = df['zscore'].abs() > 3  # 3σ 之外

# ── 方法三：时序异常（Prophet）───────────────────
from prophet import Prophet

m = Prophet(interval_width=0.95, daily_seasonality=True)
m.fit(df.rename(columns={'date': 'ds', 'revenue': 'y'}))

future = m.make_future_dataframe(periods=0)
forecast = m.predict(future)

df['lower'] = forecast['yhat_lower']
df['upper'] = forecast['yhat_upper']
df['is_anomaly'] = (df.revenue < df.lower) | (df.revenue > df.upper)`,
      output: `=== IsolationForest 结果 ===
检测到异常: 234 条 (2.3%)

异常类型分析:
  高金额低时长: 89  ← 可能刷单
  深夜异常活跃: 67  ← 机器人
  IP突然多样化: 45  ← 代理
  金额突变:     33  ← 系统故障

=== Prophet 时序异常 ===
发现 12 个异常日:
  2024-01-15: 收入骤降 -67% (系统故障)
  2024-02-14: 收入暴涨 +234% (情人节活动)`,
    },
    forecast: {
      label: '预测分析',
      desc: '基于历史数据预测未来趋势，支撑业务规划',
      code: `from prophet import Prophet
import pandas as pd

# ── Prophet 时序预测 ────────────────────────────
# 优势：自动处理趋势、季节性（年/周/日）、节假日

df_prophet = df.rename(columns={'date': 'ds', 'revenue': 'y'})

model = Prophet(
    seasonality_mode='multiplicative',   # 乘法季节性（电商）
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,             # 日粒度不需要小时季节性
    changepoint_prior_scale=0.3,         # 趋势变化的灵敏度
)

# 添加节假日效应（中国节假日）
from prophet.make_holidays import make_holidays_df
holidays = make_holidays_df(year_list=[2024, 2025], country='CN')
model.add_country_holidays(country_name='CN')

model.fit(df_prophet)

# 预测未来90天
future = model.make_future_dataframe(periods=90)
forecast = model.predict(future)

# 分解：趋势 + 年季节性 + 周季节性 + 节假日
print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(5))

# 精度评估
from prophet.diagnostics import cross_validation, performance_metrics
df_cv = cross_validation(model, initial='365 days', period='30 days', horizon='90 days')
print(performance_metrics(df_cv)[['horizon', 'mape', 'rmse']])`,
      output: `预测结果（未来30天均值）:
  预测均值: ¥1,284,000
  置信区间: [¥985,000, ¥1,583,000]

模型精度:
  horizon  mape    rmse
  30 days  8.3%   102,400
  60 days  11.7%  148,200
  90 days  15.2%  195,600

趋势分解:
  整体趋势: +18% YoY ↑
  周效应:   周六+42%，周一-18%
  节假日:   春节-65%，618+180%`,
    },
  };
  const m = models[model];

  return (
    <div className="da-lesson">
      <div className="da-hero">
        <div className="da-hero-badge">🤖 模块七</div>
        <h1>分析遇上机器学习 — 预测与异常检测</h1>
        <p>数据分析的终极形态：用 ML 模型预测用户流失、自动发现异常、预测业务趋势。不需要深度学习，sklearn + Prophet 足够强大。</p>
      </div>

      <div className="da-goals">
        {[
          { icon: '🚨', title: '流失预测', desc: 'GBM 模型，提前30天识别高风险用户' },
          { icon: '🔍', title: '异常检测', desc: 'IsolationForest + Prophet 自动发现异常' },
          { icon: '📈', title: '时序预测', desc: 'Prophet 预测营收，含季节性和节假日' },
          { icon: '🎯', title: '特征工程', desc: '从原始日志提取有意义的预测特征' },
        ].map(g => <div className="da-goal" key={g.title}><div className="da-goal-icon">{g.icon}</div><div><h3>{g.title}</h3><p>{g.desc}</p></div></div>)}
      </div>

      <div className="da-tab-bar">
        {Object.entries(models).map(([k, v]) => (
          <button key={k} className={`da-tab${model === k ? ' active' : ''}`} onClick={() => setModel(k)}>{v.label}</button>
        ))}
      </div>
      <div className="da-tip" style={{ marginBottom: '1rem' }}>
        <strong>📋 场景</strong><p>{m.desc}</p>
      </div>
      <div className="da-code">
        <div className="da-code-header"><span className="da-code-lang">Python / sklearn / Prophet</span></div>
        <pre>{m.code}</pre>
      </div>
      <div className="da-output">
        <span className="out-label">▶ 输出结果</span>
        {m.output}
      </div>

      <div className="da-section-title">🛠️ 分析师的 ML 工具箱</div>
      <div className="da-cards">
        {[
          { icon: '📊', h: 'scikit-learn', d: '分类/回归/聚类全覆盖，API 极度统一，入门首选' },
          { icon: '📅', h: 'Prophet', d: 'Meta 开源时序预测，自动处理趋势+季节性+节假日' },
          { icon: '🌲', h: 'XGBoost / LightGBM', d: '最强表格数据模型，竞赛和工业界第一选择' },
          { icon: '🔍', h: 'SHAP', d: '模型可解释性：解释"为什么预测这个用户会流失"' },
          { icon: '🧪', h: 'Optuna', d: '超参数自动调优，比手动调参快 10x' },
          { icon: '📦', h: 'MLflow', d: '实验追踪、模型注册，让分析工作可复现' },
        ].map(c => <div className="da-card" key={c.h}><div className="da-card-icon">{c.icon}</div><h3>{c.h}</h3><p>{c.d}</p></div>)}
      </div>
    </div>
  );
}
