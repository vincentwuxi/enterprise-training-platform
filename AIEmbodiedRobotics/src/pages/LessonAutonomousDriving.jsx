import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['BEV 感知', '端到端驾驶', '规划决策', '仿真测试'];

export default function LessonAutonomousDriving() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge blue">🚗 module_06 — 自动驾驶</div>
      <div className="fs-hero">
        <h1>自动驾驶：BEV 感知 / 端到端驾驶 / 规划决策 — 轮式具身智能</h1>
        <p>
          自动驾驶是具身智能最成熟的商业化方向。<strong>BEV 感知</strong>将多传感器
          融合到鸟瞰视角统一表示，<strong>端到端</strong>方法 (Tesla FSD v12 / Waymo EMMA)
          用大模型直接映射传感器输入到控制指令。本模块覆盖
          感知→预测→规划→控制的自动驾驶全栈。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🚗 自动驾驶</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🦅 BEV 感知</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> bev_perception</div>
              <pre className="fs-code">{`# BEV (Bird's Eye View) 感知: 自动驾驶感知革命

# ═══ 为什么 BEV? ═══
# 传统: 每个相机独立检测 → 后融合 → 不一致
# BEV: 多相机统一投影到鸟瞰视角 → 统一表示
# 优势: 尺度一致、遮挡推理、多传感器天然融合

# ═══ BEV 架构演进 ═══
bev_evolution = {
    "BEVDet (2022)": {
        "方法": "LSS (Lift-Splat-Shoot) 显式深度",
        "原理": "预测每个像素深度 → 提升到3D → 投影BEV",
    },
    "BEVFormer (2022)": {
        "方法": "Transformer 隐式投影",
        "原理": "BEV Query → 交叉注意力 → 多相机特征",
        "特色": "时序融合, 无需显式深度",
    },
    "StreamPETR (2023)": {
        "方法": "稀疏 Query 3D 检测",
        "优势": "高效, 实时 (30fps+)",
    },
    "UniAD (2023)": {
        "方法": "感知-预测-规划 统一框架",
        "意义": "首个端到端统一方案 (学术)",
    },
}

# ═══ BEVFormer 核心原理 ═══
# 输入: 6 个环视相机图像 (前/后/左/右/前左/前右)
# 输出: BEV 特征图 (200×200, 覆盖100m×100m)

# 伪代码:
class BEVFormer:
    def __init__(self):
        self.backbone = ResNet101()  # 图像特征提取
        self.bev_queries = nn.Embedding(200*200, 256)
        self.temporal_self_attn = TemporalSelfAttention()
        self.spatial_cross_attn = SpatialCrossAttention()
        
    def forward(self, multi_cam_images, prev_bev=None):
        # 1. 提取多相机图像特征
        features = [self.backbone(img) for img in multi_cam_images]
        
        # 2. BEV Query 初始化
        bev_queries = self.bev_queries.weight  # (200*200, 256)
        
        # 3. 时序自注意力 (利用历史 BEV)
        if prev_bev is not None:
            bev_queries = self.temporal_self_attn(
                bev_queries, prev_bev
            )
        
        # 4. 空间交叉注意力 (从多相机采样)
        bev_features = self.spatial_cross_attn(
            query=bev_queries,
            key=features,      # 6个相机的特征
            reference_points=bev_3d_points,  # 3D 参考点
            camera_params=intrinsics_extrinsics,
        )
        
        return bev_features  # (200, 200, 256)

# ═══ BEV 上的多任务 ═══
# BEV 特征 → 3D 检测 (车/人/自行车)
#           → 地图分割 (车道线/人行道)
#           → 运动预测 (未来轨迹)
#           → 占据预测 (3D 占据网格)

# ═══ 占据网络 (Occ) ═══
# 3D 空间每个体素: 是否被占据 + 语义类别
# 优势: 可表示任意形状障碍物 (不限于bbox)
# Tesla FSD 使用占据网络做感知`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 端到端驾驶</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> end_to_end</div>
              <pre className="fs-code">{`# 端到端自动驾驶: 感知器→控制的革命

# ═══ 模块化 vs 端到端 ═══
# 模块化: 感知 → 预测 → 决策 → 规划 → 控制
#   优势: 可解释, 可调试, 人类专家知识
#   劣势: 误差累积, 信息损失, 手工设计瓶颈
#
# 端到端: 传感器 → [神经网络] → 控制指令
#   优势: 全局优化, 无信息损失, 可学习
#   劣势: 可解释性差, 长尾问题, 安全验证难

# ═══ Tesla FSD v12 ═══
tesla_fsd_v12 = {
    "架构": "端到端 (摄像头→控制)",
    "输入": "8 个摄像头 + 历史帧",
    "输出": "方向盘/油门/刹车 控制指令",
    "训练数据": "数百万段人类驾驶视频",
    "方法": "模仿学习 (Behavior Cloning)",
    "关键突破": [
        "移除 30万行 C++ 规则代码",
        "用神经网络替代所有规则",
        "驾驶行为更自然 (像人类)",
        "处理长尾场景能力更强",
    ],
}

# ═══ Waymo EMMA (2024) ═══
waymo_emma = {
    "全名": "End-to-End Multimodal Model for AD",
    "核心": "用 Gemini 多模态模型做驾驶",
    "输入": "多相机图像 + 导航指令 (文本)",
    "输出": "规划轨迹 + 场景理解 (文本)",
    "特色": [
        "统一多模态理解",
        "可以用语言解释决策",
        "零样本泛化新场景",
    ],
}

# ═══ 模仿学习 ═══
# 从人类驾驶行为中学习

# 行为克隆 (Behavior Cloning)
import torch
import torch.nn as nn

class DrivingPolicy(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = ViT_Large()
        self.temporal = TransformerEncoder(num_layers=6)
        self.planning_head = MLP([768, 256, 2*T])  # T个未来点(x,y)
        
    def forward(self, images, history):
        # 提取视觉特征
        features = self.backbone(images)  # 多相机
        
        # 时序建模
        features = self.temporal(features, history)
        
        # 预测未来轨迹 (3秒, 15个点)
        trajectory = self.planning_head(features)
        return trajectory.reshape(-1, 15, 2)

# 训练: 最小化预测轨迹与人类轨迹的 L2 距离
loss = F.l1_loss(pred_trajectory, human_trajectory)

# ═══ 挑战 ═══
challenges = {
    "分布偏移":    "训练数据=正常驾驶, 测试=罕见场景",
    "因果混淆":    "模型可能学到虚假相关性",
    "安全保证":    "无法形式化验证神经网络",
    "责任归属":    "出事故谁负责?",
    "监管合规":    "各国法规不同",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧭 规划决策</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> planning</div>
              <pre className="fs-code">{`# 规划与决策: 安全且高效的驾驶行为

# ═══ 决策层级 ═══
# 路径规划 (全局): A→B 的路线 (导航级, 秒级)
# 行为规划 (中层): 换道/跟车/超车 (决策级, 100ms级)
# 运动规划 (局部): 具体轨迹 (控制级, 10ms级)

# ═══ 行为规划 ═══
behavior_planning = {
    "有限状态机 (FSM)": {
        "状态": ["跟车", "换道", "停车", "让行", "超车"],
        "转换": "基于规则的条件判断",
        "优势": "直觉, 可解释",
        "劣势": "状态爆炸, 难以覆盖所有场景",
    },
    "MPDM (策略树)": {
        "方法": "穷举所有可能策略→仿真评估→选最优",
        "策略": "跟车/加速/减速/换道左/换道右",
        "评估": "安全性+效率+舒适性",
    },
    "学习决策": {
        "方法": "强化学习 / 模仿学习",
        "输入": "周围车辆状态 + 道路信息",
        "输出": "高层决策 (跟车/换道等)",
    },
}

# ═══ 运动规划 ═══
# 生成安全、平滑、可执行的轨迹

# 方法 1: 采样规划 (Lattice Planner)
lattice_planner = {
    "步骤": [
        "1. 采样终端状态 (横向位移 × 纵向速度)",
        "2. 多项式连接 (5次多项式)",
        "3. 碰撞检查 (与障碍物)",
        "4. 评估打分 (安全+舒适+效率)",
        "5. 选择最优轨迹",
    ],
    "优势": "实时性好, 工程成熟",
    "用户": "Apollo, Autoware",
}

# 方法 2: 优化规划
# min  Σ (加速度² + 转向率² + 偏差²)
# s.t. 不碰撞, 在车道内, 速度限制
import numpy as np
from scipy.optimize import minimize

def trajectory_cost(params):
    traj = params_to_trajectory(params)
    cost = 0
    cost += w_smooth * smoothness(traj)     # 平滑性
    cost += w_safety * collision_cost(traj)  # 安全性
    cost += w_lane   * lane_deviation(traj)  # 车道偏差
    cost += w_speed  * speed_cost(traj)      # 速度偏差
    return cost

result = minimize(trajectory_cost, x0, method='SLSQP')

# ═══ 安全机制 ═══
safety_mechanisms = {
    "RSS (Intel)":     "数学定义安全距离, 兜底",
    "Safety Cage":     "硬约束: 超出安全范围→紧急制动",
    "Fallback Policy": "AI 失败→切换简单安全策略",
    "冗余感知":        "多传感器交叉验证",
    "V2X 通信":        "车车/车路通信预警",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧪 仿真测试</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> simulation_testing</div>
              <pre className="fs-code">{`# 自动驾驶仿真测试: 在虚拟世界验证安全

# ═══ 为什么需要仿真? ═══
# 真实路测: 100亿英里 才能统计证明L4安全
# 仿真测试: 可以快速覆盖 万亿场景
# NVIDIA: "每一英里真实路测, 需要100万英里仿真"

# ═══ 仿真平台 ═══
simulation_platforms = {
    "CARLA (开源)": {
        "引擎": "Unreal Engine 4/5",
        "特色": "学术研究标准, 传感器丰富",
        "用途": "算法开发/学术研究",
    },
    "NVIDIA DRIVE Sim": {
        "引擎": "Omniverse (光线追踪)",
        "特色": "物理级别真实, 传感器精确",
        "用途": "工业级仿真验证",
    },
    "Waymo SimCity": {
        "特色": "从真实数据重建场景",
        "方法": "NeRF/3DGS 重建 + 编辑",
    },
    "Waymax (JAX)": {
        "特色": "GPU 加速, 批量仿真",
        "速度": "100K+ scenarios/秒",
    },
}

# ═══ CARLA 使用示例 ═══
import carla

# 连接仿真器
client = carla.Client('localhost', 2000)
world = client.get_world()

# 设置天气
weather = carla.WeatherParameters(
    cloudiness=80.0,
    precipitation=60.0,
    sun_altitude_angle=70.0,
)
world.set_weather(weather)

# 生成自车
bp = world.get_blueprint_library().find('vehicle.tesla.model3')
spawn_point = world.get_map().get_spawn_points()[0]
ego_vehicle = world.spawn_actor(bp, spawn_point)

# 添加传感器
camera_bp = world.get_blueprint_library().find('sensor.camera.rgb')
camera_bp.set_attribute('image_size_x', '1920')
camera_bp.set_attribute('image_size_y', '1080')
camera = world.spawn_actor(camera_bp, 
    carla.Transform(carla.Location(x=1.5, z=2.4)),
    attach_to=ego_vehicle)

lidar_bp = world.get_blueprint_library().find('sensor.lidar.ray_cast')
lidar_bp.set_attribute('channels', '128')
lidar_bp.set_attribute('range', '100')
lidar = world.spawn_actor(lidar_bp,
    carla.Transform(carla.Location(z=2.5)),
    attach_to=ego_vehicle)

# ═══ 场景生成 ═══
# 关键: 测试长尾/危险场景
scenario_categories = {
    "正常驾驶":   "跟车/换道/转弯/并道",
    "交通参与者":  "行人横穿/自行车/三轮车",
    "极端天气":    "暴雨/大雾/暴雪/强光",
    "施工区域":    "临时车道/锥桶/施工车辆",
    "紧急情况":    "前车急刹/掉落物/逆行",
    "特殊场景":    "隧道/环岛/无保护左转",
}

# 用 LLM 生成测试场景 (新趋势)
# "生成一个行人从公交车后突然跑出的场景"
# → LLM 转换为 CARLA/OpenSCENARIO 配置`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
