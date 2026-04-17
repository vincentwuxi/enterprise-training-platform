import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['V7 特性', '参数体系', '风格控制', '高级技巧'];

export default function LessonMidjourneyMastery() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">💎 module_02 — Midjourney 精通</div>
      <div className="fs-hero">
        <h1>Midjourney 精通：V7 / 参数体系 / 风格控制 — 商业级 AI 绘画</h1>
        <p>
          Midjourney 是商业 AI 绘画的事实标准：<strong>V7</strong> 带来革命性的
          图像编辑、人物一致性和精确控制能力。本模块从参数体系到高级技巧，
          帮你将 Midjourney 从"碰运气"变为"精确工具"。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">💎 Midjourney</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🆕 V7 新特性</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> mj_v7</div>
              <pre className="fs-code">{`# Midjourney V7: 跨越式升级

# ═══ V7 核心突破 ═══
v7_features = {
    "图像编辑 (Editor)": {
        "能力": "直接在生成图上编辑修改",
        "操作": "选区 + 文字指令 → 局部重绘",
        "例子": "选中背景 → '改成日落' → 只改背景",
        "意义": "从 '生成' 到 '编辑' 的范式转变",
    },
    "人物一致性 (--cref)": {
        "能力": "多张图保持同一人物/角色",
        "用法": "--cref [参考图URL]",
        "强度": "--cw 0-100 (控制参考强度)",
        "用途": "IP 角色设计 / 漫画连载",
    },
    "风格参考 (--sref)": {
        "能力": "从参考图学习风格",
        "用法": "--sref [风格图URL]",
        "强度": "--sw 0-1000 (默认100)",
        "用途": "品牌一致性 / 系列作品",
    },
    "Draft 模式": {
        "能力": "快速低质预览",
        "速度": "比标准快 10x",
        "用途": "快速迭代概念",
    },
    "更好的文字渲染": {
        "能力": "生成图内准确文字",
        "方法": "用引号包裹: 'HELLO WORLD'",
    },
}

# ═══ V7 vs V6 对比 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │              │ V6           │ V7           │
# ├──────────────┼──────────────┼──────────────┤
# │ 图像编辑     │ ❌            │ ✅ 原生       │
# │ 人物一致性   │ ⚠️ 有限       │ ✅ --cref     │
# │ 文字渲染     │ ⚠️ 偶尔准确   │ ✅ 显著改善   │
# │ Prompt 理解  │ ⭐⭐⭐⭐        │ ⭐⭐⭐⭐⭐      │
# │ 写实质量     │ ⭐⭐⭐⭐        │ ⭐⭐⭐⭐⭐      │
# │ 手部质量     │ ⚠️ 偶尔变形   │ ✅ 大幅改善   │
# └──────────────┴──────────────┴──────────────┘

# ═══ Web 界面 (alpha.midjourney.com) ═══
web_features = {
    "画布编辑":   "直接在浏览器中编辑/重绘",
    "图片整理":   "文件夹/标签管理生成结果",
    "历史搜索":   "搜索过往生成的所有图片",
    "社区浏览":   "浏览他人公开作品+提示词",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚙️ 参数体系</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> mj_params</div>
              <pre className="fs-code">{`# Midjourney 参数完全手册

# ═══ 核心参数 ═══
core_params = {
    "--ar": {
        "作用": "长宽比 (Aspect Ratio)",
        "常用": {
            "1:1":  "正方形 (社交媒体头像)",
            "16:9": "宽屏 (YouTube/PPT)",
            "9:16": "竖屏 (手机壁纸/短视频)",
            "3:2":  "摄影标准 (打印)",
            "2:3":  "竖版摄影 (人像)",
            "4:5":  "Instagram 推荐",
            "21:9": "超宽 (电影/Banner)",
        },
    },
    "--s / --stylize": {
        "作用": "Midjourney 风格化强度",
        "范围": "0-1000 (默认100)",
        "低值": "更贴近 Prompt (写实/精确)",
        "高值": "更艺术化 (MJ 自由发挥)",
        "建议": "商业用 50-150, 艺术探索 300+",
    },
    "--c / --chaos": {
        "作用": "生成结果的多样性",
        "范围": "0-100 (默认0)",
        "低值": "4张结果相似 (确定性高)",
        "高值": "4张结果差异大 (探索性强)",
    },
    "--q / --quality": {
        "作用": "渲染质量/时间",
        "选项": "0.25 / 0.5 / 1 (默认)",
        "低值": "快速, 适合初步探索",
    },
    "--no": {
        "作用": "负面提示 (排除元素)",
        "例子": "--no text, watermark, frame",
    },
}

# ═══ 高级参数 ═══
advanced_params = {
    "--cref [URL]": "角色参考 (保持人物一致性)",
    "--sref [URL]": "风格参考 (学习参考图风格)",
    "--cw 0-100":   "角色参考权重 (默认100)",
    "--sw 0-1000":  "风格参考权重 (默认100)",
    "--tile":       "生成无缝拼接纹理",
    "--seed N":     "指定随机种子 (复现结果)",
    "--repeat N":   "重复生成 N 次 (批量)",
    "--weird N":    "奇异度 0-3000",
}

# ═══ 实战参数组合 ═══
param_combos = {
    "商品摄影":   "--ar 1:1 --s 50 --q 1",
    "电影海报":   "--ar 2:3 --s 200 --q 1",
    "UI 设计":    "--ar 16:9 --s 50 --no text",
    "概念探索":   "--ar 1:1 --c 50 --s 300",
    "系列插画":   "--ar 3:2 --sref [风格图] --sw 200",
    "品牌物料":   "--ar 16:9 --sref [品牌图] --sw 150",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎭 风格控制</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> style_control</div>
              <pre className="fs-code">{`# Midjourney 风格控制: 精确驾驭视觉语言

# ═══ 风格关键词库 ═══
style_keywords = {
    "摄影风格": {
        "人像":   "portrait photography, 85mm, bokeh, natural light",
        "风景":   "landscape photography, golden hour, panoramic",
        "产品":   "product photography, studio lighting, white background",
        "街拍":   "street photography, candid, urban, 35mm",
        "美食":   "food photography, overhead, styled, appetizing",
        "建筑":   "architectural photography, perspective, symmetry",
    },
    "艺术风格": {
        "印象派":  "impressionist, Monet, soft brushstrokes, light play",
        "波普":    "pop art, Andy Warhol, bold colors, halftone",
        "新艺术":  "art nouveau, Alphonse Mucha, flowing lines, floral",
        "水墨":    "Chinese ink painting, sumi-e, minimalist, zen",
        "像素":    "pixel art, retro, 8-bit, nostalgic",
        "浮世绘":  "ukiyo-e, Japanese woodblock, Hokusai",
    },
    "设计风格": {
        "极简":    "minimalist design, clean, whitespace, modern",
        "扁平":    "flat design, vector, geometric, solid colors",
        "玻璃拟态": "glassmorphism, frosted glass, transparency, blur",
        "新拟物":   "neumorphism, soft shadows, subtle, tactile",
        "赛博朋克": "cyberpunk, neon, dark, futuristic, rain",
        "蒸汽波":   "vaporwave, pink purple, retro, greek statue",
    },
}

# ═══ --sref 风格参考实战 ═══
# 方法: 找到喜欢的风格图 → 用 --sref 锁定风格
sref_workflow = {
    "Step 1": "找到目标风格的参考图 (1-5张)",
    "Step 2": "上传到 MJ 或使用图片 URL",
    "Step 3": "在 Prompt 中添加 --sref [URL]",
    "Step 4": "调整 --sw (风格权重)",
    "Step 5": "固定 --sref, 变换内容 → 系列作品",
}

# 示例: 统一品牌风格的系列插画
brand_series = """
/imagine a coffee shop interior --sref https://style.jpg --sw 200
/imagine a bookstore interior --sref https://style.jpg --sw 200
/imagine a flower shop interior --sref https://style.jpg --sw 200
→ 三张图风格完全一致!
"""

# ═══ --cref 角色一致性实战 ═══
# 保持角色跨场景一致
character_consistency = """
# 1. 先生成一个满意的角色
/imagine a young woman with red hair, freckles, green eyes,
warm smile, portrait --ar 1:1

# 2. 用 --cref 在不同场景中复用
/imagine [角色] reading in a cozy library 
  --cref [角色图URL] --cw 100
/imagine [角色] walking in a rain-soaked city 
  --cref [角色图URL] --cw 100
/imagine [角色] sitting in a Japanese garden 
  --cref [角色图URL] --cw 100
"""`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔮 高级技巧</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> advanced_tips</div>
              <pre className="fs-code">{`# Midjourney 高级技巧: 从好用到精通

# ═══ 多提示混合 (Multi-Prompt) ═══
# 用 :: 分隔不同概念, 可设权重
multi_prompt = {
    "基础": "cat::dog → 猫狗混合体",
    "权重": "cat::2 dog::1 → 更像猫",
    "排除": "cat::1 dog::-0.5 → 猫, 避免像狗",
    "风格": "portrait::1 watercolor::0.5 → 水彩肖像",
}

# ═══ Vary (变体系统) ═══
vary_system = {
    "Vary Strong":  "大幅变化, 保留概念",
    "Vary Subtle":  "微调, 保留主体",
    "Vary Region":  "选区变化 (局部重绘!)",
    "Pan":          "扩展画布 (向任意方向)",
    "Zoom Out":     "缩小 → 扩展周围环境",
}

# ═══ 图像混合 (Blend) ═══
# /blend [图1] [图2] → 混合两张图的特征
blend_uses = {
    "风格迁移":  "内容图 + 风格图 → 混合",
    "概念融合":  "猫图 + 机器人图 → 机器猫",
    "色彩参考":  "布局图 + 配色图 → 新配色",
}

# ═══ 批量生产工作流 ═══
batch_workflow = {
    "Step 1": "确定最终风格 (--sref + --s + prompt模板)",
    "Step 2": "用 --repeat 批量生成候选",
    "Step 3": "U (放大) 满意的结果",
    "Step 4": "Vary Region 修正细节",
    "Step 5": "导出 → 后期 (PS/Figma)",
}

# ═══ 与 PS/Figma 联动 ═══
integration = {
    "Midjourney → Photoshop": {
        "1": "MJ 生成高质量基础图",
        "2": "PS 精修/合成/添加文字",
        "3": "PS Generative Fill 局部补充",
    },
    "Midjourney → Figma": {
        "1": "MJ 生成 UI 视觉稿概念",
        "2": "Figma 中分解为可用组件",
        "3": "调整间距/文字/交互逻辑",
    },
    "Midjourney → PPT/Canva": {
        "1": "MJ 生成背景/插图/图标",
        "2": "导入演示文稿模板",
        "3": "统一风格的商业演示",
    },
}

# ═══ MJ 的局限性 ═══
limitations = {
    "精确控制": "无法像 ControlNet 那样精确",
    "人物手部": "改善了但仍偶尔异常",
    "文字精度": "长文本/中文仍有问题",
    "商业授权": "付费用户拥有商用权",
    "API 缺失": "无官方 API (2025 限制)",
    "数据隐私": "图片上传到 MJ 服务器",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
