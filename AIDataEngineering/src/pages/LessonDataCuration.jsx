import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['数据选择', '去重过滤', '混合比例', '课程学习'];

export default function LessonDataCuration() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge orange">🏗️ module_05 — 数据策展</div>
      <div className="fs-hero">
        <h1>数据策展：不是所有数据都值得训练</h1>
        <p>
          Llama 3 用 15T token 训练，但关键在于<strong>选了哪些 15T</strong>。
          数据策展 (Data Curation) 是决定模型好坏的隐形杠杆。
          本模块覆盖数据选择策略（质量过滤/领域平衡）、
          大规模去重（MinHash/SimHash/语义去重）、
          数据混合比例（代码:数学:文学 = ?）、
          以及课程学习（从简单到复杂的训练顺序）。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">📦 数据策展</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 数据选择策略</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> data_selection.py</div>
                <pre className="fs-code">{`# —— 数据选择: 从 100T 中选 15T 高质量数据 ——

class DataSelector:
    """多层过滤管线"""

    def quality_filter_pipeline(self, raw_data):
        """质量过滤管线 (参考 FineWeb)"""
        data = raw_data
        
        # 第 1 层: 基础清洗 (去 90% 垃圾)
        data = self.basic_clean(data)
        # ├── URL 黑名单过滤 (成人/垃圾站点)
        # ├── 语言检测 (fastText, 只留目标语言)
        # ├── 长度过滤 (< 50 字或 > 100K 字)
        # └── 编码修复 (UTF-8 标准化)
        
        # 第 2 层: 启发式规则 (去 50% 低质量)
        data = self.heuristic_filter(data)
        # ├── 重复行比例 > 30% → 删除
        # ├── 特殊字符比例 > 20% → 删除
        # ├── 停用词比例 < 5% → 删除 (非自然文本)
        # ├── "lorem ipsum" 等模板文本 → 删除
        # └── SEO 垃圾 (关键词堆砌) → 删除
        
        # 第 3 层: 模型打分 (选 Top 30%)
        data = self.model_score_filter(data)
        # ├── 困惑度过滤 (用小模型打分)
        # │   PPL 太低 → 太简单/重复
        # │   PPL 太高 → 乱码/噪声
        # │   PPL 适中 → 高质量自然文本
        # ├── 教育价值评分 (FineWeb-Edu)
        # │   用分类器判断: "这段文本有教育价值吗?"
        # └── 有害内容检测 (toxicity filter)
        
        # 第 4 层: 去重 (见去重模块)
        data = self.dedup(data)
        
        return data  # 100T → 15T

    过滤效果示例:
    ┌──────────┬────────┬──────────┐
    │ 阶段      │ 数据量  │ 保留率   │
    ├──────────┼────────┼──────────┤
    │ 原始爬取  │ 200 TB │ 100%     │
    │ 基础清洗  │ 40 TB  │ 20%      │
    │ 启发式    │ 20 TB  │ 10%      │
    │ 模型打分  │ 8 TB   │ 4%       │
    │ 去重      │ 5 TB   │ 2.5%     │
    │ 最终数据  │ 5 TB   │ 2.5%     │
    └──────────┴────────┴──────────┘`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🔍 大规模去重</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> dedup.py</div>
                <pre className="fs-code">{`# 大规模去重: 从万亿 token 中去除重复

class DataDeduplicator:
    
    # 方法 1: 精确去重 (Exact Dedup)
    def exact_dedup(self, documents):
        """基于 Hash 的精确去重"""
        seen = set()
        unique = []
        for doc in documents:
            h = hashlib.sha256(doc.encode()).hexdigest()
            if h not in seen:
                seen.add(h)
                unique.append(doc)
        return unique
    
    # 方法 2: MinHash 近似去重 (最常用)
    def minhash_dedup(self, documents, threshold=0.8):
        """MinHash + LSH 近似去重"""
        from datasketch import MinHash, MinHashLSH
        
        lsh = MinHashLSH(threshold=threshold, num_perm=128)
        unique = []
        
        for i, doc in enumerate(documents):
            m = MinHash(num_perm=128)
            # n-gram 分词
            for ngram in self.get_ngrams(doc, n=5):
                m.update(ngram.encode())
            
            # 查询是否有近似重复
            if not lsh.query(m):
                lsh.insert(f"doc_{i}", m)
                unique.append(doc)
        
        return unique
    
    # 方法 3: 语义去重 (最精确,最贵)
    def semantic_dedup(self, documents, threshold=0.95):
        """基于 Embedding 的语义去重"""
        embeddings = self.encoder.encode(documents)
        # 用 FAISS 查找语义相似对
        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(embeddings)
        
        # 聚类去重: 每个语义簇保留最好的
        clusters = self.cluster(embeddings)
        return [self.best_in_cluster(c) for c in clusters]

# 去重效果:
# Common Crawl: 去重后减少 30-50%
# 训练效果: 去重后模型提升 2-5%`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>⚡ 工业级去重工具</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> tools</div>
                <pre className="fs-code">{`工业级去重工具对比:

┌──────────────┬──────┬──────┬──────┐
│              │性能   │精度  │场景  │
├──────────────┼──────┼──────┼──────┤
│ text-dedup   │ ⭐⭐⭐  │ ⭐⭐⭐ │ 通用 │
│ (HF 开源)    │      │     │      │
├──────────────┼──────┼──────┼──────┤
│ datasketch   │ ⭐⭐⭐⭐│ ⭐⭐⭐ │MinHash│
│              │      │     │      │
├──────────────┼──────┼──────┼──────┤
│ SimHash      │ ⭐⭐⭐⭐⭐│ ⭐⭐ │ 超大 │
│              │      │     │ 规模 │
├──────────────┼──────┼──────┼──────┤
│ Suffix Array │ ⭐⭐  │ ⭐⭐⭐⭐│ 子串 │
│              │      │     │ 去重 │
└──────────────┴──────┴──────┴──────┘

去重层次:
├── 文档级: 整篇文档重复
├── 段落级: 段落在多文档出现
├── 句子级: 重复句子
└── n-gram级: 重复短语

多级去重管线:
1. URL 去重 (精确, 最快)
2. 文档 Hash 去重 (精确)
3. MinHash 去重 (近似, threshold=0.8)
4. 段落级去重 (更精细)
5. 训练时在线去重 (DeepMind方法)

⚠️ 过度去重的风险:
├── 删除合理重复 (通用短语)
├── 减少数据多样性
└── 影响常见模式的学习`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚖️ 数据混合比例 (Data Mix)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> data_mix</div>
                <pre className="fs-code">{`# —— 数据混合比例: 决定模型能力分布 ——

# Llama 3 数据混合 (参考):
llama3_mix = {
    "通用网页":     0.50,  # 50% - 通用知识
    "代码":         0.17,  # 17% - 编程能力
    "数学":         0.10,  # 10% - 推理能力
    "学术论文":     0.08,  # 8%  - 科学知识
    "书籍":         0.05,  # 5%  - 长文理解
    "百科":         0.04,  # 4%  - 结构化知识
    "对话/指令":    0.03,  # 3%  - 对话能力
    "多语言":       0.03,  # 3%  - 多语言
}
# 总计: 15T tokens

# 混合比例对能力的影响:
# ┌────────────┬────────┬────────┬────────┐
# │ 数学比例    │ 5%     │ 10%    │ 20%    │
# ├────────────┼────────┼────────┼────────┤
# │ GSM8K 分数  │ 45%    │ 65%    │ 75%    │
# │ 通用理解    │ 82%    │ 80%    │ 72%    │
# └────────────┴────────┴────────┴────────┘
# → 数学↑ 但通用能力↓ (此消彼长)

数据混合优化方法:
├── 1. 网格搜索 (Grid Search)
│     小模型实验 → 放大到大模型
│     代价: 高 (需要多次训练)
├── 2. DoReMi (Google, 2024)
│     小 proxy 模型自动学习最优比例
│     技巧: 看哪个领域loss降得慢 → 加权
├── 3. 领域对齐 (Task-Aware)
│     根据下游任务反向调整比例
│     例: 数学助手 → 提高数学比例到30%
└── 4. 动态混合 (Annealing)
      训练前期: 通用数据为主
      训练后期: 高质量/专业数据为主`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>📚 课程学习 (Curriculum)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> curriculum.py</div>
                <pre className="fs-code">{`# 课程学习: 训练顺序也很重要

class CurriculumLearning:
    """从简单到复杂的训练顺序"""
    
    def difficulty_scoring(self, dataset):
        """给数据打难度分"""
        for sample in dataset:
            score = 0
            
            # 长度 (越长越难)
            score += len(sample["text"]) / 10000
            
            # 困惑度 (小模型困惑度越高=越难)
            score += self.proxy_model.perplexity(sample)
            
            # 标签噪声 (越不确定=越难)
            score += self.label_uncertainty(sample)
            
            sample["difficulty"] = score
        
        return sorted(dataset, key=lambda x: x["difficulty"])
    
    def train_with_curriculum(self, model, dataset):
        """渐进式训练"""
        sorted_data = self.difficulty_scoring(dataset)
        
        # Phase 1: 简单数据 (前 30%)
        # 让模型学到基本模式
        train(model, sorted_data[:int(0.3*len(sorted_data))], lr=1e-4)
        
        # Phase 2: 中等数据 (中间 40%)
        train(model, sorted_data[int(0.3*len(sorted_data)):int(0.7*len(sorted_data))], lr=5e-5)
        
        # Phase 3: 困难数据 (最后 30%)
        # 挑战模型,提升上限
        train(model, sorted_data[int(0.7*len(sorted_data)):], lr=1e-5)

# 效果: 提升 2-5%, 训练更稳定
# 直觉: 先学字母,再学单词,再学句子`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🎛️ 训练阶段策展</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> staged</div>
                <pre className="fs-code">{`训练阶段对应不同策展策略:

1️⃣ 预训练 (Pre-training)
├── 目标: 学习语言和世界知识
├── 规模: 万亿 token
├── 策展: 
│   ├── 广覆盖, 高多样性
│   ├── 质量过滤 (PPL, 教育分)
│   └── 多领域均衡混合

2️⃣ 持续预训练 (Cont. Pre-train)
├── 目标: 增强特定领域能力
├── 规模: 数十亿 token
├── 策展:
│   ├── 领域数据 50-80%
│   ├── 通用数据 20-50% (防遗忘)
│   └── 高质量精选

3️⃣ 指令微调 (SFT)
├── 目标: 学习遵从指令
├── 规模: 数万-数十万条
├── 策展:
│   ├── 质量 > 数量 (LIMA论文)
│   ├── 多样性 (覆盖各类任务)
│   └── 人工验证每一条

4️⃣ 对齐 (RLHF/DPO)
├── 目标: 安全+有帮助
├── 规模: 数千-数万对
├── 策展:
│   ├── 高质量偏好对
│   ├── 边界case覆盖
│   └── 多轮复杂对话

关键洞察 📌:
越往后阶段,数据量越少,但
质量要求指数级上升!`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
