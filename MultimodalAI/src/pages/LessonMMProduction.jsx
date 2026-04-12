import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 08 — 生产部署
   多模态 Pipeline / 延迟优化 / 边缘推理
   ───────────────────────────────────────────── */

const PROD_TOPICS = [
  { name: '多模态 Pipeline', icon: '🔧', tag: 'Pipeline',
    code: `# ─── 生产级多模态 Pipeline 架构 ───
from fastapi import FastAPI, UploadFile, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import asyncio
from enum import Enum

app = FastAPI()

class MediaType(str, Enum):
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    PDF = "pdf"

class ProcessingResult(BaseModel):
    task_id: str
    status: str
    media_type: MediaType
    result: Optional[dict] = None

# ─── 统一入口: 自动识别 + 路由 ───
@app.post("/api/v1/process")
async def process_media(
    file: UploadFile,
    prompt: str = "分析这个文件",
    background_tasks: BackgroundTasks = None,
):
    """统一媒体处理入口"""
    # 1. 检测媒体类型
    media_type = detect_media_type(file.filename, file.content_type)
    
    # 2. 创建任务
    task_id = create_task(media_type, prompt)
    
    # 3. 异步处理
    background_tasks.add_task(
        process_async, task_id, file, media_type, prompt
    )
    
    return {"task_id": task_id, "status": "processing"}

async def process_async(task_id, file, media_type, prompt):
    """异步处理管道"""
    handlers = {
        MediaType.IMAGE: ImageProcessor(),
        MediaType.AUDIO: AudioProcessor(),
        MediaType.VIDEO: VideoProcessor(),
        MediaType.PDF:   PDFProcessor(),
    }
    
    processor = handlers[media_type]
    
    # 预处理 (格式转换/压缩/验证)
    preprocessed = await processor.preprocess(file)
    
    # 模型推理
    result = await processor.analyze(preprocessed, prompt)
    
    # 后处理 (结构化/格式化)
    final = await processor.postprocess(result)
    
    # 更新任务状态
    await update_task(task_id, "completed", final)

# ─── 各媒体处理器 ───
class ImageProcessor:
    async def preprocess(self, file):
        # 格式验证、EXIF 剥离、尺寸限制
        img = Image.open(file.file)
        
        # 安全: 移除 EXIF (可能包含 GPS)
        img_clean = Image.new(img.mode, img.size)
        img_clean.putdata(list(img.getdata()))
        
        # 尺寸优化
        max_side = 2048
        if max(img.size) > max_side:
            img_clean.thumbnail((max_side, max_side))
        
        return img_clean
    
    async def analyze(self, image, prompt):
        # GPT-4o Vision
        return await vision_analyze(image, prompt)

class VideoProcessor:
    async def preprocess(self, file):
        # 时长检查 (<10min)、分辨率降采样
        duration = get_duration(file)
        if duration > 600:
            raise ValueError("视频超过10分钟限制")
        
        # 降到 720p 节省成本
        compressed = compress_video(file, max_height=720)
        return compressed
    
    async def analyze(self, video, prompt):
        # Gemini 原生视频 (长视频)
        # 或 GPT-4o 抽帧 (短视频)
        if get_duration(video) > 60:
            return await gemini_video_analyze(video, prompt)
        else:
            return await gpt4o_frame_analyze(video, prompt)` },
  { name: '延迟优化', icon: '⚡', tag: 'Latency',
    code: `# ─── 多模态推理延迟优化 ───

# ═══ 1. 图像预处理优化 ═══
class ImageOptimizer:
    """减少图像 Token 数 → 降低 API 延迟和成本"""
    
    @staticmethod
    def optimize_for_api(image_path: str, target="gpt-4o"):
        """根据目标模型优化图像"""
        img = Image.open(image_path)
        
        # GPT-4o: detail=low 只要 85 tokens!
        # detail=high: 自动 tiling，可达 1000+ tokens
        
        # 策略1: 对于"是什么"类问题，用 low detail
        # 策略2: 对于"读文字"类问题，用 high detail + 裁剪
        
        if img.size[0] * img.size[1] > 1024 * 1024:
            # 大图: 缩放到合理尺寸
            img.thumbnail((1024, 1024), Image.LANCZOS)
        
        # 转 WebP 减小体积
        buf = BytesIO()
        img.save(buf, format="WebP", quality=85)
        return buf.getvalue()

# ═══ 2. 语音流式优化 ═══
class StreamingOptimizer:
    """降低端到端语音延迟"""
    
    # 目标: TTFB (Time to First Byte) < 500ms
    
    @staticmethod
    def optimize_voice_pipeline():
        """优化建议"""
        return {
            "ASR 优化": {
                "级联式": "Whisper API ~2s → Deepgram 流式 ~300ms",
                "实时": "OpenAI Realtime API ~300ms",
                "本地": "Whisper.cpp + GPU ~200ms",
            },
            "LLM 优化": {
                "模型选择": "gpt-4o-mini (快) vs gpt-4o (强)",
                "流式输出": "stream=True, 句子级 TTS",
                "提前生成": "预测用户意图，提前准备回复",
            },
            "TTS 优化": {
                "预热": "首次调用慢，保持连接池",
                "分句": "按标点分句，边 LLM 边 TTS",
                "缓存": "高频回复预生成音频",
            },
            "网络优化": {
                "CDN": "静态资源 CDN 加速",
                "WebSocket": "长连接避免 HTTP 握手",
                "就近部署": "API 服务部署在用户附近区域",
            },
        }

# ═══ 3. 批量处理优化 ═══
import asyncio
from concurrent.futures import ThreadPoolExecutor

class BatchProcessor:
    """批量多模态处理"""
    
    def __init__(self, max_concurrent=10):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def process_batch(self, items: list, handler):
        """并发处理 (限流)"""
        async def process_one(item):
            async with self.semaphore:
                return await handler(item)
        
        tasks = [process_one(item) for item in items]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        success = [r for r in results if not isinstance(r, Exception)]
        errors = [r for r in results if isinstance(r, Exception)]
        
        return {"success": len(success), "errors": len(errors), "results": success}

# ═══ 4. 缓存策略 ═══
import hashlib
import redis.asyncio as redis

class MultimodalCache:
    """多模态结果缓存"""
    
    def __init__(self):
        self.redis = redis.Redis()
    
    def _hash_image(self, image_bytes: bytes) -> str:
        """图像内容哈希 (相同图片同一个key)"""
        return hashlib.md5(image_bytes).hexdigest()
    
    async def get_or_compute(self, image_bytes, prompt, compute_fn):
        key = f"mm:{self._hash_image(image_bytes)}:{hashlib.md5(prompt.encode()).hexdigest()}"
        
        cached = await self.redis.get(key)
        if cached:
            return json.loads(cached)
        
        result = await compute_fn(image_bytes, prompt)
        await self.redis.setex(key, 3600 * 24, json.dumps(result))
        return result` },
  { name: '边缘推理', icon: '📱', tag: 'Edge',
    code: `# ─── 边缘推理: 端侧多模态 ───

# ═══ 1. ONNX Runtime (跨平台) ═══
import onnxruntime as ort
import numpy as np

class EdgeVisionModel:
    """端侧视觉模型 (ONNX)"""
    
    def __init__(self, model_path: str):
        # 选择执行提供者
        providers = [
            "CoreMLExecutionProvider",  # Apple Silicon
            "CUDAExecutionProvider",    # NVIDIA GPU
            "CPUExecutionProvider",     # CPU 回退
        ]
        self.session = ort.InferenceSession(model_path, providers=providers)
    
    def predict(self, image):
        """推理"""
        # 预处理
        input_tensor = self._preprocess(image)
        
        # 推理
        outputs = self.session.run(None, {"input": input_tensor})
        
        return outputs[0]

# ═══ 2. 模型量化 (减小体积 + 加速) ═══
from optimum.onnxruntime import ORTQuantizer, AutoQuantizationConfig

def quantize_model(model_path: str, output_path: str):
    """INT8 量化: 体积减半，速度翻倍"""
    quantizer = ORTQuantizer.from_pretrained(model_path)
    qconfig = AutoQuantizationConfig.avx512_vnni(
        is_static=False,  # 动态量化(简单) vs 静态量化(更快)
    )
    quantizer.quantize(
        save_dir=output_path,
        quantization_config=qconfig,
    )

# ═══ 3. Apple Core ML ═══  
# iPhone/iPad/Mac 原生部署
import coremltools as ct

def convert_to_coreml(pytorch_model, example_input):
    """PyTorch → CoreML"""
    traced = torch.jit.trace(pytorch_model, example_input)
    mlmodel = ct.convert(
        traced,
        inputs=[ct.ImageType(name="image", shape=(1, 3, 224, 224))],
        compute_units=ct.ComputeUnit.ALL,  # CPU + GPU + Neural Engine
    )
    mlmodel.save("VisionModel.mlpackage")

# ═══ 4. WebAssembly (浏览器端) ═══
# 用 ONNX.js / Transformers.js 在浏览器运行!
# 
# import { pipeline } from '@xenova/transformers';
# 
# // 浏览器中运行图像分类!
# const classifier = await pipeline(
#   'image-classification',
#   'Xenova/vit-base-patch16-224'
# );
# const result = await classifier('photo.jpg');
# // → [{ label: 'tabby cat', score: 0.95 }]
#
# // 浏览器中运行 OCR!
# const ocr = await pipeline(
#   'image-to-text',
#   'Xenova/trocr-base-printed'  
# );

# ─── 部署方案选型 ───
DEPLOYMENT_GUIDE = {
    "浏览器 (WebAssembly)": {
        "适合": "轻量分类/OCR, <100MB 模型",
        "优势": "零后端, 隐私保护",
        "限制": "模型大小, 计算能力",
        "工具": "Transformers.js, ONNX.js",
    },
    "移动端 (iOS/Android)": {
        "适合": "实时相机分析, 离线场景",
        "优势": "Neural Engine 加速, 低延迟",
        "限制": "电池消耗, 内存限制",
        "工具": "CoreML, TFLite, ONNX Runtime Mobile",
    },
    "边缘服务器 (Jetson/RPi)": {
        "适合": "工业质检, 安防监控",
        "优势": "离线运行, 低延迟",
        "限制": "算力有限",
        "工具": "TensorRT, ONNX Runtime, Triton",
    },
    "云端 API": {
        "适合": "复杂分析, 大模型",
        "优势": "最强算力, 最新模型",
        "限制": "网络延迟, 成本",
        "工具": "GPT-4o, Gemini, Claude",
    },
}` },
  { name: '成本控制', icon: '💰', tag: 'Cost',
    code: `# ─── 多模态应用成本控制 ───

class CostController:
    """多模态成本优化器"""
    
    # ─── 各模态成本参考 (美元/次) ───
    COST_TABLE = {
        "image_analysis": {
            "gpt-4o_low":    0.000213,   # 85 tokens
            "gpt-4o_high":   0.001913,   # 765 tokens
            "gpt-4o-mini":   0.000012,   # 85 tokens, 便宜 18x!
            "gemini-flash":  0.000009,   # 更便宜
            "local_clip":    0.000001,   # 电费
        },
        "audio_1min": {
            "whisper_api":   0.006,      # $0.006/min
            "deepgram":      0.0043,
            "local_whisper": 0.0001,     # GPU 电费
        },
        "video_1min": {
            "gpt4o_1fps":    0.115,      # 60帧 × $0.0019
            "gemini_native": 0.000192,   # 原生! 600x 便宜
            "local":         0.001,
        },
        "tts_1000chars": {
            "openai_standard": 0.015,
            "openai_hd":       0.030,
            "elevenlabs":      0.005,
            "edge_tts":        0.000,    # 免费!
            "local_xtts":      0.0001,
        },
    }
    
    # ─── 成本优化策略 ───
    STRATEGIES = {
        "模型降级": {
            "策略": "简单任务用 mini/flash，复杂任务用 4o/opus",
            "节省": "60-90%",
            "实现": "路由: 先用小模型判断复杂度 → 动态选择模型",
        },
        "分辨率优化": {
            "策略": "图片分析先用 low detail，失败再用 high",
            "节省": "80%",
            "实现": "detail=low (85 token) vs high (765+ token)",
        },
        "缓存": {
            "策略": "相同图片+相同 prompt → 直接返回缓存",
            "节省": "30-50% (看重复率)",
            "实现": "Redis, 图片内容 hash 作 key",
        },
        "批量处理": {
            "策略": "攒一批请求一起发 → 减少调用次数",
            "节省": "20%",
            "实现": "异步队列 + 批量 API 调用",
        },
        "本地模型": {
            "策略": "简单视觉任务用开源模型本地推理",
            "节省": "95%+",
            "实现": "CLIP/SAM/Whisper.cpp 本地部署",
        },
        "Gemini 优先": {
            "策略": "视频分析用 Gemini 原生，不要 GPT-4o 抽帧",
            "节省": "99% (视频场景)",
            "实现": "Gemini File API + generate_content",
        },
    }
    
    def estimate_monthly_cost(self, usage: dict) -> dict:
        """预估月度成本"""
        total = 0
        breakdown = {}
        
        for feature, count in usage.items():
            unit_cost = self.COST_TABLE.get(feature, {}).get("gpt-4o_high", 0.01)
            cost = count * unit_cost
            total += cost
            breakdown[feature] = {
                "count": count,
                "unit_cost": unit_cost,
                "total": round(cost, 2),
            }
        
        return {
            "total_usd": round(total, 2),
            "total_cny": round(total * 7.2, 2),
            "breakdown": breakdown,
            "optimization_potential": self._suggest_savings(breakdown),
        }

# ─── 示例: 月度成本预估 ───
# controller = CostController()
# estimate = controller.estimate_monthly_cost({
#     "image_analysis": 10000,     # 1万张图片分析
#     "audio_1min": 5000,          # 5000分钟音频
#     "video_1min": 200,           # 200分钟视频
#     "tts_1000chars": 50000,      # 5万次TTS
# })
# → $19.13 + $30 + $23 + $750 = ~$822/月
# 优化后: 用 Gemini + Edge TTS → ~$50/月 (节省 94%!)` },
];

export default function LessonMMProduction() {
  const [topicIdx, setTopicIdx] = useState(0);
  const t = PROD_TOPICS[topicIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🎨 module_08 — 生产部署</div>
      <div className="fs-hero">
        <h1>生产部署：把多模态 AI 优雅地推上线</h1>
        <p>
          Demo 跑通不等于生产就绪——多模态应用面临<strong>延迟高</strong>（视频处理分钟级）、
          <strong>成本贵</strong>（一张图 = 765 token）、<strong>链路长</strong>（预处理 → 推理 → 后处理）的三重挑战。
          本模块给你一套<strong>工程化解决方案</strong>。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🏭 生产工程</h2>
        <div className="fs-pills">
          {PROD_TOPICS.map((t, i) => (
            <button key={i} className={`fs-btn ${i === topicIdx ? 'primary' : ''}`}
              onClick={() => setTopicIdx(i)}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#4ade80' }}>{t.icon} {t.name}</h3>
            <span className="fs-tag green">{t.tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 mm_prod_{t.tag.toLowerCase()}.py
            </div>
            <pre className="fs-code">{t.code}</pre>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="fs-section">
        <h2 className="fs-section-title">📊 生产就绪检查清单</h2>
        <div className="fs-grid-4">
          {[
            ['< 2s', 'TTFB 首字节', '#22c55e'],
            ['> 99.5%', '可用性 SLA', '#06b6d4'],
            ['< $0.01', '单次推理成本', '#f59e0b'],
            ['< 25MB', '上传限制', '#fb7185'],
          ].map(([v, l, c], i) => (
            <div key={i} className="fs-metric">
              <div className="fs-metric-value" style={{ color: c }}>{v}</div>
              <div className="fs-metric-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 多模态 RAG</button>
        <button className="fs-btn primary">🎓 课程完成！</button>
      </div>
    </div>
  );
}
