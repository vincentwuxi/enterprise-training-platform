import React from 'react';
import './LessonCommon.css';

export default function LessonObjectDetection() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🎯 模块二：目标检测 — YOLO v9/v10 / RT-DETR / 小目标检测</h1>
      <p className="lesson-subtitle">
        从 Anchor-based 到 Anchor-free，掌握现代目标检测全栈技术
      </p>

      {/* Section 1 */}
      <section className="lesson-section">
        <h2>1. 目标检测技术演进</h2>
        <div className="info-box">
          <h3>📈 检测算法代际图谱</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>代表模型</th><th>FPS</th><th>COCO mAP</th><th>特点</th></tr>
            </thead>
            <tbody>
              <tr><td>Two-stage</td><td>Faster R-CNN</td><td>~15</td><td>42.0</td><td>Anchor + RPN + ROI</td></tr>
              <tr><td>One-stage v1</td><td>YOLOv3</td><td>~55</td><td>33.0</td><td>DarkNet, 多尺度检测</td></tr>
              <tr><td>Anchor-free</td><td>FCOS / CenterNet</td><td>~40</td><td>44.7</td><td>去除 Anchor 先验</td></tr>
              <tr><td>Transformer</td><td>DETR / Deformable DETR</td><td>~28</td><td>49.0</td><td>集合预测, 无 NMS</td></tr>
              <tr><td>YOLO 新时代</td><td>YOLOv8/v9/v10</td><td>~180</td><td>53.9</td><td>PGI / NMS-free</td></tr>
              <tr><td>RT-DETR</td><td>RT-DETR v2</td><td>~108</td><td>54.3</td><td>DETR 实时化</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2 */}
      <section className="lesson-section">
        <h2>2. YOLO 系列深度实战</h2>
        <div className="concept-card">
          <h3>🔥 YOLOv10 — NMS-Free 高效检测</h3>
          <div className="code-block">
{`from ultralytics import YOLO

# ═══ YOLOv10 模型系列 ═══
# v10n: 2.3M params, 6.7G FLOPs  → 边缘设备
# v10s: 7.2M params, 21.6G FLOPs → 平衡精度/速度
# v10m: 15.4M params, 59.1G FLOPs → 通用场景
# v10l: 24.4M params, 120.3G FLOPs → 高精度

model = YOLO('yolov10s.pt')

# 训练自定义数据集
results = model.train(
    data='custom_dataset.yaml',
    epochs=300,
    imgsz=640,
    batch=16,
    device='0',
    # 关键超参
    lr0=0.01,
    lrf=0.01,            # 余弦退火终点 LR
    mosaic=1.0,           # Mosaic 增强
    mixup=0.1,            # Mixup 增强
    copy_paste=0.1,       # Copy-Paste 增强
    close_mosaic=10,      # 最后 10 epoch 关闭 Mosaic
    # NMS-Free 特性 (YOLOv10)
    nms=False,            # 一致性双重分配
)

# 推理
results = model.predict(
    source='test_images/',
    conf=0.25,
    iou=0.45,            # 虽然 NMS-Free, 仍可设阈值
    save=True,
    save_txt=True         # 保存预测标签
)`}
          </div>
        </div>

        <div className="concept-card">
          <h3>📊 YOLOv9 创新 — PGI 架构</h3>
          <div className="code-block">
{`# YOLOv9 核心创新: Programmable Gradient Information (PGI)
#
# 问题: 深层网络中信息瓶颈导致梯度退化
# 方案: GELAN (Generalized Efficient Layer Aggregation Network)
#       + PGI (可编程梯度信息)
#
# 架构对比:
#  ┌──────────────────────────────────────────────┐
#  │  YOLOv8:  CSPDarkNet → PAFPN → Head         │
#  │  YOLOv9:  GELAN + PGI → PAFPN → Head        │
#  │  YOLOv10: CSPDarkNet → PAFPN → Dual Head    │
#  └──────────────────────────────────────────────┘

# 数据集配置文件 (custom_dataset.yaml)
dataset_config = """
path: /data/custom_dataset
train: images/train
val: images/val
test: images/test

names:
  0: person
  1: car
  2: bicycle
  3: dog

# 数据集统计
nc: 4
"""

# 模型选择决策树
decision_tree = {
    "边缘设备 (Jetson/手机)": "YOLOv10n/s + TensorRT",
    "服务端实时":             "YOLOv10m + batch推理",
    "高精度场景":             "RT-DETR-L + 多尺度",
    "小目标":                 "YOLOv9 + SAHI 切图",
    "旋转目标":               "YOLOv8-OBB"
}`}
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="lesson-section">
        <h2>3. RT-DETR — Transformer 实时检测</h2>
        <div className="concept-card">
          <h3>⚡ RT-DETR v2 架构与训练</h3>
          <div className="code-block">
{`from ultralytics import RTDETR

# RT-DETR 优势:
# 1. 无 NMS 后处理 → 端到端推理
# 2. 灵活 Backbone (ResNet/HGNetv2)
# 3. 精度-速度帕累托最优

model = RTDETR('rtdetr-l.pt')

# 训练
results = model.train(
    data='coco8.yaml',
    epochs=200,
    imgsz=640,
    batch=8,
    # RT-DETR 特有参数
    optimizer='AdamW',
    lr0=0.0001,
    weight_decay=0.0001,
)

# 导出为 TensorRT (部署加速)
model.export(
    format='engine',
    half=True,             # FP16 加速
    device=0,
    workspace=8,           # GB, TensorRT workspace
    dynamic=True           # 动态 batch
)

# RT-DETR vs YOLO 选型
"""
┌──────────┬──────────────┬──────────────┐
│ 对比维度  │ RT-DETR       │ YOLOv10      │
├──────────┼──────────────┼──────────────┤
│ 后处理    │ 无 NMS       │ 无 NMS       │
│ 精度     │ mAP 54.3     │ mAP 53.9     │
│ 速度     │ ~108 FPS     │ ~180 FPS     │
│ 小目标    │ 更优 (注意力) │ 需 SAHI 辅助  │
│ 部署复杂度 │ 稍高         │ 简单         │
│ 推荐场景  │ 高精度/小目标 │ 实时/边缘    │
└──────────┴──────────────┴──────────────┘
"""`}
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="lesson-section">
        <h2>4. 小目标检测 — SAHI 与多尺度策略</h2>
        <div className="concept-card">
          <h3>🔬 SAHI 切图推理</h3>
          <div className="code-block">
{`from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction

# 小目标挑战:
# - 分辨率低, 特征信息少
# - 被背景淹没, 信噪比低
# - 密集排列, NMS 误删

# SAHI: Slicing Aided Hyper Inference
detection_model = AutoDetectionModel.from_pretrained(
    model_type='yolov8',
    model_path='yolov10m.pt',
    confidence_threshold=0.3,
    device='cuda:0'
)

# 切图推理
result = get_sliced_prediction(
    image='aerial_image.jpg',
    detection_model=detection_model,
    slice_height=640,     # 切片高度
    slice_width=640,      # 切片宽度
    overlap_height_ratio=0.2,  # 重叠率
    overlap_width_ratio=0.2,
    perform_standard_pred=True,  # 也做全图推理
    postprocess_type='GREEDYNMM',
    postprocess_match_threshold=0.5
)

# 多尺度训练策略
multiscale_config = {
    "imgsz": [480, 640, 800, 1024],  # 训练时随机尺度
    "mosaic": 1.0,                     # Mosaic 拼合小目标
    "copy_paste": 0.3,                 # 拷贝粘贴增强
    "scale": 0.9,                      # 尺度抖动范围
}`}
          </div>
        </div>

        <div className="info-box">
          <h3>📋 小目标检测优化清单</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>策略</th><th>原理</th><th>提升幅度</th></tr>
            </thead>
            <tbody>
              <tr><td>SAHI 切图</td><td>滑窗裁剪 + 合并</td><td>mAP +5~15%</td></tr>
              <tr><td>高分辨率输入</td><td>1280/1536 输入</td><td>mAP +3~8%</td></tr>
              <tr><td>P2 层检测头</td><td>增加 4x 下采样检测</td><td>mAP +2~5%</td></tr>
              <tr><td>Copy-Paste</td><td>粘贴小目标实例</td><td>mAP +2~4%</td></tr>
              <tr><td>注意力机制</td><td>CBAM / SE 模块</td><td>mAP +1~3%</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5 */}
      <section className="lesson-section">
        <h2>5. 检测模型评估与调优</h2>
        <div className="concept-card">
          <h3>📈 评估指标详解</h3>
          <div className="code-block">
{`# 核心评估指标
"""
Precision = TP / (TP + FP)    → 检测结果中正确的比例
Recall    = TP / (TP + FN)    → 实际目标被检出的比例
AP        = ∫ Precision(Recall) dRecall
mAP       = mean(AP_per_class)

COCO 指标:
  mAP@0.5:    IoU=0.5 的 mAP
  mAP@0.5:0.95: IoU 从 0.5 到 0.95 步长 0.05 的平均
  AP_S:       小目标 (area < 32²)
  AP_M:       中目标 (32² < area < 96²)
  AP_L:       大目标 (area > 96²)
"""

# 使用 pycocotools 评估
from pycocotools.coco import COCO
from pycocotools.cocoeval import COCOeval

coco_gt = COCO('annotations.json')
coco_dt = coco_gt.loadRes('predictions.json')

coco_eval = COCOeval(coco_gt, coco_dt, iouType='bbox')
coco_eval.evaluate()
coco_eval.accumulate()
coco_eval.summarize()

# 错误分析: TIDE toolkit
# pip install tidecv
from tidecv import TIDE
tide = TIDE()
tide.evaluate(coco_gt, coco_dt, mode=TIDE.BOX)
tide.summarize()  # 分解: Cls / Loc / Both / Dup / Bkg / Miss`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：CV 基础</span>
        <span className="nav-next">下一模块：图像分割 →</span>
      </div>
    </div>
  );
}
