import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 数据漂移模拟器
function DriftMonitor() {
  const [running, setRunning] = useState(false);
  const [data, setData] = useState({ week1: [], week2: [], week4: [] });
  const timerRef = useRef(null);

  const generate = () => {
    // 模拟"年龄"特征分布漂移：训练集 vs 生产环境
    const normal = (mu, sigma) => {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const buckets = (mu, sigma) => {
      const b = Array(10).fill(0);
      for (let i = 0; i < 500; i++) {
        const v = Math.floor((normal(mu, sigma) - 20) / 6);
        if (v >= 0 && v < 10) b[v]++;
      }
      return b.map(v => v / 5);
    };
    setData({
      week1: buckets(35, 8),   // 训练期：均值35岁
      week2: buckets(38, 9),   // 2周后：略微漂移
      week4: buckets(45, 12),  // 4周后：严重漂移（用户群变老）
    });
  };

  useEffect(() => { generate(); }, []);

  const BAR_HEIGHT = 60;
  const BarChart = ({ values, color, label }) => {
    const max = Math.max(...values, 1);
    return (
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.62rem', color: '#6b7280', marginBottom: '0.3rem', fontWeight: 700 }}>{label}</div>
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: BAR_HEIGHT }}>
          {values.map((v, i) => (
            <div key={i} style={{ flex: 1, background: color, borderRadius: '2px 2px 0 0', opacity: 0.7 + (v/max)*0.3, transition: 'all 0.3s',
              height: `${Math.round((v / max) * BAR_HEIGHT)}px` }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: '#4b5563', marginTop: '0.2rem' }}>
          <span>20岁</span><span>50岁</span><span>80岁</span>
        </div>
      </div>
    );
  };

  const psi = 0.32; // 模拟PSI分数

  return (
    <div className="ml-interactive">
      <h3>📡 数据漂移监控（训练集 vs 生产环境"年龄"特征分布对比）
        <button className="ml-btn" style={{ fontSize: '0.72rem' }} onClick={generate}>🔄 刷新</button>
      </h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <BarChart values={data.week1} color="#10b981" label="训练集分布（基线）" />
        <BarChart values={data.week2} color="#f97316" label="生产 Week+2" />
        <BarChart values={data.week4} color="#ef4444" label="生产 Week+4 ⚠️" />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: psi > 0.2 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${psi > 0.2 ? '#ef444430' : '#10b98130'}` }}>
          <span style={{ fontSize: '0.68rem', color: '#6b7280' }}>PSI Score: </span>
          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, color: psi > 0.2 ? '#ef4444' : '#10b981' }}>{psi}</span>
          {psi > 0.2 && <span style={{ fontSize: '0.65rem', color: '#ef4444', marginLeft: '0.3rem' }}>⚠️ 显著漂移！建议重训练</span>}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>PSI {'<'} 0.1: 无漂移 | 0.1-0.2: 轻微 | {'>'} 0.2: 显著漂移</div>
      </div>
    </div>
  );
}

const MONITORING_CODE = `# 生产 ML 监控：数据漂移 + 模型衰减 + 告警

# ══════════════ 1. 数据漂移检测（PSI + KS Test）══════════════
import numpy as np
from scipy import stats
import pandas as pd

def psi(expected: np.ndarray, actual: np.ndarray, n_bins: int = 10) -> float:
    """
    Population Stability Index：衡量分布变化
    PSI < 0.1  → 无显著变化
    PSI 0.1-0.2 → 轻微变化
    PSI > 0.2  → 显著漂移！需重训练
    """
    breakpoints = np.percentile(expected, np.linspace(0, 100, n_bins + 1))
    exp_pcts = np.histogram(expected, bins=breakpoints)[0] / len(expected)
    act_pcts = np.histogram(actual,   bins=breakpoints)[0] / len(actual)
    
    exp_pcts = np.clip(exp_pcts, 1e-6, None)
    act_pcts = np.clip(act_pcts, 1e-6, None)
    
    return np.sum((act_pcts - exp_pcts) * np.log(act_pcts / exp_pcts))

def ks_test(train_data: np.ndarray, prod_data: np.ndarray) -> tuple[float, bool]:
    """KS 检验：非参数分布比较"""
    stat, p_value = stats.ks_2samp(train_data, prod_data)
    is_drifted = p_value < 0.05
    return stat, is_drifted

# ══════════════ 2. 模型性能监控（Evidently AI）══════════════
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, ClassificationPreset

# 生成监控报告（每天运行一次）
report = Report(metrics=[
    DataDriftPreset(drift_share=0.1),    # 超过10%特征漂移即告警
    ClassificationPreset(),               # 精确度/召回率/F1
])

report.run(
    reference_data=train_df,   # 训练集（基线）
    current_data=prod_df,      # 生产数据（T-1 天）
)
report.save_html("monitoring_report.html")

# ══════════════ 3. Prometheus + Grafana 监控 ══════════════
from prometheus_client import Gauge, Histogram, Counter, start_http_server

model_accuracy     = Gauge("ml_model_accuracy",       "模型当前准确率")
prediction_latency = Histogram("ml_prediction_latency", "推理延迟（秒）",
                               buckets=[.005, .01, .025, .05, .1, .25, .5, 1.0])
drift_score        = Gauge("ml_data_drift_psi",       "PSI漂移分数")
error_predictions  = Counter("ml_error_predictions",   "错误预测次数")

@app.post("/predict")
async def predict_with_monitoring(request: PredictRequest):
    with prediction_latency.time():   # 自动记录延迟
        result = model.predict(preprocess(request.data))
    
    if result.confidence < 0.6:
        error_predictions.inc()       # 低置信度计为可疑预测
    
    return result

# ══════════════ 4. 自动重训练触发机制 ══════════════
import schedule

def daily_health_check():
    today_data = load_production_data(days=1)
    
    psi_scores = {}
    for feature in MONITORED_FEATURES:
        score = psi(train_data[feature].values, today_data[feature].values)
        psi_scores[feature] = score
    
    max_psi = max(psi_scores.values())
    drift_score.set(max_psi)
    
    if max_psi > 0.2:
        # 触发重训练（发 Slack 告警 + 启动 CI/CD 流水线）
        notify_slack(f"⚠️ 数据漂移告警！PSI={max_psi:.3f}，最严重特征：{max(psi_scores, key=psi_scores.get)}")
        trigger_retraining_pipeline()   # 调用 GitHub Actions / Argo Workflows

schedule.every().day.at("06:00").do(daily_health_check)`;

export default function LessonMonitoring() {
  const navigate = useNavigate();
  return (
    <div className="lesson-ml">
      <div className="ml-badge">📡 module_08 — 生产监控</div>
      <div className="ml-hero">
        <h1>生产监控：数据漂移 / 模型衰减 / 自动重训练触发</h1>
        <p>模型上线不是终点。生产环境的数据分布会随时间变化（数据漂移），导致模型精度下降（模型衰减）。<strong>PSI 分数</strong>检测特征分布变化，<strong>Evidently AI</strong> 生成监控报告，<strong>自动重训练管道</strong>让模型始终保持最优状态。</p>
      </div>
      <DriftMonitor />
      <div className="ml-section">
        <h2 className="ml-section-title">🔧 数据漂移 + 自动重训练完整代码</h2>
        <div className="ml-code-wrap">
          <div className="ml-code-head"><div className="ml-code-dot" style={{ background: '#10b981' }}/><div className="ml-code-dot" style={{ background: '#f97316' }}/><div className="ml-code-dot" style={{ background: '#ef4444' }}/><span style={{ color: '#34d399', marginLeft: '0.5rem' }}>📡 production_monitoring.py</span></div>
          <div className="ml-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{MONITORING_CODE}</div>
        </div>
      </div>
      {/* 结课卡 */}
      <div className="ml-section">
        <div className="ml-card" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.04),rgba(249,115,22,0.03),rgba(251,191,36,0.02))', border: '1px solid rgba(16,185,129,0.15)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: '#34d399', fontSize: '1.1rem', marginBottom: '1rem' }}>恭喜完成 ML Engineering 全课程！</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.4rem', textAlign: 'left', marginBottom: '1rem' }}>
            {['✅ 神经网络可视化（节点动画+权重颜色）+线性代数/概率论代码',
              '✅ 训练曲线实时模拟器（LR调节+OOM+过拟合检测）',
              '✅ 卷积可视化（Stride/Padding/Kernel调节+尺寸公式）',
              '✅ Self-Attention热力图（点击Query Token实时更新权重）',
              '✅ 6种微调方法对比表（QLoRA单卡微调70B）',
              '✅ MLflow实验追踪器（点击行查看最佳实验）',
              '✅ 4种服务化方案选型对比+FastAPI/TorchServe/Triton代码',
              '✅ 数据漂移PSI监控实时图+自动重训练触发代码',
            ].map(s => <div key={s} style={{ fontSize: '0.76rem', color: '#6b7280' }}>{s}</div>)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f97316' }}>
            📚 延伸阅读：PyTorch官方文档 · HuggingFace · Papers With Code · MLflow Docs · Evidently AI
          </div>
        </div>
      </div>
      <div className="ml-nav">
        <button className="ml-btn" onClick={() => navigate('/course/ml-engineering/lesson/serving')}>← 上一模块</button>
        <button className="ml-btn primary" onClick={() => navigate('/course/ml-engineering')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
