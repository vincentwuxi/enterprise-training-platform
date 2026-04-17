import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['游戏 AI', '机器人控制', '推理增强', '前沿展望'];

export default function LessonRLApplications() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge orange">🚀 module_08 — RL 应用前沿</div>
      <div className="fs-hero">
        <h1>RL 应用前沿：游戏 AI / 机器人 / 推理增强 / 自动驾驶</h1>
        <p>
          强化学习已从实验室走向工业应用。本模块深入 <strong>游戏 AI</strong> (AlphaGo/OpenAI Five)、
          <strong>机器人控制</strong> (Sim2Real/灵巧操作)、<strong>LLM 推理增强</strong> (MCTS + RL)、
          以及<strong>自动驾驶/推荐系统</strong>等实际落地场景，
          展望 RL 在 <strong>2025 年的技术趋势</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🚀 RL 应用</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎮 游戏 AI: RL 的试炼场</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> game_ai</div>
              <pre className="fs-code">{`# 游戏 AI: RL 最成功的应用领域

# ═══ 游戏复杂度梯度 ═══
game_complexity = {
    # 完美信息 + 回合制
    "Atari (2013)":        "DQN, 像素输入, 秒级决策",
    "围棋 (2016)":         "AlphaGo, 10^170 状态, 350步",
    "国际象棋":            "AlphaZero, 8h训练超越Stockfish",
    
    # 不完美信息
    "德扑 (2017)":         "Libratus, 信息集搜索, 博弈论",
    "麻将 (2020)":         "Suphx, 微软, 四人不完美信息",
    
    # 实时+多人
    "星际争霸 (2019)":     "AlphaStar, 实时+部分可观+多Agent",
    "Dota 2 (2019)":       "OpenAI Five, 5v5, 45min 对局",
    "GT赛车 (2022)":       "GT Sophy, 实时赛车, 超越GT冠军",
}

# ═══ AlphaStar 架构 (StarCraft II) ═══
alphastar_arch = {
    "观测编码":  "Transformer 编码地图/单位/资源",
    "核心网络":  "LSTM (128步历史)",
    "动作空间":  "自回归: 动作类型→目标→位置",
    "训练":      "监督预训练 + 多Agent联盟训练",
    "对手池":    "联盟学习 (League Training)",
    "规模":      "16 TPUv3, ~14天训练",
    "成绩":      "Top 0.2% 的人类玩家水平",
}

# ═══ 程序化内容生成 (PCG) ═══
# 用 RL 自动生成游戏关卡/地图
pcg_rl = {
    "关卡设计":  "Agent 学习生成有趣的关卡",
    "NPC 行为":  "敌人 AI 自适应玩家策略",
    "平衡性测试": "RL Agent 快速测试游戏平衡",
    "难度调节":  "根据玩家水平动态调整",
}

# ═══ 游戏 AI 的技术遗产 ═══
# 1. 自我博弈 → LLM 自我改进 (Self-Play)
# 2. MCTS → LLM 推理 (Tree-of-Thought)
# 3. 分布式训练 → 大规模 RLHF
# 4. 联盟训练 → 多目标对齐`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🤖 机器人控制</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> robotics_rl</div>
              <pre className="fs-code">{`# 机器人 RL: 从仿真到现实

# ═══ 核心挑战: Sim2Real Gap ═══
# 仿真训练: 便宜、安全、可并行
# 真实部署: 物理差异 → 策略失败!
# Sim2Real 差距来源:
sim2real_gap = {
    "物理参数":  "摩擦系数、质量、延迟不精确",
    "视觉差异":  "仿真渲染 vs 真实图像",
    "传感器噪声": "仿真太理想, 真实有噪声",
    "执行误差":  "电机响应非线性",
}

# ═══ Sim2Real 解决方案 ═══
sim2real_solutions = {
    "Domain Randomization": {
        "方法": "在仿真中随机化物理参数 (质量, 摩擦, 光照)",
        "直觉": "见过各种仿真环境 → 真实环境只是其中一个",
        "例子": "OpenAI 魔方 (2019): 解三阶魔方",
    },
    "System ID": {
        "方法": "精确辨识真实物理参数, 更新仿真",
        "直觉": "让仿真尽可能逼近现实",
    },
    "Real-World RL": {
        "方法": "直接在真实环境训练 (需要安全约束)",
        "挑战": "样本效率 + 安全 + 硬件磨损",
    },
    "Foundation Model": {
        "方法": "用视觉/语言大模型做 zero-shot 迁移",
        "例子": "RT-2: 文本指令 → 机器人动作",
    },
}

# ═══ 机器人 RL 成就 ═══
robot_achievements = {
    "灵巧操作 (2019)":  "OpenAI, Shadow Hand 解魔方",
    "双足行走 (2023)":  "Agility, Digit 仓库物流",
    "灵巧抓取 (2024)":  "Google, RT-Grasp 任意物体",
    "人形控制 (2024)":  "Figure/Tesla, 全身协调控制",
}

# ═══ Isaac Lab (NVIDIA) ═══
# GPU 并行物理仿真框架
# 4096 个机器人同时训练!
# 训练时间: 数天 → 数小时
# PPO + 大规模并行 = 机器人 RL 新范式

# ═══ 安全 RL (Safe RL) ═══
# 机器人不能"探索"危险动作!
# 约束优化: max J(π) s.t. C(π) ≤ d
# CPO / PCPO / SafeLayer 等方法`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧠 LLM 推理增强</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> reasoning_rl</div>
              <pre className="fs-code">{`# RL + LLM: 推理能力的新前沿

# ═══ 测试时计算 (Test-Time Compute) ═══
# 不只是训练时优化, 推理时也"思考更多"!
# 核心: 让模型在推理时搜索更好的答案

# ═══ 1. MCTS + LLM ═══
# 蒙特卡洛树搜索 + 价值网络 (AlphaGo 灵感)
# 应用于数学推理 / 代码生成:
# 1. 选择: UCB 选择最有前途的推理路径
# 2. 扩展: LLM 生成下一步推理
# 3. 模拟: 继续生成直到得出答案
# 4. 回传: 用最终答案质量更新价值估计

mcts_llm_systems = {
    "AlphaProof (2025)":  "DeepMind 数学定理证明, IMO 银牌",
    "rStar":              "小模型 + MCTS = 大模型推理能力",
    "Qwen-QwQ":           "推理模型, 类 o1 的长思维链",
}

# ═══ 2. Process Reward Model (PRM) ═══
# ORM: 只看最终答案对不对 (稀疏奖励)
# PRM: 对每一步推理都打分 (密集奖励!)
# → 更好的信用分配, 训练更高效

# PRM 训练:
# 1. 收集推理过程 step labels (哪步对/错)
# 2. 训练模型预测每步的正确性
# 3. 用于 MCTS 的价值评估 / RL 的奖励信号

# ═══ 3. DeepSeek-R1 的启示 ═══
# 纯 RL (GRPO) 训练 → 模型自发学会 CoT!
deepseek_r1_insights = {
    "Aha Moment":   "训练中模型突然学会'等等让我重新想想'",
    "自我纠错":     "发现错误并重新推理 (无需人教!)",
    "长思维链":     "自发产生上万 token 的推理过程",
    "关键条件":     "可验证的奖励 (数学/代码)",
}

# ═══ 4. Scaling Test-Time Compute ═══
# OpenAI o1/o3: 推理时花更多计算 → 更好结果
# 两种范式:
# a) Search-based: MCTS / Best-of-N / Beam Search
# b) Think-longer: 更长的 CoT (DeepSeek-R1)
# → "训练时缩放" vs "推理时缩放" 并存

# ═══ RL for Code ═══
# 代码有天然可验证奖励 (测试通过!)
code_rl = {
    "CodeRL":       "代码生成 + 单元测试奖励",
    "Reflexion":    "自我反思 + 迭代改进",
    "SWE-Bench":    "真实 GitHub Issue, RL Agent 修复",
    "AlphaCode":    "DeepMind, 竞赛编程, Top 50%",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔮 RL 前沿展望 2025</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> rl_frontiers</div>
              <pre className="fs-code">{`# RL 2025 前沿趋势

# ═══ 趋势 1: RL + Foundation Models ═══
# LLM 作为世界模型 / 策略 / 奖励模型
rl_foundation = {
    "LLM as Reward":    "用 LLM 判断质量 (RLAIF)",
    "LLM as Policy":    "直接用 LLM 做决策 Agent",
    "LLM as Planner":   "LLM 做高层规划, RL 做低层控制",
    "VLM as Reward":    "视觉语言模型评判机器人动作",
}

# ═══ 趋势 2: Offline RL 复兴 ═══
# 从历史数据中学习, 不需要在线交互
# 核心: 控制分布偏移 (OOD actions)
# 方法: CQL / IQL / Decision Transformer
# 应用: 医疗决策 / 推荐系统 / 工业控制

# ═══ 趋势 3: World Models ═══
# 学习环境的预测模型, 在"想象"中训练
world_models = {
    "Dreamer (2020-2024)": "学习 latent 动力学, 在梦中训练",
    "IRIS (2023)":         "Transformer world model",
    "Genie (2024)":        "DeepMind, 视频生成 + 交互",
    "UniSim":              "通用仿真器概念",
}

# ═══ 趋势 4: 自动驾驶 ═══
# 传统: 规则 → 模仿学习 → RL 微调
autonomous_driving = {
    "端到端 RL":     "传感器 → 直接输出控制",
    "Waymo":         "模仿学习 + RL 安全层",
    "Tesla FSD":     "大规模模仿 + RL 在仿真中训练",
    "挑战":          "安全验证 / 长尾场景 / 法规",
}

# ═══ 趋势 5: RL for Science ═══
rl_science = {
    "分子设计":   "RL 搜索新药物/材料分子",
    "芯片设计":   "Google, RL 做芯片布局 (Nature 2021)",
    "核聚变":     "DeepMind, 控制等离子体 (Nature 2022)",
    "蛋白质":     "AlphaFold 后续: RL 蛋白质设计",
    "数学":       "AlphaProof / AlphaGeometry",
}

# ═══ 趋势 6: 高效 RL ═══
efficient_rl = {
    "样本效率":    "Dreamer/MBPO: 少样本高效学习",
    "迁移学习":    "预训练 RL Agent → 快速迁移",
    "课程学习":    "自动课程 → 渐进式难度",
    "元学习":      "Learn-to-Learn, 快速适应新任务",
}

# ═══ 推荐学习路径 ═══
learning_path = {
    "入门": "Sutton 教材 + Gymnasium + CleanRL",
    "进阶": "PPO 从零实现 + Atari/MuJoCo",
    "对齐": "TRL + DPO/GRPO 实战",
    "前沿": "MCTS+LLM / World Models / MARL",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
