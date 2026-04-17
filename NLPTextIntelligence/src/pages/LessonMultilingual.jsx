import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['多语言模型', '跨语言迁移', '低资源 NLP', '数据增强'];

export default function LessonMultilingual() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge teal">🌍 module_07 — 多语言与低资源 NLP</div>
      <div className="fs-hero">
        <h1>多语言与低资源 NLP：跨语言迁移 / 少样本 / 数据增强</h1>
        <p>
          企业级 NLP 经常面临<strong>小语种、低资源、标注不足</strong>的挑战。
          本模块深入 <strong>mBERT / XLM-R / BLOOM</strong> 多语言预训练模型，
          掌握<strong>跨语言零样本迁移</strong>、<strong>少样本学习
          (SetFit / PET)</strong>，以及实战数据增强和主动学习策略。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌍 多语言 NLP</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🤖 多语言预训练模型</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#14b8a6'}}></span> multilingual_models</div>
              <pre className="fs-code">{`# 多语言模型: 一个模型, 处理 100+ 种语言

# ═══ 模型演进 ═══

# 1. mBERT (Multilingual BERT, 2018)
# 104 种语言的 Wikipedia 训练
# 词表: 110K WordPiece
# 惊人发现: 未经对齐训练, 也有跨语言能力!
# 原因: 共享子词 + 锚点词 (数字/实体/借词)

# 2. XLM-R (Conneau, 2020)
# RoBERTa 的多语言版
xlm_r_config = {
    "训练数据":  "CC-100, 2.5TB, 100 种语言",
    "词表":      "250K SentencePiece",
    "架构":      "Transformer, 550M 参数",
    "优势":      "低资源语言表现大幅提升",
}
# → 当前最常用的多语言编码器

# 3. mT5 (Xue, 2021) — 多语言生成
# T5 的多语言版, 编码器-解码器架构
# 101 种语言, mC4 数据集
# 适合: 多语言生成/摘要/翻译

# 4. BLOOM (BigScience, 2022) — 多语言 LLM
# 176B 参数, 46 种语言 + 13 种编程语言
# 开源! 真正的多语言大模型

# 5. mGPT / Qwen / LLaMA-3
# 最新多语言 LLM, 中文能力显著提升

# ═══ 多语言嵌入 ═══
multilingual_embeddings = {
    "LaBSE":      "语言无关的句嵌入, 109 种语言",
    "mE5":        "微软多语言E5",
    "BGE-M3":     "多语言+多粒度+多功能",
    "SONAR":      "Meta, 200种语言, 语音+文本",
}

from sentence_transformers import SentenceTransformer
model = SentenceTransformer('BAAI/bge-m3')
# 中文查询可以检索英文文档!
zh = model.encode(["机器学习算法"])
en = model.encode(["machine learning algorithms"])
# cosine_similarity ≈ 0.88`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 跨语言迁移</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> cross_lingual_transfer</div>
              <pre className="fs-code">{`# 跨语言迁移: 用高资源语言帮助低资源语言

# ═══ 迁移方式 ═══

# 1. Zero-shot 跨语言迁移
# 用英文标注数据微调 XLM-R → 直接预测日语/泰语
# 效果: 英→中 约 85-90% 的中文单语性能
# 不用任何目标语言标注!

# 2. Translate-Train
# 机翻源语言数据到目标语言 → 在翻译数据上训练
# 效果通常优于 zero-shot, 但依赖翻译质量

# 3. Translate-Test
# 推理时将目标语言翻译成英语 → 用英语模型预测
# 简单但引入翻译延迟

# ═══ 实战: 跨语言 NER ═══
# 场景: 只有英文 NER 标注, 需要做中文 NER
cross_lingual_ner = {
    "方法1 - Zero-shot": {
        "步骤": "英文 NER 数据微调 XLM-R → 直接做中文 NER",
        "效果": "~75% F1 (中文单语 ~85%)",
    },
    "方法2 - Translate+Align": {
        "步骤": "翻译英文数据 + 对齐标签 → 中文训练",
        "效果": "~80% F1",
        "难点": "实体跨度对齐 (翻译后位置变化)",
    },
    "方法3 - Few-shot": {
        "步骤": "英文预训练 + 100条中文标注微调",
        "效果": "~82% F1",
    },
}

# ═══ 对齐技术 ═══
alignment_methods = {
    "词对齐":     "FastAlign / Awesome-Align (BERT对齐)",
    "句对齐":     "LaBSE 句向量 + 最近邻",
    "对比学习":   "平行语料对比, 拉近翻译对",
    "对抗训练":   "语言判别器 → 语言无关表示",
}

# ═══ 语言距离的影响 ═══
# 近亲语言迁移效果更好:
# 英→德 (日耳曼语系): 效果好
# 英→中 (不同语系):   效果中
# 英→阿拉伯语 (RTL):  效果差
# → 可以用桥接语言: 英→日→中`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📊 低资源 NLP</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> low_resource</div>
              <pre className="fs-code">{`# 低资源 NLP: 标注数据不足时怎么办?

# ═══ 少样本学习 ═══

# 1. SetFit (Tunstall, 2022)
# Sentence Transformer + 对比学习 + 逻辑回归
# 只需 8 条/类 → 接近全量微调效果!
from setfit import SetFitModel, SetFitTrainer
model = SetFitModel.from_pretrained("BAAI/bge-small-zh-v1.5")
trainer = SetFitTrainer(model=model, train_dataset=few_shot_data)
trainer.train()
# 优势: 不需要标注海量数据, 训练快

# 2. PET (Pattern-Exploiting Training)
# 将分类任务转为完形填空 + 半监督
# 少量标注 → 模板预测 → 软标签 → 训练
# "这是一条[MASK]的新闻" → "体育"/"财经"

# 3. GPT-3 / Claude In-Context Learning
# 给 3-5 个示例 → 直接推理
# 优势: 零额外训练!
# 缺点: 推理成本高, 不稳定

# ═══ 半监督学习 ═══
semi_supervised = {
    "Self-Training": {
        "流程": "有标注训练 → 预测无标注 → 取高置信度 → 重新训练",
        "注意": "需要设置置信度阈值, 防止噪声累积",
    },
    "UDA (2020)": {
        "方法": "数据增强 + 一致性正则化",
        "原理": "增强后的无标注数据预测应一致",
    },
    "MixText (2020)": {
        "方法": "在隐藏空间做 MixUp + TMix",
    },
}

# ═══ 主动学习 (Active Learning) ═══
# 让模型选择最有价值的样本去标注!
active_learning_strategies = {
    "不确定性采样":    "选择模型最不确定的样本",
    "多样性采样":      "选择与已标注数据最不同的",
    "委员会查询":      "多个模型意见不一致的样本",
    "期望梯度长度":    "选择对模型影响最大的样本",
}
# 实践: 不确定性 + 多样性结合效果最好
# 通常 20% 标注 → 达到 90% 性能

# ═══ 标注成本对比 ═══
# 全量标注:     10,000 条 × ¥2/条 = ¥20,000
# 主动学习:     2,000 条 × ¥2/条  = ¥4,000
# SetFit:       80 条 × ¥2/条    = ¥160
# LLM Zero-shot: 0                = ¥0 (但推理成本高)`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔧 数据增强</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> data_augmentation</div>
              <pre className="fs-code">{`# NLP 数据增强: 用少量数据创造更多训练数据

# ═══ 文本级增强 ═══

# 1. EDA (Easy Data Augmentation)
eda_methods = {
    "同义词替换": "随机替换 n 个词为其同义词",
    "随机插入":   "在随机位置插入同义词",
    "随机交换":   "随机交换两个词的位置",
    "随机删除":   "以概率 p 删除每个词",
}

# 2. 回译 (Back Translation)
# 中文 → 英文 → 中文 (产生语义相同但表达不同的句子)
# "今天天气好" → "Good weather today" → "今天天气不错"
# 最有效的传统增强方法!

# 3. 文本替换
# 实体替换: "北京今天下雨" → "上海今天下雨"
# 数值扰动: "增长15%" → "增长16%"
# → 需要确保替换后标签不变!

# ═══ 模型级增强 ═══

# 4. Contextual Augmentation
# 用 BERT 预测 [MASK] 产生替换词
# "今天天气很[MASK]" → "好"/"不错"/"晴朗"
# 比同义词表更灵活!

# 5. LLM 生成增强 — 2024 主流!
llm_augmentation = """
请为以下文本分类任务生成 10 条新的训练样本:

类别: 产品投诉
现有样本:
1. "买的手机屏幕有问题, 才用了一周就碎了"
2. "发货太慢了, 等了半个月才收到"

请生成风格多样、语义准确的新样本:
"""
# → GPT-4 生成高质量增强数据
# 注意: 生成后需要人工审核质量!

# ═══ 特征级增强 ═══

# 6. MixUp
# 在嵌入空间做线性插值
# x_new = λ·x_1 + (1-λ)·x_2
# y_new = λ·y_1 + (1-λ)·y_2
# → 平滑决策边界

# 7. Cutoff
# 随机截断嵌入的某些维度 (类似 Dropout)

# ═══ 增强策略选择 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │ 数据量        │ 推荐方法     │ 效果         │
# ├──────────────┼──────────────┼──────────────┤
# │ < 100 条     │ LLM 生成     │ 5-15% ↑      │
# │ 100-1K 条    │ 回译 + EDA   │ 3-8% ↑       │
# │ 1K-10K 条    │ MixUp + 回译 │ 1-3% ↑       │
# │ > 10K 条     │ 意义不大     │ < 1% ↑       │
# └──────────────┴──────────────┴──────────────┘
# 核心: 数据量越少, 增强价值越大!`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
