import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['点云处理', 'Depth Estimation', 'SLAM', '场景理解'];

export default function Lesson3DPerception() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">👁️ module_05 — 3D 感知</div>
      <div className="fs-hero">
        <h1>3D 感知：点云 / Depth Estimation / SLAM / 场景理解 — 机器人的眼睛</h1>
        <p>
          机器人必须理解 3D 世界才能安全行动。<strong>点云处理</strong>从 LiDAR/深度相机
          获取 3D 信息，<strong>SLAM</strong> 实现同时定位与建图，
          <strong>场景理解</strong>融合语义/几何信息。本模块覆盖从传感器原理到
          AI 驱动的 3D 感知全栈。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">👁️ 3D 感知</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>☁️ 点云处理</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> point_cloud</div>
              <pre className="fs-code">{`# 点云处理: 3D 世界的数字化表示

# ═══ 点云基础 ═══
# 点云 = N 个 3D 点 {(x, y, z, ...)}
# 来源: LiDAR / 深度相机 / 双目视觉
# 格式: (N, 3) 或 (N, 6) 含颜色/法线

import numpy as np
import open3d as o3d

# 从 RealSense 深度相机获取点云
import pyrealsense2 as rs

pipeline = rs.pipeline()
config = rs.config()
config.enable_stream(rs.stream.depth, 640, 480, rs.format.z16, 30)
config.enable_stream(rs.stream.color, 640, 480, rs.format.bgr8, 30)
pipeline.start(config)

frames = pipeline.wait_for_frames()
depth_frame = frames.get_depth_frame()
color_frame = frames.get_color_frame()

# 深度 → 点云
pc = rs.pointcloud()
points = pc.calculate(depth_frame)
vertices = np.asarray(points.get_vertices())

# Open3D 处理
pcd = o3d.geometry.PointCloud()
pcd.points = o3d.utility.Vector3dVector(vertices)

# ═══ 点云预处理 ═══
# 1. 降采样 (减少点数)
pcd_down = pcd.voxel_down_sample(voxel_size=0.01)  # 1cm 体素

# 2. 去除离群点
pcd_clean, mask = pcd_down.remove_statistical_outlier(
    nb_neighbors=20, std_ratio=2.0
)

# 3. 法线估计
pcd_clean.estimate_normals(
    search_param=o3d.geometry.KDTreeSearchParamHybrid(
        radius=0.05, max_nn=30
    )
)

# 4. 平面分割 (去除地面)
plane_model, inliers = pcd_clean.segment_plane(
    distance_threshold=0.01,
    ransac_n=3,
    num_iterations=1000
)
objects = pcd_clean.select_by_index(inliers, invert=True)

# ═══ PointNet++ (3D 深度学习) ═══
# 直接在点云上做分类/分割
import torch
from pointnet2_ops import pointnet2_utils

class PointNet2(torch.nn.Module):
    """PointNet++ 语义分割"""
    def __init__(self):
        super().__init__()
        # Set Abstraction: 逐层聚合局部特征
        self.sa1 = PointNetSetAbstraction(
            npoint=1024, radius=0.1, nsample=32
        )
        self.sa2 = PointNetSetAbstraction(
            npoint=256, radius=0.2, nsample=64
        )
        # Feature Propagation: 上采样回原始点
        self.fp2 = PointNetFeaturePropagation()
        self.fp1 = PointNetFeaturePropagation()
        
    def forward(self, xyz, features):
        # 编码: 1024 → 256 点
        l1_xyz, l1_feat = self.sa1(xyz, features)
        l2_xyz, l2_feat = self.sa2(l1_xyz, l1_feat)
        # 解码: 256 → 1024 → N 点
        l1_feat = self.fp2(l1_xyz, l2_xyz, l1_feat, l2_feat)
        out = self.fp1(xyz, l1_xyz, features, l1_feat)
        return out  # (N, num_classes)

# ═══ 抓取点检测 ═══
# 从点云中检测可抓取位姿
# 输入: 物体点云
# 输出: 抓取位姿 (位置 + 方向 + 开合度)
# 模型: GraspNet / Contact-GraspNet / AnyGrasp`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📐 Depth Estimation</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> depth_estimation</div>
              <pre className="fs-code">{`# 深度估计: 从 2D 图像获取 3D 信息

# ═══ 深度传感器 ═══
depth_sensors = {
    "结构光 (RealSense D435)": {
        "原理": "投射红外图案 → 三角测量",
        "精度": "±1% @ 2m",
        "范围": "0.3-3m (室内)",
        "帧率": "30-90 fps",
        "适用": "桌面操作/室内导航",
    },
    "ToF (Azure Kinect)": {
        "原理": "发射调制光 → 测量相位差",
        "精度": "±1cm",
        "范围": "0.5-5m",
        "适用": "人体姿态/手势",
    },
    "LiDAR (Velodyne/禾赛)": {
        "原理": "激光扫描 → 精确距离",
        "精度": "±2cm @ 100m",
        "范围": "0-200m",
        "适用": "自动驾驶/室外机器人",
    },
}

# ═══ 单目深度估计 (AI) ═══
# 只用一个 RGB 摄像头 → 估计深度!
# Depth Anything v2 (2024, 最强开源)

from transformers import pipeline

depth_pipe = pipeline(
    "depth-estimation", 
    model="depth-anything/Depth-Anything-V2-Large"
)

# 推理
result = depth_pipe("scene.jpg")
depth_map = result["depth"]  # 相对深度图

# ═══ Metric Depth (绝对深度) ═══
# Depth Anything v2 + 度量微调
# → 输出真实距离 (米)
# 机器人需要的是绝对深度!

from depth_anything_v2 import DepthAnythingV2

model = DepthAnythingV2(encoder='vitl', max_depth=20)
model.load_state_dict(torch.load('metric_depth.pth'))

depth_meters = model.infer_image(image)
# depth_meters[y, x] = 距离 (米)

# ═══ 立体视觉 (双目) ═══
# 两个摄像头 → 视差 → 深度
import cv2

stereo = cv2.StereoSGBM_create(
    minDisparity=0,
    numDisparities=128,
    blockSize=5,
)
disparity = stereo.compute(left_img, right_img)
depth = focal_length * baseline / disparity

# ═══ 深度 → 3D 点云 ═══
# 相机内参: fx, fy, cx, cy
# (u, v, d) → (X, Y, Z)
# X = (u - cx) * d / fx
# Y = (v - cy) * d / fy
# Z = d`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🗺️ SLAM</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> slam</div>
              <pre className="fs-code">{`# SLAM: Simultaneous Localization and Mapping
# 同时定位与建图 — 机器人导航的核心

# ═══ SLAM 核心问题 ═══
# 鸡生蛋问题:
# - 定位需要地图 (我在哪?)
# - 建图需要定位 (地图长啥样?)
# SLAM: 同时解决两个问题!

# ═══ SLAM 分类 ═══
slam_types = {
    "视觉 SLAM (vSLAM)": {
        "传感器": "单目/双目/RGBD 相机",
        "代表":   "ORB-SLAM3, RTAB-Map",
        "优势":   "成本低, 语义丰富",
        "劣势":   "光照敏感, 尺度漂移",
    },
    "激光 SLAM (LiDAR)": {
        "传感器": "2D/3D LiDAR",
        "代表":   "Cartographer, LOAM, LIO-SAM",
        "优势":   "精度高, 光照不敏感",
        "劣势":   "成本高, 稀疏表示",
    },
    "多传感器融合": {
        "传感器": "LiDAR + Camera + IMU + GPS",
        "代表":   "LVI-SAM, R3LIVE",
        "优势":   "最高鲁棒性和精度",
        "适用":   "自动驾驶, 工业机器人",
    },
}

# ═══ ORB-SLAM3 使用 ═══
# 最经典的视觉 SLAM 系统
# 1. 特征提取: ORB 特征点
# 2. 特征匹配: 帧间匹配
# 3. 位姿估计: PnP + RANSAC
# 4. 局部建图: 关键帧+地图点
# 5. 回环检测: DBoW2 词袋

# ═══ RTAB-Map (ROS 集成) ═══
# ROS 2 中最常用的 SLAM 方案
# ros2 launch rtabmap_launch rtabmap.launch.py \\
#   rgb_topic:=/camera/color/image_raw \\
#   depth_topic:=/camera/depth/image_rect_raw \\
#   camera_info_topic:=/camera/color/camera_info

# ═══ AI-SLAM (新趋势) ═══
ai_slam = {
    "DROID-SLAM": {
        "方法": "端到端深度学习 SLAM",
        "优势": "精度超越传统方法",
        "原理": "可微分的 BA (Bundle Adjustment)",
    },
    "Neural Implicit SLAM": {
        "方法": "NeRF/3DGS 作为地图表示",
        "代表": "iMAP, NICE-SLAM, SplaTAM",
        "优势": "稠密重建 + 渲染能力",
    },
    "Foundation Model SLAM": {
        "方法": "CLIP/SAM + SLAM = 语义地图",
        "代表": "ConceptFusion, OpenScene",
        "能力": "开放词汇: '找到红色杯子在哪'",
    },
}

# ═══ 导航栈 ═══
# SLAM (地图) → 路径规划 → 运动控制
# ROS 2 Nav2:
# ros2 launch nav2_bringup navigation_launch.py
# → A*/Dijkstra 全局规划
# → DWB/TEB 局部规划
# → 避障 + 恢复行为`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧠 场景理解</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> scene_understanding</div>
              <pre className="fs-code">{`# 场景理解: 机器人对环境的全面认知

# ═══ 3D 语义分割 ═══
# 给点云中每个点分配语义标签
# "地面" / "桌子" / "杯子" / "人"

# 模型: PTv3 (Point Transformer V3)
from pointcept.models import PointTransformerV3

model = PointTransformerV3(
    in_channels=6,       # x,y,z + r,g,b
    num_classes=20,      # 语义类别数
    depth=12,
    embed_dim=384,
)
# 输入: (N, 6) 点云 → 输出: (N, 20) 类别概率

# ═══ 开放词汇 3D 理解 ═══
# 传统: 只能识别训练过的类别
# 开放词汇: 识别任意类别! (用自然语言查询)

# ConceptFusion / OpenScene
# 1. 多视角 RGB → CLIP 特征提取
# 2. 特征反投影到 3D 点云
# 3. 每个 3D 点有 CLIP 嵌入
# 4. 自然语言查询 → 找到匹配的 3D 区域
# "找充电器在哪" → 高亮点云中的充电器

# ═══ 抓取姿态预测 ═══
# 给定场景点云 → 预测所有可能的抓取姿态
# GraspNet-1Billion: 大规模抓取数据集

from graspnetAPI import GraspNet
from anygrasp import AnyGrasp

# AnyGrasp: 任意物体抓取
anygrasp = AnyGrasp(checkpoint="anygrasp.pth")
grasps, scores = anygrasp.get_grasps(
    point_cloud,  # (N, 3)
    colors,       # (N, 3) 
)
# grasps: 抓取位姿列表 (位置+旋转+开合度)
# scores: 成功概率

best_grasp = grasps[scores.argmax()]
# → 发送给机械臂执行

# ═══ 6D 物体位姿估计 ═══
# 检测物体在 3D 空间中的精确位姿
# 用途: 精确抓取/装配

# FoundationPose (NVIDIA, 2024)
# 零样本: 只需 CAD 模型或参考图
# 输入: RGB-D + 物体 CAD/图片
# 输出: 6DoF 位姿 (3D 位置 + 3D 旋转)

# ═══ 语义场景图 ═══
# 不仅理解物体, 还理解关系
# "杯子 在 桌子 上"
# "人 在 沙发 旁边"
scene_graph = {
    "节点": "物体 (类别+位姿+语义)",
    "边": "空间关系 (on/in/near/behind)",
    "能力": "回答 '什么东西在桌子上?'",
    "用途": "高级任务规划的基础",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
