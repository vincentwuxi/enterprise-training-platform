import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['文本压缩引擎', '信道模拟器', '熵估计实验', '综合实战'];

export default function LessonInfoProject() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📡 module_08 — 实战项目</div>
      <div className="fs-hero">
        <h1>实战项目：文本压缩引擎 + 信道模拟器</h1>
        <p>
          将全部信息论知识融会贯通——
          从零构建<strong>文本压缩引擎</strong>（Huffman → LZW → 算术编码），
          搭建<strong>信道模拟器</strong>（BSC/AWGN + LDPC 编解码），
          并用<strong>实验</strong>验证 Shannon 极限。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📡 实战项目深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗜️ 文本压缩引擎</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> compressor.py</div>
                <pre className="fs-code">{`# ═══ 项目: 多算法文本压缩引擎 ═══
#
# 目标: 实现并对比 Huffman, LZW, 算术编码
# 评估指标: 压缩率, 速度, 与熵的差距

import heapq
import struct
from collections import Counter, defaultdict

# ═══ 1. 信源分析模块 ═══

class SourceAnalyzer:
    """分析文本的信息论特性"""
    
    def __init__(self, text):
        self.text = text
        self.freq = Counter(text)
        self.total = len(text)
        self.probs = {c: n/self.total for c, n in self.freq.items()}
    
    def entropy(self):
        """计算一阶熵 H(X)"""
        import math
        return -sum(p * math.log2(p) for p in self.probs.values())
    
    def bigram_entropy(self):
        """计算二阶熵 H(X₂|X₁)"""
        bigrams = Counter(zip(self.text[:-1], self.text[1:]))
        # H(X₁,X₂) - H(X₁)
        ...
    
    def redundancy(self):
        """冗余度 = 1 - H/log₂|Σ|"""
        import math
        return 1 - self.entropy() / math.log2(len(self.freq))
    
    def report(self):
        return {
            'alphabet_size': len(self.freq),
            'text_length': self.total,
            'entropy_bits': self.entropy(),
            'max_entropy': f'{__import__("math").log2(len(self.freq)):.3f}',
            'redundancy': f'{self.redundancy():.1%}',
            'theoretical_min': f'{self.entropy() * self.total / 8:.1f} bytes',
        }

# ═══ 2. Huffman 编码器 ═══

class HuffmanCodec:
    """完整的 Huffman 编解码器"""
    
    def encode(self, text):
        # 统计频率
        freq = Counter(text)
        
        # 构建优先队列
        heap = [[cnt, [char, ""]] for char, cnt in freq.items()]
        heapq.heapify(heap)
        
        while len(heap) > 1:
            lo = heapq.heappop(heap)
            hi = heapq.heappop(heap)
            for pair in lo[1:]:
                pair[1] = '0' + pair[1]
            for pair in hi[1:]:
                pair[1] = '1' + pair[1]
            heapq.heappush(heap, [lo[0]+hi[0]] + lo[1:] + hi[1:])
        
        codes = {c: code for c, code in heap[0][1:]}
        
        # 编码
        encoded = ''.join(codes[c] for c in text)
        
        return {
            'codes': codes,
            'encoded_bits': len(encoded),
            'avg_code_length': len(encoded) / len(text),
            'compression_ratio': len(text)*8 / len(encoded),
        }

# ═══ 3. LZW 编码器 ═══

class LZWCodec:
    """LZW 压缩/解压缩"""
    
    def compress(self, text):
        dict_size = 256
        dictionary = {chr(i): i for i in range(256)}
        result = []
        w = ""
        
        for c in text:
            wc = w + c
            if wc in dictionary:
                w = wc
            else:
                result.append(dictionary[w])
                dictionary[wc] = dict_size
                dict_size += 1
                w = c
        if w:
            result.append(dictionary[w])
        
        return {
            'codes': result,
            'dict_size': dict_size,
            'output_symbols': len(result),
            'compression_ratio': len(text) / (len(result) * 2),
        }
    
    def decompress(self, codes):
        dict_size = 256
        dictionary = {i: chr(i) for i in range(256)}
        result = [dictionary[codes[0]]]
        w = result[0]
        
        for code in codes[1:]:
            if code in dictionary:
                entry = dictionary[code]
            elif code == dict_size:
                entry = w + w[0]
            result.append(entry)
            dictionary[dict_size] = w + entry[0]
            dict_size += 1
            w = entry
        
        return ''.join(result)

# ═══ 4. 对比实验 ═══
#
# texts = {
#     '英文文学': open('shakespeare.txt').read(),
#     '中文新闻': open('news_cn.txt').read(),
#     'DNA序列':  open('dna.txt').read(),
#     '随机数据': ''.join(random.choices('ACGT', k=10000)),
# }
#
# 预期结果:
# ──────────────┬──────────┬──────────┬──────────
# 数据类型      │ Huffman  │ LZW      │ 算术编码
# ──────────────┼──────────┼──────────┼──────────
# 英文文学      │ ~4.5:1   │ ~3.5:1   │ ~4.8:1
# 中文新闻      │ ~1.8:1   │ ~2.5:1   │ ~1.9:1
# DNA (iid)     │ ~4.0:1   │ ~2.0:1   │ ~4.0:1
# 随机数据      │ ~1.0:1   │ ~0.8:1   │ ~1.0:1
# ──────────────┴──────────┴──────────┴──────────
# 
# 关键发现:
# 1. 随机数据不可压缩! (H ≈ log₂|Σ|)
# 2. 文学作品冗余度高 → 压缩效果好
# 3. LZW 对长重复模式效果好
# 4. 算术编码最接近熵极限`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📡 信道模拟器</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> channel_simulator.py</div>
                <pre className="fs-code">{`# ═══ 项目: 信道模拟与纠错编码 ═══

import numpy as np

# ═══ 1. 信道模型 ═══

class BSC:
    """二元对称信道"""
    def __init__(self, p):
        self.p = p  # 翻转概率
    
    def transmit(self, bits):
        noise = np.random.rand(len(bits)) < self.p
        return np.bitwise_xor(bits, noise.astype(int))
    
    def capacity(self):
        if self.p == 0 or self.p == 1:
            return 1.0
        return 1 + self.p*np.log2(self.p) + (1-self.p)*np.log2(1-self.p)

class AWGN:
    """加性白高斯噪声信道"""
    def __init__(self, snr_db):
        self.snr_db = snr_db
        self.snr_linear = 10**(snr_db/10)
    
    def transmit(self, symbols):
        # BPSK: 0 → +1, 1 → -1
        signal = 1 - 2*symbols.astype(float)
        noise_std = 1 / np.sqrt(2 * self.snr_linear)
        noise = np.random.randn(len(symbols)) * noise_std
        return signal + noise  # 返回软信息
    
    def capacity(self):
        return 0.5 * np.log2(1 + self.snr_linear)

# ═══ 2. 简易 Hamming(7,4) 编解码器 ═══

class Hamming74:
    """Hamming(7,4) 编解码器"""
    
    G = np.array([  # 生成矩阵 (4×7)
        [1,1,0,1,0,0,0],
        [0,1,1,0,1,0,0],
        [1,1,1,0,0,1,0],
        [1,0,1,0,0,0,1],
    ])
    
    H = np.array([  # 校验矩阵 (3×7)
        [1,0,1,1,1,0,0],
        [0,1,1,1,0,1,0],
        [1,1,1,0,0,0,1],
    ])
    
    def encode(self, data):
        """data: (N, 4) → codeword: (N, 7)"""
        return (data @ self.G) % 2
    
    def decode(self, received):
        """received: (N, 7) → data: (N, 4)"""
        syndrome = (received @ self.H.T) % 2
        error_pos = syndrome @ np.array([1, 2, 4])
        
        corrected = received.copy()
        for i, pos in enumerate(error_pos):
            if pos > 0:
                corrected[i, pos-1] ^= 1
        
        return corrected[:, [2, 4, 5, 6]]  # 信息位

# ═══ 3. BER vs SNR 实验 ═══

def ber_experiment():
    """绘制 BER vs SNR 曲线"""
    snr_range = np.arange(0, 12, 0.5)
    n_bits = 100000
    
    results = {'uncoded': [], 'hamming': []}
    
    for snr in snr_range:
        channel = AWGN(snr)
        
        # 无编码
        bits = np.random.randint(0, 2, n_bits)
        rx = channel.transmit(bits)
        decoded = (rx < 0).astype(int)
        results['uncoded'].append(np.mean(bits != decoded))
        
        # Hamming(7,4)
        hamming = Hamming74()
        data = np.random.randint(0, 2, (n_bits//4, 4))
        coded = hamming.encode(data)
        rx = channel.transmit(coded.flatten())
        rx_hard = (rx < 0).astype(int).reshape(-1, 7)
        decoded = hamming.decode(rx_hard)
        results['hamming'].append(np.mean(data != decoded))
    
    return snr_range, results

# 预期输出:
# SNR=0dB:  无编码 BER≈0.08, Hamming BER≈0.03
# SNR=4dB:  无编码 BER≈0.01, Hamming BER≈0.001
# SNR=8dB:  无编码 BER≈10⁻⁴, Hamming BER≈10⁻⁷
#
# → Hamming 在中等 SNR 提供约 2dB 编码增益
# → 但距 Shannon 极限还有 ~3dB!
# → LDPC/Polar 可以将差距缩小到 <0.5dB`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧪 熵估计实验</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> entropy_experiments.py</div>
                <pre className="fs-code">{`# ═══ 实验: 信息量化与估计 ═══

import numpy as np
from collections import Counter
import math

# ═══ 实验1: 英文文本的熵率层次 ═══

def text_entropy_layers(text):
    """分析文本在不同上下文深度的熵率"""
    
    results = {}
    
    # 零阶: 均匀假设
    alphabet = set(text)
    results['zero_order'] = math.log2(len(alphabet))
    
    # 一阶: 字符频率
    freq = Counter(text)
    total = len(text)
    h1 = -sum((n/total)*math.log2(n/total) for n in freq.values())
    results['first_order'] = h1
    
    # 二阶: bigram 条件熵 H(X₂|X₁)
    bigrams = Counter(zip(text[:-1], text[1:]))
    h2 = 0
    for (c1, c2), count in bigrams.items():
        p_joint = count / (total - 1)
        p_c1 = freq[c1] / total
        h2 -= p_joint * math.log2(p_joint / p_c1)
    results['second_order'] = h2
    
    # 三阶: trigram H(X₃|X₁,X₂)
    # ... (类似方法)
    
    return results

# 预期结果 (英文文本):
# ──────────────────────────────────
# 阶数    │ 熵 (bit/字符) │ 说明
# ────────┼───────────────┼───────
# 零阶    │ 4.70          │ 均匀 26 字母
# 一阶    │ 4.18          │ 考虑频率 (e 最常见)
# 二阶    │ 3.56          │ 考虑 bigram (th, he, in)
# 三阶    │ 3.10          │ 考虑 trigram (the, and)
# Shannon │ ~1.0-1.5      │ 考虑全部上下文
# ──────────────────────────────────

# ═══ 实验2: KL 散度可视化 ═══

def kl_visualization():
    """正向 KL vs 反向 KL 的行为差异"""
    
    # 真实分布: 双峰高斯
    def p(x):
        return 0.5*gaussian(x, -2, 1) + 0.5*gaussian(x, 2, 1)
    
    # 正向 KL: D(P||Q) → Q 覆盖 P 所有模式
    # → Q 变宽, 覆盖两个峰 (mode-covering)
    # 用于: MLE, 变分推断 (平均场)
    
    # 反向 KL: D(Q||P) → Q 只抓住一个模式
    # → Q 集中在一个峰 (mode-seeking)
    # 用于: EP, wake-sleep (只学主要模式)
    
    # 这解释了:
    # VAE 生成模糊图像: 使用 KL(q||p) → mode-covering
    # GAN 生成清晰但多样性差: 接近 mode-seeking

# ═══ 实验3: 压缩即预测 ═══

def compression_is_prediction():
    """验证压缩率与预测准确度的关系"""
    
    # Shannon 洞察: 好的概率模型 = 好的压缩!
    # → 在线压缩 = 序列预测
    
    # 步骤:
    # 1. 对文本做字符级预测 P(xₜ|x₁,...,x_{t-1})
    # 2. 计算交叉熵: H = -1/T Σ log₂ P(xₜ|history)
    # 3. 交叉熵 = 压缩率 (bit/char)!
    
    # 模型对比:
    # ─────────────────────────────────────
    # 模型              │ 交叉熵  │ 压缩率
    # ──────────────────┼─────────┼───────
    # 均匀猜测          │ 4.70    │ 4.70
    # 频率模型 (1-gram) │ 4.18    │ 4.18
    # 2-gram            │ 3.56    │ 3.56
    # 5-gram + KN       │ 2.00    │ 2.00
    # LSTM              │ 1.30    │ 1.30
    # Transformer (GPT) │ 0.94    │ 0.94   ← 最好!
    # ─────────────────────────────────────
    #
    # → LLM 是最好的文本压缩器!
    # → 反过来: 更好的压缩 = 更好的语言理解
    pass

# ═══ 实验4: Shannon 游戏 ═══

def shannon_game():
    """让人猜测下一个字符, 估计英文的真实熵"""
    
    # Shannon 1951 年的实验:
    # 给人看一段文本, 猜下一个字符
    # 需要猜几次? → 估计英文的熵率
    
    # 结果: H ≈ 1.0 ~ 1.5 bit/char
    # (远低于字符频率给出的 4.18!)
    # → 英文有大量冗余, 人脑利用了上下文
    pass`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏆 综合实战与课程总结</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> capstone.txt</div>
                <pre className="fs-code">{`═══ 综合项目: 端到端通信系统 ═══

  完整流程:
  
  "Hello!" → 信源编码 → 信道编码 → 调制
     → [AWGN 信道] →
  解调 → 信道解码 → 信源解码 → "Hello!"

  各模块选择:
  ────────────────────────────────────────
  信源编码:  Huffman / 算术编码
  信道编码:  Hamming(7,4) / 简化 LDPC
  调制:      BPSK (最简单)
  信道:      AWGN, SNR 可调
  ────────────────────────────────────────

  性能指标:
  • 信源编码效率: avg_bits/char vs H(X)
  • 信道编码增益: BER(coded) / BER(uncoded)
  • 整体吞吐量: 有效信息 bit/秒
  • 频谱效率:    bit/秒/Hz

═══ 课程知识图谱 ═══

  信息论分支     │ 核心定理/工具        │ 应用
  ───────────────┼──────────────────────┼─────────
  熵与互信息     │ H, I, D_KL          │ ML 损失
  信源编码       │ 香农第一定理          │ 数据压缩
  信道编码       │ 香农第二定理          │ 可靠通信
  率失真         │ R(D) 函数            │ 有损压缩
  网络信息论     │ 多用户信道容量        │ 5G/6G
  信息几何       │ Fisher 信息          │ 自然梯度

═══ 核心公式总结 ═══

  公式                      │ 含义
  ──────────────────────────┼─────────────────
  H(X) = -Σ P log P         │ 不确定性度量
  I(X;Y) = H(X) - H(X|Y)   │ 共享信息量
  D_KL(P||Q) = Σ P log P/Q  │ 分布距离
  C = max I(X;Y)            │ 信道极限
  R(D) = min I(X;X̂)        │ 有损压缩极限
  C_AWGN = ½log(1+SNR)      │ 高斯信道容量

═══ 从 Shannon 到 AI 的思想线索 ═══

  1948  │ Shannon 信息论 → 信息的数学化
  1950s │ Hamming/Reed-Solomon → 纠错编码
  1960s │ Kolmogorov 复杂度 → 信息的极限
  1970s │ Arimoto-Blahut → 容量计算算法
  1993  │ Turbo 码 → 接近 Shannon 极限!
  1996  │ LDPC 重新发现 → 实用容量码
  2006  │ 信息瓶颈 → 深度学习理论
  2008  │ Polar 码 → 第一个容量可达码
  2013  │ VAE → 信息论 + 生成模型
  2016  │ InfoGAN → 互信息 + GAN
  2020  │ SimCLR/CLIP → 对比学习
  2023  │ LLM → "压缩即智能"?

  Shannon 的遗产:
  "信息是可以量化、传输、存储和处理的量。"
  
  这个简单的洞察改变了整个世界。
  从互联网到 5G, 从 JPEG 到 GPT,
  信息论的思想无处不在——
  它是数字时代最优美的数学。

═══ 推荐深入学习资源 ═══

  教材:
  • Cover & Thomas "Elements of Information Theory"
  • MacKay "Information Theory, Inference and Learning"
  • Polyanskiy & Wu "Information Theory: From Coding to Learning"

  视频:
  • MIT 6.441 (Zheng/Medard)
  • Stanford EE376A (Cover)

  工具:
  • dit (Python): 离散信息论计算
  • ldpc (Python): LDPC 编解码
  • aff3ct: 信道编码仿真框架

  前沿:
  • 神经网络压缩 (Neural Compression)
  • 信息论 + 因果推断
  • 量子信息论`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
