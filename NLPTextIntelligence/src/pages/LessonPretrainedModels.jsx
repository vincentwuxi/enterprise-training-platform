import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['BERT 架构', '微调范式', 'BERT 家族', 'Prompt 学习'];

export default function LessonPretrainedModels() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🧠 module_02 — 预训练语言模型</div>
      <div className="fs-hero">
        <h1>预训练语言模型：BERT / RoBERTa / DeBERTa — NLP 理解的基座</h1>
        <p>
          BERT 开创了 <strong>"预训练 + 微调"</strong> 的 NLP 范式革命。本模块深入
          BERT 的 Masked LM 与 NSP 目标，掌握 RoBERTa / ALBERT / DeBERTa 的改进要点，
          理解 <strong>Feature-based / Fine-tuning / Prompt</strong> 三大适配范式，
          以及 <strong>LoRA / P-Tuning</strong> 等参数高效微调技术。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧠 预训练模型</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏗️ BERT 架构与预训练</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> bert_architecture</div>
              <pre className="fs-code">{`# BERT (Devlin, 2018): NLP 的 ImageNet 时刻

# ═══ 架构 ═══
# Transformer Encoder (双向注意力)
# BERT-Base:  12层, 768隐藏, 12头, 110M参数
# BERT-Large: 24层, 1024隐藏, 16头, 340M参数
# 输入: [CLS] token1 token2 ... [SEP] token_a token_b [SEP]

# ═══ 预训练目标 ═══

# 1. Masked Language Model (MLM) — 核心!
# 随机遮盖 15% 的 token, 模型预测被遮盖的词
# "The [MASK] sat on the mat" → "cat"
# 遮盖策略:
#   80% 替换为 [MASK]
#   10% 替换为随机词
#   10% 保持原词
# → 双向上下文! (GPT 只看左边)

# 2. Next Sentence Prediction (NSP)
# 判断两个句子是否连续
# 输入: [CLS] A [SEP] B [SEP]
# 50% 真正连续, 50% 随机采样
# → 后来证明 NSP 不太重要 (RoBERTa 删除)

# ═══ 预训练数据 ═══
# BookCorpus (800M 词) + English Wikipedia (2.5B 词)
# 训练: 4 TPU pods, 4天

# ═══ BERT 的输入表示 ═══
# Token Embedding:    词嵌入 (WordPiece, 30K词表)
# Segment Embedding:  句子A/B标记
# Position Embedding: 位置编码 (可学习, 最长512)
# 最终输入 = Token + Segment + Position

from transformers import BertModel, BertTokenizer

tokenizer = BertTokenizer.from_pretrained('bert-base-chinese')
model = BertModel.from_pretrained('bert-base-chinese')

text = "自然语言处理是人工智能的核心"
inputs = tokenizer(text, return_tensors='pt')
outputs = model(**inputs)

# outputs.last_hidden_state: [1, seq_len, 768]
# outputs.pooler_output:     [1, 768]  ([CLS] 向量)

# ═══ 为什么 BERT 如此重要? ═══
# 1. 双向上下文: "bank" 在 "river bank" vs "bank account" 中不同
# 2. 迁移学习: 一次预训练, 处处微调
# 3. 通用性: 分类/NER/QA/相似度全能`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔧 微调范式</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> finetuning</div>
              <pre className="fs-code">{`# BERT 微调: 万能的下游任务适配

# ═══ 任务适配模式 ═══

# 1. 单句分类 (情感/主题)
# [CLS] 我今天很开心 [SEP] → [CLS] 向量 → 线性层 → 类别
class BertClassifier(nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        self.bert = BertModel.from_pretrained('bert-base-chinese')
        self.classifier = nn.Linear(768, n_classes)
    
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        cls_output = outputs.pooler_output  # [CLS]
        return self.classifier(cls_output)

# 2. 句对分类 (NLI/相似度)
# [CLS] 句子A [SEP] 句子B [SEP] → [CLS] → 蕴含/矛盾/中立

# 3. 序列标注 (NER)
# 每个 token → 标签
# [CLS] 北 京 是 中 国 首 都 [SEP]
#        B-LOC I-LOC O B-LOC I-LOC O O
# → 最后一层每个 token 过线性层 + CRF

# 4. 阅读理解 (抽取式QA)
# [CLS] 问题 [SEP] 文档 [SEP]
# 预测答案的起始和结束位置
# P(start=i) = softmax(W_s · h_i)
# P(end=j) = softmax(W_e · h_j)

# ═══ 微调超参数 (经验值) ═══
finetune_config = {
    "learning_rate": "2e-5 ~ 5e-5",
    "batch_size":    "16 ~ 32",
    "epochs":        "2 ~ 4 (少量数据3-5)",
    "warmup":        "总步数的 6%~10%",
    "max_length":    "128 ~ 512",
    "weight_decay":  "0.01",
    "scheduler":     "linear warmup + linear decay",
}

# ═══ PEFT: 参数高效微调 ═══
peft_methods = {
    "LoRA":          "低秩适配, 只增加 0.1% 参数",
    "QLoRA":         "4-bit 量化 + LoRA",
    "Adapter":       "在每层插入小型适配模块",
    "P-Tuning v2":   "可学习的连续提示 (prefix)",
    "BitFit":        "只微调 bias 项",
}

# LoRA: W = W_0 + ΔW = W_0 + BA
# B: d×r, A: r×k, r << min(d,k)
# 7B 模型: 全量微调 28GB → LoRA 仅 20MB!`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>👨‍👩‍👧‍👦 BERT 家族</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> bert_family</div>
              <pre className="fs-code">{`# BERT 之后的改进模型

# ═══ RoBERTa (Liu, 2019) ═══
# "Robustly optimized BERT"
roberta_changes = {
    "去掉 NSP":        "NSP 任务没用, 删除",
    "动态 Masking":    "每个 epoch 重新随机遮盖 (非静态)",
    "更大 Batch":      "8K batch size (BERT: 256)",
    "更多数据":        "160GB 文本 (BERT: 16GB)",
    "更长训练":        "500K steps (BERT: 100K)",
    "BPE 分词":        "50K BPE (BERT: 30K WordPiece)",
}
# → 同架构, 更好的训练策略 → 全面超越 BERT

# ═══ ALBERT (Lan, 2020) ═══
# A Lite BERT — 参数高效
albert_innovations = {
    "参数共享":   "所有层共享 Transformer 参数 → 参数减少 18x",
    "嵌入分解":   "V×E + E×H 替代 V×H → 嵌入参数减少",
    "SOP 任务":   "Sentence Order Prediction 替代 NSP",
}

# ═══ DeBERTa (He, 2021) ═══
# Decoding-enhanced BERT — 当前 BERT 家族最强
deberta_innovations = {
    "解耦注意力": {
        "方法": "分离内容和位置的注意力计算",
        "公式": "A = H_c H_c^T + H_c H_p^T + H_p H_c^T",
        "优势": "更精细的位置感知",
    },
    "增强掩码解码": {
        "方法": "在解码层加入绝对位置信息",
        "优势": "局部相对位置 + 全局绝对位置",
    },
}
# DeBERTa-v3: 在 SuperGLUE 上超越人类基线!

# ═══ 中文预训练模型 ═══
chinese_plms = {
    "BERT-wwm":       "全词遮盖 (Whole Word Masking)",
    "MacBERT":        "用近义词替换遮盖词",
    "ERNIE (百度)":   "知识增强, 实体级遮盖",
    "RoFormer":       "旋转位置编码 (RoPE)",
    "Chinese-BERT":   "字形 + 拼音辅助",
}

# ═══ 模型选型指南 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │ 场景          │ 推荐模型     │ 理由         │
# ├──────────────┼──────────────┼──────────────┤
# │ 快速原型     │ BERT-base    │ 简单稳定     │
# │ 中文任务     │ MacBERT-large│ 性能好       │
# │ 追求极致     │ DeBERTa-v3   │ SOTA        │
# │ 资源受限     │ ALBERT       │ 参数少       │
# │ 句向量       │ BGE / E5     │ 对比学习训练 │
# └──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>💡 Prompt 学习与 In-Context Learning</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> prompt_learning</div>
              <pre className="fs-code">{`# Prompt: 从微调模型到微调输入

# ═══ 范式演进 ═══
# 1. Feature-based:  BERT → 特征 → 独立分类器
# 2. Fine-tuning:    BERT + 分类头 → 端到端微调
# 3. Prompt-based:   将任务转化为语言模型原生格式
# 4. In-Context:     不微调, 给示例即可 (GPT-3)

# ═══ Prompt 模板 ═══
# 情感分类:
# 原始: "这部电影真好看" → positive
# Prompt: "这部电影真好看。总的来说, 这是一部[MASK]的电影"
#         → BERT 预测 [MASK] 为 "好" → positive
# → 将分类任务转化为完形填空!

# ═══ Verbalizer (标签映射) ═══
# 将模型预测的词映射回标签:
verbalizer = {
    "positive": ["好", "棒", "优秀", "精彩"],
    "negative": ["差", "烂", "糟糕", "无聊"],
}

# ═══ In-Context Learning (ICL) ═══
# GPT-3 的核心能力: 不用微调, 给例子就行!
icl_prompt = """
判断以下评论的情感:

评论: 这家餐厅的菜太难吃了
情感: 负面

评论: 服务态度非常好, 下次还来
情感: 正面

评论: 等了一个小时才上菜
情感:"""
# → 模型输出: "负面"

# ═══ Few-Shot 分类 ═══
# 不同策略对比:
few_shot_strategies = {
    "Zero-shot":  "只有任务描述, 无示例",
    "One-shot":   "每个类别 1 个示例",
    "Few-shot":   "每个类别 2-5 个示例",
    "示例选择":   "用相似度检索最相关的示例",
    "示例排序":   "示例顺序影响性能 (近因效应)",
}

# ═══ Chain-of-Thought (CoT) ═══
# 在 prompt 中加入推理步骤:
# "让我们一步步思考..."
# → 显著提升数学/逻辑推理能力
# → 引导模型展示推理过程

# ═══ 企业应用选择 ═══
# 有大量标注数据 → Fine-tuning (BERT + 分类头)
# 标注数据少 → Prompt + Few-shot
# 零标注 → ICL + GPT-4 / Claude
# 最佳实践: LLM 快速验证 → BERT 生产部署`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
