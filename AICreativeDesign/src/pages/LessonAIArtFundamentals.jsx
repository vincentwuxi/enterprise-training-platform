import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Diffusion 原理', 'Prompt 工程', '平台对比', '模型生态'];

export default function LessonAIArtFundamentals() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎨 module_01 — AI 绘画基础</div>
      <div className="fs-hero">
        <h1>AI 绘画基础：Diffusion 原理 / Prompt 工程 / 主流平台 — 创意 AI 的入门</h1>
        <p>
          AI 图像生成已从实验走向商业主流：<strong>Midjourney</strong> 月收入过亿美元，
          <strong>Stable Diffusion</strong> 开源生态覆盖数百万用户，
          <strong>DALL·E 3 / Imagen 3</strong> 集成进主流产品。
          本模块帮你理解底层原理、掌握 Prompt 技巧、选择合适的平台工具。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎨 AI 绘画</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧪 Diffusion 原理</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> diffusion_basics</div>
              <pre className="fs-code">{`# Diffusion Model: AI 绘画的核心引擎

# ═══ 核心思想 (极简版) ═══
# 前向过程: 图片 → 逐步加噪 → 纯噪声
# 反向过程: 纯噪声 → 逐步去噪 → 清晰图片
# 训练: 学会 "去噪" → 从噪声中 "想象" 图片

# ═══ 直觉理解 ═══
# 想象你把一张照片慢慢模糊:
# 步骤0: 清晰照片 🖼️
# 步骤1: 轻微模糊  
# 步骤2: 更模糊    
# ...
# 步骤T: 纯噪声 📺 (看不出原来是什么)
#
# AI 学的是: 给定一张模糊图 → 还原回去一步
# 推理时: 从纯噪声开始, 一步步 "去噪" → 生成图片!

# ═══ 关键组件 ═══
diffusion_components = {
    "UNet": {
        "作用": "噪声预测网络 (核心)",
        "输入": "带噪图 + 时间步 + 文本条件",
        "输出": "预测的噪声",
        "结构": "编码器-解码器 + 跳跃连接 + 注意力",
    },
    "文本编码器": {
        "CLIP":  "OpenAI, SD 1.x/2.x 使用",
        "T5":    "Google, Imagen/PixArt 使用",
        "双编码": "SDXL 使用 CLIP + OpenCLIP",
    },
    "VAE (变分自编码器)": {
        "编码": "图片 512×512 → 潜空间 64×64",
        "解码": "潜空间 64×64 → 图片 512×512",
        "作用": "降低计算量 8×8 倍!",
    },
    "采样器 (Sampler)": {
        "DDPM":   "50步, 慢但高质量",
        "DDIM":   "20步, 确定性采样",
        "Euler":  "20-30步, 快速",
        "DPM++":  "15-25步, 高质量常用",
    },
}

# ═══ 生成流程 ═══
# 用户输入: "一只穿宇航服的猫, 太空背景, 油画风格"
#
# Step 1: 文本编码
#   CLIP("一只穿宇航服的猫...") → 文本嵌入 (77, 768)
#
# Step 2: 初始噪声
#   z = random_noise(64, 64, 4)  # 潜空间
#
# Step 3: 迭代去噪 (20-50步)
#   for t in reversed(range(T)):
#       predicted_noise = UNet(z_t, t, text_embedding)
#       z_{t-1} = denoise_step(z_t, predicted_noise)
#
# Step 4: VAE 解码
#   image = VAE.decode(z_0)  # 64×64 → 512×512

# ═══ Stable Diffusion 版本演进 ═══
sd_versions = {
    "SD 1.5":   "512×512, 经典, 社区最活跃",
    "SDXL":     "1024×1024, 双文本编码, 高质量",
    "SD 3":     "MMDiT 架构, Transformer 替代 UNet",
    "FLUX.1":   "Black Forest Labs, 最强开源 (2024)",
    "SD 3.5":   "开源, 多尺寸, 改进质量",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>✍️ Prompt 工程</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> prompt_engineering</div>
              <pre className="fs-code">{`# AI 绘画 Prompt 工程: 从文字到图像的桥梁

# ═══ Prompt 结构公式 ═══
# [主体] + [细节描述] + [环境/场景] + [风格] + [质量词] + [参数]

prompt_formula = {
    "主体":   "什么? (人物/物体/场景)",
    "细节":   "穿着/颜色/材质/动作/表情",
    "环境":   "在哪? (室内/户外/时间/天气)",
    "构图":   "视角/镜头 (特写/全景/俯视)",
    "风格":   "什么风格? (油画/水彩/摄影/3D)",
    "质量":   "质量词 (高质量/细节丰富)",
}

# ═══ 实战示例 ═══
examples = {
    "基础": "a cat wearing a spacesuit, floating in space",
    
    "进阶": """a majestic cat wearing a detailed NASA spacesuit, 
    floating in deep space, Earth visible in background, 
    volumetric lighting, cinematic composition, 
    hyper-realistic, 8K, octane render""",
    
    "专业": """portrait of a cyberpunk samurai, 
    neon-lit Tokyo streets at night, rain reflections, 
    blade runner aesthetic, dramatic rim lighting,
    shot on Sony A7III, 85mm f/1.4, 
    masterpiece, award-winning photography""",
}

# ═══ 关键技巧 ═══
techniques = {
    "权重调整": {
        "Midjourney": "无需权重, 靠措辞和顺序",
        "SD/ComfyUI": "(重要词:1.5) 增加, (不重要:0.5) 降低",
    },
    "负面提示 (Negative)": {
        "通用": "low quality, blurry, deformed, ugly, duplicate",
        "人物": "+ bad anatomy, extra fingers, mutated hands",
        "风景": "+ text, watermark, signature, frame",
    },
    "风格关键词": {
        "写实摄影": "photorealistic, RAW photo, DSLR, natural lighting",
        "插画":     "illustration, digital art, trending on artstation",
        "油画":     "oil painting, impasto, canvas texture, brushstrokes",
        "水彩":     "watercolor, soft edges, paper texture, delicate",
        "3D渲染":   "3D render, octane, unreal engine 5, ray tracing",
        "动漫":     "anime style, cel shading, studio ghibli",
        "极简":     "minimalist, flat design, vector, clean lines",
    },
    "镜头语言": {
        "特写":   "close-up, macro, detailed",
        "中景":   "medium shot, waist-up",
        "全景":   "wide shot, establishing shot",
        "鸟瞰":   "aerial view, bird's eye view, drone shot",
        "低角度": "low angle, worm's eye view, dramatic",
    },
    "光线":  {
        "金色时刻": "golden hour, warm sunlight",
        "蓝色时刻": "blue hour, twilight",
        "工作室":   "studio lighting, softbox",
        "戏剧化":   "dramatic lighting, chiaroscuro, rim light",
        "霓虹":     "neon lights, cyberpunk, glowing",
    },
}

# ═══ 避坑指南 ═══
common_mistakes = {
    "过长 Prompt":  "→ 重要信息被稀释, 保持 75 token 以内",
    "矛盾描述":    "→ '白天的夜景' 会混乱",
    "过度堆砌":    "→ 太多风格词互相冲突",
    "忽略构图":    "→ 缺乏视觉焦点",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔍 平台对比</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> platform_comparison</div>
              <pre className="fs-code">{`# AI 绘画平台全景对比 (2025)

# ═══ 主流平台 ═══
platforms = {
    "Midjourney": {
        "类型":   "商业 SaaS (Discord/Web)",
        "质量":   "⭐⭐⭐⭐⭐ (最高审美)",
        "易用":   "⭐⭐⭐⭐⭐ (自然语言)",
        "控制":   "⭐⭐⭐ (参数有限)",
        "价格":   "$10-60/月",
        "适合":   "设计师/创意人员/快速出图",
        "特色":   "审美顶级, 一致性好, V7 编辑能力",
    },
    "DALL·E 3 (OpenAI)": {
        "类型":   "API + ChatGPT 集成",
        "质量":   "⭐⭐⭐⭐ (文字理解最强)",
        "易用":   "⭐⭐⭐⭐⭐ (对话式)",
        "控制":   "⭐⭐ (最少)",
        "价格":   "ChatGPT Plus $20/月",
        "适合":   "文案/营销/快速概念",
        "特色":   "文字渲染最强, 语义理解最准",
    },
    "Stable Diffusion": {
        "类型":   "开源 (本地/云端)",
        "质量":   "⭐⭐⭐⭐ (取决于模型)",
        "易用":   "⭐⭐⭐ (需要学习)",
        "控制":   "⭐⭐⭐⭐⭐ (完全可控)",
        "价格":   "免费 (GPU 成本)",
        "适合":   "技术人员/定制化需求",
        "特色":   "完全开源, ControlNet, LoRA",
    },
    "FLUX.1": {
        "类型":   "开源 (Black Forest Labs)",
        "质量":   "⭐⭐⭐⭐⭐ (开源最强)",
        "特色":   "Transformer 架构, 文字渲染好",
        "版本":   "Pro (API) / Dev (开源) / Schnell (快速)",
    },
    "Imagen 3 (Google)": {
        "类型":   "API (Vertex AI)",
        "质量":   "⭐⭐⭐⭐⭐",
        "特色":   "PhotoRealistic, 最少瑕疵",
    },
    "可灵 (快手)": {
        "类型":   "国产 SaaS",
        "特色":   "视频生成领先, 图生视频",
    },
}

# ═══ 选择决策树 ═══
decision_tree = """
你需要什么?
├─ 最高审美质量 → Midjourney
├─ 精确文字/插图 → DALL·E 3
├─ 完全控制/定制 → Stable Diffusion + ComfyUI
├─ 开源最强质量 → FLUX.1
├─ 商业API集成 → DALL·E 3 API / Imagen 3
├─ 图生视频 → 可灵 / Runway
└─ 预算有限 → SD 本地部署
"""

# ═══ 成本对比 (1000张图) ═══
cost_comparison = {
    "Midjourney Basic":   "$10 (200张fast) → ~$50/1000张",
    "DALL·E 3 API":       "$0.04/张 → $40/1000张",
    "Imagen 3 API":       "$0.04/张 → $40/1000张",
    "SD 本地 (RTX 4090)": "电费 ~$2/1000张",
    "FLUX.1 Pro API":     "$0.05/张 → $50/1000张",
    "ComfyUI 云端":       "GPU 租用 ~$10/1000张",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧩 模型生态</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> model_ecosystem</div>
              <pre className="fs-code">{`# AI 绘画模型生态: 开源的力量

# ═══ 模型托管平台 ═══
platforms = {
    "Civitai": {
        "内容": "最大的 SD 模型社区",
        "模型数": "100,000+ 模型",
        "类型": "Checkpoint / LoRA / Embedding",
        "特色": "预览图/评分/下载量",
    },
    "Hugging Face": {
        "内容": "开源模型标准托管",
        "特色": "Diffusers 库 / 模型卡片",
    },
}

# ═══ 模型类型 ═══
model_types = {
    "Checkpoint (大模型)": {
        "大小":   "2-7 GB",
        "作用":   "基础生成能力 (风格/质量)",
        "例子":   "DreamShaper / Realistic Vision / AnythingV5",
        "训练":   "完整微调, 需要大量数据+算力",
    },
    "LoRA (Low-Rank Adaptation)": {
        "大小":   "10-200 MB",
        "作用":   "轻量微调 (人物/风格/概念)",
        "例子":   "特定人物脸 / 特定画风 / 特定物体",
        "训练":   "少量图片 (10-50张) + 几小时",
        "使用":   "叠加在 Checkpoint 上使用",
    },
    "Textual Inversion (Embedding)": {
        "大小":   "几 KB",
        "作用":   "学习新概念/风格的文本表示",
        "训练":   "最简单, 几张图即可",
    },
    "ControlNet": {
        "大小":   "1-2 GB",
        "作用":   "结构控制 (姿态/边缘/深度)",
        "类型":   "Canny / Depth / OpenPose / Tile",
    },
}

# ═══ 训练自己的 LoRA ═══
# 用途: 学习特定人脸/风格/IP 角色
lora_training = {
    "数据准备": {
        "数量":     "10-50 张高质量图片",
        "分辨率":   "512×512 或 1024×1024",
        "标注":     "自动标注 (BLIP) + 手动调整",
        "多样性":   "不同角度/光照/表情",
    },
    "训练工具": {
        "Kohya_ss":   "最流行, GUI + 命令行",
        "LoRA-Easy":  "简化版, 一键训练",
        "AI Toolkit": "Ostris, FLUX LoRA",
    },
    "关键参数": {
        "学习率":     "1e-4 (LoRA 标准)",
        "训练步数":   "1500-5000 步",
        "Rank":       "16-128 (越大越拟合)",
        "批大小":     "1-4 (显存限制)",
    },
    "训练时间": "RTX 4090, 约 30-120 分钟",
    "输出": "LoRA 文件 (.safetensors) 10-200MB",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
