import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['AlphaProof', 'AlphaGeometry', 'LeanDojo', '数学AI生态'];

export default function LessonMathReasoning() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🔬 module_06 — AI 数学推理</div>
      <div className="fs-hero">
        <h1>AI 数学推理：AlphaProof / AlphaGeometry / LeanDojo / 自动定理证明</h1>
        <p>
          2024 年，DeepMind 的 <strong>AlphaProof</strong> 在国际数学奥林匹克 (IMO) 中解出 4 道题，
          达到<strong>银牌水平</strong>——这是 AI 首次在顶级数学竞赛中接近人类精英。
          <strong>AlphaGeometry</strong> 在几何推理上超越多数 IMO 选手。
          <strong>FunSearch</strong> 让 LLM 发现了新的数学函数。
          本模块解析 AI 如何进行数学推理与定理证明。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔢 AI 数学推理</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏅 AlphaProof：IMO 银牌的 AI</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> alphaproof</div>
                <pre className="fs-code">{`# AlphaProof: AI 攻克国际数学奥林匹克

# IMO (International Mathematical Olympiad):
# 全球最顶级的中学生数学竞赛
# 6 道题, 每题 7 分, 满分 42 分
# 金/银/铜 按分数排名划定

# 2024 IMO 结果 (AlphaProof + AlphaGeometry):
# ├── 题 1 (代数): ✅ 7/7 — AlphaProof
# ├── 题 2 (代数): ✅ 7/7 — AlphaProof
# ├── 题 3 (组合): ❌ 0/7 — 未能解出
# ├── 题 4 (几何): ✅ 7/7 — AlphaGeometry 2
# ├── 题 5 (数论): ❌ 0/7 — 未能解出
# ├── 题 6 (组合): ✅ 7/7 — AlphaProof
# └── 总计: 28/42 → 银牌水平 ★

# ═══ AlphaProof 核心方法 ═══
AlphaProof = {
    "核心思想": "RL + 形式化验证",
    
    "Step 1: 形式化翻译": {
        "Gemini": "自然语言问题→Lean 4 形式化",
        "多次采样": "生成多个形式化候选",
        "人工校验": "确保形式化忠实于原题",
    },
    
    "Step 2: AlphaZero 搜索": {
        "搜索空间": "Lean 证明策略(tactics)",
        "价值网络": "评估当前证明状态→完成可能性",
        "策略网络": "建议下一步证明策略",
        "MCTS": "蒙特卡洛树搜索 + 自我对弈",
    },
    
    "Step 3: Lean 4 验证": {
        "形式化验证": "每步推理由Lean类型检查器验证",
        "无幻觉": "不可能出现逻辑错误",
        "完整证明": "从公理到结论的完整推理链",
    },
}

# 为什么这是突破:
# ├── IMO 问题需要深度创造性推理
# ├── 不同于计算题/模式匹配
# ├── 需要发现新的证明策略
# ├── 搜索空间巨大(比围棋大得多)
# └── 证明被形式化验证(不是"可能正确")

# 关键创新:
# 1. 预训练: 在 ~100M 数学问题上自我对弈
# 2. 自我强化: 解出简单问题→生成训练数据→攻克更难问题
# 3. 变体训练: 从 AMM/AIME/IMO 问题生成变体
# 4. 长时间搜索: 最难的题花了 3 天时间

# AlphaProof 解题时间:
# ┌──────┬──────────┬──────────┐
# │ 题目  │ 难度      │ 用时      │
# ├──────┼──────────┼──────────┤
# │ P1   │ 中等      │ ~数小时   │
# │ P2   │ 中等      │ ~数小时   │
# │ P4   │ 中等      │ 数分钟    │
# │ P6   │ 最难      │ ~3天      │
# └──────┴──────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📐 AlphaGeometry：AI 几何推理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> alphageometry</div>
                <pre className="fs-code">{`# AlphaGeometry: 超越人类的几何推理

# 论文: "Solving olympiad geometry without human
#        demonstrations" (Nature, Jan 2024)

# ═══ 问题 ═══
# 几何证明: 给定条件→证明结论
# IMO 级几何: 需要辅助构造 + 多步推理
# 传统 AI: 几乎无法处理 (符号搜索爆炸)

# ═══ 核心方法: 符号推理 + 神经网络 ═══
AlphaGeometry_arch = {
    "符号推理器 (DD+AR)": {
        "DD": "代数推导 (Deductive Database)",
        "AR": "角度/距离关系推理",
        "功能": "给定已知条件→推导新事实",
        "局限": "不会添加辅助构造",
    },
    
    "语言模型 (Transformer)": {
        "训练数据": "1亿合成几何问题",
        "功能": "建议辅助点/线/圆构造",
        "关键": "打破符号推理的瓶颈",
    },
    
    "协作流程": """
    1. 符号推理器尝试直接证明
       → 如果成功 → 完成
       → 如果失败 ↓
    2. 语言模型建议辅助构造
       (添加辅助点/圆/平行线等)
    3. 将新构造加入前提
    4. 符号推理器再次尝试
    5. 重复直到成功或超时
    """,
}

# ═══ 数据生成 (关键创新) ═══
data_generation = {
    "问题": "IMO 几何证明数据极少 (~1000题)",
    "解决": "合成数据生 (1亿题)",
    "方法": {
        "1. 随机采样": "随机生成几何图形",
        "2. 前向推理": "DD 推导所有可达定理",
        "3. 回溯": "选择有趣的定理作为目标",
        "4. 提取证明": "记录推理路径",
    },
    "质量控制": "过滤平凡/重复/过难的问题",
}

# ═══ 结果 ═══
# IMO 几何题 (2000-2024, 30题):
# ├── AlphaGeometry 1: 25/30 (超越IMO金牌中位)
# ├── AlphaGeometry 2: 28/30
# ├── IMO 金牌选手中位: 25.9/30
# ├── 传统AI最佳: 10/30
# └── Wu's 方法: 10/30

# AlphaGeometry 2 改进:
# ├── 更强的语言模型 (Gemini-based)
# ├── 更多合成训练数据
# ├── 更多辅助构造类型
# └── 更好的搜索策略

# 意义:
# ├── 首次 AI 在几何推理超越人类精英
# ├── 符号 + 神经的优美结合
# ├── 合成数据解决了训练数据不足
# └── 可解释的证明 (不是黑箱)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔧 LeanDojo 与形式化证明</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> leandojo_formal</div>
                <pre className="fs-code">{`# 形式化证明 & LeanDojo

# ═══ 什么是形式化证明? ═══
formal_proof = {
    "定义": "在严格的逻辑系统中机器可验证的证明",
    "特点": [
        "每一步推理都由计算机验证",
        "不可能有逻辑错误",
        "从公理出发→层层推导→结论",
    ],
    "意义": [
        "数学证明的最高标准",
        "软件验证/硬件验证",
        "AI 定理证明的基础设施",
    ],
}

# ═══ 形式化验证语言 ═══
proof_assistants = {
    "Lean 4": {
        "开发": "微软/Leonardo de Moura",
        "特点": "现代/快速/强类型",
        "数学库": "Mathlib4 (~100万行)",
        "AI选择": "AlphaProof/LeanDojo 首选",
    },
    "Coq": {
        "特点": "成熟/大量验证案例",
        "成果": "四色定理/Feit-Thompson",
    },
    "Isabelle": {
        "特点": "强大的自动化",
        "成果": "素数定理/Kepler猜想",
    },
    "Agda": "依赖类型/同伦类型论",
}

# ═══ LeanDojo ═══
LeanDojo = {
    "论文": "2023, Caltech + CMU",
    "贡献": {
        "数据提取": "从Mathlib提取训练数据",
        "Benchmark": "标准化的Lean证明基准",
        "ReProver": "基线检索增强证明器",
        "工具": "Python操控Lean的接口",
    },
    "ReProver 方法": {
        "检索": "从Mathlib检索相关引理",
        "生成": "Transformer生成proof tactic",
        "验证": "Lean内核验证每步",
        "搜索": "best-first search",
    },
}

# ═══ AI 定理证明方法对比 ═══
# ┌──────────────┬──────────────┬──────────┐
# │ 方法          │ 代表          │ 特点     │
# ├──────────────┼──────────────┼──────────┤
# │ 纯神经网络   │ GPT-f         │ LLM生成  │
# │ 检索+生成    │ ReProver      │ RAG+验证 │
# │ RL搜索       │ AlphaProof    │ 最强     │
# │ 专家迭代     │ LEGO-Prover   │ 自我改进 │
# │ 符号+神经    │ AlphaGeometry │ 混合     │
# └──────────────┴──────────────┴──────────┘

# Lean 4 证明示例:
lean_example = """
-- 证明: 任意自然数 n, n + 0 = n
theorem add_zero (n : ℕ) : n + 0 = n := by
  induction n with
  | zero => rfl
  | succ n ih => simp [Nat.add_succ, ih]

-- 证明: 加法交换律
theorem add_comm (a b : ℕ) : a + b = b + a := by
  induction a with
  | zero => simp
  | succ a ih => simp [Nat.succ_add, ih]
"""

# AI 生成证明的流程:
# 1. 接收目标 (goal): ⊢ P
# 2. LLM 生成 tactic: "apply Nat.recOn a"
# 3. Lean 执行 tactic → 新子目标
# 4. 重复直到所有子目标关闭 (QED)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 数学 AI 生态全景</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> math_ai_ecosystem</div>
                <pre className="fs-code">{`# 数学 AI 生态系统

# ═══ 数学推理大模型 ═══
math_llms = {
    "DeepSeek-Prover-V2 (2025)": {
        "方法": "RL+长思维链+Lean证明",
        "能力": "自动形式化+证明搜索",
        "精度": "miniF2F 88.9% (SOTA)",
    },
    "Minerva (Google)": {
        "训练": "科学论文+数学文本",
        "能力": "数学/科学定量推理",
        "精度": "MATH benchmark 50%+",
    },
    "Llemma (EleutherAI)": {
        "基座": "Code Llama 34B",
        "数据": "Proof-Pile (数学语料)",
        "开源": "完全开源",
    },
    "InternLM-Math": "上海AI Lab数学模型",
    "WizardMath": "Evol-Instruct数学增强",
}

# ═══ 数学发现 ═══
math_discovery = {
    "FunSearch (DeepMind, 2024)": {
        "方法": "LLM+进化搜索→发现新数学函数",
        "成果": [
            "帽盒问题(cap set)新下界",
            "在线装箱问题新启发式",
        ],
        "意义": "LLM首次发现新数学知识",
    },
    "AI 猜想生成": {
        "Ramanujan Machine": "自动发现恒等式",
        "AI Mathematician": "猜想→证明循环",
    },
}

# ═══ 重要基准测试 ═══
benchmarks = {
    "MATH": "12,500道竞赛数学题",
    "GSM8K": "小学数学应用题",
    "miniF2F": "Lean/Isabelle 形式化基准",
    "ProofNet": "本科数学形式化",
    "GHOSTS": "研究生级数学推理",
    "PutnamBench": "大学数学竞赛",
}

# ═══ 开源工具 ═══
tools = {
    "Lean 4": "形式化验证语言",
    "Mathlib4": "Lean的数学库 (100万行+)",
    "LeanDojo": "AI+Lean的桥接工具",
    "ntp-toolkit": "神经定理证明工具包",
    "SageMath": "开源数学计算系统",
    "SymPy": "Python符号计算",
}

# ═══ 未来方向 ═══
future = {
    "Lean Mathlib 完善": "形式化更多数学",
    "自动形式化": "自然语言→Lean 自动翻译",
    "AI 数学家": "提出猜想+构造证明",
    "模块化推理": "将大证明分解为子问题",
    "跨域推理": "数学+物理+CS 联合推理",
}

# 数学AI的价值:
# ├── 验证: 杜绝"证明"中的人为错误
# ├── 发现: 找到人类未想到的新结果  
# ├── 教育: 个性化数学辅导
# ├── 工程: 验证关键系统的正确性
# └── 基础: 推动 AGI 的推理能力`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
