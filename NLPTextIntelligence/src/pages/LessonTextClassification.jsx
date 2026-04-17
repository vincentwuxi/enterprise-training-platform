import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['文本分类', '情感分析', '多标签分类', '层次分类'];

export default function LessonTextClassification() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">📋 module_04 — 文本分类与情感分析</div>
      <div className="fs-hero">
        <h1>文本分类与情感分析：多标签 / 层次分类 / ABSA — 企业最常见的 NLP 任务</h1>
        <p>
          文本分类是应用最广泛的 NLP 任务——工单分类、意图识别、舆情分析、
          内容审核都属于此类。本模块从经典方法到 BERT 微调，覆盖
          <strong>多标签分类</strong>、<strong>层次分类</strong>、
          <strong>方面级情感分析 (ABSA)</strong>，以及类别不平衡、冷启动等工程难题。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📋 文本分类</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📊 文本分类方法</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> text_classification</div>
              <pre className="fs-code">{`# 文本分类: 给文本分配一个或多个类别标签

# ═══ 方法演进 ═══

# 1. 传统方法: TF-IDF + ML
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.feature_extraction.text import TfidfVectorizer

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=50000, ngram_range=(1,2))),
    ('clf', LinearSVC(C=1.0)),
])
pipeline.fit(X_train, y_train)
# 优点: 快! 可解释! 小数据也能用!
# 缺点: 特征工程依赖经验

# 2. 深度学习方法
deep_methods = {
    "TextCNN (2014)":  "多尺度卷积核捕获 n-gram 特征",
    "BiLSTM (2015)":   "双向 LSTM + Attention",
    "FastText (2016)": "极速! 分钟级训练, 适合海量数据",
    "DPCNN (2017)":    "深层 CNN, 捕获长距离依赖",
}

# 3. BERT 微调 (当前主流)
from transformers import BertForSequenceClassification, Trainer

model = BertForSequenceClassification.from_pretrained(
    'bert-base-chinese', num_labels=10
)
trainer = Trainer(model=model, train_dataset=train_ds, ...)
trainer.train()

# ═══ 类别不平衡问题 ═══
# 工单分类: "咨询" 占 60%, "投诉" 占 5%
imbalance_solutions = {
    "数据层面": {
        "过采样":    "SMOTE / 随机复制少数类",
        "欠采样":    "随机删除多数类",
        "数据增强":  "回译 / 同义词替换 / LLM生成",
    },
    "损失函数": {
        "Focal Loss":   "γ=2, 聚焦难样本",
        "加权 CE":      "类权重 = 1/频率",
        "Dice Loss":    "适合极端不平衡",
    },
    "训练策略": {
        "课程学习":  "先学简单, 后学困难",
        "对比学习":  "SCL 增强表示区分度",
    },
}

# ═══ 冷启动: 零标注出分类 ═══
# 1. Zero-shot: NLI 模型做推理
#    "这条评论是关于产品质量的" → 蕴含/不蕴含
# 2. LLM ICL: 给几个例子即可分类
# 3. 关键词规则: 先用规则打标, 再训模型`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>💬 情感分析</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> sentiment_analysis</div>
              <pre className="fs-code">{`# 情感分析: 判断文本的情感极性和强度

# ═══ 情感分析层次 ═══
sentiment_levels = {
    "文档级":   "整篇文章的情感 (正面/负面/中性)",
    "句子级":   "每句话的情感",
    "方面级":   "针对不同方面的情感 (ABSA)",
    "观点三元组": "(方面, 观点词, 情感极性)",
}

# ═══ 方面级情感分析 (ABSA) ═══
# "这家餐厅菜品很好吃, 但是环境太差了"
# → (菜品, 好吃, 正面), (环境, 太差, 负面)
# → 企业最需要的: 到底好在哪里, 差在哪里?

# ABSA 子任务:
# 1. Aspect Term Extraction (ATE): 抽取方面词
# 2. Aspect Sentiment Classification (ASC): 方面情感分类
# 3. Opinion Term Extraction (OTE): 抽取观点词
# 4. ASTE: 三元组抽取 (方面, 观点, 情感)

# ═══ ABSA 方法 ═══
# BERT + 方面特定 Attention
class AspectBERT(nn.Module):
    def __init__(self):
        super().__init__()
        self.bert = BertModel.from_pretrained('bert-base-chinese')
        self.attention = nn.MultiheadAttention(768, 8)
        self.classifier = nn.Linear(768, 3)  # pos/neg/neu
    
    def forward(self, input_ids, aspect_mask):
        outputs = self.bert(input_ids)
        h = outputs.last_hidden_state
        # 用方面词的表示做 query, attend 到上下文
        aspect_repr = (h * aspect_mask.unsqueeze(-1)).sum(1)
        context, _ = self.attention(aspect_repr, h, h)
        return self.classifier(context)

# ═══ 企业情感分析应用 ═══
enterprise_sentiment = {
    "客服质检":  "自动评估客服服务态度和专业度",
    "产品评论":  "分析用户对功能/价格/质量的满意度",
    "社交媒体":  "品牌舆情监控, 危机预警",
    "员工满意度": "分析员工匿名反馈",
    "竞品分析":  "对比用户对竞品各维度的评价",
}

# ═══ 情感分析挑战 ═══
# 反讽: "这质量真是够了" (负面但用了正面词)
# 隐性情感: "我再也不会来了" (无情感词但负面)
# 多语言: 中英混合 "这个 design 真的很 low"
# → LLM 在隐性情感和反讽上显著优于微调模型`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏷️ 多标签分类</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> multi_label</div>
              <pre className="fs-code">{`# 多标签分类: 一个文本可以属于多个类别

# 多分类 vs 多标签:
# 多分类: "这是一条新闻" → 体育 (互斥)
# 多标签: "这是一条新闻" → [体育, 经济, 国际] (可组合)

# ═══ 方法 ═══

# 1. Binary Relevance: 每个标签独立的二分类
# 简单但忽略标签间依赖
class MultiLabelClassifier(nn.Module):
    def __init__(self, n_labels):
        super().__init__()
        self.bert = BertModel.from_pretrained('bert-base-chinese')
        self.classifier = nn.Linear(768, n_labels)
    
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        logits = self.classifier(outputs.pooler_output)
        return logits  # 每个标签用 sigmoid, 非 softmax!

# 损失: BCEWithLogitsLoss
loss_fn = nn.BCEWithLogitsLoss()
# 阈值: 每个标签独立判断 > 0.5 → 属于该类

# 2. Label-wise Attention
# 为每个标签学习独立的注意力权重
# 关注文本中与该标签相关的部分

# 3. Seq2Seq 生成标签
# "这篇文章的标签是: 体育, 经济, 国际"
# 用 T5/BART 生成标签序列 → 自然处理标签依赖

# ═══ 评估指标 ═══
multi_label_metrics = {
    "Sample F1":   "每个样本的 F1, 取平均",
    "Macro F1":    "每个标签的 F1, 取平均 (关注少数类)",
    "Micro F1":    "全局 TP/FP/FN 计算 (关注多数类)",
    "Hamming Loss": "标签不一致的比例",
    "Subset Acc":  "完全匹配的比例 (最严格)",
}

# ═══ 标签相关性建模 ═══
# 标签不是独立的! 
# (体育, NBA) 常共现, (体育, 烹饪) 少共现
# Graph-based: 用图网络建模标签共现
# Transformer: 标签嵌入做 self-attention`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🌳 层次分类</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> hierarchical</div>
              <pre className="fs-code">{`# 层次分类: 类别具有树形层级结构

# ═══ 场景 ═══
# 电商商品分类:
# 服装 → 女装 → 连衣裙 → 短裙
# 服装 → 男装 → 衬衫 → 商务衬衫
# → 3-5 层级, 数千个叶子类别

# 工单分类:
# 技术支持 → 网络问题 → VPN 无法连接
# 业务咨询 → 账户管理 → 密码重置

# ═══ 方法 ═══

# 1. Flat Classification (扁平化)
# 忽略层级, 直接分到最细粒度
# 问题: 可能预测出矛盾结果 (男装-连衣裙)

# 2. Top-Down (自顶向下)
# 先分大类, 再分小类, 逐层细化
# 每层一个分类器
# 优点: 直观, 利用层级信息
# 缺点: 误差传播 (上层错→下层全错)

# 3. Global Classification
# 一个模型预测所有层级, 用层级约束做后处理
class HierarchicalClassifier(nn.Module):
    def __init__(self, hierarchy):
        super().__init__()
        self.bert = BertModel.from_pretrained('bert-base-chinese')
        self.level_classifiers = nn.ModuleList([
            nn.Linear(768, n_classes) for n_classes in hierarchy
        ])
    
    def forward(self, input_ids, attention_mask):
        h = self.bert(input_ids, attention_mask=attention_mask).pooler_output
        return [clf(h) for clf in self.level_classifiers]

# 4. Label Embedding + Graph
# 将层级结构编码为图 → GNN 传播标签信息
# 父节点信息向下传递, 兄弟节点相互约束

# ═══ 层级一致性约束 ═══
# 预测结果必须符合层级:
# ✅ 服装 → 女装 → 连衣裙
# ❌ 数码 → 女装 → 连衣裙 (矛盾!)
# 方法: 
# 1. 训练时: 层级正则化损失
# 2. 推理时: 条件概率链 P(C3|C2,C1)
# 3. Beam Search: 从根到叶搜索最佳路径

# ═══ 企业最佳实践 ═══
best_practices = {
    "标注标准":  "标注到最细粒度, 自动继承上层标签",
    "模型选择":  "< 100 类用 flat, > 100 类用 hierarchical",
    "冷启动":    "LLM 先分大类, 再微调小模型分细类",
    "迭代优化":  "从粗到细, 逐步增加类别",
    "评估":      "分层级报告 F1, 重点关注叶子节点",
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
