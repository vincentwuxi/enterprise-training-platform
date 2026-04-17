import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['GNoME 突破', '晶体结构预测', '性质预测', '逆设计'];

export default function LessonMaterialsDesign() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔬 module_05 — AI 材料设计</div>
      <div className="fs-hero">
        <h1>AI 材料设计：GNoME / 晶体结构预测 / 性质预测 / 逆设计</h1>
        <p>
          2023 年 DeepMind 发布 <strong>GNoME (Graph Networks for Materials Exploration)</strong>，
          一举发现了 <strong>220 万种</strong>新的稳定无机材料——相当于 800 年实验成果。
          材料科学是制造业和能源转型的基石，AI 正在极大加速新材料的发现与设计。
          本模块系统讲解 AI 材料设计的核心技术路线。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚛️ AI 材料设计</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💎 GNoME：220 万新材料的发现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> gnome_breakthrough</div>
                <pre className="fs-code">{`# GNoME: Graph Networks for Materials Exploration

# 论文: "Scaling deep learning for materials 
#        discovery" (Nature, Dec 2023)

# ═══ 背景 ═══
# 已知稳定无机晶体: ~48,000 种 (ICSD数据库)
# Materials Project 计算预测: ~150,000 种
# GNoME 发现: +2,200,000 种新稳定材料 !!!
# → 等于 800 年实验发现的材料数量

# ═══ 方法 ═══
GNoME_method = {
    "核心": "GNN预测材料热力学稳定性",
    
    "Phase 1: 候选生成": {
        "结构搜索": "已知结构→元素替换→新候选",
        "随机搜索": "随机生成晶体结构",
        "总计": "~10亿候选结构",
    },
    
    "Phase 2: GNN 筛选": {
        "模型": "GNN预测 formation energy",
        "指标": "Energy above hull (Ehull)",
        "稳定条件": "Ehull < 0.025 eV/atom",
        "结果": "220万种材料 Ehull=0",
    },
    
    "Phase 3: DFT 验证": {
        "工具": "VASP密度泛函理论计算",
        "验证": "抽样DFT计算验证GNN预测",
        "精度": "GNN vs DFT 误差 < 25 meV/atom",
    },
}

# ═══ 关键发现 ═══
discoveries = {
    "新分层材料": "52,000种 (类石墨烯/MoS2)",
    "新超导候选": "528种潜在超导材料",
    "锂离子导体": "新型固态电解质候选",
    "光伏材料": "新型太阳能电池材料",
    "总数": "2,200,000 种热力学稳定材料",
}

# ═══ 实验验证 ═══
# Berkeley Lab (劳伦斯伯克利实验室):
# 使用 A-Lab 自动化实验室:
# ├── 机器人自动合成
# ├── 自动 X 射线衍射分析
# ├── 17天 → 合成/验证 41种新材料
# └── 成功率: 71% (远高于传统~50%)

# ═══ 意义与影响 ═══
# ┌──────────────────┬──────────────────┐
# │ 传统材料发现      │ GNoME + A-Lab    │
# ├──────────────────┼──────────────────┤
# │ 试错实验          │ AI 预测 + 筛选    │
# │ 数年/种材料       │ 数天/种材料       │
# │ ~48K 已知材料     │ +2.2M 新材料      │
# │ 人类直觉驱动      │ 数据+计算驱动     │
# │ 有限化学空间      │ 广阔化学空间      │
# └──────────────────┴──────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔮 晶体结构预测 (CSP)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> crystal_structure_prediction</div>
                <pre className="fs-code">{`# 晶体结构预测: 给定组成→预测晶体结构

# 为什么重要:
# "1个材料的性质 = 组成 + 结构"
# 同样的碳原子: 石墨(软) vs 金刚石(硬)
# → 结构决定性质

# ═══ 传统方法 ═══
traditional_CSP = {
    "Ab initio 随机搜索 (AIRSS)": {
        "方法": "随机生成结构→DFT优化",
        "成本": "极高, 仅限小体系",
    },
    "进化算法 (USPEX)": {
        "方法": "遗传算法搜索能量最低结构",
        "成本": "高, 需大量DFT计算",
    },
    "Basin Hopping": "蒙特卡洛+局部优化",
    "Particle Swarm (CALYPSO)": "中国开发PSO搜索",
}

# ═══ AI 方法 ═══
AI_CSP = {
    "CDVAE (MIT)": {
        "方法": "条件扩散VAE",
        "输入": "组成→生成晶体结构",
        "特点": "端到端, 可条件生成",
    },
    "DiffCSP": {
        "方法": "扩散模型晶体生成",
        "功能": "预测原子位置+晶格参数",
    },
    "MatterGen (Microsoft)": {
        "方法": "条件扩散模型",
        "功能": "可指定化学/结构/性质约束",
        "创新": "最先进的条件材料生成",
    },
    "UniMat": {
        "方法": "统一材料表示+预训练",
        "覆盖": "有机+无机材料",
    },
}

# ═══ 晶体表示方法 ═══
crystal_repr = {
    "3D坐标+晶格": {
        "原子位置": "(x,y,z) 分数坐标",
        "晶格": "3个基矢量 (a,b,c) + 角度",
        "空间群": "230种空间群对称性",
    },
    "GNN表示": {
        "节点": "原子 (类型+位置)",
        "边": "原子间键/距离",
        "周期性": "考虑周期性边界条件",
    },
    "体素化": "3D网格表示晶体",
}

# ═══ 势能面学习 ═══
potential_energy = {
    "目标": "学习 E=f(原子坐标) 替代DFT",
    "NequIP": "等变NN势能面, 高精度",
    "MACE (Cambridge)": "多体等变势能面",
    "CHGNet (Berkeley)": "电荷感知通用势",
    "M3GNet": "材料3体图网络势",
    "应用": "加速分子动力学/结构优化",
    "加速": "DFT精度, MD速度 (~1000x)",
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 材料性质预测</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> property_prediction</div>
                <pre className="fs-code">{`# AI 材料性质预测

# 给定材料(组成+结构) → 预测目标性质

# ═══ 预测目标 ═══
properties = {
    "热力学": ["formation energy", "stability", 
               "entropy", "Gibbs energy"],
    "电子": ["band gap", "电导率", "介电常数",
            "费米能级", "电子态密度"],
    "力学": ["弹性模量", "硬度", "泊松比",
            "断裂韧性"],
    "光学": ["折射率", "吸收谱", "发光性质"],
    "磁性": ["磁矩", "居里温度", "磁各向异性"],
    "热输运": ["热导率", "Seebeck系数", 
              "热电优值ZT"],
    "催化": ["吸附能", "活化能", "反应焓"],
}

# ═══ GNN 材料模型 ═══
models = {
    "CGCNN (MIT, 2018)": {
        "方法": "晶体图卷积神经网络",
        "输入": "原子类型+坐标+晶格→图",
        "意义": "开创性工作, 首个端到端晶体GNN",
    },
    "MEGNet (2019)": {
        "方法": "材料+元素+全局交互",
        "数据": "Materials Project 69,000材料",
    },
    "ALIGNN (NIST, 2021)": {
        "方法": "原子线图神经网络",
        "创新": "引入键角信息(三体交互)",
        "精度": "多个benchmark SOTA",
    },
    "M3GNet (2022)": {
        "方法": "多体交互图网络",
        "功能": "通用势能面 + 性质预测",
    },
    "MACE-MP (2023)": {
        "方法": "多体原子簇展开",
        "功能": "通用ML势能面",
        "训练": "MPtrj (150K DFT轨迹)",
    },
}

# ═══ 数据来源 ═══
datasets = {
    "Materials Project": {
        "规模": "~150,000 无机材料",
        "性质": "能量/带隙/弹性/phonon等",
        "API": "mp-api (Python)",
    },
    "AFLOW": "~370万材料计算数据",
    "OQMD": "~100万种材料计算",
    "JARVIS-DFT": "~80,000, NIST维护",
    "NOMAD": "AI+材料数据联盟",
    "MatBench": "标准化材料AI基准测试",
}

# ═══ 挑战 ═══
# ├── 数据偏差: 已知材料不代表化学空间
# ├── 分布外泛化: 外推到新材料类型
# ├── 稀缺性质: 部分性质实验数据极少
# ├── 多尺度: 原子→纳米→微米→宏观
# └── 非平衡态: 动力学性质更难预测`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 材料逆设计</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> inverse_design</div>
                <pre className="fs-code">{`# 材料逆设计: 给定目标性质 → 设计材料

# 正向: 材料 → 性质 (预测)
# 逆向: 性质 → 材料 (设计) ← 更有价值!

# ═══ 逆设计方法 ═══

# 1. 条件生成模型
conditional_generation = {
    "CDVAE": "给定目标性质→生成满足条件的晶体",
    "MatterGen": {
        "条件": "化学体系/空间群/性质/多条件",
        "方法": "条件扩散模型",
        "示例": "band_gap=1.5eV → 生成候选材料",
    },
    "CrystalGAN": "GAN生成晶体结构",
}

# 2. 优化搜索
optimization = {
    "贝叶斯优化": {
        "流程": "代理模型(GP/GNN)→采集函数→实验",
        "优势": "少量实验快速收敛",
        "工具": "Ax/BoTorch/GPyOpt",
    },
    "遗传算法": {
        "流程": "候选群体→评估→选择→交叉→变异",
        "优势": "多目标优化擅长",
    },
    "强化学习": {
        "流程": "Agent选择原子/位置→奖励=目标性质",
    },
}

# 3. 自动化实验闭环
closed_loop = """
┌──────────────────────────────────────────┐
│             AI 材料设计闭环                │
│                                          │
│  AI 候选生成 ──→ 自动化合成 (A-Lab)      │
│       ↑             │                    │
│       │             ↓                    │
│  模型更新 ←→ 自动化表征 (XRD/SEM)        │
│       ↑             │                    │
│       │             ↓                    │
│  主动学习 ←── 性质测试 (电化学/热)        │
│                                          │
│  Berkeley A-Lab: 17天合成41种新材料       │
│  成功率: 71% (传统: ~50%)                 │
└──────────────────────────────────────────┘
"""

# ═══ 应用领域 ═══
applications = {
    "电池材料": {
        "目标": "高能量密度/长循环/安全",
        "AI作用": "筛选固态电解质/正极材料",
        "案例": "Microsoft发现锂离子替代",
    },
    "催化剂": {
        "目标": "高活性/选择性/稳定性",
        "AI作用": "预测吸附能/活化能",
        "案例": "OC20/OC22 开放催化项目",
    },
    "光伏材料": {
        "目标": "高效率/低成本/稳定",
        "AI作用": "筛选钙钛矿/有机光伏",
    },
    "热电材料": {
        "目标": "高ZT值 (热→电转换)",
        "AI作用": "多目标优化(电导/热导)",
    },
    "超导材料": {
        "目标": "高温超导体",
        "AI作用": "搜索高Tc候选材料",
    },
}

# 开源工具生态:
# ├── pymatgen: 材料分析Python库
# ├── ASE: 原子模拟环境
# ├── Materials Project API: 数据获取
# ├── matbench: 标准化基准测试
# ├── JARVIS-Tools: NIST材料工具集
# └── matgl: 材料图学习库`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
