import { useState } from 'react';
import './LessonCommon.css';

const CODE_NCCL = `# ━━━━ NCCL & GPU 互联拓扑 ━━━━
# NCCL = NVIDIA Collective Communications Library
# 所有多 GPU 集合通信（AllReduce/AllGather/ReduceScatter）都通过 NCCL

# ━━━━ GPU 互联层级（由快到慢）━━━━
# 1. NVLink（机内 GPU↔GPU）：900 GB/s（H100 NVLink 4.0）
# 2. NVSwitch（机内全连接）：所有 GPU 通过 NVSwitch 全互联
# 3. PCIe Gen5（CPU↔GPU）：128 GB/s（双向）
# 4. InfiniBand（机间）：400 Gb/s（NDR）= 50 GB/s
# 5. RoCE（以太网 RDMA）：速度接近 IB，成本更低

# ━━━━ 拓扑检测 ━━━━
# nvidia-smi topo -m    # 查看 GPU 互联拓扑
# GPU0 GPU1 GPU2 GPU3
# GPU0  X    NV   NV   NV    NV = NVLink
# GPU1  NV   X    NV   NV
# GPU2  NV   NV   X    NV
# GPU3  NV   NV   NV   X

# ━━━━ NCCL 环境变量调优 ━━━━
export NCCL_DEBUG=INFO               # 打印通信详情
export NCCL_IB_DISABLE=0             # 启用 InfiniBand
export NCCL_SOCKET_IFNAME=eth0       # 网络接口
export NCCL_P2P_LEVEL=NVL            # P2P 通信级别
export NCCL_ALGO=Ring                # 通信算法（Ring/Tree/CollNet）

# Ring AllReduce：每 GPU 发送 1/N 数据，N-1 轮完成
# Tree AllReduce：树状聚合，延迟更低
# 通常 NCCL 自动选择最优算法

# ━━━━ InfiniBand 网络检查 ━━━━
ibstat                # 查看 IB 网卡状态
ibv_devinfo           # 设备信息
ib_write_bw           # 带宽测试

# ━━━━ 多机训练启动 ━━━━
# Master 节点
torchrun \\
  --nnodes=4 \\                    # 4 台机器
  --nproc_per_node=8 \\            # 每台 8 张 GPU
  --node_rank=0 \\                 # 当前节点编号
  --master_addr=10.0.0.1 \\        # Master IP
  --master_port=29500 \\
  train.py

# Worker 节点（node_rank=1,2,3）
# 相同命令，改 --node_rank`;

const CODE_MONITOR = `# ━━━━ GPU 监控与告警体系 ━━━━

# ━━━━ 1. nvidia-smi 基础监控 ━━━━
# 实时刷新（每 0.5 秒）
watch -n 0.5 nvidia-smi

# 查询特定指标（机器可读）
nvidia-smi --query-gpu=index,name,temperature.gpu,utilization.gpu,\\
  utilization.memory,memory.used,memory.total,power.draw \\
  --format=csv -l 1

# ━━━━ 2. DCGM（Data Center GPU Manager）━━━━
# NVIDIA 官方数据中心级 GPU 监控
# 支持 Prometheus 导出 + Grafana 可视化

# 安装 DCGM Exporter
docker run -d --gpus all -p 9400:9400 \\
  nvcr.io/nvidia/k8s/dcgm-exporter:latest

# Prometheus 配置
# scrape_configs:
#   - job_name: 'dcgm'
#     static_configs:
#       - targets: ['gpu-node-1:9400', 'gpu-node-2:9400']

# 关键监控指标：
# DCGM_FI_DEV_GPU_UTIL        → GPU 计算利用率
# DCGM_FI_DEV_MEM_COPY_UTIL   → 显存带宽利用率
# DCGM_FI_DEV_GPU_TEMP        → GPU 温度（> 85°C 告警）
# DCGM_FI_DEV_POWER_USAGE     → 功耗（瓦特）
# DCGM_FI_DEV_FB_USED         → 已用显存
# DCGM_FI_DEV_NVLINK_BW       → NVLink 带宽使用率
# DCGM_FI_DEV_ECC_SBE_AGG     → ECC 单比特错误（早期故障信号）
# DCGM_FI_DEV_XID_ERRORS      → XID 错误（GPU 硬件错误）

# ━━━━ 3. Grafana Dashboard 告警规则 ━━━━
# 温度告警：GPU Temp > 85°C 持续 5 分钟
# 利用率低：GPU Util < 30% 持续 10 分钟（浪费！）
# ECC 错误：单比特错误连续增长（换卡预警）
# 显存泄漏：训练时显存持续增长（内存泄漏）`;

const CODE_TROUBLESHOOT = `# ━━━━ GPU 故障排查手册 ━━━━

# ━━━━ 问题 1：CUDA Out of Memory ━━━━
# RuntimeError: CUDA out of memory
# 解决步骤：
# 1. 减小 batch_size
# 2. 启用梯度检查点（gradient_checkpointing=True）
# 3. 启用梯度累积（gradient_accumulation_steps=8）
# 4. 使用混合精度（bf16=True）
# 5. 使用 DeepSpeed ZeRO-2/3
# 6. 减小 max_seq_len

# 显存使用诊断：
import torch
print(torch.cuda.memory_summary())
# 查看 Peak Memory 和 Allocated Memory

# ━━━━ 问题 2：训练 Loss NaN / Inf ━━━━
# 可能原因：
# 1. 学习率太高 → 降低 10x
# 2. FP16 溢出 → 改用 bf16 或增大 loss_scale
# 3. 数据异常（空样本/超长序列）→ 检查数据
# 4. 梯度爆炸 → max_grad_norm=1.0

# 诊断：
for name, param in model.named_parameters():
    if param.grad is not None:
        grad_norm = param.grad.norm()
        if torch.isnan(grad_norm) or torch.isinf(grad_norm):
            print(f"异常梯度：{name}, norm={grad_norm}")

# ━━━━ 问题 3：多 GPU 训练卡死（Hang）━━━━
# 可能原因：
# 1. NCCL 通信超时 → export NCCL_TIMEOUT=1800
# 2. GPU 某张卡故障 → nvidia-smi 检查状态
# 3. 死锁（不同 rank 执行路径不一致）→ 检查条件分支
# 4. InfiniBand 链路故障 → ibstat 检查

# 诊断：
export NCCL_DEBUG=WARN
export TORCH_DISTRIBUTED_DEBUG=DETAIL

# ━━━━ 问题 4：XID 错误（GPU 硬件错误）━━━━
# dmesg | grep -i "xid"
# XID 31 → GPU 失联（需重启）
# XID 43 → GPU 页面错误（通常是显存问题）
# XID 45 → GPU 预期外的离线
# XID 79 → GPU 被 GPU Reset

# XID 48 → ECC 双比特错误（致命！需要换卡）
# 处理：加入 GPU 黑名单，提交换卡工单
export CUDA_VISIBLE_DEVICES=0,1,3  # 跳过故障 GPU 2

# ━━━━ 问题 5：训练速度逐渐变慢 ━━━━
# 可能原因：
# 1. GPU 温度过高 → 降频保护（nvidia-smi -q | grep Throttle）
# 2. 数据加载变慢 → DataLoader num_workers 不够
# 3. 显存碎片化 → torch.cuda.empty_cache()
# 4. 垃圾回收卡顿 → gc.disable() 在训练循环中`;

export default function LessonCluster() {
  const [tab, setTab] = useState('nccl');
  const tabs = [
    { key: 'nccl',         label: '🔗 NCCL & InfiniBand', code: CODE_NCCL },
    { key: 'monitor',      label: '📊 GPU 监控体系',       code: CODE_MONITOR },
    { key: 'troubleshoot', label: '🔧 故障排查手册',       code: CODE_TROUBLESHOOT },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="ai-lesson">
      <div className="ai-hero">
        <div className="ai-badge">// MODULE 07 · CLUSTER OPERATIONS</div>
        <h1>算力集群运维</h1>
        <p>GPU 不会自己跑起来。<strong>NCCL 配置决定了多卡通信效率、DCGM + Grafana 监控让异常秒级可见、XID 错误排查能力决定了集群的正常运行时间</strong>——这些是 AI Infra 工程师的日常战场。</p>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">🖥️ 集群运维三主题</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`ai-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="ai-code-wrap">
          <div className="ai-code-head">
            <div className="ai-code-dot" style={{ background: '#ef4444' }} /><div className="ai-code-dot" style={{ background: '#f59e0b' }} /><div className="ai-code-dot" style={{ background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.sh</span>
          </div>
          <div className="ai-code">{t.code}</div>
        </div>
      </div>

      <div className="ai-section">
        <div className="ai-section-title">📈 GPU 互联带宽层级</div>
        <div className="ai-card">
          {[
            { name: 'NVLink 4.0（H100）', bw: '900 GB/s', pct: 100, color: '#f97316' },
            { name: 'NVLink 3.0（A100）', bw: '600 GB/s', pct: 67, color: '#fbbf24' },
            { name: 'PCIe Gen5 x16', bw: '128 GB/s', pct: 14, color: '#38bdf8' },
            { name: 'InfiniBand NDR 400G', bw: '50 GB/s', pct: 6, color: '#a78bfa' },
            { name: 'RoCE 100GbE', bw: '12.5 GB/s', pct: 1.5, color: '#64748b' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{ width: 130, fontSize: '0.78rem', color: l.color, fontWeight: 600, flexShrink: 0 }}>{l.name}</div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 8 }}>
                <div style={{ height: '100%', borderRadius: 4, background: l.color, width: l.pct + '%' }} />
              </div>
              <div style={{ width: 80, fontSize: '0.78rem', color: 'var(--ai-muted)', textAlign: 'right', fontFamily: 'JetBrains Mono,monospace' }}>{l.bw}</div>
            </div>
          ))}
        </div>
        <div className="ai-warn">⚠️ <strong>张量并行（TP）必须用 NVLink</strong>：TP 的通信量极大（每层前向 + 反向各 2 次 AllReduce）。如果用 PCIe 做 TP，通信开销会吃掉 80%+ 的计算性能。所以 TP 只在机内（NVLink 互联的 GPU 之间）使用。</div>
      </div>
    </div>
  );
}
