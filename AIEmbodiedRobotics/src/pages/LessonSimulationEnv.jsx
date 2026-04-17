import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Isaac Sim', 'MuJoCo', '大规模并行', 'Sim-to-Real'];

export default function LessonSimulationEnv() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🎮 module_03 — 仿真环境</div>
      <div className="fs-hero">
        <h1>仿真环境：NVIDIA Isaac Sim / MuJoCo / 并行训练 — 机器人的训练场</h1>
        <p>
          仿真是具身 AI 训练的基础设施。<strong>NVIDIA Isaac Sim</strong> 提供
          照片级真实渲染 + 精确物理的端到端平台，
          <strong>MuJoCo</strong> (DeepMind) 以极高的仿真速度成为 RL 社区标准。
          本模块覆盖仿真环境搭建、GPU 并行训练、域随机化、
          以及 Sim-to-Real 迁移的完整工程实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎮 仿真环境</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🟢 NVIDIA Isaac Sim</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> isaac_sim</div>
              <pre className="fs-code">{`# NVIDIA Isaac Sim: 机器人仿真行业标准

# ═══ Isaac Sim 概览 ═══
isaac_sim = {
    "引擎": "基于 Omniverse (USD 通用场景格式)",
    "物理": "PhysX 5 (GPU 加速物理仿真)",
    "渲染": "RTX 光线追踪 (照片级真实)",
    "传感器": "RGB/Depth/LiDAR/IMU/力传感器 仿真",
    "API": "Python API + ROS 2 集成",
    "版本": "Isaac Sim 4.x (2025)",
}

# ═══ Isaac 生态系统 ═══
# Isaac Sim:    仿真平台 (场景/物理/渲染)
# Isaac Lab:    RL 训练框架 (GPU 并行)
# Isaac ROS:    真实机器人部署
# Isaac GR00T:  人形机器人 Foundation Model

# ═══ Isaac Lab (GPU 并行训练) ═══
# 前身: Orbit → 现在: Isaac Lab
# 特点: 在单个 GPU 上并行运行 4096+ 环境!

# 环境配置示例
from omni.isaac.lab.envs import ManagerBasedRLEnv
from omni.isaac.lab.envs import ManagerBasedRLEnvCfg

class FrankaCubeLiftEnvCfg(ManagerBasedRLEnvCfg):
    """Franka 机械臂抬举方块任务配置"""
    
    # 场景配置
    scene = SceneCfg(
        num_envs=4096,  # 并行环境数!
        env_spacing=2.0,
    )
    
    # 机器人配置
    robot = ArticulationCfg(
        prim_path="/World/Franka",
        spawn=UsdFileCfg(usd_path="franka.usd"),
    )
    
    # 物体配置
    cube = RigidObjectCfg(
        prim_path="/World/Cube",
        spawn=UsdFileCfg(usd_path="cube.usd"),
    )
    
    # 观察空间
    observations = ObservationGroupCfg(
        policy=ObservationTermCfg(
            joint_pos=True,
            joint_vel=True,
            object_pos=True,
        )
    )
    
    # 奖励配置
    rewards = RewardsCfg(
        reaching=RewardTermCfg(weight=1.0),
        lifting=RewardTermCfg(weight=5.0),
    )

# ═══ 传感器仿真 ═══
sensor_simulation = {
    "RGB 相机":  "RTX 光线追踪, 照片级",
    "深度相机":  "精确深度图 + 噪声模型",
    "LiDAR":     "360° 点云, 支持多线",
    "IMU":       "加速度/陀螺仪 + 漂移仿真",
    "力/扭矩":   "接触力精确仿真",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🦾 MuJoCo</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> mujoco</div>
              <pre className="fs-code">{`# MuJoCo: Multi-Joint dynamics with Contact

# ═══ MuJoCo 概览 ═══
mujoco_overview = {
    "开发者": "DeepMind (2022年开源)",
    "特长":   "精确接触力学仿真 (抓取/碰撞)",
    "速度":   "极快 (比 Isaac 快 10-100x 纯CPU)",
    "精度":   "接触/摩擦/约束 物理精确",
    "社区":   "RL 研究社区标准",
    "语言":   "C + Python (mujoco-py)",
}

# ═══ MuJoCo 基础使用 ═══
import mujoco
import mujoco.viewer

# 加载模型 (MJCF/XML 格式)
model = mujoco.MjModel.from_xml_path("humanoid.xml")
data = mujoco.MjData(model)

# 仿真循环
for _ in range(10000):
    # 设置控制信号
    data.ctrl[:] = policy(data.qpos, data.qvel)
    
    # 前进一步 (默认 2ms)
    mujoco.mj_step(model, data)
    
    # 读取状态
    joint_pos = data.qpos  # 关节位置
    joint_vel = data.qvel  # 关节速度
    contact = data.contact # 接触信息

# 可视化
with mujoco.viewer.launch_passive(model, data) as v:
    while v.is_running():
        mujoco.mj_step(model, data)
        v.sync()

# ═══ MJCF 模型定义 ═══
robot_xml = '''
<mujoco>
  <worldbody>
    <light diffuse=".5 .5 .5" pos="0 0 3"/>
    <geom type="plane" size="5 5 0.1"/>
    
    <!-- 简单机械臂 -->
    <body name="link1" pos="0 0 0.5">
      <joint name="joint1" type="hinge" axis="0 0 1"/>
      <geom type="capsule" size="0.04" fromto="0 0 0 0.3 0 0"/>
      
      <body name="link2" pos="0.3 0 0">
        <joint name="joint2" type="hinge" axis="0 1 0"/>
        <geom type="capsule" size="0.03" fromto="0 0 0 0.25 0 0"/>
      </body>
    </body>
  </worldbody>
  
  <actuator>
    <motor joint="joint1" ctrlrange="-1 1"/>
    <motor joint="joint2" ctrlrange="-1 1"/>
  </actuator>
</mujoco>
'''

# ═══ MuJoCo vs Isaac Sim ═══
# ┌──────────────┬──────────────┬──────────────┐
# │              │ MuJoCo       │ Isaac Sim    │
# ├──────────────┼──────────────┼──────────────┤
# │ 物理精度     │ ⭐⭐⭐⭐⭐     │ ⭐⭐⭐⭐       │
# │ 渲染质量     │ ⭐⭐           │ ⭐⭐⭐⭐⭐     │
# │ CPU 速度     │ 极快          │ 慢           │
# │ GPU 并行     │ MJX (新)     │ 原生支持     │
# │ 传感器仿真   │ 基础          │ 全面         │
# │ ROS 集成     │ 需自建        │ 原生         │
# │ 适合         │ RL 研究      │ 工业/部署    │
# └──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ 大规模并行训练</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> parallel_training</div>
              <pre className="fs-code">{`# GPU 并行仿真: 千倍加速训练

# ═══ 为什么需要并行? ═══
# 机器人 RL 训练需要 数十亿步 交互
# 单环境: 60Hz × 3600s = 216K 步/小时
# 4096 并行: 60Hz × 3600s × 4096 = 885M 步/小时
# → 4096 倍加速!

# ═══ Isaac Lab GPU 并行 ═══
# 所有环境在同一 GPU 上并行运行
# 关键: 向量化操作 (不是 for 循环!)

import torch
from omni.isaac.lab.envs import ManagerBasedRLEnv

env = ManagerBasedRLEnv(cfg=cfg)  # 4096 环境

# 所有 4096 个环境同时 reset
obs, info = env.reset()
# obs shape: (4096, obs_dim)

# 所有 4096 个环境同时 step
actions = policy(obs)  # (4096, action_dim)
obs, reward, terminated, truncated, info = env.step(actions)

# ═══ PPO 训练 (RSL-RL) ═══
from rsl_rl.runners import OnPolicyRunner
from rsl_rl.algorithms import PPO

runner = OnPolicyRunner(
    env=env,
    train_cfg={
        "algorithm": {
            "class_name": "PPO",
            "value_loss_coef": 1.0,
            "use_clipped_value_loss": True,
            "clip_param": 0.2,
            "entropy_coef": 0.01,
            "learning_rate": 3e-4,
        },
        "runner": {
            "num_steps_per_env": 24,
            "max_iterations": 1500,
        },
    },
)

runner.learn()  # 训练!
# 1500 iterations × 4096 envs × 24 steps
# = 147M 步 → 通常 30-60 分钟在单 GPU

# ═══ MuJoCo MJX (JAX 加速) ═══
# MuJoCo 的 JAX 后端: GPU 上运行 MuJoCo!
import jax
from mujoco import mjx

# JIT 编译仿真步
jit_step = jax.jit(mjx.step)
# 批量仿真
batch_data = jax.vmap(jit_step)(batch_model, batch_data)

# ═══ 训练基准 ═══
training_benchmarks = {
    "机械臂抓取":    "4096 envs, PPO, ~30 min, 95%+",
    "四足行走":      "4096 envs, PPO, ~1 hour, 稳定",
    "人形站立":      "4096 envs, PPO, ~2 hours",
    "灵巧手操作":    "8192 envs, PPO, ~4-8 hours",
    "人形行走":      "4096 envs, PPO, ~4-12 hours",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 Sim-to-Real 工程</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> sim_to_real_eng</div>
              <pre className="fs-code">{`# Sim-to-Real 工程: 让仿真策略在真实世界工作

# ═══ 域随机化配置 ═══
domain_randomization = {
    "物理参数随机化": {
        "摩擦系数":  "uniform(0.3, 1.2)",
        "物体质量":  "±30% 基准值",
        "阻尼系数":  "uniform(0.5, 2.0)",
        "关节间隙":  "uniform(0, 0.01) rad",
    },
    "视觉随机化": {
        "光照方向":  "随机球面采样",
        "光照强度":  "uniform(0.5, 1.5)",
        "纹理":      "随机纹理替换",
        "相机噪声":  "高斯噪声 σ=0.01",
        "相机位置":  "±2cm 抖动",
    },
    "执行器随机化": {
        "力矩缩放":  "uniform(0.8, 1.2)",
        "控制延迟":  "uniform(0, 20) ms",
        "通信延迟":  "uniform(5, 50) ms",
    },
}

# Isaac Lab 域随机化配置
from omni.isaac.lab.utils.configclass import configclass

@configclass
class RandomizationCfg:
    """域随机化配置"""
    
    # 物理随机化 (每次 reset)
    physics_material = EventTermCfg(
        func=randomize_rigid_body_material,
        params={
            "static_friction_range": (0.3, 1.2),
            "dynamic_friction_range": (0.3, 0.8),
        },
    )
    
    # 质量随机化
    body_mass = EventTermCfg(
        func=randomize_rigid_body_mass,
        params={"mass_range": (-0.3, 0.3)},  # ±30%
    )
    
    # 执行器随机化
    actuator_gains = EventTermCfg(
        func=randomize_actuator_gains,
        params={"stiffness_range": (0.8, 1.2)},
    )

# ═══ 成功案例 ═══
success_cases = {
    "OpenAI 魔方手 (2019)": {
        "任务": "灵巧手旋转魔方",
        "方法": "大规模域随机化 + ADR",
        "结果": "直接 zero-shot transfer",
    },
    "Anymal 四足 (ETH)": {
        "任务": "崎岖地形行走",
        "方法": "Isaac Gym + 地形随机化",
        "结果": "野外/雪地/楼梯 泛化",
    },
    "宇树 H1 (2024)": {
        "任务": "人形行走跑步",
        "方法": "Isaac Sim + 域随机化",
        "结果": "真实户外环境行走",
    },
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
