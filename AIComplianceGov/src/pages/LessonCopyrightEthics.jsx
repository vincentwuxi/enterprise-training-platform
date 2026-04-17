import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['训练数据版权', '生成内容归属', '水印技术', '伦理框架'];

export default function LessonCopyrightEthics() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">⚖️ module_08 — AI 版权与伦理</div>
      <div className="fs-hero">
        <h1>AI 版权与伦理：训练数据版权 / 生成内容归属 / 水印技术</h1>
        <p>
          AI 的版权问题正在引发<strong>全球法律风暴</strong>——NYT 起诉 OpenAI、Getty 起诉 Stability AI、
          艺术家联名抗议 Midjourney。训练数据的使用是否构成"合理使用"？AI 生成的内容谁拥有版权？
          如何用技术手段标识 AI 生成内容？本模块从法律判例、技术方案和伦理框架三个维度，
          系统解答 AI 时代的<strong>知识产权难题</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">©️ AI 版权与伦理</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ AI 训练数据版权争议</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> training_data_copyright</div>
                <pre className="fs-code">{`# AI 训练数据版权问题全景

# 核心法律问题:
# "用受版权保护的作品训练AI模型,
#  是否构成版权侵权?"

# ═══ 重大诉讼案件 ═══

cases = [
    {
        "案件": "NYT vs OpenAI/Microsoft",
        "时间": "2023.12 起诉",
        "主张": "GPT 逐字复制NYT文章",
        "赔偿": "数十亿美元",
        "状态": "审理中 (里程碑案件)",
        "影响": "可能重新定义AI训练的合理使用",
    },
    {
        "案件": "Getty Images vs Stability AI",
        "时间": "2023.02 起诉",
        "主张": "SD训练使用1200万张Getty图片",
        "证据": "生成图片含Getty水印残留",
        "状态": "审理中",
    },
    {
        "案件": "Authors Guild vs OpenAI",
        "时间": "2023.09 起诉",
        "主张": "GPT用数千本书训练",
        "原告": "John Grisham等知名作家",
        "状态": "审理中",
    },
    {
        "案件": "Andersen vs Stability AI",
        "时间": "2023.01 起诉",
        "主张": "Midjourney/SD侵犯艺术家风格",
        "状态": "部分驳回, 部分继续",
    },
    {
        "案件": "Thomson Reuters vs Ross Intel",
        "时间": "2024 判决",
        "结果": "法院认定AI训练不构成合理使用",
        "影响": "首个不利于AI公司的判决",
    },
]

# ═══ "合理使用" 分析框架 (美国) ═══

# 17 U.S.C. § 107 四要素测试:
fair_use_factors = {
    "因素1: 使用目的和性质": {
        "有利AI": "转化性使用(学习模式≠复制)",
        "不利AI": "商业目的",
        "关键": "'转化性'是核心争点",
    },
    "因素2: 作品性质": {
        "有利AI": "事实性作品保护力度弱",
        "不利AI": "创意性作品保护力度强",
        "关键": "文学/艺术品高度保护",
    },
    "因素3: 使用数量和实质性": {
        "有利AI": "从每件作品中提取微小部分",
        "不利AI": "使用了全部作品训练",
        "关键": "大规模复制整部作品?",
    },
    "因素4: 对市场的影响": {
        "有利AI": "AI创造新市场/新需求",
        "不利AI": "替代原作品的市场需求",
        "关键": "最重要的因素",
    },
}

# ═══ 各法域态度对比 ═══
# ┌────────┬───────────────────────────┐
# │ 法域    │ 态度                      │
# ├────────┼───────────────────────────┤
# │ 🇺🇸 美国│ 未定论 (案件审理中)        │
# │        │ 可能适用合理使用           │
# ├────────┼───────────────────────────┤
# │ 🇪🇺 EU │ EU AI Act: 版权合规义务    │
# │        │ 必须提供训练数据摘要       │
# │        │ 尊重 opt-out 权利          │
# ├────────┼───────────────────────────┤
# │ 🇯🇵 日本│ 最宽松: 2018修法允许       │
# │        │ 信息分析目的可使用版权作品  │
# ├────────┼───────────────────────────┤
# │ 🇬🇧 英国│ TDM例外 (非商业研究)      │
# │        │ 商业使用需获得许可         │
# ├────────┼───────────────────────────┤
# │ 🇨🇳 中国│ 尚无明确判例              │
# │        │ 倾向个案分析              │
# └────────┴───────────────────────────┘

# 企业应对策略:
# ├── 使用许可数据集 (如 Shutterstock+)
# ├── 建立 opt-out 机制 (robots.txt)
# ├── 保留训练数据来源记录
# ├── 购买 IP 赔偿保险
# └── 使用开放许可数据 (CC/Public Domain)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📝 AI 生成内容的版权归属</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> generated_content_ownership</div>
                <pre className="fs-code">{`# AI 生成内容归谁所有?

# 核心问题:
# "没有人类作者的创作,
#  能否获得版权保护?"

# ═══ 各法域立场 ═══

# 🇺🇸 美国:
US_position = {
    "USCO 指南": "2023.02 发布",
    "核心立场": "纯AI生成 = 不可版权",
    "关键案例": {
        "Thaler v Perlmutter": {
            "AI": "DABUS (自主AI)",
            "申请": "AI自主创作的画作",
            "结果": "驳回 (作者必须是人类)",
        },
        "Zarya of the Dawn": {
            "AI": "Midjourney生成漫画",
            "结果": "文字排版可版权,",
            "     ": "AI图像不可版权",
        },
    },
    "灰色地带": "人类指导+AI工具→可能部分可版权",
}

# 🇪🇺 EU:
EU_position = {
    "立场": "版权要求'原创性'=人类智力创造",
    "CJEU判例": "原创性=作者自由选择的结果",
    "推论": "纯AI生成→不可版权",
    "例外": "人类有足够创造性控制→可能可版权",
}

# 🇨🇳 中国:
CN_position = {
    "北京互联网法院 (2023)": {
        "案件": "Prompt生成AI图片",
        "结果": "原告有版权!",
        "理由": "Prompt设计体现了智力投入",
        "意义": "全球首例承认AI图版权",
    },
    "注意": "个案判决, 非普遍规则",
}

# 🇬🇧 英国:
UK_position = {
    "特殊": "CDPA 1988 S.9(3)",
    "规定": "计算机生成作品的作者=",
    "     ": "做出必要安排的人",
    "意义": "唯一明确立法的主要法域",
}

# 实务建议:
# ├── 记录人类创作贡献 (Prompt/编辑)
# ├── 不要仅依赖AI生成的版权保护
# ├── 合同中明确AI生成内容的归属
# ├── 对外声明AI参与创作的程度
# └── 考虑保密(trade secret)替代版权`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 商业应用版权策略</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> commercial_strategy</div>
                <pre className="fs-code">{`# AI 内容商业应用的版权策略

# 场景分析:
scenarios = {
    "营销素材 (AI生成广告图)": {
        "风险": "可能不受版权保护",
        "策略": [
            "人工修改/增强以增加原创性",
            "记录设计过程的创造性选择",
            "作为'商业秘密'而非版权保护",
        ],
    },
    "代码 (AI辅助编程)": {
        "风险": "Copilot可能复制开源代码",
        "策略": [
            "审查生成代码的许可兼容性",
            "使用带IP赔偿的企业版",
            "GitHub/Copilot赔偿条款",
        ],
    },
    "文本内容 (AI辅助写作)": {
        "风险": "纯AI生成→不可版权",
        "策略": [
            "将AI作为'辅助工具'而非'作者'",
            "保留编辑、修改、审核记录",
            "人类做实质性选择和判断",
        ],
    },
}

# AI 提供商的 IP 保护:
provider_protection = {
    "OpenAI": {
        "立场": "用户拥有输出权利",
        "赔偿": "企业版提供版权盾",
    },
    "Microsoft Copilot": {
        "立场": "用户保留权利",
        "赔偿": "Copilot版权承诺",
    },
    "Google Gemini": {
        "立场": "用户保留权利",
        "赔偿": "企业版赔偿条款",
    },
    "Adobe Firefly": {
        "立场": "强调训练数据合规",
        "赔偿": "IP赔偿(授权数据)",
    },
}

# 版权盾 (Copyright Shield):
# = AI提供商承诺:
# "如果你因使用我们的AI输出
#  被起诉版权侵权,
#  我们负责赔偿"
# 
# 注意: 通常有条件限制
# ├── 需使用企业版
# ├── 需善意使用
# ├── 排除故意侵权
# └── 赔偿上限`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>💧 AI 内容水印与标识技术</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> watermarking_tech</div>
                <pre className="fs-code">{`# AI 生成内容水印与检测技术

# 为什么需要水印?
# ├── EU AI Act: AI生成内容必须可识别
# ├── 中国: 深度合成内容必须标识
# ├── 防止虚假信息传播
# ├── 版权追溯
# └── 用户知情权

# ═══ 文本水印 ═══

text_watermark = {
    "原理": "在生成过程中嵌入统计信号",
    "方法": {
        "SynthID (Google)": {
            "原理": "修改token采样分布",
            "特点": "不影响文本质量",
            "检测": "统计检验分布偏差",
            "部署": "Gemini 已内嵌",
        },
        "Kirchenbauer et al.": {
            "原理": "绿色/红色token列表",
            "检测": "绿色token比例>期望",
            "论文": "2023 ICML",
        },
    },
    "挑战": [
        "改写/释义可能移除水印",
        "翻译后水印可能丢失",
        "短文本检测准确率低",
        "对抗性规避攻击",
    ],
}

# ═══ 图像水印 ═══

image_watermark = {
    "可见水印": {
        "方法": "叠加文字/Logo",
        "优点": "直观, 用户立即知道",
        "缺点": "影响视觉 / 容易裁剪",
        "示例": "Google SynthID 标识",
    },
    "不可见水印": {
        "方法": "嵌入频域/像素级信号",
        "优点": "不影响视觉质量",
        "缺点": "需要专门工具检测",
        "技术": [
            "DCT域嵌入 (频率空间)",
            "DWT域嵌入 (小波变换)",
            "扩散模型隐空间嵌入",
            "GAN解码器嵌入",
        ],
    },
    "SynthID (Google DeepMind)": {
        "原理": "训练编解码器在潜空间嵌入",
        "鲁棒性": "抗压缩/缩放/裁剪/滤镜",
        "部署": "Imagen / Gemini 已集成",
    },
}

# ═══ 视频/音频水印 ═══

av_watermark = {
    "视频": "逐帧嵌入 + 时序一致性",
    "音频": "频谱嵌入 / 相位调制",
    "挑战": "转码/压缩后保持",
}

# ═══ 元数据标识 ═══

metadata_standards = {
    "C2PA (Content Provenance)": {
        "组织": "Adobe/Microsoft/BBC/Intel",
        "方法": "加密签名的内容溯源",
        "信息": "创作工具/时间/修改历史",
        "标准": "IEC 62289-1",
        "部署": "Adobe Firefly/Photoshop",
    },
    "IPTC AI标签": {
        "方法": "在图片元数据中标注AI参与",
        "字段": "digitSourceType = trainedAI",
    },
}

# 技术对比:
# ┌──────────────┬─────────┬─────────┬──────────┐
# │ 技术          │ 鲁棒性   │ 隐蔽性   │ 容量     │
# ├──────────────┼─────────┼─────────┼──────────┤
# │ 可见水印      │ 低       │ ❌       │ 低       │
# │ 不可见水印    │ 中-高    │ ✅       │ 中       │
# │ 元数据标识    │ 低*      │ N/A     │ 高       │
# │ SynthID      │ 高       │ ✅       │ 低       │
# │ C2PA         │ 中       │ N/A     │ 高       │
# └──────────────┴─────────┴─────────┴──────────┘
# * 元数据容易被剥离`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧭 负责任 AI 伦理框架</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> responsible_ai_framework</div>
                <pre className="fs-code">{`# 负责任 AI (Responsible AI) 伦理框架

# ═══ 核心伦理原则 ═══
# (综合 UNESCO / OECD / IEEE / Google / Microsoft)

principles = {
    "1. 公平与包容": {
        "含义": "AI不应歧视或排斥任何群体",
        "实践": "偏见测试/公平性指标/多样性团队",
    },
    "2. 透明与可解释": {
        "含义": "AI决策过程应可理解",
        "实践": "Model Card/XAI/用户告知",
    },
    "3. 隐私与安全": {
        "含义": "保护个人数据和系统安全",
        "实践": "PETs/安全设计/红队测试",
    },
    "4. 可靠与安全": {
        "含义": "AI应按预期工作,不造成伤害",
        "实践": "测试充分/故障安全/人工监督",
    },
    "5. 问责与治理": {
        "含义": "明确责任归属,建立治理机制",
        "实践": "治理委员会/审计/报告",
    },
    "6. 社会与环境责任": {
        "含义": "考虑AI对社会和环境的广泛影响",
        "实践": "影响评估/碳足迹计算/数字鸿沟",
    },
}

# ═══ AI 伦理决策框架 ═══

decision_framework = """
遇到AI伦理困境时, 按以下步骤:

Step 1: 识别利益相关方
├── 直接用户
├── 间接受影响者
├── 弱势群体
└── 社会整体

Step 2: 评估影响
├── 正面影响 (机会)
├── 负面影响 (伤害)
├── 不确定影响
└── 长期影响

Step 3: 应用伦理原则
├── 伤害最小化
├── 利益公平分配
├── 尊重自主权
└── 保护弱势群体

Step 4: 决策与记录
├── 选择方案及理由
├── 接受的风险
├── 缓解措施
└── 审查计划
"""

# ═══ AI 伦理的实际困境 ═══

ethical_dilemmas = {
    "精准 vs 公平": {
        "困境": "追求最高精度可能加剧偏见",
        "示例": "犯罪预测模型在少数族裔区更准",
        "思考": "是否应牺牲精度换取公平?",
    },
    "创新 vs 安全": {
        "困境": "过度监管可能抑制创新",
        "示例": "要求100%安全=禁止所有AI",
        "思考": "如何平衡风险容忍度?",
    },
    "透明 vs 隐私": {
        "困境": "解释AI决策可能泄露隐私",
        "示例": "医疗AI解释涉及患者数据",
        "思考": "在可解释性和隐私间取舍?",
    },
    "效率 vs 就业": {
        "困境": "AI自动化替代人类工作",
        "示例": "客服AI节省成本但裁员",
        "思考": "企业的社会责任边界?",
    },
}

# ═══ 行动清单 ═══
# □ 建立 AI 伦理审查流程
# □ 发布 AI 伦理政策 (对外)
# □ 设立伦理热线/投诉渠道
# □ 定期伦理培训 (全员)
# □ 参与行业伦理标准制定
# □ 发布年度 AI 透明度报告`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
