import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['命名实体识别', '关系抽取', '事件抽取', 'UIE 统一框架'];

export default function LessonInfoExtraction() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge green">🔍 module_03 — 信息抽取</div>
      <div className="fs-hero">
        <h1>信息抽取：NER / 关系抽取 / 事件抽取 — 从非结构化到结构化</h1>
        <p>
          信息抽取是企业 NLP 的<strong>核心刚需</strong>——从海量文本中自动识别实体、
          关系和事件。本模块覆盖 <strong>NER (BiLSTM-CRF / BERT-CRF / GlobalPointer)</strong>、
          关系抽取 (Pipeline/Joint)、事件抽取，以及 <strong>UIE 统一信息抽取框架</strong>。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🔍 信息抽取</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏷️ 命名实体识别 (NER)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> ner</div>
              <pre className="fs-code">{`# NER: 从文本中识别命名实体及其类型

# ═══ 标注体系 ═══
# BIO:  B-PER I-PER O B-ORG I-ORG ...
# BIOES: B-开始 I-中间 O-非实体 E-结束 S-单字实体
# → BIOES 通常比 BIO 效果更好

# 示例:
# "马云在杭州创建了阿里巴巴"
# 马  云  在  杭  州  创  建  了  阿  里  巴  巴
# B-PER I-PER O B-LOC I-LOC O O O B-ORG I-ORG I-ORG I-ORG

# ═══ 方法演进 ═══

# 1. BiLSTM-CRF (经典)
# BiLSTM 编码上下文 → CRF 层建模标签依赖
# CRF 的作用: 保证标签序列合法 (B 后面不能直接是 B)

# 2. BERT-CRF (主流)
class BERTNER(nn.Module):
    def __init__(self, n_tags):
        super().__init__()
        self.bert = BertModel.from_pretrained('bert-base-chinese')
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(768, n_tags)
        self.crf = CRF(n_tags, batch_first=True)
    
    def forward(self, input_ids, attention_mask, labels=None):
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        emissions = self.classifier(self.dropout(outputs.last_hidden_state))
        if labels is not None:
            loss = -self.crf(emissions, labels, mask=attention_mask.bool())
            return loss
        return self.crf.decode(emissions, mask=attention_mask.bool())

# 3. GlobalPointer (苏剑林, 2022)
# 将 NER 转化为多头 span 预测
# 每种实体类型一个头, 预测 (start, end) 位置对
# 天然支持嵌套 NER! (实体可以重叠)
# "北京大学计算机系" → ORG(北京大学), ORG(北京大学计算机系)

# 4. W2NER (2022)
# 将 NER 转换为 word-word 关系分类
# 构建 NxN 字符关系矩阵

# ═══ 企业 NER 实体类型 ═══
enterprise_entities = {
    "金融": "公司/人名/金额/日期/股票代码/产品",
    "医疗": "疾病/药物/症状/检查/手术/身体部位",
    "法律": "当事人/法院/日期/案由/法条/金额",
    "电商": "品牌/商品/属性/价格/规格",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔗 关系抽取 (RE)</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> relation_extraction</div>
              <pre className="fs-code">{`# 关系抽取: 识别实体间的语义关系

# 输入: "马云在杭州创建了阿里巴巴"
# 输出: (马云, 创始人, 阿里巴巴), (阿里巴巴, 总部, 杭州)

# ═══ Pipeline vs Joint ═══
# Pipeline: NER → RE (先抽实体, 再分类关系)
#   优点: 模块化, 易调试
#   缺点: 误差传播 (NER 错 → RE 全错)
#
# Joint: 同时抽取实体和关系
#   优点: 端到端, 避免误差传播
#   缺点: 任务复杂, 训练难调

# ═══ Pipeline RE 方法 ═══

# 1. 句子级分类
# "[CLS] 马云 [E1] 在杭州创建了 [E2] 阿里巴巴 [SEP]"
# 用特殊标记标注实体 → BERT 编码 → 分类关系类型
def re_with_entity_markers(text, head, tail):
    marked = text.replace(head, f"[E1]{head}[/E1]")
    marked = marked.replace(tail, f"[E2]{tail}[/E2]")
    # BERT 编码 → 取 [E1] 和 [E2] 的向量 → concat → 分类
    return marked

# 2. Matching the Blanks (2019)
# 预训练时就学习实体关系表示

# ═══ Joint 方法 ═══

# TPLinker (2020): Token Pair Linking
# 在 NxN token pair 矩阵上做标注
# 标注: (head_start, tail_start, relation) → 一步完成

# CasRel (2020): Cascade Binary Tagging
# 1. 先识别 subject (头实体)
# 2. 对每个 subject, 用不同的 relation tagger 找 object
# → 解决实体重叠问题

# ═══ 基于生成的关系抽取 ═══
# 用 LLM 直接生成三元组:
# prompt: "请从以下文本中抽取实体关系三元组:
#          马云在杭州创建了阿里巴巴"
# output: "(马云, 创始人, 阿里巴巴)\\n(阿里巴巴, 总部, 杭州)"
# → 灵活但速度慢, 适合低频场景

# ═══ 远程监督 (Distant Supervision) ═══
# 问题: 关系标注成本极高
# 解法: 用知识图谱自动标注!
# 如果 KB 中 (马云, 创始人, 阿里巴巴), 
# 则包含"马云"和"阿里巴巴"的句子都标注为"创始人"
# 缺点: 噪声大 → 需要去噪方法 (多实例学习)`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ 事件抽取</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> event_extraction</div>
              <pre className="fs-code">{`# 事件抽取: 识别文本中的结构化事件

# ═══ 事件结构 ═══
# 事件 = 触发词 + 事件类型 + 论元 (参与者/时间/地点...)
# "2024年3月，马云辞去阿里巴巴董事长职务"
# → 事件类型: 人事变动-离职
# → 触发词: "辞去"
# → 论元:
#   时间: 2024年3月
#   人物: 马云
#   组织: 阿里巴巴
#   职位: 董事长

# ═══ 两阶段方法 ═══
# Stage 1: 触发词识别 (Trigger Detection)
#   序列标注: 每个词是否是触发词, 是什么事件类型
# Stage 2: 论元抽取 (Argument Extraction)  
#   给定触发词, 抽取相关论元及角色

# ═══ 端到端方法 ═══
# Text2Event: 直接生成结构化事件
# "马云辞去阿里巴巴董事长"
# → {"type": "离职", "trigger": "辞去",
#    "args": {"人物": "马云", "组织": "阿里巴巴", "职位": "董事长"}}

# ═══ 文档级事件抽取 ═══
# 挑战: 论元可能分散在不同句子中!
doc_level_challenges = {
    "跨句论元":  "论元不在触发词所在句中",
    "论元散布":  "一个事件的论元分布在多个段落",
    "多事件":    "一篇文档包含多个事件",
    "事件关系":  "因果/时序/共指关系",
}

# ═══ 行业事件体系 ═══
industry_events = {
    "金融": [
        "企业融资", "企业上市", "股权变更", 
        "企业收购", "高管变动", "财报发布",
    ],
    "舆情": [
        "产品发布", "安全事故", "法律诉讼",
        "政策变化", "自然灾害", "社会事件",
    ],
    "医疗": [
        "药物审批", "临床试验", "不良反应",
        "疾病爆发", "医疗纠纷",
    ],
}

# ═══ LLM + 事件抽取 ═══
# GPT-4 在零样本事件抽取上已接近微调模型!
# 实践: 用 LLM 做 Schema 定义 + 少样本抽取
# 然后蒸馏到小模型用于生产`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎯 UIE: 统一信息抽取</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> uie</div>
              <pre className="fs-code">{`# UIE (Universal Information Extraction)
# 统一 NER/RE/EE 到一个框架

# ═══ 核心思想 ═══
# 将所有信息抽取任务统一为:
# 输入: 文本 + Schema (想抽什么)
# 输出: 结构化结果
# → 一个模型搞定所有 IE 任务!

# ═══ UIE 架构 (百度, 2022) ═══
# 基于 T5/ERNIE, Prompt-based:
# NER:  "找出所有人名" + 文本 → 生成 "马云"
# RE:   "马云的公司" + 文本 → 生成 "阿里巴巴"
# EE:   "离职事件的人物" + 文本 → 生成 "马云"

# ═══ PaddleNLP UIE 实战 ═══
from paddlenlp import Taskflow

# NER
schema = ["人名", "地名", "机构名"]
ie = Taskflow("information_extraction", schema=schema)
result = ie("马云在杭州创建了阿里巴巴")
# {"人名": ["马云"], "地名": ["杭州"], "机构名": ["阿里巴巴"]}

# 关系抽取
schema = {"人名": ["创建的公司", "工作城市"]}
ie.set_schema(schema)
result = ie("马云在杭州创建了阿里巴巴")
# {"人名": [{"马云": {"创建的公司": ["阿里巴巴"], "工作城市": ["杭州"]}}]}

# ═══ LLM-based IE ═══
# 用 GPT-4/Claude 做信息抽取:
llm_ie_prompt = """
请从以下文本中抽取结构化信息:

文本: "2024年3月15日，华为公司在深圳发布了 Mate 70 手机，
       售价4999元起。CEO 余承东表示这是华为最强旗舰。"

请抽取:
1. 实体: 公司、人名、产品、金额、日期、地点
2. 关系: (主体, 关系, 客体)
3. 事件: 事件类型 + 论元

输出 JSON 格式。
"""

# ═══ IE 技术选型 ═══
# ┌──────────────┬──────────────┬──────────────┐
# │ 场景          │ 推荐方案     │ 理由         │
# ├──────────────┼──────────────┼──────────────┤
# │ Schema 固定  │ BERT-CRF     │ 速度快,准确  │
# │ Schema 灵活  │ UIE          │ 零样本泛化   │
# │ 低频/探索    │ LLM + 抽取   │ 无需训练     │
# │ 嵌套实体     │ GlobalPointer│ 天然支持     │
# │ 大规模生产   │ BERT + 蒸馏  │ 性价比最优   │
# └──────────────┴──────────────┴──────────────┘`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
