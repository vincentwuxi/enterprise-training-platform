import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['药物发现流程', '分子表征', '虚拟筛选', 'ADMET/Lead优化'];

export default function LessonDrugDiscovery() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔬 module_03 — AI 药物发现</div>
      <div className="fs-hero">
        <h1>AI 药物发现：分子表征 / GNN / 虚拟筛选 / ADMET / Lead 优化</h1>
        <p>
          传统药物研发耗时 10-15 年、平均成本 26 亿美元、成功率不到 10%。
          AI 正在<strong>重塑药物发现的每个环节</strong>：从靶点发现到先导化合物优化。
          Insilico Medicine 的 AI 设计药物已进入临床 II 期，
          Recursion 用 AI 扫描了 360 亿分子对……本模块系统讲解 AI 药物发现的核心技术栈。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">💊 AI 药物发现</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 药物发现全流程 × AI</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> drug_pipeline</div>
                <pre className="fs-code">{`# 药物发现流程 & AI 赋能点

# 传统时间线: 10-15 年 / $2.6B 平均成本
# AI 加速目标: 缩短至 3-5 年

# ═══ Phase 1: 靶点发现 (Target Discovery) ═══
# 传统: 基础研究 / 基因组学 / 表型筛选
# AI赋能:
target_discovery = {
    "知识图谱挖掘": "文献/基因组/蛋白质组→靶点候选",
    "网络药理学": "疾病-基因-蛋白质-药物网络分析",
    "AlphaFold": "预测靶点蛋白结构,理解可成药性",
    "工具": ["OpenTargets", "DisGeNET", "STITCH"],
    "AI节省": "6-12个月 → 数周",
}

# ═══ Phase 2: 苗头化合物发现 (Hit Discovery) ═══
hit_discovery = {
    "虚拟筛选": "AI评分百万级分子→候选列表",
    "从头设计": "生成式AI设计全新分子",
    "高通量实验+AI": "实验数据→主动学习→下一轮实验",
    "工具": ["DiffDock","AutoDock","DeepChem","REINVENT"],
    "AI节省": "数月 → 数天",
}

# ═══ Phase 3: 先导化合物优化 (Lead Optimization) ═══
lead_optimization = {
    "ADMET预测": "AI预测药代动力学性质",
    "多目标优化": "同时优化活性/选择性/毒性/溶解度",
    "SAR分析": "结构-活性关系自动分析",
    "工具": ["REINVENT","MolDQN","Graph-based RL"],
    "AI节省": "数年 → 数月",
}

# ═══ Phase 4: 临床前 (Preclinical) ═══
preclinical = {
    "毒性预测": "AI预测体内毒性(减少动物实验)",
    "剂量优化": "PK/PD 建模→最优剂量",
    "生物标志物": "AI发现伴随诊断标志物",
}

# ═══ Phase 5: 临床试验 (Clinical Trials) ═══
clinical = {
    "患者分层": "AI根据基因组/表型分组",
    "试验设计": "贝叶斯自适应设计",
    "终点预测": "AI预测临床试验成功率",
    "真实世界数据": "EHR/保险数据补充证据",
}

# AI 药物发现公司 (2025):
# ├── Insilico Medicine: 抗纤维化药物 临床II期
# ├── Recursion: 360亿分子对扫描, 多管线
# ├── Isomorphic Labs: DeepMind分拆, AlphaFold驱动
# ├── Exscientia: AI设计临床候选 (被BMS收购)
# ├── Generate Biomedicines: 蛋白质设计
# ├── Absci: AI抗体设计
# └── 晶泰科技: AI+自动化实验`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧮 分子表征方法</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> molecular_representation</div>
                <pre className="fs-code">{`# 分子如何输入 AI 模型? — 分子表征方法

# ═══ 1. 字符串表示 ═══
string_repr = {
    "SMILES": {
        "格式": "CC(=O)OC1=CC=CC=C1C(=O)O",
        "含义": "阿司匹林的线性表示",
        "优点": "简洁/可直接用NLP模型",
        "缺点": "同一分子有多种SMILES",
    },
    "SELFIES": {
        "格式": "[C][C][=O][O][C]...",
        "优点": "100%语法有效(SMILES不保证)",
        "用途": "生成式模型首选",
    },
    "InChI": "标准化的唯一分子标识符",
}

# ═══ 2. 分子指纹 (Fingerprints) ═══
fingerprints = {
    "Morgan/ECFP": {
        "原理": "原子为中心的局部子结构",
        "输出": "固定长度位向量(1024/2048)",
        "用途": "相似性搜索/基线ML模型",
    },
    "MACCS Keys": "166个预定义结构特征",
    "RDKit FP": "RDKit实现的拓扑指纹",
}

# ═══ 3. 图表示 (Graph) — 当前主流 ═══
graph_repr = {
    "节点": "原子 (特征: 原子类型/电荷/杂化)",
    "边": "化学键 (特征: 键类型/共轭/环)",
    "全局": "分子级特征 (分子量/LogP等)",
    "模型": [
        "GCN (Graph Convolutional Network)",
        "GAT (Graph Attention Network)",
        "MPNN (Message Passing Neural Network)",
        "SchNet (距离感知GNN)",
        "DimeNet (角度感知GNN)",
        "GemNet (三面角感知GNN)",
    ],
}

# ═══ 4. 3D 表示 ═══
three_d_repr = {
    "原子坐标": "直接使用 (x,y,z) 坐标",
    "体素化": "3D网格表示 (类似3D图像)",
    "点云": "原子作为3D点云",
    "模型": [
        "SchNet: 距离感知消息传递",
        "PaiNN: SE(3)等变消息传递",
        "NequIP: 高阶等变特征",
        "MACE: 多体交互",
    ],
    "优势": "捕捉空间构象信息(手性等)",
}

# ═══ 5. 预训练表征 ═══
pretrained = {
    "Uni-Mol (DP Tech)": "3D分子+蛋白质预训练",
    "MolBERT (BenevolentAI)": "SMILES BERT预训练",
    "ChemBERTa": "化学领域RoBERTa",
    "GEM (百度)": "分子几何预训练",
}

# 表征选择建议:
# ├── 快速基线 → Morgan FP + XGBoost
# ├── 中等复杂度 → 2D GNN (GCN/GAT)
# ├── 需要3D信息 → SchNet/PaiNN
# ├── 大规模预训练 → Uni-Mol/ChemBERTa
# └── 生成式任务 → SELFIES + Transformer`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 AI 虚拟筛选</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> virtual_screening</div>
                <pre className="fs-code">{`# AI 驱动的虚拟筛选 (Virtual Screening)

# 目标: 从百万级化合物库中快速筛选活性分子

# ═══ 基于配体的虚拟筛选 (LBVS) ═══
LBVS = {
    "原理": "已知活性分子→找相似分子",
    "方法": {
        "相似性搜索": "Tanimoto系数 > 阈值",
        "QSAR模型": "活性=f(分子描述符)",
        "深度学习": "GNN/Transformer 预测活性",
    },
    "优点": "不需要靶点结构, 速度快",
    "缺点": "局限于已知化学空间",
}

# ═══ 基于结构的虚拟筛选 (SBVS) ═══
SBVS = {
    "原理": "靶点3D结构→评估结合亲和力",
    "传统分子对接": {
        "AutoDock Vina": "开源标准",
        "Glide (Schrödinger)": "商业金标准",
        "速度": "~1秒/分子",
    },
    "AI分子对接": {
        "DiffDock (MIT)": {
            "方法": "扩散模型预测结合位姿",
            "速度": "~0.1秒/分子",
            "精度": "Top-1 成功率 38% (vs Vina 23%)",
        },
        "EquiBind": "等变GNN直接预测",
        "TANKBind": "单步预测结合位点+位姿",
    },
    "优点": "物理合理性, 可预测结合模式",
    "缺点": "需要靶点结构, 计算量大",
}

# ═══ AI 从头设计 (De novo Design) ═══
de_novo = {
    "原理": "AI 直接生成满足条件的新分子",
    "生成模型": {
        "VAE": "变分自编码器 (连续隐空间)",
        "GAN": "对抗式分子生成",
        "Flow": "Flow-matching 分子生成",
        "Diffusion": "扩散模型分子生成(3D)",
        "RL": "强化学习优化分子性质",
        "LLM": "大语言模型分子设计",
    },
    "代表工具": {
        "REINVENT (AZ)": "RL+RNN分子生成",
        "MolDQN": "DQN分子优化",
        "LIMO": "隐空间分子优化",
        "DrugGPT": "GPT分子生成",
    },
}

# 筛选规模:
# ┌──────────────────┬──────────┬──────────┐
# │ 方法              │ 速度      │ 规模     │
# ├──────────────────┼──────────┼──────────┤
# │ 传统HTS实验       │ 数月      │ ~100万   │
# │ 分子指纹相似性    │ 分钟      │ ~10亿    │
# │ 传统分子对接      │ 数天      │ ~100万   │
# │ AI评分模型        │ 数小时    │ ~10亿    │
# │ DiffDock          │ 数小时    │ ~1000万  │
# │ De novo生成       │ 数小时    │ 无限     │
# └──────────────────┴──────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚗️ ADMET 预测与 Lead 优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> admet_optimization</div>
                <pre className="fs-code">{`# ADMET 预测: 药物成败的关键

# ADMET = 药代动力学五大性质
# ~60% 的药物失败源于 ADMET 问题

A = "Absorption (吸收)"
# ├── 口服生物利用度 (%F)
# ├── 肠道吸收 (HIA) / Caco-2 通透性
# ├── P-gp 底物 (外排泵)
# └── AI: GNN 预测通透性

D = "Distribution (分布)"
# ├── 血浆蛋白结合率 (PPB)
# ├── 血脑屏障通透性 (BBB)
# ├── 表观分布容积 (Vd)
# └── AI: 多任务学习预测分布参数

M = "Metabolism (代谢)"
# ├── CYP450 抑制/诱导 (CYP2D6/3A4等)
# ├── 代谢稳定性 (半衰期)
# ├── 代谢产物预测
# └── AI: Transformer 预测代谢位点

E = "Excretion (排泄)"
# ├── 清除率 (CL)
# ├── 肾脏排泄
# └── AI: 回归模型预测清除率

T = "Toxicity (毒性)"
# ├── hERG 抑制 (心脏毒性)
# ├── AMES 致突变性
# ├── 肝毒性 (DILI)
# ├── LD50 (急性毒性)
# ├── 致癌性
# └── AI: 多任务GNN预测多种毒性端点

# ═══ AI ADMET 预测工具 ═══
tools = {
    "ADMET-AI (Therapeutics Data Commons)": {
        "方法": "Graph Transformer",
        "端点": "23个ADMET性质",
        "精度": "AUROC 0.82-0.95",
    },
    "ADMETlab 3.0": "中山大学, 全面ADMET预测",
    "SwissADME": "免费在线工具",
    "pkCSM": "在线ADMET预测",
    "DeepPK": "深度学习药代动力学",
}

# ═══ 多目标优化 (Lead Optimization) ═══
multi_objective = {
    "挑战": "同时优化活性+选择性+ADMET+合成可行性",
    "方法": {
        "帕累托优化": "找到多目标的帕累托前沿",
        "RL多目标": "奖励函数=加权多目标",
        "贝叶斯优化": "高斯过程+多目标采集函数",
        "遗传算法": "分子进化→适应度选择",
    },
    "药物化学法则": {
        "Lipinski Ro5": "MW<500, logP<5, HBD<5, HBA<10",
        "Veber": "PSA<140, RotBonds<10",
        "Pfizer 3/75": "LogP<3, PSA>75 (降低毒性)",
    },
}

# Lead 优化循环:
# 设计 → AI预测 → 合成 → 实验验证 → 反馈
#  ↑                                      │
#  └──── AI 迭代优化 (每轮缩小范围) ←─────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
