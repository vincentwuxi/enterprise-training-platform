import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['医学影像', '药物发现', '临床 NLP', '健康管理'];

export default function LessonMedicalAI() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🏭 module_04 — 医疗 AI</div>
      <div className="fs-hero">
        <h1>医疗 AI：影像诊断 / 药物发现 / 临床 NLP / 健康管理</h1>
        <p>
          医疗 AI 正在改变诊疗方式——FDA 已批准 800+ AI 医疗器械。
          本模块覆盖医学影像 AI（CT/MRI/病理/眼底/超声）、
          AI 药物发现（分子生成/靶点发现/临床试验优化）、
          临床 NLP（病历结构化/诊断辅助/知识图谱）、
          以及 AI 健康管理（慢病管理/远程监测/数字疗法）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🏥 医疗 AI</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔬 医学影像 AI</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> medical_imaging</div>
                <pre className="fs-code">{`# —— 医学影像 AI: 从辅助诊断到精准医疗 ——

医学影像 AI 应用全景:
┌────────────┬────────────┬────────┬────────────┐
│ 模态        │ 应用        │ AI精度  │ 成熟度     │
├────────────┼────────────┼────────┼────────────┤
│ X-ray 胸片  │ 肺结节筛查  │ AUC 0.95│ ⭐⭐⭐⭐⭐    │
│ CT 扫描     │ 肺癌/COVID │ AUC 0.96│ ⭐⭐⭐⭐⭐    │
│ 眼底照      │ 糖网/青光眼 │ AUC 0.97│ ⭐⭐⭐⭐⭐    │
│ 病理切片    │ 癌症分级    │ AUC 0.93│ ⭐⭐⭐⭐     │
│ MRI         │ 脑肿瘤/脊柱│ AUC 0.92│ ⭐⭐⭐⭐     │
│ 超声        │ 甲状腺/乳腺│ AUC 0.90│ ⭐⭐⭐      │
│ 皮肤照      │ 皮肤癌筛查 │ AUC 0.94│ ⭐⭐⭐⭐     │
│ 内窥镜      │ 息肉检测   │ AUC 0.91│ ⭐⭐⭐      │
└────────────┴────────────┴────────┴────────────┘

技术栈:
├── 分割: U-Net / nnUNet / SAM-Med
├── 分类: ResNet / EfficientNet / ViT
├── 检测: YOLO / Faster R-CNN
├── 生成: Diffusion (数据增强)
└── 多模态: 影像+报告 (LLaVA-Med)

    开发流程:
    1. 数据: 医院合作 → 脱敏 → 标注 (放射科医生)
    2. 标注: 3名医生标注, 高年资仲裁
    3. 模型: 预训练 (ImageNet→医学→特定) 迁移学习
    4. 验证: 多中心验证 (不同医院数据)
    5. 审批: FDA 510(k) / NMPA 三类医疗器械
    6. 部署: PACS 集成, DICOM 标准

⚠️ 关键挑战:
├── 数据: 隐私 (HIPAA/个保法), 标注贵 ($5-50/张)
├── 公平: 不同人群 (年龄/性别/种族) 性能一致
├── 监管: 医疗器械审批 (6-18个月)
├── 采纳: 医生信任度, 工作流集成
└── 责任: AI 误诊谁负责? (法律灰区)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💊 AI 药物发现</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> drug_discovery</div>
                <pre className="fs-code">{`# —— AI 药物发现: 从靶点到临床 ——

传统药物开发 vs AI 加速:
┌──────────────┬──────────┬──────────┐
│ 阶段          │ 传统      │ AI 加速   │
├──────────────┼──────────┼──────────┤
│ 靶点发现      │ 2-3 年   │ 3-6 月   │
│ 先导化合物    │ 1-2 年   │ 1-3 月   │
│ 药物优化      │ 1-2 年   │ 3-6 月   │
│ 临床前试验    │ 1-2 年   │ 6-12 月  │
│ 临床试验      │ 5-7 年   │ 3-5 年   │
├──────────────┼──────────┼──────────┤
│ 总计          │ 10-15 年 │ 5-8 年   │
│ 成本          │ $2-3B    │ $0.5-1B  │
│ 成功率        │ ~5%      │ ~15-20%  │
└──────────────┴──────────┴──────────┘

AI 在药物发现中的应用:

1️⃣ 靶点发现 (Target Discovery)
├── 知识图谱: 疾病-基因-蛋白质关联
├── NLP: 海量论文挖掘 (PubMed 3600万篇)
├── AlphaFold: 蛋白质结构预测 → 找可成药靶点
└── 工具: OpenTargets, DisGeNET

2️⃣ 分子生成 (Molecule Generation)
├── GNN: 分子图神经网络 (属性预测)
├── Diffusion: 3D 分子结构生成
├── SMILES Transformer: 序列式分子生成
├── 约束: 合成可行性/毒性/溶解度
└── 工具: RDKit, DeepChem

3️⃣ 虚拟筛选 (Virtual Screening)
├── 分子对接 (Docking): AutoDock + ML
├── 从数百万化合物→筛选数百个候选
├── ML 加速: 10万倍比传统快
└── 工具: Schrödinger, Atomwise

4️⃣ 临床试验优化
├── 患者招募: NLP 匹配合适受试者
├── 试验设计: 贝叶斯自适应设计
├── 终点预测: 预测试验成功率
└── 真实世界数据: EHR 分析

主要玩家:
├── Insilico Medicine: 肺纤维化药物 (临床II期)
├── Recursion: 细胞图像+ML ($600M融资)
├── Isomorphic Labs: DeepMind 分拆
├── Absci: 蛋白质/抗体设计
└── Exscientia: 肿瘤/免疫药物`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📋 临床 NLP</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> clinical_nlp.py</div>
                <pre className="fs-code">{`# 临床 NLP: 病历结构化 + 诊断辅助

class ClinicalNLP:
    """医疗NLP全链路"""
    
    # 1. 病历结构化
    async def structure_ehr(self, free_text):
        """非结构化病历 → 结构化"""
        result = await self.medical_llm.extract(f"""
从以下病历中提取结构化信息:

{free_text}

输出 JSON:
- chief_complaint: 主诉
- history: 病史
- symptoms: [症状列表]
- vital_signs: 生命体征
- diagnoses: [诊断列表, 含ICD-10编码]
- medications: [药物列表, 含剂量]
- lab_results: [检验结果]
- plan: 治疗方案
""")
        return result
    
    # 2. 辅助诊断
    async def diagnostic_assist(self, patient):
        """AI 辅助诊断建议"""
        response = await self.llm.generate(f"""
角色: 你是一名内科主治医师的AI助手。

主诉: {patient.complaint}
症状: {patient.symptoms}
检验: {patient.labs}
影像: {patient.imaging_report}

请分析:
1. 鉴别诊断 (按可能性排序)
2. 建议追加检查
3. 合理用药建议
4. 需转诊的红旗症状

⚠️ 本建议仅供参考,最终诊断需医生确认
""")
        return response
    
    # 3. 医学知识图谱
    # 实体: 疾病/症状/药物/检查/基因
    # 关系: 疾病-症状/药物-适应症/药物-副作用
    # 规模: 数百万医学概念

# 医学 LLM:
# ├── Med-PaLM 2 (Google): 医学QA SOTA
# ├── PMC-LLaMA: 开源医学LLM
# ├── HuatuoGPT: 中文医学LLM
# └── BioMistral: 生物医学LLM`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🩺 AI 健康管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> health</div>
                <pre className="fs-code">{`AI 健康管理应用:

1️⃣ 慢病管理
├── 糖尿病: 血糖预测+饮食建议
│   CGM数据 → ML预测 → 干预
├── 高血压: 用药提醒+风险预警
├── 心衰: 远程监测+恶化预警
└── 效果: 住院率 ↓ 30%

2️⃣ 可穿戴 AI
├── Apple Watch: 房颤检测 (FDA)
├── Fitbit: 睡眠呼吸暂停检测
├── Oura Ring: 健康趋势分析
├── 技术: 时序ML + 异常检测
└── 数据: PPG/加速度/温度

3️⃣ 数字疗法 (DTx)
├── 失眠: CBT-I 数字化
├── 抑郁: AI 对话+疗法引导
├── 戒烟: 行为干预+激励
├── ADHD: 注意力训练游戏
└── 监管: FDA 分类管理

4️⃣ 智能分诊
├── 症状 → AI预分诊 → 推荐科室
├── 紧急程度评估 (红黄绿)
├── 效果: 门诊等待 ↓ 40%
└── 案例: 平安好医生、微医

⚠️ 医疗 AI 伦理:
├── 不替代医生 (辅助角色)
├── 透明性 (可解释)
├── 公平性 (覆盖少数群体)
├── 隐私 (HIPAA/个保法)
└── 持续验证 (真实世界效果)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
