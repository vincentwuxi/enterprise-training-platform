import React from 'react';
import './LessonCommon.css';

export default function LessonFaceBody() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">🧑 模块六：人脸与人体 — 人脸检测 / 人体姿态 / ReID / 隐私合规</h1>
      <p className="lesson-subtitle">
        从生物特征识别到隐私合规，掌握人脸人体技术的工程与伦理边界
      </p>

      <section className="lesson-section">
        <h2>1. 人脸检测与识别</h2>
        <div className="info-box">
          <h3>🏗️ 人脸处理管线</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>任务</th><th>主流方案</th></tr>
            </thead>
            <tbody>
              <tr><td>人脸检测</td><td>定位人脸位置</td><td>RetinaFace / SCRFD / YOLOv8-Face</td></tr>
              <tr><td>人脸对齐</td><td>5 点关键点对齐</td><td>仿射变换 → 112×112</td></tr>
              <tr><td>人脸识别</td><td>特征提取 + 比对</td><td>ArcFace / CosFace / InsightFace</td></tr>
              <tr><td>活体检测</td><td>防照片/视频攻击</td><td>深度估计 / 红外 / 动作验证</td></tr>
              <tr><td>人脸属性</td><td>年龄/性别/表情</td><td>多任务分类网络</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>🔥 InsightFace 实战</h3>
          <div className="code-block">
{`import insightface
from insightface.app import FaceAnalysis
import cv2

# 初始化人脸分析引擎
app = FaceAnalysis(
    name='buffalo_l',           # 模型包: buffalo_l/s/sc
    providers=['CUDAExecutionProvider']
)
app.prepare(ctx_id=0, det_size=(640, 640))

# 人脸检测 + 识别 + 属性
img = cv2.imread('group_photo.jpg')
faces = app.get(img)

for face in faces:
    bbox = face.bbox.astype(int)         # [x1, y1, x2, y2]
    landmark = face.kps                   # 5 个关键点
    embedding = face.embedding            # 512D 特征向量
    age = face.age                        # 估计年龄
    gender = 'M' if face.gender == 1 else 'F'
    det_score = face.det_score            # 检测置信度
    
    print(f"Age: {age}, Gender: {gender}, Score: {det_score:.3f}")

# 人脸比对 (1:1 验证)
import numpy as np
from numpy.linalg import norm

def cosine_similarity(feat1, feat2):
    return np.dot(feat1, feat2) / (norm(feat1) * norm(feat2))

sim = cosine_similarity(faces[0].embedding, faces[1].embedding)
is_same = sim > 0.4  # 阈值通常 0.3-0.5

# 人脸库检索 (1:N 识别)
import faiss

# 构建人脸特征索引
dimension = 512
index = faiss.IndexFlatIP(dimension)  # 内积检索
faiss.normalize_L2(face_embeddings)   # L2 归一化
index.add(face_embeddings)            # 添加到索引

# 检索
query = face.embedding.reshape(1, -1)
faiss.normalize_L2(query)
scores, indices = index.search(query, k=5)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. 人体姿态估计</h2>
        <div className="concept-card">
          <h3>🦴 姿态估计模型对比</h3>
          <div className="code-block">
{`# 姿态估计方法
"""
Top-Down (自顶向下):
  先检测人 → 逐人估计关键点
  代表: HRNet, ViTPose, RTMPose
  优点: 精度高, 适合遮挡场景
  缺点: 速度随人数线性增长

Bottom-Up (自底向上):
  先检测所有关键点 → 分组到人
  代表: OpenPose, DEKR, CID
  优点: 速度与人数无关
  缺点: 精度略低, 分组困难

COCO 17 关键点:
  鼻 / 左眼 / 右眼 / 左耳 / 右耳
  左肩 / 右肩 / 左肘 / 右肘
  左腕 / 右腕 / 左髋 / 右髋
  左膝 / 右膝 / 左踝 / 右踝
"""

# RTMPose — 实时高精度姿态 (MMPose)
from mmpose.apis import MMPoseInferencer

inferencer = MMPoseInferencer(
    pose2d='rtmpose-l',          # 模型大小: t/s/m/l
    det_model='rtmdet-m'          # 人体检测器
)

# 推理
result = next(inferencer('test_person.jpg', show=True))
predictions = result['predictions'][0]

for person in predictions:
    keypoints = person['keypoints']      # (17, 2) 坐标
    scores = person['keypoint_scores']   # (17,) 置信度
    bbox = person['bbox']                # 检测框
    
# 动作分析: 基于关键点的规则引擎
def is_raising_hand(keypoints, scores, threshold=0.5):
    """判断是否举手"""
    if scores[9] < threshold or scores[5] < threshold:
        return False
    wrist_y = keypoints[9][1]      # 左腕 y
    shoulder_y = keypoints[5][1]   # 左肩 y
    return wrist_y < shoulder_y    # y 坐标向下, 手高于肩`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 行人重识别 (ReID)</h2>
        <div className="concept-card">
          <h3>🔍 ReID 技术体系</h3>
          <div className="code-block">
{`# ReID: 跨摄像头行人匹配
"""
核心挑战:
- 跨视角: 同一人不同角度外观差异大
- 光照变化: 室内外/白天夜晚
- 遮挡: 部分身体被遮挡
- 换装: 长期跟踪中衣着变化

解决方案:
1. 全局特征: ResNet / ViT → 全局描述
2. 局部特征: 水平切分 → 部件对齐
3. 注意力: Transformer 自适应区域加权
4. 跨模态: 文本描述 → 人物检索
"""

import torchreid

# 使用 torchreid 库
datamanager = torchreid.data.ImageDataManager(
    root='reid-data',
    sources='market1501',        # 主流 ReID 数据集
    targets='market1501',
    height=256, width=128,       # 行人标准尺寸
    batch_size_train=32,
    transforms=['resize', 'random_flip', 'random_erasing']
)

model = torchreid.models.build_model(
    name='osnet_x1_0',           # 轻量级 ReID 网络
    num_classes=datamanager.num_train_pids,
    loss='softmax',
    pretrained=True
)

# ReID 评估指标
"""
Rank-1: 首位匹配正确率 (最重要)
Rank-5: 前5位包含正确匹配的概率
mAP:    考虑所有正确匹配的平均精度
CMC:    累积匹配曲线
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 隐私合规与伦理</h2>
        <div className="info-box">
          <h3>⚖️ 人脸识别法规框架</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>地区/法规</th><th>核心要求</th><th>违规后果</th></tr>
            </thead>
            <tbody>
              <tr><td>GDPR (欧盟)</td><td>人脸数据为敏感生物识别数据, 需明确同意</td><td>最高 2000 万欧元 / 4% 营收</td></tr>
              <tr><td>个人信息保护法 (中国)</td><td>收集人脸须单独告知+同意, 不得强制</td><td>最高 5000 万元 / 5% 营收</td></tr>
              <tr><td>BIPA (美国伊利诺伊)</td><td>收集生物识别前须书面同意</td><td>$1000-$5000/次 私诉权</td></tr>
              <tr><td>《人脸识别规定》(中国)</td><td>公共场所须标识, 不得用于画像分析</td><td>行政处罚 + 民事赔偿</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>🔒 隐私保护技术方案</h3>
          <div className="code-block">
{`# 隐私保护实践
privacy_solutions = {
    "人脸模糊":       "实时模糊非授权人脸 (Gaussian Blur)",
    "差分隐私":       "训练时添加噪声, 防止模型泄露个体信息",
    "联邦学习":       "数据不出本地, 只交换模型梯度",
    "特征加密":       "同态加密人脸特征, 密文比对",
    "本地化处理":     "NPU 端侧推理, 数据不上云",
    "可撤销模板":     "特征可销毁/更新, 避免永久泄露",
}

# 人脸去标识化 (De-identification)
import cv2
def blur_faces(image, faces, blur_strength=99):
    """模糊图像中的所有人脸"""
    for face in faces:
        x1, y1, x2, y2 = face.bbox.astype(int)
        roi = image[y1:y2, x1:x2]
        blurred = cv2.GaussianBlur(roi, (blur_strength, blur_strength), 0)
        image[y1:y2, x1:x2] = blurred
    return image

# 合规检查清单
compliance_checklist = [
    "✅ 数据收集前获得用户明确同意",
    "✅ 告知数据用途、存储期限、共享范围",
    "✅ 提供用户数据删除机制",
    "✅ 数据存储加密, 访问日志审计",
    "✅ 定期进行安全评估和偏见审计",
    "✅ 设置数据保存期限, 到期自动删除",
]`}
          </div>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：视频分析</span>
        <span className="nav-next">下一模块：工业视觉 →</span>
      </div>
    </div>
  );
}
