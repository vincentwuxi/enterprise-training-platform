import React from 'react';
import './LessonCommon.css';

export default function LessonCVFundamentals() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">👁️ 模块一：CV 基础 — 图像处理 / 特征提取 / 数据增强 / 标注工具</h1>
      <p className="lesson-subtitle">
        从像素到特征，建立坚实的计算机视觉工程基础
      </p>

      {/* Section 1 */}
      <section className="lesson-section">
        <h2>1. 计算机视觉全景与发展历程</h2>
        <div className="info-box">
          <h3>🗺️ CV 发展里程碑</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>代表技术</th><th>特点</th></tr>
            </thead>
            <tbody>
              <tr><td>传统 CV (2000-2012)</td><td>SIFT / HOG / SVM</td><td>手工特征 + 统计分类器</td></tr>
              <tr><td>深度学习 (2012-2020)</td><td>AlexNet → ResNet → EfficientNet</td><td>端到端学习，CNN 为主</td></tr>
              <tr><td>Transformer (2020-2024)</td><td>ViT / DINO / DINOv2</td><td>自注意力机制，通用特征</td></tr>
              <tr><td>Foundation Model (2024+)</td><td>SAM 2 / Florence-2 / InternVL</td><td>预训练基座，零样本泛化</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>📊 CV 应用领域</h3>
          <div className="code-block">
{`工业质检 ──→ 缺陷检测 / 3D 测量 / 良品率提升
自动驾驶 ──→ 物体检测 / 语义分割 / BEV 感知
医疗影像 ──→ CT/MRI 分析 / 病灶检测 / 辅助诊断
安防监控 ──→ 行人检测 / 异常行为 / 人脸识别
内容理解 ──→ 图像分类 / 图文匹配 / 内容审核
遥感卫星 ──→ 变化检测 / 地物分类 / 灾害监测`}
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="lesson-section">
        <h2>2. 图像处理基础 — OpenCV 实战</h2>
        <div className="concept-card">
          <h3>🖼️ 图像表示与色彩空间</h3>
          <div className="code-block">
{`import cv2
import numpy as np

# 图像读取与色彩空间转换
img = cv2.imread('input.jpg')          # BGR 格式 (H, W, C)
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# 图像基本信息
print(f"Shape: {img.shape}")            # (720, 1280, 3)
print(f"Dtype: {img.dtype}")            # uint8
print(f"Pixel range: [{img.min()}, {img.max()}]")

# 色彩空间应用场景
# RGB/BGR: 通用显示
# HSV:     颜色过滤（按色调/饱和度/明度筛选）
# LAB:     颜色量化，对比度增强
# YCrCb:   肤色检测`}
          </div>
        </div>

        <div className="concept-card">
          <h3>🔧 图像预处理管线</h3>
          <div className="code-block">
{`# 1. 几何变换
resized = cv2.resize(img, (640, 480), interpolation=cv2.INTER_LINEAR)
rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

# 2. 滤波与降噪
blurred = cv2.GaussianBlur(img, (5, 5), sigmaX=1.0)
denoised = cv2.fastNlMeansDenoisingColored(img, h=10)

# 3. 边缘检测
edges_canny = cv2.Canny(gray, threshold1=50, threshold2=150)
sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)

# 4. 形态学操作
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
dilated = cv2.dilate(binary, kernel, iterations=1)
eroded = cv2.erode(binary, kernel, iterations=1)
opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

# 5. 直方图均衡化
equalized = cv2.equalizeHist(gray)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
enhanced = clahe.apply(gray)`}
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="lesson-section">
        <h2>3. 特征提取 — 从手工到深度特征</h2>
        <div className="info-box">
          <h3>🧬 特征提取方法对比</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>方法</th><th>类型</th><th>维度</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>SIFT</td><td>关键点</td><td>128D</td><td>特征匹配 / 全景拼接</td></tr>
              <tr><td>ORB</td><td>关键点</td><td>32D (binary)</td><td>实时应用 / SLAM</td></tr>
              <tr><td>HOG</td><td>区域</td><td>可变</td><td>行人检测 (传统)</td></tr>
              <tr><td>ResNet-50</td><td>深度</td><td>2048D</td><td>通用图像分类</td></tr>
              <tr><td>DINOv2</td><td>自监督</td><td>768D/1024D</td><td>零样本检索 / 分割</td></tr>
              <tr><td>CLIP</td><td>多模态</td><td>512D/768D</td><td>图文匹配 / 零样本分类</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>🧠 深度特征提取 (DINOv2)</h3>
          <div className="code-block">
{`import torch
from transformers import AutoImageProcessor, AutoModel
from PIL import Image

# DINOv2 — 自监督视觉基座模型
processor = AutoImageProcessor.from_pretrained(
    'facebook/dinov2-base'
)
model = AutoModel.from_pretrained('facebook/dinov2-base')

image = Image.open('test.jpg')
inputs = processor(images=image, return_tensors='pt')

with torch.no_grad():
    outputs = model(**inputs)

# [CLS] token 作为全局特征
global_feature = outputs.last_hidden_state[:, 0, :]
print(f"Feature shape: {global_feature.shape}")
# torch.Size([1, 768])

# Patch-level 特征 → 密集预测 (分割/检测)
patch_features = outputs.last_hidden_state[:, 1:, :]
print(f"Patch features: {patch_features.shape}")
# torch.Size([1, 256, 768]) for 16x16 patches`}
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="lesson-section">
        <h2>4. 数据增强 — Albumentations 实战</h2>
        <div className="concept-card">
          <h3>🎨 数据增强策略</h3>
          <div className="code-block">
{`import albumentations as A
from albumentations.pytorch import ToTensorV2

# 训练阶段增强管线
train_transform = A.Compose([
    # 几何变换
    A.RandomResizedCrop(640, 640, scale=(0.5, 1.0)),
    A.HorizontalFlip(p=0.5),
    A.ShiftScaleRotate(
        shift_limit=0.1, scale_limit=0.2,
        rotate_limit=30, p=0.5
    ),
    
    # 颜色增强
    A.ColorJitter(
        brightness=0.2, contrast=0.2,
        saturation=0.2, hue=0.1, p=0.5
    ),
    A.RandomBrightnessContrast(p=0.3),
    
    # 遮挡增强 (模拟真实遮挡)
    A.CoarseDropout(
        max_holes=8, max_height=32, max_width=32,
        fill_value=0, p=0.3
    ),
    
    # Mixup 相关
    A.RandomShadow(p=0.2),
    A.GaussNoise(var_limit=(10, 50), p=0.2),
    
    # 归一化
    A.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
    ToTensorV2()
], bbox_params=A.BboxParams(
    format='pascal_voc',
    label_fields=['class_labels']
))

# 检测任务增强 — bbox 自动跟随变换
augmented = train_transform(
    image=image,
    bboxes=[[x1, y1, x2, y2]],
    class_labels=['car']
)`}
          </div>
        </div>

        <div className="info-box">
          <h3>📋 增强策略选择指南</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>场景</th><th>推荐增强</th><th>避免使用</th></tr>
            </thead>
            <tbody>
              <tr><td>遥感</td><td>旋转90°/180°/270°, 翻转</td><td>色彩抖动 (遥感色彩敏感)</td></tr>
              <tr><td>医疗</td><td>弹性变换, 仿射, 亮度</td><td>色调变换 (病灶颜色关键)</td></tr>
              <tr><td>工业质检</td><td>旋转, 亮度, 噪声</td><td>过度裁剪 (小缺陷可能丢失)</td></tr>
              <tr><td>自动驾驶</td><td>颜色抖动, 雾效, 光照</td><td>垂直翻转 (天地倒转不合理)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5 */}
      <section className="lesson-section">
        <h2>5. 数据标注工具链与质量管控</h2>
        <div className="info-box">
          <h3>🏷️ 标注工具对比</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>工具</th><th>类型</th><th>支持任务</th><th>适用规模</th></tr>
            </thead>
            <tbody>
              <tr><td>LabelImg</td><td>开源</td><td>检测 (VOC/YOLO)</td><td>小规模</td></tr>
              <tr><td>LabelMe</td><td>开源</td><td>分割 (多边形)</td><td>小规模</td></tr>
              <tr><td>CVAT</td><td>开源/企业</td><td>检测/分割/追踪/视频</td><td>中大规模</td></tr>
              <tr><td>Label Studio</td><td>开源/企业</td><td>多模态 (图/文/音)</td><td>企业级</td></tr>
              <tr><td>Roboflow</td><td>SaaS</td><td>检测/分割 + 训练管线</td><td>快速迭代</td></tr>
              <tr><td>SAM-based</td><td>AI 辅助</td><td>交互分割 (点击/框)</td><td>大规模加速</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>🔍 CVAT AI 辅助标注工作流</h3>
          <div className="code-block">
{`# CVAT 部署 (Docker)
docker-compose -f docker-compose.yml \\
               -f components/serverless/docker-compose.serverless.yml up -d

# 标注质量管控流程
数据导入 → AI 预标注 (SAM / YOLO) → 人工校正 → 交叉审核

# 标注格式转换: COCO ↔ YOLO ↔ VOC
import json

def coco_to_yolo(coco_json, image_size):
    """COCO 格式转 YOLO 格式"""
    results = []
    w, h = image_size
    for ann in coco_json['annotations']:
        x, y, bw, bh = ann['bbox']  # COCO: x, y, w, h (左上角)
        # YOLO: cx, cy, w, h (中心点, 归一化)
        cx = (x + bw / 2) / w
        cy = (y + bh / 2) / h
        nw, nh = bw / w, bh / h
        results.append(f"{ann['category_id']} {cx:.6f} {cy:.6f} {nw:.6f} {nh:.6f}")
    return results

# 数据集质量检查清单
quality_checks = {
    "标注一致性": "同类目标标注标准统一 (宽松/严格)",
    "边界精度":   "bbox 紧贴物体边缘, mask 无溢出",
    "遗漏率":     "抽样检查, 漏标率 < 2%",
    "类别平衡":   "各类别数量分布, 长尾类别处理策略",
    "标注格式":   "验证坐标归一化, 类别映射正确性"
}`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span></span>
        <span className="nav-next">下一模块：目标检测 →</span>
      </div>
    </div>
  );
}
