import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['四次范式', '科学大模型', '里程碑', '方法论'];

export default function LessonScientificParadigm() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔬 module_01 — 科学 AI 范式</div>
      <div className="fs-hero">
        <h1>科学 AI 范式：从经验科学到 AI 驱动的第四范式</h1>
        <p>
          Jim Gray 在 2007 年提出<strong>科学的第四范式——数据密集型科学发现</strong>。
          时至今日，AI 已超越"数据工具"，成为<strong>科学发现的核心引擎</strong>：
          AlphaFold 解决了 50 年的蛋白质折叠问题并获诺贝尔奖，
          GenCast 打败数十年积累的物理模型……本模块梳理 AI4Science 的范式演变、
          里程碑事件和方法论体系。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧬 科学 AI 范式</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 科学研究的四次范式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> four_paradigms</div>
                <pre className="fs-code">{`# 科学研究的四次范式 + AI 驱动的新范式

# ═══════════════════════════════════════
# 第一范式: 经验科学 (Empirical)
# ═══════════════════════════════════════
# 时代: 古代 → 文艺复兴
# 方法: 观察 → 归纳 → 经验法则
# 代表: 亚里士多德 / 开普勒行星定律
# 局限: 依赖人类感官, 难以超越直觉
paradigm_1 = "观察自然现象 → 总结经验规律"

# ═══════════════════════════════════════
# 第二范式: 理论科学 (Theoretical)
# ═══════════════════════════════════════
# 时代: 17世纪 → 20世纪
# 方法: 数学建模 → 推导 → 预测
# 代表: 牛顿力学 / 麦克斯韦方程 / 量子力学
# 特征: 从第一性原理推导, 精确预测
paradigm_2 = "数学模型 → 理论推导 → 实验验证"

# ═══════════════════════════════════════
# 第三范式: 计算科学 (Computational)
# ═══════════════════════════════════════
# 时代: 1950s → 2000s
# 方法: 数值模拟 / 蒙特卡洛 / 有限元
# 代表: 天气预报 / 分子动力学 / CFD
# 驱动: 超级计算机的发展
paradigm_3 = "物理模型 + 大规模数值计算 → 模拟"

# ═══════════════════════════════════════
# 第四范式: 数据密集型 (Data-Intensive)
# ═══════════════════════════════════════
# 时代: 2007 (Jim Gray) → 2020s
# 方法: 大数据 + 统计学习 + 可视化
# 代表: 基因组学 / 天文巡天 / 粒子物理
# 驱动: 数据爆炸 + 计算资源
paradigm_4 = "海量数据 → 特征工程 → 模式发现"

# ═══════════════════════════════════════
# 第五范式?: AI 驱动的科学发现
# ═══════════════════════════════════════
# 时代: 2020s → 未来
# 方法: Foundation Model → 端到端学习
# 代表: AlphaFold / GenCast / GNoME
# 特征:
AI_paradigm = {
    "端到端学习": "跳过特征工程, 直接学习规律",
    "Foundation Model": "大规模预训练→下游任务迁移",
    "生成式科学": "AI 不仅预测, 还能生成/设计",
    "超越物理模型": "数据驱动可超越第一性原理",
    "加速发现": "从年→周→小时",
}

# 范式演进:
# ┌──────────┬──────────┬──────────┬──────────┬──────────┐
# │ 经验      │ 理论      │ 计算      │ 数据      │ AI       │
# │ 观察      │ 推导      │ 模拟      │ 挖掘      │ 发现     │
# │ 千年      │ 百年      │ 数十年    │ 十年      │ 数年     │
# │           │           │           │           │          │
# │ 开普勒    │ 牛顿      │ 天气模拟  │ GWAS      │ AlphaFold│
# │ 经验法则  │ F=ma      │ NWP       │ 基因组学  │ GenCast  │
# └──────────┴──────────┴──────────┴──────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧠 科学大模型 (Foundation Models for Science)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> science_foundation_models</div>
                <pre className="fs-code">{`# 科学大模型: NLP 预训练范式向科学领域的迁移

# 核心思想:
# NLP: 大规模文本预训练 → 下游 NLP 任务
# Science: 大规模科学数据预训练 → 下游科学任务

# ═══ 生物/蛋白质大模型 ═══
protein_models = {
    "AlphaFold 3 (DeepMind)": {
        "数据": "PDB + UniProt 数据库",
        "架构": "Diffusion + Evoformer",
        "能力": "蛋白质/DNA/RNA/配体 复合物结构预测",
        "意义": "2024 诺贝尔化学奖",
    },
    "ESM-3 (Meta)": {
        "数据": "27亿蛋白质序列",
        "参数": "98B",
        "能力": "序列/结构/功能 三模态理解",
        "突破": "设计出自然界不存在的功能性蛋白质",
    },
    "Evo (Arc Institute)": {
        "数据": "整个基因组序列",
        "参数": "7B, 131K context",
        "能力": "DNA/RNA/蛋白质 生成与理解",
        "架构": "StripedHyena (长序列高效)",
    },
}

# ═══ 化学/分子大模型 ═══
chemistry_models = {
    "Uni-Mol (DP Technology)": "3D 分子表征预训练",
    "MolFormer (IBM)": "分子 SMILES 大语言模型",
    "ChemLLM (Shanghai AI Lab)": "化学领域对话大模型",
    "GNoME (DeepMind)": "无机材料结构预测",
}

# ═══ 地球科学大模型 ═══
earth_models = {
    "GenCast (DeepMind)": "扩散模型天气预报",
    "GraphCast (DeepMind)": "GNN 中期天气预测",
    "Pangu-Weather (华为)": "3D Earth Transformer",
    "ClimaX (Microsoft)": "气候预测基座模型",
    "Aurora (Microsoft)": "大气基座模型 (1.3B)",
}

# ═══ 科学通用大模型 ═══
general_science = {
    "Galactica (Meta)": {
        "数据": "4800万论文+教科书+百科",
        "能力": "科学QA/论文生成/公式推导",
        "争议": "幻觉问题→72小时后下线",
    },
    "SciGLM (清华)": "科学推理增强的GLM",
    "Minerva (Google)": "数学/科学定量推理",
    "Llemma (EleutherAI)": "开源数学大模型",
}

# ═══ 关键区别: 科学大模型 vs 通用大模型 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │              │ 通用LLM       │ 科学FM       │
# ├──────────────┼──────────────┼──────────────┤
# │ 数据          │ 文本/代码     │ 序列/结构/图  │
# │ 输入          │ Token序列     │ 原子/残基/网格│
# │ 输出          │ Token概率     │ 坐标/能量/性质│
# │ 评估          │ 困惑度/人评   │ 实验验证      │
# │ 物理约束      │ 无            │ 可加入先验    │
# │ 可解释性      │ 低            │ 中-高(物理)   │
# └──────────────┴──────────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏆 AI4Science 里程碑时间线</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> milestones_timeline</div>
                <pre className="fs-code">{`# AI for Science 重大里程碑 (2016-2025)

# 2016
├── AlphaGo 击败李世石 (AI在复杂博弈超越人类)

# 2018
├── AlphaFold 1.0 (CASP13 首次获胜)

# 2020 ★
├── AlphaFold 2.0 (CASP14 碾压传统方法)
│   └── GDT > 90: "蛋白质折叠问题已解决"
├── AlphaGo/MuZero 统一框架

# 2021
├── AlphaFold DB 发布 (1亿+蛋白质结构)
├── RoseTTAFold (华盛顿大学, 开源替代)

# 2022
├── Galactica (Meta, 科学大模型, 争议下线)
├── GraphCast (DeepMind, 10天天气预报)
├── Pangu-Weather (华为, 3D 地球模型)
├── ESMFold (Meta, 语言模型预测蛋白质)
├── DiffDock (MIT, 扩散模型分子对接)

# 2023 ★★
├── GNoME (DeepMind, 发现220万新材料)
├── AlphaFold 最新版 (蛋白质+配体+核酸)
├── Evo (Arc, DNA/RNA/蛋白质统一模型)
├── GenCast (DeepMind, 扩散模型天气预报)
├── RT-2 (DeepMind, 机器人基座模型)
├── FunSearch (DeepMind, LLM发现新数学)

# 2024 ★★★ (AI4Science 元年)
├── AlphaFold 3 → 2024 诺贝尔化学奖 🏅
│   └── Demis Hassabis + John Jumper
├── AlphaProof (DeepMind, IMO 银牌水平)
├── AlphaGeometry 2 (几何推理超人类)
├── ESM-3 (Meta, 98B蛋白质FM, 设计新蛋白)
├── GenCast 超越 ECMWF (欧洲天气中心)
├── Llemma (开源数学推理模型)

# 2025
├── AlphaFold-latest (多模态分子交互)
├── 科学大模型进入产业化阶段
├── AI 药物发现首批临床成果
└── 多个国家启动 AI4Science 国家计划

# 影响力评估:
# ┌────────────────┬─────────────┬─────────────┐
# │ 领域            │ AI vs 传统   │ 加速倍数     │
# ├────────────────┼─────────────┼─────────────┤
# │ 蛋白质结构预测  │ AI 完胜      │ 100-1000x   │
# │ 天气预报        │ AI ≥ 物理模型│ 1000x(速度) │
# │ 材料发现        │ AI 显著加速  │ 10-100x     │
# │ 药物发现        │ 早期验证中   │ 5-10x       │
# │ 数学定理证明    │ 接近人类     │ 新能力       │
# └────────────────┴─────────────┴─────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 AI4Science 方法论体系</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> methodology</div>
                <pre className="fs-code">{`# AI for Science 核心方法论

# ═══ 1. 图神经网络 (GNN) ═══
# 最适合分子/材料/蛋白质的天然表示
GNN_methods = {
    "Message Passing NN": "节点间信息传递",
    "SchNet": "连续距离感知的分子GNN",
    "DimeNet": "角度感知的分子GNN",
    "PaiNN": "等变消息传递",
    "MACE": "高阶多体交互",
    "应用": "分子性质预测/蛋白质功能/材料性质",
}

# ═══ 2. 等变神经网络 (Equivariant NN) ═══
# 保持物理对称性 (旋转/平移/反射不变)
equivariant = {
    "SE(3)-Transformer": "3D旋转等变Transformer",
    "E(n)-GNN": "n维欧几里得等变图网络",
    "NequIP": "等变势能面学习",
    "核心": "物理定律在坐标变换下不变",
    "意义": "显著减少数据需求, 提高泛化性",
}

# ═══ 3. 扩散模型 (Diffusion Models) ═══
# 从噪声生成科学结构
diffusion_science = {
    "DiffDock": "分子对接 (配体位姿预测)",
    "RFdiffusion": "蛋白质结构设计",
    "GenCast": "概率天气预报",
    "CDVAE": "晶体材料结构生成",
    "原理": "逐步去噪→生成3D结构",
}

# ═══ 4. Transformer 变体 ═══
transformer_science = {
    "Evoformer (AlphaFold)": "进化信息+几何推理",
    "Structure Module": "不变点注意力(IPA)",
    "Pairwise attention": "残基对关系建模",
    "ViT for Weather": "视觉Transformer处理气象场",
}

# ═══ 5. 物理信息神经网络 (PINN) ═══
PINN = {
    "原理": "损失函数中加入物理方程约束",
    "PDE求解": "用NN近似偏微分方程的解",
    "优势": "少量数据 + 物理先验 = 泛化好",
    "工具": "DeepXDE / NVIDIA Modulus",
}

# ═══ 6. 强化学习 ═══
RL_science = {
    "分子生成": "RL优化分子性质(QED/SA/logP)",
    "实验设计": "贝叶斯优化+RL选择实验",
    "数学证明": "AlphaProof: RL搜索证明策略",
    "材料优化": "RL指导合成路径",
}

# ═══ 工具生态 ═══
tools = {
    "PyTorch Geometric": "图神经网络框架",
    "e3nn": "等变神经网络库",
    "OpenFold": "AlphaFold开源实现",
    "RDKit": "化学信息学工具包",
    "ASE": "原子模拟环境",
    "MDAnalysis": "分子动力学分析",
    "JAX/Flax": "DeepMind 首选框架",
    "Weights & Biases": "实验追踪",
}`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
