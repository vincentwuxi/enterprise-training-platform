import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

// 训练曲线实时模拟器
function TrainingSimulator() {
  const [running, setRunning] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [trainLoss, setTrainLoss] = useState([]);
  const [valLoss, setValLoss] = useState([]);
  const [lr, setLr] = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);
  const timerRef = useRef(null);
  const MAX_EPOCHS = 50;

  const startTraining = () => {
    setEpoch(0); setTrainLoss([]); setValLoss([]); setRunning(true);
  };
  const stopTraining = () => { clearInterval(timerRef.current); setRunning(false); };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setEpoch(e => {
        if (e >= MAX_EPOCHS) { clearInterval(timerRef.current); setRunning(false); return e; }
        const base = Math.exp(-lr * 500 * (e + 1) / MAX_EPOCHS);
        const tl = base * 2.5 + (Math.random() - 0.5) * 0.08;
        const overfit = e > 35 ? (e - 35) * 0.005 : 0;
        const vl = base * 2.8 + overfit + (Math.random() - 0.5) * 0.1;
        setTrainLoss(arr => [...arr, +tl.toFixed(3)]);
        setValLoss(arr => [...arr, +vl.toFixed(3)]);
        return e + 1;
      });
    }, 120);
    return () => clearInterval(timerRef.current);
  }, [running, lr]);

  const lastTL = trainLoss[trainLoss.length - 1];
  const lastVL = valLoss[valLoss.length - 1];
  const overfitting = lastTL && lastVL && lastVL > lastTL * 1.15;

  // SVG sparkline
  const sparkline = (data, color) => {
    if (data.length < 2) return null;
    const max = Math.max(...data), min = Math.min(...data);
    const W = 260, H = 60;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / (max - min + 0.001)) * H;
      return `${x},${y}`;
    }).join(' ');
    return <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
  };

  return (
    <div className="ml-interactive">
      <h3>📈 训练曲线实时模拟器（调整超参数观察效果）</h3>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 200px' }}>
          {[
            ['Learning Rate', lr, setLr, 0.0001, 0.01, 0.0001, v => v.toExponential(2)],
            ['Batch Size', batchSize, setBatchSize, 8, 256, 8, v => v],
          ].map(([label, val, setter, min, max, step, fmt]) => (
            <div key={label} style={{ marginBottom: '0.625rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.2rem' }}>
                <span>{label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#34d399', fontWeight: 700 }}>{fmt(val)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val}
                onChange={e => setter(label === 'Batch Size' ? Number(e.target.value) : parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }} disabled={running} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button className="ml-btn" style={{ flex: 1, fontSize: '0.78rem', justifyContent: 'center' }}
              onClick={running ? stopTraining : startTraining}>
              {running ? '⏹ 停止' : '▶ 开始训练'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <svg width="100%" height={70} viewBox={`0 0 260 70`} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '4px' }}>
            {sparkline(trainLoss, '#10b981')}
            {sparkline(valLoss, '#f97316')}
          </svg>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.65rem' }}>
            <span style={{ color: '#10b981' }}>● Train Loss: {lastTL ?? '—'}</span>
            <span style={{ color: '#f97316' }}>● Val Loss: {lastVL ?? '—'}</span>
            <span style={{ color: '#64748b' }}>Epoch: {epoch}/{MAX_EPOCHS}</span>
          </div>
          {overfitting && <div style={{ marginTop: '0.3rem', fontSize: '0.68rem', color: '#ef4444', fontWeight: 700 }}>⚠️ 检测到过拟合！Val Loss {'>'} Train Loss × 1.15，建议加 Dropout 或 L2 正则</div>}
          {!running && epoch === MAX_EPOCHS && !overfitting && <div style={{ marginTop: '0.3rem', fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>✅ 训练完成，模型收敛良好</div>}
        </div>
      </div>
    </div>
  );
}

const PYTORCH_CODE = `# PyTorch 从零实现：Tensor → 自动微分 → 完整训练循环

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# ══════════════ 1. Tensor 基础操作 ══════════════
# Tensor = NumPy array + GPU 支持 + 自动微分
x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])   # 2×2 矩阵
print(x.shape, x.dtype)                         # → torch.Size([2, 2]) torch.float32

# GPU 加速（CUDA）
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
x = x.to(device)   # 将数据移到 GPU

# 常用操作
a = torch.randn(3, 4)           # 正态分布随机初始化
b = torch.zeros(4, 5)           # 全零
c = a @ b                       # 矩阵乘法：[3,4] × [4,5] → [3,5]
d = torch.cat([a, a], dim=0)    # 行拼接 → [6, 4]
e = a.reshape(2, 6)             # 变形（不复制数据）
f = a.T                         # 转置

# ══════════════ 2. 自动微分（autograd）══════════════
x = torch.tensor(2.0, requires_grad=True)   # 声明需要计算梯度
y = x ** 3 + 2 * x                          # y = x³ + 2x

y.backward()   # 反向传播！自动计算 dy/dx
print(x.grad)  # → tensor(14.)   (3x² + 2 at x=2 = 14)

# 实际训练中的梯度管理
optimizer.zero_grad()   # ⚠️ 清空累积梯度（每个 batch 前必须调用！）
loss.backward()         # 计算所有参数的梯度
optimizer.step()        # 按梯度更新权重

# ══════════════ 3. 定义模型（nn.Module）══════════════
class BinaryClassifier(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int = 128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),   # 批归一化（稳定训练）
            nn.ReLU(),
            nn.Dropout(0.3),              # Dropout（防过拟合）
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid(),
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x).squeeze()

# ══════════════ 4. 完整训练循环 ══════════════
def train(model, train_loader, val_loader, epochs=20):
    criterion = nn.BCELoss()            # 二分类：Binary Cross-Entropy
    optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        # ── 训练阶段 ──
        model.train()
        total_loss = 0
        for X_batch, y_batch in train_loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            
            optimizer.zero_grad()              # 1. 清空梯度
            y_pred = model(X_batch)            # 2. 前向传播
            loss = criterion(y_pred, y_batch)  # 3. 计算损失
            loss.backward()                    # 4. 反向传播
            
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)  # 梯度裁剪
            optimizer.step()                   # 5. 更新权重
            total_loss += loss.item()
        
        # ── 验证阶段 ──
        model.eval()
        val_loss = 0
        with torch.no_grad():     # ⚠️ 推理时必须关闭梯度计算！省内存50%
            for X_val, y_val in val_loader:
                pred = model(X_val.to(device))
                val_loss += criterion(pred, y_val.to(device)).item()
        
        scheduler.step()   # 调整学习率
        
        # 早停：5个epoch没有改善就停止
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), 'best_model.pt')  # 保存最佳模型
        
        if epoch % 5 == 0:
            print(f"Epoch {epoch:3d}: train={total_loss/len(train_loader):.4f}, val={val_loss/len(val_loader):.4f}")

# ══════════════ 5. 模型保存 & 加载 ══════════════
torch.save(model.state_dict(), 'model.pt')         # 只保存权重（推荐）
model.load_state_dict(torch.load('model.pt'))       # 加载权重

model.eval()   # ⚠️ 推理前必须设为 eval 模式（关闭 Dropout/BatchNorm）
with torch.no_grad():
    prediction = model(test_input)`;

export default function LessonPyTorch() {
  const navigate = useNavigate();

  return (
    <div className="lesson-ml">
      <div className="ml-badge torch">🔥 module_02 — PyTorch 核心</div>
      <div className="ml-hero">
        <h1>PyTorch：Tensor / 自动微分 / 训练循环 / 最佳实践</h1>
        <p>PyTorch 是目前学术界 + 工业界最主流的深度学习框架。<strong>Tensor</strong> = NumPy + GPU + 自动微分，<strong>autograd</strong> 自动计算任意函数的导数，<strong>nn.Module</strong> 是搭建所有神经网络的积木。</p>
      </div>

      <TrainingSimulator />

      <div className="ml-section">
        <h2 className="ml-section-title">🔥 PyTorch 完整代码（Tensor → 训练循环）</h2>
        <div className="ml-code-wrap">
          <div className="ml-code-head"><div className="ml-code-dot" style={{ background: '#ee4c2c' }}/><div className="ml-code-dot" style={{ background: '#f97316' }}/><div className="ml-code-dot" style={{ background: '#10b981' }}/><span style={{ color: '#f87171', marginLeft: '0.5rem' }}>🔥 pytorch_training.py</span></div>
          <div className="ml-code" style={{ maxHeight: 460, overflowY: 'auto' }}>{PYTORCH_CODE}</div>
        </div>
      </div>

      <div className="ml-section">
        <h2 className="ml-section-title">⚡ 常见陷阱速查</h2>
        <div className="ml-grid-2">
          {[
            ['❌ 忘记 zero_grad()', '梯度会累积，导致错误更新\n✅ 每个 batch 前：optimizer.zero_grad()', '#ef4444'],
            ['❌ 推理不加 no_grad()', '浪费GPU内存（保留计算图）\n✅ model.eval() + with torch.no_grad()', '#f97316'],
            ['❌ CPU-GPU 数据混用', 'RuntimeError: Expected all tensors on same device\n✅ x = x.to(device)', '#8b5cf6'],
            ['❌ 忘记 model.eval()', 'test时Dropout仍随机丢弃神经元\n✅ 训练=model.train()，推理=model.eval()', '#3b82f6'],
          ].map(([title, content, color]) => (
            <div key={title} className="ml-card" style={{ borderColor: `${color}22` }}>
              <div style={{ fontWeight: 800, color, fontSize: '0.82rem', marginBottom: '0.4rem' }}>{title}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', whiteSpace: 'pre-line', lineHeight: 1.7, fontFamily: 'JetBrains Mono' }}>{content}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-nav">
        <button className="ml-btn" onClick={() => navigate('/course/ml-engineering/lesson/ml-foundation')}>← 上一模块</button>
        <button className="ml-btn primary" onClick={() => navigate('/course/ml-engineering/lesson/cnn')}>下一模块：CNN 视觉网络 →</button>
      </div>
    </div>
  );
}
