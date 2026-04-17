import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Evo/ESM-3', '基因表达预测', '单细胞分析', '蛋白质设计'];

export default function LessonGenomics() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔬 module_07 — AI 基因组学</div>
      <div className="fs-hero">
        <h1>AI 基因组学：Evo / ESM-3 / 基因表达预测 / 单细胞分析 / 蛋白质设计</h1>
        <p>
          Meta 的 <strong>ESM-3</strong> (98B 参数) 设计出自然界不存在的功能性蛋白质——
          相当于模拟了 5 亿年的自然进化。<strong>Evo</strong> 用 7B 参数的长序列模型
          统一理解 DNA/RNA/蛋白质。<strong>scGPT</strong> 等单细胞大模型正在重塑基因组学研究。
          本模块全面解析 AI 在基因组学和蛋白质工程中的前沿应用。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧬 AI 基因组学</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧪 生物序列大模型：Evo & ESM-3</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> bio_foundation_models</div>
                <pre className="fs-code">{`# 生物序列基座模型: DNA → RNA → 蛋白质

# 中心法则: DNA → (转录) → RNA → (翻译) → 蛋白质

# ═══ ESM-3 (Meta, 2024) ═══
ESM3 = {
    "参数": "98B (最大的蛋白质模型)",
    "训练数据": "27亿蛋白质序列+结构",
    "输入模态": {
        "序列": "氨基酸序列 token",
        "结构": "VQ-VAE 编码的3D结构",
        "功能": "InterPro 功能标签",
    },
    "三模态理解": """
    序列 ←→ 结构 ←→ 功能
    任意一个或多个模态→预测其余模态
    """,
    "突破": {
        "蛋白质设计": "设计出esmGFP (绿色荧光蛋白)",
        "意义": "与最近的天然GFP序列相似度<58%",
        "等价": "模拟了~5亿年的自然进化",
        "验证": "实验室验证→成功发光!",
    },
}

# ═══ Evo (Arc Institute, 2024) ═══
Evo = {
    "参数": "7B",
    "上下文长度": "131,072 tokens (131K)",
    "训练数据": "整个基因组序列",
    "架构": "StripedHyena (非Transformer)",
    "特点": {
        "统一模型": "DNA/RNA/蛋白质同一模型",
        "长序列": "131K上下文→全基因组级别",
        "生成式": "可生成DNA/RNA/蛋白质",
        "零样本": "无需微调预测基因功能",
    },
    "能力": [
        "预测突变的适应性效应",
        "生成功能性CRISPR系统",
        "理解基因组级别的调控",
    ],
}

# ═══ ESM-2 (Meta, 2023) ═══
ESM2 = {
    "参数": "15B / 3B / 650M / 150M",
    "训练": "自监督MLM (掩码预测)",
    "数据": "UniRef 蛋白质序列",
    "应用": [
        "蛋白质表征 (embedding)",
        "结构预测 (ESMFold)",
        "功能预测",
        "突变效应预测",
    ],
    "特点": "无需MSA, 纯语言模型方法",
}

# ═══ 其他重要模型 ═══
others = {
    "ProGen (Salesforce)": "蛋白质生成+条件控制",
    "ProtTrans (TU Munich)": "蛋白质BERT/GPT/T5",
    "Nucleotide Transformer": "DNA基座模型",
    "DNABERT-2": "DNA语言模型",
    "Hyena-DNA": "长序列DNA模型(100万bp)",
}

# 模型对比:
# ┌────────┬──────┬───────────┬──────────────┐
# │ 模型    │ 参数  │ 输入       │ 核心能力      │
# ├────────┼──────┼───────────┼──────────────┤
# │ ESM-3  │ 98B  │ 序列+结构  │ 蛋白质设计    │
# │ ESM-2  │ 15B  │ 蛋白质序列 │ 蛋白质理解    │
# │ Evo    │ 7B   │ DNA/RNA/蛋 │ 全序列统一    │
# │ AF2    │ ~93M │ MSA+模板   │ 结构预测      │
# └────────┴──────┴───────────┴──────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📊 基因表达与调控预测</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> gene_expression</div>
                <pre className="fs-code">{`# AI 预测基因表达与调控

# 核心问题:
# DNA序列 → 基因在什么组织/条件下表达多少?

# ═══ Enformer (DeepMind, 2021) ═══
Enformer = {
    "突破": "从DNA序列直接预测基因表达",
    "架构": "Transformer + 卷积",
    "输入": "~200kb DNA序列",
    "输出": "多组织基因表达量/表观遗传标记",
    "性能": "大幅超越CNN方法(Basenji)",
    "意义": "捕捉远端调控元件的影响",
}

# ═══ 变异效应预测 ═══
variant_effect = {
    "目标": "非编码区突变是否影响基因表达?",
    "方法": {
        "in silico 诱变": {
            "流程": "参考序列→突变→预测差异",
            "模型": "Enformer / Sei / Borzoi",
        },
        "进化信息": {
            "方法": "保守位点突变更可能有害",
            "工具": "CADD / DANN / Eigen",
        },
        "蛋白质": {
            "方法": "ESM-2 log-likelihood ratio",
            "意义": "零样本预测突变致病性",
        },
    },
}

# ═══ 表观遗传学 ═══
epigenetics = {
    "染色质可及性": {
        "数据": "ATAC-seq / DNase-seq",
        "AI": "序列→预测开放/关闭状态",
    },
    "组蛋白修饰": {
        "数据": "ChIP-seq (H3K4me3, H3K27ac等)",
        "AI": "预测不同修饰模式",
    },
    "DNA甲基化": {
        "数据": "WGBS / RRBS",
        "AI": "预测甲基化位点",
    },
    "3D基因组": {
        "数据": "Hi-C / Micro-C",
        "AI": "预测染色质3D结构和TAD",
    },
}

# ═══ 调控元件预测 ═══
regulatory = {
    "启动子识别": "预测是否为转录起始位点",
    "增强子预测": "预测远端调控元件",
    "TF结合位点": "预测转录因子结合位",
    "剪接位点": "预测RNA剪接模式",
    "modisco": "从DL注意力图提取基序",
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 AI 单细胞分析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> single_cell_ai</div>
                <pre className="fs-code">{`# AI ×  单细胞组学

# 单细胞测序: 测量每个细胞的基因表达
# 传统bulk测序: 组织平均值 → 丢失细胞异质性
# 单细胞: 每个细胞一条数据 → 看见细胞多样性

# ═══ 单细胞大模型 ═══
scFM = {
    "scGPT (Bo Wang Lab, 2024)": {
        "架构": "GPT-style 预训练",
        "数据": "3300万人类细胞",
        "能力": [
            "细胞类型注释 (零样本)",
            "基因扰动预测",
            "多组学整合",
            "基因网络推断",
        ],
        "创新": "基因表达→token化→自回归预训练",
    },
    "Geneformer (Harvard, 2024)": {
        "数据": "~3000万人类细胞",
        "方法": "基因rank→Transformer",
        "应用": "疾病分类/基因调控/药物响应",
    },
    "scFoundation (2023)": {
        "参数": "100M",
        "数据": "5000万人类细胞",
        "特点": "多任务预训练",
    },
    "UCE (Universal Cell Embeddings)": {
        "方法": "跨物种细胞嵌入",
        "应用": "零样本细胞类型迁移",
    },
}

# ═══ 传统分析 + AI 增强 ═══
analysis_pipeline = """
传统 scRNA-seq 分析流程:
1. 质控 → AI: 自动阈值/doublet检测
2. 标准化 → scVI (VAE去批次)
3. 降维 → UMAP/tSNE可视化
4. 聚类 → Leiden/Louvain
5. 标注 → AI: 自动细胞类型注释
6. 差异分析 → AI: 增强统计功效
7. 轨迹推断 → AI: 连续轨迹学习
8. 基因调控网络 → AI: GRN推断
"""

# ═══ 关键 AI 增强 ═══
ai_enhancements = {
    "去噪/插补": {
        "DCA": "深度计数自编码器",
        "scVI": "变分推理 (Variational Inference)",
        "MAGIC": "扩散去噪",
    },
    "批次效应": {
        "scVI": "VAE建模批次变量",
        "Harmony": "经典整合方法",
        "scANVI": "有标签的半监督整合",
    },
    "空间转录组": {
        "问题": "空间位置+基因表达",
        "工具": "STAGATE / SpaceFlow / Tangram",
        "应用": "组织结构→功能映射",
    },
}

# 工具生态:
# ├── Scanpy (Python): 标准分析框架
# ├── Seurat (R): 另一个标准框架
# ├── scvi-tools: 深度学习方法集
# ├── CellRank: 细胞命运分析
# ├── SCENIC+: 基因调控网络
# └── Cell×Gene: 人类细胞图谱数据平台`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧬 AI 蛋白质设计</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> protein_design</div>
                <pre className="fs-code">{`# AI 蛋白质设计: 从理解到创造

# 蛋白质预测 (理解): 序列 → 结构 (AlphaFold)
# 蛋白质设计 (创造): 功能需求 → 序列 + 结构

# ═══ 设计范式 ═══

# 1. 从头设计 (De novo)
de_novo = {
    "RFdiffusion (Baker Lab, 2023)": {
        "方法": "扩散模型生成骨架结构",
        "输入": "功能约束(结合位点/对称性/尺寸)",
        "输出": "全新蛋白质3D骨架",
        "验证": "实验验证多个设计",
        "意义": "蛋白质设计的DALL-E时刻",
    },
    "Chroma (Generate Bio)": {
        "方法": "可编程蛋白质生成",
        "特点": "条件式扩散(指定形状/对称性)",
    },
    "FrameDiff (Google)": "SE(3)扩散蛋白质生成",
}

# 2. 逆折叠 (Inverse Folding)
inverse_folding = {
    "定义": "给定3D骨架→设计最佳序列",
    "ProteinMPNN (Baker Lab)": {
        "方法": "GNN在backbone上预测序列",
        "优势": "设计序列→实验折叠成功率~60%",
        "意义": "远超传统Rosetta (~20%)",
    },
    "ESM-IF1 (Meta)": {
        "方法": "ESM逆折叠模型",
        "训练": "12M 结构-序列对",
    },
    "LM-Design": "语言模型辅助设计",
}

# 3. 定向进化模拟
directed_evolution = {
    "原理": "模拟自然进化→优化蛋白质功能",
    "AI加速": {
        "适应性预测": "预测突变对功能的影响",
        "搜索引导": "AI选择有望的突变",
        "多轮优化": "AI替代实验筛选",
    },
    "工具": ["EVmutation", "DeepSequence", "EVE"],
}

# ═══ 设计流程 (现代最佳实践) ═══
design_pipeline = """
1. 定义目标功能
   └── 结合特定靶点/催化特定反应/具有特定形状

2. 骨架生成 (RFdiffusion)
   └── 输入: 功能约束 → 输出: 多个骨架候选

3. 序列设计 (ProteinMPNN)
   └── 输入: 骨架 → 输出: 多条候选序列

4. 结构验证 (AlphaFold)
   └── 重新预测→与设计骨架对比→筛选一致的

5. 性质预测 (AI模型)
   └── 稳定性/溶解度/表达量 预筛选

6. 实验验证
   └── 合成→表达→纯化→活性测定
"""

# 成功案例:
# ├── RSV疫苗稳定剂蛋白 (RFdiffusion设计)
# ├── 新型荧光蛋白 esmGFP (ESM-3设计)
# ├── 靶向PD-L1的微型蛋白 (Baker Lab)
# ├── 金属结合蛋白 (从头设计的金属酶)
# └── 纳米笼/纳米管 (自组装结构)

# 蛋白质设计的影响:
# ├── 新型药物 (蛋白质药物/疫苗)
# ├── 工业酶 (生物催化/合成生物学)
# ├── 生物材料 (蛋白质纤维/水凝胶)
# ├── 诊断工具 (生物传感器)
# └── 基础研究 (验证结构-功能关系)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
