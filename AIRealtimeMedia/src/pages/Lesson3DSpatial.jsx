import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['3DGS/NeRF', '3D 生成', '空间计算', 'XR 集成'];

export default function Lesson3DSpatial() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge indigo">🌐 module_07 — AI 3D & 空间</div>
      <div className="fs-hero">
        <h1>AI 3D 与空间计算：3DGS / NeRF / 3D 生成 / 空间智能 — 三维世界的 AI</h1>
        <p>
          3D 内容和空间计算是下一个十年的交互范式。<strong>3D 高斯溅射 (3DGS)</strong>
          以极快的渲染速度实现了照片级 3D 重建，<strong>AI 3D 生成</strong>
          (文字/图片到 3D 模型) 正在革新设计和游戏行业，
          Apple Vision Pro 开启了<strong>空间计算</strong>时代。
          本模块覆盖核心技术原理和工程实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 3D & 空间</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>💎 3D 高斯溅射 / NeRF</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> 3dgs_nerf</div>
              <pre className="fs-code">{`# 3D 重建: 从照片/视频到 3D 场景

# ═══ NeRF (Neural Radiance Fields) ═══
# 2020 年开山之作: 多视角照片 → 隐式 3D 表示
nerf_overview = {
    "原理": "MLP 网络学习 (x,y,z,θ,φ) → (颜色,密度)",
    "输入": "多角度照片 + 相机位姿",
    "输出": "任意新视角的渲染图",
    "优点": "照片级真实感, 复杂场景",
    "缺点": "训练慢 (小时), 渲染慢 (<1fps)",
}

# ═══ 3D Gaussian Splatting (3DGS) ═══
# 2023 年颠覆 NeRF: 实时渲染!
gaussians_overview = {
    "原理": "用 100 万个 3D 高斯球表示场景",
    "每个高斯": "位置 + 协方差 + 颜色 + 不透明度",
    "渲染": "GPU 光栅化 (非体渲染) → 实时!",
    "训练": "~10-30 分钟 (vs NeRF 数小时)",
    "渲染速度": "100+ fps @ 1080p (NeRF: <1fps)",
    "质量": "接近或超过 NeRF",
}

# ═══ 3DGS 实战 ═══
# 工具: gsplat / nerfstudio / polycam

# 1. 数据采集: 围绕物体拍摄 30-100 张照片
# 2. 相机标定: COLMAP 计算相机位姿
# colmap automatic_reconstructor \\
#   --workspace_path workspace \\
#   --image_path images

# 3. 训练 3DGS
# python train.py \\
#   -s workspace \\
#   --iterations 30000 \\
#   --sh_degree 3

# 4. 实时查看
# 用 3DGS viewer 交互式浏览
# 或导出为 web 格式 (three.js)

# ═══ 应用场景 ═══
applications_3dgs = {
    "电商 3D 展示":   "商品多角度 3D 浏览",
    "房地产":         "房屋 3D 虚拟看房",
    "文化遗产":       "古迹/博物馆 3D 数字化",
    "自动驾驶仿真":   "真实道路 3D 重建 → 仿真",
    "影视特效":       "实景 3D 扫描 → 特效合成",
    "游戏资产":       "实物扫描 → 游戏道具",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎨 AI 3D 生成</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> 3d_generation</div>
              <pre className="fs-code">{`# AI 3D 生成: 文字/图片 → 3D 模型

# ═══ 技术路线 ═══
generation_approaches = {
    "文生 3D (Text-to-3D)": {
        "DreamFusion":   "SDS 损失 + NeRF (开山)",
        "Magic3D":       "两阶段: 粗糙→精细",
        "Point-E":       "OpenAI, 点云→网格",
        "Shap-E":        "OpenAI, 直接生成 3D",
        "Meshy":         "商业 API, 质量最高",
    },
    "图生 3D (Image-to-3D)": {
        "One-2-3-45":    "单图→多视角→3D",
        "TripoSR":       "StabilityAI, 快速单图3D",
        "InstantMesh":   "腾讯, 工业级质量",
        "Trellis (微软)": "最新, 多表示输出",
    },
    "视频生 3D": {
        "DUSt3R":        "多视角视频→3D (Meta)",
        "3DGS from Video": "视频帧→高斯溅射",
    },
}

# ═══ Meshy API 实战 ═══
import requests

# 文生 3D
response = requests.post(
    "https://api.meshy.ai/v2/text-to-3d",
    headers={"Authorization": f"Bearer {MESHY_KEY}"},
    json={
        "mode": "refine",
        "prompt": "medieval sword with blue gems, game asset",
        "art_style": "realistic",
        "topology": "quad",  # 四边面拓扑 (适合游戏)
    }
)

# 图生 3D (更精确)
response = requests.post(
    "https://api.meshy.ai/v2/image-to-3d",
    json={
        "image_url": "https://example.com/chair.png",
        "enable_pbr": True,  # PBR 材质
    }
)
# 输出: GLB/FBX/OBJ 格式 3D 模型

# ═══ 开源方案 ═══
# TripoSR (最快, 1 秒生成)
from tsr.system import TSR
model = TSR.from_pretrained("stabilityai/TripoSR")
mesh = model.run_image("chair.png")
mesh.export("chair.glb")

# ═══ 质量对比 ═══
# Meshy (商业) > InstantMesh > TripoSR > Point-E
# 但质量仍远不及手工建模 → 适合原型/概念`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🥽 空间计算</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> spatial_computing</div>
              <pre className="fs-code">{`# 空间计算: AI + AR/VR 的融合

# ═══ 什么是空间计算? ═══
# 将数字信息锚定在物理空间中
# 核心设备: Apple Vision Pro / Meta Quest / HoloLens
# AI 角色: 场景理解 + 3D 生成 + 空间交互

# ═══ AI 在空间计算中的角色 ═══
ai_in_spatial = {
    "场景理解": {
        "SLAM":        "实时定位与地图构建",
        "3D 检测":     "识别房间中的物体和平面",
        "深度估计":    "单目/双目深度图 (DPT/MiDaS)",
        "语义分割":    "理解空间中每个区域的类别",
    },
    "空间 AI 助手": {
        "概念": "在 AR/VR 中与 AI 对话, AI 看到你看到的",
        "例子": "指着一道菜 → AI 告诉你食材和做法",
        "技术": "GPT-4o 视觉 + AR 锚点 + 语音交互",
    },
    "空间内容生成": {
        "概念": "AI 生成 3D 物体并放置在空间中",
        "例子": "'在桌上放一个花瓶' → AI 生成+放置",
        "技术": "3D 生成 + 空间锚定 + 物理模拟",
    },
}

# ═══ 深度估计 (核心技术) ═══
# Depth Anything V2 — 当前最强开源
from depth_anything_v2.dpt import DepthAnythingV2

model = DepthAnythingV2(encoder='vitl')
model.load_state_dict(torch.load('checkpoints/depth_anything_v2_vitl.pth'))

depth = model.infer_image(cv2.imread('scene.jpg'))
# 输出: HxW 深度图 (远近关系)

# ═══ 单目 3D 重建 ═══
# DUSt3R (Meta) — 少量图片 → 3D
from dust3r.inference import inference
from dust3r.model import AsymmetricCroCo3DStereo

model = AsymmetricCroCo3DStereo.from_pretrained(
    "naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt"
)
# 2-10 张照片 → 稠密 3D 点云

# ═══ 空间计算应用 ═══
spatial_apps = {
    "室内设计":   "AR 中虚拟家具摆放 (IKEA Place)",
    "工业维修":   "AR 叠加维修指引在设备上",
    "教育":       "AR 解剖模型/化学分子",
    "导航":       "AR 导航箭头叠加在现实街道",
    "远程协作":   "共享 3D 空间中协同工作",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📱 XR 集成</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> xr_integration</div>
              <pre className="fs-code">{`# XR + AI: 开发实战

# ═══ 开发平台 ═══
xr_platforms = {
    "Apple Vision Pro": {
        "框架":    "visionOS + ARKit + RealityKit",
        "语言":    "Swift / SwiftUI",
        "AI 集成": "Core ML + 云端 LLM API",
        "特色":    "手眼追踪/空间音频/高分辨率",
    },
    "Meta Quest 3": {
        "框架":    "Unity / Unreal + Meta SDK",
        "语言":    "C# / C++",
        "AI 集成": "ONNX Runtime + 云端 API",
        "特色":    "彩色透视/手势识别/大众市场",
    },
    "Web XR": {
        "框架":    "WebXR + Three.js + A-Frame",
        "语言":    "JavaScript / TypeScript",
        "AI 集成": "TensorFlow.js + 云端 API",
        "特色":    "跨平台/浏览器内/易分发",
    },
}

# ═══ Web XR + AI 快速原型 ═══
webxr_example = '''
<!-- Three.js + WebXR AR -->
<script type="module">
import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.xr.enabled = true;
document.body.appendChild(ARButton.createButton(renderer, {
  requiredFeatures: ['hit-test', 'dom-overlay'],
}));

// AI 3D 物体加载
async function loadAIGenerated3D(prompt) {
  // 调用 Meshy API 生成 3D 模型
  const model = await generate3D(prompt);
  const gltf = await loadGLTF(model.url);
  scene.add(gltf.scene);
}

// AR 点击放置
renderer.xr.addEventListener('select', (event) => {
  // 射线检测 → 放置 AI 生成的 3D 物体
  placeObjectAtHit(event);
});
</script>
'''

# ═══ AI + XR 产品方向 ═══
product_directions = {
    "AI 空间助手":    "Vision Pro 中的 AI 管家",
    "AI 虚拟试穿":    "AR 试衣/试妆/试眼镜",
    "AI 3D 设计":     "空间中直接 AI 建模",
    "AI 培训模拟":    "VR 中的 AI NPC 培训场景",
    "AI 远程指导":    "AR 中 AI 高亮操作步骤",
}

# ═══ 未来趋势 ═══
# 2025-2027: AI + XR 的融合加速
# - AI 实时理解空间 (3DGS + 场景图)
# - AI 实时生成空间内容 (3D 生成 + 放置)
# - AI 空间对话 (多模态 LLM + 空间锚定)
# - 轻量 AR 眼镜 (Meta Orion) 催化日常使用`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
