import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['秘密共享', '混淆电路', '同态加密', 'MPC 实战'];

export default function LessonSecureComputation() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔒 module_04 — 安全多方计算</div>
      <div className="fs-hero">
        <h1>安全多方计算：秘密共享 / 混淆电路 / 同态加密 — 密码学隐私计算</h1>
        <p>
          安全多方计算 (MPC) 允许多方<strong>联合计算函数结果，而不暴露各自的输入</strong>。
          本模块从秘密共享 (Shamir/Additive) 出发，理解混淆电路 (Garbled Circuit) 的构造，
          深入全同态加密 (FHE) 在加密数据上直接计算的黑科技，
          并掌握 MPC 在联合风控、隐私推理中的工程实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔒 安全多方计算</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔢 秘密共享</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> secret_sharing</div>
              <pre className="fs-code">{`# 秘密共享: 将秘密拆分为多个份额

# ═══ 加法秘密共享 (Additive SS) ═══
# 最简单的方案: 将秘密 s 拆分为 n 个份额
# s = s_1 + s_2 + ... + s_n (mod p)
# 只有收集到所有份额才能恢复秘密

import random

def additive_share(secret, n_parties, prime=2**61 - 1):
    """将秘密拆分为 n 个加法份额"""
    shares = [random.randint(0, prime-1) for _ in range(n_parties-1)]
    shares.append((secret - sum(shares)) % prime)
    return shares

def additive_reconstruct(shares, prime=2**61 - 1):
    """从所有份额恢复秘密"""
    return sum(shares) % prime

# 例: secret = 42
# shares = [17, 89, -64] → 17+89+(-64) = 42

# ═══ 加法 SS 上的安全计算 ═══
# 加法: [a] + [b] = [a+b] (本地计算!)
# 标量乘: c·[a] = [c·a] (本地计算!)
# 乘法: [a] × [b] → 需要通信! (Beaver Triple)

# Beaver Triple 乘法:
# 预计算随机三元组 (u, v, w) 使得 u·v = w
# 计算 [a·b]:
# 1. [e] = [a] - [u], [f] = [b] - [v]
# 2. 公开 e 和 f
# 3. [a·b] = e·f + e·[v] + f·[u] + [w]

# ═══ Shamir 秘密共享 (门限方案) ═══
# (t, n)-门限: n 个份额中任意 t 个可恢复秘密
# 基于多项式插值
# 构造: 随机 t-1 次多项式 p(x), p(0) = secret
# 份额: p(1), p(2), ..., p(n)
# 恢复: 拉格朗日插值求 p(0)

# (2,3) 门限: 3 个份额, 任意 2 个即可恢复
# 适用: 密钥管理, 多签钱包, 灾备

# ═══ 安全模型 ═══
security_models = {
    "半诚实 (Semi-Honest)": {
        "假设": "各方遵守协议, 但试图从消息推断信息",
        "应用": "企业内部/可信机构联合计算",
        "效率": "高",
    },
    "恶意 (Malicious)": {
        "假设": "各方可能任意偏离协议",
        "应用": "不可信第三方合作",
        "效率": "低 (需要零知识证明/MAC 验证)",
    },
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔀 混淆电路</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> garbled_circuits</div>
              <pre className="fs-code">{`# 混淆电路 (Garbled Circuit): Yao's Protocol (1982)

# ═══ 核心思想 ═══
# 将函数表示为布尔电路 → 加密电路 → 安全评估
# 两方场景: Alice (Garbler) 和 Bob (Evaluator)

# ═══ 协议步骤 ═══
# 1. Alice 将函数 f 编译为布尔电路
# 2. Alice "混淆" 电路:
#    - 每条线路: 0 → 随机密钥 k0, 1 → 随机密钥 k1
#    - 每个门: 加密真值表 (用对应密钥)
#    - 打乱真值表行序
# 3. Alice 发送混淆电路 + 自己输入的密钥
# 4. Bob 通过 OT (不经意传输) 获取自己输入的密钥
# 5. Bob 逐门评估电路 → 得到输出

# ═══ 不经意传输 (OT) ═══
# Bob 有选择位 b ∈ {0,1}
# Alice 有两个消息 m0, m1
# OT 协议后: Bob 得到 m_b, Alice 不知道 b
# → Bob 获取输入密钥, 但 Alice 不知道 Bob 的输入!

# ═══ 性能特点 ═══
gc_performance = {
    "通信量":      "电路大小 × 密钥长度 (可能很大)",
    "计算轮数":    "常数轮 (不依赖电路深度)",
    "适用函数":    "任意布尔函数 (通用但不高效)",
    "优化技术": {
        "Free-XOR":    "XOR 门零开销",
        "Half-Gate":   "AND 门只需 2 个密文",
        "Point-Permit": "减少 OT 通信",
    },
}

# ═══ 实际应用 ═══
gc_applications = {
    "百万富翁问题": "两人比较谁更富, 不暴露具体数额",
    "隐私集合求交": "两方找共同元素, 不暴露非交集",
    "安全模型推理": "模型在密文上推理, 保护输入+模型",
    "信用评估":     "银行+税务联合评估, 不共享原始数据",
}

# ═══ 与秘密共享的对比 ═══
# ┌──────────┬──────────────┬──────────────┐
# │          │ 混淆电路      │ 秘密共享      │
# ├──────────┼──────────────┼──────────────┤
# │ 通信轮数 │ 常数轮        │ O(深度) 轮    │
# │ 通信量   │ O(|电路|)     │ O(乘法门数)   │
# │ 参与方   │ 通常 2 方     │ 任意多方      │
# │ 预处理   │ 无            │ Beaver Triple │
# │ 适用场景 │ 短函数, 低延迟│ 长函数, 高吞吐│
# └──────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔐 同态加密 (HE)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> homomorphic_encryption</div>
              <pre className="fs-code">{`# 同态加密: 在加密数据上直接计算!

# ═══ 什么是同态加密? ═══
# Enc(a) ⊕ Enc(b) = Enc(a + b)  → 加法同态
# Enc(a) ⊗ Enc(b) = Enc(a × b)  → 乘法同态
# 无需解密就能在密文上计算!

# ═══ 同态加密类型 ═══
he_types = {
    "部分同态 (PHE)": {
        "说明":    "只支持一种运算 (加或乘)",
        "代表":    "Paillier (加法) / RSA (乘法)",
        "性能":    "快, 密文膨胀小",
        "应用":    "投票/竞拍/聚合统计",
    },
    "半同态 (SHE)": {
        "说明":    "支持有限次数的加和乘",
        "代表":    "BGV / BFV",
        "性能":    "中等",
        "应用":    "线性模型/简单 ML 推理",
    },
    "全同态 (FHE)": {
        "说明":    "支持任意次数的加和乘",
        "代表":    "CKKS / TFHE / OpenFHE",
        "性能":    "慢 (但在快速改善)",
        "应用":    "任意计算 (但有实际限制)",
    },
}

# ═══ CKKS 方案 (近似计算) ═══
# 特别适合 ML/AI 推理!
# 支持浮点数近似计算
# 核心操作: 加法 + 乘法 + 旋转 (SIMD)
# 1 个密文 = 打包 N/2 个浮点数 (SIMD)

# ═══ Paillier 加法同态实战 ═══
from phe import paillier

# 生成密钥对
public_key, private_key = paillier.generate_paillier_keypair()

# 加密
a_enc = public_key.encrypt(42)
b_enc = public_key.encrypt(58)

# 密文加法 (无需私钥!)
sum_enc = a_enc + b_enc

# 解密
result = private_key.decrypt(sum_enc)  # = 100!

# 标量乘法
product_enc = a_enc * 3  # Enc(42 * 3) = Enc(126)

# ═══ FHE ML 推理 (前沿) ═══
# 全程加密的 ML 推理:
# 1. 用户加密输入 → 发送 Enc(x) 给服务器
# 2. 服务器在 Enc(x) 上运行模型推理
# 3. 返回 Enc(y) → 用户解密得到 y
# 4. 服务器全程不知道 x 和 y!
# 问题: 慢 100-10000x → 实用化仍需研究突破

# ═══ 性能基准 ═══
# 线性回归推理: ~1ms (HE) vs ~0.01ms (明文)
# 逻辑回归推理: ~10ms (HE)
# CNN 推理:     ~10s (HE) → 仍然太慢
# → 2024-2025: 硬件加速 (Intel HEXL / GPU) 大幅提速`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚙️ MPC 工程实践</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> mpc_practice</div>
              <pre className="fs-code">{`# MPC 工程实践: 从理论到生产

# ═══ MPC 框架选型 ═══
mpc_frameworks = {
    "ABY3":          "3 方, 混合协议 (A+B+Y), 微软出品",
    "MP-SPDZ":       "通用多方计算框架, 学术界主流",
    "CrypTen":       "PyTorch 上的 MPC, Facebook 出品",
    "SecretFlow":    "蚂蚁集团, 国产全栈隐私计算平台",
    "PrimiHub":      "开源, 支持 MPC+FL+TEE",
}

# ═══ CrypTen 实战 (PyTorch MPC) ═══
import crypten
import torch

crypten.init()

# Alice 有模型参数, Bob 有数据
# 加密张量
x = crypten.cryptensor(torch.tensor([1.0, 2.0, 3.0]))
y = crypten.cryptensor(torch.tensor([4.0, 5.0, 6.0]))

# MPC 计算 (自动在秘密共享上操作)
z = x + y          # 安全加法
w = x * y          # 安全乘法
dot = x.dot(y)     # 安全内积

# 解密 (所有参与方同意后)
result = z.get_plain_text()  # [5.0, 7.0, 9.0]

# ═══ 隐私集合求交 (PSI) ═══
# 两方各有一个集合, 求交集, 不暴露非交集元素
# 纵向联邦学习的前序步骤!
# 方法: 
# 1. Hash-based PSI: 快但弱安全
# 2. OT-based PSI:   快且安全 (推荐)
# 3. FHE-based PSI:  慢但最安全

# ═══ 性能优化 ═══
mpc_optimization = {
    "离线/在线分离": {
        "离线": "预计算 Beaver Triples (可提前批量生成)",
        "在线": "实际计算只需加法 → 极快",
    },
    "函数编译优化": {
        "减少乘法深度": "乘法是 MPC 的瓶颈",
        "批处理":       "SIMD 打包, 并行处理多个实例",
        "混合协议":     "不同运算用不同MPC协议",
    },
    "通信优化": {
        "压缩":   "量化秘密共享份额",
        "流水线": "计算和通信重叠",
    },
}

# ═══ MPC 适用性判断 ═══
# ✅ 适合: 联合统计/联合建模/隐私推理/PSI
# ❌ 不适合: 大规模深度学习训练 (太慢)
# → 大模型训练用 FL + DP, 推理可用 MPC/FHE`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
