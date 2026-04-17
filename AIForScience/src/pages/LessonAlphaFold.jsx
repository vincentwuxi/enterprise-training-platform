import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['蛋白质折叠', 'AlphaFold 架构', '应用实战', '开源生态'];

export default function LessonAlphaFold() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔬 module_02 — AlphaFold 深度</div>
      <div className="fs-hero">
        <h1>AlphaFold：从蛋白质折叠到诺贝尔奖的 AI 突破</h1>
        <p>
          2024 年诺贝尔化学奖授予 Demis Hassabis 和 John Jumper——表彰 AlphaFold 对<strong>蛋白质结构预测</strong>的革命性贡献。
          蛋白质折叠问题困扰了生物学家 50 年，AlphaFold 在 CASP14 上以碾压性精度证明 AI 可以解决这一"大挑战"。
          本模块深入解析从 Anfinsen 假说到 AlphaFold 3 的完整技术演进，
          包括<strong>MSA Transformer、Evoformer、IPA 模块</strong>的架构设计。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧬 AlphaFold 深度解析</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧪 蛋白质折叠问题</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> protein_folding_problem</div>
                <pre className="fs-code">{`# 蛋白质折叠: 生物学的 "大挑战"

# Anfinsen 假说 (1972 诺贝尔化学奖):
# "蛋白质的三维结构完全由其氨基酸序列决定"
# 
# 序列 (1D) → 结构 (3D) → 功能
# MVLSPADKTNVKAAWGKVGAHAGEYGAE...
#         ↓ 折叠
#     [3D 蛋白质结构]
#         ↓
#     [生物学功能: 催化/运输/信号传导/...]

# 为什么这么难?
# ├── Levinthal 悖论 (1969):
# │   一个 100 残基蛋白有 ~3^198 种构象
# │   穷举需要时间 > 宇宙年龄
# │   但蛋白质在毫秒内完成折叠!
# │
# ├── 能量面极其复杂:
# │   ├── 氢键 / 范德华力 / 静电相互作用
# │   ├── 疏水效应 (折叠的主要驱动力)
# │   ├── 溶剂效应 (水分子的熵变)
# │   └── 全局最小自由能 = 天然态
# │
# └── 实验测定代价极高:
#     ├── X射线晶体学: 数月~数年
#     ├── 冷冻电镜 (Cryo-EM): 数周~数月
#     ├── NMR: 仅限小蛋白
#     └── PDB 数据库: ~20万结构 (vs 数亿已知序列)

# CASP (蛋白质结构预测关键评估):
# Critical Assessment of Protein Structure Prediction
# 1994 年起, 每两年一次的国际盲测竞赛
#
# 评估指标: GDT-TS (Global Distance Test Total Score)
# 0-100, ≥ 90 被认为"实验精度"
#
# CASP 历史得分:
# ┌──────────┬──────────────────┬──────────────┐
# │ 年份      │ 最佳方法          │ 中位GDT-TS   │
# ├──────────┼──────────────────┼──────────────┤
# │ CASP 1-12│ 共现/模板/跳跃建模│ 20-40        │
# │ 2018 (13)│ AlphaFold 1.0    │ ~58          │
# │ 2020 (14)│ AlphaFold 2.0    │ ~87 ★★★     │
# │ 2022 (15)│ OpenFold 等      │ ~85          │
# │ 2024 (16)│ AlphaFold 3+     │ ~92          │
# └──────────┴──────────────────┴──────────────┘
# 
# AlphaFold 2 在 CASP14 上的表现:
# → 中位 GDT-TS: 87.0 (第二名: 64.7)
# → 碾压式胜利, 被称为"AI 的 AlphaGo 时刻"
# → 事实上"解决"了单链蛋白质折叠问题`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ AlphaFold 2/3 架构解析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> alphafold_architecture</div>
                <pre className="fs-code">{`# AlphaFold 2 架构深度解析

# 输入:
# ├── 目标氨基酸序列 (N 个残基)
# ├── MSA (Multiple Sequence Alignment)
# │   └── 在进化数据库中搜索同源序列
# └── 模板 (已知的同源蛋白结构)

# ═══ 核心架构 (4 个关键模块) ═══

# 1. 输入嵌入
Input_Embedding = """
├── MSA 嵌入: [N_seq × N_res × c_m]
│   └── 进化信息: 哪些位置共变异?
├── Pair 嵌入: [N_res × N_res × c_z]
│   └── 残基对之间的关系
└── 模板嵌入: 叠加已知结构信息
"""

# 2. Evoformer (48 层) ← 核心创新
Evoformer = """
核心思想: MSA 和 Pair 表示交替更新

每一层:
├── MSA Row-wise Self-Attention
│   └── 每个序列内部的注意力 (行方向)
├── MSA Column-wise Self-Attention
│   └── 同一位置跨序列的注意力 (列方向)
├── MSA → Pair (outer product mean)
│   └── MSA 的共变异信息更新 Pair
├── Pair Triangular Attention (starting)
│   └── 三角形约束: d(i,j)+d(j,k)≥d(i,k)
├── Pair Triangular Attention (ending)
│   └── 反方向三角形更新
├── Pair → MSA
│   └── Pair 信息反馈到 MSA
└── Transition (FFN)

关键创新:
├── 三角更新: 利用"距离三角不等式"
│   → 物理约束嵌入网络结构
├── Axial Attention: 行列交替注意力
│   → O(N²) 而非 O(N⁴) 
└── 递归迭代: 48层 → 逐步精化
"""

# 3. Structure Module (8 层)
Structure_Module = """
├── 不变点注意力 (IPA)
│   ├── 在3D space中计算注意力
│   ├── SE(3) 等变 → 旋转不变
│   └── 直接操作原子坐标
├── 残基刚体更新
│   └── 每个残基 = 旋转 + 平移
├── 侧链预测 (χ 角)
└── 输出: 每个原子的 3D 坐标
"""

# 4. 损失函数
Loss = """
├── FAPE (Frame Aligned Point Error)
│   └── 在局部坐标系下的原子位置误差
├── pLDDT (predicted LDDT)
│   └── 每个残基的置信度估计
├── Distogram loss
│   └── 残基间距离分布
└── 辅助损失 (MSA masking 等)
"""

# ═══ AlphaFold 3 的进化 ═══
AF3_upgrades = {
    "Diffusion Module": "替代Structure Module, 更灵活",
    "统一建模": "蛋白质+DNA+RNA+小分子+离子",
    "PairFormer": "简化的 Evoformer (仅 Pair)",
    "Cross-attention": "不同分子类型的交互",
    "采样多样性": "生成多个构象候选",
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💊 AlphaFold 应用实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> alphafold_applications</div>
                <pre className="fs-code">{`# AlphaFold 实际应用场景

# ═══ 1. 药物发现 ═══
drug_discovery = {
    "靶点结构预测": {
        "传统": "X射线/Cryo-EM获取靶点结构(数月)",
        "AF方式": "输入序列→分钟级获得结构",
        "案例": "SARS-CoV-2 蛋白快速建模",
    },
    "虚拟筛选加速": {
        "流程": "AF结构→分子对接→评分→候选分子",
        "工具": "AF + AutoDock / DiffDock",
    },
    "靶点发现": {
        "方式": "预测全蛋白质组互作网络",
        "案例": "寄生虫蛋白组→新靶点发现",
    },
}

# ═══ 2. 蛋白质工程 ═══
protein_engineering = {
    "酶设计": {
        "目标": "设计更高效的工业酶",
        "案例": "塑料降解酶 PETase 优化",
        "流程": "AF结构→活性位点分析→突变设计",
    },
    "抗体设计": {
        "目标": "设计结合特定抗原的抗体",
        "工具": "AF-Multimer预测复合物",
    },
    "疫苗设计": {
        "目标": "设计最优免疫原",
        "案例": "疟疾疫苗候选分子优化",
    },
}

# ═══ 3. 基础研究 ═══
basic_research = {
    "蛋白质互作网络": {
        "工具": "AF-Multimer",
        "案例": "人类蛋白质互作组预测",
    },
    "进化生物学": {
        "应用": "通过结构相似性推断进化关系",
        "案例": "远缘同源蛋白发现",
    },
    "结构基因组学": {
        "数据": "AlphaFold DB: 2亿+结构",
        "覆盖": "几乎所有已知蛋白质序列",
    },
}

# ═══ 实际使用 AlphaFold ═══
usage_guide = """
# 方式 1: AlphaFold DB (预计算结构)
# https://alphafold.ebi.ac.uk/
# 直接搜索 UniProt ID → 下载 PDB 文件
# 覆盖 2 亿+ 蛋白质

# 方式 2: ColabFold (在线运行)  
# https://colab.research.google.com/
# ├── 上传序列 → MSA搜索 → 结构预测
# ├── 免费 GPU (T4)
# ├── 适合: 单个/少量蛋白质
# └── MMseqs2 快速 MSA (替代 HHblits)

# 方式 3: 本地部署
# pip install alphafold
# 需要: A100 GPU (40GB+) + 数据库 (~2TB)
# 适合: 大规模预测 / 定制化需求

# 方式 4: OpenFold (开源重实现)
# PyTorch 实现 (原版是 JAX)
# 可训练/微调
# 更灵活的研究用途
"""

# ═══ 关键限制 ═══
limitations = [
    "只预测静态结构(非动力学/构象变化)",
    "对无序蛋白质区域预测较差",
    "pLDDT < 50 的区域不可信",
    "不直接预测功能/活性",
    "多构象蛋白: 倾向预测最稳定构象",
    "膜蛋白: 精度略低(缺少膜环境)",
]`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌍 蛋白质 AI 开源生态</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> protein_ai_ecosystem</div>
                <pre className="fs-code">{`# 蛋白质 AI 开源工具与数据库

# ═══ 结构预测 ═══
structure_prediction = {
    "AlphaFold 2/3 (DeepMind)": "JAX, 标准参考实现",
    "OpenFold (Columbia)": "PyTorch, 可训练/微调",
    "ColabFold": "免费在线运行 AlphaFold",
    "ESMFold (Meta)": "无需 MSA, 纯语言模型预测",
    "OmegaFold": "单序列预测 (无MSA)",
    "RoseTTAFold (UW)": "三轨网络, 独立开发",
    "Uni-Fold (DP Tech)": "AlphaFold 中文重实现",
}

# ═══ 蛋白质设计 ═══
protein_design = {
    "RFdiffusion (UW)": "扩散模型蛋白质从头设计",
    "ProteinMPNN (UW)": "给定骨架→设计序列",
    "ESM-IF1 (Meta)": "逆折叠(结构→序列)",
    "Chroma (Generate Bio)": "可编程蛋白质生成",
    "FrameDiff": "SE(3)扩散蛋白质生成",
}

# ═══ 分子对接 ═══
molecular_docking = {
    "DiffDock (MIT)": "扩散模型分子对接",
    "AutoDock Vina": "经典对接软件(开源)",
    "Gnina": "CNN评分的分子对接",
    "Smina": "AutoDock Vina优化版",
}

# ═══ 关键数据库 ═══
databases = {
    "PDB": "实验解析的蛋白质3D结构 (~22万)",
    "UniProt": "蛋白质序列+注释 (2亿+)",
    "AlphaFold DB": "AF预测结构 (2亿+)",
    "PDBe": "欧洲PDB镜像+分析工具",
    "RCSB PDB": "美国PDB主站",
    "InterPro": "蛋白质家族/结构域数据库",
    "Pfam": "蛋白质家族分类",
}

# ═══ 表征学习 ═══
representation = {
    "ESM-2 (Meta)": "蛋白质语言模型 (15B)",
    "ProtTrans (TU Munich)": "蛋白质BERT系列",
    "Ankh (Colu)": "蛋白质大语言模型",
    "ProGen2 (Salesforce)": "蛋白质生成模型",
}

# ═══ 学习资源推荐 ═══
# ├── 课程: MIT 6.047 (计算生物学)
# ├── 课程: Stanford CS279 (结构计算生物学)
# ├── 论文: "Highly accurate protein structure
# │        prediction with AlphaFold" (Nature)
# ├── 论文: "Accurate prediction of protein
# │        structures and interactions" (Nature)
# ├── 书籍: "Introduction to Protein Structure"
# └── 实战: ColabFold notebooks`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
