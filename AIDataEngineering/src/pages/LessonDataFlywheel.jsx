import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['飞轮原理', '主动学习', '数据增强', '持续改进'];

export default function LessonDataFlywheel() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🏗️ module_04 — 数据飞轮</div>
      <div className="fs-hero">
        <h1>数据飞轮：让模型越用越强的正循环</h1>
        <p>
          Tesla 的自动驾驶为什么越来越好？因为每辆车都是数据采集器，
          <strong>用户越多 → 数据越好 → 模型越强 → 用户越多</strong>。
          这就是数据飞轮。本模块覆盖飞轮架构设计、主动学习（让模型选择最有价值的数据）、
          智能数据增强策略、以及持续改进的闭环反馈系统。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔄 数据飞轮</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚙️ 数据飞轮原理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> data_flywheel</div>
                <pre className="fs-code">{`数据飞轮 (Data Flywheel):

基本闭环:
┌────────────┐     ┌────────────┐
│   更多用户  │────▶│  更多数据  │
│   More Users│     │  More Data │
└──────┬─────┘     └──────┬─────┘
       │                  │
       ▲                  ▼
       │           ┌────────────┐
       │           │  更好模型  │
       └───────────│Better Model│
                   └────────────┘

工程级飞轮:
┌──────────────────────────────────────────────────┐
│ 1. 数据收集层                                      │
│    用户交互 → 日志 → 反馈 (显式/隐式)              │
│    └── 点击/停留/点赞/投诉/修正                     │
└───────────────┬──────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────┐
│ 2. 数据处理层                                      │
│    清洗 → 去重 → 标注 → 质量过滤                    │
│    └── 自动标注 (模型预测作为弱标签)                │
└───────────────┬──────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────┐
│ 3. 模型训练层                                      │
│    增量训练 → A/B 测试 → 上线                       │
│    └── 自动 ML Pipeline (Kubeflow/Airflow)         │
└───────────────┬──────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────┐
│ 4. 效果监控层                                      │
│    线上指标 → 错误分析 → 定向补数据                  │
│    └── 发现短板 → 针对性数据收集                    │
└──────────────────────────────────────────────────┘

实际案例:
Tesla 飞轮:
├── 300万辆车 → 每天 1600 万英里数据
├── Shadow Mode: 保存有趣场景 (trigger)
├── 自动标注: 已有模型标注简单场景
├── 人工标注: 困难场景 + 边界案例
└── 每 2-4 周推送新模型 OTA

ChatGPT 飞轮:
├── 1亿用户 → 海量对话数据
├── RLHF: 用户反馈 (👍/👎) → 训练信号
├── 对话质量持续提升
└── 竞对无法复制的数据壁垒`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 主动学习 (Active Learning)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> active_learning.py</div>
                <pre className="fs-code">{`# —— 主动学习: 让模型选择最有价值的数据 ——

class ActiveLearner:
    """主动学习: 最少标注成本 → 最大模型提升"""
    
    # 核心思想: 不是所有数据都同等有价值
    # 让模型自己告诉我们: "我对哪些样本最不确定?"
    # 然后只标注那些"最有信息量"的样本
    
    def uncertainty_sampling(self, model, unlabeled_pool, k=100):
        """不确定性采样: 选模型最犹豫的样本"""
        uncertainties = []
        
        for sample in unlabeled_pool:
            probs = model.predict_proba(sample)
            
            # 策略 1: 最高概率最低 (Least Confidence)
            least_conf = 1 - max(probs)
            
            # 策略 2: 熵最大 (Entropy)
            entropy = -sum(p * log(p) for p in probs if p > 0)
            
            # 策略 3: 前两高概率差最小 (Margin)
            sorted_p = sorted(probs, reverse=True)
            margin = sorted_p[0] - sorted_p[1]
            
            uncertainties.append((sample, entropy))
        
        # 选最不确定的 k 个出来标注
        uncertainties.sort(key=lambda x: x[1], reverse=True)
        return [s for s, _ in uncertainties[:k]]
    
    def diversity_sampling(self, unlabeled_pool, k=100):
        """多样性采样: 选最有代表性的样本"""
        # 用 K-Means 聚类, 每个簇选一个
        embeddings = self.encoder.encode(unlabeled_pool)
        kmeans = KMeans(n_clusters=k).fit(embeddings)
        
        # 每个簇选离中心最近的样本
        selected = []
        for i in range(k):
            cluster_samples = np.where(kmeans.labels_ == i)[0]
            distances = np.linalg.norm(
                embeddings[cluster_samples] - kmeans.cluster_centers_[i], axis=1
            )
            selected.append(cluster_samples[np.argmin(distances)])
        
        return [unlabeled_pool[i] for i in selected]
    
    def hybrid_sampling(self, model, unlabeled_pool, k=100):
        """混合: 不确定性 + 多样性"""
        # 先选 3k 个不确定的
        uncertain = self.uncertainty_sampling(model, unlabeled_pool, k=k*3)
        # 再从中选 k 个最多样的
        diverse = self.diversity_sampling(uncertain, k=k)
        return diverse

# 主动学习效果:
# 传统: 标注 10000 条 → 准确率 90%
# 主动学习: 标注 2000 条 → 准确率 90%
# → 节省 80% 标注成本!`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📈 智能数据增强</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> augmentation.py</div>
                <pre className="fs-code">{`# 数据增强策略

# 1. 文本增强
class TextAugmentor:
    def back_translation(self, text, pivot="zh"):
        """回译增强: en→zh→en"""
        translated = translate(text, target=pivot)
        back = translate(translated, target="en")
        return back  # 语义保持, 表达不同
    
    def synonym_replace(self, text, n=3):
        """同义词替换"""
        words = text.split()
        for _ in range(n):
            idx = random.choice(range(len(words)))
            words[idx] = get_synonym(words[idx])
        return " ".join(words)
    
    def llm_paraphrase(self, text):
        """LLM 改写 (最强)"""
        return llm.generate(
            f"改写以下文本,保持语义不变:"
            f"\\n{text}"
        )
    
    def contextual_augment(self, text):
        """上下文增强: BERT MLM 替换"""
        masked = mask_random_token(text)
        return bert.fill_mask(masked)

# 2. 图像增强
# ├── 几何: 翻转/旋转/缩放/裁剪
# ├── 颜色: 亮度/对比度/饱和度
# ├── 噪声: 高斯/椒盐
# ├── 遮挡: CutOut/Random Erasing
# ├── 混合: MixUp/CutMix/Mosaic
# └── 生成: Diffusion 增强

# 3. 音频增强
# ├── 速度: TimeStretch (0.8x-1.2x)
# ├── 音高: PitchShift (±2半音)
# ├── 噪声: 背景噪声叠加
# └── 混响: Room Impulse Response`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔄 增强策略选择</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> strategy</div>
                <pre className="fs-code">{`数据增强策略选择:

按任务类型:
┌──────────┬───────────────────┐
│ 任务      │ 推荐增强策略       │
├──────────┼───────────────────┤
│ 文本分类  │ 回译+同义替换      │
│ NER      │ 实体替换+句式改写  │
│ QA       │ LLM改写+反事实    │
│ 对话     │ Magpie+多轮扩展   │
│ 图像分类 │ RandAugment       │
│ 目标检测 │ Mosaic+MixUp      │
│ 语义分割 │ CutMix+弹性变形   │
│ 语音识别 │ SpecAugment       │
└──────────┴───────────────────┘

增强比例指南:
├── 数据 < 1K: 增强 5-10 倍
├── 数据 1K-10K: 增强 2-5 倍
├── 数据 > 10K: 增强 1-2 倍
└── 注意过拟合增强数据

自动增强 (AutoAugment):
├── 搜索最优增强策略组合
├── Google AutoAugment
├── RandAugment (更简单)
├── TrivialAugment (最新)
└── 用验证集效果选策略

⚠️ 增强不能:
├── ❌ 替代更多真实数据
├── ❌ 修复标注错误
├── ❌ 弥补类别分布失衡
└── ❌ 引入新的知识`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>♻️ 持续改进闭环</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> continuous_improvement.py</div>
                <pre className="fs-code">{`# —— 数据飞轮: 持续改进系统 ——

class DataFlywheel:
    """端到端数据飞轮系统"""
    
    async def run_improvement_cycle(self):
        """一个完整的改进循环"""
        
        # 1. 收集线上反馈
        feedback = await self.collect_feedback()
        # 显式: 用户点赞/差评/修正
        # 隐式: 停留时间/重试次数/放弃率
        
        # 2. 错误分析 (Error Analysis)
        errors = await self.error_analysis(feedback)
        # 分类: "数学题错误率40%", "长文本幻觉30%"
        # → 定位短板领域
        
        # 3. 定向数据收集
        collection_plan = self.plan_data_collection(errors)
        # 数学弱 → 收集更多数学题
        # 幻觉多 → 收集事实性 QA
        
        # 4. 标注 + 合成
        new_data = []
        # 真实数据标注 (高质量, 贵)
        labeled = await self.label_with_human(collection_plan["critical"])
        # 合成数据补充 (大量, 便宜)
        synthetic = await self.generate_synthetic(collection_plan["augment"])
        new_data = labeled + synthetic
        
        # 5. 增量训练
        model_v2 = await self.incremental_train(
            base_model=self.current_model,
            new_data=new_data,
            old_data_sample=self.replay_buffer  # 防遗忘
        )
        
        # 6. A/B 测试
        test_result = await self.ab_test(
            model_a=self.current_model,  # 旧版
            model_b=model_v2,             # 新版
            traffic_split=0.1,            # 10% 流量
            duration_hours=72
        )
        
        # 7. 上线 & 更新指标
        if test_result["b_wins"]:
            await self.deploy(model_v2)
            self.log_improvement(test_result)
        
        # 循环周期: 1-4 周
        # 每轮预期提升: 1-3% (积累效应巨大)

    async def error_analysis(self, feedback):
        """自动错误分析: LLM 辅助"""
        return await self.llm.generate(f"""
分析以下用户反馈, 识别模型的主要弱点:
{json.dumps(feedback[:100])}

输出:
1. 错误分类 (按类型分组)
2. 每类错误的根因分析
3. 建议的数据补充方向
4. 优先级排序
""")`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
