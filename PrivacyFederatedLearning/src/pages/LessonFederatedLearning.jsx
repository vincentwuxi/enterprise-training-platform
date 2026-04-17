import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['FedAvg 算法', '横向与纵向联邦', '通信优化', '异构与鲁棒性'];

export default function LessonFederatedLearning() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge blue">🌐 module_02 — 联邦学习基础</div>
      <div className="fs-hero">
        <h1>联邦学习基础：FedAvg / 横向联邦 / 纵向联邦 / 通信优化</h1>
        <p>
          联邦学习 (Federated Learning) 让<strong>数据不动、模型移动</strong>，
          是隐私计算中最成熟的技术方向。本模块从 Google 提出的 FedAvg 算法出发，
          深入横向联邦 (样本分割) 与纵向联邦 (特征分割) 的差异，
          掌握通信压缩、异构数据、拜占庭鲁棒性等核心挑战与解决方案。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 联邦学习</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 FedAvg 核心算法</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> fedavg</div>
              <pre className="fs-code">{`# FedAvg (McMahan et al., 2017): 联邦学习开山之作

# ═══ 核心思想 ═══
# 传统 ML: 数据集中 → 一台机器训练
# 联邦 ML: 数据分散 → 多设备协同训练
#
# 每轮训练:
# 1. 服务器 → 分发全局模型给各客户端
# 2. 客户端 → 用本地数据训练 E 个 epoch
# 3. 客户端 → 上传模型更新 (梯度/参数差)
# 4. 服务器 → 聚合所有更新 → 新全局模型

# ═══ 算法伪代码 ═══
def fedavg(clients, rounds, local_epochs, lr):
    """Federated Averaging Algorithm"""
    # 初始化全局模型
    global_model = initialize_model()
    
    for t in range(rounds):
        # 随机选择 C% 的客户端
        selected = random.sample(clients, k=max(1, C * len(clients)))
        
        local_updates = []
        for client in selected:
            # 下发全局模型
            local_model = copy(global_model)
            
            # 本地训练 E 个 epoch
            for epoch in range(local_epochs):
                for batch in client.data:
                    loss = compute_loss(local_model, batch)
                    loss.backward()
                    optimizer.step(lr)
            
            # 计算模型差 Δw = w_local - w_global
            delta = local_model.params - global_model.params
            local_updates.append((len(client.data), delta))
        
        # 加权聚合 (按数据量加权)
        total_samples = sum(n for n, _ in local_updates)
        global_model.params += sum(
            (n / total_samples) * delta 
            for n, delta in local_updates
        )
    
    return global_model

# ═══ 关键超参数 ═══
# C (选择比例):  通常 0.1-0.3, 越大收敛越快
# E (本地轮数):  1-5, 越大通信效率高但可能发散
# B (批大小):    取决于客户端计算能力
# η (学习率):    需要比集中式更小

# ═══ FedAvg vs 集中式训练对比 ═══
# 通信轮数: FedAvg 需要 100-1000 轮
# 最终精度: 通常比集中式低 1-3% (Non-IID 更大)
# 优势: 数据不出域! 保护隐私`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>↔️ 横向联邦 vs 纵向联邦</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> fl_types</div>
              <pre className="fs-code">{`# 联邦学习的两种基本范式

# ═══ 横向联邦学习 (Horizontal FL) ═══
# 各参与方: 相同特征, 不同样本
# 例子: 不同城市的银行, 各自有当地客户数据
#       特征相同 (年龄/收入/信用), 客户不同
#
# 数据结构:
# 银行A: [用户1, 用户2, ...] × [年龄, 收入, 信用]
# 银行B: [用户X, 用户Y, ...] × [年龄, 收入, 信用]
#
# 训练方式: FedAvg (各自训练完整模型, 聚合参数)
# 主流场景: Google GBoard / Apple Siri / 手机键盘

# ═══ 纵向联邦学习 (Vertical FL) ═══
# 各参与方: 相同样本, 不同特征
# 例子: 银行 + 电商, 同一批用户
#       银行有金融特征, 电商有消费特征
#
# 数据结构:
# 银行:  [用户1, 用户2] × [收入, 信用评分, 存款]
# 电商:  [用户1, 用户2] × [消费额, 购买频次, 品类]
#
# 训练方式: Split Learning
# 1. 各方计算各自特征的中间表示
# 2. 安全聚合中间表示 → 计算 loss
# 3. 反向传播梯度 → 各方更新各自模型
# 关键: 需要实体对齐 (PSI 隐私求交)

# ═══ 联邦迁移学习 ═══
# 各参与方: 不同样本 + 不同特征 (双重不重叠)
# 用迁移学习弥补数据不足

# ═══ 对比总结 ═══
# ┌──────────┬──────────────────┬──────────────────┐
# │          │ 横向联邦          │ 纵向联邦          │
# ├──────────┼──────────────────┼──────────────────┤
# │ 数据切分 │ 按样本切分        │ 按特征切分        │
# │ 参与方   │ 同行业不同机构    │ 跨行业同用户群    │
# │ 算法     │ FedAvg 系列       │ Split Learning   │
# │ 通信     │ 模型参数          │ 中间表示+梯度     │
# │ 前序步骤 │ 无                │ 隐私集合求交(PSI) │
# │ 代表框架 │ Flower, PySyft    │ FATE, FedAI      │
# │ 典型场景 │ 手机/IoT/医院     │ 银行+电商+运营商  │
# └──────────┴──────────────────┴──────────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📡 通信效率优化</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> communication</div>
              <pre className="fs-code">{`# 通信是联邦学习的主要瓶颈!
# BERT-base: 110M 参数 = 440MB → 每轮上传 440MB × N 客户端

# ═══ 通信压缩技术 ═══

# 1. 梯度压缩
gradient_compression = {
    "Top-k 稀疏化":   "只传 k% 最大梯度 (k=0.1-1%)",
    "随机稀疏化":     "随机选择 k% 梯度, 未选的累积",
    "量化":           "FP32→FP16/INT8, 压缩 2-4x",
    "SignSGD":        "只传梯度符号 (+/-), 压缩 32x",
}

# 2. 模型压缩
model_compression = {
    "知识蒸馏":       "全局模型蒸馏→小模型下发",
    "参数高效微调":   "只传 LoRA adapter (0.1% 参数)",
    "子模型采样":     "大模型抽取子网络分发给异构设备",
}

# 3. 通信协议优化
protocol_optimization = {
    "异步联邦":       "不等所有客户端, 收到就更新",
    "分层聚合":       "边缘节点局部聚合 → 云端全局聚合",
    "FedBuff":        "缓冲 K 个更新后批量聚合",
}

# ═══ LoRA 联邦 (最新趋势) ═══
# 关键洞察: 不需要传完整模型参数!
# 每个客户端只训练 LoRA adapter
# r=8, d=768 → 每个 adapter 只有 ~0.5MB
# 上传 0.5MB vs 440MB → 压缩 880x!

# FedLoRA 伪代码:
def fed_lora(clients, global_model, rounds):
    for t in range(rounds):
        adapters = []
        for client in selected_clients:
            # 冻结全局模型, 只训练 LoRA
            adapter = train_lora(global_model, client.data)
            adapters.append(adapter)  # 只上传 adapter
        
        # 聚合 LoRA adapters
        global_adapter = weighted_average(adapters)
        # 合并到全局模型
        global_model = merge_lora(global_model, global_adapter)`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🛡️ 异构数据与鲁棒性</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> robustness</div>
              <pre className="fs-code">{`# 联邦学习的两大核心挑战

# ═══ 1. 数据异构 (Non-IID) ═══
# 现实中各客户端的数据分布差异巨大!
non_iid_types = {
    "标签分布偏移":  "客户端A只有猫图, B只有狗图",
    "特征分布偏移":  "地区A的用户行为模式与地区B不同",
    "数据量不均":    "大客户端100万样本, 小客户端100样本",
    "概念漂移":      "各客户端的label含义不完全一致",
}

# Non-IID 的影响:
# - FedAvg 收敛变慢甚至发散
# - 全局模型在某些客户端上表现很差
# - "权重发散" 现象

# 解决方案:
non_iid_solutions = {
    "FedProx":       "添加近端项, 防止本地模型偏离全局模型太远",
    "SCAFFOLD":      "控制变量修正客户端漂移",
    "FedNova":       "标准化不同本地训练步数的影响",
    "FedBN":         "保留本地 BatchNorm, 只聚合其他参数",
    "个性化联邦":    "全局模型 + 本地 fine-tune 层",
    "知识蒸馏":      "FedDF: 用公共数据集蒸馏聚合",
}

# ═══ 2. 拜占庭鲁棒性 ═══
# 恶意客户端可能上传假梯度!
byzantine_attacks = {
    "数据投毒":     "修改本地数据标签 → 毒化全局模型",
    "模型投毒":     "直接修改上传的梯度/参数",
    "后门攻击":     "植入触发器, 特定输入触发恶意行为",
    "搭便车":       "不训练, 上传随机/旧梯度, 白嫖模型",
}

# 防御方法:
byzantine_defenses = {
    "Krum":         "选择离其他更新最近的 (去除离群值)",
    "中位数聚合":   "对每个参数取中位数而非均值",
    "Trimmed Mean": "去掉最大最小 β%, 取剩余均值",
    "FoolsGold":    "检测相似更新 (sybil 攻击防御)",
    "差分隐私":     "DP 噪声天然限制攻击效果",
}

# ═══ 企业建议 ═══
# 内部联邦 (可信机构): FedAvg + Non-IID 处理即可
# 跨机构联邦 (低信任): FedAvg + 安全聚合 + Krum + DP`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
