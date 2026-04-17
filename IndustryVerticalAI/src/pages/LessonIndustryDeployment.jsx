import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['行业合规', '私有化部署', '行业大模型', '数据安全'];

export default function LessonIndustryDeployment() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🏭 module_08 — 行业 AI 部署</div>
      <div className="fs-hero">
        <h1>行业 AI 部署：合规 / 私有化 / 行业大模型 / 数据安全</h1>
        <p>
          行业 AI 落地的最后一公里——不是技术问题，是<strong>部署和合规</strong>问题。
          本模块覆盖行业 AI 合规要求（各行业监管/审批/认证流程）、
          私有化部署（本地推理/混合云/边缘部署）、
          行业大模型微调（垂直领域 SFT/RLHF/数据准备）、
          以及数据安全（加密推理/联邦学习/隐私计算）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🚀 行业部署</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 各行业 AI 合规要求</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> compliance_matrix</div>
                <pre className="fs-code">{`行业 AI 合规矩阵:

┌──────────┬──────────────────┬──────────────────┬──────────┐
│ 行业      │ 监管机构          │ 关键法规          │ AI审批    │
├──────────┼──────────────────┼──────────────────┼──────────┤
│ 金融      │ 央行/银保监/证监  │ 《金融科技发展规划》│ 算法备案  │
│          │ SEC/FCA (海外)    │ 《人工智能指引》    │ 模型审计  │
│          │                  │ 算法推荐管理规定    │ 6-12月   │
├──────────┼──────────────────┼──────────────────┼──────────┤
│ 医疗      │ NMPA / FDA       │ 《医疗器械管理条例》│ 三类器械  │
│          │ CE (欧洲)        │ AI/ML-based SaMD  │ 12-24月  │
│          │                  │ HIPAA (美)         │ 临床验证  │
├──────────┼──────────────────┼──────────────────┼──────────┤
│ 法律      │ 司法部/法院      │ 《法律AI使用指南》  │ 无强制    │
│          │                  │ 律师职业道德        │ 但需标注  │
│          │                  │                    │ AI辅助    │
├──────────┼──────────────────┼──────────────────┼──────────┤
│ 教育      │ 教育部           │ 《教育AI管理办法》  │ 内容审核  │
│          │ COPPA (美)       │ 学生数据保护        │ 3-6月    │
├──────────┼──────────────────┼──────────────────┼──────────┤
│ 制造      │ 市场监管总局     │ 安全生产法          │ 因场景    │
│          │ ISO/IEC          │ 机器安全标准        │ 而异      │
├──────────┼──────────────────┼──────────────────┼──────────┤
│ 通用      │ 网信办           │ 《生成式AI管理办法》│ 大模型    │
│          │                  │ 《算法推荐管理规定》│ 备案制    │
│          │ EU AI Act        │ 风险分级管理        │ 高风险    │
│          │                  │                    │ 需评估    │
└──────────┴──────────────────┴──────────────────┴──────────┘

合规流程 (通用):
1. 数据合规评估 → 数据来源/授权/脱敏
2. 算法安全评估 → 偏见/公平/安全测试
3. 影响评估 (AIIA) → 社会影响分析
4. 备案/审批 → 提交监管部门
5. 持续监控 → 运营期合规保证

⚠️ 合规是行业AI的入场券, 不是附加项!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏢 AI 私有化部署</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> deployment.py</div>
                <pre className="fs-code">{`# —— 行业 AI 私有化部署方案 ——

部署方案对比:
┌──────────────┬──────────┬──────────┬──────────┐
│ 方案          │ 安全性    │ 成本      │ 适用场景  │
├──────────────┼──────────┼──────────┼──────────┤
│ 公有云 API    │ ★★       │ ★★★★★   │ 非敏感场景│
│ VPC 专属实例  │ ★★★      │ ★★★      │ 一般企业  │
│ 私有云部署    │ ★★★★     │ ★★       │ 金融/医疗 │
│ 本地服务器    │ ★★★★★   │ ★        │ 军工/政府 │
│ 边缘设备      │ ★★★★★   │ ★★★      │ 工厂/医院 │
└──────────────┴──────────┴──────────┴──────────┘

本地部署架构:
┌─────────────────────────────────────────────┐
│                 企业内网                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ GPU 集群  │  │ 模型服务  │  │ 向量数据库│   │
│  │ A100/H100│  │ vLLM/TGI │  │ Milvus   │   │
│  │ ×8-16    │  │ Triton   │  │ Weaviate │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                      ↕                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ API 网关  │  │ 业务系统  │  │ 监控告警  │   │
│  │ Kong     │  │ CRM/ERP  │  │ Grafana  │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────┘

模型选型 (私有化):
┌──────────────┬──────┬──────┬──────────────┐
│ 模型          │ 参数  │ GPU   │ 适用          │
├──────────────┼──────┼──────┼──────────────┤
│ Qwen2.5-7B   │ 7B   │ 1×A100│ 基础问答/分类 │
│ Qwen2.5-72B  │ 72B  │ 4×A100│ 复杂推理/生成 │
│ Llama 3.1-70B│ 70B  │ 4×A100│ 英文场景      │
│ DeepSeek-V3  │ 671B │ 8×H100│ 高性能需求    │
│ GLM-4        │ 130B │ 8×A100│ 中文增强      │
└──────────────┴──────┴──────┴──────────────┘

成本估算 (自建 vs 云):
├── 自建 8×A100: $300K 硬件 + $60K/年运维
│   → 适合日均 100万+ 次调用
├── 云 GPU: $2-8/小时/卡
│   → 适合日均 <10万 次调用
└── 混合方案: 基线自建 + 峰值云端`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 行业大模型微调</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> domain_finetune.py</div>
                <pre className="fs-code">{`# —— 行业大模型微调: 通用 → 专业 ——

class DomainModelTraining:
    """行业垂直大模型微调全流程"""
    
    # 微调层次:
    # 通用LLM → 领域预训练 → SFT → RLHF → 部署
    
    def prepare_training_data(self, domain="finance"):
        """行业微调数据准备"""
        
        # 1. 领域语料 (Continue Pre-Training, CPT)
        domain_corpus = {
            "金融": [
                "年报/季报 × 50万份",
                "研究报告 × 100万篇",
                "金融新闻 × 1000万条",
                "法规政策 × 10万条",
                "金融教材 × 5000本",
            ],
            "医疗": [
                "临床指南 × 5000份",
                "PubMed论文 × 500万篇",
                "病历 (脱敏) × 100万份",
                "药品说明书 × 20万份",
                "医学教材 × 3000本",
            ],
            "法律": [
                "裁判文书 × 5000万份",
                "法律法规 × 60万条",
                "司法解释 × 2万条",
                "法学论文 × 50万篇",
                "合同模板 × 10万份",
            ],
        }
        
        # 2. SFT 指令数据 (Supervised Fine-Tuning)
        sft_data = self.create_instruction_data(domain)
        # 格式: {"instruction": "...", "input": "...", "output": "..."}
        # 数量: 1万 - 10万条 (质量 > 数量)
        # 方法: 人工标注 + LLM合成 + 质量筛选
        
        # 3. 对齐数据 (DPO/RLHF)
        preference_data = self.create_preference_data(domain)
        # 格式: {"prompt": "...", "chosen": "...", "rejected": "..."}
        # 数量: 5000 - 50000 条
        # 方法: 领域专家评估
        
        return domain_corpus, sft_data, preference_data
    
    def train(self, base_model, data):
        """微调训练"""
        # 高效微调: LoRA / QLoRA
        # Parameters: 
        #   lora_rank: 64
        #   lora_alpha: 128
        #   target_modules: [q_proj, k_proj, v_proj, o_proj]
        #   learning_rate: 2e-5
        #   epochs: 3
        #   batch_size: 4 (gradient accumulation 8)
        
        # 训练资源:
        # 7B LoRA: 1×A100, 4-8小时
        # 72B QLoRA: 4×A100, 24-48小时
        # 全参数 72B: 32×A100, 5-7天
        pass

# 行业大模型产品:
# ├── 金融: BloombergGPT, 度小满金融大模型
# ├── 医疗: Med-PaLM, HuatuoGPT, 灵医
# ├── 法律: 通义法睿, ChatLaw, LawGPT
# ├── 教育: MathGPT, EduGPT
# └── 制造: 盘古工业大模型, 工业GPT`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔐 AI 数据安全</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> data_security</div>
                <pre className="fs-code">{`行业 AI 数据安全方案:

1️⃣ 数据脱敏
├── 姓名/身份证: 张** / 310***1234
├── 手机号: 138****5678
├── 地址: 上海市***区
├── 医疗记录: 去标识化
├── 金融数据: 账号掩码
└── 工具: Presidio / piiano

2️⃣ 联邦学习
├── 数据不出域, 模型参数交换
├── 横向: 同特征不同样本 (跨医院)
├── 纵向: 同样本不同特征 (银行+电信)
├── 安全聚合: 加密梯度
└── 框架: FATE / PySyft / Flower

3️⃣ 可信执行环境 (TEE)
├── Intel SGX / ARM TrustZone
├── 数据加密处理, 不可窃取
├── 适用: 多方数据合作
└── 性能: 比明文慢 2-5x

4️⃣ 差分隐私 (DP)
├── 训练时加噪声
├── 防止模型记忆个人数据
├── 权衡: 隐私 vs 精度
└── 框架: Opacus (PyTorch)

5️⃣ 模型安全
├── 对抗攻击防御
├── 模型水印 (知识产权)
├── Prompt Injection 防护
├── 输出审核 (内容安全)
└── 模型加密 (防盗用)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 行业 AI 成熟度评估</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> maturity</div>
                <pre className="fs-code">{`行业 AI 成熟度评估表:

评估维度 (每项 1-5 分):

1. 战略层面
├── AI 纳入企业战略? ___
├── 高管支持力度?     ___
└── 预算投入占比?     ___

2. 数据层面
├── 数据质量评分?     ___
├── 数据治理成熟度?   ___
└── 数据平台建设?     ___

3. 技术层面
├── AI 团队规模?      ___
├── MLOps 成熟度?     ___
└── 基础设施完备?     ___

4. 应用层面
├── AI 落地场景数?    ___
├── 业务价值量化?     ___
└── 用户采纳度?       ___

5. 治理层面
├── AI 伦理规范?      ___
├── 合规流程健全?     ___
└── 风险管控能力?     ___

总分解读:
├── 60-75: ⭐⭐⭐⭐⭐ 引领者
├── 45-60: ⭐⭐⭐⭐ 应用者
├── 30-45: ⭐⭐⭐ 实践者
├── 15-30: ⭐⭐ 探索者
└── <15:   ⭐ 观望者

行业 AI 下一步:
├── 多模态 AI 行业应用
├── AI Agent 自动化工作流
├── 行业小模型 (高效/合规)
├── AI + IoT 边缘智能
└── 可信 AI (可解释+公平)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
