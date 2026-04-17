import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['线性分组码', 'Reed-Solomon', 'LDPC 码', 'Polar 码'];

export default function LessonErrorCorrection() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📡 module_05 — 纠错编码</div>
      <div className="fs-hero">
        <h1>纠错编码：汉明码 / Reed-Solomon / LDPC / Polar</h1>
        <p>
          从<strong>汉明码</strong>的单比特纠错到<strong>Polar 码</strong>的信道容量可达——
          纠错编码是数字通信、存储、深空探测的命脉，
          每一次通信革命背后都有编码理论的突破。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📡 纠错编码深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 线性分组码与汉明码</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> linear_block.txt</div>
                <pre className="fs-code">{`═══ 线性分组码 (n, k, d) ═══

  n = 码字长度 (编码后)
  k = 信息位数 (编码前)
  d = 最小汉明距离

  编码率: R = k/n
  纠错能力: t = ⌊(d-1)/2⌋
  检错能力: d-1

  生成矩阵: G (k×n), 编码 c = m·G
  校验矩阵: H (r×n), 校验 H·cᵀ = 0

  关系: G·Hᵀ = 0, r = n-k (冗余位数)

═══ 汉明码 Hamming(2ʳ-1, 2ʳ-r-1, 3) ═══

  参数: n = 2ʳ-1,  k = 2ʳ-r-1,  d = 3

  r=3: Hamming(7, 4, 3) → 纠 1 位错误!

  校验矩阵 H (3×7):
  H = [0 0 0 1 1 1 1]    (第4-7列含 bit3)
      [0 1 1 0 0 1 1]    (第2,3,6,7列含 bit2)
      [1 0 1 0 1 0 1]    (第1,3,5,7列含 bit1)

  校验向量 = 错误位置的二进制表示!

  Python 实现:
  import numpy as np

  def hamming_encode(data_bits):
      # data_bits: 4-bit 信息
      # 返回: 7-bit 码字 [p1,p2,d1,p3,d2,d3,d4]
      d1, d2, d3, d4 = data_bits
      p1 = d1 ^ d2 ^ d4  # 位 1,3,5,7
      p2 = d1 ^ d3 ^ d4  # 位 2,3,6,7
      p3 = d2 ^ d3 ^ d4  # 位 4,5,6,7
      return [p1, p2, d1, p3, d2, d3, d4]

  def hamming_decode(received):
      # 计算伴随式 (syndrome)
      s1 = received[0]^received[2]^received[4]^received[6]
      s2 = received[1]^received[2]^received[5]^received[6]
      s3 = received[3]^received[4]^received[5]^received[6]
      
      error_pos = s1 + 2*s2 + 4*s3  # 错误位置
      if error_pos > 0:
          received[error_pos-1] ^= 1  # 纠正!
      
      # 提取信息位
      return [received[2], received[4], 
              received[5], received[6]]

═══ Singleton 界 (MDS 码) ═══

  d ≤ n - k + 1 (Singleton 上界)
  
  达到等号的码称为 MDS (最大距离可分) 码
  → Reed-Solomon 码就是 MDS 码!

═══ 汉明界 ═══

  Σᵢ₌₀ᵗ C(n,i) ≤ 2^(n-k)

  → 限制了给定 n,k 下的最大纠错能力
  → 达到等号: 完美码 (Hamming, Golay)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💿 Reed-Solomon 码</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> reed_solomon.txt</div>
                <pre className="fs-code">{`═══ Reed-Solomon 码 ═══

  在 GF(2ᵐ) (伽罗瓦域) 上操作
  符号 = m bit 的块 (不是单个 bit!)

  RS(n, k, d):
  • n = 2ᵐ - 1 (码字符号数)
  • k = 信息符号数  
  • d = n - k + 1 (MDS! 达到 Singleton 界!)
  • 纠错能力: t = (n-k)/2 = (d-1)/2 个符号!

═══ 编码原理 ═══

  信息多项式: m(x) = m₀ + m₁x + ... + m_{k-1}x^{k-1}

  生成多项式: g(x) = Π(x - αⁱ), i=1..2t
  (α 是 GF(2ᵐ) 的本原元)

  编码: c(x) = m(x)·x^{2t} + [m(x)·x^{2t} mod g(x)]

  → 使 g(x) | c(x), 即 c(α¹) = c(α²) = ... = c(α²ᵗ) = 0

═══ 解码 (Berlekamp-Massey) ═══

  1. 计算伴随式: Sᵢ = r(αⁱ), i=1..2t
  2. 找错误定位多项式 σ(x) (Berlekamp-Massey)
  3. Chien 搜索找错误位置
  4. Forney 算法找错误值
  
  复杂度: O(n·t) 或 O(n·log²(n)) (快速版)

═══ 为什么 RS 码如此成功？ ═══

  1. 突发错误纠正!
     一个符号 = 8 bit → 纠正 t 个符号
     = 纠正长达 t×8 bit 的突发错误!
     (汉明码只能纠 1 bit!)

  2. MDS 性质
     给定冗余度, 纠错能力最强

  3. 系统编码
     信息位原样出现在码字中

═══ 应用场景 ═══

  应用             │ 参数            │ 纠错能力
  ─────────────────┼─────────────────┼──────────
  CD-ROM           │ RS(255,223)     │ 16 符号
  DVD              │ RS(208,192) ×2  │ 错误+擦除
  QR 码            │ RS (多级)       │ 7%~30%
  深空通信 (NASA)  │ RS(255,223)     │ 16 符号
  RAID 6           │ RS (两路校验)   │ 2 磁盘
  数字电视 DVB     │ RS(204,188)     │ 8 符号
  以太网 10GBase-T │ RS + LDPC       │ 混合

  Voyager 2 (1977发射):
  使用 RS(255,223) + 卷积码 = 级联码
  → 从 180 亿公里外传回清晰照片!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🕸️ LDPC 码</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> ldpc.txt</div>
                <pre className="fs-code">{`═══ LDPC (Low-Density Parity-Check) ═══

  Gallager 1962 年发明, 1996 年被重新发现!
  → 如今最接近 Shannon 极限的码之一

  校验矩阵 H 是稀疏的! (大部分元素为 0)

  (n, k) LDPC: H 是 (n-k)×n 的稀疏矩阵
  
  正则 LDPC (d_v, d_c):
  • 每列 d_v 个 1 (变量节点度)
  • 每行 d_c 个 1 (校验节点度)
  
  码率: R = 1 - d_v/d_c

═══ Tanner 图 (二部图表示) ═══

  变量节点 (n 个):  v₁ v₂ v₃ ... vₙ
        │  ╲  │    ╱│
        │   ╲ │   ╱ │
  校验节点 (m 个): c₁  c₂  ...  cₘ

  边: H[j][i] = 1 → cⱼ 和 vᵢ 之间有边

  性质:
  • 无短环 → 性能好 (girth ≥ 6 理想)
  • 度分布设计影响性能 (密度进化优化)

═══ 信念传播解码 (BP / Sum-Product) ═══

  迭代消息传递算法:

  1. 初始化: 每个变量节点用信道观测初始化
  
  2. 变量 → 校验 消息:
     μ_{v→c}(x) = 信道值 × Π_{c'≠c} μ_{c'→v}(x)
  
  3. 校验 → 变量 消息:
     μ_{c→v}(x) = Σ_{~v} [校验约束 × Π_{v'≠v} μ_{v'→c}]
  
  4. 重复 2-3 直到收敛或达到最大迭代次数
  
  5. 硬判决: 用所有消息的乘积做判决

  复杂度: O(迭代数 × 边数) = O(I × n × d_v)
  → 线性复杂度! (比 RS 的 O(n²) 好!)

═══ 性能 ═══

  在 AWGN 信道上:
  
  码率 R=1/2, n=10⁶:
  → BER=10⁻⁵ 时距 Shannon 极限仅 0.04 dB!

  优化方法:
  • 不规则 LDPC: 用密度进化优化度分布
  • EXIT 图: 可视化解码器收敛
  • Protograph LDPC: 结构化设计, 利于硬件

═══ 标准采用 ═══

  标准            │ 码率       │ 码长
  ────────────────┼────────────┼──────
  WiFi 6 (11ax)   │ 1/2~5/6   │ ~1944
  5G NR 数据信道  │ 1/5~8/9   │ ~66~8448
  DVB-S2 卫星电视 │ 1/4~9/10  │ 64800
  10GBase-T 以太网│ ~0.84     │ 2048
  CCSDS 深空      │ 1/2~7/8   │ ~16384`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>❄️ Polar 码 (极化码)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> polar.txt</div>
                <pre className="fs-code">{`═══ Polar 码: 第一个可证明达到容量的编码! ═══

  Erdal Arıkan, 2008 (土耳其 Bilkent 大学)

  核心思想: 信道极化 (Channel Polarization)
  
  将 n 个独立同分布信道通过线性变换
  变成 n 个不同质量的虚拟信道:
  
  部分信道 → 完美 (容量 → 1)  "冻结位"放已知值
  部分信道 → 无用 (容量 → 0)  "信息位"放真实数据

═══ 信道极化过程 ═══

  基本变换 (n=2):
  
  u₁ ──⊕──→ x₁ = u₁ ⊕ u₂
       │
  u₂ ──┘──→ x₂ = u₂

  好信道 W⁺: 知道 (y₁,y₂) 解码 u₂ → 容量 > I(W)
  差信道 W⁻: 知道 (y₁,y₂) 解码 u₁ → 容量 < I(W)

  递归应用:
  n=2: 2 个虚拟信道
  n=4: 4 个虚拟信道 (更极化)
  n=8: 8 个虚拟信道
  ...
  n→∞: 每个虚拟信道要么完美要么无用!

═══ 编码与解码 ═══

  编码:
  x = u · Gₙ
  Gₙ = B_n · F^{⊗n}
  F = [1 0; 1 1]  (基本核矩阵)
  F^{⊗n} = F ⊗ F ⊗ ... ⊗ F  (n 次 Kronecker 积)

  解码: Successive Cancellation (SC)
  按顺序解码 u₁, u₂, ..., uₙ
  每个决策基于之前已解码的位

  SC List (SCL):
  保留 L 个最可能的路径
  + CRC 辅助选择 → 性能大幅提升!

  复杂度: O(n log n)  → 非常高效!

═══ 为什么 Polar 码重要? ═══

  1. 理论意义:
     第一个显式构造的容量可达码!
     (LDPC/Turbo 是实验发现, 理论上接近但未证明)

  2. 编解码复杂度:
     编码: O(n log n)
     SC 解码: O(n log n)
     → 比 LDPC 的迭代解码更可预测

  3. 有限码长挑战:
     原始 SC: 短码长性能不好
     SCL + CRC: 短码长也很好!

═══ 5G 标准之争 ═══

  2016 年 3GPP 会议:
  • 数据信道: LDPC 胜出 (Qualcomm 主推)
  • 控制信道: Polar 胜出 (华为主推)

  原因:
  • LDPC: 高吞吐量, 成熟IP, 适合大数据块
  • Polar: 灵活码长, 低延迟, 适合短控制消息

═══ Polar 码家族进展 ═══

  技术          │ 解决的问题
  ──────────────┼──────────────────────
  SC            │ 基本解码 (性能一般)
  SCL           │ 列表解码 (性能大幅提升)
  SCL-CRC       │ CRC 辅助 (接近 ML 性能)
  CA-SCL        │ CRC-Aided SCL (5G 采用)
  PAC (2019)    │ 极化+卷积 (超越 LDPC?)
  
  PAC (Polarization-Adjusted Convolutional):
  Arıkan 2019 年新提出 → 短码长性能超 LDPC!
  → 可能是下一代标准的候选`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
