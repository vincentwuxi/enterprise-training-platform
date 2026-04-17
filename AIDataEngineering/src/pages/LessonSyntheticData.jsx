import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['LLM 合成', '对抗生成', '仿真数据', '隐私保护'];

export default function LessonSyntheticData() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🏗️ module_03 — 合成数据生成</div>
      <div className="fs-hero">
        <h1>合成数据：解决 AI 训练数据瓶颈的终极武器</h1>
        <p>
          互联网高质量文本即将耗尽，合成数据成为 AI 发展的<strong>关键变量</strong>。
          Llama 3 的数学能力来自合成数据，Phi-3 80% 训练数据是合成的。
          本模块覆盖 LLM 驱动合成（Self-Instruct/Evol-Instruct/Magpie）、
          对抗生成（GAN/扩散模型）、仿真数据（数字孪生）、
          以及差分隐私下的合成数据生成。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧪 合成数据</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🤖 LLM 驱动合成数据</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> llm_synthetic.py</div>
                <pre className="fs-code">{`# —— LLM 合成数据: 主流方法 ——

# 1. Self-Instruct (Stanford Alpaca)
# 种子指令 → LLM 生成新指令 → 过滤 → 训练
class SelfInstruct:
    async def generate(self, seed_instructions, n=10000):
        """Self-Instruct: 从种子指令扩展"""
        generated = []
        for batch in range(n // 10):
            # 随机选 3 条种子作为示例
            examples = random.sample(seed_instructions + generated[:1000], 3)
            
            prompt = f"""
以下是一些任务指令示例:
{self._format_examples(examples)}

请生成 10 条新的、多样化的任务指令。
要求:
- 涵盖不同领域 (编程/写作/数学/推理/翻译)
- 难度多样 (简单/中等/困难)
- 避免与示例重复
每条指令同时给出高质量回答。
"""
            new_tasks = await self.llm.generate(prompt)
            # 过滤: 去重 + 质量检查
            filtered = self._filter(new_tasks, generated)
            generated.extend(filtered)
        
        return generated

# 2. Evol-Instruct (WizardLM)
# 指令进化: 简单 → 复杂, 增加约束/步骤/深度
class EvolInstruct:
    EVOLUTION_STRATEGIES = [
        "增加约束条件",    # "写一首诗" → "写一首关于AI的七言绝句"
        "增加推理步骤",    # "x+1=3, x=?" → "多元方程组"
        "替换为更复杂概念", # "排序" → "拓扑排序"
        "增加输入复杂度",  # "翻译一句话" → "翻译一篇有术语的论文"
        "深化问题",       # "什么是ML?" → "解释kernel trick的直觉"
    ]
    
    async def evolve(self, instruction, strategy):
        """进化一条指令"""
        prompt = f"""
原始指令: {instruction}
进化策略: {strategy}

请将原始指令进化为更复杂、更具挑战性的版本。
保持任务本质不变, 但显著提升难度。
"""
        return await self.llm.generate(prompt)

# 3. Magpie (2024, Allen AI)
# 只给 system prompt → LLM 自动生成 user 指令
# 原理: 利用 LLM 训练时的指令分布
class Magpie:
    async def generate(self, system_prompt, n=10000):
        """Magpie: 利用 LLM 自身生成指令"""
        pairs = []
        for _ in range(n):
            # 只给 system prompt 和 "User:" 前缀
            # LLM 会自动补全一个合理的 user 指令
            instruction = await self.llm.generate(
                system=system_prompt,
                user_prefix="",  # 空! LLM 自己补全
                stop_at="\\nAssistant:"
            )
            # 然后用 instruction 生成 response
            response = await self.llm.generate(
                system=system_prompt,
                user=instruction
            )
            pairs.append({"instruction": instruction, "response": response})
        return pairs`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🎨 对抗生成 (GAN/Diffusion)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> generative</div>
                <pre className="fs-code">{`对抗/生成式合成数据:

1️⃣ GAN (生成对抗网络)
├── 适用: 图像/表格/时序数据
├── 优势: 高保真, 多样性好
├── 劣势: 训练不稳定, 模式崩溃
│
│ 图像合成:
│ ├── StyleGAN3: 人脸/产品图
│ ├── DatasetGAN: 带标注的合成图
│ └── 应用: 医疗影像 (罕见病)
│
│ 表格合成:
│ ├── CTGAN: 条件表格 GAN
│ ├── SDV (Synthetic Data Vault)
│ └── 应用: 金融欺诈检测 (正样本少)

2️⃣ Diffusion Models
├── 适用: 图像/3D/视频
├── DALL-E 3 / Stable Diffusion
├── 优势: 质量最高, 可控性强
├── 应用场景:
│   ├── 自动驾驶: 生成极端场景
│   ├── 医疗: 生成病理图像
│   ├── 零售: 生成产品展示图
│   └── 安防: 生成异常事件

3️⃣ 数据增强 (Augmentation)
├── 文本: 回译/同义替换/EDA
├── 图像: 翻转/旋转/CutMix
├── 音频: 速度变换/噪声注入
└── 表格: SMOTE/ADASYN`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🧪 合成数据质量评估</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> quality.py</div>
                <pre className="fs-code">{`# 合成数据质量评估框架

class SyntheticDataQuality:
    """合成数据质量评估"""
    
    def evaluate(self, real_data, synthetic_data):
        """全方位质量评估"""
        return {
            # 1. 保真度 (Fidelity)
            # 合成数据多像真实数据?
            "fidelity": self.fidelity_score(
                real_data, synthetic_data
            ),
            
            # 2. 多样性 (Diversity)
            # 合成数据覆盖了多少模式?
            "diversity": self.diversity_score(
                synthetic_data
            ),
            
            # 3. 下游效用 (Utility)
            # 用合成数据训练, 效果如何?
            "utility": self.train_and_eval(
                synthetic_data, real_test_set
            ),
            
            # 4. 隐私风险
            # 是否泄露了真实数据点?
            "privacy_risk": self.membership_inference(
                real_data, synthetic_data
            ),
            
            # 5. 新颖性
            # 有多少是真正新生成的?
            "novelty": self.novelty_score(
                real_data, synthetic_data
            )
        }

# 合成 vs 真实数据效果:
# ┌──────────┬──────┬──────┬──────┐
# │ 数据比例  │ 100% │ 50%  │ 0%   │
# │          │ 真实 │ 混合 │ 合成 │
# ├──────────┼──────┼──────┼──────┤
# │ 文本分类  │ 92%  │ 91%  │ 85%  │
# │ 代码生成  │ 78%  │ 80%  │ 75%  │
# │ 数学推理  │ 65%  │ 72%  │ 68%  │
# └──────────┴──────┴──────┴──────┘
# 发现: 混合数据有时 > 纯真实!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏙️ 仿真数据 (Simulation)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> simulation</div>
                <pre className="fs-code">{`# —— 仿真数据: 物理引擎 / 数字孪生 ——

# 适用场景: 真实数据采集昂贵或危险

# 1. 自动驾驶仿真
# CARLA / AirSim / NVIDIA DRIVE Sim
仿真场景 = {
    "天气":     ["晴天", "雨天", "雾天", "暴雪", "夜间"],
    "交通":     ["拥堵", "空旷", "事故", "施工"],
    "行人":     ["老人", "儿童", "宠物", "轮椅"],
    "特殊事件": ["动物穿越", "信号灯故障", "逆行车辆"],
}
# 组合: 5 × 4 × 4 × 4 = 320 种场景
# 每个场景生成 1000 帧 → 32 万张标注图像
# 成本: 仿真 $0.01/帧 vs 真实标注 $2/帧 (200x 便宜!)

# 2. 机器人仿真
# Isaac Sim / MuJoCo / PyBullet
# 训练机械臂抓取: 仿真中失败 100 万次 → 真实世界成功一次

# 3. 医疗仿真
# 合成 CT/MRI 扫描 (罕见疾病, 真实数据极少)
# GAN 生成 + 放射科医生验证
# 效果: 罕见病检测 F1 从 0.45 → 0.72

# 4. 金融仿真
# 模拟股票市场极端事件 (黑天鹅)
# Agent-Based Model + Monte Carlo
# 生成历史从未发生过的市场崩盘场景

Sim-to-Real 迁移挑战:
┌────────────────────────────────────────────┐
│ 仿真 ≠ 真实 (Reality Gap)                   │
│                                            │
│ 缓解策略:                                   │
│ 1. Domain Randomization (随机化仿真参数)     │
│ 2. Domain Adaptation (适配真实域)            │
│ 3. 仿真+真实混合训练 (95:5 比例)             │
│ 4. 持续校准 (定期用真实数据校正)              │
└────────────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔒 隐私保护合成数据</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> privacy.py</div>
                <pre className="fs-code">{`# 差分隐私合成数据

from opacus import PrivacyEngine

class DPSyntheticGenerator:
    """差分隐私保护的合成数据"""
    
    def __init__(self, epsilon=1.0, delta=1e-5):
        """
        epsilon: 隐私预算 (越小越安全)
          ε=0.1: 强隐私 (质量↓)
          ε=1.0: 中等 (平衡)
          ε=10:  弱隐私 (质量↑)
        """
        self.epsilon = epsilon
        self.delta = delta
    
    def train_dp_model(self, real_data):
        """用差分隐私训练生成器"""
        model = Generator()
        optimizer = torch.optim.Adam(model.parameters())
        
        # Opacus 包装: 自动加噪
        privacy_engine = PrivacyEngine()
        model, optimizer, dataloader = privacy_engine.make_private(
            module=model,
            optimizer=optimizer,
            data_loader=dataloader,
            noise_multiplier=1.0,
            max_grad_norm=1.0,
        )
        
        # 训练到隐私预算用尽
        for epoch in range(100):
            for batch in dataloader:
                loss = self.train_step(model, batch)
            
            eps = privacy_engine.get_epsilon(delta=self.delta)
            if eps >= self.epsilon:
                break  # 预算用尽
        
        return model

# 应用: 
# 医院 A 有患者数据 → 不能直接共享
# → 生成 DP 合成数据 → 安全共享给研究者
# → 研究者用合成数据训练模型
# → 隐私保证: 无法从合成数据反推个人`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>📊 合成数据趋势</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> trends</div>
                <pre className="fs-code">{`2025-2026 合成数据趋势:

📈 市场规模:
├── 2024: $1.2B
├── 2025: $2.5B (预估)
└── 2028: $8B+ (Gartner预测)

🏢 主要玩家:
├── Mostly AI: 表格合成领先
├── Gretel AI: 隐私保护合成
├── Synthesis AI: CV 合成数据
├── Datagen: 人体/人脸合成
└── 各大 LLM 厂商 (自产自销)

🔮 技术趋势:
├── LLM-as-generator 成为主流
│   (GPT-4o 生成训练数据)
├── 合成数据占比持续上升
│   2024: ~30% → 2026: ~60%
├── 多模态合成数据爆发
│   图文/视频/音频联合生成
├── 合成数据质量自动评估
│   LLM-as-judge 评估合成质量
└── 法规推动隐私合成
   GDPR/CCPA → DP合成需求↑

⚠️ 风险:
├── Model Collapse (自我训练退化)
├── 合成偏差放大
├── 版权争议 (训练数据合规)
└── 过度依赖合成 → 脱离现实`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
