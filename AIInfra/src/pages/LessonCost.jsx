import { useState } from 'react';
import './LessonCommon.css';

const CODE_SPOT = `# ━━━━ Spot Instance：省 60-90% 的 GPU 成本 ━━━━

# ━━━━ 云厂商 GPU 价格对比（A100 80GB / 小时）━━━━
# ┌──────────────┬──────────┬──────────┬──────────┐
# │ 云厂商       │ 按需     │ 预留 1 年 │ Spot     │
# ├──────────────┼──────────┼──────────┼──────────┤
# │ AWS (p4d)    │ $32.77/h │ $19.2/h  │ ~$10/h   │
# │ GCP (a2)     │ $29.40/h │ $18.0/h  │ ~$9/h    │
# │ Azure (ND)   │ $30.00/h │ $17.5/h  │ ~$9/h    │
# │ Lambda Labs  │ $1.99/h  │ -        │ -        │
# │ RunPod       │ $2.49/h  │ -        │ -        │
# │ Vast.ai      │ ~$1.5/h  │ -        │ -        │
# └──────────────┴──────────┴──────────┴──────────┘

# ━━━━ Spot Instance 训练策略 ━━━━
# 问题：Spot 实例随时可能被回收（2 分钟警告）
# 解决：Checkpoint + 自动恢复

# 1. 高频 Checkpoint（每 N 步保存到 S3/GCS）
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="s3://my-bucket/checkpoints",  # 直接保存到 S3
    save_strategy="steps",
    save_steps=100,              # 每 100 步保存
    save_total_limit=3,          # 只保留最近 3 个
    resume_from_checkpoint=True, # 自动从最新 checkpoint 恢复
)

# 2. Spot 中断检测（AWS）
import requests, signal

def check_spot_interruption():
    try:
        r = requests.get("http://169.254.169.254/latest/meta-data/spot/instance-action",
                         timeout=1)
        if r.status_code == 200:
            print("⚠️ Spot 中断警告！保存 checkpoint...")
            save_checkpoint()
            sys.exit(0)
    except requests.exceptions.RequestException:
        pass  # 无中断

# 3. 自动重启（配合 Kubernetes）
# Job 配置 restartPolicy: OnFailure + 从 checkpoint 恢复`;

const CODE_MIG = `# ━━━━ MIG（Multi-Instance GPU）多租户切分 ━━━━
# A100/H100 支持将一张 GPU 切分为最多 7 个独立实例
# 每个实例有独立的显存、计算资源和 L2 Cache

# ━━━━ MIG 配置 ━━━━
# 启用 MIG
sudo nvidia-smi -i 0 -mig 1

# 查看支持的切分模式（A100 80GB）
nvidia-smi mig -i 0 -lgip

# 常用切分方案：
# ┌──────────┬──────────┬──────────┬───────────────────┐
# │ Profile  │ 显存     │ SM 数    │ 适用场景          │
# ├──────────┼──────────┼──────────┼───────────────────┤
# │ 1g.10gb  │ 10 GB    │ 14 SM    │ 小模型推理        │
# │ 2g.20gb  │ 20 GB    │ 28 SM    │ 7B 模型推理       │
# │ 3g.40gb  │ 40 GB    │ 42 SM    │ 13B 模型推理      │
# │ 4g.40gb  │ 40 GB    │ 56 SM    │ 需要更多计算      │
# │ 7g.80gb  │ 80 GB    │ 98 SM    │ 单用户独占        │
# └──────────┴──────────┴──────────┴───────────────────┘

# 创建 MIG 实例
sudo nvidia-smi mig -i 0 -cgi 2g.20gb,2g.20gb,3g.40gb -C
# → 一张 A100 变成 3 个独立 GPU：2×20GB + 1×40GB

# Kubernetes 中使用 MIG
# 需要 nvidia-device-plugin 配合
# Pod 申请 MIG 切片：
# resources:
#   limits:
#     nvidia.com/mig-2g.20gb: 1    # 只申请一个 20GB 切片

# MIG 优势：
# 1. 推理服务：不同模型跑在不同切片上
# 2. 多租户：团队间硬隔离（安全）
# 3. 利用率：小模型不浪费大 GPU`;

const CODE_ROI = `# ━━━━ AI 基础设施 ROI 计算 ━━━━

# ━━━━ 成本构成分析 ━━━━
# AI 项目总成本 = 训练成本 + 推理成本 + 人力成本 + 存储成本
#
# 关键洞察：推理成本 >> 训练成本（长期）
# 训练：一次性（几天到几周）
# 推理：持续运行（7×24小时）
# 通常推理成本占总 AI 成本的 80-90%

# ━━━━ 推理成本计算 ━━━━
class InferenceCostCalculator:
    def __init__(self):
        self.gpu_cost_per_hour = 2.49     # RunPod A100 80GB
        self.tokens_per_second = 200      # vLLM + AWQ INT4
        self.avg_request_tokens = 500     # 平均请求 500 token

    def monthly_cost(self, qps: float) -> dict:
        """计算月度推理成本"""
        # 每秒需要处理的 token 数
        tokens_per_second_needed = qps * self.avg_request_tokens

        # 需要的 GPU 数量
        gpus_needed = tokens_per_second_needed / self.tokens_per_second
        gpus_needed = max(1, int(gpus_needed + 0.99))  # 向上取整

        # 月度成本
        hours_per_month = 24 * 30
        monthly = gpus_needed * self.gpu_cost_per_hour * hours_per_month

        return {
            "qps": qps,
            "gpus_needed": gpus_needed,
            "monthly_cost": "$" + f"{monthly:,.0f}",
            "cost_per_1k_requests": "$" + f"{monthly / (qps * 3600 * 24 * 30 / 1000):.4f}",
        }

calc = InferenceCostCalculator()
# 1 QPS（小应用）→ 1 GPU → $1,793/月
# 10 QPS（中等）→ 5 GPU → $8,964/月
# 100 QPS（大流量）→ 50 GPU → $89,640/月

# ━━━━ 成本优化策略矩阵 ━━━━
# ┌──────────────────┬─────────┬──────────────────────┐
# │ 策略             │ 节省    │ 实现方式             │
# ├──────────────────┼─────────┼──────────────────────┤
# │ INT4 量化        │ 60-75%  │ AWQ/GPTQ 量化后部署  │
# │ Spot Instance    │ 60-70%  │ 训练用 Spot + 断点续 │
# │ MIG 切分         │ 30-50%  │ 小模型共享大 GPU     │
# │ 右 Size 选型     │ 20-40%  │ 不要 H100 跑 7B 模型 │
# │ Prefix Caching   │ 10-30%  │ 共享 System Prompt   │
# │ Prompt 压缩      │ 10-20%  │ 减少输入 token 数    │
# │ 预留实例         │ 30-40%  │ 稳定负载用预留       │
# │ 混合调度         │ 15-25%  │ 基线预留 + 峰值 Spot │
# └──────────────────┴─────────┴──────────────────────┘

# 组合使用：INT4 量化 + Spot + Prefix Caching
# 总节省可达 85%+`;

export default function LessonCost() {
  const [tab, setTab] = useState('spot');
  const tabs = [
    { key: 'spot', label: '💰 Spot Instance 策略', code: CODE_SPOT },
    { key: 'mig',  label: '🔧 MIG 多租户切分',    code: CODE_MIG },
    { key: 'roi',  label: '📊 ROI 计算 & 成本优化', code: CODE_ROI },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 08 · COST ENGINEERING</div>
        <h1>成本工程</h1>
        <p>AI 最贵的不是人——是 GPU。<strong>一个 8×H100 集群年费超过 200 万美元</strong>。成本工程不是"省钱"，而是在算力受限的现实下，最大化每一美元的价值。Spot Instance、MIG 切分、量化推理的组合可以节省 85%+ 的成本。</p>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">💵 成本工程三主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`ai-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} /><div className="ai-code-dot" style={{ background: '#f59e0b' }} /><div className="ai-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}_cost.py</span>
          </div>
          <div className="ai-code">{t.code}</div>
        </div>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">🏁 AI 基础设施全链路回顾</div>
        <div className="ai-steps">
          {[
            { step: '1', name: 'GPU 硬件', desc: 'SM/CUDA Core/Tensor Core + HBM 内存层级', color: '#f97316' },
            { step: '2', name: 'CUDA 编程', desc: 'Thread/Block/Grid + Shared Memory + Triton', color: '#fbbf24' },
            { step: '3', name: 'PyTorch 底层', desc: '混合精度 AMP + torch.compile + Profiler', color: '#38bdf8' },
            { step: '4', name: '模型量化', desc: 'GPTQ/AWQ/GGUF + 精度实测 + 选型指南', color: '#a78bfa' },
            { step: '5', name: '推理引擎', desc: 'vLLM PagedAttention + TensorRT + SGLang', color: '#22c55e' },
            { step: '6', name: '分布式训练', desc: 'DDP/FSDP/Megatron 三维并行 + 显存计算', color: '#f97316' },
            { step: '7', name: '集群运维', desc: 'NCCL/InfiniBand + DCGM 监控 + 故障排查', color: '#38bdf8' },
            { step: '8', name: '成本工程', desc: 'Spot + MIG + 量化 → 节省 85%+ 成本', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} className="ai-step">
              <div className="ai-step-num" style={{ background: `${s.color}18`, borderColor: s.color, color: s.color }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--ai-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="ai-tip">💡 <strong>AI 技术栈完整路径</strong>：AI API 入门 → RAG 工程 → Agent 工程 → 微调工程化 → <strong>AI 基础设施（本课）</strong>。学完这条路径，你从"调 API"跨越到了"理解 GPU 为什么慢、显存为什么不够、成本为什么高"的底层视角——这是真正的 AI 全栈工程师。</div>
      </div>
    </div>
  );
}
