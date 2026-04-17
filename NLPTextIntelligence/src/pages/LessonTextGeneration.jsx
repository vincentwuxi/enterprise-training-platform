import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Seq2Seq 基础', '文本摘要', '可控生成', '事实一致性'];

export default function LessonTextGeneration() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">✍️ module_05 — 文本生成与摘要</div>
      <div className="fs-hero">
        <h1>文本生成与摘要：Seq2Seq / 可控生成 / 事实一致性 — 让机器会写作</h1>
        <p>
          文本生成是 NLP 最具创造力的方向，从自动摘要到数据到文本 (Data2Text)，
          从营销文案到代码生成。本模块深入 <strong>Seq2Seq 架构与解码策略</strong>、
          <strong>抽取式/生成式摘要</strong>、<strong>可控文本生成 (CTRL/PPLM)</strong>，
          以及企业最关心的 <strong>事实一致性 (Hallucination Detection)</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">✍️ 文本生成</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 Seq2Seq 与解码策略</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> seq2seq_decoding</div>
              <pre className="fs-code">{`# Seq2Seq: 序列到序列模型

# ═══ 架构演进 ═══
# RNN Encoder-Decoder (2014) → Attention (2015)
# → Transformer (2017) → Pretrained Seq2Seq (T5/BART)

# ═══ 解码策略 (核心工程知识!) ═══

# 1. Greedy Decoding — 贪心, 每步选最大概率
# P(y_t) = argmax P(y_t | y_{<t}, x)
# 快但容易重复, 缺乏多样性

# 2. Beam Search — 束搜索
# 维护 top-k 候选序列, 取最终概率最高的
def beam_search(model, input_ids, beam_size=5, max_len=100):
    # 维护 beam_size 个候选
    # 每步扩展每个候选, 保留 top beam_size
    # 长度惩罚: score / length^α (α=0.6~1.0)
    pass
# 问题: 仍然倾向安全、通用的回答

# 3. Top-k Sampling — 从概率最高的 k 个词中采样
# k=50: 只考虑前 50 个词, 按概率采样
# → 增加多样性, 但 k 不好调

# 4. Top-p (Nucleus) Sampling — 动态截断
# 从最小的词集合中采样, 使得概率之和 ≥ p
# p=0.9: 累积概率达到 90% 的词集合
# → 自适应! 确定的位置词少, 开放的位置词多

# 5. Temperature — 控制概率分布的"锐度"
# P(y_i) = softmax(logit_i / T)
# T < 1: 更确定 (分布更尖)
# T = 1: 原始分布
# T > 1: 更随机 (分布更平)

# ═══ 解码参数配置 (生产经验) ═══
decoding_configs = {
    "精确任务 (翻译/摘要)": {
        "方法": "Beam Search", "beam": 4,
        "length_penalty": 0.6, "no_repeat_ngram": 3,
    },
    "创意生成 (故事/文案)": {
        "方法": "Top-p Sampling", "p": 0.9,
        "temperature": 0.8, "top_k": 50,
    },
    "对话 (ChatBot)": {
        "方法": "Top-p + Temperature", "p": 0.95,
        "temperature": 0.7, "repetition_penalty": 1.1,
    },
}

# ═══ 重复问题解决 ═══
repetition_solutions = {
    "n-gram 阻断":     "no_repeat_ngram_size=3",
    "重复惩罚":        "repetition_penalty=1.2",
    "Frequency Penalty": "已生成词概率降低",
    "Presence Penalty":  "只要出现过就惩罚",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📄 文本摘要</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> summarization</div>
              <pre className="fs-code">{`# 文本摘要: 压缩文本保留核心信息

# ═══ 两种范式 ═══
# 抽取式 (Extractive): 从原文中选择重要句子
# 生成式 (Abstractive): 用自己的话重新表述

# ═══ 抽取式摘要 ═══

# 1. TextRank (无监督)
# 基于 PageRank: 句子是节点, 相似度是边权
# 迭代计算每个句子的重要度, 选 top-k 句
import networkx as nx
def textrank_summarize(sentences, top_k=3):
    sim_matrix = compute_similarity(sentences)
    graph = nx.from_numpy_array(sim_matrix)
    scores = nx.pagerank(graph)
    ranked = sorted(scores, key=scores.get, reverse=True)
    return [sentences[i] for i in sorted(ranked[:top_k])]

# 2. BERT-Extractive (BertSum, 2019)
# 在句子间插入 [CLS], 用 BERT 编码 → 二分类每句是否入选
# [CLS] sent1 [SEP] [CLS] sent2 [SEP] [CLS] sent3 [SEP]
#  → 0.9          → 0.2          → 0.8
# 选择 sent1, sent3

# ═══ 生成式摘要 ═══

# 1. BART (Lewis, 2019)
# Encoder-Decoder Transformer
# 预训练: Text Infilling (遮盖连续片段, 生成恢复)
from transformers import BartForConditionalGeneration
model = BartForConditionalGeneration.from_pretrained('fnlp/bart-base-chinese')

# 2. T5 (Raffel, 2020)
# "Text-to-Text Transfer Transformer"
# 所有任务统一为 text-to-text 格式:
# "summarize: 很长的文章..." → "简短的摘要"

# 3. Pegasus (2020)
# 预训练用 Gap Sentence Generation — 遮盖整句
# 专为摘要设计的预训练目标!

# ═══ 长文档摘要 ═══
long_doc_methods = {
    "分段摘要":    "将长文档分成段, 分别摘要, 再合并",
    "Longformer":  "稀疏注意力, 支持 16K tokens",
    "LED":         "Longformer Encoder-Decoder",
    "层次摘要":    "段落摘要 → 章节摘要 → 全文摘要",
    "LLM":         "GPT-4 Turbo 128K / Claude 200K",
}

# ═══ 评估指标 ═══
# ROUGE-1: unigram 重叠
# ROUGE-2: bigram 重叠  
# ROUGE-L: 最长公共子序列
# BERTScore: 语义相似度 (基于 BERT 嵌入)
# 人工评估: 忠实度 / 相关性 / 流畅度`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎛️ 可控文本生成</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> controllable_generation</div>
              <pre className="fs-code">{`# 可控生成: 控制生成文本的属性

# ═══ 为什么需要可控? ═══
# 企业需求: 生成的文案要"正式"/"幽默"/"简洁"
# 安全需求: 避免有害内容
# 业务需求: 生成包含特定关键词的文本

# ═══ 方法分类 ═══

# 1. 条件训练 (CTRL, Salesforce 2019)
# 在训练数据前加控制代码:
# "[Links] Microsoft has announced..."
# "[Wikipedia] The Python programming language..."
# 推理时指定控制代码即可

# 2. 后处理 / 再排序
# 生成多个候选 → 按控制属性打分 → 选最佳
def controlled_generate(model, prompt, attribute_scorer, n=10):
    candidates = [model.generate(prompt) for _ in range(n)]
    scores = [(c, attribute_scorer(c)) for c in candidates]
    return max(scores, key=lambda x: x[1])[0]

# 3. PPLM (Plug and Play LM, 2020)
# 不修改语言模型, 用小型属性分类器引导生成
# 推理时: 每步计算属性梯度, 微调隐藏状态
# 优点: 即插即用, 不用重新训练 LM

# 4. Prefix Tuning / Prompt Tuning
# 学习任务特定的 prefix → 引导生成风格
# 一个 LM + 多个 prefix = 多种风格

# ═══ 企业可控生成场景 ═══
enterprise_controlled = {
    "营销文案": {
        "控制维度": "风格(正式/活泼), 长度, 关键词",
        "方法": "Few-shot + 约束解码",
    },
    "客服回复": {
        "控制维度": "语气(专业/友好), 包含特定信息",
        "方法": "模板 + LLM 填充",
    },
    "报告生成": {
        "控制维度": "结构, 数据引用, 用语规范",
        "方法": "Data2Text + 后处理",
    },
    "多语言": {
        "控制维度": "目标语言, 本地化风格",
        "方法": "翻译模型 + 文化适配",
    },
}

# ═══ 约束解码 (Constrained Decoding) ═══
# 强制生成中包含或排除特定词
# Lexical Constraints: 必须包含 ["人工智能", "深度学习"]
# Negative Constraints: 不能出现 ["暴力", "色情"]
# NeuroLogic Decoding: 满足逻辑约束的解码`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔍 事实一致性与幻觉检测</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> factual_consistency</div>
              <pre className="fs-code">{`# 事实一致性: 企业 NLP 的生死线

# ═══ 幻觉 (Hallucination) 类型 ═══
hallucination_types = {
    "内在幻觉": "与源文档矛盾的生成内容",
    "外在幻觉": "源文档中不存在的信息",
    "事实错误": "与世界知识矛盾",
}
# 摘要任务: 约 30% 的生成摘要包含不忠实内容!
# → 企业金融/法律/医疗场景: 幻觉 = 事故

# ═══ 幻觉检测方法 ═══

# 1. NLI-based 检测
# 用自然语言推理模型:
# 前提: 源文档  假设: 生成的摘要
# 蕴含 → 事实一致  矛盾 → 幻觉
from transformers import pipeline
nli = pipeline("text-classification", model="cross-encoder/nli-deberta-v3-large")
result = nli({"text": source_doc, "text_pair": generated_summary})
# label: ENTAILMENT / CONTRADICTION / NEUTRAL

# 2. QA-based 检测 (QuestEval)
# 从摘要生成问题 → 在源文档中找答案
# 答案一致 → 事实一致
# "摘要: 华为营收 1000 亿" → Q: 华为营收多少?
# 源文档回答: 800 亿 → 不一致!

# 3. 基于知识图谱的验证
# 生成文本 → 抽取三元组 → 与 KG 比对

# ═══ 幻觉缓解策略 ═══
mitigation_strategies = {
    "训练阶段": {
        "对比学习":     "正例(忠实) vs 负例(幻觉) 对比",
        "Unlikelihood": "降低幻觉 token 的概率",
        "强化学习":     "事实奖励 + PPO",
    },
    "推理阶段": {
        "检索增强":     "RAG: 先检索后生成",
        "后编辑":       "生成后自动检查和修复",
        "归因标注":     "标注每句话的来源段落",
    },
    "工程实践": {
        "置信度评分":   "低置信度内容标记人工审核",
        "多模型投票":   "多个模型生成, 交叉验证",
        "人机协作":     "AI 生成草稿, 人类审核终稿",
    },
}

# ═══ 企业最佳实践 ═══
# 金融报告: RAG + NLI 检查 + 人工审核
# 客服: 模板+填充, 最小化自由生成
# 新闻: 事实三元组验证 + 归因标注`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
