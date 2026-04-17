import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['具身智能范式', '世界模型', 'Sim-to-Real', '产业格局'];

export default function LessonEmbodiedOverview() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🤖 module_01 — 具身智能概论</div>
      <div className="fs-hero">
        <h1>具身智能概论：世界模型 / 具身大模型 / Sim-to-Real — 物理世界的 GPT 时刻</h1>
        <p>
          具身智能 (Embodied AI) 是让 AI 拥有"身体"，在物理世界中感知、决策和行动的能力。
          2024-2025 年，<strong>Foundation Model + 机器人</strong>的范式融合引爆了新一轮革命：
          Google RT-2 让机器人理解自然语言指令，Tesla Optimus / Figure 02 / 宇树 H1
          让人形机器人从实验室走向量产。本模块构建你的具身智能认知框架。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🤖 具身智能</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧠 具身智能范式</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> embodied_paradigm</div>
              <pre className="fs-code">{`# 具身智能: AI 从数字世界走向物理世界

# ═══ 什么是具身智能? ═══
# 传统 AI: 处理文本/图片 → 输出文本/图片 (纯数字)
# 具身 AI: 感知物理环境 → 推理决策 → 执行物理动作
# 关键词: 感知 (Perception) + 决策 (Decision) + 行动 (Action)

# ═══ 为什么现在爆发? ═══
explosion_reasons = {
    "Foundation Model 突破": {
        "视觉": "CLIP/DINOv2 通用视觉理解",
        "语言": "GPT-4/Gemini 自然语言指令理解",
        "多模态": "原生理解 图像+语言+视频",
        "推理": "o3/o4-mini 链式推理→复杂任务分解",
    },
    "仿真技术成熟": {
        "NVIDIA Isaac": "高保真物理仿真 + GPU 加速",
        "MuJoCo": "高效接触力学仿真 (开源)",
        "Sim-to-Real": "仿真→真实迁移 成功率提升",
    },
    "硬件降本": {
        "传感器": "LiDAR/相机/力传感器大幅降价",
        "算力": "边缘 GPU (Jetson) / NPU 普及",
        "执行器": "电机/减速器 成本下降 50%+",
    },
    "商业需求": {
        "劳动力短缺": "全球老龄化 → 急需机器人替代",
        "仓储物流": "Amazon/京东 仓库自动化",
        "制造业": "特斯拉工厂 Optimus 实际部署",
        "服务业": "酒店/餐厅/医疗 服务机器人",
    },
}

# ═══ 具身 AI 技术栈 ═══
# ┌──────────────────────────────────────────┐
# │          应用层 (场景+任务)               │
# │  工业制造 | 物流仓储 | 家庭服务 | 医疗    │
# ├──────────────────────────────────────────┤
# │          决策层 (大脑)                    │
# │  Foundation Model | 任务规划 | 技能学习   │
# ├──────────────────────────────────────────┤
# │          感知层 (感官)                    │
# │  3D 视觉 | 触觉 | 力感知 | SLAM 定位     │
# ├──────────────────────────────────────────┤
# │          控制层 (小脑)                    │
# │  运动控制 | 力控制 | 步态 | 灵巧操作      │
# ├──────────────────────────────────────────┤
# │          硬件层 (身体)                    │
# │  机械臂 | 灵巧手 | 移动底盘 | 人形结构    │
# └──────────────────────────────────────────┘

# ═══ 关键概念 ═══
key_concepts = {
    "感知-行动循环": "观察→理解→决策→执行→观察...",
    "开放词汇":     "理解任意自然语言指令 (非预定义)",
    "零样本泛化":   "新环境/新物体 无需重新训练",
    "长时域规划":   "分解复杂多步任务",
    "安全交互":     "与人类安全共存协作",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🌍 世界模型</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> world_model</div>
              <pre className="fs-code">{`# 世界模型: 机器人的"想象力"

# ═══ 什么是世界模型? ═══
# 人类: 可以在脑中"模拟"物理过程 (推一个杯子会怎样?)
# 世界模型: AI 学习物理世界的规律, 预测动作的后果
# → 不需要每次真实试错, 在"想象"中学习

world_model_approaches = {
    "视频预测模型": {
        "原理": "预测下一帧视频 → 学习物理规律",
        "代表": "Sora (OpenAI 称其为'世界模拟器')",
        "局限": "预测 ≠ 真正理解物理",
    },
    "物理仿真": {
        "原理": "基于物理引擎的精确仿真",
        "代表": "MuJoCo / Isaac Sim / PyBullet",
        "优势": "精确, 可控, 可大规模并行",
    },
    "神经物理引擎": {
        "原理": "用神经网络学习物理交互",
        "代表": "Learning Physics from Video",
        "方向": "视觉 → 物理参数估计 → 仿真",
    },
    "具身世界模型": {
        "原理": "在大规模机器人数据上训练",
        "代表": "Genie 2 (DeepMind)",
        "特色": "可交互的 3D 世界生成",
    },
}

# ═══ Genie 2 (DeepMind) ═══
genie2 = {
    "能力": "从单张图片生成可交互 3D 世界",
    "机制": "生成的世界可以像游戏一样走动/交互",
    "用途": "无限生成训练环境 → 机器人训练数据",
    "意义": "解决机器人训练数据稀缺问题",
}

# ═══ 世界模型 for 机器人 ═══
# 传统方法: 在真实环境中试错 → 慢, 危险, 昂贵
# 世界模型: 在模拟中试错 → 快, 安全, 便宜
#
# 训练流程:
# 1. 世界模型学习环境动力学: s_{t+1} = f(s_t, a_t)
# 2. 在世界模型中规划/训练策略
# 3. 将策略迁移到真实机器人 (Sim-to-Real)

# ═══ LeCun 的 JEPA ═══
jepa = {
    "全名": "Joint Embedding Predictive Architecture",
    "核心": "在表示空间预测 (非像素空间)",
    "优势": "不需要预测每个像素 → 更高效",
    "目标": "构建动物级别的世界模型",
    "状态": "V-JEPA 已开源 (视频理解)",
}

# ═══ 世界模型 vs 大语言模型 ═══
# LLM: 理解语言 → 文本世界的知识
# 世界模型: 理解物理 → 物理世界的知识
# 具身大模型 = LLM + 世界模型 → 通用机器人`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 Sim-to-Real Transfer</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> sim_to_real</div>
              <pre className="fs-code">{`# Sim-to-Real: 从虚拟到现实的关键一跃

# ═══ 为什么需要 Sim-to-Real? ═══
# 真实训练: 1个机器人 × 1年 = 极少数据
# 仿真训练: 1000个虚拟机器人 并行 = 海量数据
# 难点: 仿真 ≠ 现实 (Reality Gap)

# ═══ Reality Gap ═══
reality_gap = {
    "视觉差异": "材质/光照/纹理 → 仿真过于完美",
    "动力学差异": "摩擦/弹性/接触 → 仿真简化了",
    "传感器噪声": "真实传感器有噪声、延迟、漂移",
    "执行器差异": "电机响应/齿轮间隙/柔性",
    "环境随机性": "真实世界的不可预测性",
}

# ═══ 弥合 Gap 的方法 ═══
transfer_methods = {
    "Domain Randomization (域随机化)": {
        "原理": "训练时随机化仿真参数 → 模型学会泛化",
        "随机化": [
            "光照/颜色/纹理 (视觉)",
            "质量/摩擦/阻尼 (物理)",
            "传感器噪声 (感知)",
            "执行器延迟 (控制)",
        ],
        "效果": "最经典有效, OpenAI 魔方手就是这样",
    },
    "Domain Adaptation (域适应)": {
        "原理": "学习仿真→真实的映射",
        "方法": "对抗训练 / 图像翻译",
        "例子": "CycleGAN 将仿真图→真实图风格",
    },
    "System Identification (系统辨识)": {
        "原理": "精确测量真实系统参数 → 精确仿真",
        "方法": "标定摩擦/质量/惯性矩",
        "适用": "工业级精确控制场景",
    },
    "Real-World Fine-tuning": {
        "原理": "仿真预训练 + 少量真实微调",
        "方法": "仿真训练 90% + 真实微调 10%",
        "趋势": "最实用的工业方案",
    },
}

# ═══ 典型 Sim-to-Real 流程 ═══
# Step 1: 在仿真中大规模训练策略
#    - Isaac Sim / MuJoCo 中并行 1000+ 环境
#    - 域随机化 → 泛化能力
#    - 训练时间: GPU 集群 × 几小时-几天
#
# Step 2: 仿真中评估
#    - 多种随机化参数下测试
#    - 成功率 > 90% → 准备部署
#
# Step 3: 真实机器人部署
#    - 直接部署 (zero-shot transfer)
#    - 或少量 fine-tuning (few-shot)
#
# Step 4: 持续改进
#    - 收集真实数据 → 改进仿真
#    - 迭代 Sim-to-Real 循环`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏭 产业格局</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> industry_landscape</div>
              <pre className="fs-code">{`# 具身智能产业格局 (2025-2026)

# ═══ 人形机器人公司 ═══
humanoid_companies = {
    "Figure (美)": {
        "产品": "Figure 02",
        "估值": "$2.6B (2024)",
        "投资方": "Microsoft, OpenAI, NVIDIA, Amazon",
        "特色": "OpenAI 合作 → 语言驱动操作",
        "进展": "BMW 工厂试部署",
    },
    "Tesla (美)": {
        "产品": "Optimus Gen 2",
        "目标": "$20,000 售价, 百万台产量",
        "特色": "FSD 视觉技术复用 + 自有工厂验证",
        "进展": "特斯拉工厂内部使用",
    },
    "宇树科技 (中)": {
        "产品": "Unitree H1/G1",
        "特色": "中国人形机器人领跑者, 性价比高",
        "价格": "G1 约 ¥99,000 起",
        "进展": "全球出货, 学术/商业广泛使用",
    },
    "1X Technologies (挪威)": {
        "产品": "NEO",
        "投资方": "OpenAI 基金",
        "特色": "家庭服务人形机器人",
    },
    "Agility Robotics (美)": {
        "产品": "Digit",
        "特色": "仓储物流专用, Amazon 合作",
    },
}

# ═══ 技术平台公司 ═══
platform_companies = {
    "NVIDIA": {
        "Isaac Sim":    "机器人仿真平台 (行业标准)",
        "Jetson Orin":  "边缘 AI 计算 (机器人大脑)",
        "GR00T":        "人形机器人 Foundation Model",
        "角色": "具身智能的 '基础设施提供者'",
    },
    "Google DeepMind": {
        "RT-2/RT-X":  "机器人基础模型 (研究领先)",
        "Gemini":     "多模态理解 → 机器人指令",
        "Genie 2":    "世界模型 → 无限训练数据",
    },
    "OpenAI": {
        "合作伙伴": "Figure, 1X",
        "角色": "LLM/Vision → 机器人的'认知大脑'",
    },
}

# ═══ 市场规模预测 ═══
market_size = {
    "2025": "$2B  (早期商业化)",
    "2027": "$8B  (仓储/工厂规模部署)",
    "2030": "$38B (家庭/服务扩展)",
    "2035": "$150B+ (通用人形机器人)",
}

# ═══ 中国产业链 ═══
china_supply_chain = {
    "本体": "宇树/小鹏鹏行/智元/傅利叶/开普勒",
    "关节": "绿的谐波/摩比斯/汇川/禾川",
    "传感器": "禾赛/速腾/大疆 LiDAR",
    "芯片": "地平线/寒武纪/瑞芯微",
    "视觉": "海康/大华/旷视/商汤",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
