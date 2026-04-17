import React from 'react';
import './LessonCommon.css';

export default function LessonVideoAnalysis() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🎬 模块五：视频分析 — 动作识别 / 目标跟踪 / 异常检测</h1>
      <p className="lesson-subtitle">
        从单帧到时序，掌握视频理解与智能分析的核心技术
      </p>

      <section className="lesson-section">
        <h2>1. 视频分析技术全景</h2>
        <div className="info-box">
          <h3>🗺️ 视频分析任务矩阵</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>任务类型</th><th>输入</th><th>输出</th><th>典型应用</th></tr>
            </thead>
            <tbody>
              <tr><td>动作识别</td><td>视频片段</td><td>动作类别</td><td>运动分析 / 手势识别</td></tr>
              <tr><td>目标跟踪</td><td>视频序列</td><td>轨迹 + ID</td><td>安防 / 交通 / 体育</td></tr>
              <tr><td>多目标跟踪 (MOT)</td><td>视频序列</td><td>所有目标轨迹</td><td>客流 / 行人分析</td></tr>
              <tr><td>时序动作检测</td><td>长视频</td><td>动作时间段</td><td>视频审核 / 集锦</td></tr>
              <tr><td>异常检测</td><td>监控视频</td><td>异常事件</td><td>工厂 / 交通 / 安防</td></tr>
              <tr><td>视频摘要</td><td>长视频</td><td>关键帧</td><td>视频检索 / 速览</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 动作识别 — 时空建模</h2>
        <div className="concept-card">
          <h3>🏃 动作识别模型体系</h3>
          <div className="code-block">
{`# 动作识别模型演进
"""
Two-Stream (2014)     → 光流 + RGB 双流网络
I3D (2017)            → 3D 卷积膨胀 (Inception → I3D)
SlowFast (2019)       → 双速率路径 (慢=语义, 快=运动)
TimeSformer (2021)    → 时空分离注意力
VideoMAE v2 (2023)    → 自监督视频预训练
InternVideo2 (2024)   → 多模态视频 Foundation Model
"""

import torch
from transformers import VideoMAEForVideoClassification, VideoMAEImageProcessor

# VideoMAE v2 动作识别
processor = VideoMAEImageProcessor.from_pretrained(
    "MCG-NJU/videomae-base-finetuned-kinetics"
)
model = VideoMAEForVideoClassification.from_pretrained(
    "MCG-NJU/videomae-base-finetuned-kinetics"
)

# 视频帧采样策略
def sample_frames(video_path, num_frames=16, strategy='uniform'):
    """均匀采样视频帧"""
    import cv2
    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if strategy == 'uniform':
        indices = np.linspace(0, total - 1, num_frames, dtype=int)
    elif strategy == 'random':
        indices = sorted(np.random.choice(total, num_frames, replace=False))
    
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    cap.release()
    return frames

frames = sample_frames('action_video.mp4', num_frames=16)
inputs = processor(frames, return_tensors="pt")
with torch.no_grad():
    outputs = model(**inputs)
    pred = outputs.logits.argmax(-1).item()
    print(f"Action: {model.config.id2label[pred]}")`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 目标跟踪 — ByteTrack / BoT-SORT</h2>
        <div className="concept-card">
          <h3>🎯 多目标跟踪 (MOT) 实战</h3>
          <div className="code-block">
{`from ultralytics import YOLO

# YOLOv10 + ByteTrack 多目标跟踪
model = YOLO('yolov10m.pt')

# 视频追踪
results = model.track(
    source='traffic.mp4',
    tracker='bytetrack.yaml',  # 或 'botsort.yaml'
    conf=0.3,
    iou=0.5,
    show=True,
    save=True
)

# 逐帧处理, 提取轨迹
tracks = {}
for r in results:
    if r.boxes.id is not None:
        for box, track_id, cls in zip(
            r.boxes.xyxy.cpu(),
            r.boxes.id.cpu().int(),
            r.boxes.cls.cpu().int()
        ):
            tid = track_id.item()
            if tid not in tracks:
                tracks[tid] = []
            tracks[tid].append({
                'frame': r.orig_shape,
                'bbox': box.tolist(),
                'class': model.names[cls.item()]
            })

# ByteTrack vs BoT-SORT vs DeepSort
"""
┌────────────┬──────────┬──────┬──────────────────┐
│ 跟踪器     │ MOTA     │ 速度  │ 特点             │
├────────────┼──────────┼──────┼──────────────────┤
│ DeepSORT   │ 中       │ 慢   │ ReID 特征匹配    │
│ ByteTrack  │ 高       │ 快   │ 无 ReID, 纯运动  │
│ BoT-SORT   │ 最高     │ 中   │ 运动 + 外观融合  │
│ StrongSORT │ 高       │ 慢   │ AFLink + 后处理  │
└────────────┴──────────┴──────┴──────────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 视频异常检测</h2>
        <div className="concept-card">
          <h3>⚠️ 异常检测方法体系</h3>
          <div className="code-block">
{`# 视频异常检测方法分类
"""
1. 重建型 (Reconstruction-based)
   └─ AutoEncoder / U-Net 学习正常模式 → 重建误差高 = 异常
   
2. 预测型 (Prediction-based)
   └─ 光流预测 / 帧预测 → 预测偏差 = 异常

3. 弱监督 (Weakly-supervised)
   └─ 视频级标签 + MIL (多实例学习) → 定位异常片段

4. CLIP-based (Zero-shot)
   └─ 文本描述正常/异常 → 零样本异常分类
"""

import torch
import torch.nn as nn

class AnomalyAutoEncoder(nn.Module):
    """基于重建的异常检测"""
    def __init__(self, channels=3):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(channels, 64, 3, stride=2, padding=1),
            nn.BatchNorm2d(64), nn.ReLU(),
            nn.Conv2d(64, 128, 3, stride=2, padding=1),
            nn.BatchNorm2d(128), nn.ReLU(),
            nn.Conv2d(128, 256, 3, stride=2, padding=1),
            nn.BatchNorm2d(256), nn.ReLU(),
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(256, 128, 3, stride=2, padding=1, output_padding=1),
            nn.BatchNorm2d(128), nn.ReLU(),
            nn.ConvTranspose2d(128, 64, 3, stride=2, padding=1, output_padding=1),
            nn.BatchNorm2d(64), nn.ReLU(),
            nn.ConvTranspose2d(64, channels, 3, stride=2, padding=1, output_padding=1),
            nn.Sigmoid(),
        )
    
    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded
    
    def anomaly_score(self, x):
        recon = self.forward(x)
        return torch.mean((x - recon) ** 2, dim=[1, 2, 3])

# 训练: 仅用正常视频帧
# 推理: 重建误差超过阈值 → 标记异常`}
          </div>
        </div>

        <div className="info-box">
          <h3>📋 异常检测应用场景</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>场景</th><th>异常类型</th><th>推荐方案</th></tr>
            </thead>
            <tbody>
              <tr><td>交通监控</td><td>逆行/事故/闯红灯</td><td>检测 + 规则引擎</td></tr>
              <tr><td>工厂车间</td><td>未戴安全帽/入侵</td><td>YOLO 检测 + 告警</td></tr>
              <tr><td>零售防损</td><td>盗窃行为/聚集</td><td>弱监督异常检测</td></tr>
              <tr><td>医疗手术</td><td>操作失误/器械遗留</td><td>动作识别 + 流程校验</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：OCR 与文档</span>
        <span className="nav-next">下一模块：人脸与人体 →</span>
      </div>
    </div>
  );
}
