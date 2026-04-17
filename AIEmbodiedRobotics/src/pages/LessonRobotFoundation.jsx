import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['RT-2/RT-X', 'Octo/OpenVLA', 'π₀/物理智能', '语言驱动'];

export default function LessonRobotFoundation() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🧬 module_02 — 机器人基础模型</div>
      <div className="fs-hero">
        <h1>机器人基础模型：RT-2 / Octo / π₀ / SayCan — 机器人的 GPT</h1>
        <p>
          机器人基础模型 (Robot Foundation Model) 是具身智能的核心突破：
          用大规模数据预训练一个通用模型,让机器人理解语言指令、泛化到新任务。
          <strong>RT-2</strong> (Google) 将 VLM 直接映射到机器人动作,
          <strong>Octo</strong> 首创开源通用操作模型,
          <strong>π₀</strong> (Physical Intelligence) 融合预训练 VLM 实现跨任务泛化。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧬 基础模型</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔬 RT-2 / RT-X</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> rt2_rtx</div>
              <pre className="fs-code">{`# RT-2: Robotics Transformer 2 (Google DeepMind)

# ═══ RT-2 的革命性 ═══
# 核心思想: 将 VLM (视觉语言模型) 直接用于机器人控制
# 方法: 把机器人动作 "翻译"为文本 token
# 输入: 摄像头图像 + 自然语言指令
# 输出: 机器人动作 (7-DoF: xyz位移 + rpy旋转 + 夹爪)

# ═══ 动作 Token 化 ═══
# 将连续动作离散化为 256 个 token per dimension
# 例如: [x: 128, y: 64, z: 200, rx: 128, ry: 128, rz: 140, grip: 255]
# → 编码为: "128 64 200 128 128 140 255"
# VLM 直接生成这些 token! (就像生成文本)

rt2_architecture = {
    "骨干": "PaLI-X (55B) 或 PaLM-E (12B)",
    "输入": "RGB 图像 + 文本指令",
    "输出": "7-DoF 动作 token",
    "训练数据": "互联网 VL 数据 + 机器人操作数据",
    "关键发现": [
        "互联网知识迁移到机器人 (e.g. '把可乐放到Taylor Swift旁边')",
        "零样本泛化到新物体",
        "推理能力 (放到最大/最小的物体旁)",
        "新类别理解 (从未见过的物体)",
    ],
}

# ═══ RT-X (跨机器人泛化) ═══
# Open X-Embodiment: 22个机构, 22种机器人, 500K+ episodes
rtx_dataset = {
    "名称": "Open X-Embodiment Dataset",
    "规模": "527 技能, 160,266 任务",
    "机器人": "22 种不同的机器人硬件",
    "目标": "训练跨机器人的通用模型",
}

# RT-X 模型: 在多种机器人数据上共同训练
# → 正迁移: 见过A机器人的数据能帮助B机器人
# → +50% 泛化能力提升 (vs 单机器人训练)

# ═══ 为什么重要? ═══
# 1. 打破了 "每个机器人需要从头训练" 的困境
# 2. 互联网知识 → 机器人常识
# 3. 开启了机器人的 "Scaling Law" 时代
# 4. 数据越多, 模型越通用 (类比 LLM 成长过程)`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🐙 Octo / OpenVLA</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> octo_openvla</div>
              <pre className="fs-code">{`# Octo & OpenVLA: 开源机器人基础模型

# ═══ Octo (UC Berkeley) ═══
# 第一个开源通用机器人操作模型
octo_overview = {
    "描述": "通用机器人策略 (Generalist Robot Policy)",
    "训练数据": "Open X-Embodiment (800K episodes)",
    "架构": "Transformer, 支持多种观察/动作空间",
    "大小": "93M 参数 (轻量! 可边缘部署)",
    "开源": "完全开源 (模型+代码+数据)",
}

# Octo 使用示例
# pip install octo
from octo.model.octo_model import OctoModel

model = OctoModel.load_pretrained("hf://rail-berkeley/octo-base")

# 推理: 给定观察 + 任务描述 → 动作
# observation = {"image_primary": img, "proprio": joint_pos}
# task = model.create_tasks(texts=["Pick up the red cup"])
# action = model.sample_actions(observation, task)

# Octo 特色:
# 1. 支持多种机器人 (不同自由度/传感器)
# 2. 可micro-tune到特定机器人 (几小时)
# 3. 支持语言和目标图像两种指令
# 4. Diffusion Head: 更好的多模态动作分布

# ═══ OpenVLA (Stanford) ═══
# 将 VLM 架构直接用于机器人
openvla = {
    "架构": "基于 Prismatic VLM (视觉语言模型)",
    "骨干": "Llama 2 7B + SigLIP + DinoV2",
    "训练": "Open X-Embodiment 970K episodes",
    "大小": "7B 参数",
    "特色": [
        "VLA (Vision-Language-Action) 范式",
        "直接 fine-tune 已有 VLM",
        "开放词汇指令理解",
    ],
}

# OpenVLA 推理
# from openvla import OpenVLA
# model = OpenVLA.from_pretrained("openvla-7b")
# action = model.predict(
#     image=camera_image,
#     instruction="Put the banana on the plate"
# )

# ═══ Octo vs OpenVLA 对比 ═══
# ┌──────────────┬─────────────┬──────────────┐
# │              │ Octo        │ OpenVLA      │
# ├──────────────┼─────────────┼──────────────┤
# │ 参数量       │ 93M (轻量)  │ 7B (重)      │
# │ 边缘部署     │ ✅ Jetson    │ ⚠️ 需要好GPU  │
# │ 指令理解     │ 中          │ 强 (VLM)     │
# │ 泛化能力     │ 中          │ 强           │
# │ 推理速度     │ 快 (10Hz+)  │ 慢 (~2Hz)    │
# │ 适用场景     │ 实时控制    │ 高级推理     │
# └──────────────┴─────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>π π₀ / Physical Intelligence</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> pi_zero</div>
              <pre className="fs-code">{`# π₀ (pi-zero): Physical Intelligence 公司

# ═══ Physical Intelligence ═══
# 2024年成立, 融资 $400M+, 估值 $2.4B
# 团队: Google RT 系列核心成员 + UC Berkeley 教授
# 使命: 构建通用机器人基础模型

# ═══ π₀ 模型 ═══
pi_zero = {
    "全名": "π₀ (pi-zero)",
    "架构": {
        "骨干": "预训练 VLM (视觉-语言)",
        "动作头": "Flow Matching (连续动作生成)",
        "特色": "VLM pre-training → robot fine-tuning",
    },
    "训练": {
        "预训练": "互联网 视觉-语言 数据",
        "微调": "多机器人、多任务 操作数据",
        "后训练": "RLHF-style 人类反馈优化",
    },
    "能力": {
        "叠衣服":     "灵巧双手操作柔性物体",
        "收拾桌子":   "多物体复杂场景操作",
        "跨机器人":   "同一模型控制不同硬件",
        "自然语言":   "通用语言指令理解",
    },
}

# ═══ π₀ 的突破 ═══
breakthroughs = {
    "灵巧操作": {
        "传统": "机器人在刚性物体上还行",
        "π₀":  "叠衣服/整理杂物 (柔性物体!)",
        "意义": "家庭场景最重要的能力之一",
    },
    "跨任务泛化": {
        "传统": "每个任务训练一个策略",
        "π₀":  "一个模型做多种操作任务",
        "意义": "真正的 '通用' 操作模型",
    },
    "Web Knowledge Transfer": {
        "传统": "只用机器人数据训练",
        "π₀":  "VLM 预训练知识 → 机器人",
        "意义": "利用互联网海量知识",
    },
}

# ═══ 其他重要模型 ═══
other_models = {
    "GR00T (NVIDIA)": {
        "定位": "人形机器人 Foundation Model",
        "特色": "Isaac Sim 深度集成, 端到端",
        "硬件": "Jetson Thor 专用芯片",
    },
    "RoboCasa / RoboGen": {
        "类型": "大规模机器人训练数据生成",
        "方法": "LLM 生成场景 + 仿真器执行",
    },
    "SayCan (Google)": {
        "架构": "LLM 规划 + 技能可行性评估",
        "意义": "首次让 LLM 驱动真实机器人",
    },
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🗣️ 语言驱动机器人</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> language_driven</div>
              <pre className="fs-code">{`# 语言驱动: 用自然语言控制机器人

# ═══ 架构模式 ═══
#
# 模式A: LLM as Planner (SayCan)
# "把可乐放到桌上" → LLM 分解任务 → 调用预定义技能
# 用户 → LLM → [找可乐, 抓取, 移动到桌上, 放下]
#                    ↓
#             每个技能: learned policy
#
# 模式B: VLA (RT-2, π₀)
# "把可乐放到桌上" → VLA → 直接输出动作序列
# 端到端, 不需要预定义技能

# ═══ SayCan 架构 ═══
# LLM (语义规划) × Skill Value (物理可行性)
# → 选出既语义合理又物理可行的动作

saycan_example = """
User: "我刚运动完, 能给我拿点东西补充能量吗?"

LLM 内部推理:
1. 理解意图: 用户需要运动后的饮品/食物
2. 推荐方案: 水/功能饮料/水果
3. 任务分解:
   a. 找到冰箱          (可行性: 0.95)
   b. 打开冰箱          (可行性: 0.90)
   c. 找到功能饮料       (可行性: 0.80)
   d. 抓取功能饮料       (可行性: 0.85)
   e. 关上冰箱          (可行性: 0.90)
   f. 送到用户面前       (可行性: 0.92)

机器人执行序列: a → b → c → d → e → f
"""

# ═══ Code-as-Policy ═══
# LLM 直接生成机器人控制代码!
code_as_policy = """
# 用户: "把红色积木叠在蓝色上面"
# LLM 生成:

def stack_red_on_blue():
    # 检测物体位置
    red_pos = detect_object("red block")
    blue_pos = detect_object("blue block")
    
    # 移动到红色积木上方
    move_to(red_pos + [0, 0, 0.05])
    
    # 抓取
    gripper_close()
    
    # 移动到蓝色积木上方
    target = blue_pos + [0, 0, 0.05]
    move_to(target)
    
    # 放置
    gripper_open()
"""

# ═══ VoxPoser (斯坦福) ═══
# LLM + 3D 体素空间 → 3D 空间中的约束场
# 将语言理解映射到 3D 空间的每个点
# "在杯子右边放" → 3D 势场引导机器人动作

# ═══ 挑战 ═══
challenges = {
    "长时域任务": "10+ 步骤的任务容易累积误差",
    "实时性":     "LLM 推理慢 (100ms+) vs 控制需要 (1ms)",
    "安全性":     "LLM 可能生成危险动作",
    "具象化差距":  "语言描述 ≠ 精确物理动作",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
