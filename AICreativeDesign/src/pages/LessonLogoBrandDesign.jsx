import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['AI Logo 设计', 'VI 系统', '品牌物料', '案例复盘'];

export default function LessonLogoBrandDesign() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge gold">✨ module_05 — Logo 与品牌设计</div>
      <div className="fs-hero">
        <h1>Logo 与品牌设计：AI 辅助标志 / VI 系统 / 品牌视觉 — 创意效率革命</h1>
        <p>
          AI 正在重塑品牌设计流程：从概念探索到成品输出，
          效率提升 5-10 倍。本模块覆盖 Logo 生成、VI 系统延展、
          品牌物料批量生产的完整实战。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">✨ 品牌设计</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏷️ AI Logo 设计</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#eab308'}}></span> ai_logo</div>
              <pre className="fs-code">{`# AI 辅助 Logo 设计: 从概念到矢量

# ═══ Logo 设计工作流 ═══
logo_workflow = {
    "Phase 1 - 概念探索 (AI)": {
        "工具": "Midjourney / DALL·E 3",
        "方法": "批量生成 20-50 个概念方向",
        "时间": "30分钟 (传统: 2-3天)",
        "Prompt 模板": [
            "minimalist logo for [品牌], [行业], ",
            "flat vector style, single color, ",
            "white background, clean lines",
        ],
    },
    "Phase 2 - 方向筛选": {
        "步骤": "从 50 个概念中筛选 3-5 个方向",
        "标准": "识别度/可缩放/行业关联/独特性",
    },
    "Phase 3 - 精修完善 (AI+手工)": {
        "工具": "ComfyUI (精确控制) + Illustrator",
        "步骤": "ControlNet 线稿约束 → 细节调整",
    },
    "Phase 4 - 矢量化": {
        "工具": "Vectorizer.ai / Image Trace",
        "输出": "SVG/AI 矢量文件",
    },
    "Phase 5 - 规范化": {
        "输出": "标准色/安全区域/最小尺寸/使用规范",
    },
}

# ═══ Logo Prompt 技巧 ═══
logo_prompts = {
    "极简图标": 
        "minimal iconic logo, [concept], geometric, "
        "single line weight, negative space, "
        "black on white background, vector",
    
    "字母标":
        "lettermark logo, letter [X], modern typography, "
        "unique, professional, minimalist, "
        "white background",
    
    "徽章":
        "emblem logo, [brand name], vintage badge, "
        "ornamental frame, premium, established, "
        "single color, detailed illustration",
    
    "吉祥物":
        "mascot logo, cute [animal], friendly, "
        "brand mascot, simple shapes, "
        "flat design, vibrant colors",
    
    "抽象":
        "abstract logo mark, [concept], flowing shapes, "
        "gradient colors, modern, dynamic, "
        "white background, minimal",
}

# ═══ 常见问题与解决 ═══
logo_issues = {
    "太复杂":     "加 'minimalist, simple, clean'",
    "不够专业":   "加 'professional, corporate, premium'",
    "文字变形":   "Logo 和文字分开生成, 后期合成",
    "缩小模糊":   "矢量化后测试最小尺寸 (16px图标)",
    "颜色太多":   "限制 'two-color, monochrome'",
}

# ═══ AI Logo ≠ 最终 Logo ═══
# AI 生成的是"概念方向/灵感草图"
# 最终 Logo 仍需设计师:
# 1. 矢量重绘 (精确曲线)
# 2. 字体选配 (版权可用)
# 3. 多场景测试 (黑底/白底/缩小)
# 4. 品牌故事整合`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📐 VI 系统</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> vi_system</div>
              <pre className="fs-code">{`# AI 辅助 VI (视觉识别) 系统设计

# ═══ VI 系统要素 ═══
vi_elements = {
    "基础系统": {
        "Logo":         "主 Logo + 变体 + 图标",
        "标准色":       "主色 + 辅色 + 点缀色",
        "标准字体":     "标题字 + 正文字 + 辅助字",
        "辅助图形":     "品牌纹理/图案/几何元素",
    },
    "应用系统": {
        "名片":         "正面/背面设计",
        "信纸/信封":    "公司文件模板",
        "PPT 模板":     "演示文稿标准模板",
        "社交媒体":     "头像/封面/帖子模板",
        "包装":         "产品包装视觉",
        "环境导视":     "门店/办公空间标识",
    },
}

# ═══ AI 生成 VI 辅助图形 ═══
# 品牌图案/纹理: Midjourney --tile 模式
pattern_prompts = {
    "几何":   "--tile geometric pattern, [brand colors], "
              "minimalist, repeating, seamless",
    "有机":   "--tile organic pattern, leaves, flowing, "
              "[brand colors], nature inspired",
    "抽象":   "--tile abstract pattern, gradients, "
              "modern, [brand colors]",
}

# ═══ AI 一致性配色 ═══
# 从 Logo 提取品牌色 → 应用到所有物料
color_workflow = {
    "提取": "Logo主色 → HSL 值 → 配色规则",
    "生成": "所有 AI 生成图都使用品牌色控制",
    "方法": {
        "Midjourney": "--sref [品牌色参考图] --sw 200",
        "ComfyUI":    "Color Palette ControlNet",
        "后期":       "PS 色彩映射到品牌色",
    },
}

# ═══ 品牌字体搭配建议 ═══
font_pairs = {
    "科技/现代":    "Montserrat + Inter",
    "优雅/高端":    "Playfair Display + Lato",
    "创意/活力":    "Poppins + Nunito",
    "传统/稳重":    "Merriweather + Source Sans",
    "极简/清新":    "Outfit + DM Sans",
    "中文商务":     "思源黑体 + 思源宋体",
    "中文创意":     "阿里巴巴普惠体 + 站酷快乐体",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📦 品牌物料</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> brand_assets</div>
              <pre className="fs-code">{`# AI 批量生成品牌物料

# ═══ 社交媒体内容矩阵 ═══
social_media_matrix = {
    "小红书": {
        "尺寸": "1080×1440 (3:4)",
        "风格": "精致/高颜值/生活方式",
        "产出": "封面图 + 详情图 3-9 张",
        "AI流程": "MJ生成 → Canva排版 → 发布",
    },
    "抖音/快手": {
        "尺寸": "1080×1920 (9:16)",
        "风格": "抓眼球/信息密度高",
        "产出": "封面 + 口播背景 + 产品展示",
    },
    "公众号": {
        "尺寸": "封面 900×383, 头图 1080×1080",
        "风格": "专业/信息化/标题突出",
    },
    "Instagram": {
        "尺寸": "1080×1080 (1:1) / 1080×1350 (4:5)",
        "风格": "美学/调性一致/系列化",
    },
}

# ═══ AI 海报设计工作流 ═══
poster_workflow = {
    "Step 1 - 背景": "MJ 生成品牌风格背景 (--sref品牌风格)",
    "Step 2 - 主体": "产品/人物抠图 (Segment Anything)",
    "Step 3 - 合成": "Figma/PS 合成 (背景+主体+文字)",
    "Step 4 - 文字": "手动排版 (AI 文字渲染仍不可靠)",
    "Step 5 - 倍图": "ComfyUI 放大到印刷分辨率",
}

# ═══ 批量物料生产 ═══
# 用 ComfyUI API 批量生成系列化内容
batch_brand = """
import json, requests

# 品牌参数
brand = {
    "style_ref": "brand_style.png",
    "colors": "#2563EB, #60A5FA, #FFFFFF",
    "scenes": [
        "modern office workspace with laptop",
        "coffee shop table with notebook",
        "outdoor meeting space with trees",
        "minimalist desk setup with plant",
    ],
}

for scene in brand["scenes"]:
    prompt = f"{scene}, {brand['colors']} color palette, "
             f"professional, brand photography"
    # 提交到 ComfyUI 队列
    queue_prompt(workflow, prompt, style_ref=brand["style_ref"])
    
# → 4 张风格统一的品牌场景图, 5 分钟完成
"""

# ═══ 名片 Mockup 生成 ═══
# AI 生成逼真的名片/包装效果图
mockup_prompt = """
# Midjourney:
photorealistic business card mockup,
[品牌色] color scheme, marble surface,
soft shadows, professional photography,
shallow depth of field --ar 16:9
"""`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📊 案例复盘</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> case_studies</div>
              <pre className="fs-code">{`# 品牌设计案例复盘

# ═══ 案例: 科技创业公司品牌全案 ═══
case_study = {
    "客户": "AI SaaS 创业公司",
    "需求": "Logo + VI + 官网视觉 + 社媒模板",
    "预算": "传统: ¥50,000-100,000",
    "AI 辅助后": "¥15,000-25,000",
    
    "流程": {
        "Day 1 (概念)": {
            "AI 工作": "MJ 生成 60+ Logo 概念",
            "人工": "筛选 5 个方向 → 客户选 2 个",
            "时间": "AI 30min + 筛选 2h",
        },
        "Day 2-3 (精修)": {
            "AI 工作": "ComfyUI ControlNet 精修方向",
            "人工": "Illustrator 矢量化 + 字体搭配",
            "时间": "AI 2h + 人工 8h",
        },
        "Day 4-5 (VI延展)": {
            "AI 工作": "MJ 批量生成应用场景图",
            "人工": "规范化排版 + 品牌手册",
            "交付": "50+ 页品牌手册",
        },
        "Day 6-7 (物料)": {
            "AI 工作": "ComfyUI 批量出图",
            "人工": "文字排版 + 细节调整",
            "交付": "30+ 社媒模板 + 海报",
        },
    },
    
    "效率对比": {
        "概念探索":  "传统 5天 → AI 0.5天 (10x)",
        "VI 延展":   "传统 5天 → AI 2天 (2.5x)",
        "物料生产":  "传统 7天 → AI 2天 (3.5x)",
        "总工期":    "传统 25天 → AI 7天 (3.5x)",
    },
}

# ═══ 关键学习 ═══
lessons_learned = {
    "AI 擅长": [
        "大量概念探索/头脑风暴",
        "风格统一的系列化内容",
        "场景化 Mockup 效果图",
        "背景/纹理/辅助图形",
    ],
    "AI 不擅长": [
        "精确的文字排版",
        "像素级完美对齐",
        "品牌故事/理念提炼",
        "印刷工艺细节控制",
    ],
    "最佳实践": [
        "AI生成概念 + 人工精修 = 最优组合",
        "建立品牌风格库 (--sref + LoRA)",
        "文字排版一定手动完成",
        "留出客户反馈迭代时间",
    ],
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
