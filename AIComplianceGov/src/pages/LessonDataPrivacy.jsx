import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['GDPR × AI', '隐私增强技术', 'DPIA 实务', '匿名化工程'];

export default function LessonDataPrivacy() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">⚖️ module_04 — AI 数据隐私</div>
      <div className="fs-hero">
        <h1>AI 数据隐私：GDPR × AI / 数据最小化 / 匿名化 / DPIA</h1>
        <p>
          AI 系统天然是"数据饥渴"的——需要海量数据训练，但<strong>数据保护法</strong>要求数据最小化。
          如何在训练高效 AI 模型的同时遵守 GDPR、PIPL 等数据保护法律？
          本模块深入探讨 AI 场景下的数据隐私挑战，包括合法性基础选择、
          <strong>隐私增强技术 (PETs)</strong>、数据保护影响评估 (DPIA) 及匿名化工程实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔒 AI 数据隐私</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ GDPR 与 AI 的冲突点</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> gdpr_ai_conflicts</div>
                <pre className="fs-code">{`# GDPR 核心原则 vs AI 训练需求

# 冲突矩阵:
┌────────────────────┬─────────────────┬──────────────────┐
│ GDPR 原则           │ AI 需求         │ 冲突等级          │
├────────────────────┼─────────────────┼──────────────────┤
│ 目的限制 (Art.5b)   │ 数据多次复用    │ 🔴 高冲突        │
│ 明确/特定用途       │ 探索性训练      │ 训练目的难预见    │
├────────────────────┼─────────────────┼──────────────────┤
│ 数据最小化 (Art.5c) │ 越多数据越好    │ 🔴 高冲突        │
│ 仅收集必要数据      │ 大规模预训练    │ 什么是"必要"?    │
├────────────────────┼─────────────────┼──────────────────┤
│ 存储限制 (Art.5e)   │ 长期保存训练集  │ 🟡 中等冲突      │
│ 用完即删           │ 持续微调迭代    │ 生命周期难定义    │
├────────────────────┼─────────────────┼──────────────────┤
│ 知情同意 (Art.7)    │ 网络爬取数据    │ 🔴 高冲突        │
│ 自由/明确/知情      │ 用户难以同意    │ 大模型训练无法    │
│                    │                │ 逐一获取同意      │
├────────────────────┼─────────────────┼──────────────────┤
│ 可解释权 (Art.22)   │ 黑盒模型       │ 🟡 中等冲突      │
│ 自动决策需解释      │ 深度学习不透明  │ 技术上难完全解释  │
├────────────────────┼─────────────────┼──────────────────┤
│ 删除权 (Art.17)     │ 模型记忆数据   │ 🔴 高冲突        │
│ 用户可要求删除      │ 无法从模型中    │ "机器遗忘"技术   │
│                    │ 精确删除数据    │ 尚不成熟          │
└────────────────────┴─────────────────┴──────────────────┘

# AI 训练数据的合法性基础选择:

# 选项 1: 同意 (Consent)
# ├── 优点: 最直接, 法律确定性高
# ├── 缺点: 大规模数据难以逐一获取
# ├── 适用: 用户主动提供的数据
# └── 风险: 撤回同意 → 需删除/重训练

# 选项 2: 合法利益 (Legitimate Interest)
# ├── 优点: 灵活, 不需逐一同意
# ├── 缺点: 需通过"平衡测试"
# ├── 适用: 商业AI产品开发
# └── 要求: 利益平衡评估(LIA)文档

# 选项 3: 科学研究 (Scientific Research)
# ├── 优点: GDPR 对研究有豁免
# ├── 缺点: 仅限非商业研究
# ├── 适用: 学术机构/研究项目
# └── 注意: 商业公司不能滥用此基础

# 选项 4: 公共利益 (Public Interest)
# ├── 优点: 政府/公共机构可用
# ├── 缺点: 范围有限
# ├── 适用: 公共卫生/安全/执法
# └── 注意: 需法律明确授权

# 实践建议:
# ├── AI SaaS → 合法利益 + 隐私政策
# ├── 医疗 AI → 同意 + DPIA
# ├── 开源模型 → 研究豁免 + 匿名化
# └── 企业内部 → 合法利益 + 雇员通知`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛡️ 隐私增强技术 (PETs) for AI</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> privacy_enhancing_tech</div>
                <pre className="fs-code">{`# 隐私增强技术在 AI 中的应用

# 1. 差分隐私 (Differential Privacy)
differential_privacy = {
    "原理": "向数据/梯度中添加校准噪声",
    "保证": "单个数据点的参与/不参与不影响输出",
    "参数": "ε (epsilon): 越小 → 越私密, 但精度降低",
    "应用": [
        "DP-SGD: 差分隐私随机梯度下降",
        "Apple: Safari搜索建议",
        "Google: Chrome使用统计",
        "US Census: 2020人口普查",
    ],
    "工具": [
        "Opacus (PyTorch DP训练)",
        "TensorFlow Privacy",
        "Google DP Library",
        "OpenDP (Harvard)",
    ],
    "trade-off": "ε=1 强隐私/精度↓ | ε=10 弱隐私/精度↑"
}

# 2. 联邦学习 (Federated Learning)
federated_learning = {
    "原理": "数据不动, 模型动——各节点本地训练",
    "保证": "原始数据不离开本地设备",
    "应用": [
        "Google Gboard 下一词预测",
        "Apple Siri 语音识别",
        "医院间联合建模 (不共享患者数据)",
        "金融机构反欺诈联合训练",
    ],
    "变体": [
        "横向联邦: 特征相同, 样本不同",
        "纵向联邦: 样本相同, 特征不同",
        "联邦迁移: 样本和特征都不同",
    ],
    "挑战": "通信开销大 / 异构数据 / 安全聚合"
}

# 3. 同态加密 (Homomorphic Encryption)
homomorphic_encryption = {
    "原理": "在密文上直接计算, 无需解密",
    "保证": "数据始终加密, 计算方看不到明文",
    "类型": [
        "部分同态 (PHE): 仅支持加/乘",
        "全同态 (FHE): 支持任意计算",
    ],
    "应用": "AI 推理即服务 (加密输入→加密推理→解密输出)",
    "挑战": "计算效率低 (比明文慢 1000x-1000000x)",
    "工具": ["Microsoft SEAL", "HElib", "Zama Concrete ML"]
}

# 4. 安全多方计算 (MPC)
secure_multiparty = {
    "原理": "多方联合计算, 互不泄露各自输入",
    "应用": "多家机构联合训练模型",
    "工具": ["CrypTen (Facebook)", "MP-SPDZ", "SecretFlow"]
}

# 5. 合成数据 (Synthetic Data)
synthetic_data = {
    "原理": "用AI生成统计特性相似的假数据",
    "应用": "替代真实数据用于开发/测试",
    "工具": ["Gretel.ai", "Mostly AI", "SDV", "CTGAN"],
    "注意": "需评估再识别风险 + 保持数据效用"
}

# 技术选型矩阵:
# ┌──────────────┬────────┬─────────┬──────────┐
# │ 技术          │ 隐私度  │ 精度损失 │ 计算成本 │
# ├──────────────┼────────┼─────────┼──────────┤
# │ 差分隐私      │ ⭐⭐⭐⭐ │ 中       │ 低       │
# │ 联邦学习      │ ⭐⭐⭐  │ 低       │ 高(通信) │
# │ 同态加密      │ ⭐⭐⭐⭐⭐│ 无       │ 极高     │
# │ 安全多方计算  │ ⭐⭐⭐⭐ │ 无       │ 高       │
# │ 合成数据      │ ⭐⭐⭐  │ 中-高    │ 中       │
# └──────────────┴────────┴─────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📝 DPIA 数据保护影响评估</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> dpia_template</div>
                <pre className="fs-code">{`# AI 系统数据保护影响评估 (DPIA) 模板

# 何时必须做 DPIA?
必须评估 = [
    "大规模处理特殊类别数据 (健康/生物/种族)",
    "系统性监控公共可访问区域",
    "自动决策产生法律或类似重大影响",
    "使用新技术 (AI/ML) 且可能高风险",
    "大规模处理个人数据用于模型训练",
]

# DPIA 文档结构:

Section_1 = "项目描述"
# ├── AI系统名称和版本
# ├── 数据控制者和处理者
# ├── AI系统的功能描述
# ├── 处理的个人数据类型
# ├── 数据来源
# ├── 数据主体类别
# ├── 处理规模 (数据量/频率)
# └── 数据流向图

Section_2 = "必要性与比例性评估"
# ├── 处理目的的合法性
# ├── 数据最小化论证
# │   └── "为什么需要这么多数据?"
# ├── 存储限制论证
# ├── 数据准确性措施
# └── 与AI性能的因果关系

Section_3 = "风险识别与评估"
# ┌──────────────┬──────┬──────┬──────┐
# │ 风险          │ 可能性│ 影响  │ 等级  │
# ├──────────────┼──────┼──────┼──────┤
# │ 训练数据泄露  │ 中    │ 高    │ 🔴   │
# │ 模型记忆攻击  │ 低    │ 高    │ 🟡   │
# │ 偏见歧视输出  │ 中    │ 高    │ 🔴   │
# │ 去匿名化     │ 低    │ 高    │ 🟡   │
# │ 功能蠕变     │ 中    │ 中    │ 🟡   │
# │ 模型推理泄露  │ 低    │ 中    │ 🟢   │
# └──────────────┴──────┴──────┴──────┘

Section_4 = "风险缓解措施"
# ├── 差分隐私训练 → 模型记忆攻击
# ├── 偏见检测+公平性测试 → 歧视风险
# ├── 匿名化/假名化 → 泄露风险
# ├── 访问控制+加密 → 数据安全
# ├── 模型审计日志 → 可追溯性
# └── 定期偏见监测 → 运行时风险

Section_5 = "DPO/利益相关方意见"
# ├── DPO (数据保护官) 审核意见
# ├── 法务部门意见
# ├── IT安全部门意见
# ├── 数据主体代表意见 (如适用)
# └── 最终批准签字

Section_6 = "审查与更新"
# ├── 首次评估日期
# ├── 计划审查日期 (至少年度)
# ├── 触发重评事件 (数据变更/模型升级)
# └── 评审记录`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔐 匿名化工程实践</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> anonymization_engineering</div>
                <pre className="fs-code">{`# AI 训练数据匿名化技术栈

# 匿名化 vs 假名化:
# ┌──────────────┬──────────────────┬──────────────────┐
# │              │ 匿名化            │ 假名化            │
# ├──────────────┼──────────────────┼──────────────────┤
# │ 定义         │ 不可逆去标识      │ 替换标识符        │
# │ GDPR适用     │ 不适用 (非个人数据)│ 仍适用           │
# │ 可恢复性     │ 不可恢复          │ 有密钥可恢复      │
# │ 数据效用     │ 较低              │ 较高             │
# │ 法律确定性   │ 高 (无合规义务)   │ 低 (仍有义务)     │
# │ 再识别风险   │ 需评估            │ 存在             │
# └──────────────┴──────────────────┴──────────────────┘

# 常用匿名化技术:

# 1. 数据脱敏 (Masking)
masking_techniques = {
    "泛化": "年龄30 → 25-35 | 邮编100084 → 1000**",
    "抑制": "删除直接标识符 (姓名/身份证/手机号)",
    "噪声添加": "工资50000 → 50000±2000",
    "微聚合": "将相似记录聚合为组均值",
    "数据交换": "组内随机交换属性值",
}

# 2. k-匿名性
k_anonymity = {
    "原理": "每条记录至少与k-1条记录不可区分",
    "实现": "准标识符泛化至相同分组",
    "示例": "k=5 → 每组至少5人",
    "工具": "ARX Data Anonymization Tool",
    "局限": "仍有同质性攻击/背景知识攻击"
}

# 3. l-多样性
l_diversity = {
    "原理": "每个等价类的敏感属性至少l个不同值",
    "解决": "k-匿名的同质性攻击问题",
}

# 4. t-接近性
t_closeness = {
    "原理": "等价类内敏感属性分布与全局分布差距<t",
    "解决": "更强的隐私保证",
}

# AI 训练数据匿名化流程:
# Step 1: 数据分类 (直接/准/敏感标识符)
# Step 2: 选择匿名化策略
# Step 3: 实施匿名化转换
# Step 4: 再识别风险评估
# Step 5: 数据效用评估 (训练后精度)
# Step 6: 文档记录

# 工具推荐:
# ├── ARX (开源匿名化框架)
# ├── Presidio (Microsoft, NER脱敏)
# ├── Amazon Macie (AWS数据发现)
# ├── Google DLP API (数据脱敏)
# └── sdcMicro (R包, 统计脱敏)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
