import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Sora/Veo', 'Kling/Runway', '可控生成', '工程实践'];

export default function LessonVideoGen() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🎬 module_05 — AI 视频生成</div>
      <div className="fs-hero">
        <h1>AI 视频生成：Sora / Veo 2 / Kling / Runway — 文生视频工程</h1>
        <p>
          2024-2025 是 AI 视频生成元年：<strong>OpenAI Sora</strong> 世界模型引爆想象，
          <strong>Google Veo 2</strong> 追平质量，<strong>快影 Kling</strong> 实现中国本土落地，
          <strong>Runway Gen-3</strong> 持续迭代。本模块深入视频 Diffusion 模型原理，
          掌握各平台 API 调用、Prompt 工程、镜头控制、
          以及从原型到生产的工程化实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎬 视频生成</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🌍 Sora / Veo 2</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> sora_veo</div>
              <pre className="fs-code">{`# Sora & Veo: 世界模型级视频生成

# ═══ OpenAI Sora ═══
sora_capabilities = {
    "质量":     "最高, 物理一致性强",
    "时长":     "5-60秒 (API 可延长)",
    "分辨率":   "1080p / 4K",
    "输入":     "文本 / 图片 / 视频 (编辑)",
    "风格":     "写实/动画/3D/混合",
    "模型":     "DiT (Diffusion Transformer) 架构",
}

# Sora API 调用
from openai import OpenAI
client = OpenAI()

# 文生视频
response = client.videos.generate(
    model="sora",
    prompt="""
    A serene Japanese garden in autumn, cherry blossom
    petals falling slowly. Camera slowly dollies forward
    along a stone path. Soft golden hour lighting.
    Cinematic quality, 4K.
    """,
    size="1920x1080",
    duration=10,  # 秒
    fps=24,
)

video_url = response.data[0].url
# 下载视频...

# ═══ Google Veo 2 ═══
veo2_capabilities = {
    "质量":     "接近 Sora, 物理理解强",
    "时长":     "最长 2 分钟",
    "分辨率":   "4K",
    "控制":     "镜头运动/光照/风格 可控性强",
    "集成":     "Vertex AI + YouTube 生态",
    "成本":     "比 Sora 便宜 ~30-50%",
}

# Veo 2 via Vertex AI
from google.cloud import aiplatform

model = aiplatform.Model("projects/my-project/models/veo-2")
response = model.predict(
    instances=[{
        "prompt": "A robot learning to paint watercolors...",
        "duration_seconds": 8,
        "aspect_ratio": "16:9",
        "resolution": "1080p",
    }]
)

# ═══ Sora vs Veo 2 ═══
# ┌────────────┬─────────────┬─────────────┐
# │            │ Sora        │ Veo 2       │
# ├────────────┼─────────────┼─────────────┤
# │ 物理一致性 │ ⭐⭐⭐⭐⭐    │ ⭐⭐⭐⭐      │
# │ 人物一致性 │ ⭐⭐⭐⭐      │ ⭐⭐⭐⭐      │
# │ 最长时长   │ 60s         │ 120s        │
# │ 成本       │ 较高        │ 较低        │
# │ API 成熟度 │ 高          │ 高          │
# │ 生态       │ OpenAI      │ Google Cloud│
# └────────────┴─────────────┴─────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🇨🇳 Kling / Runway</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> kling_runway</div>
              <pre className="fs-code">{`# 中国方案 & 创作者首选

# ═══ 快影 Kling (快手) ═══
kling_features = {
    "Kling 1.5": {
        "质量":   "接近 Sora, 中国最强",
        "时长":   "5-10秒 (可拼接)",
        "控制":   "运镜控制/表情控制/物体控制",
        "中文":   "原生中文理解, 中国场景最佳",
        "API":    "开放 API (国内可用)",
    },
    "商业应用": {
        "广告":   "品牌TVC概念视频",
        "电商":   "商品展示视频",
        "短视频": "抖音/快手内容创作",
    },
}

# Kling API 调用
import requests

response = requests.post(
    "https://api.klingai.com/v1/videos/generate",
    headers={"Authorization": f"Bearer {KLING_API_KEY}"},
    json={
        "prompt": "一杯咖啡在木桌上冒着热气, 阳光透过窗户洒入, 温暖柔和",
        "duration": 5,
        "aspect_ratio": "16:9",
        "quality": "high",
        "camera_movement": "slow_zoom_in",
    }
)

# ═══ Runway Gen-3 Alpha ═══
runway_features = {
    "质量":       "高, 创作者社区最大",
    "控制":       "Motion Brush (区域运动控制)",
    "图生视频":   "最佳 (Image-to-Video)",
    "编辑":       "视频修补/延长/风格迁移",
    "社区":       "最活跃的创作者生态",
}

# Runway API
import runway
client = runway.Client(api_key=RUNWAY_API_KEY)

task = client.image_to_video.create(
    model="gen3a_turbo",
    prompt_image="product_photo.jpg",
    prompt_text="Camera slowly orbits around the product",
    duration=10,
    ratio="16:9",
)

# ═══ 国产方案对比 ═══
cn_comparison = {
    "Kling (快手)":   "综合最强, API 成熟, 中文最佳",
    "CogVideoX (智谱)": "开源, 可自部署, 质量中上",
    "Vidu (生数科技)":  "高质量, 但 API 有限",
    "PixVerse":        "性价比高, 创作者友好",
    "即梦 (字节)":      "集成抖音生态, 免费额度多",
}

# ═══ 选型建议 ═══
# 海外客户/出海: Sora / Runway
# 国内落地:     Kling / 即梦
# 预算有限:     CogVideoX (开源自部署)
# 创意探索:     Runway (社区+控制力)`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎯 可控视频生成</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> controllable_gen</div>
              <pre className="fs-code">{`# 可控视频生成: 从随机到精确控制

# ═══ Prompt 工程 (视频) ═══
video_prompt_structure = {
    "主体描述":   "什么在画面中 (人/物/场景)",
    "动作描述":   "发生什么动作/变化",
    "镜头运动":   "推/拉/摇/移/升/降/跟/环绕",
    "光照氛围":   "golden hour/neon/dim/dramatic",
    "风格标签":   "cinematic/anime/documentary/vlog",
    "技术参数":   "4K/slow motion/timelapse/60fps",
}

# 优质 Prompt 示例
good_prompt = """
Subject: A young woman in a flowing red dress
Action: walks through a field of lavender
Camera: Slow dolly tracking shot from her right side
Lighting: Golden hour, warm sunlight from behind
Style: Cinematic, shallow depth of field, film grain
Quality: 4K, 24fps, anamorphic lens flare
"""

# ═══ 镜头控制 ═══
camera_controls = {
    "推 (Dolly In)":     "靠近主体 → 强调/紧迫感",
    "拉 (Dolly Out)":    "远离主体 → 揭示全景",
    "摇 (Pan)":          "水平旋转 → 展示环境",
    "移 (Tracking)":     "跟随主体移动 → 动感",
    "升 (Crane Up)":     "由低到高 → 壮观/史诗感",
    "降 (Crane Down)":   "由高到低 → 接近/亲密感",
    "环绕 (Orbit)":      "绕主体旋转 → 3D 展示",
    "FPV":               "第一人称飞行 → 沉浸感",
}

# ═══ 图生视频 (I2V) ═══
# 最可控的方式: 先生成关键帧图片 → 动画化
i2v_workflow = {
    "Step 1": "Midjourney/SD 生成关键帧",
    "Step 2": "Runway/Kling Image-to-Video",
    "Step 3": "添加镜头运动指令",
    "Step 4": "多段视频拼接",
}

# ═══ ControlNet for Video ═══
# 更精确的控制:
control_methods = {
    "Depth Map":      "深度图控制3D空间",
    "Pose/Skeleton":  "骨骼控制人物动作",
    "Edge/Canny":     "边缘控制物体形状",
    "Motion Vector":  "光流控制运动方向",
    "Reference Image": "风格参考图保持一致性",
}

# ═══ 角色一致性 (最难问题) ═══
# 视频中同一角色在不同镜头保持一致
character_consistency = {
    "问题": "AI 生成的角色每帧可能微变",
    "方案1": "IP-Adapter 固定角色特征",
    "方案2": "参考图锁定 + 面部修复",
    "方案3": "Sora/Veo 原生一致性 (最好)",
    "方案4": "后期 Face Swap (保底)",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚙️ 视频生成工程化</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> video_engineering</div>
              <pre className="fs-code">{`# 从 Demo 到生产: AI 视频生成的工程挑战

# ═══ 批量生成管线 ═══
# 场景: 电商需要为 1000 个商品生成展示视频
batch_pipeline = {
    "数据准备": {
        "输入": "商品图 + 标题 + 描述",
        "处理": "LLM 生成视频 prompt",
        "模板": "按品类定制 prompt 模板",
    },
    "生成调度": {
        "队列": "Redis/RabbitMQ 任务队列",
        "并发": "根据 API 限制控制并发 (通常 5-10)",
        "重试": "生成失败自动重试 (3 次)",
        "缓存": "相似 prompt 复用结果",
    },
    "质量检测": {
        "自动": "CLIP 评分 / 美学评分 / 文本匹配度",
        "人工": "低分视频人工审核",
        "过滤": "检测 NSFW / 品牌安全",
    },
    "后处理": {
        "拼接": "多段视频 + 转场 + 音乐",
        "字幕": "自动添加商品信息字幕",
        "格式": "按平台导出 (竖版/横版)",
    },
}

# ═══ 成本优化 ═══
cost_optimization = {
    "分级生成": {
        "预览": "低分辨率/短时长 → 快速确认效果",
        "成品": "确认后生成高质量版本",
    },
    "模型路由": {
        "简单场景": "Kling Turbo (快速便宜)",
        "复杂场景": "Sora/Veo (高质量)",
    },
    "缓存复用": {
        "相似请求": "语义 hash → 复用近似结果",
        "模板化":   "固定模板 + 替换内容元素",
    },
}

# ═══ 成本基准 ═══
cost_benchmark = {
    "Sora":     "~$0.15/秒 (1080p)",
    "Veo 2":    "~$0.08/秒",
    "Kling":    "~$0.05/秒 (国内)",
    "Runway":   "~$0.10/秒",
    "自部署 CogVideo": "~$0.02/秒 (GPU 成本)",
    "1000 商品 × 10s": {
        "Sora":  "$1,500",
        "Kling": "$500",
        "自部署": "$200",
    },
}

# ═══ 视频存储与分发 ═══
storage_cdn = {
    "存储":     "S3/OSS, 按分辨率分级存储",
    "编码":     "H.265 (省 50% 空间) / AV1 (更省)",
    "CDN":      "CloudFront / 阿里云 CDN",
    "自适应":   "DASH/HLS 多码率流",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
