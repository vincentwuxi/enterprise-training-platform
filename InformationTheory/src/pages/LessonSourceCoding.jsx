import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Huffman 编码', '算术编码', 'LZ 系列', '实用压缩'];

export default function LessonSourceCoding() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">📡 module_03 — 信源编码</div>
      <div className="fs-hero">
        <h1>信源编码：Huffman / 算术编码 / LZ 系列</h1>
        <p>
          信源编码的目标是<strong>用最少的比特表示信息</strong>——
          <strong>Huffman</strong> 给出最优前缀码，
          <strong>算术编码</strong>突破整数码长限制逼近熵极限，
          <strong>LZ 系列</strong>无需概率模型的通用压缩是 gzip/zstd 的核心。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📡 信源编码深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌲 Huffman 编码</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> huffman.py</div>
                <pre className="fs-code">{`# ═══ 前缀码 (Prefix-Free Code) ═══
# 
# 没有任何码字是另一码字的前缀
# → 无需分隔符, 可唯一解码!
#
# 例: {a:0, b:10, c:110, d:111}  ✓ 前缀码
#     {a:0, b:01, c:10}          ✗ (0 是 01 的前缀!)
#
# Kraft 不等式: Σ 2^(-lᵢ) ≤ 1
# → 码字长度存在前缀码的充要条件

# ═══ Huffman 算法 ═══

import heapq
from collections import Counter

def huffman_encode(text):
    """构建 Huffman 树并生成编码表"""
    # 1. 统计频率
    freq = Counter(text)
    
    # 2. 构建最小堆 (优先队列)
    heap = [[cnt, [char, ""]] for char, cnt in freq.items()]
    heapq.heapify(heap)
    
    # 3. 反复合并最小的两个节点
    while len(heap) > 1:
        lo = heapq.heappop(heap)
        hi = heapq.heappop(heap)
        
        # 给左子树加 '0', 右子树加 '1'
        for pair in lo[1:]:
            pair[1] = '0' + pair[1]
        for pair in hi[1:]:
            pair[1] = '1' + pair[1]
        
        # 合并为新节点
        merged = [lo[0] + hi[0]] + lo[1:] + hi[1:]
        heapq.heappush(heap, merged)
    
    # 4. 提取编码表
    codes = {char: code for char, code in heap[0][1:]}
    return codes

# ═══ 示例 ═══
#
# text = "AABBBCCCCDDDDD"
# freq: A=2, B=3, C=4, D=5
#
# 合并过程:
#   (2,A) + (3,B) → (5,AB)
#   (4,C) + (5,AB) → (9,CAB)
#   (5,D) + (9,CAB) → (14,DCAB)
#
# 编码: D=0, C=10, A=110, B=111
# 平均码长: (5×1 + 4×2 + 2×3 + 3×3)/14 = 28/14 = 2.0
# 熵: H = 1.936 bit  →  Huffman 效率 96.8%!

# ═══ 最优性 ═══
#
# Huffman 码是最优前缀码 (最小平均码长)
# 
# H(X) ≤ L_huffman < H(X) + 1
#
# 限制: 每个符号的码长必须是整数!
# → 当概率不是 2 的负幂时, 有间隙
# → 算术编码可以突破这个限制`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 算术编码 (Arithmetic Coding)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> arithmetic.txt</div>
                <pre className="fs-code">{`═══ 算术编码原理 ═══

  把整个消息编码为 [0, 1) 中的一个实数!
  
  不是给每个符号分配码字，而是逐步缩窄区间

═══ 编码过程 ═══

  字母表: {A: 0.6, B: 0.3, C: 0.1}
  累积概率: A:[0, 0.6), B:[0.6, 0.9), C:[0.9, 1.0)

  编码 "BAC":
  
  初始区间: [0, 1)
  
  Step 1: 'B' → 选 [0.6, 0.9)
    low=0.6, high=0.9, range=0.3
  
  Step 2: 'A' → 在 [0.6, 0.9) 中选 A 的比例 [0, 0.6)
    new_low  = 0.6 + 0.3 × 0.0 = 0.6
    new_high = 0.6 + 0.3 × 0.6 = 0.78
    区间: [0.6, 0.78)
  
  Step 3: 'C' → 在 [0.6, 0.78) 中选 C 的比例 [0.9, 1.0)
    new_low  = 0.6 + 0.18 × 0.9 = 0.762
    new_high = 0.6 + 0.18 × 1.0 = 0.78
    区间: [0.762, 0.78)

  输出: 0.762... 的二进制表示的足够位数

═══ 解码过程 ═══

  收到: 0.77 (在 [0.762, 0.78) 中)
  
  0.77 在 [0.6, 0.9) → 'B'
  缩放: (0.77 - 0.6) / 0.3 = 0.567
  0.567 在 [0, 0.6) → 'A'
  缩放: (0.567 - 0) / 0.6 = 0.944
  0.944 在 [0.9, 1.0) → 'C'
  
  解码: "BAC" ✓

═══ 优势 ═══

  1. 逼近熵极限: L → H(X) 当消息足够长
     (Huffman: L ≥ H(X), 可能接近 H(X)+1)
  
  2. 自然处理非二次幂概率
     P('a') = 0.99 时:
     Huffman: 至少 1 bit/符号 (H=0.08!)
     算术:    接近 0.08 bit/符号 ← 巨大优势!
  
  3. 可与自适应模型结合
     PPM, LZMA 等使用算术编码作为后端

═══ 实际实现 ═══

  • 实际使用定点整数避免浮点精度问题
  • 区间缩放技术 (E1/E2/E3 renormalization)
  • 专利曾是推广障碍 (现已过期)
  • 范围编码 (Range Coding): 算术编码的变体, 更快

  现代应用:
  • JPEG 2000, H.265/HEVC (CABAC)
  • 7z/LZMA 使用范围编码
  • ANS (Asymmetric Numeral Systems): 新一代替代`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗜️ LZ 系列 (Lempel-Ziv)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> lz_family.txt</div>
                <pre className="fs-code">{`═══ LZ 系列: 字典编码 ═══

  核心思想: 不需要概率模型!
  利用数据中的重复模式, 建立字典

═══ LZ77 (滑动窗口) ═══

  维护一个滑动窗口 (搜索缓冲区 + 预读缓冲区)
  输出: (距离, 长度, 下一个字符) 三元组

  例: "AABABCAABABC"
  
  位置: A A B A B C A A B A B C
        ↑ 搜索窗口... │ 预读...
  
  编码:
  (0,0,'A') → A
  (1,1,'B') → A (重复) + B
  (3,2,'C') → AB (重复) + C
  (6,6,EOF) → AABABC (重复!)

  → gzip/deflate 基于 LZ77 + Huffman!

═══ LZ78 (显式字典) ═══

  维护显式字典, 输出 (字典索引, 新字符)

  例: "AABABC"
  
  字典       │ 输出
  ───────────┼──────
  1: A       │ (0, A)  → 新词 A
  2: AB      │ (1, B)  → 匹配 A, 扩展为 AB
  3: A       │ (1, ε)  → 匹配 A (如果结尾)
  4: BA      │ ...
  5: BC      │ ...

═══ LZW (Lempel-Ziv-Welch) ═══

  LZ78 的改进, 不需要输出新字符!
  
  初始字典: 所有单字符
  编码过程:
    w = ""
    for c in input:
        if w+c in dict:
            w = w+c
        else:
            output dict[w]
            add w+c to dict
            w = c
    output dict[w]

  Python:
  def lzw_compress(data):
      dict_size = 256
      dictionary = {chr(i): i for i in range(256)}
      result = []
      w = ""
      
      for c in data:
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
      return result

  应用: GIF 图像格式, Unix compress

═══ 渐近最优性 ═══

  LZ78/LZW 定理 (Ziv & Lempel):
  
  lim_{n→∞} L_n / n = h(X)   (概率 1 收敛)
  
  h(X) = 信源的熵率!
  
  → LZ 无需知道源的概率分布, 
     仍然渐近达到最优压缩率!
  → 这就是"通用压缩"的理论基础`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ 实用压缩技术</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> practical.txt</div>
                <pre className="fs-code">{`═══ 现代压缩工具对比 ═══

  工具     │ 算法             │ 压缩率  │ 速度    │ 场景
  ─────────┼──────────────────┼─────────┼─────────┼──────
  gzip     │ LZ77 + Huffman   │ 中等    │ 快      │ Web传输
  bzip2    │ BWT + Huffman    │ 较好    │ 慢      │ 存档
  xz/lzma  │ LZ77 + 范围编码 │ 最好    │ 很慢    │ 分发包
  zstd     │ LZ77 + FSE      │ 好      │ 很快    │ 实时
  lz4      │ LZ77 (简化)     │ 一般    │ 极快    │ 内存/网络
  brotli   │ LZ77 + Huffman  │ 很好    │ 中等    │ Web (Google)
  snappy   │ LZ77 (简化)     │ 一般    │ 极快    │ 数据库

═══ Burrows-Wheeler 变换 (BWT) ═══

  不直接压缩, 而是重排文本使相似字符聚集!
  
  "banana" 的 BWT:
  
  所有旋转排序:
  $banana    →  annb$aa  → 取最后列: "annb$aa"
  a$banan       ↓ 排序     → BWT结果: BWT("banana$") = "annb$aa"
  ...
  
  BWT 后字符更容易出现连续重复 → MTF → Huffman
  
  bzip2 = BWT + MTF + RLE + Huffman

═══ 熵编码比较 ═══

  方法        │ 效率          │ 速度   │ 使用
  ────────────┼───────────────┼────────┼──────
  Huffman     │ H ≤ L < H+1  │ 快     │ JPEG,DEFLATE
  算术编码    │ ≈ H           │ 中     │ JPEG2000,H.265
  ANS/FSE     │ ≈ H           │ 很快   │ zstd, LZFSE
  Range Coding│ ≈ H           │ 快     │ 7z/LZMA

  ANS (Asymmetric Numeral Systems):
  Jarek Duda (2009) 提出
  • 速度接近 Huffman
  • 压缩率接近算术编码
  • Apple LZFSE, Facebook zstd 使用
  → 被认为是"下一代熵编码"

═══ 香农第一定理的实际意义 ═══

  无损压缩极限 = 信源的熵率

  英文文本 (字符级):
    均匀 26 字母: 4.7 bit/char
    实际频率:     4.2 bit/char  (一阶)
    考虑 bigram:  3.6 bit/char  (二阶)
    考虑上下文:   ≈ 1.0 bit/char (Shannon 的估计)
    
  → 英文可以压缩到原来的 ~25%!
  → 实际压缩率取决于模型的精确度

  现代趋势: 用神经网络做概率模型
  → NNCP, cmix 等基于 NN 的压缩器
  → 接近理论极限, 但速度很慢`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
