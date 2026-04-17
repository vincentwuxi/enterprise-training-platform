import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['HPC+AI', '实验管理', '可复现性', '科研平台'];

export default function LessonScienceEngineering() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔬 module_08 — 科学 AI 工程</div>
      <div className="fs-hero">
        <h1>科学 AI 工程：HPC / 实验管理 / 可复现性 / 科研平台</h1>
        <p>
          科学 AI 不仅是模型和算法——<strong>工程化能力</strong>决定了从论文到生产力的转化效率。
          本模块系统讲解科学 AI 的工程实践：如何在<strong>高性能计算集群</strong>上训练科学大模型、
          如何用 <strong>MLflow/W&B</strong> 管理大规模实验、如何确保计算结果的<strong>可复现性</strong>、
          以及主流科研 AI 平台的使用指南。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 科学 AI 工程</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🖥️ HPC + AI 融合计算</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> hpc_ai_fusion</div>
                <pre className="fs-code">{`# 高性能计算 (HPC) + AI 的融合

# 为什么科学AI需要HPC:
# ├── 模型规模大: ESM-3 (98B), 需多GPU训练
# ├── 数据量大: 基因组/气象/材料数据 PB级
# ├── 计算密集: MD模拟+ML → 混合工作负载
# └── 长时间: 训练周期数天~数周

# ═══ HPC 基础设施 ═══
hpc_infra = {
    "GPU集群": {
        "NVIDIA A100/H100": "科研主力",
        "AMD MI250X/MI300X": "美国国家实验室采用",
        "Google TPU v5": "DeepMind 首选",
        "互联": "NVLink/InfiniBand 低延迟",
    },
    "国家/机构集群": {
        "Frontier (ORNL)": "全球第一 ExaFLOP (~1.2 EF)",
        "Aurora (ANL)": "Intel GPU, >1 EF",
        "Perlmutter (LBNL)": "NVIDIA A100, 科研重点",
        "Leonardo (EU)": "欧洲, NVIDIA A100",
        "神威/天河 (中国)": "自研处理器",
    },
}

# ═══ 分布式训练策略 ═══
distributed = {
    "数据并行 (DDP)": {
        "方法": "每GPU一份模型, 数据分片",
        "适用": "模型fit单GPU",
        "工具": "PyTorch DDP / Horovod",
    },
    "模型并行": {
        "方法": "模型分割到多GPU",
        "适用": "模型太大单GPU装不下",
        "工具": "Megatron-LM / DeepSpeed",
    },
    "流水线并行": {
        "方法": "模型按层分割+微批次流水",
        "工具": "GPipe / PipeDream",
    },
    "混合并行": {
        "3D并行": "数据+模型+流水线",
        "FSDP": "全分片数据并行(PyTorch原生)",
    },
}

# ═══ 科学AI的特殊需求 ═══
science_needs = {
    "混合精度": {
        "FP32": "DFT计算/数值敏感操作",
        "FP16/BF16": "神经网络训练",
        "FP64": "科学计算精度需求",
    },
    "异构计算": {
        "CPU": "数据预处理/IO/控制流",
        "GPU": "模型训练/推理",
        "FPGA": "低延迟推理/边缘部署",
    },
    "存储I/O": {
        "问题": "PB级数据的高效读取",
        "方案": "并行文件系统(Lustre/GPFS)",
        "优化": "预取/缓存/数据流水线",
    },
}

# 科学AI训练示例 (AlphaFold):
# ├── 硬件: 128 TPU v3 cores
# ├── 时间: ~1 周
# ├── 数据: PDB + UniProt + MSA 数据库
# └── 存储: ~2 TB 数据库

# GenCast 训练:
# ├── 硬件: TPU v5 Pod
# ├── 数据: ERA5 再分析 (1979-2018)
# ├── 时间: 数天
# └── 存储: ~100 TB 气象数据`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 大规模实验管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> experiment_management</div>
                <pre className="fs-code">{`# 科学 AI 实验管理最佳实践

# 科学AI实验的复杂性:
# ├── 超参数: 模型+训练+数据 100+个参数
# ├── 数据版本: 不同数据集/预处理/分割
# ├── 环境: 软件版本/CUDA版本/随机种子
# ├── 规模: 数百个实验运行
# └── 团队协作: 跨实验室/跨国合作

# ═══ 实验追踪工具 ═══
tracking_tools = {
    "Weights & Biases (W&B)": {
        "特点": "最流行/美观/团队协作",
        "功能": [
            "自动超参数记录",
            "实时训练曲线",
            "超参数扫描(Sweeps)",
            "模型版本管理(Artifacts)",
            "报告生成(Reports)",
        ],
        "科学AI应用": "DeepMind/Meta 广泛使用",
    },
    "MLflow": {
        "特点": "开源/本地部署/企业级",
        "功能": [
            "实验追踪(Tracking)",
            "项目打包(Projects)",
            "模型注册(Registry)",
            "部署服务(Serving)",
        ],
        "适用": "安全/合规要求高的场景",
    },
    "Neptune.ai": "注重协作/科研团队",
    "CometML": "ML实验平台",
    "TensorBoard": "TensorFlow原生/基础功能",
}

# ═══ 超参数优化 ═══
hpo = {
    "网格搜索": "简单但低效 (维度灾难)",
    "随机搜索": "高维更高效 (Bergstra 2012)",
    "贝叶斯优化": {
        "Optuna": "Python原生, TPE/CMA-ES",
        "Ray Tune": "分布式HPO, 丰富调度器",
        "BoTorch": "PyTorch贝叶斯优化",
    },
    "多保真度": {
        "ASHA": "异步逐次减半",
        "Hyperband": "早停低效配置",
    },
}

# ═══ 数据版本管理 ═══
data_versioning = {
    "DVC (Data Version Control)": {
        "方法": "Git-like数据版本管理",
        "存储": "S3/GCS/本地后端",
        "流水线": "DAG定义数据处理流程",
    },
    "HuggingFace Hub": {
        "用途": "模型和数据集发布/版本",
        "格式": "Git LFS支持大文件",
    },
    "Zenodo": "科学数据长期存档/DOI",
}

# 实验记录最佳实践:
# 1. 自动记录所有超参数 (不要手动)
# 2. 记录环境信息 (requirements.txt/conda)
# 3. 固定随机种子 (全面: numpy/torch/cuda)
# 4. 数据版本与代码版本绑定
# 5. 自动生成实验报告
# 6. 及时标记重要实验 (bookmark/tag)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 计算可复现性</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> reproducibility</div>
                <pre className="fs-code">{`# 可复现性: 科学AI的生命线

# 可复现性危机:
# Nature 调查: 70%+ 研究者无法复现他人结果
# ML 领域: 论文→代码→复现 成功率更低

# ═══ 不可复现的原因 ═══
causes = {
    "随机性": [
        "权重初始化",
        "数据打乱顺序",
        "Dropout",
        "GPU非确定性操作(atomicAdd)",
    ],
    "环境差异": [
        "PyTorch版本",
        "CUDA版本",
        "cuDNN版本",
        "操作系统差异",
    ],
    "数据问题": [
        "数据泄露(train/test overlap)",
        "预处理差异",
        "数据版本不一致",
    ],
    "代码问题": [
        "超参数未完全记录",
        "隐含的默认值",
        "实现细节遗漏",
    ],
}

# ═══ 确保可复现的实践 ═══

# 1. 随机种子管理
seed_management = """
import random, numpy as np, torch

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    # 确定性模式(可能牺牲性能)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    # PyTorch 2.0+
    torch.use_deterministic_algorithms(True)
"""

# 2. 环境管理
environment = {
    "conda-lock": "精确锁定conda环境",
    "Docker": "完全可复现的容器",
    "pip freeze": "记录所有Python包版本",
    "NVIDIA Container": "锁定CUDA/cuDNN版本",
}

# 3. 代码规范
code_practices = {
    "配置管理": "Hydra / OmegaConf (所有超参数)",
    "版本控制": "Git (代码) + DVC (数据)",
    "测试": "单元测试 + 回归测试",
    "文档": "README + 复现指南",
}

# 4. 论文清单
paper_checklist = [
    "代码公开 (GitHub link)",
    "数据可获取 (公开/申请流程)",
    "环境specification (requirements.txt/Docker)",
    "随机种子公开",
    "训练曲线/日志公开",
    "预训练模型公开 (HuggingFace/Zenodo)",
    "复现脚本 (一键运行)",
]

# 可复现性级别:
# ┌──────────┬──────────────────────────────┐
# │ 级别      │ 内容                          │
# ├──────────┼──────────────────────────────┤
# │ L1 代码  │ 代码+README 公开              │
# │ L2 环境  │ +Docker/conda环境文件          │
# │ L3 数据  │ +数据+预处理脚本              │
# │ L4 完整  │ +随机种子+训练日志+预训练权重  │
# │ L5 一键  │ +一键复现脚本+CI/CD验证        │
# └──────────┴──────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 科研 AI 平台与生态</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> science_platforms</div>
                <pre className="fs-code">{`# 科研 AI 平台与工具生态

# ═══ 云平台 ═══
cloud_platforms = {
    "Google Colab": {
        "免费GPU": "T4 (免费) / A100 (Pro)",
        "适合": "快速实验/教学/Demo",
        "限制": "内存/时间/存储",
    },
    "AWS ParallelCluster": {
        "功能": "自动配置HPC集群",
        "GPU": "P5(H100) / P4d(A100)",
        "适合": "大规模训练",
    },
    "Google Cloud HPC": {
        "功能": "TPU Pod / A3 GPU集群",
        "特点": "DeepMind同款基础设施",
    },
    "Azure ML": "ML工作流 + HPC混合",
}

# ═══ 科学计算平台 ═══
science_platforms = {
    "Materials Project": {
        "领域": "材料科学",
        "功能": "材料数据查询/计算/API",
        "工具": "pymatgen",
    },
    "AlphaFold DB": {
        "领域": "结构生物学",
        "功能": "2亿+蛋白质结构",
        "访问": "Web/API/批量下载",
    },
    "Open Catalyst Project": {
        "领域": "催化/能源",
        "功能": "催化剂ML数据+模型",
        "数据": "OC20/OC22基准",
    },
    "RCSB PDB": "蛋白质实验结构数据库",
    "ERA5 (ECMWF)": "全球气象再分析数据",
    "Cell×Gene": "人类细胞图谱数据",
}

# ═══ 框架 & 工具 ═══
frameworks = {
    "JAX/Flax": {
        "用户": "DeepMind (AlphaFold等)",
        "特点": "函数式/JIT/TPU原生",
    },
    "PyTorch": {
        "用户": "学术界主流",
        "科学扩展": [
            "PyG (图神经网络)",
            "e3nn (等变NN)",
            "TorchMD (分子动力学)",
        ],
    },
    "DeepChem": "化学/生物ML工具箱",
    "RDKit": "化学信息学 (分子操作)",
    "BioPython": "生物信息学工具",
    "MDAnalysis": "分子动力学分析",
    "ASE": "原子模拟环境",
    "pymatgen": "材料分析库",
}

# ═══ 未来趋势 ═══
future = {
    "AI+自动化实验室": {
        "A-Lab (Berkeley)": "AI设计+机器人合成",
        "自动驾驶实验室": "全自动化→AI闭环",
    },
    "AI+模拟交互": {
        "模式": "AI代理模型 + 物理模拟器",
        "案例": "NeuralGCM (ML+物理混合)",
    },
    "多模态科学AI": {
        "方向": "文本+图像+结构+实验数据",
        "工具": "科学多模态大模型",
    },
    "AI科学助手": {
        "方向": "AI阅读论文+设计实验+分析数据",
        "工具": "ChemCrow / Coscientist",
    },
}

# AI for Science 的终极愿景:
# ┌──────────────────────────────────────┐
# │  假说生成  ──→  实验设计  ──→  执行  │
# │      ↑                         │     │
# │      └── AI分析 ←── 数据采集 ←─┘     │
# │                                       │
# │  AI 驱动的自主科学发现循环             │
# └──────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
