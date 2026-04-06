import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 实验追踪对比器
function ExperimentTracker() {
  const RUNS = [
    { id: 'run_001', model: 'resnet50', lr: 0.001, batch: 32, aug: '基础', acc: 87.3, status: 'done', color: '#10b981' },
    { id: 'run_002', model: 'resnet50', lr: 0.0001, batch: 32, aug: '基础', acc: 85.1, status: 'done', color: '#6b7280' },
    { id: 'run_003', model: 'efficientnet', lr: 0.001, batch: 64, aug: '高级', acc: 91.7, status: 'done', color: '#f97316' },
    { id: 'run_004', model: 'efficientnet', lr: 0.001, batch: 64, aug: '高级+Cutmix', acc: 93.2, status: 'best', color: '#fbbf24' },
    { id: 'run_005', model: 'vit-base', lr: 0.0001, batch: 128, aug: '高级+Cutmix', acc: null, status: 'running', color: '#3b82f6' },
  ];
  const [selected, setSelected] = useState('run_004');

  return (
    <div className="ml-interactive">
      <h3>🔬 MLflow 实验追踪器（点击查看实验详情）</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="ml-table" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th>Run ID</th><th>Model</th><th>LR</th><th>Batch</th><th>Augmentation</th><th>Val Acc</th><th>状态</th>
            </tr>
          </thead>
          <tbody>
            {RUNS.map(r => (
              <tr key={r.id} onClick={() => setSelected(r.id)}
                style={{ cursor: 'pointer', background: selected === r.id ? 'rgba(16,185,129,0.04)' : 'transparent' }}>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: r.color }}>{r.id}</td>
                <td style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{r.model}</td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#6b7280' }}>{r.lr}</td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#6b7280' }}>{r.batch}</td>
                <td style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{r.aug}</td>
                <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, color: r.status === 'best' ? '#fbbf24' : r.acc ? '#34d399' : '#3b82f6' }}>
                  {r.acc ? `${r.acc}%` : '⏳运行中'}
                </td>
                <td>
                  <span className="ml-tag" style={{ background: r.status === 'best' ? 'rgba(251,191,36,0.1)' : r.status === 'running' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.08)', color: r.status === 'best' ? '#fbbf24' : r.status === 'running' ? '#3b82f6' : '#34d399', fontSize: '0.62rem' }}>
                    {r.status === 'best' ? '🏆 最佳' : r.status === 'running' ? '▶ 运行中' : '✅ 完成'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected === 'run_004' && (
        <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px', fontSize: '0.72rem', color: '#d97706' }}>
          🏆 <strong>run_004</strong>：EfficientNet + 高级增强 + Cutmix，验证集精度 <strong>93.2%</strong>，是当前最优组合。建议以此为基准继续调优学习率衰减策略。
        </div>
      )}
    </div>
  );
}

const MLOPS_CODE = `# MLOps 全链路：MLflow + DVC + W&B + 自动化流水线

# ══════════════ 1. MLflow：实验追踪 ══════════════
import mlflow
import mlflow.pytorch

mlflow.set_tracking_uri("http://mlflow-server:5000")  # 团队共享的追踪服务器
mlflow.set_experiment("image-classification-v2")

with mlflow.start_run(run_name="efficientnet-cutmix"):
    # 记录超参数
    mlflow.log_params({
        "model": "efficientnet_b3",
        "learning_rate": 0.001,
        "batch_size": 64,
        "augmentation": "cutmix",
        "epochs": 50,
    })
    
    for epoch in range(50):
        train_loss, val_acc = train_one_epoch(model, loader)
        
        # 记录指标（每个 epoch）
        mlflow.log_metrics({
            "train_loss": train_loss,
            "val_accuracy": val_acc,
        }, step=epoch)
    
    # 记录模型（带签名）
    signature = mlflow.models.infer_signature(sample_input, sample_output)
    mlflow.pytorch.log_model(model, "model", signature=signature)
    
    # 记录任意文件（混淆矩阵、ROC曲线）
    mlflow.log_artifact("confusion_matrix.png")
    mlflow.log_artifact("roc_curve.png")

# 加载最佳模型
best_run = mlflow.search_runs(order_by=["metrics.val_accuracy DESC"]).iloc[0]
best_model = mlflow.pytorch.load_model(f"runs:/{best_run.run_id}/model")

# ══════════════ 2. DVC：数据版本控制 ══════════════
# 类似 Git，但用于大型数据集和模型文件

# 初始化 DVC 仓库
# $ dvc init
# $ dvc remote add -d s3-storage s3://my-bucket/dvc-store

# 追踪数据集（不直接存到 git，只存指针）
# $ dvc add data/train_images/
# $ git add data/train_images.dvc .gitignore
# $ git commit -m "add training dataset v1.0"
# $ dvc push   # 实际数据上传到 S3

# 流水线定义（dvc.yaml）
# stages:
#   preprocess:
#     cmd: python preprocess.py
#     deps: [data/raw]
#     outs: [data/processed]
#   train:
#     cmd: python train.py
#     deps: [data/processed, src/model.py]
#     params: [params.yaml:learning_rate, params.yaml:batch_size]
#     outs: [models/best_model.pt]
#     metrics: [metrics/test_metrics.json]
# $ dvc repro    # 只重新运行受影响的阶段！

# ══════════════ 3. Weights & Biases（W&B）══════════════
import wandb

wandb.init(
    project="image-classification",
    name="efficientnet-cutmix",
    config={"lr": 0.001, "batch": 64, "model": "efficientnet_b3"},
)

for epoch in range(50):
    train_loss, val_acc = train_one_epoch(model, loader)
    
    wandb.log({
        "epoch": epoch,
        "train/loss": train_loss,
        "val/accuracy": val_acc,
        "val/confusion_matrix": wandb.plot.confusion_matrix(
            probs=None, y_true=y_true, preds=y_pred, class_names=classes
        ),
    })

wandb.finish()

# ══════════════ 4. GitHub Actions 自动化训练 ══════════════
# .github/workflows/train.yml
# on: [push, pull_request]
# jobs:
#   test:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v3
#       - name: Run unit tests
#         run: pytest tests/ --cov=src
#       - name: Lint
#         run: ruff check src/
#   train:
#     needs: test
#     runs-on: [self-hosted, gpu]   # 自建 GPU 机器
#     if: github.ref == 'refs/heads/main'
#     steps:
#       - name: Train model
#         run: python train.py --config configs/prod.yaml`;

export default function LessonMLOps() {
  const navigate = useNavigate();
  return (
    <div className="lesson-ml">
      <div className="ml-badge amber">🔄 module_06 — MLOps</div>
      <div className="ml-hero">
        <h1>MLOps：MLflow 实验追踪 / DVC 数据版本 / W&B 可视化</h1>
        <p>ML 工程师 vs 数据科学家的核心差别：能把模型<strong>可重复、可追踪、自动化</strong>地部署到生产。MLflow 追踪每次实验的超参数+指标，DVC 管理 GB 级数据集版本，W&B 提供实时可视化大屏。</p>
      </div>
      <ExperimentTracker />
      <div className="ml-section">
        <h2 className="ml-section-title">🔧 MLOps 完整工具链代码</h2>
        <div className="ml-code-wrap">
          <div className="ml-code-head"><div className="ml-code-dot" style={{ background: '#fbbf24' }}/><div className="ml-code-dot" style={{ background: '#10b981' }}/><div className="ml-code-dot" style={{ background: '#3b82f6' }}/><span style={{ color: '#fbbf24', marginLeft: '0.5rem' }}>🔄 mlops_pipeline.py</span></div>
          <div className="ml-code" style={{ maxHeight: 440, overflowY: 'auto' }}>{MLOPS_CODE}</div>
        </div>
      </div>
      <div className="ml-nav">
        <button className="ml-btn" onClick={() => navigate('/course/ml-engineering/lesson/finetuning')}>← 上一模块</button>
        <button className="ml-btn primary" onClick={() => navigate('/course/ml-engineering/lesson/serving')}>下一模块：模型服务化 →</button>
      </div>
    </div>
  );
}
