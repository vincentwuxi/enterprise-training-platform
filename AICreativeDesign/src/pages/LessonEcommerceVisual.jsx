import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['商品图', '场景图', '模特换装', 'A/B 测试'];

export default function LessonEcommerceVisual() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge orange">🛒 module_06 — 电商视觉</div>
      <div className="fs-hero">
        <h1>电商视觉：商品图 / 场景图 / 模特换装 / A/B 测试 — AI 驱动增长</h1>
        <p>
          电商视觉是 AI 绘画最直接的商业变现场景：<strong>白底图→场景图</strong>成本降低 90%，
          <strong>虚拟模特</strong>省去拍摄费用，<strong>A/B 测试</strong>用数据驱动视觉优化。
          本模块覆盖电商视觉的全链路 AI 实战。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🛒 电商视觉</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📸 商品图</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> product_photo</div>
              <pre className="fs-code">{`# AI 商品图: 从拍摄到生成

# ═══ 商品图类型 ═══
product_photo_types = {
    "白底主图": {
        "用途": "淘宝/京东主图 (搜索结果)",
        "要求": "纯白背景, 产品居中, 清晰",
        "AI":   "抠图 + 白底合成 (最简单)",
    },
    "场景图": {
        "用途": "详情页/首页轮播/广告",
        "要求": "产品在使用场景中, 有氛围",
        "AI":   "抠图 + AI 场景生成 (核心能力)",
    },
    "细节图": {
        "用途": "展示材质/工艺/细节",
        "要求": "微距/特写, 高清",
        "AI":   "放大增强 + 局部重绘",
    },
    "功能图": {
        "用途": "展示产品功能/卖点",
        "AI":   "产品图 + 信息图 合成",
    },
}

# ═══ AI 抠图方案 ═══
segmentation_tools = {
    "Segment Anything (SAM)": {
        "方法": "一键分割, 效果最好",
        "ComfyUI": "SAM + GroundingDINO 节点",
    },
    "RMBG v2 (BRIA)": {
        "方法": "专业去背景模型",
        "效果": "头发/透明物体效果好",
    },
    "remove.bg": {
        "方法": "在线API",
        "适合": "简单快速, 小批量",
    },
}

# ═══ 白底图→场景图工作流 ═══
scene_workflow = """
# ComfyUI 完整工作流:

1. Load Image (白底商品图)
2. SAM Segmentation (自动抠图)
   → 产品蒙版 + 纯产品图

3. AI 场景生成:
   KSampler + Prompt:
   "elegant marble table surface, warm sunlight,
    bokeh background, product photography, 4K"
   
4. Composite (产品 + 场景合成):
   → 产品放置在场景中
   
5. Inpaint边缘 (融合接缝):
   → 自然过渡, 阴影匹配
   
6. 色彩校正 + 锐化 → 输出

# 成本: 传统拍摄 ¥500-2000/组 → AI ¥5-20/组
"""

# ═══ 批量处理 ═══
batch_products = {
    "输入": "100 张白底商品图",
    "场景模板": "5 种预设场景 (大理石/木桌/布艺等)",
    "输出": "100 × 5 = 500 张场景图",
    "时间": "ComfyUI 批量: 2-4 小时",
    "成本": "约 ¥0.1/张 (电费)",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏞️ 场景图</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> scene_photo</div>
              <pre className="fs-code">{`# AI 场景化商品图: 氛围感制造机

# ═══ 场景类型与 Prompt 模板 ═══
scene_templates = {
    "生活方式": {
        "prompt": "cozy living room setting, natural daylight, "
                  "lifestyle photography, warm tones, soft focus bg",
        "适合":   "家居/餐具/生活用品",
    },
    "自然户外": {
        "prompt": "outdoor natural setting, wildflowers, "
                  "golden hour sunlight, dreamy bokeh, organic",
        "适合":   "护肤品/食品/运动装备",
    },
    "极简商务": {
        "prompt": "minimalist desk setup, clean white surface, "
                  "geometric shadows, editorial style",
        "适合":   "数码/办公/科技产品",
    },
    "美食场景": {
        "prompt": "food styling, wooden table, fresh ingredients, "
                  "overhead view, appetizing, cookbook photography",
        "适合":   "食品/饮料/厨房用品",
    },
    "节日主题": {
        "prompt": "Christmas/中秋/春节 themed setting, "
                  "festive decorations, warm atmosphere",
        "适合":   "节日营销/礼盒/限定款",
    },
    "高端奢华": {
        "prompt": "luxury setting, black marble, gold accents, "
                  "dramatic lighting, premium, high-end",
        "适合":   "珠宝/手表/化妆品/酒类",
    },
}

# ═══ 光影控制 ═══
lighting_control = {
    "自然光":   "natural light, window light, soft shadows",
    "工作室":   "studio lighting, softbox, even illumination",
    "戏剧化":   "dramatic side lighting, deep shadows, moody",
    "霓虹":     "neon glow, colorful reflections, cyberpunk",
    "柔光":     "diffused light, no harsh shadows, flat light",
    "逆光":     "backlit, rim light, glowing edges, halo",
}

# ═══ 季节/节日场景快速切换 ═══
seasonal_switch = {
    "春天": "cherry blossoms, fresh green, morning dew",
    "夏天": "tropical, palm leaves, bright sun, vibrant",
    "秋天": "autumn leaves, warm tones, cozy, rustic",
    "冬天": "snow, frost, warm indoor, fireplace",
    "圣诞": "christmas tree, red green gold, gifts, sparkle",
    "新年": "fireworks, champagne, gold, celebrations",
    "情人节": "roses, pink, hearts, romantic, candles",
    "双十一": "neon sale, shopping bags, excitement, red",
}

# ═══ 多角度/多场景一致性 ═══
# 关键: 保持产品 identity 跨场景一致
consistency_tips = {
    "抠图质量": "高质量抠图是一切的基础",
    "光影匹配": "场景光源方向与产品一致",
    "透视匹配": "产品角度与场景透视一致",
    "色温匹配": "产品色温与场景色温一致",
    "阴影添加": "根据场景光源添加合理阴影",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>👗 模特换装</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> virtual_tryon</div>
              <pre className="fs-code">{`# AI虚拟试穿/模特换装: 服装电商革命

# ═══ 虚拟试穿方案 ═══
virtual_tryon = {
    "服装→模特 (最常见)": {
        "输入": "平铺服装图 + 模特图",
        "输出": "模特穿着该服装的效果",
        "工具": "IDM-VTON / OOTDiffusion / CatVTON",
    },
    "模特换装": {
        "输入": "模特穿A服装 → 换成B服装",
        "方法": "Inpainting (只重绘衣服区域)",
    },
    "虚拟模特":  {
        "输入": "服装图 + 指定体型/肤色",
        "输出": "完全 AI 生成的模特穿搭",
        "工具": "ComfyUI + IP-Adapter + ControlNet",
    },
}

# ═══ ComfyUI 虚拟试穿工作流 ═══
tryon_workflow = {
    "Step 1": "加载模特图 → DWPose 提取姿态",
    "Step 2": "加载服装图 → SAM 分割服装",
    "Step 3": "IP-Adapter 注入服装特征",
    "Step 4": "OpenPose ControlNet 保持姿态",
    "Step 5": "Inpainting 重绘服装区域",
    "Step 6": "FaceDetailer 修复面部细节",
    "Step 7": "输出穿着新服装的模特图",
}

# ═══ 虚拟模特生成 ═══
virtual_model = {
    "多样性": {
        "体型":  "标准/大码/瘦型/运动型",
        "肤色":  "全肤色覆盖",
        "年龄":  "青年/中年/银发模特",
        "风格":  "时尚/商务/休闲/运动",
    },
    "一致性保持": {
        "方法": "InstantID + OpenPose",
        "效果": "同一虚拟模特不同服装",
    },
    "优势": {
        "成本":  "传统模特拍摄 ¥5000-20000/天",
        "AI":    "一次训练, 无限生成",
        "速度":  "1分钟/张 vs 1天/10张",
        "灵活":  "随时换场景/姿态/光线",
    },
}

# ═══ 法律与伦理 ═══
legal_ethics = {
    "肖像权":  "AI 模特无肖像权问题",
    "误导性":  "需标注 'AI 生成效果图'",
    "尺码问题": "虚拟试穿≠真实穿着效果",
    "品牌指南": "确保符合品牌调性和多样性",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📊 A/B 测试</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> ab_testing</div>
              <pre className="fs-code">{`# AI 视觉 A/B 测试: 数据驱动设计

# ═══ 为什么要 A/B 测试? ═══
# AI 能快速生成 N 种视觉方案
# → 不再依赖设计师直觉
# → 让数据决定哪种视觉最有效!

# ═══ 测试方法 ═══
ab_test_process = {
    "Step 1 - 生成变体": {
        "方法": "AI 生成 5-10 种视觉方案",
        "维度": "背景色/构图/光线/场景/文字排版",
        "工具": "MJ --repeat / ComfyUI 批量",
    },
    "Step 2 - 上架测试": {
        "平台": "淘宝主图/抖音封面/小红书帖文",
        "指标": "点击率(CTR) / 转化率(CVR)",
        "时间": "每组至少 1000 次曝光",
    },
    "Step 3 - 数据分析": {
        "对比": "各方案的 CTR/CVR 差异",
        "显著性": "统计检验 p<0.05",
        "归因": "分析高效方案的视觉特征",
    },
    "Step 4 - 迭代优化": {
        "方法": "胜出方案 → 微调变体 → 继续测试",
        "循环": "持续优化直到收敛",
    },
}

# ═══ 电商主图 A/B 测试维度 ═══
test_dimensions = {
    "背景色": ["白色", "浅灰", "场景化", "纯色"],
    "构图":   ["居中", "三分法", "对角线", "留白"],
    "光线":   ["正面光", "侧光", "逆光", "柔光"],
    "角度":   ["正面", "45度", "俯拍", "仰拍"],
    "文案":   ["功能卖点", "情感打动", "价格促销", "社交证明"],
    "配色":   ["暖色调", "冷色调", "高对比", "同色系"],
}

# ═══ 自动化测试流程 ═══
auto_ab_test = """
# 全自动 AI 视觉优化管线

import comfyui_api
import analytics

# 1. 定义测试变量
variables = {
    "background": ["marble", "wood", "fabric", "outdoor"],
    "lighting":   ["warm", "cool", "dramatic"],
}

# 2. AI 批量生成 (4×3=12种组合)
for bg in variables["background"]:
    for light in variables["lighting"]:
        prompt = f"product on {bg} surface, {light} lighting"
        generate_and_save(prompt, f"{bg}_{light}.jpg")

# 3. 上传到电商平台 (API)
for variant in variants:
    platform_api.upload_main_image(variant)
    platform_api.start_ab_test(variant, traffic=1/len(variants))

# 4. 等待数据积累 (3-7天)
# 5. 自动分析 + 选出胜者
results = analytics.compare(variants, metric="CTR")
winner = results.get_winner(confidence=0.95)
print(f"胜出方案: {winner}, CTR 提升 {winner.lift}%")
"""

# ═══ 实际案例数据 ═══
real_case = {
    "品类":     "护肤品",
    "测试":     "白底 vs 大理石 vs 花瓣场景",
    "结果": {
        "白底":     "CTR 2.1%",
        "大理石":   "CTR 2.8% (+33%!)",
        "花瓣场景": "CTR 3.2% (+52%!)",
    },
    "月收入增长": "场景图版本, 月销售额 +23%",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
