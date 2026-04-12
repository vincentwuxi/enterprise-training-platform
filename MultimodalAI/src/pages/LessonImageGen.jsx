import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 05 — 图像生成
   DALL-E 3 / Stable Diffusion / ControlNet
   ───────────────────────────────────────────── */

const GEN_TOPICS = [
  { name: 'DALL-E 3', icon: '🎨', tag: 'DALL-E',
    code: `# ─── DALL-E 3: 最强 Prompt 理解 ───
from openai import OpenAI
import base64

client = OpenAI()

class DALLEGenerator:
    """DALL-E 3 图像生成 (API 最佳实践)"""
    
    def generate(self, prompt, size="1024x1024", quality="hd", style="vivid"):
        """
        size:    1024x1024 | 1024x1792 | 1792x1024
        quality: standard ($0.04) | hd ($0.08) — 细节更丰富
        style:   vivid (鲜艳) | natural (自然)
        """
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,
            quality=quality,
            style=style,
            n=1,  # DALL-E 3 每次只能生 1 张
        )
        
        # 注意: DALL-E 3 会自动改写你的 Prompt!
        revised_prompt = response.data[0].revised_prompt
        print(f"📝 改写后的 Prompt: {revised_prompt}")
        
        return response.data[0].url
    
    def generate_b64(self, prompt, **kwargs):
        """返回 base64 (不需要下载 URL)"""
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            response_format="b64_json",
            **kwargs,
        )
        return base64.b64decode(response.data[0].b64_json)
    
    def edit(self, image_path, mask_path, prompt):
        """图像编辑 (Inpainting) — 仅 DALL-E 2"""
        response = client.images.edit(
            image=open(image_path, "rb"),
            mask=open(mask_path, "rb"),  # 透明区域将被重绘
            prompt=prompt,
            model="dall-e-2",  # 编辑只支持 DALL-E 2
            n=1,
            size="1024x1024",
        )
        return response.data[0].url
    
    def variations(self, image_path, n=4):
        """生成变体 — 仅 DALL-E 2"""
        response = client.images.create_variation(
            image=open(image_path, "rb"),
            n=n,
            size="1024x1024",
        )
        return [d.url for d in response.data]

# ─── Prompt 工程: 获得专业级图片 ───
PROMPT_TEMPLATE = """
{subject},
{style},
{lighting},
{composition},
{details},
{quality_tags}
"""

examples = {
    "产品图": PROMPT_TEMPLATE.format(
        subject="一款极简设计的蓝色无线耳机",
        style="产品摄影，白色背景",
        lighting="柔和的工作室灯光，侧面补光",
        composition="45度角俯拍，留白充足",
        details="细腻的材质纹理，微妙的光泽",
        quality_tags="8K, 超高清, 商业级产品摄影"
    ),
    "UI 设计": PROMPT_TEMPLATE.format(
        subject="一个深色主题的音乐播放器App界面",
        style="iOS风格，毛玻璃效果",
        lighting="暗色背景，霓虹渐变高亮",
        composition="全屏展示，无手机边框",
        details="现在播放页面，带波形可视化",
        quality_tags="UI设计, Figma风格, 4K"
    ),
}` },
  { name: 'Stable Diffusion', icon: '🖌️', tag: 'SD',
    code: `# ─── Stable Diffusion: 开源图像生成 ───
# SDXL / SD3 / Flux — 本地运行，完全可控

# ═══ 方案1: Diffusers (Hugging Face) ═══
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
import torch

class SDXLGenerator:
    """SDXL 本地生成"""
    
    def __init__(self, model="stabilityai/stable-diffusion-xl-base-1.0"):
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            model,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True,
        ).to("cuda")
        
        # 使用更快的调度器
        self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
            self.pipe.scheduler.config
        )
        
        # 优化: 减少显存
        self.pipe.enable_model_cpu_offload()
        # self.pipe.enable_xformers_memory_efficient_attention()
    
    def generate(self, prompt, negative_prompt=None, **kwargs):
        """
        核心参数:
        - guidance_scale: 7-12 (越高越遵循prompt，太高会过饱和)
        - num_inference_steps: 20-50 (越多质量越高)
        - seed: 固定随机种子 → 可复现
        """
        defaults = {
            "prompt": prompt,
            "negative_prompt": negative_prompt or "低质量, 模糊, 变形, 水印",
            "width": 1024,
            "height": 1024,
            "guidance_scale": 7.5,
            "num_inference_steps": 30,
            "generator": torch.Generator("cuda").manual_seed(42),
        }
        defaults.update(kwargs)
        
        image = self.pipe(**defaults).images[0]
        return image

# ═══ 方案2: Flux.1 (Black Forest Labs) ═══
from diffusers import FluxPipeline

class FluxGenerator:
    """Flux.1 — SD 团队新作，目前最强开源"""
    
    def __init__(self):
        self.pipe = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-dev",
            torch_dtype=torch.bfloat16,
        ).to("cuda")
    
    def generate(self, prompt, steps=28, guidance=3.5):
        image = self.pipe(
            prompt,
            num_inference_steps=steps,
            guidance_scale=guidance,
            width=1024,
            height=1024,
        ).images[0]
        return image

# ═══ 方案3: 通过 API (Replicate / Together) ═══
import replicate

def generate_via_api(prompt, model="black-forest-labs/flux-1.1-pro"):
    """云端生成 (无需 GPU!)"""
    output = replicate.run(model, input={
        "prompt": prompt,
        "aspect_ratio": "1:1",
        "output_format": "webp",
        "output_quality": 90,
    })
    return output[0]  # URL

# ─── 开源模型对比 ───
# | 模型     | 参数   | VRAM  | 质量    | 速度    | 文字渲染 |
# |----------|--------|-------|---------|---------|----------|
# | SDXL     | 6.6B   | 6GB   | ⭐⭐⭐⭐  | ~5s     | ❌       |
# | SD3      | 8B     | 16GB  | ⭐⭐⭐⭐  | ~8s     | ✅       |
# | Flux.1   | 12B    | 24GB  | ⭐⭐⭐⭐⭐ | ~15s    | ✅       |
# | Midj v6  | 闭源   | API   | ⭐⭐⭐⭐⭐ | ~30s    | ✅       |` },
  { name: 'ControlNet', icon: '🎯', tag: 'ControlNet',
    code: `# ─── ControlNet: 精确控制生成 ───
# 给 AI 画一个草图/骨架/边缘 → 生成高质量图片

from diffusers import (
    StableDiffusionXLControlNetPipeline,
    ControlNetModel,
    AutoencoderKL,
)
import cv2
import numpy as np
from PIL import Image

# ═══ 1. 边缘控制 (Canny) ═══
def generate_with_canny(image_path, prompt):
    """用边缘图控制构图"""
    # 提取 Canny 边缘
    image = cv2.imread(image_path)
    edges = cv2.Canny(image, 100, 200)
    control_image = Image.fromarray(edges)
    
    # 加载 SDXL + ControlNet
    controlnet = ControlNetModel.from_pretrained(
        "diffusers/controlnet-canny-sdxl-1.0",
        torch_dtype=torch.float16,
    )
    pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-base-1.0",
        controlnet=controlnet,
        torch_dtype=torch.float16,
    ).to("cuda")
    
    result = pipe(
        prompt=prompt,
        image=control_image,
        controlnet_conditioning_scale=0.5,  # 控制强度
        num_inference_steps=30,
    ).images[0]
    
    return result

# ═══ 2. 姿态控制 (OpenPose) ═══
from controlnet_aux import OpenposeDetector

def generate_with_pose(image_path, prompt):
    """用人体骨架控制人物姿态"""
    openpose = OpenposeDetector.from_pretrained("lllyasviel/ControlNet")
    pose_image = openpose(Image.open(image_path))
    
    controlnet = ControlNetModel.from_pretrained(
        "thibaud/controlnet-openpose-sdxl-1.0",
        torch_dtype=torch.float16,
    )
    # ... 同上加载 pipe
    result = pipe(prompt=prompt, image=pose_image).images[0]
    return result

# ═══ 3. 深度控制 (Depth) ═══
from controlnet_aux import MidasDetector

def generate_with_depth(image_path, prompt):
    """用深度图控制空间结构"""
    midas = MidasDetector.from_pretrained("lllyasviel/Annotators")
    depth_image = midas(Image.open(image_path))
    # ... 加载 depth ControlNet

# ═══ 4. IP-Adapter: 风格/内容参考 ═══
from diffusers import StableDiffusionXLPipeline
from transformers import CLIPVisionModelWithProjection

def generate_with_style_ref(ref_image_path, prompt):
    """用参考图片的风格生成新图"""
    # 加载 IP-Adapter
    pipe = StableDiffusionXLPipeline.from_pretrained(...)
    pipe.load_ip_adapter(
        "h94/IP-Adapter",
        subfolder="sdxl_models",
        weight_name="ip-adapter-plus_sdxl_vit-h.safetensors",
    )
    pipe.set_ip_adapter_scale(0.6)  # 风格参考强度
    
    ref_image = Image.open(ref_image_path)
    result = pipe(
        prompt=prompt,
        ip_adapter_image=ref_image,  # 风格参考
        num_inference_steps=30,
    ).images[0]
    return result

# ─── ControlNet 选型 ───
# | 控制类型 | 输入           | 适用场景            |
# |---------|----------------|---------------------|
# | Canny   | 边缘线稿       | 建筑/产品/Logo      |
# | Depth   | 深度图         | 室内设计/场景        |
# | Pose    | 人体骨架       | 人物姿态/动作        |
# | Normal  | 法线图         | 3D 物体/材质        |
# | Seg     | 语义分割图      | 场景布局/室内        |
# | Tile    | 低分辨率原图    | 超分辨率            |` },
  { name: 'ComfyUI 工作流', icon: '⚙️', tag: 'ComfyUI',
    code: `# ─── ComfyUI: 可视化工作流引擎 ───
# 比 WebUI 更灵活，节点式编排，适合生产

# ═══ 通过 API 调用 ComfyUI ═══
import json
import urllib.request
import websocket  # pip install websocket-client

COMFY_URL = "http://localhost:8188"

class ComfyUIClient:
    """ComfyUI API 客户端"""
    
    def __init__(self, server_url=COMFY_URL):
        self.url = server_url
        self.client_id = str(uuid.uuid4())
    
    def queue_prompt(self, workflow: dict) -> str:
        """提交工作流到队列"""
        data = json.dumps({
            "prompt": workflow,
            "client_id": self.client_id,
        }).encode()
        
        req = urllib.request.Request(
            f"{self.url}/prompt",
            data=data,
            headers={"Content-Type": "application/json"},
        )
        resp = json.loads(urllib.request.urlopen(req).read())
        return resp["prompt_id"]
    
    def wait_for_result(self, prompt_id):
        """等待生成完成并获取结果"""
        ws = websocket.WebSocket()
        ws.connect(f"ws://{self.url.split('//')[1]}/ws?clientId={self.client_id}")
        
        while True:
            msg = ws.recv()
            if isinstance(msg, str):
                data = json.loads(msg)
                if data["type"] == "executed" and data["data"]["prompt_id"] == prompt_id:
                    ws.close()
                    return self.get_images(prompt_id)
    
    def get_images(self, prompt_id):
        """获取生成的图片"""
        resp = urllib.request.urlopen(f"{self.url}/history/{prompt_id}")
        history = json.loads(resp.read())[prompt_id]
        
        images = []
        for node_id, output in history["outputs"].items():
            if "images" in output:
                for img in output["images"]:
                    url = f"{self.url}/view?filename={img['filename']}"
                    images.append(url)
        return images

# ─── 预定义工作流模板 ───
WORKFLOWS = {
    "txt2img_hd": {
        "3": {"class_type": "KSampler", "inputs": {
            "seed": 42, "steps": 30, "cfg": 7.5,
            "sampler_name": "dpmpp_2m_sde",
            "scheduler": "karras",
            "model": ["4", 0], "positive": ["6", 0],
            "negative": ["7", 0], "latent_image": ["5", 0],
        }},
        "4": {"class_type": "CheckpointLoaderSimple", "inputs": {
            "ckpt_name": "sdxl_base.safetensors"
        }},
        "5": {"class_type": "EmptyLatentImage", "inputs": {
            "width": 1024, "height": 1024, "batch_size": 1
        }},
        "6": {"class_type": "CLIPTextEncode", "inputs": {
            "text": "{{PROMPT}}", "clip": ["4", 1]
        }},
        "7": {"class_type": "CLIPTextEncode", "inputs": {
            "text": "低质量, 模糊", "clip": ["4", 1]
        }},
        "8": {"class_type": "VAEDecode", "inputs": {
            "samples": ["3", 0], "vae": ["4", 2]
        }},
        "9": {"class_type": "SaveImage", "inputs": {
            "images": ["8", 0], "filename_prefix": "output"
        }},
    },
}

# 使用
comfy = ComfyUIClient()
workflow = WORKFLOWS["txt2img_hd"].copy()
workflow["6"]["inputs"]["text"] = "一只穿西装的柴犬，背景是东京塔"
pid = comfy.queue_prompt(workflow)
images = comfy.wait_for_result(pid)` },
];

export default function LessonImageGen() {
  const [topicIdx, setTopicIdx] = useState(0);
  const t = GEN_TOPICS[topicIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🎨 module_05 — 图像生成</div>
      <div className="fs-hero">
        <h1>图像生成：从 Prompt 到像素</h1>
        <p>
          <strong>DALL-E 3</strong> 理解最复杂的文字描述、<strong>Stable Diffusion / Flux</strong> 开源可控本地运行、
          <strong>ControlNet</strong> 用草图/骨架精确控制、<strong>ComfyUI</strong> 节点式工作流引擎——
          本模块覆盖图像生成的全部生产技术栈。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🖼️ 图像生成技术栈</h2>
        <div className="fs-pills">
          {GEN_TOPICS.map((t, i) => (
            <button key={i} className={`fs-btn ${i === topicIdx ? 'primary' : ''}`}
              onClick={() => setTopicIdx(i)}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #fb7185' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fb7185' }}>{t.icon} {t.name}</h3>
            <span className="fs-tag rose">{t.tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 image_gen_{t.tag.toLowerCase()}.py
            </div>
            <pre className="fs-code">{t.code}</pre>
          </div>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 视频 AI</button>
        <button className="fs-btn primary">文档智能 →</button>
      </div>
    </div>
  );
}
