import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['DFT 基础', 'FFT 算法', '频谱分析', '工业应用'];

export default function LessonFFTSpectral() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🔬 module_06 — FFT 与频谱分析</div>
      <div className="fs-hero">
        <h1>FFT 与频谱分析：DFT / FFT / 卷积定理</h1>
        <p>
          FFT 是"20世纪最重要的算法之一"——将 O(N²) 的 DFT 降到 O(N log N)。
          从<strong>信号处理</strong>到<strong>大整数乘法</strong>到<strong>PDE 求解</strong>，
          FFT 无处不在。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔬 FFT 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌊 离散傅里叶变换 (DFT)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> dft_basics.txt</div>
                <pre className="fs-code">{`═══ 从连续到离散 ═══

  连续 FT:  F(ω) = ∫ f(t) e^{-iωt} dt
  离散 DFT: Xₖ = Σₙ xₙ · e^{-i2πkn/N}

  N 个时域样本 → N 个频域系数

═══ DFT 矩阵形式 ═══

  X = Fₙ · x

  Fₙ 是 N×N 矩阵:
  (Fₙ)ₖₙ = ωₙᵏⁿ,  ωₙ = e^{-i2π/N} (N 次单位根)

  性质:
  • Fₙ 是酉矩阵: Fₙ⁻¹ = (1/N) Fₙ*
  • 逆变换: xₙ = (1/N) Σₖ Xₖ · e^{i2πkn/N}

═══ 频率分辨率 ═══

  采样率: fs (Hz)
  采样点数: N
  
  频率分辨率: Δf = fs / N (Hz)
  最高频率:   fmax = fs / 2 (Nyquist!)
  
  频率轴: f = [0, Δf, 2Δf, ..., (N/2-1)Δf,
               -N/2·Δf, ..., -Δf]
  
  Python: np.fft.fftfreq(N, d=1/fs)

═══ Nyquist 采样定理 ═══

  如果信号最高频率为 fmax:
  采样率必须 fs > 2·fmax

  否则: 混叠 (aliasing)!
  高频被"折叠"到低频 → 不可恢复的信息丢失!

  实际: 通常 fs = 5~10 × fmax
  硬件: 采样前加低通滤波器 (anti-aliasing filter)

═══ 直接计算 DFT ═══

  import numpy as np
  
  def dft_naive(x):
      N = len(x)
      X = np.zeros(N, dtype=complex)
      for k in range(N):
          for n in range(N):
              X[k] += x[n] * np.exp(-2j * np.pi * k * n / N)
      return X
  
  # 复杂度: O(N²) 乘法 → N=10⁶ 时 10¹² 运算 → 太慢!
  
  # 与 np.fft.fft 对比:
  # np.allclose(dft_naive(x), np.fft.fft(x))  → True!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ FFT 算法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> fft_algorithm.py</div>
                <pre className="fs-code">{`# ═══ Cooley-Tukey FFT (1965) ═══
#
# 核心思想: 分而治之!
# 将 N 点 DFT 分解为两个 N/2 点 DFT
#
# Xₖ = Σₙ₌₀^{N/2-1} x₂ₙ ωₙ/₂^{kn}
#     + ωₙᵏ Σₙ₌₀^{N/2-1} x₂ₙ₊₁ ωₙ/₂^{kn}
#    = Eₖ + ωₙᵏ · Oₖ
#
# E = 偶数项的 DFT, O = 奇数项的 DFT
# 每层 O(N), 共 log₂N 层 → 总 O(N log N)!

import numpy as np

def fft_recursive(x):
    N = len(x)
    if N == 1:
        return x.copy()
    
    # 递归: 偶数和奇数下标
    E = fft_recursive(x[0::2])  # 偶数项
    O = fft_recursive(x[1::2])  # 奇数项
    
    # 蝶形运算 (Butterfly)
    W = np.exp(-2j * np.pi * np.arange(N//2) / N)
    X = np.zeros(N, dtype=complex)
    X[:N//2] = E + W * O     # 前半
    X[N//2:] = E - W * O     # 后半 (对称性!)
    
    return X

# 要求: N 必须是 2 的幂!
# 实际: 使用混合基 / Bluestein 算法处理任意 N

# ═══ 性能对比 ═══
#
# N         │ 直接 DFT      │ FFT
# ──────────┼───────────────┼──────────────
# 1,024     │ 1,048,576     │ 10,240
# 1,000,000 │ 10¹²          │ 2 × 10⁷
# 速度比    │               │ 50,000x!

# ═══ numpy FFT 系列 ═══

import numpy as np

x = np.random.randn(1024)

# 一维
X = np.fft.fft(x)           # 复数 FFT
freq = np.fft.fftfreq(len(x), d=1/fs)

# 实数优化 (输入全实数 → 输出对称)
X_real = np.fft.rfft(x)     # 只返回前半! N/2+1 个复数
freq_real = np.fft.rfftfreq(len(x), d=1/fs)

# 二维 (图像!)
X2d = np.fft.fft2(image)
X2d_shift = np.fft.fftshift(X2d)  # 零频移到中心

# 逆变换
x_back = np.fft.ifft(X)     # 精确恢复!

# ═══ 卷积定理 ═══
#
# 时域卷积 = 频域点乘!
# f * g ↔ F · G
#
# 直接卷积: O(N·M)
# FFT 卷积: O((N+M) log(N+M))
#
# → 当 N,M 较大时, FFT 远快于直接卷积!

def fft_convolve(f, g):
    N = len(f) + len(g) - 1
    N_fft = 2**int(np.ceil(np.log2(N)))  # 下一个 2 的幂
    F = np.fft.fft(f, N_fft)
    G = np.fft.fft(g, N_fft)
    return np.real(np.fft.ifft(F * G))[:N]

# scipy.signal.fftconvolve ← 更优化的实现`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 频谱分析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> spectral.py</div>
                <pre className="fs-code">{`# ═══ 功率谱密度 (PSD) ═══
#
# 信号的"频率能量分布"
# PSD: S(f) = |X(f)|² / N

import numpy as np
from scipy import signal

# ═══ 周期图 (Periodogram) ═══
f_axis, Pxx = signal.periodogram(x, fs=1000)
# 问题: 方差大, 噪声很多!

# ═══ Welch 方法 (平均周期图) ═══
f_axis, Pxx = signal.welch(
    x, 
    fs=1000,          # 采样率
    nperseg=256,      # 每段长度
    noverlap=128,     # 重叠
    window='hann',    # 窗函数
)
# → 方差减小, 但频率分辨率降低!

# ═══ 窗函数 (Window Function) ═══
#
# 截断信号 → 频谱泄漏 (spectral leakage)
# 解决: 在截断前乘以窗函数
#
# 窗函数        │ 主瓣宽度 │ 旁瓣衰减 │ 应用
# ──────────────┼──────────┼──────────┼──────
# 矩形 (无窗)   │ 最窄     │ -13 dB   │ 瞬态信号
# Hann          │ 中       │ -31 dB   │ 通用
# Hamming       │ 中       │ -43 dB   │ 语音
# Blackman      │ 宽       │ -58 dB   │ 高动态范围
# Kaiser (β)    │ 可调     │ 可调     │ 需要精确控制

# ═══ 短时傅里叶变换 (STFT) ═══
#
# 非平稳信号: 频率随时间变化!
# → 分段做 FFT → 时频图 (Spectrogram)

f, t, Sxx = signal.spectrogram(x, fs=1000, nperseg=256)
# → 语音识别的基础!

# 时频分辨率的矛盾 (不确定性原理):
# Δt · Δf ≥ 1/(4π)
# 短窗: 好的时间分辨率, 差的频率分辨率
# 长窗: 好的频率分辨率, 差的时间分辨率

# ═══ 零填充 (Zero-Padding) ═══
#
# 在信号末尾补零 → FFT 点数增加
# ≠ 提高频率分辨率! (需要更多数据)
# = 频域插值 → 看起来更平滑
#
# X = np.fft.fft(x, n=4*len(x))  # 4倍零填充

# ═══ 负频率的含义 ═══
#
# 实信号: X(-f) = X*(f) → 负频率是正频率的共轭
# → rfft 只返回正频率 (节省一半!)
#
# 复信号 (IQ 数据): 正负频率独立 → 用完整 fft`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏭 工业应用</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> applications.txt</div>
                <pre className="fs-code">{`═══ 1. 音频处理 ═══

  MP3 编码:
  1. MDCT (改进离散余弦变换, DCT 的一种)
  2. 心理声学模型 (掩蔽效应)
  3. 量化 + 霍夫曼编码

  语音识别 (ASR) 特征:
  Audio → 分帧 → 加窗 → FFT → |.|² → Mel 滤波
  → log → DCT → MFCC 系数!
  
  → Whisper/wav2vec2 直接用 FFT spectrogram

═══ 2. 图像处理 ═══

  JPEG 压缩:
  1. 8×8 块 DCT (不是 FFT, 但原理相同!)
  2. 量化 (丢弃高频)
  3. 熵编码

  频域滤波:
  • 低通: 去噪 (保留低频, 去掉高频噪声)
  • 高通: 边缘检测 (保留高频变化)
  • 带通: 特定频率增强

═══ 3. PDE 谱方法 ═══

  u_t + c·u_x = 0 (对流方程)

  空间用 FFT:
  û_t + c·(ik)·û = 0
  → 在频域变成 ODE! → 精确求解!
  
  优势: 指数收敛 (vs 有限差分多项式收敛)
  限制: 需要周期边界条件

═══ 4. 大整数乘法 ═══

  两个 n 位整数相乘:
  直接: O(n²)
  FFT:  O(n log n)!
  
  方法: 把系数看作多项式 → 卷积 → FFT
  → Python 大整数、RSA 加密底层使用!

═══ 5. 相关性分析 ═══

  互相关: (f ⋆ g)(τ) = Σ f(t) g(t+τ)
  → 通过 FFT: F* · G (共轭!)
  
  应用:
  • 雷达/声纳: 目标检测
  • GPS: 码相关
  • 天文: 信号搜索

═══ FFT 库对比 ═══

  库          │ 语言       │ 特点
  ────────────┼────────────┼──────────
  FFTW        │ C          │ "Fastest FFT in the West"
  numpy.fft   │ Python     │ 通用
  scipy.fft   │ Python     │ 更多功能
  cuFFT       │ CUDA       │ GPU 加速!
  vkFFT       │ Vulkan     │ 跨平台 GPU
  torch.fft   │ PyTorch    │ 支持自动微分!

  GPU FFT 加速:
  N = 2²⁰ (约 100 万点)
  CPU (numpy): ~5 ms
  GPU (cuFFT): ~0.1 ms → 50x 加速!

═══ 实用技巧 ═══

  1. N 取 2 的幂 → FFT 最快
  2. 实数信号用 rfft → 省一半
  3. 多维用 rfftn → 更省
  4. 批量 FFT → 向量化更快
  5. 大规模 → cuFFT (GPU)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
