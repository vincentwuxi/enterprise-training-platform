import React from 'react';
import './LessonCommon.css';

export default function LessonImageSegmentation() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🎭 模块三：图像分割 — SAM 2 / 语义分割 / 实例分割 / 全景分割</h1>
      <p className="lesson-subtitle">
        从像素级理解到 Foundation Model，掌握图像分割全栈技术
      </p>

      <section className="lesson-section">
        <h2>1. 图像分割任务体系</h2>
        <div className="info-box">
          <h3>🗺️ 分割任务类型对比</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>任务类型</th><th>输出</th><th>区分实例</th><th>典型应用</th></tr>
            </thead>
            <tbody>
              <tr><td>语义分割</td><td>逐像素类别</td><td>❌</td><td>自动驾驶道路解析</td></tr>
              <tr><td>实例分割</td><td>逐像素类别 + 实例 ID</td><td>✅</td><td>机器人抓取物体</td></tr>
              <tr><td>全景分割</td><td>stuff + things 统一</td><td>✅ (things)</td><td>AR/VR 场景理解</td></tr>
              <tr><td>交互分割</td><td>点击/框/文本引导</td><td>✅</td><td>图像编辑 / 标注</td></tr>
              <tr><td>视频分割</td><td>时序 mask 传播</td><td>✅</td><td>视频编辑 / 追踪</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>📊 分割模型演进</h3>
          <div className="code-block">
{`# 分割模型发展脉络
"""
FCN (2015)          → 全卷积网络, 端到端像素分类
  ↓
U-Net (2015)        → 编码器-解码器 + 跳跃连接
  ↓
DeepLab v3+ (2018)  → 空洞卷积 + ASPP + 编解码
  ↓
Mask R-CNN (2017)   → 实例分割 = 检测 + 分割分支
  ↓
Mask2Former (2022)  → 统一分割: 语义/实例/全景
  ↓
SAM (2023)          → 分割一切, 通用 Foundation Model
  ↓
SAM 2 (2024)        → 图像+视频统一分割, 实时交互
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. SAM 2 — Segment Anything Model 2</h2>
        <div className="concept-card">
          <h3>🧠 SAM 2 架构与原理</h3>
          <div className="code-block">
{`# SAM 2 架构
"""
┌─────────────────────────────────────────────────────┐
│  SAM 2 Architecture                                 │
│                                                      │
│  Image Encoder (Hiera) ──→ Image Embeddings         │
│        ↓                                             │
│  Prompt Encoder ──→ Sparse/Dense Prompt Embeddings  │
│  (点/框/文本/mask)                                   │
│        ↓                                             │
│  Memory Attention ──→ 跨帧记忆 (视频分割)            │
│        ↓                                             │
│  Mask Decoder ──→ 多尺度预测 + IoU Score             │
│        ↓                                             │
│  Memory Encoder ──→ 存储到 Memory Bank              │
└─────────────────────────────────────────────────────┘

SAM 2 vs SAM 1:
- 统一图像+视频分割 (Memory Attention)
- 6x 速度提升 (Hiera 替代 ViT-H)
- 流式推理: 逐帧处理, 内存高效
"""`}
          </div>
        </div>

        <div className="concept-card">
          <h3>⚡ SAM 2 实战代码</h3>
          <div className="code-block">
{`import torch
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from sam2.sam2_video_predictor import SAM2VideoPredictor

# ═══ 图像分割 ═══
checkpoint = "sam2_hiera_large.pt"
model_cfg = "sam2_hiera_l.yaml"
predictor = SAM2ImagePredictor(build_sam2(model_cfg, checkpoint))

image = cv2.imread("input.jpg")
predictor.set_image(image)

# 点击分割 (point prompt)
masks, scores, logits = predictor.predict(
    point_coords=np.array([[500, 375]]),
    point_labels=np.array([1]),     # 1=前景, 0=背景
    multimask_output=True           # 返回 3 个候选 mask
)
best_mask = masks[scores.argmax()]

# 框选分割 (box prompt)
masks, scores, _ = predictor.predict(
    box=np.array([100, 100, 500, 400]),  # xyxy 格式
    multimask_output=False
)

# ═══ 视频分割 ═══
video_predictor = SAM2VideoPredictor(build_sam2(model_cfg, checkpoint))

with torch.inference_mode():
    state = video_predictor.init_state(video_path="video_frames/")
    
    # 在第 0 帧标注
    _, _, masks = video_predictor.add_new_points_or_box(
        inference_state=state,
        frame_idx=0,
        obj_id=1,
        points=np.array([[210, 350]]),
        labels=np.array([1])
    )
    
    # 自动传播到所有帧
    for frame_idx, obj_ids, masks in video_predictor.propagate_in_video(state):
        # masks: 每帧每个物体的 mask
        save_mask(frame_idx, obj_ids, masks)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 语义分割 — DeepLab v3+ 与 SegFormer</h2>
        <div className="concept-card">
          <h3>🔧 SegFormer 训练管线</h3>
          <div className="code-block">
{`from transformers import (
    SegformerForSemanticSegmentation,
    SegformerImageProcessor
)
import torch

# SegFormer: 轻量级 Transformer 分割
processor = SegformerImageProcessor.from_pretrained(
    "nvidia/segformer-b2-finetuned-cityscapes-1024-1024"
)
model = SegformerForSemanticSegmentation.from_pretrained(
    "nvidia/segformer-b2-finetuned-cityscapes-1024-1024"
)

# 微调自定义数据集
from torch.utils.data import Dataset, DataLoader

class SegmentationDataset(Dataset):
    def __init__(self, images_dir, masks_dir, processor):
        self.images = sorted(glob(f"{images_dir}/*.jpg"))
        self.masks = sorted(glob(f"{masks_dir}/*.png"))
        self.processor = processor
    
    def __getitem__(self, idx):
        image = Image.open(self.images[idx]).convert("RGB")
        mask = np.array(Image.open(self.masks[idx]))
        inputs = self.processor(image, return_tensors="pt")
        inputs["labels"] = torch.tensor(mask, dtype=torch.long)
        return {k: v.squeeze(0) for k, v in inputs.items()}

# 评估: mIoU (Mean Intersection over Union)
def compute_miou(pred_masks, gt_masks, num_classes):
    ious = []
    for cls in range(num_classes):
        pred = (pred_masks == cls)
        gt = (gt_masks == cls)
        intersection = (pred & gt).sum()
        union = (pred | gt).sum()
        if union > 0:
            ious.append(intersection / union)
    return np.mean(ious)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 实例分割与全景分割</h2>
        <div className="concept-card">
          <h3>🎯 Mask2Former — 统一分割框架</h3>
          <div className="code-block">
{`from transformers import (
    Mask2FormerForUniversalSegmentation,
    AutoImageProcessor
)

# Mask2Former: 统一语义/实例/全景分割
processor = AutoImageProcessor.from_pretrained(
    "facebook/mask2former-swin-large-coco-panoptic"
)
model = Mask2FormerForUniversalSegmentation.from_pretrained(
    "facebook/mask2former-swin-large-coco-panoptic"
)

image = Image.open("scene.jpg")
inputs = processor(image, return_tensors="pt")

with torch.no_grad():
    outputs = model(**inputs)

# 全景分割后处理
result = processor.post_process_panoptic_segmentation(
    outputs,
    target_sizes=[image.size[::-1]]
)[0]

panoptic_seg = result["segmentation"]  # 分割 map
segments_info = result["segments_info"]
# [{"id": 1, "label_id": 0, "score": 0.98, "isthing": True}, ...]

# 实例分割后处理
instance_result = processor.post_process_instance_segmentation(
    outputs,
    target_sizes=[image.size[::-1]]
)[0]`}
          </div>
        </div>

        <div className="info-box">
          <h3>📋 分割模型选型指南</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>场景</th><th>推荐模型</th><th>理由</th></tr>
            </thead>
            <tbody>
              <tr><td>交互标注</td><td>SAM 2</td><td>点击/框选, 零样本泛化</td></tr>
              <tr><td>自动驾驶</td><td>SegFormer / OneFormer</td><td>实时 + 高精度</td></tr>
              <tr><td>医疗影像</td><td>MedSAM / nnU-Net</td><td>专业领域 SOTA</td></tr>
              <tr><td>工业质检</td><td>SAM 2 + fine-tune</td><td>少样本适配</td></tr>
              <tr><td>视频编辑</td><td>SAM 2 Video</td><td>时序传播 + 交互</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>5. 分割模型微调与部署</h2>
        <div className="concept-card">
          <h3>🚀 SAM 2 微调 (LoRA)</h3>
          <div className="code-block">
{`# SAM 2 微调策略
"""
Full Fine-tuning:  适合大数据集 (>10K), 需要多卡
Decoder-only:      冻结 encoder, 微调 decoder
LoRA:              参数高效, 适合小数据集 (<1K)
Prompt Tuning:     学习 prompt embedding, 最轻量
"""

# 使用 LoRA 微调 SAM 2
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.1,
)

model = get_peft_model(sam2_model.image_encoder, lora_config)
print(f"Trainable: {sum(p.numel() for p in model.parameters() if p.requires_grad):,}")
# ~2M params vs 312M total

# ONNX 导出 (部署)
torch.onnx.export(
    model.image_encoder,
    dummy_input,
    "sam2_encoder.onnx",
    opset_version=17,
    input_names=["image"],
    output_names=["embeddings"],
    dynamic_axes={"image": {0: "batch"}}
)`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：目标检测</span>
        <span className="nav-next">下一模块：OCR 与文档 →</span>
      </div>
    </div>
  );
}
