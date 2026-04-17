import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['场景选择', 'ROI 评估', 'MVP 策略', '组织能力'];

export default function LessonAILanding() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🏭 module_01 — 行业 AI 落地方法论</div>
      <div className="fs-hero">
        <h1>行业 AI 落地：从 Demo 到生产的死亡谷</h1>
        <p>
          87% 的 AI 项目无法上线——不是技术不行，是<strong>场景选错了</strong>。
          本模块提供一套系统的行业 AI 落地方法论：如何评估场景价值、
          量化 ROI、设计 MVP、以及构建组织 AI 能力。
          帮助你避开"技术很酷但客户不买单"的陷阱。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 落地方法论</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 AI 场景选择矩阵</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> scenario_matrix</div>
                <pre className="fs-code">{`AI 场景选择: 四象限矩阵

                  高业务价值
                     │
          ┌──────────┼──────────┐
          │          │          │
          │   💰     │    🌟    │
          │ 逐步推进  │  优先落地  │
          │ (技术难   │ (技术可行  │
          │  但值得)  │  价值高)  │
  低技术  ─┼──────────┼──────────┼─ 高技术
  可行性   │          │          │  可行性
          │   ❌     │    🔬    │
          │ 暂不考虑  │  技术储备  │
          │ (价值低   │ (技术行   │
          │  技术难)  │  但价值待验)│
          └──────────┼──────────┘
                     │
                  低业务价值

企业场景评估清单 (0-10分):

┌──────────────────┬──────┬──────────────────────────┐
│ 评估维度          │ 权重  │ 评分标准                  │
├──────────────────┼──────┼──────────────────────────┤
│ 1. 数据就绪度     │ 25%  │ 数据量/质量/可获取性       │
│ 2. 技术可行性     │ 20%  │ 现有模型能力/精度要求      │
│ 3. 业务价值       │ 25%  │ 降本/增效/合规 的量化收益  │
│ 4. 实施难度       │ 15%  │ 系统集成/流程改造复杂度    │
│ 5. 风险可控性     │ 15%  │ 失败影响/合规要求/安全性   │
└──────────────────┴──────┴──────────────────────────┘

加权总分 > 7.5 → 🌟 优先启动
加权总分 5-7.5 → 💰 评估后推进
加权总分 < 5   → ❌ 暂不推进

各行业最适合 AI 的场景:
├── 金融: 反欺诈(9.2)  风控(8.8)  智能客服(8.5)
├── 电商: 推荐(9.5)    搜索(9.0)  客服(8.7)
├── 医疗: 影像(8.0)    NLP(7.5)   药物(6.5)
├── 法律: 合同审查(8.5) 类案(8.0)  问答(7.8)
├── 制造: 质检(9.0)    预测维护(8.5) 排程(7.5)
└── 教育: 批改(8.5)    自适应(7.8) 答疑(8.0)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>💰 ROI 量化框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> roi_framework</div>
                <pre className="fs-code">{`AI 项目 ROI 计算:

成本项 (TCO):
┌──────────────────┬─────────┐
│ 成本类别          │ 估算     │
├──────────────────┼─────────┤
│ 模型开发/微调     │ $50-200K │
│ 数据采集+标注     │ $30-100K │
│ 基础设施 (GPU)    │ $20-80K/年│
│ 团队人力 (2-5人)  │ $200-500K/年│
│ 运维+迭代        │ $50-100K/年│
│ 合规+安全审计     │ $20-50K  │
├──────────────────┼─────────┤
│ 首年 TCO         │ $370K-1M │
└──────────────────┴─────────┘

收益项:
┌──────────────────┬──────────┐
│ 收益类别          │ 量化方式  │
├──────────────────┼──────────┤
│ 人力替代         │ FTE × 年薪│
│ 效率提升         │ 时间节省%  │
│ 错误减少         │ 损失降低$ │
│ 新增收入         │ 转化率提升│
│ 合规罚款避免     │ 历史罚款$ │
└──────────────────┴──────────┘

ROI = (3年收益 - 3年TCO) / 3年TCO

判断标准:
├── ROI > 300%: 🌟 强烈推荐
├── ROI 100-300%: ✅ 推荐
├── ROI 50-100%: ⚠️ 谨慎评估
└── ROI < 50%: ❌ 不推荐

回收期:
├── < 6个月: 速赢项目 (Quick Win)
├── 6-18个月: 标准项目
└── > 18个月: 战略投资 (需审批)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 行业 ROI 基准</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> benchmarks</div>
                <pre className="fs-code">{`各行业 AI 落地 ROI 基准:

金融行业:
├── 反欺诈: ROI 500-1000%
│   (减少欺诈损失 $5-50M/年)
├── 智能风控: ROI 300-600%
│   (坏账率 ↓ 20-40%)
├── 智能客服: ROI 200-400%
│   (人力cost ↓ 40-60%)
└── 量化交易: ROI 不确定
    (alpha因子竞争激烈)

电商行业:
├── 推荐系统: ROI 500-2000%
│   (GMV ↑ 10-30%)
├── 智能客服: ROI 300-500%
│   (人力 ↓ 50-70%)
├── 动态定价: ROI 200-500%
│   (利润 ↑ 5-15%)
└── 搜索优化: ROI 300-800%
    (转化率 ↑ 15-30%)

医疗行业:
├── 影像诊断: ROI 150-300%
│   (效率 ↑ 3-5x, 漏检 ↓)
├── 药物发现: ROI 不确定
│   (周期长, 但单笔价值极高)
└── 临床NLP: ROI 200-400%
    (病历处理效率 ↑ 5x)

法律行业:
├── 合同审查: ROI 300-600%
│   (审查时间 ↓ 70-90%)
├── 类案检索: ROI 200-400%
│   (检索效率 ↑ 5-10x)
└── 法律问答: ROI 150-300%
    (初级咨询人力 ↓ 50%)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 AI MVP 策略</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> mvp_strategy</div>
                <pre className="fs-code">{`AI MVP (最小可行产品) 设计策略:

阶段 1: 概念验证 (PoC) — 2-4 周
├── 目标: 证明技术可行性
├── 方法: 
│   ├── 使用开源/API (GPT-4, Claude)
│   ├── 100 条标注数据 → 快速测试
│   └── 离线评估, 不接入系统
├── 交付: 可行性报告 + Demo
└── 决策: Go / No-Go

阶段 2: 最小 MVP — 4-8 周 
├── 目标: 验证业务价值
├── 方法:
│   ├── 接入真实系统 (灰度 5% 流量)
│   ├── Human-in-the-loop (AI建议,人决策)
│   ├── 100% 可回退到旧方案
│   └── 收集用户反馈数据
├── 交付: 线上 A/B 测试结果
└── 决策: 扩大 / 调整 / 停止

阶段 3: 规模化 — 8-16 周
├── 目标: 全量上线
├── 方法:
│   ├── 模型迭代 (用线上数据优化)
│   ├── 逐步扩大流量 (5%→20%→50%→100%)
│   ├── 监控体系建设
│   └── 应急回退方案
├── 交付: 全量上线 + 运维手册
└── 持续: 数据飞轮 → 持续优化

阶段 4: 运营优化 — 持续
├── 数据飞轮驱动迭代
├── 模型定期重训 (月度/季度)
├── A/B 测试新版本
└── 成本持续优化

关键原则:
⚡ 先快后好 (2周内出Demo)
🔄 渐进式 (灰度发布, 逐步放量)
🛡️ 可回退 (任何阶段都能回退)
📊 数据驱动 (用数据说话, 不靠感觉)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🏢 组织 AI 能力建设</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> org_capability</div>
                <pre className="fs-code">{`企业 AI 能力成熟度模型:

Level 1: 探索期
├── 特征: 个别团队试用 ChatGPT
├── 挑战: 无标准, 各自为战
├── 目标: 选定 1-2 个试点场景
└── 团队: 1-2 AI 工程师

Level 2: 实验期
├── 特征: 3-5 个 AI PoC 项目
├── 挑战: API成本高, 数据隐私
├── 目标: 至少 1 个项目上线
└── 团队: 5-10 人 AI 团队

Level 3: 规模期
├── 特征: 10+ AI 功能上线
├── 挑战: 模型管理, 成本控制
├── 目标: AI 平台化, 可复用
└── 团队: AI 中台团队 15-30 人

Level 4: 优化期
├── 特征: AI 嵌入核心业务流程
├── 挑战: 持续迭代, 竞争壁垒
├── 目标: 数据飞轮, 自动化管线
└── 团队: AI Center of Excellence

Level 5: 引领期
├── 特征: AI-Native 业务模式
├── 挑战: AI 伦理, 行业标准
├── 目标: 定义行业最佳实践
└── 团队: 全员 AI 素养`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>👥 AI 团队组建</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> team</div>
                <pre className="fs-code">{`行业 AI 团队配置:

最小团队 (5人):
├── AI 工程师 × 2
│   (模型开发/微调/部署)
├── 数据工程师 × 1
│   (数据管线/标注管理)
├── 后端工程师 × 1
│   (API/系统集成)
└── 产品经理 × 1
    (需求/场景/业务对接)

标准团队 (10-15人):
├── AI 工程师 × 3-5
├── 数据工程师 × 2-3
├── 后端/全栈 × 2-3
├── 产品经理 × 1-2
├── 领域专家 × 1-2
│   (金融/医疗/法律等)
└── 项目经理 × 1

Build vs Buy 决策:
┌──────────┬──────┬──────┐
│          │ Build│ Buy  │
├──────────┼──────┼──────┤
│ 核心场景 │ ✅    │ ❌    │
│ 边缘场景 │ ❌    │ ✅    │
│ 数据敏感 │ ✅    │ ⚠️   │
│ 定制化高 │ ✅    │ ❌    │
│ 快速上线 │ ❌    │ ✅    │
│ 成本敏感 │ ⚠️   │ ✅    │
└──────────┴──────┴──────┘

最佳实践:
核心竞争力 = 自建
通用能力 = 采购/API
试验阶段 = API 先行`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
