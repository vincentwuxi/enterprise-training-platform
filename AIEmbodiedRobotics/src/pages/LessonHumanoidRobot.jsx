import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['步态控制', '灵巧操作', '双臂协调', '感知融合'];

export default function LessonHumanoidRobot() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🦾 module_07 — 人形机器人</div>
      <div className="fs-hero">
        <h1>人形机器人：步态控制 / 灵巧操作 / 双臂协调 — 具身智能的终极形态</h1>
        <p>
          人形机器人是具身 AI 的终极挑战：<strong>双足行走</strong>需要实时平衡控制，
          <strong>灵巧手</strong>需要精细力控制，<strong>全身协调</strong>需要多模态感知融合。
          Tesla Optimus、Figure 02、宇树 H1/G1 正在将这些技术推向量产。
          本模块深入人形机器人的核心技术栈。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦾 人形机器人</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🚶 步态控制</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> locomotion</div>
              <pre className="fs-code">{`# 人形步态控制: 从站立到跑步

# ═══ 双足行走的挑战 ═══
# 1. 天然不稳定: 处于倒立摆状态 (随时会倒)
# 2. 混合动力学: 单/双支撑相切换 (接触变化)
# 3. 高自由度: 每条腿 6-7 个关节, 共 12-14 DoF
# 4. 实时性: 控制频率 500-1000 Hz

# ═══ 传统方法: ZMP (零力矩点) ═══
# ZMP 在支撑多边形内 → 稳定
# 缺点: 保守, 步态不自然, 难以处理推扰

# ═══ 现代方法: RL 学习步态 ═══
# 在仿真中用 RL 学习行走策略 → Sim-to-Real
# 成功案例: 宇树 H1, Agility Digit, ETH ANYmal

# 观察空间
observation_space = {
    "本体感知": {
        "关节位置":   "(12,) 各关节角度",
        "关节速度":   "(12,) 各关节角速度",
        "IMU":        "(6,) 角速度+加速度",
        "基座朝向":   "(3,) Roll/Pitch/Yaw",
    },
    "指令": {
        "目标速度":   "(3,) vx, vy, ω (前进/侧移/转向)",
    },
    "历史": {
        "上一动作":   "(12,) 上一步的关节指令",
    },
}

# 动作空间
action_space = {
    "输出":    "(12,) 目标关节位置 (PD控制器跟踪)",
    "控制频率": "50 Hz (策略) → PD 控制器 1000Hz",
}

# 奖励设计 (关键!)
reward_function = {
    "速度跟踪":    "+w1 * exp(-||v - v_cmd||²)",
    "存活奖励":    "+w2 * (没有摔倒)",
    "动作平滑":    "-w3 * ||a_t - a_{t-1}||²",
    "能量惩罚":    "-w4 * Σ|τ * q̇|",
    "脚接触":     "+w5 * 正确的脚接地模式",
    "躯干姿态":   "-w6 * |pitch| + |roll|",
    "关节限位":    "-w7 * 超出限位惩罚",
}

# ═══ 课程学习 (Curriculum) ═══
# 逐步增加难度
curriculum = {
    "阶段1": "平地站立 → 平地行走",
    "阶段2": "平地行走 → 变速行走",
    "阶段3": "变速 → 崎岖地形 (随机高度)",
    "阶段4": "崎岖 → 楼梯/斜坡",
    "阶段5": "添加随机推力扰动",
    "阶段6": "添加地面摩擦随机化",
}

# ═══ 训练配置 (Isaac Lab) ═══
training_config = {
    "并行环境": 4096,
    "算法":     "PPO",
    "GPU":      "RTX 4090",
    "训练时间": "4-12 小时",
    "结果":     "平地行走 + 楼梯 + 抗推",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🤲 灵巧操作</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> dexterous</div>
              <pre className="fs-code">{`# 灵巧操作: 人形机器人的手

# ═══ 灵巧手硬件 ═══
dexterous_hands = {
    "Shadow Hand": {
        "自由度": "24 DoF (最接近人手)",
        "传感器": "触觉 + 关节编码器",
        "价格":   "~$100K+ (研究用)",
    },
    "LEAP Hand": {
        "自由度": "16 DoF",
        "特色":   "低成本 (~$2K)",
        "驱动":   "电机直驱",
    },
    "Allegro Hand": {
        "自由度": "16 DoF",
        "特色":   "商业化, RL 社区常用",
    },
    "Tesla Optimus 手": {
        "自由度": "11 DoF",
        "特色":   "为量产优化, 力传感器",
    },
}

# ═══ 灵巧操作任务 ═══
manipulation_tasks = {
    "基础": {
        "抓取":     "Power grasp / Precision grasp",
        "放置":     "精确放到目标位置",
        "推/拉":    "非抓取操作",
    },
    "中级": {
        "工具使用": "锤子/螺丝刀/钥匙",
        "插入":     "USB/钥匙孔 (精度要求高)",
        "翻转":     "手内物体翻转",
    },
    "高级": {
        "柔性物体": "叠衣服/系绳子/折纸",
        "双手协调": "拧瓶盖/撕包装",
        "力敏感":   "鸡蛋/玻璃杯 (不能碎)",
    },
}

# ═══ 学习灵巧操作 ═══
# 方法 1: RL + 仿真
# 在 Isaac Sim 中训练灵巧手操作
observation = {
    "手指关节":    "(16,) 关节位置",
    "手指速度":    "(16,) 关节速度",
    "物体位姿":    "(7,) 位置+四元数",
    "物体速度":    "(6,) 线速度+角速度",
    "目标位姿":    "(7,) 目标位姿",
    "触觉信息":    "(N,) 接触力",
}

# 方法 2: 遥操作 + 模仿学习
# 人类遥操作 → 收集演示数据 → 训练策略
# 遥操作设备:
teleop_devices = {
    "VR 手套":    "Meta Quest + 手指追踪",
    "GELLO":      "低成本机械臂遥操作",
    "AnyTeleop":  "视觉手势→机器人映射",
    "Apple Vision Pro": "手部追踪→灵巧手",
}

# 方法 3: Diffusion Policy (扩散策略)
# 用扩散模型生成动作序列!
diffusion_policy = {
    "输入": "视觉观察 + 本体感知",
    "输出": "未来 T 步动作序列",
    "优势": "多模态动作分布 (多种抓取方式)",
    "论文": "Diffusion Policy (Columbia/Toyota)",
    "效果": "SOTA on 多种操作任务",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🤖 双臂协调</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> bimanual</div>
              <pre className="fs-code">{`# 双臂协调: 人形机器人的核心能力

# ═══ 双臂操作分类 ═══
bimanual_types = {
    "独立双臂": {
        "描述": "两臂执行独立任务",
        "例子": "左手拿盘子, 右手拿杯子",
        "难度": "★★☆",
    },
    "协调双臂": {
        "描述": "两臂协作完成一个任务",
        "例子": "双手搬箱子, 两手拧瓶盖",
        "难度": "★★★★",
    },
    "非对称双臂": {
        "描述": "主臂操作, 辅臂固定/辅助",
        "例子": "左手扶碗, 右手搅拌",
        "难度": "★★★",
    },
}

# ═══ 双臂控制架构 ═══
# 方案A: 集中式 (一个策略控制两臂)
class CentralizedBimanualPolicy:
    def __init__(self):
        self.policy = TransformerPolicy(
            obs_dim=obs_left + obs_right + task,
            act_dim=act_left + act_right,  # 14+14=28 DoF
        )
    
    def predict(self, obs):
        action = self.policy(obs)
        left_action = action[:14]
        right_action = action[14:]
        return left_action, right_action

# 方案B: 分层式 (高层协调 + 低层执行)
class HierarchicalBimanual:
    def __init__(self):
        self.coordinator = HighLevelPolicy()  # 分配子任务
        self.left_arm = LowLevelPolicy()
        self.right_arm = LowLevelPolicy()
    
    def predict(self, obs, task):
        left_goal, right_goal = self.coordinator(obs, task)
        left_action = self.left_arm(obs, left_goal)
        right_action = self.right_arm(obs, right_goal)
        return left_action, right_action

# ═══ ACT (Action Chunking with Transformers) ═══
# 斯坦福 Mobile ALOHA 使用的策略
act_policy = {
    "方法": "Transformer + CVAE",
    "输入": "双臂关节 + 多相机图像",
    "输出": "未来 K 步双臂动作序列 (chunk)",
    "特色": [
        "Action Chunking: 一次预测多步 → 平滑",
        "CVAE: 处理多模态动作分布",
        "时域集成: 多次预测取平均 → 鲁棒",
    ],
    "效果": "叠衣服/炒菜/开柜子 成功率80%+",
}

# ═══ Mobile ALOHA (斯坦福) ═══
# 低成本双臂移动操作平台
mobile_aloha = {
    "硬件": "2×ViperX 臂 + AgileX 底盘",
    "成本": "~$32K (vs 工业方案 $100K+)",
    "数据收集": "VR遥操作 50 demos/task",
    "训练": "ACT + co-training (预训练数据)",
    "能力": "做饭/打扫/洗碗/递物品",
}

# ═══ 数据收集: ALOHA 式遥操作 ═══
# 用从动臂 (follower) + 主操作臂 (leader)
# 人操作 leader → follower 跟随 → 记录数据
# 50-100 demos → ACT 训练 → 成功!`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>👁️ 感知融合</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> perception_fusion</div>
              <pre className="fs-code">{`# 人形机器人感知融合: 多传感器协同

# ═══ 传感器配置 (典型人形) ═══
sensor_suite = {
    "头部": {
        "双目RGB":   "立体视觉 + 深度估计",
        "深度相机":   "RealSense D455 / Azure Kinect",
        "IMU":        "头部姿态估计",
    },
    "躯干": {
        "IMU":        "主IMU, 姿态/加速度",
        "力矩传感器": "各关节力矩反馈",
    },
    "手部": {
        "触觉传感器": "指尖 (GelSight / DIGIT)",
        "力/力矩":    "腕部 6轴力传感器",
        "关节编码器":  "高精度角度",
    },
    "脚部": {
        "力传感器":   "足底压力分布",
        "IMU":        "足部姿态",
    },
}

# ═══ 触觉感知 (关键!) ═══
# 人类操作依赖触觉 → 机器人也需要!
tactile_sensors = {
    "GelSight": {
        "原理": "弹性体 + 相机 → 高分辨率触觉图",
        "分辨率": "~30 μm",
        "信息": "接触形状 + 力分布",
        "应用": "纹理识别/滑动检测/力控制",
    },
    "DIGIT (Meta)": {
        "原理": "紧凑版 GelSight",
        "特色": "适合机器人指尖安装",
        "开源": "硬件+数据+模型",
    },
    "BioTac": {
        "原理": "仿真人指电容传感",
        "信息": "温度+振动+力",
    },
}

# ═══ 多模态融合架构 ═══
# 视觉 + 触觉 + 本体感知 → 统一表示

class MultiModalFusion(nn.Module):
    def __init__(self):
        super().__init__()
        # 各模态编码器
        self.vision_enc = ViTEncoder()       # RGB图像
        self.tactile_enc = TactileEncoder()  # 触觉图
        self.proprio_enc = MLPEncoder()      # 本体感知
        
        # 跨模态融合 (Transformer)
        self.fusion = CrossAttentionFusion(
            num_layers=4, dim=256
        )
        
    def forward(self, rgb, tactile, proprio):
        v_feat = self.vision_enc(rgb)        # (B, Nv, 256)
        t_feat = self.tactile_enc(tactile)   # (B, Nt, 256)
        p_feat = self.proprio_enc(proprio)   # (B, Np, 256)
        
        # 拼接 + 融合
        tokens = torch.cat([v_feat, t_feat, p_feat], dim=1)
        fused = self.fusion(tokens)
        return fused

# ═══ 状态估计 ═══
# 融合 IMU + 关节编码器 + 视觉 → 精确估计
# 人形状态: 基座位姿 + 所有关节角度/速度
# 方法: 扩展卡尔曼滤波 (EKF) / 因子图优化
state_estimation = {
    "输入": "IMU(1kHz) + 编码器(1kHz) + 视觉(30Hz)",
    "输出": "基座6DoF + 关节位置/速度",
    "精度": "位置±1cm, 姿态±0.5°",
    "延迟": "<1ms (EKF)",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
