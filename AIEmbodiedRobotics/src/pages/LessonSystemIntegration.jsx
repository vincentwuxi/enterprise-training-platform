import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['ROS 2 + AI', '实时控制', '安全认证', '部署运维'];

export default function LessonSystemIntegration() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge red">🔧 module_08 — 系统集成</div>
      <div className="fs-hero">
        <h1>系统集成：ROS 2 + AI / 安全认证 / 实时控制 / 部署运维 — 机器人产品化</h1>
        <p>
          从实验室到产品，系统集成是最后一道关卡。<strong>ROS 2</strong> 提供标准化的
          机器人中间件，<strong>实时控制</strong>保证毫秒级响应，
          <strong>安全认证</strong> (ISO 13482/CE) 确保合规上市。
          本模块覆盖机器人系统工程的完整实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔧 系统集成</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🤖 ROS 2 + AI</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> ros2_ai</div>
              <pre className="fs-code">{`# ROS 2 + AI: 机器人操作系统与智能融合

# ═══ ROS 2 核心概念 ═══
ros2_concepts = {
    "节点 (Node)":      "最小计算单元 (感知/规划/控制)",
    "话题 (Topic)":     "发布/订阅异步通信",
    "服务 (Service)":   "同步请求/响应",
    "动作 (Action)":    "长时间任务 (含反馈)",
    "参数 (Parameter)": "运行时配置",
    "启动 (Launch)":    "多节点批量启动",
}

# ═══ AI 感知节点 ═══
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2
from vision_msgs.msg import Detection3DArray
import tensorrt as trt

class AIPerceptionNode(Node):
    """TensorRT 加速的 3D 目标检测节点"""
    
    def __init__(self):
        super().__init__('ai_perception')
        
        # 加载 TensorRT 引擎
        self.engine = self.load_engine('yolov8_3d.engine')
        
        # 订阅传感器
        self.img_sub = self.create_subscription(
            Image, '/camera/color/image_raw',
            self.image_callback, 10
        )
        self.depth_sub = self.create_subscription(
            Image, '/camera/depth/image_rect_raw',
            self.depth_callback, 10
        )
        
        # 发布检测结果
        self.det_pub = self.create_publisher(
            Detection3DArray, '/perception/detections_3d', 10
        )
        
        self.get_logger().info('AI Perception Node started')
        
    def image_callback(self, msg):
        # 图像 → TensorRT 推理
        image = self.bridge.imgmsg_to_cv2(msg)
        detections = self.engine.infer(image)  # <10ms
        
        # 2D → 3D (结合深度)
        det_3d = self.lift_to_3d(detections, self.depth)
        
        # 发布 3D 检测
        det_msg = self.to_ros_msg(det_3d)
        self.det_pub.publish(det_msg)

# ═══ AI 决策节点 ═══
class AIDecisionNode(Node):
    """基础模型驱动的任务规划节点"""
    
    def __init__(self):
        super().__init__('ai_decision')
        
        # 订阅感知结果
        self.det_sub = self.create_subscription(
            Detection3DArray, '/perception/detections_3d',
            self.perception_callback, 10
        )
        
        # 订阅语言指令
        self.cmd_sub = self.create_subscription(
            String, '/user/command',
            self.command_callback, 10
        )
        
        # 发布动作指令
        self.action_pub = self.create_publisher(
            JointTrajectory, '/arm_controller/command', 10
        )
        
        # 加载可选 VLA 模型
        self.vla_model = load_octo_model()
        
    def command_callback(self, msg):
        # 自然语言 → 机器人动作
        action = self.vla_model.predict(
            image=self.current_image,
            instruction=msg.data
        )
        self.execute_action(action)

# ═══ 启动文件 ═══
# ros2 launch robot_ai full_stack.launch.py
# → 同时启动: 感知 + 决策 + 控制 + 硬件驱动`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⏱️ 实时控制</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> realtime_control</div>
              <pre className="fs-code">{`# 实时控制: 毫秒级确定性响应

# ═══ 实时要求 ═══
# 运动控制:  1 kHz (1ms 周期) — 硬实时
# 力控制:    1-10 kHz — 硬实时
# 感知处理:  30-100 Hz — 软实时
# AI 推理:   10-50 Hz — 软实时

# ═══ 实时操作系统 ═══
realtime_os = {
    "PREEMPT_RT Linux": {
        "类型": "Linux 实时补丁",
        "延迟": "<50μs (最坏情况)",
        "用途": "大多数机器人",
        "ROS2": "完全兼容",
    },
    "Xenomai": {
        "类型": "Linux 双内核实时",
        "延迟": "<10μs",
        "用途": "极端实时要求",
    },
    "QNX": {
        "类型": "商业 RTOS",
        "延迟": "<5μs",
        "用途": "汽车/医疗/军工",
    },
}

# ═══ ROS 2 实时控制 ═══
# ros2_control: 实时控制框架
# Controller Manager → 实时线程
# Hardware Interface → 直接硬件通信

# 控制器配置 (YAML)
controller_config = """
controller_manager:
  ros__parameters:
    update_rate: 1000  # 1kHz
    
    joint_trajectory_controller:
      type: joint_trajectory_controller/JointTrajectoryController
      joints: [joint1, joint2, joint3, joint4, joint5, joint6]
      
    effort_controller:
      type: effort_controllers/JointGroupEffortController
      joints: [joint1, joint2, joint3, joint4, joint5, joint6]
"""

# ═══ 实时控制循环 ═══
class RealtimeController:
    """1kHz 实时关节控制器"""
    
    def __init__(self):
        self.kp = np.array([200, 200, 100, 100, 50, 50])
        self.kd = np.array([10, 10, 5, 5, 2, 2])
        
    def update(self, q_target, q_current, qdot_current):
        """PD 力矩控制 (每1ms调用)"""
        error = q_target - q_current
        torque = self.kp * error - self.kd * qdot_current
        
        # 力矩限制 (安全)
        torque = np.clip(torque, -self.max_torque, self.max_torque)
        return torque

# ═══ 通信协议 ═══
comm_protocols = {
    "EtherCAT": {
        "延迟": "<1ms",
        "用途": "工业机器人标准",
        "特色": "确定性, 同步多轴",
    },
    "CAN/CANopen": {
        "延迟": "~1ms",
        "用途": "关节电机通信",
        "特色": "简单可靠, 成本低",
    },
    "RS485": {
        "延迟": "~2ms",
        "用途": "舵机/简单关节",
        "特色": "最低成本",
    },
}

# ═══ AI + 实时控制的分层 ═══
# ┌─────────────────────────────────┐
# │ AI 层 (10-50Hz, GPU, 非实时)   │
# │ VLA/感知/规划 → 目标轨迹       │
# ├─────────────────────────────────┤
# │ 控制层 (1kHz, CPU, 硬实时)     │
# │ PD控制/力控制 → 关节力矩       │
# ├─────────────────────────────────┤
# │ 硬件层 (驱动器内, >10kHz)      │
# │ 电流环/FOC 控制                │
# └─────────────────────────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🛡️ 安全认证</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> safety_certification</div>
              <pre className="fs-code">{`# 机器人安全认证: 产品化的合规门槛

# ═══ 关键安全标准 ═══
safety_standards = {
    "ISO 10218": {
        "适用": "工业机器人",
        "要求": "安全停止/速度限制/力限制",
        "必须": "CE 标志 (欧洲), 必须遵守",
    },
    "ISO/TS 15066": {
        "适用": "协作机器人 (人机共存)",
        "核心": "碰撞力/压力限值",
        "阈值": {
            "瞬态接触力": "最大 150N (手部)",
            "准静态压力": "最大 140 N/cm²",
        },
    },
    "ISO 13482": {
        "适用": "服务机器人/人形机器人",
        "要求": "个人护理机器人安全",
        "内容": "移动/操作/载人 安全",
    },
    "UL 3100 (美国)": {
        "适用": "服务机器人",
        "特色": "美国市场准入",
    },
}

# ═══ 功能安全 (ISO 13849) ═══
# 性能等级 (PL): a, b, c, d, e
# 人形机器人通常需要: PL d 或 PL e
functional_safety = {
    "PL a": "低风险 (工业围栏内)",
    "PL b": "中低风险",
    "PL c": "中风险 (限速协作)",
    "PL d": "中高风险 (人机接触)",
    "PL e": "高风险 (医疗/载人)",
}

# ═══ 安全设计原则 ═══
safety_design = {
    "碰撞检测": {
        "方法": "关节力矩监测 → 外力估计",
        "阈值": "超过阈值 → 立即停止",
        "延迟": "<10ms 停止响应",
    },
    "速度/力限制": {
        "速度": "人机交互区 <250mm/s",
        "力":   "接触力 <150N",
        "功率": "碰撞功率 <80W",
    },
    "紧急停止": {
        "E-Stop": "物理急停按钮 (必须)",
        "软停":   "语音/手势急停",
        "自检":   "启动时自检所有安全功能",
    },
    "冗余设计": {
        "双编码器": "关节位置双重验证",
        "看门狗":   "控制器超时检测",
        "通信冗余": "双总线通信",
    },
}

# ═══ AI 安全特殊考虑 ═══
ai_safety = {
    "不确定性估计": "AI 不确定时→减速/停止",
    "OOD 检测":    "超出训练分布的输入→告警",
    "安全笼":       "Neural network 外层加约束",
    "可解释性":     "决策可追溯/可审计",
    "故障模式":     "AI 失效→切换到安全模式",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🚀 部署运维</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> deployment_ops</div>
              <pre className="fs-code">{`# 机器人部署与运维: 从1台到10000台

# ═══ 部署架构 ═══
# ┌──────────────┐     ┌───────────────┐
# │  云端平台     │ ←→  │  机器人集群    │
# │              │     │               │
# │ - 模型训练   │     │ - Jetson 边缘  │
# │ - 数据收集   │     │ - ROS 2 节点   │
# │ - 远程监控   │     │ - TensorRT     │
# │ - OTA 更新   │     │ - 实时控制     │
# │ - 分析仪表盘 │     │ - 传感器驱动   │
# └──────────────┘     └───────────────┘

# ═══ 机器人 Fleet 管理 ═══
fleet_management = {
    "设备注册":   "每台机器人唯一 ID + 证书",
    "状态监控":   "实时上报 电池/温度/故障码",
    "远程诊断":   "SSH/VPN 远程 ROS 2 introspection",
    "OTA 更新":   "差分更新 AI 模型 + ROS 节点",
    "数据回传":   "选择性上传 日志/传感器数据",
    "任务调度":   "云端分配任务给特定机器人",
}

# ═══ Docker + ROS 2 部署 ═══
dockerfile = """
# 多阶段构建: 编译 + 运行分离
FROM ros:humble AS builder
WORKDIR /ros_ws
COPY src/ src/
RUN colcon build --cmake-args -DCMAKE_BUILD_TYPE=Release

FROM ros:humble-ros-base
COPY --from=builder /ros_ws/install /ros_ws/install
COPY models/ /models/

# 环境变量
ENV ROS_DOMAIN_ID=42
ENV FASTRTPS_DEFAULT_PROFILES_FILE=/config/fastdds.xml

ENTRYPOINT ["ros2", "launch", "robot_bringup", "full.launch.py"]
"""

# ═══ 数据闭环 (Data Flywheel) ═══
# 机器人部署 → 收集数据 → 改进模型 → 更新部署
data_flywheel = {
    "第1步": "机器人执行任务, 记录传感器数据",
    "第2步": "标注失败/异常场景 (自动+人工)",
    "第3步": "云端重新训练/微调模型",
    "第4步": "仿真验证 → OTA 推送",
    "第5步": "A/B 测试 → 全量更新",
    "循环":  "每周/每月迭代",
}

# ═══ 监控与可观测性 ═══
observability = {
    "Prometheus + Grafana": {
        "指标": "CPU/GPU/内存/温度/电池",
        "延迟": "各节点处理延迟",
        "成功率": "任务成功/失败率",
    },
    "ROS 2 Bag + S3": {
        "记录": "关键传感器数据",
        "存储": "云端 S3/OSS",
        "用途": "故障回放/训练数据",
    },
    "告警": {
        "温度过高": ">70°C → 降频",
        "电池低电量": "<20% → 自动返回充电",
        "碰撞检测": "外力异常 → 停止+告警",
        "AI 置信度低": "<0.5 → 请求人工接管",
    },
}

# ═══ 商业化路径 ═══
commercialization = {
    "2024-2025": "工厂/仓库 定点固定任务",
    "2025-2026": "工厂 移动操作 (搬运/检查)",
    "2026-2027": "商业服务 (酒店/餐厅/医院)",
    "2028-2030": "家庭服务 (通用家务)",
    "2030+":     "通用人形机器人",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
