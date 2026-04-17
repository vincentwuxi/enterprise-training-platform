import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['信道模型', 'BSC 与 BEC', '高斯信道', '香农第二定理'];

export default function LessonChannelCapacity() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📡 module_04 — 信道容量</div>
      <div className="fs-hero">
        <h1>信道容量：BSC / BEC / 高斯信道 / 香农极限</h1>
        <p>
          <strong>信道容量</strong>是可靠通信的理论极限——
          香农第二定理 (1948) 证明了存在编码方案使得传输速率可以接近信道容量，
          且误码率任意低。这个定理为整个现代通信工业指明了方向。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📡 信道容量深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📡 信道模型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> channel_model.txt</div>
                <pre className="fs-code">{`═══ 信道 (Channel) ═══

  输入 X → [信道 P(Y|X)] → 输出 Y

  信道完全由转移概率 P(Y|X) 描述

  信道容量:
  C = max_{P(X)} I(X; Y)
  
  在所有可能的输入分布 P(X) 上最大化互信息!

═══ 通信系统框图 ═══

  信源 → 信源编码 → 信道编码 → 调制 → 
    → [信道 + 噪声] →
  → 解调 → 信道解码 → 信源解码 → 信宿

  信源编码: 去除冗余 (压缩)
  信道编码: 添加冗余 (纠错)
    → 这两者的目标看似矛盾, 但可以分离处理!

═══ 信源-信道分离定理 ═══

  可以分别设计信源编码和信道编码,
  不会损失最优性! (对无穷码长成立)

  条件: 信源熵率 H < 信道容量 C
  
  → 可靠通信当且仅当 H < C

═══ 离散无记忆信道 (DMC) ═══

  • 输入 X ∈ X, 输出 Y ∈ Y
  • 转移概率 P(y|x) 不依赖于之前的传输
  • 用转移矩阵表示:

  例 (二元对称信道 BSC):
       │ Y=0      │ Y=1
  ─────┼──────────┼──────────
  X=0  │ 1-p      │ p
  X=1  │ p        │ 1-p

  每个比特有概率 p 被翻转!

═══ 信道容量计算的一般方法 ═══

  C = max_{P(X)} [H(Y) - H(Y|X)]
    = max_{P(X)} [H(Y) - Σ P(x) H(Y|X=x)]

  H(Y|X) 由信道固定 (不依赖输入分布!)
  所以: 最大化 H(Y) 即可 (对称信道)

  对称信道: 均匀输入达到容量
  一般信道: 需要 Blahut-Arimoto 迭代算法`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔀 BSC 与 BEC</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> bsc_bec.txt</div>
                <pre className="fs-code">{`═══ 二元对称信道 BSC(p) ═══

  每个比特以概率 p 翻转
  
       0 ──(1-p)──→ 0
        ╲            ╱
         ╲(p)    (p)╱
          ╳        ╳
         ╱(p)    (p)╲
        ╱            ╲
       1 ──(1-p)──→ 1

  容量: C_BSC = 1 - H(p)
              = 1 + p·log₂(p) + (1-p)·log₂(1-p)

  p   │  C (bit/用)
  ────┼────────────
  0   │  1.000  (无噪声: 完美传输!)
  0.01│  0.919
  0.1 │  0.531
  0.25│  0.189
  0.5 │  0.000  (完全随机: 无信息!)

  p=0.5 时输出与输入独立 → 完全无用!
  p=0 或 p=1 时容量为 1 (p=1 只需翻转输出)

═══ 二元擦除信道 BEC(ε) ═══

  每个比特以概率 ε 被擦除 (变成 ?)
  
       0 ──(1-ε)──→ 0
        ╲            
         ╲(ε)──────→ ?
        ╱(ε)──────→ ?
       ╱
       1 ──(1-ε)──→ 1

  容量: C_BEC = 1 - ε

  比 BSC 简单! 因为:
  • 收到 0/1 → 确定正确
  • 收到 ? → 知道不确定 (可以请求重传)
  
  BSC 更难: 不知道哪些比特出错了!

═══ 对比 ═══

  信道     │ 容量        │ 最优输入
  ─────────┼─────────────┼──────────
  无噪声   │ log₂|X|    │ 均匀
  BSC(p)   │ 1-H(p)     │ 均匀 (P(0)=P(1)=0.5)
  BEC(ε)   │ 1-ε        │ 均匀
  Z 信道   │ max I      │ 非均匀 (需优化)

═══ 编码率与可靠性 ═══

  编码率: R = k/n (k 信息位, n 编码位)
  
  R < C → 存在编码使错误率任意小!
  R > C → 任何编码的错误率都有下界!

  可靠性函数 E(R):
  P_error ≤ 2^(-n·E(R))

  E(R) > 0 当 R < C
  → 码长 n 越大, 错误率指数下降!

  这是一个存在性定理 — 但没有告诉你怎么构造!
  → 寻找接近容量的好码是 60 年来的核心挑战`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📶 高斯信道</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> gaussian.txt</div>
                <pre className="fs-code">{`═══ AWGN 信道 (加性白高斯噪声) ═══

  Y = X + Z,  Z ~ N(0, σ²)

  功率约束: E[X²] ≤ P
  噪声功率: N = σ²

  信噪比: SNR = P/N

═══ 高斯信道容量 (Shannon 公式) ═══

  C = (1/2) log₂(1 + P/N)   [bit/用]
    = (1/2) log₂(1 + SNR)

  这是信息论最著名的公式之一!

═══ 带宽版本 (Shannon-Hartley) ═══

  C = W · log₂(1 + P/(N₀·W))   [bit/秒]

  W = 带宽 (Hz)
  P = 信号功率 (Watt)
  N₀ = 噪声功率谱密度 (Watt/Hz)

  → 香农极限!

═══ 实例计算 ═══

  WiFi 6 (802.11ax):
  W = 80 MHz, SNR = 30 dB (1000 线性)
  C = 80×10⁶ × log₂(1+1000) ≈ 798 Mbit/s

  5G NR:
  W = 100 MHz, SNR = 20 dB (100)
  C = 100×10⁶ × log₂(101) ≈ 665 Mbit/s

  深空通信 (Voyager):
  W = 几 kHz, SNR ≈ -10 dB!
  接近 Shannon 极限: 使用 Turbo/LDPC 码

═══ SNR vs 容量 ═══

  SNR (dB) │ 线性 SNR │ C (bit/用)
  ─────────┼──────────┼───────────
  -6       │ 0.25     │ 0.161
  0        │ 1        │ 1.000
  3        │ 2        │ 1.585
  10       │ 10       │ 3.459
  20       │ 100      │ 6.658
  30       │ 1000     │ 9.967

  大 SNR 近似: C ≈ (1/2) log₂(SNR)
  每增加 3 dB SNR → 容量增加约 0.5 bit/用

═══ Shannon Limit (Eb/N0 极限) ═══

  最低信噪比 (per bit):
  
  Eb/N₀ ≥ ln(2) = -1.59 dB

  任何编码方案在 Eb/N₀ < -1.59 dB 时
  都无法实现可靠通信!

  现代码的距离:
  ────────────────────────────────
  Turbo (1993):    距极限 ~0.7 dB
  LDPC (Gallager): 距极限 ~0.1 dB
  Polar (Arıkan):  渐近达到容量!
  
  → 60 年后终于"摸到"了 Shannon 极限!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏛️ 香农第二定理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> shannon_second.txt</div>
                <pre className="fs-code">{`═══ 信道编码定理 (香农第二定理) ═══

  定理 (Shannon, 1948):

  对于信道容量为 C 的 DMC:

  正部分:
    ∀R < C, ∃编码方案使 P_error → 0 (n → ∞)
    "速率低于容量 → 可靠通信可能!"

  逆部分:
    ∀R > C, 任何编码方案的 P_error → 1 (n → ∞)
    "速率高于容量 → 可靠通信不可能!"

═══ 证明思路 (随机编码论证) ═══

  1. 随机生成 2^(nR) 个长度 n 的码字
  2. 发送码字 Xⁿ, 收到 Yⁿ
  3. 解码器寻找与 Yⁿ 联合典型的码字
  4. 分析错误概率:
     - 正确码字不典型: P → 0 (典型性)
     - 错误码字碰巧典型: P ≤ 2^(-n(C-R)) → 0

  关键: 使用了联合典型序列和大数定律!
  → 这是存在性证明, 不是构造性的!

═══ 典型序列 (Typical Sequences) ═══

  ε-典型集 A_ε^n:
  所有概率 ≈ 2^(-nH(X)) 的序列

  性质 (AEP - 渐近等分性):
  1. P(Xⁿ ∈ A_ε^n) → 1     (几乎所有序列都典型)
  2. |A_ε^n| ≈ 2^(nH(X))     (典型集大小 ≈ 2^(nH))
  3. 每个典型序列概率 ≈ 2^(-nH(X))

  直觉: 
  • 1000 次抛硬币, 几乎肯定约 500 正 500 反
  • 全正或全反: 可能但极不典型!
  • 典型序列看起来"像是从分布中采样的"

═══ 从理论到实践: 纠错编码的进化 ═══

  年代     │ 编码             │ 距极限  │ 复杂度
  ─────────┼──────────────────┼─────────┼────────
  1950     │ Hamming           │ ~5 dB  │ O(n)
  1960     │ Reed-Solomon      │ ~3 dB  │ O(n²)
  1970     │ Convolutional+Viterbi│~2 dB │ O(n·2ᵏ)
  1993     │ Turbo Code        │ ~0.7dB │ O(n)
  1996     │ LDPC (重新发现)   │ ~0.1dB │ O(n)
  2008     │ Polar Code        │  0 dB! │ O(n log n)

  60 年的追求: 从 Hamming 到 Polar, 
  人类终于构造出理论上能达到容量的编码!

═══ 实际标准采用 ═══

  标准          │ 编码
  ──────────────┼──────────────────
  WiFi (802.11) │ LDPC + Viterbi
  4G LTE        │ Turbo Code
  5G NR 数据    │ LDPC
  5G NR 控制    │ Polar Code  ← 华为提出!
  DVB-S2 卫星   │ LDPC
  光纤通信      │ LDPC + RS
  USB 3.x       │ 8b/10b → 128b/132b`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
