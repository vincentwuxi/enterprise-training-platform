import { useState } from 'react';
import './LessonCommon.css';

export default function LessonTraining() {
  const [tab, setTab] = useState('deepspeed');

  const codes = {
    deepspeed: `# ━━━━ DeepSpeed ZeRO 多 GPU 训练 ━━━━
# ZeRO（Zero Redundancy Optimizer）三级优化：
# ZeRO-1：分片优化器状态（4x 显存节省）
# ZeRO-2：+ 分片梯度（8x 显存节省）
# ZeRO-3：+ 分片模型参数（可训练 1T+ 参数！）

# ds_config.json（DeepSpeed 配置）
{
  "zero_optimization": {
    "stage": 2,                              # ZeRO-2（推荐，速度/显存平衡最佳）
    "allgather_partitions": true,
    "allgather_bucket_size": 2e8,
    "reduce_scatter": true,
    "reduce_bucket_size": 2e8,
    "overlap_comm": true,
    "contiguous_gradients": true
  },
  "fp16": {
    "enabled": false                         # 使用 bf16 而非 fp16
  },
  "bf16": {
    "enabled": true                          # 推荐 bf16（稳定性 > fp16）
  },
  "gradient_accumulation_steps": 8,
  "gradient_clipping": 1.0,
  "train_batch_size": "auto",
  "train_micro_batch_size_per_gpu": "auto",
  "optimizer": {
    "type": "AdamW",
    "params": {
      "lr": "auto",
      "betas": [0.9, 0.999],
      "eps": 1e-8,
      "weight_decay": 0.01
    }
  },
  "scheduler": {
    "type": "WarmupDecayLR",
    "params": {
      "warmup_min_lr": 0,
      "warmup_max_lr": "auto",
      "warmup_num_steps": "auto"
    }
  }
}

# 启动训练（4 GPU）
torchrun --nproc_per_node=4 train.py \
  --model_name meta-llama/Meta-Llama-3-8B-Instruct \
  --deepspeed ds_config.json \
  --output_dir ./output

# 或使用 Accelerate
accelerate launch --config_file accelerate_config.yaml train.py`,

    hyperparams: `# ━━━━ 关键超参数调优指南 ━━━━

# ━━━━ 学习率（最重要的超参数）━━━━
# 全量微调：1e-5 到 5e-5
# LoRA：1e-4 到 3e-4
# QLoRA：2e-4（更高 LR 因为量化误差）
# 推荐：从 2e-4 开始，若 loss 不降则降低一半

# ━━━━ 学习率调度器 ━━━━
# cosine（推荐）：平滑衰减到 0，最后阶段效果好
# linear：简单线性衰减
# constant_with_warmup：warmup 后保持恒定

# ━━━━ Batch Size（显存权衡）━━━━
# 原则：越大越稳定（梯度噪声小），但显存有限
# 解决方案：梯度累积
per_device_batch_size = 2
gradient_accumulation_steps = 8
# 等效 global_batch_size = 2 × 8 × num_gpus = 16 per GPU

# ━━━━ 完整训练配置（生产推荐）━━━━
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="./output",
    
    # 轮次和步骤
    num_train_epochs=3,              # 通常 2-5 轮
    # max_steps=1000,                # 或者用步数控制（数据量大时）
    
    # Batch 配置
    per_device_train_batch_size=2,
    per_device_eval_batch_size=4,
    gradient_accumulation_steps=8,
    
    # 学习率
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,               # 3% 步数用于 warmup
    
    # 精度
    bf16=True,
    
    # 优化器
    optim="paged_adamw_32bit",       # QLoRA 用分页优化器
    weight_decay=0.001,
    max_grad_norm=0.3,               # 梯度裁剪（防爆炸）
    
    # 评估
    evaluation_strategy="steps",
    eval_steps=50,
    save_strategy="steps",
    save_steps=100,
    save_total_limit=3,
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    
    # 日志
    logging_steps=10,
    report_to=["wandb"],             # 用 wandb 监控训练曲线
    run_name=f"qlora-llama3-8b-{datetime.now().strftime('%Y%m%d')}",
    
    # 其他
    gradient_checkpointing=True,     # 节省显存（慢 ~30%）
    group_by_length=True,            # 相近长度分批（减少 padding）
    dataloader_num_workers=4,
)`,

    monitor: `# ━━━━ 训练监控与早停 ━━━━

# ━━━━ 1. WandB 训练曲线监控（必备）━━━━
import wandb
from transformers import TrainerCallback

class LossMonitorCallback(TrainerCallback):
    """监控训练关键指标，自动截图异常"""
    
    def on_log(self, args, state, control, logs=None, **kwargs):
        if logs:
            # 记录梯度范数（检测梯度爆炸）
            if "grad_norm" in logs and logs["grad_norm"] > 10:
                print(f"⚠️ 梯度爆炸：{logs['grad_norm']:.2f}（建议降低 LR）")
            
            # 记录 loss 趋势（检测过拟合）
            train_loss = logs.get("train_loss", 0)
            eval_loss = logs.get("eval_loss", 0)
            if eval_loss > 0 and eval_loss > train_loss * 1.3:
                print(f"⚠️ 可能过拟合：train={train_loss:.3f}, eval={eval_loss:.3f}")
    
    def on_epoch_end(self, args, state, control, **kwargs):
        # 每 epoch 输出摘要
        current_loss = state.log_history[-1].get("eval_loss", "N/A")
        print(f"Epoch {state.epoch:.0f} 完成，eval_loss = {current_loss}")

# ━━━━ 2. 关键监控指标 ━━━━
# train_loss：持续下降 ✅ / 不降或上升 ❌ → 检查 LR/数据
# eval_loss：与 train_loss 同步 ✅ / eval 远高于 train ❌ → 过拟合
# grad_norm：< 1.0 极好 / 1-10 正常 / > 10 梯度爆炸 ❌
# learning_rate：余弦衰减曲线正常下降
# tokens_per_second：评估训练速度是否符合预期

# ━━━━ 3. 显存使用监控 ━━━━
import subprocess

def get_gpu_memory():
    result = subprocess.run(
        ["nvidia-smi", "--query-gpu=memory.used,memory.free", "--format=csv,noheader,nounits"],
        capture_output=True, text=True
    )
    return result.stdout.strip()

# ━━━━ 4. 何时停止训练？━━━━
# 标准：eval_loss 连续 3 次不下降（Early Stopping）
from transformers import EarlyStoppingCallback

trainer = SFTTrainer(
    ...
    callbacks=[
        EarlyStoppingCallback(early_stopping_patience=3),  # 连续3次无改善停止
        LossMonitorCallback(),
    ],
)

# ━━━━ 典型 Loss 曲线解读 ━━━━
# 健康曲线：train_loss 从 2.5 → 1.2，eval_loss 类似趋势
# 过拟合：train_loss 到 0.5，eval_loss 反而升到 1.8
# LR 太高：loss 剧烈震荡，不收敛
# LR 太低：loss 下降极慢，需要更多轮次`,
  };

  return (
    <div className="ft-lesson">
      <div className="ft-hero">
        <div className="ft-badge">// MODULE 05 · TRAINING ENGINEERING</div>
        <h1>训练工程实战</h1>
        <p>从单 GPU 到多 GPU 集群，从超参数调优到训练监控——<strong>DeepSpeed ZeRO 让百亿参数模型可以在多机多卡高效训练</strong>，而 WandB + 早停机制让训练过程透明可控。</p>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">⚙️ 三大训练工程主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[['deepspeed', '🚀 DeepSpeed ZeRO 多 GPU'], ['hyperparams', '🎛️ 超参数调优指南'], ['monitor', '📊 训练监控与早停']].map(([k, l]) => (
            <button key={k} className={`ft-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ft-code-wrap">
          <div className="ft-code-head">
            <div className="ft-code-dot" style={{ background: '#ef4444' }} /><div className="ft-code-dot" style={{ background: '#f59e0b' }} /><div className="ft-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.py</span>
          </div>
          <div className="ft-code">{codes[tab]}</div>
        </div>
      </div>

      <div className="ft-section">
        <div className="ft-section-title">📊 ZeRO 各级别显存节省对比</div>
        <div className="ft-card" style={{ overflowX: 'auto' }}>
          <table className="ft-table">
            <thead><tr><th>ZeRO 级别</th><th>分片内容</th><th>显存节省</th><th>通信量</th><th>推荐场景</th></tr></thead>
            <tbody>
              {[
                ['无 ZeRO', '不分片', '1x（基准）', '最低', '单 GPU / 小模型'],
                ['ZeRO-1', '优化器状态', '~4x', '低', '多 GPU，模型不太大'],
                ['ZeRO-2', '优化器 + 梯度', '~8x', '中', '推荐！大多数场景最优'],
                ['ZeRO-3', '优化器 + 梯度 + 参数', '~64x+', '高', '超大模型（70B+）'],
                ['ZeRO-3 + CPU Offload', '全量 CPU 卸载', '极限', '极高（慢）', 'GPU 严重不足时'],
              ].map(([level, content, saving, comm, scene], i) => (
                <tr key={i}>
                  <td><span className={`ft-tag ${i >= 2 ? 'rose' : 'indigo'}`}>{level}</span></td>
                  <td style={{ color: 'var(--ft-muted)', fontSize: '0.83rem' }}>{content}</td>
                  <td style={{ color: i >= 2 ? 'var(--ft-pink)' : 'var(--ft-muted)', fontWeight: i >= 2 ? 700 : 400, fontSize: '0.84rem' }}>{saving}</td>
                  <td style={{ color: 'var(--ft-muted)', fontSize: '0.83rem' }}>{comm}</td>
                  <td style={{ color: 'var(--ft-muted)', fontSize: '0.83rem' }}>{scene}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
