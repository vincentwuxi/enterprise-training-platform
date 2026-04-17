import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['标注流程', '标注工具', '质量控制', '众包管理'];

export default function LessonDataLabeling() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🏗️ module_02 — 数据标注工程</div>
      <div className="fs-hero">
        <h1>数据标注工程：从手工作坊到工业级管线</h1>
        <p>
          标注是 AI 模型的"老师"——标注质量直接决定模型上限。
          本模块覆盖标注流程设计（指南编写/试标/迭代）、
          主流标注工具（Label Studio/Prodigy/CVAT）、
          质量控制体系（IAA/Golden Set/自动审核）、
          以及众包标注管理（Scale AI/Amazon MTurk/成本控制）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🏷️ 标注工程</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 标注流程设计</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> labeling_workflow</div>
                <pre className="fs-code">{`工业级标注流程 (7 步法):

1️⃣ 任务定义 & 标注指南
├── 明确标注目标 (分类/序列标注/生成评价)
├── 编写标注指南 (Guidelines)
│   ├── 正面示例 10+ 个
│   ├── 负面示例 10+ 个
│   ├── 边界案例 20+ 个
│   └── 决策树 (if-else 判断逻辑)
└── 标注指南版本控制 (v1.0 → v1.1 → ...)

2️⃣ 试标 (Pilot Annotation)
├── 选 50-100 条样本
├── 3-5 名标注者独立标注
├── 计算标注者一致性 (IAA)
│   ├── Cohen's Kappa > 0.8 = 优秀
│   ├── 0.6-0.8 = 良好 (可接受)
│   └── < 0.6 = 需要修改指南
└── 根据分歧修改标注指南

3️⃣ 标注者培训
├── 标注指南讲解 (1-2小时)
├── 实操练习 (Golden Set 50条)
├── 考试合格才能开始 (准确率 > 90%)
└── 定期复训 (每月)

4️⃣ 正式标注 + 实时监控
├── 每天抽查 5-10% 样本
├── IAA 持续监控 (≥ 0.75)
├── 标注速度监控 (过快=敷衍)
└── 自动异常检测

5️⃣ 交叉验证 & 仲裁
├── 关键样本: 3人标注取多数
├── 分歧样本: 专家仲裁
├── Adjudication 会议 (每周)
└── 更新标注指南

6️⃣ 质量验收
├── Golden Set 测试 (准确率 > 95%)
├── 随机抽样审核 (错误率 < 3%)
└── 最终一致性检查

7️⃣ 数据交付 & 归档
├── 标准化输出格式 (JSONL/CoNLL)
├── 标注元数据保存
├── 标注指南归档
└── 数据版本标记`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔧 标注工具对比</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> tools</div>
                <pre className="fs-code">{`标注工具选型:

┌────────────┬──────┬──────┬──────┐
│            │Label │Prodi │ CVAT │
│            │Studio│gy    │      │
├────────────┼──────┼──────┼──────┤
│ 开源        │ ✅    │ ❌    │ ✅    │
│ NLP 标注    │ ⭐⭐⭐⭐│ ⭐⭐⭐⭐⭐│ ⭐⭐   │
│ CV 标注     │ ⭐⭐⭐ │ ⭐⭐   │ ⭐⭐⭐⭐⭐│
│ LLM 评估    │ ⭐⭐⭐⭐│ ⭐⭐⭐  │ ❌    │
│ ML 辅助     │ ✅    │ ✅    │ ✅    │
│ API 集成    │ ✅    │ ✅    │ ✅    │
│ 多人协作    │ ✅    │ ❌    │ ✅    │
│ 部署方式    │ Docker│ 本地 │Docker│
│ 价格        │ 免费  │ $400 │ 免费  │
└────────────┴──────┴──────┴──────┘

LLM 时代新工具:
├── Argilla: HuggingFace 推荐
│   专注 LLM 反馈标注 (RLHF)
├── Lilac: 数据探索+标注
│   语义搜索 + 聚类分析
├── Superintendent: LLM 辅助
│   AI 预标注 + 人工审核
└── Scale AI: 商业级
    托管式标注服务 (贵但快)

推荐:
• NLP/LLM 项目: Label Studio
• 计算机视觉: CVAT
• RLHF 对齐: Argilla
• 企业级需求: Scale AI`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🤖 LLM 辅助标注</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> llm_assisted.py</div>
                <pre className="fs-code">{`# LLM 辅助标注: 效率 ↑ 3-5 倍

class LLMAssistedLabeler:
    """LLM 预标注 + 人工审核"""
    
    async def pre_label(self, samples, task_desc):
        """LLM 生成预标注"""
        results = []
        for sample in samples:
            response = await self.llm.generate(f"""
任务: {task_desc}

文本: "{sample['text']}"

请返回:
- label: 标签
- confidence: 置信度 (0-1)
- reasoning: 判断依据
""")
            results.append({
                "sample": sample,
                "pre_label": response["label"],
                "confidence": response["confidence"],
                "needs_review": response["confidence"] < 0.8
            })
        return results
    
    def route_to_human(self, pre_labeled):
        """智能路由: 低置信度 → 人工"""
        auto_accept = []  # 高置信度直接用
        human_review = [] # 低置信度人工审核
        
        for item in pre_labeled:
            if item["confidence"] > 0.95:
                auto_accept.append(item)
            else:
                human_review.append(item)
        
        # 通常: 60-70% 自动通过
        # 剩余 30-40% 人工审核
        return auto_accept, human_review

# 效果: 
# 传统人工: 100条/人/小时
# LLM辅助: 300-500条/人/小时
# 成本: ↓ 60-70%`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>✅ 标注质量控制体系</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> quality_control.py</div>
                <pre className="fs-code">{`# —— 标注质量控制: 工业级实践 ——

class AnnotationQC:
    """标注质量控制三道防线"""
    
    # === 第一道防线: 事前预防 ===
    def pre_annotation_check(self, annotator):
        """标注者资格认证"""
        # 1. Golden Set 考试 (准确率 > 90%)
        score = self.golden_test(annotator, n=50)
        if score < 0.90:
            return {"status": "failed", "score": score}
        
        # 2. 标注指南测试
        guideline_score = self.guideline_quiz(annotator)
        return {"status": "passed", "score": score}
    
    # === 第二道防线: 事中监控 ===
    def real_time_monitoring(self, annotations_batch):
        """实时质量监控"""
        metrics = {}
        
        # 1. Golden Set 混入 (每批 5% 是已知答案)
        golden_accuracy = self.check_golden_samples(annotations_batch)
        metrics["golden_accuracy"] = golden_accuracy
        # 低于 85% → 暂停标注者, 重新培训
        
        # 2. 标注者间一致性 (IAA)
        kappa = self.compute_cohens_kappa(annotations_batch)
        metrics["cohens_kappa"] = kappa
        # 低于 0.75 → 组织讨论会
        
        # 3. 标注速度异常检测
        speed = self.check_annotation_speed(annotations_batch)
        metrics["speed_anomaly"] = speed > self.speed_threshold
        # 过快 (< 5秒/条) → 敷衍标注
        # 过慢 (> 300秒/条) → 能力不足或题目太难
        
        # 4. 标签分布异常
        dist = self.check_label_distribution(annotations_batch)
        metrics["distribution_skew"] = dist
        # 某标注者 90% 标"正面" → 偏差
        
        return metrics
    
    # === 第三道防线: 事后审核 ===
    def post_annotation_audit(self, dataset):
        """交付前审核"""
        # 1. 随机抽样审核 (10% 样本, 专家审)
        audit_sample = random.sample(dataset, int(len(dataset) * 0.1))
        error_rate = self.expert_review(audit_sample)
        
        # 2. 跨批次一致性
        cross_batch_kappa = self.cross_batch_consistency(dataset)
        
        # 3. 自动矛盾检测
        contradictions = self.find_contradictions(dataset)
        # 相似文本被标为不同标签 → 矛盾
        
        return {
            "error_rate": error_rate,        # 目标 < 3%
            "consistency": cross_batch_kappa, # 目标 > 0.80
            "contradictions": len(contradictions)
        }`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>👥 众包标注管理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> crowdsourcing</div>
                <pre className="fs-code">{`众包标注平台对比:

┌────────────┬────────┬────────┬────────┐
│            │Scale AI│MTurk   │Surge AI│
├────────────┼────────┼────────┼────────┤
│ 质量       │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐   │ ⭐⭐⭐⭐ │
│ 速度       │ ⭐⭐⭐⭐ │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐  │
│ 价格       │ $$$   │ $     │ $$    │
│ NLP 支持   │ ✅     │ ✅     │ ✅     │
│ CV 支持    │ ✅     │ ✅     │ ❌     │
│ RLHF 支持  │ ✅     │ ❌     │ ✅     │
│ 中文支持   │ ✅     │ ⚠️    │ ❌     │
│ API        │ ✅     │ ✅     │ ✅     │
└────────────┴────────┴────────┴────────┘

成本控制策略:
├── LLM 预标注 → 人工审核 (↓60%)
├── 困难样本才发众包 (↓40%)
├── 分级标注者 (简单给新手)
├── 批量折扣谈判
└── 自建标注团队 (>10万条时)

众包管理最佳实践:
├── 明确的标注指南 + 示例
├── Golden Set 持续质控
├── 多人标注 (关键任务 ≥3人)
├── 快速反馈循环 (日结日清)
└── 标注者激励 (质量奖金)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>💰 标注成本估算</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> cost</div>
                <pre className="fs-code">{`标注成本参考 (2025):

按任务类型:
┌──────────────┬──────────┬────────┐
│ 任务类型      │ 每条价格  │ 速度   │
├──────────────┼──────────┼────────┤
│ 文本分类      │ $0.02-05 │ 200/hr │
│ NER 实体标注  │ $0.05-15 │ 80/hr  │
│ 阅读理解QA    │ $0.10-30 │ 40/hr  │
│ 对话质量评估  │ $0.15-50 │ 30/hr  │
│ RLHF 偏好     │ $0.20-80 │ 20/hr  │
│ 图像分类      │ $0.01-05 │ 300/hr │
│ 目标检测bbox  │ $0.10-30 │ 60/hr  │
│ 语义分割      │ $1.0-5.0 │ 5/hr   │
│ 3D点云标注    │ $2.0-10  │ 3/hr   │
└──────────────┴──────────┴────────┘

预算公式:
总成本 = 样本数 × 每条价格 × 标注次数
       + 质控成本 (约10-15%)
       + 管理成本 (约5-10%)

例: 10万条 RLHF 标注
= 100K × $0.30 × 3人
= $90,000 + QC $13,500
= ~$103,500

LLM辅助后:
= 30K人工 × $0.30 × 2人 + LLM费
= $18,000 + $3,000 (LLM)
= ~$21,000 (节省 80%!)`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
