import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['AI 动图', '短视频素材', '动态海报', 'Lottie 动效'];

export default function LessonMotionDesign() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge pink">🎬 module_07 — 动态设计</div>
      <div className="fs-hero">
        <h1>动态设计：AI 动图 / 短视频素材 / 动态海报 — 让视觉动起来</h1>
        <p>
          静态图已不够用：短视频、动态海报、互动广告需要"动"的内容。
          AI 视频生成 (<strong>Sora / 可灵 / Runway</strong>) 和
          <strong>AnimateDiff</strong> 让"图片生视频"成为现实。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎬 动态设计</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>✨ AI 动图</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ec4899'}}></span> ai_animation</div>
              <pre className="fs-code">{`# AI 动图生成: 静态变动态

# ═══ 工具与方案 ═══
animation_tools = {
    "AnimateDiff (ComfyUI)": {
        "方法":    "SD 生成 → 逐帧动画化",
        "输入":    "单张图/Prompt → 2-4秒动画",
        "质量":    "⭐⭐⭐⭐ (可控性最好)",
        "适合":    "循环动画/微动效果",
        "ComfyUI": "AnimateDiff-Evolved 节点包",
    },
    "Stable Video Diffusion (SVD)": {
        "方法":    "图生视频 (Image-to-Video)",
        "输入":    "单张图片 → 4秒视频",
        "质量":    "⭐⭐⭐⭐ (写实运动)",
        "适合":    "产品展示/风景动态化",
    },
    "可灵 (Kling)": {
        "方法":    "文/图 → 视频",
        "时长":    "5-10秒",
        "质量":    "⭐⭐⭐⭐⭐ (国产最强)",
        "特色":    "运动幅度大, 物理真实",
    },
    "Runway Gen-3": {
        "方法":    "文/图 → 视频",
        "时长":    "5-10秒",
        "质量":    "⭐⭐⭐⭐",
        "特色":    "商业友好, API 可用",
    },
    "Sora (OpenAI)": {
        "方法":    "文 → 高质量视频",
        "时长":    "最长 60秒",
        "质量":    "⭐⭐⭐⭐⭐",
        "状态":    "限量开放",
    },
}

# ═══ AnimateDiff 实战 ═══
# ComfyUI 工作流:
animatediff_workflow = {
    "基础文生视频": [
        "Load Checkpoint (SD 1.5)",
        "Load AnimateDiff Model (mm_v2)",
        "CLIP Encode (Prompt)",
        "Empty Latent (batch=16帧)",
        "KSampler → 生成 16 帧潜空间",
        "VAE Decode → 16 帧图像",
        "Combine → GIF/MP4",
    ],
    "图生动图": [
        "Load Image → VAE Encode",
        "Add Noise (denoise=0.5)",
        "AnimateDiff → 在原图基础上动画化",
        "→ 微动效果 (头发飘动/光影变化)",
    ],
}

# ═══ 循环动画技巧 ═══
# AnimateDiff 生成自然循环:
loop_tricks = {
    "Context Options": "设置 overlap 让首尾帧衔接",
    "Prompt Travel":   "不同帧使用不同提示词",
    "Camera Motion":  "添加虚拟摄像机运动(推/拉/旋)",
}

# ═══ 电商动图应用 ═══
ecommerce_motion = {
    "产品微动":  "产品缓慢旋转/光影流动",
    "氛围动效":  "背景粒子/光斑/水波",
    "文字动画":  "促销文字入场动效",
    "场景动态":  "风吹窗帘/水面倒影",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📹 短视频素材</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> short_video</div>
              <pre className="fs-code">{`# AI 短视频素材: 内容创作提效

# ═══ 短视频素材类型 ═══
video_material_types = {
    "背景素材": {
        "用途": "口播/解说视频背景",
        "生成": "AI 生成循环背景动画",
        "示例": "科技感粒子/抽象流体/自然风景",
    },
    "转场素材": {
        "用途": "视频片段之间的过渡",
        "生成": "ComfyUI 生成风格化转场",
    },
    "图文混排": {
        "用途": "知识类/图文类短视频",
        "工具": "AI 图片 + 剪映/CapCut 编辑",
    },
    "产品展示": {
        "用途": "电商带货类视频",
        "生成": "产品图 → SVD → 旋转展示",
    },
}

# ═══ AI 视频 Prompt 技巧 ═══
video_prompts = {
    "运镜控制": {
        "推镜":    "camera slowly pushing in, dolly in",
        "拉镜":    "camera pulling back, reveal shot",
        "旋转":    "camera orbiting around subject",
        "俯冲":    "aerial shot descending, crane down",
        "跟踪":    "camera tracking subject, steadicam",
    },
    "运动控制": {
        "缓慢":    "slow motion, graceful, smooth",
        "快速":    "fast motion, energetic, dynamic",
        "静止":    "still, frozen moment, time stopped",
    },
    "示例 Prompt": {
        "产品展示": "smooth 360 rotation of [product], "
                    "studio lighting, black background, "
                    "premium, slow motion",
        "风景动态": "time-lapse of sunset over ocean, "
                    "golden clouds moving, waves crashing, "
                    "cinematic 4K",
        "人物":     "portrait of person looking at camera, "
                    "slight smile, wind blowing hair, "
                    "shallow DOF, warm light",
    },
}

# ═══ AI 视频工作流 ═══
video_production = {
    "Step 1 - 分镜": "ChatGPT/Claude 生成分镜脚本",
    "Step 2 - 画面": "Midjourney 生成关键帧画面",
    "Step 3 - 动态化": "SVD/可灵 将关键帧变为视频",
    "Step 4 - 编辑": "剪映/PR 拼接+配乐+字幕",
    "Step 5 - 优化": "调色+音效+封面优化",
}

# ═══ 成本对比 ═══
cost_comparison = {
    "传统拍摄 (30s短视频)": {
        "模特+场地+摄影": "¥5,000-20,000",
        "后期编辑": "¥1,000-3,000",
        "总计": "¥6,000-23,000",
        "周期": "3-7天",
    },
    "AI 生成 (30s短视频)": {
        "AI 工具订阅": "¥200-500/月",
        "人工编辑": "¥500-1,000",
        "总计": "¥700-1,500",
        "周期": "0.5-1天",
    },
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎪 动态海报</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> dynamic_poster</div>
              <pre className="fs-code">{`# AI 动态海报: 吸睛的营销利器

# ═══ 动态海报类型 ═══
poster_types = {
    "微动海报": {
        "效果": "局部元素轻微运动",
        "示例": "头发飘动/光影流转/水波纹",
        "工具": "ComfyUI AnimateDiff (低 denoise)",
        "格式": "GIF/APNG/WebP/短视频",
    },
    "Cinemagraph": {
        "效果": "静态画面中一个元素循环动",
        "示例": "咖啡蒸汽/瀑布/钟摆",
        "方法": "AI 生成 → 蒙版只保留运动区",
    },
    "视差海报": {
        "效果": "2.5D 视差运动 (前后景分离)",
        "方法": "深度图分层 → 不同层不同运动",
        "工具": "After Effects + AI 深度图",
    },
    "数据可视化": {
        "效果": "数字跳动/图表生长",
        "方法": "代码生成 (D3.js/Lottie)",
    },
}

# ═══ Cinemagraph 制作流程 ═══
cinemagraph = {
    "方法1 - AI 全生成": [
        "1. MJ 生成静态海报",
        "2. AnimateDiff 动画化 (16帧)",
        "3. 蒙版只保留想动的区域",
        "4. 循环: 前后帧渐变融合",
        "5. 导出 GIF/WebP",
    ],
    "方法2 - 混合": [
        "1. 真实照片/AI图 作为基底",
        "2. ComfyUI 生成运动版本",
        "3. After Effects 蒙版混合",
        "4. 精确控制运动区域和速度",
    ],
}

# ═══ 视差海报制作 ═══
parallax_poster = """
# 2.5D 视差动态海报

# 核心: 深度图分层 → 不同移动速度

from PIL import Image
import numpy as np

# 1. 用 AI 估计深度图
depth_map = estimate_depth(poster_image)  # MiDaS/ZoeDepth

# 2. 根据深度分层 (前景/中景/背景)
layers = {
    "foreground": mask_by_depth(depth_map, 0.0, 0.3),
    "midground":  mask_by_depth(depth_map, 0.3, 0.7),
    "background": mask_by_depth(depth_map, 0.7, 1.0),
}

# 3. 不同层不同运动幅度
# 前景移动 5px, 中景 3px, 背景 1px
# → 产生视差3D效果

# 4. Inpaint 修补层间空隙
# ComfyUI → 自动修补
"""

# ═══ 格式与尺寸建议 ═══
format_guide = {
    "GIF":   "简单动画, 兼容性最好, 256色限制",
    "APNG":  "全彩动画PNG, 透明度支持",
    "WebP":  "最优压缩, 现代浏览器支持",
    "MP4":   "最佳质量, 视频平台首选",
    "Lottie":"矢量动画, 体积最小, 交互性强",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 Lottie 动效</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> lottie_animation</div>
              <pre className="fs-code">{`# Lottie 动效: 矢量动画的最佳载体

# ═══ Lottie 是什么? ═══
lottie_intro = {
    "定义":   "Airbnb 开发的矢量动画格式 (.json)",
    "原理":   "AE 动画 → JSON 数据 → 各平台渲染",
    "优势": {
        "体积":     "通常 < 100 KB (vs GIF 1MB+)",
        "质量":     "矢量无损, 任意缩放",
        "交互":     "可响应滚动/点击/悬浮",
        "跨平台":   "Web/iOS/Android/Flutter",
    },
}

# ═══ AI + Lottie 工作流 ═══
ai_lottie_workflow = {
    "方案1 - AI 设计 + AE 动画": {
        "1": "MJ/DALL-E 生成设计稿",
        "2": "Illustrator 矢量化 (Image Trace)",
        "3": "导入 AE 添加动画",
        "4": "Bodymovin 插件导出 Lottie JSON",
    },
    "方案2 - LottieFiles 平台": {
        "1": "LottieFiles.com 搜索模板",
        "2": "在线编辑器调整颜色/内容",
        "3": "直接下载 JSON/嵌入代码",
    },
    "方案3 - Rive (新趋势)": {
        "1": "Rive.app 在线编辑器",
        "2": "状态机驱动的交互动画",
        "3": "比 Lottie 更强的交互能力",
    },
}

# ═══ Web 集成 Lottie ═══
web_integration = """
<!-- HTML + lottie-player -->
<script src="https://unpkg.com/@lottiefiles/lottie-player">
</script>

<lottie-player 
  src="animation.json"
  background="transparent"
  speed="1"
  loop
  autoplay>
</lottie-player>

<!-- React 集成 -->
import Lottie from 'lottie-react';
import animationData from './animation.json';

function AnimatedIcon() {
  return (
    <Lottie 
      animationData={animationData}
      loop={true}
      style={{ width: 200, height: 200 }}
    />
  );
}
"""

# ═══ 常用 Lottie 场景 ═══
lottie_use_cases = {
    "加载动画":    "Loading spinners, skeleton screens",
    "成功/失败":   "Checkmark, Error, Warning",
    "引导页":      "Onboarding illustrations",
    "空状态":      "Empty state illustrations",
    "按钮反馈":    "Like/Favorite heart animation",
    "节日彩蛋":    "春节/圣诞/万圣节特效",
    "品牌动效":    "Logo reveal, brand intro",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
