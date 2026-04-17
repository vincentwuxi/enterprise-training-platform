import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['版权合规', '效率提升', '团队协作', '定价策略'];

export default function LessonCommercialProduction() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge red">💰 module_08 — 商业落地</div>
      <div className="fs-hero">
        <h1>商业落地：版权合规 / 效率提升 / 团队协作 / 定价策略 — AI 设计变现</h1>
        <p>
          掌握工具只是开始，<strong>商业化</strong>才是终点。版权风险如何规避？
          效率提升如何量化？团队如何高效协作？服务如何定价？
          本模块覆盖 AI 创意设计的完整商业化路径。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">💰 商业落地</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚖️ 版权合规</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> copyright</div>
              <pre className="fs-code">{`# AI 生成内容的版权与合规

# ═══ 各平台版权政策 (2025) ═══
copyright_policies = {
    "Midjourney": {
        "付费用户":  "拥有生成图的商用权",
        "免费用户":  "CC BY-NC 4.0 (非商业)",
        "注意":      "年收入>$1M 需 Pro 以上计划",
    },
    "DALL·E 3": {
        "政策":  "用户拥有完全权利 (含商用)",
        "限制":  "内容政策: 不可生成真实公众人物",
    },
    "Stable Diffusion": {
        "开源许可":  "模型本身 CreativeML Open RAIL",
        "生成内容":  "用户拥有权利 (取决于模型)",
        "LoRA/微调":  "取决于训练数据来源",
    },
    "FLUX.1": {
        "Pro":    "商用 API",
        "Dev":    "非商业许可",
        "Schnell": "Apache 2.0 (可商用)",
    },
}

# ═══ 法律风险清单 ═══
legal_risks = {
    "训练数据争议": {
        "风险": "训练集含版权图 → 生成类似作品",
        "对策": "避免生成明确模仿特定艺术家的作品",
        "案例": "Getty Images vs Stability AI",
    },
    "肖像权": {
        "风险": "生成与真人相似的面孔",
        "对策": "不输入真人名字/使用AI虚拟人",
    },
    "商标侵权": {
        "风险": "生成含品牌Logo/商标的内容",
        "对策": "避免输入品牌名, 检查生成结果",
    },
    "著作权归属": {
        "风险": "AI 生成内容能否获得著作权?",
        "现状": "各国不同, 中国≈可以(需人工参与)",
        "美国": "纯AI生成不可版权, 人工修改可",
    },
}

# ═══ 安全使用指南 ═══
safe_usage = {
    "✅ 安全": [
        "付费平台生成 + 后期人工修改",
        "使用开源可商用模型 (FLUX Schnell)",
        "训练自有数据的 LoRA",
        "AI 生成概念 + 人工重绘",
    ],
    "⚠️ 谨慎": [
        "直接使用 AI 生成图作为最终交付",
        "生成特定艺术家风格的作品",
        "用于敏感领域 (医疗/法律/新闻)",
    ],
    "❌ 禁止": [
        "生成真实人物的虚假图片",
        "冒充人工创作 (不注明 AI)",
        "生成违法/有害/NSFW 内容",
        "侵犯他人商标/IP",
    ],
}

# ═══ 合规清单 ═══
compliance_checklist = [
    "✓ 使用付费/可商用许可的工具",
    "✓ 保存生成记录 (Prompt/参数/时间)",
    "✓ 进行人工修改和创意贡献",
    "✓ 适当标注 'AI 辅助生成'",
    "✓ 检查生成结果无商标/人脸侵权",
    "✓ 客户合同中明确 AI 使用条款",
]`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ 效率提升</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> efficiency</div>
              <pre className="fs-code">{`# AI 设计效率提升: 量化你的生产力

# ═══ 各环节效率对比 ═══
efficiency_comparison = {
    "概念探索": {
        "传统":   "2-3天 (5-10个方案)",
        "AI辅助": "30分钟 (50+个方案)",
        "提升":   "10-20x",
    },
    "视觉设计": {
        "传统":   "1-2天/张 (精细设计)",
        "AI辅助": "10-30分钟/张",
        "提升":   "3-5x",
    },
    "商品场景图": {
        "传统":   "拍摄+后期 ¥500-2000/组",
        "AI辅助": "AI生成 ¥5-20/组",
        "提升":   "50-100x (成本)",
    },
    "插画/配图": {
        "传统":   "4-8小时/张",
        "AI辅助": "5-15分钟/张",
        "提升":   "30-50x",
    },
    "品牌全案": {
        "传统":   "3-4周",
        "AI辅助": "1周",
        "提升":   "3-4x",
    },
}

# ═══ 效率工作流优化 ═══
optimized_workflows = {
    "Prompt 模板库": {
        "做法": "按品类/风格建立 Prompt 模板",
        "工具": "Notion/飞书 管理模板库",
        "效果": "减少每次重新构思的时间",
    },
    "ComfyUI 工作流库": {
        "做法": "保存验证过的 .json 工作流",
        "分类": "文生图/图生图/放大/抠图/换装",
        "效果": "新任务直接加载模板",
    },
    "品牌预设": {
        "做法": "每个品牌建立预设文件",
        "内容": "风格LoRA/sref图/配色/字体",
        "效果": "品牌一致性 + 快速启动",
    },
    "批量自动化": {
        "做法": "ComfyUI API + Python 脚本",
        "场景": "批量换背景/批量风格迁移",
        "效果": "100张图无人值守生成",
    },
}

# ═══ 个人效率指标 ═══
kpi_metrics = {
    "产出量":     "每天可交付的设计稿数量",
    "首版通过率": "客户一次通过的比例",
    "修改轮次":   "平均修改次数 (目标<2次)",
    "工具利用率": "AI 辅助占总工作时间的比例",
    "单位成本":   "每张交付设计稿的成本",
}

# ═══ 设计师 AI 能力等级 ═══
skill_levels = {
    "L1 入门":  "会用 MJ 基础文生图",
    "L2 熟练":  "掌握参数/风格控制/一致性",
    "L3 专业":  "ComfyUI 自定义工作流",
    "L4 高级":  "LoRA训练/ControlNet组合/API",
    "L5 专家":  "批量管线/团队标准化/商业变现",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>👥 团队协作</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> team_collab</div>
              <pre className="fs-code">{`# AI 设计团队协作: 标准化生产体系

# ═══ 团队角色定义 ═══
team_roles = {
    "AI Prompt 设计师": {
        "职责": "Prompt 编写/参数调优/方向把控",
        "技能": "MJ/ComfyUI/风格理解",
        "占比": "团队核心 40%",
    },
    "视觉精修师": {
        "职责": "AI 出图后的精修/排版/输出",
        "技能": "PS/AI/Figma + AI工具",
        "占比": "30%",
    },
    "工作流工程师": {
        "职责": "ComfyUI管线/自动化/模型管理",
        "技能": "Python/ComfyUI/API开发",
        "占比": "20%",
    },
    "项目管理": {
        "职责": "需求对接/质量把控/进度管理",
        "占比": "10%",
    },
}

# ═══ 协作工具链 ═══
collab_tools = {
    "资产管理": {
        "Eagle":     "图片素材管理 (标签/评分)",
        "Notion":    "Prompt模板库/项目看板",
        "NAS/OSS":   "大文件存储 (模型/工作流)",
    },
    "版本控制": {
        "Git":       "ComfyUI 工作流版本管理",
        "Figma":     "设计稿协同编辑",
        "飞书/钉钉": "沟通/审批/文件分享",
    },
    "质量管理": {
        "评审流程":  "AI初稿→内审→客户确认",
        "检查清单":  "分辨率/色彩/版权/文字",
        "版本命名":  "项目_版本_日期_作者",
    },
}

# ═══ 标准化 SOP ═══
design_sop = {
    "Phase 1 - 需求理解 (0.5天)": [
        "客户 Brief 分析",
        "参考图收集 (Pinterest/Behance)",
        "确定风格方向 + 交付规格",
    ],
    "Phase 2 - AI 概念 (0.5天)": [
        "MJ/ComfyUI 批量生成概念",
        "内部筛选 Top 5-10 方案",
        "客户评审 → 选定 2-3 方向",
    ],
    "Phase 3 - 精修制作 (1-2天)": [
        "选定方向 AI 精修 (ControlNet/Inpaint)",
        "PS/Figma 排版/文字/品牌元素",
        "多尺寸适配 (不同平台)",
    ],
    "Phase 4 - 交付 (0.5天)": [
        "内部质检 (分辨率/色彩/版权)",
        "客户最终确认",
        "源文件 + 最终稿 交付",
    ],
}

# ═══ 知识沉淀 ═══
knowledge_base = {
    "每项目沉淀": [
        "成功的 Prompt 收录到模板库",
        "ComfyUI 工作流保存到公共库",
        "客户风格偏好记录 (品牌档案)",
        "复盘总结 (效率/质量/问题)",
    ],
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>💲 定价策略</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> pricing</div>
              <pre className="fs-code">{`# AI 设计服务定价: 价值定价而非成本定价

# ═══ 定价原则 ═══
# ⚠️ 不要按"AI用时"定价!
# AI让你更快了, 但价值没有降低
# 客户为"结果"付费, 不为"时间"付费

# ═══ 服务模式与定价 ═══
pricing_models = {
    "按项目定价 (推荐)": {
        "Logo 设计":       "¥3,000-15,000",
        "品牌全案":        "¥15,000-50,000",
        "详情页设计":      "¥2,000-8,000/页",
        "社媒视觉包":      "¥5,000-15,000/月",
        "优势": "客户预期明确, 利润可控",
    },
    "按月包 (稳定)": {
        "基础包":  "¥8,000/月 (20张设计)",
        "标准包":  "¥15,000/月 (50张+管理)",
        "高级包":  "¥30,000/月 (无限+策略)",
        "优势": "收入稳定, 客户粘性高",
    },
    "按张计费 (灵活)": {
        "AI 场景图":    "¥50-200/张",
        "精修设计稿":   "¥300-1000/张",
        "插画/IP":      "¥500-2000/张",
        "注意": "量大从优, 但要设最低门槛",
    },
}

# ═══ 定价策略 ═══
pricing_strategy = {
    "价值定价": {
        "方法": "按客户获得的商业价值定价",
        "例子": "电商主图提升30%转化 → 价值远超设计费",
    },
    "锚定定价": {
        "方法": "展示传统设计成本作为锚点",
        "例子": "传统: ¥50,000 → AI辅助: ¥20,000",
    },
    "分层定价": {
        "基础版": "AI 生成 + 基础修改",
        "标准版": "AI 生成 + 精修 + 多尺寸",
        "高级版": "全案策划 + AI制作 + 运营支持",
    },
}

# ═══ 收入计算模型 ═══
revenue_model = {
    "自由设计师": {
        "月项目数":     "4-8 个",
        "平均单价":     "¥5,000-15,000",
        "月收入":       "¥20,000-60,000",
        "AI工具成本":   "¥500-1,000/月",
        "利润率":       "85-95%",
    },
    "设计工作室 (3-5人)": {
        "月项目数":     "10-20 个",
        "平均单价":     "¥8,000-25,000",
        "月营收":       "¥80,000-200,000",
        "团队成本":     "¥40,000-80,000/月",
        "利润":         "¥40,000-120,000/月",
    },
}

# ═══ 变现渠道 ═══
revenue_channels = {
    "B端客户":     "品牌/电商/广告公司 (主力)",
    "设计平台":    "站酷/猪八戒/99designs",
    "素材售卖":    "Adobe Stock/Shutterstock",
    "教学培训":    "AI 设计课程/训练营",
    "SaaS 产品":   "AI设计工具/插件",
    "自媒体":      "小红书/B站 AI设计教程",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
