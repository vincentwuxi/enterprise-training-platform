import { useState } from 'react';
import './LessonCommon.css';

const tabs = ['自研 vs 采购', '厂商横评', '合同与谈判', 'TCO 与风控'];

const VENDORS_GLOBAL = [
  { name: 'OpenAI GPT-4o', org: 'OpenAI（微软投资）', strength: '综合能力最强，生态最大', weakness: '价格较高，数据在美国', price: '¥0.03/千token起', best: '通用场景，产品快速原型', compliance: '中等', support: '社区', score: 5 },
  { name: 'Claude 3.5 Sonnet', org: 'Anthropic', strength: '长上下文，安全性最好', weakness: '工具集成略少', price: '¥0.02/千token起', best: '文档分析，合同审查', compliance: '高', support: '企业', score: 4 },
  { name: 'Gemini 2.0 Flash', org: 'Google DeepMind', strength: '速度最快，多模态强', weakness: 'API稳定性待验证', price: '¥0.01/千token起', best: '高频调用，图文混合', compliance: '中等', support: '企业', score: 4 },
];

const VENDORS_CHINA = [
  { name: 'Qwen（通义千问）', org: '阿里云', strength: '中文最强，Alibaba云生态', weakness: '国际化场景略弱', price: '¥0.004/千token起', best: '中文内容，电商场景', compliance: '高（国内合规）', support: '企业级', score: 5 },
  { name: 'DeepSeek-V3', org: 'DeepSeek AI', strength: '性价比极高，开源可私有化', weakness: '服务稳定性需验证', price: '¥0.002/千token起', best: '代码生成，技术场景', compliance: '可私有部署', support: '社区+商业', score: 4 },
  { name: 'Doubao（豆包）', org: '字节跳动', strength: '速度快，与飞书/抖音生态融合', weakness: '逻辑推理稍弱', price: '¥0.0008/千token起', best: '内容创作，办公场景', compliance: '高', support: '企业', score: 4 },
  { name: 'ERNIE 4.0（文心）', org: '百度', strength: '搜索+知识深度，多模态', weakness: '接口易用性待优化', price: '¥0.006/千token起', best: '知识检索，政务场景', compliance: '高', support: '企业级', score: 3 },
];

export default function LessonVendor() {
  const [active, setActive] = useState(0);
  const [region, setRegion] = useState('china');
  const [selected, setSelected] = useState(null);
  const vendors = region === 'global' ? VENDORS_GLOBAL : VENDORS_CHINA;

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge gold">🏪 module_04 — AI 供应商选型</div>
      <div className="fs-hero">
        <h1>AI 供应商选型：自研 vs 采购 / 厂商横评 / 合同谈判 / TCO 分析</h1>
        <p>
          市场上 AI 工具眼花缭乱。本模块提供<strong>系统化选型决策框架</strong>：
          先明确"自研 vs 采购 vs 外包"的战略方向，再从主流厂商中找到最匹配业务需求的组合，
          最后通过<strong>合同谈判策略</strong>和<strong>TCO 全成本分析</strong>确保投资回报最大化。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🏪 供应商选型</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ 自研 vs 采购 vs 外包</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> build_vs_buy</div>
                <pre className="fs-code">{`# AI 能力获取: 四条路径的战略决策

# ═══ 路径对比矩阵 ═══
# ┌──────────────────┬──────────┬──────────┬──────────┬──────────┐
# │ 维度              │ 完全自研  │ API 定制 │ SaaS 采购│ 外包定制 │
# ├──────────────────┼──────────┼──────────┼──────────┼──────────┤
# │ 总成本(首年)      │ 千万级+  │ 50-500万 │ 人均$20/月│ 100-800万│
# │ 上线时间          │ 12-24月  │ 2-6月    │ 1-4周    │ 3-12月   │
# │ IP 控制度         │ ★★★★★   │ ★★★★    │ ★        │ ★★★     │
# │ 数据安全          │ ★★★★★   │ ★★★     │ ★★       │ ★★★     │
# │ 定制灵活度        │ ★★★★★   │ ★★★★    │ ★★       │ ★★★★    │
# │ 运维负担          │ 极重     │ 中       │ 无       │ 中       │
# │ 人才需求          │ AI 团队  │ 工程师   │ 无       │ 项目经理 │
# │ 迁移成本          │ 无       │ 中       │ 高       │ 中       │
# └──────────────────┴──────────┴──────────┴──────────┴──────────┘

# ═══ 推荐决策树 ═══
"""
Q1: AI 是否是你的核心产品/竞争力?
  ├─ YES → Q2: 你有 AI 团队 (10+ 人) 吗?
  │    ├── YES → 完全自研 (打造护城河)
  │    └── NO  → 先 API 定制, 边做边建团队
  │
  └─ NO → Q3: 数据是否极其敏感 (金融/医疗/政府)?
       ├── YES → 私有部署开源模型 (DeepSeek/Qwen)
       └── NO → Q4: 需要定制程度?
            ├─ 低 → SaaS 采购 (Copilot/企微AI)
            └─ 高 → ✅ API 定制开发 (90%企业最优解)
"""

# ═══ 为什么 API 定制是大多数企业的最优解? ═══
# 1. 成本可控: 按用量付费, 无需前期大投入
# 2. 快速上线: 2-6 个月即可交付 MVP
# 3. 保持灵活: 模型提供商随时可替换
# 4. 专注业务: 不用操心模型训练/GPU采购
# 5. 持续受益: 自动享受模型升级红利

# ═══ 常见误区 ═══
mistakes = {
    "误区 1": "先自研大模型, 再找应用场景 (本末倒置)",
    "误区 2": "认为 SaaS 采购 = 数据不安全 (可签 DPA)",
    "误区 3": "价格最低 = 最佳选择 (忽略 TCO)",
    "误区 4": "只选一家供应商 (锁定风险)",
    "误区 5": "自研 = 更安全 (需要安全团队维护)",
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏪 主流大模型厂商横评</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button className={`fs-btn ${region === 'china' ? 'primary' : ''}`} onClick={() => { setRegion('china'); setSelected(null); }}>🇨🇳 国内厂商</button>
                <button className={`fs-btn ${region === 'global' ? 'primary' : ''}`} onClick={() => { setRegion('global'); setSelected(null); }}>🌐 国际厂商</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {vendors.map((v, i) => (
                  <div key={i} className="fs-card"
                    style={{ cursor: 'pointer', borderColor: selected === i ? 'rgba(99,102,241,0.5)' : undefined, margin: 0 }}
                    onClick={() => setSelected(selected === i ? null : i)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{v.org}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{v.price}</span>
                        <span style={{ color: '#fbbf24' }}>{'★'.repeat(v.score)}{'☆'.repeat(5 - v.score)}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{selected === i ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {selected === i && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                        {[['✅ 优势', v.strength, '#22c55e'], ['⚠️ 局限', v.weakness, '#ef4444'], ['🎯 最适场景', v.best, '#8b5cf6'], ['🔒 合规性', v.compliance, '#06b6d4']].map(([k, val, c]) => (
                          <div key={k}>
                            <div style={{ color: c, fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.3rem' }}>{k}</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧪 选型评测方法论</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> evaluation_methodology</div>
                <pre className="fs-code">{`# 供应商评测: 不要只看 Benchmark, 用你的数据测!

# ═══ 评测框架 (五维评分) ═══
evaluation = {
    "准确性 (40%)": {
        "方法": "用你的真实业务 case 测试",
        "样本": "≥ 50 个覆盖不同场景的 case",
        "指标": "正确率 / 幻觉率 / 拒答率",
        "对比": "同一 case 多个模型盲评",
    },
    "速度 (20%)": {
        "P50 延迟": "中位数响应时间",
        "P99 延迟": "长尾延迟 (SLA 关键)",
        "吞吐量":   "每秒处理请求数 (TPS)",
        "首 Token": "流式输出首字延迟",
    },
    "成本 (15%)": {
        "Input":  "输入 token 单价",
        "Output": "输出 token 单价",
        "Cache":  "Prompt 缓存折扣",
        "Batch":  "批量推理折扣",
    },
    "可靠性 (15%)": {
        "可用性": "历史 SLA (目标 ≥ 99.9%)",
        "限流":   "RPM/TPM 上限",
        "降级":   "故障时是否有备选方案",
    },
    "合规性 (10%)": {
        "数据驻留": "数据存储在哪个区域",
        "DPA":     "是否签数据处理协议",
        "审计":    "是否支持审计日志",
        "认证":    "SOC2 / ISO27001",
    },
}

# ═══ A/B 测试模板 ═══
# 1. 准备 100 个真实业务 Prompt
# 2. 分为: 简单(30)/中等(40)/困难(30)
# 3. 每个 Prompt 发给 3+ 个模型
# 4. 双盲评审 (不告知评审者模型来源)
# 5. 综合评分 → 加权排名`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📝 AI 服务合同核心条款</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> contract_essentials</div>
                <pre className="fs-code">{`# AI 供应商合同: 必须关注的核心条款

# ═══ 1. 数据条款 (最关键!) ═══
data_clauses = {
    "数据所有权": """
        ✅ 必须明确: 你的数据始终归你所有
        ✅ 供应商不得使用你的数据训练模型
        ✅ 合同终止后数据完全删除 (+ 证明)
        ⚠️ 注意: 默认 ToS 通常允许使用你的数据!
        → 必须签企业版协议 / DPA
    """,
    "数据处理协议 (DPA)": """
        ├── 数据处理目的和范围
        ├── 数据存储位置 (区域)
        ├── 子处理方列表 (谁能访问)
        ├── 数据泄露通知时限 (72h)
        ├── 审计权 (你有权检查合规)
        └── 合同终止后的数据处理
    """,
    "数据驻留": """
        国内企业: 数据必须在中国境内处理
        跨境需求: 需要数据出境安全评估
        建议: 选择在目标区域有数据中心的供应商
    """,
}

# ═══ 2. SLA 条款 ═══
sla_clauses = {
    "可用性": {
        "最低标准": "99.9% (每月宕机 < 43 分钟)",
        "金融级":   "99.99% (每月宕机 < 4 分钟)",
        "补偿":     "未达标 → 按比例退费",
    },
    "延迟 SLA": {
        "P50":  "< 2s (普通场景)",
        "P99":  "< 10s (长尾不超时)",
        "超时": "30s 无响应 → 自动重试",
    },
    "吞吐 SLA": {
        "RPM":  "请求/分钟保障",
        "TPM":  "Token/分钟保障",
        "突发": "突发流量的处理策略",
    },
    "支持响应": {
        "P0 故障": "15 分钟内响应",
        "P1 问题": "4 小时内响应",
        "P2 咨询": "1 个工作日内",
    },
}

# ═══ 3. 价格与付款 ═══
pricing_clauses = {
    "价格锁定":     "至少锁定 12 个月, 防止突然涨价",
    "阶梯折扣":     "用量越大, 单价越低 (提前谈)",
    "预付折扣":     "年付 vs 月付通常可省 20-30%",
    "用量承诺":     "承诺最低用量换取更低单价",
    "超额计费":     "超出承诺量按什么价格计费",
    "免费额度":     "POC 和测试的免费 token 量",
    "最惠条款":     "保证你拿到的是该级别最优价",
}

# ═══ 4. 退出与迁移 ═══
exit_clauses = {
    "通知期":       "提前 30/60/90 天通知",
    "数据导出":     "合同终止后 30 天可导出全部数据",
    "数据删除":     "90 天内完全删除 + 书面证明",
    "迁移协助":     "供应商应提供迁移支持",
    "无锁定":       "避免年度强制续约条款",
}`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🤝 谈判策略</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> negotiation_tactics</div>
                <pre className="fs-code">{`# AI 供应商谈判实战策略

# ═══ 谈判筹码 ═══
leverage = {
    "多供应商竞争": """
        同时评测 3+ 家供应商
        → 让每家知道你在比价
        → 通常可额外获得 15-30% 折扣
    """,
    "用量承诺": """
        承诺年度最低消费额
        → 换取更低单价 + 专属支持
        → 但不要过度承诺
    """,
    "案例价值": """
        允许供应商将你作为成功案例
        → 换取折扣或免费额度
        → 特别适合知名企业
    """,
    "长期合作": """
        签 2-3 年 vs 1 年
        → 锁定价格 + 更大折扣
        → 但要有退出条款
    """,
}

# ═══ 谈判红线 ═══
red_lines = [
    "❌ 不接受: 供应商用你的数据训练",
    "❌ 不接受: 无 SLA 补偿的可用性承诺",
    "❌ 不接受: 单方面涨价权",
    "❌ 不接受: 无数据导出的退出条款",
    "❌ 不接受: 超过 30 天的付款条件变更通知",
]

# ═══ 开源替代的谈判杠杆 ═══
# "我们正在评估 DeepSeek/Qwen 的私有部署方案"
# → 让商业供应商意识到你有替代选项
# → 但不要虚张声势, 确保你真的做了评估`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>✅ 尽职调查清单</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> due_diligence</div>
                <pre className="fs-code">{`# 供应商尽职调查清单

# ═══ 技术尽职调查 ═══
□ 在真实业务数据上做 A/B 测试
□ 压力测试: 峰值流量下的延迟和可用性
□ 多模态能力: 图片/语音/视频 (如需)
□ 上下文窗口: 长文档场景测试
□ 工具调用: Function Calling 可靠性
□ 中文 / 多语言支持质量

# ═══ 商务尽职调查 ═══
□ 公司财务状况 (融资轮次/现金流)
□ 客户案例 (同行业 / 同规模)
□ 价格历史 (是否有涨价记录)
□ 团队稳定性 (核心人员流失)
□ 战略方向 (是否会被收购/关闭)

# ═══ 安全合规调查 ═══
□ SOC 2 Type II / ISO 27001 认证
□ 数据加密 (传输中 + 静止状态)
□ 数据驻留位置 (是否满足法规)
□ 渗透测试报告 (最近 12 个月)
□ 算法备案状态 (国内必查)
□ 子处理方清单 (数据流经哪些方)

# ═══ 生态集成调查 ═══
□ SDK 完整度 (Python/JS/Go/Java)
□ 文档质量和更新频率
□ 社区活跃度 (GitHub Stars/Issues)
□ 企业微信/飞书/钉钉集成
□ 与现有 CI/CD 工具链的兼容性`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💰 全生命周期成本 (TCO) 分析</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> tco_framework</div>
                <pre className="fs-code">{`# AI 项目 TCO (Total Cost of Ownership) 分析

# ═══ TCO 计算模型 ═══
# TCO ≠ API 价格 × 调用量
# TCO = 直接成本 + 间接成本 + 机会成本

# ═══ 直接成本 ═══
direct_costs = {
    "API 调用费": {
        "计算": "单价 × 月均 token × 12",
        "注意": "Input/Output token 价格不同",
        "优化": "Prompt 缓存可节省 30-50%",
    },
    "基础设施费": {
        "向量数据库": "Pinecone/Weaviate 托管费",
        "计算资源":   "后端服务器 + 预处理",
        "存储":       "对话历史 + 文件 + 缓存",
    },
    "开发成本": {
        "首次开发": "工程师工时 × 开发周期",
        "集成测试": "与现有系统对接工作量",
        "培训":     "用户培训和文档编写",
    },
}

# ═══ 间接成本 (常被忽略!) ═══
indirect_costs = {
    "运维人力":     "监控/故障处理/版本升级",
    "合规成本":     "安全审计/数据保护/备案",
    "质量保障":     "输出审核/人工修正/反馈",
    "供应商管理":   "采购流程/合同管理/对账",
    "用户支持":     "内部 IT 支持工时",
}

# ═══ 三年 TCO 对比示例 ═══
# 场景: 内部智能客服, 日均 5,000 次对话

# 方案 A: SaaS 采购 (ChatGPT Team)
tco_saas = {
    "年费":          "50人 × $25/月 × 12 = $15,000",
    "定制开发":      "$0 (无法定制)",
    "运维":          "$0 (供应商负责)",
    "3 年 TCO":      "$45,000",
    "风险":          "功能受限, 数据安全中等",
}

# 方案 B: API 定制开发
tco_api = {
    "API 费":        "$800/月 × 12 = $9,600/年",
    "开发 (首年)":   "3 人 × 3 月 = $60,000",
    "基础设施":      "$500/月 × 12 = $6,000/年",
    "运维 (0.5人)":  "$40,000/年",
    "3 年 TCO":      "$60K + ($9.6K+$6K+$40K)×3 = $227,000",
    "价值":          "完全定制, 数据安全, IP 自有",
}

# 方案 C: 私有部署 (DeepSeek/Qwen)
tco_private = {
    "GPU 服务器":    "8×A100 = $200K 或 云GPU $15K/月",
    "开发 (首年)":   "5 人 × 6 月 = $200,000",
    "运维 (2 人)":   "$160,000/年",
    "3 年 TCO":      "$200K + $200K + ($180K+$160K)×3 = $1,420,000",
    "价值":          "完全控制, 数据绝对安全",
}

# ═══ 方案选择指南 ═══
# ┌────────────┬──────────┬──────────┬──────────┐
# │            │ SaaS     │ API定制   │ 私有部署  │
# ├────────────┼──────────┼──────────┼──────────┤
# │ 3年 TCO    │ $45K     │ $227K   │ $1.42M   │
# │ 定制度      │ ★       │ ★★★★    │ ★★★★★   │
# │ 安全性      │ ★★      │ ★★★     │ ★★★★★   │
# │ 适合企业    │ <100人   │ 100-5000│ 5000+    │
# │ 建议        │ 试水     │ ✅主力  │ 金融/政务 │
# └────────────┴──────────┴──────────┴──────────┘`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🛡️ 供应商风险管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> risk_management</div>
                <pre className="fs-code">{`# 供应商风险管理策略

# ═══ 多供应商策略 (Anti Lock-in) ═══
multi_vendor = {
    "主力供应商 (70%)": "业务核心, 最佳性价比",
    "备份供应商 (20%)": "主力故障时自动切换",
    "实验供应商 (10%)": "评测新模型, 保持竞争",
}

# ═══ 抽象层设计 ═══
# 在代码中封装统一接口, 供应商可随时替换
"""
class LLMRouter:
    def __init__(self):
        self.primary = OpenAIProvider()
        self.fallback = DeepSeekProvider()
        
    def complete(self, prompt, **kwargs):
        try:
            return self.primary.complete(prompt)
        except (RateLimitError, TimeoutError):
            return self.fallback.complete(prompt)
"""

# ═══ 风险分级 ═══
# ┌──────────────┬──────────┬─────────────┐
# │ 风险类型      │ 影响级别  │ 缓解措施     │
# ├──────────────┼──────────┼─────────────┤
# │ API 停服      │ P0 严重  │ 备份供应商   │
# │ 大幅涨价      │ P1 高    │ 价格锁定    │
# │ 数据泄露      │ P0 严重  │ DPA + 加密  │
# │ 模型退化      │ P2 中    │ 版本锁定    │
# │ 公司倒闭      │ P1 高    │ 开源备选    │
# │ 地缘政治      │ P2 中    │ 多区域部署  │
# └──────────────┴──────────┴─────────────┘

# ═══ 模型版本管理 ═══
# 锁定已验证的模型版本, 不盲目升级
# model="gpt-4o-2024-08-06" (指定日期版本)
# 新版本上线前: 在测试集上回归验证`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 ROI 测算模板</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> roi_template</div>
                <pre className="fs-code">{`# AI 项目 ROI 测算框架

# ═══ 收益量化 ═══
benefits = {
    "效率提升": {
        "公式": "节省工时 × 人工成本",
        "示例": "100 人 × 2h/天 × $50/h × 250天",
        "年收益": "$2,500,000",
    },
    "质量提升": {
        "公式": "减少的错误 × 每次错误成本",
        "示例": "减少 500 次/年 × $2,000/次",
        "年收益": "$1,000,000",
    },
    "收入增长": {
        "公式": "AI 带来的新增收入",
        "示例": "智能推荐增加 5% 转化率",
        "年收益": "因业务而异",
    },
    "客户满意度": {
        "间接收益": "CSAT 提升 → 留存率提高",
        "量化难度": "高 (但重要)",
    },
}

# ═══ 投资回收期 ═══
# Break-Even Point = 总投入 / 月均收益
# 目标: < 12 个月 → 值得投入
# < 6 个月 → 优先级高
# > 24 个月 → 需要重新评估

# ═══ 向管理层汇报的模板 ═══
report_template = """
AI 项目投资分析摘要
──────────────────────────────
项目:    智能客服系统
投资额:  ¥150 万 (首年)
运营费:  ¥50 万/年 (后续)
──────────────────────────────
预期收益:
  · 客服效率提升 40% → 节省 ¥200 万/年
  · 客户满意度提升 15% → 留存收益 ¥80 万/年
  · 7×24 覆盖 → 夜间服务收入 ¥50 万/年
──────────────────────────────
ROI:     220% (首年)
回收期:  6.5 个月
风险等级: 中 (API 依赖, 有备份方案)
建议:    ✅ 批准 (Phase 1 先 POC)
"""`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
