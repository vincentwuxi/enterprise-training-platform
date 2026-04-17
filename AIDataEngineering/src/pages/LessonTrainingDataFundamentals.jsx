import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['数据质量', '数据偏差', '生命周期', '规模法则'];

export default function LessonTrainingDataFundamentals() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🏗️ module_01 — 训练数据基础</div>
      <div className="fs-hero">
        <h1>训练数据：AI 模型质量的根基</h1>
        <p>
          "Garbage in, garbage out" 在 AI 时代更加致命——
          GPT-4 的成功 70% 归功于<strong>数据质量</strong>，而非模型架构。
          本模块从数据质量维度（准确性/一致性/完整性/时效性）出发，
          覆盖数据偏差分析（选择偏差/标注偏差/社会偏差）、
          数据生命周期管理，以及 Scaling Law 下的数据规模策略。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📊 数据基础</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 数据质量六维度</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> data_quality_framework</div>
                <pre className="fs-code">{`数据质量六维度模型:

┌─────────────┬──────────────────────────────────────────┐
│ 维度         │ 定义 & AI 训练中的影响                     │
├─────────────┼──────────────────────────────────────────┤
│ 1. 准确性    │ 数据是否真实反映现实                        │
│  Accuracy    │ ❌ 错误标注 → 模型学到错误模式               │
│              │ 例: 猫标成狗, 正面情感标成负面               │
├─────────────┼──────────────────────────────────────────┤
│ 2. 一致性    │ 不同标注者对同一样本是否一致                  │
│  Consistency │ ❌ 不一致 → 模型困惑, 学不到清晰边界         │
│              │ 衡量: Cohen's Kappa > 0.8 = 优秀           │
├─────────────┼──────────────────────────────────────────┤
│ 3. 完整性    │ 是否覆盖了任务所需的所有场景                  │
│  Completeness│ ❌ 长尾缺失 → 模型在边缘场景失败             │
│              │ 例: 训练集只有白人面孔 → 识别其他肤色差       │
├─────────────┼──────────────────────────────────────────┤
│ 4. 时效性    │ 数据是否反映当前状态                         │
│  Timeliness  │ ❌ 过期数据 → 模型幻觉 ("总统是特朗普?拜登?") │
│              │ LLM 知识截止点 = 时效性问题                  │
├─────────────┼──────────────────────────────────────────┤
│ 5. 多样性    │ 数据是否覆盖足够多的变体                     │
│  Diversity   │ ❌ 同质化 → 模型泛化能力差                   │
│              │ 例: 全是正式英语 → 不理解口语/方言            │
├─────────────┼──────────────────────────────────────────┤
│ 6. 可追溯性  │ 数据来源和处理过程是否可追踪                  │
│  Provenance  │ ❌ 不可追溯 → 无法定位问题/满足合规           │
│              │ 数据血缘 (Data Lineage) 是关键              │
└─────────────┴──────────────────────────────────────────┘

实际影响量化:
├── 标注准确率 95% → 97%: 模型性能 ↑ 3-5%
├── 数据多样性 ↑ 30%: 泛化能力 ↑ 10-15%
├── 数据量 ↑ 10x: 性能 ↑ 5-8% (对数关系)
└── 结论: 质量 > 数量 (当数据量足够时)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>⚠️ 数据偏差类型</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> bias_types</div>
                <pre className="fs-code">{`数据偏差 (Data Bias) 分类:

1️⃣ 选择偏差 (Selection Bias)
├── 定义: 样本不代表总体
├── 例: 只用英语训练 → 多语言差
├── 例: 只爬 Reddit → 男性视角偏重
└── 修复: 分层采样, 补充少数群体

2️⃣ 标注偏差 (Annotation Bias)
├── 定义: 标注者主观判断影响标签
├── 例: 文化差异导致情感判断不同
├── 例: 标注者疲劳 → 后期质量下降
└── 修复: 多人标注 + 仲裁机制

3️⃣ 历史偏差 (Historical Bias)
├── 定义: 数据反映了历史歧视
├── 例: "CEO"图片搜索→大多是男性
├── 例: 简历筛选偏向名校
└── 修复: 反事实增增 (Counterfactual)

4️⃣ 表示偏差 (Representation Bias)
├── 定义: 某些群体被过度/不足代表
├── 例: ImageNet 45% 是美国图片
├── 例: 中文数据中沿海城市过多
└── 修复: 加权采样, 数据增强

5️⃣ 测量偏差 (Measurement Bias)
├── 定义: 数据采集工具引入的偏差
├── 例: 低价手机拍照 → 图像模糊
├── 例: OCR 错误 → 文本噪声
└── 修复: 数据清洗, 多源验证`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🔍 偏差检测与缓解</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> bias_detection.py</div>
                <pre className="fs-code">{`# 偏差检测工具箱

import pandas as pd
from collections import Counter

class BiasDetector:
    """训练数据偏差检测"""
    
    def demographic_analysis(self, df, protected_attr):
        """人口统计分析"""
        dist = Counter(df[protected_attr])
        total = len(df)
        
        report = {}
        for group, count in dist.items():
            ratio = count / total
            report[group] = {
                "count": count,
                "ratio": f"{ratio:.1%}",
                "underrepresented": ratio < 0.1
            }
        return report
    
    def label_distribution(self, df, label_col, group_col):
        """标签分布差异检测"""
        # 不同群体的标签分布是否一致?
        for group in df[group_col].unique():
            subset = df[df[group_col] == group]
            print(f"{group}: {Counter(subset[label_col])}")
    
    def temporal_drift(self, df, time_col, feature_cols):
        """时间漂移检测"""
        # 数据分布是否随时间变化?
        for period in df[time_col].dt.quarter.unique():
            subset = df[df[time_col].dt.quarter == period]
            print(f"Q{period}: mean={subset[feature_cols].mean()}")

# 缓解策略:
# 1. 重采样 (Over/Under-sampling)
# 2. 加权损失 (Class Weights)
# 3. 反事实数据增强
# 4. 对抗性去偏 (Adversarial)
# 5. 公平性约束训练`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 数据生命周期管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> lifecycle</div>
                <pre className="fs-code">{`AI 训练数据生命周期:

┌─────────────────────────────────────────────────────────┐
│ 1. 数据发现 & 需求分析                                     │
│    "我需要什么数据? 多少? 什么质量?"                         │
│    └── 任务定义 → 数据需求文档 → 预算估算                    │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 2. 数据采集 (Collection)                                  │
│    爬虫 / API / 购买 / 众包 / 合成                         │
│    └── 来源多样化 → 合规审查 → 原始数据存储                  │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 3. 数据清洗 (Cleaning)                                    │
│    去重 / 过滤 / 去噪 / 格式标准化                          │
│    └── 质量检查 → 异常检测 → 数据验证                       │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 4. 数据标注 (Labeling)                                    │
│    人工标注 / LLM 辅助 / 半监督 / 弱监督                    │
│    └── 标注指南 → 质量控制 → 一致性检查                     │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 5. 数据增强 (Augmentation)                                │
│    翻转/裁剪/回译/同义替换/合成生成                          │
│    └── 增强策略 → 验证增强质量 → 平衡分布                   │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 6. 数据版本化 & 训练 (Versioning)                          │
│    DVC / HuggingFace Datasets / S3 + Metadata             │
│    └── 版本控制 → 训练实验 → 数据-模型关联追踪              │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 7. 数据反馈 & 迭代 (Feedback Loop)                         │
│    模型错误分析 → 针对性补充数据 → 重新训练                   │
│    └── 数据飞轮: 使用越多 → 数据越好 → 模型越强             │
└─────────────────────────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📈 Scaling Law & 数据</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> scaling_law</div>
                <pre className="fs-code">{`Scaling Law 中的数据维度:

Chinchilla 定律 (DeepMind):
模型参数量 N, 训练 token 数 D
最优比例: D ≈ 20 × N

┌────────────┬──────────┬────────────┐
│ 模型大小    │ 参数量    │ 最优数据量  │
├────────────┼──────────┼────────────┤
│ 1B         │ 1B       │ 20B tokens │
│ 7B         │ 7B       │ 140B tokens│
│ 70B        │ 70B      │ 1.4T tokens│
│ 405B       │ 405B     │ 15T tokens │
└────────────┴──────────┴────────────┘

但现实更复杂:
├── Llama 3: 8B 模型用 15T token
│   (远超 Chinchilla, 追求推理效率)
├── 数据质量 > 数据数量
│   (高质量 1T > 低质量 10T)
├── 数据多样性很关键
│   (代码+数学+文学+科学)
└── 数据混合比例 (Mix Ratio)
    需要精心调优

推理时代的新趋势:
├── 训练数据已接近瓶颈 (~15T)
├── 互联网高质量文本接近枯竭
├── 合成数据成为主要增长点
└── 数据质量工程 > 数据规模`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🌍 主要训练数据集</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> datasets</div>
                <pre className="fs-code">{`主流预训练数据集:

┌────────────┬──────────┬────────────┐
│ 数据集      │ 规模      │ 特点       │
├────────────┼──────────┼────────────┤
│ Common     │ ~200TB   │ 网页快照   │
│ Crawl      │          │ 需大量清洗 │
├────────────┼──────────┼────────────┤
│ The Pile   │ 800GB    │ 多源混合   │
│            │          │ 22个子集   │
├────────────┼──────────┼────────────┤
│ RedPajama  │ 1.2T tok │ 开源复刻   │
│            │          │ LLaMA 数据 │
├────────────┼──────────┼────────────┤
│ FineWeb    │ 15T tok  │ HuggingFace│
│            │          │ 高质量网页 │
├────────────┼──────────┼────────────┤
│ DCLM       │ 4T tok   │ Apple 开源 │
│            │          │ 精心筛选   │
└────────────┴──────────┴────────────┘

    指令微调数据集:
├── OpenAssistant: 人类对话
├── Alpaca: GPT-4 合成
├── UltraChat: 多轮对话
├── WildChat: 真实用户
├── LMSYS-Chat: 竞技场对话
└── Magpie: 自动生成指令

关键洞察:
✅ 预训练: 规模为王 (万亿token)
✅ 微调: 质量为王 (千条精品)
✅ 对齐: 人类偏好为王 (RLHF)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
