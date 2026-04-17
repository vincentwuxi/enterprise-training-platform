import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['天气AI革命', 'GraphCast', 'GenCast', '气候模拟'];

export default function LessonWeatherClimate() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔬 module_04 — AI 天气与气候</div>
      <div className="fs-hero">
        <h1>AI 天气与气候：GraphCast / GenCast / 气候变化模拟</h1>
        <p>
          2023-2024 年，DeepMind 的 <strong>GenCast</strong> 在 15 天天气预报中超越了
          欧洲中期天气预报中心 (ECMWF) 的 IFS 系统——这是有 40 年积累的全球黄金标准。
          华为的 <strong>Pangu-Weather</strong> 在 3D 全球预报中表现卓越。
          本模块解析 AI 如何颠覆数值天气预报 (NWP)，以及 AI 在气候变化预测中的前沿应用。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌦️ AI 天气与气候</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ AI 天气预报：范式革命</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> weather_revolution</div>
                <pre className="fs-code">{`# 天气预报的范式革命: 物理模型 → AI

# ═══ 传统数值天气预报 (NWP) ═══
# 50年发展, 全球数十亿美元投入
NWP = {
    "原理": "求解大气动力学方程(Navier-Stokes)",
    "典型系统": {
        "ECMWF IFS": "欧洲, 全球黄金标准",
        "GFS": "美国 NOAA",
        "GRAPES": "中国气象局",
    },
    "计算成本": {
        "ECMWF": "数千CPU核心, 数小时",
        "分辨率": "9km网格, 137垂直层",
        "产出": "10天预报, 每天2次",
    },
    "局限": [
        "计算极其昂贵 (超级计算机)",
        "参数化方案不完美 (对流/云微物理)",
        "初始场误差快速增长 (蝴蝶效应)",
        "不确定性量化需要集合预报(50+成员)",
    ],
}

# ═══ AI 天气预报的优势 ═══
AI_weather = {
    "速度": "单GPU推理 < 1分钟 vs 数小时",
    "成本": "1/1000 的计算成本",
    "精度": "中期预报已匹配或超越NWP",
    "集合": "秒级生成集合成员",
}

# 主要 AI 天气模型对比:
# ┌─────────────┬──────────┬─────────┬──────────┬──────────┐
# │ 模型         │ 机构      │ 架构     │ 分辨率    │ 突破     │
# ├─────────────┼──────────┼─────────┼──────────┼──────────┤
# │ FourCastNet │ NVIDIA   │ AFNO    │ 0.25°    │ 首个AI模型│
# │ Pangu-Wea   │ 华为     │ 3D-ViT  │ 0.25°    │ 3D建模   │
# │ GraphCast   │ DeepMind │ GNN     │ 0.25°    │ 超越HRES │
# │ FengWu      │ 上海AI Lab│ Trans  │ 0.25°    │ 超长期   │
# │ GenCast     │ DeepMind │ Diffusion│ 0.25°   │ 概率预报 │
# │ Aurora      │ Microsoft│ Trans   │ 0.1°     │ 高分辨率 │
# │ NeuralGCM   │ Google   │ Hybrid  │ 可变     │ 物理+ML │
# └─────────────┴──────────┴─────────┴──────────┴──────────┘

# 速度对比:
# 10天全球预报:
# ECMWF IFS (物理): ~2小时 (数千CPU)
# GraphCast (AI):    ~1分钟 (单TPU v4)
# GenCast (AI):      ~8分钟 (单TPU v5)
# → 加速 1000x+`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 GraphCast 架构解析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> graphcast_arch</div>
                <pre className="fs-code">{`# GraphCast: 图神经网络中期天气预报

# 论文: "Learning skillful medium-range global
#        weather forecasting" (Science, 2023)

# 核心思想:
# 将地球大气视为图结构 → GNN预测时间演化

# ═══ 输入 ═══
input_data = {
    "大气变量": [
        "温度 (6 层)", "湿度 (6 层)",
        "U/V 风速 (6 层)", "位势高度 (6 层)",
        "垂直速度 (6 层)",
    ],
    "地面变量": [
        "2m温度", "10m U/V风", "海平面气压",
        "总降水量",
    ],
    "强迫变量": "TOA太阳辐射, 经纬度, 时间",
    "网格": "0.25° × 0.25° (约28km) = ~1M 节点",
    "输入": "t 和 t-6h 两个时刻的状态",
}

# ═══ 图构建 ═══
graph_construction = """
三种图结构:

1. Grid2Mesh (网格→网格)
   ├── 经纬度网格点 → 每个点连接邻近点
   └── 局部连接, 扁平化网格

2. Mesh (多尺度网格)
   ├── 从 M0 (最细) 到 M6 (最粗)
   ├── 每级 mesh 递归细分 → icosahedron
   ├── 多尺度消息传递 → 捕捉大尺度模式
   └── 类似 U-Net 的编码-解码

3. Mesh2Grid (网格→网格)
   └── 多尺度特征回映射到经纬度网格
"""

# ═══ 核心架构 ═══
architecture = """
┌──────────────────────────────────┐
│ 输入: [N_grid × C_in]            │
│ (当前+前6h的大气状态)             │
└───────────┬──────────────────────┘
            ↓
┌───────────┴──────────────────────┐
│ Grid → Mesh 编码器               │
│ (从经纬度网格映射到多尺度网格)    │
└───────────┬──────────────────────┘
            ↓
┌───────────┴──────────────────────┐
│ GNN 处理器 (16 层消息传递)        │
│ ├── 在多尺度 mesh 上消息传递      │
│ ├── 边特征: 距离 + 方向            │
│ ├── 节点更新: MLP                  │
│ └── 全局无位置编码(位置靠坐标)     │
└───────────┬──────────────────────┘
            ↓
┌───────────┴──────────────────────┐
│ Mesh → Grid 解码器               │
│ (从网格映射回经纬度)              │
└───────────┬──────────────────────┘
            ↓
┌───────────┴──────────────────────┐
│ 输出: 残差 Δx = x(t+6h) - x(t)  │
│ → x(t+6h) = x(t) + Δx           │
└──────────────────────────────────┘
"""

# 自回归预报:
# x(0) → x(6h) → x(12h) → ... → x(10d)
# 每步预测 6 小时, 40 步 = 10 天

# 训练数据: ERA5 再分析 (1979-2017)
# 验证: 2018 全年 vs ECMWF HRES
# 结果: 90%+ 变量/层/提前期优于 HRES`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌪️ GenCast: 扩散模型概率天气预报</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> gencast_arch</div>
                <pre className="fs-code">{`# GenCast: 概率天气预报的突破

# 论文: "GenCast: Diffusion-based ensemble
#        forecasting for medium-range weather"
#        (Nature, 2024)

# GraphCast 的局限:
# ├── 确定性预报 → 只有一个预测结果
# ├── 无法量化不确定性
# ├── 极端天气倾向于"平均化"
# └── 气象业务需要集合预报(概率分布)

# GenCast 创新:
# ├── 扩散模型 → 概率预报
# ├── 每次采样 → 不同的预报成员
# ├── N次采样 → 集合预报 → 不确定性量化
# └── 超越 ECMWF ENS (50成员集合)

# ═══ 核心架构 ═══
GenCast_arch = """
条件扩散模型:
  输入: x(t), x(t-12h) [当前和前12h状态]
  目标: 学习 p(x(t+12h) | x(t), x(t-12h))
  
去噪过程:
  x_noisy(T) → x_noisy(T-1) → ... → x_clean(0)
  
  每步去噪使用:
  ├── 条件: 当前大气状态
  ├── 网络: GNN (类似GraphCast)
  ├── 时间步嵌入: σ(t) encoding
  └── 输出: 预测的噪声 ε
"""

# ═══ 关键结果 ═══
results = {
    "vs ECMWF ENS (50成员集合)": {
        "CRPS 指标": "97.2% 的变量/层/提前期更好",
        "热带气旋追踪": "命中率更高, 虚报率更低",
        "极端天气": "更好的尾部概率估计",
    },
    "vs ECMWF HRES (高分辨率确定性)": {
        "RMSE": "大多数变量更好",
    },
    "速度": {
        "ECMWF ENS": "50成员 × 数小时 = 超算",
        "GenCast": "50成员 × ~8分钟 = 单TPU",
    },
}

# ═══ 应用场景 ═══
applications = {
    "短中期天气预报": "1-15天, 6/12小时时间步",
    "热带气旋预警": "路径+强度概率预测",
    "极端降水": "概率分布→风险等级",
    "风能预测": "风速概率→电力调度",
    "航空气象": "颠簸/结冰概率预报",
}

# 天气AI的挑战与未来:
# ├── 分辨率: 25km → 需要 <5km (强对流)
# ├── 长期: 季节/年际预测仍需突破
# ├── 可解释性: 为什么这样预报?
# ├── 极端事件: 罕见事件训练样本少
# ├── 物理一致性: 质量/能量守恒
# └── 业务化: 国家气象局采纳中 (ECMWF, NOAA)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌍 AI 气候变化模拟</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> climate_modeling</div>
                <pre className="fs-code">{`# AI 在气候科学中的应用

# 气候 vs 天气:
# 天气: 短期大气状态 (小时~天)
# 气候: 长期统计特征 (年~世纪)
# → 不同的物理过程和预测目标

# ═══ AI 气候应用 ═══

# 1. 气候模型加速
climate_emulation = {
    "ClimaX (Microsoft)": {
        "方法": "视觉Transformer预训练",
        "功能": "天气预报+气候投影+降尺度",
        "创新": "跨任务迁移学习",
    },
    "ACE (NVIDIA)": {
        "方法": "自回归气候模拟器",
        "功能": "10年级别稳定积分",
        "挑战": "长期漂移控制",
    },
    "NeuralGCM (Google)": {
        "方法": "物理+ML混合模型",
        "功能": "统一天气和气候预测",
        "创新": "ML替代参数化方案",
    },
}

# 2. 参数化方案替代
# 传统GCM中最不确定的部分:
# ├── 对流参数化 → ML学习对流输运
# ├── 云微物理 → ML学习云的形成/演化
# ├── 辐射传输 → ML加速辐射计算
# └── 地表过程 → ML学习植被/土壤交互

# 3. 降尺度 (Downscaling)
downscaling = {
    "统计降尺度": "GCM粗分辨率→局地高分辨率",
    "方法": "扩散模型/GAN/超分辨率",
    "应用": "区域气候影响评估",
    "工具": ["SDXL-based", "conditional diffusion"],
}

# 4. 极端事件归因
attribution = {
    "目标": "气候变化使极端事件概率增加多少?",
    "方法": "反事实模拟(有/无人为排放对比)",
    "AI": "加速大量反事实模拟",
}

# 5. 碳循环/地球系统
earth_system = {
    "碳吸收预测": "ML预测海洋/陆地碳汇",
    "冰盖动力学": "ML预测格陵兰/南极冰盖演化",
    "海洋环流": "ML辅助海洋模式",
    "生态系统响应": "ML预测物种分布变化",
}

# AI 气候模型的独特挑战:
# ┌──────────────────┬──────────────────┐
# │ 天气预报          │ 气候模拟          │
# ├──────────────────┼──────────────────┤
# │ 初值问题          │ 边界值问题        │
# │ 天~周尺度         │ 年~世纪尺度       │
# │ 精度导向          │ 统计特征导向      │
# │ 训练数据充足      │ 有物理验证         │
# │ 评估简单(vs观测)  │ 评估困难(未来无观测)│
# │ 已有成功案例      │ 仍在研究中        │
# └──────────────────┴──────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
