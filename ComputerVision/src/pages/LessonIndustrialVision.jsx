import React from 'react';
import './LessonCommon.css';

export default function LessonIndustrialVision() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🏭 模块七：工业视觉 — 质检 / 缺陷检测 / 3D 测量 / 边缘部署</h1>
      <p className="lesson-subtitle">
        从实验室到产线，掌握工业视觉落地的核心挑战与解决方案
      </p>

      <section className="lesson-section">
        <h2>1. 工业视觉系统架构</h2>
        <div className="info-box">
          <h3>🏗️ 工业视觉系统组成</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>组件</th><th>作用</th><th>关键指标</th></tr>
            </thead>
            <tbody>
              <tr><td>工业相机</td><td>图像采集</td><td>分辨率 / 帧率 / 接口 (GigE/USB3)</td></tr>
              <tr><td>光源</td><td>照明控制</td><td>类型 (环形/条形/同轴) / 颜色 / 角度</td></tr>
              <tr><td>镜头</td><td>成像光学</td><td>焦距 / 景深 / 畸变 / 远心</td></tr>
              <tr><td>算法平台</td><td>视觉处理</td><td>检测精度 / 误检率 / 延迟</td></tr>
              <tr><td>执行机构</td><td>分拣/标记</td><td>响应速度 / 准确率</td></tr>
              <tr><td>通信</td><td>PLC/MES 对接</td><td>协议 (Modbus/OPC UA/MQTT)</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>📊 工业 vs 通用 CV 差异</h3>
          <div className="code-block">
{`"""
┌──────────────┬──────────────────┬──────────────────┐
│ 维度          │ 通用 CV           │ 工业视觉         │
├──────────────┼──────────────────┼──────────────────┤
│ 精度要求      │ mAP > 50%        │ 漏检率 < 0.1%    │
│ 速度要求      │ 实时即可          │ < 50ms/图        │
│ 数据量       │ 大规模数据集      │ 少样本 (100-1K)  │
│ 异常比例      │ 类别较均衡        │ 良品 99% / 缺陷 1% │
│ 环境         │ 开放场景          │ 可控光照/背景    │
│ 部署         │ 云端 GPU          │ 边缘设备 (IPC)   │
│ 可靠性       │ 偶尔出错可接受    │ 7×24 稳定运行    │
│ 可解释性      │ 黑箱可接受        │ 需要解释缺陷原因 │
└──────────────┴──────────────────┴──────────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 缺陷检测 — 有监督与无监督</h2>
        <div className="concept-card">
          <h3>🔍 有监督缺陷检测</h3>
          <div className="code-block">
{`from ultralytics import YOLO

# 缺陷检测: YOLO 方案
model = YOLO('yolov10s.pt')

# 缺陷数据集配置
"""
# defect_dataset.yaml
path: /data/defect_detection
train: images/train
val: images/val

names:
  0: scratch    # 划痕
  1: dent       # 凹痕
  2: stain      # 污渍
  3: crack      # 裂纹
  4: missing    # 缺失

nc: 5
"""

# 训练策略 (针对工业场景优化)
results = model.train(
    data='defect_dataset.yaml',
    epochs=200,
    imgsz=1024,              # 高分辨率 (小缺陷)
    batch=8,
    # 类别不平衡处理
    cls=1.0,                  # 分类损失权重
    # 数据增强 (工业场景保守增强)
    mosaic=0.5,               # 减少 Mosaic (保持缺陷完整)
    degrees=10,               # 小角度旋转
    translate=0.1,
    scale=0.3,
    flipud=0.0,               # 工业件通常方向固定
    fliplr=0.5,
)`}
          </div>
        </div>

        <div className="concept-card">
          <h3>🧠 无监督异常检测 — Anomalib</h3>
          <div className="code-block">
{`# 无监督: 只用良品训练, 自动发现缺陷
# Anomalib: 工业异常检测标准库

from anomalib.data import MVTec
from anomalib.models import Patchcore, EfficientAd
from anomalib.engine import Engine

# 数据: MVTec AD 工业缺陷基准
datamodule = MVTec(
    root="./datasets/MVTec",
    category="bottle",          # 15 个工业品类
    image_size=(256, 256),
    train_batch_size=32,
)

# PatchCore: 工业级 SOTA 异常检测
model = Patchcore(
    backbone="wide_resnet50_2",
    layers_to_extract=["layer2", "layer3"],
    coreset_sampling_ratio=0.1,  # 核心集采样率
)

# EfficientAd: 更快速的轻量方案
model = EfficientAd(
    teacher_out_channels=384,
    model_size="small",  # small/medium
)

engine = Engine()
engine.fit(model=model, datamodule=datamodule)

# 评估
results = engine.test(model=model, datamodule=datamodule)
# 输出: Image AUROC, Pixel AUROC, Image F1

# 异常检测方法对比 (MVTec AD 基准)
"""
┌──────────────┬──────────┬─────────┬──────────┐
│ 方法          │ Image ROC │ Pixel ROC │ 速度    │
├──────────────┼──────────┼─────────┼──────────┤
│ PatchCore     │ 99.1%    │ 98.1%   │ ~80ms   │
│ EfficientAd   │ 98.8%    │ 97.4%   │ ~5ms    │
│ FastFlow      │ 98.9%    │ 97.8%   │ ~20ms   │
│ DRAEM         │ 98.0%    │ 97.3%   │ ~15ms   │
│ Reverse Dist. │ 97.8%    │ 97.8%   │ ~30ms   │
└──────────────┴──────────┴─────────┴──────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 3D 视觉与测量</h2>
        <div className="concept-card">
          <h3>📐 3D 视觉技术矩阵</h3>
          <div className="code-block">
{`# 3D 数据获取方式
"""
结构光:   投射光栅 → 三角测量 → 点云
  └ 精度高 (μm级), 适合静态测量

双目立体:  两个相机 → 视差计算 → 深度图
  └ 成本低, 适合移动场景

ToF (飞行时间): 激光/红外 → 往返时间 → 深度
  └ 实时性好, 适合动态场景 (RGBD 相机)

LiDAR:   激光扫描 → 3D 点云
  └ 远距离 (100m+), 自动驾驶标配
"""

import open3d as o3d
import numpy as np

# Open3D 点云处理
pcd = o3d.io.read_point_cloud("scan.ply")

# 1. 降采样
pcd_down = pcd.voxel_down_sample(voxel_size=0.05)

# 2. 法线估计
pcd_down.estimate_normals(
    search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30)
)

# 3. 平面分割 (RANSAC)
plane_model, inliers = pcd_down.segment_plane(
    distance_threshold=0.01,
    ransac_n=3,
    num_iterations=1000
)

# 4. 点云配准 (ICP)
result = o3d.pipelines.registration.registration_icp(
    source, target, max_correspondence_dist=0.05,
    estimation_method=o3d.pipelines.registration.TransformationEstimationPointToPlane()
)

# 5. 尺寸测量
bbox = pcd.get_axis_aligned_bounding_box()
dimensions = bbox.get_extent()
print(f"尺寸: {dimensions[0]:.2f} x {dimensions[1]:.2f} x {dimensions[2]:.2f} mm")`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 边缘设备部署</h2>
        <div className="info-box">
          <h3>📋 工业边缘设备选型</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>设备</th><th>算力</th><th>功耗</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              <tr><td>NVIDIA Jetson Orin NX</td><td>100 TOPS (INT8)</td><td>15-25W</td><td>高精度实时检测</td></tr>
              <tr><td>NVIDIA Jetson Orin Nano</td><td>40 TOPS</td><td>7-15W</td><td>轻量检测</td></tr>
              <tr><td>Intel NUC (OpenVINO)</td><td>~10 TOPS</td><td>15W</td><td>传统算法 + 轻量DL</td></tr>
              <tr><td>Hailo-8</td><td>26 TOPS</td><td>2.5W</td><td>超低功耗边缘 AI</td></tr>
              <tr><td>Atlas 200</td><td>22 TOPS</td><td>8W</td><td>华为生态</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>🚀 Jetson 部署管线</h3>
          <div className="code-block">
{`# Jetson 部署: YOLO → TensorRT
from ultralytics import YOLO

model = YOLO('best.pt')

# 导出 TensorRT engine
model.export(
    format='engine',
    half=True,          # FP16
    int8=True,          # INT8 量化 (需校准数据)
    workspace=4,        # GB
    device=0,
    batch=1,            # 固定 batch
    data='calibration.yaml'  # INT8 校准数据集
)

# 推理性能对比 (Jetson Orin NX, YOLO v10s, 640x640)
"""
┌──────────┬──────────┬────────┬────────┐
│ 精度     │ 模型大小  │ 延迟   │ mAP    │
├──────────┼──────────┼────────┼────────┤
│ FP32     │ 28.6 MB  │ 12.3ms │ 46.8%  │
│ FP16     │ 14.3 MB  │ 6.1ms  │ 46.6%  │
│ INT8     │ 7.8 MB   │ 3.8ms  │ 45.9%  │
└──────────┴──────────┴────────┴────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>5. 工业视觉项目交付清单</h2>
        <div className="info-box">
          <h3>📋 项目交付标准</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>交付物</th><th>验收标准</th></tr>
            </thead>
            <tbody>
              <tr><td>需求分析</td><td>检测规格书</td><td>缺陷定义 / 精度要求 / 节拍要求</td></tr>
              <tr><td>方案设计</td><td>硬件方案 + 算法方案</td><td>甲方确认 / 成本评审</td></tr>
              <tr><td>数据采集</td><td>标注数据集</td><td>覆盖全品类 / 缺陷样本充足</td></tr>
              <tr><td>算法开发</td><td>模型文件 + 推理代码</td><td>检出率 ≥ 99.9% / 误检率 ≤ 0.1%</td></tr>
              <tr><td>系统集成</td><td>软硬件一体系统</td><td>7×24 稳定 / PLC 通信正常</td></tr>
              <tr><td>验收测试</td><td>测试报告</td><td>连续运行 72h 达标</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：人脸与人体</span>
        <span className="nav-next">下一模块：生产部署 →</span>
      </div>
    </div>
  );
}
