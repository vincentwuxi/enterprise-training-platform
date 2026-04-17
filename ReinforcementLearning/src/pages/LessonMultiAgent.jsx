import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['MARL 基础', '合作学习', '竞争与博弈', '通信与涌现'];

export default function LessonMultiAgent() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge teal">🤝 module_07 — 多智能体 RL</div>
      <div className="fs-hero">
        <h1>多智能体强化学习：合作 / 竞争 / 通信 / 涌现行为</h1>
        <p>
          当多个 Agent 共存时，环境变成<strong>非平稳的</strong>（其他 Agent 也在学习）。
          本模块从 MARL 的独特挑战出发，覆盖合作学习 (QMIX/MAPPO)、
          竞争博弈 (Self-Play/Nash)、通信机制 (CommNet/TarMAC)，
          以及 <strong>LLM 多智能体系统</strong>等前沿话题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🤝 多智能体 RL</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🌐 MARL: 多智能体基础</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#14b8a6'}}></span> marl_foundations</div>
              <pre className="fs-code">{`# MARL: Multi-Agent Reinforcement Learning

# ═══ 为什么 MARL 更难? ═══
# 单 Agent: 环境是平稳的 → MDP
# 多 Agent: 其他 Agent 也在学习 → 环境在变!
# → 不再是 MDP, 而是 Stochastic Game

# ═══ 随机博弈 (Stochastic Game) ═══
# (N, S, {A_i}, P, {R_i}, γ)
# N: 智能体数量
# S: 全局状态空间
# A_i: 智能体 i 的动作空间
# P: 联合转移 P(s'|s, a_1,...,a_N)
# R_i: 智能体 i 的奖励函数
# → 每个 Agent 的最优策略取决于其他 Agent!

# ═══ MARL 的三大范式 ═══
paradigms = {
    "完全合作": {
        "奖励": "共享: R_1 = R_2 = ... = R_N",
        "例子": "机器人搬运, 星际争霸 (同一队)",
        "目标": "最大化团队总奖励",
    },
    "完全竞争": {
        "奖励": "零和: R_1 = -R_2",
        "例子": "围棋, 扑克, RTS 对战",
        "目标": "找到 Nash 均衡",
    },
    "混合动机": {
        "奖励": "部分合作+部分竞争",
        "例子": "交通, 拍卖, 议价",
        "目标": "帕累托最优 + 公平",
    },
}

# ═══ 训练范式 ═══
# 1. 独立学习 (IL): 每个 Agent 独立训练
#    简单但不稳定 (环境非平稳!)
# 2. CTDE: Centralized Training, Decentralized Execution
#    训练时共享信息, 执行时独立决策
#    → 当前主流方法!
# 3. 完全中心化: 一个 Agent 控制所有
#    联合动作空间指数增长: |A|^N

# ═══ 核心挑战 ═══
challenges = {
    "非平稳性":       "其他 Agent 策略在变 → MDP 假设不成立",
    "信用分配":       "团队奖励, 但谁贡献了? (Credit Assignment)",
    "部分可观测":     "每个 Agent 只看到局部信息 (Dec-POMDP)",
    "维度爆炸":       "联合状态/动作空间随 Agent 数指数增长",
    "探索困难":       "需要协调探索策略",
    "通信学习":       "Agent 需要学会何时、说什么",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🤲 合作学习</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> cooperative_marl</div>
              <pre className="fs-code">{`# 合作 MARL: 团队共享奖励, 需要协调

# ═══ 1. IQL (Independent Q-Learning) ═══
# 最简单: 每个 Agent 独立运行 Q-Learning
# 问题: 环境非平稳 → 收敛困难
# 适用: Agent 间交互弱的场景

# ═══ 2. VDN (Value Decomposition Networks) ═══
# Q_total(s, a_1,...,a_N) = Σ Q_i(s_i, a_i)
# 团队 Q = 个体 Q 之和
# 简单但表达力有限 (加性假设太强)

# ═══ 3. QMIX ═══
# Q_total = f(Q_1,...,Q_N) — 非线性混合但单调
# 单调性: ∂Q_total/∂Q_i ≥ 0
# → 保证: argmax Q_total = (argmax Q_1,..., argmax Q_N)
# → 分散执行时, 每个 Agent 可以独立贪心!

# QMIX 架构:
# 个体 Q: Q_i(τ_i, a_i) — 每个 Agent 独立计算
# 混合网络: 用超网络生成权重
# 超网络输入: 全局状态 s (训练时可见)
# 约束: 混合网络权重 ≥ 0 (保证单调性)

class QMIXMixer(nn.Module):
    def __init__(self, n_agents, state_dim, embed_dim=32):
        super().__init__()
        self.hyper_w1 = nn.Sequential(
            nn.Linear(state_dim, embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, n_agents * embed_dim),
        )
        self.hyper_w2 = nn.Sequential(
            nn.Linear(state_dim, embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, embed_dim),
        )
    
    def forward(self, agent_qs, state):
        # agent_qs: [B, n_agents]
        w1 = torch.abs(self.hyper_w1(state))  # 非负权重!
        w2 = torch.abs(self.hyper_w2(state))
        # 混合
        hidden = F.elu(torch.bmm(agent_qs.unsqueeze(1), w1))
        q_total = torch.bmm(hidden, w2).squeeze()
        return q_total

# ═══ 4. MAPPO ═══
# 多智能体 PPO, 当前合作 MARL 的王者
# 共享参数 + 集中式 Critic
# 在 SMAC (星际争霸微操) 上表现最佳
# 关键: 很多 PPO 工程技巧在 MARL 里同样有效!`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚔️ 竞争与博弈</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> competitive_marl</div>
              <pre className="fs-code">{`# 竞争 MARL: 零和博弈与自我博弈

# ═══ Nash 均衡 ═══
# 在 Nash 均衡中, 没有任何 Agent 能单方面改善
# 两人零和: minimax 解 = Nash 均衡
# V*(s) = max_π1 min_π2 E[Σ γ^t r_t]

# ═══ Self-Play (自我博弈) ═══
# Agent 与自己的副本对战 → 不断进步!
# → AlphaGo / AlphaZero / OpenAI Five 的核心

# AlphaGo 的进化:
alphago_evolution = {
    "AlphaGo Fan (2015)": {
        "方法": "SL (人类棋谱) + MCTS + RL self-play",
        "成绩": "5-0 战胜樊麾 (欧洲冠军)",
    },
    "AlphaGo Lee (2016)": {
        "方法": "更大网络 + 更多训练",
        "成绩": "4-1 战胜李世石",
    },
    "AlphaGo Zero (2017)": {
        "方法": "纯 self-play, 无人类数据!",
        "成绩": "100-0 击败 AlphaGo Lee",
        "关键": "ResNet + MCTS + Policy+Value 双头",
    },
    "AlphaZero (2018)": {
        "方法": "通用化: 围棋+国际象棋+将棋",
        "成绩": "击败所有专用 AI",
    },
    "MuZero (2020)": {
        "方法": "学习环境模型 (不需要规则!)",
        "成绩": "Atari + 棋类统一",
    },
}

# ═══ OpenAI Five (2019) ═══
# Dota 2 — 复杂度远超围棋:
# 实时决策 / 不完全信息 / 5v5 团队 / 10万+动作空间
openai_five = {
    "算法":   "PPO + 自我博弈",
    "规模":   "256 GPU × 180天",
    "行业影响": "证明 RL 能处理复杂实时策略游戏",
}

# ═══ 虚拟自我博弈 (FSP) ═══
# 问题: 纯 self-play 容易遗忘 (循环策略)
# FSP: 保留历史策略, 均匀混合对手
# → 保证收敛到 Nash 均衡 (in two-player zero-sum)

# ═══ PSRO (Policy-Space Response Oracles) ═══
# FSP 的推广: 维护策略人口
# 每轮: 针对当前对手池训练最佳应对
# meta-game: 在策略池上求 Nash
# → 游戏 AI 和军事模拟中广泛使用`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>💬 通信与涌现行为</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> emergent_communication</div>
              <pre className="fs-code">{`# Agent 通信: 学会交流以实现更好的合作

# ═══ 可学习通信 ═══
# Agent 不仅学动作, 还学习发送/接收消息
# 框架:
#   观测 o_i → 编码 → 发送消息 m_i
#   接收其他 Agent 消息 ← 聚合 → 决策 a_i

# ═══ 通信架构 ═══
comm_methods = {
    "CommNet (2016)": {
        "方法": "连续向量通信, 均值聚合",
        "特点": "端到端可微, 全连接通信",
    },
    "TarMAC (2019)": {
        "方法": "Attention-based 目标通信",
        "特点": "Agent 学习向谁发消息",
    },
    "DIAL (2016)": {
        "方法": "离散消息 + REINFORCE",
        "特点": "通信信道有限 (更现实)",
    },
    "IC3Net (2019)": {
        "方法": "学习何时通信 (gating)",
        "特点": "减少不必要通信",
    },
}

# ═══ 涌现行为 ═══
# 复杂行为从简单规则和学习中自发产生
emergent_behaviors = {
    "分工合作":  "Agent 自发分化出不同角色",
    "语言产生":  "Agent 发明简单的通信协议",
    "工具使用":  "在 Hide-and-Seek 中学会使用道具",
    "社会规范":  "在重复博弈中形成合作惯例",
}

# ═══ OpenAI Hide-and-Seek (2019) ═══
# 捉迷藏: Hiders vs Seekers
# 训练过程中自发涌现 6 个阶段:
# 1. 随机跑 → 2. Seeker 追踪 → 3. Hider 用箱子建墙
# 4. Seeker 用坡道翻墙 → 5. Hider 锁住坡道
# 6. Seeker 利用 bug "冲浪" → 最终修复
# → 演化军备竞赛, 策略越来越复杂!

# ═══ LLM 多智能体系统 ═══
# 新前沿: 用 LLM 作为 Agent 的"大脑"
llm_multi_agent = {
    "AutoGen":    "微软多 Agent 对话框架",
    "CrewAI":     "角色化 Agent 团队",
    "MetaGPT":    "软件公司模拟 (PM/Dev/QA)",
    "ChatDev":    "对话驱动的软件开发",
    "Debate":     "LLM 辩论提升推理质量",
    "CAMEL":      "Role-Playing Agent 框架",
}
# → MARL 理论 + LLM 能力 = 下一代 AI 系统`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
