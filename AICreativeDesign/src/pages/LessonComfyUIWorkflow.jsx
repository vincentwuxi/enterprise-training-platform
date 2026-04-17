import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['节点基础', '核心工作流', '自定义节点', '批量生产'];

export default function LessonComfyUIWorkflow() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🔗 module_03 — ComfyUI 工作流</div>
      <div className="fs-hero">
        <h1>ComfyUI 工作流：节点编程 / 自定义管线 / 批量生产 — 专业级生产力</h1>
        <p>
          <strong>ComfyUI</strong> 是 AI 图像生成的"专业版"：节点式可视化编程，
          完全透明可控的生成流程，支持 SD/FLUX/全模型生态。
          适合需要精确控制、可复现、批量生产的专业场景。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔗 ComfyUI</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📦 节点基础</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> node_basics</div>
              <pre className="fs-code">{`# ComfyUI 节点系统: 可视化 AI 管线

# ═══ 为什么选 ComfyUI? ═══
# WebUI (A1111): 简单易用, 但自由度有限
# ComfyUI: 节点连线, 完全可控, 更高效
comfyui_advantages = {
    "可视化流程":   "所有步骤可见, 便于理解和调试",
    "精确控制":     "每个环节都可单独配置",
    "工作流复用":   "保存/分享/一键复现",
    "显存优化":     "比 WebUI 少用 30-50% 显存",
    "速度":         "智能缓存, 只重算变化部分",
    "扩展性":       "自定义节点生态丰富",
}

# ═══ 核心节点类型 ═══
core_nodes = {
    "模型加载": {
        "Load Checkpoint": "加载 SD/SDXL/FLUX 模型",
        "Load LoRA":       "叠加 LoRA 微调模型",
        "Load VAE":        "加载 VAE 模型",
        "Load ControlNet": "加载 ControlNet 模型",
    },
    "文本编码": {
        "CLIP Text Encode": "Prompt → 文本嵌入",
        "作用": "正面/负面提示词各一个",
    },
    "采样器": {
        "KSampler":          "标准采样器",
        "KSampler Advanced": "高级采样 (更多参数)",
        "参数": {
            "seed":   "随机种子 (复现结果)",
            "steps":  "采样步数 (20-30 常用)",
            "cfg":    "提示词引导强度 (7-12)",
            "sampler":"采样算法 (euler/dpm++)",
            "scheduler":"调度器 (karras/normal)",
        },
    },
    "潜空间": {
        "Empty Latent Image": "创建空白潜空间",
        "VAE Decode":         "潜空间→图像",
        "VAE Encode":         "图像→潜空间",
    },
    "输出": {
        "Save Image":    "保存到文件",
        "Preview Image": "预览 (不保存)",
    },
}

# ═══ 最简工作流 (文生图) ═══
# Load Checkpoint → MODEL, CLIP, VAE
#                      ↓
# CLIP Text Encode (正面) → CONDITIONING
# CLIP Text Encode (负面) → CONDITIONING
#                      ↓
# Empty Latent Image → LATENT
#                      ↓
# KSampler(model, pos, neg, latent) → LATENT
#                      ↓
# VAE Decode(latent, vae) → IMAGE
#                      ↓
# Save Image

# ═══ 安装 ═══
# git clone https://github.com/comfyanonymous/ComfyUI
# cd ComfyUI
# pip install -r requirements.txt
# python main.py
# → 打开 http://127.0.0.1:8188`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ 核心工作流</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> core_workflows</div>
              <pre className="fs-code">{`# ComfyUI 核心工作流模板

# ═══ 工作流 1: 图生图 (img2img) ═══
# 加载参考图 → VAE编码 → 加噪 → 去噪 → 输出
img2img_workflow = {
    "节点": [
        "Load Image → 加载参考图",
        "VAE Encode → 编码到潜空间",
        "KSampler → denoise=0.5-0.8 (0=不变, 1=完全重绘)",
        "VAE Decode → 解码输出",
    ],
    "关键": "denoise 值控制变化程度",
}

# ═══ 工作流 2: 高清放大 (Upscale) ═══
upscale_workflow = {
    "方案A - 潜空间放大": {
        "步骤": "KSampler → Latent Upscale (2x) → KSampler (0.3-0.5)",
        "优势": "保持一致性",
        "缺点": "细节有限",
    },
    "方案B - 模型放大": {
        "步骤": "生成 → Upscale Model (RealESRGAN) → 细节重绘",
        "优势": "4x 放大, 细节丰富",
        "推荐": "RealESRGAN_x4plus / 4x-UltraSharp",
    },
    "方案C - Tile放大": {
        "步骤": "分块放大+重绘 → 拼接",
        "优势": "超高分辨率 (8K+)",
        "节点": "Ultimate SD Upscale",
    },
}

# ═══ 工作流 3: Inpainting (局部重绘) ═══
inpaint_workflow = {
    "步骤": [
        "Load Image → 加载原图",
        "Load Mask → 加载蒙版 (标记要改的区域)",
        "Set Latent Noise Mask → 应用蒙版",
        "KSampler → 只重绘蒙版区域",
        "VAE Decode → 输出",
    ],
    "用途": "换脸/背景/修正手部/添加物体",
}

# ═══ 工作流 4: FLUX 生成 ═══
flux_workflow = {
    "与SD区别": [
        "使用 DualCLIPLoader (CLIP-L + T5)",
        "使用 FluxGuidance 节点 (替代cfg)",
        "采样器: euler + simple scheduler",
        "步骤数: 20-30 (flux.1-dev)",
    ],
    "加载": "Load Diffusion Model + DualCLIPLoader + Load VAE",
}

# ═══ 工作流 5: LoRA 叠加 ═══
lora_stack = """
Load Checkpoint → MODEL, CLIP
       ↓
Load LoRA (风格LoRA, 强度0.8) → MODEL, CLIP
       ↓
Load LoRA (人物LoRA, 强度0.6) → MODEL, CLIP
       ↓
正常生成流程...

# 多个 LoRA 可串联叠加!
# 注意: 总强度不宜超过 1.5, 否则过拟合
"""`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧩 自定义节点</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> custom_nodes</div>
              <pre className="fs-code">{`# ComfyUI 自定义节点生态

# ═══ 必装节点包 ═══
essential_nodes = {
    "ComfyUI-Manager": {
        "功能": "节点包管理器 (一键安装/更新)",
        "地位": "必装! 管理所有其他节点",
    },
    "ComfyUI-Impact-Pack": {
        "功能": "检测器/分割/面部修复/批处理",
        "核心": "FaceDetailer (面部细节增强)",
    },
    "ComfyUI_IPAdapter_plus": {
        "功能": "IP-Adapter (图像提示适配器)",
        "用途": "用参考图控制生成风格/内容",
    },
    "ComfyUI-AnimateDiff-Evolved": {
        "功能": "图片→动画/视频",
    },
    "ComfyUI_InstantID": {
        "功能": "面部ID保持 (换脸)",
    },
    "ComfyUI-KJNodes": {
        "功能": "实用工具集 (批处理/条件/数学)",
    },
    "rgthree-comfy": {
        "功能": "UI增强 (节点整理/标签)",
    },
}

# ═══ 安装自定义节点 ═══
# 方法1: ComfyUI-Manager (推荐)
# 在 ComfyUI 界面 → Manager → Install Custom Nodes

# 方法2: 手动安装
# cd ComfyUI/custom_nodes
# git clone https://github.com/xxx/ComfyUI-xxx
# pip install -r requirements.txt

# ═══ 开发自定义节点 ═══
# ComfyUI/custom_nodes/my_nodes/__init__.py

class MyTextOverlay:
    """在图片上添加文字水印"""
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
                "text": ("STRING", {"default": "Watermark"}),
                "font_size": ("INT", {
                    "default": 24, "min": 8, "max": 200
                }),
                "position": (["top-left","top-right",
                             "bottom-left","bottom-right"],),
                "opacity": ("FLOAT", {
                    "default": 0.5, "min": 0.0, "max": 1.0
                }),
            }
        }
    
    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "add_text"
    CATEGORY = "image/text"
    
    def add_text(self, image, text, font_size, position, opacity):
        # PIL 操作添加文字
        from PIL import Image, ImageDraw, ImageFont
        import torch
        import numpy as np
        
        img = image[0].cpu().numpy()
        img = (img * 255).astype(np.uint8)
        pil_img = Image.fromarray(img)
        draw = ImageDraw.Draw(pil_img)
        draw.text((10, 10), text, fill=(255,255,255))
        
        result = np.array(pil_img).astype(np.float32) / 255
        return (torch.tensor(result).unsqueeze(0),)

# 注册节点
NODE_CLASS_MAPPINGS = {"MyTextOverlay": MyTextOverlay}
NODE_DISPLAY_NAME_MAPPINGS = {"MyTextOverlay": "文字水印"}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏭 批量生产</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> batch_production</div>
              <pre className="fs-code">{`# ComfyUI 批量生产: 工业级图像管线

# ═══ API 批量调用 ═══
import json
import requests
import random

COMFYUI_URL = "http://127.0.0.1:8188"

def queue_prompt(workflow, prompt_text, seed=None):
    """提交工作流到 ComfyUI 队列"""
    # 修改 Prompt
    workflow["6"]["inputs"]["text"] = prompt_text
    
    # 设置种子
    if seed is None:
        seed = random.randint(0, 2**32)
    workflow["3"]["inputs"]["seed"] = seed
    
    # 提交
    response = requests.post(
        f"{COMFYUI_URL}/prompt",
        json={"prompt": workflow}
    )
    return response.json()

# 批量生成
prompts = [
    "a modern living room, minimalist, natural light",
    "a cozy coffee shop interior, warm lighting",
    "a luxury hotel lobby, marble, golden accents",
    "a Japanese zen garden, misty morning, peaceful",
]

# 加载工作流模板
with open("workflow_api.json") as f:
    workflow = json.load(f)

for i, prompt in enumerate(prompts):
    result = queue_prompt(workflow, prompt)
    print(f"Queued {i+1}/{len(prompts)}: {prompt[:50]}...")

# ═══ 参数扫描 (Grid Search) ═══
# 系统化测试参数组合
param_sweep = {
    "cfg_scale": [5, 7, 9, 11],
    "sampler":   ["euler", "dpm++_2m", "dpm++_sde"],
    "steps":     [15, 20, 30],
    "denoise":   [0.3, 0.5, 0.7, 0.9],
}
# → 4 × 3 × 3 × 4 = 144 种组合
# 自动生成对比图 → 找到最佳参数

# ═══ 电商批量换背景 ═══
ecommerce_pipeline = {
    "输入": "100张白底商品图",
    "工作流": [
        "Load Image (商品白底)",
        "Segment Anything (自动抠图)",
        "Load Background (场景背景)",
        "Composite (合成)",
        "Inpaint Edge (边缘融合)",
        "Upscale (放大到2K)",
        "Save Image (批量保存)",
    ],
    "产出": "100张场景商品图, 约 30-60 分钟",
    "成本": "本地 GPU, 接近零成本",
}

# ═══ 云端部署 (RunPod/Vast.ai) ═══
cloud_deploy = {
    "RunPod": {
        "GPU": "A100 40GB: $1.1/h",
        "方式": "Docker + ComfyUI API",
        "速度": "~5s/张 (SDXL)",
    },
    "Vast.ai": {
        "GPU": "RTX 4090: $0.4/h", 
        "性价比": "最高",
    },
    "API 服务化": {
        "框架": "FastAPI + ComfyUI Backend",
        "部署": "Docker + Kubernetes",
        "并发": "多 GPU 负载均衡",
    },
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
