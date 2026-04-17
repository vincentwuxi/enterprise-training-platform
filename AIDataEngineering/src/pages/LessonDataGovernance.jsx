import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['版权合规', '隐私保护', '数据血缘', '成本优化'];

export default function LessonDataGovernance() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🏗️ module_08 — 数据治理与合规</div>
      <div className="fs-hero">
        <h1>数据治理：合规是 AI 的生命线</h1>
        <p>
          NYT 起诉 OpenAI、Getty 起诉 Stability AI——数据版权已成为 AI 行业最大法律风险。
          本模块覆盖版权合规（训练数据授权/Fair Use/opt-out）、
          隐私保护（GDPR/CCPA/个人信息脱敏）、
          数据血缘追踪（Lineage/Provenance/审计）、
          以及数据成本优化（存储/标注/计算的 ROI 最大化）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚖️ 数据治理</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📜 版权与训练数据合规</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> copyright</div>
                <pre className="fs-code">{`AI 训练数据版权: 2025 现状

法律风险全景:
┌──────────────────────────────────────────────────┐
│ 主要诉讼案例:                                     │
│ ├── NYT vs OpenAI (2023.12)                       │
│ │   指控: ChatGPT "逐字"输出 NYT 文章              │
│ │   状态: 进行中, 索赔数十亿美元                    │
│ ├── Getty vs Stability AI (2023.01)                │
│ │   指控: 未授权使用 1200万张 Getty 图片训练          │
│ │   状态: 部分胜诉                                 │
│ ├── 作家工会 vs OpenAI                             │
│ │   指控: 未授权使用书籍训练                        │
│ └── 音乐版权方 vs Suno/Udio                        │
│     指控: AI 音乐生成侵犯版权                       │
└──────────────────────────────────────────────────┘

合规策略:
┌──────────────────────────────────────────────────┐
│ 1. 数据授权 (Licensing)                            │
│    ├── 与数据提供方签订训练授权协议                   │
│    ├── 使用明确许可的开源数据                        │
│    │   ├── CC-BY: 需署名                           │
│    │   ├── CC-BY-SA: 需署名+相同协议               │
│    │   ├── MIT/Apache: 代码类                      │
│    │   └── Public Domain: 无限制                   │
│    └── 购买商业数据集 (Reuters, AP, etc.)            │
│                                                  │
│ 2. Fair Use 主张 (美国)                             │
│    ├── 变革性使用 (Transformative)                   │
│    ├── 非商业/教育目的                              │
│    ├── 使用量合理                                   │
│    └── 不影响原作品市场                             │
│    ⚠️ 法院尚未形成一致判例                          │
│                                                  │
│ 3. Opt-out 机制                                    │
│    ├── robots.txt 尊重                             │
│    ├── 数据提供方退出渠道                           │
│    ├── AI-specific opt-out (ai.txt)                │
│    └── 事后删除机制 (Machine Unlearning)             │
│                                                  │
│ 4. 数据溯源记录                                    │
│    ├── 记录每条数据的来源和许可                      │
│    ├── 审计追踪 (Audit Trail)                       │
│    └── Data Card (数据说明书)                       │
└──────────────────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔒 隐私保护法规</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> privacy_laws</div>
                <pre className="fs-code">{`全球隐私法规要点:

┌──────────┬──────────────────────┐
│ 法规      │ 对 AI 训练数据的要求  │
├──────────┼──────────────────────┤
│ GDPR     │ ・合法基础 (同意/正当利益)│
│ (欧盟)   │ ・数据最小化原则       │
│          │ ・被遗忘权 (删除请求)  │
│          │ ・数据保护影响评估     │
│          │ ・罚款: 营收4%或2千万€ │
├──────────┼──────────────────────┤
│ CCPA     │ ・消费者知情权         │
│ (加州)   │ ・opt-out 权利        │
│          │ ・不得歧视行使权利者   │
│          │ ・罚款: $7500/次       │
├──────────┼──────────────────────┤
│ 个保法   │ ・明示同意             │
│ (中国)   │ ・目的限定             │
│          │ ・数据本地化存储       │
│          │ ・跨境传输审批         │
├──────────┼──────────────────────┤
│ EU AI Act│ ・高风险AI系统         │
│ (2024)   │ ・训练数据记录义务     │
│          │ ・透明度要求           │
│          │ ・版权训练数据声明     │
└──────────┴──────────────────────┘

PII 处理:
├── 检测: PII Detector (名字/邮箱/电话)
├── 脱敏: 替换为占位符 [NAME] [EMAIL]
├── 差分隐私: 统计层面保护
└── 联邦学习: 数据不出域`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🛡️ PII 脱敏实战</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> pii.py</div>
                <pre className="fs-code">{`# PII 检测与脱敏

import re
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

class PIIHandler:
    """个人身份信息检测与脱敏"""
    
    def __init__(self):
        self.analyzer = AnalyzerEngine()
        self.anonymizer = AnonymizerEngine()
    
    def detect_pii(self, text, language="zh"):
        """检测文本中的 PII"""
        results = self.analyzer.analyze(
            text=text,
            entities=[
                "PERSON",           # 人名
                "PHONE_NUMBER",     # 电话
                "EMAIL_ADDRESS",    # 邮箱
                "CREDIT_CARD",      # 信用卡
                "IBAN_CODE",        # 银行账号
                "IP_ADDRESS",       # IP 地址
                "LOCATION",         # 地址
                "DATE_TIME",        # 日期
                "NRP",              # 国籍/种族/政治
                "MEDICAL_LICENSE",  # 医疗信息
            ],
            language=language
        )
        return results
    
    def anonymize(self, text, strategy="replace"):
        """脱敏处理"""
        if strategy == "replace":
            # "张三的电话是13912345678"
            # → "[PERSON]的电话是[PHONE]"
            return self.anonymizer.anonymize(text)
        
        elif strategy == "synthetic":
            # "张三的电话是13912345678"
            # → "李四的电话是13987654321"
            return self.replace_with_synthetic(text)
        
        elif strategy == "hash":
            # "张三" → "a1b2c3"
            return self.hash_pii(text)

# 处理规模:
# 预训练数据 15T token → PII 检测
# 需要: 分布式处理 (Spark/Ray)
# 误检率: ~5% (宁可多删不要漏)
# 漏检率: ~1% (必须极低)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 数据血缘追踪</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> lineage</div>
                <pre className="fs-code">{`# —— 数据血缘 (Data Lineage): 每条数据从哪来? ——

# 问题: 模型输出了有问题的内容 → 是哪条训练数据导致的?
# 答案: 数据血缘追踪

数据血缘系统:
┌─────────────────────────────────────────────────────────┐
│ 数据来源层                                               │
│ ├── 来源 ID (URL/数据集名/供应商)                         │
│ ├── 采集时间                                             │
│ ├── 原始格式                                             │
│ └── 版权/许可证                                          │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 处理追踪层                                               │
│ ├── 清洗: 哪些规则被应用?                                 │
│ ├── 过滤: 为什么保留/丢弃?                                │
│ ├── 标注: 谁标注的? 什么时间?                             │
│ ├── 增强: 原始数据是什么?                                 │
│ └── 去重: 与哪些数据重复?                                 │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 训练关联层                                               │
│ ├── 训练实验 ID                                          │
│ ├── 数据版本号                                           │
│ ├── 混合比例配置                                         │
│ └── 模型版本号                                           │
└─────────────────────────────────────────────────────────┘

实现: Data Card (数据说明书)
{
    "name": "training-data-v3.2",
    "size": "5TB / 2T tokens",
    "sources": [
        {"name": "FineWeb", "ratio": 0.50, "license": "ODC-BY"},
        {"name": "StarCoder", "ratio": 0.17, "license": "OpenRAIL"},
        {"name": "mathpile", "ratio": 0.10, "license": "CC-BY-SA"},
    ],
    "processing": {
        "dedup": "MinHash (threshold=0.8)",
        "filter": "FineWeb-Edu score > 3",
        "pii": "Presidio (replace strategy)"
    },
    "known_issues": [
        "部分 Common Crawl 数据包含版权内容",
        "中文数据主要来自简体,繁体覆盖不足"
    ],
    "ethical_review": "通过 2025-01-15"
}

工具:
├── DVC (Data Version Control): 数据版本管理
├── MLflow: 实验-数据关联追踪
├── Apache Atlas: 企业级数据治理
├── OpenLineage: 开放血缘标准
└── HuggingFace Data Cards: 社区标准`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>💰 数据成本优化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> cost</div>
                <pre className="fs-code">{`数据项目成本结构:

典型 LLM 训练数据项目:
┌──────────────┬─────────┬──────┐
│ 成本项        │ 金额     │ 占比 │
├──────────────┼─────────┼──────┤
│ 数据采集      │ $50K    │ 10%  │
│ 数据清洗      │ $80K    │ 16%  │
│ 人工标注      │ $200K   │ 40%  │
│ 质量控制      │ $30K    │ 6%   │
│ 存储          │ $40K    │ 8%   │
│ 计算 (处理)   │ $60K    │ 12%  │
│ 管理/工具     │ $40K    │ 8%   │
├──────────────┼─────────┼──────┤
│ 总计          │ $500K   │ 100% │
└──────────────┴─────────┴──────┘

成本优化策略:

1️⃣ 标注成本 (↓ 60-80%)
├── LLM 预标注 + 人工审核
├── 主动学习 (只标最有价值的)
├── 弱监督 (Snorkel/规则标注)
└── 自训练 (Self-Training)

2️⃣ 存储成本 (↓ 30-50%)
├── 冷热分层 (S3 IA/Glacier)
├── 压缩 (Parquet/Zstd)
├── 去除不需要的原始数据
└── 过期数据自动归档

3️⃣ 计算成本 (↓ 30-40%)
├── Spot Instance (AWS/GCP 竞价)
├── 批处理 (非实时场景)
├── 增量处理 (只处理新增)
└── 高效去重 (避免重复计算)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 ROI 分析框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> roi</div>
                <pre className="fs-code">{`数据投资 ROI 分析:

核心公式:
ROI = (模型提升带来的收益 - 数据成本) / 数据成本

例: 客服 AI 项目
├── 数据成本: $100K (标注+处理)
├── 模型准确率: 85% → 92%
├── 人工客服节省: $500K/年
├── ROI = ($500K-$100K)/$100K = 400%

数据投资优先级矩阵:
┌──────────┬──────────┬──────────┐
│          │ 低成本   │ 高成本    │
├──────────┼──────────┼──────────┤
│ 高收益   │ ⭐⭐⭐⭐⭐  │ ⭐⭐⭐     │
│          │ 立即做!  │ 谨慎评估  │
├──────────┼──────────┼──────────┤
│ 低收益   │ ⭐⭐⭐    │ ⭐        │
│          │ 批量处理 │ 不做!     │
└──────────┴──────────┴──────────┘

数据质量 vs 数量的投资建议:
├── 数据 < 1K: 投资质量 (精标)
├── 数据 1K-100K: 平衡质量+数量
├── 数据 > 100K: 投资过滤+策展
└── 数据 > 1M: 投资自动化管线

关键指标:
├── 每 1% 准确率提升的数据成本
├── 标注效率 (条/人/小时)
├── 数据新鲜度 (更新频率)
├── 数据覆盖率 (场景完整度)
└── 数据 Time-to-Value (采集到上线)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
