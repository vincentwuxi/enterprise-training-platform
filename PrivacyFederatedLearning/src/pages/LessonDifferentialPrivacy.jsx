import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['DP 数学基础', 'DP-SGD', '本地差分隐私', '组合定理'];

export default function LessonDifferentialPrivacy() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🎲 module_03 — 差分隐私</div>
      <div className="fs-hero">
        <h1>差分隐私：DP-SGD / 隐私预算 / 组合定理 — 数学可证明的隐私保障</h1>
        <p>
          差分隐私 (Differential Privacy) 是<strong>唯一具有严格数学证明</strong>的隐私保护机制。
          本模块从 ε-DP 的数学定义出发，深入 DP-SGD 深度学习隐私训练算法，
          掌握本地差分隐私 (LDP) 在数据采集中的应用，
          理解组合定理和隐私会计系统如何管理<strong>隐私预算</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎲 差分隐私</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📐 差分隐私数学基础</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> dp_math</div>
              <pre className="fs-code">{`# 差分隐私: 隐私保护的"黄金标准"

# ═══ (ε, δ)-差分隐私 定义 ═══
# 随机算法 M 满足 (ε, δ)-DP, 当且仅当:
# 对任意相邻数据集 D, D' (仅差一条记录),
# 对任意输出集合 S:
#
# P[M(D) ∈ S] ≤ e^ε · P[M(D') ∈ S] + δ
#
# ε: 隐私损失 (privacy loss), 越小越隐私
# δ: 失败概率, 通常 ≤ 1/n² (n为数据量)
# 当 δ=0 时为 "纯" 差分隐私

# ═══ 核心机制 ═══

# 1. 拉普拉斯机制 (Laplace Mechanism)
# 适用: 数值查询 f(D)
# M(D) = f(D) + Lap(Δf / ε)
# Δf: 全局敏感度 = max_{D,D'} |f(D) - f(D')|
# Lap(b): 拉普拉斯噪声, 尺度参数 b
import numpy as np

def laplace_mechanism(true_value, sensitivity, epsilon):
    noise = np.random.laplace(0, sensitivity / epsilon)
    return true_value + noise

# 例: "平均工资" 查询
# 敏感度 = max_salary / n
# ε = 1.0 → 噪声尺度 = 100000/1000/1.0 = 100

# 2. 高斯机制 (Gaussian Mechanism)
# M(D) = f(D) + N(0, σ²)
# σ ≥ Δf · √(2·ln(1.25/δ)) / ε
# 满足 (ε, δ)-DP, 适用于 DP-SGD

def gaussian_mechanism(true_value, sensitivity, epsilon, delta):
    sigma = sensitivity * np.sqrt(2 * np.log(1.25 / delta)) / epsilon
    noise = np.random.normal(0, sigma)
    return true_value + noise

# 3. 指数机制 (Exponential Mechanism)
# 适用: 非数值查询 (选择最优选项)
# P[output = r] ∝ exp(ε · u(D, r) / (2·Δu))
# u: 效用函数, Δu: 效用函数的敏感度

# ═══ 隐私-精度 折衷 ═══
# ε↓ → 噪声↑ → 精度↓ → 隐私↑
# ε↑ → 噪声↓ → 精度↑ → 隐私↓
# 没有"免费"的隐私保护!`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧠 DP-SGD: 隐私深度学习训练</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> dp_sgd</div>
              <pre className="fs-code">{`# DP-SGD (Abadi et al., 2016): 差分隐私 + 随机梯度下降

# ═══ 核心思想 ═══
# 标准 SGD 的梯度可能泄露训练数据信息
# DP-SGD: 裁剪梯度 + 加噪声 → 保护每条数据的隐私

# ═══ 算法步骤 ═══
def dp_sgd_step(model, batch, max_grad_norm, noise_multiplier, lr):
    """一步 DP-SGD 更新"""
    per_sample_grads = []
    
    for x, y in batch:
        # Step 1: 计算每个样本的梯度
        grad = compute_gradient(model, x, y)
        
        # Step 2: 梯度裁剪 (限制单个样本的影响)
        grad_norm = torch.norm(grad)
        clip_factor = min(1.0, max_grad_norm / grad_norm)
        clipped_grad = grad * clip_factor
        per_sample_grads.append(clipped_grad)
    
    # Step 3: 聚合梯度 + 加高斯噪声
    avg_grad = sum(per_sample_grads) / len(batch)
    noise = torch.normal(0, noise_multiplier * max_grad_norm / len(batch),
                         size=avg_grad.shape)
    noisy_grad = avg_grad + noise
    
    # Step 4: 更新模型
    model.params -= lr * noisy_grad

# ═══ 关键超参数 ═══
dp_sgd_params = {
    "max_grad_norm (C)": {
        "作用":   "限制单个样本对梯度的最大贡献",
        "典型值": "0.1 - 1.0",
        "影响":   "太小→收敛慢, 太大→噪声大",
    },
    "noise_multiplier (σ)": {
        "作用":   "控制添加的噪声量",
        "典型值": "0.5 - 2.0",
        "影响":   "越大→越隐私但精度越低",
    },
    "batch_size": {
        "作用":   "越大→噪声影响越小 (平均稀释)",
        "典型值": "256 - 2048 (远大于普通训练)",
    },
}

# ═══ Opacus 实战 (PyTorch) ═══
from opacus import PrivacyEngine

model = create_model()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

privacy_engine = PrivacyEngine()
model, optimizer, dataloader = privacy_engine.make_private_with_epsilon(
    module=model,
    optimizer=optimizer,
    data_loader=dataloader,
    epochs=10,
    target_epsilon=3.0,    # 目标隐私预算
    target_delta=1e-5,     # 失败概率
    max_grad_norm=1.0,     # 梯度裁剪阈值
)

# 训练后查看实际消耗的隐私预算
epsilon = privacy_engine.get_epsilon(delta=1e-5)
print(f"实际 ε = {epsilon:.2f}")  # 例: ε = 2.87`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📱 本地差分隐私 (LDP)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> local_dp</div>
              <pre className="fs-code">{`# 本地差分隐私: 数据在用户端就加噪声!

# ═══ 中心化 DP vs 本地 DP ═══
# 中心化 DP: 服务器收集真实数据 → 分析时加噪声
#   → 服务器看到原始数据 (需要信任服务器)
# 本地 DP:   用户本地加噪声 → 发送加噪数据给服务器
#   → 服务器只看到加噪数据 (不需要信任服务器!)

# ═══ Randomized Response (经典 LDP) ═══
# 1965 Warner 提出, 用于敏感调查
# 例: "你是否使用过毒品?"
# 1. 抛硬币 (不让调查者看到结果)
# 2. 正面: 如实回答
# 3. 反面: 随机回答 (50% 是 / 50% 否)
# → 任何人无法确定你的真实回答!
# → 但统计聚合后可以估计真实比例

import random
def randomized_response(true_answer, p=0.75):
    """p 概率说真话, 1-p 概率随机回答"""
    if random.random() < p:
        return true_answer  # 真实答案
    else:
        return random.choice([True, False])  # 随机答案

# 还原真实比例:
# 观察到的 "是" 比例 = p·真实比例 + (1-p)·0.5
# → 真实比例 = (观察比例 - (1-p)·0.5) / p

# ═══ RAPPOR (Google Chrome, 2014) ═══
# Randomized Aggregatable Privacy-Preserving
# Ordinal Response
#
# 用于收集浏览器首页 URL 统计
# 两层随机化:
# 1. 永久随机响应 (Permanent RR)
# 2. 瞬时随机响应 (Instantaneous RR)
# → 即使多次收集, 也无法推断真实值

# ═══ Apple (iOS 10+) ═══
# 本地 DP 应用:
# - Emoji 使用频率统计
# - Safari 搜索词统计  
# - Health 数据类型统计
# - ε = 2-8, 每天重置隐私预算

# ═══ 联邦学习 + LDP ═══
# 客户端在上传梯度前加本地噪声
# → 服务器无法从梯度推断客户端数据
# → 代价: 需要更多客户端才能收敛
# → 适合: 海量用户场景 (手机/IoT)`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧮 组合定理与隐私会计</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> composition</div>
              <pre className="fs-code">{`# 组合定理: 多次查询的隐私损失如何累积?

# ═══ 基本组合定理 ═══
# k 个 (ε_i, 0)-DP 算法的组合:
# 总隐私损失: ε_total = Σ ε_i
# 最坏情况, 隐私损失线性增长 → 预算很快耗尽!

# ═══ 高级组合定理 ═══
# k 个 (ε, δ)-DP 算法的组合:
# ε_total = √(2k·ln(1/δ')) · ε + k·ε·(e^ε - 1)
# 亚线性增长! 比基本组合紧很多

# ═══ Rényi 差分隐私 (RDP) ═══
# 更适合 DP-SGD 的隐私分析
# (α, ε)-RDP: D_α(M(D) || M(D')) ≤ ε
# D_α 是 α 阶 Rényi 散度
# RDP 组合更简单: ε_total(α) = Σ ε_i(α)
# RDP → DP 转换: (ε + log(1/δ)/(α-1), δ)-DP

# ═══ Moments Accountant ═══
# DP-SGD 论文提出的隐私会计方法
# 追踪隐私损失的矩生成函数
# 比高级组合更紧密的隐私分析
# Opacus/TensorFlow Privacy 默认使用

# ═══ 实战: 隐私预算管理 ═══
from opacus.accountants import RDPAccountant

accountant = RDPAccountant()

# 每个训练 step 消耗一点隐私预算
for step in range(num_steps):
    accountant.step(
        noise_multiplier=1.0,
        sample_rate=batch_size / dataset_size
    )

# 查看当前已消耗的隐私预算
epsilon = accountant.get_epsilon(delta=1e-5)
print(f"训练 {num_steps} 步后: ε = {epsilon:.2f}")

# ═══ 预算规划示例 ═══
budget_planning = {
    "总预算":    "ε = 5.0 (中等隐私)",
    "训练":      "ε = 3.0 (DP-SGD, 主要消耗)",
    "评估":      "ε = 1.0 (验证集评估)",
    "发布":      "ε = 0.5 (模型发布/查询)",
    "预留":      "ε = 0.5 (未来迭代)",
}

# ═══ GDP (Gaussian DP, 2020) ═══
# 用 f-差分隐私统一框架
# 中心极限定理: T 步 DP-SGD → 近似高斯 DP
# 比 RDP 给出更紧密的界
# 特别适合大规模深度学习训练`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
